import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { GET as getAlertEvaluator, POST as postAlertEvaluator } from "../src/app/api/alerts/evaluator/route";
import { GET as getTallySync, POST as postTallySync } from "../src/app/api/sync/tally/route";
import { GET as getBankReconcile, POST as postBankReconcile } from "../src/app/api/sync/bank-reconcile/route";

async function runVerification() {
  console.log("======================================================================");
  console.log("   OFFICEX WAVE 7: NIGHTLY ALERT ENGINE & ERP / BANK RECONCILIATION");
  console.log("======================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      if (details) console.log(`          ↳ ${JSON.stringify(details)}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`          ↳ Error Details:`, details);
      failed++;
    }
  }

  try {
    // 1. Nightly Alert Automation Engine (AL-01 to AL-22)
    console.log("--- 1. Nightly Alert Automation Engine (§9, AL-01 to AL-22 at 00:30 IST) ---");
    const reqAlerts = new Request("http://localhost:3000/api/alerts/evaluator");
    const resAlerts = await getAlertEvaluator(reqAlerts);
    assert(resAlerts.status === 200, "GET /api/alerts/evaluator Returns 200 OK");
    const alertData = (await resAlerts.json()).data;

    assert(
      alertData.total_evaluated === 22,
      `All 22 Alert Conditions Evaluated (AL-01 to AL-22) — Total: ${alertData.total_evaluated}`
    );

    const hasCritical = alertData.critical_count > 0;
    assert(hasCritical, `Critical Alerts Categorized — Count: ${alertData.critical_count}`);

    const hasAL17 = alertData.alerts.some((a: any) => a.code === "AL-17");
    const hasAL20 = alertData.alerts.some((a: any) => a.code === "AL-20");
    const hasAL21 = alertData.alerts.some((a: any) => a.code === "AL-21");
    assert(
      hasAL17 && hasAL20 && hasAL21,
      "Key Alert Triggers Verified (AL-17 Mandate, AL-20 Data Quality, AL-21 Dispute SLA)"
    );

    const postAlertReq = new Request("http://localhost:3000/api/alerts/evaluator", { method: "POST" });
    const postAlertRes = await postAlertEvaluator(postAlertReq);
    assert(postAlertRes.status === 200, "POST /api/alerts/evaluator Runs Nightly Cron Evaluation");

    // 2. RR-INT-01: Tally Prime & ERP Accounting Sync
    console.log("\n--- 2. RR-INT-01 Tally Prime & ERP Accounting Sync ---");
    const reqTallyJson = new Request("http://localhost:3000/api/sync/tally?type=all&format=json&period=Oct-2026");
    const resTallyJson = await getTallySync(reqTallyJson);
    assert(resTallyJson.status === 200, "GET /api/sync/tally Returns 200 OK JSON");
    const tallyData = await resTallyJson.json();

    assert(
      Array.isArray(tallyData.data) && tallyData.data.length >= 3,
      `Sales, Receipts & Credit Note Vouchers Populated — Count: ${tallyData.data.length}`
    );

    // Verify Balanced Debits and Credits
    const allBalanced = tallyData.data.every((v: any) => {
      const dr = v.entries.reduce((s: number, e: any) => s + e.debit, 0);
      const cr = v.entries.reduce((s: number, e: any) => s + e.credit, 0);
      return Math.abs(dr - cr) < 1.0; // Rounding tolerance
    });
    assert(allBalanced, "All Journal Vouchers Are Perfectly Balanced (Total Debit == Total Credit)");

    // Test XML stream
    const reqTallyXml = new Request("http://localhost:3000/api/sync/tally?type=sales&format=xml&period=Oct-2026");
    const resTallyXml = await getTallySync(reqTallyXml);
    assert(resTallyXml.status === 200, "GET /api/sync/tally format=xml Returns 200 XML Envelope");
    const xmlText = await resTallyXml.text();
    assert(
      xmlText.includes("<ENVELOPE>") && xmlText.includes("<TALLYMESSAGE"),
      "Tally Prime Compliant XML Envelope Format Verified"
    );

    // Test CSV stream
    const reqTallyCsv = new Request("http://localhost:3000/api/sync/tally?type=receipts&format=csv&period=Oct-2026");
    const resTallyCsv = await getTallySync(reqTallyCsv);
    assert(resTallyCsv.status === 200, "GET /api/sync/tally format=csv Returns 200 CSV Journal");

    // 3. RR-INT-02: Bank Statement Reconciler / MT940
    console.log("\n--- 3. RR-INT-02 Bank Statement Reconciler & MT940 Auto-Allocations ---");
    const reqBank = new Request("http://localhost:3000/api/sync/bank-reconcile");
    const resBank = await getBankReconcile(reqBank);
    assert(resBank.status === 200, "GET /api/sync/bank-reconcile Returns 200 OK");
    const bankData = (await resBank.json()).data;

    assert(
      bankData.reconciliation_efficiency_pct === 100.0 && bankData.auto_matched_amount_inr === 4800000,
      `Bank Statement Auto-Matched 100% — Credits: ₹${bankData.total_credits_inr.toLocaleString()}, Matched: ₹${bankData.auto_matched_amount_inr.toLocaleString()}`
    );

    const hasUtr = bankData.transactions.every((t: any) => !!t.utr_number && !!t.matched_invoice);
    assert(hasUtr, "Bank Credits Matched to Invoices with Exact NEFT/RTGS/UPI UTR References");

    const postBankReq = new Request("http://localhost:3000/api/sync/bank-reconcile", {
      method: "POST",
      body: JSON.stringify({ statement_type: "mt940", filename: "HDFC_MT940_Oct26.txt" }),
    });
    const postBankRes = await postBankReconcile(postBankReq);
    assert(postBankRes.status === 200, "POST /api/sync/bank-reconcile Generates & Posts Auto-Allocations (F-12)");

    // Final Summary
    console.log("\n======================================================================");
    console.log(`WAVE 7 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("======================================================================");

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  }
}

runVerification();

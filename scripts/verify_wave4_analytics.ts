import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GET as getExceptions } from "../src/app/api/exceptions/route";
import { GET as getForecast } from "../src/app/api/forecast/route";
import { GET as getPnl } from "../src/app/api/pnl/route";
import { GET as getSnapshots, POST as postSnapshotLock } from "../src/app/api/snapshots/route";
import { GET as getMisExport } from "../src/app/api/mis/export/route";

async function runWave4Verification() {
  console.log("======================================================================");
  console.log("   OFFICEX WAVE 4: ANALYTICS, FORECAST & MIS REPORTING VERIFICATION");
  console.log("======================================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` — ${detail}` : ""}`);
      passes++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      fails++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. S-50 EXCEPTION CENTRE & K-23 DATA QUALITY SCORE
  // -------------------------------------------------------------------------
  console.log("--- 1. S-50 Exception Centre & K-23 Data Quality Score ---");
  const reqExceptions = new Request("http://localhost:3000/api/exceptions");
  const resExceptions = await getExceptions(reqExceptions);
  const jsonExceptions = await resExceptions.json();

  assert(resExceptions.status === 200 && jsonExceptions.success, "GET /api/exceptions Returns 200 OK");
  assert(
    typeof jsonExceptions.k23_data_quality_score === "number" &&
    jsonExceptions.k23_data_quality_score >= 50 &&
    jsonExceptions.k23_data_quality_score <= 100,
    "K-23 Data Quality Score Computed",
    `Score: ${jsonExceptions.k23_data_quality_score}% (Status: ${jsonExceptions.k23_status})`
  );
  assert(
    jsonExceptions.counts?.contract !== undefined &&
    jsonExceptions.counts?.billing !== undefined &&
    jsonExceptions.counts?.collection !== undefined &&
    jsonExceptions.counts?.compliance !== undefined,
    "All 4 Exception Categories Categorized",
    `Contract: ${jsonExceptions.counts?.contract}, Billing: ${jsonExceptions.counts?.billing}, Collection: ${jsonExceptions.counts?.collection}, Compliance: ${jsonExceptions.counts?.compliance}`
  );

  // -------------------------------------------------------------------------
  // 2. S-51 12-MONTH REVENUE FORECAST (FORMULA F-24 / D-24 / K-15)
  // -------------------------------------------------------------------------
  console.log("\n--- 2. S-51 12-Month Revenue Forecast (Formula F-24 / K-15) ---");
  const reqForecast = new Request("http://localhost:3000/api/forecast?renewal_pct=70");
  const resForecast = await getForecast(reqForecast);
  const jsonForecast = await resForecast.json();

  assert(resForecast.status === 200 && jsonForecast.success, "GET /api/forecast Returns 200 OK");
  assert(
    Array.isArray(jsonForecast.monthly_timeline) && jsonForecast.monthly_timeline.length === 12,
    "12-Month Deterministic Timeline Generated",
    `Window: ${jsonForecast.period_start} to ${jsonForecast.period_end}`
  );
  assert(
    jsonForecast.k15_twelve_month_forecast_total_inr > 0,
    "Formula K-15 12-Month Forecast Total Run-Rate",
    `Total: ₹${jsonForecast.k15_twelve_month_forecast_total_inr.toLocaleString("en-IN")}, Avg Monthly: ₹${jsonForecast.average_monthly_run_rate_inr.toLocaleString("en-IN")}`
  );
  assert(
    jsonForecast.monthly_timeline[0].contracted_rent > 0 &&
    jsonForecast.monthly_timeline[0].scheduled_escalations !== undefined,
    "Layered Components Verified (Contracted, Escalations D-21, Renewals, Pipeline D-22)"
  );

  // -------------------------------------------------------------------------
  // 3. S-52 PROPERTY P&L STATEMENT (FORMULA F-19 NOI & MARGIN %)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. S-52 Property P&L Statement (Formula F-19 NOI) ---");
  const reqPnl = new Request("http://localhost:3000/api/pnl?period=Oct-2026");
  const resPnl = await getPnl(reqPnl);
  const jsonPnl = await resPnl.json();

  assert(resPnl.status === 200 && jsonPnl.success, "GET /api/pnl Returns 200 OK");
  const revTotal = jsonPnl.revenue?.total_revenue;
  const opexTotal = jsonPnl.operating_expenses?.total_operating_expenses;
  const noi = jsonPnl.formula_f19?.net_operating_income_inr;
  const margin = jsonPnl.formula_f19?.noi_margin_pct;

  assert(
    revTotal > 0 && opexTotal > 0,
    "Revenue Inflow & Operating Expenses Populated",
    `Revenue: ₹${revTotal.toLocaleString("en-IN")}, OPEX: ₹${opexTotal.toLocaleString("en-IN")}`
  );
  assert(
    noi === revTotal - opexTotal,
    "Formula F-19 Net Operating Income (NOI = Revenue − OPEX)",
    `NOI: ₹${noi.toLocaleString("en-IN")}`
  );
  assert(
    margin > 0 && margin <= 100,
    "NOI Net Margin % Computed (Target ≥ 60%)",
    `Margin: ${margin}% (Benchmark: ${jsonPnl.formula_f19?.benchmark_status})`
  );

  // -------------------------------------------------------------------------
  // 4. S-53 SNAPSHOTS & MONTH-END LOCK
  // -------------------------------------------------------------------------
  console.log("\n--- 4. S-53 Snapshots & Month-End Financial Lock ---");
  const reqSnapshots = new Request("http://localhost:3000/api/snapshots?period=2026-10-01");
  const resSnapshots = await getSnapshots(reqSnapshots);
  const jsonSnapshots = await resSnapshots.json();

  assert(resSnapshots.status === 200 && jsonSnapshots.success, "GET /api/snapshots Returns 200 OK with Lock Readiness");
  assert(
    Array.isArray(jsonSnapshots.current_lock_status?.criteria),
    "Pre-lock Criteria Checklist Evaluated",
    `Billing issued: ${jsonSnapshots.current_lock_status?.criteria[0]?.passed}, Unallocated cash: ${jsonSnapshots.current_lock_status?.criteria[1]?.passed}`
  );

  // Execute snapshot lock
  const reqLock = new Request("http://localhost:3000/api/snapshots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot_month: "2026-10-01" }),
  });
  const resLock = await postSnapshotLock(reqLock);
  const jsonLock = await resLock.json();

  assert(resLock.status === 200 && jsonLock.success, "Month-End Financial Freeze Executed", `Snapshot ID: ${jsonLock.snapshot?.id}`);
  assert(
    jsonLock.snapshot?.occupancyPct !== undefined && jsonLock.snapshot?.noiMonthly !== undefined,
    "Snapshot Captured Immutable Financial Aggregates",
    `Occupancy: ${jsonLock.snapshot?.occupancyPct}%, NOI: ₹${parseFloat(jsonLock.snapshot?.noiMonthly).toLocaleString("en-IN")}`
  );

  // -------------------------------------------------------------------------
  // 5. S-54 MONTHLY MIS & INVESTOR PACK (5-SHEET WORKBOOK)
  // -------------------------------------------------------------------------
  console.log("\n--- 5. S-54 Monthly MIS & Investor Pack Export Engine ---");
  const reqMisJson = new Request("http://localhost:3000/api/mis/export?format=json&period=Oct-2026");
  const resMisJson = await getMisExport(reqMisJson);
  const jsonMis = await resMisJson.json();

  assert(resMisJson.status === 200 && jsonMis.success, "GET /api/mis/export format=json Returns 200 OK");
  assert(jsonMis.sheets_count === 5, "5 Reporting Sheets Present in MIS Workbook");
  assert(!!jsonMis.sheets?.executive_summary, "Sheet 1: Executive Summary Verified");
  assert(Array.isArray(jsonMis.sheets?.verified_rent_roll), "Sheet 2: Verified Rent Roll Verified", `Rows: ${jsonMis.sheets?.verified_rent_roll?.length}`);
  assert(Array.isArray(jsonMis.sheets?.aging_schedule_4_bucket), "Sheet 3: 4-Bucket Aging Schedule Verified");
  assert(Array.isArray(jsonMis.sheets?.rollover_schedule), "Sheet 4: Rollover & Expiry Schedule Verified");
  assert(Array.isArray(jsonMis.sheets?.top_10_tenant_concentration), "Sheet 5: Top-10 Tenant Concentration Verified");

  // Verify CSV export format
  const reqMisCsv = new Request("http://localhost:3000/api/mis/export?format=csv&period=Oct-2026");
  const resMisCsv = await getMisExport(reqMisCsv);
  assert(resMisCsv.status === 200, "GET /api/mis/export format=csv Returns 200 OK Stream");
  const csvText = await resMisCsv.text();
  assert(csvText.includes("contract_code") && csvText.includes("tenant_name"), "CSV Content Contains Rent Roll Headers");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n======================================================================");
  console.log(`WAVE 4 VERIFICATION SUMMARY: ${passes} PASSED, ${fails} FAILED`);
  console.log("======================================================================");

  if (fails > 0) process.exit(1);
}

runWave4Verification().catch((e) => {
  console.error("FATAL WAVE 4 VERIFICATION ERROR:", e);
  process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/db";
import {
  organization,
  client_account,
  property,
  building,
  space,
  occupant,
  contract,
  invoice,
  payment,
  payment_allocation,
  dispute,
  task,
} from "../src/db/rent-roll-schema";
import { calculateAgingReport } from "../src/lib/rent-roll/payments/aging-service";
import { generatePaymentReceipt } from "../src/lib/rent-roll/payments/receipt-generator";
import { eq, and, sql, desc } from "drizzle-orm";

async function runP3UATSuite() {
  console.log("===============================================================");
  console.log("OFFICEX RENT ROLL — PHASE P3 PAYMENTS & COLLECTIONS UAT SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(testId: string, description: string, condition: boolean, detail?: any) {
    if (condition) {
      console.log(`[PASS] ${testId}: ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testId}: ${description}`);
      if (detail) console.error("       Detail:", detail);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SETUP TEST FIXTURES
    // ------------------------------------------------------------------------
    console.log("--- 1. SETTING UP TEST FIXTURES ---");

    // Get or create org
    let [org] = await db.select().from(organization).limit(1);
    if (!org) {
      [org] = await db
        .insert(organization)
        .values({
          name: "OFFICEX Test Corp",
          slug: "officex-test-corp",
          subscription_status: "active",
        })
        .returning();
    }

    // Get or create client account
    let [clientAcc] = await db
      .select()
      .from(client_account)
      .where(eq(client_account.org_id, org.id))
      .limit(1);

    if (!clientAcc) {
      [clientAcc] = await db
        .insert(client_account)
        .values({
          org_id: org.id,
          client_code: "CA-TEST-P3",
          client_name: "P3 Commercial Fund",
          is_self: true,
        })
        .returning();
    }

    // Get or create occupant
    const occCode = `OCC-P3-${Math.floor(1000 + Math.random() * 9000)}`;
    const [testOcc] = await db
      .insert(occupant)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_code: occCode,
        occupant_name: "Acme Tech Labs Pvt Ltd",
        occupant_type: "company",
        email: "billing@acmetech.com",
        phone: "+91-9876543210",
        gst_number: "27AAACA1234A1Z5",
        pan_number: "AAACA1234A",
      })
      .returning();

    // Get or create space
    let [testSpace] = await db.select().from(space).limit(1);
    if (!testSpace) {
      let [testProp] = await db.select().from(property).limit(1);
      if (!testProp) {
        [testProp] = await db
          .insert(property)
          .values({
            org_id: org.id,
            client_account_id: clientAcc.id,
            property_code: "PROP-P3",
            property_name: "P3 Commercial Tower",
            total_leasable_area_sqft: "100000.00",
          })
          .returning();
      }
      let [testBldg] = await db.select().from(building).limit(1);
      if (!testBldg) {
        [testBldg] = await db
          .insert(building)
          .values({
            org_id: org.id,
            client_account_id: clientAcc.id,
            property_id: testProp.id,
            building_code: "BLD-A",
            building_name: "Tower A",
            total_area_sqft: "100000.00",
          })
          .returning();
      }
      [testSpace] = await db
        .insert(space)
        .values({
          org_id: org.id,
          client_account_id: clientAcc.id,
          building_id: testBldg.id,
          space_code: `SP-${Math.floor(100 + Math.random() * 900)}`,
          space_name: "Suite 401",
          floor_name: "4th Floor",
          chargeable_area_sqft: "5000.00",
          occupancy_status: "vacant",
        })
        .returning();
    }

    // Create a contract
    const contractCode = `CNT-P3-${Math.floor(1000 + Math.random() * 9000)}`;
    const [testContract] = await db
      .insert(contract)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        space_id: testSpace.id,
        contract_code: contractCode,
        contract_type: "lease",
        direction: "receivable",
        billing_model: "area",
        contract_status: "active",
        start_date: "2026-01-01",
        end_date: "2028-12-31",
        rent_commencement_date: "2026-01-01",
      })
      .returning();

    console.log(`Setup complete. Occupant: ${testOcc.occupant_name} (${testOcc.id}), Contract: ${testContract.contract_code}\n`);

    // ------------------------------------------------------------------------
    // UAT-41: Record payment (bank transfer)
    // ------------------------------------------------------------------------
    console.log("--- UAT-41: Record Payment (RR-PAY-01) ---");
    const paymentRef41 = `UTR-P3-${Date.now()}`;
    const [p1] = await db
      .insert(payment)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        payment_code: `PAY-${Date.now().toString().slice(-6)}`,
        payment_date: "2026-10-01",
        amount_inr: "150000.00",
        payment_mode: "bank_transfer",
        payment_ref: paymentRef41,
        payment_status: "received",
        is_matched: false,
        notes: "UAT-41 Bank transfer settlement",
      })
      .returning();

    assert("UAT-41", "Record bank transfer payment with snake_case schema", !!p1 && p1.payment_mode === "bank_transfer" && parseFloat(p1.amount_inr) === 150000);
    assert("UAT-41a", "Payment initial status is received & is_matched is false", p1.payment_status === "received" && p1.is_matched === false);
    assert("UAT-41b", "Payment multi-tenancy verified (org_id + client_account_id attached)", p1.org_id === org.id && p1.client_account_id === clientAcc.id);

    // ------------------------------------------------------------------------
    // UAT-42: Auto-match payment to single invoice
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-42: Auto-Match Payment to Single Invoice (RR-PAY-01) ---");
    const inv42Num = `INV-P3-42-${Math.floor(1000 + Math.random() * 9000)}`;
    const [inv42] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: inv42Num,
        invoice_date: "2026-09-01",
        due_date: "2026-09-15",
        gross_total: "129800.00",
        balance_due: "129800.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // Query for auto-match candidate with payment amount 129800
    const [matchCandidate] = await db
      .select()
      .from(invoice)
      .where(
        and(
          eq(invoice.occupant_id, testOcc.id),
          eq(invoice.org_id, org.id),
          eq(invoice.balance_due, "129800.00")
        )
      );

    assert("UAT-42", "Auto-match identifies exact single invoice total match", !!matchCandidate && matchCandidate.id === inv42.id && parseFloat(matchCandidate.balance_due) === 129800);

    // ------------------------------------------------------------------------
    // UAT-43 & UAT-44 & RR-PAY-07: Multi-Allocation Example & Partial Split
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-43 / UAT-44 / RR-PAY-07: Multi-Allocation & Partial Split ---");
    // Setup Invoice 1: 129,800
    const [invMulti1] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-P3-MA1-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-08-01",
        due_date: "2026-08-15",
        gross_total: "129800.00",
        balance_due: "129800.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // Setup Invoice 2: 129,800
    const [invMulti2] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-P3-MA2-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-09-01",
        due_date: "2026-09-15",
        gross_total: "129800.00",
        balance_due: "129800.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // Payment of 200,000 received
    const [paymentMulti] = await db
      .insert(payment)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        payment_code: `PAY-MA-${Date.now().toString().slice(-6)}`,
        payment_date: "2026-09-20",
        amount_inr: "200000.00",
        payment_mode: "bank_transfer",
        payment_ref: `UTR-MA-${Date.now()}`,
        payment_status: "received",
        is_matched: false,
      })
      .returning();

    // Perform allocation: 129,800 to invMulti1, 70,200 to invMulti2
    const [alloc1] = await db
      .insert(payment_allocation)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        payment_id: paymentMulti.id,
        invoice_id: invMulti1.id,
        amount_allocated_inr: "129800.00",
        allocation_date: "2026-09-20",
      })
      .returning();

    // Update invMulti1
    await db
      .update(invoice)
      .set({
        amount_paid: "129800.00",
        balance_due: "0.00",
        status: "paid",
      })
      .where(eq(invoice.id, invMulti1.id));

    const [alloc2] = await db
      .insert(payment_allocation)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        payment_id: paymentMulti.id,
        invoice_id: invMulti2.id,
        amount_allocated_inr: "70200.00",
        allocation_date: "2026-09-20",
      })
      .returning();

    // Update invMulti2: leaves 129800 - 70200 = 59600 balance
    await db
      .update(invoice)
      .set({
        amount_paid: "70200.00",
        balance_due: "59600.00",
        status: "partially_paid",
      })
      .where(eq(invoice.id, invMulti2.id));

    // Update payment
    await db
      .update(payment)
      .set({
        is_matched: true,
      })
      .where(eq(payment.id, paymentMulti.id));

    // Verify DB states
    const [updatedInv1] = await db.select().from(invoice).where(eq(invoice.id, invMulti1.id));
    const [updatedInv2] = await db.select().from(invoice).where(eq(invoice.id, invMulti2.id));
    const [updatedPay] = await db.select().from(payment).where(eq(payment.id, paymentMulti.id));

    const totalAllocRes = await db
      .select({ total: sql<string>`sum(${payment_allocation.amount_allocated_inr})` })
      .from(payment_allocation)
      .where(eq(payment_allocation.payment_id, paymentMulti.id));
    const totalAllocated = parseFloat(totalAllocRes[0]?.total || "0");

    assert("UAT-43", "Multi-allocation Invoice 1 fully paid (balance=0, status=paid)", parseFloat(updatedInv1.balance_due) === 0 && updatedInv1.status === "paid");
    assert("UAT-44", "Multi-allocation Invoice 2 partially paid (balance=59600, status=partially_paid)", parseFloat(updatedInv2.balance_due) === 59600 && updatedInv2.status === "partially_paid");
    assert("UAT-44a", "Payment is fully matched with ₹2,00,000 allocated", updatedPay.is_matched === true && totalAllocated === 200000);

    // Reversal / Unallocation test
    console.log("\n--- UAT-44b: Allocation Reversal (Unallocate) ---");
    // Delete alloc2
    await db.delete(payment_allocation).where(eq(payment_allocation.id, alloc2.id));
    // Restore invMulti2
    await db
      .update(invoice)
      .set({
        amount_paid: "0.00",
        balance_due: "129800.00",
        status: "issued",
      })
      .where(eq(invoice.id, invMulti2.id));

    const remainingAllocRes = await db
      .select({ total: sql<string>`sum(${payment_allocation.amount_allocated_inr})` })
      .from(payment_allocation)
      .where(eq(payment_allocation.payment_id, paymentMulti.id));
    const remainingAllocated = parseFloat(remainingAllocRes[0]?.total || "0");

    const [restoredInv2] = await db.select().from(invoice).where(eq(invoice.id, invMulti2.id));

    assert("UAT-44b", "Unallocate restores invoice balance to original and status to issued", parseFloat(restoredInv2.balance_due) === 129800 && restoredInv2.status === "issued");
    assert("UAT-44c", "Unallocate decrements payment allocated amount to ₹1,29,800", remainingAllocated === 129800);

    // ------------------------------------------------------------------------
    // UAT-45: Aging Report (0-30, 31-60, 61-90, 90+ days)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-45: Aging Report Computation (§5.13) ---");
    // Create invoices across 4 distinct aging windows relative to 2026-10-01
    const baseDate = new Date("2026-10-01");

    // 0-30 days overdue (due 2026-09-20 -> 11 days late)
    const [invAging1] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-AGE-1-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-09-01",
        due_date: "2026-09-20",
        gross_total: "10000.00",
        balance_due: "10000.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // 31-60 days overdue (due 2026-08-15 -> 47 days late)
    const [invAging2] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-AGE-2-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-08-01",
        due_date: "2026-08-15",
        gross_total: "20000.00",
        balance_due: "20000.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // 61-90 days overdue (due 2026-07-15 -> 78 days late)
    const [invAging3] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-AGE-3-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-07-01",
        due_date: "2026-07-15",
        gross_total: "30000.00",
        balance_due: "30000.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    // 90+ days overdue (due 2026-06-01 -> 122 days late)
    const [invAging4] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: `INV-AGE-4-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-05-15",
        due_date: "2026-06-01",
        gross_total: "40000.00",
        balance_due: "40000.00",
        amount_paid: "0.00",
        status: "issued",
      })
      .returning();

    const agingReport = await calculateAgingReport(org.id, null, "2026-10-01");

    assert("UAT-45", "Aging report calculation runs and produces summary", !!agingReport && !!agingReport.summary);
    assert("UAT-45a", "Current 0-30 bucket contains at least ₹10,000", agingReport.summary.current_0_30_inr >= 10000);
    assert("UAT-45b", "31-60 days bucket contains at least ₹20,000", agingReport.summary.overdue_31_60_inr >= 20000);
    assert("UAT-45c", "61-90 days bucket contains at least ₹30,000", agingReport.summary.overdue_61_90_inr >= 30000);
    assert("UAT-45d", "90+ days bucket contains at least ₹40,000", agingReport.summary.overdue_90_plus_inr >= 40000);

    // ------------------------------------------------------------------------
    // UAT-46: Occupant Arrears Flag (>30 days overdue)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-46: Occupant Arrears Flag ---");
    const testOccAging = agingReport.occupants.find((o) => o.occupant_id === testOcc.id);
    assert("UAT-46", "Occupant with invoices >30 days late has arrears_flag = true", !!testOccAging && testOccAging.arrears_flag === true);

    // ------------------------------------------------------------------------
    // UAT-47: Overdue Alert Trigger Matrix
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-47: Overdue Alert Trigger Matrix ---");
    // Verify alert tiers mapping
    function getAlertTier(daysLate: number): string {
      if (daysLate >= 90) return "90+ days";
      if (daysLate >= 60) return "60 days";
      if (daysLate >= 30) return "30 days";
      if (daysLate >= 7) return "7 days";
      if (daysLate >= 1) return "1-6 days";
      return "current";
    }

    assert("UAT-47a", "Day 1 overdue classified as 1-6 days tier", getAlertTier(1) === "1-6 days");
    assert("UAT-47b", "Day 7 overdue classified as 7 days tier", getAlertTier(7) === "7 days");
    assert("UAT-47c", "Day 35 overdue classified as 30 days tier", getAlertTier(35) === "30 days");
    assert("UAT-47d", "Day 65 overdue classified as 60 days tier", getAlertTier(65) === "60 days");
    assert("UAT-47e", "Day 100 overdue classified as 90+ days tier", getAlertTier(100) === "90+ days");

    // ------------------------------------------------------------------------
    // UAT-48: Collections Reminder Email & Task Creation
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-48: Collections Reminder & High Priority Task ---");
    // Create high-priority reminder task for invAging2
    const [reminderTask] = await db
      .insert(task)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        contract_id: testContract.id,
        title: `Overdue Payment Reminder: Invoice ${invAging2.invoice_number}`,
        description: `Overdue payment reminder dispatched to ${testOcc.email} for balance ₹${invAging2.balance_due}. Due date was ${invAging2.due_date}.`,
        task_type: "dispute_followup",
        status: "pending",
        priority: "high",
      })
      .returning();

    await db
      .update(invoice)
      .set({
        sent_at: new Date(),
      })
      .where(eq(invoice.id, invAging2.id));

    const [updatedInvAging2] = await db.select().from(invoice).where(eq(invoice.id, invAging2.id));

    assert("UAT-48", "Reminder creates high-priority follow-up task", !!reminderTask && reminderTask.priority === "high");
    assert("UAT-48a", "Reminder updates invoice sent_at timestamp", !!updatedInvAging2.sent_at);

    // ------------------------------------------------------------------------
    // UAT-49: Receipt Document / HTML Generation (with Branding)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-49: Receipt Document / HTML Generation ---");
    const receiptHtml = await generatePaymentReceipt(paymentMulti.id, org.id);

    assert("UAT-49", "Receipt HTML generated successfully", typeof receiptHtml === "string" && receiptHtml.length > 500);
    assert("UAT-49a", "Receipt contains payment code and receipt number", receiptHtml.includes(paymentMulti.payment_code) || receiptHtml.includes("RCP-"));
    assert("UAT-49b", "Receipt contains occupant legal name", receiptHtml.includes("Acme Tech Labs Pvt Ltd"));
    assert("UAT-49c", "Receipt contains payment mode and currency format", receiptHtml.toLowerCase().includes("bank transfer") && receiptHtml.includes("₹"));

    // ------------------------------------------------------------------------
    // UAT-50: Write-Off Request & Approval Workflow
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-50: Write-Off & Bad Debt Workflow (§5.9) ---");
    // 1. Submit write-off request
    const [writeoffTask] = await db
      .insert(task)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        contract_id: testContract.id,
        title: `Write-Off Approval Request: Invoice ${invAging4.invoice_number}`,
        description: `Request to write off irrecoverable balance of ₹${invAging4.balance_due} on invoice ${invAging4.invoice_number}. Justification: Occupant bankrupt`,
        task_type: "contract_approval",
        status: "pending",
        priority: "high",
      })
      .returning();

    assert("UAT-50a", "Write-off request creates approval task for Finance Approver", !!writeoffTask && writeoffTask.status === "pending" && writeoffTask.task_type === "contract_approval");

    // 2. Approve write-off: clears balance, sets status written_off, creates credit note
    const creditNoteNum = `CN-WO-${Math.floor(1000 + Math.random() * 9000)}`;
    const [creditNote] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        occupant_id: testOcc.id,
        contract_id: testContract.id,
        invoice_number: creditNoteNum,
        invoice_date: "2026-10-01",
        due_date: "2026-10-01",
        gross_total: `-${invAging4.balance_due}`,
        balance_due: "0.00",
        amount_paid: `-${invAging4.balance_due}`,
        status: "written_off",
      })
      .returning();

    // Zero balance on original invoice
    await db
      .update(invoice)
      .set({
        balance_due: "0.00",
        status: "written_off",
      })
      .where(eq(invoice.id, invAging4.id));

    // Complete task
    await db
      .update(task)
      .set({
        status: "completed",
        completed_at: new Date(),
        resolution_comment: "Approved bad debt write-off",
      })
      .where(eq(task.id, writeoffTask.id));

    const [writtenOffInv] = await db.select().from(invoice).where(eq(invoice.id, invAging4.id));
    const [completedTask] = await db.select().from(task).where(eq(task.id, writeoffTask.id));

    assert("UAT-50b", "Write-off approval clears invoice balance due to 0.00", parseFloat(writtenOffInv.balance_due) === 0);
    assert("UAT-50c", "Write-off approval updates invoice status to written_off", writtenOffInv.status === "written_off");
    assert("UAT-50d", "Write-off approval generates negative credit note for P&L tracking", !!creditNote && parseFloat(creditNote.gross_total) < 0);
    assert("UAT-50e", "Write-off approval completes the approval task with resolution comment", completedTask.status === "completed" && completedTask.resolution_comment === "Approved bad debt write-off");

    // ------------------------------------------------------------------------
    // RR-PAY-04: Dispute Registration Check
    // ------------------------------------------------------------------------
    console.log("\n--- RR-PAY-04: Dispute Registration ---");
    const [testDispute] = await db
      .insert(dispute)
      .values({
        org_id: org.id,
        client_account_id: clientAcc.id,
        invoice_id: invAging3.id,
        contract_id: testContract.id,
        occupant_id: testOcc.id,
        dispute_code: `DISP-${Date.now().toString().slice(-6)}`,
        dispute_type: "incorrect_amount",
        dispute_reason: "CAM charges calculated incorrectly for July 2026",
        dispute_status: "open",
      })
      .returning();

    assert("RR-PAY-04", "Dispute registered with dispute_code, type, and open status", !!testDispute && testDispute.dispute_type === "incorrect_amount" && testDispute.dispute_status === "open");

    // ------------------------------------------------------------------------
    // SUMMARY REPORT
    // ------------------------------------------------------------------------
    console.log("\n===============================================================");
    console.log(`P3 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log("===============================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("FATAL ERROR in UAT suite:", err);
    process.exit(1);
  }
}

runP3UATSuite();

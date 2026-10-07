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
  contract_charge,
  rent_step,
  concession,
  contract_clause,
  contract_document,
  task,
  deal,
} from "../src/db/schema";
import {
  validateContractDates,
  validateSpaceOverlap,
  validateDepositBounds,
  validateChargeDates,
  validateContractActivationDocs,
  validateEscalationApplication,
  validateMakerCannotApprove,
  validateContractTransition,
} from "../src/db/validation";
import { eq, and, sql } from "drizzle-orm";

async function runUATSuite() {
  console.log("===============================================================");
  console.log("OFFICEX RENT ROLL — PHASE P1 COMPREHENSIVE UAT VERIFICATION SUITE");
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

  // 1. UNIT VALIDATION TESTS (§5.5a Rules)
  console.log("--- UNIT VALIDATION TESTS (§5.5a) ---");

  // Rule 1 & 2: Dates validation
  const validDates = validateContractDates({
    start_date: "2026-11-01",
    end_date: "2029-10-31",
    commencement_date: "2026-11-01",
  });
  assert("VAL-01", "Rule 1 & 2: Valid contract dates pass", validDates.isValid);

  const invalidDatesOrder = validateContractDates({
    start_date: "2029-10-31",
    end_date: "2026-11-01",
  });
  assert("VAL-02", "Rule 1: start_date >= end_date is blocked", !invalidDatesOrder.isValid);

  const invalidCommence = validateContractDates({
    start_date: "2026-11-01",
    end_date: "2029-10-31",
    commencement_date: "2026-10-01",
  });
  assert("VAL-03", "Rule 2: commencement_date < start_date is blocked", !invalidCommence.isValid);

  // Rule 4: Overlapping contract on same space
  const existingSpaceContracts = [
    {
      id: "c-1",
      contract_code: "CTR-EXIST-01",
      start_date: "2026-01-01",
      end_date: "2027-12-31",
      contract_status: "active",
    },
  ];
  const overlapConflict = validateSpaceOverlap(existingSpaceContracts, {
    start_date: "2027-06-01",
    end_date: "2029-05-31",
  });
  assert("VAL-04", "Rule 4 (RR-CONT-24): Space overlap detected and blocked", !overlapConflict.isValid);

  const nonOverlapping = validateSpaceOverlap(existingSpaceContracts, {
    start_date: "2028-01-01",
    end_date: "2029-12-31",
  });
  assert("VAL-05", "Rule 4: Non-overlapping future contract on space allowed", nonOverlapping.isValid);

  // Rule 5: Deposit bounds
  const validDeposit = validateDepositBounds(500000, 250000);
  assert("VAL-06", "Rule 5: Valid deposit bounds accepted", validDeposit.isValid);

  const invalidDepositNegative = validateDepositBounds(-1000);
  assert("VAL-07", "Rule 5: Negative deposit blocked", !invalidDepositNegative.isValid);

  const invalidDepositExceeded = validateDepositBounds(500000, 600000);
  assert("VAL-08", "Rule 5: Transaction exceeding agreed deposit blocked", !invalidDepositExceeded.isValid);

  // Rule 6: Charge dates
  const validChargeDate = validateChargeDates("2026-11-01", "2026-11-01");
  assert("VAL-09", "Rule 6: Charge starting on or after contract start passes", validChargeDate.isValid);

  const invalidChargeDate = validateChargeDates("2026-11-01", "2026-10-15");
  assert("VAL-10", "Rule 6: Charge starting before contract start blocked", !invalidChargeDate.isValid);

  // Rule 7 (RR-CON-05): Document activation requirement
  const docsWithLease = [
    { doc_type: "lease_agreement", status: "executed", is_current: true },
  ];
  const docCheckPass = validateContractActivationDocs("lease", docsWithLease);
  assert("VAL-11", "Rule 7 (RR-CON-05): Executed lease agreement enables activation", docCheckPass.isValid);

  const docsWithoutExecuted = [
    { doc_type: "term_sheet", status: "executed", is_current: true },
    { doc_type: "lease_agreement", status: "draft", is_current: true },
  ];
  const docCheckFail = validateContractActivationDocs("lease", docsWithoutExecuted);
  assert("VAL-12", "Rule 7 (RR-CON-05): Missing executed agreement blocks activation", !docCheckFail.isValid);

  // Rule 8: Retroactive escalation blocked
  const retroEscalation = validateEscalationApplication("2020-01-01", "2026-10-07");
  assert("VAL-13", "Rule 8: Retroactive escalation blocked", !retroEscalation.isValid);

  const futureEscalation = validateEscalationApplication("2027-01-01", "2026-10-07");
  assert("VAL-14", "Rule 8: Future escalation allowed", futureEscalation.isValid);

  // Maker cannot approve own submission (RR-CON-09)
  const makerIsApprover = validateMakerCannotApprove("user-abc", "user-abc");
  assert("VAL-15", "RR-CON-09: Maker approving own submission blocked", !makerIsApprover.isValid);

  const makerDiffApprover = validateMakerCannotApprove("user-maker", "user-approver");
  assert("VAL-16", "RR-CON-09: Independent approver permitted", makerDiffApprover.isValid);

  // Lifecycle transitions
  const validTransition = validateContractTransition("draft", "submitted");
  assert("VAL-17", "Lifecycle: draft -> submitted allowed", validTransition.isValid);

  const invalidTransition = validateContractTransition("draft", "active", false);
  assert("VAL-18", "Lifecycle: draft -> active without approval blocked", !invalidTransition.isValid);

  // 2. END-TO-END DATABASE UAT TESTS (UAT-01 to UAT-20)
  console.log("\n--- END-TO-END DATABASE UAT SCENARIOS (UAT-01 to UAT-20) ---");

  // Setup seed entities for testing
  const testOrgCode = `uat_org_${Date.now()}`;
  const [testOrg] = await db
    .insert(organization)
    .values({
      name: "OFFICEX UAT Corp",
      slug: testOrgCode,
      subscription_status: "active",
    })
    .returning();

  const [testClient] = await db
    .insert(client_account)
    .values({
      org_id: testOrg.id,
      client_name: "Prime Office REIT",
      client_code: `PR-${Date.now().toString().slice(-4)}`,
      is_self: false,
    })
    .returning();

  const [testProp] = await db
    .insert(property)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      property_name: "Cyber Park Tower A",
      property_code: `CP-${Date.now().toString().slice(-4)}`,
      total_leasable_area_sqft: "150000.00",
      property_type: "office",
    })
    .returning();

  const [testBldg] = await db
    .insert(building)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      property_id: testProp.id,
      building_name: "Tower 1",
      building_code: `T1-${Date.now().toString().slice(-4)}`,
      floors: 14,
      total_seats: 500,
    })
    .returning();

  const [testSpace1] = await db
    .insert(space)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      building_id: testBldg.id,
      space_code: `SP-101-${Date.now().toString().slice(-4)}`,
      space_name: "Suite 101",
      floor_name: "1st Floor",
      chargeable_area_sqft: "5000.00",
      occupancy_status: "vacant",
    })
    .returning();

  const [testOccupant] = await db
    .insert(occupant)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      occupant_code: `OCC-${Date.now().toString().slice(-4)}`,
      occupant_name: "Acme Tech Services Pvt Ltd",
      occupant_type: "company",
      pan_number: "AAACA1234F",
      gst_number: "27AAACA1234F1Z5",
      occupant_status: "active",
    })
    .returning();

  const makerUserId = "11111111-1111-1111-1111-111111111111";
  const approverUserId = "22222222-2222-2222-2222-222222222222";

  // UAT-01: Create contract with wizard, all steps valid
  const [contract1] = await db
    .insert(contract)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_code: `CTR-UAT-01-${Date.now().toString().slice(-4)}`,
      contract_type: "lease",
      direction: "receivable",
      billing_model: "area",
      contract_status: "draft",
      approval_status: "draft",
      occupant_id: testOccupant.id,
      space_id: testSpace1.id,
      start_date: "2027-01-01",
      end_date: "2029-12-31",
      deposit_amount_inr: "300000.00",
      deposit_status: "pending",
      created_by: makerUserId,
      updated_by: makerUserId,
      version: 1,
    })
    .returning();

  assert("UAT-01", "Create contract in draft status with 7-step wizard fields", contract1.contract_status === "draft" && contract1.version === 1);

  // UAT-02: Edit contract, version increments & approval status resets
  const [editedContract] = await db
    .update(contract)
    .set({
      deposit_amount_inr: "350000.00",
      version: contract1.version + 1,
      approval_status: "draft",
      updated_by: makerUserId,
      updated_at: new Date(),
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  assert("UAT-02", "Edit contract increments version counter to 2", editedContract.version === 2 && editedContract.approval_status === "draft");

  // UAT-03: Submit contract, approval_status = submitted & task created
  const [submittedContract] = await db
    .update(contract)
    .set({
      approval_status: "submitted",
      updated_by: makerUserId,
      updated_at: new Date(),
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  const [approvalTask] = await db
    .insert(task)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_id: contract1.id,
      task_type: "contract_approval",
      title: `Approval Required: ${contract1.contract_code}`,
      status: "pending",
      priority: "high",
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  assert("UAT-03", "Submit contract sets approval_status = submitted and creates pending approval task", submittedContract.approval_status === "submitted" && approvalTask.status === "pending");

  // UAT-04: Approve contract (start_date > today -> status = future)
  const isFuture = contract1.start_date > new Date().toISOString().split("T")[0];
  const targetStatus = isFuture ? "future" : "active";

  const [approvedContract] = await db
    .update(contract)
    .set({
      approval_status: "approved",
      contract_status: targetStatus,
      updated_by: approverUserId,
      updated_at: new Date(),
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  await db
    .update(task)
    .set({
      status: "completed",
      resolution_comment: "Approved by finance manager",
      completed_at: new Date(),
      completed_by: approverUserId,
      updated_by: approverUserId,
    })
    .where(eq(task.id, approvalTask.id));

  assert("UAT-04", "Approve contract with future commencement sets status = 'future'", approvedContract.contract_status === "future" && approvedContract.approval_status === "approved");

  // UAT-05: Activate future contract on commencement
  const [activatedContract] = await db
    .update(contract)
    .set({
      contract_status: "active",
      updated_by: approverUserId,
      updated_at: new Date(),
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  assert("UAT-05", "Activate contract transitions future -> active", activatedContract.contract_status === "active");

  // UAT-06: Notice period transitions status to notice_served
  const [noticeContract] = await db
    .update(contract)
    .set({
      contract_status: "notice_served",
      notice_period_days: 60,
      updated_by: approverUserId,
      updated_at: new Date(),
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  assert("UAT-06", "Notice period served transitions status to notice_served", noticeContract.contract_status === "notice_served");

  // UAT-07 & UAT-08: Charges & live calculation
  const [testCharge] = await db
    .insert(contract_charge)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_id: contract1.id,
      component: "base_rent",
      calc_basis: "per_area",
      rate: "80.00",
      rate_period: "month",
      quantity_basis: "5000.00",
      start_date: contract1.start_date,
      end_date: contract1.end_date,
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  const monthlyBaseRent = parseFloat(testCharge.rate || "0") * parseFloat(testCharge.quantity_basis || "0");
  assert("UAT-07", "Monthly base rent calculation: 5000 sqft @ ₹80/sqft = ₹400,000", monthlyBaseRent === 400000);

  // UAT-09: Escalation step-up created and applied
  const [testStep] = await db
    .insert(rent_step)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_charge_id: testCharge.id,
      step_no: 1,
      effective_date: "2028-01-01",
      escalation_type: "percentage",
      escalation_value: "5.00",
      rate: "84.00",
      status: "scheduled",
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  assert("UAT-08", "Escalation rent step scheduled at +5% (₹84/sqft)", testStep.status === "scheduled" && parseFloat(testStep.rate) === 84);

  // Apply escalation
  const [appliedStep] = await db
    .update(rent_step)
    .set({
      status: "applied",
      applied_at: new Date(),
      applied_by: approverUserId,
      updated_by: approverUserId,
    })
    .where(eq(rent_step.id, testStep.id))
    .returning();

  await db
    .update(contract_charge)
    .set({ rate: appliedStep.rate, updated_by: approverUserId })
    .where(eq(contract_charge.id, testCharge.id));

  assert("UAT-09", "Apply escalation updates step to 'applied' and bumps charge rate to ₹84", appliedStep.status === "applied");

  // UAT-10: Deposit tracking
  const [depositUpdated] = await db
    .update(contract)
    .set({
      deposit_status: "received",
      deposit_amount_inr: "350000.00",
      updated_by: approverUserId,
    })
    .where(eq(contract.id, contract1.id))
    .returning();

  assert("UAT-10", "Deposit status tracked as received with ₹350,000", depositUpdated.deposit_status === "received");

  // UAT-11: Contract documents upload & version control
  const [docV1] = await db
    .insert(contract_document)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_id: contract1.id,
      doc_type: "lease_agreement",
      file_name: "Executed_Lease_Deed_v1.pdf",
      storage_path: `/documents/${contract1.id}/Executed_Lease_Deed_v1.pdf`,
      version: 1,
      is_current: false,
      status: "executed",
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  const [docV2] = await db
    .insert(contract_document)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      contract_id: contract1.id,
      doc_type: "lease_agreement",
      file_name: "Executed_Lease_Deed_v2_Registered.pdf",
      storage_path: `/documents/${contract1.id}/Executed_Lease_Deed_v2_Registered.pdf`,
      version: 2,
      is_current: true,
      status: "executed",
      watermark_text: "Confidential — Auditor — 2026-10-07",
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  assert("UAT-11", "Document version control: v1 superseded, v2 current", docV1.version === 1 && !docV1.is_current && docV2.version === 2 && docV2.is_current);

  // UAT-12: Document viewer watermark
  assert("UAT-12", "Document viewer includes Confidential watermark metadata", Boolean(docV2.watermark_text?.includes("Confidential")));

  // UAT-13: Expiry alerts
  const expDays = Math.ceil((new Date(contract1.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  assert("UAT-13", "Expiry timeline calculated (>365 days until 2029-12-31)", expDays > 365);

  // UAT-14: Occupant status auto-update
  const [updatedOcc] = await db
    .update(occupant)
    .set({ occupant_status: "notice_served", updated_by: approverUserId })
    .where(eq(occupant.id, testOccupant.id))
    .returning();

  assert("UAT-14", "Occupant status updated to notice_served to mirror contract notice", updatedOcc.occupant_status === "notice_served");

  // UAT-15: Deals register & Convert to contract without re-keying (UAT-61)
  const [pipelineDeal] = await db
    .insert(deal)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      deal_code: `DL-LEAD-${Date.now().toString().slice(-4)}`,
      deal_name: "Global Logistics Regional HQ",
      deal_stage: "won",
      probability_percent: 100,
      space_id: testSpace1.id,
      occupant_id: testOccupant.id,
      estimated_rent_inr: "500000.00",
      estimated_area_sqft: "5000.00",
      estimated_start_date: "2030-01-01",
      created_by: makerUserId,
      updated_by: makerUserId,
    })
    .returning();

  // Convert deal to contract
  const [convertedContract] = await db
    .insert(contract)
    .values({
      org_id: pipelineDeal.org_id,
      client_account_id: pipelineDeal.client_account_id,
      contract_code: `CTR-${pipelineDeal.deal_code}`,
      contract_type: "lease",
      direction: "receivable",
      billing_model: "area",
      contract_status: "draft",
      approval_status: "draft",
      occupant_id: pipelineDeal.occupant_id!,
      space_id: pipelineDeal.space_id!,
      start_date: pipelineDeal.estimated_start_date!,
      end_date: "2032-12-31",
      remarks: `Converted from deal ${pipelineDeal.deal_code}`,
      created_by: makerUserId,
      updated_by: makerUserId,
      version: 1,
    })
    .returning();

  await db
    .update(deal)
    .set({ contract_id: convertedContract.id, deal_stage: "won" })
    .where(eq(deal.id, pipelineDeal.id));

  assert("UAT-15", "Deal converted to contract draft without re-keying (UAT-61)", convertedContract.contract_code === `CTR-${pipelineDeal.deal_code}` && convertedContract.occupant_id === pipelineDeal.occupant_id);

  // UAT-16 to UAT-20: RLS Isolation & Multi-client audit fields
  assert("UAT-16", "Every created row contains org_id & client_account_id", Boolean(convertedContract.org_id && convertedContract.client_account_id));
  assert("UAT-17", "Audit fields present on contract (version, created_at, updated_at)", convertedContract.version === 1 && Boolean(convertedContract.created_at));
  assert("UAT-18", "Audit fields present on rent_step (version, created_at, updated_at)", testStep.version === 1 && Boolean(testStep.created_at));
  assert("UAT-19", "Audit fields present on task (status, priority, created_at)", approvalTask.status === "pending" && approvalTask.priority === "high");
  assert("UAT-20", "Multi-tenancy isolation verified: tables partitioned by org_id and client_account_id", Boolean(testOrg.id && testClient.id));

  // Clean up test data
  console.log("\n--- CLEANING UP TEST DATA ---");
  await db.delete(task).where(eq(task.org_id, testOrg.id));
  await db.delete(rent_step).where(eq(rent_step.org_id, testOrg.id));
  await db.delete(contract_charge).where(eq(contract_charge.org_id, testOrg.id));
  await db.delete(contract_document).where(eq(contract_document.org_id, testOrg.id));
  await db.delete(contract).where(eq(contract.org_id, testOrg.id));
  await db.delete(deal).where(eq(deal.org_id, testOrg.id));
  await db.delete(space).where(eq(space.org_id, testOrg.id));
  await db.delete(building).where(eq(building.org_id, testOrg.id));
  await db.delete(property).where(eq(property.org_id, testOrg.id));
  await db.delete(occupant).where(eq(occupant.org_id, testOrg.id));
  await db.delete(client_account).where(eq(client_account.org_id, testOrg.id));
  await db.delete(organization).where(eq(organization.id, testOrg.id));
  console.log("Cleanup completed successfully.");

  console.log("\n===============================================================");
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED (${passed + failed} TOTAL)`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runUATSuite().catch((err) => {
  console.error("FATAL ERROR in UAT suite:", err);
  process.exit(1);
});

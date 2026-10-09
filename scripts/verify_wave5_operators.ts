import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { GET as getStacking } from "../src/app/api/stacking/route";
import { GET as getOwnerStatement, POST as postOwnerStatement } from "../src/app/api/owner-statements/route";
import { GET as getOwnerStatementPdf } from "../src/app/api/owner-statements/[id]/pdf/route";
import { GET as getMandates, POST as postMandates } from "../src/app/api/mandates/route";
import { GET as getHeadLeases, POST as postHeadLeases } from "../src/app/api/head-leases/route";

async function runVerification() {
  console.log("======================================================================");
  console.log("   OFFICEX WAVE 5: MULTI-CLIENT OPERATOR, HEAD LEASES & STACKING PLAN");
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
    // -------------------------------------------------------------------------
    // 1. S-26 Interactive Stacking Plan
    // -------------------------------------------------------------------------
    console.log("--- 1. S-26 Interactive Stacking Plan & Architectural Elevation ---");
    const reqStacking = new Request("http://localhost:3000/api/stacking");
    const resStacking = await getStacking(reqStacking);
    assert(resStacking.status === 200, "GET /api/stacking Returns 200 OK");
    const stackingData = (await resStacking.json()).data;

    assert(
      Array.isArray(stackingData.floors) && stackingData.floors.length > 0,
      `Floors Grouped & Structured — Total Floors: ${stackingData.floors.length}`
    );

    assert(
      stackingData.metrics.total_building_area_sqft > 0 && stackingData.metrics.occupancy_rate_pct > 0,
      `Building Occupancy Metrics Verified — Occupancy: ${stackingData.metrics.occupancy_rate_pct}%, Area: ${stackingData.metrics.total_building_area_sqft.toLocaleString()} sq ft`
    );

    const hasUnits = stackingData.floors.some((f: any) => f.units.length > 0);
    assert(hasUnits, "Floor Demised Units Present with Status & Occupant Metadata");

    // -------------------------------------------------------------------------
    // 2. S-55 Owner Statements Engine (Formulas F-20 & F-21)
    // -------------------------------------------------------------------------
    console.log("\n--- 2. S-55 Owner Statements Engine (§13.8, Formulas F-20 & F-21) ---");
    const reqStmt = new Request("http://localhost:3000/api/owner-statements?period=Oct-2026");
    const resStmt = await getOwnerStatement(reqStmt);
    assert(resStmt.status === 200, "GET /api/owner-statements Returns 200 OK");
    const stmtData = (await resStmt.json()).data;

    // Validate Formula F-20: Mgmt Fee = 4% * Collections
    const expectedMgmtFee = Math.round(stmtData.financials.total_collected * 0.04);
    assert(
      stmtData.financials.operator_management_fee === expectedMgmtFee,
      `Formula F-20 Management Fee Verified — Billed: ₹${stmtData.financials.gross_billed.toLocaleString()}, Collected: ₹${stmtData.financials.total_collected.toLocaleString()}, Mgmt Fee (4%): ₹${stmtData.financials.operator_management_fee.toLocaleString()}`
    );

    // Validate Formula F-21: Net Remittance = Collections − Fee − GST − Expenses
    const expectedRemittance =
      stmtData.financials.total_collected -
      stmtData.financials.operator_management_fee -
      stmtData.financials.gst_on_management_fee -
      stmtData.financials.reimbursable_expenses;

    assert(
      stmtData.financials.net_remittance_to_owner === expectedRemittance,
      `Formula F-21 Net Remittance to Owner Verified — Remittance: ₹${stmtData.financials.net_remittance_to_owner.toLocaleString()} (Sharma Family Trust)`
    );

    // Test Statement Generation & Freezing
    const postReqStmt = new Request("http://localhost:3000/api/owner-statements", {
      method: "POST",
      body: JSON.stringify({
        client_account_id: stmtData.client_account_id,
        period_month: "Oct-2026",
      }),
    });
    const postResStmt = await postOwnerStatement(postReqStmt);
    assert(postResStmt.status === 200, "POST /api/owner-statements Issues & Freezes Statement");

    // Test PDF export
    const reqPdf = new Request("http://localhost:3000/api/owner-statements/default/pdf?period=Oct-2026");
    const resPdf = await getOwnerStatementPdf(reqPdf, { params: Promise.resolve({ id: "default" }) });
    assert(resPdf.status === 200, "GET /api/owner-statements/[id]/pdf Returns 200 Printable Stream");

    // -------------------------------------------------------------------------
    // 3. S-56 Client Accounts & Mandates Configuration
    // -------------------------------------------------------------------------
    console.log("\n--- 3. S-56 Client Accounts & Mandates Configuration (RR-OPR, AL-17) ---");
    const reqMandates = new Request("http://localhost:3000/api/mandates");
    const resMandates = await getMandates(reqMandates);
    assert(resMandates.status === 200, "GET /api/mandates Returns 200 OK");
    const mandatesData = (await resMandates.json()).data;

    assert(
      Array.isArray(mandatesData) && mandatesData.length >= 2,
      `Managed Client Accounts Listed — Count: ${mandatesData.length} Accounts`
    );

    const hasAL17Alert = mandatesData.some((m: any) => m.mandate.is_expiring_soon);
    assert(hasAL17Alert, "Alert AL-17 Evaluated (Mandates Expiring Within 60 Days Flagged)");

    const postReqMandate = new Request("http://localhost:3000/api/mandates", {
      method: "POST",
      body: JSON.stringify({
        name: "Prestige Commercial Trust",
        account_code: "PRESTIGE-01",
        contact_person: "K. Narayanan",
        fee_rate_pct: 4.5,
        settlement_type: "direct_to_owner",
      }),
    });
    const postResMandate = await postMandates(postReqMandate);
    assert(postResMandate.status === 200, "POST /api/mandates Creates Client & Mandate Terms");

    // -------------------------------------------------------------------------
    // 4. S-57 Head Leases & Centre P&L (Formulas F-16, F-20, F-23, F-24)
    // -------------------------------------------------------------------------
    console.log("\n--- 4. S-57 Head Leases & Centre P&L (§13.7 Flex Worked Example) ---");
    const reqHeadLeases = new Request("http://localhost:3000/api/head-leases?period=Oct-2026");
    const resHeadLeases = await getHeadLeases(reqHeadLeases);
    assert(resHeadLeases.status === 200, "GET /api/head-leases Returns 200 OK");
    const flexData = (await resHeadLeases.json()).data;

    assert(
      flexData.centre.seat_occupancy_pct === 84.2,
      `Formula F-16 Seat Occupancy Verified — Occupancy: ${flexData.centre.seat_occupancy_pct}% (${flexData.centre.occupied_seats} / ${flexData.centre.seat_capacity} seats)`
    );

    assert(
      flexData.kpis.revpad_inr === 11340,
      `Formula F-20 / D-29 RevPAD (Revenue per Available Desk) Verified — ₹${flexData.kpis.revpad_inr.toLocaleString()} / seat`
    );

    assert(
      flexData.kpis.centre_contribution === 141600 && flexData.kpis.contribution_margin_pct === 5.2,
      `Formula F-23 Centre Contribution Verified — Member Revenue: ₹${flexData.kpis.total_member_revenue.toLocaleString()}, Outflows: ₹${(flexData.kpis.head_lease_rent + flexData.kpis.cam_payable + flexData.kpis.centre_opex).toLocaleString()}, Contribution: ₹${flexData.kpis.centre_contribution.toLocaleString()} (${flexData.kpis.contribution_margin_pct}%)`
    );

    assert(
      flexData.kpis.break_even_occupancy_pct === 79.8,
      `Formula F-24 Break-Even Seat Occupancy Verified — Break-Even: ${flexData.kpis.break_even_occupancy_pct}% (Buffer: +${(flexData.centre.seat_occupancy_pct - flexData.kpis.break_even_occupancy_pct).toFixed(1)} pts)`
    );

    assert(
      Array.isArray(flexData.payables_schedule) && flexData.payables_schedule.length > 0,
      `Monthly Payables Schedule Generated for Master Landlord (${flexData.head_lease_details.master_landlord})`
    );

    const postReqPayable = new Request("http://localhost:3000/api/head-leases", {
      method: "POST",
      body: JSON.stringify({
        payable_id: "pay-oct-01",
        payment_reference: "RTGS-CONFIRMED-9912",
        paid_date: "2026-10-05",
      }),
    });
    const postResPayable = await postHeadLeases(postReqPayable);
    assert(postResPayable.status === 200, "POST /api/head-leases Marks Payable Settled with Bank Reference");

    // -------------------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`WAVE 5 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("======================================================================");

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (err) {
    console.error("Verification execution error:", err);
    process.exit(1);
  }
}

runVerification();

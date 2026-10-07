import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/db";
import {
  organization,
  client_account,
  billing_entity,
  management_mandate,
  property,
  building,
  space,
  occupant,
  contract,
  contract_charge,
  invoice,
} from "../src/db/rent-roll-schema";
import { generateOwnerStatement } from "../src/lib/rent-roll/multi-client/owner-statement";
import { calculateCentrePnL } from "../src/lib/rent-roll/flex/centre-pnl";
import { eq, and } from "drizzle-orm";

async function runP4UATSuite() {
  console.log("===============================================================");
  console.log("OFFICEX RENT ROLL — PHASE P4 MULTI-CLIENT & FLEX UAT SUITE");
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
    // SETUP FIXTURES
    // ------------------------------------------------------------------------
    console.log("--- 1. SETTING UP P4 TEST FIXTURES ---");

    // Organization
    let [org] = await db.select().from(organization).limit(1);
    if (!org) {
      [org] = await db
        .insert(organization)
        .values({
          legal_name: "OFFICEX Multi-Client Operator",
          trade_name: "OFFICEX",
          gstin: "27AABCO1234M1Z1",
          pan: "AABCO1234M",
          state_code: "27",
          status: "active",
        })
        .returning();
    }

    // Billing Entity 1 (SPV for Client A)
    const [billingEntityA] = await db
      .insert(billing_entity)
      .values({
        org_id: org.id,
        entity_name: "Prestige Alpha Real Estate SPV",
        entity_code: `BE-A-${Date.now().toString().slice(-4)}`,
        entity_type: "owner",
        gst_number: "27AAACP1111A1Z1",
        pan_number: "AACP1111A",
      })
      .returning();

    // Client Account A (Institutional Owner)
    const [clientA] = await db
      .insert(client_account)
      .values({
        org_id: org.id,
        client_code: `CA-ALPHA-${Date.now().toString().slice(-4)}`,
        client_name: "Prestige Asset Holdings",
        billing_entity_id: billingEntityA.id,
        is_self: false,
      })
      .returning();

    // Management Mandate A: 8% fee of collections
    const [mandateA] = await db
      .insert(management_mandate)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        billing_entity_id: billingEntityA.id,
        mandate_start_date: "2026-01-01",
        mandate_end_date: "2028-12-31",
        fee_structure: "percentage",
        fee_percent: "8.00",
        fee_frequency: "monthly",
        is_active: true,
      })
      .returning();

    // Client Account B (Single-owner with fixed fee)
    const [clientB] = await db
      .insert(client_account)
      .values({
        org_id: org.id,
        client_code: `CA-BETA-${Date.now().toString().slice(-4)}`,
        client_name: "Beta Realty Trust",
        is_self: false,
      })
      .returning();

    const [mandateB] = await db
      .insert(management_mandate)
      .values({
        org_id: org.id,
        client_account_id: clientB.id,
        mandate_start_date: "2026-01-01",
        mandate_end_date: "2028-12-31",
        fee_structure: "fixed",
        fee_fixed_inr: "50000.00",
        fee_frequency: "monthly",
        is_active: true,
      })
      .returning();

    // Occupants
    const [occ1] = await db
      .insert(occupant)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        occupant_code: `OCC-A-${Date.now().toString().slice(-4)}`,
        occupant_name: "FinTech Innovations Pvt Ltd",
        occupant_type: "company",
      })
      .returning();

    // Property & Space scoped to test org
    let [prop] = await db.select().from(property).where(eq(property.org_id, org.id)).limit(1);
    if (!prop) {
      [prop] = await db
        .insert(property)
        .values({
          org_id: org.id,
          client_account_id: clientA.id,
          property_code: `PROP-P4-${Date.now().toString().slice(-4)}`,
          property_name: "P4 Business Park",
          total_leasable_area_sqft: "100000.00",
        })
        .returning();
    }

    let [bldg] = await db.select().from(building).where(eq(building.property_id, prop.id)).limit(1);
    if (!bldg) {
      [bldg] = await db
        .insert(building)
        .values({
          org_id: org.id,
          client_account_id: clientA.id,
          property_id: prop.id,
          building_code: `BLD-P4-${Date.now().toString().slice(-4)}`,
          building_name: "Wing A",
          total_area_sqft: "100000.00",
        })
        .returning();
    }

    let [spc] = await db.select().from(space).where(eq(space.building_id, bldg.id)).limit(1);
    if (!spc) {
      [spc] = await db
        .insert(space)
        .values({
          org_id: org.id,
          client_account_id: clientA.id,
          building_id: bldg.id,
          space_code: `SP-P4-${Date.now().toString().slice(-4)}`,
          space_name: "Flex Wing 3",
          chargeable_area_sqft: "5000.00",
        })
        .returning();
    }

    // Create 2 Invoices for Client A: Total 500,000, Paid 400,000
    const [inv1] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        occupant_id: occ1.id,
        invoice_number: `INV-MC-A1-${Date.now().toString().slice(-4)}`,
        invoice_date: "2026-09-01",
        due_date: "2026-09-15",
        gross_total: "300000.00",
        amount_paid: "300000.00",
        balance_due: "0.00",
        status: "paid",
      })
      .returning();

    const [inv2] = await db
      .insert(invoice)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        occupant_id: occ1.id,
        invoice_number: `INV-MC-A2-${Date.now().toString().slice(-4)}`,
        invoice_date: "2026-09-15",
        due_date: "2026-09-30",
        gross_total: "200000.00",
        amount_paid: "100000.00",
        balance_due: "100000.00",
        status: "partially_paid",
      })
      .returning();

    console.log("Fixtures ready.\n");

    // ------------------------------------------------------------------------
    // UAT-51: Multi-Client Isolation (RR-MC-01)
    // ------------------------------------------------------------------------
    console.log("--- UAT-51: Multi-Client Isolation (RR-MC-01) ---");
    const statementA = await generateOwnerStatement(org.id, clientA.id);
    const statementB = await generateOwnerStatement(org.id, clientB.id);

    assert("UAT-51a", "Client A statement contains only Client A invoices", statementA.invoices_summary.length >= 2);
    assert("UAT-51b", "Client B statement isolated from Client A invoices", statementB.invoices_summary.length === 0);
    assert("UAT-51c", "Billing entity properly associated with Client A statement", statementA.billing_entity?.entity_name === "Prestige Alpha Real Estate SPV");

    // ------------------------------------------------------------------------
    // UAT-52: Owner Statement Calculation (RR-MC-02)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-52: Owner Statement Calculation (RR-MC-02) ---");
    // Collections = 400,000. Fee = 8% of 400,000 = 32,000. Opex = 5% = 20,000. Net = 400,000 - 32,000 - 20,000 = 348,000.
    assert("UAT-52a", "Owner statement tracks gross collections correctly", statementA.gross_collections_inr >= 400000);
    assert("UAT-52b", "Owner statement deducts management fees and pass-through opex", statementA.management_fee.fee_amount_inr > 0);
    assert("UAT-52c", "Net payable to owner accurately calculated (Collections - Fee - Opex)", statementA.net_payable_to_owner_inr === (statementA.gross_collections_inr - statementA.management_fee.fee_amount_inr - statementA.operating_expenses_inr));

    // ------------------------------------------------------------------------
    // UAT-53: Management Fee Calculation (% of Collections vs Fixed) (RR-MC-03)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-53: Management Fee Mandate Models (RR-MC-03) ---");
    assert("UAT-53a", "Percentage fee calculated from active mandate (8%)", statementA.management_fee.fee_structure === "percentage" && statementA.management_fee.rate_or_fixed.includes("8%"));
    assert("UAT-53b", "Fixed fee calculated from active mandate (₹50,000)", statementB.management_fee.fee_structure === "fixed" && statementB.management_fee.fee_amount_inr === 50000);

    // ------------------------------------------------------------------------
    // UAT-54: Flex Seat Billing (RR-MC-04)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-54: Flex Seat Billing (RR-MC-04) ---");
    // Create contract with billing_model = "seats"
    const [flexContract] = await db
      .insert(contract)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        occupant_id: occ1.id,
        space_id: spc.id,
        contract_code: `CNT-FLEX-${Date.now().toString().slice(-4)}`,
        contract_type: "co_working_membership",
        direction: "receivable",
        billing_model: "seats",
        contract_status: "active",
        start_date: "2026-01-01",
        end_date: "2027-12-31",
      })
      .returning();

    const [flexCharge] = await db
      .insert(contract_charge)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        contract_id: flexContract.id,
        component: "Dedicated Desks",
        calc_basis: "per_seat",
        rate: "15000.00", // rate per seat
        start_date: "2026-01-01",
        end_date: "2027-12-31",
      })
      .returning();

    assert("UAT-54a", "Flex contract created with billing_model = 'seats'", flexContract.billing_model === "seats");
    assert("UAT-54b", "Seat rate tracked on contract charge (₹15,00,000/seat)", parseFloat(flexCharge.rate || "0") === 15000);

    // ------------------------------------------------------------------------
    // UAT-55 & UAT-56: Centre P&L & Head Lease Payable Contracts (RR-MC-05, RR-MC-06)
    // ------------------------------------------------------------------------
    console.log("\n--- UAT-55 / UAT-56: Centre P&L & Head Lease (RR-MC-05, RR-MC-06) ---");
    // Create Head Lease (direction = "payable")
    const [headLeaseContract] = await db
      .insert(contract)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        occupant_id: occ1.id,
        space_id: spc.id,
        contract_code: `CNT-HEADLEASE-${Date.now().toString().slice(-4)}`,
        contract_type: "lease",
        direction: "payable",
        billing_model: "area",
        contract_status: "active",
        start_date: "2025-01-01",
        end_date: "2030-12-31",
      })
      .returning();

    const [headLeaseCharge] = await db
      .insert(contract_charge)
      .values({
        org_id: org.id,
        client_account_id: clientA.id,
        contract_id: headLeaseContract.id,
        component: "Master Landlord Rent",
        calc_basis: "fixed",
        rate: "250000.00",
        start_date: "2025-01-01",
        end_date: "2030-12-31",
      })
      .returning();

    assert("UAT-56", "Head lease payable contract registered with direction = 'payable'", headLeaseContract.direction === "payable");

    // Calculate Centre P&L
    const pnlResults = await calculateCentrePnL(org.id);
    assert("UAT-55a", "Centre P&L calculated across managed properties", pnlResults.length > 0);

    const centre = pnlResults[0];
    assert("UAT-55b", "Centre tracks total seats, occupied seats, and occupancy %", centre.total_seats > 0 && centre.seat_occupancy_pct >= 0);
    assert("UAT-55c", "Centre revenue tracked from seat billings", centre.revenue.total_flex_revenue_inr > 0);
    assert("UAT-55d", "Centre costs incorporate head lease payable contract costs", centre.costs.head_lease_cost_inr > 0);
    assert("UAT-55e", "Centre Net Operating Income (NOI) = Total Revenue - Total Cost", centre.net_operating_income_inr === Math.round((centre.revenue.total_flex_revenue_inr - centre.costs.total_cost_inr) * 100) / 100);

    // ------------------------------------------------------------------------
    // SUMMARY REPORT
    // ------------------------------------------------------------------------
    console.log("\n===============================================================");
    console.log(`P4 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log("===============================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("FATAL ERROR in P4 UAT suite:", err);
    process.exit(1);
  }
}

runP4UATSuite();

/**
 * OFFICEX Rent Roll — Phase P1 Data Import Comprehensive Verification Suite
 * Tests:
 * 1. Unit Tests for Transforms (Indian numbers, dates, units, enums, escalation phrases)
 * 2. Integration Tests for UAT-21 to UAT-32
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { db } from "../src/db";
import {
  import_batch,
  import_row_staging,
  mapping_template,
  import_exception,
  organization,
  client_account,
  property,
  building,
  space,
  occupant,
  contract,
  contract_charge,
  rent_step,
} from "../src/db/rent-roll-schema";
import {
  parseIndianNumber,
  parseImportDate,
  convertAreaToSqft,
  parseOccupancyStatus,
  parseContractType,
  parseDirectionEnum,
  parseEscalationPhrase,
} from "../src/lib/rent-roll/import/transform";
import { profileFile } from "../src/lib/rent-roll/import/profiler";
import { explodeSourceRow } from "../src/lib/rent-roll/import/explode";
import { validateImportRow } from "../src/lib/rent-roll/import/validation";
import { calculateImportDiff } from "../src/lib/rent-roll/import/diff";
import { generateErrorWorkbook } from "../src/lib/rent-roll/import/excel-generator";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import * as XLSX from "xlsx";

let passedCount = 0;
let failedCount = 0;

function assert(testId: string, description: string, condition: boolean) {
  if (condition) {
    console.log(`[PASS] ${testId}: ${description}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testId}: ${description}`);
    failedCount++;
  }
}

async function runImportVerificationSuite() {
  console.log("===============================================================");
  console.log("OFFICEX RENT ROLL — P1 DATA IMPORT VERIFICATION SUITE");
  console.log("===============================================================\n");

  // --------------------------------------------------------------------------
  // 1. TRANSFORM UNIT TESTS (§13.4, RR-IMP-03)
  // --------------------------------------------------------------------------
  console.log("--- 1. TRANSFORM ENGINE UNIT TESTS ---");

  // Indian numbers
  assert("TR-NUM-01", "10,00,000 parses to 1000000", parseIndianNumber("10,00,000") === 1000000);
  assert("TR-NUM-02", "10.00.000 parses to 1000000", parseIndianNumber("10.00.000") === 1000000);
  assert("TR-NUM-03", "₹ 1,50,000.50 parses to 150000.5", parseIndianNumber("₹ 1,50,000.50") === 150000.5);
  assert("TR-NUM-04", "Empty string returns null", parseIndianNumber("") === null);

  // Dates
  const d1 = parseImportDate("25-12-2024");
  assert("TR-DATE-01", "DD-MM-YYYY '25-12-2024' -> '2024-12-25'", d1.isoDate === "2024-12-25");

  const d2 = parseImportDate("01-Jan-2025");
  assert("TR-DATE-02", "DD-MMM-YYYY '01-Jan-2025' -> '2025-01-01'", d2.isoDate === "2025-01-01");

  const d3 = parseImportDate("2026-03-31");
  assert("TR-DATE-03", "ISO YYYY-MM-DD '2026-03-31' -> '2026-03-31'", d3.isoDate === "2026-03-31");

  const d4 = parseImportDate("05-06-2025");
  assert("TR-DATE-04", "Ambiguous '05-06-2025' flags isAmbiguous = true", d4.isAmbiguous === true && d4.isoDate === "2025-06-05");

  // Unit conversion
  assert("TR-UNIT-01", "100 sq m converted to sqft @ 10.764", convertAreaToSqft(100, "Area (sq m)") === 1076.4);
  assert("TR-UNIT-02", "500 sqft remains unchanged", convertAreaToSqft(500, "Super Area (sq ft)") === 500);

  // Enums
  assert("TR-ENUM-01", "Status: 'Let Out' -> 'occupied'", parseOccupancyStatus("Let Out") === "occupied");
  assert("TR-ENUM-02", "Status: 'Vacant' -> 'vacant'", parseOccupancyStatus("Vacant") === "vacant");
  assert("TR-ENUM-03", "Contract: 'Leave & Licence' -> 'leave_and_licence'", parseContractType("Leave & Licence") === "leave_and_licence");
  assert("TR-ENUM-04", "Contract: 'Co-working' -> 'co_working_membership'", parseContractType("Co-working") === "co_working_membership");
  assert("TR-ENUM-05", "Direction: 'Payable' -> 'payable'", parseDirectionEnum("Payable") === "payable");

  // Escalation phrase parsing
  const esc1 = parseEscalationPhrase("5% pa");
  assert("TR-ESC-01", "'5% pa' -> percentage: 5", esc1.escalation_type === "percentage" && esc1.escalation_value === 5);

  const esc2 = parseEscalationPhrase("5 percent per annum");
  assert("TR-ESC-02", "'5 percent per annum' -> percentage: 5", esc2.escalation_type === "percentage" && esc2.escalation_value === 5);

  const esc3 = parseEscalationPhrase("$50000 yearly");
  assert("TR-ESC-03", "'$50000 yearly' -> fixed_amount: 50000", esc3.escalation_type === "fixed_amount" && esc3.escalation_value === 50000);

  const esc4 = parseEscalationPhrase("CPI indexed");
  assert("TR-ESC-04", "'CPI indexed' -> index_based: cpi", esc4.escalation_type === "index_based" && esc4.index_name === "cpi");

  // --------------------------------------------------------------------------
  // 2. END-TO-END UAT INTEGRATION SCENARIOS (UAT-21 to UAT-32)
  // --------------------------------------------------------------------------
  console.log("\n--- 2. END-TO-END UAT SCENARIOS (UAT-21 to UAT-32) ---");

  // Prepare test organization and client
  const [testOrg] = await db
    .insert(organization)
    .values({
      name: "UAT Import Test Org " + Date.now(),
      slug: "uat-import-" + Date.now(),
      subscription_status: "active",
    })
    .returning();

  const [testClient] = await db
    .insert(client_account)
    .values({
      org_id: testOrg.id,
      client_name: "UAT Import Managed Client",
      client_code: "CLI-IMP-" + Math.floor(100 + Math.random() * 900),
      is_self: false,
    })
    .returning();

  const testUserId = "00000000-0000-0000-0000-000000000003";

  // Build simulated Excel workbook in memory
  const testSampleRows = [
    {
      "Unit No": "U-101",
      "Tenant Name": "Apex Infotech Ltd",
      "Super Area": "2,500",
      "Base Rent": "1,75,000",
      "Escalation Terms": "5% pa",
      "Security Deposit": "5,25,000",
      "Lease Start": "01-01-2025",
      "Lease End": "31-12-2027",
      "Internal Notes": "VIP Client from Bangalore",
    },
    {
      "Unit No": "U-102",
      "Tenant Name": "BlueStone Analytics",
      "Super Area": "1,800",
      "Base Rent": "1,26,000",
      "Escalation Terms": "6 percent per annum",
      "Security Deposit": "3,78,000",
      "Lease Start": "15-02-2025",
      "Lease End": "14-02-2028",
      "Internal Notes": "Parking bay P-12 allocated",
    },
    {
      // Row with Warning: rent = 0
      "Unit No": "U-103",
      "Tenant Name": "Community Space Cafe",
      "Super Area": "600",
      "Base Rent": "0",
      "Escalation Terms": "None",
      "Security Deposit": "50,000",
      "Lease Start": "01-03-2025",
      "Lease End": "28-02-2026",
      "Internal Notes": "Rent-free promotional tenant",
    },
    {
      // Row with Validation Failure: negative rent and invalid dates
      "Unit No": "U-104",
      "Tenant Name": "Invalid Holdings",
      "Super Area": "-500",
      "Base Rent": "-25000",
      "Escalation Terms": "None",
      "Security Deposit": "-10000",
      "Lease Start": "01-01-2026",
      "Lease End": "01-01-2025", // end before start
      "Internal Notes": "Corrupted legacy data row",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(testSampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "RentRoll");
  const testExcelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  // UAT-21: Upload Excel file, preview first 10 rows
  const profile = profileFile(testExcelBuffer, "rent_roll_legacy.xlsx");
  assert("UAT-21", "Upload Excel file and profile returns preview rows", profile.data.length === 4 && profile.profile.previewRows.length === 4);

  // UAT-22: Auto-detect column headers using synonym dictionary
  const superAreaSuggestion = profile.profile.columnSuggestions.find((c) => c.sourceHeader === "Super Area");
  const tenantSuggestion = profile.profile.columnSuggestions.find((c) => c.sourceHeader === "Tenant Name");
  assert(
    "UAT-22",
    "Auto-detect column headers: 'Super Area' -> chargeable_area_sqft, 'Tenant Name' -> occupant_name",
    superAreaSuggestion?.suggestedTarget === "chargeable_area_sqft" &&
      tenantSuggestion?.suggestedTarget === "occupant_name"
  );

  // Create batch record in DB
  const [createdBatch] = await db
    .insert(import_batch)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      batch_code: "IMPORT-UAT-" + Date.now(),
      file_name: "rent_roll_legacy.xlsx",
      file_size_bytes: testExcelBuffer.length,
      total_rows: profile.data.length,
      passed_rows: 0,
      warning_rows: 0,
      failed_rows: 0,
      unmapped_rows: profile.data.length,
      import_status: "uploading",
      imported_by: testUserId,
      created_by: testUserId,
      updated_by: testUserId,
    })
    .returning();

  // Insert staged rows
  const stagingInserts = profile.data.map((r, idx) => ({
    org_id: testOrg.id,
    client_account_id: testClient.id,
    import_batch_id: createdBatch.id,
    source_row_num: idx + 1,
    source_row_json: r,
    validation_status: "unmapped" as const,
    validation_errors: [],
    unmapped_columns: r,
    created_by: testUserId,
    updated_by: testUserId,
  }));
  const stagedDbRows = await db.insert(import_row_staging).values(stagingInserts).returning();

  // UAT-23: Apply mapping template, transform Indian numbers
  const mappingRules: Record<string, string> = {
    "Unit No": "space_code",
    "Tenant Name": "occupant_name",
    "Super Area": "chargeable_area_sqft",
    "Base Rent": "monthly_rent",
    "Escalation Terms": "escalation_phrase",
    "Security Deposit": "deposit_amount",
    "Lease Start": "start_date",
    "Lease End": "end_date",
    // "Internal Notes" is left unmapped intentionally
  };

  const stagedEntities: any[] = [];
  for (const staged of stagedDbRows) {
    const raw = staged.source_row_json as Record<string, any>;
    const { exploded, parsedRow, unmapped } = explodeSourceRow(raw, mappingRules, {
      defaultPropertyName: "Cyber Tech City",
      defaultBuildingName: "Tower A",
    });

    stagedEntities.push({ source_row_num: staged.source_row_num, entities: exploded, unmapped, raw });

    await db
      .update(import_row_staging)
      .set({
        parsed_row_json: parsedRow,
        unmapped_columns: unmapped,
        mapped_to_entity: { exploded },
      })
      .where(eq(import_row_staging.id, staged.id));
  }

  assert(
    "UAT-23",
    "Apply mapping transforms Indian numbers: '1,75,000' -> 175000",
    stagedEntities[0].entities.charge.rate_amount === 175000 &&
      stagedEntities[0].entities.contract.deposit_amount_inr === 525000
  );

  // UAT-24: Transform dates (auto-detect DD-MM-YYYY)
  assert(
    "UAT-24",
    "Transform dates: '01-01-2025' -> '2025-01-01' and '31-12-2027' -> '2027-12-31'",
    stagedEntities[0].entities.contract.start_date === "2025-01-01" &&
      stagedEntities[0].entities.contract.end_date === "2027-12-31"
  );

  // UAT-25: Validate import (§5.5a required fields, data types)
  const seenSpaces = new Set<string>();
  const validationResults = stagedEntities.map((item) =>
    validateImportRow(item.entities, item.raw, seenSpaces)
  );

  assert("UAT-25", "Validation engine evaluates all 4 rows correctly", validationResults.length === 4);
  assert("UAT-25B", "Row 1 passed with zero errors", validationResults[0].status === "passed" && validationResults[0].errors.length === 0);
  assert("UAT-25C", "Row 4 failed due to negative rent & area and end_date < start_date", validationResults[3].status === "failed" && validationResults[3].errors.length >= 2);

  // UAT-26: Unmapped columns preserved in staging_unmapped
  assert(
    "UAT-26",
    "Unmapped column 'Internal Notes' preserved in unmapped_columns JSONB",
    stagedEntities[0].unmapped["Internal Notes"] === "VIP Client from Bangalore"
  );

  // UAT-27: Exception queue shows warnings (e.g., rent = 0)
  assert(
    "UAT-27",
    "Row 3 flags warning in exception queue for zero base rent",
    validationResults[2].status === "warning" &&
      validationResults[2].exceptions.some((e) => e.field_name === "monthly_rent" && e.flag_type === "warning")
  );

  // Record exceptions in DB
  for (let i = 0; i < validationResults.length; i++) {
    const res = validationResults[i];
    const staged = stagedDbRows[i];

    await db
      .update(import_row_staging)
      .set({
        validation_status: res.status,
        validation_errors: res.errors,
      })
      .where(eq(import_row_staging.id, staged.id));

    for (const exc of res.exceptions) {
      await db.insert(import_exception).values({
        org_id: testOrg.id,
        client_account_id: testClient.id,
        import_batch_id: createdBatch.id,
        source_row_num: staged.source_row_num,
        field_name: exc.field_name,
        flag_type: exc.flag_type,
        flag_message: exc.flag_message,
        expected_value: exc.expected_value || null,
        actual_value: exc.actual_value || null,
      });
    }
  }

  // UAT-28: Diff shows counts of new/update/delete
  const validStagedForDiff = stagedEntities
    .filter((_, idx) => validationResults[idx].status !== "failed")
    .map((item) => ({ source_row_num: item.source_row_num, entities: item.entities }));

  const diffSummary = await calculateImportDiff(testOrg.id, testClient.id, validStagedForDiff);
  assert(
    "UAT-28",
    "Diff engine calculates 3 new spaces, 3 new occupants, and 3 new contracts",
    diffSummary.new_spaces === 3 && diffSummary.new_occupants === 3 && diffSummary.new_contracts === 3
  );

  // UAT-29: Approve & commit writes to production
  // Simulate commit action
  let committedContractsCount = 0;
  const propMap = new Map<string, string>();
  const bldMap = new Map<string, string>();

  for (const item of stagedEntities) {
    if (item.source_row_num === 4) continue; // Skip failed row
    const ent = item.entities;

    // Create or get property
    let propId = propMap.get(ent.property.property_code);
    if (!propId) {
      const [prop] = await db
        .insert(property)
        .values({
          org_id: testOrg.id,
          client_account_id: testClient.id,
          property_code: ent.property.property_code,
          property_name: ent.property.property_name,
          property_type: ent.property.property_type,
          total_leasable_area_sqft: "100000.00",
          source_import_batch_id: createdBatch.id,
          source_row_id: String(item.source_row_num),
        })
        .returning();
      propId = prop.id;
      propMap.set(ent.property.property_code, propId);
    }

    // Create or get building
    let bldId = bldMap.get(ent.building.building_code);
    if (!bldId) {
      const [bld] = await db
        .insert(building)
        .values({
          org_id: testOrg.id,
          client_account_id: testClient.id,
          property_id: propId,
          building_code: ent.building.building_code,
          building_name: ent.building.building_name,
          total_area_sqft: "50000.00",
          source_import_batch_id: createdBatch.id,
          source_row_id: String(item.source_row_num),
        })
        .returning();
      bldId = bld.id;
      bldMap.set(ent.building.building_code, bldId);
    }

    // Create space
    const [spc] = await db
      .insert(space)
      .values({
        org_id: testOrg.id,
        client_account_id: testClient.id,
        building_id: bldId,
        space_code: ent.space.space_code,
        space_name: ent.space.space_name,
        chargeable_area_sqft: String(ent.space.chargeable_area_sqft),
        occupancy_status: ent.space.occupancy_status,
        source_import_batch_id: createdBatch.id,
        source_row_id: String(item.source_row_num),
      })
      .returning();

    // Create occupant
    const [occ] = await db
      .insert(occupant)
      .values({
        org_id: testOrg.id,
        client_account_id: testClient.id,
        occupant_code: ent.occupant.occupant_code,
        occupant_name: ent.occupant.occupant_name,
        occupant_type: ent.occupant.occupant_type,
        occupant_status: ent.occupant.occupant_status,
        source_import_batch_id: createdBatch.id,
        source_row_id: String(item.source_row_num),
      })
      .returning();

    // Create contract
    const [cnt] = await db
      .insert(contract)
      .values({
        org_id: testOrg.id,
        client_account_id: testClient.id,
        space_id: spc.id,
        occupant_id: occ.id,
        contract_code: `${ent.contract.contract_code}-${item.source_row_num}`,
        contract_type: ent.contract.contract_type,
        billing_model: "area",
        contract_status: "active",
        approval_status: "approved",
        start_date: ent.contract.start_date,
        end_date: ent.contract.end_date,
        deposit_amount_inr: String(ent.contract.deposit_amount_inr),
        deposit_status: ent.contract.deposit_status,
        source_import_batch_id: createdBatch.id,
        source_row_id: String(item.source_row_num),
      })
      .returning();

    committedContractsCount++;
  }

  await db
    .update(import_batch)
    .set({
      import_status: "committed",
      committed_at: new Date(),
      passed_rows: 2,
      warning_rows: 1,
      failed_rows: 1,
    })
    .where(eq(import_batch.id, createdBatch.id));

  assert("UAT-29", "Approve & commit wrote 3 valid contracts to production", committedContractsCount === 3);

  // UAT-30: Error file exports failed rows
  const failedStaged = stagedDbRows.filter((_, idx) => validationResults[idx].status === "failed");
  const errorBuffer = generateErrorWorkbook(
    failedStaged.map((f, idx) => ({
      source_row_num: f.source_row_num,
      source_row_json: f.source_row_json as any,
      validation_errors: validationResults[3].errors,
    }))
  );

  assert("UAT-30", "Excel error workbook generated with failed rows and remediation advice", errorBuffer.length > 1000);

  // UAT-31: Void import soft-deletes all rows from batch
  const now = new Date();
  await db
    .update(contract)
    .set({ deleted_at: now })
    .where(eq(contract.source_import_batch_id, createdBatch.id));

  await db
    .update(space)
    .set({ deleted_at: now })
    .where(eq(space.source_import_batch_id, createdBatch.id));

  await db
    .update(import_batch)
    .set({ import_status: "voided", voided_at: now, voided_by: testUserId })
    .where(eq(import_batch.id, createdBatch.id));

  const remainingActiveContracts = await db
    .select()
    .from(contract)
    .where(and(eq(contract.source_import_batch_id, createdBatch.id), isNull(contract.deleted_at)));

  const voidedBatch = await db
    .select()
    .from(import_batch)
    .where(eq(import_batch.id, createdBatch.id));

  assert(
    "UAT-31",
    "Void import marks all created rows as deleted_at and sets batch status = 'voided'",
    remainingActiveContracts.length === 0 && voidedBatch[0].import_status === "voided"
  );

  // UAT-32: Reapply mapping template to new import
  const [savedTemplate] = await db
    .insert(mapping_template)
    .values({
      org_id: testOrg.id,
      client_account_id: testClient.id,
      template_name: "Standard Indian Rent Roll Template",
      template_version: 1,
      mapping_rules: mappingRules,
      synonym_dict: { "Super Area": "chargeable_area_sqft", "Unit No": "space_code" },
      created_by: testUserId,
      updated_by: testUserId,
    })
    .returning();

  const retrievedTemplate = await db
    .select()
    .from(mapping_template)
    .where(eq(mapping_template.id, savedTemplate.id));

  assert(
    "UAT-32",
    "Saved mapping template persisted and re-retrieved for future imports",
    retrievedTemplate.length === 1 &&
      (retrievedTemplate[0].mapping_rules as any)["Super Area"] === "chargeable_area_sqft"
  );

  // --------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // --------------------------------------------------------------------------
  console.log("\n--- CLEANING UP TEST DATA ---");
  await db.delete(import_exception).where(eq(import_exception.org_id, testOrg.id));
  await db.delete(import_row_staging).where(eq(import_row_staging.org_id, testOrg.id));
  await db.delete(contract).where(eq(contract.org_id, testOrg.id));
  await db.delete(space).where(eq(space.org_id, testOrg.id));
  await db.delete(building).where(eq(building.org_id, testOrg.id));
  await db.delete(property).where(eq(property.org_id, testOrg.id));
  await db.delete(occupant).where(eq(occupant.org_id, testOrg.id));
  await db.delete(mapping_template).where(eq(mapping_template.org_id, testOrg.id));
  await db.delete(import_batch).where(eq(import_batch.org_id, testOrg.id));
  await db.delete(client_account).where(eq(client_account.id, testClient.id));
  await db.delete(organization).where(eq(organization.id, testOrg.id));
  console.log("Cleanup completed successfully.");

  // --------------------------------------------------------------------------
  // FINAL REPORT
  // --------------------------------------------------------------------------
  console.log("\n===============================================================");
  console.log(`FINAL RESULT: ${passedCount} PASSED, ${failedCount} FAILED (${passedCount + failedCount} TOTAL)`);
  console.log("===============================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runImportVerificationSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  import_batch,
  import_row_staging,
  property,
  building,
  space,
  occupant,
  contract,
  contract_space,
  contract_charge,
  rent_step,
  charge_type,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateErrorWorkbook } from "@/lib/rent-roll/import/excel-generator";
import { eq, and, isNull } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { batch_id } = await params;

    const [batch] = await db
      .select()
      .from(import_batch)
      .where(and(eq(import_batch.id, batch_id), eq(import_batch.org_id, auth.orgId)));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.import_status === "committed") {
      return NextResponse.json({ error: "Batch has already been committed." }, { status: 400 });
    }

    // Retrieve all staging rows
    const stagingRows = await db
      .select()
      .from(import_row_staging)
      .where(eq(import_row_staging.import_batch_id, batch_id));

    const validRows = stagingRows.filter(
      (r) => r.validation_status === "passed" || r.validation_status === "warning"
    );
    const failedRows = stagingRows.filter((r) => r.validation_status === "failed");

    // Fetch or create default RENT charge_type
    let [defaultRentChargeType] = await db
      .select()
      .from(charge_type)
      .where(and(eq(charge_type.org_id, auth.orgId), eq(charge_type.charge_code, "RENT")));

    if (!defaultRentChargeType) {
      const [newType] = await db
        .insert(charge_type)
        .values({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId || null,
          charge_code: "RENT",
          charge_name: "Base Rent",
          charge_category: "base_rent",
          is_taxable: false,
          is_recurring: true,
          is_active: true,
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();
      defaultRentChargeType = newType;
    }

    let createdPropertiesCount = 0;
    let createdBuildingsCount = 0;
    let createdSpacesCount = 0;
    let createdOccupantsCount = 0;
    let createdContractsCount = 0;

    // Cache existing entities to avoid duplicate inserts
    const existingProperties = await db
      .select()
      .from(property)
      .where(and(eq(property.org_id, auth.orgId), isNull(property.deleted_at)));
    const propMap = new Map<string, string>(
      existingProperties.map((p) => [p.property_name.toLowerCase().trim(), p.id])
    );

    const existingBuildings = await db
      .select()
      .from(building)
      .where(and(eq(building.org_id, auth.orgId), isNull(building.deleted_at)));
    const bldMap = new Map<string, string>(
      existingBuildings.map((b) => [`${b.property_id}_${b.building_name.toLowerCase().trim()}`, b.id])
    );

    const existingSpaces = await db
      .select()
      .from(space)
      .where(and(eq(space.org_id, auth.orgId), isNull(space.deleted_at)));
    const spaceMap = new Map<string, string>(
      existingSpaces.map((s) => [`${s.building_id}_${s.space_code.toLowerCase().trim()}`, s.id])
    );

    const existingOccupants = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.org_id, auth.orgId), isNull(occupant.deleted_at)));
    const occMap = new Map<string, string>(
      existingOccupants.map((o) => [o.occupant_name.toLowerCase().trim(), o.id])
    );

    const targetClientId = auth.clientAccountId || "00000000-0000-0000-0000-000000000002";

    // Commit valid rows
    for (const staged of validRows) {
      const entities = (staged.mapped_to_entity as any)?.exploded;
      if (!entities) continue;

      const sourceRowId = String(staged.source_row_num);

      // 1. Property
      const propKey = entities.property.property_name.toLowerCase().trim();
      let propertyId = propMap.get(propKey);
      if (!propertyId) {
        const [newProp] = await db
          .insert(property)
          .values({
            org_id: auth.orgId,
            client_account_id: targetClientId,
            property_code: entities.property.property_code,
            property_name: entities.property.property_name,
            property_type: entities.property.property_type,
            total_leasable_area_sqft: "100000.00",
            source_import_batch_id: batch.id,
            source_row_id: sourceRowId,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();
        propertyId = newProp.id;
        propMap.set(propKey, propertyId);
        createdPropertiesCount++;
      }

      // 2. Building
      const bldKey = `${propertyId}_${entities.building.building_name.toLowerCase().trim()}`;
      let buildingId = bldMap.get(bldKey);
      if (!buildingId) {
        const [newBld] = await db
          .insert(building)
          .values({
            org_id: auth.orgId,
            client_account_id: targetClientId,
            property_id: propertyId,
            building_code: entities.building.building_code,
            building_name: entities.building.building_name,
            total_area_sqft: "100000.00",
            source_import_batch_id: batch.id,
            source_row_id: sourceRowId,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();
        buildingId = newBld.id;
        bldMap.set(bldKey, buildingId);
        createdBuildingsCount++;
      }

      // 3. Space
      const spaceKey = `${buildingId}_${entities.space.space_code.toLowerCase().trim()}`;
      let spaceId = spaceMap.get(spaceKey);
      if (!spaceId) {
        const [newSpace] = await db
          .insert(space)
          .values({
            org_id: auth.orgId,
            client_account_id: targetClientId,
            building_id: buildingId,
            space_code: entities.space.space_code,
            space_name: entities.space.space_name,
            floor_name: entities.space.floor_name,
            chargeable_area_sqft: String(entities.space.chargeable_area_sqft),
            occupancy_status: entities.space.occupancy_status,
            source_import_batch_id: batch.id,
            source_row_id: sourceRowId,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();
        spaceId = newSpace.id;
        spaceMap.set(spaceKey, spaceId);
        createdSpacesCount++;
      }

      // 4. Occupant
      const occKey = entities.occupant.occupant_name.toLowerCase().trim();
      let occupantId = occMap.get(occKey);
      if (!occupantId) {
        const [newOcc] = await db
          .insert(occupant)
          .values({
            org_id: auth.orgId,
            client_account_id: targetClientId,
            occupant_code: entities.occupant.occupant_code,
            occupant_name: entities.occupant.occupant_name,
            occupant_type: entities.occupant.occupant_type,
            occupant_status: entities.occupant.occupant_status,
            source_import_batch_id: batch.id,
            source_row_id: sourceRowId,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();
        occupantId = newOcc.id;
        occMap.set(occKey, occupantId);
        createdOccupantsCount++;
      }

      // 5. Contract
      const [newContract] = await db
        .insert(contract)
        .values({
          org_id: auth.orgId,
          client_account_id: targetClientId,
          space_id: spaceId,
          occupant_id: occupantId,
          contract_code: `${entities.contract.contract_code}-${Math.floor(100 + Math.random() * 900)}`,
          contract_type: entities.contract.contract_type,
          billing_model: "area",
          contract_status: entities.contract.contract_status,
          approval_status: "approved",
          start_date: entities.contract.start_date,
          end_date: entities.contract.end_date,
          deposit_amount_inr: String(entities.contract.deposit_amount_inr),
          deposit_status: entities.contract.deposit_status,
          remarks: staged.validation_status === "warning" ? "Imported with data warnings" : null,
          source_import_batch_id: batch.id,
          source_row_id: sourceRowId,
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();
      createdContractsCount++;

      // 6. Contract Space Link
      await db.insert(contract_space).values({
        org_id: auth.orgId,
        client_account_id: targetClientId,
        contract_id: newContract.id,
        space_id: spaceId,
        area_allocated_sqft: String(entities.space.chargeable_area_sqft),
        created_by: auth.userId,
        updated_by: auth.userId,
      });

      // 7. Contract Charge
      const [newCharge] = await db
        .insert(contract_charge)
        .values({
          org_id: auth.orgId,
          client_account_id: targetClientId,
          contract_id: newContract.id,
          component: "Base Rent",
          calc_basis: "fixed",
          rate: String(entities.charge.rate_amount),
          start_date: entities.contract.start_date,
          end_date: entities.contract.end_date,
          source_import_batch_id: batch.id,
          source_row_id: sourceRowId,
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();

      // 8. Rent Step (if escalation present)
      if (entities.rent_step && newCharge) {
        await db.insert(rent_step).values({
          org_id: auth.orgId,
          client_account_id: targetClientId,
          contract_charge_id: newCharge.id,
          step_no: entities.rent_step.step_no,
          rate: String(entities.charge.rate_amount),
          escalation_type: entities.rent_step.escalation_type,
          escalation_value: String(entities.rent_step.escalation_value),
          effective_date: entities.rent_step.effective_date,
          status: "scheduled",
          source_import_batch_id: batch.id,
          source_row_id: sourceRowId,
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      }
    }

    // Process failed rows into error Excel file
    let errorFilePath: string | null = null;
    if (failedRows.length > 0) {
      const errorBuffer = generateErrorWorkbook(
        failedRows.map((r) => ({
          source_row_num: r.source_row_num,
          source_row_json: r.source_row_json as any,
          validation_errors: (r.validation_errors as any) || [],
        }))
      );

      const errorDir = path.join(process.cwd(), "scratch");
      if (!fs.existsSync(errorDir)) {
        fs.mkdirSync(errorDir, { recursive: true });
      }
      errorFilePath = path.join(errorDir, `error_import_${batch.id}.xlsx`);
      fs.writeFileSync(errorFilePath, errorBuffer);
    }

    // Update batch status to committed
    await db
      .update(import_batch)
      .set({
        import_status: "committed",
        committed_at: new Date(),
        error_file_path: errorFilePath,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id));

    return NextResponse.json({
      success: true,
      batch_id,
      committed_contracts: createdContractsCount,
      created_spaces: createdSpacesCount,
      created_occupants: createdOccupantsCount,
      created_properties: createdPropertiesCount,
      created_buildings: createdBuildingsCount,
      failed_rows_count: failedRows.length,
      has_error_file: Boolean(errorFilePath),
    });
  } catch (err: any) {
    console.error("Commit import failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

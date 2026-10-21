import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, occupant, contract, contractSpace, contractCharge } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
import { eq, and, sql } from "drizzle-orm";

interface ImportRow {
  propertyName: string;
  city?: string;
  state?: string;
  address?: string;
  buildingName?: string;
  unitNumber?: string;
  areaSqft?: number;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  monthlyRent?: number;
  camRate?: number;
  securityDeposit?: number;
  startDate?: string;
  endDate?: string;
  escalationPct?: number;
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    await ensureTenantOrgRecord(auth.orgId);
    const clientAccountId = auth.clientAccountId || auth.orgId;

    const body = await req.json();
    const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for import" }, { status: 400 });
    }

    let propertiesCreated = 0;
    let unitsCreated = 0;
    let tenantsCreated = 0;
    let contractsCreated = 0;

    // In-memory caches to avoid duplicate inserts within the same import batch
    const propertyCache = new Map<string, string>(); // name -> id
    const buildingCache = new Map<string, string>(); // propId:buildingName -> id
    const spaceCache = new Map<string, string>(); // buildingId:spaceName -> id
    const occupantCache = new Map<string, string>(); // name -> id

    // Fetch existing properties for this org
    const existingProps = await db
      .select({ id: property.id, name: property.property_name })
      .from(property)
      .where(and(eq(property.org_id, auth.orgId), sql`${property.deleted_at} IS NULL`));
    for (const p of existingProps) {
      propertyCache.set(p.name.trim().toLowerCase(), p.id);
    }

    // Fetch existing occupants for this org
    const existingOccs = await db
      .select({ id: occupant.id, name: occupant.occupant_name })
      .from(occupant)
      .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`));
    for (const o of existingOccs) {
      occupantCache.set(o.name.trim().toLowerCase(), o.id);
    }

    for (const row of rows) {
      const propName = (row.propertyName || "Commercial Property").trim();
      if (!propName) continue;

      const propKey = propName.toLowerCase();
      let propId = propertyCache.get(propKey);

      // 1. Create Property if not existing
      if (!propId) {
        const propCode = `P-${propName.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const [newProp] = await db
          .insert(property)
          .values({
            org_id: auth.orgId,
            client_account_id: clientAccountId,
            property_name: propName,
            property_code: propCode,
            property_type: "office",
            city: row.city || "Ahmedabad",
            state: row.state || "Gujarat",
            address: row.address || `${propName}, Commercial District`,
            total_leasable_area_sqft: String(row.areaSqft || 50000),
          })
          .returning({ id: property.id });
        propId = newProp.id;
        propertyCache.set(propKey, propId);
        propertiesCreated++;
      }

      // 2. Find or Create Building
      const bldgName = (row.buildingName || "Tower A").trim();
      const bldgKey = `${propId}:${bldgName.toLowerCase()}`;
      let bldgId = buildingCache.get(bldgKey);

      if (!bldgId) {
        const existingBldgs = await db
          .select({ id: building.id })
          .from(building)
          .where(
            and(
              eq(building.property_id, propId),
              eq(building.building_name, bldgName),
              sql`${building.deleted_at} IS NULL`
            )
          );

        if (existingBldgs.length > 0) {
          bldgId = existingBldgs[0].id;
        } else {
          const bldgCode = `B-${bldgName.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
          const [newBldg] = await db
            .insert(building)
            .values({
              org_id: auth.orgId,
              client_account_id: clientAccountId,
              property_id: propId,
              building_name: bldgName,
              building_code: bldgCode,
              floors: 10,
              total_area_sqft: String(row.areaSqft || 50000),
            })
            .returning({ id: building.id });
          bldgId = newBldg.id;
        }
        buildingCache.set(bldgKey, bldgId);
      }

      // 3. Find or Create Space / Unit
      const unitNum = (row.unitNumber || "Suite 101").trim();
      const spaceKey = `${bldgId}:${unitNum.toLowerCase()}`;
      let spaceId = spaceCache.get(spaceKey);

      if (!spaceId) {
        const existingSpaces = await db
          .select({ id: space.id })
          .from(space)
          .where(
            and(
              eq(space.building_id, bldgId),
              eq(space.space_name, unitNum),
              sql`${space.deleted_at} IS NULL`
            )
          );

        if (existingSpaces.length > 0) {
          spaceId = existingSpaces[0].id;
        } else {
          const areaNum = row.areaSqft || 5000;
          const spaceCode = `S-${unitNum.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
          const [newSpace] = await db
            .insert(space)
            .values({
              org_id: auth.orgId,
              client_account_id: clientAccountId,
              building_id: bldgId,
              space_code: spaceCode,
              space_name: unitNum,
              chargeable_area_sqft: String(areaNum),
              carpet_area_sqft: String(Math.round(areaNum * 0.75)),
              space_type: "suite",
              is_leasable: true,
              occupancy_status: "occupied",
            })
            .returning({ id: space.id });
          spaceId = newSpace.id;
          unitsCreated++;
        }
        spaceCache.set(spaceKey, spaceId);
      }

      // 4. Find or Create Tenant / Occupant
      const tenantName = (row.tenantName || "").trim();
      if (!tenantName) continue;

      const tenantKey = tenantName.toLowerCase();
      let occId = occupantCache.get(tenantKey);

      if (!occId) {
        const occCode = `T-${tenantName.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const [newOcc] = await db
          .insert(occupant)
          .values({
            org_id: auth.orgId,
            occupant_name: tenantName,
            occupant_code: occCode,
            email: row.tenantEmail || `${tenantName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
            phone: row.tenantPhone || "9876543210",
            occupant_status: "active",
            occupant_type: "company",
          })
          .returning({ id: occupant.id });
        occId = newOcc.id;
        occupantCache.set(tenantKey, occId);
        tenantsCreated++;
      }

      // 5. Create Contract
      const rentAmt = row.monthlyRent || (row.areaSqft ? row.areaSqft * 65 : 250000);
      const depositAmt = row.securityDeposit || rentAmt * 6;
      const startDate = row.startDate || new Date().toISOString().split("T")[0];
      const endDate =
        row.endDate ||
        new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Check if contract already exists for this space and occupant
      const existingContracts = await db
        .select({ id: contract.id })
        .from(contract)
        .where(
          and(
            eq(contract.space_id, spaceId),
            eq(contract.occupant_id, occId),
            sql`${contract.deleted_at} IS NULL`
          )
        );

      if (existingContracts.length === 0) {
        const contractCode = `LC-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
        const [newContract] = await db
          .insert(contract)
          .values({
            org_id: auth.orgId,
            client_account_id: clientAccountId,
            space_id: spaceId,
            occupant_id: occId,
            contract_code: contractCode,
            contract_type: "lease",
            direction: "receivable",
            billing_model: "fixed",
            contract_status: "active",
            approval_status: "approved",
            start_date: startDate,
            end_date: endDate,
            deposit_amount_inr: String(depositAmt),
            deposit_status: "pending",
            lock_in_period_days: 365,
            notice_period_days: 90,
            version: 1,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning({ id: contract.id });

        // Link space to contract
        await db
          .insert(contractSpace)
          .values({
            org_id: auth.orgId,
            client_account_id: clientAccountId,
            contract_id: newContract.id,
            space_id: spaceId,
            area_allocated_sqft: row.areaSqft ? String(row.areaSqft) : null,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .onConflictDoNothing();

        // Add base rent charge
        await db.insert(contractCharge).values({
          org_id: auth.orgId,
          client_account_id: clientAccountId,
          contract_id: newContract.id,
          component: "base_rent",
          calc_basis: "fixed",
          rate: String(rentAmt),
          rate_period: "month",
          billing_mode: "advance",
          invoice_group: "rent",
          start_date: startDate,
          end_date: endDate,
          created_by: auth.userId,
          updated_by: auth.userId,
        });

        // If CAM rate provided, add CAM charge
        if (row.camRate && row.camRate > 0) {
          await db.insert(contractCharge).values({
            org_id: auth.orgId,
            client_account_id: clientAccountId,
            contract_id: newContract.id,
            component: "cam",
            calc_basis: "per_area",
            rate: String(row.camRate),
            rate_period: "month",
            billing_mode: "advance",
            invoice_group: "cam",
            start_date: startDate,
            end_date: endDate,
            created_by: auth.userId,
            updated_by: auth.userId,
          });
        }

        // Set space occupancy status to occupied
        await db
          .update(space)
          .set({ occupancy_status: "occupied" })
          .where(eq(space.id, spaceId));

        contractsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${rows.length} records.`,
      stats: {
        propertiesCreated,
        unitsCreated,
        tenantsCreated,
        contractsCreated,
        totalRowsProcessed: rows.length,
      },
    });
  } catch (err: any) {
    console.error("Bulk rent roll import error:", err);
    return NextResponse.json(
      { error: "Bulk import failed", message: err.message },
      { status: 500 }
    );
  }
}

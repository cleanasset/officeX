import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, occupant, contract, contractSpace, contractCharge } from "@/db/schema";
import { client_account } from "@/db/rent-roll-schema";
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

function parseStrictDate(val: any, fieldName: string): { date: string | null; error?: string } {
  if (!val) return { date: null, error: `${fieldName} is required` };
  if (val instanceof Date && !isNaN(val.getTime())) {
    return { date: val.toISOString().split("T")[0] };
  }
  const str = String(val).trim();
  if (str.length < 4 || /^[a-zA-Z\s]+$/.test(str)) {
    return { date: null, error: `Invalid date '${str}' for ${fieldName}` };
  }

  function isValidCalendar(y: number, m: number, d: number): boolean {
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return false;
    const testDate = new Date(Date.UTC(y, m - 1, d));
    return testDate.getUTCFullYear() === y && testDate.getUTCMonth() === m - 1 && testDate.getUTCDate() === d;
  }

  // ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (isValidCalendar(y, m, d)) {
      return { date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
    }
    return { date: null, error: `Invalid calendar date '${str}' for ${fieldName}` };
  }

  // DD/MM/YYYY or DD-MM-YYYY (Indian Standard)
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (isValidCalendar(y, m, d)) {
      return { date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
    }
    return { date: null, error: `Invalid calendar date '${str}' for ${fieldName}` };
  }

  // DD-MMM-YYYY (e.g. 01-Nov-2026)
  const monthNames: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const dmmmyMatch = str.match(/^(\d{1,2})[-/.\s]([A-Za-z]{3,9})[-/.\s](\d{4})$/);
  if (dmmmyMatch) {
    const d = parseInt(dmmmyMatch[1], 10);
    const mStr = dmmmyMatch[2].slice(0, 3).toLowerCase();
    const y = parseInt(dmmmyMatch[3], 10);
    const m = monthNames[mStr];
    if (m && isValidCalendar(y, m, d)) {
      return { date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
    }
    return { date: null, error: `Invalid calendar date '${str}' for ${fieldName}` };
  }

  return { date: null, error: `Unrecognized date format '${str}' for ${fieldName}. Please use DD/MM/YYYY or YYYY-MM-DD.` };
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const ensured = await ensureTenantOrgRecord(auth.orgId, auth.clientAccountId, auth.userEmail);
    const clientAccountId = ensured.clientAccountId || auth.clientAccountId || auth.orgId;

    // Explicitly guarantee client_account exists in PostgreSQL to satisfy FK constraint
    try {
      await db
        .insert(client_account)
        .values({
          id: clientAccountId,
          org_id: auth.orgId,
          client_name: "Primary Commercial Portfolio",
          client_code: `CLI-${auth.orgId.slice(0, 6).toUpperCase()}`,
          is_self: true,
        })
        .onConflictDoNothing();
    } catch {
      // ignore if already exists
    }

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

    const rowErrors: string[] = [];

    for (const row of rows) {
      try {
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
              carpet_area_sqft: null, // RR-32: Never invent 75%
              space_type: "suite",
              is_leasable: true,
              occupancy_status: "vacant",
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

      // RR-39: Field & Format Validations
      if (row.areaSqft !== undefined && (Number(row.areaSqft) <= 0 || Number(row.areaSqft) > 500000)) {
        rowErrors.push(`Row for '${tenantName}' rejected: Area (${row.areaSqft} sqft) must be between 1 and 500,000 sqft.`);
        continue;
      }
      if (row.monthlyRent !== undefined && Number(row.monthlyRent) < 0) {
        rowErrors.push(`Row for '${tenantName}' rejected: Monthly rent cannot be negative (${row.monthlyRent}).`);
        continue;
      }
      if (row.securityDeposit !== undefined && Number(row.securityDeposit) < 0) {
        rowErrors.push(`Row for '${tenantName}' rejected: Security deposit cannot be negative (${row.securityDeposit}).`);
        continue;
      }
      if (row.escalationPct !== undefined && (Number(row.escalationPct) < 0 || Number(row.escalationPct) > 50)) {
        rowErrors.push(`Row for '${tenantName}' rejected: Escalation rate (${row.escalationPct}%) must be between 0% and 50%.`);
        continue;
      }
      if (row.tenantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.tenantEmail.trim())) {
        rowErrors.push(`Row for '${tenantName}' rejected: Invalid tenant email '${row.tenantEmail}'.`);
        continue;
      }

      // RR-23, RR-25: Strict Date Validation
      const startRes = parseStrictDate(row.startDate, "start_date");
      if (startRes.error || !startRes.date) {
        rowErrors.push(`Row for '${tenantName}' rejected: ${startRes.error}`);
        continue;
      }
      const endRes = parseStrictDate(row.endDate, "end_date");
      if (endRes.error || !endRes.date) {
        rowErrors.push(`Row for '${tenantName}' rejected: ${endRes.error}`);
        continue;
      }
      if (endRes.date <= startRes.date) {
        rowErrors.push(`Row for '${tenantName}' rejected: End date (${endRes.date}) must be strictly after start date (${startRes.date}).`);
        continue;
      }
      const startDate = startRes.date;
      const endDate = endRes.date;

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
      // RR-24: Never invent rent as area * 65 or deposit as rent * 6
      const rentAmt = Number(row.monthlyRent) >= 0 ? Number(row.monthlyRent) : 0;
      const depositAmt = Number(row.securityDeposit) >= 0 ? Number(row.securityDeposit) : 0;

      // RR-11: Check for overlapping contracts on this space
      const overlapping = await db
        .select({ id: contract.id, contract_code: contract.contract_code, start_date: contract.start_date, end_date: contract.end_date })
        .from(contract)
        .where(
          and(
            eq(contract.space_id, spaceId),
            eq(contract.org_id, auth.orgId),
            sql`${contract.deleted_at} IS NULL`,
            sql`${contract.contract_status} IN ('active', 'future')`,
            sql`${contract.start_date} <= ${endDate}`,
            sql`${contract.end_date} >= ${startDate}`
          )
        );

      if (overlapping.length > 0) {
        rowErrors.push(`Row for '${tenantName}' in '${unitNum}' rejected: Overlaps with existing lease ${overlapping[0].contract_code} (${overlapping[0].start_date} to ${overlapping[0].end_date}).`);
        continue;
      }

      // Check if exact contract already exists for this space and occupant
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
        const todayStr = new Date().toISOString().split("T")[0];
        const isCurrentlyActive = startDate <= todayStr;
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
            contract_status: isCurrentlyActive ? "active" : "future",
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

        // Set space occupancy status only if lease is currently active
        if (isCurrentlyActive) {
          await db
            .update(space)
            .set({ occupancy_status: "occupied" })
            .where(eq(space.id, spaceId));
        }

        contractsCreated++;
      }
    } catch (rowErr: any) {
      console.error("Bulk import row error for row:", row?.tenantName || row?.propertyName, rowErr);
      rowErrors.push(rowErr?.message || "Failed to process row");
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
      warnings: rowErrors.length > 0 ? rowErrors : undefined,
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

import { NextResponse } from "next/server";
import { db } from "@/db";
import { space, building, property } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * RR-CONT-11, §S-13: Spaces CRUD
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("building_id");
    const occupancyStatus = searchParams.get("occupancy_status");

    const conditions = [
      eq(space.org_id, auth.orgId),
      sql`${space.deleted_at} IS NULL`,
    ];
    if (buildingId) conditions.push(eq(space.building_id, buildingId));
    if (occupancyStatus) conditions.push(eq(space.occupancy_status, occupancyStatus as any));
    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(space.client_account_id, auth.clientAccountId));
    }

    const list = await db
      .select({
        space: space,
        building_name: building.building_name,
        property_name: property.property_name,
      })
      .from(space)
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...conditions))
      .orderBy(desc(space.created_at));

    return NextResponse.json({
      success: true,
      data: list.map(l => {
        let meta: any = {};
        if (l.space.source_row_id && typeof l.space.source_row_id === "string" && l.space.source_row_id.startsWith("{")) {
          try {
            meta = JSON.parse(l.space.source_row_id);
          } catch {}
        }
        return {
          ...l.space,
          building_name: l.building_name,
          property_name: l.property_name,
          fitout_condition: meta.fitout_condition || "Fully Furnished",
          workstations_count: meta.workstations_count || null,
          cabins_count: meta.cabins_count || null,
          standard_rate_psf: meta.standard_rate_psf || null,
        };
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch spaces", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const VALID_SPACE_TYPES = ["entire_building", "floor", "wing", "suite", "cabin", "desk", "parking"];

    // Check if batch/array insertion was requested
    const rawItems: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.spaces)
      ? body.spaces.map((sp: any) => ({
          ...sp,
          building_id: sp.building_id || body.building_id,
          floor_name: sp.floor_name || body.floor_name,
          org_id: sp.org_id || body.org_id,
          client_account_id: sp.client_account_id || body.client_account_id,
        }))
      : [body];

    const insertedSpaces: any[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const spaceName = (item.space_name || item.name || `Unit ${i + 1}`).trim();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const spaceCode = item.space_code || `SP-${Date.now().toString().slice(-4)}-${i + 1}`;

      const payload = {
        ...item,
        org_id: item.org_id || auth.orgId,
        client_account_id: item.client_account_id || auth.clientAccountId,
        building_id: item.building_id,
        space_code: spaceCode,
        space_name: spaceName,
        chargeable_area_sqft: item.chargeable_area_sqft || item.area_sqft || item.area || "1000",
        is_leasable: item.is_leasable ?? true,
        occupancy_status: (item.occupancy_status || "vacant").toLowerCase().includes("occup") ? "occupied" : "vacant",
      };

      const reqVal = validateRequiredFields("space", payload);
      if (!reqVal.isValid) {
        return NextResponse.json({ error: `Validation failed for space "${spaceName}"`, details: reqVal.errors }, { status: 422 });
      }

      let normalizedSpaceType: any = "suite";
      if (item.space_type || item.unit_type) {
        const st = String(item.space_type || item.unit_type).toLowerCase().trim();
        if (VALID_SPACE_TYPES.includes(st)) {
          normalizedSpaceType = st;
        } else if (st === "office" || st === "unit" || st === "shop" || st === "room" || st === "commercial" || st.includes("suite")) {
          normalizedSpaceType = "suite";
        } else if (st.includes("desk") || st.includes("cowork") || st.includes("workstation")) {
          normalizedSpaceType = "desk";
        } else if (st.includes("cabin")) {
          normalizedSpaceType = "cabin";
        } else if (st.includes("floor")) {
          normalizedSpaceType = "floor";
        } else if (st.includes("building")) {
          normalizedSpaceType = "entire_building";
        }
      }

      const cleanCarpet =
        item.carpet_area_sqft !== undefined &&
        item.carpet_area_sqft !== null &&
        String(item.carpet_area_sqft).trim() !== "" &&
        !isNaN(Number(item.carpet_area_sqft))
          ? String(item.carpet_area_sqft).trim()
          : null;

      const cleanChargeable =
        payload.chargeable_area_sqft !== undefined &&
        payload.chargeable_area_sqft !== null &&
        String(payload.chargeable_area_sqft).trim() !== "" &&
        !isNaN(Number(payload.chargeable_area_sqft))
          ? String(payload.chargeable_area_sqft).trim()
          : "1000";

      const [inserted] = await db
        .insert(space)
        .values({
          org_id: payload.org_id,
          client_account_id: payload.client_account_id,
          building_id: payload.building_id,
          space_code: payload.space_code,
          space_name: payload.space_name,
          floor_name: item.floor_name || item.floor_label || null,
          space_type: normalizedSpaceType,
          chargeable_area_sqft: cleanChargeable,
          carpet_area_sqft: cleanCarpet,
          area_unit: item.area_unit || "sqft",
          is_leasable: payload.is_leasable,
          occupancy_status: payload.occupancy_status,
          source_row_id: JSON.stringify({
            fitout_condition: item.fitout_condition || item.fitout || "Fully Furnished",
            workstations_count: item.workstations_count ?? item.workstations ?? null,
            cabins_count: item.cabins_count ?? item.cabins ?? null,
            standard_rate_psf: item.standard_rate_psf ?? item.rate_per_sqft ?? item.rate_psf ?? null,
          }),
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();

      insertedSpaces.push(inserted);
    }

    if (rawItems.length === 1 && !Array.isArray(body) && !Array.isArray(body.spaces)) {
      return NextResponse.json({ success: true, data: insertedSpaces[0] }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      count: insertedSpaces.length,
      data: insertedSpaces,
      message: `Successfully created ${insertedSpaces.length} unit(s)`
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create space", message: err.message }, { status: 500 });
  }
}

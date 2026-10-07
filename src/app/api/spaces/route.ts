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
      data: list.map(l => ({
        ...l.space,
        building_name: l.building_name,
        property_name: l.property_name,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch spaces", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const payload = {
      ...body,
      org_id: body.org_id || auth.orgId,
      client_account_id: body.client_account_id || auth.clientAccountId,
      building_id: body.building_id,
      space_code: body.space_code,
      space_name: body.space_name,
      chargeable_area_sqft: body.chargeable_area_sqft,
      is_leasable: body.is_leasable ?? true,
      occupancy_status: body.occupancy_status || "vacant",
    };

    const reqVal = validateRequiredFields("space", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(space)
      .values({
        org_id: payload.org_id,
        client_account_id: payload.client_account_id,
        building_id: payload.building_id,
        space_code: payload.space_code,
        space_name: payload.space_name,
        floor_name: body.floor_name || body.floor_label || null,
        space_type: body.space_type || "suite",
        chargeable_area_sqft: String(payload.chargeable_area_sqft),
        carpet_area_sqft: body.carpet_area_sqft ? String(body.carpet_area_sqft) : null,
        area_unit: body.area_unit || "sqft",
        is_leasable: payload.is_leasable,
        occupancy_status: payload.occupancy_status,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create space", message: err.message }, { status: 500 });
  }
}

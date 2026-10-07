import { NextResponse } from "next/server";
import { db } from "@/db";
import { building, property } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * RR-CONT-11, §S-12: Buildings CRUD
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");

    const conditions = [
      eq(building.org_id, auth.orgId),
      sql`${building.deleted_at} IS NULL`,
    ];
    if (propertyId) conditions.push(eq(building.property_id, propertyId));
    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(building.client_account_id, auth.clientAccountId));
    }

    const list = await db
      .select({
        building: building,
        property_name: property.property_name,
      })
      .from(building)
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...conditions))
      .orderBy(desc(building.created_at));

    return NextResponse.json({ success: true, data: list.map(l => ({ ...l.building, property_name: l.property_name })) });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch buildings", message: err.message }, { status: 500 });
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
      building_name: body.building_name,
      building_code: body.building_code,
      property_id: body.property_id,
    };

    const reqVal = validateRequiredFields("building", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(building)
      .values({
        org_id: payload.org_id,
        client_account_id: payload.client_account_id,
        property_id: payload.property_id,
        building_name: payload.building_name,
        building_code: payload.building_code,
        floors: body.floors ? Number(body.floors) : body.floors_count ? Number(body.floors_count) : null,
        total_area_sqft: body.total_area_sqft ? String(body.total_area_sqft) : null,
        total_seats: body.total_seats ? Number(body.total_seats) : null,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create building", message: err.message }, { status: 500 });
  }
}

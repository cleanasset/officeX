import { NextResponse } from "next/server";
import { db } from "@/db";
import { space, building, property } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("building_id");

    const conditions = [
      eq(space.org_id, auth.orgId),
      sql`${space.deleted_at} IS NULL`,
    ];
    if (buildingId) conditions.push(eq(space.building_id, buildingId));

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
      data: list.map((l) => ({
        ...l.space,
        building_name: l.building_name,
        property_name: l.property_name,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch spaces", message: err.message },
      { status: 500 }
    );
  }
}

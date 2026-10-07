import { NextResponse } from "next/server";
import { db } from "@/db";
import { building } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [b] = await db
      .select()
      .from(building)
      .where(and(eq(building.id, id), eq(building.org_id, auth.orgId), sql`${building.deleted_at} IS NULL`));

    if (!b) return NextResponse.json({ error: "Building not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: b });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch building", message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(building)
      .set({
        building_name: body.building_name,
        floors: body.floors !== undefined ? Number(body.floors) : body.floors_count !== undefined ? Number(body.floors_count) : undefined,
        total_area_sqft: body.total_area_sqft !== undefined ? String(body.total_area_sqft) : undefined,
        total_seats: body.total_seats !== undefined ? Number(body.total_seats) : undefined,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(building.id, id), eq(building.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update building", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    await db
      .update(building)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(building.id, id), eq(building.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Building deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete building", message: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { property } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [p] = await db
      .select()
      .from(property)
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId), sql`${property.deleted_at} IS NULL`));

    if (!p) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: p });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch property", message: err.message }, { status: 500 });
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
      .update(property)
      .set({
        property_name: body.property_name,
        address: body.address,
        city: body.city,
        state: body.state,
        total_leasable_area_sqft: body.total_leasable_area_sqft ? String(body.total_leasable_area_sqft) : undefined,
        total_leasable_seats: body.total_leasable_seats !== undefined ? Number(body.total_leasable_seats) : undefined,
        property_type: body.property_type,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update property", message: err.message }, { status: 500 });
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
      .update(property)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Property deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete property", message: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, properties } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [p] = await db.select().from(properties).where(eq(properties.id, id));
    if (p) return NextResponse.json(p);

    const auth = getAuthContext(req);
    const [rrP] = await db
      .select()
      .from(property)
      .where(and(eq(property.id, id), sql`${property.deleted_at} IS NULL`));
    if (rrP) return NextResponse.json(rrP);

    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch property", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    // 1. Soft-delete property in Rent Roll master
    await db
      .update(property)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(eq(property.id, id));

    // 2. Cascade delete buildings and spaces
    const bldgs = await db
      .select({ id: building.id })
      .from(building)
      .where(eq(building.property_id, id));

    if (bldgs.length > 0) {
      const bldgIds = bldgs.map((b) => b.id);
      await db
        .update(building)
        .set({ deleted_at: new Date(), updated_by: auth.userId })
        .where(eq(building.property_id, id));

      await db
        .update(space)
        .set({ deleted_at: new Date(), updated_by: auth.userId })
        .where(inArray(space.building_id, bldgIds));
    }

    // 3. Also delete from marketplace / SaaS properties table if present
    try {
      await db.delete(properties).where(eq(properties.id, id));
    } catch {}

    return NextResponse.json({ success: true, message: "Property deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete property", message: err.message }, { status: 500 });
  }
}

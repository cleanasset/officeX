import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, properties } from "@/db/schema";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: "Authentication required to access property details" },
        { status: 401 }
      );
    }

    const auth = getAuthContext(req);
    const { id } = await params;

    const [p] = await db.select().from(properties).where(eq(properties.id, id));
    if (p) {
      const isOwnerOrAdmin = auth.isSuperAdmin || (p.orgId && p.orgId === auth.orgId) || (p.ownerUserId && p.ownerUserId === auth.userId);
      if (!isOwnerOrAdmin) {
        return NextResponse.json({ error: "Access denied to this property" }, { status: 403 });
      }
      return NextResponse.json(p);
    }

    const [rrP] = await db
      .select()
      .from(property)
      .where(and(eq(property.id, id), sql`${property.deleted_at} IS NULL`));

    if (rrP) {
      // Validate that the caller has access to this property's organization
      const isOwnerOrAdmin =
        auth.isSuperAdmin ||
        rrP.org_id === auth.orgId;

      if (!isOwnerOrAdmin) {
        return NextResponse.json({ error: "Access denied to this property" }, { status: 403 });
      }

      return NextResponse.json(rrP);
    }

    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  } catch (err: any) {
    console.error("Error fetching property:", err);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: "Authentication required to delete property" },
        { status: 401 }
      );
    }

    const auth = getAuthContext(req);
    const { id } = await params;

    // Verify ownership before deleting
    const [existing] = await db
      .select({ id: property.id, org_id: property.org_id })
      .from(property)
      .where(and(eq(property.id, id), sql`${property.deleted_at} IS NULL`));

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwnerOrAdmin =
      auth.isSuperAdmin ||
      existing.org_id === auth.orgId;

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Access denied to delete this property" }, { status: 403 });
    }

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
    console.error("Error deleting property:", err);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

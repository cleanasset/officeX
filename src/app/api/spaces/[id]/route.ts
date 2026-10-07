import { NextResponse } from "next/server";
import { db } from "@/db";
import { space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [sp] = await db
      .select()
      .from(space)
      .where(and(eq(space.id, id), eq(space.org_id, auth.orgId), sql`${space.deleted_at} IS NULL`));

    if (!sp) return NextResponse.json({ error: "Space not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: sp });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch space", message: err.message }, { status: 500 });
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
      .update(space)
      .set({
        space_name: body.space_name,
        chargeable_area_sqft: body.chargeable_area_sqft !== undefined ? String(body.chargeable_area_sqft) : undefined,
        carpet_area_sqft: body.carpet_area_sqft !== undefined ? String(body.carpet_area_sqft) : undefined,
        occupancy_status: body.occupancy_status,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(space.id, id), eq(space.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update space", message: err.message }, { status: 500 });
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
      .update(space)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(space.id, id), eq(space.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Space deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete space", message: err.message }, { status: 500 });
  }
}

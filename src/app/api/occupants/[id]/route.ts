import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [occ] = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`));

    if (!occ) return NextResponse.json({ error: "Occupant not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: occ });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch occupant", message: err.message }, { status: 500 });
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
      .update(occupant)
      .set({
        occupant_name: body.occupant_name,
        occupant_type: body.occupant_type,
        pan_number: body.pan_number || body.pan,
        gst_number: body.gst_number || body.gstin,
        address: body.address,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        email: body.email,
        phone: body.phone,
        industry_sector: body.industry_sector || body.industry,
        is_critical_occupant: body.is_critical_occupant,
        occupant_status: body.occupant_status,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update occupant", message: err.message }, { status: 500 });
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
      .update(occupant)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Occupant deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete occupant", message: err.message }, { status: 500 });
  }
}

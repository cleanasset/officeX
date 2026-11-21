import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant } from "@/db/schema";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    const { id } = await params;

    const [occ] = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`));

    if (!occ) return NextResponse.json({ error: "Occupant not found" }, { status: 404 });

    // Strict occupant isolation (§3.3 & §7.3)
    if (auth.role === "occupant" || auth.role === "tenant") {
      const isSelf = occ.id === auth.userId || Boolean(auth.userEmail && occ.email && occ.email.toLowerCase() === auth.userEmail.toLowerCase());
      if (!isSelf) {
        return NextResponse.json({ error: "Access denied to this occupant profile" }, { status: 403 });
      }
    }

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
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`));

    if (!existing) {
      return NextResponse.json({ error: "Occupant not found" }, { status: 404 });
    }

    const isTenant = auth.role === "occupant" || auth.role === "tenant";
    if (isTenant) {
      const isSelf = existing.id === auth.userId || Boolean(auth.userEmail && existing.email && existing.email.toLowerCase() === auth.userEmail.toLowerCase());
      if (!isSelf) {
        return NextResponse.json({ error: "Access denied: Tenants cannot modify other occupant profiles" }, { status: 403 });
      }
    }

    const updateFields: any = {
      updated_by: auth.userId,
      updated_at: new Date(),
    };

    if (body.address !== undefined) updateFields.address = body.address;
    if (body.city !== undefined) updateFields.city = body.city;
    if (body.state !== undefined) updateFields.state = body.state;
    if (body.postal_code !== undefined) updateFields.postal_code = body.postal_code;
    if (body.email !== undefined) updateFields.email = body.email;
    if (body.phone !== undefined) updateFields.phone = body.phone;

    // Landlord / Management only fields
    if (!isTenant) {
      if (body.occupant_name !== undefined) updateFields.occupant_name = body.occupant_name;
      if (body.occupant_type !== undefined) updateFields.occupant_type = body.occupant_type;
      if (body.pan_number || body.pan) updateFields.pan_number = body.pan_number || body.pan;
      if (body.gst_number || body.gstin) updateFields.gst_number = body.gst_number || body.gstin;
      if (body.industry_sector || body.industry) updateFields.industry_sector = body.industry_sector || body.industry;
      if (body.is_critical_occupant !== undefined) updateFields.is_critical_occupant = body.is_critical_occupant;
      if (body.occupant_status !== undefined) updateFields.occupant_status = body.occupant_status;
    }

    const [updated] = await db
      .update(occupant)
      .set(updateFields)
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
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot delete occupant records" }, { status: 403 });
    }

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

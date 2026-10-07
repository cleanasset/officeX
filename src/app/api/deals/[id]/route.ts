import { NextResponse } from "next/server";
import { db } from "@/db";
import { deal } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [d] = await db
      .select()
      .from(deal)
      .where(and(eq(deal.id, id), eq(deal.org_id, auth.orgId), sql`${deal.deleted_at} IS NULL`));

    if (!d) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: d });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch deal", message: err.message }, { status: 500 });
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
      .update(deal)
      .set({
        deal_name: body.deal_name,
        deal_stage: body.deal_stage,
        probability_percent: body.probability_percent,
        estimated_rent_inr: body.estimated_rent_inr || body.target_rent ? String(body.estimated_rent_inr || body.target_rent) : undefined,
        estimated_area_sqft: body.estimated_area_sqft || body.target_area_sqft ? String(body.estimated_area_sqft || body.target_area_sqft) : undefined,
        estimated_start_date: body.estimated_start_date,
        estimated_end_date: body.estimated_end_date,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(deal.id, id), eq(deal.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update deal", message: err.message }, { status: 500 });
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
      .update(deal)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(deal.id, id), eq(deal.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Deal deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete deal", message: err.message }, { status: 500 });
  }
}

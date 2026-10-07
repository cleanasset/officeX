import { NextResponse } from "next/server";
import { db } from "@/db";
import { deal, space, occupant } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

/**
 * RR-CONT-15, §S-18: Deals Register CRUD
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");

    const conditions = [
      eq(deal.org_id, auth.orgId),
      sql`${deal.deleted_at} IS NULL`,
    ];
    if (stage) conditions.push(eq(deal.deal_stage, stage as any));
    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(deal.client_account_id, auth.clientAccountId));
    }

    const list = await db
      .select({
        deal: deal,
        space_name: space.space_name,
        space_code: space.space_code,
        occupant_name: occupant.occupant_name,
      })
      .from(deal)
      .leftJoin(space, eq(deal.space_id, space.id))
      .leftJoin(occupant, eq(deal.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(desc(deal.created_at));

    return NextResponse.json({
      success: true,
      data: list.map(l => ({
        ...l.deal,
        space_name: l.space_name,
        space_code: l.space_code,
        occupant_name: l.occupant_name,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch deals", message: err.message }, { status: 500 });
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
      deal_code: body.deal_code,
      deal_name: body.deal_name,
      deal_stage: body.deal_stage || "lead",
      probability_percent: body.probability_percent ?? 50,
    };

    const reqVal = validateRequiredFields("deal", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(deal)
      .values({
        org_id: payload.org_id,
        client_account_id: payload.client_account_id,
        deal_code: payload.deal_code,
        deal_name: payload.deal_name,
        deal_stage: payload.deal_stage,
        probability_percent: payload.probability_percent,
        space_id: body.space_id || null,
        occupant_id: body.occupant_id || null,
        estimated_area_sqft: body.estimated_area_sqft || body.target_area_sqft ? String(body.estimated_area_sqft || body.target_area_sqft) : null,
        estimated_rent_inr: body.estimated_rent_inr || body.target_rent ? String(body.estimated_rent_inr || body.target_rent) : null,
        estimated_start_date: body.estimated_start_date || null,
        estimated_end_date: body.estimated_end_date || null,
        owner_comment: body.owner_comment || null,
        leasing_manager_comment: body.leasing_manager_comment || body.broker_name || null,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create deal", message: err.message }, { status: 500 });
  }
}

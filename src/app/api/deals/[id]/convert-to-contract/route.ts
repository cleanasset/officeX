import { NextResponse } from "next/server";
import { db } from "@/db";
import { deal, contract, space, occupant } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-15: Convert Deal to Contract (No re-keying, UAT-61)
 * - Allowed from stages: loi, agreement_drafting, won
 * - Creates pre-filled contract draft
 * - Links deal.contract_id and updates deal.deal_stage = 'won'
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [d] = await db
      .select({
        deal: deal,
        space: space,
        occupant: occupant,
      })
      .from(deal)
      .leftJoin(space, eq(deal.space_id, space.id))
      .leftJoin(occupant, eq(deal.occupant_id, occupant.id))
      .where(
        and(
          eq(deal.id, id),
          eq(deal.org_id, auth.orgId),
          sql`${deal.deleted_at} IS NULL`
        )
      );

    if (!d) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const eligibleStages = ["loi", "agreement_drafting", "won"];
    if (!eligibleStages.includes(d.deal.deal_stage)) {
      return NextResponse.json(
        {
          error: `Cannot convert deal in '${d.deal.deal_stage}' stage. Deal must be in LOI, Agreement Drafting, or Won stage.`,
        },
        { status: 400 }
      );
    }

    // Prepare dates
    const startDate = d.deal.estimated_start_date || new Date().toISOString().split("T")[0];
    let endDate = d.deal.estimated_end_date;
    if (!endDate) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + 36);
      endDate = end.toISOString().split("T")[0];
    }

    const contractCode = `CTR-${d.deal.deal_code.replace(/^DL-?/, "")}`;

    // Pre-filled contract template payload (without re-keying)
    const contractPayload = {
      org_id: d.deal.org_id,
      client_account_id: d.deal.client_account_id,
      contract_code: contractCode,
      contract_type: "lease" as const,
      direction: "receivable" as const,
      billing_model: "area" as const,
      contract_status: "draft" as const,
      approval_status: "draft" as const,
      occupant_id: d.deal.occupant_id || (d.occupant ? d.occupant.id : null)!,
      space_id: d.deal.space_id || (d.space ? d.space.id : null)!,
      start_date: startDate,
      end_date: endDate,
      lock_in_period_days: 365,
      notice_period_days: 90,
      remarks: `Converted from deal ${d.deal.deal_code} (${d.deal.deal_name})`,
      created_by: auth.userId,
      updated_by: auth.userId,
      version: 1,
    };

    // If deal occupant or space is missing, return prefill configuration for wizard
    if (!contractPayload.occupant_id || !contractPayload.space_id) {
      return NextResponse.json({
        success: true,
        message: "Deal requires occupant or space selection. Pre-filled wizard payload generated.",
        prefill: {
          ...contractPayload,
          deal_id: d.deal.id,
          estimated_rent_inr: d.deal.estimated_rent_inr,
          estimated_area_sqft: d.deal.estimated_area_sqft,
        },
      });
    }

    // Insert draft contract
    const [createdContract] = await db
      .insert(contract)
      .values(contractPayload)
      .returning();

    // Update deal stage to won and link contract_id
    await db
      .update(deal)
      .set({
        deal_stage: "won",
        probability_percent: 100,
        contract_id: createdContract.id,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(deal.id, id));

    return NextResponse.json({
      success: true,
      message: "Deal converted to contract draft successfully with no re-keying.",
      contract: createdContract,
      deal_id: d.deal.id,
    });
  } catch (err: any) {
    console.error("Error converting deal to contract:", err);
    return NextResponse.json(
      { error: "Failed to convert deal to contract", message: err.message },
      { status: 500 }
    );
  }
}

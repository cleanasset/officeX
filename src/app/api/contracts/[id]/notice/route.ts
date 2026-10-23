import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/contracts/[id]/notice
 * Action: Serve Notice (Screen S-22 & §4.13)
 * Transitions contract_status to 'notice_served' and sets proposed vacate date.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const {
      notice_date = new Date().toISOString().split("T")[0],
      vacate_date,
      notice_reason = "lease_expiry",
      initiated_by = "tenant",
      penalty_amount = "0.00",
      remarks = "",
    } = body;

    // Fetch existing contract
    const [existing] = await db
      .select()
      .from(contract)
      .where(
        and(
          eq(contract.id, id),
          eq(contract.org_id, auth.orgId),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (existing.contract_status !== "active" && existing.contract_status !== "holding_over") {
      return NextResponse.json(
        { error: `Cannot serve notice on contract with status: ${existing.contract_status}` },
        { status: 400 }
      );
    }

    // Default vacate date based on notice_period_days if not specified
    const targetVacateDate =
      vacate_date ||
      (() => {
        const d = new Date(notice_date);
        const days = existing.notice_period_days || 90;
        d.setDate(d.getDate() + days);
        return d.toISOString().split("T")[0];
      })();

    // Update contract status to notice_served
    const noticeRemarks = `[Notice Served on ${notice_date}] Initiated by: ${initiated_by}. Reason: ${notice_reason}. Vacate target: ${targetVacateDate}.${
      remarks ? ` Note: ${remarks}` : ""
    }`;

    const [updated] = await db
      .update(contract)
      .set({
        contract_status: "notice_served",
        end_date: targetVacateDate,
        remarks: existing.remarks
          ? `${existing.remarks}\n${noticeRemarks}`
          : noticeRemarks,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Notice successfully served. Contract ${existing.contract_code} status transitioned to 'notice_served'. Proposed vacate date: ${targetVacateDate}.`,
      contract: updated,
    });
  } catch (error: any) {
    console.error("POST /api/contracts/[id]/notice error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to serve notice" },
      { status: 500 }
    );
  }
}

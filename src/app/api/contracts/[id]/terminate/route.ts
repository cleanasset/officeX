import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/contracts/[id]/terminate
 * Action: Surrender / Terminate Space (Screen S-22 & §4.13)
 * Transitions contract_status to 'terminated', frees the space (occupancy_status='vacant'),
 * and records handover/dilapidations.
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
      termination_date = new Date().toISOString().split("T")[0],
      reason = "early_surrender",
      dilapidations_amount = "0.00",
      deposit_adjustment_notes = "",
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

    if (existing.contract_status === "terminated") {
      return NextResponse.json(
        { error: "Contract is already terminated." },
        { status: 400 }
      );
    }

    const terminationRemarks = `[Contract Terminated / Surrendered on ${termination_date}] Reason: ${reason}. Dilapidations charged: ₹${dilapidations_amount}.${
      deposit_adjustment_notes ? ` Deposit adjustment: ${deposit_adjustment_notes}.` : ""
    }${remarks ? ` Notes: ${remarks}` : ""}`;

    // 1. Transition contract to terminated
    const [updated] = await db
      .update(contract)
      .set({
        contract_status: "terminated",
        end_date: termination_date,
        remarks: existing.remarks
          ? `${existing.remarks}\n${terminationRemarks}`
          : terminationRemarks,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    // 2. Free demised space back to vacant status
    if (existing.space_id) {
      await db
        .update(space)
        .set({ occupancy_status: "vacant" })
        .where(eq(space.id, existing.space_id));
    }

    return NextResponse.json({
      success: true,
      message: `Contract ${existing.contract_code} terminated and demised space released back to 'vacant'.`,
      contract: updated,
    });
  } catch (error: any) {
    console.error("POST /api/contracts/[id]/terminate error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to terminate contract" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentStep } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * Screen S-25: Postpone or Waive Escalation Step
 * - Action: Postpone (defer to new date) or Waive (set 0% increase with reason)
 * - §2.4 & RR-CONT-07: Mandatory audit reason required
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const { action = "postpone", new_effective_date, reason } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Mandatory audit reason required (minimum 5 characters)." },
        { status: 400 }
      );
    }

    const [step] = await db
      .select()
      .from(rentStep)
      .where(
        and(
          eq(rentStep.id, id),
          eq(rentStep.org_id, auth.orgId),
          sql`${rentStep.deleted_at} IS NULL`
        )
      );

    if (!step) {
      return NextResponse.json({ error: "Escalation step not found" }, { status: 404 });
    }

    if (action === "postpone") {
      if (!new_effective_date) {
        return NextResponse.json(
          { error: "New effective date is required when postponing." },
          { status: 400 }
        );
      }

      const [updated] = await db
        .update(rentStep)
        .set({
          effective_date: new_effective_date,
          status: "scheduled",
          updated_by: auth.userId,
          updated_at: new Date(),
        })
        .where(eq(rentStep.id, id))
        .returning();

      console.log(`[AUDIT] Step ${id} postponed to ${new_effective_date} by ${auth.userId}. Reason: ${reason}`);

      return NextResponse.json({
        success: true,
        message: `Escalation postponed to ${new_effective_date}. Audit trail recorded.`,
        step: updated,
      });
    } else if (action === "waive") {
      const [updated] = await db
        .update(rentStep)
        .set({
          status: "pending_resolution",
          escalation_value: "0.00",
          updated_by: auth.userId,
          updated_at: new Date(),
        })
        .where(eq(rentStep.id, id))
        .returning();

      console.log(`[AUDIT] Step ${id} waived by ${auth.userId}. Reason: ${reason}`);

      return NextResponse.json({
        success: true,
        message: `Escalation uplift waived for current period. Audit trail recorded.`,
        step: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error postponing/waiving escalation:", err);
    return NextResponse.json(
      { error: "Failed to update escalation", message: err.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentStep, contractCharge } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { inArray, and, eq, sql } from "drizzle-orm";

/**
 * Screen S-25: Bulk Apply Escalations API
 * Action: [Apply selected -> approval]
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { step_ids = [] } = body;

    const allowedRoles = ["finance", "asset_manager", "owner", "super_admin"];
    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json(
        { error: "Access denied: Only Finance users or Asset Managers can bulk approve escalations." },
        { status: 403 }
      );
    }

    if (!Array.isArray(step_ids) || step_ids.length === 0) {
      return NextResponse.json(
        { error: "At least one step ID must be provided." },
        { status: 400 }
      );
    }

    const stepsToApply = await db
      .select()
      .from(rentStep)
      .where(
        and(
          inArray(rentStep.id, step_ids),
          eq(rentStep.org_id, auth.orgId),
          sql`${rentStep.deleted_at} IS NULL`
        )
      );

    let appliedCount = 0;

    for (const step of stepsToApply) {
      if (step.status === "applied") continue;

      let appliedRate = step.rate;
      if (step.contract_charge_id) {
        const [charge] = await db
          .select()
          .from(contractCharge)
          .where(eq(contractCharge.id, step.contract_charge_id));

        if (charge) {
          const oldRate = parseFloat(charge.rate || "0");
          if (step.escalation_type === "percentage") {
            const pct = step.escalation_value ? parseFloat(step.escalation_value) : 5;
            appliedRate = String(Math.round(oldRate * (1 + pct / 100) * 100) / 100);
          } else if (step.escalation_type === "fixed_amount") {
            const inc = step.escalation_value ? parseFloat(step.escalation_value) : 0;
            appliedRate = String(oldRate + inc);
          }

          await db
            .update(contractCharge)
            .set({
              rate: appliedRate,
              updated_by: auth.userId,
              updated_at: new Date(),
            })
            .where(eq(contractCharge.id, step.contract_charge_id));
        }
      }

      await db
        .update(rentStep)
        .set({
          status: "applied",
          rate: appliedRate,
          applied_at: new Date(),
          applied_by: auth.userId,
          updated_by: auth.userId,
          updated_at: new Date(),
        })
        .where(eq(rentStep.id, step.id));

      appliedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully applied ${appliedCount} escalation step(s). Contract charges updated.`,
      applied_count: appliedCount,
    });
  } catch (err: any) {
    console.error("Bulk apply escalation error:", err);
    return NextResponse.json(
      { error: "Failed to bulk apply escalations", message: err.message },
      { status: 500 }
    );
  }
}

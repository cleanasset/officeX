import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentStep, contractCharge } from "@/db/schema";
import { validateEscalationApplication } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-07, §5.7: Apply Escalation Step
 * - Role: Finance user or super_admin/owner only
 * - Rule 8: Escalation can't be applied retroactively (effective_date >= today)
 * - Updates rent step to 'applied' and updates base contract_charge rate
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    // 1. Role check: Finance, Owner, or Super Admin only
    const allowedRoles = ["finance", "owner", "super_admin"];
    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json(
        { error: "Access denied: Only Finance users can apply rent escalations." },
        { status: 403 }
      );
    }

    // 2. Fetch the rent step
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

    if (step.status === "applied") {
      return NextResponse.json(
        { error: "Escalation step is already applied." },
        { status: 400 }
      );
    }

    // 3. Rule 8: Escalation cannot be applied retroactively (effective_date >= today)
    const rule8Check = validateEscalationApplication(step.effective_date);
    if (!rule8Check.isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: rule8Check.errors },
        { status: 422 }
      );
    }

    // 4. Calculate new rate if escalation_value is present
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

        // Update active charge rate
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

    // 5. Update rent step status to 'applied'
    const [updatedStep] = await db
      .update(rentStep)
      .set({
        status: "applied",
        rate: appliedRate,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(rentStep.id, id))
      .returning();

    console.log(`[AUDIT] Escalation applied: StepID=${id}, NewRate=${appliedRate}, AppliedBy=${auth.userId}`);

    return NextResponse.json({
      success: true,
      message: "Escalation applied successfully. Base charge updated.",
      step: updatedStep,
    });
  } catch (err: any) {
    console.error("Error applying escalation:", err);
    return NextResponse.json(
      { error: "Failed to apply escalation", message: err.message },
      { status: 500 }
    );
  }
}

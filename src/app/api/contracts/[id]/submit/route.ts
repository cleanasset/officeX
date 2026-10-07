import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, task } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-01, RR-CONT-13: Submit Contract for Approval
 * - approval_status = submitted, contract_status = draft (pending approval)
 * - Approvers notified via task creation (§S-66, §S-06)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

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

    if (existing.approval_status === "submitted") {
      return NextResponse.json(
        { error: "Contract is already submitted for approval" },
        { status: 400 }
      );
    }

    // Update contract status
    const [updated] = await db
      .update(contract)
      .set({
        approval_status: "submitted",
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    // Create approval task for approvers (§S-06)
    const [approvalTask] = await db
      .insert(task)
      .values({
        org_id: existing.org_id,
        client_account_id: existing.client_account_id,
        task_type: "contract_approval",
        title: `Contract Approval Required: ${existing.contract_code}`,
        description: `Contract ${existing.contract_code} submitted for approval by user ${auth.userId}`,
        priority: "high",
        status: "pending",
        contract_id: existing.id,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Contract submitted for approval successfully",
      contract: updated,
      task: approvalTask,
    });
  } catch (err: any) {
    console.error("Error submitting contract:", err);
    return NextResponse.json(
      { error: "Failed to submit contract", message: err.message },
      { status: 500 }
    );
  }
}

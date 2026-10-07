import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, task, auditLogs } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-13: Reject Contract
 * - Rejected: approval_status = rejected, back to draft, reason given (§S-06, §S-22)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || body.comment;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { error: "A rejection reason is required" },
        { status: 400 }
      );
    }

    // Role check: Only approver roles can reject submitted contracts (§5.14)
    const allowedRejectRoles = ["finance_manager", "finance", "approver", "owner", "client_principal", "super_admin", "org_admin"];
    if (!allowedRejectRoles.includes(auth.role)) {
      return NextResponse.json(
        {
          error: "Permission denied",
          message: `Role '${auth.role}' is not authorized to reject contracts. Approver, Finance Manager, or Owner role required (§5.14).`,
        },
        { status: 403 }
      );
    }

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

    // Reset approval status to rejected and contract status to draft
    const [updated] = await db
      .update(contract)
      .set({
        approval_status: "rejected",
        contract_status: "draft",
        remarks: existing.remarks ? `${existing.remarks}\n[Rejected]: ${reason}` : `[Rejected]: ${reason}`,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    // Mark task as rejected with reason
    await db
      .update(task)
      .set({
        status: "rejected",
        resolution_comment: reason,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(task.contract_id, id),
          eq(task.task_type, "contract_approval")
        )
      );

    try {
      await db.insert(auditLogs).values({
        traceId: `REJ-${id.slice(0, 8)}-${Date.now()}`,
        module: "Rent Roll Contracts",
        action: `Contract ${existing.contract_code || id} rejected by User ${auth.userId} (Role: ${auth.role}). Reason: ${reason}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        severity: "warning",
      });
    } catch (auditErr) {
      console.warn("Audit logging non-fatal exception:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Contract rejected and returned to draft",
      contract: updated,
    });
  } catch (err: any) {
    console.error("Error rejecting contract:", err);
    return NextResponse.json(
      { error: "Failed to reject contract", message: err.message },
      { status: 500 }
    );
  }
}

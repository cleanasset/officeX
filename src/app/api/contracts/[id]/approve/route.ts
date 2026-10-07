import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, contractDocument, task, occupant, space } from "@/db/schema";
import {
  validateMakerCannotApprove,
  validateContractActivationDocs,
} from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-01, RR-CONT-03, RR-CONT-13: Approve Contract
 * - Maker cannot approve own submission (RR-CON-09)
 * - Required document: lease_agreement or leave_and_licence (RR-CON-05)
 * - On approval: status = future (if start_date > today) or active
 * - Auto-sets occupant.occupant_status = active (RR-CONT-10)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const comment = body.comment || "Approved";

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

    if (existing.approval_status !== "submitted") {
      return NextResponse.json(
        { error: "Only contracts with status 'submitted' can be approved" },
        { status: 400 }
      );
    }

    // 1. Maker cannot approve own submission (RR-CON-09)
    const makerCheck = validateMakerCannotApprove(existing.created_by, auth.userId);
    if (!makerCheck.isValid) {
      return NextResponse.json(
        { error: "Approval failed", details: makerCheck.errors },
        { status: 403 }
      );
    }

    // 2. Determine target status based on dates
    const todayStr = new Date().toISOString().split("T")[0];
    const startDateStr = existing.start_date;
    const targetStatus = startDateStr > todayStr ? "future" : "active";

    // 3. Document requirement check (RR-CON-05) if transitioning to active
    if (targetStatus === "active") {
      const docs = await db
        .select({
          doc_type: contractDocument.doc_type,
          status: contractDocument.status,
          is_current: contractDocument.is_current,
        })
        .from(contractDocument)
        .where(
          and(
            eq(contractDocument.contract_id, id),
            sql`${contractDocument.deleted_at} IS NULL`
          )
        );

      const docCheck = validateContractActivationDocs(existing.contract_type, docs);
      if (!docCheck.isValid) {
        return NextResponse.json(
          {
            error: "Activation blocked",
            details: docCheck.errors,
            code: "RR-CON-05",
          },
          { status: 422 }
        );
      }
    }

    // 4. Update contract status
    const [updated] = await db
      .update(contract)
      .set({
        approval_status: "approved",
        contract_status: targetStatus,
        remarks: existing.remarks ? `${existing.remarks}\n[Approval]: ${comment}` : `[Approval]: ${comment}`,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    // 5. Update task to completed
    await db
      .update(task)
      .set({
        status: "completed",
        resolution_comment: comment,
        completed_at: new Date(),
        completed_by: auth.userId,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(task.contract_id, id),
          eq(task.task_type, "contract_approval")
        )
      );

    // 6. If activated, auto-set occupant status to active (RR-CONT-10) and space to occupied
    if (targetStatus === "active") {
      if (existing.occupant_id) {
        await db
          .update(occupant)
          .set({
            occupant_status: "active",
            updated_by: auth.userId,
            updated_at: new Date(),
          })
          .where(eq(occupant.id, existing.occupant_id));
      }
      if (existing.space_id) {
        await db
          .update(space)
          .set({
            occupancy_status: "occupied",
            updated_by: auth.userId,
            updated_at: new Date(),
          })
          .where(eq(space.id, existing.space_id));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Contract approved successfully. Status set to '${targetStatus}'.`,
      contract: updated,
    });
  } catch (err: any) {
    console.error("Error approving contract:", err);
    return NextResponse.json(
      { error: "Failed to approve contract", message: err.message },
      { status: 500 }
    );
  }
}

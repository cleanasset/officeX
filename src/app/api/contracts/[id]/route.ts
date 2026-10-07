import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  contractSpace,
  contractCharge,
  rentStep,
  contractClause,
  concession,
  contractDocument,
  occupant,
  space,
  building,
  property,
  task,
} from "@/db/schema";
import {
  validateContractDates,
  validateSpaceOverlap,
  validateDepositBounds,
} from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-01 & §S-22: Contract Detail
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [existing] = await db
      .select({
        contract: contract,
        occupant: occupant,
        space: space,
        building: building,
        property: property,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
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

    // Scoped role check
    if (!auth.isPortfolioRole && auth.clientAccountId && existing.contract.client_account_id !== auth.clientAccountId) {
      return NextResponse.json({ error: "Access denied to this client account" }, { status: 403 });
    }

    // Fetch related charges and rent steps
    const charges = await db
      .select()
      .from(contractCharge)
      .where(
        and(
          eq(contractCharge.contract_id, id),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      );

    const chargeIds = charges.map(ch => ch.id);
    let steps: any[] = [];
    if (chargeIds.length > 0) {
      steps = await db
        .select()
        .from(rentStep)
        .where(
          and(
            sql`${rentStep.contract_charge_id} = ANY(${chargeIds})`,
            sql`${rentStep.deleted_at} IS NULL`
          )
        )
        .orderBy(rentStep.step_no);
    }

    // Fetch concessions
    const concessions = await db
      .select()
      .from(concession)
      .where(
        and(
          eq(concession.contract_id, id),
          sql`${concession.deleted_at} IS NULL`
        )
      );

    // Fetch clauses
    const clauses = await db
      .select()
      .from(contractClause)
      .where(
        and(
          eq(contractClause.contract_id, id),
          sql`${contractClause.deleted_at} IS NULL`
        )
      );

    // Fetch documents
    const documents = await db
      .select()
      .from(contractDocument)
      .where(
        and(
          eq(contractDocument.contract_id, id),
          sql`${contractDocument.deleted_at} IS NULL`
        )
      );

    // Fetch tasks/approvals
    const tasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.contract_id, id),
          sql`${task.deleted_at} IS NULL`
        )
      );

    return NextResponse.json({
      success: true,
      data: {
        ...existing.contract,
        occupant: existing.occupant,
        space: existing.space,
        building: existing.building,
        property: existing.property,
        charges: charges.map(ch => ({
          ...ch,
          rent_steps: steps.filter(s => s.contract_charge_id === ch.id),
        })),
        concessions,
        clauses,
        documents,
        tasks,
      },
    });
  } catch (err: any) {
    console.error("Error fetching contract detail:", err);
    return NextResponse.json(
      { error: "Failed to fetch contract", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * RR-CONT-02: Edit Contract
 * - Only maker or approver can edit (§5.14 roles)
 * - Editing creates new version (version counter increments)
 * - On edit: approval_status resets to draft
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

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

    // Role check: Only maker, approver, PM, owner, or super_admin can edit
    const isMaker = existing.created_by === auth.userId;
    const canEdit = isMaker || ["super_admin", "owner", "property_manager", "approver"].includes(auth.role);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Permission denied: Only maker or authorized approver can edit this contract" },
        { status: 403 }
      );
    }

    const startDate = body.start_date || existing.start_date;
    const endDate = body.end_date || existing.end_date;
    const commencementDate = body.commencement_date !== undefined ? body.commencement_date : existing.commencement_date;

    // Date validations
    if (body.start_date || body.end_date || body.commencement_date) {
      const dateVal = validateContractDates({
        start_date: startDate,
        end_date: endDate,
        commencement_date: commencementDate,
      });
      if (!dateVal.isValid) {
        return NextResponse.json({ error: "Date validation failed", details: dateVal.errors }, { status: 422 });
      }
    }

    // Deposit bounds check
    if (body.deposit_amount_inr !== undefined) {
      const depVal = validateDepositBounds(Number(body.deposit_amount_inr));
      if (!depVal.isValid) {
        return NextResponse.json({ error: "Deposit validation failed", details: depVal.errors }, { status: 422 });
      }
    }

    // Space overlap check if dates or space changed
    const targetSpaceId = body.space_id || existing.space_id;
    if (body.start_date || body.end_date || body.space_id) {
      const existingContracts = await db
        .select({
          id: contract.id,
          contract_code: contract.contract_code,
          start_date: contract.start_date,
          end_date: contract.end_date,
          contract_status: contract.contract_status,
        })
        .from(contract)
        .where(
          and(
            eq(contract.org_id, auth.orgId),
            eq(contract.space_id, targetSpaceId)
          )
        );

      const overlapCheck = validateSpaceOverlap(existingContracts, {
        id: existing.id,
        start_date: startDate,
        end_date: endDate,
      });
      if (!overlapCheck.isValid) {
        return NextResponse.json({ error: "Space conflict", details: overlapCheck.errors }, { status: 409 });
      }
    }

    // Update contract: Increment version, reset approval_status to draft
    const newVersion = (existing.version || 1) + 1;

    const [updated] = await db
      .update(contract)
      .set({
        contract_type: body.contract_type ?? existing.contract_type,
        billing_model: body.billing_model ?? existing.billing_model,
        start_date: startDate,
        end_date: endDate,
        commencement_date: commencementDate,
        lock_in_period_days: body.lock_in_period_days ?? existing.lock_in_period_days,
        notice_period_days: body.notice_period_days ?? existing.notice_period_days,
        deposit_amount_inr: body.deposit_amount_inr !== undefined ? String(body.deposit_amount_inr) : existing.deposit_amount_inr,
        deposit_status: body.deposit_status ?? existing.deposit_status,
        remarks: body.remarks ?? existing.remarks,
        approval_status: "draft", // Resets to draft per RR-CONT-02
        version: newVersion, // Version counter increments
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(eq(contract.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Contract updated to version ${newVersion}. Approval status reset to draft.`,
      contract: updated,
    });
  } catch (err: any) {
    console.error("Error updating contract:", err);
    return NextResponse.json(
      { error: "Failed to update contract", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * Delete draft contract only
 */
export async function DELETE(
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

    if (existing.contract_status !== "draft") {
      return NextResponse.json(
        { error: "Only draft contracts can be deleted." },
        { status: 400 }
      );
    }

    await db
      .update(contract)
      .set({
        deleted_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(contract.id, id));

    return NextResponse.json({
      success: true,
      message: "Draft contract deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting contract:", err);
    return NextResponse.json(
      { error: "Failed to delete contract", message: err.message },
      { status: 500 }
    );
  }
}

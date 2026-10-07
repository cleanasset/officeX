import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, contractCharge, rentStep } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-06: Rent Steps / Escalation Schedules for a Contract
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const steps = await db
      .select({
        step: rentStep,
      })
      .from(rentStep)
      .innerJoin(contractCharge, eq(rentStep.contract_charge_id, contractCharge.id))
      .where(
        and(
          eq(contractCharge.contract_id, id),
          eq(rentStep.org_id, auth.orgId),
          sql`${rentStep.deleted_at} IS NULL`
        )
      )
      .orderBy(rentStep.step_no);

    return NextResponse.json({ success: true, data: steps.map(s => s.step) });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch rent steps", message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [c] = await db
      .select()
      .from(contract)
      .where(
        and(
          eq(contract.id, id),
          eq(contract.org_id, auth.orgId),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const payload = {
      ...body,
      org_id: c.org_id,
      client_account_id: c.client_account_id,
      contract_charge_id: body.contract_charge_id,
      step_no: body.step_no || body.step_number || 1,
      effective_date: body.effective_date,
      escalation_type: body.escalation_type || "percentage",
      rate: String(body.rate || 0),
    };

    const reqVal = validateRequiredFields("rent_step", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(rentStep)
      .values({
        org_id: c.org_id,
        client_account_id: c.client_account_id,
        contract_charge_id: payload.contract_charge_id,
        step_no: payload.step_no,
        effective_date: payload.effective_date,
        escalation_type: payload.escalation_type,
        rate: payload.rate,
        escalation_value: body.escalation_value ? String(body.escalation_value) : null,
        status: body.status || "scheduled",
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create rent step", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("step_id");

    if (!stepId) {
      return NextResponse.json({ error: "step_id query parameter is required" }, { status: 400 });
    }

    await db
      .update(rentStep)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(rentStep.id, stepId), eq(rentStep.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Rent step deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete rent step", message: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, contractCharge, rentStep } from "@/db/schema";
import { validateRequiredFields, validateChargeDates } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-06: Charges for a Contract
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const charges = await db
      .select()
      .from(contractCharge)
      .where(
        and(
          eq(contractCharge.contract_id, id),
          eq(contractCharge.org_id, auth.orgId),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      );

    return NextResponse.json({ success: true, data: charges });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch charges", message: err.message }, { status: 500 });
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
      contract_id: id,
      component: body.component || "base_rent",
      calc_basis: body.calc_basis || "per_area",
      start_date: body.start_date || c.start_date,
      end_date: body.end_date || c.end_date,
    };

    const reqVal = validateRequiredFields("contract_charge", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    // Rule 6: charge start_date >= contract start_date
    const dateVal = validateChargeDates(c.start_date, payload.start_date);
    if (!dateVal.isValid) {
      return NextResponse.json({ error: "Charge date validation failed", details: dateVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(contractCharge)
      .values({
        org_id: c.org_id,
        client_account_id: c.client_account_id,
        contract_id: id,
        component: payload.component,
        calc_basis: payload.calc_basis,
        rate: payload.rate ? String(payload.rate) : "0",
        rate_period: payload.rate_period || "month",
        quantity_basis: payload.quantity_basis ? String(payload.quantity_basis) : null,
        is_included: payload.is_included ?? false,
        is_recoverable: payload.is_recoverable ?? false,
        invoice_group: payload.invoice_group || "rent",
        billing_mode: payload.billing_mode || "advance",
        start_date: payload.start_date,
        end_date: payload.end_date,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create charge", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const chargeId = searchParams.get("charge_id");

    if (!chargeId) {
      return NextResponse.json({ error: "charge_id query parameter is required" }, { status: 400 });
    }

    await db
      .update(contractCharge)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(contractCharge.id, chargeId), eq(contractCharge.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Charge deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete charge", message: err.message }, { status: 500 });
  }
}

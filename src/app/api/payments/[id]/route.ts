import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, payment_allocation, invoice, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [pmt] = await db
      .select()
      .from(payment)
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId), isNull(payment.deleted_at)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Retrieve occupant details
    const [occ] = await db
      .select({
        id: occupant.id,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
        pan_number: occupant.pan_number,
        gst_number: occupant.gst_number,
      })
      .from(occupant)
      .where(eq(occupant.id, pmt.occupant_id));

    // Retrieve allocations with invoice details
    const allocations = await db
      .select({
        allocation_id: payment_allocation.id,
        amount_allocated_inr: payment_allocation.amount_allocated_inr,
        allocation_date: payment_allocation.allocation_date,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        gross_total: invoice.gross_total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        status: invoice.status,
      })
      .from(payment_allocation)
      .innerJoin(invoice, eq(payment_allocation.invoice_id, invoice.id))
      .where(eq(payment_allocation.payment_id, id));

    return NextResponse.json({
      payment: pmt,
      occupant: occ || null,
      allocations,
    });
  } catch (err: any) {
    console.error("Get payment detail failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [pmt] = await db
      .select()
      .from(payment)
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId), isNull(payment.deleted_at)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (pmt.is_matched) {
      return NextResponse.json({ error: "Cannot edit matched payment. Unallocate invoices first." }, { status: 400 });
    }

    const [updated] = await db
      .update(payment)
      .set({
        payment_date: body.payment_date || pmt.payment_date,
        amount_inr: body.amount_inr ? String(body.amount_inr) : pmt.amount_inr,
        payment_mode: body.payment_mode || pmt.payment_mode,
        payment_ref: body.payment_ref || pmt.payment_ref,
        notes: body.notes !== undefined ? body.notes : pmt.notes,
        cheque_number: body.cheque_number !== undefined ? body.cheque_number : pmt.cheque_number,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(payment.id, id))
      .returning();

    return NextResponse.json({ success: true, payment: updated });
  } catch (err: any) {
    console.error("Edit payment failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [pmt] = await db
      .select()
      .from(payment)
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId), isNull(payment.deleted_at)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (pmt.is_matched) {
      return NextResponse.json({ error: "Cannot delete matched payment. Unallocate invoices first." }, { status: 400 });
    }

    await db
      .update(payment)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(payment.id, id));

    return NextResponse.json({ success: true, message: "Payment soft-deleted successfully" });
  } catch (err: any) {
    console.error("Delete payment failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

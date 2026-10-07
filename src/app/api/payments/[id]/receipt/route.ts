import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, payment_allocation, invoice, occupant, organization, client_account } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateReceiptHtml } from "@/lib/rent-roll/payments/receipt-generator";
import { eq, and } from "drizzle-orm";

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
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const [occ] = await db
      .select()
      .from(occupant)
      .where(eq(occupant.id, pmt.occupant_id));

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, auth.orgId));

    let clientName: string | null = null;
    if (pmt.client_account_id) {
      const [cli] = await db
        .select()
        .from(client_account)
        .where(eq(client_account.id, pmt.client_account_id));
      if (cli) clientName = cli.client_name;
    }

    // Fetch allocations
    const allocationsList = await db
      .select({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        gross_total: invoice.gross_total,
        allocated_amount: payment_allocation.amount_allocated_inr,
        remaining_balance: invoice.balance_due,
      })
      .from(payment_allocation)
      .innerJoin(invoice, eq(payment_allocation.invoice_id, invoice.id))
      .where(eq(payment_allocation.payment_id, id));

    const receiptHtml = generateReceiptHtml({
      receipt_number: `RCP-${pmt.payment_code}`,
      payment_code: pmt.payment_code,
      payment_ref: pmt.payment_ref,
      payment_date: pmt.payment_date,
      payment_mode: pmt.payment_mode,
      total_amount_inr: parseFloat(pmt.amount_inr),
      occupant_name: occ?.occupant_name || "Valued Occupant",
      occupant_pan: occ?.pan_number,
      occupant_gst: occ?.gst_number,
      org_name: org?.name || "OFFICEX Commercial Real Estate",
      client_name: clientName,
      allocations: allocationsList.map((a) => ({
        invoice_number: a.invoice_number,
        invoice_date: a.invoice_date,
        gross_total: parseFloat(a.gross_total),
        allocated_amount: parseFloat(a.allocated_amount),
        remaining_balance: parseFloat(a.remaining_balance),
      })),
    });

    return new NextResponse(receiptHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("Generate receipt failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

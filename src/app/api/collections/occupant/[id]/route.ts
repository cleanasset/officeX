import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { occupant, invoice, payment } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc, isNull } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [occ] = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId), isNull(occupant.deleted_at)));

    if (!occ) {
      return NextResponse.json({ error: "Occupant not found" }, { status: 404 });
    }

    // Invoices history
    const invoicesList = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.occupant_id, id), eq(invoice.org_id, auth.orgId)))
      .orderBy(desc(invoice.invoice_date));

    // Payments history
    const paymentsList = await db
      .select()
      .from(payment)
      .where(and(eq(payment.occupant_id, id), eq(payment.org_id, auth.orgId), isNull(payment.deleted_at)))
      .orderBy(desc(payment.payment_date));

    const totalBilled = invoicesList.reduce((acc, i) => acc + (parseFloat(i.gross_total || "0") || 0), 0);
    const totalPaid = invoicesList.reduce((acc, i) => acc + (parseFloat(i.amount_paid || "0") || 0), 0);
    const totalOutstanding = invoicesList.reduce((acc, i) => acc + (parseFloat(i.balance_due || "0") || 0), 0);

    return NextResponse.json({
      occupant: occ,
      summary: {
        total_billed_inr: Math.round(totalBilled * 100) / 100,
        total_paid_inr: Math.round(totalPaid * 100) / 100,
        total_outstanding_inr: Math.round(totalOutstanding * 100) / 100,
        unpaid_invoices_count: invoicesList.filter((i) => parseFloat(i.balance_due) > 0).length,
      },
      invoices: invoicesList,
      payments: paymentsList,
    });
  } catch (err: any) {
    console.error("Get occupant collections history failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

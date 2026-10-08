import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, invoice_line, auditLogs } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/rent-roll/billing/billing-calculator";

/**
 * POST /api/invoices/[id]/credit-note — Issue Credit Note / Billing Adjustment (§RR-FIN-05, §S-12, §S-13)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (!body.reason) {
      return NextResponse.json({ error: "Reason for credit note is required." }, { status: 400 });
    }

    const creditAmount = parseFloat(body.amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return NextResponse.json({ error: "A valid positive credit amount is required." }, { status: 400 });
    }

    // 1. Fetch original invoice
    const [origInvoice] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, id), eq(invoice.org_id, auth.orgId)));

    if (!origInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const currentBalance = parseFloat(origInvoice.balance_due || "0");
    const creditNoteNumber = `CN-${origInvoice.invoice_number.replace(/^INV-/, "")}`;
    const todayStr = formatDate(new Date());

    // 2. Create Credit Note record (status = 'issued', negative amounts)
    const negativeSubtotal = (-creditAmount).toFixed(2);
    const taxRate = parseFloat(origInvoice.gst_rate || "18.00");
    const taxAmount = (-(creditAmount * taxRate) / (100 + taxRate)).toFixed(2);
    const baseCreditAmount = (-creditAmount - parseFloat(taxAmount)).toFixed(2);

    const [creditNote] = await db
      .insert(invoice)
      .values({
        org_id: origInvoice.org_id,
        client_account_id: origInvoice.client_account_id,
        contract_id: origInvoice.contract_id,
        occupant_id: origInvoice.occupant_id,
        property_id: origInvoice.property_id,
        invoice_number: creditNoteNumber,
        fy_year: origInvoice.fy_year,
        invoice_date: todayStr,
        due_date: todayStr,
        period_start: origInvoice.period_start,
        period_end: origInvoice.period_end,
        base_rent: baseCreditAmount,
        subtotal: negativeSubtotal,
        gst_rate: taxRate.toFixed(2),
        gst_amount: taxAmount,
        gross_total: negativeSubtotal,
        net_payable: negativeSubtotal,
        amount_paid: "0.00",
        balance_due: "0.00", // Credit notes do not leave open balance
        status: "issued",
        sent_at: new Date(),
      })
      .returning();

    // 3. Create Credit Note line items
    const creditLines = body.credit_lines || [
      {
        description: `Credit Note Adjustment: ${body.reason}`,
        reduction_amount: creditAmount,
      },
    ];

    for (const cl of creditLines) {
      const lineAmt = parseFloat(cl.reduction_amount || String(creditAmount));
      await db.insert(invoice_line).values({
        org_id: origInvoice.org_id,
        client_account_id: origInvoice.client_account_id,
        invoice_id: creditNote.id,
        description: cl.description || `Credit Note: ${body.reason}`,
        quantity: "1.00",
        rate: (-lineAmt).toFixed(2),
        amount_inr: (-lineAmt).toFixed(2),
        tax_rate_percent: taxRate.toFixed(2),
        tax_amount_inr: "0.00",
        created_by: auth.userId,
        updated_by: auth.userId,
        version: 1,
      });
    }

    // 4. Reduce balance due on original invoice
    const newBalance = Math.max(0, currentBalance - creditAmount);
    const newStatus = newBalance === 0 ? "paid" : origInvoice.status;

    await db
      .update(invoice)
      .set({
        balance_due: newBalance.toFixed(2),
        status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(invoice.id, id));

    // Audit log
    try {
      await db.insert(auditLogs).values({
        traceId: `CN-ISSUE-${id.slice(0, 8)}-${Date.now()}`,
        module: "Rent Roll Credit Notes",
        action: `Credit note ${creditNoteNumber} issued for invoice ${origInvoice.invoice_number} by User ${auth.userId} (${auth.roleName}). Amount: ₹${creditAmount}. Reason: ${body.reason}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        severity: "info",
      });
    } catch (e) {
      // safe fallback
    }

    return NextResponse.json({
      success: true,
      credit_note_id: creditNote.id,
      credit_note_number: creditNoteNumber,
      credited_amount: creditAmount,
      original_invoice_new_balance: newBalance,
      message: `Credit note ${creditNoteNumber} issued for ₹${creditAmount.toLocaleString("en-IN")}`,
    });
  } catch (err: any) {
    console.error("POST /api/invoices/[id]/credit-note error:", err);
    return NextResponse.json({ error: err?.message || "Failed to issue credit note" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, occupant, property, space, auditLogs } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { sendInvoiceNotificationEmail } from "@/lib/email-service";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/invoices/[id]/send
 * Dispatches the official Tax Invoice directly to the tenant's email address via SMTP
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // 1. Fetch invoice
    const [inv] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, id));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Fetch occupant details
    let recipientEmail = body.recipient_email || body.email;
    let tenantName = "Utkarsh Makwana";

    if (inv.occupant_id) {
      const [occ] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, inv.occupant_id));
      if (occ) {
        if (!recipientEmail && occ.email) {
          recipientEmail = occ.email;
        }
        if (occ.occupant_name) {
          tenantName = occ.occupant_name;
        }
      }
    }

    if (!recipientEmail) {
      recipientEmail = "admin.cleanasset@gmail.com";
    }

    // 3. Dispatch official email via SMTP
    const dueDateStr = inv.due_date ? String(inv.due_date).split("T")[0] : "31-Oct-2026";
    const invoiceDateStr = inv.invoice_date ? String(inv.invoice_date).split("T")[0] : new Date().toISOString().split("T")[0];

    const emailResult = await sendInvoiceNotificationEmail({
      to: recipientEmail,
      tenantName: tenantName,
      invoiceNumber: inv.invoice_number,
      propertyName: body.property_name || "mango plus tower",
      spaceName: body.space_name || "Suite 101",
      grossTotal: inv.gross_total,
      dueDate: dueDateStr,
      invoiceDate: invoiceDateStr,
      brandName: body.brand_name || "Mango Groups Ltd",
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
    });

    // 4. Update sent_at timestamp
    const now = new Date();
    await db
      .update(invoice)
      .set({
        sent_at: now,
        status: inv.status === "draft" ? "issued" : inv.status,
        updated_at: now,
      })
      .where(eq(invoice.id, id));

    // Audit log
    try {
      await db.insert(auditLogs).values({
        traceId: `INV-SEND-${id.slice(0, 8)}-${Date.now()}`,
        module: "Rent Roll Invoices",
        action: `Invoice ${inv.invoice_number} dispatched via email to ${recipientEmail} by User ${auth.userId}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        severity: "info",
      });
    } catch (e) {
      // safe fallback
    }

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? `Invoice ${inv.invoice_number} successfully dispatched to ${recipientEmail}`
        : `Invoice status updated to issued. Email dispatch status: ${emailResult.error || "simulated"}`,
      invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      recipient_email: recipientEmail,
      email_dispatched: emailResult.success,
      message_id: emailResult.messageId,
      sent_at: now.toISOString(),
    });
  } catch (err: any) {
    console.error("POST /api/invoices/[id]/send error:", err);
    return NextResponse.json({ error: err.message || "Failed to send invoice" }, { status: 500 });
  }
}

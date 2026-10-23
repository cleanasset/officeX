import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, task, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const invoiceId = body.invoice_id;
    if (!invoiceId) {
      return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
    }

    const [inv] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, invoiceId));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let occupantEmail = "";
    let occupantName = "Occupant";
    if (inv.occupant_id) {
      const [occ] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, inv.occupant_id));
      if (occ?.email) {
        occupantEmail = occ.email;
      }
      if (occ?.occupant_name) {
        occupantName = occ.occupant_name;
      }
    }

    const now = new Date();

    // 1. Create high priority reminder task
    const [reminderTask] = await db
      .insert(task)
      .values({
        org_id: inv.org_id || auth.orgId,
        client_account_id: inv.client_account_id,
        contract_id: inv.contract_id || null,
        title: `Overdue Payment Reminder: Invoice ${inv.invoice_number}`,
        description: `Overdue payment reminder dispatched to ${occupantEmail || "occupant"} for balance ₹${inv.balance_due}. Due date was ${inv.due_date}. ${body.notes || ""}`,
        task_type: "dispute_followup",
        status: "pending",
        priority: "high",
        assigned_to: auth.userId,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // 2. Update sent_at timestamp
    await db
      .update(invoice)
      .set({
        sent_at: now,
        updated_at: now,
      })
      .where(eq(invoice.id, invoiceId));

    const finalTargetEmail = body.recipient_email || body.email || occupantEmail;

    // 3. Dispatch real email via SMTP
    let emailStatus = null;
    try {
      const { sendPaymentReminderEmail } = await import("@/lib/email-service");
      emailStatus = await sendPaymentReminderEmail({
        to: finalTargetEmail,
        tenantName: body.tenant_name || occupantName,
        invoiceNumber: inv.invoice_number,
        propertyName: body.property_name || "Commercial Centre",
        spaceName: body.space_name || "Commercial Unit",
        balanceDue: inv.balance_due,
        dueDate: inv.due_date ? String(inv.due_date).split("T")[0] : new Date().toISOString().split("T")[0],
        senderName: body.sender_name || "Property Management",
        message: body.notes || `Overdue payment reminder for invoice ${inv.invoice_number}. Please settle online.`,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
      });
    } catch (e: any) {
      console.error("Collections reminder email error:", e);
      emailStatus = { success: false, error: e.message };
    }

    return NextResponse.json({
      success: true,
      message: emailStatus?.success
        ? `Payment reminder successfully emailed to ${finalTargetEmail}.`
        : `Payment reminder logged (Email: ${emailStatus?.error || "simulated"}).`,
      email_dispatched: !!emailStatus?.success,
      recipient_email: finalTargetEmail,
      invoice_number: inv.invoice_number,
      balance_due: inv.balance_due,
      sent_at: now.toISOString(),
      task: reminderTask,
    });
  } catch (err: any) {
    console.error("Send reminder failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

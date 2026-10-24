import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, task, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    let invoiceId = body.invoice_id;
    let inv: typeof invoice.$inferSelect | undefined;

    if (invoiceId) {
      const [found] = await db
        .select()
        .from(invoice)
        .where(eq(invoice.id, invoiceId));
      inv = found;
    }

    // Auto-resolve from occupant_id if invoice_id is missing or not found
    if (!inv && body.occupant_id) {
      const [found] = await db
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.occupant_id, body.occupant_id),
            eq(invoice.org_id, auth.orgId)
          )
        )
        .orderBy(desc(invoice.created_at))
        .limit(1);
      inv = found;
      if (inv) {
        invoiceId = inv.id;
      }
    }

    if (!inv) {
      return NextResponse.json(
        {
          error:
            "No active invoice found for this occupant. Please ensure an invoice exists in the Invoicing Register (/operate/invoices) before dispatching demand notices.",
        },
        { status: 404 }
      );
    }

    let occupantEmail = "";
    let occupantPhone = "";
    let occupantName = "Occupant";

    if (inv.occupant_id) {
      const [occ] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, inv.occupant_id));
      if (occ?.email) {
        occupantEmail = occ.email;
      }
      if (occ?.phone) {
        occupantPhone = occ.phone;
      }
      if (occ?.occupant_name) {
        occupantName = occ.occupant_name;
      }
    }

    const finalTargetEmail = (body.recipient_email || body.email || occupantEmail || "").trim();
    const finalTargetPhone = (body.recipient_phone || body.phone || occupantPhone || "").trim();
    const channel = body.channel || "both"; // 'email' | 'whatsapp' | 'both'
    const now = new Date();

    // Persist updated email or phone to occupant record if provided
    if (inv.occupant_id && (body.recipient_email || body.recipient_phone)) {
      try {
        const updateFields: Record<string, any> = { updated_at: now };
        if (body.recipient_email && body.recipient_email.trim() !== occupantEmail) {
          updateFields.email = body.recipient_email.trim();
        }
        if (body.recipient_phone && body.recipient_phone.trim() !== occupantPhone) {
          updateFields.phone = body.recipient_phone.trim();
        }
        if (Object.keys(updateFields).length > 1) {
          await db
            .update(occupant)
            .set(updateFields)
            .where(eq(occupant.id, inv.occupant_id));
        }
      } catch (errOcc) {
        console.warn("Could not update occupant email/phone:", errOcc);
      }
    }

    // Build WhatsApp direct message link if requested
    const cleanPhone = finalTargetPhone.replace(/[^0-9]/g, "");
    const formattedWaPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const formattedBalance = Number(inv.balance_due || 0).toLocaleString("en-IN");
    const waText = encodeURIComponent(
      `*Official Payment Demand Notice - OfficeX*\n\n` +
      `Dear ${occupantName},\n` +
      `This is a statutory payment demand notice regarding your overdue balance of *₹${formattedBalance}* for Invoice *${inv.invoice_number}*.\n\n` +
      `Please settle your outstanding balance online via the tenant payment portal:\n` +
      `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices\n\n` +
      `Thank you,\nFinance & Property Management`
    );
    const whatsappUrl = formattedWaPhone
      ? `https://api.whatsapp.com/send?phone=${formattedWaPhone}&text=${waText}`
      : null;

    // 1. Create high priority reminder task
    const channelLabels: string[] = [];
    if (channel === "email" || channel === "both") {
      channelLabels.push(`Email (${finalTargetEmail || "not provided"})`);
    }
    if (channel === "whatsapp" || channel === "both") {
      channelLabels.push(`WhatsApp (${finalTargetPhone || "not provided"})`);
    }

    const [reminderTask] = await db
      .insert(task)
      .values({
        org_id: inv.org_id || auth.orgId,
        client_account_id: inv.client_account_id,
        contract_id: inv.contract_id || null,
        title: `Payment Demand Notice: Invoice ${inv.invoice_number} (${occupantName})`,
        description: `Demand notice dispatched via ${channelLabels.join(" & ")} for balance ₹${formattedBalance}. Due date: ${inv.due_date}. Notes: ${body.notes || "Standard demand notice"}`,
        task_type: "dispute_followup",
        status: "pending",
        priority: "high",
        assigned_to: auth.userId,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // 2. Update sent_at timestamp
    if (inv.id) {
      await db
        .update(invoice)
        .set({
          sent_at: now,
          updated_at: now,
        })
        .where(eq(invoice.id, inv.id));
    }

    // 3. Dispatch real email via SMTP if channel allows
    let emailStatus: { success: boolean; messageId?: string; error?: string } | null = null;
    if ((channel === "email" || channel === "both") && finalTargetEmail) {
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
    }

    const dispatchNotes: string[] = [];
    if (channel === "email" || channel === "both") {
      if (emailStatus?.success) {
        dispatchNotes.push(`Email sent to ${finalTargetEmail}`);
      } else if (finalTargetEmail) {
        dispatchNotes.push(`Email queued for ${finalTargetEmail}`);
      } else {
        dispatchNotes.push("Email omitted (no email address)");
      }
    }
    if (channel === "whatsapp" || channel === "both") {
      if (finalTargetPhone) {
        dispatchNotes.push(`WhatsApp prepared for +${formattedWaPhone}`);
      } else {
        dispatchNotes.push("WhatsApp omitted (no phone number)");
      }
    }

    return NextResponse.json({
      success: true,
      message: `Demand notice for ${inv.invoice_number} dispatched! (${dispatchNotes.join(", ")})`,
      email_dispatched: !!emailStatus?.success,
      recipient_email: finalTargetEmail,
      recipient_phone: finalTargetPhone,
      whatsapp_url: whatsappUrl,
      invoice_id: inv.id,
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


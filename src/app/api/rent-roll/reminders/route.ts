import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/rent-roll/auth-context";

export async function GET(req: NextRequest) {
  try {
    const reminders = await db.execute(sql`
      SELECT id, org_id, occupant_id, target_name, property_name, invoice_number, 
             amount_inr, sender_name, sender_role, title, message, status, is_read, created_at
      FROM tenant_reminders
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      success: true,
      reminders: reminders.rows,
    });
  } catch (err: any) {
    console.error("GET /api/rent-roll/reminders error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const targetName = body.target_name || body.occupant_space || "Occupant";
    const propName = body.property_name || "Commercial Centre";
    const invNumber = body.invoice_number || "INV";
    const amountVal = Number(body.amount_inr || 0);
    const senderName = body.sender_name || "Property Management";
    const senderRole = body.sender_role || "Property Managing Company";
    const title = body.title || `Payment Reminder: ${invNumber}`;
    const recipientEmail = body.recipient_email || body.email || "";
    const message = body.message || `Official collection notice from ${senderName}: Invoice ${invNumber} for ${propName} is pending settlement. Please remit payment via your tenant portal.`;

    const inserted = await db.execute(sql`
      INSERT INTO tenant_reminders (
        org_id, target_name, property_name, invoice_number, amount_inr, sender_name, sender_role, title, message
      )
      VALUES (
        ${auth.orgId || null}, ${targetName}, ${propName}, ${invNumber}, ${amountVal}, ${senderName}, ${senderRole}, ${title}, ${message}
      )
      RETURNING *;
    `);

    // Dispatch real email via SMTP
    let emailStatus = null;
    try {
      const { sendPaymentReminderEmail } = await import("@/lib/email-service");
      emailStatus = await sendPaymentReminderEmail({
        to: recipientEmail,
        tenantName: targetName,
        invoiceNumber: invNumber,
        propertyName: propName,
        spaceName: "Suite 101",
        balanceDue: amountVal,
        dueDate: "31-Oct-2026",
        senderName: senderName,
        message: message,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
      });
    } catch (e: any) {
      console.error("Failed to send reminder email:", e);
      emailStatus = { success: false, error: e.message };
    }

    return NextResponse.json({
      success: true,
      message: emailStatus?.success
        ? `Reminder successfully dispatched to Tenant Portal and emailed to ${recipientEmail}`
        : `Reminder dispatched to Tenant Portal (Email delivery: ${emailStatus?.error || "simulated"})`,
      email_dispatched: !!emailStatus?.success,
      recipient_email: recipientEmail,
      reminder: inserted.rows[0],
    });
  } catch (err: any) {
    console.error("POST /api/rent-roll/reminders error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch reminder" }, { status: 500 });
  }
}

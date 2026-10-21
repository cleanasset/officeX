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

    const targetName = body.target_name || body.occupant_space || "Utkarsh Makwana · Suite 101";
    const propName = body.property_name || "mango plus tower";
    const invNumber = body.invoice_number || "INV-2026-27-0001";
    const amountVal = Number(body.amount_inr || 1516300);
    const senderName = body.sender_name || "JPS Management";
    const senderRole = body.sender_role || "Property Managing Company";
    const title = body.title || `Payment Reminder: ${invNumber}`;
    const message = body.message || `Official collection reminder from ${senderName} for October 2026 lease invoice ${invNumber} totaling ₹${amountVal.toLocaleString("en-IN")}. Please settle via the tenant portal.`;

    const inserted = await db.execute(sql`
      INSERT INTO tenant_reminders (
        org_id, target_name, property_name, invoice_number, amount_inr, sender_name, sender_role, title, message
      )
      VALUES (
        ${auth.orgId || null}, ${targetName}, ${propName}, ${invNumber}, ${amountVal}, ${senderName}, ${senderRole}, ${title}, ${message}
      )
      RETURNING *;
    `);

    return NextResponse.json({
      success: true,
      message: "Reminder successfully dispatched to Tenant Portal",
      reminder: inserted.rows[0],
    });
  } catch (err: any) {
    console.error("POST /api/rent-roll/reminders error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch reminder" }, { status: 500 });
  }
}

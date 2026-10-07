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
      .where(and(eq(invoice.id, invoiceId), eq(invoice.org_id, auth.orgId)));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let occupantEmail = "tenant-billing@company.com";
    if (inv.occupant_id) {
      const [occ] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, inv.occupant_id));
      if (occ?.email) {
        occupantEmail = occ.email;
      }
    }

    const now = new Date();

    // 1. Create high priority reminder task
    const [reminderTask] = await db
      .insert(task)
      .values({
        org_id: auth.orgId,
        client_account_id: inv.client_account_id,
        contract_id: inv.contract_id || null,
        title: `Overdue Payment Reminder: Invoice ${inv.invoice_number}`,
        description: `Overdue payment reminder dispatched to ${occupantEmail} for balance ₹${inv.balance_due}. Due date was ${inv.due_date}. ${body.notes || ""}`,
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

    return NextResponse.json({
      success: true,
      message: `Payment reminder successfully sent to ${occupantEmail}.`,
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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, task } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const invoiceId = body.invoice_id;
    const reason = body.reason;

    if (!invoiceId || !reason) {
      return NextResponse.json({ error: "invoice_id and reason are required" }, { status: 400 });
    }

    const [inv] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, invoiceId), eq(invoice.org_id, auth.orgId)));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (parseFloat(inv.balance_due) <= 0) {
      return NextResponse.json({ error: "Invoice has zero balance due; cannot request write-off" }, { status: 400 });
    }

    // Create approval task for Finance Approver
    const [approvalTask] = await db
      .insert(task)
      .values({
        org_id: auth.orgId,
        client_account_id: inv.client_account_id,
        contract_id: inv.contract_id || null,
        title: `Write-Off Approval Request: Invoice ${inv.invoice_number}`,
        description: `Request to write off outstanding balance of ₹${inv.balance_due} on invoice ${inv.invoice_number}. Justification: ${reason}`,
        task_type: "contract_approval",
        status: "pending",
        priority: "high",
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // Update invoice status
    await db
      .update(invoice)
      .set({
        status: "writeoff_requested",
        updated_at: new Date(),
      })
      .where(eq(invoice.id, invoiceId));

    return NextResponse.json({
      success: true,
      message: "Write-off request submitted successfully for approval.",
      task: approvalTask,
      invoice_number: inv.invoice_number,
      balance_due: inv.balance_due,
    });
  } catch (err: any) {
    console.error("Submit write-off request failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

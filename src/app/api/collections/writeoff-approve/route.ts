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

    const previousBalance = inv.balance_due;

    // 1. Mark invoice as written_off and clear balance_due
    const [updatedInv] = await db
      .update(invoice)
      .set({
        status: "written_off",
        balance_due: "0.00",
        updated_at: new Date(),
      })
      .where(eq(invoice.id, invoiceId))
      .returning();

    // 2. If task_id provided, mark task completed
    if (body.task_id) {
      await db
        .update(task)
        .set({
          status: "completed",
          completed_at: new Date(),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(task.id, body.task_id));
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${inv.invoice_number} written off successfully. Outstanding balance ₹${previousBalance} adjusted as bad debt.`,
      invoice: updatedInv,
    });
  } catch (err: any) {
    console.error("Approve write-off failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  payment,
  payment_allocation,
  invoice,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, asc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const {
      razorpay_payment_id,
      order_id,
      invoice_ids,
      amount_inr,
      occupant_id,
      payment_mode = "bank_transfer",
    } = body;

    if (!invoice_ids || !invoice_ids.length || !amount_inr) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // 1. Fetch invoices to allocate to (sorted by due_date ascending for oldest-first rule)
    const targetInvoices = await db
      .select()
      .from(invoice)
      .where(sql`${invoice.id} IN ${invoice_ids}`)
      .orderBy(asc(invoice.due_date));

    if (!targetInvoices.length) {
      return NextResponse.json({ error: "Target invoices not found" }, { status: 404 });
    }

    const firstInv = targetInvoices[0];
    const resolvedOccupantId = occupant_id || firstInv.occupant_id;
    const paymentRef = razorpay_payment_id || `pay_portal_${Date.now()}`;
    const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;

    // 2. Insert Payment Record (RR-PAY-01 / §4.10)
    const [newPayment] = await db
      .insert(payment)
      .values({
        org_id: auth.orgId,
        client_account_id: firstInv.client_account_id,
        occupant_id: resolvedOccupantId!,
        contract_id: firstInv.contract_id,
        payment_code: paymentCode,
        payment_date: new Date().toISOString().split("T")[0],
        payment_mode: "bank_transfer",
        amount_inr: String(amount_inr),
        payment_ref: paymentRef,
        payment_status: "received",
        is_matched: true,
        notes: `Online checkout via Tenant Portal (Razorpay Ref: ${paymentRef})`,
      })
      .returning();

    // 3. Sequential Oldest-First Allocation Algorithm (Formula F-10 / UX §T-02)
    let remainingToAllocate = Number(amount_inr);
    const allocationsResult: any[] = [];

    for (const inv of targetInvoices) {
      if (remainingToAllocate <= 0) break;

      const currentBalance = Number(inv.balance_due) || 0;
      if (currentBalance <= 0) continue;

      const allocAmount = Math.min(remainingToAllocate, currentBalance);
      remainingToAllocate -= allocAmount;

      // Insert Allocation
      const [newAlloc] = await db
        .insert(payment_allocation)
        .values({
          org_id: auth.orgId,
          payment_id: newPayment.id,
          invoice_id: inv.id,
          amount_allocated_inr: String(allocAmount),
          allocation_date: new Date().toISOString().split("T")[0],
          notes: `Auto-allocated from ${paymentCode}`,
        })
        .returning();

      // Update Invoice Balances
      const newAmountPaid = (Number(inv.amount_paid) || 0) + allocAmount;
      const newBalanceDue = Math.max(0, currentBalance - allocAmount);
      const newStatus = newBalanceDue <= 0 ? "paid" : "part_paid";

      await db
        .update(invoice)
        .set({
          amount_paid: String(newAmountPaid),
          balance_due: String(newBalanceDue),
          status: newStatus,
          updated_at: new Date(),
        })
        .where(eq(invoice.id, inv.id));

      allocationsResult.push({
        allocation_id: newAlloc.id,
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        amount_allocated_inr: allocAmount,
        new_balance_due: newBalanceDue,
        status: newStatus,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and allocated",
      payment: newPayment,
      allocations: allocationsResult,
      total_allocated_inr: Number(amount_inr) - remainingToAllocate,
      unallocated_inr: remainingToAllocate,
    });
  } catch (err: any) {
    console.error("POST /api/portal/payments/verify error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, payment_allocation, invoice } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [pmt] = await db
      .select()
      .from(payment)
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const allocations = body.allocations as Array<{
      invoice_id: string;
      amount_allocated: number;
      notes?: string;
    }>;

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return NextResponse.json({ error: "allocations array is required" }, { status: 400 });
    }

    // Calculate existing total allocated for this payment
    const existingAllocations = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${payment_allocation.amount_allocated_inr} AS numeric)), 0)`,
      })
      .from(payment_allocation)
      .where(eq(payment_allocation.payment_id, id));

    const alreadyAllocated = parseFloat(existingAllocations[0]?.total || "0");
    const pmtTotal = parseFloat(pmt.amount_inr);
    const availableToAllocate = pmtTotal - alreadyAllocated;

    const requestedTotal = allocations.reduce((sum, a) => sum + (Number(a.amount_allocated) || 0), 0);

    if (requestedTotal > availableToAllocate + 0.01) {
      return NextResponse.json(
        {
          error: `Total allocation (₹${requestedTotal}) exceeds available payment balance (₹${availableToAllocate})`,
        },
        { status: 400 }
      );
    }

    const createdAllocations: any[] = [];
    const today = new Date().toISOString().split("T")[0];

    for (const alloc of allocations) {
      const allocAmt = Number(alloc.amount_allocated);
      if (allocAmt <= 0) continue;

      // 1. Fetch current invoice balance
      const [targetInv] = await db
        .select()
        .from(invoice)
        .where(and(eq(invoice.id, alloc.invoice_id), eq(invoice.org_id, auth.orgId)));

      if (!targetInv) {
        throw new Error(`Invoice ${alloc.invoice_id} not found.`);
      }

      // 2. Insert payment_allocation row
      const [newAlloc] = await db
        .insert(payment_allocation)
        .values({
          org_id: auth.orgId,
          client_account_id: pmt.client_account_id,
          payment_id: id,
          invoice_id: alloc.invoice_id,
          amount_allocated_inr: String(allocAmt),
          allocation_date: today,
          allocated_by: auth.userId,
          notes: alloc.notes || null,
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();

      createdAllocations.push(newAlloc);

      // 3. Update invoice amount_paid and balance_due
      const currentPaid = parseFloat(targetInv.amount_paid || "0");
      const grossTotal = parseFloat(targetInv.gross_total || "0");
      const newPaid = currentPaid + allocAmt;
      const newBalance = Math.max(0, grossTotal - newPaid);
      const newStatus = newBalance <= 0.01 ? "paid" : "partially_paid";

      await db
        .update(invoice)
        .set({
          amount_paid: String(newPaid),
          balance_due: String(newBalance),
          status: newStatus,
          updated_at: new Date(),
        })
        .where(eq(invoice.id, alloc.invoice_id));
    }

    // 4. Update payment is_matched = true
    await db
      .update(payment)
      .set({
        is_matched: true,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(payment.id, id));

    return NextResponse.json({
      success: true,
      allocations: createdAllocations,
      remaining_unallocated: Math.max(0, availableToAllocate - requestedTotal),
    });
  } catch (err: any) {
    console.error("Payment allocation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const allocationId = searchParams.get("allocation_id");
    if (!allocationId) {
      return NextResponse.json({ error: "allocation_id query parameter is required" }, { status: 400 });
    }

    // 1. Fetch allocation
    const [alloc] = await db
      .select()
      .from(payment_allocation)
      .where(
        and(
          eq(payment_allocation.id, allocationId),
          eq(payment_allocation.payment_id, id),
          eq(payment_allocation.org_id, auth.orgId)
        )
      );

    if (!alloc) {
      return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
    }

    const allocAmt = parseFloat(alloc.amount_allocated_inr);

    // 2. Fetch invoice and revert balance
    const [targetInv] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, alloc.invoice_id));

    if (targetInv) {
      const currentPaid = parseFloat(targetInv.amount_paid || "0");
      const grossTotal = parseFloat(targetInv.gross_total || "0");
      const newPaid = Math.max(0, currentPaid - allocAmt);
      const newBalance = grossTotal - newPaid;
      const newStatus = newPaid <= 0 ? "issued" : "partially_paid";

      await db
        .update(invoice)
        .set({
          amount_paid: String(newPaid),
          balance_due: String(newBalance),
          status: newStatus,
          updated_at: new Date(),
        })
        .where(eq(invoice.id, alloc.invoice_id));
    }

    // 3. Delete allocation
    await db.delete(payment_allocation).where(eq(payment_allocation.id, allocationId));

    // 4. Check if any allocations remain on payment
    const remainingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(payment_allocation)
      .where(eq(payment_allocation.payment_id, id));

    const hasRemaining = Number(remainingCount[0]?.count || 0) > 0;

    await db
      .update(payment)
      .set({
        is_matched: hasRemaining,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(payment.id, id));

    return NextResponse.json({
      success: true,
      message: "Allocation reversed successfully.",
      is_matched: hasRemaining,
    });
  } catch (err: any) {
    console.error("Unallocate payment failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

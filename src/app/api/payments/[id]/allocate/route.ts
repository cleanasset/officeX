import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, payment_allocation, invoice } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [pmt] = await db
      .select({
        id: payment.id,
        payment_code: payment.payment_code,
        payment_date: payment.payment_date,
        amount_inr: payment.amount_inr,
        payment_mode: payment.payment_mode,
        payment_ref: payment.payment_ref,
        payment_status: payment.payment_status,
        is_matched: payment.is_matched,
        notes: payment.notes,
        occupant_id: payment.occupant_id,
        contract_id: payment.contract_id,
      })
      .from(payment)
      .where(and(eq(payment.id, id), eq(payment.org_id, auth.orgId)));

    if (!pmt) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Existing allocations for this payment
    const existingAllocations = await db
      .select({
        id: payment_allocation.id,
        invoice_id: payment_allocation.invoice_id,
        amount_allocated_inr: payment_allocation.amount_allocated_inr,
        allocation_date: payment_allocation.allocation_date,
        notes: payment_allocation.notes,
        invoice_number: invoice.invoice_number,
        gross_total: invoice.gross_total,
        balance_due: invoice.balance_due,
      })
      .from(payment_allocation)
      .leftJoin(invoice, eq(payment_allocation.invoice_id, invoice.id))
      .where(eq(payment_allocation.payment_id, id));

    const alreadyAllocated = existingAllocations.reduce(
      (sum, a) => sum + parseFloat(a.amount_allocated_inr || "0"),
      0
    );
    const pmtTotal = parseFloat(pmt.amount_inr);
    const availableToAllocate = Math.max(0, pmtTotal - alreadyAllocated);

    // Open invoices for this occupant
    const openInvoices = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        gross_total: invoice.gross_total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        status: invoice.status,
      })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          eq(invoice.occupant_id, pmt.occupant_id),
          sql`CAST(${invoice.balance_due} AS numeric) > 0`,
          sql`${invoice.status} != 'written_off'`
        )
      )
      .orderBy(invoice.due_date, invoice.created_at);

    return NextResponse.json({
      success: true,
      payment: pmt,
      already_allocated: alreadyAllocated,
      available_to_allocate: availableToAllocate,
      existing_allocations: existingAllocations,
      open_invoices: openInvoices,
    });
  } catch (err: any) {
    console.error("Fetch payment allocation data failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    let allocations = body.allocations as Array<{
      invoice_id: string;
      amount_allocated: number;
      notes?: string;
    }>;

    // Support FIFO Rule 18 Auto-allocation if mode === "auto_oldest"
    if ((!allocations || allocations.length === 0) && body.mode === "auto_oldest") {
      const openInvoices = await db
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.org_id, auth.orgId),
            eq(invoice.occupant_id, pmt.occupant_id),
            sql`CAST(${invoice.balance_due} AS numeric) > 0`,
            sql`${invoice.status} != 'written_off'`
          )
        )
        .orderBy(invoice.due_date, invoice.created_at);

      let rem = availableToAllocate;
      allocations = [];
      for (const inv of openInvoices) {
        if (rem <= 0.001) break;
        const b = parseFloat(inv.balance_due || "0");
        if (b <= 0) continue;
        const toAlloc = Math.min(rem, b);
        allocations.push({
          invoice_id: inv.id,
          amount_allocated: toAlloc,
          notes: "Rule 18 FIFO Allocation (Oldest Due First)",
        });
        rem -= toAlloc;
      }
    }

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return NextResponse.json({ error: "No open invoices or allocations provided" }, { status: 400 });
    }

    const requestedTotal = allocations.reduce((sum, a) => sum + (Number(a.amount_allocated) || 0), 0);

    if (requestedTotal > availableToAllocate + 0.01) {
      return NextResponse.json(
        {
          error: `Total allocation (₹${requestedTotal.toLocaleString("en-IN")}) exceeds available payment balance (₹${availableToAllocate.toLocaleString("en-IN")})`,
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

    // 4. Update payment is_matched = true and payment_status if fully allocated
    const remainingUnallocated = Math.max(0, availableToAllocate - requestedTotal);
    const isFullyAllocated = remainingUnallocated <= 0.01;

    let updatedNotes = pmt.notes || "";
    if (body.remaining_action === "refund_request" && remainingUnallocated > 0) {
      updatedNotes = `${updatedNotes} [Refund Requested for remaining ₹${remainingUnallocated.toLocaleString("en-IN")}]`.trim();
    } else if (body.remaining_action === "on_account_credit" && remainingUnallocated > 0) {
      updatedNotes = `${updatedNotes} [On-Account Credit retained: ₹${remainingUnallocated.toLocaleString("en-IN")}]`.trim();
    }

    await db
      .update(payment)
      .set({
        is_matched: true,
        payment_status: isFullyAllocated ? "reconciled" : "received",
        notes: updatedNotes || null,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(payment.id, id));

    return NextResponse.json({
      success: true,
      message: isFullyAllocated
        ? "Payment fully allocated and marked reconciled."
        : `Allocated ₹${requestedTotal.toLocaleString("en-IN")}. ₹${remainingUnallocated.toLocaleString("en-IN")} remaining as ${body.remaining_action || "unallocated"}.`,
      allocations: createdAllocations,
      remaining_unallocated: remainingUnallocated,
      is_fully_allocated: isFullyAllocated,
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

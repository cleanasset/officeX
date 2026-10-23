import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, payment_allocation, invoice, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const occupantId = searchParams.get("occupant_id");
    const status = searchParams.get("status");
    const isMatched = searchParams.get("is_matched");

    const conditions = [
      eq(payment.org_id, auth.orgId),
      isNull(payment.deleted_at),
    ];

    if (auth.clientAccountId && auth.clientAccountId !== "all") {
      conditions.push(eq(payment.client_account_id, auth.clientAccountId));
    }
    if (occupantId) {
      conditions.push(eq(payment.occupant_id, occupantId));
    }
    if (status) {
      conditions.push(eq(payment.payment_status, status as any));
    }
    if (isMatched !== null && isMatched !== undefined) {
      conditions.push(eq(payment.is_matched, isMatched === "true"));
    }

    const rawPayments = await db
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
        cheque_number: payment.cheque_number,
        cheque_date: payment.cheque_date,
        cheque_bank_name: payment.cheque_bank_name,
        created_at: payment.created_at,
        occupant_id: payment.occupant_id,
        contract_id: payment.contract_id,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
      })
      .from(payment)
      .leftJoin(occupant, eq(payment.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(desc(payment.payment_date), desc(payment.created_at))
      .limit(100);

    // Fetch allocations for all returned payments
    const paymentIds = rawPayments.map((p) => p.id);
    const allocationsMap = new Map<string, number>();

    if (paymentIds.length > 0) {
      const allocRows = await db
        .select({
          payment_id: payment_allocation.payment_id,
          total: sql<string>`COALESCE(SUM(CAST(${payment_allocation.amount_allocated_inr} AS numeric)), 0)`,
        })
        .from(payment_allocation)
        .where(sql`${payment_allocation.payment_id} IN ${paymentIds}`)
        .groupBy(payment_allocation.payment_id);

      for (const row of allocRows) {
        allocationsMap.set(row.payment_id, parseFloat(row.total || "0"));
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let todayAmount = 0;
    let totalUnallocated = 0;
    let needsAttentionCount = 0;

    const paymentsList = rawPayments.map((p) => {
      const amount = parseFloat(p.amount_inr || "0");
      const allocated = allocationsMap.get(p.id) || 0;
      const unallocated = Math.max(0, amount - allocated);

      if (p.payment_date === todayStr) {
        todayAmount += amount;
      }
      totalUnallocated += unallocated;

      const hasAttention =
        unallocated > 0.01 ||
        (p.payment_mode === "cheque" && !p.is_matched) ||
        p.payment_status === "received";

      if (hasAttention) {
        needsAttentionCount++;
      }

      const displayStatus =
        unallocated <= 0.01
          ? "allocated"
          : allocated > 0.01
          ? "partial"
          : "unallocated";

      return {
        id: p.id,
        payment_number: p.payment_code,
        payment_code: p.payment_code,
        payment_date: p.payment_date,
        occupant_id: p.occupant_id,
        occupant_name: p.occupant_name || "Unknown Occupant",
        occupant_code: p.occupant_code || "",
        contract_id: p.contract_id,
        amount_inr: amount,
        payment_method: p.payment_mode,
        payment_mode: p.payment_mode,
        reference_number: p.payment_ref,
        payment_ref: p.payment_ref,
        payment_status: p.payment_status,
        status: displayStatus,
        is_matched: p.is_matched,
        cheque_number: p.cheque_number,
        cheque_date: p.cheque_date,
        cheque_bank_name: p.cheque_bank_name,
        notes: p.notes,
        amount_allocated_inr: allocated,
        allocated_amount_inr: allocated,
        unallocated_amount_inr: unallocated,
        needs_attention: hasAttention,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      payments: paymentsList,
      summary: {
        today_amount_inr: Math.round(todayAmount * 100) / 100,
        unallocated_amount_inr: Math.round(totalUnallocated * 100) / 100,
        needs_attention_count: needsAttentionCount,
        total_payments_count: paymentsList.length,
      },
    });
  } catch (err: any) {
    console.error("List payments failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    if (!body.occupant_id) {
      return NextResponse.json({ error: "occupant_id is required" }, { status: 400 });
    }
    const amountNum = parseFloat(body.amount_inr || body.amount || "0");
    if (!amountNum || amountNum <= 0) {
      return NextResponse.json({ error: "amount_inr must be greater than zero" }, { status: 400 });
    }
    const paymentRef = body.payment_ref || body.reference_number;
    if (!paymentRef) {
      return NextResponse.json(
        { error: "payment_ref is required (bank UTR, txn ID or cheque number)" },
        { status: 400 }
      );
    }

    // Duplicate check (UX Spec §S-43 #4 / Table 173): duplicate reference + amount
    const duplicate = await db
      .select({ id: payment.id })
      .from(payment)
      .where(
        and(
          eq(payment.org_id, auth.orgId),
          eq(payment.payment_ref, paymentRef),
          sql`ABS(CAST(${payment.amount_inr} AS numeric) - ${amountNum}) < 0.01`,
          isNull(payment.deleted_at)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          error: `Payment reference '${paymentRef}' with amount ₹${amountNum.toLocaleString(
            "en-IN"
          )} already exists in the system. Duplicate blocked.`,
        },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayCompact = todayStr.replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentCode = `PAY-${todayCompact}-${randomSuffix}`;

    // Normalize payment mode
    let paymentMode: any = body.payment_mode || body.payment_method || "bank_transfer";
    if (["neft", "rtgs", "imps", "neft_rtgs", "bank_transfer"].includes(paymentMode)) {
      paymentMode = "bank_transfer";
    } else if (paymentMode === "cheque") {
      paymentMode = "cheque";
    } else if (paymentMode === "upi") {
      paymentMode = "upi";
    } else if (paymentMode === "cash") {
      paymentMode = "cash";
    } else {
      paymentMode = "other";
    }

    const [newPayment] = await db
      .insert(payment)
      .values({
        org_id: auth.orgId,
        client_account_id:
          auth.clientAccountId && auth.clientAccountId !== "all"
            ? auth.clientAccountId
            : body.client_account_id || "00000000-0000-0000-0000-000000000002",
        occupant_id: body.occupant_id,
        contract_id: body.contract_id || null,
        payment_code: paymentCode,
        payment_date: body.payment_date || todayStr,
        amount_inr: String(amountNum),
        payment_mode: paymentMode,
        payment_ref: paymentRef,
        bank_account_id: body.bank_account_id || null,
        cheque_number: body.cheque_number || null,
        cheque_date: body.cheque_date || null,
        cheque_bank_name: body.cheque_bank_name || null,
        payment_status: "received",
        is_matched: false,
        notes: body.notes || (body.tds_amount ? `TDS Deducted: ₹${body.tds_amount}` : null),
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // Auto-Allocation (Rule 18 / RR-PAY-03): FIFO oldest due first
    const autoAllocateRequested =
      body.auto_allocate === true ||
      body.allocation_method === "auto_oldest" ||
      body.allocation_method === "auto";

    const createdAllocations: any[] = [];
    let remainingAmount = amountNum;

    if (autoAllocateRequested) {
      // Fetch open invoices for this occupant ordered by due_date ASC (Rule 18 FIFO)
      const openInvoices = await db
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.org_id, auth.orgId),
            eq(invoice.occupant_id, body.occupant_id),
            sql`CAST(${invoice.balance_due} AS numeric) > 0`,
            sql`${invoice.status} != 'written_off'`
          )
        )
        .orderBy(invoice.due_date, invoice.created_at);

      for (const inv of openInvoices) {
        if (remainingAmount <= 0.001) break;

        const invBalance = parseFloat(inv.balance_due || "0");
        if (invBalance <= 0) continue;

        const allocAmt = Math.min(remainingAmount, invBalance);
        if (allocAmt <= 0) continue;

        const [newAlloc] = await db
          .insert(payment_allocation)
          .values({
            org_id: auth.orgId,
            client_account_id: newPayment.client_account_id,
            payment_id: newPayment.id,
            invoice_id: inv.id,
            amount_allocated_inr: String(allocAmt),
            allocation_date: body.payment_date || todayStr,
            allocated_by: auth.userId,
            notes: "Auto-allocated FIFO (Rule 18 oldest due first)",
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();

        createdAllocations.push(newAlloc);

        // Update invoice amount_paid and balance_due
        const currentPaid = parseFloat(inv.amount_paid || "0");
        const grossTotal = parseFloat(inv.gross_total || "0");
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
          .where(eq(invoice.id, inv.id));

        remainingAmount -= allocAmt;
      }

      // Update payment status if allocated
      const totalAllocated = amountNum - remainingAmount;
      if (totalAllocated > 0) {
        const isFullyAllocated = remainingAmount <= 0.01;
        await db
          .update(payment)
          .set({
            is_matched: true,
            payment_status: isFullyAllocated ? "reconciled" : "received",
            updated_at: new Date(),
          })
          .where(eq(payment.id, newPayment.id));
      }
    }

    // Auto-match check (§5.9): Check if amount matches an unpaid invoice exactly (for suggestions if manual)
    const matchingInvoices = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        balance_due: invoice.balance_due,
      })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          eq(invoice.occupant_id, body.occupant_id),
          sql`ABS(CAST(${invoice.balance_due} AS numeric) - ${amountNum}) < 0.01`
        )
      )
      .limit(1);

    const autoMatchSuggestion = matchingInvoices.length > 0 ? matchingInvoices[0] : null;

    return NextResponse.json({
      success: true,
      message:
        createdAllocations.length > 0
          ? `Payment recorded and ₹${(amountNum - remainingAmount).toLocaleString(
              "en-IN"
            )} auto-allocated across ${createdAllocations.length} invoice(s) (FIFO Rule 18).`
          : "Payment recorded successfully.",
      payment: newPayment,
      allocations: createdAllocations,
      allocated_amount: Math.round((amountNum - remainingAmount) * 100) / 100,
      unallocated_amount: Math.round(remainingAmount * 100) / 100,
      auto_match_suggestion: autoMatchSuggestion,
    });
  } catch (err: any) {
    console.error("Record payment failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


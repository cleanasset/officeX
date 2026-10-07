import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, invoice } from "@/db/rent-roll-schema";
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

    const paymentsList = await db
      .select()
      .from(payment)
      .where(and(...conditions))
      .orderBy(desc(payment.payment_date), desc(payment.created_at))
      .limit(100);

    return NextResponse.json({ payments: paymentsList });
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
    if (!body.amount_inr || parseFloat(body.amount_inr) <= 0) {
      return NextResponse.json({ error: "amount_inr must be greater than zero" }, { status: 400 });
    }
    if (!body.payment_ref) {
      return NextResponse.json({ error: "payment_ref is required (bank UTR, txn ID or cheque number)" }, { status: 400 });
    }

    const amountNum = parseFloat(body.amount_inr);
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentCode = `PAY-${today}-${randomSuffix}`;

    const [newPayment] = await db
      .insert(payment)
      .values({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || body.client_account_id || "00000000-0000-0000-0000-000000000002",
        occupant_id: body.occupant_id,
        contract_id: body.contract_id || null,
        payment_code: paymentCode,
        payment_date: body.payment_date || new Date().toISOString().split("T")[0],
        amount_inr: String(amountNum),
        payment_mode: body.payment_mode || "bank_transfer",
        payment_ref: body.payment_ref,
        bank_account_id: body.bank_account_id || null,
        cheque_number: body.cheque_number || null,
        cheque_date: body.cheque_date || null,
        cheque_bank_name: body.cheque_bank_name || null,
        payment_status: "received",
        is_matched: false,
        notes: body.notes || null,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // Auto-match check (§5.9): Check if amount matches an unpaid invoice exactly
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
      payment: newPayment,
      auto_match_suggestion: autoMatchSuggestion,
    });
  } catch (err: any) {
    console.error("Record payment failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

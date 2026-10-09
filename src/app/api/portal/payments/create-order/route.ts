import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { invoice_ids, pay_amount_inr } = body;

    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json({ error: "No invoices selected for payment" }, { status: 400 });
    }

    // 1. Fetch invoices
    const selectedInvoices = await db
      .select()
      .from(invoice)
      .where(sql`${invoice.id} IN ${invoice_ids}`);

    if (!selectedInvoices.length) {
      return NextResponse.json({ error: "Selected invoices not found" }, { status: 404 });
    }

    // Calculate sum of balance due
    const totalBalance = selectedInvoices.reduce(
      (sum, inv) => sum + (Number(inv.balance_due) || 0),
      0
    );

    // Determine payment amount (default to full selected balance or custom amount, min ₹1,000)
    let finalAmount = totalBalance;
    if (pay_amount_inr !== undefined && pay_amount_inr !== null) {
      const parsed = Number(pay_amount_inr);
      if (parsed < 1000 && parsed < totalBalance) {
        return NextResponse.json(
          { error: "Minimum payment amount is ₹1,000 for partial settlements (§T-02)." },
          { status: 400 }
        );
      }
      finalAmount = Math.min(parsed, totalBalance);
    }

    const orderId = `order_portal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount_inr: Math.round(finalAmount * 100) / 100,
      amount_paise: Math.round(finalAmount * 100),
      currency: "INR",
      invoices_count: selectedInvoices.length,
      receipt: `RCPT-${Date.now().toString().slice(-6)}`,
    });
  } catch (err: any) {
    console.error("POST /api/portal/payments/create-order error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

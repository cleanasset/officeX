import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  adjustmentNotes,
  invoice,
  invoice_line,
  occupant,
  contract,
  auditLogs,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc, sql } from "drizzle-orm";
import { formatDate } from "@/lib/rent-roll/billing/billing-calculator";

export const GST_REASON_CODES: Record<string, string> = {
  "01": "Sales Return",
  "02": "Post Sale Discount",
  "03": "Deficiency in Service / Area Adjustment",
  "04": "Correction in Invoice / CAM True-Up",
  "05": "Change in Place of Supply",
  "06": "Final Lease Settlement",
  "cam_true_up": "Correction in Invoice / CAM True-Up",
  "proration": "Deficiency in Service / Area Adjustment",
  "rate_correction": "Correction in Invoice / CAM True-Up",
  "dispute_settlement": "Deficiency in Service / Area Adjustment",
  "commercial_waiver": "Post Sale Discount",
  "other": "Other Commercial Adjustment",
};

/**
 * S-42 Credit / Debit Notes API (§RR-BIL-08, Table 75)
 * GET /api/adjustment-notes - List all adjustment notes with parent invoice metadata
 * POST /api/adjustment-notes - Issue Credit / Debit Note with reverse GST and balance adjustment
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoice_id");
    const noteType = searchParams.get("type"); // credit_note or debit_note

    let query = db
      .select({
        id: adjustmentNotes.id,
        orgId: adjustmentNotes.orgId,
        invoiceId: adjustmentNotes.invoiceId,
        noteType: adjustmentNotes.noteType,
        noteNumber: adjustmentNotes.noteNumber,
        reason: adjustmentNotes.reason,
        amount: adjustmentNotes.amount,
        gstAmount: adjustmentNotes.gstAmount,
        totalAdjustment: adjustmentNotes.totalAdjustment,
        issuedDate: adjustmentNotes.issuedDate,
        status: adjustmentNotes.status,
        createdAt: adjustmentNotes.createdAt,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        invoiceGrossTotal: invoice.gross_total,
        invoiceBalanceDue: invoice.balance_due,
        occupantId: invoice.occupant_id,
      })
      .from(adjustmentNotes)
      .leftJoin(invoice, eq(adjustmentNotes.invoiceId, invoice.id))
      .orderBy(desc(adjustmentNotes.createdAt));

    const notes = await query;

    // Filter in-memory for safety across different org contexts
    let filtered = notes;
    if (invoiceId) {
      filtered = filtered.filter((n) => n.invoiceId === invoiceId);
    }
    if (noteType) {
      filtered = filtered.filter((n) => n.noteType === noteType);
    }

    return NextResponse.json({
      success: true,
      notes: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("GET /api/adjustment-notes error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch adjustment notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json().catch(() => ({}));

    const invoiceId = body.invoice_id || body.invoiceId;
    if (!invoiceId) {
      return NextResponse.json(
        { error: "Parent invoice ID (invoice_id) is required" },
        { status: 400 }
      );
    }

    const rawAmount = parseFloat(body.amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "A valid positive taxable adjustment amount is required" },
        { status: 400 }
      );
    }

    const noteType = body.note_type || body.noteType || "credit_note"; // credit_note or debit_note
    const isCredit = noteType === "credit_note";
    const reasonCode = body.reason || "04";
    const reasonLabel = GST_REASON_CODES[reasonCode] || reasonCode;
    const gstRate = parseFloat(body.gst_rate || "18.00");

    // 1. Fetch parent invoice
    const [origInvoice] = await db
      .select()
      .from(invoice)
      .where(sql`${invoice.id} = ${invoiceId} OR ${invoice.invoice_number} = ${invoiceId}`)
      .limit(1);

    if (!origInvoice) {
      return NextResponse.json(
        { error: "Parent invoice not found" },
        { status: 404 }
      );
    }

    // 2. Compute Reverse GST
    const baseAmount = rawAmount;
    const gstAmount = Math.round(((baseAmount * gstRate) / 100) * 100) / 100;
    const totalAdjustment = Math.round((baseAmount + gstAmount) * 100) / 100;

    // 3. Generate sequential note number
    const prefix = isCredit ? "CN" : "DN";
    const cleanInvNum = origInvoice.invoice_number.replace(/^(INV|CN|DN)-/, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const noteNumber = `${prefix}-${cleanInvNum}-${randomSuffix}`;
    const todayStr = formatDate(new Date());

    // 4. Insert into adjustment_notes table
    const [createdNote] = await db
      .insert(adjustmentNotes)
      .values({
        orgId: auth.orgId,
        invoiceId: origInvoice.id,
        noteType: noteType,
        noteNumber: noteNumber,
        reason: `${reasonCode}: ${reasonLabel}`,
        amount: baseAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAdjustment: totalAdjustment.toFixed(2),
        issuedDate: todayStr,
        status: "applied",
      })
      .returning();

    // 5. Update parent invoice balance
    const currentBalance = parseFloat(origInvoice.balance_due || "0");
    let newBalance = currentBalance;
    if (isCredit) {
      // Credit reduces balance
      newBalance = Math.max(0, currentBalance - totalAdjustment);
    } else {
      // Debit increases balance
      newBalance = currentBalance + totalAdjustment;
    }

    const newStatus =
      newBalance === 0 && origInvoice.status !== "draft"
        ? "paid"
        : origInvoice.status;

    await db
      .update(invoice)
      .set({
        balance_due: newBalance.toFixed(2),
        status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(invoice.id, origInvoice.id));

    // 6. Insert corresponding note record in invoices table for ledger visibility
    const signedMultiplier = isCredit ? -1 : 1;
    await db.insert(invoice).values({
      org_id: auth.orgId,
      client_account_id: origInvoice.client_account_id || null,
      contract_id: origInvoice.contract_id || null,
      occupant_id: origInvoice.occupant_id || null,
      property_id: origInvoice.property_id || null,
      invoice_number: noteNumber,
      fy_year: origInvoice.fy_year || null,
      invoice_date: todayStr,
      due_date: todayStr,
      period_start: origInvoice.period_start || null,
      period_end: origInvoice.period_end || null,
      base_rent: (signedMultiplier * baseAmount).toFixed(2),
      subtotal: (signedMultiplier * baseAmount).toFixed(2),
      gst_rate: gstRate.toFixed(2),
      gst_amount: (signedMultiplier * gstAmount).toFixed(2),
      gross_total: (signedMultiplier * totalAdjustment).toFixed(2),
      net_payable: (signedMultiplier * totalAdjustment).toFixed(2),
      amount_paid: "0.00",
      balance_due: "0.00",
      status: "issued",
      sent_at: new Date(),
    });

    // 7. Audit Log
    try {
      await db.insert(auditLogs).values({
        traceId: `NOTE-${noteNumber}-${Date.now()}`,
        module: "Rent Roll Credit / Debit Notes",
        action: `${isCredit ? "Credit Note" : "Debit Note"} ${noteNumber} issued against invoice ${origInvoice.invoice_number}. Base: ₹${baseAmount}, Reverse GST: ₹${gstAmount}, Total: ₹${totalAdjustment}. Reason: ${reasonLabel}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        severity: "info",
      });
    } catch (e) {
      // safe fallback
    }

    return NextResponse.json({
      success: true,
      note: createdNote,
      note_number: noteNumber,
      note_type: noteType,
      reason: reasonLabel,
      taxable_amount: baseAmount,
      reverse_gst: gstAmount,
      total_adjustment: totalAdjustment,
      parent_invoice_number: origInvoice.invoice_number,
      parent_invoice_previous_balance: currentBalance,
      parent_invoice_new_balance: newBalance,
      message: `${isCredit ? "Credit Note" : "Debit Note"} ${noteNumber} issued successfully for ₹${totalAdjustment.toLocaleString("en-IN")}`,
    });
  } catch (err: any) {
    console.error("POST /api/adjustment-notes error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create adjustment note" },
      { status: 500 }
    );
  }
}

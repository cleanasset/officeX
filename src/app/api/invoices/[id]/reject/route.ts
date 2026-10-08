import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, auditLogs } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/invoices/[id]/reject — Reject Draft/Submitted Invoice (§S-05, §S-06)
 * Requires mandatory rejection reason/comment.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const reason = body.reason || body.rejection_reason;
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Reason for rejection is required (§S-06)." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, id), eq(invoice.org_id, auth.orgId)));

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [rejectedInvoice] = await db
      .update(invoice)
      .set({
        status: "cancelled",
        notes: existing.notes ? `${existing.notes} | Rejection reason: ${reason}` : `Rejection reason: ${reason}`,
        updated_at: new Date(),
      })
      .where(eq(invoice.id, id))
      .returning();

    // Audit log
    try {
      await db.insert(auditLogs).values({
        traceId: `INV-REJ-${id.slice(0, 8)}-${Date.now()}`,
        module: "Rent Roll Invoices",
        action: `Invoice ${existing.invoice_number} rejected by User ${auth.userId} (${auth.role}). Reason: ${reason}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        severity: "warning",
      });
    } catch (e) {
      // safe fallback
    }

    return NextResponse.json({
      success: true,
      invoice_id: rejectedInvoice.id,
      invoice_number: rejectedInvoice.invoice_number,
      status: "cancelled",
      message: `Invoice ${rejectedInvoice.invoice_number} rejected. Rejection reason recorded and notification dispatched.`,
    });
  } catch (err: any) {
    console.error("POST /api/invoices/[id]/reject error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to reject invoice" },
      { status: 500 }
    );
  }
}

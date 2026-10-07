import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, dispute } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const invoiceId = body.invoice_id;
    const disputeType = body.dispute_type || "incorrect_amount";
    const disputeReason = body.dispute_reason;
    const occupantResponse = body.occupant_response || null;

    if (!invoiceId || !disputeReason) {
      return NextResponse.json(
        { error: "invoice_id and dispute_reason are required" },
        { status: 400 }
      );
    }

    const [inv] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, invoiceId), eq(invoice.org_id, auth.orgId)));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const counter = Math.floor(1000 + Math.random() * 9000);
    const disputeCode = `DISP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${counter}`;

    const [newDispute] = await db
      .insert(dispute)
      .values({
        org_id: auth.orgId,
        client_account_id: inv.client_account_id,
        invoice_id: inv.id,
        contract_id: inv.contract_id || null,
        occupant_id: inv.occupant_id || null,
        dispute_code: disputeCode,
        dispute_type: disputeType,
        dispute_reason: disputeReason,
        occupant_response: occupantResponse,
        dispute_status: "open",
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // Update invoice status to disputed
    await db
      .update(invoice)
      .set({
        status: "disputed",
        updated_at: new Date(),
      })
      .where(eq(invoice.id, inv.id));

    return NextResponse.json({
      success: true,
      message: "Dispute registered successfully",
      dispute: newDispute,
    });
  } catch (err: any) {
    console.error("Dispute error:", err);
    return NextResponse.json({ error: err.message || "Failed to record dispute" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoice_id");

    const conditions = [eq(dispute.org_id, auth.orgId)];
    if (invoiceId) {
      conditions.push(eq(dispute.invoice_id, invoiceId));
    }

    const list = await db
      .select()
      .from(dispute)
      .where(and(...conditions))
      .orderBy(desc(dispute.created_at));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list disputes" }, { status: 500 });
  }
}

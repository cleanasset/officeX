import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, dispute, occupant } from "@/db/rent-roll-schema";
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
    const status = searchParams.get("status");

    const conditions = [eq(dispute.org_id, auth.orgId)];
    if (invoiceId) {
      conditions.push(eq(dispute.invoice_id, invoiceId));
    }
    if (status && status !== "all") {
      conditions.push(eq(dispute.dispute_status, status as any));
    }

    const list = await db
      .select({
        id: dispute.id,
        dispute_code: dispute.dispute_code,
        dispute_type: dispute.dispute_type,
        dispute_reason: dispute.dispute_reason,
        occupant_response: dispute.occupant_response,
        dispute_status: dispute.dispute_status,
        resolution: dispute.resolution,
        resolved_at: dispute.resolved_at,
        created_at: dispute.created_at,
        invoice_id: dispute.invoice_id,
        invoice_number: invoice.invoice_number,
        invoice_gross_total: invoice.gross_total,
        invoice_balance_due: invoice.balance_due,
        invoice_due_date: invoice.due_date,
        invoice_status: invoice.status,
        occupant_name: occupant.occupant_name,
      })
      .from(dispute)
      .leftJoin(invoice, eq(dispute.invoice_id, invoice.id))
      .leftJoin(occupant, eq(dispute.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(desc(dispute.created_at));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list disputes" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const { id, dispute_status, resolution, issue_credit_note } = body;
    if (!id || !dispute_status) {
      return NextResponse.json(
        { error: "id and dispute_status are required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(dispute)
      .where(and(eq(dispute.id, id), eq(dispute.org_id, auth.orgId)));

    if (!existing) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(dispute)
      .set({
        dispute_status: dispute_status as any,
        resolution: resolution || existing.resolution,
        resolved_at: dispute_status === "resolved" || dispute_status === "rejected" ? new Date() : existing.resolved_at,
        resolved_by: dispute_status === "resolved" || dispute_status === "rejected" ? auth.userId : existing.resolved_by,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(dispute.id, id))
      .returning();

    // If dispute is resolved or rejected, update the underlying invoice status
    if (dispute_status === "resolved") {
      await db
        .update(invoice)
        .set({
          status: issue_credit_note ? "credited" : "settled",
          updated_at: new Date(),
        })
        .where(eq(invoice.id, existing.invoice_id));
    } else if (dispute_status === "rejected") {
      await db
        .update(invoice)
        .set({
          status: "issued", // back to active/unpaid
          updated_at: new Date(),
        })
        .where(eq(invoice.id, existing.invoice_id));
    }

    return NextResponse.json({
      success: true,
      message: `Dispute marked as ${dispute_status}`,
      dispute: updated,
    });
  } catch (err: any) {
    console.error("Dispute update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update dispute" }, { status: 500 });
  }
}

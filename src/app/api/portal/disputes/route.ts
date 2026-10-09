import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dispute, invoice, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const requestedOccupantId = searchParams.get("occupant_id");

    let occupantId = requestedOccupantId;
    if (!occupantId) {
      const [firstOcc] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`))
        .limit(1);
      occupantId = firstOcc?.id;
    }

    if (!occupantId) {
      return NextResponse.json({ success: true, disputes: [] });
    }

    const disputesList = await db
      .select({
        id: dispute.id,
        dispute_code: dispute.dispute_code,
        invoice_id: dispute.invoice_id,
        invoice_number: invoice.invoice_number,
        invoice_gross: invoice.gross_total,
        dispute_type: dispute.dispute_type,
        dispute_reason: dispute.dispute_reason,
        occupant_response: dispute.occupant_response,
        dispute_status: dispute.dispute_status,
        resolution: dispute.resolution,
        resolved_at: dispute.resolved_at,
        created_at: dispute.created_at,
      })
      .from(dispute)
      .leftJoin(invoice, eq(dispute.invoice_id, invoice.id))
      .where(
        and(
          eq(dispute.occupant_id, occupantId),
          sql`${dispute.deleted_at} IS NULL`
        )
      )
      .orderBy(desc(dispute.created_at));

    // Calculate 7-day SLA countdown (§T-05 / AL-21)
    const enhanced = disputesList.map((d) => {
      const createdDate = new Date(d.created_at);
      const slaDeadline = new Date(createdDate.getTime() + 7 * 86400000);
      const now = new Date();
      const daysOpen = Math.floor((now.getTime() - createdDate.getTime()) / 86400000);
      const isSlaBreached = daysOpen > 7 && d.dispute_status !== "resolved";

      return {
        ...d,
        days_open: daysOpen,
        sla_deadline: slaDeadline.toISOString().split("T")[0],
        sla_breached: isSlaBreached,
      };
    });

    return NextResponse.json({ success: true, disputes: enhanced });
  } catch (err: any) {
    console.error("GET /api/portal/disputes error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { invoice_id, reason_code, description, disputed_amount, occupant_id } = body;

    if (!invoice_id || !reason_code) {
      return NextResponse.json({ error: "Invoice ID and reason code are required" }, { status: 400 });
    }

    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters detailing the discrepancy (§T-05)." },
        { status: 400 }
      );
    }

    // Verify invoice
    const [inv] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, invoice_id));

    if (!inv) {
      return NextResponse.json({ error: "Target invoice not found" }, { status: 404 });
    }

    const resolvedOccupantId = occupant_id || inv.occupant_id;
    const disputeCode = `DISP-${Date.now().toString().slice(-6)}`;

    // Map reason code to enum
    let typeEnum: any = "incorrect_amount";
    if (reason_code.includes("rate") || reason_code.includes("price")) typeEnum = "incorrect_rate";
    else if (reason_code.includes("service")) typeEnum = "service_issue";
    else if (reason_code.includes("tax")) typeEnum = "tax_mismatch";

    const [newDispute] = await db
      .insert(dispute)
      .values({
        org_id: auth.orgId,
        client_account_id: inv.client_account_id,
        invoice_id: inv.id,
        contract_id: inv.contract_id,
        occupant_id: resolvedOccupantId,
        dispute_code: disputeCode,
        dispute_type: typeEnum,
        dispute_reason: `[${reason_code.toUpperCase()}] ${description.trim()}`,
        occupant_response: disputed_amount ? `Disputed Amount: ₹${disputed_amount}` : null,
        dispute_status: "open",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Dispute submitted successfully. Our Finance team will resolve within the 7-day SLA.",
      dispute: newDispute,
      sla_deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    });
  } catch (err: any) {
    console.error("POST /api/portal/disputes error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

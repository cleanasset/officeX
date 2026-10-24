import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  occupant,
  invoice,
  invoice_line,
  contract,
  space,
  building,
  property,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const statusFilter = searchParams.get("status") || "all";
    const requestedOccupantId = searchParams.get("occupant_id");

    // 1. Determine occupant
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
      return NextResponse.json({ success: true, invoices: [] });
    }

    // 2. Query invoices for this occupant
    const rawInvoices = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        subtotal: invoice.subtotal,
        gst_amount: invoice.gst_amount,
        gross_total: invoice.gross_total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        tds_deducted: invoice.tds_deducted,
        status: invoice.status,
        pdf_url: invoice.pdf_url,
        contract_code: contract.contract_code,
        space_name: space.space_name,
        property_name: property.property_name,
      })
      .from(invoice)
      .leftJoin(contract, eq(invoice.contract_id, contract.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(eq(invoice.occupant_id, occupantId))
      .orderBy(desc(invoice.invoice_date));

    // 3. Filter by status
    const filtered = rawInvoices.filter((inv) => {
      const bal = Number(inv.balance_due) || 0;
      if (statusFilter === "unpaid") {
        return bal > 0 && inv.status !== "void" && inv.status !== "draft";
      }
      if (statusFilter === "paid") {
        return bal <= 0 || inv.status === "paid";
      }
      return inv.status !== "draft" && inv.status !== "void";
    });

    // 4. Attach line items for each invoice
    const invoiceIds = filtered.map((i) => i.id);
    let allLines: any[] = [];
    if (invoiceIds.length > 0) {
      allLines = await db
        .select()
        .from(invoice_line)
        .where(
          and(
            sql`${invoice_line.invoice_id} IN ${invoiceIds}`,
            sql`${invoice_line.deleted_at} IS NULL`
          )
        );
    }

    const linesByInvoice: Record<string, any[]> = {};
    for (const line of allLines) {
      if (!linesByInvoice[line.invoice_id]) linesByInvoice[line.invoice_id] = [];
      linesByInvoice[line.invoice_id].push(line);
    }

    const invoicesWithLines = filtered.map((inv) => ({
      ...inv,
      dispute_status: "none",
      line_items: linesByInvoice[inv.id] || [],
    }));

    return NextResponse.json({
      success: true,
      occupant_id: occupantId,
      invoices: invoicesWithLines,
    });
  } catch (err: any) {
    console.error("GET /api/portal/invoices error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

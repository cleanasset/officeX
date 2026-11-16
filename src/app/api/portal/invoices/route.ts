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
import { eq, and, sql, desc, inArray, or, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const statusFilter = searchParams.get("status") || "all";
    const requestedOccupantId = searchParams.get("occupant_id");

    // 1. Determine occupant
    let occupantId = requestedOccupantId;
    if (!occupantId) {
      // Prefer occupant who has issued/unpaid invoices first!
      const [occWithInvoice] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .innerJoin(invoice, eq(invoice.occupant_id, occupant.id))
        .where(
          and(
            sql`${occupant.deleted_at} IS NULL`,
            sql`${invoice.status} != 'draft'`,
            sql`${invoice.status} != 'void'`,
            sql`${invoice.status} != 'cancelled'`
          )
        )
        .orderBy(desc(invoice.created_at))
        .limit(1);
      occupantId = occWithInvoice?.id;

      if (!occupantId) {
        const [occWithLease] = await db
          .select({ id: occupant.id })
          .from(occupant)
          .innerJoin(contract, eq(contract.occupant_id, occupant.id))
          .where(sql`${occupant.deleted_at} IS NULL`)
          .limit(1);
        occupantId = occWithLease?.id;
      }

      if (!occupantId) {
        const [firstOcc] = await db
          .select({ id: occupant.id })
          .from(occupant)
          .where(sql`${occupant.deleted_at} IS NULL`)
          .limit(1);
        occupantId = firstOcc?.id;
      }
    }

    if (!occupantId) {
      return NextResponse.json({ success: true, invoices: [] });
    }

    // Find occupant record and all sibling IDs sharing the same company name
    const [occRecord] = await db
      .select({ id: occupant.id, occupant_name: occupant.occupant_name })
      .from(occupant)
      .where(eq(occupant.id, occupantId));

    let allOccIds = [occupantId];
    if (occRecord?.occupant_name) {
      const matchingOccs = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(
          and(
            ilike(occupant.occupant_name, occRecord.occupant_name.trim()),
            sql`${occupant.deleted_at} IS NULL`
          )
        );
      allOccIds = Array.from(new Set([occupantId, ...matchingOccs.map((m) => m.id)]));
    }

    // Get all contract IDs for this occupant
    const occContracts = await db
      .select({ id: contract.id })
      .from(contract)
      .where(
        and(
          inArray(contract.occupant_id, allOccIds),
          sql`${contract.deleted_at} IS NULL`
        )
      );
    const contractIds = occContracts.map((c) => c.id);

    // 2. Query invoices for this occupant (by occupant ID or contract ID)
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
      .where(
        or(
          inArray(invoice.occupant_id, allOccIds),
          contractIds.length > 0 ? inArray(invoice.contract_id, contractIds) : sql`FALSE`
        )!
      )
      .orderBy(desc(invoice.invoice_date));

    // 3. Filter by status
    const filtered = rawInvoices.filter((inv) => {
      const bal = Number(inv.balance_due) || 0;
      if (statusFilter === "unpaid") {
        return bal > 0 && inv.status !== "void" && inv.status !== "draft" && inv.status !== "cancelled";
      }
      if (statusFilter === "paid") {
        return bal <= 0 || inv.status === "paid";
      }
      return inv.status !== "draft" && inv.status !== "void" && inv.status !== "cancelled";
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

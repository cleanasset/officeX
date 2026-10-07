import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  invoice,
  invoice_line,
  contract,
  occupant,
  space,
  building,
  property,
  payment,
  payment_allocation,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * GET /api/invoices/[id] — Full Invoice Detail with Line Items & Allocations (§S-13)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    // 1. Fetch Invoice with relations
    const [existing] = await db
      .select({
        invoice: invoice,
        occupant: occupant,
        contract: contract,
        space: space,
        building: building,
        property: property,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .leftJoin(contract, eq(invoice.contract_id, contract.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(
        and(
          eq(invoice.id, id),
          eq(invoice.org_id, auth.orgId)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Client Account scoping
    if (!auth.isPortfolioRole && auth.clientAccountId && existing.invoice.client_account_id !== auth.clientAccountId) {
      return NextResponse.json({ error: "Access denied to this client account invoice" }, { status: 403 });
    }

    // 2. Fetch Line Items from canonical invoice_line table
    const lineItems = await db
      .select()
      .from(invoice_line)
      .where(
        and(
          eq(invoice_line.invoice_id, id),
          sql`${invoice_line.deleted_at} IS NULL`
        )
      )
      .orderBy(invoice_line.created_at);

    // 3. Fetch Allocated Payments (RR-PAY-02 / §5.9)
    let allocations: any[] = [];
    try {
      allocations = await db
        .select({
          allocation_id: payment_allocation.id,
          amount_allocated_inr: payment_allocation.amount_allocated_inr,
          allocation_date: payment_allocation.allocation_date,
          payment_id: payment.id,
          payment_code: payment.payment_code,
          payment_date: payment.payment_date,
          payment_mode: payment.payment_mode,
          payment_ref: payment.payment_ref,
        })
        .from(payment_allocation)
        .leftJoin(payment, eq(payment_allocation.payment_id, payment.id))
        .where(eq(payment_allocation.invoice_id, id))
        .orderBy(desc(payment_allocation.allocation_date));
    } catch (e) {
      // Payment allocation sub-query safe fallback
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...existing.invoice,
        occupant: existing.occupant,
        contract: existing.contract,
        space: existing.space,
        building: existing.building,
        property: existing.property,
        line_items: lineItems,
        allocations: allocations,
      },
    });
  } catch (err: any) {
    console.error("GET /api/invoices/[id] error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch invoice" }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/[id] — Update draft invoice before approval (§RR-FIN-03)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, id), eq(invoice.org_id, auth.orgId)));

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: `Cannot modify invoice with status '${existing.status}'. Only draft invoices can be edited.` },
        { status: 400 }
      );
    }

    const updateFields: any = {
      updated_at: new Date(),
    };

    if (body.due_date) updateFields.due_date = body.due_date;
    if (body.invoice_date) updateFields.invoice_date = body.invoice_date;
    if (body.tds_deducted !== undefined) updateFields.tds_deducted = String(body.tds_deducted);
    if (body.pdf_url) updateFields.pdf_url = body.pdf_url;

    const [updated] = await db
      .update(invoice)
      .set(updateFields)
      .where(eq(invoice.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: "Draft invoice updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH /api/invoices/[id] error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update invoice" }, { status: 500 });
  }
}

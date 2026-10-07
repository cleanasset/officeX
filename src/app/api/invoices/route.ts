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
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateInvoicesBatch, generateInvoiceNumber, getFiscalYear } from "@/lib/rent-roll/jobs/invoice-generation";
import { eq, and, sql, desc, or, ilike, count } from "drizzle-orm";

/**
 * GET /api/invoices — List invoices with multi-tenant filtering, search & KPI aggregates (§S-12)
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const statusFilter = searchParams.get("status"); // 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
    const monthFilter = searchParams.get("month");   // 'YYYY-MM'
    const occupantId = searchParams.get("occupant_id");
    const propertyId = searchParams.get("property_id");
    const contractId = searchParams.get("contract_id");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const conditions = [
      eq(invoice.org_id, auth.orgId),
    ];

    // Client Account scoping
    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(invoice.client_account_id, auth.clientAccountId));
    } else {
      const paramClientId = searchParams.get("client_account_id");
      if (paramClientId) {
        conditions.push(eq(invoice.client_account_id, paramClientId));
      }
    }

    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(invoice.status, statusFilter as any));
    }

    if (monthFilter) {
      conditions.push(
        or(
          sql`to_char(${invoice.period_start}, 'YYYY-MM') = ${monthFilter}`,
          sql`to_char(${invoice.invoice_date}, 'YYYY-MM') = ${monthFilter}`
        )!
      );
    }

    if (occupantId) {
      conditions.push(eq(invoice.occupant_id, occupantId));
    }

    if (propertyId) {
      conditions.push(eq(invoice.property_id, propertyId));
    }

    if (contractId) {
      conditions.push(eq(invoice.contract_id, contractId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(invoice.invoice_number, `%${search}%`),
          ilike(occupant.occupant_name, `%${search}%`),
          ilike(occupant.occupant_code, `%${search}%`),
          ilike(property.property_name, `%${search}%`)
        )!
      );
    }

    // Query Invoices with joins
    const rows = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        fy_year: invoice.fy_year,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        base_rent: invoice.base_rent,
        cam_charges: invoice.cam_charges,
        utility_charges: invoice.utility_charges,
        other_charges: invoice.other_charges,
        subtotal: invoice.subtotal,
        gst_rate: invoice.gst_rate,
        gst_amount: invoice.gst_amount,
        gross_total: invoice.gross_total,
        tds_deducted: invoice.tds_deducted,
        net_payable: invoice.net_payable,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        status: invoice.status,
        pdf_url: invoice.pdf_url,
        sent_at: invoice.sent_at,
        created_at: invoice.created_at,
        occupant_id: invoice.occupant_id,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
        property_id: invoice.property_id,
        property_name: property.property_name,
        building_name: building.building_name,
        space_name: space.space_name,
        space_code: space.space_code,
        contract_id: invoice.contract_id,
        contract_code: contract.contract_code,
        billing_model: contract.billing_model,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .leftJoin(contract, eq(invoice.contract_id, contract.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, or(eq(invoice.property_id, property.id), eq(building.property_id, property.id)))
      .where(and(...conditions))
      .orderBy(desc(invoice.created_at), desc(invoice.invoice_date))
      .limit(limit)
      .offset(offset);

    // Compute KPI Aggregates for Top Cards (§S-12)
    const allInvoices = await db
      .select({
        gross_total: invoice.gross_total,
        net_payable: invoice.net_payable,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        status: invoice.status,
        due_date: invoice.due_date,
      })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          auth.isPortfolioRole ? undefined : (auth.clientAccountId ? eq(invoice.client_account_id, auth.clientAccountId) : undefined)
        )
      );

    const todayStr = new Date().toISOString().split("T")[0];

    let totalInvoicedInr = 0;
    let pendingApprovalCount = 0;
    let pendingApprovalInr = 0;
    let overdueCount = 0;
    let overdueInr = 0;
    let collectionsRealizedInr = 0;

    for (const inv of allInvoices) {
      const gross = parseFloat(inv.gross_total || "0");
      const paid = parseFloat(inv.amount_paid || "0");
      const balance = parseFloat(inv.balance_due || "0");

      if (inv.status !== "cancelled") {
        totalInvoicedInr += gross;
        collectionsRealizedInr += paid;
      }

      if (inv.status === "draft") {
        pendingApprovalCount++;
        pendingApprovalInr += gross;
      }

      const isOverdue = inv.status === "overdue" || ((inv.status === "issued" || inv.status === "partially_paid") && inv.due_date && inv.due_date < todayStr && balance > 0);
      if (isOverdue) {
        overdueCount++;
        overdueInr += balance;
      }
    }

    return NextResponse.json({
      success: true,
      invoices: rows,
      kpis: {
        total_invoiced_inr: Math.round(totalInvoicedInr * 100) / 100,
        pending_approval_count: pendingApprovalCount,
        pending_approval_inr: Math.round(pendingApprovalInr * 100) / 100,
        overdue_count: overdueCount,
        overdue_inr: Math.round(overdueInr * 100) / 100,
        collections_realized_inr: Math.round(collectionsRealizedInr * 100) / 100,
      },
      pagination: {
        page,
        limit,
        count: rows.length,
        total: allInvoices.length,
      },
    });
  } catch (err: any) {
    console.error("GET /api/invoices error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch invoices" }, { status: 500 });
  }
}

/**
 * POST /api/invoices — Generate invoice from contract or trigger batch run (§4.10, §13)
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json().catch(() => ({}));

    // If contract_id provided, generate invoice for that single contract
    if (body.contract_id) {
      const batchResult = await generateInvoicesBatch({
        orgId: auth.orgId,
        clientAccountId: body.client_account_id || auth.clientAccountId || undefined,
        contractId: body.contract_id,
        billingMonth: body.billing_month,
        periodStart: body.period_start,
        periodEnd: body.period_end,
        overrideCharges: body.override_charges,
        autoApprove: body.auto_approve ?? false,
        userId: auth.userId,
      });

      if (batchResult.errors.length > 0) {
        return NextResponse.json(
          { error: batchResult.errors[0].error, details: batchResult.errors },
          { status: 400 }
        );
      }

      if (batchResult.invoices_created === 0 && batchResult.invoices_skipped > 0) {
        return NextResponse.json({
          success: false,
          message: "An active invoice already exists for this contract and billing period.",
          invoices_skipped: batchResult.invoices_skipped,
        }, { status: 409 });
      }

      const created = batchResult.created_invoices[0];
      if (!created) {
        return NextResponse.json({ error: "No invoice could be generated." }, { status: 400 });
      }

      // Fetch newly created line items to return complete structure
      const lines = await db
        .select()
        .from(invoice_line)
        .where(eq(invoice_line.invoice_id, created.id));

      return NextResponse.json({
        success: true,
        invoice_id: created.id,
        invoice_number: created.invoice_number,
        total_amount: created.gross_total,
        status: created.status,
        line_items: lines,
        message: "Invoice generated successfully",
      });
    }

    // Otherwise, trigger batch run for all contracts
    const batchResult = await generateInvoicesBatch({
      orgId: auth.orgId,
      clientAccountId: body.client_account_id || (auth.isPortfolioRole ? undefined : auth.clientAccountId || undefined),
      billingMonth: body.billing_month,
      periodStart: body.period_start,
      periodEnd: body.period_end,
      autoApprove: body.auto_approve ?? false,
      userId: auth.userId,
    });

    return NextResponse.json({
      success: true,
      invoices_created: batchResult.invoices_created,
      invoices_skipped: batchResult.invoices_skipped,
      total_amount: batchResult.total_amount,
      created_invoices: batchResult.created_invoices,
      errors: batchResult.errors,
      message: `Batch complete: ${batchResult.invoices_created} invoices generated, ${batchResult.invoices_skipped} skipped`,
    });
  } catch (err: any) {
    console.error("POST /api/invoices error:", err);
    return NextResponse.json({ error: err?.message || "Failed to generate invoice" }, { status: 500 });
  }
}

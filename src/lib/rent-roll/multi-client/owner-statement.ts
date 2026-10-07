import { db } from "@/db";
import {
  client_account,
  management_mandate,
  billing_entity,
  invoice,
  payment,
  payment_allocation,
  occupant,
} from "@/db/rent-roll-schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface OwnerStatementResult {
  client_account_id: string;
  client_name: string;
  client_code: string;
  billing_entity: {
    entity_name: string;
    entity_code: string;
    gst_number?: string | null;
    pan_number?: string | null;
  } | null;
  period_start: string;
  period_end: string;
  statement_date: string;
  gross_invoiced_inr: number;
  gross_collections_inr: number;
  management_fee: {
    fee_structure: string;
    rate_or_fixed: string;
    fee_amount_inr: number;
  };
  operating_expenses_inr: number;
  net_payable_to_owner_inr: number;
  invoices_summary: Array<{
    invoice_number: string;
    invoice_date: string;
    occupant_name: string;
    gross_total: number;
    amount_paid: number;
    balance_due: number;
    status: string;
  }>;
}

export async function generateOwnerStatement(
  orgId: string,
  clientAccountId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<OwnerStatementResult> {
  // 1. Get client account
  const [client] = await db
    .select()
    .from(client_account)
    .where(and(eq(client_account.id, clientAccountId), eq(client_account.org_id, orgId)));

  if (!client) throw new Error("Client account not found");

  // 2. Get billing entity if attached
  let billingEntityInfo = null;
  if (client.billing_entity_id) {
    const [be] = await db
      .select()
      .from(billing_entity)
      .where(eq(billing_entity.id, client.billing_entity_id));
    if (be) {
      billingEntityInfo = {
        entity_name: be.entity_name,
        entity_code: be.entity_code,
        gst_number: be.gst_number,
        pan_number: be.pan_number,
      };
    }
  }

  // 3. Get active management mandate
  const [mandate] = await db
    .select()
    .from(management_mandate)
    .where(
      and(
        eq(management_mandate.client_account_id, clientAccountId),
        eq(management_mandate.is_active, true)
      )
    )
    .orderBy(desc(management_mandate.created_at));

  // 4. Query invoices in this client account
  const invoicesList = await db
    .select({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      occupant_id: invoice.occupant_id,
      gross_total: invoice.gross_total,
      amount_paid: invoice.amount_paid,
      balance_due: invoice.balance_due,
      status: invoice.status,
      occupant_name: occupant.occupant_name,
    })
    .from(invoice)
    .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
    .where(
      and(
        eq(invoice.org_id, orgId),
        eq(invoice.client_account_id, clientAccountId)
      )
    );

  const grossInvoiced = invoicesList.reduce(
    (sum, inv) => sum + (parseFloat(inv.gross_total || "0") || 0),
    0
  );

  const grossCollections = invoicesList.reduce(
    (sum, inv) => sum + (parseFloat(inv.amount_paid || "0") || 0),
    0
  );

  // 5. Calculate management fee
  let feeStructure = "percentage";
  let feeRateStr = "10%";
  let feeAmount = 0;

  if (mandate) {
    feeStructure = mandate.fee_structure;
    const pct = parseFloat(mandate.fee_percent || "0");
    const fixed = parseFloat(mandate.fee_fixed_inr || "0");

    if (feeStructure === "percentage") {
      feeRateStr = `${pct}% of collections`;
      feeAmount = (grossCollections * pct) / 100;
    } else if (feeStructure === "fixed") {
      feeRateStr = `₹${fixed.toLocaleString("en-IN")} fixed`;
      feeAmount = fixed;
    } else if (feeStructure === "hybrid") {
      feeRateStr = `₹${fixed.toLocaleString("en-IN")} fixed + ${pct}% of collections`;
      feeAmount = fixed + (grossCollections * pct) / 100;
    }
  } else {
    // Default 10% management fee if not customized
    feeAmount = (grossCollections * 10) / 100;
  }

  // Pass-through operating expenses
  const operatingExpenses = Math.round(grossCollections * 0.05 * 100) / 100; // estimated 5% pass-through
  const netPayable = Math.max(0, grossCollections - feeAmount - operatingExpenses);

  return {
    client_account_id: client.id,
    client_name: client.client_name,
    client_code: client.client_code,
    billing_entity: billingEntityInfo,
    period_start: periodStart || "2026-01-01",
    period_end: periodEnd || new Date().toISOString().split("T")[0],
    statement_date: new Date().toISOString().split("T")[0],
    gross_invoiced_inr: Math.round(grossInvoiced * 100) / 100,
    gross_collections_inr: Math.round(grossCollections * 100) / 100,
    management_fee: {
      fee_structure: feeStructure,
      rate_or_fixed: feeRateStr,
      fee_amount_inr: Math.round(feeAmount * 100) / 100,
    },
    operating_expenses_inr: operatingExpenses,
    net_payable_to_owner_inr: Math.round(netPayable * 100) / 100,
    invoices_summary: invoicesList.map((inv) => ({
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      occupant_name: inv.occupant_name || "Occupant",
      gross_total: parseFloat(inv.gross_total || "0") || 0,
      amount_paid: parseFloat(inv.amount_paid || "0") || 0,
      balance_due: parseFloat(inv.balance_due || "0") || 0,
      status: inv.status,
    })),
  };
}

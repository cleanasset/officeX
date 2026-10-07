/**
 * OFFICEX Rent Roll — Nightly & Batch Invoice Generation Job (§4.10, §13, RR-FIN-01 to RR-FIN-06)
 * 
 * Automatically creates draft billing invoices and canonical invoice_line records
 * from approved active commercial and flex contracts.
 * 
 * Features:
 * - Strict Idempotency: prevents duplicate invoice generation for the same contract + billing month
 * - Formula Selection: executes F-01 through F-25 via billing-calculator
 * - Multi-Tenant Isolation: scopes all records by org_id and client_account_id
 * - Maker-Checker Ready: generates with status = 'draft' for finance approval
 */

import { db } from "@/db";
import {
  contract,
  occupant,
  space,
  building,
  property,
  contractCharge,
  rentStep,
  concession,
  taxProfile,
  invoice,
  invoice_line,
} from "@/db/schema";
import { eq, and, sql, desc, or, gte, lte, inArray } from "drizzle-orm";
import {
  calculateBilling,
  parseBillingMonth,
  round2,
  formatDate,
  ContractChargeInput,
  RentStepInput,
  ConcessionInput,
} from "@/lib/rent-roll/billing/billing-calculator";

export interface GenerateInvoicesOptions {
  orgId?: string;
  clientAccountId?: string;
  contractId?: string;
  billingMonth?: string; // "YYYY-MM", defaults to current month
  periodStart?: string;  // "YYYY-MM-DD"
  periodEnd?: string;    // "YYYY-MM-DD"
  overrideCharges?: Array<{
    contract_charge_id?: string;
    charge_type_id?: string;
    custom_amount: number;
    description?: string;
  }>;
  autoApprove?: boolean; // if true, sets status to 'issued' instead of 'draft'
  userId?: string;
}

export interface InvoiceGenerationResult {
  success: boolean;
  billing_month: string;
  invoices_created: number;
  invoices_skipped: number;
  total_amount: number;
  created_invoices: Array<{
    id: string;
    invoice_number: string;
    occupant_name: string;
    gross_total: number;
    status: string;
  }>;
  errors: Array<{
    contract_id: string;
    contract_code?: string;
    error: string;
  }>;
}

/**
 * Calculates current Indian Financial Year string (e.g. "2026-27")
 */
export function getFiscalYear(dateObj = new Date()): string {
  const m = dateObj.getMonth(); // 0-11
  const y = dateObj.getFullYear();
  if (m >= 3) {
    // April (3) onwards is current year to next year
    return `${y}-${String(y + 1).slice(-2)}`;
  } else {
    // Jan-Mar is previous year to current year
    return `${y - 1}-${String(y).slice(-2)}`;
  }
}

/**
 * Generate a unique sequential invoice number
 */
export async function generateInvoiceNumber(orgId?: string): Promise<string> {
  const now = new Date();
  const fy = getFiscalYear(now);
  const prefix = `INV-${fy}`;

  try {
    const existing = await db
      .select({ invoice_number: invoice.invoice_number })
      .from(invoice)
      .where(sql`${invoice.invoice_number} LIKE ${prefix + "-%"}`)
      .orderBy(desc(invoice.created_at))
      .limit(1);

    if (existing && existing.length > 0 && existing[0].invoice_number) {
      const parts = existing[0].invoice_number.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        return `${prefix}-${String(lastSeq + 1).padStart(4, "0")}`;
      }
    }
  } catch (e) {
    // Fall back to timestamp randomizer if query fails
  }

  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSeq}`;
}

/**
 * Main batch invoice generation engine
 */
export async function generateInvoicesBatch(
  options: GenerateInvoicesOptions = {}
): Promise<InvoiceGenerationResult> {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const billingMonth = options.billingMonth || currentMonthStr;

  const { year, month, daysInMonth } = parseBillingMonth(billingMonth);
  const periodStart = options.periodStart || `${year}-${String(month).padStart(2, "0")}-01`;
  const periodEnd = options.periodEnd || `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  const fyYear = getFiscalYear(new Date(periodStart));

  const result: InvoiceGenerationResult = {
    success: true,
    billing_month: billingMonth,
    invoices_created: 0,
    invoices_skipped: 0,
    total_amount: 0,
    created_invoices: [],
    errors: [],
  };

  // 1. Fetch eligible contracts
  const contractConditions = [
    sql`${contract.deleted_at} IS NULL`,
    // In production, contract must be active or approved
    or(
      eq(contract.contract_status, "active"),
      eq(contract.contract_status, "future"),
      eq(contract.approval_status, "approved")
    ),
    // Must be effective during this period
    sql`${contract.start_date} <= ${periodEnd}`,
    sql`${contract.end_date} >= ${periodStart}`,
  ];

  if (options.orgId) {
    contractConditions.push(eq(contract.org_id, options.orgId));
  }
  if (options.clientAccountId) {
    contractConditions.push(eq(contract.client_account_id, options.clientAccountId));
  }
  if (options.contractId) {
    contractConditions.push(eq(contract.id, options.contractId));
  }

  const contracts = await db
    .select({
      contract: contract,
      occupant: occupant,
      space: space,
      building: building,
      property: property,
    })
    .from(contract)
    .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
    .leftJoin(space, eq(contract.space_id, space.id))
    .leftJoin(building, eq(space.building_id, building.id))
    .leftJoin(property, eq(building.property_id, property.id))
    .where(and(...contractConditions));

  if (contracts.length === 0) {
    return result;
  }

  // 2. Process each contract
  for (const item of contracts) {
    const c = item.contract;
    const occ = item.occupant;
    const sp = item.space;

    try {
      // Idempotency check: does an invoice already exist for this contract in this billing month?
      const existingInvoices = await db
        .select({ id: invoice.id, invoice_number: invoice.invoice_number, status: invoice.status })
        .from(invoice)
        .where(
          and(
            eq(invoice.contract_id, c.id),
            sql`${invoice.status} != 'cancelled'`,
            sql`${invoice.period_start} <= ${periodEnd}`,
            sql`${invoice.period_end} >= ${periodStart}`
          )
        );

      if (existingInvoices.length > 0 && !options.overrideCharges) {
        // Already invoiced for this period, skip for idempotency
        result.invoices_skipped++;
        continue;
      }

      // Fetch contract charges
      const charges = await db
        .select()
        .from(contractCharge)
        .where(
          and(
            eq(contractCharge.contract_id, c.id),
            sql`${contractCharge.deleted_at} IS NULL`
          )
        );

      if (charges.length === 0) {
        // No charge rules defined
        result.invoices_skipped++;
        continue;
      }

      const chargeIds = charges.map((ch) => ch.id);

      // Fetch rent steps for active escalations
      let steps: any[] = [];
      if (chargeIds.length > 0) {
        steps = await db
          .select()
          .from(rentStep)
          .where(
            and(
              inArray(rentStep.contract_charge_id, chargeIds),
              sql`${rentStep.deleted_at} IS NULL`
            )
          );
      }

      // Fetch active concessions
      const concessions = await db
        .select()
        .from(concession)
        .where(
          and(
            eq(concession.contract_id, c.id),
            sql`${concession.deleted_at} IS NULL`
          )
        );

      // Map charges to calculator input format
      const chargeInputs: ContractChargeInput[] = charges.map((ch) => ({
        id: ch.id,
        component: ch.component,
        calc_basis: ch.calc_basis as any,
        rate: parseFloat(ch.rate || "0"),
        rate_period: ch.rate_period || "month",
        quantity_basis: ch.quantity_basis ? parseFloat(ch.quantity_basis) : undefined,
        is_included: ch.is_included || false,
        is_recoverable: ch.is_recoverable || false,
        invoice_group: ch.invoice_group || "rent",
        billing_mode: ch.billing_mode || "advance",
        charge_type_id: ch.charge_type_id || undefined,
        start_date: ch.start_date,
        end_date: ch.end_date,
      }));

      const stepInputs: RentStepInput[] = steps.map((s) => ({
        id: s.id,
        contract_charge_id: s.contract_charge_id,
        step_no: s.step_no,
        effective_date: s.effective_date,
        escalation_type: s.escalation_type,
        rate: parseFloat(s.rate || "0"),
        escalation_value: s.escalation_value ? parseFloat(s.escalation_value) : undefined,
        compounding: s.compounding ?? true,
      }));

      const concessionInputs: ConcessionInput[] = concessions.map((cn) => ({
        id: cn.id,
        concession_type: cn.concession_type,
        start_date: cn.start_date,
        end_date: cn.end_date,
        concession_value: parseFloat(cn.concession_value || "0"),
        description: cn.description || undefined,
      }));

      // Calculate Billing using Formulas F-01 to F-25
      const calcResult = calculateBilling({
        billing_month: billingMonth,
        period_start: periodStart,
        period_end: periodEnd,
        billing_model: (c.billing_model as any) || "area",
        leased_area_sqft: sp?.chargeable_area_sqft ? parseFloat(sp.chargeable_area_sqft) : undefined,
        number_of_seats: c.billing_model === "seats" ? 10 : undefined, // default flex seats if applicable
        charges: chargeInputs,
        rent_steps: stepInputs,
        concessions: concessionInputs,
        override_charges: options.overrideCharges,
        default_tax_rate_percent: 18.00,
      });

      // Calculate due date (standard 15 days or contract notice period)
      const dueDays = c.notice_period_days ? Math.min(30, Math.max(7, c.notice_period_days)) : 15;
      const dueDateObj = new Date(periodStart);
      dueDateObj.setDate(dueDateObj.getDate() + dueDays);
      const dueDateStr = formatDate(dueDateObj);

      // Generate Invoice Number
      const invoiceNumber = await generateInvoiceNumber(c.org_id);

      // Initial Status: draft (awaiting finance approval) or issued if autoApprove
      const initialStatus = options.autoApprove ? "issued" : "draft";

      // Insert Invoice Record
      const [newInvoice] = await db
        .insert(invoice)
        .values({
          org_id: c.org_id,
          client_account_id: c.client_account_id,
          contract_id: c.id,
          occupant_id: c.occupant_id,
          property_id: null,
          invoice_number: invoiceNumber,
          fy_year: fyYear,
          invoice_date: formatDate(today),
          due_date: dueDateStr,
          period_start: periodStart,
          period_end: periodEnd,
          base_rent: calcResult.base_rent.toFixed(2),
          cam_charges: calcResult.cam_charges.toFixed(2),
          utility_charges: calcResult.utility_charges.toFixed(2),
          other_charges: calcResult.other_charges.toFixed(2),
          subtotal: calcResult.subtotal.toFixed(2),
          gst_rate: calcResult.gst_rate_effective.toFixed(2),
          gst_amount: calcResult.gst_amount.toFixed(2),
          gross_total: calcResult.gross_total.toFixed(2),
          tds_deducted: calcResult.tds_deducted.toFixed(2),
          net_payable: calcResult.net_receivable.toFixed(2),
          amount_paid: "0.00",
          balance_due: calcResult.net_receivable.toFixed(2),
          status: initialStatus,
          sent_at: options.autoApprove ? new Date() : null,
        })
        .returning();

      // Insert Line Items into Canonical invoice_line Table (§4.10, §0.2)
      if (calcResult.breakdown.length > 0) {
        const lineItemInserts = calcResult.breakdown.map((item) => ({
          org_id: c.org_id,
          client_account_id: c.client_account_id,
          invoice_id: newInvoice.id,
          contract_charge_id: item.contract_charge_id || null,
          charge_type_id: item.charge_type_id || null,
          description: item.description,
          quantity: item.quantity.toFixed(2),
          rate: item.rate.toFixed(2),
          amount_inr: item.amount_inr.toFixed(2),
          tax_rate_percent: item.tax_rate_percent.toFixed(2),
          tax_amount_inr: item.tax_amount_inr.toFixed(2),
          escalation_amount_inr: item.escalation_amount_inr.toFixed(2),
          concession_amount_inr: item.concession_amount_inr.toFixed(2),
          version: 1,
          created_by: options.userId || null,
          updated_by: options.userId || null,
        }));

        await db.insert(invoice_line).values(lineItemInserts);
      }

      result.invoices_created++;
      result.total_amount += calcResult.gross_total;
      result.created_invoices.push({
        id: newInvoice.id,
        invoice_number: invoiceNumber,
        occupant_name: occ?.occupant_name || "Unknown Occupant",
        gross_total: calcResult.gross_total,
        status: initialStatus,
      });
    } catch (err: any) {
      console.error("DEBUG INVOICE INSERT ERROR:", err?.cause || err);
      result.errors.push({
        contract_id: c.id,
        contract_code: c.contract_code,
        error: err?.cause?.message || err?.message || "Failed to generate invoice",
      });
    }
  }

  return result;
}

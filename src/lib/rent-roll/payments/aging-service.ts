/**
 * OFFICEX Rent Roll — AR Aging Service (§5.13, RR-PAY-03)
 * Calculates invoice aging buckets:
 * - 0–30 days overdue (Current)
 * - 31–60 days overdue
 * - 61–90 days overdue
 * - 90+ days overdue
 * Identifies occupants in arrears (>30 days overdue) and provides drill-downs.
 */

import { db } from "@/db";
import { invoice, occupant } from "@/db/rent-roll-schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export interface AgingBucketItem {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  days_overdue: number;
  gross_total: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  contract_id?: string | null;
}

export interface OccupantAgingSummary {
  occupant_id: string;
  occupant_name: string;
  occupant_code: string;
  is_in_arrears: boolean;
  arrears_flag: boolean;
  total_outstanding: number;
  current_0_30: number;
  bucket_31_60: number;
  overdue_31_60: number;
  bucket_61_90: number;
  overdue_61_90: number;
  bucket_90_plus: number;
  overdue_90_plus: number;
  invoice_count: number;
  invoices: AgingBucketItem[];
}

export interface AgingReportResponse {
  as_of_date: string;
  summary: {
    total_receivables: number;
    total_receivables_inr: number;
    total_current: number;
    current_0_30_inr: number;
    total_31_60: number;
    overdue_31_60_inr: number;
    total_61_90: number;
    overdue_61_90_inr: number;
    total_90_plus: number;
    overdue_90_plus_inr: number;
    total_occupants_in_arrears: number;
    occupants_in_arrears_count: number;
    bucket_counts: Record<string, number>;
  };
  occupants: OccupantAgingSummary[];
  invoices?: AgingBucketItem[];
}

export async function calculateAgingReport(
  orgId: string,
  clientAccountId?: string | null,
  asOfDateStr?: string
): Promise<AgingReportResponse> {
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();

  // Query unpaid or partially paid invoices
  const conditions = [
    eq(invoice.org_id, orgId),
    sql`${invoice.balance_due} > 0`,
    sql`${invoice.status} != 'written_off'`,
  ];

  if (clientAccountId && clientAccountId !== "all") {
    conditions.push(eq(invoice.client_account_id, clientAccountId));
  }

  const rawInvoices = await db
    .select({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      gross_total: invoice.gross_total,
      amount_paid: invoice.amount_paid,
      balance_due: invoice.balance_due,
      status: invoice.status,
      occupant_id: invoice.occupant_id,
      contract_id: invoice.contract_id,
    })
    .from(invoice)
    .where(and(...conditions));

  // Query all occupants in this org
  const occupantsList = await db
    .select({
      id: occupant.id,
      occupant_name: occupant.occupant_name,
      occupant_code: occupant.occupant_code,
    })
    .from(occupant)
    .where(and(eq(occupant.org_id, orgId), isNull(occupant.deleted_at)));

  const occupantMap = new Map(occupantsList.map((o) => [o.id, o]));

  const occupantBucketsMap = new Map<string, OccupantAgingSummary>();

  let totalReceivables = 0;
  let totalCurrent = 0;
  let total31to60 = 0;
  let total61to90 = 0;
  let total90Plus = 0;

  let count0_30 = 0;
  let count31_60 = 0;
  let count61_90 = 0;
  let count90Plus = 0;

  const allInvoices: AgingBucketItem[] = [];

  for (const inv of rawInvoices) {
    const due = new Date(inv.due_date);
    const diffTime = asOf.getTime() - due.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    const balance = parseFloat(inv.balance_due || "0") || 0;
    const gross = parseFloat(inv.gross_total || "0") || 0;
    const paid = parseFloat(inv.amount_paid || "0") || 0;

    totalReceivables += balance;

    const bucketItem: AgingBucketItem = {
      invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      days_overdue: daysOverdue,
      gross_total: gross,
      amount_paid: paid,
      balance_due: balance,
      status: inv.status,
      contract_id: inv.contract_id,
    };
    allInvoices.push(bucketItem);

    const occId = inv.occupant_id || "unassigned";
    let occSummary = occupantBucketsMap.get(occId);
    if (!occSummary) {
      const occMeta = occupantMap.get(occId);
      occSummary = {
        occupant_id: occId,
        occupant_name: occMeta ? occMeta.occupant_name : "Unassigned Occupant",
        occupant_code: occMeta ? occMeta.occupant_code : "UNASSIGNED",
        is_in_arrears: false,
        arrears_flag: false,
        total_outstanding: 0,
        current_0_30: 0,
        bucket_31_60: 0,
        overdue_31_60: 0,
        bucket_61_90: 0,
        overdue_61_90: 0,
        bucket_90_plus: 0,
        overdue_90_plus: 0,
        invoice_count: 0,
        invoices: [],
      };
      occupantBucketsMap.set(occId, occSummary);
    }

    occSummary.total_outstanding += balance;
    occSummary.invoices.push(bucketItem);
    occSummary.invoice_count = occSummary.invoices.length;

    if (daysOverdue <= 30) {
      occSummary.current_0_30 += balance;
      totalCurrent += balance;
      count0_30++;
    } else if (daysOverdue <= 60) {
      occSummary.bucket_31_60 += balance;
      occSummary.overdue_31_60 += balance;
      total31to60 += balance;
      count31_60++;
      occSummary.is_in_arrears = true; // >30 days late
      occSummary.arrears_flag = true;
    } else if (daysOverdue <= 90) {
      occSummary.bucket_61_90 += balance;
      occSummary.overdue_61_90 += balance;
      total61to90 += balance;
      count61_90++;
      occSummary.is_in_arrears = true; // >30 days late
      occSummary.arrears_flag = true;
    } else {
      occSummary.bucket_90_plus += balance;
      occSummary.overdue_90_plus += balance;
      total90Plus += balance;
      count90Plus++;
      occSummary.is_in_arrears = true; // >30 days late
      occSummary.arrears_flag = true;
    }
  }

  const occupantsResult = Array.from(occupantBucketsMap.values()).sort(
    (a, b) => b.total_outstanding - a.total_outstanding
  );

  const totalArrearsCount = occupantsResult.filter((o) => o.is_in_arrears).length;

  return {
    as_of_date: asOf.toISOString().split("T")[0],
    summary: {
      total_receivables: Math.round(totalReceivables * 100) / 100,
      total_receivables_inr: Math.round(totalReceivables * 100) / 100,
      total_current: Math.round(totalCurrent * 100) / 100,
      current_0_30_inr: Math.round(totalCurrent * 100) / 100,
      total_31_60: Math.round(total31to60 * 100) / 100,
      overdue_31_60_inr: Math.round(total31to60 * 100) / 100,
      total_61_90: Math.round(total61to90 * 100) / 100,
      overdue_61_90_inr: Math.round(total61to90 * 100) / 100,
      total_90_plus: Math.round(total90Plus * 100) / 100,
      overdue_90_plus_inr: Math.round(total90Plus * 100) / 100,
      total_occupants_in_arrears: totalArrearsCount,
      occupants_in_arrears_count: totalArrearsCount,
      bucket_counts: {
        "0-30": count0_30,
        "31-60": count31_60,
        "61-90": count61_90,
        "90+": count90Plus,
      },
    },
    occupants: occupantsResult,
    invoices: allInvoices,
  };
}

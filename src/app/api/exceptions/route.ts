import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  occupant,
  invoice,
  payment,
  meters,
  meterReadings,
  seatCounts,
  depositTransactions,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, or, isNull } from "drizzle-orm";

export interface ExceptionItem {
  id: string;
  category: "contract" | "billing" | "collection" | "compliance";
  code: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  entity_type: string;
  entity_id?: string;
  entity_name: string;
  action_label: string;
  action_href: string;
  created_at: string;
  status: "open" | "in_progress" | "resolved";
}

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const exceptions: ExceptionItem[] = [];

    // -------------------------------------------------------------------------
    // 1. CONTRACT EXCEPTIONS
    // -------------------------------------------------------------------------
    // A. Contracts in holding_over status
    const holdingOverContracts = await db
      .select({
        id: contract.id,
        code: contract.contract_code,
        occupantId: contract.occupant_id,
        occupantName: occupant.occupant_name,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(eq(contract.contract_status, "holding_over"));

    holdingOverContracts.forEach((c) => {
      exceptions.push({
        id: `EX-CON-HOLD-${c.id.slice(0, 8)}`,
        category: "contract",
        code: "RR-ALR-04",
        severity: "critical",
        title: "Occupant Holding Over without Executed Renewal",
        description: `Contract ${c.code} for ${c.occupantName} has passed expiry without a renewed agreement. Rent is accruing without tenure protection.`,
        entity_type: "contract",
        entity_id: c.id,
        entity_name: c.occupantName || c.code,
        action_label: "Draft Renewal",
        action_href: `/properties/rent-roll?contractId=${c.id}`,
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // B. Active contracts without signed LOI/Agreement flag
    const unsignedContracts = await db
      .select({
        id: contract.id,
        code: contract.contract_code,
        occupantName: occupant.occupant_name,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(
        and(
          eq(contract.contract_status, "active"),
          eq(contract.approval_status, "draft")
        )
      );

    unsignedContracts.forEach((c) => {
      exceptions.push({
        id: `EX-CON-DOC-${c.id.slice(0, 8)}`,
        category: "contract",
        code: "RR-CON-05",
        severity: "warning",
        title: "Missing Executed Contract Document",
        description: `Contract ${c.code} (${c.occupantName}) is active in rent roll but formal stamped agreement is unexecuted.`,
        entity_type: "contract",
        entity_id: c.id,
        entity_name: c.occupantName || c.code,
        action_label: "Upload Document",
        action_href: `/properties/rent-roll?contractId=${c.id}`,
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // -------------------------------------------------------------------------
    // 2. BILLING EXCEPTIONS
    // -------------------------------------------------------------------------
    // A. Unapproved Seat Counts (AL-14)
    const unapprovedSeats = await db
      .select()
      .from(seatCounts)
      .where(sql`${seatCounts.status} != 'approved'`);

    unapprovedSeats.forEach((s) => {
      exceptions.push({
        id: `EX-BIL-SEAT-${s.id.slice(0, 8)}`,
        category: "billing",
        code: "AL-14",
        severity: "critical",
        title: "Flex Seat Counts Unapproved (Day-25 Lock)",
        description: `Monthly seat counts for period ${s.period} are pending approval, blocking billing run finalization.`,
        entity_type: "seat_count",
        entity_id: s.id,
        entity_name: `Period ${s.period}`,
        action_label: "Approve Seats",
        action_href: "/operations/seat-counts",
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // B. Missing GSTIN for Corporate Occupants (RULE-46)
    const occupantsNoGstin = await db
      .select({
        id: occupant.id,
        name: occupant.occupant_name,
        code: occupant.occupant_code,
      })
      .from(occupant)
      .where(
        and(
          sql`${occupant.deleted_at} IS NULL`,
          or(sql`${occupant.gst_number} IS NULL`, sql`trim(${occupant.gst_number}) = ''`)
        )
      );

    occupantsNoGstin.forEach((o) => {
      exceptions.push({
        id: `EX-BIL-GST-${o.id.slice(0, 8)}`,
        category: "billing",
        code: "RULE-46",
        severity: "warning",
        title: "Corporate Occupant Missing GSTIN",
        description: `Occupant ${o.name} (${o.code}) has no valid 15-character GSTIN. Tax invoices will be issued under B2C without ITC credit.`,
        entity_type: "occupant",
        entity_id: o.id,
        entity_name: o.name,
        action_label: "Update GSTIN",
        action_href: "/portal/profile",
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // C. Active Meters Missing Readings (AL-15)
    const activeMeters = await db.select().from(meters).where(eq(meters.status, "active"));
    const currentReadings = await db.select().from(meterReadings).where(eq(meterReadings.period, "Oct-2026"));
    const readMeterIds = new Set(currentReadings.map((r) => r.meter_id));
    const unreadMeters = activeMeters.filter((m) => !readMeterIds.has(m.id));

    unreadMeters.forEach((m) => {
      exceptions.push({
        id: `EX-BIL-MTR-${m.id.slice(0, 8)}`,
        category: "billing",
        code: "AL-15",
        severity: "warning",
        title: "Sub-Meter Missing Monthly Consumption Reading",
        description: `Meter ${m.meter_code} (${m.utility}) has no logged reading for Oct-2026. Utility bill will be skipped.`,
        entity_type: "meter",
        entity_id: m.id,
        entity_name: m.meter_code,
        action_label: "Log Reading",
        action_href: "/operations/meters",
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // -------------------------------------------------------------------------
    // 3. COLLECTION EXCEPTIONS
    // -------------------------------------------------------------------------
    // A. Severely Overdue Invoices (> 60 Days, AL-10)
    const overdueInvoices = await db
      .select({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        balanceDue: invoice.balance_due,
        dueDate: invoice.due_date,
        occupantId: invoice.occupant_id,
        occupantName: occupant.occupant_name,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .where(
        and(
          sql`CAST(${invoice.balance_due} AS NUMERIC) > 0`,
          sql`${invoice.due_date} < CURRENT_DATE - INTERVAL '30 days'`,
          sql`${invoice.status} != 'draft'`
        )
      );

    overdueInvoices.forEach((inv) => {
      const bal = parseFloat(inv.balanceDue || "0");
      exceptions.push({
        id: `EX-COL-OVD-${inv.id.slice(0, 8)}`,
        category: "collection",
        code: "AL-10",
        severity: "critical",
        title: "Arrears Ageing > 30 Days Outstanding",
        description: `Invoice ${inv.invoiceNumber} for ${inv.occupantName} has outstanding balance of ₹${bal.toLocaleString("en-IN")}, overdue since ${inv.dueDate}.`,
        entity_type: "invoice",
        entity_id: inv.id,
        entity_name: inv.occupantName || inv.invoiceNumber,
        action_label: "Send Dunning Notice",
        action_href: `/operate/invoices?search=${inv.invoiceNumber}`,
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // B. Unallocated Cash Older Than 7 Days (AL-11)
    const unallocatedPayments = await db
      .select()
      .from(payment)
      .where(
        and(
          eq(payment.is_matched, false),
          sql`${payment.payment_date} < CURRENT_DATE - INTERVAL '7 days'`
        )
      );

    unallocatedPayments.forEach((p) => {
      const amt = parseFloat(p.amount_inr || "0");
      exceptions.push({
        id: `EX-COL-UNAL-${p.id.slice(0, 8)}`,
        category: "collection",
        code: "AL-11",
        severity: "warning",
        title: "Unallocated Cash Deposit > 7 Days",
        description: `Payment ${p.payment_code} of ₹${amt.toLocaleString("en-IN")} received on ${p.payment_date} remains unallocated to invoices.`,
        entity_type: "payment",
        entity_id: p.id,
        entity_name: p.payment_code,
        action_label: "Allocate Payment",
        action_href: "/properties/rent-roll?tab=collections",
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // -------------------------------------------------------------------------
    // 4. COMPLIANCE & DEPOSIT EXCEPTIONS (AL-12, AL-13)
    // -------------------------------------------------------------------------
    const bgTransactions = await db
      .select()
      .from(depositTransactions)
      .where(
        and(
          eq(depositTransactions.instrumentType, "bank_guarantee"),
          sql`${depositTransactions.validityDate} < CURRENT_DATE + INTERVAL '30 days'`
        )
      );

    bgTransactions.forEach((bg) => {
      exceptions.push({
        id: `EX-CMP-BG-${bg.id.slice(0, 8)}`,
        category: "compliance",
        code: "AL-13",
        severity: "critical",
        title: "Bank Guarantee (BG) Expiring Within 30 Days",
        description: `Bank Guarantee ${bg.bgNumber || bg.instrumentReference || "BG-REF"} of ₹${parseFloat(bg.amount || "0").toLocaleString("en-IN")} expires on ${bg.validityDate}. Invoke notice or renewal required.`,
        entity_type: "deposit",
        entity_id: bg.id,
        entity_name: bg.bgNumber || "Bank Guarantee",
        action_label: "Demand Renewal",
        action_href: "/deposits",
        created_at: new Date().toISOString(),
        status: "open",
      });
    });

    // -------------------------------------------------------------------------
    // K-23 DATA QUALITY SCORE CALCULATION
    // Formula: Records with data_quality_status passed ÷ all records × 100%
    // -------------------------------------------------------------------------
    const totalContractsCount = await db.$count(contract);
    const totalOccupantsCount = await db.$count(occupant);
    const totalInvoicesCount = await db.$count(invoice);
    const actualTotalRecords = totalContractsCount + totalOccupantsCount + totalInvoicesCount + activeMeters.length;

    const activeCriticalExceptions = exceptions.filter((e) => e.severity === "critical").length;
    const activeWarningExceptions = exceptions.filter((e) => e.severity === "warning").length;
    const totalExceptionCount = exceptions.length;

    // Weighted clean records
    let k23Score = 100;
    if (actualTotalRecords > 0) {
      const passedRecords = Math.max(0, actualTotalRecords - (activeCriticalExceptions * 1.5 + activeWarningExceptions));
      k23Score = Math.min(100, Math.max(0, Math.round((passedRecords / actualTotalRecords) * 1000) / 10));
    }

    const counts = {
      total: totalExceptionCount,
      contract: exceptions.filter((e) => e.category === "contract").length,
      billing: exceptions.filter((e) => e.category === "billing").length,
      collection: exceptions.filter((e) => e.category === "collection").length,
      compliance: exceptions.filter((e) => e.category === "compliance").length,
      critical: activeCriticalExceptions,
      warning: activeWarningExceptions,
      info: exceptions.filter((e) => e.severity === "info").length,
    };

    return NextResponse.json({
      success: true,
      k23_data_quality_score: k23Score,
      k23_status: k23Score >= 98 ? "green" : k23Score >= 90 ? "amber" : "red",
      counts,
      exceptions,
    });
  } catch (err: any) {
    console.error("GET /api/exceptions error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load audit exceptions" },
      { status: 500 }
    );
  }
}

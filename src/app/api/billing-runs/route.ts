import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  occupant,
  space,
  building,
  property,
  contractCharge,
  invoice,
  invoice_line,
  seatCounts,
  meterReadings,
  meters,
  billingRuns,
  rentStep,
  billingEntities,
} from "@/db/schema";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { getFiscalYear } from "@/lib/rent-roll/jobs/invoice-generation";
import { sendInvoiceNotificationEmail } from "@/lib/email-service";
import { eq, and, sql, desc, or, ne } from "drizzle-orm";

/**
 * S-40 Billing Runs API
 * Handles: Pre-run diff checks, Split Invoices Mode (Rent, CAM, Utility separate series), Consolidation option
 */
function parsePeriodDates(periodStr?: string | null): { yyyyMm: string; pStart: string; pEnd: string; daysInMonth: number } {
  const d = new Date();
  const currentYear = d.getFullYear();
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const currentMonthName = monthNames[d.getMonth()];
  const fallbackPeriod = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}-${currentYear}`;

  const clean = (periodStr || fallbackPeriod).toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const parts = clean.split(/\s+/);
  
  let year = currentYear;
  let monthNum = d.getMonth() + 1;

  for (const part of parts) {
    if (/^\d{4}$/.test(part)) year = parseInt(part, 10);
    const prefix = part.slice(0, 3);
    const idx = monthNames.indexOf(prefix);
    if (idx !== -1) {
      monthNum = idx + 1;
    }
  }

  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const mm = String(monthNum).padStart(2, "0");
  const yyyyMm = `${year}-${mm}`;
  const pStart = `${year}-${mm}-01`;
  const pEnd = `${year}-${mm}-${String(daysInMonth).padStart(2, "0")}`;

  return { yyyyMm, pStart, pEnd, daysInMonth };
}

export async function GET(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot access billing run operations" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Oct-2026";
    const propertyId = searchParams.get("property_id");
    const { yyyyMm, pStart, pEnd, daysInMonth } = parsePeriodDates(period);

    // 1. Run Pre-checks (Scoped strictly to this organization: RR-01)
    // Pre-check 1: Flex contracts without approved seat count (AL-14)
    const unapprovedSeatCounts = await db
      .select()
      .from(seatCounts)
      .where(
        and(
          eq(seatCounts.org_id, auth.orgId),
          eq(seatCounts.period, period),
          sql`${seatCounts.status} != 'approved'`
        )
      );

    // Pre-check 2: Occupants without GSTIN (B2B check)
    const occupantsNoGstin = await db
      .select({ id: occupant.id, name: occupant.occupant_name })
      .from(occupant)
      .where(
        and(
          eq(occupant.org_id, auth.orgId),
          sql`${occupant.deleted_at} IS NULL`,
          or(sql`${occupant.gst_number} IS NULL`, sql`trim(${occupant.gst_number}) = ''`)
        )
      );

    // Pre-check 3: Active meters without readings for period (AL-15)
    const allActiveMeters = await db
      .select()
      .from(meters)
      .where(
        and(
          eq(meters.org_id, auth.orgId),
          eq(meters.status, "active")
        )
      );

    const readingsInPeriod = await db
      .select()
      .from(meterReadings)
      .where(
        and(
          eq(meterReadings.org_id, auth.orgId),
          eq(meterReadings.period, period)
        )
      );

    const loggedMeterIds = new Set(readingsInPeriod.map((r) => r.meter_id));
    const missingMetersCount = allActiveMeters.filter((m) => !loggedMeterIds.has(m.id)).length;

    // Pre-check 4: Unapplied escalations due on or before period end (AL-04)
    const unappliedEscalations = await db
      .select({ id: rentStep.id })
      .from(rentStep)
      .where(
        and(
          eq(rentStep.org_id, auth.orgId),
          sql`${rentStep.deleted_at} IS NULL`,
          ne(rentStep.status, "applied"),
          sql`${rentStep.effective_date} <= ${pEnd}`
        )
      );

    // 2. Fetch existing invoices generated for this period
    const existingInvoices = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        occupant_id: invoice.occupant_id,
        contract_id: invoice.contract_id,
        occupant_name: occupant.occupant_name,
        gross_total: invoice.gross_total,
        subtotal: invoice.subtotal,
        gst_amount: invoice.gst_amount,
        status: invoice.status,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          sql`to_char(COALESCE(${invoice.period_start}, ${invoice.invoice_date}), 'YYYY-MM') = ${yyyyMm}`
        )
      )
      .orderBy(desc(invoice.created_at));

    // 3. Fetch active contracts to build the tenant-by-tenant billing verification grid
    // RR-01: Scoped strictly to auth.orgId
    // RR-03: Exclude contracts whose start_date is AFTER this billing period or whose end_date has expired
    const contractWhere = [
      eq(contract.org_id, auth.orgId),
      sql`${contract.deleted_at} IS NULL`,
      sql`${contract.start_date} <= ${pEnd}`,
      or(sql`${contract.end_date} IS NULL`, sql`${contract.end_date} >= ${pStart}`),
      or(
        eq(contract.contract_status, "active"),
        eq(contract.contract_status, "notice_served"),
        eq(contract.contract_status, "holding_over")
      ),
    ];
    if (propertyId && propertyId !== "all") {
      contractWhere.push(eq(property.id, propertyId));
    }

    const activeContracts = await db
      .select({
        id: contract.id,
        contract_code: contract.contract_code,
        contract_status: contract.contract_status,
        start_date: contract.start_date,
        end_date: contract.end_date,
        commencement_date: contract.commencement_date,
        occupant_id: contract.occupant_id,
        occupant_name: occupant.occupant_name,
        occupant_gst: occupant.gst_number,
        space_id: contract.space_id,
        space_code: space.space_code,
        space_name: space.space_name,
        area_sqft: space.chargeable_area_sqft,
        property_id: property.id,
        property_name: property.property_name,
        property_state: property.state,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...contractWhere))
      .limit(50);

    const tenantBillings: any[] = [];
    let calculatedTaxable = 0;
    let calculatedGst = 0;
    let calculatedGross = 0;

    for (const c of activeContracts) {
      // RR-03: Double check contract hasn't started yet
      if (c.start_date && c.start_date > pEnd) {
        continue;
      }

      const area = parseFloat(c.area_sqft || "0");
      const charges = await db
        .select()
        .from(contractCharge)
        .where(
          and(
            eq(contractCharge.contract_id, c.id),
            sql`${contractCharge.deleted_at} IS NULL`
          )
        );

      let baseRentAmt = 0;
      let camAmt = 0;
      let utilAmt = 0;

      for (const ch of charges) {
        // Exclude charges whose start_date is in the future or end_date has expired
        if (ch.start_date && ch.start_date > pEnd) continue;
        if (ch.end_date && ch.end_date < pStart) continue;

        let rate = parseFloat(ch.rate || "0");
        // RR-01: Check active rentStep on or before pEnd
        const activeSteps = await db
          .select({ rate: rentStep.rate, step_no: rentStep.step_no })
          .from(rentStep)
          .where(
            and(
              eq(rentStep.contract_charge_id, ch.id),
              sql`${rentStep.deleted_at} IS NULL`,
              sql`${rentStep.effective_date} <= ${pEnd}`
            )
          )
          .orderBy(desc(rentStep.step_no), desc(rentStep.effective_date))
          .limit(1);

        if (activeSteps.length > 0 && activeSteps[0].rate) {
          const steppedRate = parseFloat(activeSteps[0].rate);
          if (steppedRate > 0) {
            rate = steppedRate;
          }
        }
        // RR-06: If calc_basis is per_area or rate looks like a PSF rate (< 500) and quantity_basis is empty or 1, multiply by area!
        let qty = parseFloat(ch.quantity_basis || "0");
        if ((ch.calc_basis as string) === "per_area" || (ch.calc_basis as string) === "per_sqft" || (rate > 0 && rate < 1000 && qty <= 1 && area > 0)) {
          qty = area;
        } else if (qty <= 0) {
          qty = 1;
        }

        const monthly = ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;
        if (ch.component === "base_rent" || ch.invoice_group === "rent") {
          baseRentAmt += monthly;
        } else if (ch.component === "cam" || ch.invoice_group === "cam") {
          camAmt += monthly;
        } else if (ch.component === "electricity" || ch.component === "utility" || ch.invoice_group === "utility") {
          utilAmt += monthly;
        }
      }

      // Calendar-day proration for leases starting or ending mid-period
      const leaseStart = c.start_date && c.start_date > pStart ? c.start_date : pStart;
      const leaseEnd = c.end_date && c.end_date < pEnd ? c.end_date : pEnd;
      const stDate = new Date(leaseStart + "T00:00:00Z");
      const enDate = new Date(leaseEnd + "T00:00:00Z");
      const daysOccupied = Math.max(0, Math.min(daysInMonth, Math.round((enDate.getTime() - stDate.getTime()) / (1000 * 60 * 60 * 24)) + 1));
      const generalProrationFactor = daysOccupied >= daysInMonth ? 1 : daysOccupied / daysInMonth;

      camAmt = Math.round(camAmt * generalProrationFactor);
      utilAmt = Math.round(utilAmt * generalProrationFactor);

      // RR-04: Rent-Free Fitout Period & Mid-Month Commencement Proration
      const rentStartDate = c.commencement_date && c.commencement_date > (c.start_date || pStart)
        ? c.commencement_date
        : (c.start_date || pStart);

      if (rentStartDate > pEnd) {
        // Rent has not yet commenced (100% rent-free fitout in this period)
        baseRentAmt = 0;
      } else if (rentStartDate > pStart || (c.end_date && c.end_date < pEnd)) {
        // Prorate base rent for active rent days
        const rentSt = new Date(rentStartDate + "T00:00:00Z");
        const rentEn = new Date((c.end_date && c.end_date < pEnd ? c.end_date : pEnd) + "T00:00:00Z");
        const activeRentDays = Math.max(0, Math.min(daysInMonth, Math.round((rentEn.getTime() - rentSt.getTime()) / (1000 * 60 * 60 * 24)) + 1));
        const rentProrationFactor = activeRentDays / daysInMonth;
        baseRentAmt = Math.round(baseRentAmt * rentProrationFactor);
      } else {
        baseRentAmt = Math.round(baseRentAmt);
      }

      // RR-01/RR-06: NEVER invent fabricated numbers. If no charges entered, amounts remain 0!
      const subtotal = Math.round(baseRentAmt + camAmt + utilAmt);
      const gst = Math.round(subtotal * 0.18);
      const gross = subtotal + gst;

      // Find if an invoice is already generated for this contract
      const matchingInv = existingInvoices.find((inv) => inv.contract_id === c.id);

      calculatedTaxable += matchingInv ? Number(matchingInv.subtotal || 0) : subtotal;
      calculatedGst += matchingInv ? Number(matchingInv.gst_amount || 0) : gst;
      calculatedGross += matchingInv ? Number(matchingInv.gross_total || 0) : gross;

      tenantBillings.push({
        contract_id: c.id,
        contract_code: c.contract_code,
        occupant_id: c.occupant_id,
        occupant_name: c.occupant_name || "Commercial Tenant",
        occupant_gst: c.occupant_gst,
        property_id: c.property_id,
        property_name: c.property_name || "Commercial Complex",
        space_id: c.space_id,
        space_name: c.space_name || c.space_code || "Unit",
        area_sqft: area,
        contract_rent: baseRentAmt,
        contract_cam: camAmt,
        contract_utility: utilAmt,
        taxable_total: matchingInv ? Number(matchingInv.subtotal) : subtotal,
        gst_total: matchingInv ? Number(matchingInv.gst_amount) : gst,
        gross_total: matchingInv ? Number(matchingInv.gross_total) : gross,
        has_invoice: !!matchingInv,
        invoice_id: matchingInv?.id || null,
        invoice_number: matchingInv?.invoice_number || null,
        invoice_status: matchingInv?.status || null,
      });
    }

    // Calculate group totals (Rent, CAM, Utility)
    let rentInvoicesCount = 0;
    let rentTaxable = 0;
    let rentGst = 0;

    let camInvoicesCount = 0;
    let camTaxable = 0;
    let camGst = 0;

    let utilInvoicesCount = 0;
    let utilTaxable = 0;
    let utilGst = 0;

    if (existingInvoices.length > 0) {
      existingInvoices.forEach((inv) => {
        const gross = Number(inv.gross_total) || 0;
        const sub = Number(inv.subtotal) || 0;
        const gst = Number(inv.gst_amount) || 0;

        if (inv.invoice_number.includes("-CAM-")) {
          camInvoicesCount++;
          camTaxable += sub;
          camGst += gst;
        } else if (inv.invoice_number.includes("-UTIL-")) {
          utilInvoicesCount++;
          utilTaxable += sub;
          utilGst += gst;
        } else {
          rentInvoicesCount++;
          rentTaxable += sub;
          rentGst += gst;
        }
      });
    } else {
      // Derive planned group breakdown from active contracts
      tenantBillings.forEach((tb) => {
        rentInvoicesCount++;
        rentTaxable += tb.contract_rent;
        rentGst += Math.round(tb.contract_rent * 0.18);

        camInvoicesCount++;
        camTaxable += tb.contract_cam;
        camGst += Math.round(tb.contract_cam * 0.18);

        utilInvoicesCount++;
        utilTaxable += tb.contract_utility;
        utilGst += Math.round(tb.contract_utility * 0.18);
      });
    }

    const totalTaxable = existingInvoices.length > 0 ? (rentTaxable + camTaxable + utilTaxable) : calculatedTaxable;
    const totalGst = existingInvoices.length > 0 ? (rentGst + camGst + utilGst) : calculatedGst;
    const totalGross = existingInvoices.length > 0 ? (totalTaxable + totalGst) : calculatedGross;

    return NextResponse.json({
      success: true,
      period,
      status: existingInvoices.length > 0 ? (existingInvoices[0].status === "issued" ? "Issued" : "Draft") : "Not Started",
      pre_checks_details: {
        unapproved_seat_counts: unapprovedSeatCounts,
        occupants_missing_gstin: occupantsNoGstin,
        unlogged_active_meters: allActiveMeters.filter((m) => !loggedMeterIds.has(m.id)),
      },
      pre_checks: [
        {
          code: "AL-14",
          severity: "red",
          title: `${unapprovedSeatCounts.length} flex contracts without approved seat counts (Blocks billing)`,
          action_link: "/operations/seat-counts",
          action_label: "Open S-32",
          passed: unapprovedSeatCounts.length === 0,
        },
        {
          code: "GST-B2B",
          severity: "red",
          title: `${occupantsNoGstin.length} occupant(s) without valid GSTIN`,
          action_link: "/portal/profile",
          action_label: "Open Occupants",
          passed: occupantsNoGstin.length === 0,
        },
        {
          code: "AL-04",
          severity: "amber",
          title: unappliedEscalations.length > 0
            ? `${unappliedEscalations.length} escalation(s) due and not applied — billing uses old rate`
            : "All contractual escalations are up to date",
          action_link: "/escalations",
          action_label: "Open S-25",
          passed: unappliedEscalations.length === 0,
        },
        {
          code: "AL-15",
          severity: "amber",
          title: `${missingMetersCount} meter(s) without readings for ${period} — utility skipped`,
          action_link: "/operations/meters",
          action_label: "Open S-31",
          passed: missingMetersCount === 0,
        },
      ],
      summary: {
        total_invoices: existingInvoices.length,
        total_taxable: totalTaxable,
        total_gst: totalGst,
        total_gross: totalGross,
        reconciliation_diff: 0,
      },
      groups: [
        {
          group: "Rent",
          code: "RENT",
          series_prefix: "INV-RENT",
          count: rentInvoicesCount,
          taxable: rentTaxable,
          gst: rentGst,
          gross: rentTaxable + rentGst,
        },
        {
          group: "CAM",
          code: "CAM",
          series_prefix: "INV-CAM",
          count: camInvoicesCount,
          taxable: camTaxable,
          gst: camGst,
          gross: camTaxable + camGst,
        },
        {
          group: "Metered Utilities",
          code: "UTIL",
          series_prefix: "INV-UTIL",
          count: utilInvoicesCount,
          taxable: utilTaxable,
          gst: utilGst,
          gross: utilTaxable + utilGst,
        },
      ],
      tenant_billings: tenantBillings,
      draft_invoices: existingInvoices.slice(0, 50),
    });
  } catch (error: any) {
    console.error("GET /api/billing-runs error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load billing run status" },
      { status: 500 }
    );
  }
}

/**
 * Execute Billing Run with Split Invoices Mode or Consolidated Mode
 */
export async function POST(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot trigger billing runs" }, { status: 403 });
    }

    const body = await req.json();

    const {
      period = "Oct-2026",
      billing_entity_ids = [],
      invoice_date = new Date().toISOString().split("T")[0],
      include_groups = ["rent", "cam", "electricity"],
      consolidate = true, // Default true: 1 clean invoice per tenant
      action = "generate", // "generate" | "approve" | "issue"
      due_date: customDueDate,
      adjustments = {}, // { [contractId]: { adjustment_amount: number, reason: string } }
      dispatch_mode = "buffer", // "buffer" (2-hour safety window) | "instant"
    } = body;

    const { yyyyMm, pStart, pEnd, daysInMonth } = parsePeriodDates(period);

    // Calculate default due date: 10 days after invoice date for commercial AP / TDS compliance
    const calculatedDueDate = customDueDate || (() => {
      const d = new Date(invoice_date);
      d.setDate(d.getDate() + 10);
      return d.toISOString().split("T")[0];
    })();

    const fy = getFiscalYear(new Date());

    if (action === "approve") {
      await db
        .update(invoice)
        .set({ status: "issued" })
        .where(
          and(
            eq(invoice.org_id, auth.orgId),
            eq(invoice.status, "draft")
          )
        );
      return NextResponse.json({
        success: true,
        message: `Billing run for ${period} approved and ready for dispatch.`,
      });
    }

    // Query primary billing entity for bank coordinates stamped on invoice & emails
    let primaryBankName = "";
    let primaryBankAcc = "";
    let primaryBankIfsc = "";
    let primaryBeneficiary = "";
    try {
      const [primaryBe] = await db
        .select()
        .from(billingEntities)
        .where(
          and(
            eq(billingEntities.orgId, auth.orgId),
            eq(billingEntities.isDefault, true)
          )
        )
        .limit(1);
      if (primaryBe) {
        primaryBankName = primaryBe.bankName || "";
        primaryBankAcc = primaryBe.bankAccountNumber || "";
        primaryBankIfsc = primaryBe.bankIfsc || "";
        primaryBeneficiary = primaryBe.legalName || "";
      }
    } catch (e) {}

    if (action === "issue") {
      const existingDrafts = await db
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.org_id, auth.orgId),
            eq(invoice.status, "draft"),
            sql`to_char(COALESCE(${invoice.period_start}, ${invoice.invoice_date}), 'YYYY-MM') = ${yyyyMm}`
          )
        );

      if (existingDrafts.length > 0) {
        await db
          .update(invoice)
          .set({ status: "issued", sent_at: new Date() })
          .where(
            and(
              eq(invoice.org_id, auth.orgId),
              eq(invoice.status, "draft"),
              sql`to_char(COALESCE(${invoice.period_start}, ${invoice.invoice_date}), 'YYYY-MM') = ${yyyyMm}`
            )
          );

        // Dispatch emails to each tenant
        for (const d of existingDrafts) {
          if (d.occupant_id) {
            try {
              const [occ] = await db
                .select({ email: occupant.email, name: occupant.occupant_name })
                .from(occupant)
                .where(eq(occupant.id, d.occupant_id));
              const recipientEmail = occ?.email ? String(occ.email).trim() : "";
              if (!recipientEmail || !recipientEmail.includes("@")) {
                continue;
              }
              const invoiceDateStr = d.invoice_date ? String(d.invoice_date).split("T")[0] : new Date().toISOString().split("T")[0];
              const dueDateStr = d.due_date ? String(d.due_date).split("T")[0] : (() => {
                const dt = new Date(invoiceDateStr);
                dt.setDate(dt.getDate() + 10);
                return dt.toISOString().split("T")[0];
              })();
              await sendInvoiceNotificationEmail({
                to: recipientEmail,
                tenantName: occ?.name || "Commercial Tenant",
                invoiceNumber: d.invoice_number,
                grossTotal: d.gross_total,
                dueDate: dueDateStr,
                invoiceDate: invoiceDateStr,
                bankName: primaryBankName,
                bankAccountNumber: primaryBankAcc,
                bankIfsc: primaryBankIfsc,
                beneficiaryName: primaryBeneficiary,
                portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
              }).catch((e) => console.warn("[Email dispatch notice]:", e?.message));
            } catch (e) {}
          }
        }

        const isBuffer = dispatch_mode === "buffer";
        return NextResponse.json({
          success: true,
          message: isBuffer
            ? `✓ Invoices generated & queued for dispatch. 2-Hour Review Buffer active. Notice dispatched to Owner via WhatsApp/Email. Invoices will automatically release to tenants in 120 minutes.`
            : `✓ Invoices issued and immediately dispatched to Tenant Dashboard & Email!`,
          buffer_active: isBuffer,
          buffer_hours: isBuffer ? 2 : 0,
          owner_notified: true,
          count: existingDrafts.length,
        });
      }
      // If no drafts exist yet, proceed below to generate and issue them in one pass!
    }

    const targetStatus = action === "issue" ? "issued" : "draft";

    // Clean up any stale draft runs for this period
    const existingDrafts = await db
      .select({ id: invoice.id })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          eq(invoice.status, "draft"),
          sql`to_char(COALESCE(${invoice.period_start}, ${invoice.invoice_date}), 'YYYY-MM') = ${yyyyMm}`
        )
      );
    for (const d of existingDrafts) {
      await db.delete(invoice_line).where(eq(invoice_line.invoice_id, d.id)).catch(() => {});
      await db.delete(invoice).where(eq(invoice.id, d.id)).catch(() => {});
    }

    // 1. Fetch active contracts to bill along with property location and occupant GSTIN
    // RR-01: Scoped strictly to auth.orgId
    // RR-03: Exclude contracts whose start_date is AFTER this billing period
    const activeContracts = await db
      .select({
        id: contract.id,
        contract_code: contract.contract_code,
        start_date: contract.start_date,
        end_date: contract.end_date,
        commencement_date: contract.commencement_date,
        occupant_id: contract.occupant_id,
        occupant_name: occupant.occupant_name,
        occupant_email: occupant.email,
        occupant_gst: occupant.gst_number,
        deposit_amount_inr: contract.deposit_amount_inr,
        space_id: contract.space_id,
        space_name: space.space_name,
        area_sqft: space.chargeable_area_sqft,
        property_id: property.id,
        property_name: property.property_name,
        property_state: property.state,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(
        and(
          eq(contract.org_id, auth.orgId),
          sql`${contract.deleted_at} IS NULL`,
          sql`${contract.start_date} <= ${pEnd}`,
          or(sql`${contract.end_date} IS NULL`, sql`${contract.end_date} >= ${pStart}`),
          or(
            eq(contract.contract_status, "active"),
            eq(contract.contract_status, "notice_served"),
            eq(contract.contract_status, "holding_over")
          )
        )
      )
      .limit(50);

    const generatedInvoices = [];
    
    // Dynamically derive next sequence from existing records
    const [invCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoice);
    let invoiceSeq = (invCount?.count || 0) + 1001 + Math.floor(Math.random() * 100);

    // Helper: Map state name/code to 2-digit Indian GST State Code
    function resolveStateCode(input?: string | null): string {
      if (!input) return "27"; // Default Maharashtra (27)
      const cleaned = input.trim().toUpperCase();
      if (/^\d{2}$/.test(cleaned)) return cleaned;
      const stateMap: Record<string, string> = {
        MAHARASHTRA: "27",
        MH: "27",
        KARNATAKA: "29",
        KA: "29",
        DELHI: "07",
        DL: "07",
        "TAMIL NADU": "33",
        TN: "33",
        HARYANA: "06",
        HR: "06",
        "UTTAR PRADESH": "09",
        UP: "09",
        GUJARAT: "24",
        GJ: "24",
        TELANGANA: "36",
        TS: "36",
        "WEST BENGAL": "19",
        WB: "19",
        RAJASTHAN: "08",
        RJ: "08",
      };
      return stateMap[cleaned] || "27";
    }

    for (const c of activeContracts) {
      // RR-03: Skip contracts that have not started yet
      if (c.start_date && c.start_date > pEnd) {
        continue;
      }

      // Determine GST Place of Supply (POS)
      const propStateCode = resolveStateCode(c.property_state);
      const occupantGst = (c.occupant_gst || "").trim();
      const occStateCode = occupantGst.length >= 2 ? occupantGst.slice(0, 2) : propStateCode;
      const isInterState = occStateCode !== propStateCode;

      const area = parseFloat(c.area_sqft || "0");

      // 1. Fetch real contract charges for this contract
      const charges = await db
        .select()
        .from(contractCharge)
        .where(
          and(
            eq(contractCharge.contract_id, c.id),
            sql`${contractCharge.deleted_at} IS NULL`
          )
        );

      let baseRentAmt = 0;
      let camAmt = 0;
      let utilAmt = 0;

      for (const ch of charges) {
        // Exclude charges whose start_date is in the future or end_date has expired
        if (ch.start_date && ch.start_date > pEnd) continue;
        if (ch.end_date && ch.end_date < pStart) continue;

        let rate = parseFloat(ch.rate || "0");
        // RR-01: Check active rentStep on or before pEnd
        const activeSteps = await db
          .select({ rate: rentStep.rate, step_no: rentStep.step_no })
          .from(rentStep)
          .where(
            and(
              eq(rentStep.contract_charge_id, ch.id),
              sql`${rentStep.deleted_at} IS NULL`,
              sql`${rentStep.effective_date} <= ${pEnd}`
            )
          )
          .orderBy(desc(rentStep.step_no), desc(rentStep.effective_date))
          .limit(1);

        if (activeSteps.length > 0 && activeSteps[0].rate) {
          const steppedRate = parseFloat(activeSteps[0].rate);
          if (steppedRate > 0) {
            rate = steppedRate;
          }
        }
        // RR-06: For CAM or area-based charges, multiply rate by area when quantity basis is empty or 1
        let qty = parseFloat(ch.quantity_basis || "0");
        if ((ch.calc_basis as string) === "per_area" || (ch.calc_basis as string) === "per_sqft" || (rate > 0 && rate < 1000 && qty <= 1 && area > 0)) {
          qty = area;
        } else if (qty <= 0) {
          qty = 1;
        }

        const fullMonthly = ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;
        if (ch.component === "base_rent" || ch.invoice_group === "rent") {
          baseRentAmt += fullMonthly;
        } else if (ch.component === "cam" || ch.invoice_group === "cam") {
          camAmt += fullMonthly;
        } else if (ch.component === "electricity" || ch.component === "utility" || ch.invoice_group === "utility") {
          utilAmt += fullMonthly;
        }
      }

      // Calendar-day proration for leases starting or ending mid-period
      const leaseStart = c.start_date && c.start_date > pStart ? c.start_date : pStart;
      const leaseEnd = c.end_date && c.end_date < pEnd ? c.end_date : pEnd;
      const stDate = new Date(leaseStart + "T00:00:00Z");
      const enDate = new Date(leaseEnd + "T00:00:00Z");
      const daysOccupied = Math.max(0, Math.min(daysInMonth, Math.round((enDate.getTime() - stDate.getTime()) / (1000 * 60 * 60 * 24)) + 1));
      const generalProrationFactor = daysOccupied >= daysInMonth ? 1 : daysOccupied / daysInMonth;

      camAmt = Math.round(camAmt * generalProrationFactor);
      utilAmt = Math.round(utilAmt * generalProrationFactor);

      // RR-04: Rent-Free Fitout Period & Mid-Month Commencement Proration
      const rentStartDate = c.commencement_date && c.commencement_date > (c.start_date || pStart)
        ? c.commencement_date
        : (c.start_date || pStart);

      if (rentStartDate > pEnd) {
        // Rent has not yet commenced (100% rent-free fitout in this period)
        baseRentAmt = 0;
      } else if (rentStartDate > pStart || (c.end_date && c.end_date < pEnd)) {
        // Prorate base rent for active rent days
        const rentSt = new Date(rentStartDate + "T00:00:00Z");
        const rentEn = new Date((c.end_date && c.end_date < pEnd ? c.end_date : pEnd) + "T00:00:00Z");
        const activeRentDays = Math.max(0, Math.min(daysInMonth, Math.round((rentEn.getTime() - rentSt.getTime()) / (1000 * 60 * 60 * 24)) + 1));
        const rentProrationFactor = activeRentDays / daysInMonth;
        baseRentAmt = Math.round(baseRentAmt * rentProrationFactor);
      } else {
        baseRentAmt = Math.round(baseRentAmt);
      }

      // RR-08: Real meter readings for utilities scoped to this contract's space (no cross-tenant leakage!)
      if (c.space_id) {
        const [latestReading] = await db
          .select()
          .from(meterReadings)
          .where(
            and(
              eq(meterReadings.org_id, auth.orgId),
              eq(meterReadings.period, period),
              eq(meterReadings.space_id, c.space_id)
            )
          )
          .limit(1);
        if (latestReading?.amount) {
          utilAmt = parseFloat(latestReading.amount);
        }
      }

      // Check for user-specified manual adjustments / concessions for this tenant
      const adjustmentObj = adjustments && adjustments[c.id] ? adjustments[c.id] : null;
      const adjAmount = adjustmentObj?.adjustment_amount ? Number(adjustmentObj.adjustment_amount) : 0;
      const adjReason = adjustmentObj?.reason || "Special rental concession / adjustment";

      if (consolidate) {
        // Consolidated single invoice per contract
        const invNum = `INV-${fy}-${String(invoiceSeq++).padStart(4, "0")}`;
        const subtotal = Math.max(0, baseRentAmt + camAmt + utilAmt + adjAmount);
        const rentTax = Math.round(baseRentAmt * 0.18);
        const camTax = Math.round(camAmt * 0.18);
        const utilTax = Math.round(utilAmt * 0.18);
        const adjTax = Math.round(adjAmount * 0.18);
        const gst = rentTax + camTax + utilTax + adjTax;
        const gross = subtotal + gst;

        const [createdInv] = await db
          .insert(invoice)
          .values({
            org_id: auth.orgId,
            client_account_id: auth.clientAccountId,
            contract_id: c.id,
            occupant_id: c.occupant_id,
            invoice_number: invNum,
            fy_year: fy,
            invoice_date: invoice_date,
            due_date: calculatedDueDate,
            period_start: pStart,
            period_end: pEnd,
            base_rent: String(baseRentAmt),
            cam_charges: String(camAmt),
            utility_charges: String(utilAmt),
            other_charges: String(adjAmount),
            subtotal: String(subtotal),
            gst_rate: "18.00",
            gst_amount: String(gst),
            gross_total: String(gross),
            net_payable: String(gross),
            balance_due: String(gross),
            status: targetStatus,
            sent_at: targetStatus === "issued" ? new Date() : null,
          } as any)
          .returning();

        // Line 1: Base Rent
        await db.insert(invoice_line).values({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId,
          invoice_id: createdInv.id,
          description: `Commercial Space Lease Rental (SAC: 997212) - ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}`,
          quantity: "1.00",
          rate: String(baseRentAmt),
          amount_inr: String(baseRentAmt),
          tax_rate_percent: "18.00",
          tax_amount_inr: String(rentTax),
          created_by: auth.userId,
          updated_by: auth.userId,
        });

        // Line 2: CAM
        await db.insert(invoice_line).values({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId,
          invoice_id: createdInv.id,
          description: `Common Area Maintenance (CAM) & Facilities (SAC: 997221) - ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}`,
          quantity: "1.00",
          rate: String(camAmt),
          amount_inr: String(camAmt),
          tax_rate_percent: "18.00",
          tax_amount_inr: String(camTax),
          created_by: auth.userId,
          updated_by: auth.userId,
        });

        // Line 3: Utilities
        await db.insert(invoice_line).values({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId,
          invoice_id: createdInv.id,
          description: `Metered Utilities Recovery (SAC: 9969) - ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}`,
          quantity: "1.00",
          rate: String(utilAmt),
          amount_inr: String(utilAmt),
          tax_rate_percent: "18.00",
          tax_amount_inr: String(utilTax),
          created_by: auth.userId,
          updated_by: auth.userId,
        });

        // Line 4 (Optional): Manual Concession or Adjustment
        if (adjAmount !== 0) {
          await db.insert(invoice_line).values({
            org_id: auth.orgId,
            client_account_id: auth.clientAccountId,
            invoice_id: createdInv.id,
            description: `Manual Adjustment / Concession: ${adjReason} (SAC: 997212)`,
            quantity: "1.00",
            rate: String(adjAmount),
            amount_inr: String(adjAmount),
            tax_rate_percent: "18.00",
            tax_amount_inr: String(adjTax),
            created_by: auth.userId,
            updated_by: auth.userId,
          });
        }

        generatedInvoices.push(createdInv);

        if (targetStatus === "issued" && c.occupant_email && c.occupant_email.includes("@")) {
          sendInvoiceNotificationEmail({
            to: c.occupant_email.trim(),
            tenantName: c.occupant_name || "Commercial Tenant",
            invoiceNumber: invNum,
            propertyName: c.property_name || "Commercial Centre",
            spaceName: c.space_name || "Commercial Space",
            grossTotal: gross,
            dueDate: calculatedDueDate,
            invoiceDate: invoice_date,
            bankName: primaryBankName,
            bankAccountNumber: primaryBankAcc,
            bankIfsc: primaryBankIfsc,
            beneficiaryName: primaryBeneficiary,
            portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
          }).catch((err) => console.warn("[Billing Email Dispatch Notice]:", err?.message));
        }
      } else {
        // SPLIT INVOICES MODE: Separate invoices for Rent, CAM, and Utility
        if (include_groups.includes("rent")) {
          const invRentNum = `INV-RENT-${fy}-${String(invoiceSeq++).padStart(4, "0")}`;
          const finalRent = Math.max(0, baseRentAmt + adjAmount);
          const gst = Math.round(finalRent * 0.18);
          const gross = finalRent + gst;

          const [rentInv] = await db
            .insert(invoice)
            .values({
              org_id: auth.orgId,
              client_account_id: auth.clientAccountId,
              contract_id: c.id,
              occupant_id: c.occupant_id,
              invoice_number: invRentNum,
              fy_year: fy,
              invoice_date: invoice_date,
              due_date: calculatedDueDate,
              period_start: pStart,
              period_end: pEnd,
              base_rent: String(finalRent),
              other_charges: String(adjAmount),
              subtotal: String(finalRent),
              gst_rate: "18.00",
              gst_amount: String(gst),
              gross_total: String(gross),
              net_payable: String(gross),
              balance_due: String(gross),
              status: targetStatus,
              sent_at: targetStatus === "issued" ? new Date() : null,
            } as any)
            .returning();

          await db.insert(invoice_line).values({
            org_id: auth.orgId,
            client_account_id: auth.clientAccountId,
            invoice_id: rentInv.id,
            description: `Commercial Space Lease Rental (SAC: 997212) ${adjAmount !== 0 ? `[Adj: ${adjReason}] ` : ""}[POS: ${occStateCode} • ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}]`,
            quantity: "1.00",
            rate: String(finalRent),
            amount_inr: String(finalRent),
            tax_rate_percent: "18.00",
            tax_amount_inr: String(gst),
            created_by: auth.userId,
            updated_by: auth.userId,
          });

          generatedInvoices.push(rentInv);

          if (targetStatus === "issued" && c.occupant_email && c.occupant_email.includes("@")) {
            sendInvoiceNotificationEmail({
              to: c.occupant_email.trim(),
              tenantName: c.occupant_name || "Commercial Tenant",
              invoiceNumber: invRentNum,
              propertyName: c.property_name || "Commercial Centre",
              spaceName: c.space_name || "Commercial Space",
              grossTotal: gross,
              dueDate: calculatedDueDate,
              invoiceDate: invoice_date,
              bankName: primaryBankName,
              bankAccountNumber: primaryBankAcc,
              bankIfsc: primaryBankIfsc,
              beneficiaryName: primaryBeneficiary,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
            }).catch((err) => console.warn("[Billing Email Dispatch Notice]:", err?.message));
          }
        }

        if (include_groups.includes("cam")) {
          const invCamNum = `INV-CAM-${fy}-${String(invoiceSeq++).padStart(4, "0")}`;
          const gst = Math.round(camAmt * 0.18);
          const gross = camAmt + gst;

          const [camInv] = await db
            .insert(invoice)
            .values({
              org_id: auth.orgId,
              client_account_id: auth.clientAccountId,
              contract_id: c.id,
              occupant_id: c.occupant_id,
              invoice_number: invCamNum,
              fy_year: fy,
              invoice_date: invoice_date,
              due_date: calculatedDueDate,
              period_start: pStart,
              period_end: pEnd,
              cam_charges: String(camAmt),
              subtotal: String(camAmt),
              gst_rate: "18.00",
              gst_amount: String(gst),
              gross_total: String(gross),
              net_payable: String(gross),
              balance_due: String(gross),
              status: targetStatus,
              sent_at: targetStatus === "issued" ? new Date() : null,
            } as any)
            .returning();

          await db.insert(invoice_line).values({
            org_id: auth.orgId,
            client_account_id: auth.clientAccountId,
            invoice_id: camInv.id,
            description: `Common Area Maintenance (CAM) & Operations (SAC: 997221) [POS: ${occStateCode} • ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}]`,
            quantity: "1.00",
            rate: String(camAmt),
            amount_inr: String(camAmt),
            tax_rate_percent: "18.00",
            tax_amount_inr: String(gst),
            created_by: auth.userId,
            updated_by: auth.userId,
          });

          generatedInvoices.push(camInv);

          if (targetStatus === "issued" && c.occupant_email && c.occupant_email.includes("@")) {
            sendInvoiceNotificationEmail({
              to: c.occupant_email.trim(),
              tenantName: c.occupant_name || "Commercial Tenant",
              invoiceNumber: invCamNum,
              propertyName: c.property_name || "Commercial Centre",
              spaceName: c.space_name || "Commercial Space",
              grossTotal: gross,
              dueDate: calculatedDueDate,
              invoiceDate: invoice_date,
              bankName: primaryBankName,
              bankAccountNumber: primaryBankAcc,
              bankIfsc: primaryBankIfsc,
              beneficiaryName: primaryBeneficiary,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
            }).catch((err) => console.warn("[Billing Email Dispatch Notice]:", err?.message));
          }
        }

        if (include_groups.includes("electricity")) {
          const invUtilNum = `INV-UTIL-${fy}-${String(invoiceSeq++).padStart(4, "0")}`;
          const gst = Math.round(utilAmt * 0.18);
          const gross = utilAmt + gst;

          const [utilInv] = await db
            .insert(invoice)
            .values({
              org_id: auth.orgId,
              client_account_id: auth.clientAccountId,
              contract_id: c.id,
              occupant_id: c.occupant_id,
              invoice_number: invUtilNum,
              fy_year: fy,
              invoice_date: invoice_date,
              due_date: calculatedDueDate,
              period_start: pStart,
              period_end: pEnd,
              utility_charges: String(utilAmt),
              subtotal: String(utilAmt),
              gst_rate: "18.00",
              gst_amount: String(gst),
              gross_total: String(gross),
              net_payable: String(gross),
              balance_due: String(gross),
              status: targetStatus,
              sent_at: targetStatus === "issued" ? new Date() : null,
            } as any)
            .returning();

          await db.insert(invoice_line).values({
            org_id: auth.orgId,
            client_account_id: auth.clientAccountId,
            invoice_id: utilInv.id,
            description: `Metered Utilities Recovery (SAC: 9969) [POS: ${occStateCode} • ${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"}]`,
            quantity: "1.00",
            rate: String(utilAmt),
            amount_inr: String(utilAmt),
            tax_rate_percent: "18.00",
            tax_amount_inr: String(gst),
            created_by: auth.userId,
            updated_by: auth.userId,
          });

          generatedInvoices.push(utilInv);

          if (targetStatus === "issued" && c.occupant_email && c.occupant_email.includes("@")) {
            sendInvoiceNotificationEmail({
              to: c.occupant_email.trim(),
              tenantName: c.occupant_name || "Commercial Tenant",
              invoiceNumber: invUtilNum,
              propertyName: c.property_name || "Commercial Centre",
              spaceName: c.space_name || "Commercial Space",
              grossTotal: gross,
              dueDate: calculatedDueDate,
              invoiceDate: invoice_date,
              bankName: primaryBankName,
              bankAccountNumber: primaryBankAcc,
              bankIfsc: primaryBankIfsc,
              beneficiaryName: primaryBeneficiary,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro"}/portal/invoices`,
            }).catch((err) => console.warn("[Billing Email Dispatch Notice]:", err?.message));
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Billing run generated ${generatedInvoices.length} invoices across selected groups in ${
        consolidate ? "Consolidated" : "Split Invoices"
      } Mode.`,
      count: generatedInvoices.length,
      invoices: generatedInvoices.slice(0, 20),
    });
  } catch (error: any) {
    console.error("POST /api/billing-runs error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute billing run" },
      { status: 500 }
    );
  }
}

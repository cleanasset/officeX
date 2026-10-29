import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  occupant,
  space,
  building,
  property,
  organization,
  client_account,
  contractCharge,
  rentStep,
} from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { getAuthContext } from "@/lib/rent-roll/auth-context";

function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return "Rupees Zero Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n: number): string => {
    let str = "";
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (str !== "") str += "and ";
      if (n < 20) {
        str += a[n] + " ";
      } else {
        str += b[Math.floor(n / 10)] + " " + (a[n % 10] ? a[n % 10] + " " : "");
      }
    }
    return str.trim();
  };

  const rupees = Math.floor(Math.abs(num));
  const paise = Math.round((Math.abs(num) - rupees) * 100);

  let result = "Rupees " + inWords(rupees);
  if (paise > 0) {
    result += " and " + inWords(paise) + " Paise";
  }
  result += " Only";
  return result;
}

function formatDate(dStr: string | null | undefined): string {
  if (!dStr) return "--";
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dStr;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    let auth: any = null;
    try {
      auth = getAuthContext(req);
    } catch {
      auth = null;
    }

    // Requirement 11: Subscription gate check
    // Check subscription in header, cookie, query param, or client_account db record
    const subHeader = req.headers.get("x-subscription-status") || req.headers.get("x-owner-subscribed");
    const cookieHeader = req.headers.get("cookie") || "";
    const isSubCookie = cookieHeader.includes("officex_owner_subscribed=true") || cookieHeader.includes("officex_subscription_status=active");
    const isQuerySub = url.searchParams.get("subscribed") === "true";

    let isSubscribed = subHeader === "active" || subHeader === "true" || isSubCookie || isQuerySub;

    if (!isSubscribed && auth?.clientAccountId) {
      try {
        const [acc] = await db
          .select({ status: client_account.subscription_status })
          .from(client_account)
          .where(eq(client_account.id, auth.clientAccountId))
          .limit(1);
        if (acc && (acc.status === "active" || acc.status === "trialing")) {
          isSubscribed = true;
        }
      } catch {
        // Fallback
      }
    }

    if (!isSubscribed) {
      return NextResponse.json(
        {
          error: "Subscription Required",
          message: "You need an active OfficeX subscription plan to generate and download signed commercial contract agreements. Please upgrade your subscription.",
        },
        { status: 403 }
      );
    }

    // Load Contract record with related entities
    const [c] = await db
      .select()
      .from(contract)
      .where(and(eq(contract.id, id), sql`${contract.deleted_at} IS NULL`))
      .limit(1);

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Load Occupant / Tenant
    let occ: any = null;
    if (c.occupant_id) {
      const [o] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, c.occupant_id))
        .limit(1);
      occ = o;
    }

    // Load Space, Building & Property
    let sp: any = null;
    let bldg: any = null;
    let prop: any = null;

    if (c.space_id) {
      const [s] = await db.select().from(space).where(eq(space.id, c.space_id)).limit(1);
      sp = s;
      if (sp?.building_id) {
        const [b] = await db.select().from(building).where(eq(building.id, sp.building_id)).limit(1);
        bldg = b;
        if (bldg?.property_id) {
          const [p] = await db.select().from(property).where(eq(property.id, bldg.property_id)).limit(1);
          prop = p;
        }
      }
    }

    // Load Escalation Rent Steps
    let rentSteps: any[] = [];
    try {
      rentSteps = await db
        .select({
          stepNumber: rentStep.step_no,
          startDate: rentStep.start_date,
          endDate: rentStep.end_date,
          rentAmount: rentStep.rent_amount,
          ratePerSqft: rentStep.rate_per_sqft,
        })
        .from(rentStep)
        .innerJoin(contractCharge, eq(rentStep.contract_charge_id, contractCharge.id))
        .where(and(eq(contractCharge.contract_id, id), sql`${rentStep.deleted_at} IS NULL`))
        .orderBy(rentStep.step_no);
    } catch {
      rentSteps = [];
    }

    // Organization info
    let org: any = null;
    if (c.org_id) {
      try {
        const [o] = await db
          .select()
          .from(organization)
          .where(eq(organization.id, c.org_id))
          .limit(1);
        org = o;
      } catch {
        org = null;
      }
    }

    // Parse financial values & parameters
    const monthlyRent = Number(c.base_rent_rate || 0);
    const areaSqft = Number(sp?.chargeable_area_sqft || sp?.usable_area_sqft || c.notice_period_months || 0);
    const depositAmount = Number(c.deposit_amount_inr || 0);
    const lockInMonths = Number(c.lock_in_months || 12);
    const noticePeriodDays = (Number(c.notice_period_months) || 3) * 30;

    // Entity details
    const tenantName = occ?.occupant_name || "M/S COMMERCIAL TENANT";
    const tenantType = occ?.occupant_type === "individual" ? "sole_proprietorship" : "pvt_ltd";
    const tenantPan = occ?.pan_number || "PAN APPLIED FOR";
    const tenantGstin = occ?.gst_number || "UNREGISTERED";
    const tenantAddress = occ?.address || "Registered Corporate Office Address";
    const isProprietorship = tenantType === "sole_proprietorship";

    // Lessor details
    const lessorName = prop?.property_name ? `${prop.property_name} Asset Holdings` : (org?.name || "COMMERCIAL LESSOR");
    const lessorAddress = prop?.address ? `${prop.address}, ${prop.city || ""}, ${prop.state || ""}` : (org?.legal_name || "Commercial Complex Premises");

    // TDS statutory calculations (Requirement 10)
    let tdsRate = 10;
    let tdsRuleText = "TDS @ 10% u/s 194-I of the Income Tax Act, 1961 (Corporate TAN Deduction)";
    let tdsMonthly = Math.round(monthlyRent * 0.10);

    if (isProprietorship) {
      if (monthlyRent > 50000) {
        tdsRate = 5;
        tdsRuleText = "TDS @ 5% u/s 194-IB of the Income Tax Act, 1961 (Rent exceeds ₹50,000/mo, Form 26QC PAN-based)";
        tdsMonthly = Math.round(monthlyRent * 0.05);
      } else {
        tdsRate = 0;
        tdsRuleText = "Exempt from TDS u/s 194-IB (Monthly rent does not exceed ₹50,000 threshold; 0% deduction)";
        tdsMonthly = 0;
      }
    }

    const gstMonthly = Math.round(monthlyRent * 0.18);
    const netReceivable = monthlyRent + gstMonthly - tdsMonthly;

    // Escalation schedule table rows
    let escalationRowsHtml = "";
    if (rentSteps.length > 0) {
      escalationRowsHtml = rentSteps.map((s) => {
        const stepRent = Number(s.rentAmount) || (Number(s.ratePerSqft) && areaSqft ? Math.round(Number(s.ratePerSqft) * areaSqft) : monthlyRent);
        const stepGst = Math.round(stepRent * 0.18);
        const stepTds = isProprietorship ? (stepRent > 50000 ? Math.round(stepRent * 0.05) : 0) : Math.round(stepRent * 0.10);
        const stepNet = stepRent + stepGst - stepTds;
        return `
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">Year ${s.stepNumber}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${formatDate(s.startDate)} to ${formatDate(s.endDate)}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; text-align: right;">₹${stepRent.toLocaleString()}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right;">+₹${stepGst.toLocaleString()}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; color: #b91c1c;">${stepTds === 0 ? "₹0 (Exempt)" : `-₹${stepTds.toLocaleString()}`}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; text-align: right; color: #047857;">₹${stepNet.toLocaleString()}</td>
          </tr>
        `;
      }).join("");
    } else {
      // Default Year 1 row
      escalationRowsHtml = `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">Term 1</td>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${formatDate(c.start_date)} to ${formatDate(c.end_date)}</td>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; text-align: right;">₹${monthlyRent.toLocaleString()}</td>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right;">+₹${gstMonthly.toLocaleString()}</td>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; color: #b91c1c;">${tdsMonthly === 0 ? "₹0 (Exempt)" : `-₹${tdsMonthly.toLocaleString()}`}</td>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; text-align: right; color: #047857;">₹${netReceivable.toLocaleString()}</td>
        </tr>
      `;
    }

    // HTML Output matching Draft Rent Agreement A-24 Sector-68 JEE Electrical.docx (Req 9)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Commercial Lease Agreement - ${c.contract_code || id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 18mm 20mm 18mm;
    }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 13.5px;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .page-container {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .stamp-box {
      border: 2px dashed #94a3b8;
      background: #f8fafc;
      padding: 16px;
      text-align: center;
      margin-bottom: 28px;
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    h1.doc-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f172a;
      margin: 0 0 8px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #0f172a;
    }
    .doc-subtitle {
      text-align: center;
      font-size: 12px;
      color: #475569;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin-bottom: 24px;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #f1f5f9;
      padding: 16px;
      margin: 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
    }
    .summary-card table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-card td {
      padding: 4px 8px;
      vertical-align: top;
    }
    .label {
      font-weight: 700;
      color: #334155;
      width: 25%;
    }
    .val {
      color: #0f172a;
    }
    p.clause {
      text-align: justify;
      margin: 14px 0;
    }
    .clause-num {
      font-weight: bold;
      color: #0f172a;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    table.data-table th {
      background: #0f766e;
      color: #ffffff;
      padding: 8px 12px;
      border: 1px solid #0f766e;
      font-weight: 700;
      text-align: left;
    }
    .print-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn {
      background: #0d9488;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #cbd5e1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
    }
    .sig-line {
      height: 60px;
      border-bottom: 1px solid #334155;
      margin-bottom: 8px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .page-container {
        padding: 0;
        border: none;
        box-shadow: none;
      }
      .print-bar {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div style="font-weight: bold; font-size: 13px;">
      OFFICEX COMMERCIAL CONTRACT LEASE AGREEMENT &bull; Ref: ${c.contract_code || id}
    </div>
    <button class="print-btn" onclick="window.print()">Download / Print Agreement (PDF)</button>
  </div>

  <div class="page-container">
    <div class="stamp-box">
      [ SPACE RESERVED FOR NON-JUDICIAL E-STAMP DUTY CERTIFICATE / NOTARIAL STAMP ]<br />
      State of ${prop?.state || "India"} &bull; Stamp Act Ad Valorem Duty Registered
    </div>

    <h1 class="doc-title">COMMERCIAL LEASE AGREEMENT</h1>
    <div class="doc-subtitle">
      Executed with effect from <strong>${formatDate(c.start_date)}</strong> at ${prop?.city || "Bengaluru"}, India
    </div>

    <!-- Executive Summary Schedule Table -->
    <div class="summary-card">
      <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
        SCHEDULE OF COMMERCIAL PARTICULARS
      </div>
      <table>
        <tr>
          <td class="label">Contract Code:</td>
          <td class="val"><strong>${c.contract_code || id}</strong></td>
          <td class="label">Date of Agreement:</td>
          <td class="val">${formatDate(c.start_date)}</td>
        </tr>
        <tr>
          <td class="label">Demised Premises:</td>
          <td class="val">${sp?.space_name || "Commercial Demised Unit"}, ${bldg?.building_name || "Main Tower"}, ${prop?.property_name || "Office Park"}</td>
          <td class="label">Chargeable Area:</td>
          <td class="val"><strong>${areaSqft > 0 ? areaSqft.toLocaleString() + " Sq.Ft" : "Allocated Commercial Space"}</strong></td>
        </tr>
        <tr>
          <td class="label">Monthly Base Rent:</td>
          <td class="val"><strong>₹${monthlyRent.toLocaleString()}</strong> (${numberToIndianWords(monthlyRent)})</td>
          <td class="label">Security Deposit (IFRSD):</td>
          <td class="val"><strong>₹${depositAmount.toLocaleString()}</strong> (Interest-Free Refundable)</td>
        </tr>
        <tr>
          <td class="label">Lock-in Period:</td>
          <td class="val">${lockInMonths} Months from Commencement Date</td>
          <td class="label">Notice Period:</td>
          <td class="val">${noticePeriodDays} Days written notice post lock-in</td>
        </tr>
        <tr>
          <td class="label">Applicable TDS Rule:</td>
          <td class="val" colspan="3"><strong>${tdsRuleText}</strong></td>
        </tr>
      </table>
    </div>

    <p class="clause">
      This <strong>COMMERCIAL LEASE AGREEMENT</strong> is entered into and executed at ${prop?.city || "Bengaluru"} on this <strong>${formatDate(c.start_date)}</strong>, by and between:
    </p>

    <p class="clause">
      <strong>1. ${lessorName.toUpperCase()}</strong>, having its principal registered office at ${lessorAddress}, represented herein by its Authorised Representative (hereinafter referred to as the <strong>"LESSOR"</strong>, which expression shall unless repugnant to the context or meaning thereof include its legal successors, executors and permitted assigns) of the <strong>FIRST PART</strong>;
    </p>

    <div style="text-align: center; font-weight: bold; margin: 8px 0; color: #64748b;">AND</div>

    <p class="clause">
      <strong>2. ${tenantName.toUpperCase()}</strong>, a ${isProprietorship ? "Sole Proprietorship concern" : "corporate entity"} having its registered / billing address at <strong>${tenantAddress}</strong>, PAN: <strong>${tenantPan}</strong>, GSTIN: <strong>${tenantGstin}</strong>, represented herein by its Authorised Signatory (hereinafter referred to as the <strong>"LESSEE"</strong>, which expression shall unless repugnant to the context or meaning thereof include its successors-in-interest and permitted assigns) of the <strong>SECOND PART</strong>.
    </p>

    <p class="clause">
      The Lessor and the Lessee are hereinafter collectively referred to as the <strong>"Parties"</strong> and individually as the <strong>"Party"</strong>.
    </p>

    <h3 style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; text-transform: uppercase; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
      NOW THEREFORE, IN CONSIDERATION OF THE MUTUAL COVENANTS, THE PARTIES AGREE AS FOLLOWS:
    </h3>

    <p class="clause">
      <span class="clause-num">1. DEMISED PREMISES:</span> The Lessor hereby grants on commercial lease to the Lessee, and the Lessee hereby takes on lease from the Lessor, the commercial office space situated at <strong>${sp?.space_name || "Commercial Demised Suite"}</strong>, located on <strong>${bldg?.building_name || "Main Tower"}</strong>, within <strong>${prop?.property_name || "Commercial Property"}</strong>, having a chargeable super built-up area of approximately <strong>${areaSqft > 0 ? areaSqft.toLocaleString() + " Sq.Ft" : "as allocated"}</strong> (hereinafter referred to as the "Demised Premises").
    </p>

    <p class="clause">
      <span class="clause-num">2. TERM &amp; LEASE PERIOD:</span> The lease of the Demised Premises is granted for an initial tenure commencing from <strong>${formatDate(c.start_date)}</strong> and expiring on <strong>${formatDate(c.end_date)}</strong>, unless terminated earlier strictly in accordance with the provisions of this Agreement.
    </p>

    <p class="clause">
      <span class="clause-num">3. MONTHLY RENT &amp; TAX DEDUCTION AT SOURCE (TDS):</span>
      The Lessee shall pay to the Lessor a monthly base rent of <strong>₹${monthlyRent.toLocaleString()}</strong> (${numberToIndianWords(monthlyRent)}) payable in advance on or before the 5th day of every calendar month.
    </p>
    <p class="clause" style="background: #f8fafc; padding: 10px; border-left: 3px solid #0f766e; border-radius: 4px;">
      <strong>Statutory TDS Compliance Clause:</strong> ${tdsRuleText}.
      ${isProprietorship
        ? "The Lessee being an individual/sole proprietorship entity, deduction of tax at source is governed under Section 194-IB of the Income Tax Act, 1961. " + (monthlyRent <= 50000 ? "Since monthly rent does not exceed the ₹50,000 threshold, no TDS shall be deducted." : "The Lessee shall deduct 5% TDS and deposit the same via Form 26QC challan with proof furnished to the Lessor.")
        : "The Lessee being a corporate entity, standard TDS @ 10% under Section 194-I of the Income Tax Act, 1961 shall be deducted using Corporate TAN with quarterly TDS certificates (Form 16A) issued to the Lessor."}
    </p>

    <p class="clause">
      <span class="clause-num">4. STEP-UP RENT ESCALATION SCHEDULE:</span>
      Base rent shall escalate in accordance with the following pre-agreed escalation matrix:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>Dates</th>
          <th style="text-align: right;">Monthly Base Rent</th>
          <th style="text-align: right;">GST @ 18%</th>
          <th style="text-align: right;">TDS</th>
          <th style="text-align: right;">Net Monthly Payout</th>
        </tr>
      </thead>
      <tbody>
        ${escalationRowsHtml}
      </tbody>
    </table>

    <p class="clause">
      <span class="clause-num">5. SECURITY DEPOSIT (IFRSD):</span>
      The Lessee has deposited with the Lessor an Interest-Free Refundable Security Deposit of <strong>₹${depositAmount.toLocaleString()}</strong> (${numberToIndianWords(depositAmount)}). The said deposit shall be retained by the Lessor throughout the term and shall be refunded to the Lessee simultaneously upon peaceful, vacant handover of the Demised Premises, subject to deductions for unpaid rent, electricity sub-meter dues, or damages beyond normal wear and tear.
    </p>

    <p class="clause">
      <span class="clause-num">6. LOCK-IN PERIOD &amp; TERMINATION:</span>
      Both Parties agree to an irrevocable lock-in period of <strong>${lockInMonths} Months</strong> commencing from the Commencement Date. Neither Party shall be entitled to terminate this Agreement during the lock-in period. Subsequent to the expiry of the lock-in period, either Party may terminate this Agreement by serving a <strong>${noticePeriodDays} Days</strong> prior written notice to the other Party.
    </p>

    <p class="clause">
      <span class="clause-num">7. COMMERCIAL USE &amp; STATUTORY COVENANTS:</span>
      The Demised Premises shall be used by the Lessee solely for general commercial office purposes in accordance with local municipal, fire, and commercial bylaws. The Lessee shall not cause any structural alterations without prior written consent from the Lessor.
    </p>

    <div class="signature-grid">
      <div>
        <div class="sig-line"></div>
        <div style="font-weight: 800; color: #0f172a;">SIGNED AND DELIVERED BY THE LESSOR</div>
        <div style="color: #475569;">For and on behalf of:</div>
        <div style="font-weight: bold; margin-top: 2px;">${lessorName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Authorised Signatory / Property SPV</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">(With Official Seal)</div>
      </div>

      <div>
        <div class="sig-line"></div>
        <div style="font-weight: 800; color: #0f172a;">SIGNED AND DELIVERED BY THE LESSEE</div>
        <div style="color: #475569;">For and on behalf of:</div>
        <div style="font-weight: bold; margin-top: 2px;">${tenantName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Authorised Signatory / Corporate Seal</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">PAN: ${tenantPan} &bull; GSTIN: ${tenantGstin}</div>
      </div>
    </div>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      Generated via OfficeX Enterprise Commercial Lease Engine &bull; System Timestamp: ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate lease agreement", message: err.message },
      { status: 500 }
    );
  }
}

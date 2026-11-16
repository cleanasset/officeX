/**
 * Commercial Lease Contract PDF & Document Generator
 * Formats authentic commercial lease deeds matching standard Indian commercial agreements
 * based on canonical legal templates (Preamble, Demised Premises Schedule, Financials, Escalation Table, Covenants & Signatures)
 * Note: OfficeX is strictly a software platform; the agreement is strictly between LESSOR and LESSEE.
 */

export interface AgreementCustomClause {
  id?: string;
  clauseNumber?: string;
  clauseTitle: string;
  clauseText: string;
  category?: string;
}

export interface LeaseContractPdfData {
  contractCode?: string;
  executionDate?: string;
  executionCity?: string;
  executionState?: string;
  lessorBoardResolution?: string;
  lesseeBoardResolution?: string;
  landlordName: string;
  landlordAddress?: string;
  landlordPan?: string;
  landlordGstin?: string;
  landlordLogo?: string; // Owner uploaded brand/SPV/property logo
  tenantName: string;
  tenantTradeName?: string;
  tenantCompanyType?: string;
  tenantCin?: string;
  tenantPan?: string;
  tenantGstin?: string;
  tenantAddress?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  propertyName: string;
  buildingName?: string;
  floorName?: string;
  spaceName?: string;
  chargeableAreaSqft: number;
  carpetAreaSqft?: number;
  monthlyRent: number;
  ratePerSqft?: number;
  camMonthly?: number;
  camRatePerSqft?: number;
  securityDeposit: number;
  securityDepositMonths?: number;
  startDate: string;
  endDate: string;
  lockInMonths?: number;
  noticePeriodDays?: number;
  fitoutPeriodDays?: number;
  escalationPct?: number;
  escalationFrequency?: string;
  carParkingSlots?: number;
  twoWheelerSlots?: number;
  billingEntity?: string;
  paymentDueDate?: string;
  penalInterestPct?: number;
  stampDutySharing?: string;
  eStampReserveSpace?: boolean;
  customClauses?: AgreementCustomClause[];
  specialConditions?: string;
  revisionStatus?: "draft" | "pending_admin_approval" | "approved";
}

export function numberToIndianWords(num: number): string {
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

export function generateLeaseAgreementHtml(data: LeaseContractPdfData): string {
  const contractCode = data.contractCode || `COMM-LEASE-${Date.now().toString().slice(-6)}`;
  const executionDate = data.executionDate || new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const executionCity = data.executionCity || "Ahmedabad";
  const executionState = data.executionState || "Gujarat";

  const formatCurrency = (val: number) =>
    "₹" + Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // Calculate tenure in years
  let tenureYears = 3;
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    tenureYears = Math.max(1, Math.round(diffMonths / 12));
  }

  const lockInMonths = data.lockInMonths !== undefined ? data.lockInMonths : 12;
  const lockInDisplay = lockInMonths >= 12
    ? `${Math.round(lockInMonths / 12)} Year${Math.round(lockInMonths / 12) > 1 ? "s" : ""} (${lockInMonths} Months)`
    : `${lockInMonths} Months`;

  const noticePeriodDays = data.noticePeriodDays || 90;
  const noticeMonths = Math.round(noticePeriodDays / 30);
  const fitoutDays = data.fitoutPeriodDays !== undefined ? data.fitoutPeriodDays : 30;
  const penalInterestPct = data.penalInterestPct || 18;
  const paymentDueDate = data.paymentDueDate || "5th day of each English calendar month";
  const stampDutySharing = data.stampDutySharing || "Shared equally (50:50) between Lessor and Lessee";

  const escalationPct = data.escalationPct !== undefined ? data.escalationPct : 5;
  const escalationFreq = data.escalationFrequency || "every year";

  // Build multi-year escalation projection rows (matching authentic Indian lease deeds)
  const baseRent = Number(data.monthlyRent) || 0;
  const escalationRows: Array<{
    period: string;
    rent: number;
    ratePsf: number;
    gst: number;
    tds: number;
    net: number;
  }> = [];

  const startYear = data.startDate ? new Date(data.startDate).getFullYear() : new Date().getFullYear();
  let currentRent = baseRent;

  for (let yr = 0; yr < Math.min(tenureYears, 10); yr++) {
    if (yr > 0) {
      currentRent = Math.round(currentRent * (1 + escalationPct / 100));
    }
    const ratePsf = data.chargeableAreaSqft > 0 ? Number((currentRent / data.chargeableAreaSqft).toFixed(2)) : 0;
    const gst = Math.round(currentRent * 0.18);
    const tds = Math.round(currentRent * 0.10);
    const net = currentRent + gst - tds;
    const fromDate = data.startDate
      ? `Year ${yr + 1} (${startYear + yr} - ${startYear + yr + 1})`
      : `Year ${yr + 1}`;
    escalationRows.push({
      period: fromDate,
      rent: currentRent,
      ratePsf,
      gst,
      tds,
      net,
    });
  }

  const lessorName = (data.billingEntity || data.landlordName || "Commercial Property Asset SPV").trim();
  const tenantName = (data.tenantName || "Corporate Occupant").trim();
  const customClauses = data.customClauses || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Commercial Lease Agreement - ${contractCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      font-size: 11pt;
      line-height: 1.58;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 30px;
    }
    
    /* Control Toolbar (Hidden in Print) */
    .no-print {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .no-print-btn {
      background: #0ea5e9;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-weight: 700;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .no-print-btn:hover {
      background: #0284c7;
    }
    .stamp-toggle-label {
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: #cbd5e1;
    }

    /* Stamp Paper Reserve Header */
    .stamp-reserve-box {
      border: 1.5px dashed #64748b;
      background: #f8fafc;
      border-radius: 4px;
      height: 95mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-bottom: 24px;
      padding: 20px;
      page-break-after: avoid;
    }
    .stamp-reserve-box.compact {
      height: 28mm;
      margin-bottom: 18px;
    }
    .stamp-reserve-title {
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 800;
      font-size: 11pt;
      letter-spacing: 1px;
      color: #334155;
      text-transform: uppercase;
    }
    .stamp-reserve-note {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 6px;
      max-width: 80%;
    }

    /* Header Letterhead with Owner Logo */
    .letterhead-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .letterhead-logo {
      max-height: 65px;
      max-width: 220px;
      object-fit: contain;
    }
    .letterhead-text {
      text-align: right;
    }
    .letterhead-title {
      font-size: 13pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .letterhead-subtitle {
      font-size: 9pt;
      color: #475569;
      font-family: Arial, sans-serif;
      margin-top: 2px;
    }

    /* Document Main Headings */
    .deed-title {
      text-align: center;
      font-size: 16pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 16px 0 4px 0;
      color: #0f172a;
    }
    .deed-subtitle {
      text-align: center;
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-bottom: 20px;
    }

    /* Preamble & Parties */
    .preamble-text {
      text-align: justify;
      margin-bottom: 12px;
      font-size: 11pt;
    }
    .party-block {
      border: 1px solid #cbd5e1;
      background: #fafafa;
      padding: 12px 16px;
      margin: 10px 0;
      font-size: 10.5pt;
      text-align: justify;
      line-height: 1.55;
    }
    .party-divider {
      text-align: center;
      font-weight: bold;
      margin: 8px 0;
      font-size: 11pt;
      color: #0f172a;
    }

    /* Legal Table (Schedule I Key Terms Matrix) */
    .schedule-header {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 22px 0 8px 0;
      color: #0f172a;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 4px;
    }
    table.legal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 20px 0;
      font-size: 10pt;
    }
    table.legal-table th, table.legal-table td {
      border: 1px solid #475569;
      padding: 8px 10px;
      vertical-align: top;
    }
    table.legal-table th {
      background: #f1f5f9;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9pt;
      font-family: Arial, sans-serif;
      color: #0f172a;
    }
    table.legal-table td.col-sr {
      width: 5%;
      text-align: center;
      font-weight: bold;
    }
    table.legal-table td.col-key {
      width: 32%;
      font-weight: bold;
      color: #1e293b;
    }
    table.legal-table td.col-val {
      width: 63%;
      color: #0f172a;
    }

    /* Operative Clauses */
    .section-title {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 20px 0 10px 0;
      color: #0f172a;
      border-bottom: 1px solid #94a3b8;
      padding-bottom: 3px;
    }
    p.clause-p, li.clause-item {
      text-align: justify;
      margin: 0 0 10px 0;
      font-size: 10.5pt;
      line-height: 1.58;
    }
    ol.clauses-list {
      padding-left: 24px;
      margin: 0 0 16px 0;
    }
    ol.clauses-list > li {
      margin-bottom: 14px;
    }

    /* Signature & Execution Block */
    .execution-section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 25px;
    }
    .sig-table td {
      width: 50%;
      border: 1px solid #94a3b8;
      padding: 14px 16px;
      vertical-align: top;
      font-size: 10pt;
    }
    .sig-party-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10.5pt;
      color: #0f172a;
      margin-bottom: 60px; /* Space for physical signature and stamp */
    }
    .sig-line {
      border-top: 1px solid #1e293b;
      margin-top: 6px;
      padding-top: 6px;
    }
    .seal-box {
      border: 1px dashed #94a3b8;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 10px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
    }

    .witness-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .witness-table td {
      width: 50%;
      border: 1px dashed #cbd5e1;
      padding: 10px 14px;
      vertical-align: top;
      font-size: 9.5pt;
    }

    /* Running Footer */
    .deed-footer {
      text-align: center;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 35px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-family: Arial, sans-serif;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .stamp-reserve-box {
        border-color: #94a3b8;
      }
    }
  </style>
</head>
<body>

  <!-- ──── NO-PRINT ACTION TOOLBAR ──── -->
  <div class="no-print">
    <div>
      <strong style="font-size:14px; letter-spacing:0.5px;">Commercial Lease Deed · Legal Execution Master</strong>
      <div style="font-size:11px; opacity:0.85; margin-top:2px;">
        Formatted for Indian e-Stamp Paper Franking &amp; Sub-Registrar Registration
        ${data.revisionStatus === "pending_admin_approval" ? " · <span style='color:#fde047; font-weight:bold;'>[DRAFT REVISION — PENDING ADMIN APPROVAL]</span>" : ""}
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:14px;">
      <label class="stamp-toggle-label">
        <input type="checkbox" id="stampSpaceToggle" ${data.eStampReserveSpace ? "checked" : ""} onchange="document.getElementById('stampBox').classList.toggle('compact', !this.checked)" />
        Reserve 100mm e-Stamp Paper Margin
      </label>
      <button onclick="window.print()" class="no-print-btn">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <!-- ──── TOP STAMP PAPER RESERVATION (PAGE 1) ──── -->
  <div id="stampBox" class="stamp-reserve-box ${data.eStampReserveSpace ? "" : "compact"}">
    <div class="stamp-reserve-title">[ SPACE RESERVED FOR NON-JUDICIAL E-STAMP PAPER OF APPROPRIATE VALUE ]</div>
    <div class="stamp-reserve-note">
      To be executed / franked on non-judicial e-stamp paper in accordance with the applicable State Stamp Act before the Sub-Registrar of Assurances.
    </div>
  </div>

  <!-- ──── OPTIONAL OWNER BRAND / SPV LETTERHEAD ──── -->
  ${data.landlordLogo ? `
  <div class="letterhead-container">
    <div>
      <img src="${data.landlordLogo}" alt="${lessorName}" class="letterhead-logo" />
    </div>
    <div class="letterhead-text">
      <div class="letterhead-title">${lessorName}</div>
      <div class="letterhead-subtitle">${data.landlordAddress || data.propertyName}</div>
      ${data.landlordPan ? `<div class="letterhead-subtitle">PAN: <strong>${data.landlordPan.toUpperCase()}</strong> ${data.landlordGstin ? `| GSTIN: <strong>${data.landlordGstin.toUpperCase()}</strong>` : ""}</div>` : ""}
    </div>
  </div>
  ` : ""}

  <!-- ──── DOCUMENT TITLE & DATE ──── -->
  <div class="deed-title">COMMERCIAL LEASE DEED</div>
  <div class="deed-subtitle">
    (Effective from ${data.startDate || "Commencement Date"} to ${data.endDate || "Expiration Date"})
  </div>

  <!-- ──── PREAMBLE & PARTIES ──── -->
  <p class="preamble-text">
    THIS COMMERCIAL LEASE DEED (hereinafter referred to as the <strong>"Agreement"</strong> or <strong>"Deed"</strong>) is made and entered into at <strong>${executionCity}</strong>, in the State of <strong>${executionState}</strong>, on this <strong>${executionDate}</strong>,
  </p>

  <p class="party-divider">BY AND BETWEEN</p>

  <div class="party-block">
    <strong>${lessorName.toUpperCase()}</strong>,
    ${data.landlordPan ? `having Permanent Account Number (PAN): <strong>${data.landlordPan.toUpperCase()}</strong>` : ""},
    ${data.landlordGstin ? `and GSTIN: <strong>${data.landlordGstin.toUpperCase()}</strong>,` : ""}
    having its registered office / corporate principal place of business at <strong>${data.landlordAddress || data.propertyName || "Commercial Premises"}</strong>,
    acting through its Authorized Signatory, <strong>${data.billingEntity || lessorName}</strong>
    ${data.lessorBoardResolution ? `(duly authorized vide Board Resolution dated <strong>${data.lessorBoardResolution}</strong>)` : "(duly authorized to enter into, execute, and deliver this Deed)"}
    (hereinafter called the <strong>"LESSOR"</strong>, which expression shall unless repugnant to the context or meaning thereof include its legal heirs, successors-in-interest, executors, administrators, and permitted assigns) of the <strong>FIRST PART</strong>;
  </div>

  <p class="party-divider">AND</p>

  <div class="party-block">
    <strong>${tenantName.toUpperCase()}</strong>
    ${data.tenantTradeName && data.tenantTradeName !== data.tenantName ? ` (Operating Under Trade/Brand Name: <strong>"${data.tenantTradeName}"</strong>)` : ""},
    ${data.tenantCin ? `having Corporate Identification Number (CIN): <strong>${data.tenantCin.toUpperCase()}</strong>,` : ""}
    ${data.tenantPan ? `Permanent Account Number (PAN): <strong>${data.tenantPan.toUpperCase()}</strong>,` : ""}
    ${data.tenantGstin ? `and GSTIN: <strong>${data.tenantGstin.toUpperCase()}</strong>,` : ""}
    having its registered office at <strong>${data.tenantAddress || "Corporate Registered Address"}</strong>,
    acting through its Director / Authorized Signatory, <strong>${data.signatoryName || "Authorized Signatory"}</strong>
    ${data.signatoryDesignation ? `(${data.signatoryDesignation})` : ""}
    ${data.lesseeBoardResolution ? `(duly authorized vide Board Resolution dated <strong>${data.lesseeBoardResolution}</strong>)` : "(duly authorized by its governing body to enter into and execute this Deed)"}
    (hereinafter called the <strong>"LESSEE"</strong>, which expression shall unless repugnant to the context or meaning thereof include its successors-in-interest, legal representatives, nominees, and permitted assigns) of the <strong>SECOND PART</strong>.
  </div>

  <p class="preamble-text" style="font-style: italic; color: #475569; font-size: 10pt; text-align: center; margin: 10px 0 16px 0;">
    (The LESSOR and the LESSEE are hereinafter collectively referred to as the <strong>"Parties"</strong> and individually as the <strong>"Party"</strong>.)
  </p>

  <!-- ──── RECITALS ──── -->
  <div class="section-title">RECITALS &amp; TITLE CONTEXT</div>
  <p class="preamble-text">
    <strong>WHEREAS</strong> the Lessor is the absolute, lawful owner and in peaceful possession of the commercial building/complex known as <strong>"${data.propertyName}"</strong> situated at <strong>${data.landlordAddress || data.propertyName}</strong>, having full legal right, marketable title, and unencumbered power to demise the same;
  </p>
  <p class="preamble-text">
    <strong>AND WHEREAS</strong> the Lessee, after conducting its own due diligence and satisfying itself regarding the specifications, approvals, and suitability of the premises, has approached the Lessor to take on commercial lease the designated space bearing <strong>"${data.spaceName || "Demised Unit"}"</strong> ${data.floorName ? `on the ${data.floorName}` : ""}${data.buildingName ? ` of ${data.buildingName}` : ""}, admeasuring <strong>${Number(data.chargeableAreaSqft || 0).toLocaleString("en-IN")} Sq.Ft.</strong> chargeable area (hereinafter referred to as the <strong>"Demised Premises"</strong>), for conducting its bona-fide commercial / IT / ITES corporate operations;
  </p>
  <p class="preamble-text">
    <strong>AND WHEREAS</strong> the Lessor has agreed to demise the Demised Premises to the Lessee on the terms, covenants, and stipulations mutually agreed and set forth herein below.
  </p>

  <!-- ──── SCHEDULE I: KEY COMMERCIAL TERMS MATRIX ──── -->
  <div class="schedule-header">SCHEDULE I: KEY COMMERCIAL TERMS &amp; LEASE MATRIX</div>
  <table class="legal-table">
    <thead>
      <tr>
        <th class="col-sr">#</th>
        <th class="col-key">Particulars / Covenant</th>
        <th class="col-val">Agreed Terms &amp; Specifications</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-sr">1</td>
        <td class="col-key">Demised Premises</td>
        <td class="col-val">
          <strong>${data.spaceName || "Demised Commercial Suite"}</strong>,
          ${data.floorName ? `${data.floorName}, ` : ""}${data.buildingName ? `${data.buildingName}, ` : ""}
          <strong>${data.propertyName}</strong>, situated at ${data.landlordAddress || data.propertyName}.
          <br>Chargeable Area: <strong>${Number(data.chargeableAreaSqft || 0).toLocaleString("en-IN")} Sq.Ft.</strong>
          ${data.carpetAreaSqft ? ` | Carpet Area: <strong>${Number(data.carpetAreaSqft).toLocaleString("en-IN")} Sq.Ft.</strong>` : ""}
        </td>
      </tr>
      <tr>
        <td class="col-sr">2</td>
        <td class="col-key">Permitted Use</td>
        <td class="col-val">Bona-fide Commercial Corporate Office / IT / ITES / Commercial Workspaces only.</td>
      </tr>
      <tr>
        <td class="col-sr">3</td>
        <td class="col-key">Lease Term &amp; Dates</td>
        <td class="col-val">
          <strong>${tenureYears} Years</strong>, commencing from <strong>${data.startDate || "Handover Date"}</strong> up to <strong>${data.endDate || "Expiration Date"}</strong>.
        </td>
      </tr>
      <tr>
        <td class="col-sr">4</td>
        <td class="col-key">Mandatory Lock-in Period</td>
        <td class="col-val">
          <strong>${lockInDisplay}</strong> commencing strictly from the Rent Commencement Date. Neither Party can terminate during this period except for material uncured default.
        </td>
      </tr>
      <tr>
        <td class="col-sr">5</td>
        <td class="col-key">Monthly Lease Rental</td>
        <td class="col-val">
          <strong>${formatCurrency(data.monthlyRent)}/- per month</strong>
          <br>(${numberToIndianWords(data.monthlyRent)})
          ${data.ratePerSqft ? ` [@ ₹${data.ratePerSqft}/Sq.Ft./Month]` : ""}
          <br><span style="font-size:9pt; color:#475569;">*Exclusive of applicable Goods &amp; Services Tax (GST @ 18%). Subject to statutory TDS under Section 194-I.</span>
        </td>
      </tr>
      <tr>
        <td class="col-sr">6</td>
        <td class="col-key">Rent Payment Due Date</td>
        <td class="col-val">
          Payable in advance on or before the <strong>${paymentDueDate}</strong> via RTGS / NEFT / Direct Bank Transfer.
        </td>
      </tr>
      <tr>
        <td class="col-sr">7</td>
        <td class="col-key">Rent Escalation</td>
        <td class="col-val">
          <strong>${escalationPct}% ${escalationFreq}</strong> on the last paid monthly base rental.
        </td>
      </tr>
      <tr>
        <td class="col-sr">8</td>
        <td class="col-key">Interest-Free Refundable Security Deposit (IFRSD)</td>
        <td class="col-val">
          <strong>${formatCurrency(data.securityDeposit)}/-</strong>
          <br>(${numberToIndianWords(data.securityDeposit)})
          ${data.securityDepositMonths ? ` [Equivalent to ${data.securityDepositMonths} months' base rent]` : ""}
          <br><span style="font-size:9pt; color:#475569;">*Refundable within 7 to 14 banking days upon vacant physical handover of premises.</span>
        </td>
      </tr>
      <tr>
        <td class="col-sr">9</td>
        <td class="col-key">Common Area Maintenance (CAM) &amp; Utilities</td>
        <td class="col-val">
          ${data.camMonthly ? `<strong>${formatCurrency(data.camMonthly)}/- per month</strong> + GST` : data.camRatePerSqft ? `<strong>₹${data.camRatePerSqft}/Sq.Ft./Month</strong> + GST` : "Payable as per standard operational building cost pool."}
          <br>Electricity &amp; DG Backup: As per dedicated calibrated sub-meter readings on actual consumption.
        </td>
      </tr>
      <tr>
        <td class="col-sr">10</td>
        <td class="col-key">Dedicated Parking Allocation</td>
        <td class="col-val">
          <strong>${data.carParkingSlots || 0} Covered Car Parking Slot(s)</strong> and <strong>${data.twoWheelerSlots || 0} Two-Wheeler Parking Slot(s)</strong>.
        </td>
      </tr>
      <tr>
        <td class="col-sr">11</td>
        <td class="col-key">Rent-Free Fitout Period</td>
        <td class="col-val">
          <strong>${fitoutDays} Days</strong> from the date of physical site handover.
        </td>
      </tr>
      <tr>
        <td class="col-sr">12</td>
        <td class="col-key">Exit Notice Period (Post Lock-in)</td>
        <td class="col-val">
          <strong>${noticePeriodDays} Days (${noticeMonths} Months)</strong> prior written notice by either Party.
        </td>
      </tr>
      <tr>
        <td class="col-sr">13</td>
        <td class="col-key">Stamp Duty &amp; Registration</td>
        <td class="col-val">
          ${stampDutySharing}. Both Parties shall cooperate to register this Deed before the Sub-Registrar of Assurances.
        </td>
      </tr>
    </tbody>
  </table>

  <!-- ──── SCHEDULE II: RENT ESCALATION PROJECTION MATRIX ──── -->
  <div class="schedule-header">SCHEDULE II: MULTI-YEAR RENT ESCALATION MATRIX</div>
  <table class="legal-table" style="font-family: Arial, sans-serif; font-size: 9pt;">
    <thead>
      <tr>
        <th>Tenure Period</th>
        <th style="text-align:right;">Rate / Sq.Ft. (₹)</th>
        <th style="text-align:right;">Monthly Base Rent (₹)</th>
        <th style="text-align:right;">+ GST @ 18% (₹)</th>
        <th style="text-align:right;">- TDS @ 10% (₹)</th>
        <th style="text-align:right;">Net Monthly Payable (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${escalationRows.map((r) => `
        <tr>
          <td><strong>${r.period}</strong></td>
          <td style="text-align:right; font-family:monospace;">₹${r.ratePsf}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">${formatCurrency(r.rent)}</td>
          <td style="text-align:right; font-family:monospace; color:#92400e;">+${formatCurrency(r.gst)}</td>
          <td style="text-align:right; font-family:monospace; color:#b91c1c;">-${formatCurrency(r.tds)}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold; color:#0f172a;">${formatCurrency(r.net)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <!-- ──── OPERATIVE COVENANTS ──── -->
  <div class="section-title">NOW THIS DEED WITNESSETH AND IT IS HEREBY MUTUALLY AGREED AS FOLLOWS:</div>

  <ol class="clauses-list">
    <li class="clause-item">
      <strong>DEMISED PREMISES, HANDOVER &amp; FIT-OUT:</strong><br>
      The Lessor demises to the Lessee, and the Lessee takes on lease from the Lessor, the Demised Premises bearing <strong>${data.spaceName || "Demised Unit"}</strong> situated on <strong>${data.floorName || "Demised Floor"}</strong> of <strong>${data.propertyName}</strong>, having a chargeable area of <strong>${Number(data.chargeableAreaSqft || 0).toLocaleString("en-IN")} Sq.Ft.</strong>
      ${fitoutDays > 0 ? `The Lessor hereby grants a rent-free fit-out period of <strong>${fitoutDays} Days</strong> commencing from the date of handover to enable the Lessee to install its interior partitions, IT cabling, and workspace fitments.` : ""}
    </li>

    <li class="clause-item">
      <strong>LEASE TERM &amp; ENFORCEABLE LOCK-IN PERIOD:</strong><br>
      The total tenure of this Lease shall be for a period of <strong>${tenureYears} Years</strong> commencing from <strong>${data.startDate || "Handover Date"}</strong> and expiring on <strong>${data.endDate || "Expiration Date"}</strong>.
      Both Parties expressly agree to a mandatory, irrevocable <strong>Lock-in Period of ${lockInDisplay}</strong>. Neither Party shall be entitled to terminate this Agreement during the lock-in period. If the Lessee vacates or terminates the lease prior to the expiration of the lock-in period, the Lessee shall remain unconditionally liable to pay the Lessor the monthly rent and CAM for the entire remaining unexpired duration of the lock-in period.
    </li>

    <li class="clause-item">
      <strong>MONTHLY LEASE RENT, INVOICING &amp; PENAL INTEREST:</strong><br>
      The Lessee covenants to pay to the Lessor a monthly base rent of <strong>${formatCurrency(data.monthlyRent)}/- (${numberToIndianWords(data.monthlyRent)})</strong>.
      The monthly rent shall be payable in advance on or before the <strong>${paymentDueDate}</strong> into the nominated bank account of the Lessor via RTGS/NEFT. Applicable Goods and Services Tax (GST) shall be borne by the Lessee. The Lessee shall deduct Tax Deducted at Source (TDS) under Section 194-I of the Income Tax Act, 1961, and issue quarterly TDS certificates (Form 16A) to the Lessor.
      In the event of delay in payment of monthly rent beyond a grace period of <strong>7 calendar days</strong>, the Lessee shall be liable to pay penal interest @ <strong>${penalInterestPct}% per annum</strong> calculated on a day-to-day basis from the due date until full realization.
    </li>

    <li class="clause-item">
      <strong>RENT ESCALATION:</strong><br>
      The monthly base lease rent shall automatically escalate by <strong>${escalationPct}% ${escalationFreq}</strong> computed on the immediately preceding last paid monthly lease rental, as delineated in Schedule II hereinabove.
    </li>

    <li class="clause-item">
      <strong>INTEREST-FREE REFUNDABLE SECURITY DEPOSIT (IFRSD):</strong><br>
      The Lessee has deposited with the Lessor a sum of <strong>${formatCurrency(data.securityDeposit)}/- (${numberToIndianWords(data.securityDeposit)})</strong> as Interest-Free Refundable Security Deposit.
      The Lessor shall retain this deposit without interest throughout the subsistence of the lease. Upon expiration or earlier lawful determination of this lease, the Lessor shall refund the entire deposit to the Lessee within <strong>7 to 14 banking days</strong> of the Lessee handing over quiet, peaceful, and vacant physical possession of the Demised Premises, subject only to deductions for unpaid rent, electricity/CAM arrears, or structural damages beyond normal wear and tear.
    </li>

    <li class="clause-item">
      <strong>COMMON AREA MAINTENANCE (CAM), POWER &amp; 100% DG BACKUP:</strong><br>
      The Lessee shall pay CAM charges for upkeep of common facilities, facade, security, elevators, and common area lighting.
      Electricity consumption within the Demised Premises shall be recorded through dedicated calibrated dual-source electric sub-meters. The Lessor covenants to provide 100% DG power backup to the Demised Premises. DG power consumption shall be charged on actuals based on the established building power factor and diesel consumption metrics.
    </li>

    <li class="clause-item">
      <strong>PARKING ALLOCATION:</strong><br>
      The Lessor allocates <strong>${data.carParkingSlots || 0} dedicated covered Car Parking slot(s)</strong> and <strong>${data.twoWheelerSlots || 0} Two-Wheeler slot(s)</strong> in the complex for the exclusive use of the Lessee and its personnel.
    </li>

    <li class="clause-item">
      <strong>PERMITTED USE, LICENSES &amp; STATUTORY COMPLIANCES:</strong><br>
      The Lessee covenants to utilize the Demised Premises strictly for legitimate commercial / corporate / IT / ITES office operations. The Lessee shall comply with all applicable municipal by-laws, environmental norms, and fire safety protocols. The Lessor warrants that the building holds valid Completion / Occupancy permissions and statutory Fire NOC from competent authorities.
    </li>

    <li class="clause-item">
      <strong>REPAIRS &amp; STRUCTURAL MAINTENANCE:</strong><br>
      The Lessor shall be solely responsible for all major structural repairs, external facade maintenance, roof leakages, and common structural integrity of the complex. The Lessee shall be responsible for routine day-to-day interior maintenance, replacement of consumable light fittings, and maintenance of its own interior air-conditioning distribution and workstation fixtures.
    </li>

    <li class="clause-item">
      <strong>SUB-LEASING &amp; ASSIGNMENT:</strong><br>
      The Lessee shall not sub-lease, assign, mortgage, or part with possession of the Demised Premises or any part thereof to any third party without obtaining prior written consent from the Lessor.
    </li>

    <li class="clause-item">
      <strong>TERMINATION POST LOCK-IN &amp; EXIT NOTICE:</strong><br>
      Post expiration of the mandatory lock-in period, either Party may terminate this lease deed by serving <strong>${noticePeriodDays} Days (${noticeMonths} Months)</strong> prior written notice to the other Party. Upon the expiry of the notice period, the Lessee shall hand over vacant, peaceful physical possession of the Demised Premises to the Lessor.
    </li>

    <li class="clause-item">
      <strong>OVERSTAYING LIQUIDATED DAMAGES:</strong><br>
      If the Lessee fails to vacate and hand over vacant physical possession of the Demised Premises upon expiration or lawful termination of this Lease, the Lessee shall be treated as an unauthorized occupant and shall be liable to pay liquidated damages equal to <strong>two times (200%)</strong> the last payable monthly rent per month of unauthorized occupancy until actual handover, without prejudice to the Lessor's rights to re-enter and recover possession.
    </li>

    <li class="clause-item">
      <strong>STAMP DUTY, REGISTRATION &amp; LEGAL CHARGES:</strong><br>
      This Lease Deed shall be registered before the competent Sub-Registrar of Assurances having territorial jurisdiction. All stamp duty, registration fees, and legal expenses incidental to the preparation and registration of this Deed shall be <strong>${stampDutySharing}</strong>. Both Parties agree to present themselves before the Sub-Registrar for registration.
    </li>

    <li class="clause-item">
      <strong>DISPUTE RESOLUTION &amp; GOVERNING LAW:</strong><br>
      This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute or controversy arising out of or in connection with this Agreement shall be referred to arbitration by a Sole Arbitrator mutually appointed by the Parties under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be at <strong>${executionCity}</strong>. The Courts at <strong>${executionCity}, ${executionState}</strong> shall have exclusive territorial jurisdiction.
    </li>
  </ol>

  <!-- ──── ADDITIONAL CUSTOM COVENANTS & CLAUSES (IF CUSTOMIZED BY OWNER) ──── -->
  ${customClauses.length > 0 || data.specialConditions ? `
  <div class="section-title">SCHEDULE III: ADDITIONAL SPECIAL COVENANTS &amp; CUSTOM STIPULATIONS</div>
  <ol class="clauses-list" start="15">
    ${customClauses.map((c, idx) => `
      <li class="clause-item">
        <strong>${(c.clauseTitle || `SPECIAL COVENANT ${idx + 1}`).toUpperCase()}:</strong><br>
        ${c.clauseText}
      </li>
    `).join("")}
    ${data.specialConditions ? `
      <li class="clause-item">
        <strong>SPECIAL COMMERCIAL CONDITIONS:</strong><br>
        ${data.specialConditions}
      </li>
    ` : ""}
  </ol>
  ` : ""}

  <!-- ──── EXECUTION & SIGNATURE SECTION ──── -->
  <div class="execution-section">
    <p class="preamble-text">
      <strong>IN WITNESS WHEREOF</strong>, the Parties hereto have caused their respective common seals / corporate stamps to be affixed and these presents to be signed by their duly authorized signatories on the day, month, and year first written above.
    </p>

    <table class="sig-table">
      <tr>
        <td>
          <div class="sig-party-title">SIGNED &amp; DELIVERED by the LESSOR:</div>
          <div class="sig-line">
            <strong>${lessorName.toUpperCase()}</strong><br>
            Name: _________________________________<br>
            Designation: Authorized Signatory<br>
            Date: ${executionDate}
          </div>
          <div class="seal-box">
            [ Company Seal / Stamp of Lessor ]
          </div>
        </td>
        <td>
          <div class="sig-party-title">SIGNED &amp; DELIVERED by the LESSEE:</div>
          <div class="sig-line">
            <strong>${tenantName.toUpperCase()}</strong><br>
            Name: <strong>${data.signatoryName || "_________________________________"}</strong><br>
            Designation: ${data.signatoryDesignation || "Director / Authorized Signatory"}<br>
            Date: ${executionDate}
          </div>
          <div class="seal-box">
            [ Company Seal / Stamp of Lessee ]
          </div>
        </td>
      </tr>
    </table>

    <table class="witness-table">
      <tr>
        <td>
          <strong>WITNESS 1:</strong><br><br>
          Signature: ____________________________________<br>
          Full Name: ____________________________________<br>
          Father's / Spouse's Name: _______________________<br>
          Govt ID / Aadhaar No.: __________________________<br>
          Address: ______________________________________
        </td>
        <td>
          <strong>WITNESS 2:</strong><br><br>
          Signature: ____________________________________<br>
          Full Name: ____________________________________<br>
          Father's / Spouse's Name: _______________________<br>
          Govt ID / Aadhaar No.: __________________________<br>
          Address: ______________________________________
        </td>
      </tr>
    </table>
  </div>

  <!-- ──── CLEAN LEGAL FOOTER (NO OFFICEX BRANDING) ──── -->
  <div class="deed-footer">
    Commercial Lease Deed · Execution Reference: ${contractCode} · Executed at ${executionCity}, ${executionState}
  </div>

</body>
</html>`;
}

export function downloadLeaseContractPdf(data: LeaseContractPdfData, isSubscribed = true) {
  if (!isSubscribed) {
    alert("🔒 Commercial Subscription Required: Downloading and printing legally formatted lease deeds is reserved for active accounts.");
    return;
  }

  // Auto-attach owner logo from localStorage if not explicitly passed
  if (typeof window !== "undefined" && !data.landlordLogo) {
    const storedLogo = localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo");
    if (storedLogo) {
      data.landlordLogo = storedLogo;
    }
  }

  const htmlContent = generateLeaseAgreementHtml(data);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download and print the lease contract deed.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
}

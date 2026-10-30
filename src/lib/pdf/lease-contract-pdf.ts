/**
 * OfficeX Commercial Lease Contract PDF & Document Generator
 * Formats authentic commercial lease deeds matching standard Indian commercial agreements
 * based on canonical templates (Preamble, Demised Premises Schedule, Financials, Escalation Table, Covenants & Signatures)
 */

export interface LeaseContractPdfData {
  contractCode?: string;
  executionDate?: string;
  landlordName: string;
  landlordAddress?: string;
  landlordPan?: string;
  landlordGstin?: string;
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
}

export function generateLeaseAgreementHtml(data: LeaseContractPdfData): string {
  const contractCode = data.contractCode || `OX-LEASE-${Date.now().toString().slice(-6)}`;
  const executionDate = data.executionDate || new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

  const lockInMonths = data.lockInMonths || 12;
  const lockInDisplay = lockInMonths >= 12
    ? `${Math.round(lockInMonths / 12)} Year${Math.round(lockInMonths / 12) > 1 ? "s" : ""} (${lockInMonths} Months)`
    : `${lockInMonths} Months`;

  const escalationPct = data.escalationPct || 5;
  const escalationFreq = data.escalationFrequency || "every year";

  // Build multi-year escalation projection rows (matching sample agreement)
  const baseRent = Number(data.monthlyRent) || 0;
  const escalationRows: Array<{
    period: string;
    rent: number;
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
    const gst = Math.round(currentRent * 0.18);
    const tds = Math.round(currentRent * 0.10);
    const net = currentRent + gst - tds;
    const fromDate = data.startDate ? `Year ${yr + 1} (${startYear + yr} - ${startYear + yr + 1})` : `Year ${yr + 1}`;
    escalationRows.push({
      period: fromDate,
      rent: currentRent,
      gst,
      tds,
      net,
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Commercial Lease Agreement - ${contractCode}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    /* Executive Commercial Terms Summary Box */
    .summary-card {
      border: 2px solid #0F8B7D;
      background: #f0fdfa;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-family: Arial, sans-serif;
    }
    .summary-title {
      font-size: 14pt;
      font-weight: 900;
      color: #0c4a43;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1.5px solid #0F8B7D;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      font-size: 10pt;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #ccfbf1;
      padding-bottom: 4px;
    }
    .summary-label {
      font-weight: bold;
      color: #134e4a;
      text-transform: uppercase;
      font-size: 9pt;
    }
    .summary-value {
      font-weight: 900;
      color: #111827;
      font-family: monospace;
    }
    .doc-heading {
      text-align: center;
      font-size: 15pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0 16px 0;
      color: #111827;
    }
    .preamble {
      text-align: justify;
      margin-bottom: 14px;
      line-height: 1.6;
    }
    .party-block {
      background: #f9fafb;
      border-left: 3px solid #0F8B7D;
      padding: 10px 14px;
      margin: 10px 0;
      font-size: 10.5pt;
      text-align: justify;
    }
    h2 {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 20px 0 8px 0;
      color: #0c4a43;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    p, li {
      text-align: justify;
      margin: 0 0 8px 0;
    }
    ol {
      padding-left: 22px;
    }
    li {
      margin-bottom: 10px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9.5pt;
      font-family: Arial, sans-serif;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #d1d5db;
      padding: 7px 10px;
      text-align: left;
    }
    table.data-table th {
      background: #0F8B7D;
      color: #ffffff;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    table.data-table tr:nth-child(even) {
      background: #f9fafb;
    }
    .signatures-block {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .sig-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .sig-box {
      width: 46%;
      border-top: 1.5px solid #111827;
      padding-top: 8px;
      font-size: 10pt;
    }
    .witness-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px dashed #d1d5db;
    }
    .witness-box {
      width: 46%;
      font-size: 9.5pt;
      color: #4b5563;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="no-print" style="background:#0F8B7D; color:#fff; padding:12px 18px; border-radius:10px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; font-family:Arial,sans-serif; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div>
      <strong style="font-size:13px;">✓ Official Commercial Lease Agreement Generated</strong>
      <div style="font-size:11px; opacity:0.9;">Ready for institutional e-signing, stamp paper franking, or PDF print.</div>
    </div>
    <button onclick="window.print()" style="background:#fff; color:#0F8B7D; font-weight:bold; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:12px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <!-- ──── 1. EXECUTIVE COMMERCIAL TERMS SUMMARY BOX ──── -->
  <div class="summary-card">
    <div class="summary-title">RENT &amp; LEASE AGREEMENT SUMMARY</div>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">Rent Period</span>
        <span class="summary-value">${tenureYears} Years (${data.startDate || "Commencement"} to ${data.endDate || "Expiry"})</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Lock-In Period</span>
        <span class="summary-value">${lockInDisplay}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Monthly Lease Rent</span>
        <span class="summary-value">${formatCurrency(data.monthlyRent)}/- (+ 18% GST)</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Chargeable Area</span>
        <span class="summary-value">${Number(data.chargeableAreaSqft || 0).toLocaleString("en-IN")} Sq.Ft</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Rent Escalation</span>
        <span class="summary-value">${escalationPct}% ${escalationFreq} on last paid rent</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Security Deposit (IFRSD)</span>
        <span class="summary-value">${formatCurrency(data.securityDeposit)}/- (Interest-Free)</span>
      </div>
    </div>
  </div>

  <!-- ──── 2. TITLE & PREAMBLE ──── -->
  <div class="doc-heading">COMMERCIAL LEASE &amp; OCCUPANCY AGREEMENT</div>

  <p class="preamble">
    This <strong>LEASE AGREEMENT</strong> is made and executed on this <strong>${executionDate}</strong> by and between:
  </p>

  <div class="party-block">
    <strong>${(data.billingEntity || data.landlordName || "Commercial Property Asset SPV").toUpperCase()}</strong>
    ${data.landlordPan ? ` (PAN: <strong>${data.landlordPan.toUpperCase()}</strong>)` : ""}
    ${data.landlordGstin ? ` (GSTIN: <strong>${data.landlordGstin.toUpperCase()}</strong>)` : ""}
    having its registered office/commercial operations at ${data.landlordAddress || data.propertyName || "Commercial Complex"},
    acting through its Authorized Signatory, hereinafter called the <strong>"LESSOR"</strong> (which expression shall unless repugnant to the context mean and include its legal heirs, successors, executors, administrators and permitted assigns) of the <strong>ONE PART</strong>;
  </div>

  <p style="text-align:center; font-weight:bold; margin:6px 0;">AND</p>

  <div class="party-block">
    <strong>${data.tenantName.toUpperCase()}</strong>
    ${data.tenantTradeName && data.tenantTradeName !== data.tenantName ? ` (Trade/Brand Name: <strong>"${data.tenantTradeName}"</strong>)` : ""}
    ${data.tenantPan ? ` (PAN: <strong>${data.tenantPan.toUpperCase()}</strong>)` : ""}
    ${data.tenantCin ? ` (CIN: <strong>${data.tenantCin.toUpperCase()}</strong>)` : ""}
    ${data.tenantGstin ? ` (GSTIN: <strong>${data.tenantGstin.toUpperCase()}</strong>)` : ""}
    having its registered office at ${data.tenantAddress || "Corporate Registered Address"},
    acting through its Director / Authorized Signatory <strong>${data.signatoryName || "Authorized Signatory"}</strong>${data.signatoryDesignation ? ` (${data.signatoryDesignation})` : ""},
    hereinafter called the <strong>"LESSEE"</strong> (which expression shall unless repugnant to the context mean and include its successors-in-interest, executors, nominees, administrators and permitted assigns) of the <strong>OTHER PART</strong>.
  </div>

  <p class="preamble" style="font-style:italic; font-size:10pt; color:#4b5563;">
    (The LESSOR and the LESSEE are hereinafter collectively referred to as the "Parties" and individually as the "Party".)
  </p>

  <!-- ──── 3. RECITALS ──── -->
  <h2>RECITALS &amp; TITLE CONTEXT</h2>
  <ol type="A" style="font-size:10.5pt;">
    <li><strong>WHEREAS</strong> the Lessor is the absolute lawful owner and in lawful possession of the commercial building/complex known as <strong>"${data.propertyName}"</strong> situated at ${data.landlordAddress || data.propertyName};</li>
    <li><strong>WHEREAS</strong> the Lessee has approached the Lessor for taking on lease commercial office/workspace bearing unit <strong>"${data.spaceName || "Demised Unit"}"</strong> ${data.floorName ? `on the ${data.floorName}` : ""} admeasuring <strong>${Number(data.chargeableAreaSqft || 0).toLocaleString("en-IN")} Sq.Ft</strong> chargeable area (hereinafter referred to as the <strong>"Demised Premises"</strong>) for commercial operations;</li>
    <li><strong>WHEREAS</strong> the Lessor has agreed to demise the said premises to the Lessee on the covenants and stipulations contained herein.</li>
  </ol>

  <!-- ──── 4. OPERATIVE CLAUSES ──── -->
  <h2>NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:</h2>

  <ol>
    <li>
      <strong>DEMISED PREMISES &amp; HANDOVER:</strong>
      The Lessor demises to the Lessee and the Lessee takes on lease the Demised Premises bearing <strong>${data.spaceName || "Demised Unit"}</strong>, ${data.floorName || "Demised Floor"}, within <strong>${data.propertyName}</strong>, having a chargeable area of <strong>${Number(data.chargeableAreaSqft).toLocaleString("en-IN")} Sq.Ft</strong>.
      ${data.fitoutPeriodDays ? ` The Lessor grants a rent-free fit-out period of <strong>${data.fitoutPeriodDays} days</strong> for interior installation.` : ""}
    </li>

    <li>
      <strong>LEASE TERM &amp; LOCK-IN PERIOD:</strong>
      The lease of the Demised Premises shall be for a total tenure of <strong>${tenureYears} Years</strong> commencing from <strong>${data.startDate || "Handover Date"}</strong> up to <strong>${data.endDate || "Expiry Date"}</strong>.
      Both Parties expressly covenant to a mandatory <strong>Lock-in Period of ${lockInDisplay}</strong> commencing from the Rent Commencement Date. Neither party shall be entitled to terminate this Agreement during the lock-in period, except for material uncured default. In the event of early surrender by Lessee, the Lessee shall remain liable to pay the rent for the entire unexpired lock-in period.
    </li>

    <li>
      <strong>MONTHLY LEASE RENT:</strong>
      The Lessee covenants to pay to the Lessor a monthly base rent of <strong>${formatCurrency(data.monthlyRent)}/- (Rupees ${data.monthlyRent ? Number(data.monthlyRent).toLocaleString("en-IN") : ""} Only)</strong>${data.ratePerSqft ? ` calculated @ ₹${data.ratePerSqft}/Sq.Ft/Month` : ""}.
      Rent shall be payable in advance on or before the <strong>${data.paymentDueDate || "5th day of every English calendar month"}</strong> into the designated bank account of the Lessor. Applicable Goods and Services Tax (GST @ 18%) shall be borne by the Lessee. The Lessee shall deduct TDS under Section 194-I of the Income Tax Act, 1961, and issue quarterly Form 16A certificates.
    </li>

    <li>
      <strong>RENT ESCALATION SCHEDULE:</strong>
      The monthly base rent shall escalate by <strong>${escalationPct}% ${escalationFreq}</strong> on the last paid monthly lease rental. The projected year-wise rental cashflow is structured as follows:
      <table class="data-table">
        <thead>
          <tr>
            <th>Period / Year</th>
            <th style="text-align:right;">Monthly Base Rent (₹)</th>
            <th style="text-align:right;">+ GST (18%)</th>
            <th style="text-align:right;">- TDS (10%)</th>
            <th style="text-align:right;">Net Monthly Payable (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${escalationRows.map((r) => `
            <tr>
              <td><strong>${r.period}</strong></td>
              <td style="text-align:right; font-family:monospace; font-weight:bold;">${formatCurrency(r.rent)}</td>
              <td style="text-align:right; font-family:monospace; color:#b45309;">+${formatCurrency(r.gst)}</td>
              <td style="text-align:right; font-family:monospace; color:#dc2626;">-${formatCurrency(r.tds)}</td>
              <td style="text-align:right; font-family:monospace; font-weight:900; color:#0F8B7D;">${formatCurrency(r.net)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </li>

    <li>
      <strong>INTEREST-FREE REFUNDABLE SECURITY DEPOSIT (IFRSD):</strong>
      The Lessee has deposited with the Lessor a sum of <strong>${formatCurrency(data.securityDeposit)}/-</strong>${data.securityDepositMonths ? ` (equivalent to ${data.securityDepositMonths} months' base rent)` : ""} as Interest-Free Refundable Security Deposit.
      This deposit shall be retained by the Lessor throughout the subsistence of this lease and refunded within <strong>7 banking days</strong> upon physical, vacant possession and key handover by Lessee, subject to deductions for unpaid electricity, maintenance bills, or structural damage.
    </li>

    <li>
      <strong>COMMON AREA MAINTENANCE (CAM) &amp; UTILITIES:</strong>
      Common area maintenance charges shall be payable by the Lessee ${data.camMonthly ? `at <strong>${formatCurrency(data.camMonthly)}/- per month</strong>` : data.camRatePerSqft ? `at <strong>₹${data.camRatePerSqft}/Sq.Ft/Month</strong>` : "at actual monthly operational cost pool"}. Electricity, backup DG power, and water consumption for the Demised Premises shall be recorded through dedicated calibrated sub-meters and paid on actual consumption.
    </li>

    <li>
      <strong>PARKING ALLOCATION:</strong>
      The Lessor allocates <strong>${data.carParkingSlots || 0} dedicated covered Car Parking slots</strong> and <strong>${data.twoWheelerSlots || 0} Two-Wheeler parking slots</strong> in the commercial complex for the exclusive use of the Lessee and its personnel.
    </li>

    <li>
      <strong>COVENANTS &amp; RESTRICTIONS:</strong>
      The Lessee shall use the Demised Premises strictly for legitimate commercial / corporate / IT / ITES office operations and shall comply with applicable municipal, environmental, and fire safety regulations. Sub-leasing, assignment, or parting with possession without prior written approval of the Lessor is strictly prohibited.
    </li>

    <li>
      <strong>TERMINATION &amp; NOTICE PERIOD:</strong>
      Post expiration of the mandatory lock-in period, either party may terminate this lease by giving <strong>${data.noticePeriodDays || 90} Days</strong> prior written notice to the other party.
    </li>

    <li>
      <strong>GOVERNING LAW &amp; DISPUTE RESOLUTION:</strong>
      This Agreement shall be construed in accordance with the laws of India. Any dispute arising out of this Agreement shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. The Courts at the place of the property shall have exclusive territorial jurisdiction.
    </li>
  </ol>

  <!-- ──── 5. EXECUTION & SIGNATURES ──── -->
  <div class="signatures-block">
    <p><strong>IN WITNESS WHEREOF</strong>, the Lessor and the Lessee have executed this Commercial Lease Agreement on the day, month, and year first above written in the presence of the following witnesses:</p>

    <div class="sig-grid">
      <div class="sig-box">
        <strong>SIGNED &amp; DELIVERED by the LESSOR:</strong><br><br><br><br>
        __________________________________________<br>
        <strong>${(data.billingEntity || data.landlordName || "Commercial Property Asset SPV").toUpperCase()}</strong><br>
        Authorized Signatory / Seal &amp; Stamp
      </div>

      <div class="sig-box">
        <strong>SIGNED &amp; DELIVERED by the LESSEE:</strong><br><br><br><br>
        __________________________________________<br>
        <strong>${data.tenantName.toUpperCase()}</strong><br>
        Name: ${data.signatoryName || "Authorized Signatory"}<br>
        Designation: ${data.signatoryDesignation || "Director / Authorized Signatory"}
      </div>
    </div>

    <div class="witness-grid">
      <div class="witness-box">
        <strong>WITNESS 1:</strong><br><br>
        Signature: ___________________________<br>
        Name: _______________________________<br>
        Address: _____________________________
      </div>

      <div class="witness-box">
        <strong>WITNESS 2:</strong><br><br>
        Signature: ___________________________<br>
        Name: _______________________________<br>
        Address: _____________________________
      </div>
    </div>
  </div>

  <div style="text-align:center; font-size:8.5pt; color:#9ca3af; margin-top:30px; font-family:Arial,sans-serif; border-top:1px solid #e5e7eb; padding-top:8px;">
    OFFICEX ENTERPRISE REAL ESTATE SUITE · CANONICAL COMMERCIAL LEASE MASTER · CODE: ${contractCode}
  </div>

</body>
</html>`;
}

export function downloadLeaseContractPdf(data: LeaseContractPdfData, isSubscribed = true) {
  if (!isSubscribed) {
    alert("🔒 Pro Commercial Subscription Required: Downloading and printing legally formatted lease deeds is reserved for subscribed accounts.");
    return;
  }
  const htmlContent = generateLeaseAgreementHtml(data);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download and print the lease contract PDF.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
}

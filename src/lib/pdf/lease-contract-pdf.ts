/**
 * OfficeX Commercial Lease Contract PDF & Document Generator
 * Formats authentic commercial lease deeds matching standard Indian commercial agreements
 * (Preamble, Demised Premises Schedule, Commercials, CAM, Security Deposit, Escalation, Covenants & Signatures)
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Commercial Lease Agreement - ${contractCode}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .header-stamp {
      text-align: center;
      border-bottom: 2px solid #0F8B7D;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .header-stamp h1 {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      color: #0c4a43;
    }
    .header-stamp p {
      font-size: 9pt;
      color: #4b5563;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .contract-ref {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      font-family: Arial, sans-serif;
      font-weight: bold;
      color: #374151;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 6px;
    }
    h2 {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 18px 0 8px 0;
      color: #111827;
      border-left: 3px solid #0F8B7D;
      padding-left: 8px;
    }
    p, li {
      text-align: justify;
      margin: 0 0 8px 0;
    }
    .parties-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .party-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 4px;
    }
    table.schedule-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 18px 0;
      font-size: 10pt;
      font-family: Arial, sans-serif;
    }
    table.schedule-table th, table.schedule-table td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
      text-align: left;
    }
    table.schedule-table th {
      background: #f3f4f6;
      font-weight: bold;
      color: #1f2937;
    }
    .amount-highlight {
      font-weight: bold;
      color: #0F8B7D;
    }
    .signatures-section {
      margin-top: 36px;
      page-break-inside: avoid;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
    }
    .signature-box {
      width: 45%;
      border-top: 1px solid #111827;
      padding-top: 8px;
      font-size: 10pt;
    }
    .watermark {
      position: fixed;
      bottom: 10px;
      right: 10px;
      font-size: 8pt;
      font-family: Arial, sans-serif;
      color: #9ca3af;
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

  <div class="no-print" style="background:#0F8B7D; color:#fff; padding:10px 16px; border-radius:8px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; font-family:Arial,sans-serif;">
    <span>✓ <strong>Commercial Lease Deed Generated</strong> — Ready for digital printing or physical stamp paper Franking.</span>
    <button onclick="window.print()" style="background:#fff; color:#0F8B7D; font-weight:bold; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:12px;">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header-stamp">
    <h1>COMMERCIAL LEASE AGREEMENT</h1>
    <p>Standard Commercial Real Estate Lease Deed &amp; Demised Premises Tenancy Master</p>
  </div>

  <div class="contract-ref">
    <span>AGREEMENT REF: ${contractCode}</span>
    <span>EXECUTION DATE: ${executionDate}</span>
  </div>

  <p>
    This <strong>COMMERCIAL LEASE DEED</strong> (hereinafter referred to as the <strong>"Agreement"</strong>) is made and entered into on this <strong>${executionDate}</strong>, by and between:
  </p>

  <div class="parties-box">
    <div class="party-title">1. THE LESSOR / LANDLORD:</div>
    <p>
      <strong>${data.billingEntity || data.landlordName || "The Commercial Property Owner"}</strong>
      ${data.landlordAddress ? `, having its registered address at: ${data.landlordAddress}` : ""}
      ${data.landlordPan ? `, PAN: <strong>${data.landlordPan}</strong>` : ""}
      ${data.landlordGstin ? `, GSTIN: <strong>${data.landlordGstin}</strong>` : ""}
      (hereinafter referred to as the <strong>"LESSOR"</strong>, which expression shall unless repugnant to the context include its successors-in-interest and assigns) of the <strong>FIRST PART</strong>;
    </p>

    <div class="party-title" style="margin-top:12px;">AND</div>

    <div class="party-title">2. THE LESSEE / TENANT:</div>
    <p>
      <strong>${data.tenantName}</strong> ${data.tenantTradeName && data.tenantTradeName !== data.tenantName ? `(operating under the brand name <strong>"${data.tenantTradeName}"</strong>)` : ""},
      a ${data.tenantCompanyType || "corporate entity"}
      ${data.tenantCin ? `, CIN: <strong>${data.tenantCin}</strong>` : ""}
      ${data.tenantPan ? `, PAN: <strong>${data.tenantPan}</strong>` : ""}
      ${data.tenantGstin ? `, GSTIN: <strong>${data.tenantGstin}</strong>` : ""}
      ${data.tenantAddress ? `, having its registered corporate office at: ${data.tenantAddress}` : ""}
      represented by its authorized signatory <strong>${data.signatoryName || "Authorized Representative"}</strong>${data.signatoryDesignation ? `, (${data.signatoryDesignation})` : ""}
      (hereinafter referred to as the <strong>"LESSEE"</strong>, which expression shall unless repugnant to the context include its permitted successors and assigns) of the <strong>SECOND PART</strong>.
    </p>
  </div>

  <h2>SCHEDULE I: DEMISED PREMISES SPECIFICATIONS</h2>
  <p>
    The Lessor agrees to demise on lease, and the Lessee agrees to take on lease, the commercial premises situated within the property known as <strong>"${data.propertyName}"</strong>:
  </p>

  <table class="schedule-table">
    <tr>
      <th style="width:30%;">Commercial Asset / Complex</th>
      <td><strong>${data.propertyName}</strong> ${data.buildingName ? `· ${data.buildingName}` : ""}</td>
    </tr>
    <tr>
      <th>Floor / Level</th>
      <td>${data.floorName || "Demised Floor Plate"}</td>
    </tr>
    <tr>
      <th>Demised Unit(s) / Space</th>
      <td><strong>${data.spaceName || "Entire Leasable Suite"}</strong></td>
    </tr>
    <tr>
      <th>Chargeable Area (Sq.Ft)</th>
      <td><span class="amount-highlight">${Number(data.chargeableAreaSqft).toLocaleString("en-IN")} Sq.Ft</span> (Super Built-Up Area)</td>
    </tr>
    ${data.carpetAreaSqft ? `<tr><th>Carpet Area (Sq.Ft)</th><td>${Number(data.carpetAreaSqft).toLocaleString("en-IN")} Sq.Ft</td></tr>` : ""}
    <tr>
      <th>Allocated Car Parking</th>
      <td>${data.carParkingSlots || 0} Dedicated Covered Reserved Slots</td>
    </tr>
    <tr>
      <th>Allocated Two-Wheeler Parking</th>
      <td>${data.twoWheelerSlots || 0} Slots</td>
    </tr>
  </table>

  <h2>SCHEDULE II: FINANCIAL TERMS, ESCALATIONS &amp; SECURITY DEPOSIT</h2>
  <table class="schedule-table">
    <tr>
      <th style="width:30%;">Monthly Base Rent</th>
      <td>
        <span class="amount-highlight">${formatCurrency(data.monthlyRent)}</span> per month
        ${data.ratePerSqft ? ` (Calculated @ ₹${data.ratePerSqft}/sq.ft/mo)` : ""}
        <br><small style="color:#6b7280;">Exclusive of applicable Goods &amp; Services Tax (GST @ 18%).</small>
      </td>
    </tr>
    <tr>
      <th>Common Area Maintenance (CAM)</th>
      <td>
        ${data.camMonthly ? `${formatCurrency(data.camMonthly)} per month` : data.camRatePerSqft ? `₹${data.camRatePerSqft}/sq.ft/mo` : "Standard building CAM billing"}
      </td>
    </tr>
    <tr>
      <th>Interest-Free Refundable Security Deposit</th>
      <td>
        <span class="amount-highlight">${formatCurrency(data.securityDeposit)}</span>
        ${data.securityDepositMonths ? ` (Equivalent to ${data.securityDepositMonths} months' base rent)` : ""}
      </td>
    </tr>
    <tr>
      <th>Tenancy Commencement Date</th>
      <td><strong>${data.startDate || "As per handover"}</strong></td>
    </tr>
    <tr>
      <th>Lease Expiry / Termination Date</th>
      <td><strong>${data.endDate || "As contracted"}</strong></td>
    </tr>
    <tr>
      <th>Rent Escalation</th>
      <td>
        <strong>${data.escalationPct || 5}% escalation</strong> applied ${data.escalationFrequency || "annually"} on the preceding monthly base rent.
      </td>
    </tr>
    <tr>
      <th>Lock-in Period</th>
      <td><strong>${data.lockInMonths || 12} Months</strong> from the Rent Commencement Date.</td>
    </tr>
    <tr>
      <th>Notice Period for Termination</th>
      <td><strong>${data.noticePeriodDays || 90} Days</strong> written notice prior to expiry.</td>
    </tr>
    <tr>
      <th>Monthly Rent Payment Terms</th>
      <td>${data.paymentDueDate || "Due on or before the 5th day of each calendar month"}</td>
    </tr>
  </table>

  <h2>STANDARD COMMERCIAL COVENANTS &amp; CONDITIONS</h2>
  <ol style="padding-left: 20px; font-size: 10pt; text-align: justify;">
    <li><strong>Use of Premises</strong>: The Lessee covenants to use the Demised Premises strictly for commercial IT / ITES / corporate office / commercial showroom operations in conformity with local municipal sanctions.</li>
    <li><strong>Statutory Deductions (TDS)</strong>: The Lessee shall deduct Tax Deducted at Source (TDS) under Section 194-I of the Income Tax Act, 1961, and provide quarterly Form 16A certificates to the Lessor.</li>
    <li><strong>Security Deposit Refund</strong>: The Lessor covenants to refund the full interest-free security deposit within 7 banking days of vacant, physical handover of the premises upon expiry or termination.</li>
    <li><strong>Dispute Resolution &amp; Jurisdiction</strong>: Any dispute arising out of this Agreement shall be settled through arbitration under the Indian Arbitration and Conciliation Act, 1996, with the seat of arbitration situated in the jurisdiction of the property.</li>
  </ol>

  <div class="signatures-section">
    <p><strong>IN WITNESS WHEREOF</strong>, the parties hereto have executed this Agreement on the day, month, and year first written above.</p>

    <div class="signature-grid">
      <div class="signature-box">
        <strong>SIGNED &amp; DELIVERED by the LESSOR:</strong><br><br><br>
        __________________________________________<br>
        <strong>${data.billingEntity || data.landlordName}</strong><br>
        Authorized Signatory
      </div>
      <div class="signature-box">
        <strong>SIGNED &amp; DELIVERED by the LESSEE:</strong><br><br><br>
        __________________________________________<br>
        <strong>${data.tenantName}</strong><br>
        Name: ${data.signatoryName || "Authorized Signatory"}<br>
        Designation: ${data.signatoryDesignation || "Director / Authorized Representative"}
      </div>
    </div>
  </div>

  <div class="watermark">OFFICEX ENTERPRISE LEASE PLATFORM · SYSTEM GENERATED LEGAL MASTER</div>

</body>
</html>`;
}

export function downloadLeaseContractPdf(data: LeaseContractPdfData) {
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


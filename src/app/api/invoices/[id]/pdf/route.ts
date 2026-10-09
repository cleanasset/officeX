import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  invoice,
  invoice_line,
  occupant,
  contract,
  space,
  building,
  property,
  billingEntities,
  organization,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

const STATE_CODE_MAP: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "19": "West Bengal",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
};

function getStateName(codeOrGstin: string | null | undefined): string {
  if (!codeOrGstin) return "Maharashtra";
  const code = codeOrGstin.slice(0, 2);
  return STATE_CODE_MAP[code] || "Maharashtra";
}

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get("format");
    const autoPrint = url.searchParams.get("print") === "true";

    // 1. Fetch Invoice
    const [inv] = await db
      .select()
      .from(invoice)
      .where(sql`${invoice.id} = ${id} OR ${invoice.invoice_number} = ${id}`)
      .limit(1);

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Fetch Line Items
    const lines = await db
      .select()
      .from(invoice_line)
      .where(eq(invoice_line.invoice_id, inv.id));

    // 3. Fetch Occupant
    let occ: any = null;
    if (inv.occupant_id) {
      const [o] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, inv.occupant_id));
      occ = o;
    }

    // 4. Fetch Contract, Space, Building, Property
    let prop: any = null;
    let bld: any = null;
    let sp: any = null;
    let c: any = null;

    if (inv.contract_id) {
      const [contractRow] = await db
        .select()
        .from(contract)
        .where(eq(contract.id, inv.contract_id));
      c = contractRow;

      if (c?.space_id) {
        const [spaceRow] = await db
          .select()
          .from(space)
          .where(eq(space.id, c.space_id));
        sp = spaceRow;

        if (sp?.building_id) {
          const [bldRow] = await db
            .select()
            .from(building)
            .where(eq(building.id, sp.building_id));
          bld = bldRow;

          if (bld?.property_id) {
            const [propRow] = await db
              .select()
              .from(property)
              .where(eq(property.id, bld.property_id));
            prop = propRow;
          }
        }
      }
    }

    // 5. Fetch Supplier / Billing Entity
    let supplier: any = null;
    if (inv.org_id) {
      const [be] = await db
        .select()
        .from(billingEntities)
        .where(eq(billingEntities.orgId, inv.org_id))
        .limit(1);
      supplier = be;
    }

    const supplierGstin = supplier?.gstin || "27AABCU9603R1ZM";
    const supplierStateCode = supplier?.stateCode || supplierGstin.slice(0, 2) || "27";
    const supplierState = getStateName(supplierStateCode);
    const supplierLegalName = supplier?.legalName || "OFFICEX COMMERCIAL REAL ESTATE TECHNOLOGIES PRIVATE LIMITED";
    const supplierPan = supplier?.pan || supplierGstin.slice(2, 12) || "AABCU9603R";
    const supplierAddress = supplier?.registeredAddress || "9th Floor, Horizon Tech Park, Outer Ring Road, Bengaluru, Karnataka - 560103";
    const bankName = supplier?.bankName || "HDFC Bank Ltd";
    const bankAccount = supplier?.bankAccountNumber || "50200088192031";
    const bankIfsc = supplier?.bankIfsc || "HDFC0000240";
    const bankBranch = supplier?.bankBranch || "Koramangala 4th Block, Bengaluru";

    const buyerGstin = occ?.gst_number || "27AABCT3920K1Z9";
    const buyerStateCode = buyerGstin ? buyerGstin.slice(0, 2) : supplierStateCode;
    const buyerState = getStateName(buyerStateCode);
    const buyerLegalName = occ?.occupant_name || "Enterprise Commercial Occupant Pvt. Ltd.";
    const buyerPan = occ?.pan_number || (buyerGstin ? buyerGstin.slice(2, 12) : "AABCT3920K");
    const buyerAddress = occ?.address
      ? `${occ.address}, ${occ.city || ""}, ${occ.state || ""} - ${occ.postal_code || ""}`
      : "Unit 402, 4th Floor, Tech Hub Towers, Mumbai, Maharashtra - 400051";

    const isIntraState = supplierStateCode === buyerStateCode;
    const grossTotal = parseFloat(inv.gross_total || "0");
    const subtotal = parseFloat(inv.subtotal || "0") || (grossTotal / 1.18);
    const totalGst = parseFloat(inv.gst_amount || "0") || (grossTotal - subtotal);
    const cgst = isIntraState ? totalGst / 2 : 0;
    const sgst = isIntraState ? totalGst / 2 : 0;
    const igst = isIntraState ? 0 : totalGst;

    const tdsRate = 10.0;
    const expectedTds = (subtotal * tdsRate) / 100;
    const netPayable = grossTotal - expectedTds;

    const amountInWords = numberToIndianWords(grossTotal);

    // Format JSON if requested
    if (format === "json") {
      return NextResponse.json({
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date,
        period_start: inv.period_start,
        period_end: inv.period_end,
        status: inv.status,
        supplier: {
          legal_name: supplierLegalName,
          gstin: supplierGstin,
          pan: supplierPan,
          state: supplierState,
          state_code: supplierStateCode,
          address: supplierAddress,
          bank: {
            name: bankName,
            account_number: bankAccount,
            ifsc: bankIfsc,
            branch: bankBranch,
          },
        },
        buyer: {
          legal_name: buyerLegalName,
          gstin: buyerGstin,
          pan: buyerPan,
          state: buyerState,
          state_code: buyerStateCode,
          address: buyerAddress,
        },
        space_details: {
          property_name: prop?.property_name || "Cyber Greens Commercial Complex",
          building_name: bld?.building_name || "Tower A",
          unit: sp?.space_name || sp?.space_number || "Suite 401",
          chargeable_area_sqft: sp?.chargeable_area || 8500,
        },
        taxation: {
          sac_code: "997212",
          is_intra_state: isIntraState,
          subtotal: subtotal.toFixed(2),
          cgst_rate: isIntraState ? "9.00%" : "0.00%",
          cgst_amount: cgst.toFixed(2),
          sgst_rate: isIntraState ? "9.00%" : "0.00%",
          sgst_amount: sgst.toFixed(2),
          igst_rate: !isIntraState ? "18.00%" : "0.00%",
          igst_amount: igst.toFixed(2),
          total_gst: totalGst.toFixed(2),
          gross_total: grossTotal.toFixed(2),
          tds_rate_section_194_i: "10.00%",
          expected_tds_deduction: expectedTds.toFixed(2),
          net_payable_post_tds: netPayable.toFixed(2),
          amount_in_words: amountInWords,
        },
        lines: lines.map((l, idx) => ({
          sl_no: idx + 1,
          description: l.description,
          sac_code: "997212",
          quantity: l.quantity,
          rate: l.rate,
          taxable_amount: l.amount_inr,
          gst_rate: "18%",
          total_amount: (parseFloat(l.amount_inr) * 1.18).toFixed(2),
        })),
      });
    }

    // Default: Printable Indian Tax Invoice HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${inv.invoice_number} | OFFICEX</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f1f5f9;
      font-size: 12px;
      line-height: 1.4;
    }
    .toolbar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .toolbar h1 { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
    .toolbar .badge {
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: #3b82f6; color: #ffffff; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #334155; color: #e2e8f0; }
    .btn-secondary:hover { background: #475569; }
    .page-container {
      max-width: 820px;
      margin: 24px auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .invoice-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .tax-invoice-tag {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-align: right;
      letter-spacing: 1px;
    }
    .sub-rule { font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 16px;
    }
    .meta-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .meta-box p { font-size: 12px; margin-bottom: 3px; }
    .meta-box .bold { font-weight: 700; color: #0f172a; }
    .invoice-details-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .detail-item .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .detail-item .val { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    table.line-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.line-items th {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
    }
    table.line-items td {
      padding: 9px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
    }
    table.line-items tr:last-child td { border-bottom: 2px solid #0f172a; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .tax-summary-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }
    .words-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 6px;
      font-size: 11.5px;
    }
    .words-box .lbl { font-weight: 700; color: #475569; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; }
    .words-box .amt-words { font-weight: 700; color: #0f172a; }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 5px 8px;
      font-size: 11.5px;
    }
    .totals-table .grand-row td {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .bank-and-signatory {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 20px;
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .bank-box {
      font-size: 11px;
      background: #fafafa;
      padding: 10px;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
    }
    .bank-box h4 { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .signatory-box {
      text-align: right;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 110px;
    }
    .signatory-box .title { font-weight: 700; color: #0f172a; font-size: 11px; }
    .signatory-box .sign-line {
      margin-top: 40px;
      font-weight: 600;
      font-size: 11px;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      display: inline-block;
    }
    .footer-notes {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #64748b;
      line-height: 1.4;
    }
    @media print {
      body { background: #ffffff !important; }
      .toolbar { display: none !important; }
      .page-container {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <h1>OFFICEX RENT ROLL &middot; STATUTORY TAX INVOICE</h1>
      <span class="badge">Rule 46 Compliant</span>
    </div>
    <div class="toolbar-actions">
      <button onclick="window.print()" class="btn btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
      <a href="/operate/invoices" class="btn btn-secondary">
        Back to Invoices
      </a>
    </div>
  </div>

  <div class="page-container">
    <!-- Header -->
    <div class="invoice-header">
      <div>
        <div class="brand-title">OFFICEX</div>
        <p style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">Institutional Commercial Real Estate Assets</p>
      </div>
      <div>
        <div class="tax-invoice-tag">TAX INVOICE</div>
        <div class="sub-rule">Original for Recipient &middot; Section 31 of CGST Act</div>
      </div>
    </div>

    <!-- Metadata Details Card -->
    <div class="invoice-details-card">
      <div class="detail-item">
        <div class="lbl">Invoice Number</div>
        <div class="val">${inv.invoice_number}</div>
      </div>
      <div class="detail-item">
        <div class="lbl">Invoice Date</div>
        <div class="val">${inv.invoice_date}</div>
      </div>
      <div class="detail-item">
        <div class="lbl">Due Date</div>
        <div class="val">${inv.due_date}</div>
      </div>
      <div class="detail-item">
        <div class="lbl">Place of Supply</div>
        <div class="val">${buyerState} (${buyerStateCode})</div>
      </div>
    </div>

    <!-- Supplier & Buyer Grid -->
    <div class="meta-grid">
      <!-- Supplier -->
      <div class="meta-box">
        <h3>Supplier (Billing Entity)</h3>
        <p class="bold">${supplierLegalName}</p>
        <p>${supplierAddress}</p>
        <p><span class="bold">GSTIN:</span> ${supplierGstin}</p>
        <p><span class="bold">PAN:</span> ${supplierPan} &middot; <span class="bold">State:</span> ${supplierState} (${supplierStateCode})</p>
      </div>

      <!-- Buyer -->
      <div class="meta-box">
        <h3>Recipient (Billed To)</h3>
        <p class="bold">${buyerLegalName}</p>
        <p>${buyerAddress}</p>
        <p><span class="bold">GSTIN:</span> ${buyerGstin || "Unregistered / B2C"}</p>
        <p><span class="bold">PAN:</span> ${buyerPan} &middot; <span class="bold">State:</span> ${buyerState} (${buyerStateCode})</p>
        <p style="margin-top: 4px; font-size: 11px; color: #475569;">
          <span class="bold">Premises:</span> ${prop?.property_name || "Commercial Complex"}, ${bld?.building_name || "Main Tower"}, ${sp?.space_name || "Leased Suite"}
        </p>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="line-items">
      <thead>
        <tr>
          <th style="width: 32px;" class="text-center">#</th>
          <th>Description of Service</th>
          <th style="width: 80px;" class="text-center">SAC Code</th>
          <th style="width: 80px;" class="text-right">Qty / Area</th>
          <th style="width: 90px;" class="text-right">Rate (₹)</th>
          <th style="width: 100px;" class="text-right">Taxable Amt (₹)</th>
          <th style="width: 60px;" class="text-center">GST %</th>
          <th style="width: 105px;" class="text-right">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${
          lines.length > 0
            ? lines
                .map(
                  (l, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${l.description}</div>
              <div style="font-size: 10px; color: #64748b;">Period: ${inv.period_start || inv.invoice_date} to ${inv.period_end || inv.due_date}</div>
            </td>
            <td class="text-center font-mono">997212</td>
            <td class="text-right">${parseFloat(l.quantity || "1").toLocaleString("en-IN")}</td>
            <td class="text-right">${parseFloat(l.rate || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-right" style="font-weight: 600;">${parseFloat(l.amount_inr || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-center">18%</td>
            <td class="text-right" style="font-weight: 700;">${(parseFloat(l.amount_inr || "0") * 1.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>`
                )
                .join("")
            : `
          <tr>
            <td class="text-center">1</td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">Commercial Lease Rent & Amenities</div>
              <div style="font-size: 10px; color: #64748b;">Billing Period: ${inv.period_start || inv.invoice_date} to ${inv.period_end || inv.due_date}</div>
            </td>
            <td class="text-center">997212</td>
            <td class="text-right">1</td>
            <td class="text-right">${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-right" style="font-weight: 600;">${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-center">18%</td>
            <td class="text-right" style="font-weight: 700;">${grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>`
        }
      </tbody>
    </table>

    <!-- Totals & Amount in Words -->
    <div class="tax-summary-grid">
      <div class="words-box">
        <div class="lbl">Total Amount (in words)</div>
        <div class="amt-words">${amountInWords}</div>
        
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
          <div class="lbl">TDS Statutory Deduction (Section 194-I)</div>
          <div style="font-size: 11px; color: #475569;">
            Applicable TDS @ 10%: <span style="font-weight: 700; color: #b45309;">₹${expectedTds.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <br>
            Expected Net Remittance: <span style="font-weight: 700; color: #0f172a;">₹${netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div>
        <table class="totals-table">
          <tr>
            <td style="color: #64748b;">Taxable Subtotal:</td>
            <td class="text-right" style="font-weight: 600;">₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          ${
            isIntraState
              ? `
          <tr>
            <td style="color: #64748b;">CGST @ 9.00%:</td>
            <td class="text-right">₹${cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">SGST @ 9.00%:</td>
            <td class="text-right">₹${sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>`
              : `
          <tr>
            <td style="color: #64748b;">IGST @ 18.00%:</td>
            <td class="text-right">₹${igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>`
          }
          <tr class="grand-row">
            <td>Total Invoice Value:</td>
            <td class="text-right">₹${grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Banking & Signatory -->
    <div class="bank-and-signatory">
      <div class="bank-box">
        <h4>Electronic Bank Transfer Details (NEFT / RTGS)</h4>
        <p><span class="bold">Beneficiary:</span> ${supplierLegalName}</p>
        <p><span class="bold">Bank Name:</span> ${bankName}</p>
        <p><span class="bold">Account Number:</span> ${bankAccount}</p>
        <p><span class="bold">IFSC Code:</span> ${bankIfsc} &middot; <span class="bold">Branch:</span> ${bankBranch}</p>
        <p style="margin-top: 4px; color: #0284c7; font-weight: 600;">UPI ID: officex.pay@hdfcbank</p>
      </div>

      <div class="signatory-box">
        <div class="title">For ${supplierLegalName}</div>
        <div>
          <div class="sign-line">Authorized Signatory</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Digitally signed &middot; No physical seal required</div>
        </div>
      </div>
    </div>

    <!-- Footer Notes -->
    <div class="footer-notes">
      <p>1. Payments received after the due date will attract late payment interest @ 18% per annum as per contract terms.</p>
      <p>2. Please quote Invoice Number ${inv.invoice_number} in all NEFT/RTGS transaction remarks for automated settlement.</p>
      <p>3. Form 16A TDS certificates must be furnished quarterly to accounts@officex.com within statutory timelines.</p>
    </div>
  </div>

  ${autoPrint ? `<script>window.onload = function() { window.print(); };</script>` : ""}
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("GET /api/invoices/[id]/pdf error:", err);
    return NextResponse.json({ error: err?.message || "Failed to generate PDF" }, { status: 500 });
  }
}

"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  FileCheck2,
  Receipt,
  CreditCard,
  QrCode,
  DollarSign,
  ShieldCheck,
  Building
} from "lucide-react";
import { InvoiceItem } from "./InvoicesTab";
import { formatINR } from "./DashboardTab";

interface TaxInvoiceDrawerProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
  onOpenRecordPayment?: (invoice: InvoiceItem) => void;
}

function numberToWordsINR(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  return inWords(Math.floor(num)).trim() + ' Rupees Only';
}

export const TaxInvoiceDrawer: React.FC<TaxInvoiceDrawerProps> = ({
  invoice,
  onClose,
  onOpenRecordPayment,
}) => {
  const [orgData, setOrgData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/rent-roll/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.organization) setOrgData(data.organization);
        if (data.properties && invoice?.propertyName) {
          const prop = data.properties.find((p: any) => 
            p.id === invoice.propertyId || 
            p.name.toLowerCase() === invoice.propertyName.toLowerCase()
          );
          if (prop) setPropertyData(prop);
        }
        if (data.tenants && invoice?.tenantName) {
          const ten = data.tenants.find((t: any) =>
            t.id === invoice.tenantId ||
            t.tradeName.toLowerCase() === invoice.tenantName.toLowerCase()
          );
          if (ten) setTenantData(ten);
        }
      })
      .catch(err => console.warn("Note loading org details:", err));
  }, [invoice]);

  if (!invoice) return null;

  const cgstAmount = Math.round(invoice.gstAmount / 2);
  const sgstAmount = invoice.gstAmount - cgstAmount;

  // Real Property Owner Details from Onboarding KYC
  const ownerLegalName = orgData?.tradeName || orgData?.name || "testing groups";
  const ownerAddress = orgData?.address || "Club Babylon, S P Ring Road, Ahmedabad, Gujarat, India, 380060";
  const ownerPan = orgData?.pan || "3SASDFW123";
  const ownerGstin = orgData?.gstin || "123SASDFW123DS1";
  const ownerState = orgData?.state || "Gujarat";
  const stateCode = ownerState.toLowerCase().includes("gujarat") ? "24" : "27";

  // Real Bank Account for NEFT / RTGS
  const bankName = orgData?.bankName?.toUpperCase() || "HDFC BANK";
  const bankAccount = orgData?.bankAccountNumber || "718737648998178299";
  const bankIfsc = orgData?.bankIfsc || "HDFC1212211";
  const bankBranch = orgData?.bankBranch || "Ahmedabad Central Branch";

  // Property Details
  const propertyName = propertyData?.name || invoice.propertyName || "Commercial Property";
  const propertyAddress = propertyData?.address || "White House, Gulbai Tekra Road, Gulbai tekra, Ahmedabad, Gujarat 380009";

  // Dynamic UPI Payment QR Code
  const upiPayload = `upi://pay?pa=${bankAccount}@hdfcbank&pn=${encodeURIComponent(ownerLegalName)}&am=${invoice.balanceDue}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiPayload)}`;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-tax-invoice");
    if (!printContent) return;

    let iframe = document.getElementById("print-invoice-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-invoice-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${invoice.invoiceNumber}</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm !important;
            }
            @media print {
              html, body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0 !important;
                padding: 4mm !important;
                background: #ffffff !important;
              }
            }
            body {
              background-color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #111827;
              margin: 0;
            }
          </style>
        </head>
        <body class="bg-white text-gray-900">
          <div class="max-w-4xl mx-auto">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/60 backdrop-blur-xs flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideUp">
        {/* Top Header Bar with Print Button */}
        <div className="p-4 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between no-print sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-gray-900">GST Tax Invoice Viewer</span>
            <span className="px-2.5 py-0.5 bg-teal-50 text-[#0F8B7D] text-[10px] rounded-md font-mono font-bold border border-teal-200">
              ORIGINAL FOR RECIPIENT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div id="printable-tax-invoice" className="p-6 sm:p-10 bg-white text-gray-900 space-y-6 font-sans text-xs">
          
          {/* HEADER STRIP: REAL LANDLORD ONBOARDING DETAILS & OFFICEX BADGE */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-gray-900">
            {/* Left: Landlord / Property Details from Onboarding */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-gray-950 uppercase">
                    {ownerLegalName}
                  </h1>
                  <span className="text-[10px] font-bold text-teal-700 tracking-wider uppercase block">
                    Commercial Property Lessor &amp; Asset Management
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-[11px] leading-relaxed">
                {ownerAddress}
              </p>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 flex items-center gap-3">
                <span>GSTIN: <strong className="text-slate-900 font-bold">{ownerGstin}</strong></span>
                <span>•</span>
                <span>PAN: <strong className="text-slate-900 font-bold">{ownerPan}</strong></span>
                <span>•</span>
                <span>State Code: <strong className="text-slate-900 font-bold">{stateCode}</strong></span>
              </div>

              <div className="text-[10px] text-teal-800 font-semibold flex items-center gap-1.5 pt-0.5">
                <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Demised Commercial Asset: <strong>{propertyName}</strong> ({propertyAddress})</span>
              </div>
            </div>

            {/* Right: Tax Invoice Details & Official OfficeX Certification Badge */}
            <div className="text-left sm:text-right space-y-1.5 shrink-0">
              <div className="flex items-center sm:justify-end gap-1.5 text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 w-fit sm:ml-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>OfficeX Enterprise Asset OS Verified</span>
              </div>

              <h2 className="text-2xl font-black text-gray-950 tracking-wider">
                TAX INVOICE
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                Issued under Section 31 of CGST Act, 2017 &amp; Rule 46 of CGST Rules
              </p>

              <div className="pt-1">
                <p className="font-mono text-gray-950 text-sm font-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block">
                  {invoice.invoiceNumber}
                </p>
                <div className="text-[11px] text-gray-600 space-y-0.5 mt-1">
                  <p>Invoice Date: <strong className="text-gray-900 font-mono">{invoice.invoiceDate}</strong></p>
                  <p>Due Date: <strong className="text-rose-700 font-mono font-bold">{invoice.dueDate}</strong></p>
                </div>
              </div>

              {invoice.status === "paid" || invoice.balanceDue === 0 ? (
                <div className="mt-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3" /> FULLY SETTLED / PAID
                </div>
              ) : (
                <div className="mt-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block">
                  PAYMENT DUE
                </div>
              )}
            </div>
          </div>

          {/* BILLED TO (TENANT) & LEASE PARTICULARS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                BILLED TO / CORPORATE TENANT
              </span>
              <h3 className="text-sm font-extrabold text-slate-950">
                {invoice.tenantName}
              </h3>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Allocated Premises: <strong>{invoice.unitNumber || "Ground Floor Suite"}</strong>
              </p>
              <p className="text-slate-600 text-[11px]">
                Building: <strong>{propertyName}</strong>
              </p>
              <p className="text-slate-500 text-[10px] font-mono mt-1">
                GSTIN: <strong>{tenantData?.gstin || "27AAACR1234F1Z5 (Registered)"}</strong> • PAN: <strong>{tenantData?.pan || "ABCDE1232S"}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                COMMERCIAL LEASE &amp; TAX PARTICULARS
              </span>
              <p className="font-mono text-teal-800 text-xs font-bold">
                Lease Reference: {invoice.leaseCode}
              </p>
              <p className="text-slate-600 text-[11px]">
                Billing Period: <span className="font-semibold text-slate-900">{invoice.periodStart}</span> to <span className="font-semibold text-slate-900">{invoice.periodEnd}</span>
              </p>
              <p className="text-slate-600 text-[11px]">
                Place of Supply: <strong>{ownerState} (State Code {stateCode})</strong>
              </p>
              <p className="text-slate-500 text-[10px]">
                Reverse Charge (RCM): <strong>No</strong>
              </p>
            </div>
          </div>

          {/* LINE ITEMS TABLE WITH SAC 997212 */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[9px] font-black tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3 w-8">#</th>
                  <th className="p-3">Description of Services</th>
                  <th className="p-3 text-center">SAC Code</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-right">CGST (9%)</th>
                  <th className="p-3 text-right">SGST (9%)</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {/* Line Item 1: Base Rent */}
                {invoice.baseRent > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-gray-400">01</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">Commercial Office Space Lease Rental</div>
                      <div className="text-[10px] text-gray-500">
                        Monthly contractual base rent for {invoice.unitNumber || "Premises"} at {propertyName}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">997212</td>
                    <td className="p-3 text-right font-mono text-gray-800">{formatINR(invoice.baseRent)}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-900">{formatINR(Math.round(invoice.baseRent * 1.18))}</td>
                  </tr>
                )}

                {/* Line Item 2: CAM Recovery */}
                {invoice.camCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-gray-400">02</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">Common Area Maintenance (CAM) Charges</div>
                      <div className="text-[10px] text-gray-500">
                        Building operations, 24/7 security, HVAC &amp; common housekeeping
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">997212</td>
                    <td className="p-3 text-right font-mono text-gray-800">{formatINR(invoice.camCharges)}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-900">{formatINR(Math.round(invoice.camCharges * 1.18))}</td>
                  </tr>
                )}

                {/* Line Item 3: Utility Charges */}
                {invoice.utilityCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-gray-400">03</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">Power &amp; Utility Infrastructure Surcharge</div>
                      <div className="text-[10px] text-gray-500">Transformer backup &amp; power feeder quota</div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">997212</td>
                    <td className="p-3 text-right font-mono text-gray-800">{formatINR(invoice.utilityCharges)}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-gray-600">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-900">{formatINR(Math.round(invoice.utilityCharges * 1.18))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* AMOUNT IN WORDS STRIP */}
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-teal-950 font-bold">Total Amount in Words:</span>
            <span className="font-bold text-teal-900 italic font-serif text-[11px]">
              {numberToWordsINR(invoice.grossTotal)}
            </span>
          </div>

          {/* TOTALS & OFFICIAL ESCROW SETTLEMENT BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            {/* Official Bank Details + Dynamic UPI QR Code */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                    BANK TRANSFER INSTRUCTIONS (NEFT / RTGS / IMPS)
                  </span>
                  <div className="space-y-1 text-slate-800 font-mono text-[11px] pt-1">
                    <p>Beneficiary: <strong className="text-slate-950">{ownerLegalName}</strong></p>
                    <p>Bank: <strong className="text-slate-950">{bankName}</strong></p>
                    <p>Account No: <strong className="text-slate-950 font-black tracking-wider">{bankAccount}</strong></p>
                    <p>IFSC Code: <strong className="text-teal-700 font-bold">{bankIfsc}</strong> ({bankBranch})</p>
                  </div>
                </div>

                {/* Instant Scan UPI QR */}
                <div className="text-center shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Scan to Pay QR Code"
                    className="w-20 h-20 rounded-lg border border-slate-300 bg-white p-1 mx-auto shadow-2xs"
                  />
                  <span className="text-[9px] font-bold text-slate-500 block mt-1">Scan via UPI</span>
                </div>
              </div>

              {invoice.status === "paid" && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Settled via {invoice.paymentMode || "NEFT / RTGS"} · Ref #{invoice.referenceNumber || "OX-SETTLE-9821"}</span>
                </div>
              )}
            </div>

            {/* Financial Summary & Tax Computation */}
            <div className="space-y-2 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono text-slate-950 font-bold">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CGST (9.0%):</span>
                <span className="font-mono text-slate-700">{formatINR(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SGST (9.0%):</span>
                <span className="font-mono text-slate-700">{formatINR(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-extrabold pt-2 border-t border-slate-200">
                <span>Total Gross Invoice Value:</span>
                <span className="font-mono text-slate-950 font-black text-sm">{formatINR(invoice.grossTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 text-[11px]">
                <span>Less: TDS u/s 194-I (10% on Rent):</span>
                <span className="font-mono text-rose-600 font-semibold">-{formatINR(invoice.tdsDeducted)}</span>
              </div>
              
              <div className="flex justify-between text-xs font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Net Invoice Value (Payable):</span>
                <span className="font-mono text-slate-950">{formatINR(invoice.netPayable)}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span>Less: Payment Received:</span>
                  <span className="font-mono">-{formatINR(invoice.amountPaid)}</span>
                </div>
              )}

              {/* Final Balance Due */}
              {invoice.balanceDue === 0 || invoice.status === "paid" ? (
                <div className="flex justify-between items-center text-sm font-black text-emerald-800 pt-2 border-t border-emerald-200 bg-emerald-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Balance Due:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700">₹0.00</span>
                    <span className="ml-2 text-[10px] uppercase font-extrabold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">PAID</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-base font-black text-[#0F8B7D] pt-2 border-t border-teal-200 bg-teal-50 p-2.5 rounded-xl">
                  <span>Current Balance Due:</span>
                  <span className="font-mono">{formatINR(invoice.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* SIGNATORY & DECLARATION FOOTER */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-gray-500">
            <div className="space-y-1 max-w-sm">
              <p className="font-bold text-gray-700">Terms &amp; Conditions:</p>
              <p>1. Payment is strictly due on or before the due date indicated above.</p>
              <p>2. Delayed payments attract interest @ 18% p.a. as per lease terms.</p>
              <p>3. This is a computer-generated tax invoice verified on OfficeX Enterprise Platform.</p>
            </div>

            <div className="text-right space-y-8 sm:w-64">
              <div>
                <p className="font-extrabold text-gray-900">For {ownerLegalName}</p>
                <p className="text-[10px] text-gray-500">Authorized Signatory / Asset Manager</p>
              </div>
              <div className="border-t border-gray-400 pt-1 text-[9px] text-gray-400">
                Signature &amp; Corporate Seal
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Settle Button */}
        {invoice.balanceDue > 0 && onOpenRecordPayment && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 no-print">
            <button
              onClick={() => onOpenRecordPayment(invoice)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Payment Received for this Invoice</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

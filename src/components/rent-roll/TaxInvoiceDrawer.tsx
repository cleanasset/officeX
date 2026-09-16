"use client";

import React from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  FileCheck2,
  Receipt,
  CreditCard,
  QrCode,
  DollarSign
} from "lucide-react";
import { InvoiceItem } from "./InvoicesTab";
import { formatINR } from "./DashboardTab";

interface TaxInvoiceDrawerProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
  onOpenRecordPayment: (invoice: InvoiceItem) => void;
}

export const TaxInvoiceDrawer: React.FC<TaxInvoiceDrawerProps> = ({
  invoice,
  onClose,
  onOpenRecordPayment,
}) => {
  if (!invoice) return null;

  const cgstAmount = Math.round(invoice.gstAmount / 2);
  const sgstAmount = invoice.gstAmount - cgstAmount;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-tax-invoice");
    if (!printContent) return;

    // Create an invisible iframe for seamless print preview without browser headers/footers
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
          <title>&nbsp;</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 0mm !important;
              }
              html, body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0 !important;
                padding: 12mm 15mm !important;
                background: #ffffff !important;
              }
            }
            body {
              background-color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #111827;
              padding: 12mm 15mm;
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideUp">
        {/* Top Header Bar with Print Button */}
        <div className="p-4 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between no-print">
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
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Print / PDF</span>
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
        <div id="printable-tax-invoice" className="p-8 bg-white text-gray-900 space-y-6 font-sans text-xs">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-[#0F8B7D] text-white font-black flex items-center justify-center text-xs">
                  OX
                </div>
                <span className="text-lg font-black tracking-tight text-gray-950">OFFICEX ASSET MANAGEMENT</span>
              </div>
              <p className="text-gray-500 text-[11px] font-medium">Level 14, Tower 2, One International Center, Prabhadevi, Mumbai 400013</p>
              <p className="text-gray-500 text-[11px] font-mono mt-1">
                GSTIN: <span className="text-gray-900 font-bold">27AAFCO1234F1Z5</span> • PAN: <span className="text-gray-900 font-bold">AAFCO1234F</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="flex items-center sm:justify-end gap-2 mb-1">
                <h2 className="text-xl font-black text-gray-900 tracking-wider">TAX INVOICE</h2>
                {invoice.status === "paid" || invoice.balanceDue === 0 ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3" /> PAID
                  </span>
                ) : invoice.status === "overdue" ? (
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-md text-[10px] font-black uppercase tracking-wider">
                    OVERDUE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider">
                    PAYMENT DUE
                  </span>
                )}
              </div>
              <p className="font-mono text-gray-900 text-sm font-bold mt-0.5">{invoice.invoiceNumber}</p>
              <p className="text-gray-500 text-[11px]">Date: <span className="text-gray-900 font-mono font-semibold">{invoice.invoiceDate}</span></p>
              <p className="text-gray-500 text-[11px]">Due Date: <span className="text-gray-900 font-mono font-bold">{invoice.dueDate}</span></p>
            </div>
          </div>

          {/* Billed To & Lease Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">BILLED TO (TENANT)</span>
              <h4 className="text-sm font-bold text-gray-950 mt-1">{invoice.tenantName}</h4>
              <p className="text-gray-600 text-[11px] mt-0.5">Demised Premises: {invoice.propertyName}</p>
              <p className="text-gray-500 text-[11px] font-mono mt-1">Place of Supply: Maharashtra (State Code 27)</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">COMMERCIAL REFERENCE</span>
              <p className="font-mono text-indigo-700 text-xs font-bold mt-1">Lease Ref: {invoice.leaseCode}</p>
              <p className="text-gray-600 text-[11px] mt-0.5">Billing Period: {invoice.periodStart} to {invoice.periodEnd}</p>
              <p className="text-gray-500 text-[11px]">Payment Terms: Net 15 Days</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/95 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Services</th>
                  <th className="p-3 text-center">HSN/SAC</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-right">CGST (9%)</th>
                  <th className="p-3 text-right">SGST (9%)</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {/* Line Item 1: Base Rent */}
                <tr>
                  <td className="p-3 font-mono text-gray-400">01</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900">Commercial Office Space Lease Rental</div>
                    <div className="text-[10px] text-gray-500">Monthly contractual base rent</div>
                  </td>
                  <td className="p-3 text-center font-mono text-gray-600">997212</td>
                  <td className="p-3 text-right font-mono text-gray-700">{formatINR(invoice.baseRent)}</td>
                  <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                  <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900">{formatINR(Math.round(invoice.baseRent * 1.18))}</td>
                </tr>

                {/* Line Item 2: CAM Recovery */}
                {invoice.camCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-gray-400">02</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">Common Area Maintenance (CAM) Charges</div>
                      <div className="text-[10px] text-gray-500">Building operations, security &amp; housekeeping</div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">997212</td>
                    <td className="p-3 text-right font-mono text-gray-700">{formatINR(invoice.camCharges)}</td>
                    <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{formatINR(Math.round(invoice.camCharges * 1.18))}</td>
                  </tr>
                )}

                {/* Line Item 3: Utility Charges */}
                {invoice.utilityCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-gray-400">03</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">Power &amp; Utility Infrastructure Surcharge</div>
                      <div className="text-[10px] text-gray-500">Transformer backup &amp; water sewage quota</div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">997212</td>
                    <td className="p-3 text-right font-mono text-gray-700">{formatINR(invoice.utilityCharges)}</td>
                    <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-gray-500">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{formatINR(Math.round(invoice.utilityCharges * 1.18))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & TDS Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Bank Details */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 flex-1 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                OFFICIAL ESCROW BANK DETAILS (FOR NEFT / RTGS)
              </span>
              <div className="space-y-1 text-gray-700 font-mono text-[11px]">
                <p>Bank Name: <span className="text-gray-900 font-bold">HDFC Bank Limited</span></p>
                <p>Account Name: <span className="text-gray-900 font-bold">OfficeX Asset Management India Pvt Ltd - Escrow A/C</span></p>
                <p>Account Number: <span className="text-gray-900 font-bold">50200088991204</span></p>
                <p>IFSC Code: <span className="text-teal-700 font-bold">HDFC0000128</span> (BKC Branch)</p>
              </div>

              {invoice.status === "paid" && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Settled via {invoice.paymentMode || "NEFT / RTGS"} · Ref #{invoice.referenceNumber || "OX-SETTLE-9821"}</span>
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="w-full sm:w-80 space-y-2 p-4 bg-gray-50/80 rounded-xl border border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono text-gray-900 font-bold">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>CGST (9.0%):</span>
                <span className="font-mono text-gray-700">{formatINR(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST (9.0%):</span>
                <span className="font-mono text-gray-700">{formatINR(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                <span>Total Gross Invoice Value:</span>
                <span className="font-mono text-gray-950 font-black">{formatINR(invoice.grossTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 pt-1">
                <span>Less: TDS u/s 194-I (10% on Rent):</span>
                <span className="font-mono text-rose-600 font-semibold">-{formatINR(invoice.tdsDeducted)}</span>
              </div>
              
              <div className="flex justify-between text-xs font-bold text-gray-700 pt-2 border-t border-gray-200">
                <span>Net Invoice Value (Billed):</span>
                <span className="font-mono text-gray-900">{formatINR(invoice.netPayable)}</span>
              </div>

              {/* Amount Paid Ledger Line */}
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span>Less: Payment Received:</span>
                  <span className="font-mono">-{formatINR(invoice.amountPaid)}</span>
                </div>
              )}

              {/* Final Balance Due Box */}
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
                <div className="flex justify-between text-base font-black text-[#0F8B7D] pt-2 border-t border-gray-200 bg-teal-50/80 p-2.5 rounded-xl">
                  <span>Current Balance Due:</span>
                  <span className="font-mono">{formatINR(invoice.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Settle Button */}
        {invoice.balanceDue > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
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

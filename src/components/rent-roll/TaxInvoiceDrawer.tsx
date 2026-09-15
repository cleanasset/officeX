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

  const handlePrint = () => {
    window.print();
  };

  const cgstAmount = Math.round(invoice.gstAmount / 2);
  const sgstAmount = invoice.gstAmount - cgstAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideUp">
        {/* Top Header Bar with Print Button */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white">GST Tax Invoice Viewer</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-mono font-bold border border-emerald-500/30">
              ORIGINAL FOR RECIPIENT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div className="p-8 bg-slate-950 text-slate-100 space-y-6 font-sans text-xs">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  OX
                </div>
                <span className="text-lg font-black tracking-tight text-white">OFFICEX ASSET MANAGEMENT</span>
              </div>
              <p className="text-slate-400 text-[11px]">Level 14, Tower 2, One International Center, Prabhadevi, Mumbai 400013</p>
              <p className="text-slate-400 text-[11px] font-mono mt-1">
                GSTIN: <span className="text-white font-bold">27AAFCO1234F1Z5</span> • PAN: <span className="text-white font-bold">AAFCO1234F</span>
              </p>
            </div>

            <div className="text-right sm:text-right">
              <h2 className="text-xl font-black text-amber-400 tracking-wider">TAX INVOICE</h2>
              <p className="font-mono text-white text-sm font-bold mt-1">{invoice.invoiceNumber}</p>
              <p className="text-slate-400 text-[11px]">Date: <span className="text-white font-mono">{invoice.invoiceDate}</span></p>
              <p className="text-slate-400 text-[11px]">Due Date: <span className="text-amber-300 font-mono font-bold">{invoice.dueDate}</span></p>
            </div>
          </div>

          {/* Billed To & Lease Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">BILLED TO (TENANT)</span>
              <h4 className="text-sm font-bold text-white mt-1">{invoice.tenantName}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Demised Premises: {invoice.propertyName}</p>
              <p className="text-slate-400 text-[11px] font-mono mt-1">Place of Supply: Maharashtra (State Code 27)</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">COMMERCIAL REFERENCE</span>
              <p className="font-mono text-white text-xs font-semibold mt-1">Lease Ref: {invoice.leaseCode}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Billing Period: {invoice.periodStart} to {invoice.periodEnd}</p>
              <p className="text-slate-400 text-[11px]">Payment Terms: Net 15 Days</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {/* Line Item 1: Base Rent */}
                <tr>
                  <td className="p-3 font-mono text-slate-500">01</td>
                  <td className="p-3">
                    <div className="font-bold text-white">Commercial Office Space Lease Rental</div>
                    <div className="text-[10px] text-slate-500">Monthly contractual base rent</div>
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">997212</td>
                  <td className="p-3 text-right font-mono text-slate-200">{formatINR(invoice.baseRent)}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.baseRent * 0.09))}</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{formatINR(Math.round(invoice.baseRent * 1.18))}</td>
                </tr>

                {/* Line Item 2: CAM Recovery */}
                {invoice.camCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-slate-500">02</td>
                    <td className="p-3">
                      <div className="font-bold text-white">Common Area Maintenance (CAM) Charges</div>
                      <div className="text-[10px] text-slate-500">Building operations, security & housekeeping</div>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-400">997212</td>
                    <td className="p-3 text-right font-mono text-slate-200">{formatINR(invoice.camCharges)}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.camCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">{formatINR(Math.round(invoice.camCharges * 1.18))}</td>
                  </tr>
                )}

                {/* Line Item 3: Utility Charges */}
                {invoice.utilityCharges > 0 && (
                  <tr>
                    <td className="p-3 font-mono text-slate-500">03</td>
                    <td className="p-3">
                      <div className="font-bold text-white">Power & Utility Infrastructure Surcharge</div>
                      <div className="text-[10px] text-slate-500">Transformer backup & water sewage quota</div>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-400">997212</td>
                    <td className="p-3 text-right font-mono text-slate-200">{formatINR(invoice.utilityCharges)}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{formatINR(Math.round(invoice.utilityCharges * 0.09))}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">{formatINR(Math.round(invoice.utilityCharges * 1.18))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & TDS Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Bank Details */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex-1 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OFFICIAL ESCROW BANK DETAILS (FOR NEFT / RTGS)
              </span>
              <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                <p>Bank Name: <span className="text-white font-bold">HDFC Bank Limited</span></p>
                <p>Account Name: <span className="text-white font-bold">OfficeX Asset Management India Pvt Ltd - Escrow A/C</span></p>
                <p>Account Number: <span className="text-white font-bold">50200088991204</span></p>
                <p>IFSC Code: <span className="text-amber-400 font-bold">HDFC0000128</span> (BKC Branch)</p>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="w-full sm:w-80 space-y-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono text-white">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CGST (9.0%):</span>
                <span className="font-mono text-slate-300">{formatINR(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST (9.0%):</span>
                <span className="font-mono text-slate-300">{formatINR(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-amber-300">{formatINR(invoice.grossTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Less: TDS u/s 194I (10% on Rent):</span>
                <span className="font-mono text-red-400">-{formatINR(invoice.tdsDeducted)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-400 pt-2 border-t border-slate-700 bg-emerald-950/20 p-2 rounded-lg">
                <span>Net Payable:</span>
                <span className="font-mono">{formatINR(invoice.netPayable)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Settle Button */}
        {invoice.balanceDue > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenRecordPayment(invoice)}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Payment Receipt for this Invoice</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

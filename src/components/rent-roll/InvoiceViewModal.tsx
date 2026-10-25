"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  FileText,
  CreditCard,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface InvoiceLineItem {
  id: string;
  description: string;
  hsn_sac: string;
  quantity: number | string;
  rate: number | string;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  total_amount: number;
}

export interface InvoiceViewModalProps {
  invoice: any;
  onClose: () => void;
}

export default function InvoiceViewModal({ invoice, onClose }: InvoiceViewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const invoiceNumber = invoice.invoice_number || `INV-${invoice.id?.slice(0, 8) || "DRAFT"}`;
  const invoiceDate = invoice.invoice_date || new Date().toISOString().split("T")[0];
  const dueDate = invoice.due_date || new Date(Date.now() + 15 * 86400 * 1000).toISOString().split("T")[0];
  const period = invoice.period || "October 2026";

  const taxableAmount = Number(invoice.subtotal || invoice.taxable || invoice.base_rent || 0);
  const gstAmount = Number(invoice.gst_amount || invoice.gst || 0);
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const grossTotal = Number(invoice.gross_total || invoice.gross || taxableAmount + gstAmount);
  const tdsGuideline = Math.round(taxableAmount * 0.1); // 10% u/s 194-I

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30">
              OX
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                S-41 Tax Invoice Preview
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {invoice.status || "Draft"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Official GST Compliant Commercial Tax Invoice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official GST Invoice Document */}
        <div ref={printRef} className="p-8 text-slate-900 text-xs space-y-6 bg-white font-sans">
          {/* Header & GSTIN Details */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                TAX INVOICE · SECTION 31 CGST ACT
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                {invoice.billing_entity_name || "Apex Real Estate Holdings LLP"}
              </h1>
              <p className="text-slate-600 mt-0.5">
                Regd. Office: 100 MG Road, Outer Ring Road, Bengaluru - 560103, Karnataka
              </p>
              <div className="mt-2 space-y-0.5 font-mono text-[11px] text-slate-700">
                <p>
                  <strong className="text-slate-900">GSTIN:</strong>{" "}
                  {invoice.billing_entity_gstin || "29AABCS1429B1Z1"} (State Code: 29)
                </p>
                <p>
                  <strong className="text-slate-900">PAN:</strong> AABCS1429B | CIN: U70109KA2020LLP123456
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoice Number</span>
                <span className="text-base font-black font-mono text-slate-900">{invoiceNumber}</span>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] space-y-0.5 text-slate-600">
                  <p>
                    <strong>Date:</strong> {invoiceDate}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {dueDate}
                  </p>
                  <p>
                    <strong>Period:</strong> {period}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Premises */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Billed To (Occupant / Lessee)
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {invoice.occupant_name || "TechNova Solutions Pvt Ltd"}
              </h3>
              <p className="text-slate-600 mt-0.5">Demised Premises: {invoice.space_name || "Floor 2, Suite 201"}</p>
              <div className="mt-2 space-y-0.5 font-mono text-[11px] text-slate-700">
                <p>
                  <strong>GSTIN:</strong> {invoice.occupant_gstin || "29AABCT8841F1Z8"}
                </p>
                <p>
                  <strong>Place of Supply:</strong> Karnataka (State Code 29)
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Property & Commercial Terms
              </span>
              <p className="font-semibold text-slate-800">
                {invoice.property_name || "Apex Business Tower"} (Tower A)
              </p>
              <p className="text-slate-600">Chargeable Area: {invoice.area_sqft || 8500} sq ft</p>
              <p className="text-slate-600 mt-1">Payment Mode: NEFT / RTGS / Corporate NetBanking</p>
              <p className="text-emerald-700 font-semibold mt-1">Billing Frequency: Monthly in Advance</p>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Supply</th>
                  <th className="p-3">SAC Code</th>
                  <th className="p-3 text-right">Taxable Value (₹)</th>
                  <th className="p-3 text-right">CGST (9%)</th>
                  <th className="p-3 text-right">SGST (9%)</th>
                  <th className="p-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-mono">01</td>
                  <td className="p-3 font-semibold text-slate-900">
                    Commercial Office Base Rent for {period}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Premises: {invoice.space_name || "Suite 201"} ({invoice.area_sqft || 8500} sq ft)
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">997212</td>
                  <td className="p-3 text-right font-mono font-medium">
                    {taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <td colSpan={3} className="p-3 uppercase text-[10px] tracking-wider text-slate-600">
                    Total Invoice Amount
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    ₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    ₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-sm text-teal-900 font-black">
                    ₹{grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Statutory TDS & Remittance Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Statutory Income Tax TDS Note (Section 194-I)
              </span>
              <p className="text-amber-800 leading-relaxed">
                TDS @ 10% is deductible on taxable base rent of ₹{taxableAmount.toLocaleString("en-IN")} (deduction amount: ₹{tdsGuideline.toLocaleString("en-IN")}). Please remit net balance of ₹{(grossTotal - tdsGuideline).toLocaleString("en-IN")} and issue Form 16A TDS certificate quarterly.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Bank Account Remittance Details</span>
              <p>
                <strong>Bank:</strong> HDFC Bank Ltd | Branch: MG Road, Bengaluru
              </p>
              <p>
                <strong>A/C No:</strong> 50200049281928 (Current Account)
              </p>
              <p>
                <strong>IFSC Code:</strong> HDFC0000042
              </p>
            </div>
          </div>

          {/* Authorized Signatory */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <p>This is a computer-generated tax invoice verified under Section 31 of CGST Act.</p>
              <p className="text-slate-400">OFFICEX Secure Lease-to-Cash SaaS Engine</p>
            </div>
            <div className="text-right">
              <div className="w-36 h-10 border-b border-slate-400 mb-1" />
              <span className="font-semibold text-slate-800">Authorized Signatory</span>
              <span className="block text-[10px] text-slate-400">For {invoice.billing_entity_name || "Apex Real Estate Holdings LLP"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  Building2,
  CheckCircle2,
  FileText,
  CreditCard,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";

export interface InvoiceViewModalProps {
  invoice: any;
  onClose: () => void;
}

export default function InvoiceViewModal({ invoice, onClose }: InvoiceViewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const invoiceNumber = invoice.invoice_number || `INV-${invoice.id?.slice(0, 8) || "DRAFT"}`;
  
  // Format dates cleanly
  const rawDate = invoice.invoice_date || new Date().toISOString().split("T")[0];
  const invoiceDate = new Date(rawDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rawDueDate = invoice.due_date || new Date(Date.now() + 10 * 86400 * 1000).toISOString().split("T")[0];
  const dueDate = new Date(rawDueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const period = invoice.period || "October 2026";

  // Dynamic Landlord Brand / Property Info
  const brandLogo = typeof window !== "undefined"
    ? localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo")
    : "";
  const brandName = typeof window !== "undefined"
    ? localStorage.getItem("officex_brand_name") || localStorage.getItem("officex_company_name") || localStorage.getItem("officex_active_org")
    : "";
  const landlordLegalName = brandName || invoice.billing_entity_name || "Commercial Property Asset SPV";
  const propertyName = invoice.property_name || (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || localStorage.getItem("officex_property_name") : "") || "Apex Tech Park";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      {/* Print Isolation Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #owner-tax-invoice-printable, #owner-tax-invoice-printable * {
            visibility: visible !important;
          }
          #owner-tax-invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Modal Top Bar (Hidden during Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30">
              OX
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Statutory GST Tax Invoice Preview
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {invoice.status || "Draft"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Rule 46 CGST Act Commercial Lease Invoice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official GST Invoice Document */}
        <div
          id="owner-tax-invoice-printable"
          ref={printRef}
          className="p-8 text-slate-900 text-xs space-y-5 bg-white font-sans overflow-y-auto"
        >
          {/* Header & GSTIN Details with Real Property / Landlord Logo */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div className="flex items-start gap-3.5">
              {brandLogo ? (
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <img src={brandLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                  {landlordLegalName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 block">
                  TAX INVOICE · SECTION 31 CGST ACT
                </span>
                <h1 className="text-lg font-black text-slate-950 mt-0.5">
                  {landlordLegalName}
                </h1>
                <p className="text-slate-600 text-xs mt-0.5">
                  Commercial Asset Management · {propertyName}
                </p>
                <div className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-700">
                  <p>
                    <strong className="text-slate-900">GSTIN:</strong> 24AAFCO9876C1Z2 · State: Gujarat (Code: 24)
                  </p>
                  <p>
                    <strong className="text-slate-900">PAN:</strong> AAFCO9876C | SAC: 997212 / 997221
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tax Invoice No:</span>
                <span className="text-sm font-black font-mono text-slate-950 block">{invoiceNumber}</span>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] space-y-0.5 text-slate-600">
                  <p>
                    <strong>Invoice Date:</strong> {invoiceDate}
                  </p>
                  <p className="text-teal-800 font-bold">
                    <strong>Due Date:</strong> {dueDate}
                  </p>
                  <p>
                    <strong>Billing Period:</strong> {period}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Premises */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Billed To (Lessee / Tenant)
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {invoice.occupant_name || "Cognitive Cloud Technologies Pvt Ltd"}
              </h3>
              <p className="text-slate-600 mt-0.5">
                Demised Space: <strong>{invoice.space_name || "Suite 401"}</strong>
              </p>
              <div className="mt-1.5 space-y-0.5 font-mono text-[11px] text-slate-700">
                <p>
                  <strong>GSTIN:</strong> {invoice.occupant_gstin || "24AAACG1234F1Z8"}
                </p>
                <p>
                  <strong>Place of Supply:</strong> Gujarat (Code 24) · Intra-State
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Property & Demised Premises
              </span>
              <p className="font-bold text-slate-900">
                {propertyName}
              </p>
              <p className="text-slate-600">Chargeable Area: {invoice.area_sqft || 15000} sq.ft</p>
              <p className="text-slate-600 mt-1">Payment Mode: Direct RTGS / Virtual Escrow Account</p>
              <p className="text-teal-700 font-bold mt-0.5">Payment Terms: 10 Days from Invoice Date</p>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
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
                    Commercial Space Lease Rental for {period}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Demised: {invoice.space_name || "Suite 401"} ({invoice.area_sqft || 15000} sq.ft)
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
                  <td className="p-3 text-right font-mono font-black text-slate-900">
                    {grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={3} className="p-3 uppercase text-[10px] tracking-wider text-slate-700">
                    Total Gross Payable
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    ₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    ₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    ₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-sm text-teal-950 font-black">
                    ₹{grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Statutory TDS & Bank Wire Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Statutory TDS Guidance (Section 194-I)
              </span>
              <p className="text-amber-900 leading-snug">
                TDS @ 10% is deductible on taxable base rent of ₹{taxableAmount.toLocaleString("en-IN")} (deduction: ₹{tdsGuideline.toLocaleString("en-IN")}). Please remit net ₹{(grossTotal - tdsGuideline).toLocaleString("en-IN")} and upload Form 16A TDS certificate.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Bank Wire Remittance Coordinates</span>
              <p>
                <strong>Bank:</strong> HDFC Bank Ltd | Operating Corporate SPV
              </p>
              <p>
                <strong>A/C No:</strong> 50200049281928 (Escrow Current A/c)
              </p>
              <p>
                <strong>IFSC Code:</strong> HDFC0000042
              </p>
            </div>
          </div>

          {/* Authorized Signatory & Compliance Certification */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <p className="font-medium text-slate-700">Computer generated official tax invoice issued pursuant to Rule 46 CGST Rules, 2017.</p>
              <p className="text-slate-400">OFFICEX Institutional Commercial Operating Suite</p>
            </div>
            <div className="text-right">
              <div className="w-36 h-8 border-b-2 border-slate-400 mb-1" />
              <span className="font-bold text-slate-900 block">Authorized Signatory</span>
              <span className="text-[10px] text-slate-500">For {landlordLegalName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

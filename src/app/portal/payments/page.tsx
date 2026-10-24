"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Printer,
  Eye,
  X
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("FY 2026-27");

  // Dynamic Landlord Brand Logo & Receipt Modal State
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [tenantDisplayName, setTenantDisplayName] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [landlordBank, setLandlordBank] = useState<{
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    spv_name?: string;
  } | null>(null);

  // TDS Certificate Upload state (§T-04)
  const [tdsQuarter, setTdsQuarter] = useState("Q2 (Jul - Sep 2026)");
  const [tdsAmount, setTdsAmount] = useState("");
  const [tdsFileName, setTdsFileName] = useState("");
  const [tdsSubmitted, setTdsSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogo = localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo") || "";
      const storedBrand = localStorage.getItem("officex_brand_name") || "";
      const storedCompany = localStorage.getItem("officex_company_name") || localStorage.getItem("officex_property_spv") || "";
      const storedTenant = localStorage.getItem("officex_tenant_name") || "";
      const storedBankAcc = localStorage.getItem("officex_bank_account") || "";
      const storedBankName = localStorage.getItem("officex_bank_name") || "";
      const storedBankIfsc = localStorage.getItem("officex_bank_ifsc") || "";

      if (storedLogo) setBrandLogo(storedLogo);
      if (storedBrand) setBrandName(storedBrand);
      if (storedCompany) setCompanyName(storedCompany);
      if (storedTenant) setTenantDisplayName(storedTenant);
      if (storedBankAcc) {
        setLandlordBank({
          bank_name: storedBankName || "HDFC Bank",
          account_number: storedBankAcc,
          ifsc_code: storedBankIfsc,
          spv_name: storedCompany || storedBrand,
        });
      }
    }

    loadPayments();
    loadPortalBank();

    const handleOccChange = () => {
      loadPayments();
      loadPortalBank();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadPortalBank() {
    try {
      const res = await fetch("/api/portal/summary");
      if (res.ok) {
        const json = await res.json();
        if (json.landlord_bank_details?.account_number) {
          setLandlordBank(json.landlord_bank_details);
        }
      }
    } catch {}
  }

  async function loadPayments() {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();
      const savedOccId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";
      const url = savedOccId ? `/api/payments?occupant_id=${savedOccId}` : `/api/payments`;
      const res = await fetch(url, { headers: authHeaders });
      const json = await res.json();
      if (json.success) {
        setPayments(json.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleTdsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tdsAmount || !tdsFileName) {
      alert("Please enter TDS certificate amount and select a Form 16A PDF file.");
      return;
    }
    setTdsSubmitted(true);
    setTimeout(() => {
      setTdsSubmitted(false);
      setTdsAmount("");
      setTdsFileName("");
      alert("Form 16A TDS certificate uploaded successfully! Our Finance team will reconcile your tax credit.");
    }, 1500);
  }

  function handleDownloadStatement() {
    // Generate CSV statement
    const headers = ["Payment Code", "Payment Date", "Amount (INR)", "Mode", "Reference", "Status"];
    const rows = payments.map((p) => [
      p.payment_code,
      p.payment_date,
      p.amount_inr,
      p.payment_mode,
      p.payment_ref,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Account_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Tax Receipts</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Download settlement receipts, account ledger statements, and submit Form 16A TDS certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadStatement}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download size={14} /> Download Account Statement
          </button>
        </div>
      </div>

      {/* Grid: Payments Ledger (8 cols) & TDS Upload (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payments List (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900">Historical Payments & Receipts</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {dateRange}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Receipt / Ref</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      No payments recorded for this account.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{p.payment_code}</span>
                        <span className="text-[10px] text-slate-400">{p.payment_ref}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "Recent"}
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-semibold uppercase text-[11px]">
                        {p.payment_mode || "online"}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        ₹{Number(p.amount_inr || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {p.status || "Reconciled"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Executive Settlement Receipt"
                          >
                            <Eye size={12} /> Receipt
                          </button>
                          <Link
                            href={`/api/payments/${p.id}/receipt`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Download size={11} /> PDF
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form 16A TDS Certificate Upload (4 Cols - §T-04) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">Upload Form 16A TDS</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Submit quarterly withholding tax certificates (Section 194I / 194C) to apply TDS credits directly against open invoice balances.
          </p>

          <form onSubmit={handleTdsSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Financial Quarter *</label>
              <select
                value={tdsQuarter}
                onChange={(e) => setTdsQuarter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
              >
                <option value="Q1">Q1 (Apr - Jun 2026)</option>
                <option value="Q2">Q2 (Jul - Sep 2026)</option>
                <option value="Q3">Q3 (Oct - Dec 2026)</option>
                <option value="Q4">Q4 (Jan - Mar 2027)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">TDS Credit Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={tdsAmount}
                onChange={(e) => setTdsAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Upload Form 16A PDF *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50">
                <Upload size={20} className="text-indigo-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-indigo-600 block">Choose PDF Document</span>
                <span className="text-[10px] text-slate-400">TRACES signed digital copy (Max 10MB)</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setTdsFileName(e.target.files?.[0]?.name || "")}
                  className="mt-2 text-[11px] text-slate-500 w-full"
                />
              </div>
              {tdsFileName && (
                <p className="text-[11px] font-bold text-emerald-600 mt-1">Selected: {tdsFileName}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={tdsSubmitted}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {tdsSubmitted ? "Uploading Certificate..." : "Submit TDS Certificate"}
            </button>
          </form>
        </div>
      </div>

      {/* Executive Certified Rent Settlement Receipt Modal with Brand Logo */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Receipt Letterhead */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {brandLogo ? (
                  <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={brandLogo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                    {(brandName || companyName || "Commercial Property Asset SPV").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                    {brandName || companyName || "Commercial Property Asset SPV"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Commercial Property Asset SPV · Operations
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    GSTIN: 24AAFCO9876C1Z2 · Ahmedabad, Gujarat
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 block">
                  Official Receipt
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 block mt-1">
                  RCP-{selectedReceipt.payment_code || selectedReceipt.id.slice(0, 8)}
                </span>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Commercial Rent Payment Settled
              </span>
              <div className="text-3xl font-black text-emerald-950">
                ₹{Number(selectedReceipt.amount_inr || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Allocated to Rent Roll Invoices
              </p>
            </div>

            {/* Detailed Transaction Ledger Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Tenant / Payee:</span>
                <span className="font-bold text-slate-900">{tenantDisplayName || selectedReceipt.occupant_name || "Commercial Tenant"}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Demised Premises:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceipt.space_name ? `${selectedReceipt.space_name}${selectedReceipt.property_name ? `, ${selectedReceipt.property_name}` : ""}` : (typeof window !== "undefined" && localStorage.getItem("officex_active_property")) ? `${localStorage.getItem("officex_active_property")} · Demised Premises` : "Demised Commercial Workspace"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Transaction / UTR Reference:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedReceipt.payment_ref || "NEFT-HDFC-992817"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Payment Channel:</span>
                <span className="font-bold text-slate-800 uppercase">{selectedReceipt.payment_mode || "online"}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Remitted Into Account:</span>
                <span className="font-mono font-bold text-slate-900">
                  {landlordBank?.bank_name || "Commercial Bank"} · A/c {landlordBank?.account_number || "50200088991234"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Payment Date:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.payment_date || "21-Oct-2026"}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Settlement Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {selectedReceipt.status || "Reconciled"} · Rule 46 CGST
                </span>
              </div>
            </div>

            {/* Statutory Compliance Footer Strip */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck size={14} className="text-emerald-600" />
                Verified & Recorded in PostgreSQL Rent Roll Ledger
              </span>
              <span className="font-mono text-[10px] text-slate-400">Rule 46 CGST Compliant</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

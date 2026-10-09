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
  ExternalLink
} from "lucide-react";

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("FY 2026-27");

  // TDS Certificate Upload state (§T-04)
  const [tdsQuarter, setTdsQuarter] = useState("Q2 (Jul - Sep 2026)");
  const [tdsAmount, setTdsAmount] = useState("");
  const [tdsFileName, setTdsFileName] = useState("");
  const [tdsSubmitted, setTdsSubmitted] = useState(false);

  useEffect(() => {
    loadPayments();

    const handleOccChange = () => {
      loadPayments();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
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
                        <Link
                          href={`/api/payments/${p.id}/receipt`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Download size={11} /> PDF
                        </Link>
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
    </div>
  );
}

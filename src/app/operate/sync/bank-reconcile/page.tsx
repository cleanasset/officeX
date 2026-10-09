"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Search,
  Filter,
  Check
} from "lucide-react";

export default function BankReconcilerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/bank-reconcile");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAllocations = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/sync/bank-reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement_type: "mt940" }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("All bank credits verified against open invoices and allocated permanently per Formula F-12.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                RR-INT-02
              </span>
              <span className="text-xs text-slate-500 font-mono">Automated Bank Settlement Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Landmark className="text-[#0D7B6C]" size={26} />
              Bank Statement Reconciler &amp; MT940 Parser
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload bank statement CSV or SWIFT MT940 files, parse UTR references, and auto-allocate occupant payments (Formula F-12).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmAllocations}
              disabled={confirming}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle size={16} /> Confirm &amp; Post Allocations
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Reconciling bank statement transactions...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Bank Credits</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{(data.total_credits_inr / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{data.total_transactions} cleared deposits</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Auto-Matched Amount</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{(data.auto_matched_amount_inr / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">Matched to active invoices</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Unallocated / Arrears</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{(data.unmatched_amount_inr / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Zero suspense items</div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 shadow-sm">
                <div className="text-xs font-bold text-emerald-800 uppercase">Match Efficiency</div>
                <div className="text-2xl font-extrabold text-[#0D7B6C] mt-1">
                  {data.reconciliation_efficiency_pct}%
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">Exact UTR alignment</div>
              </div>
            </div>

            {/* Account Header Card */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-bold">
                  <Landmark size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{data.bank_name}</span>
                  <span className="text-slate-500">Statement Period: {data.statement_period} • Batch ID: {data.statement_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                  MT940 / CSV PARSED
                </span>
              </div>
            </div>

            {/* Transactions Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Cleared Inflow Credits &amp; Matched Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Bank Narration / Raw Text</th>
                      <th className="py-2.5 px-3">UTR Reference</th>
                      <th className="py-2.5 px-3 text-right">Credit Amount</th>
                      <th className="py-2.5 px-3">Matched Invoice</th>
                      <th className="py-2.5 px-3">Occupant</th>
                      <th className="py-2.5 px-3 text-center">Confidence</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-mono text-slate-600">{t.date}</td>
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate" title={t.narration}>
                          {t.narration}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-bold">{t.utr_number}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                          ₹{t.credit_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0D7B6C]">{t.matched_invoice}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{t.occupant_name}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {t.match_confidence}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

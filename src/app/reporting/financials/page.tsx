"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, BarChart3, TrendingUp, ShieldCheck, ArrowUpRight, RefreshCw } from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function FinancialAnalytics() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalGTV: 0,
    totalOfficeXFee: 0,
    totalDisbursed: 0,
    totalHoldback: 0,
    transactionsCount: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commissions", {
        headers: getClientAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || {
          totalGTV: 0,
          totalOfficeXFee: 0,
          totalDisbursed: 0,
          totalHoldback: 0,
          transactionsCount: 0,
        });
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error("Failed to load commissions analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const takeRate = summary.totalGTV > 0 
    ? ((summary.totalOfficeXFee / summary.totalGTV) * 100).toFixed(2) 
    : "0.00";

  const stats = [
    {
      id: 1,
      label: "Gross Transaction Volume (GTV)",
      value: `₹${summary.totalGTV.toLocaleString("en-IN")}`,
      change: `${summary.transactionsCount} transaction${summary.transactionsCount === 1 ? "" : "s"} logged`,
      subtext: "Across settled marketplace contracts",
    },
    {
      id: 2,
      label: "OfficeX Platform Take-Rate",
      value: `₹${summary.totalOfficeXFee.toLocaleString("en-IN")}`,
      change: `${takeRate}% weighted average`,
      subtext: "5–15% category auto-engine",
    },
    {
      id: 3,
      label: "Vendor Net Disbursed",
      value: `₹${summary.totalDisbursed.toLocaleString("en-IN")}`,
      change: "Direct Payout Ledger",
      subtext: "Settled directly via Razorpay Escrow",
    },
    {
      id: 4,
      label: "Defect Liability Retention",
      value: `₹${summary.totalHoldback.toLocaleString("en-IN")}`,
      change: "Protected in Escrow",
      subtext: "30-day post-completion warranty",
    },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">FM Marketplace Financial Analytics</h1>
          <p className="text-xs text-gray-600 font-bold mt-1">
            Audit platform commission revenues, escrow turnover, and vendor settlement ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFinancials}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Razorpay Escrow Reconciled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => (
          <div key={st.id} className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{st.label}</span>
              <span className="text-2xl font-black text-gray-900 block mt-2">{st.value}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-bold">{st.change}</span>
              <span className="text-[9px] text-gray-400 font-medium">{st.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Settled Marketplace Transactions</h2>
          <span className="text-xs text-gray-500 font-medium">
            {transactions.length} record{transactions.length === 1 ? "" : "s"}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            <BarChart3 className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="font-semibold text-gray-700">No marketplace transactions yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Settlements generated through marketplace work orders and broker deals will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Entity / Vendor</th>
                  <th className="py-2.5">Deal Value</th>
                  <th className="py-2.5">Take Rate</th>
                  <th className="py-2.5">Disbursed</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 font-mono text-gray-700">{tx.id}</td>
                    <td className="py-3 font-semibold text-gray-900">{tx.clientOrEntity || tx.vendorName}</td>
                    <td className="py-3 font-mono">₹{Number(tx.dealValue || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 font-mono text-emerald-600">₹{Number(tx.officeXFee || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 font-mono">₹{Number(tx.payoutToVendorOrBroker || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

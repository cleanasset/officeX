"use client";
import React, { useState } from "react";
import { DollarSign, BarChart3, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function FinancialAnalytics() {
  const [stats] = useState([
    {
      id: 1,
      label: "Gross Transaction Volume (GTV)",
      value: "₹41,70,000",
      change: "+14.2% vs last month",
      subtext: "Across 5 settled vendor contracts"
    },
    {
      id: 2,
      label: "OfficeX Platform Take-Rate",
      value: "₹3,61,100",
      change: "8.65% weighted average",
      subtext: "5–15% category auto-engine"
    },
    {
      id: 3,
      label: "Vendor Net Disbursed",
      value: "₹38,08,900",
      change: "100% On-Time Wire",
      subtext: "Settled directly via Razorpay Escrow"
    },
    {
      id: 4,
      label: "Defect Liability Retention",
      value: "₹2,46,400",
      change: "Protected in Escrow",
      subtext: "30-day post-completion warranty"
    }
  ]);

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
    </div>
  );
}

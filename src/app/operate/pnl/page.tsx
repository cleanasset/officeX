"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  TrendingDown,
  PieChart,
} from "lucide-react";

export default function PropertyPnlPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("Oct-2026");

  const fetchPnl = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pnl?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load P&L:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPnl();
  }, [period]);

  const rev = data?.revenue;
  const opex = data?.operating_expenses;
  const f19 = data?.formula_f19;
  const trends = data?.monthly_trend_12m || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-28 md:pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Screen S-52 &middot; Property P&L
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Formula F-19 Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Property Profit &amp; Loss (NOI Statement)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contracted rental income + CAM recoveries vs. direct operating costs computing Net Operating Income (NOI) and Operating Margin %.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="Oct-2026">Oct-2026 (Current)</option>
              <option value="Sep-2026">Sep-2026</option>
              <option value="Aug-2026">Aug-2026</option>
            </select>
          </div>

          <button
            onClick={fetchPnl}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh P&L"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Revenue
          </span>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            ₹{(rev?.total_revenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Base rent + CAM + recoveries
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Operating Costs (OPEX)
          </span>
          <div className="text-lg sm:text-2xl font-black text-rose-600">
            ₹{(opex?.total_operating_expenses || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            FM, power, security &amp; taxes
          </div>
        </div>

        {/* Formula F-19: Net Operating Income (NOI) */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Formula F-19 NOI
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400">
              Rev &minus; Opex
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            ₹{(f19?.net_operating_income_inr || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Net asset cashflow
          </div>
        </div>

        {/* Operating Margin % */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Operating Margin
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800">
              Target &ge; 60%
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-700">
            {f19?.noi_margin_pct ?? 0}%
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Commercial margin
          </div>
        </div>
      </div>

      {/* Two Column Layout: Revenue Breakdown vs Operating Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Statement Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Property Revenue Inflow (§RR-ANL-07)
            </h3>
            <span className="text-xs font-bold text-blue-600">
              ₹{(rev?.total_revenue || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <div>
                <div className="font-bold text-slate-800">Contracted Base Rent</div>
                <div className="text-slate-400 text-[10px]">Office suites & retail area leasing (SAC 997212)</div>
              </div>
              <span className="font-mono font-bold text-slate-900">
                ₹{(rev?.contracted_base_rent || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <div>
                <div className="font-bold text-slate-800">CAM Recoveries</div>
                <div className="text-slate-400 text-[10px]">Area-weighted provisional maintenance billing</div>
              </div>
              <span className="font-mono font-bold text-slate-900">
                ₹{(rev?.cam_recoveries || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <div>
                <div className="font-bold text-slate-800">Metered Utility Recoveries</div>
                <div className="text-slate-400 text-[10px]">Electricity sub-meter kWh and water kL billing</div>
              </div>
              <span className="font-mono font-bold text-slate-900">
                ₹{(rev?.metered_utility_recoveries || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-bold text-slate-800">Car Parking & Misc Recoveries</div>
                <div className="text-slate-400 text-[10px]">Designated basement stilt parking slots</div>
              </div>
              <span className="font-mono font-bold text-slate-900">
                ₹{(rev?.car_parking_and_other || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Operating Costs Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Direct Operating Costs (OPEX)
            </h3>
            <span className="text-xs font-bold text-rose-600">
              ₹{(opex?.total_operating_expenses || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {opex?.categories?.map((cat: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <div>
                  <span className="font-semibold text-slate-800">{cat.category}</span>
                  <span className="ml-2 font-mono text-[10px] text-slate-400">{cat.code}</span>
                </div>
                <span className="font-mono font-bold text-slate-700">
                  ₹{cat.amount?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12-Month Historical & Trend Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            12-Month Historical NOI & Margin Trend
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">OPEX (₹)</th>
                <th className="py-3 px-4 text-right">NOI (₹)</th>
                <th className="py-3 px-4 text-right">NOI Margin %</th>
                <th className="py-3 px-4">Benchmark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trends.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No historical revenue or expense transactions recorded yet.
                  </td>
                </tr>
              ) : (
                trends.map((t: any, idx: number) => {
                  const revVal = t.revenue || 0;
                  const marginNum = revVal > 0 ? ((t.noi / revVal) * 100) : 0;
                  const margin = marginNum.toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {t.month}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 font-mono">
                        ₹{(t.revenue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-700 font-mono">
                        ₹{(t.opex || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹{(t.noi || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                        {margin}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          marginNum >= 60 ? 'bg-emerald-100 text-emerald-800' :
                          marginNum >= 40 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {marginNum >= 60 ? 'Prime (≥ 60%)' : marginNum >= 40 ? 'Healthy' : 'Below Par'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Clock,
  PieChart,
} from "lucide-react";

export default function RevenueForecastPage() {
  const [renewalPct, setRenewalPct] = useState(70);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forecast?renewal_pct=${renewalPct}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch forecast:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [renewalPct]);

  const timeline = data?.monthly_timeline || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Screen S-51 &middot; Revenue Forecast
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Formula F-24 / D-24
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            12-Month Revenue Forecast & Run-Rate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic timeline factoring in contracted rents, scheduled rent steps (D-21), renewal probability assumptions, and pipeline deals (D-22).
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="hidden sm:inline">Renewal Assumption:</span>
            <span className="sm:hidden">Renewal:</span>
            <select
              value={renewalPct}
              onChange={(e) => setRenewalPct(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="50">50% Extension</option>
              <option value="70">70% Standard Extension</option>
              <option value="85">85% Optimistic</option>
              <option value="100">100% Full Retention</option>
            </select>
          </div>

          <button
            onClick={fetchForecast}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* K-15 Forecast Total */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              K-15 12-Month Total
            </span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            ₹{(data?.k15_twelve_month_forecast_total_inr || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Oct-2026 to Sep-2027 run-rate
          </div>
        </div>

        {/* Average Monthly Run Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Monthly Run-Rate
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{(data?.average_monthly_run_rate_inr || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Normalized monthly cash inflow
          </div>
        </div>

        {/* Contracted Share */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contracted Certainty
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            {data?.contracted_share_pct || 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Deterministic under locked leases
          </div>
        </div>

        {/* Pipeline Upside */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pipeline Upside (D-22)
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            ₹{(data?.pipeline_upside_inr || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Probability-weighted deals
          </div>
        </div>
      </div>

      {/* Visual Forecast Stacked Bar Presentation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            12-Month Layered Revenue Progression (Oct-2026 &mdash; Sep-2027)
          </h3>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" />
              <span className="text-slate-600">Contracted Rent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span className="text-slate-600">Scheduled Steps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-slate-600">Projected Renewals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-slate-600">Weighted Pipeline</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-12 gap-2 pt-4 border-t border-slate-100 min-w-[500px]">
            {timeline.map((m: any, i: number) => {
              const maxRev = 13000000;
              const hPct = maxRev > 0 ? Math.min(100, Math.round((m.total_projected_revenue / maxRev) * 100)) : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    ₹{(m.total_projected_revenue / 100000).toFixed(1)}L
                  </div>
                  <div className="w-full bg-slate-100 rounded-lg h-36 sm:h-48 flex flex-col justify-end p-1">
                    <div
                      style={{ height: `${hPct}%` }}
                      className="w-full rounded-md bg-gradient-to-t from-blue-600 via-indigo-500 to-amber-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {m.month.split("-")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Month-by-Month Forecast Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Month-by-Month Revenue Projection Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Contracted Base Rent (₹)</th>
                <th className="py-3 px-4 text-right">Scheduled Escalations (₹)</th>
                <th className="py-3 px-4 text-right">Renewals ({renewalPct}%) (₹)</th>
                <th className="py-3 px-4 text-right">Pipeline Deals (₹)</th>
                <th className="py-3 px-4 text-right font-bold">Total Monthly Projected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeline.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No forecast data available. Add contracts or pipeline deals to project revenue.
                  </td>
                </tr>
              ) : (
                timeline.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {m.month}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      ₹{(m.contracted_rent || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-700 font-mono">
                      +₹{(m.scheduled_escalations || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-mono">
                      ₹{(m.renewals_projected || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-700 font-mono">
                      ₹{(m.pipeline_weighted || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{(m.total_projected_revenue || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

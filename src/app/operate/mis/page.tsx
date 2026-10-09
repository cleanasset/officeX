"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  PieChart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function MonthlyMisPage() {
  const [activeSheet, setActiveSheet] = useState<
    "summary" | "rent_roll" | "aging" | "rollover" | "concentration"
  >("summary");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("Oct-2026");

  const fetchMisData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mis/export?format=json&period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.sheets);
      }
    } catch (e) {
      console.error("Failed to load MIS data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisData();
  }, [period]);

  const summary = data?.executive_summary;
  const rentRoll = data?.verified_rent_roll || [];
  const aging = data?.aging_schedule_4_bucket || [];
  const rollover = data?.rollover_schedule || [];
  const concentration = data?.top_10_tenant_concentration || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Screen S-54 &middot; Monthly MIS
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Multi-Sheet Investor Pack
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly MIS & Institutional Investor Pack
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audited 5-sheet reporting workbook: Executive Summary, Rent Roll, 4-Bucket Aging, Rollover Schedule, and Top-10 Concentration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/api/mis/export?format=csv&period=${period}`}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Workbook (.CSV / Excel)
          </a>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2 border border-slate-200"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>

          <button
            onClick={fetchMisData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh MIS Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Multi-Sheet Workbook Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveSheet("summary")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSheet === "summary"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" /> Sheet 1: Executive Summary
        </button>

        <button
          onClick={() => setActiveSheet("rent_roll")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSheet === "rent_roll"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Sheet 2: Verified Rent Roll ({rentRoll.length})
        </button>

        <button
          onClick={() => setActiveSheet("aging")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSheet === "aging"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Sheet 3: 4-Bucket Aging ({aging.length})
        </button>

        <button
          onClick={() => setActiveSheet("rollover")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSheet === "rollover"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" /> Sheet 4: Rollover Schedule ({rollover.length})
        </button>

        <button
          onClick={() => setActiveSheet("concentration")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSheet === "concentration"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PieChart className="w-4 h-4" /> Sheet 5: Top-10 Concentration
        </button>
      </div>

      {/* SHEET 1: EXECUTIVE SUMMARY */}
      {activeSheet === "summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Economic Occupancy %
              </span>
              <div className="text-2xl font-black text-slate-900">
                {summary?.economic_occupancy_pct || "89.5%"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Physical: {summary?.physical_occupancy_pct || "91.2%"}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                WALE / WALT
              </span>
              <div className="text-2xl font-black text-indigo-600">
                {summary?.weighted_average_lease_expiry_years || 4.2} Years
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Weighted average lease expiry
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Collections Efficiency %
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {summary?.collections_efficiency_pct || "96.4%"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                30-day collection velocity
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Net Operating Income (NOI)
              </span>
              <div className="text-2xl font-black text-white">
                ₹{(summary?.net_operating_income_monthly_inr || 8093088).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                NOI Margin: {summary?.noi_margin_pct || "76.0%"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Portfolio Executive Profile & Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Portfolio Asset Name:</span>
                <span className="font-bold text-slate-900 text-sm">{summary?.portfolio_name || "Cyber Greens Commercial Complex"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Total Leasable Area:</span>
                <span className="font-bold text-slate-900 text-sm">{(summary?.total_chargeable_area_sqft || 110000).toLocaleString("en-IN")} sq ft</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Data Quality Score (K-23):</span>
                <span className="font-bold text-emerald-700 text-sm">{summary?.k23_data_quality_score || "98.8%"} (Passed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHEET 2: VERIFIED RENT ROLL */}
      {activeSheet === "rent_roll" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Verified Rent Roll Register &middot; Active Leases
            </h3>
            <span className="text-xs text-slate-500">
              {rentRoll.length} Demised Units
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3">Contract #</th>
                  <th className="py-3 px-3">Tenant Name</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3 text-right">Area (sqft)</th>
                  <th className="py-3 px-3 text-right">Base PSF (₹)</th>
                  <th className="py-3 px-3 text-right">Monthly Rent (₹)</th>
                  <th className="py-3 px-3 text-right">CAM (₹)</th>
                  <th className="py-3 px-3 text-right">Deposit Held (₹)</th>
                  <th className="py-3 px-3">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentRoll.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{r.contract_code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{r.tenant_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{r.demised_unit}</td>
                    <td className="py-3 px-3 text-right font-mono">{r.chargeable_area_sqft?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-right font-mono">₹{r.base_rent_rate_psf}</td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">₹{r.monthly_base_rent?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">₹{r.monthly_cam_charges?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">₹{r.security_deposit_held?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-slate-500">{r.lease_expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 3: 4-BUCKET AGING */}
      {activeSheet === "aging" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              4-Bucket Accounts Receivable Aging Schedule (§S-45)
            </h3>
            <span className="text-xs font-bold text-amber-700">
              Dunning Cadence Active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Tenant Legal Name</th>
                  <th className="py-3 px-4 text-right">Total Outstanding (₹)</th>
                  <th className="py-3 px-4 text-right">0–30 Days (Current)</th>
                  <th className="py-3 px-4 text-right">31–60 Days</th>
                  <th className="py-3 px-4 text-right">61–90 Days</th>
                  <th className="py-3 px-4 text-right">90+ Days</th>
                  <th className="py-3 px-4">Recovery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aging.map((a: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.tenant_name}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">₹{a.total_outstanding?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-700 font-mono">₹{a.current_0_30_days?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-mono">₹{a.overdue_31_60_days?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-orange-700 font-mono">₹{a.overdue_61_90_days?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-rose-700 font-mono">₹{a.overdue_90_plus_days?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 4: ROLLOVER SCHEDULE */}
      {activeSheet === "rollover" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Lease Expiry & Rollover Schedule (§S-24)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Financial Year</th>
                  <th className="py-3 px-4 text-right">Contracts Expiring</th>
                  <th className="py-3 px-4 text-right">Area Expiring (sqft)</th>
                  <th className="py-3 px-4 text-right">Portfolio Share %</th>
                  <th className="py-3 px-4 text-right">Annual Rent at Risk (₹)</th>
                  <th className="py-3 px-4">Tenure Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rollover.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.financial_year}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{r.contracts_expiring}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{r.area_expiring_sqft?.toLocaleString("en-IN")} sqft</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">{r.pct_of_portfolio}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700">₹{r.annual_rent_at_risk_inr?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 5: TOP-10 CONCENTRATION */}
      {activeSheet === "concentration" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Top-10 Tenant Concentration Risk Analysis
            </h3>
            <span className="text-xs text-slate-500">
              Counterparty Concentration Limits
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Tenant Legal Entity</th>
                  <th className="py-3 px-4 text-right">Leased Area (sqft)</th>
                  <th className="py-3 px-4 text-right">Area Share %</th>
                  <th className="py-3 px-4 text-right">Monthly Rent (₹)</th>
                  <th className="py-3 px-4 text-right">Revenue Share %</th>
                  <th className="py-3 px-4">Counterparty Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {concentration.map((c: any) => (
                  <tr key={c.rank} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{c.rank}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.tenant_name}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{c.leased_area_sqft?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">{c.area_concentration_pct}</td>
                    <td className="py-3.5 px-4 text-right font-mono">₹{c.monthly_rent_inr?.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700">{c.revenue_concentration_pct}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c.counterparty_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

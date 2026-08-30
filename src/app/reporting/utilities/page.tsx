"use client";
import React, { useState } from "react";
import { Download, Calendar, Zap, Droplet, Clock, DollarSign } from "lucide-react";

export default function EnergyAndUtilityDashboard() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  const kpis = [
    { label: "Electricity", value: "45,200", unit: "kWh", change: "↓ 2.4% vs last mo", icon: <Zap size={16} className="text-blue-500" />, iconBg: "bg-blue-50" },
    { label: "Water", value: "850", unit: "KL", change: "↓ 0.8% vs last mo", icon: <Droplet size={16} className="text-teal-500" />, iconBg: "bg-teal-50" },
    { label: "DG Runtime", value: "42", unit: "hrs", change: "↑ 12% vs last mo", icon: <Clock size={16} className="text-amber-500" />, iconBg: "bg-amber-50" },
    { label: "Total Utility Cost", value: "₹6,80,000", unit: "", change: "Budget: ₹7,00,000", icon: <DollarSign size={16} className="text-emerald-500" />, iconBg: "bg-emerald-50" }
  ];

  const tenantShares = [
    { tenant: "TCS", share: 38, amount: "₹2,58,400", trend: "down" },
    { tenant: "Wipro", share: 22, amount: "₹1,49,600", trend: "up" },
    { tenant: "Infosys", share: 18, amount: "₹1,22,400", trend: "neutral" },
    { tenant: "Vacant / CAM", share: 22, amount: "₹1,49,600", trend: "neutral" }
  ];

  const meterReadings = [
    { id: "EM-01-TCS", category: "Power", reading: "12450.5", cons: "850", status: "Active" },
    { id: "EM-02-WIP", category: "Power", reading: "8920.0", cons: "420", status: "Active" },
    { id: "WM-Main-01", category: "Water", reading: "5420.0", cons: "110", status: "Active" },
    { id: "DG-01-Fuel", category: "Fuel", reading: "850.0", cons: "--", status: "Fault", isFault: true },
    { id: "EM-03-INF", category: "Power", reading: "6710.2", cons: "315", status: "Active" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Energy & Utility</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor consumption, costs, and efficiency across the portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
          <button className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
              <div className={`w-7 h-7 rounded-lg ${k.iconBg} flex items-center justify-center`}>
                {k.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {k.value} <span className="text-xs font-normal text-gray-500">{k.unit}</span>
              </p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">{k.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row: Energy Performance Index + Utility Cost Trend */}
      <div className="grid grid-cols-[340px_1fr] gap-6">
        {/* Energy Performance Index (Gauge) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-between text-center">
          <h2 className="text-sm font-bold text-gray-900 w-full text-left">Energy Performance Index</h2>

          <div className="relative w-40 h-40 my-3">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0F8B7D" strokeWidth="3.2" strokeDasharray="65, 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-900">18.4</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">kWh/sqft/yr</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">vs 20.0 industry avg</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ↘ 8% more efficient
            </span>
          </div>
        </div>

        {/* Utility Cost Trend (Stacked Bar) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Utility Cost Trend</h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Power</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Water</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Fuel</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-6 items-end">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {[
                { m: "Jan", p: 50, w: 20, f: 15 },
                { m: "Feb", p: 55, w: 18, f: 20 },
                { m: "Mar", p: 68, w: 22, f: 22 },
                { m: "Apr", p: 62, w: 20, f: 18 },
                { m: "May", p: 74, w: 25, f: 20 },
                { m: "Jun", p: 90, w: 28, f: 26 }
              ].map((bar) => (
                <div key={bar.m} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: "130px" }}>
                    <div className="w-full bg-amber-500" style={{ height: `${bar.f}px` }} />
                    <div className="w-full bg-cyan-400" style={{ height: `${bar.w}px` }} />
                    <div className="w-full bg-blue-600" style={{ height: `${bar.p}px` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{bar.m}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 mb-6">
              <span className="text-3xl font-black text-gray-900">72%</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Power Share</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Tenant Cost Allocation + Active Meter Readings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tenant Cost Allocation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Tenant Cost Allocation</h2>
            <span className="text-gray-400 text-xs">•••</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5">TENANT</th>
                <th className="py-2.5">SHARE (%)</th>
                <th className="py-2.5">EST. AMOUNT</th>
                <th className="py-2.5 text-right">TREND</th>
              </tr>
            </thead>
            <tbody>
              {tenantShares.map((t) => (
                <tr key={t.tenant} className="border-b border-gray-100 text-xs">
                  <td className="py-3 font-semibold text-gray-900">{t.tenant}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700 w-7">{t.share}%</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${t.share * 2}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">{t.amount}</td>
                  <td className="py-3 text-right">
                    {t.trend === "down" && <span className="text-emerald-500 font-bold">↓</span>}
                    {t.trend === "up" && <span className="text-red-500 font-bold">↑</span>}
                    {t.trend === "neutral" && <span className="text-gray-400 font-bold">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active Meter Readings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Active Meter Readings</h2>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5">METER ID</th>
                <th className="py-2.5">CATEGORY</th>
                <th className="py-2.5">READING</th>
                <th className="py-2.5">CONS.</th>
                <th className="py-2.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {meterReadings.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 text-xs">
                  <td className="py-3 font-mono font-semibold text-gray-800">{m.id}</td>
                  <td className="py-3 text-gray-600">{m.category}</td>
                  <td className="py-3 font-mono text-gray-700">{m.reading}</td>
                  <td className="py-3 font-semibold text-gray-900">{m.cons}</td>
                  <td className="py-3 text-right">
                    {m.isFault ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                        Fault
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

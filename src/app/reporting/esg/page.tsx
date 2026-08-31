"use client";
import React from "react";
import { Download, Calendar, Filter, Info, ArrowUpRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ESGSustainabilityBoard() {
  const initiatives = [
    {
      icon: "🌱",
      title: "45kW Solar Plant Installation",
      desc: "Expected to reduce grid dependency by 15%.",
      status: "ACTIVE",
      statusColor: "bg-blue-50 text-blue-700"
    },
    {
      icon: "💧",
      title: "12L Rainwater Harvesting Capacity",
      desc: "Phase 2 pit expansion currently underway.",
      status: "ACTIVE",
      statusColor: "bg-blue-50 text-blue-700"
    },
    {
      icon: "💡",
      title: "100% LED Retrofit",
      desc: "Facility-wide replacement completed.",
      status: "COMPLETED",
      statusColor: "bg-emerald-50 text-emerald-700"
    },
    {
      icon: "♻️",
      title: "E-waste Vendor Certification",
      desc: "Onboarding certified vendor for IT hardware.",
      status: "ACTIVE",
      statusColor: "bg-blue-50 text-blue-700"
    }
  ];

  const complianceLedger = [
    { type: "Fire NOC", authority: "CFO", expiry: "12 Dec 2024", status: "valid", icon: "check" },
    { type: "Consent to Operate (Air/Water)", authority: "MPCB", expiry: "05 Aug 2024", status: "valid", icon: "check" },
    { type: "Hazardous Waste Auth.", authority: "CPCB", expiry: "10 Oct 2023", status: "expired", isAlert: true, icon: "cross" },
    { type: "Lifts & Escalators License", authority: "PWD", expiry: "22 Mar 2025", status: "valid", icon: "check" },
    { type: "DG Set Approval", authority: "Electrical Inspector", expiry: "14 Jun 2024", status: "warning", icon: "warn" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">ESG &amp; Sustainability Board</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time tracking of Environmental, Social, and Governance metrics.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 bg-white">
            <Calendar size={13} /> Q3 2023
          </button>
          <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 bg-white">
            <Filter size={13} /> Filters
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Download size={13} /> Export All
          </button>
        </div>
      </div>

      {/* Top Metric Cards: Overall ESG Score + Resource Intensity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 w-full">
        {/* Overall ESG Score Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Overall ESG Score</h2>
            <Info size={16} className="text-gray-400" />
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0F8B7D" strokeWidth="3" strokeDasharray="72, 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">72</span>
                <span className="text-xs text-gray-400 font-semibold">/ 100</span>
              </div>
            </div>
            <span className="mt-2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ↗ +3 pts from Q2
            </span>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Environmental
              </span>
              <span className="font-bold text-gray-900">75</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Social
              </span>
              <span className="font-bold text-gray-900">68</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Governance
              </span>
              <span className="font-bold text-gray-900">73</span>
            </div>
          </div>
        </div>

        {/* Resource Intensity & Emissions Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>💨</span> Resource Intensity & Emissions
            </h2>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
              View Details <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Carbon */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase">CARBON</p>
              <div className="my-2">
                <span className="text-2xl font-black text-gray-900">420</span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">tCO2e</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "65%" }} />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">-5% vs target</span>
            </div>

            {/* Energy Intensity */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase">ENERGY INTENSITY</p>
              <div className="my-2">
                <span className="text-2xl font-black text-gray-900">18.4</span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">EPI</span>
              </div>
              <div className="flex items-end gap-1 h-6 mb-1">
                {[4, 6, 8, 10, 7, 5].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#0F8B7D] rounded-t" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-semibold text-right">Last 6 mo</span>
            </div>

            {/* Water Intensity */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase">WATER INTENSITY</p>
              <div className="my-2">
                <span className="text-2xl font-black text-gray-900">2.1</span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">KL/sqft</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45%" }} />
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">Steady</span>
            </div>

            {/* Waste Diversion */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase">WASTE DIVERSION</p>
              <div className="my-2">
                <span className="text-2xl font-black text-gray-900">85</span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">%</span>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <span className="w-4 h-4 rounded-full border-2 border-amber-500 inline-block" />
                <span className="text-[10px] text-gray-500 font-semibold">Target: 90%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Initiatives + Statutory Compliance */}
      <div className="grid grid-cols-2 gap-6">
        {/* Active Initiatives */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="text-emerald-500">🍃</span> Active Initiatives
            </h2>
            <span className="text-gray-400 text-xs">•••</span>
          </div>

          <div className="space-y-3">
            {initiatives.map((init) => (
              <div key={init.title} className="p-3.5 border border-gray-100 rounded-xl flex items-start gap-3 bg-gray-50/30">
                <span className="text-xl">{init.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">{init.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${init.statusColor}`}>
                      {init.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{init.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Compliance Ledger */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>⚖️</span> Statutory Compliance
            </h2>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              View Ledger
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5">LICENSE TYPE</th>
                <th className="py-2.5">AUTHORITY</th>
                <th className="py-2.5">EXPIRY</th>
                <th className="py-2.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {complianceLedger.map((c) => (
                <tr key={c.type} className={`border-b border-gray-100 text-xs ${c.isAlert ? "bg-red-50/50" : ""}`}>
                  <td className={`py-3 font-semibold ${c.isAlert ? "text-red-600 font-bold" : "text-gray-800"}`}>
                    {c.type}
                  </td>
                  <td className="py-3 text-gray-500">{c.authority}</td>
                  <td className={`py-3 ${c.isAlert ? "text-red-600 font-bold" : "text-gray-600"}`}>
                    {c.expiry}
                  </td>
                  <td className="py-3 text-right">
                    {c.icon === "check" && (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center text-xs">✓</span>
                    )}
                    {c.icon === "cross" && (
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center text-xs">✕</span>
                    )}
                    {c.icon === "warn" && (
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center text-xs">⚠</span>
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

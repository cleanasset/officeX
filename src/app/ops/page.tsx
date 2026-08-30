"use client";
import React, { useState } from "react";
import { AlertTriangle, Clock, Zap, Users, ShieldAlert, CheckCircle, Check, AlertCircle, Sparkles, Activity, HeartPulse } from "lucide-react";

export default function OperationsDashboard() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const workplaceHealthDimensions = [
    { label: "Facility Infrastructure", score: 94, bar: 94, status: "Optimal" },
    { label: "Asset Uptime & Telemetry", score: 97, bar: 97, status: "Optimal" },
    { label: "SLA Response & Resolution", score: 96, bar: 96, status: "Optimal" },
    { label: "Workplace Cleanliness", score: 94, bar: 94, status: "Optimal" },
    { label: "HVAC Thermal & Air Comfort", score: 92, bar: 92, status: "Good" },
    { label: "Energy & Resource Efficiency", score: 87, bar: 87, status: "At Risk" },
    { label: "Occupier Experience (CSAT)", score: 91, bar: 91, status: "Optimal" }
  ];

  const kpis = [
    { label: "Open Helpdesk Tickets", value: "18", sub: "△ 2 Critical Dispatched", subColor: "text-red-500", icon: "🎫" },
    { label: "PPM Tasks Today", value: "6 / 6", sub: "✅ 100% On Schedule", subColor: "text-emerald-600", icon: "📋" },
    { label: "Statutory Compliance", value: "96.4%", sub: "18 Active / 0 Breached", subColor: "text-teal-700", icon: "🛡️" },
    { label: "FM Staff Deployed", value: "42/48", sub: "👥 87.5% Shift Strength", subColor: "text-emerald-600", icon: "👥" },
    { label: "Average SLA Resolution", value: "48 mins", sub: "Target: < 2 Hours", subColor: "text-emerald-600", icon: "⚡" }
  ];

  const dispatches = [
    { severity: "CRITICAL", color: "bg-red-500", remaining: "38 mins remaining", title: "Server Room A AC Condenser Leak", location: "Apex BKC • Floor 3", action: "Dispatch Senior Tech" },
    { severity: "HIGH", color: "bg-amber-500", remaining: "1h 15m remaining", title: "Passenger Lift #3 Destination Dispatch Error", location: "Apex BKC • Lobby", action: "Dispatch Schindler OEM" }
  ];

  const healthData = [
    { name: "Apex BKC Mumbai", health: "94/100 (Optimal)", hvac: "✅ 99.8%", electrical: "✅ 100%", elevators: "⚠️ Lift 3", fire: "✅ Valid", staff: "18/20" },
    { name: "Meridian Whitefield", health: "89/100 (Good)", hvac: "⚠️ Chiller 1", electrical: "✅ 100%", elevators: "✅ 100%", fire: "✅ Valid", staff: "12/12" },
    { name: "Nexus Hub Gurugram", health: "96/100 (Optimal)", hvac: "✅ 100%", electrical: "✅ 100%", elevators: "✅ 100%", fire: "✅ Valid", staff: "15/16" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">FM Command Centre</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time facility operations, asset uptime, SLA escalations & Workplace Health monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold text-xs border border-teal-100 flex items-center gap-1.5">
            <Activity size={13} /> Live Campus Telemetry Active
          </span>
        </div>
      </div>

      {/* Top Hero: Proprietary Workplace Health Score (91/100) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-[300px_1fr] gap-8 items-center">
          {/* Health Score Gauge */}
          <div className="border-r border-gray-100 pr-8 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse size={14} className="text-teal-600" /> OFFICEX WORKPLACE HEALTH SCORE
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-gray-900">91</span>
              <span className="text-sm font-bold text-gray-400">/ 100</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 w-fit mt-2">
              Optimal Operational Condition
            </span>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Composite index across facility uptime, cleaning outcomes, air comfort, and SLA adherence.
            </p>
          </div>

          {/* 7 Supporting Dimensions */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            {workplaceHealthDimensions.map((dim) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700">{dim.label}</span>
                  <span className="font-bold text-gray-900">{dim.score} / 100</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.score >= 90 ? "bg-[#0F8B7D]" : "bg-amber-500"
                    }`}
                    style={{ width: `${dim.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">{k.label}</p>
              <span>{k.icon}</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{k.value}</p>
            <p className={`text-[10px] font-bold ${k.subColor}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Dispatches & Multi-System Building Health Grid */}
      <div className="grid grid-cols-[1fr_400px] gap-6">
        {/* Multi-System Building Health Grid */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Portfolio Building Operational Grid</h2>
            <span className="text-xs text-gray-400">3 Managed Properties</span>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">PROPERTY</th>
                  <th className="py-3 px-4">HEALTH</th>
                  <th className="py-3 px-4">HVAC</th>
                  <th className="py-3 px-4">POWER</th>
                  <th className="py-3 px-4">LIFTS</th>
                  <th className="py-3 px-4">STAFF</th>
                </tr>
              </thead>
              <tbody>
                {healthData.map((h) => (
                  <tr key={h.name} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{h.name}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{h.health}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">{h.hvac}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">{h.electrical}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">{h.elevators}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{h.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Dispatches Alert Box */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" />
              <h2 className="text-sm font-bold text-gray-900">Urgent SLA Dispatches</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
              2 Active
            </span>
          </div>

          <div className="space-y-3">
            {dispatches.map((d) => (
              <div key={d.title} className="p-4 rounded-2xl border border-red-100 bg-red-50/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${d.color}`}>
                    {d.severity}
                  </span>
                  <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                    <Clock size={11} /> {d.remaining}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{d.title}</p>
                <p className="text-gray-500 text-[11px]">{d.location}</p>
                <button
                  onClick={() => showToast(`Emergency technician dispatched for ${d.title}!`)}
                  className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                >
                  {d.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

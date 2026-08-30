"use client";
import React from "react";
import { Download } from "lucide-react";

export default function SLAMonitoring() {
  const breaches = [
    { ref: "TK-245", property: "Apex Tower", category: "HVAC", priority: "Critical", prColor: "bg-red-100 text-red-600", sla: "4 Hours", actual: "6h 15m", exceeded: "2h 15m", penalty: "₹5,000", status: "Pending Payout", stColor: "bg-amber-50 text-amber-700 border border-amber-200" },
    { ref: "TK-242", property: "Meridian Park", category: "MEP", priority: "High", prColor: "bg-amber-100 text-amber-600", sla: "24 Hours", actual: "30h 20m", exceeded: "6h 20m", penalty: "₹8,000", status: "Under Review", stColor: "bg-gray-100 text-gray-600 border border-gray-200" },
    { ref: "TK-239", property: "Crystal Tower", category: "Fire Safety", priority: "Critical", prColor: "bg-red-100 text-red-600", sla: "4 Hours", actual: "5h 45m", exceeded: "1h 45m", penalty: "₹11,500", status: "Approved", stColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    { ref: "TK-235", property: "Apex Tower", category: "Electrical", priority: "Critical", prColor: "bg-red-100 text-red-600", sla: "4 Hours", actual: "4h 50m", exceeded: "0h 50m", penalty: "₹0", status: "Waived", stColor: "bg-gray-100 text-gray-500 border border-gray-200" },
    { ref: "TK-231", property: "Nexus Hub", category: "Plumbing", priority: "High", prColor: "bg-amber-100 text-amber-600", sla: "24 Hours", actual: "26h 10m", exceeded: "2h 10m", penalty: "₹0", status: "Waived", stColor: "bg-gray-100 text-gray-500 border border-gray-200" }
  ];

  const compliance = [
    { cat: "MEP", pct: 98, color: "bg-blue-600" },
    { cat: "HVAC", pct: 89, color: "bg-red-500" },
    { cat: "Security", pct: 100, color: "bg-[#0F8B7D]" },
    { cat: "Housekeeping", pct: 96, color: "bg-[#0F8B7D]" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">SLA Compliance Rate</p><p className="text-2xl font-black text-gray-900">94.2%</p><p className="text-[10px] font-bold text-red-500">↘ vs 95% target</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Response SLA Met</p><p className="text-2xl font-black text-gray-900">96.8%</p><p className="text-[10px] font-bold text-emerald-600">✅ Above target</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Resolution SLA Met</p><p className="text-2xl font-black text-gray-900">91.5%</p><p className="text-[10px] font-bold text-amber-600">⚠ Requires attention</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Penalties Accrued</p><p className="text-2xl font-black text-red-500">₹24,500</p><p className="text-[10px] text-gray-500">Current Month</p></div>
      </div>

      {/* Breach Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">SLA Breach Ledger</h2>
          <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1 cursor-pointer"><Download size={13} /> Export</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Ticket Ref</th><th className="py-3 pr-3">Property</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Priority</th><th className="py-3 pr-3">SLA Limit</th><th className="py-3 pr-3">Actual Res.</th><th className="py-3 pr-3">Exceeded By</th><th className="py-3 pr-3">Penalty</th><th className="py-3">Status</th></tr></thead>
          <tbody>
            {breaches.map((b) => (
              <tr key={b.ref} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">{b.ref}</td>
                <td className="py-3.5 pr-3 text-gray-600">{b.property}</td>
                <td className="py-3.5 pr-3 text-gray-600">{b.category}</td>
                <td className="py-3.5 pr-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.prColor}`}>{b.priority}</span></td>
                <td className="py-3.5 pr-3 text-gray-600">{b.sla}</td>
                <td className="py-3.5 pr-3 text-gray-600">{b.actual}</td>
                <td className="py-3.5 pr-3 font-bold text-red-500">{b.exceeded}</td>
                <td className="py-3.5 pr-3 font-bold text-red-500">{b.penalty}</td>
                <td className="py-3.5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.stColor}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compliance + SLA Params */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Compliance by Category</h2>
          <div className="space-y-4">
            {compliance.map((c) => (
              <div key={c.cat}>
                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-700">{c.cat}</span><span className="font-bold">{c.pct}%</span></div>
                <div className="w-full h-2.5 rounded-full bg-gray-200"><div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">⚙️ SLA Parameters</h2>
          <div className="space-y-3">
            <div className="border border-red-200 bg-red-50 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-2">❗ Critical Priority</p>
              <div className="grid grid-cols-2 gap-2 text-xs"><div><p className="text-gray-500">Response</p><p className="font-bold">≤ 1 Hour</p></div><div><p className="text-gray-500">Resolution</p><p className="font-bold">≤ 4 Hours</p></div></div>
            </div>
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-600 mb-2">↑ High Priority</p>
              <div className="grid grid-cols-2 gap-2 text-xs"><div><p className="text-gray-500">Response</p><p className="font-bold">≤ 4 Hours</p></div><div><p className="text-gray-500">Resolution</p><p className="font-bold">≤ 24 Hours</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

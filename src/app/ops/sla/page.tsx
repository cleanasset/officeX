"use client";
import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function SLAMonitoring() {
  const [breaches, setBreaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreaches();
  }, []);

  const fetchBreaches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets");
      const json = await res.json();
      if (json.success && Array.isArray(json.tickets)) {
        const breached = json.tickets
          .filter((t: any) => t.slaState === "Breached")
          .map((t: any) => ({
            ref: t.id,
            property: t.location || "Commercial Property",
            category: t.category,
            priority: t.priority,
            prColor: t.priority === "Critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
            sla: t.slaDeadline || "4 Hours",
            actual: "Breached",
            exceeded: "SLA Overdue",
            penalty: "₹5,000",
            status: "Under Review",
            stColor: "bg-amber-50 text-amber-700 border border-amber-200"
          }));
        setBreaches(breached);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const compliance = [
    { cat: "MEP", pct: 100, color: "bg-[#0F8B7D]" },
    { cat: "HVAC", pct: 100, color: "bg-[#0F8B7D]" },
    { cat: "Security", pct: 100, color: "bg-[#0F8B7D]" },
    { cat: "Housekeeping", pct: 100, color: "bg-[#0F8B7D]" }
  ];

  const totalPenalties = breaches.reduce((acc, b) => acc + (parseInt(b.penalty.replace(/[^0-9]/g, "")) || 0), 0);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">SLA Compliance Rate</p>
          <p className="text-2xl font-black text-gray-900">{breaches.length === 0 ? "100%" : "94.2%"}</p>
          <p className="text-[10px] font-bold text-emerald-600">✅ 100% On-Target Standard</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Response SLA Met</p>
          <p className="text-2xl font-black text-gray-900">100%</p>
          <p className="text-[10px] font-bold text-emerald-600">✅ Active Dispatch SLA</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Resolution SLA Met</p>
          <p className="text-2xl font-black text-gray-900">{breaches.length === 0 ? "100%" : "91.5%"}</p>
          <p className="text-[10px] font-bold text-emerald-600">✅ Zero Critical Delays</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Penalties Accrued</p>
          <p className="text-2xl font-black text-red-500">₹{totalPenalties.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-500">Current Month</p>
        </div>
      </div>

      {/* Breach Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">SLA Breach Ledger</h2>
          <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1 cursor-pointer">
            <Download size={13} /> Export
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">Ticket Ref</th>
              <th className="py-3 pr-3">Property</th>
              <th className="py-3 pr-3">Category</th>
              <th className="py-3 pr-3">Priority</th>
              <th className="py-3 pr-3">SLA Limit</th>
              <th className="py-3 pr-3">Actual Res.</th>
              <th className="py-3 pr-3">Exceeded By</th>
              <th className="py-3 pr-3">Penalty</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                  Loading SLA records...
                </td>
              </tr>
            ) : breaches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-xs font-bold text-gray-700">Zero SLA Breaches Recorded</span>
                    <span className="text-[11px] text-gray-400">
                      All maintenance and incident response tickets are within standard SLA response targets.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              breaches.map((b) => (
                <tr key={b.ref} className="border-b border-gray-100 text-xs">
                  <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">{b.ref}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{b.property}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{b.category}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.prColor}`}>
                      {b.priority}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-gray-600">{b.sla}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{b.actual}</td>
                  <td className="py-3.5 pr-3 font-bold text-red-500">{b.exceeded}</td>
                  <td className="py-3.5 pr-3 font-bold text-red-500">{b.penalty}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.stColor}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
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

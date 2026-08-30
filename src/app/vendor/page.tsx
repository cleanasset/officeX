"use client";
import React from "react";
import { Star, CheckCircle, Clock } from "lucide-react";

export default function VendorPortalDashboard() {
  const performance = [
    { label: "Quality", pct: 90, color: "bg-[#0F8B7D]" },
    { label: "Timeliness", pct: 85, color: "bg-blue-600" },
    { label: "SLA Compliance", pct: 92, color: "bg-[#0F8B7D]" },
    { label: "Responsiveness", pct: 80, color: "bg-blue-600" },
    { label: "Professionalism", pct: 88, color: "bg-[#0F8B7D]" }
  ];

  const matchedRfqs = [
    { title: "HVAC Maintenance", match: "96%", property: "Crystal Tower", budget: "₹45,000", deadline: "2d 4h left" },
    { title: "Deep Cleaning", match: "88%", property: "Apex Business Tower", budget: "₹18,000", deadline: "5h 20m left" },
    { title: "Electrical Audit", match: "92%", property: "Nexus Hub", budget: "₹12,000", deadline: "4d 12h left" }
  ];

  const payouts = [
    { date: "15 Dec 2024", ref: "Ref: AXIS-982341", amount: "₹45,500", color: "text-emerald-600" },
    { date: "01 Dec 2024", ref: "Ref: HDFC-772901", amount: "₹1,12,000", color: "text-gray-900" },
    { date: "15 Nov 2024", ref: "Ref: SBIN-332199", amount: "₹68,200", color: "text-gray-900" }
  ];

  const workOrders = [
    { id: "WO-045", client: "TCS", property: "Apex Tower", category: "HVAC", catColor: "bg-teal-100 text-teal-700", timeline: "01 Dec - 15 Dec", progress: 75, status: "In Progress" },
    { id: "WO-042", client: "Wipro", property: "Meridian Park", category: "Cleaning", catColor: "bg-blue-100 text-blue-700", timeline: "05 Dec - 10 Dec", progress: 40, status: "In Progress" },
    { id: "WO-039", client: "Infosys", property: "Nexus Hub", category: "Electrical", catColor: "bg-amber-100 text-amber-700", timeline: "20 Nov - 30 Nov", progress: 100, status: "Completed" },
    { id: "WO-035", client: "Deloitte", property: "Crystal Tower", category: "Plumbing", catColor: "bg-purple-100 text-purple-700", timeline: "08 Dec - 12 Dec", progress: 10, status: "Onboarding" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Vendor Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle size={20} className="text-emerald-600" /></div>
          <div>
            <div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-900">Verified Gold Vendor</span><CheckCircle size={14} className="text-[#0F8B7D]" /></div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500"><span>● Status: Active</span><span className="flex items-center gap-1"><Star size={10} className="text-amber-500 fill-amber-500" /> Rating: 4.4 (23 reviews)</span><span>Profile: 100% Complete</span></div>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl border border-[#0F8B7D] text-xs font-bold text-[#0F8B7D] cursor-pointer">Update Profile</button>
      </div>

      {/* KPIs + Performance */}
      <div className="grid grid-cols-[1fr_1fr_340px] gap-4">
        <div className="grid grid-rows-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Active Work Orders</p><p className="text-3xl font-black text-gray-900">4</p></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Earnings</p><p className="text-2xl font-black text-gray-900">₹3,20,000</p></div>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Matched RFQs ●</p><p className="text-3xl font-black text-gray-900">6</p><p className="text-[10px] font-bold text-[#0F8B7D]">+2 Today</p></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Quality Score</p><div className="flex items-center gap-2"><span className="text-2xl font-black text-gray-900">88</span><span className="text-xs text-gray-500">Top 15% Vendor</span></div></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Performance Radar</h3>
          <div className="space-y-2.5">
            {performance.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-[10px] mb-0.5"><span className="font-semibold text-gray-700">{p.label}</span><span className="font-bold text-gray-900">{p.pct}%</span></div>
                <div className="w-full h-2 rounded-full bg-gray-200"><div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matched RFQs + Earnings */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-gray-900">New Matched RFQs</h2><button className="text-xs font-semibold text-[#0F8B7D] cursor-pointer">View All</button></div>
          <div className="space-y-3">
            {matchedRfqs.map((r) => (
              <div key={r.title} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{r.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">{r.match} Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-600 flex items-center gap-1"><Clock size={10} /> {r.deadline}</span>
                    <button className="px-4 py-2 rounded-lg bg-[#0F8B7D] text-white text-[10px] font-bold cursor-pointer">Quote Now</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">🏢 {r.property}  •  💰 Budget: {r.budget}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Earnings Trend</h2>
          <div className="flex items-end gap-2 h-24 mb-4">
            {[40, 55, 50, 70, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-[#0F8B7D]/20 rounded-t" style={{ height: `${h}%` }}><div className="w-full bg-[#0F8B7D] rounded-t" style={{ height: "60%" }} /></div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Recent Payouts</p>
          <div className="space-y-2">
            {payouts.map((p, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div><p className="font-semibold text-gray-900">{p.date}</p><p className="text-[10px] text-gray-500">{p.ref}</p></div>
                <span className={`font-bold ${p.color}`}>{p.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-gray-900">My Active Work Orders</h2><button className="text-xs font-semibold text-[#0F8B7D] cursor-pointer">View All →</button></div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">WO ID</th><th className="py-3 pr-3">Client</th><th className="py-3 pr-3">Property</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Timeline</th><th className="py-3 pr-3">Progress</th><th className="py-3">Status</th></tr></thead>
          <tbody>
            {workOrders.map((w) => (
              <tr key={w.id} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-gray-500">{w.id}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{w.client}</td>
                <td className="py-3.5 pr-3 text-gray-600">{w.property}</td>
                <td className="py-3.5 pr-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${w.catColor}`}>{w.category}</span></td>
                <td className="py-3.5 pr-3 text-gray-600">{w.timeline}</td>
                <td className="py-3.5 pr-3"><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${w.progress}%` }} /></div><span className="text-[10px] font-bold">{w.progress}%</span></div></td>
                <td className="py-3.5"><span className={`text-[10px] font-bold ${w.status === "Completed" ? "text-emerald-600" : w.status === "In Progress" ? "text-[#0F8B7D]" : "text-blue-600"}`}>● {w.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

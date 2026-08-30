"use client";
import React from "react";
import { TrendingUp, TrendingDown, MoreVertical } from "lucide-react";

export default function LeasingDashboard() {
  const funnel = [
    { stage: "Enquiry", count: 156, width: "100%" },
    { stage: "Qualified", count: 89, width: "57%" },
    { stage: "Site Visit", count: 52, width: "33%" },
    { stage: "Negotiation", count: 28, width: "18%" },
    { stage: "LOI", count: 15, width: "10%" },
    { stage: "Closed", count: 8, width: "5%" }
  ];

  const actionItems = [
    { color: "bg-red-500", title: "HCL Tech Requirement - Unassigned", desc: "Hot lead, untouched for 24hrs", action: "Assign Now" },
    { color: "bg-amber-500", title: "Lease Renewal: TechNova Solutions", desc: "Expires in 15 days", action: "Review Leases" },
    { color: "bg-amber-500", title: "LOI Draft pending for Global Logistics", desc: "Negotiation complete", action: "Contact Lead" }
  ];

  const visits = [
    { company: "Innovate Corp", location: "Cyberpark Tower B, Fl 4", time: "10:00 AM", status: "✅" },
    { company: "NextGen Retail", location: "High Street Mall, GF-12", time: "02:30 PM (Now)", status: "🔵" },
    { company: "Apex Financial", location: "Downtown Plaza, Suite 800", time: "04:00 PM", status: "🟡" }
  ];

  const leads = [
    { id: "#L-8042", company: "HCL Tech", req: "IT Office Space", area: "15,000 sqft", stage: "NEW", stageColor: "bg-blue-100 text-blue-700", assigned: "Unassigned", assignedColor: "text-red-500" },
    { id: "#L-8041", company: "Innovate Corp", req: "Coworking Desks", area: "50 Seats", stage: "SITE VISIT", stageColor: "bg-emerald-100 text-emerald-700", assigned: "Ravi M.", assignedColor: "text-gray-700" },
    { id: "#L-8040", company: "Global Logistics", req: "Warehouse", area: "50,000 sqft", stage: "NEGOTIATION", stageColor: "bg-amber-100 text-amber-700", assigned: "Anita S.", assignedColor: "text-gray-700" },
    { id: "#L-8039", company: "FreshMart Retail", req: "Ground Floor Retail", area: "2,500 sqft", stage: "CLOSED-WON", stageColor: "bg-emerald-100 text-emerald-700", assigned: "Vikram K.", assignedColor: "text-gray-700" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Good Morning, Ravi</h1>
        <p className="text-xs text-gray-500">Today is Monday, October 23, 2023</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Active Listings</p><p className="text-3xl font-black text-gray-900">47</p><p className="text-[10px] font-bold text-emerald-600">↑ 3 new</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Open Leads</p><p className="text-3xl font-black text-gray-900">23</p><p className="text-[10px] font-bold text-red-500">↓ 2 closed</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Today&apos;s Site Visits</p><p className="text-3xl font-black text-gray-900">5</p><p className="text-[10px] text-gray-500">2 completed</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Commission Pipeline</p><p className="text-2xl font-black text-gray-900">₹8,40,000</p><p className="text-[10px] font-bold text-emerald-600">↗ 12%</p></div>
      </div>

      {/* Funnel + Listings */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Lead Conversion Funnel</h2>
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <div className="h-8 rounded-lg bg-[#0F8B7D] flex items-center px-3" style={{ width: f.width }}>
                  <span className="text-[10px] font-bold text-white whitespace-nowrap">{f.stage} ({f.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Listings by Type</h2>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full"><circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" /><circle cx="18" cy="18" r="15" fill="none" stroke="#0F8B7D" strokeWidth="3" strokeDasharray="62 100" strokeLinecap="round" transform="rotate(-90 18 18)" /><circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="18 100" strokeDashoffset="-62" strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-black">47</span><span className="text-[10px] text-gray-400">Total</span></div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F8B7D]" /> Office (62%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Coworking (18%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Retail (12%)</span>
          </div>
        </div>
      </div>

      {/* Actions + Visits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">⚠ Critical Action Items</h2>
          <div className="space-y-3">
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${a.color}`} /><div><p className="text-xs font-bold text-gray-900">{a.title}</p><p className="text-[10px] text-gray-500">{a.desc}</p></div></div>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 cursor-pointer">{a.action}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">📅 Today&apos;s Site Visit Schedule</h2>
          <div className="space-y-3">
            {visits.map((v, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span>{v.status}</span><div><p className="text-xs font-bold text-gray-900">{v.company}</p><p className="text-[10px] text-gray-500">{v.location}</p></div></div>
                <span className={`text-xs font-semibold ${v.time.includes("Now") ? "text-[#0F8B7D]" : "text-gray-600"}`}>{v.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-gray-900">Recent Leads</h2><button className="text-xs font-semibold text-[#0F8B7D] cursor-pointer">View All</button></div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Lead ID</th><th className="py-3 pr-3">Company</th><th className="py-3 pr-3">Requirement</th><th className="py-3 pr-3">Area</th><th className="py-3 pr-3">Stage</th><th className="py-3 pr-3">Assigned To</th><th className="py-3">Actions</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">{l.id}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{l.company}</td>
                <td className="py-3.5 pr-3 text-gray-600">{l.req}</td>
                <td className="py-3.5 pr-3 text-gray-600">{l.area}</td>
                <td className="py-3.5 pr-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${l.stageColor}`}>{l.stage}</span></td>
                <td className={`py-3.5 pr-3 text-xs font-semibold ${l.assignedColor}`}>{l.assigned}</td>
                <td className="py-3.5"><MoreVertical size={14} className="text-gray-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

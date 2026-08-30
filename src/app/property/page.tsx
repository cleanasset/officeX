"use client";
import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function PropertyManagerDashboard() {
  const criticalAlerts = [
    { color: "border-l-red-500", text: "Fire NOC expired for Crystal Tower, Chennai — immediate renewal required", action: "Renew Now", actionColor: "bg-red-500 text-white" },
    { color: "border-l-blue-500", text: "3 rent invoices overdue beyond 15 days — ₹1.5L outstanding", action: "View Invoices", actionColor: "border border-gray-200 text-gray-700" },
    { color: "border-l-amber-500", text: "Lift fitness certificate expiring in 38 days for Apex Tower", action: "Schedule", actionColor: "border border-gray-200 text-gray-700" },
    { color: "border-l-purple-500", text: "2 new tenant onboarding requests pending KYC verification", action: "Review KYC", actionColor: "border border-gray-200 text-gray-700" }
  ];

  const activity = [
    { dot: "bg-blue-500", text: "Rent payment received - Apex Tower" },
    { dot: "bg-gray-400", text: "Ticket raised - Nexus Hub" },
    { dot: "bg-gray-400", text: "Lease renewed - Meridian Park" },
    { dot: "bg-gray-400", text: "New tenant added - Summit One" },
    { dot: "bg-gray-400", text: "Maintenance completed - Crystal Tower" }
  ];

  const properties = [
    { name: "Apex Tower", location: "Mumbai", area: "45k", occupancy: "96%", rent: "₹12L", tenants: 8, compliance: true, status: "Active" },
    { name: "Crystal Tower", location: "Chennai", area: "38k", occupancy: "87%", rent: "₹9.5L", tenants: 6, compliance: false, status: "Attention" },
    { name: "Meridian Park", location: "Bangalore", area: "60k", occupancy: "92%", rent: "₹15L", tenants: 12, compliance: true, status: "Active" },
    { name: "Nexus Hub", location: "Hyderabad", area: "25k", occupancy: "89%", rent: "₹6L", tenants: 4, compliance: true, status: "Active" },
    { name: "Summit One", location: "Pune", area: "50k", occupancy: "95%", rent: "₹11L", tenants: 9, compliance: true, status: "Active" },
    { name: "Orion Tech", location: "Noida", area: "80k", occupancy: "82%", rent: "₹18L", tenants: 15, compliance: true, status: "Active" }
  ];

  const occupancyBars = [
    { name: "Apex", pct: 96 }, { name: "Meridian", pct: 92 }, { name: "Nexus", pct: 89 },
    { name: "Crystal", pct: 87 }, { name: "Summit", pct: 95 }, { name: "Orion", pct: 82 }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Properties</p>
          <p className="text-3xl font-black text-gray-900">12</p>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">+2</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Occupancy</p>
          <p className="text-3xl font-black text-gray-900">94.2%</p>
          <span className="text-[10px] font-bold text-emerald-600">+1.8%</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Rent Collections</p>
          <p className="text-2xl font-black text-gray-900">₹48.5L <span className="text-xs font-normal text-gray-400">/ ₹52L</span></p>
          <div className="w-full h-1.5 rounded-full bg-gray-200 mt-1"><div className="h-full rounded-full bg-blue-600" style={{ width: "93%" }} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Helpdesk Tickets</p>
          <div className="flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /><p className="text-3xl font-black text-gray-900">18</p></div>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">4 overdue</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Compliance</p>
          <p className="text-3xl font-black text-gray-900">4 <span className="text-xs font-normal text-gray-400">due</span></p>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">2 expired</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Revenue vs OPEX</h2>
          <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-xs text-gray-400">[Revenue vs OPEX Line Chart]</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Occupancy by Property</h2>
          <div className="space-y-3">
            {occupancyBars.map((o) => (
              <div key={o.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-16">{o.name}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-200"><div className="h-full rounded-full bg-purple-500" style={{ width: `${o.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alerts + Activity */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Critical Alerts</h2>
          <div className="space-y-3">
            {criticalAlerts.map((a, i) => (
              <div key={i} className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl border-l-4 ${a.color}`}>
                <p className="text-xs text-gray-700 flex-1 mr-4">{a.text}</p>
                <button className={`px-4 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer ${a.actionColor}`}>{a.action}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
                <p className="text-xs text-gray-700">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Properties Overview</h2>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Property Name</th><th className="py-3 pr-3">Location</th><th className="py-3 pr-3">Area (Sqft)</th><th className="py-3 pr-3">Occupancy</th><th className="py-3 pr-3">Monthly Rent</th><th className="py-3 pr-3">Tenants</th><th className="py-3 pr-3">Compliance</th><th className="py-3">Status</th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.name} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-gray-900">{p.name}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.location}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.area}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.occupancy}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{p.rent}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.tenants}</td>
                <td className="py-3.5 pr-3">{p.compliance ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-red-500">❌</span>}</td>
                <td className="py-3.5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === "Active" ? "bg-[#0F8B7D] text-white" : "bg-amber-100 text-amber-700"}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

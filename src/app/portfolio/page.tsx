"use client";
import React from "react";
import { TrendingUp, Mail, MoreVertical } from "lucide-react";

export default function PortfolioDashboard() {
  const tenants = [
    { name: "TCS", property: "BKC Mumbai", area: "120,000", expiry: "Mar 2026", rent: "₹1.2 Cr", payment: "Paid" },
    { name: "HCL", property: "Whitefield BLR", area: "85,000", expiry: "Dec 2025", rent: "₹85 L", payment: "Pending" },
    { name: "Accenture", property: "BKC Mumbai", area: "150,000", expiry: "Jun 2027", rent: "₹1.5 Cr", payment: "Overdue" }
  ];

  const alerts = [
    { color: "bg-red-500", title: "HVAC Failure - Floor 4", location: "BKC Mumbai • Raised 2h ago" },
    { color: "bg-amber-500", title: "Elevator B Maintenance", location: "Whitefield BLR • Raised 5h ago" },
    { color: "bg-emerald-500", title: "Restroom Plumbing Fix", location: "BKC Mumbai • Raised 1d ago" },
    { color: "bg-amber-500", title: "Lobby Lighting Issue", location: "BKC Mumbai • Raised 2d ago" }
  ];

  const regions = [
    { name: "Mumbai BKC", desc: "Premium Commercial Hub", occupancy: 95, revenue: "₹32 Cr", assets: 4, color: "bg-[#0F8B7D]" },
    { name: "Bengaluru Whitefield", desc: "IT Corridor Focus", occupancy: 88, revenue: "₹24 Cr", assets: 3, color: "bg-blue-600" },
    { name: "Pune Hinjewadi", desc: "Emerging Tech Park", occupancy: 76, revenue: "₹12 Cr", assets: 2, color: "bg-blue-400" }
  ];

  const activity = [
    "Rent payment received - Apex Tower",
    "Ticket raised - Nexus Hub",
    "Lease renewed - Meridian Park",
    "New tenant added - Summit One",
    "Maintenance completed - Crystal Tower"
  ];

  const paymentStyle = (s: string) => s === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : s === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-600 border border-red-200";

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Good morning, Rohan.</h1>
        <p className="text-sm text-gray-500 mt-1">Your Mumbai BKC portfolio is looking healthy today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Managed Area</p>
          <p className="text-3xl font-black text-gray-900">1.2M <span className="text-sm font-normal text-gray-400">sq ft</span></p>
          <p className="text-[10px] font-bold text-emerald-600">↗ +50k this quarter</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Occupancy Rate</p>
          <p className="text-3xl font-black text-gray-900">92.4 <span className="text-sm font-normal text-gray-400">%</span></p>
          <div className="w-full h-2 rounded-full bg-gray-200 mt-2"><div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: "92.4%" }} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Annual Lease Value</p>
          <p className="text-3xl font-black text-gray-900">₹48.5 <span className="text-sm font-normal text-gray-400">Cr</span></p>
          <p className="text-[10px] font-bold text-emerald-600">↗ +12% YoY</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Maintenance</p>
          <p className="text-3xl font-black text-gray-900">14 <span className="text-sm font-normal text-gray-400">Open Tickets</span></p>
          <p className="text-[10px] font-bold text-red-500">3 High Priority</p>
        </div>
      </div>

      {/* Tenant Portfolio */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Tenant Portfolio Breakdown</h2>
          <button className="text-xs font-semibold text-[#0F8B7D] cursor-pointer">View All →</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Tenant Name</th><th className="py-3 pr-3">Property</th><th className="py-3 pr-3">Leased Area (Sq Ft)</th><th className="py-3 pr-3">Lease Expiry</th><th className="py-3 pr-3">Monthly Rent (₹)</th><th className="py-3 pr-3">Payment Status</th><th className="py-3 pr-3">Contact</th><th className="py-3">Actions</th></tr></thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.name} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-gray-900">{t.name}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.property}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.area}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.expiry}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{t.rent}</td>
                <td className="py-3.5 pr-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${paymentStyle(t.payment)}`}>{t.payment}</span></td>
                <td className="py-3.5 pr-3"><Mail size={14} className="text-gray-400" /></td>
                <td className="py-3.5"><MoreVertical size={14} className="text-gray-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts + Maintenance */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Occupancy Trends</h2>
            <span className="px-3 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-500">Last 6 Months</span>
          </div>
          <div className="h-40 flex items-end gap-4">
            {["Jan","Feb","Mar","Apr","May","Jun"].map((m,i) => (
              <div key={m} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#0F8B7D]/20 rounded-t" style={{ height: `${60 + i * 12}px` }}><div className="w-full bg-[#0F8B7D] rounded-t" style={{ height: `${40 + i * 8}px` }} /></div>
                <span className="text-[10px] text-gray-400 mt-1">{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Active Maintenance Queue</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">14 Open</span>
          </div>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                  <div><p className="text-xs font-bold text-gray-900">{a.title}</p><p className="text-[10px] text-gray-500">{a.location}</p></div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 cursor-pointer">Assign</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Regional Portfolio Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          {regions.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`w-full h-1 rounded-full ${r.color} mb-4`} />
              <h3 className="text-sm font-bold text-gray-900">{r.name}</h3>
              <p className="text-[10px] text-gray-500 mb-3">{r.desc}</p>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Occupancy</span><span className="font-bold">{r.occupancy}%</span></div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 mb-3"><div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.occupancy}%` }} /></div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Revenue (YTD)</span><span className="font-bold text-gray-900">{r.revenue}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Total Assets</span><span className="font-bold text-gray-900">{r.assets}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, Search, Filter } from "lucide-react";

export default function SuperAdminDashboard() {
  const integrations = [
    { name: "Razorpay PG", icon: "🏦", uptime: "99.9%", latency: "142ms", status: "online" },
    { name: "Twilio SMS", icon: "📱", status: "Online", extra: true },
    { name: "Gupshup WA", icon: "📧", status: "Online", extra: true }
  ];

  const approvals = [
    { id: "APP-102", type: "Vendor KYC", entity: "TechServe Solutions", date: "22-Aug", verification: "GST Verified", verColor: "text-emerald-600", actions: ["Approve", "Reject"] },
    { id: "APP-101", type: "Refund Request", entity: "TCS Rent Deposit", date: "20-Aug", verification: "Approved by Finance", verColor: "text-amber-600", actions: ["Process Refund"] },
    { id: "APP-098", type: "Admin Onboarding", entity: "Rajesh Kumar", date: "19-Aug", verification: "Email Verified", verColor: "text-blue-600", actions: ["Approve Account"] }
  ];

  const auditEvents = [
    { icon: "🔴", title: "Account Suspended", desc: "Vendor V-8893 flagged for compliance violation.", time: "Today, 14:23 by SuperAdmin" },
    { icon: "✅", title: "Bulk Kyc Approved", desc: "Batch B-22 processed successfully.", time: "Today, 11:05 by System" },
    { icon: "⚙️", title: "Config Changed", desc: "Updated webhook endpoint for payments.", time: "Yesterday, 18:45 by SuperAdmin" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">💰 GTV</p>
          <p className="text-2xl font-black text-gray-900">₹2.4Cr</p>
          <span className="text-[10px] font-bold text-emerald-600">▲12%</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">📊 MRR</p>
          <p className="text-2xl font-black text-gray-900">₹3.8L</p>
          <span className="text-[10px] font-bold text-emerald-600">▲4%</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">👥 Users</p>
          <p className="text-2xl font-black text-gray-900">342</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">⚠️ Pending KYC</p>
          <p className="text-2xl font-black text-gray-900">8</p>
          <span className="text-[10px] font-bold text-red-500">Action Req</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">🏢 Managed Properties</p>
          <p className="text-2xl font-black text-gray-900">34</p>
        </div>
      </div>

      {/* Integration Health */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">⚙️ Integration Health</h2>
          <button className="text-xs font-semibold text-[#0F8B7D] cursor-pointer">View Detailed Logs →</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-900">🏦 Razorpay PG</span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Uptime</span><span className="font-bold text-gray-700">99.9%</span></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Latency</span><span className="font-bold text-gray-700">142ms</span></div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-900">📱 Twilio SMS</span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-900">📧 Gupshup WA</span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-900">💾 PostgreSQL Primary DB</span><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Healthy</span></div>
            <div className="flex gap-8 text-[10px] text-gray-500"><div><span className="uppercase font-bold text-gray-400">DB Size</span><p className="font-bold text-gray-700">4.2 GB</p></div><div><span className="uppercase font-bold text-gray-400">Last Backup</span><p className="font-bold text-gray-700">Completed 2h ago</p></div></div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-900">🧠 OpenAI API</span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
            <div className="flex justify-between text-[10px] text-gray-500"><span>Tokens Today</span><span className="font-bold text-gray-700">12,450</span></div>
          </div>
        </div>
      </div>

      {/* Pending Approvals + Audit Timeline */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">☑️ Pending Approvals Ledger</h2>
            <div className="flex gap-2">
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search ID..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-36" /></div>
              <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer"><Filter size={14} /></button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Request ID</th><th className="py-3 pr-3">Type</th><th className="py-3 pr-3">Entity Name</th><th className="py-3 pr-3">Date Submitted</th><th className="py-3 pr-3">Verification Status</th><th className="py-3">Actions</th></tr></thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 text-xs">
                  <td className="py-3.5 pr-3 font-bold text-gray-500">{a.id}</td>
                  <td className="py-3.5 pr-3 text-gray-700">{a.type}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{a.entity}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{a.date}</td>
                  <td className={`py-3.5 pr-3 text-xs font-semibold ${a.verColor}`}>{a.verification}</td>
                  <td className="py-3.5 flex gap-1">
                    {a.actions.map((act) => (
                      <button key={act} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${act === "Reject" ? "bg-red-500 text-white" : "bg-[#0F8B7D] text-white"}`}>{act}</button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 text-center mt-4 cursor-pointer hover:text-[#0F8B7D]">View All Pending (8)</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">🕐 Audit Timeline</h2>
          <div className="space-y-5">
            {auditEvents.map((e, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-base">{e.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">{e.title}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{e.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#0F8B7D] font-semibold mt-5 cursor-pointer hover:underline">Full Audit Log</p>
        </div>
      </div>
    </div>
  );
}

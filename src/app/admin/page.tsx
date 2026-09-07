"use client";

import React, { useState } from "react";
import { 
  TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, 
  Search, Filter, Shield, ShieldCheck, X, FileText, Check, 
  DollarSign, ArrowUpRight, ChevronRight, Eye, Building2, UserCheck
} from "lucide-react";

interface ApprovalItem {
  id: string;
  type: string;
  entity: string;
  category?: string;
  date: string;
  verification: string;
  verColor: string;
  status: "Pending" | "Approved" | "Rejected";
  gstin?: string;
  pan?: string;
  psara?: string;
  turnover?: string;
  staffCount?: number;
  documents?: { name: string; type: string; size: string; status: string }[];
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "commission">("overview");
  const [showKycDrawer, setShowKycDrawer] = useState<ApprovalItem | null>(null);
  const [showMrrModal, setShowMrrModal] = useState(false);
  const [auditNote, setAuditNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [approvalsList, setApprovalsList] = useState<ApprovalItem[]>([
    { 
      id: "APP-102", 
      type: "Vendor KYC", 
      entity: "TechServe Solutions Pvt Ltd", 
      category: "Integrated MEP & Facility Management",
      date: "22-Aug", 
      verification: "GST Verified", 
      verColor: "text-emerald-600",
      status: "Pending",
      gstin: "27AABCS1420M1Z3",
      pan: "AABCS1420M",
      psara: "PSARA/MH/2023/8892",
      turnover: "₹4.8 Cr",
      staffCount: 140,
      documents: [
        { name: "GST_Registration_Certificate.pdf", type: "Tax Document", size: "1.2 MB", status: "Verified Match" },
        { name: "PAN_Card_Incorporation.pdf", type: "Identity Proof", size: "840 KB", status: "Verified Match" },
        { name: "PSARA_Maharashtra_License_2027.pdf", type: "Security Clearance", size: "2.4 MB", status: "Valid" },
        { name: "Bank_Cancelled_Cheque_HDFC.pdf", type: "Banking", size: "620 KB", status: "Penny Drop OK" },
        { name: "Workmen_Compensation_Insurance.pdf", type: "Insurance", size: "3.1 MB", status: "Active (₹2 Cr)" }
      ]
    },
    { 
      id: "APP-101", 
      type: "Refund Request", 
      entity: "TCS Rent Deposit", 
      date: "20-Aug", 
      verification: "Approved by Finance", 
      verColor: "text-amber-600",
      status: "Pending"
    },
    { 
      id: "APP-098", 
      type: "Admin Onboarding", 
      entity: "Rajesh Kumar", 
      date: "19-Aug", 
      verification: "Email Verified", 
      verColor: "text-blue-600",
      status: "Pending"
    }
  ]);

  const [auditEvents, setAuditEvents] = useState([
    { icon: "🔴", title: "Account Suspended", desc: "Vendor V-8893 flagged for compliance violation.", time: "Today, 14:23 by SuperAdmin" },
    { icon: "✅", title: "Bulk KYC Approved", desc: "Batch B-22 processed successfully.", time: "Today, 11:05 by System" },
    { icon: "⚙️", title: "Config Changed", desc: "Updated webhook endpoint for payments.", time: "Yesterday, 18:45 by SuperAdmin" }
  ]);

  const handleApproveKyc = (item: ApprovalItem) => {
    setApprovalsList(prev => prev.map(a => a.id === item.id ? { ...a, status: "Approved" } : a));
    setAuditEvents(prev => [
      { icon: "✅", title: `KYC Approved: ${item.entity}`, desc: auditNote || "All compliance credentials confirmed verified.", time: "Just now by SuperAdmin" },
      ...prev
    ]);
    setShowKycDrawer(null);
    setAuditNote("");
    setToast(`Successfully approved ${item.entity}! Live vendor badge granted.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRejectKyc = (item: ApprovalItem) => {
    setApprovalsList(prev => prev.map(a => a.id === item.id ? { ...a, status: "Rejected" } : a));
    setAuditEvents(prev => [
      { icon: "❌", title: `KYC Rejected: ${item.entity}`, desc: auditNote || "Clarification required on submitted documents.", time: "Just now by SuperAdmin" },
      ...prev
    ]);
    setShowKycDrawer(null);
    setAuditNote("");
    setToast(`Rejected application ${item.id}. Notice dispatched to applicant.`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Super Admin &amp; Governance Console</h1>
          <p className="text-xs text-gray-500 mt-0.5">Platform telemetry, KYC vetting, and escrow reconciliation.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Governance Overview
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "commission" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Commission Ledger
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">💰 Marketplace GTV (Q3 YTD)</p>
              <p className="text-2xl font-black text-gray-900">₹2.4Cr</p>
              <span className="text-[10px] font-bold text-emerald-600">▲ 12% MoM</span>
            </div>
            <div 
              onClick={() => setShowMrrModal(true)}
              className="bg-white rounded-2xl border border-gray-200 hover:border-[#0F8B7D] p-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase">📊 Platform MRR</p>
                <ChevronRight size={13} className="text-gray-400 group-hover:text-[#0F8B7D]" />
              </div>
              <p className="text-2xl font-black text-gray-900">₹3.8L</p>
              <span className="text-[10px] font-bold text-[#0F8B7D] underline">Click for breakdown</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">👥 Active Users</p>
              <p className="text-2xl font-black text-gray-900">342</p>
              <span className="text-[10px] font-bold text-gray-500">Across 8 Portals</span>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-4 bg-red-50/20">
              <p className="text-[10px] font-bold text-red-500 uppercase">⚠️ Pending KYC</p>
              <p className="text-2xl font-black text-red-600">{approvalsList.filter(a => a.status === "Pending").length}</p>
              <span className="text-[10px] font-bold text-red-500">Action Required</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">🏢 Managed Properties</p>
              <p className="text-2xl font-black text-gray-900">34</p>
              <span className="text-[10px] font-bold text-gray-500">Grade-A Commercial</span>
            </div>
          </div>

          {/* Integration Health */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>⚙️ System Integrations &amp; API Health</span>
              </h2>
              <span className="text-xs font-semibold text-[#0F8B7D]">All Systems Operational</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">🏦 Razorpay Nodal Escrow</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Uptime</span><span className="font-bold text-gray-700">99.98%</span></div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Latency</span><span className="font-bold text-gray-700">142ms</span></div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">📱 Twilio OTP &amp; Alerts</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Delivery Rate</span><span className="font-bold text-gray-700">99.4%</span></div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">📧 Gupshup WhatsApp</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Active Sessions</span><span className="font-bold text-gray-700">184</span></div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">🧠 OpenAI API</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Status</span><span className="font-bold text-emerald-600">Online</span></div>
                <div className="flex justify-between text-[10px] text-gray-500"><span>Tokens Today</span><span className="font-bold text-gray-700">12,450</span></div>
              </div>
            </div>
          </div>

          {/* Pending Approvals Ledger + Audit Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">☑️ Pending Approvals Ledger</h2>
                  <p className="text-xs text-gray-400">Click any row to inspect complete credentials before approval</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Search..." className="pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-32" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 pr-3">Request ID</th>
                      <th className="py-3 pr-3">Type</th>
                      <th className="py-3 pr-3">Entity Name</th>
                      <th className="py-3 pr-3">Date</th>
                      <th className="py-3 pr-3">Verification</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalsList.map((a) => (
                      <tr 
                        key={a.id} 
                        onClick={() => setShowKycDrawer(a)}
                        className="border-b border-gray-100 text-xs hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 pr-3 font-mono font-bold text-gray-600">{a.id}</td>
                        <td className="py-3.5 pr-3 text-gray-700">{a.type}</td>
                        <td className="py-3.5 pr-3 font-bold text-gray-900 group-hover:text-[#0F8B7D]">
                          {a.entity}
                        </td>
                        <td className="py-3.5 pr-3 text-gray-500">{a.date}</td>
                        <td className={`py-3.5 pr-3 text-xs font-semibold ${a.verColor}`}>{a.verification}</td>
                        <td className="py-3.5 pr-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                            a.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowKycDrawer(a);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[11px] font-bold cursor-pointer transition-all inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye size={12} />
                            <span>Review KYC</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-gray-900 mb-5">🕐 Audit Governance Trail</h2>
              <div className="space-y-4">
                {auditEvents.map((e, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <span className="text-base shrink-0">{e.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{e.title}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{e.desc}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Commission Ledger View */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">OfficeX Platform Commission &amp; Escrow Ledger</h2>
              <p className="text-xs text-gray-500">Auto-calculated 10% platform take-rate on all completed vendor contracts.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Net Commission (Q3 YTD)</span>
              <p className="text-2xl font-black text-[#0F8B7D]">₹2,42,830</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Gross Merchandise Value (GTV)</p>
              <p className="text-xl font-black text-gray-900 mt-1">₹24,28,300</p>
              <span className="text-[10px] text-gray-500">8 Contracts executed</span>
            </div>
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200">
              <p className="text-[10px] font-bold text-teal-800 uppercase">Platform Take-Rate (10%)</p>
              <p className="text-xl font-black text-[#0F8B7D] mt-1">₹2,42,830</p>
              <span className="text-[10px] text-teal-600">Retained via Escrow</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Disbursed to Vendors (90%)</p>
              <p className="text-xl font-black text-emerald-700 mt-1">₹21,85,470</p>
              <span className="text-[10px] text-emerald-600">On Milestone Sign-off</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-800 uppercase">Escrow Buffer Held</p>
              <p className="text-xl font-black text-amber-700 mt-1">₹6,50,000</p>
              <span className="text-[10px] text-amber-600">Pending final punchlist</span>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase">
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Property / Client</th>
                <th className="py-3 px-3">Contract Value</th>
                <th className="py-3 px-3">OfficeX Fee (10%)</th>
                <th className="py-3 px-3">Vendor Payout (90%)</th>
                <th className="py-3 px-3 text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-gray-800">TXN-8801</td>
                <td className="py-3 px-3 font-bold text-gray-900">TechServe Solutions</td>
                <td className="py-3 px-3 text-gray-600">Apex Tower (BKC)</td>
                <td className="py-3 px-3 font-bold text-gray-900">₹2,18,300</td>
                <td className="py-3 px-3 font-bold text-[#0F8B7D]">₹21,830</td>
                <td className="py-3 px-3 text-gray-700">₹1,96,470</td>
                <td className="py-3 px-3 text-right"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Escrow Held</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-gray-800">TXN-8794</td>
                <td className="py-3 px-3 font-bold text-gray-900">CleanPro Services</td>
                <td className="py-3 px-3 text-gray-600">Meridian Tech Park</td>
                <td className="py-3 px-3 font-bold text-gray-900">₹1,50,000</td>
                <td className="py-3 px-3 font-bold text-[#0F8B7D]">₹15,000</td>
                <td className="py-3 px-3 text-gray-700">₹1,35,000</td>
                <td className="py-3 px-3 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Disbursed</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-gray-800">TXN-8750</td>
                <td className="py-3 px-3 font-bold text-gray-900">Guardian Security Ltd</td>
                <td className="py-3 px-3 text-gray-600">Nexus Innovation Hub</td>
                <td className="py-3 px-3 font-bold text-gray-900">₹2,50,000</td>
                <td className="py-3 px-3 font-bold text-[#0F8B7D]">₹25,000</td>
                <td className="py-3 px-3 text-gray-700">₹2,25,000</td>
                <td className="py-3 px-3 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Disbursed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ VENDOR KYC DETAIL DRAWER (P0 CRITICAL FIX) ═══ */}
      {showKycDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                      {showKycDrawer.type} Verification
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">{showKycDrawer.id}</span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mt-2">{showKycDrawer.entity}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{showKycDrawer.category || "General Commercial Partner"}</p>
                </div>
                <button 
                  onClick={() => setShowKycDrawer(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Real-time Verification Radar */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  1. Real-time Government Database Match
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>GSTIN Verification</span>
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-800 mt-1">{showKycDrawer.gstin || "27AABCS1420M1Z3"}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Active Match on GSTN Portal</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Income Tax PAN</span>
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-800 mt-1">{showKycDrawer.pan || "AABCS1420M"}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Valid Corporate PAN Match</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>PSARA License</span>
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-800 mt-1">{showKycDrawer.psara || "PSARA/MH/2023/8892"}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Valid Till Dec 2027</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Razorpay Escrow Node</span>
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-800 mt-1">HDFC Bank ···8921</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Penny Drop Verified</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  2. Uploaded Compliance Files ({showKycDrawer.documents?.length || 3} Files)
                </h3>
                <div className="space-y-2">
                  {(showKycDrawer.documents || [
                    { name: "Trade_License_2026.pdf", type: "Municipal Trade License", size: "1.4 MB", status: "Valid" },
                    { name: "Workmen_Compensation_Policy.pdf", type: "Insurance", size: "2.1 MB", status: "Valid" },
                    { name: "EPFO_Labor_Return.pdf", type: "Labor License", size: "890 KB", status: "Valid" }
                  ]).map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-[#0F8B7D]" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                          <p className="text-[10px] text-gray-400">{doc.type} · {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {doc.status}
                        </span>
                        <button 
                          onClick={() => {
                            setToast(`Opening preview for ${doc.name}`);
                            setTimeout(() => setToast(null), 2500);
                          }}
                          className="text-xs text-[#0F8B7D] hover:underline font-bold"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auditor Notes Input */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  3. SuperAdmin Audit Log Note
                </h3>
                <textarea
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Enter verification notes, risk assessment remarks, or special conditions..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] h-20 resize-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => handleRejectKyc(showKycDrawer)}
                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleApproveKyc(showKycDrawer)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                <span>Approve &amp; Issue Live Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MRR BREAKDOWN MODAL ═══ */}
      {showMrrModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">MRR Breakdown by Subscription Tier</h3>
                <p className="text-xs text-gray-500">Current Monthly Recurring Revenue: ₹3,80,000</p>
              </div>
              <button onClick={() => setShowMrrModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-900">Enterprise REIT &amp; Campus Tier</p>
                  <p className="text-[10px] text-gray-500">4 Accounts · 2.1M Sq.Ft. managed · ₹6/sqft SLA</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#0F8B7D]">₹2,10,000/mo</p>
                  <span className="text-[9px] font-bold text-emerald-600">55.2% of MRR</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-900">Professional Multi-Site Tier</p>
                  <p className="text-[10px] text-gray-500">12 Accounts · Full CAFM &amp; PPM Calendar</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">₹1,20,000/mo</p>
                  <span className="text-[9px] font-bold text-blue-600">31.6% of MRR</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-900">Starter Single-Building Tier</p>
                  <p className="text-[10px] text-gray-500">18 Accounts · Basic Ticketing &amp; Assets</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-purple-600">₹50,000/mo</p>
                  <span className="text-[9px] font-bold text-purple-600">13.2% of MRR</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Net Churn (Q3): <strong>0.8%</strong></span>
              <button
                onClick={() => setShowMrrModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

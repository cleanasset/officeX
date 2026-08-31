"use client";
import React, { useState } from "react";
import { Lock, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight, Download, RefreshCw, DollarSign } from "lucide-react";

export default function AdminEscrowControlDashboard() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const escrowStats = [
    { label: "Total Escrow Held", value: "₹48.2 Lakhs", sub: "14 Active Accounts", color: "text-blue-600" },
    { label: "Released This Month", value: "₹1.84 Crores", sub: "98.5% Auto Disbursed", color: "text-emerald-600" },
    { label: "Commission Retained", value: "₹18.4 Lakhs", sub: "10% Platform Take Rate", color: "text-purple-600" },
    { label: "Disputed / On Hold", value: "₹4.5 Lakhs", sub: "2 Disputed Milestones", color: "text-red-500" }
  ];

  const escrowAccounts = [
    { id: "ESC-8841", property: "Apex Business Tower", vendor: "TechServe MEP", amount: "₹2,18,300", milestone: "Aug 2026 Monthly AMC", nodalStatus: "Funds Held in Nodal", action: "Release" },
    { id: "ESC-8842", property: "Meridian Tech Park", vendor: "Knight FM", amount: "₹4,50,000", milestone: "Lift Modernization Phase 1", nodalStatus: "Client Approved (Ready)", action: "Release" },
    { id: "ESC-8843", property: "Godrej BKC Horizon", vendor: "SafeGuard Pro", amount: "₹3,20,000", milestone: "Security Guard Deployment", nodalStatus: "Dispute Flagged by FM", action: "Investigate" },
    { id: "ESC-8844", property: "Nexus Innovation Hub", vendor: "CleanPro Services", amount: "₹1,80,000", milestone: "Façade Deep Cleaning", nodalStatus: "Funds Released", action: "Completed" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Razorpay Nodal Escrow Controller</h1>
          <p className="text-xs text-gray-500 mt-0.5">Super Admin centralized nodal escrow ledger, split-disbursements, and dispute arbitration.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => showToast("Syncing Nodal Accounts with Razorpay...")}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <RefreshCw size={13} /> Sync Nodal
          </button>
          <button 
            onClick={() => showToast("Exported Escrow Audit Report")}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={13} /> Export Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
        {escrowStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            <div className={`text-2xl md:text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</div>
            <span className="text-[10px] font-semibold text-gray-500 mt-0.5 block">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Escrow Nodal Accounts Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-2xs w-full">
        <h2 className="text-base font-black text-gray-900 mb-4">Nodal Account Milestone Ledgers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Escrow ID</th>
                <th className="py-3 pr-3">Property</th>
                <th className="py-3 pr-3">Vendor</th>
                <th className="py-3 pr-3">Milestone Amount</th>
                <th className="py-3 pr-3">Milestone Scope</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3">Super Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {escrowAccounts.map((acc) => (
                <tr key={acc.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3 pr-3 font-mono font-bold text-[#0F8B7D]">{acc.id}</td>
                  <td className="py-3 pr-3 font-semibold text-gray-900">{acc.property}</td>
                  <td className="py-3 pr-3 text-gray-600">{acc.vendor}</td>
                  <td className="py-3 pr-3 font-black text-gray-900">{acc.amount}</td>
                  <td className="py-3 pr-3 text-gray-500">{acc.milestone}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      acc.nodalStatus.includes("Dispute")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : acc.nodalStatus.includes("Released")
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {acc.nodalStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    {acc.action === "Release" ? (
                      <button 
                        onClick={() => showToast(`Disbursed ${acc.amount} to ${acc.vendor}!`)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-xs cursor-pointer"
                      >
                        Authorize Payout
                      </button>
                    ) : acc.action === "Investigate" ? (
                      <button 
                        onClick={() => showToast(`Opened Dispute Arbitration Room for ${acc.id}`)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] shadow-xs cursor-pointer"
                      >
                        Arbitrate Dispute
                      </button>
                    ) : (
                      <span className="text-gray-400 font-bold text-[10px]">✓ Disbursed</span>
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

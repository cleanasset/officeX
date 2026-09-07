"use client";
import React, { useState } from "react";
import {
  Plus, Search, Bell, HelpCircle, ArrowRight,
  Wrench, Wind, Shield, Sparkles, Flame, Bug, ArrowUpDown, Trees,
  Clock, CheckCircle, FileText, AlertTriangle, Eye
} from "lucide-react";
import Link from "next/link";

export default function MarketplaceHome() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const serviceCategories = [
    { name: "MEP", vendors: 42, icon: Wrench, color: "bg-teal-50 text-teal-600" },
    { name: "HVAC", vendors: 38, icon: Wind, color: "bg-blue-50 text-blue-600" },
    { name: "Security", vendors: 65, icon: Shield, color: "bg-amber-50 text-amber-600" },
    { name: "Housekeeping", vendors: 80, icon: Sparkles, color: "bg-purple-50 text-purple-600" },
    { name: "Fire Safety", vendors: 25, icon: Flame, color: "bg-red-50 text-red-600" },
    { name: "Pest Control", vendors: 30, icon: Bug, color: "bg-green-50 text-green-600" },
    { name: "Lifts", vendors: 18, icon: ArrowUpDown, color: "bg-indigo-50 text-indigo-600" },
    { name: "Landscaping", vendors: 22, icon: Trees, color: "bg-emerald-50 text-emerald-600" }
  ];

  const activeRfqs = [
    { id: "RFQ-2025-012", title: "Annual HVAC AMC", category: "HVAC", quotes: "5 Quotes", deadline: "15 Feb 2025", status: "Open" },
    { id: "RFQ-2025-009", title: "Pest Control Services", category: "Pest Control", quotes: "8 Quotes", deadline: "10 Feb 2025", status: "Evaluating" },
    { id: "RFQ-2025-004", title: "Security Guard Deployment", category: "Security", quotes: "12 Quotes", deadline: "28 Jan 2025", status: "Awarded" },
    { id: "RFQ-2025-015", title: "Lobby Cleaning Scope", category: "Housekeeping", quotes: "2 Quotes", deadline: "20 Feb 2025", status: "Open" },
    { id: "RFQ-2025-001", title: "Lift Modernization Phase 1", category: "Lifts", quotes: "4 Quotes", deadline: "05 Jan 2025", status: "Closed" },
    { id: "RFQ-2025-018", title: "Fire Alarm Panel Upgrade", category: "Fire Safety", quotes: "1 Quote", deadline: "25 Feb 2025", status: "Open" }
  ];

  const recentActivity = [
    { text: "New bid submitted by Knight FM for HVAC AMC", time: "2 hours ago", color: "bg-emerald-500" },
    { text: "Vendor 'SafeGuard Pro' verified", time: "5 hours ago", color: "bg-blue-500" },
    { text: "Milestone payout released for Security Services", time: "Yesterday", color: "bg-teal-500" },
    { text: "New RFQ published: Elevator Modernization", time: "2 days ago", color: "bg-gray-400" }
  ];

  const statusStyle = (s: string) => {
    switch (s) {
      case "Open": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Evaluating": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Awarded": return "bg-teal-50 text-teal-700 border border-teal-200";
      case "Closed": return "bg-gray-100 text-gray-600 border border-gray-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">FM Marketplace Portal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Source certified vendors, manage RFQ bids, and track milestone disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fm-marketplace/rfq/create"
            className="flex items-center gap-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Create RFQ</span>
          </Link>
          <Link
            href="/fm-marketplace/quotes"
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <span>Compare Quotes</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active RFQs", value: "6", change: "+2 this week", positive: true },
          { label: "Verified Vendors", value: "312", change: "Across 8 categories", positive: true },
          { label: "Bids in Review", value: "19", change: "4 pending your action", positive: false },
          { label: "Escrow Protected", value: "₹48.2L", change: "Safe settlement", positive: true }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            <p className={`text-[11px] font-semibold mt-1 ${stat.positive ? "text-emerald-600" : "text-amber-600"}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Service Categories */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Browse Service Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {serviceCategories.map((cat, i) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={i}
                onClick={() => showToast(`Filtering for ${cat.name} vendors...`)}
                className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-[#0F8B7D] hover:shadow-md transition-all group text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  <IconComponent size={20} />
                </div>
                <span className="text-xs font-bold text-gray-800">{cat.name}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{cat.vendors} vendors</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active RFQs Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Active Requests for Quotation (RFQs)</h2>
            <Link href="/fm-marketplace/rfq" className="text-xs text-[#0F8B7D] font-bold hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">RFQ ID / Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Bids</th>
                  <th className="pb-3 font-semibold">Deadline</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3">
                      <p className="font-bold text-gray-900">{rfq.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{rfq.id}</p>
                    </td>
                    <td className="py-3 font-semibold text-gray-600">{rfq.category}</td>
                    <td className="py-3 font-bold text-gray-800">{rfq.quotes}</td>
                    <td className="py-3 text-gray-500 font-medium">{rfq.deadline}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/fm-marketplace/rfq/${rfq.id}`}
                        className="text-gray-400 hover:text-[#0F8B7D] transition-colors p-1"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Marketplace Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.color}`} />
                  <div>
                    <p className="text-xs text-gray-700 font-medium leading-tight">{act.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-800 text-xs font-bold mb-1">
              <Shield size={14} className="text-[#0F8B7D]" />
              <span>Escrow Settlement Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vendor payments are held securely and released only on inspection sign-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

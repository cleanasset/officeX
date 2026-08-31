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
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* 3 Action Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full">
        <Link href="/marketplace/create-rfq" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] p-5 md:p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base md:text-lg font-bold">Create RFQ</h3>
              <p className="text-xs text-white/80 mt-0.5">Start a new request</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Plus size={18} />
            </div>
          </div>
        </Link>
        <Link href="/marketplace/ratings" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D7A6E] to-[#0F8B7D] p-5 md:p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base md:text-lg font-bold">Browse Vendors</h3>
              <p className="text-xs text-white/80 mt-0.5">Find pre-vetted partners</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Search size={18} />
            </div>
          </div>
        </Link>
        <Link href="/marketplace/work-orders" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] p-5 md:p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base md:text-lg font-bold">Active Work Orders</h3>
              <p className="text-xs text-white/80 mt-0.5">Track ongoing jobs</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
          </div>
        </Link>
      </div>

      {/* 4 KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active RFQs</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">12</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quotes Received</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">34</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Orders</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">8</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marketplace GTV</p>
          <p className="text-2xl md:text-3xl font-black text-[#0F8B7D] mt-1">₹28.5L</p>
        </div>
      </div>

      {/* Service Categories - Responsive Grid */}
      <div className="w-full">
        <h2 className="text-base md:text-lg font-black text-gray-900 mb-3 md:mb-4">Service Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-white rounded-2xl border border-gray-200 p-3 md:p-4 flex items-center gap-2.5 md:gap-3 hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-bold text-gray-900 truncate">{cat.name}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{cat.vendors} Vendors</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Active RFQs Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-gray-900 text-sm md:text-base">Active RFQs</h3>
            <Link href="/marketplace/rfq" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                  <th className="pb-2.5">RFQ ID</th>
                  <th className="pb-2.5">Title</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Quotes</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono font-bold text-[#0F8B7D]">{rfq.id}</td>
                    <td className="py-3 font-semibold text-gray-900">{rfq.title}</td>
                    <td className="py-3 text-gray-500">{rfq.category}</td>
                    <td className="py-3 font-bold text-gray-700">{rfq.quotes}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${statusStyle(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-2xs">
          <h3 className="font-black text-gray-900 text-sm md:text-base mb-4">Marketplace Activity</h3>
          <div className="space-y-3.5">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.color}`} />
                <div>
                  <p className="text-gray-800 font-semibold text-xs leading-snug">{act.text}</p>
                  <span className="text-[10px] text-gray-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

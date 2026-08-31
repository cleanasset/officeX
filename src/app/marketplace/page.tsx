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
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* 3 Action Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/marketplace/create-rfq" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Create RFQ</h3>
              <p className="text-xs text-white/80 mt-1">Start a new request</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus size={20} />
            </div>
          </div>
        </Link>
        <Link href="/marketplace/ratings" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D7A6E] to-[#0F8B7D] p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Browse Vendors</h3>
              <p className="text-xs text-white/80 mt-1">Find pre-vetted partners</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Search size={20} />
            </div>
          </div>
        </Link>
        <Link href="/marketplace/work-orders" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] p-6 text-white hover:shadow-lg transition-all group cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Active Work Orders</h3>
              <p className="text-xs text-white/80 mt-1">Track ongoing jobs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
        </Link>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active RFQs</p>
          <p className="text-3xl font-black text-gray-900 mt-1">12</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quotes Received</p>
          <p className="text-3xl font-black text-gray-900 mt-1">34</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Work Orders</p>
          <p className="text-3xl font-black text-gray-900 mt-1">8</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GTV</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹28.5L</p>
        </div>
      </div>

      {/* Service Categories */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Service Categories</h2>
        <div className="grid grid-cols-4 gap-3">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.vendors} Vendors</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active RFQs Table + Recent Activity */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Active RFQs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Active RFQs</h2>
            <Link href="/marketplace/rfq" className="text-xs font-semibold text-[#0F8B7D] hover:underline">View All</Link>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">RFQ ID</th>
                <th className="py-3 pr-3">Title</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Quotes</th>
                <th className="py-3 pr-3">Deadline</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeRfqs.map((rfq) => (
                <tr key={rfq.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 pr-3 font-bold text-gray-500">{rfq.id}</td>
                  <td className="py-3.5 pr-3 font-bold text-gray-900">{rfq.title}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{rfq.category}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{rfq.quotes}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{rfq.deadline}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="flex flex-col gap-5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

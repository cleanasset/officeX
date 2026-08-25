import React from "react";
import { Briefcase, ClipboardList, DollarSign, Sparkles } from "lucide-react";
import Link from "next/link";

export default function VendorDashboard() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Portal</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">Matched RFQs, quote submissions, and invoice payouts tracker.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendor/rfqs" className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-colors">
            Browse Matched RFQs
          </Link>
        </div>
      </div>

      {/* KPI BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Matched RFQs</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">4</div>
            <span className="text-[10px] text-[#10B981] font-bold mt-1 inline-block">🟢 Matching Categories</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Work Orders</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">3</div>
            <span className="text-[10px] text-blue-500 font-bold mt-1 inline-block">1 milestone ending soon</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Invoices & Payouts</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">₹1.8L</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">₹45k released yesterday</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Average Rating</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">4.8</div>
            <span className="text-[10px] text-yellow-500 font-bold mt-1 inline-block">⭐⭐⭐⭐⭐ Excellent</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Active Jobs Progress Panel */}
      <div className="premium-card p-6 border border-gray-100 bg-white">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList size={18} className="text-emerald-600" />
          Active Work Orders & Logs Status
        </h3>
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-gray-900">HVAC Maintenance — Apex Business Tower</div>
              <div className="text-gray-400 mt-1">Milestone 2/3 (Chiller verification) - Due in 3 days.</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-100 text-amber-600 font-bold">In Progress</span>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-gray-900">Weekly Deep Cleaning — Meridian Tech Park</div>
              <div className="text-gray-400 mt-1">Milestone 1/1 completed - Awaiting validation from facility lead.</div>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-blue-600 font-bold">Review Pending</span>
          </div>
        </div>
      </div>

    </div>
  );
}

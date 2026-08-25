import React from "react";
import { db } from "@/db";
import { rfqs, quotations, workOrders } from "@/db/schema";
import { Layers, FileText, ClipboardList, DollarSign, Sparkles } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function MarketplaceDashboard() {
  const activeRfqs = await db.select().from(rfqs);
  const activeQuotes = await db.select().from(quotations);
  const activeOrders = await db.select().from(workOrders);

  const openRfqsCount = activeRfqs.filter(r => r.status === "open").length;
  const pendingBidsCount = activeQuotes.filter(q => q.status === "submitted").length;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FM Marketplace</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">Vendor bidding, quotation comparisons, and escrow payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/marketplace/rfq" className="px-4 py-2.5 rounded-xl bg-primary-teal hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-colors">
            Post RFQ
          </Link>
        </div>
      </div>

      {/* KPI BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active RFQs</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{openRfqsCount}</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">🟢 Open for Bidding</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-primary-teal">
            <Layers size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bids Received</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{pendingBidsCount}</div>
            <span className="text-[10px] text-teal-500 font-bold mt-1 inline-block">5 new quotes today</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Orders</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{activeOrders.length}</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">100% SLA compliant</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Escrow Balance</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">₹4.2L</div>
            <span className="text-[10px] text-teal-500 font-bold mt-1 inline-block">Razorpay Escrow Secure</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* RFQ Directory Grid */}
      <div className="premium-card p-6 border border-gray-100 bg-white">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Layers size={18} className="text-primary-teal" />
          Recent Bidding Pipelines
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4">RFQ Title</th>
                <th className="py-4">Category</th>
                <th className="py-4">Manpower</th>
                <th className="py-4">Deadline</th>
                <th className="py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRfqs.map((rfq, idx) => (
                <tr key={idx} className="border-b border-gray-100 text-xs hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-bold text-gray-900">{rfq.title}</td>
                  <td className="py-4 text-gray-500">{rfq.category}</td>
                  <td className="py-4 text-gray-500 font-medium">{rfq.manpowerRequired || "N/A"} Persons</td>
                  <td className="py-4 text-gray-400">{new Date(rfq.quoteDeadline).toLocaleDateString()}</td>
                  <td className="py-4">
                    <Link href={`/marketplace/compare?rfq=${rfq.id}`} className="px-3.5 py-1.5 rounded-lg border border-teal-200 text-primary-teal font-semibold hover:bg-teal-50 transition-colors">
                      Compare Bids
                    </Link>
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

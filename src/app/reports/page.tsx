"use client";
import React from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function FinancialAnalyticsDashboard() {
  const transactions = [
    { id: "TX-102", client: "KPMG", property: "Apex Tower", rent: "₹1.25L", rate: "10%", fee: "₹12,500", invoice: "INV-2025-045", status: "Paid" },
    { id: "TX-098", client: "Deloitte", property: "Crystal Tower", rent: "₹1.10L", rate: "10%", fee: "₹11,000", invoice: "INV-2025-042", status: "Pending" },
    { id: "TX-089", client: "Wipro", property: "Meridian Park", rent: "₹72K", rate: "10%", fee: "₹7,200", invoice: "INV-2025-038", status: "Paid" },
    { id: "TX-075", client: "TCS", property: "Apex Tower", rent: "₹2.10L", rate: "8.5%", fee: "₹17,850", invoice: "INV-2025-031", status: "Paid" },
    { id: "TX-062", client: "HDFC", property: "Orion Park", rent: "₹1.85L", rate: "10%", fee: "₹18,500", invoice: "INV-2025-025", status: "Overdue" },
    { id: "TX-055", client: "Zomato", property: "Summit One", rent: "₹95K", rate: "10%", fee: "₹9,500", invoice: "INV-2025-022", status: "Paid" }
  ];

  const statusStyle = (s: string) => s === "Paid" ? "bg-emerald-50 text-emerald-700" : s === "Pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Total TCV</p><p className="text-3xl font-black text-gray-900">₹2.4Cr</p><span className="text-[10px] font-bold text-emerald-600">↗+12.5%</span></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Marketplace Comms (10%)</p><p className="text-3xl font-black text-gray-900">₹24L</p><span className="text-[10px] font-bold text-emerald-600">↗+8.2%</span></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Brokerage Comm</p><p className="text-3xl font-black text-gray-900">₹12.6L</p><span className="text-[10px] text-gray-500">→0.0%</span></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Sub MRR</p><p className="text-3xl font-black text-gray-900">₹3.8L</p><span className="text-[10px] font-bold text-emerald-600">↗+4.1%</span></div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Revenue Trend</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-[10px]"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Monthly GTV</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F8B7D]" /> Commissions Earned</span></div>
            <select className="px-3 py-1 rounded-lg border border-gray-200 text-xs"><option>Last 12 Months</option></select>
          </div>
        </div>
        <div className="h-48 relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 w-8">
            <span>₹4M</span><span>₹3M</span><span>₹2M</span><span>₹1M</span><span>₹0</span>
          </div>
          <div className="ml-10 h-full flex items-end gap-1">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 rounded-t relative" style={{ height: `${20 + i * 12 + Math.random() * 20}px` }}>
                  <div className="absolute bottom-0 w-full bg-[#0F8B7D]/30 rounded-t" style={{ height: `${10 + i * 5}px` }} />
                </div>
                <span className="text-[8px] text-gray-400 mt-1">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Commission Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Platform Commission Ledger</h2>
          <div className="flex gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search invoices..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-44" /></div>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer"><Filter size={14} /></button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Transaction ID</th><th className="py-3 pr-3">Client</th><th className="py-3 pr-3">Property</th><th className="py-3 pr-3">Total Rent Value</th><th className="py-3 pr-3">Comm. Rate</th><th className="py-3 pr-3">Fee Earned</th><th className="py-3 pr-3">Invoice No</th><th className="py-3">Status</th></tr></thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 text-xs">
                <td className="py-3.5 pr-3 font-bold text-gray-500">{t.id}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{t.client}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.property}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.rent}</td>
                <td className="py-3.5 pr-3 text-gray-600">{t.rate}</td>
                <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">{t.fee}</td>
                <td className="py-3.5 pr-3 text-gray-500">{t.invoice}</td>
                <td className="py-3.5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(t.status)}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Showing 1 to 6 of 42 entries</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronLeft size={14} /></button>
            <span className="w-7 h-7 rounded-lg border border-gray-900 bg-gray-900 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-center cursor-pointer">2</span>
            <span className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-center cursor-pointer">3</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

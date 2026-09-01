"use client";
import React, { useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function CommissionAndBrokerageTracker() {
  const [timeRange, setTimeRange] = useState("Last 6 Months");
  const [search, setSearch] = useState("");

  const deals = [
    {
      id: "#DL-4921",
      client: "KPMG",
      property: "Embassy Tech Village, BLR",
      tcv: "₹1.2Cr",
      rate: "2.0%",
      fee: "₹2.4L",
      invoice: "INV-2023-081",
      date: "12 Oct 2023",
      status: "PAID",
      statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: "#DL-4890",
      client: "Deloitte",
      property: "RMZ Infinity, BLR",
      tcv: "₹85L",
      rate: "1.5%",
      fee: "₹1.27L",
      invoice: "INV-2023-075",
      date: "05 Oct 2023",
      status: "PAID",
      statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: "#DL-4955",
      client: "Freshworks",
      property: "Ramanujan IT City, CHN",
      tcv: "₹2.1Cr",
      rate: "2.0%",
      fee: "₹4.2L",
      invoice: "-",
      date: "Pending",
      status: "PENDING",
      statusColor: "bg-amber-50 text-amber-700 border border-amber-200"
    },
    {
      id: "#DL-4812",
      client: "Wipro",
      property: "Sarjapur Campus, BLR",
      tcv: "₹1.5Cr",
      rate: "1.8%",
      fee: "₹2.7L",
      invoice: "INV-2023-062",
      date: "15 Sep 2023",
      status: "PAID",
      statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: "#DL-4988",
      client: "TCS",
      property: "Mindspace, HYD",
      tcv: "₹3.0Cr",
      rate: "1.5%",
      fee: "₹4.5L",
      invoice: "INV-2023-085",
      date: "20 Oct 2023",
      status: "PENDING",
      statusColor: "bg-amber-50 text-amber-700 border border-amber-200"
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Commission & Brokerage Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track brokerage revenues, pipeline commissions, and invoice statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Year to Date</option>
          </select>
        </div>
      </div>

      {/* Top Metrics Row: KPIs on left + Revenue Trend Chart on right */}
      <div className="grid grid-cols-[380px_1fr] gap-6">
        {/* Left 4-card metric stack */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL TCV</span>
              <span className="text-gray-400">💳</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-3xl font-black text-gray-900">₹2.4Cr</p>
              <span className="text-xs font-bold text-emerald-600">▲ +12% YoY</span>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COMMISSION EARNED</span>
              <span className="text-gray-400">🪙</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-3xl font-black text-gray-900">₹12.6L</p>
              <span className="text-xs font-bold text-emerald-600">▲ +8% MoM</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COLLECTED</p>
            <p className="text-xl font-black text-emerald-600 mt-1">₹9.8L</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OUTSTANDING</p>
            <p className="text-xl font-black text-amber-500 mt-1">₹2.8L</p>
          </div>
        </div>

        {/* Right Revenue Trend (6 Months) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Revenue Trend (6 Months)</h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Brokerage</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Collected</span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-4 px-4 pt-2">
            {[
              { m: "Jan", b: 40, c: 55 },
              { m: "Feb", b: 35, c: 60 },
              { m: "Mar", b: 50, c: 75 },
              { m: "Apr", b: 30, c: 50 },
              { m: "May", b: 48, c: 80 },
              { m: "Jun", b: 38, c: 80 }
            ].map((bar) => (
              <div key={bar.m} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full max-w-[42px] flex flex-col-reverse rounded-t overflow-hidden" style={{ height: "130px" }}>
                  <div className="w-full bg-emerald-500" style={{ height: `${bar.c}px` }} />
                  <div className="w-full bg-blue-600" style={{ height: `${bar.b}px` }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">{bar.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Commission Ledger</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D] w-52"
              />
            </div>
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Filter size={13} /> Filter
            </button>
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3">DEAL REF</th>
                <th className="py-3">CLIENT</th>
                <th className="py-3">PROPERTY</th>
                <th className="py-3">TOTAL TCV</th>
                <th className="py-3">RATE (%)</th>
                <th className="py-3">COMMISSION FEE</th>
                <th className="py-3">INVOICE NO</th>
                <th className="py-3">DATE ISSUED</th>
                <th className="py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-4 font-mono font-bold text-blue-600">{d.id}</td>
                  <td className="py-4 font-bold text-gray-900">{d.client}</td>
                  <td className="py-4 text-gray-600">{d.property}</td>
                  <td className="py-4 font-semibold text-gray-900">{d.tcv}</td>
                  <td className="py-4 text-gray-600">{d.rate}</td>
                  <td className="py-4 font-bold text-gray-900">{d.fee}</td>
                  <td className="py-4 font-mono text-gray-500">{d.invoice}</td>
                  <td className="py-4 text-gray-500">{d.date}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${d.statusColor}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <p className="text-xs text-gray-400">Showing 1 to 5 of 24 entries</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">2</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

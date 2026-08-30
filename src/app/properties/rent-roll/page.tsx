"use client";
import React, { useState } from "react";
import { Search, CheckCircle, TrendingUp, DollarSign, Calendar, AlertTriangle, FileText, Download, Building, ShieldCheck } from "lucide-react";

export default function RentRollRegistry() {
  const [selectedTab, setSelectedTab] = useState<"rentroll" | "forecast" | "pnl" | "aging">("rentroll");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const leases = [
    {
      leaseId: "LEASE-001",
      tenant: "Tata Consultancy Services",
      property: "Apex BKC, Tower B",
      unit: "Floor 4, Unit 4A",
      area: 25000,
      baseRent: "₹3,80,000",
      camRate: "₹18/sqft (₹4,50,000)",
      gst: "₹1,49,400",
      totalMonthly: "₹9,79,400",
      deposit: "₹29,38,200 (3 Mos)",
      escalationDue: "01-Sep-2026 (+5%)",
      expiryDate: "31-Aug-2029",
      status: "Active"
    },
    {
      leaseId: "LEASE-002",
      tenant: "Wipro Digital Solutions",
      property: "Meridian Whitefield",
      unit: "Floor 2, Wing A",
      area: 12000,
      baseRent: "₹1,80,000",
      camRate: "₹16/sqft (₹1,92,000)",
      gst: "₹66,960",
      totalMonthly: "₹4,38,960",
      deposit: "₹13,16,880 (3 Mos)",
      escalationDue: "15-Oct-2026 (+7%)",
      expiryDate: "14-Oct-2028",
      status: "Active"
    },
    {
      leaseId: "LEASE-003",
      tenant: "Freshworks Inc",
      property: "Nexus Hub Gurugram",
      unit: "Floor 5, Suite 501",
      area: 8500,
      baseRent: "₹1,45,000",
      camRate: "₹20/sqft (₹1,70,000)",
      gst: "₹56,700",
      totalMonthly: "₹3,71,700",
      deposit: "₹11,15,100 (3 Mos)",
      escalationDue: "01-Jan-2027 (+5%)",
      expiryDate: "31-Dec-2027",
      status: "Active"
    },
    {
      leaseId: "LEASE-004",
      tenant: "Deloitte Consulting",
      property: "Apex BKC, Tower A",
      unit: "Floor 8, Entire Plate",
      area: 32000,
      baseRent: "₹5,20,000",
      camRate: "₹18/sqft (₹5,76,000)",
      gst: "₹1,97,280",
      totalMonthly: "₹12,93,280",
      deposit: "₹38,79,840 (3 Mos)",
      escalationDue: "01-Nov-2026 (+5%)",
      expiryDate: "31-Oct-2030",
      status: "Active"
    }
  ];

  const forecastMonths = [
    { month: "Sep 2026", revenue: "₹30.8L", cam: "₹13.8L", total: "₹44.6L", occupancy: "92%" },
    { month: "Oct 2026", revenue: "₹31.2L", cam: "₹13.8L", total: "₹45.0L", occupancy: "92%" },
    { month: "Nov 2026", revenue: "₹31.5L", cam: "₹14.2L", total: "₹45.7L", occupancy: "94%" },
    { month: "Dec 2026", revenue: "₹31.5L", cam: "₹14.2L", total: "₹45.7L", occupancy: "94%" },
    { month: "Jan 2027", revenue: "₹32.4L", cam: "₹14.5L", total: "₹46.9L", occupancy: "96%" },
    { month: "Feb 2027", revenue: "₹32.4L", cam: "₹14.5L", total: "₹46.9L", occupancy: "96%" }
  ];

  const agingData = [
    { tenant: "Tata Consultancy Services", current: "₹9,79,400", d30: "₹0", d60: "₹0", d90: "₹0", totalDue: "₹9,79,400", risk: "Low" },
    { tenant: "Wipro Digital Solutions", current: "₹4,38,960", d30: "₹4,38,960", d60: "₹0", d90: "₹0", totalDue: "₹8,77,920", risk: "Medium" },
    { tenant: "Freshworks Inc", current: "₹3,71,700", d30: "₹0", d60: "₹0", d90: "₹0", totalDue: "₹3,71,700", risk: "Low" },
    { tenant: "Deloitte Consulting", current: "₹12,93,280", d30: "₹0", d60: "₹0", d90: "₹0", totalDue: "₹12,93,280", risk: "Low" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rent Roll Master & Lease-to-Cash SaaS</h1>
          <p className="text-xs text-gray-500 mt-1">Institutional lease management, automated contractual escalations, CAM billing & revenue forecasting.</p>
        </div>
        <button
          onClick={() => showToast("Exporting OFFICEX Rent Roll Master MIS (Excel / PDF)...")}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
        >
          <Download size={13} /> Export MIS Report
        </button>
      </div>

      {/* KPIs Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MONTHLY GROSS BILLING</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹30.83L <span className="text-xs font-normal text-gray-400">/ mo</span></p>
          <p className="text-[11px] text-teal-700 font-bold mt-1">Rent: ₹12.25L • CAM: ₹13.88L • GST: ₹4.70L</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY DEPOSITS HELD</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹92.50L</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">100% Escrow & Bank Guaranteed</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PORTFOLIO OCCUPANCY</p>
          <p className="text-3xl font-black text-gray-900 mt-1">94.2%</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">77,500 / 82,300 sq.ft. leased</p>
        </div>

        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs bg-amber-50/30">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">UPCOMING ESCALATIONS (&lt;90D)</p>
          <p className="text-3xl font-black text-amber-900 mt-1">3 Leases</p>
          <p className="text-[11px] text-amber-700 font-bold mt-1">+5% to +7% contractual uplift</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex gap-2 shadow-xs w-fit">
        {[
          { id: "rentroll", label: "Active Rent Roll Master" },
          { id: "forecast", label: "12-Month Revenue Forecast" },
          { id: "pnl", label: "Property Operating P&L" },
          { id: "aging", label: "Receivables Aging Ledger" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id as any)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === t.id
                ? "bg-[#0F8B7D] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Active Rent Roll Master */}
      {selectedTab === "rentroll" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Authoritative Lease-to-Cash Ledger</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search leases, tenants..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-64" />
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">LEASE & TENANT</th>
                  <th className="py-3 px-4">LOCATION & UNIT</th>
                  <th className="py-3 px-4">AREA (SQFT)</th>
                  <th className="py-3 px-4">BASE RENT</th>
                  <th className="py-3 px-4">CAM CHARGES</th>
                  <th className="py-3 px-4">GROSS BILLING</th>
                  <th className="py-3 px-4">NEXT ESCALATION</th>
                  <th className="py-3 px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => (
                  <tr key={l.leaseId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{l.tenant}</span>
                      <span className="text-[10px] text-teal-700 font-mono font-bold">{l.leaseId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <span className="font-semibold text-gray-800 block">{l.property}</span>
                      <span className="text-[10px] text-gray-400">{l.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 font-mono">{l.area.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{l.baseRent}</td>
                    <td className="py-3.5 px-4 text-gray-600 text-[11px]">{l.camRate}</td>
                    <td className="py-3.5 px-4 font-black text-gray-900">{l.totalMonthly}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-100">
                        {l.escalationDue}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 12-Month Forecast */}
      {selectedTab === "forecast" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">12-Month Rolling Revenue & Occupancy Forecast</h2>
          <div className="grid grid-cols-6 gap-3 text-xs">
            {forecastMonths.map((f) => (
              <div key={f.month} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">{f.month}</p>
                <p className="text-lg font-black text-gray-900 mt-1">{f.total}</p>
                <p className="text-[10px] text-teal-700 font-bold">Rent: {f.revenue}</p>
                <p className="text-[9px] text-gray-500">Occ: {f.occupancy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Property P&L */}
      {selectedTab === "pnl" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-gray-900">Monthly Operating Property P&L (Apex BKC Mumbai)</h2>
          <div className="space-y-2 divide-y divide-gray-100">
            <div className="flex justify-between py-2 font-bold text-gray-900">
              <span>Gross Rental Income (Base Rent)</span>
              <span>₹12,25,000</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-gray-900">
              <span>CAM & Utility Recoveries</span>
              <span>+ ₹13,88,000</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-red-600">
              <span>Direct FM Operating Expenses (Housekeeping, Security, MEP AMC)</span>
              <span>- ₹8,42,000</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-red-600">
              <span>Electricity & Diesel DG Expenses</span>
              <span>- ₹3,95,000</span>
            </div>
            <div className="flex justify-between py-3 font-black text-base text-emerald-700 border-t-2 border-gray-200">
              <span>Net Operating Income (NOI)</span>
              <span>₹13,76,000 / month (53.4% Margin)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Receivables Aging */}
      {selectedTab === "aging" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Receivables Aging & Collection Risk</h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">TENANT NAME</th>
                  <th className="py-3 px-4">CURRENT (0-30D)</th>
                  <th className="py-3 px-4">31-60 DAYS</th>
                  <th className="py-3 px-4">61-90 DAYS</th>
                  <th className="py-3 px-4">TOTAL DUE</th>
                  <th className="py-3 px-4 text-right">COLLECTION RISK</th>
                </tr>
              </thead>
              <tbody>
                {agingData.map((a) => (
                  <tr key={a.tenant} className="border-b border-gray-100">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{a.tenant}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{a.current}</td>
                    <td className="py-3.5 px-4 text-gray-600">{a.d30}</td>
                    <td className="py-3.5 px-4 text-gray-600">{a.d60}</td>
                    <td className="py-3.5 px-4 font-black text-gray-900">{a.totalDue}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.risk === "Low" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {a.risk} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

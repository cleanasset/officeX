"use client";
import React, { useState } from "react";
import { Plus, Search, Filter, CheckCircle } from "lucide-react";

export default function ManagedServicesContracts() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const kpis = [
    { label: "ACTIVE CONTRACTS", value: "8" },
    { label: "MANAGED STAFF DEPLOYED", value: "145", sub: "+12", subColor: "text-emerald-600" },
    { label: "AVERAGE SLA SCORE", value: "96.2%", bar: true },
    { label: "MONTHLY OPERATIONAL BILLING", value: "₹18.5L" }
  ];

  const contracts = [
    {
      id: "CON-045",
      client: "Tata Consultancy Services",
      property: "Apex Tower",
      scope: "MEP, Cleaning, Security",
      staff: "48 staff",
      minSla: "95.0%",
      currentSla: "96.8%",
      slaColor: "text-emerald-600 font-bold",
      status: "Active",
      stClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "CON-042",
      client: "Wipro Limited",
      property: "Meridian Park",
      scope: "HVAC, Lift Maintenance",
      staff: "22 staff",
      minSla: "95.0%",
      currentSla: "94.2%",
      slaColor: "text-amber-600 font-bold",
      status: "Under Performing",
      stClass: "bg-amber-50 text-amber-800 border-amber-200"
    },
    {
      id: "CON-039",
      client: "Infosys",
      property: "Nexus Hub",
      scope: "Hard & Soft FM complete",
      staff: "35 staff",
      minSla: "95.0%",
      currentSla: "97.5%",
      slaColor: "text-emerald-600 font-bold",
      status: "Active",
      stClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "CON-035",
      client: "Reliance Industries",
      property: "Crystal Tower",
      scope: "Security & Fire Safety",
      staff: "40 staff",
      minSla: "95.0%",
      currentSla: "95.1%",
      slaColor: "text-emerald-600 font-bold",
      status: "Active",
      stClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  ];

  const handleNewContract = () => {
    setToast("New Managed Services Contract wizard opened!");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Managed Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Operational SLA tracking and scope allocation for client facilities.</p>
        </div>
        <button
          onClick={handleNewContract}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={14} /> New Contract
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-3xl font-black text-gray-900">{k.value}</p>
              {k.sub && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {k.sub}
                </span>
              )}
              {k.bar && (
                <div className="w-16 h-4 rounded bg-emerald-500/20 flex items-center px-1">
                  <div className="w-12 h-2 rounded bg-emerald-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contract Registry Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Contract Registry</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contracts..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D] w-52"
              />
            </div>
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Filter size={13} /> Filter
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3">CONTRACT ID</th>
              <th className="py-3">CLIENT NAME</th>
              <th className="py-3">PROPERTY</th>
              <th className="py-3">SERVICE SCOPE</th>
              <th className="py-3">STAFF</th>
              <th className="py-3">MIN SLA</th>
              <th className="py-3">CURRENT SLA</th>
              <th className="py-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold text-teal-700">{c.id}</td>
                <td className="py-4 font-bold text-gray-900">{c.client}</td>
                <td className="py-4 text-gray-600">{c.property}</td>
                <td className="py-4 text-gray-600">{c.scope}</td>
                <td className="py-4 font-semibold text-gray-800">{c.staff}</td>
                <td className="py-4 text-gray-500">{c.minSla}</td>
                <td className={`py-4 ${c.slaColor}`}>{c.currentSla}</td>
                <td className="py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.stClass}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

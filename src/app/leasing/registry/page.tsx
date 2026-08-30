"use client";
import React, { useState } from "react";
import { Plus, Search, Filter, Mail, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function LeaseRegistryDashboard() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const kpis = [
    { label: "ACTIVE LEASES", value: "34", icon: "📄", iconBg: "bg-teal-50 text-teal-700" },
    { label: "EXPIRING <90 DAYS", value: "7", alert: true, icon: "📅", iconBg: "bg-red-50 text-red-600" },
    { label: "RENEWED YTD", value: "12", icon: "🔄", iconBg: "bg-blue-50 text-blue-600" },
    { label: "PORTFOLIO AREA", value: "4.5L", unit: "Sq.Ft.", icon: "📐", iconBg: "bg-indigo-50 text-indigo-600" }
  ];

  const leases = [
    { id: "LS-001", tenant: "TCS", property: "Apex Tower, BKC", floor: "5th Floor", area: "12,500", start: "01-Sep-2023" },
    { id: "LS-002", tenant: "Wipro", property: "Meridian Park", floor: "3rd Floor", area: "8,000", start: "15-Oct-2023" },
    { id: "LS-003", tenant: "Freshworks", property: "Nexus Hub", floor: "Suite 2B", area: "3,000", start: "01-Jan-2024" },
    { id: "LS-004", tenant: "Deloitte", property: "Crystal Tower", floor: "8th Floor", area: "10,000", start: "15-Jun-2023" },
    { id: "LS-005", tenant: "Accenture", property: "Summit One", floor: "Floor 1A", area: "6,500", start: "01-Mar-2024" }
  ];

  const handleInitiate = (tenant: string) => {
    setToast(`Renewal draft initiated for ${tenant}!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${k.alert ? "text-red-500 flex items-center gap-1" : "text-gray-400"}`}>
                {k.alert && "⚠"} {k.label}
              </p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {k.value} {k.unit && <span className="text-xs text-gray-400 font-normal">{k.unit}</span>}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${k.iconBg} flex items-center justify-center font-bold text-lg`}>
              {k.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Registry Table + Attention Needed Sidebar */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Registry Details Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Registry Details</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search leases..."
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
                  <th className="py-3">LEASE ID</th>
                  <th className="py-3">TENANT</th>
                  <th className="py-3">PROPERTY/UNIT</th>
                  <th className="py-3">FLOOR</th>
                  <th className="py-3">AREA (SQFT)</th>
                  <th className="py-3">START DATE</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => (
                  <tr key={l.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                    <td className="py-4 font-mono font-bold text-blue-600">{l.id}</td>
                    <td className="py-4 font-bold text-gray-900">{l.tenant}</td>
                    <td className="py-4 text-gray-600">{l.property}</td>
                    <td className="py-4 text-gray-600">{l.floor}</td>
                    <td className="py-4 font-semibold text-gray-900">{l.area}</td>
                    <td className="py-4 text-gray-500">{l.start}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <p className="text-xs text-gray-400">Showing 5 of 34 leases</p>
            <div className="flex gap-1">
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400"><ChevronLeft size={14} /></button>
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Attention Needed Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-500 font-bold">❗</span>
              <h2 className="text-base font-bold text-gray-900">Attention Needed</h2>
            </div>

            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-gray-900">Deloitte (LS-004)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">EXPIRED</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Crystal Tower, 8th Floor</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInitiate("Deloitte")}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                  >
                    Initiate Draft
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                    <Mail size={14} />
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-gray-900">Wipro (LS-002)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">45 DAYS</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Meridian Park, 3rd Floor</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInitiate("Wipro")}
                    className="flex-1 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold"
                  >
                    Initiate Draft
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                    <Mail size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button className="text-xs font-bold text-blue-600 text-center hover:underline pt-4">
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  );
}

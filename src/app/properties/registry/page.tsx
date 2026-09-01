"use client";
import React, { useState } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyMasterRegistry() {
  const [selectedProp, setSelectedProp] = useState<string | null>("PR-001");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Floor Plan Matrix");

  const properties = [
    { id: "PR-001", name: "Apex Business Tower", type: "Office", location: "BKC, Mumbai", area: "25,000", occupied: 12, vacant: 2, occPct: 86, color: "bg-[#0F8B7D]" },
    { id: "PR-002", name: "Meridian Tech Park", type: "Office", location: "Whitefield, Bengaluru", area: "18,000", occupied: 8, vacant: 4, occPct: 67, color: "bg-[#0F8B7D]" },
    { id: "PR-003", name: "Nexus Hub", type: "Coworking", location: "Hinjewadi, Pune", area: "12,000", occupied: 15, vacant: 0, occPct: 100, color: "bg-[#0F8B7D]" },
    { id: "PR-004", name: "Crystal Tower", type: "Retail", location: "OMR, Chennai", area: "15,000", occupied: 6, vacant: 3, occPct: 67, color: "bg-amber-500" }
  ];

  return (
    <div className="flex gap-6 font-sans relative">
      {/* Table Side */}
      <div className={`flex-1 flex flex-col gap-6 ${selectedProp ? "mr-[400px]" : ""}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Property Registry</h1>
            <p className="text-sm text-gray-500 mt-1">Master catalog of all managed real estate assets.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm">
            <Plus size={14} /> Add Property
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-purple-600"
          />
        </div>

        {/* Master Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">PROPERTY ID</th>
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4">TOTAL AREA</th>
                  <th className="py-3 px-4">OCCUPIED</th>
                  <th className="py-3 px-4">VACANT</th>
                  <th className="py-3 px-6">OCCUPANCY</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProp(p.id)}
                    className={`border-b border-gray-100 text-xs hover:bg-gray-50/50 cursor-pointer ${
                      selectedProp === p.id ? "bg-purple-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-mono text-gray-500">{p.id}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-4 px-4 text-gray-600">{p.type}</td>
                    <td className="py-4 px-4 text-gray-600">{p.location}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{p.area} sqft</td>
                    <td className="py-4 px-4 text-gray-700">{p.occupied}</td>
                    <td className="py-4 px-4 text-gray-700">{p.vacant}</td>
                    <td className="py-4 px-6">
                      <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.occPct}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing 1 to 4 of 4 properties</p>
            <div className="flex gap-1">
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400"><ChevronLeft size={14} /></button>
              <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Details Drawer */}
      {selectedProp && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-base font-bold text-gray-900">Apex Business Tower</h2>
              <button onClick={() => setSelectedProp(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2 mb-4 text-xs font-bold text-gray-500">
              {["Overview", "Floor Plan Matrix", "Linked Tenants", "Documents"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2 transition-all ${
                    tab === t ? "text-purple-600 border-b-2 border-purple-600" : "hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">Floors</span><span className="font-bold text-gray-800">14 Storeys + 2 Basements</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Leasable</span><span className="font-bold text-gray-800">25,000 sq ft</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Current Occupancy</span><span className="font-bold text-emerald-600">86% (12 Active Units)</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Property Grade</span><span className="font-bold text-purple-700">Grade A+ Commercial</span></div>
              </div>

              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Allocations</h3>
              <div className="space-y-2">
                <div className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div><p className="font-bold text-gray-900">Floor 5 - Unit 5A</p><p className="text-[10px] text-gray-400">Tenant: TCS • 8,500 sqft</p></div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Occupied</span>
                </div>
                <div className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div><p className="font-bold text-gray-900">Floor 5 - Unit 5B</p><p className="text-[10px] text-gray-400">Tenant: Wipro • 4,000 sqft</p></div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Occupied</span>
                </div>
                <div className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div><p className="font-bold text-gray-900">Floor 6 - Unit 6A</p><p className="text-[10px] text-gray-400">Vacant • 3,200 sqft</p></div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">Vacant</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold mt-4 shadow-sm">
            Manage Property Units
          </button>
        </div>
      )}
    </div>
  );
}

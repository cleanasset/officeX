"use client";
import React, { useState } from "react";
import { X, Search, Filter, Download, ExternalLink } from "lucide-react";

export default function AssetRegistryDashboard() {
  const [selected, setSelected] = useState<string | null>("AST-001");

  const assets = [
    { id: "AST-001", name: "DG Set 500KVA", category: "MEP", property: "Apex Tower", location: "Basement", install: "12-Aug-2019", warranty: "11-Aug (Expired)" },
    { id: "AST-002", name: "Daikin Chiller 100TR", category: "HVAC", property: "Meridian Park", location: "Terrace", install: "05-Jan-2021", warranty: "04-Jan-2026" },
    { id: "AST-003", name: "Schindler Passenger Lift", category: "Lifts", property: "Apex Tower", location: "Lift Shaft", install: "20-Feb-2019", warranty: "19-Feb-2024" },
    { id: "AST-004", name: "VRV Unit Outdoor", category: "HVAC", property: "Crystal Tower", location: "Roof", install: "10-Mar-2022", warranty: "09-Mar-2027" },
    { id: "AST-005", name: "Fire Pump 75HP", category: "Fire Safety", property: "Apex Tower", location: "Pump Room", install: "15-Jun-2020", warranty: "14-Jun-2025" },
    { id: "AST-006", name: "STP Blower", category: "Plumbing", property: "Meridian Park", location: "STP Area", install: "22-Jul-2021", warranty: "21-Jul-2026" }
  ];

  return (
    <div className="flex font-sans relative">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col gap-6 ${selected ? "mr-[400px]" : ""}`}>
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Total Assets Tracked</p><p className="text-3xl font-black text-gray-900">156</p></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Under Warranty</p><p className="text-3xl font-black text-gray-900">89</p></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">AMC Active</p><p className="text-3xl font-black text-gray-900">112</p></div>
          <div className="bg-white rounded-2xl border border-red-200 p-5"><p className="text-[10px] font-bold text-gray-400 uppercase">Needs Service</p><p className="text-3xl font-black text-gray-900">8</p></div>
        </div>

        {/* Asset Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Digital Asset Registry</h2>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer"><Filter size={14} /></button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">Asset ID</th><th className="py-3 pr-3">Asset Name</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Property</th><th className="py-3 pr-3">Location</th><th className="py-3 pr-3">Install Date</th><th className="py-3">Warranty Expiry</th></tr></thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a.id)} className={`border-b border-gray-100 text-xs cursor-pointer ${selected === a.id ? "bg-teal-50/30" : "hover:bg-gray-50/50"}`}>
                  <td className="py-3.5 pr-3 font-bold text-gray-500">{a.id}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{a.name}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{a.category}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{a.property}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{a.location}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{a.install}</td>
                  <td className={`py-3.5 text-xs font-semibold ${a.warranty.includes("Expired") ? "text-red-500" : "text-gray-600"}`}>{a.warranty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-sm font-bold text-[#0F8B7D]">AST-001</p><p className="text-base font-bold text-gray-900">DG Set 500KVA</p><p className="text-xs text-gray-500">Cummins Power</p></div>
            <button onClick={() => setSelected(null)} className="text-gray-400 cursor-pointer"><X size={18} /></button>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Specifications</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Model No:</span><span className="font-bold">#C500D5</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fuel Type:</span><span className="font-bold">HSD</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tank Capacity:</span><span className="font-bold">990L</span></div>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Warranty Status</h3>
          <div className="border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-red-500">⚠ Expired - 11 Aug 2024</span>
            <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer">View Certificate PDF <ExternalLink size={10} /></button>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">AMC Details</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-900">TechServe Solutions</p>
            <p className="text-[10px] text-gray-500 mb-2">Valid till Aug 2025</p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-xs text-gray-700">Terms: 24/7 breakdown support, Quarterly PPM.</div>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Maintenance Logs</h3>
          <div className="space-y-3 mb-6">
            <div className="flex gap-3"><span className="w-2.5 h-2.5 rounded-full bg-[#0F8B7D] mt-1" /><div><p className="text-xs font-bold text-gray-900">28-May-2024</p><p className="text-[10px] text-gray-600">Quarterly PPM completed. Oil and filters changed.</p></div></div>
            <div className="flex gap-3"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 mt-1" /><div><p className="text-xs font-bold text-gray-900">15-Feb-2024</p><p className="text-[10px] text-gray-600">Emergency breakdown call. Fuel line airlock cleared.</p></div></div>
            <div className="flex gap-3"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 mt-1" /><div><p className="text-xs font-bold text-gray-900">20-Nov-2023</p><p className="text-[10px] text-gray-600">Quarterly PPM completed. Battery check performed.</p></div></div>
          </div>

          <button className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1">
            <Download size={13} /> Download Maintenance Report
          </button>
        </div>
      )}
    </div>
  );
}

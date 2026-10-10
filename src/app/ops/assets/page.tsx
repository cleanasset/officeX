"use client";
import React, { useState } from "react";
import { X, Search, Filter, Download, ExternalLink, Wrench } from "lucide-react";

export default function AssetRegistryDashboard() {
  const [selected, setSelected] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);

  return (
    <div className="flex font-sans relative">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col gap-6 ${selected ? "mr-[400px]" : ""}`}>
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Assets Tracked</p>
            <p className="text-3xl font-black text-gray-900">{assets.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Under Warranty</p>
            <p className="text-3xl font-black text-gray-900">
              {assets.filter((a) => !a.warranty?.includes("Expired")).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">AMC Active</p>
            <p className="text-3xl font-black text-gray-900">{assets.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Needs Service</p>
            <p className="text-3xl font-black text-gray-900">0</p>
          </div>
        </div>

        {/* Asset Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Digital Asset Registry</h2>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer">
              <Filter size={14} />
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Asset ID</th>
                <th className="py-3 pr-3">Asset Name</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Property</th>
                <th className="py-3 pr-3">Location</th>
                <th className="py-3 pr-3">Install Date</th>
                <th className="py-3">Warranty Expiry</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Wrench className="w-7 h-7 text-gray-300" />
                      <span className="text-xs font-bold text-gray-700">No Building Equipment or Assets Registered</span>
                      <span className="text-[11px] text-gray-400">
                        Register central chillers, DG sets, passenger elevators, and fire pumps for IoT telemetry and scheduled maintenance.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`border-b border-gray-100 text-xs cursor-pointer ${
                      selected?.id === a.id ? "bg-teal-50/30" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="py-3.5 pr-3 font-bold text-gray-500">{a.id}</td>
                    <td className="py-3.5 pr-3 font-semibold text-gray-900">{a.name}</td>
                    <td className="py-3.5 pr-3 text-gray-600">{a.category}</td>
                    <td className="py-3.5 pr-3 text-gray-600">{a.property}</td>
                    <td className="py-3.5 pr-3 text-gray-600">{a.location}</td>
                    <td className="py-3.5 pr-3 text-gray-600">{a.install}</td>
                    <td
                      className={`py-3.5 text-xs font-semibold ${
                        a.warranty?.includes("Expired") ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {a.warranty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#0F8B7D]">{selected.id}</p>
              <p className="text-base font-bold text-gray-900">{selected.name}</p>
              <p className="text-xs text-gray-500">{selected.property}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Specifications</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span className="font-bold">{selected.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span className="font-bold">{selected.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Install Date:</span>
              <span className="font-bold">{selected.install}</span>
            </div>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Warranty Status</h3>
          <div className="border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">{selected.warranty}</span>
            <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer">
              View Certificate PDF <ExternalLink size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

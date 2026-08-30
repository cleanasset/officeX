"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";

export default function LeadsEnquiriesManager() {
  const [selectedLead, setSelectedLead] = useState("Wipro Limited");
  const [tab, setTab] = useState("Details");

  const leads = [
    { name: "Wipro Limited", details: "5K sqft BKC • ₹1.2L/mo", stage: "QUALIFIED", stageColor: "bg-amber-100 text-amber-700", time: "2h ago" },
    { name: "TechNova Solutions", details: "12K sqft Powai • ₹3.5L/mo", stage: "NEW", stageColor: "bg-blue-100 text-blue-700", time: "1d ago" },
    { name: "Global Logistics", details: "3K sqft Andheri • ₹80K/mo", stage: "VISIT", stageColor: "bg-emerald-100 text-emerald-700", time: "2d ago" }
  ];

  const tabs = ["Details", "Activity", "Matched Properties", "Notes"];

  return (
    <div className="flex gap-0 font-sans h-[calc(100vh-120px)]">
      {/* Lead List */}
      <div className="w-[340px] border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="relative mb-3"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Filter by company, status..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-700 cursor-pointer">All 23</span>
            <span className="px-3 py-1 rounded-full border border-blue-200 text-xs font-bold text-blue-600 cursor-pointer">New 8</span>
            <span className="px-3 py-1 rounded-full border border-amber-200 text-xs font-bold text-amber-600 cursor-pointer">Qualified 6</span>
            <span className="px-3 py-1 rounded-full border border-emerald-200 text-xs font-bold text-emerald-600 cursor-pointer">Active</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leads.map((l) => (
            <div key={l.name} onClick={() => setSelectedLead(l.name)} className={`p-4 border-b border-gray-100 cursor-pointer ${selectedLead === l.name ? "bg-gray-50 border-l-2 border-l-[#0F8B7D]" : "hover:bg-gray-50/50"}`}>
              <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-900">{l.name}</span><span className="text-[10px] text-gray-400">{l.time}</span></div>
              <p className="text-[10px] text-gray-500">{l.details}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${l.stageColor}`}>{l.stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Detail */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2"><h2 className="text-lg font-bold text-gray-900">Wipro Limited</h2><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">Qualified</span></div>
            <p className="text-xs text-gray-500">Tech / IT Services • Seeking 5K sqft in BKC</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">✏️ Edit</button>
            <button className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold cursor-pointer">◆ Convert to Deal</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 text-xs font-bold cursor-pointer ${tab === t ? "text-[#0F8B7D] border-b-2 border-[#0F8B7D]" : "text-gray-500"}`}>
              {t}{t === "Matched Properties" && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[9px]">3</span>}
            </button>
          ))}
        </div>

        {/* Detail Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">📋 Contact Info</h3>
            <p className="text-[10px] text-gray-500">Primary Contact</p>
            <p className="text-xs font-bold text-gray-900 mb-2">Rahul Sharma (VP Real Estate)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-[10px] text-gray-400">Phone</p><p className="font-semibold">+91 98765 43210</p></div>
              <div><p className="text-[10px] text-gray-400">Email</p><p className="font-semibold text-blue-600">rahul.s@wipro.com</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">🏢 Space Needs</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-[10px] text-gray-400">Type</p><p className="font-semibold">Bare Shell</p></div>
              <div><p className="text-[10px] text-gray-400">Area Required</p><p className="font-black text-gray-900">5,000 sqft</p></div>
              <div><p className="text-[10px] text-gray-400">Est. Seats</p><p className="font-semibold">~80-100</p></div>
              <div><p className="text-[10px] text-gray-400">Preferred Location</p><p className="font-semibold">BKC, Bandra East</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">👤 Assignment</h3>
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs"><option>Ravi Kumar (Senior Broker)</option><option>Anita S.</option><option>Vikram K.</option></select>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">💰 Budget & Timeline</h3>
            <p className="text-[10px] text-gray-500 mb-1">Budget Limits</p>
            <div className="w-full h-2 rounded-full bg-gray-200 mb-1"><div className="h-full rounded-full bg-blue-600" style={{ width: "80%" }} /></div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-3"><span>₹1L/mo</span><span className="font-bold text-gray-900">Max: ₹1.2L/mo</span><span>₹1.5L/mo</span></div>
            <p className="text-[10px] text-gray-500">Move-in Timeline</p>
            <p className="text-xs font-bold text-gray-900">Q4 2024 (Within 3 months)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

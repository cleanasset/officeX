"use client";
import React, { useState } from "react";
import { ClipboardList, Check } from "lucide-react";

export default function VendorWorkOrders() {
  const [work] = useState([
    { id: 1, title: "AC Compressor Overhaul", location: "Apex Floor 4", milestones: ["Compressor installation", "Gas refilling"], current: "Gas refilling", status: "Active" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Work Orders</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review active checklists dispatches and submit completion updates to clients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {work.map((w) => (
          <div key={w.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ClipboardList size={16} className="text-emerald-600" />
                    {w.title}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Location: {w.location}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  {w.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex flex-col gap-2">
                <span className="font-bold text-gray-900">Active Task: {w.current}</span>
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Milestones</span>
                  {w.milestones.map((m, idx) => (
                    <span key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check size={12} className="text-emerald-600" /> {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

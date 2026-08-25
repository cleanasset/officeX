"use client";
import React, { useState } from "react";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";

export default function WorkOrders() {
  const [workOrders] = useState([
    { id: 1, title: "AC Compressor Overhaul", vendor: "TechServe Solutions", start: "Aug 24, 2026", progress: "Milestone 1/2 complete", status: "In Progress" },
    { id: 2, title: "Elevator Inspection", vendor: "Apex Elevator Systems", start: "Aug 22, 2026", progress: "Job signed off", status: "Completed" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Active Work Orders</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit active task checklists, dispatch completion statuses, and signoff logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workOrders.map((wo) => (
          <div key={wo.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{wo.title}</h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Contractor: {wo.vendor}</span>
                </div>
                <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                  wo.status === "Completed" ? "bg-emerald-600 text-white" : "bg-teal-600 text-white"
                }`}>
                  {wo.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex flex-col gap-1">
                <span>Start Date: {wo.start}</span>
                <span className="font-bold text-gray-900">Progress: {wo.progress}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

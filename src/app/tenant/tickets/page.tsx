"use client";
import React, { useState } from "react";
import { ClipboardList, Clock } from "lucide-react";

export default function TicketTracker() {
  const [tickets] = useState([
    { id: "T-402", title: "Water leakage in cafeteria", category: "Plumbing", raised: "Aug 24, 2026", status: "Assigned" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor status updates, dispatches progress, and resolution notes for raised tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((t) => (
          <div key={t.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ClipboardList size={16} className="text-purple-600" />
                    {t.title}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Category: {t.category}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex items-center gap-2">
                <Clock size={12} className="text-gray-600" /> Raised On: {t.raised}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

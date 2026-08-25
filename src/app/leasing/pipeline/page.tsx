"use client";
import React, { useState } from "react";
import { Kanban, Sparkles, TrendingUp } from "lucide-react";

export default function PipelinePage() {
  const [columns] = useState({
    New: [{ id: 1, name: "InfyTech Hub", req: "8k sq.ft", value: "₹1.2L/mo" }],
    Qualified: [{ id: 2, name: "RazorPay Ops", req: "12k sq.ft", value: "₹2.1L/mo" }],
    "Proposal Sent": [{ id: 3, name: "Dharma Media", req: "15k sq.ft", value: "₹3.5L/mo" }],
    Won: [{ id: 4, name: "TATA Projects", req: "25k sq.ft", value: "₹6.0L/mo" }]
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leasing Sales Pipeline</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor active deals progression across stages from lead sourcing to closed contracts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(columns).map(([colName, items], idx) => (
          <div key={idx} className="premium-card p-4 border border-gray-200 bg-gray-50/50 flex flex-col gap-3 min-h-[400px]">
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block mb-2">{colName} ({items.length})</span>
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-2">
                <span className="font-bold text-gray-900 text-xs">{item.name}</span>
                <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold mt-2">
                  <span>{item.req}</span>
                  <span className="text-blue-600 font-extrabold">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

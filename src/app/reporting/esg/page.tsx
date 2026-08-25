"use client";
import React, { useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function ESGReporting() {
  const [esg] = useState([
    { metric: "Carbon Footprint reduction", unit: "Tons CO2e", target: "12.00", actual: "14.50", rating: "Exceeded" },
    { metric: "Green waste recycling", unit: "Percentage", target: "80%", actual: "85%", rating: "Exceeded" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ESG Sustainability Board</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Track greenhouse gas reductions, waste metrics, and LEED cert compliance points.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Sustainability Metric</th>
              <th className="py-4">Measurement Unit</th>
              <th className="py-4">Target Target</th>
              <th className="py-4">Actual Achieved</th>
              <th className="py-4">ESG Rating</th>
            </tr>
          </thead>
          <tbody>
            {esg.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" />
                  {row.metric}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{row.unit}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.target}</td>
                <td className="py-4 text-gray-900 font-bold text-emerald-600">{row.actual}</td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    {row.rating}
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

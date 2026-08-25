"use client";
import React, { useState } from "react";
import { TrendingUp, FileText } from "lucide-react";

export default function UtilitiesReporting() {
  const [metrics] = useState([
    { month: "July 2026", electricity: "42,000 kWh", water: "150 KL", cost: "₹4,82,000" },
    { month: "June 2026", electricity: "38,500 kWh", water: "140 KL", cost: "₹4,22,000" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Energy & Utility Dashboard</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Aggregated consumption registers for building power grids and water supplies.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Billing Cycle Month</th>
              <th className="py-4">Electricity (kWh)</th>
              <th className="py-4">Water Consumption (KL)</th>
              <th className="py-4">Aggregate Utilities Cost</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-500" />
                  {row.month}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{row.electricity}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.water}</td>
                <td className="py-4 text-gray-900 font-extrabold text-blue-600">{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

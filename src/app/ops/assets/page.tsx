"use client";
import React, { useState } from "react";
import { Building, Clipboard } from "lucide-react";

export default function OperationsAssets() {
  const [assets] = useState([
    { id: 1, name: "BlueStar Chiller 150TR", code: "AX-CH-01", location: "Apex Basement 2", lastMaint: "July 12, 2026", status: "Operational" },
    { id: 2, name: "Kirloskar Fire Pump 45kW", code: "MR-FP-03", location: "Meridian Pump Room Wing A", lastMaint: "Aug 02, 2026", status: "Operational" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Asset Registry</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Directory of HVAC Chillers, water treatment pumps, and fire safety assets.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Asset Name</th>
              <th className="py-4">Tag Code</th>
              <th className="py-4">Assigned Location</th>
              <th className="py-4">Last Inspected</th>
              <th className="py-4">Asset Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Building size={14} className="text-amber-600" />
                  {a.name}
                </td>
                <td className="py-4 font-mono font-bold text-purple-600">{a.code}</td>
                <td className="py-4 text-gray-700 font-semibold">{a.location}</td>
                <td className="py-4 text-gray-700 font-semibold">{a.lastMaint}</td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    {a.status}
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

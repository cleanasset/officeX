"use client";
import React, { useState } from "react";
import { Briefcase, FileText } from "lucide-react";

export default function OperationsContracts() {
  const [contracts] = useState([
    { id: 1, name: "AMC Chiller Maintenance", property: "Apex Business Tower", value: "₹4,80,000/yr", vendor: "TechServe Solutions", renewal: "Dec 15, 2026" },
    { id: 2, name: "Soft Services & Housekeeping", property: "Meridian Tech Park", value: "₹12,40,000/yr", vendor: "CleanForce Labs", renewal: "Oct 01, 2026" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Managed Contracts</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review operations contracts, service level agreements, and annual maintenance agreements.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Contract Name</th>
              <th className="py-4">Property</th>
              <th className="py-4">Annual Value</th>
              <th className="py-4">Contractor Vendor</th>
              <th className="py-4">Renewal Date</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase size={14} className="text-amber-600" />
                  {c.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{c.property}</td>
                <td className="py-4 text-gray-900 font-extrabold">{c.value}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.vendor}</td>
                <td className="py-4 text-red-600 font-bold">{c.renewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

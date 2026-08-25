"use client";
import React, { useState } from "react";
import { FolderOpen, FileCheck, AlertTriangle } from "lucide-react";

export default function RegistryPage() {
  const [leases] = useState([
    { id: 1, tenant: "Tata Consultancy Services", unit: "Meridian Park - Wing A", start: "Jan 1, 2024", end: "Dec 31, 2028", lockin: "2 Years", rent: "₹18,50,000/mo" },
    { id: 2, tenant: "Dharma Productions", unit: "Apex Tower - Suite 401", start: "May 10, 2025", end: "May 09, 2027", lockin: "1 Year", rent: "₹3,40,000/mo" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lease Registry Ledger</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review active tenant lease terms, renewal lock-ins, and escalation schedules.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant</th>
              <th className="py-4">Assigned Space Unit</th>
              <th className="py-4">Lease Start & End</th>
              <th className="py-4">Lock-in Period</th>
              <th className="py-4">Monthly Rent</th>
            </tr>
          </thead>
          <tbody>
            {leases.map((l) => (
              <tr key={l.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck size={14} className="text-blue-500" />
                  {l.tenant}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{l.unit}</td>
                <td className="py-4 text-gray-700 font-semibold">{l.start} to {l.end}</td>
                <td className="py-4 text-gray-700 font-semibold">{l.lockin}</td>
                <td className="py-4 text-gray-900 font-extrabold">{l.rent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

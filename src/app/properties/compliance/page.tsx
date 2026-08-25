"use client";
import React, { useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function ComplianceTracker() {
  const [certs] = useState([
    { id: 1, name: "Fire NOC Safety Certificate", property: "Apex Business Tower", expiry: "Sep 20, 2026", remaining: "27 Days", status: "Expiring Soon" },
    { id: 2, name: "Lift Operations Certificate", property: "Meridian Tech Park", expiry: "Aug 10, 2026", remaining: "Expired", status: "Critical Expiry" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Statutory Compliance Tracker</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor statutory license expiration dates, NOC renewals, and escalations triggers.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Certificate Name</th>
              <th className="py-4">Building Property</th>
              <th className="py-4">Expiry Date</th>
              <th className="py-4">Days Remaining</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-600" />
                  {c.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{c.property}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.expiry}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.remaining}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    c.status === "Expiring Soon" ? "bg-amber-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {c.status}
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

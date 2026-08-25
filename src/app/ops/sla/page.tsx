"use client";
import React, { useState } from "react";
import { Clock, ShieldAlert } from "lucide-react";

export default function OperationsSLA() {
  const [slas] = useState([
    { id: 1, ticket: "AC leak - Suite 401", targetResponse: "30 Mins", actualResponse: "12 Mins", targetResolution: "4 Hours", actualResolution: "2.5 Hours", status: "Met" },
    { id: 2, ticket: "Server Room Temp Alert", targetResponse: "15 Mins", actualResponse: "22 Mins", targetResolution: "2 Hours", actualResolution: "3 Hours", status: "Breached" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SLA Performance Monitor</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit ticket response timings, resolution deadlines, and breach events logs.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Ticket Description</th>
              <th className="py-4">Target Response</th>
              <th className="py-4">Actual Response</th>
              <th className="py-4">Target Resolution</th>
              <th className="py-4">Actual Resolution</th>
              <th className="py-4">SLA Compliance</th>
            </tr>
          </thead>
          <tbody>
            {slas.map((s) => (
              <tr key={s.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={14} className="text-amber-600" />
                  {s.ticket}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{s.targetResponse}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.actualResponse}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.targetResolution}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.actualResolution}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    s.status === "Met" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {s.status}
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

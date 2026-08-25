"use client";
import React, { useState } from "react";
import { Users, Plus, Check } from "lucide-react";

export default function Visitors() {
  const [visitors] = useState([
    { id: 1, name: "Amit Shah", company: "Home Ministry Audits", code: "VIS-9902", date: "Aug 26, 2026", status: "Approved" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visitor Pre-Registration</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Register incoming corporate guests and generate operational entry passcodes.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-2">
          <Plus size={14} /> Register Guest
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Guest Name</th>
              <th className="py-4">Representing Company</th>
              <th className="py-4">Verification Code</th>
              <th className="py-4">Expected Date</th>
              <th className="py-4">Gatekeeper Pass Status</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Users size={14} className="text-purple-600" />
                  {v.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{v.company}</td>
                <td className="py-4 font-mono font-bold text-purple-600">{v.code}</td>
                <td className="py-4 text-gray-700 font-semibold">{v.date}</td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    {v.status}
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

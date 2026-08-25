"use client";
import React, { useState } from "react";
import { Calendar, User, Clock, Check } from "lucide-react";

export default function VisitsPage() {
  const [visits] = useState([
    { id: 1, client: "Zeta Space", property: "Apex Business Tower", date: "Aug 26, 2026", time: "11:00 AM", rep: "Ravi Menon" },
    { id: 2, client: "HDFC Ops", property: "Meridian Tech Park", date: "Aug 27, 2026", time: "03:30 PM", rep: "Ravi Menon" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Site Visit Planner</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Schedule and log site inspections and log customer feedback reports.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Prospect Client</th>
              <th className="py-4">Target Property</th>
              <th className="py-4">Date & Time</th>
              <th className="py-4">Assigned Rep</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900">{v.client}</td>
                <td className="py-4 text-gray-700 font-semibold">{v.property}</td>
                <td className="py-4 text-gray-700 font-semibold flex items-center gap-2">
                  <Calendar size={12} className="text-gray-500" />
                  {v.date} | {v.time}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{v.rep}</td>
                <td className="py-4">
                  <button className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700">
                    Log Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

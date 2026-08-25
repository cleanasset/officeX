"use client";
import React, { useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function OperationsPPM() {
  const [tasks] = useState([
    { id: 1, task: "Chiller Descaling", property: "Apex Business Tower", week: "Week 34", assignee: "Sanjay Kumar", status: "Completed" },
    { id: 2, task: "Fire Pump Flow Check", property: "Meridian Tech Park", week: "Week 35", assignee: "Vikram Shah", status: "Scheduled" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">52-Week PPM Calendar</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit scheduled Planned Preventive Maintenance schedules and safety logs checklists.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Maintenance Task</th>
              <th className="py-4">Building Property</th>
              <th className="py-4">Scheduled Week</th>
              <th className="py-4">Technician Assigned</th>
              <th className="py-4">Execution Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={14} className="text-amber-600" />
                  {t.task}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{t.property}</td>
                <td className="py-4 text-purple-600 font-bold">{t.week}</td>
                <td className="py-4 text-gray-700 font-semibold">{t.assignee}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    t.status === "Completed" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {t.status}
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

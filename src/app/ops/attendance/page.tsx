"use client";
import React, { useState } from "react";
import { Users, Check, X } from "lucide-react";

export default function OperationsAttendance() {
  const [staff] = useState([
    { id: 1, name: "Sanjay Kumar", role: "Electrician", shift: "Morning", status: "Present" },
    { id: 2, name: "Vikram Shah", role: "Plumbing Tech", shift: "Night", status: "Present" },
    { id: 3, name: "Ramesh Dev", role: "HVAC Tech", shift: "Morning", status: "Absent" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Attendance Logger</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor technician shift rosters, logs checks, and attendance metrics.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Staff Name</th>
              <th className="py-4">Role</th>
              <th className="py-4">Assigned Shift</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Users size={14} className="text-amber-600" />
                  {s.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{s.role}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.shift}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    s.status === "Present" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
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

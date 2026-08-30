"use client";
import React, { useState } from "react";
import { Download, Check, AlertTriangle, RefreshCw, Calendar as CalendarIcon, CheckCircle } from "lucide-react";

export default function PPMCalendarDashboard() {
  const [category, setCategory] = useState("All");
  const [property, setProperty] = useState("Apex Tower");
  const [status, setStatus] = useState("All");

  const weeks = ["W27", "W28", "W29", "W30", "W31", "W32", "W33", "W34", "W35", "W36", "W37", "W38"];

  const assets = [
    {
      name: "DG Set 500KVA",
      loc: "Basement",
      schedule: { W27: "done", W29: "done", W31: "progress", W33: "sched", W35: "sched", W37: "sched" }
    },
    {
      name: "HVAC Chiller #2",
      loc: "Terrace",
      schedule: { W28: "overdue", W31: "sched", W35: "sched" }
    },
    {
      name: "Schindler Passenger Lift",
      loc: "Main Shaft",
      schedule: { W27: "done", W28: "done", W29: "done", W30: "done", W31: "progress", W32: "sched", W33: "sched", W34: "sched", W35: "sched", W36: "sched", W37: "sched", W38: "sched" }
    },
    {
      name: "Jockey Fire Pump #1",
      loc: "Pump Room",
      schedule: { W29: "done", W33: "sched", W37: "sched" }
    },
    {
      name: "Central UPS System",
      loc: "Server Room",
      schedule: { W30: "overdue", W38: "sched" }
    }
  ];

  const renderCell = (st?: string) => {
    if (!st) return <div className="w-8 h-8 rounded-lg bg-gray-50 mx-auto" />;
    if (st === "done") {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
          <Check size={14} strokeWidth={3} />
        </div>
      );
    }
    if (st === "progress") {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
          <RefreshCw size={12} className="animate-spin" />
        </div>
      );
    }
    if (st === "overdue") {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mx-auto text-xs font-black shadow-xs">
          !
        </div>
      );
    }
    if (st === "sched") {
      return <div className="w-8 h-8 rounded-lg bg-amber-100/70 border border-amber-200 mx-auto" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header with Filter Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Preventative Maintenance Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Operations &gt; PPM Calendar</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white shadow-sm">
            <option>Q3: Weeks 27 - 39</option>
          </select>
        </div>
      </div>

      {/* Filter Toolbar Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Category: All</option>
            <option>MEP</option>
            <option>HVAC</option>
            <option>Lifts</option>
            <option>Fire Safety</option>
          </select>

          <select
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Property: Apex Tower</option>
            <option>Property: Meridian Park</option>
            <option>Property: Nexus Hub</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Status: All</option>
            <option>Done</option>
            <option>Scheduled</option>
            <option>Overdue</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300" /> DONE</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200" /> SCHEDULED</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-300" /> OVERDUE</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200" /> IN PROGRESS</span>
          </div>

          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Download size={13} /> Export Schedule
          </button>
        </div>
      </div>

      {/* Interactive Schedule Grid Matrix */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm p-6">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-60">ASSET NAME & LOCATION</th>
              {weeks.map((w) => (
                <th key={w} className="py-3 px-2 text-center">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.name} className="border-b border-gray-100 hover:bg-gray-50/40">
                <td className="py-4 px-4">
                  <p className="text-xs font-bold text-gray-900">{asset.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{asset.loc}</p>
                </td>
                {weeks.map((w) => (
                  <td key={w} className="py-4 px-2 text-center">
                    {renderCell((asset.schedule as Record<string, string>)[w])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom KPI Counters */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">TOTAL SCHEDULED</p>
            <p className="text-3xl font-black text-gray-900 mt-1">65</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <CalendarIcon size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold text-gray-400 uppercase">DONE</span>
            <span className="text-2xl font-black text-emerald-600">48</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "74%" }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">PENDING</p>
            <p className="text-3xl font-black text-blue-600 mt-1">12</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            📋
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-red-500 border-red-200 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
              <AlertTriangle size={12} /> OVERDUE
            </p>
            <p className="text-3xl font-black text-red-600 mt-1">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  FileCheck2,
} from "lucide-react";

export default function ComplianceCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("October 2026");

  const scheduleEvents = [
    {
      date: "Oct 28, 2026",
      title: "Contract Labour Regulation (CLRA) Monthly ESI/PF Return",
      category: "Labor Law",
      severity: "medium",
      status: "Due Soon",
    },
    {
      date: "Nov 06, 2026",
      title: "Elevator & Lift License Bi-Annual Inspection Certificate",
      category: "Lift / HVAC",
      severity: "critical",
      status: "Upcoming",
    },
    {
      date: "Nov 15, 2026",
      title: "STP Water Discharge & Pollution Control Board Audit",
      category: "Environmental",
      severity: "high",
      status: "Scheduled",
    },
    {
      date: "Dec 28, 2026",
      title: "Form 15 Annual Fire NOC Hydrant Renewal",
      category: "Fire & Safety",
      severity: "critical",
      status: "Planned",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Compliance Calendar (CM-04)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Statutory Calendar & Renewal Radar</h1>
          <p className="text-xs text-slate-400">
            Monthly and quarterly schedule of statutory deadlines, license expiries, and vendor audits.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <span className="font-bold text-white px-3 py-1">{currentMonth}</span>
        </div>
      </div>

      <div className="space-y-3">
        {scheduleEvents.map((evt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{evt.title}</div>
                <div className="text-slate-400 mt-0.5">
                  Category: <strong className="text-slate-200">{evt.category}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-white font-bold">{evt.date}</span>
                <div className="text-[10px] text-slate-500">Scheduled Due Date</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                evt.severity === "critical"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}>
                {evt.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

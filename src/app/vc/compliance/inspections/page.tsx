"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Building,
  User,
} from "lucide-react";

export default function InspectionsPage() {
  const [inspections] = useState([
    {
      id: "INSP-2026-012",
      title: "Quarterly Fire Hydrant & Smoke Detector Functional Test",
      type: "Fire Safety Audit",
      inspector: "Vikas Bansal (FM Engineer)",
      date: "Oct 20, 2026",
      score: 96.5,
      status: "Passed",
      findingsCount: 1,
    },
    {
      id: "INSP-2026-009",
      title: "Elevator Safety Governor & Emergency Brake Test (8 Cars)",
      type: "Lift & Escalator Check",
      inspector: "Chief Electrical Inspector",
      date: "Oct 12, 2026",
      score: 92.0,
      status: "Passed",
      findingsCount: 2,
    },
    {
      id: "INSP-2026-005",
      title: "Structural Facade Glazing & Anchor Tension Assessment",
      type: "Structural Audit",
      inspector: "Dr. R.K. Mehra (Structural Consultant)",
      date: "Sep 28, 2026",
      score: 98.0,
      status: "Passed",
      findingsCount: 0,
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Inspections & Audits (CM-06)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Digital Safety Inspections</h1>
          <p className="text-xs text-slate-400">
            Scheduled engineering inspections, weighted checklists, and scoring thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Start New Inspection Checklist")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection Run</span>
        </button>
      </div>

      <div className="space-y-3">
        {inspections.map((insp) => (
          <div
            key={insp.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{insp.title}</div>
                <div className="text-slate-400 mt-0.5">
                  Inspector: <strong className="text-slate-200">{insp.inspector}</strong> • Conducted: {insp.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">{insp.score}%</div>
                <div className="text-[10px] text-slate-400">{insp.findingsCount} snags logged</div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {insp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

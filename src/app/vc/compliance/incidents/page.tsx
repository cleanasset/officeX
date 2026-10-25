"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Plus,
  Clock,
  User,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function IncidentsRegisterPage() {
  const [incidents] = useState([
    {
      id: "INC-2026-004",
      type: "Water Leak / Pipe Burst",
      severity: "medium",
      location: "Tower 1 • Floor 5 Pantry Core",
      occurredAt: "Oct 24, 2026 at 06:15 PM",
      reportedBy: "Sanjay Security Guard",
      description: "Chilled water piping flange loosened, water overflowed into corridor. Valved isolated immediately.",
      immediateAction: "Isolation valve closed; dry-vac extraction deployed.",
      capaLinked: "CAPA-2026-008",
      status: "Investigating",
    },
    {
      id: "INC-2026-003",
      type: "False Fire Alarm Activation",
      severity: "low",
      location: "Tower 1 • Basement 1 Parking",
      occurredAt: "Oct 19, 2026 at 02:40 PM",
      reportedBy: "FM Desk",
      description: "Dust from diesel exhaust triggered optical beam smoke detector. No fire detected.",
      immediateAction: "Panel silenced; detector head air-dusted.",
      capaLinked: "CAPA-2026-005",
      status: "Resolved",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-rose-400 font-bold">Incident Register (CM-07)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Safety & Operational Incidents</h1>
          <p className="text-xs text-slate-400">
            Log security breaches, water leaks, power trips, fire alarms, and tied Corrective Actions (CAPA).
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Report Safety / Facility Incident")}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>

      <div className="space-y-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{inc.type}</span>
                    <span className="font-mono text-xs text-blue-400 font-normal">({inc.id})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Location: <strong className="text-slate-200">{inc.location}</strong></div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                inc.status === "Resolved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {inc.status}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-300">{inc.description}</div>
              <div className="text-emerald-400 text-[11px] font-medium pt-1">
                <strong>Immediate Action: </strong>{inc.immediateAction}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Reported: {inc.occurredAt} by {inc.reportedBy}</span>
              <Link href="/vc/compliance/capa" className="text-blue-400 font-semibold hover:underline">
                Linked {inc.capaLinked} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

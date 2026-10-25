"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";

export default function AuditFindingsPage() {
  const [findings] = useState([
    {
      id: "AUD-2026-003",
      auditTitle: "Internal Quality & ISO 45001 EHS Annual Surveillance",
      finding: "Emergency exit signage luminaire on Floor 3 West stairwell battery backup depleted.",
      severity: "high",
      owner: "Pooja Chhabra (HR/Admin)",
      dueDate: "2026-10-31",
      closureStatus: "In Progress",
      capaId: "CAPA-2026-009",
    },
    {
      id: "AUD-2026-002",
      auditTitle: "State Fire Brigade Surprise Inspection",
      finding: "Fire hose reel water pressure reading 6.2 bar vs required 7.0 bar minimum at terrace.",
      severity: "critical",
      owner: "Rajesh Verma (FM Lead)",
      dueDate: "2026-11-05",
      closureStatus: "Open",
      capaId: "CAPA-2026-010",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Audit Findings (CM-14)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Audit Findings & Non-Conformances</h1>
          <p className="text-xs text-slate-400">
            Track corrective actions arising from statutory municipal audits and ISO certifications.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  f.severity === "critical"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {f.severity} Non-Conformance
                </span>
                <div className="text-base font-extrabold text-white mt-1.5">{f.finding}</div>
                <div className="text-xs text-slate-400">{f.auditTitle}</div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                f.closureStatus === "Closed"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {f.closureStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Owner: <strong className="text-slate-200">{f.owner}</strong> • Due: {f.dueDate}</span>
              <Link href="/vc/compliance/capa" className="text-blue-400 font-semibold hover:underline">
                Linked Action {f.capaId} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

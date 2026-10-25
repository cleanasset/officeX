"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Building,
  User,
} from "lucide-react";

export default function CapaManagementPage() {
  const [capas] = useState([
    {
      id: "CAPA-2026-008",
      title: "Replace Gasket and Fit Pressure Gauge on Floor 5 Chilled Water Line",
      source: "Incident INC-2026-004",
      actionType: "Corrective",
      owner: "Vikas Bansal (FM Engineer)",
      dueDate: "2026-10-30",
      priority: "high",
      status: "In Progress",
      verificationRule: "Cannot close without signed plumbing hydro-test certificate",
    },
    {
      id: "CAPA-2026-005",
      title: "Install Acoustic Baffle Seal around Basement Emergency Diesel Generators",
      source: "Inspection INSP-2026-009",
      actionType: "Preventive",
      owner: "Dr. R.K. Mehra",
      dueDate: "2026-11-15",
      priority: "medium",
      status: "Verified & Closed",
      verificationRule: "Verified by State PCB Decibel Audio Meter report",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">CAPA Management (CM-08)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Corrective & Preventive Actions (CAPA)</h1>
          <p className="text-xs text-slate-400">
            Action items triggered from statutory audits, equipment failures, and safety incidents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Create New CAPA Action Plan")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New CAPA Item</span>
        </button>
      </div>

      <div className="space-y-4">
        {capas.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{c.title}</span>
                    <span className="font-mono text-xs text-blue-400 font-normal">({c.id})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Source: <strong className="text-slate-200">{c.source}</strong> • Action: {c.actionType}</div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                c.status.includes("Closed")
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {c.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Responsible Owner:</span>
                <div className="text-slate-200 font-semibold">{c.owner}</div>
              </div>
              <div>
                <span className="text-slate-500">Target Closure Due:</span>
                <div className="text-slate-200 font-mono">{c.dueDate}</div>
              </div>
              <div className="col-span-full pt-1 text-[11px] text-amber-300">
                <strong>Gate Rule: </strong>{c.verificationRule}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function RiskHeatmapPage() {
  const [risks] = useState([
    {
      id: "RSK-001",
      category: "Fire & Life Safety",
      statement: "Delay in municipal annual hydrant certification could trigger operational suspension.",
      likelihood: 2,
      impact: 5,
      inherentScore: 10,
      mitigation: "Pre-audit conducted by Clean Asset engineering team; form filed 60 days in advance.",
      residualScore: 4,
      status: "Mitigated",
    },
    {
      id: "RSK-002",
      category: "Statutory / Environmental",
      statement: "DG set exhaust particulate matter exceeding NGT revised seasonal winter limits.",
      likelihood: 3,
      impact: 4,
      inherentScore: 12,
      mitigation: "Dual-fuel gas retrofitting kits fitted on all 3 standby generators.",
      residualScore: 6,
      status: "Active",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Risk Matrix (CM-13)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Operational & Compliance Risk Radar</h1>
          <p className="text-xs text-slate-400">
            Likelihood × Impact matrix evaluating life safety, statutory liabilities, and asset disruption risks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add Risk Evaluation Entry")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Risk Assessment</span>
        </button>
      </div>

      <div className="space-y-4">
        {risks.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {r.category}
                </span>
                <div className="text-base font-extrabold text-white mt-1.5">{r.statement}</div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Inherent Score: </span>
                <span className="font-black text-rose-400 text-base">{r.inherentScore}/25</span>
                <div className="text-[10px] text-emerald-400 font-semibold">Residual: {r.residualScore}/25</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 block mb-0.5">Control Mitigation:</span>
              <div className="text-emerald-300">{r.mitigation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

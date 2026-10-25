"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function ContractCompliancePage() {
  const [contracts] = useState([
    {
      id: "CON-AMC-2026",
      vendor: "Otis Elevator India Pvt Ltd",
      scope: "Comprehensive Vertical Transport AMC (8 Cars)",
      slaUptime: "99.5% Required",
      actualUptime: "99.8% Achieved",
      penaltyStatus: "Nil Penalty",
      status: "Compliant",
    },
    {
      id: "CON-FM-2026",
      vendor: "Clean Asset FM Operations Ltd",
      scope: "Full-Facility Integrated Housekeeping & MEP",
      slaUptime: "15-Min Response SLA",
      actualUptime: "11-Min Average",
      penaltyStatus: "Nil Penalty",
      status: "Compliant",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Contract Compliance (CM-12)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Vendor Contract SLAs & Penalties</h1>
          <p className="text-xs text-slate-400">
            Monitor FM contractor obligations, uptime benchmarks, and liquidated damages tracking.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{c.vendor}</span>
                <span className="font-mono text-xs text-blue-400 font-normal">({c.id})</span>
              </div>
              <div className="text-slate-400">{c.scope}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-emerald-400 font-bold">{c.actualUptime}</span>
                <div className="text-[10px] text-slate-500">Benchmark: {c.slaUptime}</div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

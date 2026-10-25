"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardHat,
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Plus,
} from "lucide-react";

export default function ContractorRegisterPage() {
  const [contractors] = useState([
    {
      id: "CONT-001",
      name: "Ramesh Kumar",
      vendor: "Otis Elevator India Pvt Ltd",
      supervisor: "Rajesh Verma (FM Lead)",
      ptwLinked: "PTW-2026-0042 (Hot Work)",
      zone: "Lift Machine Room #3",
      ppeVerified: true,
      inAt: "09:30 AM",
      status: "Active On Site",
    },
    {
      id: "CONT-002",
      name: "Manoj Swaminathan",
      vendor: "Johnson Controls HVAC",
      supervisor: "Suresh Nair (Ops Mgr)",
      ptwLinked: "PTW-2026-0038 (Chiller Servicing)",
      zone: "Basement 2 Chiller Core",
      ppeVerified: true,
      inAt: "10:15 AM",
      status: "Active On Site",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Contractor & Vendor Register (VC-11)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Contractor Work Log & PTW Linkage</h1>
          <p className="text-xs text-slate-400">
            Track external maintenance technicians, PPE verification, and active Permit-to-Work authorizations.
          </p>
        </div>

        <Link
          href="/vc/compliance/permits"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30"
        >
          <Wrench className="w-4 h-4" />
          <span>View Active Permits</span>
        </Link>
      </div>

      <div className="space-y-4">
        {contractors.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{c.name}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded">
                      {c.vendor}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Assigned Zone: <strong className="text-slate-200">{c.zone}</strong></div>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded uppercase">
                {c.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500">Linked Work Permit:</span>
                <div className="text-blue-400 font-semibold">{c.ptwLinked}</div>
              </div>
              <div>
                <span className="text-slate-500">Site Supervisor:</span>
                <div className="text-slate-200 font-medium">{c.supervisor}</div>
              </div>
              <div>
                <span className="text-slate-500">Mandatory PPE:</span>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Inspected & Cleared</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

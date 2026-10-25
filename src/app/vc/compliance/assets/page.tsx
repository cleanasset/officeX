"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function AssetCompliancePage() {
  const [assets] = useState([
    {
      id: "AST-LIFT-01",
      name: "High-Speed Passenger Elevator Bank A (8 Cars)",
      type: "Vertical Transport",
      statutoryCertificate: "Form A Lift Fitness License",
      authority: "Chief Electrical Inspector",
      nextInspectionDue: "2026-11-06",
      status: "Due Soon",
    },
    {
      id: "AST-DG-02",
      name: "1500 kVA Standby Diesel Generator Set #1",
      type: "Emergency Power",
      statutoryCertificate: "Acoustic & Smoke Emission NOC",
      authority: "State Pollution Control Board",
      nextInspectionDue: "2027-04-18",
      status: "Compliant",
    },
    {
      id: "AST-CHILL-03",
      name: "Water-Cooled Centrifugal Chiller Plant (500 TR)",
      type: "HVAC Central Plant",
      statutoryCertificate: "Pressure Vessel Hydrostatic Test",
      authority: "Boiler & Pressure Vessels Inspectorate",
      nextInspectionDue: "2027-01-15",
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
            <span className="text-emerald-400 font-bold">Asset Compliance (CM-11)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Critical Engineering Asset Certifications</h1>
          <p className="text-xs text-slate-400">
            Lifecycle monitoring for lifts, DG sets, chillers, pressure vessels, and fire pump rooms.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{a.name}</span>
                <span className="font-mono text-xs text-blue-400 font-normal">({a.id})</span>
              </div>
              <div className="text-slate-400">
                Statutory License: <strong className="text-slate-200">{a.statutoryCertificate}</strong> • {a.authority}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-slate-300 font-mono font-medium">{a.nextInspectionDue}</span>
                <div className="text-[10px] text-slate-500">Next Scheduled Expiry</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                a.status === "Compliant"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardHat,
  Wrench,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileCheck,
  ChevronLeft,
} from "lucide-react";

export default function PermitToWorkPage() {
  const [permits, setPermits] = useState([
    {
      id: "PTW-2026-0042",
      type: "Hot Work & Welding",
      contractor: "Otis Elevator India Pvt Ltd",
      location: "Tower 1 • Elevator Machine Room #3",
      validFrom: "2026-10-25 09:00",
      validTo: "2026-10-25 18:00",
      status: "Active",
      riskControls: "Fire extinguisher standby, spark shield, 30-min fire watch post work",
      approver: "Rajesh Verma (FM Lead)",
    },
    {
      id: "PTW-2026-0039",
      type: "Working at Height",
      contractor: "Apex Facade Cleaning Services",
      location: "Tower 1 • External Glass Facade North Elevation",
      validFrom: "2026-10-24 08:00",
      validTo: "2026-10-24 17:00",
      status: "Completed",
      riskControls: "Full body safety harness, anchor points inspected, ground barricaded",
      approver: "Rohan Mathur (EHS Officer)",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Permits to Work (CM-09)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Contractor Work Permits (PTW)</h1>
          <p className="text-xs text-slate-400">
            Digital permits for hazardous tasks: Hot Work, Height Work, Confined Space, and Electrical Isolation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Opening PTW Request Form")}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Permit</span>
        </button>
      </div>

      <div className="space-y-4">
        {permits.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-400">{p.id}</span>
                    <span className="text-sm font-bold text-white">{p.type}</span>
                  </div>
                  <div className="text-xs text-slate-400">{p.contractor}</div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase self-start sm:self-center ${
                p.status === "Active"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {p.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500">Location:</span>
                <div className="text-slate-200 font-semibold">{p.location}</div>
              </div>
              <div>
                <span className="text-slate-500">Permit Validity:</span>
                <div className="text-slate-200 font-mono">{p.validFrom} to {p.validTo}</div>
              </div>
              <div className="col-span-full pt-1">
                <span className="text-slate-500">Risk Controls:</span>
                <div className="text-emerald-400 text-[11px] font-medium">{p.riskControls}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <span>Approved by: <strong className="text-slate-200">{p.approver}</strong></span>
              <button
                type="button"
                onClick={() => alert(`Viewing signed PTW audit sheet for ${p.id}`)}
                className="text-blue-400 font-semibold hover:underline"
              >
                View Signed PTW Sheet →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

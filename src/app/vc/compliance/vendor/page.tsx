"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Building,
} from "lucide-react";

export default function VendorCompliancePage() {
  const [vendors] = useState([
    {
      id: "VEND-01",
      name: "Otis Elevator India Pvt Ltd",
      service: "Vertical Transport AMC",
      esiPfStatus: "Verified Valid",
      insuranceExpiry: "2027-03-31",
      status: "Compliant",
      score: 98,
    },
    {
      id: "VEND-02",
      name: "Clean Asset FM Operations Ltd",
      service: "Housekeeping & Facility Ops",
      esiPfStatus: "Verified Valid",
      insuranceExpiry: "2027-06-30",
      status: "Compliant",
      score: 99,
    },
    {
      id: "VEND-03",
      name: "G4S Secure Solutions",
      service: "Manned Guarding & SpeedGates",
      esiPfStatus: "Verified Valid",
      insuranceExpiry: "2026-12-31",
      status: "Due for Renewal",
      score: 91,
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Vendor Compliance (CM-10)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Vendor Statutory & Site Compliance</h1>
          <p className="text-xs text-slate-400">
            Track vendor labour licenses, third-party liability insurance, and wage deposit proofs.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{v.name}</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded">
                  {v.service}
                </span>
              </div>
              <div className="text-slate-400">
                Labour ESI/PF: <span className="text-emerald-400 font-semibold">{v.esiPfStatus}</span> • Insurance Expiry: {v.insuranceExpiry}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-base font-black text-emerald-400">{v.score}%</div>
                <div className="text-[10px] text-slate-500">SLA Score</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                v.status === "Compliant"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {v.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

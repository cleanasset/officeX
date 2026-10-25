"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
} from "lucide-react";

export default function ComplianceReportsPage() {
  const handleExport = () => {
    alert("Exporting Executive Compliance MIS Report to Excel / PDF...");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Reports & Executive MIS (CM-15)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Compliance Intelligence & Audit Reports</h1>
          <p className="text-xs text-slate-400">
            Download audit-ready MIS packages for board meetings, landlord reviews, and government inspections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive MIS (.xlsx)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold uppercase">Overall Health Rating</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">94.5% A+</div>
          <div className="text-[11px] text-slate-500 mt-1">Fully audit-ready score</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold uppercase">Pending Actions (CAPA)</div>
          <div className="text-3xl font-black text-amber-400 mt-1">2 Open</div>
          <div className="text-[11px] text-slate-500 mt-1">All within target SLA</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 font-semibold uppercase">Zero Critical Overdue</div>
          <div className="text-3xl font-black text-blue-400 mt-1">0 Breach</div>
          <div className="text-[11px] text-slate-500 mt-1">Clean statutory standing</div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white">Pre-Packaged MIS Summary Reports</h3>

        <div className="divide-y divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Annual Statutory Life Safety & Fire NOC Audit</div>
              <div className="text-slate-400">Complete documentation bundle with Form 15 and hydrants flow tests.</div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="text-blue-400 font-semibold hover:underline"
            >
              Download PDF →
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Monthly Labour & Security Wage Compliance (CLRA)</div>
              <div className="text-slate-400">ESI, PF, minimum wage registers for all 42 on-site guard & janitor staff.</div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="text-blue-400 font-semibold hover:underline"
            >
              Download PDF →
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Vendor SLA Performance & Penalty Deductions Report</div>
              <div className="text-slate-400">Quarterly reconciliation of elevator maintenance and HVAC chillers.</div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="text-blue-400 font-semibold hover:underline"
            >
              Download PDF →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

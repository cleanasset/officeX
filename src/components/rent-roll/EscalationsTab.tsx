"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Building
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface EscalationRecord {
  id: string;
  leaseId: string;
  leaseCode: string;
  tenantName: string;
  propertyName: string;
  escalationDate: string;
  previousRent: number;
  newRent: number;
  escalationPct: number;
  calculatedIncrease: number;
  status: "pending" | "applied" | "waived" | "disputed";
  appliedAt?: string;
  appliedBy?: string;
  notes?: string;
}

interface EscalationsTabProps {
  escalations: EscalationRecord[];
  onApplyEscalation: (esc: EscalationRecord) => void;
  onWaiveEscalation: (esc: EscalationRecord) => void;
}

export const EscalationsTab: React.FC<EscalationsTabProps> = ({
  escalations,
  onApplyEscalation,
  onWaiveEscalation,
}) => {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredEscalations = escalations.filter((e) => {
    if (filter !== "ALL" && e.status !== filter) return false;
    return true;
  });

  const pendingCount = escalations.filter((e) => e.status === "pending").length;
  const appliedCount = escalations.filter((e) => e.status === "applied").length;
  const totalAnnualIncrease = escalations
    .filter((e) => e.status === "applied")
    .reduce((sum, e) => sum + e.calculatedIncrease * 12, 0);

  return (
    <div className="space-y-4">
      {/* ──── TOP ESCALATION KPI CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Pending Escalations</span>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{pendingCount} Leases</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Ready for review & 1-click execution</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Applied Escalations</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{appliedCount} Executed</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Reflected in active monthly billing</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Annualized Revenue Lift</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{formatINR(totalAnnualIncrease)}/yr</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Net contractual growth from compounding escalations</p>
        </div>
      </div>

      {/* ──── FILTER CONTROLS ──── */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {["ALL", "pending", "applied", "waived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === st
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Escalations" : st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Compounding formula: <span className="text-amber-400 font-mono">New Rent = Prev Rent × (1 + Escalation%)</span>
        </div>
      </div>

      {/* ──── ESCALATIONS TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Lease & Tenant</th>
                <th className="p-3">Property</th>
                <th className="p-3 text-center">Escalation Date</th>
                <th className="p-3 text-right">Previous Rent / Mo</th>
                <th className="p-3 text-center">Escalation %</th>
                <th className="p-3 text-right text-emerald-400 font-bold">Monthly Increase</th>
                <th className="p-3 text-right text-white font-bold">New Base Rent</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredEscalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-white">{esc.tenantName}</div>
                    <span className="font-mono text-amber-400 text-[11px]">{esc.leaseCode}</span>
                  </td>

                  <td className="p-3 text-slate-300">
                    {esc.propertyName}
                  </td>

                  <td className="p-3 text-center font-mono text-slate-300">
                    <span className="flex items-center justify-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{esc.escalationDate}</span>
                    </span>
                  </td>

                  <td className="p-3 text-right font-mono text-slate-400">
                    {formatINR(esc.previousRent)}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded font-semibold text-xs border border-cyan-500/20">
                      +{esc.escalationPct}%
                    </span>
                  </td>

                  <td className="p-3 text-right font-mono text-emerald-400 font-bold bg-emerald-950/10">
                    +{formatINR(esc.calculatedIncrease)}/mo
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-white">
                    {formatINR(esc.newRent)}
                  </td>

                  <td className="p-3 text-center">
                    {esc.status === "applied" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Applied
                      </span>
                    ) : esc.status === "waived" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                        Waived
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {esc.status === "pending" ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onApplyEscalation(esc)}
                          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold rounded text-[11px] shadow-sm transition-all"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => onWaiveEscalation(esc)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[11px] font-medium transition-all"
                        >
                          Waive
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">{esc.appliedAt ? new Date(esc.appliedAt).toLocaleDateString() : "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Pending Escalations</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{pendingCount} Leases</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Ready for review &amp; 1-click execution</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Applied Escalations</span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-1">{appliedCount} Executed</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Reflected in active monthly billing</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Annualized Revenue Lift</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{formatINR(totalAnnualIncrease)}/yr</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Net contractual growth from compounding escalations</p>
        </div>
      </div>

      {/* ──── FILTER CONTROLS ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          {["ALL", "pending", "applied", "waived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === st
                  ? "bg-[#0F8B7D] text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {st === "ALL" ? "All Escalations" : st}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Compounding formula: <span className="text-[#0F8B7D] font-mono font-bold">New Rent = Prev Rent × (1 + Escalation%)</span>
        </div>
      </div>

      {/* ──── ESCALATIONS TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Lease &amp; Tenant</th>
                <th className="p-3.5">Property</th>
                <th className="p-3.5 text-center">Escalation Date</th>
                <th className="p-3.5 text-right">Previous Rent / Mo</th>
                <th className="p-3.5 text-center">Escalation %</th>
                <th className="p-3.5 text-right text-teal-700 font-bold">Monthly Increase</th>
                <th className="p-3.5 text-right font-bold text-gray-900">New Base Rent</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredEscalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900">{esc.tenantName}</div>
                    <span className="font-mono text-indigo-700 text-[11px] font-bold">{esc.leaseCode}</span>
                  </td>

                  <td className="p-3.5 text-gray-600">
                    {esc.propertyName}
                  </td>

                  <td className="p-3.5 text-center font-mono text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{esc.escalationDate}</span>
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-mono text-gray-500">
                    {formatINR(esc.previousRent)}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-xs border border-blue-200">
                      +{esc.escalationPct}%
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-mono text-teal-700 font-bold bg-teal-50/40">
                    +{formatINR(esc.calculatedIncrease)}/mo
                  </td>

                  <td className="p-3.5 text-right font-mono font-black text-gray-900">
                    {formatINR(esc.newRent)}
                  </td>

                  <td className="p-3.5 text-center">
                    {esc.status === "applied" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Applied
                      </span>
                    ) : esc.status === "waived" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        Waived
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    {esc.status === "pending" ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onApplyEscalation(esc)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => onWaiveEscalation(esc)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Waive
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px]">{esc.appliedAt ? new Date(esc.appliedAt).toLocaleDateString() : "—"}</span>
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

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
  Building,
  FileText
} from "lucide-react";
import { formatINR } from "./DashboardTab";
import { EscalationNoticeModal } from "./EscalationNoticeModal";

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
  const [selectedEscalationForNotice, setSelectedEscalationForNotice] = useState<EscalationRecord | null>(null);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Pending Escalations</span>
          <div className="text-xl sm:text-2xl font-black text-blue-900 mt-1">{pendingCount} Leases</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ready for execution</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Applied Escalations</span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 mt-1">{appliedCount} Executed</div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">Reflected in active billing</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Annualized Growth</span>
          <div className="text-xl sm:text-2xl font-black text-amber-800 mt-1">{formatINR(totalAnnualIncrease)}/yr</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Contractual step-up growth</p>
        </div>
      </div>

      {/* ──── FILTER CONTROLS ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2.5 sm:px-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1">
          {["ALL", "pending", "applied", "waived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === st
                  ? "bg-[#0F8B7D] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st === "ALL" ? "All" : st}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Formula: <span className="text-teal-700 font-bold">New Rent = Prev × (1 + %)</span>
        </div>
      </div>

      {/* ──── ESCALATIONS TABLE ──── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-extrabold tracking-wider border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Lease &amp; Tenant</th>
                <th className="p-3">Property</th>
                <th className="p-3 text-center">Escalation Date</th>
                <th className="p-3 text-right">Previous Rent</th>
                <th className="p-3 text-center">Escalation %</th>
                <th className="p-3 text-right text-teal-700 font-bold">Monthly Increase</th>
                <th className="p-3 text-right font-bold text-slate-900">New Base Rent</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredEscalations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No scheduled rent escalations</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Step-up escalation dates and automated annual rent increment notices will appear here once you add leases with escalation terms.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEscalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-xs">{esc.tenantName}</div>
                    <span className="font-mono text-indigo-700 text-[10px] font-bold">{esc.leaseCode}</span>
                  </td>

                  <td className="p-3 text-slate-600 text-xs">
                    {esc.propertyName}
                  </td>

                  <td className="p-3 text-center font-mono text-slate-700 text-xs">
                    <span className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>{esc.escalationDate}</span>
                    </span>
                  </td>

                  <td className="p-3 text-right font-mono text-slate-500">
                    {formatINR(esc.previousRent)}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold text-xs border border-blue-200">
                      +{esc.escalationPct}%
                    </span>
                  </td>

                  <td className="p-3 text-right font-mono text-teal-700 font-bold bg-teal-50/40">
                    +{formatINR(esc.calculatedIncrease)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(esc.newRent)}
                  </td>

                  <td className="p-3 text-center">
                    {esc.status === "applied" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Applied
                      </span>
                    ) : esc.status === "waived" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Waived
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedEscalationForNotice(esc)}
                        title="Generate Official Escalation Notice"
                        className="p-1 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      {esc.status === "pending" ? (
                        <>
                          <button
                            onClick={() => onApplyEscalation(esc)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => onWaiveEscalation(esc)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Waive
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-[11px]">{esc.appliedAt ? new Date(esc.appliedAt).toLocaleDateString() : "—"}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Escalation Notice Modal (RR-10) */}
      <EscalationNoticeModal
        isOpen={Boolean(selectedEscalationForNotice)}
        onClose={() => setSelectedEscalationForNotice(null)}
        escalation={selectedEscalationForNotice}
      />
    </div>
  );
};

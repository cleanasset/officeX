"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  User,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface EscalationCalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function EscalationCalendarView({
  isOpen,
  onClose,
  userRole = "finance",
}: EscalationCalendarViewProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCalendar();
    }
  }, [isOpen]);

  async function loadCalendar() {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch("/api/escalations/calendar");
      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyEscalation(stepId: string) {
    try {
      setApplyingId(stepId);
      setFeedback(null);
      const res = await fetch(`/api/escalations/${stepId}/apply`, {
        method: "POST",
        headers: { "x-user-role": userRole },
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: json.message });
        loadCalendar();
      } else {
        const errorMsg = json.details ? json.details.map((d: any) => d.message).join("; ") : json.error;
        setFeedback({ type: "error", text: errorMsg || "Failed to apply escalation" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setApplyingId(null);
    }
  }

  if (!isOpen) return null;

  const isFinanceUser = ["finance", "owner", "super_admin"].includes(userRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Escalations Calendar (§S-25)</h3>
              <p className="text-xs text-slate-500">
                Track contractual rent step-ups and apply rate increases (RR-CONT-07, Rule 8)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCalendar}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-6 py-3 border-b text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading upcoming escalations...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 text-slate-400 text-xs">
              No scheduled rent step-ups found in this timeframe.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Effective Date</th>
                    <th className="p-3">Contract / Space</th>
                    <th className="p-3">Occupant</th>
                    <th className="p-3">Old Rent Rate</th>
                    <th className="p-3">Escalation Formula</th>
                    <th className="p-3">New Stepped Rate</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((ev) => {
                    const isApplied = ev.status === "applied";
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-700" />
                          {ev.effective_date}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{ev.contract_code}</span>
                          <span className="text-[11px] text-slate-500">{ev.space_name} ({ev.space_code})</span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{ev.occupant_name || "—"}</td>
                        <td className="p-3 text-slate-600 font-medium">₹{ev.old_rent}</td>
                        <td className="p-3">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {ev.escalation_type} (+{ev.escalation_value}%)
                          </span>
                        </td>
                        <td className="p-3 font-bold text-teal-900 text-sm">
                          ₹{ev.new_rent}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isApplied
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isApplied ? (
                            <span className="text-[11px] text-emerald-700 font-medium">Applied ✓</span>
                          ) : (
                            <button
                              disabled={applyingId === ev.id || !isFinanceUser}
                              onClick={() => handleApplyEscalation(ev.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded text-xs transition shadow-xs disabled:opacity-50"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {applyingId === ev.id ? "Applying..." : "Apply Rate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Role Constraint: Only Finance users can apply escalations (§5.7). Retroactive application is blocked.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

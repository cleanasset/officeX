"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Building2,
  FileText,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Bell,
  Send,
  Eye,
  X,
} from "lucide-react";

interface EscalationItem {
  id: string;
  contract_id: string;
  contract_code: string;
  property_name: string;
  space_id?: string;
  space_name: string;
  space_code: string;
  chargeable_area: number;
  occupant_id?: string;
  occupant_name: string;
  component: string;
  charge_name: string;
  effective_date: string;
  days_until_effective: number;
  escalation_type: string;
  escalation_value?: string;
  escalation_pct: number;
  current_rate_psf: number;
  new_rate_psf: number;
  current_monthly_rent: number;
  new_monthly_rent: number;
  monthly_uplift_inr: number;
  status: "upcoming" | "due" | "applied" | "overdue" | "paused";
  source_clause?: string;
  applied_at?: string;
  applied_by?: string;
  notice_template_al03t: string;
}

export default function EscalationsCalendarPage() {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowFilter, setWindowFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [notifyTenantAuto, setNotifyTenantAuto] = useState(true);

  // Modals state
  const [previewItem, setPreviewItem] = useState<EscalationItem | null>(null);
  const [postponeModalItem, setPostponeModalItem] = useState<EscalationItem | null>(null);
  const [postponeAction, setPostponeAction] = useState<"postpone" | "waive">("postpone");
  const [newEffectiveDate, setNewEffectiveDate] = useState("");
  const [auditReason, setAuditReason] = useState("");
  const [submittingAudit, setSubmittingAudit] = useState(false);

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        window: windowFilter,
        status: statusFilter,
        search: search.trim(),
      });
      const res = await fetch(`/api/escalations/calendar?${query.toString()}`);
      const json = await res.json();
      if (json.success || json.data || json.escalations) {
        setEscalations(json.data || json.escalations || []);
      }
    } catch (e: any) {
      console.error("Failed to load escalations:", e);
      setNotification({ type: "error", text: "Failed to connect to escalations service" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, [windowFilter, statusFilter]);

  const handleApplySingle = async (esc: EscalationItem) => {
    const isOverdue = esc.status === "overdue";
    const confirmPrompt = isOverdue
      ? `[AL-04 Resolution] Apply OVERDUE ${esc.escalation_pct}% escalation for contract ${esc.contract_code} (${esc.occupant_name})?\n\nNew monthly rent will increase from ₹${esc.current_monthly_rent.toLocaleString("en-IN")} to ₹${esc.new_monthly_rent.toLocaleString("en-IN")}. Base contract charge rate will update immediately.`
      : `Apply scheduled ${esc.escalation_pct}% escalation for contract ${esc.contract_code} (${esc.occupant_name})?\n\nNew monthly rent will increase from ₹${esc.current_monthly_rent.toLocaleString("en-IN")} to ₹${esc.new_monthly_rent.toLocaleString("en-IN")}.`;

    if (!confirm(confirmPrompt)) return;

    try {
      setApplyingId(esc.id);
      const res = await fetch(`/api/escalations/${esc.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force_apply: isOverdue }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotification({ type: "success", text: json.message });
        fetchEscalations();
      } else {
        setNotification({ type: "error", text: json.error || "Failed to apply escalation" });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setApplyingId(null);
    }
  };

  const handleBulkApply = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apply and approve ${selectedIds.length} selected escalation step(s)?`)) return;

    try {
      setBulkApplying(true);
      const res = await fetch("/api/escalations/bulk-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_ids: selectedIds }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotification({ type: "success", text: json.message });
        setSelectedIds([]);
        fetchEscalations();
      } else {
        setNotification({ type: "error", text: json.error || "Bulk apply failed" });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setBulkApplying(false);
    }
  };

  const handlePostponeOrWaiveSubmit = async () => {
    if (!postponeModalItem) return;
    if (!auditReason.trim() || auditReason.length < 5) {
      alert("Please provide a valid audit reason (min 5 characters).");
      return;
    }

    try {
      setSubmittingAudit(true);
      const res = await fetch(`/api/escalations/${postponeModalItem.id}/postpone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: postponeAction,
          new_effective_date: newEffectiveDate,
          reason: auditReason,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotification({ type: "success", text: json.message });
        setPostponeModalItem(null);
        setAuditReason("");
        setNewEffectiveDate("");
        fetchEscalations();
      } else {
        alert(json.error || "Failed to process request");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingAudit(false);
    }
  };

  const toggleSelectAll = () => {
    const unappliedIds = escalations.filter((e) => e.status !== "applied").map((e) => e.id);
    if (selectedIds.length === unappliedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unappliedIds);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Metrics
  const dueCount = escalations.filter((e) => e.status === "due").length;
  const overdueCount = escalations.filter((e) => e.status === "overdue").length;
  const appliedCount = escalations.filter((e) => e.status === "applied").length;
  const totalUpcomingUplift = escalations
    .filter((e) => e.status !== "applied")
    .reduce((s, e) => s + (e.monthly_uplift_inr || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-[#0F8B7D]/10 text-[#0F8B7D] rounded-full border border-[#0F8B7D]/20">
              Screen S-25 &middot; Escalation Calendar & Apply
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              Alerts AL-03 & AL-04 (Checker Approval)
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              Formulas D-08, D-09, D-21
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rent Escalation Calendar & Rate Step Execution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Apply contracted rent steps with Finance Checker approval, manage overdue notices (AL-04), and notify occupants 30 days prior (AL-03T).
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Notification Toggle */}
          <button
            onClick={() => setNotifyTenantAuto(!notifyTenantAuto)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              notifyTenantAuto
                ? "bg-teal-50 border-teal-200 text-teal-800"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
            title="Auto-dispatch AL-03T notice to tenant portal 30 days prior"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notify occupants 30d before: {notifyTenantAuto ? "ON" : "OFF"}</span>
          </button>

          <Link
            href="/operate/forecast"
            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
          >
            12-Mo Forecast (S-51)
          </Link>

          <button
            onClick={fetchEscalations}
            disabled={loading}
            className="p-2 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Escalations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0F8B7D]" : ""}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Due Soon (&le;30 Days)
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {dueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Triggering Alert AL-03
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${
          overdueCount > 0 ? "bg-rose-50/70 border-rose-200" : "bg-white border-slate-200/80"
        }`}>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1 text-slate-500">
            Overdue Unapplied (AL-04)
          </span>
          <div className={`text-xl sm:text-2xl font-black ${overdueCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Critical exception; uses old rate
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Projected Monthly Uplift
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0F8B7D]">
            +₹{Math.round(totalUpcomingUplift).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Formula D-09 next step cashflow
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Committed / Applied
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {appliedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active in current billing run
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar per Wireframe S-25 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "list" ? "bg-white shadow-xs text-slate-900 font-bold" : "text-slate-500"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "calendar" ? "bg-white shadow-xs text-slate-900 font-bold" : "text-slate-500"
              }`}
            >
              Calendar View
            </button>
          </div>

          {/* Window filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Window:</span>
            <select
              value={windowFilter}
              onChange={(e) => setWindowFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="90d">Next 90 days (K-10)</option>
              <option value="180d">Next 180 days</option>
              <option value="365d">Next 365 days</option>
              <option value="all">All Dates</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Due, Scheduled, Overdue, Applied</option>
              <option value="due">Due (&le;30 Days)</option>
              <option value="overdue">Overdue (AL-04)</option>
              <option value="scheduled">Scheduled (&gt;30 Days)</option>
              <option value="applied">Applied</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search contract, occupant, space..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEscalations()}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
          />
        </div>
      </div>

      {/* Multi-select Action Bar per Wireframe S-25: "Selected N [Apply selected -> approval]" */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0F8B7D] text-white p-3 rounded-xl flex items-center justify-between shadow-md animate-in fade-in duration-150">
          <div className="text-xs font-bold flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{selectedIds.length}</span>
            <span>Escalation step(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Clear
            </button>
            <button
              onClick={handleBulkApply}
              disabled={bulkApplying}
              className="px-3.5 py-1 bg-white text-[#0F8B7D] rounded-lg text-xs font-black hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply selected &rarr; Approval</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View (< sm screens) */}
      <div className="sm:hidden space-y-3">
        {escalations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Escalations Found</div>
            <p className="text-xs text-slate-500 mt-1">No scheduled rent steps match the current filter window.</p>
          </div>
        ) : (
          escalations.map((esc) => {
            const isApplied = esc.status === "applied";
            const isOverdue = esc.status === "overdue";
            const isDue = esc.status === "due";
            const isSelected = selectedIds.includes(esc.id);

            return (
              <div
                key={esc.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition ${
                  isOverdue ? "border-rose-300 bg-rose-50/20" : isDue ? "border-amber-300 bg-amber-50/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {!isApplied && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(esc.id)}
                        className="mt-1 rounded text-[#0F8B7D] focus:ring-[#0F8B7D]"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{esc.occupant_name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {esc.contract_code} &bull; {esc.space_name} ({esc.chargeable_area.toLocaleString("en-IN")} sqft)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isApplied
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isOverdue
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : isDue
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {isOverdue ? "Overdue (AL-04)" : isDue ? "Due (AL-03)" : esc.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Date:</span>
                    <span className="font-bold text-slate-900">{esc.effective_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rate Step Jump:</span>
                    <span className="font-mono text-slate-800">
                      ₹{esc.current_rate_psf} &rarr; <strong className="text-[#0F8B7D]">₹{esc.new_rate_psf} psf</strong> ({esc.escalation_pct}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clause Basis:</span>
                    <span className="text-slate-700 italic">{esc.source_clause}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Uplift (D-09)</div>
                    <div className="text-base font-black text-[#0F8B7D] font-mono">
                      +₹{esc.monthly_uplift_inr.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewItem(esc)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      title="Preview AL-03T Notice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {!isApplied ? (
                      <>
                        <button
                          onClick={() => {
                            setPostponeModalItem(esc);
                            setPostponeAction("postpone");
                            setNewEffectiveDate(esc.effective_date);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          Waive/Defer
                        </button>
                        <button
                          onClick={() => handleApplySingle(esc)}
                          disabled={applyingId === esc.id}
                          className="px-3 py-1 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= sm screens) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === escalations.filter((e) => e.status !== "applied").length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-[#0F8B7D] focus:ring-[#0F8B7D]"
                    title="Select all unapplied"
                  />
                </th>
                <th className="py-3 px-4">Effective</th>
                <th className="py-3 px-4">Contract & Occupant</th>
                <th className="py-3 px-4">Space & Area</th>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4 text-right">Old Rate (₹)</th>
                <th className="py-3 px-4 text-right font-bold">New Rate (₹)</th>
                <th className="py-3 px-4 text-right font-bold text-[#0F8B7D]">Uplift/mo (D-09)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No scheduled escalations found for selected window.
                  </td>
                </tr>
              ) : (
                escalations.map((esc) => {
                  const isApplied = esc.status === "applied";
                  const isOverdue = esc.status === "overdue";
                  const isDue = esc.status === "due";
                  const isSelected = selectedIds.includes(esc.id);

                  return (
                    <tr
                      key={esc.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isOverdue ? "bg-rose-50/30" : isDue ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {!isApplied && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(esc.id)}
                            className="rounded text-[#0F8B7D] focus:ring-[#0F8B7D]"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {esc.effective_date}
                        {isOverdue && (
                          <div className="text-[10px] text-rose-600 font-normal">
                            Overdue ({Math.abs(esc.days_until_effective)}d ago)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{esc.occupant_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {esc.contract_code} &bull; {esc.property_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{esc.space_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {esc.chargeable_area.toLocaleString("en-IN")} sqft
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {esc.charge_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ₹{esc.current_rate_psf} psf
                        <div className="text-[10px] text-slate-400">
                          ₹{esc.current_monthly_rent.toLocaleString("en-IN")}/mo
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{esc.new_rate_psf} psf
                        <div className="text-[10px] text-[#0F8B7D] font-bold">
                          +{esc.escalation_pct}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[#0F8B7D]">
                        +₹{esc.monthly_uplift_inr.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                            isApplied
                              ? "bg-emerald-100 text-emerald-800"
                              : isOverdue
                              ? "bg-rose-100 text-rose-800 font-black border border-rose-200"
                              : isDue
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isOverdue ? "Overdue (AL-04)" : isDue ? "Due (AL-03)" : esc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewItem(esc)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            title="Preview AL-03T Tenant Notice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isApplied ? (
                            <>
                              <button
                                onClick={() => {
                                  setPostponeModalItem(esc);
                                  setPostponeAction("postpone");
                                  setNewEffectiveDate(esc.effective_date);
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-semibold transition"
                                title="Postpone or Waive with Audit Reason"
                              >
                                Waive/Defer
                              </button>
                              <button
                                onClick={() => handleApplySingle(esc)}
                                disabled={applyingId === esc.id}
                                className="px-2.5 py-1 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="w-3 h-3" /> Apply
                              </button>
                            </>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: AL-03T Tenant Notification Preview Modal (§S-25) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0F8B7D]" />
                <h3 className="font-bold text-sm text-slate-900">
                  AL-03T &middot; Tenant 30-Day Escalation Notice
                </h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-600">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-sans uppercase font-bold tracking-wider">
                  Dispatched via Email & Tenant Portal (T-01/T-07)
                </div>
                <div className="font-sans text-sm font-semibold text-slate-900">
                  {previewItem.notice_template_al03t}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Contract Details</div>
                <div>Contract: <strong>{previewItem.contract_code}</strong></div>
                <div>Tenant: <strong>{previewItem.occupant_name}</strong></div>
                <div>Space: <strong>{previewItem.space_name} ({previewItem.chargeable_area.toLocaleString("en-IN")} sqft)</strong></div>
                <div>New Monthly Base Rent: <strong>₹{previewItem.new_monthly_rent.toLocaleString("en-IN")}</strong></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Postpone / Waive Escalation with Mandatory Audit Reason (§2.4, RR-CONT-07) */}
      {postponeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Postpone or Waive Rate Step ({postponeModalItem.contract_code})
                </h3>
              </div>
              <button onClick={() => setPostponeModalItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Action Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="postpone_action"
                      checked={postponeAction === "postpone"}
                      onChange={() => setPostponeAction("postpone")}
                      className="text-[#0F8B7D] focus:ring-[#0F8B7D]"
                    />
                    <span>Postpone / Defer Effective Date</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="postpone_action"
                      checked={postponeAction === "waive"}
                      onChange={() => setPostponeAction("waive")}
                      className="text-[#0F8B7D] focus:ring-[#0F8B7D]"
                    />
                    <span>Waive Uplift (0% for current cycle)</span>
                  </label>
                </div>
              </div>

              {postponeAction === "postpone" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Effective Date</label>
                  <input
                    type="date"
                    value={newEffectiveDate}
                    onChange={(e) => setNewEffectiveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mandatory Audit Reason (§2.4 Compliance) *
                </label>
                <textarea
                  rows={3}
                  placeholder="State commercial rationale for deferral or waiver (e.g. Fit-out delay addendum signed, owner concession agreed)..."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPostponeModalItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostponeOrWaiveSubmit}
                disabled={submittingAudit}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {submittingAudit ? "Saving..." : "Confirm & Record Audit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

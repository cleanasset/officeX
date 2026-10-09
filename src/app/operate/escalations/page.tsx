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
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface EscalationItem {
  id: string;
  contract_id: string;
  contract_code: string;
  occupant_name: string;
  property_name: string;
  space_name: string;
  chargeable_area: number;
  current_rate_psf: number;
  current_monthly_rent: number;
  escalation_type: string;
  escalation_pct?: number;
  effective_date: string;
  new_rate_psf: number;
  new_monthly_rent: number;
  monthly_uplift_inr: number;
  status: "upcoming" | "due" | "applied" | "paused";
  source_clause?: string;
  applied_at?: string;
  applied_by?: string;
}

export default function EscalationsCalendarPage() {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/escalations/calendar");
      const json = await res.json();
      if (json.success || json.escalations) {
        setEscalations(json.escalations || []);
      }
    } catch (e) {
      console.error("Failed to load escalations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleApplyEscalation = async (esc: EscalationItem) => {
    if (
      !confirm(
        `Apply scheduled ${esc.escalation_pct || 5}% escalation for contract ${esc.contract_code} (${esc.occupant_name})?\n\nNew monthly rent will increase from ₹${esc.current_monthly_rent.toLocaleString("en-IN")} to ₹${esc.new_monthly_rent.toLocaleString("en-IN")}.`
      )
    ) {
      return;
    }

    try {
      setApplyingId(esc.id);
      const res = await fetch(`/api/escalations/${esc.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "Escalation applied successfully! Contract rate and future revenue forecast updated.");
        fetchEscalations();
      } else {
        alert(json.error || "Failed to apply escalation");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = escalations.filter((esc) => {
    if (filterPeriod !== "all" && esc.status !== filterPeriod) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        esc.contract_code.toLowerCase().includes(q) ||
        esc.occupant_name.toLowerCase().includes(q) ||
        esc.property_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalUpcomingUplift = escalations
    .filter((e) => e.status !== "applied")
    .reduce((s, e) => s + (e.monthly_uplift_inr || 0), 0);

  const dueCount = escalations.filter((e) => e.status === "due" || e.status === "upcoming").length;
  const appliedCount = escalations.filter((e) => e.status === "applied").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Screen S-25 &middot; Escalation Calendar
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Formulas F-03 to F-06
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rent Escalation Calendar & Rate Uplifts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review upcoming contracted rent escalations, verify lease escalation clauses (AL-02 / AL-03), and commit rate increases into future billing runs.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/operate/forecast"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200"
          >
            12-Month Forecast (S-51)
          </Link>

          <button
            onClick={fetchEscalations}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Escalations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Pending Escalations
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {dueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Leases due for rent adjustment
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Projected Monthly Uplift
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            +₹{Math.round(totalUpcomingUplift).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Incremental monthly cashflow
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Applied Rate Steps
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {appliedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Committed to live invoicing
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Standard Escalation Cycle
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            15% / 3 Years
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Grade-A institutional benchmark
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search contract, tenant, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "due", "upcoming", "applied"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterPeriod(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition ${
                filterPeriod === st ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Escalations Found</div>
            <p className="text-xs text-slate-500 mt-1">No scheduled rent steps matching this period filter.</p>
          </div>
        ) : (
          filtered.map((esc) => (
            <div key={esc.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{esc.occupant_name}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{esc.contract_code} &bull; {esc.property_name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  esc.status === "applied" ? "bg-emerald-100 text-emerald-800" :
                  esc.status === "due" ? "bg-rose-100 text-rose-800" :
                  "bg-indigo-100 text-indigo-800"
                }`}>
                  {esc.status}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Effective Date:</span>
                  <span className="font-bold text-slate-900">{esc.effective_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate Jump:</span>
                  <span className="font-mono text-slate-800">₹{esc.current_rate_psf} &rarr; <strong className="text-indigo-700">₹{esc.new_rate_psf} psf</strong> ({esc.escalation_pct || 5}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Uplift</div>
                  <div className="text-base font-black text-indigo-700 font-mono">+₹{esc.monthly_uplift_inr.toLocaleString("en-IN")}</div>
                </div>

                {esc.status !== "applied" ? (
                  <button
                    onClick={() => handleApplyEscalation(esc)}
                    disabled={applyingId === esc.id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Apply
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Contract & Occupant</th>
                <th className="py-3 px-4">Space & Area</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4 text-right">Current Rent (₹)</th>
                <th className="py-3 px-4 text-center">Mechanism</th>
                <th className="py-3 px-4 text-right font-bold">New Rent (₹)</th>
                <th className="py-3 px-4 text-right">Monthly Uplift</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No scheduled escalations matching selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((esc) => (
                  <tr key={esc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{esc.occupant_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{esc.contract_code} &bull; {esc.property_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{esc.space_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{esc.chargeable_area.toLocaleString("en-IN")} sqft</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{esc.effective_date}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{esc.current_monthly_rent.toLocaleString("en-IN")}
                      <div className="text-[10px] text-slate-400">₹{esc.current_rate_psf} psf</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">
                      {esc.escalation_type.toUpperCase()} ({esc.escalation_pct || 5}%)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{esc.new_monthly_rent.toLocaleString("en-IN")}
                      <div className="text-[10px] text-indigo-600 font-bold">₹{esc.new_rate_psf} psf</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-700">
                      +₹{esc.monthly_uplift_inr.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        esc.status === "applied" ? "bg-emerald-100 text-emerald-800" :
                        esc.status === "due" ? "bg-rose-100 text-rose-800" :
                        "bg-indigo-100 text-indigo-800"
                      }`}>
                        {esc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {esc.status !== "applied" ? (
                        <button
                          onClick={() => handleApplyEscalation(esc)}
                          disabled={applyingId === esc.id}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" /> Apply
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

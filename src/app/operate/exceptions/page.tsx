"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ExceptionItem {
  id: string;
  category: "contract" | "billing" | "collection" | "compliance";
  code: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  entity_type: string;
  entity_id?: string;
  entity_name: string;
  action_label: string;
  action_href: string;
  created_at: string;
  status: "open" | "in_progress" | "resolved";
}

export default function ExceptionCentrePage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [k23Score, setK23Score] = useState<number>(98.5);
  const [counts, setCounts] = useState<any>({
    total: 0,
    contract: 0,
    billing: 0,
    collection: 0,
    compliance: 0,
    critical: 0,
    warning: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exceptions");
      const json = await res.json();
      if (json.success) {
        setExceptions(json.exceptions || []);
        setK23Score(json.k23_data_quality_score || 98.5);
        setCounts(json.counts || {});
      }
    } catch (e) {
      console.error("Failed to fetch exceptions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const filtered = exceptions.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.entity_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case "warning":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">ACTION</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">INFO</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
              Screen S-50 &middot; Exception Centre
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Phase P5
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Audit Exception Centre & Data Quality
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central audit queue tracking all 4 exception categories (Contract, Billing, Collection, Compliance) and calculating the K-23 Data Quality Score.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchExceptions}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Exceptions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/operate/snapshots"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            Month-End Lock (S-53)
          </Link>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* K-23 Data Quality Score Tile */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
              K-23 Data Quality
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Target &ge; 98%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {k23Score}%
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              {k23Score >= 98 ? "Grade-A" : "Review"}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 mt-2">
            Clean records &divide; total portfolio records
          </div>
        </div>

        {/* Contract Exceptions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contract Exceptions
            </span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {counts.contract}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Missing agreements & holding-over
          </div>
        </div>

        {/* Billing Exceptions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Billing Exceptions
            </span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {counts.billing}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Seats, meters & GSTIN checks
          </div>
        </div>

        {/* Collection & Compliance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Arrears & Expiries
            </span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {(counts.collection || 0) + (counts.compliance || 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Arrears &gt; 30d & Bank Guarantee
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search exceptions, occupant, rule code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "contract", "billing", "collection", "compliance"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? `All (${exceptions.length})` : `${cat} (${counts[cat] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Exceptions Register List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-slate-700">All Exceptions Clear!</div>
              <p className="text-xs text-slate-500 mt-1">
                Zero open integrity exceptions detected across Contract, Billing, Collection, and Compliance.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {item.severity === "critical" ? (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {item.title}
                      </span>
                      {getSeverityBadge(item.severity)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {item.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 capitalize">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span>Entity: <strong className="text-slate-700">{item.entity_name}</strong></span>
                      <span>&bull;</span>
                      <span>Detected: {new Date(item.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link
                    href={item.action_href}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {item.action_label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

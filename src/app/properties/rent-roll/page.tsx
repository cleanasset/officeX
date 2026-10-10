"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Sparkles,
  CreditCard,
  Briefcase,
  FileText,
  Gauge,
  Users,
  Info,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

// Rent Roll Modular Subcomponents (§S-10–S-25)
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";
import DocumentViewerModal from "@/components/rent-roll/DocumentViewerModal";
import DealsRegisterView from "@/components/rent-roll/DealsRegisterView";
import ExpiryPipelineView from "@/components/rent-roll/ExpiryPipelineView";
import EscalationCalendarView from "@/components/rent-roll/EscalationCalendarView";
import MasterDataModal from "@/components/rent-roll/MasterDataModal";
import { DataImportView } from "@/components/rent-roll/DataImportView";
import PaymentsCollectionsView from "@/components/rent-roll/PaymentsCollectionsView";
import MultiClientFlexView from "@/components/rent-roll/MultiClientFlexView";

export default function RentRollRegisterPage() {
  // As-of-date and Views (§S-10)
  const [asOfDate, setAsOfDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [currentView, setCurrentView] = useState<"current" | "contracted" | "forecast">("current");
  const [importOpen, setImportOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [multiClientOpen, setMultiClientOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  // Register Data
  const [registerData, setRegisterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selected Contract for 480px Drawer (§S-22)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<any>(null);
  const [dealsOpen, setDealsOpen] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);

  // Document Viewer Modal (§S-23)
  const [viewerDoc, setViewerDoc] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Capacity Quota & Grace Period Telemetry (§OI-8 Commercial Policy)
  // Quota: 50,00,00,000 Sq.Ft (50 Crore sq.ft) with 90% warning threshold (45 Crore sq.ft)
  const MAX_FREE_CAPACITY_SQFT = 500_000_000;
  const [showGracePeriodModal, setShowGracePeriodModal] = useState(false);

  const effectiveAumSqft = Number(registerData?.summary?.total_leasable_area_sqft || 0);
  const capacityPercent = Math.min(100, Math.max(0, (effectiveAumSqft / MAX_FREE_CAPACITY_SQFT) * 100));
  const percentRemaining = Math.max(0, 100 - capacityPercent);
  // STRICT REQUIREMENT: Only triggers when strictly 2% or less capacity remains
  const isApproachingLimit = percentRemaining <= 2 && percentRemaining > 0 && effectiveAumSqft > 0;

  useEffect(() => {
    fetchRegisterData();
  }, [asOfDate, currentView, propertyFilter, expiryFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScope = localStorage.getItem("officex_selected_property");
      if (savedScope) setPropertyFilter(savedScope);

      const handlePropertyUpdate = (e: any) => {
        if (e.detail?.propertyId) {
          setPropertyFilter(e.detail.propertyId);
        }
      };
      window.addEventListener("officex-property-change", handlePropertyUpdate);
      return () => window.removeEventListener("officex-property-change", handlePropertyUpdate);
    }
  }, []);

  async function fetchRegisterData() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("as_of_date", asOfDate);
      params.set("view", currentView);
      if (propertyFilter !== "all") params.set("property_id", propertyFilter);
      if (expiryFilter !== "all") params.set("expiry_window", expiryFilter);

      const res = await fetch(`/api/rent-roll/register?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRegisterData(json);
      }
    } catch (err) {
      console.error("Failed to load rent roll register", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter rows based on search
  const visibleRows = useMemo(() => {
    if (!registerData?.rows) return [];
    if (!searchQuery.trim()) return registerData.rows;
    const q = searchQuery.toLowerCase();
    return registerData.rows.filter(
      (r: any) =>
        r.contract_code?.toLowerCase().includes(q) ||
        r.space_name?.toLowerCase().includes(q) ||
        r.space_code?.toLowerCase().includes(q) ||
        r.occupant_name?.toLowerCase().includes(q) ||
        r.property_name?.toLowerCase().includes(q)
    );
  }, [registerData, searchQuery]);

  // Export CSV Handler with Role Masking (RR-VW-06)
  function handleExportCSV() {
    if (!visibleRows.length) return;
    const headers = [
      "Row Type",
      "Contract Code",
      "Space Code",
      "Space Name",
      "Occupant",
      "Area (sqft)",
      "Monthly Base Rent (INR)",
      "Start Date",
      "Expiry Date",
      "Status",
    ];

    const csvLines = [headers.join(",")];
    visibleRows.forEach((r: any) => {
      csvLines.push(
        [
          `"${r.type}"`,
          `"${r.contract_code}"`,
          `"${r.space_code}"`,
          `"${r.space_name}"`,
          `"${r.occupant_name}"`,
          r.area_sqft || 0,
          r.monthly_base_rent || 0,
          `"${r.start_date}"`,
          `"${r.expiry_date}"`,
          `"${r.status}"`,
        ].join(",")
      );
    });

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rent_Roll_Register_${asOfDate}_${currentView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      {/* Canonical Left Sidebar */}
      <Sidebar />

      {/* Main Panel beside Sidebar */}
      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <div className="flex-1 mt-[60px] min-w-0 max-w-full">
          {/* Main SaaS Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-28 md:pb-8">
            {/* Clean Executive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Link href="/properties" className="hover:text-slate-800 transition">Portfolio</Link>
                  <span>/</span>
                  <span className="text-[#0F8B7D] font-bold">Rent Roll</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Rent Roll Register
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Schedule of leasable commercial spaces, active occupant agreements, and step escalations.
                </p>
              </div>

              {/* Clean Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-teal-600" />
                  <span>Import Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Clock size={14} className="text-amber-600" />
                  <span>Expiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEscalationOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <TrendingUp size={14} className="text-indigo-600" />
                  <span>Escalations</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWizardPrefill(null);
                    setWizardOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={15} />
                  <span>New Contract</span>
                </button>
              </div>
            </div>

            {/* Capacity Warning Alert (Only triggers when capacity approaches 90%+ / 5% remaining) */}
            {isApproachingLimit && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-linear-to-r from-amber-50 via-orange-50/60 to-amber-50 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                          Capacity Warning · 2% or Less Remaining (98%+ Threshold)
                        </span>
                        <span className="text-xs font-bold text-teal-900 bg-teal-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                          Grace Period Active (Zero Lockout)
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        Approaching Licensed Quota ({effectiveAumSqft.toLocaleString("en-IN")} / 50,00,00,000 Sq.Ft · {capacityPercent.toFixed(1)}%)
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                        Under OfficeX commercial policies, operations are never hard-locked. Invoicing, agreement generation, rent collection, and sub-meter logging continue uninterrupted during your commercial grace period.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
                    <Link
                      href="/operate/rent-roll/pricing"
                      className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>Expand Quota (From ₹50/sq.ft)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setShowGracePeriodModal(true)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition"
                    >
                      Grace Policy
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex-1 w-full bg-amber-200/80 h-2 rounded-full overflow-hidden mr-4">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, capacityPercent)}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-amber-950 shrink-0">
                    {effectiveAumSqft.toLocaleString("en-IN")} / 50,00,00,000 Sq.Ft · {capacityPercent.toFixed(1)}% Capacity
                  </div>
                </div>
              </div>
            )}

        {/* KPI Summary Tiles (§2.3 List Page Pattern) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Base Rent
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ₹{Number(registerData?.summary?.total_monthly_base_rent || 0).toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> As of {asOfDate}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Occupied Leasable Area
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {Number(registerData?.summary?.total_occupied_area_sqft || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">sqft</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {registerData?.summary?.active_contracts_count || 0} active agreements
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Leasable Area
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {Number(registerData?.summary?.total_leasable_area_sqft || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">sqft</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {Number(registerData?.summary?.total_vacant_area_sqft || 0).toLocaleString()} sqft vacant
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Portfolio Vacancy Rate
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {registerData?.summary?.vacancy_rate_percent ?? 0}%
            </p>
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              {registerData?.summary?.vacant_spaces_count || 0} vacant demised spaces
            </span>
          </div>
        </div>

        {/* View Tabs & Control Filter Bar (§S-10) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Top Bar: View Selector & As-of-Date */}
          <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
            {/* View Selector: Current / Contracted / Forecast (§S-10) */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCurrentView("current")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === "current"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Current View
              </button>
              <button
                onClick={() => setCurrentView("contracted")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === "contracted"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contracted (+ Future)
              </button>
              <button
                onClick={() => setCurrentView("forecast")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === "forecast"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Forecast (+ Deals Weighted)
              </button>
            </div>

            {/* As-of-Date Picker (recalculates register for that date) */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-xs">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span className="font-medium text-slate-600">As of Date:</span>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="border-none font-semibold text-slate-900 focus:outline-none bg-transparent"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </button>

              <button
                onClick={fetchRegisterData}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter Options Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by contract code, occupant, space, property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded-xl bg-white text-xs text-slate-700"
              >
                <option value="all">All Expiry Horizons</option>
                <option value="1">Expiring in 1 Month</option>
                <option value="3">Expiring in 3 Months</option>
                <option value="6">Expiring in 6 Months</option>
                <option value="12">Expiring in 12 Months</option>
              </select>
            </div>
          </div>

          {/* Mobile Native App Cards (sm:hidden) */}
          <div className="sm:hidden p-3 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Recalculating rent roll register for {asOfDate}...
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No contracts or spaces matching the filter.
              </div>
            ) : (
              <>
                {visibleRows.map((r: any) => {
                  const isVacant = r.type === "vacant_space";
                  const isDeal = r.type === "forecast_deal";
                  const isFuture = r.status === "future";

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        if (!isVacant && !isDeal) {
                          setSelectedContractId(r.id);
                          setDrawerOpen(true);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition active:scale-[0.99] cursor-pointer shadow-2xs ${
                        isVacant
                          ? "bg-slate-50 border-slate-200 text-slate-500"
                          : isDeal
                          ? "bg-amber-50/60 border-amber-200 text-amber-950"
                          : isFuture
                          ? "bg-blue-50/60 border-blue-200 text-blue-950"
                          : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-sm text-slate-900 truncate">
                            {isVacant ? "(Vacant Space)" : r.occupant_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700">{r.space_name}</span>
                            <span className="font-mono text-[10px] text-slate-400">({r.space_code})</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${
                            isVacant
                              ? "bg-slate-200 text-slate-600"
                              : isDeal
                              ? "bg-amber-100 text-amber-800"
                              : isFuture
                              ? "bg-blue-100 text-blue-800"
                              : r.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {r.status?.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Rent</span>
                          <span className="font-mono font-bold text-teal-900 text-sm">
                            {isVacant
                              ? `(₹${Number(r.asking_rent || 0).toLocaleString("en-IN")})`
                              : `₹${Math.round(r.monthly_base_rent || 0).toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Area</span>
                          <span className="font-mono font-bold text-slate-700">
                            {r.area_sqft ? Number(r.area_sqft).toLocaleString() : "—"} sqft
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Term: {r.start_date !== "—" ? `${r.start_date} → ${r.end_date}` : "—"}</span>
                        {!isVacant && !isDeal && (
                          <span className="text-teal-700 font-bold flex items-center gap-0.5">
                            Details <ChevronRight size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Totals Footer Card */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                    TOTAL REGISTER VALUE ({visibleRows.length} ROWS)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">
                      {visibleRows.reduce((sum: number, r: any) => sum + (r.area_sqft || 0), 0).toLocaleString()} sqft
                    </span>
                    <span className="font-mono font-bold text-base text-white">
                      ₹{Math.round(visibleRows.reduce((sum: number, r: any) => sum + (r.monthly_base_rent || 0), 0)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Spreadsheet Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Space & Code</th>
                  <th className="p-3.5">Occupant / Lessee</th>
                  <th className="p-3.5 text-right">Area (sqft)</th>
                  <th className="p-3.5 text-right">Monthly Base Rent</th>
                  <th className="p-3.5">Lease Term</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      Recalculating rent roll register for {asOfDate}...
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <FileText className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="font-bold text-slate-700 text-sm">No contracts or spaces recorded yet</span>
                        <span className="text-xs text-slate-400">Initialize your rent roll register by creating your first lease contract or importing data.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setWizardPrefill(null);
                            setWizardOpen(true);
                          }}
                          className="mt-2 px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0c7064] transition shadow-xs cursor-pointer"
                        >
                          + Add First Contract
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r: any) => {
                    const isVacant = r.type === "vacant_space";
                    const isDeal = r.type === "forecast_deal";
                    const isFuture = r.status === "future";

                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          if (!isVacant && !isDeal) {
                            setSelectedContractId(r.id);
                            setDrawerOpen(true);
                          }
                        }}
                        className={`transition cursor-pointer ${
                          isVacant
                            ? "bg-slate-100/70 text-slate-500 hover:bg-slate-200/50"
                            : isDeal
                            ? "bg-amber-50/40 text-amber-900 italic hover:bg-amber-100/50"
                            : isFuture
                            ? "bg-blue-50/40 hover:bg-blue-100/50 text-blue-950"
                            : "hover:bg-slate-50/80 text-slate-900"
                        }`}
                      >
                        {/* Space */}
                        <td className="p-3.5">
                          <span className="font-bold block">{r.space_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{r.space_code}</span>
                        </td>

                        {/* Occupant */}
                        <td className="p-3.5">
                          {isVacant ? (
                            <span className="text-slate-400 italic">(Vacant Space)</span>
                          ) : isDeal ? (
                            <span className="font-semibold text-amber-800">{r.occupant_name}</span>
                          ) : (
                            <div>
                              <strong className="block">{r.occupant_name}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">{r.contract_code}</span>
                            </div>
                          )}
                        </td>

                        {/* Area */}
                        <td className="p-3.5 text-right font-mono font-medium">
                          {r.area_sqft ? Number(r.area_sqft).toLocaleString() : "—"}
                        </td>

                        {/* Monthly Base Rent */}
                        <td className="p-3.5 text-right font-mono">
                          {isVacant ? (
                            <span className="text-slate-400">
                              (₹{Number(r.asking_rent || 0).toLocaleString("en-IN")})
                            </span>
                          ) : isDeal ? (
                            <span className="font-semibold text-amber-800">
                              ₹{Math.round(r.monthly_base_rent || 0).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <strong className="text-teal-900 font-bold">
                              ₹{Math.round(r.monthly_base_rent || 0).toLocaleString("en-IN")}
                            </strong>
                          )}
                        </td>

                        {/* Lease Term */}
                        <td className="p-3.5 text-[11px] text-slate-500">
                          {r.start_date !== "—" ? `${r.start_date} → ${r.end_date}` : "—"}
                        </td>

                        {/* Expiry Date */}
                        <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-700">
                          {r.expiry_date || "—"}
                        </td>

                        {/* Status Chip */}
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isVacant
                                ? "bg-slate-200 text-slate-600"
                                : isDeal
                                ? "bg-amber-100 text-amber-800"
                                : isFuture
                                ? "bg-blue-100 text-blue-800"
                                : r.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "notice_served"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {r.status?.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Details Action */}
                        <td className="p-3.5 text-right">
                          {!isVacant && !isDeal && (
                            <ChevronRight className="w-4 h-4 inline-block text-slate-400" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Totals Row (§S-10: Sum of Monthly Base Rent for Visible Rows) */}
              {visibleRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                    <td className="p-4" colSpan={2}>
                      TOTALS ({visibleRows.length} Visible Rows)
                    </td>
                    <td className="p-4 text-right font-mono">
                      {visibleRows
                        .reduce((sum: number, r: any) => sum + (r.area_sqft || 0), 0)
                        .toLocaleString()}{" "}
                      sqft
                    </td>
                    <td className="p-4 text-right font-mono text-teal-900 text-sm">
                      ₹
                      {Math.round(
                        visibleRows.reduce((sum: number, r: any) => sum + (r.monthly_base_rent || 0), 0)
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-slate-400" colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>

      {/* Contract Detail Drawer (480px per §S-22) */}
      <ContractDetailDrawer
        contractId={selectedContractId}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedContractId(null);
        }}
        onRefresh={fetchRegisterData}
        onOpenDocViewer={(doc) => {
          setViewerDoc(doc);
          setViewerOpen(true);
        }}
      />

      {/* 7-Step Contract Wizard (§S-21) */}
      <ContractWizardModal
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardPrefill(null);
        }}
        onSuccess={() => {
          fetchRegisterData();
        }}
        prefill={wizardPrefill}
      />

      {/* Document Viewer Modal with Watermark (§S-23) */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setViewerDoc(null);
        }}
        document={viewerDoc}
      />

      {/* Deals Pipeline Modal (§S-18) */}
      <DealsRegisterView
        isOpen={dealsOpen}
        onClose={() => setDealsOpen(false)}
        onConvertToContract={(prefill) => {
          setWizardPrefill(prefill);
          setWizardOpen(true);
        }}
      />

      {/* Expiry Pipeline Modal (§S-24) */}
      <ExpiryPipelineView
        isOpen={expiryOpen}
        onClose={() => setExpiryOpen(false)}
        onDealCreated={() => {
          fetchRegisterData();
        }}
      />

      {/* Escalation Calendar Modal (§S-25) */}
      <EscalationCalendarView
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
      />

      {/* Master Data Management Modal (§S-11–14) */}
      <MasterDataModal
        isOpen={masterDataOpen}
        onClose={() => setMasterDataOpen(false)}
        onDataChanged={fetchRegisterData}
      />

      {/* Data Import Pipeline Modal (§S-30) */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
            <DataImportView
              onClose={() => {
                setImportOpen(false);
                fetchRegisterData();
              }}
            />
          </div>
        </div>
      )}

      {/* Payments & Collections Modal (§5.9, §5.13, §4.10) */}
      <PaymentsCollectionsView
        isOpen={paymentsOpen}
        onClose={() => setPaymentsOpen(false)}
        onRefreshParent={fetchRegisterData}
      />

      {/* Multi-Client & Flex Operations Modal (§4.3, §4.7, §5.10–11) */}
      <MultiClientFlexView
        isOpen={multiClientOpen}
        onClose={() => setMultiClientOpen(false)}
      />

      {/* Grace Period Policy Dialog Modal (§OI-8) */}
      {showGracePeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    OfficeX Commercial Grace Period Policy
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Statutory Rule §OI-8 · Zero Hard Lock Guarantee
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGracePeriodModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Zero Commercial Lockouts:</strong> In institutional commercial property management, billing, utility cycles, and tenant collections cannot be abruptly cut off. OfficeX never locks your dashboard or lease contracts.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">90% Warning Threshold:</strong> A proactive amber banner appears when registered leasable area exceeds 90% (45,00,00,000 Sq.Ft) of the 50,00,00,000 Sq.Ft allocated capacity.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Direct Rate Top-ups:</strong> Additional capacity beyond 50 Cr sq.ft can be expanded on demand across commercial tiers (₹50, ₹100, or ₹200 / sq.ft).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">100% Free Promotional Coupon:</strong> Currently active via codes <span className="font-mono font-bold text-teal-800">OFFICEX100</span> or <span className="font-mono font-bold text-teal-800">RENTROLL12</span>.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                href="/operate/rent-roll/pricing"
                onClick={() => setShowGracePeriodModal(false)}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                View Pricing Plans (₹50–₹200/sq.ft)
              </Link>
              <button
                onClick={() => setShowGracePeriodModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Fixed Mobile Bottom App Bar */}
      <MobileBottomNav />
    </div>
  );
}

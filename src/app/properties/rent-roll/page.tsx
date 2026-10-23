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
  SlidersHorizontal,
  Eye,
  Check,
  Building,
  MapPin,
  ExternalLink,
  ChevronDown,
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
import PropertyHierarchyModal, {
  HierarchyTab,
} from "@/components/rent-roll/PropertyHierarchyModal";
import { DataImportView } from "@/components/rent-roll/DataImportView";
import PaymentsCollectionsView from "@/components/rent-roll/PaymentsCollectionsView";
import MultiClientFlexView from "@/components/rent-roll/MultiClientFlexView";
import { getClientAuthHeaders } from "@/lib/auth-storage";

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

  // Vacant Space Action Modal (§S-10)
  const [selectedVacantSpace, setSelectedVacantSpace] = useState<any | null>(null);
  const [vacantModalOpen, setVacantModalOpen] = useState(false);

  // Column Customizer State
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    building: true,
    floor: true,
    model: true,
    area: true,
    rate: true,
    baseRent: true,
    cam: true,
    grossRent: true,
    escalation: true,
    expiry: true,
    arrears: true,
    status: true,
  });

  // Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<any>(null);
  const [dealsOpen, setDealsOpen] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [hierarchyTab, setHierarchyTab] = useState<HierarchyTab>("property");

  // Document Viewer Modal (§S-23)
  const [viewerDoc, setViewerDoc] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Capacity Quota & Grace Period Telemetry (§OI-8 Commercial Policy)
  const MAX_FREE_CAPACITY_SQFT = 500_000_000;
  const [showGracePeriodModal, setShowGracePeriodModal] = useState(false);

  const effectiveAumSqft = Number(registerData?.summary?.total_leasable_area_sqft || 0);
  const capacityPercent = Math.min(100, Math.max(0, (effectiveAumSqft / MAX_FREE_CAPACITY_SQFT) * 100));
  const percentRemaining = Math.max(0, 100 - capacityPercent);
  const isApproachingLimit = percentRemaining <= 2 && percentRemaining > 0 && effectiveAumSqft > 0;

  const isLeasing = registerData?.is_leasing_role || false;

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

      const res = await fetch(`/api/rent-roll/register?${params.toString()}`, {
        headers: getClientAuthHeaders(),
      });
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
        r.property_name?.toLowerCase().includes(q) ||
        r.building_name?.toLowerCase().includes(q)
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
      "Building",
      "Floor",
      "Occupant",
      "Area (sqft)",
      "Current Rate",
      "Monthly Base Rent (INR)",
      "CAM (INR)",
      "Gross Monthly (INR)",
      "Start Date",
      "Expiry Date",
      "Status",
      "Arrears Status",
    ];

    const csvLines = [headers.join(",")];
    visibleRows.forEach((r: any) => {
      csvLines.push(
        [
          `"${r.type}"`,
          `"${r.contract_code}"`,
          `"${r.space_code}"`,
          `"${r.space_name}"`,
          `"${r.building_name || "—"}"`,
          `"${r.floor || 1}"`,
          `"${r.occupant_name}"`,
          r.area_sqft || 0,
          isLeasing ? '"Confidential"' : r.current_rate_per_sqft || 0,
          isLeasing ? '"Confidential"' : r.monthly_base_rent || 0,
          isLeasing ? '"Confidential"' : r.cam_monthly_inr || 0,
          isLeasing ? '"Confidential"' : r.gross_monthly_recurring_inr || 0,
          `"${r.start_date}"`,
          `"${r.expiry_date}"`,
          `"${r.status}"`,
          `"${r.arrears_status || "No"}"`,
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
                  <span className="text-[#0F8B7D] font-bold">Rent Roll (§S-10)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Rent Roll Register
                  </h1>
                  {isLeasing && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      Leasing Scoped (Financials Masked)
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Institutional schedule of commercial demised spaces, active occupant agreements, escalations, and arrears.
                </p>
              </div>

              {/* Action Buttons */}
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
                    setHierarchyTab("tenant");
                    setMasterDataOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Users size={14} className="text-teal-600" />
                  <span>+ Add Tenant</span>
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
                  <span>+ New Contract</span>
                </button>
              </div>
            </div>

            {/* Capacity Warning Alert (if applicable) */}
            {isApproachingLimit && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                          Capacity Warning · 2% or Less Remaining
                        </span>
                        <span className="text-xs font-bold text-teal-900 bg-teal-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                          Grace Period Active
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        Approaching Licensed Quota ({effectiveAumSqft.toLocaleString("en-IN")} / 50 Cr Sq.Ft)
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Summary Tiles (§S-10) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Base Rent
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {isLeasing ? (
                    <span className="text-slate-400 text-sm font-bold">Confidential (Leasing)</span>
                  ) : (
                    `₹${Number(registerData?.summary?.total_monthly_base_rent || 0).toLocaleString("en-IN")}`
                  )}
                </p>
                <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> As of {asOfDate}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Occupied Leasable Area
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {Number(registerData?.summary?.total_occupied_area_sqft || 0).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">sqft</span>
                </p>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  {registerData?.summary?.active_contracts_count || 0} active agreements
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Portfolio Vacancy Rate
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {registerData?.summary?.vacancy_rate_percent ?? 0}%
                </p>
                <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  {registerData?.summary?.vacant_spaces_count || 0} vacant spaces
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {currentView === "forecast" ? "Weighted Pipeline" : "Outstanding Arrears"}
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {currentView === "forecast" ? (
                    isLeasing ? "Pipeline Active" : `₹${Math.round(registerData?.summary?.weighted_pipeline_rent || 0).toLocaleString("en-IN")}`
                  ) : isLeasing ? (
                    <span className="text-amber-800 text-sm font-bold">Arrears Flags Only</span>
                  ) : (
                    `₹${Math.round(registerData?.summary?.total_outstanding_arrears || 0).toLocaleString("en-IN")}`
                  )}
                </p>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  {currentView === "forecast" ? "Probability-weighted deals" : "Active overdue balances"}
                </span>
              </div>
            </div>

            {/* View Tabs & Control Filter Bar (§S-10) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Top Bar: View Selector & As-of-Date */}
              <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
                {/* View Selector: Current / Contracted / Forecast (§S-10) */}
                <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setCurrentView("current")}
                    className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                      currentView === "current"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Current View
                  </button>
                  <button
                    onClick={() => setCurrentView("contracted")}
                    className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                      currentView === "contracted"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Contracted (+ Future)
                  </button>
                  <button
                    onClick={() => setCurrentView("forecast")}
                    className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                      currentView === "forecast"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Forecast (+ Deals Weighted)
                  </button>
                </div>

                {/* As-of-Date Picker & Actions */}
                <div className="flex items-center gap-2.5 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
                    <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="font-medium text-slate-600 hidden sm:inline">As of:</span>
                    <input
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      className="border-none font-semibold text-slate-900 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* Columns Chooser Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnChooser(!showColumnChooser)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition shadow-2xs cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Columns</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showColumnChooser && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 space-y-2 animate-in fade-in duration-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                          Toggle S-10 Columns
                        </p>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {Object.keys(visibleColumns).map((colKey) => (
                            <label
                              key={colKey}
                              className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns[colKey]}
                                onChange={(e) =>
                                  setVisibleColumns({ ...visibleColumns, [colKey]: e.target.checked })
                                }
                                className="rounded text-teal-700 focus:ring-teal-700"
                              />
                              <span className="capitalize">{colKey.replace(/([A-Z])/g, " $1")}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={fetchRegisterData}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by space, occupant, building, contract code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={expiryFilter}
                    onChange={(e) => setExpiryFilter(e.target.value)}
                    className="p-2 border border-slate-300 rounded-xl bg-white text-xs text-slate-700 outline-none"
                  >
                    <option value="all">All Expiry Windows</option>
                    <option value="1">Expiring in 1 Month</option>
                    <option value="3">Expiring in 3 Months</option>
                    <option value="6">Expiring in 6 Months</option>
                    <option value="12">Expiring in 12 Months</option>
                  </select>
                </div>
              </div>

              {/* 100% Mobile Responsive Cards View (sm:hidden) */}
              <div className="sm:hidden p-3 space-y-3">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-700 mb-2" />
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
                      const isHoldingOver = r.status === "holding_over";
                      const isNotice = r.status === "notice_served";

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            if (isVacant) {
                              setSelectedVacantSpace(r);
                              setVacantModalOpen(true);
                            } else if (!isDeal) {
                              setSelectedContractId(r.id);
                              setDrawerOpen(true);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition active:scale-[0.99] cursor-pointer shadow-2xs space-y-2.5 ${
                            isHoldingOver
                              ? "bg-rose-50/70 border-rose-200"
                              : isNotice
                              ? "bg-amber-50/70 border-amber-200"
                              : isVacant
                              ? "bg-slate-100/70 border-slate-200 text-slate-500"
                              : isDeal
                              ? "bg-amber-50/40 border-amber-200 text-amber-950"
                              : isFuture
                              ? "bg-blue-50/50 border-blue-200 text-blue-950"
                              : "bg-white border-slate-200 text-slate-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-black text-sm text-slate-900 truncate flex items-center gap-1.5">
                                <span>{isVacant ? "(Vacant Space)" : r.occupant_name}</span>
                                {r.is_critical && (
                                  <span className="text-amber-500 text-xs" title="Critical Occupant">★</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-teal-800">{r.space_name}</span>
                                <span className="font-mono text-[10px] text-slate-400">({r.space_code})</span>
                                <span>· Floor {r.floor || 1}</span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider shrink-0 ${
                                isVacant
                                  ? "bg-slate-200 text-slate-600"
                                  : isHoldingOver
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : isNotice
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
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

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                {isLeasing ? "Arrears Flag" : "Monthly Base"}
                              </span>
                              {isLeasing ? (
                                <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded-md ${
                                  r.has_arrears ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {r.arrears_status === "Yes" ? "Overdue: Yes" : "Overdue: No"}
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-teal-900 text-sm">
                                  {isVacant
                                    ? `(₹${Number(r.asking_rent || 0).toLocaleString("en-IN")})`
                                    : `₹${Math.round(r.monthly_base_rent || 0).toLocaleString("en-IN")}`}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Area</span>
                              <span className="font-mono font-bold text-slate-700">
                                {r.area_sqft ? Number(r.area_sqft).toLocaleString() : "—"} sqft
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                            <span>
                              Expiry: <strong className="text-slate-700">{r.expiry_date || "—"}</strong>
                              {r.days_to_expiry !== null && r.days_to_expiry < 90 && (
                                <span className="ml-1 text-rose-600 font-bold">({r.days_to_expiry}d left)</span>
                              )}
                            </span>
                            <span className="text-teal-700 font-bold flex items-center gap-0.5">
                              {isVacant ? "Available Actions" : "Open Drawer"} <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mobile Totals Footer Card */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                        TOTAL REGISTER ({visibleRows.length} ROWS)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">
                          {visibleRows.reduce((sum: number, r: any) => sum + (r.area_sqft || 0), 0).toLocaleString()} sqft
                        </span>
                        <span className="font-mono font-bold text-base text-white">
                          {isLeasing ? (
                            "Financials Confidential"
                          ) : (
                            `₹${Math.round(visibleRows.reduce((sum: number, r: any) => sum + (r.monthly_base_rent || 0), 0)).toLocaleString("en-IN")}`
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Spreadsheet Grid (hidden sm:block with S-10 standard columns) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3.5 sticky left-0 bg-slate-50/95 z-10 shadow-2xs">Space & Code</th>
                      {visibleColumns.building && <th className="p-3.5">Building & Floor</th>}
                      <th className="p-3.5">Occupant / Lessee</th>
                      {visibleColumns.model && <th className="p-3.5">Model</th>}
                      {visibleColumns.area && <th className="p-3.5 text-right">Area (sqft)</th>}
                      {visibleColumns.rate && !isLeasing && <th className="p-3.5 text-right">Rate (₹/sqft)</th>}
                      {visibleColumns.baseRent && !isLeasing && <th className="p-3.5 text-right">Monthly Base</th>}
                      {visibleColumns.cam && !isLeasing && <th className="p-3.5 text-right">CAM (₹)</th>}
                      {visibleColumns.grossRent && !isLeasing && <th className="p-3.5 text-right">Gross Monthly</th>}
                      {visibleColumns.escalation && <th className="p-3.5">Escalation</th>}
                      {visibleColumns.expiry && <th className="p-3.5">Expiry Date</th>}
                      {visibleColumns.arrears && (
                        <th className="p-3.5 text-center">
                          {isLeasing ? "Arrears Y/N" : "Outstanding Arrears"}
                        </th>
                      )}
                      {visibleColumns.status && <th className="p-3.5">Status</th>}
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={14} className="p-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-700 mb-2" />
                          Recalculating rent roll register for {asOfDate}...
                        </td>
                      </tr>
                    ) : visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="p-12 text-center text-slate-500">
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
                        const isHoldingOver = r.status === "holding_over";
                        const isNotice = r.status === "notice_served";

                        return (
                          <tr
                            key={r.id}
                            onClick={() => {
                              if (isVacant) {
                                setSelectedVacantSpace(r);
                                setVacantModalOpen(true);
                              } else if (!isDeal) {
                                setSelectedContractId(r.id);
                                setDrawerOpen(true);
                              }
                            }}
                            className={`transition cursor-pointer ${
                              isHoldingOver
                                ? "bg-rose-50/70 border-l-4 border-l-rose-500 hover:bg-rose-100/60"
                                : isNotice
                                ? "bg-amber-50/70 border-l-4 border-l-amber-500 hover:bg-amber-100/60"
                                : isVacant
                                ? "bg-slate-100/60 text-slate-500 hover:bg-slate-200/50"
                                : isDeal
                                ? "bg-amber-50/40 text-amber-900 italic hover:bg-amber-100/50"
                                : isFuture
                                ? "bg-blue-50/40 hover:bg-blue-100/50 text-blue-950"
                                : "hover:bg-slate-50/80 text-slate-900"
                            }`}
                          >
                            {/* 1. Space & Code (Sticky) */}
                            <td className="p-3.5 sticky left-0 bg-inherit z-10 shadow-2xs font-bold">
                              <span className="block text-slate-900">{r.space_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{r.space_code}</span>
                            </td>

                            {/* 2. Building & Floor */}
                            {visibleColumns.building && (
                              <td className="p-3.5 text-slate-600">
                                <span>{r.building_name || "—"}</span>
                                <span className="block text-[10px] text-slate-400">Floor {r.floor || 1}</span>
                              </td>
                            )}

                            {/* 3. Occupant */}
                            <td className="p-3.5">
                              {isVacant ? (
                                <span className="text-slate-400 italic font-semibold">(Vacant Space)</span>
                              ) : isDeal ? (
                                <span className="font-semibold text-amber-800">{r.occupant_name}</span>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    <span>{r.occupant_name}</span>
                                    {r.is_critical && (
                                      <span className="text-amber-500 text-xs" title="Critical Occupant">★</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {r.contract_code} · {r.industry}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* 4. Model */}
                            {visibleColumns.model && (
                              <td className="p-3.5 text-[11px] font-semibold text-slate-600 capitalize">
                                {r.billing_model || "area"}
                              </td>
                            )}

                            {/* 5. Area */}
                            {visibleColumns.area && (
                              <td className="p-3.5 text-right font-mono font-medium">
                                {r.area_sqft ? Number(r.area_sqft).toLocaleString() : "—"}
                              </td>
                            )}

                            {/* 6. Current Rate (Hidden if Leasing) */}
                            {visibleColumns.rate && !isLeasing && (
                              <td className="p-3.5 text-right font-mono text-slate-700">
                                {isVacant
                                  ? `(₹${r.asking_rate_per_sqft || 85})`
                                  : r.current_rate_per_sqft
                                  ? `₹${r.current_rate_per_sqft}`
                                  : "—"}
                              </td>
                            )}

                            {/* 7. Monthly Base Rent (Hidden if Leasing) */}
                            {visibleColumns.baseRent && !isLeasing && (
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
                            )}

                            {/* 8. CAM Monthly (Hidden if Leasing) */}
                            {visibleColumns.cam && !isLeasing && (
                              <td className="p-3.5 text-right font-mono text-slate-600">
                                {r.cam_monthly_inr ? `₹${Math.round(r.cam_monthly_inr).toLocaleString("en-IN")}` : "—"}
                              </td>
                            )}

                            {/* 9. Gross Monthly (Hidden if Leasing) */}
                            {visibleColumns.grossRent && !isLeasing && (
                              <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                                {r.gross_monthly_recurring_inr ? `₹${Math.round(r.gross_monthly_recurring_inr).toLocaleString("en-IN")}` : "—"}
                              </td>
                            )}

                            {/* 10. Escalation Summary */}
                            {visibleColumns.escalation && (
                              <td className="p-3.5 text-[11px] text-slate-600">
                                <span>{r.escalation_summary || "15% / 36m"}</span>
                                {r.next_escalation_date && (
                                  <span className="block text-[10px] text-teal-700 font-semibold">
                                    Next: {r.next_escalation_date}
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 11. Expiry Date */}
                            {visibleColumns.expiry && (
                              <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-700">
                                <span>{r.expiry_date || "—"}</span>
                                {r.days_to_expiry !== null && r.days_to_expiry < 90 && (
                                  <span className="block text-[10px] text-rose-600 font-bold">
                                    {r.days_to_expiry}d left
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 12. Arrears / Outstanding (Role-Masked if Leasing) */}
                            {visibleColumns.arrears && (
                              <td className="p-3.5 text-center font-mono">
                                {isLeasing ? (
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    r.has_arrears ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                                  }`}>
                                    {r.arrears_status === "Yes" ? "Overdue" : "Clear"}
                                  </span>
                                ) : (
                                  <span className={r.has_arrears ? "text-rose-700 font-bold" : "text-slate-400"}>
                                    {r.has_arrears ? `₹${Math.round(r.outstanding_amount_inr).toLocaleString("en-IN")}` : "0"}
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 13. Status Chip */}
                            {visibleColumns.status && (
                              <td className="p-3.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isVacant
                                      ? "bg-slate-200 text-slate-600"
                                      : isHoldingOver
                                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                                      : isNotice
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : isFuture
                                      ? "bg-blue-100 text-blue-800"
                                      : r.status === "active"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {r.status?.replace(/_/g, " ")}
                                </span>
                              </td>
                            )}

                            {/* 14. Details Action */}
                            <td className="p-3.5 text-right">
                              <span className="text-teal-700 font-bold text-xs flex items-center justify-end gap-1">
                                {isVacant ? "Actions" : "View"} <ChevronRight className="w-3.5 h-3.5" />
                              </span>
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
                        <td className="p-4" colSpan={4}>
                          TOTALS ({visibleRows.length} Visible Rows)
                        </td>
                        <td className="p-4 text-right font-mono">
                          {visibleRows
                            .reduce((sum: number, r: any) => sum + (r.area_sqft || 0), 0)
                            .toLocaleString()}{" "}
                          sqft
                        </td>
                        {visibleColumns.rate && !isLeasing && <td className="p-4"></td>}
                        {visibleColumns.baseRent && !isLeasing && (
                          <td className="p-4 text-right font-mono text-teal-900 text-sm">
                            ₹
                            {Math.round(
                              visibleRows.reduce((sum: number, r: any) => sum + (r.monthly_base_rent || 0), 0)
                            ).toLocaleString("en-IN")}
                          </td>
                        )}
                        {visibleColumns.cam && !isLeasing && (
                          <td className="p-4 text-right font-mono text-slate-700">
                            ₹
                            {Math.round(
                              visibleRows.reduce((sum: number, r: any) => sum + (r.cam_monthly_inr || 0), 0)
                            ).toLocaleString("en-IN")}
                          </td>
                        )}
                        {visibleColumns.grossRent && !isLeasing && (
                          <td className="p-4 text-right font-mono font-black text-slate-900">
                            ₹
                            {Math.round(
                              visibleRows.reduce((sum: number, r: any) => sum + (r.gross_monthly_recurring_inr || 0), 0)
                            ).toLocaleString("en-IN")}
                          </td>
                        )}
                        <td className="p-4" colSpan={4}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </main>

          {/* Vacant Space Action Modal (§S-10) */}
          {vacantModalOpen && selectedVacantSpace && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
              <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      Vacant Space Opportunity
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {selectedVacantSpace.space_name} ({selectedVacantSpace.space_code})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedVacantSpace.building_name} · Floor {selectedVacantSpace.floor || 1}
                    </p>
                  </div>
                  <button
                    onClick={() => setVacantModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Chargeable Area</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {selectedVacantSpace.area_sqft?.toLocaleString()} sqft
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Asking Rate</span>
                    <span className="font-mono font-bold text-teal-900 text-sm">
                      ₹{selectedVacantSpace.asking_rate_per_sqft || 85}/sqft
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Carpet Area</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedVacantSpace.carpet_area_sqft?.toLocaleString()} sqft
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Potential</span>
                    <span className="font-mono font-bold text-teal-900">
                      ₹{Number(selectedVacantSpace.asking_rent || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVacantModalOpen(false);
                      setWizardPrefill({
                        space_id: selectedVacantSpace.space_id,
                        space_name: selectedVacantSpace.space_name,
                        area_sqft: selectedVacantSpace.area_sqft,
                        rate_per_sqft: selectedVacantSpace.asking_rate_per_sqft || 85,
                      });
                      setWizardOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Create Lease Contract for this Space (§S-21)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVacantModalOpen(false);
                      setDealsOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Briefcase size={15} className="text-amber-600" />
                    <span>Create Prospective Deal in Pipeline (§S-18)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* Unified Commercial Hierarchy, Tenant & Lease Setup */}
          <PropertyHierarchyModal
            isOpen={masterDataOpen}
            onClose={() => setMasterDataOpen(false)}
            initialTab={hierarchyTab}
            onSuccess={fetchRegisterData}
          />

          {/* Data Import Pipeline Modal (§S-30) */}
          {importOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Zero Commercial Lockouts:</strong> Operations are never hard-locked.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowGracePeriodModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
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

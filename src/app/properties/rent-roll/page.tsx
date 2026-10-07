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
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

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

  useEffect(() => {
    fetchRegisterData();
  }, [asOfDate, currentView, propertyFilter, expiryFilter]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      {/* Universal Marketing & Platform Header */}
      <MarketingHeader activePath="/operate/rent-roll" />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/operate" className="hover:text-slate-900 transition-colors">Operate</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Rent Roll Register</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
              PHASE P1 LIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMasterDataOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Settings className="w-3.5 h-3.5" />
              Asset Masters (§S-11–14)
            </button>
            <button
              onClick={() => setExpiryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
            >
              <Clock className="w-3.5 h-3.5" />
              Expiry Pipeline (§S-24)
            </button>
            <button
              onClick={() => setEscalationOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Escalation Calendar (§S-25)
            </button>
            <button
              onClick={() => setDealsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deals (§S-18)
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-lg text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Import (§S-30)
            </button>
            <button
              onClick={() => setPaymentsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payments & Collections (§5.9)
            </button>
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Approvals Inbox (§S-06)
            </Link>
            <button
              onClick={() => setMultiClientOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Multi-Client & Flex (§5.10–11)
            </button>
            <button
              onClick={() => {
                setWizardPrefill(null);
                setWizardOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Contract (§S-21)
            </button>
          </div>
        </div>
      </div>

      {/* Main SaaS Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

          {/* Rent Roll Register Table (§S-10) */}
          <div className="overflow-x-auto">
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
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      No contracts or spaces matching the current filter criteria.
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

      {/* Platform Footer */}
      <Footer />
    </div>
  );
}

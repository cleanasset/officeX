"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  TrendingUp,
  Receipt,
  FileCheck2,
  Clock,
  ArrowUpRight,
  PieChart,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Bell,
  Sparkles,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  UploadCloud,
  Layers,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  Sliders,
  CreditCard,
  Zap,
} from "lucide-react";

interface RentRollHeaderProps {
  activeTab?: string;
  onOpenProfileBanking?: () => void;
  onOpenIntegrations?: () => void;
  properties: Array<{
    id: string;
    name: string;
    city: string;
    state?: string;
    totalArea?: number;
    activeLeasesCount?: number;
    grade?: string;
  }>;
  selectedProperty: string;
  onSelectProperty: (id: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddLease?: () => void;
  onOpenRecordPayment?: () => void;
  onOpenAddExpense?: () => void;
  onOpenAddTenant?: () => void;
  onOpenImportCsv?: () => void;
  onExportCsv: (type: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;

  // Organization branding
  orgName?: string;
  orgTradeName?: string;
  logoUrl?: string;
  brandColor?: string;

  // As-Of Date (RR-VW-03)
  asOfDate?: string;
  onAsOfDateChange?: (date: string) => void;

  // Logged-in Landlord identity
  userName?: string;
  userEmail?: string;
  userRole?: string;
  primaryBuildingName?: string;

  // Property deletion & management
  onOpenDeleteProperty?: (propertyId: string) => void;
  onOpenManageProperties?: () => void;

  // Multi-Client & Multi-Entity SPVs (RR-ENT-02, RR-ENT-03)
  clientAccounts?: Array<{ id: string; name: string; accountCode?: string }>;
  selectedClientAccount?: string;
  onSelectClientAccount?: (id: string) => void;
  billingEntities?: Array<{ id: string; legalName: string; tradeName?: string; gstin: string; stateCode: string }>;
  selectedBillingEntity?: string;
  onSelectBillingEntity?: (id: string) => void;

  // Commercial Operations Triggers (Section 7, Section 11)
  onOpenOwnerStatements?: () => void;
  onOpenClientAccounts?: () => void;
  onOpenMonthlyMis?: () => void;
  onOpenDeals?: () => void;
  onOpenConfigWizard?: () => void;

  // Month-End Snapshots (RR-AUD-03)
  onFreezeSnapshot?: () => void;
  onOpenSnapshots?: () => void;
  isFreezingSnapshot?: boolean;
}

export const RentRollHeader: React.FC<RentRollHeaderProps> = ({
  activeTab = "dashboard",
  properties,
  selectedProperty,
  onSelectProperty,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onOpenAddLease,
  onOpenRecordPayment,
  onOpenAddExpense,
  onOpenAddTenant,
  onOpenImportCsv,
  onExportCsv,
  onRefresh,
  isLoading,
  unreadAlertsCount,
  onOpenAlerts,
  orgName,
  orgTradeName,
  logoUrl,
  brandColor,
  asOfDate,
  onAsOfDateChange,
  userName,
  userEmail,
  userRole,
  primaryBuildingName,
  onOpenDeleteProperty,
  onOpenManageProperties,
  clientAccounts,
  selectedClientAccount,
  onSelectClientAccount,
  billingEntities,
  selectedBillingEntity,
  onSelectBillingEntity,
  onOpenOwnerStatements,
  onOpenClientAccounts,
  onOpenMonthlyMis,
  onOpenDeals,
  onOpenConfigWizard,
  onOpenProfileBanking,
  onOpenIntegrations,
  onFreezeSnapshot,
  onOpenSnapshots,
  isFreezingSnapshot,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setIsActionsOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setIsExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Visibility logic based on active tab
  const showAddLease = activeTab === "dashboard" || activeTab === "rentroll";
  const showRecordPayment = activeTab === "dashboard" || activeTab === "rentroll" || activeTab === "collections" || activeTab === "aging";
  const showAddExpense = activeTab === "pnl";
  const showAddTenant = activeTab === "tenants";
  const showAlerts = activeTab === "dashboard" || activeTab === "rentroll" || activeTab === "invoices" || activeTab === "aging" || activeTab === "escalations";
  const showStatusFilter = activeTab !== "rentroll" && activeTab !== "dictionary";
  const showLeaseSearch = activeTab !== "rentroll" && activeTab !== "dictionary";

  // Tab configuration metadata
  const TAB_CONFIG: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Executive Dashboard",
      subtitle: "Portfolio KPIs, revenue yields, collections, and financial health",
    },
    rentroll: {
      title: "Active Rent Roll Master",
      subtitle: "Floor, unit, and lease inventory with statutory GST & escalation tracking",
    },
    invoices: {
      title: "Monthly Billing & Invoices",
      subtitle: "Recurring billing schedules, automated GST tax invoices, and credit notes",
    },
    "meter-readings": {
      title: "Meter Readings & Utilities",
      subtitle: "Sub-metered grid electricity (HT/LT), DG backup power, and water billing",
    },
    collections: {
      title: "Collections & Receipts",
      subtitle: "Inward bank settlements, payment reconciliation, and tax receipts",
    },
    aging: {
      title: "Arrears & Aging Ledger",
      subtitle: "Accounts receivable tracking across 30, 60, and 90+ day aging buckets",
    },
    escalations: {
      title: "Escalation & Expiries",
      subtitle: "Scheduled rent step-ups, CPI indexations, and upcoming renewals",
    },
    occupancy: {
      title: "Stacking & Occupancy",
      subtitle: "Vertical architectural floor stacking and spatial allocation breakdown",
    },
    forecast: {
      title: "12-Mo Financial Forecast",
      subtitle: "Forward-projected contracted cash flows and revenue estimations",
    },
    pnl: {
      title: "NOI & Property P&L",
      subtitle: "Operating expenses, maintenance outflows, net operating income, and yield",
    },
    "flex-pnl": {
      title: "Centre P&L & Seats (Flex)",
      subtitle: "Dedicated desks, private cabins, and dynamic flex-seat unit economics",
    },
    tenants: {
      title: "Tenant Directory",
      subtitle: "Corporate entities, key contacts, KYC compliance, and security deposits",
    },
    audit: {
      title: "Audit & Compliance Trail",
      subtitle: "Statutory logs, lease status transitions, and accounting event audit trails",
    },
    dictionary: {
      title: "Metric Dictionary",
      subtitle: "Commercial real estate definitions, formulas, and statutory Indian CRE metrics",
    },
  };

  const currentTabConfig = TAB_CONFIG[activeTab || "dashboard"] || {
    title: "Rent Roll Master",
    subtitle: "Manage commercial leases, billings, and collections",
  };

  const currentSelectedProp = properties.find((p) => p.id === selectedProperty);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl px-4 sm:px-5 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 w-full">
      {/* LEFT: Section Title */}
      <div className="min-w-0">
        <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
          {currentTabConfig.title}
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-md">
          {currentTabConfig.subtitle}
        </p>
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
        {/* Property Selector */}
        <select
          value={selectedProperty}
          onChange={(e) => onSelectProperty(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold cursor-pointer max-w-[180px] truncate"
        >
          <option value="ALL">All Properties ({properties.length})</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* As-Of Date */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px]">
          <Calendar className="w-3 h-3 text-teal-600" />
          <input
            type="date"
            value={asOfDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => onAsOfDateChange && onAsOfDateChange(e.target.value)}
            className="font-semibold text-slate-700 focus:outline-none bg-transparent cursor-pointer text-[11px] w-[110px]"
          />
        </div>

        {/* Add Lease CTA */}
        {showAddLease && onOpenAddLease && (
          <button
            onClick={onOpenAddLease}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Lease</span>
          </button>
        )}

        {/* More Actions */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isActionsOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 text-[11px] max-h-[70vh] overflow-y-auto">
              <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>

              {showRecordPayment && onOpenRecordPayment && (
                <button onClick={() => { onOpenRecordPayment(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Record Payment
                </button>
              )}

              {onFreezeSnapshot && (
                <button onClick={() => { onFreezeSnapshot(); setIsActionsOpen(false); }} disabled={isFreezingSnapshot} className="w-full text-left px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  <FileCheck2 className="w-3.5 h-3.5 text-purple-600" /> {isFreezingSnapshot ? "Freezing..." : "Freeze Snapshot"}
                </button>
              )}

              <div className="border-t border-slate-100 my-1" />
              <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Settings</div>

              {onOpenProfileBanking && (
                <button onClick={() => { onOpenProfileBanking(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" /> Profile & Banking
                </button>
              )}

              {onOpenIntegrations && (
                <button onClick={() => { onOpenIntegrations(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" /> Accounting Hub
                </button>
              )}

              {onOpenImportCsv && (
                <button onClick={() => { onOpenImportCsv(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-teal-600" /> Import CSV/Excel
                </button>
              )}

              {onOpenConfigWizard && (
                <button onClick={() => { onOpenConfigWizard(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-teal-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" /> Setup Wizard
                </button>
              )}

              {onOpenSnapshots && (
                <button onClick={() => { onOpenSnapshots(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Snapshots
                </button>
              )}

              {onOpenDeals && (
                <button onClick={() => { onOpenDeals(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Deals Pipeline
                </button>
              )}

              {onOpenOwnerStatements && (
                <button onClick={() => { onOpenOwnerStatements(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Owner Statements
                </button>
              )}

              {onOpenClientAccounts && (
                <button onClick={() => { onOpenClientAccounts(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Client Mandates
                </button>
              )}

              {onOpenMonthlyMis && (
                <button onClick={() => { onOpenMonthlyMis(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <FileCheck2 className="w-3.5 h-3.5 text-purple-600" /> Monthly MIS
                </button>
              )}

              {onOpenManageProperties && (
                <button onClick={() => { onOpenManageProperties(); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Manage Properties
                </button>
              )}

              {selectedProperty !== "ALL" && onOpenDeleteProperty && (
                <button onClick={() => { onOpenDeleteProperty(selectedProperty); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Property
                </button>
              )}

              <div className="border-t border-slate-100 my-1" />
              <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Export</div>
              {["rentroll", "aging", "invoices", "collections", "escalations"].map((type) => (
                <button key={type} onClick={() => { onExportCsv(type); setIsActionsOpen(false); }} className="w-full text-left px-2.5 py-1 hover:bg-slate-50 text-slate-600 rounded-lg font-medium flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    {type === "rentroll" ? "Rent Roll" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span className="text-[8px] bg-slate-100 text-slate-500 font-mono px-1 py-0.5 rounded">CSV</span>
                </button>
              ))}
              <a href="/api/rent-roll/export/tally" download className="w-full text-left px-2.5 py-1 hover:bg-indigo-50 text-indigo-800 rounded-lg font-semibold flex items-center justify-between cursor-pointer" onClick={() => setIsActionsOpen(false)}>
                <span className="flex items-center gap-2"><FileSpreadsheet className="w-3 h-3 text-indigo-600" /> Tally Vouchers</span>
                <span className="text-[8px] bg-indigo-100 text-indigo-600 font-mono px-1 py-0.5 rounded">XML</span>
              </a>
            </div>
          )}
        </div>

        {/* Refresh */}
        <button onClick={onRefresh} disabled={isLoading} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>
    </div>
  );
};

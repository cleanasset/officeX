"use client";

import React, { useState } from "react";
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
  ExternalLink
} from "lucide-react";

interface RentRollHeaderProps {
  activeTab?: string;
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
  onOpenDeals?: () => void;
}

const TAB_CONFIGS: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  dashboard: {
    title: "Portfolio Executive Dashboard",
    subtitle: "Real-time NOI, occupancy velocity, collections health & cash flow trajectory.",
    icon: Building2,
  },
  rentroll: {
    title: "Rent Roll Master Registry",
    subtitle: "Institutional 39-column lease registry, CAM recoveries & lease term lifecycle.",
    icon: TrendingUp,
  },
  invoices: {
    title: "Monthly Billing & Tax Invoices",
    subtitle: "Automated GST-compliant tax invoices, line items, TDS reconciliation & billing runs.",
    icon: Receipt,
  },
  collections: {
    title: "Collections & Bank Receipts",
    subtitle: "Settled transaction ledger, bank escrow reconciliation & payment receipts.",
    icon: FileCheck2,
  },
  aging: {
    title: "Arrears & AR Aging Ledger",
    subtitle: "Overdue debt aging buckets (0-30d, 31-60d, 61-90d, 90d+) & default recovery.",
    icon: Clock,
  },
  escalations: {
    title: "Rent Escalations & Expiry Pipeline",
    subtitle: "Contractual step-up escalations, lock-in expiry & lease renewals.",
    icon: ArrowUpRight,
  },
  occupancy: {
    title: "Stacking Plan & Floor Occupancy",
    subtitle: "Visual floor plate utilization, occupied vs vacant square footage.",
    icon: PieChart,
  },
  forecast: {
    title: "12-Month Forward Cash Flow Forecast",
    subtitle: "Contractual base rent, CAM run-rate & step-up escalation simulation.",
    icon: Calendar,
  },
  pnl: {
    title: "Property P&L & Net Operating Income (NOI)",
    subtitle: "Gross commercial revenues, operating expenses (OpEx) & net yields.",
    icon: DollarSign,
  },
  tenants: {
    title: "Tenant Directory & Statutory KYC",
    subtitle: "Verified tenant corporate entities, PAN/GSTIN records & demised units.",
    icon: Users,
  },
  dictionary: {
    title: "Commercial Real Estate (CRE) Glossary",
    subtitle: "Institutional definitions for Rent Roll, WALE, CAM, Escrow & NOI.",
    icon: BookOpen,
  },
  audit: {
    title: "System Audit Trail & Compliance",
    subtitle: "Immutable operational logs, transaction timestamps & regulatory governance.",
    icon: ShieldCheck,
  },
  "flex-centre": {
    title: "Centre P&L & Head Leases (Flex & Seats)",
    subtitle: "Managed office & co-working centre contribution margin (F-23), head lease payables & break-even occupancy (F-24).",
    icon: Layers,
  },
  "cam-pools": {
    title: "CAM Pools & Year-End True-Up",
    subtitle: "Common Area Maintenance annual budgeting, quarterly actuals reconciliation & tenant true-up notes (Formula F-22).",
    icon: Sparkles,
  },
};

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
  onOpenDeals,
}) => {
  const currentTabConfig = TAB_CONFIGS[activeTab] || TAB_CONFIGS.dashboard;
  const IconComponent = currentTabConfig.icon;
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Visibility logic based on active tab
  const showAddLease = activeTab === "dashboard" || activeTab === "rentroll";
  const showRecordPayment = activeTab === "dashboard" || activeTab === "rentroll" || activeTab === "collections" || activeTab === "aging";
  const showExportExcel = activeTab === "rentroll";
  const showExportAudit = activeTab === "audit";
  const showAddExpense = activeTab === "pnl";
  const showAddTenant = activeTab === "tenants";
  const showAlerts = activeTab === "dashboard" || activeTab === "rentroll" || activeTab === "invoices" || activeTab === "aging" || activeTab === "escalations";

  // Filter bar logic
  const showSecondaryFilterBar = activeTab !== "dictionary";
  const showStatusFilter = activeTab === "rentroll";
  const showLeaseSearch = activeTab === "rentroll";

  // Active property name calculation
  const currentSelectedProp = properties.find((p) => p.id === selectedProperty);
  const displayBuildingName =
    selectedProperty !== "ALL"
      ? currentSelectedProp?.name || primaryBuildingName || "Selected Property"
      : properties.length === 0
      ? "No Assets Registered"
      : primaryBuildingName || (properties[0]?.name ? `${properties[0].name} (+${properties.length - 1} more)` : "Active Portfolio");

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ──── LOGGED IN LANDLORD & ACTIVE ASSET IDENTITY STRIP ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 border border-slate-700/60 rounded-2xl p-3.5 px-5 shadow-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F8B7D] to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-md border border-teal-300/30 shrink-0">
            {(userName || userEmail || "O")[0]?.toUpperCase() || "O"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-white tracking-tight truncate">
                {userName || "Commercial Landlord"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {userRole || "Owner & Asset Manager"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active Pro License
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5 font-medium flex-wrap">
              <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-none">
                {userEmail || "owner@officex.in"}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-teal-200 text-xs">
                <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="text-slate-400">Active Asset:</span>
                <strong className="text-white font-bold truncate max-w-[220px] sm:max-w-none">
                  {displayBuildingName}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right side quick actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenManageProperties && (
            <button
              type="button"
              onClick={onOpenManageProperties}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View and manage portfolio properties"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Portfolio ({properties.length} Assets)</span>
            </button>
          )}
        </div>
      </div>
      {/* ──── TOP ROW: PAGE TITLE & CONTEXTUAL ACTIONS ──── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
        {/* Title & Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-[#0F8B7D] shadow-2xs shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                {currentTabConfig.title}
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse"></span>
                Live Engine · FY 2026-27
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {currentTabConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Tab-Contextual Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {showAlerts && (
            <button
              onClick={onOpenAlerts}
              className="relative px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Management Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* Commercial Deals & Pipeline Trigger (RR-OPR-01) */}
          {onOpenDeals && (
            <button
              onClick={onOpenDeals}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Leasing Deals & Pipeline (Section 7)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deals Pipeline</span>
            </button>
          )}

          {/* Owner Statements Trigger (Section 11) */}
          {onOpenOwnerStatements && (
            <button
              onClick={onOpenOwnerStatements}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Multi-Client Owner Statements & Fee Remittance (Section 11)"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Owner Statements</span>
            </button>
          )}

          {/* Occupant / Tenant Billing Portal (RR-PRT-01, UAT-24) */}
          <a
            href="/portal/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Open Occupant / Tenant Billing Portal (RR-PRT-01, UAT-24)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            <span>Occupant Portal</span>
          </a>

          {/* Import CSV Trigger */}
          {onOpenImportCsv && (
            <button
              onClick={onOpenImportCsv}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F8B7D] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Bulk Import Rent Roll (Excel / CSV)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#0F8B7D]" />
              <span>Import CSV</span>
            </button>
          )}

          {/* Export Centre Dropdown (RR-20) */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Institutional Reports"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {isExportOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 p-1.5 z-50 text-xs animate-in zoom-in-95 duration-100"
                onClick={() => setIsExportOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Institutional Report
                </div>
                <button
                  onClick={() => onExportCsv("rentroll")}
                  className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 hover:text-teal-900 rounded-xl font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Rent Roll Master (39-Col)</span>
                  <span className="text-[10px] bg-teal-100/70 text-teal-800 font-mono px-1.5 py-0.5 rounded">CSV</span>
                </button>
                <button
                  onClick={() => onExportCsv("aging")}
                  className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 hover:text-teal-900 rounded-xl font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>AR Aging Analysis</span>
                  <span className="text-[10px] bg-teal-100/70 text-teal-800 font-mono px-1.5 py-0.5 rounded">CSV</span>
                </button>
                <button
                  onClick={() => onExportCsv("invoices")}
                  className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 hover:text-teal-900 rounded-xl font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Billing &amp; Tax Invoices</span>
                  <span className="text-[10px] bg-teal-100/70 text-teal-800 font-mono px-1.5 py-0.5 rounded">CSV</span>
                </button>
                <button
                  onClick={() => onExportCsv("collections")}
                  className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 hover:text-teal-900 rounded-xl font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Collections &amp; Receipts</span>
                  <span className="text-[10px] bg-teal-100/70 text-teal-800 font-mono px-1.5 py-0.5 rounded">CSV</span>
                </button>
                <button
                  onClick={() => onExportCsv("escalations")}
                  className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 hover:text-teal-900 rounded-xl font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Escalation Schedule</span>
                  <span className="text-[10px] bg-teal-100/70 text-teal-800 font-mono px-1.5 py-0.5 rounded">CSV</span>
                </button>
                
                {/* Tally Prime XML Export (RR-INT-01, OI-5) */}
                <div className="border-t border-gray-100 my-1"></div>
                <a
                  href="/api/rent-roll/export/tally"
                  download
                  className="w-full text-left px-2.5 py-2 hover:bg-indigo-50 text-indigo-950 rounded-xl font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>Tally Prime XML (Vouchers)</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-1.5 py-0.5 rounded font-black">XML</span>
                </a>
              </div>
            )}
          </div>

          {showRecordPayment && onOpenRecordPayment && (
            <button
              onClick={onOpenRecordPayment}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Record Payment</span>
            </button>
          )}

          {showAddExpense && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense Entry</span>
            </button>
          )}

          {showAddTenant && onOpenAddTenant && (
            <button
              onClick={onOpenAddTenant}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tenant</span>
            </button>
          )}

          {showAddLease && onOpenAddLease && (
            <button
              onClick={onOpenAddLease}
              className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lease</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0F8B7D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ──── SECONDARY ROW: FILTER & SEARCH CONTROL BAR (ONLY WHERE RELEVANT) ──── */}
      {showSecondaryFilterBar && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3 px-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Client Account Selector (RR-ENT-02 Multi-Client Operator Layer) */}
            {clientAccounts && clientAccounts.length > 0 && onSelectClientAccount && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client:</span>
                <select
                  value={selectedClientAccount || "ALL"}
                  onChange={(e) => onSelectClientAccount(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold transition-colors cursor-pointer"
                >
                  <option value="ALL">All Client Accounts ({clientAccounts.length})</option>
                  {clientAccounts.map((ca) => (
                    <option key={ca.id} value={ca.id}>
                      {ca.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Billing Entity / SPV Selector (RR-ENT-03 Multi-Entity SPVs) */}
            {billingEntities && billingEntities.length > 0 && onSelectBillingEntity && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Billing SPV:</span>
                <select
                  value={selectedBillingEntity || "ALL"}
                  onChange={(e) => onSelectBillingEntity(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold transition-colors cursor-pointer"
                >
                  <option value="ALL">All Billing Entities ({billingEntities.length})</option>
                  {billingEntities.map((be) => (
                    <option key={be.id} value={be.id}>
                      {be.tradeName || be.legalName} ({be.stateCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Property Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property:</span>
              <select
                value={selectedProperty}
                onChange={(e) => onSelectProperty(e.target.value)}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] font-semibold transition-colors cursor-pointer"
              >
                <option value="ALL">All Portfolio Properties ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>

              {/* Remove selected property button */}
              {selectedProperty !== "ALL" && onOpenDeleteProperty && (
                <button
                  type="button"
                  onClick={() => onOpenDeleteProperty(selectedProperty)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Remove this selected property from portfolio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Property</span>
                </button>
              )}

              {/* Manage properties trigger button */}
              {onOpenManageProperties && (
                <button
                  type="button"
                  onClick={onOpenManageProperties}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Manage and remove properties"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Manage ({properties.length})</span>
                </button>
              )}
            </div>

            {/* Status Filter (Only on Master Grid) */}
            {showStatusFilter && (
              <>
                <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => onSelectStatus(e.target.value)}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] font-semibold transition-colors cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="active">Active Leases</option>
                    <option value="under_notice">Under Notice</option>
                    <option value="expired">Expired</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Search Input (Only on Master Grid) */}
          {showLeaseSearch && (
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenant, lease #, unit..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 placeholder-gray-400 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] transition-colors"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


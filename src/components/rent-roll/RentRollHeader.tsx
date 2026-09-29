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
  const showStatusFilter = activeTab === "rentroll";
  const showLeaseSearch = activeTab === "rentroll";

  // Active property name calculation
  const currentSelectedProp = properties.find((p) => p.id === selectedProperty);
  const displayBuildingName =
    selectedProperty !== "ALL"
      ? currentSelectedProp?.name || primaryBuildingName || "Selected Property"
      : properties.length === 0
      ? "No Assets"
      : primaryBuildingName || (properties[0]?.name ? `${properties[0].name} (+${properties.length - 1} more)` : "Portfolio");

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* ──── ROW 1: COMPACT IDENTITY + PRIMARY ACTIONS ──── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center justify-between gap-3">
        {/* Left: User & Organization identity (Clickable to edit Profile & Banking) */}
        <div
          onClick={onOpenProfileBanking}
          className={`flex items-center gap-3 min-w-0 ${
            onOpenProfileBanking ? "cursor-pointer hover:bg-slate-50/80 -m-1.5 p-1.5 rounded-xl transition-all group" : ""
          }`}
          title={onOpenProfileBanking ? "Click to view & edit Organization, Profile & Bank Details" : undefined}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName || "Company Logo"}
              className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white p-0.5 shadow-xs shrink-0 group-hover:border-teal-400 transition-colors"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F8B7D] to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              {(orgName || userName || userEmail || "O")[0]?.toUpperCase() || "O"}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-gray-900 truncate group-hover:text-teal-900 transition-colors">
                {orgName || userName || "Commercial Asset Portfolio"}
              </span>
              {orgTradeName && orgTradeName !== orgName && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline">
                  {orgTradeName}
                </span>
              )}
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-teal-50 text-[#0F8B7D] border border-teal-200 hidden sm:inline">
                {userRole || "Property Owner"}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 inline" /> Live
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 truncate">
              <Building2 className="w-3 h-3 text-teal-500 shrink-0" />
              <span className="truncate font-semibold text-gray-700">{displayBuildingName}</span>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <span className="text-gray-400 font-mono text-[10px] truncate hidden sm:inline">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Right: Primary action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Profile & Banking quick action */}
          {onOpenProfileBanking && (
            <button
              type="button"
              onClick={onOpenProfileBanking}
              className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="View & Edit Entity Profile, PAN, GSTIN & Settlement Bank Accounts"
            >
              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden md:inline">Profile &amp; Banking</span>
            </button>
          )}
          {/* Alerts button */}
          {showAlerts && (
            <button
              onClick={onOpenAlerts}
              className="relative p-2 bg-gray-50 hover:bg-amber-50 border border-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
              title="Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-bold min-w-[16px] text-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* Primary CTA: Add Lease / Add Tenant / Add Expense */}
          {showAddLease && onOpenAddLease && (
            <button
              onClick={onOpenAddLease}
              className="px-3 py-1.5 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Lease</span>
            </button>
          )}

          {showAddTenant && onOpenAddTenant && (
            <button
              onClick={onOpenAddTenant}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tenant</span>
            </button>
          )}

          {showAddExpense && onOpenAddExpense && (
            <button
              onClick={onOpenAddExpense}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          )}

          {showRecordPayment && onOpenRecordPayment && (
            <button
              onClick={onOpenRecordPayment}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Record Payment</span>
            </button>
          )}

          {/* More Actions Dropdown */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-1 z-50 text-xs animate-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Actions
                </div>

                {onOpenProfileBanking && (
                  <button
                    onClick={() => { onOpenProfileBanking(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-slate-900 rounded-lg font-bold flex items-center gap-2 cursor-pointer border-b border-gray-100"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    Profile &amp; Bank Accounts
                  </button>
                )}

                {onOpenIntegrations && (
                  <button
                    onClick={() => { onOpenIntegrations(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-indigo-50 text-indigo-900 rounded-lg font-bold flex items-center gap-2 cursor-pointer border-b border-gray-100"
                  >
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Accounting &amp; ERP Hub (Tally/Zoho/SAP)
                  </button>
                )}

                {onOpenConfigWizard && (
                  <button
                    onClick={() => { onOpenConfigWizard(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-[#0F8B7D] rounded-lg font-bold flex items-center gap-2 cursor-pointer border-b border-gray-100"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#0F8B7D]" />
                    Setup Wizard (4 Sections)
                  </button>
                )}

                {onOpenImportCsv && (
                  <button
                    onClick={() => { onOpenImportCsv(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
                    Import Rent Roll (CSV/Excel)
                  </button>
                )}

                {onOpenDeals && (
                  <button
                    onClick={() => { onOpenDeals(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-indigo-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Deals Pipeline
                  </button>
                )}

                {onOpenOwnerStatements && (
                  <button
                    onClick={() => { onOpenOwnerStatements(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    Owner Statements
                  </button>
                )}

                <a
                  href="/portal/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsActionsOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  Occupant Portal
                </a>

                {onOpenManageProperties && (
                  <button
                    onClick={() => { onOpenManageProperties(); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-gray-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    Manage Properties ({properties.length})
                  </button>
                )}

                <div className="border-t border-gray-100 my-1" />
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Export
                </div>
                {["rentroll", "aging", "invoices", "collections", "escalations"].map((type) => (
                  <button
                    key={type}
                    onClick={() => { onExportCsv(type); setIsActionsOpen(false); }}
                    className="w-full text-left px-2.5 py-2 hover:bg-teal-50 text-gray-800 rounded-lg font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      {type === "rentroll" ? "Rent Roll Master" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">CSV</span>
                  </button>
                ))}
                <a
                  href="/api/rent-roll/export/tally"
                  download
                  className="w-full text-left px-2.5 py-2 hover:bg-indigo-50 text-indigo-900 rounded-lg font-bold flex items-center justify-between cursor-pointer"
                  onClick={() => setIsActionsOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                    Tally Prime Vouchers
                  </span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.5 rounded font-bold">XML</span>
                </a>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0F8B7D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ──── ROW 2: COMPACT FILTERS (only when relevant) ──── */}
      {activeTab !== "dictionary" && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {/* Client Account Filter */}
          {clientAccounts && clientAccounts.length > 0 && onSelectClientAccount && (
            <select
              value={selectedClientAccount || "ALL"}
              onChange={(e) => onSelectClientAccount(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold cursor-pointer"
            >
              <option value="ALL">All Clients ({clientAccounts.length})</option>
              {clientAccounts.map((ca) => (
                <option key={ca.id} value={ca.id}>{ca.name}</option>
              ))}
            </select>
          )}

          {/* Billing Entity Filter */}
          {billingEntities && billingEntities.length > 0 && onSelectBillingEntity && (
            <select
              value={selectedBillingEntity || "ALL"}
              onChange={(e) => onSelectBillingEntity(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold cursor-pointer"
            >
              <option value="ALL">All Billing Entities ({billingEntities.length})</option>
              {billingEntities.map((be) => (
                <option key={be.id} value={be.id}>{be.tradeName || be.legalName} ({be.stateCode})</option>
              ))}
            </select>
          )}

          {/* Property Filter */}
          <select
            value={selectedProperty}
            onChange={(e) => onSelectProperty(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold cursor-pointer"
          >
            <option value="ALL">All Properties ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
            ))}
          </select>

          {/* As-Of Date Filter (RR-VW-03) */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#0F8B7D]" />
            <span className="text-gray-500 font-medium hidden sm:inline">As Of:</span>
            <input
              type="date"
              value={asOfDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => onAsOfDateChange && onAsOfDateChange(e.target.value)}
              className="font-bold text-gray-800 focus:outline-none bg-transparent cursor-pointer text-[11px]"
            />
            {asOfDate && asOfDate !== new Date().toISOString().split("T")[0] && onAsOfDateChange && (
              <button
                type="button"
                onClick={() => onAsOfDateChange(new Date().toISOString().split("T")[0])}
                className="text-[10px] text-teal-600 hover:text-teal-800 font-bold ml-1 cursor-pointer"
                title="Reset to today"
              >
                Today
              </button>
            )}
          </div>

          {/* Month-End Snapshot Freeze Trigger (RR-AUD-03) */}
          {onFreezeSnapshot && (
            <button
              type="button"
              onClick={onFreezeSnapshot}
              disabled={isFreezingSnapshot}
              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Freeze month-end immutable statutory snapshot"
            >
              <FileCheck2 className={`w-3 h-3 text-purple-700 ${isFreezingSnapshot ? "animate-spin" : ""}`} />
              <span>{isFreezingSnapshot ? "Freezing..." : "Freeze Snapshot"}</span>
            </button>
          )}

          {/* Historical Snapshots Modal Trigger */}
          {onOpenSnapshots && (
            <button
              type="button"
              onClick={onOpenSnapshots}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="View historical rent roll snapshots"
            >
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="hidden sm:inline">Snapshots</span>
            </button>
          )}

          {/* Remove property button */}
          {selectedProperty !== "ALL" && onOpenDeleteProperty && (
            <button
              type="button"
              onClick={() => onOpenDeleteProperty(selectedProperty)}
              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Remove property"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {/* Status Filter (Only on Master Grid) */}
          {showStatusFilter && (
            <>
              <div className="h-4 w-[1px] bg-gray-200" />
              <select
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-semibold cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Leases</option>
                <option value="under_notice">Under Notice</option>
                <option value="expired">Expired</option>
                <option value="draft">Drafts</option>
              </select>
            </>
          )}

          {/* Search Input (Only on Master Grid) */}
          {showLeaseSearch && (
            <>
              <div className="h-4 w-[1px] bg-gray-200" />
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenant, lease #, unit..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-900 text-[11px] rounded-lg pl-7 pr-3 py-1.5 placeholder-gray-400 focus:outline-none focus:border-[#0F8B7D] w-52"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

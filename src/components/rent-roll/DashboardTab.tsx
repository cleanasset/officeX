"use client";

import React from "react";
import {
  Building2,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil,
  User,
  MapPin,
  ChevronDown
} from "lucide-react";

interface DashboardData {
  summary: {
    totalLeasesCount: number;
    activeLeasesCount: number;
    totalMonthlyRent: number;
    totalCamMonthly: number;
    totalMonthlyBilling: number;
    totalAnnualGross: number;
    totalOutstanding: number;
    overdueLeasesCount: number;
    expiring30Days: number;
    expiring90Days: number;
    expiredLeases: number;
    escalationsDueCount: number;
  };
  occupancy: {
    totalArea: number;
    occupiedArea: number;
    vacantArea: number;
    occupancyPct: number;
    vacancyPct: number;
  };
  walt: {
    waltByAreaMonths: number;
    waltByAreaYears: number;
    waltByRevenueMonths: number;
    waltByRevenueYears: number;
    activeLeasesCount: number;
  };
  noi: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyNOI: number;
    oerPct: number;
    annualNOI: number;
    capRatePct: number;
  };
  aging: {
    current: number;
    bucket0to30: number;
    bucket31to60: number;
    bucket61to90: number;
    bucket90Plus: number;
    totalOutstanding: number;
    invoicesCount: number;
  };
  topTenants: Array<{
    tenantName: string;
    propertyName: string;
    monthlyRent: number;
    areaSqFt: number;
    sharePct: number;
    portalLive?: boolean;
    tenantStatus?: string;
    isTermsPending?: boolean;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    severity: string;
    triggerDate: string;
  }>;
}

interface DashboardTabProps {
  data: DashboardData | null;
  onNavigateTab: (tab: string) => void;
  onOpenRecordPayment: () => void;
  onOpenGenerateInvoices: () => void;
  propertiesCount?: number;
  onOpenAddProperty?: () => void;
  onOpenImportCsv?: () => void;
  onOpenProfileSettings?: () => void;
  organizationData?: any;
  billingEntities?: any[];
}

export const formatINR = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) {
    return "₹0";
  }
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onNavigateTab,
  onOpenRecordPayment,
  onOpenGenerateInvoices,
  propertiesCount = 0,
  onOpenAddProperty,
  onOpenImportCsv,
  onOpenProfileSettings,
  organizationData,
  billingEntities = [],
}) => {
  const [showAccount, setShowAccount] = React.useState(false);
  const [showKycDetails, setShowKycDetails] = React.useState(false);
  if (!data) {
    return (
      <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-gray-600">Loading Portfolio Analytics Engine...</p>
      </div>
    );
  }

  const { summary, occupancy, walt, noi, topTenants, alerts } = data;

  return (
    <div className="space-y-6">
      {/* ──── ONBOARDING EMPTY STATE BANNER ──── */}
      {propertiesCount === 0 ? (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-teal-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Pristine Portfolio Workspace
              </span>
              <span className="text-xs text-teal-200 font-medium">Ready for Your Portfolio Data</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white">Welcome to your Commercial Rent Roll Desk</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              No commercial properties are currently registered in your portfolio. Add your first commercial office building or import your existing Excel rent roll to unlock automated billing, step-up escalations, and NOI analytics.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {onOpenAddProperty && (
              <button
                type="button"
                onClick={onOpenAddProperty}
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Add Commercial Property</span>
              </button>
            )}
            {onOpenImportCsv && (
              <button
                type="button"
                onClick={onOpenImportCsv}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Import Rent Roll (CSV)</span>
              </button>
            )}
          </div>
        </div>
      ) : summary.totalLeasesCount === 0 ? (
        <div className="bg-gradient-to-r from-teal-900 via-[#0F8B7D] to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-teal-100">
                Ready for Onboarding
              </span>
              <span className="text-xs text-teal-100 font-medium">Clean Portfolio Desk</span>
            </div>
            <h2 className="text-lg md:text-xl font-black">Register Your Active Tenant Leases</h2>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
              Your property is registered. Click &quot;+ Add First Lease&quot; or &quot;Import Rent Roll (CSV)&quot; to record tenant contracts, configure annual rental escalations, and automate monthly GST invoicing.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab("rentroll")}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0F8B7D] text-xs font-black hover:bg-teal-50 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Add First Lease</span>
            </button>
            {onOpenImportCsv && (
              <button
                onClick={onOpenImportCsv}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Import CSV</span>
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* ──── COMMERCIAL ENTITY & BANK SETTLEMENT PROFILE (Compact Collapsible Strip) ──── */}
      {(() => {
        const org = organizationData || {};
        const defaultEntity = (billingEntities && billingEntities.length > 0)
          ? (billingEntities.find((b: any) => b.isDefault) || billingEntities[0])
          : null;
        const displayOrgName = (org?.name && !org.name.includes("Acme"))
          ? org.name
          : (typeof window !== "undefined" ? (localStorage.getItem("officex_active_org") || localStorage.getItem("officex_org_name") || localStorage.getItem("officex_portfolio_name")) : "") || "Commercial Portfolio Profile";
        const isKycComplete = Boolean((org?.pan || org?.gstin) && (org?.bankAccountNumber || defaultEntity?.bankAccountNumber));

        return (
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {displayOrgName || "Portfolio Profile"}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                    isKycComplete
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {isKycComplete ? "KYC Active" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowKycDetails(prev => !prev)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {showKycDetails ? "Hide" : "Details"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showKycDetails ? "rotate-180" : ""}`} />
                </button>
                {onOpenProfileSettings && (
                  <button
                    type="button"
                    onClick={onOpenProfileSettings}
                    className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible Details */}
            {showKycDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 mt-2.5 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Bank Account</p>
                  <p className="font-bold text-slate-900 text-[11px] truncate">{org?.bankName || defaultEntity?.bankName || "Pending"}</p>
                  <p className="font-mono text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                    <span>{(org?.bankAccountNumber || defaultEntity?.bankAccountNumber)
                      ? (showAccount ? (org?.bankAccountNumber || defaultEntity?.bankAccountNumber) : `•••• ${(org?.bankAccountNumber || defaultEntity?.bankAccountNumber).slice(-4)}`)
                      : "—"}</span>
                    {(org?.bankAccountNumber || defaultEntity?.bankAccountNumber) && (
                      <button type="button" onClick={() => setShowAccount(!showAccount)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                        {showAccount ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    )}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Tax IDs</p>
                  <p className="text-[11px] text-slate-700">PAN: <strong className="text-slate-900 font-mono">{org?.pan || defaultEntity?.pan || "—"}</strong></p>
                  <p className="text-[11px] text-slate-700 mt-0.5">GSTIN: <strong className="text-slate-900 font-mono truncate">{org?.gstin || defaultEntity?.gstin || "—"}</strong></p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Contact</p>
                  <p className="font-bold text-slate-900 text-[11px] truncate">{org?.contactPerson || (typeof window !== "undefined" ? localStorage.getItem("officex_user_name") : "") || "—"}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{org?.contactEmail || (typeof window !== "undefined" ? localStorage.getItem("officex_user_email") : "") || "—"}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Office</p>
                  <p className="text-[11px] text-slate-700 line-clamp-2">{org?.address || (org?.city ? `${org.city}, ${org.state || "India"}` : "—")}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Currency: <strong>{org?.currency || "INR"}</strong></p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: "Total Leases", value: String(summary.totalLeasesCount), sub: `${summary.activeLeasesCount} active`, icon: Building2, iconBg: "bg-blue-50", iconColor: "text-blue-600", tab: "rentroll" },
          { label: "Monthly Rent", value: formatINR(summary.totalMonthlyRent), sub: "Base rent", icon: TrendingUp, iconBg: "bg-teal-50", iconColor: "text-teal-600", tab: "rentroll" },
          { label: "CAM / Month", value: formatINR(summary.totalCamMonthly), sub: "Maintenance", icon: Layers, iconBg: "bg-amber-50", iconColor: "text-amber-600", tab: "rentroll" },
          { label: "Gross Billing", value: formatINR(summary.totalMonthlyBilling), sub: "Rent + CAM + GST", icon: Receipt, iconBg: "bg-amber-50", iconColor: "text-amber-700", tab: "invoices", highlight: true },
          { label: "Outstanding", value: formatINR(summary.totalOutstanding), sub: "Overdue invoices", icon: AlertTriangle, iconBg: "bg-rose-50", iconColor: "text-rose-600", tab: "aging", danger: true },
          { label: "Overdue Tenants", value: `${summary.overdueLeasesCount}`, sub: "Awaiting payment", icon: Clock, iconBg: "bg-orange-50", iconColor: "text-orange-600", tab: "aging" },
          { label: "Expiring ≤90d", value: String(summary.expiring90Days), sub: summary.expiring30Days > 0 ? `${summary.expiring30Days} within 30d` : "Renewal queue", icon: Calendar, iconBg: "bg-purple-50", iconColor: "text-purple-600", tab: "rentroll" },
          { label: "Escalations Due", value: String(summary.escalationsDueCount), sub: "Ready to apply", icon: ArrowUpRight, iconBg: "bg-cyan-50", iconColor: "text-cyan-600", tab: "escalations" }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className={`bg-white border rounded-xl p-3.5 cursor-pointer group hover:shadow-sm transition-all ${
                kpi.highlight ? "border-amber-200 hover:border-amber-400" : kpi.danger ? "border-rose-200 hover:border-rose-400" : "border-slate-200 hover:border-teal-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
                <span className={`p-1 ${kpi.iconBg} ${kpi.iconColor} rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className={`text-xl font-black tracking-tight ${kpi.danger ? "text-rose-600" : "text-slate-900"}`}>{kpi.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Portfolio Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Occupancy Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Portfolio Occupancy</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-[#0F8B7D] border border-teal-200 rounded-full font-bold">
                {occupancy.occupancyPct}% Leased
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex mb-3">
              <div
                className="bg-gradient-to-r from-teal-500 to-[#0F8B7D] h-full rounded-full transition-all duration-1000"
                style={{ width: `${occupancy.occupancyPct}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-500">Total Area</p>
                <p className="text-xs font-black text-gray-900 mt-0.5">{occupancy.totalArea.toLocaleString()} sqft</p>
              </div>
              <div className="bg-teal-50/60 p-2.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-teal-700">Occupied</p>
                <p className="text-xs font-black text-teal-800 mt-0.5">{occupancy.occupiedArea.toLocaleString()} sqft</p>
              </div>
              <div className="bg-amber-50/60 p-2.5 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-amber-700">Vacant</p>
                <p className="text-xs font-black text-amber-800 mt-0.5">{occupancy.vacantArea.toLocaleString()} sqft</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("occupancy")}
            className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Stacking Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* WALT (Weighted Average Lease Expiry) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">WALT (Lease Tenor)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
                {walt.waltByAreaYears} Years
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">WALT by Leased Area</span>
                  <span className="text-xs font-black text-gray-900">{walt.waltByAreaMonths} Mos ({walt.waltByAreaYears} yrs)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, (walt.waltByAreaMonths / 60) * 100)}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">WALT by Monthly Revenue</span>
                  <span className="text-xs font-black text-gray-900">{walt.waltByRevenueMonths} Mos ({walt.waltByRevenueYears} yrs)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, (walt.waltByRevenueMonths / 60) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">Weighted lease stability index</p>
        </div>

        {/* Net Operating Income & Cap Rate */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <Percent className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">NOI &amp; Cap Rate Yield</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold">
                {noi.capRatePct}% Cap Rate
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Monthly Gross Revenue:</span>
                <span className="font-bold text-gray-900">{formatINR(noi.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Monthly OpEx (CAM/Tax/Utils):</span>
                <span className="font-bold text-rose-600">-{formatINR(noi.monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-gray-100">
                <span className="font-bold text-[#0F8B7D]">Net Operating Income (NOI):</span>
                <span className="font-black text-[#0F8B7D]">{formatINR(noi.monthlyNOI)}/mo</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Operating Expense Ratio (OER):</span>
                <span className="font-bold text-gray-700">{noi.oerPct}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("pnl")}
            className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full P&amp;L Breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Top Tenants & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Tenants by Revenue */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <span>Top Tenants by Monthly Revenue</span>
            </h3>
            <span className="text-xs font-semibold text-gray-500">Portfolio Share</span>
          </div>

          <div className="space-y-3">
            {topTenants.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                No corporate tenants registered yet. Add a lease to see tenant revenue distribution.
              </div>
            ) : (
              topTenants.map((t, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">{t.tenantName}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({t.propertyName})</span>
                      {t.portalLive ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Tenant Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="Tenant has not accepted invitation yet">
                          ○ Invite Pending
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-teal-700">{formatINR(t.monthlyRent)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>{t.areaSqFt.toLocaleString()} sqft</span>
                    <span>{t.sharePct}% of total rent</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, t.sharePct * 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Management Alerts Ticker */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span>Active Management Alerts</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold">
                {alerts.length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  All portfolio leases, invoices and escalations in perfect compliance.
                </div>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                      a.severity === "critical"
                        ? "bg-rose-50/80 border-rose-200 text-rose-950"
                        : a.severity === "warning"
                        ? "bg-amber-50/80 border-amber-200 text-amber-950"
                        : "bg-blue-50/80 border-blue-200 text-blue-950"
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      a.severity === "critical" ? "text-rose-600" : a.severity === "warning" ? "text-amber-600" : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-950">{a.title}</p>
                      <p className="text-gray-600 text-[11px] mt-0.5 font-medium">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onOpenRecordPayment}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors text-center cursor-pointer shadow-xs"
            >
              Record Payment Receipt
            </button>
            <button
              onClick={onOpenGenerateInvoices}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
            >
              Issue Batch Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

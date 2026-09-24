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
  Sparkles
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
}) => {
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

      {/* ──── 8 PRIMARY KPI METRIC CARDS (Excel Dashboard Layout) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Leases */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Leases</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-gray-900 tracking-tight">{summary.totalLeasesCount}</div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{summary.activeLeasesCount} Active</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">
            {summary.totalLeasesCount > 0 ? `Across ${summary.totalLeasesCount} Active Leases` : "No registered leases"}
          </p>
        </div>

        {/* 2. Monthly Base Rent */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Monthly Base Rent</span>
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(summary.totalMonthlyRent)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Contractual Base Rent</p>
        </div>

        {/* 3. CAM / Month */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">CAM Recovery / Mo</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(summary.totalCamMonthly)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Maintenance Recoveries</p>
        </div>

        {/* 4. Monthly Total Billing */}
        <div
          onClick={() => onNavigateTab("invoices")}
          className="bg-gradient-to-br from-white to-amber-50/40 border border-amber-200/80 hover:border-amber-400 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">Monthly Gross Billing</span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">{formatINR(summary.totalMonthlyBilling)}</div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1.5">Rent + CAM + Utilities + GST 18%</p>
        </div>

        {/* 5. Total Outstanding */}
        <div
          onClick={() => onNavigateTab("aging")}
          className="bg-white border border-rose-200/80 hover:border-rose-400 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">Total Outstanding</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">{formatINR(summary.totalOutstanding)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Across Overdue &amp; Issued Invoices</p>
        </div>

        {/* 6. Overdue Leases */}
        <div
          onClick={() => onNavigateTab("aging")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Overdue Tenants</span>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{summary.overdueLeasesCount} Tenants</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Awaiting Payment Settlement</p>
        </div>

        {/* 7. Expiring <= 90 Days */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Expiring ≤ 90 Days</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-purple-900 tracking-tight">{summary.expiring90Days}</div>
            {summary.expiring30Days > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">({summary.expiring30Days} ≤30d)</span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Renewal Negotiation Required</p>
        </div>

        {/* 8. Escalations Due / Soon */}
        <div
          onClick={() => onNavigateTab("escalations")}
          className="bg-white border border-gray-200/90 hover:border-[#0F8B7D]/50 p-4.5 rounded-2xl shadow-xs transition-all cursor-pointer group hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Escalations Due</span>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-900 tracking-tight">{summary.escalationsDueCount}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1.5">Ready for 1-Click Application</p>
        </div>
      </div>

      {/* ──── STRATEGIC PORTFOLIO ANALYTICS (Occupancy, WALT, NOI & Cap Rate) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="text-[11px] text-gray-500 font-medium text-center mt-4">
            Long-term institutional weighted stability index
          </div>
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

      {/* ──── TOP TENANTS BY REVENUE & LIVE MANAGEMENT ALERTS ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div>
                      <span className="text-xs font-bold text-gray-900">{t.tenantName}</span>
                      <span className="text-[11px] text-gray-500 font-medium ml-2">({t.propertyName})</span>
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

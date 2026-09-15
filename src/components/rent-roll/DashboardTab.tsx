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
}

export const formatINR = (val: number): string => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${val.toLocaleString("en-IN")}`;
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onNavigateTab,
  onOpenRecordPayment,
  onOpenGenerateInvoices,
}) => {
  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Loading Portfolio Analytics Engine...</p>
      </div>
    );
  }

  const { summary, occupancy, walt, noi, topTenants, alerts } = data;

  return (
    <div className="space-y-6">
      {/* ──── 8 PRIMARY KPI METRIC CARDS (Excel Dashboard Layout) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Leases */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Leases</span>
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white tracking-tight">{summary.totalLeasesCount}</div>
            <span className="text-xs font-medium text-emerald-400">{summary.activeLeasesCount} Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 5 Prime Office Assets</p>
        </div>

        {/* 2. Monthly Base Rent */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Base Rent</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatINR(summary.totalMonthlyRent)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Contractual Base Rent</p>
        </div>

        {/* 3. CAM / Month */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CAM Recovery / Mo</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatINR(summary.totalCamMonthly)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Maintenance Recoveries</p>
        </div>

        {/* 4. Monthly Total Billing */}
        <div
          onClick={() => onNavigateTab("invoices")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Monthly Gross Billing</span>
            <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">{formatINR(summary.totalMonthlyBilling)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Rent + CAM + Utilities + GST 18%</p>
        </div>

        {/* 5. Total Outstanding */}
        <div
          onClick={() => onNavigateTab("aging")}
          className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Total Outstanding</span>
            <span className="p-1.5 bg-red-500/10 text-red-400 rounded-lg group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-400 tracking-tight">{formatINR(summary.totalOutstanding)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across Overdue & Issued Invoices</p>
        </div>

        {/* 6. Overdue Leases */}
        <div
          onClick={() => onNavigateTab("aging")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Tenants</span>
            <span className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{summary.overdueLeasesCount} Tenants</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting Payment Settlement</p>
        </div>

        {/* 7. Expiring <= 90 Days */}
        <div
          onClick={() => onNavigateTab("rentroll")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expiring ≤ 90 Days</span>
            <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-purple-300 tracking-tight">{summary.expiring90Days}</div>
            {summary.expiring30Days > 0 && (
              <span className="text-xs font-semibold text-red-400">({summary.expiring30Days} ≤30d)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Renewal Negotiation Required</p>
        </div>

        {/* 8. Escalations Due / Soon */}
        <div
          onClick={() => onNavigateTab("escalations")}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Escalations Due</span>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">{summary.escalationsDueCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Ready for 1-Click Application</p>
        </div>
      </div>

      {/* ──── STRATEGIC PORTFOLIO ANALYTICS (Occupancy, WALT, NOI & Cap Rate) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Portfolio Occupancy</h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">
                {occupancy.occupancyPct}% Leased
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${occupancy.occupancyPct}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500">Total Area</p>
                <p className="text-xs font-bold text-slate-300 mt-0.5">{occupancy.totalArea.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500">Occupied</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">{occupancy.occupiedArea.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500">Vacant</p>
                <p className="text-xs font-bold text-amber-400 mt-0.5">{occupancy.vacantArea.toLocaleString()} sqft</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("occupancy")}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Stacking Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WALT (Weighted Average Lease Expiry) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">WALT (Lease Tenor)</h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full font-medium">
                {walt.waltByAreaYears} Years
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">WALT by Leased Area</span>
                  <span className="text-xs font-bold text-white">{walt.waltByAreaMonths} Months ({walt.waltByAreaYears} yrs)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (walt.waltByAreaMonths / 60) * 100)}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">WALT by Monthly Revenue</span>
                  <span className="text-xs font-bold text-white">{walt.waltByRevenueMonths} Months ({walt.waltByRevenueYears} yrs)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (walt.waltByRevenueMonths / 60) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center mt-4">
            Long-term institutional weighted stability index
          </div>
        </div>

        {/* Net Operating Income & Cap Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">NOI & Cap Rate Yield</h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-medium">
                {noi.capRatePct}% Cap Rate
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly Gross Revenue:</span>
                <span className="font-semibold text-white">{formatINR(noi.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly OpEx (CAM/Tax/Utils):</span>
                <span className="font-semibold text-red-400">-{formatINR(noi.monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="font-medium text-amber-400">Net Operating Income (NOI):</span>
                <span className="font-bold text-amber-300">{formatINR(noi.monthlyNOI)}/mo</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Operating Expense Ratio (OER):</span>
                <span className="font-semibold text-slate-300">{noi.oerPct}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("pnl")}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Full P&L Breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ──── TOP TENANTS BY REVENUE & LIVE MANAGEMENT ALERTS ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Tenants by Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Top Tenants by Monthly Revenue</span>
            </h3>
            <span className="text-xs text-slate-400">Portfolio Share</span>
          </div>

          <div className="space-y-3">
            {topTenants.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs font-bold text-white">{t.tenantName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({t.propertyName})</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{formatINR(t.monthlyRent)}/mo</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>{t.areaSqFt.toLocaleString()} sqft</span>
                  <span>{t.sharePct}% of total rent</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, t.sharePct * 3)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Management Alerts Ticker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Active Management Alerts</span>
              </h3>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-medium">
                {alerts.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  All portfolio leases, invoices and escalations in perfect compliance.
                </div>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                      a.severity === "critical"
                        ? "bg-red-950/30 border-red-800/50 text-red-200"
                        : a.severity === "warning"
                        ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                        : "bg-blue-950/30 border-blue-800/50 text-blue-200"
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-amber-400" : "text-blue-400"
                    }`} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={onOpenRecordPayment}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold rounded-lg transition-all text-center"
            >
              Record Payment Receipt
            </button>
            <button
              onClick={onOpenGenerateInvoices}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all text-center"
            >
              Issue Batch Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

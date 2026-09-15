"use client";

import React from "react";
import {
  TrendingUp,
  Percent,
  DollarSign,
  PieChart,
  Plus,
  Building,
  ArrowUpRight,
  Receipt,
  Layers,
  ShieldCheck
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface PnLData {
  portfolio: {
    monthlyBaseRent: number;
    monthlyCamRecovery: number;
    monthlyUtilityRecovery: number;
    monthlyGrossRevenue: number;
    annualGrossRevenue: number;
    expenseBreakdown: Record<string, number>;
    totalMonthlyExpenses: number;
    annualExpenses: number;
    monthlyNOI: number;
    annualNOI: number;
    oerPct: number;
    totalAssetValue: number;
    capRatePct: number;
  };
  propertyPnL: Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    grade: string;
    grossMonthlyRevenue: number;
    monthlyExpenses: number;
    monthlyNOI: number;
    annualNOI: number;
    oerPct: number;
    capRatePct: number;
    assetValue: number;
  }>;
}

interface PnlTabProps {
  pnlData: PnLData | null;
  onOpenAddExpense: () => void;
}

export const PnlTab: React.FC<PnlTabProps> = ({ pnlData, onOpenAddExpense }) => {
  if (!pnlData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Auditing Operating Statements & NOI Yields...</p>
      </div>
    );
  }

  const { portfolio, propertyPnL } = pnlData;

  const categoryLabels: Record<string, string> = {
    cam: "CAM Operations & Housekeeping",
    property_tax: "Municipal Property Assessment Tax",
    insurance: "Asset & Public Liability Insurance",
    utility_power: "Grid Electricity & DG Backup Power",
    utility_water: "Water Supply & Sewage Charges",
    repairs_maintenance: "Preventative Maintenance & AMC",
    statutory_fees: "Statutory & Compliance Fees",
    mgmt_fee: "Asset Management Surcharges",
    other: "Miscellaneous Outgoings",
  };

  return (
    <div className="space-y-6">
      {/* ──── TOP NOI & FINANCIAL METRIC CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Gross Revenues */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Gross Revenues / Mo</span>
          <div className="text-2xl font-bold text-white mt-1">{formatINR(portfolio.monthlyGrossRevenue)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Annual: {formatINR(portfolio.annualGrossRevenue)}</p>
        </div>

        {/* Operating Outgoings */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Operating Expenses (OpEx)</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{formatINR(portfolio.totalMonthlyExpenses)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">OER: {portfolio.oerPct}% of Gross Revenue</p>
        </div>

        {/* Monthly NOI */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl shadow-lg bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Net Operating Income (NOI)</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{formatINR(portfolio.monthlyNOI)}/mo</div>
          <p className="text-[11px] text-amber-200/70 mt-0.5">Annual NOI: {formatINR(portfolio.annualNOI)}</p>
        </div>

        {/* Cap Rate Yield */}
        <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-xl shadow-lg bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Portfolio Cap Rate Yield</span>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{portfolio.capRatePct}% Yield</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Asset Base: {formatINR(portfolio.totalAssetValue)}</p>
        </div>
      </div>

      {/* ──── EXPENSE CATEGORY BREAKDOWN ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Operating Expense (OpEx) Line-Item Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">Categorized monthly property expenditures and recovery offsets</p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property Expense</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(portfolio.expenseBreakdown).map(([cat, amount]) => {
            const pct = portfolio.totalMonthlyExpenses > 0
              ? Math.round((amount / portfolio.totalMonthlyExpenses) * 100)
              : 0;

            return (
              <div key={cat} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">{categoryLabels[cat] || cat}</span>
                  <span className="text-xs font-mono font-bold text-red-400">{formatINR(amount)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Category Outgoing</span>
                  <span>{pct}% of Total OpEx</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── PROPERTY-BY-PROPERTY P&L COMPARISON TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Property-Wise Net Operating Income & Yield Benchmark
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Property Asset</th>
                <th className="p-3 text-right">Monthly Gross Billing</th>
                <th className="p-3 text-right text-red-400">Monthly OpEx</th>
                <th className="p-3 text-right text-amber-300 font-bold">Monthly NOI</th>
                <th className="p-3 text-right text-white font-bold">Annualized NOI</th>
                <th className="p-3 text-center">OER %</th>
                <th className="p-3 text-right">Asset Valuation</th>
                <th className="p-3 text-center text-cyan-300 font-bold">Cap Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {propertyPnL.map((p) => (
                <tr key={p.propertyId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div>{p.propertyName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Grade {p.grade} • {p.city}</div>
                    </div>
                  </td>

                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(p.grossMonthlyRevenue)}
                  </td>

                  <td className="p-3 text-right font-mono text-red-400">
                    -{formatINR(p.monthlyExpenses)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10">
                    {formatINR(p.monthlyNOI)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-white">
                    {formatINR(p.annualNOI)}
                  </td>

                  <td className="p-3 text-center font-semibold text-slate-300">
                    {p.oerPct}%
                  </td>

                  <td className="p-3 text-right font-mono text-slate-400">
                    {formatINR(p.assetValue)}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded font-bold text-xs border border-cyan-500/30">
                      {p.capRatePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

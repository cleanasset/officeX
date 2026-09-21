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
      <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-gray-600">Auditing Operating Statements &amp; NOI Yields...</p>
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
        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Gross Revenues / Mo</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(portfolio.monthlyGrossRevenue)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Annual: {formatINR(portfolio.annualGrossRevenue)}</p>
        </div>

        {/* Operating Outgoings */}
        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Operating Expenses (OpEx)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{formatINR(portfolio.totalMonthlyExpenses)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">OER: {portfolio.oerPct}% of Gross Revenue</p>
        </div>

        {/* Monthly NOI */}
        <div className="bg-gradient-to-br from-white to-teal-50/40 border border-teal-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-[#0F8B7D] uppercase tracking-wider">Net Operating Income (NOI)</span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-1">{formatINR(portfolio.monthlyNOI)}/mo</div>
          <p className="text-[11px] text-teal-700 font-semibold mt-0.5">Annual NOI: {formatINR(portfolio.annualNOI)}</p>
        </div>

        {/* Cap Rate Yield */}
        <div className="bg-gradient-to-br from-white to-blue-50/40 border border-blue-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Portfolio Cap Rate Yield</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{portfolio.capRatePct}% Yield</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Asset Base: {formatINR(portfolio.totalAssetValue)}</p>
        </div>
      </div>

      {/* ──── EXPENSE CATEGORY BREAKDOWN ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <span>Operating Expense (OpEx) Line-Item Breakdown</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Categorized monthly property expenditures and recovery offsets</p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property Expense</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(portfolio.expenseBreakdown).map(([cat, amount]) => {
            const pct = portfolio.totalMonthlyExpenses > 0
              ? Math.round((amount / portfolio.totalMonthlyExpenses) * 100)
              : 0;

            return (
              <div key={cat} className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">{categoryLabels[cat] || cat}</span>
                  <span className="text-xs font-mono font-black text-rose-600">{formatINR(amount)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5 font-medium">
                  <span>Category Outgoing</span>
                  <span>{pct}% of Total OpEx</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── PROPERTY-BY-PROPERTY P&L COMPARISON TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/90 border-b border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Property-Wise Net Operating Income &amp; Yield Benchmark
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Property Asset</th>
                <th className="p-3.5 text-right">Monthly Gross Billing</th>
                <th className="p-3.5 text-right text-rose-600 font-bold">Monthly OpEx</th>
                <th className="p-3.5 text-right text-teal-700 font-black bg-teal-50/40">Monthly NOI</th>
                <th className="p-3.5 text-right text-gray-900 font-bold">Annualized NOI</th>
                <th className="p-3.5 text-center">OER %</th>
                <th className="p-3.5 text-right">Asset Valuation</th>
                <th className="p-3.5 text-center text-blue-700 font-bold">Cap Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {propertyPnL.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-500">
                    <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No properties in portfolio</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Add properties and record leases to track Net Operating Income (NOI) and cap rates.
                    </p>
                  </td>
                </tr>
              ) : (
                propertyPnL.map((p) => (
                  <tr key={p.propertyId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#0F8B7D]" />
                      <div>
                        <div className="font-bold text-gray-950">{p.propertyName}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Grade {p.grade} • {p.city}</div>
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-mono text-gray-700 font-semibold">
                      {formatINR(p.grossMonthlyRevenue)}
                    </td>

                    <td className="p-3.5 text-right font-mono text-rose-600 font-bold">
                      -{formatINR(p.monthlyExpenses)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-[#0F8B7D] bg-teal-50/40">
                      {formatINR(p.monthlyNOI)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-gray-900">
                      {formatINR(p.annualNOI)}
                    </td>

                    <td className="p-3.5 text-center font-bold text-gray-700">
                      {p.oerPct}%
                    </td>

                    <td className="p-3.5 text-right font-mono text-gray-500 font-medium">
                      {formatINR(p.assetValue)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold text-xs border border-blue-200">
                        {p.capRatePct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface ForecastData {
  months: Array<{
    monthIndex: number;
    monthLabel: string;
    projectedBaseRent: number;
    projectedCam: number;
    projectedOther: number;
    projectedGross: number;
    activeLeasesCount: number;
    escalationsTriggered: number;
    expirationsTriggered: number;
  }>;
  annualProjectedGross: number;
  annualProjectedBase: number;
  annualProjectedCam: number;
}

interface ForecastTabProps {
  forecastData: ForecastData | null;
}

export const ForecastTab: React.FC<ForecastTabProps> = ({ forecastData }) => {
  if (!forecastData) {
    return (
      <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-gray-600">Computing 12-Month Contractual Revenue Simulation...</p>
      </div>
    );
  }

  const { months, annualProjectedGross, annualProjectedBase, annualProjectedCam } = forecastData;
  const maxMonthlyGross = Math.max(...months.map((m) => m.projectedGross), 1);

  return (
    <div className="space-y-6">
      {/* ──── TOP ANNUALIZED REVENUE PROJECTION CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-amber-50/40 border border-amber-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            12-Month Projected Gross Run-Rate
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">{formatINR(annualProjectedGross)}</div>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Contractual Gross + Step-up Escalations</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Projected Base Rent
          </span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-1">{formatINR(annualProjectedBase)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Exclusive of CAM &amp; Outgoings</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Projected CAM Recoveries
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1">{formatINR(annualProjectedCam)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Full common area maintenance budget</p>
        </div>
      </div>

      {/* ──── 12-MONTH VISUAL REVENUE SIMULATION BARS ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>12-Month Forward Cash Flow &amp; Escalation Trajectory</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Simulates month-by-month step-up escalations, lock-ins, and renewals
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-mono font-bold self-start sm:self-auto">
            FY 2026–27 Matrix
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-8 pb-4 items-end min-h-[220px]">
          {months.map((m, idx) => {
            const heightPct = maxMonthlyGross > 0 ? Math.round((m.projectedGross / maxMonthlyGross) * 100) : 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                {/* Value on hover/regular */}
                <div className="text-[10px] font-mono text-gray-900 font-black opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all text-center">
                  {formatINR(m.projectedGross)}
                </div>

                {/* Bar */}
                <div className="w-full bg-gray-100 h-32 rounded-xl p-1 border border-gray-200 flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#0F8B7D] to-teal-400 rounded-lg transition-all duration-700 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>

                {/* Month Label */}
                <span className="text-[11px] font-bold text-gray-800 text-center">{m.monthLabel.split(' ')[0]}</span>
                <span className="text-[9px] text-gray-400 font-mono font-semibold">{m.monthLabel.split(' ')[1]}</span>

                {/* Badges for escalation / expiry */}
                <div className="flex flex-col gap-0.5 items-center">
                  {m.escalationsTriggered > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] rounded font-bold border border-blue-200">
                      +{m.escalationsTriggered} Esc
                    </span>
                  )}
                  {m.expirationsTriggered > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] rounded font-bold border border-rose-200">
                      -{m.expirationsTriggered} Exp
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── MONTH-BY-MONTH DETAILED AUDIT TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/90 border-b border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Monthly Forward Projection Schedule
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Month</th>
                <th className="p-3.5 text-right">Projected Base Rent</th>
                <th className="p-3.5 text-right">CAM Recovery</th>
                <th className="p-3.5 text-right font-black text-amber-900 bg-amber-50/40">Total Monthly Gross</th>
                <th className="p-3.5 text-center">Active Leases</th>
                <th className="p-3.5 text-center">Escalation Events</th>
                <th className="p-3.5 text-center">Expiration Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {months.map((m, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#0F8B7D]" />
                    <span>{m.monthLabel}</span>
                  </td>

                  <td className="p-3.5 text-right font-mono text-gray-700">
                    {formatINR(m.projectedBaseRent)}
                  </td>

                  <td className="p-3.5 text-right font-mono text-gray-700">
                    {formatINR(m.projectedCam)}
                  </td>

                  <td className="p-3.5 text-right font-mono font-black text-amber-900 bg-amber-50/40">
                    {formatINR(m.projectedGross)}
                  </td>

                  <td className="p-3.5 text-center font-bold text-gray-800">
                    {m.activeLeasesCount} Leases
                  </td>

                  <td className="p-3.5 text-center">
                    {m.escalationsTriggered > 0 ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-xs border border-blue-200">
                        +{m.escalationsTriggered} Escalations
                      </span>
                    ) : (
                      <span className="text-gray-300 font-bold">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    {m.expirationsTriggered > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold text-xs border border-rose-200">
                        {m.expirationsTriggered} Expirations
                      </span>
                    ) : (
                      <span className="text-gray-300 font-bold">—</span>
                    )}
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

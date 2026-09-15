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
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Computing 12-Month Contractual Revenue Simulation...</p>
      </div>
    );
  }

  const { months, annualProjectedGross, annualProjectedBase, annualProjectedCam } = forecastData;
  const maxMonthlyGross = Math.max(...months.map((m) => m.projectedGross), 1);

  return (
    <div className="space-y-6">
      {/* ──── TOP ANNUALIZED REVENUE PROJECTION CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            12-Month Projected Gross Run-Rate
          </span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{formatINR(annualProjectedGross)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Contractual Gross + Step-up Escalations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Projected Base Rent
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(annualProjectedBase)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Exclusive of CAM & Outgoings</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Projected CAM Recoveries
          </span>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{formatINR(annualProjectedCam)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Full common area maintenance budget</p>
        </div>
      </div>

      {/* ──── 12-MONTH VISUAL REVENUE SIMULATION BARS ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>12-Month Forward Cash Flow & Escalation Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulates month-by-month step-up escalations, lock-ins, and renewals
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg font-mono">
            FY 2026–27 Matrix
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-8 pb-4 items-end min-h-[220px]">
          {months.map((m, idx) => {
            const heightPct = Math.round((m.projectedGross / maxMonthlyGross) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                {/* Floating Value Tooltip on hover */}
                <div className="text-[10px] font-mono text-amber-300 font-bold opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all text-center">
                  {formatINR(m.projectedGross)}
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-950 h-32 rounded-lg p-1 border border-slate-800/80 flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 via-teal-500 to-amber-400 rounded-md transition-all duration-700 group-hover:brightness-125"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>

                {/* Month Label */}
                <span className="text-[11px] font-bold text-slate-300 text-center">{m.monthLabel.split(' ')[0]}</span>
                <span className="text-[9px] text-slate-500 font-mono">{m.monthLabel.split(' ')[1]}</span>

                {/* Badges for escalation / expiry */}
                <div className="flex flex-col gap-0.5 items-center">
                  {m.escalationsTriggered > 0 && (
                    <span className="px-1 py-0.2 bg-cyan-500/20 text-cyan-300 text-[9px] rounded font-bold border border-cyan-500/40">
                      +{m.escalationsTriggered} Esc
                    </span>
                  )}
                  {m.expirationsTriggered > 0 && (
                    <span className="px-1 py-0.2 bg-red-500/20 text-red-300 text-[9px] rounded font-bold border border-red-500/40">
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Monthly Forward Projection Schedule
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3 text-right">Projected Base Rent</th>
                <th className="p-3 text-right">CAM Recovery</th>
                <th className="p-3 text-right font-bold text-amber-300">Total Monthly Gross</th>
                <th className="p-3 text-center">Active Leases</th>
                <th className="p-3 text-center">Escalation Events</th>
                <th className="p-3 text-center">Expiration Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {months.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{m.monthLabel}</span>
                  </td>

                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(m.projectedBaseRent)}
                  </td>

                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(m.projectedCam)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10">
                    {formatINR(m.projectedGross)}
                  </td>

                  <td className="p-3 text-center font-semibold text-slate-200">
                    {m.activeLeasesCount} Leases
                  </td>

                  <td className="p-3 text-center">
                    {m.escalationsTriggered > 0 ? (
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded font-bold text-xs border border-cyan-500/30">
                        +{m.escalationsTriggered} Escalations
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {m.expirationsTriggered > 0 ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded font-bold text-xs border border-red-500/30">
                        {m.expirationsTriggered} Expirations
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
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

"use client";

import React, { useState } from "react";
import {
  Layers,
  Building2,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Maximize2
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface OccupancyData {
  portfolio: {
    totalArea: number;
    occupiedArea: number;
    vacantArea: number;
    occupancyPct: number;
    vacancyPct: number;
  };
  properties: Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    grade: string;
    totalArea: number;
    occupiedArea: number;
    vacantArea: number;
    occupancyPct: number;
    targetOccupancyPct: number;
    gapToTargetPct: number;
    spaces: Array<{
      id: string;
      spaceNumber: string;
      unitNumber: string;
      floorNumber: number;
      spaceType: string;
      carpetArea: number;
      chargeableArea: number;
      standardRatePsf: number;
      standardCamPsf: number;
      status: string;
      tenantName: string;
      monthlyRent: number;
      expiryDate: string | null;
    }>;
  }>;
}

interface OccupancyTabProps {
  occupancyData: OccupancyData | null;
}

export const OccupancyTab: React.FC<OccupancyTabProps> = ({ occupancyData }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");

  if (!occupancyData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Rendering Portfolio Stacking Matrix...</p>
      </div>
    );
  }

  const { portfolio, properties } = occupancyData;

  const displayProperties = selectedPropertyId === "ALL"
    ? properties
    : properties.filter(p => p.propertyId === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* ──── PORTFOLIO OCCUPANCY ROLL-UP ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Institutional Portfolio Occupancy Index</span>
            </h3>
            <p className="text-xs text-slate-400">Total Leasable Portfolio Area vs Active Committed Leases</p>
          </div>

          {/* Property Selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="ALL">All Portfolio Assets (5 Properties)</option>
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.propertyName} ({p.city})
              </option>
            ))}
          </select>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-950 h-5 rounded-xl overflow-hidden border border-slate-800 flex mb-3 p-0.5">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-2 text-[10px] font-bold text-slate-950"
            style={{ width: `${portfolio.occupancyPct}%` }}
          >
            {portfolio.occupancyPct}%
          </div>
          <div
            className="bg-slate-800 h-full rounded-lg transition-all text-[10px] text-slate-400 flex items-center pl-2 font-medium"
            style={{ width: `${portfolio.vacancyPct}%` }}
          >
            {portfolio.vacancyPct}% Vacant
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Leasable Area</span>
            <div className="text-lg font-bold text-white mt-0.5">{portfolio.totalArea.toLocaleString()} sqft</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Committed Leased</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{portfolio.occupiedArea.toLocaleString()} sqft</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Available Vacant</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{portfolio.vacantArea.toLocaleString()} sqft</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Target Occupancy</span>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">90.0% Standard</div>
          </div>
        </div>
      </div>

      {/* ──── PROPERTY-BY-PROPERTY STACKING PLANS ──── */}
      <div className="space-y-6">
        {displayProperties.map((prop) => (
          <div key={prop.propertyId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            {/* Property Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 text-amber-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{prop.propertyName}</h4>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold border border-slate-700">
                      Grade {prop.grade}
                    </span>
                    <span className="text-xs text-slate-400">{prop.city}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {prop.occupiedArea.toLocaleString()} / {prop.totalArea.toLocaleString()} sqft leased ({prop.occupancyPct}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  prop.occupancyPct >= prop.targetOccupancyPct
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  Target: {prop.targetOccupancyPct}% {prop.gapToTargetPct <= 0 ? "(Exceeded)" : `(-${prop.gapToTargetPct}%)`}
                </span>
              </div>
            </div>

            {/* Visual Stacking Floor Plates */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Visual Stacking Plan & Unit Plates:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {prop.spaces.map((sp) => {
                  const isLeased = sp.tenantName !== "Vacant";
                  return (
                    <div
                      key={sp.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isLeased
                          ? "bg-slate-950 border-emerald-800/40 hover:border-emerald-500/60"
                          : "bg-slate-950/60 border-slate-800 border-dashed hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">Floor {sp.floorNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLeased
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {isLeased ? "Leased" : "Vacant Space"}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-amber-300 truncate">
                        {sp.unitNumber}
                      </div>

                      <div className="text-[11px] font-bold text-white mt-1 truncate">
                        {isLeased ? sp.tenantName : <span className="text-slate-500 font-normal">Available for Lease</span>}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                        <span>{sp.chargeableArea.toLocaleString()} sqft</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {isLeased ? formatINR(sp.monthlyRent) : `₹${sp.standardRatePsf} PSF`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

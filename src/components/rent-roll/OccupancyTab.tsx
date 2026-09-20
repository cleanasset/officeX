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
import { SpaceStackingModal } from "./SpaceStackingModal";

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
  const [stackingModalProp, setStackingModalProp] = useState<any>(null);

  if (!occupancyData) {
    return (
      <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-gray-600">Rendering Portfolio Stacking Matrix...</p>
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
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <span>Institutional Portfolio Occupancy Index</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium">Total Leasable Portfolio Area vs Active Committed Leases</p>
          </div>

          {/* Property Selector */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-medium shadow-2xs cursor-pointer"
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
        <div className="w-full bg-gray-100 h-5 rounded-xl overflow-hidden border border-gray-200 flex mb-3 p-0.5">
          <div
            className="bg-gradient-to-r from-teal-500 to-[#0F8B7D] h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
            style={{ width: `${portfolio.occupancyPct}%` }}
          >
            {portfolio.occupancyPct}%
          </div>
          <div
            className="bg-gray-200 h-full rounded-lg transition-all text-[10px] text-gray-600 flex items-center pl-2 font-medium"
            style={{ width: `${portfolio.vacancyPct}%` }}
          >
            {portfolio.vacancyPct}% Vacant
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Leasable Area</span>
            <div className="text-lg font-black text-gray-900 mt-0.5">{portfolio.totalArea.toLocaleString()} sqft</div>
          </div>
          <div className="bg-teal-50/60 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Committed Leased</span>
            <div className="text-lg font-black text-[#0F8B7D] mt-0.5">{portfolio.occupiedArea.toLocaleString()} sqft</div>
          </div>
          <div className="bg-amber-50/60 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Available Vacant</span>
            <div className="text-lg font-black text-amber-800 mt-0.5">{portfolio.vacantArea.toLocaleString()} sqft</div>
          </div>
          <div className="bg-blue-50/60 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Target Occupancy</span>
            <div className="text-lg font-black text-blue-900 mt-0.5">90.0% Standard</div>
          </div>
        </div>
      </div>

      {/* ──── PROPERTY-BY-PROPERTY STACKING PLANS ──── */}
      <div className="space-y-6">
        {displayProperties.map((prop) => (
          <div key={prop.propertyId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Property Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-[#0F8B7D] rounded-xl border border-teal-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{prop.propertyName}</h4>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold border border-gray-200">
                      Grade {prop.grade}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{prop.city}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {prop.occupiedArea.toLocaleString()} / {prop.totalArea.toLocaleString()} sqft leased ({prop.occupancyPct}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStackingModalProp(prop)}
                  className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/50 text-[#0F8B7D] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Floor Stacking Matrix</span>
                </button>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  prop.occupancyPct >= prop.targetOccupancyPct
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  Target: {prop.targetOccupancyPct}% {prop.gapToTargetPct <= 0 ? "(Exceeded)" : `(-${prop.gapToTargetPct}%)`}
                </span>
              </div>
            </div>

            {/* Visual Stacking Floor Plates */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Visual Stacking Plan &amp; Unit Plates:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {prop.spaces.map((sp) => {
                  const isLeased = sp.tenantName !== "Vacant";
                  return (
                    <div
                      key={sp.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isLeased
                          ? "bg-teal-50/20 border-teal-200 hover:border-teal-400"
                          : "bg-gray-50/60 border-gray-200 border-dashed hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-900">Floor {sp.floorNumber}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isLeased
                            ? "bg-teal-50 text-[#0F8B7D] border border-teal-200"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {isLeased ? "Leased" : "Vacant Space"}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-indigo-700 truncate">
                        {sp.unitNumber}
                      </div>

                      <div className="text-[11px] font-black text-gray-900 mt-1 truncate">
                        {isLeased ? sp.tenantName : <span className="text-gray-400 font-normal">Available for Lease</span>}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2.5 pt-2 border-t border-gray-100">
                        <span>{sp.chargeableArea.toLocaleString()} sqft</span>
                        <span className="font-mono text-teal-700 font-bold">
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

      {/* Space Stacking Modal (RR-04) */}
      {stackingModalProp && (
        <SpaceStackingModal
          isOpen={Boolean(stackingModalProp)}
          onClose={() => setStackingModalProp(null)}
          propertyName={stackingModalProp.propertyName}
          spaces={stackingModalProp.spaces}
        />
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  HelpCircle,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Maximize2,
  Calendar,
  X,
  Info
} from "lucide-react";

interface Unit {
  space_id: string;
  space_code: string;
  space_name: string;
  area_sqft: number;
  carpet_sqft: number;
  status: "occupied" | "vacant" | "under_notice" | "fitting_out" | "maintenance" | string;
  occupant_name: string | null;
  contract_code: string | null;
  contract_id: string | null;
  rate_psf: number;
  monthly_rent: number;
  expiry_date: string | null;
}

interface Floor {
  floor_name: string;
  total_area_sqft: number;
  occupied_area_sqft: number;
  occupancy_pct: number;
  units: Unit[];
}

interface StackingData {
  property_id: string;
  property_name: string;
  building_id: string;
  building_name: string;
  properties: Array<{ id: string; name: string; code: string }>;
  buildings: Array<{ id: string; name: string; code: string }>;
  metrics: {
    total_building_area_sqft: number;
    occupied_area_sqft: number;
    vacant_area_sqft: number;
    under_notice_area_sqft: number;
    fitting_out_area_sqft: number;
    occupancy_rate_pct: number;
    monthly_rent_roll: number;
    wale_years: number;
  };
  floors: Floor[];
}

export default function StackingPlanPage() {
  const [data, setData] = useState<StackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);

  useEffect(() => {
    fetchStackingData();
  }, []);

  const fetchStackingData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stacking");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "occupied":
        return {
          label: "Occupied",
          bg: "bg-[#0D7B6C]",
          hoverBg: "hover:bg-[#09574C]",
          border: "border-emerald-600",
          text: "text-white",
          lightBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "under_notice":
        return {
          label: "Under Notice",
          bg: "bg-amber-500",
          hoverBg: "hover:bg-amber-600",
          border: "border-amber-600",
          text: "text-white",
          lightBg: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "fitting_out":
        return {
          label: "Fitting Out",
          bg: "bg-blue-500",
          hoverBg: "hover:bg-blue-600",
          border: "border-blue-600",
          text: "text-white",
          lightBg: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "maintenance":
        return {
          label: "Maintenance / Common",
          bg: "bg-purple-500",
          hoverBg: "hover:bg-purple-600",
          border: "border-purple-600",
          text: "text-white",
          lightBg: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "vacant":
      default:
        return {
          label: "Vacant (Available)",
          bg: "bg-slate-200",
          hoverBg: "hover:bg-slate-300",
          border: "border-slate-300",
          text: "text-slate-700",
          lightBg: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-28 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Screen S-26
              </span>
              <span className="text-xs text-slate-500 font-mono">Elevation Architecture View</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="text-[#0D7B6C] shrink-0" size={24} />
              Interactive Stacking Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Multi-floor building elevation diagram color-coded by lease status with proportional spatial demising.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white shadow-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
            >
              <option value="all">All Units</option>
              <option value="occupied">Occupied Only</option>
              <option value="vacant">Vacant (Available)</option>
              <option value="under_notice">Under Notice</option>
              <option value="fitting_out">Fitting Out</option>
            </select>
            <button
              onClick={fetchStackingData}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Generating building elevation stacking plan...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Overview Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Building Occupancy</div>
                <div className="text-2xl font-bold text-slate-900 mt-1.5 flex items-baseline gap-1.5">
                  {data.metrics.occupancy_rate_pct}%
                  <span className="text-xs font-semibold text-emerald-600">Grade-A Benchmark</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data.metrics.occupied_area_sqft.toLocaleString()} / {data.metrics.total_building_area_sqft.toLocaleString()} sq ft
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vacant Area</div>
                <div className="text-2xl font-bold text-amber-600 mt-1.5">
                  {data.metrics.vacant_area_sqft.toLocaleString()} <span className="text-sm font-normal text-slate-500">sq ft</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Ready for immediate leasing
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monthly Rent Roll</div>
                <div className="text-2xl font-bold text-[#0D7B6C] mt-1.5">
                  ₹{(data.metrics.monthly_rent_roll / 100000).toFixed(2)} <span className="text-sm font-normal text-slate-500">Lakh</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Run-rate from occupied suites
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">WALE (Income)</div>
                <div className="text-2xl font-bold text-slate-900 mt-1.5 flex items-baseline gap-1">
                  {data.metrics.wale_years} <span className="text-sm font-normal text-slate-500">Years</span>
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Stable tenure profile</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Under Notice</div>
                <div className="text-2xl font-bold text-amber-600 mt-1.5">
                  {data.metrics.under_notice_area_sqft.toLocaleString()} <span className="text-sm font-normal text-slate-500">sq ft</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Expiring in next 90 days</div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                <Filter size={14} /> Demising Legend:
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#0D7B6C]"></span>
                  <span className="text-slate-700">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500"></span>
                  <span className="text-slate-700">Under Notice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-blue-500"></span>
                  <span className="text-slate-700">Fitting Out</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-purple-500"></span>
                  <span className="text-slate-700">Maintenance / Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span>
                  <span className="text-slate-700">Vacant (Leasable)</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Elevation Stacking Stack */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-bold">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{data.building_name}</h3>
                    <p className="text-xs text-slate-500">{data.property_name} • Elevation Stacking Diagram</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 italic">
                  Hover over units for demising specs; click to open contract drawer
                </div>
              </div>

              {/* Stacked Floors from Top to Bottom */}
              <div className="space-y-4">
                {data.floors.map((floor, fIdx) => (
                  <div key={fIdx} className="group relative bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[11px] text-slate-600">
                          {data.floors.length - fIdx}
                        </span>
                        <span>{floor.floor_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>Total: <strong className="text-slate-700">{floor.total_area_sqft.toLocaleString()} sq ft</strong></span>
                        <span>•</span>
                        <span>Occupancy: <strong className={floor.occupancy_pct >= 85 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>{floor.occupancy_pct}%</strong></span>
                      </div>
                    </div>

                    {/* Proportional Stacking Bar */}
                    <div className="overflow-x-auto scrollbar-thin pb-1">
                      <div className="h-14 min-w-[460px] sm:min-w-0 w-full bg-slate-100 rounded-lg flex overflow-hidden p-1 gap-1 border border-slate-200/80 shadow-inner">
                      {floor.units.map((unit, uIdx) => {
                        const widthPct = Math.max((unit.area_sqft / floor.total_area_sqft) * 100, 10);
                        const isFiltered = filterStatus !== "all" && unit.status !== filterStatus;
                        const config = getStatusConfig(unit.status);

                        return (
                          <div
                            key={uIdx}
                            style={{ width: `${widthPct}%` }}
                            onClick={() => setSelectedUnit(unit)}
                            onMouseEnter={() => setHoveredUnit(unit)}
                            onMouseLeave={() => setHoveredUnit(null)}
                            className={`relative h-full rounded cursor-pointer transition-all duration-150 flex flex-col justify-center px-2.5 overflow-hidden ${
                              config.bg
                            } ${config.hoverBg} ${config.text} ${
                              isFiltered ? "opacity-25" : "opacity-100"
                            } ${selectedUnit?.space_id === unit.space_id ? "ring-2 ring-offset-2 ring-[#0D7B6C] z-10" : ""}`}
                          >
                            <div className="flex items-center justify-between font-bold text-[11px] leading-tight truncate">
                              <span className="truncate">{unit.space_code}</span>
                              <span className="text-[10px] opacity-90">{Math.round(unit.area_sqft).toLocaleString()} sf</span>
                            </div>
                            <div className="text-[10px] opacity-95 truncate mt-0.5">
                              {unit.occupant_name || (unit.status === "vacant" ? "Vacant" : config.label)}
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

            {/* Slide-out / Bottom Unit Demising Drawer */}
            {selectedUnit && (
              <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white shadow-2xl z-50 p-6 border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getStatusConfig(selectedUnit.status).lightBg}`}>
                      {getStatusConfig(selectedUnit.status).label}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{selectedUnit.space_code}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="py-5 space-y-6">
                  {/* Space Specification */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spatial Demising</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Unit Name:</span>
                        <span className="font-semibold text-slate-900">{selectedUnit.space_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chargeable Area:</span>
                        <span className="font-bold text-slate-900">{selectedUnit.area_sqft.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Carpet Area:</span>
                        <span className="font-medium text-slate-700">{selectedUnit.carpet_sqft.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Building:</span>
                        <span className="font-medium text-slate-700">{data.building_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupant & Contract Terms */}
                  {selectedUnit.occupant_name ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contractual Commercials</h4>
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Occupant Entity:</span>
                          <span className="font-bold text-slate-900">{selectedUnit.occupant_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Contract Reference:</span>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                            {selectedUnit.contract_code}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Current Base Rent:</span>
                          <span className="font-bold text-slate-900">₹{selectedUnit.rate_psf.toFixed(2)} psf / month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Contracted Run:</span>
                          <span className="font-bold text-[#0D7B6C]">₹{selectedUnit.monthly_rent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Lease Expiry Date:</span>
                          <span className="font-semibold text-slate-900">{selectedUnit.expiry_date || "—"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                      <Info className="mx-auto text-slate-400" size={24} />
                      <p className="text-sm font-semibold text-slate-700">Space is currently vacant</p>
                      <p className="text-xs text-slate-500">Market asking rent for this floorplate is ₹285.00 psf/month.</p>
                      <button className="mt-2 px-3 py-1.5 text-xs font-medium bg-[#0D7B6C] text-white rounded-lg hover:bg-[#09574C]">
                        Generate LOI / New Lease
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-200 flex gap-3">
                    {selectedUnit.contract_id && (
                      <a
                        href={`/operate/contracts?id=${selectedUnit.contract_id}`}
                        className="flex-1 py-2.5 px-4 bg-[#0D7B6C] hover:bg-[#09574C] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FileText size={14} /> Open Lease Contract
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="py-2.5 px-4 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

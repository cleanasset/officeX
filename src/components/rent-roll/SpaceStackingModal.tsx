"use client";

import React, { useState } from "react";
import {
  Building2,
  Layers,
  X,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Maximize2,
  FileSpreadsheet,
  Plus
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface SpaceItem {
  id: string;
  spaceNumber?: string;
  unitNumber: string;
  floorNumber: number;
  buildingName?: string;
  spaceType: string;
  carpetArea: number;
  chargeableArea: number;
  standardRatePsf: number;
  standardCamPsf: number;
  status: string;
  tenantName: string;
  monthlyRent: number;
  expiryDate: string | null;
}

interface SpaceStackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  spaces: SpaceItem[];
  onSelectSpaceForLease?: (space: SpaceItem) => void;
}

export const SpaceStackingModal: React.FC<SpaceStackingModalProps> = ({
  isOpen,
  onClose,
  propertyName,
  spaces,
  onSelectSpaceForLease
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [inspectingSpace, setInspectingSpace] = useState<SpaceItem | null>(null);

  if (!isOpen) return null;

  // Extract unique floors
  const floors = Array.from(new Set(spaces.map((s) => s.floorNumber))).sort((a, b) => b - a);

  // Filter spaces
  const filteredSpaces = spaces.filter((s) => {
    const floorMatch = selectedFloor === "ALL" || s.floorNumber === selectedFloor;
    const isLeased = s.tenantName !== "Vacant";
    const statusMatch =
      selectedStatus === "ALL"
        ? true
        : selectedStatus === "leased"
        ? isLeased
        : !isLeased;
    return floorMatch && statusMatch;
  });

  const totalChargeable = spaces.reduce((sum, s) => sum + s.chargeableArea, 0);
  const occupiedChargeable = spaces
    .filter((s) => s.tenantName !== "Vacant")
    .reduce((sum, s) => sum + s.chargeableArea, 0);
  const occupancyPct = totalChargeable > 0 ? ((occupiedChargeable / totalChargeable) * 100).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-2xl border border-blue-400/30 text-blue-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/20">
                  RR-04 Inventory Stacking
                </span>
                <span className="text-xs text-blue-200 font-medium">{propertyName}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Floor Plate Stacking &amp; Space Inventory
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-300">Total Leasable</span>
                <p className="text-sm font-black text-white">{totalChargeable.toLocaleString()} sqft</p>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Occupancy</span>
                <p className="text-sm font-black text-emerald-400">{occupancyPct}%</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 uppercase text-[10px]">Filter Floor:</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedFloor("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedFloor === "ALL"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                All Floors
              </button>
              {floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFloor === fl
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  F{fl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 uppercase text-[10px]">Status:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedStatus === "ALL" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                All ({spaces.length})
              </button>
              <button
                onClick={() => setSelectedStatus("leased")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedStatus === "leased" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                Leased ({spaces.filter((s) => s.tenantName !== "Vacant").length})
              </button>
              <button
                onClick={() => setSelectedStatus("vacant")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedStatus === "vacant" ? "bg-amber-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                Vacant ({spaces.filter((s) => s.tenantName === "Vacant").length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Stacking View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {floors
            .filter((fl) => selectedFloor === "ALL" || fl === selectedFloor)
            .map((floorNum) => {
              const floorSpaces = filteredSpaces.filter((s) => s.floorNumber === floorNum);
              if (floorSpaces.length === 0) return null;

              const floorArea = floorSpaces.reduce((sum, s) => sum + s.chargeableArea, 0);
              const floorOccupied = floorSpaces
                .filter((s) => s.tenantName !== "Vacant")
                .reduce((sum, s) => sum + s.chargeableArea, 0);
              const floorPct = floorArea > 0 ? ((floorOccupied / floorArea) * 100).toFixed(0) : "0";

              return (
                <div key={floorNum} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Floor Level Header */}
                  <div className="p-3.5 bg-slate-100/70 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs">
                        {floorNum}
                      </span>
                      <h3 className="text-sm font-black text-gray-900">Floor Level {floorNum}</h3>
                      <span className="text-xs text-gray-500 font-medium">({floorArea.toLocaleString()} sqft chargeable)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${floorPct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{floorPct}% Leased</span>
                    </div>
                  </div>

                  {/* Units Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {floorSpaces.map((sp) => {
                      const isLeased = sp.tenantName !== "Vacant";
                      return (
                        <div
                          key={sp.id}
                          onClick={() => setInspectingSpace(sp)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                            isLeased
                              ? "bg-teal-50/20 border-teal-200 hover:border-teal-400"
                              : "bg-amber-50/20 border-amber-200 border-dashed hover:border-amber-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-indigo-700">{sp.unitNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isLeased
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isLeased ? "Committed Leased" : "Vacant Available"}
                            </span>
                          </div>

                          <div className="text-xs font-black text-gray-900 truncate">
                            {isLeased ? sp.tenantName : <span className="text-amber-700 font-bold">Ready to Lease</span>}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                            <div>
                              <span>Chargeable:</span>
                              <p className="font-bold text-gray-900">{sp.chargeableArea.toLocaleString()} sqft</p>
                            </div>
                            <div>
                              <span>{isLeased ? "Monthly Rent:" : "Benchmark PSF:"}</span>
                              <p className="font-bold text-teal-700 font-mono">
                                {isLeased ? formatINR(sp.monthlyRent) : `₹${sp.standardRatePsf} PSF`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Space Detail Drawer / Bottom Sheet when clicked */}
        {inspectingSpace && (
          <div className="p-5 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-bottom duration-150">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900">Unit {inspectingSpace.unitNumber}</span>
                <span className="text-xs text-gray-500">· Floor {inspectingSpace.floorNumber} · {inspectingSpace.spaceType.toUpperCase()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Carpet Area: <strong className="text-gray-900">{inspectingSpace.carpetArea.toLocaleString()} sqft</strong> · 
                Chargeable Area: <strong className="text-gray-900">{inspectingSpace.chargeableArea.toLocaleString()} sqft</strong> · 
                Loading Efficiency: <strong>{((inspectingSpace.carpetArea / inspectingSpace.chargeableArea) * 100).toFixed(1)}%</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setInspectingSpace(null)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close Spec
              </button>
              {inspectingSpace.tenantName === "Vacant" && onSelectSpaceForLease && (
                <button
                  onClick={() => {
                    onSelectSpaceForLease(inspectingSpace);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={13} />
                  <span>Create Lease for Unit</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

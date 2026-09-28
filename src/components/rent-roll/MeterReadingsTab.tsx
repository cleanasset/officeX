"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Droplet,
  Fuel,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface MeterReadingItem {
  id: string;
  propertyId: string;
  propertyName: string;
  spaceId: string;
  unitNumber: string;
  tenantId: string;
  tenantName: string;
  meterType: "electricity_grid" | "electricity_dg" | "water" | "hvac_btu";
  meterNumber: string;
  readingDate: string;
  periodMonth: string;
  previousReading: number;
  currentReading: number;
  multiplier: number;
  consumption: number;
  tariffPerUnit: number;
  totalCharge: number;
  status: "draft" | "approved" | "billed";
}

interface MeterReadingsTabProps {
  properties: Array<{ id: string; name: string }>;
  selectedProperty: string;
}

export const MeterReadingsTab: React.FC<MeterReadingsTabProps> = ({
  properties,
  selectedProperty
}) => {
  const [readings, setReadings] = useState<MeterReadingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // New Reading Form State
  const [formData, setFormData] = useState({
    propertyId: properties[0]?.id || "PROP-APX",
    propertyName: properties[0]?.name || "Apex Business Tower",
    unitNumber: "Unit 401",
    tenantName: "Apex Financial Advisors LLP",
    meterType: "electricity_grid" as const,
    meterNumber: "EB-MUM-401-A",
    periodMonth: "2026-10",
    previousReading: 51450,
    currentReading: 54900,
    multiplier: 1,
    tariffPerUnit: 11.50
  });

  const fetchReadings = async () => {
    setIsLoading(true);
    try {
      const url = `/api/rent-roll/meter-readings?propertyId=${selectedProperty}&meterType=${selectedType}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReadings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [selectedProperty, selectedType]);

  const handleBatchApprove = async () => {
    const unapproved = readings.filter(r => r.status === "draft").map(r => r.id);
    if (unapproved.length === 0) return;
    try {
      const res = await fetch("/api/rent-roll/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch_approve", readingIds: unapproved })
      });
      if (res.ok) {
        setSuccessMsg(`Approved ${unapproved.length} meter readings for billing run`);
        fetchReadings();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rent-roll/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsRecordModalOpen(false);
        setSuccessMsg("Utility meter reading recorded successfully!");
        fetchReadings();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReadings = readings.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.meterNumber.toLowerCase().includes(q) ||
      r.tenantName.toLowerCase().includes(q) ||
      r.unitNumber.toLowerCase().includes(q) ||
      r.propertyName.toLowerCase().includes(q)
    );
  });

  const totalGridPowerKwh = readings
    .filter(r => r.meterType === "electricity_grid")
    .reduce((s, r) => s + r.consumption, 0);

  const totalDgPowerKwh = readings
    .filter(r => r.meterType === "electricity_dg")
    .reduce((s, r) => s + r.consumption, 0);

  const totalUtilityBilled = readings.reduce((s, r) => s + r.totalCharge, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & KPI Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Grid Electricity (HT)</div>
              <div className="text-lg font-black text-gray-900">{totalGridPowerKwh.toLocaleString("en-IN")} kWh</div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100/60 text-amber-800">₹11.50/u</span>
        </div>

        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">DG Backup Captive</div>
              <div className="text-lg font-black text-gray-900">{totalDgPowerKwh.toLocaleString("en-IN")} kWh</div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100/60 text-rose-800">₹32.00/u</span>
        </div>

        <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Metered Billed</div>
              <div className="text-lg font-black text-[#0F8B7D]">{formatINR(totalUtilityBilled)}</div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-100/60 text-teal-800">Active Cycle</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="p-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by meter #, unit, tenant..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D]"
            />
          </div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Utility Types</option>
            <option value="electricity_grid">Grid Power (EB)</option>
            <option value="electricity_dg">DG Backup</option>
            <option value="water">Water Supply</option>
            <option value="hvac_btu">HVAC BTU</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchApprove}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approve All for Billing
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Reading
          </button>
        </div>
      </div>

      {/* Meter Readings Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Meter #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Unit / Space</th>
                <th className="py-3 px-4">Tenant / Occupant</th>
                <th className="py-3 px-4 text-right">Prev Reading</th>
                <th className="py-3 px-4 text-right">Curr Reading</th>
                <th className="py-3 px-4 text-right">Consumption</th>
                <th className="py-3 px-4 text-right">Tariff</th>
                <th className="py-3 px-4 text-right">Total Charge</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">Loading meter readings...</td>
                </tr>
              ) : filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">No utility meter readings recorded for this filter.</td>
                </tr>
              ) : (
                filteredReadings.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{r.meterNumber}</td>
                    <td className="py-3 px-4">
                      {r.meterType === "electricity_grid" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
                          <Zap className="w-3 h-3 text-amber-500" /> Grid Power
                        </span>
                      )}
                      {r.meterType === "electricity_dg" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
                          <Fuel className="w-3 h-3 text-rose-500" /> DG Backup
                        </span>
                      )}
                      {r.meterType === "water" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          <Droplet className="w-3 h-3 text-blue-500" /> Water
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{r.unitNumber}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{r.tenantName}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-500">{r.previousReading.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 font-bold">{r.currentReading.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0F8B7D]">
                      {r.consumption.toLocaleString("en-IN")} {r.meterType === "water" ? "kL" : "kWh"}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 font-mono">₹{r.tariffPerUnit.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900">{formatINR(r.totalCharge)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        r.status === "billed" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Reading Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm">Record Utility Meter Reading</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-700">Commercial Property</label>
                <select
                  value={formData.propertyId}
                  onChange={e => {
                    const p = properties.find(prop => prop.id === e.target.value);
                    setFormData({ ...formData, propertyId: e.target.value, propertyName: p?.name || "" });
                  }}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700">Unit Number</label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Meter Type</label>
                  <select
                    value={formData.meterType}
                    onChange={e => setFormData({ ...formData, meterType: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="electricity_grid">Grid Power (EB)</option>
                    <option value="electricity_dg">DG Captive Backup</option>
                    <option value="water">Water Supply</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700">Tenant / Occupant Name</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700">Previous Reading</label>
                  <input
                    type="number"
                    value={formData.previousReading}
                    onChange={e => setFormData({ ...formData, previousReading: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Current Reading</label>
                  <input
                    type="number"
                    value={formData.currentReading}
                    onChange={e => setFormData({ ...formData, currentReading: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700">Tariff Rate (₹/unit)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tariffPerUnit}
                    onChange={e => setFormData({ ...formData, tariffPerUnit: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Billing Period</label>
                  <input
                    type="text"
                    value={formData.periodMonth}
                    onChange={e => setFormData({ ...formData, periodMonth: e.target.value })}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                <span className="font-bold text-teal-900">Computed Consumption:</span>
                <span className="font-mono font-black text-[#0F8B7D]">
                  {Math.max(0, formData.currentReading - formData.previousReading)} units (≈ {formatINR(Math.max(0, formData.currentReading - formData.previousReading) * formData.tariffPerUnit)})
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Save & Approve Reading"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

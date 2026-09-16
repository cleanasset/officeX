"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Check,
  AlertTriangle,
  RefreshCw,
  Calendar as CalendarIcon,
  CheckCircle,
  Building2,
  Filter,
  Layers,
  Wrench,
  Clock,
  UserCheck,
  FileSpreadsheet,
  X,
  Sparkles,
  ShieldCheck,
  Plus
} from "lucide-react";

interface PPMAsset {
  assetId: string;
  assetName: string;
  category: string;
  location: string;
  assignedVendor: string;
  technician: string;
  frequency: string;
  schedule: Record<string, "done" | "progress" | "sched" | "overdue">;
}

interface PPMStats {
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  scheduledTasks: number;
  onSchedulePct: number;
}

const ALL_52_WEEKS = Array.from({ length: 52 }, (_, i) => `W${String(i + 1).padStart(2, "0")}`);

const QUARTERS: Record<string, { label: string; weeks: string[] }> = {
  "Q3": { label: "Q3 (Current): W27 – W39 (Jul–Sep)", weeks: ALL_52_WEEKS.slice(26, 39) },
  "Q1": { label: "Q1: W01 – W13 (Jan–Mar)", weeks: ALL_52_WEEKS.slice(0, 13) },
  "Q2": { label: "Q2: W14 – W26 (Apr–Jun)", weeks: ALL_52_WEEKS.slice(13, 26) },
  "Q4": { label: "Q4: W40 – W52 (Oct–Dec)", weeks: ALL_52_WEEKS.slice(39, 52) },
  "ALL": { label: "Full 52-Week Annual Grid (W01 – W52)", weeks: ALL_52_WEEKS },
};

export default function PPMCalendarDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q3");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [assets, setAssets] = useState<PPMAsset[]>([]);
  const [stats, setStats] = useState<PPMStats | null>(null);
  const [propertyName, setPropertyName] = useState<string>("Devasya Gold");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // Active slot for detail / status change modal
  const [activeSlot, setActiveSlot] = useState<{
    asset: PPMAsset;
    week: string;
    currentStatus?: "done" | "progress" | "sched" | "overdue";
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPPMData = useCallback(async () => {
    setIsLoading(true);
    try {
      const catParam = selectedCategory !== "All" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`/api/compliance/ppm${catParam}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.schedule || []);
        setStats(data.stats || null);
        if (data.property?.name) {
          setPropertyName(data.property.name);
        }
      }
    } catch (err) {
      console.error("Failed to load PPM schedule:", err);
      showToast("Error loading 52-week PPM schedule.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPPMData();
  }, [fetchPPMData]);

  const activeWeeks = QUARTERS[selectedQuarter]?.weeks || ALL_52_WEEKS.slice(26, 39);

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: "done" | "progress" | "sched" | "overdue") => {
    if (!activeSlot) return;
    try {
      const res = await fetch("/api/compliance/ppm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: activeSlot.asset.assetId,
          week: activeSlot.week,
          status: newStatus
        })
      });
      if (res.ok) {
        showToast(`Updated ${activeSlot.asset.assetName} [${activeSlot.week}] to ${newStatus.toUpperCase()}`);
        setActiveSlot(null);
        fetchPPMData();
      }
    } catch (e) {
      console.error("Failed to update PPM status:", e);
      showToast("Failed to update PPM task status.");
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!assets.length) return;
    const header = ["Asset ID", "Asset Name", "Category", "Location", "Vendor", "Technician", "Frequency", ...ALL_52_WEEKS];
    const rows = assets.map(a => [
      a.assetId,
      `"${a.assetName}"`,
      a.category,
      `"${a.location}"`,
      `"${a.assignedVendor}"`,
      `"${a.technician}"`,
      a.frequency,
      ...ALL_52_WEEKS.map(w => a.schedule[w] || "—")
    ]);

    const csvContent = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OfficeX_52_Week_PPM_Schedule_${propertyName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("52-Week PPM Schedule exported as CSV!");
  };

  const renderCell = (asset: PPMAsset, week: string) => {
    const st = asset.schedule[week];
    if (!st) {
      return (
        <button
          onClick={() => setActiveSlot({ asset, week, currentStatus: undefined })}
          className="w-7 h-7 rounded-lg bg-gray-50/60 hover:bg-gray-100 mx-auto transition-colors cursor-pointer border border-transparent hover:border-gray-300"
          title={`${week}: Not Scheduled (Click to add)`}
        />
      );
    }
    if (st === "done") {
      return (
        <button
          onClick={() => setActiveSlot({ asset, week, currentStatus: "done" })}
          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center mx-auto text-xs font-black shadow-2xs transition-transform hover:scale-110 cursor-pointer"
          title={`${week}: Completed by ${asset.technician}`}
        >
          <Check size={13} strokeWidth={3} />
        </button>
      );
    }
    if (st === "progress") {
      return (
        <button
          onClick={() => setActiveSlot({ asset, week, currentStatus: "progress" })}
          className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center mx-auto text-xs font-bold shadow-2xs transition-transform hover:scale-110 cursor-pointer animate-pulse"
          title={`${week}: In Progress (${asset.technician})`}
        >
          <RefreshCw size={11} className="animate-spin" />
        </button>
      );
    }
    if (st === "overdue") {
      return (
        <button
          onClick={() => setActiveSlot({ asset, week, currentStatus: "overdue" })}
          className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center mx-auto text-xs font-black shadow-2xs transition-transform hover:scale-110 cursor-pointer border border-rose-300"
          title={`${week}: Overdue! Immediate technician dispatch required`}
        >
          !
        </button>
      );
    }
    if (st === "sched") {
      return (
        <button
          onClick={() => setActiveSlot({ asset, week, currentStatus: "sched" })}
          className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto text-[10px] font-bold shadow-2xs transition-transform hover:scale-110 cursor-pointer"
          title={`${week}: Scheduled Routine Maintenance`}
        >
          ●
        </button>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-5 font-sans w-full max-w-full pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-in fade-in duration-200">
          <CheckCircle size={16} className="text-teal-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-[#0F8B7D] shadow-2xs shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                52-Week PPM Preventive Maintenance Schedule
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse"></span>
                FY 2026–27 Live Grid
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Automated preventative planned maintenance matrix linked to {propertyName} critical MEP assets &amp; vendor SLAs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchPPMData}
            disabled={isLoading}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="Refresh Schedule"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-[#0F8B7D]" : ""} />
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export 52-Week CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL ANNUAL TASKS</span>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{stats?.totalTasks || 0}</p>
          <span className="text-[10px] text-gray-500 font-medium">Across 6 Critical Systems</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">COMPLETED (DONE)</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.doneTasks || 0}</p>
          <span className="text-[10px] text-emerald-700 font-bold">● 100% Inspected &amp; Logged</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">IN PROGRESS</span>
          <p className="text-2xl font-black text-blue-600 mt-0.5">{stats?.inProgressTasks || 0}</p>
          <span className="text-[10px] text-blue-700 font-bold">Active Technician on Site</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">OVERDUE INCIDENTS</span>
          <p className="text-2xl font-black text-rose-600 mt-0.5">{stats?.overdueTasks || 0}</p>
          <span className="text-[10px] text-rose-700 font-bold">SLA Escalation Triggered</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs col-span-2 md:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PPM ADHERENCE</span>
            <p className="text-2xl font-black text-[#0F8B7D] mt-0.5">{stats?.onSchedulePct || 100}%</p>
            <span className="text-[10px] text-teal-700 font-bold">On Schedule</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D]">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Control & View Filters Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quarter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timeframe:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-bold transition-colors cursor-pointer"
            >
              <option value="Q3">Q3 (Current): Weeks 27 – 39</option>
              <option value="Q1">Q1: Weeks 01 – 13</option>
              <option value="Q2">Q2: Weeks 14 – 26</option>
              <option value="Q4">Q4: Weeks 40 – 52</option>
              <option value="ALL">Full 52-Week Grid (All Weeks)</option>
            </select>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] font-bold transition-colors cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Electrical">⚡ Electrical &amp; DG</option>
              <option value="HVAC">❄️ HVAC &amp; Chillers</option>
              <option value="Lifts">🛗 Elevators &amp; Lifts</option>
              <option value="Fire Safety">🔥 Fire &amp; Hydrants</option>
              <option value="Plumbing & STP">💧 STP &amp; Plumbing</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 inline-flex items-center justify-center text-[9px]">✓</span> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300 text-blue-800 inline-flex items-center justify-center text-[9px]">↻</span> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 text-amber-800 inline-flex items-center justify-center text-[9px]">●</span> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 text-rose-800 inline-flex items-center justify-center text-[9px]">!</span> Overdue
          </span>
        </div>
      </div>

      {/* ──── INTERACTIVE 52-WEEK SCHEDULE MATRIX GRID ──── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead className="bg-gray-50/95 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5 pl-5 sticky left-0 bg-gray-50 z-10 shadow-r w-72">
                  Asset Equipment &amp; Location
                </th>
                <th className="p-3.5 text-center">Frequency</th>
                <th className="p-3.5">Assigned Technician / Vendor</th>
                {activeWeeks.map((w) => (
                  <th
                    key={w}
                    className={`p-3 text-center min-w-[42px] ${
                      w === "W37" || w === "W38" ? "bg-teal-50/90 text-[#0F8B7D] font-black border-x border-teal-200" : ""
                    }`}
                  >
                    {w}
                    {w === "W37" && <span className="block text-[8px] text-[#0F8B7D] font-black leading-none">NOW</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {assets.map((asset) => (
                <tr key={asset.assetId} className="hover:bg-gray-50/70 transition-colors">
                  {/* Asset Info Sticky Cell */}
                  <td className="p-3.5 pl-5 sticky left-0 bg-white hover:bg-gray-50/70 z-10 shadow-r">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-[#0F8B7D] shrink-0" />
                      <span>{asset.assetName}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-gray-600">{asset.assetId}</span>
                      <span>•</span>
                      <span>{asset.location}</span>
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="p-3.5 text-center font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px]">
                      {asset.frequency}
                    </span>
                  </td>

                  {/* Technician & Vendor */}
                  <td className="p-3.5">
                    <div className="text-gray-900 font-bold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{asset.technician}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">{asset.assignedVendor}</div>
                  </td>

                  {/* Week Matrix Cells */}
                  {activeWeeks.map((w) => (
                    <td
                      key={w}
                      className={`p-2 text-center ${
                        w === "W37" || w === "W38" ? "bg-teal-50/30 border-x border-teal-100" : ""
                      }`}
                    >
                      {renderCell(asset, w)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──── MODAL: PPM TASK DETAIL & ACTION DIALOG ──── */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold">
                  <Wrench size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    PPM TASK SCHEDULE · {activeSlot.week}
                  </span>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">
                    {activeSlot.asset.assetName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Equipment Card */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Demised Premise:</span>
                <span className="font-bold text-gray-900">{propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="font-bold text-gray-900">{activeSlot.asset.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Service Frequency:</span>
                <span className="font-bold text-teal-700">{activeSlot.asset.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Assigned Lead Tech:</span>
                <span className="font-bold text-gray-900">{activeSlot.asset.technician}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">OEM / FM Vendor:</span>
                <span className="font-semibold text-gray-700">{activeSlot.asset.assignedVendor}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                STATUTORY PREVENTATIVE CHECKLIST
              </label>
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-teal-900 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Check size={12} className="text-teal-600" /> Inspect lubrication, filters &amp; pressure tolerances
                </p>
                <p className="flex items-center gap-1.5">
                  <Check size={12} className="text-teal-600" /> Verify safety shutoff, vibration &amp; thermography
                </p>
                <p className="flex items-center gap-1.5">
                  <Check size={12} className="text-teal-600" /> Log technician sign-off in Gujarat Municipal Register
                </p>
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                UPDATE MAINTENANCE STATUS
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus("done")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeSlot.currentStatus === "done"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <Check size={13} strokeWidth={3} /> Mark Done
                </button>

                <button
                  onClick={() => handleUpdateStatus("progress")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeSlot.currentStatus === "progress"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  <RefreshCw size={12} className="animate-spin" /> In Progress
                </button>

                <button
                  onClick={() => handleUpdateStatus("sched")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeSlot.currentStatus === "sched"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  ● Scheduled
                </button>

                <button
                  onClick={() => handleUpdateStatus("overdue")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeSlot.currentStatus === "overdue"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  ! Flag Overdue
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveSlot(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

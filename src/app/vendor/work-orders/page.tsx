"use client";
import React, { useState, useEffect } from "react";
import { Download, CheckCircle, Camera, Check, Loader2, ShieldCheck } from "lucide-react";
import type { WorkOrderItem } from "@/lib/rfq-store";

export default function VendorWorkOrdersTracker() {
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [selectedWoId, setSelectedWoId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({
    "Rahul S. (Lead)": "Present",
    "Amit K.": "Present",
    "Vikas R.": "Absent",
    "Deepak M.": "Present"
  });

  const [ppmChecklist, setPpmChecklist] = useState<Record<string, boolean>>({
    "AHU Filter Cleaning & Pressure Drop": true,
    "Chiller Parameter Log Readings": true,
    "UPS Battery Cell Voltage Check": false,
    "DG Set Oil & Coolant Level Verification": false,
    "LT Panel Infrared Thermography Check": false
  });

  const [issueSeverity, setIssueSeverity] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadWorkOrders() {
      try {
        const res = await fetch("/api/work-orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.workOrders) && data.workOrders.length > 0) {
          setWorkOrders(data.workOrders);
          setSelectedWoId(data.workOrders[0].id);
        }
      } catch (err) {
        console.error("Failed to load work orders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkOrders();
  }, []);

  const activeWo = workOrders.find((w) => w.id === selectedWoId) || workOrders[0];

  const handleSubmitLog = () => {
    showToast(`Daily site log & PPM checklist submitted for ${activeWo?.id || "Work Order"}! Verified in Audit Trail.`);
    setIssueSeverity("");
    setIssueDesc("");
  };

  const handleExportReport = () => {
    const csvContent = [
      "Work Order ID,Client,Property,Start Date,Progress,Status,Contract Value,Escrow Status",
      ...workOrders.map(
        (w) =>
          `"${w.id}","${w.client}","${w.property}","${w.startDate}","${w.progress}","${w.status}","${w.contractValue}","${w.escrowStatus}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OfficeX_Work_Orders_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Official Work Orders Report (.CSV)");
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#0F8B7D]" />
        <p className="text-xs font-bold text-gray-500">Loading active commercial work orders...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Active Work Orders &amp; Site Logs</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live service contracts, log daily attendance, complete PPM checklists, and monitor Escrow releases.
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer w-fit"
        >
          <Download size={13} /> Export Report (.CSV)
        </button>
      </div>

      {/* Primary Selected Card with Dual-Pane Journey & Logger */}
      {activeWo && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden w-full shadow-2xs">
          {/* Table Header Row & Summary with Mobile Scroll */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider p-4 md:p-6 pb-3 border-b border-gray-100 bg-gray-50/50">
                <div>WO ID</div>
                <div>CLIENT</div>
                <div>PROPERTY</div>
                <div>START DATE</div>
                <div>PROGRESS</div>
                <div className="text-right">STATUS</div>
              </div>

              {/* Selected Order Summary Row */}
              <div className="grid grid-cols-6 items-center p-4 md:p-6 border-l-4 border-l-[#0F8B7D] bg-teal-50/15 text-xs">
                <div className="font-bold text-[#0F8B7D]">{activeWo.id}</div>
                <div className="font-semibold text-gray-900">{activeWo.client}</div>
                <div className="text-gray-600">{activeWo.property}</div>
                <div className="text-gray-600">{activeWo.startDate}</div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {activeWo.progress} <b className="text-[#0F8B7D]">{activeWo.pct}%</b>
                  </span>
                  <div className="w-24 h-1.5 rounded-full bg-gray-200 mt-1 overflow-hidden">
                    <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: `${activeWo.pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${activeWo.statusClass}`}>
                    {activeWo.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nested Deep Dive: Journey + Daily Logger */}
          <div className="p-4 md:p-6 pt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 border-t border-gray-100">
            {/* Left Column: Contract Values + Service Journey */}
            <div className="flex flex-col justify-between pr-0 lg:pr-4">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contract Value</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{activeWo.contractValue}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Escrow-backed</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Escrow Settlement</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <ShieldCheck size={14} /> {activeWo.escrowStatus}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{activeWo.milestoneRule}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">SLA Commitments</p>
                    <p className="text-xs font-bold text-gray-800 mt-1">
                      <span className="text-[#0F8B7D]">2h</span> Response • <span className="text-[#0F8B7D]">8h</span> Resolution
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">99.2% Uptime Guarantee</p>
                  </div>
                </div>

                {activeWo.title && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contract Title &amp; Scope</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{activeWo.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Lead Technician: <span className="font-semibold text-gray-700">{activeWo.leadTechnician || "Suresh P."}</span> • Manpower Assigned: {activeWo.manpowerCount || 4} Technicians
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Service Lifecycle Journey</h3>
                <div className="relative flex items-center justify-between px-4 pb-8">
                  {/* Timeline Bar */}
                  <div className="absolute left-8 right-8 top-3.5 h-0.5 bg-gray-200 z-0">
                    <div
                      className="h-full bg-[#0F8B7D]"
                      style={{
                        width:
                          activeWo.status === "Closed"
                            ? "100%"
                            : activeWo.status === "Active"
                            ? "65%"
                            : activeWo.status === "Mobilising"
                            ? "33%"
                            : "10%"
                      }}
                    />
                  </div>

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-xs font-bold">
                      <Check size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 mt-2">WO Issued</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-xs font-bold">
                      <Check size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 mt-2">Mobilisation</span>
                  </div>

                  {/* Step 3 Active */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0F8B7D] text-[#0F8B7D] flex items-center justify-center text-xs font-black">
                      ◉
                    </div>
                    <span className="text-[11px] font-black text-[#0F8B7D] mt-2 text-center">
                      Monthly Service<br />
                      <span className="text-[9px] font-semibold">({activeWo.status})</span>
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        activeWo.status === "Closed"
                          ? "bg-[#0F8B7D] text-white"
                          : "bg-gray-100 border border-gray-200 text-gray-400"
                      }`}
                    >
                      {activeWo.status === "Closed" ? <Check size={14} /> : "4"}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400 mt-2">Completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Daily Site Logger */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  📋 Daily Site Logger
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Attendance */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Technician Attendance
              </p>
              <div className="space-y-2 mb-5">
                {Object.entries(attendance).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setAttendance({ ...attendance, [name]: "Present" })}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                          status === "Present"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-white text-gray-400 border border-gray-200"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setAttendance({ ...attendance, [name]: "Absent" })}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                          status === "Absent"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-white text-gray-400 border border-gray-200"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PPM Checklist */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Daily PPM Checklist
                </p>
                <div className="space-y-2 mb-5">
                  {Object.entries(ppmChecklist).map(([task, done]) => (
                    <label key={task} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => setPpmChecklist({ ...ppmChecklist, [task]: !done })}
                        className="w-4 h-4 rounded border-gray-300 accent-[#0F8B7D]"
                      />
                      <span className={done ? "font-semibold text-gray-900" : "text-gray-600"}>{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Log Issue */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Log Site Anomaly (Optional)
                </p>
                <select
                  value={issueSeverity}
                  onChange={(e) => setIssueSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs mb-2 bg-white text-gray-700"
                >
                  <option value="">Select Severity</option>
                  <option>Low — Cosmetic / Routine</option>
                  <option>Medium — Preventive Maintenance Needed</option>
                  <option>High / Critical — Immediate SLA Breach Risk</option>
                </select>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe observation, part serial numbers, or breakdown notes..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs resize-none h-14 mb-3 bg-white focus:outline-none focus:border-[#0F8B7D]"
                />
                <div
                  onClick={() => showToast("Photo upload simulated. Attachment added to log.")}
                  className="border border-dashed border-gray-300 rounded-xl p-2.5 text-center mb-4 cursor-pointer bg-white hover:border-[#0F8B7D] transition-colors"
                >
                  <Camera size={16} className="mx-auto text-gray-400 mb-0.5" />
                  <span className="text-[10px] text-gray-500 font-semibold">Click to attach photo evidence</span>
                </div>
              </div>

              <button
                onClick={handleSubmitLog}
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Submit Daily Log to Escrow Audit
              </button>
            </div>
          </div>

          {/* All Work Orders Table */}
          <div className="border-t border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                All Active &amp; Historical Work Orders ({workOrders.length})
              </span>
              <span className="text-[11px] text-gray-400">Click any row to switch active view</span>
            </div>

            {workOrders.map((wo) => {
              const isSelected = wo.id === activeWo.id;
              return (
                <div
                  key={wo.id}
                  onClick={() => setSelectedWoId(wo.id)}
                  className={`grid grid-cols-6 items-center p-5 border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                    isSelected ? "bg-teal-50/30" : ""
                  }`}
                >
                  <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#0F8B7D]" />}
                    <span>{wo.id}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-xs truncate pr-2">{wo.client}</div>
                  <div className="text-gray-600 text-xs truncate pr-2">{wo.property}</div>
                  <div className="text-gray-600 text-xs">{wo.startDate}</div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold">{wo.progress}</span>
                    <div className="w-24 h-1.5 rounded-full bg-gray-200 mt-1 overflow-hidden">
                      <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: `${wo.pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${wo.statusClass}`}>
                      {wo.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

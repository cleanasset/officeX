"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Droplets,
  Wind,
  Gauge,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Plus,
  RefreshCw,
  FileText,
  Search,
  Check,
  X
} from "lucide-react";

interface FMTask {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  title: string;
  dueDate: string;
  isOverdue?: boolean;
  facility: string;
  actionText: string;
  isDone?: boolean;
}

export default function FacilityManagerDashboardPage() {
  const [meterModalOpen, setMeterModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [fmTasks, setFmTasks] = useState<FMTask[]>([
    {
      id: "FM-01",
      type: "meter_readings",
      severity: "high",
      title: "Meter readings due — 12 sub-meters pending monthly logging",
      dueDate: "30-Sep-2026",
      isOverdue: true,
      facility: "Meridian Tech Park · Sub-station 2",
      actionText: "Enter Meter Readings",
    },
    {
      id: "FM-02",
      type: "cam_reconciliation",
      severity: "high",
      title: "CAM pool reconciliation due — FY26 Q2 true-up calculation",
      dueDate: "05-Oct-2026",
      isOverdue: false,
      facility: "Apex Business Tower · Pool A",
      actionText: "Review CAM Pool",
    },
    {
      id: "FM-03",
      type: "dispute",
      severity: "medium",
      title: "Service charge dispute — HVAC overtime billing query from Floor 4",
      dueDate: "03-Oct-2026",
      isOverdue: false,
      facility: "Meridian Tech Park · Floor 4 (Brightpath)",
      actionText: "Investigate Query",
    },
    {
      id: "FM-04",
      type: "doc_expiry",
      severity: "high",
      title: "Statutory compliance expiry — DG Set emission certificate expires",
      dueDate: "12-Oct-2026",
      isOverdue: false,
      facility: "Nexus Hub · Central Utility Plant",
      actionText: "Upload Certificate",
    },
    {
      id: "FM-05",
      type: "water_test",
      severity: "low",
      title: "Quarterly STP water quality test report submission",
      dueDate: "15-Oct-2026",
      isOverdue: false,
      facility: "Apex Business Tower · STP Unit",
      actionText: "Submit Report",
    },
  ]);

  const [meterInputs, setMeterInputs] = useState([
    { id: "MTR-E01", name: "Floor 4 Power (HVAC)", prev: 14280, current: "", unit: "kWh" },
    { id: "MTR-E02", name: "Floor 6 Power (Light)", prev: 8940, current: "", unit: "kWh" },
    { id: "MTR-W01", name: "Tower Water Supply", prev: 2340, current: "", unit: "kL" },
    { id: "MTR-B01", name: "Chiller BTU Primary", prev: 45100, current: "", unit: "TR-h" },
  ]);

  const handleTaskDone = (id: string) => {
    setFmTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t))
    );
  };

  const handleSaveMeters = (e: React.FormEvent) => {
    e.preventDefault();
    setMeterModalOpen(false);
    setSuccessMsg("12 Meter readings saved & synchronized for billing run.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header (§S-03 FM Variant) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
              §S-03 Facility Manager Spec
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Operations & Technical Services Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Facility Manager Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Action queue limited to meter readings, CAM pools, service charge disputes, and technical statutory documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setMeterModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-sm shadow-[#0F8B7D]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gauge size={14} />
            <span>Enter Meter Readings</span>
          </button>
          <Link
            href="/properties/rent-roll?tab=cam-pools"
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>CAM Pools & True-Up (§5.11)</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RBAC Security Isolation Banner (§5.14 / §S-03 Rule) */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>FM Scope Guard Active</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                §5.14 Compliant
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Commercial lease terms, base rents, and financial deposit amounts are masked in FM view. Read/write access is restricted exclusively to service charges, CAM cost pools, and utility meters.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unread Meters</span>
            <Gauge size={16} className="text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">12 Meters</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Due for Sep billing run</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active CAM Pools</span>
            <Layers size={16} className="text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">3 Pools</div>
          <div className="text-[11px] text-slate-400 mt-0.5">₹18.4 L monthly budget</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Service Disputes</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">1 Open</div>
          <div className="text-[11px] text-slate-400 mt-0.5">HVAC Overtime billing</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">FM Compliance</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">98.2%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">AMC & Fire NOC active</div>
        </div>
      </div>

      {/* FM Action Queue (§S-03 FM Variant Core) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap size={16} className="text-cyan-600" />
              <span>FM Technical Task Queue</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Filtered exclusively to utility meter logs, CAM cost allocations, and statutory plant certificates.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {fmTasks.filter((t) => !t.isDone).length} Tasks Remaining
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th className="py-2.5 px-3 font-semibold">Technical Task</th>
                <th className="py-2.5 px-3 font-semibold">Due Date</th>
                <th className="py-2.5 px-3 font-semibold">Facility / Location</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fmTasks.map((task) => (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    task.isDone ? "opacity-40 bg-slate-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    {task.severity === "high" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        HIGH
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        MED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className={`font-bold text-slate-900 ${task.isDone ? "line-through" : ""}`}>
                      {task.title}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{task.id}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold ${
                        task.isOverdue ? "text-rose-600 font-bold" : "text-slate-600"
                      }`}
                    >
                      {task.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{task.facility}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          if (task.type === "meter_readings") setMeterModalOpen(true);
                          else handleTaskDone(task.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-[11px] font-bold transition-colors"
                      >
                        {task.actionText}
                      </button>
                      <button
                        onClick={() => handleTaskDone(task.id)}
                        className={`p-1 rounded-lg border transition-colors ${
                          task.isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300"
                        }`}
                        title="Mark Complete"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAM Pool Allocation & Expense Tracking Summary (§5.11) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              CAM Cost Pools & Expense Tracking (§5.11 / Table 4.8)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Service charges cost allocation bases (Chargeable Area vs Seat Proportion).
            </p>
          </div>
          <Link
            href="/properties/rent-roll?tab=cam-pools"
            className="text-xs font-bold text-[#0F8B7D] hover:underline"
          >
            CAM Pool Configuration →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-900">Pool A: Apex Tower Common MEP</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Basis: Chargeable Area · 1,42,800 sq ft</div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Monthly Budget:</span>
              <span className="font-mono font-bold text-slate-900">₹8,10,000</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Actual YTD Expense:</span>
              <span className="font-mono font-bold text-emerald-700">₹7,85,000</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-900">Pool B: Meridian Tech Park Security & Housekeeping</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Basis: Chargeable Area · 1,85,000 sq ft</div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Monthly Budget:</span>
              <span className="font-mono font-bold text-slate-900">₹6,20,000</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Actual YTD Expense:</span>
              <span className="font-mono font-bold text-emerald-700">₹6,05,000</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-900">Pool C: Meridian Floor 4 Flex Utilities</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Basis: Seat Count · 342 Desks</div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Monthly Budget:</span>
              <span className="font-mono font-bold text-slate-900">₹4,10,000</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Actual YTD Expense:</span>
              <span className="font-mono font-bold text-amber-700">₹4,22,000 (+3%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enter Meter Readings Modal */}
      {meterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Gauge size={20} className="text-cyan-600" />
                <span>Log Bulk Sub-Meter Readings (§5.11)</span>
              </h3>
              <button
                onClick={() => setMeterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter the current cycle meter readings for electricity, water, and HVAC BTU meters to calculate utility consumption.
            </p>

            <form onSubmit={handleSaveMeters} className="space-y-3.5 text-xs">
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {meterInputs.map((m, idx) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {m.id} · Prev: {m.prev.toLocaleString()} {m.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        required
                        placeholder={`${m.prev + 120}`}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600"
                      />
                      <span className="text-[11px] font-bold text-slate-500">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setMeterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-bold"
                >
                  Save & Synchronize Readings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

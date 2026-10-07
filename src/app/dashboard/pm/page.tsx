"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileText,
  Building2,
  Zap,
  MoreVertical,
  Check,
  RefreshCw,
  Search,
  Bell,
  ExternalLink
} from "lucide-react";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";

interface TaskItem {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  title: string;
  dueDate: string;
  isOverdue?: boolean;
  record: string;
  property: string;
  actionText: string;
  actionUrl?: string;
  isCompleted?: boolean;
}

export default function PropertyManagerDashboardPage() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "TSK-01",
      type: "contract_approval",
      severity: "high",
      title: "Contract pending approval — Anita submitted APX-L-0057",
      dueDate: "Today",
      isOverdue: false,
      record: "APX-L-0057 · Global Logistics",
      property: "Apex Business Tower",
      actionText: "Review Contract",
      actionUrl: "/approvals",
    },
    {
      id: "TSK-02",
      type: "escalation_due",
      severity: "high",
      title: "Escalation due — Apply 15% rent step to Innovate Corp",
      dueDate: "01-Nov-2026",
      isOverdue: false,
      record: "MTP-T1-03 · Innovate Corp",
      property: "Meridian Tech Park",
      actionText: "Apply Step (+15%)",
      actionUrl: "/properties/rent-roll?tab=escalations",
    },
    {
      id: "TSK-03",
      type: "deposit_collect",
      severity: "high",
      title: "Deposit shortfall — Collect ₹12,00,000 security deposit",
      dueDate: "Overdue (3d)",
      isOverdue: true,
      record: "NXH-G01 · FreshMart Retail",
      property: "Nexus Corporate Hub",
      actionText: "Record Deposit",
      actionUrl: "/properties/rent-roll?tab=collections",
    },
    {
      id: "TSK-04",
      type: "document_expiry",
      severity: "medium",
      title: "Document expiry warning (< 30 days) — Fire NOC expires 15-Oct",
      dueDate: "15-Oct-2026",
      isOverdue: false,
      record: "APX-BLD · Apex Tower MEP",
      property: "Apex Business Tower",
      actionText: "Upload Renewal",
      actionUrl: "/properties/compliance",
    },
    {
      id: "TSK-05",
      type: "overdue_payment",
      severity: "high",
      title: "Overdue payment (> 7 days) — ₹2,84,320 unpaid invoice",
      dueDate: "Overdue (9d)",
      isOverdue: true,
      record: "INV-MTP-0311 · NextGen Retail",
      property: "Meridian Tech Park",
      actionText: "Send Reminder",
      actionUrl: "/dashboard/finance",
    },
    {
      id: "TSK-06",
      type: "holding_over",
      severity: "high",
      title: "Holding over — Tenant lease expired with no exit recorded",
      dueDate: "Immediate",
      isOverdue: true,
      record: "MTP-T1-04 · Alpha Ventures",
      property: "Meridian Tech Park",
      actionText: "Record Exit / Renew",
      actionUrl: "/properties/rent-roll?view=current",
    },
    {
      id: "TSK-07",
      type: "seat_count",
      severity: "medium",
      title: "Seat count not submitted for Oct billing cycle",
      dueDate: "25-Sep-2026",
      isOverdue: true,
      record: "FLX-4F · Brightpath Coworking",
      property: "Meridian Tech Park",
      actionText: "Enter Seat Count",
      actionUrl: "/properties/rent-roll?tab=flex-centre",
    },
  ]);

  const handleTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleSnooze = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dueDate: "Snoozed (+2d)" } : t
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedProperty !== "all" && !t.property.toLowerCase().includes(selectedProperty.toLowerCase())) {
      return false;
    }
    if (filterSeverity !== "all" && t.severity !== filterSeverity) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header (§S-03) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              §S-03 Today Queue
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tuesday, 29-Sep-2026
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Property Manager "Today" Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Action queue of operational tasks, contract workflows, escalations, and overdue items across assigned centers.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setWizardOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-sm shadow-[#0F8B7D]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Create Contract (§S-21)</span>
          </button>
          <Link
            href="/properties/rent-roll?tab=collections"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Receipt size={14} />
            <span>Record Payment</span>
          </Link>
          <Link
            href="/dashboard/finance"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle size={14} />
            <span>Raise Dispute</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters Strip (§S-03 Wireframe) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="text-[11px] font-bold text-rose-800">Overdue Actions</div>
          <div className="text-2xl font-black text-rose-900 mt-1">4</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Requires immediate attention</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="text-[11px] font-bold text-amber-800">Due This Week</div>
          <div className="text-2xl font-black text-amber-900 mt-1">9</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Escalations & notices</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="text-[11px] font-bold text-blue-800">Pending Approvals</div>
          <div className="text-2xl font-black text-blue-900 mt-1">2</div>
          <div className="text-[10px] text-blue-700 mt-0.5">Submitted by PM to checker</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-800">Occupancy</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">72.0%</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">My assigned portfolio</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
          <div className="text-[11px] font-bold text-purple-800">Open Disputes</div>
          <div className="text-2xl font-black text-purple-900 mt-1">1</div>
          <div className="text-[10px] text-purple-700 mt-0.5">Under investigation</div>
        </div>
      </div>

      {/* Action Queue (§S-03 Core Component) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-[#0F8B7D]" />
              <span>Today Action Queue (Sorted by Severity & Due Date)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review and act on pending contract workflows, rent increases, deposit collections, and alerts.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">All My Properties (3)</option>
              <option value="apex">Apex Business Tower</option>
              <option value="meridian">Meridian Tech Park</option>
              <option value="nexus">Nexus Corporate Hub</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity Only</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Task & Condition</th>
                <th className="py-2.5 px-3 font-semibold">Due Date</th>
                <th className="py-2.5 px-3 font-semibold">Record / Tenant</th>
                <th className="py-2.5 px-3 font-semibold">Property</th>
                <th className="py-2.5 px-3 font-semibold text-right">Row Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    t.isCompleted ? "opacity-40 bg-slate-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    {t.severity === "high" ? (
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
                    <div
                      className={`font-bold text-slate-900 ${
                        t.isCompleted ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {t.title}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {t.id}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold ${
                        t.isOverdue
                          ? "text-rose-600 font-bold"
                          : t.dueDate === "Today"
                          ? "text-amber-600 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      {t.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {t.record}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {t.property}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Action Button */}
                      {t.actionUrl ? (
                        <Link
                          href={t.actionUrl}
                          className="px-2.5 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-[11px] font-bold transition-colors"
                        >
                          {t.actionText}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleTaskDone(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                        >
                          {t.actionText}
                        </button>
                      )}

                      {/* Snooze */}
                      <button
                        onClick={() => handleSnooze(t.id)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors"
                        title="Snooze 2 days"
                      >
                        Snooze
                      </button>

                      {/* Done */}
                      <button
                        onClick={() => handleTaskDone(t.id)}
                        className={`p-1 rounded-lg border transition-colors ${
                          t.isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300"
                        }`}
                        title="Mark Done"
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

      {/* My Properties Occupancy Summary (§S-03 Bottom Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Assigned Properties Overview
          </h3>
          <span className="text-xs text-slate-500">3 Center Portfolios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Center / Property</th>
                <th className="py-2.5 px-3 font-semibold">Occupancy</th>
                <th className="py-2.5 px-3 font-semibold">Vacant Space</th>
                <th className="py-2.5 px-3 font-semibold">Expiring in 90d</th>
                <th className="py-2.5 px-3 font-semibold">Open Exceptions</th>
                <th className="py-2.5 px-3 font-semibold text-right">Navigate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-3 font-bold text-slate-900">Meridian Tech Park</td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-700">75.0%</td>
                <td className="py-3 px-3 text-slate-600">18,500 sq ft</td>
                <td className="py-3 px-3 font-bold text-amber-600">1 Contract</td>
                <td className="py-3 px-3 font-bold text-rose-600">4 Exceptions</td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href="/properties/rent-roll?property_id=MTP-GGN"
                    className="text-[#0F8B7D] font-bold hover:underline"
                  >
                    Open Center →
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-3 font-bold text-slate-900">Apex Business Tower</td>
                <td className="py-3 px-3 font-mono font-bold text-amber-700">46.0%</td>
                <td className="py-3 px-3 text-slate-600">42,000 sq ft</td>
                <td className="py-3 px-3 font-bold text-slate-600">0 Contracts</td>
                <td className="py-3 px-3 font-bold text-slate-600">2 Exceptions</td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href="/properties/rent-roll?property_id=APX-BKC"
                    className="text-[#0F8B7D] font-bold hover:underline"
                  >
                    Open Center →
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-3 font-bold text-slate-900">Nexus Corporate Hub</td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-700">83.5%</td>
                <td className="py-3 px-3 text-slate-600">11,200 sq ft</td>
                <td className="py-3 px-3 font-bold text-slate-600">0 Contracts</td>
                <td className="py-3 px-3 font-bold text-slate-600">1 Exception</td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href="/properties/rent-roll?property_id=NXH-BLR"
                    className="text-[#0F8B7D] font-bold hover:underline"
                  >
                    Open Center →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Wizard Modal (§S-21) */}
      <ContractWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          setWizardOpen(false);
        }}
      />
    </div>
  );
}

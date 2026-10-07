"use client";

import React, { useState, useEffect } from "react";
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
  ExternalLink,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  FileCheck,
  Send,
  X
} from "lucide-react";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";

type TaskCategory =
  | "contract_approval"
  | "escalation_due"
  | "deposit_collection"
  | "document_expiry"
  | "overdue_payment";

interface TaskItem {
  id: string;
  category: TaskCategory;
  categoryLabel: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  info: string;
  property: string;
  occupantSpace: string;
  dueDate: string;
  dueStatus: "overdue" | "today" | "future";
  financialDetail?: string;
  actions: {
    primaryText: string;
    secondaryText: string;
    tertiaryText?: string;
  };
  isCompleted?: boolean;
}

export default function PropertyManagerDashboardPage() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Task Queue according to exact 5 types from spec S-03
  const [tasks, setTasks] = useState<TaskItem[]>([
    // 1. Contracts Pending Approval (HIGH)
    {
      id: "TSK-01",
      category: "contract_approval",
      categoryLabel: "1. Contracts Pending Approval",
      priority: "HIGH",
      title: "Approve Contract: Global Logistics Warehousing",
      info: "Submitted by: Anita Desai (Leasing) on Oct 5",
      property: "Apex Business Tower",
      occupantSpace: "Global Logistics · Suite 401 East",
      dueDate: "Approval pending (7 days old)",
      dueStatus: "overdue",
      financialDetail: "Monthly Rent: ₹34,80,000",
      actions: {
        primaryText: "Approve",
        secondaryText: "Reject",
        tertiaryText: "View Details",
      },
    },
    // 2. Escalations Due (HIGH)
    {
      id: "TSK-02",
      category: "escalation_due",
      categoryLabel: "2. Escalations Due (Apply Rent Increase)",
      priority: "HIGH",
      title: "Apply Escalation: TechNova Financial Systems",
      info: "Rent increase 5% effective Oct 1 (Compounded)",
      property: "Meridian Tech Park",
      occupantSpace: "TechNova Financial · Floor 3 Full",
      dueDate: "Due Today (01-Oct)",
      dueStatus: "today",
      financialDetail: "Current: ₹18.62L → New: ₹19.55L",
      actions: {
        primaryText: "Apply",
        secondaryText: "Postpone",
        tertiaryText: "View Timeline",
      },
    },
    // 3. Deposits to Collect (MEDIUM)
    {
      id: "TSK-03",
      category: "deposit_collection",
      categoryLabel: "3. Deposits to Collect",
      priority: "MEDIUM",
      title: "Collect Deposit: Innovate Technologies Ltd",
      info: "Property: Apex Business Tower | Occupant: Innovate Tech | Security Deposit: ₹50,000",
      property: "Apex Business Tower",
      occupantSpace: "Innovate Tech · Suite 401",
      dueDate: "Oct 10 (3 days left)",
      dueStatus: "future",
      financialDetail: "Amount Due: ₹50,000",
      actions: {
        primaryText: "Record Collection",
        secondaryText: "Send Reminder",
        tertiaryText: "Waive",
      },
    },
    // 4. Document Expiry Warnings (LOW)
    {
      id: "TSK-04",
      category: "document_expiry",
      categoryLabel: "4. Document Expiry Warnings (<30 days)",
      priority: "LOW",
      title: "Document Expiring: Fire Safety & Occupancy Certificate",
      info: "Property: Meridian Tech Park | Expires: Oct 25 (18 days remaining)",
      property: "Meridian Tech Park",
      occupantSpace: "Center Compliance Document",
      dueDate: "Oct 25 (18 days)",
      dueStatus: "future",
      financialDetail: "Statutory Compliance",
      actions: {
        primaryText: "Mark Done",
        secondaryText: "Extend",
        tertiaryText: "View Document",
      },
    },
    // 5. Overdue Payments (>7 days) (HIGH)
    {
      id: "TSK-05",
      category: "overdue_payment",
      categoryLabel: "5. Overdue Payments (>7 days)",
      priority: "HIGH",
      title: "Overdue Payment: Heritage Crafts Ltd",
      info: "Invoice #INV-26-27-0034 | Amount: ₹4,10,000 | Due: Sep 28 (9 days overdue)",
      property: "Apex Business Tower",
      occupantSpace: "Heritage Crafts · Suite 201",
      dueDate: "Sep 28 (9 days overdue)",
      dueStatus: "overdue",
      financialDetail: "Overdue Balance: ₹4,10,000",
      actions: {
        primaryText: "Record Payment",
        secondaryText: "Send Reminder",
        tertiaryText: "Raise Dispute",
      },
    },
  ]);

  const handleTaskAction = (taskId: string, actionType: "primary" | "secondary" | "tertiary") => {
    const t = tasks.find((item) => item.id === taskId);
    if (!t) return;

    if (actionType === "primary") {
      if (t.category === "contract_approval") {
        window.location.href = "/approvals";
        return;
      }
      if (t.category === "escalation_due") {
        setTasks((prev) => prev.map((item) => (item.id === taskId ? { ...item, isCompleted: true } : item)));
        showFeedback(`Escalation applied for ${t.title}. Contract rent stepped.`);
        return;
      }
      if (t.category === "deposit_collection" || t.category === "overdue_payment") {
        window.location.href = "/properties/rent-roll?tab=collections";
        return;
      }
      if (t.category === "document_expiry") {
        setTasks((prev) => prev.map((item) => (item.id === taskId ? { ...item, isCompleted: true } : item)));
        showFeedback(`Document compliance verified and renewed.`);
        return;
      }
    }

    if (actionType === "secondary") {
      if (t.actions.secondaryText === "Send Reminder") {
        setReminderTarget(t.occupantSpace);
        setReminderModalOpen(true);
        return;
      }
      if (t.actions.secondaryText === "Reject") {
        window.location.href = "/approvals";
        return;
      }
      if (t.actions.secondaryText === "Postpone") {
        showFeedback(`Escalation postponed by 14 days.`);
        return;
      }
    }

    if (actionType === "tertiary") {
      if (t.actions.tertiaryText === "View Details" || t.actions.tertiaryText === "View Timeline") {
        window.location.href = "/properties/rent-roll";
        return;
      }
    }
  };

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(""), 4500);
  };

  // KPIs
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const urgentCount = activeTasks.filter((t) => t.dueStatus === "overdue").length;
  const todayCount = activeTasks.filter((t) => t.dueStatus === "today").length;
  const upcomingCount = activeTasks.filter((t) => t.dueStatus === "future").length;

  const filteredTasks = activeTasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (selectedProperty !== "all" && !t.property.toLowerCase().includes(selectedProperty.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header (§S-03) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
              §S-03 Today Queue
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Property Manager Operational Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Today's Tasks for {todayStr}
          </h1>
          <p className="text-xs text-slate-500">
            Severity-sorted execution queue: contract approvals, escalations, security deposits, compliance expiries, and payment arrears.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Property:</span>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Managed Centres</option>
              <option value="apex">Apex Business Tower</option>
              <option value="meridian">Meridian Tech Park</option>
              <option value="cyber">Cyber Tech City</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority Only</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage("")} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPIs at Top (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tasks</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeTasks.length}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Pending PM action</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Urgent (Overdue)</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{urgentCount}</p>
          <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">Requires immediate resolution</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Due Today</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{todayCount}</p>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">Scheduled for today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Upcoming (Future)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{upcomingCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Next 7–30 days</span>
        </div>
      </div>

      {/* Task Queue Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Prioritized Action Queue</h2>
            <p className="text-xs text-slate-500">Sorted by Severity (High → Low) and Due Date</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredTasks.length} tasks
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTasks.map((t) => {
            const isRed = t.dueStatus === "overdue";
            const isYellow = t.dueStatus === "today";
            const isGreen = t.dueStatus === "future";

            const priorityBadge =
              t.priority === "HIGH"
                ? "bg-rose-100 text-rose-800 border-rose-200"
                : t.priority === "MEDIUM"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <div
                key={t.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                  isRed ? "border-l-4 border-l-rose-500" : isYellow ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
                }`}
              >
                {/* Left Side: Icon, Type, Title, Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isRed ? "bg-rose-100 text-rose-600" : isYellow ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {t.category === "contract_approval" && <ShieldCheck className="w-5 h-5" />}
                    {t.category === "escalation_due" && <TrendingUp className="w-5 h-5" />}
                    {t.category === "deposit_collection" && <DollarSign className="w-5 h-5" />}
                    {t.category === "document_expiry" && <FileCheck className="w-5 h-5" />}
                    {t.category === "overdue_payment" && <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t.categoryLabel}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${priorityBadge}`}>
                        {t.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-600">{t.info}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="font-semibold text-slate-700">{t.property}</span>
                      <span>•</span>
                      <span>{t.occupantSpace}</span>
                      {t.financialDetail && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-blue-700">{t.financialDetail}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Due Date Badge & Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start md:self-center shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      isRed
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : isYellow
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {t.dueDate}
                  </span>

                  <button
                    onClick={() => handleTaskAction(t.id, "primary")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    {t.actions.primaryText}
                  </button>

                  <button
                    onClick={() => handleTaskAction(t.id, "secondary")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    {t.actions.secondaryText}
                  </button>

                  {t.actions.tertiaryText && (
                    <button
                      onClick={() => handleTaskAction(t.id, "tertiary")}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium transition"
                    >
                      {t.actions.tertiaryText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Quick Actions Bar at Bottom (§S-03 Spec) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">PM Quick Actions:</span>
            <span className="text-xs text-slate-500">Direct shortcuts for operational workflows</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setWizardOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create Contract (§S-21)
            </button>

            <Link
              href="/properties/rent-roll?tab=collections"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Record Payment
            </Link>

            <button
              onClick={() => {
                setReminderTarget("All Overdue Occupants");
                setReminderModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Reminder
            </button>

            <button
              onClick={() => showFeedback("Task queue synchronized with latest live triggers.")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Contract Wizard Modal (§S-21) */}
      <ContractWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          setWizardOpen(false);
          showFeedback("New draft contract created successfully.");
        }}
      />

      {/* Send Reminder Confirmation Dialog */}
      {reminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Dispatch Payment / Statutory Reminder
              </h3>
              <button onClick={() => setReminderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              An automated notification with outstanding invoice statements will be dispatched to{" "}
              <span className="font-bold text-slate-900">{reminderTarget}</span>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReminderModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReminderModalOpen(false);
                  showFeedback(`Collection reminder sent to ${reminderTarget}.`);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

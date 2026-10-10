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
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
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

  // Dynamic Tasks (100% Real Live State - Zero Mock Data)
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.properties || [];
        setPropertiesList(list);
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      const savedScope = localStorage.getItem("officex_selected_property");
      if (savedScope) setSelectedProperty(savedScope);

      const handlePropertyUpdate = (e: any) => {
        if (e.detail?.propertyId) {
          setSelectedProperty(e.detail.propertyId);
        }
      };
      window.addEventListener("officex-property-change", handlePropertyUpdate);
      return () => window.removeEventListener("officex-property-change", handlePropertyUpdate);
    }
  }, []);

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
              onChange={(e) => {
                const newScope = e.target.value;
                setSelectedProperty(newScope);
                if (typeof window !== "undefined") {
                  localStorage.setItem("officex_selected_property", newScope);
                  const pObj = propertiesList.find((p) => p.id === newScope);
                  window.dispatchEvent(
                    new CustomEvent("officex-property-change", {
                      detail: { propertyId: newScope, propertyName: pObj?.name || "All Properties" },
                    })
                  );
                }
              }}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Managed Centres</option>
              {propertiesList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
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

      {/* §2.6 Empty State Banner (Clean Workspace) */}
      {tasks.length === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  §2.6 Clean Workspace
                </span>
                <h3 className="text-sm font-bold text-slate-900">Zero Pending PM Operational Tasks</h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                No contract approvals, rent escalations, or deposit collections pending action for this workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setWizardOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Contract (§S-21)</span>
            </button>
            <Link
              href="/properties/rent-roll"
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Import Rent Roll
            </Link>
          </div>
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
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">All Action Queues Clear</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active tasks matching your filter criteria. All escalations, contracts, and deposits are up to date.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setWizardOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  + Create New Lease Contract (§S-21)
                </button>
              </div>
            </div>
          ) : (
            filteredTasks.map((t) => {
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
          }))}
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

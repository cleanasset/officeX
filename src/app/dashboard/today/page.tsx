"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  Zap,
  Gauge,
  Receipt,
  FileText,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  X,
  Bell
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Topbar from "@/components/Topbar";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface TodayItem {
  id: string;
  category: "alert" | "approval" | "meter" | "escalation" | "ptp" | "renewal";
  title: string;
  description: string;
  severity: "critical" | "action" | "info";
  dueDate: string;
  dueStatus: "overdue" | "today" | "upcoming";
  relatedEntity: string;
  actionUrl: string;
  actionText: string;
  isDone?: boolean;
}

function TodayQueueContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams?.get("mode") as "all" | "pm" | "fm") || "all";
  const [roleMode, setRoleMode] = useState<"all" | "pm" | "fm">(initialMode);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchTodayQueue = async () => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();

      const [exceptionsRes, approvalsRes, metersRes] = await Promise.all([
        fetch("/api/exceptions", { headers: authHeaders }).catch(() => null),
        fetch("/api/approvals", { headers: authHeaders }).catch(() => null),
        fetch("/api/meters", { headers: authHeaders }).catch(() => null),
      ]);

      const queue: TodayItem[] = [];

      // 1. Ingest Live Exceptions & Commercial Alerts (AL-01..AL-22)
      if (exceptionsRes && exceptionsRes.ok) {
        const exJson = await exceptionsRes.json();
        const alertsList = exJson.exceptions || exJson.data || [];
        alertsList.forEach((a: any) => {
          const sev: TodayItem["severity"] =
            a.severity === "critical" || a.severity === "error"
              ? "critical"
              : a.severity === "action" || a.severity === "warning"
              ? "action"
              : "info";

          let cat: TodayItem["category"] = "alert";
          if (a.code === "AL-01" || a.code === "AL-02" || a.code === "AL-03") cat = "renewal";
          else if (a.code === "AL-04" || a.code === "AL-05") cat = "escalation";
          else if (a.code === "AL-07" || a.code === "AL-13") cat = "meter";
          else if (a.code === "AL-10") cat = "ptp";

          queue.push({
            id: `alert_${a.id || a.code}_${Math.random().toString(36).substring(7)}`,
            category: cat,
            title: `[${a.code}] ${a.title || a.alert_name || "Operational Alert"}`,
            description: a.description || a.message || a.impact || "",
            severity: sev,
            dueDate: a.dueDate || new Date().toISOString().split("T")[0],
            dueStatus: sev === "critical" ? "overdue" : "today",
            relatedEntity: a.related_entity || a.property_name || "Commercial Portfolio",
            actionUrl: a.resolution_url || a.actionUrl || "/exceptions",
            actionText: a.action_label || "Resolve",
          });
        });
      }

      // 2. Ingest Live Approvals (Contracts, Seat Counts, Write-Offs)
      if (approvalsRes && approvalsRes.ok) {
        const appJson = await approvalsRes.json();
        const pendingList = appJson.data || appJson.items || [];
        pendingList.forEach((p: any) => {
          queue.push({
            id: `appr_${p.id}`,
            category: "approval",
            title: `Pending Approval: ${p.title || p.entity_name || "Record"}`,
            description: p.notes || `Submitted by ${p.submitted_by || "Maker"} for financial verification`,
            severity: "action",
            dueDate: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            dueStatus: "today",
            relatedEntity: p.property_name || "Commercial Assets",
            actionUrl: "/approvals",
            actionText: "Review & Sign",
          });
        });
      }

      // 3. Ingest Meters requiring monthly readings
      if (metersRes && metersRes.ok) {
        const mJson = await metersRes.json();
        const metersList = mJson.data || [];
        metersList.slice(0, 5).forEach((m: any) => {
          queue.push({
            id: `meter_${m.id}`,
            category: "meter",
            title: `Meter Reading Required: ${m.meter_name} (${m.meter_code})`,
            description: `Utility meter assigned to ${m.space_name || m.space_code || "Unit"}. Multiplier: ${m.multiplier || 1}.0`,
            severity: "action",
            dueDate: new Date().toISOString().split("T")[0],
            dueStatus: "today",
            relatedEntity: m.building_name || "Commercial Building",
            actionUrl: "/operations/meters",
            actionText: "Record Reading",
          });
        });
      }

      setItems(queue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayQueue();
  }, []);

  const handleMarkDone = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item))
    );
    setFeedback("Item marked as resolved.");
    setTimeout(() => setFeedback(""), 3000);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Role Mode filter (§S-03 FM vs PM variant)
      if (roleMode === "fm" && !["meter", "alert"].includes(item.category)) {
        return false;
      }
      if (roleMode === "pm" && item.category === "meter") {
        return false;
      }
      // Category Filter
      if (activeFilter !== "all" && item.category !== activeFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.relatedEntity.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, roleMode, activeFilter, searchQuery]);

  // KPI Computations
  const overdueCount = items.filter((i) => i.dueStatus === "overdue" && !i.isDone).length;
  const todayCount = items.filter((i) => i.dueStatus === "today" && !i.isDone).length;
  const approvalsCount = items.filter((i) => i.category === "approval" && !i.isDone).length;
  const activeAlertsCount = items.filter((i) => i.category === "alert" && !i.isDone).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Topbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header (§S-03 Wireframe) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F8B7D]/10 text-[#0F8B7D] border border-[#0F8B7D]/20 uppercase tracking-wider">
                Screen S-03 Spec
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Unified PM / FM Daily Operational Action Queue
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>Today Action Queue</span>
            </h1>
            <p className="text-xs text-slate-500">
              Merged high-priority commercial alerts, pending maker-checker sign-offs, and critical operational deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Persona Toggle (§3.2 vs §3.6) */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setRoleMode("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  roleMode === "all" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Operations
              </button>
              <button
                onClick={() => setRoleMode("pm")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  roleMode === "pm" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Property Manager
              </button>
              <button
                onClick={() => setRoleMode("fm")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  roleMode === "fm" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Facility Manager
              </button>
            </div>

            <button
              onClick={fetchTodayQueue}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Summary KPI Strip (§S-03 Top Wireframe) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Critical / Overdue</span>
            </div>
            <div className="text-2xl font-black text-rose-900 mt-1">{overdueCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Immediate resolution required</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} />
              <span>Due Today</span>
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{todayCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Day's operational tasks</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>Approvals Inbox</span>
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">{approvalsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pending maker-checker</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-[#0F8B7D] uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={14} />
              <span>Active Alerts</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{activeAlertsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">AL-01..AL-22 triggers</div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Items" },
              { id: "approval", label: "Approvals (§S-06)" },
              { id: "renewal", label: "Expiries (§S-24)" },
              { id: "escalation", label: "Escalations (§S-25)" },
              { id: "meter", label: "Utilities (§S-31)" },
              { id: "ptp", label: "Collections (§S-45)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D]"
            />
          </div>
        </div>

        {/* Action Queue List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0F8B7D]" />
              <p className="text-xs font-bold">Synchronizing Today Action Queue...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">Your Action Queue is Clear!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No overdue alerts, pending approvals, or urgent operational tasks require your attention.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isDone ? "bg-slate-50/80 opacity-60" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleMarkDone(item.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        item.isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-slate-400 text-transparent"
                      }`}
                      title={item.isDone ? "Mark incomplete" : "Mark resolved"}
                    >
                      <Check size={14} className={item.isDone ? "block" : "hidden"} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            item.severity === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : item.severity === "action"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <h4
                          className={`text-xs font-bold ${
                            item.isDone ? "line-through text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="font-semibold text-slate-600">{item.relatedEntity}</span>
                        <span>•</span>
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={item.actionUrl}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>{item.actionText}</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TodayQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center text-slate-500 text-xs font-bold animate-pulse">
            Loading Today Action Queue...
          </div>
        </div>
      }
    >
      <TodayQueueContent />
    </Suspense>
  );
}

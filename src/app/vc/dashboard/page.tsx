"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Flame,
  CheckCircle2,
  TrendingUp,
  HardHat,
  ArrowRight,
  ChevronRight,
  Activity,
  FileCheck2,
  Calendar,
  Sparkles,
  Zap,
  Building,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function VisitorComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "inside" | "expected" | "overstay">("inside");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickCheckinOpen, setQuickCheckinOpen] = useState(false);
  const [quickVisitorName, setQuickVisitorName] = useState("");
  const [quickVisitorMobile, setQuickVisitorMobile] = useState("");
  const [quickVisitorCompany, setQuickVisitorCompany] = useState("");
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/vc/dashboard?orgId=org_officex_demo");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // 15s live polling
    return () => clearInterval(interval);
  }, []);

  const stats = data?.visitorStats || {
    expectedToday: 8,
    checkedIn: 5,
    insideNow: 3,
    checkedOut: 4,
    overstays: 0,
    vipCount: 1,
    deniedCount: 0,
  };

  const compStats = data?.complianceStats || {
    score: 94.5,
    totalObligations: 5,
    compliantCount: 3,
    dueSoonCount: 2,
    overdueCount: 0,
    openIncidents: 1,
    openCapa: 2,
    activePermits: 1,
  };

  const visits = data?.recentVisits || [];
  const obligations = data?.recentObligations || [];

  const filteredVisits = visits.filter((v: any) => {
    const matchesSearch =
      (v.visitorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.hostName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tenantName || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "inside") return matchesSearch && v.status === "checked_in";
    if (activeTab === "expected") return matchesSearch && v.status === "scheduled";
    if (activeTab === "overstay") return matchesSearch && v.status === "overstay";
    return matchesSearch;
  });

  const handleQuickCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVisitorName || !quickVisitorMobile) return;
    setIsSubmittingQuick(true);
    setTimeout(() => {
      setIsSubmittingQuick(false);
      setQuickCheckinOpen(false);
      setActionSuccessMsg(`Pass issued & guest ${quickVisitorName} checked-in!`);
      setQuickVisitorName("");
      setQuickVisitorMobile("");
      setQuickVisitorCompany("");
      fetchDashboardData();
      setTimeout(() => setActionSuccessMsg(""), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-emerald-950/30 border border-slate-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Facility Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CyberCity Tech Tower A — Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time commercial front-desk activity reconciled with statutory EHS compliance radar.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQuickCheckinOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <QrCode className="w-4 h-4" />
            <span>Fast Check-In</span>
          </button>

          <Link
            href="/vc/visitors/pre-register"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Pre-Register</span>
          </Link>

          <Link
            href="/vc/visitors/emergency"
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Evacuation MIS</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: VISITOR MANAGEMENT KPIS (VC-01) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Visitor Operational Radar (Today)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Updated just now</span>
        </div>

        {/* 6 Key Visitor Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Inside Now */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 shadow-lg relative overflow-hidden group hover:border-blue-500/60 transition-all">
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Inside Campus
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 flex items-baseline gap-1.5">
              <span>{stats.insideNow}</span>
              <span className="text-[10px] text-emerald-400 font-bold">● Active</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Checked in & verified</div>
          </div>

          {/* Expected Today */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Expected Today
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.expectedToday}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Pre-registered & invites</div>
          </div>

          {/* Checked In */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Checked In
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {stats.checkedIn}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Across all speed-gates</div>
          </div>

          {/* Checked Out */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Checked Out
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">
              {stats.checkedOut}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Passes safely closed</div>
          </div>

          {/* Overstays */}
          <div className={`p-4 rounded-2xl bg-slate-900/80 border shadow-md transition-all ${
            stats.overstays > 0 ? "border-amber-500/50 bg-amber-950/20" : "border-slate-800"
          }`}>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overstays
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {stats.overstays}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Beyond permitted hours</div>
          </div>

          {/* VIP Guests */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-md hover:border-purple-500/50 transition-all">
            <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
              VIP Visitors
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
              {stats.vipCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Priority escort mode</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE VISITOR ACTIVITY STREAM */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              Live Visitor Stream & Front-Desk Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtered in real-time across turnstiles, reception desks, and service entrances.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("inside")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "inside"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Inside ({stats.insideNow})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expected")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "expected"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Expected
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Records
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visitor, host, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Live Visitor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((v: any) => {
              const isInside = v.status === "checked_in";
              const isContractor = v.visitorType === "contractor";
              const isVip = v.visitorType === "vip";

              return (
                <div
                  key={v.id}
                  className={`p-4 rounded-2xl bg-slate-950/70 border transition-all hover:border-slate-700 space-y-3 relative overflow-hidden ${
                    isInside ? "border-blue-500/30" : "border-slate-800/80"
                  }`}
                >
                  {isInside && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isVip
                          ? "bg-purple-900/60 text-purple-300 border border-purple-500/40"
                          : isContractor
                          ? "bg-amber-900/60 text-amber-300 border border-amber-500/40"
                          : "bg-blue-900/60 text-blue-300 border border-blue-500/40"
                      }`}>
                        {(v.visitorName || "V").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{v.visitorName}</span>
                          {isVip && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{v.company || "Guest"}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isInside
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {isInside ? "Inside" : v.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/70 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 text-[11px]">Visiting Host:</span>
                      <span className="font-semibold">{v.hostName || "Building Mgmt"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 text-[11px]">Tenant / Zone:</span>
                      <span>{v.tenantName || v.zoneId || "Floor 8 East"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 text-[11px]">Purpose:</span>
                      <span className="text-blue-300 font-medium truncate max-w-[170px]">
                        {v.purpose || "Meeting"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      In: {v.checkinAt ? new Date(v.checkinAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Scheduled"}
                    </span>

                    {isInside ? (
                      <Link
                        href={`/vc/visitors/checkout?visitId=${v.id}`}
                        className="text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Check Out →
                      </Link>
                    ) : (
                      <Link
                        href={`/vc/visitors/check-in?visitId=${v.id}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Check In →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <div className="text-xs">No visitor records matching current filter.</div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: COMPLIANCE & STATUTORY RADAR (CM-01) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Statutory Compliance & EHS Health (CM-01)
            </h2>
          </div>
          <Link
            href="/vc/compliance"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Full Compliance Register</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Compliance Score Gauge Card */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Facility Health Index
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                Grade A+ Audit Ready
              </span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Gauge Background Ring */}
                <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
                {/* Active Colored Ring */}
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-l-transparent -rotate-45" />

                <div className="text-center relative z-10 space-y-0.5">
                  <div className="text-3xl font-black text-white">
                    {compStats.score}%
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                    Compliant
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {compStats.compliantCount} of {compStats.totalObligations} Obligations
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="text-emerald-400 font-black text-base">{compStats.compliantCount}</div>
                <div className="text-[10px] text-slate-400">Compliant</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="text-amber-400 font-black text-base">{compStats.dueSoonCount}</div>
                <div className="text-[10px] text-slate-400">Due Soon</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="text-rose-400 font-black text-base">{compStats.overdueCount}</div>
                <div className="text-[10px] text-slate-400">Overdue</div>
              </div>
            </div>
          </div>

          {/* Critical Obligations & Work Permits */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-extrabold text-white">
                Upcoming Critical Obligations & Expiry Radar
              </span>
              <span className="text-xs text-slate-400">Next 90 Days</span>
            </div>

            <div className="space-y-3">
              {obligations.map((o: any) => {
                const isDueSoon = o.status === "due_soon";
                return (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          o.criticality === "critical"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {o.category.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {o.requirement}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Authority: {o.authority || "State Govt"}</span>
                        <span>•</span>
                        <span>Owner: {o.ownerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <div className={`text-xs font-bold ${isDueSoon ? "text-amber-400" : "text-emerald-400"}`}>
                          {isDueSoon ? "Due Soon" : "Compliant"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {o.nextDueDate ? new Date(o.nextDueDate).toLocaleDateString() : "Active"}
                        </div>
                      </div>

                      <Link
                        href={`/vc/compliance/evidence?obligationId=${o.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                      >
                        Evidence
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Permits & CAPA mini row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <HardHat className="w-4 h-4 text-amber-400" />
                  <span>Active Hot-Work & Height PTW:</span>
                </div>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {compStats.activePermits} Permit Active
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Open CAPA Workflows:</span>
                </div>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {compStats.openCapa} Open Actions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK CHECK-IN MODAL */}
      {quickCheckinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">Express Reception Check-In</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickCheckinOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCheckin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sen"
                  value={quickVisitorName}
                  onChange={(e) => setQuickVisitorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={quickVisitorMobile}
                  onChange={(e) => setQuickVisitorMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deloitte India"
                  value={quickVisitorCompany}
                  onChange={(e) => setQuickVisitorCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickCheckinOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {isSubmittingQuick ? "Issuing Badge..." : "Issue Pass & Check In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Upload, Search, CheckCircle, AlertTriangle, XCircle, Shield,
  FileText, ShieldCheck, Download, Plus, X, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Eye, RefreshCw, Filter, Check, Clock,
  Building, ExternalLink, Printer, Award, AlertCircle, ArrowUpRight,
  Building2, Sparkles, Flame, Zap, Compass, CheckCircle2, ChevronDown,
  LayoutGrid, ListFilter, ArrowRight, ShieldAlert, BadgePercent,
  Layers, MapPin, SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { StatutoryCertificate } from "@/lib/compliance-engine";
import ComplianceOperationsCenter from "@/components/compliance/ComplianceOperationsCenter";

export default function ComplianceTrackerDashboard() {
  const [suiteMode, setSuiteMode] = useState<"operations_center" | "statutory_ledger">("operations_center");
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "category">("calendar");
  const [calendarSubView, setCalendarSubView] = useState<"split" | "full" | "roadmap">("split");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [certificates, setCertificates] = useState<StatutoryCertificate[]>([]);
  const [health, setHealth] = useState<any>({
    score: 100,
    total: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    inRenewal: 0
  });
  const [propertyName, setPropertyName] = useState<string>("Commercial Asset");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Calendar Navigation State (Default to September 2026 - Current Live Audit Period)
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // 0-indexed: 8 = September
  const [selectedDateForDocket, setSelectedDateForDocket] = useState<number>(16); // Default to today: Sep 16, 2026

  // Modals & Drawers
  const [activeCertForView, setActiveCertForView] = useState<StatutoryCertificate | null>(null);
  const [activeCertForRenew, setActiveCertForRenew] = useState<StatutoryCertificate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Renewal Modal Form State
  const [renewalType, setRenewalType] = useState<"marketplace" | "self">("marketplace");
  const [selectedVendor, setSelectedVendor] = useState("Bureau Veritas India Ltd (Class-A Auditor)");
  const [targetRenewalDate, setTargetRenewalDate] = useState("2026-11-15");
  const [renewalNotes, setRenewalNotes] = useState("Expedited renewal required before municipal audit.");

  // Upload Form State
  const [newCert, setNewCert] = useState({
    name: "",
    category: "fire" as StatutoryCertificate["category"],
    categoryLabel: "Fire & Life Safety",
    authority: "Ahmedabad Municipal Corporation (AMC CFO)",
    regNumber: "GJ-AMC-2026-NOC-9901",
    issueDate: "2025-10-01",
    expiry: "2026-10-01",
    inspectingOfficer: "Chief Fire Officer, Ahmedabad East",
    inspectionCycle: "Annual Mandatory",
    penaltyClause: "₹50,000 fine & temporary seal under Sec 18 Gujarat Fire Act",
    estimatedRenewalCost: 35000
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const catParam = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const searchParam = searchQuery ? `${catParam ? "&" : "?"}search=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/compliance/certificates${catParam}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
        if (data.health) setHealth(data.health);
        if (data.property?.name) setPropertyName(data.property.name);
      }
    } catch (e) {
      console.error("Failed to load compliance certificates:", e);
      showToast("Error loading statutory compliance certificates.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCertificates();
    if (typeof window !== "undefined") {
      const orgName = localStorage.getItem("officex_org_name") || localStorage.getItem("officex_active_org");
      if (orgName) setPropertyName(orgName);
    }
  }, [fetchCertificates]);

  // Calendar Helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // Shift so Monday is index 0
  const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
    setSelectedDateForDocket(1);
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
    setSelectedDateForDocket(1);
  };

  const handleGoToCurrent = () => {
    setCalendarYear(2026);
    setCalendarMonth(8); // Sep 2026
    setSelectedDateForDocket(16); // Sep 16, 2026
    showToast("Switched calendar view to September 2026 (Live Audit Period)");
  };

  const handleSelectMonthPill = (year: number, monthIndex: number) => {
    setCalendarYear(year);
    setCalendarMonth(monthIndex);
    setSelectedDateForDocket(1);
  };

  // Find certificates for a specific day in the active calendar month
  const getCertsForDay = useCallback((day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = calendarMonth + 1 < 10 ? `0${calendarMonth + 1}` : `${calendarMonth + 1}`;
    const targetDateStr = `${calendarYear}-${formattedMonth}-${formattedDay}`;
    return certificates.filter(c => {
      const matchesDate = (c.expiryDateObj || c.expiry) === targetDateStr;
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.regNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesCategory && matchesSearch;
    });
  }, [calendarMonth, calendarYear, certificates, selectedCategory, searchQuery]);

  // Certificates for the currently active month
  const monthCertificates = useMemo(() => {
    const formattedMonth = calendarMonth + 1 < 10 ? `0${calendarMonth + 1}` : `${calendarMonth + 1}`;
    const prefix = `${calendarYear}-${formattedMonth}-`;
    return certificates.filter(c => {
      const exp = c.expiryDateObj || c.expiry || "";
      const matchesMonth = exp.startsWith(prefix);
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.regNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesCategory && matchesSearch;
    }).sort((a, b) => (a.expiry || "").localeCompare(b.expiry || ""));
  }, [calendarMonth, calendarYear, certificates, selectedCategory, searchQuery]);

  // Count certificates by month for the quick-jump bar
  const getMonthEventCount = (year: number, monthIdx: number) => {
    const formattedMonth = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
    const prefix = `${year}-${formattedMonth}-`;
    return certificates.filter(c => (c.expiryDateObj || c.expiry || "").startsWith(prefix)).length;
  };

  // Selected date certificates for the docket
  const selectedDayCerts = useMemo(() => {
    return getCertsForDay(selectedDateForDocket);
  }, [getCertsForDay, selectedDateForDocket]);

  // Next closest deadline
  const nextUpcomingCert = useMemo(() => {
    const nowStr = "2026-09-16";
    const upcoming = certificates
      .filter(c => (c.expiry || "") >= nowStr)
      .sort((a, b) => (a.expiry || "").localeCompare(b.expiry || ""));
    return upcoming[0] || null;
  }, [certificates]);

  // Category Icon & Styling Helper
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "fire":
        return {
          icon: <Flame size={12} className="text-orange-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900 border-orange-200/80 hover:border-orange-300",
          badgeBg: "bg-orange-100 text-orange-800",
          accentColor: "#F97316"
        };
      case "lift":
        return {
          icon: <Building size={12} className="text-purple-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-900 border-purple-200/80 hover:border-purple-300",
          badgeBg: "bg-purple-100 text-purple-800",
          accentColor: "#8B5CF6"
        };
      case "electrical":
        return {
          icon: <Zap size={12} className="text-amber-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-200/80 hover:border-amber-300",
          badgeBg: "bg-amber-100 text-amber-800",
          accentColor: "#F59E0B"
        };
      case "pcb":
        return {
          icon: <Compass size={12} className="text-emerald-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border-emerald-200/80 hover:border-emerald-300",
          badgeBg: "bg-emerald-100 text-emerald-800",
          accentColor: "#10B981"
        };
      case "insurance":
        return {
          icon: <Shield size={12} className="text-blue-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900 border-blue-200/80 hover:border-blue-300",
          badgeBg: "bg-blue-100 text-blue-800",
          accentColor: "#3B82F6"
        };
      default:
        return {
          icon: <Building2 size={12} className="text-slate-500 shrink-0" />,
          pillBg: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-900 border-slate-200/80 hover:border-slate-300",
          badgeBg: "bg-slate-100 text-slate-800",
          accentColor: "#64748B"
        };
    }
  };

  // Renewal Dispatch Handler
  const handleInitiateRenewal = (cert: StatutoryCertificate) => {
    setActiveCertForRenew(cert);
  };

  const handleConfirmRenewalDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCertForRenew) return;

    try {
      const res = await fetch("/api/compliance/certificates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCertForRenew.id,
          action: "renew",
          vendor: selectedVendor,
          notes: renewalNotes
        })
      });
      if (res.ok) {
        showToast(`Work Order dispatched to ${selectedVendor}! Status updated to "In Renewal".`);
        setActiveCertForRenew(null);
        fetchCertificates();
      }
    } catch (err) {
      console.error("Renewal dispatch failed:", err);
      showToast("Failed to dispatch renewal.");
    }
  };

  // Upload New Certificate Handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name.trim()) {
      showToast("Please provide certificate name.");
      return;
    }

    try {
      const res = await fetch("/api/compliance/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCert,
          documentUrl: `${newCert.name.replace(/\s+/g, "_").toUpperCase()}.pdf`
        })
      });

      if (res.ok) {
        setShowUploadModal(false);
        showToast(`Successfully registered ${newCert.name} in Compliance Ledger!`);
        fetchCertificates();
      }
    } catch (err) {
      console.error("Failed to upload certificate:", err);
      showToast("Failed to register certificate.");
    }
  };

  // CSV Export
  const handleExportAuditDossier = () => {
    if (!certificates.length) return;
    const headers = ["Cert ID", "Certificate Name", "Category", "Authority", "Reg Number", "Issue Date", "Expiry Date", "Days Remaining", "Status", "Inspecting Officer", "Penalty Clause"];
    const rows = certificates.map(c => [
      c.id,
      `"${c.name}"`,
      c.categoryLabel,
      `"${c.authority}"`,
      c.regNumber,
      c.issueDate,
      c.expiry,
      c.daysRemaining ?? "—",
      c.status,
      `"${c.inspectingOfficer}"`,
      `"${c.penaltyClause}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OfficeX_Statutory_Compliance_Dossier_${propertyName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Statutory Compliance Dossier exported as CSV!");
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700/60 animate-in fade-in duration-200">
          <CheckCircle size={16} className="text-teal-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sibling Calendar Tabs Navigation & Operations Suite Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSuiteMode("operations_center")}
            className={`px-4 py-2.5 text-xs font-black rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              suiteMode === "operations_center"
                ? "bg-gradient-to-r from-teal-50 to-emerald-50 text-[#0F8B7D] border-teal-200/90 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <ShieldCheck size={15} className="text-[#0F8B7D]" />
            <span>Compliance Operations Center (CM-01 to CM-16)</span>
          </button>
          <button
            onClick={() => setSuiteMode("statutory_ledger")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              suiteMode === "statutory_ledger"
                ? "bg-gradient-to-r from-teal-50 to-emerald-50 text-[#0F8B7D] border-teal-200/90 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <FileText size={15} />
            <span>Statutory Certificate Ledger</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-bold ml-1">
              {certificates.length}
            </span>
          </button>
        </div>
      </div>

      {suiteMode === "operations_center" ? (
        <ComplianceOperationsCenter portalRole="owner" defaultProperty={propertyName} />
      ) : (
        <>
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-br from-white via-slate-50/50 to-teal-50/20 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-[#0F8B7D] to-[#0D7A6E] rounded-2xl text-white shadow-md shadow-teal-900/10 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Statutory Compliance &amp; NOC Command Center
              </h1>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200/80 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-pulse" />
                Live Vault · {propertyName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Statutory audit-ready ledger for Fire NOC, Lift Licenses, CEIG Substation, GPCB CTO &amp; Municipal BU Certificates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchCertificates}
            disabled={isLoading}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-[#0F8B7D]" : ""} />
          </button>
          <button
            onClick={handleExportAuditDossier}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Download size={14} /> Export Dossier
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-sm shadow-teal-900/20 cursor-pointer transition-all"
          >
            <Upload size={14} /> Upload Certificate
          </button>
        </div>
      </div>

      {/* Institutional KPI Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STATUTORY REGISTERS</span>
            <Layers size={14} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{health.total}</p>
          <span className="text-[11px] text-slate-500 font-medium">{propertyName} · Commercial</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">VALID &amp; COMPLIANT</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{health.valid}</p>
          <span className="text-[11px] text-emerald-700 font-bold">100% Audit Verified</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">EXPIRING (&lt;45 DAYS)</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">{health.expiringSoon}</p>
          <span className="text-[11px] text-amber-700 font-bold">Renewal Notice Window</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">EXPIRED / AUDIT DUE</span>
            <ShieldAlert size={14} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{health.expired}</p>
          <span className="text-[11px] text-rose-700 font-bold">Immediate Penalty Risk</span>
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-teal-300 uppercase tracking-wider">HEALTH SCORE</span>
            <p className="text-2xl font-black text-white mt-0.5">{health.score}%</p>
            <span className="text-[11px] text-teal-200 font-bold">Grade-A Rating</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 shadow-inner">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Primary View Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "calendar"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon size={14} />
            <span>Visual Calendar</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={14} />
            <span>Statutory Table</span>
          </button>

          <button
            onClick={() => setViewMode("category")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "category"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield size={14} />
            <span>Category Matrix</span>
          </button>
        </div>

        {/* Search & Location Pill */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-72 focus-within:border-teal-500 focus-within:bg-white transition-all">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NOC, authority, or reg #..."
              className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 font-bold text-teal-800 text-xs flex items-center gap-1.5 shadow-2xs">
            <MapPin size={13} className="text-[#0F8B7D]" />
            <span>{propertyName} (Nikol, Ahmedabad)</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        {[
          { id: "all", label: "All Regulations", count: certificates.length },
          { id: "fire", label: "🔥 Fire & Life Safety", count: certificates.filter(c => c.category === "fire").length },
          { id: "lift", label: "🛗 Lifts & Elevators", count: certificates.filter(c => c.category === "lift").length },
          { id: "electrical", label: "⚡ Electrical & DG", count: certificates.filter(c => c.category === "electrical").length },
          { id: "pcb", label: "🌿 Pollution / GPCB", count: certificates.filter(c => c.category === "pcb").length },
          { id: "structural", label: "🏢 Municipal & Structural", count: certificates.filter(c => c.category === "structural").length },
          { id: "insurance", label: "🛡️ Comprehensive Insurance", count: certificates.filter(c => c.category === "insurance").length }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-slate-900 text-white shadow-xs font-black"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedCategory === cat.id ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE & ULTRA-ATTRACTIVE VISUAL CALENDAR VIEW */}
      {/* ========================================================================= */}
      {viewMode === "calendar" && (
        <div className="flex flex-col gap-5">
          {/* Calendar Master Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Active Month Title & Status Tag */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-[#0F8B7D] text-white flex items-center justify-center font-black shadow-md shadow-teal-800/10 shrink-0">
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {monthNames[calendarMonth]} {calendarYear}
                    </h2>
                    {calendarYear === 2026 && calendarMonth === 8 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black uppercase tracking-wider">
                        ● Live Audit Quarter (Q3)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {monthCertificates.length > 0 ? (
                      <span className="text-slate-700 font-bold">
                        {monthCertificates.length} statutory milestone{monthCertificates.length > 1 ? "s" : ""} scheduled in {monthNames[calendarMonth]}
                      </span>
                    ) : (
                      "No statutory licenses expiring in this month horizon"
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Sub-View Toggles & Month Step Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sub-view toggle (Split vs Full Grid vs Roadmap) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setCalendarSubView("split")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarSubView === "split" ? "bg-white text-[#0F8B7D] shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Interactive Split View with Milestone Docket"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Split Docket</span>
                  </button>
                  <button
                    onClick={() => setCalendarSubView("full")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarSubView === "full" ? "bg-white text-[#0F8B7D] shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Expanded Full Month Matrix"
                  >
                    <LayoutGrid size={13} />
                    <span>Full Grid</span>
                  </button>
                  <button
                    onClick={() => setCalendarSubView("roadmap")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarSubView === "roadmap" ? "bg-white text-[#0F8B7D] shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="12-Month Chronological Statutory Roadmap"
                  >
                    <ListFilter size={13} />
                    <span>12M Roadmap</span>
                  </button>
                </div>

                {/* Step controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGoToCurrent}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Today
                  </button>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-100 cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-slate-50 text-slate-600 cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-Jump Month Horizon Pills Strip */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 pr-1">
                QUICK HORIZON:
              </span>
              {[
                { year: 2026, month: 6, label: "Jul '26" },
                { year: 2026, month: 7, label: "Aug '26" },
                { year: 2026, month: 8, label: "Sep '26", isCurrentAudit: true },
                { year: 2026, month: 9, label: "Oct '26" },
                { year: 2026, month: 10, label: "Nov '26" },
                { year: 2026, month: 11, label: "Dec '26" },
                { year: 2027, month: 0, label: "Jan '27" },
                { year: 2027, month: 2, label: "Mar '27" }
              ].map((pill) => {
                const isSelected = calendarYear === pill.year && calendarMonth === pill.month;
                const count = getMonthEventCount(pill.year, pill.month);
                return (
                  <button
                    key={`${pill.year}-${pill.month}`}
                    onClick={() => handleSelectMonthPill(pill.year, pill.month)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? "bg-[#0F8B7D] text-white border-[#0D7A6E] shadow-xs font-black"
                        : pill.isCurrentAudit
                        ? "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    <span>{pill.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-teal-100 text-teal-900"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-VIEW 1 & 2: MONTH MATRIX (SPLIT DOCKET OR FULL GRID) */}
          {/* ========================================================================= */}
          {calendarSubView !== "roadmap" && (
            <div className={`grid gap-5 ${calendarSubView === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
              {/* Left Canvas: The 7-Day Month Grid (8 cols in Split View or 12 in Full Grid) */}
              <div className={`bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col ${
                calendarSubView === "split" ? "lg:col-span-7 xl:col-span-8" : "col-span-1"
              }`}>
                {/* Weekday Names Header */}
                <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center py-3">
                  <div>MON</div>
                  <div>TUE</div>
                  <div>WED</div>
                  <div>THU</div>
                  <div>FRI</div>
                  <div>SAT</div>
                  <div className="text-rose-500">SUN</div>
                </div>

                {/* Day Matrix Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-[1px] p-[1px]">
                  {/* Trailing days from previous month */}
                  {Array.from({ length: adjustedFirstDay }).map((_, idx) => {
                    const prevDateNumber = daysInPrevMonth - adjustedFirstDay + idx + 1;
                    return (
                      <div
                        key={`prev-${idx}`}
                        className="bg-slate-50/50 min-h-[90px] p-2 text-slate-300 font-mono text-xs select-none"
                      >
                        <span>{prevDateNumber}</span>
                      </div>
                    );
                  })}

                  {/* Active Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const certsOnDay = getCertsForDay(day);
                    const hasEvents = certsOnDay.length > 0;
                    const isToday = calendarYear === 2026 && calendarMonth === 8 && day === 16;
                    const isSelected = selectedDateForDocket === day;

                    return (
                      <div
                        key={`day-${day}`}
                        onClick={() => {
                          setSelectedDateForDocket(day);
                          if (hasEvents) {
                            // If events exist, user can inspect via docket or view
                          }
                        }}
                        className={`min-h-[105px] p-2 transition-all flex flex-col justify-between cursor-pointer group relative ${
                          isSelected
                            ? "bg-teal-50/60 ring-2 ring-inset ring-[#0F8B7D] z-10"
                            : isToday
                            ? "bg-gradient-to-b from-teal-50/40 to-white ring-1 ring-inset ring-teal-300"
                            : hasEvents
                            ? "bg-white hover:bg-slate-50/90"
                            : "bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-mono font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                              isSelected
                                ? "bg-[#0F8B7D] text-white shadow-xs"
                                : isToday
                                ? "bg-teal-100 text-teal-900 ring-1 ring-teal-400 font-black"
                                : hasEvents
                                ? "text-slate-900 bg-slate-100 group-hover:bg-slate-200"
                                : "text-slate-400"
                            }`}
                          >
                            {day}
                          </span>

                          {isToday && (
                            <span className="text-[9px] font-black text-teal-800 bg-teal-100/90 px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                              TODAY
                            </span>
                          )}

                          {hasEvents && !isToday && (
                            <span className="text-[9px] font-mono font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                              {certsOnDay.length} {certsOnDay.length === 1 ? "NOC" : "Events"}
                            </span>
                          )}
                        </div>

                        {/* Event Badges List on Day */}
                        <div className="space-y-1 mt-1.5">
                          {certsOnDay.slice(0, 2).map((cert) => {
                            const theme = getCategoryTheme(cert.category);
                            const isExpired = cert.status === "Expired";
                            const isExpiring = cert.status === "Expiring Soon";

                            return (
                              <div
                                key={cert.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDateForDocket(day);
                                  setActiveCertForView(cert);
                                }}
                                className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all truncate flex items-center gap-1.5 shadow-2xs hover:scale-102 hover:shadow-xs cursor-pointer ${
                                  isExpired
                                    ? "bg-rose-50 text-rose-900 border-rose-200 font-black ring-1 ring-rose-300"
                                    : isExpiring
                                    ? "bg-amber-50 text-amber-900 border-amber-200/90 font-bold"
                                    : "bg-emerald-50 text-emerald-900 border-emerald-200 font-medium"
                                }`}
                                title={`${cert.name} (${cert.status}) · ${cert.authority}`}
                              >
                                {theme.icon}
                                <span className="truncate">{cert.name}</span>
                              </div>
                            );
                          })}

                          {certsOnDay.length > 2 && (
                            <span className="text-[9px] text-slate-400 font-bold block text-right">
                              +{certsOnDay.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* Subtle bottom indicator dot if events exist */}
                        {hasEvents && (
                          <div className="flex items-center gap-1 justify-center mt-1">
                            {certsOnDay.map((c, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  c.status === "Expired"
                                    ? "bg-rose-500"
                                    : c.status === "Expiring Soon"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Trailing days for next month */}
                  {Array.from({
                    length: (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7
                  }).map((_, idx) => (
                    <div
                      key={`next-${idx}`}
                      className="bg-slate-50/50 min-h-[90px] p-2 text-slate-300 font-mono text-xs select-none"
                    >
                      <span>{idx + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Legend Bar */}
                <div className="p-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STATUS LEGEND:</span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue / Expired
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Expiring (&lt;45d)
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Valid &amp; Certified
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                    <span>Click any date to inspect details &amp; dispatch renewals</span>
                  </div>
                </div>
              </div>

              {/* Right Pane: Selected Day Docket & Active Month Agenda */}
              {calendarSubView === "split" && (
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                  {/* Spotlight Selected Day Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          SELECTED DATE DOCKET
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {selectedDateForDocket} {monthNames[calendarMonth]} {calendarYear}
                        </h3>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                        <Clock size={16} />
                      </div>
                    </div>

                    {/* Content for Selected Day */}
                    {selectedDayCerts.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{selectedDayCerts.length} Statutory License Expiring on this Date:</span>
                        </div>

                        {selectedDayCerts.map((cert) => {
                          const isExpired = cert.status === "Expired";
                          const isExpiring = cert.status === "Expiring Soon";
                          const theme = getCategoryTheme(cert.category);

                          return (
                            <div
                              key={cert.id}
                              className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-2xs space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                    {theme.icon}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                                      {cert.name}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {cert.categoryLabel}
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                  isExpired
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : isExpiring
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {cert.status}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-100/80 text-[11px] space-y-1 font-medium text-slate-700">
                                <div className="flex justify-between">
                                  <span className="text-slate-400 text-[10px] font-bold">AUTHORITY:</span>
                                  <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">{cert.authority}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 text-[10px] font-bold">REG #:</span>
                                  <span className="font-mono font-bold text-slate-900">{cert.regNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 text-[10px] font-bold">CYCLE:</span>
                                  <span>{cert.inspectionCycle}</span>
                                </div>
                              </div>

                              {/* Penalty Risk Clause */}
                              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-[11px] text-rose-900">
                                <span className="font-bold block text-[10px] uppercase">Default Liability Clause:</span>
                                <p className="text-[10px] mt-0.5 leading-snug">{cert.penaltyClause}</p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => setActiveCertForView(cert)}
                                  className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <Eye size={13} className="text-[#0F8B7D]" /> View Cert
                                </button>
                                <button
                                  onClick={() => handleInitiateRenewal(cert)}
                                  className="flex-1 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <RefreshCw size={13} /> Renew RFP
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Clear Statutory Docket on this Day
                        </h4>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          No municipal inspections or license renewals fall on {selectedDateForDocket} {monthNames[calendarMonth]}.
                        </p>
                        {nextUpcomingCert && (
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 block truncate">
                              Next Upcoming: {nextUpcomingCert.name} ({nextUpcomingCert.expiry})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Monthly Expiry Agenda List */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3.5 flex-1">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          MONTH AGENDA
                        </span>
                        <h4 className="text-sm font-black text-slate-900">
                          {monthNames[calendarMonth]} Milestones ({monthCertificates.length})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Chronological
                      </span>
                    </div>

                    {monthCertificates.length > 0 ? (
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {monthCertificates.map((cert) => {
                          const isExpired = cert.status === "Expired";
                          const isExpiring = cert.status === "Expiring Soon";
                          const theme = getCategoryTheme(cert.category);
                          const dayNumber = parseInt((cert.expiry || "").split("-")[2] || "1", 10);

                          return (
                            <div
                              key={cert.id}
                              onClick={() => {
                                setSelectedDateForDocket(dayNumber);
                                setActiveCertForView(cert);
                              }}
                              className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-teal-400 hover:bg-slate-50/80 transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-[#0F8B7D] flex flex-col items-center justify-center font-mono font-black text-xs shrink-0 transition-colors">
                                  <span>{dayNumber}</span>
                                  <span className="text-[8px] uppercase font-sans font-bold text-slate-400">
                                    {monthShortNames[calendarMonth]}
                                  </span>
                                </div>
                                <div className="truncate">
                                  <h5 className="text-xs font-black text-slate-900 truncate group-hover:text-[#0F8B7D] transition-colors">
                                    {cert.name}
                                  </h5>
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {cert.authority}
                                  </span>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 ${
                                isExpired
                                  ? "bg-rose-100 text-rose-800"
                                  : isExpiring
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {cert.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">
                        All compliance requirements for {monthNames[calendarMonth]} are clear.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: 12-MONTH CHRONOLOGICAL ROADMAP / AGENDA */}
          {/* ========================================================================= */}
          {calendarSubView === "roadmap" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    12-Month Statutory Compliance Roadmap (2026 – 2027)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Quarter-by-quarter forward inspection schedule and statutory renewal milestones for {propertyName}.
                  </p>
                </div>
                <button
                  onClick={() => setCalendarSubView("split")}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <CalendarIcon size={13} /> Switch back to Month Grid
                </button>
              </div>

              {/* Roadmap Timeline Quarters */}
              <div className="space-y-6">
                {[
                  {
                    quarter: "Q3 2026 · Current Live Audit Window",
                    months: "Jul – Sep 2026",
                    isCurrent: true,
                    certs: certificates.filter(c => {
                      const exp = c.expiry || "";
                      return exp >= "2026-07-01" && exp <= "2026-09-30";
                    })
                  },
                  {
                    quarter: "Q4 2026 · Immediate Renewal Horizon",
                    months: "Oct – Dec 2026",
                    certs: certificates.filter(c => {
                      const exp = c.expiry || "";
                      return exp >= "2026-10-01" && exp <= "2026-12-31";
                    })
                  },
                  {
                    quarter: "Q1 2027 · Annual Filing & Labour Registers",
                    months: "Jan – Mar 2027",
                    certs: certificates.filter(c => {
                      const exp = c.expiry || "";
                      return exp >= "2027-01-01" && exp <= "2027-03-31";
                    })
                  },
                  {
                    quarter: "Long-Term Horizons (2027 – 2029 & Perpetual)",
                    months: "Multi-Year Consents & BU Permits",
                    certs: certificates.filter(c => {
                      const exp = c.expiry || "";
                      return exp > "2027-03-31";
                    })
                  }
                ].map((qGroup, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${qGroup.isCurrent ? "bg-[#0F8B7D] animate-pulse" : "bg-slate-300"}`} />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        {qGroup.quarter}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">({qGroup.months})</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full ml-auto">
                        {qGroup.certs.length} Registers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pl-5 border-l-2 border-slate-100">
                      {qGroup.certs.map((cert) => {
                        const isExpired = cert.status === "Expired";
                        const isExpiring = cert.status === "Expiring Soon";
                        const theme = getCategoryTheme(cert.category);

                        return (
                          <div
                            key={cert.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  {theme.icon} {cert.categoryLabel}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  isExpired
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : isExpiring
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                  {cert.status}
                                </span>
                              </div>

                              <h5 className="font-black text-slate-900 text-xs line-clamp-1">
                                {cert.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {cert.authority}
                              </p>

                              <div className="mt-3 p-2 rounded-xl bg-slate-50 text-[11px] space-y-1">
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-400 text-[10px]">EXPIRY:</span>
                                  <span className={`font-bold ${isExpired ? "text-rose-600" : isExpiring ? "text-amber-600" : "text-slate-900"}`}>
                                    {cert.expiry}
                                  </span>
                                </div>
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-400 text-[10px]">REG #:</span>
                                  <span className="font-bold text-slate-800">{cert.regNumber}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => setActiveCertForView(cert)}
                                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} className="text-[#0F8B7D]" /> Details
                              </button>

                              {(isExpired || isExpiring) ? (
                                <button
                                  onClick={() => handleInitiateRenewal(cert)}
                                  className="px-2.5 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw size={11} /> Renew
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle size={11} /> Compliant
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STATUTORY REGISTRY TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Statutory Regulatory Ledger ({certificates.length} Registers)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive inspection log &amp; audit history for {propertyName}
              </p>
            </div>
            <button
              onClick={handleExportAuditDossier}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Download size={13} /> Export CSV Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Statutory Register / License</th>
                  <th className="p-3.5">Regulatory Authority</th>
                  <th className="p-3.5">Registration Number</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5 text-center">Days Left</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {certificates.map((cert) => {
                  const isExpired = cert.status === "Expired";
                  const isExpiring = cert.status === "Expiring Soon";
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        <div className="text-[11px] text-slate-400">{cert.categoryLabel}</div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {cert.authority}
                      </td>

                      <td className="p-3.5 font-mono text-slate-800 font-semibold">
                        {cert.regNumber}
                      </td>

                      <td className="p-3.5 font-mono text-slate-600">
                        {cert.issueDate}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {cert.expiry}
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          cert.daysRemaining !== undefined && cert.daysRemaining < 0
                            ? "bg-rose-100 text-rose-700"
                            : cert.daysRemaining !== undefined && cert.daysRemaining <= 45
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {cert.daysRemaining !== undefined && cert.daysRemaining < 0
                            ? `${Math.abs(cert.daysRemaining)}d Overdue`
                            : `${cert.daysRemaining ?? "—"}d`}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          isExpired
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isExpiring
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : cert.status === "In Renewal"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          ● {cert.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-center pr-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveCertForView(cert)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="View Document"
                          >
                            <Eye size={12} className="text-[#0F8B7D]" /> View
                          </button>
                          {(isExpired || isExpiring) && (
                            <button
                              onClick={() => handleInitiateRenewal(cert)}
                              className="px-2.5 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={11} /> Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CATEGORY MATRIX GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === "category" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const isExpired = cert.status === "Expired";
            const isExpiring = cert.status === "Expiring Soon";
            const theme = getCategoryTheme(cert.category);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {theme.icon} {cert.categoryLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isExpired
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isExpiring
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : cert.status === "In Renewal"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {cert.status}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm group-hover:text-[#0F8B7D] transition-colors line-clamp-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Building size={12} /> {propertyName}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">AUTHORITY</span>
                      <span className="text-slate-800 font-semibold truncate max-w-[180px]">{cert.authority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">REG #</span>
                      <span className="font-mono text-slate-900 font-bold">{cert.regNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">EXPIRY DATE</span>
                      <span className={`font-bold ${isExpired ? "text-rose-600" : isExpiring ? "text-amber-600" : "text-slate-900"}`}>
                        {cert.expiry}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveCertForView(cert)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} /> Credential Details
                  </button>

                  {(isExpired || isExpiring) ? (
                    <button
                      onClick={() => handleInitiateRenewal(cert)}
                      className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Renew
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={12} /> Compliant
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: VIEW CERTIFICATE & DIGITAL CREDENTIAL */}
      {/* ========================================================================= */}
      {activeCertForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto p-6 md:p-8 animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STATUTORY CREDENTIAL</span>
                    <h2 className="text-lg font-black text-slate-900">{activeCertForView.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCertForView(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Badge & Property */}
              <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{propertyName}</span>
                  <span className="text-[11px] text-slate-500">{activeCertForView.categoryLabel}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    activeCertForView.status === "Expired"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : activeCertForView.status === "Expiring Soon"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : activeCertForView.status === "In Renewal"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  ● {activeCertForView.status}
                </span>
              </div>

              {/* Digital Certificate Document Preview Card */}
              <div className="mt-6 border-2 border-dashed border-teal-200 rounded-3xl p-6 bg-gradient-to-br from-teal-50/40 via-white to-slate-50 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[9px] font-black text-teal-800 uppercase tracking-widest block">OFFICIAL CREDENTIAL</span>
                    <p className="font-mono text-xs font-bold text-slate-900">{activeCertForView.regNumber}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    VERIFIED SECURE
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] font-bold">ISSUING AUTHORITY:</span>
                    <span className="font-bold text-slate-900 text-right">{activeCertForView.authority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] font-bold">INSPECTING OFFICER:</span>
                    <span className="font-semibold text-slate-800">{activeCertForView.inspectingOfficer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] font-bold">AUDIT CYCLE:</span>
                    <span className="font-semibold text-slate-800">{activeCertForView.inspectionCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] font-bold">VALIDITY RANGE:</span>
                    <span className="font-mono font-bold text-slate-900">{activeCertForView.issueDate} → {activeCertForView.expiry}</span>
                  </div>
                </div>

                {/* Penalty Risk Notice */}
                <div className="mt-4 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-[11px] text-rose-900">
                  <span className="font-bold block">Statutory Penalty / Default Liability:</span>
                  <p className="mt-0.5">{activeCertForView.penaltyClause}</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveCertForView(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close Drawer
              </button>

              <button
                onClick={() => {
                  const cert = activeCertForView;
                  setActiveCertForView(null);
                  handleInitiateRenewal(cert);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-teal-900/20 cursor-pointer transition-all"
              >
                <RefreshCw size={13} /> Initiate Renewal Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RENEWAL DISPATCH MODAL */}
      {/* ========================================================================= */}
      {activeCertForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0F8B7D] font-bold">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    RENEWAL WORK ORDER DISPATCH
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {activeCertForRenew.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveCertForRenew(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewalDispatch} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Current Expiry:</span>
                  <span className="text-rose-600 font-mono">{activeCertForRenew.expiry}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Issuing Authority:</span>
                  <span>{activeCertForRenew.authority}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Select Certified Auditor / OEM Vendor
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Bureau Veritas India Ltd (Class-A Auditor)">Bureau Veritas India Ltd (Class-A Auditor)</option>
                  <option value="TÜV SÜD South Asia Private Limited">TÜV SÜD South Asia Private Limited</option>
                  <option value="Ceasefire Industries Technical Services">Ceasefire Industries Technical Services</option>
                  <option value="Schindler India OEM Operations">Schindler India OEM Operations</option>
                  <option value="Gujarat State Fire Safety Empanelled Auditor">Gujarat State Fire Safety Empanelled Auditor</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Renewal Notes &amp; Expedited Instructions
                </label>
                <textarea
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCertForRenew(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black shadow-xs cursor-pointer"
                >
                  Confirm &amp; Dispatch RFP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD NEW STATUTORY CERTIFICATE */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0F8B7D] font-bold">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Upload New Statutory Certificate
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Register statutory NOC for {propertyName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Certificate / License Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Fire Safety NOC (Form B)"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Statutory Domain
                  </label>
                  <select
                    value={newCert.category}
                    onChange={(e) => {
                      const cat = e.target.value as StatutoryCertificate["category"];
                      const label = cat === "fire" ? "Fire & Life Safety" :
                                    cat === "lift" ? "Lifts & Elevators" :
                                    cat === "electrical" ? "Electrical & DG" :
                                    cat === "pcb" ? "Pollution / GPCB" :
                                    cat === "insurance" ? "Commercial Insurance" : "Municipal & Structural";
                      setNewCert({ ...newCert, category: cat, categoryLabel: label });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="fire">Fire &amp; Life Safety</option>
                    <option value="lift">Lifts &amp; Elevators</option>
                    <option value="electrical">Electrical &amp; DG</option>
                    <option value="pcb">Pollution (GPCB)</option>
                    <option value="structural">Municipal &amp; Structural</option>
                    <option value="insurance">Commercial Insurance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Registration / License # *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCert.regNumber}
                    onChange={(e) => setNewCert({ ...newCert, regNumber: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  required
                  value={newCert.authority}
                  onChange={(e) => setNewCert({ ...newCert, authority: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCert.expiry}
                    onChange={(e) => setNewCert({ ...newCert, expiry: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black shadow-xs cursor-pointer"
                >
                  Save &amp; Register Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

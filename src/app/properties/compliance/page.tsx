"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Upload, Search, CheckCircle, AlertTriangle, XCircle, Shield,
  FileText, ShieldCheck, Download, Plus, X, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Eye, RefreshCw, Filter, Check, Clock,
  Building, ExternalLink, Printer, Award, AlertCircle, ArrowUpRight,
  Building2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { StatutoryCertificate } from "@/lib/compliance-engine";

export default function ComplianceTrackerDashboard() {
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "category">("calendar");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("PROP-DG-001");
  const [certificates, setCertificates] = useState<StatutoryCertificate[]>([]);
  const [health, setHealth] = useState<any>({
    score: 86,
    total: 14,
    valid: 9,
    expiringSoon: 3,
    expired: 2,
    inRenewal: 0
  });
  const [propertyName, setPropertyName] = useState<string>("Devasya Gold");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Calendar Navigation State (Default to September 2026)
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // 0-indexed: 8 = September
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<number | null>(15);

  // Modals & Drawers
  const [activeCertForView, setActiveCertForView] = useState<StatutoryCertificate | null>(null);
  const [activeCertForRenew, setActiveCertForRenew] = useState<StatutoryCertificate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Notification Toggles & Escalation
  const [notify30, setNotify30] = useState(true);
  const [autoEscalate15, setAutoEscalate15] = useState(true);
  const [leadTimeDays, setLeadTimeDays] = useState(60);
  const [subject, setSubject] = useState("[ACTION REQUIRED] Statutory License Expiring: {{LicenseName}} at {{Property}}");
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
  }, [fetchCertificates]);

  // Calendar Helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // Shift so Monday is index 0

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleGoToCurrent = () => {
    setCalendarYear(2026);
    setCalendarMonth(8); // Sep 2026
    showToast("Switched calendar view to September 2026 (Live Audit Period)");
  };

  // Find certificates for a specific day in the active calendar month
  const getCertsForDay = (day: number) => {
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
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-16">
      {/* Toast Notification */}
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Statutory Compliance &amp; NOC Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black uppercase tracking-wider">
                ● Live Statutory Vault · {propertyName}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Audit-grade tracking of Fire NOC, Lift Inspectorate, CEIG electrical, GPCB pollution consents &amp; building BU certificates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchCertificates}
            disabled={isLoading}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-[#0F8B7D]" : ""} />
          </button>
          <button
            onClick={handleExportAuditDossier}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Download size={14} /> Export Audit Dossier
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Upload size={14} /> Upload Certificate
          </button>
        </div>
      </div>

      {/* Institutional KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">STATUTORY REGISTERS</span>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{health.total}</p>
          <span className="text-[10px] text-gray-500 font-medium">{propertyName} · Commercial</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">VALID &amp; COMPLIANT</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{health.valid}</p>
          <span className="text-[10px] text-emerald-700 font-bold">● Fully Inspected &amp; Certified</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EXPIRING (&lt;45 DAYS)</span>
          <p className="text-2xl font-black text-amber-500 mt-0.5">{health.expiringSoon}</p>
          <span className="text-[10px] text-amber-600 font-bold">Renewal Notice Window</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EXPIRED / AUDIT DUE</span>
          <p className="text-2xl font-black text-red-500 mt-0.5">{health.expired}</p>
          <span className="text-[10px] text-red-600 font-bold">Penalty Risk Active</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs col-span-2 md:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">COMPLIANCE HEALTH</span>
            <p className="text-2xl font-black text-[#0F8B7D] mt-0.5">{health.score}%</p>
            <span className="text-[10px] text-teal-700 font-bold">Grade-A Rating</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D]">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Main Controls: View Switcher & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
        {/* View Switcher Toggle */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 text-xs font-bold">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "calendar"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon size={13} />
            <span>Visual Calendar</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText size={13} />
            <span>Statutory Table</span>
          </button>

          <button
            onClick={() => setViewMode("category")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "category"
                ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield size={13} />
            <span>Category Matrix</span>
          </button>
        </div>

        {/* Search & Property Indicator */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 w-full sm:w-72">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NOC, authority, or reg #..."
              className="w-full text-xs bg-transparent border-none outline-none text-gray-800"
            />
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 font-bold text-teal-800 text-xs flex items-center gap-1.5">
            <Building2 size={13} className="text-[#0F8B7D]" />
            <span>{propertyName} (Nikol, Ahmedabad)</span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
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
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-teal-900 text-white shadow-xs font-black"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === cat.id ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE VISUAL MONTH CALENDAR VIEW */}
      {/* ========================================================================= */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          {/* Calendar Header Nav */}
          <div className="flex flex-wrap items-center justify-between p-4 px-6 border-b border-gray-200 bg-gray-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D]">
                <CalendarIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  {monthNames[calendarMonth]} {calendarYear}
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  Statutory deadlines, municipal inspections &amp; license expirations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToCurrent}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-2xs cursor-pointer"
              >
                Today (Audit Period)
              </button>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-50 text-gray-600 border-r border-gray-100 cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Weekday Names */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/90 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center py-2.5">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div className="text-rose-500">SUN</div>
          </div>

          {/* Calendar Day Matrix Grid */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-[1px]">
            {/* Blank offset days */}
            {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-gray-50/40 min-h-[100px] p-2 text-gray-300 text-xs font-medium">
                {/* Empty */}
              </div>
            ))}

            {/* Real Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const certsOnDay = getCertsForDay(day);
              const hasEvents = certsOnDay.length > 0;
              const isToday = calendarYear === 2026 && calendarMonth === 8 && day === 16; // Sep 16, 2026

              return (
                <div
                  key={`day-${day}`}
                  className={`bg-white min-h-[110px] p-2 transition-all flex flex-col justify-between ${
                    hasEvents ? "hover:bg-teal-50/30 cursor-pointer" : ""
                  } ${isToday ? "bg-teal-50/40 ring-1 ring-inset ring-[#0F8B7D]" : ""}`}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDateForDrawer(day);
                      setActiveCertForView(certsOnDay[0]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday
                          ? "bg-[#0F8B7D] text-white font-black"
                          : hasEvents
                          ? "text-gray-900 bg-gray-100"
                          : "text-gray-400"
                      }`}
                    >
                      {day}
                    </span>

                    {hasEvents && (
                      <span className="text-[9px] font-black text-teal-800 bg-teal-100/90 px-1.5 py-0.5 rounded-full">
                        {certsOnDay.length} {certsOnDay.length === 1 ? "NOC" : "Events"}
                      </span>
                    )}
                  </div>

                  {/* Badges on this day */}
                  <div className="space-y-1 mt-1.5">
                    {certsOnDay.slice(0, 2).map((cert) => {
                      const isExpired = cert.status === "Expired";
                      const isExpiring = cert.status === "Expiring Soon";
                      return (
                        <div
                          key={cert.id}
                          className={`p-1 rounded-md text-[10px] font-bold border truncate flex items-center gap-1 ${
                            isExpired
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isExpiring
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                          <span className="truncate">{cert.name}</span>
                        </div>
                      );
                    })}
                    {certsOnDay.length > 2 && (
                      <span className="text-[9px] text-gray-400 font-bold block text-right">
                        +{certsOnDay.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STATUTORY REGISTRY TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/95 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Statutory Register / License</th>
                  <th className="p-3.5">Regulatory Authority</th>
                  <th className="p-3.5">Registration Number</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5 text-center">Days Left</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {certificates.map((cert) => {
                  const isExpired = cert.status === "Expired";
                  const isExpiring = cert.status === "Expiring Soon";
                  return (
                    <tr key={cert.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{cert.name}</div>
                        <div className="text-[11px] text-gray-400">{cert.categoryLabel}</div>
                      </td>

                      <td className="p-3.5 font-medium text-gray-700">
                        {cert.authority}
                      </td>

                      <td className="p-3.5 font-mono text-gray-800 font-semibold">
                        {cert.regNumber}
                      </td>

                      <td className="p-3.5 font-mono text-gray-600">
                        {cert.issueDate}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-gray-900">
                        {cert.expiry}
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          cert.daysRemaining !== undefined && cert.daysRemaining < 0
                            ? "bg-red-100 text-red-700"
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
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isExpiring
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : cert.status === "In Renewal"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          ● {cert.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveCertForView(cert)}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
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
            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {cert.categoryLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      isExpired
                        ? "bg-red-50 text-red-700"
                        : isExpiring
                        ? "bg-amber-50 text-amber-800"
                        : cert.status === "In Renewal"
                        ? "bg-blue-50 text-blue-800"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {cert.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0F8B7D] transition-colors line-clamp-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Building size={12} /> {propertyName}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">AUTHORITY</span>
                      <span className="text-gray-800 font-semibold">{cert.authority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">REG #</span>
                      <span className="font-mono text-gray-900 font-bold">{cert.regNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">EXPIRY DATE</span>
                      <span className={`font-bold ${isExpired ? "text-red-600" : isExpiring ? "text-amber-600" : "text-gray-900"}`}>
                        {cert.expiry}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveCertForView(cert)}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} /> Certificate Details
                  </button>

                  {(isExpired || isExpiring) ? (
                    <button
                      onClick={() => handleInitiateRenewal(cert)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
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
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">STATUTORY CREDENTIAL</span>
                    <h2 className="text-lg font-black text-gray-900">{activeCertForView.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCertForView(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Badge & Property */}
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">{propertyName}</span>
                  <span className="text-[11px] text-gray-500">{activeCertForView.categoryLabel}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    activeCertForView.status === "Expired"
                      ? "bg-red-50 text-red-700 border-red-200"
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
              <div className="mt-6 border-2 border-dashed border-teal-200 rounded-2xl p-6 bg-gradient-to-br from-teal-50/40 via-white to-gray-50 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                  <div>
                    <span className="text-[9px] font-black text-teal-800 uppercase tracking-widest block">OFFICIAL CREDENTIAL</span>
                    <p className="font-mono text-xs font-bold text-gray-900">{activeCertForView.regNumber}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 shadow-2xs">
                    VERIFIED SECURE
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold">ISSUING AUTHORITY:</span>
                    <span className="font-bold text-gray-900 text-right">{activeCertForView.authority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold">INSPECTING OFFICER:</span>
                    <span className="font-semibold text-gray-800">{activeCertForView.inspectingOfficer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold">AUDIT CYCLE:</span>
                    <span className="font-semibold text-gray-800">{activeCertForView.inspectionCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold">VALIDITY RANGE:</span>
                    <span className="font-mono font-bold text-gray-900">{activeCertForView.issueDate} → {activeCertForView.expiry}</span>
                  </div>
                </div>

                {/* Penalty Risk Notice */}
                <div className="mt-4 p-3 rounded-xl bg-red-50/70 border border-red-200 text-[11px] text-red-800">
                  <span className="font-bold block">Statutory Penalty / Default Liability:</span>
                  <p className="mt-0.5">{activeCertForView.penaltyClause}</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveCertForView(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Close Drawer
              </button>

              <button
                onClick={() => {
                  const cert = activeCertForView;
                  setActiveCertForView(null);
                  handleInitiateRenewal(cert);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
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
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    RENEWAL WORK ORDER DISPATCH
                  </span>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">
                    {activeCertForRenew.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveCertForRenew(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewalDispatch} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Current Expiry:</span>
                  <span className="text-red-600 font-mono">{activeCertForRenew.expiry}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Issuing Authority:</span>
                  <span>{activeCertForRenew.authority}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Select Certified Auditor / OEM Vendor
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Bureau Veritas India Ltd (Class-A Auditor)">Bureau Veritas India Ltd (Class-A Auditor)</option>
                  <option value="TÜV SÜD South Asia Private Limited">TÜV SÜD South Asia Private Limited</option>
                  <option value="Ceasefire Industries Technical Services">Ceasefire Industries Technical Services</option>
                  <option value="Schindler India OEM Operations">Schindler India OEM Operations</option>
                  <option value="Gujarat State Fire Safety Empanelled Auditor">Gujarat State Fire Safety Empanelled Auditor</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Renewal Notes &amp; Expedited Instructions
                </label>
                <textarea
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCertForRenew(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-xs cursor-pointer"
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
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">
                    Upload New Statutory Certificate
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Register statutory NOC for {propertyName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Certificate / License Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Fire Safety NOC (Form B)"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
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
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
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
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Registration / License # *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCert.regNumber}
                    onChange={(e) => setNewCert({ ...newCert, regNumber: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  required
                  value={newCert.authority}
                  onChange={(e) => setNewCert({ ...newCert, authority: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCert.expiry}
                    onChange={(e) => setNewCert({ ...newCert, expiry: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save &amp; Register Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

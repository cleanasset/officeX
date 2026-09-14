"use client";

import React, { useState } from "react";
import {
  Upload, Search, CheckCircle, AlertTriangle, XCircle, Shield,
  FileText, ShieldCheck, Download, Plus, X, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Eye, RefreshCw, Filter, Check, Clock,
  Building, ExternalLink, Printer, Award, AlertCircle, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface Certificate {
  id: string;
  name: string;
  category: "fire" | "lift" | "peso" | "pcb" | "insurance" | "structural";
  categoryLabel: string;
  property: string;
  authority: string;
  regNumber: string;
  issueDate: string;
  expiry: string;
  expiryDateObj: string; // YYYY-MM-DD for calendar mapping
  daysRemaining: number;
  status: "Valid" | "Expiring Soon" | "Expired" | "In Renewal";
  inspectingOfficer: string;
  inspectionCycle: string;
  penaltyClause: string;
  documentUrl?: string;
}

export default function ComplianceTrackerDashboard() {
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "category">("calendar");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  
  // Calendar Navigation State (Default to September 2026)
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // 0-indexed: 8 = September
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<number | null>(12);

  // Modals & Drawers
  const [activeCertForView, setActiveCertForView] = useState<Certificate | null>(null);
  const [activeCertForRenew, setActiveCertForRenew] = useState<Certificate | null>(null);
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
  const [targetRenewalDate, setTargetRenewalDate] = useState("2026-10-15");
  const [renewalNotes, setRenewalNotes] = useState("Expedited renewal required before municipal audit.");

  // Upload Form State
  const [newCert, setNewCert] = useState({
    name: "",
    category: "fire" as Certificate["category"],
    property: "One BKC (Apex Tower)",
    authority: "Mumbai Fire Brigade (CFO)",
    regNumber: "MH-FB-2026-9812",
    issueDate: "2025-10-01",
    expiry: "2026-09-30",
    inspectingOfficer: "Chief Fire Officer, Region 4",
    inspectionCycle: "Annual",
    penaltyClause: "₹50,000 fine & temporary seal under Sec 8 Fire Act"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Master Certificates Data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "CERT-001",
      name: "Fire Safety NOC & Hydrant Clearance",
      category: "fire",
      categoryLabel: "Fire & Life Safety",
      property: "One BKC (Apex Tower)",
      authority: "Mumbai Fire Brigade (CFO)",
      regNumber: "MH-FB-NOC-44910",
      issueDate: "13-Sep-2025",
      expiry: "12-Sep-2026",
      expiryDateObj: "2026-09-12",
      daysRemaining: -2,
      status: "Expired",
      inspectingOfficer: "Er. Ramesh Kulkarni, Dy CFO",
      inspectionCycle: "Annual Mandatory",
      penaltyClause: "Notice under Sec 8 Fire Safety Act + ₹50,000 fine",
      documentUrl: "FIRE_NOC_ONE_BKC_2025.pdf"
    },
    {
      id: "CERT-002",
      name: "Passenger Elevator Fitness & Wire Rope Test",
      category: "lift",
      categoryLabel: "Lifts & Escalators",
      property: "One BKC (Apex Tower)",
      authority: "PWD Electrical Inspectorate (Govt of Maharashtra)",
      regNumber: "PWD-LFT-MUM-8821",
      issueDate: "02-Jan-2026",
      expiry: "01-Jan-2027",
      expiryDateObj: "2026-10-25",
      daysRemaining: 41,
      status: "Expiring Soon",
      inspectingOfficer: "S. V. Patil, Senior Inspector",
      inspectionCycle: "Half-Yearly Mandatory",
      penaltyClause: "Immediate suspension of Bank 2 Lifts",
      documentUrl: "LIFT_FITNESS_APEX_2026.pdf"
    },
    {
      id: "CERT-003",
      name: "PESO Diesel Storage & Class-B Fuel License",
      category: "peso",
      categoryLabel: "Petroleum & Explosives (DG Fuel)",
      property: "Maker Maxity Mumbai",
      authority: "Petroleum and Explosives Safety Organisation (PESO)",
      regNumber: "PESO-DL-WZ-55901",
      issueDate: "16-Jul-2023",
      expiry: "15-Jul-2026",
      expiryDateObj: "2026-09-15",
      daysRemaining: 1,
      status: "Expiring Soon",
      inspectingOfficer: "Controller of Explosives, West Circle",
      inspectionCycle: "Triennial (3-Year)",
      penaltyClause: "Immediate closure of 1,500 kVA DG Fuel Substation",
      documentUrl: "PESO_DIESEL_MAKER_2023.pdf"
    },
    {
      id: "CERT-004",
      name: "MPCB Consent to Operate (Air & Water Pollution)",
      category: "pcb",
      categoryLabel: "Pollution Control (STP & DG)",
      property: "Godrej BKC Horizon",
      authority: "Maharashtra Pollution Control Board (MPCB)",
      regNumber: "MPCB-RO-MUM-CTO-1029",
      issueDate: "01-Dec-2023",
      expiry: "30-Nov-2026",
      expiryDateObj: "2026-11-30",
      daysRemaining: 77,
      status: "Valid",
      inspectingOfficer: "Regional Officer - Bandra Kurla",
      inspectionCycle: "3-Year Renewal",
      penaltyClause: "Utility disconnection notice under Water Act 1974",
      documentUrl: "MPCB_CONSENT_GODREJ_2023.pdf"
    },
    {
      id: "CERT-005",
      name: "Commercial Building All-Risk Insurance & Terror Cover",
      category: "insurance",
      categoryLabel: "Comprehensive Insurance",
      property: "One BKC (Apex Tower)",
      authority: "HDFC ERGO General Insurance Co.",
      regNumber: "POL-CRE-HDFC-992011",
      issueDate: "23-Aug-2025",
      expiry: "22-Aug-2026",
      expiryDateObj: "2026-09-22",
      daysRemaining: 8,
      status: "Expiring Soon",
      inspectingOfficer: "Lead Underwriter: Commercial Property Div",
      inspectionCycle: "Annual Policy",
      penaltyClause: "Mortgage default clause with Senior Lender",
      documentUrl: "HDFC_INSURANCE_ONE_BKC.pdf"
    },
    {
      id: "CERT-006",
      name: "Structural Stability & Wind Load Certification",
      category: "structural",
      categoryLabel: "Structural Engineering",
      property: "Maker Maxity Mumbai",
      authority: "Municipal Corporation of Greater Mumbai (MCGM)",
      regNumber: "MCGM-STR-AUD-3301",
      issueDate: "10-May-2024",
      expiry: "09-May-2029",
      expiryDateObj: "2026-09-28",
      daysRemaining: 14,
      status: "Valid",
      inspectingOfficer: "Chartered Structural Engineer V. Deshmukh",
      inspectionCycle: "5-Year Audit",
      penaltyClause: "Building declared non-habitable under MMC Act Sec 354",
      documentUrl: "STRUCTURAL_AUDIT_MAKER_2024.pdf"
    },
    {
      id: "CERT-007",
      name: "Chilled Water Plant Pressure Vessel Clearance",
      category: "structural",
      categoryLabel: "Pressure Vessels & HVAC",
      property: "One BKC (Apex Tower)",
      authority: "Directorate of Industrial Safety & Health (DISH)",
      regNumber: "DISH-PV-HVAC-7712",
      issueDate: "15-Sep-2025",
      expiry: "14-Sep-2026",
      expiryDateObj: "2026-09-14",
      daysRemaining: 0,
      status: "Expiring Soon",
      inspectingOfficer: "Chief Inspector of Boilers & Pressure Vessels",
      inspectionCycle: "Annual",
      penaltyClause: "Mandatory shutdown of 3 x 400 TR chillers",
      documentUrl: "HVAC_VESSEL_APEX_2025.pdf"
    }
  ]);

  // Calendar Helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  // Shift so Monday is index 0
  const adjustedFirstDay = (firstDayIndex + 6) % 7;

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
    showToast("Reset calendar view to September 2026 (Audit Period)");
  };

  // Find certificates for a specific day in the active calendar month
  const getCertsForDay = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = calendarMonth + 1 < 10 ? `0${calendarMonth + 1}` : `${calendarMonth + 1}`;
    const targetDateStr = `${calendarYear}-${formattedMonth}-${formattedDay}`;
    return certificates.filter(c => c.expiryDateObj === targetDateStr);
  };

  // Renewal Handler
  const handleInitiateRenewal = (cert: Certificate) => {
    setActiveCertForRenew(cert);
  };

  const handleConfirmRenewalDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCertForRenew) return;

    setCertificates(prev => prev.map(c => {
      if (c.id === activeCertForRenew.id) {
        return {
          ...c,
          status: "In Renewal",
          daysRemaining: 45,
          expiry: "15-Dec-2027",
          expiryDateObj: "2027-12-15",
          inspectingOfficer: selectedVendor
        };
      }
      return c;
    }));

    showToast(`Work Order #RFP-${Math.floor(10000 + Math.random() * 90000)} dispatched to ${selectedVendor}! Status updated to "In Renewal".`);
    setActiveCertForRenew(null);
  };

  // Upload New Certificate Handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name.trim()) {
      showToast("Please provide certificate name.");
      return;
    }

    const created: Certificate = {
      id: `CERT-00${certificates.length + 1}`,
      name: newCert.name,
      category: newCert.category,
      categoryLabel: newCert.category === "fire" ? "Fire & Life Safety" :
                     newCert.category === "lift" ? "Lifts & Escalators" :
                     newCert.category === "peso" ? "Petroleum & DG" :
                     newCert.category === "pcb" ? "Pollution Control" :
                     newCert.category === "insurance" ? "Insurance" : "Structural",
      property: newCert.property,
      authority: newCert.authority,
      regNumber: newCert.regNumber,
      issueDate: newCert.issueDate,
      expiry: newCert.expiry,
      expiryDateObj: newCert.expiry,
      daysRemaining: 365,
      status: "Valid",
      inspectingOfficer: newCert.inspectingOfficer,
      inspectionCycle: newCert.inspectionCycle,
      penaltyClause: newCert.penaltyClause,
      documentUrl: `${newCert.name.replace(/\s+/g, "_").toUpperCase()}.pdf`
    };

    setCertificates([created, ...certificates]);
    setShowUploadModal(false);
    showToast(`Successfully registered ${newCert.name} in Compliance Ledger!`);
  };

  // Quick stats
  const totalCount = certificates.length;
  const validCount = certificates.filter(c => c.status === "Valid").length;
  const expiringCount = certificates.filter(c => c.status === "Expiring Soon").length;
  const expiredCount = certificates.filter(c => c.status === "Expired").length;
  const inRenewalCount = certificates.filter(c => c.status === "In Renewal").length;
  const complianceScore = Math.round(((validCount + inRenewalCount) / totalCount) * 100);

  // Filtered Certificates
  const filteredCertificates = certificates.filter(c => {
    const matchCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchProperty = selectedProperty === "all" || c.property.toLowerCase().includes(selectedProperty.toLowerCase());
    const matchSearch = !searchQuery.trim() || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchProperty && matchSearch;
  });

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Statutory Compliance &amp; NOC Calendar</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black uppercase tracking-wider">
              Legal &amp; Regulatory Command
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit-grade tracking of Fire NOC, Lift Fitness, PESO, MPCB consents, and mandatory building certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Exporting compliance audit summary PDF...")}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Download size={14} /> Export Audit Dossier
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Upload size={14} /> Upload New Certificate
          </button>
        </div>
      </div>

      {/* Institutional KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL LICENSES</span>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{totalCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Across 3 Commercial Campuses</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">VALID &amp; COMPLIANT</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{validCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">● Fully Inspected &amp; Certified</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EXPIRING (&lt;60 DAYS)</span>
          <p className="text-2xl font-black text-amber-500 mt-0.5">{expiringCount}</p>
          <span className="text-[10px] text-amber-600 font-bold">Actionable Renewal Window</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EXPIRED / OVERDUE</span>
          <p className="text-2xl font-black text-red-500 mt-0.5">{expiredCount}</p>
          <span className="text-[10px] text-red-600 font-bold">Penalty Risk Active</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs col-span-2 md:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">COMPLIANCE SCORE</span>
            <p className="text-2xl font-black text-[#0F8B7D] mt-0.5">{complianceScore}%</p>
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
            <span>Registry Table</span>
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
            <span>By Statutory Category</span>
          </button>
        </div>

        {/* Search & Property Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 w-full sm:w-64">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NOC, authority, or reg #..."
              className="w-full text-xs bg-transparent border-none outline-none text-gray-800"
            />
          </div>

          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 text-xs focus:outline-none focus:border-[#0F8B7D]"
          >
            <option value="all">All Properties</option>
            <option value="One BKC">One BKC (Apex)</option>
            <option value="Maker Maxity">Maker Maxity</option>
            <option value="Godrej BKC">Godrej BKC Horizon</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        {[
          { id: "all", label: "All Regulations", count: totalCount },
          { id: "fire", label: "🔥 Fire & Life Safety", count: certificates.filter(c => c.category === "fire").length },
          { id: "lift", label: "🛗 Lifts & Elevators", count: certificates.filter(c => c.category === "lift").length },
          { id: "peso", label: "⚡ DG Fuel / PESO", count: certificates.filter(c => c.category === "peso").length },
          { id: "pcb", label: "🌿 Pollution / MPCB", count: certificates.filter(c => c.category === "pcb").length },
          { id: "insurance", label: "🛡️ Comprehensive Insurance", count: certificates.filter(c => c.category === "insurance").length },
          { id: "structural", label: "🏢 Structural & HVAC", count: certificates.filter(c => c.category === "structural").length }
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
      {/* VIEW 1: INTERACTIVE VISUAL MONTH CALENDAR VIEW (Requested by Client) */}
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
                  Statutory deadlines, inspections, and renewal expirations
                </p>
              </div>
            </div>

            {/* Month & Legend Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Color Code Legend */}
              <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-gray-500 mr-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expired / Due Now
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expiring &lt;60d
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Valid
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Renewal
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleGoToCurrent}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Current (Sep &apos;26)
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center py-2.5">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-teal-700">Sat</div>
            <div className="text-teal-700">Sun</div>
          </div>

          {/* 7-Column Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 bg-gray-50/20">
            {/* Blank leading slots */}
            {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[110px] p-2 bg-gray-50/60 opacity-40" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dayCerts = getCertsForDay(dayNumber);
              const isToday = calendarYear === 2026 && calendarMonth === 8 && dayNumber === 14; // Sep 14, 2026 is audit date
              const isSelected = selectedDateForDrawer === dayNumber;

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => {
                    setSelectedDateForDrawer(dayNumber);
                    if (dayCerts.length > 0) {
                      setActiveCertForView(dayCerts[0]);
                    }
                  }}
                  className={`min-h-[110px] p-2 transition-all cursor-pointer flex flex-col justify-between hover:bg-teal-50/30 ${
                    isSelected ? "bg-teal-50/40 ring-1 ring-inset ring-[#0F8B7D]" : ""
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-[#0F8B7D] text-white shadow-xs"
                          : dayCerts.length > 0
                          ? "text-gray-900 font-black"
                          : "text-gray-500"
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayCerts.length > 0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gray-900 text-white">
                        {dayCerts.length} Event{dayCerts.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Day Events Chips */}
                  <div className="space-y-1 my-1 flex-1">
                    {dayCerts.map((cert) => {
                      const isExpired = cert.status === "Expired";
                      const isExpiring = cert.status === "Expiring Soon";
                      const isRenewal = cert.status === "In Renewal";

                      return (
                        <div
                          key={cert.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCertForView(cert);
                          }}
                          className={`text-[10px] p-1.5 rounded-lg border font-semibold truncate transition-transform hover:scale-[1.02] shadow-2xs ${
                            isExpired
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : isExpiring
                              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                              : isRenewal
                              ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={`${cert.name} - ${cert.property} (${cert.status})`}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isExpired ? "bg-red-500" : isExpiring ? "bg-amber-500" : isRenewal ? "bg-blue-500" : "bg-emerald-500"
                              }`}
                            />
                            <span className="font-bold truncate">{cert.name}</span>
                          </div>
                          <div className="text-[9px] text-gray-500 truncate pl-2.5">
                            {cert.property.split(" ")[0]} · {cert.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state hint */}
                  {dayCerts.length === 0 && (
                    <div className="text-[9px] text-gray-300 font-medium self-end">
                      No statutory events
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: REGISTRY TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">CERTIFICATE &amp; CATEGORY</th>
                  <th className="py-3 px-4">CAMPUS / PROPERTY</th>
                  <th className="py-3 px-4">REGISTRATION / AUTHORITY</th>
                  <th className="py-3 px-4">VALIDITY &amp; EXPIRY</th>
                  <th className="py-3 px-4">TIMELINE</th>
                  <th className="py-3 px-4">COMPLIANCE STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredCertificates.map((cert) => {
                  const isExpired = cert.status === "Expired";
                  const isExpiring = cert.status === "Expiring Soon";
                  const isRenewal = cert.status === "In Renewal";

                  return (
                    <tr key={cert.id} className="hover:bg-teal-50/20 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 group-hover:bg-teal-50 group-hover:text-[#0F8B7D]">
                            <FileText size={14} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-[#0F8B7D]">{cert.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{cert.categoryLabel}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {cert.property}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-gray-800 block">{cert.regNumber}</span>
                        <span className="text-[10px] text-gray-400">{cert.authority}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">{cert.expiry}</span>
                        <span className="text-[10px] text-gray-400">Issued: {cert.issueDate}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        {isExpired ? (
                          <span className="text-red-600">Overdue (Expired)</span>
                        ) : isExpiring ? (
                          <span className="text-amber-600">{cert.daysRemaining} days left</span>
                        ) : isRenewal ? (
                          <span className="text-blue-600">Under Process</span>
                        ) : (
                          <span className="text-gray-600">{cert.daysRemaining} days left</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isExpired
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isExpiring
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isRenewal
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          ● {cert.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveCertForView(cert)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} /> View Cert
                          </button>

                          {(isExpired || isExpiring) && (
                            <button
                              onClick={() => handleInitiateRenewal(cert)}
                              className="px-3 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <RefreshCw size={12} /> Renew Now
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
      {/* VIEW 3: BY CATEGORY GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === "category" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => {
            const isExpired = cert.status === "Expired";
            const isExpiring = cert.status === "Expiring Soon";
            const isRenewal = cert.status === "In Renewal";

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {cert.categoryLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isExpired
                          ? "bg-red-50 text-red-700 border-red-200"
                          : isExpiring
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : isRenewal
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0F8B7D] transition-colors line-clamp-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Building size={12} /> {cert.property}
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

      {/* Automated Alert Escalations & Email Notification Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Card 1: Escalation Rules */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900">Automated Alert Escalations</h2>
            <span className="text-[10px] font-bold bg-teal-50 text-[#0F8B7D] px-2 py-0.5 rounded-full border border-teal-100">
              Active Daemon
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700">&ldquo;Expiring Soon&rdquo; Flag Lead Time</span>
              <span className="text-[#0F8B7D] font-black">{leadTimeDays} Days in Advance</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full accent-[#0F8B7D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>15 Days</span>
              <span>45 Days</span>
              <span>90 Days</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-900">Daily alerts to Property Manager at 30 days</p>
                <p className="text-[10px] text-gray-400">Automated push &amp; email notifications on pending renewal</p>
              </div>
              <input
                type="checkbox"
                checked={notify30}
                onChange={(e) => setNotify30(e.target.checked)}
                className="w-4 h-4 accent-[#0F8B7D] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-900">Auto-escalate to VP Real Estate &amp; Legal at 15 days</p>
                <p className="text-[10px] text-gray-400">High-priority warning flag with municipal penalty calculation</p>
              </div>
              <input
                type="checkbox"
                checked={autoEscalate15}
                onChange={(e) => setAutoEscalate15(e.target.checked)}
                className="w-4 h-4 accent-[#0F8B7D] cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>Strict Statutory Enforcement:</b> Any certificate past its expiration automatically locks property subletting clearance until municipal inspector re-certification is uploaded.
            </p>
          </div>
        </div>

        {/* Card 2: Legal Email Template Editor */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-900">Statutory Notice Template</h2>
              <button
                onClick={() => showToast("Previewing email template with live placeholders...")}
                className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer"
              >
                Test Preview
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                SYSTEM SUBJECT HEADER
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-500">Notice Body with System Variables</span>
                <span className="font-mono text-[10px] bg-teal-50 text-[#0F8B7D] px-2 py-0.5 rounded font-bold">
                  &#123;&#123;LicenseName&#125;&#125; &#123;&#123;Authority&#125;&#125;
                </span>
              </div>
              <textarea
                defaultValue={`NOTICE OF STATUTORY EXPIRATION\n\nDear FM Operations Team,\n\nPlease note that statutory certificate {{LicenseName}} for property {{Property}} registered under {{RegistrationNo}} will expire in {{DaysRemaining}} days on {{ExpiryDate}}.\n\nMandatory action is required to schedule vendor inspection via OfficeX FM Marketplace to prevent regulatory seal.\n\nBest regards,\nOfficeX Statutory Compliance Engine`}
                className="w-full p-3 text-xs text-gray-700 resize-none h-28 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => showToast("Escalation template configuration saved!")}
              className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Save Escalation Settings
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW CERTIFICATE & DOCUMENT LOCKER DRAWER */}
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
                  <span className="text-xs font-bold text-gray-800 block">{activeCertForView.property}</span>
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

              {/* Simulated High-Res Digital Certificate */}
              <div className="mt-6 border-2 border-dashed border-teal-200 rounded-2xl p-6 bg-gradient-to-br from-teal-50/40 via-white to-gray-50 relative overflow-hidden shadow-xs">
                {/* Government Watermark / Seal Simulation */}
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <Award size={120} />
                </div>

                <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                  <div>
                    <span className="text-[9px] font-black text-teal-800 uppercase tracking-widest block">OFFICIAL CERTIFICATE</span>
                    <p className="font-mono text-xs font-bold text-gray-900">{activeCertForView.regNumber}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 shadow-2xs">
                    VERIFIED QR SECURE
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

                {/* Non-compliance risk */}
                <div className="mt-4 p-3 rounded-xl bg-red-50/70 border border-red-200 text-[11px] text-red-800">
                  <span className="font-bold block">Penalty Clause / Default Liability:</span>
                  <p className="mt-0.5">{activeCertForView.penaltyClause}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button
                  onClick={() => showToast(`Downloaded verified copy of ${activeCertForView.documentUrl}`)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => showToast("Sent verification link to municipal officer portal.")}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ExternalLink size={13} /> Verify on Gov Portal
                </button>
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
      {/* MODAL 2: 1-CLICK RENEWAL DISPATCH TO FM MARKETPLACE (Requested by Client) */}
      {/* ========================================================================= */}
      {activeCertForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-teal-300" />
                <h3 className="font-bold text-sm">Initiate Statutory Renewal RFP</h3>
              </div>
              <button
                onClick={() => setActiveCertForRenew(null)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewalDispatch} className="p-6 space-y-4">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs">
                <span className="font-bold text-teal-950 block">{activeCertForRenew.name}</span>
                <span className="text-teal-700 text-[11px]">{activeCertForRenew.property} · Current Status: {activeCertForRenew.status}</span>
              </div>

              {/* Renewal Channel */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  RENEWAL CHANNEL
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRenewalType("marketplace")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                      renewalType === "marketplace"
                        ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🏢 FM Marketplace Dispatch
                    <span className="block text-[10px] font-normal text-gray-400 mt-0.5">Authorized Tier-1 Vendor RFP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalType("self")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                      renewalType === "self"
                        ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🏛️ Direct Gov Filing
                    <span className="block text-[10px] font-normal text-gray-400 mt-0.5">In-house legal team submission</span>
                  </button>
                </div>
              </div>

              {/* Selected Auditor / Vendor */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  ASSIGNED CERTIFYING AGENCY
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Bureau Veritas India Ltd (Class-A Auditor)">Bureau Veritas India Ltd (Class-A Auditor)</option>
                  <option value="TÜV SÜD South Asia (Govt Accredited)">TÜV SÜD South Asia (Govt Accredited)</option>
                  <option value="SGS India Statutory Inspection Div">SGS India Statutory Inspection Div</option>
                  <option value="State Municipal Fire & Safety Liaison Office">State Municipal Fire &amp; Safety Liaison Office</option>
                </select>
              </div>

              {/* Target Date */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  TARGET INSPECTION DATE
                </label>
                <input
                  type="date"
                  value={targetRenewalDate}
                  onChange={(e) => setTargetRenewalDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {/* Scope notes */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  INSPECTION NOTES &amp; COMPLIANCE SCOPE
                </label>
                <textarea
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-700 resize-none h-18 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveCertForRenew(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Confirm &amp; Dispatch RFP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD NEW COMPLIANCE CERTIFICATE */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-teal-300" />
                <h3 className="font-bold text-sm">Register New Statutory Certificate</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  CERTIFICATE / NOC NAME *
                </label>
                <input
                  required
                  placeholder="e.g. DG Set Noise & Emission Clearance"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    STATUTORY CATEGORY
                  </label>
                  <select
                    value={newCert.category}
                    onChange={(e) => setNewCert({ ...newCert, category: e.target.value as Certificate["category"] })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="fire">Fire &amp; Life Safety</option>
                    <option value="lift">Lifts &amp; Escalators</option>
                    <option value="peso">Petroleum &amp; DG Fuel (PESO)</option>
                    <option value="pcb">Pollution Control (MPCB)</option>
                    <option value="insurance">Comprehensive Insurance</option>
                    <option value="structural">Structural &amp; HVAC</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    CAMPUS / PROPERTY
                  </label>
                  <select
                    value={newCert.property}
                    onChange={(e) => setNewCert({ ...newCert, property: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="One BKC (Apex Tower)">One BKC (Apex Tower)</option>
                    <option value="Maker Maxity Mumbai">Maker Maxity Mumbai</option>
                    <option value="Godrej BKC Horizon">Godrej BKC Horizon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    REGISTRATION / LICENSE NO.
                  </label>
                  <input
                    value={newCert.regNumber}
                    onChange={(e) => setNewCert({ ...newCert, regNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    ISSUING AUTHORITY
                  </label>
                  <input
                    value={newCert.authority}
                    onChange={(e) => setNewCert({ ...newCert, authority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    ISSUE DATE
                  </label>
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    EXPIRY DATE *
                  </label>
                  <input
                    required
                    type="date"
                    value={newCert.expiry}
                    onChange={(e) => setNewCert({ ...newCert, expiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              {/* Upload Certificate File Simulation */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  ATTACH ATTESTED PDF / SCAN
                </label>
                <div className="border border-dashed border-gray-300 rounded-xl p-3 text-center bg-gray-50 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer">
                  <Upload size={16} className="mx-auto text-gray-400 mb-1" />
                  <span className="font-semibold text-gray-700">Click to attach scanned municipal document</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, PNG, or JPG up to 25MB</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

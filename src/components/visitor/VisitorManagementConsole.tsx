"use client";

import React, { useState, useEffect } from "react";
import {
  Users, QrCode, Shield, ShieldAlert, ShieldCheck, AlertTriangle,
  Clock, CheckCircle, XCircle, Search, Filter, Plus, Calendar,
  Building, Printer, Download, Eye, ArrowRight, UserCheck,
  Radio, Phone, Mail, Car, FileText, Check, AlertCircle,
  Truck, Package, Flame, Sparkles, RefreshCw, X, ArrowUpRight
} from "lucide-react";

interface VisitorManagementConsoleProps {
  portalRole?: "tenant" | "security" | "fm" | "admin";
  defaultProperty?: string;
}

export default function VisitorManagementConsole({
  portalRole = "tenant",
  defaultProperty = "Devasya Gold - Commercial Tower"
}: VisitorManagementConsoleProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reception" | "preregister" | "approvals" | "inside" | "contractor_delivery" | "emergency" | "watchlist"
  >("dashboard");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState(defaultProperty);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & States
  const [selectedVisitForBadge, setSelectedVisitForBadge] = useState<any | null>(null);
  const [selectedVisitForApproval, setSelectedVisitForApproval] = useState<any | null>(null);
  const [approvalDecisionReason, setApprovalDecisionReason] = useState("");
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState(false);

  // Pre-registration Form
  const [form, setForm] = useState({
    visitorName: "",
    mobile: "",
    email: "",
    company: "",
    visitorType: "client",
    hostName: "Ravi Mehta",
    tenantName: "Godrej Capital",
    purpose: "Meeting",
    visitStart: "",
    visitEnd: "",
    accessZone: "Floor 14 - Executive Suite",
    vehicleRegistration: "",
    consentFlag: true,
    requiresApproval: false
  });

  // Data Store
  const [visitsList, setVisitsList] = useState<any[]>([
    {
      id: "v-1001",
      visitorName: "Vikram Malhotra",
      company: "McKinsey & Company",
      visitorType: "client",
      mobile: "+91 98200 44211",
      hostName: "Ravi Mehta",
      tenantName: "Godrej Capital",
      purpose: "Q3 Asset Advisory & Portfolio Strategy",
      visitStart: "2026-09-19T09:00:00.000Z",
      visitEnd: "2026-09-19T17:00:00.000Z",
      approvalStatus: "approved",
      checkinAt: "2026-09-19T09:15:00.000Z",
      checkoutAt: null,
      status: "checked_in",
      zone: "Floor 14 - Executive Suite",
      passId: "PASS-QR-88910",
      riskLevel: "low",
      vehicle: "MH-02-CB-9081",
      evacuationStatus: "SAFE"
    },
    {
      id: "v-1002",
      visitorName: "Ananya Deshmukh",
      company: "Deloitte India",
      visitorType: "interview_candidate",
      mobile: "+91 97690 12890",
      hostName: "Priya Sharma",
      tenantName: "Apex Ventures",
      purpose: "Senior Financial Analyst Round 2",
      visitStart: "2026-09-19T14:30:00.000Z",
      visitEnd: "2026-09-19T16:30:00.000Z",
      approvalStatus: "approved",
      checkinAt: null,
      checkoutAt: null,
      status: "pre_registered",
      zone: "Floor 6 - Boardroom B",
      passId: "PASS-QR-88911",
      riskLevel: "low",
      vehicle: null,
      evacuationStatus: "UNACCOUNTED"
    },
    {
      id: "v-1003",
      visitorName: "Ramesh Pawar",
      company: "Voltas MEP Services",
      visitorType: "contractor",
      mobile: "+91 99300 88712",
      hostName: "Kailash Verma (FM)",
      tenantName: "Building Management",
      purpose: "AHU Filter Replacement & Pressure Test",
      visitStart: "2026-09-19T08:00:00.000Z",
      visitEnd: "2026-09-19T11:00:00.000Z",
      approvalStatus: "approved",
      checkinAt: "2026-09-19T08:15:00.000Z",
      checkoutAt: null,
      status: "overstay", // Overstay BR-V06
      zone: "Basement 1 - Chiller Plant",
      passId: "PASS-QR-88912",
      riskLevel: "medium",
      isOverstay: true,
      vehicle: "MH-04-TR-4412",
      evacuationStatus: "UNACCOUNTED"
    },
    {
      id: "v-1004",
      visitorName: "Suresh Kumar",
      company: "BlueDart Express",
      visitorType: "delivery",
      mobile: "+91 98199 66543",
      hostName: "Mailroom Desk",
      tenantName: "Tata Consultancy Services",
      purpose: "Legal Contracts Delivery (Ref: BD-4491)",
      visitStart: "2026-09-19T10:00:00.000Z",
      visitEnd: "2026-09-19T11:00:00.000Z",
      approvalStatus: "approved",
      checkinAt: "2026-09-19T10:15:00.000Z",
      checkoutAt: "2026-09-19T10:45:00.000Z",
      status: "checked_out",
      zone: "Ground Floor Mailroom",
      passId: "PASS-QR-88913",
      riskLevel: "low",
      vehicle: "MH-01-BK-2201",
      evacuationStatus: "SAFE"
    },
    {
      id: "v-1005",
      visitorName: "Aditya Singhania",
      company: "Singhania Holdings",
      visitorType: "vip",
      mobile: "+91 98210 99999",
      hostName: "Chairman Office",
      tenantName: "Prestige Group",
      purpose: "Board Advisory Briefing",
      visitStart: "2026-09-19T16:00:00.000Z",
      visitEnd: "2026-09-19T18:00:00.000Z",
      approvalStatus: "pending", // VC-03
      checkinAt: null,
      checkoutAt: null,
      status: "pending_approval",
      zone: "Penthouse Level",
      passId: "PASS-QR-88914",
      riskLevel: "low",
      vehicle: "MH-01-DD-0001",
      evacuationStatus: "UNACCOUNTED"
    }
  ]);

  // Watchlist (VC-14)
  const [watchlistEntries, setWatchlistEntries] = useState([
    { id: "WL-01", name: "Kunal Singhal", identifier: "+91 98200 00099", reason: "Unauthorized commercial photography attempt; barred from premises.", activeFrom: "2026-06-01", status: "active" },
    { id: "WL-02", name: "Apex Facade Agency (Blacklisted sub-vendor)", identifier: "Apex Facade", reason: "Repeated safety violations on height work without harness.", activeFrom: "2026-08-10", status: "active" }
  ]);

  // Reception check-in state (VC-04)
  const [scannedPassCode, setScannedPassCode] = useState("");
  const [receptionMatch, setReceptionMatch] = useState<any | null>(null);
  const [speedGateActive, setSpeedGateActive] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (portalRole === "tenant" && typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("officex_tenant_visitors") || "[]");
        setVisitsList(Array.isArray(stored) ? stored : []);
      } catch {
        setVisitsList([]);
      }
      const b = localStorage.getItem("officex_tenant_building");
      if (b) setSelectedProperty(b);
      const myUser = localStorage.getItem("officex_user_name") || "Tenant Lead";
      const myOrg = localStorage.getItem("officex_active_org") || myUser;
      setForm((prev) => ({
        ...prev,
        hostName: myUser,
        tenantName: myOrg
      }));
    }
  }, [portalRole]);

  // KPIs
  const totalExpected = visitsList.length;
  const insideOccupants = visitsList.filter(v => v.status === "checked_in" || v.status === "overstay");
  const insideCount = insideOccupants.length;
  const checkedOutCount = visitsList.filter(v => v.status === "checked_out").length;
  const overstayCount = visitsList.filter(v => v.status === "overstay" || v.isOverstay).length;
  const pendingApprovals = visitsList.filter(v => v.approvalStatus === "pending" || v.status === "pending_approval");
  const contractorsCount = visitsList.filter(v => v.visitorType === "contractor" || v.visitorType === "vendor").length;

  // Handle Pre-registration submission (VC-02, V-001, V-003)
  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.visitorName || !form.mobile || !form.visitStart || !form.visitEnd) {
      showToast("Please fill in visitor name, mobile, start time, and end time.", "error");
      return;
    }

    const startTs = new Date(form.visitStart).getTime();
    const endTs = new Date(form.visitEnd).getTime();
    if (endTs <= startTs) {
      showToast("End time must be strictly after start time.", "error");
      return;
    }

    // Watchlist check (BR-V10)
    const isRestricted = watchlistEntries.some(
      w => w.identifier.toLowerCase().includes(form.mobile.toLowerCase()) || w.name.toLowerCase().includes(form.visitorName.toLowerCase())
    );

    if (isRestricted) {
      showToast("🚨 SECURITY WARNING: Visitor is on active watchlist. Routed to Security Manager.", "error");
    }

    const newId = `v-${Date.now()}`;
    const newPass = `PASS-QR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEntry = {
      id: newId,
      visitorName: form.visitorName.trim(),
      company: form.company.trim() || "Independent",
      visitorType: form.visitorType,
      mobile: form.mobile.trim(),
      email: form.email.trim() || null,
      hostName: form.hostName,
      tenantName: form.tenantName,
      purpose: form.purpose,
      visitStart: new Date(form.visitStart).toISOString(),
      visitEnd: new Date(form.visitEnd).toISOString(),
      approvalStatus: form.requiresApproval ? "pending" : "approved",
      checkinAt: null,
      checkoutAt: null,
      status: form.requiresApproval ? "pending_approval" : "pre_registered",
      zone: form.accessZone,
      passId: newPass,
      riskLevel: isRestricted ? "high" : "low",
      vehicle: form.vehicleRegistration ? form.vehicleRegistration.toUpperCase() : null,
      evacuationStatus: "UNACCOUNTED"
    };

    setVisitsList(prev => {
      const updated = [newEntry, ...prev];
      if (portalRole === "tenant" && typeof window !== "undefined") {
        try {
          localStorage.setItem("officex_tenant_visitors", JSON.stringify(updated));
        } catch (err) {
          console.warn("Storage note:", err);
        }
      }
      return updated;
    });
    showToast(form.requiresApproval ? "Pre-registration submitted to host approval queue." : "🎉 Visitor pre-registered! Digital pass activated.", "success");
    setSelectedVisitForBadge(newEntry);

    // Reset Form
    setForm({
      visitorName: "",
      mobile: "",
      email: "",
      company: "",
      visitorType: "client",
      hostName: "Ravi Mehta",
      tenantName: "Godrej Capital",
      purpose: "Meeting",
      visitStart: "",
      visitEnd: "",
      accessZone: "Floor 14 - Executive Suite",
      vehicleRegistration: "",
      consentFlag: true,
      requiresApproval: false
    });
  };

  // Handle Reception Check-in (VC-04, V-008, BR-V04)
  const handleCheckIn = (visitId: string) => {
    const visit = visitsList.find(v => v.id === visitId);
    if (!visit) return;

    if (visit.approvalStatus === "pending") {
      showToast("Cannot check in: Host approval is still pending (BR-V02).", "error");
      return;
    }

    setSpeedGateActive(true);
    setTimeout(() => setSpeedGateActive(false), 3000);

    const checkinTime = new Date().toISOString();
    setVisitsList(prev =>
      prev.map(v => (v.id === visitId ? { ...v, status: "checked_in", checkinAt: checkinTime, evacuationStatus: "UNACCOUNTED" } : v))
    );

    showToast(`✓ Checked in ${visit.visitorName}. Gunnebo Speed-Gate Pulse Issued (18s window).`, "success");
    setReceptionMatch(null);
  };

  // Handle Checkout (VC-09, V-020, BR-V05)
  const handleCheckOut = (visitId: string, manualReason?: string) => {
    const checkoutTime = new Date().toISOString();
    setVisitsList(prev =>
      prev.map(v => (v.id === visitId ? { ...v, status: "checked_out", checkoutAt: checkoutTime, isOverstay: false, evacuationStatus: "SAFE" } : v))
    );
    showToast("Visitor checked out. Badge returned.", "info");
  };

  // Handle Host Approval Decision (VC-03, V-005, V-006, BR-V02)
  const handleApprovalDecision = (decision: "approved" | "rejected") => {
    if (!selectedVisitForApproval) return;

    const isApproved = decision === "approved";
    setVisitsList(prev =>
      prev.map(v =>
        v.id === selectedVisitForApproval.id
          ? {
              ...v,
              approvalStatus: decision,
              status: isApproved ? "approved" : "denied",
              approvalReason: approvalDecisionReason || (isApproved ? "Approved by Host" : "Declined by Host")
            }
          : v
      )
    );

    showToast(`Visit ${isApproved ? "Approved" : "Rejected"} successfully.`, isApproved ? "success" : "info");
    setSelectedVisitForApproval(null);
    setApprovalDecisionReason("");
  };

  // Handle Emergency Roll Call Status Toggle (VC-13, V-031, BR-V07)
  const handleToggleRollCallStatus = (visitId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "SAFE" ? "MISSING" : currentStatus === "MISSING" ? "UNACCOUNTED" : "SAFE";
    setVisitsList(prev =>
      prev.map(v => (v.id === visitId ? { ...v, evacuationStatus: nextStatus } : v))
    );
    showToast(`Visitor status updated to ${nextStatus}`, "info");
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-16">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
          toast.type === "error" ? "bg-red-900 border-red-700" : toast.type === "info" ? "bg-slate-900 border-slate-700" : "bg-emerald-900 border-emerald-700"
        }`}>
          {toast.type === "error" ? <AlertTriangle size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#0F8B7D] border border-teal-200">
              INSTITUTIONAL SAAS CORE · VC-01 TO VC-15
            </span>
            <span className="text-xs font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-600">{selectedProperty}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Visitor Flow &amp; Speed-Gate Access Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-registration, optical turnstile relay, real-time live occupancy, and emergency roll-call.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const next = !activeEmergencyAlert;
              setActiveEmergencyAlert(next);
              if (next) {
                setActiveTab("emergency");
                showToast("🚨 EMERGENCY EVACUATION MODE ACTIVATED! Roll-call protocol engaged.", "error");
              } else {
                showToast("Emergency mode cleared. Normal access restored.", "info");
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeEmergencyAlert
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <Flame size={14} />
            <span>{activeEmergencyAlert ? "EMERGENCY ACTIVE (ROLL-CALL)" : "Declare Emergency"}</span>
          </button>

          <button
            onClick={() => setActiveTab("preregister")}
            className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Pre-Register Visitor
          </button>
        </div>
      </div>

      {/* Optical Speed-Gate Pulse Simulation Banner */}
      {speedGateActive && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3.5 px-5 shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Radio size={20} className="text-emerald-200 animate-spin" />
            <div>
              <p className="text-xs font-black">GUNNEBO OPTICAL TURNSTILE RELAY ACTIVATED</p>
              <p className="text-[11px] text-emerald-100">Speed-gate flap open · 18-second optical transit window active · Attendance logged.</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-white/20 rounded-md border border-white/30">
            Relay ID: GATE-G01-PULSE
          </span>
        </div>
      )}

      {/* Navigation Tabs (All 8 Core Views) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: "dashboard", label: "Dashboard (VC-01)", icon: Users, badge: totalExpected },
          { key: "reception", label: "Reception Desk (VC-04/05)", icon: QrCode },
          { key: "preregister", label: "Pre-Registration (VC-02)", icon: Plus },
          { key: "approvals", label: "Approval Queue (VC-03)", icon: Clock, badge: pendingApprovals.length, badgeColor: "bg-amber-100 text-amber-800" },
          { key: "inside", label: "Live Inside (VC-08/09)", icon: UserCheck, badge: insideCount, badgeColor: "bg-emerald-100 text-emerald-800" },
          { key: "contractor_delivery", label: "Contractors & Logistics (VC-11/12)", icon: Truck, badge: contractorsCount },
          { key: "emergency", label: "Emergency Roll Call (VC-13)", icon: Flame, badge: insideCount, badgeColor: "bg-red-100 text-red-800" },
          { key: "watchlist", label: "Watchlist (VC-14)", icon: ShieldAlert, badge: watchlistEntries.length }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-teal-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${t.badgeColor || "bg-slate-100 text-slate-700"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: EXECUTIVE & SECURITY DASHBOARD (VC-01)                             */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Today</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalExpected}</p>
              <span className="text-[10px] text-teal-600 font-bold mt-0.5 block">100% Pre-vetted</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Inside Premises</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{insideCount}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Active Passes</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Checked Out</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{checkedOutCount}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Badges Returned</span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-2xs ${overstayCount > 0 ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Overstay Alerts</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{overstayCount}</p>
              <span className="text-[10px] text-amber-800 font-bold mt-0.5 block">{overstayCount > 0 ? "Security Alerted" : "Zero Violations"}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Host Approval</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{pendingApprovals.length}</p>
              <span className="text-[10px] text-blue-700 font-bold mt-0.5 block">SLA countdown active</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Evacuation Roll-Call</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{insideCount}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Headcount Synced ✓</span>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Today&apos;s Visitor Flow Activity</h3>
                  <p className="text-[11px] text-slate-500">Real-time gate ingress and egress telemetry.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                    ● Turnstiles Online
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Visitor</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Host &amp; Tenant</th>
                      <th className="py-2.5 px-3">Access Zone</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visitsList.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{v.visitorName}</span>
                          <span className="text-[11px] text-slate-500">{v.company} · {v.mobile}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                            {v.visitorType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">{v.hostName}</span>
                          <span className="text-[10px] text-slate-500">{v.tenantName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-700 font-medium">{v.zone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            v.status === "checked_in" ? "bg-emerald-100 text-emerald-800" :
                            v.status === "overstay" ? "bg-amber-100 text-amber-800 animate-pulse" :
                            v.status === "pending_approval" ? "bg-blue-100 text-blue-800" :
                            v.status === "checked_out" ? "bg-slate-100 text-slate-600" : "bg-teal-50 text-teal-800"
                          }`}>
                            {v.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {v.status === "pre_registered" && (
                            <button
                              onClick={() => handleCheckIn(v.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Check In
                            </button>
                          )}
                          {v.status === "checked_in" && (
                            <button
                              onClick={() => handleCheckOut(v.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVisitForBadge(v)}
                            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] cursor-pointer"
                          >
                            Badge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overstay & Security Focus Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Overstay Monitor (BR-V06)</h3>
                    <p className="text-[10px] text-slate-500">Auto-escalation for visitors exceeding validity.</p>
                  </div>
                </div>

                {overstayCount === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-4">
                    <CheckCircle size={24} className="text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-900">Zero Overstay Violations</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">All active visitors are within scheduled access windows.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 my-3">
                    {visitsList.filter(v => v.status === "overstay" || v.isOverstay).map(v => (
                      <div key={v.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                        <div className="flex items-center justify-between font-black text-xs">
                          <span>{v.visitorName}</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">+30m Overstay</span>
                        </div>
                        <p className="text-[11px] text-amber-800 mt-0.5">Host: {v.hostName} · Zone: {v.zone}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleCheckOut(v.id, "Security Overstay Eviction")}
                            className="px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Force Checkout
                          </button>
                          <button
                            onClick={() => showToast(`SMS & WhatsApp ping sent to host ${v.hostName}.`, "info")}
                            className="px-2 py-1 border border-amber-400 text-amber-900 hover:bg-amber-100 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Ping Host
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Speed-Gate Transit SLA</span>
                  <span className="font-black text-slate-900">18 Seconds / Visitor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: RECEPTION CHECK-IN DESK & WALK-INS (VC-04, VC-05)                   */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "reception" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Scanner & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode size={20} className="text-[#0F8B7D]" />
                <h3 className="text-sm font-black text-slate-900">Scan Visitor QR / Pass Token (VC-04)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Simulate front-desk optical scanner or search visitor phone number to verify and check in.
              </p>

              <div className="flex gap-2 mb-5">
                <input
                  value={scannedPassCode}
                  onChange={e => setScannedPassCode(e.target.value)}
                  placeholder="Enter QR Code e.g. PASS-QR-88911 or mobile number"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0F8B7D]"
                />
                <button
                  onClick={() => {
                    const match = visitsList.find(
                      v => (v.passId && v.passId.toLowerCase().includes(scannedPassCode.trim().toLowerCase())) ||
                           (v.mobile && v.mobile.includes(scannedPassCode.trim()))
                    );
                    if (match) {
                      setReceptionMatch(match);
                      showToast(`Match found: ${match.visitorName}`, "success");
                    } else {
                      showToast("No pre-registered visit matching code.", "error");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Verify
                </button>
              </div>

              {receptionMatch && (
                <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider">Invitation Verified ✓</span>
                    <span className="text-xs font-mono font-bold text-teal-900">{receptionMatch.passId}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{receptionMatch.visitorName}</h4>
                  <p className="text-xs text-slate-600">{receptionMatch.company} · {receptionMatch.mobile}</p>
                  <p className="text-xs text-slate-600 mt-1">Host: <strong>{receptionMatch.hostName}</strong> ({receptionMatch.tenantName})</p>
                  <p className="text-xs text-slate-600">Access Zone: <strong>{receptionMatch.zone}</strong></p>

                  <div className="flex gap-2.5 mt-4">
                    <button
                      onClick={() => handleCheckIn(receptionMatch.id)}
                      className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
                    >
                      Issue Badge &amp; Open Gate
                    </button>
                    <button
                      onClick={() => setSelectedVisitForBadge(receptionMatch)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-white cursor-pointer"
                    >
                      View Badge
                    </button>
                  </div>
                </div>
              )}

              {/* Sample QR Codes for quick demo */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  1-Click Test Scanners
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setScannedPassCode("PASS-QR-88911"); setReceptionMatch(visitsList[1]); }}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:border-teal-400 cursor-pointer"
                  >
                    Scan Ananya Deshmukh (Interview)
                  </button>
                  <button
                    onClick={() => { setScannedPassCode("PASS-QR-88910"); setReceptionMatch(visitsList[0]); }}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:border-teal-400 cursor-pointer"
                  >
                    Scan Vikram Malhotra (Client)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Boon Edam &amp; Gunnebo Speed-Gate Relay</span>
              <span className="font-bold text-emerald-600">Active (TCP/IP Port 8081)</span>
            </div>
          </div>

          {/* Walk-In Fast Registration (VC-05) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={20} className="text-teal-700" />
              <h3 className="text-sm font-black text-slate-900">Walk-In Instant Registration (VC-05)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Fast registration for unscheduled visitors with instant host ping.
            </p>

            <form onSubmit={e => {
              e.preventDefault();
              const name = (e.target as any).walkinName.value;
              const mobile = (e.target as any).walkinMobile.value;
              const host = (e.target as any).walkinHost.value;
              if (!name || !mobile) {
                showToast("Please enter walk-in visitor name and mobile.", "error");
                return;
              }
              const newWalkin = {
                id: `v-walk-${Date.now()}`,
                visitorName: name,
                company: "Walk-in Guest",
                visitorType: "guest",
                mobile,
                hostName: host,
                tenantName: "Commercial Occupier",
                purpose: "Unscheduled Walk-In",
                visitStart: new Date().toISOString(),
                visitEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                approvalStatus: "approved",
                checkinAt: new Date().toISOString(),
                checkoutAt: null,
                status: "checked_in",
                zone: "Ground Floor Lobby & Host Floor",
                passId: `PASS-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
                riskLevel: "low",
                evacuationStatus: "UNACCOUNTED"
              };
              setVisitsList(prev => [newWalkin, ...prev]);
              showToast(`Walk-in visitor ${name} registered & checked in!`, "success");
              setSelectedVisitForBadge(newWalkin);
              (e.target as any).reset();
            }} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Visitor Name</label>
                <input name="walkinName" placeholder="Full legal name" className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                  <input name="walkinMobile" placeholder="+91 98..." className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Host Tenant</label>
                  <select name="walkinHost" className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]">
                    <option>Ravi Mehta (Godrej Capital)</option>
                    <option>Priya Sharma (Apex Ventures)</option>
                    <option>Anita Saxena (TCS Lead)</option>
                    <option>Building Management (FM)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black cursor-pointer shadow-xs"
                >
                  Register &amp; Check In Walk-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: VISITOR PRE-REGISTRATION FORM (VC-02)                              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "preregister" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-4xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-base font-black text-slate-900">Visitor Pre-Registration (VC-02)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue seamless WhatsApp QR invitations before arrival for frictionless turnstile access.
            </p>
          </div>

          <form onSubmit={handlePreRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Visitor Name *</label>
                <input
                  required
                  value={form.visitorName}
                  onChange={e => setForm({ ...form, visitorName: e.target.value })}
                  placeholder="e.g. Rajesh Khurana"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company / Organization</label>
                <input
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Bain & Company"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number (For WhatsApp Pass) *</label>
                <input
                  required
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  placeholder="+91 98200..."
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="visitor@company.com"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Visitor Type</label>
                <select
                  value={form.visitorType}
                  onChange={e => setForm({ ...form, visitorType: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="guest">Guest</option>
                  <option value="client">Client</option>
                  <option value="interview_candidate">Interview Candidate</option>
                  <option value="contractor">Contractor / Technical Vendor</option>
                  <option value="delivery">Delivery / Courier</option>
                  <option value="vip">VIP / Executive Guest</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Host Tenant</label>
                <select
                  value={form.tenantName}
                  onChange={e => setForm({ ...form, tenantName: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Godrej Capital</option>
                  <option>Apex Ventures</option>
                  <option>Tata Consultancy Services</option>
                  <option>Building Management</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Visit Start Date &amp; Time *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.visitStart}
                  onChange={e => setForm({ ...form, visitStart: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Visit End Date &amp; Time *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.visitEnd}
                  onChange={e => setForm({ ...form, visitEnd: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Access Zone Permitted</label>
                <select
                  value={form.accessZone}
                  onChange={e => setForm({ ...form, accessZone: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Floor 14 - Executive Suite</option>
                  <option>Floor 6 - Boardroom B</option>
                  <option>Ground Floor - Meeting Lounge</option>
                  <option>Basement 1 - Chiller Plant (Contractor)</option>
                  <option>All Commercial Floors</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle License Plate (Optional)</label>
                <input
                  value={form.vehicleRegistration}
                  onChange={e => setForm({ ...form, vehicleRegistration: e.target.value })}
                  placeholder="e.g. MH-02-DN-7711"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={e => setForm({ ...form, requiresApproval: e.target.checked })}
                  className="rounded text-[#0F8B7D] focus:ring-0"
                />
                <span>Route to Host Approval Queue before pass generation (VC-03)</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
              >
                Generate &amp; Dispatch QR Pass
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: APPROVAL QUEUE (VC-03)                                             */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "approvals" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Pending Host &amp; Security Approvals (VC-03)</h3>
              <p className="text-xs text-slate-500">Approvals required before visitors are permitted ingress.</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {pendingApprovals.length} Requests Pending
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-800">All Approvals Up To Date</p>
              <p className="text-xs text-slate-500">No pending visitor requests in the approval queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(v => (
                <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{v.visitorName}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {v.visitorType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{v.company} · {v.mobile}</p>
                    <p className="text-xs text-slate-500">Purpose: <strong>{v.purpose}</strong> · Host: <strong>{v.hostName}</strong> ({v.tenantName})</p>
                    <p className="text-[11px] text-slate-500">Requested Zone: <strong>{v.zone}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedVisitForApproval(v);
                        handleApprovalDecision("approved");
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVisitForApproval(v);
                      }}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Reject with Reason
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: LIVE VISITORS INSIDE & OVERSTAY MONITOR (VC-08, VC-09)              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "inside" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Live Occupants Inside Building (VC-08)</h3>
              <p className="text-xs text-slate-500">Currently active visitors physically present on campus.</p>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ● {insideCount} Live Visitors Inside
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Visitor Details</th>
                  <th className="py-2.5 px-3">Host &amp; Tenant</th>
                  <th className="py-2.5 px-3">Check-In Time</th>
                  <th className="py-2.5 px-3">Zone Location</th>
                  <th className="py-2.5 px-3">Overstay Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insideOccupants.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{v.visitorName}</span>
                      <span className="text-[11px] text-slate-500">{v.company} · {v.mobile}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{v.hostName}</span>
                      <span className="text-[10px] text-slate-500">{v.tenantName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-700 font-medium">
                        {v.checkinAt ? new Date(v.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">{v.zone}</span>
                    </td>
                    <td className="py-3 px-3">
                      {v.isOverstay || v.status === "overstay" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 animate-pulse">
                          Overstay Violation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                          Within Validity
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-2xs"
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 6: CONTRACTORS & DELIVERY LOGISTICS (VC-11, VC-12)                    */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "contractor_delivery" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={20} className="text-teal-700" />
              <h3 className="text-sm font-black text-slate-900">Technical Contractor Access (VC-11)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Vendors linked to Work Orders, AMCs, and statutory permits.
            </p>

            <div className="space-y-3">
              {visitsList.filter(v => v.visitorType === "contractor").map(c => (
                <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-slate-900">{c.visitorName} ({c.company})</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-black">WO Linked</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Work: <strong>{c.purpose}</strong></p>
                  <p className="text-[11px] text-slate-500">Supervisor: {c.hostName} · Plant Zone: {c.zone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Package size={20} className="text-blue-700" />
              <h3 className="text-sm font-black text-slate-900">Delivery &amp; Logistics Register (VC-12)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Courier parcel ingress, vehicle movements, and recipient drop-off status.
            </p>

            <div className="space-y-3">
              {visitsList.filter(v => v.visitorType === "delivery").map(d => (
                <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-slate-900">{d.company} — {d.visitorName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">Delivered ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Recipient: <strong>{d.hostName}</strong> ({d.tenantName})</p>
                  <p className="text-[11px] text-slate-500">Vehicle: {d.vehicle || "Motorcycle Delivery"} · Ref: BD-4491</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 7: EMERGENCY ROLL CALL PROTOCOL (VC-13, V-030, V-031)                 */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "emergency" && (
        <div className="bg-white rounded-2xl border-2 border-red-400 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-red-950">Emergency Evacuation Roll Call (VC-13)</h3>
                <p className="text-xs text-red-800">Live head-count of all visitors inside. Account for every individual.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer size={13} /> Print Evacuation Manifest
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-red-800 uppercase">Total Inside</span>
              <p className="text-2xl font-black text-red-900">{insideCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Accounted Safe</span>
              <p className="text-2xl font-black text-emerald-800">
                {insideOccupants.filter(o => o.evacuationStatus === "SAFE").length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Unaccounted / Missing</span>
              <p className="text-2xl font-black text-amber-800">
                {insideOccupants.filter(o => o.evacuationStatus !== "SAFE").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50/70 text-red-900 uppercase text-[10px] font-bold border-b border-red-200">
                <tr>
                  <th className="py-2.5 px-3">Occupant Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Host &amp; Tenant</th>
                  <th className="py-2.5 px-3">Last Known Zone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Toggle Safe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insideOccupants.map(o => (
                  <tr key={o.id} className="hover:bg-red-50/30">
                    <td className="py-3 px-3 font-bold text-slate-900">{o.visitorName} ({o.company})</td>
                    <td className="py-3 px-3 text-slate-600">{o.mobile}</td>
                    <td className="py-3 px-3 text-slate-700">{o.hostName} · {o.tenantName}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{o.zone}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        o.evacuationStatus === "SAFE" ? "bg-emerald-100 text-emerald-800" :
                        o.evacuationStatus === "MISSING" ? "bg-red-100 text-red-800 animate-bounce" : "bg-amber-100 text-amber-800"
                      }`}>
                        {o.evacuationStatus || "UNACCOUNTED"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleRollCallStatus(o.id, o.evacuationStatus || "UNACCOUNTED")}
                        className="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 8: WATCHLIST MANAGEMENT (VC-14)                                       */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "watchlist" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Restricted Watchlist &amp; Security Blocks (VC-14)</h3>
              <p className="text-xs text-slate-500">Security list of restricted identities with automated check-in block (BR-V10).</p>
            </div>
            <button
              onClick={() => {
                const name = prompt("Enter Name or Company to block:");
                const idRef = prompt("Enter Phone number or registration:");
                const reason = prompt("Enter reason for restriction:");
                if (name && reason) {
                  setWatchlistEntries(prev => [...prev, { id: `WL-0${prev.length + 1}`, name, identifier: idRef || name, reason, activeFrom: new Date().toISOString(), status: "active" }]);
                  showToast("Identity added to security watchlist.", "info");
                }
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + Add to Watchlist
            </button>
          </div>

          <div className="space-y-3">
            {watchlistEntries.map(w => (
              <div key={w.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-red-950">{w.name}</span>
                    <span className="text-[10px] font-mono text-red-800 bg-red-200/70 px-2 py-0.5 rounded">
                      Ref: {w.identifier}
                    </span>
                  </div>
                  <p className="text-xs text-red-900 font-medium mt-1">Reason: {w.reason}</p>
                  <p className="text-[10px] text-red-700 mt-0.5">Active since: {w.activeFrom}</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2.5 py-1 rounded-full">
                  AUTO-BLOCK ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: PRINTABLE DIGITAL BADGE (VC-07, V-015)                             */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {selectedVisitForBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-teal-800 to-[#0F8B7D] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  OFFICEX PASS
                </span>
                <h4 className="text-sm font-black mt-1">{selectedProperty}</h4>
              </div>
              <button
                onClick={() => setSelectedVisitForBadge(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-500 mx-auto flex items-center justify-center text-teal-800 font-black text-xl mb-3">
                {selectedVisitForBadge.visitorName.charAt(0)}
              </div>

              <h3 className="text-lg font-black text-slate-900">{selectedVisitForBadge.visitorName}</h3>
              <p className="text-xs font-bold text-teal-700">{selectedVisitForBadge.company}</p>

              <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
                <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl flex items-center justify-center font-mono text-[10px] text-slate-500 flex-col gap-1 p-2">
                  <QrCode size={64} className="text-slate-900" />
                  <span className="font-bold text-[9px] text-slate-900">{selectedVisitForBadge.passId}</span>
                </div>
              </div>

              <div className="text-left bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <p>Host: <strong className="text-slate-900">{selectedVisitForBadge.hostName}</strong> ({selectedVisitForBadge.tenantName})</p>
                <p>Access Zone: <strong className="text-slate-900">{selectedVisitForBadge.zone}</strong></p>
                <p>Valid On: <strong className="text-slate-900">Today, 09:00 AM – 06:00 PM</strong></p>
              </div>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} /> Print Badge
                </button>
                <button
                  onClick={() => setSelectedVisitForBadge(null)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: APPROVAL REJECTION REASON (VC-03)                                  */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {selectedVisitForApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in">
            <h4 className="text-base font-black text-slate-900">Reject Visitor Request</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Please record the audit reason for declining visitor access for <strong>{selectedVisitForApproval.visitorName}</strong>.
            </p>

            <textarea
              value={approvalDecisionReason}
              onChange={e => setApprovalDecisionReason(e.target.value)}
              placeholder="e.g. Host unavailable, meeting rescheduled, or security concern..."
              className="mt-4 w-full h-24 p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setSelectedVisitForApproval(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprovalDecision("rejected")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

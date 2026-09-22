"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Clock,
  Calendar, FileText, Upload, Plus, Search, Filter, Eye,
  Building, Wrench, Flame, Zap, Award, AlertCircle, ChevronRight,
  TrendingUp, Download, RefreshCw, X, ChevronDown, Check,
  BarChart3, Layers, SlidersHorizontal, Lock, CheckCircle2, ArrowRight
} from "lucide-react";

interface ComplianceOperationsCenterProps {
  portalRole?: "owner" | "fm" | "admin";
  defaultProperty?: string;
}

export default function ComplianceOperationsCenter({
  portalRole = "owner",
  defaultProperty = "Commercial Asset"
}: ComplianceOperationsCenterProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "register" | "calendar" | "evidence" | "incidents" | "capa" | "permits" | "risks" | "inspections"
  >("dashboard");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState(defaultProperty);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [selectedObligation, setSelectedObligation] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadObligationId, setUploadObligationId] = useState<string | null>(null);
  const [selectedIncidentForCapa, setSelectedIncidentForCapa] = useState<any | null>(null);

  // Compliance Obligations Master Dataset (CM-02, CM-03) - Real user data
  const [obligations, setObligations] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_obligations");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Incidents Register (CM-07) - Real user data
  const [incidents, setIncidents] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_incidents");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // CAPA Management (CM-08) - Real user data
  const [capas, setCapas] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_capas");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Permits to Work (CM-09) - Real user data
  const [permits, setPermits] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_permits");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Risk Register (CM-13) - Real user data
  const [risks, setRisks] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_risks");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgName = localStorage.getItem("officex_org_name") || localStorage.getItem("officex_active_org");
      if (orgName) {
        setSelectedProperty(orgName);
      }
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // BR-C03 Weighted Score Calculation
  const { complianceScore, totalWeight, compliantCount, dueCount, overdueCount, criticalOverdueCount } = useMemo(() => {
    let tWeight = 0;
    let eWeight = 0;
    let cCount = 0;
    let dCount = 0;
    let oCount = 0;
    let critOverdue = 0;

    obligations.forEach(o => {
      tWeight += o.weight;
      if (o.status === "compliant") {
        eWeight += o.weight;
        cCount++;
      } else if (o.status === "expiring_soon") {
        eWeight += o.weight * 0.85;
      } else if (o.status === "due") {
        eWeight += o.weight * 0.50;
        dCount++;
      } else if (o.status === "overdue") {
        oCount++;
        if (o.criticality === "CRITICAL") critOverdue++;
      }
    });

    const score = Math.round((eWeight / (tWeight || 1)) * 100);
    return {
      complianceScore: score,
      totalWeight: tWeight,
      compliantCount: cCount,
      dueCount: dCount,
      overdueCount: oCount,
      criticalOverdueCount: critOverdue
    };
  }, [obligations]);

  // Handle Evidence Verification (C-012)
  const handleVerifyEvidence = (oblId: string) => {
    setObligations(prev =>
      prev.map(o => (o.id === oblId ? { ...o, verified: true, status: "compliant" } : o))
    );
    showToast("Evidence verified by Compliance Manager. Obligation marked compliant.", "success");
  };

  // Handle CAPA Closure (BR-C08, C-022, C-023)
  const handleCloseCapa = (capa: any) => {
    if (!capa.evidenceAttached || capa.verificationStatus !== "verified") {
      showToast("BR-C08 Violation: CAPA cannot close without attached evidence and verified status (C-022).", "error");
      return;
    }
    setCapas(prev =>
      prev.map(c => (c.id === capa.id ? { ...c, status: "closed", closedAt: new Date().toISOString() } : c))
    );
    showToast("✓ CAPA closed with validated audit evidence.", "success");
  };

  // Handle Permit Approval (BR-C11, C-029)
  const handleApprovePermit = (permit: any) => {
    if (!permit.vendorPrerequisiteValid) {
      showToast(`BR-C11 Violation: Approval blocked. ${permit.prerequisiteError || "Contractor certificate is expired"} (C-029).`, "error");
      return;
    }
    setPermits(prev =>
      prev.map(p => (p.id === permit.id ? { ...p, status: "active" } : p))
    );
    showToast("Permit to Work approved and active.", "success");
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
              INSTITUTIONAL SAAS CORE · CM-01 TO CM-16
            </span>
            <span className="text-xs font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-600">{selectedProperty}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Statutory Compliance Radar &amp; EHS Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            48 pre-configured commercial tower licenses, Fire NOC, Lift Form-A, SPCB CTO, Incidents, CAPA, and PTW.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} /> Upload Evidence
          </button>
          <button
            onClick={() => {
              const title = prompt("Enter Incident Title:");
              const location = prompt("Enter Location (e.g. Tower A Server Room):");
              const action = prompt("Enter Immediate Action Taken:");
              if (title && location && action) {
                const newInc = {
                  id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
                  title,
                  location,
                  type: "Safety Hazard",
                  severity: "moderate",
                  occurredAt: new Date().toISOString(),
                  status: "capa_assigned",
                  immediateAction: action,
                  capaId: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`,
                  capaStatus: "in_progress"
                };
                setIncidents(prev => [newInc, ...prev]);
                showToast("Incident logged. Linked CAPA initialized.", "success");
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle size={14} /> Log Incident
          </button>
        </div>
      </div>

      {/* Critical Overdue Gating Banner (BR-C04) */}
      {criticalOverdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-950 rounded-2xl p-4 shadow-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-xs font-black">CRITICAL STATUTORY COMPLIANCE OVERDUE (BR-C04)</p>
              <p className="text-[11px] text-red-800">
                1 or more critical obligations are past renewal date. Municipal audit liability active.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab("register"); setCategoryFilter("Structural Safety"); }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
          >
            View Critical Item
          </button>
        </div>
      )}

      {/* Navigation Tabs (CM-01 to CM-16) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: "dashboard", label: "Dashboard (CM-01)", icon: BarChart3 },
          { key: "register", label: "Obligations Register (CM-02)", icon: FileText, badge: obligations.length },
          { key: "calendar", label: "52-Week Calendar (CM-04)", icon: Calendar },
          { key: "evidence", label: "Evidence Vault (CM-05)", icon: Upload },
          { key: "incidents", label: "Incidents Register (CM-07)", icon: AlertCircle, badge: incidents.length },
          { key: "capa", label: "CAPA Board (CM-08)", icon: CheckCircle2, badge: capas.filter(c => c.status !== "closed").length, badgeColor: "bg-amber-100 text-amber-800" },
          { key: "permits", label: "Permits to Work (CM-09)", icon: ShieldCheck, badge: permits.length },
          { key: "risks", label: "Risk Matrix 5x5 (CM-13)", icon: ShieldAlert, badge: risks.length }
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
      {/* TAB 1: EXECUTIVE DASHBOARD & WEIGHTED SCORECARD (CM-01, BR-C03)           */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6">
          {/* Top Scorecard Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-teal-800 to-[#0F8B7D] p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-200">WEIGHTED COMPLIANCE SCORE</span>
                <p className="text-4xl font-black mt-1">{complianceScore}%</p>
                <span className="text-[10px] text-teal-100 font-bold block mt-1">BR-C03 Formula Active</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                <Award size={28} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Compliant Obligations</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{compliantCount} / {obligations.length}</p>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">Valid Certificates Uploaded</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Due in 30 Days</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{dueCount}</p>
              <span className="text-[10px] text-amber-700 font-bold mt-1 block">Renewal Workflows Initiated</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Open CAPAs</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{capas.filter(c => c.status !== "closed").length}</p>
              <span className="text-[10px] text-blue-700 font-bold mt-1 block">Remediation in progress</span>
            </div>
          </div>

          {/* Critical Obligation Radar Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Critical Statutory Radar (Top 6 Obligations)</h3>
                <p className="text-xs text-slate-500">Live validity clocks and issuing authority linkages.</p>
              </div>
              <button
                onClick={() => setActiveTab("register")}
                className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All In Register</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {obligations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ShieldCheck size={28} className="text-[#0F8B7D]" />
                <h4 className="text-xs font-bold text-slate-900">No Active Obligations to Monitor</h4>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Upload your commercial asset's statutory certificates to activate live validity clocks and compliance radar.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-2 px-3.5 py-1.5 bg-[#0F8B7D] text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Upload size={13} /> Upload First Statutory NOC
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {obligations.map(o => (
                  <div key={o.id} className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 transition-all bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {o.category}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        o.status === "compliant" ? "bg-emerald-100 text-emerald-800" :
                        o.status === "expiring_soon" ? "bg-amber-100 text-amber-800" :
                        o.status === "due" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800 animate-pulse"
                      }`}>
                        {o.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{o.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{o.authority}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Due: <strong>{o.dueDate}</strong></span>
                      <span className="font-bold text-teal-800">Weight: {o.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: OBLIGATIONS REGISTER (CM-02, CM-03)                                */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "register" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Compliance Obligation Register (CM-02)</h3>
              <p className="text-xs text-slate-500">Master register of all statutory, contractual, and safety obligations.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="all">All Categories</option>
                <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                <option value="Lift & Escalator">Lift &amp; Escalator</option>
                <option value="Environmental">Environmental (SPCB)</option>
                <option value="Electrical & Power">Electrical &amp; Power</option>
                <option value="Structural Safety">Structural Safety</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Obligation Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Regulatory Authority</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obligations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                          <ShieldCheck size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">No Compliance Obligations Registered</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm">
                          Your statutory register is clean. Upload statutory certificates (Fire NOC, Lift License, Pollution CTO) to track renewals.
                        </p>
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="mt-1 px-3.5 py-1.5 bg-[#0F8B7D] text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Upload size={13} /> Upload First Statutory NOC
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  obligations
                    .filter(o => categoryFilter === "all" || o.category === categoryFilter)
                    .map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 block">{o.name}</span>
                        <span className="text-[10px] text-slate-500">Ref: {o.certificateNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{o.category}</td>
                      <td className="py-3 px-3 text-slate-600">{o.authority}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{o.frequency}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{o.dueDate}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          o.status === "compliant" ? "bg-emerald-100 text-emerald-800" :
                          o.status === "expiring_soon" ? "bg-amber-100 text-amber-800" :
                          o.status === "due" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {!o.verified && (
                          <button
                            onClick={() => handleVerifyEvidence(o.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg cursor-pointer shadow-2xs"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setUploadObligationId(o.id);
                            setShowUploadModal(true);
                          }}
                          className="px-2 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer"
                        >
                          Upload
                        </button>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: 52-WEEK COMPLIANCE CALENDAR (CM-04)                                */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">52-Week Compliance Renewal Pipeline (CM-04)</h3>
              <p className="text-xs text-slate-500">Upcoming municipal statutory milestones, audits, and OEM renewals.</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              FY 2026–2027 Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-slate-900">Q2 · Sep 2026</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">1 Due</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Diesel Generator CPCB-IV Test</p>
                <p className="text-[11px] text-slate-500">Due: 30 Sep 2026 · Quarterly Audit</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-slate-900">Q3 · Oct – Nov 2026</span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">2 Renewals</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Pollution Board Consent (CTO)</p>
                  <p className="text-[11px] text-slate-500">Due: 31 Oct 2026 · SPCB Biennial</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Fire Safety NOC (Form-B)</p>
                  <p className="text-[11px] text-slate-500">Due: 30 Nov 2026 · Annual Municipal</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-slate-900">Q4 · Dec 2026 – Mar 2027</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">1 Renewal</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Lift Safety License (Form A)</p>
                <p className="text-[11px] text-slate-500">Due: 15 Dec 2026 · Electrical Inspectorate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: EVIDENCE VAULT & VERIFICATION (CM-05)                              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Statutory Evidence &amp; Certificate Vault (CM-05)</h3>
              <p className="text-xs text-slate-500">Audit-ready document storage with versioning and Compliance Manager sign-off.</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              + Upload Document
            </button>
          </div>

          {obligations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No certificate documents uploaded to vault yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {obligations.map(o => (
                <div key={o.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <FileText size={18} className="text-teal-700" />
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      o.verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {o.verified ? "Verified ✓" : "Pending Sign-Off"}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{o.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Authority: {o.authority}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{o.certificateNumber}</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => showToast(`Downloading official certificate for ${o.name}...`, "info")}
                      className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Download
                    </button>
                    {!o.verified && (
                      <button
                        onClick={() => handleVerifyEvidence(o.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: INCIDENTS & CAPA BOARD (CM-07, CM-08)                              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {(activeTab === "incidents" || activeTab === "capa") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Incident Register (CM-07)</h3>
                <p className="text-xs text-slate-500">Safety, environmental, and equipment failure incidents.</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {incidents.length} Logged
              </span>
            </div>

            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No incidents logged. Safety register is completely clean.
                </div>
              ) : (
                incidents.map(inc => (
                  <div key={inc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{inc.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        inc.severity === "critical" ? "bg-red-100 text-red-800 animate-pulse" :
                        inc.severity === "moderate" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{inc.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">Location: {inc.location}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Immediate Action: <strong>{inc.immediateAction}</strong></p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CAPA Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">CAPA Management (CM-08)</h3>
                <p className="text-xs text-slate-500">Corrective actions with BR-C08 verification closure rules.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {capas.filter(c => c.status !== "closed").length} Open Actions
              </span>
            </div>

            <div className="space-y-3">
              {capas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No open corrective or preventive actions.
                </div>
              ) : (
                capas.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{c.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.status === "closed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{c.action}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">Owner: {c.owner} · Due: <strong>{c.dueDate}</strong></p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-500">
                        Evidence: {c.evidenceAttached ? <strong className="text-emerald-700">Uploaded ✓</strong> : <span className="text-red-600">Missing</span>}
                      </span>

                      {c.status !== "closed" && (
                        <button
                          onClick={() => handleCloseCapa(c)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg font-bold cursor-pointer"
                        >
                          Close CAPA
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 6: PERMITS TO WORK (CM-09, BR-C11)                                    */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "permits" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Permit to Work (PTW) Governance (CM-09)</h3>
              <p className="text-xs text-slate-500">Hot work, height work, and confined space permits with BR-C11 contractor prerequisite checks.</p>
            </div>
            <button
              onClick={() => showToast("Permit request dialog initialized.", "info")}
              className="px-3.5 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              + Request Permit
            </button>
          </div>

          <div className="space-y-3">
            {permits.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active work permits. Issue Hot Work, Height Work, or Confined Space permits when contractors are on-site.
              </div>
            ) : (
              permits.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{p.id}</span>
                    <span className="font-black text-xs text-slate-900">{p.title}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      {p.permitType.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Contractor: <strong>{p.contractor}</strong> · Location: {p.location}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Controls: {p.riskControls}</p>

                  {!p.vendorPrerequisiteValid && (
                    <div className="mt-2 text-[10px] text-red-700 bg-red-100 p-1.5 rounded-lg font-bold flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>{p.prerequisiteError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    p.status === "active" ? "bg-emerald-100 text-emerald-800" :
                    p.status === "approval_blocked" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {p.status.replace("_", " ")}
                  </span>

                  {p.status === "pending_approval" && (
                    <button
                      onClick={() => handleApprovePermit(p)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Approve PTW
                    </button>
                  )}
                  {p.status === "approval_blocked" && (
                    <button
                      onClick={() => handleApprovePermit(p)}
                      className="px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Verify Prerequisite
                    </button>
                  )}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 7: 5x5 RISK MATRIX REGISTER (CM-13, BR-C10)                           */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "risks" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">5×5 EHS Risk Register (CM-13)</h3>
              <p className="text-xs text-slate-500">Inherent risk score = Likelihood × Impact (BR-C10); residual risk calculated post-mitigation.</p>
            </div>
            <button
              onClick={() => {
                const stmt = prompt("Enter Risk Statement:");
                const cat = prompt("Enter Risk Category (Fire, Structural, Environmental):");
                if (stmt && cat) {
                  const newR = {
                    id: `RSK-00${risks.length + 1}`,
                    category: cat,
                    statement: stmt,
                    likelihood: 3,
                    impact: 4,
                    inherentScore: 12,
                    rating: "HIGH",
                    mitigation: "Standard preventive engineering controls.",
                    residualLikelihood: 1,
                    residualImpact: 3,
                    residualScore: 3,
                    owner: "Safety Officer",
                    status: "mitigated"
                  };
                  setRisks(prev => [newR, ...prev]);
                  showToast("New risk recorded with 5x5 matrix scoring.", "success");
                }
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              + Register Risk
            </button>
          </div>

          <div className="space-y-3">
            {risks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No EHS risks identified. Safety matrix is clear.
              </div>
            ) : (
              risks.map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{r.id}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {r.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      r.inherentScore >= 16 ? "bg-red-100 text-red-800" :
                      r.inherentScore >= 10 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      Inherent: {r.inherentScore} ({r.rating})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Residual: {r.residualScore}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900">{r.statement}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Mitigation Controls: <strong className="text-slate-800">{r.mitigation}</strong>
                </p>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: UPLOAD STATUTORY EVIDENCE (CM-05)                                  */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in">
            <h4 className="text-base font-black text-slate-900">Upload Statutory Evidence</h4>
            <p className="text-xs text-slate-500 mt-0.5">Upload certified renewal report or certificate.</p>

            <form onSubmit={e => {
              e.preventDefault();
              showToast("Certificate evidence uploaded! Submitted to Compliance Manager for verification.", "success");
              setShowUploadModal(false);
            }} className="space-y-3.5 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Document Title</label>
                <input required placeholder="e.g. Fire Form B Renewal Certificate 2026" className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</label>
                  <input type="date" required className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</label>
                  <input type="date" required className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]" />
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                <Upload size={24} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-700">Drop PDF / Certificate Scan</p>
                <p className="text-[10px] text-slate-400">PDF, JPG up to 25MB</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
                >
                  Save &amp; Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

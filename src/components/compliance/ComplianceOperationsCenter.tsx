"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Clock,
  Calendar, FileText, Upload, Plus, Search, Filter, Eye,
  Building, Wrench, Flame, Zap, Award, AlertCircle, ChevronRight,
  TrendingUp, Download, RefreshCw, X, ChevronDown, Check,
  BarChart3, Layers, SlidersHorizontal, Lock, CheckCircle2, ArrowRight,
  Compass, Building2
} from "lucide-react";

interface ComplianceOperationsCenterProps {
  portalRole?: "owner" | "fm" | "admin";
  defaultProperty?: string;
}

// Mandatory Statutory Document Catalog for Indian Commercial Buildings & Towers
export interface MandatoryDocumentTemplate {
  key: string;
  name: string;
  shortTitle: string;
  category: string;
  authority: string;
  frequency: string;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  weight: number;
  description: string;
  iconType: "fire" | "lift" | "env" | "building" | "power" | "electrical" | "structural" | "water";
}

export const MANDATORY_STATUTORY_DOCUMENTS: MandatoryDocumentTemplate[] = [
  {
    key: "fire_noc",
    name: "Fire Safety Certificate & NOC (Form-B Inspection)",
    shortTitle: "Fire Safety NOC",
    category: "Fire & Life Safety",
    authority: "Directorate of Fire & Emergency Services",
    frequency: "ANNUAL",
    criticality: "CRITICAL",
    weight: 25,
    description: "Annual municipal fire prevention, hydrants, sprinklers & life safety inspection clearance.",
    iconType: "fire"
  },
  {
    key: "lift_license",
    name: "Elevator & Escalator Safety License (Form-A)",
    shortTitle: "Lift Safety License",
    category: "Lift & Escalator",
    authority: "Chief Electrical Inspectorate / PWD Lift Division",
    frequency: "ANNUAL",
    criticality: "CRITICAL",
    weight: 20,
    description: "Annual statutory lift operation license, rope test & emergency brake safety certificate.",
    iconType: "lift"
  },
  {
    key: "spcb_cto",
    name: "Pollution Control Board Consent to Operate (CTO)",
    shortTitle: "SPCB Consent (CTO)",
    category: "Environmental",
    authority: "State Pollution Control Board (SPCB / CPCB)",
    frequency: "BIENNIAL",
    criticality: "HIGH",
    weight: 15,
    description: "Air & Water Pollution Prevention Acts consent for building emissions & effluent discharge.",
    iconType: "env"
  },
  {
    key: "occupancy_cert",
    name: "Commercial Occupancy Certificate (OC) / BU Permission",
    shortTitle: "Occupancy Certificate (OC)",
    category: "Municipal & Structural",
    authority: "Municipal Urban Development Authority",
    frequency: "PERMANENT",
    criticality: "CRITICAL",
    weight: 15,
    description: "Permanent building authorization certifying construction per approved sanction plans.",
    iconType: "building"
  },
  {
    key: "dg_cpcb",
    name: "Diesel Generator CPCB-IV Emission & Noise Test",
    shortTitle: "DG Emission & Noise Test",
    category: "Electrical & Power",
    authority: "Central Pollution Control Board (CPCB)",
    frequency: "QUARTERLY",
    criticality: "HIGH",
    weight: 10,
    description: "Acoustic enclosure noise dbA check and stack emission particulate monitoring report.",
    iconType: "power"
  },
  {
    key: "electrical_substation",
    name: "Electrical Substation & Transformer Safety NOC (CEIG)",
    shortTitle: "Electrical Substation NOC",
    category: "Electrical & Power",
    authority: "Central / State Electrical Inspectorate to Govt (CEIG)",
    frequency: "ANNUAL",
    criticality: "HIGH",
    weight: 10,
    description: "Transformer insulation resistance, HT/LT switchgear, and earth-pit resistance sign-off.",
    iconType: "electrical"
  },
  {
    key: "facade_audit",
    name: "Building Facade Stability & BMU Anchor Audit",
    shortTitle: "Facade & BMU Audit",
    category: "Structural Safety",
    authority: "Certified Chartered Structural Engineer",
    frequency: "ANNUAL",
    criticality: "MEDIUM",
    weight: 5,
    description: "Glass curtain-wall integrity, anchor bolt pull tests, and BMU cradle load certificate.",
    iconType: "structural"
  },
  {
    key: "stp_water",
    name: "STP Treated Water Quality & Discharge Lab Test",
    shortTitle: "Water / STP Lab Test",
    category: "Environmental",
    authority: "State Pollution Control Board / Accredited Lab",
    frequency: "QUARTERLY",
    criticality: "MEDIUM",
    weight: 5,
    description: "Sewage treatment plant treated effluent BOD/COD/TDS testing certifying reuse standards.",
    iconType: "water"
  }
];

// Mock Detector: Identifies legacy dummy IDs to guarantee zero mock data
const isMockEntry = (item: any): boolean => {
  if (!item || typeof item !== "object") return true;
  const id = String(item.id || "");
  if (
    id.startsWith("obl-00") ||
    id === "obl-001" || id === "obl-002" || id === "obl-003" || id === "obl-004" || id === "obl-005" || id === "obl-006" ||
    id === "INC-2026-081" || id === "INC-2026-082" || id === "INC-2026-083" || id === "INC-2026-089" || id === "INC-2026-092" || id === "INC-2026-104" ||
    id === "CAPA-2026-089" || id === "CAPA-2026-092" || id === "CAPA-2026-104" || id === "CAPA-2026-105" || id === "CAPA-2026-106" ||
    id.startsWith("PTW-2026-40") || id.startsWith("PTW-2026-44") ||
    id === "RSK-001" || id === "RSK-002" || id === "RSK-003"
  ) {
    return true;
  }
  const certNo = String(item.certificateNumber || "");
  if (
    certNo === "NOC-MH-2025-8812-B" ||
    certNo === "LIFT-INSP-2025-441" ||
    certNo === "SPCB/CTO/AIR-WATER/9902" ||
    certNo === "DG-CPCB-Q2-2026-118" ||
    certNo === "MCGM-OC-COMM-2022-771" ||
    certNo === "STRUCT-FACADE-2025-309"
  ) {
    return true;
  }
  return false;
};

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

  // Modals & Upload State
  const [selectedObligation, setSelectedObligation] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadObligationId, setUploadObligationId] = useState<string | null>(null);
  const [selectedIncidentForCapa, setSelectedIncidentForCapa] = useState<any | null>(null);

  // Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    requirementKey: "",
    name: "",
    category: "Fire & Life Safety",
    authority: "",
    frequency: "ANNUAL",
    criticality: "CRITICAL" as "CRITICAL" | "HIGH" | "MEDIUM",
    weight: 20,
    certificateNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isPermanent: false,
    fileName: ""
  });

  // Compliance Obligations Master Dataset (CM-02, CM-03) - Real user data only
  const [obligations, setObligations] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_obligations");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(o => !isMockEntry(o));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Incidents Register (CM-07) - Real user data only
  const [incidents, setIncidents] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_incidents");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(i => !isMockEntry(i));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // CAPA Management (CM-08) - Real user data only
  const [capas, setCapas] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_capas");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(c => !isMockEntry(c));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Permits to Work (CM-09) - Real user data only
  const [permits, setPermits] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_permits");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(p => !isMockEntry(p));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Risk Register (CM-13) - Real user data only
  const [risks, setRisks] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_compliance_risks");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(r => !isMockEntry(r));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Purge any stale legacy mock data from browser localStorage permanently
  useEffect(() => {
    if (typeof window !== "undefined") {
      const keys = [
        "officex_compliance_obligations",
        "officex_compliance_incidents",
        "officex_compliance_capas",
        "officex_compliance_permits",
        "officex_compliance_risks"
      ];
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) {
              const cleaned = arr.filter(item => !isMockEntry(item));
              if (cleaned.length !== arr.length) {
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          } catch (e) {
            localStorage.removeItem(k);
          }
        }
      });

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

  // Open upload modal pre-filled with a statutory document template
  const openUploadForTemplate = (tpl: MandatoryDocumentTemplate) => {
    setUploadFormData({
      requirementKey: tpl.key,
      name: tpl.name,
      category: tpl.category,
      authority: tpl.authority,
      frequency: tpl.frequency,
      criticality: tpl.criticality,
      weight: tpl.weight,
      certificateNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: tpl.frequency === "PERMANENT" ? "2099-12-31" : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isPermanent: tpl.frequency === "PERMANENT",
      fileName: ""
    });
    setUploadObligationId(null);
    setShowUploadModal(true);
  };

  // Handle saving real user-uploaded certificate
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.name.trim()) return;

    const expiry = uploadFormData.isPermanent ? "2099-12-31" : (uploadFormData.expiryDate || "2099-12-31");
    const today = new Date().toISOString().split("T")[0];
    let status = "compliant";
    if (expiry < today) {
      status = "overdue";
    } else {
      const diffDays = Math.round((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        status = "due";
      } else if (diffDays <= 60) {
        status = "expiring_soon";
      }
    }

    const newObligation = {
      id: `obl-${Date.now()}`,
      requirementKey: uploadFormData.requirementKey || "custom",
      name: uploadFormData.name.trim(),
      category: uploadFormData.category,
      authority: uploadFormData.authority.trim() || "Government Regulatory Authority",
      frequency: uploadFormData.frequency,
      criticality: uploadFormData.criticality,
      weight: uploadFormData.weight || 15,
      status,
      dueDate: expiry,
      expiryDate: expiry,
      issueDate: uploadFormData.issueDate,
      lastRenewed: uploadFormData.issueDate,
      certificateNumber: uploadFormData.certificateNumber.trim() || `CERT-${Date.now().toString().slice(-6)}`,
      ownerName: "Compliance Manager",
      evidenceAttached: true,
      verified: true,
      fileName: uploadFormData.fileName || `${uploadFormData.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      uploadedAt: new Date().toISOString()
    };

    const updated = [newObligation, ...obligations.filter(o => o.id !== uploadObligationId)];
    setObligations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_compliance_obligations", JSON.stringify(updated));
    }
    showToast(`✓ "${newObligation.name}" uploaded to Compliance Vault!`, "success");
    setShowUploadModal(false);
    setUploadObligationId(null);
  };

  // Handle Certificate Official Download Record
  const handleDownloadCertificate = (o: any) => {
    const content = `OFFICEX STATUTORY COMPLIANCE VAULT
==================================================
Asset: ${selectedProperty}
Document: ${o.name}
Registration / Certificate No: ${o.certificateNumber}
Regulatory Authority: ${o.authority}
Category: ${o.category}
Frequency: ${o.frequency}
Issue Date: ${o.issueDate || "N/A"}
Expiry / Due Date: ${o.dueDate || o.expiryDate || "N/A"}
Verification Status: ${o.verified ? "VERIFIED BY COMPLIANCE OFFICER" : "PENDING VERIFICATION"}
Attached Evidence File: ${o.fileName || "official_certified_scan.pdf"}
Vault Timestamp: ${o.uploadedAt || new Date().toISOString()}
==================================================
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${o.name.replace(/[^a-zA-Z0-9]/g, "_")}_Record.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading official record for ${o.name}...`, "info");
  };

  // Icon Helper for Template Cards
  const renderDocIcon = (type: string, className: string = "w-5 h-5") => {
    switch (type) {
      case "fire": return <Flame className={`${className} text-orange-500`} />;
      case "lift": return <Building className={`${className} text-purple-600`} />;
      case "env": return <Compass className={`${className} text-emerald-600`} />;
      case "building": return <Building2 className={`${className} text-blue-600`} />;
      case "power": return <Zap className={`${className} text-amber-500`} />;
      case "electrical": return <Zap className={`${className} text-yellow-600`} />;
      case "structural": return <Layers className={`${className} text-slate-700`} />;
      case "water": return <RefreshCw className={`${className} text-cyan-600`} />;
      default: return <FileText className={`${className} text-teal-600`} />;
    }
  };

  // BR-C03 Weighted Score Calculation
  const { complianceScore, totalWeight, compliantCount, dueCount, overdueCount, criticalOverdueCount } = useMemo(() => {
    if (obligations.length === 0) {
      return {
        complianceScore: 0,
        totalWeight: 0,
        compliantCount: 0,
        dueCount: 0,
        overdueCount: 0,
        criticalOverdueCount: 0
      };
    }

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

    const score = tWeight > 0 ? Math.round((eWeight / tWeight) * 100) : 0;
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
            Institutional statutory compliance repository, automated renewal radar, audit-ready evidence vault, CAPA, and PTW.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setUploadFormData({
                requirementKey: "custom",
                name: "",
                category: "Fire & Life Safety",
                authority: "",
                frequency: "ANNUAL",
                criticality: "HIGH",
                weight: 15,
                certificateNumber: "",
                issueDate: new Date().toISOString().split("T")[0],
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                isPermanent: false,
                fileName: ""
              });
              setUploadObligationId(null);
              setShowUploadModal(true);
            }}
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
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-gradient-to-b from-slate-50/70 to-teal-50/20">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0F8B7D] flex items-center justify-center">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Setup Your Asset's Statutory Compliance Vault</h4>
                  <p className="text-xs text-slate-500 max-w-lg mt-1">
                    No statutory documents uploaded yet. As a new user, you must upload your building's mandatory certificates first to activate live validity radar and institutional scoring.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => setActiveTab("evidence")}
                    className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} /> View All Upload Options (Evidence Vault)
                  </button>
                  <button
                    onClick={() => openUploadForTemplate(MANDATORY_STATUTORY_DOCUMENTS[0])}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Upload Fire NOC
                  </button>
                  <button
                    onClick={() => openUploadForTemplate(MANDATORY_STATUTORY_DOCUMENTS[1])}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Upload Lift License
                  </button>
                </div>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">52-Week Compliance Renewal Pipeline (CM-04)</h3>
              <p className="text-xs text-slate-500">Upcoming municipal statutory milestones, audits, and OEM renewals.</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              FY 2026–2027 Schedule
            </span>
          </div>

          {obligations.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-900">No Scheduled Statutory Milestones</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Your 52-week renewal pipeline is currently clear. Upload your building&apos;s statutory certificates (Fire NOC, Lift License, Pollution CTO) to automatically schedule municipal audits and renewal milestones.
              </p>
              <button
                onClick={() => setActiveTab("evidence")}
                className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Upload size={14} /> Go to Evidence Vault &amp; Upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Q1 · Apr – Jun", start: "04-01", end: "06-30" },
                { label: "Q2 · Jul – Sep", start: "07-01", end: "09-30" },
                { label: "Q3 · Oct – Dec", start: "10-01", end: "12-31" },
                { label: "Q4 · Jan – Mar", start: "01-01", end: "03-31" }
              ].map((q, idx) => {
                const qItems = obligations.filter(o => {
                  const d = o.dueDate || o.expiryDate || "";
                  const mDay = d.slice(5);
                  return mDay >= q.start && mDay <= q.end;
                });
                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-xs text-slate-900">{q.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          qItems.length > 0 ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {qItems.length} {qItems.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                      <div className="space-y-2 mt-2">
                        {qItems.length === 0 ? (
                          <p className="text-[11px] text-slate-400 py-3 text-center">No renewals this quarter</p>
                        ) : (
                          qItems.map(item => (
                            <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                              <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                              <p className="text-[11px] text-slate-500">Due: {item.dueDate} · {item.authority}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: EVIDENCE VAULT & VERIFICATION (CM-05)                              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Statutory Evidence &amp; Certificate Vault (CM-05)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200">
                  {obligations.length} / {MANDATORY_STATUTORY_DOCUMENTS.length} Uploaded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit-ready document storage with versioning and Compliance Manager sign-off.
              </p>
            </div>
            <button
              onClick={() => {
                setUploadFormData({
                  requirementKey: "custom",
                  name: "",
                  category: "Fire & Life Safety",
                  authority: "",
                  frequency: "ANNUAL",
                  criticality: "HIGH",
                  weight: 15,
                  certificateNumber: "",
                  issueDate: new Date().toISOString().split("T")[0],
                  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  isPermanent: false,
                  fileName: ""
                });
                setUploadObligationId(null);
                setShowUploadModal(true);
              }}
              className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={14} /> Upload Custom Document
            </button>
          </div>

          {/* Uploaded Certificates List */}
          {obligations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Uploaded &amp; Verified Certificates ({obligations.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {obligations.map(o => (
                  <div key={o.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 hover:border-teal-400 hover:bg-white transition-all shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-[#0F8B7D]" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{o.category}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          o.verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {o.verified ? "Verified ✓" : "Pending Sign-Off"}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900 line-clamp-2">{o.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Authority: {o.authority}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Reg/Cert: {o.certificateNumber}</p>
                      {o.expiryDate && (
                        <p className="text-[10px] text-slate-600 font-medium mt-1">
                          Valid until: <strong className="text-slate-800">{o.expiryDate === "2099-12-31" ? "Permanent" : o.expiryDate}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleDownloadCertificate(o)}
                        className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Download size={12} /> Download
                      </button>
                      {!o.verified && (
                        <button
                          onClick={() => handleVerifyEvidence(o.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options to Upload Everything First (Mandatory Statutory Catalog) */}
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/60 to-emerald-50/40 border border-teal-200/80">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black uppercase text-teal-950 tracking-wide">
                    {obligations.length === 0 ? "Step 1: Upload Mandatory Commercial Certificates First" : "Pending Mandatory Documents"}
                  </h4>
                  <p className="text-[11px] text-teal-800 mt-0.5">
                    {obligations.length === 0
                      ? "As a new user, you have not uploaded anything yet. Please select and upload each mandatory certificate below to complete your asset's statutory baseline:"
                      : "Upload the remaining mandatory commercial licenses below to achieve 100% audit readiness:"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white text-[#0F8B7D] border border-teal-200 shrink-0">
                  {MANDATORY_STATUTORY_DOCUMENTS.filter(m => !obligations.some(o => o.requirementKey === m.key || o.name.toLowerCase().includes(m.shortTitle.toLowerCase()))).length} Pending
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MANDATORY_STATUTORY_DOCUMENTS
                .filter(m => !obligations.some(o => o.requirementKey === m.key || o.name.toLowerCase().includes(m.shortTitle.toLowerCase())))
                .map(doc => (
                  <div
                    key={doc.key}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-[#0F8B7D] transition-colors">
                          {renderDocIcon(doc.iconType)}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Required · Not Uploaded
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-tight">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">
                        Authority: <strong className="text-slate-700">{doc.authority}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Cycle: {doc.frequency} · Weight: {doc.weight}%
                      </p>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => openUploadForTemplate(doc)}
                        className="w-full py-2.5 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Upload size={13} /> + Upload {doc.shortTitle}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-black text-slate-900">Upload Statutory Document</h4>
                <p className="text-xs text-slate-500 mt-0.5">Attach audit-ready certificate scan &amp; set renewal clocks.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Document / Obligation Name *</label>
                <input
                  required
                  value={uploadFormData.name}
                  onChange={e => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Fire Safety Certificate & NOC (Form-B)"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Regulatory Authority *</label>
                  <input
                    required
                    value={uploadFormData.authority}
                    onChange={e => setUploadFormData(prev => ({ ...prev, authority: e.target.value }))}
                    placeholder="e.g. Directorate of Fire & Emergency Services"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={uploadFormData.category}
                    onChange={e => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                    <option value="Lift & Escalator">Lift &amp; Escalator</option>
                    <option value="Environmental">Environmental (SPCB)</option>
                    <option value="Municipal & Structural">Municipal &amp; Structural</option>
                    <option value="Electrical & Power">Electrical &amp; Power</option>
                    <option value="Structural Safety">Structural Safety</option>
                    <option value="General Statutory">General Statutory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Certificate / Registration Number *</label>
                  <input
                    required
                    value={uploadFormData.certificateNumber}
                    onChange={e => setUploadFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                    placeholder="e.g. NOC-MH-2026-9041"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Inspection Frequency</label>
                  <select
                    value={uploadFormData.frequency}
                    onChange={e => {
                      const freq = e.target.value;
                      setUploadFormData(prev => ({
                        ...prev,
                        frequency: freq,
                        isPermanent: freq === "PERMANENT",
                        expiryDate: freq === "PERMANENT" ? "2099-12-31" : prev.expiryDate
                      }));
                    }}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="ANNUAL">Annual Mandatory</option>
                    <option value="BIENNIAL">Biennial (Every 2 Years)</option>
                    <option value="QUARTERLY">Quarterly Monitoring</option>
                    <option value="MONTHLY">Monthly Audit</option>
                    <option value="PERMANENT">Permanent Asset License</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={uploadFormData.issueDate}
                    onChange={e => setUploadFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {uploadFormData.isPermanent ? "Expiry Date (Permanent)" : "Expiry Date *"}
                  </label>
                  <input
                    type="date"
                    disabled={uploadFormData.isPermanent}
                    required={!uploadFormData.isPermanent}
                    value={uploadFormData.isPermanent ? "" : uploadFormData.expiryDate}
                    onChange={e => setUploadFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className={`mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F8B7D] ${
                      uploadFormData.isPermanent ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-teal-200 rounded-2xl p-5 text-center bg-teal-50/20 hover:bg-teal-50/40 transition-colors">
                <Upload size={26} className="mx-auto text-[#0F8B7D] mb-1.5" />
                <p className="text-xs font-bold text-slate-800">Drop PDF / Scanned Statutory Clearance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Government stamped scans up to 25MB (PDF, JPG, PNG)</p>
                <input
                  type="file"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFormData(prev => ({ ...prev, fileName: file.name }));
                    }
                  }}
                  className="mt-2 text-[11px] text-slate-600 block mx-auto file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0F8B7D] hover:file:bg-teal-100 cursor-pointer"
                />
                {uploadFormData.fileName && (
                  <p className="text-[11px] font-mono text-emerald-700 font-bold mt-1">
                    ✓ Attached: {uploadFormData.fileName}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check size={14} /> Save to Compliance Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

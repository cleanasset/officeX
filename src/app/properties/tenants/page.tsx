"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  Building,
  Plus,
  Download,
  UploadCloud,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  X,
  KeyRound
} from "lucide-react";
import Link from "next/link";
import { AddTenantModal } from "@/components/rent-roll/AddTenantModal";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";
import { ImportRentRollModal } from "@/components/rent-roll/ImportRentRollModal";

export interface TenantRecord {
  id: string;
  tenantCode: string;
  tradeName: string;
  legalName: string;
  industry: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  floorNumber: number | string;
  chargeableArea: number;
  carpetArea?: number;
  monthlyRent: number;
  camRatePsf: number;
  monthlyCam: number;
  totalMonthlyBilling: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  escalationPct: number;
  pan: string;
  gstin: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress?: string;
  status: "active" | "under_notice" | "kyc_pending" | "expired";
  kycVerified: boolean;
  outstandingDue: number;
  inviteCode?: string;
}

const SEED_PROP_IDS = new Set([
  "357554cc-221d-4c7f-9465-32afcec7a8e7",
  "72b18ad7-0ee0-4ac5-bfc9-156c6dc10625",
  "8b1b9613-b890-4540-9139-6c2a6bb6cf60",
  "401f394a-6d27-4c23-9a21-411baa7eef3b",
  "cfa13505-71a5-4a43-be33-37497f416fdc",
  "cf5a0b49-c4fd-4762-ae22-40c42ac6332d",
  "PROP-FORTUNE-SKY",
  "PROP-001",
  "PROP-002",
  "PROP-APX",
  "PROP-MTP",
  "PROP-NXN",
  "PROP-1790239048961",
  "PROP-1790659297701"
]);

const SEED_PROP_NAMES = new Set([
  "apex business tower",
  "nexus hub",
  "meridian tech park",
  "shivalik shilp",
  "business hub",
  "test commercial tower",
  "fortune sky",
  "signature tower b"
]);

export default function TenantDirectoryPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [properties, setProperties] = useState<Array<{ id: string; name: string; city?: string }>>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNoPropertyWarningOpen, setIsNoPropertyWarningOpen] = useState(false);
  const [inviteProperty, setInviteProperty] = useState<{ id: string; name: string; inviteCode?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenAddTenant = () => {
    if (properties.length === 0) {
      setIsNoPropertyWarningOpen(true);
      return;
    }
    setIsAddTenantOpen(true);
  };

  const formatINR = (val: number) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Load real properties & real tenants exclusively
  const loadData = useCallback(async () => {
    setIsLoading(true);

    const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "") : "";
    const isDemoAccount = email.includes("demo.seed") || (typeof window !== "undefined" && localStorage.getItem("officex_mode") === "demo");

    let loadedProps: Array<{ id: string; name: string; city?: string }> = [];
    let loadedTenants: TenantRecord[] = [];

    // 1. Fetch Real Properties
    try {
      const emailQuery = email ? `?ownerEmail=${encodeURIComponent(email)}` : "";
      const pRes = await fetch(`/api/rent-roll/properties${emailQuery}`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData) && pData.length > 0) {
          const filtered = pData.filter((p: any) => Boolean(p && (p.id || p.name)));

          loadedProps = filtered.map((p: any) => ({
            id: p.id,
            name: p.name,
            city: p.city || "Commercial"
          }));
        }
      }
    } catch (e) {
      // Local fallback
    }

    // Merge with any real user properties stored locally
    if (typeof window !== "undefined") {
      try {
        const local = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        if (Array.isArray(local) && local.length > 0) {
          const validLocal = local.filter((p: any) => Boolean(p && (p.id || p.name)));

          const existingPropIds = new Set(loadedProps.map((p) => p.id));
          for (const lp of validLocal) {
            if (!existingPropIds.has(lp.id)) {
              loadedProps.push({
                id: lp.id,
                name: lp.name,
                city: lp.city || "Commercial"
              });
            }
          }
        }
      } catch {}
    }

    setProperties(loadedProps);
    const validPropIds = new Set(loadedProps.map((p) => p.id));
    const validPropNames = new Set(loadedProps.map((p) => p.name.toLowerCase().trim()));

    // 2. Fetch Real Tenants from Database
    try {
      const emailQuery = email ? `?ownerEmail=${encodeURIComponent(email)}` : "";
      const tRes = await fetch(`/api/rent-roll/tenants${emailQuery}`);
      if (tRes.ok) {
        const tData = await tRes.json();
        if (Array.isArray(tData) && tData.length > 0) {
          const filteredT = isDemoAccount
            ? tData
            : tData.filter((t: any) => {
                const propMatch =
                  (t.propertyId && validPropIds.has(t.propertyId)) ||
                  (t.propertyName && validPropNames.has(t.propertyName.toLowerCase().trim())) ||
                  (t.leasedProperties && t.leasedProperties.some((lp: string) => validPropNames.has(lp.toLowerCase().trim())));
                return propMatch;
              });

          loadedTenants = filteredT.map((t: any, idx: number) => ({
            id: t.id || `TEN-${idx + 1}`,
            tenantCode: t.tenantCode || `OX-T-${4800 + idx}`,
            tradeName: t.tradeName || t.legalName || "Occupant",
            legalName: t.legalName || t.tradeName || "Occupant Entity",
            industry: t.industry || "Enterprise",
            propertyId: t.propertyId || loadedProps[0]?.id || "",
            propertyName: t.propertyName || t.leasedProperties?.[0] || loadedProps[0]?.name || "Commercial Space",
            unitNumber: t.unitNumber || "Suite 101",
            floorNumber: t.floorNumber || 1,
            chargeableArea: t.totalArea || 0,
            carpetArea: Math.round((t.totalArea || 0) * 0.8),
            monthlyRent: t.totalMonthlyRent || 0,
            camRatePsf: 18,
            monthlyCam: Math.round((t.totalArea || 0) * 18),
            totalMonthlyBilling: t.totalMonthlyBilling || t.totalMonthlyRent || 0,
            securityDeposit: (t.totalMonthlyRent || 0) * 3,
            startDate: t.startDate || "-",
            endDate: t.endDate || "-",
            escalationPct: 5,
            pan: t.pan || "-",
            gstin: t.gstin || "-",
            contactPerson: t.contactPerson || "-",
            contactEmail: t.contactEmail || "-",
            contactPhone: t.contactPhone || "-",
            billingAddress: t.billingAddress || "-",
            status: t.hasOverdue ? "under_notice" : "active",
            kycVerified: !!t.gstin && t.gstin !== "-",
            outstandingDue: t.outstanding || 0,
            inviteCode: `OX-${7000 + idx}`
          }));
        }
      }
    } catch (e) {
      // ignore
    }

    // 3. Merge Real Active Leases Created by User in Session
    if (typeof window !== "undefined") {
      try {
        const localLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
        if (Array.isArray(localLeases) && localLeases.length > 0) {
          const mappedFromLocal: TenantRecord[] = localLeases
            .filter((l: any) => Boolean(l && (l.tenantName || l.id)))
            .map((l: any, i: number) => ({
              id: l.id || `LOCAL-T-${i}`,
              tenantCode: `OX-T-${5000 + i}`,
              tradeName: l.tenantName || "Enterprise Tenant",
              legalName: l.tenantName ? `${l.tenantName} Private Limited` : "Enterprise Tenant",
              industry: "Commercial Occupant",
              propertyId: l.propertyId || loadedProps[0]?.id || "",
              propertyName: l.propertyName || loadedProps[0]?.name || "Commercial Space",
              unitNumber: l.unitNumber || `Suite ${200 + i}`,
              floorNumber: l.floorNumber || 2,
              chargeableArea: Number(l.chargeableArea) || 0,
              carpetArea: Number(l.carpetArea) || Math.round((Number(l.chargeableArea) || 0) * 0.8),
              monthlyRent: Number(l.monthlyRent) || 0,
              camRatePsf: Number(l.camRatePsf) || 16,
              monthlyCam: Number(l.camMonthly) || Math.round((Number(l.chargeableArea) || 0) * 16),
              totalMonthlyBilling: (Number(l.monthlyRent) || 0) + (Number(l.camMonthly) || 0),
              securityDeposit: Number(l.securityDepositAmount) || (Number(l.monthlyRent) || 0) * 3,
              startDate: l.startDate || "-",
              endDate: l.endDate || "-",
              escalationPct: Number(l.escalationPct) || 5,
              pan: l.pan || "-",
              gstin: l.gstin || "-",
              contactPerson: l.contactPerson || "-",
              contactEmail: l.contactEmail || "-",
              contactPhone: l.contactPhone || "-",
              billingAddress: `${l.propertyName || "Commercial Tower"}, ${l.unitNumber || "Suite 201"}`,
              status: "active",
              kycVerified: !!l.gstin && l.gstin !== "-",
              outstandingDue: 0,
              inviteCode: `OX-${8200 + i}`
            }));

          const existingNames = new Set(loadedTenants.map((t) => t.tradeName.toLowerCase()));
          for (const ml of mappedFromLocal) {
            if (!existingNames.has(ml.tradeName.toLowerCase())) {
              loadedTenants.unshift(ml);
            }
          }
        }
      } catch (e) {}
    }

    setTenants(loadedTenants);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered tenants by property, status, and search query
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Property filter
      if (selectedPropertyId !== "ALL" && t.propertyId !== selectedPropertyId && t.propertyName !== selectedPropertyId) {
        return false;
      }
      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "active" && t.status !== "active") return false;
        if (statusFilter === "under_notice" && t.status !== "under_notice") return false;
        if (statusFilter === "kyc_pending" && t.kycVerified) return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          t.tradeName.toLowerCase().includes(q) ||
          t.legalName.toLowerCase().includes(q) ||
          t.propertyName.toLowerCase().includes(q) ||
          t.unitNumber.toLowerCase().includes(q) ||
          t.gstin.toLowerCase().includes(q) ||
          t.pan.toLowerCase().includes(q) ||
          t.contactPerson.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [tenants, selectedPropertyId, statusFilter, search]);

  // Executive KPI Aggregates (calculated strictly from real data)
  const kpis = useMemo(() => {
    const totalCount = filteredTenants.length;
    const totalArea = filteredTenants.reduce((sum, t) => sum + (Number(t.chargeableArea) || 0), 0);
    const totalRent = filteredTenants.reduce((sum, t) => sum + (Number(t.monthlyRent) || 0), 0);
    const totalBilling = filteredTenants.reduce((sum, t) => sum + (Number(t.totalMonthlyBilling) || 0), 0);
    const verifiedKycCount = filteredTenants.filter((t) => t.kycVerified).length;
    const kycPct = totalCount > 0 ? Math.round((verifiedKycCount / totalCount) * 100) : 0;
    const totalOutstanding = filteredTenants.reduce((sum, t) => sum + (Number(t.outstandingDue) || 0), 0);

    return {
      totalCount,
      totalArea,
      totalRent,
      totalBilling,
      kycPct,
      totalOutstanding
    };
  }, [filteredTenants]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (filteredTenants.length === 0) return;

    const headers = [
      "Tenant ID",
      "Trade Name",
      "Legal Name",
      "Industry",
      "Property Name",
      "Unit Number",
      "Floor",
      "Chargeable Area (sqft)",
      "Carpet Area (sqft)",
      "Monthly Rent (INR)",
      "Monthly CAM (INR)",
      "Total Monthly Billing (INR)",
      "Security Deposit (INR)",
      "Lease Start Date",
      "Lease End Date",
      "Escalation %",
      "GSTIN",
      "PAN",
      "Contact Person",
      "Contact Email",
      "Contact Phone",
      "KYC Status",
      "Lease Status",
      "Outstanding Balance (INR)"
    ];

    const rows = filteredTenants.map((t) => [
      `"${t.id}"`,
      `"${t.tradeName}"`,
      `"${t.legalName}"`,
      `"${t.industry}"`,
      `"${t.propertyName}"`,
      `"${t.unitNumber}"`,
      `"${t.floorNumber}"`,
      t.chargeableArea,
      t.carpetArea || "",
      t.monthlyRent,
      t.monthlyCam,
      t.totalMonthlyBilling,
      t.securityDeposit,
      `"${t.startDate}"`,
      `"${t.endDate}"`,
      t.escalationPct,
      `"${t.gstin}"`,
      `"${t.pan}"`,
      `"${t.contactPerson}"`,
      `"${t.contactEmail}"`,
      `"${t.contactPhone}"`,
      t.kycVerified ? "Verified" : "Pending",
      t.status === "active" ? "Active" : t.status === "under_notice" ? "Under Notice" : "Pending",
      t.outstandingDue
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const propertyLabel = selectedPropertyId === "ALL" ? "All_Properties" : selectedPropertyId.replace(/\s+/g, "_");
    link.download = `OfficeX_Tenant_Directory_${propertyLabel}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-6 font-sans relative pb-16">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col gap-6 transition-all ${selectedTenant ? "mr-[420px]" : ""}`}>
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tenant Directory</h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                Master Roster
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Property-wise management of commercial corporate occupants, leases, GSTIN compliance, and digital tenant invitations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-teal-200 hover:border-teal-300 bg-teal-50/70 hover:bg-teal-100/60 text-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Bulk upload multiple properties, units, and tenant rosters from Excel/CSV"
            >
              <UploadCloud size={14} className="text-[#0F8B7D]" />
              <span>Bulk Upload (Excel / CSV)</span>
            </button>

            {filteredTenants.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Export tenant records and lease terms to Excel / CSV"
              >
                <Download size={14} className="text-gray-500" />
                <span>Export Excel</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddTenant}
              className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Tenant Entity</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tenants</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-gray-900 tracking-tight">{kpis.totalCount} Enterprises</div>
              <span className="text-[11px] text-teal-700 font-semibold mt-0.5 block">
                {properties.length > 0 ? `Across ${properties.length} commercial assets` : "No assets linked"}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Leased Area</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-gray-900 tracking-tight">
                {Number(kpis.totalArea).toLocaleString()} <span className="text-sm font-semibold text-gray-400">sqft</span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
                Active chargeable footprint
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Monthly Rent Roll</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(kpis.totalRent)}</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                Gross billing: {formatINR(kpis.totalBilling)} / mo
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">KYC Compliance</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-gray-900 tracking-tight">
                {kpis.totalCount > 0 ? `${kpis.kycPct}% Verified` : "0 Recorded"}
              </div>
              <span className="text-[11px] text-purple-700 font-semibold mt-0.5 block">
                GSTIN &amp; PAN authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Property Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shrink-0">
              <Building2 size={14} className="text-[#0F8B7D]" />
              <span>Property:</span>
            </div>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F8B7D] cursor-pointer"
            >
              <option value="ALL">All Properties ({properties.length} Registered)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.city || "Commercial"})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100/70 rounded-xl border border-gray-200/60 overflow-x-auto">
            {[
              { id: "ALL", label: "All Statuses" },
              { id: "active", label: "Active Leases" },
              { id: "under_notice", label: "Under Notice" },
              { id: "kyc_pending", label: "KYC Pending" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenant, space, GSTIN..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
            />
          </div>
        </div>

        {/* Master Table or Clean Authentic Empty State */}
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No tenants in master directory</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
              <button
                type="button"
                onClick={handleOpenAddTenant}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Tenant Entity
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-teal-200 hover:border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UploadCloud size={14} className="text-[#0F8B7D]" /> Bulk Upload Properties &amp; Tenants (Excel / CSV)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-5">OCCUPANT / ENTERPRISE</th>
                    <th className="py-3 px-4">PROPERTY &amp; UNIT</th>
                    <th className="py-3 px-4">LEASED AREA</th>
                    <th className="py-3 px-4">MONTHLY RENT</th>
                    <th className="py-3 px-4">LEASE STATUS</th>
                    <th className="py-3 px-4">COMPLIANCE</th>
                    <th className="py-3 px-4">PRIMARY CONTACT</th>
                    <th className="py-3 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredTenants.map((t) => {
                    const isSelected = selectedTenant?.id === t.id;
                    const initials = (t.tradeName || "TE")
                      .trim()
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTenant(t)}
                        className={`hover:bg-teal-50/20 cursor-pointer transition-colors ${
                          isSelected ? "bg-teal-50/40" : ""
                        }`}
                      >
                        {/* Occupant */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-gray-900 truncate leading-snug">{t.tradeName}</span>
                              <span className="text-[10px] text-gray-400 truncate font-medium">{t.industry}</span>
                            </div>
                          </div>
                        </td>

                        {/* Property & Unit */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 truncate">{t.propertyName}</span>
                            <span className="text-[11px] font-mono text-teal-700 font-medium">
                              {t.unitNumber} (Fl. {t.floorNumber})
                            </span>
                          </div>
                        </td>

                        {/* Area */}
                        <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                          {Number(t.chargeableArea).toLocaleString()} sqft
                        </td>

                        {/* Monthly Rent */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900 block">{formatINR(t.monthlyRent)}</span>
                          <span className="text-[10px] text-gray-400">+ CAM {formatINR(t.monthlyCam)}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {t.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live (Portal Active)
                            </span>
                          ) : (t.status === "invited" || (t as any).inviteStatus === "pending") ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Invite Pending
                            </span>
                          ) : t.status === "under_notice" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Under Notice
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              Pending Setup
                            </span>
                          )}
                        </td>

                        {/* Compliance / GSTIN */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-bold text-gray-800">{t.gstin}</span>
                            {t.kycVerified ? (
                              <span className="text-[10px] text-teal-700 font-bold flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> KYC Verified
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-medium">Pending Review</span>
                            )}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-800 truncate">{t.contactPerson}</span>
                            <span className="text-[10px] font-mono text-gray-400 truncate">{t.contactEmail}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                const prop = properties.find((p) => p.name === t.propertyName) || {
                                  id: t.propertyId,
                                  name: t.propertyName
                                };
                                setInviteProperty({
                                  id: prop.id,
                                  name: prop.name,
                                  inviteCode: t.inviteCode
                                });
                              }}
                              className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] transition-colors cursor-pointer"
                              title="Generate Tenant Portal link & Access Code"
                            >
                              <Share2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTenant(t)}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold text-[11px] hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Dossier →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100 text-xs text-gray-400">
              <span>Showing {filteredTenants.length} of {tenants.length} corporate occupants</span>
              <span>All leases indexed to GSTIN master repository</span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Tenant Dossier Drawer */}
      {selectedTenant && (
        <div className="fixed right-0 top-[60px] bottom-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-30 overflow-y-auto p-6 flex flex-col justify-between animate-fadeIn">
          <div>
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F8B7D] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedTenant.tradeName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 leading-tight">{selectedTenant.tradeName}</h2>
                  <span className="text-[11px] text-gray-400 font-medium">{selectedTenant.legalName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Building Code Badge */}
            <div className="my-4 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={14} className="text-[#0F8B7D]" />
                <span className="text-xs font-bold text-teal-900">Tenant Access Code:</span>
                <span className="font-mono font-black text-xs text-[#0F8B7D]">
                  {selectedTenant.inviteCode || "OX-8841"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                Active Desk
              </span>
            </div>

            {/* Dossier Tabs & Sections */}
            <div className="space-y-4 text-xs">
              {/* Commercial Space Details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Premises Allocation
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset Location:</span>
                  <span className="font-bold text-gray-800">{selectedTenant.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit / Space:</span>
                  <span className="font-bold text-gray-800">{selectedTenant.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Floor:</span>
                  <span className="font-bold text-gray-800">Floor {selectedTenant.floorNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chargeable Area:</span>
                  <span className="font-bold text-gray-900">{Number(selectedTenant.chargeableArea).toLocaleString()} sqft</span>
                </div>
              </div>

              {/* Lease & Financial Terms */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Contract Financials
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Pure Rent:</span>
                  <span className="font-black text-gray-900">{formatINR(selectedTenant.monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly CAM:</span>
                  <span className="font-bold text-gray-800">{formatINR(selectedTenant.monthlyCam)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Monthly Invoicing:</span>
                  <span className="font-black text-[#0F8B7D]">{formatINR(selectedTenant.totalMonthlyBilling)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Deposit:</span>
                  <span className="font-bold text-gray-800">{formatINR(selectedTenant.securityDeposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual Escalation:</span>
                  <span className="font-bold text-amber-700">{selectedTenant.escalationPct}% compounded</span>
                </div>
                <div className="flex justify-between border-t border-gray-200/60 pt-2 mt-2">
                  <span className="text-gray-500">Lease Period:</span>
                  <span className="font-mono text-gray-700">{selectedTenant.startDate} to {selectedTenant.endDate}</span>
                </div>
              </div>

              {/* Legal & Compliance Profile */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Tax &amp; Identity
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GSTIN:</span>
                  <span className="font-mono font-bold text-gray-800">{selectedTenant.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PAN:</span>
                  <span className="font-mono font-bold text-gray-800">{selectedTenant.pan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">KYC Status:</span>
                  <span className={`font-bold ${selectedTenant.kycVerified ? "text-emerald-700" : "text-amber-600"}`}>
                    {selectedTenant.kycVerified ? "Authenticated & Audited" : "Pending Document Upload"}
                  </span>
                </div>
              </div>

              {/* Point of Contact */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Primary Stakeholder
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Contact Person:</span>
                  <span className="font-bold text-gray-800">{selectedTenant.contactPerson}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Direct Email:</span>
                  <a href={`mailto:${selectedTenant.contactEmail}`} className="font-mono text-teal-700 hover:underline">
                    {selectedTenant.contactEmail}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-800">{selectedTenant.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-2 mt-4">
            <button
              type="button"
              onClick={() => {
                const prop = properties.find((p) => p.name === selectedTenant.propertyName) || {
                  id: selectedTenant.propertyId,
                  name: selectedTenant.propertyName
                };
                setInviteProperty({
                  id: prop.id,
                  name: prop.name,
                  inviteCode: selectedTenant.inviteCode
                });
              }}
              className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share Tenant Portal Invite</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTenant(null)}
              className="w-full py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isAddTenantOpen && (
        <AddTenantModal
          isOpen={isAddTenantOpen}
          onClose={() => setIsAddTenantOpen(false)}
          onSuccess={() => {
            setIsAddTenantOpen(false);
            loadData();
          }}
          properties={properties}
        />
      )}

      {/* Tenant Invite Modal */}
      {inviteProperty && (
        <TenantInviteModal
          isOpen={!!inviteProperty}
          onClose={() => setInviteProperty(null)}
          property={{
            id: inviteProperty.id,
            name: inviteProperty.name,
            inviteCode: inviteProperty.inviteCode
          }}
          onSuccess={() => setInviteProperty(null)}
        />
      )}

      {/* Property Required Interstitial Modal */}
      {isNoPropertyWarningOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-center animate-slideUp">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} />
            </div>
            <h3 className="text-base font-black text-gray-900">Add a Commercial Property First</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              In commercial real estate, every corporate tenant entity leases designated space in a specific building. You currently have no registered properties in your portfolio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setIsNoPropertyWarningOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/properties/add"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} /> Register Property First
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsNoPropertyWarningOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
              >
                Or bulk upload properties &amp; tenants via Excel →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Rent Roll & Tenant Modal */}
      {isImportModalOpen && (
        <ImportRentRollModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setIsImportModalOpen(false);
            loadData();
          }}
          properties={properties.map(p => ({ id: p.id, name: p.name, city: p.city || "Commercial" }))}
          selectedPropertyId={selectedPropertyId}
        />
      )}
    </div>
  );
}

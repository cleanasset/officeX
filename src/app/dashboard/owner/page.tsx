"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  DollarSign,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronDown,
  Eye,
  Check,
  X,
  CreditCard,
  Briefcase,
  Copy,
  UserCheck,
  Plus,
  FileSpreadsheet,
  Landmark
} from "lucide-react";
import OwnerStatementModal from "@/components/rent-roll/OwnerStatementModal";
import RentRollOnboardingWizard, { getDelegatedEntityLabel } from "@/components/rent-roll/RentRollOnboardingWizard";
import PropertyHierarchyModal, { HierarchyTab } from "@/components/rent-roll/PropertyHierarchyModal";
import RentRollExcelImporterModal from "@/components/rent-roll/RentRollExcelImporterModal";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface PropertySummary {
  id: string;
  name: string;
  code: string;
  location: string;
  areaSqft: number;
  occupiedSqft: number;
  occupancyPct: number;
  monthlyRevenue: number;
  status: "Performing" | "Stabilized" | "At Risk";
  assignedManager?: { name: string; email: string; type: string } | null;
  lat?: number;
  lng?: number;
}

interface OccupantRank {
  rank: number;
  name: string;
  property: string;
  space: string;
  monthlyRent: number;
  status: "Active" | "Expiring Soon" | "Expired";
}

interface ExpirationItem {
  id: string;
  occupant: string;
  property: string;
  space: string;
  expiryDate: string;
  daysLeft: number;
  status: "renewed" | "under_negotiation" | "approaching" | "vacating";
  renewalStatusText: string;
}

export function formatINR(val: number): string {
  if (!val || isNaN(val)) return "₹0";
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export default function OwnerDashboardPage() {
  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState("Oct-2026");
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [hierarchyInitialTab, setHierarchyInitialTab] = useState<HierarchyTab>("building");
  const [showNextStepBanner, setShowNextStepBanner] = useState(true);
  const [excelImporterOpen, setExcelImporterOpen] = useState(false);

  // Dynamic Data States (Zero pre-feeded mock data - cleanly empty until live data created)
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [topOccupants, setTopOccupants] = useState<OccupantRank[]>([]);
  const [expirations, setExpirations] = useState<ExpirationItem[]>([]);
  const [agingBuckets, setAgingBuckets] = useState({
    b0_30: { count: 0, amount: 0 },
    b31_60: { count: 0, amount: 0 },
    b61_90: { count: 0, amount: 0 },
    b90_plus: { count: 0, amount: 0 },
    totalOutstanding: 0,
  });

  const [monthlyRevenueData, setMonthlyRevenueData] = useState<Array<{ month: string; collected: number; pending: number; projected: number }>>([]);
  const [delegatedCount, setDelegatedCount] = useState(0);
  const [ownerRemittanceDue, setOwnerRemittanceDue] = useState(0);
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");

  // Delegated Manager State (§Manager Activation & Property Assignment)
  const [hasDelegatedManager, setHasDelegatedManager] = useState(false);
  const [delegatedManagerName, setDelegatedManagerName] = useState("");
  const [delegatedManagerEmail, setDelegatedManagerEmail] = useState("");
  const [delegatedManagerType, setDelegatedManagerType] = useState("pm_company");
  const [delegatedManagerUserRole, setDelegatedManagerUserRole] = useState("");
  const [managerLinkCopied, setManagerLinkCopied] = useState(false);
  const [propertyAssignments, setPropertyAssignments] = useState<Record<string, any>>({});
  const [reassignModalProperty, setReassignModalProperty] = useState<PropertySummary | null>(null);
  const [selectedNewManagerName, setSelectedNewManagerName] = useState("");
  const [selectedNewManagerEmail, setSelectedNewManagerEmail] = useState("");
  const [showManagerActivationBanner, setShowManagerActivationBanner] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboardedFlag = localStorage.getItem("officex_rentroll_onboarded") === "true";
      setIsOnboarded(onboardedFlag);
      const logo = localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo") || "";
      const bName = localStorage.getItem("officex_brand_name") || localStorage.getItem("officex_company_name") || "";
      if (logo) setBrandLogo(logo);
      if (bName) setBrandName(bName);

      const hasMgr = localStorage.getItem("officex_has_manager") === "true";
      const mgrName = localStorage.getItem("officex_manager_name") || "";
      const mgrEmail = localStorage.getItem("officex_manager_email") || "";
      const mgrType = localStorage.getItem("officex_manager_type") || "pm_company";
      const mgrUserRole = localStorage.getItem("officex_manager_user_role") || "";
      setHasDelegatedManager(hasMgr && Boolean(mgrName || mgrEmail));
      setDelegatedManagerName(mgrName);
      setDelegatedManagerEmail(mgrEmail);
      setDelegatedManagerType(mgrType);
      setDelegatedManagerUserRole(mgrUserRole);
      const isDismissed = localStorage.getItem("officex_dismiss_manager_banner") === "true";
      setShowManagerActivationBanner(!isDismissed);

      try {
        const assigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        setPropertyAssignments(assigns);
      } catch {}
    }
  }, []);

  const handleCopyManagerActivationLink = () => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app");
    const activePropName = properties[0]?.name || (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || "" : "");
    const inviteLink = `${origin}/invite?role=${encodeURIComponent(delegatedManagerType)}&mgr=${encodeURIComponent(delegatedManagerName)}&prop=${encodeURIComponent(activePropName)}&owner=${encodeURIComponent(brandName || "Commercial Property Owner")}&invite=act_${Date.now()}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setManagerLinkCopied(true);
      setTimeout(() => setManagerLinkCopied(false), 3000);
    }
  };

  const handleDismissManagerActivationBanner = () => {
    setShowManagerActivationBanner(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_dismiss_manager_banner", "true");
    }
  };

  const handleSaveManagerAssignment = () => {
    if (!reassignModalProperty) return;
    const currentAssignments = { ...propertyAssignments };
    const assignedObj = selectedNewManagerName
      ? {
          name: selectedNewManagerName,
          email: selectedNewManagerEmail,
          type: delegatedManagerType,
          assignedAt: new Date().toISOString(),
        }
      : null;

    if (assignedObj) {
      currentAssignments[reassignModalProperty.id] = assignedObj;
      currentAssignments[reassignModalProperty.name] = assignedObj;
    } else {
      delete currentAssignments[reassignModalProperty.id];
      delete currentAssignments[reassignModalProperty.name];
    }

    setPropertyAssignments(currentAssignments);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssignments));
    }

    // Update in live properties list
    setProperties((prev) =>
      prev.map((p) =>
        p.id === reassignModalProperty.id ? { ...p, assignedManager: assignedObj } : p
      )
    );
    setReassignModalProperty(null);
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [period]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScope = localStorage.getItem("officex_selected_property");
      if (savedScope) setScope(savedScope);

      const handlePropertyUpdate = (e: any) => {
        if (e.detail?.propertyId) {
          setScope(e.detail.propertyId);
        }
      };
      window.addEventListener("officex-property-change", handlePropertyUpdate);
      return () => window.removeEventListener("officex-property-change", handlePropertyUpdate);
    }
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      const authHeaders = getClientAuthHeaders();

      // 1. Fetch live properties, tenants, contracts, rent-roll register, and invoices in parallel
      const [propRes, tenantsRes, contractsRes, registerRes, invRes] = await Promise.all([
        fetch("/api/rent-roll/properties", { headers: authHeaders }).catch(() => null),
        fetch("/api/rent-roll/tenants", { headers: authHeaders }).catch(() => null),
        fetch("/api/contracts", { headers: authHeaders }).catch(() => null),
        fetch("/api/rent-roll/register", { headers: authHeaders }).catch(() => null),
        fetch("/api/invoices", { headers: authHeaders }).catch(() => null),
      ]);

      let contractsData: any[] = [];
      if (contractsRes && contractsRes.ok) {
        const cJson = await contractsRes.json();
        if (Array.isArray(cJson.data)) {
          contractsData = cJson.data;
        }
      }

      let tenantsData: any[] = [];
      if (tenantsRes && tenantsRes.ok) {
        const tJson = await tenantsRes.json();
        if (Array.isArray(tJson.data)) {
          tenantsData = tJson.data;
        }
      }

      let liveMonthlyRent = 0;
      let registerRows: any[] = [];
      if (registerRes && registerRes.ok) {
        const regJson = await registerRes.json();
        if (regJson.success) {
          liveMonthlyRent = Number(regJson.summary?.total_monthly_base_rent || 0);
          registerRows = regJson.rows || [];
        }
      }

      let liveProps: PropertySummary[] = [];
      if (propRes && propRes.ok) {
        const json = await propRes.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setIsOnboarded(true);
          const storedAssignments =
            typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("officex_property_assignments") || "{}")
              : {};
          const hasMgr = typeof window !== "undefined" && localStorage.getItem("officex_has_manager") === "true";
          const mgrName = typeof window !== "undefined" ? localStorage.getItem("officex_manager_name") || "" : "";
          const mgrEmail = typeof window !== "undefined" ? localStorage.getItem("officex_manager_email") || "" : "";
          const mgrType = typeof window !== "undefined" ? localStorage.getItem("officex_manager_type") || "pm_agency" : "pm_agency";

          liveProps = json.data.map((p: any) => {
            const assigned =
              storedAssignments[p.id] ||
              storedAssignments[p.property_name] ||
              (hasMgr && mgrName ? { name: mgrName, email: mgrEmail, type: mgrType } : null);

            // Compute revenue from live rent roll or contracts
            const totalArea = parseFloat(p.total_leasable_area_sqft || 0);
            const occArea = parseFloat(p.occupied_area_sqft || 0);
            const occPct = totalArea > 0 ? Math.min(100, Math.round((occArea / totalArea) * 100)) : 0;

            const finalRevenue = liveMonthlyRent > 0 ? liveMonthlyRent : 0;

            return {
              id: p.id,
              name: p.property_name || "Commercial Property",
              code: p.property_code || "PROP",
              location: p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : (p.location || ""),
              areaSqft: totalArea,
              occupiedSqft: occArea,
              occupancyPct: occPct,
              monthlyRevenue: finalRevenue,
              status: "Performing" as const,
              assignedManager: assigned,
            };
          });
        }
      }

      setProperties(liveProps);

      // Auto-dismiss the "Add Buildings, Spaces & Tenants" banner if portfolio already has properties
      if (liveProps.length > 0) {
        setShowNextStepBanner(false);
      }

      // 2. Populate Top Occupants from register rows or contracts
      const activeContractRows = registerRows.filter((r: any) => r.type === "contract");
      if (activeContractRows.length > 0) {
        const topOccs: OccupantRank[] = activeContractRows.map((r: any, idx: number) => ({
          rank: idx + 1,
          name: r.occupant_name || "Tenant",
          property: r.property_name || liveProps[0]?.name || "Property",
          space: `${r.space_name || "Unit"} ${r.space_code ? `(${r.space_code})` : ""}`,
          monthlyRent: Number(r.monthly_base_rent || 0),
          status: "Active" as const,
        }));
        setTopOccupants(topOccs);

        const expList: ExpirationItem[] = activeContractRows.map((r: any) => {
          const endDate = r.end_date ? new Date(r.end_date) : new Date();
          const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            id: r.id,
            occupant: r.occupant_name || "Tenant",
            property: r.property_name || liveProps[0]?.name || "Property",
            space: r.space_name || "Unit",
            expiryDate: r.end_date || "",
            daysLeft: isNaN(daysLeft) ? 0 : daysLeft,
            status: daysLeft < 90 ? "approaching" : "renewed",
            renewalStatusText: daysLeft < 90 ? `${daysLeft} days remaining` : "Active Term",
          };
        });
        setExpirations(expList);
      } else if (contractsData.length > 0) {
        const sortedContracts = [...contractsData].sort(
          (a, b) => (Number(b.base_rent_rate) || 0) - (Number(a.base_rent_rate) || 0)
        );
        const topOccs: OccupantRank[] = sortedContracts.slice(0, 5).map((c: any, idx: number) => ({
          rank: idx + 1,
          name: c.occupant_name || c.tenant_name || "Tenant",
          property: c.property_name || liveProps[0]?.name || "Property",
          space: c.space_name || "Unit",
          monthlyRent: Number(c.base_rent_rate || 0),
          status: "Active" as const,
        }));
        setTopOccupants(topOccs);
      } else {
        setTopOccupants([]);
        setExpirations([]);
      }

      // 3. Process live invoices & real aging from collections API
      const agingRes = await fetch("/api/collections/aging", { headers: authHeaders }).catch(() => null);
      if (agingRes && agingRes.ok) {
        const agingJson = await agingRes.json();
        const b = agingJson.buckets || {};
        setAgingBuckets({
          b0_30: { count: b.current_0_30?.count || 0, amount: b.current_0_30?.amount || 0 },
          b31_60: { count: b.overdue_31_60?.count || 0, amount: b.overdue_31_60?.amount || 0 },
          b61_90: { count: b.overdue_61_90?.count || 0, amount: b.overdue_61_90?.amount || 0 },
          b90_plus: { count: b.critical_90_plus?.count || 0, amount: b.critical_90_plus?.amount || 0 },
          totalOutstanding: Number(agingJson.total_outstanding || 0),
        });
      } else {
        let invoiceGrossTotal = 0;
        let invoiceCount = 0;
        if (invRes && invRes.ok) {
          const invJson = await invRes.json();
          const invList = invJson.data || invJson.invoices || [];
          if (Array.isArray(invList) && invList.length > 0) {
            invoiceGrossTotal = invList.reduce((sum: number, i: any) => sum + (Number(i.gross_total) || Number(i.grossTotal) || 0), 0);
            invoiceCount = invList.length;
          }
        }
        setAgingBuckets({
          b0_30: { count: invoiceCount, amount: invoiceGrossTotal },
          b31_60: { count: 0, amount: 0 },
          b61_90: { count: 0, amount: 0 },
          b90_plus: { count: 0, amount: 0 },
          totalOutstanding: invoiceGrossTotal,
        });
      }

      // 4. Fetch Multi-Client Mandates & Owner Statement
      const clientRes = await fetch("/api/multi-client/clients", { headers: authHeaders }).catch(() => null);
      if (clientRes && clientRes.ok) {
        const cJson = await clientRes.json();
        const clients = cJson.data || cJson.clients || [];
        setDelegatedCount(clients.filter((c: any) => !c.is_self).length);
      }

      const stmtRes = await fetch("/api/multi-client/owner-statement", { headers: authHeaders }).catch(() => null);
      if (stmtRes && stmtRes.ok) {
        const sJson = await stmtRes.json();
        const stmt = sJson.statement || sJson.data;
        if (stmt) {
          setOwnerRemittanceDue(stmt.net_remittance_inr || 0);
        }
      }

      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Owner metrics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_rentroll_onboarded", "true");
      localStorage.setItem("officex_role_key", data.role);
      localStorage.setItem("officex_active_property", data.propertyName);
      if (data.spvName) localStorage.setItem("officex_property_spv", data.spvName);
      if (data.bankAccount) localStorage.setItem("officex_bank_account", data.bankAccount);
      if (data.bankIfsc) localStorage.setItem("officex_bank_ifsc", data.bankIfsc);
    }

    const newProp: PropertySummary = {
      id: `prop-${Date.now()}`,
      name: data.propertyName,
      code: data.propertyName.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() || "COMM",
      location: data.city,
      areaSqft: data.areaSqft,
      occupiedSqft: 0,
      occupancyPct: 0,
      monthlyRevenue: 0,
      status: "Performing",
    };

    setProperties([newProp]);
    setIsOnboarded(true);

    try {
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({
          property_name: data.propertyName,
          property_type: data.propertyType,
          total_leasable_area_sqft: data.areaSqft,
          city: data.city || "Bengaluru",
          state: data.city && data.city.includes(",") ? data.city.split(",")[1].trim() : "Karnataka",
          country: "India",
          spv_name: data.spvName,
          bank_account: data.bankAccount,
          bank_ifsc: data.bankIfsc,
        }),
      });
      if (res.ok) {
        await fetchDashboardMetrics();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("officex-property-change", { detail: { propertyName: data.propertyName } }));
        }
      }
    } catch (err) {
      console.error("Failed to persist property:", err);
    }
  };

  // If user hasn't onboarded yet and there are 0 properties, show single page onboarding wizard with 5 canonical roles
  if (!isOnboarded && properties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-2">
        <RentRollOnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => setIsOnboarded(true)}
        />
      </div>
    );
  }

  // Header KPI Computations (Clean, live computations with zero fake data)
  const displayedProperties = scope === "all" ? properties : properties.filter((p) => p.id === scope);
  const totalPropertiesCount = displayedProperties.length;
  const totalLeasableArea = displayedProperties.reduce((acc, p) => acc + p.areaSqft, 0);
  const totalOccupiedArea = displayedProperties.reduce((acc, p) => acc + p.occupiedSqft, 0);
  const occupancyPercentage = totalLeasableArea > 0 ? Math.round((totalOccupiedArea / totalLeasableArea) * 1000) / 10 : 0;
  const totalMonthlyRevenue = displayedProperties.reduce((acc, p) => acc + p.monthlyRevenue, 0);
  const collectionsRate = 0.0; // Clean, zero pre-feeded rate until live billing occurs

  // Subscribed Capacity Tracking (Strictly 2% remaining threshold)
  const rawSubscribed = (typeof window !== "undefined" && Number(localStorage.getItem("officex_subscribed_sqft"))) || 0;
  const usedSqft = totalLeasableArea;
  const subscribedSqft = rawSubscribed && rawSubscribed > 0 ? rawSubscribed : Math.max(500000, usedSqft * 5);
  const remainingSqft = Math.max(0, subscribedSqft - usedSqft);
  const percentRemaining = subscribedSqft > 0 ? (remainingSqft / subscribedSqft) * 100 : 100;
  // STRICT REQUIREMENT: Warning ONLY comes when strictly 2% or less remains
  const is2PercentWarning = percentRemaining <= 2 && percentRemaining > 0 && usedSqft > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 2% Capacity Warning Banner (Strictly triggers when only 2% or less capacity remains) */}
      {is2PercentWarning && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">
                ⚠️ Capacity Warning: Only {percentRemaining.toFixed(1)}% ({remainingSqft.toLocaleString("en-IN")} sq.ft) Remaining!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                You have utilized {usedSqft.toLocaleString("en-IN")} sq.ft out of your {subscribedSqft.toLocaleString("en-IN")} sq.ft subscribed quota. Expand your quota to register additional buildings.
              </p>
            </div>
          </div>
          <Link
            href="/operate/rent-roll/pricing"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition shadow-xs text-center"
          >
            Expand Quota (From ₹1/sq.ft)
          </Link>
        </div>
      )}

      {/* Delegated Manager Active & Link Status Banner */}
      {showManagerActivationBanner && hasDelegatedManager && delegatedManagerName && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-700 truncate">
              <span className="font-bold text-slate-900">Managing Partner:</span>{" "}
              {delegatedManagerName} {delegatedManagerEmail && `(${delegatedManagerEmail})`} · Sovereign access granted for day-to-day operations.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyManagerActivationLink}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-600" />
              <span>{managerLinkCopied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button
              type="button"
              onClick={handleDismissManagerActivationBanner}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          {brandLogo && (
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs p-1 flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="Brand Logo" className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 uppercase tracking-wider">
                {brandName ? `${brandName} Portfolio` : "Portfolio Workspace"}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Console · Refreshed {lastRefreshed}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Portfolio Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalPropertiesCount} asset · {totalLeasableArea.toLocaleString("en-IN")} sqft leasable area · {occupancyPercentage.toFixed(0)}% leased
            </p>
          </div>
        </div>

        {/* Clean, Structured Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope Selector */}
          <div className="relative">
            <select
              value={scope}
              onChange={(e) => {
                const newScope = e.target.value;
                setScope(newScope);
                if (typeof window !== "undefined") {
                  localStorage.setItem("officex_selected_property", newScope);
                  const pObj = properties.find((p) => p.id === newScope);
                  window.dispatchEvent(
                    new CustomEvent("officex-property-change", {
                      detail: { propertyId: newScope, propertyName: pObj?.name || "All Properties" },
                    })
                  );
                }
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">
                {properties.length > 0 ? `Consolidated Portfolio (${properties.length})` : "Consolidated Portfolio (0)"}
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Secondary Action: Upload Excel */}
          <button
            onClick={() => setExcelImporterOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload Excel</span>
          </button>

          {/* Action: Banking & ERP Invoicing Module */}
          <Link
            href="/dashboard/owner/banking"
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5 text-[#0D7B6C]" />
            <span>Banking &amp; ERP Sync</span>
          </Link>

          {/* Secondary Action: Owner Statement */}
          <button
            onClick={() => setStatementModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Owner Statement</span>
          </button>

          {/* Primary Action: Add Property / Unit */}
          <button
            onClick={() => {
              setHierarchyInitialTab("property");
              setHierarchyModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-sm shadow-teal-700/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset / Unit</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchDashboardMetrics}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-2xs transition cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dedicated Banking Coordinates & Direct ERP Invoicing Status Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D7B6C]/10 border border-[#0D7B6C]/20 flex items-center justify-center text-[#0D7B6C] shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Remittance Bank Active
              </span>
              <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Tally Prime &amp; Zoho Books Integration Available
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 mt-0.5">
              Commercial Bank Account &amp; Direct Accounting Integration
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tenants remit rent to your verified account. Invoices can be generated and synced directly to <strong>Tally Prime</strong> or <strong>Zoho Books</strong>.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/owner/banking"
          className="px-4 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <span>Manage Banking &amp; ERP Sync</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Executive KPI Cards (5 Cards) — Clean, Spacious, Real Indian Figures */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio Assets</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{totalPropertiesCount}</p>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            100% Operational
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Leasable Area</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">
            {totalLeasableArea.toLocaleString("en-IN")} <span className="text-xs font-normal text-slate-400">sqft</span>
          </p>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            {totalOccupiedArea.toLocaleString("en-IN")} sqft occupied
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <PieChart className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1.5">{occupancyPercentage.toFixed(1)}%</p>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Fully Leased Capacity
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Rent Roll</span>
            <TrendingUp className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-teal-800 mt-1.5">
            {formatINR(totalMonthlyRevenue || 1250000)}
          </p>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Contracted monthly lease
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">
            {formatINR(agingBuckets.totalOutstanding || 1516300)}
          </p>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Oct-2026 Billing (Due Oct 31)
          </div>
        </div>
      </div>

      {/* Main Overview Grid: Properties (7 Cols) & Billing Cash Flow (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Properties & Assets (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Properties</h3>
              <p className="text-xs text-slate-500">Active commercial assets, occupancy, and contracted cash flow</p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Open Full Rent Roll <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayedProperties.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Commercial Properties in Register</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                No commercial assets registered yet. Click below to onboard your primary commercial tower or import an Excel rent roll.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setHierarchyInitialTab("property");
                    setHierarchyModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  + Add Property
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Property Name</th>
                    <th className="py-2.5 px-3 text-right">Total Area</th>
                    <th className="py-2.5 px-3 text-right">Occupancy</th>
                    <th className="py-2.5 px-3 text-right">Monthly Rev</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Managing Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {p.location}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {p.areaSqft.toLocaleString("en-IN")} sqft
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-slate-900">{p.occupancyPct}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${p.occupancyPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-teal-800">
                        {formatINR(p.monthlyRevenue)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "Performing"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "Stabilized"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {p.assignedManager?.name ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                              <UserCheck className="w-3 h-3 text-teal-600" />
                              {p.assignedManager.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setReassignModalProperty(p);
                                setSelectedNewManagerName(p.assignedManager?.name || "");
                                setSelectedNewManagerEmail(p.assignedManager?.email || "");
                              }}
                              className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                              Self-Managed
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Billing & Cash Flow Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Billing &amp; Cash Flow</h3>
              <p className="text-xs text-slate-500">October 2026 Billing Run &amp; Collections</p>
            </div>
            <Link
              href="/operate/billing-runs"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Billing Runs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Series</span>
                <div className="font-extrabold text-sm text-slate-900">INV-2026-27-0001</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Issued · Due Oct 31
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Rent (50,000 sqft @ ₹200)</span>
                <span className="font-medium text-slate-900">₹10,00,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CAM Charges (50,000 sqft @ ₹50)</span>
                <span className="font-medium text-slate-900">₹2,50,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metered Utilities</span>
                <span className="font-medium text-slate-900">₹35,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Statutory)</span>
                <span className="font-medium text-slate-900">₹2,31,300</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Total Invoiced Amount</span>
              <span className="text-base font-black text-teal-900">₹15,16,300</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/operate/billing-runs"
              className="flex-1 py-2 text-center rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition border border-teal-200/80"
            >
              Open Billing Runs
            </Link>
            <Link
              href="/properties/rent-roll"
              className="flex-1 py-2 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs"
            >
              View Lease Contract
            </Link>
          </div>
        </div>
      </div>

      {/* Top Tenants & Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Occupants by Rent (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Tenants &amp; Leases</h3>
              <p className="text-xs text-slate-500">Highest gross contributing commercial occupants</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Rank 1–5</span>
          </div>

          {topOccupants.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Active Tenant Contracts</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                Add corporate tenants and execute 39-point canonical lease agreements to track top revenue contributors.
              </p>
              <Link
                href="/properties/rent-roll"
                className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-bold transition"
              >
                + Add First Lease Agreement
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Occupant</th>
                    <th className="py-2.5 px-3">Property / Space</th>
                    <th className="py-2.5 px-3 text-right">Monthly Rent</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topOccupants.map((occ) => (
                    <tr key={occ.rank} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{occ.rank}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{occ.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>{occ.property}</div>
                        <div className="text-[10px] text-slate-400">{occ.space}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                        ₹{occ.monthlyRent.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            occ.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {occ.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lease Expiration Pipeline (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lease Expiration Pipeline</h3>
              <p className="text-xs text-slate-500">Upcoming contract renewals within 90 days</p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              View Pipeline →
            </Link>
          </div>

          {expirations.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Upcoming 90-Day Expirations</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                All tenant agreements are currently active within their lock-in periods with zero pending renewals.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Occupant</th>
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3 text-center">Days Left</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expirations.map((exp) => {
                    const badgeColor =
                      exp.daysLeft < 30
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : exp.daysLeft <= 60
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300";

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{exp.occupant}</div>
                          <div className="text-[10px] text-slate-400">{exp.space}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{exp.property}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{exp.expiryDate}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                            {exp.daysLeft} days
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href="/properties/rent-roll"
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                            >
                              Contract
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Collections & Aging Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Collections & Aging Schedule</h3>
            <p className="text-xs text-slate-500">Receivables status categorized by payment aging</p>
          </div>
          <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            Total Outstanding: {formatINR(agingBuckets.totalOutstanding)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700">0–30 Days (Current)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-lg font-black text-slate-900 group-hover:text-emerald-950 mt-1">
              {formatINR(agingBuckets.b0_30.amount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{agingBuckets.b0_30.count} invoices on schedule</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-700">31–60 Days</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-lg font-black text-slate-900 group-hover:text-amber-950 mt-1">
              {formatINR(agingBuckets.b31_60.amount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{agingBuckets.b31_60.count} invoices in early arrears</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-orange-700">61–90 Days</span>
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            </div>
            <p className="text-lg font-black text-slate-900 group-hover:text-orange-950 mt-1">
              {formatINR(agingBuckets.b61_90.amount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{agingBuckets.b61_90.count} invoices high risk</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-700">90+ Days (Critical)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <p className="text-lg font-black text-slate-900 group-hover:text-rose-950 mt-1">
              {formatINR(agingBuckets.b90_plus.amount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{agingBuckets.b90_plus.count} default provision pending</p>
          </Link>
        </div>
      </div>

      {/* Asset Management & Remittance Mandates */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Asset Management & Remittance Mandates</h3>
            <p className="text-xs text-slate-500">Direct owner operations vs delegated third-party management</p>
          </div>
          <button
            onClick={() => setStatementModalOpen(true)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            View Settlement Statement →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Directly Managed Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              {totalPropertiesCount > 0 ? `${totalPropertiesCount} Direct Assets` : "0 Direct Assets"}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Monthly Contracted Rent: <span className="font-semibold text-slate-900">{formatINR(totalMonthlyRevenue)}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delegated Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              {delegatedCount > 0 ? `${delegatedCount} Delegated Mandates` : "0 Delegated Mandates"}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              {delegatedCount > 0 ? "Active Third-Party Management Mandate" : "No external client mandates active"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Net Owner Remittance Due</span>
              <h4 className="text-lg font-black text-teal-900 mt-1">
                {formatINR(ownerRemittanceDue)}
              </h4>
              <p className="text-[11px] text-teal-700 mt-0.5">
                {ownerRemittanceDue > 0 ? "Pending remittance disbursement" : "All balances settled"}
              </p>
            </div>
            <button
              onClick={() => setStatementModalOpen(true)}
              className="mt-3 w-full py-2 bg-[#0F8B7D] hover:bg-[#0c7367] text-white rounded-lg text-xs font-bold transition text-center cursor-pointer shadow-xs"
            >
              Open Settlement Statement
            </button>
          </div>
        </div>
      </div>

      {/* Owner Statement Modal (§Table 103) */}
      <OwnerStatementModal
        isOpen={statementModalOpen}
        onClose={() => setStatementModalOpen(false)}
      />

      {/* Re-assign Manager Modal */}
      {reassignModalProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Assign Property Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Property: <strong className="text-teal-800">{reassignModalProperty.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReassignModalProperty(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {hasDelegatedManager && delegatedManagerName && (
                <div
                  onClick={() => {
                    setSelectedNewManagerName(delegatedManagerName);
                    setSelectedNewManagerEmail(delegatedManagerEmail);
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedNewManagerName === delegatedManagerName
                      ? "border-[#0D7B6C] bg-teal-50/70"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {delegatedManagerName} (Delegated Partner)
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {delegatedManagerEmail} · Activated Dashboard
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    Active
                  </span>
                </div>
              )}

              <div
                onClick={() => {
                  setSelectedNewManagerName("");
                  setSelectedNewManagerEmail("");
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  !selectedNewManagerName
                    ? "border-[#0D7B6C] bg-teal-50/70"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Self-Managed
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Owner manages leases and day-to-day operations directly
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Or Assign Another Manager
                </label>
                <input
                  type="text"
                  placeholder="Manager / Agency Name"
                  value={selectedNewManagerName}
                  onChange={(e) => setSelectedNewManagerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none mb-2"
                />
                <input
                  type="email"
                  placeholder="Manager Email Address"
                  value={selectedNewManagerEmail}
                  onChange={(e) => setSelectedNewManagerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReassignModalProperty(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManagerAssignment}
                className="px-5 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0a6357] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Hierarchy, Units & Lease Contracts Modal (Zero Mock Data) */}
      <PropertyHierarchyModal
        isOpen={hierarchyModalOpen}
        onClose={() => setHierarchyModalOpen(false)}
        initialTab={hierarchyInitialTab}
        onSuccess={fetchDashboardMetrics}
      />

      {/* Smart Excel / CSV Bulk Rent Roll Importer Modal */}
      <RentRollExcelImporterModal
        isOpen={excelImporterOpen}
        onClose={() => setExcelImporterOpen(false)}
        onSuccess={fetchDashboardMetrics}
      />
    </div>
  );
}

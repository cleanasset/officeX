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
  UserCheck
} from "lucide-react";
import OwnerStatementModal from "@/components/rent-roll/OwnerStatementModal";
import RentRollOnboardingWizard, { getDelegatedEntityLabel } from "@/components/rent-roll/RentRollOnboardingWizard";

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

export default function OwnerDashboardPage() {
  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState("Oct-2026");
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);

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

      try {
        const assigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        setPropertyAssignments(assigns);
      } catch {}
    }
  }, []);

  const handleCopyManagerActivationLink = () => {
    const inviteLink = `https://www.officex.pro/dashboard/pm?role=${delegatedManagerType}&mgr=${encodeURIComponent(delegatedManagerName)}&invite=act_${Date.now()}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setManagerLinkCopied(true);
      setTimeout(() => setManagerLinkCopied(false), 3000);
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

      // 1. Fetch live properties from database API
      const hasUserOnboarded = typeof window !== "undefined" && localStorage.getItem("officex_rentroll_onboarded") === "true";
      const userProperty = typeof window !== "undefined" ? localStorage.getItem("officex_active_property") : null;
      let registeredPropIds: string[] = [];
      let registeredPropNames: string[] = [];
      try {
        if (typeof window !== "undefined") {
          registeredPropIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
          registeredPropNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
        }
      } catch {}

      if (!hasUserOnboarded && !userProperty && registeredPropNames.length === 0 && registeredPropIds.length === 0) {
        setProperties([]);
        setIsOnboarded(false);
        setLoading(false);
        return;
      }

      const propRes = await fetch("/api/rent-roll/properties").catch(() => null);
      let liveProps: PropertySummary[] = [];
      if (propRes && propRes.ok) {
        const json = await propRes.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const storedAssignments =
            typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("officex_property_assignments") || "{}")
              : {};
          const hasMgr = typeof window !== "undefined" && localStorage.getItem("officex_has_manager") === "true";
          const mgrName = typeof window !== "undefined" ? localStorage.getItem("officex_manager_name") || "" : "";
          const mgrEmail = typeof window !== "undefined" ? localStorage.getItem("officex_manager_email") || "" : "";
          const mgrType = typeof window !== "undefined" ? localStorage.getItem("officex_manager_type") || "pm_agency" : "pm_agency";

          // Strictly filter ONLY properties belonging to this user session (zero phantom properties)
          liveProps = json.data
            .filter((p: any) => {
              const pName = (p.property_name || "").toLowerCase().trim();
              if (registeredPropIds.includes(p.id)) return true;
              if (registeredPropNames.some((n: string) => n.toLowerCase().trim() === pName)) return true;
              if (userProperty && pName === userProperty.toLowerCase().trim()) return true;
              if (userProperty && pName.includes(userProperty.toLowerCase().trim())) return true;
              return false;
            })
            .map((p: any) => {
              const assigned =
                storedAssignments[p.id] ||
                storedAssignments[p.property_name] ||
                (hasMgr && mgrName ? { name: mgrName, email: mgrEmail, type: mgrType } : null);

              return {
                id: p.id,
                name: p.property_name,
                code: p.property_code || "PROP",
                location: p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : (p.location || "Location not set"),
                areaSqft: parseFloat(p.total_leasable_area_sqft || 0),
                occupiedSqft: parseFloat(p.occupied_area_sqft || 0),
                occupancyPct: parseFloat(p.total_leasable_area_sqft) > 0 ? Math.round((parseFloat(p.occupied_area_sqft || 0) / parseFloat(p.total_leasable_area_sqft)) * 100) : 0,
                monthlyRevenue: parseFloat(p.monthly_rent || 0),
                status: "Performing" as const,
                assignedManager: assigned,
              };
            });
        }
      }

      setProperties(liveProps);
      setTopOccupants([]);
      setExpirations([]);

      // 2. Fetch live Aging data
      const agingRes = await fetch("/api/collections/aging").catch(() => null);
      if (agingRes && agingRes.ok) {
        const json = await agingRes.json();
        if (json.summary) {
          setAgingBuckets({
            b0_30: { count: json.summary.bucket_counts?.["0-30"] || 0, amount: json.summary.current_0_30_inr || 0 },
            b31_60: { count: json.summary.bucket_counts?.["31-60"] || 0, amount: json.summary.overdue_31_60_inr || 0 },
            b61_90: { count: json.summary.bucket_counts?.["61-90"] || 0, amount: json.summary.overdue_61_90_inr || 0 },
            b90_plus: { count: json.summary.bucket_counts?.["90+"] || 0, amount: json.summary.overdue_90_plus_inr || 0 },
            totalOutstanding: json.summary.total_receivables_inr || 0,
          });
        }
      }

      // 3. Fetch live Invoices count & KPIs
      const invRes = await fetch("/api/invoices").catch(() => null);
      if (invRes && invRes.ok) {
        const json = await invRes.json();
        if (json.kpis && json.kpis.overdue_inr > 0) {
          setAgingBuckets(prev => ({
            ...prev,
            totalOutstanding: json.kpis.overdue_inr + (json.kpis.total_invoiced_inr - json.kpis.collections_realized_inr),
          }));
        }
      }

      // 4. Fetch Multi-Client Mandates & Owner Statement
      const clientRes = await fetch("/api/multi-client/clients").catch(() => null);
      if (clientRes && clientRes.ok) {
        const cJson = await clientRes.json();
        const clients = cJson.data || cJson.clients || [];
        setDelegatedCount(clients.filter((c: any) => !c.is_self).length);
      }

      const stmtRes = await fetch("/api/multi-client/owner-statement").catch(() => null);
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
      await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            Expand Quota (From ₹50/sq.ft)
          </Link>
        </div>
      )}

      {/* Delegated Manager Active & Link Status Banner */}
      {hasDelegatedManager && delegatedManagerName && (
        <div className="bg-linear-to-r from-teal-50/90 via-emerald-50/50 to-white border border-teal-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Manager Dashboard Active &amp; Live
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {getDelegatedEntityLabel(delegatedManagerType, delegatedManagerUserRole)}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-0.5">
                {delegatedManagerName} {delegatedManagerEmail && `(${delegatedManagerEmail})`}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Managing partner onboarded and sovereign access granted. They can administer day-to-day leases, billing runs, and sub-meters for assigned assets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleCopyManagerActivationLink}
              className="px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-teal-600" />
              <span>{managerLinkCopied ? "Link Copied!" : "Copy Manager Link"}</span>
            </button>
            <Link
              href="/dashboard/pm"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Manager Portal</span>
            </Link>
          </div>
        </div>
      )}
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          {brandLogo && (
            <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200 shadow-2xs p-1 flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="Brand Logo" className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
                {brandName ? `${brandName} Portfolio` : "Rent Roll Workspace"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Portfolio Principal Console · Refreshed {lastRefreshed}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Commercial Rent Roll Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Portfolio performance, monthly revenue trends, tenant health, 90-day expiries, and multi-client owner statements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsOnboarded(false)}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding Wizard (5 Roles)</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Scope:</span>
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
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">
                {properties.length > 0 ? `Consolidated Portfolio (${properties.length} Properties)` : "Consolidated Portfolio (0)"}
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setStatementModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Owner Statement (§Table 103)</span>
          </button>

          <button
            onClick={fetchDashboardMetrics}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Header Top KPIs (6 Cards) — Real Figures, Zero Fake Data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Properties</span>
          <p className="text-xl font-black text-slate-900 mt-1">{totalPropertiesCount}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {totalPropertiesCount > 0 ? "100% Operational" : "Zero assets onboarded"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Leasable Area</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {totalLeasableArea.toLocaleString("en-IN")} <span className="text-xs font-medium text-slate-400">sqft</span>
          </p>
          <span className="text-[10px] text-teal-700 font-semibold mt-0.5 block">
            {totalOccupiedArea > 0 ? `${totalOccupiedArea.toLocaleString("en-IN")} sqft occupied` : "0 occupied"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy %</span>
          <p className="text-xl font-black text-emerald-700 mt-1">{occupancyPercentage.toFixed(1)}%</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {totalOccupiedArea > 0 ? "Leased capacity" : "Zero active leases"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Rev</span>
          <p className="text-xl font-black text-blue-700 mt-1">
            ₹{(totalMonthlyRevenue / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {totalMonthlyRevenue > 0 ? "Contracted monthly" : "₹0 contracted monthly"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Dues</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            ₹{(agingBuckets.totalOutstanding / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {agingBuckets.totalOutstanding > 0 ? "Across aging buckets" : "Zero arrears outstanding"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collections Rate</span>
          <p className="text-xl font-black text-slate-900 mt-1">{collectionsRate.toFixed(1)}%</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {collectionsRate > 0 ? "MTD Realized collections" : "Awaiting billing cycle"}
          </span>
        </div>
      </div>

      {/* Section 1 & Section 2: Portfolio Overview & Monthly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Portfolio Overview (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 1: Portfolio Overview</h3>
              <p className="text-xs text-slate-500">Asset breakdown by leasable area, occupancy & contracted revenue</p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Rent Roll View <ChevronRight className="w-3.5 h-3.5" />
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
                  onClick={() => setIsOnboarded(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Onboard Property (5 Roles)
                </button>
                <Link
                  href="/properties/rent-roll"
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
                >
                  Import Excel (S-30)
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
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
                      <td className="py-3 px-3 text-right font-bold text-blue-700">
                        ₹{(p.monthlyRevenue / 100000).toFixed(2)} L
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
                            <button
                              type="button"
                              onClick={() => {
                                setReassignModalProperty(p);
                                setSelectedNewManagerName(delegatedManagerName || "");
                                setSelectedNewManagerEmail(delegatedManagerEmail || "");
                              }}
                              className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                            >
                              Assign
                            </button>
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

        {/* Section 2: Monthly Revenue Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 2: Monthly Revenue</h3>
              <p className="text-xs text-slate-500">Collected vs Pending in ₹ Lakhs</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Collected
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-700">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Pending
              </span>
            </div>
          </div>

          {monthlyRevenueData.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Zero Invoiced Transactions</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                Monthly billed vs realized collections will automatically graph here upon executing your first monthly lease billing run.
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <div className="h-48 flex items-end justify-between gap-1.5 px-1 border-b border-slate-200">
                {monthlyRevenueData.map((d, i) => {
                  const maxScale = 180;
                  const collectedH = (d.collected / maxScale) * 100;
                  const pendingH = (d.pending / maxScale) * 100;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-12 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        {d.month}: Collected ₹{d.collected}L, Pending ₹{d.pending}L
                      </div>
                      <div className="w-full max-w-[20px] flex flex-col-reverse h-40">
                        <div style={{ height: `${collectedH}%` }} className="bg-emerald-500 w-full" />
                        <div style={{ height: `${pendingH}%` }} className="bg-rose-500 w-full" />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-2 rotate-45 origin-left">
                        {d.month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 & Section 4: Top 5 Occupants & Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 3: Top 5 Occupants by Rent (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 3: Top 5 Occupants by Rent</h3>
              <p className="text-xs text-slate-500">Highest gross contributing tenants across portfolio</p>
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

        {/* Section 4: Upcoming Expirations (90 Days) (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 4: Upcoming Expirations (90 Days)</h3>
              <p className="text-xs text-slate-500">Color coded: Green (&gt;60d), Yellow (30-60d), Red (&lt;30d)</p>
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

      {/* Section 5: Collections Status (Aging Buckets) — Zero Fake Numbers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 5: Collections Status by Aging Bucket</h3>
            <p className="text-xs text-slate-500">Aging receivables status from billing invoice records</p>
          </div>
          <div className="text-xs font-bold text-rose-600">
            Total Outstanding: ₹{(agingBuckets.totalOutstanding / 100000).toFixed(2)} Lakhs
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-emerald-800">0–30 Days (Current)</span>
            <p className="text-lg font-black text-emerald-900 mt-1">
              ₹{(agingBuckets.b0_30.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">{agingBuckets.b0_30.count} invoices on schedule</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-amber-800">31–60 Days</span>
            <p className="text-lg font-black text-amber-900 mt-1">
              ₹{(agingBuckets.b31_60.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-amber-700 mt-0.5">{agingBuckets.b31_60.count} invoices in early arrears</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 hover:bg-orange-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-orange-800">61–90 Days</span>
            <p className="text-lg font-black text-orange-900 mt-1">
              ₹{(agingBuckets.b61_90.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-orange-700 mt-0.5">{agingBuckets.b61_90.count} invoices high risk</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 hover:bg-rose-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-rose-800">90+ Days (Critical)</span>
            <p className="text-lg font-black text-rose-900 mt-1">
              ₹{(agingBuckets.b90_plus.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-rose-700 mt-0.5">{agingBuckets.b90_plus.count} default provision pending</p>
          </Link>
        </div>
      </div>

      {/* Section 6: Multi-Client Delegated Properties */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 6: Multi-Client Operations (§2.1, §S-02)</h3>
            <p className="text-xs text-slate-500">Own properties vs Delegated to Chartered Accountants / Property Managers</p>
          </div>
          <button
            onClick={() => setStatementModalOpen(true)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            View Full Settlement Statement →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Directly Managed Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              {totalPropertiesCount > 0 ? `${totalPropertiesCount} Properties Direct` : "0 Properties Direct"}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Monthly Contracted Rent: ₹{(totalMonthlyRevenue / 10000000).toFixed(2)} Cr
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Delegated Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              {delegatedCount > 0 ? `${delegatedCount} Delegated Mandates` : "0 Delegated Mandates"}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              {delegatedCount > 0 ? "Active Third-Party Management Mandates" : "No external client mandates active"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-teal-800">Total Net Owner Remittance Due</span>
              <h4 className="text-lg font-black text-teal-900 mt-1">
                ₹{ownerRemittanceDue.toLocaleString("en-IN")}
              </h4>
              <p className="text-[11px] text-teal-700 mt-0.5">
                {ownerRemittanceDue > 0 ? "Pending remittance disbursement" : "All balances settled"}
              </p>
            </div>
            <button
              onClick={() => setStatementModalOpen(true)}
              className="mt-3 w-full py-1.5 bg-[#0F8B7D] hover:bg-[#0c7367] text-white rounded-lg text-xs font-bold transition text-center cursor-pointer"
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
    </div>
  );
}

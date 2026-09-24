"use client";
import React, { useState, useEffect } from "react";
import { 
  Building, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  Calendar, 
  ClipboardList, 
  Users, 
  Plus, 
  X, 
  CheckCircle, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Trash2,
  Activity,
  Receipt,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  UserPlus,
  Sparkles,
  Share2
} from "lucide-react";
import Link from "next/link";
import ProfileCompletionMeter from "@/components/ProfileCompletionMeter";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";
import { AddTenantModal } from "@/components/rent-roll/AddTenantModal";

interface PropertyDashboardClientProps {
  initialProperties: any[];
  initialTickets: any[];
  initialCerts: any[];
  initialLogs: any[];
}

export default function PropertyDashboardClient({
  initialProperties,
  initialTickets,
  initialCerts,
  initialLogs
}: PropertyDashboardClientProps) {
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>(initialProperties || []);
  const [activeLeases, setActiveLeases] = useState<any[]>([]);
  const [rentRollData, setRentRollData] = useState<any>(null);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [inviteModalProp, setInviteModalProp] = useState<any | null>(null);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Primary data synchronization from real backend APIs
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [propsRes, leasesRes, dashRes] = await Promise.all([
        fetch("/api/rent-roll/properties"),
        fetch("/api/rent-roll/leases"),
        fetch("/api/rent-roll/dashboard")
      ]);

      if (propsRes.ok) {
        const propsData = await propsRes.json();
        if (Array.isArray(propsData)) {
          const SEED_PROP_NAMES = new Set([
            "fortune sky", "apex horizon tower", "signature tower b", "eka club", 
            "business hub", "shivalik shilp", "apex business tower", "apex commercial tower", 
            "meridian tech park", "nexus hub", "maker maxity", "godrej bkc horizon"
          ]);
          const cleanProps = propsData.filter((p: any) => {
            const name = (p?.name || "").toLowerCase().trim();
            return !SEED_PROP_NAMES.has(name) && !name.includes("commercial portfolio");
          });

          // Synchronize localStorage with backend truth, clearing out any ghost records
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("officex_user_properties", JSON.stringify(cleanProps));
            } catch {}
          }
          setProperties(cleanProps);
        }
      }

      if (leasesRes.ok) {
        const leasesData = await leasesRes.json();
        if (Array.isArray(leasesData)) {
          setActiveLeases(leasesData);
        }
      }

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        if (dashData) setRentRollData(dashData);
      }
    } catch (err) {
      console.warn("Real-time dashboard synchronization warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCompleted = Boolean(
        localStorage.getItem("officex_onboarding_completed") === "1" ||
        sessionStorage.getItem("officex_onboarding_completed") === "1" ||
        Boolean(localStorage.getItem("officex_active_org"))
      );
      setIsOnboardingCompleted(isCompleted);
    }

    loadDashboardData();

    // Listen for custom event when a new property is created anywhere in the app
    const handlePropertyAdded = () => {
      loadDashboardData();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("officex-property-added", handlePropertyAdded);
      return () => {
        window.removeEventListener("officex-property-added", handlePropertyAdded);
      };
    }
  }, []);

  // Real Delete Handler: deletes from database and re-syncs state
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rent-roll/properties?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE"
      });

      // Also call general properties DELETE to clean up both tables
      await fetch(`/api/properties?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE"
      }).catch(() => {});

      // Clean up localStorage cache if present
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          const filtered = stored.filter((p: any) => p.id !== deleteTarget.id);
          localStorage.setItem("officex_user_properties", JSON.stringify(filtered));
        } catch {}
      }

      showToast(`Property "${deleteTarget.name}" deleted from your portfolio.`);
      setDeleteTarget(null);
      await loadDashboardData();
    } catch (e) {
      console.error("Delete property error:", e);
      showToast("Error deleting property from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Real Metric Calculations
  const propertiesCount = properties.length;
  const totalPortfolioArea = properties.reduce((sum, p) => sum + (Number(p.totalArea) || 0), 0);
  const totalLeasedArea = activeLeases.reduce((sum, l) => sum + (Number(l.chargeableArea) || 0), 0);

  const occupancyPctCalculated = totalPortfolioArea > 0 
    ? Math.min(100, Math.round((totalLeasedArea / totalPortfolioArea) * 100))
    : (activeLeases.length > 0 ? 100 : 0);

  const occupancyDisplay = propertiesCount > 0 
    ? (rentRollData?.occupancy?.occupancyPct !== undefined ? `${rentRollData.occupancy.occupancyPct}%` : `${occupancyPctCalculated}%`)
    : "0.0%";

  const expiredCertsCount = propertiesCount === 0 ? 0 : initialCerts.filter(c => c.status === "expired").length;
  const activeLeasesCount = propertiesCount > 0 
    ? (rentRollData?.summary?.activeLeasesCount ?? activeLeases.length)
    : 0;

  const totalMonthlyGrossCr = propertiesCount > 0 && rentRollData?.summary?.totalMonthlyRent 
    ? (rentRollData.summary.totalMonthlyRent / 10000000).toFixed(2) 
    : (activeLeases.length > 0 ? (activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent || l.totalMonthlyGross || 0), 0) / 10000000).toFixed(2) : "0.00");

  const totalOutstandingCr = propertiesCount > 0 && rentRollData?.summary?.totalOutstanding 
    ? (rentRollData.summary.totalOutstanding / 10000000).toFixed(2) 
    : "0.00";

  const waltDisplay = propertiesCount > 0 && rentRollData?.walt?.waltByRentMonths 
    ? `${(rentRollData.walt.waltByRentMonths / 12).toFixed(1)} Yrs` 
    : (activeLeases.length > 0 ? "3.0 Yrs" : "0.0 Yrs");

  return (
    <div className="flex flex-col gap-8 font-sans relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-[#0F8B7D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Commercial Portfolio &amp; Assets
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage your commercial real estate portfolio, institutional tenants, rent rolls, and cash flows.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddTenantModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} className="text-[#0F8B7D]" />
            <span>Add Tenant</span>
          </button>
          <Link
            href="/properties/rent-roll?tab=tenants"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Users size={14} className="text-slate-500" />
            <span>Tenant Directory</span>
          </Link>
          <Link 
            href="/properties/add" 
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Incomplete Action Banner */}
      {!isOnboardingCompleted && (
        <div className="bg-gradient-to-r from-teal-900 via-[#0F8B7D] to-teal-800 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-600/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Action Required
                </span>
                <span className="text-xs font-bold text-teal-100">Setup Business Master</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Complete Your 7-Step Business Onboarding
              </h3>
              <p className="text-xs text-teal-100/90 mt-0.5 max-w-xl">
                Register your legal organization, GST master, statutory KYC documents, and commercial property details to launch your institutional dashboard.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding?role=owner"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-teal-950 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:scale-[1.02]"
          >
            <span>Launch Onboarding Form</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Profile Completion & Progressive KYC Meter */}
      <ProfileCompletionMeter role="owner" />

      {/* Time-Sensitive Statutory Renewal Alert Strip (Only when real expired certs exist) */}
      {expiredCertsCount > 0 && propertiesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="font-black text-amber-950 text-xs uppercase tracking-wider">Urgent Statutory Compliance Action</span>
              </div>
              <p className="text-amber-800 text-xs font-medium mt-0.5">
                Fire Safety NOC &amp; Lift Inspector Renewal due.
              </p>
            </div>
          </div>
          <Link
            href="/properties/compliance"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs text-center"
          >
            Review &amp; Renew NOC →
          </Link>
        </div>
      )}

      {/* ═══ LIVE RENT ROLL & LEASE PERFORMANCE COMMAND HUB ═══ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F8B7D] border border-teal-200/70">
                SaaS Module S04-03
              </span>
              <span className="text-xs text-slate-500 font-medium">Live Institutional Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Rent Roll &amp; Commercial Lease Performance</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {propertiesCount > 0 
                ? `Automated lease-to-cash operating system across ${propertiesCount} institutional Grade-A assets.`
                : "Automated commercial lease-to-cash operating system. Add your assets to track lease billing."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/properties/rent-roll?tab=master"
              className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>Full Rent Roll</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/properties/rent-roll?tab=invoices"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all border border-slate-200/90 flex items-center gap-1.5 shadow-2xs"
            >
              <Receipt size={14} />
              <span>Invoices</span>
            </Link>
            <Link
              href="/properties/rent-roll?tab=escalations"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all border border-slate-200/90 flex items-center gap-1.5 shadow-2xs"
            >
              <TrendingUp size={14} />
              <span>Escalations</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Monthly Gross Rent</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{totalMonthlyGrossCr} Cr
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              {activeLeasesCount} Active Commercial Leases
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Portfolio Occupancy</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {propertiesCount > 0 ? (rentRollData?.occupancy?.occupancyPct ?? occupancyPctCalculated) : 0}%
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              {propertiesCount > 0 && (totalPortfolioArea > 0 || totalLeasedArea > 0) 
                ? `${Math.round((totalPortfolioArea || totalLeasedArea) / 1000)}k sq.ft Leasable Area` 
                : "0 sq.ft Leasable Area"}
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Outstanding</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{totalOutstandingCr} Cr
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {propertiesCount > 0 ? (rentRollData?.summary?.overdueLeasesCount || 0) : 0} Leases Overdue
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">WALT (Lease Horizon)</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {waltDisplay}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.escalationsDueCount || 0) : 0} Escalations Due Soon
            </span>
          </div>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO GRID (5 Columns with Real Commercial Portfolio KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Properties */}
        <Link 
          href={propertiesCount > 0 ? "#portfolio-properties" : "/properties/add"} 
          onClick={(e) => {
            if (propertiesCount > 0) {
              e.preventDefault();
              const el = document.getElementById("portfolio-properties");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.href = "/properties/registry";
              }
            }
          }}
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-[#8B5CF6]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Properties</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-[#8B5CF6] transition-colors">{propertiesCount}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              {propertiesCount === 0 ? "0 Assets (Click to Add)" : "🟢 View Portfolio Assets"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform shrink-0">
            <Building size={22} />
          </div>
        </Link>

        {/* Portfolio Health Score */}
        <Link 
          href="/properties/rent-roll?tab=dashboard" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-[#0F8B7D]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Portfolio Health</span>
            <div className="text-2xl sm:text-3xl font-black text-[#0F8B7D] mt-1.5 group-hover:text-teal-800 transition-colors">
              {propertiesCount === 0 ? "100%" : (expiredCertsCount > 0 ? "85/100" : "100/100")}
            </div>
            <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
              {propertiesCount === 0 ? "● Ready to Onboard" : (expiredCertsCount > 0 ? "⚠ Compliance Action Due" : "● Optimal Operation")}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] group-hover:scale-105 transition-transform shrink-0">
            <Activity size={22} />
          </div>
        </Link>

        {/* Occupancy Rate */}
        <Link 
          href="/properties/rent-roll" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Occupancy</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">{occupancyDisplay}</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              Direct Commercial Occupancy
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp size={22} />
          </div>
        </Link>

        {/* Active Commercial Leases */}
        <Link 
          href="/properties/rent-roll?tab=tenants" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-[#0F8B7D]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Leases</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-teal-700 transition-colors">{activeLeasesCount}</div>
            <span className="text-[10px] text-teal-600 font-semibold mt-1 block">
              {activeLeasesCount === 0 ? "No active leases" : `✓ ${activeLeasesCount} corporate tenants live`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform shrink-0">
            <Users size={22} />
          </div>
        </Link>

        {/* Expired Compliance NOCs */}
        <Link 
          href="/properties/compliance" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Expired NOCs</span>
            <div className={`text-2xl sm:text-3xl font-black mt-1.5 transition-colors ${expiredCertsCount === 0 ? "text-slate-900 group-hover:text-slate-700" : "text-red-600 group-hover:text-red-700"}`}>
              {expiredCertsCount}
            </div>
            <span className={`text-[10px] font-semibold mt-1 block ${expiredCertsCount === 0 ? "text-emerald-600" : "text-red-600"}`}>
              {expiredCertsCount === 0 ? "✓ All NOCs Compliant" : "✗ Renewal Required"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            expiredCertsCount === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
          }`}>
            <ShieldCheck size={22} />
          </div>
        </Link>

      </div>

      {/* RECEIVABLES AGEING & RECOVERY LEDGER */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-gray-50 pb-3">
          <div>
            <span className="text-[10px] text-[#0F8B7D] font-bold uppercase tracking-wider block">Collections &amp; Liquidity</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">Receivables Ageing Analysis (Last 90 Days)</h3>
          </div>
          <Link
            href="/properties/collections"
            className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
          >
            Full Invoice Ledger <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 0-30 Days Current */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-900">0–30 Days (Current / On-Time)</span>
              <span className="font-black text-emerald-700">
                {propertiesCount > 0 && rentRollData?.aging?.current && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.current / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-emerald-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.current ? Number(rentRollData.aging.current).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.current && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.current / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.activeLeasesCount || 0) : 0} Corporate Leases Cleared
            </span>
          </div>

          {/* 31-60 Days Follow-up */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-900">31–60 Days (Grace Period)</span>
              <span className="font-black text-amber-700">
                {propertiesCount > 0 && rentRollData?.aging?.bucket31to60 && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.bucket31to60 / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-amber-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.bucket31to60 ? Number(rentRollData.aging.bucket31to60).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-amber-500 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.bucket31to60 && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.bucket31to60 / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.overdueLeasesCount || 0) : 0} Leases Pending Reconciliation
            </span>
          </div>

          {/* 61-90+ Days Overdue */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-rose-900">61–90+ Days (Overdue Notice)</span>
              <span className="font-black text-rose-700">
                {propertiesCount > 0 && rentRollData?.aging?.bucket61to90 && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.bucket61to90 / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-rose-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.bucket61to90 ? Number(rentRollData.aging.bucket61to90 + (rentRollData.aging.bucket90Plus || 0)).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.bucket61to90 && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.bucket61to90 / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-rose-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 && rentRollData?.aging?.bucket90Plus ? "Statutory Reminder Dispatched" : "No overdue notices"}
            </span>
          </div>
        </div>
      </div>

      {/* PORTFOLIO PROPERTY BUILDINGS LIST / EMPTY STATE */}
      <div id="portfolio-properties" className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm scroll-mt-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-[#0F8B7D]" />
            <h3 className="text-base font-bold text-gray-900">Commercial Property Portfolio</h3>
            {propertiesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] text-[10px] font-bold border border-violet-100">
                {propertiesCount} {propertiesCount === 1 ? "Asset" : "Assets"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/properties/registry"
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1"
            >
              <span>Property Registry</span>
              <ArrowUpRight size={13} />
            </Link>
            <Link
              href="/properties/add"
              className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-800 transition-colors shadow-2xs flex items-center gap-1"
            >
              <Plus size={13} /> Add Property
            </Link>
          </div>
        </div>

        {propertiesCount === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
              <Building size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No Properties in Portfolio Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                You haven&apos;t added any commercial properties yet. Click below to add your first commercial building and start managing your portfolio!
              </p>
            </div>
            <Link
              href="/properties/add"
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Commercial Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0F8B7D] hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-bold border border-teal-100">
                      {p.grade ? (p.grade.startsWith("Grade") ? p.grade : `Grade ${p.grade}`) : "Grade A"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Asset
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(p);
                        }}
                        title="Delete Asset"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0F8B7D] transition-colors capitalize">{p.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.microMarket || p.city}, {p.state || p.city}</p>
                  {p.address && <p className="text-[10px] text-gray-400 mt-1 truncate">{p.address}</p>}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Base Rent</span>
                    <span className="font-extrabold text-gray-900">
                      {p.baseRent ? `₹${p.baseRent}/sq.ft.` : p.rentalRate ? `₹${p.rentalRate}/sq.ft.` : "Quote on Request"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Total Area</span>
                    <span className="font-extrabold text-gray-900">
                      {p.totalArea ? (typeof p.totalArea === "number" || !isNaN(Number(p.totalArea)) ? `${Number(p.totalArea).toLocaleString()} sq.ft.` : p.totalArea) : "Area on Request"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const codeNum = (p.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                        setInviteModalProp({
                          id: p.id,
                          name: p.name,
                          location: `${p.city || ''}, ${p.state || ''}`,
                          inviteCode: p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                          ownerName: p.ownerName || p.ownerCompany || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] hover:text-white text-[#0F8B7D] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Generate Tenant Invitation Link & Building Code"
                    >
                      <Share2 size={11} /> Invite Tenants
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTenantModal(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Add Existing Tenant to this property"
                    >
                      <UserPlus size={11} /> + Tenant
                    </button>
                    <Link
                      href={`/properties/rent-roll?propertyId=${p.id || ""}`}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-[#0F8B7D] hover:text-white text-gray-700 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Rent Roll →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE TENANTS & COMMERCIAL LEASES SCHEDULE */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              Active Tenants & Commercial Leases Schedule
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified corporate occupiers, monthly lease revenues, and tenant invitation links.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
              {activeLeases.length} Active {activeLeases.length === 1 ? "Lease" : "Leases"}
            </span>
            <button
              type="button"
              onClick={() => setShowAddTenantModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={13} /> Add Tenant
            </button>
            <Link
              href="/properties/rent-roll?tab=rentroll"
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              Rent Roll Master →
            </Link>
          </div>
        </div>

        {activeLeases.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No Tenants Added Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                You haven&apos;t added any commercial tenants yet. Click &apos;Add Tenant&apos; to onboard your occupants and start automated monthly billing!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTenantModal(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={14} /> Add First Tenant & Lease
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Tenant / Trade Name</th>
                  <th className="py-3 px-3">Property & Space</th>
                  <th className="py-3 px-3">Leased Area</th>
                  <th className="py-3 px-3">Monthly Rent</th>
                  <th className="py-3 px-3">Lease Period</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {activeLeases.map((l: any, idx: number) => {
                  const prop = properties.find(p => p.id === l.propertyId || p.name?.toLowerCase() === l.propertyName?.toLowerCase()) || properties[0];
                  const codeNum = (l.propertyId || prop?.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                  const inviteCode = l.inviteCode || prop?.inviteCode || `OX-${codeNum.padStart(4, "7")}`;
                  const rentAmt = Number(l.monthlyRent || l.totalMonthlyGross || 250000);
                  const areaAmt = Number(l.chargeableArea || 5000);

                  return (
                    <tr key={l.id || idx} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-gray-900">{l.tenantName || l.tradeName || "Commercial Occupier"}</div>
                        {(l.contactPerson || l.contactEmail) && (
                          <div className="text-[10px] text-gray-400 font-medium">
                            {l.contactPerson} {l.contactEmail ? `· ${l.contactEmail}` : ""}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">{l.propertyName || prop?.name || "Commercial Asset"}</div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {l.unitNumber || "Suite 401"}{l.floorNumber ? ` (Floor ${l.floorNumber})` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">{areaAmt.toLocaleString()} sq.ft.</span>
                        <div className="text-[9px] text-gray-400">Chargeable Area</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-emerald-700">₹{rentAmt.toLocaleString("en-IN")}/mo</div>
                        <div className="text-[9px] text-gray-400">₹{(rentAmt / (areaAmt || 1)).toFixed(0)}/sq.ft./mo</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-700">{l.startDate || "2025-04-01"} → {l.endDate || "2028-03-31"}</div>
                        <div className="text-[9px] text-gray-400">Escalation: {l.escalationPct || 5}% / yr</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Lease
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInviteModalProp({
                                id: l.propertyId || prop?.id || `prop-${Date.now()}`,
                                name: l.propertyName || prop?.name || "Commercial Asset",
                                location: prop?.city ? `${prop.city}, ${prop.state || ''}` : "Delhi NCR",
                                inviteCode: inviteCode,
                                ownerName: prop?.ownerName || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Asset Owner"
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] hover:text-white text-[#0F8B7D] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Send or copy tenant invitation code"
                          >
                            <Share2 size={11} /> Invite ({inviteCode})
                          </button>
                          <Link
                            href={`/properties/rent-roll?tab=invoices`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Invoices →
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

      {/* BLOCK 2: TWO-COLUMN ALERTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Critical Alerts */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShieldCheck size={18} className="text-[#0F8B7D]" />
            Statutory Compliance &amp; NOC Status
          </h3>
          <div className="flex flex-col gap-4">
            {initialCerts.filter(c => c.status === "expired").map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expired</div>
                  <div className="text-gray-500 font-semibold mt-1">Property: {properties.find(p => p.id === cert.propertyId)?.name || properties[0]?.name || "Commercial Asset"}</div>
                </div>
                <Link href="/properties/compliance" className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[10px] uppercase shadow-sm hover:bg-red-700 transition-colors">
                  Renew Certificate
                </Link>
              </div>
            ))}
            
            {initialCerts.filter(c => c.status === "valid" && c.name?.includes("Electrical")).map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expiring Soon</div>
                  <div className="text-gray-500 font-semibold mt-1">Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</div>
                </div>
                <span className="text-amber-600 font-extrabold">Renewal Window Open</span>
              </div>
            ))}

            {initialCerts.filter(c => c.status === "expired").length === 0 && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-3 text-xs text-emerald-900">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">All Statutory NOCs Fully Compliant</span>
                  <span className="text-[11px] text-emerald-700">Fire Safety NOC, Lift Inspector License, and Electrical CEA certifications are valid across your portfolio.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Audit Timeline */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ClipboardList size={18} className="text-[#0F8B7D]" />
            Security &amp; Audit Activity Logs
          </h3>
          <div className="flex flex-col gap-5 relative border-l border-gray-100 pl-6 ml-3">
            {initialLogs.length > 0 ? (
              initialLogs.slice(0, 4).map((log, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-[#0F8B7D] border-2 border-white"></span>
                  <div className="flex justify-between items-center text-gray-400 font-semibold">
                    <span>{new Date(log.createdAt || "").toLocaleDateString()}</span>
                    <span>{log.traceId || `TR-${idx + 101}`}</span>
                  </div>
                  <p className="font-bold text-gray-800 mt-1">{log.action}</p>
                  <div className="text-[10px] text-gray-500 font-bold mt-0.5">IP: {log.ipAddress || "127.0.0.1"} | Module: {log.module || "RentRoll"}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 py-3">
                <span className="font-semibold block text-gray-700">System Ready &amp; Encrypted</span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">Audit trail logging active for lease creation, GST invoicing, and collection receipts.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Commercial Property?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.name}"</span>? This will permanently remove this commercial building and its associated units from your private landlord portfolio.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Add Tenant & Active Lease Modal */}
      <AddTenantModal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        onSuccess={async () => {
          showToast("🎉 Tenant & active lease registered successfully!");
          await loadDashboardData();
        }}
        properties={properties}
      />

      {/* Tenant Invitation Modal */}
      {inviteModalProp && (
        <TenantInviteModal
          isOpen={Boolean(inviteModalProp)}
          onClose={() => setInviteModalProp(null)}
          property={inviteModalProp}
        />
      )}

    </div>
  );
}

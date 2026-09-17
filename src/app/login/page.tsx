"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Search,
  Handshake,
  Settings,
  Truck,
  Shield,
  Key
} from "lucide-react";

interface PortalConfig {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  role: string;
  category: "cre" | "ops";
  defaultEmail: string;
  dashboard: string;
  registerUrl?: string;
  registerText?: string;
  badge: string;
  badgeColor: string;
  accentBg: string;
  icon: React.ElementType;
}

const allPortals: PortalConfig[] = [
  // 1. Property Owner (Landlord) — First & Featured for Rent Roll / Asset Management
  {
    id: "owner",
    title: "Property Owner & Landlord",
    subtitle: "Commercial Landlord SaaS",
    desc: "Manage Rent Roll, lease contracts, CAM recoveries, and track asset Net Operating Income (NOI).",
    role: "Property Owner",
    category: "cre",
    defaultEmail: "owner@officex.in",
    dashboard: "/properties",
    registerUrl: "/properties/add",
    registerText: "+ List a New Property",
    badge: "Rent Roll & NOI",
    badgeColor: "bg-teal-50 text-[#0F8B7D] border-teal-200",
    accentBg: "bg-[#0F8B7D]",
    icon: Building2
  },
  // 2. Corporate Occupier (Tenant)
  {
    id: "tenant",
    title: "Corporate Occupier (Tenant)",
    subtitle: "Enterprise Workplace Portal",
    desc: "Search verified managed offices, review digital lease agreements, and pay monthly rent invoices.",
    role: "Tenant Admin",
    category: "cre",
    defaultEmail: "tenant@officex.in",
    dashboard: "/tenant",
    registerUrl: "/public/search",
    registerText: "Explore Office Spaces",
    badge: "Tenant Desk",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    accentBg: "bg-indigo-600",
    icon: Search
  },
  // 3. Broker / Partner
  {
    id: "broker",
    title: "Broker / Partner",
    subtitle: "Broker CRM & Deal Room",
    desc: "Manage corporate tenant mandates, match Grade-A spaces, generate LOIs, and track commissions.",
    role: "Broker / Partner",
    category: "cre",
    defaultEmail: "broker@officex.in",
    dashboard: "/leasing",
    registerUrl: "/signup?role=leasing_broker",
    registerText: "Register as Broker / Partner",
    badge: "1.5x Commissions",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    accentBg: "bg-amber-500",
    icon: Handshake
  },
  // 4. Facility Management (Ops Desk)
  {
    id: "ops",
    title: "Facility Operations Desk",
    subtitle: "FM Command Centre",
    desc: "Execute 52-week PPM calendars, track SLA countdowns, and audit statutory compliance vaults.",
    role: "Facility Manager",
    category: "ops",
    defaultEmail: "facilitymanager@officex.in",
    dashboard: "/ops",
    badge: "FM Command",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentBg: "bg-blue-600",
    icon: Settings
  },
  // 5. Service Vendor (Contractor)
  {
    id: "vendor",
    title: "FM Service Vendor",
    subtitle: "Contractor Marketplace Hub",
    desc: "Quote on matched corporate RFQs, dispatch field technicians, and receive direct escrow payouts.",
    role: "FM Vendor",
    category: "ops",
    defaultEmail: "vendor@officex.in",
    dashboard: "/vendor",
    badge: "Escrow Wire",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    accentBg: "bg-orange-500",
    icon: Truck
  },
  // 6. Platform Super Admin
  {
    id: "admin",
    title: "Platform Super Admin",
    subtitle: "Governance & Escrow Console",
    desc: "Multi-tenant oversight, Razorpay nodal escrow controls, user KYC verification, and audit logs.",
    role: "Super Admin",
    category: "ops",
    defaultEmail: "admin@officex.in",
    dashboard: "/admin",
    badge: "Governance",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentBg: "bg-purple-600",
    icon: Shield
  }
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const intentParam = searchParams.get("intent");
  const roleParam = searchParams.get("role");
  const contextParam = searchParams.get("context"); // "marketplace" | "fm" | "operate" | "properties"

  // Map context → default category filter
  const contextCategoryMap: Record<string, "all" | "cre" | "ops"> = {
    marketplace: "cre",
    properties: "cre",
    fm: "ops",
    operate: "ops",
  };
  const contextLabelMap: Record<string, string> = {
    marketplace: "Office Marketplace",
    properties: "Property Management",
    fm: "FM Services",
    operate: "Operations & CAFM",
  };

  // Filter state: 'all' | 'cre' | 'ops' — defaults to context-derived value
  const [activeCategory, setActiveCategory] = useState<"all" | "cre" | "ops">(
    contextParam && contextCategoryMap[contextParam] ? contextCategoryMap[contextParam] : "all"
  );

  // Selected portal for custom credentials
  const [selectedPortal, setSelectedPortal] = useState<PortalConfig | null>(null);

  // Login form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPortalId, setLoadingPortalId] = useState<string | null>(null);

  // Auto-detect redirect intent
  const isRentRollRedirect = redirectUrl?.includes("rent-roll") || redirectUrl?.includes("properties");

  // Context label for contextual heading
  const contextLabel = contextParam && contextLabelMap[contextParam] ? contextLabelMap[contextParam] : null;

  useEffect(() => {
    const targetId =
      intentParam === "broker" || roleParam === "broker" ? "broker" :
      intentParam === "list" || roleParam === "owner" ? "owner" :
      intentParam === "find" || roleParam === "tenant" ? "tenant" :
      roleParam === "ops" ? "ops" :
      roleParam === "vendor" ? "vendor" :
      roleParam === "admin" ? "admin" : null;

    if (targetId) {
      const match = allPortals.find((p) => p.id === targetId);
      if (match) {
        setSelectedPortal(match);
      }
    }
  }, [intentParam, roleParam]);

  const handleSelectPortal = (portal: PortalConfig) => {
    setSelectedPortal(portal);
    setError("");
  };

  const handleQuickSandboxLogin = (portal: PortalConfig, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoadingPortalId(portal.id);
    setIsLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_user_email", portal.defaultEmail);
      sessionStorage.setItem("officex_user_name", portal.title);
      sessionStorage.setItem("officex_user_role", portal.role);
      sessionStorage.setItem("officex_dashboard", portal.dashboard);
      sessionStorage.setItem("officex_subscription", "active");

      localStorage.setItem("officex_user_email", portal.defaultEmail);
      localStorage.setItem("officex_user_name", portal.title);
      localStorage.setItem("officex_user_role", portal.role);
      localStorage.setItem("officex_dashboard", portal.dashboard);
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_subscription=active; path=/; max-age=86400; SameSite=Lax";

      const destination = redirectUrl || portal.dashboard;
      window.location.href = destination;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    const activePortal = selectedPortal || allPortals[0];
    const role = activePortal.role;
    const dash = activePortal.dashboard;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_user_email", email.trim().toLowerCase());
      sessionStorage.setItem("officex_user_name", activePortal.title);
      sessionStorage.setItem("officex_user_role", role);
      sessionStorage.setItem("officex_dashboard", dash);
      sessionStorage.setItem("officex_subscription", "active");

      localStorage.setItem("officex_user_email", email.trim().toLowerCase());
      localStorage.setItem("officex_user_name", activePortal.title);
      localStorage.setItem("officex_user_role", role);
      localStorage.setItem("officex_dashboard", dash);
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_subscription=active; path=/; max-age=86400; SameSite=Lax";
    }

    const destination = redirectUrl || dash;
    if (typeof window !== "undefined") {
      window.location.href = destination;
    } else {
      router.push(destination);
    }
  };

  const displayedPortals = allPortals.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#F8FAFC] to-teal-50/30 flex flex-col justify-center items-center font-sans p-4 sm:p-6 lg:p-8 py-10">
      <div className="w-full max-w-5xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-3.5 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={46}
              height={46}
              className="object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={145}
              height={32}
              className="object-contain"
              priority
            />
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {selectedPortal ? `Sign in to ${selectedPortal.title}` : contextLabel ? `Sign in to ${contextLabel}` : "Select Your Workspace to Sign In"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mt-1.5 leading-relaxed">
            {selectedPortal
              ? "Enter your corporate email and password to access your secure dashboard workspace."
              : "Choose your role below to log in with your email and password or create a free account."}
          </p>

          {/* Contextual Banner for Rent Roll / Property Redirect */}
          {isRentRollRedirect && !selectedPortal && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-teal-50 border border-teal-300/80 text-[#0F8B7D] text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-pulse shrink-0" />
              <span>
                Target Destination: <strong>Rent Roll Master</strong>. Sign in as <strong>Property Owner (Landlord)</strong> to continue.
              </span>
            </div>
          )}

          {/* Contextual Banner for Landing Page Context */}
          {contextLabel && !isRentRollRedirect && !selectedPortal && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300/80 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-pulse shrink-0" />
              <span>
                Showing portals relevant to <strong>{contextLabel}</strong>.
              </span>
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="ml-auto text-[10px] text-[#0F8B7D] hover:underline font-extrabold cursor-pointer whitespace-nowrap"
              >
                Show All Portals →
              </button>
            </div>
          )}

          {/* Filter Tabs (When on Grid View) */}
          {!selectedPortal && (
            <div className="mt-5 inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/70 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Portals (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("cre")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === "cre"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                CRE &amp; Properties (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("ops")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === "ops"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Operations &amp; FM (3)
              </button>
            </div>
          )}
        </div>

        {/* VIEW 1: ORGANIZED 6-CARD GRID */}
        {!selectedPortal ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayedPortals.map((portal) => {
              const Icon = portal.icon;
              const isTarget = isRentRollRedirect && portal.id === "owner";
              const isCurrentlyLoading = loadingPortalId === portal.id;

              return (
                <div
                  key={portal.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group shadow-2xs hover:shadow-xl ${
                    isTarget
                      ? "border-teal-500 ring-2 ring-teal-500/30 shadow-md bg-teal-50/20"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  {/* Recommended Target Pill */}
                  {isTarget && (
                    <div className="absolute top-0 right-0 bg-[#0F8B7D] text-white text-[9.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow-xs">
                      ★ Recommended for Rent Roll
                    </div>
                  )}

                  {/* Top Metadata */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl ${portal.accentBg} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {portal.title}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                      {portal.subtitle}
                    </span>

                    <p className="text-xs text-slate-600 font-normal mt-2.5 leading-relaxed min-h-[48px]">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPortal(portal)}
                      className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-white ${
                        isTarget
                          ? "bg-[#0F8B7D] hover:bg-[#0c7368] shadow-sm hover:shadow-md"
                          : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      <span>Sign In to Workspace</span>
                      <ArrowRight size={13} />
                    </button>

                    <Link
                      href={portal.registerUrl || `/signup?role=${portal.id}`}
                      className="text-[11px] font-semibold text-[#0F8B7D] hover:text-[#0c7368] hover:underline text-center py-1 transition-colors"
                    >
                      {portal.registerText || "New user? Create account →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: FOCUSED LOGIN CREDENTIALS FORM */
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
            
            {/* Back to all portals */}
            <button
              onClick={() => setSelectedPortal(null)}
              className="text-xs font-bold text-slate-500 hover:text-[#0F8B7D] flex items-center gap-1.5 mb-5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to all workspaces</span>
            </button>

            {/* Role Header Banner */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${selectedPortal.accentBg} text-white flex items-center justify-center shadow-xs shrink-0`}
                >
                  <selectedPortal.icon size={20} />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                    {selectedPortal.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedPortal.subtitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPortal(null)}
                className="text-[11px] font-bold text-[#0F8B7D] hover:underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-xs leading-normal"
                >
                  ⚠ {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Corporate Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-slate-900 font-medium"
                    required
                  />
                  <User size={14} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-slate-900 font-medium"
                    required
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? "Signing in..." : `Sign In to ${selectedPortal.title}`}</span>
                <ArrowRight size={14} />
              </button>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/signup?role=${selectedPortal.id}`}
                    className="text-[#0F8B7D] font-extrabold hover:underline"
                  >
                    Sign Up for Free →
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}


        {/* Trust Strip & Bottom Navigation */}
        <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0F8B7D]" />
            SOC 2 Type II Certified
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Key size={14} className="text-[#0F8B7D]" />
            AES-256 Vaulted Auth
          </span>
          <span>•</span>
          <Link href="/marketplace" className="text-slate-500 hover:text-slate-800">
            Marketplace Home
          </Link>
          <span>•</span>
          <Link href="/signup" className="text-[#0F8B7D] font-bold hover:underline">
            Create New Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500">
          Loading portals...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

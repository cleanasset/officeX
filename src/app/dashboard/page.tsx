"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Store,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Users,
  Compass,
  FileText,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Receipt,
  HelpCircle,
  LogOut,
  Calendar,
  MapPin,
  Check,
  AlertCircle,
  Wrench,
  Sliders,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { performClientLogout, getLogoutRedirect } from "@/lib/auth-client";
import { getClientAuthHeaders } from "@/lib/auth-storage";

function WorkspaceHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextParam = searchParams?.get("context") || "";

  // View Mode: "saas" (Only 6 SaaS modules, no marketplaces) vs "all" (The 3 Main Pillars)
  const [viewMode, setViewMode] = useState<"saas" | "all">(
    contextParam === "operate" || contextParam === "saas" ? "saas" : "all"
  );

  // User State
  const [userName, setUserName] = useState<string>("Commercial Member");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("Commercial Property Owner");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Granular Modular Entitlements
  const [userModules, setUserModules] = useState<{
    allInOne: boolean;
    rentRoll: boolean;
    visitors: boolean;
    ppm: boolean;
    compliance: boolean;
    helpdesk: boolean;
    leaseCrm: boolean;
  }>({
    allInOne: false,
    rentRoll: false,
    visitors: false,
    ppm: false,
    compliance: false,
    helpdesk: false,
    leaseCrm: false,
  });

  // Pillar 1: Rent Roll SaaS State
  const [isRentRollSubscribed, setIsRentRollSubscribed] = useState<boolean>(false);
  const [rentRollPropertyName, setRentRollPropertyName] = useState<string>("");
  const [activeLeaseCount, setActiveLeaseCount] = useState<number>(0);

  // Pillar 2: Office Marketplace State
  const [hasMarketplaceListings, setHasMarketplaceListings] = useState<boolean>(false);
  const [listingsCount, setListingsCount] = useState<number>(0);
  const [recentLeadCount, setRecentLeadCount] = useState<number>(0);

  useEffect(() => {
    async function evaluateWorkspaceState() {
      try {
        let email = "";
        let name = "";
        let role = "";

        // 1. Resolve Identity from Supabase session or Storage
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          email = (session.user.email || "").toLowerCase().trim();
          name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        }

        if (typeof window !== "undefined") {
          if (!email) {
            email = (
              localStorage.getItem("officex_user_email") ||
              sessionStorage.getItem("officex_user_email") ||
              ""
            ).toLowerCase().trim();
          }
          if (!name) {
            name = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
          }
          role = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "Property Owner & Landlord";
        }

        if (!name && email) {
          name = email.split("@")[0].replace(/[._-]/g, " ");
        }

        if (email || session?.user) {
          setIsLoggedIn(true);
          setUserEmail(email);
          setUserName(name || "Commercial Partner");
          setUserRole(role);
        }

        // Super Admin bypass: Admin should NEVER be asked to select user workspaces
        const isAdmin =
          (email.toLowerCase().trim() === "admin@gmail.com" ||
          email.toLowerCase().trim() === "medistationlifecare@gmail.com") &&
          (role === "super_admin" ||
          (typeof window !== "undefined" && (
            localStorage.getItem("officex_admin") === "1" ||
            sessionStorage.getItem("officex_admin") === "1" ||
            localStorage.getItem("officex_role") === "super_admin" ||
            document.cookie.includes("officex_admin=1")
          )));

        if (isAdmin) {
          setIsSuperAdmin(true);
          router.replace("/admin");
          return;
        }

        // 2. Evaluate Modular Subscriptions (Strict Server-Verified Tiering)
        let subActive = false;

        if (typeof window !== "undefined") {
          const propName =
            localStorage.getItem("officex_active_property") ||
            localStorage.getItem("officex_property_name") ||
            "";
          if (propName) setRentRollPropertyName(propName);
        }

        if (isAdmin) {
          subActive = true;
          setUserModules({
            allInOne: true,
            rentRoll: true,
            visitors: true,
            ppm: true,
            compliance: true,
            helpdesk: true,
            leaseCrm: true,
          });
        } else if (email) {
          try {
            const subRes = await fetch(`/api/subscription/status?email=${encodeURIComponent(email)}`);
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData?.subscribed && subData.plan !== "none" && subData.plan !== "free") {
                subActive = subData.modules ? Boolean(subData.modules.rentRoll || subData.modules.allInOne) : true;
                if (subData.modules) {
                  setUserModules(subData.modules);
                }
              } else {
                subActive = false;
                setUserModules({
                  allInOne: false,
                  rentRoll: false,
                  visitors: false,
                  ppm: false,
                  compliance: false,
                  helpdesk: false,
                  leaseCrm: false,
                });
                // Clean up stale client flags from old sessions
                if (typeof window !== "undefined") {
                  localStorage.removeItem("officex_subscription");
                  localStorage.removeItem("officex_rentroll_subscribed");
                  localStorage.removeItem("officex_payment_id");
                  localStorage.removeItem("officex_applied_coupon");
                  sessionStorage.removeItem("officex_subscription");
                  document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                }
              }
            }
          } catch {
            subActive = false;
          }
        }
        setIsRentRollSubscribed(subActive);

        // Fetch properties or contracts count for active Rent Roll users
        const authHeaders = getClientAuthHeaders();
        try {
          const propRes = await fetch("/api/rent-roll/properties", { headers: authHeaders });
          if (propRes.ok) {
            const propData = await propRes.json();
            if (Array.isArray(propData?.data) && propData.data.length > 0) {
              setRentRollPropertyName(propData.data[0].property_name || "Commercial Asset");
            }
          }
        } catch {}

        try {
          const contRes = await fetch("/api/rent-roll/contracts", { headers: authHeaders });
          if (contRes.ok) {
            const contData = await contRes.json();
            if (Array.isArray(contData?.data)) {
              setActiveLeaseCount(contData.data.length);
            }
          }
        } catch {}

        // 3. Evaluate Pillar 2: Office Marketplace Listings
        try {
          const listRes = await fetch("/api/marketplace/listings?limit=6");
          if (listRes.ok) {
            const lData = await listRes.json();
            const total = lData.total || (Array.isArray(lData.listings) ? lData.listings.length : 0);
            if (total > 0) {
              const userListings = typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("officex_user_listings") || "[]")
                : [];
              if (userListings.length > 0) {
                setHasMarketplaceListings(true);
                setListingsCount(userListings.length);
              } else if (localStorage.getItem("officex_has_marketplace_listings") === "true") {
                setHasMarketplaceListings(true);
                setListingsCount(1);
              }
            }
          }
        } catch {}

        try {
          const enqRes = await fetch("/api/marketplace/enquiries");
          if (enqRes.ok) {
            const eData = await enqRes.json();
            if (Array.isArray(eData?.enquiries)) {
              setRecentLeadCount(eData.enquiries.length);
            }
          }
        } catch {}
      } catch (err) {
        console.error("Workspace hub evaluation error:", err);
      } finally {
        setLoading(false);
      }
    }

    evaluateWorkspaceState();
  }, []);

  const handleSignOut = async () => {
    await performClientLogout(getLogoutRedirect("/dashboard"));
  };

  // 6 Commercial SaaS Modules in OfficeX Operate
  const isRentRollActive = Boolean(userModules.rentRoll || userModules.allInOne || isRentRollSubscribed);

  const saasModulesList = [
    {
      id: "rent-roll",
      title: "Rent Roll & Operations",
      tag: "Core ERP Platform",
      desc: "For owners managing active tenants, leases, and cash flow. Automate your 39-point contract register, monthly rent runs, step escalations, and CAM pooling.",
      activeHref: "/properties/rent-roll",
      freeHref: "/properties/rent-roll",
      icon: Building2,
      color: "from-[#0F8B7D] to-emerald-700",
      isSubscribed: isRentRollActive,
      freeNotice: "Free workspace: Add unlimited properties, units & tenants. (Rent Roll calculation locked).",
      freeButtonLabel: "Open Free Workspace",
      subscribeHref: "/operate/subscription",
    },
    {
      id: "visitors",
      title: "Visitor Flow & Reception Kiosk",
      tag: "Access Control",
      desc: "Instant guest check-in via WhatsApp QR passes, turnstile speed-gate relay, and lobby badges.",
      activeHref: "/visitors",
      freeHref: "/visitors",
      icon: Users,
      color: "from-blue-600 to-indigo-700",
      isSubscribed: userModules.visitors || userModules.allInOne,
      freeNotice: "Explore digital reception kiosk demo & visitor badge preview.",
      subscribeHref: "/operate/pricing?mode=standalone&module=visitor",
    },
    {
      id: "ppm",
      title: "52-Week PPM Maintenance",
      tag: "Facility Engineering",
      desc: "Digitize MEP equipment servicing with OEM matrices, asset QR passports, and equipment logbooks.",
      activeHref: "/operate/ppm",
      freeHref: "/operate/ppm",
      icon: Wrench,
      color: "from-amber-600 to-orange-700",
      isSubscribed: userModules.ppm || userModules.allInOne,
      freeNotice: "Review 52-week preventive maintenance matrices and equipment lifecycle.",
      subscribeHref: "/operate/pricing?mode=standalone&module=ppm",
    },
    {
      id: "compliance",
      title: "Statutory Compliance Calendar",
      tag: "Statutory Governance",
      desc: "Centralized tracking for Fire NOC, Lift Form A, PCB CTO, and municipal commercial renewals.",
      activeHref: "/operate/compliance",
      freeHref: "/operate/compliance",
      icon: FileText,
      color: "from-emerald-600 to-teal-800",
      isSubscribed: userModules.compliance || userModules.allInOne,
      freeNotice: "48 Pre-configured commercial tower licenses with automated audit countdowns.",
      subscribeHref: "/operate/pricing?mode=standalone&module=compliance",
    },
    {
      id: "helpdesk",
      title: "Corporate Helpdesk & SLA",
      tag: "Ticketing Desk",
      desc: "Occupant maintenance tickets, SLA escalation timers, vendor work orders, and resolution logs.",
      activeHref: "/operate/helpdesk",
      freeHref: "/operate/helpdesk",
      icon: HelpCircle,
      color: "from-purple-600 to-indigo-700",
      isSubscribed: userModules.helpdesk || userModules.allInOne,
      freeNotice: "Explore facility helpdesk, technician dispatch queues & SLA policies.",
      subscribeHref: "/operate/pricing?mode=standalone&module=helpdesk",
    },
    {
      id: "lease-crm",
      title: "Commercial Leasing CRM",
      tag: "Asset Marketing",
      desc: "Vacant space listings, broker mandates, interactive stacking plans, and LOI generation.",
      activeHref: "/operate/lease-crm",
      freeHref: "/operate/lease-crm",
      icon: TrendingUp,
      color: "from-rose-600 to-pink-700",
      isSubscribed: userModules.leaseCrm || userModules.allInOne,
      freeNotice: "Explore vacant floor demarcations, visual stacking plans & broker deal pipeline.",
      subscribeHref: "/operate/pricing?mode=standalone&module=leasecrm",
    },
  ];

  const activeModulesCount = userModules.allInOne
    ? 6
    : [
        userModules.rentRoll || isRentRollSubscribed,
        userModules.visitors,
        userModules.ppm,
        userModules.compliance,
        userModules.helpdesk,
        userModules.leaseCrm,
      ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* ──────────────── TOP SOVEREIGN LAUNCHPAD NAVBAR ──────────────── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image 
                src="/logo-removebg-preview.png" 
                alt="OfficeX Logo" 
                width={38} 
                height={38} 
                className="object-contain group-hover:scale-105 transition-transform"
                style={{ width: "auto", height: "32px" }}
                priority
              />
              <Image 
                src="/name-removebg-preview.png" 
                alt="OfficeX" 
                width={125} 
                height={30} 
                className="object-contain"
                style={{ width: "auto", height: "25px" }}
                priority
              />
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 ml-1">
                Workspace Hub
              </span>
            </Link>
          </div>

          {/* User Account & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                {(isSuperAdmin || userEmail === "admin@gmail.com") && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-teal-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck size={14} className="text-teal-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 capitalize truncate max-w-[150px]">
                    {userName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[150px]">
                    {userEmail || userRole}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-black text-xs flex items-center justify-center shadow-2xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out of OfficeX"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirect=/dashboard"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────── HERO / SELECTION BANNER ──────────────── */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/70 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
            <Sparkles size={13} className="text-[#0F8B7D]" />
            <span>Commercial Real Estate &amp; Facilities Operating Ecosystem</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Where would you like to work today{userName && userName !== "Commercial Member" ? `, ${userName.split(" ")[0]}` : ""}?
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            Each commercial module operates with its own dedicated dashboard and capabilities. Review your active entitlements below and select your workspace.
          </p>

          {/* Quick Domain Filter Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("saas")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === "saas"
                    ? "bg-white text-teal-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Commercial SaaS Workspaces (6 Modules)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === "all"
                    ? "bg-white text-teal-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Workspaces (SaaS + Marketplaces)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── MAIN WORKSPACE CARDS AREA ──────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Super Admin Notice Banner */}
        {(isSuperAdmin || userEmail === "admin@gmail.com") && (
          <div className="mb-8 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={22} className="text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-700/50">
                    SUPER ADMIN ACCESS
                  </span>
                  <span className="text-xs font-mono text-slate-400">admin@gmail.com</span>
                </div>
                <h3 className="text-base font-black text-white mt-1">
                  Master Platform Governance &amp; Controls
                </h3>
                <p className="text-xs text-slate-400">
                  You are signed in as Super Administrator. You have system-wide authority to manage all database tables, marketplace pricing, users, and portfolios directly.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition shadow-md"
            >
              <span>Go to Super Admin Panel</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 1: SAAS MODULES ONLY (Selected when coming from /operate)
            ══════════════════════════════════════════════════════════════════════════ */}
        {viewMode === "saas" ? (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">
                  Operate Domain
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Independent Commercial SaaS Modules
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Each tool has its own dedicated dashboard. Click any module below to open its workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline self-start sm:self-auto cursor-pointer"
              >
                Switch to Marketplace View →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {saasModulesList.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-teal-500/60 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 relative group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md`}>
                          <IconComponent size={22} />
                        </div>
                        {mod.isSubscribed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                            Free Workspace
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                          {mod.tag}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>

                      {/* Context / Free notice */}
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-[11px] font-medium text-slate-600">
                        {mod.isSubscribed ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            <span>Dedicated {mod.title} workspace active</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">{mod.freeNotice}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-5 border-t border-slate-100 mt-5 space-y-2">
                      {mod.isSubscribed ? (
                        <Link
                          href={mod.activeHref}
                          className="w-full py-3 px-4 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 text-center"
                        >
                          <span>Open Dashboard</span>
                          <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <div className="space-y-1.5">
                          <Link
                            href={mod.freeHref}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 text-center"
                          >
                            <span>{mod.freeButtonLabel || "Open Free Workspace"}</span>
                            <ArrowRight size={13} />
                          </Link>
                          <Link
                            href={mod.subscribeHref}
                            className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200/80 text-[11px] font-bold transition flex items-center justify-center gap-1 text-center"
                          >
                            <Lock size={11} />
                            <span>Subscribe to Unlock Pro</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════════
              VIEW 2: THE 3 PILLARS (SaaS Platform, Office Marketplace, FM Marketplace)
              ══════════════════════════════════════════════════════════════════════════ */
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* CARD 1: COMMERCIAL SAAS WORKSPACES (OPERATE - 6 MODULES) */}
              <div className="bg-white rounded-3xl border-2 border-teal-500/40 hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F8B7D] to-teal-800 text-white flex items-center justify-center shadow-md">
                      <Layers size={24} />
                    </div>
                    {/* Dynamic Status Badge */}
                    {activeModulesCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {activeModulesCount} Active Module{activeModulesCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black uppercase tracking-wider">
                        Free Workspaces Available
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">
                      Commercial SaaS Platform (Operate)
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      Commercial SaaS Workspaces
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      6 specialized commercial software modules: Automated Rent Roll, Visitor Flow Kiosk, 52-Week PPM, Statutory Compliance, Helpdesk &amp; Leasing CRM.
                    </p>
                  </div>

                  {/* Status Context Pill */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                      <span>Included Tools:</span>
                      <span className="font-bold text-teal-800">
                        {activeModulesCount > 0 ? `${activeModulesCount}/6 Subscribed` : "6 Free Tools Available"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {saasModulesList.map((m) => (
                        <span
                          key={m.id}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            m.isSubscribed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {m.isSubscribed ? "✓ " : ""}{m.title.split("&")[0].trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                      <span>Automated Rent Roll &amp; 39-Point Lease Register</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                      <span>Visitor Flow QR reception kiosk &amp; turnstiles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                      <span>52-Week PPM maintenance &amp; statutory compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                      <span>Corporate SLA helpdesk &amp; commercial leasing CRM</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6 border-t border-slate-100 mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => setViewMode("saas")}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn cursor-pointer text-center"
                  >
                    <span>Open Commercial SaaS Options (6 Tools)</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-bold text-slate-600 pt-0.5">
                    <Link
                      href="/properties/rent-roll"
                      className="text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      Rent Roll &amp; Operations →
                    </Link>
                    <span className="text-slate-300">·</span>
                    <Link
                      href="/properties/tenants"
                      className="text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Tenants →
                    </Link>
                    <span className="text-slate-300">·</span>
                    <Link
                      href="/visitors"
                      className="text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Visitor Flow →
                    </Link>
                    <span className="text-slate-300">·</span>
                    <Link
                      href="/operate/ppm"
                      className="text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      52-Week PPM →
                    </Link>
                  </div>
                </div>
              </div>

              {/* CARD 2: OFFICE MARKETPLACE (Tenant Acquisition & Listings) */}
              <div className="bg-white rounded-3xl border-2 border-blue-500/30 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
                      <Compass size={24} />
                    </div>
                    {hasMarketplaceListings ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 text-[11px] font-black uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        {listingsCount} Space(s) Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold">
                        No Listings Yet · Free
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                      Tenant Acquisition
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      Office Marketplace
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      For property owners and coworking operators seeking tenants. List vacant offices, desks, or managed enterprise floors to receive verified leads.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                      <span>Marketplace Role:</span>
                      <span className="font-bold text-slate-900">Host / Property Lister</span>
                    </div>
                    {hasMarketplaceListings ? (
                      <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                        <span>Inquiry Pipeline:</span>
                        <span className="font-bold text-blue-800">{recentLeadCount} Active Inquiries</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-600 font-medium">
                        Zero upfront listing fee · Direct enterprise inquiries &amp; site visits
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>Pan-India discovery across 25+ commercial cities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>Verified corporate tenant leads &amp; site visit bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>Dedicated partner console for inquiry and deal pipeline</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                  <Link
                    href="/marketplace"
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
                  >
                    <span>List Your Property (Free)</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <span className="block text-center text-[10px] text-slate-600 font-semibold">
                    Publish vacant desks, cabins, or bare-shell floors
                  </span>
                </div>
              </div>

              {/* CARD 3: FM MARKETPLACE (Facilities & Services Procurement) */}
              <div className="bg-white rounded-3xl border-2 border-amber-500/30 hover:border-amber-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                      <Zap size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Open Gateway
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                      Service Procurement
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      FM Marketplace
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      For property managers and building owners seeking services. Float RFPs for housekeeping, security, MEP, HVAC maintenance, and compare verified vendor quotes.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                      <span>Access Level:</span>
                      <span className="font-bold text-slate-900">Complimentary for OfficeX Accounts</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      Standardized scopes · Pre-vetted vendors · Statutory compliance
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                      <span>Direct RFP / RFQ creation with itemized line items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                      <span>Compare rate cards, vendor SLAs &amp; statutory checks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                      <span>Award contracts &amp; link service billing to CAM pools</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                  <Link
                    href="/fm-marketplace"
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
                  >
                    <span>Open FM Services &amp; Float RFP</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <span className="block text-center text-[10px] text-slate-600 font-semibold">
                    Procure site services or submit service proposals
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── BOTTOM SHARED ECOSYSTEM CALLOUT ──────────────── */}
        <div className="mt-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-700/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
                <Sparkles size={14} />
                <span>The OfficeX Shared Commercial Ecosystem</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Two-way cross-product handshake for commercial landlords
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                • <strong>Marketplace → Rent Roll:</strong> When an inquiry converts into a signed lease on the Marketplace, push the contract terms into Rent Roll with 1 click.<br />
                • <strong>Rent Roll → Marketplace:</strong> When an active lease nears expiry in Rent Roll, publish the upcoming vacant space back onto the Marketplace instantly.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/marketplace/search"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
              >
                Browse Live Spaces
              </Link>
              <Link
                href="/about"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Architecture Guide
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WorkspaceHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading workspaces...</div>}>
      <WorkspaceHubContent />
    </Suspense>
  );
}

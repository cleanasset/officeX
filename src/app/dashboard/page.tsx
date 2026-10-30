"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { performClientLogout, getLogoutRedirect } from "@/lib/auth-client";

export default function WorkspaceHubPage() {
  const router = useRouter();

  // User State
  const [userName, setUserName] = useState<string>("Commercial Member");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("Commercial Property Owner");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
          email.toLowerCase().trim() === "admin@gmail.com" ||
          email.toLowerCase().trim() === "medistationlifecare@gmail.com" ||
          role === "super_admin" ||
          (typeof window !== "undefined" && (
            localStorage.getItem("officex_admin") === "1" ||
            sessionStorage.getItem("officex_admin") === "1" ||
            localStorage.getItem("officex_role") === "super_admin" ||
            document.cookie.includes("officex_admin=1")
          ));

        if (isAdmin) {
          setIsSuperAdmin(true);
          router.replace("/admin");
          return;
        }

        // 2. Evaluate Pillar 1: Rent Roll Subscription (Strict Server-Verified Tiering)
        // Free tier: access to Properties, Demarcated Spaces, Tenants, Leases & Third-Party Managers.
        // Paid tier: Institutional Rent Roll calculation & CAM engine requires an active subscription.
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
        } else if (email) {
          try {
            const subRes = await fetch(`/api/subscription/status?email=${encodeURIComponent(email)}`);
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData?.subscribed && subData.plan !== "none" && subData.plan !== "free") {
                subActive = true;
              } else {
                subActive = false;
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
        try {
          const propRes = await fetch("/api/rent-roll/properties");
          if (propRes.ok) {
            const propData = await propRes.json();
            if (Array.isArray(propData?.data) && propData.data.length > 0) {
              setRentRollPropertyName(propData.data[0].property_name || "Commercial Asset");
            }
          }
        } catch {}

        try {
          const contRes = await fetch("/api/rent-roll/contracts");
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
              // Check if user has explicit listings stored or if they have partner records
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
                style={{ width: "auto", height: "30px" }}
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
        <div className="max-w-5xl mx-auto text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
            <Sparkles size={13} className="text-[#0F8B7D]" />
            <span>1 Unified Account · 3 Independent Workplaces</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Where would you like to work today{userName && userName !== "Commercial Member" ? `, ${userName.split(" ")[0]}` : ""}?
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            Each workspace is dedicated to a distinct commercial workflow. Review the status below and click any workspace to enter directly.
          </p>
        </div>
      </section>

      {/* ──────────────── 3 INDEPENDENT WORKSPACE CARDS ──────────────── */}
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
                  You are signed in as Super Administrator. You have system-wide authority to manage all 133 database tables, marketplace pricing, users, and portfolios directly.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* ══════════════════════════════════════════════════════════════════════════
              CARD 1: RENT ROLL & COMMERCIAL OPERATIONS (SaaS ERP)
              ══════════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-teal-500/30 hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
            {/* Top Tag */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F8B7D] to-emerald-700 text-white flex items-center justify-center shadow-md">
                  <Building2 size={24} />
                </div>
                {/* Dynamic Status Badge */}
                {isRentRollSubscribed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Subscription
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[11px] font-black uppercase tracking-wider">
                    <Lock size={12} className="text-amber-800" />
                    Subscription Required
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">
                  Core ERP Platform
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rent Roll &amp; Operations
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  For owners managing active tenants, leases, and cash flow. Automate your 39-point contract register, monthly rent runs, step escalations, and CAM pooling.
                </p>
              </div>

              {/* Status Context Pill */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                  <span>Operational Status:</span>
                  <span className={`font-bold ${isRentRollSubscribed ? "text-slate-900" : "text-amber-800"}`}>
                    {isRentRollSubscribed ? "Sovereign License Active" : "Free Workspace Active · Rent Roll Locked"}
                  </span>
                </div>
                {isRentRollSubscribed ? (
                  <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                    <span>Configured Asset:</span>
                    <span className="font-bold text-teal-800 truncate max-w-[150px]">
                      {rentRollPropertyName || "Primary Asset Desk"}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-900 font-medium bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                    Rent Roll &amp; CAM billing engine is locked. Free workspace allows adding properties, spaces, tenants &amp; contracts.
                  </div>
                )}
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                  <span>39-Point canonical lease contract master</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                  <span>Monthly batch billing, GST (18%) &amp; TDS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                  <span>CAM expense pooling &amp; sub-meter readings</span>
                </div>
              </div>
            </div>

            {/* CTA Button (Explicit Click - No auto-redirect) */}
            <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
              {isRentRollSubscribed ? (
                <Link
                  href="/properties/rent-roll"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
                >
                  <span>Open Rent Roll Dashboard</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/properties/rent-roll"
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center cursor-pointer"
                >
                  <Lock size={14} className="text-slate-950" />
                  <span>Subscribe to Access Rent Roll</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              )}
              <div className="text-center pt-1">
                <Link
                  href="/properties/registry"
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>Manage Properties, Tenants &amp; Contracts (Free) →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════
              CARD 2: OFFICE MARKETPLACE (Tenant Acquisition & Listings)
              ══════════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-blue-500/30 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
            {/* Top Tag */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
                  <Compass size={24} />
                </div>
                {/* Dynamic Status Badge */}
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

              {/* Status Context Pill */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                  <span>Marketplace Role:</span>
                  <span className="font-bold text-slate-900">
                    Host / Property Lister
                  </span>
                </div>
                {hasMarketplaceListings ? (
                  <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                    <span>Inquiry Pipeline:</span>
                    <span className="font-bold text-blue-800">
                      {recentLeadCount} Active Inquiries
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 font-medium">
                    Zero upfront listing fee · Direct enterprise inquiries &amp; site visits
                  </div>
                )}
              </div>

              {/* Feature Checklist */}
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

            {/* CTA Button (Explicit Click - No auto-redirect) */}
            <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
              {hasMarketplaceListings ? (
                <Link
                  href="/marketplace/dashboard"
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
                >
                  <span>Open Partner Console</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/list-space"
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
                >
                  <span>List Your Property (Free)</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-blue-400" />
                </Link>
              )}
              <span className="block text-center text-[10px] text-slate-600 font-semibold">
                {hasMarketplaceListings ? "Manage live spaces, enquiries & site visits" : "Publish vacant desks, cabins, or bare-shell floors"}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════
              CARD 3: FM MARKETPLACE (Facility Management & RFPs)
              ══════════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-amber-500/30 hover:border-amber-500 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-6 sm:p-7 relative group">
            {/* Top Tag */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md">
                  <Zap size={24} />
                </div>
                {/* Dynamic Status Badge */}
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

              {/* Status Context Pill */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                  <span>Access Level:</span>
                  <span className="font-bold text-slate-900">
                    Complimentary for OfficeX Accounts
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Standardized scopes · Pre-vetted vendors · Statutory compliance
                </div>
              </div>

              {/* Feature Checklist */}
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

            {/* CTA Button (Explicit Click - No auto-redirect) */}
            <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
              <Link
                href="/fm-marketplace"
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn text-center"
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

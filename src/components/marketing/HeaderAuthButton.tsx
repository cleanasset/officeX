"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Wrench
} from "lucide-react";

interface HeaderAuthButtonProps {
  className?: string;
  /** Context key passed to /login?context=... for contextual portal filtering */
  loginContext?: "marketplace" | "fm" | "operate" | "properties" | "rent-roll" | "";
  onSignInClick?: () => void;
}

export default function HeaderAuthButton({ className = "", loginContext = "", onSignInClick }: HeaderAuthButtonProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      const hasAuthCookie = document.cookie.includes("officex_auth=1");
      const sessionActive = sessionStorage.getItem("officex_session_active") === "1";
      const localEmail = localStorage.getItem("officex_user_email");

      if (!hasAuthCookie && !sessionActive && !localEmail) {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
        setIsSubscribed(false);
        return;
      }

      // If auth cookie or local email exists, ensure sessionStorage is active
      if (!sessionActive && (hasAuthCookie || localEmail)) {
        sessionStorage.setItem("officex_session_active", "1");
      }

      const email = sessionStorage.getItem("officex_user_email") || localStorage.getItem("officex_user_email");
      let name = sessionStorage.getItem("officex_user_name") || localStorage.getItem("officex_user_name") || "";
      if (!name && email) {
        name = email.split("@")[0].replace(/[._-]/g, " ");
      }
      if (!name) name = "Member";

      const role = sessionStorage.getItem("officex_user_role") || localStorage.getItem("officex_user_role") || "Commercial Owner";
      const sub = email ? (
        sessionStorage.getItem(`officex_sub_${email}`) === "active" ||
        localStorage.getItem(`officex_sub_${email}`) === "active" ||
        document.cookie.includes(`officex_sub_${encodeURIComponent(email)}=active`)
      ) : false;

      if (email || hasAuthCookie) {
        setIsLoggedIn(true);
        setUserName(name);
        setUserRole(role);
        setIsSubscribed(sub);
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
        setIsSubscribed(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_name");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_user_mobile");
      localStorage.removeItem("officex_user_phone");
      localStorage.removeItem("officex_user");
      localStorage.removeItem("officex_subscription");
      localStorage.removeItem("officex_dashboard");
      localStorage.removeItem("officex_active_portal");
      localStorage.removeItem("officex_active_org");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/");
    window.location.reload();
  };

  const loginHref = loginContext === "rent-roll"
    ? "/login?context=rent-roll&redirect=/properties/rent-roll"
    : loginContext === "marketplace"
    ? "/login?context=marketplace&redirect=/marketplace"
    : loginContext === "fm"
    ? "/login?context=fm&redirect=/fm-marketplace"
    : loginContext === "operate"
    ? "/login?context=operate&redirect=/operate"
    : loginContext === "properties"
    ? "/login?context=properties&redirect=/properties"
    : "/login?context=marketplace&redirect=/marketplace";

  if (!mounted) {
    return (
      <Link
        href={loginHref}
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors ${className}`}
      >
        Sign In
      </Link>
    );
  }

  if (isLoggedIn) {
    const dashboardHref =
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("officex_dashboard") ||
          localStorage.getItem("officex_dashboard"))) ||
      "/properties";
    const effectiveDashboardHref =
      dashboardHref && dashboardHref !== "/" ? dashboardHref : "/properties";

    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all border border-slate-200 shadow-2xs cursor-pointer"
          title={`Signed in as ${userName}`}
        >
          <div className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[110px] truncate font-bold text-slate-800">{userName.split(" ")[0]}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Profile Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 text-sm truncate">{userName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  Signed In
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{userRole}</p>
            </div>

            {/* Core Operating SaaS Navigation */}
            <div className="py-1.5 space-y-0.5">
              {/* Go to My Dashboard */}
              <Link
                href={effectiveDashboardHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <LayoutDashboard size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Go to My Dashboard</span>
                  <span className="text-[10px] text-slate-400 font-medium">Portfolio &amp; Asset Overview</span>
                </div>
              </Link>

              {/* My Profile & KYC */}
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <User size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">My Profile &amp; KYC</span>
                  <span className="text-[10px] text-slate-400 font-medium">Account &amp; Entity Verification</span>
                </div>
              </Link>

              {/* Rent Roll & Billing */}
              <Link
                href="/properties/rent-roll"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Building2 size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Rent Roll &amp; Billing</span>
                  <span className="text-[10px] text-slate-400 font-medium">Automated Leases &amp; CAM</span>
                </div>
              </Link>

              {/* 52-Week PPM Schedule */}
              <Link
                href="/ops"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Wrench size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">52-Week PPM &amp; CAFM</span>
                  <span className="text-[10px] text-slate-400 font-medium">Preventive Equipment Servicing</span>
                </div>
              </Link>

              {/* Compliance Calendar */}
              <Link
                href="/compliance"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <ShieldCheck size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Compliance Calendar</span>
                  <span className="text-[10px] text-slate-400 font-medium">Statutory Licenses &amp; Audits</span>
                </div>
              </Link>
            </div>

            {/* Sign Out */}
            <div className="pt-1.5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (onSignInClick) {
    return (
      <button
        type="button"
        onClick={onSignInClick}
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors cursor-pointer ${className}`}
      >
        Sign In
      </button>
    );
  }

  return (
    <Link
      href={loginHref}
      className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors cursor-pointer ${className}`}
    >
      Sign In
    </Link>
  );
}

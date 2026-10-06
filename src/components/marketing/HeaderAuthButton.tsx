"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getAuthCookie, clearAuthCookie } from "@/lib/auth-storage";
import { performClientLogout } from "@/lib/auth-client";

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
    const checkAuth = (authUser?: any) => {
      if (typeof window === "undefined") return;
      const hasAuthCookie =
        document.cookie.includes("officex_session_active=1") ||
        document.cookie.includes("officex_auth=1") ||
        document.cookie.includes("officex_auth=true") ||
        getAuthCookie("officex_auth") === "1";
      const sessionActive =
        sessionStorage.getItem("officex_session_active") === "1" ||
        localStorage.getItem("officex_session_active") === "1";

      if (!hasAuthCookie && !sessionActive && !authUser) {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
        setIsSubscribed(false);
        return;
      }

      let email =
        authUser?.email ||
        sessionStorage.getItem("officex_user_email") ||
        localStorage.getItem("officex_user_email") ||
        getAuthCookie("officex_user_email") ||
        "";
      let name =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        sessionStorage.getItem("officex_user_name") ||
        localStorage.getItem("officex_user_name") ||
        "";

      if (!name && email) {
        name = email.split("@")[0].replace(/[._-]/g, " ");
      }
      if (!name) name = "Member";

      const role =
        sessionStorage.getItem("officex_user_role") ||
        localStorage.getItem("officex_user_role") ||
        "Commercial Owner";
      const sub = email
        ? sessionStorage.getItem(`officex_sub_${email}`) === "active" ||
          localStorage.getItem(`officex_sub_${email}`) === "active" ||
          document.cookie.includes(`officex_sub_${encodeURIComponent(email)}=active`)
        : false;

      setIsLoggedIn(true);
      setUserName(name);
      setUserRole(role);
      setIsSubscribed(sub);
    };

    checkAuth();

    // Check Supabase session directly on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAuth(session.user);
      }
    }).catch(() => {});

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAuth(session.user);
      } else if (event === "SIGNED_OUT") {
        checkAuth(null);
      }
    });

    window.addEventListener("storage", () => checkAuth());
    window.addEventListener("officex_auth_change", ((e: CustomEvent) => checkAuth(e?.detail?.user)) as EventListener);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("storage", () => checkAuth());
      window.removeEventListener("officex_auth_change", ((e: CustomEvent) => checkAuth(e?.detail?.user)) as EventListener);
    };
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

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
    await performClientLogout("/");
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
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

            {/* Core User Navigation */}
            <div className="py-1.5 space-y-0.5">
              {/* Go to My Dashboard */}
              <Link
                href="/operate"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <LayoutDashboard size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Go to My Dashboard</span>
                  <span className="text-[10px] text-slate-400 font-medium">Portfolio &amp; Workspace</span>
                </div>
              </Link>

              {/* My Profile */}
              <Link
                href="/operate"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <User size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Profile &amp; KYC</span>
                  <span className="text-[10px] text-slate-400 font-medium">Account &amp; Organization</span>
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

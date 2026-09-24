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
  ShieldCheck
} from "lucide-react";

interface HeaderAuthButtonProps {
  className?: string;
  /** Context key passed to /login?context=... for contextual portal filtering */
  loginContext?: "marketplace" | "fm" | "operate" | "properties" | "rent-roll" | "";
}

export default function HeaderAuthButton({ className = "", loginContext = "" }: HeaderAuthButtonProps) {
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
      const name = sessionStorage.getItem("officex_user_name") || localStorage.getItem("officex_user_name") || "Member";
      const role = sessionStorage.getItem("officex_user_role") || localStorage.getItem("officex_user_role") || "Commercial Owner";
      const sub = sessionStorage.getItem("officex_subscription") === "active" || localStorage.getItem("officex_subscription") === "active";

      if (email) {
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
      localStorage.removeItem("officex_user");
      localStorage.removeItem("officex_subscription");
      localStorage.removeItem("officex_dashboard");
      localStorage.removeItem("officex_active_portal");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
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
    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all border border-slate-200 shadow-2xs cursor-pointer"
          title={`Signed in as ${userName}`}
        >
          <div className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[80px] truncate font-bold text-slate-800">{userName.split(" ")[0]}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{userName}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 size={10} />
                  Signed In
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{userRole}</p>
            </div>

            <div className="py-1">
              <Link
                href="/operate"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F8B7D] hover:bg-teal-50 transition-colors"
              >
                <LayoutDashboard size={14} className="text-[#0F8B7D]" />
                <span>Operate &amp; Manage Suite</span>
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F8B7D] hover:bg-teal-50 transition-colors"
              >
                <Building2 size={14} className="text-[#0F8B7D]" />
                <span>Office Marketplace (Free)</span>
              </Link>
              <Link
                href="/fm-marketplace"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F8B7D] hover:bg-teal-50 transition-colors"
              >
                <ShieldCheck size={14} className="text-[#0F8B7D]" />
                <span>FM Vendor Marketplace (Free)</span>
              </Link>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
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

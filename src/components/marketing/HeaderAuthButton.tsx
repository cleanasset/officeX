"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";

interface HeaderAuthButtonProps {
  className?: string;
}

export default function HeaderAuthButton({ className = "" }: HeaderAuthButtonProps) {
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
      const email = localStorage.getItem("officex_user_email");
      const authCookie = document.cookie.includes("officex_auth=1");
      const name = localStorage.getItem("officex_user_name") || "Member";
      const role = localStorage.getItem("officex_user_role") || "Commercial Owner";
      const sub = localStorage.getItem("officex_subscription") === "active" || document.cookie.includes("officex_subscription=active");

      if (email || authCookie) {
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

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_name");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_user");
      localStorage.removeItem("officex_subscription");
      localStorage.removeItem("officex_auth");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      setIsLoggedIn(false);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  const getLandingPath = (role: string) => {
    switch (role) {
      case "Tenant Admin":
        return "/audiences/occupiers";
      case "Facility Manager":
        return "/operate";
      case "Vendor / Contractor":
        return "/audiences/vendors";
      case "Investor / Asset Mgr":
        return "/intelligence";
      case "Commercial Owner":
      default:
        return "/manage";
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "Tenant Admin":
        return "/tenant";
      case "Facility Manager":
        return "/ops";
      case "Vendor / Contractor":
        return "/vendor";
      case "Investor / Asset Mgr":
        return "/leasing";
      case "Commercial Owner":
      default:
        return "/properties";
    }
  };

  if (!mounted) {
    return (
      <Link
        href="/login"
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors ${className}`}
      >
        Sign In
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors ${className}`}
      >
        Sign In
      </Link>
    );
  }

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
          {/* User Details */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">{userName}</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={10} />
                Signed In
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{userRole}</p>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Dashboard Access:</span>
              {isSubscribed ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              ) : (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldAlert size={11} />
                  Subscription Needed
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href={getLandingPath(userRole)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User size={15} className="text-[#0F8B7D]" />
              <span>My Stakeholder Landing Page</span>
            </Link>

            <Link
              href={getDashboardPath(userRole)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <LayoutDashboard size={15} className="text-emerald-600" />
              <span>Open Live Dashboard</span>
            </Link>
          </div>

          {/* Sign Out */}
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

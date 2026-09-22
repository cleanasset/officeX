"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, CheckCircle, ArrowRight, Shield, LogOut } from "lucide-react";

interface UserLandingBannerProps {
  roleName: string;
  dashboardHref: string;
  dashboardName: string;
  isFreePortal?: boolean;
}

export default function UserLandingBanner({
  roleName,
  dashboardHref,
  dashboardName,
  isFreePortal = false,
}: UserLandingBannerProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Member");

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");
      const name = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "Member";

      setIsLoggedIn(!!email);
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_name");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_subscription");
      localStorage.removeItem("officex_dashboard");
      localStorage.removeItem("officex_active_portal");
      localStorage.removeItem("officex_payment_id");
      localStorage.removeItem("officex_order_id");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      setIsLoggedIn(false);
      router.refresh();
    }
  };

  if (!isClient) return null;

  if (isLoggedIn) {
    return (
      <div className="w-full bg-gradient-to-r from-teal-50/70 via-white to-slate-50 border-b border-teal-100/80 px-4 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold text-xs shrink-0">
              <User size={13} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-900">Welcome, {userName}</span>
              <span className="text-[11px] font-medium text-slate-500 hidden md:inline">({roleName})</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle size={10} /> Signed In
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={dashboardHref}
              className="px-3.5 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch {dashboardName}</span>
              <ArrowRight size={12} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: Show clean subtle teaser
  return (
    <div className="w-full bg-slate-50/70 text-slate-700 border-b border-slate-100 px-4 sm:px-8 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Shield size={13} className="text-[#0F8B7D]" />
          <span>Tailored for <strong>{roleName}</strong>. Sign in to access your customized portal.</span>
        </div>
        <Link
          href={`/login?redirect=${encodeURIComponent(dashboardHref)}`}
          className="font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Sign In Here</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

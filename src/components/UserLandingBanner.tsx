"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, CheckCircle, ArrowRight, Sparkles, Shield, LogOut } from "lucide-react";

interface UserLandingBannerProps {
  roleName: string;
  dashboardHref: string;
  dashboardName: string;
}

export default function UserLandingBanner({
  roleName,
  dashboardHref,
  dashboardName
}: UserLandingBannerProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("officex_user_email");
      const name = localStorage.getItem("officex_user_name") || "Member";
      const sub = localStorage.getItem("officex_subscription");

      setUserEmail(email || "");
      setUserName(name);
      setIsLoggedIn(!!email);
      setIsSubscribed(sub === "active");
    }
  }, []);

  const handleActivateAndLaunch = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_subscription=active; path=/; max-age=2592000";
      setIsSubscribed(true);
      router.push(dashboardHref);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_name");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_subscription");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      setIsLoggedIn(false);
      setIsSubscribed(false);
      router.refresh();
    }
  };

  if (!isClient) return null;

  if (isLoggedIn) {
    return (
      <div className="w-full bg-[#071324] text-white border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30 shrink-0">
              <User size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Welcome, {userName}</span>
                <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {roleName}
                </span>
                {isSubscribed ? (
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                    <CheckCircle size={11} /> Plan Active • Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                    <Lock size={11} /> Plan Inactive • Dashboard Locked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isSubscribed
                  ? "Your operational workspace is unlocked and ready for live management."
                  : "You are signed in. Activate an operational subscription or start instant demo access to unlock your live dashboard."}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isSubscribed ? (
              <Link
                href={dashboardHref}
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Launch {dashboardName}</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleActivateAndLaunch}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Subscribe &amp; Enter Dashboard</span>
                </button>
                <Link
                  href="/pricing"
                  className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors"
                >
                  View Plans
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: Show login teaser
  return (
    <div className="w-full bg-slate-50 text-slate-700 border-b border-slate-200 px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Shield size={14} className="text-[#0F8B7D]" />
          <span>Already registered as a <strong>{roleName}</strong>? Sign in to view your tailored workspace.</span>
        </div>
        <Link
          href={`/login?redirect=${encodeURIComponent(dashboardHref)}`}
          className="font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Sign In Here</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

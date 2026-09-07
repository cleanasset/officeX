"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle, ArrowRight, Sparkles, LogOut } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallbackLandingPage?: string;
  portalName?: string;
}

export default function SubscriptionGate({
  children,
  fallbackLandingPage = "/audiences/owners",
  portalName = "Operational Workspace"
}: SubscriptionGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("officex_user_email");
      const name = localStorage.getItem("officex_user_name") || "Member";
      const role = localStorage.getItem("officex_user_role") || "Property Owner";
      const sub = localStorage.getItem("officex_subscription");

      setUserEmail(email || "");
      setUserName(name);
      setUserRole(role);

      if (!email) {
        setIsLoggedIn(false);
        setIsSubscribed(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsLoggedIn(true);
        // Only grant access if subscription is explicitly active
        setIsSubscribed(sub === "active");
      }
      setIsChecking(false);
    }
  }, [pathname, router]);

  const handleActivateInstantSubscription = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_subscription=active; path=/; max-age=2592000";
      setIsSubscribed(true);
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
      router.push("/login");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Verifying workspace permissions &amp; subscription...</p>
        </div>
      </div>
    );
  }

  // Paywall Modal if logged in but not subscribed
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F8B7D] via-teal-400 to-[#071324]" />

          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Image src="/logo-removebg-preview.png" alt="OfficeX" width={34} height={34} className="object-contain" />
              <div>
                <h2 className="text-sm font-black text-slate-900">OfficeX {portalName}</h2>
                <p className="text-[11px] text-slate-500 font-semibold">Institutional Commercial Operating Suite</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-100 text-[#0F8B7D] flex items-center justify-center mb-4 shadow-xs">
              <Lock size={26} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              SUBSCRIPTION REQUIRED
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 tracking-tight">
              Activate Subscription to Access Live Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium max-w-md mx-auto leading-relaxed">
              Hello <strong className="text-slate-900">{userName}</strong> ({userEmail}). Your account is verified, but access to the operational dashboard requires an active portfolio plan.
            </p>
          </div>

          {/* Value props */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Included in Your Operational Plan:
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>Full access to live property registry, rent rolls &amp; CAM billing</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>52-week preventive maintenance dispatch &amp; QR asset passports</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>Razorpay nodal escrow milestone protection for all work orders</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleActivateInstantSubscription}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Activate Subscription &amp; Unlock Dashboard Now</span>
            </button>

            <Link
              href="/pricing"
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs text-center transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore All Pricing Plans &amp; Tiers</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href={fallbackLandingPage}
              className="text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1 transition-colors"
            >
              ← Return to your {userRole || "Persona"} Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render children normally if logged in AND subscribed
  return <>{children}</>;
}

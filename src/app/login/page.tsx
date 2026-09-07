"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight, ShieldCheck, CheckCircle2, Building2, Wrench, Shield, Briefcase, Key } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const demoPortals = [
    {
      id: "fm-marketplace",
      label: "FM Marketplace Portal",
      desc: "Source verified vendors, raise RFQs, evaluate quotes & escrow",
      email: "procurement@officex.in",
      role: "Procurement Manager",
      dashboard: "/app/marketplace",
      badge: "FM Marketplace",
      badgeColor: "bg-teal-50 text-[#0F8B7D] border-teal-200"
    },
    {
      id: "vendor",
      label: "FM Vendor Workspace",
      desc: "Contractor bidding, matched RFQs, work orders & payouts",
      email: "vendor@officex.in",
      role: "FM Vendor",
      dashboard: "/vendor",
      badge: "Vendor Portal",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-200"
    },
    {
      id: "ops",
      label: "Facility Management (Ops) Desk",
      desc: "52-week PPM calendars, maintenance tickets & compliance",
      email: "facilitymanager@officex.in",
      role: "Facility Manager",
      dashboard: "/ops",
      badge: "Ops Workspace",
      badgeColor: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      id: "owner",
      label: "Property Owner (Landlord) Portal",
      desc: "Commercial asset portfolio, leases, rent roll & NOI yields",
      email: "owner@officex.in",
      role: "Property Owner",
      dashboard: "/properties",
      badge: "Landlord Portal",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      id: "tenant",
      label: "Corporate Occupier (Tenant) Portal",
      desc: "Digital workplace access, ticket logging & rent invoices",
      email: "tenant@officex.in",
      role: "Corporate Occupier",
      dashboard: "/tenant",
      badge: "Tenant Portal",
      badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
      id: "broker",
      label: "Leasing Broker Workspace",
      desc: "Commercial deals pipeline, client site visits & listings",
      email: "broker@officex.in",
      role: "Leasing Broker",
      dashboard: "/leasing",
      badge: "Broker CRM",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200"
    },
    {
      id: "admin",
      label: "Platform Super Admin",
      desc: "System-wide user IAM, master registries & compliance audits",
      email: "admin@officex.in",
      role: "Super Admin",
      dashboard: "/admin",
      badge: "Super Admin",
      badgeColor: "bg-purple-50 text-purple-600 border-purple-200"
    }
  ];

  const handlePortalLogin = (portal: typeof demoPortals[0]) => {
    setIsLoading(true);
    setError("");
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_email", portal.email);
      localStorage.setItem("officex_user_name", portal.label);
      localStorage.setItem("officex_user_role", portal.role);
      localStorage.setItem("officex_dashboard", portal.dashboard);
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_auth=1; path=/; max-age=2592000";
    }

    // Redirect to the intended redirectUrl if specified, or directly to their operational portal
    const destination = redirectUrl || portal.dashboard;
    router.push(destination);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    const match = demoPortals.find(d => d.email.toLowerCase() === email.toLowerCase());
    const role = match ? match.role : "Property Owner";
    const dash = match ? match.dashboard : "/properties";

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_email", email.trim().toLowerCase());
      localStorage.setItem("officex_user_name", match ? match.label : email.split("@")[0]);
      localStorage.setItem("officex_user_role", role);
      localStorage.setItem("officex_dashboard", dash);
      localStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_auth=1; path=/; max-age=2592000";
    }

    const destination = redirectUrl || dash;
    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 sm:p-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Top Header Panel */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col items-center gap-3 bg-slate-50/70">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={40} height={40} className="object-contain" priority />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={130} height={28} className="object-contain" priority />
          </Link>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Sign in to your OfficeX Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select your role below for instant sandbox access or enter your corporate credentials
            </p>
          </div>
          {redirectUrl && (
            <div className="text-[11px] font-bold text-[#0F8B7D] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Redirecting to: {redirectUrl}
            </div>
          )}
        </div>

        {/* 1-Click Direct Portal Access */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              1-Click Direct Portal Access
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              No password required
            </span>
          </div>

          <div className="space-y-2">
            {demoPortals.map((portal) => (
              <button
                key={portal.id}
                onClick={() => handlePortalLogin(portal)}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#0F8B7D] hover:bg-teal-50/20 transition-all flex items-center justify-between text-left group cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors">
                      {portal.label}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${portal.badgeColor}`}>
                      {portal.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                    {portal.desc}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#0F8B7D] text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all">
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email Login Form */}
        <div className="p-6 sm:p-8 bg-slate-50/50">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3">
            Or Sign In With Email
          </span>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {error && (
              <div id="login-error" role="alert" className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-semibold text-xs leading-normal">
                ⚠ {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  placeholder="e.g. procurement@officex.in" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-slate-900 font-medium"
                  required
                />
                <User size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  autoComplete="current-password"
                  placeholder="Enter password (e.g. 123456)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-slate-900 font-medium"
                  required
                />
                <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <button 
              id="login-submit"
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>{isLoading ? "Signing in..." : "Enter Workspace"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-[#0F8B7D] font-medium">
              ← Back to Homepage
            </Link>
            <Link href="/fm-marketplace" className="text-[#0F8B7D] font-bold hover:underline">
              Go to FM Marketplace →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500">
        Loading portals...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

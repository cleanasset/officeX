"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { email: "owner@officex.in", label: "Property Owner (Landlord)", redirect: "/properties" },
    { email: "broker@officex.in", label: "Leasing Broker", redirect: "/leasing" },
    { email: "facilitymanager@officex.in", label: "Facility Manager (Ops)", redirect: "/ops" },
    { email: "tenant@officex.in", label: "Tenant Admin (Occupier)", redirect: "/tenant" },
    { email: "vendor@officex.in", label: "FM Vendor (Partner)", redirect: "/vendor" },
    { email: "admin@officex.in", label: "Super Admin", redirect: "/admin" }
  ];

  const handleDemoLogin = (acc: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setError("");
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_email", acc.email);
      localStorage.setItem("officex_user_name", acc.label);
    }
    router.push(acc.redirect);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_email", email.trim().toLowerCase());
    }

    // Match redirect route
    const match = demoAccounts.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (match) {
      router.push(match.redirect);
    } else {
      // Default to Property Owner if custom new user email
      router.push("/properties");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4 sm:p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
        
        {/* Top Header Panel */}
        <div className="p-8 border-b border-gray-100 flex flex-col items-center gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={36} height={36} className="object-contain" priority />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={115} height={23} className="object-contain" priority />
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider text-center">
            Sign in to your operating workspace
          </p>
        </div>

        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
          {error && (
            <div id="login-error" role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-500 font-semibold text-xs leading-normal">
              ⚠ {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <input 
                id="email"
                name="email"
                type="email" 
                autoComplete="email"
                placeholder="e.g. owner@officex.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                required
              />
              <User size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type="password" 
                autoComplete="current-password"
                placeholder="Enter password (e.g. 123456)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                required
              />
              <Lock size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <button 
            id="login-submit"
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <span>{isLoading ? "Signing in..." : "Continue to Workspace"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Link to Signup */}
        <div className="px-8 pb-6 text-center text-xs text-gray-500 font-medium">
          <span>New to OFFICEX?</span>
          <Link href="/signup" className="ml-1.5 font-bold text-[#0F8B7D] hover:underline">
            Create an account →
          </Link>
        </div>

        {/* Quick Demo Access Options */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Quick Sandbox Access (Password: 123456)
          </span>
          <div className="flex flex-col gap-1.5">
            {demoAccounts.map((acc, idx) => (
              <button 
                key={idx}
                onClick={() => handleDemoLogin(acc)}
                disabled={isLoading}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0F8B7D] hover:bg-teal-50/30 transition-all flex justify-between items-center text-xs text-left font-medium cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="text-gray-900 font-bold">{acc.label}</span>
                  <span className="text-gray-400 block text-[10px] font-mono">{acc.email}</span>
                </div>
                <ArrowRight size={13} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

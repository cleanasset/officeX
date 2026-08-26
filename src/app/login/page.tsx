"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { email: "admin@officex.in", label: "Super Admin", redirect: "/admin" },
    { email: "propertymanager@officex.in", label: "Property Manager", redirect: "/properties" },
    { email: "broker@officex.in", label: "Leasing Broker", redirect: "/leasing" },
    { email: "vendor@officex.in", label: "FM Vendor", redirect: "/vendor" },
    { email: "tenant@officex.in", label: "Tenant Admin", redirect: "/tenant" },
    { email: "facilitymanager@officex.in", label: "Facility Manager", redirect: "/ops" }
  ];

  const handleDemoLogin = (acc: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setError("");
    
    // Simulate setting session
    setTimeout(() => {
      router.push(acc.redirect);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== "123456") {
      setError("Incorrect password. Use '123456' for testing.");
      return;
    }

    // Match redirect route
    const match = demoAccounts.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setIsLoading(true);
      setError("");
      setTimeout(() => {
        router.push(match.redirect);
      }, 800);
    } else {
      setError("Account not found. Use one of the test emails below.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        
        {/* Top Header Panel */}
        <div className="p-8 border-b border-gray-100 flex flex-col items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={34} height={34} className="object-contain" />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={110} height={22} className="object-contain" />
          </div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-center">
            Sign in to your operating workspace
          </p>
        </div>

        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-500 font-semibold text-xs leading-normal">
              ⚠ {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="e.g. propertymanager@officex.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white transition-colors"
              />
              <User size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Password (123456)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white transition-colors"
              />
              <Lock size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary-teal hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : "Continue"}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Access Options */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Quick Sandbox Access (Password: 123456)
          </span>
          <div className="flex flex-col gap-2">
            {demoAccounts.map((acc, idx) => (
              <button 
                key={idx}
                onClick={() => handleDemoLogin(acc)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-primary-teal hover:bg-teal-50/20 transition-all flex justify-between items-center text-xs text-left font-medium"
              >
                <div>
                  <span className="text-gray-900 font-bold">{acc.label}</span>
                  <span className="text-gray-400 block text-[10px] mt-0.5">{acc.email}</span>
                </div>
                <ArrowRight size={14} className="text-gray-400 hover:text-primary-teal" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Handshake, 
  Settings, 
  Users, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase,
  CheckCircle 
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("property_owner");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: "property_owner",
      title: "Property Owner (Landlord)",
      desc: "Own or manage commercial buildings, list vacant floors, track rent roll.",
      icon: Building,
      redirect: "/properties"
    },
    {
      id: "leasing_broker",
      title: "Leasing Broker",
      desc: "Commercial real estate agent, find office spaces, close leasing deals.",
      icon: Handshake,
      redirect: "/leasing"
    },
    {
      id: "facility_manager",
      title: "Facility Manager (Ops)",
      desc: "Manage building operations, maintenance PPMs, statutory compliance.",
      icon: Settings,
      redirect: "/ops"
    },
    {
      id: "tenant_admin",
      title: "Corporate Tenant (Occupier)",
      desc: "Rent office space, book meeting rooms, issue employee & visitor QR passes.",
      icon: Users,
      redirect: "/tenant"
    },
    {
      id: "service_vendor",
      title: "Service Vendor (FM Partner)",
      desc: "Provide HVAC, MEP, cleaning, or security services; bid on RFQs & receive escrow.",
      icon: Truck,
      redirect: "/vendor"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !companyName || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    const chosenRole = roles.find(r => r.id === selectedRole) || roles[0];

    // Map signup roles to database enum roles
    const dbRoleMap: Record<string, string> = {
      property_owner: "property_manager",
      leasing_broker: "broker",
      facility_manager: "facility_manager",
      tenant_admin: "tenant_admin",
      service_vendor: "vendor_admin"
    };

    try {
      // Create user in real Supabase PostgreSQL database
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName,
          role: dbRoleMap[selectedRole] || "tenant_admin",
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store session in localStorage for client-side use
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_user_id", data.user?.id || "");
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_name", fullName);
        localStorage.setItem("officex_user_company", companyName);
        localStorage.setItem("officex_user_role", selectedRole);
        localStorage.setItem("officex_mode", "clean_test");

        // Initialize empty arrays for the brand-new account
        localStorage.setItem("officex_user_properties", JSON.stringify([]));
        localStorage.setItem("officex_user_partnerships", JSON.stringify([]));
      }

      // Redirect to the chosen portal
      setTimeout(() => {
        router.push(chosenRole.redirect);
      }, 600);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4 sm:p-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
        
        {/* Top Header Panel */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col items-center gap-3 bg-gray-50/60 text-center">
          <div className="flex items-center gap-3">
            <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={36} height={36} className="object-contain" priority />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={115} height={23} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Create Your Account</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Join the unified operating platform for commercial real estate & workplace management.
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-6">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-500 font-semibold text-xs leading-normal">
              ⚠ {error}
            </div>
          )}

          {/* 1. Account Role Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              1. Choose Your Role / Workspace Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/70 border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-xs"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-[#0F8B7D] text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-xs font-bold ${isSelected ? "text-[#0F8B7D]" : "text-gray-900"}`}>
                        {r.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5 line-clamp-2">
                        {r.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal & Company Credentials */}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              2. Your Details & Company Info *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Mehta"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                    required
                  />
                  <User size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Company / Entity Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Godrej Properties / Acme Corp"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                    required
                  />
                  <Briefcase size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Work Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@godrejproperties.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98201 12345"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                  />
                  <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Create Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a secure password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white"
                    required
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLoading ? "Creating Account..." : "Create Account & Enter Workspace"}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer: Link to Login */}
        <div className="p-6 bg-gray-50/70 border-t border-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
          <span>Already have an account?</span>
          <Link href="/login" className="ml-1.5 font-bold text-[#0F8B7D] hover:underline">
            Sign in here →
          </Link>
        </div>

      </div>
    </div>
  );
}

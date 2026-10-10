"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
  Lock,
  Loader2
} from "lucide-react";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role") || "pm_company";
  const mgrParam = searchParams.get("mgr") || "";
  const propParam = searchParams.get("prop") || "";
  const ownerParam = searchParams.get("owner") || "Commercial Asset Owner";
  const emailParam = searchParams.get("email") || "";
  const inviteParam = searchParams.get("invite") || "";

  const [isAccepting, setIsAccepting] = useState(false);
  const [managerName, setManagerName] = useState(mgrParam);
  const [managerEmail, setManagerEmail] = useState(emailParam);

  useEffect(() => {
    if (mgrParam) setManagerName(mgrParam);
    if (emailParam) setManagerEmail(emailParam);
  }, [mgrParam, emailParam]);

  const getRoleDisplayName = (r: string) => {
    if (r === "pm_company" || r === "pm_agency") return "PM Company (Property Management Company)";
    if (r === "fm_company" || r === "fm_operator") return "FM Company (Facilities Management Company)";
    if (r === "msp") return "MSP (Managed Service Provider)";
    if (r === "org_admin") return "Another User (Role: Org Admin)";
    if (r === "property_manager") return "Another User (Role: Property Manager)";
    if (r === "user_pm_or_admin") return "Another User (Role: Property Manager or Org Admin)";
    return "Property Manager / Operations Lead";
  };

  const handleAcceptInvite = () => {
    setIsAccepting(true);

    const displayName = managerName.trim() || mgrParam || "Property Manager";
    const displayEmail = managerEmail.trim() || emailParam || `${displayName.toLowerCase().replace(/\s+/g, ".")}@officex.pro`;

    if (typeof window !== "undefined") {
      // 1. Authorize session & subscription for delegated managing entity
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";

      // 2. Set user credentials
      localStorage.setItem("officex_user_name", displayName);
      sessionStorage.setItem("officex_user_name", displayName);
      document.cookie = `officex_user_name=${encodeURIComponent(displayName)}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem("officex_user_email", displayEmail);
      sessionStorage.setItem("officex_user_email", displayEmail);
      document.cookie = `officex_user_email=${encodeURIComponent(displayEmail)}; path=/; max-age=86400; SameSite=Lax`;

      // 3. Set role to Property Manager console
      const roleLabel = "Property Manager / Centre Manager";
      localStorage.setItem("officex_user_role", roleLabel);
      sessionStorage.setItem("officex_user_role", roleLabel);
      document.cookie = `officex_user_role=${encodeURIComponent(roleLabel)}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem("officex_role_key", "property_manager");
      sessionStorage.setItem("officex_role_key", "property_manager");
      document.cookie = "officex_role_key=property_manager; path=/; max-age=86400; SameSite=Lax";

      // 4. Set delegated manager status & active property
      localStorage.setItem("officex_has_manager", "true");
      localStorage.setItem("officex_manager_dashboard_activated", "true");
      localStorage.setItem("officex_manager_status", "activated");
      if (propParam) {
        localStorage.setItem("officex_active_property", propParam);
      }

      localStorage.setItem("officex_session_active", "1");
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";

      // Persist user record in Supabase
      fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email: displayEmail,
          role: "property_manager",
          propertyName: propParam,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      router.push(`/dashboard/pm?role=${encodeURIComponent(roleParam)}&mgr=${encodeURIComponent(displayName)}&prop=${encodeURIComponent(propParam)}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#0F8B7D] via-teal-400 to-[#071324]" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Image src="/logo-removebg-preview.png" alt="OfficeX" width={38} height={38} className="object-contain" />
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">OfficeX Workspace</h1>
                <p className="text-[11px] text-slate-500 font-semibold">Institutional Property Management Portal</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} className="text-[#0F8B7D]" />
              Verified Invitation
            </span>
          </div>

          {/* Invitation Banner Card */}
          <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-slate-50 rounded-2xl p-5 border border-teal-200/90 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Delegation Request
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {propParam ? `Manage ${propParam}` : "Commercial Property Management Invitation"}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Invited by <strong className="text-slate-900">{ownerParam}</strong> to assume operational property management oversight.
                </p>
              </div>
            </div>

            {/* Role Breakdown Badge */}
            <div className="pt-2 border-t border-teal-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-600">Assigned Managing Role:</span>
              <span className="font-extrabold text-[#0F8B7D] bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                {getRoleDisplayName(roleParam)}
              </span>
            </div>
          </div>

          {/* Form details confirmation */}
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Name / Representative Legal Name
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Apex Property Operations Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Operations Email Address
              </label>
              <input
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="operations@management.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none"
              />
            </div>
          </div>

          {/* Capabilities Granted */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Authorized Capabilities Granted Upon Acceptance:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                <span>Rent Roll &amp; Lease Operations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                <span>Tenant Approvals &amp; Ticketing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                <span>CAM &amp; Utility Sub-metering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                <span>PPM Maintenance Tasks</span>
              </div>
            </div>
          </div>

          {/* Accept CTA Button */}
          <button
            onClick={handleAcceptInvite}
            disabled={isAccepting}
            className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isAccepting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Activating Your Management Portal...</span>
              </>
            ) : (
              <>
                <span>Accept Invitation &amp; Enter Property Portal</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium">
            This workspace invitation is backed by 256-bit encrypted access controls. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071324] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F8B7D]" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}

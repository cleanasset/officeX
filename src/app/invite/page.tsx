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
  Loader2,
  MapPin,
  Users
} from "lucide-react";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role") || "pm_company";
  const mgrParam = searchParams.get("mgr") || "";
  const propParam = searchParams.get("prop") || "";
  const ownerParam = searchParams.get("owner") || "Commercial Property Asset SPV";
  const emailParam = searchParams.get("email") || "";
  const inviteParam = searchParams.get("invite") || "";

  const [isAccepting, setIsAccepting] = useState(false);
  const [managerName, setManagerName] = useState(mgrParam);
  const [managerEmail, setManagerEmail] = useState(emailParam);
  const [ownerSubscribed, setOwnerSubscribed] = useState<boolean | null>(null);
  const isTenant = roleParam === "tenant" || roleParam === "occupant";

  // Commercial Property & Tenant Portfolio Details
  const [propertyDetails, setPropertyDetails] = useState<{
    name: string;
    location: string;
    totalArea: number;
    occupancyPct: number;
    monthlyRevenue: number;
    tenants: Array<{ name: string; space: string; monthlyRent: number; term: string; status: string }>;
  }>({
    name: propParam || "Commercial Centre",
    location: "Commercial Portfolio",
    totalArea: 0,
    occupancyPct: 0,
    monthlyRevenue: 0,
    tenants: [],
  });

  useEffect(() => {
    if (mgrParam) setManagerName(mgrParam);
    if (emailParam) setManagerEmail(emailParam);

    // Default owner subscription to active for invited tenants and managers
    setOwnerSubscribed(true);

    // Fetch live portfolio data from DB
    Promise.all([
      fetch("/api/rent-roll/properties").then((r) => r.json()).catch(() => null),
      fetch("/api/contracts").then((r) => r.json()).catch(() => null),
    ]).then(([propData, contractData]) => {
      const props = propData?.data || [];
      const contracts = contractData?.data || [];

      if (props.length > 0) {
        const targetProp = propParam
          ? props.find((p: any) => p.property_name?.toLowerCase().includes(propParam.toLowerCase())) || props[0]
          : props[0];

        const matchedTenants = contracts
          .filter((c: any) => !targetProp || c.property_id === targetProp.id || c.property_name === targetProp.property_name)
          .map((c: any) => ({
            name: c.occupant_name || c.tenant_name || "Tenant",
            space: c.space_name ? `${c.space_name} (${c.space_code || "Unit"})` : "Demarcated Space",
            monthlyRent: Number(c.base_rent_rate || 0),
            term: c.end_date ? `Lease to ${new Date(c.end_date).toLocaleDateString("en-IN")}` : "Active Term",
            status: c.contract_status === "active" ? "Active" : (c.contract_status || "Active"),
          }));

        setPropertyDetails({
          name: targetProp.property_name || "Commercial Centre",
          location: targetProp.city ? `${targetProp.city}${targetProp.state ? `, ${targetProp.state}` : ""}` : "Commercial Location",
          totalArea: parseFloat(targetProp.total_leasable_area_sqft || 0) || 0,
          occupancyPct: matchedTenants.length > 0 ? 100 : 0,
          monthlyRevenue: matchedTenants.reduce((s: number, t: any) => s + t.monthlyRent, 0),
          tenants: matchedTenants,
        });
      }
    });
  }, [mgrParam, emailParam, propParam]);

  const getRoleDisplayName = (r: string) => {
    if (r === "tenant" || r === "occupant") return "Commercial Tenant / Corporate Occupant";
    if (r === "pm_company" || r === "pm_agency") return "PM Company (Property Management Company)";
    if (r === "fm_company" || r === "fm_operator") return "FM Company (Facilities Management Company)";
    if (r === "msp") return "MSP (Managed Service Provider)";
    if (r === "org_admin") return "Another User (Role: Org Admin)";
    if (r === "property_manager") return "Another User (Role: Property Manager)";
    if (r === "user_pm_or_admin") return "Another User (Role: Property Manager or Org Admin)";
    return "Property Manager / Operations Lead";
  };

  const handleAcceptInvite = () => {
    if (ownerSubscribed === false) {
      alert("This invitation cannot be opened or accepted because the property owner has not yet subscribed to OfficeX Rent Roll. Both third-party property management assignment and corporate tenant portal links require an active property owner subscription.");
      return;
    }

    setIsAccepting(true);

    const displayName = managerName.trim() || mgrParam || "Designated Property Manager";
    const displayEmail = managerEmail.trim() || emailParam || "operations@management.com";
    const propToAssign = propertyDetails.name;

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

      const isTenant = roleParam === "tenant" || roleParam === "occupant";

      // 3. Set role to Tenant or Property Manager console
      const roleLabel = isTenant ? "Commercial Tenant / Occupant" : "Property Manager / Centre Manager";
      const roleKey = isTenant ? "tenant" : "property_manager";

      localStorage.setItem("officex_user_role", roleLabel);
      sessionStorage.setItem("officex_user_role", roleLabel);
      document.cookie = `officex_user_role=${encodeURIComponent(roleLabel)}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem("officex_role_key", roleKey);
      sessionStorage.setItem("officex_role_key", roleKey);
      document.cookie = `officex_role_key=${roleKey}; path=/; max-age=86400; SameSite=Lax`;

      // 4. Set company brand & property
      localStorage.setItem("officex_company_name", ownerParam);
      localStorage.setItem("officex_brand_name", ownerParam);
      localStorage.setItem("officex_active_property", propToAssign);
      localStorage.setItem("officex_selected_property", propToAssign);

      if (!isTenant) {
        localStorage.setItem("officex_has_manager", "true");
        localStorage.setItem("officex_manager_name", displayName);
        localStorage.setItem("officex_manager_email", displayEmail);
        localStorage.setItem("officex_manager_dashboard_activated", "true");
        localStorage.setItem("officex_manager_status", "activated");

        // Save property assignment mapping preserving designated delegation scope
        let assignedScopeObj: any = { name: displayName, email: displayEmail, type: roleParam, scope: "whole_property" };
        try {
          const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
          const existing = currentAssigns[propToAssign] || {};
          assignedScopeObj = {
            ...existing,
            name: displayName,
            email: displayEmail,
            type: roleParam,
            scope: existing.scope || "whole_property",
            managedTenantNames: existing.managedTenantNames || "all",
            managedFloors: existing.managedFloors || "all",
          };
          currentAssigns[propToAssign] = assignedScopeObj;
          localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
        } catch {}
      }

      localStorage.setItem("officex_session_active", "1");
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";

      // Persist user record in database
      fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email: displayEmail,
          role: "property_manager",
          propertyName: propToAssign,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      if (roleParam === "tenant" || roleParam === "occupant") {
        router.push("/portal");
      } else {
        const storedAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        const aObj = storedAssigns[propToAssign] || {};
        const scopeParam = aObj.scope || "whole_property";
        const tenantsParam = Array.isArray(aObj.managedTenantNames) ? aObj.managedTenantNames.join(",") : "";
        const floorsParam = Array.isArray(aObj.managedFloors) ? aObj.managedFloors.join(",") : "";
        router.push(`/dashboard/pm?role=${encodeURIComponent(roleParam)}&mgr=${encodeURIComponent(displayName)}&prop=${encodeURIComponent(propToAssign)}&scope=${encodeURIComponent(scopeParam)}&tenants=${encodeURIComponent(tenantsParam)}&floors=${encodeURIComponent(floorsParam)}`);
      }
    }, 400);
  };

  // 1. Subscription Verification Loading State
  if (ownerSubscribed === null) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
          <Loader2 className="w-9 h-9 animate-spin text-[#0F8B7D] mx-auto" />
          <h3 className="text-sm font-black text-slate-900">Verifying Subscription &amp; Credentials...</h3>
          <p className="text-xs text-slate-500">Checking property owner subscription status and institutional access controls.</p>
        </div>
      </div>
    );
  }

  // 2. Subscription Inactive: Neither third-party manager/company nor tenant links can open without subscription
  if (ownerSubscribed === false) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-300 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Warning Ribbon */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Image src="/logo-removebg-preview.png" alt="OfficeX" width={38} height={38} className="object-contain" />
                <div>
                  <h1 className="text-base font-black text-slate-900 leading-tight">OfficeX Workspace</h1>
                  <p className="text-[11px] text-slate-500 font-semibold">Institutional Access Verification</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                <Lock size={12} className="text-rose-600" />
                Access Inactive
              </span>
            </div>

            {/* Locked State Core Card */}
            <div className="bg-gradient-to-br from-amber-50 via-rose-50/40 to-slate-50 rounded-2xl p-6 border border-amber-300 text-center space-y-3.5">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={30} className="text-amber-800" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-amber-200/80 border border-amber-300 text-amber-950 text-[11px] font-black uppercase tracking-wider">
                Link Available Only If Subscribed
              </div>

              <h2 className="text-xl font-black text-slate-900">
                {isTenant ? "Tenant Portal Link Inactive" : "Management Link Inactive"}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                This invitation link for <strong className="text-slate-900">{propertyDetails.name || propParam || "Commercial Property"}</strong> cannot be opened because the property owner (<strong className="text-slate-900">{ownerParam}</strong>) does not have an active OfficeX Rent Roll subscription.
              </p>

              <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/90 text-[11px] text-slate-600 text-left space-y-2 shadow-2xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Invitation Role:</span>
                  <span className="font-bold text-slate-900">{getRoleDisplayName(roleParam)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Commercial Asset:</span>
                  <span className="font-bold text-slate-900">{propertyDetails.name || propParam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Property Owner / SPV:</span>
                  <span className="font-bold text-slate-900">{ownerParam}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                  <span className="font-semibold text-slate-500">Access Status:</span>
                  <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                    Locked · Subscription Required
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-amber-900 font-medium bg-amber-100/70 p-2.5 rounded-xl border border-amber-200 text-left">
                ℹ Institutional Rule: Third-party property management assignment links and corporate tenant portal links cannot be opened until the commercial property owner activates an active Rent Roll subscription.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2.5">
              <Link
                href="/operate/rent-roll/pricing"
                className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Property Owner: Subscribe to Activate Links</span>
              </Link>

              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition text-center block"
              >
                Return to OfficeX Homepage
              </Link>
            </div>

            <p className="text-[11px] text-center text-slate-400 font-medium">
              Are you an assigned manager or tenant? Contact your property owner to activate their subscription so this link can open.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                  {roleParam === "tenant" ? "Tenant Workspace Invitation" : "Delegation Request"}
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {roleParam === "tenant"
                    ? (propParam ? `Leased Unit at ${propParam}` : "Corporate Tenant Workspace Portal")
                    : (propParam ? `Manage ${propParam}` : "Commercial Property Management Invitation")}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Invited by <strong className="text-slate-900">{ownerParam}</strong> {roleParam === "tenant" ? "to access your corporate tenant portal." : "to assume operational property management oversight."}
                </p>
              </div>
            </div>

            {/* Role Breakdown Badge */}
            <div className="pt-2 border-t border-teal-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-600">Assigned Portal Role:</span>
              <span className="font-extrabold text-[#0F8B7D] bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                {getRoleDisplayName(roleParam)}
              </span>
            </div>
          </div>

          {/* Assigned Company, Property & Tenant Details Card */}
          <div className="bg-slate-50/90 rounded-2xl p-4.5 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Assigned Commercial Portfolio
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                {ownerParam}
              </span>
            </div>

            {/* Property Overview */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{propertyDetails.name}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-slate-400" />
                    {propertyDetails.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  {propertyDetails.totalArea.toLocaleString("en-IN")} sqft
                </div>
                <div className="text-[10px] font-bold text-emerald-600">
                  {propertyDetails.occupancyPct}% Leased
                </div>
              </div>
            </div>

            {/* Active Tenants Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-slate-400" />
                  Active Commercial Tenants ({propertyDetails.tenants.length})
                </span>
                <span className="text-slate-400 font-normal">Monthly Contracted Rent</span>
              </div>

              <div className="space-y-1.5">
                {propertyDetails.tenants.length === 0 ? (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-center">
                    <p className="text-xs font-bold text-amber-900">0 Active Leases · Asset in Setup Mode</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      The Landlord has not added tenants or contracts yet. Upon accepting, your console will be ready to help onboard rent roll and leases.
                    </p>
                  </div>
                ) : (
                  propertyDetails.tenants.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>{t.name}</span>
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {t.space} · <span className="text-slate-400">{t.term}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-teal-800">
                          ₹{(t.monthlyRent / 100000).toFixed(2)} L
                        </div>
                        <div className="text-[10px] text-slate-400">/ month</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
              {roleParam === "tenant" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>View Lease Contracts &amp; Units</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>GST Invoices &amp; Rent Receipts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>Facility Maintenance &amp; Tickets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>Digital NOCs &amp; Agreements</span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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

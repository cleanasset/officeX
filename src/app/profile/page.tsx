"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Building,
  KeyRound,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  Wrench,
  Users,
  FileCheck2,
  Headphones,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  Calendar,
  Check,
  Activity,
  FileText,
  BadgeCheck,
  RefreshCw,
  QrCode,
  Building2
} from "lucide-react";
import ServiceNavbar from "@/components/ServiceNavbar";
import { getClientUserEmail, clearAuthCookie } from "@/lib/auth-storage";
import { performClientLogout } from "@/lib/auth-client";

interface ModuleCardProps {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  badgeColor: string;
  planName: string;
  isSubscribed: boolean;
  daysRemaining?: number;
  capacityText?: string;
  features: string[];
  launchUrl: string;
  upgradeUrl: string;
}

export default function UserProfileAndSubscriptionsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "available">("all");

  // User Identity State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Member");
  const [userRole, setUserRole] = useState("Tenant Occupant");
  const [orgName, setOrgName] = useState("OfficeX Enterprise");

  // Multi-Module Subscription Data
  const [subStatus, setSubStatus] = useState<any>(null);

  // Password Update Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSubscription = (email: string) => {
    if (!email) {
      setLoading(false);
      return;
    }
    fetch("/api/subscription/status", {
      headers: { "x-user-email": email }
    })
      .then((r) => r.json())
      .then((data) => {
        setSubStatus(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const email = (
        getClientUserEmail() ||
        localStorage.getItem("officex_user_email") ||
        sessionStorage.getItem("officex_user_email") ||
        ""
      ).trim().toLowerCase();

      setUserEmail(email);

      const name = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      if (name && /[a-zA-Z]/.test(name)) {
        setUserName(name);
      } else if (email) {
        setUserName(email.split("@")[0]);
      }

      const role = localStorage.getItem("officex_user_role") || localStorage.getItem("officex_role");
      if (role) {
        setUserRole(
          role === "super_admin" ? "Super Administrator" :
          role === "owner" ? "Property Owner & Asset Manager" :
          role === "property_manager" ? "Property Manager" :
          role === "facility_manager" ? "Facility & Maintenance Lead" :
          role === "tenant_admin" || role === "tenant" ? "Tenant Occupant" :
          role
        );
      }

      const org = localStorage.getItem("officex_active_org") || localStorage.getItem("officex_org_name");
      if (org) setOrgName(org);

      fetchSubscription(email);
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordToast(null);

    if (!currentPassword) {
      setPasswordToast({ type: "error", text: "Please enter your current password to authorize this update." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordToast({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordToast({ type: "error", text: "New password must be different from your current password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordToast({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordToast({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch (err: any) {
      setPasswordToast({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await performClientLogout("/");
  };

  if (!mounted) return null;

  // Role resolution
  const roleLower = (userRole || "").toLowerCase();
  const isTenant = roleLower.includes("tenant");
  const isSuperAdmin = userEmail === "admin@gmail.com" || userEmail === "medistationlifecare@gmail.com" || subStatus?.isAdmin;
  const isGlobalSubscribed = subStatus?.subscribed || isSuperAdmin;
  const daysLeft = subStatus?.days_remaining ?? (isGlobalSubscribed ? 365 : 0);
  const activePlanName = isTenant
    ? "Corporate Occupant Account"
    : isSuperAdmin
    ? "REIT Mega-Portfolio Enterprise"
    : subStatus?.plan_name || "Free Community Tier";
  const licensedSqft = subStatus?.subscribed_sqft
    ? `${Number(subStatus.subscribed_sqft).toLocaleString("en-IN")} Sq.Ft`
    : "Standard Quota";

  // Role-Aware Module Definitions:
  // 1. Tenants only see modules relevant to Occupants (Invoices, Guest Passes, Helpdesk)
  // 2. Landlords/Admins see Commercial Asset Management & Building Operations modules
  const tenantModules: ModuleCardProps[] = [
    {
      id: "portal",
      name: "Corporate Tenant & Occupant Portal",
      category: "Occupant Workspace",
      icon: Users,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      planName: "Included with Tenant Account",
      isSubscribed: true,
      daysRemaining: daysLeft > 0 ? daysLeft : 365,
      capacityText: "Active Leased Workplace",
      features: [
        "Digital Invoices & Downloadable Tax Receipts",
        "Online UPI & NetBanking Rent Payments",
        "Billing Reconciliation & Service Dispute Filing",
        "Company Sub-User Staff Delegations"
      ],
      launchUrl: "/portal",
      upgradeUrl: "/portal"
    },
    {
      id: "visitor",
      name: "Office Guest Passes & Campus Access",
      category: "Visitor Experience",
      icon: ShieldCheck,
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      planName: "Included for Occupants",
      isSubscribed: true,
      daysRemaining: daysLeft > 0 ? daysLeft : 365,
      capacityText: "Digital Guest Passes",
      features: [
        "Instant WhatsApp QR Guest Invitations",
        "Turnstile & Speed Gate Fast-Track Relays",
        "Vendor Delivery & Contractor Badges",
        "Office Visitor Real-Time Log"
      ],
      launchUrl: "/vc/dashboard",
      upgradeUrl: "/visitor-compliance/pricing"
    },
    {
      id: "helpdesk",
      name: "Facility Helpdesk & Service Tickets",
      category: "Work Order Dispatch",
      icon: Headphones,
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      planName: "Included for Occupants",
      isSubscribed: true,
      daysRemaining: daysLeft > 0 ? daysLeft : 365,
      capacityText: "Unlimited Maintenance Tickets",
      features: [
        "Raise HVAC, Electrical & Cleaning Requests",
        "Strict SLA Countdown Timers",
        "Vendor Technician Progress Tracking",
        "Resolution Feedback & CSAT Ratings"
      ],
      launchUrl: "/operate/helpdesk",
      upgradeUrl: "/pricing"
    }
  ];

  const landlordModules: ModuleCardProps[] = [
    {
      id: "rent_roll",
      name: "Commercial Rent Roll & Leases",
      category: "Asset Management & Billing",
      icon: Building,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      planName: isGlobalSubscribed ? (subStatus?.plan_name || "Commercial Suite") : "Not Subscribed",
      isSubscribed: isGlobalSubscribed || Boolean(subStatus?.modules?.rentRoll),
      daysRemaining: daysLeft,
      capacityText: licensedSqft,
      features: [
        "39-Point Canonical Lease Matrix",
        "Automated Step Escalations",
        "Year-End CAM Pooling & True-Up",
        "GST & Reverse Charge Invoicing"
      ],
      launchUrl: "/properties/rent-roll",
      upgradeUrl: "/operate/rent-roll/pricing"
    },
    {
      id: "visitor",
      name: "Campus Access & Visitor Compliance (VC)",
      category: "Life Safety & Speed Gates",
      icon: ShieldCheck,
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      planName: isSuperAdmin || Boolean(subStatus?.modules?.visitors) ? "Campus Access Enterprise" : "Community Free",
      isSubscribed: isSuperAdmin || Boolean(subStatus?.modules?.visitors),
      daysRemaining: daysLeft,
      capacityText: "Unlimited WhatsApp Passes",
      features: [
        "WhatsApp QR Digital Guest Passes",
        "Turnstile & Flap Barrier Relays",
        "Overstay & Watchlist Alarms",
        "One-Click Emergency Roll-Call"
      ],
      launchUrl: "/vc/dashboard",
      upgradeUrl: "/visitor-compliance/pricing"
    },
    {
      id: "cafm",
      name: "52-Week CAFM & Preventive Maintenance (PPM)",
      category: "Facility Engineering",
      icon: Wrench,
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      planName: isSuperAdmin || Boolean(subStatus?.modules?.ppm) ? "Full CAFM Enterprise" : "Standard Ops",
      isSubscribed: isSuperAdmin || Boolean(subStatus?.modules?.ppm),
      daysRemaining: daysLeft,
      capacityText: "All Plant & DG Assets",
      features: [
        "DG, Chiller, Transformer Checklists",
        "Technician Job Card Logging",
        "QR Code Equipment Scanning",
        "Mean Time to Repair (MTTR) Tracking"
      ],
      launchUrl: "/operate/ppm",
      upgradeUrl: "/pricing"
    },
    {
      id: "compliance",
      name: "Statutory Compliance & NOC Calendar",
      category: "Regulatory & Life Safety",
      icon: FileCheck2,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      planName: isSuperAdmin || Boolean(subStatus?.modules?.compliance) ? "Enterprise Regulatory Suite" : "Self-Service",
      isSubscribed: isSuperAdmin || Boolean(subStatus?.modules?.compliance),
      daysRemaining: daysLeft,
      capacityText: "All Statutory Filings",
      features: [
        "Fire NOC & Lift License Tracker",
        "Pollution Control Board Certs",
        "Environmental Clearances",
        "Automated Expiry Warning Alerts"
      ],
      launchUrl: "/operate/compliance",
      upgradeUrl: "/pricing"
    },
    {
      id: "helpdesk",
      name: "Tenant QR Helpdesk & Service Tickets",
      category: "Tenant Relations",
      icon: Headphones,
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      planName: isSuperAdmin || Boolean(subStatus?.modules?.helpdesk) ? "Executive SLA Desk" : "Standard Ticketing",
      isSubscribed: isSuperAdmin || Boolean(subStatus?.modules?.helpdesk),
      daysRemaining: daysLeft,
      capacityText: "Unlimited Tenant Tickets",
      features: [
        "Tenant App QR Code Scanning",
        "Strict SLA Countdown Timers",
        "Vendor & Contractor Work Orders",
        "CSAT & Resolution Feedback"
      ],
      launchUrl: "/operate/helpdesk",
      upgradeUrl: "/pricing"
    },
    {
      id: "crm",
      name: "Commercial Leasing & Stacking CRM",
      category: "Leasing & Revenue",
      icon: Briefcase,
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      planName: isSuperAdmin || Boolean(subStatus?.modules?.leaseCrm) ? "Portfolio Pipeline Pro" : "Free CRM",
      isSubscribed: isSuperAdmin || Boolean(subStatus?.modules?.leaseCrm),
      daysRemaining: daysLeft,
      capacityText: "Full Floor Stacking",
      features: [
        "Interactive Floor Stacking Plans",
        "LOI Drafting & Deal Pipeline",
        "Broker Commission Splits",
        "Vacancy & Fitout Tracking"
      ],
      launchUrl: "/operate/lease-crm",
      upgradeUrl: "/pricing"
    }
  ];

  // Pick module set according to user role
  const modulesList = isTenant ? tenantModules : landlordModules;

  const filteredModules = modulesList.filter((m) => {
    if (activeTab === "active") return m.isSubscribed;
    if (activeTab === "available") return !m.isSubscribed;
    return true;
  });

  const activeModulesCount = modulesList.filter((m) => m.isSubscribed).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Global Navbar */}
      <ServiceNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-teal-700 transition">OfficeX Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#0F8B7D] font-bold">
              {isTenant ? "My Occupant Workplace & Account" : "My Account & Modular Subscriptions"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchSubscription(userEmail)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span>Sync Status</span>
          </button>
        </div>

        {/* User Identity & Profile Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0F8B7D] to-teal-800 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-teal-900/15 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{userName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <BadgeCheck size={13} className="text-emerald-600" />
                  Verified Account &amp; KYC
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 font-mono">{userEmail || "Signed In User"}</p>
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 pt-1 flex-wrap">
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{userRole}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-medium">{orgName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Subscription / Occupant Plan Summary Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0d2a26] to-slate-950 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-teal-900/50">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={13} className="text-teal-400" />
              <span>{activePlanName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isTenant ? "Your Occupant Workspaces & Services" : "Active Subscriptions & Module Quotas"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {isTenant
                ? "Your workplace access, digital billing, visitor passes, and helpdesk requests are fully active under your corporate lease agreement."
                : "OfficeX enforces independent modular licensing. Each SaaS tool operates on its dedicated quota, license days, and role permissions."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {/* Stat 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                <Clock size={11} />
                <span>{isTenant ? "Lease Status" : "Time Left"}</span>
              </div>
              <span className={`text-xl sm:text-2xl font-black mt-1 block ${daysLeft > 30 || isTenant ? "text-white" : daysLeft > 0 ? "text-amber-300" : "text-rose-400"}`}>
                {isTenant ? "Active Lease" : daysLeft > 0 ? `${daysLeft} Days` : "Free Tier"}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                {isTenant ? "365-Day Validity" : daysLeft > 0 ? "Active License" : "Upgrade to unlock"}
              </span>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                <Building size={11} />
                <span>{isTenant ? "Workplace" : "Licensed Area"}</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block truncate">
                {isTenant ? orgName : licensedSqft}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                {isTenant ? "Commercial Tenant" : "Commercial Quota"}
              </span>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                <Activity size={11} />
                <span>Active Tools</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                {activeModulesCount} / {modulesList.length}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">Entitled Desks</span>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers size={20} className="text-[#0F8B7D]" />
                <span>
                  {isTenant ? "Your Occupant Services & Desks" : "OfficeX SaaS Modules & Subscriptions"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isTenant
                  ? "Launch your corporate workspace, invite visitors, or raise maintenance requests below."
                  : "Subscriptions vary depending on module. You can launch your active tools or subscribe to additional modules below."}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Desks ({modulesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "active"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({activeModulesCount})
              </button>
              {!isTenant && (
                <button
                  type="button"
                  onClick={() => setActiveTab("available")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === "available"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Available ({modulesList.length - activeModulesCount})
                </button>
              )}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 relative ${
                    mod.isSubscribed
                      ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400"
                      : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        mod.isSubscribed
                          ? "bg-teal-50 border border-teal-200/80 text-[#0F8B7D]"
                          : "bg-slate-100 border border-slate-200 text-slate-500"
                      }`}>
                        <Icon size={22} className="stroke-[2.2]" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                        mod.isSubscribed
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {mod.isSubscribed ? (isTenant ? "● Active" : "● Subscribed") : "○ Not Active"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{mod.category}</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5 leading-snug">{mod.name}</h3>
                      <p className="text-xs text-slate-600 font-semibold mt-1">
                        Tier: <span className="text-[#0F8B7D] font-bold">{mod.planName}</span>
                      </p>
                    </div>

                    {/* Features Checklist */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {mod.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Check size={13} className="text-teal-600 shrink-0 stroke-[2.5]" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quota / Days Left Info */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Quota: {mod.capacityText}</span>
                      {mod.daysRemaining !== undefined && mod.isSubscribed ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          {mod.daysRemaining} Days Left
                        </span>
                      ) : (
                        <span className="text-slate-400">Upgrade to license</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    {mod.isSubscribed ? (
                      <Link
                        href={mod.launchUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#0F8B7D] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Launch Workspace</span>
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href={mod.upgradeUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F8B7D] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Sparkles size={14} />
                        <span>Activate Subscription</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link for Tenants interested in Landlord tools */}
          {isTenant && (
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 size={16} className="text-[#0F8B7D] shrink-0" />
                <span className="font-semibold">
                  Do you also manage commercial properties, multi-tenant buildings, or leasing?
                </span>
              </div>
              <Link
                href="/dashboard"
                className="font-bold text-[#0F8B7D] hover:underline shrink-0"
              >
                Switch to Property Management Suite &rarr;
              </Link>
            </div>
          )}
        </section>

        {/* Security & Password Change Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Account Security &amp; Credentials</h2>
              <p className="text-xs text-slate-500 font-medium">
                Change your account password. All passwords are encrypted with bcrypt salted hashing.
              </p>
            </div>
          </div>

          {passwordToast && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
              passwordToast.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-900"
            }`}>
              <AlertCircle size={16} className="shrink-0" />
              <span>{passwordToast.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-teal-500 transition"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#0F8B7D] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? "Verifying..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  HelpCircle,
  Building,
  MapPin,
  ArrowRight,
  Menu,
  Settings,
  FileText,
  Layers,
  LogOut,
  Building2,
  ChevronDown,
  Receipt,
  Briefcase,
  UserCheck,
  Users,
  TrendingUp,
  Zap,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import { performClientLogout } from "@/lib/auth-client";
import OwnerStatementModal from "@/components/rent-roll/OwnerStatementModal";
import PropertySelector from "@/components/PropertySelector";
import ModuleChooserModal from "@/components/dashboard/ModuleChooserModal";

const AVAILABLE_ROLES = [
  { key: "owner", label: "Owner / Landlord", sub: "Portfolio, Rent Roll & NOI", route: "/dashboard/owner", icon: Building2 },
  { key: "property_manager", label: "Property Manager", sub: "Daily Operations & Leases", route: "/dashboard/pm", icon: ClipboardList },
  { key: "finance_manager", label: "Finance / AR Manager", sub: "Invoices, Payments & Ageing", route: "/dashboard/finance", icon: Receipt },
  { key: "leasing_manager", label: "Leasing Manager", sub: "Pipeline, Vacancy & Deals", route: "/dashboard/leasing", icon: TrendingUp },
  { key: "facility_manager", label: "Facility Manager", sub: "FM Helpdesk & CAM Meters", route: "/dashboard/fm", icon: Zap },
  { key: "flex_operator", label: "Flex / Coworking", sub: "Seats & Centre P&L", route: "/operate/head-leases", icon: Layers },
  { key: "occupant", label: "Corporate Occupant", sub: "Tenant Self-Service Portal", route: "/tenant", icon: Users },
  { key: "org_admin", label: "Org Admin / Settings", sub: "Platform Configuration", route: "/settings", icon: Settings },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile Menu & Subscription State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isModuleChooserOpen, setIsModuleChooserOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Multi-Client Operator State (§2.1, §S-02)
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isOwnerStatementOpen, setIsOwnerStatementOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Role Selector Dropdown State
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [currentRoleKey, setCurrentRoleKey] = useState("owner");
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Generate breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const formattedBreadcrumb = pathParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("  >  ");

  const popularDestinations = [
    { name: "Rent Roll Register", type: "Module", location: "/properties/rent-roll" },
    { name: "Invoices & Billing", type: "Module", location: "/operate/invoices" },
    { name: "Utility Meters", type: "Module", location: "/operations/meters" },
    { name: "CAM Pools & True-Up", type: "Module", location: "/operate/cam-pools" },
    { name: "Approvals Inbox", type: "Module", location: "/approvals" }
  ];

  // Sync session state from localStorage & purge any dummy subscriber email
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      let storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");
      const storedRoleKey = localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key");

      // Strictly purge any legacy synthetic subscriber email
      if (storedEmail && (storedEmail.includes("subscriber@officex.in") || storedEmail.includes("google-subscriber"))) {
        localStorage.removeItem("officex_user_email");
        sessionStorage.removeItem("officex_user_email");
        storedEmail = "";
      }

      const storedLogo = localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo") || "";
      const storedBrand = localStorage.getItem("officex_brand_name") || localStorage.getItem("officex_company_name") || "";
      if (storedLogo) setBrandLogo(storedLogo);
      if (storedBrand) setBrandName(storedBrand);

      if (storedName && !storedName.toLowerCase().includes("subscriber")) {
        setUserName(storedName);
      }
      if (storedEmail) setUserEmail(storedEmail);
      if (storedRoleKey && AVAILABLE_ROLES.some((r) => r.key === storedRoleKey)) {
        setCurrentRoleKey(storedRoleKey);
      }

      const globalSub =
        localStorage.getItem("officex_subscription") === "active" ||
        sessionStorage.getItem("officex_subscription") === "active" ||
        document.cookie.includes("officex_subscription=active");
      const emailSub = storedEmail
        ? localStorage.getItem(`officex_sub_${storedEmail}`) === "active" ||
          document.cookie.includes(`officex_sub_${encodeURIComponent(storedEmail)}=active`)
        : false;
      setIsSubscribed(globalSub || emailSub);
    }

    // Resolve real user profile from active session
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email && !data.user.email.includes("subscriber@officex.in")) {
          setUserEmail(data.user.email);
          if (data.user.fullName) setUserName(data.user.fullName);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleGoToDashboard = () => {
    setIsProfileMenuOpen(false);
    if (!isSubscribed) {
      router.push("/operate/rent-roll/pricing");
      return;
    }
    // Always open module chooser modal per user requirement
    setIsModuleChooserOpen(true);
  };

  const handleProfileKYC = () => {
    setIsProfileMenuOpen(false);
    if (!isSubscribed) {
      router.push("/operate/rent-roll/pricing");
    } else {
      router.push("/settings");
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = popularDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) || (d.location && d.location.toLowerCase().includes(q))
      );
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  // Fetch Multi-Client accounts (§2.1)
  useEffect(() => {
    fetch("/api/multi-client/clients")
      .then((res) => res.json())
      .then((data) => {
        if (data.clients && data.clients.length > 0) {
          setClients(data.clients);
          const savedId = typeof window !== "undefined" ? localStorage.getItem("officex_client_account_id") : null;
          const found = data.clients.find((c: any) => c.id === savedId) || data.clients[0];
          setSelectedClient(found);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectClient = (c: any) => {
    setSelectedClient(c);
    setIsClientDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_client_account_id", c.id);
      document.cookie = `officex_client_account_id=${encodeURIComponent(c.id)}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("officex-client-changed", { detail: { client: c } }));
    }
  };

  const handleSelectRole = (r: typeof AVAILABLE_ROLES[0]) => {
    setCurrentRoleKey(r.key);
    setIsRoleDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_role", r.label);
      localStorage.setItem("officex_role_key", r.key);
      sessionStorage.setItem("officex_user_role", r.label);
      sessionStorage.setItem("officex_role_key", r.key);
      document.cookie = `officex_user_role=${encodeURIComponent(r.label)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_role_key=${encodeURIComponent(r.key)}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("officex-role-change", { detail: { roleKey: r.key, role: r } }));
    }
    router.push(r.route);
  };

  // Click outside listener for all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(name)}`);
  };

  // Sign out handler
  const handleSignOut = async () => {
    await performClientLogout("/login");
  };

  const activeRole = AVAILABLE_ROLES.find((r) => r.key === currentRoleKey) || AVAILABLE_ROLES[0];

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-[260px] z-20 px-4 md:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs & Selectors */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("officex-toggle-sidebar"))}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 md:hidden cursor-pointer active:scale-95 transition-transform"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Clean Company / Brand Logo & Name Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
          {brandLogo ? (
            <img src={brandLogo} alt="Logo" className="h-5 max-w-[80px] object-contain rounded" />
          ) : (
            <Building2 size={15} className="text-[#0F8B7D]" />
          )}
          <span className="text-xs font-extrabold text-slate-900 max-w-[180px] truncate">
            {brandName || "OfficeX Commercial"}
          </span>
        </div>

        {/* Global Property Selector */}
        <div>
          <PropertySelector />
        </div>
      </div>

      {/* Right Search, Notification and Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search Input Box */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search assets, tickets, properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
              }}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs w-56 lg:w-64 bg-slate-50 transition-colors"
            />
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Results
              </div>
              <div className="flex flex-col max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.name)}
                    className="p-3 text-left hover:bg-teal-50/50 flex items-center justify-between border-b border-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.type === "City" ? (
                        <MapPin size={14} className="text-teal-600" />
                      ) : item.type === "Asset" ? (
                        <Settings size={14} className="text-amber-500" />
                      ) : item.type === "Ticket" || item.type === "Work Order" ? (
                        <FileText size={14} className="text-purple-500" />
                      ) : (
                        <Building size={14} className="text-teal-600" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {item.location || item.count}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Link */}
        <Link
          href="/support"
          className="text-slate-500 hover:text-teal-600 transition-colors p-1"
          title="Help & Documentation"
        >
          <HelpCircle size={18} />
        </Link>

        {/* Notifications Icon with Red Dot */}
        <button className="relative text-slate-500 hover:text-teal-600 transition-colors p-1 cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Mini Avatar & Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-teal-100 overflow-hidden"
          >
            {brandLogo ? (
              <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              (userName || userEmail || "O")[0].toUpperCase()
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn text-slate-800">
              <div className="p-3 border-b border-slate-100 flex items-center gap-2.5">
                {brandLogo ? (
                  <img src={brandLogo} alt="Logo" className="w-9 h-9 object-contain rounded-xl border border-slate-200 bg-white p-0.5 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {(userName || userEmail || "O")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span suppressHydrationWarning className="text-xs font-bold text-slate-900 block truncate">
                    {brandName || userName || userEmail || "Commercial Account"}
                  </span>
                  {userEmail && (
                    <span className="text-[11px] text-slate-500 font-mono block truncate">{userEmail}</span>
                  )}
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Verified Account
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-1">
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Layers size={14} className="text-teal-600" />
                  <div className="flex flex-col">
                    <span>
                      {pathname.startsWith("/dashboard") || pathname.startsWith("/properties/rent-roll")
                        ? "Switch SaaS Module"
                        : "Go to My Dashboard"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {pathname.startsWith("/dashboard") || pathname.startsWith("/properties/rent-roll")
                        ? `Active: ${activeRole.label} · Switch`
                        : (isSubscribed ? "Open Module Dashboard" : "Subscription Required")}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleProfileKYC}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Building2 size={14} className="text-slate-500" />
                  <div className="flex flex-col">
                    <span>Profile &amp; KYC</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isSubscribed ? "Organization & Compliance" : "Subscription Required"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Statement Modal (§5.10 / Table 103) */}
      <OwnerStatementModal
        isOpen={isOwnerStatementOpen}
        onClose={() => setIsOwnerStatementOpen(false)}
        clientAccountId={selectedClient?.id}
        clientName={selectedClient?.client_name}
      />

      {/* Multi-Module SaaS Chooser Modal */}
      <ModuleChooserModal
        isOpen={isModuleChooserOpen}
        onClose={() => setIsModuleChooserOpen(false)}
      />
    </header>
  );
}

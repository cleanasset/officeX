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
  ShieldCheck,
  Compass,
  Landmark
} from "lucide-react";
import { performClientLogout, getLogoutRedirect } from "@/lib/auth-client";
import OwnerStatementModal from "@/components/rent-roll/OwnerStatementModal";
import PropertySelector from "@/components/PropertySelector";
import ModuleChooserModal from "@/components/dashboard/ModuleChooserModal";
import { getClientAuthHeaders } from "@/lib/auth-storage";

const AVAILABLE_ROLES = [
  { key: "owner", label: "Owner / Landlord", sub: "Portfolio, Rent Roll & NOI", route: "/dashboard/owner", icon: Building2 },
  { key: "org_admin", label: "Org Admin (1 Manager)", sub: "Full Operational Authority", route: "/dashboard/owner", icon: Settings },
  { key: "client_principal", label: "Client Principal (3rd Party Owner)", sub: "Managed Account & Statements", route: "/dashboard/owner", icon: Landmark },
  { key: "property_manager", label: "Property Manager", sub: "Daily Operations & Leases", route: "/dashboard/pm", icon: ClipboardList },
  { key: "finance_manager", label: "Finance / AR Manager", sub: "Invoices, Payments & Ageing", route: "/dashboard/finance", icon: Receipt },
  { key: "leasing_manager", label: "Leasing Manager", sub: "Pipeline, Vacancy & Deals", route: "/dashboard/leasing", icon: TrendingUp },
  { key: "facility_manager", label: "Facility Manager", sub: "FM Helpdesk & CAM Meters", route: "/dashboard/fm", icon: Zap },
  { key: "flex_operator", label: "Flex / Coworking", sub: "Seats & Centre P&L", route: "/operate/head-leases", icon: Layers },
  { key: "tenant", label: "Corporate Occupant (Tenant)", sub: "Invoices, Pay Now & TDS", route: "/portal", icon: Users },
  { key: "auditor", label: "Auditor & Compliance", sub: "Snapshots & Immutable Audit", route: "/reporting/mis", icon: ShieldCheck },
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

  // Notification Drawer State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Lease Expiry Notice (Within 90 Days)",
      message: "Unit 402 contract enters 90-day renewal notice period. Action required.",
      time: "15m ago",
      tag: "Lease Renewal",
      tagColor: "bg-amber-50 text-amber-700 border-amber-200",
      unread: true,
      route: "/properties/rent-roll?tab=contracts"
    },
    {
      id: "notif-2",
      title: "Contractual Step-Up Escalation",
      message: "Scheduled 5% escalation is queued for next monthly billing cycle.",
      time: "2h ago",
      tag: "Escalation",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200",
      unread: true,
      route: "/operate/escalations"
    },
    {
      id: "notif-3",
      title: "Monthly Rent Roll Invoices Ready",
      message: "Pro-rata billing run completed. Invoices available for review.",
      time: "Today",
      tag: "Billing",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      unread: true,
      route: "/operate/invoices"
    }
  ]);

  // Multi-Client Operator State
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isOwnerStatementOpen, setIsOwnerStatementOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Current User Role
  const [currentRoleKey, setCurrentRoleKey] = useState("owner");

  const unreadCount = notifications.filter((n) => n.unread).length;
  const isAlreadyOnDashboard = pathname.startsWith("/dashboard");

  const commercialDestinations = [
    { name: "Rent Roll Register", type: "Register", location: "/properties/rent-roll", description: "All active leases, units & contracts" },
    { name: "Contracts & Expiry Pipeline", type: "Contracts", location: "/properties/rent-roll?tab=contracts", description: "Active agreements & upcoming renewals" },
    { name: "Tenants & Occupiers", type: "Tenants", location: "/properties/rent-roll?tab=tenants", description: "Occupant directory & KYC records" },
    { name: "Invoices & Billing Runs", type: "Billing", location: "/operate/invoices", description: "Monthly rent rolls & tax invoices" },
    { name: "Collections & Aging Ledger", type: "Finance", location: "/operate/collections", description: "Overdue ageing & PTP follow-ups" },
    { name: "Escalation Calendar", type: "Lease", location: "/operate/escalations", description: "Annual step-up rate adjustments" },
    { name: "Utility Sub-Meters", type: "Operations", location: "/settings/meters", description: "Electric & water sub-meter logs" },
    { name: "CAM Pools & True-Up", type: "Operations", location: "/operate/cam-pools", description: "Common area maintenance reconciliations" },
    { name: "Approvals & Maker-Checker", type: "Governance", location: "/approvals", description: "Pending sign-offs & thresholds" }
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
    fetch("/api/users/me", { headers: getClientAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email && !data.user.email.includes("subscriber@officex.in")) {
          setUserEmail(data.user.email);
          if (data.user.fullName) setUserName(data.user.fullName);
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = commercialDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          (d.location && d.location.toLowerCase().includes(q))
      );
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  // Fetch Multi-Client accounts
  useEffect(() => {
    fetch("/api/multi-client/clients", { headers: getClientAuthHeaders() })
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

  // Click outside listener for all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/properties/rent-roll?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectSuggestion = (dest: any) => {
    setIsDropdownOpen(false);
    if (dest.location) {
      router.push(dest.location);
    } else {
      router.push(`/properties/rent-roll?search=${encodeURIComponent(dest.name)}`);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n: any) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
    );
    setIsNotificationOpen(false);
    if (n.route) {
      router.push(n.route);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await performClientLogout(getLogoutRedirect(pathname));
  };

  const activeRole = AVAILABLE_ROLES.find((r) => r.key === currentRoleKey) || AVAILABLE_ROLES[0];

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-[260px] z-20 px-3 sm:px-4 md:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs & Selectors */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("officex-toggle-sidebar"))}
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 md:hidden cursor-pointer active:scale-95 transition-transform shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Global Property Selector */}
        <div className="min-w-0">
          <PropertySelector />
        </div>
      </div>

      {/* Right Search, Notification and Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input Box */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search rent roll, properties, tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
              }}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs w-60 lg:w-72 bg-slate-50 transition-colors"
            />
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fadeIn min-w-[280px]">
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 bg-teal-50/70 border-b border-teal-100 flex items-center gap-2 text-left hover:bg-teal-100/60 transition-colors cursor-pointer"
                >
                  <Search size={14} className="text-teal-700 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-teal-900 block truncate">
                      Search Rent Roll for &quot;{searchQuery}&quot;
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium">Filter properties, units, tenants</span>
                  </div>
                  <ArrowRight size={12} className="text-teal-700 shrink-0" />
                </button>
              )}

              <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Modules &amp; Registers
              </div>
              <div className="flex flex-col max-h-64 overflow-y-auto divide-y divide-slate-50">
                {(suggestions.length > 0 ? suggestions : commercialDestinations.slice(0, 5)).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="p-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                        <Building2 size={12} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.description || item.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-slate-300 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Link */}
        <Link
          href="/support"
          className="hidden sm:block text-slate-500 hover:text-teal-600 transition-colors p-1"
          title="Help & Documentation"
        >
          <HelpCircle size={18} />
        </Link>

        {/* Notifications Icon with Interactive Rent Roll Drawer */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-slate-500 hover:text-teal-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fadeIn text-slate-800">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Rent Roll Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      All caught up
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                      n.unread ? "bg-teal-50/20" : ""
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          n.unread ? "bg-teal-600 ring-2 ring-teal-200" : "bg-slate-300"
                        }`}
                      ></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider truncate border-slate-200 text-slate-600">
                          {n.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/properties/rent-roll?tab=contracts"
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
                >
                  View Rent Roll Pipeline <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

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
                    {brandName || userName || userEmail || "Account Overview"}
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
                {/* Only show Dashboard link if not already on the dashboard */}
                {!isAlreadyOnDashboard && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push("/dashboard/owner");
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                  >
                    <Layers size={15} className="text-teal-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Portfolio Dashboard</span>
                      <span className="text-[10px] text-slate-400 font-normal">Return to main overview</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings size={15} className="text-slate-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Enterprise Settings</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Branding, Billing SPVs &amp; Tax Rules
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/operate/rent-roll/pricing");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Subscription &amp; Quota</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Rent Roll Suite
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Statement Modal (Owner Settlement Ledger) */}
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

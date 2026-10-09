"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building,
  TrendingUp,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FolderOpen,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  ClipboardList,
  Clock,
  LogOut,
  MapPin,
  HelpCircle,
  Cpu,
  BarChart3,
  Award,
  ChevronRight,
  ChevronDown,
  Shield,
  Activity,
  CheckCircle,
  Truck,
  Zap,
  Landmark,
  Server,
  Database,
  Cloud,
  CreditCard,
  Menu
} from "lucide-react";

interface SubMenuItem {
  name: string;
  href: string;
  tabKey: string;
  icon?: React.ComponentType<{ size: number; className?: string }>;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  badge?: string;
  subItems?: SubMenuItem[];
}

// 1. Role-Specific Menus (Strict namespace isolation per portal)
const roleSpecificMenus: Record<string, MenuItem[]> = {
  // PROPERTY OWNER / LANDLORD
  properties: [
    { name: "Portfolio Overview", href: "/properties", icon: Layers },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
    { 
      name: "Rent Roll Master", 
      href: "/properties/rent-roll?tab=dashboard", 
      icon: DollarSign,
      subItems: [
        { name: "Dashboard", href: "/properties/rent-roll?tab=dashboard", tabKey: "dashboard", icon: Building },
        { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", tabKey: "rentroll", icon: FileText },
        { name: "Leasing CRM (S-18)", href: "/operate/lease-crm", tabKey: "lease-crm", icon: Sparkles },
        { name: "Billing & Invoices", href: "/operate/invoices", tabKey: "invoices", icon: DollarSign },
        { name: "Payments & Allocations (S-43)", href: "/operate/payments", tabKey: "payments", icon: CreditCard },
        { name: "Collections & Ageing (S-45)", href: "/operate/collections", tabKey: "collections", icon: AlertTriangle },
        { name: "Credit Notes (S-42)", href: "/operate/credit-notes", tabKey: "credit-notes", icon: FileText },
        { name: "Tenant Disputes (S-46)", href: "/operate/disputes", tabKey: "disputes", icon: ShieldCheck },
        { name: "Utility Meters", href: "/properties/rent-roll?tab=meter-readings", tabKey: "meter-readings", icon: Zap },
        { name: "Escalation Calendar (S-25)", href: "/operate/escalations", tabKey: "escalations", icon: TrendingUp },
        { name: "Renewals Pipeline (S-24)", href: "/operate/renewals", tabKey: "renewals", icon: Clock },
        { name: "Bulk Import Centre (S-30)", href: "/operate/imports", tabKey: "imports", icon: FolderOpen },
        { name: "Stacking Plan (S-26)", href: "/operate/stacking", tabKey: "stacking", icon: Layers },
        { name: "Owner Statements (S-55)", href: "/operate/owner-statements", tabKey: "owner-statements", icon: Landmark },
        { name: "Client Mandates (S-56)", href: "/operate/mandates", tabKey: "mandates", icon: Briefcase },
        { name: "Head Leases & Flex (S-57)", href: "/operate/head-leases", tabKey: "head-leases", icon: TrendingUp },
        { name: "12-Mo Forecast (S-51)", href: "/operate/forecast", tabKey: "forecast", icon: Calendar },
        { name: "NOI & P&L (S-52)", href: "/operate/pnl", tabKey: "pnl", icon: BarChart3 },
        { name: "Exceptions (S-50)", href: "/operate/exceptions", tabKey: "exceptions", icon: AlertTriangle },
        { name: "Month-End Lock (S-53)", href: "/operate/snapshots", tabKey: "snapshots", icon: ShieldCheck },
        { name: "MIS Investor Pack (S-54)", href: "/operate/mis", tabKey: "mis", icon: FileText },
        { name: "CAM Pools & True-Up", href: "/operate/cam-pools", tabKey: "cam-pools", icon: Sparkles },
        { name: "Tenants & Leases", href: "/properties/rent-roll?tab=tenants", tabKey: "tenants", icon: Users },
        { name: "Terms Dictionary", href: "/properties/rent-roll?tab=dictionary", tabKey: "dictionary", icon: Sparkles },
        { name: "Settings Master (S-60…S-67)", href: "/settings", tabKey: "settings", icon: Settings },
        { name: "Tally ERP Sync (RR-INT-01)", href: "/operate/sync/tally", tabKey: "tally-sync", icon: Database },
        { name: "Bank Reconciler (RR-INT-02)", href: "/operate/sync/bank-reconcile", tabKey: "bank-reconcile", icon: Landmark }
      ]
    },
    { 
      name: "Banking & Accounting", 
      href: "/properties/banking", 
      icon: Landmark
    },
    { 
      name: "Visitor Management", 
      href: "/properties/visitors", 
      icon: Users
    },
    { name: "Statutory Compliance", href: "/properties/compliance", icon: ShieldCheck }
  ],

  // FACILITY MANAGER (FM OPS)
  ops: [
    { name: "FM Command Centre", href: "/ops", icon: ClipboardList },
    { name: "Helpdesk Tickets", href: "/ops/helpdesk", icon: AlertTriangle },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar },
    { name: "Asset Register & Health", href: "/ops/assets", icon: Settings },
    { name: "Outcome-Based FM", href: "/ops/outcomes", icon: Activity },
    { name: "Visitor & Speed-Gates", href: "/ops/visitors", icon: Users },
    { name: "Compliance Centre", href: "/ops/compliance", icon: ShieldCheck }
  ],

  // ENTERPRISE TENANT & EMPLOYEES
  tenant: [
    { name: "Tenant Workplace", href: "/tenant", icon: Building },
    { name: "Employee Desk & Rooms", href: "/tenant/employee", icon: MapPin },
    { name: "Visitor Pre-Registration", href: "/tenant/visitors", icon: Users },
    { name: "Helpdesk & Requests", href: "/tenant/helpdesk", icon: HelpCircle },
    { name: "Rent & Invoices", href: "/tenant/payments", icon: DollarSign },
    { name: "Lease Documents", href: "/tenant/documents", icon: FileText }
  ],

  // SERVICE VENDOR & CONTRACTOR
  vendor: [
    { name: "Vendor Dashboard", href: "/vendor", icon: Briefcase },
    { name: "RFQs & Live Bidding", href: "/vendor/rfqs", icon: ClipboardList },
    { name: "Active Work Orders", href: "/vendor/work-orders", icon: Truck },
    { name: "Milestones & Escrow", href: "/vendor/payments", icon: DollarSign },
    { name: "Performance & Ratings", href: "/vendor/ratings", icon: Award }
  ],

  // LEASING BROKER (CRM)
  leasing: [
    { name: "Broker Dashboard", href: "/leasing", icon: TrendingUp },
    { name: "Leasing CRM (S-18)", href: "/operate/lease-crm", icon: Sparkles },
    { name: "Space Listings Builder", href: "/leasing/listings", icon: Sparkles },
    { name: "Leads & Enquiries", href: "/leasing/leads", icon: Users },
    { name: "Site Visits Schedule", href: "/leasing/visits", icon: Calendar },
    { name: "LOI & Leases", href: "/leasing/loi", icon: FileText },
    { name: "Commission Ledger", href: "/leasing/commissions", icon: DollarSign }
  ],

  // FM MARKETPLACE BUYER
  marketplace: [
    { name: "Marketplace Directory", href: "/marketplace", icon: Building },
    { name: "RFQ Directory", href: "/marketplace/rfq", icon: ClipboardList },
    { name: "Create RFQ", href: "/marketplace/create-rfq", icon: FileText },
    { name: "Quote Comparison", href: "/marketplace/compare", icon: Award },
    { name: "Active Work Orders", href: "/marketplace/work-orders", icon: Truck },
    { name: "Escrow Payments", href: "/marketplace/payments", icon: DollarSign }
  ],

  // PUBLIC DISCOVERY (MARKETPLACE)
  public: [
    { name: "Search Spaces", href: "/public/search", icon: Building },
    { name: "Office Marketplace", href: "/marketplace", icon: Layers },
    { name: "FM Marketplace", href: "/fm-marketplace", icon: Truck },
    { name: "Sign In / Register", href: "/login", icon: Users }
  ],

  // EXECUTIVE CONTROL / GOVERNANCE
  admin: [
    { name: "Governance Console", href: "/admin", icon: Shield },
    { name: "KYC & Vetting", href: "/admin/kyc", icon: ShieldCheck },
    { name: "Accounting & ERP Sync", href: "/properties/integrations", icon: Zap },
    { name: "Razorpay Escrow Control", href: "/admin/escrow", icon: DollarSign },
    { name: "Platform Users", href: "/admin/users", icon: Users },
    { name: "System Audit Logs", href: "/admin/audit", icon: FileText }
  ],

  // AUDITOR / ANALYST
  reporting: [
    { name: "Workplace Analytics", href: "/reporting", icon: BarChart3 },
    { name: "MIS Financial Ledger", href: "/reporting/mis", icon: DollarSign },
    { name: "ESG & Sustainability", href: "/reporting/esg", icon: Sparkles },
    { name: "AI Predictive Engine", href: "/reporting/ai", icon: Cpu, badge: "Coming Soon" }
  ]
};

const roleHomes: Record<string, { label: string; roleName: string; route: string }> = {
  properties: { label: "Commercial Portfolio", roleName: "Commercial Portfolio", route: "/properties" },
  ops: { label: "Facility Management", roleName: "Facility Management", route: "/ops" },
  tenant: { label: "Corporate Workplace", roleName: "Corporate Workplace", route: "/tenant" },
  vendor: { label: "Facility Services", roleName: "Facility Services", route: "/vendor" },
  leasing: { label: "Commercial Leasing", roleName: "Commercial Leasing", route: "/leasing" },
  marketplace: { label: "FM Procurement", roleName: "FM Procurement", route: "/marketplace" },
  admin: { label: "Executive Control", roleName: "Executive Control", route: "/admin" },
  reporting: { label: "Workplace Analytics", roleName: "Workplace Analytics", route: "/reporting" },
  public: { label: "Commercial Discovery", roleName: "Commercial Discovery", route: "/public/search" }
};

// Mapping alias paths to corresponding portal keys
const pathPortalAliases: Record<string, string> = {
  "fm-marketplace": "marketplace",
  "portfolio": "properties",
  "property": "properties",
  "compliance": "properties",
  "operations": "ops",
  "reports": "reporting",
  "discover": "public",
  "calq": "leasing",
  "operate": "properties"
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "rentroll";

  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("properties");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [orgDisplayName, setOrgDisplayName] = useState<string>("");
  const [orgCity, setOrgCity] = useState<string>("");
  const [orgLogo, setOrgLogo] = useState<string>("");
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({});

  // Synchronously compute active portal from URL first, handling both direct keys and aliases
  const findPortalKey = (path: string): string | undefined => {
    const cleanPath = path.replace(/^\//, "").split("/")[0];
    if (roleHomes[cleanPath]) return cleanPath;
    if (pathPortalAliases[cleanPath]) return pathPortalAliases[cleanPath];
    return Object.keys(roleHomes).find(key => 
      path === `/${key}` || path.startsWith(`/${key}/`)
    );
  };

  const matchedFromPath = findPortalKey(pathname);
  const currentPortalKey = matchedFromPath || selectedRole || "properties";

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      if (storedName) setUserName(storedName);

      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");
      if (storedEmail) setUserEmail(storedEmail);

      const saved = localStorage.getItem("officex_active_portal");
      if (saved && roleHomes[saved]) {
        setSelectedRole(saved);
      }

      // Load dynamic org identity from onboarding
      const storedOrgName = localStorage.getItem("officex_active_org") || localStorage.getItem("officex_org_name") || localStorage.getItem("officex_portfolio_name") || "";
      const storedOrgCity = localStorage.getItem("officex_org_city") || "";
      const storedOrgLogo = localStorage.getItem("officex_org_logo") || localStorage.getItem("officex_brand_logo") || "";
      if (storedOrgName) setOrgDisplayName(storedOrgName);
      if (storedOrgCity) setOrgCity(storedOrgCity);
      if (storedOrgLogo) setOrgLogo(storedOrgLogo);
    }
  }, []);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("officex-toggle-sidebar", handleToggle);
    return () => window.removeEventListener("officex-toggle-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    if (matchedFromPath) {
      setSelectedRole(matchedFromPath);
      try {
        localStorage.setItem("officex_active_portal", matchedFromPath);
      } catch (e) {
        // ignore
      }
    }
  }, [pathname, matchedFromPath]);

  const activeRole = roleHomes[currentPortalKey] || roleHomes.properties;
  const activeMenu = roleSpecificMenus[currentPortalKey] || roleSpecificMenus.properties;

  const handleRoleChange = (key: string) => {
    setSelectedRole(key);
    try {
      localStorage.setItem("officex_active_portal", key);
    } catch (e) {
      // ignore
    }
    const selected = roleHomes[key];
    if (selected) {
      router.push(selected.route);
    }
  };





  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-[#111827]/40 backdrop-blur-xs z-25 md:hidden cursor-pointer"
        />
      )}

      <div className={`w-[260px] h-screen bg-white/95 backdrop-blur-md border-r border-gray-200/80 flex flex-col justify-between fixed left-0 top-0 z-30 shrink-0 transition-transform duration-200 shadow-sm md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Top Brand Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={38} 
              height={38} 
              className="object-contain group-hover:scale-105 transition-transform"
              style={{ width: "auto", height: "29px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={125} 
              height={30} 
              className="object-contain"
              style={{ width: "auto", height: "25px" }}
            />
          </Link>
        </div>

        {/* Clean, Role-Isolated Navigation (Left Panel Fixed, Scrollbar Hidden) */}
        <nav className="flex-1 px-3 py-3.5 flex flex-col gap-1.5 overflow-y-auto [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">
            Navigation
          </div>

          {activeMenu.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const itemPath = item.href.split("?")[0];
            const isItemActive = hasSubItems
              ? pathname.startsWith(itemPath)
              : pathname === item.href || (item.href !== `/${currentPortalKey}` && item.href !== "/properties" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isExpanded = expandedSubMenus[item.name] ?? isItemActive;

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1 my-0.5">
                  <div
                    onClick={() => {
                      setExpandedSubMenus(prev => ({
                        ...prev,
                        [item.name]: !isExpanded
                      }));
                      if (!isItemActive) {
                        router.push(item.href);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                      isItemActive
                        ? "bg-[#0F8B7D] text-white font-black shadow-sm"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    <Icon size={16} className={isItemActive ? "text-white" : "text-gray-500"} />
                    <span className="truncate flex-1 font-bold tracking-wide">{item.name}</span>
                    {item.badge && !isItemActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-50 text-teal-700 border border-teal-200/60">
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown size={14} className={isItemActive ? "text-white" : "text-gray-400"} />
                    ) : (
                      <ChevronRight size={14} className={isItemActive ? "text-white" : "text-gray-400"} />
                    )}
                  </div>

                  {/* Dropdown Sub-Items List */}
                  {isExpanded && item.subItems && (
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 flex flex-col gap-0.5 py-1 my-0.5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 animate-in fade-in duration-150">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon || ChevronRight;
                        const subPath = sub.href.split("?")[0];
                        const subTab = new URLSearchParams(sub.href.split("?")[1] || "").get("tab");
                        const isSubActive =
                          pathname === subPath && (!subTab || activeTabParam === subTab || (!searchParams.get("tab") && subTab === "dashboard" && subPath === "/properties/rent-roll") || (!searchParams.get("tab") && subTab === "banking" && subPath === "/properties/banking"));

                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                              isSubActive
                                ? "bg-teal-50 text-[#0F8B7D] font-extrabold shadow-2xs border border-teal-200/90"
                                : "text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <SubIcon size={13} className={isSubActive ? "text-[#0F8B7D]" : "text-gray-400"} />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all relative ${
                  isItemActive
                    ? "bg-[#0F8B7D] text-white font-black shadow-sm"
                    : "text-gray-700 font-bold hover:bg-gray-100/70 hover:text-gray-900"
                }`}
              >
                <Icon size={16} className={isItemActive ? "text-white" : "text-gray-500"} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                    isItemActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isItemActive && !item.badge && <ChevronRight size={13} className="ml-auto text-white shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Minimal Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-gray-400 text-xs bg-slate-50/50">
          <Link href="/support" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <HelpCircle size={14} />
            <span>Help &amp; Support</span>
          </Link>
          <Link href="/login" title="Logout" className="hover:text-rose-600 p-1 rounded-md transition-colors">
            <LogOut size={14} />
          </Link>
        </div>
      </div>

      {/* Mobile App Bottom Navigation Bar (md:hidden) — Native App Experience */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around safe-area-bottom"
      >
        <Link
          href="/properties/rent-roll"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/properties/rent-roll") || pathname === "/operate/rent-roll"
              ? "text-[#0F8B7D] font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <DollarSign size={20} className={pathname.startsWith("/properties/rent-roll") || pathname === "/operate/rent-roll" ? "stroke-[2.5]" : ""} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Rent Roll</span>
        </Link>

        <Link
          href="/operate/invoices"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/operate/invoices") || pathname.startsWith("/invoices")
              ? "text-[#0F8B7D] font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <FileText size={20} className={pathname.startsWith("/operate/invoices") || pathname.startsWith("/invoices") ? "stroke-[2.5]" : ""} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Invoices</span>
        </Link>

        <Link
          href="/operate/stacking"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/operate/stacking")
              ? "text-[#0F8B7D] font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <Layers size={20} className={pathname.startsWith("/operate/stacking") ? "stroke-[2.5]" : ""} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Stacking</span>
        </Link>

        <Link
          href="/operate/pnl"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/operate/pnl") || pathname.startsWith("/operate/owner-statements")
              ? "text-[#0F8B7D] font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <BarChart3 size={20} className={pathname.startsWith("/operate/pnl") || pathname.startsWith("/operate/owner-statements") ? "stroke-[2.5]" : ""} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">P&amp;L</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isOpen ? "text-[#0F8B7D] font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Menu</span>
        </button>
      </nav>
    </>
  );
}

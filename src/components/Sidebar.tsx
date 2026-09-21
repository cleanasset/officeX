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
  Truck
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
    { name: "List New Property", href: "/properties/add", icon: Sparkles },
    { 
      name: "Rent Roll Master", 
      href: "/properties/rent-roll?tab=dashboard", 
      icon: DollarSign,
      subItems: [
        { name: "Executive Dashboard", href: "/properties/rent-roll?tab=dashboard", tabKey: "dashboard", icon: Building },
        { name: "Active Rent Roll Master", href: "/properties/rent-roll?tab=rentroll", tabKey: "rentroll", icon: FileText },
        { name: "Monthly Billing & Invoices", href: "/properties/rent-roll?tab=invoices", tabKey: "invoices", icon: DollarSign },
        { name: "Collections & Receipts", href: "/properties/rent-roll?tab=collections", tabKey: "collections", icon: CheckCircle },
        { name: "Arrears & Aging Ledger", href: "/properties/rent-roll?tab=aging", tabKey: "aging", icon: AlertTriangle },
        { name: "Escalation & Expiries", href: "/properties/rent-roll?tab=escalations", tabKey: "escalations", icon: TrendingUp },
        { name: "Stacking & Occupancy", href: "/properties/rent-roll?tab=occupancy", tabKey: "occupancy", icon: Layers },
        { name: "12-Mo Financial Forecast", href: "/properties/rent-roll?tab=forecast", tabKey: "forecast", icon: Calendar },
        { name: "NOI & Property P&L", href: "/properties/rent-roll?tab=pnl", tabKey: "pnl", icon: BarChart3 },
        { name: "Tenant Directory & Leases", href: "/properties/rent-roll?tab=tenants", tabKey: "tenants", icon: Users },
        { name: "Financial Terms Dictionary", href: "/properties/rent-roll?tab=dictionary", tabKey: "dictionary", icon: Sparkles },
        { name: "Audit Trail & Config", href: "/properties/rent-roll?tab=audit", tabKey: "audit", icon: ShieldCheck }
      ]
    },
    { name: "Statutory Compliance", href: "/properties/compliance", icon: ShieldCheck },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar }
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
    { name: "Leasing Pipeline", href: "/leasing/pipeline", icon: Layers },
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

  // SUPER ADMIN
  admin: [
    { name: "Super Admin Home", href: "/admin", icon: Shield },
    { name: "KYC & Vetting", href: "/admin/kyc", icon: ShieldCheck },
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

// Mapping roles to their dashboard home routes & user identity (9 Portals)
const roleHomes: Record<string, { label: string; roleName: string; route: string; email: string }> = {
  properties: { label: "Property Owner (SaaS)", roleName: "Property Owner", route: "/properties", email: "owner@officex.in" },
  ops: { label: "Facility Manager (Ops)", roleName: "Facility Manager", route: "/ops", email: "facilitymanager@officex.in" },
  tenant: { label: "Tenant Admin (Portal)", roleName: "Tenant Admin", route: "/tenant", email: "tenant@officex.in" },
  vendor: { label: "Service Vendor (Hub)", roleName: "Service Vendor", route: "/vendor", email: "vendor@officex.in" },
  leasing: { label: "Leasing Broker (CRM)", roleName: "Leasing Broker", route: "/leasing", email: "broker@officex.in" },
  marketplace: { label: "FM Procurement (Marketplace)", roleName: "Procurement Lead", route: "/marketplace", email: "procurement@officex.in" },
  admin: { label: "Super Admin (Console)", roleName: "Super Admin", route: "/admin", email: "admin@officex.in" },
  reporting: { label: "Auditor / Analyst (BI)", roleName: "Auditor / Analyst", route: "/reporting", email: "auditor@officex.in" },
  public: { label: "Public Discovery (Portal)", roleName: "Public Discovery", route: "/public/search", email: "guest@officex.in" }
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
  "calq": "leasing"
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "rentroll";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("properties");
  const [userEmail, setUserEmail] = useState<string>("");
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({
    "Rent Roll Master": true
  });

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
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("officex_user_email");
      if (storedEmail) setUserEmail(storedEmail);

      const saved = localStorage.getItem("officex_active_portal");
      if (saved && roleHomes[saved]) {
        setSelectedRole(saved);
      }
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
        
        {/* Top Brand Logo & Workspace Context Switcher */}
        <div className="p-5 flex flex-col gap-3.5 border-b border-gray-100 bg-slate-50/50">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={45} 
              height={45} 
              className="object-contain group-hover:scale-105 transition-transform"
              style={{ width: "auto", height: "36px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={140} 
              height={36} 
              className="object-contain"
              style={{ width: "auto", height: "36px" }}
            />
          </Link>
          
          {/* Active Workspace Identity Card (Locked to Authenticated Role) */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
              <span>Active Workspace</span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified
              </span>
            </div>
            
            <div className="w-full px-3 py-2.5 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/80 via-white to-teal-50/30 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#0F8B7D] text-white flex items-center justify-center font-black text-[10px] shadow-2xs shrink-0">
                  {activeRole.roleName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-gray-900 truncate leading-tight">
                    {activeRole.label}
                  </span>
                  <span className="text-[10px] text-teal-700 font-bold truncate font-mono">
                    Devasya Gold · Ahmedabad
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-[#0F8B7D] shrink-0" />
            </div>
          </div>
        </div>

        {/* Clean, Role-Isolated Navigation (Left Panel Fixed, Scrollbar Hidden) */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-wider">
            {activeRole.roleName} Portal
          </div>

          {activeMenu.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isItemActive = hasSubItems
              ? pathname.startsWith("/properties/rent-roll")
              : pathname === item.href || (item.href !== `/${currentPortalKey}` && item.href !== "/properties" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isExpanded = expandedSubMenus[item.name] ?? (isItemActive || pathname.includes("/properties/rent-roll"));

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1 my-0.5">
                  <div
                    onClick={() => {
                      setExpandedSubMenus(prev => ({
                        ...prev,
                        [item.name]: !isExpanded
                      }));
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                      isItemActive
                        ? "bg-[#0F8B7D] text-white font-black shadow-sm"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    <Icon size={16} className={isItemActive ? "text-white" : "text-gray-500"} />
                    <span className="truncate flex-1 font-bold tracking-wide">{item.name}</span>
                    {isExpanded ? (
                      <ChevronDown size={14} className={isItemActive ? "text-white" : "text-gray-400"} />
                    ) : (
                      <ChevronRight size={14} className={isItemActive ? "text-white" : "text-gray-400"} />
                    )}
                  </div>

                  {/* Dropdown Sub-Items List */}
                  {isExpanded && item.subItems && (
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 flex flex-col gap-1 py-1 my-0.5 animate-in fade-in duration-150">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon || ChevronRight;
                        const isSubActive =
                          pathname === "/properties/rent-roll" && activeTabParam === sub.tabKey;

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

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              {activeRole.roleName[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold text-gray-900 leading-none truncate">{activeRole.roleName}</span>
              <span className="text-[10px] text-gray-400 mt-1 leading-none font-mono truncate">
                {userEmail || activeRole.email}
              </span>
            </div>
          </div>

          <Link href="/login" title="Logout" className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors shrink-0">
            <LogOut size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}

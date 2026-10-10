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

// 1. Role-Specific Menus (Strict namespace isolation per UX Spec §2.2 & §7.1)
const roleSpecificMenus: Record<string, MenuItem[]> = {
  // PROPERTY OWNER / LANDLORD (§3.1, §S-02)
  owner: [
    { name: "Portfolio Overview", href: "/dashboard/owner", icon: Layers },
    { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
    { name: "Contracts & Leases", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Approvals Inbox", href: "/approvals", icon: ShieldCheck },
    { name: "Stacking Plan (S-26)", href: "/operate/stacking", icon: Layers },
    { name: "Owner Statements (S-55)", href: "/operate/owner-statements", icon: Landmark },
    { name: "FM Delegation & Mandates", href: "/settings/delegation", icon: Briefcase },
    { name: "12-Mo Forecast (S-51)", href: "/operate/forecast", icon: Calendar },
    { name: "NOI & Property P&L", href: "/operate/pnl", icon: BarChart3 },
    { name: "MIS Investor Pack", href: "/operate/mis", icon: FileText },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle },
    { name: "Exceptions Centre", href: "/operate/exceptions", icon: AlertTriangle }
  ],

  // PROPERTY MANAGER / CENTRE MANAGER (§3.2, §S-03)
  property_manager: [
    { name: "PM Today Console", href: "/dashboard/pm", icon: ClipboardList },
    { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Space & Building Registry", href: "/properties/registry", icon: Building },
    { name: "Deals & Inquiries", href: "/operate/lease-crm", icon: Sparkles },
    { name: "New Contract Wizard", href: "/operate/contracts/new", icon: FileText },
    { name: "Active Contracts", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Expiry & Renewals (S-24)", href: "/operate/renewals", icon: Clock },
    { name: "Escalation Calendar (S-25)", href: "/operate/escalations", icon: TrendingUp },
    { name: "Stacking Plan (S-26)", href: "/operate/stacking", icon: Layers },
    { name: "Invoices & Billing", href: "/operate/invoices", icon: DollarSign },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle },
    { name: "Disputes & Claims", href: "/operate/disputes", icon: ShieldCheck },
    { name: "Security Deposits (S-47)", href: "/operate/deposits", icon: Landmark },
    { name: "Utility Meters (S-31)", href: "/properties/rent-roll?tab=meter-readings", icon: Zap },
    { name: "Exceptions Centre", href: "/operate/exceptions", icon: AlertTriangle }
  ],

  // FACILITY MANAGER (§3.6, §S-03 FM)
  facility_manager: [
    { name: "FM Command Centre", href: "/dashboard/fm", icon: ClipboardList },
    { name: "Utility Meter Readings", href: "/properties/rent-roll?tab=meter-readings", icon: Zap },
    { name: "CAM Pools & True-Up", href: "/operate/cam-pools", icon: Sparkles },
    { name: "Helpdesk & Work Orders", href: "/ops/helpdesk", icon: AlertTriangle },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar },
    { name: "Asset Register & Health", href: "/ops/assets", icon: Settings },
    { name: "Space & Building Directory", href: "/properties/registry", icon: Building },
    { name: "Service Disputes (S-46)", href: "/operate/disputes", icon: ShieldCheck },
    { name: "Statutory Compliance", href: "/ops/compliance", icon: ShieldCheck },
    { name: "Exceptions Centre", href: "/operate/exceptions", icon: AlertTriangle }
  ],

  // FINANCE / AR MANAGER (§3.4, §S-05)
  finance_manager: [
    { name: "Finance Dashboard", href: "/dashboard/finance", icon: BarChart3 },
    { name: "Approvals Inbox", href: "/approvals", icon: ShieldCheck },
    { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Contracts Review", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Billing Runs & Invoices", href: "/operate/invoices", icon: DollarSign },
    { name: "Credit Notes (S-42)", href: "/operate/credit-notes", icon: FileText },
    { name: "Payments Centre", href: "/operate/payments", icon: CreditCard },
    { name: "Bank Reconciler (RR-INT-02)", href: "/operate/sync/bank-reconcile", icon: Landmark },
    { name: "Tally ERP Sync (RR-INT-01)", href: "/operate/sync/tally", icon: Database },
    { name: "Ageing & Collections", href: "/operate/collections", icon: AlertTriangle },
    { name: "Security Deposits (S-47)", href: "/operate/deposits", icon: Landmark },
    { name: "Month-End Snapshots", href: "/operate/snapshots", icon: ShieldCheck },
    { name: "Property P&L", href: "/operate/pnl", icon: BarChart3 },
    { name: "MIS Investor Pack", href: "/operate/mis", icon: FileText },
    { name: "Billing Entities & Setup", href: "/settings", icon: Settings }
  ],

  // LEASING MANAGER (§3.3, §S-04)
  leasing_manager: [
    { name: "Leasing Dashboard", href: "/dashboard/leasing", icon: TrendingUp },
    { name: "Deals CRM & Inquiries", href: "/operate/lease-crm", icon: Sparkles },
    { name: "Stacking Plan & Vacancy", href: "/operate/stacking", icon: Layers },
    { name: "Expiry Pipeline & Renewals", href: "/operate/renewals", icon: Clock },
    { name: "Rent Roll (Rates Masked)", href: "/properties/rent-roll?tab=rentroll", icon: FileText },
    { name: "Proposals & Contracts", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Space Listings Builder", href: "/leasing/listings", icon: Sparkles },
    { name: "Exceptions Centre", href: "/operate/exceptions", icon: AlertTriangle }
  ],

  // FLEX & COWORKING OPERATOR (§S-57)
  flex_operator: [
    { name: "Head Leases & Centre P&L", href: "/operate/head-leases", icon: TrendingUp },
    { name: "Seat Inventory & Plans", href: "/operate/seats", icon: Layers },
    { name: "Rent Roll Master", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Stacking Plan (S-26)", href: "/operate/stacking", icon: Layers },
    { name: "Billing & Invoices", href: "/operate/invoices", icon: DollarSign },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle }
  ],

  // CORPORATE TENANT / OCCUPANT (§3.5, §T-01…T-08)
  tenant: [
    { name: "Tenant Workplace", href: "/portal", icon: Building },
    { name: "Invoices & Settlement", href: "/portal/invoices", icon: DollarSign },
    { name: "Payments & Tax Receipts", href: "/portal/payments", icon: CreditCard },
    { name: "Raise Dispute (T-05)", href: "/portal/disputes", icon: AlertTriangle },
    { name: "My Lease Contract", href: "/portal/contracts", icon: FileText },
    { name: "Lease Documents", href: "/portal/documents", icon: FolderOpen },
    { name: "Contacts & Sub-Users", href: "/portal/sub-users", icon: Users }
  ],

  // OCCUPANT ALIAS
  occupant: [
    { name: "Tenant Workplace", href: "/portal", icon: Building },
    { name: "Invoices & Settlement", href: "/portal/invoices", icon: DollarSign },
    { name: "Payments & Tax Receipts", href: "/portal/payments", icon: CreditCard },
    { name: "Raise Dispute (T-05)", href: "/portal/disputes", icon: AlertTriangle },
    { name: "My Lease Contract", href: "/portal/contracts", icon: FileText },
    { name: "Lease Documents", href: "/portal/documents", icon: FolderOpen },
    { name: "Contacts & Sub-Users", href: "/portal/sub-users", icon: Users }
  ],

  // ORGANISATION ADMIN / SYSTEM GOVERNANCE (§3.6)
  org_admin: [
    { name: "Executive Portfolio", href: "/dashboard/owner", icon: Layers },
    { name: "Rent Roll Master", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
    { name: "Deal Register", href: "/operate/lease-crm", icon: Sparkles },
    { name: "Contracts & Leases", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Billing Runs & Invoices", href: "/operate/invoices", icon: DollarSign },
    { name: "Payments & Banking", href: "/operate/payments", icon: CreditCard },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle },
    { name: "FM Delegation & Mandates", href: "/settings/delegation", icon: Briefcase },
    { name: "Bulk Import Centre", href: "/operate/imports", icon: FolderOpen },
    { name: "Settings Master", href: "/settings", icon: Settings },
    { name: "System Audit Log", href: "/admin/audit", icon: ShieldCheck }
  ],

  // COMMERCIAL PORTFOLIO (DEFAULT COMPATIBILITY)
  properties: [
    { name: "Portfolio Overview", href: "/dashboard/owner", icon: Layers },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
    { 
      name: "Rent Roll Master", 
      href: "/properties/rent-roll?tab=dashboard", 
      icon: DollarSign,
      subItems: [
        { name: "Dashboard", href: "/dashboard/owner", tabKey: "dashboard", icon: Building },
        { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", tabKey: "rentroll", icon: FileText },
        { name: "Leasing CRM (S-18)", href: "/operate/lease-crm", tabKey: "lease-crm", icon: Sparkles },
        { name: "Billing & Invoices", href: "/operate/invoices", tabKey: "invoices", icon: DollarSign },
        { name: "Payments & Allocations", href: "/operate/payments", tabKey: "payments", icon: CreditCard },
        { name: "Collections & Ageing", href: "/operate/collections", tabKey: "collections", icon: AlertTriangle },
        { name: "Credit Notes", href: "/operate/credit-notes", tabKey: "credit-notes", icon: FileText },
        { name: "Tenant Disputes", href: "/operate/disputes", tabKey: "disputes", icon: ShieldCheck },
        { name: "Utility Meters", href: "/properties/rent-roll?tab=meter-readings", tabKey: "meter-readings", icon: Zap },
        { name: "Escalation Calendar", href: "/operate/escalations", tabKey: "escalations", icon: TrendingUp },
        { name: "Renewals Pipeline", href: "/operate/renewals", tabKey: "renewals", icon: Clock },
        { name: "Bulk Import Centre", href: "/operate/imports", tabKey: "imports", icon: FolderOpen },
        { name: "Stacking Plan", href: "/operate/stacking", tabKey: "stacking", icon: Layers },
        { name: "Owner Statements", href: "/operate/owner-statements", tabKey: "owner-statements", icon: Landmark },
        { name: "Client Mandates / Delegation", href: "/settings/delegation", tabKey: "mandates", icon: Briefcase },
        { name: "Head Leases & Flex", href: "/operate/head-leases", tabKey: "head-leases", icon: TrendingUp },
        { name: "12-Mo Forecast", href: "/operate/forecast", tabKey: "forecast", icon: Calendar },
        { name: "NOI & P&L", href: "/operate/pnl", tabKey: "pnl", icon: BarChart3 },
        { name: "Exceptions", href: "/operate/exceptions", tabKey: "exceptions", icon: AlertTriangle },
        { name: "Month-End Lock", href: "/operate/snapshots", tabKey: "snapshots", icon: ShieldCheck },
        { name: "MIS Investor Pack", href: "/operate/mis", tabKey: "mis", icon: FileText },
        { name: "CAM Pools & True-Up", href: "/operate/cam-pools", tabKey: "cam-pools", icon: Sparkles },
        { name: "Settings Master", href: "/settings", tabKey: "settings", icon: Settings },
        { name: "Tally ERP Sync", href: "/operate/sync/tally", tabKey: "tally-sync", icon: Database },
        { name: "Bank Reconciler", href: "/operate/sync/bank-reconcile", tabKey: "bank-reconcile", icon: Landmark }
      ]
    },
    { name: "Banking & Accounting", href: "/properties/banking", icon: Landmark },
    { name: "Statutory Compliance", href: "/properties/compliance", icon: ShieldCheck }
  ],

  // FACILITY MANAGER (FM OPS)
  ops: [
    { name: "FM Command Centre", href: "/dashboard/fm", icon: ClipboardList },
    { name: "Helpdesk Tickets", href: "/ops/helpdesk", icon: AlertTriangle },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar },
    { name: "Asset Register & Health", href: "/ops/assets", icon: Settings },
    { name: "Outcome-Based FM", href: "/ops/outcomes", icon: Activity },
    { name: "Visitor & Speed-Gates", href: "/ops/visitors", icon: Users },
    { name: "Compliance Centre", href: "/ops/compliance", icon: ShieldCheck }
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
    { name: "Broker Dashboard", href: "/dashboard/leasing", icon: TrendingUp },
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
    { name: "Executive Portfolio", href: "/dashboard/owner", icon: Layers },
    { name: "Governance Console", href: "/admin", icon: Shield },
    { name: "KYC & Vetting", href: "/admin/kyc", icon: ShieldCheck },
    { name: "FM Delegation & Mandates", href: "/settings/delegation", icon: Briefcase },
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
  owner: { label: "Owner & Principal", roleName: "Owner / Landlord", route: "/dashboard/owner" },
  property_manager: { label: "Property Management", roleName: "Property Manager", route: "/dashboard/pm" },
  facility_manager: { label: "Facility Operations", roleName: "Facility Manager", route: "/dashboard/fm" },
  finance_manager: { label: "Finance & Accounts", roleName: "Finance Manager", route: "/dashboard/finance" },
  leasing_manager: { label: "Commercial Leasing", roleName: "Leasing Manager", route: "/dashboard/leasing" },
  flex_operator: { label: "Flex & Coworking", roleName: "Flex Operator", route: "/operate/head-leases" },
  tenant: { label: "Corporate Workplace", roleName: "Corporate Workplace", route: "/portal" },
  occupant: { label: "Corporate Workplace", roleName: "Corporate Workplace", route: "/portal" },
  org_admin: { label: "Executive Control", roleName: "Organisation Admin", route: "/dashboard/owner" },
  admin: { label: "Executive Control", roleName: "Executive Control", route: "/admin" },
  properties: { label: "Commercial Portfolio", roleName: "Commercial Portfolio", route: "/dashboard/owner" },
  ops: { label: "Facility Management", roleName: "Facility Management", route: "/dashboard/fm" },
  vendor: { label: "Facility Services", roleName: "Facility Services", route: "/vendor" },
  leasing: { label: "Commercial Leasing", roleName: "Commercial Leasing", route: "/dashboard/leasing" },
  marketplace: { label: "FM Procurement", roleName: "FM Procurement", route: "/marketplace" },
  reporting: { label: "Workplace Analytics", roleName: "Workplace Analytics", route: "/reporting" },
  public: { label: "Commercial Discovery", roleName: "Commercial Discovery", route: "/public/search" }
};

// Mapping alias paths to corresponding portal keys
const pathPortalAliases: Record<string, string> = {
  "fm-marketplace": "marketplace",
  "portfolio": "properties",
  "property": "properties",
  "compliance": "properties",
  "operations": "facility_manager",
  "reports": "reporting",
  "discover": "public",
  "calq": "leasing_manager",
  "operate": "properties"
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "rentroll";

  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("owner");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [orgDisplayName, setOrgDisplayName] = useState<string>("");
  const [orgCity, setOrgCity] = useState<string>("");
  const [orgLogo, setOrgLogo] = useState<string>("");
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({});

  // Synchronously compute active portal from URL first
  const findPortalKey = (path: string): string | undefined => {
    if (path === "/dashboard/owner" || path.startsWith("/dashboard/owner/")) return "owner";
    if (path === "/dashboard/pm" || path.startsWith("/dashboard/pm/")) return "property_manager";
    if (path === "/dashboard/fm" || path.startsWith("/dashboard/fm/")) return "facility_manager";
    if (path === "/dashboard/leasing" || path.startsWith("/dashboard/leasing/")) return "leasing_manager";
    if (path === "/dashboard/finance" || path.startsWith("/dashboard/finance/")) return "finance_manager";
    if (path.startsWith("/portal") || path.startsWith("/tenant")) return "tenant";
    if (path.startsWith("/ops")) return "facility_manager";
    if (path.startsWith("/leasing")) return "leasing_manager";
    if (path.startsWith("/marketplace")) return "marketplace";
    if (path.startsWith("/vendor")) return "vendor";
    if (path.startsWith("/admin")) return "org_admin";
    if (path.startsWith("/public")) return "public";
    return undefined;
  };

  const matchedFromPath = findPortalKey(pathname);
  const currentPortalKey = matchedFromPath || selectedRole || "owner";

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      if (storedName) setUserName(storedName);

      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");
      if (storedEmail) setUserEmail(storedEmail);

      const storedRoleKey = localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key");
      if (storedRoleKey && (roleHomes[storedRoleKey] || roleSpecificMenus[storedRoleKey])) {
        setSelectedRole(storedRoleKey);
      } else {
        const saved = localStorage.getItem("officex_active_portal");
        if (saved && (roleHomes[saved] || roleSpecificMenus[saved])) {
          setSelectedRole(saved);
        }
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
    const handleRoleUpdate = (e: any) => {
      const rKey = e.detail?.roleKey;
      if (rKey && (roleHomes[rKey] || roleSpecificMenus[rKey])) {
        setSelectedRole(rKey);
      }
    };
    window.addEventListener("officex-role-change", handleRoleUpdate);
    return () => window.removeEventListener("officex-role-change", handleRoleUpdate);
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

  const activeRole = roleHomes[currentPortalKey] || roleHomes.owner;
  const activeMenu = roleSpecificMenus[currentPortalKey] || roleSpecificMenus.owner;

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

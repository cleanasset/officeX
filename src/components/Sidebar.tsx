"use client";
import React, { useState, useEffect, Suspense } from "react";
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
  Lock,
  Menu,
  Plus,
  ExternalLink,
  X
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
  section?: string;
  requiresSubscription?: boolean;
  subItems?: SubMenuItem[];
}

// 1. Reusable Owner & Landlord Menu Items
const ownerMenuItems: MenuItem[] = [
  { name: "Portfolio Overview", href: "/dashboard/owner", icon: Layers, section: "Portfolio Assets" },
  { name: "Property Registry", href: "/properties/registry", icon: Building },
  { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
  { name: "Contracts & Leases", href: "/contracts", icon: FileText },
  { name: "Property Delegation", href: "/settings/delegation", icon: Briefcase },

  {
    name: "Rent Roll & Financials",
    href: "/properties/rent-roll",
    icon: DollarSign,
    badge: "PRO",
    requiresSubscription: true,
    section: "Pro Suite",
    subItems: [
      { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", tabKey: "rentroll", icon: DollarSign },
      { name: "Stacking Plan", href: "/operate/stacking", tabKey: "stacking", icon: Layers },
      { name: "Banking & ERP Invoicing", href: "/dashboard/owner/banking", tabKey: "banking", icon: Landmark },
      { name: "Owner Statements", href: "/operate/owner-statements", tabKey: "owner-statements", icon: FileText },
      { name: "Revenue Forecast", href: "/operate/forecast", tabKey: "forecast", icon: Calendar },
      { name: "NOI & Property P&L", href: "/operate/pnl", tabKey: "pnl", icon: BarChart3 },
      { name: "Investor Pack (MIS)", href: "/operate/mis", tabKey: "mis", icon: FileText },
      { name: "Collections & Aging", href: "/operate/collections", tabKey: "collections", icon: AlertTriangle },
      { name: "Exceptions Centre", href: "/operate/exceptions", tabKey: "exceptions", icon: AlertTriangle },
      { name: "Approvals Inbox", href: "/approvals", tabKey: "approvals", icon: ShieldCheck }
    ]
  }
];

// 2. Role-Specific Menus (Strict namespace isolation per UX Spec §2.2 & §7.1)
const roleSpecificMenus: Record<string, MenuItem[]> = {
  // PROPERTY OWNER / LANDLORD (§3.1, §S-02)
  owner: ownerMenuItems,

  // MARKETPLACE PROPERTY OWNER / OPERATOR (Property Discovery & Listing Partner)
  marketplace_owner: [
    { name: "Marketplace Dashboard", href: "/marketplace/dashboard", icon: Layers },
    { name: "My Listed Spaces", href: "/marketplace/dashboard", icon: Building },
    { name: "Inbound Leads & RFQs", href: "/marketplace/dashboard", icon: Users },
    { name: "Site Visits Calendar", href: "/marketplace/dashboard", icon: Calendar },
    { name: "List New Workspace", href: "/marketplace/list-space", icon: Plus, badge: "New" },
    { name: "Public Marketplace", href: "/marketplace", icon: ExternalLink }
  ],

  // PROPERTY MANAGER / THIRD-PARTY MANAGING ENTITY (Strict Delegated Rent & Centre Operations)
  property_manager: [
    { name: "PM Today Console", href: "/dashboard/pm", icon: ClipboardList, section: "Operational Overview" },
    { name: "Space & Building Registry", href: "/properties/registry", icon: Building },
    { name: "Active Leases", href: "/contracts", icon: FileText },
    { name: "Expiry & Renewals", href: "/operate/renewals", icon: Clock },
    { name: "Rent Escalations", href: "/operate/escalations", icon: TrendingUp },
    { name: "Invoices & Billing", href: "/operate/invoices", icon: DollarSign, section: "Rent & Collections" },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle },
    { name: "Utility Meters", href: "/properties/rent-roll?tab=meter-readings", icon: Zap }
  ],

  // FACILITY MANAGER (§3.6, §S-03 FM)
  facility_manager: [
    { name: "FM Command Centre", href: "/dashboard/fm", icon: ClipboardList, section: "Operations" },
    { name: "Utility Meter Readings", href: "/properties/rent-roll?tab=meter-readings", icon: Zap },
    { name: "CAM Pools & True-Up", href: "/operate/cam-pools", icon: Sparkles },
    { name: "Helpdesk & Work Orders", href: "/ops/helpdesk", icon: AlertTriangle },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar },
    { name: "Asset Register & Health", href: "/ops/assets", icon: Settings },
    { name: "Space & Building Directory", href: "/properties/registry", icon: Building },
    { name: "Service Disputes", href: "/operate/disputes", icon: ShieldCheck },
    { name: "Statutory Compliance", href: "/ops/compliance", icon: ShieldCheck },
    { name: "Exceptions Centre", href: "/operate/exceptions", icon: AlertTriangle }
  ],

  // FINANCE / AR MANAGER (§3.4, §S-05)
  finance_manager: [
    { name: "Finance Dashboard", href: "/dashboard/finance", icon: BarChart3, section: "Finance & Accounts" },
    { name: "Approvals Inbox", href: "/approvals", icon: ShieldCheck },
    { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Contracts Review", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Billing Runs & Invoices", href: "/operate/invoices", icon: DollarSign },
    { name: "Credit Notes", href: "/operate/credit-notes", icon: FileText },
    { name: "Payments Centre", href: "/operate/payments", icon: CreditCard },
    { name: "Bank Reconciliation", href: "/operate/sync/bank-reconcile", icon: Landmark },
    { name: "Tally ERP Sync", href: "/operate/sync/tally", icon: Database },
    { name: "Ageing & Collections", href: "/operate/collections", icon: AlertTriangle },
    { name: "Security Deposits", href: "/operate/deposits", icon: Landmark },
    { name: "Month-End Snapshots", href: "/operate/snapshots", icon: ShieldCheck },
    { name: "Property P&L", href: "/operate/pnl", icon: BarChart3 },
    { name: "Investor Pack (MIS)", href: "/operate/mis", icon: FileText },
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
    { name: "Stacking Plan", href: "/operate/stacking", icon: Layers },
    { name: "Billing & Invoices", href: "/operate/invoices", icon: DollarSign },
    { name: "Collections & Aging", href: "/operate/collections", icon: AlertTriangle }
  ],

  // CORPORATE TENANT / OCCUPANT (§3.5, §T-01…T-08)
  tenant: [
    { name: "Tenant Workplace", href: "/portal", icon: Building },
    { name: "Invoices & Settlement", href: "/portal/invoices", icon: DollarSign },
    { name: "Payments & Tax Receipts", href: "/portal/payments", icon: CreditCard },
    { name: "Raise Dispute", href: "/portal/disputes", icon: AlertTriangle },
    { name: "My Lease Contract", href: "/portal/contracts", icon: FileText },
    { name: "Lease Documents", href: "/portal/documents", icon: FolderOpen },
    { name: "Contacts & Sub-Users", href: "/portal/sub-users", icon: Users }
  ],

  // OCCUPANT ALIAS
  occupant: [
    { name: "Tenant Workplace", href: "/portal", icon: Building },
    { name: "Invoices & Settlement", href: "/portal/invoices", icon: DollarSign },
    { name: "Payments & Tax Receipts", href: "/portal/payments", icon: CreditCard },
    { name: "Raise Dispute", href: "/portal/disputes", icon: AlertTriangle },
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
    { name: "Property Delegation", href: "/settings/delegation", icon: Briefcase },
    { name: "Bulk Import Centre", href: "/operate/imports", icon: FolderOpen },
    { name: "Settings Master", href: "/settings", icon: Settings },
    { name: "System Audit Log", href: "/admin/audit", icon: ShieldCheck }
  ],

  // CLIENT PRINCIPAL (Third-Party Property Owner §2.1 Segment B)
  client_principal: [
    { name: "My Managed Portfolio", href: "/dashboard/owner", icon: Layers, section: "Client Account" },
    { name: "Rent Roll Register", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
    { name: "Active Contracts", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Approvals Inbox", href: "/approvals", icon: ShieldCheck, section: "Approvals & Statements" },
    { name: "Owner Statements", href: "/operate/owner-statements", icon: FileText },
    { name: "Monthly MIS Pack", href: "/operate/mis", icon: FileText },
    { name: "Collections & Arrears", href: "/operate/collections", icon: AlertTriangle }
  ],

  // ASSET MANAGER (Commercial Oversight & Yield §3.1)
  asset_manager: [
    { name: "Portfolio Overview", href: "/dashboard/owner", icon: Layers, section: "Portfolio Assets" },
    { name: "Rent Roll Master", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Stacking & Vacancy", href: "/operate/stacking", icon: Layers },
    { name: "Contracts & Leases", href: "/properties/rent-roll?tab=contracts", icon: FileText },
    { name: "Approvals Inbox", href: "/approvals", icon: ShieldCheck, section: "Commercial Oversight" },
    { name: "Rent Escalations", href: "/operate/escalations", icon: TrendingUp },
    { name: "Expiry & Renewals", href: "/operate/renewals", icon: Clock },
    { name: "Revenue Forecast", href: "/operate/forecast", icon: Calendar, section: "Financial Yield" },
    { name: "NOI & Property P&L", href: "/operate/pnl", icon: BarChart3 },
    { name: "Investor MIS Pack", href: "/operate/mis", icon: FileText }
  ],

  // AUDITOR & COMPLIANCE (Read-Only Financial Records §5.14)
  auditor: [
    { name: "Audit Dashboard", href: "/reporting/mis", icon: ShieldCheck, section: "Compliance & Audit" },
    { name: "Rent Roll Register (Read)", href: "/properties/rent-roll?tab=rentroll", icon: DollarSign },
    { name: "Invoices & Lines", href: "/operate/invoices", icon: FileText },
    { name: "Payment Receipts", href: "/operate/payments", icon: CreditCard },
    { name: "Month-End Snapshots", href: "/operate/snapshots", icon: ShieldCheck },
    { name: "Immutable Audit Log", href: "/admin/audit", icon: ShieldCheck }
  ],

  // COMMERCIAL PORTFOLIO (ALIASES TO OWNER MENU)
  properties: ownerMenuItems,

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
    { name: "Search Spaces", href: "/marketplace/search", icon: Building },
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
  org_admin: { label: "Executive Control", roleName: "Organisation Admin", route: "/dashboard/owner" },
  client_principal: { label: "Client Principal", roleName: "Client Principal (3rd Party Owner)", route: "/dashboard/owner" },
  asset_manager: { label: "Asset Management", roleName: "Asset Manager", route: "/dashboard/owner" },
  property_manager: { label: "Property Management", roleName: "Property Manager", route: "/dashboard/pm" },
  facility_manager: { label: "Facility Operations", roleName: "Facility Manager", route: "/dashboard/fm" },
  finance_manager: { label: "Finance & Accounts", roleName: "Finance Manager", route: "/dashboard/finance" },
  leasing_manager: { label: "Commercial Leasing", roleName: "Leasing Manager", route: "/dashboard/leasing" },
  flex_operator: { label: "Flex & Coworking", roleName: "Flex Operator", route: "/operate/head-leases" },
  tenant: { label: "Corporate Workplace", roleName: "Corporate Workplace", route: "/portal" },
  occupant: { label: "Corporate Workplace", roleName: "Corporate Workplace", route: "/portal" },
  auditor: { label: "Auditor & Compliance", roleName: "Auditor", route: "/reporting/mis" },
  admin: { label: "Executive Control", roleName: "Executive Control", route: "/admin" },
  properties: { label: "Owner & Principal", roleName: "Owner / Landlord", route: "/dashboard/owner" },
  ops: { label: "Facility Management", roleName: "Facility Management", route: "/dashboard/fm" },
  vendor: { label: "Facility Services", roleName: "Facility Services", route: "/vendor" },
  leasing: { label: "Commercial Leasing", roleName: "Commercial Leasing", route: "/dashboard/leasing" },
  marketplace: { label: "FM Procurement", roleName: "FM Procurement", route: "/marketplace" },
  reporting: { label: "Workplace Analytics", roleName: "Workplace Analytics", route: "/reporting" },
  public: { label: "Commercial Discovery", roleName: "Commercial Discovery", route: "/marketplace/search" }
};

// Mapping alias paths to corresponding portal keys
const pathPortalAliases: Record<string, string> = {
  "fm-marketplace": "marketplace",
  "portfolio": "owner",
  "property": "owner",
  "properties": "owner",
  "compliance": "owner",
  "operations": "facility_manager",
  "reports": "reporting",
  "discover": "public",
  "calq": "leasing_manager",
  "operate": "owner"
};

function SidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "rentroll";

  const [isMounted, setIsMounted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("officex_subscription") || sessionStorage.getItem("officex_subscription");
      const st = localStorage.getItem("officex_subscription_status") || sessionStorage.getItem("officex_subscription_status");
      const o = localStorage.getItem("officex_owner_subscribed") || localStorage.getItem("officex_rentroll_subscribed");
      return s === "active" || st === "active" || o === "true";
    }
    return false;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("owner");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [orgDisplayName, setOrgDisplayName] = useState<string>("");
  const [orgCity, setOrgCity] = useState<string>("");
  const [orgLogo, setOrgLogo] = useState<string>("");
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("officex_expanded_submenus");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return { "Rent Roll & Financials": true };
  });

  // Synchronously compute active portal from URL first
  const findPortalKey = (path: string): string | undefined => {
    if (path === "/dashboard/owner" || path.startsWith("/dashboard/owner/")) return "owner";
    if (path.startsWith("/properties") || path.startsWith("/contracts") || path.startsWith("/settings/delegation")) return "owner";
    if (path === "/dashboard/pm" || path.startsWith("/dashboard/pm/")) return "property_manager";
    if (path === "/dashboard/fm" || path.startsWith("/dashboard/fm/")) return "facility_manager";
    if (path === "/dashboard/leasing" || path.startsWith("/dashboard/leasing/")) return "leasing_manager";
    if (path === "/dashboard/finance" || path.startsWith("/dashboard/finance/")) return "finance_manager";
    if (path.startsWith("/portal") || path.startsWith("/tenant")) return "tenant";
    if (path.startsWith("/ops")) return "facility_manager";
    if (path.startsWith("/leasing")) return "leasing_manager";
    if (path.startsWith("/marketplace")) return "marketplace";
    if (path.startsWith("/vendor")) return "vendor";
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/public")) return "public";
    return undefined;
  };

  const matchedFromPath = findPortalKey(pathname);
  const currentPortalKey = matchedFromPath || (selectedRole === "properties" ? "owner" : selectedRole) || "owner";

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      if (storedName) setUserName(storedName);

      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");
      if (storedEmail) setUserEmail(storedEmail);

      const storedRoleKey = localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key");
      const normalizedRole = (storedRoleKey === "properties" || !storedRoleKey) ? "owner" : storedRoleKey;
      if (normalizedRole && (roleHomes[normalizedRole] || roleSpecificMenus[normalizedRole])) {
        setSelectedRole(normalizedRole);
      } else {
        const saved = localStorage.getItem("officex_active_portal");
        const normalizedSaved = (saved === "properties" || !saved) ? "owner" : saved;
        if (normalizedSaved && (roleHomes[normalizedSaved] || roleSpecificMenus[normalizedSaved])) {
          setSelectedRole(normalizedSaved);
        }
      }

      // Load dynamic org identity from onboarding
      const storedOrgName = localStorage.getItem("officex_active_org") || localStorage.getItem("officex_org_name") || localStorage.getItem("officex_portfolio_name") || "";
      const storedOrgCity = localStorage.getItem("officex_org_city") || "";
      const storedOrgLogo = localStorage.getItem("officex_org_logo") || localStorage.getItem("officex_brand_logo") || "";
      if (storedOrgName) setOrgDisplayName(storedOrgName);
      if (storedOrgCity) setOrgCity(storedOrgCity);
      if (storedOrgLogo) setOrgLogo(storedOrgLogo);

      const userEmail = (localStorage.getItem("officex_user_email") || "").toLowerCase().trim();
      const isAdmin =
        userEmail === "admin@gmail.com" ||
        userEmail === "medistationlifecare@gmail.com" ||
        localStorage.getItem("officex_admin") === "1" ||
        localStorage.getItem("officex_role") === "super_admin";

      const storedSub =
        localStorage.getItem("officex_subscription") === "active" ||
        localStorage.getItem("officex_subscription_status") === "active" ||
        localStorage.getItem("officex_owner_subscribed") === "true" ||
        localStorage.getItem("officex_rentroll_subscribed") === "true";

      if (isAdmin || storedSub) {
        setIsSubscribed(true);
      } else if (userEmail) {
        fetch(`/api/subscription/status?email=${encodeURIComponent(userEmail)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.subscribed && d.plan !== "none" && d.plan !== "free") {
              setIsSubscribed(true);
              localStorage.setItem("officex_subscription", "active");
              localStorage.setItem("officex_subscription_status", "active");
              localStorage.setItem("officex_owner_subscribed", "true");
            } else if (storedSub) {
              setIsSubscribed(true);
            } else {
              setIsSubscribed(false);
            }
          })
          .catch(() => {
            if (storedSub) setIsSubscribed(true);
            else setIsSubscribed(false);
          });
      } else {
        setIsSubscribed(Boolean(storedSub));
      }
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

          {/* Mobile Drawer Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer active:scale-95 transition-all"
            title="Close Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Active Workspace Persona Card */}
        <div className="mx-3 mt-2.5 mb-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5 shrink-0 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={13} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Role</span>
            <span className="text-[11px] font-black text-slate-900 truncate">{activeRole.roleName || activeRole.label}</span>
          </div>
        </div>

        {/* Clean, Role-Isolated Navigation (Left Panel Fixed, Scrollbar Hidden) */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeMenu.map((item, idx) => {
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            const itemPath = item.href.split("?")[0];
            const isSubItemActive = Boolean(item.subItems?.some((sub) => {
              const subBase = sub.href.split("?")[0];
              return pathname === subBase || (subBase !== "/" && pathname.startsWith(subBase));
            }));
            const isItemActive = hasSubItems
              ? (pathname.startsWith(itemPath) || isSubItemActive)
              : pathname === item.href || (item.href !== `/${currentPortalKey}` && item.href !== "/properties" && pathname.startsWith(item.href));
            const Icon = item.icon;
            // Respect user toggle state stored in localStorage; otherwise auto-expand if active or Rent Roll suite
            const isExpanded = expandedSubMenus[item.name] !== undefined
              ? expandedSubMenus[item.name]
              : (isItemActive || item.name === "Rent Roll & Financials");

            return (
              <React.Fragment key={item.name}>
                {item.section && (
                  <div className={`px-2 text-[9.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ${idx > 0 ? "pt-3 pb-1 border-t border-slate-100/90 mt-1" : "pb-1"}`}>
                    <span>{item.section}</span>
                  </div>
                )}

                {hasSubItems ? (
                  <div className="flex flex-col gap-0.5 my-0.5">
                    <div
                      onClick={() => {
                        const nextVal = !isExpanded;
                        setExpandedSubMenus(prev => {
                          const updated = {
                            ...prev,
                            [item.name]: nextVal
                          };
                          try {
                            localStorage.setItem("officex_expanded_submenus", JSON.stringify(updated));
                          } catch (e) {}
                          return updated;
                        });
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                        isItemActive
                          ? "bg-[#0F8B7D] text-white font-black shadow-xs"
                          : item.requiresSubscription && !isSubscribed
                          ? "bg-amber-50/70 border border-amber-200/80 text-slate-800 hover:bg-amber-100/70"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 bg-transparent"
                      }`}
                    >
                      <Icon size={16} className={isItemActive ? "text-white shrink-0" : item.requiresSubscription && !isSubscribed ? "text-amber-700 shrink-0" : "text-slate-500 shrink-0"} />
                      <span className="truncate flex-1 font-bold tracking-tight">{item.name}</span>
                      {item.requiresSubscription && !isSubscribed ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                          <Lock size={9} className="text-amber-700" />
                          <span>PRO LOCKED</span>
                        </span>
                      ) : item.requiresSubscription && isSubscribed ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                          <CheckCircle size={9} className="text-emerald-700" />
                          <span>ACTIVE</span>
                        </span>
                      ) : item.badge && !isItemActive ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-50 text-teal-700 border border-teal-200/60 shrink-0">
                          {item.badge}
                        </span>
                      ) : null}
                      {isExpanded ? (
                        <ChevronDown size={14} className={isItemActive ? "text-white shrink-0" : "text-slate-400 shrink-0"} />
                      ) : (
                        <ChevronRight size={14} className={isItemActive ? "text-white shrink-0" : "text-slate-400 shrink-0"} />
                      )}
                    </div>

                    {/* Dropdown Sub-Items List */}
                    {isExpanded && item.subItems && (
                      <div className="ml-3 pl-2.5 border-l-2 border-slate-200 flex flex-col gap-0.5 py-1 my-0.5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 animate-in fade-in duration-150">
                        {item.requiresSubscription && !isSubscribed && (
                          <div className="p-2 mb-1.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[10px] text-amber-950 font-medium">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-amber-900">Requires Pro Plan:</span>
                              <Link
                                href="/properties/rent-roll"
                                className="px-2 py-0.5 rounded-md bg-[#0D7B6C] text-white font-black text-[9px] hover:bg-[#0A6357]"
                              >
                                Unlock
                              </Link>
                            </div>
                            <span className="text-[9px] text-amber-800 block mt-0.5">Rent Roll, Invoicing, Statements, P&amp;L, Forecast &amp; Aging</span>
                          </div>
                        )}
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon || ChevronRight;
                          const subPath = sub.href.split("?")[0];
                          const subTab = new URLSearchParams(sub.href.split("?")[1] || "").get("tab");
                          const isSubActive =
                            pathname === subPath && (!subTab || activeTabParam === subTab || (!searchParams.get("tab") && subTab === "dashboard" && subPath === "/properties/rent-roll") || (!searchParams.get("tab") && subTab === "banking" && subPath === "/properties/banking"));

                          return (
                            <Link
                              key={sub.name}
                              href={item.requiresSubscription && !isSubscribed ? `/properties/rent-roll?feature=${encodeURIComponent(sub.name)}` : sub.href}
                              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                                isSubActive
                                  ? "bg-teal-50 text-[#0F8B7D] font-extrabold shadow-2xs border border-teal-200/90"
                                  : "text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <SubIcon size={13} className={isSubActive ? "text-[#0F8B7D] shrink-0" : "text-slate-400 shrink-0"} />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {item.requiresSubscription && !isSubscribed && (
                                <Lock size={10} className="text-slate-400 shrink-0" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.requiresSubscription && !isSubscribed ? `/properties/rent-roll?feature=${encodeURIComponent(item.name)}` : item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all relative group ${
                      isItemActive
                        ? "bg-[#0F8B7D] text-white font-bold shadow-xs"
                        : item.requiresSubscription && !isSubscribed
                        ? "text-slate-600 hover:bg-amber-50/60 hover:text-slate-900"
                        : "text-slate-700 font-semibold hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={16} className={isItemActive ? "text-white shrink-0" : item.requiresSubscription && !isSubscribed ? "text-slate-400 shrink-0" : "text-slate-400 group-hover:text-slate-600 shrink-0"} />
                    <span className="truncate flex-1 tracking-tight">{item.name}</span>
                    {item.requiresSubscription && !isSubscribed ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                        <Lock size={9} className="text-amber-600" />
                        <span>PRO</span>
                      </span>
                    ) : item.badge ? (
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                        isItemActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                    {isItemActive && !item.badge && !item.requiresSubscription && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    )}
                  </Link>
                )}
              </React.Fragment>
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

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-[260px] h-screen bg-white/95 border-r border-gray-200/80 fixed left-0 top-0 z-30 shrink-0" />}>
      <SidebarInner />
    </Suspense>
  );
}

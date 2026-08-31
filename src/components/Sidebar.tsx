"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Shield,
  Activity,
  CheckCircle,
  Truck
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

// 1. Role-Specific Menus (Strict namespace isolation per portal)
const roleSpecificMenus: Record<string, MenuItem[]> = {
  // PROPERTY OWNER / LANDLORD
  properties: [
    { name: "Portfolio Overview", href: "/properties", icon: Layers },
    { name: "Property Registry", href: "/properties/registry", icon: Building },
    { name: "Rent Roll Master", href: "/properties/rent-roll", icon: DollarSign },
    { name: "Collections & Invoices", href: "/properties/collections", icon: FileText },
    { name: "Statutory Compliance", href: "/properties/compliance", icon: ShieldCheck },
    { name: "Tenant Directory", href: "/properties/tenants", icon: Users }
  ],

  // FACILITY MANAGER (FM OPS)
  ops: [
    { name: "FM Command Centre", href: "/ops", icon: ClipboardList },
    { name: "Helpdesk Tickets", href: "/ops/helpdesk", icon: AlertTriangle },
    { name: "52-Week PPM Calendar", href: "/ops/ppm", icon: Calendar },
    { name: "Asset Register & Health", href: "/ops/assets", icon: Settings },
    { name: "Outcome-Based FM", href: "/ops/outcomes", icon: Activity },
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
    { name: "AI Predictive Engine", href: "/reporting/ai", icon: Cpu }
  ]
};

// Mapping roles to their dashboard home routes & user identity
const roleHomes: Record<string, { label: string; roleName: string; route: string; email: string }> = {
  properties: { label: "Property Owner (SaaS)", roleName: "Property Owner", route: "/properties", email: "owner@officex.in" },
  ops: { label: "Facility Manager (Ops)", roleName: "Facility Manager", route: "/ops", email: "facilitymanager@officex.in" },
  tenant: { label: "Tenant Admin (Portal)", roleName: "Tenant Admin", route: "/tenant", email: "tenant@officex.in" },
  vendor: { label: "Service Vendor (Hub)", roleName: "Service Vendor", route: "/vendor", email: "vendor@officex.in" },
  leasing: { label: "Leasing Broker (CRM)", roleName: "Leasing Broker", route: "/leasing", email: "broker@officex.in" },
  marketplace: { label: "FM Procurement (Marketplace)", roleName: "Procurement Lead", route: "/marketplace", email: "procurement@officex.in" },
  admin: { label: "Super Admin (Console)", roleName: "Super Admin", route: "/admin", email: "admin@officex.in" },
  reporting: { label: "Auditor / Analyst (BI)", roleName: "Auditor / Analyst", route: "/reporting", email: "auditor@officex.in" }
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPortalKey, setCurrentPortalKey] = useState<string>("properties");

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("officex-toggle-sidebar", handleToggle);
    return () => window.removeEventListener("officex-toggle-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);

    // Only update portal key if the URL strictly matches a top-level role domain
    const matchedRole = Object.keys(roleHomes).find(key => 
      pathname === `/${key}` || pathname.startsWith(`/${key}/`)
    );

    if (matchedRole) {
      setCurrentPortalKey(matchedRole);
      try {
        localStorage.setItem("officex_active_portal", matchedRole);
      } catch (e) {
        // ignore storage errors
      }
    } else {
      try {
        const saved = localStorage.getItem("officex_active_portal");
        if (saved && roleHomes[saved]) {
          setCurrentPortalKey(saved);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [pathname]);

  const activeRole = roleHomes[currentPortalKey] || roleHomes.properties;
  const activeMenu = roleSpecificMenus[currentPortalKey] || roleSpecificMenus.properties;

  const handleRoleChange = (key: string) => {
    setCurrentPortalKey(key);
    try {
      localStorage.setItem("officex_active_portal", key);
    } catch (e) {
      // ignore
    }
    const selected = roleHomes[key];
    router.push(selected.route);
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

      <div className={`w-[260px] h-screen bg-white border-r border-gray-100 flex flex-col justify-between fixed left-0 top-0 z-30 shrink-0 transition-transform duration-200 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Top Brand Logo & Workspace Context Switcher */}
        <div className="p-6 flex flex-col gap-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={95} 
              height={19} 
              className="object-contain"
            />
          </Link>
          
          {/* Workspace Context Role Switcher */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Workspace Context</label>
            <select 
              value={currentPortalKey}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-[#F9FAFB] hover:bg-gray-50 text-gray-800 focus:outline-none focus:border-[#0F8B7D] cursor-pointer transition-colors shadow-2xs"
            >
              <option value="properties">Property Owner (SaaS)</option>
              <option value="ops">Facility Manager (Ops)</option>
              <option value="tenant">Tenant Admin (Portal)</option>
              <option value="vendor">Service Vendor (Hub)</option>
              <option value="leasing">Leasing Broker (CRM)</option>
              <option value="marketplace">FM Procurement (Marketplace)</option>
              <option value="admin">Super Admin (Console)</option>
              <option value="reporting">Auditor / Analyst (BI)</option>
            </select>
          </div>
        </div>

        {/* Clean, Role-Isolated Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
          <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            {activeRole.roleName} Portal
          </div>

          {activeMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${currentPortalKey}` && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-teal-50 text-[#0F8B7D] font-black shadow-2xs border border-teal-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#0F8B7D]" : "text-gray-400"} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={13} className="ml-auto text-[#0F8B7D]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {activeRole.roleName[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900 leading-none">{activeRole.roleName}</span>
              <span className="text-[10px] text-gray-400 mt-0.5 leading-none">{activeRole.email}</span>
            </div>
          </div>

          <Link href="/login" title="Logout" className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <LogOut size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}

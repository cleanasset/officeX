"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  HelpCircle
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const menuConfigs: Record<string, { title: string; accentColor: string; items: MenuItem[]; user: { name: string; role: string } }> = {
  leasing: {
    title: "Leasing CRM",
    accentColor: "#2563EB", // Royal Blue
    items: [
      { name: "Dashboard", href: "/leasing", icon: Layers },
      { name: "Listings", href: "/leasing/listings", icon: Building },
      { name: "Leads & Enquiries", href: "/leasing/leads", icon: Users },
      { name: "Pipeline Board", href: "/leasing/pipeline", icon: TrendingUp },
      { name: "Site Visits", href: "/leasing/visits", icon: Calendar },
      { name: "LOI & Lease", href: "/leasing/loi", icon: FileText },
      { name: "Lease Registry", href: "/leasing/registry", icon: FolderOpen },
      { name: "Commission Tracker", href: "/leasing/commissions", icon: DollarSign }
    ],
    user: { name: "Ravi Menon", role: "Leasing Manager" }
  },
  marketplace: {
    title: "FM Marketplace",
    accentColor: "#0F8B7D", // Teal
    items: [
      { name: "Marketplace Home", href: "/marketplace", icon: Layers },
      { name: "RFQ Directory", href: "/marketplace/rfq", icon: FolderOpen },
      { name: "Quotations", href: "/marketplace/quotations", icon: FileText },
      { name: "Comparison Board", href: "/marketplace/compare", icon: TrendingUp },
      { name: "Work Orders", href: "/marketplace/work-orders", icon: ClipboardList },
      { name: "Payments & Escrow", href: "/marketplace/payments", icon: DollarSign },
      { name: "Vendor Ratings", href: "/marketplace/ratings", icon: Sparkles }
    ],
    user: { name: "Ramesh Kumar", role: "Procurement Lead" }
  },
  properties: {
    title: "Property SaaS",
    accentColor: "#8B5CF6", // Violet
    items: [
      { name: "Dashboard", href: "/properties", icon: Layers },
      { name: "Property Registry", href: "/properties/registry", icon: Building },
      { name: "Rent Roll", href: "/properties/rent-roll", icon: FileText },
      { name: "Rent Collection", href: "/properties/collections", icon: DollarSign },
      { name: "Tenant Directory", href: "/properties/tenants", icon: Users },
      { name: "Compliance Tracker", href: "/properties/compliance", icon: ShieldCheck }
    ],
    user: { name: "Rajesh Kumar", role: "Property Manager" }
  },
  vendor: {
    title: "Vendor Hub",
    accentColor: "#10B981", // Emerald
    items: [
      { name: "Dashboard", href: "/vendor", icon: Layers },
      { name: "Matched RFQs", href: "/vendor/rfqs", icon: Briefcase },
      { name: "Work Orders", href: "/vendor/work-orders", icon: ClipboardList },
      { name: "Invoices & Payouts", href: "/vendor/payouts", icon: DollarSign },
      { name: "Reviews & Ratings", href: "/vendor/reviews", icon: Sparkles }
    ],
    user: { name: "TechServe Solutions", role: "Verified FM Contractor" }
  },
  tenant: {
    title: "Tenant Portal",
    accentColor: "#A855F7", // Purple
    items: [
      { name: "Homepage", href: "/tenant", icon: Layers },
      { name: "Pay Rent", href: "/tenant/pay", icon: DollarSign },
      { name: "Helpdesk Creator", href: "/tenant/tickets/new", icon: HelpCircle },
      { name: "My Tickets", href: "/tenant/tickets", icon: Clock },
      { name: "Visitors", href: "/tenant/visitors", icon: Users },
      { name: "Document Locker", href: "/tenant/documents", icon: FolderOpen }
    ],
    user: { name: "Priya Sharma", role: "TCS Tenant Admin" }
  },
  admin: {
    title: "Admin Console",
    accentColor: "#EF4444", // Red
    items: [
      { name: "Dashboard", href: "/admin", icon: Layers },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "RBAC Config", href: "/admin/rbac", icon: ShieldCheck },
      { name: "Vendor KYC", href: "/admin/kyc", icon: Briefcase },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "AI Config", href: "/admin/ai", icon: Sparkles },
      { name: "Audit Logs", href: "/admin/logs", icon: ClipboardList }
    ],
    user: { name: "Amit Kumar", role: "Super Admin" }
  },
  ops: {
    title: "Operations Hub",
    accentColor: "#F59E0B", // Amber
    items: [
      { name: "Dashboard", href: "/ops", icon: Layers },
      { name: "Managed Contracts", href: "/ops/contracts", icon: Briefcase },
      { name: "Daily Activity", href: "/ops/activity", icon: ClipboardList },
      { name: "Staff Attendance", href: "/ops/attendance", icon: Users },
      { name: "SLA Monitor", href: "/ops/sla", icon: Clock },
      { name: "PPM Calendar", href: "/ops/ppm", icon: Calendar },
      { name: "Asset Registry", href: "/ops/assets", icon: Building }
    ],
    user: { name: "Vijay Dev", role: "Facility Manager" }
  },
  reporting: {
    title: "Metrics Console",
    accentColor: "#3B82F6", // Blue
    items: [
      { name: "MIS Generator", href: "/reporting", icon: FileText },
      { name: "Energy & Utility", href: "/reporting/utilities", icon: TrendingUp },
      { name: "ESG Reports", href: "/reporting/esg", icon: ShieldCheck },
      { name: "Financial Reports", href: "/reporting/financials", icon: DollarSign },
      { name: "AI Summaries", href: "/reporting/ai", icon: Sparkles }
    ],
    user: { name: "Amit Kumar", role: "Platform Auditor" }
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  
  // Detect current portal module from pathname
  const portalKey = Object.keys(menuConfigs).find(key => pathname.startsWith(`/${key}`)) || "properties";
  const config = menuConfigs[portalKey];

  return (
    <div className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0 z-30 shrink-0">
      
      {/* Top Brand Logo */}
      <div className="p-6 flex flex-col gap-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
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
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-600">
          {config.title}
        </span>
      </div>

      {/* Nav Items List */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {config.items.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-[#F0FDFA] text-[#0F8B7D] border-l-4 border-[#0F8B7D]" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#0F8B7D]" : "text-gray-600"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-gray-800 text-sm">
            {config.user.name[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">{config.user.name}</span>
            <span className="text-[10px] text-gray-600 font-bold">{config.user.role}</span>
          </div>
        </div>
        <Link href="/" className="text-gray-500 hover:text-[#0F8B7D] transition-colors">
          <LogOut size={16} />
        </Link>
      </div>

    </div>
  );
}

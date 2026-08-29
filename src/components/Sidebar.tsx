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
  Cpu
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  subItems?: { name: string; href: string }[];
}

// Option-3 Sitemap structured unified categories
const unifiedMenu: MenuItem[] = [
  {
    name: "Home",
    href: "/properties", // Default home, dynamically adjusted in code
    icon: Layers
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: Building,
    subItems: [
      { name: "Marketplace Home", href: "/marketplace" },
      { name: "RFQ Directory", href: "/marketplace/rfq" },
      { name: "Compare Quotes", href: "/marketplace/compare" }
    ]
  },
  {
    name: "Transactions",
    href: "/leasing/pipeline",
    icon: TrendingUp,
    subItems: [
      { name: "Leasing Pipeline", href: "/leasing/pipeline" },
      { name: "Leads & Enquiries", href: "/leasing/leads" },
      { name: "LOI & Leases", href: "/leasing/loi" }
    ]
  },
  {
    name: "Workspace",
    href: "/properties/registry",
    icon: MapPin,
    subItems: [
      { name: "Property Registry", href: "/properties/registry" },
      { name: "Tenant Directory", href: "/properties/tenants" }
    ]
  },
  {
    name: "Operations",
    href: "/ops",
    icon: ClipboardList,
    subItems: [
      { name: "FM Command Centre", href: "/ops" },
      { name: "PPM Calendar", href: "/ops/ppm" },
      { name: "Compliance Centre", href: "/properties/compliance" }
    ]
  },
  {
    name: "Assets",
    href: "/ops/assets",
    icon: Settings,
    subItems: [
      { name: "Asset Register", href: "/ops/assets" }
    ]
  },
  {
    name: "Vendors",
    href: "/vendor",
    icon: Briefcase,
    subItems: [
      { name: "Vendor Dashboard", href: "/vendor" },
      { name: "Work Orders", href: "/vendor/work-orders" }
    ]
  },
  {
    name: "Commercial",
    href: "/properties/rent-roll",
    icon: DollarSign,
    subItems: [
      { name: "Rent Roll Ledger", href: "/properties/rent-roll" },
      { name: "Payments & Escrow", href: "/marketplace/payments" }
    ]
  },
  {
    name: "Intelligence",
    href: "/reporting",
    icon: Sparkles,
    subItems: [
      { name: "Workplace Analytics", href: "/reporting" },
      { name: "AI Settings", href: "/admin/ai" }
    ]
  }
];

// Mapping roles to their dashboard home routes
const roleHomes: Record<string, { label: string; route: string; email: string }> = {
  properties: { label: "Property Owner", route: "/properties", email: "owner@officex.in" },
  ops: { label: "Facility Manager", route: "/ops", email: "facilitymanager@officex.in" },
  tenant: { label: "Tenant Admin", route: "/tenant", email: "tenant@officex.in" },
  vendor: { label: "Service Vendor", route: "/vendor", email: "vendor@officex.in" },
  leasing: { label: "Leasing Broker", route: "/leasing", email: "broker@officex.in" },
  admin: { label: "Super Admin", route: "/admin", email: "admin@officex.in" },
  reporting: { label: "Auditor / Analyst", route: "/reporting", email: "auditor@officex.in" }
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("officex-toggle-sidebar", handleToggle);
    return () => window.removeEventListener("officex-toggle-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Determine active portal context based on active route
  const currentPortalKey = Object.keys(roleHomes).find(key => pathname.startsWith(`/${key}`)) || "properties";
  const activeRole = roleHomes[currentPortalKey];

  // Adjust "Home" route based on currently chosen portal context
  unifiedMenu[0].href = activeRole.route;

  const handleRoleChange = (key: string) => {
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
        
        {/* Top Brand Logo */}
        <div className="p-6 flex flex-col gap-4 border-b border-gray-100">
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
          
          {/* Option-3 Premium Shell Switcher */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Workspace Context</label>
            <select 
              value={currentPortalKey}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-[#F9FAFB] hover:bg-gray-50 text-gray-800 focus:outline-none focus:border-[#2563EB] cursor-pointer transition-colors shadow-xs"
            >
              <option value="properties">Property Owner (SaaS)</option>
              <option value="ops">Facility Manager (Ops)</option>
              <option value="tenant">Tenant Admin (Portal)</option>
              <option value="vendor">Service Vendor (Hub)</option>
              <option value="leasing">Leasing Broker (CRM)</option>
              <option value="admin">Super Admin (Console)</option>
              <option value="reporting">Auditor / Analyst (Metrics)</option>
            </select>
          </div>
        </div>

        {/* Option-3 Unified Shell Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {unifiedMenu.map((item, idx) => {
            // Match active status
            const isHomeActive = item.name === "Home" && pathname === item.href;
            const isCategoryActive = item.name !== "Home" && (
              pathname.startsWith(item.href) || 
              (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)))
            );
            const isActive = isHomeActive || isCategoryActive;
            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isExpanded = activeTab === item.name || isActive;

            return (
              <div key={idx} className="flex flex-col gap-0.5">
                <Link 
                  href={item.href}
                  onClick={() => setActiveTab(activeTab === item.name ? "" : item.name)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#EFF6FF] text-[#2563EB] border-l-4 border-[#2563EB]" 
                      : "text-gray-600 hover:bg-[#F9FAFB] hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-[#2563EB]" : "text-gray-500"} />
                    <span>{item.name}</span>
                  </div>
                  {hasSub && (
                    <span className="text-[10px] text-gray-400 font-semibold opacity-70">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  )}
                </Link>

                {/* Submenu links */}
                {hasSub && isExpanded && (
                  <div className="pl-9 flex flex-col border-l border-gray-100 ml-5 my-0.5 gap-1.5 py-1">
                    {item.subItems?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`text-[11px] font-semibold transition-colors ${
                            isSubActive 
                              ? "text-[#2563EB] font-bold" 
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Card in OFFICEX Blue */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-[#2563EB] text-xs">
              {activeRole.label[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-gray-900 leading-tight">{activeRole.label}</span>
              <span className="text-[9px] text-gray-500 font-bold leading-none mt-0.5">{activeRole.email}</span>
            </div>
          </div>
          <Link href="/" className="text-gray-400 hover:text-[#2563EB] transition-colors" title="Sign Out">
            <LogOut size={15} />
          </Link>
        </div>

      </div>
    </>
  );
}


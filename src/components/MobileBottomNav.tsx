"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building, Layers, DollarSign, ShieldCheck, ClipboardList, 
  AlertTriangle, Calendar, Activity, MapPin, Users, HelpCircle, 
  Briefcase, Truck, Award, TrendingUp, FileText, Sparkles, 
  Menu, BarChart3, Shield, Cpu 
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const roleBottomTabs: Record<string, NavItem[]> = {
  properties: [
    { label: "Portfolio", href: "/properties", icon: Layers },
    { label: "Registry", href: "/properties/registry", icon: Building },
    { label: "Rent Roll", href: "/properties/rent-roll", icon: DollarSign },
    { label: "Compliance", href: "/properties/compliance", icon: ShieldCheck }
  ],
  ops: [
    { label: "Command", href: "/ops", icon: ClipboardList },
    { label: "Helpdesk", href: "/ops/helpdesk", icon: AlertTriangle },
    { label: "52w PPM", href: "/ops/ppm", icon: Calendar },
    { label: "Outcomes", href: "/ops/outcomes", icon: Activity }
  ],
  tenant: [
    { label: "Workplace", href: "/tenant", icon: Building },
    { label: "Desks", href: "/tenant/employee", icon: MapPin },
    { label: "Visitors", href: "/tenant/visitors", icon: Users },
    { label: "Invoices", href: "/tenant/payments", icon: DollarSign }
  ],
  leasing: [
    { label: "Dashboard", href: "/leasing", icon: TrendingUp },
    { label: "Pipeline", href: "/leasing/pipeline", icon: Layers },
    { label: "Leads", href: "/leasing/leads", icon: Users },
    { label: "LOI Room", href: "/leasing/loi", icon: FileText }
  ],
  marketplace: [
    { label: "Market", href: "/marketplace", icon: Building },
    { label: "RFQs", href: "/marketplace/rfq", icon: ClipboardList },
    { label: "Compare", href: "/marketplace/compare", icon: Award },
    { label: "Escrow", href: "/marketplace/payments", icon: DollarSign }
  ],
  vendor: [
    { label: "Hub", href: "/vendor", icon: Briefcase },
    { label: "Bidding", href: "/vendor/rfqs", icon: ClipboardList },
    { label: "Orders", href: "/vendor/work-orders", icon: Truck },
    { label: "Payouts", href: "/vendor/payments", icon: DollarSign }
  ],
  admin: [
    { label: "Console", href: "/admin", icon: Shield },
    { label: "KYC", href: "/admin/kyc", icon: ShieldCheck },
    { label: "Escrow", href: "/admin/escrow", icon: DollarSign },
    { label: "Users", href: "/admin/users", icon: Users }
  ],
  reporting: [
    { label: "Analytics", href: "/reporting", icon: BarChart3 },
    { label: "MIS", href: "/reporting/mis", icon: DollarSign },
    { label: "ESG", href: "/reporting/esg", icon: Sparkles },
    { label: "AI Insights", href: "/reporting/ai", icon: Cpu }
  ]
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activePortal, setActivePortal] = useState<string>("properties");

  useEffect(() => {
    const matched = Object.keys(roleBottomTabs).find(key => 
      pathname === `/${key}` || pathname.startsWith(`/${key}/`)
    );
    if (matched) {
      setActivePortal(matched);
    } else {
      try {
        const saved = localStorage.getItem("officex_active_portal");
        if (saved && roleBottomTabs[saved]) {
          setActivePortal(saved);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [pathname]);

  const tabs = roleBottomTabs[activePortal] || roleBottomTabs.properties;

  const handleToggleMenu = () => {
    window.dispatchEvent(new Event("officex-toggle-sidebar"));
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-area-pb">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive 
                ? "text-[#0F8B7D] font-black scale-105" 
                : "text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-teal-50" : ""}`}>
              <Icon size={18} className={isActive ? "text-[#0F8B7D]" : "text-gray-500"} />
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight leading-none">{tab.label}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle Tab */}
      <button
        onClick={handleToggleMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-semibold cursor-pointer active:scale-95 transition-transform"
      >
        <div className="p-1 rounded-xl bg-gray-50">
          <Menu size={18} className="text-gray-600" />
        </div>
        <span className="text-[9.5px] mt-0.5 tracking-tight leading-none">Menu</span>
      </button>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Receipt,
  TrendingUp,
  Zap,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  LogOut,
  Sparkles,
  UserCheck,
  Home
} from "lucide-react";
import Topbar from "@/components/Topbar";
import RoleSelectorModal, { SpecRoleItem } from "@/components/auth/RoleSelectorModal";
import SubscriptionGate from "@/components/SubscriptionGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeRoleLabel, setActiveRoleLabel] = useState("Owner / Client Principal");
  const [activeRoleKey, setActiveRoleKey] = useState("owner");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState<SpecRoleItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role");
      const storedKey = localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key");
      if (storedRole) setActiveRoleLabel(storedRole);
      if (storedKey) setActiveRoleKey(storedKey);
    }

    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) setRoles(data.roles);
      })
      .catch(() => {});
  }, [pathname]);

  const handleSelectRole = (role: SpecRoleItem) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_role", role.label);
      localStorage.setItem("officex_role_key", role.key);
      sessionStorage.setItem("officex_user_role", role.label);
      sessionStorage.setItem("officex_role_key", role.key);
      document.cookie = `officex_user_role=${encodeURIComponent(role.label)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_role_key=${encodeURIComponent(role.key)}; path=/; max-age=86400; SameSite=Lax`;
    }
    setActiveRoleLabel(role.label);
    setActiveRoleKey(role.key);
    setIsRoleModalOpen(false);
    router.push(role.dashboardUrl);
  };

  const navItems = [
    { label: "Owner (§S-02)", href: "/dashboard/owner", key: "owner", icon: Building2 },
    { label: "Property Mgr (§S-03)", href: "/dashboard/pm", key: "property_manager", icon: ClipboardList },
    { label: "Finance / AR (§S-05)", href: "/dashboard/finance", key: "finance_manager", icon: Receipt },
    { label: "Leasing (§S-04)", href: "/dashboard/leasing", key: "leasing_manager", icon: TrendingUp },
    { label: "Facility Mgr (§S-03)", href: "/dashboard/fm", key: "facility_manager", icon: Zap },
    { label: "Rent Roll Register (§S-10)", href: "/properties/rent-roll", key: "register", icon: Layers },
    { label: "Approvals Inbox (§S-06)", href: "/approvals", key: "approvals", icon: ShieldCheck },
  ];

  return (
    <SubscriptionGate portalName="Operational Dashboard" fallbackLandingPage="/operate">
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Topbar />

        {/* Role & Navigation Control Strip */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Active Role Selector Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Role View:
              </span>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100 text-xs font-bold shadow-2xs transition-colors cursor-pointer group"
              >
                <UserCheck size={14} className="text-[#0F8B7D]" />
                <span>{activeRoleLabel}</span>
                <ChevronDown size={13} className="text-teal-600 group-hover:text-teal-800" />
              </button>
              <span className="text-[11px] text-slate-600 hidden md:inline">
                (Click to switch role §5.14)
              </span>
            </div>

            {/* Quick Sub-Navigation by Role */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-[#0F8B7D] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Role Picker Modal */}
        <RoleSelectorModal
          isOpen={isRoleModalOpen}
          roles={roles}
          onSelectRole={handleSelectRole}
          onClose={() => setIsRoleModalOpen(false)}
          canDismiss={true}
        />

        {/* Main Dashboard Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </SubscriptionGate>
  );
}

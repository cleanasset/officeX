"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  QrCode,
  CheckCircle,
  Clock,
  UserCheck,
  UserPlus,
  LogOut,
  History,
  HardHat,
  Truck,
  Flame,
  ShieldAlert,
  BadgeAlert,
  FileCheck2,
  Calendar,
  FolderArchive,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Building,
  Wrench,
  Activity,
  Layers,
  Settings,
  CreditCard,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function VisitorComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("CyberCity Tech Tower A");
  const [activeMode, setActiveMode] = useState<"all" | "visitor" | "compliance">("all");
  const [currentTime, setCurrentTime] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigationSections: NavSection[] = [
    {
      title: "Core Overview",
      items: [
        {
          name: "Command Center",
          href: "/vc/dashboard",
          icon: LayoutDashboard,
          badge: "Live",
          badgeColor: "bg-emerald-500/20 text-emerald-400",
        },
      ],
    },
    {
      title: "Visitor Management (VC)",
      items: [
        {
          name: "Live Inside Campus",
          href: "/vc/visitors/live",
          icon: Users,
          badge: "3 Inside",
          badgeColor: "bg-blue-500/20 text-blue-400",
        },
        {
          name: "Pre-Register Visitor",
          href: "/vc/visitors/pre-register",
          icon: UserPlus,
        },
        {
          name: "Host Approvals",
          href: "/vc/visitors/approvals",
          icon: CheckCircle,
          badge: "1 Pending",
          badgeColor: "bg-amber-500/20 text-amber-400",
        },
        {
          name: "Reception Check-In",
          href: "/vc/visitors/check-in",
          icon: QrCode,
        },
        {
          name: "Walk-In Kiosk",
          href: "/vc/visitors/walk-in",
          icon: UserCheck,
        },
        {
          name: "Visitor Checkout",
          href: "/vc/visitors/checkout",
          icon: LogOut,
        },
        {
          name: "Visitor Master Log",
          href: "/vc/visitors",
          icon: History,
        },
        {
          name: "Contractors & Vendors",
          href: "/vc/visitors/contractor",
          icon: HardHat,
        },
        {
          name: "Delivery Register",
          href: "/vc/visitors/delivery",
          icon: Truck,
        },
        {
          name: "Emergency Roll Call",
          href: "/vc/visitors/emergency",
          icon: Flame,
          badge: "VC-13",
          badgeColor: "bg-rose-500/20 text-rose-400",
        },
        {
          name: "Security Watchlist",
          href: "/vc/visitors/watchlist",
          icon: ShieldAlert,
        },
        {
          name: "Pass & Badge Design",
          href: "/vc/badges",
          icon: BadgeAlert,
        },
      ],
    },
    {
      title: "Compliance & EHS (CM)",
      items: [
        {
          name: "Obligations Register",
          href: "/vc/compliance",
          icon: FileCheck2,
          badge: "94.5%",
          badgeColor: "bg-emerald-500/20 text-emerald-400",
        },
        {
          name: "Compliance Calendar",
          href: "/vc/compliance/calendar",
          icon: Calendar,
        },
        {
          name: "Evidence Vault",
          href: "/vc/compliance/evidence",
          icon: FolderArchive,
        },
        {
          name: "Audits & Checklists",
          href: "/vc/compliance/inspections",
          icon: ClipboardList,
        },
        {
          name: "Incident Register",
          href: "/vc/compliance/incidents",
          icon: AlertTriangle,
        },
        {
          name: "CAPA Management",
          href: "/vc/compliance/capa",
          icon: RotateCcw,
        },
        {
          name: "Permits to Work (PTW)",
          href: "/vc/compliance/permits",
          icon: Wrench,
        },
        {
          name: "Vendor Compliance",
          href: "/vc/compliance/vendor",
          icon: Users,
        },
        {
          name: "Asset Compliance",
          href: "/vc/compliance/assets",
          icon: Building,
        },
        {
          name: "Contract Compliance",
          href: "/vc/compliance/contracts",
          icon: FileCheck2,
        },
        {
          name: "Risk Heatmap",
          href: "/vc/compliance/risks",
          icon: Activity,
        },
        {
          name: "Audit Findings",
          href: "/vc/compliance/audit",
          icon: ShieldCheck,
        },
        {
          name: "Reports & MIS",
          href: "/vc/compliance/reports",
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      title: "System & Administration",
      items: [
        {
          name: "Settings & Workflows",
          href: "/vc/settings",
          icon: Settings,
        },
        {
          name: "Plan & Billing (₹999/mo)",
          href: "/vc/billing",
          icon: CreditCard,
          badge: "Active",
          badgeColor: "bg-blue-500/20 text-blue-400",
        },
      ],
    },
  ];

  const filteredSections = navigationSections.filter((section) => {
    if (activeMode === "visitor") {
      return section.title !== "Compliance & EHS (CM)";
    }
    if (activeMode === "compliance") {
      return section.title !== "Visitor Management (VC)";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Brand */}
          <Link href="/vc/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>OFFICEX</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  VISITOR & COMPLIANCE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Commercial Workplace Cloud</div>
            </div>
          </Link>

          {/* Property Switcher */}
          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              aria-label="Select Active Commercial Property"
              className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="CyberCity Tech Tower A">CyberCity Tech Tower A (Main)</option>
              <option value="One Horizon Center - Phase II">One Horizon Center - Phase II</option>
              <option value="Infinity Business Park">Infinity Business Park - Tower C</option>
            </select>
          </div>
        </div>

        {/* Center: Two-Mode Work Switcher (Visitor Flow vs Compliance Radar vs All-in-One) */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMode("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMode === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All-In-One
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("visitor")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === "visitor"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-blue-300"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Visitor Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("compliance")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === "compliance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Compliance Radar</span>
          </button>
        </div>

        {/* Live Gate Status Pill */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Turnstiles Online</span>
          <span className="text-slate-500 font-mono">| {currentTime}</span>
        </div>

        {/* Right Action Icons & Organization */}
        <div className="flex items-center gap-3">
          {/* Emergency Alert Quick Trigger Button */}
          <Link
            href="/vc/visitors/emergency"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all shadow-sm shadow-rose-900/40"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span className="hidden sm:inline">Emergency Roll Call</span>
          </Link>

          {/* Quick Pre-register CTA */}
          <Link
            href="/vc/visitors/pre-register"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pre-Register</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Real-Time Alerts</span>
                  <span className="text-[10px] text-blue-400 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Visitor Checked In</div>
                      <div className="text-[11px] text-slate-400">Vikram Malhotra arrived at Tower A Lobby for Arun Jaitley.</div>
                      <div className="text-[10px] text-slate-500 mt-1">45 mins ago</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Statutory Notice Due</div>
                      <div className="text-[11px] text-slate-400">Elevator inspection certificate renewal due in 12 days.</div>
                      <div className="text-[10px] text-slate-500 mt-1">2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Org & License Pill */}
          <Link
            href="/vc/billing"
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200 hidden md:inline">Commercial Pass</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded">₹999</span>
          </Link>
        </div>
      </header>

      {/* Main App Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-[#0A0E18] border-r border-slate-800/70 transition-all duration-200 select-none ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
                        {!sidebarCollapsed && <span>{item.name}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-tight ${
                            item.badgeColor || "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Collapse Toggle */}
          <div className="p-3 border-t border-slate-800/70 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="text-[11px] text-slate-500 font-mono">OFFICEX VC v1.0</div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs ml-auto"
              title="Toggle sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
            <div className="w-72 bg-[#0A0E18] h-full p-4 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Visitor & Compliance Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {filteredSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor || "bg-slate-800 text-slate-300"}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070A0F] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

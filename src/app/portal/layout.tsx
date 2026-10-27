"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Receipt,
  CreditCard,
  FileText,
  FolderLock,
  User,
  Menu,
  X,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Sparkles,
  Home,
  FileCheck,
  Download,
  Lock,
  LifeBuoy
} from "lucide-react";

import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [occupantsList, setOccupantsList] = useState<any[]>([]);
  const [selectedOccupantId, setSelectedOccupantId] = useState<string>("");
  const [currentOccupant, setCurrentOccupant] = useState<any>(null);
  const [outstandingAmount, setOutstandingAmount] = useState<number>(0);
  const [primaryContract, setPrimaryContract] = useState<any>(null);
  const [ownerSubscribed, setOwnerSubscribed] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const savedOccId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";
    loadPortalSummary(savedOccId || undefined);

    const handleOccChange = (e: any) => {
      loadPortalSummary(e.detail?.id);
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadPortalSummary(occId?: string) {
    try {
      const savedOccId = occId || (typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "");
      const authHeaders = getClientAuthHeaders();
      const url = savedOccId ? `/api/portal/summary?occupant_id=${savedOccId}` : `/api/portal/summary`;
      const res = await fetch(url, { headers: authHeaders });
      const json = await res.json();
      if (json.success) {
        if (json.owner_subscribed === false) {
          setOwnerSubscribed(false);
          setCheckingSubscription(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("officex_subscription");
            sessionStorage.removeItem("officex_subscription");
          }
          return;
        } else {
          setOwnerSubscribed(true);
        }

        setOccupantsList(json.occupants_list || []);
        setCurrentOccupant(json.occupant);
        if (json.contracts && json.contracts.length > 0) {
          setPrimaryContract(json.contracts[0]);
        }
        if (json.occupant?.id) {
          setSelectedOccupantId(json.occupant.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_tenant_occupant_id", json.occupant.id);
            if (json.occupant.occupant_name) {
              localStorage.setItem("officex_tenant_name", json.occupant.occupant_name);
            }
          }
        }
        setOutstandingAmount(json.summary?.total_outstanding_inr || 0);
      }
    } catch (e) {
      console.error("Failed to load portal summary", e);
    } finally {
      setCheckingSubscription(false);
    }
  }

  function handleSwitchOccupant(id: string) {
    setSelectedOccupantId(id);
    loadPortalSummary(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_tenant_occupant_id", id);
      window.dispatchEvent(new CustomEvent("occupantChanged", { detail: { id } }));
    }
  }

  const navLinks = [
    { href: "/portal", label: "Dashboard", icon: Home, badge: null },
    {
      href: "/portal/invoices",
      label: "Invoices & Pay",
      icon: Receipt,
      badge: outstandingAmount > 0 ? `₹${(outstandingAmount / 100000).toFixed(2)}L` : null,
      badgeColor: "bg-red-500 text-white"
    },
    { href: "/portal/payments", label: "Payments & Ledger", icon: CreditCard, badge: null },
    { href: "/portal/disputes", label: "Disputes & Support", icon: LifeBuoy, badge: null },
    { href: "/portal/contract", label: "My Lease Contract", icon: FileText, badge: "Active", badgeColor: "bg-emerald-500/20 text-emerald-400" },
    { href: "/portal/documents", label: "Documents & NOC", icon: FolderLock, badge: null },
    { href: "/portal/profile", label: "Profile & Contacts", icon: User, badge: null },
  ];

  const tenantDisplayName =
    currentOccupant?.occupant_name ||
    (typeof window !== "undefined" ? localStorage.getItem("officex_tenant_name") || localStorage.getItem("officex_user_name") : "") ||
    "Commercial Tenant";

  const assignedSpaceName = primaryContract
    ? `${primaryContract.property_name} · ${primaryContract.space_name}`
    : (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || localStorage.getItem("officex_selected_property") : "") || "Demised Commercial Property";

  if (ownerSubscribed === false) {
    const ownerName =
      (typeof window !== "undefined" &&
        (localStorage.getItem("officex_company_name") || localStorage.getItem("officex_brand_name"))) ||
      "Property Owner";
    const propertyName =
      (typeof window !== "undefined" && localStorage.getItem("officex_active_property")) ||
      "Commercial Property";

    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock size={30} />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
              Subscription Inactive
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rent Roll is Not Yet Subscribed by Property Owner
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              This tenant portal for <strong className="text-slate-900">{propertyName}</strong> cannot be opened because the property owner (<strong className="text-slate-900">{ownerName}</strong>) has not yet activated their OfficeX Rent Roll subscription.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Pending Activation Features:
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Commercial lease contracts &amp; demarcated space documents</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Monthly GST tax invoices &amp; automated rent demand notes</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Online payment settlement (NEFT, RTGS, Razorpay, UPI)</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Please contact your landlord or property management team and request them to activate their OfficeX Rent Roll subscription.
          </p>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition shadow-md shadow-teal-700/20 cursor-pointer"
            >
              Refresh Status
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* 1. Left Sidebar for Desktop (Width 260px) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white fixed inset-y-0 left-0 z-40 shadow-xl">
        {/* Brand & Logo Header */}
        <div className="p-5 border-b border-slate-800">
          <Link href="/portal" className="flex items-center gap-3 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={34} 
              height={34} 
              className="object-contain group-hover:scale-105 transition-transform shrink-0"
              style={{ width: "auto", height: "30px" }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">OFFICEX</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  TENANT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Self-Service Lease Portal</p>
            </div>
          </Link>
        </div>

        {/* Active Occupant & Space Identity Badge */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupant Space</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Lease" />
          </div>
          <p className="text-xs font-black text-white truncate" title={tenantDisplayName}>
            {tenantDisplayName}
          </p>
          <p className="text-[11px] text-indigo-300 font-semibold truncate" title={assignedSpaceName}>
            {assignedSpaceName}
          </p>
          {primaryContract?.chargeable_area_sqft && (
            <p className="text-[10px] text-slate-400">
              {Number(primaryContract.chargeable_area_sqft).toLocaleString("en-IN")} sq.ft. · Commercial
            </p>
          )}

          {/* Occupant Switcher Dropdown (if multiple) */}
          {occupantsList.length > 1 && (
            <div className="pt-1.5 border-t border-slate-700/50">
              <select
                value={selectedOccupantId}
                onChange={(e) => handleSwitchOccupant(e.target.value)}
                className="w-full text-[11px] font-bold text-slate-200 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer"
              >
                {occupantsList.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.occupant_name} {occ.property_name ? `· ${occ.property_name}` : `(${occ.occupant_code})`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${link.badgeColor || "bg-slate-800 text-slate-300"}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Balance & Action Widget */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            <span>Outstanding Balance</span>
            <ShieldCheck size={13} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white">
            ₹{Number(outstandingAmount).toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-slate-400">
            Due by <strong className="text-slate-200">31-Oct-2026</strong>
          </p>
          <Link
            href="/portal/invoices?action=pay"
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <CreditCard size={13} /> Settle Invoices
          </Link>
        </div>

        {/* User Footer Strip */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {tenantDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate font-semibold text-slate-300">{tenantDisplayName}</span>
          </div>
          <Link href="/portal/profile" className="text-slate-400 hover:text-white" title="Account Settings">
            <User size={14} />
          </Link>
        </div>
      </aside>

      {/* 2. Main Container with Sidebar Offset */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Brand Logo */}
            <Link href="/portal" className="md:hidden flex items-center gap-2">
              <Image 
                src="/logo-removebg-preview.png" 
                alt="OfficeX Logo" 
                width={26} 
                height={26} 
                className="object-contain"
                style={{ width: "auto", height: "24px" }}
              />
              <span className="font-black text-sm tracking-tight text-slate-900">OFFICEX</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                PORTAL
              </span>
            </Link>

            {/* Context Breadcrumb / Unit */}
            {primaryContract && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  Asset: {primaryContract.property_name || "Commercial Centre"}
                </span>
                <span>•</span>
                <span className="text-slate-600 font-bold">{primaryContract.space_name || primaryContract.space_code || "Unit Demarcated"}</span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Balance Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Balance:</span>
              <span className="text-xs font-black">
                ₹{Number(outstandingAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/portal/invoices?action=pay"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
            >
              <CreditCard size={13} /> Settle Due
            </Link>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              {tenantDisplayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-slate-900 text-white p-4 space-y-3 animate-in fade-in slide-in-from-top duration-150 z-30">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Image 
                src="/logo-removebg-preview.png" 
                alt="OfficeX Logo" 
                width={28} 
                height={28} 
                className="object-contain shrink-0"
                style={{ width: "auto", height: "26px" }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{tenantDisplayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{assignedSpaceName}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${
                      isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400 font-medium">
          <p>© 2026 OFFICEX Rent Roll. Commercial Tenant Portal — Bank-grade 256-bit SSL encrypted.</p>
        </footer>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";

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

  useEffect(() => {
    loadPortalSummary();
  }, []);

  async function loadPortalSummary(occId?: string) {
    try {
      const url = occId ? `/api/portal/summary?occupant_id=${occId}` : `/api/portal/summary`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setOccupantsList(json.occupants_list || []);
        setCurrentOccupant(json.occupant);
        if (json.occupant?.id && !selectedOccupantId) {
          setSelectedOccupantId(json.occupant.id);
        }
        setOutstandingAmount(json.summary?.total_outstanding_inr || 0);
      }
    } catch (e) {
      console.error("Failed to load portal summary", e);
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
    { href: "/portal", label: "Home", icon: Building2 },
    { href: "/portal/invoices", label: "Invoices & Pay", icon: Receipt },
    { href: "/portal/payments", label: "Payments & Receipts", icon: CreditCard },
    { href: "/portal/contract", label: "My Contract", icon: FileText },
    { href: "/portal/documents", label: "Documents", icon: FolderLock },
    { href: "/portal/profile", label: "Profile & Contacts", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Application Bar (UX §2.1 & §T-01) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <Link href="/portal" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
                  OX
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base tracking-tight text-slate-900">OFFICEX</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Tenant Portal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Self-Service Lease & Pay</p>
                </div>
              </Link>

              {/* Occupant Entity Selector */}
              {occupantsList.length > 0 && (
                <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupant:</span>
                  <select
                    value={selectedOccupantId}
                    onChange={(e) => handleSwitchOccupant(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 outline-none transition-colors cursor-pointer"
                  >
                    {occupantsList.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.occupant_name} ({occ.occupant_code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Outstanding Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Balance:</span>
                <span className="text-xs font-black">
                  ₹{Number(outstandingAmount).toLocaleString("en-IN")}
                </span>
              </div>

              {/* User Identity Chip */}
              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentOccupant?.occupant_name?.charAt(0) || "P"}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentOccupant?.occupant_name || "Priya Sharma"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Tenant Signatory</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (360px viewport compliant per UX §11) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {occupantsList.length > 0 && (
              <div className="pb-2 mb-2 border-b border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Occupant Account
                </label>
                <select
                  value={selectedOccupantId}
                  onChange={(e) => {
                    handleSwitchOccupant(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200"
                >
                  {occupantsList.map((occ) => (
                    <option key={occ.id} value={occ.id}>
                      {occ.occupant_name} ({occ.occupant_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Balance:</span>
              <span className="font-black text-amber-700">₹{Number(outstandingAmount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 OFFICEX Rent Roll. Tenant Portal — Bank-grade 256-bit SSL encrypted.</p>
      </footer>
    </div>
  );
}

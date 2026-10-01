"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building2,
  Receipt,
  FileCheck2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Download,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  HelpCircle,
  Bell,
  ExternalLink,
  ChevronRight,
  User,
  LogOut,
  Sparkles
} from "lucide-react";
import { formatINR } from "@/components/rent-roll/DashboardTab";

export default function TenantPortalHome() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/rent-roll/tenants").then(r => r.json()),
      fetch("/api/rent-roll/invoices").then(r => r.json())
    ])
      .then(([tData, iData]) => {
        if (tData.success && Array.isArray(tData.tenants) && tData.tenants.length > 0) {
          setTenants(tData.tenants);
          setSelectedTenantId(tData.tenants[0].id);
        }
        if (iData.success && Array.isArray(iData.invoices)) {
          setInvoices(iData.invoices);
        }
      })
      .catch(err => console.error("Portal home load error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const activeTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0] || {
    id: "TEN-001",
    legalName: "TechNova Solutions Pvt Ltd",
    tradeName: "TechNova",
    gstin: "27AABCT1234K1Z2",
    contactEmail: "finance@technova.com"
  };

  const tenantInvoices = invoices.filter(
    inv => inv.tenantId === activeTenant.id || inv.tenantName?.toLowerCase().includes(activeTenant.tradeName?.toLowerCase() || "")
  );

  const outstandingInvoices = tenantInvoices.filter(i => (i.balanceDue || 0) > 0);
  const totalOutstanding = outstandingInvoices.reduce((acc, i) => acc + (i.balanceDue || 0), 0);
  const overdueInvoices = outstandingInvoices.filter(i => new Date(i.dueDate).getTime() < Date.now());
  const dueIn7Days = outstandingInvoices.filter(i => {
    const d = new Date(i.dueDate).getTime();
    const now = Date.now();
    return d >= now && d <= now + 7 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* HEADER & TENANT IDENTITY */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs font-extrabold text-sm">
              OX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {activeTenant.legalName || activeTenant.tradeName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Occupant Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">GSTIN: {activeTenant.gstin || "27AABCT1234K1Z2"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tenants.length > 1 && (
              <select
                value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-700 outline-none"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.tradeName || t.legalName}</option>
                ))}
              </select>
            )}
            <Link
              href="/login"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER (360px Mobile-First up to 5xl Desktop) */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        
        {/* HERO TOTAL OUTSTANDING CARD (T-01 Wireframe) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider block">
                  Total Outstanding Dues
                </span>
                <div className="text-2xl sm:text-4xl font-black mt-1 tracking-tight text-white">
                  {formatINR(totalOutstanding)}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CreditCard size={15} />
                  <span>Pay Now</span>
                </Link>
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1"
                >
                  View Invoices <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-medium">Overdue Dues</span>
                <span className={`font-bold ${overdueInvoices.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {overdueInvoices.length > 0 ? `${overdueInvoices.length} Invoices` : "None (Clear)"}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-medium">Due in 7 Days</span>
                <span className="font-bold text-amber-300">
                  {dueIn7Days.length} Invoices
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-medium">Active Disputes</span>
                <span className="font-bold text-slate-300">0 Open</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: RECENT INVOICES & NOTICES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: RECENT INVOICES */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Receipt size={14} className="text-teal-600" />
                Recent Invoices ({tenantInvoices.length})
              </h2>
              <Link
                href={`/portal/billing?tenantId=${activeTenant.id}`}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                See All
              </Link>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {tenantInvoices.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No invoices generated yet for this period.
                </div>
              ) : (
                tenantInvoices.slice(0, 5).map(inv => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                          {inv.invoiceGroup || "Rent"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Due {inv.dueDate} · {inv.balanceDue > 0 ? `Bal: ${formatINR(inv.balanceDue)}` : "Settled"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-right block">
                        {formatINR(inv.netPayable || inv.balanceDue)}
                      </span>
                      {inv.balanceDue > 0 && (
                        <Link
                          href={`/portal/billing?tenantId=${activeTenant.id}`}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-2xs"
                        >
                          Pay
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: NOTICES & ESCALATIONS */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Bell size={14} className="text-teal-600" />
                Operational Notices &amp; Alerts
              </h2>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-amber-700" />
                    Scheduled Rent Escalation (+15%)
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Next contractual rent step takes effect on <strong>01-Apr-2029</strong> per Section 4 of executed lease deed.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-teal-700" />
                    Insurance Certificate On File
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Fire &amp; Special Perils policy verified until 15-Oct-2026.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS PANEL (T-01 Spec) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Links</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <FileText size={14} className="text-teal-600" />
                  <span>Statements</span>
                </Link>
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <CreditCard size={14} className="text-teal-600" />
                  <span>Pay Journey</span>
                </Link>
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <FileCheck2 size={14} className="text-teal-600" />
                  <span>My Contract</span>
                </Link>
                <Link
                  href={`/portal/billing?tenantId=${activeTenant.id}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck size={14} className="text-teal-600" />
                  <span>TDS Details</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

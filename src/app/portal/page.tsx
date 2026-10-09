"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Receipt,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText,
  FolderLock,
  Building2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  DollarSign
} from "lucide-react";

export default function TenantHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();

    const handleOccChange = (e: any) => {
      loadHomeData(e.detail?.id);
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadHomeData(occupantId?: string) {
    try {
      setLoading(true);
      const url = occupantId ? `/api/portal/summary?occupant_id=${occupantId}` : `/api/portal/summary`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load tenant home data", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Tenant Portal...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const occupant = data?.occupant || {};
  const contracts = data?.contracts || [];
  const primaryContract = contracts[0] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {occupant.occupant_name || "Valued Tenant"}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {primaryContract
              ? `${primaryContract.property_name} · ${primaryContract.building_name} · ${primaryContract.space_name} (${primaryContract.chargeable_area_sqft || 0} sq.ft.)`
              : "Active Lease Portfolio"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Active Commercial Lease
          </span>
        </div>
      </div>

      {/* Hero Outstanding Balance Card (UX Wireframe §T-01) */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300 block">
              Total Outstanding Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black tracking-tight">
                ₹{Number(summary.total_outstanding_inr || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-300 font-bold">INR</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-1">
              <Calendar size={14} className="text-indigo-400" />
              <span>
                Next due date:{" "}
                <strong className="text-white">
                  {summary.next_due_date
                    ? new Date(summary.next_due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Immediate"}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/portal/invoices?action=pay"
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CreditCard size={16} /> Pay Now
            </Link>
            <Link
              href="/portal/invoices"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              View Invoices <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Tile KPI Status Strip (§T-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overdue */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            summary.overdue_count > 0
              ? "bg-red-50/70 border-red-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Overdue Status
            </span>
            <AlertTriangle
              size={16}
              className={summary.overdue_count > 0 ? "text-red-600" : "text-emerald-500"}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                summary.overdue_count > 0 ? "text-red-700" : "text-slate-800"
              }`}
            >
              {summary.overdue_count > 0
                ? `₹${Number(summary.overdue_amount_inr || 0).toLocaleString("en-IN")}`
                : "None"}
            </span>
            {summary.overdue_count > 0 && (
              <span className="text-xs font-bold text-red-600">
                ({summary.overdue_count} invoice{summary.overdue_count > 1 ? "s" : ""})
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.overdue_count > 0 ? "Immediate settlement requested" : "Zero arrears"}
          </p>
        </div>

        {/* Due in 7 Days */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Due in Next 7 Days
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {summary.due_7_days_count > 0
                ? `₹${Number(summary.due_7_days_amount_inr || 0).toLocaleString("en-IN")}`
                : "₹0"}
            </span>
            <span className="text-xs font-bold text-slate-500">
              ({summary.due_7_days_count} invoice{summary.due_7_days_count !== 1 ? "s" : ""})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Upcoming rent & CAM cycles</p>
        </div>

        {/* Disputes Open */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Active Disputes
            </span>
            <HelpCircle size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {summary.open_disputes_count || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">tickets</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under review with 7-day SLA</p>
        </div>
      </div>

      {/* Two Column Grid: Recent Invoices & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Invoices (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">Recent Invoices</h2>
            </div>
            <Link
              href="/portal/invoices"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recent_invoices || []).length === 0 ? (
              <p className="py-8 text-center text-xs font-bold text-slate-400">
                No invoices found for this billing cycle.
              </p>
            ) : (
              (data.recent_invoices || []).map((inv: any) => {
                const isPaid = Number(inv.balance_due) <= 0 || inv.status === "paid";
                const isPartPaid =
                  Number(inv.amount_paid) > 0 && Number(inv.balance_due) > 0;

                return (
                  <div key={inv.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">
                          {inv.invoice_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPartPaid
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isPaid ? "Paid" : isPartPaid ? "Part paid" : "Unpaid"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Period: {inv.period_start || "Current"} · Due:{" "}
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "Immediate"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">
                          ₹{Number(inv.gross_total || 0).toLocaleString("en-IN")}
                        </span>
                        {!isPaid && (
                          <span className="text-[10px] font-bold text-amber-600 block">
                            Bal: ₹{Number(inv.balance_due || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {!isPaid && (
                        <Link
                          href={`/portal/invoices?pay=${inv.id}`}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Pay
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Notices & Critical Dates (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">Notices & Milestones</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {(data?.notices || []).map((notice: any) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {notice.title}
                  </span>
                  {notice.link && (
                    <Link
                      href={notice.link}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center"
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                  {notice.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Strip (§T-01 Wireframe) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
          Quick Access Portals
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/portal/contract"
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/60"
          >
            <FileText size={16} className="text-indigo-600 shrink-0" />
            <span>My Contract</span>
          </Link>
          <Link
            href="/portal/documents"
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/60"
          >
            <FolderLock size={16} className="text-indigo-600 shrink-0" />
            <span>Documents</span>
          </Link>
          <Link
            href="/portal/payments"
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/60"
          >
            <CreditCard size={16} className="text-indigo-600 shrink-0" />
            <span>Payments & Receipts</span>
          </Link>
          <Link
            href="/portal/payments"
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/60"
          >
            <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
            <span>TDS Certificates</span>
          </Link>
          <Link
            href="/portal/profile"
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/60"
          >
            <Building2 size={16} className="text-indigo-600 shrink-0" />
            <span>Profile & Contacts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

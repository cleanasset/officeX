"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Zap,
  TrendingUp,
  Receipt,
  Users,
  ArrowRight,
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface ModuleChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SAAS_MODULES = [
  {
    id: "rent-roll",
    title: "Rent Roll & Lease-to-Cash",
    tag: "Core ERP",
    badge: "Primary Active",
    icon: DollarSign,
    color: "from-teal-600 to-emerald-600",
    bgLight: "bg-teal-50 border-teal-200 text-teal-800",
    href: "/dashboard/owner",
    description:
      "Automated monthly invoice runs, 39-point lease contracts, step escalations, CAM pooling & direct bank collections.",
    features: ["Owner Dashboard (S-02)", "Rent Roll Register (S-10)", "Billing Batch Runs", "Owner Statements"],
  },
  {
    id: "pm",
    title: "Property Manager Console",
    tag: "Site Operations",
    badge: "Operational",
    icon: Building2,
    color: "from-emerald-600 to-teal-700",
    bgLight: "bg-emerald-50 border-emerald-200 text-emerald-800",
    href: "/dashboard/pm",
    description:
      "Daily execution queue for contract approvals, renewals, security deposits, compliance alerts, and escalations.",
    features: ["PM Today Console (S-03)", "Active Contracts", "Lease Renewals", "Deposit Tracking"],
  },
  {
    id: "fm",
    title: "Facility Management (IFM)",
    tag: "Site Operations",
    badge: "Operational",
    icon: Zap,
    color: "from-amber-600 to-orange-600",
    bgLight: "bg-amber-50 border-amber-200 text-amber-800",
    href: "/dashboard/fm",
    description:
      "Utility sub-meter readings, CAM maintenance, site operational work orders, vendor SLAs, and compliance logs.",
    features: ["FM Desk (S-03 FM)", "Utility Sub-Meters", "Vendor Contracts", "Site Inspections"],
  },
  {
    id: "leasing",
    title: "Commercial Leasing CRM",
    tag: "Asset Marketing",
    badge: "Growth",
    icon: TrendingUp,
    color: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-50 border-blue-200 text-blue-800",
    href: "/dashboard/leasing",
    description:
      "Vacant unit listings, broker mandate tracking, inquiry pipelines, LOI generation, and visual stacking plans.",
    features: ["Leasing Console (S-04)", "Stacking Plan (S-26)", "Deals Pipeline", "Broker Network"],
  },
  {
    id: "finance",
    title: "Finance & Statutory AR",
    tag: "Controllership",
    badge: "Statutory",
    icon: Receipt,
    color: "from-purple-600 to-violet-600",
    bgLight: "bg-purple-50 border-purple-200 text-purple-800",
    href: "/dashboard/finance",
    description:
      "GST Section 194I TDS compliance, aging collections buckets (0-90+ days), remittance ledgers, and bank reconciliations.",
    features: ["Finance Dashboard (S-05)", "Collections Aging", "GST/TDS Ledgers", "Bank Reconciliation"],
  },
  {
    id: "tenant",
    title: "Occupant & Tenant Portal",
    tag: "Self-Service",
    badge: "Client Facing",
    icon: Users,
    color: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-100 border-slate-300 text-slate-800",
    href: "/portal/invoices",
    description:
      "Tenant self-service invoice downloads, direct Landlord bank transfer details, UTR challan submission, and receipt access.",
    features: ["Invoice Downloads", "Net Banking Transfer", "UTR Challan Entry", "Payment History"],
  },
];

export default function ModuleChooserModal({ isOpen, onClose }: ModuleChooserModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedGateModule, setSelectedGateModule] = useState<typeof SAAS_MODULES[0] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedGateModule(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isGlobalSubscribed = typeof window !== "undefined" && (
    localStorage.getItem("officex_subscription") === "active" ||
    sessionStorage.getItem("officex_subscription") === "active" ||
    document.cookie.includes("officex_subscription=active")
  );

  const checkSubscribed = (id: string) => {
    if (id === "tenant") return true; // Free self-service occupant portal
    if (id === "rent-roll") return isGlobalSubscribed; // Subscribed via Rent Roll master
    if (typeof window !== "undefined") {
      if (localStorage.getItem(`officex_sub_${id}`) === "active") return true;
      if (sessionStorage.getItem(`officex_sub_${id}`) === "active") return true;
    }
    return false;
  };

  const handleSelectModule = (mod: typeof SAAS_MODULES[0]) => {
    const isSub = checkSubscribed(mod.id);
    if (isSub) {
      onClose();
      router.push(mod.href);
    } else {
      setSelectedGateModule(mod);
    }
  };

  const handleClose = () => {
    setSelectedGateModule(null);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {selectedGateModule ? (
        /* ──────── 1. DEDICATED SUBSCRIPTION GATEWAY VIEW (For Unsubscribed Modules) ──────── */
        <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Top Bar: Back & Close */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setSelectedGateModule(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Workspace Modules</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Module Banner */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedGateModule.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
              <selectedGateModule.icon size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
                <Lock size={10} />
                <span>Subscription Gateway · Add-On License Required</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedGateModule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Your organization is currently active for <strong>Rent Roll &amp; Lease-to-Cash</strong>. Access to this module requires an activated subscription license for this workspace.
              </p>
            </div>
          </div>

          {/* Included Features */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 mb-6">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              Included with this module license:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
              {selectedGateModule.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Subscription CTA */}
          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">Commercial Operations Add-On</div>
              <div className="text-[11px] text-slate-500">Instant activation for your verified commercial workspace</div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-black text-slate-900">₹100</span>
              <span className="text-xs text-slate-500 font-semibold">/month</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push(`/operate/rent-roll/pricing?module=${selectedGateModule.id}`);
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D7B6C] hover:bg-[#0b685b] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Proceed to Subscription Gateway &amp; Pricing</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedGateModule(null)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ──────── 2. ALL 6 MODULES CHOOSER GRID ──────── */
        <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D7B6C] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              <span>Workspace Module Switcher</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Which module do you want to work on today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select your destination below. Subscribed modules launch immediately; un-subscribed modules open their subscription gateway.
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {SAAS_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isSub = checkSubscribed(mod.id);
              const isTenant = mod.id === "tenant";

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod)}
                  className={`group relative p-4 rounded-2xl border text-left transition-all duration-150 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    isSub
                      ? "border-slate-200 hover:border-[#0D7B6C] bg-white hover:bg-teal-50/20"
                      : "border-slate-200/80 hover:border-amber-400 bg-slate-50/40 hover:bg-amber-50/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <div className={`w-full h-full rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isSub ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-300 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-600" />
                          Subscribed
                        </span>
                      ) : isTenant ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 border-slate-300 text-slate-800">
                          Free Client Portal
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 border-amber-300 text-amber-800 flex items-center gap-1">
                          <Lock size={10} className="text-amber-600" />
                          Subscription Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0D7B6C] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {mod.features.slice(0, 2).join(" · ")}
                    </span>
                    {isSub ? (
                      <span className="font-bold text-[#0D7B6C] group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                        Launch Dashboard &rarr;
                      </span>
                    ) : isTenant ? (
                      <span className="font-bold text-slate-700 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                        Open Portal &rarr;
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                        <Lock size={11} />
                        Subscription Gateway &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}

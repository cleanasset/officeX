"use client";

import React from "react";
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

  if (!isOpen) return null;

  const handleSelectModule = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
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
            Your subscribed organization has access to multiple commercial operations modules. Select your destination:
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {SAAS_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.href)}
                className="group relative p-4 rounded-2xl border border-slate-200/90 hover:border-[#0D7B6C] bg-white hover:bg-teal-50/20 text-left transition-all duration-150 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <div className={`w-full h-full rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mod.bgLight}`}>
                      {mod.tag}
                    </span>
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
                  <span className="font-bold text-[#0D7B6C] group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                    Launch &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

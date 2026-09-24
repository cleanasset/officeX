"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export interface ProfileCompletionMeterProps {
  role?: "owner" | "broker" | "vendor" | "pm" | "tenant";
  className?: string;
}

export default function ProfileCompletionMeter({
  role = "owner",
  className = ""
}: ProfileCompletionMeterProps) {
  const [data, setData] = useState<{
    completionPercentage: number;
    isFullyVerified: boolean;
    breakdown: Array<{ category: string; weight: number; completed: boolean; actionHint: string }>;
    pendingActions: string[];
    statusLabel: string;
  }>({
    completionPercentage: 20,
    isFullyVerified: false,
    breakdown: [
      { category: "Contact Verification", weight: 20, completed: true, actionHint: "Email & mobile verified" },
      { category: "Landlord Entity Profile", weight: 35, completed: false, actionHint: "Provide legal entity name, PAN & address" },
      { category: "Commercial Portfolio", weight: 25, completed: false, actionHint: "Add your first property in dashboard" },
      { category: "Statutory KYC & Evidence", weight: 20, completed: false, actionHint: "Upload ownership proof & GST cert" }
    ],
    pendingActions: ["Provide legal entity name, PAN & address", "Add your first property in dashboard"],
    statusLabel: "Basic Access"
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const hasOrg = typeof window !== "undefined" && Boolean(
          localStorage.getItem("officex_active_org") ||
          localStorage.getItem("officex_onboarding_completed") === "1" ||
          localStorage.getItem("officex_org_id")
        );
        const hasProperties = typeof window !== "undefined" && (() => {
          try {
            const p = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
            return Array.isArray(p) && p.length > 0;
          } catch {
            return false;
          }
        })();
        const hasKyc = typeof window !== "undefined" && localStorage.getItem("officex_kyc_status") === "SUBMITTED";
        const res = await fetch(`/api/v1/profile/completion?role=${role}&hasOrg=${hasOrg}&hasProperties=${hasProperties}&hasRoleProfile=${hasOrg}&hasKyc=${hasKyc}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.warn("Could not fetch completion score:", e);
      }
    };
    fetchCompletion();
  }, [role]);

  if (data.isFullyVerified) {
    return null; // When 100% verified, hide banner to save space
  }

  return (
    <div className={`p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 font-sans transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] shrink-0">
            <ShieldCheck size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">Profile &amp; KYC Verification</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200">
                {data.statusLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Complete statutory verification to unlock higher transaction and listing limits.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-black text-[#0F8B7D]">{data.completionPercentage}%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0F8B7D] to-teal-500 transition-all duration-500"
          style={{ width: `${data.completionPercentage}%` }}
        />
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            PENDING VERIFICATION CRITERIA:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.breakdown.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  item.completed ? "bg-teal-50/50 border-teal-200/80 text-teal-950" : "bg-slate-50 border-slate-200/80 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                    item.completed ? "bg-[#0F8B7D] text-white" : "border border-slate-300 text-slate-400 bg-white"
                  }`}>
                    {item.completed ? "✓" : "!"}
                  </span>
                  <span className="text-[11px] font-bold">{item.category}</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400">+{item.weight}%</span>
              </div>
            ))}
          </div>

          {/* Calculate dynamic next pending step */}
          {(() => {
            const orgPending = data.breakdown.find(b => (b.category.toLowerCase().includes("organization") || b.category.toLowerCase().includes("landlord")) && !b.completed);
            const propPending = data.breakdown.find(b => (b.category.toLowerCase().includes("portfolio") || b.category.toLowerCase().includes("property")) && !b.completed);
            const kycPending = data.breakdown.find(b => (b.category.toLowerCase().includes("kyc") || b.category.toLowerCase().includes("evidence")) && !b.completed);
            
            const nextHref = orgPending ? `/onboarding?role=${encodeURIComponent(role)}&step=2` : propPending ? "/properties/add" : kycPending ? `/onboarding?role=${encodeURIComponent(role)}&step=5` : "/properties/rent-roll";
            const nextLabel = orgPending ? "Complete Onboarding (Step 2)" : propPending ? "Add First Property" : kycPending ? "Upload KYC Evidence" : "View Portfolio";

            return (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {data.pendingActions.length > 0 ? `Next step: ${data.pendingActions[0]}` : "All mandatory items verified"}
                </span>
                <Link
                  href={nextHref}
                  className="text-[11px] font-black text-[#0F8B7D] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{nextLabel}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

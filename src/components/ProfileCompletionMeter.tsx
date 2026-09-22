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
    completionPercentage: 70,
    isFullyVerified: false,
    breakdown: [
      { category: "Contact Verification", weight: 15, completed: true, actionHint: "Email & mobile OTP verified" },
      { category: "Organization Master", weight: 25, completed: true, actionHint: "Entity legal details provided" },
      { category: "Role Business Profile", weight: 30, completed: true, actionHint: "Operating parameters saved" },
      { category: "KYC Statutory Evidence", weight: 15, completed: false, actionHint: "Upload official tax / RERA documents" },
      { category: "Banking & Settlement", weight: 15, completed: false, actionHint: "Verify bank IFSC & cancelled cheque" }
    ],
    pendingActions: ["Upload official tax / RERA documents", "Verify bank IFSC & cancelled cheque"],
    statusLabel: "Partially Verified"
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const hasOrg = typeof window !== "undefined" && Boolean(localStorage.getItem("officex_org_id"));
        const hasKyc = typeof window !== "undefined" && localStorage.getItem("officex_kyc_status") === "SUBMITTED";
        const res = await fetch(`/api/v1/profile/completion?role=${role}&hasOrg=${hasOrg}&hasRoleProfile=true&hasKyc=${hasKyc}`);
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
            const orgPending = data.breakdown.find(b => b.category.toLowerCase().includes("organization") && !b.completed);
            const rolePending = data.breakdown.find(b => (b.category.toLowerCase().includes("role") || b.category.toLowerCase().includes("portfolio")) && !b.completed);
            const kycPending = data.breakdown.find(b => (b.category.toLowerCase().includes("kyc") || b.category.toLowerCase().includes("evidence") || b.category.toLowerCase().includes("statutory") || b.category.toLowerCase().includes("banking")) && !b.completed);
            
            const nextStepNum = orgPending ? 2 : rolePending ? 3 : kycPending ? 5 : 2;

            return (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {data.pendingActions.length > 0 ? `Next step: ${data.pendingActions[0]}` : "All mandatory items verified"}
                </span>
                <Link
                  href={`/onboarding?role=${encodeURIComponent(role)}&step=${nextStepNum}`}
                  className="text-[11px] font-black text-[#0F8B7D] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Resume Onboarding (Step {nextStepNum})</span>
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

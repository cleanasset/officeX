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
    <div className={`p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-[#0F8B7D]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">Profile & KYC Completion</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                {data.statusLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Complete verification to unlock higher transaction & listing limits.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-black text-[#0F8B7D]">{data.completionPercentage}%</span>
            <span className="text-[9px] text-slate-500 block">Completed</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${data.completionPercentage}%` }}
        />
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            PENDING VERIFICATION CRITERIA:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.breakdown.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  item.completed ? "bg-teal-950/40 border-teal-800/60 text-slate-300" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black ${
                    item.completed ? "bg-teal-500 text-slate-950" : "border border-slate-700 text-slate-600"
                  }`}>
                    {item.completed ? "✓" : "!"}
                  </span>
                  <span className="text-[11px] font-bold">{item.category}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">+{item.weight}%</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              {data.pendingActions.length > 0 ? `Next: ${data.pendingActions[0]}` : "All mandatory items in order"}
            </span>
            <Link
              href={`/onboarding?role=${encodeURIComponent(role)}`}
              className="text-[11px] font-black text-[#0F8B7D] hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              <span>Resume Onboarding</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

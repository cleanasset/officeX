"use client";

import React from "react";
import { ShieldCheck, Lock, CheckCircle2, Globe, Database, Award } from "lucide-react";

export interface TrustStripProps {
  headline?: string;
}

export default function TrustStrip({
  headline = "Trusted by commercial real estate owners, asset managers, and enterprise FM leaders"
}: TrustStripProps) {
  return (
    <div className="w-full bg-[#071324] text-white border-y border-slate-800 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-slate-300 tracking-wide">
            {headline}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ShieldCheck size={14} className="text-[#0F8B7D]" />
            <span className="text-slate-200">SOC 2 Type II</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Lock size={14} className="text-[#0F8B7D]" />
            <span className="text-slate-200">AES-256</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <CheckCircle2 size={14} className="text-[#0F8B7D]" />
            <span className="text-slate-200">DPDP Act 2023</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Award size={14} className="text-blue-400" />
            <span className="text-slate-200">Razorpay Escrow</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Globe size={14} className="text-emerald-400" />
            <span className="text-slate-200">Google Maps Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

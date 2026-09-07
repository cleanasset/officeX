"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LucideIcon } from "lucide-react";

export interface AudienceTileProps {
  audienceLabel: string;
  roleDescription: string;
  outcomes: string[];
  journeyHref: string;
  ctaLabel?: string;
  icon: LucideIcon;
  onSelectAudience?: (audience: string) => void;
}

export default function AudienceTile({
  audienceLabel,
  roleDescription,
  outcomes,
  journeyHref,
  ctaLabel = "See your journey",
  icon: Icon,
  onSelectAudience
}: AudienceTileProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-[#0F8B7D]/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>

        <h3 className="text-lg font-black text-gray-900 tracking-tight">
          {audienceLabel}
        </h3>

        <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
          {roleDescription}
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
          {outcomes.map((out, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
              <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{out}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
        <Link
          href={journeyHref}
          className="inline-flex items-center justify-between text-xs font-bold text-[#0F8B7D] hover:text-[#0c7368] p-1"
        >
          <span>{ctaLabel}</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {onSelectAudience && (
          <button
            type="button"
            onClick={() => onSelectAudience(audienceLabel)}
            className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-teal-50 text-gray-700 hover:text-[#0F8B7D] text-[11px] font-bold transition-colors cursor-pointer text-center"
          >
            Get a personalised demo for {audienceLabel}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export interface FinalCTABandProps {
  headline: string;
  subheadline: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  accentColor?: string;
}

export default function FinalCTABand({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  accentColor = "#0F8B7D"
}: FinalCTABandProps) {
  return (
    <section
      className="py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-teal-50/20 border-t border-slate-200"
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
          {headline}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
          {subheadline}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={primaryCta.href}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <span>{primaryCta.label}</span>
            <ArrowRight size={15} />
          </Link>

          {secondaryCta && (
            secondaryCta.href ? (
              <Link
                href={secondaryCta.href}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-white shadow-2xs"
              >
                <PhoneCall size={14} />
                <span>{secondaryCta.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryCta.onClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-white shadow-2xs cursor-pointer"
              >
                <PhoneCall size={14} />
                <span>{secondaryCta.label}</span>
              </button>
            )
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-6 font-medium">
          Dedicated account manager &amp; custom enterprise SLA terms available.
        </p>
      </div>
    </section>
  );
}

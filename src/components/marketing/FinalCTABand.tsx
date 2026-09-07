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
      className="py-16 md:py-20 px-4 sm:px-6 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #071324 0%, #0c233e 50%, ${accentColor} 100%)`
      }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
          {headline}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
          {subheadline}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={primaryCta.href}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <span>{primaryCta.label}</span>
            <ArrowRight size={15} />
          </Link>

          {secondaryCta && (
            secondaryCta.href ? (
              <Link
                href={secondaryCta.href}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/30 hover:border-white text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs"
              >
                <PhoneCall size={14} />
                <span>{secondaryCta.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryCta.onClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/30 hover:border-white text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs cursor-pointer"
              >
                <PhoneCall size={14} />
                <span>{secondaryCta.label}</span>
              </button>
            )
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-6 font-medium">
          Dedicated account manager &amp; custom enterprise SLA terms available.
        </p>
      </div>
    </section>
  );
}

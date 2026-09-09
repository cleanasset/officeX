"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export interface HeroSectionProps {
  badge?: string;
  headline: string;
  subheadline: string;
  description?: string;
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
  visualPlaceholderTitle?: string;
  visualMetrics?: Array<{ label: string; value: string }>;
  customVisual?: React.ReactNode;
  bgImage?: string;
  lightTheme?: boolean;
}

export default function HeroSection({
  badge,
  headline,
  subheadline,
  description,
  primaryCta,
  secondaryCta,
  accentColor = "#0F8B7D",
  visualPlaceholderTitle = "Live System Dashboard",
  visualMetrics = [
    { label: "Verified SLA", value: "99.4%" },
    { label: "Turnaround", value: "< 4 Hrs" },
    { label: "Escrow Protected", value: "100%" }
  ],
  customVisual,
  bgImage = "/images/officex_recommended_hero_banner.jpg",
  lightTheme = true
}: HeroSectionProps) {
  if (lightTheme) {
    return (
      <section className="relative w-full pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200 text-slate-900">
        {/* Soft background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0f8b7d15_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 border border-teal-200 bg-white text-[#0F8B7D] shadow-2xs">
                <Sparkles size={14} className="text-[#0F8B7D]" />
                <span>{badge}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {headline}
            </h1>

            <p className="text-base sm:text-lg font-bold text-slate-700 mt-4 leading-relaxed">
              {subheadline}
            </p>

            {description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-3 max-w-2xl leading-relaxed font-medium">
                {description}
              </p>
            )}

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href={primaryCta.href}
                className="px-6 py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md shadow-teal-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center bg-[#0F8B7D] hover:bg-[#0D7A6E]"
              >
                <span>{primaryCta.label}</span>
                <ArrowRight size={15} />
              </Link>

              {secondaryCta && (
                secondaryCta.href ? (
                  <Link
                    href={secondaryCta.href}
                    className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white hover:bg-slate-50 shadow-2xs"
                  >
                    <span>{secondaryCta.label}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={secondaryCta.onClick}
                    className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
                  >
                    <span>{secondaryCta.label}</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <ShieldCheck size={14} className="text-[#0F8B7D]" /> Instant Deployment
              </span>
              <span>•</span>
              <span>No Long-Term Lock-in</span>
              <span>•</span>
              <span>RERA &amp; DPDP Compliant</span>
            </div>
          </div>

          {/* Right Column: Visual Mockup Container */}
          <div className="lg:col-span-5 w-full">
            {customVisual ? (
              customVisual
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 overflow-hidden relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2 font-semibold">
                      app.officex.in
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] border border-teal-200">
                    LIVE PORTAL
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 text-slate-900 p-5 mb-4 border border-slate-200">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {visualPlaceholderTitle}
                  </p>
                  <p className="text-xl font-black mt-1 text-slate-900">
                    {headline.split(" ")[0]} {headline.split(" ")[1]} System
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {visualMetrics.map((met, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{met.label}</p>
                      <p className="text-sm sm:text-base font-black text-[#0F8B7D] mt-0.5">{met.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold">SLA Assurance Enabled</span>
                  <span className="text-emerald-600 font-bold">● Active 24/7</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Fallback dark theme if explicitly requested
  return (
    <section className="relative w-full pt-14 pb-18 md:pt-16 md:pb-22 px-4 sm:px-6 overflow-hidden bg-[#071324] border-b border-slate-800 text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={bgImage}
          alt={headline}
          fill
          priority
          unoptimized
          className="object-cover object-right md:object-center opacity-85"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071324] via-[#071324]/90 md:via-[#071324]/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-transparent to-[#071324]/50 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 border border-teal-500/30 bg-teal-500/10 text-teal-300 backdrop-blur-md shadow-xs">
              <Sparkles size={14} className="text-teal-400" />
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
            {headline}
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-200 mt-4 leading-relaxed">
            {subheadline}
          </p>

          {description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              href={primaryCta.href}
              className="px-6 py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center bg-[#0F8B7D] hover:bg-[#0c7368]"
            >
              <span>{primaryCta.label}</span>
              <ArrowRight size={15} />
            </Link>

            {secondaryCta && (
              secondaryCta.href ? (
                <Link
                  href={secondaryCta.href}
                  className="px-6 py-3.5 rounded-xl border border-white/25 hover:border-white text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white/10 hover:bg-white/15 backdrop-blur-md"
                >
                  <span>{secondaryCta.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="px-6 py-3.5 rounded-xl border border-white/25 hover:border-white text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white/10 hover:bg-white/15 backdrop-blur-md cursor-pointer"
                >
                  <span>{secondaryCta.label}</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-4 mt-6 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-teal-400" /> Instant Deployment
            </span>
            <span>•</span>
            <span>No Long-Term Lock-in</span>
            <span>•</span>
            <span>RERA &amp; DPDP Compliant</span>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          {customVisual ? (
            customVisual
          ) : (
            <div className="bg-[#0a1829]/95 rounded-2xl border border-slate-700 shadow-2xl p-5 overflow-hidden relative backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2 font-semibold">
                    app.officex.in
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300">
                  LIVE PORTAL
                </span>
              </div>

              <div className="rounded-xl bg-slate-950 text-white p-5 mb-4 border border-slate-800">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {visualPlaceholderTitle}
                </p>
                <p className="text-xl font-black mt-1 text-white">
                  {headline.split(" ")[0]} {headline.split(" ")[1]} System
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {visualMetrics.map((met, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{met.label}</p>
                    <p className="text-sm sm:text-base font-black text-teal-300 mt-0.5">{met.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold">SLA Assurance Enabled</span>
                <span className="text-emerald-400 font-bold">● Active 24/7</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
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
  ]
}: HeroSectionProps) {
  return (
    <section
      className="relative w-full pt-10 pb-16 md:pt-12 md:pb-20 px-4 sm:px-6 overflow-hidden border-b border-gray-100"
      style={{
        background: `linear-gradient(180deg, ${accentColor}08 0%, rgba(255,255,255,1) 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {badge && (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 border"
              style={{
                backgroundColor: `${accentColor}12`,
                borderColor: `${accentColor}30`,
                color: accentColor
              }}
            >
              <Sparkles size={14} />
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071324] tracking-tight leading-[1.15]">
            {headline}
          </h1>

          <p className="text-base sm:text-lg font-bold text-gray-700 mt-4 leading-relaxed">
            {subheadline}
          </p>

          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              href={primaryCta.href}
              className="px-6 py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              style={{ backgroundColor: accentColor }}
            >
              <span>{primaryCta.label}</span>
              <ArrowRight size={15} />
            </Link>

            {secondaryCta && (
              secondaryCta.href ? (
                <Link
                  href={secondaryCta.href}
                  className="px-6 py-3.5 rounded-xl border border-gray-300 hover:border-gray-900 text-gray-800 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white"
                >
                  <span>{secondaryCta.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="px-6 py-3.5 rounded-xl border border-gray-300 hover:border-gray-900 text-gray-800 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center bg-white cursor-pointer"
                >
                  <span>{secondaryCta.label}</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-4 mt-6 text-[11px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} style={{ color: accentColor }} /> Instant Deployment
            </span>
            <span>•</span>
            <span>No Long-Term Lock-in</span>
            <span>•</span>
            <span>RERA &amp; DPDP Compliant</span>
          </div>
        </div>

        {/* Right Column: Visual Mockup Container */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-gray-400 ml-2 font-semibold">
                  app.officex.in
                </span>
              </div>
              <span
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                LIVE PORTAL
              </span>
            </div>

            <div className="rounded-xl bg-slate-900 text-white p-5 mb-4">
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {visualPlaceholderTitle}
              </p>
              <p className="text-xl font-black mt-1 text-white">
                Institutional CRE Operating System
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {visualMetrics.map((met, i) => (
                <div key={i} className="bg-slate-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{met.label}</p>
                  <p className="text-sm sm:text-base font-black text-gray-900 mt-0.5">{met.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-semibold">SLA Assurance Enabled</span>
              <span className="text-emerald-600 font-bold">● Active 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

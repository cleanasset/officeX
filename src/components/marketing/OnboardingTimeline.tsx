"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, CheckCircle2, ChevronRight } from "lucide-react";

export interface OnboardingStep {
  step?: string; // Kept optional for interface compatibility but not displayed
  title: string;
  description: string;
  duration?: string;
}

export interface OnboardingTimelineProps {
  title?: string;
  subtitle?: string;
  steps: OnboardingStep[];
  accentColor?: string;
  ctaHref?: string;
}

export default function OnboardingTimeline({
  title = "Instant 1-Day Process: Up & Running Today",
  subtitle = "No 15-day waiting period. Our unified system gets your properties, leases, and teams operational in a single day.",
  steps,
  accentColor = "#0F8B7D",
  ctaHref = "/signup"
}: OnboardingTimelineProps) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-slate-50/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3 bg-teal-50 text-[#0F8B7D] border border-teal-100">
            <Zap size={13} className="text-[#0F8B7D]" />
            <span>One-Day Streamlined Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Connected Horizontal Pipeline */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between relative group hover:border-[#0F8B7D]/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>{st.duration || "Day 1"}</span>
                    </span>

                    {/* Stage indicator for connection */}
                    {idx < steps.length - 1 && (
                      <span className="hidden lg:flex items-center text-slate-300 group-hover:text-[#0F8B7D] transition-colors">
                        <ChevronRight size={18} />
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-gray-900 mb-2">
                    {st.title}
                  </h3>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="text-[#0F8B7D] font-extrabold flex items-center gap-1">
                    Continuous Flow <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <span>Start in 1 Day</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

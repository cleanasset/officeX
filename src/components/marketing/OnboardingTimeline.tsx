"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export interface OnboardingStep {
  step: string; // e.g. "01"
  title: string;
  description: string;
  duration: string;
}

export interface OnboardingTimelineProps {
  title?: string;
  subtitle?: string;
  steps: OnboardingStep[];
  accentColor?: string;
  ctaHref?: string;
}

export default function OnboardingTimeline({
  title = "Go-Live in Days, Not Months",
  subtitle = "Our streamlined onboarding process gets your properties and teams operational with zero friction.",
  steps,
  accentColor = "#0F8B7D",
  ctaHref = "/demo"
}: OnboardingTimelineProps) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-slate-50/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between relative group hover:border-gray-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-2xl font-black font-mono tracking-tight"
                    style={{ color: accentColor }}
                  >
                    {st.step}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    <span>{st.duration}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-gray-900 mb-2">
                  {st.title}
                </h3>

                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {st.description}
                </p>
              </div>

              <div
                className="mt-6 pt-3 border-t border-gray-100 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                Step {idx + 1} of {steps.length}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <span>Start Onboarding Today</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

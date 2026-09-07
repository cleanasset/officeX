"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";

export interface UseCaseItem {
  audience: string;
  scenario: string;
  outcome: string;
  seeHowHref?: string;
}

export interface UseCaseSectionProps {
  useCases: UseCaseItem[];
  accentColor?: string;
}

export default function UseCaseSection({
  useCases,
  accentColor = "#0F8B7D"
}: UseCaseSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-slate-50/50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
            Built for Every Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            Real-world scenarios demonstrating measurable ROI across your operational hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    <UserCheck size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                    {uc.audience}
                  </span>
                </div>

                <h3 className="text-sm font-black text-gray-900 mb-2">Scenario</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
                  {uc.scenario}
                </p>

                <h3 className="text-sm font-black text-gray-900 mb-2">Outcome</h3>
                <p
                  className="text-xs font-bold leading-relaxed p-3 rounded-xl"
                  style={{ backgroundColor: `${accentColor}08`, color: accentColor }}
                >
                  {uc.outcome}
                </p>
              </div>

              {uc.seeHowHref && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href={uc.seeHowHref}
                    className="text-xs font-bold inline-flex items-center gap-1.5 hover:underline"
                    style={{ color: accentColor }}
                  >
                    <span>See full workflow</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

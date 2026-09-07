"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
}

export interface PricingTableProps {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
  accentColor?: string;
}

export default function PricingTable({
  title = "Simple, Transparent Pricing",
  subtitle = "Choose the right tier for your portfolio size. Upgrade, downgrade, or cancel at any time.",
  tiers,
  accentColor = "#0F8B7D"
}: PricingTableProps) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#071324] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
                tier.highlight
                  ? "bg-[#071324] text-white shadow-2xl ring-2 ring-[#0F8B7D] scale-[1.02]"
                  : "bg-slate-50 border border-gray-200 text-gray-900 shadow-sm hover:shadow-md"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F8B7D] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles size={12} />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-black tracking-tight">{tier.name}</h3>
                <p
                  className={`text-xs mt-1 font-medium ${
                    tier.highlight ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  {tier.description}
                </p>

                <div className="mt-6 mb-6 pb-6 border-b border-gray-200/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span
                        className={`text-xs font-semibold ${
                          tier.highlight ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        /{tier.period}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p
                    className={`text-[11px] font-extrabold uppercase tracking-wider ${
                      tier.highlight ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Included Features:
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <Check
                          size={15}
                          className="shrink-0 mt-0.5"
                          style={{ color: tier.highlight ? "#0F8B7D" : accentColor }}
                        />
                        <span
                          className={`font-medium leading-relaxed ${
                            tier.highlight ? "text-slate-200" : "text-gray-700"
                          }`}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={tier.ctaHref}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm ${
                    tier.highlight
                      ? "bg-[#0F8B7D] hover:bg-[#0c7368] text-white"
                      : "bg-[#071324] hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>{tier.ctaLabel}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

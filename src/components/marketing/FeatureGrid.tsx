"use client";

import React from "react";
import { LucideIcon, Sparkles } from "lucide-react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  phase2?: boolean;
}

export interface FeatureGridProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
  accentColor?: string;
}

export default function FeatureGrid({
  title,
  subtitle,
  features,
  accentColor = "#0F8B7D"
}: FeatureGridProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-gray-100 rounded-2xl p-6 sm:p-7 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${accentColor}15`,
                        color: accentColor
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    {feat.phase2 || feat.tag === "Coming Soon" || feat.title.toLowerCase().includes("ai") ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                        <Sparkles size={11} className="text-amber-600" />
                        Coming Soon
                      </span>
                    ) : feat.tag ? (
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor
                        }}
                      >
                        {feat.tag}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Live Feature
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

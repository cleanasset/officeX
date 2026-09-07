"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LucideIcon } from "lucide-react";

export interface ModuleCardProps {
  moduleName: string;
  accentColor: string; // e.g. '#0F8B7D'
  outcome: string; // e.g. 'Discover'
  tagline: string;
  benefits: string[];
  ctaLabel?: string;
  ctaHref: string;
  audienceTag: string;
  icon: LucideIcon;
}

export default function ModuleCard({
  moduleName,
  accentColor,
  outcome,
  tagline,
  benefits,
  ctaLabel,
  ctaHref,
  audienceTag,
  icon: Icon
}: ModuleCardProps) {
  const displayCta = ctaLabel || `Explore ${moduleName}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      {/* Accent top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        {/* Header with Icon & Outcome Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Icon size={24} />
          </div>

          <span
            className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {outcome}
          </span>
        </div>

        {/* Module Title */}
        <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-gray-800">
          {moduleName}
        </h3>

        {/* Tagline */}
        <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
          {tagline}
        </p>

        {/* 3 Bullet Benefits */}
        <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
              <CheckCircle2
                size={15}
                className="shrink-0 mt-0.5"
                style={{ color: accentColor }}
              />
              <span className="font-medium leading-tight">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-3">
        {/* Explore CTA */}
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200"
          style={{
            backgroundColor: `${accentColor}10`,
            color: accentColor
          }}
        >
          <span>{displayCta}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Audience Tag */}
        <p className="text-[10px] font-semibold text-gray-400">
          {audienceTag}
        </p>
      </div>
    </div>
  );
}

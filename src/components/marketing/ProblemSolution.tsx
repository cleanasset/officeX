"use client";

import React from "react";
import { X, Check } from "lucide-react";

export interface ProblemSolutionProps {
  moduleName: string;
  withoutItems: string[];
  withItems: string[];
  accentColor?: string;
}

export default function ProblemSolution({
  moduleName,
  withoutItems,
  withItems,
  accentColor = "#0F8B7D"
}: ProblemSolutionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-slate-50/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
            The OfficeX Transformation
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            See how {moduleName} replaces fragmented manual processes with structured digital workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Without Column */}
          <div className="bg-white rounded-2xl border border-red-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-50">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center font-bold">
                <X size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Without {moduleName}</h3>
                <p className="text-xs text-gray-400 font-medium">Status quo &amp; manual headaches</p>
              </div>
            </div>

            <ul className="space-y-4">
              {withoutItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100/70 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Column */}
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div
              className="flex items-center gap-3 mb-6 pb-4 border-b"
              style={{ borderColor: `${accentColor}20` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Check size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">With {moduleName}</h3>
                <p className="text-xs font-medium" style={{ color: accentColor }}>
                  Automated, verified &amp; SLA-governed
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              {withItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Check size={12} />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-800 font-bold leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

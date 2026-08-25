"use client";
import React, { useState } from "react";
import { Sparkles, FileText, ArrowRight } from "lucide-react";

export default function AIExecutiveSummary() {
  const [summary] = useState(
    "Overall operations for August 2026 are stable. Active dispatches are at 94% compliance. We observed a minor HVAC SLA breach in Meridian Tech Park due to replacement motor supply delays. Recommendations: Set up safety buffer inventory for BlueStar chiller spares to mitigate future down-times."
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Executive Summary</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">AI-generated operations overviews, recommendations, and anomaly detections checklists.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white max-w-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600" />
          Operations Intel & Recommendations
        </h3>
        <p className="text-xs text-gray-700 leading-relaxed italic bg-purple-50/30 p-4 rounded-xl border border-purple-100/50">
          "{summary}"
        </p>
        <div className="flex justify-end mt-2">
          <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-1.5">
            Export MIS Digest <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Send, CheckCircle, Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

export default function AIExecutiveSummaryDashboard() {
  const [property, setProperty] = useState("Apex Tower");
  const [tone, setTone] = useState("Board Format");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [focusAreas, setFocusAreas] = useState<string[]>(["Operations", "Financials", "SLA"]);

  const toggleFocus = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setToast("AI Executive Summary regenerated successfully!");
      setTimeout(() => setToast(null), 3500);
    }, 1200);
  };

  const handleApprove = () => {
    setToast("Report approved and emailed to stakeholders!");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">AI Executive Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Configure parameters and generate institutional-grade narrative reports.</p>
      </div>

      {/* Main Grid: Left Configuration Panel + Right Document Editor */}
      <div className="grid grid-cols-[360px_1fr] gap-6">
        {/* Left Config Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-base font-bold text-gray-900">Configuration</h2>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">SELECT PROPERTY</label>
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
            >
              <option>Apex Tower</option>
              <option>Meridian Park</option>
              <option>Nexus Hub</option>
              <option>Crystal Tower</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">FOCUS AREAS</label>
            <div className="p-2.5 border border-gray-200 rounded-xl flex flex-wrap gap-1.5 min-h-[52px]">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                >
                  {area}
                  <button onClick={() => toggleFocus(area)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">REPORT TONE</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
            >
              <option>Board Format</option>
              <option>Technical Operational</option>
              <option>Financial Executive</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">AI Processing Tracker</label>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Gathered data from active units
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Processed SLA breaching tickets
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Matched vendor payouts
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse flex items-center justify-center text-white text-[8px]">●</span> Formatting summary
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            ✨ {isGenerating ? "Generating Narrative..." : "Generate AI Executive Summary"}
          </button>
        </div>

        {/* Right Editor & Report Preview */}
        <div className="space-y-4">
          {/* Governance Alert Banner */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Governance Rule (G-08 compliance)</p>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                This summary is AI-generated and is in &lsquo;Pending Approval&rsquo; state. It must be manually reviewed and edited by an administrator before it can be shared or emailed.
              </p>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between min-h-[540px]">
            <div>
              {/* WYSIWYG Toolbar */}
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"><Bold size={14} /></button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"><Italic size={14} /></button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"><Underline size={14} /></button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"><List size={14} /></button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60"><ListOrdered size={14} /></button>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">Draft Mode - Auto-saved</span>
              </div>

              {/* Document Text Body */}
              <div className="p-8 space-y-6 text-sm text-gray-800 leading-relaxed">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Executive Summary: Apex Business Tower (Q3)
                </h2>

                <p>
                  Apex Business Tower continues to perform strongly, maintaining a <b className="text-gray-900 font-black">95% occupancy rate</b> across its premium commercial units. This stability in tenancy provides a solid foundation for projected Q4 revenues, aligning with the board&apos;s optimistic financial forecasting.
                </p>

                <p>
                  However, operational risk vectors require immediate attention. The facility&apos;s primary Electrical NOC is scheduled to expire in exactly 12 days. The engineering team has initiated the renewal protocol, but expedited processing is recommended to prevent any compliance breaches or potential disruptions to tenant operations.
                </p>

                <p>
                  On the financial front, significant cost optimizations have been identified and actioned. The planned transition to time-of-day metering for the HVAC central plant is projected to reduce monthly energy expenditure by approximately 14%. Implementation is scheduled for the upcoming maintenance window, representing a key efficiency win for the quarter.
                </p>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Regenerate
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={13} /> Approve & Email Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

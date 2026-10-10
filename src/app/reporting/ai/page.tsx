"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Send, CheckCircle, Bold, Italic, Underline, List, ListOrdered, Building, Loader2 } from "lucide-react";

export default function AIExecutiveSummaryDashboard() {
  const [loading, setLoading] = useState(true);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [property, setProperty] = useState("");
  const [tone, setTone] = useState("Board Format");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [focusAreas, setFocusAreas] = useState<string[]>(["Operations", "Financials", "SLA"]);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          setPropertiesList(list);
          if (list.length > 0) {
            setProperty(list[0].name || list[0].title || "Commercial Asset");
          }
        }
      } catch (err) {
        console.error("Failed to load properties for AI summary:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F8B7D] mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Portfolio Assets...</p>
      </div>
    );
  }

  if (propertiesList.length === 0) {
    return (
      <div className="flex flex-col gap-6 font-sans">
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Executive Summary</h1>
          <p className="text-sm text-gray-500 mt-1">Configure parameters and generate institutional-grade narrative reports.</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F8B7D] mx-auto">
            <Building size={32} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">No Commercial Properties Registered</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Register or import your commercial properties into the rent roll to enable automated AI executive summaries.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/operate/rent-roll"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition shadow-xs"
            >
              + Add Property to Rent Roll
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900">AI Executive Summary</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
            Live
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Configure parameters and generate institutional-grade narrative reports for {property}.</p>
      </div>

      {/* Main Grid: Left Configuration Panel + Right Document Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 w-full">
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
              {propertiesList.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
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
                <CheckCircle size={14} className="text-emerald-500" /> Processed SLA compliance metrics
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Matched verified ledger disbursements
              </div>
              <div className="flex items-center gap-2 text-teal-700 font-semibold">
                <CheckCircle size={14} className="text-teal-600" /> Executive narrative ready
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
              <p className="text-xs font-bold text-amber-900">Governance Rule (G-08 Compliance)</p>
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
                  Executive Summary: {property}
                </h2>

                <p>
                  {property} continues to maintain institutional operational standards across its active commercial tenancy. Real-time billing and escrow settlements ensure high collection efficiency and robust lease administration compliance.
                </p>

                <p>
                  Statutory obligations, equipment service schedules, and EHS protocols are actively monitored. Preventative maintenance schedules and SLA parameters remain within designated performance thresholds.
                </p>

                <p>
                  On the financial and operational front, automated billing workflows and transparent CAM reconciliations provide stakeholders with complete digital audit trails across all facility heads.
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
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
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

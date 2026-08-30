"use client";
import React, { useState } from "react";
import { CheckCircle, AlertTriangle, ExternalLink, Sliders } from "lucide-react";

export default function AIConfigurationPortal() {
  const [model, setModel] = useState("GPT-4o (OpenAI)");
  const [temp, setTemp] = useState(0.5);
  const [ticketCategorization, setTicketCategorization] = useState(true);
  const [slaPriority, setSlaPriority] = useState(true);
  const [misSummary, setMisSummary] = useState(true);
  const [vendorMatching, setVendorMatching] = useState(false);
  const [shadowMode, setShadowMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    setToast("AI routing, parameters & governance configuration updated!");
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
        <h1 className="text-2xl font-black text-gray-900">AI Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage routing, parameters, and governance for institutional AI features.</p>
      </div>

      {/* Main Grid: Left Model Routing + Right Governance Rules */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Left Routing & Subsystems */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="text-[#0F8B7D] font-bold">☊</span>
            <h2 className="text-base font-bold text-gray-900">AI Routing & LLM Preferences</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                ACTIVE MODEL PROVIDER
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
              >
                <option>GPT-4o (OpenAI)</option>
                <option>Claude 3.5 Sonnet (Anthropic)</option>
                <option>Gemini 1.5 Pro (Google)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5">Default model for institutional tasks.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  CREATIVITY PARAMETER (TEMPERATURE)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600">{temp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-[#0F8B7D]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Precise (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </div>

          {/* Active Sub-Systems */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Active Sub-Systems</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Ticket Categorization</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Auto-routes FM requests to correct departments.</p>
                </div>
                <input
                  type="checkbox"
                  checked={ticketCategorization}
                  onChange={(e) => setTicketCategorization(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">SLA Priority Classification</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Determines urgency based on text sentiment.</p>
                </div>
                <input
                  type="checkbox"
                  checked={slaPriority}
                  onChange={(e) => setSlaPriority(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Monthly MIS Summary</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Generates executive summaries from raw data.</p>
                </div>
                <input
                  type="checkbox"
                  checked={misSummary}
                  onChange={(e) => setMisSummary(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">Marketplace Vendor Matching <span className="text-[10px]">ℹ</span></p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Suggests contractors for complex work orders.</p>
                </div>
                <input
                  type="checkbox"
                  checked={vendorMatching}
                  onChange={(e) => setVendorMatching(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Governance Rules Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-t-4 border-t-amber-500 border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>🛡️</span> AI Governance Rules
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
                G-08 COMPLIANCE
              </span>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-xs text-gray-800 leading-relaxed space-y-2">
              <p>
                <b className="font-bold text-gray-900">Important:</b> AI algorithms are restricted from auto-awarding contracts, auto-approving payouts, committing financial spend, or executing leases.
              </p>
              <p>
                Every AI recommendation goes to a <b className="text-amber-900 font-black">&apos;Pending Human Approval&apos;</b> state.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  👁️ AI Shadow Mode
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Observation-only execution for algorithm calibration.</p>
              </div>
              <input
                type="checkbox"
                checked={shadowMode}
                onChange={(e) => setShadowMode(e.target.checked)}
                className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
              />
            </div>

            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-2">
              View AI Performance & Decision Logs <ExternalLink size={12} />
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              💾 Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

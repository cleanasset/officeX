"use client";

import React, { useState } from "react";
import { Sparkles, Save, ShieldAlert, Cpu } from "lucide-react";

export default function AIConfiguration() {
  const [model, setModel] = useState("gemini-2.0-pro");
  const [observationMode, setObservationMode] = useState(true);
  const [humanApprovalThreshold, setHumanApprovalThreshold] = useState("all_decisions");
  const [promptOverride, setPromptOverride] = useState(
    "You are the OfficeX AI Assistant. Summarize the following dispatch log and identify if SLAs were breached..."
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    // Simulate saving delay
    setTimeout(() => {
      setIsSaving(false);
      setMessage("AI configuration rules updated successfully!");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI & LLM Integration Settings</h1>
        <p className="text-sm text-gray-600 font-semibold mt-1">Configure models registry, prompt structures, observation modes, and human validation gates.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Model Selection */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Cpu size={18} className="text-red-500" />
            Model Registry Configuration
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active LLM Model</label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
            >
              <option value="gemini-2.0-pro">Gemini 2.0 Pro (Active)</option>
              <option value="gpt-4o">GPT-4o (Standard)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-teal-100 bg-teal-50/50">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">Shadow Mode</span>
              <span className="text-[10px] text-gray-600 mt-0.5">Observe & log predictions silently.</span>
            </div>
            <input 
              type="checkbox" 
              checked={observationMode}
              onChange={(e) => setObservationMode(e.target.checked)}
              className="w-4 h-4 text-primary-teal focus:ring-primary-teal border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Human Governance */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <ShieldAlert size={18} className="text-red-500" />
            AI Governance & Overrides
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Human Approval Gateways</label>
            <select 
              value={humanApprovalThreshold}
              onChange={(e) => setHumanApprovalThreshold(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
            >
              <option value="all_decisions">All Decisions require Approval</option>
              <option value="high_severity">Only High-Severity Decisions</option>
              <option value="none">Autonomous Mode (Observe only)</option>
            </select>
          </div>
        </div>

        {/* System Prompt Customizer */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-red-500" />
            System Prompt Override
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">System Prompt Template</label>
            <textarea 
              rows={5}
              value={promptOverride}
              onChange={(e) => setPromptOverride(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-full flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <Save size={14} />
            {isSaving ? "Saving Configuration..." : "Save Config Rules"}
          </button>
        </div>

      </form>

    </div>
  );
}

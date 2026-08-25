"use client";

import React, { useState } from "react";
import { Settings, Save, Database, ShieldCheck, Mail } from "lucide-react";

export default function PlatformConfiguration() {
  const [commission, setCommission] = useState("10.00");
  const [regions, setRegions] = useState("Mumbai, Bengaluru, Pune, Chennai, Delhi NCR");
  const [retention, setRetention] = useState("7 Years");
  const [backupSchedule, setBackupSchedule] = useState("Daily at 02:00 AM IST");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    // Simulate saving delay
    setTimeout(() => {
      setIsSaving(false);
      setMessage("Global platform settings successfully updated!");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Configuration</h1>
        <p className="text-sm text-gray-600 font-semibold mt-1">Configure global pricing thresholds, regions micro-markets, and database backups.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Core Financial Settings */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Settings size={18} className="text-red-500" />
            Financial & Commission Rules
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Platform Commission (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
            />
            <span className="text-[10px] text-gray-600 mt-1">Applied to gross FM work order transactions.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Taxation Regime (India)</label>
            <select className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white">
              <option>Standard GST 18% Rules</option>
              <option>Composition Scheme Rules</option>
            </select>
          </div>
        </div>

        {/* Operating Regions */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-red-500" />
            Active Operating Regions
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Regions List (Comma separated)</label>
            <textarea 
              rows={4}
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white resize-none"
            />
          </div>
        </div>

        {/* Database & Backups */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Database size={18} className="text-red-500" />
            Backups & Data Retention
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Backup Frequency</label>
            <input 
              type="text" 
              value={backupSchedule}
              onChange={(e) => setBackupSchedule(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Document Retention Policy</label>
            <select 
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
            >
              <option>3 Years</option>
              <option>5 Years</option>
              <option>7 Years</option>
              <option>10 Years</option>
            </select>
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
            {isSaving ? "Saving Settings..." : "Save Configuration"}
          </button>
        </div>

      </form>

    </div>
  );
}

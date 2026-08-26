"use client";

import React, { useState } from "react";
import { Settings, Save, Database, ShieldCheck, Mail, Clock, Key } from "lucide-react";

export default function PlatformConfiguration() {
  const [commission, setCommission] = useState("10.00");
  const [regions, setRegions] = useState("Mumbai, Bengaluru, Pune, Chennai, Delhi NCR");
  const [retention, setRetention] = useState("7 Years");
  const [backupSchedule, setBackupSchedule] = useState("Daily at 02:00 AM IST");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // SLA thresholds state
  const [slaThresholds, setSlaThresholds] = useState([
    { priority: "Critical", responseMins: 15, resolutionHours: 2 },
    { priority: "High", responseMins: 30, resolutionHours: 6 },
    { priority: "Medium", responseMins: 120, resolutionHours: 24 },
    { priority: "Low", responseMins: 240, resolutionHours: 48 }
  ]);

  // API credentials state
  const [apiCredentials, setApiCredentials] = useState({
    razorpayKeyId: "rzp_test_K2a8H1lP9w3x1c",
    razorpaySecret: "••••••••••••••••••••••••••••••••",
    twilioAuthToken: "••••••••••••••••••••••••••••••••",
    openaiApiKey: "••••••••••••••••••••••••••••••••"
  });

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

        {/* SLA Target Thresholds Input Grid */}
        <div className="md:col-span-2 premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Clock size={18} className="text-red-500" />
            Helpdesk Ticket SLA Target Thresholds
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2">Ticket Severity</th>
                  <th className="py-2">Response SLA Target (Mins)</th>
                  <th className="py-2">Resolution SLA Target (Hours)</th>
                </tr>
              </thead>
              <tbody>
                {slaThresholds.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 font-bold text-gray-900">{row.priority}</td>
                    <td className="py-2">
                      <input 
                        type="number" 
                        value={row.responseMins}
                        onChange={(e) => {
                          const updated = [...slaThresholds];
                          updated[idx].responseMins = parseInt(e.target.value) || 0;
                          setSlaThresholds(updated);
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold w-24 bg-white"
                      />
                    </td>
                    <td className="py-2">
                      <input 
                        type="number" 
                        value={row.resolutionHours}
                        onChange={(e) => {
                          const updated = [...slaThresholds];
                          updated[idx].resolutionHours = parseInt(e.target.value) || 0;
                          setSlaThresholds(updated);
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold w-24 bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Third-Party API Credentials Input Grid */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Key size={18} className="text-red-500" />
            Third-Party API Credentials
          </h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Razorpay Key ID</label>
              <input 
                type="text"
                value={apiCredentials.razorpayKeyId}
                onChange={(e) => setApiCredentials({ ...apiCredentials, razorpayKeyId: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-xl font-mono text-[10px] focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Razorpay Key Secret</label>
              <input 
                type="password"
                value={apiCredentials.razorpaySecret}
                onChange={(e) => setApiCredentials({ ...apiCredentials, razorpaySecret: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-xl font-mono text-[10px] focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Twilio Auth Token</label>
              <input 
                type="password"
                value={apiCredentials.twilioAuthToken}
                onChange={(e) => setApiCredentials({ ...apiCredentials, twilioAuthToken: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-xl font-mono text-[10px] focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">OpenAI API Secret Key</label>
              <input 
                type="password"
                value={apiCredentials.openaiApiKey}
                onChange={(e) => setApiCredentials({ ...apiCredentials, openaiApiKey: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-xl font-mono text-[10px] focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
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

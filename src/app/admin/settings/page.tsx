"use client";
import React, { useState } from "react";
import { CheckCircle, Save, Plus } from "lucide-react";

export default function PlatformConfigurationDashboard() {
  const [commissionRate, setCommissionRate] = useState(10);
  const [hourlyBackup, setHourlyBackup] = useState(true);
  const [offsiteReplication, setOffsiteReplication] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const exceptions = [
    { cat: "Security", rate: "8%" },
    { cat: "Housekeeping", rate: "12%" }
  ];

  const slaTargets = [
    { prio: "Critical", prioColor: "text-red-600 font-bold", resp: "1h", resol: "4h" },
    { prio: "High", prioColor: "text-amber-600 font-bold", resp: "4h", resol: "24h" },
    { prio: "Medium", prioColor: "text-blue-600 font-bold", resp: "8h", resol: "48h" },
    { prio: "Low", prioColor: "text-gray-700 font-semibold", resp: "24h", resol: "72h" }
  ];

  const handleSave = () => {
    setToast("Platform schemas, commission rates, and API keys saved!");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Platform Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Admin &gt; Configuration Settings</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Save size={14} /> Save Settings
        </button>
      </div>

      {/* Section 1: Financial & Service Level Schemas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900">Financial & Service Level Schemas</h2>

        <div className="grid grid-cols-[1fr_1fr] gap-8">
          {/* Left: Marketplace Commission */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-700">Marketplace Commission</h3>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Default Rate (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Category Exceptions</span>
                <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Category Exception
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-gray-50 p-2.5 px-4 font-bold text-[10px] text-gray-400 uppercase">
                  <span>CATEGORY</span>
                  <span className="text-right">RATE (%)</span>
                </div>
                {exceptions.map((ex) => (
                  <div key={ex.cat} className="grid grid-cols-2 p-3 px-4 border-t border-gray-100 items-center font-semibold">
                    <span className="text-gray-800">{ex.cat}</span>
                    <span className="text-right text-gray-900 font-bold">{ex.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: SLA Targets */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-700">SLA Targets</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-gray-50 p-2.5 px-4 font-bold text-[10px] text-gray-400 uppercase">
                <span>PRIORITY</span>
                <span>RESPONSE TARGET</span>
                <span className="text-right">RESOLUTION TARGET</span>
              </div>
              {slaTargets.map((sla) => (
                <div key={sla.prio} className="grid grid-cols-3 p-3 px-4 border-t border-gray-100 items-center">
                  <span className={sla.prioColor}>{sla.prio}</span>
                  <span className="text-gray-700 font-semibold">{sla.resp}</span>
                  <span className="text-right text-gray-700 font-semibold">{sla.resol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: APIs & Data Governance */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900">APIs & Data Governance</h2>

        <div className="grid grid-cols-[1fr_1fr] gap-8">
          {/* Left: API Status Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-700">API Status Grid</h3>

            {/* MSG91 / Twilio SMS */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-800">MSG91 / TWILIO SMS</span>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Account SID</label>
                <input
                  type="password"
                  defaultValue="****************************"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Auth Token / Secret</label>
                <input
                  type="password"
                  defaultValue="****************************"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Gupshup WhatsApp */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-800">GUPSHUP WHATSAPP</span>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">API Key</label>
                <input
                  type="password"
                  defaultValue="****************************"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right: Backup & Recovery */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-700">Backup & Recovery</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">Hourly Database Backups</span>
                <input
                  type="checkbox"
                  checked={hourlyBackup}
                  onChange={(e) => setHourlyBackup(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">Daily Off-site S3 Replication</span>
                <input
                  type="checkbox"
                  checked={offsiteReplication}
                  onChange={(e) => setOffsiteReplication(e.target.checked)}
                  className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-800">Data Retention Period</span>
                  <span className="text-xs font-black text-emerald-700">7 Years</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "70%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1 Yr</span>
                  <span className="text-emerald-700 font-semibold">(G-16 Compliant)</span>
                  <span>10 Yrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

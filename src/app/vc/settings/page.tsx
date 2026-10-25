"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  Building,
  Bell,
  Sliders,
  CheckCircle2,
  Save,
  Lock,
  Layers,
  ChevronLeft,
} from "lucide-react";

export default function VisitorComplianceSettingsPage() {
  const [requireHostApproval, setRequireHostApproval] = useState(true);
  const [autoApproveVip, setAutoApproveVip] = useState(true);
  const [maxVisitHours, setMaxVisitHours] = useState(8);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {savedNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Policies & rules updated successfully across all turnstiles.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200 font-bold">System Configuration (VC-15 / CM-16)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Facility Rules & Policy Configuration</h1>
          <p className="text-xs text-slate-400">
            Manage turnstile thresholds, gate approval workflows, and automated statutory escalation windows.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Gate & Approval Policies */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-extrabold text-white">Turnstile & Visitor Policies (VC-15)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-bold text-white">Mandatory Host Approval Before Entry</div>
                <div className="text-slate-400 mt-0.5">Guests cannot pass turnstiles until host accepts via mobile link.</div>
              </div>
              <input
                type="checkbox"
                checked={requireHostApproval}
                onChange={(e) => setRequireHostApproval(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-bold text-white">Auto-Authorize VIP Category Passes</div>
                <div className="text-slate-400 mt-0.5">Bypass approval queue for visitors designated as VIP dignitary.</div>
              </div>
              <input
                type="checkbox"
                checked={autoApproveVip}
                onChange={(e) => setAutoApproveVip(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Maximum Permitted Visit Duration</div>
                <div className="text-slate-400 mt-0.5">Triggers overstay alert if visitor has not checked out past this limit.</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={maxVisitHours}
                  onChange={(e) => setMaxVisitHours(parseInt(e.target.value) || 8)}
                  className="w-16 bg-slate-900 border border-slate-700 text-center py-1 rounded-lg text-white font-mono"
                />
                <span className="text-slate-400">hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Compliance Escalation */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Compliance Expiry Alert Windows (CM-16)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">First Alert</span>
              <span className="font-black text-white text-base">90 Days Prior</span>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Second Alert</span>
              <span className="font-black text-white text-base">60 Days Prior</span>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Warning Notice</span>
              <span className="font-black text-amber-400 text-base">30 Days Prior</span>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Critical Escalation</span>
              <span className="font-black text-rose-400 text-base">7 Days Prior</span>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Channels */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-extrabold text-white">Dispatched Notification Channels</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <span className="font-bold text-white">Email Notifications (Host Arrival & Statutory Reminders)</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <span className="font-bold text-white">SMS Gateway (Turnstile QR Fast-Pass Link)</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

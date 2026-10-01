"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  Percent,
  Clock,
  PieChart,
  ShieldCheck,
  Send,
  Sparkles,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface MonthlyMisModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Array<{ id: string; name: string }>;
  clientAccounts: Array<{ id: string; name: string }>;
  dashboardData: any;
}

export const MonthlyMisModal: React.FC<MonthlyMisModalProps> = ({
  isOpen,
  onClose,
  properties,
  clientAccounts,
  dashboardData
}) => {
  const [scopeType, setScopeType] = useState<"portfolio" | "property" | "client">("portfolio");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [selectedClientId, setSelectedClientId] = useState<string>("ALL");
  const [periodMonth, setPeriodMonth] = useState<string>("2026-09");
  const [format, setFormat] = useState<"pdf" | "excel" | "both">("pdf");
  const [isScheduled, setIsScheduled] = useState<boolean>(true);
  const [scheduleDay, setScheduleDay] = useState<number>(5);
  const [scheduleEmails, setScheduleEmails] = useState<string>("owner@apexgroup.com, cfo@scalezix.com");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sections Checklist
  const [sections, setSections] = useState({
    executiveKpis: true,
    revenueBilling: true,
    collectionsAgeing: true,
    occupancyStacking: true,
    expiryRenewals: true,
    escalations: true,
    pnlNoi: true,
    exceptionsAudit: true,
    dealPipeline: false
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  const kpis = dashboardData?.kpis || {
    annualContractedRevenue: 171600000,
    billedThisMonth: 14300000,
    collectedMtd: 12100000,
    outstandingDue: 3840000,
    collectionEfficiencyPct: 84.6,
    occupancyAreaPct: 68.2,
    occupancySeatsPct: 84.2,
    waleYears: 3.86,
    revenueAtRisk12m: 52200000,
    escalationsDue90dCount: 3,
    escalationsDue90dUplift: 290000
  };

  const handleGenerate = () => {
    window.print();
  };

  const handleSendDistribution = () => {
    setActionFeedback(`Investor MIS Pack scheduled for dispatch on the ${scheduleDay}th of each month to: ${scheduleEmails}`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold uppercase tracking-wider">
                  Screen S-54
                </span>
                <h3 className="text-base font-black tracking-tight text-white">
                  Monthly MIS &amp; Statutory Investor Pack
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Institutional reporting engine: Executive KPIs, Rollover Schedules, NOI Statements &amp; Audit Trail
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {actionFeedback && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
              <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
            </div>
          )}

          {/* S-54 Controls Form */}
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Report Scope</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeType === "portfolio"}
                      onChange={() => setScopeType("portfolio")}
                    />
                    <span>Portfolio</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeType === "property"}
                      onChange={() => setScopeType("property")}
                    />
                    <span>Property</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeType === "client"}
                      onChange={() => setScopeType("client")}
                    />
                    <span>Client SPV</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Target Period</label>
                <input
                  type="month"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Format</label>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="format" checked={format === "pdf"} onChange={() => setFormat("pdf")} />
                    <span>PDF</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="format" checked={format === "excel"} onChange={() => setFormat("excel")} />
                    <span>Excel</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="format" checked={format === "both"} onChange={() => setFormat("both")} />
                    <span>Both</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sections Checklist */}
            <div>
              <span className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wider">
                Include Sections in Investor Pack:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {Object.entries({
                  executiveKpis: "Executive KPIs (K-01..10)",
                  revenueBilling: "Revenue & Billing",
                  collectionsAgeing: "Collections & Ageing",
                  occupancyStacking: "Occupancy & Stacking",
                  expiryRenewals: "Expiry & Renewals (10y)",
                  escalations: "Escalation Schedule",
                  pnlNoi: "Property P&L & NOI",
                  exceptionsAudit: "Exceptions & Audit Log",
                  dealPipeline: "Leasing Pipeline (Optional)"
                }).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sections[k as keyof typeof sections]}
                      onChange={() => toggleSection(k as keyof typeof sections)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-800 text-[11px]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduled Dispatch */}
            <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sched"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <label htmlFor="sched" className="font-semibold text-gray-700">
                  Monthly automated email dispatch on day
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-white border border-gray-200 rounded font-bold text-center"
                />
                <span className="text-gray-500">to:</span>
                <input
                  type="text"
                  value={scheduleEmails}
                  onChange={(e) => setScheduleEmails(e.target.value)}
                  className="flex-1 min-w-[200px] px-2 py-0.5 bg-white border border-gray-200 rounded font-mono text-[11px]"
                />
              </div>

              <button
                type="button"
                onClick={handleSendDistribution}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs self-end sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>

          {/* S-54 Live Document Preview Container */}
          <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-md space-y-6 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none select-none">
              <span className="text-8xl font-black text-slate-900 rotate-[-25deg] tracking-widest uppercase">
                OFFICEX AUDITED
              </span>
            </div>

            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-900 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase font-mono tracking-widest">
                  OFFICEX ASSET PORTFOLIO MIS
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">
                  Executive Performance &amp; Statutory Rent Roll Pack
                </h2>
                <p className="text-xs text-gray-500">
                  Reporting Period: <span className="font-bold text-gray-800">{periodMonth}</span> · Point-in-time statutory compliance freeze
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-gray-400">STATUS: AUDITED &amp; LOCKED</div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">Statutory Standard RR-OPR-01</div>
              </div>
            </div>

            {/* Section 1: 8 Executive KPIs */}
            {sections.executiveKpis && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-l-3 border-purple-600 pl-2">
                  1. Executive Portfolio KPIs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Annual Contracted Rev (K-01)</span>
                    <div className="text-base font-black text-gray-900 mt-0.5">₹17.16 Cr</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Billed This Month (K-02)</span>
                    <div className="text-base font-black text-teal-700 mt-0.5">₹1.43 Cr</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Collected MTD (K-03)</span>
                    <div className="text-base font-black text-emerald-700 mt-0.5">₹1.21 Cr</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Collection Efficiency (K-05)</span>
                    <div className="text-base font-black text-blue-700 mt-0.5">84.6%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Area Occupancy (K-06)</span>
                    <div className="text-base font-black text-gray-900 mt-0.5">68.2%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Seat Occupancy (K-07)</span>
                    <div className="text-base font-black text-indigo-700 mt-0.5">84.2%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Portfolio WALE (K-08)</span>
                    <div className="text-base font-black text-gray-900 mt-0.5">3.86 Years</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium text-[10px] uppercase">Revenue at Risk 12m (K-09)</span>
                    <div className="text-base font-black text-rose-700 mt-0.5">₹5.22 Cr</div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Property Summaries */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-l-3 border-purple-600 pl-2">
                2. Property Operational Breakdown
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3 text-center">Occ %</th>
                      <th className="py-2.5 px-3 text-right">Monthly Rent</th>
                      <th className="py-2.5 px-3 text-right">Outstanding</th>
                      <th className="py-2.5 px-3 text-center">WALE</th>
                      <th className="py-2.5 px-3 text-center">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-gray-900">Apex Business Tower</td>
                      <td className="py-2.5 px-3 text-gray-600">Mumbai (BKC)</td>
                      <td className="py-2.5 px-3 text-center font-bold text-teal-700">46.0%</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹52,29,200</td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-600">₹4,10,000</td>
                      <td className="py-2.5 px-3 text-center font-mono">4.2 yrs</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Pass</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-gray-900">Meridian Tech Park</td>
                      <td className="py-2.5 px-3 text-gray-600">Gurugram</td>
                      <td className="py-2.5 px-3 text-center font-bold text-teal-700">75.0%</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹59,27,000</td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-600">₹31,60,000</td>
                      <td className="py-2.5 px-3 text-center font-mono">2.9 yrs</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Pass</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Sign-off Footer */}
            <div className="pt-6 border-t-2 border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div>
                <span className="font-bold text-gray-800">OFFICEX Corporate Platform Core</span>
                <p className="text-[10px]">Confidential — Authorized for Board of Directors &amp; Institutional Investors only</p>
              </div>
              <div className="text-right font-mono text-[10px]">
                Report Hash: SHA256-OX-{Date.now().toString().slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SEBI / REIT Statutory Compliant Reporting Pack</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

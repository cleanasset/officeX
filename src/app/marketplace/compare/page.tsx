"use client";
import React, { useState } from "react";
import { Star, CheckCircle, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Award } from "lucide-react";

export default function QuoteComparisonBoard() {
  const [selectedVendor, setSelectedVendor] = useState("TechServe");
  const [auditNotes, setAuditNotes] = useState("TechServe selected based on highest weighted composite score (91/100), lowest 2-hour emergency SLA, and fully verified statutory PF/ESIC compliance.");
  const [escrowHold, setEscrowHold] = useState(true);
  const [milestoneSplit, setMilestoneSplit] = useState("80% Monthly + 20% Outcome Milestone");
  const [toast, setToast] = useState<string | null>(null);

  const vendors = [
    { name: "TechServe", score: 91, badge: "Recommended Winner", tagColor: "bg-emerald-100 text-emerald-800" },
    { name: "MEP Experts", score: 84, badge: "Higher SLA", tagColor: "bg-blue-100 text-blue-800" },
    { name: "ElectroMech", score: 78, badge: "Higher Price", tagColor: "bg-gray-100 text-gray-800" }
  ];

  const criteria = [
    { label: "Vendor Performance Score", values: ["91 / 100", "84 / 100", "78 / 100"], highlight: true },
    { label: "Base Monthly Quote", values: ["₹1,85,000", "₹2,10,000", "₹1,95,000"] },
    { label: "GST (18%)", values: ["₹33,300", "₹37,800", "₹35,100"] },
    { label: "Gross Monthly Quote", values: ["₹2,18,300", "₹2,47,800", "₹2,30,100"], highlight: true },
    { label: "Manpower Deployment", values: ["5 (3 Tech, 2 Helper)", "6 (4 Tech, 2 Helper)", "4 (2 Tech, 2 Helper)"] },
    { label: "Materials & Spares", values: ["Consumables Included", "Up to ₹10k/mo limit", "Billable at Actuals"] },
    { label: "Emergency Response SLA", values: ["2 Hours", "4 Hours", "6 Hours"], best: 0 },
    { label: "Statutory Compliance (PF/ESIC)", values: ["100% Verified", "100% Verified", "Pending Audit"], best: 0 },
    { label: "12-Month Total Cost of Ownership", values: ["₹26,19,600", "₹29,73,600", "₹27,61,200"], highlight: true }
  ];

  const scoreBreakdown = [
    { label: "Price Competitiveness (25%)", val: "24 / 25" },
    { label: "SLA & Response Time (20%)", val: "19 / 20" },
    { label: "Technical Capability (15%)", val: "14 / 15" },
    { label: "Work Quality & Cleanliness (15%)", val: "14 / 15" },
    { label: "Compliance & Safety (10%)", val: "10 / 10" },
    { label: "Experience & Track Record (10%)", val: "9 / 10" },
    { label: "ESG & Sustainability (5%)", val: "5 / 5" }
  ];

  const handleAward = () => {
    setToast("Work Order awarded to TechServe Solutions! Configurable Escrow milestone agreement generated.");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">RFQ Quote Comparison &amp; Selection</h1>
          <p className="text-xs text-gray-500 mt-0.5">Weighted Decision Matrix for Q3 MEP &amp; HVAC Contract (RFP-2026-MEP-003)</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold text-[11px] border border-teal-100 flex items-center gap-1.5">
            <Sparkles size={13} /> Transparent Decision Intelligence
          </span>
        </div>
      </div>

      {/* Comparison Table with Mobile Scroll */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 overflow-x-auto shadow-2xs w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70">
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-[260px]">Evaluation Criteria</th>
              {vendors.map((v, i) => (
                <th key={v.name} className="py-4 px-6 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <label className="cursor-pointer flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="vendor"
                        value={v.name}
                        checked={selectedVendor === v.name}
                        onChange={() => setSelectedVendor(v.name)}
                        className="accent-[#0F8B7D] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-black text-gray-900">{v.name}</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${v.tagColor}`}>
                      {v.badge}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((row) => (
              <tr key={row.label} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className={`py-3.5 px-6 text-xs ${row.highlight ? "font-bold text-gray-900 bg-gray-50/30" : "text-gray-600"}`}>
                  {row.label}
                </td>
                {row.values.map((val, i) => (
                  <td key={i} className={`py-3.5 px-6 text-center text-xs ${
                    row.highlight && i === 0 ? "font-black text-[#0F8B7D] text-sm" : 
                    row.highlight ? "font-bold text-gray-900" : 
                    row.best === i ? "font-bold text-[#0F8B7D]" : "text-gray-700"
                  }`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Summary & Weighted Vendor Performance Breakdown */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Left: Explainable Selection & Milestone Payout Rules */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Award size={18} className="text-[#0F8B7D]" />
            <h2 className="text-sm font-bold text-gray-900">Award Contract to Recommended Vendor</h2>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-emerald-900">
            <p className="font-bold">Recommended: TechServe Solutions (₹2,18,300 / mo)</p>
            <p className="text-[11px] leading-relaxed">
              Provides the lowest 12-month TCO (₹26.2L vs ₹29.7L) while maintaining 2-hour response SLA and 100% verified PF/ESIC statutory compliance.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AUDIT & JUSTIFICATION NOTES (RECORDED IN AUDIT TRAIL)</label>
            <textarea
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CONFIGURABLE MILESTONE PAYOUT RULE</label>
              <select
                value={milestoneSplit}
                onChange={(e) => setMilestoneSplit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
              >
                <option>80% Monthly Base + 20% Outcome Milestone</option>
                <option>90% Monthly Base + 10% SLA Retention</option>
                <option>100% Monthly on Service Sign-off</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="escrow"
                checked={escrowHold}
                onChange={(e) => setEscrowHold(e.target.checked)}
                className="w-4 h-4 accent-[#0F8B7D] cursor-pointer"
              />
              <label htmlFor="escrow" className="text-xs text-gray-700 font-semibold cursor-pointer">
                Hold payout in Razorpay Escrow until monthly PPM sign-off
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAward}
              className="px-8 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              Award Contract & Generate PO <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right: Score Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">OFFICEX VENDOR SCORE</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">
              91 <span className="text-xs font-normal text-gray-400">/ 100</span>
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {scoreBreakdown.map((s) => (
              <div key={s.label} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">{s.label}</span>
                <span className="font-bold text-gray-900">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

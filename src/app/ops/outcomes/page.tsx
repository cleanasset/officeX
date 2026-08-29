"use client";

import React, { useState } from "react";
import { TrendingUp, ShieldCheck, Star, Zap, Clock, Thermometer, Droplets, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function OutcomeBasedFM() {
  const outcomes = [
    { name: "Cleanliness Score", score: 94, target: 95, trend: "+2%", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Comfort Score", score: 88, target: 90, trend: "+1%", icon: Thermometer, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Asset Availability", score: 96, target: 98, trend: "-1%", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Service Quality", score: 91, target: 90, trend: "+3%", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "SLA Compliance", score: 89, target: 95, trend: "-2%", icon: Clock, color: "text-red-600", bg: "bg-red-50" },
    { name: "Experience Rating", score: 92, target: 90, trend: "+4%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const exceptions = [
    { severity: "Critical", issue: "HVAC Unit AHU-03 failure — Floor 4 ambient temp 29°C", action: "Emergency vendor dispatch initiated", time: "12 min ago" },
    { severity: "At Risk", issue: "Housekeeping SLA approaching breach — Restroom Block B", action: "Supervisor escalation triggered", time: "28 min ago" },
    { severity: "At Risk", issue: "Lift #2 intermittent shutdown — Building A", action: "AMC vendor notified, ETA 45 min", time: "1h ago" },
  ];

  const costOutcomes = [
    { label: "Cost per Sq.Ft.", value: "₹18.5", trend: "-3% MoM" },
    { label: "Cost per Seat", value: "₹1,240", trend: "-1% MoM" },
    { label: "Energy / Sq.Ft.", value: "₹4.2", trend: "-8% MoM" },
    { label: "Recurrence Rate", value: "4.2%", trend: "-0.8% MoM" },
  ];

  const overallScore = Math.round(outcomes.reduce((sum, o) => sum + o.score, 0) / outcomes.length);

  return (
    <div className="flex flex-col gap-8 font-sans text-slate-900 bg-slate-50/20 p-2">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Outcome-Based FM Dashboard</h1>
        <p className="text-xs text-slate-500 font-bold mt-1">Measure outcomes rather than manpower — quality, availability, experience, SLA and cost.</p>
      </div>

      {/* Hero Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F8B7D] to-emerald-700 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Overall FM Outcome Score</span>
            <div className="text-5xl font-black mt-2">{overallScore}<span className="text-lg opacity-60"> / 100</span></div>
            <span className="text-xs font-semibold opacity-80 mt-1 block">Across 6 outcome dimensions • August 2026</span>
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center">
            <TrendingUp size={36} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Outcome Dimension Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {outcomes.map((o) => {
          const atTarget = o.score >= o.target;
          return (
            <div key={o.name} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${o.bg} flex items-center justify-center`}>
                  <o.icon size={16} className={o.color} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{o.name}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{o.score}%</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-slate-400 font-bold">Target: {o.target}%</span>
                <span className={`text-[9px] font-bold ${atTarget ? "text-emerald-600" : "text-red-600"}`}>{o.trend}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 mt-2">
                <div className={`h-full rounded-full ${atTarget ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${o.score}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exceptions Panel */}
      <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-red-500" /> Active Exceptions & Alerts
        </h3>
        <div className="flex flex-col gap-3">
          {exceptions.map((ex, i) => (
            <div key={i} className={`p-4 rounded-xl border ${ex.severity === "Critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${ex.severity === "Critical" ? "text-red-700" : "text-amber-700"}`}>{ex.severity}</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{ex.issue}</p>
                  <p className="text-[10px] text-slate-600 font-semibold mt-1 flex items-center gap-1">
                    <ArrowRight size={10} /> {ex.action}
                  </p>
                </div>
                <span className="text-[9px] text-slate-500 font-semibold whitespace-nowrap ml-3">{ex.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Outcomes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {costOutcomes.map((c) => (
          <div key={c.label} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{c.label}</span>
            <div className="text-xl font-black text-slate-900 mt-1.5">{c.value}</div>
            <span className="text-[9px] font-bold text-emerald-600 mt-1 block">{c.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

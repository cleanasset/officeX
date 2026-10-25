"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Users,
  AlertTriangle,
  Building2,
  Lock,
  Layers,
  FileCheck2,
  Flame,
  Activity,
  ChevronRight,
  HardHat,
  Truck,
  Eye,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

export default function VisitorComplianceLandingPage() {
  const [activeTab, setActiveTab] = useState<"visitor" | "compliance" | "emergency" | "contractor">("visitor");

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <MarketingHeader activePath="/visitor-compliance" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-600/25 via-emerald-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            The Commercial Alternative to MyGate
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Intelligent Front-Desk & Statutory Compliance for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Commercial Real Estate.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-slate-300 text-sm sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Eliminate paper logbooks, unvetted contractors, and missed statutory fire & lift deadlines. A unified SaaS engine engineered specifically for multi-tenant commercial towers, business parks, and managed workspaces.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/visitor-compliance/pricing"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 group"
            >
              <span>Get Started for ₹999/mo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/vc/dashboard"
              className="px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-lg"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Launch Live SaaS Dashboard</span>
            </Link>
          </div>

          {/* Micro Trust Banner */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instant coupon <code className="text-blue-400 font-mono font-bold">visitor001</code> for 100% off
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero specialized hardware needed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Independent from Rent Roll
            </span>
          </div>

          {/* Key Metrics Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white">3.2 Sec</div>
              <div className="text-xs text-slate-400 mt-1">Average QR Check-in Time</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.8%</div>
              <div className="text-xs text-slate-400 mt-1">Audit-Ready Compliance Score</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">1-Click</div>
              <div className="text-xs text-slate-400 mt-1">Emergency Evacuation Roll Call</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white">₹999</div>
              <div className="text-xs text-slate-400 mt-1">Flat Monthly SaaS Pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Deep Dive */}
      <section className="py-20 bg-slate-950/70 border-t border-b border-slate-900 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Complete Feature Arsenal
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
              Two Powerful SaaS Capabilities In One Seamless Dashboard
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base mt-2">
              Visitor Security (VC-01 to VC-15) and Statutory Compliance Governance (CM-01 to CM-16) designed to work harmoniously for modern commercial facility directors.
            </p>

            {/* Feature Tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab("visitor")}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === "visitor"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Visitor Lifecycle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === "compliance"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Statutory & EHS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("emergency")}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === "emergency"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Emergency Roll Call</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contractor")}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === "contractor"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <HardHat className="w-4 h-4" />
                <span>Contractor & PTW</span>
              </button>
            </div>
          </div>

          {/* Active Tab Showcase Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            {activeTab === "visitor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md">
                    Visitor Module (VC-01 → VC-15)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Touchless QR Check-In & Instant Host Approvals
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Hosts send pre-registration links via WhatsApp/Email. When guests arrive at the reception or turnstiles, a 2-second QR scan validates their entry, notifies the corporate host, and prints or issues a digital pass.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Host notification with Accept, Decline, or Wait actions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Live inside counter with automatic overstay detection alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Security Watchlist check against blacklisted persons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Vehicle registration & allocated parking slot tracking</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/vc/visitors/live"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      <span>Explore Live Inside Dashboard</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Simulated UI Mockup */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        PASS-2026-0891
                      </span>
                    </div>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      ACTIVE INSIDE
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5">
                      <QrCode className="w-full h-full text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Vikram Malhotra</div>
                      <div className="text-xs text-slate-400">Apex Global Advisory</div>
                      <div className="text-[11px] text-blue-400 mt-1">Host: Arun Jaitley (TechCorp)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-slate-500">Check-in:</span>
                      <div className="text-slate-200 font-medium">10:15 AM (Lobby)</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Permitted Zone:</span>
                      <div className="text-slate-200 font-medium">Tower 1 • Floor 8</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    Compliance Module (CM-01 → CM-16)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Automated Statutory Expiry & EHS Governance
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Never face penalties or facility shutdowns due to expired fire licenses, overdue elevator certifications, or lapses in environmental STP compliance. Our automated radar alerts owners 90, 60, 30, and 7 days prior.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unified Register for Fire, Electrical, Lift, Pollution & Labour Laws</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Weighted Compliance Scoring (0-100%) with severity weighting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>CAPA (Corrective Action) workflows tied directly to audit findings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Tamper-proof digital document storage for inspection evidence</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/vc/compliance"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>View Compliance Register</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Simulated UI Mockup */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="text-xs font-bold text-slate-200">
                      CyberCity Tech Tower — Facility Score
                    </div>
                    <span className="text-sm font-black text-emerald-400">94.5% A+</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Form 15 Fire Certificate</div>
                          <div className="text-[10px] text-slate-400">State Fire Services • Annual Renewal</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Compliant
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Elevator & Lift License (8 Cars)</div>
                          <div className="text-[10px] text-slate-400">Chief Electrical Inspector</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Due in 12 Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2.5 py-1 rounded-md">
                    Emergency Evacuation (VC-13)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    One-Click Roll Call in Emergency Events
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    In the event of a fire drill or real building evacuation, security heads and fire marshals can trigger a 1-click Emergency Roll Call to generate an exact headcount of every visitor and contractor inside, sorted by tower and floor.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Instant count of active visitors inside by building core & zone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Check-off marking: 'Safe at Assembly Area' vs 'Missing / Trapped'</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>One-click export for Fire Brigade & Municipal Incident Responders</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/vc/visitors/emergency"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300"
                    >
                      <span>Simulate Emergency Roll Call</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Simulated UI Mockup */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-rose-900/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                      <span className="text-xs font-bold text-rose-400">EMERGENCY PROTOCOL READY</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-rose-950/60 px-2.5 py-1 rounded border border-rose-700/50">
                      Inside: 3 Visitors
                    </span>
                  </div>

                  <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">Tower 1 • Floor 8</span>
                      <span className="text-rose-300 font-mono">1 Person</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">Tower 1 • Lift Core</span>
                      <span className="text-rose-300 font-mono">1 Contractor</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">Tower 1 • Floor 4</span>
                      <span className="text-rose-300 font-mono">1 Guest</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contractor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                    Contractor & Permits (VC-11 & CM-09)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Permit-to-Work (PTW) & High-Risk Access Control
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Stop unvetted third-party technicians from working on live electrical panels, high-rise facades, or welding without digital risk authorization. Tie every contractor entry pass directly to an approved Permit-to-Work.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Digital Hot Work, Height Work & Electrical Isolation PTW</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Mandatory PPE checklist verification at reception</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Linked vendor statutory ESI/PF & liability insurance validity</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/vc/compliance/permits"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                    >
                      <span>Explore Permit Management</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Simulated UI Mockup */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="text-xs font-bold text-amber-400">PTW-2026-0042 • Hot Work</div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      PERMIT APPROVED
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="text-white font-semibold">Elevator Machine Room Servicing</div>
                    <div className="text-slate-400 text-[11px]">Vendor: Otis Elevator India Pvt Ltd</div>
                    <div className="text-[11px] text-emerald-400">Controls: Fire extinguisher standby & PPE verified</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900/90 to-emerald-950/60 border border-slate-800 p-8 sm:p-14 text-center relative z-10 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Upgrade Your Commercial Building Front Desk Today
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Get instant access for ₹999/month, or use launch promo code <code className="text-emerald-400 font-mono font-bold">visitor001</code> for 100% free access.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/visitor-compliance/pricing"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>View Plans & Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vc/dashboard"
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
            >
              Explore SaaS Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

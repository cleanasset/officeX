"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Cpu,
  Building,
  Users,
  Lock,
  ArrowUpRight,
  ChevronDown,
  Download,
  Clock,
  Eye,
  Check,
  Sparkles,
  Layers,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import ComplianceOperationsCenter from "@/components/compliance/ComplianceOperationsCenter";
import VisitorManagementConsole from "@/components/visitor/VisitorManagementConsole";
import SubscriptionGateModal from "@/components/visitor/SubscriptionGateModal";

export default function ComplianceCalendarProductPage() {
  // Default viewMode MUST BE overview (landing page showcase), exactly like rent-roll
  const [viewMode, setViewMode] = useState<"workspace" | "overview">("overview");
  const [activeModule, setActiveModule] = useState<"compliance" | "visitors">("compliance");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subGateOpen, setSubGateOpen] = useState(false);
  const [pendingModule, setPendingModule] = useState<"compliance" | "visitors">("compliance");

  // Live obligations summary
  const [scorecard, setScorecard] = useState<any>(null);

  useEffect(() => {
    // 1. Check local storage / cookies for active subscription
    if (typeof window !== "undefined") {
      const localSub =
        localStorage.getItem("officex_vc_sub_active") === "active" ||
        sessionStorage.getItem("officex_vc_sub_active") === "active" ||
        document.cookie.includes("officex_vc_sub_active=active");
      setIsSubscribed(localSub);
    }

    // 2. Sync with server database status
    async function checkServerSub() {
      try {
        const subRes = await fetch("/api/vc/subscription/status");
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData?.subscribed) {
            setIsSubscribed(true);
            if (typeof window !== "undefined") {
              localStorage.setItem("officex_vc_sub_active", "active");
            }
          }
        }
      } catch {}
    }
    checkServerSub();

    async function loadScorecard() {
      try {
        const res = await fetch("/api/v1/compliance/obligations");
        if (res.ok) {
          const data = await res.json();
          setScorecard(data);
        }
      } catch (e) {
        console.error("Scorecard fetch error:", e);
      }
    }
    loadScorecard();
  }, []);

  const handleOpenWorkspace = (module: "compliance" | "visitors" = "compliance") => {
    setActiveModule(module);
    if (isSubscribed) {
      setViewMode("workspace");
    } else {
      setPendingModule(module);
      setSubGateOpen(true);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const statutoryLicenses = [
    {
      title: "Fire Safety NOC (Form B)",
      authority: "State Fire & Emergency Services",
      frequency: "Half-Yearly Renewal",
      status: "Valid Compliant",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Flame,
      coverage: "Sprinkler pressure testing, hose reels, smoke evacuation dampers, riser pumps & certified fire drill log."
    },
    {
      title: "Lift License (Form A)",
      authority: "Electrical Inspectorate & Lift Act",
      frequency: "Annual License",
      status: "Renewal In Progress (18d)",
      statusColor: "text-amber-800 bg-amber-50 border-amber-200",
      icon: Cpu,
      coverage: "Passenger elevator governor tests, ARD battery health, wire rope tension certificates, pit safety switches."
    },
    {
      title: "Consent to Operate (CTO - Air & Water)",
      authority: "State Pollution Control Board (SPCB)",
      frequency: "5-Year Periodical",
      status: "Valid (Till Dec 2027)",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Building,
      coverage: "STP treated water parameters (BOD/COD), DG chimney stack emissions, acoustic enclosure decibel test."
    },
    {
      title: "Electrical Substation NOC (CEIG)",
      authority: "Central Electrical Inspectorate to Govt",
      frequency: "Annual Clearance",
      status: "Verified Compliant",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Users,
      coverage: "33kV / 11kV transformer oil breakdown voltage, earthing pit resistance records, relay calibration."
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "48 Pre-Configured Commercial Licenses",
      desc: "Instant coverage for NBC 2016 fire standards, CEA electrical safety, municipal trade licenses, and state lift acts."
    },
    {
      icon: Clock,
      title: "90-Day Automated Escalation Ladder",
      desc: "Progressive alerts (90, 60, 30, 7 days) sent to facility managers, technical heads, and asset directors before expiry."
    },
    {
      icon: ShieldCheck,
      title: "Tamper-Proof Audit Document Vault",
      desc: "Centralized repository for all government challans, inspection reports, and certificates with version history."
    },
    {
      icon: Download,
      title: "1-Click REIT & Due Diligence Pack",
      desc: "Export comprehensive institutional audit binders in PDF/Excel for lenders, REIT compliance, and insurers in seconds."
    }
  ];

  const faqs = [
    {
      q: "Which commercial building licenses are tracked out-of-the-box?",
      a: "OfficeX tracks all mandatory statutory filings including Fire Safety NOC (NBC Part 4), State Lift Acts (Form A & B), SPCB Consent to Operate (Water & Air Acts), Factory Inspectorate, DG Set CPCB approvals, CEIG Substation certification, and Municipal Occupancy & Trade Licenses."
    },
    {
      q: "How does the evidence verification workflow operate?",
      a: "When a facility manager uploads a renewed certificate or government challan, the system logs verification timestamps, validates validity dates, and auto-advances the recurrence cycle to the next annual or periodic due date per rule BR-C05."
    },
    {
      q: "Can a CAPA be closed without inspection evidence?",
      a: "No. Per institutional rule BR-C08, Corrective and Preventive Actions (CAPA) are strictly locked from closure until verified root-cause remediation evidence is uploaded and approved by the designated Compliance Officer."
    },
    {
      q: "Does the system block high-risk work permits if contractor certifications are expired?",
      a: "Yes. In accordance with rule BR-C11, Permits to Work (PTW) for hot work, height work, or electrical activities are automatically flagged and blocked if the contractor's safety training or statutory insurance certifications have lapsed."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      <MarketingHeader activePath="/operate" />

      {/* ── Breadcrumb & Top Mode Switcher Bar ── */}
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">SaaS Flow:</span>
            <Link href="/visitor-compliance" className="text-[#0D7B6C] font-semibold hover:underline">
              1. Landing Page
            </Link>
            <span className="text-slate-400 font-mono">──►</span>
            <Link href="/visitor-compliance/pricing?coupon=visitor001" className="text-[#0D7B6C] font-semibold hover:underline">
              2. Subscription (₹999/mo)
            </Link>
            <span className="text-slate-400 font-mono">──►</span>
            <Link href="/vc/dashboard" className="text-slate-800 font-bold hover:underline">
              3. Sovereign Command Center
            </Link>
          </div>

          {/* Unified SaaS Mode Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Switch to Visitor Flow Lens */}
            <Link
              href="/operate/visitors"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
            >
              <Sparkles size={13} />
              <span>⚡ Visitor Flow (VC-01..15)</span>
            </Link>

            {/* Active: Compliance Lens */}
            <Link
              href="/operate/compliance"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-[#0D7B6C] text-white shadow-xs"
            >
              <ShieldCheck size={13} />
              <span>🛡️ Statutory Compliance (CM-01..16)</span>
            </Link>

            {/* Spec / Architecture Toggle */}
            <button
              type="button"
              onClick={() => {
                if (viewMode === "workspace") {
                  setViewMode("overview");
                } else {
                  handleOpenWorkspace("compliance");
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              <Layers size={13} />
              <span>{viewMode === "workspace" ? "📖 Spec & Architecture" : "⚡ Back to Live Console"}</span>
            </button>

            {/* Launch Full Sovereign Command Center */}
            <button
              type="button"
              onClick={() => {
                if (isSubscribed) {
                  window.location.href = "/vc/dashboard?mode=compliance";
                } else {
                  setSubGateOpen(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-900 text-cyan-300 hover:bg-slate-800 shadow-xs border border-slate-800 cursor-pointer"
            >
              <ExternalLink size={12} />
              <span>Launch 31-Screen Center</span>
            </button>

            {/* Pricing Link */}
            <Link
              href="/visitor-compliance/pricing?coupon=visitor001"
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            >
              <span>₹999/mo (visitor001 Free)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODE A: LIVE OPERATIONAL SAAS WORKSPACE
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "workspace" && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
          {!isSubscribed ? (
            /* SUBSCRIPTION GATE WALL */
            <div className="p-8 sm:p-14 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center max-w-2xl mx-auto my-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                <Lock size={32} />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Commercial License Required
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Statutory Compliance Radar Gated
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Access to 48 statutory building NOC filings, Fire Form 15, Elevator Form A, and contractor safety work permits requires an active commercial subscription.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubGateOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#0D7B6C]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Activate License (100% Free with visitor001)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("overview")}
                  className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Back to Showcase
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Architecture Clarification Callout Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50 border border-emerald-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-[#0D7B6C]/10 border border-[#0D7B6C]/20 flex items-center justify-center text-[#0D7B6C] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>One SaaS, Two Coordinated Lenses: Statutory Compliance &amp; Visitor Flow</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">ONE CORE PLATFORM</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      48 building statutory licenses, contractor safety permits, and front-desk turnstiles operate from one canonical engine.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Link
                    href="/operate/visitors"
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Switch to Visitor Lens &rarr;</span>
                  </Link>
                  <Link
                    href="/vc/dashboard"
                    className="px-3.5 py-1.5 rounded-xl bg-[#0D7B6C] text-white font-bold hover:bg-[#0A6357] transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center gap-1.5"
                  >
                    <span>Open All-In-One Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {activeModule === "compliance" ? (
                <ComplianceOperationsCenter
                  portalRole="owner"
                  defaultProperty="Devasya Gold - Commercial Tower"
                />
              ) : (
                <VisitorManagementConsole
                  portalRole="security"
                  defaultProperty="Devasya Gold - Commercial Tower"
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODE B: MARKETING & ARCHITECTURAL SPECIFICATIONS
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "overview" && (
        <>
          {/* 1. HERO SECTION */}
          <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                
                {/* Left Column */}
                <div className="lg:col-span-6 flex flex-col items-start text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
                    <FileCheck2 size={15} className="text-[#0D7B6C]" />
                    <span>OFFICEX · 52-WEEK STATUTORY GOVERNANCE</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                    Statutory Compliance{" "}
                    <span className="text-[#0D7B6C]">
                      Calendar &amp; Vault
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                    Eliminate municipal penalties, building seal threats, and insurance invalidation. Automated 52-week statutory tracking for Fire NOC, Lift Form A, Pollution Control, CEIG, and Labour regulations.
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace("compliance")}
                      className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#0D7B6C]/25 hover:shadow-lg hover:scale-102 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
                    >
                      {isSubscribed ? <Sparkles size={16} /> : <Lock size={16} />}
                      <span>{isSubscribed ? "Launch Compliance Center" : "Get Started · Subscribe (visitor001 Free)"}</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace("visitors")}
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto hover:border-teal-300"
                    >
                      <Users size={15} className="text-[#0D7B6C]" />
                      <span>Open Visitor Flow Console</span>
                    </button>
                    <Link
                      href="/visitor-compliance/pricing?coupon=visitor001"
                      className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <span>View Pricing (₹999/mo)</span>
                      <ArrowRight size={14} className="text-[#0D7B6C]" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> 48 Tower Licenses</span>
                    <span className="flex items-center gap-1.5"><Calendar size={15} className="text-[#0D7B6C]" /> 52-Week Cadence</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#0D7B6C]" /> REIT Auditor Vault</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-6 w-full">
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 text-slate-900 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/80 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 px-5 py-3 sm:px-6 rounded-t-3xl bg-slate-50 mb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="font-mono text-[11px] text-slate-500 ml-2">
                          app.officex.in/compliance/statutory-calendar
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                        {scorecard?.scorecard?.score !== undefined ? `${scorecard.scorecard.score}% SCORE` : "94.8% HEALTH SCORE"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {statutoryLicenses.map((lic, idx) => {
                        const Icon = lic.icon;
                        return (
                          <div key={idx} className="bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5 text-xs shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D7B6C] border border-teal-200/80 flex items-center justify-center shrink-0">
                                  <Icon size={15} />
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">{lic.title}</span>
                                  <span className="text-[10px] text-slate-500">{lic.authority} · {lic.frequency}</span>
                                </div>
                              </div>
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${lic.statusColor}`}>
                                {lic.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1">{lic.coverage}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Statutory Engine: Gujarat &amp; Maharashtra Acts Active
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenWorkspace("compliance")}
                        className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Launch Operations Center</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 2. FEATURE DEEP DIVE */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
                  REGULATORY SHIELD
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Institutional Real Estate Statutory Governance
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg transition-all">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] border border-teal-200/80 flex items-center justify-center mb-4">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-2">{feat.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. FAQS */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-b border-slate-200/80">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
                  STATUTORY QUESTIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Frequently Asked Compliance Questions
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-4.5 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 cursor-pointer transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180 text-[#0D7B6C]" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4.5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100 font-medium">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Statutory Compliance Calendar & Vault"] }}
      />

      {/* Institutional Commercial Subscription Gate Modal */}
      <SubscriptionGateModal
        isOpen={subGateOpen}
        onClose={() => setSubGateOpen(false)}
        onSuccess={() => {
          setIsSubscribed(true);
          setSubGateOpen(false);
          setViewMode("workspace");
        }}
        moduleName={pendingModule === "visitors" ? "Touchless Visitor Flow Console" : "Statutory Compliance Radar"}
      />
    </div>
  );
}

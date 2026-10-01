"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Clock,
  Lock,
  ArrowUpRight,
  ChevronDown,
  Smartphone,
  DoorOpen,
  BellRing,
  Activity,
  Sparkles,
  Flame,
  Radio,
  FileCheck2,
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import VisitorManagementConsole from "@/components/visitor/VisitorManagementConsole";

export default function VisitorsProductPage() {
  const [viewMode, setViewMode] = useState<"workspace" | "overview">("workspace");
  const [activeWorkspaceModule, setActiveWorkspaceModule] = useState<"visitors" | "compliance">("visitors");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Live telemetry for preview card
  const [liveVisits, setLiveVisits] = useState<any[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const res = await fetch("/api/v1/visits");
        if (res.ok) {
          const data = await res.json();
          if (data.visits && data.visits.length > 0) {
            setLiveVisits(data.visits.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Telemetry error:", err);
      } finally {
        setLoadingVisits(false);
      }
    }
    loadTelemetry();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: Smartphone,
      title: "Instant WhatsApp QR Passes",
      desc: "Hosts invite guests with a single click. Visitors receive digital barcode passes via WhatsApp with live Google Maps campus navigation and zero app download."
    },
    {
      icon: DoorOpen,
      title: "Optical Speed-Gate Integration",
      desc: "Hardware-agnostic relay integration with Boon Edam, Gunnebo, Dormakaba, and Magnetic turnstiles for 18-second contactless barcode transit."
    },
    {
      icon: BellRing,
      title: "Instant Host Arrival Alerts",
      desc: "When a visitor taps through turnstiles, hosts receive instant notifications via Slack, MS Teams, SMS, and WhatsApp so meetings start on schedule."
    },
    {
      icon: Activity,
      title: "Overstay & Campus Security Tracking",
      desc: "Real-time occupancy heatmaps, evacuation headcounts during fire emergencies, and automated security alerts for guests exceeding expected duration."
    }
  ];

  const faqs = [
    {
      q: "Does this integrate with our existing building turnstiles and speed-gates?",
      a: "Yes. OfficeX Visitor Flow connects via standard Wiegand, RS-485, and IP network protocols to all leading optical turnstile controllers including Boon Edam, Gunnebo, Dormakaba, Hikvision, and ZKTeco."
    },
    {
      q: "Do visitors need to install any mobile application?",
      a: "No. Visitors receive their dynamic QR access pass directly on WhatsApp and via email. They scan directly at the optical glass turnstile barcode scanner for immediate entry."
    },
    {
      q: "How does the system manage contractor work permits?",
      a: "Contractors submit safety documents and ID proofs digitally. Facility managers approve work permits with restricted access to specific service elevators and plant rooms, expiring automatically at shift end."
    },
    {
      q: "Is visitor personal data protected under DPDP Act 2023?",
      a: "Yes. OfficeX complies fully with the Digital Personal Data Protection (DPDP) Act 2023. Visitor contact information is encrypted at rest and auto-anonymized after the retention period defined by your compliance policy."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      <MarketingHeader activePath="/operate" />

      {/* ── Breadcrumb & Top Mode Switcher Bar ── */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/operate" className="hover:text-slate-900 transition-colors">
              Operations
            </Link>
            <span>/</span>
            <span className="text-[#0D7B6C] font-bold">Visitor Flow &amp; Statutory Compliance SaaS</span>
          </div>

          {/* Dual Mode Switcher */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/90 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("visitors"); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "workspace" && activeWorkspaceModule === "visitors"
                  ? "bg-[#0D7B6C] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles size={13} />
              <span>⚡ Live Visitor Console (VC-01..15)</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("compliance"); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "workspace" && activeWorkspaceModule === "compliance"
                  ? "bg-[#0D7B6C] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck size={13} />
              <span>🛡️ Statutory Compliance (CM-01..16)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("overview")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "overview"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} />
              <span>📖 Architecture &amp; Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODE A: LIVE OPERATIONAL SAAS WORKSPACE (VC-01..15 + CM-01..16)
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "workspace" && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
          <VisitorManagementConsole
            portalRole="security"
            defaultProperty="Devasya Gold - Commercial Tower"
            initialModule={activeWorkspaceModule}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODE B: PRODUCT SPECIFICATIONS & MARKETING OVERVIEW
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "overview" && (
        <>
          {/* 1. HERO SECTION */}
          <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                
                {/* Left Column (6 cols) */}
                <div className="lg:col-span-6 flex flex-col items-start text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
                    <Users size={15} className="text-[#0D7B6C]" />
                    <span>OFFICEX · VISITOR &amp; STATUTORY COMPLIANCE SAAS</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                    Touchless Visitor Flow &amp;{" "}
                    <span className="text-[#0D7B6C]">
                      Speed-Gate Access
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                    Deliver an executive lobby arrival experience. Eliminate reception queues with instant WhatsApp QR passes, optical turnstile gate relays, statutory compliance tracking, and real-time campus security.
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("visitors"); }}
                      className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <Sparkles size={15} />
                      <span>Launch Live Visitor Console</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("compliance"); }}
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <ShieldCheck size={15} className="text-[#0D7B6C]" />
                      <span>Open Statutory Compliance</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5"><Clock size={15} className="text-[#0D7B6C]" /> 18-Sec Transit</span>
                    <span className="flex items-center gap-1.5"><QrCode size={15} className="text-[#0D7B6C]" /> WhatsApp Passes</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> Turnstile Relay</span>
                  </div>
                </div>

                {/* Right Column (6 cols) — Live Telemetry Screen */}
                <div className="lg:col-span-6 w-full">
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 text-slate-900 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/80 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 px-5 py-3 sm:px-6 rounded-t-3xl bg-slate-50 mb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="font-mono text-[11px] text-slate-500 ml-2">
                          app.officex.in/lobby/speedgate-console
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                        SPEED-GATES LIVE
                      </span>
                    </div>

                    <div className="space-y-3">
                      {liveVisits.length > 0 ? (
                        liveVisits.map((vis) => (
                          <div key={vis.id} className="bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5 text-xs shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{vis.visitorName}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {vis.passId}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">{vis.company} · {vis.hostName}</span>
                              </div>
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                vis.status === "checked_in" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                                vis.status === "overstay" ? "text-amber-800 bg-amber-50 border-amber-200" : "text-teal-700 bg-teal-50 border-teal-200"
                              }`}>
                                {vis.status.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                              <span className="flex items-center gap-1.5 text-[#0D7B6C]">
                                <Clock size={12} /> Zone: {vis.zone}
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">Optical Barrier Auto-Relay</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <RefreshCw size={24} className="animate-spin text-[#0D7B6C] mx-auto mb-2" />
                          <p className="text-xs font-bold">Connecting to live campus speed-gates...</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Turnstiles: 6 Speed-Gates Synchronized
                      </span>
                      <button
                        type="button"
                        onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("visitors"); }}
                        className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Interactive Console</span>
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
                  FRICTIONLESS ACCESS CONTROL
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Modernize Your Commercial Tower Arrival Experience
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
                  FREQUENTLY ASKED QUESTIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Common Questions About Visitor Flow &amp; Turnstiles
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

          {/* 4. BOTTOM CTA BAND */}
          <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
                Transform Your Lobby with 18-Second Touchless Transit
              </h2>
              <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
                Eliminate reception logbooks and queues today. Experience the live institutional visitor and compliance system now.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => { setViewMode("workspace"); setActiveWorkspaceModule("visitors"); }}
                  className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  ⚡ Open Live Interactive Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all cursor-pointer"
                >
                  Request Turnstile Integration Demo
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Visitor Flow & Speed-Gate Access"] }}
      />
    </div>
  );
}

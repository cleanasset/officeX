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
import SubscriptionGateModal from "@/components/visitor/SubscriptionGateModal";

const DEFAULT_VISITS = [
  {
    id: "vis-1",
    visitorName: "Rajesh Sharma",
    passId: "PASS-7701",
    company: "Tata Consultancy",
    hostName: "Vikram Malhotra (Floor 14)",
    status: "checked_in",
    zone: "Tower A · Optical Speed-Gate 2"
  },
  {
    id: "vis-2",
    visitorName: "Priya Nair",
    passId: "PASS-7702",
    company: "McKinsey & Co",
    hostName: "Ananya Iyer (Floor 9)",
    status: "checked_in",
    zone: "Executive Lobby · Turnstile 1"
  },
  {
    id: "vis-3",
    visitorName: "Amit Patel",
    passId: "PASS-7703",
    company: "Schindler Technical",
    hostName: "Sunil Verma (FM Head)",
    status: "checked_in",
    zone: "Service Core · Turnstile 4"
  },
  {
    id: "vis-4",
    visitorName: "Rohan Kapoor",
    passId: "PASS-7704",
    company: "Goldman Sachs",
    hostName: "Kavita Rao (Floor 18)",
    status: "overstay",
    zone: "Tower B · Turnstile 3"
  }
];

export default function VisitorsProductPage() {
  // Default viewMode MUST BE overview (the landing page showcase), just like rent-roll
  const [viewMode, setViewMode] = useState<"workspace" | "overview">("overview");
  const [activeWorkspaceModule, setActiveWorkspaceModule] = useState<"visitors" | "compliance">("visitors");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subGateOpen, setSubGateOpen] = useState(false);
  const [pendingModule, setPendingModule] = useState<"visitors" | "compliance">("visitors");

  // Live telemetry for preview card with instant high-fidelity fallback
  const [liveVisits, setLiveVisits] = useState<any[]>(DEFAULT_VISITS);
  const [loadingVisits, setLoadingVisits] = useState(false);

  useEffect(() => {
    // 1. Check local storage / cookies for active subscription
    if (typeof window !== "undefined") {
      const localSub =
        localStorage.getItem("officex_vc_sub_active") === "active" ||
        sessionStorage.getItem("officex_vc_sub_active") === "active" ||
        document.cookie.includes("officex_vc_sub_active=active");
      setIsSubscribed(localSub);
      sessionStorage.setItem("officex_active_operate_module", "visitor");
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

    async function loadTelemetry() {
      try {
        const res = await fetch("/api/vc/visitors");
        if (res.ok) {
          const data = await res.json();
          if (data.visitors && data.visitors.length > 0) {
            setLiveVisits(
              data.visitors.slice(0, 4).map((v: any) => ({
                id: v.id,
                visitorName: v.full_name || v.visitor_name,
                passId: v.pass_code || `PASS-${v.id.slice(0, 4).toUpperCase()}`,
                company: v.company_name || "Enterprise Guest",
                hostName: v.host_name ? `${v.host_name} (${v.host_department || "Tenant"})` : "Facility Host",
                status: v.status || "checked_in",
                zone: v.access_zone || "Main Lobby Speed-Gate",
              }))
            );
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

  const handleOpenWorkspace = (module: "visitors" | "compliance" = "visitors") => {
    setActiveWorkspaceModule(module);
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

      {/* ── Top Navigation & Enterprise Module Switcher Bar ── */}
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb & Live Gate Telemetry Status */}
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <Link href="/operate" className="text-slate-500 hover:text-slate-800 transition-colors">
              Operate
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">Visitor Management</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 ml-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Speed-Gates Active
            </span>
          </div>

          {/* Module Switcher & Console Launch */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active: Visitor Management */}
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-[#0D7B6C] text-white shadow-xs">
              <Users size={13} />
              <span>Visitor Management</span>
            </span>

            {/* Switch to Statutory Compliance */}
            <Link
              href="/operate/compliance"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
            >
              <ShieldCheck size={13} />
              <span>Statutory Compliance</span>
            </Link>

            {/* Interactive Workspace Toggle */}
            <button
              type="button"
              onClick={() => {
                if (viewMode === "workspace") {
                  setViewMode("overview");
                } else {
                  handleOpenWorkspace("visitors");
                }
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50"
            >
              <Layers size={13} />
              <span>{viewMode === "workspace" ? "Overview & Features" : "Live Speed-Gate Console"}</span>
            </button>

            {/* Pricing Link */}
            <Link
              href="/operate/pricing?mode=standalone&module=visitor"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            >
              <span>Pricing →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODE A: LIVE OPERATIONAL SAAS WORKSPACE (VC-01..15 + CM-01..16)
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "workspace" && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
          {!isSubscribed ? (
            /* SUBSCRIPTION GATE WALL (WHEN UNSUBSCRIBED USER TRIES TO ENTER CONSOLE) */
            <div className="p-8 sm:p-14 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center max-w-2xl mx-auto my-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                <Lock size={32} />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Commercial License Required
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Live Visitor &amp; Turnstile Console Gated
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Access to live optical speed-gates, WhatsApp QR pass issuance, and statutory compliance radars requires an active commercial subscription.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubGateOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#0D7B6C]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Activate Enterprise License</span>
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
              <VisitorManagementConsole
                portalRole="security"
                defaultProperty="Devasya Gold - Commercial Tower"
              />
            </>
          )}
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
                    <span>OFFICEX · VISITOR ACCESS PLATFORM</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                    Touchless Visitor Flow &amp;{" "}
                    <span className="text-[#0D7B6C]">
                      Speed-Gate Access
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                    Deliver an executive lobby arrival experience. Eliminate reception queues with instant WhatsApp QR passes, optical turnstile gate relays, host arrival alerts, and real-time campus security.
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace("visitors")}
                      className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#0D7B6C]/25 hover:shadow-lg hover:scale-102 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
                    >
                      {isSubscribed ? <Sparkles size={16} /> : <Lock size={16} />}
                      <span>{isSubscribed ? "Open Live Visitor Console" : "Start 14-Day Free Trial"}</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace("visitors")}
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto hover:border-teal-300"
                    >
                      <Sparkles size={15} className="text-[#0D7B6C]" />
                      <span>Interactive Gate Demo</span>
                    </button>
                    <Link
                      href="/operate/pricing?mode=standalone&module=visitor"
                      className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <span>View Visitor Pricing</span>
                      <ArrowRight size={14} className="text-[#0D7B6C]" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5"><Clock size={15} className="text-[#0D7B6C]" /> 18-Sec Transit</span>
                    <span className="flex items-center gap-1.5"><QrCode size={15} className="text-[#0D7B6C]" /> WhatsApp Passes</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> Turnstile Relay</span>
                    <span className="flex items-center gap-1.5"><BellRing size={15} className="text-[#0D7B6C]" /> Host Instant Alerts</span>
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
                        onClick={() => handleOpenWorkspace("visitors")}
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
                Eliminate reception logbooks and queues today. Experience the live institutional visitor access platform now.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleOpenWorkspace("visitors")}
                  className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubscribed ? <Sparkles size={16} /> : <Lock size={16} />}
                  <span>{isSubscribed ? "Open Live Interactive Workspace" : "Start 14-Day Free Trial"}</span>
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

      {/* Institutional Commercial Subscription Gate Modal */}
      <SubscriptionGateModal
        isOpen={subGateOpen}
        onClose={() => setSubGateOpen(false)}
        onSuccess={() => {
          setIsSubscribed(true);
          setSubGateOpen(false);
          setViewMode("workspace");
        }}
        moduleName={pendingModule === "compliance" ? "Statutory Compliance Radar" : "Touchless Visitor Flow Console"}
      />
    </div>
  );
}

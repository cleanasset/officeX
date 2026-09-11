"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Calendar,
  Users,
  Check,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Gauge,
  Sparkles,
  QrCode,
  DollarSign,
  ArrowUpRight,
  Handshake,
  Download,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Briefcase,
  Star,
  Activity,
  FileText,
  Search,
  Bell,
  Lock,
  Flame,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Cpu
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

// Deterministic number formatter to guarantee SSR and Client HTML match identically
function formatNum(val: number): string {
  const s = Math.round(val).toString();
  if (s.length <= 3) return s;
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
}

export default function OperatePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<{ modules?: string[] } | undefined>(undefined);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Active SaaS Screen inside the Interactive Showcase
  const [activeScreen, setActiveScreen] = useState<
    "rentroll" | "visitors" | "compliance" | "ppm" | "crm" | "tenant"
  >("rentroll");

  // Interaction Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const openEnquiry = (mod: string) => {
    setEnquiryPrefill({ modules: [mod] });
    setSlideInOpen(true);
  };

  // SaaS Screen Metadata matching OfficeX Business Specifications
  const SAAS_SCREENS = {
    rentroll: {
      portalId: "P04 · Property Management",
      screenId: "S04-03 · Rent Roll Registry",
      tabLabel: "Rent Roll Master",
      tagline: "Commercial Lease & Revenue Intelligence",
      title: "Automated Rent Roll & Financial Governance",
      accentColor: "#0F8B7D",
      route: "/properties/rent-roll",
      actionLabel: "Launch Live Rent Roll",
      description: "Eliminate spreadsheet leakage across multi-tenant commercial assets. Automate escalations, CAM allocations, and Razorpay GST e-invoices with 100% auditability.",
      bullets: [
        "5% Auto-Escalation Triggers: Proactive 90-day alert before anniversary date.",
        "CAM Reconciliation: Pool and distribute common area maintenance costs transparently.",
        "Direct Bank Escrow: Automatic reconciliation via Razorpay nodal accounts."
      ]
    },
    visitors: {
      portalId: "P06 · Tenant Portal",
      screenId: "S06-05 · Visitor Pre-Registration",
      tabLabel: "Visitor Management",
      tagline: "Speed-Gate Turnstiles & Lobby Flow",
      title: "Touchless Pre-Registration & Turnstile Access",
      accentColor: "#2563EB",
      route: "/tenant/visitors",
      actionLabel: "Launch Live Visitor App",
      description: "Replace physical sign-in registers with WhatsApp digital fast-passes and bi-directional optical turnstile sync. Reduce lobby check-in times to under 18 seconds.",
      bullets: [
        "Instant WhatsApp QR Passes: Pre-scheduled invites sent directly to guest phones.",
        "Turnstile & Speed-Gate Sync: Zero human intervention required at security lobbies.",
        "Full Security Audit Trail: Real-time dashboard of all occupants currently on-premise."
      ]
    },
    compliance: {
      portalId: "P04 · Property Management",
      screenId: "S04-06 · Statutory Compliance Radar",
      tabLabel: "Statutory Compliance",
      tagline: "100% Audit Readiness & Immunity",
      title: "Statutory Compliance Radar & Document Locker",
      accentColor: "#8B5CF6",
      route: "/compliance",
      actionLabel: "View Compliance Tracker",
      description: "Manage 48+ mandatory Indian commercial licenses across Fire NOC Form B, PWD Lift Inspectorate, and MPCB Consent to Operate. Never face unexpected stop-work notices.",
      bullets: [
        "Proactive 90-Day Renewal Alerts: Automated escalation to facility and legal heads.",
        "Certified Document Locker: Tamper-proof storage for statutory certificates and NOCs.",
        "One-Click Audit Export: Instant compliance readiness dossiers for municipal inspections."
      ]
    },
    ppm: {
      portalId: "P08 · FM Operations Portal",
      screenId: "S08-06 · 52-Week PPM Matrix",
      tabLabel: "52-Week PPM & CAFM",
      tagline: "Preventive Maintenance & Asset Lifecycle",
      title: "52-Week Preventive Maintenance & CAFM Matrix",
      accentColor: "#F59E0B",
      route: "/operations",
      actionLabel: "Explore CAFM Cockpit",
      description: "Schedule, track, and verify maintenance for chillers, DG sets, fire suppression pumps, and lifts according to OEM specifications. Protect multi-crore building plant capital.",
      bullets: [
        "52-Week OEM Calendar: Structured matrix view of every planned preventive task.",
        "QR Equipment Passports: Technicians scan physical machinery tags to verify on-site work.",
        "Tiered SLA Monitoring: Automatic escalation when critical equipment downtime occurs."
      ]
    },
    crm: {
      portalId: "P02 · Leasing Portal",
      screenId: "S02-04 · Pipeline Kanban Board",
      tabLabel: "Lease CRM Pipeline",
      tagline: "Commercial Deal Velocity",
      title: "Commercial Lease CRM & Deal Velocity Kanban",
      accentColor: "#0284C7",
      route: "/leasing/pipeline",
      actionLabel: "Launch Lease CRM",
      description: "Track enterprise occupier requirements from discovery to site inspection, LOI sign-off, and lease execution. Connect property owners directly with Fortune 500 space seekers.",
      bullets: [
        "Visual Stage Progression: Leads → Site Tour → LOI Execution → Signed Agreement.",
        "Demising & Fit-out Calculator: Real-time area splitting and rent modeling.",
        "Commission Settlement Ledger: Transparent broker brokerage and invoice tracking."
      ]
    },
    tenant: {
      portalId: "P06 · Tenant Experience",
      screenId: "S06-03 · Tenant Helpdesk & Amenity Desk",
      tabLabel: "Tenant Experience",
      tagline: "10-Second QR Ticketing & Booking",
      title: "Occupier Experience & Rapid Helpdesk Ticketing",
      accentColor: "#E11D48",
      route: "/tenant/tickets",
      actionLabel: "Launch Tenant Helpdesk",
      description: "Empower corporate occupiers to log maintenance issues in 10 seconds via desk QR codes, reserve boardroom amenities, and review monthly utility allocations seamlessly.",
      bullets: [
        "10-Second QR Ticketing: Occupiers scan QR tags on AC diffusers or desks to file tickets.",
        "Executive Amenity Booking: Seamless scheduling for shared boardrooms and training halls.",
        "Real-Time Resolution Tracking: Transparent status updates directly on tenant phones."
      ]
    }
  };

  const activeData = SAAS_SCREENS[activeScreen];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] antialiased selection:bg-[#0F8B7D] selection:text-white flex flex-col font-sans">
      <MarketingHeader />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION: Clean, spacious, Stripe/Linear aesthetic
          ========================================================================= */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#F0F4F8] via-[#F8FAFC] to-[#F0F4F8]">
        {/* Subtle decorative ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-200/30 to-blue-200/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-[#0F8B7D] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-pulse" />
            <span>The Connected Workplace Operations Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12] mb-6">
            The Operating System for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0F8B7D] via-teal-600 to-[#2563EB]">
              Commercial Workspaces
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-10">
            Centralize your entire property lifecycle — from Rent Roll and Visitor Management to Statutory Compliance and 52-Week PPM — on one unified institutional platform.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => openEnquiry("All-in-One Workplace SaaS Suite")}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] hover:from-[#0D7A6E] hover:to-[#0F8B7D] text-white font-semibold rounded-xl shadow-lg shadow-teal-700/15 hover:shadow-teal-700/25 transition-all duration-200 flex items-center justify-center gap-2 text-base group"
            >
              <span>Schedule a Demo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#interactive-showcase"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all duration-200 text-base"
            >
              Explore Live Modules
            </a>
          </div>

          {/* Proof / Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">15M+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Sq.Ft Managed</div>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 tracking-tight">450+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Vetted FM Partners</div>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">₹18 Cr+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Annualized Rent Roll</div>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">100%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Statutory Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE SAAS SHOWCASE: The Facilio-style Command Center
          ========================================================================= */}
      <section id="interactive-showcase" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0F8B7D] mb-3">
            <Gauge className="w-3.5 h-3.5" />
            <span>CONNECTED SAAS SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Experience the Live Operating Products
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Select any module below to inspect real commercial workflows and launch live sandbox applications.
          </p>
        </div>

        {/* Segmented Control Bar */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: "rentroll", label: "Rent Roll Master", icon: DollarSign },
            { id: "visitors", label: "Visitor Management", icon: Users },
            { id: "compliance", label: "Statutory Compliance", icon: ShieldCheck },
            { id: "ppm", label: "52-Week PPM & CAFM", icon: Calendar },
            { id: "crm", label: "Lease CRM Pipeline", icon: Handshake },
            { id: "tenant", label: "Tenant Helpdesk", icon: QrCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveScreen(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-semibold ring-2 ring-teal-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#0F8B7D]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* The Showcase Stage Container (Spacious 2-Column Split) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Product Value Story (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 mb-4">
                  <span>{activeData.portalId}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                  {activeData.title}
                </h3>
                
                <p className="text-slate-600 text-base leading-relaxed mb-6">
                  {activeData.description}
                </p>

                {/* Capability checklist */}
                <div className="space-y-3 mb-8">
                  {activeData.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#0F8B7D]" />
                      </div>
                      <span className="text-sm text-slate-700 leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <Link
                  href={activeData.route}
                  className="px-5 py-2.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-medium rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  <span>{activeData.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openEnquiry(activeData.tabLabel)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-sm border border-slate-200 transition-all"
                >
                  Book Walkthrough
                </button>
              </div>
            </div>

            {/* Right Column: Live High-Fidelity UI Window (7 Cols) */}
            <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-inner">
              {/* Window Chrome */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    app.officex.in{activeData.route}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  LIVE DEMO
                </span>
              </div>

              {/* Dynamic Screen Content */}
              {activeScreen === "rentroll" && (
                <div className="space-y-4">
                  {/* Metric row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Rent Roll</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">₹52.4L / mo</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Deposits Held</div>
                      <div className="text-lg sm:text-xl font-bold text-teal-600 mt-0.5">₹1.56 Cr</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Rent/Sq.Ft</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">₹142.00</div>
                    </div>
                  </div>

                  {/* Clean Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 flex justify-between items-center">
                      <span>Apex Business Tower · Active Leases</span>
                      <span className="text-slate-400">4 Leases</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">Tata Consultancy Services (TCS)</div>
                          <div className="text-slate-500 text-[11px]">Floor 12 · 42,500 sq.ft</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">₹70.1L / mo</div>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">Paid</span>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">Deloitte Consulting USI</div>
                          <div className="text-slate-500 text-[11px]">Floor 09 · 35,000 sq.ft</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">₹57.7L / mo</div>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">Paid</span>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">Freshworks Technologies</div>
                          <div className="text-slate-500 text-[11px]">Floor 06 · 18,400 sq.ft</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">₹30.2L / mo</div>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">Paid</span>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">Wipro Limited</div>
                          <div className="text-slate-500 text-[11px]">Floor 04 · 65,000 sq.ft</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">₹1.05 Cr / mo</div>
                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">Due in 3d</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Banner */}
                  <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-900">Upcoming 5% Escalation: Deloitte USI</div>
                      <div className="text-[11px] text-purple-700">Contract completes Year 2 on 15-Nov-2026 (+₹2.53L/mo)</div>
                    </div>
                    <button
                      onClick={() => showToast("5% Step-Up Escalation approved & notice drafted for Deloitte")}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Approve Revision
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "visitors" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expected Today</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">85 Visitors</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Checked In</div>
                      <div className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">62 Inside</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lobby Transit</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">18s Avg</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-700">Live Turnstile Stream</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Turnstiles Online</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            RS
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">Rajesh Sharma (KPMG)</div>
                            <div className="text-slate-500 text-[11px]">Host: Priya Mehta (TCS) · Floor 12</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded">Turnstile 02 Passed</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            PN
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">Priya Nair (McKinsey)</div>
                            <div className="text-slate-500 text-[11px]">Host: Arun Sen (Deloitte) · Floor 09</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded">QR Fast-Pass Issued</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-900">Issue Instant WhatsApp Guest Pass</div>
                      <div className="text-[11px] text-blue-700">Send time-restricted optical speed-gate QR code</div>
                    </div>
                    <button
                      onClick={() => showToast("WhatsApp QR fast-pass dispatched to visitor")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Issue Fast-Pass
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "compliance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Statutory Items</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">48 Total</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">100% Valid</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">42 Verified</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expiring &lt;60d</div>
                      <div className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5">6 Tracked</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Fire Safety NOC (Form B)</div>
                          <div className="text-slate-500 text-[11px]">CFO Mumbai · Annual Hydrant & Sprinkler Audit</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">Valid (284d)</span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Lift Inspectorate License (Form A)</div>
                          <div className="text-slate-500 text-[11px]">PWD Mumbai · 6 Passenger & 2 Service Elevators</div>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">Expiring in 42d</span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Consent to Operate (CTO) — Air & Water</div>
                          <div className="text-slate-500 text-[11px]">MPCB · STP 150 KLD & DG Emission Standards</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">Valid (410d)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Action Required: Lift Form A Renewal</div>
                      <div className="text-[11px] text-amber-700">Contractor Schindler India assigned for inspection</div>
                    </div>
                    <button
                      onClick={() => showToast("Inspection scheduled with Schindler engineer & PWD dossier prepared")}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Schedule PWD Audit
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "ppm" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Critical Assets</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">240 Units</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">MEP Uptime</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">99.8%</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Week 38 Status</div>
                      <div className="text-lg sm:text-xl font-bold text-teal-600 mt-0.5">100% Executed</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-700 mb-3">52-Week Matrix Grid (Q3 Weeks 35–42)</div>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { name: "Cummins DG Set 750 kVA #1", vendor: "Sterling & Wilson", status: "Completed" },
                        { name: "York Centrifugal Chiller 450 TR", vendor: "Johnson Controls", status: "Completed" },
                        { name: "Schindler 3300 Pass Lift #3", vendor: "Schindler India", status: "Scheduled W39" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500">{item.vendor}</div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-900">QR Asset Tagging Active</div>
                      <div className="text-[11px] text-emerald-700">Technicians scan physical tags on plant floor</div>
                    </div>
                    <button
                      onClick={() => showToast("Technician digital logbook verified with GPS & timestamp")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Audit Logbook
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "crm" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Pipeline</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">₹4.2 Cr TCV</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tours Scheduled</div>
                      <div className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">6 Visits</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Deal Velocity</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">22 Days</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="font-semibold text-slate-900">KPMG India</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">30,000 sq.ft · BKC Tower B</div>
                      <div className="mt-2 text-blue-600 font-bold">Stage: LOI Drafting</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="font-semibold text-slate-900">Google Cloud Partner</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">50,000 sq.ft · Whitefield</div>
                      <div className="mt-2 text-emerald-600 font-bold">Stage: Agreement Signed</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-900">Automated LOI Generation</div>
                      <div className="text-[11px] text-blue-700">Pre-fill terms, lock-in, escalation & security deposit</div>
                    </div>
                    <button
                      onClick={() => showToast("LOI PDF generated with digital e-signature fields")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Generate LOI
                    </button>
                  </div>
                </div>
              )}

              {activeScreen === "tenant" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg SLA Close</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">3.2 Hours</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Occupier CSAT</div>
                      <div className="text-lg sm:text-xl font-bold text-rose-600 mt-0.5">4.9 / 5.0</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">SLA Met Rate</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">99.4%</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-xs space-y-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">HVAC Thermostat Calibration</div>
                        <div className="text-slate-500 text-[11px]">Floor 12, Zone C · Assigned to CleanPro</div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">Resolved in 45m</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Executive Boardroom Reservation</div>
                        <div className="text-slate-500 text-[11px]">Floor 09 · Tomorrow 10:00 AM – 1:00 PM</div>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">Confirmed</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-rose-900">10-Second QR Issue Ticket</div>
                      <div className="text-[11px] text-rose-700">Instant dispatch to on-duty floor technician</div>
                    </div>
                    <button
                      onClick={() => showToast("Maintenance ticket dispatched with high priority")}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Test Dispatch
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          OPERATIONAL PILLARS: 3 Spacious, Uncluttered Cards
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-3">
            <span>INSTITUTIONAL FOUNDATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Commercial Asset Scale
          </h2>
          <p className="text-base text-slate-600 mt-3">
            OfficeX replaces fragmented desktop spreadsheets with a single connected data layer across owners, occupiers, and vendors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Financial & Lease Governance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Full lifecycle rent roll with automated 5% escalation triggers, CAM reconciliation pools, and direct Razorpay nodal escrow settlement. Never miss a billing milestone.
              </p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F8B7D] hover:text-[#0D7A6E] pt-4 border-t border-slate-100"
            >
              <span>Explore Rent Roll Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Workplace Experience & Access
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Touchless WhatsApp pre-registration, 18-second lobby turnstile throughput, and 10-second occupier ticketing directly from desk QR tags.
              </p>
            </div>
            <Link
              href="/tenant/visitors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 pt-4 border-t border-slate-100"
            >
              <span>Explore Visitor System</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Statutory Immunity & 52-Week PPM
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                48 statutory licenses tracked with 90-day renewal warnings, coupled with a 52-week preventive maintenance calendar for critical plant machinery.
              </p>
            </div>
            <Link
              href="/compliance"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 pt-4 border-t border-slate-100"
            >
              <span>Explore Compliance Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPERATIONAL LIFECYCLE & ESCROW SETTLEMENT (Split Flow)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0F8B7D] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ENTERPRISE ESCROW ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Milestone-Protected Operations & Payouts
            </h2>
            <p className="text-base text-slate-600 mt-3">
              OfficeX combines structured operational lifecycles with bank-grade escrow security to safeguard both property managers and service partners.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: 5-step operational lifecycle */}
            <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  5-Stage Operational Lifecycle
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Digital Property & Asset Onboarding", desc: "Demised spatial stacking, asset register QR tagging, and initial statutory document audit." },
                    { step: "2", title: "PPM & Rent Roll Automation", desc: "Automate 52-week maintenance schedules, lease escalations, and CAM collection pools." },
                    { step: "3", title: "Fast-Track Turnstile & Occupier Flow", desc: "Deploy pre-registered WhatsApp QR passes and 10-second helpdesk ticketing." },
                    { step: "4", title: "Verified Work Order Milestone Sign-Off", desc: "Facility managers audit maintenance and repair deliverables before funds release." },
                    { step: "5", title: "Escrow-Protected Milestone Settlement", desc: "Razorpay Escrow releases 90% vendor disbursement immediately upon sign-off." }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                        {item.step}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Escrow flow diagram */}
            <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Escrow Payment Split Flow
                  </h3>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Razorpay Nodal
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">1. Property Client Deposits Contract Value</div>
                    <div className="text-base font-bold text-slate-900 mt-1">100% Locked in Escrow Nodal Account</div>
                  </div>

                  <div className="flex justify-center text-slate-300">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 shadow-sm text-center">
                    <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">2. Verified Facility Milestone Sign-Off</div>
                    <div className="text-sm font-medium text-teal-900 mt-1">Property Manager audits and approves on-ground deliverables</div>
                  </div>

                  <div className="flex justify-center text-slate-300">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>

                  {/* Step 3: Split */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">90% Vendor Payout</div>
                      <div className="text-sm font-bold text-emerald-900 mt-1">Direct Bank Release</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                      <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">10% Platform Fee</div>
                      <div className="text-sm font-bold text-blue-900 mt-1">OfficeX Facilitation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Governed by Indian Escrow & Banking Regulations</span>
                <span className="font-semibold text-slate-700">100% Auditable</span>
              </div>
            </div>
          </div>

          {/* Social Proof / Client Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
                &ldquo;Rent collection cycle dropped from 28 days to 4 days across our commercial tower. The automated CAM reconciliation is flawless.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Rajesh V.</div>
              <div className="text-[11px] text-slate-500">VP Commercial Leasing · Embassy Office Parks</div>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
                &ldquo;Our chillers and DGs operate at 99.8% uptime with the 52-week automated PPM. Zero paper logbooks across 2.2M sq.ft.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Suresh N.</div>
              <div className="text-[11px] text-slate-500">Head Facility Operations · Prestige Group</div>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
                &ldquo;Over 850 daily visitors pass through our optical turnstiles in 18 seconds with WhatsApp QR passes. Lobby congestion is gone.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Amit S.</div>
              <div className="text-[11px] text-slate-500">General Manager · Brigade Tech Gardens</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING TIERS: Clean, Legible Per-Sq.Ft Pricing
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-3">
            <span>PREDICTABLE COMMERCIAL SUBSCRIPTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent Per-Square-Foot Pricing
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Scaled to your commercial asset footprint with zero hidden implementation fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starter</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">₹1.50</span>
                <span className="text-xs text-slate-500 font-medium">/ sq.ft / month</span>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                For standalone commercial buildings seeking digital maintenance hygiene, QR tagging, and basic visitor flow.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                {[
                  "Property Master & Units Database",
                  "Up to 50,000 sq.ft managed area",
                  "Basic Visitor Pre-Registration",
                  "Asset QR Tagging & Registry",
                  "Standard Email Support"
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Starter Plan - ₹1.50/sq.ft")}
              className="mt-8 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-sm transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Professional (Featured) */}
          <div className="bg-white rounded-2xl border-2 border-[#0F8B7D] p-8 shadow-xl shadow-teal-900/5 relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0F8B7D] text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0F8B7D] uppercase tracking-wider">Professional</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">₹2.80</span>
                <span className="text-xs text-slate-500 font-medium">/ sq.ft / month</span>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                The complete Connected SaaS Suite for Grade-A commercial towers requiring Rent Roll, Compliance & Turnstiles.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                {[
                  "Full 39-Column Rent Roll & Collections",
                  "Optical Turnstile Speed-Gate Integration",
                  "Statutory Compliance Radar (48 Licenses)",
                  "52-Week PPM Matrix & CAFM Work Orders",
                  "Tenant Helpdesk & Amenity Reservations",
                  "Dedicated Relationship Manager"
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Professional Plan - ₹2.80/sq.ft")}
              className="mt-8 w-full py-2.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-700/20 transition-all"
            >
              Start 14-Day Free Pilot
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">₹4.50</span>
                <span className="text-xs text-slate-500 font-medium">/ sq.ft / month</span>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                For large IT parks, SEZs, and institutional REIT portfolios exceeding 250,000 sq.ft. requiring ERP integration.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                {[
                  "Unlimited Square Footage & Multi-Tower Setup",
                  "Custom SAP / Oracle ERP Integration",
                  "Razorpay Automated Escrow Split Engine",
                  "Automated ESG & Energy Utility Analytics",
                  "24/7 SLA with 1-Hour Critical Incident Response",
                  "Full Multi-Role RBAC & Audit Trail Logs"
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Enterprise Plan - Custom")}
              className="mt-8 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-sm transition-all"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION: Focused & Clean
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Answers to common questions from commercial property directors and facility heads.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How fast can we onboard our property's rent roll and asset data?",
              a: "Standard deployment takes 5 to 7 business days. Our customer engineering team ingests your existing rent roll Excel sheets, leases, and plant registers into OfficeX with automated schema validation."
            },
            {
              q: "Does the Visitor Management system integrate with our existing turnstiles?",
              a: "Yes. OfficeX supports bi-directional API and Wiegand/TCP-IP relay controllers compatible with major speed-gate hardware including Boon Edam, Gunnebo, and Hikvision."
            },
            {
              q: "How does the statutory compliance tracking prevent lapses?",
              a: "Every statutory license (Fire NOC Form B, Lift Form A, PCB CTO, etc.) is configured with automated 90-day, 60-day, and 30-day proactive triggers alerting legal, facility, and property heads."
            },
            {
              q: "How does the escrow payment flow protect our transactions?",
              a: "All FM milestone contracts are processed via Razorpay Nodal Escrow accounts governed under RBI regulations. Funds are only disbursed to contractors after verified digital sign-off by your facility manager."
            }
          ].map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:text-[#0F8B7D] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-[#0F8B7D]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          CLOSING CTA BANNER: High-Impact, uncluttered
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to Modernize Your Commercial Portfolio?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              Join over 450+ commercial property teams streamlining rent rolls, visitor gates, and 52-week maintenance on OfficeX.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openEnquiry("All-in-One Workplace SaaS Suite")}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#0F8B7D] to-[#14B8A6] hover:from-[#0D7A6E] hover:to-[#0F8B7D] text-white font-semibold rounded-xl shadow-lg shadow-teal-700/20 text-sm transition-all"
              >
                Schedule a Product Demo
              </button>
              <Link
                href="/properties/rent-roll"
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 text-sm transition-all"
              >
                Explore Live Portals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slide-In Lead Form */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={enquiryPrefill}
      />

      <Footer />
    </div>
  );
}

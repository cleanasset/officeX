"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Calendar,
  LifeBuoy,
  Activity,
  Users,
  Bookmark,
  Smartphone,
  Send,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Building2,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Layers,
  Sparkles,
  Sliders,
  QrCode,
  FileText,
  Building,
  CheckCheck,
  PhoneCall,
  HardHat,
  Eye,
  BarChart3,
  Cpu
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function OperatePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ppm" | "sla" | "health" | "visitors">("ppm");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive ROI Calculator State
  const [buildingArea, setBuildingArea] = useState<number>(450000);
  const [assetCount, setAssetCount] = useState<number>(620);

  // Dynamic ROI Calculations
  const calculatedSavings = useMemo(() => {
    const annualSavingsLakhs = ((buildingArea * 3.4 + assetCount * 820) / 100000).toFixed(1);
    const manHoursSaved = Math.round(buildingArea * 0.0048 + assetCount * 2.1);
    const breakdownRiskReduction = 42;
    return {
      savingsLakhs: annualSavingsLakhs,
      manHours: manHoursSaved.toLocaleString(),
      breakdownReduction: breakdownRiskReduction
    };
  }, [buildingArea, assetCount]);

  // Stakeholder Use Cases with Real Photography
  const stakeholders = [
    {
      role: "Chief Facility Managers",
      subtitle: "Enterprise Technical Operations",
      image: "/images/pro_mep_technician.jpg",
      quote: "We eliminated surprise chiller breakdowns and digitized 45 technician shifts across 1.8M sq.ft. without paper logbooks.",
      metrics: [
        { label: "PPM Adherence", value: "100%" },
        { label: "Asset Downtime", value: "-42%" },
        { label: "Annual Cost Saved", value: "₹34L" }
      ],
      highlights: [
        "Automated 52-week maintenance checklists",
        "QR code offline mobile asset audits",
        "Auto-generated vendor SLA penalty reports"
      ]
    },
    {
      role: "Corporate Workplace Directors",
      subtitle: "Tenant Experience & Uptime",
      image: "/images/pro_property_manager.jpg",
      quote: "Our Fortune 500 tenants log AC and electrical issues in 10 seconds. Resolution times dropped from 4 hours to 32 minutes.",
      metrics: [
        { label: "Avg SLA Response", value: "32m" },
        { label: "Tenant CSAT", value: "4.9/5" },
        { label: "Ticket Auto-Routing", value: "98%" }
      ],
      highlights: [
        "White-labeled tenant mobile app & WhatsApp bot",
        "Interactive boardroom & amenity bookings",
        "Transparent live ticket status trackers"
      ]
    },
    {
      role: "Security & Operations Heads",
      subtitle: "Perimeter & Lobby Flow Control",
      image: "/images/pro_security_officer.jpg",
      quote: "Lobby congestion vanished. Over 800 daily visitors pass through optical turnstiles in under 20 seconds with digital QR passes.",
      metrics: [
        { label: "Lobby Check-in", value: "< 18s" },
        { label: "Daily QR Passes", value: "850+" },
        { label: "Security Audit Logs", value: "100%" }
      ],
      highlights: [
        "Pre-registered touchless visitor invites",
        "Optical speed-gate turnstile integration",
        "Instant host arrival WhatsApp notifications"
      ]
    }
  ];

  // Pricing Tiers (strictly without "Pro")
  const pricingTiers = [
    {
      name: "Standard",
      price: "₹1.50",
      period: "sq.ft./month",
      desc: "For standalone commercial buildings seeking essential digital maintenance hygiene and QR tagging.",
      badge: "Commercial",
      popular: false,
      btnColor: "bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 font-bold",
      features: [
        "Up to 500 assets registered with QR tags",
        "52-Week automated PPM calendar",
        "Multi-channel tenant ticketing (Web & App)",
        "Technician offline mobile checklists",
        "Standard SLA tracking & incident logs",
        "Standard email & chat support"
      ]
    },
    {
      name: "Enterprise",
      price: "₹2.80",
      period: "sq.ft./month",
      desc: "For Grade-A commercial towers requiring strict multi-tiered SLA enforcement and visitor automation.",
      badge: "Most Popular",
      popular: true,
      btnColor: "bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white shadow-lg shadow-[#0F8B7D]/20 font-bold",
      features: [
        "Unlimited assets & digital logbooks",
        "Automated 52-week OEM maintenance schedules",
        "Multi-tier SLA escalation with SMS/WhatsApp alerts",
        "Touchless visitor management & QR gate passes",
        "Meeting room & boardroom amenity scheduling",
        "Tenant experience mobile portal & CSAT scores",
        "Workplace Health Score live dashboard",
        "Priority 24/7 engineering support"
      ]
    },
    {
      name: "Institutional Campus",
      price: "₹4.50",
      period: "sq.ft./month",
      desc: "For large IT parks, SEZs, and institutional REIT portfolios exceeding 250,000 sq.ft.",
      badge: "Portfolio Tier",
      popular: false,
      btnColor: "bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 font-bold",
      features: [
        "Everything in Enterprise tier",
        "Custom BMS & IoT sensor telemetry connectors (BACnet)",
        "Central command room portfolio multi-tower view",
        "Automated contractor SLA penalty calculation engine",
        "Dedicated on-site CAFM deployment lead",
        "SAP & ERP financial billing connectors",
        "Contractually guaranteed 99.9% uptime SLA"
      ]
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "Can OfficeX Operate integrate with existing Building Management Systems (BMS)?",
      a: "Yes. OfficeX Operate includes native BACnet, Modbus, and REST API connectors to ingest telemetry from Honeywell, Siemens, Schneider Electric, and Johnson Controls systems into unified operations dashboards."
    },
    {
      q: "Do facility technicians require specialized handheld devices?",
      a: "No. Technicians use any standard iOS or Android smartphone. The mobile interface works offline in basements and plant rooms, syncing checklists and photo evidence once connectivity is restored."
    },
    {
      q: "How does the automated 52-week PPM calendar handle statutory compliance?",
      a: "The system comes pre-configured with National Building Code (NBC 2016), CFO Fire Safety guidelines, and OEM service cadences. It automatically generates scheduled work orders for DG sets, chillers, elevators, and transformers."
    },
    {
      q: "What happens when an SLA response or resolution threshold is breached?",
      a: "The multi-tier escalation engine triggers immediate notifications: first to the assigned technician, then to the shift supervisor after 15 minutes, and directly to the Chief Facility Director if unresolved within 30 minutes."
    },
    {
      q: "How long does physical deployment and asset tagging take?",
      a: "Our standard deployment takes 15 days. Days 1–4 cover physical MEP asset audits and QR tagging, Days 5–8 configure the PPM calendar, Days 9–12 train on-ground technicians, and Day 15 is full tenant go-live."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0F8B7D] selection:text-white">
      <MarketingHeader activePath="/operate" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Interactive Live Facility Cockpit                       */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-teal-50/25 to-[#F8FAFC] border-b border-slate-200 overflow-hidden">
        {/* Luminous Ambient Background Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0F8B7D]/8 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-teal-600/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0F8B7D10_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Eyebrow, Punchy Headline, Clear CTAs & Proof */}
            <div className="lg:col-span-6 text-left">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-200 bg-teal-50 text-[#0F8B7D] text-xs font-black uppercase tracking-wider mb-5 shadow-2xs">
                <Gauge size={14} className="text-[#0F8B7D]" />
                <span>Next-Gen CAFM &amp; Facility OS</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-[50px] font-black text-slate-900 tracking-tight leading-[1.12] mb-5">
                Run Commercial Real Estate Operations with <span className="text-[#0F8B7D]">Institutional Precision</span>
              </h1>

              {/* Concise, Scannable Subhead */}
              <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-xl mb-8 leading-relaxed">
                Replace chaotic paper logbooks, WhatsApp groups, and missed maintenance with automated 52-week PPM schedules, real-time SLA escalation, and touchless tenant visitor flow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
                <Link
                  href="/signup?plan=operate-trial"
                  className="px-7 py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-sm shadow-lg shadow-[#0F8B7D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSlideInOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Product Tour</span>
                </button>
              </div>

              {/* Trust & Deployment Proof */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-semibold pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D]" />
                  <span>42M+ Sq.Ft. Managed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D]" />
                  <span>99.8% MEP Uptime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D]" />
                  <span>15-Day Go-Live</span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Interactive Operations Cockpit Preview */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-5 sm:p-6 relative text-slate-900 overflow-hidden">
                
                {/* Browser Header Strip */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2 font-medium">
                      app.officex.in/operate/tower-a
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Facility Telemetry</span>
                  </div>
                </div>

                {/* Score & Uptime Highlight */}
                <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/70 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Workplace Health Index
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-slate-900">91</span>
                        <span className="text-xs text-slate-400 font-medium">/ 100</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          Optimal Grade-A
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Critical MEP Uptime
                      </span>
                      <span className="text-lg font-black text-emerald-600 block mt-0.5">
                        99.8%
                      </span>
                    </div>
                  </div>

                  {/* 4 Dimension Progress Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block font-medium">HVAC Air IAQ</span>
                      <span className="text-xs font-black text-slate-800">96% Good</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block font-medium">Power Grid</span>
                      <span className="text-xs font-black text-emerald-600">0.99 PF</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block font-medium">SLA Resolution</span>
                      <span className="text-xs font-black text-[#0F8B7D]">32m Avg</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block font-medium">Tenant CSAT</span>
                      <span className="text-xs font-black text-slate-800">4.9 / 5</span>
                    </div>
                  </div>
                </div>

                {/* Live Critical Ticket Alert Card */}
                <div className="bg-white rounded-2xl p-4 border-2 border-rose-200/90 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertCircle size={12} className="text-rose-600" />
                      P1 CRITICAL · Chiller #02 Water Pressure Low
                    </span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⏱ 28m SLA Left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Basement Plant Room 02 · Sensor #SN-882</span>
                    <span className="text-emerald-600 font-black">Dispatched</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
                    <span>Assigned: Senior MEP Engineer</span>
                    <span className="text-slate-400 font-mono">Geo-Logged · 4m Away</span>
                  </div>
                </div>

                {/* 3 Live Telemetry Badges */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-[10px]">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">DG SYNCHRONIZATION</span>
                    <span className="font-black text-emerald-600">100% Standby</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">ELEVATOR ARD</span>
                    <span className="font-black text-emerald-600">12/12 Online</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">52-WK PPM AUTO</span>
                    <span className="font-black text-[#0F8B7D]">Week 36 Active</span>
                  </div>
                </div>

                {/* Visual Glow Accent */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0F8B7D]/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE VISUAL UPGRADE: Chaos vs. Institutional Digital Control            */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Operational Evolution
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            The OfficeX Transformation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            See how modern commercial towers replace manual paper registers with automated digital governance
          </p>
        </div>

        {/* 2 Visual Contrast Showcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Card A: The Status Quo (Without OfficeX Operate) */}
          <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full pointer-events-none" />
            <div>
              <div className="mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase">
                  <X size={13} className="text-rose-600" />
                  Without Operate
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4">
                Reactive Headaches &amp; Breakdowns
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Missed Preventive Maintenance</span>
                    <span className="text-[11px] text-slate-500">Unrecorded chiller and DG checkups leading to unexpected power cuts and repair bills.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Lost WhatsApp &amp; Verbal Tickets</span>
                    <span className="text-[11px] text-slate-500">Tenant complaints slip through without timestamps, accountability, or technician dispatch proof.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Congested 8-Minute Lobby Lines</span>
                    <span className="text-[11px] text-slate-500">Physical paper visitor registers cause security blindspots and frustrated corporate guests.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-rose-600 font-bold">
              <span>Risk: Catastrophic Downtime &amp; Audits</span>
              <span>High Operational Overhead</span>
            </div>
          </div>

          {/* Card B: With OfficeX Operate */}
          <div className="bg-white rounded-3xl border-2 border-teal-500/80 p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-teal-900/5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-50 rounded-bl-full pointer-events-none" />
            <div>
              <div className="mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-xs font-black uppercase">
                  <Check size={13} className="text-[#0F8B7D]" />
                  With OfficeX Operate
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4">
                Predictable 99.8% Uptime &amp; SLAs
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/50 border border-teal-200/70">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Automated 52-Week PPM Engine</span>
                    <span className="text-[11px] text-slate-600">OEM checklist schedules auto-trigger to technicians with mandatory offline photo evidence.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/50 border border-teal-200/70">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">QR Asset Tagging &amp; 32m SLA Clocks</span>
                    <span className="text-[11px] text-slate-600">Scan any equipment QR code to log issues. Multi-tiered escalations alert directors before breach.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/50 border border-teal-200/70">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">18-Second Touchless QR Lobby Entry</span>
                    <span className="text-[11px] text-slate-600">Pre-invited guests scan mobile passes directly at speed-gates with 100% digital security trails.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-teal-100 flex items-center justify-between text-xs text-[#0F8B7D] font-bold">
              <span>Result: 42% Less Downtime</span>
              <span>Zero Paper Logbooks</span>
            </div>
          </div>

        </div>

        {/* Quantified Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">-42%</span>
            <span className="text-xs text-slate-500 font-semibold">Equipment Downtime</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-[#0F8B7D] block">32 Mins</span>
            <span className="text-xs text-slate-500 font-semibold">Avg SLA Resolution</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">&lt; 18 Sec</span>
            <span className="text-xs text-slate-500 font-semibold">Lobby QR Check-in</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">100%</span>
            <span className="text-xs text-slate-500 font-semibold">Statutory Audit Ready</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE BENTO GRID: Visual CAFM & Facility Suite                   */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
                Integrated Product Modules
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                The Complete Commercial CAFM Suite
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Visual operations engineered for facility directors, chief engineers, and tenant experience teams
              </p>
            </div>

            {/* Interactive Module Filter Tabs */}
            <div className="mt-4 md:mt-0 flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("ppm")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "ppm" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                52-Wk PPM
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sla")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "sla" ? "bg-[#0F8B7D] text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                SLA Engine
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("health")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "health" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Health Score
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("visitors")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "visitors" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Visitor Flow
              </button>
            </div>
          </div>

          {/* Visual Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: 52-Week Automated PPM Calendar (Large 2-Col Span) */}
            <div className="md:col-span-2 bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">52-Week Preventive Maintenance Calendar</h3>
                      <span className="text-xs text-slate-500 font-semibold">Auto-scheduled OEM &amp; statutory compliance checklists</span>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-200">
                    NBC 2016 Aligned
                  </span>
                </div>

                {/* Simulated Interactive Calendar Tasks View */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3 pb-2 border-b border-slate-100">
                    <span>WEEK 36 SCHEDULE · CHILLERS &amp; POWER</span>
                    <span className="text-[#0F8B7D]">12 Tasks Active</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <span className="font-bold text-slate-900 block">33kV Substation Transformer Oil BDV Test</span>
                          <span className="text-[10px] text-slate-500">Substation Bay 01 · Tech: Rajesh M. (CEA Certified)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Completed ✓
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <div>
                          <span className="font-bold text-slate-900 block">500 TR Chiller Condenser Tube Descaling</span>
                          <span className="text-[10px] text-slate-500">HVAC Plant Room B2 · Crew: Apex ElectroMech</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                        In Progress
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <div>
                          <span className="font-bold text-slate-900 block">Wet Riser Hydrant Pressure &amp; Hose Audit</span>
                          <span className="text-[10px] text-slate-500">Towers A &amp; B · Fire Safety Annual Renewal</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                        Scheduled (Fri)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Eliminate paper logbooks with mandatory photo geotags</span>
                <span className="font-bold text-[#0F8B7D] flex items-center gap-1">Learn PPM Automation <ChevronRight size={14} /></span>
              </div>
            </div>

            {/* Bento Card 2: Workplace Health Score Gauge */}
            <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Workplace Health Score</h3>
                    <span className="text-xs text-slate-500 font-semibold">Real-time building operational score</span>
                  </div>
                </div>

                {/* Score Circular Dial Preview */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center shadow-2xs my-2">
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center mb-2">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#0F8B7D]"
                        strokeDasharray="91, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-slate-900 block leading-none">91</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                    </div>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
                    Grade-A Certified Uptime
                  </span>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                Evaluates air quality, power factor, fire readiness &amp; CSAT
              </div>
            </div>

            {/* Bento Card 3: Real-Time SLA Escalation Clocks */}
            <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Multi-Tier SLA Engine</h3>
                    <span className="text-xs text-slate-500 font-semibold">Automated escalation to facility leads</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-rose-600">P1 Emergency SLA</span>
                    <span className="font-mono text-slate-900">&lt; 30 Mins Target</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: "78%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    If unresolved within 20 mins, automatic WhatsApp alert triggers to the Property General Manager.
                  </p>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                Average commercial resolution: 32 minutes
              </div>
            </div>

            {/* Bento Card 4: Touchless Visitor & Turnstile Flow */}
            <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Touchless Lobby Access</h3>
                    <span className="text-xs text-slate-500 font-semibold">Pre-invite QR passes for turnstiles</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                      <QrCode size={30} className="text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Fast-Track Gate Pass</span>
                      <span className="text-[10px] text-slate-400 block">Guest: Dr. Aryan Mehta</span>
                      <span className="inline-block mt-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Valid Turnstile 01–04
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                Lobby wait times reduced from 8 mins to 18 seconds
              </div>
            </div>

            {/* Bento Card 5: QR Asset Tagging & Digital Logbooks */}
            <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">QR Asset Register</h3>
                    <span className="text-xs text-slate-500 font-semibold">Instant equipment history &amp; warranties</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>York Chiller 500TR</span>
                    <span className="font-mono text-[11px] text-[#0F8B7D]">#CH-02-B2</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Last Overhaul: 12 Aug 2026</span>
                    <span className="text-emerald-600 font-bold">Health: 98%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    OEM Manuals &amp; Spare Parts Catalog attached
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                Every physical asset serialized with weatherproof tags
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE ROI CALCULATOR: Savings for Commercial Properties          */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-teal-50/70 via-white to-slate-50 rounded-3xl p-6 sm:p-10 text-slate-900 border border-teal-200/80 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F8B7D]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7">
              <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-2">
                Operational ROI Simulator
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Calculate Your Annual Maintenance Savings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-8 max-w-xl">
                Adjust your property area and asset volume to see estimated cost reductions, man-hours saved, and breakdown prevention.
              </p>

              {/* Slider 1: Building Area */}
              <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Total Super Built-up Area
                  </label>
                  <span className="text-sm font-black text-[#0F8B7D]">
                    {buildingArea.toLocaleString()} sq.ft.
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={buildingArea}
                  onChange={(e) => setBuildingArea(Number(e.target.value))}
                  className="w-full accent-[#0F8B7D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>50,000 sq.ft.</span>
                  <span>1,000,000 sq.ft.</span>
                  <span>2,000,000 sq.ft.</span>
                </div>
              </div>

              {/* Slider 2: Asset Count */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Total MEP &amp; Facility Assets (HVAC, DG, Lifts)
                  </label>
                  <span className="text-sm font-black text-[#0F8B7D]">
                    {assetCount.toLocaleString()} Assets
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="20"
                  value={assetCount}
                  onChange={(e) => setAssetCount(Number(e.target.value))}
                  className="w-full accent-[#0F8B7D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>100 Assets</span>
                  <span>1,000 Assets</span>
                  <span>2,000 Assets</span>
                </div>
              </div>
            </div>

            {/* Right Column: Calculated Outputs */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-teal-200 shadow-lg p-6 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Estimated Annual Value Reclaimed
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight my-2">
                ₹{calculatedSavings.savingsLakhs} <span className="text-xl font-bold text-[#0F8B7D]">Lakhs</span>
              </div>
              <span className="text-xs text-slate-500 block mb-6">
                Direct savings through avoided repairs &amp; SLA penalty control
              </span>

              <div className="grid grid-cols-2 gap-3 text-left mb-6">
                <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Technician Hours Saved</span>
                  <span className="text-base font-black text-slate-900">{calculatedSavings.manHours} hrs/yr</span>
                </div>
                <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Breakdown Risk</span>
                  <span className="text-base font-black text-[#0F8B7D]">-{calculatedSavings.breakdownReduction}% Risk</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSlideInOpen(true)}
                className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-md shadow-[#0F8B7D]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Custom Campus Audit</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. STAKEHOLDER PROOF: Real Commercial Operations Outcomes                 */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Field-Proven Results
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Built for Every Operational Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Delivering measurable ROI and peace of mind across facility and workplace leadership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stakeholders.map((sh, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={sh.image}
                      alt={sh.role}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-white text-base font-black block leading-snug">{sh.role}</span>
                      <span className="text-teal-300 text-[11px] font-bold">{sh.subtitle}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                      &ldquo;{sh.quote}&rdquo;
                    </p>

                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      {sh.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-xs font-black text-slate-900 block">{m.value}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key Capability Chips */}
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {sh.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-center gap-2">
                          <Check size={13} className="text-[#0F8B7D] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-100/80 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => setSlideInOpen(true)}
                    className="text-xs font-black text-[#0F8B7D] hover:underline"
                  >
                    View Role Workflows →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. 15-DAY RAPID DEPLOYMENT ROADMAP                                       */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Turnkey Implementation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            15-Day Rapid Deployment Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            From physical asset tagging to complete staff training and digital go-live
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              title: "Asset Audit & QR Tagging",
              days: "Days 1 – 4",
              desc: "On-site engineering team catalogs all MEP, HVAC, and power gear with weather-resistant QR barcodes."
            },
            {
              step: "02",
              title: "52-Week PPM Setup",
              days: "Days 5 – 8",
              desc: "Import manufacturer maintenance frequencies, OEM checklists, and CFO statutory safety rules."
            },
            {
              step: "03",
              title: "Staff & Tech Training",
              days: "Days 9 – 12",
              desc: "Hands-on mobile app coaching for shift technicians, security supervisors, and helpdesk dispatchers."
            },
            {
              step: "04",
              title: "Tenant Onboarding & Go-Live",
              days: "Day 15 Go-Live",
              desc: "Deploy lobby QR check-in posters, distribute tenant login credentials, and activate live telemetry."
            }
          ].map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-2xs hover:shadow-lg transition-all"
            >
              <span className="text-4xl font-black text-slate-100 absolute top-3 right-4 select-none">
                {s.step}
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] text-[11px] font-black uppercase mb-3 border border-teal-200">
                {s.days}
              </span>
              <h3 className="text-base font-black text-slate-900 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRANSPARENT PRICING TIERS                                             */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Predictable Per-Sq.Ft. Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Invest in Flawless Facility Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Scalable pricing based on your commercial portfolio scale with zero hidden implementation fees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? "bg-white border-2 border-[#0F8B7D] shadow-xl shadow-teal-900/10 relative scale-100 md:scale-[1.02]"
                    : "bg-white border border-slate-200 shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-black text-slate-900">{tier.name}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      tier.popular
                        ? "bg-[#0F8B7D] text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {tier.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">{tier.price}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1.5">/ {tier.period}</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    {tier.desc}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-200/80 mb-8 text-xs text-slate-600 font-medium">
                    {tier.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSlideInOpen(true)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${tier.btnColor}`}
                >
                  Choose {tier.name}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQS ACCORDION                                                        */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Everything About Deploying OfficeX Operate
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#0F8B7D] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${activeFaq === idx ? "rotate-180 text-[#0F8B7D]" : "text-slate-400"}`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL HIGH-CONVERSION CTA BAND                                        */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-16">
        <div className="bg-[#0F8B7D] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
              Ready for Zero-Downtime Operations?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Deploy OfficeX Operate on Your Commercial Building in 15 Days
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 font-medium mb-8 leading-relaxed">
              Join leading tech parks, SEZs, and Grade-A commercial asset managers who have eliminated maintenance chaos and paper logbooks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/signup?plan=operate-trial"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#0F8B7D] font-black text-sm shadow-md hover:bg-teal-50 transition-all text-center cursor-pointer"
              >
                Start Free 14-Day Pilot
              </Link>
              <button
                type="button"
                onClick={() => setSlideInOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-800/60 hover:bg-teal-800 text-white font-bold text-sm border border-white/20 transition-all text-center cursor-pointer"
              >
                Schedule Engineering Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Slide-In Modal */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["operate"] }}
      />

      <Footer />
    </div>
  );
}

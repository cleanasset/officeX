"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Check,
  Star,
  ShieldCheck,
  Building2,
  Users,
  FileCheck2,
  Wrench,
  Kanban,
  Headphones,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function OperatePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<
    { modules?: string[] } | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const openEnquiry = (mod: string) => {
    setEnquiryPrefill({ modules: [mod] });
    setSlideInOpen(true);
  };

  // Continuous auto-advance every 3.6s (resets timer smoothly on every tab switch)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 6);
    }, 3600);
    return () => clearInterval(timer);
  }, [activeTab]);

  /* ──────── 6 SAAS PRODUCTS DATA (Clean, Minimal & Uncluttered) ──────── */
  const productTabs = [
    {
      id: "rent-roll",
      name: "Rent Roll",
      icon: Building2,
      title: "Automated Rent Roll & Billing",
      tagline: "Automate lease escalations, CAM reconciliations, and direct bank escrow with 100% auditability.",
      highlights: [
        "5% Auto-escalation alerts before anniversary dates",
        "Transparent CAM common-area cost pooling",
        "Automated bank nodal escrow settlement",
      ],
      image: "/mockup-rentroll-clean.png",
      route: "/properties/rent-roll",
    },
    {
      id: "visitors",
      name: "Visitor Flow",
      icon: Users,
      title: "Visitor & Speed-Gate Access",
      tagline: "High-speed guest check-in via WhatsApp QR passes and optical turnstiles for 18-second lobby transit.",
      highlights: [
        "Instant WhatsApp guest barcode passes",
        "Boon Edam & Gunnebo optical speed-gate relay",
        "Real-time overstay & lobby occupancy alerts",
      ],
      image: "/mockup-visitors-clean.png",
      route: "/tenant/visitors",
    },
    {
      id: "compliance",
      name: "Compliance Calendar",
      icon: FileCheck2,
      title: "Statutory Compliance Calendar",
      tagline: "Centralized governance for Fire NOC, Lift Form A, PCB CTO, and municipal commercial renewals.",
      highlights: [
        "48 Pre-configured commercial tower licenses",
        "90-Day automated renewal escalation alerts",
        "Tamper-proof REIT auditor repository",
      ],
      image: "/mockup-compliance-clean.png",
      route: "/compliance",
    },
    {
      id: "ppm",
      name: "52-Week PPM",
      icon: Wrench,
      title: "52-Week Preventive Maintenance",
      tagline: "Digitize MEP equipment servicing with OEM matrices, asset QR passports, and zero paper logbooks.",
      highlights: [
        "52-Week chiller & DG service schedule",
        "Asset QR passports for on-ground technicians",
        "Guaranteed 99.8% MEP uptime SLA clocks",
      ],
      image: "/mockup-ppm-clean.png",
      route: "/ops/ppm",
    },
    {
      id: "crm",
      name: "Lease CRM",
      icon: Kanban,
      title: "Commercial Lease Dealflow CRM",
      tagline: "End-to-end leasing from space discovery and demised floor stacking to executed digital LOIs.",
      highlights: [
        "Visual deal velocity pipeline & tour tracking",
        "Real-time floorplate vacancy stacking",
        "Automated commercial LOI generator",
      ],
      image: "/mockup-crm-clean.png",
      route: "/leasing/pipeline",
    },
    {
      id: "helpdesk",
      name: "Tenant Helpdesk",
      icon: Headphones,
      title: "Tenant Helpdesk & Room Booking",
      tagline: "10-second QR ticketing, executive boardroom reservations, and guaranteed SLA resolution clocks.",
      highlights: [
        "10-Second QR ticketing for maintenance & HVAC",
        "Guaranteed supervisor escalation countdowns",
        "Integrated conference calendar with tenant billing",
      ],
      image: "/mockup-helpdesk-clean.png",
      route: "/tenant/tickets",
    },
  ];

  const current = productTabs[activeTab];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#0D7B6C] selection:text-white flex flex-col font-sans">
      <MarketingHeader />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Clean, punchy, product-first (No "Book a Demo" barrier)
          ═══════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — Clean, Authoritative, Enterprise CRE
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-5 tracking-wide shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0D7B6C]" />
            ENTERPRISE FACILITY MANAGEMENT & CMMS
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#0F172A] tracking-tight leading-[1.12] mb-5">
            The Modern Operating System for{" "}
            <span className="text-[#0D7B6C] block sm:inline">Commercial Workspaces</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            One unified institutional platform for 52-week automated PPM, tenant rent roll,
            turnstile speed-gates, lease dealflow, and statutory compliance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <a
              href="#saas-modules"
              className="px-6 py-3.5 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 inline-flex items-center gap-2 group"
            >
              Explore 6 SaaS Modules
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <button
              onClick={() => openEnquiry("General Platform")}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 shadow-2xs transition-all"
            >
              Request Walkthrough
            </button>
          </div>

          {/* Enterprise Client Trust Strip */}
          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              TRUSTED BY ASSET MANAGERS & OPERATORS ACROSS 15M+ SQ.FT
            </p>
            <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-10 text-xs sm:text-sm font-black tracking-wider text-slate-400">
              <span className="hover:text-slate-700 transition-colors">PRESTIGE GROUP</span>
              <span className="hover:text-slate-700 transition-colors">BRIGADE TECH</span>
              <span className="hover:text-slate-700 transition-colors">EMBASSY PARKS</span>
              <span className="hover:text-slate-700 transition-colors">BROOKFIELD</span>
              <span className="hover:text-slate-700 transition-colors">MINDSPACE REIT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. SAAS PRODUCT SHOWCASE — 6 Core Built-In Commercial Modules
          ═══════════════════════════════════════════════════════════ */}
      <section id="saas-modules" className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 mb-2.5 tracking-wide shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D7B6C]" />
              INTERACTIVE SAAS PLATFORM
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-2.5">
              Six Built-In Commercial Modules
            </h2>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Select any module below to preview the live interface and core commercial workflows.
            </p>
          </div>

          {/* Facilio-Style Clean Segmented Tab Bar — One size smaller, crisp & balanced */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex flex-wrap items-center justify-center p-1 bg-slate-100 border border-slate-200/90 rounded-xl gap-1 shadow-2xs">
              {productTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white text-[#0D7B6C] shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#0D7B6C]" : "text-slate-400"}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Product Stage — Clean & Proportionate */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-200/90 shadow-sm transition-all mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column (5 cols): One size smaller typography */}
              <div className="lg:col-span-5 pr-0 lg:pr-3">
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-extrabold text-[#0F172A] tracking-tight leading-snug mb-2.5">
                  {current.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {current.tagline}
                </p>

                {/* Clean, short highlights */}
                <div className="space-y-2.5 mb-5">
                  {current.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-4.5 h-4.5 rounded-full bg-teal-50 border border-teal-200/90 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#0D7B6C] stroke-[2.5]" />
                      </div>
                      <span className="font-semibold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Single clean CTA button */}
                <div className="pt-0.5">
                  <Link
                    href={current.route}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-semibold rounded-lg text-xs sm:text-sm transition-all shadow-sm group"
                  >
                    Open Live Interface
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Right Column (7 cols): Sleek Mac / SaaS Browser Window Frame */}
              <div className="lg:col-span-7">
                <div className="rounded-xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
                  {/* Browser Title Bar */}
                  <div className="px-3.5 py-1.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 ml-1">
                        app.officex.in{current.route}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider text-[#0D7B6C] bg-teal-50 border border-teal-200">
                      LIVE SYSTEM
                    </span>
                  </div>

                  {/* Clean Product Mockup */}
                  <div className="relative bg-white p-2 sm:p-2.5 flex items-center justify-center">
                    <Image
                      key={current.id}
                      src={current.image}
                      alt={`${current.title} Mockup`}
                      width={960}
                      height={540}
                      className="w-full max-h-[240px] sm:max-h-[255px] object-contain rounded-lg transition-all duration-300"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-5 border-t border-slate-200 text-center max-w-3xl mx-auto">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">15M+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Sq.Ft Managed</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">450+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Commercial Properties</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0D7B6C]">₹18 Cr+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Annualized Rent Roll</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">99.8%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Critical MEP Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROCESS & ESCROW PIPELINE (Matches media_1789131508092.png)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Verified Execution & Escrow Settlement
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              From contract award to on-ground sign-off and instant vendor release.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-14">
            {/* 5 Numbered Steps */}
            <div className="space-y-5">
              {[
                {
                  num: "1",
                  title: "Digital Property & Asset Onboarding",
                  desc: "Demised spatial stacking, asset register QR tagging, and statutory audit.",
                },
                {
                  num: "2",
                  title: "PPM & Rent Roll Automation",
                  desc: "Automate 52-week maintenance schedules, lease escalations, and CAM pools.",
                },
                {
                  num: "3",
                  title: "Fast-Track Turnstile & Occupier Flow",
                  desc: "Deploy pre-registered WhatsApp QR passes and 10-second helpdesk ticketing.",
                },
                {
                  num: "4",
                  title: "Verified Work Order Milestone Sign-Off",
                  desc: "Facility managers audit maintenance deliverables before funds release.",
                },
                {
                  num: "5",
                  title: "Escrow-Protected Milestone Settlement",
                  desc: "Razorpay Escrow releases 90% vendor disbursement immediately upon sign-off.",
                },
              ].map((s) => (
                <div key={s.num} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Escrow Flow Diagram */}
            <div className="bg-[#F8FAFC] p-6 sm:p-8 rounded-2xl border border-slate-200">
              <div className="space-y-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    1. PROPERTY CLIENT DEPOSITS CONTRACT VALUE
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    100% Locked in Escrow Nodal Account
                  </div>
                </div>

                <div className="flex justify-center text-slate-400 py-0.5">
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-[#0D7B6C] uppercase tracking-wider">
                    2. VERIFIED FACILITY MILESTONE SIGN-OFF
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                    Property Manager audits and approves on-ground deliverables
                  </div>
                </div>

                <div className="flex justify-center text-slate-400 py-0.5">
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      90% VENDOR PAYOUT
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                      Direct Bank Release
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      10% PLATFORM FEE
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                      OfficeX Facilitation
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-5 mt-5 border-t border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Governed by Indian Escrow Regulations
                </span>
                <span className="font-bold text-slate-700">100% Auditable</span>
              </div>
            </div>
          </div>

          {/* Clean Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
              <div className="flex gap-0.5 text-[#0D7B6C] mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-3">
                &ldquo;Rent collection cycle dropped from 28 days to 4 days across our commercial tower. The automated CAM reconciliation is flawless.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Rajesh V.</div>
              <div className="text-[11px] text-slate-500">VP · Embassy Office Parks</div>
            </div>

            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
              <div className="flex gap-0.5 text-[#0D7B6C] mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-3">
                &ldquo;Our chillers and DGs operate at 99.8% uptime with the 52-week automated PPM. Zero paper logbooks across 2.2M sq.ft.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Suresh N.</div>
              <div className="text-[11px] text-slate-500">Head Ops · Prestige Group</div>
            </div>

            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
              <div className="flex gap-0.5 text-[#0D7B6C] mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-3">
                &ldquo;Over 850 daily visitors pass through our optical turnstiles in 18 seconds with WhatsApp QR passes. Lobby congestion is gone.&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900">Amit S.</div>
              <div className="text-[11px] text-slate-500">GM · Brigade Tech Gardens</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING — Clean, white, transparent tiers
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Per sq.ft. subscription scaled to your commercial portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Starter</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹1.50</span>
                <span className="text-xs text-slate-500">/ sq.ft / mo</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Basic property records & QR registry.</p>
              <div className="space-y-2.5 mb-8">
                {["Property & Unit Database", "Basic Visitor Flow", "Asset QR Registry", "Email Support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#0D7B6C] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Starter")}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs sm:text-sm transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Professional */}
          <div className="bg-white rounded-2xl border-2 border-[#0D7B6C] p-7 shadow-sm relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0D7B6C] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold text-[#0D7B6C] uppercase tracking-wider mb-3">Professional</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹2.80</span>
                <span className="text-xs text-slate-500">/ sq.ft / mo</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Complete SaaS suite for Grade-A commercial towers.</p>
              <div className="space-y-2.5 mb-8">
                {[
                  "Full Rent Roll & Auto Escalations",
                  "Turnstile Speed-Gate Integration",
                  "Statutory Compliance (48 Licenses)",
                  "52-Week Automated PPM & CAFM",
                  "Tenant Helpdesk & Room Booking",
                  "Dedicated Account Manager",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-[#0D7B6C] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Professional")}
              className="w-full py-2.5 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              Start Free Pilot
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹4.50</span>
                <span className="text-xs text-slate-500">/ sq.ft / mo</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">IT Parks, SEZs & REIT Portfolios.</p>
              <div className="space-y-2.5 mb-8">
                {[
                  "Unlimited Sq.Ft & Multi-Tower",
                  "SAP / Oracle ERP Integration",
                  "Razorpay Escrow Split Engine",
                  "ESG & Utility Analytics",
                  "24/7 SLA · 1-Hour Response",
                  "Full RBAC & Audit Trails",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#0D7B6C] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => openEnquiry("Enterprise")}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs sm:text-sm transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ ACCORDION
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-2.5">
          {[
            {
              q: "How fast can we onboard our commercial property?",
              a: "Standard onboarding takes 5 to 7 business days. We ingest your existing rent roll, spatial stacking plans, and asset registers with automated reconciliation."
            },
            {
              q: "Does the visitor module integrate with our existing turnstiles?",
              a: "Yes. OfficeX integrates with major turnstile and speed-gate hardware including Boon Edam, Gunnebo, and Hikvision via standard Wiegand and TCP/IP relay controllers."
            },
            {
              q: "How does the statutory compliance calendar work?",
              a: "We track 48 commercial building licenses (Fire NOC, Lift Form A, PCB CTO, etc.) with automatic 90, 60, and 30-day escalation alerts before expiration."
            },
            {
              q: "How does the escrow mechanism protect payments?",
              a: "Clients deposit milestone values into Razorpay nodal escrow accounts. Payouts are released to vendors only upon verified sign-off by property facility managers."
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#0D7B6C] transition-colors"
              >
                {faq.q}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-3 ${
                    activeFaq === i ? "rotate-180 text-[#0D7B6C]" : ""
                  }`}
                />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D7B6C]" />
            ENTERPRISE GRADE INFRASTRUCTURE
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            Ready to modernize your commercial portfolio?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed">
            Join 450+ commercial properties managing operations, rent, and compliance on OfficeX.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/properties/rent-roll"
              className="px-7 py-3.5 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
            >
              Launch Live Platform ↗
            </Link>
            <button
              onClick={() => openEnquiry("Enterprise Onboarding")}
              className="px-7 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-all"
            >
              Talk to Operations Team
            </button>
          </div>
        </div>
      </section>

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={enquiryPrefill}
      />

      <Footer />
    </div>
  );
}

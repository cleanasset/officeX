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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const openEnquiry = (mod: string) => {
    setEnquiryPrefill({ modules: [mod] });
    setSlideInOpen(true);
  };

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
      landingRoute: "/operate/rent-roll",
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
      landingRoute: "/operate/visitors",
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
      landingRoute: "/operate/compliance",
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
      landingRoute: "/operate/ppm",
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
      landingRoute: "/operate/lease-crm",
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
      landingRoute: "/operate/helpdesk",
      route: "/tenant/tickets",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#0D7B6C] selection:text-white flex flex-col font-sans">
      <MarketingHeader />

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — Sunlit High-Tech SaaS Operations Command Center
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] w-full max-w-full overflow-hidden flex flex-col justify-center pt-12 sm:pt-16 pb-12 sm:pb-16 bg-[#F8FAFC] border-b border-slate-200/80">
        {/* Background Banner Image — Displays All 6 SaaS Modules on Holographic Glass Displays */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/images/officex_all_saas_modules_banner.jpg"
            alt="OfficeX Operate CAFM, Rent Roll, PPM & Smart Commercial SaaS Suite"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />

          {/* Clean Optical Clarity Scrim: Enhances text readability across the center frosted partition while keeping all 6 SaaS screens 100% sharp and readable */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_44%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.50)_50%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Hero Content — Centered Perfectly Between the 6 SaaS Displays */}
        <div className="relative z-10 max-w-2xl lg:max-w-[680px] mx-auto w-full px-4 sm:px-6 text-center flex flex-col items-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-teal-200/90 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0D7B6C] animate-pulse shrink-0" />
            <span>ENTERPRISE FACILITY MANAGEMENT &amp; CMMS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-950 tracking-tight leading-[1.12] mb-4 text-center">
            The Modern Operating System for{" "}
            <span className="text-[#0D7B6C] block sm:inline">Commercial Workspaces</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-slate-700 font-semibold leading-relaxed mb-7">
            One unified institutional platform for 52-week automated PPM, tenant rent roll,
            turnstile speed-gates, lease dealflow, and statutory compliance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            <a
              href="#saas-modules"
              className="px-6 py-3 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-[#0D7B6C]/25 hover:shadow-lg inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore 6 SaaS Modules</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button
              onClick={() => openEnquiry("General Platform")}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              Request Walkthrough
            </button>
          </div>

          {/* Enterprise Client Trust Strip */}
          <div className="pt-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">
              TRUSTED BY ASSET MANAGERS &amp; OPERATORS ACROSS 15M+ SQ.FT
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs sm:text-sm font-black tracking-wider text-slate-800">
              <span className="hover:text-[#0D7B6C] transition-colors">PRESTIGE GROUP</span>
              <span className="hover:text-[#0D7B6C] transition-colors">BRIGADE TECH</span>
              <span className="hover:text-[#0D7B6C] transition-colors">EMBASSY PARKS</span>
              <span className="hover:text-[#0D7B6C] transition-colors">BROOKFIELD</span>
              <span className="hover:text-[#0D7B6C] transition-colors">MINDSPACE REIT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. SAAS PRODUCT SHOWCASE — Core Built-In Commercial Modules
          ═══════════════════════════════════════════════════════════ */}
      <section id="saas-modules" className="relative py-14 sm:py-18 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 mb-3 tracking-wide shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D7B6C] animate-pulse" />
              INTERACTIVE SAAS PLATFORM
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-3">
              Built-In Commercial SaaS Modules
            </h2>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore each dedicated operations module separately with direct access to live interfaces and core commercial workflows.
            </p>
          </div>

          {/* All Modules in Separate Dedicated Sections */}
          <div className="space-y-8 mb-10">
            {productTabs.map((product, idx) => {
              const Icon = product.icon;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={product.id}
                  id={product.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Content Column (5 cols) */}
                    <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                      {/* Module Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-black text-[#0D7B6C] mb-3">
                        <Icon size={14} className="text-[#0D7B6C]" />
                        <span>{product.name} Module</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                        {product.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed mb-5">
                        {product.tagline}
                      </p>

                      {/* Feature Highlights */}
                      <div className="space-y-2.5 mb-6">
                        {product.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#0D7B6C] stroke-[2.5]" />
                            </div>
                            <span className="font-semibold text-slate-800">{h}</span>
                          </div>
                        ))}
                      </div>

                      {/* Direct Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          href={product.landingRoute}
                          className="px-5 py-2.5 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
                        >
                          <span>Explore {product.name} Service</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                          href={product.route}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Live Portal Demo</span>
                          <ArrowUpRight size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEnquiry(product.name)}
                          className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all cursor-pointer"
                        >
                          Enquire
                        </button>
                      </div>
                    </div>

                    {/* Mockup Preview Column (7 cols) */}
                    <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
                        {/* Browser Window Frame */}
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 ml-1">
                              officex.in{product.landingRoute}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={product.landingRoute}
                              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              SERVICE PAGE
                            </Link>
                            <Link
                              href={product.route}
                              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#0D7B6C] bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1"
                            >
                              <span>LIVE DEMO</span>
                              <ArrowUpRight size={11} />
                            </Link>
                          </div>
                        </div>

                        {/* Product Mockup Image */}
                        <div className="relative bg-white p-3 sm:p-5 flex items-center justify-center">
                          <Image
                            src={product.image}
                            alt={`${product.title} Mockup`}
                            width={960}
                            height={540}
                            className="w-full max-h-[300px] object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

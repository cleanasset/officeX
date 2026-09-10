"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2, ShieldCheck, FileCheck, CheckCircle2, TrendingUp, Users,
  Scale, Wrench, BarChart3, Leaf, ClipboardList, Phone, ArrowRight,
  ChevronDown, Star, Quote, Clock, Zap, Eye, Heart, Shield, Sparkles,
  Layers, Check, HelpCircle, FileText, Download, ChevronRight, Award,
  Activity, ArrowUpRight
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";

export default function ManagedServicesPage() {
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeStatement, setActiveStatement] = useState(0);

  // Auto-cycle the transformation statements (Native Sutra inspiration)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatement((prev) => (prev + 1) % transformationStatements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const transformationStatements = [
    {
      before: "Managing commercial property is so much work",
      crossed: "so much",
      solution: "Zero",
      sub: "From tenant fit-outs to mechanical plant upkeep — our dedicated directors handle 100% of operations."
    },
    {
      before: "I spend most of my time dealing with vendor escalations & maintenance",
      crossed: "most",
      solution: "None",
      sub: "One single point of contact coordinates all technical MEP, housekeeping, and life safety teams."
    },
    {
      before: "I always worry about statutory audit notices and lift/fire licenses",
      crossed: "always",
      solution: "Never",
      sub: "Cloud-vaulted statutory compliance with zero-notice liability guarantees and automated renewals."
    },
    {
      before: "Commercial tenant onboarding and architectural fit-outs are stressful",
      crossed: "stressful",
      solution: "Friction-Free",
      sub: "Turnkey tenant handover protocols, technical snagging, and architectural fit-out governance delivered on time."
    },
    {
      before: "I wish I had invested in no more commercial properties",
      crossed: "no",
      solution: "More",
      sub: "Optimized Net Operating Income (NOI) and 99.8% plant uptime give you total confidence to scale your portfolio."
    }
  ];

  // 3 Core Pillars (Native Sutra "What We Do" Structure)
  const corePillars = [
    {
      title: "360° End-to-End Asset Stewardship",
      desc: "Complete operational stewardship across your building's full lifecycle. Right from possession and developer snagging to international-grade tenant fit-outs, rent roll collections, 52-week preventive plant diagnostics, and cloud compliance paperwork — all handled seamlessly under one institutional roof.",
      icon: Building2,
      badge: "Full Lifecycle",
      metrics: "Possession to Yield"
    },
    {
      title: "Single Point of Contact (Hassle-Free)",
      desc: "Property management across multiple contractors, municipal agencies, and corporate tenants is inherently fragmented. OfficeX establishes a single dedicated Property Director for your portfolio who serves as your sole executive interface. You receive structured updates while your team enjoys complete peace of mind.",
      icon: Users,
      badge: "Dedicated Director",
      metrics: "1 Direct Interface"
    },
    {
      title: "Fiduciary Trust & Open-Book Operations",
      desc: "Keeping your investment yield front and center, we outline long-term operating strategies that maximize Net Operating Income (NOI). Our contracts cover all foreseeable operational scenarios with 100% open-book pass-through accounting, contractual uptime SLAs, and zero hidden markups.",
      icon: ShieldCheck,
      badge: "100% Open-Book",
      metrics: "Audited Ledger"
    }
  ];

  // 9 Solutions We Offer (Native Sutra's 9 Capabilities + CBRE Institutional Depth)
  const solutions = [
    {
      number: "01",
      title: "Building Possession & Developer Handover",
      desc: "Eliminate friction during developer or contractor handovers. Our senior MEP engineers conduct exhaustive snagging audits across chillers, electrical substations, plumbing, and life-safety systems without requiring your physical presence on site.",
      icon: Building2,
      highlight: "Technical Snagging & MEP Audit"
    },
    {
      number: "02",
      title: "Lease Administration & CAM Monetization",
      desc: "Institutional tenancy management designed to maximize rent collection and retention. We handle lease documentation with statutory indexation, automated Common Area Maintenance (CAM) reconciliations, and timely escrow distributions.",
      icon: TrendingUp,
      highlight: "Automated CAM & Lease Escrow"
    },
    {
      number: "03",
      title: "Turnkey Fit-Outs & Capex Governance",
      desc: "Designing and overseeing high-performance commercial interiors, demised configurations, and tenant improvements that balance spatial utility, energy efficiency, and modern corporate aesthetics on schedule and strictly within budget.",
      icon: Wrench,
      highlight: "Architectural & MEP Fit-Outs"
    },
    {
      number: "04",
      title: "Occupier Experience & Single-Interface Desk",
      desc: "Managing the complete interface with corporate occupants on behalf of the asset owner. Omnichannel ticketing with guaranteed 15-minute response SLAs, automated escalations, and dedicated tenant concierge to protect tenant satisfaction.",
      icon: Users,
      highlight: "15-Min Response SLA"
    },
    {
      number: "05",
      title: "52-Week Routine Building Health Checks",
      desc: "Conducting systematic 52-week preventive maintenance schedules across HVAC chillers, diesel generator sets, water treatment (STP/WTP), elevators, and building facade systems to ensure long-term structural and mechanical integrity.",
      icon: Activity,
      highlight: "52-Week Preventive PPM"
    },
    {
      number: "06",
      title: "Statutory Documentation & NOC Vault",
      desc: "Managing all mandatory statutory requirements — Fire Safety NOC, lift licenses, pollution control consents, DG permissions, and municipal filings — centralized in a tamper-proof digital cloud vault with zero-notice liability guarantees.",
      icon: Scale,
      highlight: "Centralized Digital NOC Vault"
    },
    {
      number: "07",
      title: "Strategic NOI & Asset Monetization",
      desc: "Maximizing your real estate earning potential through CAM benchmarking, operational value-engineering, utility consumption reduction, and ancillary rooftop/telecom and parking monetization strategies.",
      icon: BarChart3,
      highlight: "Yield & Energy Optimization"
    },
    {
      number: "08",
      title: "Asset Succession & Transition Planning",
      desc: "Ensuring an audit-ready, well-organized transition of commercial property ownership. We maintain pristine asset registers, digitized lease rolls, and vendor novation packages for seamless investor due diligence or institutional transfers.",
      icon: Layers,
      highlight: "Audit-Ready Diligence Vault"
    },
    {
      number: "09",
      title: "Sustainability & Net-Zero ESG Operations",
      desc: "Executing institutional sustainability blueprints including continuous energy benchmarking, water recycling metrics, waste-to-resource tracking, and green building compliance (LEED, IGBC, WELL) to lower OPEX and elevate asset grade.",
      icon: Leaf,
      highlight: "ESG Compliance & Energy Audits"
    }
  ];

  // 9 Powerful Controls (Native Sutra "9 Powerful Pointers" blueprint banner)
  const ninePointers = [
    "Strict 100% Pass-Through Billing with Original Invoices",
    "Digital Preventative Maintenance (PPM) Schedules",
    "Pre-emptive Statutory NOC Renewals 60 Days Prior",
    "Quarterly CAM Cost Benchmarking Against Market Medians",
    "Centralized Vendor Escrow & Performance Penalty Enforcements",
    "Real-Time Chiller & DG Fuel Telemetry Monitoring",
    "Automated Tenant Satisfaction & Churn Early-Warning Index",
    "52-Week Structural & Facade Diagnostic Inspections",
    "Single Direct Accountability: Designated Property Director"
  ];

  // Institutional Testimonials (Executive Proof)
  const testimonials = [
    {
      name: "Pavan Vaish",
      role: "Founding Partner, Prime Commercial Real Estate Fund",
      quote: "OfficeX's one-stop managed stewardship has ensured our 3 commercial grade-A assets are impeccably maintained, fully compliant, and consistently cash-flow positive without our investment committee getting into daily operational friction. The single point of contact model brings absolute peace of mind.",
      tag: "Multi-Asset Commercial Portfolio"
    },
    {
      name: "Rohit Bansal",
      role: "Co-Founder & Technology Enterprise Trustee",
      quote: "We engaged OfficeX for managing our commercial headquarters and tech campus. Their team conveniently takes care of everything — from tenant fit-outs and lease documentation to 24/7 MEP operations and open-book CAM audits. It makes the entire ownership experience completely seamless.",
      tag: "Commercial Campus & Headquarters"
    },
    {
      name: "Suresh Raman",
      role: "Managing Director & Senior Real Estate Risk Officer",
      quote: "Managing premium assets remotely from overseas used to be an administrative nightmare. Partnering with OfficeX gave us institutional-grade rigor. Their monthly MIS reports, predictive equipment health checks, and transparent pass-through accounting have raised the standard for property management.",
      tag: "Cross-Border Family Office Assets"
    },
    {
      name: "Archana & Rajarshri Panja",
      role: "Corporate Asset Directors, Global Logistics Enterprise",
      quote: "Being architects and enterprise asset owners, we were exceptionally specific about technical MEP compliance and aesthetic upkeep. OfficeX interpreted our standards to the core, converted bare shells into fully leased spaces, and maintain 99.8% mechanical uptime with zero excuses.",
      tag: "Grade-A Office Asset Portfolio"
    }
  ];

  // FAQs (Native Sutra + CBRE Institutional Rigor)
  const faqs = [
    {
      q: "What services does OfficeX Commercial Property Management include?",
      a: "OfficeX provides end-to-end commercial property stewardship: building possession & developer snagging, technical MEP operations (HVAC chillers, DG sets, STP/WTP, electrical substations), soft services, lease administration, automated CAM reconciliation, 52-week predictive health checks, statutory NOC renewals, and monthly institutional MIS reporting."
    },
    {
      q: "How does the Single Point of Contact (Dedicated Property Director) model work?",
      a: "Instead of dealing with fragmented electricians, plumbing vendors, lift contractors, security agencies, and corporate tenants, you are assigned a senior Property Director. This director oversees on-site technical supervisors and handles all escalations, regulatory filings, and tenant communications on your behalf."
    },
    {
      q: "What sets OfficeX apart from traditional facility management vendors?",
      a: "Traditional FM vendors merely supply contract labor with zero digital accountability and opaque billing markups. OfficeX integrates certified on-ground technical engineering with our proprietary CAFM software, contractually guaranteed 99.8% plant uptime, 100% open-book pass-through accounting, and executive monthly audit packs."
    },
    {
      q: "How does 100% Open-Book Pass-Through Billing work?",
      a: "You receive all original contractor, utility, and vendor invoices at actual cost without hidden commissions or inflated markups. OfficeX charges a transparent, agreed-upon management fee. Every invoice, petty expense, and meter reading is logged digitally for complete audit readiness."
    },
    {
      q: "Can OfficeX manage our property if the owners or trustees reside overseas?",
      a: "Yes. Over 60% of our managed asset base is owned by cross-border family offices, institutional investors, and overseas trustees. Through our digital dashboard and executive monthly MIS packs, owners monitor asset health, revenue collections, tenant satisfaction, and compliance from anywhere in the world."
    },
    {
      q: "Can you customize services to suit specific asset profiles?",
      a: "Absolutely. Whether you own an entire 500,000 sq.ft. Grade-A tech park, a mid-rise boutique commercial building, or a multi-tenant retail complex, we tailor staffing levels, technical PPM frequencies, and lease administration to match your investment criteria and yield goals."
    },
    {
      q: "What emergency response protocols are guaranteed under contract?",
      a: "Our centralized 24/7 technical engineering command desks support on-site staff with a contractually backed 15-minute response SLA for critical system trips (power failure, chiller shutdown, fire line depressurization, or major plumbing leaks), backed by financial slip-up penalties."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0F8B7D] selection:text-white">
      <MarketingHeader activePath="/managed-services" />

      {/* ═══ HERO SECTION — MODERN LIGHT THEME WITH DEDICATED PROPERTY DIRECTOR ═══ */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200 text-slate-900">
        {/* Soft background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Authoritative Copy & Scope Cards */}
            <div className="lg:col-span-7 max-w-2xl">
              
              {/* Clean Tagline Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-200 bg-white text-[#0F8B7D] text-xs font-extrabold uppercase tracking-wider mb-5 shadow-2xs">
                <Shield size={14} className="text-[#0F8B7D]" />
                <span>Turnkey Commercial Property Management &amp; Asset Stewardship</span>
              </div>

              {/* Confident Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
                Your Commercial Buildings, Managed by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F8B7D] via-teal-600 to-emerald-600">OfficeX</span>.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8">
                Institutional-grade on-ground Property &amp; Facility Management with certified MEP engineering, contractually enforced SLAs, open-book transparency, and dedicated Property Directors.
              </p>

              {/* 3 Executive Scope Cards (Clean Light Mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                      <Users size={15} className="text-[#0F8B7D]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">On-Ground IFM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">Certified MEP, HVAC, security &amp; housekeeping deployed on-site.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                      <ShieldCheck size={15} className="text-[#0F8B7D]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Guaranteed SLAs</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">Contractual 99.8% uptime backing with automated penalty clauses.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                      <FileCheck size={15} className="text-[#0F8B7D]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Monthly MIS</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">Institutional-grade financial audits delivered on the 5th of every month.</p>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={() => setSlideInOpen(true)}
                  className="px-7 py-3.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-sm rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  Schedule Building Audit <ArrowRight size={16} />
                </button>
                <Link
                  href="/operate"
                  className="px-7 py-3.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-bold text-sm rounded-xl bg-white hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-2"
                >
                  Explore Self-Managed CAFM
                </Link>
              </div>

              {/* Target Audience Strip */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-slate-700">Built for:</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">Commercial Building Owners</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">Institutional Landlords</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">Family Offices &amp; REITs</span>
              </div>

            </div>

            {/* Right Column: Dedicated Property Director Visual & Live Telemetry Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl relative group">
                <div className="relative h-80 w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/images/pro_property_manager.jpg"
                    alt="Dedicated Commercial Property Director"
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-black text-xs uppercase px-3 py-1 rounded-lg border border-teal-200 shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dedicated Property Director</span>
                  </div>
                </div>

                {/* Card Telemetry Widget */}
                <div className="p-5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase block">Asset Stewardship</span>
                      <h4 className="text-sm font-black text-slate-900">One Horizon Center &amp; Cyber Campus</h4>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      99.8% Uptime
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Compliance</span>
                      <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                        <ShieldCheck size={13} className="text-[#0F8B7D]" /> 100% Vaulted
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Billing Structure</span>
                      <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                        <CheckCircle2 size={13} className="text-[#0F8B7D]" /> 100% Open-Book
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ NATIVE SUTRA INSPIRED: INTERACTIVE TRANSFORMATION CAROUSEL / TICKER (LIGHT THEME) ═══ */}
      <section className="bg-teal-50/70 border-b border-teal-200/70 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left label */}
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#0F8B7D] uppercase tracking-wider shrink-0">
              <Sparkles size={16} className="text-[#0F8B7D] animate-pulse" />
              <span>The OfficeX Transformation:</span>
            </div>

            {/* Dynamic Active Statement with strike-through */}
            <div className="flex-1 text-center md:text-left transition-all duration-300">
              <p className="text-base sm:text-lg font-bold text-slate-900">
                {transformationStatements[activeStatement].before.split(transformationStatements[activeStatement].crossed)[0]}
                <span className="line-through decoration-rose-500 decoration-2 text-slate-400 font-normal px-1">
                  {transformationStatements[activeStatement].crossed}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#0F8B7D] text-white px-2.5 py-0.5 rounded-md font-extrabold text-sm sm:text-base ml-1.5 shadow-xs">
                  {transformationStatements[activeStatement].solution}
                </span>
                {transformationStatements[activeStatement].before.split(transformationStatements[activeStatement].crossed)[1]}
              </p>
              <p className="text-xs text-slate-600 mt-1 hidden sm:block font-medium">
                {transformationStatements[activeStatement].sub}
              </p>
            </div>

            {/* Statement Switcher Dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              {transformationStatements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStatement(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeStatement === idx ? "bg-[#0F8B7D] w-6" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`View statement ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══ NATIVE SUTRA INSPIRED: EXECUTIVE ABOUT & SERVICE PROVIDER SECTION ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
                Institutional Asset Stewardship
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 tracking-tight leading-tight">
                Top Commercial Property Management Service Provider
              </h2>
              <div className="mt-6 space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  OfficeX stands out as a comprehensive commercial property management and asset stewardship firm, ensuring maximum real estate investment performance and a completely stress-free experience for building owners, REITs, family offices, and developers.
                </p>
                <p>
                  Our seasoned directors oversee tenant selection, technical plant engineering, statutory compliance, and fiscal accounts with precision — upholding global regulatory standards and driving continuous occupant satisfaction.
                </p>
                <p>
                  Our strategic services not only safeguard but actively enhance capital asset valuation, driving higher occupancy and optimizing Net Operating Income (NOI), reflecting our absolute commitment to each client&apos;s long-term investment success.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => setSlideInOpen(true)}
                  className="px-6 py-3.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Schedule Portfolio Consultation <ArrowRight size={16} />
                </button>
                <a
                  href="#solutions"
                  className="px-6 py-3.5 border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  View Solutions We Offer <ChevronDown size={16} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
                <div className="relative h-[340px] w-full">
                  <Image
                    src="/images/work_manage_governance.jpg"
                    alt="Property Management and Governance in Action"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-[#071324]/30 to-transparent" />
                </div>
                <div className="p-6 bg-[#071324] text-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-r border-slate-800 pr-4">
                      <div className="text-2xl font-black text-teal-400">99.8%</div>
                      <div className="text-xs text-slate-400 mt-0.5">Critical MEP Plant Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-400">100%</div>
                      <div className="text-xs text-slate-400 mt-0.5">Statutory NOC Current</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>Pass-Through Accounting</span>
                    <span className="font-bold text-teal-300">Zero Hidden Markups</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ NATIVE SUTRA INSPIRED: "WHAT WE DO" (3 CORE PILLARS) ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-4 tracking-tight">
              What We Do
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              End-to-end commercial property stewardship built on dedicated account leadership, 360° asset management, and complete fiduciary transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {corePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] group-hover:scale-110 group-hover:bg-[#0F8B7D] group-hover:text-white transition-all">
                      <pillar.icon size={26} />
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Key Focus:</span>
                  <span className="text-xs font-bold text-[#0F8B7D]">{pillar.metrics}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ NATIVE SUTRA + CBRE INSPIRED: "SOLUTIONS WE OFFER" (9 CARDS) ═══ */}
      <section id="solutions" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Turnkey Portfolio Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-4 tracking-tight">
              Solutions We Offer
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              From building possession audits and turnkey architectural fit-outs to routine 52-week plant diagnostics, CAM monetization, and ESG compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol, idx) => (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/90 p-7 transition-all duration-300 hover:shadow-lg hover:border-teal-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0F8B7D] group-hover:bg-[#0F8B7D] group-hover:text-white transition-all shadow-xs">
                      <sol.icon size={22} />
                    </div>
                    <span className="text-lg font-black text-slate-300 group-hover:text-teal-600 transition-colors">
                      {sol.number}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    {sol.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-4">
                    {sol.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F8B7D]">{sol.highlight}</span>
                  <ArrowUpRight size={15} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Consultation Callout inside Solutions */}
          <div className="mt-12 p-6 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need a bespoke operational model for your building?</h4>
                <p className="text-xs text-slate-500">We construct customized SLAs based on asset grade, tenant covenants, and technical load profiles.</p>
              </div>
            </div>
            <button
              onClick={() => setSlideInOpen(true)}
              className="px-5 py-2.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Request Tailored SLA
            </button>
          </div>

        </div>
      </section>

      {/* ═══ NATIVE SUTRA INSPIRED: 9 CRITICAL CONTROLS BLUEPRINT (DARK EXECUTIVE BANNER) ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-[#071324] text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
                <FileText size={14} /> Executive Operational Blueprint
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                <span className="text-teal-400">9 Powerful Controls</span> You Must Enforce to Manage Commercial Real Estate Without Friction
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
                We manage premium commercial assets using these 9 institutional protocols — preventing premature capital depreciation, eliminating statutory non-compliance fines, and optimizing Net Operating Income.
              </p>

              <div className="mt-8">
                <button
                  onClick={() => setSlideInOpen(true)}
                  className="px-7 py-3.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} /> Request Operational Blueprint (PDF)
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#0A1829] p-6 rounded-2xl border border-slate-700/80 shadow-2xl">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-4 pb-3 border-b border-slate-800">
                  Institutional Governance Checklist
                </div>
                <ul className="space-y-2.5">
                  {ninePointers.map((pointer, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                        ✓
                      </span>
                      <span>{pointer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ WHY OFFICEX — PROBLEM / SOLUTION SPLIT ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Clear Contrast
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Why Choose OfficeX Managed Services?
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              How our integrated stewardship compares against traditional fragmented facility management contractors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without OfficeX */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-8">
              <h3 className="font-extrabold text-rose-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Eye size={16} />
                </span>
                Without OfficeX (Traditional Contractors)
              </h3>
              <ul className="space-y-4">
                {[
                  "Fragmented contractors cutting corners on MEP servicing and skilled staff",
                  "Opaque billing with hidden contractor markups and untraceable petty expenses",
                  "Unresolved tenant complaints leading to early lease churn and loss of rent",
                  "Constant owner headaches managing vendor disputes, staff attrition, and license renewals",
                  "Zero digital transparency — no verifiable proof preventive maintenance actually took place",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-rose-950/80">
                    <span className="w-5 h-5 rounded-full bg-rose-200/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-600 text-[10px] font-bold">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* With OfficeX */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-8">
              <h3 className="font-extrabold text-[#0F8B7D] text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#0F8B7D]">
                  <CheckCircle2 size={16} />
                </span>
                With OfficeX Managed Stewardship
              </h3>
              <ul className="space-y-4">
                {[
                  "Dedicated on-site Property Director coordinating certified MEP, security & soft teams",
                  "Contractual SLAs backed by automated financial penalty clauses for system lapses",
                  "100% open-book pass-through accounting with all original contractor bills provided",
                  "Cloud-vaulted statutory compliance with zero-notice liability protection",
                  "Live digital telemetry — every ticket, chiller reading, PPM checklist & rupee accounted for",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-teal-950/80">
                    <span className="w-5 h-5 rounded-full bg-teal-200/60 flex items-center justify-center shrink-0 mt-0.5 text-[#0F8B7D]">
                      <CheckCircle2 size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4-STEP 30-DAY ONBOARDING PROCESS ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Swift Mobilization
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Onboarding in 30 Days
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              From technical building audit to full operational go-live in under a month.
            </p>
          </div>

          <div className="relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-teal-200 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "01", title: "Building Audit", desc: "Senior engineers inspect MEP plants, structural assets, and compliance files.", duration: "Days 1–5" },
                { step: "02", title: "SLA Agreement", desc: "Finalize staffing models, maintenance scopes, response SLAs, and fee schedules.", duration: "Days 6–10" },
                { step: "03", title: "Staff Mobilization", desc: "Deploy certified technicians, tag physical assets, and transition shift operations.", duration: "Days 11–25" },
                { step: "04", title: "Digital Go-Live", desc: "Activate OfficeX CAFM, onboard tenant portals, and begin live management.", duration: "Day 30" },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg mb-4 shadow-md ${i === 3 ? "bg-[#0F8B7D] text-white" : "bg-white border-2 border-teal-200 text-[#0F8B7D]"}`}>
                    {t.step}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{t.desc}</p>
                  <span className="mt-3 text-[10px] font-bold text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">{t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NATIVE SUTRA INSPIRED: EXECUTIVE CLIENT TESTIMONIALS ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Client Voices
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              Trusted by commercial building owners, family offices, fund partners, and enterprise tenants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                      {t.tag}
                    </span>
                  </div>
                  <Quote size={28} className="text-teal-200/70 mb-2" />
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-200/60">
                  <div className="font-extrabold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING & FEE STRUCTURE ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Clear Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Transparent Pricing Models
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Tailored to building square footage, occupancy profile, and MEP plant complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Property Management",
                price: "3–5%",
                period: "of collections",
                features: [
                  "Dedicated on-site Property Director",
                  "Tenancy roll & lease administration",
                  "Statutory compliance renewals & vault",
                  "Automated CAM reconciliation",
                  "Monthly institutional MIS reporting"
                ],
                cta: "Get PM Proposal"
              },
              {
                name: "Integrated FM (IFM)",
                price: "Base + 10–15%",
                period: "manpower markup",
                highlight: true,
                features: [
                  "Certified MEP technicians & engineers",
                  "24/7 shift coverage for DG/Chillers",
                  "Soft services (housekeeping, security)",
                  "SLA-backed 99.8% uptime guarantee",
                  "OfficeX Operate CAFM included"
                ],
                cta: "Get IFM Proposal"
              },
              {
                name: "Full Turnkey Stewardship",
                price: "Custom",
                period: "PM + IFM + Leasing",
                features: [
                  "End-to-end property & facility stewardship",
                  "Tenant acquisition via OfficeX Marketplace",
                  "Guaranteed SLAs with financial penalty clauses",
                  "CapEx planning & 52-week health checks",
                  "ESG reporting & green certifications"
                ],
                cta: "Talk to Leadership"
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl p-7 flex flex-col justify-between transition-all ${
                  tier.highlight
                    ? "bg-white border-2 border-[#0F8B7D] text-slate-900 shadow-xl shadow-teal-900/10 scale-[1.02]"
                    : "bg-white border border-slate-200 text-slate-900 shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  {tier.highlight && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#0F8B7D] text-white px-3 py-1 rounded-full self-start mb-3 inline-block shadow-xs">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {tier.name}
                  </h3>
                  <div className="mt-3 mb-1">
                    <span className="text-2xl font-black text-slate-900">
                      {tier.price}
                    </span>
                    <span className="text-xs ml-1.5 text-slate-500">
                      {tier.period}
                    </span>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[13px] text-slate-600 font-medium">
                        <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-[#0F8B7D]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSlideInOpen(true)}
                  className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    tier.highlight
                      ? "bg-[#0F8B7D] text-white hover:bg-[#0D7A6E] shadow-md shadow-[#0F8B7D]/20"
                      : "bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NATIVE SUTRA + CBRE INSPIRED: COMPREHENSIVE FAQ SECTION ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Everything You Need to Know
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900 pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${activeFaq === i ? "rotate-180 text-teal-600" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA SECTION — SIGNATURE DARK THEME ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-[#071324] text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0F8B7D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-full mb-4 inline-block">
            Start With Complete Clarity
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-white">
            Ready for world-class, hassle-free property stewardship?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Schedule a physical building audit with our commercial engineering leadership today. No commitment, zero cost.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSlideInOpen(true)}
              className="px-8 py-3.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              Schedule Property Audit <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setSlideInOpen(true)}
              className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm rounded-xl backdrop-blur-sm hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone size={15} /> Talk to Our Team
            </button>
          </div>
        </div>
      </section>

      <EnquirySlideIn isOpen={slideInOpen} onClose={() => setSlideInOpen(false)} prefill={{ modules: ["managed-services"] }} />
      <Footer />
    </div>
  );
}

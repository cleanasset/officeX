"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2, ShieldCheck, FileCheck, CheckCircle2, TrendingUp, Users,
  Scale, Wrench, BarChart3, Leaf, ClipboardList, Phone, ArrowRight,
  ChevronDown, Star, Quote, Clock, Zap, Eye, Heart, Shield
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";

/* ─── Pain-point & Platform Prevention Slides ─── */
interface HeroSlide {
  id: string;
  tabLabel: string;
  prefix: string;
  pain: string;
  resolution: string;
  proof: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: "vendors",
    tabLabel: "Vendor Chaos",
    prefix: "Managing a building is",
    pain: "constant vendor chasing",
    resolution: "Zero Headache with Guaranteed SLAs",
    proof: "On-site engineers + QR checkpoints + contractually enforced SLA penalty credits prevent all vendor chaos."
  },
  {
    id: "compliance",
    tabLabel: "Compliance Risks",
    prefix: "Statutory compliance is",
    pain: "a fear of notices & fines",
    resolution: "100% Guaranteed Zero Notice Penalties",
    proof: "Automated 60-day renewal radar + dedicated municipal liaison engineers eliminate all statutory risks."
  },
  {
    id: "tenants",
    tabLabel: "Tenant Complaints",
    prefix: "Tenant maintenance is",
    pain: "slow & frustrating",
    resolution: "15-Min Response via QR Helpdesk",
    proof: "Instant QR ticketing directly routes to certified on-site technicians with strict 15-minute response SLAs."
  },
  {
    id: "billing",
    tabLabel: "Hidden Markups",
    prefix: "Operational billing is",
    pain: "opaque with markups",
    resolution: "100% Open-Book Pass-Through",
    proof: "Zero contractor markups. You pay direct actuals with an institutional monthly MIS audit by the 5th."
  }
];

export default function ManagedServicesPage() {
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setActiveSlide((p) => (p + 1) % heroSlides.length), 5500);
    return () => clearInterval(t);
  }, [isPaused]);

  const slide = heroSlides[activeSlide];

  const services = [
    { icon: Building2, title: "Turnkey Property Management", desc: "Complete operational stewardship — rent collection, tenant handover, fit-out oversight, and asset preservation across your entire portfolio.", color: "emerald" },
    { icon: Users, title: "Integrated Facility Management", desc: "Technical MEP operations (HVAC, DG, STP/WTP), soft services, 24/7 physical security, and landscape maintenance with certified on-ground teams.", color: "teal" },
    { icon: Scale, title: "Statutory Compliance Management", desc: "Fire Safety NOC, Lift licenses, DG permissions, RERA filings, and all municipal documentation managed by our legal liaison specialists.", color: "amber" },
    { icon: FileCheck, title: "Auto-Generated Monthly MIS", desc: "Institutional-grade financial and operational audit delivered by the 5th of every month — zero delays, zero manual work.", color: "blue" },
    { icon: Leaf, title: "Energy & Sustainability", desc: "Energy audits, BRSR/ESG compliance, water recycling optimization, and carbon footprint tracking for responsible building operations.", color: "green" },
    { icon: TrendingUp, title: "Revenue Optimization", desc: "Identify unbilled common areas, renegotiate vendor contracts, and introduce conservation measures to maximize your building NOI.", color: "purple" },
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600" },
    teal: { bg: "bg-teal-50", border: "border-teal-100", icon: "text-teal-600" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600" },
    green: { bg: "bg-green-50", border: "border-green-100", icon: "text-green-600" },
    purple: { bg: "bg-purple-50", border: "border-purple-100", icon: "text-purple-600" },
  };

  const timeline = [
    { step: "01", title: "Building Audit", desc: "Senior engineers inspect MEP plants, structural assets, and compliance files.", duration: "Days 1–5" },
    { step: "02", title: "Scope & SLA Agreement", desc: "Finalize staffing, maintenance scopes, response SLAs, and fee schedules.", duration: "Days 6–10" },
    { step: "03", title: "Staff Mobilization", desc: "Deploy certified technicians, tag assets, and transition shift operations.", duration: "Days 11–25" },
    { step: "04", title: "Digital Go-Live", desc: "Activate OfficeX CAFM, distribute tenant packs, and begin live management.", duration: "Day 30" },
  ];

  const testimonials = [
    { name: "Rajesh Mehta", role: "Building Owner, 150K sqft Commercial Tower, Gurgaon", quote: "OfficeX transformed our building operations. Tenant retention improved by 40%, compliance notices dropped to zero, and I finally stopped worrying about my property.", rating: 5 },
    { name: "Priya Kapoor", role: "VP Facilities, Fortune 500 Enterprise Tenant", quote: "The best facility management partner we have worked with. Their SLA adherence is outstanding and the monthly MIS reports are genuinely institutional quality.", rating: 5 },
    { name: "Arjun Bhatia", role: "Family Office, 5-Building Portfolio, Mumbai", quote: "Consolidated all our assets under OfficeX. Operating costs dropped 18% through bulk procurement while service quality actually improved.", rating: 5 },
  ];

  const faqs = [
    { q: "How does OfficeX differ from traditional FM vendors?", a: "Traditional FM companies only provide manpower without digital accountability. OfficeX combines on-ground engineering teams with proprietary CAFM software, contractually guaranteed SLAs, and 100% open-book financial transparency." },
    { q: "Can you retain our existing on-ground staff?", a: "Yes. Following technical evaluation and background verification, we absorb high-performing staff into the OfficeX roster with structured training and benefits." },
    { q: "What does open-book billing mean?", a: "You receive all original vendor invoices at actual pass-through cost without markups. Our management fee is fixed and completely transparent — no hidden charges." },
    { q: "What emergency response capabilities do you provide?", a: "24/7 technical on-call engineering desks in every metro region support on-site staff during critical incidents — electrical trips, chiller shutdowns, plumbing emergencies — within 60 minutes." },
    { q: "What is the minimum building size you manage?", a: "We typically manage commercial buildings of 50,000+ sq.ft. For smaller properties, we recommend our OfficeX Operate SaaS platform for self-managed digital operations." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <MarketingHeader activePath="/managed-services" />

      {/* ═══ HERO — Compact, Elegant NativeSutra-Inspired Hero ═══ */}
      <section 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background image with refined dark gradient */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/managed_services_hero.jpg" 
            alt="Building Management" 
            fill 
            priority 
            className="object-cover object-center" 
            sizes="100vw" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-12 sm:pt-9 sm:pb-14 lg:pt-10 lg:pb-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-sm text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Shield size={12} className="text-teal-400" />
              <span>Turnkey Managed Services &amp; Property Stewardship</span>
            </div>

            {/* Dynamic Headline with Refined Typography & Clean Single-Line Strikethrough */}
            <div className="min-h-[105px] sm:min-h-[95px] mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.25]">
                <span>{slide.prefix} </span>
                <span className="relative inline-block mx-1">
                  <span className="line-through text-white/40 decoration-rose-400 decoration-2 font-medium">
                    {slide.pain}
                  </span>
                </span>
                <br />
                <span className="text-teal-400 font-extrabold inline-flex items-center gap-2 mt-1">
                  <CheckCircle2 size={24} className="text-teal-400 shrink-0" />
                  {slide.resolution}
                </span>
              </h1>
            </div>

            {/* Clean Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl mb-5 leading-relaxed">
              Your buildings, our team, your rules. SLA-backed property stewardship and on-ground IFM with contractually guaranteed zero operational slip-ups.
            </p>

            {/* Compact Platform Guarantee Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-teal-500/30 backdrop-blur-md mb-6 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 shrink-0 font-bold text-teal-300">
                <ShieldCheck size={15} className="text-teal-400 shrink-0" />
                <span>OfficeX Platform Guarantee:</span>
              </div>
              <p className="text-slate-300 font-normal leading-normal">
                {slide.proof}
              </p>
            </div>

            {/* Sleek Pain-Point Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-7">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                Common Pain Points:
              </span>
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    i === activeSlide
                      ? "bg-[#0F8B7D] text-white shadow-sm"
                      : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {s.tabLabel}
                </button>
              ))}
            </div>

            {/* High-Converting CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <button
                onClick={() => setSlideInOpen(true)}
                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                Schedule Building Audit <ArrowRight size={15} />
              </button>
              <Link
                href="/operate"
                className="px-6 py-2.5 border border-white/20 hover:border-white/40 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                Explore Self-Managed SaaS
              </Link>
            </div>

            {/* Compact Key Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              {[
                { value: "99.8%", label: "On-Ground SLA" },
                { value: "18%", label: "Avg Cost Savings" },
                { value: "50+", label: "Buildings Managed" },
                { value: "24/7", label: "Emergency Desk" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-400">{s.value}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══ WHAT WE MANAGE — 6 service cards ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">End-to-End</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-4 tracking-tight">What We Manage</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">Turnkey on-ground property & facility operations integrated with our digital operating system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const c = colorMap[s.color];
              return (
                <div key={i} className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <s.icon size={22} className={c.icon} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ WHY OFFICEX — Problem/Solution split ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Why Choose OfficeX Managed Services?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without OfficeX */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8">
              <h3 className="font-extrabold text-red-700 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><Eye size={16} /></span>
                Without OfficeX
              </h3>
              <ul className="space-y-4">
                {[
                  "Unreliable FM contractors cutting corners on staff and MEP servicing",
                  "Opaque billing with hidden markups and untraceable petty cash",
                  "Unresolved tenant complaints leading to early lease terminations",
                  "Constant headaches with staff attrition and vendor defaults",
                  "Zero digital accountability — no proof maintenance happened",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-red-900/80">
                    <span className="w-5 h-5 rounded-full bg-red-200/60 flex items-center justify-center shrink-0 mt-0.5 text-red-500 text-[10px] font-bold">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* With OfficeX */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8">
              <h3 className="font-extrabold text-emerald-700 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16} /></span>
                With OfficeX
              </h3>
              <ul className="space-y-4">
                {[
                  "Certified on-ground engineering, housekeeping & security teams",
                  "Contractual SLAs with automatic financial penalties for lapses",
                  "100% open-book pass-through accounting, zero hidden markups",
                  "Dedicated Property Manager for daily ops, compliance & tenant relations",
                  "Live digital visibility — every checklist, ticket & expense recorded",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-emerald-900/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600"><CheckCircle2 size={11} /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — 4-step onboarding ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Onboarding in 30 Days</h2>
            <p className="text-slate-500 text-sm mt-3">From building audit to full operational go-live in under a month.</p>
          </div>
          <div className="relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-emerald-200 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {timeline.map((t, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg mb-4 shadow-md ${i === 3 ? "bg-emerald-600 text-white" : "bg-white border-2 border-emerald-200 text-emerald-700"}`}>
                    {t.step}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{t.desc}</p>
                  <span className="mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">{t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 relative">
                <Quote size={28} className="text-emerald-100 absolute top-5 right-5" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Transparent Pricing</h2>
            <p className="text-slate-500 text-sm mt-3">Fee models tailored to building size, occupancy profile, and technical complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Property Management", price: "3–5%", period: "of collections", features: ["Dedicated on-site Property Manager", "Rent roll & tenant management", "Statutory compliance renewals", "CAM reconciliation", "Monthly MIS reporting"], cta: "Get PM Proposal" },
              { name: "Integrated FM (IFM)", price: "Base + 10–15%", period: "manpower markup", highlight: true, features: ["Certified MEP technicians & engineers", "24/7 shift coverage & DG/HVAC maintenance", "Soft services (cleaning, security, waste)", "SLA-backed equipment uptime guarantee", "OfficeX Operate CAFM included"], cta: "Get IFM Proposal" },
              { name: "Full Turnkey Package", price: "Custom", period: "PM + IFM + Leasing", features: ["End-to-end property & IFM stewardship", "Leasing representation via Marketplace", "Guaranteed SLAs with penalty clauses", "CapEx planning & energy audit", "ESG reporting & certifications"], cta: "Talk to Sales" },
            ].map((tier, i) => (
              <div key={i} className={`rounded-2xl p-7 flex flex-col ${tier.highlight ? "bg-emerald-600 text-white ring-2 ring-emerald-600 shadow-xl scale-[1.02]" : "bg-white border border-slate-200 shadow-xs"}`}>
                {tier.highlight && <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full self-start mb-3">Most Popular</span>}
                <h3 className={`font-extrabold text-lg ${tier.highlight ? "text-white" : "text-slate-900"}`}>{tier.name}</h3>
                <div className="mt-3 mb-1">
                  <span className={`text-2xl font-black ${tier.highlight ? "text-white" : "text-slate-900"}`}>{tier.price}</span>
                  <span className={`text-xs ml-1.5 ${tier.highlight ? "text-emerald-100" : "text-slate-500"}`}>{tier.period}</span>
                </div>
                <ul className="mt-5 space-y-3 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-[13px] ${tier.highlight ? "text-emerald-50" : "text-slate-600"}`}>
                      <CheckCircle2 size={14} className={`shrink-0 mt-0.5 ${tier.highlight ? "text-emerald-200" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSlideInOpen(true)}
                  className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${tier.highlight ? "bg-white text-emerald-700 hover:bg-emerald-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900 pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 px-4 sm:px-8 bg-[#071324] text-white relative overflow-hidden border-t border-slate-800">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0F8B7D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-white">
            Ready for world-class, hassle-free property management?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Schedule a physical building audit with our commercial engineering team today. No commitment, no cost.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSlideInOpen(true)}
              className="px-8 py-3.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              Schedule Property Audit <ArrowRight size={16} />
            </button>
            <a 
              href="tel:+919999999999" 
              className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm rounded-xl backdrop-blur-sm hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Phone size={15} /> Talk to Our Team
            </a>
          </div>
        </div>
      </section>

      <EnquirySlideIn isOpen={slideInOpen} onClose={() => setSlideInOpen(false)} prefill={{ modules: ["managed-services"] }} />
      <Footer />
    </div>
  );
}

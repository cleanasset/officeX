"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
  Building2,
  Clock,
  Wrench,
  Layers,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import HeroSection from "@/components/marketing/HeroSection";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import EnquiryForm from "@/components/marketing/EnquiryForm";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>("Commercial Property Portfolio");

  const openAudienceEnquiry = (audienceName: string) => {
    setSelectedAudience(audienceName);
    setSlideInOpen(true);
  };

  const pricingFaqs = [
    {
      q: "When will public pricing be officially revealed?",
      a: "Public subscription tiers are scheduled to launch following our closed enterprise beta rollout. In the meantime, custom commercial terms tailored to your square footage and operational scope are actively available upon request."
    },
    {
      q: "Can I get a custom commercial proposal today?",
      a: "Yes. Our enterprise advisory team provides comprehensive, confidential commercial proposals within 24 business hours based on your leasable area, number of assets, and required software modules."
    },
    {
      q: "What advantages do early charter partners receive?",
      a: "Early partners receive grandfathered launch-tier pricing for up to 3 years, prioritized feature onboarding, dedicated account directors, and waived initial asset ingestion fees."
    },
    {
      q: "How does escrow pricing work in the Marketplace?",
      a: "For all procurement and contractor work orders executed through OfficeX Marketplace, milestone-based funds are held in a secure, audited escrow account and released only upon explicit digital completion sign-off."
    },
    {
      q: "Are pilot trials available for commercial office towers?",
      a: "Yes. We offer qualified Grade-A commercial properties a 30-day guided pilot encompassing visitor speed-gate management, automated rent roll generation, and compliance radar tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/pricing" />

      {/* Hero */}
      <HeroSection
        badge="OFFICIAL PRICING ANNOUNCEMENT"
        headline="Commercial Plans & Pricing — Coming Soon"
        subheadline="We are currently curating tailored pricing structures for commercial property portfolios, occupiers, and FM contractors. In the interim, bespoke commercial proposals and early pilot access are available on request."
        primaryCta={{ label: "Request Custom Proposal", href: "#custom-quote" }}
        secondaryCta={{ label: "Schedule a Call", onClick: () => setSlideInOpen(true) }}
        bgImage="/images/work_pricing_agreement.jpg"
        visualMetrics={[
          { label: "Custom Proposals", value: "Available Now" },
          { label: "Charter Privileges", value: "Active" },
          { label: "Public Rates", value: "Coming Soon" }
        ]}
      />

      {/* Coming Soon Announcement & Early Partner Cards */}
      <section className="py-16 md:py-24 bg-[#F8FAFC] border-t border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              PRICING UNDER WRAP
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Tailored Commercials Built Around Your Scale
            </h2>
            <p className="text-slate-600 font-medium text-xs sm:text-sm md:text-base mt-3 leading-relaxed">
              Commercial real estate operations require precision economics, not one-size-fits-all pricing. Select your stakeholder category below to request a tailored commercial proposal.
            </p>
          </div>

          {/* 3 Stakeholder Proposal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Card 1: Property Owners & Asset Managers */}
            <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] mb-4">
                  <Building2 size={20} />
                </div>
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full mb-2">
                  Owners &amp; Landlords
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  Asset &amp; Portfolio Management
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Per-sq.ft. subscription scaled to your gross leasable area, covering rent roll, CAM billing, and compliance vault.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">Bespoke / Sq.Ft.</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Discounts for multi-tower portfolios</div>
                </div>
                
                <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Automated rent roll &amp; utility CAM allocations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Statutory compliance tracker (40+ municipal NOCs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Razorpay split online collection engine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Dedicated Property Director onboarding support</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openAudienceEnquiry("Commercial Property Owners & Asset Managers")}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs mt-8 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Request Owner Proposal</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Facility Managers & Corporate Occupiers */}
            <div className="rounded-3xl p-6 sm:p-8 border-2 border-[#0F8B7D] bg-white flex flex-col justify-between relative shadow-xl scale-100 lg:scale-105 hover:shadow-2xl transition-all">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-[#0F8B7D] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                HIGH DEMAND
              </span>
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D] mb-4">
                  <Layers size={20} />
                </div>
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full mb-2">
                  Facility Managers &amp; Teams
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  Operate CAFM &amp; Maintenance
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Unified work-order tracking, 52-week automated PPM schedule, and touchless visitor management.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
                  <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Pricing Model</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">Flexible Pilot + Monthly</div>
                  <div className="text-[11px] text-teal-800 mt-0.5">30-day pilot on qualified properties</div>
                </div>
                
                <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Full CAFM with asset QR code registry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>52-week PPM scheduling with automated engineer alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Optical speed-gate turnstile access integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Tenant helpdesk ticketing &amp; meeting room booking</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 mt-8">
                <button 
                  onClick={() => openAudienceEnquiry("Facility Operations & CAFM Teams")}
                  className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Request Operator Pilot</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 3: FM Contractors & Service Providers */}
            <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] mb-4">
                  <Wrench size={20} />
                </div>
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full mb-2">
                  FM Vendors &amp; Subcontractors
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  Contractor Partner Network
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Marketplace directory presence, direct client RFQ lead routing, and milestone-backed escrow payout guarantees.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">Charter Partner Tier</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zero listing fee during launch phase</div>
                </div>
                
                <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Verified trade trust badge &amp; compliance check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Access to high-value commercial RFP tender board</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Guaranteed milestone escrow payout protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Multi-city corporate vendor listing privileges</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openAudienceEnquiry("FM Contractors & Service Providers")}
                className="w-full py-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 font-bold text-xs mt-8 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
              >
                <span>Join Partner Waitlist</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Charter Partner Privileges Strip */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">Privilege 01</span>
                <h4 className="text-sm font-bold text-slate-900">Grandfathered Rates</h4>
                <p className="text-xs text-slate-500">Locked-in launch terms for multi-year stability.</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">Privilege 02</span>
                <h4 className="text-sm font-bold text-slate-900">Zero Ingestion Fee</h4>
                <p className="text-xs text-slate-500">Free digital migration of existing rent rolls &amp; CAD files.</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">Privilege 03</span>
                <h4 className="text-sm font-bold text-slate-900">Dedicated Account Team</h4>
                <p className="text-xs text-slate-500">Direct Slack/WhatsApp hotline with solutions engineers.</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">Privilege 04</span>
                <h4 className="text-sm font-bold text-slate-900">100% Escrow Security</h4>
                <p className="text-xs text-slate-500">Audited milestone protection for vendor work orders.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing FAQs */}
      <FAQAccordion
        title="Frequently Asked Commercial Questions"
        subtitle="Common questions regarding proposal turnarounds, charter partner benefits, and escrow operations."
        faqs={pricingFaqs}
      />

      {/* Inline Enquiry Section */}
      <section id="custom-quote" className="py-16 md:py-24 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 text-slate-900 border-t border-slate-200 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              CUSTOM PROPOSALS &amp; ENQUIRIES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-3 text-slate-900">
              Request Your Custom Commercial Proposal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Our enterprise solutions team responds within 24 business hours with detailed scoping and commercials.
            </p>
          </div>
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
            <EnquiryForm />
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
      />
    </div>
  );
}

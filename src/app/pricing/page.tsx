"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Sparkles, HelpCircle, ShieldCheck, Lock } from "lucide-react";
import HeroSection from "@/components/marketing/HeroSection";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import EnquiryForm from "@/components/marketing/EnquiryForm";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [pricingView, setPricingView] = useState<"tiers" | "matrix">("tiers");

  const pricingFaqs = [
    {
      q: "Can I upgrade or downgrade my tier at any time?",
      a: "Yes. You can upgrade immediately to access advanced modules like automated rent roll, CAM billing, and compliance radar. If downgrading, your existing data remains securely archived in accordance with statutory requirements."
    },
    {
      q: "How does escrow pricing work in the Marketplace?",
      a: "For all procurement and contractor work orders executed through OfficeX Marketplace, milestone-based funds are held in a secure Razorpay Escrow account and released only upon your explicit digital sign-off."
    },
    {
      q: "Is there a long-term lock-in?",
      a: "Standard subscriptions run on flexible annual or multi-year terms tailored to commercial real estate budget cycles. Starter plans are available with monthly billing options."
    },
    {
      q: "Are statutory compliance reports audit-ready?",
      a: "Yes. All Fire, HVAC, Lift, ESG, and DPDP Act 2023 reports generated from OfficeX include cryptographically verified timestamps, engineer sign-offs, and complete audit trail logs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/pricing" />

      {/* Hero */}
      <HeroSection
        badge="TRANSPARENT ENTERPRISE PRICING"
        headline="Simple, Predictable Plans for Every CRE Portfolio"
        subheadline="From single properties to pan-India multi-region assets. Choose between flexible plan cards or explore the full module-by-module capability matrix."
        primaryCta={{ label: "Start Free", href: "/signup" }}
        secondaryCta={{ label: "Book a Demo", href: "/demo" }}
        visualMetrics={[
          { label: "Transparent Tiers", value: "3 Plans" },
          { label: "Escrow Protection", value: "100%" },
          { label: "Data Residency", value: "India Only" }
        ]}
      />

      {/* Main Pricing & Matrix Section */}
      <section className="py-16 md:py-24 bg-[#F8FAFC] border-t border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              PLAN COMPARISON
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Plans &amp; Feature Capabilities
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-2 md:mt-3">
              Switch between card overview and detailed module capability matrix anytime.
            </p>

            {/* View Mode Switcher */}
            <div className="mt-6 inline-flex items-center p-1 rounded-full bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setPricingView("tiers")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  pricingView === "tiers"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Plan Overview
              </button>
              <button
                type="button"
                onClick={() => setPricingView("matrix")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  pricingView === "matrix"
                    ? "bg-white text-[#0F8B7D] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Module &amp; Capability Matrix
              </button>
            </div>
          </div>

          {pricingView === "tiers" ? (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
                {/* Plan 1: Starter */}
                <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Starter</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">For single-site offices up to 10k sqft.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">Free</div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Access to Marketplace</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Basic Helpdesk</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Up to 3 Users</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full py-3.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </div>

                {/* Plan 2: Professional */}
                <div className="rounded-3xl p-6 sm:p-8 border-2 border-[#0F8B7D] bg-white flex flex-col justify-between relative shadow-xl scale-100 lg:scale-105">
                  <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#0F8B7D] text-white text-[9px] font-black uppercase tracking-widest shadow-md">MOST POPULAR</span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Professional</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">For growing multi-site portfolios.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">₹4,999<span className="text-xs font-semibold text-slate-400">/mo</span></div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Escrow Payments</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> PPM Calendar</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Compliance Tracker</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Unlimited Users</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 mt-8">
                    <button 
                      onClick={() => router.push('/demo?plan=professional')}
                      className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => router.push('/demo')}
                      className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Book a Demo
                    </button>
                  </div>
                </div>

                {/* Plan 3: Enterprise */}
                <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Enterprise</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">Custom deployment for large institutions.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">Custom</div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> White-labeling</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> ERP Integrations</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Dedicated Success Mgr</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setSlideInOpen(true)}
                    className="w-full py-3.5 rounded-xl bg-[#071324] hover:bg-slate-800 text-white font-bold text-xs mt-8 transition-colors cursor-pointer shadow-sm"
                  >
                    Talk to Sales
                  </button>
                </div>
              </div>

              {/* Hook to Capability Matrix view */}
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setPricingView("matrix")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:text-[#0F8B7D] hover:border-teal-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Compare detailed module access across Starter, Professional &amp; Enterprise</span>
                  <ArrowRight size={14} className="text-[#0F8B7D]" />
                </button>
              </div>
            </div>
          ) : (
            /* Module Access Matrix View */
            <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Detailed Plan Capability &amp; Module Access
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare features and modules included across Starter, Professional, and Enterprise.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPricingView("tiers")}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Back to Plan Cards
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        Feature / Module
                      </th>
                      <th className="pb-4 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">Starter</div>
                        <div className="text-slate-500 font-semibold text-xs mt-0.5">Free</div>
                      </th>
                      <th className="pb-4 text-center bg-teal-50/70 rounded-t-xl px-3">
                        <div className="font-extrabold text-[#0F8B7D] text-sm">Professional</div>
                        <div className="text-teal-700 font-semibold text-xs mt-0.5">₹4,999/mo</div>
                      </th>
                      <th className="pb-4 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">Enterprise</div>
                        <div className="text-slate-500 font-semibold text-xs mt-0.5">Custom</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Marketplace: Space &amp; Vendor Discovery</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Marketplace: RFQ &amp; Escrow Milestone Payouts</td>
                      <td className="py-3.5 text-center text-slate-400">2 RFQs/mo</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Unlimited</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Unlimited + Volume Rates</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Operate: CAFM &amp; 52-Week PPM Automation</td>
                      <td className="py-3.5 text-center text-slate-400">Basic</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Full Suite</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Full + IoT &amp; BMS Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Manage: Automated Rent Roll &amp; CAM Billing</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓ (Razorpay)</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓ + Multi-Entity SPVs</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Manage: 90/60/30 Compliance Radar</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓ (40+ Statutory NOCs)</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓ + On-Ground Liaison</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Intelligence: Portfolio NOI &amp; ESG Reports</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Standard MIS</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">SEBI BRSR + Custom Data Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Managed Services: On-Ground Technical Teams</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-slate-400 bg-teal-50/40">Available as Add-on</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Full Turnkey Deployment</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Enterprise SLA &amp; Dedicated Account Manager</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-slate-400 bg-teal-50/40">Standard Support</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Contractually Backed 99.9%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td className="pt-5 font-bold text-slate-400">Action</td>
                      <td className="pt-5 text-center">
                        <button
                          type="button"
                          onClick={() => router.push("/signup")}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Sign Up Free
                        </button>
                      </td>
                      <td className="pt-5 text-center bg-teal-50/40 rounded-b-xl px-3">
                        <button
                          type="button"
                          onClick={() => router.push("/demo?plan=professional")}
                          className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                        >
                          Get Started
                        </button>
                      </td>
                      <td className="pt-5 text-center">
                        <button
                          type="button"
                          onClick={() => setSlideInOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#071324] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Talk to Sales
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing FAQs */}
      <FAQAccordion
        title="Frequently Asked Pricing Questions"
        subtitle="Common questions regarding billing cycles, escrow protections, and tier upgrades."
        faqs={pricingFaqs}
      />

      {/* Inline Enquiry Section */}
      <section className="py-16 md:py-24 bg-[#071324] text-white px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
              CUSTOM PRICING &amp; ENQUIRIES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-3">
              Need a Custom Multi-City Enterprise Quote?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Our enterprise solutions team responds within 24 business hours with detailed scoping.
            </p>
          </div>
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl">
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

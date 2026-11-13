"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Layers,
  Users,
  Wrench,
  FileCheck2,
  Lock,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import OperatePricingSection from "@/components/operate/OperatePricingSection";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function OperateComprehensivePricingPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const COMPARISON_SECTIONS = [
    {
      title: "1. Rent Roll & Lease Administration",
      items: [
        { feature: "39-Point Canonical Lease Contract Master", essentials: true, pro: true, enterprise: true },
        { feature: "Live Rent Roll Register with As-Of Snapshot", essentials: true, pro: true, enterprise: true },
        { feature: "Automated 5% Annual Escalation Tracking & Alerts", essentials: true, pro: true, enterprise: true },
        { feature: "Automated CAM Common Area Expense Pooling", essentials: false, pro: true, enterprise: true },
        { feature: "Direct Razorpay Nodal Escrow & Bank Splits", essentials: false, pro: true, enterprise: true },
        { feature: "Section 106 Statutory Legal Default Notices", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      title: "2. 52-Week PPM & Maintenance CAFM",
      items: [
        { feature: "52-Week Annual Preventive Maintenance Schedule", essentials: true, pro: true, enterprise: true },
        { feature: "QR Equipment Passports for DG, HVAC & STP", essentials: true, pro: true, enterprise: true },
        { feature: "Vendor AMC Renewal & Geotagged Service Checklists", essentials: true, pro: true, enterprise: true },
        { feature: "Breakdown Work Orders & Mean-Time-To-Repair (MTTR)", essentials: false, pro: true, enterprise: true },
        { feature: "Direct FM Marketplace Vendor Dispatch", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      title: "3. Visitor Flow & Lobby Turnstiles",
      items: [
        { feature: "Pre-invite WhatsApp Barcode Visitor Passes", essentials: true, pro: true, enterprise: true },
        { feature: "18-Second Lobby Turnstile Transit", essentials: true, pro: true, enterprise: true },
        { feature: "Boon Edam & Gunnebo Hardware Controller Relay", essentials: false, pro: true, enterprise: true },
        { feature: "Real-time Overstay & Emergency Evacuation Roster", essentials: false, pro: true, enterprise: true },
        { feature: "Dual-Mode VC Security Guard Console", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      title: "4. Statutory Compliance & Audit Vault",
      items: [
        { feature: "48 Pre-configured Commercial Licenses Ingestion", essentials: true, pro: true, enterprise: true },
        { feature: "90, 60 & 30-Day Automated Alert Escalations", essentials: true, pro: true, enterprise: true },
        { feature: "Tamper-proof Auditor Certificate Vault", essentials: true, pro: true, enterprise: true },
        { feature: "Multi-Entity REIT Disclosure Reports", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      title: "5. Commercial Lease CRM & Helpdesk",
      items: [
        { feature: "Interactive Spatial Stacking Plan", essentials: true, pro: true, enterprise: true },
        { feature: "Instant LOI Term Sheet Generator", essentials: true, pro: true, enterprise: true },
        { feature: "Tenant 10-Second QR Work Order Capture", essentials: true, pro: true, enterprise: true },
        { feature: "Meeting Room & Amenity Reservation System", essentials: true, pro: true, enterprise: true },
        { feature: "Custom ERP / SAP & Accounting Connector", essentials: false, pro: false, enterprise: true },
        { feature: "Dedicated 24/7 Account Solutions Engineer", essentials: false, pro: false, enterprise: true },
      ],
    },
  ];

  const FAQS = [
    {
      q: "Can I purchase just one SaaS module, or do I have to buy the full CAFM Suite?",
      a: "You have complete freedom! If you only need our Automated Rent Roll, 52-Week PPM, or Visitor Flow, you can subscribe to any individual module a-la-carte. If you want the complete institutional platform, the bundled CAFM Suite provides all 6 modules at an average 45% discount.",
    },
    {
      q: "How does the square footage pricing work?",
      a: "Our pricing is transparent and calculated on a ₹ / sq.ft / month basis. You can use the interactive slider on this page to input your commercial super built-up area (e.g. 25,000, 50,000, or 250,000 sq.ft). Every plan automatically displays both your effective rate per sq.ft (e.g. ₹0.80/sq.ft/mo) and your total monthly fee, with no hidden surprises.",
    },
    {
      q: "How fast is onboarding and data migration?",
      a: "Self-serve onboarding takes under 48 hours with our automated Excel/CSV ingestion wizard. For Pro and Enterprise suites, our dedicated operations team assists with lease document OCR, turnstile relay calibration, and initial equipment asset tagging in 5 to 7 business days.",
    },
    {
      q: "What payment modes are supported on Razorpay?",
      a: "We support corporate credit cards, net banking across 58 Indian banks, UPI, and NEFT/RTGS. Every subscription triggers an automated GST tax invoice with 18% SAC 997212 input tax credit documentation.",
    },
    {
      q: "Can we upgrade from individual modules to the full CAFM Suite later?",
      a: "Yes, seamlessly. Any credits or remaining time from your standalone module subscription are prorated and applied toward your upgrade to the CAFM Suite.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      <MarketingHeader activePath="/operate/pricing" />

      {/* Hero Header */}
      <section className="pt-16 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-[#0D7B6C] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#0D7B6C]" />
          OFFICEX OPERATE PRICING MATRIX
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-4">
          Flexible Pricing for Independent Towers and Institutional Portfolios
        </h1>
        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Choose the all-in-one <strong>CAFM Operations Suite</strong> or activate individual SaaS modules on-demand. Powered by instant online Razorpay activation.
        </p>
      </section>

      {/* Main Interactive Pricing Section (Toggle + Area Estimator + Live Cards) */}
      <OperatePricingSection hideHeader={true} />

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0D7B6C] mb-2">
            DETAILED SPECIFICATION MATRIX
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Compare CAFM Suite Tiers Feature-by-Feature
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Built to institutional specifications for commercial developers, REITs, and corporate facility teams.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-4 sm:p-5 font-black text-sm text-slate-900 w-2/5">Capabilities &amp; Modules</th>
                <th className="p-4 sm:p-5 font-black text-center w-1/5">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Single Tower</div>
                  <div className="text-sm font-black text-slate-900">Essentials</div>
                </th>
                <th className="p-4 sm:p-5 font-black text-center w-1/5 bg-teal-50/60 border-x border-teal-200/80">
                  <div className="text-xs text-[#0D7B6C] uppercase font-bold">Recommended</div>
                  <div className="text-sm font-black text-[#0D7B6C]">CAFM Pro</div>
                </th>
                <th className="p-4 sm:p-5 font-black text-center w-1/5">
                  <div className="text-xs text-indigo-500 uppercase font-semibold">REIT Portfolio</div>
                  <div className="text-sm font-black text-indigo-950">Enterprise IWMS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_SECTIONS.map((sec, secIdx) => (
                <React.Fragment key={secIdx}>
                  <tr className="bg-slate-100/70">
                    <td colSpan={4} className="p-3 px-5 font-black text-[11px] uppercase tracking-wider text-slate-700">
                      {sec.title}
                    </td>
                  </tr>
                  {sec.items.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-5 font-medium text-slate-800">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.essentials ? (
                          <Check className="w-4 h-4 text-[#0D7B6C] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center bg-teal-50/30 border-x border-teal-100">
                        {row.pro ? (
                          <Check className="w-4 h-4 text-[#0D7B6C] font-bold mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.enterprise ? (
                          <Check className="w-4 h-4 text-indigo-600 font-bold mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#0D7B6C]" />
            PRICING &amp; COMMERCIAL FAQS
          </div>
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0D7B6C] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-3 ${
                    activeFaq === i ? "rotate-180 text-[#0D7B6C]" : ""
                  }`}
                />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Bottom Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0A4D43] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-teal-300 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              PORTFOLIO CUSTOMIZATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Need a Custom Multi-City Enterprise Contract?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              For commercial developers and REITs managing 500,000+ sq.ft across multiple cities, we offer dedicated instances, custom ERP integration, and customized SLAs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setEnquiryOpen(true)}
                className="px-6 py-3 bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Request Custom Enterprise Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/operate"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all"
              >
                Explore Operating Modules
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["CAFM Suite Enterprise"] }}
      />

      <Footer />
    </div>
  );
}


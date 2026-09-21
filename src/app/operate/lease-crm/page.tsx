"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Kanban,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Users,
  PieChart,
  DollarSign
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function LeaseCrmProductPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sampleDeals = [
    {
      tenant: "Barclays Technology Center",
      space: "Tower A · Floors 7-9 (72,000 Sq.Ft.)",
      value: "₹1.88 Cr / mo",
      stage: "LOI Executed",
      stageColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      broker: "JLL India (45d Comm)",
      closeDate: "Target Handover: Nov 2026"
    },
    {
      tenant: "Swiggy Corporate HQ",
      space: "Tower B · Floor 4 (24,500 Sq.Ft.)",
      value: "₹63.70 Lakh / mo",
      stage: "Term Sheet Issued",
      stageColor: "text-teal-700 bg-teal-50 border-teal-200",
      broker: "CBRE Commercial",
      closeDate: "Tour Completed · Fitout Review"
    },
    {
      tenant: "Khimji Ramdas Global",
      space: "Tower A · Suite 302 (12,000 Sq.Ft.)",
      value: "₹31.20 Lakh / mo",
      stage: "Site Inspection Scheduled",
      stageColor: "text-amber-800 bg-amber-50 border-amber-200",
      broker: "Cushman & Wakefield",
      closeDate: "Tour on Friday 3:00 PM"
    },
    {
      tenant: "Zerodha Tech R&D",
      space: "Tower C · Floor 11 (18,000 Sq.Ft.)",
      value: "₹46.80 Lakh / mo",
      stage: "Qualified Lead",
      stageColor: "text-slate-700 bg-slate-100 border-slate-200",
      broker: "Direct Inbound Lead",
      closeDate: "RFP Evaluation Phase"
    }
  ];

  const features = [
    {
      icon: Layers,
      title: "Interactive Floorplate Stacking",
      desc: "Visualize occupied vs rentable floorplates, demised units, tenant lease expiry cadences, and contiguous space expansion opportunities in real time."
    },
    {
      icon: Kanban,
      title: "Deal Velocity Pipeline",
      desc: "Track leasing inquiries across standard institutional stages: Inquiry → Site Tour → Proposal → Commercial Term Sheet → Executed LOI → Handover."
    },
    {
      icon: FileText,
      title: "Automated Commercial LOI Generator",
      desc: "Generate standardized Letter of Intent (LOI) documents with pre-configured step-up escalations, lock-in clauses, fit-out rent-free periods, and security deposits."
    },
    {
      icon: DollarSign,
      title: "Broker Commission Settlement Desk",
      desc: "Track external IPC and regional broker mandates with guaranteed 45-day milestone commission escrow settlements to motivate top leasing channel partners."
    }
  ];

  const faqs = [
    {
      q: "Can we configure custom demised suites on a floorplate?",
      a: "Yes. OfficeX allows landlords to dynamically demise a floorplate into flexible team suites or merge adjacent units, automatically recalculating common area load factors and chargeable square footage."
    },
    {
      q: "How does the broker commission settlement work?",
      a: "When a commercial deal is marked as executed, the platform calculates broker payouts according to pre-agreed commission percentages, verifies invoice GSTINs, and routes funds within 45 days through nodal escrow."
    },
    {
      q: "Does this sync with our existing listings on property portals?",
      a: "Yes. Vacant spaces can be pushed directly to the OfficeX Commercial Discovery Marketplace with verified photos, floorplans, and lease terms with a single toggle."
    },
    {
      q: "Can our legal and leasing teams collaborate on lease term negotiations?",
      a: "Yes. Role-based access allows leasing executives to input commercial terms while legal teams approve non-standard clauses and deviation checklists with full redlining history."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      <MarketingHeader activePath="/operate" />

      {/* ── Breadcrumb Bar ── */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/operate" className="hover:text-slate-900 transition-colors">
            SaaS Platform
          </Link>
          <span>/</span>
          <span className="text-[#0D7B6C] font-bold">Commercial Lease Dealflow CRM</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Clean, Daylight White
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
                <Kanban size={15} className="text-[#0D7B6C]" />
                <span>OFFICEX · LEASE DEALFLOW CRM</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                Commercial Lease Dealflow &amp;{" "}
                <span className="text-[#0D7B6C]">
                  Stacking CRM
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Accelerate commercial space absorption. Manage pipeline deal velocity from tour booking to digital LOI execution, floor demising, and broker commission settlements.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Enquire for Lease CRM</span>
                  <ArrowRight size={15} />
                </button>
                <Link
                  href="/leasing/pipeline"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Explore Live Pipeline Demo</span>
                  <ArrowUpRight size={14} className="text-[#0D7B6C]" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                <span className="flex items-center gap-1.5"><Layers size={15} className="text-[#0D7B6C]" /> Dynamic Stacking</span>
                <span className="flex items-center gap-1.5"><FileText size={15} className="text-[#0D7B6C]" /> Digital LOIs</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> 45d Broker Escrow</span>
              </div>

            </div>

            {/* Right Column (6 cols) — Clean Daylight Window */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 text-slate-900 relative">
                
                <div className="flex items-center justify-between border-b border-slate-200/80 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 px-5 py-3 sm:px-6 rounded-t-3xl bg-slate-50 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[11px] text-slate-500 ml-2">
                      app.officex.in/leasing/deal-velocity
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                    DEAL VELOCITY ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {sampleDeals.map((deal, idx) => (
                    <div key={idx} className="bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5 text-xs shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{deal.tenant}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-[#0D7B6C] border border-slate-200 font-bold">
                              {deal.value}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{deal.space}</span>
                        </div>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${deal.stageColor}`}>
                          {deal.stage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100 font-medium">
                        <span className="text-slate-700 font-semibold">{deal.broker}</span>
                        <span className="text-slate-500 text-[10px]">{deal.closeDate}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Pipeline: 14 Active Transactions
                  </span>
                  <Link href="/leasing/pipeline" className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1">
                    <span>Open Pipeline CRM</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. FEATURE DEEP DIVE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              COMMERCIAL DEAL ACCELERATION
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Accelerate Inquiries from Inspection to Executed Digital Lease
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

      {/* ═══════════════════════════════════════════════════════════════
          3. FAQS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Common Questions About Commercial Lease CRM
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

      {/* ═══════════════════════════════════════════════════════════════
          4. BOTTOM CTA BAND
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Accelerate Your Commercial Space Absorption Today
          </h2>
          <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
            Eliminate friction between brokers, landlords, and tenants. Schedule a personalized walkthrough of the Commercial Lease CRM today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Request Lease CRM Walkthrough
            </button>
            <Link
              href="/leasing/pipeline"
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all"
            >
              Explore Live Pipeline Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Commercial Lease Dealflow CRM"] }}
      />
    </div>
  );
}

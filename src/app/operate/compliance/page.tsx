"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Cpu,
  Building,
  Users,
  Lock,
  ArrowUpRight,
  ChevronDown,
  Download,
  Clock,
  Eye,
  Check
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function ComplianceCalendarProductPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const statutoryLicenses = [
    {
      title: "Fire Safety NOC (Form B)",
      authority: "State Fire & Emergency Services",
      frequency: "Half-Yearly Renewal",
      status: "Valid (Expires in 84d)",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Flame,
      coverage: "Sprinkler pressure testing, hose reels, smoke evacuation dampers, riser pumps & certified fire drill log."
    },
    {
      title: "Lift License (Form A)",
      authority: "Electrical Inspectorate & Lift Act",
      frequency: "Annual License",
      status: "Renewal In Progress (32d)",
      statusColor: "text-amber-800 bg-amber-50 border-amber-200",
      icon: Cpu,
      coverage: "Passenger elevator governor tests, ARD battery health, wire rope tension certificates, pit safety switches."
    },
    {
      title: "Consent to Operate (CTO - Air & Water)",
      authority: "State Pollution Control Board (SPCB)",
      frequency: "5-Year Periodical",
      status: "Valid (Till Dec 2027)",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Building,
      coverage: "STP treated water parameters (BOD/COD), DG chimney stack emissions, acoustic enclosure decibel test."
    },
    {
      title: "Contract Labour Registration (CLRA)",
      authority: "Department of Labour & Employment",
      frequency: "Annual Audit",
      status: "Verified Compliant",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: Users,
      coverage: "Security & housekeeping wage registers, EPF/ESIC challan validation, minimum wage statutory compliance."
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "48 Pre-Configured Commercial Licenses",
      desc: "Instant coverage for NBC 2016 fire standards, CEA electrical safety, municipal trade licenses, and state lift acts."
    },
    {
      icon: Clock,
      title: "90-Day Automated Escalation Ladder",
      desc: "Progressive alerts (90, 60, 30, 7 days) sent to facility managers, technical heads, and asset directors before expiry."
    },
    {
      icon: ShieldCheck,
      title: "Tamper-Proof Audit Document Vault",
      desc: "Centralized repository for all government challans, inspection reports, and certificates with version history."
    },
    {
      icon: Download,
      title: "1-Click REIT & Due Diligence Pack",
      desc: "Export comprehensive institutional audit binders in PDF/Excel for lenders, REIT compliance, and insurers in seconds."
    }
  ];

  const faqs = [
    {
      q: "Which commercial building licenses are tracked out-of-the-box?",
      a: "OfficeX includes pre-configured checklists for 48 commercial compliance requirements, including Fire Safety NOC (Form B), Lift Inspectorate Form A, DG Set Pollution Permits, SPCB Air/Water CTO, Occupation Certificate (OC), Trade Licenses, Pest Control Statutory Logs, and Contract Labour Registrations."
    },
    {
      q: "Can external auditors access compliance documents directly?",
      a: "Yes. Property owners can generate time-limited read-only audit links for statutory auditors, REIT diligence teams, and insurance inspectors to review all certificates and renewal history without exposing tenant records."
    },
    {
      q: "How does the platform handle vendor non-compliance (e.g. security/cleaning)?",
      a: "Vendors submit monthly wage registers, EPF, and ESIC payment receipts via the vendor portal. OfficeX validates these against platform milestones before releasing escrow payments, ensuring 100% principal employer liability protection."
    },
    {
      q: "Does this replace the physical statutory register on-site?",
      a: "OfficeX maintains a mirror digital statutory register that satisfies modern municipal e-governance standards while providing exportable print copies formatted to match official government inspector logs."
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
            Operations
          </Link>
          <span>/</span>
          <span className="text-[#0D7B6C] font-bold">Statutory Compliance Calendar</span>
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
                <FileCheck2 size={15} className="text-[#0D7B6C]" />
                <span>OFFICEX · STATUTORY COMPLIANCE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                Statutory Compliance{" "}
                <span className="text-[#0D7B6C]">
                  Calendar &amp; Vault
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Eliminate municipal penalties, building seal threats, and insurance invalidation. Automated 52-week statutory tracking for Fire NOC, Lift Form A, Pollution Control, and Labour regulations.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Enquire for Compliance Calendar</span>
                  <ArrowRight size={15} />
                </button>
                <Link
                  href="/properties/compliance"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Explore Live Calendar Demo</span>
                  <ArrowUpRight size={14} className="text-[#0D7B6C]" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> 48 Tower Licenses</span>
                <span className="flex items-center gap-1.5"><Calendar size={15} className="text-[#0D7B6C]" /> 52-Week Cadence</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#0D7B6C]" /> REIT Auditor Vault</span>
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
                      app.officex.in/compliance/statutory-calendar
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                    94.8% HEALTH SCORE
                  </span>
                </div>

                <div className="space-y-3">
                  {statutoryLicenses.map((lic, idx) => {
                    const Icon = lic.icon;
                    return (
                      <div key={idx} className="bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5 text-xs shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D7B6C] border border-teal-200/80 flex items-center justify-center shrink-0">
                              <Icon size={15} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">{lic.title}</span>
                              <span className="text-[10px] text-slate-500">{lic.authority} · {lic.frequency}</span>
                            </div>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${lic.statusColor}`}>
                            {lic.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug font-medium pl-9">
                          {lic.coverage}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Next Audit: NBC Life Safety Review in 12 Days
                  </span>
                  <Link href="/properties/compliance" className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1">
                    <span>Open Calendar</span>
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
              ZERO-LAPSE STATUTORY GOVERNANCE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything Needed for 100% Commercial Building Compliance
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
              Common Questions About Statutory Compliance
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
            Protect Your Commercial Assets from Statutory Lapses
          </h2>
          <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
            Audit your buildings against 48 municipal standards. Schedule a personalized walkthrough of the Statutory Compliance Calendar today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Request Compliance Walkthrough
            </button>
            <Link
              href="/properties/compliance"
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all"
            >
              Explore Live Calendar Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Statutory Compliance Calendar"] }}
      />
    </div>
  );
}

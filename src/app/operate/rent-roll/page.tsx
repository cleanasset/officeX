"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Receipt,
  FileText,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Landmark,
  Calculator,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function RentRollProductPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sampleLedger = [
    {
      tenant: "Google Enterprise Services",
      unit: "Floor 8 · Entire Plate",
      area: "32,400 Sq.Ft.",
      rent: "₹84,77,120",
      cam: "₹8,10,000",
      status: "Cleared RTGS",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      nextEscalation: "Oct 2026 (+5%)"
    },
    {
      tenant: "Tata Digital Limited",
      unit: "Floor 5 · East Wing",
      area: "24,000 Sq.Ft.",
      rent: "₹63,24,800",
      cam: "₹6,00,000",
      status: "Auto-Reconciled",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      nextEscalation: "Jan 2027 (+5%)"
    },
    {
      tenant: "Deloitte Shared Services",
      unit: "Floor 3 · West Wing",
      area: "18,500 Sq.Ft.",
      rent: "₹48,10,000",
      cam: "₹4,62,500",
      status: "Escrow Held",
      statusColor: "text-teal-700 bg-teal-50 border-teal-200",
      nextEscalation: "Nov 2026 (+4.5%)"
    },
    {
      tenant: "Microsoft Cloud Lab",
      unit: "Floor 2 · Suite 201",
      area: "14,200 Sq.Ft.",
      rent: "₹36,92,000",
      cam: "₹3,55,000",
      status: "Notice Served (4d overdue)",
      statusColor: "text-amber-800 bg-amber-50 border-amber-200",
      nextEscalation: "Dec 2026 (+5%)"
    }
  ];

  const features = [
    {
      icon: Calculator,
      title: "Automated Lease Escalation Engine",
      desc: "Set step-up rules (5% every 3 years, annual CPI indexation). System fires 90-day pre-anniversary warnings and auto-updates billing ledgers."
    },
    {
      icon: Receipt,
      title: "Common Area Maintenance (CAM) Pooling",
      desc: "Pool monthly utility, HVAC, housekeeping, and security expenses. Auto-allocate by exact chargeable area with zero calculation disputes."
    },
    {
      icon: AlertTriangle,
      title: "Arrears Tracking & Legal Notice Serving",
      desc: "Real-time aging reports (0-30, 31-60, 90+ days). Generate and serve standardized Section 106 statutory default notices with verified audit trails."
    },
    {
      icon: Landmark,
      title: "Nodal Escrow Settlement Integration",
      desc: "Direct integration with bank nodal escrow accounts ensures institutional collection splits, automatic TDS deduction, and tamper-proof disbursements."
    },
    {
      icon: FileSpreadsheet,
      title: "Board-Ready Rent Roll & Stacking Export",
      desc: "Download verified monthly rent roll statements, WALE concentration sheets, and tenant demising stacking charts in formatted Excel and PDF."
    },
    {
      icon: RefreshCw,
      title: "ERP & Accounting Integration",
      desc: "Two-way API and file synchronization with Tally Prime, Zoho Books, SAP S/4HANA, and Oracle NetSuite for seamless reconciliation."
    }
  ];

  const faqs = [
    {
      q: "Can OfficeX manage complex stepped escalations across different lease agreements?",
      a: "Yes. OfficeX supports customizable escalation rules including fixed percentage step-ups (e.g., 5% every 3 years), annual indexation linked to CPI, tiered rates per square foot, and custom lock-in period penalty schedules."
    },
    {
      q: "How does the automated CAM reconciliation work?",
      a: "Property managers upload or sync actual operational expenses (electricity, diesel generator backup, HVAC maintenance, security). The platform divides expenses based on each tenant's proportionate chargeable area (BOMA/RERA standards) and appends itemized audit receipts to monthly invoices."
    },
    {
      q: "What happens when a tenant is overdue on rent payments?",
      a: "The system triggers automated gentle reminders via email and WhatsApp. Once an invoice reaches the 30-day default threshold, managers can generate and serve legally drafted Section 106 default notices with registered post tracking numbers directly from the dashboard."
    },
    {
      q: "Is data compliant with REIT auditing and financial disclosure norms?",
      a: "Yes. OfficeX generates institutional audit packs adhering to SEBI REIT regulations and institutional audit standards. Every transaction, lease change, and invoice modification is logged on an immutable audit trail."
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
          <span className="text-[#0D7B6C] font-bold">Rent Roll &amp; CAM Billing</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Bright, Daylight, Enterprise Institutional
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Subtle daylight ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-50/70 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-50/90 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              
              {/* Module Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
                <Building2 size={15} className="text-[#0D7B6C]" />
                <span>OFFICEX.PRO · RENT ROLL &amp; CAM BILLING</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                Automated Rent Roll &amp;{" "}
                <span className="text-[#0D7B6C]">
                  CAM Billing Engine
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Replace spreadsheet chaos. Eliminate billing disputes, automate step-up lease escalations, streamline CAM reconciliations, and enforce timely collection through institutional escrow workflows.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Enquire for Rent Roll</span>
                  <ArrowRight size={15} />
                </button>
                <Link
                  href="/properties/rent-roll"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Explore Live Portal Demo</span>
                  <ArrowUpRight size={14} className="text-[#0D7B6C]" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> 100% Audit-Ready</span>
                <span className="flex items-center gap-1.5"><Lock size={15} className="text-[#0D7B6C]" /> RBI Escrow Settled</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#0D7B6C]" /> RERA &amp; BOMA Compliant</span>
              </div>

            </div>

            {/* Right Interactive Mockup Column (6 cols) — Clean Daylight Window */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 text-slate-900 relative">
                
                {/* Window Topbar */}
                <div className="flex items-center justify-between border-b border-slate-200/80 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 px-5 py-3 sm:px-6 rounded-t-3xl bg-slate-50 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[11px] text-slate-500 ml-2">
                      app.officex.in/rent-roll/portfolio-ledger
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                    LIVE RECOVERY LEDGER
                  </span>
                </div>

                {/* Key Metric Header */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly Rent Roll</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">₹12.4 Cr</span>
                    <span className="text-[10px] font-semibold text-emerald-700">99.4% Collected</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Leases</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">48 Tenants</span>
                    <span className="text-[10px] font-semibold text-slate-500">324,000 Sq.Ft.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Upcoming Escalations</span>
                    <span className="text-lg sm:text-xl font-black text-[#0D7B6C] mt-0.5 block">6 Leases</span>
                    <span className="text-[10px] font-semibold text-teal-700">Next 90 Days</span>
                  </div>
                </div>

                {/* Ledger Rows */}
                <div className="space-y-2.5">
                  {sampleLedger.map((row, idx) => (
                    <div key={idx} className="bg-white hover:bg-slate-50 transition-colors p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{row.tenant}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {row.unit} · <span className="text-slate-700 font-semibold">{row.area}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                        <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                          {row.rent} <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Status Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Automated Bank Escrow Reconciled
                  </span>
                  <Link href="/properties/rent-roll" className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1">
                    <span>Open Full Portal</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. PROBLEM VS SOLUTION STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#F8FAFC] border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
              SOLVING CRE BILLING CHAOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Why Institutional Landlords Replace Spreadsheets with OfficeX
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black mb-4">
                ✕
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">The Spreadsheet Trap</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Multiple offline Excel versions, manual CAM formula errors, missed escalation dates causing revenue slippage, and uncoordinated billing reconciliations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-300 shadow-md relative">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-black mb-4">
                ✓
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">OfficeX Intelligent Rent Roll</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Single source of truth. Automatic 90-day step-up escalation alerts, verified CAM square-foot cost pooling, and automated statutory GST invoices delivered on time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-black mb-4">
                ★
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Direct Nodal Settlement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Tenant deposits are captured in RBI-compliant nodal escrow accounts with automated split settlements, zero payment reconciliation lags, and instant ledger updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. FEATURE DEEP DIVE GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              BUILT FOR ENTERPRISE ASSET MANAGERS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything You Need for Flawless Lease Revenue Governance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          4. FAST ONBOARDING WORKFLOW (Clean Bright Theme)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              FAST ONBOARDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Deploy in Under 7 Days Across Your Portfolio
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Upload Lease Deeds", desc: "Bulk import executed lease contracts, square footage measurements, and tenant GSTINs." },
              { step: "02", title: "Configure Escalations", desc: "Set anniversary step-ups, lock-in clauses, CAM recovery formulas, and security deposit terms." },
              { step: "03", title: "Automate Monthly Cycles", desc: "Invoices auto-generate on the 1st of each month with automated reminders and escrow collection." },
              { step: "04", title: "Export Board Packs", desc: "Generate audited rent roll summaries, tenant concentration indices, and WALE reports in seconds." }
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative">
                <span className="text-3xl font-black text-[#0D7B6C] block mb-3 font-mono">{step.step}</span>
                <h4 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. FAQ ACCORDION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Common Questions About OfficeX Rent Roll
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
          6. BOTTOM CALL TO ACTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Ready to Streamline Your Portfolio Rent Roll?
          </h2>
          <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
            Join leading commercial REITs and Grade-A office landlords. Schedule a personalized walkthrough of the Rent Roll &amp; CAM billing engine today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Request Rent Roll Walkthrough
            </button>
            <Link
              href="/properties/rent-roll"
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all"
            >
              Explore Live Portal Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Rent Roll & CAM Billing"] }}
      />
    </div>
  );
}

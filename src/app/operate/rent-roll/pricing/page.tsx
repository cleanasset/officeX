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
  ChevronUp,
  Lock,
  Layers,
  Database,
  Users,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import RentRollPricingTable from "@/components/rent-roll/RentRollPricingTable";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function RentRollPricingPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const COMPARISON_ROWS = [
    {
      category: "Platform Core & Masters (§1.1 & §4)",
      items: [
        { name: "Single Organization & User Masters", essentials: true, pro: true, enterprise: true },
        { name: "Property, Building, Floor & Space Hierarchy", essentials: true, pro: true, enterprise: true },
        { name: "Occupant / Tenant Company Master", essentials: true, pro: true, enterprise: true },
        { name: "Bulk Excel/CSV Import Wizard with Auto-Mapper", essentials: true, pro: true, enterprise: true },
        { name: "Immutable Audit Log for REIT Disclosures", essentials: true, pro: true, enterprise: true },
      ],
    },
    {
      category: "Lease & Contract Management (§4.8 & S-21)",
      items: [
        { name: "39-Point Canonical Lease Contract Master", essentials: true, pro: true, enterprise: true },
        { name: "Real-Time Rent Roll Register with As-Of Date", essentials: true, pro: true, enterprise: true },
        { name: "480px Slide-Over Contract Drawer with Tabbed Views", essentials: true, pro: true, enterprise: true },
        { name: "Document Vault with Versioning & Stamped PDFs", essentials: true, pro: true, enterprise: true },
        { name: "Automated Escalation Schedule & 90-Day Pre-Alerts", essentials: true, pro: true, enterprise: true },
        { name: "Rollover & Expiry Pipeline Analysis", essentials: true, pro: true, enterprise: true },
        { name: "Multi-Charge Lines (CAM, DG, Parking, Utilities)", essentials: false, pro: true, enterprise: true },
        { name: "Maker-Checker Multi-Tier Commercial Approvals", essentials: false, pro: false, enterprise: true },
      ],
    },
    {
      category: "Billing, Tax & Invoicing (§4.9 & S-30)",
      items: [
        { name: "Single & Bulk Automated Monthly Billing Runs", essentials: false, pro: true, enterprise: true },
        { name: "Statutory 18% GST (SAC 997212) Calculation", essentials: false, pro: true, enterprise: true },
        { name: "Section 194I TDS Deductible Ledger", essentials: false, pro: true, enterprise: true },
        { name: "CAM Area-Proportionate Expense Pooling", essentials: false, pro: true, enterprise: true },
        { name: "Utility Sub-Meter Ingestion (Power & Water)", essentials: false, pro: true, enterprise: true },
        { name: "Credit Notes & Debit Adjustment Notes", essentials: false, pro: true, enterprise: true },
        { name: "Billing Exception Center with Dispute Flags", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Payments, Collections & Escrow (§4.11 & S-40)",
      items: [
        { name: "Payment Modes (NEFT/RTGS, UPI, Cheque, Wire)", essentials: false, pro: true, enterprise: true },
        { name: "Payment Allocations (Pay All, Selected, Partial)", essentials: false, pro: true, enterprise: true },
        { name: "Automated Bank Statement CSV Reconciliation", essentials: false, pro: true, enterprise: true },
        { name: "Digitally Stamped Payment Receipts", essentials: false, pro: true, enterprise: true },
        { name: "Real-Time Arrears Ageing Reports (0-30, 31-60, 90+)", essentials: false, pro: true, enterprise: true },
        { name: "Section 106 Statutory Legal Default Notices", essentials: false, pro: true, enterprise: true },
        { name: "Direct Nodal Bank Escrow Auto-Splits", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Occupant Experience & Financial MIS (§5 & §10)",
      items: [
        { name: "Tenant Self-Service Portal (View Invoices & Pay)", essentials: false, pro: true, enterprise: true },
        { name: "Form 16A TDS Certificate Upload & Reconciliation", essentials: false, pro: true, enterprise: true },
        { name: "12-Month Rolling Cashflow Forecast", essentials: false, pro: true, enterprise: true },
        { name: "Property-Level Operating P&L Ledger", essentials: false, pro: true, enterprise: true },
        { name: "Automated Monthly Board MIS Package Export", essentials: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Enterprise Security & Infrastructure (§2.3 & §6)",
      items: [
        { name: "Role-Based Access Control (§5.14 Matrix)", essentials: "Standard", pro: "Standard", enterprise: "Custom Roles" },
        { name: "RESTful API Access & Webhooks", essentials: false, pro: false, enterprise: true },
        { name: "Enterprise Single Sign-On (SAML / Okta / Azure)", essentials: false, pro: false, enterprise: true },
        { name: "Dedicated Subdomain / Custom Domain", essentials: "Subdomain", pro: "Subdomain", enterprise: "Custom Domain" },
        { name: "Testing Sandbox Environment", essentials: false, pro: false, enterprise: true },
        { name: "SLA Guarantees & Dedicated Account Manager", essentials: "Standard", pro: "Priority (12h)", enterprise: "Dedicated (24/7)" },
        { name: "White-Labeling (Remove 'Powered by OfficeX')", essentials: false, pro: false, enterprise: true },
      ],
    },
  ];

  const FAQS = [
    {
      q: "Is subscription to the OFFICEX CAFM or FM Operations suite required?",
      a: "No. In strict accordance with Section 2.2 of the specification, OFFICEX Rent Roll is sold and subscribed as a standalone SaaS product. You do not need CAFM, Leasing CRM, or any other module. Capabilities from other products (like energy readings) can be entered manually, imported via CSV, or linked automatically if you choose to add them later.",
    },
    {
      q: "How does the pricing metric work?",
      a: "Commercial properties are billed on a transparent monthly software license per edition, with optional volume metering for multi-million square foot portfolios. Managed office flex operators can utilize the Flex & Seats add-on for capacity-based seat billing.",
    },
    {
      q: "Can we start with Essentials and upgrade to Professional later?",
      a: "Yes. Upgrading is a simple entitlement switch. Because all editions use the same single Platform Core database schema, zero data migration, re-importing, or downtime is required when transitioning between editions.",
    },
    {
      q: "How does the 100% free launch coupon work?",
      a: "During our launch window, enter coupon code OFFICEX100 or RENTROLL12 at the subscription gate. This unlocks the entire live engine with ₹0 due and no credit card required.",
    },
    {
      q: "What is the Multi-Client Operator add-on?",
      a: "Designed for Property Management (PM) and Integrated Facility Management (IFM) firms that manage commercial towers on behalf of third-party landlords. It unlocks client accounts, mandate fee calculations (e.g. 4% of collections), and automated monthly owner remittance statements.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      <MarketingHeader activePath="/operate/rent-roll" />

      {/* Breadcrumb Navigation */}
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
          <Link href="/operate/rent-roll" className="hover:text-slate-900 transition-colors">
            Rent Roll &amp; CAM Billing
          </Link>
          <span>/</span>
          <span className="text-[#0D7B6C] font-bold">Editions &amp; Pricing</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-teal-500/10 via-[#0D7B6C]/8 to-emerald-400/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs font-bold tracking-wide mb-4 shadow-2xs">
            <Building2 size={14} className="text-[#0D7B6C]" />
            <span>OFFICEX RENT ROLL &middot; PLANS &amp; PRICING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-black tracking-tight text-[#0F172A] leading-tight mb-4">
            Predictable pricing for portfolios of every scale
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Transparent per-square-foot commercial licensing designed for property owners, asset managers, and REITs. Pick the plan tailored to your leasable square footage.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 font-semibold bg-white/90 border border-slate-200/80 py-2 px-5 rounded-full shadow-2xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Enterprise Standalone SaaS
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#0D7B6C]" /> Zero ERP Re-Keying
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
            <span className="flex items-center gap-1.5">
              <Lock size={14} className="text-teal-600" /> Statutory GST &amp; TDS Compliant
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0D7B6C]" /> 14-Day Grace Period Protection
            </span>
          </div>
        </div>
      </section>

      {/* Main Pricing Deck */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <RentRollPricingTable
            onContactSales={() => setEnquiryOpen(true)}
            showComparisonLink={false}
          />
        </div>
      </section>

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Detailed Edition Comparison Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
              Every capability mapped to the canonical Lease-to-Cash functional specification.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-sm bg-white">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-900">
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider w-2/5">
                    Capability / Module
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center w-1/5">
                    <div>Commercial Starter</div>
                    <div className="text-[11px] font-bold text-teal-700 normal-case">₹50 / sq.ft</div>
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center w-1/5 text-[#0D7B6C] bg-teal-50/50">
                    <div>Grade-A Tech Park</div>
                    <div className="text-[11px] font-bold text-[#0D7B6C] normal-case">₹100 / sq.ft</div>
                  </th>
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center w-1/5">
                    <div>REIT Mega-Portfolio</div>
                    <div className="text-[11px] font-bold text-slate-800 normal-case">₹200 / sq.ft</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr className="bg-slate-100/70 border-b border-slate-200/80">
                      <td
                        colSpan={4}
                        className="py-3 px-6 text-xs font-black text-slate-800 uppercase tracking-wide"
                      >
                        {group.category}
                      </td>
                    </tr>
                    {group.items.map((item, iIdx) => (
                      <tr
                        key={iIdx}
                        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-6 text-xs font-semibold text-slate-700">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof item.essentials === "boolean" ? (
                            item.essentials ? (
                              <Check size={16} className="text-emerald-600 mx-auto" />
                            ) : (
                              <X size={16} className="text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-[11px] font-bold text-slate-600">
                              {item.essentials}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center bg-teal-50/20 font-bold">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? (
                              <Check size={16} className="text-[#0D7B6C] mx-auto stroke-[2.5]" />
                            ) : (
                              <X size={16} className="text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-[11px] font-extrabold text-[#0D7B6C]">
                              {item.pro}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof item.enterprise === "boolean" ? (
                            item.enterprise ? (
                              <Check size={16} className="text-slate-900 mx-auto" />
                            ) : (
                              <X size={16} className="text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-[11px] font-bold text-slate-800">
                              {item.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-extrabold mb-2">
              <HelpCircle size={13} />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Commercial Licensing &amp; Deployment Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 cursor-pointer hover:text-[#0D7B6C] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[#0D7B6C] shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ready to Deploy Section */}
      <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Ready to Take Control of Your Rent Roll?
          </h2>
          <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
            Eliminate revenue leakage, automate stepped escalations, and reconcile multi-crore CAM ledgers with total institutional confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/properties/rent-roll?tab=dashboard"
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 group"
            >
              <CreditCard size={15} className="text-[#0D7B6C] group-hover:scale-110 transition-transform" />
              <span>Launch Live Register Now</span>
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all cursor-pointer"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Rent Roll & CAM Billing (Enterprise Inquiry)"] }}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import {
  ArrowLeft, Calendar, Clock, Share2, CheckCircle2,
  Building, TrendingUp, ShieldCheck, ArrowRight, BookOpen
} from "lucide-react";

interface ArticleData {
  title: string;
  category: string;
  publishedDate: string;
  readTime: string;
  author: string;
  authorRole: string;
  summary: string;
  metrics?: Array<{ label: string; value: string }>;
  contentSections: Array<{
    heading: string;
    body: string[];
    keyTakeaway?: string;
  }>;
}

const articlesMap: Record<string, ArticleData> = {
  "prestige-meridian-case-study": {
    title: "Prestige Meridian: 18% OpEx Reduction via Escrow Procurement",
    category: "Case Study",
    publishedDate: "August 2026",
    readTime: "6 min read",
    author: "OfficeX Research & Case Studies Desk",
    authorRole: "Commercial Operations Advisory",
    summary: "How a 450,000 sq.ft. Grade-A commercial park in Bengaluru replaced chaotic WhatsApp vendor coordination with OfficeX Marketplace and Razorpay Escrow — cutting tender cycles by 60% and saving ₹32 Lakhs annually.",
    metrics: [
      { label: "Procurement Cycle", value: "-60%" },
      { label: "Annual MEP Savings", value: "₹32 Lakhs" },
      { label: "Payment Disputes", value: "Zero" },
      { label: "Vendor SLA Rating", value: "98.2%" }
    ],
    contentSections: [
      {
        heading: "The Challenge: Manual Procurement & 45-Day Payment Delays",
        body: [
          "Prestige Meridian is a prime commercial park spanning 450,000 square feet in central Bengaluru, hosting multinational enterprise occupiers across banking, technology, and professional services.",
          "Prior to adopting OfficeX, facility procurement was handled across disconnected phone calls and WhatsApp groups. Tender specifications were shared as unstructured PDFs, resulting in non-comparable vendor bids with hidden markups and ambiguous scope boundaries.",
          "Furthermore, vendor payments routinely suffered 45 to 90-day processing lags. This led to high contractor turnover, strained vendor relationships, and frequent work stoppages during critical HVAC chiller repairs."
        ],
        keyTakeaway: "Unstructured vendor procurement creates severe cost unpredictability and tenant dissatisfaction."
      },
      {
        heading: "The Solution: Structured RFQs, Automated BOQ & Milestone Escrow",
        body: [
          "In early 2026, the asset management team implemented OfficeX Marketplace and the Escrow Disbursement module.",
          "Using the AI-assisted BOQ tool, the facility manager generated standardized scope documents with clear milestone checkpoints for HVAC maintenance, elevator AMCs, and daily housekeeping.",
          "Tenders were published directly to pre-verified Grade-A contractors. Bids were compared side-by-side on an objective matrix evaluating past SLA scores, pricing transparency, and statutory compliance status.",
          "Once contracts were awarded, procurement funds were deposited into Razorpay Nodal Escrow accounts — giving vendors complete payment certainty while protecting the landlord from substandard work."
        ],
        keyTakeaway: "Escrow payment protection aligns landlord quality standards with vendor financial incentives."
      },
      {
        heading: "Measurable Outcomes and Long-Term Value",
        body: [
          "Within 6 months of rollout, procurement turnaround for MEP contracts dropped from 21 days to just 8 days (a 60% acceleration).",
          "Competitive side-by-side bidding yielded an 18% net reduction in annual facility operating overhead, delivering ₹32 Lakhs in direct bottom-line cashflow savings.",
          "Milestone photo inspections conducted via the OfficeX mobile app ensured 100% verified job completion before any escrow release, completely eliminating billing disputes.",
          "Today, Prestige Meridian manages 100% of external service contracts through OfficeX, providing its institutional co-investors with an audited digital trail of every rupee spent."
        ],
        keyTakeaway: "Digital procurement transforms property management from an operational cost center into an institutional competitive edge."
      }
    ]
  },
  "cre-fm-benchmark-2026": {
    title: "Commercial Real Estate & FM Benchmark Report 2026",
    category: "Market Report",
    publishedDate: "July 2026",
    readTime: "12 min read",
    author: "OfficeX Analytics Team",
    authorRole: "CRE Market Intelligence",
    summary: "A comprehensive analysis of Grade-A office leasing trends, Common Area Maintenance (CAM) inflation, and digital procurement adoption across Bengaluru, Mumbai MMR, Delhi NCR, Hyderabad, Pune, and Chennai.",
    metrics: [
      { label: "Avg CAM Inflation", value: "+14.2%" },
      { label: "Grade-A Absorption", value: "54M Sq.Ft." },
      { label: "Digital CAFM Shift", value: "68%" },
      { label: "Energy OpEx Share", value: "38%" }
    ],
    contentSections: [
      {
        heading: "Executive Summary: Macro Trends Across Major CRE Hubs",
        body: [
          "The commercial office sector continues to demonstrate resilient leasing velocity, led by Global Capability Centers (GCCs) and institutional BFSI occupiers expanding in primary metro clusters.",
          "However, landlords face mounting margin compression driven by 14.2% average annual CAM inflation, escalating technical labor wages, and stringent municipal compliance requirements.",
          "Forward-looking property owners are responding by consolidating operational software into unified platforms that manage leasing discovery, preventive maintenance, and statutory compliance under one roof."
        ]
      },
      {
        heading: "CAM Reconciliation Challenges & Tenant Scrutiny",
        body: [
          "Occupiers are no longer accepting estimated monthly CAM bills without granular proof of utility consumption and vendor contracts.",
          "Landlords using digital meters with itemized CAM calculation modules experienced 97.4% on-time rent and maintenance recoveries, compared to 82% among landlords using spreadsheet invoicing."
        ]
      }
    ]
  },
  "52-week-ppm-guide-commercial-buildings": {
    title: "The Ultimate 52-Week PPM Guide for Commercial Buildings",
    category: "Playbook",
    publishedDate: "June 2026",
    readTime: "8 min read",
    author: "Technical Operations Desk",
    authorRole: "Hard FM Engineering",
    summary: "Step-by-step preventative maintenance schedules for chillers, DG sets, transformers, fire suppression systems, and lift banks to ensure 99.5%+ asset uptime.",
    metrics: [
      { label: "Asset Uptime", value: "99.8%" },
      { label: "Emergency Repairs", value: "-45%" },
      { label: "Equipment Life", value: "+3-5 Yrs" }
    ],
    contentSections: [
      {
        heading: "Why Reactive Maintenance Kills Property NOI",
        body: [
          "A single chiller breakdown during peak summer business hours can cost commercial landlords hundreds of thousands in emergency technician fees and occupier compensation claims.",
          "A structured 52-week PPM (Preventative Planned Maintenance) schedule replaces reactive firefighting with calendarized weekly, monthly, and quarterly service routines."
        ]
      },
      {
        heading: "MEP Asset Tagging & Digital Passports",
        body: [
          "Every physical asset — from 500kVA DG sets to AHUs and sump pumps — should carry a durable QR passport linked to historical maintenance logs, AMC contracts, and OEM manuals.",
          "Technicians scan the QR code upon arriving at the machine, logging runtime hours, oil levels, and vibration readings directly into the CAFM system."
        ]
      }
    ]
  },
  "commercial-real-estate-compliance-checklist": {
    title: "Commercial Real Estate Statutory Compliance Checklist",
    category: "Compliance",
    publishedDate: "August 2026",
    readTime: "10 min read",
    author: "OfficeX Statutory Governance Team",
    authorRole: "Legal & Regulatory Affairs",
    summary: "A practical guide covering 40+ mandatory statutory clearances: Fire NOC, Lift Licenses, State Pollution Control Board consents, and DPDP Act readiness.",
    metrics: [
      { label: "Mandatory NOCs", value: "40+" },
      { label: "Penalty Risk", value: "High / Cease-Work" },
      { label: "Alert Buffer", value: "90/60/30 Days" }
    ],
    contentSections: [
      {
        heading: "Zero-Tolerance Statutory Governance",
        body: [
          "Commercial properties operate under strict municipal and state regulations. Lapses in Fire NOC renewals or labour contractor PF/ESIC deposits can lead to instant building sealings or severe criminal liabilities for directors.",
          "OfficeX Manage provides an automated statutory compliance tracker with proactive 90, 60, and 30-day expiry notifications sent directly to asset managers."
        ]
      }
    ]
  },
  "esg-sebi-brsr-core-asset-managers": {
    title: "ESG & SEBI BRSR Core for Commercial Asset Managers",
    category: "Whitepaper",
    publishedDate: "July 2026",
    readTime: "15 min read",
    author: "Sustainability & Intelligence Desk",
    authorRole: "ESG Practice Lead",
    summary: "How institutional landlords capture and audit Scope 1 & Scope 2 carbon emissions, water recycling metrics, and tenant wellness data for SEBI and IGBC audits.",
    metrics: [
      { label: "Energy Efficiency", value: "-14% Avg" },
      { label: "Reporting Time", value: "-80%" },
      { label: "Green Certifications", value: "IGBC / LEED" }
    ],
    contentSections: [
      {
        heading: "The Shift from Optional Green PR to Mandatory Disclosures",
        body: [
          "SEBI BRSR Core guidelines now require top listed companies and commercial REITs to present verifiable, audited ESG data across their real estate holdings.",
          "Manual utility data aggregation across thousands of tenant meters is unviable. OfficeX Intelligence ingests smart meter telemetry to produce audit-ready sustainability packs automatically."
        ]
      }
    ]
  },
  "cafm-vs-erp-commercial-landlords": {
    title: "CAFM vs ERP: Why Commercial Landlords Need Specialized Tech",
    category: "Technology",
    publishedDate: "May 2026",
    readTime: "7 min read",
    author: "Product Architecture Team",
    authorRole: "Enterprise Systems",
    summary: "Why generic accounting ERPs like SAP or Tally fail at facility maintenance, SLA enforcement, and tenant satisfaction — and why modern CRE teams pair both.",
    metrics: [
      { label: "Helpdesk Resolution", value: "2.4 Hrs" },
      { label: "Tenant CSAT", value: "+28%" },
      { label: "Data Duplication", value: "Zero" }
    ],
    contentSections: [
      {
        heading: "Financial Accounting vs. Operational Rigor",
        body: [
          "Traditional ERPs were built for balance sheets, general ledgers, and inventory depreciation. They lack the real-time workflows needed to dispatch an HVAC technician when a compressor trips.",
          "OfficeX complements existing ERPs by powering on-ground operations (CAFM, PPM, RFQs, visitor passes) and syncing reconciled financial data back into accounting software."
        ]
      }
    ]
  }
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const slug = (params?.slug as string) || "prestige-meridian-case-study";
  const article = articlesMap[slug] || articlesMap["prestige-meridian-case-study"];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      {/* Universal Marketing Header */}
      <MarketingHeader activePath="/resources" />

      {/* Main Article Container */}
      <main className="flex-1 py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F8B7D] mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Resources &amp; Case Studies</span>
          </Link>

          {/* Article Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar size={13} />
                {article.publishedDate}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Clock size={13} />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.18]">
              {article.title}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium mt-4 leading-relaxed border-l-4 border-[#0F8B7D] pl-4 italic">
              {article.summary}
            </p>

            {/* Author Byline */}
            <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center font-black text-sm">
                OX
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">{article.author}</div>
                <div className="text-[11px] text-slate-500 font-medium">{article.authorRole}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics Callout Strip */}
          {article.metrics && (
            <div className="mt-10 bg-[#071324] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">
                Verified Quantitative Outcomes
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {article.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                    <div className="text-xl sm:text-2xl font-black text-teal-400">{m.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Body Content */}
          <div className="mt-12 space-y-10 text-slate-800">
            {article.contentSections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {sec.heading}
                </h2>
                {sec.body.map((para, pIdx) => (
                  <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    {para}
                  </p>
                ))}
                {sec.keyTakeaway && (
                  <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs sm:text-sm font-bold text-[#0F8B7D] flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span><strong>Key Finding:</strong> {sec.keyTakeaway}</span>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Consultation Next Steps Callout */}
          <div className="mt-14 p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                TRANSFORM YOUR PORTFOLIO
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                Achieve Similar Results for Your Properties
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
                Schedule a 30-minute operational scoping call with our enterprise commercial real estate team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="shrink-0 px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>Talk to an Expert</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* Final CTA Band */}
      <FinalCTABand
        accentColor="#0F8B7D"
        headline="Explore the full OfficeX Commercial Operating System"
        subheadline="From space discovery to 52-week PPM and statutory compliance — all in one platform."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Sales",
          onClick: () => setEnquiryOpen(true)
        }}
      />

      {/* SlideIn Enquiry Drawer */}
      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{
          modules: ["marketplace", "managed-services"]
        }}
      />

      <Footer />
    </div>
  );
}

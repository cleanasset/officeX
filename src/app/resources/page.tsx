"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { BookOpen, FileText, Download, ArrowRight, Sparkles, Building } from "lucide-react";

export default function ResourcesPage() {
  const articles = [
    {
      category: "Market Report",
      title: "India Commercial Real Estate & FM Benchmark 2026",
      desc: "An in-depth analysis of Grade-A office leasing trends, CAM inflation, and digital procurement adoption across top 6 Indian metros.",
      readTime: "12 min read",
      href: "/resources/india-cre-fm-benchmark-2026"
    },
    {
      category: "Playbook",
      title: "The Ultimate 52-Week PPM Guide for Commercial Buildings",
      desc: "Step-by-step preventative maintenance schedules for chillers, DG sets, transformers, and fire suppression systems.",
      readTime: "8 min read",
      href: "/resources/52-week-ppm-guide-commercial-buildings"
    },
    {
      category: "Case Study",
      title: "Prestige Meridian: 18% OpEx Reduction via Escrow Procurement",
      desc: "How a 450,000 sq.ft. commercial park replaced manual vendor WhatsApp groups with structured RFQs and saved ₹32 Lakhs.",
      readTime: "6 min read",
      href: "/resources/prestige-meridian-case-study"
    },
    {
      category: "Compliance",
      title: "Indian Commercial Real Estate Statutory Compliance Checklist",
      desc: "40 mandatory clearances: Fire NOC, Lift Licenses, State Pollution Control Board, and DPDP Act 2023 readiness.",
      readTime: "10 min read",
      href: "/resources/commercial-real-estate-compliance-checklist"
    },
    {
      category: "Whitepaper",
      title: "ESG & SEBI BRSR Core for Asset Managers",
      desc: "A practical framework for institutional landlords to capture and audit Scope 1 & 2 emissions from multi-tenant commercial towers.",
      readTime: "15 min read",
      href: "/resources/esg-sebi-brsr-core-asset-managers"
    },
    {
      category: "Technology",
      title: "CAFM vs ERP: Why Commercial Landlords Need Specialized Tech",
      desc: "Why generic accounting ERPs fail at facility maintenance, SLA enforcement, and tenant satisfaction.",
      readTime: "7 min read",
      href: "/resources/cafm-vs-erp-commercial-landlords"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      {/* Universal Marketing Header */}
      <MarketingHeader activePath="/resources" />

      {/* Main Content */}
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              KNOWLEDGE &amp; INSIGHTS HUB
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071324] tracking-tight mt-4">
              Resources for Commercial Real Estate Leaders
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              Actionable guides, market research, compliance checklists, and case studies curated by OfficeX experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-3">
                    <span className="text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                      {art.category}
                    </span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-2.5 leading-relaxed font-medium">
                    {art.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F8B7D] group-hover:underline flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <BookOpen size={16} className="text-gray-400 group-hover:text-[#0F8B7D]" />
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Box */}
          <div className="mt-16 bg-[#071324] text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl">
            <h2 className="text-2xl font-black">Subscribe to the OfficeX CRE Briefing</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto font-medium">
              Join 12,000+ asset managers and facility directors receiving our fortnightly analysis of Indian CRE benchmarks and statutory updates.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you! You have been added to our newsletter list.");
              }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter work email"
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#0F8B7D]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-black transition-all cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/marketing/HeroSection";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import UserLandingBanner from "@/components/UserLandingBanner";
import { LineChart, BarChart3, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";

export default function InvestorsREITsJourney() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/audiences/investors" />

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="REIT &amp; Institutional Investor"
        dashboardHref="/reporting"
        dashboardName="Intelligence Analytics Portal"
      />

      <HeroSection
        badge="AUDIENCE JOURNEY — INVESTORS, REITS &amp; PRIVATE EQUITY"
        headline="Institutional CRE Intelligence: Real-Time NOI, WALE, and Audited ESG Data"
        subheadline="Underwrite asset acquisitions, monitor portfolio cashflows, and prove statutory governance."
        description="OfficeX provides institutional investors with auditable operational telemetry directly from on-ground systems. Monitor net operating income, rent roll collections, and statutory compliance across all fund assets."
        primaryCta={{
          label: "Request Institutional Access",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Book Fund Walkthrough",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="INSTITUTIONAL INVESTOR PORTAL"
        visualMetrics={[
          { label: "Portfolio Yield", value: "8.6%" },
          { label: "Compliance NOC", value: "100% Valid" },
          { label: "ESG Data Audit", value: "Verified" }
        ]}
      />

      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              Institutional Visibility Across Every Asset in Your Fund
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0F8B7D]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Fund NOI &amp; WALE Analytics</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Live executive dashboards tracking rent collection efficiency, vacancy velocity, and Weighted Average Lease Expiry via <strong>Intelligence</strong>.
              </p>
              <Link href="/intelligence" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Intelligence</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#D97706]">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Audit-Proof Lease Vault</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Inspect digitized lease deeds, lock-in clauses, bank guarantee expiries, and statutory compliance records in <strong>Manage</strong>.
              </p>
              <Link href="/manage" className="text-xs font-bold text-[#D97706] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0D7A6E]">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Automated BRSR &amp; GRESB</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Export verified Scope 1 &amp; 2 utility metrics and building sustainability scores compliant with global ESG, BRSR, and GRESB frameworks.
              </p>
              <Link href="/platform" className="text-xs font-bold text-[#0D7A6E] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Platform</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand
        headline="Institutional-grade visibility for your real estate fund."
        subheadline="Schedule a confidential discussion with our institutional solutions director."
        primaryCta={{
          label: "Request Fund Demo",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Institutional Team",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "Investor / REIT", modules: ["intelligence", "manage"] }}
      />

      <Footer />
    </div>
  );
}

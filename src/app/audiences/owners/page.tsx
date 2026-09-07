"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/marketing/HeroSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import UserLandingBanner from "@/components/UserLandingBanner";
import { Building2, ShieldCheck, DollarSign, BarChart3, Users, ArrowRight } from "lucide-react";

export default function BuildingOwnersJourney() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/audiences/owners" />

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="Property Owner & Landlord"
        dashboardHref="/properties"
        dashboardName="Property Portfolio Dashboard"
      />

      {/* Hero */}
      <HeroSection
        badge="AUDIENCE JOURNEY — BUILDING OWNERS &amp; LANDLORDS"
        headline="Protect Asset Value, Automate Cashflow, and Eliminate Compliance Risk"
        subheadline="A unified operating system built for commercial landlords, family offices, and developers."
        description="From publishing verified space listings on Marketplace to automating rent rolls in Manage and tracking facility SLAs in Operate — OfficeX protects your asset equity and institutional yields."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Request Owner Consultation",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="OWNER PORTFOLIO DASHBOARD"
        visualMetrics={[
          { label: "Collection Speed", value: "4 Days" },
          { label: "Compliance Rate", value: "100%" },
          { label: "OpEx Savings", value: "18%" }
        ]}
      />

      {/* Journey Steps */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              Your Curated Journey Across OfficeX
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              How the OfficeX modules work together seamlessly for building owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0F8B7D]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Lease Vacancy Fast</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                List spaces on <strong>Marketplace</strong> with verified floor plans, 3D walkthroughs, and direct broker collaboration.
              </p>
              <Link href="/marketplace" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Marketplace</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#D97706]">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Automate Rent &amp; CAM</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Use <strong>Manage</strong> to automate rent roll collections via Razorpay, calculate CAM reconciliations, and track Fire NOC renewals.
              </p>
              <Link href="/manage" className="text-xs font-bold text-[#D97706] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#059669]">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Outsource Technical Ops</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Let <strong>Managed Services</strong> deploy certified on-ground technicians, enforce 52-week PPMs, and deliver monthly audited MIS.
              </p>
              <Link href="/managed-services" className="text-xs font-bold text-[#059669] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Managed Services</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTABand
        headline="Take control of your commercial property portfolio today."
        subheadline="Speak with our owner solutions specialist to review your building assets and setup."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Owner Specialist",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "Building Owner", modules: ["manage", "marketplace"] }}
      />

      <Footer />
    </div>
  );
}

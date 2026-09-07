"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/marketing/HeroSection";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import UserLandingBanner from "@/components/UserLandingBanner";
import HeaderAuthButton from "@/components/marketing/HeaderAuthButton";
import { Building2, LifeBuoy, Users, Calendar, ArrowRight } from "lucide-react";

export default function CorporateOccupiersJourney() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX Logo"
            width={50}
            height={50}
            className="object-contain"
            style={{ width: "auto", height: "42px" }}
          />
          <Image
            src="/name-removebg-preview.png"
            alt="OfficeX"
            width={160}
            height={36}
            className="object-contain"
            style={{ width: "auto", height: "30px" }}
          />
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/marketplace" className="text-gray-600 hover:text-[#0F8B7D]">
            Solutions
          </Link>
          <HeaderAuthButton />
          <button
            type="button"
            onClick={() => setSlideInOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-extrabold hover:bg-[#0c7368] transition-all cursor-pointer"
          >
            Talk to Sales
          </button>
        </div>
      </header>

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="Corporate Occupier & Tenant Admin"
        dashboardHref="/tenant"
        dashboardName="Tenant Workplace Portal"
      />

      <HeroSection
        badge="AUDIENCE JOURNEY — CORPORATE OCCUPIERS &amp; TENANTS"
        headline="Frictionless Workplaces, Fast Vendor Procurement, and Transparent CAM"
        subheadline="Empowering enterprise workplace managers, admin heads, and corporate real estate leads."
        description="Discover vetted office expansions on Marketplace, log helpdesk tickets with guaranteed response times in Operate, and audit transparent CAM allocations in Manage."
        primaryCta={{
          label: "Explore Occupier Solutions",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Request Workplace Consultation",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="OCCUPIER WORKPLACE PORTAL"
        visualMetrics={[
          { label: "Helpdesk SLA", value: "< 2 Hrs" },
          { label: "Visitor Check-in", value: "20 Secs" },
          { label: "CAM Transparency", value: "100%" }
        ]}
      />

      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              A Seamless Experience for Your Employees &amp; Admin Teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0F8B7D]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Space &amp; Fit-Out Sourcing</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Find verified commercial spaces and tender interior fit-outs with escrow-protected milestone payments on <strong>Marketplace</strong>.
              </p>
              <Link href="/marketplace" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Marketplace</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#2563EB]">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Day-to-Day Workplace Helpdesk</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Employees and admin staff scan QR codes on ACs or desks to log tickets, pre-register visitors, and book shared amenities with <strong>Operate</strong>.
              </p>
              <Link href="/operate" className="text-xs font-bold text-[#2563EB] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Operate</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#D97706]">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Transparent Lease &amp; CAM Billing</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Audit monthly CAM breakdowns, track utility consumption, and pay rent online with automated GST invoices via <strong>Manage</strong>.
              </p>
              <Link href="/manage" className="text-xs font-bold text-[#D97706] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand
        headline="Elevate your corporate office operations today."
        subheadline="Connect with our workplace solutions team for a personalized demo."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Schedule Workplace Walkthrough",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "Corporate Occupier", modules: ["operate", "marketplace"] }}
      />

      <Footer />
    </div>
  );
}

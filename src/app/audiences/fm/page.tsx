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
import { Wrench, Calendar, LifeBuoy, ArrowRight } from "lucide-react";

export default function FacilityManagersJourney() {
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
          <Link href="/operate" className="text-gray-600 hover:text-[#2563EB]">
            Operate CAFM
          </Link>
          <HeaderAuthButton />
          <button
            type="button"
            onClick={() => setSlideInOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-extrabold hover:bg-blue-700 transition-all cursor-pointer"
          >
            Talk to Sales
          </button>
        </div>
      </header>

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="Facility Manager &amp; Chief Engineer"
        dashboardHref="/ops"
        dashboardName="FM Command Centre"
      />

      <HeroSection
        badge="AUDIENCE JOURNEY — FACILITY MANAGERS &amp; CHIEF ENGINEERS"
        headline="Run 52-Week PPMs, Eliminate Chiller Downtime, and Prove SLA Compliance"
        subheadline="Built for FM leads who demand digital control over assets, contractors, and work orders."
        description="Stop scrambling with paper logbooks. OfficeX Operate automates asset QR tagging, schedules preventative maintenance, routes helpdesk tickets, and calculates vendor SLA penalties automatically."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Request CAFM Demo",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#2563EB"
        visualPlaceholderTitle="FM OPERATIONS CONSOLE"
        visualMetrics={[
          { label: "PPM Completion", value: "99.4%" },
          { label: "Avg Resolution", value: "1.4 Hrs" },
          { label: "Active Technicians", value: "32" }
        ]}
      />

      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              Tools Built for Technical Facility Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#2563EB]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Asset QR Tagging &amp; 52-Week PPM</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Scan asset QRs on-ground and execute step-by-step manufacturer maintenance checklists with <strong>Operate</strong>.
              </p>
              <Link href="/operate" className="text-xs font-bold text-[#2563EB] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Operate CAFM</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0F8B7D]">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Emergency Contractor Dispatch</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Source specialized chiller, elevator, or fire safety contractors on <strong>Marketplace</strong> with verified SLA ratings and BOQs.
              </p>
              <Link href="/marketplace" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Marketplace</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#7C3AED]">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Automated Executive Reporting</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Generate monthly FM review decks with uptime graphs, SLA compliance scores, and energy benchmarks via <strong>Intelligence</strong>.
              </p>
              <Link href="/intelligence" className="text-xs font-bold text-[#7C3AED] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore Intelligence</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand
        headline="Transform your on-ground facility operations today."
        subheadline="Deploy OfficeX CAFM across your building in under 10 days."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to FM Lead",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#2563EB"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "Facility Manager", modules: ["operate", "marketplace"] }}
      />

      <Footer />
    </div>
  );
}

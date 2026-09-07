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
import { ShieldCheck, Award, CreditCard, ArrowRight } from "lucide-react";

export default function FMVendorsJourney() {
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
            Marketplace
          </Link>
          <HeaderAuthButton />
          <button
            type="button"
            onClick={() => setSlideInOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-extrabold hover:bg-[#0c7368] transition-all cursor-pointer"
          >
            Join as Vendor
          </button>
        </div>
      </header>

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="FM Service Partner &amp; Vendor"
        dashboardHref="/vendor"
        dashboardName="Vendor Bidding &amp; Payout Portal"
      />

      <HeroSection
        badge="AUDIENCE JOURNEY — FM SERVICE PROVIDERS &amp; CONTRACTORS"
        headline="Access High-Value Commercial RFQs with Escrow-Guaranteed Payouts"
        subheadline="Grow your commercial service business with verified institutional developers and landlords."
        description="Win structured tenders across MEP, HVAC, security, and cleaning trades. Say goodbye to 90-day payment delays — funds are held in secure Razorpay escrow and released automatically upon verified milestone completion."
        primaryCta={{
          label: "Register as Verified Vendor",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Vendor Partnerships",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="VENDOR RFQ DISPATCH CONSOLE"
        visualMetrics={[
          { label: "Active RFQ Pool", value: "₹48.2L" },
          { label: "Payment Security", value: "100% Escrow" },
          { label: "Disbursement", value: "< 24 Hrs" }
        ]}
      />

      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              Why Top FM Contractors Partner with OfficeX
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-[#0F8B7D]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Zero Customer Acquisition Waste</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Receive matched RFQs tailored to your service trade, geography, and capacity directly through <strong>Marketplace</strong>.
              </p>
              <Link href="/marketplace" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Explore RFQs</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-blue-600">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Escrow Payment Protection</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Client funds are committed upfront in escrow. Complete milestones, upload job photos, and receive funds without payment chasing.
              </p>
              <Link href="/platform" className="text-xs font-bold text-blue-600 mt-4 inline-flex items-center gap-1 hover:underline">
                <span>Learn About Escrow</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <span className="text-2xl font-mono font-black text-purple-600">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Verified SLA Reputation Radar</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Every completed project builds your public performance score, winning you preferred status and repeat enterprise contracts.
              </p>
              <Link href="/marketplace" className="text-xs font-bold text-purple-600 mt-4 inline-flex items-center gap-1 hover:underline">
                <span>View Performance Radar</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand
        headline="Join India's most verified FM contractor network."
        subheadline="Register your company credentials today to access live commercial RFQs."
        primaryCta={{
          label: "Register Now",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Contact Vendor Desk",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "FM Vendor", modules: ["marketplace"] }}
      />

      <Footer />
    </div>
  );
}

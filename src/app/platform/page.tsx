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
import {
  Shield, KeyRound, CreditCard, Database,
  Cpu, Lock, Headphones, Server, ArrowRight
} from "lucide-react";

export default function PlatformPage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/platform" />

      {/* Hero */}
      <HeroSection
        badge="PLATFORM CORE &amp; INFRASTRUCTURE"
        headline="The Unified Operating Foundation for Commercial Real Estate"
        subheadline="One security model, one billing engine, and one unified data schema powering every OfficeX module."
        description="OfficeX Platform Core eliminates software fragmentation. Built on institutional security standards, modern REST APIs, and automated compliance frameworks designed specifically for Indian commercial real estate."
        primaryCta={{
          label: "Request Architecture Deck",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Engineering",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="OFFICEX CORE ARCHITECTURE"
        visualMetrics={[
          { label: "Platform Uptime", value: "99.98%" },
          { label: "Data Encryption", value: "AES-256" },
          { label: "API Latency", value: "< 45ms" }
        ]}
      />

      {/* 6 Core Capabilities */}
      <FeatureGrid
        title="Six Foundational Capabilities"
        subtitle="Every module connects to the same hardened core, ensuring instant interoperability."
        accentColor="#0F8B7D"
        features={[
          {
            icon: KeyRound,
            title: "Identity & Granular Access (RBAC)",
            description: "Role-based access control with Single Sign-On (SAML/OAuth2), multi-tenant isolation, and complete tamper-evident audit logging for institutional compliance.",
            tag: "Identity"
          },
          {
            icon: CreditCard,
            title: "Billing & Escrow Subscriptions",
            description: "Automated Razorpay escrow payment splits, automated GST e-invoicing, virtual account collections, and multi-currency billing engines.",
            tag: "Fintech"
          },
          {
            icon: Database,
            title: "Unified Data Foundation",
            description: "Single source of truth for portfolio assets, leases, IoT telemetry, and maintenance logs. Zero duplicate data entry across modules.",
            tag: "Data Lake"
          },
          {
            icon: Cpu,
            title: "Integrations & Open APIs",
            description: "Robust REST APIs and webhooks connecting directly to ERPs (SAP, Oracle, Tally), BMS hardware (Honeywell, Siemens), and IoT meters.",
            tag: "APIs"
          },
          {
            icon: Lock,
            title: "Security & DPDP Compliance",
            description: "Strict adherence to the Indian DPDP Act 2023, SOC 2 Type II certified practices, and end-to-end AES-256 data encryption at rest and in transit.",
            tag: "Security"
          },
          {
            icon: Headphones,
            title: "Institutional Support & SLAs",
            description: "Round-the-clock enterprise support desk, assigned Customer Success Managers, and contractually backed uptime commitments with credit penalties.",
            tag: "Support"
          }
        ]}
      />

      {/* Architectural Diagram Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-950 px-3.5 py-1.5 rounded-full border border-teal-800">
            SYSTEM TOPOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-4">
            Everything Connected. Zero Data Silos.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            How data flows effortlessly across the five operational layers through Platform Core.
          </p>

          <div className="mt-12 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-10 text-left">
            {/* 5 Modules Top Tier */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {[
                { name: "Marketplace", color: "#0F8B7D" },
                { name: "Operate", color: "#2563EB" },
                { name: "Manage", color: "#D97706" },
                { name: "Intelligence", color: "#7C3AED" },
                { name: "Managed Services", color: "#059669" }
              ].map((mod, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl text-center font-bold text-xs border"
                  style={{
                    backgroundColor: `${mod.color}15`,
                    borderColor: `${mod.color}40`,
                    color: mod.color
                  }}
                >
                  {mod.name}
                </div>
              ))}
            </div>

            {/* Arrows */}
            <div className="text-center text-slate-500 font-mono text-xs mb-8">
              ↓↓↓ Bi-directional Real-Time Event Bus (Kafka / Webhooks) ↓↓↓
            </div>

            {/* Platform Core Bottom Tier */}
            <div className="bg-[#071324] border border-slate-700/80 rounded-2xl p-6">
              <p className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] mb-4 text-center">
                PLATFORM CORE INFRASTRUCTURE
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                {[
                  "Identity & RBAC",
                  "Razorpay Escrow",
                  "Unified DB",
                  "REST & Webhooks",
                  "DPDP Security",
                  "Enterprise SLAs"
                ].map((cap, i) => (
                  <div key={i} className="p-3 bg-slate-800/60 rounded-xl font-semibold text-slate-300 border border-slate-700">
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTABand
        headline="Ready to build your commercial property operations on a secure core?"
        subheadline="Speak with our solutions engineering team to review our security whitepaper and API specs."
        primaryCta={{
          label: "Request Security Whitepaper",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Solutions Team",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
      />

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["not-sure"] }}
      />

      <Footer />
    </div>
  );
}

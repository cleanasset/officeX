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
        description="OfficeX Platform Core eliminates software fragmentation. Built on institutional security standards, modern REST APIs, and automated compliance frameworks designed specifically for modern commercial real estate."
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
            title: "Security & Global Compliance",
            description: "Strict adherence to enterprise data privacy acts (DPDP, GDPR), SOC 2 Type II certified practices, and end-to-end AES-256 data encryption at rest and in transit.",
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

      {/* Architectural Diagram Section: Clean, Bright Modern Enterprise Topology */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            SYSTEM TOPOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Everything Connected. Zero Data Silos.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto font-medium leading-relaxed">
            How data flows seamlessly across the five specialized modules through the unified Platform Core foundation.
          </p>

          {/* Main Architecture Diagram Container */}
          <div className="mt-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm text-left">
            {/* Tier 1: 5 Specialized Modules */}
            <div className="mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Operational Modules (Stakeholder Applications)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
              {[
                { name: "Property Discovery", sub: "Marketplace", color: "#00A86B", bg: "bg-emerald-50/70", border: "border-emerald-200", text: "text-emerald-900" },
                { name: "FM Services", sub: "Marketplace", color: "#F26522", bg: "bg-orange-50/70", border: "border-orange-200", text: "text-orange-900" },
                { name: "OfficeX PRO", sub: "Operate / CAFM", color: "#0F8B7D", bg: "bg-teal-50/70", border: "border-teal-200", text: "text-teal-900" },
                { name: "OfficeX Manage", sub: "Lease & CAM", color: "#D97706", bg: "bg-amber-50/70", border: "border-amber-200", text: "text-amber-900" },
                { name: "Intelligence & AI", sub: "Analytics & ESG", color: "#0F8B7D", bg: "bg-teal-50/70", border: "border-teal-200", text: "text-teal-900" }
              ].map((mod, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${mod.bg} ${mod.border} transition-all hover:shadow-xs`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: mod.color }} />
                    <span className={`text-xs font-black tracking-tight ${mod.text}`}>{mod.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{mod.sub}</p>
                </div>
              ))}
            </div>

            {/* Event Bus Conduit */}
            <div className="relative my-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-dashed border-slate-300" />
              </div>
              <div className="relative bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-2xs flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-ping" />
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  Bi-directional Real-Time Event Bus (Kafka • Webhooks • REST)
                </span>
              </div>
            </div>

            {/* Tier 2: Platform Core Infrastructure */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">
                    Single Hardened Foundation
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    OFFICEX PLATFORM CORE INFRASTRUCTURE
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                  <Shield size={13} className="text-[#0F8B7D]" />
                  SOC 2 Type II &amp; ISO 27001 Certified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
                {[
                  { title: "Identity & RBAC", desc: "SAML SSO & Roles", icon: KeyRound },
                  { title: "Fintech & Escrow", desc: "Milestone Payouts", icon: CreditCard },
                  { title: "Unified DB", desc: "Single Source of Truth", icon: Database },
                  { title: "REST & Webhooks", desc: "Open Integration APIs", icon: Cpu },
                  { title: "DPDP & GDPR", desc: "End-to-End AES-256", icon: Lock },
                  { title: "Enterprise SLAs", desc: "99.98% Uptime SLA", icon: Headphones }
                ].map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 bg-white rounded-xl font-medium text-slate-800 border border-slate-200 shadow-2xs hover:border-teal-300 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-2">
                        <Icon size={14} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">{cap.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">{cap.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Hardware & External ERP Integrations Bar */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Enterprise Connectors &amp; BMS Telemetry:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {["SAP S/4HANA", "Oracle NetSuite", "Honeywell BMS", "Siemens Desigo", "Schneider Electric", "Razorpay Escrow", "IoT Telemetry"].map((brand, bIdx) => (
                    <span key={bIdx} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
                      {brand}
                    </span>
                  ))}
                </div>
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

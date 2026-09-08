"use client";

import React, { useState } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HeroSection from "@/components/marketing/HeroSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import UserLandingBanner from "@/components/UserLandingBanner";
import {
  Cpu, Shield, KeyRound, Server, Network,
  Lock, ArrowRight, Zap, CheckCircle2
} from "lucide-react";

export default function ITWorkplaceTechJourney() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Top Universal Header */}
      <MarketingHeader activePath="/audiences/it" />

      {/* Post-Login Welcome & Subscription Status Banner */}
      <UserLandingBanner
        roleName="IT & Workplace Tech Lead"
        dashboardHref="/dashboard"
        dashboardName="Enterprise Tech & IoT Console"
      />

      {/* Hero */}
      <HeroSection
        badge="AUDIENCE JOURNEY — IT &amp; WORKPLACE TECHNOLOGY"
        headline="Enterprise APIs, Touchless Access &amp; Scalable IoT Infrastructure"
        subheadline="Integrate BMS telemetry, digital access credentials, and tenant workflows on an institutional security foundation."
        description="Replace fragmented proprietary building hardware with unified cloud APIs. Connect BACnet/Modbus telemetry, enforce SAML 2.0 / Okta Single Sign-On, and maintain strict DPDP Act 2023 and SOC 2 Type II compliance across your entire commercial real estate footprint."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Request Tech Architecture Call",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#2563EB"
        bgImage="/images/officex_digital_platform_v2.jpg"
        visualPlaceholderTitle="WORKPLACE TECH &amp; IOT CONSOLE"
        visualMetrics={[
          { label: "API Latency", value: "<45ms" },
          { label: "Uptime SLA", value: "99.95%" },
          { label: "Security", value: "SOC 2 Type II" }
        ]}
      />

      {/* Curated Journey Steps */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              Your Curated Journey Across OfficeX
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              How OfficeX connects physical building operational technology (OT) with enterprise cloud IT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-mono font-black text-[#2563EB]">01</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Harmonize Building OT &amp; BMS</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Connect HVAC chillers, diesel generators, energy sub-meters, and water telemetry through standardized BACnet/IP, Modbus TCP, and MQTT edge connectors directly into OfficeX.
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Connected Module: Operate &amp; Core</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-mono font-black text-[#2563EB]">02</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Deploy Touchless Tenant Access</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Provision instant QR visitor passes, NFC phone credentials, and parking boom barrier access synced in real-time with corporate tenant employee directories.
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Connected Module: Operate &amp; Workplace</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-mono font-black text-[#2563EB]">03</span>
              <h3 className="text-base font-black text-gray-900 mt-2">Enforce Institutional Security</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Stream real-time audit logs into your SIEM, enforce Okta/Azure AD SAML SSO, and ensure all data processing complies with Digital Personal Data Protection (DPDP) and SOC 2 Type II standards.
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Connected Module: Platform Core</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <FeatureGrid
        title="Enterprise Tech &amp; Developer Infrastructure"
        subtitle="Engineered for Chief Technology Officers, CISOs, and Workplace Technology Engineers."
        accentColor="#2563EB"
        features={[
          {
            icon: KeyRound,
            title: "SAML 2.0 &amp; OIDC Single Sign-On",
            description: "Seamless identity integration with Okta, Microsoft Entra ID (Azure AD), Google Workspace, and Ping Identity with fine-grained RBAC.",
            tag: "Identity"
          },
          {
            icon: Network,
            title: "Open REST APIs &amp; Webhooks",
            description: "Complete programmatic control with bi-directional webhooks for real-time lease updates, ticketing triggers, and telemetry alerts.",
            tag: "APIs"
          },
          {
            icon: Cpu,
            title: "BMS &amp; IoT Hardware Gateway",
            description: "Vendor-agnostic telemetry ingestion supporting Johnson Controls, Honeywell, Schneider Electric, and Siemens automation protocols.",
            tag: "IoT Core"
          },
          {
            icon: Shield,
            title: "DPDP Act 2023 &amp; SOC 2 Type II",
            description: "Bank-grade AES-256 encryption at rest, TLS 1.3 in transit, automated data retention schedules, and sovereign Tier-4 data center storage.",
            tag: "Compliance"
          },
          {
            icon: Server,
            title: "SIEM Audit Log Streaming",
            description: "Export tamper-proof audit trails of every visitor check-in, lease alteration, and financial transaction directly into Splunk or Datadog.",
            tag: "Security"
          },
          {
            icon: Zap,
            title: "High-Availability 99.95% SLA",
            description: "Multi-region redundant cloud infrastructure deployed on AWS Mumbai with automated failover and sub-second query response.",
            tag: "Reliability"
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#2563EB"
        headline="Ready to modernize your building technology stack?"
        subheadline="Talk with our solutions engineering team to review API docs, sandbox environments, and security whitepapers."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Solutions Engineer",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* SlideIn Enquiry */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{
          audience: "IT & Workplace Tech Lead",
          modules: ["operate"]
        }}
      />

      <Footer />
    </div>
  );
}

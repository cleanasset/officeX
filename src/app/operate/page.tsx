"use client";

import React, { useState } from "react";
import HeroSection from "@/components/marketing/HeroSection";
import ProblemSolution from "@/components/marketing/ProblemSolution";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import UseCaseSection from "@/components/marketing/UseCaseCard";
import PricingTable from "@/components/marketing/PricingTable";
import OnboardingTimeline from "@/components/marketing/OnboardingTimeline";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import FinalCTABand from "@/components/marketing/FinalCTABand";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import {
  Wrench, Calendar, LifeBuoy, Activity,
  Users, Bookmark, Smartphone, Send
} from "lucide-react";

export default function OperatePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/operate" />

      {/* Hero Section */}
      <HeroSection
        badge="OPERATE · CAFM & FACILITY OPERATIONS"
        headline="The FM Operations Platform for Grade-A Commercial Buildings"
        subheadline="52-week PPM, real-time SLA tracking, and a helpdesk your tenants will actually use."
        description="Replace paper logbooks, WhatsApp groups, and missed maintenance schedules with an institutional CAFM platform built specifically for modern commercial real estate facility teams."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        bgImage="/images/work_operate_cafm.jpg"
        customVisual={
          <div className="bg-[#0a1829]/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-5 overflow-hidden relative text-white">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-slate-400 ml-2 font-semibold">
                  app.officex.in/operate
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ● LIVE CAFM &amp; PPM
              </span>
            </div>

            {/* Live Operations & Workplace Health Score Widget */}
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    WORKPLACE HEALTH SCORE
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-teal-300">91<span className="text-xs text-slate-400 font-normal">/100</span></span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      ● Optimal Grade-A
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">CRITICAL UPTIME</span>
                  <span className="text-sm font-black text-emerald-400">99.8% MEP Uptime</span>
                </div>
              </div>

              {/* 7 Health Dimensions Sub-Components */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[10px]">
                <div className="bg-[#071324] p-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">Infrastructure</span>
                  <span className="font-bold text-white">94%</span>
                </div>
                <div className="bg-[#071324] p-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">Asset Uptime</span>
                  <span className="font-bold text-emerald-400">97%</span>
                </div>
                <div className="bg-[#071324] p-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">SLA Response</span>
                  <span className="font-bold text-teal-300">96%</span>
                </div>
                <div className="bg-[#071324] p-1.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">Occupier CSAT</span>
                  <span className="font-bold text-white">91%</span>
                </div>
              </div>

              {/* Active Ticket Dispatch Preview */}
              <div className="bg-[#071324] rounded-xl p-3 border border-slate-800 shadow-2xs mb-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded">
                    CRITICAL · Server AC Condenser Leak
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                    38m SLA Left
                  </span>
                </div>
                <p className="font-bold text-xs text-white mt-1.5">
                  Server Room A · Apex Tower Floor 3
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Assigned: Senior MEP Tech</span>
                  <span className="text-emerald-400 font-bold">Dispatched</span>
                </div>
              </div>

              {/* Asset Health Strip */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-[#071324] rounded-lg p-2 border border-slate-800 font-bold text-white">
                  <span className="block text-[9px] text-slate-400">DG SETS</span>
                  <span className="text-emerald-400 font-black">Standby 100%</span>
                </div>
                <div className="bg-[#071324] rounded-lg p-2 border border-slate-800 font-bold text-white">
                  <span className="block text-[9px] text-slate-400">HVAC AHUs</span>
                  <span className="text-emerald-400 font-black">28/28 Online</span>
                </div>
                <div className="bg-[#071324] rounded-lg p-2 border border-slate-800 font-bold text-white">
                  <span className="block text-[9px] text-slate-400">PPM TASKS</span>
                  <span className="text-teal-300 font-black">52-Wk Auto</span>
                </div>
              </div>
            </div>

            {/* Bottom Assurance */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="font-semibold text-slate-300">QR Asset Tagging Enforced</span>
              <span className="text-emerald-400 font-extrabold">✓ Zero Paper Logbooks</span>
            </div>
          </div>
        }
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Operate"
        accentColor="#0F8B7D"
        withoutItems={[
          "Missed MEP preventive maintenance leading to catastrophic chiller breakdowns, power trips, and emergency expense.",
          "Verbal tenant complaints and sticky-note work orders lost without accountability or timestamps.",
          "Zero real-time visibility into on-ground technician attendance, shift handovers, or vendor SLA adherence.",
          "Chaotic physical visitor registers causing reception bottlenecks and severe security vulnerabilities.",
          "Frustrated corporate occupiers unable to track ticket status or access transparent facility reports."
        ]}
        withItems={[
          "Automated 52-week PPM calendar auto-generated for every MEP, HVAC, DG, and fire safety asset.",
          "Digital tenant helpdesk with QR code scanning on assets, automated priority routing, and live status feeds.",
          "Real-time SLA tracking with multi-tier escalation triggers sent directly to senior facility directors.",
          "Digital visitor pre-registration and instant QR gate passes for smooth, secure lobby flow.",
          "Transparent tenant self-service portal featuring amenity booking, notice boards, and satisfaction ratings."
        ]}
      />

      {/* Key Features */}
      <FeatureGrid
        title="Comprehensive CAFM &amp; Workplace Operations"
        subtitle="Engineered for facility managers, property developers, and workplace experience directors."
        accentColor="#0F8B7D"
        features={[
          {
            icon: Wrench,
            title: "CAFM & Asset Register",
            description: "Digitize every MEP, HVAC, elevator, and electrical asset with QR codes, warranty tracking, maintenance history, and digital manuals.",
            tag: "Core"
          },
          {
            icon: Calendar,
            title: "52-Week PPM Calendar",
            description: "Auto-generate planned preventive maintenance schedules with step-by-step checklists, technician assignments, and digital sign-offs.",
            tag: "Automation"
          },
          {
            icon: LifeBuoy,
            title: "Ticketing & Helpdesk",
            description: "Intelligent multi-channel ticket ingestion (Web, App, QR, WhatsApp) with priority matrices, SLA clocks, and auto-dispatch.",
            tag: "Helpdesk"
          },
          {
            icon: Activity,
            title: "Workplace Health Score",
            description: "Dynamic composite score evaluating building operational health, uptime, statutory compliance, and occupant satisfaction.",
            tag: "Score"
          },
          {
            icon: Users,
            title: "Visitor Management",
            description: "Touchless visitor pre-invites, host notifications, QR code gate passes, and comprehensive security compliance logs.",
            tag: "Security"
          },
          {
            icon: Bookmark,
            title: "Room & Amenity Booking",
            description: "Streamlined scheduling for shared boardrooms, event spaces, sports facilities, and electric vehicle charging bays.",
            tag: "Experience"
          },
          {
            icon: Smartphone,
            title: "Tenant Experience Portal",
            description: "Dedicated mobile-responsive portal for occupants to log tickets, view building notices, review billing, and book services.",
            tag: "Tenant"
          },
          {
            icon: Send,
            title: "Automated Vendor Dispatch",
            description: "Trigger urgent emergency service dispatches to pre-contracted third-party vendors whenever internal technical teams are overloaded.",
            tag: "Dispatch"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#0F8B7D"
        useCases={[
          {
            audience: "Chief Facility Managers",
            scenario: "Managing a 1.2M sq.ft. tech park with 45 on-site technicians and over 3,000 MEP assets across 3 towers.",
            outcome: "Zero missed PPMs in 6 months, equipment downtime dropped by 42%, and tenant satisfaction scores increased to 4.8/5."
          },
          {
            audience: "Corporate Tenant Workplace Heads",
            scenario: "Frustrated by delayed AC maintenance and lack of visibility into building-wide fire drill schedules.",
            outcome: "Instant QR ticket logging from mobile phone, live updates on engineer dispatch, and transparent monthly facility summaries."
          },
          {
            audience: "Security & Operations Supervisors",
            scenario: "Handling 800+ daily visitors and contractors entering through congested basement and lobby turnstiles.",
            outcome: "Pre-registered QR check-ins reduced lobby wait times from 8 minutes to under 20 seconds with 100% digital audit trails."
          }
        ]}
      />

      {/* Pricing Table */}
      <PricingTable
        accentColor="#0F8B7D"
        title="Operate Pricing"
        subtitle="Scalable per-square-foot pricing tailored to single commercial buildings or multi-city portfolios."
        tiers={[
          {
            name: "Starter",
            price: "₹1.50",
            period: "sq.ft./month",
            description: "For standalone commercial buildings up to 50,000 sq.ft. seeking digital maintenance hygiene.",
            features: [
              "Up to 500 assets registered with QR tags",
              "52-Week PPM calendar scheduling",
              "Standard tenant ticketing helpdesk",
              "Mobile responsive technician interface",
              "Standard email & chat support"
            ],
            ctaLabel: "Get Started",
            ctaHref: "/signup?plan=operate-starter"
          },
          {
            name: "Professional",
            price: "₹2.50 - ₹3.50",
            period: "sq.ft./month",
            description: "For Grade-A commercial towers (50,000 to 250,000 sq.ft.) requiring strict SLA enforcement.",
            highlight: true,
            features: [
              "Unlimited assets & digital logbooks",
              "Automated PPM checklist enforcement",
              "Multi-level SLA escalation rules",
              "Visitor management with QR passes",
              "Meeting room & amenity booking",
              "Tenant mobile portal & feedback scoring",
              "Priority 24/7 technical assistance"
            ],
            ctaLabel: "Start Professional",
            ctaHref: "/signup?plan=operate-pro"
          },
          {
            name: "Enterprise",
            price: "₹4.00 - ₹6.00",
            period: "sq.ft./month",
            description: "For large IT parks, SEZs, and institutional REIT portfolios exceeding 250,000 sq.ft.",
            features: [
              "Custom BMS & IoT sensor telemetry integration",
              "Multi-property central control room view",
              "Custom SLA penalty automated calculations",
              "Dedicated implementation FM consultant",
              "Enterprise ERP & SAP connectors",
              "Contractually guaranteed 99.9% uptime SLA"
            ],
            ctaLabel: "Talk to Sales",
            ctaHref: "/contact?interest=operate-enterprise"
          }
        ]}
      />

      {/* Onboarding Timeline — 15-Day Process */}
      <OnboardingTimeline
        accentColor="#0F8B7D"
        title="15-Day Rapid Deployment Pipeline"
        subtitle="From physical asset tagging to complete staff training and digital go-live."
        steps={[
          {
            title: "Asset Audit & Digital QR Tagging",
            description: "Our technical team audits your MEP assets and generates unique QR code identifiers.",
            duration: "Days 1 - 4"
          },
          {
            title: "52-Week PPM Schedule Configuration",
            description: "Input OEM maintenance schedules, statutory compliance frequencies, and SLA criteria.",
            duration: "Days 5 - 8"
          },
          {
            title: "On-Ground Staff & Technician Training",
            description: "Conduct hands-on mobile training for facility technicians, supervisors, and helpdesk teams.",
            duration: "Days 9 - 12"
          },
          {
            title: "Tenant Onboarding & Go-Live",
            description: "Distribute tenant login credentials, QR lobby posters, and activate digital helpdesk.",
            duration: "Day 15 Go-Live"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "Can OfficeX Operate integrate with existing Building Management Systems (BMS)?",
            a: "Yes. OfficeX Operate supports standard BACnet, Modbus, and REST API connectors to pull telemetry from major BMS vendors including Honeywell, Siemens, Schneider Electric, and Johnson Controls."
          },
          {
            q: "Do technicians need expensive hardware to use the platform?",
            a: "No. Any standard Android or iOS smartphone works seamlessly. Technicians can scan asset QR codes, complete checklists offline, and upload photographic evidence directly."
          },
          {
            q: "What happens when an SLA response or resolution time is exceeded?",
            a: "The system automatically escalates the ticket up the chain of command (e.g. from shift technician to FM Lead to Property Director) via SMS, email, and mobile push notifications."
          },
          {
            q: "Can we manage multi-tenant buildings where occupants have different service contracts?",
            a: "Yes. OfficeX Operate supports granular multi-tenant access control with custom service catalogs, billable vs non-billable service tags, and individual tenant billing reconciliations."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#0F8B7D"
        headline="Ready to run your commercial property with institutional precision?"
        subheadline="Join leading asset owners and facility managers who have eliminated maintenance chaos with OfficeX Operate."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Our FM Experts",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["operate"] }}
      />

      <Footer />
    </div>
  );
}

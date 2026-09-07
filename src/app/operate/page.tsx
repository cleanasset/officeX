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
import {
  Wrench, Calendar, LifeBuoy, Activity,
  Users, Bookmark, Smartphone, Send
} from "lucide-react";

export default function OperatePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <HeroSection
        badge="MODULE 02 — OPERATE"
        headline="The FM Operations Platform for Grade-A Commercial Buildings"
        subheadline="52-week PPM, real-time SLA tracking, and a helpdesk your tenants will actually use."
        description="Replace paper logbooks, WhatsApp groups, and missed maintenance schedules with an institutional CAFM platform built specifically for Indian commercial real estate facility teams."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#2563EB"
        visualPlaceholderTitle="OFFICEX OPERATE CAFM CONSOLE"
        visualMetrics={[
          { label: "PPM Compliance", value: "98.7%" },
          { label: "Avg Resolution", value: "1.8 Hrs" },
          { label: "Active Assets", value: "1,420" }
        ]}
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Operate"
        accentColor="#2563EB"
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
        accentColor="#2563EB"
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
        accentColor="#2563EB"
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
        accentColor="#2563EB"
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

      {/* Onboarding Timeline */}
      <OnboardingTimeline
        accentColor="#2563EB"
        steps={[
          {
            step: "01",
            title: "Asset Audit & Digital Tagging",
            description: "Our technical team audits your MEP assets and generates unique QR code identifiers.",
            duration: "Days 1 - 3"
          },
          {
            step: "02",
            title: "52-Week PPM Configuration",
            description: "Input OEM maintenance schedules, statutory compliance frequencies, and SLA criteria.",
            duration: "Days 4 - 6"
          },
          {
            step: "03",
            title: "On-Ground Staff Training",
            description: "Conduct hands-on mobile training for facility technicians, supervisors, and helpdesk teams.",
            duration: "Days 7 - 9"
          },
          {
            step: "04",
            title: "Tenant Onboarding & Go-Live",
            description: "Distribute tenant login credentials, QR lobby posters, and activate digital helpdesk.",
            duration: "Day 10 Go-Live"
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
        accentColor="#2563EB"
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

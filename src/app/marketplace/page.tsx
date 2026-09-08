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
  Building2, Wrench, FileSpreadsheet, Cpu,
  ClipboardCheck, Radar, ShieldCheck, Briefcase
} from "lucide-react";

export default function MarketplacePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* Hero Section */}
      <HeroSection
        badge="MODULE 01 — MARKETPLACE"
        headline="India's Commercial Real Estate & FM Marketplace"
        subheadline="Discover space. Procure FM services. Transact with confidence — all verified, all transparent."
        description="Connect directly with verified Grade-A property listings and pre-vetted facility service providers. Structured RFQs, automated BOQ generation, and escrow-backed milestone payouts."
        primaryCta={{
          label: "Explore Available Spaces",
          href: "/public/search"
        }}
        secondaryCta={{
          label: "List Your Property",
          href: "/properties/add"
        }}
        accentColor="#0F8B7D"
        visualPlaceholderTitle="OFFICEX MARKETPLACE RADAR"
        visualMetrics={[
          { label: "Verified Vendors", value: "312+" },
          { label: "Active RFQs", value: "₹48.2L" },
          { label: "Escrow Protected", value: "100%" }
        ]}
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Marketplace"
        accentColor="#0F8B7D"
        withoutItems={[
          "Broker dependency with opaque brokerage commissions and stale, unverified property listings.",
          "Fragmented vendor sourcing with wild price disparities, unverified credentials, and high default risk.",
          "Manual RFQs exchanged across chaotic WhatsApp chats and spreadsheets with zero audit trails.",
          "Payment delays and milestone disputes leading to vendor walkouts and delayed project handovers.",
          "Zero historical SLA tracking or objective performance benchmarks when hiring contractors."
        ]}
        withItems={[
          "100% verified commercial listings with direct owner/manager connection and zero phantom inventory.",
          "Curated marketplace of pre-vetted FM vendors across 15+ MEP, HVAC, security, and civil trades.",
          "Structured RFQ engine with automated BOQ generation and side-by-side bid comparison matrices.",
          "Escrow-protected milestone payments via Razorpay — release funds only on verified sign-off.",
          "Transparent Vendor Performance Radar with verified customer reviews and SLA scores."
        ]}
      />

      {/* Key Features */}
      <FeatureGrid
        title="Institutional Capabilities for Space & Services"
        subtitle="End-to-end tooling designed to streamline commercial leasing discovery and procurement."
        accentColor="#0F8B7D"
        features={[
          {
            icon: Building2,
            title: "Commercial Property Discovery",
            description: "Direct discovery for verified Grade-A and Grade-B commercial assets, floor plates, statutory NOC status, and micro-market pricing benchmarks.",
            tag: "Live"
          },
          {
            icon: Wrench,
            title: "FM Vendor Marketplace",
            description: "Onboard pre-vetted contractors across MEP, HVAC AMC, integrated security, housekeeping, fire safety, and specialized civil works.",
            tag: "Live"
          },
          {
            icon: FileSpreadsheet,
            title: "Structured RFQ Engine",
            description: "Create standardized tender scopes with clear milestone definitions, submission cut-offs, and automated vendor notifications.",
            tag: "Core"
          },
          {
            icon: Cpu,
            title: "AI-Assisted BOQ Generation",
            description: "Automatically generate comprehensive Bills of Quantities based on building square footage, asset counts, and MEP specifications.",
            tag: "Coming Soon"
          },
          {
            icon: ClipboardCheck,
            title: "Work Order Management",
            description: "Digital work order creation with legally binding SLAs, penalty clauses, deliverable milestones, and change-request logging.",
            tag: "Workflow"
          },
          {
            icon: Radar,
            title: "Vendor Performance Radar",
            description: "Real-time vendor scoring across job punctuality, resolution speed, statutory compliance audits, and tenant feedback.",
            tag: "Analytics"
          },
          {
            icon: ShieldCheck,
            title: "Escrow-Protected Payments",
            description: "Integrated Razorpay escrow infrastructure ensures client funds are safeguarded and released strictly upon approved milestone completion.",
            tag: "Fintech"
          },
          {
            icon: Briefcase,
            title: "Leasing CRM for Brokers",
            description: "Dedicated dashboard for commercial leasing teams to track tenant inquiries, manage site visits, generate LOIs, and reconcile commission payouts.",
            tag: "CRM"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#0F8B7D"
        useCases={[
          {
            audience: "Building Asset Managers",
            scenario: "Needed to tender an annual HVAC & MEP maintenance contract across a 450,000 sq.ft. commercial park in Bangalore.",
            outcome: "Generated BOQ in 10 minutes, received 6 vetted bids within 4 days, and saved 18% on contracted costs with milestone escrow protection."
          },
          {
            audience: "Corporate Occupiers",
            scenario: "Expanding into 3 new regional hubs requiring rapid lease finalization, interior fit-out procurement, and immediate facility staffing.",
            outcome: "Discovered verified properties, shortlisted certified fit-out contractors, and executed work orders with transparent milestone disbursements."
          },
          {
            audience: "FM Service Vendors",
            scenario: "Facing high client acquisition costs, payment defaults from unorganized developers, and long 90-day receivable cycles.",
            outcome: "Access verified RFQ pipeline, receive advance escrow assurance, and build verified reputation scores that win enterprise business."
          }
        ]}
      />

      {/* Pricing Table */}
      <PricingTable
        accentColor="#0F8B7D"
        title="Marketplace Pricing"
        subtitle="Transparent subscription and transaction terms for occupiers, owners, and service providers."
        tiers={[
          {
            name: "Starter",
            price: "Free",
            description: "Ideal for individual property discovery and initial vendor evaluations.",
            features: [
              "Search verified commercial listings",
              "Access verified FM vendor directory",
              "Publish up to 2 RFQs per month",
              "Standard community support"
            ],
            ctaLabel: "Sign Up Free",
            ctaHref: "/signup"
          },
          {
            name: "Professional",
            price: "₹4,999",
            period: "month",
            description: "Designed for active property managers and growing facility procurement teams.",
            highlight: true,
            features: [
              "Unlimited RFQs and tender publishing",
              "AI-assisted BOQ generation",
              "Side-by-side vendor quotation comparison",
              "Razorpay escrow milestone payments",
              "Priority vendor dispatch & verification badges",
              "Dedicated account support"
            ],
            ctaLabel: "Start Professional",
            ctaHref: "/signup?plan=pro"
          },
          {
            name: "Enterprise",
            price: "Custom",
            description: "Full-scale procurement suite for institutional portfolios and large REIT assets.",
            features: [
              "Custom vendor onboarding & SLA governance",
              "Multi-property tender aggregation",
              "ERP / SAP / Oracle accounting integrations",
              "Custom escrow milestone disbursement logic",
              "Dedicated enterprise account director",
              "Contractually guaranteed SLA performance"
            ],
            ctaLabel: "Talk to Sales",
            ctaHref: "/contact?interest=marketplace-enterprise"
          }
        ]}
      />

      {/* Onboarding Timeline */}
      <OnboardingTimeline
        accentColor="#0F8B7D"
        steps={[
          {
            step: "01",
            title: "Register & Profile Setup",
            description: "Sign up as a building owner, occupier, broker, or vendor. Set up role preferences.",
            duration: "5 Minutes"
          },
          {
            step: "02",
            title: "Verification & Onboarding",
            description: "Submit property documents or vendor statutory licenses for digital KYC verification.",
            duration: "24-48 Hours"
          },
          {
            step: "03",
            title: "Publish Listing or RFQ",
            description: "Create your first space requirement or broadcast a structured service tender with BOQ.",
            duration: "15 Minutes"
          },
          {
            step: "04",
            title: "Transact with Escrow",
            description: "Compare bids side-by-side, issue digital work orders, and fund milestone escrow securely.",
            duration: "Go Live"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "How are FM vendors vetted and verified on OfficeX Marketplace?",
            a: "Every vendor undergoes a multi-point verification process including GSTIN verification, statutory PF/ESIC compliance, past client performance checks, financial stability reviews, and insurance coverage audits."
          },
          {
            q: "How does escrow payment protection work?",
            a: "When a contract or work order is awarded, funds are securely held in a dedicated Razorpay escrow account. Payment is released to the vendor only after you digitally inspect and sign off on completed milestones."
          },
          {
            q: "Can commercial brokers list and manage inventory on OfficeX?",
            a: "Yes. OfficeX provides a dedicated Leasing CRM for brokers with RERA compliance tagging, private requirement tracking, and direct co-broking collaboration tools."
          },
          {
            q: "Which commercial real estate markets are supported?",
            a: "OfficeX operates across all major commercial metros including Bengaluru, Mumbai MMR, Delhi NCR, Hyderabad, Pune, Chennai, and expanding global regions."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#0F8B7D"
        headline="Ready to streamline your CRE transactions and vendor procurement?"
        subheadline="Join hundreds of commercial owners, facility managers, and verified vendors on India's premier platform."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Our Marketplace Team",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["marketplace"] }}
      />

      <Footer />
    </div>
  );
}

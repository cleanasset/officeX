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
  Building2, ShieldCheck, FileCheck, CheckCircle2,
  TrendingUp, Users, Scale
} from "lucide-react";

export default function ManagedServicesPage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <HeroSection
        badge="MODULE 05 — MANAGED SERVICES"
        headline="Your Buildings, Managed by OfficeX"
        subheadline="On-ground Property Management and Facility Management with digital tracking, SLA accountability, and monthly MIS delivered automatically."
        description="Hand over the operational heavy-lifting to OfficeX. We deploy certified on-ground technical staff, enforce SLA-backed maintenance, manage statutory compliance renewals, and provide open-book financial reporting."
        primaryCta={{
          label: "Request Building Walkthrough",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#059669"
        visualPlaceholderTitle="OFFICEX MANAGED PORTFOLIO OPS"
        visualMetrics={[
          { label: "On-Ground SLA", value: "99.8%" },
          { label: "Cost Optimization", value: "18% Avg" },
          { label: "Staff Punctuality", value: "99.1%" }
        ]}
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Managed Services"
        accentColor="#059669"
        withoutItems={[
          "Unreliable local FM contractors cutting corners on technical staff strength and critical MEP servicing.",
          "Opaque billing with hidden markups, inflated spare part quotes, and untraceable petty cash vouchers.",
          "Inconsistent tenant experience and unresolved complaints leading to early lease terminations and vacancies.",
          "Constant owner headaches handling staff attrition, labor disputes, vendor defaults, and government notices.",
          "Zero digital accountability: building owners have no idea whether scheduled maintenance actually took place."
        ]}
        withItems={[
          "Certified on-ground engineering, housekeeping, and security teams deployed directly by OfficeX.",
          "Stringent contractually guaranteed SLAs backed by automatic financial penalties for performance lapses.",
          "100% open-book pass-through accounting with zero hidden markups on manpower or equipment procurement.",
          "Complete owner peace of mind: a dedicated Property Manager oversees daily operations, compliance, and tenant relations.",
          "Live digital visibility: every technician checklist, tenant ticket, and expenditure is recorded in real time."
        ]}
      />

      {/* Key Features */}
      <FeatureGrid
        title="Turnkey On-Ground Property &amp; Facility Operations"
        subtitle="End-to-end physical management integrated with our digital operating system."
        accentColor="#059669"
        features={[
          {
            icon: Building2,
            title: "Turnkey Property Management",
            description: "Complete operational stewardship of your commercial asset: rent collection, tenant handover, fit-out guidelines, and asset preservation.",
            tag: "Turnkey"
          },
          {
            icon: Users,
            title: "Integrated Facility Management (IFM)",
            description: "Technical MEP operations (HVAC, DG, Transformers, STP/WTP), soft services, round-the-clock physical security, and landscape maintenance.",
            tag: "IFM"
          },
          {
            icon: ShieldCheck,
            title: "SLA-Backed Performance Guarantee",
            description: "Contractually committed uptime and resolution times. If our on-ground team misses an SLA milestone, penalty credits apply automatically.",
            tag: "Accountability"
          },
          {
            icon: FileCheck,
            title: "Auto-Generated Monthly MIS",
            description: "Institutional financial and operational audit delivered to the building owner by the 5th of every month with zero delays.",
            tag: "Governance"
          },
          {
            icon: Scale,
            title: "Statutory Compliance Management",
            description: "Our legal and liaison specialists manage all renewals for Fire Safety NOC, Lift licenses, DG permissions, and municipal documentation.",
            tag: "Legal"
          },
          {
            icon: CheckCircle2,
            title: "Transparent Open-Book Billing",
            description: "All vendor invoices and utility payments are passed through at verified actual cost with a fixed, transparent management fee.",
            tag: "Finances"
          },
          {
            icon: TrendingUp,
            title: "Day-1 Revenue Optimization",
            description: "Our audit team identifies unbilled common areas, renegotiates vendor contracts, and introduces energy conservation measures.",
            tag: "Yield"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#059669"
        useCases={[
          {
            audience: "Absentee or High-Net-Worth Landlords",
            scenario: "Owning a 150,000 sq.ft. commercial office building in Gurgaon while residing overseas, struggling with unreliable local supervisors.",
            outcome: "Transferred full management to OfficeX. Received monthly audited financial MIS, on-time rent deposits, and zero operational headaches."
          },
          {
            audience: "Boutique Real Estate Developers",
            scenario: "Delivering their first commercial office project and needing Grade-A facility management to attract Fortune 500 enterprise tenants.",
            outcome: "Deployed OfficeX on-ground IFM team. Building achieved 95% occupancy within 8 months with top-tier multinational occupants."
          },
          {
            audience: "Family Offices & Holding Companies",
            scenario: "Managing 5 mixed commercial buildings with fragmented staff, high maintenance costs, and frequent compliance notices.",
            outcome: "Consolidated all assets under OfficeX Managed Services, reducing total operating expenses by 18% through bulk procurement."
          }
        ]}
      />

      {/* Pricing Table */}
      <PricingTable
        accentColor="#059669"
        title="Managed Services Pricing"
        subtitle="Transparent fee models tailored to building size, occupancy profile, and technical complexity."
        tiers={[
          {
            name: "Property Management Only",
            price: "3% - 5%",
            period: "of collections or ₹3-8/sq.ft.",
            description: "Comprehensive property oversight, rent roll collection, tenant management, and compliance governance.",
            features: [
              "Dedicated on-site Property Manager",
              "Lease administration and rent roll collection",
              "Full statutory compliance renewal management",
              "CAM calculation and reconciliation",
              "Automated monthly MIS reporting",
              "Tenant dispute resolution"
            ],
            ctaLabel: "Get PM Proposal",
            ctaHref: "/contact?interest=managed-pm"
          },
          {
            name: "Integrated FM (IFM)",
            price: "Base Fee + Markup",
            period: "10-15% manpower markup",
            description: "Complete technical operations, engineering, housekeeping, security, and maintenance manpower.",
            highlight: true,
            features: [
              "Certified MEP technicians, electricians & plumbers",
              "24/7 technical shift coverage & DG/HVAC maintenance",
              "Soft services (cleaning, housekeeping & waste mgmt)",
              "SLA-backed equipment uptime guarantee",
              "Integrated OfficeX Operate CAFM software included",
              "Open-book verified pass-through costs"
            ],
            ctaLabel: "Get IFM Proposal",
            ctaHref: "/contact?interest=managed-ifm"
          },
          {
            name: "Full Turnkey Managed Package",
            price: "Custom",
            description: "The complete commercial operating solution: PM + IFM + Leasing Representation + Guaranteed SLAs.",
            features: [
              "End-to-end property stewardship & technical IFM",
              "Exclusive leasing representation via Marketplace",
              "Guaranteed maintenance response SLAs with penalties",
              "Capital expenditure planning & energy audit",
              "Direct board representation & executive briefings",
              "Institutional ESG reporting & certifications"
            ],
            ctaLabel: "Talk to Sales",
            ctaHref: "/contact?interest=managed-turnkey"
          }
        ]}
      />

      {/* Onboarding Timeline */}
      <OnboardingTimeline
        accentColor="#059669"
        steps={[
          {
            step: "01",
            title: "Comprehensive Building Audit",
            description: "Our senior technical engineers inspect all MEP plants, structural assets, and compliance files.",
            duration: "Days 1 - 5"
          },
          {
            step: "02",
            title: "Scope Definition & SLA Agreement",
            description: "Finalize staffing rosters, maintenance scopes, response SLAs, and transparent fee schedules.",
            duration: "Days 6 - 10"
          },
          {
            step: "03",
            title: "Staff Mobilization & Shadowing",
            description: "Deploy certified technicians, conduct asset taggings, and transition shift operations smoothly.",
            duration: "Days 11 - 25"
          },
          {
            step: "04",
            title: "Digital Handover & Go-Live",
            description: "Activate OfficeX Operate CAFM, distribute tenant onboarding packs, and initiate live management.",
            duration: "Day 30 Go-Live"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "How does OfficeX Managed Services differ from traditional FM vendors?",
            a: "Traditional FM companies only provide manpower without digital accountability or owner alignment. OfficeX combines seasoned on-ground engineering teams with proprietary software, contractually guaranteed SLAs, and open-book financial transparency."
          },
          {
            q: "Can OfficeX transition and retain our existing trusted on-ground technicians?",
            a: "Yes. Following a technical evaluation and background verification, we can absorb your existing high-performing technical staff into the OfficeX roster with structured training and benefits."
          },
          {
            q: "What does open-book billing mean in practice?",
            a: "You receive all original invoices from third-party vendors (such as diesel suppliers, elevator AMC contractors, or consumable suppliers) at actual pass-through cost without arbitrary markups. Our fee is completely transparent."
          },
          {
            q: "What emergency response capabilities does OfficeX provide?",
            a: "We maintain 24/7 technical on-call engineering desks in every metro region to support on-site staff during critical electrical trips, chiller shutdowns, or plumbing floods within 60 minutes."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#059669"
        headline="Ready to experience world-class, hassle-free property management?"
        subheadline="Schedule a physical building audit with our commercial engineering team today."
        primaryCta={{
          label: "Schedule Property Audit",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Managed Services Team",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["managed-services"] }}
      />

      <Footer />
    </div>
  );
}

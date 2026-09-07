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
  Receipt, Landmark, ShieldAlert, FileText,
  Boxes, Building, BarChart3
} from "lucide-react";

export default function ManagePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/manage" />

      {/* Hero Section */}
      <HeroSection
        badge="MODULE 03 — MANAGE"
        headline="The Property Management Platform for Indian Commercial Real Estate"
        subheadline="Automate rent roll, track compliance, and never miss a renewal again."
        description="Eliminate spreadsheet chaos and compliance vulnerabilities. Digitize lease agreements, automate CAM billing, track statutory NOC renewals, and generate board-ready MIS reports in minutes."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#D97706"
        visualPlaceholderTitle="OFFICEX MANAGE PORTFOLIO CONSOLE"
        visualMetrics={[
          { label: "Collection Rate", value: "99.2%" },
          { label: "Compliance Score", value: "100%" },
          { label: "Automated MIS", value: "< 2 Mins" }
        ]}
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Manage"
        accentColor="#D97706"
        withoutItems={[
          "Manual rent rolls in fragile spreadsheets causing missed rent escalations, uncollected CAM dues, and revenue leakage.",
          "Overlooked statutory clearance dates (Fire NOC, Lift licenses, PCB approvals) risking punitive government sealing orders.",
          "Bitter disputes with corporate occupiers over opaque, unverifiable CAM allocation and utility calculations.",
          "Scattered paper lease deeds and missing addendums making due diligence and refinancing agonizingly slow.",
          "Days wasted every month manually compiling piecemeal MIS decks for asset owners and board presentations."
        ]}
        withItems={[
          "Automated rent roll with integrated Razorpay collection links, instant receipts, and auto-reconciliation.",
          "Comprehensive statutory compliance radar with proactive 90/60/30-day renewal alerts and document lockers.",
          "Transparent, audit-proof CAM reconciliation engines with formula-based sub-meter utility allocations.",
          "Centralized digital lease registry with automated alerts for lock-ins, renewal windows, and bank guarantee expirations.",
          "One-click auto-generated monthly MIS packages delivered directly to owners and institutional investors."
        ]}
      />

      {/* Key Features */}
      <FeatureGrid
        title="Institutional Property Management &amp; Lease Governance"
        subtitle="Engineered for commercial landlords, asset managers, and property management companies."
        accentColor="#D97706"
        features={[
          {
            icon: Receipt,
            title: "Rent Roll & CAM Billing",
            description: "Automate monthly rent roll generation, complex CAM allocation formulas, HVAC BTU charges, and statutory GST e-invoicing.",
            tag: "Billing"
          },
          {
            icon: Landmark,
            title: "Collections & Receivables",
            description: "Integrated payment gateways via Razorpay with automated payment reminders, virtual account routing, and aging analysis.",
            tag: "Collections"
          },
          {
            icon: ShieldAlert,
            title: "Statutory Compliance Tracker",
            description: "Proactive tracking for 40+ statutory obligations: Fire NOC, Lift Licenses, DG clearances, PCB approvals, and property taxes.",
            tag: "Compliance"
          },
          {
            icon: FileText,
            title: "Tenant & Lease Management",
            description: "Store digital lease agreements, track rent escalations, manage security deposits, and automate expiry notices.",
            tag: "Leasing"
          },
          {
            icon: Boxes,
            title: "Asset Register & Depreciation",
            description: "Comprehensive capital asset cataloging with warranty tracking, physical location tags, and statutory depreciation schedules.",
            tag: "Assets"
          },
          {
            icon: Building,
            title: "Property Master Registry",
            description: "Institutional repository of property metrics: sanctioned FAR, chargeable vs carpet areas, parking allocations, and floor stacks.",
            tag: "Master Data"
          },
          {
            icon: BarChart3,
            title: "Auto-Generated MIS Reports",
            description: "Institutional-grade financial summaries, rent collection variances, vacancy analysis, and compliance audit packages generated on demand.",
            tag: "Reporting"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#D97706"
        useCases={[
          {
            audience: "Commercial Property Owners",
            scenario: "Owning 3 multi-tenanted commercial office buildings with 42 tenants and frequent delayed rental disbursements.",
            outcome: "Automated rent roll and Razorpay links shortened average collection cycles from 28 days to 4 days with zero manual chasing."
          },
          {
            audience: "Property Management Firms",
            scenario: "Managing compliance and CAM billing across 15 commercial assets with disparate municipal jurisdictions.",
            outcome: "Automated 90-day compliance notifications ensured 100% on-time Fire NOC renewals and zero statutory fines."
          },
          {
            audience: "Institutional Real Estate Investors",
            scenario: "Requiring consistent quarterly financial reporting and audit-ready tenant billing data across an acquired office portfolio.",
            outcome: "Automated monthly MIS delivery reduced financial close time from 3 weeks to 2 business days."
          }
        ]}
      />

      {/* Pricing Table */}
      <PricingTable
        accentColor="#D97706"
        title="Manage Pricing"
        subtitle="Transparent per-square-foot pricing designed for commercial property portfolios."
        tiers={[
          {
            name: "Starter",
            price: "Free",
            period: "with Marketplace Pro",
            description: "Basic lease register and manual rent roll generation for single-property owners.",
            features: [
              "Up to 10 active leases stored digitally",
              "Manual rent roll & invoice generation",
              "Standard statutory compliance checklists",
              "Basic collection ledger"
            ],
            ctaLabel: "Included in Pro",
            ctaHref: "/signup?plan=pro"
          },
          {
            name: "Professional",
            price: "₹2.50 - ₹3.50",
            period: "sq.ft./month",
            description: "Comprehensive property management and compliance engine for Grade-A assets.",
            highlight: true,
            features: [
              "Unlimited leases & tenant profiles",
              "Automated CAM billing & utility allocations",
              "Statutory compliance alert engine (90/60/30 days)",
              "Razorpay online collections & auto-receipting",
              "Digital lease repository with document locker",
              "Auto-generated monthly MIS reporting",
              "Priority phone & email support"
            ],
            ctaLabel: "Start Professional",
            ctaHref: "/signup?plan=manage-pro"
          },
          {
            name: "Enterprise",
            price: "Custom",
            description: "For institutional funds, developers, and REIT portfolios with complex corporate structures.",
            features: [
              "Multi-entity consolidation & SPV accounting",
              "Custom ERP / SAP / Tally Prime integration",
              "Bespoke investor reporting templates",
              "Dedicated compliance audit specialist",
              "Full white-label landlord & tenant portal",
              "24/7 dedicated enterprise SLA"
            ],
            ctaLabel: "Talk to Sales",
            ctaHref: "/contact?interest=manage-enterprise"
          }
        ]}
      />

      {/* Onboarding Timeline */}
      <OnboardingTimeline
        accentColor="#D97706"
        steps={[
          {
            step: "01",
            title: "Lease Digitization & Ingestion",
            description: "Upload existing lease deeds, tenant profiles, and deposit records into the digital registry.",
            duration: "Days 1 - 3"
          },
          {
            step: "02",
            title: "Compliance Audit & Alerts Setup",
            description: "Input statutory NOCs, lift certifications, and fire licenses to activate proactive alert clocks.",
            duration: "Days 4 - 5"
          },
          {
            step: "03",
            title: "Billing Rules & Payment Sync",
            description: "Configure CAM formulas, utility sub-meter logic, and connect Razorpay collection accounts.",
            duration: "Days 6 - 7"
          },
          {
            step: "04",
            title: "First Automated Rent Roll",
            description: "Generate and dispatch your first digital rent roll and begin collecting dues seamlessly.",
            duration: "Day 8 Go-Live"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "How does OfficeX Manage handle complex CAM billing formulas?",
            a: "The platform supports all standard commercial billing methods: proportionate super built-up area allocation, actual sub-meter consumption, fixed per-sq.ft. charges, and hybrid models with true-up reconciliations."
          },
          {
            q: "Does OfficeX Manage support Indian GST and TDS compliance?",
            a: "Yes. All invoices generated comply with Indian GST requirements (including e-invoicing standards and HSN/SAC codes). Inbuilt TDS tracking allows landlords and tenants to reconcile 194I tax deductions seamlessly."
          },
          {
            q: "Which statutory clearances are tracked out-of-the-box?",
            a: "Over 40 statutory requirements are pre-configured including Fire Safety NOC, Lift License renewals, DG stack emission tests, State Pollution Control Board consents, and municipal property tax schedules."
          },
          {
            q: "Can institutional investors and lenders access read-only compliance records?",
            a: "Yes. Granular role-based access control allows you to invite auditors, bankers, and investment partners with read-only permissions to inspect lease rolls and compliance vaults."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#D97706"
        headline="Ready to eliminate rent leakage and compliance risks across your portfolio?"
        subheadline="Join forward-thinking property owners and asset managers who manage their commercial properties with OfficeX."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Our Property Management Team",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["manage"] }}
      />

      <Footer />
    </div>
  );
}

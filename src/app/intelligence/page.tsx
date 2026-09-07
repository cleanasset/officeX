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
  LineChart, Zap, FileSpreadsheet, Bot,
  Activity, LayoutGrid, Award, Info
} from "lucide-react";

export default function IntelligencePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/intelligence" />

      {/* Phase 2 Transparency Banner */}
      <div className="bg-purple-50 border-b border-purple-200 py-2.5 px-4 text-center text-xs text-purple-900 font-medium">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <Info size={14} className="text-purple-600" />
          Roadmap Transparency:
        </span>{" "}
        Core Analytics &amp; ESG are live. Advanced Predictive AI features roll out in H2 2026 as operational telemetry accumulates.
      </div>

      {/* Hero Section */}
      <HeroSection
        badge="MODULE 04 — INTELLIGENCE"
        headline="Data-Driven Intelligence for Commercial Real Estate"
        subheadline="Stop guessing. Start benchmarking. Know your NOI before your accountant does."
        description="Unify leasing rolls, asset maintenance logs, utility telemetry, and tenant feedback into institutional executive dashboards. Make capital allocation decisions based on verified operational facts."
        primaryCta={{
          label: "Explore Analytics Demo",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#7C3AED"
        visualPlaceholderTitle="OFFICEX PORTFOLIO INTELLIGENCE ENGINE"
        visualMetrics={[
          { label: "Portfolio NOI", value: "₹14.2 Cr" },
          { label: "Energy Index", value: "-14% YoY" },
          { label: "Avg WALE", value: "4.2 Yrs" }
        ]}
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Intelligence"
        accentColor="#7C3AED"
        withoutItems={[
          "Siloed operational data trapped across paper logbooks, utility bills, and disconnected Excel sheets.",
          "Zero real-time visibility into portfolio-wide NOI, Net Absorption, or Weighted Average Lease Expiry (WALE).",
          "Manual, error-prone ESG calculations resulting in missed sustainability targets and investor audit penalties.",
          "Purely reactive maintenance: equipment failures discovered only after catastrophic chiller or DG breakdowns.",
          "Weeks lost every quarter cutting and splicing static charts for board meetings and investor presentations."
        ]}
        withItems={[
          "Unified commercial data foundation integrating leasing, collections, PPM compliance, and utility meters.",
          "Live institutional dashboards tracking portfolio yield, occupancy velocity, and collection variance.",
          "Automated ESG & Energy analytics aligned with SEBI BRSR Core and global GRESB reporting standards.",
          "Predictive equipment telemetry identifying anomalies and maintenance needs before critical failure.",
          "Custom automated reporting engine delivering executive PDF summaries directly to stakeholder inboxes."
        ]}
      />

      {/* Key Features */}
      <FeatureGrid
        title="Institutional Analytics &amp; ESG Intelligence"
        subtitle="Designed for asset managers, investment funds, and sustainability directors."
        accentColor="#7C3AED"
        features={[
          {
            icon: LineChart,
            title: "Portfolio Analytics Dashboard",
            description: "Real-time tracking of Net Operating Income (NOI), WALE, physical occupancy vs economic occupancy, and rent collection yield.",
            tag: "Live Feature"
          },
          {
            icon: Zap,
            title: "Energy & Utility Benchmarking",
            description: "Granular energy consumption tracking (kWh/sq.ft.), diesel generator efficiency, water balance, and peer park comparisons.",
            tag: "Live Feature"
          },
          {
            icon: Award,
            title: "ESG & BRSR Reporting",
            description: "Automated carbon intensity metrics and ESG audit documentation ready for SEBI BRSR and international institutional fund mandates.",
            tag: "Live Feature"
          },
          {
            icon: Bot,
            title: "Natural Language AI Assistant",
            description: "Query your portfolio in plain English: 'Which leases in Tower B expire within 6 months?' or 'Summarize HVAC maintenance spend.'",
            phase2: true
          },
          {
            icon: Activity,
            title: "Predictive Maintenance Radar",
            description: "Machine learning anomaly detection based on sensor telemetry, run-hours, and vibration patterns to forecast equipment failure.",
            phase2: true
          },
          {
            icon: LayoutGrid,
            title: "Custom Report Builder",
            description: "Flexible drag-and-drop report designer with scheduled automated PDF exports to Lenders, Trustees, and Board Members.",
            tag: "Live Feature"
          },
          {
            icon: FileSpreadsheet,
            title: "Vendor SLA Quartile Benchmarking",
            description: "Objective cross-vendor performance analytics evaluating work completion speed, response SLA compliance, and cost variance.",
            tag: "Live Feature"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#7C3AED"
        useCases={[
          {
            audience: "Private Equity Real Estate Funds",
            scenario: "Evaluating capital expenditure decisions and asset refinancing terms across a 4-asset office portfolio in Pune and Hyderabad.",
            outcome: "Instant access to standardized NOI, WALE, and rent roll analytics accelerated refinancing negotiations by 6 weeks."
          },
          {
            audience: "ESG & Sustainability Officers",
            scenario: "Mandated to submit annual SEBI BRSR disclosures and achieve IGBC Platinum recertification.",
            outcome: "Automated utility meter ingestion eliminated 120 hours of manual spreadsheet compilation with 100% auditable utility records."
          },
          {
            audience: "Portfolio Asset Directors",
            scenario: "Comparing facility management vendor performance across 12 commercial properties to renegotiate master service contracts.",
            outcome: "Objective SLA quartile data identified underperforming contractors and unlocked ₹45L in SLA penalty clawbacks and volume discounts."
          }
        ]}
      />

      {/* Pricing Table */}
      <PricingTable
        accentColor="#7C3AED"
        title="Intelligence Pricing"
        subtitle="Portfolio-level analytics tiers designed for commercial asset owners and institutional investment funds."
        tiers={[
          {
            name: "Standard Analytics",
            price: "Free",
            period: "with Professional",
            description: "Essential portfolio analytics and standard monthly reporting for single-building owners.",
            features: [
              "Portfolio occupancy and WALE tracking",
              "Standard energy and water consumption charts",
              "Pre-built monthly PDF MIS export",
              "Quarterly vendor SLA summary"
            ],
            ctaLabel: "Included in Pro",
            ctaHref: "/signup?plan=pro"
          },
          {
            name: "Intelligence Add-on",
            price: "₹1L - ₹5L",
            period: "building/year",
            description: "Advanced ESG compliance, custom KPI builder, and predictive maintenance capabilities.",
            highlight: true,
            features: [
              "SEBI BRSR and GRESB ESG reporting packs",
              "Custom financial KPI builder & alerts",
              "Utility sub-meter IoT telemetry connectors",
              "Vendor performance quartile benchmarking",
              "Early access to Phase 2 AI Assistant",
              "Dedicated data analyst support"
            ],
            ctaLabel: "Add Intelligence",
            ctaHref: "/contact?interest=intelligence-addon"
          },
          {
            name: "Institutional Enterprise",
            price: "Custom",
            description: "Dedicated data warehouse and multi-fund business intelligence architecture.",
            features: [
              "Direct Snowflake / BigQuery / Databricks sync",
              "Multi-entity fund consolidation & waterfall modeling",
              "Custom machine learning predictive models",
              "Automated quarterly investor portal feeds",
              "Dedicated enterprise data engineer",
              "Full SOC 2 Type II data isolation guarantee"
            ],
            ctaLabel: "Talk to Sales",
            ctaHref: "/contact?interest=intelligence-enterprise"
          }
        ]}
      />

      {/* Onboarding Timeline */}
      <OnboardingTimeline
        accentColor="#7C3AED"
        steps={[
          {
            step: "01",
            title: "Historical Data Ingestion",
            description: "Import historical rent rolls, electricity bills, and maintenance logs to build baseline data.",
            duration: "Days 1 - 7"
          },
          {
            step: "02",
            title: "Target & KPI Baselining",
            description: "Define financial hurdle rates, energy intensity targets (kWh/sq.ft.), and SLA thresholds.",
            duration: "Days 8 - 14"
          },
          {
            step: "03",
            title: "Executive Dashboard Setup",
            description: "Customize executive views for Owners, Asset Managers, and ESG Sustainability committees.",
            duration: "Days 15 - 20"
          },
          {
            step: "04",
            title: "Automated Cadence & Go-Live",
            description: "Schedule automated weekly digests and monthly board packs distributed seamlessly.",
            duration: "Day 21 Go-Live"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "Why is the full AI assistant phased for late 2026?",
            a: "Enterprise-grade predictive AI and natural language queries require at least 9-12 months of high-fidelity operational data (PPM logs, tenant work orders, and sensor telemetry) to generate statistically reliable insights without hallucinations."
          },
          {
            q: "Can we export data to Microsoft PowerBI, Tableau, or Snowflake?",
            a: "Yes. OfficeX Intelligence provides automated daily sync connectors via REST APIs, webhook events, and direct secure SQL read replicas for enterprise BI stacks."
          },
          {
            q: "Does the platform support Indian SEBI BRSR and global ESG standards?",
            a: "Yes. Pre-configured templates generate auditable Scope 1 and Scope 2 carbon footprint summaries aligned with SEBI BRSR Core guidelines as well as international GRESB and LEED requirements."
          },
          {
            q: "Is operational data shared across different building owners?",
            a: "Never. All client operational data is encrypted at rest using AES-256 and strictly tenant-isolated. Anonymized benchmarking figures only compute aggregate city-level medians without revealing individual asset identities."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#7C3AED"
        headline="Ready to turn operational data into institutional alpha?"
        subheadline="Join institutional owners and asset managers who rely on OfficeX Intelligence for high-conviction decision making."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Talk to Our Analytics Team",
          onClick: () => setSlideInOpen(true)
        }}
      />

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["intelligence"] }}
      />

      <Footer />
    </div>
  );
}

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
        badge="MANAGE · PROPERTY & LEASE GOVERNANCE"
        headline="The Property Management Platform for Commercial Real Estate"
        subheadline="Automate rent roll, CAM billing, compliance tracking, and MIS reporting — never miss a renewal again."
        description="Eliminate spreadsheet chaos and compliance vulnerabilities. Digitize lease agreements, automate CAM billing, track statutory NOC renewals, and generate board-ready MIS reports in minutes."
        primaryCta={{
          label: "Start Free Trial",
          href: "/signup"
        }}
        secondaryCta={{
          label: "Raise an Enquiry",
          onClick: () => setSlideInOpen(true)
        }}
        accentColor="#0F8B7D"
        bgImage="/images/work_manage_governance.jpg"
        customVisual={
          <div className="bg-[#0a1829]/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-5 overflow-hidden relative text-white">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-slate-400 ml-2 font-semibold">
                  app.officex.in/manage
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ● RENT ROLL &amp; COMPLIANCE
              </span>
            </div>

            {/* Live Rent Roll Ledger Card */}
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    MONTHLY COLLECTION RECOVERY
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-white">₹4.82 Cr</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      99.4% On-Time
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">ACTIVE LEASES</span>
                  <span className="text-sm font-black text-white">48 Units</span>
                </div>
              </div>

              {/* Tenant Ledger Rows */}
              <div className="space-y-2">
                <div className="bg-[#071324] rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs shadow-2xs">
                  <div>
                    <span className="font-extrabold text-white block">Google Enterprise Services</span>
                    <span className="text-[10px] text-slate-400 font-medium">Floor 8 · Entire Plate · 32k SqFt</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">₹84,77,120</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">Cleared RTGS</span>
                  </div>
                </div>

                <div className="bg-[#071324] rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs shadow-2xs">
                  <div>
                    <span className="font-extrabold text-white block">Tata Digital Limited</span>
                    <span className="text-[10px] text-slate-400 font-medium">Floor 5 · East Wing · 24k SqFt</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">₹63,24,800</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">Auto-Reconciled</span>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Strip */}
              <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-[#071324] rounded-lg p-1.5 border border-slate-800 font-bold text-emerald-400">
                  Fire NOC: 100% Valid
                </div>
                <div className="bg-[#071324] rounded-lg p-1.5 border border-slate-800 font-bold text-emerald-400">
                  Lift License: Active
                </div>
                <div className="bg-[#071324] rounded-lg p-1.5 border border-slate-800 font-bold text-teal-300">
                  CAM: GST Auto-Billed
                </div>
              </div>
            </div>

            {/* Bottom Assurance */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="font-semibold text-slate-300">Audit-Ready Statutory Vault</span>
              <span className="text-emerald-400 font-extrabold">✓ Zero Revenue Leakage</span>
            </div>
          </div>
        }
      />

      {/* Problem / Solution */}
      <ProblemSolution
        moduleName="Manage"
        accentColor="#0F8B7D"
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
        accentColor="#0F8B7D"
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
        accentColor="#0F8B7D"
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
        accentColor="#0F8B7D"
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
        accentColor="#0F8B7D"
        title="Same-Day Property &amp; Lease Activation"
        subtitle="Zero 15-day delays. Digitize leases, configure CAM billing formulas, and begin automated collections in a single day."
        steps={[
          {
            title: "Lease Data Ingestion",
            description: "Upload existing lease deeds, tenant profiles, and deposit records into the digital registry.",
            duration: "Hour 1"
          },
          {
            title: "Compliance Audit & Alerts",
            description: "Input statutory NOCs, lift certifications, and fire licenses to activate proactive alert radar.",
            duration: "Hour 2"
          },
          {
            title: "Billing Rules & Payment Sync",
            description: "Configure CAM formulas, utility sub-meter logic, and connect collection accounts.",
            duration: "Hour 3"
          },
          {
            title: "Automated Rent Roll Go-Live",
            description: "Generate and dispatch your first digital rent roll and begin collecting dues on day one.",
            duration: "Same-Day Active"
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
            q: "Does OfficeX Manage support statutory tax, GST, and TDS compliance?",
            a: "Yes. All invoices generated comply with statutory GST requirements (including e-invoicing standards and HSN/SAC codes). Inbuilt TDS tracking allows landlords and tenants to reconcile tax deductions seamlessly."
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
        accentColor="#0F8B7D"
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

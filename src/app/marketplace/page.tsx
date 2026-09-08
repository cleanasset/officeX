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
  Building2, Calendar, FileText, Handshake,
  CheckCircle2, KeyRound, ShieldCheck, Search
} from "lucide-react";

export default function PropertyMarketplacePage() {
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* Hero Section — Dedicated Commercial Property Marketplace */}
      <HeroSection
        badge="PROPERTY MARKETPLACE · SPACE LEASING"
        headline="Commercial Real Estate Discovery & Leasing Marketplace"
        subheadline="Discover space. Schedule site visits. Negotiate deals, sign LOIs, and execute leases — all verified, all transparent."
        description="Connect directly with verified Grade-A tech parks, bare-shell floors, and managed enterprise suites. Zero phantom inventory, direct landlord collaboration, and structured digital lease execution."
        primaryCta={{
          label: "Explore Commercial Spaces",
          href: "/public/search"
        }}
        secondaryCta={{
          label: "List Your Property",
          href: "/properties/add"
        }}
        accentColor="#0F8B7D"
        bgImage="/images/officex_hero_atrium_clean.jpg"
        customVisual={
          <div className="bg-[#0a1829]/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-5 overflow-hidden relative text-white">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-slate-400 ml-2 font-semibold">
                  app.officex.in/marketplace
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ● LIVE DEAL ROOM
              </span>
            </div>

            {/* Verified Listing Preview Card */}
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 mb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-md border border-teal-500/30">
                    Grade-A+ Commercial Suite
                  </span>
                  <h3 className="text-base font-black text-white mt-1.5">
                    Apex Horizon Tower · Floor 8 Plate
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Central Business District · Prime Transit Corridor
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white block">₹185</span>
                  <span className="text-[10px] font-bold text-slate-400">/sq.ft./month</span>
                </div>
              </div>

              {/* Specs Pill Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
                <div className="bg-[#071324] rounded-xl p-2 border border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">AREA</span>
                  <span className="text-xs font-black text-white">32,000 SqFt</span>
                </div>
                <div className="bg-[#071324] rounded-xl p-2 border border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">SEATS</span>
                  <span className="text-xs font-black text-white">240 Workstations</span>
                </div>
                <div className="bg-[#071324] rounded-xl p-2 border border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">STATUS</span>
                  <span className="text-xs font-black text-emerald-400">Immediate Move-in</span>
                </div>
              </div>

              {/* Action Buttons Mockup */}
              <div className="grid grid-cols-2 gap-2 mt-3.5">
                <div className="py-2 px-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <span>📅 Schedule Site Visit</span>
                </div>
                <div className="py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <span>📝 Digital LOI Deal Room</span>
                </div>
              </div>
            </div>

            {/* Bottom Assurance */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="font-semibold text-slate-300">100% Direct Landlord Representation</span>
              <span className="text-emerald-400 font-extrabold">✓ Zero Phantom Listings</span>
            </div>
          </div>
        }
      />

      {/* Problem / Solution — Commercial Property Leasing */}
      <ProblemSolution
        moduleName="Property Marketplace"
        accentColor="#0F8B7D"
        withoutItems={[
          "Broker dependency with inflated commission layers and 40%+ phantom or outdated commercial listings.",
          "Endless back-and-forth WhatsApp threads to schedule physical site visits and verify floorplates.",
          "Opaque commercial negotiations with zero visibility into micro-market benchmark rentals or CAM charges.",
          "Weeks lost drafting, redlining, and couriering physical Letters of Intent (LOIs) and term sheets.",
          "Zero upfront disclosure on statutory NOCs (Fire, Lift, Occupancy) leading to fit-out and handover delays."
        ]}
        withItems={[
          "100% verified commercial listings direct from institutional landlords, REITs, and Grade-A developers.",
          "Instant digital site visit scheduling with verified floorplans, 3D virtual walkthroughs, and stacking charts.",
          "Transparent commercial deal room with real-time rental comparisons, CAM breakdowns, and deposit terms.",
          "Automated digital LOI generator with legally vetted standard covenants and instant e-signatures.",
          "Pre-verified building passports with live statutory compliance documentation and utility capacity audits."
        ]}
      />

      {/* Key Features — The 6 Core Stages of Property Marketplace */}
      <FeatureGrid
        title="End-to-End Commercial Leasing Workflow"
        subtitle="Engineered to guide occupiers and landlords seamlessly from initial discovery to digital lease execution."
        accentColor="#0F8B7D"
        features={[
          {
            icon: Search,
            title: "1. Discover Property",
            description: "Search verified Grade-A & B tech parks, warm shells, bare shells, and plug-and-play enterprise workspaces filtered by city, sub-market, carpet area, and budget.",
            tag: "Discovery"
          },
          {
            icon: KeyRound,
            title: "2. Lease & Buy Options",
            description: "Flexible transaction structures for long-term institutional leases, short-term project suites, pre-commitments, and outright commercial asset acquisitions.",
            tag: "Transaction"
          },
          {
            icon: Calendar,
            title: "3. Site Visit Scheduling",
            description: "Book guided physical inspections or 3D digital walkthroughs. Automated calendar invites, visitor gate passes, and on-site property manager notifications.",
            tag: "Inspection"
          },
          {
            icon: Handshake,
            title: "4. Deal Room & Negotiations",
            description: "Collaborative digital workspace to negotiate base rentals, fit-out rent-free periods, CAM escalations, lock-in terms, and security deposit schedules.",
            tag: "Deal Room"
          },
          {
            icon: FileText,
            title: "5. Digital LOI Generation",
            description: "Generate institutional Letters of Intent in minutes with pre-approved legal clauses, commercial milestones, and secure Aadhaar / DocuSign e-signatures.",
            tag: "LOI Engine"
          },
          {
            icon: CheckCircle2,
            title: "6. Lease Execution & Handover",
            description: "Finalize standard commercial lease agreements with statutory stamp duty integration, milestone escrow, and automated transition into OfficeX Operate for fit-out.",
            tag: "Execution"
          }
        ]}
      />

      {/* Use Cases */}
      <UseCaseSection
        accentColor="#0F8B7D"
        useCases={[
          {
            audience: "Corporate Real Estate Directors",
            scenario: "Consolidating 65,000 sq.ft. of regional office space across Gurgaon and Bengaluru within a strict 60-day lease expiry deadline.",
            outcome: "Shortlisted 8 verified tech park options, booked instant site visits, negotiated commercial terms, and executed digital LOIs in under 18 days."
          },
          {
            audience: "Commercial Asset Owners & REITs",
            scenario: "Struggling with 18% vacancy in newly completed Grade-A office towers due to broker fragmentation and stale aggregator listings.",
            outcome: "Published verified floorplate listings, received pre-qualified occupier inquiries, and closed 3 enterprise leases with zero broker overlap."
          },
          {
            audience: "Enterprise Managed Space Providers",
            scenario: "Seeking to pre-lease 250+ dedicated enterprise seats to venture-backed tech firms and multinational satellite teams.",
            outcome: "Showcased verified plug-and-play workspaces with transparent all-inclusive per-seat pricing, reducing sales cycle from 90 days to 2 weeks."
          }
        ]}
      />

      {/* Plans / Pricing */}
      <PricingTable
        accentColor="#0F8B7D"
        title="Property Marketplace Pricing"
        subtitle="Transparent terms for occupiers, landlords, and commercial leasing brokers."
        tiers={[
          {
            name: "Occupier / Space Seeker",
            price: "Free",
            description: "For corporate tenants and occupiers searching for commercial office spaces.",
            features: [
              "Search 100% verified commercial listings",
              "Unlimited site visit scheduling & gate passes",
              "Direct communication with asset owners",
              "Access verified building compliance documents",
              "Digital LOI generation and e-signing"
            ],
            ctaLabel: "Start Searching Free",
            ctaHref: "/public/search"
          },
          {
            name: "Landlord / Asset Owner",
            price: "₹9,999",
            period: "property / month",
            description: "For commercial building owners, developers, and asset managers looking to lease space.",
            highlight: true,
            features: [
              "Verified Listing Badge & high-priority ranking",
              "Floorplate stacking charts & 3D tour hosting",
              "Direct occupier inquiry management & lead qualification",
              "Digital Deal Room with term sheet negotiation",
              "Automated LOI & lease agreement generation",
              "Dedicated leasing account manager"
            ],
            ctaLabel: "List Your Commercial Space",
            ctaHref: "/properties/add"
          },
          {
            name: "Enterprise Portfolio",
            price: "Custom",
            description: "For institutional funds, developers, and REITs managing 500,000+ sq.ft.",
            features: [
              "Multi-building portfolio leasing portal",
              "API integration with existing ERP / Yardi / MRI",
              "Custom co-broking commission reconciliation",
              "Automated vacant space marketing syndication",
              "Institutional legal and lease compliance workflows",
              "Dedicated enterprise leasing director"
            ],
            ctaLabel: "Talk to Institutional Sales",
            ctaHref: "/contact?interest=property-marketplace-enterprise"
          }
        ]}
      />

      {/* Onboarding Timeline — 1-Day Process */}
      <OnboardingTimeline
        accentColor="#0F8B7D"
        title="1-Day Seamless Leasing Process"
        subtitle="Zero 15-day delays. Complete property discovery, guided site visits, real-time negotiations, and digital lease execution in a single day."
        steps={[
          {
            title: "Discover & Filter Space",
            description: "Explore verified Grade-A properties by micro-market, carpet area, and fit-out state with instant CAD floorplates.",
            duration: "Hour 1"
          },
          {
            title: "Instant Digital Site Visit",
            description: "Book same-day on-site inspections with verified building hosts and receive instant QR access passes.",
            duration: "Hour 2"
          },
          {
            title: "Direct Deal Room & Digital LOI",
            description: "Negotiate commercial lease terms in real-time and generate digitally signed Letters of Intent in minutes.",
            duration: "Hour 3"
          },
          {
            title: "Instant Digital Lease Execution",
            description: "Execute standard commercial lease agreement, complete deposit escrow online, and receive digital keys.",
            duration: "Same-Day Handover"
          }
        ]}
      />

      {/* FAQs */}
      <FAQAccordion
        faqs={[
          {
            q: "How does Property Marketplace differ from FM Marketplace?",
            a: "Property Marketplace is exclusively dedicated to commercial space discovery and leasing — helping occupiers find, tour, and lease offices from building owners. FM Marketplace (available at /fm-marketplace) is exclusively dedicated to facility management services like MEP, HVAC maintenance, housekeeping, and security contracts."
          },
          {
            q: "Are all commercial property listings on OfficeX verified?",
            a: "Yes. Every property on OfficeX undergoes strict physical and documentation verification, including title checks, approved building plans, Fire NOC validity, and occupancy certificates to eliminate phantom inventory."
          },
          {
            q: "How does the digital site visit scheduling work?",
            a: "You select an available inspection slot directly on the property page. The on-site property manager receives instant confirmation and generates a digital visitor pass for seamless lobby and turnstile access."
          },
          {
            q: "What is the Digital Deal Room and LOI Generator?",
            a: "It is an online collaborative environment where occupiers and landlords finalize commercial terms (base rent, fit-out rent-free periods, CAM, lock-in) and generate legally binding standard Letters of Intent with e-signatures."
          },
          {
            q: "Can commercial leasing brokers use OfficeX Property Marketplace?",
            a: "Yes. Brokers can co-broke, manage client mandates, track site visits, and coordinate deal terms directly through dedicated broker workspaces with transparent commission audit trails."
          }
        ]}
      />

      {/* Final CTA */}
      <FinalCTABand
        accentColor="#0F8B7D"
        headline="Ready to find or lease your next commercial property?"
        subheadline="Join leading enterprises, institutional landlords, and fast-growing businesses on OfficeX Property Marketplace."
        primaryCta={{
          label: "Explore Available Spaces",
          href: "/public/search"
        }}
        secondaryCta={{
          label: "Talk to Our Leasing Team",
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


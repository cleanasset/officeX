"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Zap,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
  MapPin
} from "lucide-react";

interface MarketplaceDualShowcaseProps {
  onOpenEnquiry?: (prefill?: { audience?: string; modules?: string[] }) => void;
}

export default function MarketplaceDualShowcase({
  onOpenEnquiry
}: MarketplaceDualShowcaseProps) {
  const router = useRouter();

  // 4 PRIMARY FM SERVICES (Single 4-card row) - 4 Completely distinct services
  const vendors = [
    {
      id: "security-services",
      category: "Soft FM",
      image: "/images/showcase_security_guards.jpg",
      title: "24/7 Manned Security",
      facilities: "PSARA Uniformed Guards, Biometric Speed Gates & Perimeter Patrol",
      vendorsCount: "310+ Agencies",
      sla: "PSARA & ESI",
      linkUrl: "/marketplace?category=security"
    },
    {
      id: "mep-services",
      category: "Hard FM",
      image: "/images/showcase_mep_hd.jpg",
      title: "MEP & Electrical",
      facilities: "11KV Substations, DG Sets, HT/LT Panels & Thermography",
      vendorsCount: "240+ Vendors",
      sla: "15-Min SLA",
      linkUrl: "/marketplace?category=mep"
    },
    {
      id: "hvac-services",
      category: "Hard FM",
      image: "/images/showcase_hvac_hd.jpg",
      title: "HVAC & Chillers",
      facilities: "Central Chillers, AHU Scrubbing, VRV/VRF & BMS Auto",
      vendorsCount: "180+ Engineers",
      sla: "2-Hr Breakdown SLA",
      linkUrl: "/marketplace?category=hvac"
    },
    {
      id: "cleaning-services",
      category: "Soft FM",
      image: "/images/showcase_cleaning_hd.jpg",
      title: "Deep Cleaning & FM",
      facilities: "Corporate Scrubbing, Facade Wash & Restroom Care",
      vendorsCount: "450+ Vendors",
      sla: "EHS Certified",
      linkUrl: "/marketplace?category=cleaning"
    }
  ];

  // 4 PRIMARY COMMERCIAL OFFICES (Single 4-card row) - 4 Completely distinct space formats
  const offices = [
    {
      id: "apex-bkc",
      badge: "GRADE-A TOWER",
      image: "/images/showcase_single_tower.jpg",
      title: "Apex Corporate Tower",
      location: "BKC, Mumbai",
      facilities: "120 Seats · 8,500 sq.ft. · Triple-Height Lobby · 100% DG Backup",
      specPill: "Dedicated Floor",
      linkUrl: "/public/search?query=Apex+BKC"
    },
    {
      id: "meridian-whitefield",
      badge: "MANAGED IT SUITE",
      image: "/images/showcase_managed_coworking.jpg",
      title: "Meridian Managed Suites",
      location: "Whitefield, Bengaluru",
      facilities: "45 Desks · Ergonomic Chairs · Acoustic Phone Booths · Leased Line",
      specPill: "Plug & Play",
      linkUrl: "/public/search?query=Meridian+Whitefield"
    },
    {
      id: "tech-horizon",
      badge: "ENTERPRISE CAMPUS",
      image: "/images/showcase_office_techhorizon_hd.jpg",
      title: "Tech Horizon Campus",
      location: "Cyber City, Gurugram",
      facilities: "180 Seats · 14,000 sq.ft. · Private Cafeteria · Server Room · EV Hub",
      specPill: "Enterprise Wing",
      linkUrl: "/public/search?query=Tech+Horizon"
    },
    {
      id: "nexus-warmshell",
      badge: "WARM SHELL FLOOR",
      image: "/images/showcase_commercial_warmshell.jpg",
      title: "Nexus Commercial Suites",
      location: "Hinjewadi, Pune",
      facilities: "6,500 sq.ft. Open Floor · Central AC Ducts · 4.2m Slab Height · Lifts",
      specPill: "Fit-out Ready",
      linkUrl: "/public/search?query=Nexus+Hub"
    }
  ];

  return (
    <section
      id="marketplace-showcase"
      className="py-16 md:py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16 md:space-y-20">

        {/* ========================================================================= */}
        {/* SUBSECTION 1: OFFICE / CRE DISCOVERY MARKETPLACE                         */}
        {/* ========================================================================= */}
        <div>
          {/* Header - Pure Black Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Discover. Compare. Lease.
              </h2>
            </div>

            <Link
              href="/public/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0F8B7D] transition-colors whitespace-nowrap shrink-0 group"
            >
              <span>Explore all spaces</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-[#0F8B7D]" />
            </Link>
          </div>

          {/* 4 CARDS DISPLAY (COMPACT & BALANCED 4-COLUMN RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {offices.map((office) => (
              <div
                key={office.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo with Overlay Chips */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={office.image}
                    alt={office.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-teal-600 text-white uppercase tracking-wider shadow-xs">
                      {office.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-[11px] font-bold text-white/95 flex items-center gap-1 backdrop-blur-xs bg-black/40 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified Grade-A
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs">
                      {office.specPill}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {office.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#0F8B7D] shrink-0" />
                      <span>{office.location}</span>
                    </p>

                    <p className="text-[11.5px] sm:text-xs text-slate-500 font-normal mt-2 leading-relaxed line-clamp-2">
                      {office.facilities}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11.5px] text-slate-500 font-semibold flex items-center gap-1">
                      <BadgeCheck size={13} className="text-[#0F8B7D]" />
                      <span>0% Broker Fee</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenEnquiry) {
                          onOpenEnquiry({
                            audience: "occupier",
                            modules: [`Marketplace: ${office.title}`]
                          });
                        } else {
                          router.push(office.linkUrl);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[11.5px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBSECTION 2: FACILITY MANAGEMENT MARKETPLACE                            */}
        {/* ========================================================================= */}
        <div>
          {/* Header - Solid Pure Black Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Connect with Trusted Professionals — Find. Compare. Engage.
              </h2>
            </div>

            <Link
              href="/fm-marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0F8B7D] transition-colors whitespace-nowrap shrink-0 group"
            >
              <span>Explore all services</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-[#0F8B7D]" />
            </Link>
          </div>

          {/* 4 CARDS DISPLAY (COMPACT & BALANCED 4-COLUMN RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo with Overlay Chips */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={vendor.image}
                    alt={vendor.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur-xs text-white">
                      {vendor.category}
                    </span>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-600/90 text-white">
                      {vendor.vendorsCount}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-[11px] font-bold text-white/95 flex items-center gap-1 backdrop-blur-xs bg-black/40 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified Vendor
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs">
                      {vendor.sla}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {vendor.title}
                    </h3>
                    <p className="text-[11.5px] sm:text-xs text-slate-500 font-normal mt-1.5 leading-relaxed line-clamp-2">
                      {vendor.facilities}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>100% Escrow</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenEnquiry) {
                          onOpenEnquiry({
                            audience: "fm",
                            modules: [`FM Marketplace: ${vendor.title}`]
                          });
                        } else {
                          router.push(vendor.linkUrl);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-900 hover:bg-[#0F8B7D] text-white text-[11.5px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Get Bids</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

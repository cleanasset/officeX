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
      price: "₹21,000",
      period: "/ guard / mo",
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
      price: "₹42,500",
      period: "/ mo AMC",
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
      price: "₹52,000",
      period: "/ mo AMC",
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
      price: "₹18,500",
      period: "/ mo",
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
      price: "₹2,85,000",
      period: "/ month",
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
      price: "₹72,000",
      period: "/ month",
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
      price: "₹4,20,000",
      period: "/ month",
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
      price: "₹1,45,000",
      period: "/ month",
      specPill: "Fit-out Ready",
      linkUrl: "/public/search?query=Nexus+Hub"
    }
  ];

  return (
    <section
      id="marketplace-showcase"
      className="py-10 md:py-14 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full space-y-10 md:space-y-12">

        {/* ========================================================================= */}
        {/* SUBSECTION 1: OFFICE / CRE DISCOVERY MARKETPLACE                         */}
        {/* ========================================================================= */}
        <div>
          {/* Header - Only Tagline as Headings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Discover. Compare. Lease.
              </h2>
            </div>

            <Link
              href="/public/search"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:text-[#0D7A6E] transition-colors whitespace-nowrap shrink-0 group"
            >
              <span>Explore all spaces</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 CARDS DISPLAY (SINGLE ROW IN 4-COLUMN RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {offices.map((office) => (
              <div
                key={office.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-teal-400 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo with Overlay Chips */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={office.image}
                    alt={office.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-teal-600 text-white uppercase tracking-wider">
                      {office.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-baseline justify-between text-white">
                    <div>
                      <span className="text-base font-black">{office.price}</span>
                      <span className="text-[10px] text-slate-200 font-medium ml-0.5">{office.period}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/90 text-slate-900">
                      {office.specPill}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {office.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#0F8B7D]" />
                      <span>{office.location}</span>
                    </p>

                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug line-clamp-2">
                      <span className="font-semibold text-slate-700">Facilities: </span>
                      {office.facilities}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
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
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
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
          {/* Header - Only Tagline as Headings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Connect with Trusted Professionals
              </h2>
            </div>

            <Link
              href="/fm-marketplace"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:text-[#0D7A6E] transition-colors whitespace-nowrap shrink-0 group"
            >
              <span>Explore all services</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 CARDS DISPLAY (SINGLE ROW IN 4-COLUMN RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-teal-400 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo with Overlay Chips */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={vendor.image}
                    alt={vendor.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white">
                      {vendor.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600/90 text-white">
                      {vendor.vendorsCount}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-baseline justify-between text-white">
                    <div>
                      <span className="text-base font-black">{vendor.price}</span>
                      <span className="text-[10px] text-slate-200 font-medium ml-0.5">{vendor.period}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/90 text-slate-900">
                      {vendor.sla}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {vendor.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug line-clamp-2">
                      <span className="font-semibold text-slate-700">Facilities: </span>
                      {vendor.facilities}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
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
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-[#0F8B7D] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
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

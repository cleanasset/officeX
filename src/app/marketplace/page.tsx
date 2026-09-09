"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, Calendar, FileText, Handshake,
  CheckCircle2, KeyRound, ShieldCheck, Search,
  MapPin, Users, Sparkles, ArrowRight, ArrowUpRight,
  Filter, Check, Star, Phone, Clock, ChevronRight,
  SlidersHorizontal, BadgePercent, Award, Shield, Eye
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";

export default function PropertyMarketplacePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTeamSize, setSelectedTeamSize] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // myHQ-inspired Workspace Models
  const workspaceModels = [
    {
      id: "managed",
      title: "Enterprise Managed Offices",
      subtitle: "Bespoke private floors custom-built for teams of 30 to 500+",
      pricing: "From ₹115 / sq.ft",
      badge: "Most Popular for Enterprises",
      image: "/images/showcase_office_techhorizon_hd.jpg",
      perks: ["Zero Capex & Fit-out Cost", "Dedicated Reception & IT", "Custom Corporate Branding", "All-inclusive CAM & Utilities"]
    },
    {
      id: "coworking",
      title: "Dedicated Coworking Desks",
      subtitle: "Plug-and-play dedicated desks with 24/7 access in Grade-A hubs",
      pricing: "From ₹6,500 / desk / mo",
      badge: "Instant Move-in",
      image: "/images/showcase_managed_coworking.jpg",
      perks: ["High-Speed Fiber Internet", "Meeting Room Credits", "Pantry & Premium Coffee", "Community & Networking Events"]
    },
    {
      id: "cabin",
      title: "Private Team Cabins",
      subtitle: "Lockable sound-insulated acoustic suites for 4 to 25 members",
      pricing: "From ₹8,999 / seat / mo",
      badge: "High Privacy",
      image: "/images/card_office_marketplace.jpg",
      perks: ["Biometric Access Control", "Whiteboard & Ergonomic Seating", "Daily Sanitization", "Mail & Package Handling"]
    },
    {
      id: "warmshell",
      title: "Commercial Warm & Bare Shells",
      subtitle: "Institutional floor plates ready for long-term commercial leases",
      pricing: "From ₹65 / sq.ft / mo",
      badge: "Direct Landlord Leases",
      image: "/images/showcase_commercial_warmshell.jpg",
      perks: ["100% Power & DG Backup", "Multi-Level Car Parking", "Fire NOC & OC Certified", "Flexible Rent-free Fit-out"]
    }
  ];

  // Prime Commercial Hubs (Ahmedabad focus per user reference, plus metro hubs)
  const commercialDistricts = [
    {
      name: "SG Highway, Ahmedabad",
      tag: "Top Tech Corridor",
      spaces: "48+ Verified Spaces",
      rate: "₹55 - ₹95 / sq.ft",
      desc: "Prime corporate IT hubs, Titanium City Center & Grade-A commercial towers."
    },
    {
      name: "GIFT City, Gandhinagar",
      tag: "Global FinTech Hub",
      spaces: "34+ Verified Spaces",
      rate: "₹80 - ₹140 / sq.ft",
      desc: "India's premier International Financial Services Centre with tax benefits."
    },
    {
      name: "Prahlad Nagar & Bodakdev",
      tag: "Boutique CBD",
      spaces: "29+ Verified Spaces",
      rate: "₹70 - ₹110 / sq.ft",
      desc: "Upscale business district with premier retail, dining, and executive suites."
    },
    {
      name: "BKC & Lower Parel, Mumbai",
      tag: "Financial Capital",
      spaces: "62+ Verified Spaces",
      rate: "₹180 - ₹350 / sq.ft",
      desc: "India's most prestigious commercial address for BFSI and multinational HQs."
    },
    {
      name: "Outer Ring Road (ORR), Bengaluru",
      tag: "Silicon Plateau",
      spaces: "75+ Verified Spaces",
      rate: "₹95 - ₹165 / sq.ft",
      desc: "The nerve center of Indian technology campuses and global capability centers."
    },
    {
      name: "Cyber City, Gurugram (NCR)",
      tag: "Fortune 500 Hub",
      spaces: "58+ Verified Spaces",
      rate: "₹120 - ₹210 / sq.ft",
      desc: "Integrated corporate city with rapid metro connectivity and premium amenities."
    }
  ];

  // Curated Verified Spaces in Ahmedabad & Metros (myHQ style Cards)
  const featuredSpaces = [
    {
      id: "space-1",
      name: "Apex Horizon Tech Park",
      location: "SG Highway, Ahmedabad",
      type: "Enterprise Managed Floor",
      area: "18,500 Sq.Ft.",
      seats: "180 Seats",
      rate: "₹75",
      unit: "sq.ft/mo",
      tag: "Immediate Move-in",
      image: "/images/showcase_office_techhorizon_hd.jpg",
      features: ["Metro 400m", "100% DG Backup", "Cafeteria", "LEED Gold Certified"],
      verified: true
    },
    {
      id: "space-2",
      name: "GIFT One International Tower",
      location: "GIFT City, Gandhinagar / Ahmedabad",
      type: "Grade-A+ Commercial Suite",
      area: "32,000 Sq.Ft.",
      seats: "320 Workstations",
      rate: "₹105",
      unit: "sq.ft/mo",
      tag: "SEZ & Domestic",
      image: "/images/card_office_marketplace.jpg",
      features: ["District Cooling System", "High-Speed Elevators", "Automated Parking", "24/7 Security"],
      verified: true
    },
    {
      id: "space-3",
      name: "Stallion Executive Hub",
      location: "Bodakdev, Ahmedabad",
      type: "Private Team Suites & Cabins",
      area: "6,200 Sq.Ft.",
      seats: "65 Seats",
      rate: "₹8,500",
      unit: "seat/mo",
      tag: "Plug & Play",
      image: "/images/showcase_managed_coworking.jpg",
      features: ["Acoustic Pods", "High-Speed Wi-Fi", "Boardrooms", "Valet Parking"],
      verified: true
    },
    {
      id: "space-4",
      name: "Titanium Square Commercial Plate",
      location: "Prahlad Nagar, Ahmedabad",
      type: "Commercial Warm Shell",
      area: "24,000 Sq.Ft.",
      seats: "Custom Floorplate",
      rate: "₹68",
      unit: "sq.ft/mo",
      tag: "Direct Landlord",
      image: "/images/showcase_commercial_warmshell.jpg",
      features: ["Fire NOC Cleared", "Column-Free Span", "Separate AHU Room", "Dedicated Lift Lobby"],
      verified: true
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/public/search?city=${encodeURIComponent(selectedCity)}&category=${selectedCategory}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* 1. HERO SECTION (myHQ Ahmedabad Reference — Clean, Light, Conversion-Focused) */}
      <section className="relative pt-10 md:pt-16 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 overflow-hidden border-b border-slate-200">
        {/* Soft background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 text-[#0F8B7D] text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs">
            <Sparkles size={14} className="text-[#0F8B7D]" />
            <span>Zero Brokerage · 100% Physically Audited Workspaces</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 max-w-4xl mx-auto">
            Flexible Office Spaces &amp; Commercial Real Estate in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F8B7D] via-teal-600 to-emerald-600">
              Ahmedabad &amp; Top Metros
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
            From managed enterprise suites to dedicated coworking desks and full floor plates. Schedule free site visits with a dedicated workspace advisor.
          </p>

          {/* myHQ-Style Search Form Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-3 sm:p-4 text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
          >
            {/* Field 1: City & Hub */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-[#0F8B7D]" /> Location / Hub
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer transition-colors"
              >
                <option value="Ahmedabad">Ahmedabad (SG Hwy, GIFT City)</option>
                <option value="Mumbai">Mumbai (BKC, Lower Parel)</option>
                <option value="Bengaluru">Bengaluru (ORR, Whitefield)</option>
                <option value="Gurugram">Delhi NCR (Cyber City, Noida)</option>
                <option value="Pune">Pune (Hinjewadi, Kharadi)</option>
                <option value="Hyderabad">Hyderabad (HITEC City)</option>
              </select>
            </div>

            {/* Field 2: Space Type */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Building2 size={12} className="text-[#0F8B7D]" /> Workspace Model
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer transition-colors"
              >
                <option value="all">All Space Categories</option>
                <option value="managed">Enterprise Managed Office</option>
                <option value="coworking">Dedicated Coworking Desks</option>
                <option value="cabin">Private Executive Cabins</option>
                <option value="warmshell">Commercial Bare/Warm Shell</option>
              </select>
            </div>

            {/* Field 3: Team Size */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Users size={12} className="text-[#0F8B7D]" /> Team Size
              </label>
              <select
                value={selectedTeamSize}
                onChange={(e) => setSelectedTeamSize(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer transition-colors"
              >
                <option value="all">Any Team Size</option>
                <option value="1-10">1 - 10 Desks</option>
                <option value="10-50">10 - 50 Seats</option>
                <option value="50-200">50 - 200 Seats</option>
                <option value="200+">200+ Enterprise</option>
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs sm:text-sm font-black shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={16} />
                <span>Explore Spaces</span>
              </button>
            </div>
          </form>

          {/* myHQ Trust Pillars Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-7 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={16} className="text-[#0F8B7D]" /> Zero Brokerage Fees
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={16} className="text-[#0F8B7D]" /> 100% Verified Inventory
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={16} className="text-[#0F8B7D]" /> Free Dedicated Advisor
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={16} className="text-[#0F8B7D]" /> Direct Landlord Deal Room
            </span>
          </div>

        </div>
      </section>

      {/* 2. WORKSPACE MODELS CATEGORIES (myHQ Style Visual Cards) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Tailored Commercial Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Workspaces by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mt-2 md:mt-0">
            Whether you need agile team cabins, turnkey enterprise suites, or whole corporate floor plates, we have verified inventory across all prime hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {workspaceModels.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <Image
                  src={model.image}
                  alt={model.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md border border-teal-200 shadow-xs">
                  {model.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors">
                    {model.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {model.subtitle}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {model.perks.map((perk, i) => (
                      <li key={i} className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                        <Check size={12} className="text-[#0F8B7D] shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting</span>
                    <span className="text-xs font-black text-slate-900">{model.pricing}</span>
                  </div>
                  <button
                    onClick={() => setSlideInOpen(true)}
                    className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
                  >
                    Inquire <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED VERIFIED SPACES (myHQ Ahmedabad Listings Showcase) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-[11px] font-black uppercase tracking-wider mb-2">
                <CheckCircle2 size={13} /> 100% Physically Audited
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Spaces in Ahmedabad &amp; Key Hubs
              </h2>
            </div>
            <Link
              href="/public/search"
              className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1 mt-3 sm:mt-0"
            >
              View All 500+ Verified Spaces <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredSpaces.map((space) => (
              <div
                key={space.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden hover:bg-white hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                  <Image
                    src={space.image}
                    alt={space.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                    <span className="bg-[#0F8B7D] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                      {space.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {space.area}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                      {space.type}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5 group-hover:text-[#0F8B7D] transition-colors">
                      {space.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{space.location}</span>
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {space.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900">{space.rate}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> /{space.unit}</span>
                    </div>
                    <button
                      onClick={() => setSlideInOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Book Tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRIME BUSINESS DISTRICTS (Ahmedabad & Metros) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Strategic Locations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Prime Commercial Corridors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Access vetted office stock in the most coveted business addresses across Ahmedabad, Mumbai, Bengaluru, and NCR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commercialDistricts.map((district, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {district.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{district.spaces}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {district.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {district.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Rental</span>
                  <span className="text-xs font-black text-slate-900">{district.rate}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCity(district.name.split(",")[1]?.trim() || "Ahmedabad");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Explore <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE OFFICEX WORKSPACES (myHQ Value Proposition) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/80 to-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              The OfficeX Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Corporate Tenants &amp; Startups Lease with Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
                <BadgePercent size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Zero Brokerage Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with asset owners and institutional landlords. No brokerage or hidden commissions on all listed properties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">100% Physically Audited</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every space undergoes physical verification: power capacity, fire NOC validity, lift licenses, and HVAC health checks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Free Workspace Advisor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get paired with a dedicated commercial advisor who curates options, arranges physical site tours, and negotiates terms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Instant Digital LOI &amp; Deal Room</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Draft Letters of Intent, execute Aadhaar-backed digital lease agreements, and transition straight into OfficeX Operate for fit-out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is OfficeX really 100% zero brokerage for tenants?",
              a: "Yes! Commercial tenants and occupiers do not pay any brokerage fee to OfficeX. We partner directly with Grade-A commercial developers, REITs, and landlords."
            },
            {
              q: "Can I schedule guided site visits for spaces in Ahmedabad or GIFT City?",
              a: "Absolutely. Once you request a visit, our dedicated local workspace advisor coordinates with the building manager, issues visitor security gate passes, and accompanies you on the site inspection."
            },
            {
              q: "What is the difference between Managed Offices and Coworking Desks?",
              a: "Managed Offices are fully customized, private commercial suites designed specifically for your brand (30-500+ team size) with dedicated IT and private reception. Coworking Desks are plug-and-play workstations within shared premium Grade-A communities."
            },
            {
              q: "How does the Digital Deal Room work for commercial lease negotiation?",
              a: "Our collaborative online deal room allows landlords and corporate occupiers to negotiate base rent, fit-out rent-free periods, CAM costs, and security deposits digitally with instant version control and LOI generation."
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-900 hover:text-[#0F8B7D] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-extrabold text-lg ml-2">
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#0A1829] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#2DD4BF] block mb-2">
            Start Your Search Today
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Find the Perfect Commercial Space for Your Business
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto mb-8 font-medium">
            Join hundreds of enterprises and high-growth companies that discovered their commercial headquarters on OfficeX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/public/search"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all"
            >
              Explore Available Spaces
            </Link>
            <button
              onClick={() => setSlideInOpen(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
            >
              Talk to a Space Advisor
            </button>
          </div>
        </div>
      </section>

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

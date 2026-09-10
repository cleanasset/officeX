"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, Calendar, FileText, Handshake,
  CheckCircle2, KeyRound, ShieldCheck, Search,
  MapPin, Users, Sparkles, ArrowRight, ArrowUpRight,
  Filter, Check, Star, Phone, Clock, ChevronRight,
  SlidersHorizontal, BadgePercent, Award, Shield, Eye,
  Ticket, Briefcase
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";

export default function PropertyMarketplacePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  type SolutionType = "longterm" | "daypass" | "events" | "virtual";

  const [activeSolution, setActiveSolution] = useState<SolutionType>("longterm");
  const [activeSubPills, setActiveSubPills] = useState<Record<SolutionType, string>>({
    longterm: "coworking",
    daypass: "single",
    events: "meeting",
    virtual: "company",
  });
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTeamSize, setSelectedTeamSize] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [districtFilter, setDistrictFilter] = useState("all");

  // Tab configurations ensuring 100% equal height and identical structure across all 4 solutions
  const solutionConfigs: Record<
    SolutionType,
    {
      pills: { id: string; label: string; icon: React.ElementType }[];
      descriptions: Record<string, string>;
      buttonText: string;
      placeholder: string;
    }
  > = {
    longterm: {
      pills: [
        { id: "coworking", label: "Coworking Space", icon: Building2 },
        { id: "managed", label: "Managed Office", icon: Building2 },
        { id: "commercial", label: "Office / Commercial", icon: Building2 },
      ],
      descriptions: {
        coworking: "Rent dedicated seats and private cabins in fully-equipped coworking spaces",
        managed: "Custom-built, fully managed private floors for enterprise teams of 20 to 500+",
        commercial: "Bare-shell and warm-shell commercial floor plates for institutional corporate leasing",
      },
      buttonText: "View Workspaces",
      placeholder: "Search location, tech park, or building...",
    },
    daypass: {
      pills: [
        { id: "single", label: "Single Day Pass", icon: Ticket },
        { id: "flexi", label: "Flexi 5-Day Pass", icon: Ticket },
        { id: "team", label: "Team Day Pass", icon: Users },
      ],
      descriptions: {
        single: "Instant access to open hot desks, high-speed Wi-Fi, and executive lounges for a day",
        flexi: "Prepaid multi-day passes with 90-day validity across 500+ Grade-A hubs",
        team: "On-demand hot desking bundle for remote and distributed teams",
      },
      buttonText: "View Day Passes",
      placeholder: "Search coworking hubs or areas for day passes...",
    },
    events: {
      pills: [
        { id: "meeting", label: "Meeting Rooms (4-12)", icon: Users },
        { id: "boardroom", label: "Boardrooms (12-25)", icon: Building2 },
        { id: "event", label: "Event Spaces (30-100+)", icon: Sparkles },
      ],
      descriptions: {
        meeting: "Book hourly meeting rooms equipped with 4K AV displays and high-speed Wi-Fi",
        boardroom: "Executive boardrooms with premium video conferencing and presentation setups",
        event: "Spacious townhalls and event venues for corporate workshops and conferences",
      },
      buttonText: "Find Meeting Rooms",
      placeholder: "Search conference and meeting spaces...",
    },
    virtual: {
      pills: [
        { id: "company", label: "Company Registration", icon: FileText },
        { id: "gst", label: "GST Registration", icon: ShieldCheck },
        { id: "mailing", label: "Business Mailing Address", icon: Briefcase },
      ],
      descriptions: {
        company: "MCA compliant registered corporate address with rent agreement and NOC",
        gst: "State-level commercial address for GST compliance and official verification",
        mailing: "Prime business address with mail reception and digital scanning",
      },
      buttonText: "Explore Virtual Plans",
      placeholder: "Search prime business addresses...",
    },
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSolution === "events" || activeSolution === "virtual") {
      setSlideInOpen(true);
      return;
    }
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (searchLocationQuery) params.set("q", searchLocationQuery);
    if (activeSolution === "daypass") {
      params.set("type", "daypass");
      params.set("passType", activeSubPills.daypass);
    } else {
      params.set("category", activeSubPills.longterm);
    }
    router.push(`/public/search?${params.toString()}`);
  };

  // myHQ-inspired Workspace Models
  const workspaceModels = [
    {
      id: "managed",
      title: "Enterprise Managed Offices",
      subtitle: "Bespoke private floors custom-built for teams of 30 to 500+",
      pricing: "From ₹115 / sq.ft",
      badge: "Most Popular for Enterprises",
      image: "/images/workspace_managed_suite.jpg",
      perks: ["Zero Capex & Fit-out Cost", "Dedicated Reception & IT", "Custom Corporate Branding", "All-inclusive CAM & Utilities"]
    },
    {
      id: "coworking",
      title: "Dedicated Coworking Desks",
      subtitle: "Plug-and-play dedicated desks with 24/7 access in Grade-A hubs",
      pricing: "From ₹6,500 / desk / mo",
      badge: "Instant Move-in",
      image: "/images/workspace_dedicated_desks.jpg",
      perks: ["High-Speed Fiber Internet", "Meeting Room Credits", "Pantry & Premium Coffee", "Community & Networking Events"]
    },
    {
      id: "cabin",
      title: "Private Team Cabins",
      subtitle: "Lockable sound-insulated acoustic suites for 4 to 25 members",
      pricing: "From ₹8,999 / seat / mo",
      badge: "High Privacy",
      image: "/images/workspace_private_cabin.jpg",
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

  // Prime Commercial Corridors (Ahmedabad, GIFT City, Mumbai, Bengaluru, NCR)
  const commercialDistricts = [
    {
      id: "sg-highway",
      name: "SG Highway, Ahmedabad",
      shortName: "SG Highway Corridor",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "SG Highway",
      region: "ahmedabad",
      tag: "Top Tech Corridor",
      spaces: "48+ Verified Spaces",
      rate: "₹55 - ₹95",
      unit: "sq.ft / mo",
      desc: "Ahmedabad's premier IT backbone hosting Grade-A commercial tech parks and Titanium City Center.",
      image: "/images/district_sghighway.jpg",
      highlights: ["Titanium City Center", "Grade-A IT Towers", "S.P. Ring Road Access"],
    },
    {
      id: "gift-city",
      name: "GIFT City, Gandhinagar",
      shortName: "GIFT City IFSC",
      city: "Gandhinagar / Ahmedabad",
      searchCity: "Ahmedabad",
      searchQuery: "GIFT City",
      region: "ahmedabad",
      tag: "Global FinTech Hub",
      spaces: "34+ Verified Spaces",
      rate: "₹80 - ₹140",
      unit: "sq.ft / mo",
      desc: "India's flagship International Financial Services Centre offering 100% tax exemptions and global banking.",
      image: "/images/district_giftcity.jpg",
      highlights: ["FinTech SEZ / IFSC", "Tax Holiday Exemptions", "Dual Currency Gateway"],
    },
    {
      id: "prahlad-nagar",
      name: "Prahlad Nagar & Bodakdev",
      shortName: "Prahlad Nagar CBD",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "Prahlad Nagar",
      region: "ahmedabad",
      tag: "Boutique CBD",
      spaces: "29+ Verified Spaces",
      rate: "₹70 - ₹110",
      unit: "sq.ft / mo",
      desc: "Upscale corporate boulevard with boutique executive towers, Michelin-standard dining, and premier retail.",
      image: "/images/district_prahladnagar.jpg",
      highlights: ["Executive Turnkey Suites", "Fine Dining & Retail", "Prime SG Road Proximity"],
    },
    {
      id: "bkc-mumbai",
      name: "BKC & Lower Parel, Mumbai",
      shortName: "BKC & Lower Parel",
      city: "Mumbai, Maharashtra",
      searchCity: "Mumbai",
      searchQuery: "BKC",
      region: "mumbai",
      tag: "Financial Capital",
      spaces: "62+ Verified Spaces",
      rate: "₹180 - ₹350",
      unit: "sq.ft / mo",
      desc: "The nerve center of Indian banking, global investment firms, consulates, and Fortune 100 conglomerates.",
      image: "/images/district_mumbaibkc.jpg",
      highlights: ["BFSI Corporate Hub", "IGBC Platinum Assets", "Bullet Train Terminal"],
    },
    {
      id: "blr-orr",
      name: "Outer Ring Road (ORR), Bengaluru",
      shortName: "ORR Tech Corridor",
      city: "Bengaluru, Karnataka",
      searchCity: "Bengaluru",
      searchQuery: "Outer Ring Road",
      region: "bengaluru",
      tag: "Silicon Plateau",
      spaces: "75+ Verified Spaces",
      rate: "₹95 - ₹165",
      unit: "sq.ft / mo",
      desc: "The silicon heartbeat of India, home to massive GCC campuses, hyperscalers, and deep-tech innovation parks.",
      image: "/images/district_bangaloreorr.jpg",
      highlights: ["Global Capability Centers", "Integrated Campuses", "Metro Blue Line"],
    },
    {
      id: "cyber-city",
      name: "Cyber City, Gurugram (NCR)",
      shortName: "DLF Cyber City",
      city: "Gurugram, Delhi NCR",
      searchCity: "Gurugram",
      searchQuery: "Cyber City",
      region: "ncr",
      tag: "Fortune 500 Hub",
      spaces: "58+ Verified Spaces",
      rate: "₹120 - ₹210",
      unit: "sq.ft / mo",
      desc: "Futuristic integrated business district featuring direct Rapid Metro connectivity and world-class CyberHub.",
      image: "/images/district_cybercity.jpg",
      highlights: ["Fortune 500 Campuses", "Integrated Rapid Metro", "CyberHub Social Hub"],
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
      tag: "IFSC Special Zone",
      image: "/images/space_gift_one_tower.jpg",
      features: ["SEZ Tax Benefits", "Triple Height Atrium", "Multi-Tier Security", "District Cooling"],
      verified: true
    },
    {
      id: "space-3",
      name: "Prahlad Corporate Capital",
      location: "Prahlad Nagar, Ahmedabad",
      type: "Boutique Executive Office",
      area: "12,000 Sq.Ft.",
      seats: "110 Seats",
      rate: "₹88",
      unit: "sq.ft/mo",
      tag: "Premium CBD",
      image: "/images/space_prahlad_capital.jpg",
      features: ["Valet Parking", "Acoustic Phone Booths", "Barista Lounge", "Fiber Internet"],
      verified: true
    },
    {
      id: "space-4",
      name: "BKC Sovereign Heights",
      location: "Bandra Kurla Complex (BKC), Mumbai",
      type: "Enterprise Headquarters Plate",
      area: "45,000 Sq.Ft.",
      seats: "450 Seats",
      rate: "₹240",
      unit: "sq.ft/mo",
      tag: "Prestige Headquarters",
      image: "/images/officex_prestige_cre_hero.jpg",
      features: ["Helipad Access", "IGBC Platinum", "Dedicated High-Speed Elevators", "Concierge"],
      verified: true
    }
  ];

  // Current active solution config and pill data
  const currentConfig = solutionConfigs[activeSolution];
  const selectedPillId = activeSubPills[activeSolution] || currentConfig.pills[0].id;
  const currentDesc =
    currentConfig.descriptions[selectedPillId] ||
    currentConfig.descriptions[currentConfig.pills[0].id];

  const districtFilters = [
    { id: "all", label: "All Corridors", count: commercialDistricts.length },
    { id: "ahmedabad", label: "Ahmedabad & GIFT", count: commercialDistricts.filter(d => d.region === "ahmedabad").length },
    { id: "mumbai", label: "Mumbai", count: commercialDistricts.filter(d => d.region === "mumbai").length },
    { id: "bengaluru", label: "Bengaluru", count: commercialDistricts.filter(d => d.region === "bengaluru").length },
    { id: "ncr", label: "Delhi NCR", count: commercialDistricts.filter(d => d.region === "ncr").length },
  ];

  const filteredDistricts = districtFilter === "all"
    ? commercialDistricts
    : commercialDistricts.filter(d => d.region === districtFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* 1. HERO SECTION (myHQ Ahmedabad Theme — Modern Coworking & Managed Office Visuals) */}
      <section className="relative pt-12 md:pt-16 pb-14 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900 text-white">
        
        {/* Background Canvas — Warm, Stylish Modern Commercial Workspace Banner */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/images/marketplace_myhq_hero.jpg"
            alt="Modern Flexible Coworking & Commercial Workspace"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          {/* myHQ Style Dark Readability Scrim */}
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/50 pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          {/* Main Headline — Modern Global Enterprise Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-white tracking-tight leading-[1.18] mb-3 max-w-4xl mx-auto drop-shadow-md">
            Flexible Commercial &amp; Office Spaces for Teams of Every Size
          </h1>

          {/* Subhead */}
          <p className="text-xs sm:text-base md:text-lg text-slate-200 font-medium max-w-2xl mx-auto mb-8 drop-shadow-sm">
            Choose between office space, pay-per-use plans or fixed desks for large enterprises and individuals
          </p>

          {/* myHQ-Style Multi-Tier Search Widget */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Row 1: 4 Main Solution Tab Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-0">
              <button
                type="button"
                onClick={() => setActiveSolution("longterm")}
                className={`py-3.5 px-3 rounded-t-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSolution === "longterm"
                    ? "bg-white text-[#0F8B7D] font-black shadow-lg"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Building2 size={22} className={activeSolution === "longterm" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-xs sm:text-sm">Long-term Leasing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("daypass")}
                className={`py-3.5 px-3 rounded-t-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSolution === "daypass"
                    ? "bg-white text-[#0F8B7D] font-black shadow-lg"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Ticket size={22} className={activeSolution === "daypass" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-xs sm:text-sm">Day Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("events")}
                className={`py-3.5 px-3 rounded-t-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSolution === "events"
                    ? "bg-white text-[#0F8B7D] font-black shadow-lg"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Users size={22} className={activeSolution === "events" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-xs sm:text-sm">Meetings &amp; Events</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("virtual")}
                className={`py-3.5 px-3 rounded-t-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSolution === "virtual"
                    ? "bg-white text-[#0F8B7D] font-black shadow-lg"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Briefcase size={22} className={activeSolution === "virtual" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-xs sm:text-sm">Virtual Office</span>
              </button>
            </div>

            {/* Row 2: Active White Search Container — 100% EQUAL HEIGHT & DIMENSIONS ACROSS ALL TABS */}
            <div className="bg-white rounded-b-2xl shadow-2xl p-4 sm:p-5 border border-slate-200 text-left">
              {/* Row 1: Sub-category pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3 min-h-[38px]">
                {currentConfig.pills.map((pill) => {
                  const PillIcon = pill.icon;
                  const isSelected = selectedPillId === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() =>
                        setActiveSubPills((prev) => ({
                          ...prev,
                          [activeSolution]: pill.id,
                        }))
                      }
                      className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "border-2 border-[#0F8B7D] bg-teal-50/80 text-[#0F8B7D] font-black shadow-2xs"
                          : "border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold"
                      }`}
                    >
                      <PillIcon size={15} />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Contextual Description Bar (Locked to exact 1 line, identical height) */}
              <div className="bg-slate-50 border border-slate-100 h-9 px-4 rounded-xl text-xs sm:text-sm text-slate-600 font-medium flex items-center justify-center text-center mb-3">
                <span className="truncate">{currentDesc}</span>
              </div>

              {/* Row 3: Search Row */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* City Selector */}
                <div className="sm:w-52 shrink-0 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-xs sm:text-sm font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Gurugram">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                {/* Location input */}
                <div className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] flex items-center gap-2.5 transition-all">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchLocationQuery}
                    onChange={(e) => setSearchLocationQuery(e.target.value)}
                    placeholder={`${currentConfig.placeholder} in ${selectedCity}`}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{currentConfig.buttonText}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WORKSPACE MODELS CATEGORIES (Compact, Sleek Category Cards) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {workspaceModels.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
            >
              {/* Image Area (h-52: 208px - More than content area) */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={model.image}
                  alt={model.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-teal-200 shadow-2xs">
                  {model.badge}
                </span>
              </div>

              {/* Content Area (Compact ~140px) */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                    Commercial Model
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={model.title}>
                    {model.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate h-4 leading-4" title={model.subtitle}>
                    {model.subtitle}
                  </p>

                  <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                    {model.perks.slice(0, 2).map((perk, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]">
                        <Check size={10} className="text-[#0F8B7D] shrink-0" />
                        <span className="truncate">{perk}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Starting</span>
                    <span className="text-xs font-black text-slate-900 leading-none">{model.pricing}</span>
                  </div>
                  <button
                    onClick={() => setSlideInOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <span>Inquire</span>
                    <ArrowRight size={12} />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {featuredSpaces.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
              >
                {/* Image Area (h-52: 208px - More than content area) */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src={space.image}
                    alt={space.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                    <span className="bg-[#0F8B7D] text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      {space.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {space.area}
                  </div>
                </div>

                {/* Content Area (Compact ~140px) */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                      {space.type}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={space.name}>
                      {space.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate h-4 leading-4" title={space.location}>
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{space.location}</span>
                    </p>

                    <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                      {space.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]">
                          <Check size={10} className="text-[#0F8B7D] shrink-0" />
                          <span className="truncate">{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Rental Rate</span>
                      <span className="text-xs font-black text-slate-900 leading-none">{space.rate}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> /{space.unit}</span>
                    </div>
                    <button
                      onClick={() => setSlideInOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-[11px] font-black uppercase tracking-wider mb-2">
              <MapPin size={13} /> Strategic Micro-Markets
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Prime Commercial Corridors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mt-1.5 leading-relaxed">
              Vetted commercial office stock across India’s highest demand tech &amp; financial clusters. Direct developer listings with zero brokerage.
            </p>
          </div>

          {/* Dynamic Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 shrink-0">
            {districtFilters.map((f) => {
              const isActive = districtFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setDistrictFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#0F8B7D] shadow-xs font-black border border-teal-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-teal-50 text-[#0F8B7D] font-black" : "bg-slate-200 text-slate-500 font-semibold"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Rich Photo Cards Grid - identical 4-column size & h-52 image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {filteredDistricts.map((district) => (
            <div
              key={district.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
            >
              {/* Image Area (h-52: 208px - EXACT SAME AS SECTION 1 & 2) */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-900 shrink-0">
                <Image
                  src={district.image}
                  alt={district.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="backdrop-blur-md bg-white/95 text-teal-900 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/60 shadow-2xs">
                    {district.tag}
                  </span>
                  <span className="backdrop-blur-md bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-md border border-white/20 shadow-2xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {district.spaces}
                  </span>
                </div>

                {/* Bottom Overlay Pin */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                  <div className="flex items-center gap-1 text-[11px] font-semibold drop-shadow-sm text-slate-100 truncate">
                    <MapPin size={11} className="text-teal-400 shrink-0" />
                    <span className="truncate">{district.city}</span>
                  </div>
                </div>
              </div>

              {/* Content Area (Compact ~140px - EXACT SAME AS SECTION 1 & 2) */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                    Prime Corridor
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={district.name}>
                    {district.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate h-4 leading-4" title={district.desc}>
                    {district.desc}
                  </p>

                  <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                    {district.highlights.slice(0, 2).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]"
                      >
                        <Check size={10} className="text-[#0F8B7D] shrink-0" />
                        <span className="truncate">{highlight}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
                      Avg. Rental
                    </span>
                    <span className="text-xs font-black text-slate-900 leading-none">
                      {district.rate}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-none">
                      /{district.unit}
                    </span>
                  </div>

                  <Link
                    href={`/public/search?city=${encodeURIComponent(district.searchCity)}&q=${encodeURIComponent(district.searchQuery)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-xs transition-all shadow-2xs group-hover:bg-[#0F8B7D] group-hover:text-white cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
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

      {/* 7. FINAL CALL TO ACTION — MODERN LIGHT ENTERPRISE CARD */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/80 rounded-3xl p-8 sm:p-12 border border-teal-200 shadow-xl shadow-teal-900/5 text-center relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-2">
            Start Your Search Today
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Find the Perfect Commercial Space for Your Business
          </h2>
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto mb-8 font-medium">
            Join hundreds of enterprises and high-growth companies that discovered their commercial headquarters on OfficeX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all text-center"
            >
              Explore Available Spaces
            </Link>
            <button
              onClick={() => setSlideInOpen(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all cursor-pointer text-center"
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

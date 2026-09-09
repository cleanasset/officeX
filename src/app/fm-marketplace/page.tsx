"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronDown, 
  MapPin, 
  Wrench,
  ThermometerSnowflake,
  ShieldCheck,
  Sparkles,
  Flame,
  Bug,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  Building2,
  Users,
  Award,
  BadgeCheck,
  Zap,
  Check,
  FileText,
  Send,
  HelpCircle,
  Briefcase
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

interface Contractor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  slaScore: string;
  coverage: string;
  badges: string[];
  specialties: string[];
  verifiedYears: string;
  completedJobs: string;
}

export default function FMMarketplacePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Service Categories");
  const [selectedCity, setSelectedCity] = useState("All Commercial Hubs");
  
  // Interactive RFQ Modal State (Veendoor pattern)
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqStep, setRfqStep] = useState<1 | 2>(1);
  const [rfqData, setRfqData] = useState({
    category: "MEP Engineering",
    buildingArea: "50,000 - 150,000 sq.ft.",
    urgency: "Scheduled AMC (Within 30 Days)",
    preferredVendor: "",
    notes: "",
    company: "",
    contactName: "",
    phone: "",
    email: "",
    city: "Mumbai (BKC & Lower Parel)"
  });
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // Active persona tab
  const [activePersona, setActivePersona] = useState<"supers" | "owners" | "vendors">("supers");

  // Filter for contractor directory
  const [contractorFilter, setContractorFilter] = useState("all");

  const categories = [
    "MEP Engineering", 
    "HVAC Systems", 
    "Security & Guarding", 
    "Commercial Housekeeping", 
    "Fire Safety & Life Support", 
    "Pest Management",
    "Lifts & Elevators",
    "Landscaping & Horticulture"
  ];
  
  const commercialHubs = [
    "Mumbai (BKC & Lower Parel)", 
    "Bengaluru (ORR & Whitefield)", 
    "Delhi NCR (Cyber City & Noida)", 
    "Hyderabad (HITEC City & Gachibowli)", 
    "Pune (Hinjewadi & Kharadi)", 
    "Chennai (OMR & Guindy)",
    "Ahmedabad (GIFT City & SG Highway)"
  ];

  // Verified Contractor Directory Data (Veendoor.com inspired)
  const verifiedContractors: Contractor[] = [
    {
      id: "apex-electromech",
      name: "Apex ElectroMech Engineering",
      category: "MEP Engineering",
      rating: 4.9,
      reviewsCount: 142,
      responseTime: "< 30 mins",
      slaScore: "99.4%",
      coverage: "BKC, Lower Parel & Andheri East",
      badges: ["ISO 9001:2015", "Grade-A Master Contractor", "Govt Licensed 33kV"],
      specialties: ["33kV Substation AMC", "Centrifugal Chiller Overhaul", "Plumbing Pressure Pumps"],
      verifiedYears: "7+ Years on OfficeX",
      completedJobs: "1,240+ Work Orders"
    },
    {
      id: "coolbreeze-thermal",
      name: "CoolBreeze Thermal HVAC Solutions",
      category: "HVAC Systems",
      rating: 4.9,
      reviewsCount: 98,
      responseTime: "< 45 mins",
      slaScore: "99.1%",
      coverage: "Whitefield, ORR & Electronic City",
      badges: ["OEM Authorized Daikin/Carrier", "AHU Certified", "IAQ Specialists"],
      specialties: ["VRV/VRF Central Plants", "Duct Acoustics & Cleaning", "BMS Chilled Water Balancing"],
      verifiedYears: "5+ Years on OfficeX",
      completedJobs: "890+ Work Orders"
    },
    {
      id: "sterling-security",
      name: "Sterling Security & Guarding Forces",
      category: "Security & Guarding",
      rating: 4.8,
      reviewsCount: 210,
      responseTime: "< 15 mins",
      slaScore: "99.8%",
      coverage: "DLF Cyber City, Golf Course & Noida",
      badges: ["PSARA Compliant", "Ex-Defense Management", "Full Background Cleared"],
      specialties: ["Manned Corporate Guarding", "Biometric Turnstile Access", "Command Room CCTV Surveillance"],
      verifiedYears: "8+ Years on OfficeX",
      completedJobs: "3,100+ Shifts Deployed"
    },
    {
      id: "ecoclean-sanitization",
      name: "EcoClean Commercial Sanitization",
      category: "Commercial Housekeeping",
      rating: 4.8,
      reviewsCount: 185,
      responseTime: "< 60 mins",
      slaScore: "98.9%",
      coverage: "Hinjewadi, Baner & Viman Nagar",
      badges: ["Green Seal Certified", "Robotic Floor Tech", "Cradle Facade Certified"],
      specialties: ["High-Rise Facade Cradles", "Robotic Auto-Scrubbers", "Bio-Enzymatic Restroom Hygiene"],
      verifiedYears: "6+ Years on OfficeX",
      completedJobs: "2,450+ Service Cycles"
    },
    {
      id: "vertex-vertical",
      name: "Vertex Lifts & Vertical Mobility",
      category: "Lifts & Elevators",
      rating: 4.9,
      reviewsCount: 86,
      responseTime: "< 25 mins",
      slaScore: "99.7%",
      coverage: "HITEC City, Madhapur & Financial District",
      badges: ["TÜV SÜD Certified", "OEM Multi-Brand License", "24/7 Trapped Passenger Cell"],
      specialties: ["High-Speed Passenger Lifts", "Automated Rescue Device (ARD)", "Annual Hoistway Load Testing"],
      verifiedYears: "4+ Years on OfficeX",
      completedJobs: "620+ Elevator AMCs"
    },
    {
      id: "greenscape-horticulture",
      name: "GreenScape Corporate Horticulture",
      category: "Landscaping & Horticulture",
      rating: 4.8,
      reviewsCount: 114,
      responseTime: "< 3 hours",
      slaScore: "98.6%",
      coverage: "OMR, Guindy & Mount Poonamallee",
      badges: ["IGBC Biophilic Partner", "Automated Drip Certified", "Native Flora Specialists"],
      specialties: ["Atrium Living Green Walls", "Rooftop Biophilic Terraces", "Automated IoT Drip Irrigation"],
      verifiedYears: "5+ Years on OfficeX",
      completedJobs: "480+ Landscape Contracts"
    }
  ];

  const filteredContractors = contractorFilter === "all" 
    ? verifiedContractors 
    : verifiedContractors.filter(c => c.category.toLowerCase().includes(contractorFilter.toLowerCase()));

  const handleOpenRfq = (categoryName?: string, vendorName?: string) => {
    setRfqData(prev => ({
      ...prev,
      category: categoryName || prev.category,
      preferredVendor: vendorName || ""
    }));
    setRfqStep(1);
    setIsRfqModalOpen(true);
  };

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitted(true);
    setTimeout(() => {
      setRfqSubmitted(false);
      setIsRfqModalOpen(false);
      setRfqStep(1);
    }, 2800);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      
      {/* 1. UNIVERSAL STICKY MARKETING HEADER */}
      <MarketingHeader activePath="/fm-marketplace" />

      {/* 2. VEENDOOR-STYLE LIGHT HERO BANNER WITH SEARCH ENGINE & LIVE PRO COUNTER */}
      <section className="relative pt-12 md:pt-16 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0f8b7d15_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-200 bg-white text-[#0F8B7D] text-xs font-extrabold uppercase tracking-wider mb-5 shadow-2xs">
            <BadgeCheck size={14} className="text-[#0F8B7D]" />
            <span>Pre-Vetted FM Contractors · Escrow Protected Payouts</span>
          </div>
          
          {/* Solid, Crisp, High-Contrast Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.15] mb-4 max-w-4xl text-slate-900">
            Hire Verified Contractors for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F8B7D] via-teal-600 to-emerald-600">
              Commercial Facility Management
            </span>
          </h1>
          
          {/* Solid Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-3xl mx-auto mb-9 leading-relaxed">
            Connect with pre-vetted contractors for HVAC, MEP, Security, Housekeeping, and Specialized Building Engineering. Instant competitive quotes, transparent digital BOQs, and milestone escrow guarantees.
          </p>

          {/* Interactive Veendoor Search Bar */}
          <div className="w-full max-w-3xl bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-slate-200/80 flex flex-col sm:flex-row items-center gap-2 border border-slate-200 text-left">
            
            {/* Category Dropdown */}
            <div className="flex-1 relative w-full sm:w-auto">
              <div 
                onClick={() => { setCategoryOpen(!categoryOpen); setCityOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 sm:py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200"
              >
                 <div className="flex items-center gap-3 text-slate-700">
                    <SlidersHorizontal size={17} className="text-[#0F8B7D] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {selectedCategory}
                    </span>
                 </div>
                 <ChevronDown size={16} className={`text-slate-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </div>
              
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-2">
                  <div 
                    onClick={() => { setSelectedCategory("All Service Categories"); setCategoryOpen(false); }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    All Service Categories
                  </div>
                  {categories.map((cat) => (
                    <div 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className="px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-[#0F8B7D] cursor-pointer flex items-center justify-between"
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <CheckCircle2 size={14} className="text-[#0F8B7D]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 shrink-0" />

            {/* City / Commercial Hub Dropdown */}
            <div className="flex-1 relative w-full sm:w-auto">
              <div 
                onClick={() => { setCityOpen(!cityOpen); setCategoryOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 sm:py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200"
              >
                 <div className="flex items-center gap-3 text-slate-700">
                    <MapPin size={17} className="text-[#0F8B7D] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {selectedCity}
                    </span>
                 </div>
                 <ChevronDown size={16} className={`text-slate-400 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
              </div>

              {cityOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-2">
                  <div 
                    onClick={() => { setSelectedCity("All Commercial Hubs"); setCityOpen(false); }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    All Commercial Hubs
                  </div>
                  {commercialHubs.map((hub) => (
                    <div 
                      key={hub}
                      onClick={() => { setSelectedCity(hub); setCityOpen(false); }}
                      className="px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-[#0F8B7D] cursor-pointer flex items-center justify-between"
                    >
                      <span>{hub}</span>
                      {selectedCity === hub && <CheckCircle2 size={14} className="text-[#0F8B7D]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Find Verified Pros Button */}
            <button 
              onClick={() => handleOpenRfq(selectedCategory !== "All Service Categories" ? selectedCategory : undefined)}
              className="w-full sm:w-auto px-7 py-3 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Zap size={15} />
              <span>Get 3 Free Quotes</span>
            </button>
          </div>

          {/* Popular Category Chips with Live Pro Counts (Veendoor pattern in Light Theme) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-7 text-xs">
             <span className="text-slate-500 font-bold mr-1">Popular Categories:</span>
             {[
               { name: "MEP Engineering", count: "240+ Pros" },
               { name: "HVAC Systems", count: "180+ Pros" },
               { name: "Security & Guarding", count: "310+ Pros" },
               { name: "Commercial Cleaning", count: "450+ Pros" },
               { name: "Fire Safety", count: "120+ Pros" },
               { name: "Lifts & Elevators", count: "95+ Pros" }
             ].map((chip) => (
               <button 
                 key={chip.name} 
                 onClick={() => handleOpenRfq(chip.name)}
                 className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-[#0F8B7D] hover:bg-teal-50/50 transition-all cursor-pointer text-slate-700 font-bold flex items-center gap-1.5 shadow-2xs"
               >
                 <span>{chip.name}</span>
                 <span className="text-[#0F8B7D] font-extrabold text-[10px]">({chip.count})</span>
               </button>
             ))}
          </div>

        </div>
      </section>

      {/* 3. LIVE MARKETPLACE TRUST TICKER & ENTERPRISE MARQUEE */}
      <section className="bg-white py-6 border-b border-slate-200 w-full overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center border-b border-slate-100 pb-5">
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">250+</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Verified Contractors</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#0F8B7D]">₹28.5L</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Monthly GTV Run-Rate</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">&lt; 45 Mins</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Avg Emergency Dispatch</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-indigo-600">100%</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Escrow Fund Protected</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xl sm:text-2xl font-black text-slate-900">99.2%</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">SLA Compliance</p>
            </div>
          </div>
          
          <p className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 tracking-[0.25em] uppercase mt-4">
            TRUSTED BY INSTITUTIONAL COMMERCIAL LANDLORDS &amp; REITS
          </p>
        </div>

        {/* Fading Edge Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Single-Line Marquee */}
        <div className="w-full overflow-hidden whitespace-nowrap py-1">
          <div className="inline-flex items-center gap-10 md:gap-14 font-black text-slate-700 text-sm sm:text-base opacity-85 animate-marquee select-none">
            {[
              "DLF Commercial",
              "Brookfield Properties",
              "Google Campus",
              "Godrej Properties",
              "Prestige Group",
              "Morgan Stanley Real Estate",
              "Embassy REIT",
              "HSBC Commercial",
              "RMZ Corp",
              "Deloitte Workplace",
              "Tata Realty",
              "Larsen & Toubro Realty"
            ].map((company, idx) => (
              <span key={idx} className="shrink-0 hover:text-[#0F8B7D] transition-colors cursor-default flex items-center gap-2">
                <Building2 size={15} className="text-slate-400" />
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SNABBIT-INSPIRED UNIFORMED SERVICE SPECIALISTS SHOWCASE */}
      <section className="bg-slate-50/70 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 w-full border-b border-slate-200">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                Pre-Screened Uniformed Personnel
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight mt-3">
                Expert Facility Services &amp; Uniformed Professionals
              </h2>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mt-2 md:mt-0">
              Every professional dispatched through OfficeX is trained, background-audited, and deployed in standardized uniforms with digital proof of work.
            </p>
          </div>

          {/* Snabbit Visual Cards with Real Uniformed Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "hvac",
                name: "HVAC & Chiller Engineering",
                desc: "Centrifugal chillers, VRV/VRF multi-splits, cooling towers, and indoor air balance.",
                image: "/images/pro_hvac_engineer.jpg",
                badge: "OEM Authorized",
                pricing: "From ₹18,500/mo AMC",
                sla: "30-min Emergency SLA",
                count: "180+ Certified Engineers"
              },
              {
                id: "cleaning",
                name: "Commercial Sanitization",
                desc: "Grade-A lobby housekeeping, robotic auto-scrubbers, bio-hygiene, and high-rise facades.",
                image: "/images/pro_housekeeping_specialist.jpg",
                badge: "Green Seal Certified",
                pricing: "From ₹2.80/sq.ft/mo",
                sla: "Daily Audited Logs",
                count: "450+ Vetted Specialists"
              },
              {
                id: "security",
                name: "Corporate Security & Guarding",
                desc: "PSARA compliant manned guarding, visitor turnstile badge checks, and CCTV control.",
                image: "/images/pro_security_officer.jpg",
                badge: "PSARA Licensed",
                pricing: "From ₹28,000/guard/mo",
                sla: "Full Background Clear",
                count: "310+ Manned Guards"
              },
              {
                id: "mep",
                name: "MEP & High-Voltage Electrical",
                desc: "33kV electrical substations, DG auto-synchronization, thermography, and pump upkeep.",
                image: "/images/pro_mep_technician.jpg",
                badge: "33kV Govt License",
                pricing: "From ₹24,000/mo AMC",
                sla: "99.8% Uptime SLA",
                count: "240+ Master Engineers"
              },
              {
                id: "stewardship",
                name: "Turnkey Property Stewardship",
                desc: "Dedicated on-ground Property Director managing full-spectrum IFM and CAM billing.",
                image: "/images/pro_property_manager.jpg",
                badge: "Executive Leadership",
                pricing: "Custom Portfolio Scope",
                sla: "Zero-Notice Liability",
                count: "50+ Building Directors"
              },
              {
                id: "lifts",
                name: "Lifts & Vertical Mobility",
                desc: "High-speed passenger elevator AMCs, ARD safety systems, and hoistway certifications.",
                image: "/images/showcase_lifts_hd.jpg",
                badge: "TÜV SÜD Certified",
                pricing: "From ₹9,500/lift/mo",
                sla: "24/7 Trapped Cell",
                count: "95+ OEM Specialists"
              },
              {
                id: "fire",
                name: "Fire Safety & Life Support",
                desc: "Hydrant lines, smoke damper testing, statutory fire NOC renewals, and evacuation drills.",
                image: "/images/showcase_fire_hd.jpg",
                badge: "NBC / NFPA Standard",
                pricing: "From ₹15,000/audit",
                sla: "Statutory Safe Guarantee",
                count: "120+ Fire Engineers"
              },
              {
                id: "landscaping",
                name: "Biophilic Greens & Horticulture",
                desc: "Living green walls, atrium biophilic maintenance, and automated IoT drip irrigation.",
                image: "/images/showcase_landscaping_hd.jpg",
                badge: "IGBC Green Partner",
                pricing: "From ₹12,000/mo",
                sla: "Native Flora Care",
                count: "110+ Horticulturists"
              }
            ].map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with uniform personnel */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md border border-teal-200 shadow-2xs">
                      {service.badge}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {service.count}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                      {service.desc}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate Guide</span>
                        <span className="font-black text-slate-900 text-xs">{service.pricing}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {service.sla}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenRfq(service.name)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0F8B7D] text-slate-800 hover:text-white border border-slate-200 hover:border-[#0F8B7D] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. [CORE VEENDOOR FEATURE] FEATURED VERIFIED CONTRACTORS DIRECTORY */}
      <section id="contractors" className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
                Pre-Vetted Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                Featured Verified Service Providers
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Directly request quotes from contractors with audited track records, verified licenses, and active escrow accounts.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Categories" },
                { id: "mep", label: "MEP" },
                { id: "hvac", label: "HVAC" },
                { id: "security", label: "Security" },
                { id: "cleaning", label: "Housekeeping" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setContractorFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contractorFilter === f.id
                      ? "bg-[#0F8B7D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contractors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map((c) => (
              <div 
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:border-[#0F8B7D]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Category & Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-black uppercase tracking-wider border border-teal-100">
                      {c.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <BadgeCheck size={12} className="text-emerald-600" />
                      Verified Pro
                    </span>
                  </div>

                  {/* Contractor Name */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                    {c.name}
                  </h3>

                  {/* Rating & Response Metrics */}
                  <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-slate-900 font-black">{c.rating}</span>
                      <span className="text-slate-400 font-normal">({c.reviewsCount})</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock size={12} className="text-teal-600" />
                      <span>{c.responseTime}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-emerald-600 font-extrabold">{c.slaScore} SLA</span>
                  </div>

                  {/* Location & Coverage */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{c.coverage}</span>
                  </div>

                  {/* Compliance Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {c.badges.map((b, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Specialties List */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Key Capabilities</p>
                    <div className="space-y-1">
                      {c.specialties.map((s, idx) => (
                        <p key={idx} className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                          <Check size={12} className="text-teal-600 shrink-0" />
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions (Veendoor pattern) */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenRfq(c.category, c.name)}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Send size={12} />
                    <span>Request Quote</span>
                  </button>
                  <button
                    onClick={() => handleOpenRfq(c.category, c.name)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="View Profile & Credentials"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Are you a licensed commercial facility contractor?{" "}
              <Link href="/signup?role=vendor" className="text-[#0F8B7D] font-extrabold hover:underline">
                Apply to become an OfficeX Verified Pro →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 6. PROBLEM / SOLUTION MATRIX (From Redesign PDF Specification) */}
      <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Traditional FM Procurement Fails
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1.5 max-w-xl mx-auto">
              How OfficeX transforms fragmented contractor chaos into transparent, SLA-enforced operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Marketplace (Pain) */}
            <div className="bg-white rounded-2xl border border-red-200/80 p-7 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 text-red-700">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center font-black">✕</div>
                <h3 className="text-lg font-black tracking-tight">Without OfficeX Marketplace</h3>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-600 font-medium">
                {[
                  "FM vendor sourcing fragmented across WhatsApp, personal phonebooks, and unvetted referrals.",
                  "Zero comparable quotations: lack of standardized BOQs leads to arbitrary cost inflation.",
                  "Payment delays of 45 to 90 days create friction, contractor disputes, and delayed maintenance.",
                  "Zero documented performance history: contractor quality, safety compliance, and past uptime are pure guesswork.",
                  "Contractors abandon small corrective tickets to pursue larger capital projects."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-red-500 font-black shrink-0 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With OfficeX Marketplace (Outcomes) */}
            <div className="bg-gradient-to-br from-[#071324] to-[#0d2a27] text-white rounded-2xl border border-teal-500/30 p-7 shadow-xl">
              <div className="flex items-center gap-2.5 mb-5 text-teal-300">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center font-black text-teal-300">✓</div>
                <h3 className="text-lg font-black tracking-tight text-white">With OfficeX Marketplace</h3>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-200 font-medium">
                {[
                  "Verified contractor directory with audited GSTIN, PSARA clearance, workmen insurance, and SLA ratings.",
                  "Structured RFQ engine delivering 3 side-by-side comparable quotes with automated digital BOQs.",
                  "Escrow-protected milestone payments: funds held securely and released only upon verified completion.",
                  "Persistent SLA scorecard and audit trail visible on every vendor profile before you award work.",
                  "Automated emergency dispatch network guaranteeing < 45-minute on-site technician response."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PERSONA JOURNEYS ("WHO IS OFFICEX FOR?") */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
              Tailored for Every Stakeholder
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Built for Commercial Real Estate Ecosystems
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 gap-1 text-xs font-bold">
              <button
                onClick={() => setActivePersona("supers")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activePersona === "supers"
                    ? "bg-[#0F8B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Facility Managers &amp; Supers
              </button>
              <button
                onClick={() => setActivePersona("owners")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activePersona === "owners"
                    ? "bg-[#0F8B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Landlords &amp; Asset Owners
              </button>
              <button
                onClick={() => setActivePersona("vendors")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activePersona === "vendors"
                    ? "bg-[#0F8B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Service Contractors
              </button>
            </div>
          </div>

          {/* Tab Content Cards */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
            {activePersona === "supers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] text-xs font-black uppercase mb-3">
                    Operations &amp; Maintenance
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    Eliminate Emergency Contractor Scrambles
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                    When a DG synchronization fails or a 500-TR chiller trips, you cannot afford hours searching contacts. OfficeX guarantees instant emergency dispatches with pre-credentialed technicians ready with digital passes.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-bold mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Guaranteed &lt; 45-minute on-site response for critical faults</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Digital work orders with photo evidence before and after</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Unified logbook updating equipment maintenance registers</li>
                  </ul>
                  <button
                    onClick={() => handleOpenRfq()}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-black hover:bg-[#0D7A6E] transition-colors cursor-pointer"
                  >
                    Explore FM Directory
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-800">Dispatch Speed Benchmark</span>
                    <span className="text-[11px] font-bold text-emerald-600">92% Faster Resolution</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Traditional Sourcing</span>
                        <span className="font-bold text-red-600">4 to 6 Hours</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-red-100 overflow-hidden">
                        <div className="w-4/5 h-full bg-red-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>OfficeX Verified Dispatch</span>
                        <span className="font-bold text-emerald-600">32 Minutes Average</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                        <div className="w-1/4 h-full bg-[#0F8B7D] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePersona === "owners" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] text-xs font-black uppercase mb-3">
                    Financial Governance &amp; NOI
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    Transparent Competitive Bids &amp; Escrow Safety
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                    Eliminate arbitrary vendor kickbacks and opaque markups. Receive 3 comparable, itemized BOQs for every major AMC or capital overhaul, with funds protected in escrow until physical verification.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-bold mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> 15% to 22% average reduction in annual AMC expenditure</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Razorpay Nodal Escrow holds funds safely until sign-off</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> 100% auditable GST and statutory compliance documentation</li>
                  </ul>
                  <button
                    onClick={() => handleOpenRfq()}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-black hover:bg-[#0D7A6E] transition-colors cursor-pointer"
                  >
                    Compare Contractor Bids
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Portfolio Escrow Snapshot</div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Funds in Escrow</p>
                      <p className="text-base font-black text-slate-900">₹14,50,000</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Protected
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Average Savings on Tender</p>
                      <p className="text-base font-black text-[#0F8B7D]">18.4% Cost Saved</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-black">
                      Audited
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === "vendors" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] text-xs font-black uppercase mb-3">
                    Contractor Growth &amp; Payouts
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    Guaranteed Timely Payments &amp; Grade-A Tenders
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                    Stop chasing clients for 90-day overdue payments. OfficeX secures project funds in escrow before you deploy manpower, releasing money automatically upon milestone completion.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-bold mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> T+1 instant payout option upon verified milestone sign-off</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Direct access to institutional Grade-A commercial tenders</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" /> Persistent verified reputation profile and rating badges</li>
                  </ul>
                  <Link
                    href="/signup?role=vendor"
                    className="inline-block px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-black hover:bg-[#0D7A6E] transition-colors cursor-pointer"
                  >
                    Apply as Verified Contractor
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Vendor Payout Guarantee</div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-800 font-bold uppercase">Standard Payment Cycle</p>
                      <p className="text-base font-black text-emerald-900">Friday Scheduled or T+1</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-black">
                      Zero Bad Debt
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Platform Take-Rate</p>
                      <p className="text-base font-black text-slate-900">8.5% Transparent Fee</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-black">
                      No Hidden Cuts
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. 4-STEP STRUCTURED PROCUREMENT WORKFLOW */}
      <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
              Simple &amp; Frictionless
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              How OfficeX FM Marketplace Works
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              From initial scope broadcast to verified milestone payout in 4 seamless stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: "Stage 1",
                title: "Post RFQ or Pick Vendor",
                desc: "Specify your maintenance category, building square footage, and required response urgency.",
                time: "5 Minutes",
                icon: FileText
              },
              {
                step: "Stage 2",
                title: "Get 3 Itemized Quotes",
                desc: "Receive side-by-side transparent BOQs with contractor SLA scores and verified insurance.",
                time: "Within 24 Hours",
                icon: SlidersHorizontal
              },
              {
                step: "Stage 3",
                title: "Escrow-Backed Award",
                desc: "Award work order with milestone funds safely held in Razorpay Nodal Escrow before work begins.",
                time: "Instant Escrow",
                icon: DollarSign
              },
              {
                step: "Stage 4",
                title: "Verified Sign-off & Payout",
                desc: "Approve completed work with photo logs. Funds are released and persistent SLA rating is logged.",
                time: "Milestone Release",
                icon: BadgeCheck
              }
            ].map((st, idx) => {
              const Icon = st.icon;
              return (
                <div 
                  key={st.step}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-teal-50 text-[#0F8B7D] text-xs font-black uppercase tracking-wider border border-teal-100">
                        {st.step}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {st.time}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1.5">{st.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{st.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-extrabold text-[#0F8B7D]">
                    <span>Stage {idx + 1} of 4</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => handleOpenRfq()}
              className="px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Zap size={14} />
              <span>Broadcast Your First RFQ Today</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. MARKETPLACE GTV & TRANSPARENT COMMISSION LEDGER (Standout Feature) */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
              Financial Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 mb-2">
              Marketplace GTV &amp; Transparent Commission Ledger
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Real-time audit telemetry tracking transaction volume, standardized 8.5% platform commissions, and verified contractor payouts.
            </p>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                GROSS TRANSACTION VALUE (GTV)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">₹28.5L</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Last 30 Days · Q3 FY2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">
                Total commercial facility contracts executed through escrow.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                OFFICEX PLATFORM COMMISSION (8.5%)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#0F8B7D]">₹2.42L</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Transparent Fixed Take
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">
                Standardized 8.5% platform fee with zero hidden margins.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CONTRACTOR DISBURSEMENT (91.5%)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">₹26.08L</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  100% Escrow Released
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">
                Directly disbursed to verified vendors upon completed milestones.
              </p>
            </div>
          </div>

          {/* Live Settlement Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Contract Settlements &amp; SLA Compliance Log
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Audited by Escrow Nodal Bank
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="bg-slate-50/40 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-100">
                    <th className="py-3 px-6">Work Order ID</th>
                    <th className="py-3 px-6">Contractor &amp; Discipline</th>
                    <th className="py-3 px-6">Gross Contract</th>
                    <th className="py-3 px-6">OfficeX Fee (8.5%)</th>
                    <th className="py-3 px-6">Net Vendor Payout</th>
                    <th className="py-3 px-6">SLA Score</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">WO-2026-881</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">Apex ElectroMech</span>
                      <span className="text-[11px] text-slate-400">MEP Transformer Overhaul</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">₹4,20,000</td>
                    <td className="py-3.5 px-6 text-[#0F8B7D] font-bold">₹35,700</td>
                    <td className="py-3.5 px-6 text-emerald-600 font-bold">₹3,84,300</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        99.6% SLA
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} /> Settled
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">WO-2026-879</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">CoolBreeze Thermal</span>
                      <span className="text-[11px] text-slate-400">Chiller Descaling &amp; Gas Recharge</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">₹2,80,000</td>
                    <td className="py-3.5 px-6 text-[#0F8B7D] font-bold">₹23,800</td>
                    <td className="py-3.5 px-6 text-emerald-600 font-bold">₹2,56,200</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        98.8% SLA
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} /> Settled
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">WO-2026-874</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">Sterling Security Forces</span>
                      <span className="text-[11px] text-slate-400">Access Control &amp; Guard Deployment</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">₹6,50,000</td>
                    <td className="py-3.5 px-6 text-[#0F8B7D] font-bold">₹55,250</td>
                    <td className="py-3.5 px-6 text-emerald-600 font-bold">₹5,94,750</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        99.8% SLA
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} /> Settled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PLANS & PRICING SUMMARY (From Redesign PDF Specification) */}
      <section id="pricing" className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Simple, Predictable Marketplace Plans
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Procure on-demand or subscribe for portfolio-wide automated tendering and escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">FOR SINGLE BUILDINGS</span>
                <h3 className="text-xl font-black text-slate-900">Starter</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-slate-900">Free</span>
                  <span className="text-xs text-slate-400 font-semibold block mt-0.5">Forever free for basic procurement</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Browse verified contractor directory</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Up to 3 RFQ broadcasts per month</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Basic quote comparison inbox</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Standard email support</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/signup?plan=starter"
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-black transition-colors block text-center"
                >
                  Start Free
                </Link>
              </div>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-white rounded-2xl border-2 border-[#0F8B7D] p-6 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[10px] font-black uppercase tracking-wider">
                MOST POPULAR
              </div>
              <div>
                <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-widest block mb-2">FOR ACTIVE COMMERCIAL PARKS</span>
                <h3 className="text-xl font-black text-slate-900">Professional</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-slate-900">₹4,999</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month per building</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Unlimited structured RFQs &amp; BOQ generator</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Side-by-side contractor bid comparisons</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Digital work order tracking with photo logs</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Escrow payment protection on all milestones</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Persistent contractor SLA rating scorecard</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Priority phone &amp; WhatsApp support</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/signup?plan=professional"
                  className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black transition-colors block text-center shadow-md"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">FOR REITS &amp; LARGE DEVELOPERS</span>
                <h3 className="text-xl font-black text-slate-900">Enterprise</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-slate-900">Custom</span>
                  <span className="text-xs text-slate-400 font-semibold block mt-0.5">Multi-property master procurement</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Dedicated procurement account director</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Custom SLA penalty automated deductions</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Multi-site master contract consolidation</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Enterprise ERP &amp; SAP procurement sync</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#0F8B7D]" /> Full SOC-2 &amp; statutory compliance vault</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenRfq("Enterprise Procurement")}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-black transition-colors block text-center cursor-pointer"
                >
                  Contact Enterprise Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. 15-DAY STRUCTURED ONBOARDING TIMELINE */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3 bg-teal-50 text-[#0F8B7D] border border-teal-100">
              <span>Structured 15-Day Process</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
              15-Day Structured Transaction Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              From requirement scoping to contractor onboarding and escrow closing with verified audit trails.
            </p>
          </div>

          {/* 4 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                duration: "Days 1 - 3",
                title: "Register & Requirement Scoping",
                desc: "Sign up as a building owner, occupier, or contractor and configure spatial parameters and service requirements."
              },
              {
                duration: "Days 4 - 7",
                title: "Digital Verification & Pre-Vetting",
                desc: "Submit property documents or contractor statutory licenses (GSTIN, PSARA, insurance) for digital verification."
              },
              {
                duration: "Days 8 - 12",
                title: "RFP Broadcast & Bid Evaluation",
                desc: "Broadcast your requirement, receive comparable contractor quotations with standardized BOQs, and review ratings."
              },
              {
                duration: "Day 15 Go-Live",
                title: "Escrow Funding & Deal Closing",
                desc: "Award work order, fund milestone escrow securely, and commence transparent operations with zero disruption."
              }
            ].map((st) => (
              <div
                key={st.duration}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-[#0F8B7D]/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>{st.duration}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{st.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="text-[#0F8B7D] font-extrabold flex items-center gap-1">
                    Continuous Flow <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Start Onboarding Today</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Everything you need to know about contractor verification, escrow protection, and tendering.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How are FM contractors vetted and verified on OfficeX Marketplace?",
                a: "Every vendor undergoes an extensive multi-tier verification process: active GSTIN verification, PSARA security clearance validation, workmen compensation and third-party liability insurance audits, financial solvency checks, and reference interviews with commercial building managers."
              },
              {
                q: "How does Razorpay Nodal Escrow payment protection work?",
                a: "When a contract or work order is awarded, client funds are deposited into a dedicated Razorpay Nodal Escrow account. Funds remain locked until the client digitally inspects photographic proof of completion and signs off on the milestone, after which funds disburse automatically to the contractor."
              },
              {
                q: "Can we manage our existing contracted vendors through OfficeX?",
                a: "Yes. OfficeX supports vendor onboarding workflows where you can invite your current contractors to register their licenses and operate under your unified dashboard with digital work orders and SLA tracking."
              },
              {
                q: "What is the turnaround time for emergency corrective dispatches?",
                a: "Our network maintains on-call rapid response teams for MEP and HVAC breakdowns with an average on-site dispatch time under 45 minutes in major commercial corridors (such as BKC, Lower Parel, Whitefield, and DLF Cyber City)."
              },
              {
                q: "How are quotations made comparable through automated BOQs?",
                a: "Instead of receiving disparate PDF estimates with different rate cards, our structured RFQ engine breaks each job into standardized labor, material, and machinery line items. This lets you compare vendor bids side-by-side without hidden line-item surprises."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                <h3 className="text-sm sm:text-base font-black text-slate-900 mb-2 flex items-start gap-2.5">
                  <HelpCircle size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FINAL CTA BAND */}
      <section className="bg-gradient-to-r from-[#071324] via-[#093532] to-[#071324] py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-black text-teal-300 uppercase tracking-widest bg-teal-900/50 border border-teal-500/30 px-3 py-1 rounded-full">
            Modernize Your Facility Procurement
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-4 mb-3 text-white">
            Ready to Run Your Buildings with Verified Precision?
          </h2>
          <p className="text-slate-300 text-xs sm:text-base font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Join hundreds of property directors and facility superintendents who procure with escrow confidence and guaranteed SLAs on OfficeX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-lg transition-all"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => handleOpenRfq()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm transition-all cursor-pointer"
            >
              Request Vendor Consultation
            </button>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <Footer />

      {/* 15. INTERACTIVE MULTI-STEP RFQ / QUOTE CALCULATOR MODAL (Veendoor.com Pattern) */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setIsRfqModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            {rfqSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 text-[#0F8B7D]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1.5">
                  RFQ Broadcast Successfully!
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Your requirement for <strong>{rfqData.category}</strong> has been matched with 3 pre-vetted contractors. You will receive structured, comparable quotes in your inbox within 24 hours.
                </p>
                <div className="mt-6 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 font-bold">
                  Escrow Protection Active · Zero Commitment Fee
                </div>
              </div>
            ) : (
              <div>
                {/* Modal Header */}
                <div className="mb-6">
                  <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-widest bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-md">
                    INSTANT RFQ BUILDER
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    Request 3 Comparable Quotes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {rfqData.preferredVendor ? (
                      <span>Direct enquiry for <strong>{rfqData.preferredVendor}</strong></span>
                    ) : (
                      <span>Broadcast to matched verified contractors across your micro-market</span>
                    )}
                  </p>
                </div>

                <form onSubmit={handleRfqSubmit} className="space-y-4">
                  {rfqStep === 1 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          SERVICE CATEGORY
                        </label>
                        <select
                          value={rfqData.category}
                          onChange={(e) => setRfqData({ ...rfqData, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          PROPERTY CARPET AREA (SQ.FT.)
                        </label>
                        <select
                          value={rfqData.buildingArea}
                          onChange={(e) => setRfqData({ ...rfqData, buildingArea: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        >
                          <option>Up to 25,000 sq.ft.</option>
                          <option>25,000 - 50,000 sq.ft.</option>
                          <option>50,000 - 150,000 sq.ft.</option>
                          <option>150,000 - 500,000 sq.ft.</option>
                          <option>500,000+ sq.ft. (Campus / SEZ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          DISPATCH TIMELINE &amp; URGENCY
                        </label>
                        <select
                          value={rfqData.urgency}
                          onChange={(e) => setRfqData({ ...rfqData, urgency: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        >
                          <option>Immediate Emergency (&lt; 2 Hours)</option>
                          <option>Corrective Repair (Within 48 Hours)</option>
                          <option>Scheduled AMC (Within 30 Days)</option>
                          <option>Tender Bid for Next Quarter</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRfqStep(2)}
                        className="w-full mt-2 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Next: Contact &amp; Location Details</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  {rfqStep === 2 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          COMMERCIAL HUB / METRO
                        </label>
                        <select
                          value={rfqData.city}
                          onChange={(e) => setRfqData({ ...rfqData, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        >
                          {commercialHubs.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            COMPANY / BUILDING NAME
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Apex Tower"
                            value={rfqData.company}
                            onChange={(e) => setRfqData({ ...rfqData, company: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            YOUR FULL NAME
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            value={rfqData.contactName}
                            onChange={(e) => setRfqData({ ...rfqData, contactName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            WORK EMAIL
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="name@company.com"
                            value={rfqData.email}
                            onChange={(e) => setRfqData({ ...rfqData, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            MOBILE NUMBER
                          </label>
                          <input
                            required
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={rfqData.phone}
                            onChange={(e) => setRfqData({ ...rfqData, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          SPECIFIC SCOPE NOTES (OPTIONAL)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe specific equipment models, chiller tonnage, or SLA expectations..."
                          value={rfqData.notes}
                          onChange={(e) => setRfqData({ ...rfqData, notes: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRfqStep(1)}
                          className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          <Send size={13} />
                          <span>Broadcast RFQ &amp; Match Contractors</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

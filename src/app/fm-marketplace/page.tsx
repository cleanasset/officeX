"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Globe,
  HelpCircle,
  SlidersHorizontal,
  Layers,
  DollarSign,
  TrendingUp,
  Star
} from "lucide-react";

export default function FMMarketplacePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryCategory, setEnquiryCategory] = useState("MEP Services");
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "MEP Services", 
    "HVAC", 
    "Security", 
    "Cleaning", 
    "Fire Safety", 
    "Pest Control",
    "Lifts & Elevators",
    "Landscaping"
  ];
  
  const cities = [
    "Bengaluru", 
    "Mumbai", 
    "Delhi NCR", 
    "Hyderabad", 
    "Pune", 
    "Chennai",
    "Singapore",
    "Dubai"
  ];

  const handleSearch = () => {
    setEnquiryCategory(selectedCategory !== "Select Category" ? selectedCategory : "General FM");
    setIsEnquiryModalOpen(true);
  };

  const handleCardClick = (catName: string) => {
    setEnquiryCategory(catName);
    setIsEnquiryModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsEnquiryModalOpen(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      
      {/* 1. HEADER (Matching Figma Design) */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between transition-all shadow-2xs">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={48} 
              height={48} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "42px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={160} 
              height={36} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "32px" }}
            />
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link 
            href="/fm-marketplace" 
            className="text-[#0F8B7D] font-bold border-b-2 border-[#0F8B7D] pb-1"
          >
            Marketplace
          </Link>
          <button 
            onClick={() => { setEnquiryCategory("All Categories"); setIsEnquiryModalOpen(true); }}
            className="hover:text-[#0F8B7D] transition-colors pb-1 cursor-pointer"
          >
            Vendors
          </button>
          <Link 
            href="/compliance" 
            className="hover:text-[#0F8B7D] transition-colors pb-1"
          >
            Compliance
          </Link>
          <Link 
            href="/pricing" 
            className="hover:text-[#0F8B7D] transition-colors pb-1"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors"
          >
            Log In
          </Link>
          <button 
            onClick={() => { setEnquiryCategory("Enterprise FM"); setIsEnquiryModalOpen(true); }}
            className="px-6 py-2.5 rounded-lg bg-[#0F8B7D] text-white text-sm font-bold hover:bg-[#0D7A6E] shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="md:hidden p-1.5 text-slate-700 hover:text-slate-900" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-5 md:hidden text-slate-900 shadow-2xl animate-fadeIn">
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">Marketplace</Link>
          <button onClick={() => { setMobileMenuOpen(false); setIsEnquiryModalOpen(true); }} className="text-left text-base font-bold hover:text-[#0F8B7D]">Vendors</button>
          <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Compliance</Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Pricing</Link>
          <hr className="border-slate-200" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-slate-700">Log In</Link>
          <button 
            onClick={() => { setMobileMenuOpen(false); setIsEnquiryModalOpen(true); }}
            className="w-full py-3 rounded-lg bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer text-sm"
          >
            Get Started
          </button>
        </div>
      )}

      {/* 2. HERO BANNER WITH INTEGRATED FM FACILITY IMAGE (Matching Specification) */}
      <section className="relative pt-18 pb-22 px-4 sm:px-6 lg:px-8 text-center text-white w-full max-w-full overflow-hidden">
        
        {/* Photorealistic Facility Operations Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/work_fm_technician.jpg"
            alt="Skilled Facility Maintenance & HVAC Technician at Work"
            fill
            priority
            unoptimized
            className="object-cover object-center opacity-85"
            sizes="100vw"
          />
          {/* High-grade Teal-to-Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071324]/90 via-[#0b534c]/80 to-[#071324]/65 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071324]/50 via-transparent to-[#071324]/70" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-widest mb-5 shadow-2xs">
            ENTERPRISE FM SOLUTIONS
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.15] mb-4 text-white drop-shadow-sm max-w-4xl">
            The Trusted Facility Management Marketplace
          </h1>
          
          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-xs">
            Streamline your operations with verified vendors, compliance tracking, and secure escrow payments.
          </p>

          {/* Interactive Search Bar Card */}
          <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-center gap-2 border border-white/40 text-left">
            
            {/* Category Dropdown */}
            <div className="flex-1 relative w-full sm:w-auto">
              <div 
                onClick={() => { setCategoryOpen(!categoryOpen); setCityOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 sm:py-2.5 bg-transparent hover:bg-slate-50 rounded-xl sm:rounded-full cursor-pointer transition-colors"
              >
                 <div className="flex items-center gap-3 text-slate-700">
                    <SlidersHorizontal size={17} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {selectedCategory}
                    </span>
                 </div>
                 <ChevronDown size={17} className={`text-slate-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </div>
              
              {/* Category Dropdown Menu */}
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 py-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className="px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-[#0F8B7D] cursor-pointer font-medium flex items-center justify-between"
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <CheckCircle2 size={15} className="text-[#0F8B7D]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 shrink-0"></div>

            {/* City Dropdown */}
            <div className="flex-1 relative w-full sm:w-auto">
              <div 
                onClick={() => { setCityOpen(!cityOpen); setCategoryOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 sm:py-2.5 bg-transparent hover:bg-slate-50 rounded-xl sm:rounded-full cursor-pointer transition-colors"
              >
                 <div className="flex items-center gap-3 text-slate-700">
                    <MapPin size={17} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {selectedCity}
                    </span>
                 </div>
                 <ChevronDown size={17} className={`text-slate-400 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
              </div>

              {/* City Dropdown Menu */}
              {cityOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 py-2">
                  {cities.map((city) => (
                    <div 
                      key={city}
                      onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                      className="px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-[#0F8B7D] cursor-pointer font-medium flex items-center justify-between"
                    >
                      <span>{city}</span>
                      {selectedCity === city && <CheckCircle2 size={15} className="text-[#0F8B7D]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Find Vendors Button */}
            <button 
              onClick={handleSearch}
              className="w-full sm:w-auto px-7 py-3 bg-[#0F8B7D] hover:bg-[#0c7266] text-white font-bold text-sm rounded-xl sm:rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <span>Find Vendors</span>
            </button>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 text-xs font-semibold">
             <span className="text-white/80 mr-1">Popular Tags:</span>
             {["MEP", "HVAC", "Security", "Housekeeping"].map((tag, idx) => (
               <button 
                 key={idx} 
                 onClick={() => { 
                   setSelectedCategory(tag === "Housekeeping" ? "Cleaning" : tag);
                   setEnquiryCategory(tag === "Housekeeping" ? "Cleaning" : tag);
                   setIsEnquiryModalOpen(true);
                 }}
                 className="px-3.5 py-1.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer text-white"
               >
                 {tag}
               </button>
             ))}
          </div>

        </div>
      </section>

      {/* 3. TRUSTED BY ENTERPRISE LEADERS & CRE PORTFOLIOS (Single-Line Only, Diverse Leaders) */}
      <section className="bg-white py-5 border-b border-slate-200/90 w-full overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 mb-3">
          <p className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 tracking-[0.25em] uppercase">
            TRUSTED BY ENTERPRISE LEADERS &amp; REAL ESTATE DEVELOPERS
          </p>
        </div>

        {/* Smooth gradient fade edges on desktop */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Strictly Single-Line Infinite Marquee: Never wraps into a 2nd line */}
        <div className="w-full overflow-hidden whitespace-nowrap py-1">
          <div className="inline-flex items-center gap-10 md:gap-14 font-black text-slate-700 text-sm sm:text-base opacity-80 animate-marquee select-none">
            {[
              "DLF Commercial",
              "Brookfield Properties",
              "Google",
              "Godrej Properties",
              "Prestige Group",
              "Morgan Stanley",
              "Embassy REIT",
              "HSBC Commercial",
              "RMZ Corp",
              "Deloitte",
              "Tata Consultancy Services",
              "Larsen & Toubro",
              "DLF Commercial",
              "Brookfield Properties",
              "Google",
              "Godrej Properties",
              "Prestige Group",
              "Morgan Stanley",
              "Embassy REIT",
              "HSBC Commercial",
              "RMZ Corp",
              "Deloitte",
              "Tata Consultancy Services",
              "Larsen & Toubro"
            ].map((company, idx) => (
              <span key={idx} className="shrink-0 hover:text-[#0F8B7D] hover:opacity-100 transition-colors cursor-default">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPREHENSIVE FACILITY SERVICES (6 Cards Grid Matching Figma) */}
      <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight mb-3">
              Comprehensive Facility Services
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Discover vetted vendors across all major facility management categories.
            </p>
          </div>

          {/* 6 Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: MEP Services */}
            <div 
              onClick={() => handleCardClick("MEP Services")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Wrench size={22} className="text-[#0F8B7D]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F8B7D] transition-colors">
                    MEP Services
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Mechanical, Electrical, and Plumbing solutions.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>240+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: HVAC */}
            <div 
              onClick={() => handleCardClick("HVAC")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <ThermometerSnowflake size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                    HVAC
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Heating, ventilation, and air conditioning maintenance.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>180+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Security */}
            <div 
              onClick={() => handleCardClick("Security")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <ShieldCheck size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    Security
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Manned guarding, surveillance, and access control.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>310+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 4: Cleaning */}
            <div 
              onClick={() => handleCardClick("Cleaning")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Sparkles size={22} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-cyan-600 transition-colors">
                    Cleaning
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Deep cleaning, facade, and daily housekeeping.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>450+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 5: Fire Safety */}
            <div 
              onClick={() => handleCardClick("Fire Safety")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Flame size={22} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-red-500 transition-colors">
                    Fire Safety
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Audits, extinguisher maintenance, and alarm systems.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>120+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 6: Pest Control */}
            <div 
              onClick={() => handleCardClick("Pest Control")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Bug size={22} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                    Pest Control
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Commercial pest management and fumigation.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>150+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 7: Lifts & Vertical Mobility */}
            <div 
              onClick={() => handleCardClick("Lifts & Elevators")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Layers size={22} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                    Lifts &amp; Elevators
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    OEM elevator maintenance, hoistway &amp; ARD testing.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>120+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 8: Landscaping & Horticulture */}
            <div 
              onClick={() => handleCardClick("Landscaping")}
              className="bg-white p-7 rounded-2xl shadow-2xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Sparkles size={22} className="text-[#0F8B7D]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F8B7D] transition-colors">
                    Landscaping &amp; Greens
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] mt-1.5 leading-relaxed">
                    Campus horticulture, vertical gardens &amp; irrigation.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold group-hover:gap-2.5 transition-all">
                <span>90+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

          </div>

          {/* Marketplace GTV & Commission Ledger (per UI/UX Review Finding 4.3) */}
          <div className="mt-14 bg-[#071324] rounded-3xl p-6 sm:p-10 border border-slate-800 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30">
                  Platform Monetization &amp; Escrow
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Marketplace GTV &amp; Commission Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transparent pass-through commission tracking and escrow settlements across all awarded RFQs.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-300 bg-[#0A1829] px-3.5 py-1.5 rounded-xl border border-slate-700 shrink-0">
                ● Live Data · Last 30 Days (Q3 FY2026)
              </span>
            </div>

            {/* 4 Financial Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#0A1829] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Marketplace GTV</span>
                <span className="text-xl font-black text-white mt-1 block">₹28,50,000</span>
                <span className="text-[10px] text-teal-400 font-semibold mt-0.5 block">+18.2% vs last month</span>
              </div>
              <div className="bg-[#0A1829] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Awarded Work Orders</span>
                <span className="text-xl font-black text-white mt-1 block">8 Active</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">12 Under Evaluation</span>
              </div>
              <div className="bg-[#0A1829] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Platform Commission (8.5%)</span>
                <span className="text-xl font-black text-teal-300 mt-1 block">₹2,42,250</span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Auto-retained escrow</span>
              </div>
              <div className="bg-[#0A1829] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vendor Net Disbursement</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">₹26,07,750</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Milestone release (91.5%)</span>
              </div>
            </div>

            {/* Sample Settlement Row Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-2.5">Work Order ID</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5">Gross Contract</th>
                    <th className="pb-2.5">OfficeX Fee (8.5%)</th>
                    <th className="pb-2.5">Vendor Net</th>
                    <th className="pb-2.5">Vendor SLA</th>
                    <th className="pb-2.5">Escrow State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 font-mono text-white">WO-4491</td>
                    <td className="py-2.5">Chiller Overhaul (HVAC)</td>
                    <td className="py-2.5 text-white font-bold">₹8,50,000</td>
                    <td className="py-2.5 text-teal-300">₹72,250</td>
                    <td className="py-2.5 text-emerald-400 font-bold">₹7,77,750</td>
                    <td className="py-2.5 text-amber-300 font-bold">★ 4.9/5</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Milestone 2 Released</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-mono text-white">WO-4487</td>
                    <td className="py-2.5">DG 500kVA Overhaul</td>
                    <td className="py-2.5 text-white font-bold">₹5,20,000</td>
                    <td className="py-2.5 text-teal-300">₹44,200</td>
                    <td className="py-2.5 text-emerald-400 font-bold">₹4,75,800</td>
                    <td className="py-2.5 text-amber-300 font-bold">★ 4.8/5</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">In Progress</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-mono text-white">WO-4482</td>
                    <td className="py-2.5">Fire Line Pressure Audit</td>
                    <td className="py-2.5 text-white font-bold">₹2,80,000</td>
                    <td className="py-2.5 text-teal-300">₹23,800</td>
                    <td className="py-2.5 text-emerald-400 font-bold">₹2,56,200</td>
                    <td className="py-2.5 text-amber-300 font-bold">★ 5.0/5</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Completed &amp; Settled</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. HOW OFFICEX WORKS (Matching Figma Design) */}
          <div className="mt-16 sm:mt-20 bg-white rounded-3xl p-8 sm:p-12 md:p-14 shadow-sm border border-slate-200/90 relative">
             <h2 className="text-center font-black text-slate-900 text-xl sm:text-2xl mb-12 sm:mb-14">
               How OfficeX Works
             </h2>
             
             {/* Subtle Connector Line */}
             <div className="hidden md:block absolute top-[138px] left-[14%] right-[14%] h-0.5 border-t border-dashed border-slate-200 z-0"></div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center font-extrabold text-teal-800 text-sm mb-4 shadow-2xs">
                    1
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">Post Requirement</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[210px] leading-relaxed">
                    Define your SLA and budget clearly.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center font-extrabold text-teal-800 text-sm mb-4 shadow-2xs">
                    2
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">Receive Quotes</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[210px] leading-relaxed">
                    Get proposals from verified vendors.
                  </p>
                </div>

                {/* Step 3 (Highlighted in Figma) */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0F8B7D] text-white border-4 border-teal-100 flex items-center justify-center font-black text-base mb-3.5 shadow-md -mt-0.5">
                    3
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">Compare & Award</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[210px] leading-relaxed">
                    Evaluate ratings and award contract.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center font-extrabold text-teal-800 text-sm mb-4 shadow-2xs">
                    4
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">Track & Pay</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[210px] leading-relaxed">
                    Manage SLAs and pay via secure escrow.
                  </p>
                </div>

             </div>
          </div>

        </div>
      </section>

      {/* 6. ENQUIRY & RFQ MODAL */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setIsEnquiryModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-50 text-[#0F8B7D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-900">RFQ Submitted Successfully</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Verified vendors matching your criteria will reach out with competitive SLA proposals within 2 hours.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Direct Vendor RFQ
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2.5">
                  Request Bids for {enquiryCategory}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect with pre-audited, verified contractors with milestone escrow protection.
                </p>

                <form onSubmit={handleFormSubmit} className="mt-5 space-y-3.5 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="name@company.com" 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input 
                        required 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selected Category</label>
                      <select 
                        value={enquiryCategory} 
                        onChange={(e) => setEnquiryCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D] bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                      <select 
                        defaultValue={selectedCity !== "Select City" ? selectedCity : "Bengaluru"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D] bg-white"
                      >
                        {cities.map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Requirements & Scope</label>
                    <textarea 
                      rows={2}
                      placeholder="Specify building area, monthly budget, or SLA expectations..." 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F8B7D]"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                  >
                    Submit RFQ & Get Verified Quotes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. FOOTER (Matching Figma Dark Navy Design) */}
      <footer className="bg-[#0B1528] text-slate-400 text-xs py-14 sm:py-16 px-4 sm:px-8 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo-removebg-preview.png" 
                alt="OfficeX Logo" 
                width={40} 
                height={40} 
                className="brightness-200"
                style={{ width: "auto", height: "36px" }}
              />
              <span className="text-white font-black text-xl tracking-wider">OFFICEX</span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed max-w-sm">
              The leading B2B marketplace for facility management services. Ensuring trust, compliance, and quality for enterprises.
            </p>
          </div>

          {/* Solutions Col */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Solutions</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => { setEnquiryCategory("Enterprise FM"); setIsEnquiryModalOpen(true); }} className="hover:text-white transition-colors cursor-pointer text-left">For Enterprises</button></li>
              <li><button onClick={() => { setEnquiryCategory("Vendor Onboarding"); setIsEnquiryModalOpen(true); }} className="hover:text-white transition-colors cursor-pointer text-left">For Vendors</button></li>
              <li><button onClick={() => router.push('/compliance')} className="hover:text-white transition-colors cursor-pointer text-left">Escrow Payments</button></li>
              <li><button onClick={() => router.push('/platform')} className="hover:text-white transition-colors cursor-pointer text-left">Compliance API</button></li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Vendor Agreement</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Trust & Safety Center</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 OfficeX by Scalezix Ventures LLP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Globe size={14} />
              <span>Global</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <HelpCircle size={14} />
              <span>Help Center</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

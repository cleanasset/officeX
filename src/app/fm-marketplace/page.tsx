"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { 
  ChevronDown, 
  MapPin, 
  Search,
  Wrench,
  ThermometerSnowflake,
  ShieldCheck,
  Sparkles,
  Flame,
  Bug,
  ArrowRight,
  Menu,
  X
} from "lucide-react";

export default function FMMarketplacePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [selectedCity, setSelectedCity] = useState("Select City");

  const categories = ["MEP", "HVAC", "Security", "Cleaning", "Fire Safety", "Pest Control", "Housekeeping"];
  const cities = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai"];

  const handleSearch = () => {
    // In a real app, this would route to a search results page with params
    router.push(`/dashboard?cat=${selectedCategory}&city=${selectedCity}`);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between transition-all shadow-2xs relative">
        <div className="flex items-center shrink-0 lg:w-[250px]">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={60} 
              height={60} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "50px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={200} 
              height={44} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "38px" }}
            />
          </Link>
        </div>

        <nav className="hidden lg:flex flex-1 justify-center items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600">
          <Link href="/discover" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Buy / Lease</Link>
          <Link href="/fm-marketplace" className="text-[#0F8B7D] font-bold whitespace-nowrap">FM Services</Link>
          <Link href="/operations" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">SaaS Platform</Link>
          <Link href="/managed-services" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Managed Services</Link>
          <Link href="/intelligence" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Intelligence</Link>
        </nav>

        <div className="hidden md:flex items-center justify-end gap-4 shrink-0 lg:w-[250px]">
          <a href="/login" className="text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors px-2">
            Sign In
          </a>
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-[#0F8B7D] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0D7A6E] shadow-md transition-all cursor-pointer"
          >
            Book a Demo
          </button>
        </div>

        <button className="md:hidden p-1 text-slate-700 hover:text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-5 md:hidden text-slate-900 shadow-2xl animate-fadeIn">
          <Link href="/discover" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Buy / Lease</Link>
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">FM Services</Link>
          <Link href="/operations" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">SaaS Platform</Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Managed Services</Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Intelligence</Link>
          <hr className="border-slate-200" />
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-full bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer text-sm"
          >
            Book a Demo
          </button>
        </div>
      )}

      {/* HERO SECTION (Gradient matching Figma design) */}
      <section className="bg-gradient-to-br from-[#0e746a] to-[#4068c2] pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden text-center text-white w-full max-w-full">
        
        {/* Top Pill */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
          ENTERPRISE FM SOLUTIONS
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          India's Trusted Facility Management Marketplace
        </h1>
        
        <p className="text-sm sm:text-base text-white/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Streamline your operations with verified vendors, compliance tracking, and secure escrow payments.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-full p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/40 relative z-20">
          
          {/* Category Dropdown */}
          <div className="flex-1 relative w-full sm:w-auto">
            <div 
              onClick={() => { setCategoryOpen(!categoryOpen); setCityOpen(false); }}
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg sm:rounded-full cursor-pointer border border-slate-200 transition-colors"
            >
               <div className="flex items-center gap-2 text-slate-700">
                  <Search size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold truncate max-w-[140px]">{selectedCategory}</span>
               </div>
               <ChevronDown size={16} className={`text-slate-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </div>
            
            {/* Category Menu */}
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left">
                <div className="max-h-48 overflow-y-auto py-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className="px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer font-medium"
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block w-px h-10 bg-slate-200 shrink-0"></div>

          {/* City Dropdown */}
          <div className="flex-1 relative w-full sm:w-auto">
            <div 
              onClick={() => { setCityOpen(!cityOpen); setCategoryOpen(false); }}
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg sm:rounded-full cursor-pointer border border-slate-200 transition-colors"
            >
               <div className="flex items-center gap-2 text-slate-700">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold truncate max-w-[140px]">{selectedCity}</span>
               </div>
               <ChevronDown size={16} className={`text-slate-500 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
            </div>

            {/* City Menu */}
            {cityOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left">
                <div className="max-h-48 overflow-y-auto py-2">
                  {cities.map((city) => (
                    <div 
                      key={city}
                      onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                      className="px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer font-medium"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0F8B7D] hover:bg-[#0c7266] text-white font-bold text-sm rounded-lg sm:rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            Find Vendors
          </button>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs font-semibold relative z-10">
           <span className="text-white/70 mr-1">Popular Tags:</span>
           {["MEP", "HVAC", "Security", "Housekeeping"].map((tag, idx) => (
             <span 
               key={idx} 
               onClick={() => setSelectedCategory(tag)}
               className="px-3 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
             >
               {tag}
             </span>
           ))}
        </div>

      </section>

      {/* TRUSTED BY TICKER */}
      <section className="bg-white py-6 border-b border-slate-200 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-4">
            TRUSTED BY ENTERPRISE LEADERS
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-60 grayscale font-black text-slate-800 text-sm md:text-base">
            <span>TCS</span>
            <span>Wipro</span>
            <span>Infosys</span>
            <span>DLF</span>
            <span>Godrej Properties</span>
            <span className="hidden lg:block">TCS</span>
            <span className="hidden lg:block">Wipro</span>
            <span className="hidden lg:block">Infosys</span>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE FACILITY SERVICES GRID */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 w-full max-w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Comprehensive Facility Services</h2>
            <p className="text-slate-500 text-sm font-medium">Discover vetted vendors across all major facility management categories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Wrench size={18} className="text-[#0F8B7D]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">MEP Services</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Mechanical, Electrical, and Plumbing solutions.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>240+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ThermometerSnowflake size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">HVAC</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Heating, ventilation, and air conditioning maintenance.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>180+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Security</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Manned guarding, surveillance, and access control.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>310+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cleaning</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Deep cleaning, facade, and daily housekeeping.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>450+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Flame size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Fire Safety</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Audits, extinguisher maintenance, and alarm systems.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>120+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Bug size={18} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pest Control</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Commercial pest management and fumigation.</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5 text-[#0F8B7D] text-xs font-bold hover:gap-2 transition-all cursor-pointer">
                <span>150+ Vendors</span>
                <ArrowRight size={14} />
              </div>
            </div>

          </div>

          {/* HOW OFFICEX WORKS (Process Steps) */}
          <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-md border border-slate-200 relative">
             <h2 className="text-center font-black text-slate-900 text-xl mb-12">How OfficeX Works</h2>
             
             {/* Dotted Line connecting circles (Hidden on mobile) */}
             <div className="hidden md:block absolute top-32 left-[15%] right-[15%] h-px border-t-2 border-dashed border-slate-200 z-0"></div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-500 mb-4 z-10 shadow-sm">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Post Requirement</h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">Define your SLA and budget clearly.</p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-500 mb-4 z-10 shadow-sm">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Receive Quotes</h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">Get proposals from verified vendors.</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0F8B7D] text-white border-4 border-teal-100 flex items-center justify-center font-bold text-lg mb-4 z-10 shadow-md">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Compare & Award</h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">Evaluate ratings and award contract.</p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-500 mb-4 z-10 shadow-sm">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Track & Pay</h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">Manage SLAs and pay via secure escrow.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

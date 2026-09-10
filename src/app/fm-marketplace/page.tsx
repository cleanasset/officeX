"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Phone,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building2,
  Wrench,
  Zap,
  Sparkles,
  Award,
  Shield,
  Check,
  FileText,
  ChevronRight,
  TrendingUp,
  Filter,
  ExternalLink,
  Flame,
  Bug,
  HelpCircle,
  Briefcase,
  SlidersHorizontal,
  X
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

interface Vendor {
  id: string;
  name: string;
  category: string;
  initials: string;
  rating: number;
  reviewsCount: number;
  yearsInBusiness: string;
  phone: string;
  location: string;
  verified: boolean;
  tier: "Elite" | "Verified Pro" | "Premium";
  description: string;
  specialties: string[];
  responseTime: string;
  image?: string;
}

export default function FMMarketplacePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedVendorForClaim, setSelectedVendorForClaim] = useState<Vendor | null>(null);

  // Veendoor 8 Core Service Categories with pastel accent icon containers
  const serviceCategories = [
    {
      id: "plumbing",
      name: "Plumbing & Piping",
      count: "340+ Vendors",
      icon: Wrench,
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      desc: "Drain clearing, hydro-jetting, booster pumps & backflow prevention"
    },
    {
      id: "electrical",
      name: "Electrical Systems",
      count: "280+ Vendors",
      icon: Zap,
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      desc: "Substations, DG backup, panel maintenance & compliance audits"
    },
    {
      id: "hvac",
      name: "HVAC & Climate Control",
      count: "410+ Vendors",
      icon: Sparkles,
      bg: "bg-rose-50 text-rose-600 border-rose-100",
      desc: "Chiller overhauls, VRV/VRF systems, duct sanitization & IAQ"
    },
    {
      id: "housekeeping",
      name: "Commercial Housekeeping",
      count: "520+ Vendors",
      icon: Sparkles,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      desc: "Deep sanitization, facade cleaning cradles & robotic scrubbing"
    },
    {
      id: "security",
      name: "Security & Guarding",
      count: "260+ Vendors",
      icon: ShieldCheck,
      bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      desc: "PSARA vetted manned guards, biometric access & CCTV rooms"
    },
    {
      id: "fire",
      name: "Fire Safety & Life Support",
      count: "190+ Vendors",
      icon: Flame,
      bg: "bg-orange-50 text-orange-600 border-orange-100",
      desc: "Hydrant lines, smoke damper tests, NOC audits & alarms"
    },
    {
      id: "lifts",
      name: "Elevators & Mobility",
      count: "175+ Vendors",
      icon: Building2,
      bg: "bg-purple-50 text-purple-600 border-purple-100",
      desc: "High-speed traction lifts, escalators & 24/7 rescue dispatch"
    },
    {
      id: "landscaping",
      name: "Landscaping & Greenery",
      count: "210+ Vendors",
      icon: CheckCircle2,
      bg: "bg-teal-50 text-teal-600 border-teal-100",
      desc: "Vertical living walls, biophilic landscaping & automated drip"
    }
  ];

  // Veendoor-Style Featured Service Providers
  const featuredVendors: Vendor[] = [
    {
      id: "vendor-1",
      name: "Apex ElectroMech Engineering",
      category: "MEP & Electrical",
      initials: "AE",
      rating: 4.9,
      reviewsCount: 142,
      yearsInBusiness: "15+ years",
      phone: "+91 22 4982 1100",
      location: "BKC & Lower Parel, Mumbai",
      verified: true,
      tier: "Elite",
      description: "Master electromechanical contractors handling 33kV substation overhauls, primary chiller plant AMCs, and pressure booster arrays.",
      specialties: ["33kV Substation AMC", "Centrifugal Chiller Overhaul", "Plumbing Pumps"],
      responseTime: "< 30 mins",
      image: "/images/pro_mep_technician.jpg"
    },
    {
      id: "vendor-2",
      name: "CoolBreeze Thermal HVAC Solutions",
      category: "HVAC Systems",
      initials: "CB",
      rating: 4.9,
      reviewsCount: 98,
      yearsInBusiness: "12+ years",
      phone: "+91 80 6710 4420",
      location: "Outer Ring Road & Whitefield, Bengaluru",
      verified: true,
      tier: "Verified Pro",
      description: "Authorized central HVAC engineers specializing in VRV/VRF systems, chilled water balancing, and cleanroom duct acoustics.",
      specialties: ["VRV/VRF Central Plants", "Duct Sanitization", "BMS Chilled Water"],
      responseTime: "< 45 mins",
      image: "/images/pro_hvac_engineer.jpg"
    },
    {
      id: "vendor-3",
      name: "Sterling Security & Guarding Forces",
      category: "Security & Guarding",
      initials: "SS",
      rating: 4.8,
      reviewsCount: 210,
      yearsInBusiness: "18+ years",
      phone: "+91 11 4105 8890",
      location: "Cyber City & Golf Course, Gurugram",
      verified: true,
      tier: "Elite",
      description: "PSARA compliant corporate security solutions, manned turnstile guards, command room CCTV operators, and executive escorts.",
      specialties: ["Manned Guarding", "Biometric Access Control", "24/7 CCTV Control Room"],
      responseTime: "< 15 mins",
      image: "/images/pro_security_officer.jpg"
    },
    {
      id: "vendor-4",
      name: "EcoClean Commercial Sanitization",
      category: "Commercial Housekeeping",
      initials: "EC",
      rating: 4.8,
      reviewsCount: 185,
      yearsInBusiness: "10+ years",
      phone: "+91 20 6640 2210",
      location: "Hinjewadi & Kharadi, Pune",
      verified: true,
      tier: "Verified Pro",
      description: "Grade-A corporate facility cleaning, robotic floor scrubbers, high-rise cradle facade washing, and Green Seal consumables.",
      specialties: ["High-Rise Facade Cradles", "Robotic Auto-Scrubbers", "Restroom Hygiene"],
      responseTime: "< 60 mins",
      image: "/images/pro_housekeeping_specialist.jpg"
    },
    {
      id: "vendor-5",
      name: "Vertex Lifts & Vertical Mobility",
      category: "Elevators & Mobility",
      initials: "VL",
      rating: 4.9,
      reviewsCount: 86,
      yearsInBusiness: "14+ years",
      phone: "+91 40 4488 3320",
      location: "HITEC City, Hyderabad",
      verified: true,
      tier: "Premium",
      description: "Multi-brand elevator maintenance, high-speed passenger hoistways, automated rescue devices (ARD), and certified annual load tests.",
      specialties: ["Passenger Lift AMC", "Automated Rescue Devices", "Hoistway Load Testing"],
      responseTime: "< 25 mins",
      image: "/images/showcase_lifts_hd.jpg"
    },
    {
      id: "vendor-6",
      name: "GreenScape Corporate Horticulture",
      category: "Landscaping & Greenery",
      initials: "GS",
      rating: 4.8,
      reviewsCount: 114,
      yearsInBusiness: "9+ years",
      phone: "+91 44 2855 7760",
      location: "OMR & Guindy, Chennai",
      verified: true,
      tier: "Verified Pro",
      description: "Turnkey biophilic design, double-height atrium living walls, rooftop garden terraces, and automated IoT smart drip irrigation.",
      specialties: ["Living Green Walls", "Rooftop Biophilic Terraces", "Automated Smart Drip"],
      responseTime: "< 3 hours",
      image: "/images/showcase_landscaping_hd.jpg"
    }
  ];

  // Membership Tiers (Veendoor Pricing Model)
  const pricingTiers = [
    {
      name: "Basic Listing",
      price: "Free",
      period: "forever",
      desc: "Essential directory visibility for emerging contractors and independent trade specialists.",
      badge: "Starter",
      popular: false,
      btnColor: "bg-slate-100 hover:bg-slate-200 text-slate-800",
      btnText: "Get Started Free",
      features: [
        "Business profile & contact info",
        "1 primary service category",
        "Standard directory visibility",
        "Direct client quote requests",
        "OfficeX verified badge eligible"
      ]
    },
    {
      name: "Verified Pro",
      price: "₹2,499",
      period: "per month",
      desc: "The standard choice for licensed FM contractors seeking steady commercial leads.",
      badge: "Most Popular",
      popular: true,
      btnColor: "bg-[#2563EB] hover:bg-blue-700 text-white shadow-md",
      btnText: "Start 14-Day Free Trial",
      features: [
        "Blue 'VERIFIED PRO' trust badge",
        "Up to 5 service categories & hubs",
        "Priority placement in search results",
        "Verified customer reviews showcase",
        "Fast-track 24hr license audit",
        "Direct click-to-call phone display"
      ]
    },
    {
      name: "Premium Partner",
      price: "₹6,999",
      period: "per month",
      desc: "For mid-sized FM companies competing for multi-building corporate maintenance AMCs.",
      badge: "High Growth",
      popular: false,
      btnColor: "bg-slate-900 hover:bg-slate-800 text-white shadow-md",
      btnText: "Upgrade to Partner",
      features: [
        "All Verified Pro features included",
        "Access to commercial RFP tender board",
        "Hero banner branding on category page",
        "Dedicated account manager & SLA desk",
        "Unlimited service categories & regions",
        "Monthly lead & performance analytics"
      ]
    },
    {
      name: "Elite Showcase",
      price: "₹14,999",
      period: "per month",
      desc: "For institutional Grade-A facilities management conglomerates and OEM networks.",
      badge: "Enterprise",
      popular: false,
      btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
      btnText: "Contact Enterprise Sales",
      features: [
        "Top-of-page featured spotlight",
        "Custom video showcases & portfolio",
        "API integration with building CAFM",
        "Multi-city enterprise tender bidding",
        "Escrow protected milestone payouts",
        "Quarterly vendor governance reports"
      ]
    }
  ];

  // Industry Insights (Veendoor Maintenance Hub)
  const maintenanceHubArticles = [
    {
      id: "art-1",
      category: "Facility Management",
      readTime: "5 min read",
      date: "Aug 28, 2026",
      title: "How to Vet a Reliable HVAC Contractor for Grade-A Commercial Towers",
      excerpt: "Key criteria every property manager must verify before signing an annual chilled water and VRV maintenance agreement."
    },
    {
      id: "art-2",
      category: "SLA & Compliance",
      readTime: "4 min read",
      date: "Sep 02, 2026",
      title: "Essential Preventative Maintenance Checklist for Modern Commercial Properties",
      excerpt: "A monthly cadence covering 33kV electrical panels, pressure relief valves, smoke dampers, and facade cradles."
    },
    {
      id: "art-3",
      category: "Vendor Governance",
      readTime: "6 min read",
      date: "Sep 06, 2026",
      title: "Escrow Protection & SLA Governance in Facility Contractor Engagements",
      excerpt: "How structured digital milestones and audit logs eliminate dispute overhead between property owners and FM service crews."
    }
  ];

  const filteredVendors = selectedCategoryFilter === "All"
    ? featuredVendors
    : featuredVendors.filter(v => v.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchService) params.set("service", searchService);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/public/search?type=fm&${params.toString()}`);
  };

  const handleClaimBusiness = (vendor: Vendor) => {
    setSelectedVendorForClaim(vendor);
    setClaimModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <MarketingHeader />

      {/* 1. VEENDOOR-STYLE HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200 overflow-hidden">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb10_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Search Card, Trust Stats */}
            <div className="lg:col-span-7 text-left">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/70 text-[#2563EB] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
                <ShieldCheck size={14} className="text-[#2563EB]" />
                <span>The Premier Property Services Network</span>
              </div>

              {/* Veendoor-Exact Headline with Blue Accent */}
              <h1 className="text-3xl sm:text-5xl md:text-[52px] font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
                Connect with <span className="text-[#2563EB]">Trusted Professionals</span>
              </h1>

              {/* Subhead */}
              <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-xl mb-7 leading-relaxed">
                The premier network for property managers and building supers to find vetted contractors, certified engineers, and building maintenance providers.
              </p>

              {/* Veendoor Interactive Search Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-4 sm:p-5 mb-8">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Service needed input */}
                  <div className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563EB] flex items-center gap-2.5 transition-all">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      placeholder="Service needed (e.g., HVAC, Plumbing, Electrical)..."
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Location input */}
                  <div className="sm:w-56 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563EB] flex items-center gap-2.5 transition-all">
                    <MapPin size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Location, city, or hub..."
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Find Vendors CTA */}
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Find Vendors</span>
                    <ArrowRight size={15} />
                  </button>
                </form>

                {/* Quick Service Pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Popular:</span>
                  {["Plumbing", "Electrical", "HVAC", "Housekeeping", "Security"].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setSearchService(pill)}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] text-slate-600 font-semibold transition-colors cursor-pointer text-[11px]"
                    >
                      {pill}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setSearchService(""); setSelectedCategoryFilter("All"); }}
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[11px] cursor-pointer hover:underline"
                  >
                    All Services →
                  </button>
                </div>
              </div>

              {/* Veendoor Trust Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-black text-slate-900 leading-none">2,500+</span>
                    <span className="text-[11px] text-slate-500 font-semibold">Verified Vendors</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-black text-slate-900 leading-none">100%</span>
                    <span className="text-[11px] text-slate-500 font-semibold">Vetted Pros</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-black text-slate-900 leading-none">4.9 / 5</span>
                    <span className="text-[11px] text-slate-500 font-semibold">Avg Rating</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 2x2 Asymmetric Media Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
                <Image
                  src="/images/pro_hvac_engineer.jpg"
                  alt="HVAC Certified Technician"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#2563EB] font-black text-[10px] px-2.5 py-1 rounded-md shadow-2xs">
                  HVAC &amp; Chillers
                </span>
              </div>

              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200 mt-4 group">
                <Image
                  src="/images/pro_mep_technician.jpg"
                  alt="MEP Electrical Engineer"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#2563EB] font-black text-[10px] px-2.5 py-1 rounded-md shadow-2xs">
                  Electrical &amp; DG
                </span>
              </div>

              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200 -mt-2 group">
                <Image
                  src="/images/pro_housekeeping_specialist.jpg"
                  alt="Corporate Sanitization Specialist"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#2563EB] font-black text-[10px] px-2.5 py-1 rounded-md shadow-2xs">
                  Commercial Hygiene
                </span>
              </div>

              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200 mt-2 group">
                <Image
                  src="/images/pro_security_officer.jpg"
                  alt="PSARA Corporate Security Guard"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#2563EB] font-black text-[10px] px-2.5 py-1 rounded-md shadow-2xs">
                  Guarding &amp; Access
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VEENDOOR SERVICE CATEGORIES GRID ("Find Services by Category") */}
      <section className="py-14 md:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#2563EB] block mb-1">
            Service Directory
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Find Services by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Browse our curated network of vetted professionals by trade and specialized property discipline
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSearchService(cat.name);
                  setSelectedCategoryFilter(cat.name);
                  const el = document.getElementById("vendors-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 duration-300 ${cat.bg}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#2563EB] transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                    {cat.count}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all flex items-center gap-0.5 font-bold">
                    Browse <ChevronRight size={14} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. VALUE PROPOSITION ("Why Choose OfficeX Pro?") */}
      <section className="py-14 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#2563EB] block mb-1">
              Quality Assurance
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Why Choose OfficeX Pro?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              We make finding, auditing, and contracting reliable building service providers simple and stress-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-blue-100/80 text-[#2563EB] flex items-center justify-center mb-4 shadow-2xs">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Pre-Vetted Professionals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every vendor is screened for valid government licensing, active liability insurance, and audited safety standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center mb-4 shadow-2xs">
                <Clock size={26} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Save Time &amp; Money</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skip tedious multi-week procurement phases. Access qualified commercial contractors with pre-negotiated rate cards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs">
                <Users size={26} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Verified Reviews</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read honest, audited feedback from fellow enterprise facility managers, property developers, and building supers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-4 shadow-2xs">
                <Award size={26} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">Quality SLA Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All vendors commit to defined SLA response times, work order digital logs, and escrow-backed milestone payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VEENDOOR FEATURED SERVICE PROVIDERS SHOWCASE */}
      <section id="vendors-section" className="py-14 md:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#2563EB] block mb-1">
              Top-Rated Contractors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Service Providers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Discover top-rated professionals across all membership tiers — from verified experts to elite partners
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 md:mt-0">
            {["All", "MEP", "HVAC", "Security", "Housekeeping"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedCategoryFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryFilter === f
                    ? "bg-[#2563EB] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="p-5">
                {/* Header: Initials Avatar + Name + Verified Badge */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                    {vendor.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                        {vendor.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] font-black text-[10px] tracking-wider uppercase">
                        <CheckCircle2 size={11} /> VERIFIED
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">•</span>
                      <span className="text-[11px] font-bold text-slate-500 truncate">{vendor.category}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{vendor.location}</span>
                </div>

                {/* Rating + Reviews + Experience Row */}
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-2.5 mb-3.5 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-black text-slate-900">{vendor.rating}</span>
                    <span className="text-slate-400 font-normal">({vendor.reviewsCount})</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="text-slate-600 font-medium">
                    {vendor.yearsInBusiness}
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="text-emerald-700 font-bold">
                    {vendor.responseTime}
                  </div>
                </div>

                {/* Phone click-to-call link */}
                <a
                  href={`tel:${vendor.phone.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:underline mb-3"
                >
                  <Phone size={13} />
                  <span>{vendor.phone}</span>
                </a>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3.5">
                  {vendor.description}
                </p>

                {/* Specialty Tags */}
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.map((spec, i) => (
                    <span key={i} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSlideInOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-extrabold text-xs transition-all text-center cursor-pointer"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleClaimBusiness(vendor)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all text-center cursor-pointer"
                >
                  Claim Business
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Browse All CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/public/search?type=fm"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 font-black text-xs sm:text-sm transition-all"
          >
            <span>Browse All 2,500+ Service Providers</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 5. VEENDOOR ROYAL BLUE VENDOR ACQUISITION CTA BANNER */}
      <section className="py-14 md:py-18 bg-[#2563EB] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Vendor Value Props & CTA */}
            <div className="lg:col-span-7 text-left">
              <span className="text-xs font-black uppercase tracking-widest text-blue-200 block mb-2">
                Join the Network
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-[42px] font-black tracking-tight leading-[1.18] mb-4 text-white">
                Are You a Service Provider?
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-xl mb-6 font-medium leading-relaxed">
                Join thousands of trusted professionals already connecting with commercial property managers and building supers through OfficeX.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Award size={16} className="text-white" />
                  </div>
                  <span>Get verified and stand out from unvetted competitors</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-white" />
                  </div>
                  <span>Access exclusive commercial property maintenance RFPs &amp; tender leads</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <span>Manage your digital profile, verified reviews, and milestone payouts</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setSlideInOpen(true)}
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#2563EB] font-black text-xs sm:text-sm shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Find &amp; Claim Your Business</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Column: 3-Step Setup Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 text-white">
              <h3 className="text-lg font-black mb-1">Quick &amp; Easy Setup</h3>
              <p className="text-xs text-blue-100 mb-6">
                Complete the verification process in just a few minutes and start receiving qualified leads.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#2563EB] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">Search or Create Listing</h4>
                    <p className="text-[11px] text-blue-100">Find your existing business profile or register a new commercial entity.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#2563EB] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">Get Verified in 24–48 Hours</h4>
                    <p className="text-[11px] text-blue-100">Upload licensing, GST, and insurance documents for compliance audit.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#2563EB] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">Start Receiving Quality Leads</h4>
                    <p className="text-[11px] text-blue-100">Direct quote inquiries from Grade-A property owners and building supers.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. VEENDOOR PRICING TIERS ("Choose Your Professional Tier") */}
      <section className="py-14 md:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#2563EB] block mb-1">
            Membership Plans
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Choose Your Professional Tier
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Start with a free listing and upgrade as your commercial business grows. No long-term contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? "border-[#2563EB] ring-2 ring-blue-600/20 shadow-xl"
                  : "border-slate-200 shadow-2xs hover:shadow-md"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-xs">
                  {tier.badge}
                </span>
              )}

              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">{tier.name}</h3>
                <p className="text-xs text-slate-500 mb-4 min-h-[36px]">{tier.desc}</p>

                <div className="mb-5 pb-4 border-b border-slate-100">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-1">/{tier.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6 text-xs text-slate-600 font-medium">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[#2563EB] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSlideInOpen(true)}
                className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all cursor-pointer text-center ${tier.btnColor}`}
              >
                {tier.btnText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
          Need a custom enterprise multi-city procurement contract?{" "}
          <button
            type="button"
            onClick={() => setSlideInOpen(true)}
            className="text-[#2563EB] font-bold hover:underline cursor-pointer"
          >
            Contact Enterprise Sales →
          </button>
        </div>
      </section>

      {/* 7. THE MAINTENANCE HUB (Industry Insights & Blog Cards) */}
      <section className="py-14 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#2563EB] block mb-1">
                The Maintenance Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Industry Insights &amp; Resources
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Stay ahead with expert advice, preventative checklists, and operational best practices
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSlideInOpen(true)}
              className="text-xs font-black text-[#2563EB] hover:underline flex items-center gap-1 mt-3 sm:mt-0 cursor-pointer"
            >
              <span>View All Articles</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {maintenanceHubArticles.map((art) => (
              <div
                key={art.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-3">
                    <span className="bg-blue-50 text-[#2563EB] px-2.5 py-0.5 rounded-full border border-blue-100">
                      {art.category}
                    </span>
                    <span>{art.date} • {art.readTime}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#2563EB] transition-colors mb-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setSlideInOpen(true)}
                    className="text-xs font-bold text-[#2563EB] group-hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Claim Business Modal */}
      {claimModalOpen && selectedVendorForClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Claim Business Listing
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Verify your ownership of <strong className="text-slate-800">{selectedVendorForClaim.name}</strong> to manage ratings, update rate cards, and receive leads.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setClaimModalOpen(false);
                setSlideInOpen(true);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Official Business Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                Submit Claim Verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Slide-In Drawer */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["fm-marketplace"] }}
      />

      <Footer />
    </div>
  );
}

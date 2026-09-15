"use client";

import React, { useState, useMemo } from "react";
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
  X,
  ChevronDown,
  Layers,
  Calendar,
  Send,
  Building,
  CheckCheck,
  Landmark,
  DollarSign,
  Calculator,
  Lock,
  Percent,
  ArrowDownRight,
  RefreshCw,
  Receipt
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
  city: string;
  location: string;
  verified: boolean;
  tier: "Elite Partner" | "Verified Partner" | "Institutional";
  description: string;
  specialties: string[];
  responseTime: string;
  image: string;
  complianceBadges: string[];
  completedProjects: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  shortName: string;
  count: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  image: string;
  desc: string;
  cities: string[];
  contractType: string;
  sla: string;
  popularServices: string[];
}

export default function FMMarketplacePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"directory" | "commission">("directory");
  const [calcCategory, setCalcCategory] = useState("hvac");
  const [calcAmount, setCalcAmount] = useState(500000);
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState<"all" | "amc" | "ondemand">("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedCityFilter, setSelectedCityFilter] = useState("All Cities");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedVendorForClaim, setSelectedVendorForClaim] = useState<Vendor | null>(null);
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [selectedVendorForRfq, setSelectedVendorForRfq] = useState<Vendor | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqBudget, setRfqBudget] = useState("₹5,00,000 - ₹10,00,000");
  const [rfqTimeline, setRfqTimeline] = useState("Immediate (< 7 days)");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Commission rates by category
  const commissionRatesByCategory: Record<string, { pct: number; label: string }> = {
    hvac: { pct: 10, label: "HVAC & Chillers" },
    mep: { pct: 10, label: "MEP & Electrical" },
    security: { pct: 8, label: "Security & Guarding" },
    housekeeping: { pct: 12, label: "Commercial Hygiene" },
    elevators: { pct: 7.5, label: "Elevators & Mobility" },
    fire: { pct: 10, label: "Fire Safety & Life Support" },
    landscaping: { pct: 12, label: "Landscaping & Horticulture" },
    pest: { pct: 15, label: "Pest & Vector Defense" },
  };

  const sampleLedgerTransactions = [
    {
      id: "tx-101",
      orderNumber: "WO-HVAC-2026-881",
      vendorName: "Johnson Controls India",
      category: "HVAC & Chillers",
      property: "Maker Maxity, BKC",
      city: "Mumbai",
      grossAmount: 420000,
      commissionPct: 10,
      platformFee: 42000,
      netVendorPayout: 378000,
      escrowStatus: "Released",
      utrNumber: "HDFC00029108442",
      completedDate: "12 Sep 2026"
    },
    {
      id: "tx-102",
      orderNumber: "WO-SEC-2026-440",
      vendorName: "SIS Group Security",
      category: "Security & Guarding",
      property: "World Trade Center, Kharadi",
      city: "Pune",
      grossAmount: 1850000,
      commissionPct: 8,
      platformFee: 148000,
      netVendorPayout: 1702000,
      escrowStatus: "Released",
      utrNumber: "ICIC00088190331",
      completedDate: "10 Sep 2026"
    },
    {
      id: "tx-103",
      orderNumber: "WO-CLN-2026-912",
      vendorName: "Urban Cleaners Enterprise",
      category: "Commercial Hygiene",
      property: "GIFT Tower 1, IFSC",
      city: "Gandhinagar",
      grossAmount: 280000,
      commissionPct: 12,
      platformFee: 33600,
      netVendorPayout: 246400,
      escrowStatus: "Defect Holdback",
      utrNumber: "Pending 14d sign-off",
      completedDate: "14 Sep 2026"
    },
    {
      id: "tx-104",
      orderNumber: "WO-MEP-2026-723",
      vendorName: "Voltas Electro-Mech Services",
      category: "MEP & Electrical",
      property: "One BKC, Bandra Kurla",
      city: "Mumbai",
      grossAmount: 640000,
      commissionPct: 10,
      platformFee: 64000,
      netVendorPayout: 576000,
      escrowStatus: "In Escrow",
      utrNumber: "Escrow Held: AXIS9921",
      completedDate: "In Progress"
    },
    {
      id: "tx-105",
      orderNumber: "WO-ELV-2026-309",
      vendorName: "Schindler Elevator India",
      category: "Elevators & Mobility",
      property: "Godrej BKC, Bandra",
      city: "Mumbai",
      grossAmount: 980000,
      commissionPct: 7.5,
      platformFee: 73500,
      netVendorPayout: 906500,
      escrowStatus: "Under Audit",
      utrNumber: "Audit Q3 Cycle",
      completedDate: "13 Sep 2026"
    },
  ];


  // 8 Core Commercial FM Service Categories with Snabbit-inspired Photography
  const serviceCategories: ServiceCategory[] = [
    {
      id: "hvac",
      name: "HVAC & Chillers",
      shortName: "HVAC",
      count: "420+ Vendors",
      icon: Sparkles,
      image: "/images/showcase_hvac_hd.jpg",
      desc: "Centrifugal chiller overhauls, VRV/VRF multi-splits, cooling towers, duct sanitization & IAQ air balancing",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "Annual AMC & On-Demand",
      sla: "< 30m Emergency SLA",
      popularServices: ["Chiller Overhauls", "VRV/VRF Balancing", "Cooling Towers"]
    },
    {
      id: "mep",
      name: "MEP & Electrical",
      shortName: "MEP & Electrical",
      count: "340+ Vendors",
      icon: Zap,
      image: "/images/showcase_mep_hd.jpg",
      desc: "33kV substations, DG synchronization, HT/LT panel maintenance, power factor compensation & thermography audits",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "Annual AMC & Emergency",
      sla: "< 25m Emergency SLA",
      popularServices: ["33kV Substation", "DG Synchronization", "HT/LT Panels"]
    },
    {
      id: "housekeeping",
      name: "Commercial Hygiene",
      shortName: "Housekeeping",
      count: "560+ Vendors",
      icon: Sparkles,
      image: "/images/showcase_cleaning_hd.jpg",
      desc: "BMU cradle high-rise facade cleaning, robotic floor scrubbers, cleanroom sanitization & automated waste stewardship",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "Daily Facility AMC",
      sla: "< 45m Dispatch SLA",
      popularServices: ["High-Rise Facades", "Robotic Scrubbers", "Restroom Hygiene"]
    },
    {
      id: "security",
      name: "Security & Guarding",
      shortName: "Security",
      count: "290+ Vendors",
      icon: ShieldCheck,
      image: "/images/showcase_security_guards.jpg",
      desc: "PSARA licensed manned guarding, optical speed-gate turnstiles, 24/7 central CCTV command room & perimeter surveillance",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "24/7 Guarding AMC",
      sla: "< 15m Command SLA",
      popularServices: ["PSARA Vetted Guards", "Biometric Access", "24/7 CCTV Monitoring"]
    },
    {
      id: "fire",
      name: "Fire & Life Safety",
      shortName: "Fire Safety",
      count: "210+ Vendors",
      icon: Flame,
      image: "/images/showcase_fire_hd.jpg",
      desc: "Wet riser hydrant lines, addressable smoke dampers, automatic sprinkler arrays & CFO / DGMS Fire NOC renewals",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "Quarterly Audit & AMC",
      sla: "< 20m Emergency SLA",
      popularServices: ["Hydrant Audits", "Fire NOC Renewals", "Sprinkler Overhauls"]
    },
    {
      id: "lifts",
      name: "Lifts & Mobility",
      shortName: "Lifts",
      count: "185+ Vendors",
      icon: Building2,
      image: "/images/showcase_lifts_hd.jpg",
      desc: "High-speed traction elevators, automated rescue devices (ARD), escalator maintenance & certified annual load testing",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Hyderabad"],
      contractType: "OEM Comprehensive AMC",
      sla: "< 20m Trap Rescue SLA",
      popularServices: ["Passenger Lift AMC", "Rescue Devices ARD", "Load Testing"]
    },
    {
      id: "landscaping",
      name: "Landscaping & Greenery",
      shortName: "Landscaping",
      count: "225+ Vendors",
      icon: CheckCircle2,
      image: "/images/showcase_landscaping_hd.jpg",
      desc: "Double-height atrium living walls, biophilic office greenery, rooftop garden terraces & IoT smart automated drip irrigation",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune"],
      contractType: "Monthly Horticulture AMC",
      sla: "Scheduled Weekly Care",
      popularServices: ["Living Green Walls", "Biophilic Terraces", "Smart IoT Drip"]
    },
    {
      id: "pest",
      name: "Pest Defense",
      shortName: "Pest Control",
      count: "170+ Vendors",
      icon: Bug,
      image: "/images/showcase_pest_hd.jpg",
      desc: "Integrated pest management (IPM), ultrasonic rodent repellent arrays, odorless gel baiting & commercial HACCP compliance",
      cities: ["Mumbai", "Bengaluru", "Delhi NCR", "Ahmedabad", "Pune", "Hyderabad"],
      contractType: "Quarterly Scheduled AMC",
      sla: "< 2hr Dispatch SLA",
      popularServices: ["Ultrasonic Barriers", "Gel Baiting", "HACCP Audits"]
    }
  ];

  // Verified Commercial Service Providers with Real Credentials & Imagery
  const featuredVendors: Vendor[] = [
    {
      id: "vendor-1",
      name: "Apex ElectroMech",
      category: "MEP & Electrical",
      initials: "AE",
      rating: 4.95,
      reviewsCount: 168,
      yearsInBusiness: "16+ years",
      phone: "+91 22 4982 1100",
      city: "Mumbai",
      location: "BKC, Mumbai",
      verified: true,
      tier: "Elite Partner",
      description: "Master electromechanical contractors specializing in 33kV substation overhauls, centrifugal chiller plant AMCs, and pressure booster pump banks for Tier-1 commercial towers.",
      specialties: ["33kV Substation", "DG Synchronization"],
      responseTime: "< 25 mins",
      image: "/images/pro_mep_technician.jpg",
      complianceBadges: ["CEA Grade-A", "ISO 9001:2015", "GST Compliant", "Workmen Insurance"],
      completedProjects: 420
    },
    {
      id: "vendor-2",
      name: "CoolBreeze Thermal",
      category: "HVAC",
      initials: "CB",
      rating: 4.92,
      reviewsCount: 134,
      yearsInBusiness: "14+ years",
      phone: "+91 80 6710 4420",
      city: "Bengaluru",
      location: "Outer Ring Road, Bengaluru",
      verified: true,
      tier: "Verified Partner",
      description: "Authorized central HVAC engineers specializing in multi-tier VRV/VRF systems, chilled water balancing, cleanroom duct acoustics, and IoT energy optimization for IT tech parks.",
      specialties: ["VRV/VRF Plants", "Chiller BMS"],
      responseTime: "< 35 mins",
      image: "/images/pro_hvac_engineer.jpg",
      complianceBadges: ["ASHRAE Member", "ISO 14001", "GST Compliant", "Certified Technicians"],
      completedProjects: 310
    },
    {
      id: "vendor-3",
      name: "Sterling Security",
      category: "Security",
      initials: "SS",
      rating: 4.88,
      reviewsCount: 245,
      yearsInBusiness: "19+ years",
      phone: "+91 11 4105 8890",
      city: "Delhi NCR",
      location: "Cyber City, Delhi NCR",
      verified: true,
      tier: "Elite Partner",
      description: "PSARA compliant corporate security solutions, manned turnstile guards, command room CCTV operators, biometric barrier integration, and VIP executive escort services.",
      specialties: ["Manned Guarding", "Biometric CCTV"],
      responseTime: "< 15 mins",
      image: "/images/pro_security_officer.jpg",
      complianceBadges: ["PSARA Grade-1", "ISO 27001", "Police Verified 100%", "ESI / PF Compliant"],
      completedProjects: 580
    },
    {
      id: "vendor-4",
      name: "EcoClean Services",
      category: "Housekeeping",
      initials: "EC",
      rating: 4.86,
      reviewsCount: 198,
      yearsInBusiness: "11+ years",
      phone: "+91 20 6640 2210",
      city: "Pune",
      location: "Hinjewadi, Pune",
      verified: true,
      tier: "Verified Partner",
      description: "Grade-A corporate facility cleaning, robotic auto-scrubbers, BMU cradle high-rise facade washing, bio-enzyme restroom hygiene, and Green Seal sustainable consumables.",
      specialties: ["Facade Cradles", "Auto-Scrubbers"],
      responseTime: "< 45 mins",
      image: "/images/pro_housekeeping_specialist.jpg",
      complianceBadges: ["Green Seal Certified", "ISO 9001", "Cradle Certified Riggers", "PF / ESI Active"],
      completedProjects: 360
    },
    {
      id: "vendor-5",
      name: "Vertex Mobility",
      category: "Lifts",
      initials: "VL",
      rating: 4.94,
      reviewsCount: 102,
      yearsInBusiness: "15+ years",
      phone: "+91 40 4488 3320",
      city: "Hyderabad",
      location: "HITEC City, Hyderabad",
      verified: true,
      tier: "Institutional",
      description: "Multi-brand elevator maintenance, high-speed passenger hoistways, automated rescue devices (ARD), certified annual load testing, and 24/7 rapid technician dispatch.",
      specialties: ["Passenger Lift AMC", "ARD Devices"],
      responseTime: "< 20 mins",
      image: "/images/showcase_lifts_hd.jpg",
      complianceBadges: ["PWD Lift Inspectorate", "ISO 9001", "OEM Certified", "Comprehensive Insurance"],
      completedProjects: 290
    },
    {
      id: "vendor-6",
      name: "Suraksha Fire Safety",
      category: "Fire Safety",
      initials: "SL",
      rating: 4.91,
      reviewsCount: 126,
      yearsInBusiness: "13+ years",
      phone: "+91 79 4022 8840",
      city: "Ahmedabad",
      location: "SG Highway, Ahmedabad",
      verified: true,
      tier: "Elite Partner",
      description: "Complete commercial fire protection: certified wet riser hydrant networks, addressable smoke dampers, automatic sprinkler arrays, and CFO Fire NOC statutory renewals.",
      specialties: ["Hydrant Audits", "Fire NOC Renewals"],
      responseTime: "< 20 mins",
      image: "/images/showcase_fire_hd.jpg",
      complianceBadges: ["CFO Fire License", "NFPA Member", "ISO 9001:2015", "Govt Authorized Auditor"],
      completedProjects: 240
    },
    {
      id: "vendor-7",
      name: "GreenScape Biophilic",
      category: "Landscaping",
      initials: "GS",
      rating: 4.87,
      reviewsCount: 118,
      yearsInBusiness: "10+ years",
      phone: "+91 44 2855 7760",
      city: "Bengaluru",
      location: "Whitefield, Bengaluru",
      verified: true,
      tier: "Verified Partner",
      description: "Turnkey biophilic design, double-height atrium living walls, rooftop garden terraces, and automated IoT smart drip irrigation for green-certified LEED Platinum buildings.",
      specialties: ["Living Green Walls", "Smart IoT Drip"],
      responseTime: "Scheduled",
      image: "/images/showcase_landscaping_hd.jpg",
      complianceBadges: ["IGBC Green Accredited", "Horticulture Certified", "ISO 14001", "GST Compliant"],
      completedProjects: 195
    },
    {
      id: "vendor-8",
      name: "BioPest Defense",
      category: "Pest Control",
      initials: "BP",
      rating: 4.89,
      reviewsCount: 140,
      yearsInBusiness: "12+ years",
      phone: "+91 22 2840 9930",
      city: "Mumbai",
      location: "Andheri East, Mumbai",
      verified: true,
      tier: "Verified Partner",
      description: "HACCP compliant corporate integrated pest management (IPM), ultrasonic rodent barriers for server rooms, odorless gel baiting, and subterranean termite barrier treatments.",
      specialties: ["Server Room IPM", "Gel Baiting"],
      responseTime: "< 90 mins",
      image: "/images/showcase_pest_hd.jpg",
      complianceBadges: ["IPCA Member", "HACCP Certified", "ISO 9001", "Non-Toxic Green Certified"],
      completedProjects: 275
    }
  ];

  // Filtered vendors based on category, city, and text search
  const filteredVendors = useMemo(() => {
    return featuredVendors.filter((vendor) => {
      // Category filter
      const matchesCategory =
        selectedCategoryFilter === "All" ||
        vendor.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());

      // City filter
      const matchesCity =
        selectedCityFilter === "All Cities" ||
        vendor.city.toLowerCase() === selectedCityFilter.toLowerCase();

      // Search text (service or name or specialties)
      const matchesService =
        !searchService ||
        vendor.name.toLowerCase().includes(searchService.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchService.toLowerCase()) ||
        vendor.specialties.some((s) => s.toLowerCase().includes(searchService.toLowerCase()));

      // Location search
      const matchesLocation =
        !searchLocation ||
        vendor.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchLocation.toLowerCase());

      return matchesCategory && matchesCity && matchesService && matchesLocation;
    });
  }, [selectedCategoryFilter, selectedCityFilter, searchService, searchLocation]);

  // Industry Insights & SOP Guides (The Maintenance Hub)
  const maintenanceHubArticles = [
    {
      id: "art-1",
      category: "Chiller Operations",
      readTime: "5 min read",
      date: "Aug 28, 2026",
      title: "How to Vet a Reliable HVAC Contractor for Grade-A Commercial Towers",
      excerpt: "Key criteria every property manager must verify before signing an annual chilled water and VRV maintenance agreement."
    },
    {
      id: "art-2",
      category: "Electrical & DG",
      readTime: "4 min read",
      date: "Sep 02, 2026",
      title: "Essential Preventative Maintenance Checklist for 33kV Substations & DG Sets",
      excerpt: "A monthly cadence covering HT/LT panels, thermography scans, transformer oil BDV tests, and automatic changeover."
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

  // FAQs
  const faqs = [
    {
      q: "How does OfficeX verify commercial FM service providers?",
      a: "Every contractor on OfficeX undergoes a rigorous multi-stage compliance audit: statutory licensing (e.g. PSARA for security, CFO NOC for fire, CEA grade for electrical), GST registration, audited financial history, active public liability insurance, and 100% police verification for all on-ground technicians and security crews."
    },
    {
      q: "Can I contract vendors for both Annual AMCs and emergency on-demand repairs?",
      a: "Yes. OfficeX supports both engagement models. You can execute comprehensive Annual Maintenance Contracts (with defined preventative visit cadences and SLAs) or dispatch vetted contractors on-demand for urgent breakdowns (e.g., chiller tripping, pipe burst, lift entrapment) with guaranteed response times."
    },
    {
      q: "How does escrow-backed milestone billing protect facility managers?",
      a: "When you award a work order or AMC milestone, funds are held securely in the OfficeX Escrow account. Payments are only disbursed to the contractor once the work order is signed off digitally in your CAFM dashboard, verified by IoT telemetry or physical inspection."
    },
    {
      q: "What happens if a contractor fails to meet their guaranteed SLA response time?",
      a: "All OfficeX Verified Partners operate under legally binding Service Level Agreements. If emergency response thresholds (<30 mins) or turnaround times are breached without force majeure, automatic SLA penalty deductions apply against the vendor's milestone payout."
    },
    {
      q: "How can my facility management company register as an OfficeX Verified Partner?",
      a: "Click 'Register as a Service Provider' on this page, submit your business entity details, trade licenses, and insurance policies. Our compliance team completes the physical and document audit within 24 to 48 hours to activate your verified badge."
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("vendors-directory");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleClaimBusiness = (vendor: Vendor) => {
    setSelectedVendorForClaim(vendor);
    setClaimModalOpen(true);
  };

  const handleRequestRfq = (vendor?: Vendor) => {
    setSelectedVendorForRfq(vendor || null);
    setRfqSubmitted(false);
    setRfqModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0F8B7D] selection:text-white">
      <MarketingHeader activePath="/fm-marketplace" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Snabbit-Clean Aesthetic + Veendoor B2B Dual Search)     */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-teal-50/20 to-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Subtle Ambient Teal Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0F8B7D]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-teal-600/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0F8B7D10_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Eyebrow, Title, Search Box, Trust Indicators */}
            <div className="lg:col-span-7 text-left">
              
              {/* Eyebrow Chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-[#0F8B7D] text-xs font-bold tracking-wide mb-3 shadow-2xs">
                <ShieldCheck size={14} className="text-[#0F8B7D]" />
                <span>Facility Management Marketplace</span>
              </div>

              {/* Title with OfficeX Teal Accent */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-tight mb-2">
                Connect with <span className="text-[#0F8B7D]">Trusted Professionals</span>
              </h1>

              {/* Tagline - Requested by user */}
              <p className="text-lg sm:text-xl font-black text-[#0F8B7D] tracking-wide mb-2">
                Find. Compare. Engage.
              </p>

              {/* Subhead - Short, crisp sentence */}
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mb-6 leading-normal">
                Hire pre-vetted commercial vendors with guaranteed SLAs and audited compliance.
              </p>

              {/* Search Card - Clean, spacious & perfectly organized */}
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-200/90 p-4 sm:p-5 mb-6">
                
                {/* Contract Type Toggle Bar + Post RFQ */}
                <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requirement:</span>
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setContractTypeFilter("all")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          contractTypeFilter === "all"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        All Services
                      </button>
                      <button
                        type="button"
                        onClick={() => setContractTypeFilter("amc")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          contractTypeFilter === "amc"
                            ? "bg-[#0F8B7D] text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Annual AMC
                      </button>
                      <button
                        type="button"
                        onClick={() => setContractTypeFilter("ondemand")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          contractTypeFilter === "ondemand"
                            ? "bg-[#0F8B7D] text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        On-Demand
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestRfq()}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                  >
                    <span>Post an RFQ</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Service needed input */}
                  <div className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] flex items-center gap-2.5 transition-all min-w-0">
                    <Search size={17} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      placeholder="Service (e.g. HVAC, MEP, Cleaning)..."
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Location input */}
                  <div className="sm:w-48 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] flex items-center gap-2.5 transition-all min-w-0">
                    <MapPin size={17} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="City or region..."
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Find Vendors CTA */}
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0F8B7D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Find Vendors</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                {/* Single-line clean popular tags */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs overflow-x-auto no-scrollbar">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0">Popular:</span>
                  {["HVAC & Chillers", "Electrical & DG", "Deep Cleaning", "PSARA Security", "Fire Safety"].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        setSearchService(pill);
                        const el = document.getElementById("vendors-directory");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-[#0F8B7D] text-slate-600 font-semibold transition-colors cursor-pointer text-[11px] whitespace-nowrap shrink-0"
                    >
                      {pill}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleRequestRfq()}
                    className="sm:hidden px-2.5 py-1 rounded-md bg-teal-50 text-[#0F8B7D] font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Post RFQ →
                  </button>
                </div>
              </div>

              {/* Trust Statistics Strip - Spacious & Balanced */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-[#0F8B7D] shrink-0">
                    <Users size={17} />
                  </div>
                  <div>
                    <span className="block text-base font-black text-slate-900 leading-tight">2,500+</span>
                    <span className="text-[11px] text-slate-500 font-medium">Verified Vendors</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-[#0F8B7D] shrink-0">
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <span className="block text-base font-black text-slate-900 leading-tight">100%</span>
                    <span className="text-[11px] text-slate-500 font-medium">Compliance Audited</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-[#0F8B7D] shrink-0">
                    <TrendingUp size={17} />
                  </div>
                  <div>
                    <span className="block text-base font-black text-slate-900 leading-tight">4.92 / 5</span>
                    <span className="text-[11px] text-slate-500 font-medium">SLA Quality Score</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Perfectly Aligned 2x2 Showcase */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: HVAC Engineer */}
                <div className="relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                  <Image
                    src="/images/pro_hvac_engineer.jpg"
                    alt="HVAC Certified Engineer"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="backdrop-blur-md bg-slate-950/85 text-teal-300 font-black text-[9px] px-2 py-0.5 rounded-md border border-teal-400/40 shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      OfficeX Uniformed
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      HVAC &amp; Chillers
                    </span>
                    <span className="text-white text-[10px] font-semibold opacity-90">420+ Vendors</span>
                  </div>
                </div>

                {/* Card 2: MEP Electrical */}
                <div className="relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                  <Image
                    src="/images/pro_mep_technician.jpg"
                    alt="Commercial MEP Technician"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="backdrop-blur-md bg-slate-950/85 text-teal-300 font-black text-[9px] px-2 py-0.5 rounded-md border border-teal-400/40 shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      OfficeX Uniformed
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      Electrical &amp; DG
                    </span>
                    <span className="text-white text-[10px] font-semibold opacity-90">&lt; 25m SLA</span>
                  </div>
                </div>

                {/* Card 3: Commercial Hygiene */}
                <div className="relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                  <Image
                    src="/images/pro_housekeeping_specialist.jpg"
                    alt="Commercial Hygiene Specialist"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="backdrop-blur-md bg-slate-950/85 text-teal-300 font-black text-[9px] px-2 py-0.5 rounded-md border border-teal-400/40 shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      OfficeX Uniformed
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      Hygiene &amp; Facade
                    </span>
                    <span className="text-white text-[10px] font-semibold opacity-90">Green Seal</span>
                  </div>
                </div>

                {/* Card 4: PSARA Security */}
                <div className="relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                  <Image
                    src="/images/pro_security_officer.jpg"
                    alt="PSARA Corporate Security"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="backdrop-blur-md bg-slate-950/85 text-teal-300 font-black text-[9px] px-2 py-0.5 rounded-md border border-teal-400/40 shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      OfficeX Uniformed
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      Guarding &amp; CCTV
                    </span>
                    <span className="text-white text-[10px] font-semibold opacity-90">PSARA Certified</span>
                  </div>
                </div>
              </div>

              {/* Live Adherence Badge - Cleanly positioned below grid */}
              <div className="mt-3 py-2 px-3.5 rounded-xl bg-white border border-teal-100 shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">99.2% On-Time SLA Adherence across 18M+ sq.ft.</span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Trust Badges Bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Zero Brokerage Guarantee</p>
              <p className="text-[11px] text-slate-500">Direct vetted vendor contracts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">100% Escrow Protection</p>
              <p className="text-[11px] text-slate-500">Funds released on SLA sign-off</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <Award size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">PSARA &amp; ISO Audited</p>
              <p className="text-[11px] text-slate-500">100% police &amp; statutory vetted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <Percent size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">5–15% Auto-Commission</p>
              <p className="text-[11px] text-slate-500">Transparent platform ledger</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Mode Tabs (Directory vs Commission Ledger) */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMainTab("directory")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === "directory"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building size={15} className="text-[#0F8B7D]" />
              <span>FM Service Categories &amp; Vendors</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("commission")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === "commission"
                  ? "bg-[#0F8B7D] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt size={15} />
              <span>OfficeX Commission &amp; Escrow Ledger</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">5–15% Engine</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRequestRfq()}
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-black shadow-sm hover:bg-[#0D7A6E] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Post New RFQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMMISSION LEDGER TAB CONTENT                                             */}
      {/* ========================================================================= */}
      {activeMainTab === "commission" && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-in fade-in duration-300">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Platform Financial Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              OfficeX Commission &amp; Escrow Payout Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
              Real-time ledger tracking gross merchandise value, automated 5–15% category platform fees, and SLA-verified net vendor disbursements held in HDFC Nodal Escrow.
            </p>
          </div>

          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total GTV Processed
              </span>
              <p className="text-2xl font-black text-slate-900">₹41,70,000</p>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <span>▲ +18.4%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-teal-200 bg-gradient-to-br from-white to-teal-50/40 shadow-sm">
              <span className="text-[11px] font-bold text-[#0F8B7D] uppercase tracking-wider block mb-1">
                OfficeX Fees Retained
              </span>
              <p className="text-2xl font-black text-[#0F8B7D]">₹3,61,100</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Weighted avg rate: <strong className="text-slate-800 font-black">8.65%</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Net Vendor Disbursed
              </span>
              <p className="text-2xl font-black text-slate-900">₹38,08,900</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Instant NEFT/RTGS via Escrow
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Escrow Defect Holdback
              </span>
              <p className="text-2xl font-black text-amber-600">₹2,46,400</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                14-day warranty retention
              </p>
            </div>
          </div>

          {/* Interactive Commission Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Interactive Category Commission Calculator</h3>
                <p className="text-xs text-slate-500">Calculate platform retention fee and net contractor payout dynamically</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Controls */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Service Trade &amp; Category:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(commissionRatesByCategory).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCalcCategory(key)}
                        className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                          calcCategory === key
                            ? "border-[#0F8B7D] bg-teal-50 text-[#0F8B7D] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50"
                        }`}
                      >
                        <span className="block truncate">{item.label}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.pct}% Fee</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Gross Contract Value:</span>
                    <span className="text-slate-900 font-black">₹{calcAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="3000000"
                    step="25000"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F8B7D]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹50,000 (Small Work Order)</span>
                    <span>₹15,00,000 (Quarterly AMC)</span>
                    <span>₹30,00,000 (Annual Enterprise AMC)</span>
                  </div>
                </div>
              </div>

              {/* Live Calculation Output Card */}
              <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block mb-1">
                  Automated Settlement Breakdown
                </span>
                <h4 className="text-lg font-bold text-white mb-4">
                  {commissionRatesByCategory[calcCategory].label}
                </h4>

                <div className="space-y-2.5 text-xs pb-4 border-b border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Contract Value</span>
                    <span className="font-mono font-bold text-white">₹{calcAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-teal-300">
                    <span className="flex items-center gap-1">
                      <span>OfficeX Platform Fee</span>
                      <span className="bg-teal-900/60 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {commissionRatesByCategory[calcCategory].pct}%
                      </span>
                    </span>
                    <span className="font-mono font-bold">
                      - ₹{Math.round((calcAmount * commissionRatesByCategory[calcCategory].pct) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>GST on Platform Fee (18%)</span>
                    <span className="font-mono">
                      ₹{Math.round((calcAmount * commissionRatesByCategory[calcCategory].pct * 0.18) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Net Vendor Payout
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{Math.round(calcAmount - (calcAmount * commissionRatesByCategory[calcCategory].pct) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                    Escrow Protected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Commercial Work Order Ledger</h3>
                <p className="text-xs text-slate-500">Live feed of completed vendor milestones with commission deductions</p>
              </div>
              <span className="text-xs font-bold text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                5 Audited Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID &amp; Date</th>
                    <th className="py-3.5 px-4">Vendor &amp; Asset</th>
                    <th className="py-3.5 px-4">Trade</th>
                    <th className="py-3.5 px-4 text-right">Gross Value</th>
                    <th className="py-3.5 px-4 text-right">OfficeX Fee</th>
                    <th className="py-3.5 px-4 text-right">Net Payout</th>
                    <th className="py-3.5 px-4">Escrow Status</th>
                    <th className="py-3.5 px-4">Settlement Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sampleLedgerTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{tx.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">{tx.completedDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{tx.vendorName}</span>
                        <span className="text-[11px] text-slate-500">{tx.property}, {tx.city}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{tx.grossAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-[#0F8B7D]">
                          ₹{tx.platformFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-400 block">({tx.commissionPct}%)</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        ₹{tx.netVendorPayout.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.escrowStatus === "Released"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tx.escrowStatus === "Defect Holdback"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : tx.escrowStatus === "In Escrow"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{tx.escrowStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        {tx.utrNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4-Step Escrow Guarantee Protocol */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-black mb-1">OfficeX 4-Stage Escrow &amp; Compliance Protocol</h3>
            <p className="text-xs text-teal-200 mb-6 max-w-2xl">
              Zero dispute facility management procurement backed by institutional escrow accounts and CAFM IoT telemetry.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-teal-400 font-mono text-xs font-black block mb-1">01. SCOPE &amp; ESCROW</span>
                <h4 className="text-sm font-bold text-white mb-1">Advance Deposited</h4>
                <p className="text-[11px] text-slate-300">Property manager locks requirement; funds held in HDFC Escrow.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-teal-400 font-mono text-xs font-black block mb-1">02. EXECUTION</span>
                <h4 className="text-sm font-bold text-white mb-1">Vetted Execution</h4>
                <p className="text-[11px] text-slate-300">Police-verified crew performs maintenance with live GPS check-in.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-teal-400 font-mono text-xs font-black block mb-1">03. CAFM AUDIT</span>
                <h4 className="text-sm font-bold text-white mb-1">Digital Sign-Off</h4>
                <p className="text-[11px] text-slate-300">IoT sensor verification and facility head digital signature.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-teal-400 font-mono text-xs font-black block mb-1">04. SETTLEMENT</span>
                <h4 className="text-sm font-bold text-white mb-1">Auto-Settlement</h4>
                <p className="text-[11px] text-slate-300">OfficeX retains 5–15%; net vendor payout dispatched with bank UTR.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CORE FM CATEGORIES (Clean, Bright, Snabbit & Veendoor Hybrid Standard) */}
      {/* ========================================================================= */}
      {activeMainTab === "directory" && (
        <>
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Service Directory
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Find by Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Explore vetted vendors by specialized engineering trade, statutory discipline, and equipment scale
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRequestRfq()}
              className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] font-extrabold text-xs hover:bg-teal-100 transition-colors cursor-pointer"
            >
              Request Multi-Trade RFP
            </button>
          </div>
        </div>

        {/* 4-Column Clean Uniform Cards with Prominent Photos (h-52: Image Area > Content Area) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryFilter(cat.shortName);
                  const el = document.getElementById("vendors-directory");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group cursor-pointer"
              >
                {/* Image Area (h-52: 208px - Pure, Bright & Crisp) */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

                  {/* Single Clean Frosted Floating Pill Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="backdrop-blur-md bg-white/95 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-full border border-white/80 shadow-xs flex items-center gap-1.5">
                      <Icon size={13} className="text-[#0F8B7D]" />
                      {cat.shortName}
                    </span>
                  </div>

                  {/* OfficeX Uniformed Crew Overlay Badge */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="backdrop-blur-md bg-slate-950/80 text-white font-extrabold text-[9.5px] px-2.5 py-1 rounded-md border border-teal-400/40 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse" />
                      <span>OFFICEX UNIFORMED CREW</span>
                    </span>
                  </div>
                </div>

                {/* Content Area (Airy, Uncluttered & Spacious) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 font-normal">
                      {cat.popularServices.join(" • ")}
                    </p>
                  </div>

                  {/* Clean Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      {cat.count}
                    </span>
                    <span className="font-bold text-[#0F8B7D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS (Veendoor's 3-Step B2B Procurement with Snabbit Elegance) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Procurement Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Contract FM Services in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              From defining equipment specs to awarding milestones with escrow governance — seamless B2B execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 01 */}
            <div className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all">
              <span className="absolute top-5 right-6 text-5xl font-black text-slate-200/70 select-none">
                01
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-[#0F8B7D] flex items-center justify-center mb-5 shadow-2xs">
                  <FileText size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Define Scope &amp; Asset Specs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Select your commercial trade, input building square footage, and define specific equipment loads (e.g., 500 TR Chiller, 1250 kVA DG, or square footage for facade cradles).
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-3">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> Standardized BOQ Templates
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> Custom SLA Response Thresholds
                </li>
              </ul>
            </div>

            {/* Step 02 */}
            <div className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all">
              <span className="absolute top-5 right-6 text-5xl font-black text-slate-200/70 select-none">
                02
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-[#0F8B7D] flex items-center justify-center mb-5 shadow-2xs">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Compare Pre-Vetted Bids &amp; SLAs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Receive competitive rate cards from audited contractors. Inspect valid PSARA licenses, Fire NOC credentials, active liability coverage, and Grade-A client ratings.
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-3">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> 100% Background-Checked Crews
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> Transparent Price &amp; Penalty Cards
                </li>
              </ul>
            </div>

            {/* Step 03 */}
            <div className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all">
              <span className="absolute top-5 right-6 text-5xl font-black text-slate-200/70 select-none">
                03
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-[#0F8B7D] flex items-center justify-center mb-5 shadow-2xs">
                  <Award size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Contract with Escrow Governance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Execute digital agreements with unified milestone governance. Track technician work orders in your OfficeX CAFM app and disburse payments only upon verified sign-off.
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-3">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> Escrow Milestone Protection
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#0F8B7D]" /> Integrated with OfficeX Ops CAFM
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED & VERIFIED CONTRACTORS DIRECTORY                             */}
      {/* ========================================================================= */}
      <section id="vendors-directory" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Top-Rated Contractors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verified Commercial Service Providers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Explore audited engineering partners across all trade disciplines — with active insurance &amp; verified SLAs
            </p>
          </div>

          {/* City Dropdown & Category Filter */}
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              aria-label="Filter contractors by city"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
            >
              <option value="All Cities">All Metro Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-3 border-b border-slate-200/80 overflow-x-auto">
          {["All", "MEP & Electrical", "HVAC", "Security", "Housekeeping", "Lifts", "Fire Safety", "Landscaping", "Pest Control"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedCategoryFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoryFilter === f
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {f === "All" ? "All Categories" : f}
            </button>
          ))}
        </div>

        {/* Vendor Cards Grid */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Search size={36} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-800 mb-1">No contractors match your filters</h3>
            <p className="text-xs text-slate-500 mb-4">Try clearing your search query or selecting a different city / category.</p>
            <button
              type="button"
              onClick={() => {
                setSearchService("");
                setSearchLocation("");
                setSelectedCategoryFilter("All");
                setSelectedCityFilter("All Cities");
              }}
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-black text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
              >
                {/* Image Area (h-52: 208px - Pure, Bright & Crisp) */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

                  {/* Clean Frosted Badges at Top Corners */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="backdrop-blur-md bg-white/95 text-[#0F8B7D] font-bold text-xs px-2.5 py-1 rounded-full border border-white/80 shadow-xs flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-[#0F8B7D]" />
                      Verified
                    </span>
                    <div className="flex items-center gap-1 backdrop-blur-md bg-white/95 text-slate-800 font-bold text-xs px-2.5 py-1 rounded-full border border-white/80 shadow-xs">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{vendor.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content Area (Airy, Uncluttered & Spacious) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                      {vendor.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span>{vendor.location}</span>
                    </p>

                    {/* 2 Clean Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {vendor.specialties.slice(0, 2).map((spec, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ⚡ {vendor.responseTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRequestRfq(vendor)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Request RFQ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post RFQ Banner below directory */}
        <div className="mt-12 bg-gradient-to-r from-teal-50 via-white to-teal-50 border border-teal-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] block mb-1">
              Enterprise Commercial Procurement
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900">
              Need 3 Competitive Bids for Your Commercial Facility?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Submit your property details once. Verified contractors review your BOQ and submit SLA rate cards within 24 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRequestRfq()}
            className="px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs sm:text-sm shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>Post Instant RFQ</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. QUALITY ASSURANCE (Why Choose OfficeX FM Marketplace?)                 */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Enterprise Standards
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Why Facility Leaders Choose OfficeX
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              We eliminate contractor unreliability through audited licensing, contractual SLAs, and escrow payment governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100/80 text-[#0F8B7D] flex items-center justify-center mb-4 shadow-2xs">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">100% Pre-Audited Compliance</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every vendor is physically screened for active PSARA licenses, CEA electrical certification, CFO Fire NOCs, and background-cleared crew.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] mt-4 block">
                Statutory Verified →
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-4 shadow-2xs">
                  <Clock size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Contractual SLA Guarantees</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clear 15–45 minute emergency response commitments with automated penalty deductions if contractual downtime thresholds are exceeded.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 mt-4 block">
                Guaranteed Uptime →
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 shadow-2xs">
                  <Award size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Escrow Milestone Payouts</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Protect capital reserves. Property managers fund milestones into escrow; funds are disbursed only upon digital sign-off and audit verification.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mt-4 block">
                Capital Protection →
              </span>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center mb-4 shadow-2xs">
                  <Layers size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Native OfficeX CAFM Sync</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sync contractor work orders directly into your building management dashboard. Monitor asset lifecycle, sensor alarms, and ticket MTTR in real-time.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 mt-4 block">
                Integrated Ops →
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. VENDOR ACQUISITION CTA BANNER (Join OfficeX Marketplace)              */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-[#0F8B7D] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Vendor Value Props */}
            <div className="lg:col-span-7 text-left">
              <span className="text-xs font-black uppercase tracking-widest text-teal-200 block mb-2">
                Join the Network
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-[42px] font-black tracking-tight leading-[1.18] mb-4 text-white">
                Are You a Licensed FM Service Provider?
              </h2>
              <p className="text-sm sm:text-base text-teal-50 max-w-xl mb-6 font-medium leading-relaxed">
                Connect with Grade-A commercial developers, tech park asset managers, and institutional building supers across India&apos;s leading commercial hubs.
              </p>

              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Award size={16} className="text-white" />
                  </div>
                  <span>Get verified and stand out from unvetted contractors with the OfficeX Trust Badge</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-white" />
                  </div>
                  <span>Access exclusive high-value commercial property AMCs and institutional tender RFPs</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <span>Manage digital work orders, verified client reviews, and escrow milestone payouts</span>
                </li>
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSlideInOpen(true)}
                  className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F8B7D] font-black text-xs sm:text-sm shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Register Your Business</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-black text-xs sm:text-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Claim Existing Profile</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3-Step Rapid Setup Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 text-white shadow-2xl">
              <h3 className="text-lg font-black mb-1">Quick &amp; Seamless Onboarding</h3>
              <p className="text-xs text-teal-100 mb-6">
                Complete compliance verification in 24–48 hours and start receiving qualified enterprise RFPs.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0F8B7D] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">Submit Company Credentials</h4>
                    <p className="text-[11px] text-teal-100">Upload trade registration, GSTIN, PSARA / Fire licenses, and active insurance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0F8B7D] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">24-Hr Physical &amp; Digital Audit</h4>
                    <p className="text-[11px] text-teal-100">Our compliance officers verify technician certifications and past enterprise references.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0F8B7D] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white mb-0.5">Start Receiving High-Value Bids</h4>
                    <p className="text-[11px] text-teal-100">Direct work order inquiries and annual maintenance tenders from Grade-A asset heads.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. THE MAINTENANCE HUB (Industry SOPs & Best Practice Guides)             */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
                The Maintenance Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Engineering Insights &amp; SOP Guides
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Expert advice on preventative maintenance cadences, chiller overhauls, and statutory audits
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSlideInOpen(true)}
              className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1 mt-3 sm:mt-0 cursor-pointer"
            >
              <span>View All Articles</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {maintenanceHubArticles.map((art) => (
              <div
                key={art.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-teal-300 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-3">
                    <span className="bg-teal-50 text-[#0F8B7D] px-2.5 py-0.5 rounded-full border border-teal-100">
                      {art.category}
                    </span>
                    <span>{art.date} • {art.readTime}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors mb-2 leading-snug">
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
                    className="text-xs font-bold text-[#0F8B7D] group-hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (Compact & Shrunk)                           */}
      {/* ========================================================================= */}
      <section className="py-8 md:py-12 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] block mb-0.5">
            Support &amp; Governance
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Quick answers on contractor audits, statutory compliance, and milestone escrow
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left py-3 px-4 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0F8B7D]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* 10. INTERACTIVE MODAL: CLAIM BUSINESS LISTING                             */}
      {/* ========================================================================= */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Claim Business Listing
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Verify your ownership of{" "}
              <strong className="text-slate-800">
                {selectedVendorForClaim ? selectedVendorForClaim.name : "Your Company Listing"}
              </strong>{" "}
              to update rate cards, respond to customer reviews, and receive commercial leads.
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
                  Full Name &amp; Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma (Managing Director)"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Official Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
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
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  GSTIN or Trade License No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                Submit Verification Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. INTERACTIVE MODAL: REQUEST RFQ / INSTANT WORK ORDER                   */}
      {/* ========================================================================= */}
      {rfqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setRfqModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            {rfqSubmitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  RFQ Dispatched Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
                  Your work order specs have been sent to{" "}
                  <strong>{selectedVendorForRfq ? selectedVendorForRfq.name : "top audited contractors"}</strong>.
                  You will receive formal rate cards and SLA proposals within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setRfqModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-black text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1">
                  Request Commercial RFQ
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {selectedVendorForRfq ? (
                    <>
                      Direct quotation request to <strong className="text-slate-800">{selectedVendorForRfq.name}</strong> ({selectedVendorForRfq.category}).
                    </>
                  ) : (
                    "Post your commercial property maintenance requirement to get 3 verified contractor quotes."
                  )}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRfqSubmitted(true);
                  }}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Service Category
                      </label>
                      <select
                        defaultValue={selectedVendorForRfq ? selectedVendorForRfq.category : "HVAC & Chillers"}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      >
                        <option value="HVAC & Chillers">HVAC &amp; Chillers</option>
                        <option value="MEP & Electrical">MEP &amp; Electrical</option>
                        <option value="Security & Guarding">Security &amp; Guarding</option>
                        <option value="Commercial Housekeeping">Commercial Housekeeping</option>
                        <option value="Elevators & Mobility">Elevators &amp; Mobility</option>
                        <option value="Fire Safety">Fire Safety &amp; Life Support</option>
                        <option value="Landscaping">Landscaping &amp; Horticulture</option>
                        <option value="Pest Control">Pest &amp; Vector Defense</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Engagement Model
                      </label>
                      <select className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]">
                        <option value="amc">Annual Maintenance (AMC)</option>
                        <option value="ondemand">On-Demand Breakdown</option>
                        <option value="audit">Statutory Compliance Audit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Commercial Property Name &amp; City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prestige Tech Park, Tower B (Bengaluru)"
                      className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Work Order Scope &amp; Asset Specs
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe capacity (e.g., 2x 450 TR Chillers, 33kV Substation, 120,000 sq.ft. floor area, required SLA response)..."
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Contact Person Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="fm@enterprise.com"
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Direct Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Estimated Budget
                      </label>
                      <select
                        value={rfqBudget}
                        onChange={(e) => setRfqBudget(e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      >
                        <option value="< ₹2,00,000">&lt; ₹2,00,000 (Small Work Order)</option>
                        <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000</option>
                        <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                        <option value="₹10,00,000+">₹10,00,000+ (Enterprise Tender)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                        Required Timeline
                      </label>
                      <select
                        value={rfqTimeline}
                        onChange={(e) => setRfqTimeline(e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      >
                        <option value="Immediate (< 7 days)">Immediate (&lt; 7 days)</option>
                        <option value="Within 30 days">Within 30 days</option>
                        <option value="Upcoming Quarter AMC renewal">Upcoming Quarter AMC renewal</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-900 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>
                      <strong>Escrow Protected:</strong> Advance is held safely in HDFC Nodal Escrow. Standard 5–15% category commission auto-deducted upon verified milestone sign-off.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs shadow-md transition-all cursor-pointer mt-2"
                  >
                    Submit RFQ to Verified Contractors
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Lead Gen Slide-In */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["fm-marketplace"] }}
      />

      <Footer />
    </div>
  );
}

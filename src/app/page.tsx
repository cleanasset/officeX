"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import CoreArchitectureDiagram from "@/components/CoreArchitectureDiagram";
import {
  Search,
  Building,
  Building2,
  CheckCircle,
  CheckCircle2,
  Globe,
  Calendar,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Users,
  FileText,
  ChevronDown,
  Settings,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Shield,
  ClipboardList,
  Database,
  Network,
  ArrowDown,
  Layers,
  Lock,
  RefreshCw,
  MapPin,
  Map,
  Cpu,
  Star,
  Award,
  HelpCircle,
  Wrench,
  Clock,
  CheckSquare,
  Briefcase,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Eye,
  Zap,
  Check,
  Laptop,
  Key,
  Play,
  Pause,
  LayoutGrid,
  Store,
  Brain,
  Handshake,
  Bot
} from "lucide-react";
import TrustStrip from "@/components/marketing/TrustStrip";
import ModuleCard from "@/components/marketing/ModuleCard";
import EnquiryForm from "@/components/marketing/EnquiryForm";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import AudienceTile from "@/components/marketing/AudienceTile";
import HeaderAuthButton from "@/components/marketing/HeaderAuthButton";
import MarketplaceDualShowcase from "@/components/marketing/MarketplaceDualShowcase";

// Single Full-Width Panoramic Hero Scenes (Rotating: Luxury Office -> FM Technicians -> Campus Atrium -> Security -> Hospitality)
const HERO_SCENES = [
  {
    src: "/images/office_marketplace_hero_luxury.jpg",
    alt: "Modern luxury corporate office workspace with glass boardroom and workstations",
    position: "object-center"
  },
  {
    src: "/images/hero_scene_vendor_working.jpg",
    alt: "Certified FM and HVAC technicians servicing mechanical equipment in plant room",
    position: "object-[60%_center]"
  },
  {
    src: "/images/hero_scene_campus_atrium.jpg",
    alt: "Property manager and facility engineer reviewing operations in corporate campus atrium",
    position: "object-center"
  },
  {
    src: "/images/hero_scene_turnstile_security.jpg",
    alt: "Corporate security officers in uniform managing optical glass turnstiles and visitor access",
    position: "object-[65%_center]"
  },
  {
    src: "/images/hero_scene_facility_crew.jpg",
    alt: "Corporate facility and hospitality specialists preparing modern executive boardroom",
    position: "object-center"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor" | "managed">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(4); // Default to escrow payment step
  const [isEnquirySlideInOpen, setIsEnquirySlideInOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<{ audience?: string; modules?: string[] } | undefined>(undefined);

  // Single Panoramic Hero Banner
  // User requested: "its looking so awkward main thing is getting blured , i need some perfect banner image"
  // Replaced with a pristine, crystal-clear Grade-A commercial atrium banner with zero blur smudges or blur cycling

  const openEnquiry = (prefill?: { audience?: string; modules?: string[] }) => {
    setEnquiryPrefill(prefill);
    setIsEnquirySlideInOpen(true);
  };

  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const heroSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolledPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Lifecycle Stepper State & Data
  const [activeLifecycleStep, setActiveLifecycleStep] = useState<number>(0);

  const lifecycleSteps = [
    {
      id: "property",
      name: "Property",
      subtitle: "Acquisition & Onboarding",
      desc: "Centralize asset registers, spatial demising, and digital property passports on day one.",
      badge: "Asset Foundation",
      metric: "100% Digital Passports",
      capabilities: ["Spatial Demising & Stacking", "Digital Building Passports", "Ownership & Title Records", "Zoning & Permitting Data"]
    },
    {
      id: "space",
      name: "Space",
      subtitle: "Space Planning & Management",
      desc: "Dynamic floorplate configuration, rentable/usable area audits, and occupancy mapping.",
      badge: "Spatial Optimization",
      metric: "91.6% Space Utilization",
      capabilities: ["Interactive 2D/3D Floorplans", "Desk & Zone Allocation", "Fit-Out Handover Checklists", "BOMA/RERA Area Calculations"]
    },
    {
      id: "lease",
      name: "Lease",
      subtitle: "Lease Management & Rent Roll",
      desc: "Manage commercial contracts, step-up escalations, CAM reconciliations, and lock-in periods.",
      badge: "Revenue Engine",
      metric: "₹12.4 Cr Monthly Rent Roll",
      capabilities: ["Automated Rent Roll Generator", "Escalation & Indexation Rules", "Break-Clause Alerts", "Security Deposit Tracking"]
    },
    {
      id: "tenant",
      name: "Tenant",
      subtitle: "Tenant Management & Engagement",
      desc: "Deliver premium occupier experiences from onboarding to daily operational requests.",
      badge: "Tenant Experience",
      metric: "98% Tenant Satisfaction",
      capabilities: ["Digital Move-In / Move-Out", "Tenant Directory & Contacts", "Insurance & Fitout Approvals", "Self-Service Billing Portal"]
    },
    {
      id: "operations",
      name: "Operations",
      subtitle: "Facilities, Assets & Services",
      desc: "52-week preventive maintenance calendars, QR-code asset tagging, and vendor work orders.",
      badge: "Operational Rigor",
      metric: "96% SLA Adherence",
      capabilities: ["52-Week PPM Scheduling", "Digital QR Asset Passports", "Work Order Dispatch", "Real-Time Downtime Tracking"]
    },
    {
      id: "compliance",
      name: "Compliance",
      subtitle: "Risk, Safety & Compliance",
      desc: "Statutory audits, fire NOCs, labor compliance, and insurance tracking with zero lapses.",
      badge: "Statutory Rigor",
      metric: "94% Compliant Score",
      capabilities: ["Statutory License Tracker", "Automated Expiry Alerts", "CAPA Audit Workflows", "EHS & Safety Inspection Logs"]
    },
    {
      id: "workplace",
      name: "Workplace",
      subtitle: "Experience & Workplace",
      desc: "Visitor management, meeting room bookings, cafeteria integration, and access control.",
      badge: "Modern Workplace",
      metric: "12,000+ Daily Check-ins",
      capabilities: ["Touchless Visitor Access", "Meeting Room Bookings", "Parking Bay Allocation", "Tenant Feedback & Surveys"]
    },
    {
      id: "insights",
      name: "Insights",
      subtitle: "Analytics & AI Intelligence",
      isComingSoon: true,
      desc: "Advanced portfolio reporting, predictive utility anomaly detection, and lease churn forecasting.",
      badge: "Coming Soon",
      metric: "Coming Soon",
      capabilities: ["Predictive Churn Warnings", "Energy & HVAC Anomaly Alerts", "Portfolio NOI Forecasting", "Executive Board Pack Generator"]
    }
  ];

  // Stakeholder Solutions State & Data
  const [activeStakeholder, setActiveStakeholder] = useState<"owner" | "occupier" | "fm" | "vendor" | "investor" | "it">("owner");

  const stakeholderData = {
    owner: {
      role: "Owners & Developers",
      headline: "Maximize Portfolio Yields, Accelerate Leasing & Scale Assets",
      quote: "Gain real-time visibility across rent roll, occupancy risk, demising cadences, and operating expenditure from a single dashboard.",
      badge: "Asset & Yield Optimization",
      landingHref: "/audiences/owners",
      portalHref: "/properties",
      portalName: "Owner Portal",
      metrics: [
        { label: "Portfolio Occupancy", val: "91.6%" },
        { label: "Tracked Rent Roll", val: "₹12.4 Cr/mo" },
        { label: "On-Time Collections", val: "97.4%" },
      ],
      points: [
        "Live consolidated revenue, rent collection, and arrears overview",
        "Proactive 90-day lease expiry alerts with revenue exposure impact",
        "Full recovery tracking for CAM, HVAC, and common utility bills",
        "Institutional asset depreciation and capital expenditure auditing"
      ]
    },
    investor: {
      role: "REITs & Asset Managers",
      headline: "Audit-Ready Data, Institutional Governance & Verifiable Returns",
      quote: "Standardized property metrics, audited compliance trails, and verified lease cash flows for institutional diligence.",
      badge: "Institutional Governance",
      landingHref: "/audiences/investors",
      portalHref: "/leasing",
      portalName: "Leasing & Investor CRM",
      metrics: [
        { label: "WALE Visibility", val: "4.8 yrs" },
        { label: "Statutory Compliance", val: "94%" },
        { label: "Audit Readiness", val: "Instant" },
      ],
      points: [
        "Portfolio-wide WALE, NOI, and tenant concentration analytics",
        "Immutable statutory and environmental compliance records",
        "Zero discrepancy between executed lease terms and actual billing",
        "Automated quarterly investor reporting packs and asset benchmarks"
      ]
    },
    occupier: {
      role: "Occupiers & Enterprises",
      headline: "Empower Your Employees with Frictionless Workplace Operations",
      quote: "Self-service service requests, instant touchless visitor registration, and real-time billing clarity across multi-city campuses.",
      badge: "Workplace & Tenant Experience",
      landingHref: "/audiences/occupiers",
      portalHref: "/tenant",
      portalName: "Tenant Workplace",
      metrics: [
        { label: "Avg Request Resolution", val: "2.4 hrs" },
        { label: "App Adoption", val: "94%" },
        { label: "Visitor Check-in", val: "<30 sec" },
      ],
      points: [
        "Dedicated mobile portal for facility requests and maintenance tickets",
        "Fast visitor pre-registration and instant QR access passes",
        "Itemized monthly billing statements and utility consumption data",
        "Meeting room, desk, and event space reservation modules"
      ]
    },
    fm: {
      role: "Facility Management Companies",
      headline: "Automate 52-Week Maintenance & Enforce Strict Vendor SLAs",
      quote: "Replace WhatsApp chaos and paper logs with digital asset passports, automated PPM, and guaranteed 99.8% equipment uptime.",
      badge: "CAFM & Operations Desk",
      landingHref: "/audiences/fm",
      portalHref: "/ops",
      portalName: "Facility Ops Console",
      metrics: [
        { label: "SLA Adherence", val: "96.2%" },
        { label: "PPM Completion", val: "98.5%" },
        { label: "Open Tickets Tracked", val: "342" },
      ],
      points: [
        "Automated 52-week preventive maintenance scheduling & dispatch",
        "Digital QR-code asset passports for all critical HVAC, DG, and lifts",
        "Standardized vendor performance scorecards and SLA accountability",
        "Centralized inventory management for consumables and spare parts"
      ]
    },
    vendor: {
      role: "Vendors & Contractors",
      headline: "Win Grade-A Contracts & Enjoy Guaranteed Escrow Payouts",
      quote: "Direct access to high-value commercial RFQs with milestone payments locked in RBI-regulated escrow accounts.",
      badge: "Contractor Empowerment",
      landingHref: "/audiences/vendors",
      portalHref: "/vendor",
      portalName: "Vendor Partner Desk",
      metrics: [
        { label: "Escrow Protection", val: "100%" },
        { label: "Avg Payout Speed", val: "24 hrs" },
        { label: "Repeat Renewal Rate", val: "89%" },
      ],
      points: [
        "Direct RFQ invitations from leading commercial landlords and REITs",
        "Guaranteed funds held in Razorpay Nodal Escrow before work begins",
        "Digital job cards, milestone verification, and photo inspection sign-offs",
        "Transparent compliance scorecards to win more portfolio assignments"
      ]
    },
    it: {
      role: "IT & Workplace Tech",
      headline: "Enterprise APIs, Touchless Access & Scalable IoT Infrastructure",
      quote: "Connect BMS telemetry, digital access credentials, and tenant apps on an institutional security foundation.",
      badge: "Workplace Technology",
      landingHref: "/audiences/it",
      portalHref: "/admin",
      portalName: "Admin Command",
      metrics: [
        { label: "API Latency", val: "<45ms" },
        { label: "Uptime SLA", val: "99.95%" },
        { label: "Security Level", val: "SOC 2" },
      ],
      points: [
        "SAML 2.0 & Okta SSO integration with automated directory syncing",
        "Standardized BACnet/IP, Modbus TCP, and MQTT BMS telemetry connectors",
        "Instant QR mobile visitor passes and NFC gate access provisioning",
        "Complete compliance with SOC 2, GDPR, ISO 27001, and enterprise security standards"
      ]
    }
  };

  // Stakeholder auto-rotation & carousel state
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);

  const stakeholderKeys: ("owner" | "investor" | "occupier" | "fm" | "vendor" | "it")[] = [
    "owner", "investor", "occupier", "fm", "vendor", "it"
  ];

  // Handler to smoothly scroll the horizontal carousel track to a stakeholder card (never scrolls window)
  const scrollToStakeholder = (key: "owner" | "occupier" | "fm" | "vendor" | "investor" | "it") => {
    setActiveStakeholder(key);

    if (carouselTrackRef.current) {
      const targetCard = carouselTrackRef.current.querySelector(`[data-stakeholder-card="${key}"]`) as HTMLElement;
      if (targetCard) {
        isProgrammaticScrollRef.current = true;
        const targetLeft = targetCard.offsetLeft - carouselTrackRef.current.offsetLeft;
        carouselTrackRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      }
    }
  };

  const handlePrevStakeholder = () => {
    const currentIndex = stakeholderKeys.indexOf(activeStakeholder);
    const prevIndex = (currentIndex - 1 + stakeholderKeys.length) % stakeholderKeys.length;
    scrollToStakeholder(stakeholderKeys[prevIndex]);
  };

  const handleNextStakeholder = () => {
    const currentIndex = stakeholderKeys.indexOf(activeStakeholder);
    const nextIndex = (currentIndex + 1) % stakeholderKeys.length;
    scrollToStakeholder(stakeholderKeys[nextIndex]);
  };

  // Auto-scroll stakeholder carousel every 4.2s continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStakeholder((prev) => {
        const idx = stakeholderKeys.indexOf(prev);
        const nextKey = stakeholderKeys[(idx + 1) % stakeholderKeys.length];
        if (carouselTrackRef.current) {
          const targetCard = carouselTrackRef.current.querySelector(`[data-stakeholder-card="${nextKey}"]`) as HTMLElement;
          if (targetCard) {
            isProgrammaticScrollRef.current = true;
            const targetLeft = targetCard.offsetLeft - carouselTrackRef.current.offsetLeft;
            carouselTrackRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          }
        }
        return nextKey;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, [stakeholderKeys]);

  const handleCarouselScroll = () => {
    if (isProgrammaticScrollRef.current || !carouselTrackRef.current) return;
    const container = carouselTrackRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-stakeholder-card]');
    if (!cards.length) return;

    const scrollLeft = container.scrollLeft;
    let closestKey = activeStakeholder;
    let minDiff = Infinity;

    cards.forEach((card) => {
      const diff = Math.abs(card.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        const key = card.getAttribute('data-stakeholder-card') as typeof activeStakeholder;
        if (key) closestKey = key;
      }
    });

    if (closestKey !== activeStakeholder && minDiff < container.clientWidth / 2) {
      setActiveStakeholder(closestKey);
    }
  };

  // Contact Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success">("idle");

  // Search input states
  const [spaceCity, setSpaceCity] = useState("Mumbai");
  const [spaceArea, setSpaceArea] = useState("");
  const [spaceBudget, setSpaceBudget] = useState("All Ranges");
  const [spaceGrade, setSpaceGrade] = useState("All Grades");

  const [vendorCategory, setVendorCategory] = useState("HVAC Maintenance");
  const [vendorCity, setVendorCity] = useState("Mumbai");
  const [vendorBudget, setVendorBudget] = useState("All Budgets");
  const [vendorType, setVendorType] = useState("Commercial Office");

  const [animateCount, setAnimateCount] = useState({
    sqft: 0,
    vendors: 0,
    gtv: 0,
    uptime: 0
  });

  // Numbers count-up simulation on page load
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnimateCount({
        sqft: Math.min(Math.round((15 / steps) * step), 15),
        vendors: Math.min(Math.round((450 / steps) * step), 450),
        gtv: Math.min(Math.round((18 / steps) * step), 18),
        uptime: parseFloat(Math.min((99.8 / steps) * step, 99.8).toFixed(1))
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimateCount({ sqft: 15, vendors: 450, gtv: 18, uptime: 99.8 });
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleLandingSearch = () => {
    if (activeSearchTab === "vendor") {
      router.push(`/fm-marketplace?category=${encodeURIComponent(vendorCategory)}&city=${encodeURIComponent(vendorCity)}`);
      return;
    }
    if (activeSearchTab === "space") {
      router.push(`/public/search?city=${encodeURIComponent(spaceCity)}`);
      return;
    }
    router.push('/managed-services');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLandingSearch();
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;

    setContactStatus("sending");
    setTimeout(() => {
      setContactStatus("success");
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactStatus("idle");
        setContactName("");
        setContactEmail("");
        setContactCompany("");
        setContactPhone("");
        setContactMessage("");
      }, 2500);
    }, 1500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      q: "How are vendors verified on OfficeX?",
      a: "Every vendor undergoes a multi-step background check including GSTIN and PAN validation, trade license verification, labor safety compliance verification, and previous work history audit. We also verify their insurance policies to protect property teams."
    },
    {
      q: "What happens if a vendor doesn't complete the work?",
      a: "Since funds are held in a Razorpay escrow nodal account, they are only released after your facility team signs off on milestone completion. If there is a dispute, our arbitration team steps in to assess the scope of work and resolve the payment split accordingly."
    },
    {
      q: "Can I integrate OfficeX with my existing accounting software (Tally/Zoho)?",
      a: "Yes, the Professional and Enterprise tiers support integrations with standard ERP and accounting tools like Tally, Zoho Books, SAP, and Oracle NetSuite to sync invoices, purchase orders, and payout receipts automatically."
    },
    {
      q: "How does the escrow payment structure work?",
      a: "When a contract is awarded, the client deposits the total amount into the Razorpay Escrow Nodal Account. Upon verified sign-off of milestones, the platform automatically routes 90% of the funds to the vendor and retains a 10% platform fee."
    },
    {
      q: "Is my facility data secure?",
      a: "Yes, security is our primary focus. We use bank-grade AES-256 encryption at rest, TLS 1.3 in transit, and enforce role-based access control (RBAC). Our infrastructure is SOC 2 Type II compliant and hosted on secure, enterprise-grade cloud infrastructure."
    },
    {
      q: "What is the typical onboarding time for the Professional tier?",
      a: "For most multi-site portfolios, onboarding takes less than 7 days. This includes building mapping, uploading asset registries, configuring the 52-week PPM calendar, and inviting team members to the portal."
    }
  ];

  const timelineSteps = [
    {
      title: "1. Post Requirement",
      desc: "Define your scope of work using standardized templates."
    },
    {
      title: "2. Smart Match",
      desc: "Algorithm matches you with top pre-verified local vendors."
    },
    {
      title: "3. Compare Bids",
      desc: "Analyze quotes side-by-side on normalized parameters."
    },
    {
      title: "4. Award Contract",
      desc: "Digitally sign SLAs and auto-generate purchase orders."
    },
    {
      title: "5. Escrow Payment",
      desc: "Funds are secured and released upon milestone completion."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden text-slate-900">
      
      {/* SECTION 1: ENTERPRISE TOP NAVBAR — DYNAMIC STICKY NAV VIA INTERSECTION OBSERVER */}
      <header className={`sticky top-0 z-50 w-full transition-colors duration-300 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between shadow-2xs relative ${
        isScrolledPastHero
          ? "bg-[#071324] text-white border-b border-slate-800"
          : "bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/80"
      }`}>
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center shrink-0 lg:w-[250px]">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={60} 
              height={60} 
              priority
              className={`object-contain transition-all ${isScrolledPastHero ? "filter brightness-0 invert" : ""}`}
              style={{ width: "auto", height: "46px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={200} 
              height={44} 
              priority
              className={`object-contain transition-all ${isScrolledPastHero ? "filter brightness-0 invert" : ""}`}
              style={{ width: "auto", height: "35px" }}
            />
          </Link>
        </div>

        {/* Center: Main Navigation Menu Items with Dropdowns */}
        <nav className={`hidden lg:flex flex-1 justify-center items-center gap-6 text-xs sm:text-sm font-semibold transition-colors ${
          isScrolledPastHero ? "text-slate-300" : "text-slate-600"
        }`}>
          
          {/* 1. Marketplace Dropdown */}
          <div className="relative group py-2">
            <Link href="/marketplace" className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1">
              <span>Marketplace</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Commercial Property Discovery</div>
                <div className="text-[11px] text-slate-500 font-normal">Verified Grade-A spaces</div>
              </Link>
              <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                <div className="text-xs font-bold text-[#0F8B7D]">FM Services Marketplace</div>
                <div className="text-[11px] text-slate-500 font-normal">Pre-vetted MEP &amp; facility contractors</div>
              </Link>
            </div>
          </div>

          {/* 2. Services Dropdown — Showing ALL Services (Hard FM, Soft FM & Managed) */}
          <div className="relative group py-2">
            <button className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>Services</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full -left-20 w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] mb-2 px-1">
                All Facility Management &amp; Property Services
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">Hard FM &amp; Engineering</span>
                  <Link href="/fm-marketplace?category=MEP+Services" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">MEP &amp; Electrical</div>
                    <div className="text-[10px] text-slate-500">11KV Substations, DG &amp; HT/LT</div>
                  </Link>
                  <Link href="/fm-marketplace?category=HVAC" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">HVAC &amp; Chillers</div>
                    <div className="text-[10px] text-slate-500">Central plant, VRV/VRF AMC</div>
                  </Link>
                  <Link href="/fm-marketplace?category=Fire+Safety" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">Fire Safety &amp; NOC</div>
                    <div className="text-[10px] text-slate-500">Alarms, hydrants &amp; CFO audit</div>
                  </Link>
                  <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">Elevator &amp; Lifts AMC</div>
                    <div className="text-[10px] text-slate-500">24/7 rescue &amp; OEM parts</div>
                  </Link>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">Soft FM &amp; Managed</span>
                  <Link href="/fm-marketplace?category=Security" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">24/7 Security &amp; Access</div>
                    <div className="text-[10px] text-slate-500">Manned guards &amp; biometrics</div>
                  </Link>
                  <Link href="/fm-marketplace?category=Cleaning" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">Deep Cleaning &amp; FM</div>
                    <div className="text-[10px] text-slate-500">Corporate scrubbing &amp; hygiene</div>
                  </Link>
                  <Link href="/fm-marketplace?category=Pest+Control" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="font-bold text-slate-900">Pest &amp; Landscaping</div>
                    <div className="text-[10px] text-slate-500">Commercial fumigation &amp; greens</div>
                  </Link>
                  <Link href="/managed-services" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors border border-teal-100 bg-teal-50/30">
                    <div className="font-bold text-[#0F8B7D]">Turnkey Managed FM</div>
                    <div className="text-[10px] text-teal-700">End-to-end IFM stewardship</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Platform Dropdown — Display SaaS Products & Services Separately */}
          <div className="relative group py-2">
            <button className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>Platform</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/properties/rent-roll" className="block p-2 rounded-xl hover:bg-amber-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Rent Roll Master</div>
                <div className="text-[11px] text-slate-500 font-normal">Institutional lease indexation &amp; digital ledgers</div>
              </Link>
              <Link href="/manage" className="block p-2 rounded-xl hover:bg-amber-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">CAM Billing &amp; Allocation</div>
                <div className="text-[11px] text-slate-500 font-normal">Automated reconciliation &amp; invoicing</div>
              </Link>
              <Link href="/compliance" className="block p-2 rounded-xl hover:bg-emerald-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Statutory Compliances &amp; NOCs</div>
                <div className="text-[11px] text-slate-500 font-normal">Fire NOCs, lift licenses &amp; CFO audit radar</div>
              </Link>
              <Link href="/operate" className="block p-2 rounded-xl hover:bg-blue-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Operate (CAFM &amp; PPM)</div>
                <div className="text-[11px] text-slate-500 font-normal">52-week PPM calendar &amp; tenant helpdesk</div>
              </Link>
              <Link href="/intelligence" className="block p-2 rounded-xl hover:bg-purple-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Intelligence &amp; ESG</div>
                <div className="text-[11px] text-slate-500 font-normal">Portfolio NOI yields &amp; ESG benchmarks</div>
              </Link>
              <Link href="/platform" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors border-t border-slate-100 mt-1 pt-2">
                <div className="text-xs font-bold text-[#0F8B7D]">Core Architecture &amp; APIs</div>
                <div className="text-[11px] text-slate-500 font-normal">Single source of truth foundation</div>
              </Link>
            </div>
          </div>

          {/* 4. Company Dropdown */}
          <div className="relative group py-2">
            <button className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>Company</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full right-0 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/about" className="block p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-900">
                About OfficeX
              </Link>
              <Link href="/careers" className="block p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-900">
                Careers
              </Link>
              <Link href="/resources" className="block p-2 rounded-xl hover:bg-teal-50/60 text-xs font-bold text-[#0F8B7D] flex items-center justify-between">
                <span>Case Studies</span>
                <span className="text-[9px] bg-teal-100 text-[#0F8B7D] px-1.5 py-0.5 rounded-full font-extrabold">Results</span>
              </Link>
              <Link href="/resources" className="block p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-900">
                Resources &amp; Insights
              </Link>
              <Link href="/faq" className="block p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-900">
                FAQs
              </Link>
              <Link href="/contact" className="block p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-[#0F8B7D]">
                Contact Us
              </Link>
            </div>
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center justify-end gap-3 shrink-0">
          <HeaderAuthButton />
          <button 
            type="button"
            onClick={() => openEnquiry()}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Schedule a Call</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-1 text-slate-700 hover:text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-4 md:hidden text-slate-900 shadow-2xl animate-fadeIn overflow-y-auto pb-10">
          <div className="flex items-center gap-3.5 mb-2">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={48} 
              height={48} 
              style={{ width: "auto", height: "40px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={155} 
              height={36} 
              style={{ width: "auto", height: "30px" }}
            />
          </div>
          <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Commercial Spaces Marketplace</Link>
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">FM Services Marketplace</Link>
          <Link href="/properties/rent-roll" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">Rent Roll Master</Link>
          <Link href="/manage" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">CAM Billing &amp; Allocation</Link>
          <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-emerald-600">Statutory Compliances &amp; NOCs</Link>
          <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#2563EB]">Operate (CAFM &amp; PPM)</Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Intelligence &amp; ESG</Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#059669]">Managed Services</Link>
          <Link href="/platform" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Platform Core Architecture</Link>
          <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Careers</Link>
          <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">Case Studies &amp; Client Results</Link>
          <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Resources &amp; Insights</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Contact Us</Link>
          <hr className="border-slate-200 my-2" />
          <div className="py-1">
            <HeaderAuthButton />
          </div>
          <button 
            type="button"
            onClick={() => { setMobileMenuOpen(false); openEnquiry(); }}
            className="w-full py-3 rounded-xl bg-[#0F8B7D] text-white font-bold text-center shadow-md cursor-pointer text-sm"
          >
            Schedule a Call
          </button>
        </div>
      )}

      {/* SECTION 2: HERO — PRESTIGIOUS ENTERPRISE CRE & FM PLATFORM (LEFT-ALIGNED) */}
      <section className="relative min-h-[580px] md:min-h-[640px] lg:min-h-[680px] w-full max-w-full overflow-hidden flex flex-col justify-center pt-10 md:pt-14 pb-12 md:pb-14 bg-[#071324]">
        
        {/* Background: Majestic Commercial Glass Skyscraper Headquarters Banner */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/images/officex_prestige_cre_hero.jpg"
            alt="OfficeX Commercial Real Estate and Facility Management Ecosystem"
            fill
            priority
            unoptimized
            className="object-cover object-right md:object-[center_right] opacity-90"
          />

          {/* Multi-stop gradient scrims ensuring 100% razor-sharp readability on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071324] via-[#071324]/95 md:via-[#071324]/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071324]/70 via-transparent to-[#071324]/50 pointer-events-none" />
          
          {/* Subtle architectural precision dot-grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#0f8b7d20_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        </div>

        {/* Left-Aligned Enterprise Hero Column */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-[690px] text-left">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[11px] sm:text-xs font-extrabold tracking-wide mb-3.5 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>THE FUTURE OF COMMERCIAL WORKPLACE OPERATIONS</span>
            </div>

            {/* Main Headline — Left-Aligned with Pristine Contrast */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-[1.18] mb-3">
              The Integrated CRE &amp; FM Ecosystem for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">
                Smarter Workplace Operations
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-xs sm:text-sm md:text-base font-normal text-slate-300 leading-relaxed max-w-xl mb-6">
              Find commercial spaces, source verified services, and manage building operations — all from one platform.
            </p>

            {/* The 3-Tab Search Card Component */}
            <div className="w-full mb-3.5">
              {/* Unified Modern Segmented Tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0 overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("space")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeSearchTab === "space"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/90 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  <Building2 size={14} className={activeSearchTab === "space" ? "text-white" : "text-slate-400"} />
                  <span>Find Commercial Space</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("vendor")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeSearchTab === "vendor"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/90 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  <Wrench size={14} className={activeSearchTab === "vendor" ? "text-white" : "text-slate-400"} />
                  <span>Hire FM Vendors</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("managed")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeSearchTab === "managed"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/90 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  <ShieldCheck size={14} className={activeSearchTab === "managed" ? "text-white" : "text-slate-400"} />
                  <span>Managed Services</span>
                </button>
              </div>

              {/* Main Search Bar Card */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl p-3 sm:p-3.5 border border-slate-200 w-full text-left">
                {activeSearchTab === "space" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-0">
                    {/* Field 1: Location */}
                    <div className="flex-[1.1] md:pr-3.5 md:border-r border-slate-200">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Commercial Hub / City
                      </label>
                      <select
                        value={spaceCity}
                        onChange={(e) => setSpaceCity(e.target.value)}
                        className="w-full text-xs sm:text-[13px] font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Mumbai">Mumbai (BKC)</option>
                        <option value="Bengaluru">Bengaluru (ORR)</option>
                        <option value="Gurugram">Delhi NCR (Cyber City)</option>
                        <option value="Pune">Pune (Hinjewadi)</option>
                        <option value="Hyderabad">Hyderabad (HITEC)</option>
                        <option value="Ahmedabad">Ahmedabad (GIFT City)</option>
                      </select>
                    </div>

                    {/* Field 2: Space Size */}
                    <div className="flex-1 md:px-3.5 md:border-r border-slate-200">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Plate Size / Requirement
                      </label>
                      <select
                        value={spaceBudget}
                        onChange={(e) => setSpaceBudget(e.target.value)}
                        className="w-full text-xs sm:text-[13px] font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="All Sizes">Any Size Plate</option>
                        <option value="Under 5,000">1k - 5k Sq.Ft.</option>
                        <option value="5,000 - 15,000">5k - 15k Sq.Ft.</option>
                        <option value="15,000 - 50,000">15k - 50k Sq.Ft.</option>
                        <option value="Above 50,000">50k+ Sq.Ft. Campus</option>
                      </select>
                    </div>

                    {/* Field 3: Type */}
                    <div className="flex-[1.15] md:px-3.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Workspace Model
                      </label>
                      <select
                        value={spaceGrade}
                        onChange={(e) => setSpaceGrade(e.target.value)}
                        className="w-full text-xs sm:text-[13px] font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Managed Office">Managed Office</option>
                        <option value="Commercial Office">Commercial Office</option>
                        <option value="Office / Coworking">Office / Coworking</option>
                        <option value="Enterprise Campus">Enterprise Campus</option>
                        <option value="Bare Shell">Bare Shell</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full md:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-[13px] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Search size={14} />
                        <span>Search Spaces</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeSearchTab === "vendor" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                    {/* Field 1: FM Service */}
                    <div className="flex-1 md:pr-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Facility Service Needed
                      </label>
                      <select
                        value={vendorCategory}
                        onChange={(e) => setVendorCategory(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="HVAC Maintenance">HVAC &amp; Chiller Overhaul</option>
                        <option value="Deep Cleaning">Commercial Sanitization</option>
                        <option value="Electrical Auditing">MEP &amp; Substation Testing</option>
                        <option value="Pest Control">Corporate Manned Security</option>
                        <option value="Fire & Safety NOC">Fire Safety &amp; Lift AMCs</option>
                      </select>
                    </div>

                    {/* Field 2: City */}
                    <div className="flex-1 md:px-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Property Location
                      </label>
                      <select
                        value={vendorCity}
                        onChange={(e) => setVendorCity(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Mumbai">Mumbai (BKC)</option>
                        <option value="Bengaluru">Bengaluru (ORR)</option>
                        <option value="Gurugram">Delhi NCR (Cyber City)</option>
                        <option value="Pune">Pune (Hinjewadi)</option>
                        <option value="Hyderabad">Hyderabad (HITEC)</option>
                        <option value="Ahmedabad">Ahmedabad (GIFT City)</option>
                      </select>
                    </div>

                    {/* Field 3: Scope */}
                    <div className="flex-1 md:px-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Contract Term
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Annual AMC">Annual Maintenance Contract (AMC)</option>
                        <option value="One-Time Service">One-Time Project / Overhaul</option>
                        <option value="Multi-Year IFM">Multi-Year Integrated FM</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Search size={15} />
                        <span>Find Vendors</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeSearchTab === "managed" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                    {/* Field 1: Managed Solution */}
                    <div className="flex-1 md:pr-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Stewardship Scope
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Turnkey Fitout">Turnkey Stewardship</option>
                        <option value="Integrated FM">Integrated IFM Operations</option>
                        <option value="Energy & ESG">CAM Audit &amp; Reconciliation</option>
                        <option value="Statutory Compliance">100% Compliance Vault</option>
                      </select>
                    </div>

                    {/* Field 2: Portfolio Size */}
                    <div className="flex-1 md:px-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Gross Leasable Area
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="10k-50k">10,000 - 50,000 Sq.Ft.</option>
                        <option value="50k-200k">50,000 - 200,000 Sq.Ft.</option>
                        <option value="200k+">200,000+ Sq.Ft. Campus</option>
                      </select>
                    </div>

                    {/* Field 3: City */}
                    <div className="flex-1 md:px-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Location
                      </label>
                      <select
                        value={spaceCity}
                        onChange={(e) => setSpaceCity(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Gurugram">Delhi NCR</option>
                        <option value="Multi-City">Multi-City Portfolio</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={() => router.push('/managed-services')}
                        className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <ArrowRight size={15} />
                        <span>Learn More</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Institutional Trust Badges — Left Aligned Single Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-300 font-semibold mt-4">
              <span className="text-slate-400 text-[10px] sm:text-[10.5px] uppercase tracking-wider font-extrabold mr-0.5">Trusted by:</span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 text-slate-200 text-[10.5px] backdrop-blur-xs">
                <ShieldCheck size={11} className="text-teal-400 shrink-0" />
                <span>SOC 2 Type II</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 text-slate-200 text-[10.5px] backdrop-blur-xs">
                <Lock size={11} className="text-teal-400 shrink-0" />
                <span>AES-256 Vaulted</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 text-slate-200 text-[10.5px] backdrop-blur-xs">
                <CheckCircle2 size={11} className="text-teal-400 shrink-0" />
                <span>DPDP Act 2023</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 text-slate-200 text-[10.5px] backdrop-blur-xs">
                <Award size={11} className="text-teal-400 shrink-0" />
                <span>Escrow Protected</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 text-slate-200 text-[10.5px] backdrop-blur-xs">
                <Globe size={11} className="text-teal-400 shrink-0" />
                <span>100% Audited</span>
              </span>
            </div>

          </div>
        </div>

        {/* Sticky Nav Sentinel */}
        <div ref={heroSentinelRef} className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none" />
      </section>

      {/* SECTION 02: THE OFFICEX ECOSYSTEM */}
      <section 
        id="ecosystem" 
        className="py-10 md:py-12 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12 flex flex-col items-center">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#0F8B7D]">
              THE OFFICEX ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything you need. All connected.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-2.5 max-w-xl mx-auto">
              Five specialized modules unified on a single intelligent platform — select any module to explore capabilities.
            </p>
          </div>

          {/* 5 Vertical Colored Cards with distinct vibrant colors matching client reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {[
              {
                id: "property",
                title: "Office / CRE Discovery Marketplace",
                desc: "Discover. Compare. Lease.",
                benefits: ["Verified Grade-A listings across metros", "Side-by-side space comparison tools", "Direct owner/manager connection"],
                audience: "For: Occupiers, Brokers, Owners",
                image: "/images/card_office_marketplace.jpg",
                bgColor: "bg-[#00A86B]",
                arrowColor: "text-[#00A86B]",
                href: "/marketplace",
                iconType: "arrow",
              },
              {
                id: "fm",
                title: "Facility Management Marketplace",
                desc: "Connect with Trusted Professionals",
                benefits: ["250+ pre-vetted FM vendors", "Structured RFQ with BOQ generation", "Escrow-protected milestone payments"],
                audience: "For: Building Owners, FM Heads",
                image: "/images/card_fm_hd.jpg",
                bgColor: "bg-[#F26522]",
                arrowColor: "text-[#F26522]",
                href: "/fm-marketplace",
                iconType: "arrow",
              },
              {
                id: "saas",
                title: "Operate (CAFM & PPM)",
                desc: "52-week automated PPM & digital ticketing.",
                benefits: ["52-week automated PPM calendar", "SLA-backed helpdesk & ticketing", "Rent roll, CAM billing & compliance"],
                audience: "For: Facility & Property Managers",
                image: "/images/card_saas_hd.jpg",
                bgColor: "bg-[#2563EB]",
                arrowColor: "text-[#2563EB]",
                href: "/operate",
                iconType: "arrow",
              },
              {
                id: "managed",
                title: "Managed Services",
                desc: "End-to-end PM & IFM with SLA guarantees.",
                benefits: ["On-ground certified engineering teams", "Monthly auto-generated MIS reports", "100% open-book transparent billing"],
                audience: "For: Owners without in-house FM",
                image: "/images/card_managed_hd.jpg",
                bgColor: "bg-[#7C3AED]",
                arrowColor: "text-[#7C3AED]",
                href: "/managed-services",
                iconType: "arrow",
              },
              {
                id: "intelligence",
                title: "OFFICEX Intelligence",
                desc: "Actionable insights & portfolio analytics.",
                benefits: ["Portfolio NOI & WALE dashboards", "Energy benchmarking & ESG reports", "Predictive maintenance forecasting"],
                audience: "For: Asset Managers, REITs, CFOs",
                image: "/images/card_ai_hd.jpg",
                bgColor: "bg-[#E11D48]",
                arrowColor: "text-[#E11D48]",
                href: "/intelligence",
                iconType: "sparkle",
              },
            ].map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-slate-100"
              >
                {/* Top Half: Photo */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>

                {/* Bottom Half: Solid Vibrant Color Box */}
                <div className={`${card.bgColor} p-5 flex flex-col justify-between flex-1 min-h-[210px]`}>
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-snug mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-white/80 font-medium mb-3">
                      {card.desc}
                    </p>
                    {/* 3 Bullet Benefits */}
                    <ul className="space-y-1.5">
                      {card.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/90 font-semibold leading-tight">
                          <Check size={10} className="text-white/70 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Audience Tag + Explore */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">
                      {card.audience}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
                      {card.iconType === "sparkle" ? (
                        <Sparkles size={14} className={card.arrowColor} />
                      ) : (
                        <ArrowRight size={14} className={card.arrowColor} />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* DIVIDER: "Powered by OFFICEX CORE" with Downward Chevron seamlessly touching lines */}
          <div className="w-full mt-5 mb-0 sm:mt-6 sm:mb-0 flex flex-col items-center justify-center">
            {/* Centered Box with "Powered by OFFICEX CORE" */}
            <div className="flex flex-col items-center mb-0.5 text-center">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider">
                Powered by
              </span>
              <span className="text-sm sm:text-base font-black text-[#0F8B7D] tracking-widest uppercase">
                OFFICEX CORE
              </span>
            </div>

            {/* Animated converging lines forming the downward arrow pointing directly to the diagram */}
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center">
              <svg 
                className="w-full h-7 overflow-visible" 
                viewBox="0 0 1000 28" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="coreBeamLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.2" />
                    <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="coreBeamRightGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.2" />
                    <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* 1. Left animated beam: connects from left edge to center arrow tip */}
                <path 
                  d="M0,3 L440,3 L500,20" 
                  stroke="url(#coreBeamLeftGrad)" 
                  strokeWidth="3" 
                  fill="none" 
                  vectorEffect="non-scaling-stroke" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-core-beam-left"
                  strokeDasharray="520"
                />

                {/* 2. Right animated beam: connects from right edge to center arrow tip */}
                <path 
                  d="M1000,3 L560,3 L500,20" 
                  stroke="url(#coreBeamRightGrad)" 
                  strokeWidth="3" 
                  fill="none" 
                  vectorEffect="non-scaling-stroke" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-core-beam-right"
                  strokeDasharray="520"
                />

                {/* 3. Downward Arrow Head Indicator pointing directly to diagram below */}
                <polygon 
                  points="492,15 500,27 508,15" 
                  fill="#0F8B7D" 
                  className="animate-core-arrow-pulse"
                />
              </svg>
            </div>
          </div>

          {/* LOWER HALF: OFFICEX CORE DATA FOUNDATION & ARCHITECTURE DIAGRAM */}
          <div 
            id="officex-core" 
            className="pt-0 -mt-2 sm:-mt-3"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start w-full">
              
              {/* LEFT COLUMN: Core Proposition & Services (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-start pt-1 sm:pt-2">
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-950 tracking-tight leading-[1.2] uppercase mb-2">
                  <span className="block">ONE CORE.</span>
                  <span className="block">ONE DATA FOUNDATION.</span>
                  <span className="block">ONE SOURCE OF TRUTH.</span>
                </h2>
                
                <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed font-normal max-w-lg">
                  OFFICEX Core connects your entire property ecosystem on a single, secure and intelligent data foundation.
                </p>

                {/* Checklist */}
                <div className="mt-3.5 space-y-2">
                  {[
                    "No more siloed systems",
                    "No duplicate data",
                    "No manual reconciliations",
                    "Real-time visibility across the portfolio",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#0F8B7D] stroke-[2.5]" />
                      </div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Integrated Core Capabilities Badges */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    FOUNDATION SERVICES &amp; VAULT
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      "Identity & Access",
                      "Billing & Payments",
                      "Document Vault",
                      "Audit & Compliance",
                      "Integration Engine"
                    ].map((service, idx) => (
                      <span 
                        key={idx} 
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>EXPLORE CORE</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => router.push('/platform')}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Platform Architecture</span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Architectural Radial Diagram (7 cols - enlarged) */}
              <div className="lg:col-span-7 relative w-full flex items-center justify-center p-0">
                <CoreArchitectureDiagram />
              </div>
            </div>
          </div>
        </div>
      </section>

    {/* SECTION: DUAL MARKETPLACE SHOWCASE (4 FM Vendor Services & 4 Commercial Offices) */}
    <MarketplaceDualShowcase
      onOpenEnquiry={(prefill) => openEnquiry(prefill)}
    />

    {/* SECTION 04: AUDIENCE & USE CASES (MERGED WITH A SMARTER WAY TO BUILD, MANAGE AND GROW) */}
    <section 
      id="stakeholders" 
      className="py-8 sm:py-10 md:py-12 bg-[#F8FAFC] border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header: Merged Tagline + Title */}
        <div className="max-w-3xl mb-4 sm:mb-5">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
            AUDIENCE &amp; USE CASES
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight mt-1.5 sm:mt-2 leading-tight uppercase">
            ONE PLATFORM. EVERY STAKEHOLDER.
          </h2>
          <p className="text-slate-500 text-xs sm:text-[13px] font-medium mt-1 leading-normal max-w-2xl">
            Engineered specifically for Owners &amp; Developers, REITs &amp; Asset Managers, Occupiers &amp; Enterprises, and Facility Management Companies.
          </p>
        </div>

        {/* Interactive Persona Tabs + Carousel Arrow Controls */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {stakeholderKeys.map((key) => {
              const label =
                key === "owner"
                  ? "Owners & Developers"
                  : key === "investor"
                  ? "REITs & Asset Managers"
                  : key === "occupier"
                  ? "Occupiers & Enterprises"
                  : key === "fm"
                  ? "Facility Management Companies"
                  : key === "vendor"
                  ? "Vendors & Contractors"
                  : "IT & Workplace Tech";
              const isActive = activeStakeholder === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => scrollToStakeholder(key)}
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0F8B7D] text-white shadow-sm ring-2 ring-teal-300/40"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Arrow Controls for manual sliding */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevStakeholder}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-slate-600 hover:text-[#0F8B7D] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="Previous persona"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={handleNextStakeholder}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-slate-600 hover:text-[#0F8B7D] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="Next persona"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Continuous Auto-scrolling Carousel View (No Visible Scrollbar) */}
        <div>
          {/* Horizontal Track with hidden scrollbar */}
          <div
            ref={carouselTrackRef}
            onScroll={handleCarouselScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar [&::-webkit-scrollbar]:hidden py-1 -mx-1 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            tabIndex={0}
            aria-label="Stakeholder Carousel"
          >
            {stakeholderKeys.map((key) => {
              const data = stakeholderData[key];
              const isActive = activeStakeholder === key;

              return (
                <div
                  key={key}
                  data-stakeholder-card={key}
                  className={`w-full min-w-full shrink-0 snap-start bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 border transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch ${
                    isActive 
                      ? "border-teal-300/80 shadow-lg ring-1 ring-teal-100" 
                      : "border-slate-200 shadow-xs opacity-95"
                  }`}
                >
                  {/* Left Column: Role Details */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {data.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {data.role}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 mt-2 tracking-tight leading-snug">
                        {data.headline}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-[13px] font-semibold mt-1.5 italic leading-relaxed">
                        "{data.quote}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-3 sm:mt-4">
                      {data.points.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-[12px] font-bold text-slate-800 leading-snug">
                          <CheckCircle size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Dark Dashboard KPIs */}
                  <div className="lg:col-span-5 bg-[#071324] text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md border border-slate-800">
                    <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">Target Performance Metrics</span>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">{data.role} Dashboard</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4 text-center">
                      {data.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <div className="text-sm sm:text-base font-black text-teal-400">{m.val}</div>
                          <div className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5 leading-tight">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={data.landingHref}
                        className="w-full py-2 sm:py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-500/30"
                      >
                        <span>See your journey</span>
                        <ArrowRight size={13} />
                      </Link>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(data.portalHref)}`}
                        className="w-full py-2.5 sm:py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span>Launch {data.portalName}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>

    {/* SECTION 05: REAL OUTCOMES & MEASURABLE IMPACT (MOVED BEFORE TRANSFORMATION & ROI) */}
    <section id="outcomes" className="py-14 md:py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Real Outcomes. Measurable Impact.
          </h2>
        </div>

        {/* Enterprise Logos Row */}
        <div className="mb-12 text-center">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Used by teams managing portfolios at:
          </span>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 opacity-80 transition-all">
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B7D]"></span> PRESTIGE GROUP
            </div>
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> EMBASSY SERVICES
            </div>
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> BROOKFIELD
            </div>
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> RMZ CORP
            </div>
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> DLF COMMERCIAL
            </div>
            <div className="flex items-center gap-2 font-black text-slate-700 tracking-tight text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> MINDSPACE REIT
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8 xl:gap-12 items-center justify-center max-w-6xl mx-auto">
          {/* 1. 10M+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6 text-[#00A86B]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#00A86B] tracking-tight">10M+</div>
              <div className="text-xs font-bold text-slate-500 leading-tight">Sq.Ft. of Space on Platform</div>
            </div>
          </div>

          {/* 2. 500+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-[#0F8B7D]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F8B7D] tracking-tight">500+</div>
              <div className="text-xs font-bold text-slate-500 leading-tight">FM Vendors</div>
            </div>
          </div>

          {/* 3. 1,000+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#0F8B7D]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F8B7D] tracking-tight">1,000+</div>
              <div className="text-xs font-bold text-slate-500 leading-tight">Buildings Managed</div>
            </div>
          </div>

          {/* 4. 30% */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-[#F26522]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#F26522] tracking-tight">30%</div>
              <div className="text-xs font-bold text-slate-500 leading-tight">Lower Operating Cost</div>
            </div>
          </div>

          {/* 5. 95% */}
          <div className="flex items-center gap-3.5 col-span-2 sm:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#DB2777]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#DB2777] tracking-tight">95%</div>
              <div className="text-xs font-bold text-slate-500 leading-tight">Client Retention</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[11px] font-bold text-slate-400">
          * Audited platform metrics as of Q3 2026 across commercial hubs in Bengaluru, Mumbai MMR, and Delhi NCR.
        </div>

      </div>
    </section>

    {/* SECTION 06: BEFORE VS AFTER COMPARISON (TRANSFORMATION & ROI) */}
    <section id="comparison" className="py-14 md:py-20 bg-slate-50/60 border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
            TRANSFORMATION &amp; ROI
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Why Modern Teams Switch to OfficeX
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2">
            Shift from disconnected spreadsheets and delayed reporting to high-velocity operating confidence.
          </p>
        </div>

        {/* Before vs After Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* BEFORE OFFICEX Card */}
          <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-300/80">
                BEFORE OFFICEX
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-4 mb-2">
                Manual Chaos, Silos &amp; Delayed Reporting
              </h3>
              <p className="text-xs text-slate-600 font-medium mb-6">
                Critical tasks slip through cracks when property operations live across disconnected spreadsheets and messaging channels.
              </p>

              <div className="space-y-3">
                {[
                  "Disconnected Excel spreadsheets for rent roll and CAM",
                  "Untracked vendor requests and informal WhatsApp groups",
                  "Scattered compliance documents risking fire & labor fines",
                  "Manual reconciliations and delayed month-end reporting",
                  "Zero real-time visibility across multi-building portfolios"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-[10px] shrink-0">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-200/80 text-[11px] font-bold text-slate-500">
              Impact: Revenue leakage, compliance fines, and tenant friction
            </div>
          </div>

          {/* AFTER OFFICEX Card */}
          <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-white border-2 border-[#0F8B7D] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#0F8B7D] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  AFTER OFFICEX
                </span>
                <span className="text-[10px] font-extrabold text-[#0F8B7D] uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Recommended
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-4 mb-2">
                Unified Data Core &amp; Automated Operational Rigor
              </h3>
              <p className="text-xs text-slate-600 font-medium mb-6">
                Connect every commercial lease, facility maintenance task, and tenant service request into a continuous digital ecosystem.
              </p>

              <div className="space-y-3">
                {[
                  "Single unified data foundation across all properties",
                  "52-week PPM calendars and QR digital asset passports",
                  "100% audit-ready statutory compliance matrix",
                  "Verified vendor procurement with milestone escrow payments",
                  "Instant executive portfolio dashboards and NOI analytics"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                    <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-teal-100 text-[11px] font-extrabold text-[#0F8B7D]">
              Result: 30% lower operating overhead and institutional governance
            </div>
          </div>

        </div>

      </div>
    </section>

    {/* SECTION 07: QUESTIONS & ANSWERS (COMPACT FONTS & HEIGHTS) */}
    <section id="faq" className="py-10 md:py-14 bg-white px-4 md:px-6 w-full max-w-full overflow-hidden border-b border-slate-200">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
            QUESTIONS &amp; ANSWERS
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-[13px] mt-1.5">
            Clear answers about vendor operations, billing security, and platform integrations.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 md:gap-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#F8FAFC] rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-slate-300 transition-colors">
              <button 
                onClick={() => toggleFAQ(idx)}
                className="w-full px-4 md:px-5 py-3 md:py-3.5 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-100/50 transition-colors"
              >
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-800">{faq.q}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${activeFAQ === idx ? "transform rotate-180 text-[#0F8B7D]" : ""}`} />
              </button>
              {activeFAQ === idx && (
                <div className="px-4 md:px-5 pb-3.5 text-xs text-slate-600 border-t border-slate-200/70 pt-2.5 leading-relaxed font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F8B7D] hover:underline"
          >
            <span>See all FAQs &amp; Knowledge Base</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>

    {/* SECTION 08: COMMERCIAL ENQUIRY (CLEAN BANNER WITH BUTTONS) */}
    <section id="enquiry" className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-teal-50/30 border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto w-full text-center">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
          COMMERCIAL ENQUIRY
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
          Talk to Us — We Respond Within 24 Business Hours.
        </h2>
        <p className="text-slate-600 font-medium text-xs sm:text-sm mt-2 max-w-xl mx-auto">
          Connect directly with our solutions engineering desk for custom portfolio onboarding, vendor procurement, or platform integration.
        </p>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => openEnquiry()}
            className="px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Open Commercial Enquiry</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Talk to Sales Desk</span>
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium">
          Prefer an immediate consultation?{" "}
          <a
            href="https://calendly.com/officex-sales/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0F8B7D] hover:underline"
          >
            Schedule a 30-minute call on Calendly →
          </a>
        </div>
      </div>
    </section>

      {/* FOOTER */}
      <Footer />

      {/* CONTACT SALES MODAL OVERLAY */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-w-md w-full relative">
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
            
            {contactStatus === "success" ? (
              <div className="text-center py-8 flex flex-col items-center justify-center animate-scaleUp">
                <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-[#0F8B7D] mb-4 shadow">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">Request Submitted</h4>
                <p className="text-xs text-slate-500 mt-2 font-semibold">
                  Thank you! Our enterprise account team will reach out to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Contact Enterprise Sales</h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Learn how OfficeX scales across multi-region property portfolios.</p>
                </div>
                
                <hr className="border-slate-100" />
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name" 
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email *</label>
                  <input 
                    type="email" 
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com" 
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                    <input 
                      type="text" 
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="e.g. DLF" 
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="tel" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91..." 
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Message</label>
                  <textarea 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your portfolio..." 
                    rows={3}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold resize-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={contactStatus === "sending"}
                  className="w-full py-3 mt-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:bg-slate-350"
                >
                  {contactStatus === "sending" ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TALK TO SALES SLIDE-IN DRAWER */}
      <EnquirySlideIn
        isOpen={isEnquirySlideInOpen}
        onClose={() => setIsEnquirySlideInOpen(false)}
        prefill={enquiryPrefill}
      />

    </div>
  );
}


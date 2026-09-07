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
  CheckCircle,
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

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor" | "managed">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(4); // Default to escrow payment step
  const [isEnquirySlideInOpen, setIsEnquirySlideInOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<{ audience?: string; modules?: string[] } | undefined>(undefined);
  const [pricingView, setPricingView] = useState<"tiers" | "matrix">("tiers");

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
      role: "Property Owner / CEO",
      headline: "Maximize Portfolio Yields & Protect Net Operating Income",
      quote: "Gain real-time visibility across rent roll, occupancy risk, and operating expenditure from a single dashboard.",
      badge: "Yield & Asset Optimization",
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
    occupier: {
      role: "Corporate Occupier",
      headline: "Empower Your Employees with Frictionless Workplace Operations",
      quote: "Self-service service requests, instant touchless visitor registration, and real-time billing clarity.",
      badge: "Tenant Experience",
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
      role: "Facility Manager",
      headline: "Automate 52-Week Maintenance & Enforce Strict Vendor SLAs",
      quote: "Replace WhatsApp chaos and paper logs with digital asset passports, automated PPM, and instant escalations.",
      badge: "Operational Control",
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
      role: "Vendor / Service Partner",
      headline: "Win Grade-A Contracts & Enjoy Guaranteed Escrow Payouts",
      quote: "Direct access to high-value commercial RFQs with milestone payments locked in RBI-regulated escrow accounts.",
      badge: "Vendor Empowerment",
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
    investor: {
      role: "Investor / REIT",
      headline: "Audit-Ready Data, Institutional Governance & Verifiable Returns",
      quote: "Standardized property metrics, audited compliance trails, and verified lease cash flows for diligence.",
      badge: "Institutional Trust",
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
    it: {
      role: "IT & Workplace Tech",
      headline: "Enterprise APIs, Touchless Access & Scalable IoT Infrastructure",
      quote: "Connect BMS telemetry, digital access credentials, and tenant apps on an institutional security foundation.",
      badge: "Workplace Technology",
      metrics: [
        { label: "API Latency", val: "<45ms" },
        { label: "Uptime SLA", val: "99.95%" },
        { label: "Security Level", val: "SOC 2" },
      ],
      points: [
        "SAML 2.0 & Okta SSO integration with automated directory syncing",
        "Standardized BACnet/IP, Modbus TCP, and MQTT BMS telemetry connectors",
        "Instant QR mobile visitor passes and NFC gate access provisioning",
        "Complete compliance with India's DPDP Act 2023 and ISO 27001 standards"
      ]
    }
  };

  // Stakeholder auto-rotation & carousel state
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);

  const stakeholderKeys: ("owner" | "occupier" | "fm" | "vendor" | "investor" | "it")[] = [
    "owner", "occupier", "fm", "vendor", "investor", "it"
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
    // Check if user is already logged in
    const email = typeof window !== "undefined" ? localStorage.getItem("officex_user_email") : null;
    const sub = typeof window !== "undefined" ? localStorage.getItem("officex_subscription") : null;

    if (!email) {
      // Unauthenticated: Lead to Login page per requirement
      const intent = activeSearchTab === "space" ? "commercial-space" : "vendor-fm";
      router.push(`/login?redirect=/marketplace&intent=${intent}`);
      return;
    }

    // Logged in: Check subscription
    if (sub === "active") {
      if (activeSearchTab === "space") {
        router.push(
          `/discover?city=${encodeURIComponent(spaceCity)}&area=${encodeURIComponent(spaceArea)}&budget=${encodeURIComponent(spaceBudget)}&grade=${encodeURIComponent(spaceGrade)}`
        );
      } else if (activeSearchTab === "vendor") {
        router.push(
          `/fm-marketplace?category=${encodeURIComponent(vendorCategory)}&city=${encodeURIComponent(vendorCity)}&budget=${encodeURIComponent(vendorBudget)}&type=${encodeURIComponent(vendorType)}`
        );
      } else {
        router.push('/managed-services');
      }
    } else {
      // If subscription is not yet active, lead to their respective landing page
      const role = localStorage.getItem("officex_user_role");
      if (role === "Corporate Occupier") router.push("/audiences/occupiers");
      else if (role === "Facility Manager") router.push("/audiences/fm");
      else if (role === "FM Vendor") router.push("/audiences/vendors");
      else router.push("/audiences/owners");
    }
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
      a: "Yes, security is our primary focus. We use bank-grade AES-256 encryption at rest, TLS 1.3 in transit, and enforce role-based access control (RBAC). Our infrastructure is SOC 2 Type II compliant and hosted on secure AWS Indian region servers."
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
          
          {/* Marketplace Dropdown */}
          <div className="relative group py-2">
            <Link href="/marketplace" className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1">
              <span>Marketplace</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Commercial Property Discovery</div>
                <div className="text-[11px] text-slate-500 font-normal">Verified Grade-A office spaces</div>
              </Link>
              <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">FM Vendor Marketplace</div>
                <div className="text-[11px] text-slate-500 font-normal">Pre-vetted MEP &amp; facility contractors</div>
              </Link>
              <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Structured RFQ Engine</div>
                <div className="text-[11px] text-slate-500 font-normal">Automated BOQs &amp; escrow bids</div>
              </Link>
            </div>
          </div>

          {/* Operate Dropdown */}
          <div className="relative group py-2">
            <Link href="/operate" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
              <span>Operate</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#2563EB] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/operate" className="block p-2 rounded-xl hover:bg-blue-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">CAFM &amp; 52-Week PPM</div>
                <div className="text-[11px] text-slate-500 font-normal">Automated preventative maintenance</div>
              </Link>
              <Link href="/operate" className="block p-2 rounded-xl hover:bg-blue-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Tenant Helpdesk &amp; SLAs</div>
                <div className="text-[11px] text-slate-500 font-normal">Priority ticketing &amp; auto-escalations</div>
              </Link>
              <Link href="/operate" className="block p-2 rounded-xl hover:bg-blue-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Visitor &amp; Amenity Booking</div>
                <div className="text-[11px] text-slate-500 font-normal">QR gate passes &amp; conference rooms</div>
              </Link>
            </div>
          </div>

          {/* Manage Dropdown */}
          <div className="relative group py-2">
            <Link href="/manage" className="hover:text-[#D97706] transition-colors flex items-center gap-1">
              <span>Manage</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#D97706] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/manage" className="block p-2 rounded-xl hover:bg-amber-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Rent Roll &amp; CAM Billing</div>
                <div className="text-[11px] text-slate-500 font-normal">Automated invoices &amp; Razorpay links</div>
              </Link>
              <Link href="/manage" className="block p-2 rounded-xl hover:bg-amber-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Statutory Compliance Radar</div>
                <div className="text-[11px] text-slate-500 font-normal">90/60/30-day alerts for 40+ NOCs</div>
              </Link>
              <Link href="/manage" className="block p-2 rounded-xl hover:bg-amber-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Digital Lease Vault</div>
                <div className="text-[11px] text-slate-500 font-normal">Lock-in schedules &amp; deposit tracking</div>
              </Link>
            </div>
          </div>

          {/* Intelligence Dropdown */}
          <div className="relative group py-2">
            <Link href="/intelligence" className="hover:text-[#7C3AED] transition-colors flex items-center gap-1">
              <span>Intelligence</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#7C3AED] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/intelligence" className="block p-2 rounded-xl hover:bg-purple-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Portfolio NOI &amp; WALE</div>
                <div className="text-[11px] text-slate-500 font-normal">Live yield &amp; occupancy analytics</div>
              </Link>
              <Link href="/intelligence" className="block p-2 rounded-xl hover:bg-purple-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Energy &amp; ESG Benchmarking</div>
                <div className="text-[11px] text-slate-500 font-normal">kWh/sq.ft. &amp; SEBI BRSR Core packs</div>
              </Link>
              <Link href="/intelligence" className="block p-2 rounded-xl hover:bg-purple-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Vendor SLA Benchmarking</div>
                <div className="text-[11px] text-slate-500 font-normal">Cross-portfolio quartile metrics</div>
              </Link>
            </div>
          </div>

          {/* Managed Services Dropdown */}
          <div className="relative group py-2">
            <Link href="/managed-services" className="hover:text-[#059669] transition-colors flex items-center gap-1">
              <span>Managed Services</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#059669] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/managed-services" className="block p-2 rounded-xl hover:bg-emerald-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">On-Ground Property Mgmt</div>
                <div className="text-[11px] text-slate-500 font-normal">Turnkey building stewardship</div>
              </Link>
              <Link href="/managed-services" className="block p-2 rounded-xl hover:bg-emerald-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Integrated FM (IFM)</div>
                <div className="text-[11px] text-slate-500 font-normal">Technical MEP, soft services &amp; security</div>
              </Link>
              <Link href="/managed-services" className="block p-2 rounded-xl hover:bg-emerald-50/60 transition-colors">
                <div className="text-xs font-bold text-slate-900">Monthly Audited MIS</div>
                <div className="text-[11px] text-slate-500 font-normal">Open-book financial delivery</div>
              </Link>
            </div>
          </div>

          {/* Platform */}
          <Link href="/platform" className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap">
            Platform
          </Link>

          {/* Company Dropdown */}
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
        <div className="hidden md:flex items-center justify-end gap-3 shrink-0 lg:w-[320px]">
          <HeaderAuthButton />
          <button 
            type="button"
            onClick={() => router.push('/demo')}
            className="px-4 py-2 rounded-xl border border-[#071324] text-[#071324] hover:bg-slate-50 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
          >
            Book a Demo
          </button>
          <button 
            type="button"
            onClick={() => openEnquiry()}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
          >
            Talk to Sales
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
          <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Marketplace</Link>
          <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#2563EB]">Operate (CAFM)</Link>
          <Link href="/manage" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">Manage (Property SaaS)</Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#7C3AED]">Intelligence</Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#059669]">Managed Services</Link>
          <Link href="/platform" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Platform Core</Link>
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
            Talk to Sales
          </button>
          <button 
            type="button"
            onClick={() => { setMobileMenuOpen(false); router.push('/demo'); }}
            className="w-full py-3 rounded-xl border border-[#071324] text-[#071324] font-bold text-center cursor-pointer text-sm"
          >
            Book a Demo
          </button>
        </div>
      )}

      {/* SECTION 2: HERO — ORIGINAL DARK PRESTIGIOUS BANNER */}
      <section className="relative min-h-[580px] md:min-h-[640px] lg:min-h-[680px] w-full max-w-full overflow-hidden flex flex-col justify-center pt-14 md:pt-16 pb-14 md:pb-16 bg-gradient-to-b from-[#071324] via-[#071324] to-[#0F8B7D] md:bg-[#071324]">
        {/* Real prestigious commercial glass headquarters campus — hidden on mobile to ensure crisp contrast */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/officex_recommended_hero_banner.jpg"
            alt="OfficeX Commercial Workspaces Operating System"
            fill
            priority
            unoptimized
            className="object-cover object-[center_right] md:object-right opacity-80"
          />
          {/* Multi-stop gradient scrims ensuring high readability on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071324] via-[#071324]/90 md:via-[#071324]/75 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-transparent to-[#071324]/60 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Left Column Content (approx 55% width) */}
          <div className="max-w-2xl text-left">
            
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#0F8B7D] md:text-teal-400 mb-3">
              FIND. MANAGE. OPERATE. GROW.
            </p>

            {/* Main Headline in White */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight text-white leading-[1.14] mb-4">
              India&apos;s Integrated CRE &amp; FM Ecosystem —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-300">
                Find Space. Procure Services. Operate Buildings. Gain Intelligence.
              </span>
            </h1>
          
            {/* Subhead */}
            <p className="text-xs sm:text-sm md:text-base font-normal text-slate-200 md:text-slate-300 leading-relaxed max-w-xl mb-6">
              One platform. Five modules. One data foundation. Built for commercial real estate owners, occupiers, and operators across India.
            </p>

            {/* Hero Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7 w-full sm:w-auto">
              <Link
                href="/marketplace"
                className="px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Explore Marketplace</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3 rounded-xl border border-white/40 hover:border-white text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xs text-center"
              >
                <span>Book a Demo</span>
              </Link>
            </div>

            {/* The 3-Tab Search Card Component */}
            <div className="w-full">
              {/* 3 Tabs Header — Mobile optimized with horizontal touch scroll */}
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0 overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setActiveSearchTab("space")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSearchTab === "space"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/85 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  Office Space
                </button>
                <button
                  onClick={() => setActiveSearchTab("vendor")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSearchTab === "vendor"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/85 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  FM Services
                </button>
                <button
                  onClick={() => setActiveSearchTab("managed")}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSearchTab === "managed"
                      ? "bg-[#0F8B7D] text-white shadow-md font-extrabold"
                      : "bg-[#0B1E38]/85 text-slate-300 hover:text-white hover:bg-[#0B1E38] border-t border-x border-slate-700/60"
                  }`}
                >
                  Managed Services
                </button>
              </div>

              {/* Main Search Bar Card */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl p-3 md:p-3.5 border border-slate-200 w-full">
                {activeSearchTab === "space" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                    {/* Field 1: Location */}
                    <div className="flex-1 md:pr-4 md:border-r border-slate-200">
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
                        <option value="Gurugram">Gurugram</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                      </select>
                    </div>

                    {/* Field 2: Space Size */}
                    <div className="flex-1 md:px-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Space Size
                      </label>
                      <select
                        value={spaceBudget}
                        onChange={(e) => setSpaceBudget(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="All Sizes">Any Size</option>
                        <option value="Under 5,000">1,000 - 5,000 Sq.Ft.</option>
                        <option value="5,000 - 15,000">5,000 - 15,000 Sq.Ft.</option>
                        <option value="15,000 - 50,000">15,000 - 50,000 Sq.Ft.</option>
                        <option value="Above 50,000">50,000+ Sq.Ft.</option>
                      </select>
                    </div>

                    {/* Field 3: Type */}
                    <div className="flex-1 md:px-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Type
                      </label>
                      <select
                        value={spaceGrade}
                        onChange={(e) => setSpaceGrade(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Office / Coworking">Office / Coworking</option>
                        <option value="Commercial Office">Commercial Office</option>
                        <option value="Managed Workspace">Managed Workspace</option>
                        <option value="Enterprise Campus">Enterprise Campus</option>
                        <option value="Bare Shell">Bare Shell</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                )}

                {activeSearchTab === "vendor" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                    {/* Field 1: FM Service */}
                    <div className="flex-1 md:pr-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        FM Service
                      </label>
                      <select
                        value={vendorCategory}
                        onChange={(e) => setVendorCategory(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="HVAC Maintenance">HVAC Maintenance</option>
                        <option value="Deep Cleaning">Deep Cleaning</option>
                        <option value="Electrical Auditing">Electrical Auditing</option>
                        <option value="Pest Control">Pest Control</option>
                        <option value="Fire & Safety NOC">Fire &amp; Safety NOC</option>
                      </select>
                    </div>

                    {/* Field 2: City */}
                    <div className="flex-1 md:px-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        City
                      </label>
                      <select
                        value={vendorCity}
                        onChange={(e) => setVendorCity(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Gurugram">Gurugram</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                    </div>

                    {/* Field 3: Scope */}
                    <div className="flex-1 md:px-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Scope
                      </label>
                      <select
                        value={vendorBudget}
                        onChange={(e) => setVendorBudget(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="On-Demand">On-Demand Ticket</option>
                        <option value="Quarterly AMC">Quarterly AMC</option>
                        <option value="Annual Contract">Annual Comprehensive Contract</option>
                        <option value="Audit Only">Statutory Audit Only</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Search FM
                      </button>
                    </div>
                  </div>
                )}

                {activeSearchTab === "managed" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                    {/* Field 1: Managed Solution */}
                    <div className="flex-1 md:pr-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Managed Solution
                      </label>
                      <select
                        className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                      >
                        <option value="Turnkey Fitout">Turnkey Fitout</option>
                        <option value="Integrated FM">Integrated FM</option>
                        <option value="Energy & ESG">ESG &amp; Carbon Analytics</option>
                        <option value="Statutory Compliance">100% Compliance</option>
                      </select>
                    </div>

                    {/* Field 2: Portfolio Size */}
                    <div className="flex-1 md:px-4 md:border-r border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Portfolio Size
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
                        <option value="Gurugram">Gurugram</option>
                        <option value="Pan-India">Pan-India Portfolio</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:pl-2 shrink-0">
                      <button
                        onClick={() => router.push('/managed-services')}
                        className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links below Search Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
              <Link href="/marketplace" className="hover:text-white transition-colors">Buy</Link>
              <span className="text-slate-600">|</span>
              <Link href="/marketplace" className="hover:text-white transition-colors">Lease</Link>
              <span className="text-slate-600">|</span>
              <Link href="/marketplace" className="hover:text-white transition-colors">FM Services</Link>
              <span className="text-slate-600">|</span>
              <Link href="/managed-services" className="hover:text-white transition-colors">Managed Offices</Link>
            </div>

            {/* Talk to an expert link */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Need personalized guidance?</span>
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="font-bold text-teal-300 hover:text-white underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>or talk to an expert</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Floating Callout (in bottom right corner) */}
        <div className="hidden lg:flex flex-col items-start absolute bottom-10 right-8 xl:right-16 z-10 text-white bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-xs sm:text-sm font-light tracking-wide text-slate-300">Space for</span>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">a smarter tomorrow.</span>
          <div className="w-8 h-0.5 bg-[#0F8B7D] mt-1.5 rounded-full" />
        </div>
      </section>

      {/* TRUST STRIP BELOW HERO */}
      <TrustStrip />
      <div ref={heroSentinelRef} className="h-1 w-full pointer-events-none" />

      {/* SECTION 02: THE OFFICEX ECOSYSTEM */}
      <section 
        id="ecosystem" 
        onClick={() => router.push('/login')}
        className="py-16 md:py-20 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden cursor-pointer select-none"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-xs font-black uppercase tracking-widest mb-3 shadow-xs">
              <Sparkles size={14} className="text-[#0F8B7D]" />
              <span>Powered by OFFICEX CORE</span>
            </div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#0F8B7D]">
              THE OFFICEX ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything you need. All connected.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-2.5 max-w-xl mx-auto">
              Click anywhere to sign in and access your workspace across all 5 integrated modules.
            </p>
          </div>

          {/* 5 Vertical Colored Cards matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {[
              {
                id: "property",
                title: "Property Marketplace",
                desc: "Discover, buy, lease, or monetize commercial spaces.",
                image: "/images/card_prop_hd.jpg",
                bgColor: "bg-[#00A86B]",
                arrowColor: "text-[#00A86B]",
                href: "/login",
                iconType: "arrow",
              },
              {
                id: "fm",
                title: "FM Marketplace",
                desc: "Find and engage certified facility service providers.",
                image: "/images/card_fm_hd.jpg",
                bgColor: "bg-[#F26522]",
                arrowColor: "text-[#F26522]",
                href: "/login",
                iconType: "arrow",
              },
              {
                id: "saas",
                title: "OFFICEX PRO\n(SaaS Platform)",
                desc: "Manage your entire property and workplace operations.",
                image: "/images/card_saas_hd.jpg",
                bgColor: "bg-[#0F8B7D]",
                arrowColor: "text-[#0F8B7D]",
                href: "/login",
                iconType: "arrow",
              },
              {
                id: "managed",
                title: "Managed Services",
                desc: "End-to-end property and facility management solutions.",
                image: "/images/card_managed_hd.jpg",
                bgColor: "bg-[#7C3AED]",
                arrowColor: "text-[#7C3AED]",
                href: "/login",
                iconType: "arrow",
              },
              {
                id: "intelligence",
                title: "OFFICEX Intelligence",
                desc: "Actionable insights, analytics, and predictions.",
                image: "/images/card_ai_hd.jpg",
                bgColor: "bg-[#DB2777]",
                arrowColor: "text-[#DB2777]",
                href: "/login",
                iconType: "sparkle",
              },
            ].map((card) => (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/login");
                }}
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
                <div className={`${card.bgColor} p-5 flex flex-col justify-between flex-1 min-h-[170px]`}>
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-snug whitespace-pre-line mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bottom Action Circle */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/90 group-hover:text-white uppercase tracking-wider">
                      Sign In &rarr;
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
                      {card.iconType === "sparkle" ? (
                        <Sparkles size={16} className={card.arrowColor} />
                      ) : (
                        <ArrowRight size={16} className={card.arrowColor} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OFFICEX CORE Foundation Strip */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              router.push('/login');
            }}
            className="mt-6 md:mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-slate-50 to-teal-50/90 border border-teal-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-[#0F8B7D] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[11px] font-black text-[#0F8B7D] uppercase tracking-widest">
                    POWERED BY OFFICEX CORE
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0F8B7D]">
                    One Connected Foundation
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Identity &amp; Access · Billing &amp; Payments · Document Vault · Audit &amp; Compliance · Integration Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-[#0F8B7D] group-hover:translate-x-1 transition-transform shrink-0">
              <span>Sign In to Access Ecosystem</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

    {/* SECTION 03: OFFICEX CORE — Exact 100% Static Diagram matching Option 1 Master Wireframe */}
    <section id="officex-core" className="py-16 md:py-24 bg-white border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Text Content (5 cols) — Exact Option 1 Typography */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Eyebrow matching Option 1 */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Powered by{" "}
              </span>
              <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-widest">
                OFFICEX CORE
              </span>
            </div>

            {/* Headline — Responsive with sm:whitespace-nowrap for mobile perfection */}
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-black text-slate-950 tracking-tight leading-[1.18] uppercase">
              <span className="block sm:whitespace-nowrap">ONE CORE.</span>
              <span className="block sm:whitespace-nowrap">ONE DATA FOUNDATION.</span>
              <span className="block sm:whitespace-nowrap">ONE SOURCE OF TRUTH.</span>
            </h2>
            
            <p className="mt-4 sm:mt-5 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-medium max-w-lg">
              OFFICEX Core connects your entire property ecosystem on a single, secure and intelligent data foundation.
            </p>

            {/* Checklist with Option 1 Copy */}
            <div className="mt-6 sm:mt-7 space-y-3 sm:space-y-3.5">
              {[
                "No more siloed systems",
                "No duplicate data",
                "No manual reconciliations",
                "Real-time visibility across the portfolio",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#0F8B7D] stroke-[3]" />
                  </div>
                  <span className="text-slate-800 font-semibold text-xs sm:text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-7 sm:mt-8">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>EXPLORE CORE</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Architectural Radial Diagram (7 cols) */}
          <div className="lg:col-span-7 relative w-full max-w-[700px] mx-auto flex items-center justify-center p-0 sm:p-4">
            <CoreArchitectureDiagram />
          </div>
        </div>
      </div>
    </section>

    {/* SECTION 04: BUILT FOR EVERY STAKEHOLDER */}
    <section 
      id="stakeholders" 
      className="py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header with Title and Persona Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              AUDIENCE &amp; USE CASES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
              ONE PLATFORM. EVERY STAKEHOLDER.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
              Tailored tools, permissions, and dashboards engineered for everyone who owns, operates, or occupies workspace.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {stakeholderKeys.map((key) => {
              const label =
                key === "owner"
                  ? "Owners"
                  : key === "occupier"
                  ? "Occupiers"
                  : key === "fm"
                  ? "Facility Mgrs"
                  : key === "vendor"
                  ? "Vendors"
                  : key === "investor"
                  ? "Investors"
                  : "IT & Tech";
              const isActive = activeStakeholder === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => scrollToStakeholder(key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0F8B7D] text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel View */}
        <div>
          {/* Horizontal Scroll / Swipe Track */}
          <div
            ref={carouselTrackRef}
            onScroll={handleCarouselScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 -mx-1 px-1"
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
                    className={`w-full min-w-full shrink-0 snap-start bg-white rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                      isActive 
                        ? "border-teal-200 shadow-xl ring-1 ring-teal-100" 
                        : "border-slate-200 shadow-sm opacity-90"
                    }`}
                  >
                    {/* Left Column: Role Details */}
                    <div className="lg:col-span-7">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                          {data.badge}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {data.role}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 mt-3 tracking-tight">
                        {data.headline}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-2.5 italic">
                        "{data.quote}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        {data.points.map((pt, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800">
                            <CheckCircle size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Dark Dashboard KPIs */}
                    <div className="lg:col-span-5 bg-[#071324] text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl border border-slate-800">
                      <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">Target Performance Metrics</span>
                          <div className="text-sm font-black text-white mt-1">{data.role} Dashboard</div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-8 text-center">
                        {data.metrics.map((m, idx) => (
                          <div key={idx} className="bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                            <div className="text-base sm:text-lg font-black text-teal-400">{m.val}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-tight">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <Link
                          href={`/audiences/${key === "owner" ? "owners" : key === "occupier" ? "occupiers" : key}`}
                          className="w-full py-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-500/30"
                        >
                          <span>See your journey</span>
                          <ArrowRight size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEnquiry({ audience: data.role })}
                          className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <span>Get a personalised demo for {data.role}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

      </div>
    </section>

    {/* SECTION 05: BEFORE VS AFTER COMPARISON */}
    <section id="comparison" className="py-16 md:py-24 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
            TRANSFORMATION &amp; ROI
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Why Modern Teams Switch to OfficeX
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2.5">
            Shift from disconnected spreadsheets and delayed reporting to high-velocity operating confidence.
          </p>
        </div>

        {/* Before vs After Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* BEFORE OFFICEX Card */}
          <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-slate-50/90 border border-slate-200 flex flex-col justify-between shadow-xs">
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

        {/* Mini Case Study Banner */}
        <div className="mt-10 bg-[#071324] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-800">
                PROVEN RESULTS
              </span>
              <h4 className="text-base sm:text-lg font-black text-white mt-1.5">
                Prestige Meridian — Bengaluru
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Reduced FM vendor procurement turnaround by 60%, eliminated 45-day milestone payment disputes, and saved 18% on annual MEP AMC costs using OfficeX Marketplace &amp; Escrow disbursements.
              </p>
            </div>
          </div>
          <Link
            href="/resources"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <span>Read Case Studies</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
    <section id="solutions-banner" className="py-14 md:py-20 bg-[#F8FAFC] border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Dark Column (8 cols): Architecture photo on left, CTA on right */}
          <div className="lg:col-span-8 bg-[#071324] text-white flex flex-col md:flex-row items-stretch relative overflow-hidden">
            {/* Building Image */}
            <div className="w-full md:w-5/12 relative min-h-[220px] md:min-h-[280px]">
              <Image
                src="/images/cta_building_hd.jpg"
                alt="Commercial Workspaces"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 35vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#071324]/80 hidden md:block" />
            </div>

            {/* Text & CTAs */}
            <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                A Smarter Way to<br className="hidden sm:inline" /> Build, Manage and Grow.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-3 leading-relaxed max-w-md">
                Join the organizations redefining property and workplace operations with OFFICEX.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => router.push('/demo')}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Book a Demo
                </button>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Talk to an Expert
                </button>
              </div>
            </div>
          </div>

          {/* Right Light Column (4 cols): 4 Persona Links matching reference */}
          <div className="lg:col-span-4 bg-[#F8FAFB] p-6 md:p-8 flex flex-col justify-center divide-y divide-slate-200/80">
            {[
              {
                title: "Owners & Developers",
                icon: Building,
                target: "stakeholders",
              },
              {
                title: "REITs & Asset Managers",
                icon: BarChart3,
                target: "stakeholders",
              },
              {
                title: "Occupiers & Enterprises",
                icon: Users,
                target: "stakeholders",
              },
              {
                title: "Facility Management Companies",
                icon: Briefcase,
                target: "stakeholders",
              },
            ].map((persona, idx) => (
              <div
                key={idx}
                onClick={() => scrollToSection("stakeholders")}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#0F8B7D] group-hover:border-teal-300 shadow-xs transition-colors">
                    <persona.icon size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">
                    {persona.title}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* SECTION: REAL OUTCOMES & MEASURABLE IMPACT — EXACT MATCH TO USER SCREENSHOT */}
    <section id="outcomes" className="py-16 md:py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Title — Exact match to screenshot */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Real Outcomes. Measurable Impact.
          </h2>
        </div>

        {/* Enterprise Logos Row — Used by teams managing portfolios at */}
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

        {/* 5 KPI Stat Metrics — Exact Match to User Screenshot */}
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
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#7C3AED] tracking-tight">1,000+</div>
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

      {/* SECTION 08: PRICING PLANS */}
      <section id="pricing" className="py-16 md:py-24 bg-[#F8FAFC] border-t border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              TRANSPARENT PLANS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Transparent Pricing for Every Scale
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-2 md:mt-3">
              Choose the right plan to manage and secure your operations.
            </p>

            {/* View Mode Switcher: Cards vs Matrix */}
            <div className="mt-6 inline-flex items-center p-1 rounded-full bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setPricingView("tiers")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  pricingView === "tiers"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Plan Overview
              </button>
              <button
                type="button"
                onClick={() => setPricingView("matrix")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  pricingView === "matrix"
                    ? "bg-white text-[#0F8B7D] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Module &amp; Capability Matrix
              </button>
            </div>
          </div>

          {pricingView === "tiers" ? (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
                {/* Plan 1: Starter */}
                <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Starter</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">For single-site offices up to 10k sqft.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">Free</div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Access to Marketplace</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Basic Helpdesk</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Up to 3 Users</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full py-3.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </div>

                {/* Plan 2: Professional */}
                <div className="rounded-3xl p-6 sm:p-8 border-2 border-[#0F8B7D] bg-white flex flex-col justify-between relative shadow-xl scale-100 lg:scale-105">
                  <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#0F8B7D] text-white text-[9px] font-black uppercase tracking-widest shadow-md">MOST POPULAR</span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Professional</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">For growing multi-site portfolios.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">₹4,999<span className="text-xs font-semibold text-slate-400">/mo</span></div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Escrow Payments</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> PPM Calendar</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Compliance Tracker</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Unlimited Users</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 mt-8">
                    <button 
                      onClick={() => router.push('/demo?plan=professional')}
                      className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => router.push('/demo')}
                      className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Book a Demo
                    </button>
                  </div>
                </div>

                {/* Plan 3: Enterprise */}
                <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Enterprise</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-semibold">Custom deployment for large institutions.</p>
                    <div className="text-3xl font-black text-slate-900 mt-6">Custom</div>
                    
                    <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> White-labeling</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> ERP Integrations</li>
                      <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#0F8B7D] shrink-0" /> Dedicated Success Mgr</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => openEnquiry({ modules: ['not-sure'] })}
                    className="w-full py-3.5 rounded-xl bg-[#071324] hover:bg-slate-800 text-white font-bold text-xs mt-8 transition-colors cursor-pointer shadow-sm"
                  >
                    Talk to Sales
                  </button>
                </div>
              </div>

              {/* Integrated hook to switch to Capability Matrix view */}
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setPricingView("matrix")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:text-[#0F8B7D] hover:border-teal-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Compare detailed module access across Starter, Professional &amp; Enterprise</span>
                  <ArrowRight size={14} className="text-[#0F8B7D]" />
                </button>
              </div>
            </div>
          ) : (
            /* Module Access Matrix (Integrated View) */
            <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Detailed Plan Capability &amp; Module Access
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare features and modules included across Starter, Professional, and Enterprise.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPricingView("tiers")}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Back to Plan Cards
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        Feature / Module
                      </th>
                      <th className="pb-4 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">Starter</div>
                        <div className="text-slate-500 font-semibold text-xs mt-0.5">Free</div>
                      </th>
                      <th className="pb-4 text-center bg-teal-50/70 rounded-t-xl px-3">
                        <div className="font-extrabold text-[#0F8B7D] text-sm">Professional</div>
                        <div className="text-teal-700 font-semibold text-xs mt-0.5">₹4,999/mo</div>
                      </th>
                      <th className="pb-4 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">Enterprise</div>
                        <div className="text-slate-500 font-semibold text-xs mt-0.5">Custom</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Marketplace: Space &amp; Vendor Discovery</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Marketplace: RFQ &amp; Escrow Milestone Payouts</td>
                      <td className="py-3.5 text-center text-slate-400">2 RFQs/mo</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Unlimited</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Unlimited + Volume Rates</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Operate: CAFM &amp; 52-Week PPM Automation</td>
                      <td className="py-3.5 text-center text-slate-400">Basic</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Full Suite</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Full + IoT &amp; BMS Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Manage: Automated Rent Roll &amp; CAM Billing</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓ (Razorpay)</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓ + Multi-Entity SPVs</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Manage: 90/60/30 Compliance Radar</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">✓ (40+ Statutory NOCs)</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">✓ + On-Ground Liaison</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Intelligence: Portfolio NOI &amp; ESG Reports</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black bg-teal-50/40">Standard MIS</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">SEBI BRSR + Custom Data Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Managed Services: On-Ground Technical Teams</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-slate-400 bg-teal-50/40">Available as Add-on</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Full Turnkey Deployment</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900">Enterprise SLA &amp; Dedicated Account Manager</td>
                      <td className="py-3.5 text-center text-slate-300">—</td>
                      <td className="py-3.5 text-center text-slate-400 bg-teal-50/40">Standard Support</td>
                      <td className="py-3.5 text-center text-emerald-600 font-black">Contractually Backed 99.9%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td className="pt-5 font-bold text-slate-400">Action</td>
                      <td className="pt-5 text-center">
                        <button
                          type="button"
                          onClick={() => router.push("/signup")}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Sign Up Free
                        </button>
                      </td>
                      <td className="pt-5 text-center bg-teal-50/40 rounded-b-xl px-3">
                        <button
                          type="button"
                          onClick={() => router.push("/demo?plan=professional")}
                          className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                        >
                          Get Started
                        </button>
                      </td>
                      <td className="pt-5 text-center">
                        <button
                          type="button"
                          onClick={() => openEnquiry({ modules: ["not-sure"] })}
                          className="px-4 py-2 rounded-xl bg-[#071324] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Talk to Sales
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 09: FAQ ACCORDION */}
      <section id="faq" className="py-16 md:py-24 bg-white px-4 md:px-6 w-full max-w-full overflow-hidden border-b border-slate-200">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-2 md:mt-3">
              Find clear answers about vendor operations, billing security, and integrations.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 md:gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#F8FAFC] rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors">
                <button 
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-100/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${activeFAQ === idx ? "transform rotate-180 text-[#0F8B7D]" : ""}`} />
                </button>
                {activeFAQ === idx && (
                  <div className="px-5 md:px-6 pb-4 md:pb-5 text-xs text-slate-600 border-t border-slate-200/70 pt-3 md:pt-4 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F8B7D] hover:underline"
            >
              <span>See all FAQs &amp; Knowledge Base</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: TALK TO US — INLINE ENQUIRY */}
      <section id="enquiry" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              COMMERCIAL ENQUIRY
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Talk to Us — We Respond Within 24 Business Hours.
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-2">
              Connect directly with our solutions engineering desk for custom portfolio onboarding.
            </p>
          </div>

          <EnquiryForm variant="inline" />

          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
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


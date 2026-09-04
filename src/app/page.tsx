"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
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
  Key
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(4); // Default to escrow payment step

  // OFFICEX Core Diagram Nodes — Spacious, non-overlapping coordinates matching Option 1 Wireframe
  const coreNodes = [
    // Top arc
    { id: "users", name: "Users", x: 26, y: 12 },
    { id: "properties", name: "Properties", x: 42, y: 6 },
    { id: "spaces", name: "Spaces", x: 58, y: 6 },
    { id: "tenants", name: "Tenants", x: 74, y: 12 },
    
    // Right column
    { id: "assets", name: "Assets", x: 88, y: 28 },
    { id: "vendors", name: "Vendors", x: 90, y: 50 },
    { id: "contracts", name: "Contracts", x: 88, y: 72 },
    
    // Bottom arc
    { id: "documents", name: "Documents", x: 74, y: 88 },
    { id: "tasks", name: "Tasks", x: 50, y: 94 },
    { id: "workflow", name: "Workflow", x: 26, y: 88 },
    
    // Left column (generous distance from APIs & Integrations at x:6)
    { id: "notifications", name: "Notifications", x: 18, y: 72 },
    { id: "audit", name: "Audit", x: 30, y: 50 },
    { id: "reporting", name: "Reporting", x: 18, y: 28 },
  ];

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
  const [activeStakeholder, setActiveStakeholder] = useState<"owner" | "occupier" | "fm" | "vendor" | "investor">("owner");

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
    if (activeSearchTab === "space") {
      router.push(
        `/public/search?city=${encodeURIComponent(spaceCity)}&area=${encodeURIComponent(spaceArea)}&budget=${encodeURIComponent(spaceBudget)}&grade=${encodeURIComponent(spaceGrade)}`
      );
    } else if (activeSearchTab === "vendor") {
      router.push(
        `/marketplace?category=${encodeURIComponent(vendorCategory)}&city=${encodeURIComponent(vendorCity)}&budget=${encodeURIComponent(vendorBudget)}&type=${encodeURIComponent(vendorType)}`
      );
    } else {
      router.push('/login');
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
      
      {/* SECTION 1: FLOATING GLASS NAVBAR */}
      <header className="fixed top-3 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[90%] max-w-7xl z-50 bg-white/95 backdrop-blur-md border border-[#DFE4E1] rounded-2xl md:rounded-full px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 md:gap-3">
          <Image 
            src="/logo-removebg-preview.png" 
            alt="OfficeX Logo" 
            width={30} 
            height={30} 
            className="object-contain"
          />
          <Image 
            src="/name-removebg-preview.png" 
            alt="OfficeX" 
            width={95} 
            height={20} 
            className="object-contain"
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button onClick={() => scrollToSection("features")} className="hover:text-[#0F8B7D] transition-colors font-semibold">Solutions</button>
          <button onClick={() => router.push("/marketplace")} className="hover:text-[#0F8B7D] transition-colors font-semibold">Marketplace</button>
          <button onClick={() => scrollToSection("pricing")} className="hover:text-[#0F8B7D] transition-colors font-semibold">Pricing</button>
          <button onClick={() => scrollToSection("faq")} className="hover:text-[#0F8B7D] transition-colors font-semibold">About</button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-[#0F8B7D] transition-colors">Sign In</a>
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] shadow-[0_4px_14px_rgba(15,139,125,0.3)] transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-1 text-slate-600 hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-5 md:hidden">
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("features"); }} className="text-left text-base font-bold hover:text-[#0F8B7D]">Solutions</button>
          <button onClick={() => { setMobileMenuOpen(false); router.push("/marketplace"); }} className="text-left text-base font-bold hover:text-[#0F8B7D]">Marketplace</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("pricing"); }} className="text-left text-base font-bold hover:text-[#0F8B7D]">Pricing</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection("faq"); }} className="text-left text-base font-bold hover:text-[#0F8B7D]">About</button>
          <hr className="border-[#DFE4E1]" />
          <a href="/login" className="text-base font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>Sign In</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-full bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer text-sm"
          >
            Get Started
          </button>
        </div>
      )}

      {/* SECTION 2: HERO & SHIFTING GRADIENT SEARCH */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-20 px-4 md:px-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[720px] w-full max-w-full bg-slate-950">
        {/* Background Platform Banner Image — Real prestigious commercial glass campus with digital platform twin */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/officex_hero_platform_tower.jpg"
            alt="OfficeX Commercial Workspace Operating System Platform"
            fill
            priority
            unoptimized
            className="object-cover object-right md:object-[75%_center] opacity-90"
          />
          {/* Subtle multi-stop gradient — preserves the illuminated glass tower on the right while providing pure dark negative space on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/75 pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          {/* Eyebrow Badge matching User's Exact Content — Sleek dark pill */}
          <div className="mb-3 md:mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-300 tracking-wide">
              Trusted by 450+ Commercial Teams
            </span>
          </div>

          {/* Headline matching User's Exact Content — Crisp, authoritative enterprise typography */}
          <div className="relative flex items-center justify-center text-center">
            <h1 className="max-w-4xl text-center text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-[1.15] px-2 drop-shadow-md">
              The OS for{" "}
              <span className="text-teal-400 bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent whitespace-nowrap">
                Commercial Workspaces
              </span>
            </h1>
          </div>
        
          {/* Subtitle matching User's Exact Content — Clean slate text with generous readability */}
          <p className="text-center max-w-2xl text-slate-300 mt-3 md:mt-4 text-xs sm:text-sm md:text-base font-normal leading-relaxed px-4 drop-shadow-sm">
            Streamline leasing, vendor procurement, and facility operations in one unified platform designed for modern institutional real estate.
          </p>

          {/* 4 Feature Badge Pills matching User's Exact Content — Clean, balanced glass tags */}
          <div className="mt-5 md:mt-6 flex flex-wrap items-center justify-center gap-2.5 max-w-4xl px-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-md text-xs font-semibold text-slate-200 hover:border-teal-500/50 transition-colors">
              <Building size={13} className="text-teal-400 shrink-0" />
              <span>Commercial Leasing &amp; Floor Demising</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-md text-xs font-semibold text-slate-200 hover:border-teal-500/50 transition-colors">
              <Wrench size={13} className="text-teal-400 shrink-0" />
              <span>1,284+ Digital Asset Passports &amp; PPM</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-md text-xs font-semibold text-slate-200 hover:border-teal-500/50 transition-colors">
              <ShieldCheck size={13} className="text-teal-400 shrink-0" />
              <span>450+ Verified Vendors &amp; Escrow Payouts</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-md text-xs font-semibold text-slate-200 hover:border-teal-500/50 transition-colors">
              <TrendingUp size={13} className="text-teal-400 shrink-0" />
              <span>94% Statutory Compliance &amp; Rent Roll</span>
            </div>
          </div>

        {/* Option-3 Dual-Entry Proposition Search Card — Sleek, streamlined command bar */}
        <div className="w-full max-w-4xl mt-7 md:mt-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/30 overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/70">
            <button 
              onClick={() => setActiveSearchTab("space")}
              className={`flex-1 py-3 px-3 text-[10px] sm:text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeSearchTab === "space" 
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Building size={13} />
              <span>Find Space</span>
            </button>
            <button 
              onClick={() => setActiveSearchTab("vendor")}
              className={`flex-1 py-3 px-3 text-[10px] sm:text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeSearchTab === "vendor" 
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Wrench size={13} />
              <span>Hire Vendor</span>
            </button>
          </div>

          <div className="p-4 md:p-5">
            {activeSearchTab === "space" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><MapPin size={15} /></span>
                    <select 
                      value={spaceCity}
                      onChange={(e) => setSpaceCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <optgroup label="⭐ Tech & Commercial Hubs">
                        <option value="Gujarat">Gujarat (Ahmedabad / GIFT City)</option>
                        <option value="Mumbai">Mumbai (BKC / Lower Parel)</option>
                        <option value="Bengaluru">Bengaluru (ORR / Whitefield)</option>
                        <option value="Delhi NCR">Delhi NCR (Cyber City / Noida)</option>
                        <option value="Hyderabad">Hyderabad (HITEC City)</option>
                        <option value="Pune">Pune (Hinjewadi / Kharadi)</option>
                        <option value="Chennai">Chennai (OMR / Guindy)</option>
                        <option value="Kolkata">Kolkata (Salt Lake / New Town)</option>
                      </optgroup>
                      <optgroup label="🏢 High-Growth Cities">
                        <option value="Ahmedabad">Ahmedabad (SG Highway)</option>
                        <option value="Gandhinagar">Gandhinagar &amp; GIFT City</option>
                        <option value="Surat">Surat (Diamond Bourse)</option>
                        <option value="Vadodara">Vadodara (Alkapuri)</option>
                        <option value="Jaipur">Jaipur (Malviya Nagar)</option>
                        <option value="Indore">Indore (Vijay Nagar)</option>
                        <option value="Kochi">Kochi (Infopark Kakkanad)</option>
                        <option value="Chandigarh">Chandigarh &amp; Mohali</option>
                        <option value="Lucknow">Lucknow (Gomti Nagar)</option>
                        <option value="Bhubaneswar">Bhubaneswar (Infocity)</option>
                        <option value="Goa">Goa (Panaji &amp; Verna)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><MapPin size={15} /></span>
                    <input 
                      type="text" 
                      value={spaceArea}
                      onChange={(e) => setSpaceArea(e.target.value)}
                      placeholder="Area / Micromarket"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-semibold"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><DollarSign size={15} className="text-slate-400" /></span>
                    <select 
                      value={spaceBudget}
                      onChange={(e) => setSpaceBudget(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="All Ranges">Budget Range (All)</option>
                      <option value="Below ₹1L">Below ₹1 Lakh/mo</option>
                      <option value="₹1L - ₹5L">₹1L - ₹5 Lakh/mo</option>
                      <option value="₹5L - ₹15L">₹5L - ₹15 Lakh/mo</option>
                      <option value="Above ₹15L">Above ₹15 Lakh/mo</option>
                    </select>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><Building size={15} /></span>
                    <select 
                      value={spaceGrade}
                      onChange={(e) => setSpaceGrade(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="All Grades">Building Grade (All)</option>
                      <option value="Grade A">Grade A Premium</option>
                      <option value="Grade B">Grade B Standard</option>
                      <option value="Co-Working">Coworking Space</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> Escrow Protected</span>
                    <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> Verified Listings</span>
                    <span className="hidden md:flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> Instant Demising</span>
                  </div>
                  <button 
                    onClick={handleLandingSearch}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={14} />
                    <span>Search Commercial Spaces</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><SlidersHorizontal size={15} /></span>
                    <select 
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="HVAC Maintenance">HVAC Maintenance</option>
                      <option value="Deep Cleaning">Deep Cleaning</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Electrical Auditing">Electrical Auditing</option>
                      <option value="Statutory NOC Support">Statutory NOC Support</option>
                    </select>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><MapPin size={15} /></span>
                    <select 
                      value={vendorCity}
                      onChange={(e) => setVendorCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Pune">Pune</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                    </select>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><DollarSign size={15} /></span>
                    <select 
                      value={vendorBudget}
                      onChange={(e) => setVendorBudget(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="All Budgets">Budget Estimate (All)</option>
                      <option value="Under ₹50k">Under ₹50,000</option>
                      <option value="₹50k - ₹2L">₹50k - ₹2 Lakhs</option>
                      <option value="₹2L - ₹10L">₹2L - ₹10 Lakhs</option>
                      <option value="Above ₹10L">Above ₹10 Lakhs</option>
                    </select>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><Building size={15} /></span>
                    <select 
                      value={vendorType}
                      onChange={(e) => setVendorType(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                    >
                      <option value="Commercial Office">Commercial Office</option>
                      <option value="IT Park Campus">IT Park Campus</option>
                      <option value="Retail Mall">Retail Mall</option>
                      <option value="Industrial Warehouse">Industrial Warehouse</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> 450+ Verified Vendors</span>
                    <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> Milestone Escrow</span>
                    <span className="hidden md:flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> SLA Guarantee</span>
                  </div>
                  <button 
                    onClick={handleLandingSearch}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={14} />
                    <span>Search Verified Vendors</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ultra-Sleek Partner Logo Scrolling Marquee with Edge Fade */}
        <div className="w-full mt-12 md:mt-14 py-3 md:py-3.5 bg-white/30 backdrop-blur-md border-y border-white/40 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center gap-8 md:gap-12 text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">
            <span className="whitespace-nowrap">TCS</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">WIPRO</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">INFOSYS</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">DLF COMMERCIAL</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">EMBASSY REIT</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">GODREJ PROPERTIES</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">PRESTIGE GROUP</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">L&amp;T REALTY</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">BROOKFIELD</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">BLACKSTONE</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">K RAHEJA CORP</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">HCL TECH</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">COGNIZANT</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">ACCENTURE</span>
            <span className="text-slate-500 opacity-60">•</span>
            {/* Seamless Repeat Track */}
            <span className="whitespace-nowrap">TCS</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">WIPRO</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">INFOSYS</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">DLF COMMERCIAL</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">EMBASSY REIT</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">GODREJ PROPERTIES</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">PRESTIGE GROUP</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">L&amp;T REALTY</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">BROOKFIELD</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">BLACKSTONE</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">K RAHEJA CORP</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">HCL TECH</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">COGNIZANT</span>
            <span className="text-slate-500 opacity-60">•</span>
            <span className="whitespace-nowrap">ACCENTURE</span>
          </div>
        </div>

        {/* Simulated Stats count-up row */}
        <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16 text-center border-t border-slate-300/50 pt-8 md:pt-10">
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">{animateCount.sqft}M+</div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">Sqft Managed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">{animateCount.vendors}+</div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">Verified Vendors</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">₹{animateCount.gtv}Cr+</div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">GTV Processed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">{animateCount.uptime}%</div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">System Uptime</div>
          </div>
        </div>
      </div>
    </section>

    {/* SECTION 02: ONE PLATFORM. EVERYTHING CONNECTED. — 6-Pillar Grid (Option 1 Wireframe Section 02) */}
    <section id="one-platform" className="py-16 md:py-24 bg-[#F8FAFB] border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0D7A6E] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            CONNECTED ECOSYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
            One Platform. Everything Connected.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 max-w-xl mx-auto">
            Connect every domain of your commercial real estate lifecycle into one cohesive operating environment.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {[
            { icon: Building, title: "Property", desc: "Manage assets, spaces & buildings", isComingSoon: false },
            { icon: DollarSign, title: "Commercial", desc: "Lease, rent roll, billing & collections", isComingSoon: false },
            { icon: Settings, title: "Operations", desc: "Facility, assets, vendors & tasks", isComingSoon: false },
            { icon: Users, title: "Workplace", desc: "Experience, bookings, visitors & services", isComingSoon: false },
            { icon: Shield, title: "Compliance", desc: "Risk, compliance, audits & safety", isComingSoon: false },
            { icon: Cpu, title: "Intelligence", desc: "Analytics, AI insights & predictions", isComingSoon: true },
          ].map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
              {pillar.isComingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider border border-amber-200">
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                <pillar.icon size={20} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">{pillar.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-9">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Powered by <span className="text-blue-600 font-black">OFFICEX CORE</span>
          </p>
        </div>
      </div>
    </section>

    {/* SECTION 03: OFFICEX CORE — Exact 100% Static Diagram matching Option 1 Master Wireframe */}
    <section id="officex-core" className="py-20 md:py-28 bg-white border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Text Content (5 cols) — Exact Option 1 Typography */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Eyebrow matching Option 1 */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Powered by{" "}
              </span>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                OFFICEX CORE
              </span>
            </div>

            {/* Headline — 3 separate clean non-wrapping lines in #0D0D0F matching Option 1 */}
            <h2 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#0D0D0F] tracking-tight leading-[1.16] uppercase">
              <span className="block whitespace-nowrap">ONE CORE.</span>
              <span className="block whitespace-nowrap">ONE DATA FOUNDATION.</span>
              <span className="block whitespace-nowrap">ONE SOURCE OF TRUTH.</span>
            </h2>
            
            <p className="mt-5 text-slate-600 text-sm md:text-base leading-relaxed font-medium max-w-lg">
              OFFICEX Core connects your entire property ecosystem on a single, secure and intelligent data foundation.
            </p>

            {/* Checklist with Option 1 Copy */}
            <div className="mt-7 space-y-3.5">
              {[
                "No more siloed systems",
                "No duplicate data",
                "No manual reconciliations",
                "Real-time visibility across the portfolio",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  </div>
                  <span className="text-slate-800 font-semibold text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-7 py-3.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE CORE</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Architectural Radial Diagram (7 cols) — Enhanced with Beautiful Orbital Data Animations */}
          <div className="lg:col-span-7 relative w-full max-w-[680px] aspect-[1.12] mx-auto flex items-center justify-center select-none p-2 sm:p-4">
            
            {/* SVG: Animated Concentric Rings + Flowing Data Beams + Traveling Data Packets */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <defs>
                {/* Data stream glow gradient */}
                <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
                </linearGradient>
                {/* Core halo gradient */}
                <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0F8B7D" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient radial halo behind the core */}
              <circle cx="50" cy="50" r="32" fill="url(#coreHalo)" />

              {/* Outer orbit ring — faint delicate dashed with slow graceful rotation */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke="#CBD5E1" 
                strokeWidth="0.6" 
                strokeDasharray="4 6" 
                className="animate-spin-slow origin-center"
              />

              {/* Inner orbit ring — faint delicate dashed with counter rotation */}
              <circle 
                cx="50" 
                cy="50" 
                r="25" 
                fill="none" 
                stroke="#CBD5E1" 
                strokeWidth="0.6" 
                strokeDasharray="3 5" 
                className="animate-spin-reverse-slow origin-center"
              />

              {/* Tiny glowing orbital guide satellites drifting along the outer orbit ring */}
              <g className="animate-spin-slow origin-center">
                <circle cx="50" cy="8" r="1" fill="#0F8B7D" opacity="0.9" />
                <circle cx="50" cy="92" r="1" fill="#06B6D4" opacity="0.8" />
                <circle cx="92" cy="50" r="0.9" fill="#0F8B7D" opacity="0.75" />
              </g>

              {/* Static uniform connector lines from center to each node */}
              {coreNodes.map((node) => (
                <g key={node.id}>
                  {/* Base blueprint track line */}
                  <line
                    x1="50"
                    y1="50"
                    x2={node.x}
                    y2={node.y}
                    stroke="#E2E8F0"
                    strokeWidth="0.6"
                    strokeDasharray="3 3"
                  />
                  {/* Streaming data beam overlay */}
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2="50"
                    y2="50"
                    stroke="#0F8B7D"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                    className="animate-data-beam"
                  />
                  {/* Glowing data packet gliding into the core */}
                  <circle r="0.9" fill="#0F8B7D" opacity="0.95">
                    <animateMotion
                      path={`M ${node.x} ${node.y} L 50 50`}
                      dur="3.2s"
                      repeatCount="indefinite"
                      begin={`${(node.x * 0.05 + node.y * 0.03) % 3}s`}
                    />
                  </circle>
                </g>
              ))}

              {/* Extension lines connecting APIs & Integrations (at x:6) across to Audit (at x:30) and Core */}
              <line x1="12" y1="50" x2="26" y2="50" stroke="#E2E8F0" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="34" y1="50" x2="42" y2="50" stroke="#E2E8F0" strokeWidth="0.6" strokeDasharray="3 3" />
              {/* Active data packet from APIs & Integrations into Audit */}
              <circle r="1" fill="#06B6D4" opacity="0.9">
                <animateMotion
                  path="M 12 50 L 26 50"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Center Core Node — Multi-layered breathing architectural hub */}
            <div className="relative z-20 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center">
              {/* Radar expanding ripple waves */}
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/35 animate-radar-ripple pointer-events-none" />
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/25 animate-radar-ripple-delayed pointer-events-none" />

              {/* Outer soft ambient glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0F8B7D]/18 via-cyan-500/12 to-teal-500/18 blur-xl animate-pulse" />
              
              {/* Outer decorative dashed orbit border with slow rotation */}
              <div className="absolute -inset-2 rounded-full border border-teal-500/30 border-dashed animate-spin-slow pointer-events-none" />
              
              {/* Inner core card with breathing shadow */}
              <div className="relative w-full h-full rounded-full bg-white border-2 border-[#0F8B7D] animate-core-breathe flex flex-col items-center justify-center p-2.5 text-center cursor-pointer transition-transform hover:scale-105 duration-300">
                {/* Live pulsing indicator beacon */}
                <div className="relative flex h-2.5 w-2.5 mb-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F8B7D]"></span>
                </div>
                <span className="text-[10px] md:text-[11px] font-black tracking-[0.25em] text-slate-400 uppercase">
                  OFFICEX
                </span>
                <span className="text-xl md:text-2xl font-black text-[#0D7A6E] tracking-wider leading-none mt-0.5">
                  CORE
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Single Platform
                </span>
              </div>
            </div>

            {/* Satellite Pill Nodes — 100% Uniform, Spacious with Buoyant Float and Interactive Hover */}
            {coreNodes.map((node, idx) => (
              <div
                key={node.id}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  animationDelay: `${(idx * 0.35)}s`,
                }}
                className="absolute z-30 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2 whitespace-nowrap animate-orbit-float cursor-pointer group hover:scale-105 hover:border-[#0F8B7D] hover:shadow-[0_4px_16px_rgba(15,139,125,0.18)] transition-all duration-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] group-hover:scale-125 transition-transform shrink-0" />
                <span className="tracking-tight group-hover:text-[#0D7A6E] transition-colors">{node.name}</span>
              </div>
            ))}

            {/* APIs & Integrations — left extension node (isolated at x:6%, 24% clear of Audit) */}
            <div 
              style={{ left: "6%", top: "50%", animationDelay: "1.2s" }}
              className="absolute z-30 hidden sm:flex flex-col items-center animate-orbit-float cursor-pointer group hover:scale-105 transition-transform duration-300"
            >
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:border-[#0F8B7D] group-hover:shadow-[0_6px_20px_rgba(15,139,125,0.18)] transition-all flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] relative">
                  <Database size={16} />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0D7A6E] text-center leading-tight whitespace-nowrap transition-colors">
                  APIs &amp;<br />Integrations
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    {/* SECTION 04: COMMAND CENTRE SHOWCASE (Section 04 from Option 1 Wireframe) */}
    <section id="command-centre" className="py-20 md:py-28 bg-[#F4F7F6] border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-6">
          <div>
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0D7A6E] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              PORTFOLIO INTELLIGENCE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
              YOUR PORTFOLIO. ONE COMMAND CENTRE.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 max-w-xl">
              Live multi-metro visibility across leasing velocity, rent collections, operational tasks, and compliance risk.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DFE4E1] text-xs font-bold text-slate-700 shadow-xs">
              <Building size={14} className="text-[#0F8B7D]" />
              <span>All Properties (24)</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DFE4E1] text-xs font-bold text-slate-700 shadow-xs">
              <Calendar size={14} className="text-blue-600" />
              <span>Last 30 Days</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <button 
              onClick={() => router.push('/ops')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Top 3 Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#DFE4E1] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Properties</span>
              <div className="text-3xl md:text-4xl font-black text-slate-900 mt-1">24</div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 4 Metros Covered
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0F8B7D]">
              <Building size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#DFE4E1] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Leasable Area</span>
              <div className="text-3xl md:text-4xl font-black text-slate-900 mt-1">8.4M <span className="text-base text-slate-500 font-bold">Sq.Ft.</span></div>
              <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Grade-A Institutional Stock
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#DFE4E1] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Average Occupancy</span>
              <div className="text-3xl md:text-4xl font-black text-slate-900 mt-1">91.6%</div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +2.4% vs last quarter
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* High-Fidelity Command Centre Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Revenue Overview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#DFE4E1] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">REVENUE OVERVIEW</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl md:text-3xl font-black text-slate-900">₹12.4 Cr</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    +112.5% vs last month
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">Monthly Run Rate</span>
            </div>

            {/* SVG Trend Wave Graphic */}
            <div className="h-36 w-full relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0F8B7D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,90 Q70,95 120,70 T240,65 T360,35 T500,15 L500,120 L0,120 Z"
                  fill="url(#revGrad)"
                />
                <path
                  d="M0,90 Q70,95 120,70 T240,65 T360,35 T500,15"
                  fill="none"
                  stroke="#0F8B7D"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="70" r="4" fill="#0F8B7D" stroke="#fff" strokeWidth="2" />
                <circle cx="240" cy="65" r="4" fill="#0F8B7D" stroke="#fff" strokeWidth="2" />
                <circle cx="360" cy="35" r="4" fill="#0F8B7D" stroke="#fff" strokeWidth="2" />
                <circle cx="500" cy="15" r="5" fill="#0F8B7D" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
            
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-3 pt-3 border-t border-slate-100">
              <span>May (₹5.8 Cr)</span>
              <span>Jun (₹7.2 Cr)</span>
              <span>Jul (₹9.4 Cr)</span>
              <span className="text-slate-900 font-extrabold">Aug (₹12.4 Cr)</span>
            </div>
          </div>

          {/* Collections Donut (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#DFE4E1] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">COLLECTIONS BREAKDOWN</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                87.1% Realized
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 my-auto py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="3.8"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0F8B7D"
                    strokeWidth="3.8"
                    strokeDasharray="87, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900">87%</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B7D]"></span>
                    <span>Collected</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 pl-4 mt-0.5">₹10.8 Cr</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Outstanding</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 pl-4 mt-0.5">₹1.6 Cr</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-3">
              Automated reminder notices active across all 30+ day aging accounts
            </div>
          </div>

          {/* Lease Expiry Risk (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#DFE4E1] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">LEASE EXPIRY (NEXT 90 DAYS)</span>
              <AlertTriangle size={15} className="text-amber-500" />
            </div>
            
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">7</span>
                <span className="text-xs font-bold text-slate-500">Leases Expiring</span>
              </div>
              <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3 flex items-center justify-between">
                <span>Revenue at Risk:</span>
                <span className="font-black text-sm">₹2.4 Cr</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/leasing/pipeline')}
              className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1.5 pt-2 border-t border-slate-100 cursor-pointer"
            >
              <span>Review Upcoming Renewals</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Open Tasks (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#DFE4E1] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">OPEN TASKS &amp; TICKETS</span>
              <Wrench size={15} className="text-blue-500" />
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">342</span>
                <span className="text-xs font-bold text-slate-500">Active Work Orders</span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>HVAC (142)</span>
                  <span className="text-emerald-600">98% SLA</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }} />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Electrical &amp; Fire (110)</span>
                  <span className="text-emerald-600">95% SLA</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "32%" }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
              <span>Overall SLA:</span>
              <span className="text-emerald-600 font-black">96% Achieved</span>
            </div>
          </div>

          {/* Compliance & Assets (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#DFE4E1] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">COMPLIANCE &amp; ASSETS</span>
              <ShieldCheck size={15} className="text-emerald-500" />
            </div>

            <div className="my-4 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-lg font-black text-slate-900">94%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Statutory Compliance</div>
                </div>
                <div className="text-right text-[11px] font-bold">
                  <span className="text-amber-600 block">8 Due Soon</span>
                  <span className="text-rose-600 block">2 Critical</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-lg font-black text-slate-900">1,284</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Registered Assets</div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  100% QR Tagged
                </span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/properties/compliance')}
              className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1.5 pt-2 border-t border-slate-100 cursor-pointer"
            >
              <span>View Compliance Matrix</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

        {/* Command Centre Footer Link */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push('/ops')}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-black text-[#0F8B7D] hover:text-[#0D7A6E] hover:gap-3 transition-all cursor-pointer"
          >
            <span>View Full Command Centre</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>

    {/* SECTION 05: PROPERTY LIFECYCLE (Section 05 from Option 1 Wireframe) */}
    <section id="lifecycle" className="py-20 md:py-28 bg-white border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            END-TO-END WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            FROM PROPERTY TO INTELLIGENCE. THE COMPLETE LIFECYCLE.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2.5 leading-relaxed">
            Eliminate operational silos. See how every stakeholder, process, and asset connects into a single continuous chain of value.
          </p>
        </div>

        {/* 8-Stage Interactive Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3 mb-10">
          {lifecycleSteps.map((step, idx) => {
            const isActive = activeLifecycleStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveLifecycleStep(idx)}
                className={`p-3 md:p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center mb-2 ${
                  isActive ? "bg-white text-slate-900" : "bg-white border border-slate-300 text-slate-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="font-black text-xs">{step.name}</div>
                {step.isComingSoon && (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Stage Dynamic Showcase Card */}
        {(() => {
          const cur = lifecycleSteps[activeLifecycleStep];
          return (
            <div className="rounded-3xl border border-[#DFE4E1] bg-slate-50/50 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    STAGE {activeLifecycleStep + 1}: {cur.badge}
                  </span>
                  {cur.isComingSoon && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      COMING SOON
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {cur.subtitle}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-3 leading-relaxed max-w-xl">
                  {cur.desc}
                </p>

                {/* Capabilities list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {cur.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                      <CheckCircle size={14} className="text-[#0F8B7D] shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Widget Preview */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Key Target Outcome</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active Benchmark
                  </span>
                </div>

                <div className="my-6 text-center">
                  <div className="text-3xl md:text-4xl font-black text-slate-900">{cur.metric}</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Real-time portfolio benchmark across all enrolled properties</p>
                </div>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE LIFECYCLE</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </section>

    {/* SECTION 06: COMMERCIAL INTELLIGENCE (Section 06 from Option 1 Wireframe) */}
    <section id="commercial" className="py-20 md:py-28 bg-slate-950 text-white px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Text & Checklist (5 cols) */}
          <div className="lg:col-span-5">
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/30">
              COMMERCIAL EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mt-4 leading-tight">
              COMMERCIAL INTELLIGENCE THAT DRIVES PERFORMANCE.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-3 leading-relaxed">
              Control revenue, leases, billing, collections and upcoming commercial risk from a single institutional operating pane.
            </p>

            <div className="mt-8 space-y-3.5">
              {[
                "Rent Roll & Lease Management",
                "Billing, CAM & Utility Recoveries",
                "Collections, Aging & Automated Notices",
                "Escalations & Break-Option Tracking",
                "Portfolio Revenue Forecasting",
                "Asset-Level Property P&L",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-slate-200 font-bold text-xs sm:text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <button
                onClick={() => router.push('/leasing/pipeline')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE COMMERCIAL</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Live Rent Roll Overview Card (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider">RENT ROLL OVERVIEW</span>
                <div className="text-sm font-bold text-slate-300 mt-0.5">Active Portfolio Cashflow Summary</div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                Live Data
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Total Rent</span>
                <div className="text-lg font-black text-white mt-1">₹12.4 Cr</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Outstanding</span>
                <div className="text-lg font-black text-amber-400 mt-1">₹1.6 Cr</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Active Leases</span>
                <div className="text-lg font-black text-white mt-1">134</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Occupancy</span>
                <div className="text-lg font-black text-emerald-400 mt-1">91.6%</div>
              </div>
            </div>

            {/* Realistic Rent Roll Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-extrabold">Property</th>
                    <th className="pb-3 font-extrabold">Occupancy</th>
                    <th className="pb-3 font-extrabold">Total Rent</th>
                    <th className="pb-3 font-extrabold">Collected</th>
                    <th className="pb-3 font-extrabold">Outstanding</th>
                    <th className="pb-3 font-extrabold text-right">Expiring</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-white">Business Park A</td>
                    <td className="py-3 font-semibold text-emerald-400">95%</td>
                    <td className="py-3 font-bold">₹4.2 Cr</td>
                    <td className="py-3 text-slate-300">₹4.0 Cr</td>
                    <td className="py-3 text-amber-400 font-bold">₹0.2 Cr</td>
                    <td className="py-3 text-right font-black text-amber-400">2</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-white">IT Park West</td>
                    <td className="py-3 font-semibold text-emerald-400">92%</td>
                    <td className="py-3 font-bold">₹3.1 Cr</td>
                    <td className="py-3 text-slate-300">₹2.8 Cr</td>
                    <td className="py-3 text-amber-400 font-bold">₹0.3 Cr</td>
                    <td className="py-3 text-right font-black text-amber-400">1</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-white">Tech Square</td>
                    <td className="py-3 font-semibold text-emerald-400">90%</td>
                    <td className="py-3 font-bold">₹2.7 Cr</td>
                    <td className="py-3 text-slate-300">₹2.4 Cr</td>
                    <td className="py-3 text-amber-400 font-bold">₹0.3 Cr</td>
                    <td className="py-3 text-right font-black text-amber-400">3</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-white">Downtown Towers</td>
                    <td className="py-3 font-semibold text-emerald-400">88%</td>
                    <td className="py-3 font-bold">₹1.4 Cr</td>
                    <td className="py-3 text-slate-300">₹1.0 Cr</td>
                    <td className="py-3 text-amber-400 font-bold">₹0.4 Cr</td>
                    <td className="py-3 text-right font-black text-amber-400">1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">All financial values audited &amp; synced with ERP</span>
              <button 
                onClick={() => router.push('/leasing/pipeline')}
                className="text-emerald-400 hover:text-emerald-300 font-black flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Commercial Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* SECTION 07: BUILT FOR EVERY STAKEHOLDER (Option 2/3 Section 9) */}
    <section id="stakeholders" className="py-20 md:py-28 bg-[#F8FAFB] border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0D7A6E] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            AUDIENCE &amp; USE CASES
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            ONE PLATFORM. EVERY STAKEHOLDER.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
            Tailored tools, permissions, and dashboards engineered for everyone who owns, operates, or occupies workspace.
          </p>
        </div>

        {/* Stakeholder Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {[
            { id: "owner", label: "Property Owner / CEO" },
            { id: "occupier", label: "Corporate Occupier" },
            { id: "fm", label: "Facility Manager" },
            { id: "vendor", label: "Vendor / Partner" },
            { id: "investor", label: "Investor / REIT" },
          ].map((tab) => {
            const isSelected = activeStakeholder === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStakeholder(tab.id as any)}
                className={`px-4 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0F8B7D] text-white shadow-md scale-102"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Stakeholder Card */}
        {(() => {
          const data = stakeholderData[activeStakeholder];
          return (
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#DFE4E1] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0D7A6E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {data.badge}
                </span>
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

              <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div className="border-b border-slate-800 pb-3 mb-6">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Target Performance Metrics</span>
                  <div className="text-sm font-black text-white mt-1">{data.role} Dashboard</div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                  {data.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <div className="text-base sm:text-lg font-black text-emerald-400">{m.val}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Schedule Tailored Walkthrough</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          );
        })()}

      </div>
    </section>

    {/* SECTION 08: REAL OUTCOMES & BEFORE VS AFTER (Option 2 Section 13) */}
    <section className="py-20 md:py-28 bg-white border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0D7A6E] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            BUSINESS VALUE &amp; ROI
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Real Outcomes. Measurable Impact.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-2.5">
            Shift from disconnected spreadsheets and delayed reporting to high-velocity operating confidence.
          </p>
        </div>

        {/* 5 Big Impact Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-14">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">10M+</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Sq.Ft. on Platform</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">500+</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Verified FM Vendors</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">1,000+</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Buildings Managed</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-black text-[#0F8B7D]">30%</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Lower Operating Cost</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">95%</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Client Retention</div>
          </div>
        </div>

        {/* Before vs After Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BEFORE OFFICEX Card */}
          <div className="p-7 md:p-9 rounded-3xl bg-rose-50/40 border border-rose-200 flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                BEFORE OFFICEX
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-4 mb-2">
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
            
            <div className="mt-8 pt-4 border-t border-rose-200/80 text-[11px] font-extrabold text-rose-700">
              Result: Revenue leakage, compliance fines, and tenant friction
            </div>
          </div>

          {/* AFTER OFFICEX Card */}
          <div className="p-7 md:p-9 rounded-3xl bg-emerald-50/40 border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                AFTER OFFICEX
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-4 mb-2">
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
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-emerald-200/80 text-[11px] font-extrabold text-emerald-700">
              Result: 30% lower operating overhead and institutional governance
            </div>
          </div>

        </div>

      </div>
    </section>

      {/* SECTION 3: EVERYTHING YOU NEED, ONE PLATFORM (Bento Grid) */}
      <section id="features" className="py-16 md:py-20 bg-[#F6FAF9] border-t border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Everything You Need. One Platform.</h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm mt-2 md:mt-3">Unify lease operations, compliance, work order procurement, and maintenance calendars in one dashboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: FM Marketplace, Operations Calendar, Cost Analytics (col-span-2) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Card A: FM Marketplace */}
              <div 
                onClick={() => router.push('/public/wizard')}
                className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 rounded-full bg-emerald-50/30 group-hover:scale-110 transition-transform"></div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
                    FM Marketplace
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
                  </h3>
                  <p className="text-slate-500 mt-2 font-medium text-xs max-w-xl">
                    Discover, compare, and onboard pre-verified facility management vendors across 40+ categories.
                  </p>
                  
                  {/* Task list simulation */}
                  <div className="mt-6 flex flex-col gap-3 max-w-lg">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE4E1] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">HVAC Maintenance (Quarterly)</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">Awarded</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE4E1] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span></span>
                        <span className="text-xs font-semibold text-slate-800">Pest Control Services</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">Pending bids</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE4E1] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0"></span>
                        <span className="text-xs font-semibold text-slate-800">Deep Cleaning (Annual)</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">Draft</span>
                    </div>
                  </div>
                </div>
                
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#0F8B7D] mt-8 hover:gap-3 transition-all">
                  Explore Vendors <ArrowRight size={14} />
                </span>
              </div>

              {/* Card B: Operations Calendar */}
              <div 
                onClick={() => router.push('/ops')}
                className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between relative overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
                    Operations Calendar
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
                  </h3>
                  <p className="text-slate-500 mt-2 font-medium text-xs max-w-xl">
                    Centralized view of all Planned Preventive Maintenance (PPM) activities across your portfolio.
                  </p>

                  {/* Calendar schedule grid simulation */}
                  <div className="mt-6 border border-[#DFE4E1] rounded-xl overflow-hidden max-w-lg bg-slate-50/20">
                    <div className="grid grid-cols-5 text-center bg-slate-50/80 border-b border-[#DFE4E1] py-2 text-[10px] font-extrabold text-slate-400 tracking-wider">
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                    </div>
                    <div className="grid grid-cols-5 h-20 p-1.5 gap-1.5">
                      <div className="rounded border border-dashed border-slate-200"></div>
                      <div className="rounded border border-emerald-200 bg-emerald-50/40 p-1 flex flex-col items-center justify-center relative group hover:bg-emerald-50 transition-colors">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="absolute -top-8 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow">HVAC Check</span>
                      </div>
                      <div className="rounded border border-rose-200 bg-rose-50/40 p-1 flex flex-col items-center justify-center relative group hover:bg-rose-50 transition-colors">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="absolute -top-8 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow text-center">Fire Drill</span>
                      </div>
                      <div className="rounded border border-dashed border-slate-200"></div>
                      <div className="rounded border border-blue-200 bg-blue-50/40 p-1 flex flex-col items-center justify-center relative group hover:bg-blue-50 transition-colors">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="absolute -top-8 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow">Pest Audit</span>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#0F8B7D] mt-8 hover:gap-3 transition-all">
                  View Schedule <ChevronRight size={14} />
                </span>
              </div>

              {/* Card C: Cost Analytics */}
              <div 
                onClick={() => router.push('/reporting/financials')}
                className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group hover:shadow-md transition-shadow"
              >
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between max-w-xs md:max-w-full">
                    Cost Analytics
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors md:hidden" />
                  </h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">₹4.2L</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                      ↓12% <span className="font-medium text-[10px]">vs last month</span>
                    </span>
                  </div>
                  <p className="text-slate-400 mt-2 font-medium text-[11px] leading-relaxed max-w-sm">
                    Automated cost auditing maps vendor service contracts against work orders to prevent billing inflation.
                  </p>
                </div>
                
                {/* SVG trend wave graphic */}
                <div className="w-full md:w-64 h-24 relative bg-slate-50/50 border border-[#DFE4E1] rounded-xl p-2 flex items-center overflow-hidden">
                  <svg className="w-full h-full text-[#0F8B7D]" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0F8B7D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 0 45 C 30 50, 45 25, 75 35 C 105 45, 125 15, 155 25 C 185 35, 190 10, 200 15 L 200 60 L 0 60 Z" 
                      fill="url(#gradient-wave)" 
                    />
                    <path 
                      d="M 0 45 C 30 50, 45 25, 75 35 C 105 45, 125 15, 155 25 C 185 35, 190 10, 200 15" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    <circle cx="155" cy="25" r="4" fill="#0F8B7D" className="animate-ping" />
                    <circle cx="155" cy="25" r="3" fill="#0F8B7D" />
                  </svg>
                </div>

                <span className="hidden md:flex absolute bottom-4 right-4 items-center gap-1.5 text-xs font-bold text-[#0F8B7D] opacity-0 group-hover:opacity-100 transition-opacity">
                  View Financials <ChevronRight size={14} />
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: Leasing CRM, Compliance Tracking, AI Automation */}
            <div className="flex flex-col gap-8">
              
              {/* Card D: Leasing CRM */}
              <div 
                onClick={() => router.push('/leasing/pipeline')}
                className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between h-[250px] relative overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                    Leasing CRM
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
                  </h3>
                  <p className="text-slate-500 mt-1 font-medium text-xs">
                    Track inbound leads & site visits.
                  </p>
                  
                  {/* Lead logs */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-[#DFE4E1] flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">TechCorp Inc.</span>
                      <span className="flex items-center gap-1.5 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Proposal</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-[#DFE4E1] flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">FinServe LLC</span>
                      <span className="flex items-center gap-1.5 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Site Visit</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#0F8B7D] inline-flex items-center gap-1 hover:gap-2 transition-all">
                  View Leads <ArrowRight size={13} />
                </span>
              </div>

              {/* Card E: Compliance Tracking */}
              <div 
                onClick={() => router.push('/properties/compliance')}
                className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between h-[250px] relative overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                    Compliance Tracking
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
                  </h3>
                  <p className="text-slate-500 mt-1 font-medium text-xs">
                    Automated NOC & license renewals.
                  </p>
                  
                  {/* Compliance bars */}
                  <div className="mt-5 flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>Fire Safety NOC</span>
                        <span className="text-rose-600 font-extrabold">Exp. 14 Days</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>Lift Certification</span>
                        <span className="text-emerald-600 font-extrabold">Valid</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-[#0F8B7D] font-bold group-hover:underline">Manage Compliance ›</span>
              </div>

              {/* Card F: AI Automation */}
              <div 
                onClick={() => router.push('/reporting/ai')}
                className="rounded-3xl p-6 md:p-8 bg-slate-900 text-white shadow-xs flex flex-col justify-between h-[220px] relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
              >
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 rounded-full bg-emerald-500/10 group-hover:scale-110 transition-transform"></div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black tracking-widest uppercase">COMING SOON</span>
                    <Cpu size={18} className="text-emerald-400 animate-pulse" />
                  </div>
                  
                  <h3 className="text-base font-extrabold text-white mt-4 flex items-center justify-between">
                    AI Automation
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </h3>
                  <p className="text-slate-400 mt-2 font-medium text-xs leading-relaxed">
                    Smart contract extraction & anomaly detection.
                  </p>
                </div>

                <span className="text-[10px] text-emerald-400 font-bold group-hover:underline">Configure AI ›</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: PIPELINE & PAYMENTS WORKFLOW */}
      <section id="workflow" className="py-16 md:py-20 bg-[#F0F3F8] px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            
            {/* Timeline info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                From Procurement to Payment — Secure & Verified
              </h2>
              <p className="text-slate-500 mt-3 md:mt-4 max-w-md font-medium text-xs md:text-sm leading-relaxed">
                An end-to-end transparent workflow designed to protect both facility managers and vendors.
              </p>

              {/* Interactive Timeline list */}
              <div className="mt-10 flex flex-col gap-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-4 top-4 bottom-4 border-l-2 border-slate-200/50 z-0"></div>

                {timelineSteps.map((step, idx) => {
                  const isActive = activeTimelineStep === idx;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActiveTimelineStep(idx)}
                      className="flex gap-4 relative z-10 cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        isActive 
                          ? "bg-[#0F8B7D] text-white ring-4 ring-emerald-50" 
                          : "bg-white border border-[#DFE4E1] text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="pt-0.5">
                        <h4 className={`font-extrabold text-sm transition-colors ${isActive ? "text-[#0F8B7D]" : "text-slate-900 group-hover:text-[#0F8B7D]"}`}>
                          {step.title}
                        </h4>
                        <p className={`text-xs mt-1 font-semibold transition-colors ${isActive ? "text-slate-600" : "text-slate-400 group-hover:text-slate-500"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic right-side card visualization based on selected timeline step */}
            <div className="rounded-3xl p-8 border border-[#DFE4E1] bg-white shadow-md relative overflow-hidden min-h-[360px] flex flex-col justify-between transition-all duration-300">
              
              {activeTimelineStep === 0 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-extrabold text-[#0F8B7D] text-sm flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider">
                    <ClipboardList size={18} />
                    1. Scope & Requirement Builder
                  </h3>
                  <div className="p-4 rounded-xl border border-[#DFE4E1] bg-slate-50/50 flex flex-col gap-3 text-xs">
                    <div className="flex justify-between border-b border-slate-150 pb-2">
                      <span className="font-bold text-slate-400">Service Category</span>
                      <span className="font-bold text-slate-800">HVAC Preventive Servicing</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-2">
                      <span className="font-bold text-slate-400">Response SLA</span>
                      <span className="font-bold text-rose-600 flex items-center gap-1"><Clock size={12} /> Critical (4 Hours)</span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="font-bold text-slate-400 block mb-1">Checklist Tasks</span>
                      <label className="flex items-center gap-2 font-bold text-slate-700">
                        <CheckSquare size={13} className="text-[#0F8B7D]" />
                        Filter cleaning & motor checking
                      </label>
                      <label className="flex items-center gap-2 font-bold text-slate-700">
                        <CheckSquare size={13} className="text-[#0F8B7D]" />
                        Refrigerant pressure logs validation
                      </label>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 rounded-full self-start">Drafting RFQ Complete</span>
                </div>
              )}

              {activeTimelineStep === 1 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-extrabold text-[#0F8B7D] text-sm flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider">
                    <Network size={18} />
                    2. Algorithmic Matching
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Our matching algorithm matches local verified contractors based on previous SLA history and cost index.</p>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-xl border border-[#DFE4E1] bg-emerald-50/20 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Award size={15} className="text-emerald-600" />
                        <span className="font-bold text-slate-800">QuickCool Facility Tech</span>
                      </div>
                      <span className="font-black text-emerald-700">98% Match</span>
                    </div>
                    <div className="p-3 rounded-xl border border-[#DFE4E1] bg-slate-50/50 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Building size={15} className="text-slate-400" />
                        <span className="font-bold text-slate-700">Apex CleanAir Solutions</span>
                      </div>
                      <span className="font-bold text-slate-500">92% Match</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100 rounded-full self-start">3 Vendors Notified</span>
                </div>
              )}

              {activeTimelineStep === 2 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-extrabold text-[#0F8B7D] text-sm flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider">
                    <SlidersHorizontal size={18} />
                    3. Normalized Bids Comparison
                  </h3>
                  <div className="border border-[#DFE4E1] rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-slate-50 py-2 px-3 font-extrabold text-slate-400 text-[10px] uppercase border-b border-slate-150">
                      <span>Vendor</span>
                      <span>Price Quote</span>
                      <span>SLA Compliance</span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5 px-3 font-bold text-slate-800 border-b border-slate-100 items-center">
                      <span>QuickCool</span>
                      <span className="text-[#0F8B7D]">₹12,500</span>
                      <span className="text-emerald-600">99.2%</span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5 px-3 font-bold text-slate-800 items-center">
                      <span>Apex CleanAir</span>
                      <span>₹11,800</span>
                      <span className="text-slate-500">94.8%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold italic block">Auto-highlighting recommended bids based on rating weightings.</span>
                </div>
              )}

              {activeTimelineStep === 3 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-extrabold text-[#0F8B7D] text-sm flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider">
                    <FileText size={18} />
                    4. Digitized SLA Agreement
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Contracts are generated from pre-approved regulatory templates. Terms are locked to trigger escrow.</p>
                  <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/20 text-xs flex flex-col gap-2 font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#0F8B7D]" />
                      SLA Target: 98.5% uptime commitment
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#0F8B7D]" />
                      Payment Term: Split Escrow release on completion
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 rounded-full self-start">Contracts OTP Signed</span>
                </div>
              )}

              {activeTimelineStep === 4 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
                    <ShieldCheck size={20} className="text-[#0F8B7D]" />
                    PAYMENT FLOW ARCHITECTURE
                  </h3>
                  
                  <div className="flex flex-col gap-4 relative">
                    
                    {/* Enterprise Client box */}
                    <div className="p-4 rounded-xl border border-[#DFE4E1] bg-white flex justify-between items-center text-xs font-bold shadow-xs hover:border-[#0F8B7D] transition-colors group">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-slate-400 group-hover:text-[#0F8B7D] transition-colors" />
                        <span className="text-slate-800">Enterprise Client</span>
                      </div>
                      <span className="text-slate-500">Initiates ₹100,000 Payment</span>
                    </div>

                    {/* Arrow down connector */}
                    <div className="flex justify-center items-center py-0.5">
                      <div className="h-6 w-0.5 border-l border-dashed border-slate-300"></div>
                    </div>

                    {/* Razorpay Nodal Escrow */}
                    <div className="p-3.5 rounded-full border border-emerald-100 bg-emerald-50/80 text-center text-xs font-extrabold text-[#0F8B7D] flex items-center justify-center gap-2 shadow-xs max-w-sm mx-auto w-full hover:bg-emerald-50 transition-colors">
                      <Lock size={14} className="animate-pulse" />
                      Razorpay Escrow Nodal Account
                    </div>

                    {/* Split line drawing */}
                    <div className="flex items-center justify-center relative h-10 w-full">
                      <svg className="w-[60%] h-full text-slate-300" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                        <path d="M50 0 L50 10 M50 10 L10 10 M50 10 L90 10 M10 10 L10 30 M90 10 L90 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                      </svg>
                    </div>

                    {/* Split columns */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Vendor Payout (90%) */}
                      <div className="p-4 rounded-xl border border-[#DFE4E1] bg-[#F6FAF9] text-center hover:border-emerald-200 transition-all shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vendor</div>
                        <div className="font-black text-slate-900 text-sm mt-1">90%</div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 rounded px-1.5 py-0.5 inline-block border border-emerald-100">Upon Sign-off</div>
                      </div>

                      {/* OfficeX Payout (10%) */}
                      <div className="p-4 rounded-xl border border-[#DFE4E1] bg-[#F6FAF9] text-center hover:border-[#0F8B7D] transition-all shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OfficeX</div>
                        <div className="font-black text-slate-900 text-sm mt-1">10%</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1 bg-slate-50 rounded px-1.5 py-0.5 inline-block border border-slate-100">Platform Fee</div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Step Hint */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <span>Timeline Stage</span>
                <span className="text-[#0F8B7D] font-black">{timelineSteps[activeTimelineStep].title}</span>
              </div>
            </div>

          </div>

          {/* Testimonial Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-slate-200/50">
            <div className="p-5 rounded-2xl border border-[#DFE4E1] bg-white hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-semibold text-slate-700 italic mt-3">
                "Cut vendor onboarding time by 60%."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black">RM</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Rahul M.</h5>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">DLF</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#DFE4E1] bg-white hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-semibold text-slate-700 italic mt-3">
                "Escrow builds massive trust."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black">PK</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Priya K.</h5>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vendor</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#DFE4E1] bg-white hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-semibold text-slate-700 italic mt-3">
                "Compliance tracking is a lifesaver."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black">AS</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Amit S.</h5>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Wipro</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: PRICING PLANS */}
      <section id="pricing" className="py-16 md:py-20 bg-[#F6FAF9] border-t border-b border-[#DFE4E1] px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Transparent Pricing for Every Scale</h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm mt-2 md:mt-3">Choose the right plan to manage and secure your operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Plan 1: Starter */}
            <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Starter</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-semibold">For single-site offices up to 10k sqft.</p>
                <div className="text-3xl font-black text-slate-900 mt-6">Free</div>
                
                <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Access to Marketplace</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Basic Helpdesk</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Up to 3 Users</li>
                </ul>
              </div>
              <button 
                onClick={() => router.push("/login?plan=starter")}
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            {/* Plan 2: Professional */}
            <div className="rounded-3xl p-6 md:p-8 border-2 border-[#0F8B7D] bg-white flex flex-col justify-between relative shadow-xl scale-100 md:scale-105">
              <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#0F8B7D] text-white text-[9px] font-black uppercase tracking-widest shadow">MOST POPULAR</span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Professional</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-semibold">For growing multi-site portfolios.</p>
                <div className="text-3xl font-black text-slate-900 mt-6">₹4,999<span className="text-xs font-semibold text-slate-400">/mo</span></div>
                
                <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Escrow Payments</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> PPM Calendar</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Compliance Tracker</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Unlimited Users</li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/public/wizard?plan=professional')}
                className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs mt-8 transition-colors cursor-pointer shadow-md"
              >
                Get Started
              </button>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="rounded-3xl p-8 border border-[#DFE4E1] bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-semibold">Custom deployment for large institutions.</p>
                <div className="text-3xl font-black text-slate-900 mt-6">Custom</div>
                
                <ul className="mt-8 flex flex-col gap-3.5 text-xs text-slate-600 font-bold">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> White-labeling</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> ERP Integrations</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> Dedicated Success Mgr</li>
                </ul>
              </div>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION */}
      <section id="faq" className="py-16 md:py-20 bg-[#F6FAF9] px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm mt-2 md:mt-3">Find clear answers about vendor operations, billing security, and integrations.</p>
          </div>

          <div className="flex flex-col gap-3.5 md:gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#DFE4E1] overflow-hidden shadow-xs">
                <button 
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-4 md:px-6 py-3.5 md:py-4.5 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${activeFAQ === idx ? "transform rotate-180 text-[#0F8B7D]" : ""}`} />
                </button>
                {activeFAQ === idx && (
                  <div className="px-4 md:px-6 pb-4 md:pb-5 text-xs text-slate-500 border-t border-slate-50 pt-3 md:pt-4 leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: DARK FOOTER */}
      <Footer />

      {/* CONTACT SALES MODAL OVERLAY */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DFE4E1] shadow-2xl p-6 md:p-8 max-w-md w-full relative">
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 text-slate-450 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
            
            {contactStatus === "success" ? (
              <div className="text-center py-8 flex flex-col items-center justify-center animate-scaleUp">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow">
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
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] font-semibold"
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
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] font-semibold"
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
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] font-semibold"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="tel" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91..." 
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] font-semibold"
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
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] font-semibold resize-none"
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




    </div>
  );
}

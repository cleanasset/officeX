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
import { CountryPhoneInput } from "@/components/ui/CountryPhoneInput";
import {
  LIVE_MARKETPLACE_CITIES,
  COMING_SOON_METROS,
  COMING_SOON_CITIES,
  ALL_MARKETPLACE_CITIES,
} from "@/data/marketplace-cities";

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

function CustomSearchSelect({
  label,
  value,
  onChange,
  options,
  borderRight = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  borderRight?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = options.find((o) => o.value === value) || options[0];

  return (
    <div
      ref={ref}
      className={`relative ${className} ${
        borderRight ? "md:pr-3.5 md:border-r border-slate-200" : "md:px-3.5"
      }`}
    >
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 pointer-events-none select-none">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs sm:text-[13px] font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5 text-left"
      >
        <span className="truncate">{currentOption?.label || value}</span>
        <ChevronDown
          size={13}
          className={`text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${
            open ? "rotate-180 text-[#0F8B7D]" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[210px] max-w-[280px] bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1.5 z-50 max-h-56 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-teal-50 text-[#0F8B7D] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={13} className="text-[#0F8B7D] shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor" | "managed">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(4); // Default to escrow payment step
  const [isEnquirySlideInOpen, setIsEnquirySlideInOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<{ audience?: string; modules?: string[] } | undefined>(undefined);
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
      portalHref: "/dashboard/leasing",
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
      portalHref: "/portal",
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
        { label: "Security Level", val: "AES-256" },
      ],
      points: [
        "SAML 2.0 & Okta SSO integration with automated directory syncing",
        "Standardized BACnet/IP, Modbus TCP, and MQTT BMS telemetry connectors",
        "Instant QR mobile visitor passes and NFC gate access provisioning",
        "Strict adherence to DPDP Act 2023, TLS 1.3, and enterprise security standards"
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
  const [spaceCity, setSpaceCity] = useState("Delhi NCR");
  const [spaceArea, setSpaceArea] = useState("");
  const [spaceBudget, setSpaceBudget] = useState("All Ranges");
  const [spaceGrade, setSpaceGrade] = useState("all");

  // Dynamic location detection on homepage - restricted strictly to 4 live activated cities
  useEffect(() => {
    fetch("/api/marketplace/detect-location")
      .then((res) => res.json())
      .then((data) => {
        if (data?.city) {
          const isLive = LIVE_MARKETPLACE_CITIES.some(
            (c) => c.name.toLowerCase() === data.city.toLowerCase()
          );
          if (isLive) {
            setSpaceCity(data.city);
          }
        }
      })
      .catch(() => {});
  }, []);

  const [vendorCategory, setVendorCategory] = useState("HVAC Maintenance");
  const [vendorCity, setVendorCity] = useState("Delhi NCR");
  const [vendorBudget, setVendorBudget] = useState("All Budgets");
  const [vendorType, setVendorType] = useState("Commercial Office");
  const [managedScope, setManagedScope] = useState("all");
  const [managedCity, setManagedCity] = useState("Delhi NCR");
  const [managedSize, setManagedSize] = useState("50k-200k");
  const [hoveredEcoCard, setHoveredEcoCard] = useState<string | null>(null);

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
      const params = new URLSearchParams();
      if (spaceCity && spaceCity !== "all") {
        params.set("city", spaceCity);
      }
      if (spaceGrade && spaceGrade !== "all" && spaceGrade !== "All Workspaces" && spaceGrade !== "All Grades") {
        params.set("vertical", spaceGrade);
      }
      if (spaceBudget && spaceBudget !== "All Ranges" && spaceBudget !== "Any Area" && spaceBudget !== "all") {
        params.set("area", spaceBudget);
      }
      const qs = params.toString();
      router.push(`/marketplace/search${qs ? `?${qs}` : ""}`);
      return;
    }
    if (activeSearchTab === "managed") {
      const scopeRoutes: Record<string, string> = {
        "rent-roll": "/operate/rent-roll",
        "ppm": "/operate/ppm",
        "visitors": "/operate/visitors",
        "compliance": "/operate/compliance",
        "helpdesk": "/operate/helpdesk",
        "lease-crm": "/operate/lease-crm",
        "managed-services": "/managed-services",
        "all": "/operate",
      };
      const targetRoute = scopeRoutes[managedScope] || (managedScope ? `/operate/${managedScope}` : "/operate");
      router.push(targetRoute);
      return;
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
      q: "How does the work order billing structure work?",
      a: "When a service contract or work order is awarded, billing is structured around verified operational milestones. Upon formal sign-off of completed works by the property facility team, payments are processed directly with audit-logged receipts and transparent fee accounting."
    },
    {
      q: "Is my facility data secure?",
      a: "Yes, security is our primary focus. We use bank-grade AES-256 encryption at rest, TLS 1.3 in transit, and enforce role-based access control (RBAC). Our architecture is DPDP Act 2023 compliant and hosted on enterprise-grade cloud infrastructure."
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
          ? "bg-[#0B0D12]/95 backdrop-blur-md text-white border-b border-slate-800"
          : "bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/80"
      }`}>
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center shrink-0 lg:w-[220px]">
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={38} 
              height={38} 
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "29px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={130} 
              height={28} 
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "25px" }}
            />
          </Link>
        </div>

        {/* Center: Main Navigation Menu Items with Dropdowns */}
        <nav className={`hidden lg:flex flex-1 justify-center items-center gap-6 text-xs sm:text-sm font-semibold transition-colors ${
          isScrolledPastHero ? "text-slate-300" : "text-slate-600"
        }`}>
          
          {/* 1. Find Spaces Dropdown */}
          <div className="relative group py-2">
            <Link href="/marketplace" className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>Find Spaces</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-[290px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                Explore Office Spaces
              </div>
              <div className="space-y-1">
                <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">All Commercial Spaces</div>
                  <div className="text-[11px] text-slate-500 font-normal">Search verified Grade-A offices</div>
                </Link>
                <Link href="/marketplace?type=managed" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">Managed Offices</div>
                  <div className="text-[11px] text-slate-500 font-normal">Turnkey enterprise suites</div>
                </Link>
                <Link href="/marketplace?type=coworking" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">Coworking &amp; Shared Desks</div>
                  <div className="text-[11px] text-slate-500 font-normal">Flexible desks &amp; team cabins</div>
                </Link>
                <Link href="/marketplace?type=campus" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">Enterprise Tech Campuses</div>
                  <div className="text-[11px] text-slate-500 font-normal">Large floor plates (25,000+ sq.ft.)</div>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. FM Services Dropdown */}
          <div className="relative group py-2">
            <Link href="/fm-marketplace" className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>FM Services</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                Verified Facilities Vendors
              </div>
              <div className="space-y-1">
                <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">All FM Services &amp; AMCs</div>
                  <div className="text-[11px] text-slate-500 font-normal">Pre-vetted vendors across 8 trades</div>
                </Link>
                <Link href="/fm-marketplace?category=hvac" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">HVAC &amp; Chiller AMCs</div>
                  <div className="text-[11px] text-slate-500 font-normal">Commercial cooling &amp; maintenance</div>
                </Link>
                <Link href="/fm-marketplace?category=housekeeping" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">Housekeeping &amp; Deep Cleaning</div>
                  <div className="text-[11px] text-slate-500 font-normal">Mechanized corporate hygiene</div>
                </Link>
                <Link href="/fm-marketplace?category=mep" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                  <div className="text-xs font-bold text-slate-900">MEP, Electrical &amp; DG Sets</div>
                  <div className="text-[11px] text-slate-500 font-normal">Power backup &amp; electrical audits</div>
                </Link>
                <hr className="border-slate-100 my-1.5" />
                <Link href="/vendor" className="block p-2 rounded-xl hover:bg-teal-50 transition-colors text-xs font-bold text-[#0F8B7D] flex items-center justify-between">
                  <span>Register as Vendor</span>
                  <span className="text-[9.5px] bg-teal-100 text-[#0F8B7D] px-1.5 py-0.5 rounded font-black">Escrow</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Property Management Link */}
          <Link
            href="/manage"
            className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
          >
            Property Management
          </Link>

          {/* 4. Operations Suite Dropdown */}
          <div className="relative group py-2">
            <Link 
              href="/operate"
              className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Operations Suite</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-0 w-[330px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                <span>CRE &amp; FM SaaS Modules</span>
                <Link 
                  href="/operate"
                  className="text-[#0F8B7D] hover:underline font-bold text-[10px] cursor-pointer"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="space-y-1">
                <Link 
                  href="/operate/rent-roll" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">Rent Roll &amp; Billing Engine</div>
                  <div className="text-[11px] text-slate-500 font-normal">Auto escalations, CAM pooling, bank escrow</div>
                </Link>
                <Link 
                  href="/operate/compliance" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">Statutory Compliance Calendar</div>
                  <div className="text-[11px] text-slate-500 font-normal">48 Pre-configured commercial tower licenses</div>
                </Link>
                <Link 
                  href="/operate/ppm" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">52-Week PPM &amp; CAFM</div>
                  <div className="text-[11px] text-slate-500 font-normal">Equipment servicing matrices &amp; QR passports</div>
                </Link>
                <Link 
                  href="/operate/visitors" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">Visitor Flow &amp; Speed-Gates</div>
                  <div className="text-[11px] text-slate-500 font-normal">WhatsApp QR passes &amp; turnstile integration</div>
                </Link>
                <Link 
                  href="/operate/lease-crm" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">Commercial Lease CRM</div>
                  <div className="text-[11px] text-slate-500 font-normal">Stacking plans, LOI generator, deal velocity</div>
                </Link>
                <Link 
                  href="/operate/helpdesk" 
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">Tenant Helpdesk &amp; Rooms</div>
                  <div className="text-[11px] text-slate-500 font-normal">10-Sec QR dispatch &amp; boardroom booking</div>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Partner With Us Dropdown (Combined List Space & Register Vendor) */}
          <div className="relative group py-2">
            <button className="hover:text-[#0F8B7D] text-[#0F8B7D] font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <span>Partner With Us</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full -left-6 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
              <div className="p-1 space-y-1">
                <Link
                  href="/properties/add"
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">List Your Space</div>
                  <div className="text-[11px] text-slate-500 font-normal">For Property Owners &amp; Landlords</div>
                </Link>
                <Link
                  href="/vendor"
                  className="w-full text-left block p-2 rounded-xl hover:bg-teal-50/60 transition-colors"
                >
                  <div className="text-xs font-bold text-[#0F8B7D]">Register as Vendor</div>
                  <div className="text-[11px] text-slate-500 font-normal">For FM Contractors &amp; Service Providers</div>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Company Dropdown */}
          <div className="relative group py-2">
            <button className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer">
              <span>Company</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full right-0 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
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
        <div className="hidden md:flex items-center justify-end gap-3 shrink-0">
          <HeaderAuthButton redirectUrl="/" />
          <button 
            type="button"
            onClick={() => openEnquiry()}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Enquire</span>
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
          <div className="flex items-center gap-2 mb-2">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={38} 
              height={38} 
              className="object-contain"
              style={{ width: "auto", height: "29px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={130} 
              height={28} 
              className="object-contain"
              style={{ width: "auto", height: "25px" }}
            />
          </div>
          <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Find Office Spaces</Link>
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">FM Services Marketplace</Link>
          <Link href="/manage" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Property Management</Link>
          <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D] flex items-center justify-between">
            <span>Operations Suite</span>
            <span className="text-xs bg-teal-100 px-2 py-0.5 rounded text-[#0F8B7D] font-bold">Rent Roll &amp; CAFM</span>
          </Link>
          <Link href="/properties/add" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">List Your Space</Link>
          <Link href="/vendor" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D] flex items-center justify-between">
            <span>Register as Vendor</span>
            <span className="text-xs bg-teal-100 px-2 py-0.5 rounded text-[#0F8B7D] font-bold">Escrow Hub</span>
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">About OfficeX</Link>
          <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Resources &amp; Insights</Link>
          <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">FAQs</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Contact Us</Link>
          <hr className="border-slate-200 my-2" />
          <div className="py-1">
            <HeaderAuthButton redirectUrl="/" />
          </div>
          <button 
            type="button"
            onClick={() => { setMobileMenuOpen(false); openEnquiry(); }}
            className="w-full py-3 rounded-xl bg-[#0F8B7D] text-white font-bold text-center shadow-md cursor-pointer text-sm"
          >
            Enquire
          </button>
        </div>
      )}

      {/* SECTION 2: HERO — COMPLETE OFFICEX CRE & FM ECOSYSTEM (CENTERED & SLEEK) */}
      <section className="relative min-h-[500px] sm:min-h-[560px] md:min-h-[590px] lg:min-h-[620px] w-full max-w-full overflow-hidden flex flex-col justify-center pt-6 sm:pt-10 md:pt-12 lg:pt-14 pb-8 sm:pb-12 md:pb-14 lg:pb-16 bg-slate-950 border-b border-slate-800 text-white">
        
        {/* Background Image: Clean Architectural Commercial Real Estate Skyline */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/images/officex_clean_cre_hero.jpg"
            alt="OfficeX Complete CRE & FM Ecosystem"
            fill
            priority
            unoptimized
            className="object-cover object-center brightness-[1.02] contrast-[1.08]"
          />

          {/* Localized Radial Contrast Scrim: Delivers crystal-clear readability for centered text while keeping the surrounding architecture, dusk sky, and lights 100% vivid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_75%_at_50%_42%,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.48)_50%,rgba(2,6,23,0.12)_85%,transparent_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-transparent to-slate-950/60 pointer-events-none" />
        </div>

        {/* Centered Hero Container — Sleek & Compact Width */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="max-w-[720px] text-center flex flex-col items-center w-full">
            
            {/* Eyebrow Badge — Vibrant Teal Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-teal-400/50 text-teal-300 text-xs sm:text-sm font-bold tracking-wide mb-3 sm:mb-4 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)] mx-auto">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span>Intelligent Commercial Workplace Platform</span>
            </div>

            {/* Main Headline with Clean, Soft Ambient Contrast */}
            <h1 className="text-2xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.1] mb-2.5 sm:mb-4 text-center">
              <span className="block text-white [text-shadow:_0_4px_20px_rgba(0,0,0,0.35)]">
                One Platform.
              </span>
              <span className="block text-[#00D09C] [text-shadow:_0_4px_20px_rgba(0,0,0,0.35)]">
                Smarter Workplaces.
              </span>
            </h1>

            {/* Subhead with Clean Contrast */}
            <p className="text-[11px] sm:text-sm md:text-base font-medium text-slate-100 leading-relaxed max-w-xl mb-4 sm:mb-6 text-center mx-auto [text-shadow:_0_2px_8px_rgba(0,0,0,0.35)]">
              Find verified commercial spaces, hire top facility management vendors, and automate building operations — all in one unified ecosystem.
            </p>

            {/* 3-Tab Search Bar Component — Sleek & Proportional */}
            <div className="w-full max-w-[720px] mb-3 sm:mb-4">
              {/* Unified Segmented Tabs - 3 equal responsive tabs with high contrast and zero clipping */}
              <div className="grid grid-cols-3 w-full gap-1 sm:flex sm:items-center sm:justify-center sm:gap-1.5 mb-0 max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("space")}
                  className={`px-1.5 py-1.5 sm:px-5 sm:py-2.5 rounded-t-xl text-[11px] sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center min-h-[40px] sm:min-h-0 ${
                    activeSearchTab === "space"
                      ? "bg-[#0F8B7D] text-white shadow-lg"
                      : "bg-slate-900/90 backdrop-blur-md text-white/90 hover:text-white hover:bg-slate-800 border-t border-x border-white/20"
                  }`}
                >
                  <Building2 size={13} className={activeSearchTab === "space" ? "text-white shrink-0" : "text-teal-300 shrink-0"} />
                  <span className="leading-tight sm:leading-normal whitespace-normal sm:whitespace-nowrap">Find Spaces</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("vendor")}
                  className={`px-1.5 py-1.5 sm:px-5 sm:py-2.5 rounded-t-xl text-[11px] sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center min-h-[40px] sm:min-h-0 ${
                    activeSearchTab === "vendor"
                      ? "bg-[#0F8B7D] text-white shadow-lg"
                      : "bg-slate-900/90 backdrop-blur-md text-white/90 hover:text-white hover:bg-slate-800 border-t border-x border-white/20"
                  }`}
                >
                  <Wrench size={13} className={activeSearchTab === "vendor" ? "text-white shrink-0" : "text-teal-300 shrink-0"} />
                  <span className="leading-tight sm:leading-normal whitespace-normal sm:whitespace-nowrap">Hire Vendors</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSearchTab("managed")}
                  className={`px-1.5 py-1.5 sm:px-5 sm:py-2.5 rounded-t-xl text-[11px] sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center min-h-[40px] sm:min-h-0 ${
                    activeSearchTab === "managed"
                      ? "bg-[#0F8B7D] text-white shadow-lg"
                      : "bg-slate-900/90 backdrop-blur-md text-white/90 hover:text-white hover:bg-slate-800 border-t border-x border-white/20"
                  }`}
                >
                  <ShieldCheck size={13} className={activeSearchTab === "managed" ? "text-white shrink-0" : "text-teal-300 shrink-0"} />
                  <span className="leading-tight sm:leading-normal whitespace-normal sm:whitespace-nowrap">Operate &amp; Manage</span>
                </button>
              </div>

              {/* Main Search Bar Card - Ultra-compact mobile 2x2 grid proportions */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.3)] p-2 sm:p-4 border border-slate-200/90 w-full text-left text-slate-900">
                {activeSearchTab === "space" && (
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-1.5 sm:gap-2.5 items-center">
                    {/* Field 1: Location - Only Activated 4 Cities (Row 1 Left on Mobile, Col 1-4 on Desktop) */}
                    <div className="col-span-1 sm:col-span-4 pr-1.5 sm:pr-3 border-r sm:border-r border-slate-200 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        City / Hub
                      </label>
                      <select
                        value={spaceCity}
                        onChange={(e) => setSpaceCity(e.target.value)}
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                      >
                        {LIVE_MARKETPLACE_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.count} spaces)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Field 3: Format - Complete myHQ Formats (Row 1 Right on Mobile, Col 8-10 on Desktop) */}
                    <div className="col-span-1 sm:col-span-3 pl-1.5 sm:pl-0 sm:order-3 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Format
                      </label>
                      <select
                        value={spaceGrade}
                        onChange={(e) => setSpaceGrade(e.target.value)}
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                      >
                        <option value="all">All Workspaces</option>
                        <option value="coworking">Coworking Spaces</option>
                        <option value="managed">Managed Office Suites</option>
                        <option value="private_cabin">Private Cabins &amp; Offices</option>
                        <option value="dedicated_desk">Dedicated Desks</option>
                        <option value="commercial">Commercial Floors</option>
                        <option value="virtual_office">Virtual Office</option>
                        <option value="meeting_room">Meeting Rooms</option>
                        <option value="day_pass">Day Pass &amp; Flexi</option>
                        <option value="campus">Enterprise Campus</option>
                      </select>
                    </div>

                    {/* Field 2: Size (Row 2 Left on Mobile, Col 5-7 on Desktop) */}
                    <div className="col-span-1 sm:col-span-3 pr-1.5 sm:pr-3 border-r sm:border-r border-slate-200 sm:order-2 pt-0.5 sm:pt-0">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Floor Area
                      </label>
                      <select
                        value={spaceBudget}
                        onChange={(e) => setSpaceBudget(e.target.value)}
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                      >
                        <option value="All Ranges">Any Area</option>
                        <option value="2,000 - 5,000 sq.ft.">2k - 5k sq.ft.</option>
                        <option value="5,000 - 15,000 sq.ft.">5k - 15k sq.ft.</option>
                        <option value="15,000 - 50,000 sq.ft.">15k - 50k sq.ft.</option>
                        <option value="50,000+ sq.ft.">50k+ sq.ft. Campus</option>
                      </select>
                    </div>

                    {/* Search Button (Row 2 Right on Mobile, Col 11-12 on Desktop) */}
                    <div className="col-span-1 sm:col-span-2 pl-1.5 sm:pl-0 sm:order-4 pt-0.5 sm:pt-0 flex items-end">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] hover:opacity-95 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-[32px] sm:h-auto"
                      >
                        <Search size={13} />
                        <span>Search</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeSearchTab === "vendor" && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-1.5 sm:gap-2.5 items-center">
                      {/* Field 1: FM Service (Row 1 Left on Mobile, Col 1-4 on Desktop) */}
                      <div className="col-span-1 sm:col-span-4 pr-1.5 sm:pr-3 border-r sm:border-r border-slate-200 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100">
                        <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          FM Service Needed
                        </label>
                        <select
                          value={vendorCategory}
                          onChange={(e) => setVendorCategory(e.target.value)}
                          className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                        >
                          <option value="HVAC Maintenance">HVAC &amp; Chillers AMC</option>
                          <option value="Deep Cleaning">Commercial Cleaning &amp; Hygiene</option>
                          <option value="Electrical Auditing">MEP &amp; DG Sets Audit</option>
                          <option value="Pest Control">PSARA Manned Security</option>
                          <option value="Fire & Safety NOC">Statutory Fire Safety NOC</option>
                        </select>
                      </div>

                      {/* Field 2: City (Row 1 Right on Mobile, Col 5-7 on Desktop) */}
                      <div className="col-span-1 sm:col-span-3 pl-1.5 sm:pl-0 sm:pr-3 sm:border-r border-slate-200 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100 sm:order-2">
                        <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          Location
                        </label>
                        <select
                          value={vendorCity}
                          onChange={(e) => setVendorCity(e.target.value)}
                          className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                        >
                          <option value="Delhi NCR">Delhi NCR</option>
                          <option value="Gurugram">Gurugram</option>
                          <option value="Noida">Noida</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Pune">Pune</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Ahmedabad">Ahmedabad</option>
                        </select>
                      </div>

                      {/* Field 3: Scope (Row 2 Left on Mobile, Col 8-10 on Desktop) */}
                      <div className="col-span-1 sm:col-span-3 pr-1.5 sm:pr-3 border-r sm:border-r-0 border-slate-200 sm:order-3 pt-0.5 sm:pt-0">
                        <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          Contract Term
                        </label>
                        <select
                          className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                        >
                          <option value="Annual AMC">Annual AMC</option>
                          <option value="One-Time Service">One-Time Service</option>
                          <option value="Multi-Year IFM">Multi-Year IFM</option>
                        </select>
                      </div>

                      {/* Search Button (Row 2 Right on Mobile, Col 11-12 on Desktop) */}
                      <div className="col-span-1 sm:col-span-2 pl-1.5 sm:pl-0 sm:order-4 pt-0.5 sm:pt-0 flex items-end">
                        <button
                          onClick={handleLandingSearch}
                          className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] hover:opacity-95 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-[32px] sm:h-auto"
                        >
                          <Wrench size={13} />
                          <span>Find</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[9.5px] sm:text-[11px] text-slate-500">
                      <span>Are you a facility service provider?</span>
                      <Link href="/vendor" className="font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
                        <span>Register as Vendor &rarr;</span>
                      </Link>
                    </div>
                  </>
                )}

                {activeSearchTab === "managed" && (
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-1.5 sm:gap-2.5 items-center">
                    {/* Field 1: Scope - Maps directly to specific SaaS product pages (Row 1 Left on Mobile, Col 1-4 on Desktop) */}
                    <div className="col-span-1 sm:col-span-4 pr-1.5 sm:pr-3 border-r sm:border-r border-slate-200 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Scope
                      </label>
                      <select
                        value={managedScope}
                        onChange={(e) => setManagedScope(e.target.value)}
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                      >
                        <option value="all">All Modules (Full Platform)</option>
                        <option value="rent-roll">Rent Roll &amp; CAM Billing</option>
                        <option value="ppm">52-Week PPM &amp; CAFM</option>
                        <option value="visitors">Visitor Flow &amp; Turnstiles</option>
                        <option value="compliance">Statutory Compliance Vault</option>
                        <option value="helpdesk">Tenant Helpdesk &amp; SLA</option>
                        <option value="lease-crm">Commercial Lease CRM</option>
                        <option value="managed-services">Integrated IFM Stewardship</option>
                      </select>
                    </div>

                    {/* Field 2: Portfolio Size (Row 1 Right on Mobile, Col 5-7 on Desktop) */}
                    <div className="col-span-1 sm:col-span-3 pl-1.5 sm:pl-0 sm:pr-3 sm:border-r border-slate-200 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-slate-100 sm:order-2">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Portfolio Size
                      </label>
                      <select
                        value={managedSize}
                        onChange={(e) => setManagedSize(e.target.value)}
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate py-0.5"
                      >
                        <option value="10k-50k">10k - 50k Sq.Ft.</option>
                        <option value="50k-200k">50k - 200k Sq.Ft.</option>
                        <option value="200k+">200k+ Sq.Ft. Campus</option>
                      </select>
                    </div>

                    {/* Field 3: City - Searchable all-India with Auto-Recognition (Row 2 Left on Mobile, Col 8-10 on Desktop) */}
                    <div className="col-span-1 sm:col-span-3 pr-1.5 sm:pr-3 border-r sm:border-r-0 border-slate-200 sm:order-3 pt-0.5 sm:pt-0">
                      <label className="block text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        City / Location
                      </label>
                      <input
                        type="text"
                        list="all-india-operate-cities"
                        value={managedCity}
                        onChange={(e) => setManagedCity(e.target.value)}
                        placeholder="Type city..."
                        className="w-full text-[11px] sm:text-xs font-bold text-slate-900 bg-transparent focus:outline-none truncate py-0.5 placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <datalist id="all-india-operate-cities">
                        {ALL_MARKETPLACE_CITIES.map((c) => (
                          <option key={c.name} value={c.name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Search Button (Row 2 Right on Mobile, Col 11-12 on Desktop) */}
                    <div className="col-span-1 sm:col-span-2 pl-1.5 sm:pl-0 sm:order-4 pt-0.5 sm:pt-0 flex items-end">
                      <button
                        onClick={handleLandingSearch}
                        className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] hover:opacity-95 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-[32px] sm:h-auto"
                      >
                        <ShieldCheck size={13} />
                        <span>Explore</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Value Highlight Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-white font-bold mt-2 sm:mt-2.5">
              <span className="inline-flex items-center gap-1 bg-slate-950/85 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 text-white shadow-lg backdrop-blur-md">
                <CheckCircle2 size={12} className="text-teal-400 shrink-0" />
                <span>0% Broker Fee</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-950/85 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 text-white shadow-lg backdrop-blur-md">
                <ShieldCheck size={12} className="text-teal-400 shrink-0" />
                <span>Milestone-Verified Payouts</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-950/85 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 text-white shadow-lg backdrop-blur-md">
                <Lock size={12} className="text-teal-400 shrink-0" />
                <span>DPDP Act 2023 Compliant</span>
              </span>
            </div>

            {/* Micro Trust Strip (hidden on mobile, visible on sm+) */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-200/90 mt-2.5 [text-shadow:_0_1px_4px_rgba(0,0,0,0.95)]">
              <span>AES-256 Vaulted</span>
              <span className="text-teal-400/80">•</span>
              <span>DPDP Act 2023 Compliant</span>
              <span className="text-teal-400/80">•</span>
              <span>Audit-Logged Settlements</span>
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

          {/* 5 Vertical Colored Cards: 2 cards row 1, 2 cards row 2, 1 card centered row 3 on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 [&>*:last-child]:col-span-2 [&>*:last-child]:max-w-[280px] [&>*:last-child]:mx-auto [&>*:last-child]:w-full lg:[&>*:last-child]:col-span-1 lg:[&>*:last-child]:max-w-none">
            {[
              {
                id: "property",
                title: "Office / CRE Discovery Marketplace",
                desc: "Discover. Compare. Lease.",
                benefits: ["Verified Grade-A listings across metros", "Side-by-side space comparison tools", "Direct owner/manager connection"],
                audience: "For: Occupiers, Brokers, Owners",
                image: "/images/card_office_marketplace.jpg",
                bgColor: "bg-[#139B8B]", // Logo Shade 1: Lighter Signature Vibrant Teal
                arrowColor: "text-[#139B8B]",
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
                bgColor: "bg-[#0E7A6B]", // Logo Shade 2: Lighter Forest Teal
                arrowColor: "text-[#0E7A6B]",
                href: "/fm-marketplace",
                iconType: "arrow",
              },
              {
                id: "saas",
                title: "Operate & Manage",
                desc: "CAFM, Rent roll & Visitor Management.",
                benefits: ["CAFM & 52-week automated PPM", "Rent roll, CAM billing & compliance", "Visitor management & touchless access"],
                audience: "For: Facility & Property Managers",
                image: "/images/card_saas_hd.jpg",
                bgColor: "bg-[#0F758D]", // Logo Shade 3: Lighter Petrol Marine
                arrowColor: "text-[#0F758D]",
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
                bgColor: "bg-[#0A80C2]", // Logo Shade 4: Lighter Oceanic Blue
                arrowColor: "text-[#0A80C2]",
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
                bgColor: "bg-[#4D6377]", // Logo Shade 5: Lighter Titanium Slate
                arrowColor: "text-[#4D6377]",
                href: "/intelligence",
                iconType: "sparkle",
              },
            ].map((card) => {
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className="flex flex-col rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-teal-400/50 active:scale-[0.98] transition-all duration-300 cursor-pointer group border border-slate-100 text-left w-full"
                >
                {/* Top Half: Photo */}
                <div className="relative h-24 sm:h-44 md:h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>

                {/* Bottom Half: Solid Vibrant Color Box */}
                <div className={`${card.bgColor} p-3 sm:p-5 flex flex-col justify-between flex-1 min-h-[140px] sm:min-h-[210px]`}>
                  <div>
                    <h3 className="text-xs sm:text-base font-extrabold text-white leading-snug mb-1 line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-white/80 font-medium mb-1.5 sm:mb-3 line-clamp-1">
                      {card.desc}
                    </p>
                    {/* 3 Bullet Benefits - Sleek on desktop */}
                    <ul className="hidden sm:block space-y-1.5">
                      {card.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/90 font-semibold leading-tight">
                          <Check size={10} className="text-white/70 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Audience Tag + Explore */}
                  <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
                    <span className="text-[8px] sm:text-[9px] font-bold text-white/70 uppercase tracking-wider truncate">
                      {card.audience}
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:translate-x-1 group-hover:scale-110 transition-transform shrink-0">
                      {card.iconType === "sparkle" ? (
                        <Sparkles size={12} className={card.arrowColor} />
                      ) : (
                        <ArrowRight size={12} className={card.arrowColor} />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>

          {/* Seamless Unified Transition to OFFICEX CORE (No distracting animations) */}
          <div className="w-full mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200 mb-2">
              UNIFIED FOUNDATION
            </span>
          </div>

          {/* LOWER HALF: OFFICEX CORE DATA FOUNDATION & ARCHITECTURE DIAGRAM */}
          <div 
            id="officex-core" 
            className="pt-2 sm:pt-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 items-center w-full">
              
              {/* LEFT COLUMN: Core Proposition & Services (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-center self-center py-2 sm:py-4">
                {/* Headline - Unified & Calm */}
                <h2 className="text-lg sm:text-2xl lg:text-[28px] font-black text-slate-950 tracking-tight leading-tight uppercase mb-2">
                  One Core. One Data Foundation. One Source of Truth.
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
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 max-w-full">
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
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
                  className={`w-full min-w-full shrink-0 snap-start bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch ${
                    isActive 
                      ? "border-teal-300/80 shadow-lg ring-1 ring-teal-100" 
                      : "border-slate-200 shadow-xs opacity-95"
                  }`}
                >
                  {/* Left Column: Role Details */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {data.badge}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {data.role}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-xl md:text-2xl font-black text-slate-950 mt-1.5 sm:mt-2 tracking-tight leading-snug">
                        {data.headline}
                      </h3>

                      <p className="text-slate-600 text-[11px] sm:text-[13px] font-semibold mt-1 sm:mt-1.5 italic leading-relaxed line-clamp-2 sm:line-clamp-none">
                        "{data.quote}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 mt-2.5 sm:mt-4">
                      {data.points.map((pt, i) => (
                        <div key={i} className="flex items-start gap-1.5 p-1.5 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10.5px] sm:text-[12px] font-bold text-slate-800 leading-tight">
                          <CheckCircle size={13} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Lighter Slate Navy Dashboard KPIs */}
                  <div className="lg:col-span-5 bg-[#0E223D] text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-md border border-slate-700/60 mt-2 sm:mt-0">
                    <div className="border-b border-slate-700/60 pb-1.5 sm:pb-2 mb-2 sm:mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] sm:text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">Target Performance Metrics</span>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">{data.role} Dashboard</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5 sm:mb-4 text-center">
                      {data.metrics.map((m, idx) => (
                        <div key={idx} className="bg-[#142948] p-1.5 sm:p-2 rounded-xl border border-slate-700/50">
                          <div className="text-xs sm:text-base font-black text-teal-400">{m.val}</div>
                          <div className="text-[8px] sm:text-[8.5px] text-slate-400 font-bold uppercase mt-0.5 leading-tight">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <Link
                        href={data.landingHref}
                        className="w-full py-1.5 sm:py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-500/30"
                      >
                        <span>See your journey</span>
                        <ArrowRight size={12} />
                      </Link>
                      <Link
                        href="/operate"
                        className="w-full py-2 sm:py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span>Explore {data.portalName}</span>
                        <ArrowRight size={12} />
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

    {/* SECTION 05: REAL OUTCOMES & MEASURABLE IMPACT (INSTITUTIONAL RIGOR) */}
    <section id="outcomes" className="py-10 sm:py-14 md:py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Rigor. Measurable Operations.
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Standardized operational infrastructure built specifically for commercial real estate portfolios, property managers, and institutional occupiers.
          </p>
        </div>

        {/* 5 Verified Platform Core Capabilities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center justify-center max-w-6xl mx-auto [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1 [&>*:last-child]:mx-auto sm:[&>*:last-child]:mx-0">
          {/* 1. SEBI Audit Ready */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A86B]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#00A86B] tracking-tight">100%</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 leading-tight">Audit-Trail Ready</div>
            </div>
          </div>

          {/* 2. 24 Trades */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F8B7D]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#0F8B7D] tracking-tight">24</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 leading-tight">FM Trade Categories</div>
            </div>
          </div>

          {/* 3. <18s Transit */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F8B7D]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#0F8B7D] tracking-tight">&lt;18s</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 leading-tight">Lobby Speed-Gate Transit</div>
            </div>
          </div>

          {/* 4. Automated CAM */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#F26522]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#F26522] tracking-tight">0</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 leading-tight">CAM Billing Disputes</div>
            </div>
          </div>

          {/* 5. 99.9% Uptime */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DB2777]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#DB2777] tracking-tight">99.9%</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-500 leading-tight">Infrastructure SLA</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    {/* SECTION 06: BEFORE VS AFTER COMPARISON (TRANSFORMATION & ROI - SIDE BY SIDE ON MOBILE) */}
    <section id="comparison" className="py-8 sm:py-14 md:py-20 bg-slate-50/60 border-b border-slate-200 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-10 md:mb-12">
          <span className="text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
            TRANSFORMATION &amp; ROI
          </span>
          <h2 className="text-lg sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight mt-1.5 sm:mt-3">
            Why Modern Teams Switch to OfficeX
          </h2>
          <p className="text-slate-500 text-[11px] sm:text-sm font-medium mt-1 sm:mt-2">
            Shift from disconnected spreadsheets to high-velocity operating confidence.
          </p>
        </div>

        {/* Before vs After Comparison Container - Smooth Horizontal Scroll on Mobile, 2 Columns on Desktop */}
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-6 md:gap-8 sm:overflow-visible">
          
          {/* BEFORE OFFICEX Card */}
          <div className="w-[85vw] max-w-[340px] sm:w-auto sm:max-w-none shrink-0 snap-center p-5 sm:p-8 md:p-9 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-300/80">
                BEFORE OFFICEX
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 mt-3 sm:mt-4 mb-1.5 sm:mb-2 leading-tight">
                Manual Chaos, Silos &amp; Delays
              </h3>
              <p className="text-xs text-slate-600 font-medium mb-4 sm:mb-6 leading-relaxed">
                Critical tasks slip through cracks when property operations live across disconnected spreadsheets.
              </p>

              <div className="space-y-2.5 sm:space-y-3">
                {[
                  "Disconnected Excel spreadsheets for rent & CAM",
                  "Untracked vendor requests on WhatsApp groups",
                  "Scattered compliance documents risking fines",
                  "Manual reconciliations and delayed reporting",
                  "Zero real-time visibility across portfolios"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 leading-snug">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-[10px] shrink-0">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-200/80 text-xs font-bold text-slate-500">
              Impact: Revenue leakage &amp; compliance fines
            </div>
          </div>

          {/* AFTER OFFICEX Card */}
          <div className="w-[85vw] max-w-[340px] sm:w-auto sm:max-w-none shrink-0 snap-center p-5 sm:p-8 md:p-9 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#0F8B7D] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#0F8B7D] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  AFTER OFFICEX
                </span>
                <span className="text-[10px] font-extrabold text-[#0F8B7D] uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Recommended
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 mt-3 sm:mt-4 mb-1.5 sm:mb-2 leading-tight">
                Unified Data Core &amp; Automated Rigor
              </h3>
              <p className="text-xs text-slate-600 font-medium mb-4 sm:mb-6 leading-relaxed">
                Connect leases, maintenance tasks, and tenant requests into a continuous digital ecosystem.
              </p>

              <div className="space-y-2.5 sm:space-y-3">
                {[
                  "Single unified data core across all properties",
                  "52-week automated PPM & QR asset passports",
                  "100% audit-ready statutory compliance vault",
                  "Pre-vetted FM vendors with milestone escrow",
                  "Instant executive portfolio NOI dashboards"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-800 leading-snug">
                    <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-teal-100 text-xs font-extrabold text-[#0F8B7D]">
              Result: 30% lower operating overhead
            </div>
          </div>

        </div>

        {/* Swipe hint for mobile */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3 text-[10px] font-bold text-slate-400">
          <span>&larr; Swipe to compare Before &amp; After &rarr;</span>
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
            href="https://calendly.com/admin-cleanasset/30min"
            target="_blank"
            rel="noopener noreferrer"
            data-calendly="true"
            data-calendly-url="https://calendly.com/admin-cleanasset/30min"
            className="font-bold text-[#0F8B7D] hover:underline cursor-pointer"
          >
            Schedule a 30-minute demo &amp; consultation &rarr;
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
                  
                  <div>
                    <CountryPhoneInput
                      label="Phone Number"
                      value={contactPhone}
                      onChange={(val) => setContactPhone(val)}
                      placeholder="98200 12345"
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


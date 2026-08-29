"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  RefreshCw
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"discover" | "transact" | "operate">("discover");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArchNode, setSelectedArchNode] = useState<string>("property");
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

  const faqs = [
    {
      q: "What is the standard commission on FM Marketplace transactions?",
      a: "OfficeX charges a standard platform fee of 10% on work order payments routed through the system. Custom rates can be negotiated for enterprise volume contracts."
    },
    {
      q: "How are vendors verified before listing?",
      a: "Every vendor goes through an automated GSTIN/PAN check and manual verification of active labor licenses, trade licenses, and liability insurance before being approved to submit quotes."
    },
    {
      q: "How does the escrow payment system protect us?",
      a: "Milestone payments are held securely in a Razorpay escrow pool. Funds are split and released (90% to the vendor, 10% to the platform) only after your property team marks the work order milestone as verified."
    },
    {
      q: "Can we track compliance certificates like Fire NOC or Lift Safety?",
      a: "Yes. The statutory compliance module monitors expiries, counts down remaining days, and triggers auto-alerts (60/30/15 days) to administrators to ensure NOC renewals are submitted on time."
    },
    {
      q: "Does OfficeX support multiple property locations in India?",
      a: "Yes. The super-admin configuration supports portfolio scaling across multiple operating cities, including Mumbai, Pune, Bengaluru, Chennai, and Delhi NCR, with property-level RBAC boundaries."
    },
    {
      q: "What role does AI play in facility summaries?",
      a: "Our AI summarization engine automatically parses open dispatches, SLA logs, and financial collection sheets to generate board-ready operational summaries, requiring manager approval before sending."
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const handleLandingSearch = () => {
    if (activeSearchTab === "discover") {
      router.push(`/public/search?q=${encodeURIComponent(searchQuery)}`);
    } else if (activeSearchTab === "transact") {
      router.push(`/leasing/pipeline`);
    } else {
      router.push(`/public/wizard`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLandingSearch();
    }
  };

  const rolesLauncher = [
    { name: "Property Owner", desc: "Manage Leases & NOI", href: "/properties", color: "bg-blue-500 hover:bg-blue-600" },
    { name: "Facility Manager", desc: "Track Health & SLAs", href: "/ops", color: "bg-indigo-500 hover:bg-indigo-600" },
    { name: "Tenant Admin", desc: "Pay Rent & Raise Issues", href: "/tenant", color: "bg-purple-500 hover:bg-purple-600" },
    { name: "Leasing Broker", desc: "Track Leads & Comm.", href: "/leasing", color: "bg-sky-500 hover:bg-sky-600" }
  ];

  const architectureNodes: Record<string, {
    title: string;
    badge: string;
    desc: string;
    icon: any;
    fields: string[];
    linkedModules: string[];
  }> = {
    property: {
      title: "Property & Space Registry",
      badge: "PLATFORM CORE MASTER",
      desc: "Onboard physical properties, buildings, floors, and lease units once. This canonical record propagates across all transacting marketplaces and operational checklists, preventing data duplication.",
      icon: Building,
      fields: ["property_id (UUID)", "name (Varchar)", "total_area (Decimal)", "grade (Enum)", "address (Text)", "city (Varchar)"],
      linkedModules: ["Property Discovery Marketplace", "Leasing Pipeline", "PPM Schedules", "Compliance Alarms"]
    },
    lease: {
      title: "Leases & Rent Roll Ledger",
      badge: "COMMERCIAL TRANSACTION LAYER",
      desc: "Track critical commercial lock-ins, deposits, and multi-tenant leases. Billing schedules automatically generate rent/CAM ledgers and trigger monthly collection flows.",
      icon: DollarSign,
      fields: ["lease_id (UUID)", "tenant_id (UUID)", "unit_id (UUID)", "monthly_rent (Decimal)", "escalation_pct (Decimal)", "lock_in_months (Integer)"],
      linkedModules: ["Leasing CRM & LOI", "Financial Reporting Console", "Tenant Bill Payments", "Escrow Transactions"]
    },
    rfq: {
      title: "FM Marketplace & RFQ",
      badge: "SERVICE DISCOVERY & BID MATCH",
      desc: "Match properties to local facility management vendors. Post structured RFQs, evaluate quotes on capability ratings, and route milestone payments via split escrow.",
      icon: ClipboardList,
      fields: ["rfq_id (UUID)", "property_id (UUID)", "vendor_id (UUID)", "gross_value (Decimal)", "milestones (JSONB)", "escrow_transaction_id (Varchar)"],
      linkedModules: ["RFQ Bidding Directory", "Service Marketplace", "Vendor Review Scorecard", "Razorpay Split Escrow"]
    },
    asset: {
      title: "Asset Management & PPM",
      badge: "SaaS OPERATIONS CORE",
      desc: "Register building equipment (HVAC, DG, pumps) and track asset lifecycle. Preventative 52-week maintenance tasks are auto-generated to limit critical failures.",
      icon: Settings,
      fields: ["asset_id (UUID)", "code (Varchar)", "category (Varchar)", "manufacturer (Varchar)", "warranty_expiry (Date)", "status (Varchar)"],
      linkedModules: ["52-Week PPM Calendar", "FM Command Centre", "Helpdesk SLA Tickets", "ESG Energy Efficiency"]
    },
    compliance: {
      title: "Statutory Compliance NOC",
      badge: "COMPLIANCE & EHS GOVERNANCE",
      desc: "Track statutory compliance filings (Fire NOC, Lift certifications, tax checks). Real-time alarms automatically countdown remaining days to prevent expirations.",
      icon: ShieldCheck,
      fields: ["certificate_id (UUID)", "name (Varchar)", "issuing_authority (Varchar)", "expiry_date (Date)", "status (Varchar)"],
      linkedModules: ["Compliance Centre", "Operations Logs", "Super Admin Console", "Permit to Work Gates"]
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden text-slate-900">
      
      {/* SECTION 1: FLOATING GLASS NAVBAR (OFFICEX Blue accents) */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-white/90 backdrop-blur-md border border-slate-100 rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo-removebg-preview.png" 
            alt="OfficeX Logo" 
            width={34} 
            height={34} 
            className="object-contain"
          />
          <Image 
            src="/name-removebg-preview.png" 
            alt="OfficeX" 
            width={110} 
            height={22} 
            className="object-contain"
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#architecture" className="hover:text-[#2563EB] transition-colors">Our Architecture</a>
          <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#2563EB] transition-colors">SaaS Plans</a>
          <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-[#2563EB] transition-colors">Sign In</a>
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
          >
            Get Started Free
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-slate-600 hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-8 flex flex-col gap-6 md:hidden">
          <a href="#architecture" className="text-lg font-bold hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(false)}>Our Architecture</a>
          <a href="#features" className="text-lg font-bold hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing" className="text-lg font-bold hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(false)}>SaaS Plans</a>
          <a href="#faq" className="text-lg font-bold hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <hr className="border-slate-100" />
          <a href="/login" className="text-lg font-bold hover:text-[#2563EB]" onClick={() => setMobileMenuOpen(false)}>Sign In</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-full bg-[#2563EB] text-white font-bold text-center shadow-lg cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      )}

      {/* SECTION 2: HERO & SHIFTING GRADIENT SEARCH */}
      <section className="pt-40 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-indigo-50/40 via-blue-50/20 to-white">
        
        {/* Floating Pulsing Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-[#2563EB] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Trusted by 450+ Indian Property Teams
        </div>

        <h1 className="text-center max-w-4xl text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
          Find the right workspace. <br />
          <span className="bg-gradient-to-r from-[#2563EB] to-indigo-600 bg-clip-text text-transparent">
            Operate it smarter.
          </span>
        </h1>
        
        <p className="text-center max-w-2xl text-slate-500 mt-6 text-base md:text-lg font-medium">
          Unify lease registrations, compliance, work order procurement, and collections on India’s leading Workplace Operating Platform.
        </p>

        {/* Option-3 Dual-Entry Proposition Cards & Search */}
        <div className="w-full max-w-3xl mt-12 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => setActiveSearchTab("discover")}
              className={`flex-1 py-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all ${
                activeSearchTab === "discover" 
                  ? "border-[#2563EB] text-[#2563EB] bg-white" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Find Workspace
            </button>
            <button 
              onClick={() => setActiveSearchTab("transact")}
              className={`flex-1 py-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all ${
                activeSearchTab === "transact" 
                  ? "border-[#2563EB] text-[#2563EB] bg-white" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Manage Workspace
            </button>
            <button 
              onClick={() => setActiveSearchTab("operate")}
              className={`flex-1 py-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all ${
                activeSearchTab === "operate" 
                  ? "border-[#2563EB] text-[#2563EB] bg-white" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Hire FM Vendor
            </button>
          </div>

          <div className="p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeSearchTab === "discover" 
                      ? "Search City, Micromarket (e.g. BKC Mumbai, Hinjewadi Pune)" 
                      : activeSearchTab === "transact"
                      ? "Enter Company Name or Org ID to launch transactions portal"
                      : "Service category (e.g. HVAC, Cleanliness, Fire Compliance)"
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs font-semibold transition-colors"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
              <div className="w-full md:w-48">
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs font-bold bg-white cursor-pointer">
                  <option>All Operating Cities</option>
                  <option>Mumbai (BKC)</option>
                  <option>Bengaluru (Whitefield)</option>
                  <option>Pune (Hinjewadi)</option>
                  <option>Ahmedabad (Nikol)</option>
                  <option>Delhi NCR</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleLandingSearch}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search size={14} />
              Continue
            </button>
          </div>
        </div>

        {/* Role Launcher Widget (Quick entry point for reviews) */}
        <div className="mt-10 max-w-4xl w-full text-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Click to Live Preview Role Experience</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rolesLauncher.map((rl, index) => (
              <button
                key={index}
                onClick={() => router.push(rl.href)}
                className={`p-4 rounded-xl border border-slate-100 bg-white text-left shadow-xs hover:shadow-md hover:border-slate-200 transition-all ${rl.color} group hover:text-white cursor-pointer`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-900 group-hover:text-white">{rl.name}</span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-white/80 font-bold mt-1 leading-tight">{rl.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Stats count-up row */}
        <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center border-t border-slate-100 pt-10">
          <div>
            <div className="text-2xl md:text-3xl font-black text-[#2563EB]">{animateCount.sqft}M+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Sq.Ft. Managed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-[#2563EB]">{animateCount.vendors}+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Verified FM Vendors</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-[#2563EB]">₹{animateCount.gtv}Cr+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Transaction GTV</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-[#2563EB]">{animateCount.uptime}%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">SLA Uptime</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE CONNECTED PLATFORM SITEMAP ARCHITECTURE */}
      <section id="architecture" className="py-20 bg-slate-50 border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3 py-1 rounded bg-blue-50 border border-blue-100 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">Master Platform Blueprint</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Consolidated Platform Architecture</h2>
            <p className="text-slate-500 font-medium text-xs mt-2.5">
              OfficeX integrates both discovery marketplaces and core operations under a single canonical data store. Click any interactive node below to trace data relationships.
            </p>
          </div>

          {/* Interactive Core Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
            
            {/* COLUMN 1 & 2: LIVE INTERACTIVE BLUEPRINT DIAGRAM */}
            <div className="lg:col-span-2 flex flex-col gap-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm justify-between">
              
              {/* Layer 1: Marketplaces Input Channels */}
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">1. Discovery & Transaction Marketplaces</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Property Marketplace Box */}
                  <div 
                    onClick={() => setSelectedArchNode("property")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedArchNode === "property" || selectedArchNode === "lease"
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB]">
                        <Building size={14} />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">Property Discovery Marketplace</span>
                    </div>
                    <div className="flex gap-1.5 mt-3 text-[9px] font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100">Search</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100">Site Visits</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100 text-blue-600 font-black">LOI & Leases</span>
                    </div>
                  </div>

                  {/* FM Services Marketplace Box */}
                  <div 
                    onClick={() => setSelectedArchNode("rfq")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedArchNode === "rfq" 
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                        <ClipboardList size={14} />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">FM Services Marketplace</span>
                    </div>
                    <div className="flex gap-1.5 mt-3 text-[9px] font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100">RFQ</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100">Bids Compare</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-100 text-indigo-600 font-black">Escrow Split</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Connector Arrow */}
              <div className="flex justify-center items-center py-1">
                <ArrowDown size={18} className="text-slate-300 animate-bounce" />
              </div>

              {/* Layer 2: Platform Core Engines */}
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">2. OFFICEX.PRO SaaS Core Platform Engine</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Workspace Box */}
                  <div 
                    onClick={() => setSelectedArchNode("lease")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedArchNode === "lease" || selectedArchNode === "property"
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Workspace Hub</span>
                    <span className="font-extrabold text-xs text-slate-900 block">Tenants & Space Rent Roll</span>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1">Multi-tenant isolation and lease rate tracking.</p>
                  </div>

                  {/* Operations Box */}
                  <div 
                    onClick={() => setSelectedArchNode("asset")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedArchNode === "asset" 
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Operations Hub</span>
                    <span className="font-extrabold text-xs text-slate-900 block">Asset PPM & SLA Tickets</span>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1">52-week preventive service logging & tickets.</p>
                  </div>

                  {/* Compliance Box */}
                  <div 
                    onClick={() => setSelectedArchNode("compliance")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedArchNode === "compliance" 
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Intelligence Hub</span>
                    <span className="font-extrabold text-xs text-slate-900 block">Compliance Alarms</span>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1">Countdown safety certifications, ESG & AI audits.</p>
                  </div>

                </div>
              </div>

              {/* Connector Arrow */}
              <div className="flex justify-center items-center py-1">
                <ArrowDown size={18} className="text-slate-300" />
              </div>

              {/* Layer 3: Centralized Database Shared Ecosystem */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-[#2563EB]">
                    <Database size={20} />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-widest block">Shared Data Ecosystem Store</span>
                    <h4 className="font-black text-xs text-white">One Master-Data Layer. Canonical Records.</h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Lock size={10} className="text-emerald-400" /> RBAC Boundaries
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <RefreshCw size={10} className="text-blue-400 animate-spin" /> Real-time Sync
                  </span>
                </div>
              </div>

            </div>

            {/* COLUMN 3: ECOSYSTEM DATA SCHEMA INSPECTOR */}
            <div className="flex flex-col gap-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-left">
              <div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2.5 py-1 uppercase tracking-wider">
                  {architectureNodes[selectedArchNode as keyof typeof architectureNodes].badge}
                </span>
                <h3 className="font-black text-slate-900 text-lg mt-3 flex items-center gap-2">
                  {React.createElement(architectureNodes[selectedArchNode as keyof typeof architectureNodes].icon, { size: 20, className: "text-[#2563EB]" })}
                  {architectureNodes[selectedArchNode as keyof typeof architectureNodes].title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3">
                  {architectureNodes[selectedArchNode as keyof typeof architectureNodes].desc}
                </p>
              </div>

              {/* Shared Database Fields */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Shared Database Schema Attributes</span>
                <div className="flex flex-wrap gap-1.5">
                  {architectureNodes[selectedArchNode as keyof typeof architectureNodes].fields.map((f, fIdx) => (
                    <span key={fIdx} className="px-2.5 py-1 rounded bg-slate-50 border border-slate-150 text-[10px] font-mono font-bold text-[#2563EB]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linked Downstream Applications */}
              <div className="border-t border-slate-100 pt-4 flex-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Connected Downstream Workflows</span>
                <ul className="flex flex-col gap-2">
                  {architectureNodes[selectedArchNode as keyof typeof architectureNodes].linkedModules.map((m, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">DEVELOPMENT RESOLUTION (P-01 to P-03)</span>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                  No separate databases. Property, Space, and Vendor profiles are created once inside the canonical master core and queried dynamically via relational schema linkages.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: THE PLATFORM BENTO GRID */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">One Operating System. Modular Design.</h2>
          <p className="text-slate-500 font-medium mt-4">Automate the complete property lifecycle using modular corporate SaaS blocks.</p>
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card A (2x2 span) */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl p-8 flex flex-col justify-between border border-slate-100 bg-gradient-to-br from-blue-50/50 to-white relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 rounded-full bg-blue-100/30 group-hover:scale-110 transition-transform"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB] mb-6">
                <Building size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">FM Services Marketplace</h3>
              <p className="text-slate-500 mt-3 max-w-md font-medium text-xs leading-relaxed">
                Post detailed service requirements, auto-match verified local agencies, compare quotations, and award work orders using standard contracts.
              </p>
              <ul className="grid grid-cols-2 gap-3 mt-6 text-xs text-slate-600 font-semibold">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> GSTIN Auto-Check</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Verified Escrow Splits</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Structured RFQ Builder</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> SLA Penalties Tracking</li>
              </ul>
            </div>
            <a href="/public/wizard" className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] mt-8 group-hover:gap-3 transition-all">
              Explore FM Procurement <ArrowRight size={14} />
            </a>
          </div>

          {/* Card B */}
          <div className="rounded-3xl p-8 border border-slate-100 flex flex-col justify-between bg-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Leasing CRM</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Qualify leads, coordinate property visits, negotiate LOIs, and calculate brokerage commission roll-ups.
              </p>
            </div>
            <a href="/leasing/pipeline" className="text-xs font-bold text-blue-600 mt-6 inline-flex items-center gap-1.5 hover:gap-2 transition-all">View CRM Workspace <ArrowRight size={13} /></a>
          </div>

          {/* Card C */}
          <div className="rounded-3xl p-8 border border-slate-100 flex flex-col justify-between bg-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Rent Roll Registry</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Centralize commercial rent rolls, track deposits, automate annual escalations, and log collections.
              </p>
            </div>
            <a href="/properties/rent-roll" className="text-xs font-bold text-indigo-600 mt-6 inline-flex items-center gap-1.5 hover:gap-2 transition-all">View Rent Rolls <ArrowRight size={13} /></a>
          </div>

          {/* Card D (2x1 span) */}
          <div className="md:col-span-2 rounded-3xl p-8 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white">
            <div className="max-w-md">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Operations & 52-Week PPM</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Conduct shift logger checklists, track technician attendance, schedule calendar actions, and monitor compliance NOCs.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">Fire NOC Active</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600">PPM Week 34</span>
            </div>
          </div>

          {/* Card E */}
          <div className="rounded-3xl p-8 border border-slate-100 bg-gradient-to-br from-indigo-50/30 to-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">AI Intelligence</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Generate board-ready summaries and analyze compliance gaps. Human-in-the-loop governance limits apply.
              </p>
            </div>
            <span className="inline-block mt-4 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 self-start">Observation Mode Active</span>
          </div>

        </div>
      </section>

      {/* SECTION 5: PIPELINE & PAYMENTS WORKFLOW */}
      <section id="workflow" className="py-20 bg-slate-50 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Verified Procurement & Secure Payouts
            </h2>
            <p className="text-slate-500 mt-4 max-w-md font-medium text-sm leading-relaxed">
              OfficeX secures transaction flows from posting an operational task to final vendor payout using a dedicated escrow mechanism.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] text-xs font-black shrink-0">1</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Post RFQ</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Specify manpower, materials, and target SLA schedules.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] text-xs font-black shrink-0">2</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Compare & Award</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Audit bids on cost, past reviews, and resource capability grids.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] text-xs font-black shrink-0">3</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Verify & Escrow Release</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Funds are released via split payouts after milestone review approval.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Razorpay Escrow Flow Graphic */}
          <div className="rounded-3xl p-8 border border-slate-100 bg-white shadow-lg relative overflow-hidden">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-[#2563EB]" />
              Razorpay Escrow Payment Pipeline
            </h3>
            
            <div className="flex flex-col gap-4 relative">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Client Payment</span>
                <span className="text-[#2563EB]">₹2,18,300</span>
              </div>
              <div className="h-6 flex justify-center items-center">
                <span className="h-full border-l border-dashed border-blue-300"></span>
              </div>
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Escrow Held (Razorpay Route)</span>
                <span className="text-indigo-600">Pending Verification</span>
              </div>
              <div className="h-6 flex justify-center items-center">
                <span className="h-full border-l border-dashed border-indigo-300"></span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Vendor Payout (90%)</div>
                  <div className="font-black text-slate-900 mt-1">₹1,96,470</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">OfficeX Fee (10%)</div>
                  <div className="font-black text-[#2563EB] mt-1">₹21,830</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: PRICING COMPARISON */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Flexible SaaS Pricing Plans</h2>
          <p className="text-slate-500 font-medium mt-4">Select the operational tier that aligns with your portfolio size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          <div className="rounded-3xl p-8 border border-slate-100 flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Starter</h3>
              <div className="text-4xl font-black text-slate-900 mt-4">Free</div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Core search and basic directory access.</p>
              <ul className="mt-8 flex flex-col gap-3 text-xs text-slate-600 font-bold">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Public Listing Directory</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Basic Property Search</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Standard Email Support</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer">
              Choose Plan
            </button>
          </div>

          <div className="rounded-3xl p-8 border-2 border-[#2563EB] flex flex-col justify-between bg-white relative shadow-xl scale-105">
            <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider">Most Popular</span>
            <div>
              <h3 className="font-bold text-[#2563EB] text-xs uppercase tracking-wider">Professional</h3>
              <div className="text-4xl font-black text-slate-900 mt-4">₹4,999<span className="text-xs font-semibold text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Advanced operational tools for active property managers.</p>
              <ul className="mt-8 flex flex-col gap-3 text-xs text-slate-600 font-bold">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Interactive RFQ Bidding Console</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> 52-Week PPM Maintenance Calendar</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Automated Escalation Rules (60/30/15d)</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Split Escrow payments (Razorpay Route)</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Priority Chat & SLA Support</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs mt-8 transition-colors cursor-pointer">
              Choose Plan
            </button>
          </div>

          <div className="rounded-3xl p-8 border border-slate-100 flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Enterprise</h3>
              <div className="text-4xl font-black text-slate-900 mt-4">Custom</div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Custom specifications for large property developers.</p>
              <ul className="mt-8 flex flex-col gap-3 text-xs text-slate-600 font-bold">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Unlimited Managed Properties</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Multi-region SLA Monitoring logs</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-[#2563EB]" /> Custom API Access</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer">
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-100 px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium mt-4">Find quick answers regarding our marketplace operations and SaaS tools.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
                <button 
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-xs">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${activeFAQ === idx ? "transform rotate-180 text-[#2563EB]" : ""}`} />
                </button>
                {activeFAQ === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-500 border-t border-slate-50 pt-4 leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: DARK FOOTER */}
      <footer className="bg-[#111827] text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-removebg-preview.png" 
                alt="OfficeX Logo" 
                width={30} 
                height={30} 
                className="object-contain filter brightness-0 invert"
              />
              <Image 
                src="/name-removebg-preview.png" 
                alt="OfficeX" 
                width={100} 
                height={20} 
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-2 font-semibold">
              India’s leading unified operating system for commercial real estate discoverability, transactions, and facility management.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Product</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
              <li><a href="#features" className="hover:text-white transition-colors">FM Marketplace</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Leasing CRM</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">PPM Scheduling</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Compliance Auditing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Newsletter</h4>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Subscribe to our monthly commercial real estate insights.</p>
            <div className="flex gap-2 mt-4">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="flex-1 px-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 focus:outline-none focus:border-[#2563EB] text-white placeholder-slate-500 font-semibold"
              />
              <button className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto w-full border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>&copy; 2026 OfficeX by Scalezix Ventures LLP. All rights reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

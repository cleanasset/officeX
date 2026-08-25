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
  X
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animateCount, setAnimateCount] = useState({
    sqft: 0,
    vendors: 0,
    gtv: 0,
    uptime: 0
  });

  // Numbers count-up simulation on page load
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
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
    if (activeSearchTab === 'space') {
      router.push(`/public/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/public/wizard`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLandingSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans overflow-x-hidden">
      
      {/* SECTION 1: FLOATING GLASS NAVBAR */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-white/95 backdrop-blur-md border border-gray-100 rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
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
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-primary-teal transition-colors">Solutions</a>
          <a href="#workflow" className="hover:text-primary-teal transition-colors">FM Marketplace</a>
          <a href="#pricing" className="hover:text-primary-teal transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-primary-teal transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-teal transition-colors">Sign In</a>
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-teal to-primary-light text-white text-xs font-semibold hover:scale-105 shadow-[0_4px_14px_rgba(15,123,111,0.3)] transition-all cursor-pointer"
          >
            Get Started Free
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600 hover:text-primary-teal" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-8 flex flex-col gap-6 md:hidden">
          <a href="#features" className="text-lg font-medium hover:text-primary-teal" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a href="#workflow" className="text-lg font-medium hover:text-primary-teal" onClick={() => setMobileMenuOpen(false)}>FM Marketplace</a>
          <a href="#pricing" className="text-lg font-medium hover:text-primary-teal" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#faq" className="text-lg font-medium hover:text-primary-teal" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <hr className="border-gray-200" />
          <a href="/login" className="text-lg font-medium hover:text-primary-teal" onClick={() => setMobileMenuOpen(false)}>Sign In</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-teal to-primary-light text-white font-semibold text-center shadow-lg cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      )}

      {/* SECTION 2: HERO & SHIFTING GRADIENT SEARCH */}
      <section className="pt-44 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-sky-50/30 to-background">
        
        {/* Floating Pulsing Badge */}
        <div className="animate-float mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-primary-teal shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-green"></span>
          Trusted by 450+ Indian Property Teams
        </div>

        <h1 className="text-center max-w-4xl text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          The Operating System for <br />
          <span className="bg-gradient-to-r from-primary-teal to-accent-blue bg-clip-text text-transparent">
            Commercial Workspaces
          </span>
        </h1>
        
        <p className="text-center max-w-2xl text-gray-500 mt-6 text-base md:text-lg">
          Unify lease registrations, compliance, work order procurement, and collections on India’s leading property operations platform.
        </p>

        {/* Dual Search Console Card */}
        <div className="w-full max-w-3xl mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setActiveSearchTab("space")}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeSearchTab === "space" 
                  ? "border-primary-teal text-primary-teal bg-white" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Find Office Space
            </button>
            <button 
              onClick={() => setActiveSearchTab("vendor")}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeSearchTab === "vendor" 
                  ? "border-primary-teal text-primary-teal bg-white" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Hire Facility Vendor
            </button>
          </div>

          <div className="p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeSearchTab === "space" ? "City or Micromarket (e.g. BKC Mumbai)" : "Service category (e.g. MEP, HVAC)"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-sm transition-colors"
                />
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
              <div className="w-full md:w-48">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-sm transition-colors">
                  <option>All Regions</option>
                  <option>Mumbai</option>
                  <option>Bengaluru</option>
                  <option>Pune</option>
                  <option>Chennai</option>
                  <option>Delhi NCR</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleLandingSearch}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-primary-teal hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Simulated Stats count-up row */}
        <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center border-t border-gray-100 pt-10">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-teal">{animateCount.sqft}M+</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Sq.Ft. Managed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-teal">{animateCount.vendors}+</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Verified FM Vendors</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-teal">₹{animateCount.gtv}Cr+</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Transaction GTV</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-teal">{animateCount.uptime}%</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">SLA Uptime</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE PLATFORM BENTO GRID */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Everything You Need. One Platform.</h2>
          <p className="text-gray-500 mt-4">Automate the complete property lifecycle using modular corporate SaaS blocks.</p>
        </div>

        {/* 3-column asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card A (2x2 span) */}
          <div className="md:col-span-2 md:row-span-2 premium-card p-8 flex flex-col justify-between border border-gray-100 bg-gradient-to-br from-teal-50/50 to-white relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 rounded-full bg-teal-100/30 group-hover:scale-110 transition-transform"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-primary-teal mb-6">
                <Building size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">FM Services Marketplace</h3>
              <p className="text-gray-500 mt-3 max-w-md">
                Post detailed service requirements, auto-match verified local agencies, compare quotations, and award work orders using standard contracts.
              </p>
              <ul className="grid grid-cols-2 gap-3 mt-6 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> GSTIN Auto-Check</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Verified Escrow Splits</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Structured RFQ Builder</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> SLA Penalties Tracking</li>
              </ul>
            </div>
            <a href="#workflow" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-teal mt-8 group-hover:gap-3 transition-all">
              Explore FM Procurement <ArrowRight size={16} />
            </a>
          </div>

          {/* Card B */}
          <div className="premium-card p-8 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Leasing CRM</h3>
              <p className="text-sm text-gray-500 mt-2">
                Qualify leads, coordinate property visits, negotiate LOIs, and calculate brokerage commission roll-ups.
              </p>
            </div>
            <a href="/login" className="text-sm font-semibold text-blue-600 mt-6 inline-flex items-center gap-1.5 hover:gap-2 transition-all">View CRM Workspace <ArrowRight size={14} /></a>
          </div>

          {/* Card C */}
          <div className="premium-card p-8 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Rent Roll Registry</h3>
              <p className="text-sm text-gray-500 mt-2">
                Centralize commercial rent rolls, track deposits, automate annual escalations, and log collections.
              </p>
            </div>
            <a href="/login" className="text-sm font-semibold text-purple-600 mt-6 inline-flex items-center gap-1.5 hover:gap-2 transition-all">View Rent Rolls <ArrowRight size={14} /></a>
          </div>

          {/* Card D (2x1 span) */}
          <div className="md:col-span-2 premium-card p-8 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Operations & 52-Week PPM</h3>
              <p className="text-sm text-gray-500 mt-2">
                Conduct shift logger checklists, track technician attendance, schedule calendar actions, and monitor compliance NOCs.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600">Fire NOC Active</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-600">PPM Week 34</span>
            </div>
          </div>

          {/* Card E */}
          <div className="premium-card p-8 border border-gray-100 bg-gradient-to-br from-indigo-50/30 to-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">AI Intelligence</h3>
              <p className="text-sm text-gray-500 mt-2">
                Generate board-ready summaries and analyze compliance gaps. Human-in-the-loop governance limits apply.
              </p>
            </div>
            <span className="inline-block mt-4 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 self-start">Observation Mode</span>
          </div>

        </div>
      </section>

      {/* SECTION 4: PIPELINE & PAYMENTS WORKFLOW */}
      <section id="workflow" className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Verified Procurement & Secure Payouts
            </h2>
            <p className="text-gray-500 mt-4 max-w-md">
              OfficeX secures transaction flows from posting an operational task to final vendor payout using a dedicated escrow mechanism.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-primary-teal text-xs font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900">Post RFQ</h4>
                  <p className="text-sm text-gray-500 mt-1">Specify manpower, materials, and target SLA schedules.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-primary-teal text-xs font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900">Compare & Award</h4>
                  <p className="text-sm text-gray-500 mt-1">Audit bids on cost, past reviews, and resource capability grids.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-primary-teal text-xs font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900">Verify & Escrow Release</h4>
                  <p className="text-sm text-gray-500 mt-1">Funds are released via split payouts after milestone review approval.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Razorpay Escrow Flow Graphic */}
          <div className="premium-card p-8 border border-gray-100 bg-white shadow-lg relative overflow-hidden">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-primary-teal" />
              Razorpay Escrow Payment Pipeline
            </h3>
            
            <div className="flex flex-col gap-4 relative">
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 flex justify-between items-center text-sm font-semibold">
                <span>Client Payment</span>
                <span className="text-primary-teal">₹2,18,300</span>
              </div>
              <div className="h-6 flex justify-center items-center">
                <span className="h-full border-l border-dashed border-teal-300"></span>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex justify-between items-center text-sm font-semibold">
                <span>Escrow Held (Razorpay Route)</span>
                <span className="text-blue-600">Pending Verification</span>
              </div>
              <div className="h-6 flex justify-center items-center">
                <span className="h-full border-l border-dashed border-teal-300"></span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center">
                  <div className="text-xs text-gray-400">Vendor Payout (90%)</div>
                  <div className="font-bold text-gray-900 mt-1">₹1,96,470</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center">
                  <div className="text-xs text-gray-400">OfficeX Fee (10%)</div>
                  <div className="font-bold text-primary-teal mt-1">₹21,830</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: PRICING COMPARISON */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Flexible SaaS Pricing Plans</h2>
          <p className="text-gray-500 mt-4">Select the operational tier that aligns with your portfolio size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          <div className="premium-card p-8 border border-gray-100 flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Starter</h3>
              <div className="text-4xl font-extrabold text-gray-900 mt-4">Free</div>
              <p className="text-sm text-gray-500 mt-2">Core search and basic directory access.</p>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Public Listing Directory</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Basic Property Search</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Standard Email Support</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm mt-8 hover:bg-gray-50 transition-colors">
              Choose Plan
            </button>
          </div>

          <div className="premium-card p-8 border-2 border-primary-teal flex flex-col justify-between bg-white relative shadow-xl scale-105">
            <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-primary-teal text-white text-xs font-bold uppercase tracking-wider">Most Popular</span>
            <div>
              <h3 className="font-bold text-primary-teal text-sm uppercase tracking-wider">Professional</h3>
              <div className="text-4xl font-extrabold text-gray-900 mt-4">₹4,999<span className="text-sm font-medium text-gray-400">/mo</span></div>
              <p className="text-sm text-gray-500 mt-2">Advanced operational tools for active property managers.</p>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Interactive RFQ Bidding Console</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> 52-Week PPM Maintenance Calendar</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Automated Escalation Rules (60/30/15d)</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Split Escrow payments (Razorpay Route)</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Priority Chat & SLA Support</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl bg-primary-teal text-white font-semibold text-sm mt-8 hover:bg-teal-700 transition-colors">
              Choose Plan
            </button>
          </div>

          <div className="premium-card p-8 border border-gray-100 flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Enterprise</h3>
              <div className="text-4xl font-extrabold text-gray-900 mt-4">Custom</div>
              <p className="text-sm text-gray-500 mt-2">Custom specifications for large property developers.</p>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Unlimited Managed Properties</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Multi-region SLA Monitoring logs</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-teal" /> Custom API Access</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm mt-8 hover:bg-gray-50 transition-colors">
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION */}
      <section id="faq" className="py-20 bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-4">Find quick answers regarding our marketplace operations and SaaS tools.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between font-bold text-gray-900 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeFAQ === idx ? "transform rotate-180 text-primary-teal" : ""}`} />
                </button>
                {activeFAQ === idx && (
                  <div className="px-6 pb-5 text-sm text-gray-500 border-t border-gray-50 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: DARK FOOTER */}
      <footer className="bg-[#111827] text-white py-16 px-6 border-t border-gray-800">
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
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              India’s leading unified operating system for commercial real estate discoverability, transactions, and facility management.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Product</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">FM Marketplace</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Leasing CRM</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">PPM Scheduling</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Compliance Auditing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Newsletter</h4>
            <p className="text-sm text-gray-400 mt-2">Subscribe to our monthly commercial real estate insights.</p>
            <div className="flex gap-2 mt-4">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="flex-1 px-4 py-2 text-xs rounded-lg border border-gray-700 bg-gray-800 focus:outline-none focus:border-primary-teal text-white placeholder-gray-500"
              />
              <button className="px-4 py-2 rounded-lg bg-primary-teal text-white font-semibold text-xs hover:bg-teal-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto w-full border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <span>&copy; 2025 OfficeX by Scalezix Ventures LLP. All rights reserved.</span>
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

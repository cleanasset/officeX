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
  RefreshCw,
  MapPin,
  Map,
  Cpu,
  Star,
  Award,
  HelpCircle,
  Wrench
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<"space" | "vendor">("space");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(0);

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
    } else {
      router.push(
        `/public/wizard?category=${encodeURIComponent(vendorCategory)}&city=${encodeURIComponent(vendorCity)}&budget=${encodeURIComponent(vendorBudget)}&type=${encodeURIComponent(vendorType)}`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLandingSearch();
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
      
      {/* SECTION 1: FLOATING GLASS NAVBAR (OFFICEX Theme Teal accents) */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-white/90 backdrop-blur-md border border-[#DFE4E1] rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
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
          <a href="#features" className="hover:text-[#0F8B7D] transition-colors">Solutions</a>
          <a href="#workflow" className="hover:text-[#0F8B7D] transition-colors">Marketplace</a>
          <a href="#pricing" className="hover:text-[#0F8B7D] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#0F8B7D] transition-colors">About</a>
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
        <button className="md:hidden text-slate-600 hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-8 flex flex-col gap-6 md:hidden">
          <a href="#features" className="text-lg font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a href="#workflow" className="text-lg font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>Marketplace</a>
          <a href="#pricing" className="text-lg font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#faq" className="text-lg font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>About</a>
          <hr className="border-[#DFE4E1]" />
          <a href="/login" className="text-lg font-bold hover:text-[#0F8B7D]" onClick={() => setMobileMenuOpen(false)}>Sign In</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-full bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer"
          >
            Get Started
          </button>
        </div>
      )}

      {/* SECTION 2: HERO & SHIFTING GRADIENT SEARCH (Figma exact gradient: #9CCAE2 -> #91BBE5) */}
      <section className="pt-40 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#9CCAE2] via-[#97C4E5] to-[#91BBE5]">
        
        {/* Floating Pulsing Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-white/90 text-xs font-bold text-[#0D7A6E] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Trusted by 450+ Teams
        </div>

        <h1 className="text-center max-w-4xl text-4xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
          The Operating System for <br />
          <span className="text-[#0F8B7D] drop-shadow-xs">
            Commercial Workspaces
          </span>
        </h1>
        
        <p className="text-center max-w-3xl text-slate-800 mt-6 text-sm md:text-base font-semibold leading-relaxed">
          Streamline leasing, vendor procurement, and facility operations in one unified platform designed for modern institutional real estate.
        </p>

        {/* Option-3 Dual-Entry Proposition Search Card */}
        <div className="w-full max-w-4xl mt-12 bg-white rounded-2xl shadow-2xl border border-[#DFE4E1] overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => setActiveSearchTab("space")}
              className={`flex-1 py-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeSearchTab === "space" 
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Building size={14} />
              Find Office Space
            </button>
            <button 
              onClick={() => setActiveSearchTab("vendor")}
              className={`flex-1 py-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeSearchTab === "vendor" 
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Wrench size={14} />
              Hire FM Vendor
            </button>
          </div>

          <div className="p-6">
            {activeSearchTab === "space" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><MapPin size={16} /></span>
                  <select 
                    value={spaceCity}
                    onChange={(e) => setSpaceCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai (BKC)</option>
                    <option value="Bengaluru">Bengaluru (Whitefield)</option>
                    <option value="Pune">Pune (Hinjewadi)</option>
                    <option value="Ahmedabad">Ahmedabad (Nikol)</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400"><Map size={15} /></span>
                  <input 
                    type="text" 
                    value={spaceArea}
                    onChange={(e) => setSpaceArea(e.target.value)}
                    placeholder="Area / Micromarket"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-semibold"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><DollarSign size={16} className="text-slate-400" /></span>
                  <select 
                    value={spaceBudget}
                    onChange={(e) => setSpaceBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="All Ranges">Budget Range (All)</option>
                    <option value="Below ₹1L">Below ₹1 Lakh/mo</option>
                    <option value="₹1L - ₹5L">₹1L - ₹5 Lakh/mo</option>
                    <option value="₹5L - ₹15L">₹5L - ₹15 Lakh/mo</option>
                    <option value="Above ₹15L">Above ₹15 Lakh/mo</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Building size={16} /></span>
                  <select 
                    value={spaceGrade}
                    onChange={(e) => setSpaceGrade(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="All Grades">Building Grade (All)</option>
                    <option value="Grade A">Grade A Premium</option>
                    <option value="Grade B">Grade B Standard</option>
                    <option value="Co-Working">Coworking Space</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><SlidersHorizontal size={16} /></span>
                  <select 
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="HVAC Maintenance">HVAC Maintenance</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Electrical Auditing">Electrical Auditing</option>
                    <option value="Statutory NOC Support">Statutory NOC Support</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><MapPin size={16} /></span>
                  <select 
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><DollarSign size={16} /></span>
                  <select 
                    value={vendorBudget}
                    onChange={(e) => setVendorBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="All Budgets">Budget Estimate (All)</option>
                    <option value="Under ₹50k">Under ₹50,000</option>
                    <option value="₹50k - ₹2L">₹50,000 - ₹2 Lakhs</option>
                    <option value="₹2L - ₹10L">₹2 Lakhs - ₹10 Lakhs</option>
                    <option value="Above ₹10L">Above ₹10 Lakhs</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Building size={16} /></span>
                  <select 
                    value={vendorType}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DFE4E1] focus:outline-none focus:border-[#0F8B7D] text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="Commercial Office">Commercial Office</option>
                    <option value="IT Park Campus">IT Park Campus</option>
                    <option value="Retail Mall">Retail Mall</option>
                    <option value="Industrial Warehouse">Industrial Warehouse</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button 
                onClick={handleLandingSearch}
                className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Partner Logo Ribbon */}
        <div className="w-full max-w-4xl mt-14 py-4 px-6 bg-white/30 backdrop-blur-xs flex items-center justify-around flex-wrap gap-8 text-xs font-black text-slate-800 uppercase tracking-widest border-y border-[#DFE4E1]">
          <span className="hover:text-slate-900 transition-colors">TCS</span>
          <span className="hover:text-slate-900 transition-colors">WIPRO</span>
          <span className="hover:text-slate-900 transition-colors">INFOSYS</span>
          <span className="hover:text-slate-900 transition-colors">DLF</span>
          <span className="hover:text-slate-900 transition-colors">EMBASSY</span>
        </div>

        {/* Simulated Stats count-up row */}
        <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center border-t border-[#DFE4E1] pt-10">
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-950">{animateCount.sqft}M+</div>
            <div className="text-xs text-slate-700 font-bold uppercase tracking-wider mt-1">Sqft Managed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-950">{animateCount.vendors}+</div>
            <div className="text-xs text-slate-700 font-bold uppercase tracking-wider mt-1">Verified Vendors</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-950">₹{animateCount.gtv}Cr+</div>
            <div className="text-xs text-slate-700 font-bold uppercase tracking-wider mt-1">GTV Processed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-950">{animateCount.uptime}%</div>
            <div className="text-xs text-slate-700 font-bold uppercase tracking-wider mt-1">System Uptime</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EVERYTHING YOU NEED, ONE PLATFORM (Bento Grid - Background exact #F6FAF9) */}
      <section id="features" className="py-20 bg-[#F6FAF9] border-t border-b border-[#DFE4E1] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Everything You Need. One Platform.</h2>
            <p className="text-slate-500 font-medium text-sm mt-3">Unify lease operations, compliance, work order procurement, and maintenance calendars in one dashboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: FM Marketplace, Operations Calendar, Cost Analytics (col-span-2) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Card A: FM Marketplace (col-span-2 equivalent inside) */}
              <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 rounded-full bg-emerald-50/30 group-hover:scale-110 transition-transform"></div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">FM Marketplace</h3>
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
                
                <a href="/public/wizard" className="inline-flex items-center gap-2 text-xs font-bold text-[#0F8B7D] mt-8 hover:gap-3 transition-all cursor-pointer">
                  Explore Vendors <ArrowRight size={14} />
                </a>
              </div>

              {/* Card B: Operations Calendar */}
              <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Operations Calendar</h3>
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

                <a href="/ops" className="inline-flex items-center gap-2 text-xs font-bold text-[#0F8B7D] mt-8 hover:gap-3 transition-all cursor-pointer">
                  View Schedule <ChevronRight size={14} />
                </a>
              </div>

              {/* Card C: Cost Analytics */}
              <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-extrabold text-slate-900">Cost Analytics</h3>
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
              </div>

            </div>

            {/* RIGHT COLUMN: Leasing CRM, Compliance Tracking, AI Automation */}
            <div className="flex flex-col gap-8">
              
              {/* Card D: Leasing CRM */}
              <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between h-[250px] relative overflow-hidden group">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Leasing CRM</h3>
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

                <a href="/leasing/pipeline" className="text-xs font-bold text-[#0F8B7D] mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                  View Leads <ArrowRight size={13} />
                </a>
              </div>

              {/* Card E: Compliance Tracking */}
              <div className="rounded-3xl p-6 md:p-8 border border-[#DFE4E1] bg-white shadow-xs flex flex-col justify-between h-[250px] relative overflow-hidden">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Compliance Tracking</h3>
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

                <span className="text-[10px] text-slate-400 font-bold block mt-3">Auto-updates active</span>
              </div>

              {/* Card F: AI Automation */}
              <div className="rounded-3xl p-6 md:p-8 bg-slate-900 text-white shadow-xs flex flex-col justify-between h-[220px] relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 rounded-full bg-emerald-500/10 group-hover:scale-110 transition-transform"></div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black tracking-widest uppercase">COMING SOON</span>
                    <Cpu size={18} className="text-emerald-400 animate-pulse" />
                  </div>
                  
                  <h3 className="text-base font-extrabold text-white mt-4">AI Automation</h3>
                  <p className="text-slate-400 mt-2 font-medium text-xs leading-relaxed">
                    Smart contract extraction & anomaly detection.
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-bold">Observation mode pre-active</div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: PIPELINE & PAYMENTS WORKFLOW (Background exact #F0F3F8) */}
      <section id="workflow" className="py-20 bg-[#F0F3F8] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Timeline info */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                From Procurement to Payment — Secure & Verified
              </h2>
              <p className="text-slate-500 mt-4 max-w-md font-medium text-sm leading-relaxed">
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

            {/* Escrow flow visualizer */}
            <div className="rounded-3xl p-8 border border-[#DFE4E1] bg-white shadow-md relative overflow-hidden">
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

      {/* SECTION 5: PRICING PLANS (Background exact #F6FAF9) */}
      <section id="pricing" className="py-20 bg-[#F6FAF9] border-t border-b border-[#DFE4E1] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transparent Pricing for Every Scale</h2>
            <p className="text-slate-500 font-medium text-sm mt-3">Choose the right plan to manage and secure your operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Plan 1: Starter */}
            <div className="rounded-3xl p-8 border border-[#DFE4E1] bg-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
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
              <button className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer">
                Sign Up
              </button>
            </div>

            {/* Plan 2: Professional */}
            <div className="rounded-3xl p-8 border-2 border-[#0F8B7D] bg-white flex flex-col justify-between relative shadow-xl scale-105">
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
                onClick={() => router.push('/public/wizard')}
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
              <button className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs mt-8 hover:bg-slate-50 transition-colors cursor-pointer">
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION (Background exact #F6FAF9) */}
      <section id="faq" className="py-20 bg-[#F6FAF9] px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium text-sm mt-3">Find clear answers about vendor operations, billing security, and integrations.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#DFE4E1] overflow-hidden shadow-xs">
                <button 
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-xs md:text-sm font-extrabold text-slate-800">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${activeFAQ === idx ? "transform rotate-180 text-[#0F8B7D]" : ""}`} />
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

      {/* SECTION 7: DARK FOOTER (Background exact #111828) */}
      <footer className="bg-[#111828] text-white py-16 px-6 border-t border-slate-850">
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
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
              <li><a href="#features" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Compliance</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Stay Updated</h4>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Subscribe to our newsletter for insights on commercial real estate tech.</p>
            <div className="flex gap-2 mt-4 max-w-md">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 focus:outline-none focus:border-[#0F8B7D] text-white placeholder-slate-500 font-semibold"
              />
              <button className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0D7A6E] transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto w-full border-t border-slate-800/60 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>&copy; 2024 OfficeX. All rights reserved. Built for institutional real estate.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Compliance NOC</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

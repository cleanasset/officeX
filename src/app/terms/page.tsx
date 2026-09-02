"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  Printer, 
  ChevronRight, 
  Building, 
  Scale, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

export default function TermsOfServicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms & Scope",
      icon: Scale,
      content: `Welcome to OfficeX ("Platform", "we", "us", or "our"), operated by Scalezix Ventures LLP. By accessing or using the OfficeX platform, website, web applications, or related mobile dashboards (collectively, the "Services"), you ("User", "Entity", "Landlord", "Tenant", or "Vendor") agree to be legally bound by these Terms of Service ("Terms").

OfficeX is a commercial real estate operating system and facility management suite built to facilitate office space discovery, leasing transactions, statutory compliance tracking, vendor procurement, and facility maintenance across commercial properties in India.`
    },
    {
      id: "registration",
      title: "2. Corporate Account & GSTIN Validation",
      icon: Building,
      content: `To utilize institutional features on OfficeX, users must register an organizational account. 

• Verification Mandate: All corporate tenant profiles, landlord accounts, and facility management (FM) vendor entities must undergo statutory legal verification, including GSTIN auto-validation against official databases, PAN verification, and corporate registration certificate auditing.
• Account Security: You are responsible for maintaining the confidentiality of your access credentials and role-based access control (RBAC) permissions. Any activity conducted under your corporate domain shall be deemed authorized by your organization.
• Accuracy Guarantee: Users guarantee that all information supplied—including sqft inventory, seating capacity, utility specs, lease rates, and contractor capabilities—is accurate and up to date.`
    },
    {
      id: "listings",
      title: "3. Property Listings & Brokerage Rules",
      icon: FileText,
      content: `Landlords, developers, and authorized leasing brokers publishing listings on OfficeX must adhere to the following rules:

• Listing Authenticity: Every property listing published on the Platform must represent genuine, available commercial space with valid Occupation Certificates (OC) and statutory Fire Safety NOC certifications.
• Pricing Transparency: Published rental rates (₹/sqft/month), CAM charges, security deposit terms, and lock-in periods must reflect true commercial terms without hidden surcharges.
• Commission & Brokerage Settlement: Commission calculations are derived from Total Contract Value (TCV) or fixed monthly rent multiples as agreed upon deal award. All invoice settlements are logged and verified via platform payment settlement channels.`
    },
    {
      id: "escrow",
      title: "4. FM Bidding & 90/10 Escrow Payments",
      icon: DollarSign,
      content: `OfficeX operates a structured procurement marketplace for Hard FM (MEP, HVAC, DG Sets) and Soft FM (cleaning, security, pest control) services under a secured escrow framework:

• Razorpay Escrow Nodal Account: When a work order (WO) or service contract is awarded, the client deposits 100% of the agreed contract value into the Razorpay Escrow Nodal Account.
• 90/10 Fund Release Model: Upon verified sign-off of contract milestones by the property facility team, 90% of funds are automatically disbursed to the vendor's bank account, and 10% platform facilitation fee is retained by OfficeX.
• Milestone Sign-Off: Funds will not be disbursed without verified milestone sign-off by the property manager or authorized representative on the Platform.`
    },
    {
      id: "sla",
      title: "5. Service SLAs & Dispute Arbitration",
      icon: Clock,
      content: `Facility contractors must adhere to the response and resolution SLAs defined in awarded work orders.

• SLA Non-Compliance: Repeated failure to meet emergency response timelines (e.g., HVAC failure within 2 hours) or PPM maintenance schedules may result in penalty deductions from milestone escrow releases.
• Arbitration & Dispute Escalation: If a client or vendor disputes work order completion or quality, the escrow funds remain locked while the OfficeX Independent Arbitration Panel reviews audit logs, daily rosters, and site photos. The panel's decision on fund distribution shall be final and binding.`
    },
    {
      id: "compliance",
      title: "6. Statutory Compliance & Labor Mandates",
      icon: ShieldCheck,
      content: `Facility vendors and property managers are strictly required to enforce all statutory workplace laws:

• Labor Laws & Minimum Wages: Vendors must comply with the Minimum Wages Act, ESI (Employees' State Insurance), and EPF (Employees' Provident Fund) filings for deployed manpower.
• Environmental & Safety NOCs: Property teams must maintain active Fire Safety NOCs (Form B), Elevator Inspectorate licenses, and PCB consent to operate. OfficeX reserves the right to suspend listings for buildings with expired statutory approvals.`
    },
    {
      id: "intellectual",
      title: "7. Intellectual Property & Data Rights",
      icon: Scale,
      content: `• Platform IP: All software, UI/UX designs, database architectures, machine learning models, and trademarks belong exclusively to Scalezix Ventures LLP.
• User Data Ownership: Property management metrics, rent roll ledgers, and visitor logs generated by your organization remain your confidential property. OfficeX is granted a non-exclusive license to process such data to deliver the Services.`
    },
    {
      id: "liability",
      title: "8. Limitation of Liability & Indemnity",
      icon: AlertCircle,
      content: `To the maximum extent permitted by applicable Indian law, OfficeX shall not be liable for any indirect, incidental, or consequential damages resulting from physical property downtime, vendor service delays, or third-party utility disruptions.

Users agree to indemnify and hold harmless Scalezix Ventures LLP against any claims arising from fraudulent property representations, breach of statutory labor compliance by contractors, or violation of third-party IP.`
    },
    {
      id: "governing",
      title: "9. Governing Law & Jurisdiction",
      icon: Scale,
      content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of India.

Any legal dispute, suit, or proceeding arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra or GIFT City (Gujarat International Finance Tec-City), India.`
    },
    {
      id: "termination",
      title: "10. Account Termination & Revisions",
      icon: CheckCircle2,
      content: `OfficeX reserves the right to modify these Terms at any time by posting updated versions on the Platform. Continued use of the Services following modifications constitutes acceptance of the revised Terms.

Either party may terminate account subscription with 30 days written notice, provided all outstanding escrow balances and statutory work orders are fully settled.`
    }
  ];

  // Scroll-spy: Track scroll inside the right content container
  useEffect(() => {
    const container = document.getElementById("terms-right-panel");
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      for (const sec of sections) {
        const element = document.getElementById(sec.id);
        if (element) {
          const top = element.offsetTop - 120;
          const height = element.offsetHeight;
          if (scrollTop >= top && scrollTop < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const container = document.getElementById("terms-right-panel");
    const element = document.getElementById(id);
    if (container && element) {
      const topPos = element.offsetTop - 20;
      container.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Fixed Top Bar (h-14 shrink-0) */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-removebg-preview.png" alt="OfficeX" width={28} height={28} />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={90} height={18} />
          </Link>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Terms of Service</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <Link 
            href="/"
            className="px-4 py-1.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
          >
            <ArrowLeft size={13} /> Back Home
          </Link>
        </div>
      </header>

      {/* Main Split Layout: Left Side Panel is 100% Stationary; ONLY Right Panel Scrolls */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: 100% STATIONARY FIXED SIDEBAR (NEVER SCROLLS WITH DOCUMENT) */}
        <aside className="w-80 h-full bg-white border-r border-slate-200/90 p-5 shrink-0 flex flex-col justify-between overflow-y-auto hidden md:flex shadow-2xs z-20">
          <div>
            {/* Header Title & Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B7D] animate-pulse"></span>
                <span>Table of Contents</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[#0F8B7D] text-[10px] font-black">
                {filteredSections.length} Clauses
              </span>
            </div>

            {/* Filter Search Field */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter clauses..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#0F8B7D] font-semibold transition-all"
              />
            </div>

            {/* Clauses Jump Navigation */}
            <nav className="flex flex-col gap-1.5 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filteredSections.map((sec, idx) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleNavClick(sec.id)}
                    className={`group w-full px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between text-left cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] text-white font-black shadow-md" 
                        : "text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate">{sec.title.split('. ')[1] || sec.title}</span>
                    </span>
                    <ChevronRight size={13} className={`shrink-0 transition-transform ${isActive ? "text-white translate-x-0.5" : "opacity-0 group-hover:opacity-100 text-slate-400"}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Footer Links in Left Panel */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-1 text-xs font-bold">
            <Link 
              href="/privacy" 
              className="px-3 py-2 rounded-xl text-[#0F8B7D] hover:bg-[#0F8B7D]/5 flex items-center justify-between transition-colors"
            >
              <span>Privacy Policy</span>
              <ChevronRight size={13} />
            </Link>
            <Link 
              href="/compliance" 
              className="px-3 py-2 rounded-xl text-[#0F8B7D] hover:bg-[#0F8B7D]/5 flex items-center justify-between transition-colors"
            >
              <span>Statutory Compliance</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </aside>

        {/* RIGHT PANEL: INDEPENDENT SCROLLING CONTAINER (ONLY THIS RIGHT SIDE MOVES) */}
        <main id="terms-right-panel" className="flex-1 h-full overflow-y-auto scroll-smooth bg-slate-50">
          
          {/* Terms Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#0F8B7D]/90 text-white py-10 px-6 md:px-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold mb-3">
                <ShieldCheck size={14} />
                <span>Legal Governance Framework v3.1</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Terms of Service</h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-2 font-medium leading-relaxed">
                Please read these terms carefully before using OfficeX commercial real estate operating system, marketplace bidding engine, and property management portals.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-300 font-semibold border-t border-white/10 pt-3">
                <span>Last Revised: September 2, 2026</span>
                <span>•</span>
                <span>Jurisdiction: Republic of India (Mumbai & GIFT City)</span>
                <span>•</span>
                <span>Razorpay Escrow Approved</span>
              </div>
            </div>
          </div>

          {/* Clauses Content */}
          <div className="max-w-4xl px-6 md:px-10 py-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <AlertCircle size={36} className="mx-auto text-amber-500 mb-3" />
                <h3 className="text-base font-extrabold text-slate-800">No matching terms found</h3>
                <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "escrow", "GSTIN", "brokerage", or "arbitration".</p>
              </div>
            ) : (
              filteredSections.map((sec) => {
                const IconComponent = sec.icon;
                return (
                  <div 
                    key={sec.id} 
                    id={sec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 text-[#0F8B7D] flex items-center justify-center font-bold">
                        <IconComponent size={20} />
                      </div>
                      <h2 className="text-lg font-black text-slate-900">{sec.title}</h2>
                    </div>

                    <div className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
                      {sec.content}
                    </div>
                  </div>
                );
              })
            )}

            {/* Need Legal Clarification Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#0F8B7D]" /> Need Legal Clarification?
                </h3>
                <p className="text-xs text-emerald-800 mt-1 font-medium max-w-lg">
                  Our institutional compliance team is available to assist enterprise property funds, developers, and facility contractors with customized master service agreements (MSAs).
                </p>
              </div>
              <Link 
                href="/support"
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm transition-colors shrink-0"
              >
                Contact Legal Desk
              </Link>
            </div>

            {/* Footer inside scrolling right panel */}
            <div className="-mx-6 md:-mx-10 -mb-8 pt-8">
              <Footer />
            </div>
          </div>

        </main>

      </div>

    </div>
  );
}

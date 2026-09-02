"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  FileText, ShieldCheck, Search, Printer, ChevronRight, Building, 
  Scale, DollarSign, Clock, AlertCircle, CheckCircle2, ArrowLeft,
  Lock, HelpCircle
} from "lucide-react";

const sections = [
  { 
    id: "acceptance", 
    title: "1. Acceptance of Terms & Scope", 
    icon: Scale,
    content: `Welcome to OfficeX ("Platform", "we", "us", or "our"), operated by Scalezix Ventures LLP. By accessing or using the OfficeX platform, website, web applications, or related mobile dashboards (collectively, the "Services"), you ("User", "Entity", "Landlord", "Tenant", or "Vendor") agree to be legally bound by these Terms of Service ("Terms").\n\nOfficeX is a commercial real estate operating system and facility management suite built to facilitate office space discovery, leasing transactions, statutory compliance tracking, vendor procurement, and facility maintenance across commercial properties in India.` 
  },
  { 
    id: "registration", 
    title: "2. Corporate Account & GSTIN Validation", 
    icon: Building,
    content: `To utilize institutional features on OfficeX, users must register an organizational account.\n\n• Verification Mandate: All corporate tenant profiles, landlord accounts, and facility management (FM) vendor entities must undergo statutory legal verification, including GSTIN auto-validation against official databases, PAN verification, and corporate registration certificate auditing.\n• Account Security: You are responsible for maintaining the confidentiality of your access credentials and role-based access control (RBAC) permissions. Any activity conducted under your corporate domain shall be deemed authorized by your organization.\n• Accuracy Guarantee: Users guarantee that all information supplied—including sqft inventory, seating capacity, utility specs, lease rates, and contractor capabilities—is accurate and up to date.` 
  },
  { 
    id: "listings", 
    title: "3. Property Listings & Brokerage Rules", 
    icon: FileText,
    content: `Landlords, developers, and authorized leasing brokers publishing listings on OfficeX must adhere to the following rules:\n\n• Listing Authenticity: Every property listing published on the Platform must represent genuine, available commercial space with valid Occupation Certificates (OC) and statutory Fire Safety NOC certifications.\n• Pricing Transparency: Published rental rates (₹/sqft/month), CAM charges, security deposit terms, and lock-in periods must reflect true commercial terms without hidden surcharges.\n• Commission & Brokerage Settlement: Commission calculations are derived from Total Contract Value (TCV) or fixed monthly rent multiples as agreed upon deal award. All invoice settlements are logged and verified via platform payment settlement channels.` 
  },
  { 
    id: "escrow", 
    title: "4. FM Bidding & 90/10 Escrow Payments", 
    icon: DollarSign,
    content: `OfficeX operates a structured procurement marketplace for Hard FM (MEP, HVAC, DG Sets) and Soft FM (cleaning, security, pest control) services under a secured escrow framework:\n\n• Razorpay Escrow Nodal Account: When a work order (WO) or service contract is awarded, the client deposits 100% of the agreed contract value into the Razorpay Escrow Nodal Account.\n• 90/10 Fund Release Model: Upon verified sign-off of contract milestones by the property facility team, 90% of funds are automatically disbursed to the vendor's bank account, and 10% platform facilitation fee is retained by OfficeX.\n• Milestone Sign-Off: Funds will not be disbursed without verified milestone sign-off by the property manager or authorized representative on the Platform.` 
  },
  { 
    id: "sla", 
    title: "5. Service SLAs & Dispute Arbitration", 
    icon: Clock,
    content: `Facility contractors must adhere to the response and resolution SLAs defined in awarded work orders.\n\n• SLA Non-Compliance: Repeated failure to meet emergency response timelines (e.g., HVAC failure within 2 hours) or PPM maintenance schedules may result in penalty deductions from milestone escrow releases.\n• Arbitration & Dispute Escalation: If a client or vendor disputes work order completion or quality, the escrow funds remain locked while the OfficeX Independent Arbitration Panel reviews audit logs, daily rosters, and site photos. The panel's decision on fund distribution shall be final and binding.` 
  },
  { 
    id: "compliance", 
    title: "6. Statutory Compliance & Labor Mandates", 
    icon: ShieldCheck,
    content: `Facility vendors and property managers are strictly required to enforce all statutory workplace laws:\n\n• Labor Laws & Minimum Wages: Vendors must comply with the Minimum Wages Act, ESI (Employees' State Insurance), and EPF (Employees' Provident Fund) filings for deployed manpower.\n• Environmental & Safety NOCs: Property teams must maintain active Fire Safety NOCs (Form B), Elevator Inspectorate licenses, and PCB consent to operate. OfficeX reserves the right to suspend listings for buildings with expired statutory approvals.` 
  },
  { 
    id: "intellectual", 
    title: "7. Intellectual Property & Data Rights", 
    icon: Scale,
    content: `• Platform IP: All software, UI/UX designs, database architectures, machine learning models, and trademarks belong exclusively to Scalezix Ventures LLP.\n• User Data Ownership: Property management metrics, rent roll ledgers, and visitor logs generated by your organization remain your confidential property. OfficeX is granted a non-exclusive license to process such data to deliver the Services.` 
  },
  { 
    id: "liability", 
    title: "8. Limitation of Liability & Indemnity", 
    icon: AlertCircle,
    content: `To the maximum extent permitted by applicable Indian law, OfficeX shall not be liable for any indirect, incidental, or consequential damages resulting from physical property downtime, vendor service delays, or third-party utility disruptions.\n\nUsers agree to indemnify and hold harmless Scalezix Ventures LLP against any claims arising from fraudulent property representations, breach of statutory labor compliance by contractors, or violation of third-party IP.` 
  },
  { 
    id: "governing", 
    title: "9. Governing Law & Jurisdiction", 
    icon: Scale,
    content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of India.\n\nAny legal dispute, suit, or proceeding arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra or GIFT City (Gujarat International Finance Tec-City), India.` 
  },
  { 
    id: "termination", 
    title: "10. Account Termination & Revisions", 
    icon: CheckCircle2,
    content: `OfficeX reserves the right to modify these Terms at any time by posting updated versions on the Platform. Continued use of the Services following modifications constitutes acceptance of the revised Terms.\n\nEither party may terminate account subscription with 30 days written notice, provided all outstanding escrow balances and statutory work orders are fully settled.` 
  }
];

export default function TermsOfServicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { 
        root: container, 
        rootMargin: "-10% 0px -70% 0px", 
        threshold: 0 
      }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavClick = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-slate-50 text-slate-900 font-sans">

      {/* Top Navbar Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 h-14 px-4 md:px-8 flex items-center justify-between z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-removebg-preview.png" alt="OfficeX" width={28} height={28} />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={90} height={18} />
          </Link>
          <span className="text-slate-300 font-light hidden sm:inline">|</span>
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider hidden sm:inline">Terms of Service</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()} 
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={13} /><span className="hidden sm:inline">Print</span>
          </button>
          <Link 
            href="/" 
            className="px-3.5 py-1.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
          >
            <ArrowLeft size={13} /> Home
          </Link>
        </div>
      </header>

      {/* Upper Heading / Hero Banner */}
      <div className="shrink-0 relative border-b border-slate-200 bg-white px-4 md:px-8 py-5 md:py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[11px] uppercase tracking-widest text-[#0F8B7D] font-bold">
              <ShieldCheck size={14} /> Legal Documentation
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Terms of <span className="text-[#0F8B7D]">Service</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock size={13} className="text-[#0F8B7D]" />
              <span>Effective Date: September 2, 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Jurisdiction: India (Mumbai & GIFT City)
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Pill Bar (visible on mobile only) */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shadow-sm">
        {filtered.map((sec, idx) => (
          <button 
            key={sec.id} 
            onClick={() => handleNavClick(sec.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
              activeSection === sec.id ? "bg-[#0F8B7D] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {idx + 1}. {sec.title.split('. ')[1]}
          </button>
        ))}
      </div>

      {/* Main Split Layout: Fixed Left Panel + Scrolling Right Content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden w-full max-w-7xl mx-auto bg-white border-x border-slate-200/70 shadow-xs">

        {/* Left Stationary Sidebar (Spans full height between upper heading & bottom, does not move) */}
        <aside className="hidden lg:flex flex-col justify-between w-72 xl:w-80 shrink-0 h-full border-r border-slate-200 bg-slate-50/70 p-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
                Table of Contents
              </h4>
              <nav className="flex flex-col gap-0.5 text-xs font-semibold">
                {filtered.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button 
                      key={sec.id} 
                      onClick={() => handleNavClick(sec.id)}
                      className={`block w-full py-1.5 px-2.5 rounded-lg text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0F8B7D]/10 text-[#0F8B7D] font-bold border-l-2 border-[#0F8B7D] shadow-2xs"
                          : "text-slate-600 hover:text-[#0F8B7D] hover:bg-slate-100/80"
                      }`}
                    >
                      {sec.title}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Filter Search */}
            <div className="relative pt-1">
              <Search size={13} className="absolute left-3 top-3.5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter clauses..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0F8B7D] font-semibold transition-all shadow-2xs" 
              />
            </div>
          </div>

          {/* Quick Legal Links at bottom of Left Panel */}
          <div className="pt-3 mt-4 border-t border-slate-200 flex flex-col gap-1 text-xs font-bold">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Related Portals</span>
            <Link href="/privacy" className="text-[#0F8B7D] hover:bg-[#0F8B7D]/10 px-2 py-1 rounded-lg flex items-center justify-between transition-colors">
              Privacy Policy <ChevronRight size={11} />
            </Link>
            <Link href="/compliance" className="text-[#0F8B7D] hover:bg-[#0F8B7D]/10 px-2 py-1 rounded-lg flex items-center justify-between transition-colors">
              Compliance Center <ChevronRight size={11} />
            </Link>
            <Link href="/support" className="text-slate-600 hover:text-[#0F8B7D] hover:bg-slate-100 px-2 py-1 rounded-lg flex items-center justify-between transition-colors">
              Support Desk <ChevronRight size={11} />
            </Link>
          </div>
        </aside>

        {/* Right Scrollable Content Area (Only this area scrolls) */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 h-full overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col justify-between custom-scrollbar"
        >
          <div className="px-6 md:px-12 py-8 space-y-10 max-w-4xl">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
                <AlertCircle size={36} className="mx-auto text-amber-500 mb-3" />
                <h3 className="text-base font-extrabold text-slate-800">No matching terms found</h3>
                <p className="text-xs text-slate-500 mt-1">Try searching for a different keyword or clear the filter.</p>
              </div>
            ) : (
              filtered.map((sec) => (
                <section 
                  key={sec.id} 
                  id={sec.id} 
                  className="scroll-mt-4 space-y-3 text-left border-b border-slate-100 pb-8 last:border-0"
                >
                  <div className="flex items-center gap-2.5 text-[#0F8B7D]">
                    <sec.icon size={20} className="shrink-0" />
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                      {sec.title}
                    </h2>
                  </div>
                  <div className="whitespace-pre-line text-sm md:text-[15px] leading-relaxed text-slate-700 font-normal pl-7">
                    {sec.content}
                  </div>
                </section>
              ))
            )}

            {/* CTA Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xs">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#0F8B7D]" /> Need Legal Clarification?
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium max-w-lg leading-relaxed">
                  Our compliance team assists enterprise property funds, developers, and facility contractors with customized MSAs.
                </p>
              </div>
              <Link 
                href="/support" 
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-2xs transition-all shrink-0"
              >
                Contact Legal Desk
              </Link>
            </div>
          </div>

          {/* Footer inside right scrollable container */}
          <div className="mt-12 border-t border-slate-200 w-full">
            <Footer />
          </div>
        </div>

      </div>

    </div>
  );
}

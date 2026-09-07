"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import HeaderAuthButton from "./HeaderAuthButton";
import EnquirySlideIn from "./EnquirySlideIn";

interface MarketingHeaderProps {
  transparentAtTop?: boolean;
  activePath?: string;
}

export default function MarketingHeader({
  transparentAtTop = false,
  activePath = ""
}: MarketingHeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (!transparentAtTop) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentAtTop]);

  const isDark = transparentAtTop ? isScrolled : false;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between border-b ${
          transparentAtTop && !isScrolled
            ? "bg-white/95 backdrop-blur-md text-slate-900 border-slate-200/80"
            : "bg-white/95 backdrop-blur-md text-slate-900 border-slate-200/80 shadow-xs"
        }`}
      >
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center shrink-0 lg:w-[250px]">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={60}
              height={60}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "42px" }}
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={200}
              height={44}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "32px" }}
            />
          </Link>
        </div>

        {/* Center: Main Navigation Menu Items with Dropdowns */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          {/* Marketplace Dropdown */}
          <div className="relative group py-2">
            <Link
              href="/marketplace"
              className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 ${
                activePath === "/marketplace" ? "text-[#0F8B7D] font-extrabold" : ""
              }`}
            >
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
            <Link
              href="/operate"
              className={`hover:text-[#2563EB] transition-colors flex items-center gap-1 ${
                activePath === "/operate" ? "text-[#2563EB] font-extrabold" : ""
              }`}
            >
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
            <Link
              href="/manage"
              className={`hover:text-[#D97706] transition-colors flex items-center gap-1 ${
                activePath === "/manage" ? "text-[#D97706] font-extrabold" : ""
              }`}
            >
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
            <Link
              href="/intelligence"
              className={`hover:text-[#7C3AED] transition-colors flex items-center gap-1 ${
                activePath === "/intelligence" ? "text-[#7C3AED] font-extrabold" : ""
              }`}
            >
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
            <Link
              href="/managed-services"
              className={`hover:text-[#059669] transition-colors flex items-center gap-1 ${
                activePath === "/managed-services" ? "text-[#059669] font-extrabold" : ""
              }`}
            >
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
          <Link
            href="/platform"
            className={`hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap ${
              activePath === "/platform" ? "text-[#0F8B7D] font-extrabold" : ""
            }`}
          >
            Platform
          </Link>

          {/* Pricing */}
          <Link
            href="/pricing"
            className={`hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap ${
              activePath === "/pricing" ? "text-[#0F8B7D] font-extrabold" : ""
            }`}
          >
            Pricing
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
            onClick={() => router.push("/demo")}
            className="px-4 py-2 rounded-xl border border-[#071324] text-[#071324] hover:bg-slate-50 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
          >
            Book a Demo
          </button>
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
          >
            Talk to Sales
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1 text-slate-700 hover:text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
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

          <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Marketplace
          </Link>
          <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#2563EB]">
            Operate (CAFM &amp; PPM)
          </Link>
          <Link href="/manage" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">
            Manage (Rent Roll &amp; Compliance)
          </Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#7C3AED]">
            Intelligence (Analytics &amp; ESG)
          </Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#059669]">
            Managed Services (PM &amp; IFM)
          </Link>
          <Link href="/platform" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Platform Core
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Pricing
          </Link>
          <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Resources &amp; Insights
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Contact Us
          </Link>
          <hr className="border-slate-200 my-2" />
          <div className="py-1">
            <HeaderAuthButton />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setEnquiryOpen(true);
            }}
            className="w-full py-3 rounded-xl bg-[#0F8B7D] text-white font-bold text-center shadow-md cursor-pointer text-sm"
          >
            Talk to Sales
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push("/demo");
            }}
            className="w-full py-3 rounded-xl border border-[#071324] text-[#071324] font-bold text-center cursor-pointer text-sm"
          >
            Book a Demo
          </button>
        </div>
      )}

      {/* Slide-in enquiry form triggered by Talk to Sales */}
      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
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
  const pathname = usePathname();
  const isFmMarketplace = pathname === "/fm-marketplace" || activePath === "/fm-marketplace";
  const isOfficeMarketplace = pathname === "/marketplace" || activePath === "/marketplace";

  // Derive login context for contextual portal filtering
  const loginContext: "marketplace" | "fm" | "operate" | "properties" | "" =
    isFmMarketplace ? "fm" :
    isOfficeMarketplace ? "marketplace" :
    pathname?.startsWith("/operate") ? "operate" :
    pathname?.startsWith("/properties") ? "properties" : "";

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

  const isOperate = pathname?.startsWith("/operate") || activePath?.startsWith("/operate");

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
        <div className="flex items-center shrink-0 gap-2.5">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={60}
              height={60}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "44px" }}
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={180}
              height={44}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "44px" }}
            />
          </Link>
        </div>

        {/* Center: Context-Aware Main Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-xs xl:text-[13px] font-semibold text-slate-600 mx-auto">
          {isOperate ? (
            /* ========================================================================= */
            /* 1. DEDICATED SAAS PLATFORM (OFFICEX.PRO) NAVIGATION                        */
            /* ========================================================================= */
            <>
              {/* Operating Modules Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/operate"
                  className="text-[#0D7B6C] font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <span>Operating Modules</span>
                  <ChevronDown size={13} className="text-[#0D7B6C] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>Institutional CRE &amp; CAFM Suite</span>
                    <Link href="/operate" className="text-[#0D7B6C] hover:underline font-bold text-[10px]">
                      View Hub &rarr;
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <Link href="/operate/rent-roll" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Rent Roll &amp; Billing</div>
                      <div className="text-[11px] text-slate-500">Auto escalations, CAM pooling, bank escrow</div>
                    </Link>
                    <Link href="/operate/compliance" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Statutory Compliance Calendar</div>
                      <div className="text-[11px] text-slate-500">48 Pre-configured commercial tower licenses</div>
                    </Link>
                    <Link href="/operate/ppm" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">52-Week PPM &amp; CAFM</div>
                      <div className="text-[11px] text-slate-500">Equipment servicing matrices &amp; QR passports</div>
                    </Link>
                    <Link href="/operate/visitors" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Visitor Flow &amp; Speed-Gates</div>
                      <div className="text-[11px] text-slate-500">WhatsApp QR passes &amp; turnstile integration</div>
                    </Link>
                    <Link href="/operate/lease-crm" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Commercial Lease CRM</div>
                      <div className="text-[11px] text-slate-500">Stacking plans, LOI generator, deal velocity</div>
                    </Link>
                    <Link href="/operate/helpdesk" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Tenant Helpdesk &amp; Rooms</div>
                      <div className="text-[11px] text-slate-500">10-Sec QR dispatch &amp; boardroom booking</div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* All Modules Hub */}
              <Link
                href="/operate"
                className={`hover:text-[#0D7B6C] transition-colors py-2 whitespace-nowrap ${
                  pathname === "/operate" ? "text-[#0D7B6C] font-extrabold" : ""
                }`}
              >
                Platform Overview
              </Link>

              {/* Live Portal Demo */}
              <Link
                href="/properties/rent-roll"
                className="hover:text-[#0D7B6C] transition-colors py-2 whitespace-nowrap flex items-center gap-1"
              >
                <span>Live Portal Demo</span>
              </Link>
            </>
          ) : isFmMarketplace ? (
            /* ========================================================================= */
            /* 2. FACILITY MANAGEMENT MARKETPLACE NAVIGATION                              */
            /* ========================================================================= */
            <>
              {/* FM Services Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/fm-marketplace"
                  className="text-[#0F8B7D] font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <span>FM Services</span>
                  <ChevronDown size={13} className="text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Facility Trades &amp; AMCs
                  </div>
                  <div className="space-y-1">
                    <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">All FM Services &amp; AMCs</div>
                      <div className="text-[11px] text-slate-500">Pre-vetted vendors across 8 trades</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">HVAC &amp; Chiller</div>
                      <div className="text-[11px] text-slate-500">Repair · Maintenance · Annual AMC · Overhauls</div>
                    </Link>
                    <Link href="/fm-marketplace?category=housekeeping" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Housekeeping &amp; Deep Cleaning</div>
                      <div className="text-[11px] text-slate-500">Façade cleaning &amp; mechanized hygiene</div>
                    </Link>
                    <Link href="/fm-marketplace?category=mep" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">MEP, Electrical &amp; DG Sets</div>
                      <div className="text-[11px] text-slate-500">Power backup &amp; electrical safety audits</div>
                    </Link>
                    <Link href="/fm-marketplace?category=security" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">PSARA Guarding &amp; Security</div>
                      <div className="text-[11px] text-slate-500">Manned guarding &amp; surveillance</div>
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/fm-marketplace#vendors-directory"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                Find Vendors
              </Link>

              <Link
                href="/fm-marketplace#rfq-section"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                Post an RFQ
              </Link>

              <Link
                href="/vendor"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap font-bold text-[#0F8B7D]"
              >
                Join as Vendor
              </Link>

              <Link
                href="/fm-marketplace#how-it-works"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                How It Works
              </Link>
            </>
          ) : (
            /* ========================================================================= */
            /* 3. STANDARD OFFICE / CRE PROPERTY MARKETPLACE & GLOBAL NAVIGATION          */
            /* ========================================================================= */
            <>
              {/* Property Marketplace Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/marketplace"
                  className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer ${
                    activePath === "/marketplace" ? "text-[#0F8B7D] font-extrabold" : ""
                  }`}
                >
                  <span>Property Marketplace</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Commercial Spaces
                  </div>
                  <div className="space-y-1">
                    <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">All Commercial Spaces</div>
                      <div className="text-[11px] text-slate-500">Search verified Grade-A offices</div>
                    </Link>
                    <Link href="/marketplace?type=managed" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Managed Offices</div>
                      <div className="text-[11px] text-slate-500">Fully furnished, turnkey enterprise suites</div>
                    </Link>
                    <Link href="/marketplace?type=coworking" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Coworking &amp; Shared Desks</div>
                      <div className="text-[11px] text-slate-500">Flexible desks &amp; private team cabins</div>
                    </Link>
                    <Link href="/marketplace?type=campus" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Enterprise Tech Campuses</div>
                      <div className="text-[11px] text-slate-500">Large floor plates (25,000+ sq.ft.)</div>
                    </Link>
                    <hr className="border-slate-100 my-1.5" />
                    <Link href="/properties/add" className="block p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-[#0F8B7D]">
                      + List Your Commercial Space
                    </Link>
                    <Link href="/leasing" className="block p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-amber-800">
                      Join as Broker (45d Commission)
                    </Link>
                  </div>
                </div>
              </div>

              {/* FM Services Marketplace */}
              <div className="relative group py-2">
                <Link
                  href="/fm-marketplace"
                  className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer ${
                    activePath === "/fm-marketplace" ? "text-[#0F8B7D] font-extrabold" : ""
                  }`}
                >
                  <span>FM Marketplace</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Facility Management
                  </div>
                  <div className="space-y-1">
                    <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Explore FM Vendors</div>
                      <div className="text-[11px] text-slate-500">HVAC, MEP, Security, Cleaning AMCs</div>
                    </Link>
                    <hr className="border-slate-100 my-1.5" />
                    <Link href="/vendor" className="block p-2 rounded-xl hover:bg-teal-50 transition-colors text-xs font-bold text-[#0F8B7D] flex items-center justify-between">
                      <span>+ Register as Vendor</span>
                      <span className="text-[9.5px] bg-teal-100 text-[#0F8B7D] px-1.5 py-0.5 rounded font-black">Escrow</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Operations Suite Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/operate"
                  className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Operations Suite</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>CRE &amp; FM SaaS Modules</span>
                    <Link href="/operate" className="text-[#0F8B7D] hover:underline font-bold text-[10px]">
                      View Hub &rarr;
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <Link href="/operate/rent-roll" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Rent Roll &amp; Billing</div>
                      <div className="text-[11px] text-slate-500">Auto escalations, CAM pooling, bank escrow</div>
                    </Link>
                    <Link href="/operate/compliance" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Statutory Compliance Calendar</div>
                      <div className="text-[11px] text-slate-500">48 Pre-configured commercial tower licenses</div>
                    </Link>
                    <Link href="/operate/ppm" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">52-Week PPM &amp; CAFM</div>
                      <div className="text-[11px] text-slate-500">Equipment servicing matrices &amp; QR passports</div>
                    </Link>
                    <Link href="/operate/visitors" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Visitor Flow &amp; Speed-Gates</div>
                      <div className="text-[11px] text-slate-500">WhatsApp QR passes &amp; turnstile integration</div>
                    </Link>
                    <Link href="/operate/lease-crm" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Commercial Lease CRM</div>
                      <div className="text-[11px] text-slate-500">Stacking plans, LOI generator, deal velocity</div>
                    </Link>
                    <Link href="/operate/helpdesk" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Tenant Helpdesk &amp; Rooms</div>
                      <div className="text-[11px] text-slate-500">10-Sec QR dispatch &amp; boardroom booking</div>
                    </Link>
                  </div>
                </div>
              </div>

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
            </>
          )}
        </nav>

        {/* Right: Actions — per client doc Section 6.1 */}
        <div className="hidden md:flex items-center justify-end gap-2 xl:gap-2.5 shrink-0">
          <HeaderAuthButton loginContext={loginContext} />
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Enquire
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
              width={50}
              height={50}
              className="object-contain"
              style={{ width: "auto", height: "38px" }}
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={160}
              height={40}
              className="object-contain"
              style={{ width: "auto", height: "38px" }}
            />
          </div>

          {isOperate ? (
            <>
              <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0D7B6C]">
                Platform Overview
              </Link>
              <Link href="/properties/rent-roll" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0D7B6C]">
                Live Portal Demo
              </Link>
              <div className="py-2 border-y border-slate-100 flex flex-col gap-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operating Modules</div>
                <Link href="/operate/rent-roll" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · Rent Roll &amp; Billing
                </Link>
                <Link href="/operate/compliance" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · Statutory Compliance Calendar
                </Link>
                <Link href="/operate/ppm" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · 52-Week PPM &amp; CAFM
                </Link>
                <Link href="/operate/visitors" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · Visitor Flow &amp; Speed-Gates
                </Link>
                <Link href="/operate/lease-crm" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · Commercial Lease CRM
                </Link>
                <Link href="/operate/helpdesk" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0D7B6C]">
                  · Tenant Helpdesk &amp; Rooms
                </Link>
              </div>
            </>
          ) : isFmMarketplace ? (
            <>
              <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Find Commercial Space</Link>
              <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">FM Vendor Marketplace</Link>
              <Link href="/properties/add" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">List Your Space</Link>
              <Link href="/vendor" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D] flex items-center justify-between">
                <span>Register as Vendor</span>
                <span className="text-xs bg-teal-100 px-2 py-0.5 rounded text-[#0F8B7D] font-bold">Escrow Hub</span>
              </Link>
              <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0D7B6C]">Operations Suite</Link>
              <Link href="/fm-marketplace#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                How It Works
              </Link>
            </>
          ) : (
            <>
              <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                Find Office Spaces
              </Link>
              {!isOfficeMarketplace && (
                <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                  FM Services Marketplace
                </Link>
              )}
              <div className="py-2 border-y border-slate-100 flex flex-col gap-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">SaaS Products</div>
                <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-sm font-bold text-[#0F8B7D]">
                  All SaaS Modules (Hub)
                </Link>
                <Link href="/operate/rent-roll" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · Rent Roll &amp; Billing
                </Link>
                <Link href="/operate/compliance" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · Statutory Compliance Calendar
                </Link>
                <Link href="/operate/ppm" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · 52-Week PPM &amp; CAFM
                </Link>
                <Link href="/operate/visitors" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · Visitor Flow &amp; Speed-Gates
                </Link>
                <Link href="/operate/lease-crm" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · Commercial Lease CRM
                </Link>
                <Link href="/operate/helpdesk" onClick={() => setMobileMenuOpen(false)} className="text-left text-xs font-semibold text-slate-700 hover:text-[#0F8B7D]">
                  · Tenant Helpdesk &amp; Rooms
                </Link>
              </div>
              <Link href="/properties/add" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">
                List Your Space
              </Link>
              <Link href="/leasing" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-amber-700 flex items-center justify-between">
                <span>Join as Broker</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">45d Payout</span>
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                About OfficeX
              </Link>
            </>
          )}

          <hr className="border-slate-200 my-2" />
          <div className="py-1">
            <HeaderAuthButton loginContext={loginContext} />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setEnquiryOpen(true);
            }}
            className="w-full py-3 rounded-xl bg-[#0F8B7D] text-white font-bold text-center shadow-md cursor-pointer text-sm"
          >
            Enquire
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

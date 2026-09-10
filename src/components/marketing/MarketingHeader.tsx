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
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={50}
              height={50}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "38px" }}
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={160}
              height={36}
              priority
              className="object-contain transition-all"
              style={{ width: "auto", height: "28px" }}
            />
          </Link>
        </div>

        {/* Center: Context-Aware Main Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-xs xl:text-[13px] font-semibold text-slate-600 mx-auto">
          {isFmMarketplace ? (
            /* ========================================================================= */
            /* FACILITY MANAGEMENT MARKETPLACE NAVIGATION (NO OFFICE SPACE CONFUSION)     */
            /* ========================================================================= */
            <>
              {/* 1. FM Services Dropdown */}
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
                      <div className="text-[11px] text-slate-500">Pre-vetted contractors across 8 trades</div>
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

              {/* 2. HVAC & Chiller Category with Repair, Maintenance, AMC Subcategories */}
              <div className="relative group py-2">
                <Link
                  href="/fm-marketplace?category=hvac"
                  className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer font-bold text-slate-800"
                >
                  <span>HVAC &amp; Chiller</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-900">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    HVAC &amp; Chiller Solutions
                  </div>
                  <div className="space-y-1">
                    <Link href="/fm-marketplace?category=hvac" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">All HVAC &amp; Chiller Services</div>
                      <div className="text-[11px] text-slate-500">Complete cooling, chillers &amp; air treatment</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac&service=repair" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Emergency &amp; Breakdown Repair</div>
                      <div className="text-[11px] text-slate-500">30-min SLA dispatch for compressor &amp; chiller faults</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac&service=maintenance" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Preventive Maintenance (PPM)</div>
                      <div className="text-[11px] text-slate-500">Coil cleaning, filter changes &amp; pressure testing</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac&service=amc" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Annual Maintenance Contracts (AMC)</div>
                      <div className="text-[11px] text-slate-500">Comprehensive &amp; Non-Comprehensive annual plans</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac&service=chillers" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Chiller Plant Overhaul &amp; Descaling</div>
                      <div className="text-[11px] text-slate-500">Centrifugal &amp; screw chiller condenser tube cleaning</div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Find Contractors */}
              <Link
                href="/fm-marketplace#vendors-directory"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                Find Contractors
              </Link>

              {/* 4. Post an RFQ */}
              <Link
                href="/fm-marketplace#rfq-section"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                Post an RFQ
              </Link>

              {/* 4. Join as Contractor (replaces "List Your Space") */}
              <Link
                href="/vendor"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap font-bold text-[#0F8B7D]"
              >
                Join as Contractor
              </Link>

              {/* 5. How It Works */}
              <Link
                href="/fm-marketplace#how-it-works"
                className="hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap"
              >
                How It Works
              </Link>
            </>
          ) : (
            /* ========================================================================= */
            /* STANDARD OFFICE / CRE MARKETPLACE NAVIGATION                               */
            /* ========================================================================= */
            <>
              {/* 1. Find Spaces Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/marketplace"
                  className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer ${
                    activePath === "/marketplace" ? "text-[#0F8B7D] font-extrabold" : ""
                  }`}
                >
                  <span>Find Spaces</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[290px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Explore Office Spaces
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
                  </div>
                </div>
              </div>

              {/* 2. FM Services Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/fm-marketplace"
                  className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer ${
                    activePath === "/fm-marketplace" ? "text-[#0F8B7D] font-extrabold" : ""
                  }`}
                >
                  <span>FM Services</span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Verified Facilities Contractors
                  </div>
                  <div className="space-y-1">
                    <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">All FM Services &amp; AMCs</div>
                      <div className="text-[11px] text-slate-500">Pre-vetted contractors across 8 trades</div>
                    </Link>
                    <Link href="/fm-marketplace?category=hvac" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">HVAC &amp; Chiller AMCs</div>
                      <div className="text-[11px] text-slate-500">Commercial cooling &amp; VRV maintenance</div>
                    </Link>
                    <Link href="/fm-marketplace?category=housekeeping" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">Housekeeping &amp; Deep Cleaning</div>
                      <div className="text-[11px] text-slate-500">Façade cleaning &amp; mechanized hygiene</div>
                    </Link>
                    <Link href="/fm-marketplace?category=mep" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                      <div className="text-xs font-bold text-slate-900">MEP, Electrical &amp; DG Sets</div>
                      <div className="text-[11px] text-slate-500">Power backup &amp; electrical safety audits</div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. List Your Space (Landlords & Brokers) */}
              <Link
                href="/properties/add"
                className={`hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap ${
                  activePath === "/properties/add" ? "text-[#0F8B7D] font-extrabold" : ""
                }`}
              >
                List Your Space
              </Link>

              {/* 4. Pricing */}
              <Link
                href="/pricing"
                className={`hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap ${
                  activePath === "/pricing" ? "text-[#0F8B7D] font-extrabold" : ""
                }`}
              >
                Pricing
              </Link>

              {/* 5. Company Dropdown */}
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
          <HeaderAuthButton />
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
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

          {isFmMarketplace ? (
            <>
              <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">
                All FM Services
              </Link>
              <div className="pl-3 border-l-2 border-teal-200 py-1 space-y-1">
                <Link href="/fm-marketplace?category=hvac" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-900 hover:text-[#0F8B7D]">
                  HVAC &amp; Chiller
                </Link>
                <div className="text-[11px] text-slate-500 font-medium">
                  Repair · Maintenance · Annual AMC · Overhaul
                </div>
              </div>
              <Link href="/fm-marketplace#vendors-directory" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                Find Contractors
              </Link>
              <Link href="/fm-marketplace#rfq-section" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                Post an RFQ
              </Link>
              <Link href="/vendor" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">
                Join as Contractor
              </Link>
              <Link href="/fm-marketplace#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                How It Works
              </Link>
            </>
          ) : (
            <>
              <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                Find Office Spaces
              </Link>
              <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                FM Services Marketplace
              </Link>
              <Link href="/properties/add" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">
                List Your Space
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                Pricing
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
                About OfficeX
              </Link>
            </>
          )}

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

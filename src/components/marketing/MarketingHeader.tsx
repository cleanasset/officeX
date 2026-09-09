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

        {/* Center: Clean 4-Item Main Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-xs xl:text-[13px] font-semibold text-slate-600 mx-auto">
          {/* 1. Products & Modules Dropdown */}
          <div className="relative group py-2">
            <button
              className={`hover:text-[#0F8B7D] transition-colors flex items-center gap-1 cursor-pointer ${
                activePath === "/marketplace" ||
                activePath === "/fm-marketplace" ||
                activePath === "/operate" ||
                activePath === "/manage" ||
                activePath === "/managed-services" ||
                activePath === "/intelligence" ||
                activePath === "/platform"
                  ? "text-[#0F8B7D] font-extrabold"
                  : ""
              }`}
            >
              <span>Products</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 w-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="grid grid-cols-2 gap-3">
                {/* Column 1: Marketplaces */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Marketplaces &amp; Discovery
                  </div>
                  <Link href="/marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Commercial Property Marketplace</div>
                    <div className="text-[11px] text-slate-500">Discover verified Grade-A spaces</div>
                  </Link>
                  <Link href="/fm-marketplace" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">FM Services Marketplace</div>
                    <div className="text-[11px] text-slate-500">Pre-vetted MEP, HVAC &amp; facility vendors</div>
                  </Link>
                  <Link href="/managed-services" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Managed Services (IFM &amp; PM)</div>
                    <div className="text-[11px] text-slate-500">Turnkey property stewardship &amp; audits</div>
                  </Link>
                </div>

                {/* Column 2: Software & Core */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Management &amp; Tech SaaS
                  </div>
                  <Link href="/properties/rent-roll" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Rent Roll Master</div>
                    <div className="text-[11px] text-slate-500">Institutional lease indexation &amp; ledgers</div>
                  </Link>
                  <Link href="/manage" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">CAM Billing &amp; Allocation</div>
                    <div className="text-[11px] text-slate-500">Automated reconciliation &amp; invoicing</div>
                  </Link>
                  <Link href="/compliance" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Statutory Compliances &amp; NOCs</div>
                    <div className="text-[11px] text-slate-500">Fire NOCs, lift licenses &amp; CFO audit radar</div>
                  </Link>
                  <Link href="/operate" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Operate (CAFM &amp; PPM)</div>
                    <div className="text-[11px] text-slate-500">52-week PPM schedules &amp; helpdesk</div>
                  </Link>
                  <Link href="/intelligence" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">OFFICEX Intelligence</div>
                    <div className="text-[11px] text-slate-500">NOI yield, ESG &amp; vendor benchmarks</div>
                  </Link>
                  <Link href="/platform" className="block p-2 rounded-xl hover:bg-teal-50/60 transition-colors">
                    <div className="text-xs font-bold text-slate-900">Platform Core Architecture</div>
                    <div className="text-[11px] text-slate-500">Single schema, RBAC &amp; REST APIs</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Portals Dropdown */}
          <div className="relative group py-2">
            <Link
              href="/login"
              className="hover:text-[#0F8B7D] transition-colors flex items-center gap-1 font-semibold text-slate-600"
            >
              <span>Portals</span>
              <ChevronDown size={13} className="text-slate-400 group-hover:text-[#0F8B7D] group-hover:rotate-180 transition-transform" />
            </Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                Portals &amp; Workspaces
              </div>
              <div className="space-y-1">
                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Commercial Spaces</div>
                    <div className="text-[11px] text-slate-500">Discovery &amp; leasing</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/marketplace" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/properties/add" className="font-bold text-slate-600 hover:text-slate-900">List Space</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">FM Services</div>
                    <div className="text-[11px] text-slate-500">HVAC, MEP, Cleaning</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/fm-marketplace" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/marketplace/rfq" className="font-bold text-slate-600 hover:text-slate-900">Post RFQ</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Facility Operations</div>
                    <div className="text-[11px] text-slate-500">52-week PPM &amp; CAFM</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/operate" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/ops" className="font-bold text-slate-600 hover:text-slate-900">Ops Console</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Property Owners</div>
                    <div className="text-[11px] text-slate-500">Rent roll &amp; CAM billing</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/manage" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/properties" className="font-bold text-slate-600 hover:text-slate-900">Owner Portal</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Corporate Tenants</div>
                    <div className="text-[11px] text-slate-500">Tickets &amp; passes</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/audiences/occupiers" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/tenant" className="font-bold text-slate-600 hover:text-slate-900">Tenant App</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">FM Vendors</div>
                    <div className="text-[11px] text-slate-500">Job cards &amp; escrow</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/fm-marketplace" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/vendor" className="font-bold text-slate-600 hover:text-slate-900">Vendor Desk</Link>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Leasing Brokers</div>
                    <div className="text-[11px] text-slate-500">Deal desk &amp; inventory</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <Link href="/marketplace" className="font-bold text-[#0F8B7D] hover:underline">Explore</Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/login?redirect=/leasing" className="font-bold text-slate-600 hover:text-slate-900">Broker CRM</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Pricing */}
          <Link
            href="/pricing"
            className={`hover:text-[#0F8B7D] transition-colors py-2 whitespace-nowrap ${
              activePath === "/pricing" ? "text-[#0F8B7D] font-extrabold" : ""
            }`}
          >
            Pricing
          </Link>

          {/* 4. Company Dropdown */}
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

          <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Commercial Spaces Marketplace
          </Link>
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">
            FM Services Marketplace
          </Link>
          <Link href="/properties/rent-roll" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">
            Rent Roll Master
          </Link>
          <Link href="/manage" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#D97706]">
            CAM Billing &amp; Allocation
          </Link>
          <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-emerald-600">
            Statutory Compliances &amp; NOCs
          </Link>
          <Link href="/operate" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#2563EB]">
            Operate (CAFM &amp; PPM)
          </Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Intelligence (Analytics &amp; ESG)
          </Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#059669]">
            Managed Services (PM &amp; IFM)
          </Link>
          <Link href="/platform" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Platform Core Architecture
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Pricing
          </Link>
          <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">
            Careers
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

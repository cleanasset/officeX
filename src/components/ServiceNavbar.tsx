"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import HeaderAuthButton from "@/components/marketing/HeaderAuthButton";

interface ServiceNavbarProps {
  activePage?: "discover" | "fm" | "ops" | "managed" | "intelligence";
}

export default function ServiceNavbar({ activePage }: ServiceNavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between transition-all shadow-2xs relative">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={42} 
              height={42} 
              priority 
              className="object-contain" 
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX Name" 
              width={140} 
              height={32} 
              priority 
              className="object-contain" 
            />
          </Link>
        </div>

        {/* Center: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link 
            href="/discover" 
            className={`text-sm font-bold tracking-tight transition-colors py-1 relative ${activePage === "discover" ? "text-[#0F8B7D] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0F8B7D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            Discover Spaces
          </Link>
          <Link 
            href="/fm-marketplace" 
            className={`text-sm font-bold tracking-tight transition-colors py-1 relative ${activePage === "fm" ? "text-[#0F8B7D] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0F8B7D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            FM Marketplace
          </Link>
          <Link 
            href="/operations" 
            className={`text-sm font-bold tracking-tight transition-colors py-1 relative ${activePage === "ops" ? "text-[#0F8B7D] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0F8B7D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            Operations &amp; CAFM
          </Link>
          <Link 
            href="/managed-services" 
            className={`text-sm font-bold tracking-tight transition-colors py-1 relative ${activePage === "managed" ? "text-[#0F8B7D] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0F8B7D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            Managed Offices
          </Link>
          <Link 
            href="/intelligence" 
            className={`text-sm font-bold tracking-tight transition-colors py-1 relative ${activePage === "intelligence" ? "text-[#0F8B7D] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0F8B7D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            Intelligence
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button 
            onClick={() => router.push("/public/search")}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 cursor-pointer"
            title="Search Spaces"
          >
            <Search size={18} />
          </button>
          <HeaderAuthButton />
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-[#0F8B7D] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0D7A6E] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-1 text-slate-700 hover:text-slate-900" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-5 md:hidden text-slate-900 shadow-2xl animate-fadeIn">
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
          <Link 
            href="/discover" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left text-base font-bold ${activePage === "discover" ? "text-[#0F8B7D]" : "hover:text-[#0F8B7D]"}`}
          >
            Office Discovery
          </Link>
          <Link 
            href="/fm-marketplace" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left text-base font-bold ${activePage === "fm" ? "text-[#0F8B7D]" : "hover:text-[#0F8B7D]"}`}
          >
            FM Marketplace
          </Link>
          <Link 
            href="/operations" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left text-base font-bold ${activePage === "ops" ? "text-[#0F8B7D]" : "hover:text-[#0F8B7D]"}`}
          >
            Operations SaaS
          </Link>
          <Link 
            href="/managed-services" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left text-base font-bold ${activePage === "managed" ? "text-[#0F8B7D]" : "hover:text-[#0F8B7D]"}`}
          >
            Managed Services
          </Link>
          <Link 
            href="/intelligence" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left text-base font-bold ${activePage === "intelligence" ? "text-[#0F8B7D]" : "hover:text-[#0F8B7D]"}`}
          >
            Intelligence
          </Link>
          <hr className="border-slate-200" />
          <div className="py-1">
            <HeaderAuthButton />
          </div>
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3.5 rounded-full bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer text-sm"
          >
            Get Started
          </button>
        </div>
      )}
    </>
  );
}

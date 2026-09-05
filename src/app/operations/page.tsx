"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { Search, MapPin, Building, ArrowRight, CheckCircle2, Menu, X, Activity, BarChart3, Database } from "lucide-react";

export default function OperationsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between transition-all shadow-2xs relative">
        <div className="flex items-center shrink-0 lg:w-[250px]">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={60} 
              height={60} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "50px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={200} 
              height={44} 
              priority
              className="object-contain"
              style={{ width: "auto", height: "38px" }}
            />
          </Link>
        </div>

        <nav className="hidden lg:flex flex-1 justify-center items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600">
          <Link href="/discover" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Buy / Lease</Link>
          <Link href="/fm-marketplace" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">FM Services</Link>
          <Link href="/operations" className="text-[#0F8B7D] font-bold whitespace-nowrap">SaaS Platform</Link>
          <Link href="/managed-services" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Managed Services</Link>
          <Link href="/intelligence" className="hover:text-[#0F8B7D] transition-colors whitespace-nowrap">Intelligence</Link>
        </nav>

        <div className="hidden md:flex items-center justify-end gap-4 shrink-0 lg:w-[250px]">
          <a href="/login" className="text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors px-2">
            Sign In
          </a>
          <button 
            onClick={() => router.push('/public/wizard')}
            className="px-5 py-2.5 rounded-full bg-[#0F8B7D] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0D7A6E] shadow-md transition-all cursor-pointer"
          >
            Book a Demo
          </button>
        </div>

        <button className="md:hidden p-1 text-slate-700 hover:text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 flex flex-col gap-5 md:hidden text-slate-900 shadow-2xl animate-fadeIn">
          <Link href="/discover" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Buy / Lease</Link>
          <Link href="/fm-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">FM Services</Link>
          <Link href="/operations" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold text-[#0F8B7D]">SaaS Platform</Link>
          <Link href="/managed-services" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Managed Services</Link>
          <Link href="/intelligence" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-bold hover:text-[#0F8B7D]">Intelligence</Link>
          <hr className="border-slate-200" />
          <button 
            onClick={() => { setMobileMenuOpen(false); router.push('/public/wizard'); }}
            className="w-full py-3 rounded-full bg-[#0F8B7D] text-white font-bold text-center shadow-lg cursor-pointer text-sm"
          >
            Book a Demo
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bg-[#071324] pt-20 pb-24 px-4 sm:px-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="px-3.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-1.5">
            <Database size={14} /> Full Stack Operations
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            The Operating System for<br className="hidden sm:block" /> Commercial Real Estate.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mb-10 leading-relaxed">
            Unify your lease administration, tenant management, facility operations, and financial performance into a single, high-velocity SaaS dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-[#3B82F6] hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Access Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION 1 */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <Image 
              src="/images/features/OfficeX - Complete Portfolio Dashboard.jpg" 
              alt="Complete Portfolio Dashboard" 
              width={1200} height={800} 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Real-Time Portfolio Command Center
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
              Monitor total square footage, occupancy rates, and revenue across your entire enterprise portfolio. Identify underperforming assets instantly with our interactive maps and KPIs.
            </p>
            <div className="space-y-4">
              {[
                "Live occupancy tracking and space utilization metrics",
                "Automated rent roll and invoicing generation",
                "Asset performance benchmarking and yield analytics",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#3B82F6]" />
                  <span className="text-sm font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION 2 */}
      <section className="py-20 px-4 sm:px-6 bg-white w-full border-y border-slate-200">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Lease Registry & Critical Dates
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
              Never miss a lease expiration or a lock-in period end date again. Our smart lease abstraction engine keeps your legal and commercial teams in absolute sync.
            </p>
            <div className="space-y-4">
              {[
                "Automated reminders for escalations and renewals",
                "Centralized document vault for LOIs and agreements",
                "Custom workflows for lease approvals and sign-offs",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Activity size={18} className="text-[#3B82F6]" />
                  <span className="text-sm font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative group">
            <Image 
              src="/images/features/OfficeX - Lease Registry Dashboard.jpg" 
              alt="Lease Registry" 
              width={1200} height={800} 
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION 3 */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <Image 
              src="/images/features/OfficeX - Pipeline Kanban Board.jpg" 
              alt="Pipeline Kanban" 
              width={1200} height={800} 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Velocity-Driven Sales Pipeline
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
              Empower your brokerage and leasing teams with a purpose-built Kanban board. Track every enquiry from initial site visit to final contract execution.
            </p>
            <div className="space-y-4">
              {[
                "Visual deal progression and stage tracking",
                "Integrated CRM with automated follow-ups",
                "Commission and brokerage tracking",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-[#3B82F6]" />
                  <span className="text-sm font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

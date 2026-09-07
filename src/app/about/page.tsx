"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Building2, ShieldCheck, Award, Target, Users, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX Logo"
            width={50}
            height={50}
            className="object-contain"
            style={{ width: "auto", height: "42px" }}
          />
          <Image
            src="/name-removebg-preview.png"
            alt="OfficeX"
            width={160}
            height={36}
            className="object-contain"
            style={{ width: "auto", height: "30px" }}
          />
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/marketplace" className="text-gray-600 hover:text-[#0F8B7D]">
            Solutions
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-[#0F8B7D]">
            Contact
          </Link>
          <Link
            href="/demo"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-extrabold hover:bg-[#0c7368] transition-all"
          >
            Book a Demo
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              OUR MISSION
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071324] tracking-tight mt-4 leading-tight">
              Building India&apos;s Unified Operating System for Commercial Real Estate
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed font-medium">
              Commercial real estate in India has historically operated on fragmented spreadsheets, verbal trust, and opaque brokerage. OfficeX was founded to introduce transparency, verifiable SLAs, and automated digital workflows across every square foot.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Zero Ambiguity</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Standardized BOQ tenders, verifiable vendor performance scores, and clear SLA expectations eliminate costly project disputes.
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Institutional Governance</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                From DPDP Act 2023 data compliance to proactive statutory NOC tracking, we protect owners and occupiers from operational risks.
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">End-to-End Interoperability</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                One platform connects property discovery, facility operations, CAM billing, and institutional analytics without duplicate entries.
              </p>
            </div>
          </div>

          {/* Scalezix Backing */}
          <div className="bg-[#071324] text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-16">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D]">
                CORPORATE STEWARDSHIP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                Backed by Scalezix Ventures LLP
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-medium">
                OfficeX is engineered by Scalezix Ventures LLP, combining seasoned commercial real estate operators, veteran facility directors, and enterprise software architects. Our team manages millions of square feet across Bengaluru, Mumbai, and Delhi NCR.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-semibold">
                <span>Offices in Bengaluru • Mumbai • Gurugram</span>
                <span>•</span>
                <span>Enterprise Ready</span>
                <span>•</span>
                <span>SOC 2 Type II Aligned</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-xl transition-all shadow-md"
            >
              <span>Connect with Our Leadership Team</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

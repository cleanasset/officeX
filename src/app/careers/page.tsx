"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Briefcase, MapPin, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function CareersPage() {
  const roles = [
    {
      title: "Senior Full-Stack Engineer (Next.js / TypeScript)",
      department: "Engineering",
      location: "Bengaluru (Hybrid)",
      type: "Full-Time",
      desc: "Lead development on our high-performance commercial CAFM and analytics modules."
    },
    {
      title: "Commercial Real Estate Solutions Specialist",
      department: "Solutions Engineering",
      location: "Mumbai (BKC)",
      type: "Full-Time",
      desc: "Work closely with Grade-A asset managers to design customized onboarding and asset registries."
    },
    {
      title: "MEP Facility Operations Lead",
      department: "Managed Services",
      location: "Bengaluru / Gurugram",
      type: "Full-Time",
      desc: "Oversee on-ground technical audits, 52-week PPM schedules, and vendor quality audits."
    },
    {
      title: "Enterprise Account Director (CRE SaaS)",
      department: "Sales & Growth",
      location: "Delhi NCR / Mumbai",
      type: "Full-Time",
      desc: "Drive partnerships with institutional REITs, top developers, and multinational corporate occupiers."
    }
  ];

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
            href="/contact"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-extrabold hover:bg-[#0c7368] transition-all"
          >
            Talk to Sales
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              JOIN OUR TEAM
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071324] tracking-tight mt-4">
              Shape the Future of Commercial Real Estate Tech
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
              We&apos;re looking for mission-driven engineers, CRE experts, and operations leaders to modernize the commercial real estate landscape.
            </p>
          </div>

          {/* Culture perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "High-Impact Ownership",
                desc: "Work on mission-critical software managing real institutional assets and billions in transaction value."
              },
              {
                title: "Competitive Compensation",
                desc: "Top-market salaries, comprehensive health coverage for your family, and attractive equity participation."
              },
              {
                title: "Hybrid Flexibility",
                desc: "Modern collaborative offices in prime commercial hubs with flexible hybrid work arrangements."
              }
            ].map((perk, i) => (
              <div key={i} className="bg-slate-50 border border-gray-200 rounded-2xl p-6">
                <CheckCircle2 size={20} className="text-[#0F8B7D] mb-3" />
                <h3 className="text-sm font-black text-gray-900 mb-1">{perk.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>

          {/* Open Roles */}
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Open Positions</h2>
            <div className="space-y-4">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#0F8B7D] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full">
                      {role.department}
                    </span>
                    <h3 className="text-base font-black text-gray-900 mt-1">{role.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{role.desc}</p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {role.location}
                      </span>
                      <span>•</span>
                      <span>{role.type}</span>
                    </div>
                  </div>

                  <a
                    href={`mailto:careers@officex.in?subject=Application for ${encodeURIComponent(role.title)}`}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#071324] hover:bg-slate-800 text-white text-xs font-bold transition-all text-center"
                  >
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-8 text-center">
            <h3 className="text-base font-black text-gray-900">Don&apos;t see the right role?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Send your CV and portfolio to <span className="font-bold text-[#0F8B7D]">careers@officex.in</span>. We always make room for exceptional talent.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

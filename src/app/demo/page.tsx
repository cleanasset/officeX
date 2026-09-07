"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EnquiryForm from "@/components/marketing/EnquiryForm";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import { Calendar, CheckCircle, ShieldCheck, Sparkles, Building2, Users } from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"form" | "calendly">("form");

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/demo" />

      {/* Main Container */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              PERSONALIZED PLATFORM WALKTHROUGH
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071324] tracking-tight mt-4">
              Schedule Your OfficeX Demo
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              See how our five modules connect your commercial properties, vendors, and tenants into a single operating environment.
            </p>

            {/* Toggle Form / Calendly */}
            <div className="inline-flex p-1 bg-gray-200/80 rounded-xl mt-6">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "form"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Request Custom Walkthrough
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calendly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "calendly"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Book Instant 30-Min Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: What you will see */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-4">What We'll Cover</h2>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Portfolio & Asset Modeling",
                      desc: "How your buildings, tenants, and MEP assets are mapped with QR codes and digital logbooks."
                    },
                    {
                      title: "Live 52-Week PPM & Helpdesk",
                      desc: "Automating scheduled maintenance and testing SLA escalation workflows in real time."
                    },
                    {
                      title: "Rent Roll & Statutory Compliance",
                      desc: "Automated billing formulas, GST e-invoices, and the 90/60/30-day compliance alert radar."
                    },
                    {
                      title: "Executive MIS & ESG Analytics",
                      desc: "Generating audit-ready quarterly investor reports and utility benchmarking dashboards."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users size={15} className="text-[#0F8B7D]" /> 1-on-1 with Solutions Engineer
                  </span>
                  <span>Duration: 30 Mins</span>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-[#071324] text-white rounded-2xl p-6 shadow-sm">
                <p className="text-xs italic text-slate-300 leading-relaxed font-medium">
                  &ldquo;The OfficeX demo showed us how to eliminate 20+ disconnected spreadsheets and gain full visibility into our 450,000 sq.ft. commercial park within 10 days.&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F8B7D] text-white font-bold flex items-center justify-center text-xs">
                    AK
                  </div>
                  <div>
                    <p className="text-xs font-bold">Anand Kulkarni</p>
                    <p className="text-[10px] text-slate-400">Head of Operations, Prestige Meridian Hub</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Demo Form / Calendly */}
            <div className="lg:col-span-7">
              {activeTab === "form" ? (
                <EnquiryForm
                  variant="inline"
                  heading="Tell Us About Your Requirements"
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
                  <div className="w-14 h-14 bg-teal-50 text-[#0F8B7D] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Book Direct on Calendly</h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
                    Select a convenient 30-minute time slot with our senior CRE solutions engineering team.
                  </p>
                  <a
                    href="https://calendly.com/officex-sales/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-md"
                  >
                    <Calendar size={16} />
                    <span>Open Calendly Calendar</span>
                  </a>
                  <p className="text-[11px] text-gray-400 mt-4">
                    Instant calendar invitation sent via Google Meet / Zoom.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

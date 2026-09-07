"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import EnquiryForm from "@/components/marketing/EnquiryForm";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/contact" />

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              COMMERCIAL SOLUTIONS DESK
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071324] tracking-tight mt-4">
              Get in Touch with OfficeX
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              We respond to all verified institutional and commercial inquiries within 24 business hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-5">Corporate Offices</h2>
                
                <div className="space-y-5 text-xs text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block font-bold">Bangalore (Headquarters)</strong>
                      <p className="mt-0.5 leading-relaxed">
                        Scalezix Ventures LLP, Level 6, Prestige Meridian, MG Road, Bengaluru, Karnataka 560001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block font-bold">Mumbai Hub</strong>
                      <p className="mt-0.5 leading-relaxed">
                        Bandra Kurla Complex (BKC), G-Block, Mumbai, Maharashtra 400051
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block font-bold">Delhi NCR Office</strong>
                      <p className="mt-0.5 leading-relaxed">
                        Cyber City, DLF Phase 2, Gurugram, Haryana 122002
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3.5">
                  <div className="flex items-center gap-3 text-xs">
                    <Mail size={16} className="text-[#0F8B7D]" />
                    <span className="font-semibold text-gray-700">sales@officex.in</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Phone size={16} className="text-[#0F8B7D]" />
                    <span className="font-semibold text-gray-700">+91 1800 200 4589 (Toll Free)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Clock size={16} className="text-[#0F8B7D]" />
                    <span className="text-gray-500">Mon - Fri: 9:00 AM - 7:00 PM IST</span>
                  </div>
                </div>
              </div>

              {/* Trust Callout */}
              <div className="bg-[#071324] text-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#0F8B7D] text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={16} />
                  <span>Institutional Assurance</span>
                </div>
                <h3 className="text-base font-black">Guaranteed SLA Response</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                  Every submission is logged directly in our enterprise CRM with assigned commercial specialists based on your metro market and asset class.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                  <CheckCircle size={14} className="text-[#0F8B7D]" />
                  <span>NDAs signed prior to proprietary portfolio reviews</span>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <EnquiryForm
                variant="inline"
                heading="Send an Enquiry"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

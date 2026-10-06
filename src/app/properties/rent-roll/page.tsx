"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Rocket,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Layers,
  Calculator,
  UserCheck
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function RentRollStatusPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email =
        localStorage.getItem("officex_user_email") ||
        sessionStorage.getItem("officex_user_email") ||
        "";
      const name =
        localStorage.getItem("officex_user_name") ||
        sessionStorage.getItem("officex_user_name") ||
        "";

      if (email) {
        setUserEmail(email);
        setUserName(name || email.split("@")[0]);
        setIsLoggedIn(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/operate/rent-roll" />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/operate" className="hover:text-slate-900 transition-colors">
            Operations
          </Link>
          <span>/</span>
          <Link href="/operate/rent-roll" className="hover:text-slate-900 transition-colors">
            Rent Roll
          </Link>
          <span>/</span>
          <span className="text-[#0D7B6C] font-bold">Module Status</span>
        </div>
      </div>

      {/* Main Status Container */}
      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
            {/* Top Accent Gradient Bar */}
            <div className="h-2.5 bg-gradient-to-r from-[#0D7B6C] via-teal-400 to-emerald-500" />

            <div className="p-6 sm:p-10 lg:p-12 text-center">
              {/* Animated Icon Badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-teal-50 border border-teal-200 text-[#0D7B6C] mb-6 shadow-sm">
                <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-[#0D7B6C] animate-pulse" />
              </div>

              {/* Status Pill */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D7B6C] text-xs font-black uppercase tracking-wider shadow-2xs">
                  <Sparkles size={13} className="text-[#0D7B6C]" />
                  <span>OFFICEX REVOLUTION 2.0 · IN ACTIVE DEVELOPMENT</span>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                Something Big is Coming!{" "}
                <span className="block sm:inline text-[#0D7B6C]">
                  Stay Tuned.
                </span>
              </h1>

              {/* Explanatory Copy */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
                We have completely retired our legacy rent roll interface to build an institutional-grade
                commercial revenue engine from the ground up — featuring automated lease escalations,
                direct bank escrow reconciliations, and board-ready SEBI REIT audit reports.
              </p>

              {/* User Auth Status Pill */}
              <div className="max-w-lg mx-auto mb-8 p-4 rounded-2xl border text-xs text-left flex items-start gap-3 bg-slate-50 border-slate-200">
                {isLoggedIn ? (
                  <>
                    <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">
                        Signed in as <span className="font-mono text-[#0D7B6C]">{userEmail}</span>
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        You are on the VIP priority early-access queue for Rent Roll 2.0. We will notify you as soon as the module launches.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">
                        Rent Roll 2.0 In Progress
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        The Rent Roll dashboard is currently closed while version 2.0 is being built. You can <Link href="/login?context=rent-roll&redirect=/properties/rent-roll" className="font-bold text-[#0D7B6C] hover:underline">Sign In</Link> to receive early access updates.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Preview Cards of What's Under Construction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D7B6C] mb-2.5">
                    <Calculator size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">AI Rent Roll 2.0</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Auto-escalation rules, 90-day anniversary alerts &amp; indexation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D7B6C] mb-2.5">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">RBI Escrow Nodal</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Instant split settlements, TDS deductions &amp; verified disbursements.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D7B6C] mb-2.5">
                    <Layers size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">CAM True-Up Pooling</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    BOMA/RERA proportionate cost allocation with zero disputes.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/operate"
                  className="px-6 py-3 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
                >
                  <span>Explore Operating Modules</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/operate/rent-roll"
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Rent Roll Overview</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail size={14} className="text-[#0D7B6C]" />
                  <span>Request VIP Walkthrough</span>
                </button>
              </div>

              {!isLoggedIn && (
                <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                  Want to explore other features?{" "}
                  <Link href="/login" className="text-[#0D7B6C] font-bold hover:underline">
                    Sign In &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Rent Roll 2.0 VIP Waitlist"] }}
      />
    </div>
  );
}

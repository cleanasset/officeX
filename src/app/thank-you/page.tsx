"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Calendar, ArrowRight, Home, PhoneCall } from "lucide-react";
import Footer from "@/components/Footer";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || `OX-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="max-w-2xl mx-auto text-center bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-xl">
      <div className="w-16 h-16 bg-emerald-100 text-[#0F8B7D] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={36} />
      </div>

      <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1 rounded-full">
        ENQUIRY CONFIRMED
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight mt-3">
        Thank You for Reaching Out
      </h1>

      <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium leading-relaxed max-w-lg mx-auto">
        Your enquiry has been received and assigned to our enterprise solutions desk. We will review your portfolio details and respond within <strong className="text-gray-900">24 business hours</strong>.
      </p>

      <div className="mt-6 inline-block bg-slate-50 border border-gray-200 rounded-2xl px-5 py-3 text-xs font-mono font-bold text-gray-700">
        Reference Ticket: <span className="text-[#0F8B7D] font-bold">{refParam}</span>
      </div>

      {/* Calendly Next Step */}
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-gray-100 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-gray-900">Need Immediate Assistance?</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Skip the inbox and book a 30-minute consultation slot on Calendly.
          </p>
        </div>
        <a
          href="https://calendly.com/officex-sales/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
        >
          <Calendar size={14} />
          <span>Book Call Now</span>
        </a>
      </div>

      {/* Social Proof Quote */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 italic">
        &ldquo;OfficeX has completely transformed our building operations. Their responsiveness during onboarding was exceptional.&rdquo;
        <p className="font-bold text-gray-700 not-italic mt-1">— Director of Asset Management, Brigade Commercial</p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#0F8B7D] transition-colors"
        >
          <Home size={14} />
          <span>Return to Homepage</span>
        </Link>
        <span>•</span>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0F8B7D] hover:underline"
        >
          <span>Explore Solutions</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX Logo"
            width={50}
            height={50}
            className="object-contain"
            style={{ width: "auto", height: "40px" }}
          />
          <Image
            src="/name-removebg-preview.png"
            alt="OfficeX"
            width={150}
            height={34}
            className="object-contain"
            style={{ width: "auto", height: "28px" }}
          />
        </Link>
        <Link href="/" className="text-xs font-bold text-gray-600 hover:text-[#0F8B7D]">
          Home
        </Link>
      </header>

      <main className="flex-1 py-16 px-4 sm:px-6 flex items-center justify-center">
        <Suspense fallback={<div className="text-xs text-gray-400">Loading confirmation...</div>}>
          <ThankYouContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

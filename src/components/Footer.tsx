"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, CheckCircle2, ShieldCheck, FileCheck, Lock, HelpCircle, Building } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#111828] text-white py-14 px-4 md:px-6 border-t border-slate-800 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
        
        {/* 1. Brand Column */}
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={80} 
              height={80} 
              className="object-contain filter brightness-0 invert group-hover:scale-105 transition-transform"
              style={{ width: "auto", height: "60px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={250} 
              height={60} 
              className="object-contain filter brightness-0 invert group-hover:opacity-90 transition-opacity"
              style={{ width: "auto", height: "48px" }}
            />
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium">
            The unified operating system for commercial real estate discoverability, leasing transactions, statutory compliance, and facility operations.
          </p>
          <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-[#0F8B7D]" /> SOC 2 Type II</span>
            <span className="flex items-center gap-1"><Lock size={14} className="text-[#0F8B7D]" /> AES-256</span>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <a
              href="https://linkedin.com/company/officex"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0F8B7D] transition-all text-xs font-bold"
              aria-label="OfficeX on LinkedIn"
            >
              in
            </a>
            <a
              href="https://twitter.com/officex_in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0F8B7D] transition-all text-xs font-bold"
              aria-label="OfficeX on X (Twitter)"
            >
              𝕏
            </a>
          </div>
        </div>

        {/* 2. Solutions Column (Direct labels without brackets) */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Building size={14} className="text-[#0F8B7D]" /> Solutions
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/marketplace" className="hover:text-white transition-colors">
                Discovery &amp; RFQs
              </Link>
            </li>
            <li>
              <Link href="/operate" className="hover:text-white transition-colors">
                CAFM &amp; 52-Week PPM
              </Link>
            </li>
            <li>
              <Link href="/manage" className="hover:text-white transition-colors">
                Rent Roll &amp; Statutory Compliance
              </Link>
            </li>
            <li>
              <Link href="/intelligence" className="hover:text-white transition-colors">
                NOI &amp; ESG Portfolio Intelligence
              </Link>
            </li>
            <li>
              <Link href="/managed-services" className="hover:text-white transition-colors">
                On-Ground Property &amp; Facility Management
              </Link>
            </li>
            <li>
              <Link href="/platform" className="hover:text-white transition-colors text-slate-400">
                Platform Core &amp; Security Architecture
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Case Studies Column (Moved from homepage PROVEN RESULTS) */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <FileCheck size={14} className="text-[#0F8B7D]" /> Case Studies
          </h4>
          <ul className="mt-4 flex flex-col gap-3 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/resources" className="hover:text-white transition-colors block group">
                <span className="text-white group-hover:text-teal-400 transition-colors block font-bold">Prestige Meridian</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">60% Faster FM Procurement</span>
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white transition-colors block group">
                <span className="text-white group-hover:text-teal-400 transition-colors block font-bold">Embassy TechZone</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">18% MEP AMC Cost Savings</span>
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white transition-colors block group">
                <span className="text-white group-hover:text-teal-400 transition-colors block font-bold">DLF CyberCity</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">100% Audit-Ready NOCs</span>
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white transition-colors block group">
                <span className="text-white group-hover:text-teal-400 transition-colors block font-bold">Brookfield Tower</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Automated 52-Week PPM</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. Trust & Company Column */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0F8B7D]" /> Trust &amp; Company
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About OfficeX
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Careers</span>
                <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full font-bold">Hiring</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white transition-colors">
                Resources &amp; Insights
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* 5. Stay Updated Column */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Stay Updated</h4>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Subscribe to our newsletter for insights on commercial real estate tech &amp; statutory updates.
          </p>
          
          {subscribed ? (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} />
              <span>Thank you! You are subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-4 w-full">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email" 
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800/90 focus:outline-none focus:border-[#0F8B7D] text-white placeholder-slate-500 font-semibold"
              />
              <button 
                type="submit"
                className="w-full py-2 rounded-lg bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0D7A6E] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <Send size={12} />
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-500 mt-2.5 font-medium">
            Protected by DPDP Act 2023. Unsubscribe at any time.
          </p>
        </div>

      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto w-full border-t border-slate-800/80 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 font-medium gap-4">
        <span>&copy; {new Date().getFullYear()} OfficeX Technologies. All rights reserved. Built for Institutional Commercial Real Estate.</span>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/compliance" className="hover:text-white transition-colors">Statutory NOC</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          <Link href="/support" className="hover:text-white transition-colors">Helpdesk</Link>
        </div>
      </div>
    </footer>
  );
}

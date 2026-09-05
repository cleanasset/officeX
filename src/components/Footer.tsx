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
    <footer className="bg-[#111828] text-white py-16 px-4 md:px-6 border-t border-slate-800 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={54} 
              height={54} 
              className="object-contain filter brightness-0 invert group-hover:scale-105 transition-transform"
              style={{ width: "auto", height: "46px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={185} 
              height={44} 
              className="object-contain filter brightness-0 invert group-hover:opacity-90 transition-opacity"
              style={{ width: "auto", height: "36px" }}
            />
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium">
            India’s unified operating system for commercial real estate discoverability, leasing transactions, statutory compliance, and facility operations.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-[#0F8B7D]" /> SOC 2 Type II</span>
            <span className="flex items-center gap-1"><Lock size={14} className="text-[#0F8B7D]" /> AES-256</span>
          </div>
        </div>

        {/* Legal & Governance Column */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileCheck size={14} className="text-[#0F8B7D]" /> Trust & Legal
          </h4>
          <ul className="mt-4 flex flex-col gap-3 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Terms of Service</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href="/compliance" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Compliance NOC</span>
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Security Center</span>
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>Support & Help Desk</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Modules Column */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Building size={14} className="text-[#0F8B7D]" /> Platform Portals
          </h4>
          <ul className="mt-4 flex flex-col gap-3 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/public/search" className="hover:text-white transition-colors">
                Commercial Office Search
              </Link>
            </li>
            <li>
              <Link href="/public/wizard" className="hover:text-white transition-colors">
                Requirement Submission
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="hover:text-white transition-colors">
                FM Vendor Directory
              </Link>
            </li>
            <li>
              <Link href="/tenant" className="hover:text-white transition-colors">
                Tenant Self-Service Portal
              </Link>
            </li>
            <li>
              <Link href="/ops" className="hover:text-white transition-colors">
                Facility Manager Console
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Stay Updated</h4>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Subscribe to our newsletter for insights on commercial real estate tech & statutory updates.
          </p>
          
          {subscribed ? (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} />
              <span>Thank you! You are subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 mt-4 w-full">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email" 
                className="flex-1 min-w-0 w-full px-3 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/90 focus:outline-none focus:border-[#0F8B7D] text-white placeholder-slate-500 font-semibold"
              />
              <button 
                type="submit"
                className="px-3.5 py-2.5 rounded-lg bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0D7A6E] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Subscribe</span>
                <Send size={12} />
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-500 mt-3 font-medium">
            Protected by DPDP Act 2023. Unsubscribe at any time.
          </p>
        </div>

      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto w-full border-t border-slate-800/80 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 font-medium gap-4">
        <span>&copy; {new Date().getFullYear()} OfficeX Technologies (Scalezix Ventures LLP). All rights reserved. Built for Institutional Commercial Real Estate.</span>
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

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Mail, 
  Server, 
  Key, 
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [cookieAnalytics, setCookieAnalytics] = useState(true);
  const [cookieMarketing, setCookieMarketing] = useState(false);
  const [savedCookies, setSavedCookies] = useState(false);

  const handleSaveCookiePreferences = () => {
    setSavedCookies(true);
    setTimeout(() => setSavedCookies(false), 3000);
  };

  const dataProcessingCategories = [
    {
      category: "Corporate Registration Data",
      dataTypes: "Company Legal Name, GSTIN, PAN, Registered Address, Authorized Signatory Contact",
      purpose: "Statutory business verification, automated tax compliance checks, and legal agreement execution.",
      retention: "Duration of corporate subscription + 7 years statutory tax retention requirement."
    },
    {
      category: "Tenant & Visitor Access Logs",
      dataTypes: "Visitor Full Name, Mobile Number, Government ID Type, Entry/Exit Timestamp, Host Tenant Unit",
      purpose: "Building safety, QR code gate clearance, statutory visitor compliance (S06-03 & S06-04).",
      retention: "30 days rolling automatic purge unless flagged by building security administration."
    },
    {
      category: "Financial & Escrow Payout Data",
      dataTypes: "Razorpay Virtual Nodal Account numbers, Bank IFSC Code, GST Tax Invoices, Escrow Release Sign-Offs",
      purpose: "Processing 90/10 milestone disbursements for FM work orders and lease commission payouts.",
      retention: "8 years under Indian Income Tax Act & GST statutory audit mandates."
    },
    {
      category: "Facility Management Operational Logs",
      dataTypes: "Asset Serial Numbers, PPM Checklists, Helpdesk Ticket Logs, Equipment Health Sensor Metrics",
      purpose: "Preventive maintenance scheduling, SLA tracking, building operational analytics.",
      retention: "Retained for active building lifecycle."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-removebg-preview.png" alt="OfficeX" width={28} height={28} />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={90} height={18} />
          </Link>
          <span className="text-slate-300 font-light hidden sm:inline">|</span>
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider hidden sm:inline">Privacy & Data Governance</span>
        </div>

        <Link 
          href="/"
          className="px-3.5 py-1.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
        >
          <ArrowLeft size={13} /> <span className="hidden sm:inline">Back</span> Home
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#0F8B7D]/90 text-white py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold mb-3">
            <Lock size={14} />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-2 font-medium leading-relaxed">
            We are committed to safeguarding corporate data, tenant records, and visitor information across all 9 OfficeX platform portals using enterprise-grade encryption.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-[11px] sm:text-xs text-slate-300 font-semibold border-t border-white/10 pt-3">
            <span>Effective Date: September 2026</span>
            <span className="hidden sm:inline">•</span>
            <span>Data Center: AWS Mumbai Region (ap-south-1)</span>
            <span className="hidden sm:inline">•</span>
            <span>Encryption: AES-256 & TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col gap-8 md:gap-10">
        
        {/* Core Principles Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 text-[#0F8B7D] flex items-center justify-center font-bold mb-4">
              <Server size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Sovereign Data Storage</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              All commercial real estate databases, rent rolls, and visitor records are hosted strictly within AWS Indian Region data centers (ap-south-1) in compliance with local data localization mandates.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Key size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Zero Third-Party Sale</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              We never monetize or sell corporate lead data, property listings, or facility maintenance records to ad networks or data brokers.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
              <UserCheck size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">DPDP Rights Enforced</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
              Users retain full rights to request access, correction, or erasure of personal profile data under India’s Digital Personal Data Protection Act (DPDP 2023).
            </p>
          </div>
        </section>

        {/* Data Processing Matrix Table */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <Database size={20} className="text-[#0F8B7D]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">Data Processing & Retention Matrix</h2>
          </div>

          <div className="overflow-x-auto [::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[640px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Category</th>
                  <th className="p-3.5">Collected Data Points</th>
                  <th className="p-3.5">Business Purpose</th>
                  <th className="p-3.5 rounded-r-xl">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {dataProcessingCategories.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{item.category}</td>
                    <td className="p-3.5 text-slate-600">{item.dataTypes}</td>
                    <td className="p-3.5">{item.purpose}</td>
                    <td className="p-3.5 text-[#0F8B7D] font-bold">{item.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cookie Preferences Interactive Box */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-900 font-black text-base mb-2">
              <Eye size={18} className="text-[#0F8B7D]" /> Cookie & Tracking Preferences
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
              OfficeX uses essential cookies for authentication and role-based portal routing. You can customize non-essential analytics and preference tracking below.
            </p>
          </div>

          <div className="w-full md:w-80 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Essential Portal Cookies</span>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Always On</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div>
                <div className="text-xs font-bold text-slate-800">Performance Analytics</div>
                <div className="text-[10px] text-slate-400 font-medium">Helps us optimize query response time.</div>
              </div>
              <input 
                type="checkbox" 
                checked={cookieAnalytics}
                onChange={(e) => setCookieAnalytics(e.target.checked)}
                className="w-4 h-4 text-[#0F8B7D] rounded focus:ring-[#0F8B7D] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div>
                <div className="text-xs font-bold text-slate-800">Product Announcements</div>
                <div className="text-[10px] text-slate-400 font-medium">Notifies you of new portal features.</div>
              </div>
              <input 
                type="checkbox" 
                checked={cookieMarketing}
                onChange={(e) => setCookieMarketing(e.target.checked)}
                className="w-4 h-4 text-[#0F8B7D] rounded focus:ring-[#0F8B7D] cursor-pointer"
              />
            </div>

            <button 
              onClick={handleSaveCookiePreferences}
              className="w-full py-2 rounded-lg bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] transition-colors cursor-pointer mt-2"
            >
              {savedCookies ? "Preferences Saved!" : "Save Preferences"}
            </button>
          </div>
        </section>

        {/* Data Protection Officer (DPO) Contact Box */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3">
              <Mail size={14} /> Data Protection Officer (DPO)
            </div>
            <h3 className="text-lg font-extrabold text-white">Have Privacy Grievances or Data Requests?</h3>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-lg">
              Reach out directly to our appointed Data Protection Officer under DPDP Act 2023 for data access requests, consent withdrawal, or privacy compliance auditing.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-full md:w-auto shrink-0">
            <div><span className="text-slate-400">Email:</span> privacy@officex.pro</div>
            <div><span className="text-slate-400">Entity:</span> Scalezix Ventures LLP</div>
            <div><span className="text-slate-400">Response SLA:</span> Within 48 hours</div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Key, 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  FileCode, 
  Cpu, 
  Award, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Database
} from "lucide-react";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<"infrastructure" | "compliance" | "disclosure">("infrastructure");

  const securityPillars = [
    {
      title: "Bank-Grade Escrow Security",
      icon: ShieldCheck,
      desc: "All FM marketplace transactions are routed through Razorpay Nodal Escrow Accounts. Funds are locked under 90/10 milestone disbursal rules."
    },
    {
      title: "Data Encryption Standards",
      icon: Lock,
      desc: "Database storage uses AES-256 encryption at rest. All network communications are encrypted via TLS 1.3 with standard HSTS headers."
    },
    {
      title: "AWS Sovereign Infrastructure",
      icon: Server,
      desc: "Hosted on AWS Asia Pacific (Mumbai ap-south-1) region with multi-AZ redundancy, daily automated snapshots, and 99.8% SLA uptime."
    },
    {
      title: "Role-Based Access (RBAC)",
      icon: Key,
      desc: "Granular access control maps platform permissions across 9 specialized portals (Landlord, Tenant, FM Vendor, Ops Desk, Super Admin)."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-removebg-preview.png" alt="OfficeX" width={28} height={28} />
            <Image src="/name-removebg-preview.png" alt="OfficeX" width={90} height={18} />
          </Link>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trust & Security Center</span>
        </div>

        <Link 
          href="/"
          className="px-4 py-1.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
        >
          <ArrowLeft size={13} /> Back Home
        </Link>
      </header>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#0F8B7D]/90 text-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold mb-4">
            <ShieldCheck size={14} />
            <span>SOC 2 Type II & ISO 27001 Certified Framework</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Security & Infrastructure Architecture</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-3 font-medium leading-relaxed">
            Discover how OfficeX protects institutional property portfolios, lease financial records, and vendor escrow transactions with enterprise security controls.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-300 font-semibold border-t border-white/10 pt-4">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Status: 99.8% Uptime
            </span>
            <span>•</span>
            <span>PCI-DSS Level 1 Escrow Gateway</span>
            <span>•</span>
            <span>AWS Mumbai Cloud</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col gap-10">
        
        {/* Security Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityPillars.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 text-[#0F8B7D] flex items-center justify-center font-bold mb-4">
                  <IconComponent size={20} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Tabbed Detail Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
          <div className="flex border-b border-slate-200 gap-6 mb-6">
            <button 
              onClick={() => setActiveTab("infrastructure")}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "infrastructure"
                  ? "border-[#0F8B7D] text-[#0F8B7D]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Infrastructure Security
            </button>
            <button 
              onClick={() => setActiveTab("compliance")}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "compliance"
                  ? "border-[#0F8B7D] text-[#0F8B7D]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Certifications & Audits
            </button>
            <button 
              onClick={() => setActiveTab("disclosure")}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "disclosure"
                  ? "border-[#0F8B7D] text-[#0F8B7D]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Vulnerability Disclosure
            </button>
          </div>

          {activeTab === "infrastructure" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">Multi-Tenant Isolation</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                  Each enterprise organization operates within isolated logical partition boundaries. Tenant profiles, property registries, and maintenance tickets cannot cross-bleed between corporate workspaces.
                </p>
                
                <h3 className="text-base font-extrabold text-slate-900 mb-2">Automated Disaster Recovery</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Real-time database replication across AWS Mumbai availability zones ensures a Recovery Point Objective (RPO) of &lt; 5 minutes and Recovery Time Objective (RTO) of &lt; 30 minutes in event of regional outage.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs font-semibold flex flex-col gap-3">
                <div className="text-[10px] font-black text-slate-400 uppercase">Live Infrastructure Indicators</div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <span>API Response SLA</span>
                  <span className="text-emerald-600 font-bold">142ms Avg</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <span>SSL/TLS Rating</span>
                  <span className="text-[#0F8B7D] font-bold">Qualys A+ Grade</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <span>WAF Protection</span>
                  <span className="text-emerald-600 font-bold">Active DDoS Shield</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Award size={24} className="text-[#0F8B7D]" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">SOC 2 Type II Attestation</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Independent annual audit covering Security, Availability, and Confidentiality trust principles.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck size={24} className="text-emerald-600" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">ISO/IEC 27001:2022 Certified</h4>
                  <p className="text-[11px] text-slate-500 font-medium">International standard for Information Security Management Systems (ISMS).</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Lock size={24} className="text-purple-600" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">PCI-DSS Level 1 Escrow Gateway</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Payment escrow nodal accounts processed under CERT-In and Reserve Bank of India (RBI) payment aggregator guidelines.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "disclosure" && (
            <div className="animate-fadeIn">
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Responsible Vulnerability Disclosure</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                We welcome independent security researchers to audit OfficeX web portals. If you discover a security vulnerability, please report it responsible to our security team.
              </p>
              
              <div className="bg-slate-900 text-white rounded-xl p-4 text-xs font-mono">
                <div>Email: security@officex.pro</div>
                <div>PGP Key Fingerprint: 4A89 9012 BC78 1109 FE32</div>
                <div className="text-emerald-400 mt-2">// We review reports within 24 hours and issue bounties for validated findings.</div>
              </div>
            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}

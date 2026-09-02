"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Search, 
  Download, 
  Flame, 
  Award, 
  Users, 
  Cpu, 
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function CompliancePage() {
  const [searchProperty, setSearchProperty] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const sampleProperties = [
    {
      id: "apex-bkc",
      name: "Apex Business Tower",
      location: "BKC, Mumbai",
      fireNOC: "Valid till Dec 2026",
      fireStatus: "Valid",
      ocStatus: "Issued (2019)",
      liftLicense: "Renewed (Form A)",
      pcbConsent: "Valid (CTO-9081)",
      esgRating: "Gold (LEED Certified)",
      overallScore: 98
    },
    {
      id: "meridian-whitefield",
      name: "Meridian Tech Park",
      location: "Whitefield, Bengaluru",
      fireNOC: "Valid till Oct 2026",
      fireStatus: "Valid",
      ocStatus: "Issued (2021)",
      liftLicense: "Renewed (Form A)",
      pcbConsent: "Valid (CTO-4412)",
      esgRating: "Platinum (IGBC)",
      overallScore: 99
    },
    {
      id: "nexus-hinjewadi",
      name: "Nexus Innovation Hub",
      location: "Hinjewadi, Pune",
      fireNOC: "Renewal Pending",
      fireStatus: "Warning",
      ocStatus: "Issued (2020)",
      liftLicense: "Renewed (Form A)",
      pcbConsent: "Valid (CTO-7721)",
      esgRating: "Silver Certified",
      overallScore: 91
    },
    {
      id: "devasya-gold",
      name: "Devasya Gold Commercial",
      location: "SBR / Nikol, Ahmedabad",
      fireNOC: "Valid till Nov 2026",
      fireStatus: "Valid",
      ocStatus: "Issued (2022)",
      liftLicense: "Renewed (Form A)",
      pcbConsent: "Valid (CTO-1192)",
      esgRating: "Certified Green Building",
      overallScore: 96
    }
  ];

  const complianceStandards = [
    {
      title: "National Building Code (NBC 2016)",
      category: "Structural & Architectural",
      icon: Building,
      description: "Mandates structural safety, seismic zone compliance, emergency egress widths, and occupant load ratios for commercial office towers."
    },
    {
      title: "Fire Safety NOC (Form B)",
      category: "Life Safety & Emergency",
      icon: Flame,
      description: "Requires half-yearly inspection of sprinkler pressure lines, hose reels, smoke evacuation fans, and certified fire drill logs."
    },
    {
      title: "Lift & Electrical Inspectorate",
      category: "Engineering Safety",
      icon: Cpu,
      description: "Annual License (Form A) for passenger elevators, DG Set pollution compliance permits, and transformer earth-pit resistance testing."
    },
    {
      title: "Contract Labor & Minimum Wages",
      category: "Vendor & Manpower Compliance",
      icon: Users,
      description: "Audits FM contractor ESI/EPF challans, minimum wage payouts, and workman compensation insurance prior to milestone escrow payouts."
    }
  ];

  const filteredProperties = sampleProperties.filter(p => 
    p.name.toLowerCase().includes(searchProperty.toLowerCase()) ||
    p.location.toLowerCase().includes(searchProperty.toLowerCase())
  );

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
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Statutory Compliance Hub</span>
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
            <FileCheck size={14} />
            <span>Statutory Real Estate Standards</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Statutory & Operational Compliance</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-3 font-medium leading-relaxed">
            Verify real-time Occupation Certificates, Fire NOCs, Lift licenses, and labor law compliance for institutional commercial properties across India.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-300 font-semibold border-t border-white/10 pt-4">
            <span>Building Codes: NBC 2016 Compliant</span>
            <span>•</span>
            <span>Fire Auditing: Form B Verified</span>
            <span>•</span>
            <span>Labor Audits: ESI / EPF Auto-Check</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col gap-10">
        
        {/* Compliance Standards Card Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceStandards.map((std, idx) => {
            const IconComponent = std.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 text-[#0F8B7D] flex items-center justify-center font-bold mb-4">
                  <IconComponent size={20} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D]">{std.category}</div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{std.title}</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{std.description}</p>
              </div>
            );
          })}
        </section>

        {/* Interactive Property Compliance Verification Tool */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0F8B7D] uppercase tracking-wider">
                <ShieldCheck size={16} /> Live Verification Console
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">Property Statutory NOC & Compliance Verification</h2>
              <p className="text-xs text-slate-500 font-medium">Search listed buildings to inspect active fire safety NOCs, structural certificates, and PCB permits.</p>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                value={searchProperty}
                onChange={(e) => setSearchProperty(e.target.value)}
                placeholder="Search building name or city..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProperties.map((prop) => {
              const isSelected = selectedBuilding === prop.id;
              return (
                <div 
                  key={prop.id}
                  onClick={() => setSelectedBuilding(isSelected ? null : prop.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "border-[#0F8B7D] bg-[#0F8B7D]/5 shadow-sm" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{prop.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{prop.location}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <Award size={13} /> {prop.overallScore}/100 Score
                    </div>
                  </div>

                  <hr className="border-slate-200/80 my-4" />

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Fire NOC (Form B)</span>
                      <span className={`font-bold ${prop.fireStatus === "Valid" ? "text-emerald-600" : "text-amber-600"}`}>
                        {prop.fireNOC}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Occupation Cert.</span>
                      <span className="text-slate-800 font-bold">{prop.ocStatus}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Elevator License</span>
                      <span className="text-slate-800 font-bold">{prop.liftLicense}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">ESG / Green Rating</span>
                      <span className="text-[#0F8B7D] font-bold">{prop.esgRating}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#0F8B7D]">
                    <span>{isSelected ? "Hide Audit Details" : "View Complete Statutory Audit"}</span>
                    <ChevronRight size={14} className={isSelected ? "transform rotate-90 transition-transform" : ""} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Downloadable Compliance Checklists */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3">
              <Download size={14} /> Download Center
            </div>
            <h3 className="text-lg font-extrabold text-white">Institutional Property Compliance Toolkit</h3>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-lg">
              Download official OfficeX compliance checklists for quarterly Fire NOC audits, lift safety maintenance logs, and vendor labor law compliance verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => alert("Downloading OfficeX Statutory Fire NOC & Lift Audit Checklist PDF...")}
              className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Download size={14} /> Statutory Checklist (PDF)
            </button>
            <Link 
              href="/properties/compliance"
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Landlord Compliance Desk</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

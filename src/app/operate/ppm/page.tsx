"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Cpu,
  QrCode,
  Activity,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function PpmProductPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sampleAssets = [
    {
      name: "Chiller Plant #2 (Centrifugal 450 TR)",
      tag: "HVAC-CH-002",
      location: "Basement 2 · Central Energy Plant",
      health: "98% Health Index",
      healthColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      nextService: "Monthly Descaling in 4 Days",
      vendor: "Carrier Commercial Systems",
      frequency: "Monthly Cadence"
    },
    {
      name: "Diesel Generator #1 (1500 kVA Silent)",
      tag: "DG-GEN-001",
      location: "Podium West · Substation Bay",
      health: "Needs A-Check (Due in 6d)",
      healthColor: "text-amber-800 bg-amber-50 border-amber-200",
      nextService: "Fuel filter & lube oil check",
      vendor: "Cummins PowerCare",
      frequency: "Bi-Weekly Cadence"
    },
    {
      name: "Main HT Transformer (11 kV / 433 V)",
      tag: "ELEC-XFR-001",
      location: "Transformer Yard · Bay 3",
      health: "100% Certified",
      healthColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      nextService: "Thermovision Audit in 18 Days",
      vendor: "Schneider Electric Field Ops",
      frequency: "Quarterly Cadence"
    },
    {
      name: "Hydro-Pneumatic Fire Booster Pumps",
      tag: "PUMP-HYD-004",
      location: "Pumproom · Level -1",
      health: "Pressure Calibrated (8.2 bar)",
      healthColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      nextService: "Gland Packing Service in 9 Days",
      vendor: "Kirloskar Brothers AMC",
      frequency: "Monthly Cadence"
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "52-Week OEM Maintenance Matrix",
      desc: "Pre-loaded OEM service schedules for Daikin, Carrier, Cummins, Schindler, and Schneider Electric equipment."
    },
    {
      icon: QrCode,
      title: "Asset QR Passports on Equipment",
      desc: "Technicians scan QR codes affixed to AHUs, transformers, and chillers to verify physical presence and log parameters."
    },
    {
      icon: Clock,
      title: "Real-Time MTTR & Downtime Clocks",
      desc: "Track mean time to repair (MTTR) with automatic countdowns. Escalates breaches to Chief Engineers via WhatsApp."
    },
    {
      icon: Activity,
      title: "Zero Paper Logbook Replacement",
      desc: "Transform clipboards and physical registers into digitized, timestamped logs with geofenced technician check-ins."
    }
  ];

  const faqs = [
    {
      q: "Does OfficeX support multi-vendor maintenance contracts?",
      a: "Yes. Different equipment can be mapped to different external AMC providers (e.g. Carrier for HVAC, Cummins for DG, KONE for elevators) with independent SLAs, contact points, and work order approval flows."
    },
    {
      q: "How do technicians submit servicing logs on ground?",
      a: "Technicians scan the tamper-proof QR code on the equipment using any smartphone. The system prompts for mandatory telemetry (oil pressure, run hours, coolant temperature, vibration levels) before allowing ticket closure."
    },
    {
      q: "What happens when an urgent breakdown occurs outside scheduled PPM?",
      a: "Field engineers can log an immediate breakdown ticket with 1 click. The platform calculates MTTR against agreed SLA contracts and notifies the vendor's emergency dispatch team."
    },
    {
      q: "Can maintenance costs be tied directly to tenant CAM billing?",
      a: "Yes. All verified AMC invoice milestones and consumable purchases flow into the OfficeX Rent Roll & CAM billing engine for transparent, audit-proof recovery from tenants."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#0D7B6C] selection:text-white">
      <MarketingHeader activePath="/operate" />

      {/* ── Breadcrumb Bar ── */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/operate" className="hover:text-slate-900 transition-colors">
            SaaS Platform
          </Link>
          <span>/</span>
          <span className="text-[#0D7B6C] font-bold">52-Week PPM &amp; CAFM</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Clean, Daylight White
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
                <Wrench size={15} className="text-[#0D7B6C]" />
                <span>OFFICEX.PRO · 52-WEEK PPM &amp; CAFM</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
                52-Week PPM &amp;{" "}
                <span className="text-[#0D7B6C]">
                  Digital Asset Passports
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Replace paper logbooks and WhatsApp maintenance chaos. Digitize preventive equipment servicing, enforce vendor SLA adherence, and guarantee 99.8% MEP uptime across your commercial towers.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Enquire for 52-Week PPM</span>
                  <ArrowRight size={15} />
                </button>
                <Link
                  href="/ops/ppm"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Explore Live PPM Console</span>
                  <ArrowUpRight size={14} className="text-[#0D7B6C]" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#0D7B6C]" /> 99.8% Uptime SLA</span>
                <span className="flex items-center gap-1.5"><QrCode size={15} className="text-[#0D7B6C]" /> QR Asset Passports</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#0D7B6C]" /> Automated Work Orders</span>
              </div>

            </div>

            {/* Right Column (6 cols) — Clean Daylight Window */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 text-slate-900 relative">
                
                <div className="flex items-center justify-between border-b border-slate-200/80 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 px-5 py-3 sm:px-6 rounded-t-3xl bg-slate-50 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[11px] text-slate-500 ml-2">
                      app.officex.in/ops/52-week-ppm-matrix
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0D7B6C] border border-teal-200">
                    WEEK 38 ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {sampleAssets.map((asset, idx) => (
                    <div key={idx} className="bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5 text-xs shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{asset.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-[#0D7B6C] border border-slate-200 font-bold">
                              {asset.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{asset.location} · {asset.vendor}</span>
                        </div>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${asset.healthColor}`}>
                          {asset.health}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100 font-medium">
                        <span className="flex items-center gap-1.5 text-[#0D7B6C] font-semibold">
                          <Clock size={12} /> {asset.nextService}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">{asset.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    34 Active Scheduled Maintenance Tickets
                  </span>
                  <Link href="/ops/ppm" className="text-[#0D7B6C] hover:text-[#0A6357] font-bold flex items-center gap-1">
                    <span>Open PPM Console</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. FEATURE DEEP DIVE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              ENTERPRISE CAFM &amp; ASSET RIGOR
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything Needed for 99.8% Building Mechanical &amp; Electrical Uptime
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] border border-teal-200/80 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. FAQS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D7B6C]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Common Questions About 52-Week PPM &amp; CAFM
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4.5 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180 text-[#0D7B6C]" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4.5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. BOTTOM CTA BAND
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Upgrade Your Mechanical &amp; Electrical Infrastructure to 52-Week Rigor
          </h2>
          <p className="text-sm sm:text-base text-teal-50 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
            Eliminate equipment failures and track all vendor AMCs in real time. Schedule a 52-Week PPM walkthrough today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Request 52-Week PPM Walkthrough
            </button>
            <Link
              href="/ops/ppm"
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all"
            >
              Explore Live PPM Console
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["52-Week PPM & CAFM"] }}
      />
    </div>
  );
}

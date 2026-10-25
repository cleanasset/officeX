"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Users,
  AlertTriangle,
  Building2,
  Lock,
  Layers,
  FileCheck2,
  Flame,
  Activity,
  ChevronRight,
  HardHat,
  Truck,
  Eye,
  Zap,
  BarChart3,
  Clock,
  ExternalLink,
  Check,
  Play,
  RotateCw,
  Bell,
  Cpu,
  Compass,
  FileText,
  BadgeAlert,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

export default function VisitorComplianceLandingPage() {
  const [activeTab, setActiveTab] = useState<"visitor" | "compliance" | "emergency" | "contractor">("visitor");
  
  // Interactive Optical Gate Simulation State
  const [gateScanning, setGateScanning] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [liveOccupancy, setLiveOccupancy] = useState(142);
  const [lastScanMessage, setLastScanMessage] = useState("Optical Gate #1 • Standby for NFC/QR");

  // Interactive Coupon Sandbox State
  const [sandboxCoupon, setSandboxCoupon] = useState("visitor001");
  const [couponApplied, setCouponApplied] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // Radar Sweeper Blip State
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const triggerGateScan = () => {
    if (gateScanning || gateOpen) return;
    setGateScanning(true);
    setLastScanMessage("Laser scanning WhatsApp QR token...");

    setTimeout(() => {
      setGateScanning(false);
      setGateOpen(true);
      setLiveOccupancy((prev) => prev + 1);
      setLastScanMessage("✓ PASS-2026-9981 VERIFIED • UNLATCHING TURNSTILE (18s TRANSIT)");

      setTimeout(() => {
        setGateOpen(false);
        setLastScanMessage("Gate locked • Resumed Standby Radar");
      }, 3500);
    }, 900);
  };

  const handleSandboxApply = () => {
    setCalculatingPrice(true);
    setTimeout(() => {
      setCalculatingPrice(false);
      if (sandboxCoupon.trim().toLowerCase() === "visitor001") {
        setCouponApplied(true);
      } else {
        setCouponApplied(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased overflow-x-hidden">
      {/* Header */}
      <MarketingHeader activePath="/visitor-compliance" />

      {/* Embedded High-End Animations */}
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-0.5deg); }
        }
        @keyframes laser-sweep {
          0% { top: 0%; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.2; }
        }
        @keyframes radar-beam {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        .animate-float-gentle {
          animation: float-gentle 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 7s ease-in-out infinite;
        }
        .animate-laser {
          animation: laser-sweep 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-radar-beam {
          animation: radar-beam 4s linear infinite;
        }
        .animate-glow-pulse {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>

      {/* HERO SECTION WITH 3D FLOATING CARDS & AMBIENT GLOW */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-emerald-500/15 blur-[160px] pointer-events-none rounded-full" />
        <div className="absolute top-12 left-8 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-10 right-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Commercial Front-Desk & Statutory Radar
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
            Commercial Security & Compliance.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Engineered for Grade-A Assets.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-slate-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Replace residential apps and paper binders. Control high-speed optical speed-gates, contractor permit-to-work approvals, and statutory 48-NOC fire and elevator certifications in one enterprise SaaS.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/visitor-compliance/pricing"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-cyan-600/30 transition-all flex items-center gap-2.5 group hover:scale-[1.02]"
            >
              <span>Get Started for ₹999/mo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/vc/dashboard"
              className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-700/80 font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-xl hover:border-cyan-500/50"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Launch Live SaaS Dashboard</span>
            </Link>
          </div>

          {/* Launch Offer Promo Note */}
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1">
            <span className="text-emerald-400 font-bold">✓ Launch Offer:</span>
            <span>Use coupon code</span>
            <code className="text-cyan-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">visitor001</code>
            <span>for 100% free instant access</span>
          </div>

          {/* HERO VISUAL: 3D ANGLED FLOATING CARDS (MATCHING USER REFERENCE) */}
          <div className="pt-10 pb-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              
              {/* Card 1: Rent Roll Reference */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#0D1C1B] to-[#081212] border border-teal-500/30 shadow-2xl text-left transform lg:-rotate-2 hover:rotate-0 transition-all duration-300 group hover:-translate-y-2 animate-float-gentle">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                    OCCUPIED
                  </span>
                  <span className="font-mono text-xs text-teal-400 font-bold">₹42.8L</span>
                </div>
                <div className="space-y-1.5 py-3 border-y border-teal-900/40 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Floor 8 (TechCorp)</span>
                    <span className="text-teal-200">₹18.5L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Floor 4 (FinTech)</span>
                    <span className="text-teal-200">₹14.2L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Floor 1 (Bain Adv)</span>
                    <span className="text-teal-200">₹10.1L</span>
                  </div>
                </div>
                <div className="pt-3">
                  <div className="text-base font-extrabold text-white">Rent Roll</div>
                  <div className="text-[11px] text-teal-400/80">Monthly ARR • ₹42.8L</div>
                </div>
              </div>

              {/* Card 2: Visitor Flow (Optical Gate / WhatsApp QR Pass) */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#0B2129] to-[#071318] border border-cyan-500/50 shadow-2xl text-left transform lg:-rotate-1 hover:rotate-0 transition-all duration-300 group hover:-translate-y-2 ring-2 ring-cyan-500/20 animate-float-reverse">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    OPTICAL GATE
                  </span>
                  <span className="font-mono text-xs text-cyan-300 font-bold">18s FAST</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-900/60 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white text-[11px]">WhatsApp QR Pass</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>In: <strong className="text-white">{liveOccupancy}</strong></span>
                    <span className="text-emerald-400">● Live Beam</span>
                    <span>Relay: <strong className="text-cyan-300">0.2s</strong></span>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-base font-extrabold text-white">Visitor Flow</div>
                  <div className="text-[11px] text-cyan-400">Transit Speed • 18 Sec</div>
                </div>
              </div>

              {/* Card 3: Compliance (100% Compliant / 48 NOCs) */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#0A261D] to-[#061812] border border-emerald-500/50 shadow-2xl text-left transform lg:rotate-1 hover:rotate-0 transition-all duration-300 group hover:-translate-y-2 ring-2 ring-emerald-500/20 animate-float-gentle">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    100% COMPLIANT
                  </span>
                  <span className="font-mono text-xs text-emerald-300 font-bold">48 NOCs</span>
                </div>

                <div className="space-y-1.5 py-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Fire Safety NOC (Form B)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Lift Form A Certificate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pollution Board (CTO)</span>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-base font-extrabold text-white">Compliance</div>
                  <div className="text-[11px] text-emerald-400">Tower Audits • 48 Licenses</div>
                </div>
              </div>

              {/* Card 4: Chiller & MEP (99.8% Uptime) */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#0B1E26] to-[#071318] border border-cyan-500/30 shadow-2xl text-left transform lg:rotate-2 hover:rotate-0 transition-all duration-300 group hover:-translate-y-2 animate-float-reverse">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                    CHILLER & MEP
                  </span>
                  <span className="font-mono text-xs text-cyan-300 font-bold">99.8%</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-white">Chiller Plant-01</span>
                    <span className="text-emerald-400 font-semibold">Optimal</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 py-1">
                    <div className="h-2 rounded bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <div className="h-2 rounded bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <div className="h-2 rounded bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <div className="h-2 rounded bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <div className="h-2 rounded bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">52-WEEK OEM MATRIX DISPATCH</div>
                </div>

                <div className="pt-3">
                  <div className="text-base font-extrabold text-white">52-Week PPM</div>
                  <div className="text-[11px] text-cyan-400">MEP Uptime • 99.8%</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TWO INTERACTIVE LIVE SIMULATOR WIDGETS (OPTICAL SPEEDGATE & COMPLIANCE RADAR) */}
      <section className="py-16 bg-slate-950/90 border-t border-b border-slate-900 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Interactive Hardware & Radar Sandbox
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Try The Dual Engines Live Right Here.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Experience the 18-second optical speed-gate unlatch and statutory 360° radar sweep.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SIMULATOR 1: OPTICAL SPEED-GATE TURNSTILE */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Optical Speed-Gate #01</h3>
                    <p className="text-[10px] text-slate-400">Lobby Turnstile Controller • TCP/IP Relay</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE (0.2s)</span>
                </div>
              </div>

              {/* Physical Gate Graphic */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative w-64 h-36 bg-slate-950 rounded-2xl border-2 border-slate-800 flex items-center justify-between px-6 overflow-hidden shadow-inner">
                  
                  {/* Left Gate Column */}
                  <div className="w-10 h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg border border-slate-600 flex flex-col items-center justify-center p-1 relative">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400" />
                    <div className="text-[8px] text-slate-400 mt-2 font-mono">RFID</div>
                  </div>

                  {/* Barrier Acrylic Flaps */}
                  <div className="flex-1 flex items-center justify-center relative h-full">
                    {/* Laser Scanning Beam */}
                    {gateScanning && (
                      <div className="absolute inset-x-4 h-0.5 bg-cyan-400 shadow-lg shadow-cyan-400 animate-laser" />
                    )}

                    {/* Left Flap */}
                    <div
                      className={`h-24 w-8 rounded-sm bg-gradient-to-r from-cyan-500/30 to-cyan-400/80 border border-cyan-300 transition-all duration-500 shadow-lg ${
                        gateOpen ? "-rotate-75 -translate-x-4 opacity-30" : "rotate-0 translate-x-0"
                      }`}
                    />

                    {/* Right Flap */}
                    <div
                      className={`h-24 w-8 rounded-sm bg-gradient-to-l from-cyan-500/30 to-cyan-400/80 border border-cyan-300 transition-all duration-500 shadow-lg ${
                        gateOpen ? "rotate-75 translate-x-4 opacity-30" : "rotate-0 translate-x-0"
                      }`}
                    />

                    {gateOpen && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-mono font-black text-emerald-400 bg-slate-950/90 px-3 py-1 rounded-full border border-emerald-500 shadow-lg animate-bounce">
                          UNLATCHED • PASS
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Gate Column */}
                  <div className="w-10 h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg border border-slate-600 flex flex-col items-center justify-center p-1">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <div className="text-[8px] text-slate-400 mt-2 font-mono">OPTIC</div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 text-center font-mono text-xs text-cyan-300 bg-slate-950 px-4 py-1.5 rounded-lg border border-cyan-900/60 max-w-sm truncate">
                  {lastScanMessage}
                </div>
              </div>

              {/* Simulation Action Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Campus Headcount: <strong className="text-white font-mono text-sm">{liveOccupancy} Inside</strong>
                </div>
                <button
                  type="button"
                  onClick={triggerGateScan}
                  disabled={gateScanning || gateOpen}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{gateScanning ? "Scanning Pass..." : gateOpen ? "Gate Flaps Open" : "Simulate QR Scan (0.2s)"}</span>
                </button>
              </div>
            </div>

            {/* SIMULATOR 2: COMPLIANCE 360° RADAR SWEEPER */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Statutory Health Radar</h3>
                    <p className="text-[10px] text-slate-400">Grade-A Portfolio • 48 Statutory Obligations</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>96.4% HEALTH</span>
                </div>
              </div>

              {/* Physical Radar Dish Graphic */}
              <div className="py-4 flex items-center justify-center gap-6">
                <div className="relative w-40 h-40 rounded-full bg-slate-950 border-2 border-emerald-500/40 flex items-center justify-center overflow-hidden shadow-2xl">
                  {/* Concentric Radar Rings */}
                  <div className="absolute w-28 h-28 rounded-full border border-emerald-500/20" />
                  <div className="absolute w-16 h-16 rounded-full border border-emerald-500/20" />
                  <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/20" />

                  {/* Rotating Sweeper Line */}
                  <div
                    className="absolute inset-0 origin-center pointer-events-none"
                    style={{ transform: `rotate(${radarAngle}deg)` }}
                  >
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-emerald-400/40 origin-right rounded-tl-full" />
                  </div>

                  {/* Blip 1: Fire Safety */}
                  <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400 animate-ping" />
                  {/* Blip 2: Lift License */}
                  <div className="absolute bottom-9 right-8 w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400 animate-pulse" />
                  {/* Blip 3: Pollution Board */}
                  <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
                </div>

                {/* Radar Legend & Active Status */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400" />
                    <span className="text-slate-300">Form 15 Fire NOC: <strong className="text-emerald-300">Compliant</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-sm shadow-amber-400" />
                    <span className="text-slate-300">Lift Form A (8 Cars): <strong className="text-amber-300">Due in 12d</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400" />
                    <span className="text-slate-300">DG Stack Emission: <strong className="text-emerald-300">Valid (CTO)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-sm shadow-cyan-400" />
                    <span className="text-slate-300">PTW Hot Work: <strong className="text-cyan-300">Active (PPE ✓)</strong></span>
                  </div>
                </div>
              </div>

              {/* Simulation Action Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Portfolio Status: <strong className="text-emerald-400 font-bold">47 / 48 NOCs Verified</strong>
                </div>
                <Link
                  href="/vc/compliance"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  <span>Open Full Statutory Register</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DUAL WORKSPACE MODES: HOW USER OPERATES THE 2 SEPARATE THINGS */}
      <section className="py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Architectural Clarity
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Two Powerful SaaS Engines. One Unified Command Center.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Security guards shouldn't deal with statutory pollution certificates, and compliance managers don't need turnstile logs. OFFICEX solves this with our top-level <strong>3-Way Dual-Mode Switcher</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* DOMAIN 1: VISITOR MANAGEMENT FLOW */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl space-y-6 relative group hover:border-cyan-500/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Domain 01</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Visitor Flow Center (VC)</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Tailored for Front-Desk Security, Receptionists, and Tenant Hosts. Control entry speed, optical gates, and campus physical security.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Pre-Registration:</strong> Host invites with instant WhatsApp QR passes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>18s Turnstile Gates:</strong> Direct optical speed-gate TCP/IP relay</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Emergency Roll Call:</strong> 1-Click building evacuation muster manifest</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Watchlist Defense:</strong> Auto-block blacklisted trespassers at reception</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/vc/visitors/live"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Launch Visitor Flow Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* DOMAIN 2: STATUTORY COMPLIANCE RADAR */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl space-y-6 relative group hover:border-emerald-500/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Domain 02</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Compliance Radar (CM)</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Tailored for Facility Managers, EHS Officers, and Property Directors. Manage audit readiness, statutory licenses, and risk matrices.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Statutory Register:</strong> Form 15 Fire, Lift licenses, Pollution CTOs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Permit to Work (PTW):</strong> High-risk hot work & safety prerequisites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>CAPA Tracker:</strong> Root-cause analysis and evidence-gated closures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>5x5 Risk Heatmap:</strong> Inherent and residual risk matrix scoring</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/vc/compliance"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Launch Compliance Radar Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ALL 31 SCREENS CATALOG SPECIFICATION ACCORDION */}
      <section className="py-20 bg-slate-950/80 border-t border-b border-slate-900 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Complete Specification Handover
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Every Screen From The Specification Document, Live.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Toggle between Visitor Gate Operations and Facility Statutory Compliance.
            </p>

            {/* Tab Buttons */}
            <div className="pt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("visitor")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "visitor"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Visitor Management (VC-01 → VC-15)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "compliance"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Statutory Compliance (CM-01 → CM-16)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("emergency")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "emergency"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Emergency Roll Call (VC-13)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contractor")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "contractor"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <HardHat className="w-4 h-4" />
                <span>Contractor & PTW (CM-09)</span>
              </button>
            </div>
          </div>

          {/* Active Tab Container */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl">
            {activeTab === "visitor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded-md">
                    Visitor Operations Suite
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Touchless 18-Second Speed-Gate Entry
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Corporate hosts generate branded invitations with dynamic WhatsApp QR links. Optical speed-gates unlatch instantaneously, host gets a real-time chime on arrival, and reception avoids clipboard congestion.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Host Accept/Decline Workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Security Blacklist Auto-Screening</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Automated Overstay Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>CR80 Thermal Badge Printing</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/vc/visitors/live"
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Explore Live Inside Radar</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-mono text-xs text-cyan-400 font-bold">PASS-2026-0891</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      ACTIVE INSIDE
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Vikram Malhotra</div>
                      <div className="text-xs text-slate-400">Apex Global Advisory</div>
                      <div className="text-[11px] text-cyan-400 mt-1">Host: Arun Jaitley (TechCorp)</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl text-[11px] flex justify-between text-slate-400 font-mono">
                    <span>Lobby Gate #2 Check-in</span>
                    <span>Floor 8 East Wing Access</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    Statutory EHS Engine
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    48 Statutory NOCs & Expiry Radars
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Protect commercial portfolios from municipal penalties and insurance invalidation. Automated tracking of Form 15 Fire NOCs, Lift licenses, Pollution Board CTO discharges, and contract labour ESI/PF registers.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Weighted Compliance Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Mandatory Evidence Proof Vault</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>90, 60, 30, 7-Day Auto Escalation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>CAPA Corrective Action Tracker</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/vc/compliance"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Open Compliance Master Register</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Tower A Statutory Health</span>
                    <span className="text-base font-black text-emerald-400">94.5% A+</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="text-white font-semibold">Fire Safety Form 15 NOC</div>
                      <div className="text-[10px] text-slate-400">State Fire Brigade • Annual</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      Compliant
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="text-white font-semibold">Elevator License (8 Cars)</div>
                      <div className="text-[10px] text-slate-400">Chief Electrical Inspector</div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Due in 12 Days
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2.5 py-1 rounded-md">
                    Emergency Protocol
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    1-Click Building Evacuation Roll Call
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    In fire drills or real building crises, instantly pull an exact headcount of every visitor and contractor inside, organized by tower, core, and floor. Mark occupants safe at assembly points or flag missing individuals for first responders.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/vc/visitors/emergency"
                      className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300"
                    >
                      <span>Simulate Emergency Protocol</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-rose-900/50 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                      EVACUATION PROTOCOL ACTIVE
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      Inside: {liveOccupancy}
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                      <span>Floor 8 East (Executive)</span>
                      <span className="text-rose-300 font-mono font-bold">1 Person</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                      <span>Floor 4 (FinTech Core)</span>
                      <span className="text-rose-300 font-mono font-bold">1 Person</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900">
                      <span>Service Elevator Core #3</span>
                      <span className="text-amber-300 font-mono font-bold">1 Contractor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contractor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                    High-Risk Work Governance
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Permit-to-Work (PTW) & PPE Verification
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Stop unauthorized maintenance on high-voltage switchgear, glass facades, or welding. Every contractor entry requires an active digital PTW permit with verified risk controls and standby fire watch before gates unlatch.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/vc/compliance/permits"
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                    >
                      <span>View Active Work Permits</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-amber-900/50 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-300">PTW-2026-0042 • Hot Work</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      PERMIT APPROVED
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="text-white font-semibold">Elevator Machine Room Servicing</div>
                    <div className="text-slate-400 text-[11px]">Vendor: Otis Elevator India Pvt Ltd</div>
                    <div className="text-[11px] text-emerald-400 pt-1">✓ Fire extinguisher standby & PPE checked</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERACTIVE COUPON & PRICING PREVIEW SANDBOX */}
      <section className="py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-emerald-950/70 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Transparent Commercial SaaS Monetization
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
            Flat ₹999/Month. Or 100% Free with Launch Code.
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-base max-w-xl mx-auto">
            Test the live coupon engine below to experience our instant free activation workflow.
          </p>

          {/* Interactive Coupon Box */}
          <div className="mt-8 max-w-md mx-auto p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={sandboxCoupon}
                onChange={(e) => setSandboxCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleSandboxApply}
                disabled={calculatingPrice}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all"
              >
                {calculatingPrice ? "Checking..." : "Apply"}
              </button>
            </div>

            {/* Price Preview State */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-slate-400">Net Payable:</span>
              <div className="flex items-center gap-2">
                {couponApplied ? (
                  <>
                    <span className="line-through text-slate-500 font-mono">₹999</span>
                    <span className="text-xl font-mono font-black text-emerald-400">₹0.00 / mo</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      100% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-mono font-black text-white">₹999 / mo</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/visitor-compliance/pricing"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2"
            >
              <span>Go to Checkout Page (₹999/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vc/dashboard"
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Open SaaS Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

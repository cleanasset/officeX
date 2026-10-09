"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FileCheck2,
  Wrench,
  Kanban,
  Headphones,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Shield,
  Zap,
  Activity,
  QrCode,
  Calendar,
  Sparkles,
} from "lucide-react";

interface CompactModule {
  id: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  route: string;
  stat: string;
  statLabel: string;
  gradient: string;
  accent: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  renderVisual: () => React.ReactNode;
}

const MODULES: CompactModule[] = [
  {
    id: "rent-roll",
    name: "Rent Roll Master",
    shortName: "Rent Roll",
    category: "Commercial Revenue",
    tagline: "Automate lease escalations, CAM reconciliations, and direct bank escrow with 100% auditability.",
    route: "/properties/rent-roll?tab=dashboard",
    stat: "₹42.8L",
    statLabel: "Monthly ARR",
    gradient: "from-[#0A3C36] via-[#072B27] to-[#041A18]",
    accent: "#0D7B6C",
    icon: Building2,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[8px] font-black text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>98.4% OCCUPIED</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-teal-200">₹42.8L</span>
        </div>
        
        {/* Mini Ledger Stack */}
        <div className="space-y-1 my-auto">
          <div className="flex items-center justify-between text-[8px] bg-white/10 rounded px-1.5 py-0.5 border border-white/10">
            <span className="text-white font-bold truncate">KPMG · Fl 8</span>
            <span className="text-emerald-300 font-mono font-bold">₹18.5L</span>
          </div>
          <div className="flex items-center justify-between text-[8px] bg-white/5 rounded px-1.5 py-0.5 border border-white/5">
            <span className="text-white/80 font-medium truncate">Deloitte · Fl 4</span>
            <span className="text-teal-200 font-mono">₹14.2L</span>
          </div>
          <div className="flex items-center justify-between text-[8px] bg-white/5 rounded px-1.5 py-0.5 border border-white/5">
            <span className="text-white/80 font-medium truncate">Google · Fl 2</span>
            <span className="text-teal-200 font-mono">₹10.1L</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "visitors",
    name: "Visitor Flow & Speed-Gates",
    shortName: "Visitor Flow",
    category: "Smart Lobby Access",
    tagline: "18-Second WhatsApp QR guest passes and optical turnstile relay for corporate towers.",
    route: "/operate/visitors",
    stat: "18 Sec",
    statLabel: "Transit Speed",
    gradient: "from-[#083344] via-[#062431] to-[#03151D]",
    accent: "#0284C7",
    icon: Users,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-[8px] font-black text-cyan-300">
            <Zap size={9} className="text-cyan-400" />
            <span>OPTICAL GATE</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-200">18s FAST</span>
        </div>

        {/* Mini Speedgate Graphic */}
        <div className="my-auto bg-white/10 rounded-lg p-1.5 border border-white/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-300 mb-1">
            <QrCode size={13} />
            <span className="text-[9px] font-bold">WhatsApp QR Pass</span>
          </div>
          <div className="text-[8px] text-white/80 flex items-center justify-around font-mono">
            <span>In: 142</span>
            <span className="text-cyan-400">● Live Beam</span>
            <span>Relay: 0.2s</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "compliance",
    name: "Statutory Compliance",
    shortName: "Compliance",
    category: "Governance & REIT Audit",
    tagline: "Pre-configured legal calendar for Fire NOC, Lift Form A, PCB CTO, and renewal alerts.",
    route: "/operate/compliance",
    stat: "48 Licenses",
    statLabel: "Tower Audits",
    gradient: "from-[#063B2F] via-[#042820] to-[#021712]",
    accent: "#059669",
    icon: FileCheck2,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[8px] font-black text-emerald-300">
            <Shield size={9} className="text-emerald-400" />
            <span>100% COMPLIANT</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-200">48 NOCs</span>
        </div>

        {/* Mini Checklist */}
        <div className="space-y-1 my-auto">
          <div className="flex items-center gap-1 text-[8px] bg-white/10 rounded px-1.5 py-0.5 text-emerald-300 border border-white/5">
            <CheckCircle2 size={10} className="shrink-0" />
            <span className="truncate">Fire Safety NOC (Form B)</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] bg-white/10 rounded px-1.5 py-0.5 text-emerald-300 border border-white/5">
            <CheckCircle2 size={10} className="shrink-0" />
            <span className="truncate">Lift Form A Certificate</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] bg-white/5 rounded px-1.5 py-0.5 text-emerald-200/90 border border-white/5">
            <CheckCircle2 size={10} className="shrink-0" />
            <span className="truncate">Pollution Board (CTO)</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ppm",
    name: "52-Week PPM & CAFM",
    shortName: "52-Week PPM",
    category: "MEP Operations",
    tagline: "Digitize chiller, DG set, and MEP equipment servicing with OEM matrices and QR passports.",
    route: "/operate/ppm",
    stat: "99.8%",
    statLabel: "MEP Uptime",
    gradient: "from-[#0A3D3E] via-[#072B2B] to-[#041B1C]",
    accent: "#0F8B7D",
    icon: Wrench,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500/20 border border-teal-400/30 text-[8px] font-black text-teal-300">
            <Activity size={9} className="text-teal-400" />
            <span>CHILLER & MEP</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-teal-200">99.8%</span>
        </div>

        {/* Mini Telemetry Waveform */}
        <div className="my-auto bg-white/10 rounded-lg p-1.5 border border-white/10 text-center">
          <div className="flex items-center justify-between text-[8px] text-teal-200 mb-1">
            <span>Chiller Plant-01</span>
            <span className="font-mono text-emerald-400">Optimal</span>
          </div>
          <div className="grid grid-cols-6 gap-0.5">
            {[1, 2, 3, 4, 5, 6].map((w) => (
              <div key={w} className="h-2 rounded-xs bg-emerald-400/80" />
            ))}
          </div>
          <span className="text-[7px] text-white/60 block mt-1">52-WEEK OEM MATRIX DISPATCH</span>
        </div>
      </div>
    ),
  },
  {
    id: "crm",
    name: "Lease CRM & Deals",
    shortName: "Lease CRM",
    category: "Commercial Leasing",
    tagline: "Visual deal velocity pipeline from site visits and floor stacking to digital executed LOIs.",
    route: "/operate/lease-crm",
    stat: "₹90L TCV",
    statLabel: "Deal Pipeline",
    gradient: "from-[#0B2A36] via-[#08202A] to-[#04141B]",
    accent: "#14B8A6",
    icon: Kanban,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-[8px] font-black text-cyan-300">
            <Kanban size={9} className="text-cyan-400" />
            <span>DEAL PIPELINE</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-200">₹90L TCV</span>
        </div>

        {/* Mini Pipeline Kanban */}
        <div className="grid grid-cols-3 gap-1 my-auto text-[7px] text-center font-bold">
          <div className="bg-white/10 rounded p-1 border border-white/5">
            <span className="text-white/60 block">TOURS</span>
            <span className="text-cyan-300 font-mono text-[9px]">4</span>
          </div>
          <div className="bg-white/10 rounded p-1 border border-white/5">
            <span className="text-white/60 block">LOI DRAFT</span>
            <span className="text-teal-300 font-mono text-[9px]">2</span>
          </div>
          <div className="bg-emerald-500/20 rounded p-1 border border-emerald-400/20">
            <span className="text-emerald-300 block">CLOSED</span>
            <span className="text-emerald-300 font-mono text-[9px]">1</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "helpdesk",
    name: "Tenant Workplace & Helpdesk",
    shortName: "Helpdesk",
    category: "Occupier Experience",
    tagline: "10-Second QR maintenance ticketing, boardroom reservations, and guaranteed SLA timers.",
    route: "/operate/helpdesk",
    stat: "4.2 Min",
    statLabel: "SLA Resolution",
    gradient: "from-[#073630] via-[#052723] to-[#021715]",
    accent: "#10B981",
    icon: Headphones,
    renderVisual: () => (
      <div className="w-full h-full flex flex-col justify-between p-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500/20 border border-teal-400/30 text-[8px] font-black text-teal-300">
            <Headphones size={9} className="text-teal-400" />
            <span>QR HELPDESK</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-teal-200">4.2m SLA</span>
        </div>

        {/* Mini Ticket & Room Card */}
        <div className="my-auto bg-white/10 rounded-lg p-1.5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[8px]">
            <span className="text-white font-bold">HVAC Ticket #104</span>
            <span className="text-emerald-400 font-mono">04:18 Left</span>
          </div>
          <div className="flex items-center gap-1 text-[7px] text-white/70">
            <Calendar size={8} />
            <span>Boardroom A Reserved 2:00 PM</span>
          </div>
        </div>
      </div>
    ),
  },
];

export function ModuleCoverFlow() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active module is whichever card is hovered, or selectedIndex when not hovered
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activeModule = MODULES[activeIndex];
  const ActiveIcon = activeModule.icon;
  const total = MODULES.length;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    setHoveredIndex(null);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    setHoveredIndex(null);
  };

  const handleCardClick = (idx: number, route: string) => {
    if (idx === activeIndex) {
      router.push(route);
    } else {
      setSelectedIndex(idx);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 select-none overflow-visible">
      {/* 3D Fanned Stage with Responsive Hover-Opening Physics */}
      <div 
        onMouseLeave={() => setHoveredIndex(null)}
        className="relative w-full h-[270px] sm:h-[305px] flex items-center justify-center overflow-visible"
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Module"
          className="absolute -left-2 sm:left-2 top-[50%] -translate-y-1/2 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-[#0D7B6C] border border-slate-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={19} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Module"
          className="absolute -right-2 sm:right-2 top-[50%] -translate-y-1/2 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-[#0D7B6C] border border-slate-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight size={19} />
        </button>

        {/* Fanned Arch Container: ALL 6 CARDS VISIBLE SIMULTANEOUSLY & EXPANDS ON HOVER */}
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          {MODULES.map((item, idx) => {
            // Base offset relative to center of 6 items (index 2.5)
            const posFromMid = idx - 2.5;
            const distFromMid = Math.abs(posFromMid);

            // True interactive state
            const isHovered = hoveredIndex === idx;
            const isSelected = activeIndex === idx;

            // Base horizontal step (130px on desktop)
            const baseStepX = 132;
            const baseX = posFromMid * baseStepX;

            // HOVER OPENING SPREAD PHYSICS:
            // When ANY card H is hovered, all cards to its left part left by -48px,
            // and all cards to its right part right by +48px!
            // This creates a wide opening around the hovered card so it is 100% unobstructed!
            let shiftX = 0;
            if (hoveredIndex !== null) {
              if (idx < hoveredIndex) {
                shiftX = -46;
              } else if (idx > hoveredIndex) {
                shiftX = 46;
              }
            }
            const translateX = baseX + shiftX;

            // Parabolic arch curve: center is slightly elevated, wings dip naturally
            const baseArchY = distFromMid * distFromMid * 5.5;
            
            // Hovered/Active card lifts up by 28px!
            let translateY = baseArchY;
            if (isHovered) {
              translateY = baseArchY - 28;
            } else if (hoveredIndex !== null) {
              translateY = baseArchY + 6; // slightly recede non-hovered cards
            } else if (isSelected) {
              translateY = baseArchY - 14;
            }

            // Natural fan rotation: negative on left, positive on right
            // The active/hovered card straightens up to 0 degrees!
            let rotateZ = posFromMid * 3.8;
            if (isHovered) {
              rotateZ = 0;
            } else if (hoveredIndex !== null) {
              rotateZ = idx < hoveredIndex ? posFromMid * 3.8 - 3 : posFromMid * 3.8 + 3;
            } else if (isSelected) {
              rotateZ = 0;
            }

            // Scale: 1.18 when hovered, 1.08 when selected, 0.90 for idle neighbors
            let scale = 0.92;
            if (isHovered) {
              scale = 1.18;
            } else if (hoveredIndex !== null) {
              scale = 0.88;
            } else if (isSelected) {
              scale = 1.06;
            }

            // Z-Index: Hovered card is ALWAYS 50, otherwise layered outward from active
            const distFromActive = Math.abs(idx - activeIndex);
            const zIndex = isHovered ? 50 : 25 - distFromActive;

            // Opacity: All 6 cards are clearly visible (never hidden)
            const opacity = isHovered ? 1 : hoveredIndex !== null ? 0.84 : 0.95;

            return (
              <div
                key={item.id}
                onMouseEnter={() => {
                  setHoveredIndex(idx);
                  setSelectedIndex(idx);
                }}
                onClick={() => handleCardClick(idx, item.route)}
                style={{
                  transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), 0) rotate(${rotateZ}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  willChange: "transform, opacity",
                }}
                className={`absolute left-1/2 top-1/2 w-[142px] sm:w-[158px] h-[175px] sm:h-[195px] rounded-2xl cursor-pointer transition-all duration-300 ease-out select-none ${
                  isHovered || isSelected
                    ? "ring-4 ring-[#0D7B6C] shadow-2xl shadow-[#0D7B6C]/40 ring-offset-2 ring-offset-[#F8FAFC]"
                    : "shadow-lg shadow-slate-900/15 hover:shadow-xl"
                }`}
              >
                {/* Card Container with Rich Logo-palette Deep Jewel Background */}
                <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b ${item.gradient} border border-white/20 shadow-inner flex flex-col justify-between text-white`}>
                  
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-radial from-teal-400/15 via-transparent to-transparent pointer-events-none" />

                  {/* Artwork / Mini UI Visual Representation */}
                  <div className="relative z-10 w-full h-[115px] sm:h-[130px]">
                    {item.renderVisual()}
                  </div>

                  {/* Center Launch Pulse Button when Hovered/Active (Like Play Button in Hoopr) */}
                  {(isHovered || isSelected) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in zoom-in-75 duration-200">
                      <div className="w-10 h-10 rounded-full bg-white text-[#0D7B6C] flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                        <ArrowUpRight size={20} className="stroke-[2.8]" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Text Scrim (Dark Gradient Overlay with Crisp Typography) */}
                  <div className="relative z-10 p-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-3 text-left">
                    <p className="text-xs sm:text-[13px] font-black tracking-tight text-white leading-tight truncate drop-shadow-md">
                      {item.shortName}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-teal-200 font-semibold truncate mt-0.5">
                      {item.statLabel} · {item.stat}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Info Showcase & Quick Switcher Strip Below Deck */}
      <div className="text-center mt-3 sm:mt-4 animate-in fade-in duration-200">
        
        {/* Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-extrabold text-[#0D7B6C] mb-1.5 shadow-2xs">
          <ActiveIcon size={13} />
          <span>{activeModule.category}</span>
        </div>

        {/* Big Active Title */}
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
          {activeModule.name}
        </h3>

        {/* Active Tagline */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto line-clamp-1 mt-1">
          {activeModule.tagline}
        </p>

        {/* Primary Action Button */}
        <div className="mt-3.5 flex items-center justify-center gap-2">
          <Link
            href={activeModule.route}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs sm:text-sm font-extrabold tracking-wide transition-all shadow-md shadow-[#0D7B6C]/25 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Launch {activeModule.shortName} Live Engine</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ALL 6 SAAS QUICK SELECTOR PILLS — All 6 modules visible & switchable */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 max-w-2xl mx-auto px-2">
          {MODULES.map((m, i) => {
            const isTabActive = i === activeIndex;
            const TabIcon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedIndex(i);
                  setHoveredIndex(null);
                }}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  setSelectedIndex(i);
                }}
                aria-label={`Select ${m.shortName}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? "bg-[#0D7B6C] text-white shadow-sm scale-105"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-teal-300"
                }`}
              >
                <TabIcon size={12} className={isTabActive ? "text-teal-200" : "text-slate-500"} />
                <span>{m.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  QrCode,
  Clock,
  CalendarCheck2,
  BellRing,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Flame,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Building2,
  Users,
  Check,
  Send,
  Zap,
  Coffee,
  MonitorCheck
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";

export default function HelpdeskProductPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"tickets" | "amenities" | "broadcasts">("tickets");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sampleTickets = [
    {
      id: "HD-8042",
      title: "HVAC Temperature Calibration · Boardroom A",
      tenant: "Deloitte Shared Services",
      location: "Tower 2 · Floor 8 · Executive Zone",
      priority: "P1 - Critical",
      priorityBadge: "bg-rose-50 text-rose-700 border-rose-200",
      slaRemaining: "14 mins remaining",
      slaColor: "text-amber-800",
      assignedTo: "Praveen K. (Senior MEP Lead)",
      status: "In Progress",
      statusColor: "bg-teal-50 text-teal-700 border-teal-200"
    },
    {
      id: "HD-8041",
      title: "Optical Speed-Gate #3 RFID Scanner Latency",
      tenant: "Lobby Security & Concierge",
      location: "Tower 1 · Main Turnstile Bay",
      priority: "P2 - High",
      priorityBadge: "bg-amber-50 text-amber-800 border-amber-200",
      slaRemaining: "38 mins remaining",
      slaColor: "text-emerald-700",
      assignedTo: "Vikas M. (Access & IoT)",
      status: "Technician Dispatched",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      id: "HD-8039",
      title: "Executive Townhall AV Setup & Wireless Mics (45 Pax)",
      tenant: "Google Enterprise Services",
      location: "Tower 2 · Floor 5 · Auditorium",
      priority: "P3 - Standard",
      priorityBadge: "bg-slate-100 text-slate-700 border-slate-200",
      slaRemaining: "Completed (10m ago)",
      slaColor: "text-emerald-700",
      assignedTo: "Hospitality & AV Ops",
      status: "Resolved (5.0 ★)",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "HD-8038",
      title: "Water Filtration Cartridge Scheduled Replacement",
      tenant: "Tata Digital Tech Lab",
      location: "Tower 1 · Floor 7 · Pantry Central",
      priority: "P4 - Routine",
      priorityBadge: "bg-slate-100 text-slate-700 border-slate-200",
      slaRemaining: "Completed today",
      slaColor: "text-emerald-700",
      assignedTo: "Soft Services Team",
      status: "Closed & Signed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  ];

  const meetingRooms = [
    {
      name: "The Boardroom (Grand Suite)",
      tower: "Tower 1 · Floor 14",
      capacity: "24 Seats",
      features: "Dual 85\" 4K Displays · Polycom Studio · Dedicated Pantry Bar",
      status: "Reserved 14:00 - 16:30",
      tenant: "McKinsey & Co.",
      badge: "bg-amber-50 text-amber-800 border-amber-200"
    },
    {
      name: "Strategy Studio Alpha",
      tower: "Tower 2 · Floor 6",
      capacity: "12 Seats",
      features: "Interactive Whiteboard · Zoom Room · Sound Isolation",
      status: "Available Now",
      tenant: "Instant 1-Tap Booking",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      name: "Townhall Amphitheatre",
      tower: "Central Podium · Level 2",
      capacity: "120 Seats",
      features: "Dolby Stage Audio · Dual HD Projectors · Live Webcast Deck",
      status: "Reserved 17:00 - 19:30",
      tenant: "TechStars Demo Day",
      badge: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  const broadcasts = [
    {
      date: "Today, 11:30 AM",
      type: "FACILITY NOTICE",
      typeBadge: "bg-amber-50 text-amber-800 border-amber-200",
      title: "Quarterly DG Synchronization & Power Load Testing",
      desc: "Scheduled generator test on Sunday 06:00 - 08:00 AM. Zero interruption to tenant UPS circuits.",
      reach: "Sent to 84 Facility Managers across Tower 1 & 2 via WhatsApp + Email"
    },
    {
      date: "Yesterday, 04:15 PM",
      type: "STATUTORY SAFETY",
      typeBadge: "bg-rose-50 text-rose-700 border-rose-200",
      title: "Annual High-Rise Fire Evacuation Drill (NBC 2016 Compliant)",
      desc: "All building occupants will practice stairway evacuation at 15:00 hrs with local fire service presence.",
      reach: "Digital signage + Mobile notification delivered to 4,280 badged occupants"
    }
  ];

  const features = [
    {
      icon: QrCode,
      title: "10-Second QR Code Incident Dispatch",
      desc: "Occupants scan permanent QR plaques in meeting rooms, washrooms, or cafeteria bays. Zero logins required—app auto-identifies exact asset, floor, and wing."
    },
    {
      icon: Clock,
      title: "Institutional Multi-Tier SLA Escalation Clocks",
      desc: "Every ticket gets a countdown based on severity (P1: 30 mins, P2: 2 hrs). If breached, SMS & WhatsApp auto-escalate from technician to Chief Engineer and VP."
    },
    {
      icon: CalendarCheck2,
      title: "Executive Boardroom & Amenity Reservations",
      desc: "Real-time calendar booking with integrated AV options, VIP guest parking passes, catering add-ons, and direct monthly billing to tenant CAM invoices."
    },
    {
      icon: BellRing,
      title: "Instant Multi-Channel Emergency Broadcasts",
      desc: "Broadcast emergency circulars, power switchover notices, or water line repairs via WhatsApp, tenant mobile app push, and lobby digital signage screens simultaneously."
    },
    {
      icon: Star,
      title: "Automated CSAT & Tenant Sentiment Analytics",
      desc: "1-tap star ratings upon ticket closure. Live dashboard tracks tenant satisfaction scores, technician turnaround speeds, and recurring equipment failure hot-spots."
    },
    {
      icon: ShieldCheck,
      title: "Zero-Dispute Reconciled Expense Billing",
      desc: "Chargeable tenant requests (extra overtime HVAC, weekend cleaning crews, projector rentals) are auto-itemized and consolidated into monthly rent roll statements."
    }
  ];

  const faqs = [
    {
      q: "Can tenants raise complaints without downloading an app or logging in?",
      a: "Yes! OfficeX places serialized QR code badges in every meeting room, AHU zone, restroom, and elevator lobby. Occupants can simply scan the QR code using any smartphone camera or WhatsApp to lodge a pre-located incident report in under 10 seconds."
    },
    {
      q: "How does the multi-tier SLA escalation work if a technician doesn't respond?",
      a: "Each ticket category has pre-configured SLA thresholds (e.g., P1 HVAC failure has a 15-minute first-response and 45-minute resolution limit). If unacknowledged within 10 minutes, the platform triggers an automated call and WhatsApp alert to the Shift Supervisor. If breached, the alert escalates to the Complex Facility Director."
    },
    {
      q: "Can we charge tenants for ad-hoc requests like overtime weekend HVAC?",
      a: "Absolutely. Tenants can book weekend HVAC run hours or specialized housekeeping directly through the portal. The hours and agreed commercial rate automatically bridge into the OfficeX Rent Roll & CAM Billing module to generate a compliant GST tax invoice."
    },
    {
      q: "How does the boardroom reservation system prevent double-booking?",
      a: "The booking calendar locks conference slots in real time with millisecond concurrency protection. It integrates with on-door digital iPad/tablet conference displays that turn red during occupied sessions and green when free."
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
          <span className="text-[#0D7B6C] font-bold">Tenant Experience &amp; Helpdesk</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Clean, Daylight White
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#0D7B6C] text-xs sm:text-sm font-extrabold tracking-wide mb-4 sm:mb-5 shadow-2xs">
              <Headphones size={15} className="text-[#0D7B6C]" />
              <span>OFFICEX.PRO · TENANT EXPERIENCE &amp; HELPDESK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.14] mb-4">
              10-Second QR Ticketing &amp;{" "}
              <span className="text-[#0D7B6C]">
                Workplace Experience
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              Empower occupants with frictionless facility dispatch, real-time SLA escalation countdowns,
              smart boardroom booking with automated CAM billing, and instant building-wide emergency circulars.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
              <button
                type="button"
                onClick={() => setEnquiryOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#0D7B6C]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Schedule Helpdesk Walkthrough</span>
                <ArrowRight size={15} />
              </button>
              <Link
                href="/tenant/tickets"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Live Helpdesk Portal</span>
                <ArrowUpRight size={14} className="text-[#0D7B6C]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-100 text-left">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xl sm:text-2xl font-black text-slate-900">10 Secs</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">QR Incident Dispatch</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xl sm:text-2xl font-black text-[#0D7B6C]">98.4%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">SLA Adherence</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xl sm:text-2xl font-black text-slate-900">18 Mins</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Mechanical MTTR</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xl sm:text-2xl font-black text-emerald-700">4.9 / 5</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Tenant CSAT Index</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. INTERACTIVE DEMO CONSOLE — Clean Daylight Window
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-[#0D7B6C] mb-2">
                <Sparkles size={13} />
                <span>LIVE DISPATCH CONSOLE PREVIEW</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Complete Tenant Operations in One View
              </h2>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                onClick={() => setSelectedTab("tickets")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "tickets"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Work Orders ({sampleTickets.length})
              </button>
              <button
                onClick={() => setSelectedTab("amenities")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "amenities"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Boardrooms ({meetingRooms.length})
              </button>
              <button
                onClick={() => setSelectedTab("broadcasts")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "broadcasts"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Circulars ({broadcasts.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Live Tickets Table */}
          {selectedTab === "tickets" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">
                    REAL-TIME SLA DISPATCH ENGINE · ACTIVE MONITOR
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#0D7B6C] bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  ALL 4 TECHNICIANS ON CALL
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80">
                    <tr>
                      <th className="py-3 px-4">Ticket &amp; Issue</th>
                      <th className="py-3 px-4">Tenant / Location</th>
                      <th className="py-3 px-4">Priority &amp; SLA</th>
                      <th className="py-3 px-4">Assigned Engineer</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sampleTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{ticket.title}</div>
                          <div className="font-mono text-[11px] text-slate-500 mt-0.5">{ticket.id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{ticket.tenant}</div>
                          <div className="text-slate-500 text-[11px]">{ticket.location}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ticket.priorityBadge}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <div className={`font-mono text-[11px] font-semibold ${ticket.slaColor}`}>
                            {ticket.slaRemaining}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {ticket.assignedTo}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${ticket.statusColor}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Boardroom Schedule */}
          {selectedTab === "amenities" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {meetingRooms.map((room, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono text-slate-500">{room.tower}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0D7B6C] border border-teal-200">
                        {room.capacity}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1.5">{room.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{room.features}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Session Status:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${room.badge}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-semibold">{room.tenant}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Emergency Broadcasts */}
          {selectedTab === "broadcasts" && (
            <div className="space-y-3.5">
              {broadcasts.map((b, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${b.typeBadge}`}>
                      {b.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{b.date}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{b.desc}</p>
                  <div className="text-[11px] font-mono text-[#0D7B6C] flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 size={13} />
                    <span>{b.reach}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. CORE CAPABILITIES (6 Deep Pillars)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-[#0D7B6C] mb-3">
              <Zap size={13} />
              <span>COMMERCIAL FACILITY AUTOMATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Grade Tenant Helpdesk Capabilities
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built specifically for grade-A tech parks, multi-tenant corporate towers, and REIT asset portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0D7B6C] mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. COMPARISON MATRIX
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Legacy Helpdesks Fail Grade-A Towers
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium">
              Compare outdated WhatsApp/paper logbooks with OfficeX institutional operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legacy Approach */}
            <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-2xs">
              <div className="text-rose-700 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>Traditional Tower Operations</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Unstructured WhatsApp chats where complaints get buried and technicians lose accountability.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Zero SLA tracking. Critical HVAC failures wait 4+ hours without supervisor escalation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Meeting rooms booked on paper whiteboards leading to embarrassing executive double-bookings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>Billable services like extra cleaning are tracked manually, leaking ₹25L+ annually in unbilled costs.</span>
                </li>
              </ul>
            </div>

            {/* OfficeX Approach */}
            <div className="p-6 rounded-2xl bg-white border border-teal-300 shadow-md">
              <div className="text-[#0D7B6C] font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#0D7B6C]" />
                <span>The OfficeX CAFM Standard</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-700 font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0D7B6C] font-bold">✓</span>
                  <span>10-Second QR dispatch with automated asset tagging and zero tenant app logins required.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0D7B6C] font-bold">✓</span>
                  <span>Audited SLA escalation clocks triggering instant SMS &amp; WhatsApp alerts up to VP Ops.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0D7B6C] font-bold">✓</span>
                  <span>Live synchronized digital calendar with meeting room iPad displays and catering integration.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0D7B6C] font-bold">✓</span>
                  <span>Direct auto-bridge to monthly Rent Roll &amp; CAM billing with complete GST compliance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium">
              Everything you need to know about deploying OfficeX Tenant Helpdesk
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-bold text-slate-900 hover:text-[#0D7B6C] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      activeFaq === idx ? "rotate-180 text-[#0D7B6C]" : "text-slate-500"
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. BOTTOM CALL TO ACTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#0D7B6C] to-[#0A6357] text-white px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Elevate Your Commercial Tenant Experience Today
          </h2>
          <p className="text-sm sm:text-base text-teal-50 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Join India's leading asset managers and enterprise towers. Deploy QR incident dispatch,
            automated SLA monitoring, and amenity booking in under 48 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setEnquiryOpen(true)}
              className="px-7 py-3.5 bg-white text-[#0D7B6C] hover:bg-slate-100 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Request Custom Deployment Plan
            </button>
            <Link
              href="/operate"
              className="px-7 py-3.5 bg-teal-800/80 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm border border-teal-300/40 transition-all"
            >
              Explore All SaaS Modules
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <EnquirySlideIn
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        prefill={{ modules: ["Tenant Helpdesk & Workplace Experience"] }}
      />
    </div>
  );
}

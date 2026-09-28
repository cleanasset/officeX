"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Receipt,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sliders,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Lock,
  Compass,
  TrendingUp,
  PieChart,
  Calendar,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Laptop
} from "lucide-react";

export default function RentRollLandingPage() {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState<string>("owner");
  const [activeFlowTab, setActiveFlowTab] = useState<"existing" | "self_serve" | "managed">("self_serve");

  const segments = [
    {
      id: "owner",
      title: "Property Owner / Landlord",
      badge: "Segment A",
      desc: "Single source of truth for owned office towers, IT parks & commercial retail. Track leases, rent escalations, deposits, and automated GST billing.",
      metrics: "100% Leased Area Tracking · 9-Year Stepped Escalations · WALE & Cap Rate"
    },
    {
      id: "pm",
      title: "Property Management Company",
      badge: "Segment B",
      desc: "Manage multiple properties on behalf of different asset owners. Track owner mandates, settle collections to distinct owner bank accounts, and calculate management fees.",
      metrics: "Multi-Owner Client Accounts · Management Fee Deduction · Owner Statements"
    },
    {
      id: "fm",
      title: "Facility Management Company",
      badge: "Segment C",
      desc: "Bill occupants purely for CAM, utilities, and facility upkeep. Annual CAM budget pooling, provisional billing, and year-end audit true-up reconciliation.",
      metrics: "CAM Pool Budgeting · True-Up Reconciliation · Metered HT/DG Tariffs"
    },
    {
      id: "msp",
      title: "Managed Service Provider (MSP)",
      badge: "Segment D",
      desc: "Operate end-to-end portfolios for corporate clients. Combined lease management, turnkey operations, and multi-entity statutory invoicing.",
      metrics: "Unified Portfolios · Master Governance · Dual Maker-Checker Signoff"
    },
    {
      id: "flex",
      title: "Managed Office / Flex Operator",
      badge: "Segment E",
      desc: "Bill co-working desks and managed enterprise suites by seat counts or minimum commitment. Manage head leases (costs) and occupant contracts (revenue) with centre P&L.",
      metrics: "Seat-Based Commitments · Head Lease OpEx · Centre Contribution Margin"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* ──── TOP GLOBAL NAVIGATION ──── */}
      <header className="h-18 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={34}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={125}
              height={30}
              className="h-7 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            OFFICEX Rent Roll · Commercial SaaS
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/login?context=rent-roll"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-bold transition-colors"
          >
            Sign In (Existing User)
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-lg shadow-teal-600/25 transition-all flex items-center gap-1.5"
          >
            <span>Launch Setup Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ──── HERO SECTION (SLIDE 1) ──── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-6xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Cloud-based Lease, Revenue &amp; Occupancy Management Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          The Single Source of Truth for <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            Commercial Leases &amp; Rent Roll
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          OFFICEX Rent Roll automates the entire Lease-to-Cash cycle. Whether you are an owner,
          property manager, FM company, or flex operator, manage contracts, separate component invoices,
          automated escalations, and payment collections with zero friction.
        </p>

        {/* 4 Core Pillars from Slide 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Single Source of Truth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time audit of who occupies which space, carpet vs chargeable area, seats, and active contract terms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Track Rent, Charges &amp; Deposits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Base rent, CAM, grid &amp; DG power, water, and parking. Track held deposits, bank guarantees, and shortfalls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Automate Billing &amp; Collections</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Separate invoices per component (Rent, CAM, Utilities), automated GST/TDS calculation, and online payment allocations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Reports &amp; Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Occupancy rates, 12-month revenue forecast, WALE (lease expiry profile), NOI margins, and 0–90+ day ageing buckets.
            </p>
          </div>
        </div>
      </section>

      {/* ──── STEP 2: THREE USER FLOWS (SLIDE 2 & SPEC) ──── */}
      <section className="bg-slate-950 py-16 px-4 sm:px-8 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Step 2: Sign-In or Sign-Up Decision Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Choose Your Journey into OFFICEX Rent Roll
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Whether you are an existing customer, a new self-serve subscriber, or requiring assisted white-glove onboarding:
            </p>
          </div>

          {/* Flow Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setActiveFlowTab("existing")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFlowTab === "existing"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1. Existing User Sign-In
            </button>
            <button
              type="button"
              onClick={() => setActiveFlowTab("self_serve")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFlowTab === "self_serve"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2. New User Sign-Up (Self-Serve)
            </button>
            <button
              type="button"
              onClick={() => setActiveFlowTab("managed")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFlowTab === "managed"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              3. Assisted &amp; White-Glove
            </button>
          </div>

          {/* Flow Card Details */}
          {activeFlowTab === "existing" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
                    For Users Who Already Have an Account
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">Existing User Sign-In Flow</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter email &amp; password or use Enterprise SSO. Your organization and role permissions are auto-resolved from your JWT token.
                  </p>
                </div>
                <Link
                  href="/login?context=rent-roll&redirect=/properties/rent-roll"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 shrink-0"
                >
                  <span>Go to Sign-In Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" /> 1. Authentication
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Uses Supabase OAuth2/OIDC. Secure token validation with automated workspace resolution.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> 2. Role Entitlements
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Automatically loads screens for Org Admin, Finance/AR Manager, Property Manager, Leasing, or Occupant.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-slate-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-400" /> 3. Direct Landing
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Bypasses onboarding directly to your live Rent Roll register, active invoices, and MIS analytics.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFlowTab === "self_serve" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 text-xs font-bold">
                    For Brand New Users &amp; Self-Service Teams
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">New User Sign-Up &amp; Onboarding Wizard</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign up with 14-day free trial. Complete the guided 7-Step setup engine, configure multi-state SPVs, and import your rent roll.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/signup?context=rent-roll&role=owner"
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs"
                  >
                    1. Create Account
                  </Link>
                  <Link
                    href="/onboarding"
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 shrink-0"
                  >
                    <span>2. Launch Setup Wizard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 7-Step Roadmap Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                {[
                  { num: 1, title: "Organization", sub: "Legal Entity & 5 Segments" },
                  { num: 2, title: "Section A: Legal", sub: "Multi-SPV & Tax Profiles" },
                  { num: 3, title: "Section B: Charges", sub: "11 Charge Types & Rates" },
                  { num: 4, title: "Section C & D", sub: "Branding, Domains & Users" },
                  { num: 5, title: "Route Choice", sub: "Managed vs Self-Serve" },
                  { num: 6, title: "Import Ingestion", sub: "9-Step Validation Engine" },
                  { num: 7, title: "Go-Live", sub: "5-Point Launch Checklist" }
                ].map((st) => (
                  <div key={st.num} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-1">
                    <span className="text-[10px] font-mono text-teal-400 font-bold block">STEP {st.num}</span>
                    <div className="font-extrabold text-slate-200 text-xs truncate">{st.title}</div>
                    <div className="text-[10px] text-slate-400">{st.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeFlowTab === "managed" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
                    For 100+ Leases &amp; Multi-Client Operators (Those We Make Them Onboard)
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">Assisted &amp; White-Glove Onboarding Route</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Our dedicated OfficeX lease abstraction team collects executed lease deeds, audits key terms, reconciles control totals, and oversees parallel billing runs.
                  </p>
                </div>
                <Link
                  href="/onboarding?route=managed"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 shrink-0"
                >
                  <span>Open Managed Intake Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-purple-300">1. Document Intake</div>
                  <div className="text-slate-400 text-[11px]">
                    Client shares executed deeds (PDFs) and existing Excel rent rolls. Source inventory verified.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-purple-300">2. Lease Abstraction</div>
                  <div className="text-slate-400 text-[11px]">
                    Lease analysts extract rent, stepped escalations, deposits, lock-in, and notice periods into canonical schema.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-purple-300">3. Control Reconciliation</div>
                  <div className="text-slate-400 text-[11px]">
                    Total area, active rent, and receivables matched to ₹0 or explained. Two-step sign-off by Finance &amp; Org Admin.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="font-extrabold text-purple-300">4. Parallel Run &amp; Hypercare</div>
                  <div className="text-slate-400 text-[11px]">
                    1 billing cycle run in parallel with legacy spreadsheets. Dedicated 24/7 hypercare for 2–6 weeks.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ──── CUSTOMER SEGMENT MATRIX ──── */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Target Operating Segments
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Configured for Every Commercial Real Estate Operator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Select your primary business model below to explore tailored capabilities:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSelectedSegment(seg.id)}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedSegment === seg.id
                  ? "bg-teal-950/80 border-teal-500 shadow-md ring-1 ring-teal-500/50"
                  : "bg-slate-800/50 border-slate-700/70 hover:border-slate-600"
              }`}
            >
              <span className="text-[10px] font-mono text-teal-400 font-bold block">{seg.badge}</span>
              <div className="font-extrabold text-xs text-white mt-1 leading-snug">{seg.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Segment Highlight */}
        {(() => {
          const activeSeg = segments.find((s) => s.id === selectedSegment) || segments[0];
          return (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/70 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold text-teal-400">{activeSeg.badge} Architecture</span>
                <h3 className="text-xl font-black text-white">{activeSeg.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{activeSeg.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono font-medium">
                  <Sparkles size={13} />
                  <span>{activeSeg.metrics}</span>
                </div>
              </div>

              <Link
                href={`/onboarding?segment=${activeSeg.id}`}
                className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 shrink-0"
              >
                <span>Onboard as {activeSeg.title.split("/")[0]}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          );
        })()}
      </section>

      {/* ──── CALL TO ACTION FOOTER ──── */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-removebg-preview.png"
                alt="OfficeX"
                width={28}
                height={28}
                className="h-6 w-auto object-contain opacity-90"
              />
              <Image
                src="/name-removebg-preview.png"
                alt="OfficeX"
                width={100}
                height={24}
                className="h-5 w-auto object-contain opacity-90 brightness-0 invert"
              />
            </Link>
            <span>· Enterprise Lease &amp; Revenue Operations Platform</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link href="/login?context=rent-roll" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup?context=rent-roll" className="hover:text-white transition-colors">Register Account</Link>
            <Link href="/onboarding" className="hover:text-white transition-colors">Onboarding Wizard</Link>
            <Link href="/properties/rent-roll" className="hover:text-white transition-colors">Direct Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import { 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Laptop, 
  HeartHandshake, 
  TrendingUp, 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  X, 
  Send, 
  Mail, 
  ChevronRight,
  Coffee,
  Plane,
  Coins,
  Cpu
} from "lucide-react";

interface JobRole {
  id: string;
  title: string;
  department: "Engineering & Data" | "Product & Design" | "Enterprise Sales & Growth" | "FM Operations & Managed Services";
  location: string;
  type: string;
  experience: string;
  description: string;
  highlights: string[];
  skills: string[];
}

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedLoc, setSelectedLoc] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    linkedin: "",
    portfolio: "",
    coverNote: ""
  });

  const openApplyModal = (role: JobRole) => {
    setSelectedRole(role);
    setApplySubmitted(false);
    setIsApplyModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitted(true);
  };

  const roles: JobRole[] = [
    {
      id: "eng-fullstack",
      title: "Lead Full-Stack Engineer (Next.js / PostgreSQL)",
      department: "Engineering & Data",
      location: "Bengaluru (Hybrid)",
      type: "Full-Time",
      experience: "5 - 8 Years",
      description: "Architect, build, and scale high-concurrency CAFM, automated rent roll indexation engines, and IoT asset telemetry lakes.",
      highlights: ["Own real-time telemetry processing", "High-throughput Next.js & Server Components", "PostgreSQL schema optimization & audit trails"],
      skills: ["TypeScript", "Next.js", "PostgreSQL", "Node.js", "Prisma", "AWS"]
    },
    {
      id: "eng-data",
      title: "Senior Data & ESG Telemetry Engineer",
      department: "Engineering & Data",
      location: "Bengaluru (Hybrid)",
      type: "Full-Time",
      experience: "4 - 7 Years",
      description: "Build streaming data pipelines that ingest utility meters, HVAC chiller telemetry, and power consumption metrics for ESG benchmarking.",
      highlights: ["Time-series data pipelines", "Automated carbon emission & ESG indexation", "Real-time anomaly detection models"],
      skills: ["Python", "TimescaleDB / ClickHouse", "Kafka", "Data Modeling", "Docker"]
    },
    {
      id: "prod-pm",
      title: "Principal Product Manager — Rent Roll & CAM SaaS",
      department: "Product & Design",
      location: "Mumbai (BKC)",
      type: "Full-Time",
      experience: "6 - 10 Years",
      description: "Define the institutional product roadmap for commercial lease indexation, CAM reconciliation formulas, and enterprise owner portals.",
      highlights: ["Work with top commercial REITs & developers", "Translate complex lease mechanics into clean UX", "Full product lifecycle ownership"],
      skills: ["Product Strategy", "CRE Mechanics", "CAM Invoicing", "User Research", "Agile Roadmap"]
    },
    {
      id: "prod-design",
      title: "Senior Product Designer (Design Systems & Enterprise UX)",
      department: "Product & Design",
      location: "Bengaluru / Mumbai",
      type: "Full-Time",
      experience: "4 - 7 Years",
      description: "Craft modern, world-class enterprise workflows for property owners, facilities managers, and commercial leasing brokers.",
      highlights: ["Modern Figma design systems", "Data-dense financial & CAFM dashboard design", "High-fidelity micro-interactions"],
      skills: ["Figma", "Design Systems", "Enterprise UX", "Prototyping", "Information Architecture"]
    },
    {
      id: "sales-director",
      title: "Director of Enterprise Sales (REITs & Asset Managers)",
      department: "Enterprise Sales & Growth",
      location: "Mumbai / Gurugram",
      type: "Full-Time",
      experience: "7 - 12 Years",
      description: "Drive multi-campus SaaS and Managed Services contracts with institutional asset managers, Tier-1 developers, and multinational corporate occupiers.",
      highlights: ["C-suite relationships with CRE asset leaders", "Institutional enterprise sales cycle execution", "Uncapped commission & equity incentive"],
      skills: ["Enterprise Sales", "CRE Relationships", "Contract Negotiations", "REIT Ecosystem"]
    },
    {
      id: "ops-mep",
      title: "Senior MEP Technical Operations Lead",
      department: "FM Operations & Managed Services",
      location: "Bengaluru / Hyderabad",
      type: "Full-Time",
      experience: "6 - 10 Years",
      description: "Oversee on-ground technical audits, 52-week preventive maintenance protocols for 11KV substations, central chillers, and DG sets.",
      highlights: ["Audit institutional commercial buildings", "Deploy digital PPM diagnostic checklists", "Manage vendor SLAs & technical quality"],
      skills: ["HVAC Central Plants", "11KV Substations", "DG Synchronization", "Preventive Maintenance", "SLA Governance"]
    },
    {
      id: "ops-compliance",
      title: "Statutory Compliance & Audit Specialist",
      department: "FM Operations & Managed Services",
      location: "Mumbai (BKC)",
      type: "Full-Time",
      experience: "4 - 7 Years",
      description: "Manage statutory building compliances across institutional portfolios including CFO Fire NOCs, Lift licenses, PCB consents, and labor statutory filings.",
      highlights: ["100% statutory compliance radar", "Liaison with municipal & fire authorities", "Automated compliance calendar maintenance"],
      skills: ["Fire NOCs", "Form A / Lift Act", "Pollution Control Board", "Statutory Filings", "CRE Audits"]
    },
    {
      id: "growth-cs",
      title: "Customer Onboarding & Success Manager",
      department: "Enterprise Sales & Growth",
      location: "Gurugram / Bengaluru",
      type: "Full-Time",
      experience: "3 - 6 Years",
      description: "Lead end-to-end client onboarding, lease data ingestion, and building asset registry setup for newly signed enterprise portfolios.",
      highlights: ["Fast-track client time-to-value", "Train facility managers and tenant coordinators", "Drive net retention and module expansion"],
      skills: ["Client Onboarding", "CRE Operations", "Data Migration", "Change Management", "Customer Success"]
    }
  ];

  const departments = ["All", "Engineering & Data", "Product & Design", "Enterprise Sales & Growth", "FM Operations & Managed Services"];
  const locations = ["All", "Bengaluru", "Mumbai (BKC)", "Gurugram", "Hyderabad"];

  const filteredRoles = roles.filter(role => {
    const matchDept = selectedDept === "All" || role.department === selectedDept;
    const matchLoc = selectedLoc === "All" || role.location.toLowerCase().includes(selectedLoc.toLowerCase());
    return matchDept && matchLoc;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Universal Marketing Header */}
      <MarketingHeader activePath="/careers" />

      <main className="flex-1">
        {/* SECTION 1: HERO BANNER */}
        <section className="relative w-full pt-14 pb-18 md:pt-18 md:pb-22 px-4 sm:px-6 lg:px-8 bg-[#071324] text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide mb-5 backdrop-blur-xs">
              <Sparkles size={14} className="text-teal-400" />
              <span>WE&apos;RE EXPANDING ACROSS METROS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] mb-5">
              Build the Operating System for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-300">
                Modern Commercial Real Estate
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mb-8">
              Join our engineering, product, and operations leaders in Bengaluru, Mumbai, Gurugram, and Hyderabad as we transform how India&apos;s ₹8.5 Lakh Cr commercial workspaces are leased, operated, and maintained.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-center backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-white">5 Metros</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">Offices in Top Tech Hubs</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-center backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-teal-400">100%</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">Family Health Insurance</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-center backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-white">ESOPs</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">Meaningful Team Ownership</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-center backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">₹12.4 Cr+</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">Live Monthly Rent Rolls</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHY BUILD AT OFFICEX */}
        <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
              OUR CULTURE &amp; VALUES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Why Extraordinary People Join OfficeX
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-medium leading-relaxed">
              We operate at the intersection of high-scale software engineering and tangible physical infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#0F8B7D] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
                <Building2 size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-World Scale</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your code and operational frameworks run real multi-million sq.ft. Grade-A business parks, keeping critical HVAC and 11KV substations operational 24/7.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#0F8B7D] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Cpu size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Modern Technology</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No legacy tech debt. We build on Next.js, TypeScript, PostgreSQL, high-performance edge compute, and automated IoT telemetry ingestion lakes.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#0F8B7D] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">High Autonomy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe in small, agile teams with extreme ownership. You make decisions, deploy features fast, and see direct customer impact within days.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#0F8B7D] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Coins size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Institutional Reward</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Top-decile market compensation, transparent ESOP grants with straightforward vesting schedules, and comprehensive family welfare benefits.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PERKS & BENEFITS */}
        <section className="py-12 sm:py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D]">COMPREHENSIVE PERKS</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                Designed to Support You &amp; Your Family
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Comprehensive Health & Life",
                  desc: "₹10 Lakh group health insurance for you, spouse, children, and parents with OPD allowances and mental health support."
                },
                {
                  icon: Laptop,
                  title: "Top-Tier Work Gear",
                  desc: "Choose your machine (Apple MacBook Pro M3 or Dell XPS) along with high-res 4K external monitors and ergonomic accessories."
                },
                {
                  icon: Clock,
                  title: "Hybrid & Flexible Hours",
                  desc: "Collaborative prime metro offices in BKC, Outer Ring Road, and Cyber City, combined with high-trust hybrid work flexibility."
                },
                {
                  icon: GraduationCap,
                  title: "Annual Learning Stipend",
                  desc: "₹50,000 annual budget for technical certifications, books, industry conferences, and executive education."
                },
                {
                  icon: Coffee,
                  title: "Curated Workspaces & Food",
                  desc: "Fully stocked pantries with specialty coffee, healthy snacks, catered lunches, and ergonomic standing desks."
                },
                {
                  icon: Plane,
                  title: "Annual Offsites & Recharge",
                  desc: "All-company annual offsites, regular team celebrations, generous paid time off, and mandatory year-end holiday shutdown."
                }
              ].map((perk, i) => {
                const IconComponent = perk.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{perk.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: OPEN POSITIONS */}
        <section id="positions" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D]">CURRENT OPPORTUNITIES</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                Explore Open Positions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Showing {filteredRoles.length} open {filteredRoles.length === 1 ? "role" : "roles"} across departments and metro hubs
              </p>
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <MapPin size={13} /> Location:
              </span>
              <select
                value={selectedLoc}
                onChange={(e) => setSelectedLoc(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F8B7D] cursor-pointer shadow-2xs"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedDept === dept
                    ? "bg-[#0F8B7D] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Roles Grid */}
          {filteredRoles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Briefcase size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No open positions found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                We don&apos;t currently have open listings matching the selected filters.
              </p>
              <button
                onClick={() => { setSelectedDept("All"); setSelectedLoc("All"); }}
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0c7368]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map(role => (
                <div
                  key={role.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-[#0F8B7D] hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                        {role.department}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {role.experience}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {role.type}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">
                      {role.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 max-w-3xl">
                      {role.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {role.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin size={13} className="text-[#0F8B7D]" />
                        <span>{role.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Apply Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      onClick={() => openApplyModal(role)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#071324] hover:bg-[#0F8B7D] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={13} />
                    </button>
                    <a
                      href={`mailto:careers@officex.in?subject=Application: ${encodeURIComponent(role.title)}`}
                      className="text-[11px] font-semibold text-slate-500 hover:text-[#0F8B7D] transition-colors py-1 px-2"
                    >
                      Apply via Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unsolicited Applications Card */}
          <div className="mt-12 bg-gradient-to-r from-slate-900 to-[#071324] text-white rounded-3xl p-8 sm:p-10 border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold mb-3 border border-teal-500/30">
                <Mail size={12} /> OPEN INVITATION
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                Don&apos;t see a role that matches your background?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We are always excited to meet exceptional engineers, CRE analysts, product leaders, and facilities specialists. Drop us your portfolio or CV directly.
              </p>
            </div>

            <a
              href="mailto:careers@officex.in?subject=Spontaneous Application - OfficeX Careers"
              className="shrink-0 px-7 py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-2"
            >
              <Mail size={15} />
              <span>Email careers@officex.in</span>
            </a>
          </div>
        </section>
      </main>

      {/* MODAL: INTERACTIVE JOB APPLICATION */}
      {isApplyModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            {applySubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-50 text-[#0F8B7D] rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-200">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Application Received!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
                  Thank you for applying for <span className="font-bold text-slate-900">{selectedRole.title}</span>. Our talent acquisition team will review your profile and reach out within 48 hours.
                </p>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#071324] text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6 pr-8">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {selectedRole.department}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2 leading-tight">
                    Apply: {selectedRole.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {selectedRole.location}
                    </span>
                    <span>•</span>
                    <span>{selectedRole.experience}</span>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@domain.com"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Current City *
                      </label>
                      <input
                        type="text"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Bengaluru, Mumbai"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Total Experience *
                      </label>
                      <select
                        name="experience"
                        required
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="">Select years</option>
                        <option value="1-3 years">1 - 3 Years</option>
                        <option value="3-5 years">3 - 5 Years</option>
                        <option value="5-8 years">5 - 8 Years</option>
                        <option value="8+ years">8+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      LinkedIn Profile URL *
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      required
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Portfolio / GitHub / Resume Link (Optional)
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username or Drive CV link"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Brief Note / Why OfficeX? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      name="coverNote"
                      value={formData.coverNote}
                      onChange={handleInputChange}
                      placeholder="Tell us briefly about what excites you about commercial real estate tech..."
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>Submit Application</span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2.5">
                      Or email your CV directly to <a href={`mailto:careers@officex.in?subject=Application for ${encodeURIComponent(selectedRole.title)}`} className="text-[#0F8B7D] underline font-bold">careers@officex.in</a>
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

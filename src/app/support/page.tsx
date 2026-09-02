"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  FileText, 
  Send, 
  X, 
  Paperclip, 
  Building, 
  Wrench, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Ticket Modal State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Marketplace Escrow");
  const [ticketPriority, setTicketPriority] = useState("Standard");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"idle" | "sending" | "success">("idle");
  const [generatedTicketId, setGeneratedTicketId] = useState("");

  const supportSLAs = [
    {
      level: "Critical / Outage",
      time: "< 1 Hour SLA",
      desc: "Emergency support for payment escrow locks, portal downtime, or security alerts.",
      badgeColor: "bg-rose-100 text-rose-800"
    },
    {
      level: "High Priority",
      time: "< 4 Hours SLA",
      desc: "Assistance with contract award disputes, GST invoice corrections, or visitor gate clearance.",
      badgeColor: "bg-amber-100 text-amber-800"
    },
    {
      level: "Standard Support",
      time: "< 24 Hours SLA",
      desc: "General queries, user role assignments, building registry updates, or reporting exports.",
      badgeColor: "bg-emerald-100 text-emerald-800"
    }
  ];

  const faqs = [
    {
      category: "Marketplace & Escrow",
      q: "How does the Razorpay 90/10 escrow disbursement work?",
      a: "When a facility manager awards a work order, funds are deposited into the Razorpay Escrow Nodal Account. Upon verified sign-off of milestone completion by the facility team, 90% of funds are automatically routed to the vendor's bank account and 10% is retained as the platform facilitation fee."
    },
    {
      category: "Leasing & Properties",
      q: "How are commercial property listings auto-matched with tenant leads?",
      a: "Our matching engine evaluates prospect requirements (location micro-market, sqft range, budget limits, seating capacity) against active verified listing inventory to recommend high-conversion property matches."
    },
    {
      category: "Rent Roll & Tenant Portal",
      q: "Can corporate tenants make automated rent payments via Netbanking/UPI?",
      a: "Yes, tenants can log into P06 Tenant Portal to view monthly rent roll invoices and initiate direct online payments with automatic ledger reconciliation."
    },
    {
      category: "Operations & PPM",
      q: "How does the 52-week Planned Preventive Maintenance (PPM) calendar operate?",
      a: "Facility teams configure equipment maintenance schedules (HVAC, DG set, Fire Pump checks). Work orders are automatically triggered and dispatched to assigned internal technicians or contracted FM vendors."
    },
    {
      category: "Security & Compliance",
      q: "How are statutory Fire NOCs and Occupation Certificates verified on the platform?",
      a: "Property documents uploaded during building registration are audited by administrative compliance officers against municipal records before receiving the 'Verified Statutory NOC' trust badge."
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCat = activeCategory === "all" || faq.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMessage) return;

    setTicketStatus("sending");
    setTimeout(() => {
      const randomId = "TKT-2026-" + Math.floor(1000 + Math.random() * 9000);
      setGeneratedTicketId(randomId);
      setTicketStatus("success");
    }, 1500);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setTicketStatus("idle");
    setTicketName("");
    setTicketEmail("");
    setTicketMessage("");
  };

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
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Support & Help Desk</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <MessageSquare size={14} /> Submit Support Ticket
          </button>
          <Link 
            href="/"
            className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#0F8B7D]/90 text-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational • 99.8% Uptime</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">How Can We Help You?</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mt-3 font-medium leading-relaxed">
              Explore knowledge articles, submit technical service tickets, or contact our enterprise account managers for immediate resolution.
            </p>
          </div>

          <button 
            onClick={() => setIsTicketModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MessageSquare size={16} className="text-[#0F8B7D]" /> Create Ticket
          </button>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col gap-10">
        
        {/* Support SLA Matrix Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportSLAs.map((sla, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sla.badgeColor}`}>
                  {sla.level}
                </span>
                <span className="text-xs font-extrabold text-[#0F8B7D] flex items-center gap-1">
                  <Clock size={13} /> {sla.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">{sla.desc}</p>
            </div>
          ))}
        </section>

        {/* Knowledge Base & FAQ Accordion Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Knowledge Base & FAQ Search</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Instant answers for common platform workflows across leasing, escrow, and facility operations.</p>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQ keywords..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap mb-6 border-b border-slate-100 pb-4">
            {["all", "Leasing", "Marketplace", "Rent Roll", "Operations", "Security"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? "bg-[#0F8B7D] text-white shadow-xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordions */}
          <div className="flex flex-col gap-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">
                No matching FAQ items found. Please submit a support ticket for customized assistance.
              </div>
            ) : (
              filteredFAQs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
                  <button 
                    onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs md:text-sm text-slate-800 font-extrabold flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">{faq.category}</span>
                      {faq.q}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${activeFAQ === idx ? "transform rotate-180 text-[#0F8B7D]" : ""}`} />
                  </button>

                  {activeFAQ === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed font-medium bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Direct Contact Channels Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex items-center gap-6 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#0F8B7D] flex items-center justify-center text-white shrink-0 shadow">
              <Mail size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Support Desk Email</span>
              <h3 className="text-lg font-black text-white mt-0.5">support@officex.pro</h3>
              <p className="text-xs text-slate-300 font-medium mt-1">Direct escalation desk for enterprise property portfolio administrators.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex items-center gap-6 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <PhoneCall size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Phone & Hotline</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">+91 (022) 4890-7700</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Available Mon-Sat, 9:00 AM – 7:00 PM IST.</p>
            </div>
          </div>
        </section>

      </main>

      {/* CREATE TICKET MODAL OVERLAY */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={handleCloseTicketModal}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            {ticketStatus === "success" ? (
              <div className="text-center py-8 flex flex-col items-center justify-center animate-scaleUp">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-900">Support Ticket Created</h4>
                <div className="mt-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-[#0F8B7D]">
                  Ticket Reference: {generatedTicketId}
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">
                  We have received your ticket. An account engineer will respond to your email within the committed SLA timeframe.
                </p>
                <button 
                  onClick={handleCloseTicketModal}
                  className="mt-6 px-6 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Submit Support Ticket</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Provide details regarding your inquiry for prompt routing.</p>
                </div>

                <hr className="border-slate-100" />

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name *</label>
                  <input 
                    type="text" 
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email *</label>
                  <input 
                    type="email" 
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select 
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-bold bg-white"
                    >
                      <option value="Marketplace Escrow">Marketplace Escrow</option>
                      <option value="Leasing CRM">Leasing CRM</option>
                      <option value="Rent Roll Ledger">Rent Roll Ledger</option>
                      <option value="Visitor Gate Pass">Visitor Gate Pass</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                    <select 
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-bold bg-white"
                    >
                      <option value="Standard">Standard (24h)</option>
                      <option value="High">High (4h)</option>
                      <option value="Critical">Critical (1h)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Issue Description *</label>
                  <textarea 
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your requirement or error in detail..."
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-semibold resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={ticketStatus === "sending"}
                  className="w-full py-3 mt-1 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-slate-350"
                >
                  {ticketStatus === "sending" ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

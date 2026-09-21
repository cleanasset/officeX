"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, TrendingDown, MoreVertical, ChevronRight, 
  Building, Users, Calendar, DollarSign, AlertCircle, ArrowUpRight, 
  FileText, CheckCircle, Clock, Sparkles, X, Download, Send, 
  ShieldCheck, CheckCheck, Wallet, Check, Layers
} from "lucide-react";
import { getPublicEnquiries, PublicEnquiry } from "@/lib/leasingStore";
import ProfileCompletionMeter from "@/components/ProfileCompletionMeter";

export default function LeasingDashboard() {
  const [liveLeads, setLiveLeads] = useState<any[]>([]);
  const [isLoiModalOpen, setIsLoiModalOpen] = useState(false);
  const [loiSent, setLoiSent] = useState(false);
  const [selectedLeadForMatch, setSelectedLeadForMatch] = useState<any | null>(null);
  const [isSpaceMatchOpen, setIsSpaceMatchOpen] = useState(false);
  const [proposalAttached, setProposalAttached] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const publicLeads = getPublicEnquiries();
      const formatted = publicLeads.map((p: PublicEnquiry) => ({
        id: `#L-${p.id.slice(-4)}`,
        company: p.companyName,
        req: `${p.seats || 60} Seats (${p.propertyTitle || "Space"})`,
        area: p.area || "Commercial Floor",
        stage: "NEW (WEB)",
        stageColor: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
        assigned: "Unassigned",
        assignedColor: "text-emerald-700 font-bold",
        commission: "Est. ₹6.50L",
        commissionStatus: "In Review"
      }));
      setLiveLeads(formatted);
    };

    load();
    window.addEventListener("officex-lead-added", load);
    return () => window.removeEventListener("officex-lead-added", load);
  }, []);

  const [userName, setUserName] = useState("Commercial Partner");
  const [catalogProperties, setCatalogProperties] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("officex_user_email") || "";
      if (email) {
        const namePart = email.split("@")[0];
        setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }

      fetch("/api/rent-roll/properties")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCatalogProperties(data);
          else if (data?.properties) setCatalogProperties(data.properties);
        })
        .catch(() => {});
    }
  }, []);

  const funnel = [
    { stage: "Enquiry", count: liveLeads.length, width: liveLeads.length > 0 ? "100%" : "0%", href: "/leasing/leads", color: "bg-teal-700" },
    { stage: "Qualified", count: 0, width: "0%", href: "/leasing/leads", color: "bg-teal-600" },
    { stage: "Site Visit", count: 0, width: "0%", href: "/leasing/visits", color: "bg-teal-500" },
    { stage: "Negotiation", count: 0, width: "0%", href: "/leasing/pipeline", color: "bg-teal-500/90" },
    { stage: "LOI & Term Sheet", count: 0, width: "0%", href: "/leasing/loi", color: "bg-teal-600/90" },
    { stage: "Closed & Onboarding", count: 0, width: "0%", href: "/leasing/pipeline", color: "bg-emerald-600" }
  ];

  const actionItems: Array<{
    color: string;
    title: string;
    desc: string;
    action: string;
    href?: string;
    onClick?: () => void;
  }> = [
    ...(liveLeads.length > 0 ? [{
      color: "bg-emerald-500",
      title: `⚡ Live Public Enquiry: ${liveLeads[0].company}`,
      desc: `Requested ${liveLeads[0].req}`,
      action: "Review Lead",
      href: "/leasing/leads"
    }] : [])
  ];

  const visits: Array<{
    company: string;
    location: string;
    time: string;
    status: string;
    statusColor: string;
  }> = [];

  const defaultLeads: any[] = [];

  const leads = [...liveLeads, ...defaultLeads];

  return (
    <div className="flex flex-col gap-6 font-sans pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Good Morning, {userName}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Commercial Leasing Desk · Active Micromarkets</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/leasing/leads"
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5"
          >
            <Users size={13} /> View All Leads
          </Link>
          <Link
            href="/leasing/pipeline"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <TrendingUp size={13} /> Pipeline Board
          </Link>
        </div>
      </div>

      {/* S12 Profile Completion & Progressive KYC Meter (v1.0 Spec Section 15) */}
      <ProfileCompletionMeter role="broker" />

      {/* 100% Clickable KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          href="/properties/registry"
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md hover:border-[#0F8B7D]/40 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE LISTINGS</p>
            <p className="text-3xl font-black text-gray-900 mt-1">0</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-0.5">
              <span>0 spaces listed</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0F8B7D] group-hover:bg-[#0F8B7D] group-hover:text-white transition-colors flex items-center justify-center font-bold">
            <Building size={20} />
          </div>
        </Link>

        <Link 
          href="/leasing/leads"
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OPEN LEADS</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{liveLeads.length}</p>
            <p className="text-[10px] font-bold text-blue-600 mt-0.5 flex items-center gap-0.5">
              <span>View lead inbox</span> <ArrowUpRight size={10} />
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </Link>

        <Link 
          href="/leasing/visits"
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TODAY&apos;S SITE VISITS</p>
            <p className="text-3xl font-black text-gray-900 mt-1">0</p>
            <p className="text-[10px] text-gray-400 mt-0.5">0 scheduled today</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </Link>

        <Link 
          href="/leasing/pipeline"
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COMMISSION PIPELINE</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹0</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-0.5">
              <span>0 deals in pipeline</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </Link>
      </div>

      {/* Funnel + Listings Type */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Lead Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">Lead Conversion Funnel</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click any stage to filter and open respective leads</p>
            </div>
            <Link href="/leasing/pipeline" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
              Open Full Pipeline <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {funnel.map((f) => (
              <Link
                key={f.stage}
                href={f.href}
                className="group block"
              >
                <div className="flex items-center justify-between text-xs mb-1 font-bold text-gray-700 group-hover:text-[#0F8B7D]">
                  <span>{f.stage}</span>
                  <span className="text-gray-900">{f.count} leads</span>
                </div>
                <div className="w-full bg-gray-100 rounded-xl h-7 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-lg ${f.color} group-hover:brightness-110 transition-all flex items-center px-3 text-white text-[10px] font-black justify-between shadow-2xs`}
                    style={{ width: f.width }}
                  >
                    <span>{f.stage}</span>
                    <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Listings by Type Donut Card */}
        <Link 
          href="/properties/registry"
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900">Listings by Type</h2>
            <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#0F8B7D]" />
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#0F8B7D" strokeWidth="3.5" strokeDasharray="62 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray="18 100" strokeDashoffset="-62" strokeLinecap="round" transform="rotate(-90 18 18)" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="12 100" strokeDashoffset="-80" strokeLinecap="round" transform="rotate(-90 18 18)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900">47</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">TOWERS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-3 border-t border-gray-100">
            <div className="p-1.5 rounded-lg bg-teal-50/60">
              <span className="block font-bold text-[#0F8B7D]">Office</span>
              <span className="font-black text-gray-900">62%</span>
            </div>
            <div className="p-1.5 rounded-lg bg-indigo-50/60">
              <span className="block font-bold text-indigo-700">Coworking</span>
              <span className="font-black text-gray-900">18%</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50/60">
              <span className="block font-bold text-amber-700">Retail</span>
              <span className="font-black text-gray-900">12%</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Critical Actions + Site Visit Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Action Items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
              <AlertCircle size={16} className="text-amber-500" /> Critical Action Items
            </h2>
            <span className="text-xs font-bold text-gray-400">3 Pending</span>
          </div>

          <div className="space-y-3">
            {actionItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1.5" />
                No urgent action items. Pipeline is clear.
              </div>
            ) : (
              actionItems.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${a.color} shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{a.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                  {a.onClick ? (
                    <button
                      type="button"
                      onClick={a.onClick}
                      className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[10px] font-bold shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      {a.action}
                    </button>
                  ) : (
                    <Link
                      href={a.href || "/leasing/leads"}
                      className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[10px] font-bold shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      {a.action}
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Site Visit Schedule */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
              <Calendar size={16} className="text-teal-600" /> Today&apos;s Site Visit Schedule
            </h2>
            <Link href="/leasing/visits" className="text-xs font-bold text-[#0F8B7D] hover:underline">
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Calendar size={20} className="text-gray-400 mx-auto mb-1.5" />
                No site visits scheduled for today.
              </div>
            ) : (
              visits.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{v.company}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{v.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-gray-700 block">{v.time}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${v.statusColor}`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads Table with Commission Tracking */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900">Recent Leads &amp; Commission Pipeline</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click Space Match to find matching Grade-A floors or generate formal LOI term sheets</p>
          </div>
          <Link href="/leasing/leads" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
            Open Leads CRM <ChevronRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Lead ID</th>
                <th className="py-3 pr-3">Company</th>
                <th className="py-3 pr-3">Requirement</th>
                <th className="py-3 pr-3">Area</th>
                <th className="py-3 pr-3">Stage</th>
                <th className="py-3 pr-3">Brokerage Fee</th>
                <th className="py-3 pr-3">Assigned To</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400 text-xs">
                    <Users size={24} className="text-gray-300 mx-auto mb-2" />
                    No leasing enquiries or leads received yet. Inbound enquiries from your public property listings will appear here.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                <tr 
                  key={l.id} 
                  className="border-b border-gray-100 text-xs hover:bg-teal-50/30 transition-colors group"
                >
                  <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">
                    <Link href="/leasing/leads" className="hover:underline">{l.id}</Link>
                  </td>
                  <td className="py-3.5 pr-3 font-bold text-gray-900">
                    <Link href="/leasing/leads">{l.company}</Link>
                  </td>
                  <td className="py-3.5 pr-3 text-gray-600">{l.req}</td>
                  <td className="py-3.5 pr-3 text-gray-600 font-medium">{l.area}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${l.stageColor}`}>
                      {l.stage}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="font-bold text-slate-900 block">{l.commission || "Est. ₹5.00L"}</span>
                    <span className={`text-[9px] font-bold ${l.stage === "CLOSED-WON" ? "text-emerald-600" : "text-slate-400"}`}>
                      {l.commissionStatus || "In Pipeline"}
                    </span>
                  </td>
                  <td className={`py-3.5 pr-3 text-xs font-semibold ${l.assignedColor}`}>{l.assigned}</td>
                  <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {l.company.includes("Global Logistics") ? (
                      <button
                        type="button"
                        onClick={() => { setLoiSent(false); setIsLoiModalOpen(true); }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Generate LOI
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setSelectedLeadForMatch(l); setProposalAttached(null); setIsSpaceMatchOpen(true); }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] hover:bg-teal-100 border border-teal-200 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Space Match
                      </button>
                    )}
                    <Link
                      href="/leasing/leads"
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEGAL LOI GENERATION ENGINE MODAL                                        */}
      {/* ========================================================================= */}
      {isLoiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLoiModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {loiSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCheck size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">LOI Dispatched for e-Sign!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                  Official Letter of Intent (Ref: <strong className="font-mono text-slate-900">LOI-APX-2026-042</strong>) has been transmitted to <strong>Global Logistics India Pvt Ltd</strong> legal department via Aadhaar OTP / DocuSign gateway.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Brokerage Commission:</span>
                    <strong className="text-emerald-700">₹97,50,000 (1.5 Months Rent)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Lessor Signatory:</span>
                    <strong className="text-slate-800">Apex Towers RE Fund</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Lessee Contact:</span>
                    <strong className="text-slate-800">legal@globallogistics.in</strong>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Downloading Legal LOI Term Sheet PDF...")}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0c7368] cursor-pointer flex items-center gap-2"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLoiModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={20} className="text-[#0F8B7D]" />
                  <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">
                    Commercial Term Sheet Engine
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Letter of Intent (LOI) Generation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deal: Global Logistics India · Apex Business Tower Floors 3 &amp; 4 (50,000 sq.ft.)
                </p>

                {/* Term Sheet Specs */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 my-5 text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Lessor (Landlord)</span>
                      <strong className="text-slate-900">Apex Towers Institutional RE Fund</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Lessee (Tenant)</span>
                      <strong className="text-slate-900">Global Logistics India Pvt Ltd</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Super Built-Up Area</span>
                      <strong className="text-slate-900">50,000 sq.ft.</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Monthly Base Rent</span>
                      <strong className="text-slate-900">₹65,00,000 (₹130/sqft)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Security Deposit</span>
                      <strong className="text-slate-900">6 Months (₹3.90 Cr)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Lock-In Period</span>
                      <strong className="text-slate-900">36 Months</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Annual Rent Escalation</span>
                      <strong className="text-slate-900">5% p.a. compounding</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Handover Condition</span>
                      <strong className="text-slate-900">Warm Shell + 100% DG</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Brokerage Fee</span>
                      <strong className="text-emerald-700 font-black">₹97.50L (45 Days Rent)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2 mb-6">
                  <ShieldCheck size={16} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Compliance:</strong> Term sheet includes standard RERA commercial arbitration clause, 120-day fit-out rent-free period, and escrow security deposit terms.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Downloading Legal LOI Term Sheet Draft PDF...")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoiSent(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Send size={14} /> Send for Aadhaar / DocuSign e-Sign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SPACE MATCH SIDE DRAWER                                                  */}
      {/* ========================================================================= */}
      {isSpaceMatchOpen && selectedLeadForMatch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div>
                  <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> AI Space Match Engine
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Matches for {selectedLeadForMatch.company}
                  </h3>
                  <p className="text-xs text-slate-500">Requirement: {selectedLeadForMatch.area} · {selectedLeadForMatch.req}</p>
                </div>
                <button
                  onClick={() => setIsSpaceMatchOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Matched Inventory */}
              <div className="space-y-3">
                {catalogProperties.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Building size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No properties in portfolio catalog</p>
                    <p className="text-[11px] text-slate-400 mt-1">Add commercial properties in the Property Registry to generate AI space matches.</p>
                  </div>
                ) : (
                  catalogProperties.map((prop: any) => (
                    <div key={prop.id} className="p-4 rounded-2xl border border-slate-200 hover:border-[#0F8B7D] transition-all bg-slate-50/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                          {prop.score || "95% Match"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{prop.badge || "Verified Asset"}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{prop.title || prop.name}</h4>
                      <p className="text-xs text-slate-600 font-medium">{prop.floor || "Full Floor Plate"} · {prop.area || `${Number(prop.totalArea || 0).toLocaleString()} sq.ft.`}</p>
                      <p className="text-xs font-bold text-[#0F8B7D] mt-1">{prop.rent || "Market Rate"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{prop.highlight || "Full DG backup · Dedicated parking"}</p>

                      <button
                        type="button"
                        onClick={() => setProposalAttached(prop.id)}
                        className={`w-full mt-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          proposalAttached === prop.id
                            ? "bg-emerald-600 text-white"
                            : "bg-white border border-slate-200 hover:border-[#0F8B7D] text-slate-800"
                        }`}
                      >
                        {proposalAttached === prop.id ? (
                          <>
                            <CheckCheck size={14} /> Proposal Attached
                          </>
                        ) : (
                          "Attach to Tenant Proposal"
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSpaceMatchOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer text-center"
              >
                Close Space Matcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

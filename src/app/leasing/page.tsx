"use client";
import React from "react";
import Link from "next/link";
import { 
  TrendingUp, TrendingDown, MoreVertical, ChevronRight, 
  Building, Users, Calendar, DollarSign, AlertCircle, ArrowUpRight, 
  FileText, CheckCircle, Clock 
} from "lucide-react";

export default function LeasingDashboard() {
  const funnel = [
    { stage: "Enquiry", count: 156, width: "100%", href: "/leasing/leads", color: "bg-teal-700" },
    { stage: "Qualified", count: 89, width: "72%", href: "/leasing/leads", color: "bg-teal-600" },
    { stage: "Site Visit", count: 52, width: "52%", href: "/leasing/visits", color: "bg-teal-500" },
    { stage: "Negotiation", count: 28, width: "36%", href: "/leasing/pipeline", color: "bg-teal-500/90" },
    { stage: "LOI & Term Sheet", count: 15, width: "24%", href: "/leasing/loi", color: "bg-teal-600/90" },
    { stage: "Closed & Onboarding", count: 8, width: "16%", href: "/leasing/pipeline", color: "bg-emerald-600" }
  ];

  const actionItems = [
    { 
      color: "bg-red-500", 
      title: "HCL Tech Requirement - Unassigned", 
      desc: "Hot lead (15,000 sqft), untouched for 24hrs", 
      action: "Assign Now",
      href: "/leasing/leads" 
    },
    { 
      color: "bg-amber-500", 
      title: "Lease Renewal: TechNova Solutions", 
      desc: "Expires in 15 days at One BKC", 
      action: "Review Leases",
      href: "/leasing/loi" 
    },
    { 
      color: "bg-blue-500", 
      title: "LOI Draft pending for Global Logistics", 
      desc: "Negotiation complete · 50,000 sqft", 
      action: "Open Pipeline",
      href: "/leasing/pipeline" 
    }
  ];

  const visits = [
    { 
      company: "Innovate Corp", 
      location: "One BKC — North Wing, Fl 4", 
      time: "10:00 AM", 
      status: "✅ Completed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" 
    },
    { 
      company: "NextGen Retail", 
      location: "Maker Maxity — 5th Floor Suite", 
      time: "02:30 PM (Live Now)", 
      status: "🔵 In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200" 
    },
    { 
      company: "Apex Financial", 
      location: "Godrej BKC — Floor 8", 
      time: "04:00 PM", 
      status: "🟡 Upcoming",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200" 
    }
  ];

  const leads = [
    { id: "#L-8042", company: "HCL Tech", req: "IT Office Space", area: "15,000 sqft", stage: "NEW", stageColor: "bg-blue-100 text-blue-700", assigned: "Unassigned", assignedColor: "text-red-500" },
    { id: "#L-8041", company: "Innovate Corp", req: "Coworking Desks", area: "50 Seats", stage: "SITE VISIT", stageColor: "bg-emerald-100 text-emerald-700", assigned: "Ravi M.", assignedColor: "text-gray-700" },
    { id: "#L-8040", company: "Global Logistics", req: "Commercial Floor", area: "50,000 sqft", stage: "NEGOTIATION", stageColor: "bg-amber-100 text-amber-700", assigned: "Anita S.", assignedColor: "text-gray-700" },
    { id: "#L-8039", company: "FreshMart Retail", req: "Ground Floor Retail", area: "2,500 sqft", stage: "CLOSED-WON", stageColor: "bg-emerald-100 text-emerald-700", assigned: "Vikram K.", assignedColor: "text-gray-700" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Good Morning, Ravi</h1>
          <p className="text-xs text-gray-500 mt-0.5">Commercial Leasing Desk · Mumbai Micromarkets</p>
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

      {/* 100% Clickable KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          href="/properties/registry"
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md hover:border-[#0F8B7D]/40 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE LISTINGS</p>
            <p className="text-3xl font-black text-gray-900 mt-1">47</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
              <TrendingUp size={10} /> +3 new spaces added
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
            <p className="text-3xl font-black text-gray-900 mt-1">23</p>
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
            <p className="text-3xl font-black text-gray-900 mt-1">5</p>
            <p className="text-[10px] text-gray-500 mt-0.5">2 completed · 3 scheduled</p>
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
            <p className="text-2xl font-black text-gray-900 mt-1">₹8,40,000</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
              <TrendingUp size={10} /> +12% projected
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
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${a.color} shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{a.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.desc}</p>
                  </div>
                </div>
                <Link
                  href={a.href}
                  className="px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[10px] font-bold shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  {a.action}
                </Link>
              </div>
            ))}
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
            {visits.map((v, i) => (
              <Link 
                key={i} 
                href="/leasing/visits"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-teal-50/50 hover:border-teal-200 transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#0F8B7D]">{v.company}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{v.location}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold block ${v.statusColor}`}>
                    {v.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-600 block">{v.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900">Recent Leads &amp; Inquiries</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click on any row to open lead conversation and match spaces</p>
          </div>
          <Link href="/leasing/leads" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
            Open Leads CRM <ChevronRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Lead ID</th>
                <th className="py-3 pr-3">Company</th>
                <th className="py-3 pr-3">Requirement</th>
                <th className="py-3 pr-3">Area</th>
                <th className="py-3 pr-3">Stage</th>
                <th className="py-3 pr-3">Assigned To</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr 
                  key={l.id} 
                  className="border-b border-gray-100 text-xs hover:bg-teal-50/30 transition-colors cursor-pointer group"
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
                  <td className={`py-3.5 pr-3 text-xs font-semibold ${l.assignedColor}`}>{l.assigned}</td>
                  <td className="py-3.5 text-right">
                    <Link
                      href="/leasing/leads"
                      className="px-3 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 group-hover:bg-[#0F8B7D] group-hover:text-white group-hover:border-[#0F8B7D] transition-colors"
                    >
                      Open Lead
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

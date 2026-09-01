"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Home, CreditCard, Wrench, Users, FileText, Calendar, Clock, MessageSquare, ChevronLeft, ChevronRight, MapPin, Maximize2 } from "lucide-react";

export default function TenantHomepage() {
  const [noticeIndex, setNoticeIndex] = useState(0);

  const notices = [
    { day: "SAT", date: "12", title: "Pest control scheduled for floor 5", time: "10:00 AM", color: "border-l-[#0F8B7D]" },
    { day: "WED", date: "16", title: "Fire drill on Wednesday", time: "2:00 PM", color: "border-l-red-400" }
  ];

  const tickets = [
    { title: "AC Cooling Issue", priority: "HIGH PRIORITY", priorityColor: "bg-red-100 text-red-600", remaining: "2h remaining for resolution", progress: 75, chatLabel: "Chat with Helpdesk" },
    { title: "Electrical Socket Fix", priority: "STANDARD", priorityColor: "bg-gray-100 text-gray-600", remaining: "5h remaining for resolution", progress: 40, chatLabel: "" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Hero Property Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Property Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr]">
          <div className="bg-gray-200 relative h-40 sm:h-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent" />
            <div className="h-full bg-[url('/placeholder-office.jpg')] bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #e5e7eb 25%, #d1d5db 75%)' }} />
          </div>
          <div className="p-5 sm:p-6 flex flex-col justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200 w-fit mb-3">ACTIVE LEASE</span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Apex Business Tower</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Floor 5, Unit 5A</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <Maximize2 size={14} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Area</p>
                  <p className="text-xs font-bold text-gray-700">8,500 sqft</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                  <p className="text-xs font-bold text-gray-700">BKC, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-[300px]">
          {/* Monthly Rent */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#14B8A6] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-1 mb-1">
              <CreditCard size={12} />
              <span className="text-[10px] font-bold">DUE SEP 01</span>
            </div>
            <p className="text-[10px] text-white/80">Monthly Rent</p>
            <p className="text-base sm:text-lg font-black">₹1,91,000</p>
            <Link href="/tenant/payments" className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold hover:bg-white/30 cursor-pointer inline-block">Pay Now</Link>
          </div>
          {/* Helpdesk */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-4 text-white">
            <Wrench size={14} className="mb-1" />
            <p className="text-[10px] text-white/80">Helpdesk</p>
            <p className="text-base sm:text-lg font-black">2 active tickets</p>
            <Link href="/tenant/helpdesk" className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold hover:bg-white/30 cursor-pointer inline-block">Raise Ticket</Link>
          </div>
          {/* Visitors */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#0D7A6E] rounded-2xl p-4 text-white">
            <Users size={14} className="mb-1" />
            <p className="text-[10px] text-white/80">Visitors</p>
            <p className="text-base sm:text-lg font-black">3 expected today</p>
            <Link href="/tenant/visitors" className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold hover:bg-white/30 cursor-pointer inline-block">Register</Link>
          </div>
          {/* Documents */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-4 text-white">
            <FileText size={14} className="mb-1" />
            <p className="text-[10px] text-white/80">Documents</p>
            <p className="text-base sm:text-lg font-black">12 files in locker</p>
            <Link href="/tenant/documents" className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-[10px] font-bold hover:bg-white/30 cursor-pointer inline-block">View Files</Link>
          </div>
        </div>
      </div>

      {/* Active Helpdesk Tickets + Building Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Helpdesk Tickets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Active Helpdesk Tickets</h2>
            <button className="text-xs font-semibold text-[#0F8B7D] hover:underline cursor-pointer">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {tickets.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.priorityColor}`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                  <Clock size={11} /> {t.remaining}
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${t.progress}%` }} />
                </div>
                {t.chatLabel && (
                  <button className="flex items-center gap-1 text-[10px] font-semibold text-[#0F8B7D] hover:underline cursor-pointer">
                    <MessageSquare size={11} /> {t.chatLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Building Notices */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Building Notices</h2>
            <div className="flex gap-1">
              <button onClick={() => setNoticeIndex(Math.max(0, noticeIndex - 1))} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setNoticeIndex(Math.min(notices.length - 1, noticeIndex + 1))} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {notices.map((n, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border border-gray-200 border-l-4 ${n.color}`}>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{n.day}</p>
                  <p className="text-xl font-black text-gray-900">{n.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{n.title}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

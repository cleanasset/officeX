"use client";

import React, { useState } from "react";
import { Home, Calendar, Wrench, Users, MoreHorizontal, MapPin, Car, Coffee, Zap, Bell, CheckCircle2, Clock, Wifi, ShieldCheck } from "lucide-react";

export default function EmployeeWorkplace() {
  const [activeTab, setActiveTab] = useState("home");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const quickActions = [
    { icon: MapPin, label: "Book Desk", color: "bg-[#0F8B7D]", action: () => showToast("Opening desk booking...") },
    { icon: Calendar, label: "Book Room", color: "bg-purple-600", action: () => showToast("Opening room booking...") },
    { icon: Wrench, label: "Raise Request", color: "bg-amber-500", action: () => showToast("Opening service request form...") },
    { icon: Users, label: "Register Visitor", color: "bg-blue-600", action: () => showToast("Opening visitor registration...") },
    { icon: Car, label: "Book Parking", color: "bg-slate-700", action: () => showToast("Opening parking reservation...") },
    { icon: Coffee, label: "Order Pantry", color: "bg-orange-500", action: () => showToast("Opening pantry order...") },
  ];

  const todaySchedule = [
    { time: "09:00 AM", event: "Desk A-12, Floor 4 — Zone A (Quiet)", status: "confirmed" },
    { time: "11:00 AM", event: "Meeting Room Orchid — Project Sync", status: "confirmed" },
    { time: "02:30 PM", event: "Visitor: Amit Shah (Home Ministry)", status: "pending" },
    { time: "04:00 PM", event: "Parking Bay P1-A08 reserved", status: "confirmed" },
  ];

  const myRequests = [
    { id: "SR-4421", issue: "AC not cooling in Zone B", status: "In Progress", sla: "2h remaining" },
    { id: "SR-4418", issue: "Flickering light near Desk C-04", status: "Resolved", sla: "Completed" },
    { id: "SR-4415", issue: "WiFi slow on Floor 4", status: "Assigned", sla: "4h remaining" },
  ];

  const workplaceServices = [
    { icon: Wifi, label: "IT Support", desc: "Network, devices & access" },
    { icon: Zap, label: "Electrical", desc: "Power, lighting & sockets" },
    { icon: Wrench, label: "Maintenance", desc: "Furniture, plumbing & repairs" },
    { icon: Coffee, label: "Housekeeping", desc: "Cleaning & pantry" },
    { icon: ShieldCheck, label: "Security", desc: "Access cards & CCTV" },
    { icon: Car, label: "Parking", desc: "Vehicle & EV charging" },
  ];

  return (
    <div className="flex flex-col gap-0 relative font-sans text-slate-900 bg-white min-h-screen max-w-md mx-auto border-x border-gray-100">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Status Bar */}
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-[#0F8B7D]/10 to-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-widest">Good Morning</span>
            <h1 className="text-lg font-black text-slate-900">My Workplace</h1>
          </div>
          <button className="relative p-2 rounded-full bg-white border border-gray-200 shadow-xs">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Location Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F8B7D]/10 flex items-center justify-center">
            <MapPin size={18} className="text-[#0F8B7D]" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-900 block">Apex Business Tower, BKC</span>
            <span className="text-[10px] text-slate-500 font-semibold">Floor 4 · Zone A · Desk A-12</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase">Checked In</span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-5 py-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Quick Actions</span>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="px-5 py-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Today&apos;s Schedule</span>
        <div className="flex flex-col gap-2">
          {todaySchedule.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] font-bold text-slate-500 min-w-[60px]">{item.time}</span>
              <span className="text-[11px] font-semibold text-slate-800 flex-1">{item.event}</span>
              <span className={`w-2 h-2 rounded-full ${item.status === "confirmed" ? "bg-emerald-500" : "bg-amber-400"}`}></span>
            </div>
          ))}
        </div>
      </div>

      {/* My Requests */}
      <div className="px-5 py-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">My Service Requests</span>
        <div className="flex flex-col gap-2">
          {myRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-900 block">{req.issue}</span>
                <span className="text-[9px] text-slate-500 font-semibold">{req.id} · {req.sla}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                req.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : req.status === "In Progress" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
              }`}>{req.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workplace Services */}
      <div className="px-5 py-4 pb-24">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Workplace Services</span>
        <div className="grid grid-cols-2 gap-2.5">
          {workplaceServices.map((svc) => (
            <button key={svc.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer text-left">
              <svc.icon size={16} className="text-[#0F8B7D]" />
              <div>
                <span className="text-[10px] font-bold text-slate-900 block">{svc.label}</span>
                <span className="text-[9px] text-slate-500">{svc.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4 z-40">
        {[
          { icon: Home, label: "Home", active: activeTab === "home" },
          { icon: Calendar, label: "Book", active: activeTab === "book" },
          { icon: Wrench, label: "Requests", active: activeTab === "requests" },
          { icon: Users, label: "Visitors", active: activeTab === "visitors" },
          { icon: MoreHorizontal, label: "More", active: activeTab === "more" },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label.toLowerCase())}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${tab.active ? "text-[#0F8B7D]" : "text-slate-400"}`}
          >
            <tab.icon size={20} />
            <span className="text-[9px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

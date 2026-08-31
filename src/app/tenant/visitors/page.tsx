"use client";
import React, { useState } from "react";
import { Calendar, Users, LogOut, Search, Filter, CheckCircle, MoreVertical } from "lucide-react";

export default function VisitorPreRegistration() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", purpose: "Meeting", host: "Sarah Jenkins (You)", date: "", vehicle: "" });
  const [toast, setToast] = useState<string | null>(null);

  const visitors = [
    { name: "Alice Freeman", company: "TechFlow Inc", host: "Sarah Jenkins", checkIn: "09:15 AM", checkOut: "--", status: "Active" },
    { name: "Robert Chen", company: "Global Logistics", host: "Sarah Jenkins", checkIn: "10:30 AM", checkOut: "11:45 AM", status: "Completed" },
    { name: "Maria Garcia", company: "Independent Contractor", host: "Michael Scott", checkIn: "11:00 AM", checkOut: "--", status: "Active" },
    { name: "James Wilson", company: "City Maintenance", host: "Pam Beesly", checkIn: "--", checkOut: "--", status: "Expected" },
    { name: "Emily Davis", company: "Design Studio X", host: "Sarah Jenkins", checkIn: "--", checkOut: "--", status: "Expected" },
    { name: "David Miller", company: "Consulting Group", host: "Michael Scott", checkIn: "--", checkOut: "--", status: "Expected" }
  ];

  const statusStyle = (s: string) => {
    if (s === "Active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "Completed") return "bg-gray-100 text-gray-600 border border-gray-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900">Visitor Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">Pre-register visitors to streamline their check-in process at the lobby.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0"><Calendar size={18} className="text-purple-500" /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Expected Today</p><p className="text-2xl md:text-3xl font-black text-gray-900">5</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Users size={18} className="text-emerald-500" /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Checked In</p><p className="text-2xl md:text-3xl font-black text-gray-900">2</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><LogOut size={18} className="text-gray-500" /></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Checked Out</p><p className="text-2xl md:text-3xl font-black text-gray-900">1</p></div>
        </div>
      </div>

      {/* Form + Pass Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-2xs">
          <h2 className="text-sm md:text-base font-black text-gray-900 mb-4">Pre-Register a Visitor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. John Doe" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Company</label><input value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} placeholder="e.g. Initech" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Email</label><input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="john@example.com" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Purpose of Visit</label><select value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value})} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white"><option>Meeting</option><option>Interview</option><option>Delivery</option><option>Maintenance</option></select></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Host Employee</label><select value={form.host} onChange={(e) => setForm({...form, host: e.target.value})} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white"><option>Sarah Jenkins (You)</option><option>Michael Scott</option><option>Pam Beesly</option></select></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Date &amp; Time</label><input type="datetime-local" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Vehicle Registration (Optional)</label><input value={form.vehicle} onChange={(e) => setForm({...form, vehicle: e.target.value})} placeholder="License Plate #" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
          </div>
          <div className="flex gap-2.5 mt-5 justify-end">
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">Cancel</button>
            <button onClick={() => { setToast("Visitor pre-registered!"); setTimeout(() => setToast(null), 3500); }} className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold cursor-pointer shadow-xs">Pre-Register Visitor</button>
          </div>
        </div>
        {/* Pass Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Pass Preview</p>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200 mb-3">
            <div className="w-12 h-12 mx-auto mb-2 bg-[#0F8B7D]/10 rounded-xl flex items-center justify-center"><Users size={20} className="text-[#0F8B7D]" /></div>
            <p className="text-sm font-bold text-gray-900">{form.name || "John Doe"}</p>
            <p className="text-xs text-gray-500">{form.company || "Initech"}</p>
            <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-400 border-t border-gray-200 pt-2">
              <div><p className="font-bold uppercase">Host</p><p className="text-gray-700 font-semibold">S. Jenkins</p></div>
              <div><p className="font-bold uppercase">Date</p><p className="text-gray-700 font-semibold">Today</p></div>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">📱 Send via SMS</button>
            <button className="w-full py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">✉️ Email Pass</button>
          </div>
        </div>
      </div>

      {/* Today's Visitor Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-2xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-black text-gray-900">Today&apos;s Visitor Log</h2>
          <div className="flex gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search visitors..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-full sm:w-44" /></div>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer"><Filter size={14} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Visitor Name</th>
                <th className="py-3 pr-3">Company</th>
                <th className="py-3 pr-3">Host</th>
                <th className="py-3 pr-3">Check-In</th>
                <th className="py-3 pr-3">Check-Out</th>
                <th className="py-3 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.name} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3 pr-3 font-bold text-gray-900">{v.name}</td>
                  <td className="py-3 pr-3 text-gray-600">{v.company}</td>
                  <td className="py-3 pr-3 text-gray-600">{v.host}</td>
                  <td className="py-3 pr-3 text-gray-600">{v.checkIn}</td>
                  <td className="py-3 pr-3 text-gray-600">{v.checkOut}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${statusStyle(v.status)}`}>
                      {v.status}
                    </span>
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

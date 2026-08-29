"use client";

import React, { useState } from "react";
import { Users, Plus, X, QrCode, ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, LogOut, CheckCircle2, UserCheck, Play } from "lucide-react";

export default function Visitors() {
  const [visitors, setVisitors] = useState([
    { id: 1, name: "Amit Shah", company: "Home Ministry Audits", code: "VIS-9902", date: "Aug 29, 2026", time: "10:00 AM", type: "Official", status: "Approved", checkedIn: false, overstay: false, safe: false },
    { id: 2, name: "Vikram Malhotra", company: "Premium TechServe", code: "VIS-1029", date: "Aug 29, 2026", time: "11:30 AM", type: "Contractor", status: "Checked In", checkedIn: true, overstay: false, safe: false },
    { id: 3, name: "Shubham Sen", company: "Dharma Media", code: "VIS-8812", date: "Aug 28, 2026", time: "09:00 AM", type: "Guest", status: "Overstay Alert", checkedIn: true, overstay: true, safe: false }
  ]);

  const [watchlist] = useState([
    "blacklist", "blocked guest", "cyber threat corp", "malicious vendor"
  ]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: "Guest",
    time: "12:00 PM",
    vehicle: "",
    consent: false,
    recurring: false,
    recurringPeriod: "Daily",
    parkingSlot: "None",
    contractorDocStatus: "Valid"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company) {
      alert("Please fill in the guest name and representing company.");
      return;
    }

    if (!form.consent) {
      alert("Privacy and safety consent is mandatory for gate passcode issuance.");
      return;
    }

    // Watchlist check
    const normalizedName = form.name.toLowerCase();
    const normalizedCompany = form.company.toLowerCase();
    const isMatched = watchlist.some(w => normalizedName.includes(w) || normalizedCompany.includes(w));

    if (isMatched) {
      alert("CRITICAL WARNING: The entered identity matches an active security watchlist boundary. Gatepass generation has been blocked. System logged this incident to Security Operations.");
      return;
    }

    // Contractor compliance check
    if (form.type === "Contractor" && form.contractorDocStatus === "Expired") {
      alert("COMPLIANCE BLOCK: This contractor's safety NOC / liability documentation has expired. Visitor pass cannot be issued until valid certificates are uploaded.");
      return;
    }

    const newV = {
      id: visitors.length + 1,
      name: form.name,
      company: form.company,
      code: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Aug 29, 2026",
      time: form.time,
      type: form.type,
      status: "Approved",
      checkedIn: false,
      overstay: false,
      safe: false,
      vehicle: form.vehicle || "N/A",
      parkingSlot: form.parkingSlot,
      recurring: form.recurring ? `Yes (${form.recurringPeriod})` : "No"
    };

    setVisitors([...visitors, newV]);
    setIsRegistering(false);
    setForm({ 
      name: "", email: "", phone: "", company: "", type: "Guest", time: "12:00 PM", 
      vehicle: "", consent: false, recurring: false, recurringPeriod: "Daily", 
      parkingSlot: "None", contractorDocStatus: "Valid" 
    });
    showToast(`Visitor invitation created for ${newV.name}. Passcode: ${newV.code}`);
  };

  const handleCheckOut = (id: number) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return { ...v, status: "Checked Out", checkedIn: false, overstay: false };
      }
      return v;
    }));
    showToast("Visitor checked out successfully.");
  };

  const handleDeclineCheckIn = (id: number, name: string) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return { ...v, status: "Check-in Declined", checkedIn: false };
      }
      return v;
    }));
    setSecurityAlert(`SECURITY ALERT: Check-in declined by Host for ${name}. Instruct guest to exit BKC premises immediately.`);
    showToast(`Security operations notified of check-in refusal.`);
  };

  const handleExtendPass = (id: number) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return { ...v, time: "06:00 PM (Extended)", status: "Approved (Extended)" };
      }
      return v;
    }));
    if (selectedVisitor && selectedVisitor.id === id) {
      setSelectedVisitor({ ...selectedVisitor, time: "06:00 PM (Extended)", status: "Approved (Extended)" });
    }
    showToast("Visitor pass validity extended until 06:00 PM today.");
  };

  const handleMarkSafe = (id: number) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return { ...v, safe: true };
      }
      return v;
    }));
    showToast("Marked safe in database.");
  };

  const handlePrintBadge = (name: string, code: string) => {
    showToast(`Badge print command dispatched to gatekeeper printer. Code: ${code}`);
  };

  // UAT emergency statistics
  const insideCount = visitors.filter(v => v.checkedIn).length;
  const overstayCount = visitors.filter(v => v.overstay).length;
  const safeCount = visitors.filter(v => v.checkedIn && v.safe).length;

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Visitor Pre-Registration</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Register incoming guests, audit active check-ins, and trigger emergency drills.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEmergencyActive(!isEmergencyActive)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors ${
              isEmergencyActive 
                ? "bg-red-650 hover:bg-red-700 text-white animate-pulse"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            <ShieldAlert size={14} /> {isEmergencyActive ? "Cancel Emergency Drill" : "Trigger Emergency Roll-Call"}
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus size={14} /> Register Guest
          </button>
        </div>
      </div>

      {/* Security Alert Banner */}
      {securityAlert && (
        <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-750 font-black text-xs flex justify-between items-center animate-scale-up">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-700 animate-bounce" />
            <span>{securityAlert}</span>
          </div>
          <button onClick={() => setSecurityAlert(null)} className="p-1 rounded-full hover:bg-red-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Emergency Status Alert Box */}
      {isEmergencyActive && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-scale-up">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
              <ShieldAlert size={18} />
              <span>ACTIVE EMERGENCY ROLL CALL</span>
            </div>
            <p className="text-xs text-slate-650 font-bold mt-1">Please audit and mark safety status for all visitors currently verified inside BKC Campus.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-black">
            <span className="text-slate-500">Inside: <span className="text-slate-950 font-black">{insideCount}</span></span>
            <span className="text-emerald-600">Verified Safe: <span className="font-black">{safeCount} / {insideCount}</span></span>
          </div>
        </div>
      )}

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-250/60 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expected Today</span>
          <span className="text-xl font-extrabold text-slate-900 block">{visitors.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-250/60 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Checked In</span>
          <span className="text-xl font-extrabold text-indigo-600 block">{insideCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-250/60 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Overstays</span>
          <span className="text-xl font-extrabold text-red-600 block">{overstayCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-250/60 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">KYC Consent Rate</span>
          <span className="text-xl font-extrabold text-emerald-600 block">100% Verified</span>
        </div>
      </div>

      {/* Visitors List Grid/Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4">Guest Name</th>
              <th className="py-4">Representing Company</th>
              <th className="py-4">Category</th>
              <th className="py-4">Pre-Reg Passcode</th>
              <th className="py-4">Expected Date/Time</th>
              <th className="py-4 text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr 
                key={v.id} 
                className="border-b border-slate-100 text-xs hover:bg-slate-50/60 transition-colors font-semibold"
              >
                <td 
                  onClick={() => setSelectedVisitor(v)}
                  className="py-4 font-black text-slate-900 flex items-center gap-2.5 cursor-pointer hover:text-purple-600 hover:underline"
                >
                  <Users size={14} className="text-purple-600" />
                  {v.name}
                </td>
                <td className="py-4 text-slate-650">{v.company}</td>
                <td className="py-4">
                  <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9px] font-black uppercase text-slate-600">
                    {v.type}
                  </span>
                </td>
                <td className="py-4 font-mono font-bold text-purple-600">{v.code}</td>
                <td className="py-4 text-slate-650">{v.date} ({v.time})</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isEmergencyActive && v.checkedIn && !v.safe && (
                      <button 
                        onClick={() => handleMarkSafe(v.id)}
                        className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] cursor-pointer transition-colors"
                      >
                        Mark Safe
                      </button>
                    )}
                    {v.status === "Approved" && (
                      <button
                        onClick={() => handleDeclineCheckIn(v.id, v.name)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-bold text-[10px] cursor-pointer"
                      >
                        Decline Entry
                      </button>
                    )}
                    {v.checkedIn ? (
                      <>
                        {v.safe && (
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[8px] uppercase">Safe ✔</span>
                        )}
                        <button 
                          onClick={() => handleCheckOut(v.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-[10px] cursor-pointer flex items-center gap-1"
                        >
                          <LogOut size={10} /> Check-out
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        v.status === "Approved" || v.status === "Approved (Extended)"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                          : v.status === "Checked Out"
                          ? "bg-slate-100 text-slate-500 border border-slate-200"
                          : "bg-red-55 border border-red-200 text-red-650"
                      }`}>
                        {v.status}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guest Pre-Registration Passcode Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center gap-5 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-full flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Gatekeeper Pass Preview</h3>
              <button 
                onClick={() => setSelectedVisitor(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full flex flex-col items-center p-6 rounded-2xl bg-slate-50 border border-slate-100 gap-4">
              <QrCode size={120} className="text-[#0F8B7D] p-2 bg-white border border-slate-200 rounded-xl" />
              <div className="text-center">
                <span className="font-mono font-black text-[#0F8B7D] text-base">{selectedVisitor.code}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">{selectedVisitor.name}</span>
                <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">{selectedVisitor.company}</span>
              </div>
            </div>

            <div className="w-full text-xs font-semibold text-slate-700 flex flex-col gap-2.5">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Verification State</span>
                <span className="text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                  <ShieldCheck size={12} /> {selectedVisitor.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Access Zone / Parking</span>
                <span className="font-extrabold text-slate-900">Unit 5A ({selectedVisitor.parkingSlot || "No Parking Assigned"})</span>
              </div>
              <div className="flex justify-between">
                <span>Valid Date & Time</span>
                <span className="font-bold text-slate-650">{selectedVisitor.date} ({selectedVisitor.time})</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {selectedVisitor.status.includes("Approved") && (
                <button
                  onClick={() => handleExtendPass(selectedVisitor.id)}
                  className="py-2.5 rounded-xl border border-gray-250 text-gray-700 font-bold text-[10px] cursor-pointer text-center hover:bg-gray-50"
                >
                  Extend Pass
                </button>
              )}
              <button 
                onClick={() => handlePrintBadge(selectedVisitor.name, selectedVisitor.code)}
                className={`py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0d7569] text-white font-bold text-[10px] shadow-md transition-colors cursor-pointer text-center ${
                  !selectedVisitor.status.includes("Approved") ? "col-span-2" : ""
                }`}
              >
                Print Gate Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Guest Modal */}
      {isRegistering && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in overflow-y-auto">
          <form 
            onSubmit={handleRegister}
            className="w-full max-w-md bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-2xl border border-slate-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Register Incoming Guest</h3>
              <button 
                type="button" 
                onClick={() => setIsRegistering(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guest Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Alok Roy"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. TCS Auditor"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guest Email</label>
                  <input 
                    type="email"
                    placeholder="e.g. guest@tcs.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guest Phone</label>
                  <input 
                    type="tel"
                    placeholder="e.g. +91 99887 76655"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Expected Time</label>
                  <input 
                    type="text"
                    placeholder="e.g. 02:00 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Visitor Category</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0F8B7D] bg-white cursor-pointer"
                  >
                    <option value="Guest">Guest</option>
                    <option value="Client">Client</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Official">Official</option>
                  </select>
                </div>
              </div>

              {/* Contractor Specific NOC Document check status validation (UAT contractor NOC block) */}
              {form.type === "Contractor" && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <label className="text-[10px] font-bold text-purple-750 uppercase">Safety NOC & Liability Status</label>
                  <select
                    value={form.contractorDocStatus}
                    onChange={(e) => setForm({ ...form, contractorDocStatus: e.target.value })}
                    className="px-3 py-1.5 border border-purple-200 rounded-lg text-xs font-bold bg-white text-slate-900 cursor-pointer"
                  >
                    <option value="Valid">Valid Safety Certificates & Insurance NOC</option>
                    <option value="Expired">Expired Safety Certificates (Pass will block)</option>
                  </select>
                </div>
              )}

              {/* Vehicle registration and Parking Bay Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Plate (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. MH 02 AB 1234"
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Parking Bay Allocation</label>
                  <select
                    value={form.parkingSlot}
                    onChange={(e) => setForm({ ...form, parkingSlot: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="None">No Parking Required</option>
                    <option value="Bay P1-A08">Bay P1-A08 (Standard)</option>
                    <option value="Bay P2-B45 (EV)">Bay P2-B45 (EV Station)</option>
                  </select>
                </div>
              </div>

              {/* Scheduling Recurring Visits */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.recurring}
                    onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                    className="rounded border-slate-300 text-[#0F8B7D] focus:ring-[#0F8B7D] cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-450 uppercase">Setup Recurring Visit Schedule</span>
                </label>
                {form.recurring && (
                  <div className="grid grid-cols-2 gap-3 mt-1 animate-scale-up">
                    <select
                      value={form.recurringPeriod}
                      onChange={(e) => setForm({ ...form, recurringPeriod: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="Daily">Daily recurrence</option>
                      <option value="Weekly">Weekly recurrence</option>
                      <option value="Monthly">Monthly recurrence</option>
                    </select>
                    <span className="text-[10px] text-gray-500 font-semibold flex items-center">
                      Auto-invitations scheduled
                    </span>
                  </div>
                )}
              </div>

              {/* Consent check */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 mt-2">
                <input 
                  type="checkbox"
                  id="consent"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="consent" className="text-[10px] leading-relaxed text-slate-650 select-none cursor-pointer">
                  I verify that this guest is authorized to enter our office premises. The guest consents to sharing contact and KYC details for building safety compliance.
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsRegistering(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Create Invitation Pass
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

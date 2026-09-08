"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  Home, CreditCard, Wrench, Users, FileText, Calendar, Clock, 
  MessageSquare, ChevronLeft, ChevronRight, MapPin, Maximize2, 
  X, CheckCircle2, Download, ShieldCheck 
} from "lucide-react";

export default function TenantHomepage() {
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  const notices = [
    { day: "SAT", date: "12", title: "Pest control scheduled for floor 5", time: "10:00 AM", color: "border-l-[#0F8B7D]" },
    { day: "WED", date: "16", title: "Fire drill on Wednesday", time: "2:00 PM", color: "border-l-red-400" }
  ];

  const tickets = [
    { title: "AC Cooling Issue", priority: "HIGH PRIORITY", priorityColor: "bg-red-100 text-red-600", remaining: "2h remaining for resolution", progress: 75, chatLabel: "Chat with Helpdesk" },
    { title: "Electrical Socket Fix", priority: "STANDARD", priorityColor: "bg-gray-100 text-gray-600", remaining: "5h remaining for resolution", progress: 40, chatLabel: "" }
  ];

  const handlePayRent = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Hero Property Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Property Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr]">
          <div className="bg-gray-200 relative h-40 sm:h-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent" />
            <div className="h-full bg-[url('/images/showcase_office_techhorizon_hd.jpg')] bg-cover bg-center" />
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
                  <p className="text-xs font-bold text-gray-700">Prime CBD Corridor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-[320px]">
          {/* Monthly Rent */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#14B8A6] rounded-2xl p-4 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CreditCard size={12} />
                <span className="text-[10px] font-bold">DUE SEP 01</span>
              </div>
              <p className="text-[10px] text-white/80">Monthly Rent</p>
              <p className="text-base sm:text-lg font-black">₹1,91,000</p>
            </div>
            <button 
              onClick={() => { setPaymentStatus("idle"); setIsPaymentModalOpen(true); }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-[11px] font-bold cursor-pointer text-center w-full transition-colors shadow-2xs"
            >
              Pay Now
            </button>
          </div>
          {/* Helpdesk */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-4 text-white flex flex-col justify-between">
            <div>
              <Wrench size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Helpdesk</p>
              <p className="text-base sm:text-lg font-black">2 active tickets</p>
            </div>
            <Link href="/tenant/helpdesk" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Raise Ticket</Link>
          </div>
          {/* Visitors */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#0D7A6E] rounded-2xl p-4 text-white flex flex-col justify-between">
            <div>
              <Users size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Visitors</p>
              <p className="text-base sm:text-lg font-black">3 expected today</p>
            </div>
            <Link href="/tenant/visitors" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Register</Link>
          </div>
          {/* Documents */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-4 text-white flex flex-col justify-between">
            <div>
              <FileText size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Documents (12 files)</p>
              <p className="text-[11px] font-bold text-teal-200 truncate mt-0.5">Lease Agreement (Uploaded)</p>
            </div>
            <Link href="/tenant/documents" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">View Files</Link>
          </div>
        </div>
      </div>

      {/* Active Helpdesk Tickets + Building Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Helpdesk Tickets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Active Helpdesk Tickets</h2>
            <Link href="/tenant/helpdesk" className="text-xs font-semibold text-[#0F8B7D] hover:underline cursor-pointer">View All</Link>
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
                  <Link href="/tenant/helpdesk" className="flex items-center gap-1 text-[10px] font-semibold text-[#0F8B7D] hover:underline cursor-pointer">
                    <MessageSquare size={11} /> {t.chatLabel}
                  </Link>
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

      {/* RENT PAYMENT MODAL (per UI/UX Review Finding 5.3) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {paymentStatus === "success" ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Rent Payment Successful</h3>
                <p className="text-xs text-slate-600 mt-1.5">
                  Transaction ref: <strong className="font-mono text-slate-900">TXN-SEP-882914</strong>
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-5 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Rent (Floor 5 Unit 5A)</span>
                    <span className="font-bold text-slate-900">₹1,55,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CAM Charges</span>
                    <span className="font-bold text-slate-900">₹26,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-bold text-slate-900">₹10,000</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                    <span>Total Paid</span>
                    <span className="text-[#0F8B7D]">₹1,91,000</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      alert("Downloading Official Tax Invoice / Payment Receipt PDF...");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download size={14} /> Download Receipt (PDF)
                  </button>
                  <button 
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={18} className="text-[#0F8B7D]" />
                  <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">Secure Escrow Checkout</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Pay Monthly Rent</h3>
                <p className="text-xs text-slate-500 mt-0.5">Apex Business Tower · Unit 5A · September 2026</p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-5 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Rental</span>
                    <span className="font-bold text-slate-900">₹1,55,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Common Area Maintenance (CAM)</span>
                    <span className="font-bold text-slate-900">₹26,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable GST (18%)</span>
                    <span className="font-bold text-slate-900">₹10,000</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                    <span>Total Due</span>
                    <span className="text-[#0F8B7D]">₹1,91,000</span>
                  </div>
                </div>

                <form onSubmit={handlePayRent}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        paymentMethod === "upi" ? "border-[#0F8B7D] bg-teal-50/60 text-[#0F8B7D]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Instant UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        paymentMethod === "card" ? "border-[#0F8B7D] bg-teal-50/60 text-[#0F8B7D]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Credit/Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        paymentMethod === "netbanking" ? "border-[#0F8B7D] bg-teal-50/60 text-[#0F8B7D]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      NetBanking
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentStatus === "processing"}
                    className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {paymentStatus === "processing" ? "Processing Escrow Payment..." : "Confirm & Pay ₹1,91,000"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

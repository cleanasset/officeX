"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  Home, CreditCard, Wrench, Users, FileText, Calendar, Clock, 
  MessageSquare, ChevronLeft, ChevronRight, MapPin, Maximize2, 
  X, CheckCircle2, Download, ShieldCheck, Send, AlertTriangle,
  Check, Bell, Laptop, ArrowRight, UserCheck, Sparkles
} from "lucide-react";

export default function TenantHomepage() {
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [rentPaid, setRentPaid] = useState(false);

  // Chat with Helpdesk state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Ramesh Kumar (Sr. HVAC Lead)",
      time: "10:15 AM",
      text: "Hello Sir, I have received ticket #TKT-881 for Unit 5A. The secondary AHU actuator valve is showing an intermittent pressure drop.",
      isAgent: true
    },
    {
      id: 2,
      sender: "FM Command Centre",
      time: "10:30 AM",
      text: "Technician Ramesh Kumar dispatched with replacement Honeywell valve assembly. Current ETA: 35 minutes.",
      isAgent: true
    }
  ]);
  const [newChatMessage, setNewChatMessage] = useState("");

  // Book a Room state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("boardroom");
  const [selectedDate, setSelectedDate] = useState("Today, 15 Sep");
  const [selectedSlot, setSelectedSlot] = useState("02:00 PM - 03:00 PM");
  const [roomBookedSuccess, setRoomBookedSuccess] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(18);

  // Ticket Escalation state
  const [escalated, setEscalated] = useState(false);

  const notices = [
    { day: "SAT", date: "12", title: "Pest control scheduled for floor 5", time: "10:00 AM", color: "border-l-[#0F8B7D]" },
    { day: "WED", date: "16", title: "Fire drill on Wednesday", time: "2:00 PM", color: "border-l-red-400" }
  ];

  const tickets = [
    { 
      id: "TKT-881",
      title: "AC Cooling Issue (Floor 5 South Wing)", 
      priority: "HIGH PRIORITY", 
      priorityColor: "bg-red-100 text-red-600", 
      remaining: "1h 45m remaining for resolution", 
      progress: 75, 
      chatLabel: "Chat with Helpdesk" 
    },
    { 
      id: "TKT-882",
      title: "Electrical Socket Fix (Cabin 3)", 
      priority: "STANDARD", 
      priorityColor: "bg-gray-100 text-gray-600", 
      remaining: "5h remaining for resolution", 
      progress: 40, 
      chatLabel: "" 
    }
  ];

  const handlePayRent = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setRentPaid(true);
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: "You (Enterprise Admin)",
      time: "Just now",
      text: newChatMessage,
      isAgent: false
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewChatMessage("");

    // Simulated reply from FM Lead
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "Ramesh Kumar (Sr. HVAC Lead)",
          time: "Just now",
          text: "Acknowledged. I have arrived on Floor 5 service duct. Commencing actuator valve calibration.",
          isAgent: true
        }
      ]);
    }, 1500);
  };

  const handleBookRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomBookedSuccess(true);
    setCreditsRemaining((prev) => Math.max(0, prev - 2));
  };

  const handleEscalate = () => {
    setEscalated(true);
    alert("Ticket #TKT-881 has been escalated to Level-2 FM Lead (Mr. Vikram Malhotra - Head of Operations) via direct WhatsApp & priority CAFM dispatch.");
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Hero Property Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Property Card with Space Utilisation */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr]">
          <div className="bg-gray-200 relative h-40 sm:h-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent" />
            <div className="h-full bg-[url('/images/showcase_office_techhorizon_hd.jpg')] bg-cover bg-center" />
          </div>
          <div className="p-5 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                ACTIVE ENTERPRISE LEASE
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: APX-5A-2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Apex Business Tower</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Floor 5, Unit 5A · Platinum Grade Asset</p>
            
            <div className="flex items-center gap-6 mt-3">
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

            {/* Space Utilisation Metric */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Users size={12} className="text-[#0F8B7D]" />
                  <span>Real-time Space Utilisation:</span>
                </span>
                <span className="font-bold text-slate-900">
                  72 / 85 seats <span className="text-[#0F8B7D] font-black">(84.7% occupied)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-[#0F8B7D]" style={{ width: "84.7%" }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>13 hot desks currently unallocated · IoT telemetry active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - 5 Cards (2x3 responsive layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 w-full lg:w-[360px]">
          {/* Monthly Rent */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#14B8A6] rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CreditCard size={12} />
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${rentPaid ? "bg-emerald-800/80 text-white" : "bg-white/20 text-white"}`}>
                  {rentPaid ? "PAID ✓" : "DUE SEP 01"}
                </span>
              </div>
              <p className="text-[10px] text-white/80">Monthly Rent</p>
              <p className="text-base sm:text-lg font-black">
                {rentPaid ? "₹0 Due" : "₹1,91,000"}
              </p>
              {rentPaid && (
                <p className="text-[10px] text-teal-100 mt-0.5">Next billing: 01 Oct 2026</p>
              )}
            </div>
            <button 
              onClick={() => { setPaymentStatus(rentPaid ? "success" : "idle"); setIsPaymentModalOpen(true); }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-[11px] font-bold cursor-pointer text-center w-full transition-colors shadow-2xs"
            >
              {rentPaid ? "View Receipt" : "Pay Now"}
            </button>
          </div>

          {/* Helpdesk */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <Wrench size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Helpdesk</p>
              <p className="text-base sm:text-lg font-black">2 active tickets</p>
            </div>
            <Link href="/tenant/helpdesk" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Raise Ticket</Link>
          </div>

          {/* Visitors */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#0D7A6E] rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <Users size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Visitors</p>
              <p className="text-base sm:text-lg font-black">3 expected today</p>
            </div>
            <Link href="/tenant/visitors" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Register</Link>
          </div>

          {/* Documents */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <FileText size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Documents (12 files)</p>
              <p className="text-[11px] font-bold text-teal-200 truncate mt-0.5">Lease Agreement (Active)</p>
            </div>
            <Link href="/tenant/documents" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">View Files</Link>
          </div>

          {/* 5th Quick Action Card: Book a Room */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-3.5 text-white flex items-center justify-between border border-teal-800/60 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-teal-300 text-[10px] font-bold mb-0.5">
                <Calendar size={12} />
                <span>BOOK A ROOM</span>
              </div>
              <p className="text-xs font-bold text-white">Conference &amp; Meeting Pods</p>
              <p className="text-[10px] text-slate-300 mt-0.5 font-mono">{creditsRemaining} / 25 credits remaining</p>
            </div>
            <button
              onClick={() => { setRoomBookedSuccess(false); setIsRoomModalOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Book Room
            </button>
          </div>
        </div>
      </div>

      {/* Active Helpdesk Tickets + Building Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Helpdesk Tickets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Active Helpdesk Tickets</h2>
              <p className="text-xs text-slate-500">Live SLA resolution countdown &amp; engineering dispatch</p>
            </div>
            <Link href="/tenant/helpdesk" className="text-xs font-semibold text-[#0F8B7D] hover:underline cursor-pointer">View All</Link>
          </div>
          <div className="flex flex-col gap-4">
            {tickets.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                    <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.priorityColor}`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                  <Clock size={11} /> {t.remaining}
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${t.progress}%` }} />
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  {t.chatLabel ? (
                    <button 
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                    >
                      <MessageSquare size={13} />
                      <span>{t.chatLabel}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Assigned to Electrician Team</span>
                  )}

                  {t.id === "TKT-881" && (
                    <button
                      type="button"
                      onClick={handleEscalate}
                      disabled={escalated}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        escalated
                          ? "bg-amber-100 text-amber-800 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      <AlertTriangle size={12} />
                      <span>{escalated ? "Escalated to L2 Head ✓" : "Request Escalation"}</span>
                    </button>
                  )}
                </div>
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

      {/* ========================================================================= */}
      {/* CHAT WITH HELPDESK MODAL / DRAWER                                        */}
      {/* ========================================================================= */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500 text-slate-900 font-bold flex items-center justify-center text-xs">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Ramesh Kumar</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] text-teal-300">Sr. HVAC Technician · Ticket #TKT-881</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              <div className="text-center my-1">
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  Today · SLA Resolution Active
                </span>
              </div>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isAgent ? "items-start" : "items-end"}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.sender} · {msg.time}</span>
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl ${
                      msg.isAgent
                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs"
                        : "bg-[#0F8B7D] text-white rounded-tr-xs shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Type instructions or reply to technician..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOOK A ROOM MODAL                                                        */}
      {/* ========================================================================= */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {roomBookedSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Meeting Room Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Access Code: <strong className="font-mono text-slate-900 font-black">ROOM-4819</strong> (Auto-synced to turnstiles)
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-5 text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Room:</span>
                    <strong className="text-slate-900 uppercase">{selectedRoom}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Schedule:</span>
                    <strong className="text-slate-900">{selectedDate} · {selectedSlot}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Credits Deducted:</span>
                    <strong className="text-[#0F8B7D]">2 Credits (Balance: {creditsRemaining})</strong>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Downloading Apple / Google Calendar (.ics) invite...")}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0c7368] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Book a Meeting Room</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Floor 5 Executive Center · Instant Access</p>
                  </div>
                  <span className="text-[11px] font-bold font-mono bg-teal-50 text-[#0F8B7D] px-2.5 py-1 rounded-lg border border-teal-100">
                    {creditsRemaining} Credits Left
                  </span>
                </div>

                <form onSubmit={handleBookRoom} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Select Space:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "boardroom", name: "Boardroom", cap: "18 Pax", cost: "2 credits/hr" },
                        { id: "strategy", name: "Strategy Pod", cap: "6 Pax", cost: "1.5 credits/hr" },
                        { id: "phone", name: "Focus Booth", cap: "1 Pax", cost: "1 credit/hr" },
                      ].map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => setSelectedRoom(rm.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedRoom === rm.id
                              ? "border-[#0F8B7D] bg-teal-50/60 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{rm.name}</p>
                          <p className="text-[10px] text-slate-500">{rm.cap}</p>
                          <p className="text-[10px] font-semibold text-[#0F8B7D] mt-0.5">{rm.cost}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Date:
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      >
                        <option value="Today, 15 Sep">Today, 15 Sep</option>
                        <option value="Tomorrow, 16 Sep">Tomorrow, 16 Sep</option>
                        <option value="Thursday, 17 Sep">Thursday, 17 Sep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Time Slot:
                      </label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      >
                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                        <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                        <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Meeting Title / Host Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 Leadership Review / Client Pitch"
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
                  >
                    Confirm Booking (Deduct 2 Credits)
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

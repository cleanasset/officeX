"use client";
import React, { useState } from "react";
import { 
  Building, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  X, 
  CheckCircle, 
  Phone, 
  Mail, 
  Send, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText,
  Bell,
  Sparkles,
  MapPin,
  Smile,
  UserPlus,
  Car,
  HelpCircle,
  QrCode
} from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Interaction Drawers & Modals
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<"desk" | "room" | "parking" | null>(null);
  const [guestModal, setGuestModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);

  // Desk Booking State
  const [deskFloor, setDeskFloor] = useState("Floor 4");
  const [deskZone, setDeskZone] = useState("Zone A (Quiet Zone)");
  const [deskId, setDeskId] = useState("Desk A-14");
  
  // Room Booking State
  const [roomName, setRoomName] = useState("Boardroom (12 Seater)");
  const [roomTime, setRoomTime] = useState("02:00 PM - 03:00 PM");

  // Parking Booking State
  const [parkingBay, setParkingBay] = useState("P2-B45 (EV Station)");

  // Guest Registration State
  const [guestName, setGuestName] = useState("");
  const [guestCompany, setGuestCompany] = useState("");
  const [guestTime, setGuestTime] = useState("11:30 AM");
  const [generatedPass, setGeneratedPass] = useState<any>(null);

  // Ticket Request State
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketCategory, setTicketCategory] = useState("HVAC");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  
  const [ticketsList, setTicketsList] = useState([
    { id: "T-402", title: "UPS Backup Alarm Beeping", category: "Electrical", status: "In Progress", priority: "High", due: "Due in 2 hours" },
    { id: "T-405", title: "Conference Room Projector Bulb Dim", category: "AV/IT", status: "Review Pending", priority: "Low", due: "Completed today" }
  ]);

  const [onboardingTasks, setOnboardingTasks] = useState([
    { task: "Commercial Lease Handover & Keys", done: true },
    { task: "Statutory fit-out Fire NOC audit", done: false },
    { task: "Server cabling & IT setup clearance", done: false },
    { task: "CAFM SLA Config & Service logs onboarding", done: false }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;
    const newT = {
      id: "T-" + Math.floor(Math.random() * 900 + 100),
      title: ticketTitle,
      category: ticketCategory,
      status: "Open",
      priority: ticketPriority,
      due: ticketPriority === "High" ? "Due in 1 hour" : "Due in 4 hours"
    };
    setTicketsList([newT, ...ticketsList]);
    setTicketTitle("");
    setTicketModal(false);
    showToast(`Helpdesk support ticket "${newT.title}" raised successfully!`);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const pass = {
      passId: "GP-" + Math.floor(Math.random() * 90000 + 10000),
      guestName,
      company: guestCompany || "Independent",
      time: guestTime,
      date: "Today"
    };
    setGeneratedPass(pass);
    showToast(`Visitor pass generated for ${guestName}! QR check-in active.`);
  };

  const handleDeskConfirm = () => {
    setBookingModal(null);
    showToast(`Desk ${deskId} successfully reserved on ${deskFloor} (${deskZone})!`);
  };

  const handleRoomConfirm = () => {
    setBookingModal(null);
    showToast(`Meeting Room "${roomName}" booked for today at ${roomTime}!`);
  };

  const handleParkingConfirm = () => {
    setBookingModal(null);
    showToast(`Parking Bay ${parkingBay} successfully reserved for your EV!`);
  };

  const handleToggleTask = (idx: number) => {
    setOnboardingTasks(onboardingTasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
    showToast(`Onboarding checklist updated!`);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tenant Dashboard</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">
            Tata Consultancy Services (TCS) • Apex Business Tower, Floor 4 & 5
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTicketModal(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm cursor-pointer"
          >
            Raise Support Request
          </button>
          <Link href="/tenant/pay" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5">
            <DollarSign size={14} /> Pay Rent (₹12,45,000)
          </Link>
        </div>
      </div>

      {/* KPI GRID (6 Cards - Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
        
        {/* KPI 1: Occupancy */}
        <div 
          onClick={() => setSelectedKpi("occupancy")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Occupancy</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">92%</div>
          <span className="text-[9px] text-purple-600 font-bold mt-1 block">250 / 270 seats →</span>
        </div>

        {/* KPI 2: Workplace Cost */}
        <div 
          onClick={() => setSelectedKpi("cost")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Workplace Cost</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">₹12.45L</div>
          <span className="text-[9px] text-red-500 font-bold mt-1 block">Due: Sep 1, 2026 →</span>
        </div>

        {/* KPI 3: Open Requests */}
        <div 
          onClick={() => setSelectedKpi("requests")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Open Requests</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">{ticketsList.length}</div>
          <span className="text-[9px] text-amber-600 font-bold mt-1 block">In dispatch queue →</span>
        </div>

        {/* KPI 4: SLA Compliance */}
        <div 
          onClick={() => setSelectedKpi("sla")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">SLA Compliance</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">98.5%</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Target response met →</span>
        </div>

        {/* KPI 5: Employee Sat */}
        <div 
          onClick={() => setSelectedKpi("satisfaction")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Employee Sat</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">4.6 / 5</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Feedback surveys →</span>
        </div>

        {/* KPI 6: Utilization */}
        <div 
          onClick={() => setSelectedKpi("utilization")}
          className="premium-card p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/10 flex flex-col justify-between bg-white min-h-[110px] cursor-pointer transition-all group"
        >
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Utilization</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">78%</div>
          <span className="text-[9px] text-gray-500 font-bold mt-1 block">Avg peak occupancy →</span>
        </div>

      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4">Quick actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <button 
            onClick={() => setBookingModal("desk")}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer bg-white"
          >
            <UserPlus size={18} className="text-purple-500" />
            <span>Book Desk</span>
          </button>
          
          <button 
            onClick={() => setBookingModal("room")}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer bg-white"
          >
            <Calendar size={18} className="text-purple-500" />
            <span>Book Room</span>
          </button>

          <button 
            onClick={() => setTicketModal(true)}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer bg-white"
          >
            <HelpCircle size={18} className="text-purple-500" />
            <span>Raise Request</span>
          </button>

          <button 
            onClick={() => setGuestModal(true)}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer bg-white"
          >
            <Users size={18} className="text-purple-500" />
            <span>Register Guest</span>
          </button>

          <button 
            onClick={() => setBookingModal("parking")}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer bg-white"
          >
            <Car size={18} className="text-purple-500" />
            <span>Reserve Parking</span>
          </button>

          <button 
            onClick={() => setTicketModal(true)}
            className="p-4 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-bold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer bg-white"
          >
            <AlertTriangle size={18} className="text-purple-500" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Workspace Onboarding Steps (Clickable tasks) */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers size={18} className="text-purple-600" />
            Workspace Onboarding Checklist
          </h3>
          <p className="text-xs text-gray-500 font-semibold mb-4">Click any checklist task to toggle completion and sync with your property manager.</p>
          <div className="flex flex-col gap-3">
            {onboardingTasks.map((task, idx) => (
              <div 
                key={idx} 
                onClick={() => handleToggleTask(idx)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs hover:border-purple-300 cursor-pointer transition-all"
              >
                <span className={`font-semibold ${task.done ? "text-gray-800 line-through opacity-70" : "text-gray-900"}`}>{task.task}</span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  task.done ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                }`}>
                  {task.done ? "Completed" : "Awaiting"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Helpdesk ticket tracking */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              Active Helpdesk Dispatches
            </h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              {ticketsList.length} Active
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {ticketsList.map((ticket, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{ticket.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-semibold">Category: {ticket.category} • Priority: {ticket.priority}</div>
                  <div className="text-gray-400 mt-0.5 text-[10px] font-medium">{ticket.due}</div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                  ticket.status === "In Progress"
                    ? "bg-amber-50 border border-amber-200 text-amber-700"
                    : ticket.status === "Review Pending"
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-purple-50 border border-purple-200 text-purple-700"
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
            {ticketsList.length === 0 && (
              <div className="text-xs text-gray-400 italic text-center py-4">No active requests. All clean!</div>
            )}
          </div>
        </div>

      </div>

      {/* ===== KPI BREAKDOWN DRAWERS ===== */}
      {selectedKpi && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base capitalize">{selectedKpi} Insight Report</h3>
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Tata Consultancy Services</span>
                </div>
                <button 
                  onClick={() => setSelectedKpi(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Occupancy Detail */}
              {selectedKpi === "occupancy" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Floor 4 (Main Wing)</span>
                    <strong className="text-gray-900">120 / 130 seats (92%)</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Floor 5 (Tech Wing)</span>
                    <strong className="text-gray-900">130 / 140 seats (93%)</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[11px]">
                    ℹ️ Real-time IoT sensor mapping is live. Click "Book Desk" to reserve available hot desks.
                  </div>
                </div>
              )}

              {/* Cost Detail */}
              {selectedKpi === "cost" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Monthly Space Rent</span>
                    <strong className="text-gray-900">₹9,50,000</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>CAM Maintenance Charges</span>
                    <strong className="text-gray-900">₹2,15,000</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Energy & Utility Share</span>
                    <strong className="text-gray-900">₹80,000</strong>
                  </div>
                  <div className="p-4 rounded-xl border-t border-gray-200 pt-3 flex justify-between items-center text-sm font-extrabold text-purple-700">
                    <span>Total Due</span>
                    <span>₹12,45,000</span>
                  </div>
                </div>
              )}

              {/* Open Requests Detail */}
              {selectedKpi === "requests" && (
                <div className="flex flex-col gap-3 text-xs">
                  {ticketsList.map(t => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                      <div>
                        <strong className="text-gray-900 block">{t.title}</strong>
                        <span className="text-[10px] text-gray-500">{t.category} • {t.due}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px] uppercase">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SLA Compliance */}
              {selectedKpi === "sla" && (
                <div className="flex flex-col gap-4 text-xs font-semibold text-gray-700">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Critical Priority Response (Goal: 1h)</span>
                    <span className="text-emerald-600 font-bold">100% Met (Avg 22m)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Medium Priority Resolution (Goal: 4h)</span>
                    <span className="text-emerald-600 font-bold">98.2% Met (Avg 2.8h)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Low Priority Resolution (Goal: 24h)</span>
                    <span className="text-emerald-600 font-bold">100% Met</span>
                  </div>
                </div>
              )}

              {/* Employee Sat */}
              {selectedKpi === "satisfaction" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Recent Feedback Summary</span>
                    <p className="text-gray-700 italic">"Highly satisfied with the temperature comfort and lighting in Floor 4 quiet zone."</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Survey Response Rate</span>
                    <strong className="text-gray-900">82% (221 Employees)</strong>
                  </div>
                </div>
              )}

              {/* Utilization */}
              {selectedKpi === "utilization" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Peak Utilization (Tuesday/Wednesday)</span>
                    <strong className="text-gray-900">88% Capacity</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span>Off-Peak Utilization (Fridays)</span>
                    <strong className="text-gray-900">42% Capacity</strong>
                  </div>
                </div>
              )}

            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <button 
                onClick={() => setSelectedKpi(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOK DESK MODAL ===== */}
      {bookingModal === "desk" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Workplace Reservations</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Book a Hot Desk</h3>
              </div>
              <button 
                onClick={() => setBookingModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Floor</label>
                  <select 
                    value={deskFloor}
                    onChange={(e) => setDeskFloor(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Floor 4">Floor 4</option>
                    <option value="Floor 5">Floor 5</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Zone</label>
                  <select 
                    value={deskZone}
                    onChange={(e) => setDeskZone(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Zone A (Quiet Zone)">Zone A (Quiet Zone)</option>
                    <option value="Zone B (Collaborative)">Zone B (Collaborative)</option>
                    <option value="Zone C (Tech Support)">Zone C (Tech Support)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Available Desk ID</label>
                <select 
                  value={deskId}
                  onChange={(e) => setDeskId(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="Desk A-12">Desk A-12 (Window view)</option>
                  <option value="Desk A-14">Desk A-14 (Dual monitor)</option>
                  <option value="Desk B-02">Desk B-02 (Near pantry)</option>
                  <option value="Desk C-15">Desk C-15 (Standard)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-semibold">
                📝 Desks are reserved until 11:00 AM. Unclaimed desks are auto-released to the pool.
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setBookingModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeskConfirm}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOK ROOM MODAL ===== */}
      {bookingModal === "room" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Room Reservations</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Book Meeting Room</h3>
              </div>
              <button 
                onClick={() => setBookingModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Meeting Room Name</label>
                <select 
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="Boardroom (12 Seater)">Boardroom (12 Seater - VC Enabled)</option>
                  <option value="Huddle Space A (6 Seater)">Huddle Space A (6 Seater - Whiteboard)</option>
                  <option value="Focus Pod B (4 Seater)">Focus Pod B (4 Seater - Quiet)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Time Slot</label>
                <select 
                  value={roomTime}
                  onChange={(e) => setRoomTime(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setBookingModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRoomConfirm}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Book Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESERVE PARKING MODAL ===== */}
      {bookingModal === "parking" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Parking Bays</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Reserve Parking Slot</h3>
              </div>
              <button 
                onClick={() => setBookingModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Parking Level & Bay</label>
                <select 
                  value={parkingBay}
                  onChange={(e) => setParkingBay(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="P2-B45 (EV Station)">P2-B45 (EV Fast Charging Slot)</option>
                  <option value="P2-C12">P2-C12 (Standard Executive)</option>
                  <option value="P1-A08">P1-A08 (Visitor Spot)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setBookingModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleParkingConfirm}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Reserve Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VISITORS: REGISTER GUEST MODAL ===== */}
      {guestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Guest Management</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Register Corporate Visitor</h3>
              </div>
              <button 
                type="button"
                onClick={() => { setGuestModal(false); setGeneratedPass(null); }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Generated pass result view */}
            {generatedPass ? (
              <div className="flex flex-col gap-4 text-xs border border-purple-200 bg-purple-50/20 p-5 rounded-2xl items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-1">
                  ✓
                </div>
                <h4 className="font-extrabold text-gray-900 text-base">Visitor Registered Successfully</h4>
                
                <div className="p-3 bg-white rounded-xl border border-gray-200 my-2">
                  <QrCode size={90} className="text-gray-900" />
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-gray-700 font-semibold mt-1">
                  <span>Guest Pass: <strong className="text-purple-700">{generatedPass.passId}</strong></span>
                  <span>Visitor: <strong className="text-gray-900">{generatedPass.guestName}</strong></span>
                  <span>Company: <strong className="text-gray-900">{generatedPass.company}</strong></span>
                  <span>Time: <strong className="text-gray-900">{generatedPass.time}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => { setGuestModal(false); setGeneratedPass(null); }}
                  className="mt-3 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Guest Full Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Anand Mahindra"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Guest Company Org</label>
                  <input 
                    type="text"
                    placeholder="e.g. Mahindra Group"
                    value={guestCompany}
                    onChange={(e) => setGuestCompany(e.target.value)}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Arrival Time Slot</label>
                  <select 
                    value={guestTime}
                    onChange={(e) => setGuestTime(e.target.value)}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { setGuestModal(false); setGeneratedPass(null); }}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Register Visitor
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===== HELPDESK: RAISE SUPPORT TICKET MODAL ===== */}
      {ticketModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateTicket}
            className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Tenant Helpdesk</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Raise Support Incident</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setTicketModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Issue Summary</label>
                <input 
                  type="text"
                  placeholder="e.g. Server room temperature rising above 24°C"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Category</label>
                  <select 
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="HVAC">HVAC / Cooling</option>
                    <option value="Electrical">Electrical Power</option>
                    <option value="Housekeeping">Soft Services / Cleaning</option>
                    <option value="Security">Security & Access</option>
                    <option value="AV/IT">AV / IT Network</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Severity / SLA Priority</label>
                  <select 
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Low">Low (24h SLA)</option>
                    <option value="Medium">Medium (4h SLA)</option>
                    <option value="High">High / Critical (1h SLA)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setTicketModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Raise Support Ticket
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Home, Calendar, Wrench, Users, MapPin, Car, Coffee, Zap, 
  Bell, CheckCircle2, Clock, Wifi, ShieldCheck, Check, Sparkles, 
  Tv, Monitor, ArrowRight, X, QrCode, Building 
} from "lucide-react";
import Link from "next/link";

interface DeskItem {
  id: string;
  monitor: string;
  status: string;
  user?: string;
}

export default function EmployeeWorkplace() {
  const [toast, setToast] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<"Zone A" | "Zone B" | "Zone C">("Zone A");
  const [selectedDesk, setSelectedDesk] = useState<string>("Desk A-12");
  
  // Meeting Room State
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("11:00 AM - 12:00 PM");

  const showToast = (msg: string) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 3500); 
  };

  const deskList: Record<"Zone A" | "Zone B" | "Zone C", DeskItem[]> = {
    "Zone A": [
      { id: "Desk A-01", monitor: "Dual 27\" 4K", status: "available" },
      { id: "Desk A-02", monitor: "Single 32\" Curved", status: "occupied", user: "Rahul S." },
      { id: "Desk A-03", monitor: "Dual 27\" 4K", status: "available" },
      { id: "Desk A-04", monitor: "Single 27\"", status: "available" },
      { id: "Desk A-05", monitor: "Dual 27\" 4K", status: "occupied", user: "Sneha P." },
      { id: "Desk A-06", monitor: "Standing Desk", status: "available" },
      { id: "Desk A-07", monitor: "Dual 27\" 4K", status: "available" },
      { id: "Desk A-08", monitor: "Single 32\" Curved", status: "occupied", user: "Amit K." },
      { id: "Desk A-09", monitor: "Single 27\"", status: "available" },
      { id: "Desk A-10", monitor: "Standing Desk", status: "available" },
      { id: "Desk A-11", monitor: "Dual 27\" 4K", status: "available" },
      { id: "Desk A-12", monitor: "Executive Corner 4K", status: "selected" }
    ],
    "Zone B": [
      { id: "Desk B-01", monitor: "Dual 27\"", status: "occupied", user: "Vikram M." },
      { id: "Desk B-02", monitor: "Single 27\"", status: "available" },
      { id: "Desk B-03", monitor: "Collab Pod", status: "available" },
      { id: "Desk B-04", monitor: "Dual 27\"", status: "occupied", user: "Pooja R." },
      { id: "Desk B-05", monitor: "Single 27\"", status: "available" },
      { id: "Desk B-06", monitor: "Collab Pod", status: "available" }
    ],
    "Zone C": [
      { id: "Desk C-01", monitor: "Executive Focus", status: "available" },
      { id: "Desk C-02", monitor: "Executive Focus", status: "available" },
      { id: "Desk C-03", monitor: "Phone Booth", status: "available" },
      { id: "Desk C-04", monitor: "Executive Focus", status: "available" }
    ]
  };

  const meetingRooms = [
    { 
      name: "Boardroom Platinum", 
      capacity: "20 Seater", 
      features: "Dual 85\" 4K Displays · Polycom VC · Acoustic Glass", 
      status: "Available",
      rate: "Free for Floor 4 Tenants"
    },
    { 
      name: "Conf Room Orchid", 
      capacity: "12 Seater", 
      features: "75\" Touch Whiteboard · Wireless Screen Share", 
      status: "Available",
      rate: "Free for Floor 4 Tenants"
    },
    { 
      name: "Cyber-Bay Huddle", 
      capacity: "6 Seater", 
      features: "55\" Display · Jabra Speakerphone", 
      status: "Available",
      rate: "Free for Floor 4 Tenants"
    }
  ];

  const handleDeskSelect = (deskId: string, isOccupied: boolean) => {
    if (isOccupied) {
      showToast(`${deskId} is currently occupied by a teammate.`);
      return;
    }
    setSelectedDesk(deskId);
    showToast(`Selected ${deskId} for today. NFC digital badge updated!`);
  };

  const handleBookRoom = (roomName: string) => {
    setSelectedRoom(roomName);
  };

  const handleConfirmRoomBooking = () => {
    if (!selectedRoom) return;
    showToast(`Booked ${selectedRoom} for ${selectedSlot}! Calendar invite sent.`);
    setSelectedRoom(null);
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900 pb-12 w-full max-w-full">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Workplace &amp; Hot-Desk Hub</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Self-service hot-desk reservations, meeting room scheduling, and workplace amenities for One BKC (Floor 4).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/tenant/visitors"
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5"
          >
            <Users size={13} /> Visitors
          </Link>
          <Link
            href="/tenant/helpdesk"
            className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Wrench size={13} /> Raise Ticket
          </Link>
        </div>
      </div>

      {/* Active Workstation Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-[#0F8B7D] to-teal-700 text-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-md w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">ACTIVE WORKPLACE PASS</span>
            <h2 className="text-xl font-black">{selectedDesk} · Active</h2>
            <p className="text-xs text-white/80">One BKC (Apex Tower) • Floor 4 • {selectedZone}</p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20">
            <QrCode size={38} className="text-white shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-teal-100">NFC Speed-Gate Key</span>
              <span className="text-[10px] text-white/80">Turnstile Badge #OX-8492</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Checked In · Today
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Desk Booking Grid & Meeting Rooms Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hot Desk Floor Plan */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900">Floor 4 Hot-Desk Interactive Plan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Click any available workstation to reserve instantly</p>
            </div>

            {/* Zone Selector */}
            <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 text-xs font-bold">
              {(["Zone A", "Zone B", "Zone C"] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedZone === z 
                      ? "bg-[#0F8B7D] text-white shadow-2xs" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {z} {z === "Zone A" ? "(Quiet Focus)" : z === "Zone B" ? "(Collab)" : "(Executive)"}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-teal-50 border-2 border-[#0F8B7D]" /> Your Active Desk
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-gray-200" /> Available
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gray-100 border border-gray-300 text-gray-400" /> Occupied
            </div>
          </div>

          {/* Desks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {deskList[selectedZone].map((desk) => {
              const isSelected = selectedDesk === desk.id;
              const isOccupied = desk.status === "occupied";

              return (
                <div
                  key={desk.id}
                  onClick={() => handleDeskSelect(desk.id, isOccupied)}
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between min-h-[90px] cursor-pointer ${
                    isSelected
                      ? "bg-teal-50/80 border-2 border-[#0F8B7D] shadow-xs text-teal-900"
                      : isOccupied
                      ? "bg-gray-50 border-gray-200/80 opacity-60 cursor-not-allowed"
                      : "bg-white border-gray-200 hover:border-[#0F8B7D] hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-900">{desk.id}</span>
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    ) : isOccupied ? (
                      <span className="text-[9px] font-bold text-gray-400">Busy</span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-600">Open</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                    <Monitor size={11} className="text-gray-400" />
                    <span className="truncate">{desk.monitor}</span>
                  </div>

                  {isOccupied && (
                    <span className="text-[9px] font-semibold text-gray-400 truncate mt-1">
                      👤 {desk.user}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Meeting Rooms & Quick Services */}
        <div className="space-y-6">
          {/* Meeting Rooms Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">Conference Rooms</h3>
                <p className="text-xs text-gray-400 mt-0.5">Book smart meeting spaces with 4K VC</p>
              </div>
              <Calendar size={18} className="text-[#0F8B7D]" />
            </div>

            <div className="space-y-3">
              {meetingRooms.map((room) => (
                <div 
                  key={room.name}
                  className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-2 text-xs hover:border-[#0F8B7D]/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">{room.name}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-bold text-[9px]">
                      {room.capacity}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">{room.features}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-bold">{room.status}</span>
                    <button
                      onClick={() => handleBookRoom(room.name)}
                      className="px-3 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[10px] font-bold shadow-2xs cursor-pointer"
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Workplace Services */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Quick Office Amenities</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => showToast("Pantry order placed! Hot coffee will be delivered to your desk.")}
                className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-teal-50 hover:border-teal-200 text-left transition-all group cursor-pointer"
              >
                <Coffee size={15} className="text-amber-500 mb-1" />
                <span className="font-bold text-gray-800 block group-hover:text-[#0F8B7D]">Pantry Order</span>
                <span className="text-[9px] text-gray-400">Coffee / Tea</span>
              </button>

              <button 
                onClick={() => showToast("AC adjustment ticket sent to BMS operator for Zone A.")}
                className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-teal-50 hover:border-teal-200 text-left transition-all group cursor-pointer"
              >
                <Zap size={15} className="text-blue-500 mb-1" />
                <span className="font-bold text-gray-800 block group-hover:text-[#0F8B7D]">AC Cooling</span>
                <span className="text-[9px] text-gray-400">Adjust Temp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase">RESERVE MEETING SPACE</span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">{selectedRoom}</h3>
                <p className="text-xs text-gray-400">One BKC (Apex Tower) • Floor 4</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SELECT TIME SLOT (TODAY)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "10:00 AM - 11:00 AM",
                  "11:00 AM - 12:00 PM",
                  "02:00 PM - 03:00 PM",
                  "04:00 PM - 05:00 PM"
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedSlot === slot
                        ? "bg-[#0F8B7D] text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoomBooking}
                className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-xs flex items-center gap-1.5"
              >
                Confirm Reservation <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

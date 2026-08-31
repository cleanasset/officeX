"use client";

import React, { useState } from "react";
import { 
  Search, Filter, Clock, AlertTriangle, CheckCircle2, User, 
  Timer, ChevronRight, ArrowUpDown, X, Check, Wrench, Building, 
  MapPin, ShieldAlert, FileText, Send, Sparkles 
} from "lucide-react";
import Link from "next/link";

type TicketPriority = "Critical" | "High" | "Medium" | "Low";
type TicketStatus = "open" | "assigned" | "in-progress" | "resolved" | "closed";

interface Ticket {
  id: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  location: string;
  asset?: string;
  slaDeadline: string;
  slaRemaining: string;
  slaState: "Normal" | "At Risk" | "Breached";
  created: string;
  requester: string;
  description?: string;
}

const INITIAL_TICKETS: Ticket[] = [
  { 
    id: "TK-4501", 
    title: "AC not cooling — Zone B, Floor 4", 
    category: "HVAC", 
    priority: "Critical", 
    status: "in-progress", 
    assignee: "Rajesh Kumar (HVAC Lead)", 
    location: "One BKC (Apex Tower) · F4 · Zone B", 
    asset: "AHU-03 (Chilled Water Coil)", 
    slaDeadline: "14:30", 
    slaRemaining: "1h 12m", 
    slaState: "At Risk", 
    created: "2h ago", 
    requester: "Priya Nair (Tata Digital)",
    description: "Tenant reports temperature in meeting room is 27°C despite thermostat set to 21°C. Condenser line inspection required."
  },
  { 
    id: "TK-4499", 
    title: "Lift #2 intermittent shutdown", 
    category: "Mechanical", 
    priority: "High", 
    status: "assigned", 
    assignee: "Metro Elevators OEM", 
    location: "One BKC · Main Lobby Passenger Bank", 
    asset: "LIFT-02 (Schindler 7000)", 
    slaDeadline: "16:00", 
    slaRemaining: "2h 45m", 
    slaState: "Normal", 
    created: "3h ago", 
    requester: "Security Control Room",
    description: "Lift car stopped between Floor 7 and 8 for 45 seconds before resuming. Safety interlock sensor error code E-42."
  },
  { 
    id: "TK-4497", 
    title: "Water leakage from ceiling — Conf Room Orchid", 
    category: "Plumbing", 
    priority: "High", 
    status: "open", 
    assignee: "Unassigned", 
    location: "One BKC · F5 · Executive Suite", 
    asset: "PLMB-FCU-Drain-05", 
    slaDeadline: "13:00", 
    slaRemaining: "Breached", 
    slaState: "Breached", 
    created: "5h ago", 
    requester: "Amit Shah (Google India)",
    description: "Drain tray overflow dripping above conference table. Water supply isolated."
  },
  { 
    id: "TK-4493", 
    title: "Flickering tube light near Desk C-04", 
    category: "Electrical", 
    priority: "Medium", 
    status: "in-progress", 
    assignee: "Sanjay Patel (Electrician)", 
    location: "One BKC · F3 · Zone C", 
    asset: "LT-F3-C04", 
    slaDeadline: "17:00", 
    slaRemaining: "4h 10m", 
    slaState: "Normal", 
    created: "6h ago", 
    requester: "Divya Rao (Deloitte)",
    description: "Driver ballast failure on 40W LED panel."
  },
  { 
    id: "TK-4491", 
    title: "Pantry hot water dispenser not working", 
    category: "Appliance", 
    priority: "Low", 
    status: "resolved", 
    assignee: "Quick Fix FM", 
    location: "One BKC · F2 · Central Pantry", 
    asset: "HWD-F2-01", 
    slaDeadline: "Resolved", 
    slaRemaining: "—", 
    slaState: "Normal", 
    created: "1d ago", 
    requester: "Ravi Gupta (Admin)",
    description: "Heating element descaled and thermostat reset. Tested at 95°C output."
  },
  { 
    id: "TK-4480", 
    title: "Fire extinguisher pressure low — Stairwell F3", 
    category: "Safety", 
    priority: "Critical", 
    status: "assigned", 
    assignee: "Safety First Co.", 
    location: "One BKC · F3 · Stairwell South", 
    asset: "FE-F3-SW01 (ABC Powder 6kg)", 
    slaDeadline: "15:00", 
    slaRemaining: "2h 10m", 
    slaState: "At Risk", 
    created: "4h ago", 
    requester: "Compliance Auto-Audit",
    description: "Quarterly inspection flagged pressure needle in red recharge zone."
  }
];

const statusColumns: { key: TicketStatus; label: string; color: string }[] = [
  { key: "open", label: "Open (Unassigned)", color: "bg-red-500" },
  { key: "assigned", label: "Assigned", color: "bg-amber-500" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-500" },
  { key: "resolved", label: "Resolved", color: "bg-emerald-500" }
];

export default function HelpdeskCommandCentre() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateTicketStatus = (ticketId: string, nextStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          status: nextStatus,
          slaState: nextStatus === "resolved" ? "Normal" : t.slaState,
          slaRemaining: nextStatus === "resolved" ? "Resolved" : t.slaRemaining
        };
      }
      return t;
    }));
    showToast(`Updated ${ticketId} status to "${nextStatus.toUpperCase()}"!`);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: nextStatus });
    }
  };

  const handleAssignTechnician = (ticketId: string, techName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, assignee: techName, status: t.status === "open" ? "assigned" : t.status };
      }
      return t;
    }));
    showToast(`Assigned ${techName} to ${ticketId}! Technician notified on mobile.`);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, assignee: techName, status: selectedTicket.status === "open" ? "assigned" : selectedTicket.status });
    }
  };

  const filtered = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const slaColor = (state: string) => state === "Breached" ? "bg-red-100 text-red-700 border-red-300" : state === "At Risk" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-emerald-100 text-emerald-700 border-emerald-300";
  const priorityColor = (p: string) => p === "Critical" ? "bg-red-600" : p === "High" ? "bg-orange-500" : p === "Medium" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900 pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Helpdesk Command Centre</h1>
          <p className="text-xs text-slate-500 mt-0.5">Click any ticket to inspect issue, assign technicians, advance resolution, or dispatch contractors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ops"
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs"
          >
            ← Command Centre
          </Link>
          <Link
            href="/ops/outcomes"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Sparkles size={13} /> Outcome FM SLAs
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: filtered.filter(t => t.status === "open").length, icon: AlertTriangle, color: "text-red-600" },
          { label: "In Progress", value: filtered.filter(t => t.status === "in-progress" || t.status === "assigned").length, icon: Timer, color: "text-blue-600" },
          { label: "SLA Breached", value: filtered.filter(t => t.slaState === "Breached").length, icon: Clock, color: "text-red-600" },
          { label: "Resolved Today", value: filtered.filter(t => t.status === "resolved").length, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4.5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
            <kpi.icon size={22} className={kpi.color} />
            <div>
              <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 flex-1 max-w-md shadow-2xs">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ticket ID, issue title, or location..." 
            className="text-xs bg-transparent border-none outline-none flex-1" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-2xs">
          <button onClick={() => setView("kanban")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>Kanban Board</button>
          <button onClick={() => setView("list")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>List View</button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[440px] items-start">
          {statusColumns.map((col) => {
            const colTickets = filtered.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3 bg-gray-50/70 p-3 rounded-2xl border border-gray-200/90 shadow-2xs">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{col.label}</span>
                  <span className="ml-auto text-[10px] font-black text-slate-700 bg-gray-100 px-2 py-0.5 rounded-full">{colTickets.length}</span>
                </div>

                <div className="space-y-3 min-h-[160px]">
                  {colTickets.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs hover:shadow-md hover:border-[#0F8B7D]/40 transition-all space-y-2.5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0F8B7D] group-hover:underline">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white ${priorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-[#0F8B7D]">{t.title}</h4>

                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400 shrink-0" /> {t.location}
                      </p>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                        <span className="text-gray-600 font-semibold truncate max-w-[120px]">{t.assignee}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${slaColor(t.slaState)}`}>
                          {t.slaRemaining}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">TICKET ID</th>
                <th className="py-3.5 px-4">ISSUE TITLE</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4">PRIORITY</th>
                <th className="py-3.5 px-4">ASSIGNEE</th>
                <th className="py-3.5 px-4">SLA STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr 
                  key={t.id} 
                  onClick={() => setSelectedTicket(t)}
                  className="border-b border-gray-100 hover:bg-teal-50/20 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-[#0F8B7D]">{t.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{t.title}</td>
                  <td className="py-3 px-4 text-gray-500">{t.location}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white ${priorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{t.assignee}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${slaColor(t.slaState)}`}>
                      {t.slaRemaining}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-[10px] transition-colors">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Ticket Detail & Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0F8B7D]">{selectedTicket.id}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white ${priorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] font-bold text-gray-700">
                    Category: {selectedTicket.category}
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-900 mt-1">{selectedTicket.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description & Asset Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {selectedTicket.description || "Issue reported by occupant. Immediate field diagnosis required."}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-[10px]">
                <div>
                  <span className="text-gray-400 block font-bold uppercase">LOCATION</span>
                  <span className="font-bold text-gray-900">{selectedTicket.location}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">LINKED ASSET</span>
                  <span className="font-bold text-teal-700">{selectedTicket.asset || "General Facility Area"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">REPORTED BY</span>
                  <span className="font-bold text-gray-900">{selectedTicket.requester}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">SLA TIMER</span>
                  <span className="font-bold text-red-600">{selectedTicket.slaRemaining} ({selectedTicket.slaState})</span>
                </div>
              </div>
            </div>

            {/* Manager Action 1: Assign Technician */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ASSIGN FIELD TECHNICIAN / VENDOR</label>
              <select
                value={selectedTicket.assignee}
                onChange={(e) => handleAssignTechnician(selectedTicket.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option>Unassigned</option>
                <option>Rajesh Kumar (HVAC Lead)</option>
                <option>Metro Elevators OEM</option>
                <option>Sanjay Patel (Electrician)</option>
                <option>Quick Fix FM</option>
                <option>Safety First Co.</option>
              </select>
            </div>

            {/* Manager Action 2: Advance Ticket Resolution Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ADVANCE RESOLUTION STAGE</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { status: "open" as TicketStatus, label: "Open" },
                  { status: "assigned" as TicketStatus, label: "Assigned" },
                  { status: "in-progress" as TicketStatus, label: "In Progress" },
                  { status: "resolved" as TicketStatus, label: "Resolved" }
                ].map((s) => (
                  <button
                    key={s.status}
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, s.status)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTicket.status === s.status
                        ? "bg-[#0F8B7D] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                href="/marketplace/create-rfq"
                className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
              >
                <Wrench size={13} /> Need external vendor? Post RFQ
              </Link>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

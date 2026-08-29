"use client";

import React, { useState } from "react";
import { Search, Filter, Clock, AlertTriangle, CheckCircle2, User, Timer, ChevronRight, ArrowUpDown } from "lucide-react";

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
}

const TICKETS: Ticket[] = [
  { id: "TK-4501", title: "AC not cooling — Zone B, Floor 4", category: "HVAC", priority: "Critical", status: "in-progress", assignee: "Rajesh Kumar", location: "Apex Tower · F4 · Zone B", asset: "AHU-03", slaDeadline: "14:30", slaRemaining: "1h 12m", slaState: "At Risk", created: "2h ago", requester: "Priya Nair" },
  { id: "TK-4499", title: "Lift #2 intermittent shutdown", category: "Mechanical", priority: "High", status: "assigned", assignee: "Metro Elevators", location: "Building A · Lobby", asset: "LIFT-02", slaDeadline: "16:00", slaRemaining: "2h 45m", slaState: "Normal", created: "3h ago", requester: "Security Desk" },
  { id: "TK-4497", title: "Water leakage from ceiling — Conf Room Orchid", category: "Plumbing", priority: "High", status: "open", assignee: "Unassigned", location: "Apex Tower · F5 · CR-Orchid", slaDeadline: "13:00", slaRemaining: "Breached", slaState: "Breached", created: "5h ago", requester: "Amit Shah" },
  { id: "TK-4493", title: "Flickering tube light near Desk C-04", category: "Electrical", priority: "Medium", status: "in-progress", assignee: "Sanjay Patel", location: "Apex Tower · F3 · Zone C", asset: "LT-F3-C04", slaDeadline: "17:00", slaRemaining: "4h 10m", slaState: "Normal", created: "6h ago", requester: "Divya Rao" },
  { id: "TK-4491", title: "Pantry hot water dispenser not working", category: "Appliance", priority: "Low", status: "resolved", assignee: "Quick Fix FM", location: "Apex Tower · F2 · Pantry", asset: "HWD-F2-01", slaDeadline: "Resolved", slaRemaining: "—", slaState: "Normal", created: "1d ago", requester: "Ravi Gupta" },
  { id: "TK-4488", title: "WiFi dead spot near window bay — Floor 6", category: "IT/Network", priority: "Medium", status: "assigned", assignee: "IT Support", location: "Apex Tower · F6 · Bay W", slaDeadline: "18:00", slaRemaining: "5h 20m", slaState: "Normal", created: "1d ago", requester: "Neha Joshi" },
  { id: "TK-4485", title: "Restroom Block B deep clean overdue", category: "Housekeeping", priority: "High", status: "open", assignee: "Unassigned", location: "Apex Tower · F4 · Restroom B", slaDeadline: "12:30", slaRemaining: "Breached", slaState: "Breached", created: "8h ago", requester: "FM Auto-Alert" },
  { id: "TK-4480", title: "Fire extinguisher expired — Stairwell F3", category: "Safety", priority: "Critical", status: "assigned", assignee: "Safety First Co.", location: "Apex Tower · F3 · Stairwell", asset: "FE-F3-SW01", slaDeadline: "15:00", slaRemaining: "2h 10m", slaState: "At Risk", created: "4h ago", requester: "Compliance Auto" },
];

const statusColumns: { key: TicketStatus; label: string; color: string }[] = [
  { key: "open", label: "Open", color: "bg-red-500" },
  { key: "assigned", label: "Assigned", color: "bg-amber-500" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-500" },
  { key: "resolved", label: "Resolved", color: "bg-emerald-500" },
];

export default function HelpdeskCommandCentre() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = TICKETS.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const slaColor = (state: string) => state === "Breached" ? "bg-red-100 text-red-700 border-red-300" : state === "At Risk" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-emerald-100 text-emerald-700 border-emerald-300";
  const priorityColor = (p: string) => p === "Critical" ? "bg-red-600" : p === "High" ? "bg-orange-500" : p === "Medium" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900 p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Helpdesk Command Centre</h1>
        <p className="text-xs text-slate-500 font-bold mt-1">Ticket Kanban, SLA timers, assignment and escalation.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: filtered.filter(t => t.status === "open").length, icon: AlertTriangle, color: "text-red-600" },
          { label: "In Progress", value: filtered.filter(t => t.status === "in-progress").length, icon: Timer, color: "text-blue-600" },
          { label: "SLA Breached", value: filtered.filter(t => t.slaState === "Breached").length, icon: Clock, color: "text-red-600" },
          { label: "Resolved Today", value: filtered.filter(t => t.status === "resolved").length, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-3">
            <kpi.icon size={20} className={kpi.color} />
            <div>
              <div className="text-xl font-black">{kpi.value}</div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-200 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search tickets..." className="text-xs bg-transparent border-none outline-none flex-1 ml-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-0.5 border border-gray-200">
          <button onClick={() => setView("kanban")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${view === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>Kanban</button>
          <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${view === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>List</button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[400px]">
          {statusColumns.map((col) => {
            const colTickets = filtered.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                  <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{col.label}</span>
                  <span className="ml-auto text-[10px] font-black text-slate-400 bg-gray-100 px-2 py-0.5 rounded">{colTickets.length}</span>
                </div>
                {colTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs hover:shadow-sm transition-shadow cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-slate-400">{ticket.id}</span>
                      <span className={`w-2 h-2 rounded-full ${priorityColor(ticket.priority)}`} title={ticket.priority}></span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight mb-2">{ticket.title}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="text-[8px] font-bold bg-gray-100 text-slate-600 px-1.5 py-0.5 rounded">{ticket.category}</span>
                      {ticket.asset && <span className="text-[8px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{ticket.asset}</span>}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black border ${slaColor(ticket.slaState)}`}>
                      <Timer size={9} /> SLA: {ticket.slaRemaining}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-500 font-semibold">
                      <User size={9} /> {ticket.assignee}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {["ID", "Issue", "Priority", "Location", "Assignee", "SLA", "Status"].map(h => (
                  <th key={h} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="px-3 py-3 text-[10px] font-bold text-[#0F8B7D]">{t.id}</td>
                  <td className="px-3 py-3 text-[10px] font-bold text-slate-900 max-w-[200px] truncate">{t.title}</td>
                  <td className="px-3 py-3"><span className={`w-2 h-2 inline-block rounded-full ${priorityColor(t.priority)}`}></span> <span className="text-[9px] font-bold text-slate-700 ml-1">{t.priority}</span></td>
                  <td className="px-3 py-3 text-[9px] text-slate-500 font-semibold">{t.location}</td>
                  <td className="px-3 py-3 text-[9px] text-slate-700 font-semibold">{t.assignee}</td>
                  <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black border ${slaColor(t.slaState)}`}><Timer size={8} />{t.slaRemaining}</span></td>
                  <td className="px-3 py-3"><span className="text-[8px] font-black uppercase text-slate-600">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

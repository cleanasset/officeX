import React from "react";
import { db } from "@/db";
import { helpdeskTickets, tenantOnboarding } from "@/db/schema";
import { 
  DollarSign, 
  Clock, 
  Users, 
  FolderOpen, 
  Activity, 
  Smile, 
  TrendingUp, 
  PlusCircle, 
  Calendar, 
  UserPlus, 
  Car, 
  AlertTriangle, 
  HelpCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function TenantDashboard() {
  const ticketsList = await db.select().from(helpdeskTickets);
  const onboardingRecords = await db.select().from(tenantOnboarding);
  
  // Parse onboarding checklist
  const onboarding = onboardingRecords[0] || {
    onboardingTasks: [
      { task: "Commercial Lease Handover & Keys", done: true },
      { task: "Statutory fit-out Fire NOC audit", done: false },
      { task: "Server cabling & IT setup clearance", done: false },
      { task: "CAFM SLA Config & Service logs onboarding", done: false }
    ]
  };

  const tasks = onboarding.onboardingTasks as Array<{ task: string; done: boolean }>;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tenant Workplace</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Manage office reservations, track support tickets, and check workspace onboarding tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tenant/tickets/new" className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors shadow-sm">
            Raise Ticket
          </Link>
          <Link href="/tenant/pay" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-colors">
            Pay rent (₹12,45,000)
          </Link>
        </div>
      </div>

      {/* KPI GRID (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Occupancy</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">92%</div>
          <span className="text-[9px] text-gray-600 font-bold mt-1 block">250 / 270 seats</span>
        </div>

        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Workplace Cost</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">₹12.45L</div>
          <span className="text-[9px] text-red-600 font-bold mt-1 block">Due: Sep 1, 2026</span>
        </div>

        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Open Requests</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{ticketsList.length}</div>
          <span className="text-[9px] text-amber-600 font-bold mt-1 block">In dispatch queue</span>
        </div>

        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">SLA Compliance</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">98.5%</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Target response met</span>
        </div>

        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Employee Sat</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">4.6 / 5</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Feedback surveys</span>
        </div>

        <div className="premium-card p-4 border border-gray-200 flex flex-col justify-between bg-white min-h-[110px]">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Utilization</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">78%</div>
          <span className="text-[9px] text-gray-600 font-bold mt-1 block">Avg peak occupancy</span>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="premium-card p-6 border border-gray-200 bg-white">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4">Quick actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <button className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer">
            <UserPlus size={18} />
            <span>Book Desk</span>
          </button>
          <button className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer">
            <Calendar size={18} />
            <span>Book Room</span>
          </button>
          <Link href="/tenant/tickets/new" className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center justify-center gap-2 transition-all">
            <HelpCircle size={18} />
            <span>Raise Request</span>
          </Link>
          <Link href="/tenant/visitors" className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center justify-center gap-2 transition-all">
            <Users size={18} />
            <span>Register Guest</span>
          </Link>
          <button className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer">
            <Car size={18} />
            <span>Reserve Parking</span>
          </button>
          <button className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 text-gray-700 font-semibold hover:text-purple-600 text-xs flex flex-col items-center gap-2 transition-all cursor-pointer">
            <AlertTriangle size={18} />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Workspace Onboarding Steps */}
        <div className="premium-card p-6 border border-gray-200 bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-600" />
            Workspace Onboarding Checklist
          </h3>
          <p className="text-xs text-gray-600 font-bold mb-4">Steps required to transition your lease agreement into an active workspace.</p>
          <div className="flex flex-col gap-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-gray-200 text-xs">
                <span className="font-semibold text-gray-700">{task.task}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  task.done ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                }`}>
                  {task.done ? "Completed" : "Awaiting"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Helpdesk ticket tracking */}
        <div className="premium-card p-6 border border-gray-200 bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-purple-600" />
            Active Helpdesk dispatches
          </h3>
          <div className="flex flex-col gap-4">
            {ticketsList.map((ticket, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{ticket.title} ({ticket.category})</div>
                  <div className="text-gray-600 font-bold mt-1">SLA Resolution due in: 4 hours</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold uppercase tracking-wider">
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

    </div>
  );
}

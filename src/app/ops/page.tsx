import React from "react";
import { 
  Briefcase, 
  ClipboardList, 
  Clock, 
  Calendar, 
  Activity, 
  AlertOctagon, 
  ShieldAlert, 
  Thermometer, 
  Zap, 
  Smile, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function OperationsDashboard() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FM Command Centre</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Real-time workplace health metrics, statutory alerts, and SLA dispatch trackers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ops/ppm" className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md transition-colors">
            PPM Calendar
          </Link>
        </div>
      </div>

      {/* WORKPLACE HEALTH COMMAND GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Health Gauge */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block">Primary Performance Index</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-extrabold text-amber-600">91</span>
              <span className="text-sm text-gray-400 font-semibold">/ 100</span>
            </div>
            <span className="text-[11px] text-gray-600 font-bold mt-2 block">WORKPLACE HEALTH SCORE</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: "91%" }}></div>
          </div>
        </div>

        {/* Supporting Dimensions */}
        <div className="premium-card p-6 border border-gray-200 bg-white md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Facility</span>
            <span className="text-lg font-bold text-gray-900 mt-1">94%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Asset Health</span>
            <span className="text-lg font-bold text-gray-900 mt-1">97%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">SLA Target</span>
            <span className="text-lg font-bold text-gray-900 mt-1">96%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Cleanliness</span>
            <span className="text-lg font-bold text-gray-900 mt-1">94%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Energy Eff.</span>
            <span className="text-lg font-bold text-gray-900 mt-1">87%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Experience</span>
            <span className="text-lg font-bold text-gray-900 mt-1">91%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Vendor Compliance</span>
            <span className="text-lg font-bold text-gray-900 mt-1">93%</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Workplace Sat</span>
            <span className="text-lg font-bold text-gray-900 mt-1">4.5 / 5</span>
          </div>
        </div>

      </div>

      {/* EXCEPTION MANAGEMENT: WHAT REQUIRES ATTENTION TODAY? */}
      <div className="premium-card p-6 border border-gray-200 bg-red-50/50">
        <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <AlertOctagon size={16} className="text-red-600" />
          Critical issues requiring attention today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-red-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm">
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white font-bold uppercase inline-block">Statutory NOC</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2">Crystal Tower Fire NOC Expired</h4>
            </div>
            <span className="text-[10px] text-red-600 font-bold mt-2 block">Action Required Immediately</span>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm">
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white font-bold uppercase inline-block">SLA Breach Warning</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2">Server Room Temp Alert breached by 7m</h4>
            </div>
            <span className="text-[10px] text-red-600 font-bold mt-2 block">Technician response overdue</span>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm">
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-600 text-white font-bold uppercase inline-block">PPM Awaiting</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2">Kirloskar Sprinkler pump flow test</h4>
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-2 block">Awaiting manager signoff</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Stats Overview */}
        <div className="premium-card p-6 border border-gray-200 bg-white grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Managed Contracts</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">5</span>
            </div>
            <Briefcase size={22} className="text-amber-600" />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Shift Logs</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">2 Active</span>
            </div>
            <ClipboardList size={22} className="text-emerald-600" />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Staff Attendance</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">94%</span>
            </div>
            <Clock size={22} className="text-blue-600" />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">PPM Tasks</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">Week 34 Active</span>
            </div>
            <Calendar size={22} className="text-purple-600" />
          </div>
        </div>

        {/* Shifts progress */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList size={18} className="text-amber-600" />
              Shift Logs Progress
            </h3>
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">Morning Shift Logger Checklist</div>
                  <div className="text-gray-600 font-bold mt-1">Lobby checks, generator health, lift operations verified.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold uppercase">Logged</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">Night Patrol Log</div>
                  <div className="text-gray-600 font-bold mt-1">Due for submission at 11:30 PM.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold uppercase">Awaiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, Clock, Zap, Users, ShieldAlert, CheckCircle, Check, 
  AlertCircle, Sparkles, Activity, HeartPulse, ChevronRight, ArrowUpRight, 
  Wrench, Building, Settings, Calendar, ShieldCheck, X 
} from "lucide-react";

export default function OperationsDashboard() {
  const [toast, setToast] = useState<string | null>(null);
  const [dispatchModal, setDispatchModal] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const workplaceHealthDimensions = [
    { label: "Facility Infrastructure", score: 94, bar: 94, status: "Optimal", href: "/ops/assets" },
    { label: "Asset Uptime & Telemetry", score: 97, bar: 97, status: "Optimal", href: "/ops/assets" },
    { label: "SLA Response & Resolution", score: 96, bar: 96, status: "Optimal", href: "/ops/helpdesk" },
    { label: "Workplace Cleanliness", score: 94, bar: 94, status: "Optimal", href: "/ops/outcomes" },
    { label: "HVAC Thermal & Air Comfort", score: 92, bar: 92, status: "Good", href: "/ops/assets" },
    { label: "Energy & Resource Efficiency", score: 87, bar: 87, status: "At Risk", href: "/reporting" },
    { label: "Occupier Experience (CSAT)", score: 91, bar: 91, status: "Optimal", href: "/ops/outcomes" }
  ];

  const kpis = [
    { label: "Open Helpdesk Tickets", value: "18", sub: "△ 2 Critical Escalations", subColor: "text-red-500", icon: "🎫", href: "/ops/helpdesk" },
    { label: "PPM Tasks Today", value: "6 / 6", sub: "✅ 100% On Schedule", subColor: "text-emerald-600", icon: "📋", href: "/ops/ppm" },
    { label: "Statutory Compliance", value: "96.4%", sub: "18 Active / 0 Breached", subColor: "text-teal-700", icon: "🛡️", href: "/properties/compliance" },
    { label: "Outcome-Based FM", value: "91/100", sub: "SLA Matrix Active", subColor: "text-emerald-600", icon: "⚡", href: "/ops/outcomes" },
    { label: "Average SLA Resolution", value: "48 mins", sub: "Target: < 2 Hours", subColor: "text-emerald-600", icon: "⚡", href: "/ops/helpdesk" }
  ];

  const [dispatches, setDispatches] = useState<Array<{
    id: string;
    severity: string;
    color: string;
    remaining: string;
    title: string;
    location: string;
    action: string;
    assignedTo: string | null;
  }>>([
    { 
      id: "D-101",
      severity: "CRITICAL", 
      color: "bg-red-500", 
      remaining: "38 mins remaining", 
      title: "Server Room A AC Condenser Leak", 
      location: "One BKC (Apex Tower) • Floor 3", 
      action: "Dispatch Senior Tech",
      assignedTo: null
    },
    { 
      id: "D-102",
      severity: "HIGH", 
      color: "bg-amber-500", 
      remaining: "1h 15m remaining", 
      title: "Passenger Lift #3 Destination Dispatch Error", 
      location: "One BKC (Apex Tower) • Main Lobby", 
      action: "Dispatch Schindler OEM",
      assignedTo: null
    }
  ]);

  const handleConfirmDispatch = (techName: string) => {
    if (!dispatchModal) return;
    setDispatches(prev => prev.map(d => {
      if (d.id === dispatchModal.id) {
        return { ...d, assignedTo: techName, remaining: `Assigned to ${techName}` };
      }
      return d;
    }));
    showToast(`Dispatched ${techName} to ${dispatchModal.title}! SLA Timer active.`);
    setDispatchModal(null);
  };

  const healthData = [
    { name: "One BKC (Apex Tower)", health: "94/100 (Optimal)", hvac: "✅ 99.8%", electrical: "✅ 100%", elevators: "⚠️ Lift 3 Service", fire: "✅ Valid Fire NOC", staff: "18/20 Deployed" },
    { name: "Maker Maxity Mumbai", health: "89/100 (Good)", hvac: "⚠️ Chiller 1 Filter", electrical: "✅ 100%", elevators: "✅ 100%", fire: "✅ Valid Fire NOC", staff: "12/12 Deployed" },
    { name: "Godrej BKC Horizon", health: "96/100 (Optimal)", hvac: "✅ 100%", electrical: "✅ 100%", elevators: "✅ 100%", fire: "✅ Valid Fire NOC", staff: "15/16 Deployed" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">FM Command Centre</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time facility operations, asset uptime, SLA escalations &amp; Workplace Health monitoring.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/ops/helpdesk"
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5"
          >
            <AlertTriangle size={13} className="text-amber-500" /> Helpdesk
          </Link>
          <Link
            href="/ops/ppm"
            className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Calendar size={13} /> 52w PPM
          </Link>
        </div>
      </div>

      {/* Top Hero: Proprietary Workplace Health Score (91/100) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-center">
          {/* Health Score Gauge */}
          <div className="lg:border-r border-gray-100 lg:pr-8 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse size={14} className="text-teal-600" /> OFFICEX WORKPLACE HEALTH SCORE
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-gray-900">91</span>
              <span className="text-sm font-bold text-gray-400">/ 100</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 w-fit mt-2">
              Optimal Operational Condition
            </span>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Composite index across facility uptime, cleaning outcomes, air comfort, and SLA adherence.
            </p>
          </div>

          {/* 7 Supporting Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
            {workplaceHealthDimensions.map((dim) => (
              <Link 
                key={dim.label} 
                href={dim.href}
                className="space-y-1 group block hover:bg-gray-50/60 p-1.5 rounded-lg transition-colors"
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700 group-hover:text-[#0F8B7D] flex items-center gap-1">
                    {dim.label} <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="font-bold text-gray-900">{dim.score} / 100</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dim.score >= 90 ? "bg-[#0F8B7D]" : "bg-amber-500"
                    }`}
                    style={{ width: `${dim.bar}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 100% Clickable Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-md hover:border-[#0F8B7D]/40 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
                <span className="text-sm">{k.icon}</span>
              </div>
              <p className="text-2xl font-black text-gray-900 mt-1">{k.value}</p>
            </div>
            <p className={`text-[10px] font-bold mt-2 flex items-center justify-between ${k.subColor}`}>
              <span>{k.sub}</span>
              <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      {/* Live Dispatches Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Active Critical Incidents &amp; Dispatches
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click dispatch to assign immediate technician or OEM contractor</p>
          </div>
          <Link href="/ops/helpdesk" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
            View All Tickets <ChevronRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dispatches.map((d) => (
            <div key={d.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white ${d.color}`}>
                    {d.severity}
                  </span>
                  <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                    <Clock size={11} /> {d.remaining}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mt-2">{d.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{d.location}</p>
              </div>

              <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between">
                {d.assignedTo ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle size={14} /> Assigned to {d.assignedTo}
                  </span>
                ) : (
                  <button
                    onClick={() => setDispatchModal(d)}
                    className="w-full py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Wrench size={13} /> {d.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Telemetry Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900">Campus Facility Status &amp; Telemetry</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click any property row to inspect assets and preventive maintenance</p>
          </div>
          <Link href="/ops/assets" className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1">
            Asset Registry <ChevronRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">CAMPUS</th>
                <th className="py-3 px-4">HEALTH SCORE</th>
                <th className="py-3 px-4">HVAC UPTIME</th>
                <th className="py-3 px-4">ELECTRICAL</th>
                <th className="py-3 px-4">ELEVATORS</th>
                <th className="py-3 px-4">FIRE NOC</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {healthData.map((h, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-teal-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                    <Building size={13} className="text-[#0F8B7D]" /> {h.name}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{h.health}</td>
                  <td className="py-3.5 px-4">{h.hvac}</td>
                  <td className="py-3.5 px-4">{h.electrical}</td>
                  <td className="py-3.5 px-4 font-semibold text-amber-700">{h.elevators}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">{h.fire}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/ops/assets"
                      className="px-3 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-[#0F8B7D] hover:text-white transition-colors inline-block"
                    >
                      Inspect Assets
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">EMERGENCY DISPATCH</span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">{dispatchModal.title}</h3>
                <p className="text-xs text-gray-500">{dispatchModal.location}</p>
              </div>
              <button onClick={() => setDispatchModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-gray-700 text-xs">Select Lead Technician to Dispatch:</p>
              {[
                { name: "Rajesh Kumar", role: "Senior HVAC MEP Specialist (On-Site)", speed: "5 mins away" },
                { name: "Schindler OEM Response Team", role: "Destination Dispatch Certified Team", speed: "15 mins away" },
                { name: "Suresh Patil", role: "Chief Electrical Engineer", speed: "On Campus" }
              ].map((tech) => (
                <div 
                  key={tech.name}
                  onClick={() => handleConfirmDispatch(tech.name)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-[#0F8B7D] hover:bg-teal-50/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-[#0F8B7D]">{tech.name}</p>
                    <p className="text-[10px] text-gray-400">{tech.role}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 group-hover:bg-[#0F8B7D] group-hover:text-white transition-colors">
                    {tech.speed}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDispatchModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

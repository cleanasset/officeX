"use client";
import React, { useState } from "react";
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
  TrendingUp,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Send
} from "lucide-react";
import Link from "next/link";

export default function OperationsDashboard() {
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [selectedShiftLog, setSelectedShiftLog] = useState<any>(null);
  const [nightLogSubmitted, setNightLogSubmitted] = useState(false);
  const [nightLogNotes, setNightLogNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveIssue = (title: string, actionName: string) => {
    showToast(`Action executed: ${actionName} for "${title}". Issue updated!`);
    setSelectedIssue(null);
  };

  const handleNightLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNightLogSubmitted(true);
    showToast("Night Patrol Log submitted and signed off successfully!");
    setSelectedShiftLog(null);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FM Command Centre</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Real-time workplace health metrics, statutory alerts, and SLA dispatch trackers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ops/ppm" className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md transition-colors flex items-center gap-2">
            <Calendar size={15} /> PPM Calendar
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
          <div 
            onClick={() => showToast("Facility Index: 94% - All core HVAC, elevator, and MEP systems operating normally.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Facility</span>
            <span className="text-lg font-bold text-gray-900 mt-1">94%</span>
          </div>
          <div 
            onClick={() => showToast("Asset Health: 97% - 48 of 49 registered assets in Grade-A operational state.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Asset Health</span>
            <span className="text-lg font-bold text-gray-900 mt-1">97%</span>
          </div>
          <div 
            onClick={() => showToast("SLA Target: 96% - 24/25 incidents resolved within guaranteed response windows.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">SLA Target</span>
            <span className="text-lg font-bold text-gray-900 mt-1">96%</span>
          </div>
          <div 
            onClick={() => showToast("Cleanliness Score: 94% - Housekeeping audit passed across all floors.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Cleanliness</span>
            <span className="text-lg font-bold text-gray-900 mt-1">94%</span>
          </div>
          <div 
            onClick={() => showToast("Energy Efficiency: 87% - Power factor optimal at 0.98, chiller staging active.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Energy Eff.</span>
            <span className="text-lg font-bold text-gray-900 mt-1">87%</span>
          </div>
          <div 
            onClick={() => showToast("Experience Score: 91% - Tenant satisfaction surveys rated 4.6/5 this month.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Experience</span>
            <span className="text-lg font-bold text-gray-900 mt-1">91%</span>
          </div>
          <div 
            onClick={() => showToast("Vendor Compliance: 93% - All vendor statutory insurances and PF/ESIC verified.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Vendor Compliance</span>
            <span className="text-lg font-bold text-gray-900 mt-1">93%</span>
          </div>
          <div 
            onClick={() => showToast("Workplace Satisfaction: 4.5 / 5 - Aggregated from 120 tenant responses.")}
            className="flex flex-col justify-center p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase">Workplace Sat</span>
            <span className="text-lg font-bold text-gray-900 mt-1">4.5 / 5</span>
          </div>
        </div>

      </div>

      {/* EXCEPTION MANAGEMENT: WHAT REQUIRES ATTENTION TODAY? */}
      <div className="premium-card p-6 border border-gray-200 bg-red-50/50">
        <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <AlertOctagon size={16} className="text-red-600" />
          Critical issues requiring attention today (Click to resolve)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Issue 1: Fire NOC */}
          <div 
            onClick={() => setSelectedIssue({
              type: "Statutory NOC",
              title: "Crystal Tower Fire NOC Expired",
              severity: "High",
              desc: "The annual fire safety certificate for Crystal Tower expired on August 15, 2026. A statutory inspection report has been prepared by the fire safety consultant.",
              actionName: "Initiate Emergency NOC Renewal & Upload Receipt",
              property: "Crystal Tower (OMR Road, Chennai)",
              authority: "Tamil Nadu Fire & Rescue Services"
            })}
            className="p-4 rounded-xl border border-red-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm hover:border-red-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white font-bold uppercase inline-block">Statutory NOC</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2 hover:text-red-600">Crystal Tower Fire NOC Expired</h4>
            </div>
            <span className="text-[10px] text-red-600 font-bold mt-2 flex items-center gap-1">
              Action Required Immediately <ArrowRight size={10} />
            </span>
          </div>

          {/* Issue 2: Server Room Alert */}
          <div 
            onClick={() => setSelectedIssue({
              type: "SLA Breach Warning",
              title: "Server Room Temp Alert breached by 7m",
              severity: "Critical",
              desc: "Sensor SR-TEMP-02 in Floor 3 Data Centre recorded 27.8°C (threshold: 22°C). Secondary PAC unit failed to auto-start on load transfer.",
              actionName: "Dispatch Emergency HVAC Technician",
              property: "Meridian Tech Park - Block B",
              authority: "Precision Air Conditioning SLA"
            })}
            className="p-4 rounded-xl border border-red-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm hover:border-red-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white font-bold uppercase inline-block">SLA Breach Warning</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2 hover:text-red-600">Server Room Temp Alert breached by 7m</h4>
            </div>
            <span className="text-[10px] text-red-600 font-bold mt-2 flex items-center gap-1">
              Technician response overdue <ArrowRight size={10} />
            </span>
          </div>

          {/* Issue 3: PPM Awaiting */}
          <div 
            onClick={() => setSelectedIssue({
              type: "PPM Awaiting Signoff",
              title: "Kirloskar Sprinkler pump flow test",
              severity: "Medium",
              desc: "Weekly sprinkler jockey and main pump flow tests conducted by Vikram Shah. Pressure stabilized at 7.2 bar. Requires Facility Manager signoff.",
              actionName: "Approve & Sign Off Test Checklist",
              property: "Apex Business Tower",
              authority: "NFPA-25 Compliance Routine"
            })}
            className="p-4 rounded-xl border border-amber-200 bg-white flex flex-col justify-between min-h-[110px] shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-600 text-white font-bold uppercase inline-block">PPM Awaiting</span>
              <h4 className="text-xs font-bold text-gray-900 mt-2 hover:text-amber-600">Kirloskar Sprinkler pump flow test</h4>
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
              Awaiting manager signoff <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Stats Overview (Interactive Cards with Links) */}
        <div className="premium-card p-6 border border-gray-200 bg-white grid grid-cols-2 gap-6">
          
          <Link href="/ops/contracts" className="p-4 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/30 flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Managed Contracts</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">5</span>
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">View Contracts →</span>
            </div>
            <Briefcase size={24} className="text-amber-600" />
          </Link>

          <Link href="/ops/attendance" className="p-4 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Shift Logs</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">2 Active</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Inspect Logs →</span>
            </div>
            <ClipboardList size={24} className="text-emerald-600" />
          </Link>

          <Link href="/ops/attendance" className="p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Staff Attendance</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">94%</span>
              <span className="text-[10px] text-blue-600 font-bold mt-1 block">View Roster →</span>
            </div>
            <Clock size={24} className="text-blue-600" />
          </Link>

          <Link href="/ops/ppm" className="p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/30 flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">PPM Tasks</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-2">Week 34 Active</span>
              <span className="text-[10px] text-purple-600 font-bold mt-1 block">Open Calendar →</span>
            </div>
            <Calendar size={24} className="text-purple-600" />
          </Link>
        </div>

        {/* Shifts progress */}
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList size={18} className="text-amber-600" />
              Shift Logs Progress (Click to inspect)
            </h3>
            <div className="flex flex-col gap-4">
              
              {/* Log 1 */}
              <div 
                onClick={() => setSelectedShiftLog({
                  title: "Morning Shift Logger Checklist",
                  status: "LOGGED",
                  time: "07:00 AM - 03:00 PM",
                  lead: "Sanjay Kumar (Senior MEP Lead)",
                  items: [
                    { name: "Main lobby HVAC air-handler running at 21.5°C", done: true },
                    { name: "Diesel Generator #1 & #2 fuel levels: 85% verified", done: true },
                    { name: "Passenger Elevators 1-4 safety sensor checks verified", done: true },
                    { name: "Fresh water hydro-pneumatic pressure at 4.2 bar", done: true }
                  ]
                })}
                className="p-4 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/20 flex justify-between items-center text-xs cursor-pointer transition-all shadow-sm"
              >
                <div>
                  <div className="font-bold text-gray-900 hover:text-emerald-700">Morning Shift Logger Checklist</div>
                  <div className="text-gray-600 font-semibold mt-1">Lobby checks, generator health, lift operations verified.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold uppercase text-[10px]">Logged</span>
              </div>

              {/* Log 2 */}
              <div 
                onClick={() => setSelectedShiftLog({
                  title: "Night Patrol Log",
                  status: nightLogSubmitted ? "LOGGED" : "AWAITING",
                  time: "11:00 PM - 07:00 AM",
                  lead: "Vikram Shah (Night Ops Lead)",
                  items: [
                    { name: "Basement 1 & 2 perimeter lock and illumination check", done: nightLogSubmitted },
                    { name: "Server Room precision AC unit telemetry verification", done: nightLogSubmitted },
                    { name: "Emergency exit door contact sensors verified active", done: nightLogSubmitted },
                    { name: "Fire panel master control status confirmed normal", done: nightLogSubmitted }
                  ]
                })}
                className="p-4 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/20 flex justify-between items-center text-xs cursor-pointer transition-all shadow-sm"
              >
                <div>
                  <div className="font-bold text-gray-900 hover:text-amber-700">Night Patrol Log</div>
                  <div className="text-gray-600 font-semibold mt-1">
                    {nightLogSubmitted ? "Night patrol checks verified and signed off." : "Due for submission at 11:30 PM."}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-white font-bold uppercase text-[10px] ${
                  nightLogSubmitted ? "bg-emerald-600" : "bg-amber-600"
                }`}>
                  {nightLogSubmitted ? "Logged" : "Awaiting"}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Issue Resolution Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-red-50 text-red-600 uppercase tracking-wider">
                    {selectedIssue.type}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-2">{selectedIssue.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs text-gray-700">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Building Asset</span>
                  <span className="font-bold text-gray-900">{selectedIssue.property}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Governing Authority / SLA</span>
                  <span className="font-bold text-gray-900">{selectedIssue.authority}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Incident Summary</span>
                  <p className="p-3.5 rounded-xl bg-red-50/40 border border-red-100 text-gray-800 leading-relaxed">
                    {selectedIssue.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => handleResolveIssue(selectedIssue.title, selectedIssue.actionName)}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle size={15} />
                {selectedIssue.actionName}
              </button>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Shift Log Checklist Drawer */}
      {selectedShiftLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                    selectedShiftLog.status === "LOGGED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {selectedShiftLog.status} SHIFT
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-2">{selectedShiftLog.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedShiftLog(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 font-semibold">Shift Window:</span>
                  <span className="font-bold text-gray-900">{selectedShiftLog.time}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 font-semibold">Shift Lead:</span>
                  <span className="font-bold text-gray-900">{selectedShiftLog.lead}</span>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Audit Checkpoints</span>
                  <div className="flex flex-col gap-2.5">
                    {selectedShiftLog.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <CheckCircle size={15} className={item.done ? "text-emerald-600 mt-0.5" : "text-gray-300 mt-0.5"} />
                        <span className={`font-semibold ${item.done ? "text-gray-900" : "text-gray-500"}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedShiftLog.status === "AWAITING" && (
                  <form onSubmit={handleNightLogSubmit} className="flex flex-col gap-3 mt-3">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Supervisor Signoff Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. All physical checks completed. Verified perimeter alarm."
                      value={nightLogNotes}
                      onChange={(e) => setNightLogNotes(e.target.value)}
                      className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 resize-none font-medium"
                    />
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={14} /> Submit & Sign Off Night Log
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button 
                onClick={() => setSelectedShiftLog(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

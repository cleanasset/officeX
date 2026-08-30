"use client";
import React, { useState } from "react";
import { Search, Check, CheckCircle, Camera, ClipboardCheck, Sparkles, Star, ShieldCheck, ArrowRight, Clock, AlertTriangle } from "lucide-react";

export default function WorkOrderTracker() {
  const [selectedWo, setSelectedWo] = useState("WO-1024");
  const [attendance, setAttendance] = useState<Record<string, string>>({
    "Rohan Sharma (Lead Technician)": "Present",
    "Sunil Verma (AC Mechanic)": "Present",
    "Amit Kumar (Electrician)": "Present",
    "Vijay Pal (Helper)": "Absent"
  });
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    "Chiller Refrigerant Pressure Test": true,
    "AHU Filter Ultrasonic Cleaning": true,
    "Motor Amperage & Vibration Test": true,
    "Thermostat Calibration Check": false,
    "BMS Telemetry Verification": false
  });
  const [csatRating, setCsatRating] = useState(5);
  const [assetRestored, setAssetRestored] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const workOrders = [
    {
      id: "WO-1024",
      assetId: "AST-HVAC-002",
      vendor: "TechServe Solutions",
      property: "Apex BKC, Tower B Floor 3",
      category: "HVAC Chiller Overhaul",
      progress: 80,
      slaTarget: "4h Response / 24h Resolution",
      slaStatus: "Within SLA",
      status: "In Progress",
      outcomeScore: "94% Cleanliness / Zero Recurrence"
    },
    {
      id: "WO-1025",
      assetId: "AST-DG-001",
      vendor: "CleanPro Services",
      property: "Apex BKC, Basement 2",
      category: "Deep Cleaning & Degreasing",
      progress: 100,
      slaTarget: "6h Resolution",
      slaStatus: "Met SLA (4.5h)",
      status: "Completed & Verified",
      outcomeScore: "98% Washroom Cleanliness"
    },
    {
      id: "WO-1026",
      assetId: "AST-ELEC-008",
      vendor: "Elec Solutions",
      property: "One BKC, Floor 7",
      category: "UPS Battery Replacement",
      progress: 45,
      slaTarget: "12h Resolution",
      slaStatus: "Within SLA",
      status: "In Progress",
      outcomeScore: "100% Power Uptime"
    }
  ];

  const milestones = ["Issued", "Accepted", "Mobilization", "Work Executed", "Outcome Verified & Released"];
  const currentMilestone = 4;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleVerifyOutcome = () => {
    showToast("Work Order WO-1024 outcome verified! 5-star CSAT recorded and milestone payout approved in escrow.");
  };

  const toggleCheck = (k: string) => {
    setChecklist({ ...checklist, [k]: !checklist[k] });
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Work Orders & Outcome-Based FM</h1>
          <p className="text-xs text-gray-500 mt-1">Track real-time maintenance execution, asset telemetry recovery, and SLA outcome compliance.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold text-xs border border-teal-100 flex items-center gap-1.5">
            <Sparkles size={13} /> Outcome FM Compliance: 97.4%
          </span>
        </div>
      </div>

      {/* Active Work Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Active Service Orders</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search orders, assets..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-64" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">WO ID & ASSET</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">SLA TARGET</th>
                <th className="py-3 px-4">PROGRESS</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr
                  key={wo.id}
                  onClick={() => setSelectedWo(wo.id)}
                  className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors ${selectedWo === wo.id ? "bg-teal-50/40" : ""}`}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block">{wo.id}</span>
                    <span className="text-[10px] text-teal-700 font-mono font-bold">{wo.assetId}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{wo.vendor}</td>
                  <td className="py-3.5 px-4 text-gray-600">{wo.property}</td>
                  <td className="py-3.5 px-4 text-gray-600">{wo.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {wo.slaStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${wo.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold">{wo.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {wo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Work Order Deep-Dive: Outcome Capture & Evidence */}
      <div className="grid grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left: Execution Milestones & PPM Tasks */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Work Order Lifecycle & Outcome Sign-off</h3>
              <p className="text-gray-400 text-[11px] mt-0.5">Asset: AST-HVAC-002 (Carrier 300TR Chiller #2) • Linked to Contract CON-2026-MEP-01</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              In Execution
            </span>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between px-2">
            {milestones.map((m, idx) => (
              <div key={m} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  idx <= currentMilestone ? "bg-[#0F8B7D] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {idx < currentMilestone ? "✓" : idx + 1}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 mt-1">{m}</span>
              </div>
            ))}
          </div>

          {/* PPM Checklist */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MANDATORY TECHNICAL TASKS</p>
            <div className="space-y-2">
              {Object.entries(checklist).map(([task, done]) => (
                <div
                  key={task}
                  onClick={() => toggleCheck(task)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    done ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-semibold">{task}</span>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    done ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                  }`}>
                    {done && <Check size={13} />}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Evidence & CSAT */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OUTCOME VERIFICATION</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="assetRestored"
                  checked={assetRestored}
                  onChange={(e) => setAssetRestored(e.target.checked)}
                  className="w-4 h-4 accent-[#0F8B7D]"
                />
                <label htmlFor="assetRestored" className="font-bold text-gray-800">
                  Asset Restored to 100% Operating Telemetry
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-semibold">Tenant CSAT:</span>
                <div className="flex gap-1 text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      onClick={() => setCsatRating(s)}
                      className={s <= csatRating ? "fill-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{csatRating}.0 / 5.0</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleVerifyOutcome}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle size={14} /> Verify Outcome & Release Payout
              </button>
            </div>
          </div>
        </div>

        {/* Right: Technician Attendance & Site Photo Evidence */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Deployed Technician Roster</h3>
            <p className="text-gray-400 text-[10px]">Verified via Geo-tagged QR Biometrics</p>
          </div>

          <div className="space-y-2">
            {Object.entries(attendance).map(([staff, status]) => (
              <div key={staff} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="font-semibold text-gray-800">{staff}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  status === "Present" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">BEFORE / AFTER PHOTO EVIDENCE</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-24 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-center p-2">
                <Camera size={18} className="mb-1 text-gray-400" />
                <span className="text-[9px] font-bold">Before: Blocked Coil</span>
              </div>
              <div className="h-24 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-700 text-center p-2">
                <CheckCircle size={18} className="mb-1 text-emerald-600" />
                <span className="text-[9px] font-bold">After: Cleaned 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

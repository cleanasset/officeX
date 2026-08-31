"use client";
import React, { useState } from "react";
import { Download, CheckCircle, Camera, Check } from "lucide-react";

export default function VendorWorkOrdersTracker() {
  const [selectedWo, setSelectedWo] = useState("#WO-2024-089");
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({
    "Rahul S. (Lead)": "Present",
    "Amit K.": "Present",
    "Vikas R.": "Absent",
    "Deepak M.": "Present"
  });

  const [ppmChecklist, setPpmChecklist] = useState<Record<string, boolean>>({
    "AHU Filter Cleaning": true,
    "Chiller Parameter Readings": true,
    "UPS Battery Voltage Check": false,
    "DG Set Oil Level": false,
    "LT Panel Visual Inspection": false
  });

  const [issueSeverity, setIssueSeverity] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const workOrders = [
    {
      id: "#WO-2024-089",
      client: "Apex Tech Pvt Ltd",
      property: "CyberCity Tower B, Floor 4",
      startDate: "01 Nov 2023",
      progress: "Month 4 of 12",
      pct: 33,
      status: "Active",
      statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: "#WO-2023-412",
      client: "Nexus Malls",
      property: "Nexus Seawoods, Navi Mumbai",
      startDate: "15 Mar 2023",
      progress: "Month 11 of 12",
      pct: 91,
      status: "Active",
      statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: "#WO-2024-002",
      client: "Global Tech Park",
      property: "Block C, Hinjewadi Phase 1",
      startDate: "05 Jan 2024",
      progress: "Month 2 of 24",
      pct: 8,
      status: "Mobilising",
      statusClass: "bg-amber-50 text-amber-700 border border-amber-200"
    },
    {
      id: "#WO-2022-881",
      client: "Infosys Ltd",
      property: "Campus 4, Electronic City",
      startDate: "10 Dec 2022",
      progress: "Completed 100%",
      pct: 100,
      status: "Closed",
      statusClass: "bg-gray-100 text-gray-600 border border-gray-200"
    }
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitLog = () => {
    showToast("Daily site log submitted for #WO-2024-089!");
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Active Work Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage and track your ongoing service contracts and daily site logs.</p>
        </div>
        <button 
          onClick={() => showToast("Exported Work Orders Report")}
          className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer w-fit"
        >
          <Download size={13} /> Export Report
        </button>
      </div>

      {/* Primary Selected Card with Dual-Pane Journey & Logger */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full">
        {/* Table Header Row & Summary with Mobile Scroll */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider p-4 md:p-6 pb-3 border-b border-gray-100 bg-gray-50/50">
              <div>WO ID</div>
              <div>CLIENT</div>
              <div>PROPERTY</div>
              <div>START DATE</div>
              <div>PROGRESS</div>
              <div className="text-right">STATUS</div>
            </div>

            {/* Selected Order Summary Row */}
            <div className="grid grid-cols-6 items-center p-4 md:p-6 border-l-4 border-l-[#0F8B7D] bg-teal-50/10 text-xs">
              <div className="font-bold text-[#0F8B7D]">#WO-2024-089</div>
              <div className="font-semibold text-gray-900">Apex Tech Pvt Ltd</div>
              <div className="text-gray-600">CyberCity Tower B, Fl 4</div>
              <div className="text-gray-600">01 Nov 2023</div>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold">Month 4 of 12 <b className="text-[#0F8B7D]">33%</b></span>
                <div className="w-24 h-1.5 rounded-full bg-gray-200 mt-1 overflow-hidden">
                  <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nested Deep Dive: Journey + Daily Logger */}
        <div className="p-4 md:p-6 pt-3 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 border-t border-gray-100">
          {/* Left Column: Contract Values + Service Journey */}
          <div className="flex flex-col justify-between pr-0 lg:pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Contract Value</p>
                <p className="text-xl font-black text-gray-900 mt-1">₹2,18,300 <span className="text-xs text-gray-400 font-normal">/mo</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">SLA Commitments</p>
                <p className="text-xs font-bold text-gray-800 mt-1.5">
                  <span className="text-[#0F8B7D]">2h</span> Response • <span className="text-[#0F8B7D]">8h</span> Resolution
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Service Journey</h3>
              <div className="relative flex items-center justify-between px-4 pb-8">
                {/* Timeline Bar */}
                <div className="absolute left-8 right-8 top-3.5 h-0.5 bg-gray-200 z-0">
                  <div className="h-full bg-[#0F8B7D]" style={{ width: "65%" }} />
                </div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-xs font-bold">
                    <Check size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-2">WO Issued</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-xs font-bold">
                    <Check size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-2">Mobilisation</span>
                </div>

                {/* Step 3 Active */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0F8B7D] text-[#0F8B7D] flex items-center justify-center text-xs font-black">
                    ◉
                  </div>
                  <span className="text-[11px] font-black text-[#0F8B7D] mt-2 text-center">
                    Monthly Service<br /><span className="text-[9px] font-semibold">(Active)</span>
                  </span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 mt-2">Completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Daily Site Logger */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                📋 Daily Site Logger
              </span>
              <span className="text-[10px] font-semibold text-gray-500">Today, 14 Feb</span>
            </div>

            {/* Attendance */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Technician Attendance</p>
            <div className="space-y-2 mb-5">
              {Object.entries(attendance).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAttendance({ ...attendance, [name]: "Present" })}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                        status === "Present" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setAttendance({ ...attendance, [name]: "Absent" })}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                        status === "Absent" ? "bg-red-100 text-red-700 border border-red-300" : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PPM Checklist */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Daily PPM Checklist</p>
              <div className="space-y-2 mb-5">
                {Object.entries(ppmChecklist).map(([task, done]) => (
                  <label key={task} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => setPpmChecklist({ ...ppmChecklist, [task]: !done })}
                      className="w-4 h-4 rounded border-gray-300 accent-[#0F8B7D]"
                    />
                    <span className={done ? "font-semibold text-gray-900" : "text-gray-600"}>{task}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Log Issue */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Log Issue (Optional)</p>
              <select
                value={issueSeverity}
                onChange={(e) => setIssueSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs mb-2 bg-white text-gray-700"
              >
                <option value="">Select Severity</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High / Critical</option>
              </select>
              <textarea
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs resize-none h-14 mb-3 bg-white"
              />
              <div className="border border-dashed border-gray-300 rounded-xl p-3 text-center mb-4 cursor-pointer bg-white hover:border-[#0F8B7D]">
                <Camera size={16} className="mx-auto text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-500 font-semibold">Click to upload evidence photo</span>
              </div>
            </div>

            <button
              onClick={handleSubmitLog}
              className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Submit Daily Log
            </button>
          </div>
        </div>

        {/* Other Work Orders List Rows */}
        {workOrders.slice(1).map((wo) => (
          <div
            key={wo.id}
            onClick={() => setSelectedWo(wo.id)}
            className="grid grid-cols-6 items-center p-6 border-t border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
          >
            <div className="font-bold text-gray-600 text-xs">{wo.id}</div>
            <div className="font-semibold text-gray-900 text-xs">{wo.client}</div>
            <div className="text-gray-600 text-xs">{wo.property}</div>
            <div className="text-gray-600 text-xs">{wo.startDate}</div>
            <div>
              <span className="text-[10px] text-gray-500 font-semibold">{wo.progress}</span>
              <div className="w-28 h-1.5 rounded-full bg-gray-200 mt-1 overflow-hidden">
                <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: `${wo.pct}%` }} />
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${wo.statusClass}`}>
                {wo.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

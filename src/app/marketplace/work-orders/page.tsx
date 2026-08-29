"use client";

import React, { useState } from "react";
import { ClipboardList, CheckCircle, Clock, AlertCircle, Star, X, Check, FileText } from "lucide-react";

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([
    { 
      id: 1, 
      title: "AC Compressor Overhaul", 
      vendor: "TechServe Solutions", 
      start: "Aug 24, 2026", 
      progress: "Milestone 1/2 complete", 
      status: "In Progress",
      resolutionDetails: "Awaiting replacement solenoid valve from OEM warehouse.",
      csat: null,
      repeatCount: 0,
      slaStatus: "On Track"
    },
    { 
      id: 2, 
      title: "Elevator Shaft Inspection", 
      vendor: "Apex Elevator Systems", 
      start: "Aug 22, 2026", 
      progress: "Job signed off", 
      status: "Completed",
      resolutionDetails: "Completed lubrication of guide rails, verified door interlocks, and updated safety certificate tags on site.",
      csat: 4.8,
      repeatCount: 0,
      slaStatus: "Resolved in 2.5h"
    },
    { 
      id: 3, 
      title: "Server Room Chilled Water Leak", 
      vendor: "Zeta Facilities", 
      start: "Aug 15, 2026", 
      progress: "Remediation verified", 
      status: "Completed",
      resolutionDetails: "Replaced faulty section of copper pipe and joint seal. Pressure tested up to 6 bar for 2 hours.",
      csat: 4.2,
      repeatCount: 1,
      slaStatus: "Resolved in 5.8h"
    }
  ]);

  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleVerifySignoff = (id: number) => {
    setWorkOrders(workOrders.map(wo => wo.id === id ? { ...wo, status: "Completed", progress: "Job signed off", csat: 5.0 } : wo));
    showToast("Work order verified and signed off successfully!");
    setSelectedWO(null);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Work Orders</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Audit contract milestone progress, contractor checklists, and customer satisfaction outcome metrics.</p>
        </div>
      </div>

      {/* Work Orders Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workOrders.map((wo) => (
          <div 
            key={wo.id} 
            onClick={() => setSelectedWO(wo)}
            className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between min-h-[190px] shadow-xs hover:border-[#2563EB] hover:shadow-md cursor-pointer transition-all"
          >
            <div>
              <div className="flex justify-between items-start border-b border-slate-50 pb-3.5 mb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs hover:text-[#2563EB] hover:underline">{wo.title}</h3>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">Contractor: {wo.vendor}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                  wo.status === "Completed" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-250" 
                    : "bg-blue-50 text-[#2563EB] border-blue-250"
                }`}>
                  {wo.status}
                </span>
              </div>
              <div className="text-xs text-slate-650 font-semibold flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="text-slate-800 font-bold">{wo.start}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="text-[#2563EB] font-bold">{wo.progress}</span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Timer:</span>
                  <span className="text-slate-800 font-bold">{wo.slaStatus}</span>
                </div>
              </div>
            </div>

            {/* Outcome Indicators Row */}
            {wo.status === "Completed" && (
              <div className="border-t border-slate-50 pt-3 mt-3 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-amber-500 font-black">
                  <Star size={12} fill="currentColor" /> {wo.csat} / 5 Rating
                </span>
                <span className="text-slate-400 font-bold">
                  {wo.repeatCount > 0 ? (
                    <span className="text-red-500 font-black">⚠ {wo.repeatCount} Repeat Issue</span>
                  ) : (
                    "0 Repeat complaints"
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Work Order Detail Audit Drawer */}
      {selectedWO && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                    selectedWO.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-250" : "bg-blue-50 text-[#2563EB] border-blue-250"
                  }`}>
                    {selectedWO.status} Job
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-2">{selectedWO.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedWO(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Detail parameters */}
              <div className="flex flex-col gap-5 text-xs font-semibold text-slate-700">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Contractor Agency</span>
                  <span className="font-bold text-slate-900">{selectedWO.vendor}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Incident Progress</span>
                  <span className="font-bold text-slate-900">{selectedWO.progress}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Resolution Details & Logs</span>
                  <p className="p-3.5 rounded-xl bg-blue-50/20 border border-blue-100 text-slate-800 leading-relaxed">
                    {selectedWO.resolutionDetails}
                  </p>
                </div>

                {selectedWO.status === "Completed" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Customer Survey</span>
                      <span className="font-black text-amber-500 mt-1 block flex items-center justify-center gap-1">
                        <Star size={13} fill="currentColor" /> {selectedWO.csat} / 5
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Repeat Complaint count</span>
                      <span className={`font-black mt-1 block ${selectedWO.repeatCount > 0 ? 'text-red-500' : 'text-slate-900'}`}>
                        {selectedWO.repeatCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              {selectedWO.status === "In Progress" && (
                <button 
                  onClick={() => handleVerifySignoff(selectedWO.id)}
                  className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={15} /> Verify & Sign Off Work Order
                </button>
              )}
              <button 
                onClick={() => setSelectedWO(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs cursor-pointer"
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

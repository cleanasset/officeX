"use client";
import React, { useState } from "react";
import { ClipboardList, Check, X, Send, UserCheck, Clock, Building, Phone, ArrowRight, Bell, CheckCircle, AlertTriangle, Calendar, FileText, Camera } from "lucide-react";

export default function VendorWorkOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [orders, setOrders] = useState([
    {
      id: "WO-801",
      title: "HVAC Maintenance & Chiller Overhaul",
      location: "Apex Business Tower, BKC Mumbai - Floor 4",
      client: "Rajesh Kumar (Property Manager)",
      budget: "₹1,40,000",
      startDate: "Aug 18, 2026",
      deadline: "Sep 01, 2026",
      status: "Active",
      assignedTech: "Sanjay Kumar",
      techRole: "Senior HVAC Specialist",
      techPhone: "+91 98450 11223",
      shift: "Morning Shift (09:00 AM - 05:00 PM)",
      certification: "BEE Certified HVAC Technician",
      currentMilestone: "Milestone 2/3 — Chiller pressure testing & verification",
      tasks: [
        { name: "Condenser coil chemical descaling & jet flushing", done: true },
        { name: "Refrigerant R-134a gas charge & pressure test (7.2 bar for 45 min)", done: false },
        { name: "BMS sensor calibration + temperature log submission", done: false }
      ]
    },
    {
      id: "WO-802",
      title: "Weekly Deep Cleaning & Mechanized Floor Scrubbing",
      location: "Meridian Tech Park, Whitefield Bengaluru - All Floors",
      client: "Vijay Dev (Facility Manager)",
      budget: "₹45,000",
      startDate: "Aug 24, 2026",
      deadline: "Aug 26, 2026",
      status: "Review Pending",
      assignedTech: "Vikram Shah",
      techRole: "Housekeeping Supervisor + 4 Crew",
      techPhone: "+91 98450 44556",
      shift: "Evening Shift (02:00 PM - 10:00 PM)",
      certification: "BICSc Certified Cleaning Lead",
      currentMilestone: "Milestone 1/1 completed — Awaiting facility lead validation",
      tasks: [
        { name: "Mechanized single-disc floor scrubbing (Floors 1–6)", done: true },
        { name: "Washroom deep sanitization & air freshener refill", done: true },
        { name: "Internal glass facade wipe-down & dusting", done: true }
      ]
    },
    {
      id: "WO-803",
      title: "DG Set 500kVA B-Check & Oil Filtration",
      location: "Nexus Hub, Hinjewadi Pune - Basement Utility Room",
      client: "Nexus Management Office",
      budget: "₹85,000",
      startDate: "Aug 20, 2026",
      deadline: "Sep 05, 2026",
      status: "Active",
      assignedTech: "Ramesh Dev",
      techRole: "High-Tension Electrician (Class-A)",
      techPhone: "+91 98450 77889",
      shift: "Morning Shift (07:00 AM - 03:00 PM)",
      certification: "Govt. Class-A Electrical License",
      currentMilestone: "Milestone 1/2 — Transformer oil filtration & relay testing",
      tasks: [
        { name: "Transformer oil filtration (50 litres @ 40°C)", done: true },
        { name: "Overcurrent relay & earth-fault relay testing", done: false },
        { name: "DG sync panel calibration & load bank test", done: false },
        { name: "Battery health check & electrolyte top-up", done: false }
      ]
    }
  ]);

  const handleTaskToggle = (orderId: string, taskIdx: number) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const updatedTasks = o.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t);
        return { ...o, tasks: updatedTasks };
      }
      return o;
    }));
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedTasks = selectedOrder.tasks.map((t: any, i: number) => i === taskIdx ? { ...t, done: !t.done } : t);
      setSelectedOrder({ ...selectedOrder, tasks: updatedTasks });
    }
  };

  const handleSubmitMilestone = (orderId: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Review Pending",
          currentMilestone: "Milestone submitted — Awaiting manager sign-off",
          tasks: o.tasks.map(t => ({ ...t, done: true }))
        };
      }
      return o;
    }));
    setSelectedOrder(null);
    setMilestoneNotes("");
    showToast(`Proof of work for ${orderId} submitted to client Property Manager for verification & payout release!`);
  };

  return (
    <div className="flex flex-col gap-8 font-sans relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Active Work Orders & Job Dispatches</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Click any work order to inspect technician details, update milestone checklists, and submit proof of completion.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
          {orders.length} Active Dispatches
        </span>
      </div>

      {/* Work Order Cards */}
      <div className="flex flex-col gap-5">
        {orders.map((wo) => (
          <div
            key={wo.id}
            onClick={() => { setSelectedOrder(wo); setMilestoneNotes(""); }}
            className="premium-card p-6 border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{wo.id}</span>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                    <ClipboardList size={16} className="text-emerald-600" />
                    {wo.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-gray-600 font-medium mt-1">
                  <span className="flex items-center gap-1"><Building size={12} className="text-gray-400" /> {wo.location}</span>
                  <span className="flex items-center gap-1"><UserCheck size={12} className="text-gray-400" /> {wo.assignedTech} ({wo.techRole})</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {wo.shift}</span>
                </div>

                <div className="text-[11px] text-gray-500 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-fit mt-1 flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400" />
                  📌 {wo.currentMilestone}
                </div>

                {/* Mini progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(wo.tasks.filter(t => t.done).length / wo.tasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">
                    {wo.tasks.filter(t => t.done).length}/{wo.tasks.length} Tasks
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-extrabold text-gray-900">{wo.budget}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  wo.status === "Active"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : wo.status === "Review Pending"
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-gray-50 border border-gray-200 text-gray-600"
                }`}>
                  {wo.status}
                </span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== WORK ORDER DETAIL DRAWER ===== */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-7 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold font-mono text-gray-400 uppercase tracking-wider">{selectedOrder.id}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">{selectedOrder.title}</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedOrder.location}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contract & Status */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Contract Amount</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{selectedOrder.budget}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Job Status</span>
                  <span className={`font-bold text-sm ${
                    selectedOrder.status === "Active" ? "text-emerald-700" : "text-blue-700"
                  }`}>{selectedOrder.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Start Date</span>
                  <span className="font-bold text-gray-900">{selectedOrder.startDate}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Deadline</span>
                  <span className="font-bold text-red-600">{selectedOrder.deadline}</span>
                </div>
              </div>

              {/* Client */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                <span className="text-[10px] text-amber-600 font-bold uppercase block mb-1">Requesting Client</span>
                <span className="font-extrabold text-gray-900">{selectedOrder.client}</span>
              </div>

              {/* On-Site Technician */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 text-xs">
                <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Assigned On-Site Technician</span>
                <span className="font-extrabold text-gray-900 block text-sm">{selectedOrder.assignedTech}</span>
                <span className="text-[11px] text-gray-600 font-semibold block mt-0.5">{selectedOrder.techRole}</span>
                <div className="flex items-center gap-4 text-[11px] text-gray-600 font-medium mt-2">
                  <span className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /> {selectedOrder.techPhone}</span>
                  <span className="flex items-center gap-1"><Clock size={11} className="text-gray-400" /> {selectedOrder.shift}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold mt-2 block">🪪 {selectedOrder.certification}</span>
              </div>

              {/* Milestone Checklist */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Milestone Checklist — Click to toggle completion</span>
                <div className="flex flex-col gap-2">
                  {selectedOrder.tasks.map((t: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleTaskToggle(selectedOrder.id, idx)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all text-xs ${
                        t.done
                          ? "bg-emerald-50 border-emerald-200 text-gray-700"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        t.done ? "bg-emerald-600 text-white" : "border-2 border-gray-300"
                      }`}>
                        {t.done && <Check size={12} />}
                      </div>
                      <span className={`font-semibold ${t.done ? "line-through opacity-60" : ""}`}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Proof-of-Work Notes */}
              {selectedOrder.status === "Active" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Technician Work Notes & Readings</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Pressure tested at 7.2 bar for 45 min. Condenser coils cleaned. Photos attached."
                    value={milestoneNotes}
                    onChange={(e) => setMilestoneNotes(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 resize-none font-medium"
                  />
                  <button
                    onClick={() => showToast("Site photo evidence captured & attached.")}
                    className="w-fit px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} /> Attach Site Photo Evidence
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3 mt-4">
              {selectedOrder.status === "Active" ? (
                <button
                  onClick={() => handleSubmitMilestone(selectedOrder.id)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Submit Milestone Proof & Request Payout
                </button>
              ) : (
                <button
                  onClick={() => {
                    showToast("Reminder sent to Facility Manager for milestone sign-off!");
                    setSelectedOrder(null);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell size={14} /> Send Signoff Reminder to Client
                </button>
              )}
              <button
                onClick={() => {
                  showToast(`Work log PDF exported for ${selectedOrder.id}.`);
                }}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={14} /> Export Work Log PDF
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2 rounded-xl text-gray-500 font-bold text-xs hover:bg-gray-50 cursor-pointer"
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

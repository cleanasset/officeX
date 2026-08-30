"use client";
import React, { useState } from "react";
import { Plus, Search, ChevronDown, ChevronUp, Check, Download, Upload, Eye, CheckCircle } from "lucide-react";

export default function LOIAndLeaseWorkflow() {
  const [expandedDeal, setExpandedDeal] = useState<string | null>("DX-2024-089");
  const [toast, setToast] = useState<string | null>(null);

  const deals = [
    {
      id: "DX-2024-089",
      client: "Google India",
      property: "Apex Business Tower (Fl 12)",
      rent: "₹8.5L",
      stage: "LOI Signed",
      stageColor: "bg-blue-50 text-blue-700 border border-blue-200",
      agreedRent: "₹8,50,000/mo",
      deposit: "6 Months",
      lockIn: "3 Years",
      escalation: "5% p.a."
    },
    {
      id: "DX-2024-092",
      client: "Amazon (AWS)",
      property: "Tech Park Alpha (Fl 4-6)",
      rent: "₹24.0L",
      stage: "Negotiation",
      stageColor: "bg-amber-50 text-amber-700 border border-amber-200"
    },
    {
      id: "DX-2024-105",
      client: "Microsoft R&D",
      property: "Cyber City Block B",
      rent: "₹32.5L",
      stage: "LOI Prep",
      stageColor: "bg-gray-100 text-gray-700 border border-gray-200"
    },
    {
      id: "DX-2024-112",
      client: "Swiggy HQ",
      property: "Koramangala Hub",
      rent: "₹12.0L",
      stage: "Lease Executed",
      stageColor: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    }
  ];

  const milestones = [
    { label: "Property Selected", done: true },
    { label: "Negotiation", done: true },
    { label: "LOI Prep", done: true },
    { label: "LOI Submitted", done: true },
    { label: "LOI Signed", active: true },
    { label: "Documentation", done: false },
    { label: "Lease Executed", done: false }
  ];

  const handleUpload = () => {
    setToast("Draft agreement uploaded for legal review!");
    setTimeout(() => setToast(null), 3500);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Active Deals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track the progress of ongoing leasing transactions.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm">
          <Plus size={14} /> New LOI
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search deals..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
        />
      </div>

      {/* Deals Accordion List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider p-4 px-6 border-b border-gray-100 bg-gray-50/50">
          <div>DEAL ID</div>
          <div>CLIENT</div>
          <div>PROPERTY</div>
          <div>RENT / MO</div>
          <div className="text-right">CURRENT STAGE</div>
        </div>

        {/* First Expanded Deal */}
        <div className="border-b border-gray-200">
          <div
            onClick={() => setExpandedDeal(expandedDeal === "DX-2024-089" ? null : "DX-2024-089")}
            className="grid grid-cols-5 items-center p-4 px-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <span className="font-mono font-bold text-blue-600 text-xs">DX-2024-089</span>
            <span className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 text-[10px] inline-flex items-center justify-center font-bold">G</span>
              Google India
            </span>
            <span className="text-gray-600 text-xs">Apex Business Tower (Fl 12)</span>
            <span className="font-bold text-gray-900 text-xs">₹8.5L</span>
            <div className="flex items-center justify-end gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                ● LOI Signed
              </span>
              {expandedDeal === "DX-2024-089" ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>

          {/* Expanded Drawer Details */}
          {expandedDeal === "DX-2024-089" && (
            <div className="p-6 pt-2 bg-gray-50/30 border-t border-gray-100 space-y-6">
              {/* Stepper Milestone Workflow */}
              <div className="relative flex items-center justify-between px-6 py-4">
                <div className="absolute left-10 right-10 top-7 h-0.5 bg-gray-200 z-0" />
                {milestones.map((m) => (
                  <div key={m.label} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        m.done
                          ? "bg-emerald-500 text-white"
                          : m.active
                          ? "bg-white border-2 border-blue-600 text-blue-600"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {m.done ? <Check size={13} /> : m.active ? "◉" : ""}
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-2 text-center ${
                        m.active ? "text-blue-600 font-bold" : "text-gray-500"
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Deal Key Figures */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Agreed Rent</p>
                  <p className="text-lg font-black text-gray-900 mt-1">₹8,50,000<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Security Deposit</p>
                  <p className="text-lg font-black text-gray-900 mt-1">6 Months</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Lock-in Period</p>
                  <p className="text-lg font-black text-gray-900 mt-1">3 Years</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Escalation</p>
                  <p className="text-lg font-black text-gray-900 mt-1">5% <span className="text-xs text-gray-400 font-normal">p.a.</span></p>
                </div>
              </div>

              {/* Dual Pane: Deal Documents & Activity Log */}
              <div className="grid grid-cols-2 gap-6">
                {/* Deal Documents */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    📄 Deal Documents
                  </h3>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📕</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">LOI Final_Signed.pdf</p>
                        <p className="text-[10px] text-gray-400">Signed LOI • 24 Aug</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Signed</span>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">View</button>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">Download</button>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📘</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Draft Lease Agreement v2.docx</p>
                        <p className="text-[10px] text-gray-400">Draft • 26 Aug</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">Legal Review</span>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">View</button>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">Req Signature</button>
                    </div>
                  </div>

                  {/* Upload Box */}
                  <div
                    onClick={handleUpload}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-500 bg-white"
                  >
                    <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-bold text-blue-600">Upload New Version</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or click to browse</p>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                  <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    🕐 Activity Log
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400">26 Aug, 11:30 AM</p>
                        <p className="font-semibold text-gray-800">Lease Draft v2 uploaded by Ravi M.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400">24 Aug, 04:15 PM</p>
                        <p className="font-semibold text-gray-800">LOI Signed by Client</p>
                        <span className="text-[10px] text-gray-400 font-mono">IP: 103.22.XX.XX</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400">22 Aug, 09:00 AM</p>
                        <p className="font-semibold text-gray-800">Razorpay Escrow linked for security deposit</p>
                        <span className="text-[10px] text-gray-400 font-mono">Ref: RZP_XYZ123</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Other Deals Rows */}
        {deals.slice(1).map((d) => (
          <div
            key={d.id}
            onClick={() => setExpandedDeal(d.id)}
            className="grid grid-cols-5 items-center p-4 px-6 border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
          >
            <span className="font-mono font-bold text-gray-600 text-xs">{d.id}</span>
            <span className="font-semibold text-gray-900 text-xs">{d.client}</span>
            <span className="text-gray-600 text-xs">{d.property}</span>
            <span className="font-bold text-gray-900 text-xs">{d.rent}</span>
            <div className="flex items-center justify-end gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${d.stageColor}`}>
                ● {d.stage}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Kanban, Sparkles, TrendingUp, X, User, Phone, Mail, FileText, ArrowRight, ShieldCheck, MessageSquare, AlertCircle, Award, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PipelinePage() {
  const router = useRouter();
  const [columns, setColumns] = useState<any>({
    New: [
      { id: 1, name: "InfyTech Hub", req: "8k sq.ft", value: "₹1.2L/mo", poc: "Alok Gupta", role: "Procurement Head", email: "alok@infytech.com", phone: "+91 98321 04958", gst: "27AABCT9876C1ZR", dealHealth: "On Track", matchScore: 94 },
      { id: 5, name: "Scalezix Solutions", req: "5k sq.ft", value: "₹75K/mo", poc: "Jiya Patel", role: "Managing Director", email: "jiya@scalezix.com", phone: "+91 99887 76655", gst: "24AADCV1234D2ZS", dealHealth: "On Track", matchScore: 98 }
    ],
    Qualified: [
      { id: 2, name: "RazorPay Ops", req: "12k sq.ft", value: "₹2.1L/mo", poc: "Harish Iyer", role: "Real Estate Director", email: "harish@razorpay.com", phone: "+91 99887 76655", gst: "27AAACR1020D1ZE", dealHealth: "Stale Alert (7d)", matchScore: 89 }
    ],
    "Proposal Sent": [
      { id: 3, name: "Dharma Media", req: "15k sq.ft", value: "₹3.5L/mo", poc: "Rohit Sen", role: "Admin Lead", email: "rohit@dharmamedia.com", phone: "+91 94567 89012", gst: "27AABCM8822A1ZV", dealHealth: "At Risk", matchScore: 82 }
    ],
    Won: [
      { id: 4, name: "TATA Projects", req: "25k sq.ft", value: "₹6.0L/mo", poc: "Sanjay Bose", role: "VP Operations", email: "sanjay@tataprojects.com", phone: "+91 91234 56789", gst: "27AABCT1000A1ZZ", dealHealth: "Lease Executed", matchScore: 96 }
    ]
  });

  const [draggingCard, setDraggingCard] = useState<any>(null);
  const [draggingSourceCol, setDraggingSourceCol] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDragStart = (e: React.DragEvent, card: any, colName: string) => {
    setDraggingCard(card);
    setDraggingSourceCol(colName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColName: string) => {
    e.preventDefault();
    if (!draggingCard || draggingSourceCol === targetColName) return;

    // Transition health if dropped into won
    let updatedCard = { ...draggingCard };
    if (targetColName === "Won") {
      updatedCard.dealHealth = "Lease Executed";
    }

    const updatedSource = columns[draggingSourceCol].filter((c: any) => c.id !== draggingCard.id);
    const updatedTarget = [...columns[targetColName], updatedCard];

    setColumns({
      ...columns,
      [draggingSourceCol]: updatedSource,
      [targetColName]: updatedTarget
    });

    setDraggingCard(null);
    setDraggingSourceCol("");
    showToast(`Deal "${updatedCard.name}" transitioned to ${targetColName}!`);
  };

  const handleOnboardWorkspace = (name: string) => {
    showToast(`Workspace onboarding initialized for ${name}! Redirecting to workspace setup.`);
    setTimeout(() => {
      router.push("/public/wizard");
    }, 1500);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leasing Sales Pipeline</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Monitor active deals progression across stages, negotiate commercial agreements, and launch workspace onboarding.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[#2563EB] text-[10px] font-bold">
          <Sparkles size={12} className="animate-spin" /> Drag & Drop Active
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(columns).map(([colName, items]: any, idx) => (
          <div 
            key={idx} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, colName)}
            className="p-4 rounded-2xl border border-slate-200 bg-slate-100/50 flex flex-col gap-3 min-h-[480px] transition-colors"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{colName} ({items.length})</span>
            {items.map((item: any) => (
              <div 
                key={item.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, item, colName)}
                className="p-4 rounded-xl bg-white border border-slate-150 shadow-xs flex flex-col gap-3.5 cursor-grab active:cursor-grabbing hover:border-[#2563EB] hover:shadow-md transition-all"
              >
                <div onClick={() => setSelectedCard(item)} className="cursor-pointer">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-950 text-xs hover:text-[#2563EB] hover:underline block">{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[8px] font-black">{item.matchScore}% Match</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-3">
                    <span>{item.req}</span>
                    <span className="text-[#2563EB] font-black">{item.value}</span>
                  </div>
                </div>

                {/* Footer status row */}
                <div className="border-t border-slate-50 pt-2.5 flex items-center justify-between">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.dealHealth.includes("Stale")
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : item.dealHealth === "At Risk"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : item.dealHealth === "Lease Executed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-250"
                      : "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}>
                    {item.dealHealth}
                  </span>
                  
                  {colName === "Won" && (
                    <button
                      onClick={() => handleOnboardWorkspace(item.name)}
                      className="px-2.5 py-1 rounded bg-[#2563EB] hover:bg-blue-700 text-white text-[9px] font-extrabold transition-colors cursor-pointer"
                    >
                      Onboard Space
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Slide-out Drawer Panel for Lead Details */}
      {selectedCard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedCard.name} Lead</h3>
                  <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">Leasing Pipeline CRM</span>
                </div>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lead Information */}
              <div className="flex flex-col gap-6 text-xs font-semibold text-slate-750">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <User size={14} className="text-slate-500" />
                    <span>{selectedCard.poc} ({selectedCard.role})</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Details</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      <Mail size={14} className="text-slate-500" />
                      <span>{selectedCard.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                      <Phone size={14} className="text-slate-500" />
                      <span>{selectedCard.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Corporate Details</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-150 font-semibold text-emerald-800">
                    <ShieldCheck size={14} />
                    <span>GSTIN: {selectedCard.gst} (KYC Verified)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Space Required</span>
                    <span className="font-extrabold text-slate-900 mt-1 block">{selectedCard.req}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Budget Est.</span>
                    <span className="font-extrabold text-[#2563EB] mt-1 block">{selectedCard.value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => router.push("/leasing/chat")}
                className="w-full py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-[#2563EB] font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={14} /> Open Deal Collaboration Chat
              </button>
              <button 
                onClick={() => {
                  showToast(`LOI Draft document generated for ${selectedCard.name}!`);
                  setSelectedCard(null);
                }}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Generate LOI Draft <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

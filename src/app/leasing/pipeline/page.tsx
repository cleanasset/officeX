"use client";
import React, { useState } from "react";
import { Kanban, Sparkles, TrendingUp, X, User, Phone, Mail, FileText, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PipelinePage() {
  const router = useRouter();
  const [columns, setColumns] = useState<any>({
    New: [
      { id: 1, name: "InfyTech Hub", req: "8k sq.ft", value: "₹1.2L/mo", poc: "Alok Gupta", role: "Procurement Head", email: "alok@infytech.com", phone: "+91 98321 04958", gst: "27AABCT9876C1ZR" },
      { id: 5, name: "Scalezix Solutions", req: "5k sq.ft", value: "₹75K/mo", poc: "Jiya Patel", role: "Managing Director", email: "jiya@scalezix.com", phone: "+91 99887 76655", gst: "24AADCV1234D2ZS" }
    ],
    Qualified: [
      { id: 2, name: "RazorPay Ops", req: "12k sq.ft", value: "₹2.1L/mo", poc: "Harish Iyer", role: "Real Estate Director", email: "harish@razorpay.com", phone: "+91 99887 76655", gst: "27AAACR1020D1ZE" }
    ],
    "Proposal Sent": [
      { id: 3, name: "Dharma Media", req: "15k sq.ft", value: "₹3.5L/mo", poc: "Rohit Sen", role: "Admin Lead", email: "rohit@dharmamedia.com", phone: "+91 94567 89012", gst: "27AABCM8822A1ZV" }
    ],
    Won: [
      { id: 4, name: "TATA Projects", req: "25k sq.ft", value: "₹6.0L/mo", poc: "Sanjay Bose", role: "VP Operations", email: "sanjay@tataprojects.com", phone: "+91 91234 56789", gst: "27AABCT1000A1ZZ" }
    ]
  });

  const [draggingCard, setDraggingCard] = useState<any>(null);
  const [draggingSourceCol, setDraggingSourceCol] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<any>(null);

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

    const updatedSource = columns[draggingSourceCol].filter((c: any) => c.id !== draggingCard.id);
    const updatedTarget = [...columns[targetColName], draggingCard];

    setColumns({
      ...columns,
      [draggingSourceCol]: updatedSource,
      [targetColName]: updatedTarget
    });

    setDraggingCard(null);
    setDraggingSourceCol("");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leasing Sales Pipeline</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Monitor active deals progression across stages from lead sourcing to closed contracts.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-lg text-green-600 text-[10px] font-bold">
          <Sparkles size={12} /> Drag & Drop Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(columns).map(([colName, items]: any, idx) => (
          <div 
            key={idx} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, colName)}
            className="premium-card p-4 border border-gray-200 bg-gray-50/50 flex flex-col gap-3 min-h-[450px] transition-colors"
          >
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">{colName} ({items.length})</span>
            {items.map((item: any) => (
              <div 
                key={item.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, item, colName)}
                onClick={() => setSelectedCard(item)}
                className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span className="font-bold text-gray-900 text-xs hover:text-blue-600 hover:underline">{item.name}</span>
                <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold mt-2">
                  <span>{item.req}</span>
                  <span className="text-blue-600 font-extrabold">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Slide-out Drawer Panel for Lead Details */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/35 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{selectedCard.name} Lead</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Leasing Pipeline</span>
                </div>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lead Information */}
              <div className="flex flex-col gap-6 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <User size={14} className="text-gray-600" />
                    <span>{selectedCard.poc} ({selectedCard.role})</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact Details</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                      <Mail size={14} className="text-gray-600" />
                      <span>{selectedCard.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                      <Phone size={14} className="text-gray-600" />
                      <span>{selectedCard.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Corporate Details</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 font-semibold text-emerald-800">
                    <ShieldCheck size={14} />
                    <span>GSTIN: {selectedCard.gst} (KYC Verified)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Space Required</span>
                    <span className="font-extrabold text-gray-900 mt-1 block">{selectedCard.req}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Budget Est.</span>
                    <span className="font-extrabold text-blue-600 mt-1 block">{selectedCard.value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => router.push("/leasing/chat")}
                className="w-full py-2.5 rounded-xl border border-teal-200 hover:bg-teal-50 text-[#0F8B7D] font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={14} /> Open Deal Collaboration Chat
              </button>
              <button 
                onClick={() => {
                  alert(`LOI Draft document generated for ${selectedCard.name}! Redirecting to LOI portal.`);
                  setSelectedCard(null);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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

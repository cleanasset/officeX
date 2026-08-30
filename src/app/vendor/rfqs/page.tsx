"use client";
import React, { useState } from "react";
import { Clock, CheckCircle, X, ArrowRight, FileText, Send } from "lucide-react";

export default function MatchedRFQsBrowser() {
  const [selectedRfq, setSelectedRfq] = useState<string | null>("RFQ-2024-8842");
  const [toast, setToast] = useState<string | null>(null);

  const rfqs = [
    {
      id: "RFQ-2024-8842",
      title: "DG Set Annual Maintenance Contract",
      category: "HVAC",
      match: "98% Match",
      property: "Apex Business Tower, Mumbai BKC",
      desc: "Comprehensive AMC for 3x 1000kVA Cummins DG sets including preventive maintenance, breakdown calls, and...",
      time: "1d : 08h : 45m"
    },
    {
      id: "RFQ-2024-8843",
      title: "Facade Cleaning Service - Quarterly",
      category: "CLEANING",
      match: "96% Match",
      property: "Global Tech Park, Bengaluru",
      desc: "Quarterly facade cleaning for 3 glass towers. Requires specialized cradle equipment and certified rope access...",
      time: "2d : 14h : 05m"
    },
    {
      id: "RFQ-2024-8844",
      title: "UPS Battery Replacement & Testing",
      category: "ELECTRICAL",
      match: "92% Match",
      property: "Cyber City, Gurugram",
      desc: "Supply, installation, and testing of 120 SMF batteries for centralized UPS systems across 4 server room floors.",
      time: "4d : 09h : 20m"
    },
    {
      id: "RFQ-2024-8845",
      title: "Access Control System Upgrade",
      category: "SECURITY",
      match: "88% Match",
      property: "Pioneer Plaza, Pune",
      desc: "Migration from legacy RFID to biometric/mobile access control for 15 entry points including turnstiles and server...",
      time: "7d : 11h : 00m"
    }
  ];

  const handleStartProposal = () => {
    setToast("Proposal draft created for " + selectedRfq);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex gap-6 font-sans relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main List */}
      <div className={`flex-1 flex flex-col gap-6 ${selectedRfq ? "mr-[420px]" : ""}`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Matched RFQs</h1>
          <p className="text-sm text-gray-500 mt-1">Review and bid on high-match requests for quotation.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white">
            <option>All Categories</option>
            <option>HVAC</option>
            <option>Cleaning</option>
            <option>Electrical</option>
            <option>Security</option>
          </select>
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white">
            <option>All Cities</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Gurugram</option>
            <option>Pune</option>
          </select>
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white">
            <option>Any Budget</option>
            <option>&lt; ₹50,000</option>
            <option>₹50,000 - ₹2,00,000</option>
            <option>&gt; ₹2,00,000</option>
          </select>
        </div>

        {/* RFQ Grid */}
        <div className="grid grid-cols-2 gap-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              onClick={() => setSelectedRfq(rfq.id)}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                selectedRfq === rfq.id ? "border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-sm" : "border-gray-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                    {rfq.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {rfq.match}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{rfq.title}</h3>
                <p className="text-xs text-gray-500 mb-3">📍 {rfq.property}</p>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">{rfq.desc}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                <span className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <Clock size={14} /> {rfq.time}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToast("RFQ " + rfq.id + " declined.");
                      setTimeout(() => setToast(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                  >
                    Decline
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRfq(rfq.id);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedRfq && (
        <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-40 overflow-y-auto p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-base font-bold text-gray-900">RFQ Details</h2>
              <button onClick={() => setSelectedRfq(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">HVAC</span>
              <span className="text-xs text-gray-400 font-mono">ID: {selectedRfq}</span>
            </div>

            <h1 className="text-xl font-black text-gray-900 mb-4">DG Set Annual Maintenance Contract</h1>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                🏢
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Apex Business Tower</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Bandra Kurla Complex, Mumbai, MH 400051</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Scope of Work</p>
              <p>
                The vendor is required to provide comprehensive annual maintenance for 3 units of 1000kVA Cummins Diesel Generator sets. The scope includes but is not limited to:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>Monthly preventive maintenance visits per OEM guidelines.</li>
                <li>Unlimited breakdown calls with a 4-hour resolution SLA.</li>
                <li>B-Check servicing (twice annually).</li>
                <li>Replacement of filters, oil, and minor consumables (cost included in AMC).</li>
                <li>Quarterly load bank testing and thermography of panels.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Manpower Rules</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Certified Cummins Tech</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Terms</p>
                <p className="text-xs font-bold text-gray-800 mt-1">30 Days Post-Quarter</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-gray-500">Closes in:</span>
              <span className="font-bold text-red-500 flex items-center gap-1">
                <Clock size={13} /> 1d : 08h : 45m
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRfq(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={handleStartProposal}
                className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                Start Proposal <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

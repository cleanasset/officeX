"use client";
import React, { useState } from "react";
import { FolderOpen, ArrowRight, X, Send, Building, Clock, DollarSign, UserCheck, CheckCircle, MapPin, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function MatchedRFQs() {
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [rfqs, setRfqs] = useState([
    {
      id: "RFQ-401",
      title: "150TR Chiller Descaling & Annual Overhaul",
      client: "Rajesh Kumar (Apex Property Manager)",
      property: "Apex Business Tower, BKC Mumbai",
      budget: "₹1,50,000",
      matchReason: "Matches HVAC Specialist + Mumbai Region",
      deadline: "Sep 05, 2026",
      posted: "Aug 22, 2026",
      scope: [
        "Chemical descaling of 150TR chiller condenser coils",
        "Refrigerant R-134a leak test & gas top-up",
        "BMS sensor re-calibration and temperature logging",
        "Post-service compliance certificate submission"
      ],
      requirements: "Vendor must hold valid BEE certification and carry ₹5L insurance cover.",
      status: "Open"
    },
    {
      id: "RFQ-402",
      title: "DG Set 500kVA B-Check & Filter AMC",
      client: "Vijay Dev (Facility Manager)",
      property: "Meridian Tech Park, Whitefield Bengaluru",
      budget: "₹85,000",
      matchReason: "Matches Electrical AMC + Bengaluru Region",
      deadline: "Sep 08, 2026",
      posted: "Aug 23, 2026",
      scope: [
        "Transformer oil filtration (50 litres @ 40°C)",
        "Overcurrent relay & earth-fault relay testing",
        "DG sync panel calibration & load bank test",
        "Air filter & fuel filter replacement"
      ],
      requirements: "Vendor must hold Govt. Class-A Electrical License.",
      status: "Open"
    },
    {
      id: "RFQ-403",
      title: "Fire Hydrant Pump Replacement & NOC Filing",
      client: "Dharma Estates (Building Owner)",
      property: "Crystal Tower, OMR Chennai",
      budget: "₹2,10,000",
      matchReason: "Matches Fire Safety + Verified PSARA License",
      deadline: "Sep 12, 2026",
      posted: "Aug 24, 2026",
      scope: [
        "Replace 2x fire hydrant booster pumps (10HP each)",
        "NFPA-25 wet riser system flow test",
        "Fire sprinkler head inspection (Floors 1–12)",
        "File renewed Fire NOC with local fire department"
      ],
      requirements: "Vendor must hold valid PSARA License and Fire Safety Contractor Registration.",
      status: "Open"
    },
    {
      id: "RFQ-404",
      title: "Quarterly Indoor Air Quality (IAQ) Audit",
      client: "Nexus Management Office",
      property: "Nexus Hub, Hinjewadi Pune",
      budget: "₹40,000",
      matchReason: "Matches Specialized Compliance Audit Category",
      deadline: "Sep 15, 2026",
      posted: "Aug 25, 2026",
      scope: [
        "CO₂, PM2.5, PM10, VOC measurement across all floors",
        "HVAC duct inspection & microbial swab sampling",
        "Compliance report generation per ASHRAE 62.1 standards",
        "Remediation recommendations if thresholds exceeded"
      ],
      requirements: "NABL-accredited lab partnership for sample analysis.",
      status: "Open"
    }
  ]);

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;
    setRfqs(rfqs.map(r => r.id === selectedRfq?.id ? { ...r, status: "Bid Submitted" } : r));
    showToast(`Quotation bid of ₹${parseInt(bidAmount).toLocaleString()} submitted for "${selectedRfq?.title}"! Client has been notified.`);
    setSelectedRfq(null);
    setBidAmount("");
    setBidNotes("");
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Matched RFQs — Service Requests</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Auto-matched to your trade categories, certifications, and service regions. Click to review scope & submit bid.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
          {rfqs.filter(r => r.status === "Open").length} Open / {rfqs.length} Total
        </span>
      </div>

      {/* RFQ Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            onClick={() => { setSelectedRfq(rfq); setBidAmount(rfq.budget.replace(/[₹,]/g, "")); }}
            className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[220px] hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all group"
          >
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <span className="font-mono text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded">{rfq.id}</span>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mt-1 group-hover:text-emerald-700">
                    <FolderOpen size={16} className="text-emerald-600" />
                    {rfq.title}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-semibold block mt-0.5">Posted by: {rfq.client}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                  rfq.status === "Open" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}>
                  {rfq.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-gray-700 font-semibold">
                <span className="flex items-center gap-1.5"><Building size={12} className="text-gray-400" /> {rfq.property}</span>
                <span className="text-emerald-600 font-bold">🎯 Match: {rfq.matchReason}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" /> Deadline: {rfq.deadline}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
              <span className="font-extrabold text-emerald-600 text-sm">{rfq.budget}</span>
              <span className="text-[10px] font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                View Scope & Submit Bid <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== RFQ DETAIL & BID SUBMISSION DRAWER ===== */}
      {selectedRfq && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-7 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold font-mono text-gray-400 uppercase tracking-wider">{selectedRfq.id}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">{selectedRfq.title}</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedRfq.property}</span>
                </div>
                <button
                  onClick={() => setSelectedRfq(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Budget & Deadline */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Client Budget</span>
                  <span className="font-extrabold text-gray-900 text-lg">{selectedRfq.budget}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <span className="text-[10px] text-red-600 font-bold uppercase block mb-1">Bid Deadline</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedRfq.deadline}</span>
                </div>
              </div>

              {/* Client */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Requesting Client</span>
                <span className="font-bold text-gray-900">{selectedRfq.client}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Posted on: {selectedRfq.posted}</span>
              </div>

              {/* Detailed Scope of Work */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Detailed Scope of Work</span>
                <div className="flex flex-col gap-2">
                  {selectedRfq.scope.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-amber-600 font-bold uppercase block mb-0.5">Mandatory Requirements</span>
                  <span className="text-gray-700 font-semibold">{selectedRfq.requirements}</span>
                </div>
              </div>

              {/* Bid Submission Form */}
              {selectedRfq.status === "Open" && (
                <form onSubmit={handleSubmitBid} className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <span className="text-xs font-bold text-gray-900">Submit Your Competitive Quotation Bid</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Your Bid Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 140000"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Cover Note / Special Terms (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. We can deploy 2 engineers within 48 hours. Includes 90-day warranty."
                      value={bidNotes}
                      onChange={(e) => setBidNotes(e.target.value)}
                      className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 resize-none font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send size={14} /> Submit Quotation Bid
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <button
                onClick={() => setSelectedRfq(null)}
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

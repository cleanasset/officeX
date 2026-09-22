"use client";
import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, X, ArrowRight, FileText, Send, DollarSign, ShieldCheck, Check, Sparkles } from "lucide-react";

export default function MatchedRFQsBrowser() {
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>("RFQ-2026-8842");
  const [toast, setToast] = useState<string | null>(null);
  const [rfqList, setRfqList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  // Quotation Submission Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    bidAmount: "₹3,80,000",
    timeline: "15 Days",
    warranty: "12 Months OEM Warranty",
    notes: "Includes all genuine OEM filter replacements, Mobil Delvac lubricant, and 24/7 priority breakdown dispatch."
  });

  useEffect(() => {
    async function loadRfqs() {
      try {
        const res = await fetch("/api/rfqs");
        const data = await res.json();
        if (data.success && Array.isArray(data.rfqs) && data.rfqs.length > 0) {
          setRfqList(data.rfqs);
          if (!selectedRfqId) setSelectedRfqId(data.rfqs[0].id);
        }
      } catch (e) {
        console.error("Failed to load RFQs", e);
      }
    }
    loadRfqs();
  }, []);

  const activeRfq = rfqList.find((r) => r.id === selectedRfqId) || rfqList[0];

  const handleStartProposal = () => {
    setShowQuoteModal(true);
  };

  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfq) return;
    setIsSubmittingQuote(true);
    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_quote",
          rfqId: activeRfq.id,
          vendorName: "Apex Facility Solutions Pvt Ltd",
          bidAmount: quoteForm.bidAmount,
          timeline: quoteForm.timeline,
          warranty: quoteForm.warranty,
          notes: quoteForm.notes
        })
      });
      const data = await res.json();
      if (data.success && data.quote) {
        setShowQuoteModal(false);
        setToast(`Quotation of ${quoteForm.bidAmount} submitted for ${activeRfq.id}! Transmitted to Building Owner.`);
        // Update local state with incremented quotes count and evaluating status
        setRfqList((prev) =>
          prev.map((r) =>
            r.id === activeRfq.id
              ? { ...r, quotesCount: (r.quotesCount || 0) + 1, status: "evaluating" }
              : r
          )
        );
      } else {
        setToast(data.error || "Failed to submit quotation.");
      }
    } catch (err) {
      console.error(err);
      setToast("Error transmitting quotation.");
    } finally {
      setIsSubmittingQuote(false);
      setTimeout(() => setToast(null), 4500);
    }
  };

  const displayRfqs = rfqList.length > 0 ? rfqList : [
    {
      id: "RFQ-2026-8842",
      title: "DG Set Annual Maintenance Contract",
      category: "HVAC",
      match: "98% Match",
      property: "Apex Business Tower, Mumbai BKC",
      desc: "Comprehensive AMC for 3x 1000kVA Cummins DG sets including preventive maintenance, breakdown calls, and genuine consumables.",
      scopeOfWork: "Quarterly inspection, load testing, oil analysis, filter replacement, 2-hour breakdown response SLA.",
      timeRemaining: "1d : 08h : 45m"
    },
    {
      id: "RFQ-2026-8843",
      title: "Facade Cleaning Service — Quarterly",
      category: "Cleaning",
      match: "96% Match",
      property: "Global Tech Park, Bengaluru",
      desc: "Quarterly facade cleaning for 3 glass towers. Requires specialized cradle equipment and certified rope access personnel.",
      scopeOfWork: "Cleaning 42,000 sq.ft of curtain wall facade, silicone seal inspection, IRATA rope certification.",
      timeRemaining: "2d : 14h : 05m"
    },
    {
      id: "RFQ-2026-8844",
      title: "UPS Battery Replacement & Testing",
      category: "Electrical",
      match: "92% Match",
      property: "Cyber City, Gurugram",
      desc: "Supply, installation, and testing of 120 SMF batteries for centralized UPS systems across 4 server room floors.",
      scopeOfWork: "Replace 12V 100AH Exide SMF batteries, safe disposal of old cells, impedance testing, backup load run.",
      timeRemaining: "4d : 09h : 20m"
    },
    {
      id: "RFQ-2026-8845",
      title: "Access Control System Upgrade",
      category: "Security",
      match: "88% Match",
      property: "Pioneer Plaza, Pune",
      desc: "Migration from legacy RFID to biometric/mobile access control for 15 entry points including turnstiles and server rooms.",
      scopeOfWork: "Hardware retrofit, SDK integration with OfficeX Speed-Gate API, 3,500 active employee badge provisioning.",
      timeRemaining: "7d : 11h : 00m"
    }
  ];

  const currentRfq = displayRfqs.find(r => r.id === selectedRfqId) || displayRfqs[0];

  return (
    <div className="flex gap-6 font-sans relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main List */}
      <div className={`flex-1 flex flex-col gap-6 ${selectedRfqId ? "mr-[440px]" : ""}`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Matched RFQs &amp; Procurement Tenders</h1>
          <p className="text-sm text-gray-500 mt-1">Review live commercial RFQs matched to your trade credentials and submit competitive bids.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>All Categories</option>
            <option>HVAC</option>
            <option>Cleaning</option>
            <option>Electrical</option>
            <option>Security</option>
          </select>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>All Cities</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Gurugram</option>
            <option>Pune</option>
          </select>
        </div>

        {/* RFQ Grid */}
        <div className="grid grid-cols-2 gap-4">
          {displayRfqs.map((rfq) => (
            <div
              key={rfq.id}
              onClick={() => setSelectedRfqId(rfq.id)}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                selectedRfqId === rfq.id ? "border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-sm" : "border-gray-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                    {rfq.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {rfq.match || "95% Match"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{rfq.title}</h3>
                <p className="text-xs text-gray-500 mb-3">📍 {rfq.property}</p>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">{rfq.desc || rfq.scopeOfWork}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                <span className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <Clock size={14} /> {rfq.timeRemaining || "Active Tender"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToast("RFQ " + rfq.id + " declined.");
                      setTimeout(() => setToast(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRfqId(rfq.id);
                      setShowQuoteModal(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Quote Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {currentRfq && selectedRfqId && (
        <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-40 overflow-y-auto p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-base font-bold text-gray-900">RFQ Tender Details</h2>
              <button onClick={() => setSelectedRfqId(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">{currentRfq.category}</span>
              <span className="text-xs text-gray-400 font-mono">ID: {currentRfq.id}</span>
            </div>

            <h1 className="text-xl font-black text-gray-900 mb-4">{currentRfq.title}</h1>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                🏢
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{currentRfq.property}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Commercial Asset Partner Network</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scope &amp; Specifications</p>
              <p>{currentRfq.desc || currentRfq.scopeOfWork}</p>
              {currentRfq.scopeOfWork && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-teal-900">
                  <span className="font-bold block mb-1">Contractual Requirements:</span>
                  <p className="text-[11px] leading-relaxed">{currentRfq.scopeOfWork}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Compliance Standard</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Verified ISO/PSARA</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Settlement Terms</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Escrow 90/10 Split</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-gray-500">Tender Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Clock size={13} /> {currentRfq.timeRemaining || "Accepting Bids"}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRfqId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleStartProposal}
                className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                Submit Quotation <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUOTATION SUBMISSION MODAL ═══ */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  Submit Official Quotation
                </span>
                <h2 className="text-lg font-black text-gray-900 mt-2">{currentRfq?.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{currentRfq?.id} • {currentRfq?.property}</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  TOTAL PROPOSED QUOTE AMOUNT (EXCL. GST) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={quoteForm.bidAmount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, bidAmount: e.target.value })}
                    placeholder="e.g. ₹3,50,000"
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#0F8B7D]"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Platform take-rate (10%) auto-computed upon escrow milestone sign-off.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    EXECUTION TIMELINE
                  </label>
                  <input
                    value={quoteForm.timeline}
                    onChange={(e) => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    WARRANTY / AMC BUFFER
                  </label>
                  <input
                    value={quoteForm.warranty}
                    onChange={(e) => setQuoteForm({ ...quoteForm, warranty: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  COMMERCIAL NOTES &amp; OEM CERTIFICATIONS
                </label>
                <textarea
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#0F8B7D] resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Escrow Protection</span>
                  <span className="text-xs font-bold text-slate-800">100% Escrow-backed payout upon client sign-off</span>
                </div>
                <ShieldCheck size={20} className="text-teal-600" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <Send size={13} /> {isSubmittingQuote ? "Transmitting Bid..." : "Confirm & Submit Bid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

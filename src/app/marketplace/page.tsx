"use client";
import React, { useState } from "react";
import { 
  Layers, 
  FileText, 
  ClipboardList, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Building, 
  UserCheck, 
  Clock, 
  Calendar, 
  ThumbsUp, 
  Award,
  ChevronRight,
  TrendingUp,
  Download
} from "lucide-react";
import Link from "next/link";

export default function MarketplaceDashboard() {
  // Drawers and Modals State
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [selectedCompareRfq, setSelectedCompareRfq] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeRfqs = [
    { id: "RFQ-401", title: "150TR Chiller Descaling & Annual Overhaul", category: "HVAC", manpower: "3 Persons", deadline: "Sep 05, 2026", status: "Open", posted: "Aug 22, 2026" },
    { id: "RFQ-402", title: "DG Set 500kVA B-Check & Oil Filtration", category: "Electrical", manpower: "2 Persons", deadline: "Sep 08, 2026", status: "Open", posted: "Aug 23, 2026" },
    { id: "RFQ-403", title: "Fire Hydrant Pump Replacement", category: "Fire Safety", manpower: "4 Persons", deadline: "Sep 12, 2026", status: "Open", posted: "Aug 24, 2026" },
    { id: "RFQ-404", title: "Quarterly Indoor Air Quality (IAQ) Audit", category: "Compliance", manpower: "2 Persons", deadline: "Sep 15, 2026", status: "Open", posted: "Aug 25, 2026" }
  ];

  const recentQuotes = [
    { id: "Q-901", rfqTitle: "150TR Chiller Descaling", vendor: "TechServe Solutions", bid: "₹1,40,000", score: 91, details: { price: 95, sla: 90, technical: 92, quality: 88, compliance: 90, experience: 90, sustainability: 85 } },
    { id: "Q-902", rfqTitle: "150TR Chiller Descaling", vendor: "Apex Electromechanicals", bid: "₹1,48,000", score: 85, details: { price: 88, sla: 85, technical: 85, quality: 84, compliance: 88, experience: 82, sustainability: 80 } },
    { id: "Q-903", rfqTitle: "DG Set 500kVA B-Check", vendor: "PowerMech AMC Services", bid: "₹82,000", score: 88, details: { price: 92, sla: 88, technical: 86, quality: 85, compliance: 90, experience: 85, sustainability: 85 } }
  ];

  const activeOrders = [
    { id: "WO-801", title: "HVAC Chiller Overhaul", vendor: "TechServe Solutions", status: "In Progress", progress: "Milestone 2/3 (Chiller pressure test)" },
    { id: "WO-802", title: "Weekly Deep Cleaning", vendor: "CleanForce Corp", status: "Review Pending", progress: "Milestone 1/1 (Awaiting signoff)" }
  ];

  const escrows = [
    { id: "ESC-301", rfq: "HVAC Chiller Overhaul", amount: "₹1,41,600", fee: "₹14,160", net: "₹1,27,440", status: "Locked in Escrow" },
    { id: "ESC-302", rfq: "Weekly Deep Cleaning", amount: "₹45,000", fee: "₹4,500", net: "₹40,500", status: "Released to Vendor" }
  ];

  const handleAwardBid = (vendorName: string, rfqTitle: string) => {
    setSelectedCompareRfq(null);
    showToast(`Work Order successfully awarded to ${vendorName} for "${rfqTitle}"! Payout locked in Escrow.`);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-[#0F8B7D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FM Marketplace</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1">Vendor bidding, quotation comparisons, and escrow payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/marketplace/rfq" className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5">
            Post New RFQ
          </Link>
        </div>
      </div>

      {/* KPI BENTO (Fully Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: Active RFQs */}
        <div 
          onClick={() => setSelectedKpi("rfqs")}
          className="premium-card p-6 border border-gray-200 hover:border-blue-350 bg-blue-50 hover:bg-blue-50/10 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active RFQs</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-[#0F8B7D]">{activeRfqs.length}</div>
            <span className="text-[10px] text-[#0F8B7D] font-bold mt-1 block">🟢 Open for Bidding →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F8B7D] group-hover:scale-110 transition-transform">
            <Layers size={22} />
          </div>
        </div>

        {/* KPI 2: Bids Received */}
        <div 
          onClick={() => setSelectedKpi("bids")}
          className="premium-card p-6 border border-gray-200 hover:border-blue-350 bg-blue-50 hover:bg-blue-50/10 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Bids Received</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-[#0F8B7D]">{recentQuotes.length}</div>
            <span className="text-[10px] text-[#0F8B7D] font-bold mt-1 block">5 new quotes today →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <FileText size={22} />
          </div>
        </div>

        {/* KPI 3: Active Orders */}
        <div 
          onClick={() => setSelectedKpi("orders")}
          className="premium-card p-6 border border-gray-200 hover:border-blue-350 bg-blue-50 hover:bg-blue-50/10 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active Orders</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-[#0F8B7D]">{activeOrders.length}</div>
            <span className="text-[10px] text-[#0F8B7D] font-bold mt-1 block">100% SLA compliant →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <ClipboardList size={22} />
          </div>
        </div>

        {/* KPI 4: Escrow Balance */}
        <div 
          onClick={() => setSelectedKpi("escrow")}
          className="premium-card p-6 border border-gray-200 hover:border-blue-350 bg-blue-50 hover:bg-blue-50/10 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Escrow Balance</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-[#0F8B7D]">₹4.2L</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Razorpay Escrow Secure →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <DollarSign size={22} />
          </div>
        </div>

      </div>

      {/* RFQ Bidding Pipelines Table */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Layers size={18} className="text-[#0F8B7D]" />
          Recent Bidding Pipelines (Click row to compare bids side-by-side)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4">RFQ Reference ID</th>
                <th className="py-4">RFQ Title</th>
                <th className="py-4">Category</th>
                <th className="py-4">Estimated Manpower</th>
                <th className="py-4">Quote Deadline</th>
                <th className="py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeRfqs.map((rfq) => (
                <tr 
                  key={rfq.id}
                  onClick={() => setSelectedCompareRfq(rfq)}
                  className="border-b border-gray-100 text-xs hover:bg-[#F0FDFA]/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 font-mono font-bold text-[#0F8B7D]">{rfq.id}</td>
                  <td className="py-4 font-bold text-gray-900 group-hover:text-[#0F8B7D]">{rfq.title}</td>
                  <td className="py-4 text-gray-600 font-semibold">{rfq.category}</td>
                  <td className="py-4 text-gray-600 font-semibold">{rfq.manpower}</td>
                  <td className="py-4 text-gray-400 font-semibold">{rfq.deadline}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCompareRfq(rfq);
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-blue-200 text-[#0F8B7D] hover:bg-blue-50 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Compare Bids
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== KPI DETAILS DRAWERS ===== */}
      {selectedKpi && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base capitalize">{selectedKpi} List</h3>
                  <span className="text-[10px] text-[#0F8B7D] font-bold uppercase tracking-wider">FM Marketplace</span>
                </div>
                <button 
                  onClick={() => setSelectedKpi(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* RFQs List */}
              {selectedKpi === "rfqs" && (
                <div className="flex flex-col gap-3">
                  {activeRfqs.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-gray-900">{r.title}</strong>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F8B7D] font-bold text-[9px] uppercase">{r.status}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1">ID: {r.id} • Posted: {r.posted}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bids List */}
              {selectedKpi === "bids" && (
                <div className="flex flex-col gap-4">
                  {recentQuotes.map(q => (
                    <div key={q.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-xs flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-gray-900 block">{q.vendor}</span>
                          <span className="text-[10px] text-gray-400">{q.rfqTitle}</span>
                        </div>
                        <span className="text-sm font-extrabold text-[#0F8B7D]">{q.bid}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-[#0F8B7D] px-2.5 py-1 rounded-lg border border-blue-100 w-fit">
                        <Sparkles size={11} /> OFFICEX Vendor Score: <strong className="text-sm ml-0.5">{q.score}/100</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders List */}
              {selectedKpi === "orders" && (
                <div className="flex flex-col gap-3">
                  {activeOrders.map(o => (
                    <div key={o.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <strong className="text-gray-900">{o.title}</strong>
                        <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] uppercase">{o.status}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold">Vendor: {o.vendor}</div>
                      <div className="text-[10px] text-gray-400 mt-1 pt-1.5 border-t border-gray-100">📌 Current: {o.progress}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Escrow Details */}
              {selectedKpi === "escrow" && (
                <div className="flex flex-col gap-3">
                  {escrows.map(e => (
                    <div key={e.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-gray-900">{e.rfq}</strong>
                        <span className="font-extrabold text-emerald-600">{e.amount}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-semibold">Net Payout: {e.net} (Fee: {e.fee})</div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit mt-1.5 ${
                        e.status.includes("Released") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>{e.status}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <button 
                onClick={() => setSelectedKpi(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDE-BY-SIDE QUOTATIONS COMPARISON MODAL ===== */}
      {selectedCompareRfq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">Side-by-Side Quote Evaluation</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Compare Bids: {selectedCompareRfq.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedCompareRfq(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comparison Grid with Custom Vendor Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              
              {/* Scope Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/60 flex flex-col gap-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RFQ Baseline Scope</span>
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Target Budget</span>
                  <span className="text-lg font-extrabold text-gray-800">{selectedCompareRfq.budget}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Service Region</span>
                  <span className="font-semibold text-gray-600">Mumbai / Bengaluru</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Manpower Required</span>
                  <span className="font-semibold text-gray-600">{selectedCompareRfq.manpower} Deployed</span>
                </div>
              </div>

              {/* Vendor Option 1 */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/10 flex flex-col justify-between min-h-[300px]">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-blue-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">TechServe Solutions</h4>
                      <span className="text-[10px] text-[#0F8B7D] font-bold block mt-0.5">BEE Certified HVAC</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#0F8B7D] text-white font-extrabold text-[10px]">91 Score</span>
                  </div>

                  {/* Criteria Scores */}
                  <div className="flex flex-col gap-2 text-[11px] font-semibold text-gray-700">
                    <div className="flex justify-between"><span>Price (25%)</span><span className="text-gray-900 font-bold">95/100</span></div>
                    <div className="flex justify-between"><span>SLA Target (20%)</span><span className="text-gray-900 font-bold">90/100</span></div>
                    <div className="flex justify-between"><span>Technical (15%)</span><span className="text-gray-900 font-bold">92/100</span></div>
                    <div className="flex justify-between"><span>Quality (15%)</span><span className="text-gray-900 font-bold">88/100</span></div>
                    <div className="flex justify-between"><span>Compliance (10%)</span><span className="text-gray-900 font-bold">90/100</span></div>
                  </div>

                  <div className="mt-2 text-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Quoted Price Bid</span>
                    <span className="text-lg font-black text-emerald-600">₹1,40,000</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleAwardBid("TechServe Solutions", selectedCompareRfq.title)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Award Contract (TechServe)
                </button>
              </div>

              {/* Vendor Option 2 */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between min-h-[300px]">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">Apex Electromechanicals</h4>
                      <span className="text-[10px] text-gray-500 font-bold block mt-0.5">Commercial HVAC LLC</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-gray-200 text-gray-700 font-extrabold text-[10px]">85 Score</span>
                  </div>

                  {/* Criteria Scores */}
                  <div className="flex flex-col gap-2 text-[11px] font-semibold text-gray-700">
                    <div className="flex justify-between"><span>Price (25%)</span><span className="text-gray-900 font-bold">88/100</span></div>
                    <div className="flex justify-between"><span>SLA Target (20%)</span><span className="text-gray-900 font-bold">85/100</span></div>
                    <div className="flex justify-between"><span>Technical (15%)</span><span className="text-gray-900 font-bold">85/100</span></div>
                    <div className="flex justify-between"><span>Quality (15%)</span><span className="text-gray-900 font-bold">84/100</span></div>
                    <div className="flex justify-between"><span>Compliance (10%)</span><span className="text-gray-900 font-bold">88/100</span></div>
                  </div>

                  <div className="mt-2 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Quoted Price Bid</span>
                    <span className="text-lg font-black text-gray-800">₹1,48,000</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleAwardBid("Apex Electromechanicals", selectedCompareRfq.title)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Award Contract (Apex)
                </button>
              </div>

            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedCompareRfq(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close Comparison
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

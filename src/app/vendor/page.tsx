"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProfileCompletionMeter from "@/components/ProfileCompletionMeter";
import { 
  Star, CheckCircle, Clock, DollarSign, ArrowRight, Zap, 
  CheckCircle2, Wallet, ShieldCheck, MapPin, Upload, FileText, 
  X, Percent, Check, Send, Camera, AlertCircle
} from "lucide-react";

export default function VendorPortalDashboard() {
  const [toast, setToast] = useState<string | null>(null);
  const [earlyPayoutRequested, setEarlyPayoutRequested] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Quote Now state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<any | null>(null);
  const [proposedQuoteAmount, setProposedQuoteAmount] = useState(42000);
  const [slaCommitment, setSlaCommitment] = useState("< 30 mins");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, boolean>>({});

  // Work Order Progress state
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedWoForProgress, setSelectedWoForProgress] = useState<any | null>(null);
  const [updatedProgressPct, setUpdatedProgressPct] = useState(75);
  const [progressNotes, setProgressNotes] = useState("");
  const [progressPhotoName, setProgressPhotoName] = useState<string | null>(null);

  // Invoice state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedWoForInvoice, setSelectedWoForInvoice] = useState<any | null>(null);
  const [invoiceSubmitted, setInvoiceSubmitted] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const performance = [
    { label: "Quality", pct: 90, color: "bg-[#0F8B7D]" },
    { label: "Timeliness", pct: 85, color: "bg-blue-600" },
    { label: "SLA Compliance", pct: 92, color: "bg-[#0F8B7D]" },
    { label: "Responsiveness", pct: 80, color: "bg-blue-600" },
    { label: "Professionalism", pct: 88, color: "bg-[#0F8B7D]" }
  ];

  const [matchedRfqs, setMatchedRfqs] = useState([
    { id: "RFQ-101", title: "HVAC Maintenance", match: "96%", property: "Crystal Tower", budget: "₹45,000", rawBudget: 45000, deadline: "2d 4h left", category: "HVAC" },
    { id: "RFQ-102", title: "Deep Cleaning & Facade", match: "88%", property: "Apex Business Tower", budget: "₹18,000", rawBudget: 18000, deadline: "5h 20m left", category: "Housekeeping" },
    { id: "RFQ-103", title: "Electrical Audit & DG Test", match: "92%", property: "Nexus Hub", budget: "₹12,000", rawBudget: 12000, deadline: "4d 12h left", category: "Electrical" }
  ]);

  const payouts = [
    { date: "15 Sep 2026", ref: "Ref: RZP-ESC-982341", amount: "₹45,500", color: "text-emerald-600" },
    { date: "01 Sep 2026", ref: "Ref: RZP-ESC-772901", amount: "₹1,12,000", color: "text-gray-900" },
    { date: "15 Aug 2026", ref: "Ref: RZP-ESC-332199", amount: "₹68,200", color: "text-gray-900" }
  ];

  const [workOrders, setWorkOrders] = useState([
    { id: "WO-045", client: "TCS", property: "Apex Tower", category: "HVAC", catColor: "bg-teal-100 text-teal-700", timeline: "01 Dec - 15 Dec", progress: 75, status: "In Progress", gross: 85000 },
    { id: "WO-042", client: "Wipro", property: "Meridian Park", category: "Cleaning", catColor: "bg-blue-100 text-blue-700", timeline: "05 Dec - 10 Dec", progress: 40, status: "In Progress", gross: 32000 },
    { id: "WO-039", client: "Infosys", property: "Nexus Hub", category: "Electrical", catColor: "bg-amber-100 text-amber-700", timeline: "20 Nov - 30 Nov", progress: 100, status: "Completed", gross: 120000 },
    { id: "WO-035", client: "Deloitte", property: "Crystal Tower", category: "Plumbing", catColor: "bg-purple-100 text-purple-700", timeline: "08 Dec - 12 Dec", progress: 10, status: "Onboarding", gross: 28000 }
  ]);

  useEffect(() => {
    fetch("/api/work-orders")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.workOrders) && data.workOrders.length > 0) {
          const mapped = data.workOrders.map((w: any) => ({
            id: w.id,
            client: w.client || "Apex Business Tower",
            property: w.property || "Apex Tower",
            category: w.title.includes("Chiller") || w.title.includes("HVAC") ? "HVAC" : w.title.includes("Lift") || w.title.includes("Elevator") ? "OEM Lift" : "MEP Service",
            catColor: "bg-teal-100 text-teal-700",
            timeline: w.startDate || "Active",
            progress: w.pct || 50,
            status: w.status || "In Progress",
            gross: parseInt(w.contractValue?.replace(/\D/g, "") || "45000") || 45000
          }));
          setWorkOrders(mapped);
        }
      })
      .catch(err => console.error("Error loading work orders in vendor dashboard:", err));
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800">
          <CheckCircle2 size={16} className="text-teal-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Vendor Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Verified Gold Vendor</span>
              <CheckCircle size={14} className="text-[#0F8B7D]" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 mt-0.5">
              <span>● Status: Active</span>
              <span className="flex items-center gap-1">
                <Star size={10} className="text-amber-500 fill-amber-500" /> Rating: 4.4 (23 reviews)
              </span>
              <span>Profile: 100% Complete</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newState = !isCheckedIn;
              setIsCheckedIn(newState);
              showToast(newState ? "GPS Check-In Verified: Apex Business Tower (Lat 19.0657° N, Long 72.8688° E · 11:52 AM · Attendance Logged)" : "Checked Out of Site.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCheckedIn
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-[#0F8B7D] hover:bg-[#0c7368] text-white shadow-sm"
            }`}
          >
            <MapPin size={13} />
            <span>{isCheckedIn ? "On-Site (GPS Locked ✓)" : "GPS Check-In"}</span>
          </button>
          <button 
            onClick={() => showToast("Vendor profile credentials confirmed verified with GST & PSARA clearance.")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Verified Profile
          </button>
        </div>
      </div>

      {/* S12 Profile Completion & Progressive KYC Meter (v1.0 Spec Section 15) */}
      <ProfileCompletionMeter role="vendor" />

      {/* VENDOR WALLET & ESCROW PAYOUT SECTION (per UI/UX Review Finding 7.3) */}
      <div className="bg-gradient-to-br from-[#071324] to-[#0A1829] rounded-2xl border border-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">Vendor Escrow Wallet</span>
              <h3 className="text-lg font-black text-white">Guaranteed Payout Balance</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full self-start sm:self-auto">
            ● 0-Day Dispute Escrow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Withdrawable Balance</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">₹2,45,000</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Net of 8.5% OfficeX fee</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Billed (Active WOs)</span>
            <span className="text-2xl font-black text-white mt-1 block">₹2,67,750</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">4 Verified work orders</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">OfficeX Platform Fee</span>
            <span className="text-2xl font-black text-teal-300 mt-1 block">₹22,750</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">8.5% Standard Commission</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Scheduled Auto-Transfer</span>
              <span className="text-sm font-black text-white mt-1 block">Friday, 12:00 PM</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">HDFC Bank · A/c *8829</span>
            </div>
            <button
              onClick={() => {
                setEarlyPayoutRequested(true);
                showToast("Instant T+1 settlement requested. Funds will be deposited within 24 hours.");
              }}
              disabled={earlyPayoutRequested}
              className="mt-2 w-full py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7368] disabled:bg-slate-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Zap size={11} /> {earlyPayoutRequested ? "Settlement Initiated" : "Request Instant T+1 Payout"}
            </button>
          </div>
        </div>
      </div>

      {/* KPIs + Performance */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_340px] gap-4">
        <div className="grid grid-rows-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Active Work Orders</p>
            <p className="text-3xl font-black text-gray-900">4</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Earnings</p>
            <p className="text-2xl font-black text-gray-900">₹3,20,000</p>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Matched RFQs ●</p>
            <p className="text-3xl font-black text-gray-900">6</p>
            <p className="text-[10px] font-bold text-[#0F8B7D]">+2 Today</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Quality Score</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">88</span>
              <span className="text-xs text-gray-500 font-semibold">Top 15% Vendor</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Performance Radar</h3>
          <div className="space-y-2.5">
            {performance.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="font-semibold text-gray-700">{p.label}</span>
                  <span className="font-bold text-gray-900">{p.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matched RFQs + Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">New Matched RFQs</h2>
            <Link href="/vendor/rfqs" className="text-xs font-semibold text-[#0F8B7D] cursor-pointer hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {matchedRfqs.map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{r.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {r.match} Match
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-600 flex items-center gap-1 font-medium">
                      <Clock size={10} /> {r.deadline}
                    </span>
                    {submittedQuotes[r.id] ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Check size={11} /> Quote Sent ✓
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedRfqForQuote(r);
                          setProposedQuoteAmount(r.rawBudget ? Math.round(r.rawBudget * 0.95) : 40000);
                          setIsQuoteModalOpen(true);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Quote Now
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">🏢 {r.property}  •  💰 Budget: {r.budget}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Earnings Trend</h2>
          <div className="flex items-end gap-2 h-24 mb-4">
            {[40, 55, 50, 70, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-[#0F8B7D]/20 rounded-t" style={{ height: `${h}%` }}>
                <div className="w-full bg-[#0F8B7D] rounded-t" style={{ height: "60%" }} />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Recent Payouts</p>
          <div className="space-y-2">
            {payouts.map((p, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-900">{p.date}</p>
                  <p className="text-[10px] text-gray-500">{p.ref}</p>
                </div>
                <span className={`font-bold ${p.color}`}>{p.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work Orders with Progress Update and Invoicing */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Active Work Orders</h2>
            <p className="text-xs text-gray-400">Update progress milestones or submit GST tax invoices for escrow disbursement</p>
          </div>
          <Link href="/vendor/work-orders" className="text-xs font-semibold text-[#0F8B7D] cursor-pointer hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">WO ID</th>
                <th className="py-3 pr-3">Client</th>
                <th className="py-3 pr-3">Property</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Timeline</th>
                <th className="py-3 pr-3">Progress</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workOrders.map((w) => (
                <tr key={w.id} className="text-xs hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 pr-3 font-bold text-gray-500">{w.id}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{w.client}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{w.property}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${w.catColor}`}>
                      {w.category}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-gray-600">{w.timeline}</td>
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${w.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold">{w.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`text-[10px] font-bold ${
                      w.status === "Completed" ? "text-emerald-600" : w.status === "In Progress" ? "text-[#0F8B7D]" : "text-blue-600"
                    }`}>
                      ● {w.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    {w.status === "Completed" ? (
                      invoiceSubmitted[w.id] ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Invoice Sent ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setSelectedWoForInvoice(w); setIsInvoiceModalOpen(true); }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                        >
                          Submit Invoice
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWoForProgress(w);
                          setUpdatedProgressPct(w.progress);
                          setProgressNotes("");
                          setProgressPhotoName(null);
                          setIsProgressModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] hover:bg-teal-100 border border-teal-200 text-[10px] font-bold cursor-pointer"
                      >
                        Update Progress
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. QUOTATION SUBMISSION MODAL                                             */}
      {/* ========================================================================= */}
      {isQuoteModalOpen && selectedRfqForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <FileText size={18} className="text-[#0F8B7D]" />
              <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">
                Formal Bid Submission
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Submit Quotation for {selectedRfqForQuote.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Property: {selectedRfqForQuote.property} · Client Budget: {selectedRfqForQuote.budget}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmittedQuotes((prev) => ({ ...prev, [selectedRfqForQuote.id]: true }));
                setIsQuoteModalOpen(false);
                showToast(`Quotation of ₹${proposedQuoteAmount.toLocaleString("en-IN")} submitted to ${selectedRfqForQuote.property}!`);
              }}
              className="space-y-4 mt-5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Proposed Quote Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedQuoteAmount}
                    onChange={(e) => setProposedQuoteAmount(Number(e.target.value))}
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Guaranteed SLA Response
                  </label>
                  <select
                    value={slaCommitment}
                    onChange={(e) => setSlaCommitment(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  >
                    <option value="< 30 mins">&lt; 30 mins (Emergency SLA)</option>
                    <option value="< 45 mins">&lt; 45 mins</option>
                    <option value="Same Day (2-4 hrs)">Same Day (2-4 hrs)</option>
                  </select>
                </div>
              </div>

              {/* Commission Ledger Preview */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Quotation</span>
                  <span className="font-bold text-slate-900">₹{proposedQuoteAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>OfficeX Platform Fee (10%)</span>
                  <span className="font-bold text-[#0F8B7D]">- ₹{Math.round(proposedQuoteAmount * 0.10).toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900">
                  <span>Net Escrow Disbursement</span>
                  <span className="text-emerald-700">₹{Math.round(proposedQuoteAmount * 0.90).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Scope Notes &amp; Assigned Crew:
                </label>
                <textarea
                  rows={2}
                  required
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. 2 Certified HVAC Technicians with R-134a manifold gauges and pressure testers..."
                  className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>Submit Official Quotation</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WORK ORDER PROGRESS UPDATE MODAL                                       */}
      {/* ========================================================================= */}
      {isProgressModalOpen && selectedWoForProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProgressModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-slate-900">
              Update Progress: {selectedWoForProgress.id}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: {selectedWoForProgress.client} · {selectedWoForProgress.property} ({selectedWoForProgress.category})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setWorkOrders((prev) =>
                  prev.map((w) =>
                    w.id === selectedWoForProgress.id
                      ? {
                          ...w,
                          progress: updatedProgressPct,
                          status: updatedProgressPct === 100 ? "Completed" : "In Progress"
                        }
                      : w
                  )
                );
                setIsProgressModalOpen(false);
                showToast(`Work Order ${selectedWoForProgress.id} updated to ${updatedProgressPct}%! Synced to CAFM.`);
              }}
              className="space-y-4 mt-5 text-xs"
            >
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Milestone Completion:</span>
                  <span className="text-[#0F8B7D] font-black">{updatedProgressPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updatedProgressPct}
                  onChange={(e) => setUpdatedProgressPct(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  On-Ground Field Technician Notes:
                </label>
                <textarea
                  rows={2}
                  required
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="e.g. Completed pressure flushing, replaced primary actuator seal, verified zero leak telemetry..."
                  className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Attach Photo Proof / Inspection Slip:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProgressPhotoName("IMG_20260915_HVAC_SensorTest.jpg")}
                    className="px-3.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-[#0F8B7D] text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-slate-50"
                  >
                    <Camera size={14} />
                    <span>{progressPhotoName ? progressPhotoName : "Upload Photo Proof"}</span>
                  </button>
                  {progressPhotoName && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check size={12} /> Ready for client sign-off
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save &amp; Sync to Client CAFM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAX INVOICE & ESCROW DISBURSEMENT MODAL                                */}
      {/* ========================================================================= */}
      {isInvoiceModalOpen && selectedWoForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-[#0F8B7D]" />
              <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">
                Automated Escrow Invoicing
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Tax Invoice for {selectedWoForInvoice.id}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: {selectedWoForInvoice.client} · Property: {selectedWoForInvoice.property}
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 my-5 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Gross Milestones Billed</span>
                <strong className="text-slate-900">₹{selectedWoForInvoice.gross.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>OfficeX Platform Fee (10%)</span>
                <strong className="text-[#0F8B7D]">- ₹{Math.round(selectedWoForInvoice.gross * 0.10).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TDS Deduction (194C 1%)</span>
                <strong className="text-slate-700">- ₹{Math.round(selectedWoForInvoice.gross * 0.01).toLocaleString("en-IN")}</strong>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                <span>Net Vendor Bank Wire</span>
                <span className="text-emerald-700">₹{Math.round(selectedWoForInvoice.gross * 0.89).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  setInvoiceSubmitted((prev) => ({ ...prev, [selectedWoForInvoice.id]: true }));
                  setIsInvoiceModalOpen(false);
                  showToast(`Tax Invoice for ${selectedWoForInvoice.id} generated! Net payout routed to Escrow wire.`);
                  try {
                    await fetch("/api/commissions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "marketplace_escrow",
                        clientOrEntity: selectedWoForInvoice.client,
                        property: selectedWoForInvoice.property,
                        contractValue: selectedWoForInvoice.gross,
                        category: selectedWoForInvoice.category
                      })
                    });
                  } catch (e) {
                    console.error("Error posting commission:", e);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>Submit &amp; Request Wire Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

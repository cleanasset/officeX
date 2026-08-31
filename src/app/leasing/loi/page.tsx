"use client";
import React, { useState } from "react";
import { 
  Plus, Search, ChevronDown, ChevronUp, Check, Download, Upload, 
  Eye, CheckCircle, FileText, X, Building, DollarSign, Calendar, 
  ShieldCheck, ArrowRight, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DealItem {
  id: string;
  client: string;
  property: string;
  rent: string;
  stage: "Property Selected" | "Negotiation" | "LOI Prep" | "LOI Submitted" | "LOI Signed" | "Documentation" | "Lease Executed";
  stageColor: string;
  agreedRent: string;
  deposit: string;
  lockIn: string;
  escalation: string;
  area: string;
  seats: string;
}

export default function LOIAndLeaseWorkflow() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLoiModal, setShowNewLoiModal] = useState(false);
  const [expandedDeal, setExpandedDeal] = useState<string | null>("DX-2024-089");
  const [toast, setToast] = useState<string | null>(null);

  // New LOI Form State
  const [newDealForm, setNewDealForm] = useState({
    client: "",
    property: "One BKC — North Wing Executive",
    area: "4,500 sq.ft.",
    seats: "60 Seats",
    rent: "₹1,25,000/mo",
    deposit: "3 Months (₹3.75L)",
    lockIn: "3 Years",
    escalation: "5% p.a."
  });

  const [deals, setDeals] = useState<DealItem[]>([
    {
      id: "DX-2024-089",
      client: "Tata Digital Ltd",
      property: "One BKC — North Wing Executive (Fl 4)",
      rent: "₹1.25L",
      stage: "LOI Signed",
      stageColor: "bg-teal-50 text-[#0F8B7D] border border-teal-200",
      agreedRent: "₹1,25,000/mo",
      deposit: "3 Months (₹3.75L)",
      lockIn: "3 Years",
      escalation: "5% p.a.",
      area: "4,500 sq.ft.",
      seats: "60 Seats"
    },
    {
      id: "DX-2024-092",
      client: "Amazon (AWS)",
      property: "Maker Maxity — 5th Floor Suite",
      rent: "₹72K",
      stage: "Negotiation",
      stageColor: "bg-amber-50 text-amber-700 border border-amber-200",
      agreedRent: "₹72,000/mo",
      deposit: "6 Months",
      lockIn: "3 Years",
      escalation: "5% p.a.",
      area: "2,800 sq.ft.",
      seats: "35 Seats"
    },
    {
      id: "DX-2024-105",
      client: "Microsoft R&D",
      property: "Godrej BKC — Floor 8 Horizon Plate",
      rent: "₹2.10L",
      stage: "LOI Prep",
      stageColor: "bg-blue-50 text-blue-700 border border-blue-200",
      agreedRent: "₹2,10,000/mo",
      deposit: "6 Months",
      lockIn: "5 Years",
      escalation: "5% p.a.",
      area: "6,200 sq.ft.",
      seats: "90 Seats"
    },
    {
      id: "DX-2024-112",
      client: "Google India",
      property: "The Capital (Platina) — Cybernetic Floor",
      rent: "₹1.85L",
      stage: "Lease Executed",
      stageColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      agreedRent: "₹1,85,000/mo",
      deposit: "6 Months",
      lockIn: "3 Years",
      escalation: "5% p.a.",
      area: "5,200 sq.ft.",
      seats: "75 Seats"
    }
  ]);

  const milestonesList: Array<DealItem["stage"]> = [
    "Property Selected",
    "Negotiation",
    "LOI Prep",
    "LOI Submitted",
    "LOI Signed",
    "Documentation",
    "Lease Executed"
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateLoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealForm.client.trim()) {
      showToast("Please enter client/tenant company name.");
      return;
    }

    const newId = `DX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdDeal: DealItem = {
      id: newId,
      client: newDealForm.client,
      property: newDealForm.property,
      rent: newDealForm.rent.split("/")[0],
      stage: "LOI Submitted",
      stageColor: "bg-blue-50 text-blue-700 border border-blue-200",
      agreedRent: newDealForm.rent,
      deposit: newDealForm.deposit,
      lockIn: newDealForm.lockIn,
      escalation: newDealForm.escalation,
      area: newDealForm.area,
      seats: newDealForm.seats
    };

    setDeals([createdDeal, ...deals]);
    setExpandedDeal(newId);
    setShowNewLoiModal(false);
    showToast(`Drafted LOI & Proposal for ${newDealForm.client} (${newId})!`);
    setNewDealForm({
      client: "",
      property: "One BKC — North Wing Executive",
      area: "4,500 sq.ft.",
      seats: "60 Seats",
      rent: "₹1,25,000/mo",
      deposit: "3 Months (₹3.75L)",
      lockIn: "3 Years",
      escalation: "5% p.a."
    });
  };

  const advanceStage = (dealId: string, targetStage: DealItem["stage"]) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          stage: targetStage,
          stageColor: targetStage === "Lease Executed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-teal-50 text-[#0F8B7D] border border-teal-200"
        };
      }
      return d;
    }));
    showToast(`Updated deal status to "${targetStage}"!`);
  };

  const handleDownloadLoi = (deal: DealItem) => {
    const text = `===============================================================
OFFICEX FORMAL LETTER OF INTENT (LOI) & TERM SHEET
===============================================================

DEAL ID: ${deal.id}
DATE: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}

PARTIES:
--------
Landlord / Licensor: Brookfield Institutional Properties Ltd
Tenant / Licensee: ${deal.client}

PREMISES & SPACE ALLOCATION:
----------------------------
Property: ${deal.property}
Chargeable Area: ${deal.area}
Seat Capacity: ${deal.seats}
Condition: Grade A+ Fit-out with Full MEP Redundancy

COMMERCIAL SUMMARY:
-------------------
Agreed Base Rent: ${deal.agreedRent}
Interest-Free Security Deposit: ${deal.deposit}
Lease Term / Lock-in: ${deal.lockIn}
Rent Escalation: ${deal.escalation}

STATUS: ${deal.stage.toUpperCase()}
Digitally verified via OFFICEX Smart Leasing Engine.

===============================================================
OFFICEX Operating Platform · https://officex.in
===============================================================`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LOI_${deal.id}_${deal.client.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded LOI Term Sheet for ${deal.client}!`);
  };

  const filteredDeals = deals.filter(d => 
    !searchQuery.trim() || 
    d.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans max-w-full overflow-hidden pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">LOI &amp; Commercial Leases</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage digital Letter of Intents, term sheets, counter-offers, and executed contracts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewLoiModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Draft New LOI
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, property, or Deal ID..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D] shadow-2xs"
        />
      </div>

      {/* Deals Accordion List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100">
        {/* Table Header */}
        <div className="grid grid-cols-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider p-4 px-6 bg-gray-50/70 border-b border-gray-200">
          <div>DEAL ID</div>
          <div>CLIENT / TENANT</div>
          <div>PROPERTY</div>
          <div>RENT / MO</div>
          <div className="text-right">CURRENT STAGE</div>
        </div>

        {filteredDeals.map((deal) => {
          const isExpanded = expandedDeal === deal.id;
          const currentStageIndex = milestonesList.indexOf(deal.stage);

          return (
            <div key={deal.id} className="transition-colors">
              <div
                onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                className="grid grid-cols-5 p-4.5 px-6 items-center text-xs hover:bg-teal-50/20 transition-colors cursor-pointer"
              >
                <span className="font-bold text-[#0F8B7D]">{deal.id}</span>
                <span className="font-bold text-gray-900">{deal.client}</span>
                <span className="text-gray-600 truncate pr-4">{deal.property}</span>
                <span className="font-black text-gray-900">{deal.rent}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${deal.stageColor}`}>
                    ● {deal.stage}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Accordion Body */}
              {isExpanded && (
                <div className="p-6 bg-gray-50/60 border-t border-gray-100 space-y-6 animate-in fade-in duration-150">
                  {/* Step-by-Step Milestones Progress Tracker */}
                  <div className="relative pt-2 pb-4">
                    <div className="flex items-center justify-between relative z-10">
                      {milestonesList.map((m, idx) => {
                        const isPast = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        return (
                          <div 
                            key={m} 
                            onClick={() => advanceStage(deal.id, m)}
                            className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isPast
                                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                                  : isCurrent
                                  ? "bg-white border-2 border-[#0F8B7D] text-[#0F8B7D] ring-4 ring-teal-100 font-black shadow-xs"
                                  : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                              }`}
                            >
                              {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] text-center font-bold max-w-[85px] leading-tight ${
                                isCurrent
                                  ? "text-[#0F8B7D] font-black"
                                  : isPast
                                  ? "text-gray-800"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            >
                              {m}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Background Progress Track */}
                    <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-gray-200 z-0" />
                    <div 
                      className="absolute top-[22px] left-6 h-0.5 bg-[#0F8B7D] z-0 transition-all duration-300"
                      style={{ width: `${(currentStageIndex / (milestonesList.length - 1)) * 92}%` }}
                    />
                  </div>

                  {/* Agreed Commercial Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">AGREED RENT</span>
                      <p className="text-xl font-black text-gray-900 mt-1">{deal.agreedRent}</p>
                      <p className="text-[10px] text-teal-700 font-semibold mt-0.5">{deal.area} · {deal.seats}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">SECURITY DEPOSIT</span>
                      <p className="text-xl font-black text-gray-900 mt-1">{deal.deposit}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Interest-free refundable</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">LOCK-IN PERIOD</span>
                      <p className="text-xl font-black text-gray-900 mt-1">{deal.lockIn}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Standard commercial term</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">ANNUAL ESCALATION</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">{deal.escalation}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Compounded annually</p>
                    </div>
                  </div>

                  {/* Deal Documents & Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Documents */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-2xs text-xs">
                      <h4 className="font-bold text-gray-900 text-xs">Legal Deal Documents</h4>
                      
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-red-500" />
                          <div>
                            <p className="font-bold text-gray-900">LOI_Final_Executed.pdf</p>
                            <p className="text-[10px] text-gray-400">Formal Term Sheet · Digitally Signed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadLoi(deal)}
                            className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-blue-500" />
                          <div>
                            <p className="font-bold text-gray-900">Master_Lease_Agreement_v2.docx</p>
                            <p className="text-[10px] text-gray-400">Under Institutional Legal Review</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                          Legal Review
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-2xs text-xs flex flex-col justify-between h-full">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">Next Workflow Actions</h4>
                        <p className="text-[11px] text-gray-500 mt-1">Advance this deal towards final lease execution and workspace setup.</p>
                      </div>

                      <div className="space-y-2 pt-2">
                        {deal.stage !== "Lease Executed" ? (
                          <button
                            onClick={() => advanceStage(deal.id, "Lease Executed")}
                            className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                          >
                            <CheckCircle size={13} /> Mark Lease Executed &amp; Complete
                          </button>
                        ) : (
                          <Link
                            href="/leasing/onboard"
                            className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all text-center"
                          >
                            <Sparkles size={13} /> Launch 7-Step Workspace Onboarding <ArrowRight size={12} />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDownloadLoi(deal)}
                          className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} /> Download Term Sheet Summary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Draft New LOI Modal */}
      {showNewLoiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Draft New Commercial LOI</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Generate formal Letter of Intent for tenant space</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewLoiModal(false)} 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLoi} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CLIENT / TENANT COMPANY NAME</label>
                <input
                  value={newDealForm.client}
                  onChange={(e) => setNewDealForm({ ...newDealForm, client: e.target.value })}
                  placeholder="e.g. Reliance Jio Infocomm Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TARGET PROPERTY</label>
                  <select
                    value={newDealForm.property}
                    onChange={(e) => setNewDealForm({ ...newDealForm, property: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>One BKC — North Wing Executive</option>
                    <option>Maker Maxity — 5th Floor Suite</option>
                    <option>Godrej BKC — Floor 8 Horizon Plate</option>
                    <option>The Capital — Cybernetic Floor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AREA &amp; CAPACITY</label>
                  <input
                    value={newDealForm.area}
                    onChange={(e) => setNewDealForm({ ...newDealForm, area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AGREED MONTHLY RENT</label>
                  <input
                    value={newDealForm.rent}
                    onChange={(e) => setNewDealForm({ ...newDealForm, rent: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SECURITY DEPOSIT</label>
                  <input
                    value={newDealForm.deposit}
                    onChange={(e) => setNewDealForm({ ...newDealForm, deposit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewLoiModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={13} /> Create &amp; Generate LOI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { AlertCircle, Clock, CheckCircle, Sparkles, ArrowRight, X, Building, Users } from "lucide-react";

interface PipelineCard {
  company: string;
  contact: string;
  area: string;
  budget: string;
  dealHealth: number; // 0-100
  time?: string;
  badge?: string;
  badgeColor?: string;
  warning?: string;
  isExecuted?: boolean;
}

interface PipelineColumn {
  title: string;
  count: number;
  value: string;
  color: string;
  cards: PipelineCard[];
}

export default function PipelineKanbanBoard() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PipelineCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const columns: PipelineColumn[] = [
    {
      title: "Enquiry",
      count: 8,
      value: "₹4.2L",
      color: "border-t-gray-300",
      cards: [
        {
          company: "TCS Innovation Lab",
          contact: "Amit Patel",
          area: "12,000 sqft",
          budget: "₹1.8L/mo",
          dealHealth: 92,
          time: "2 hrs ago",
          badge: "New Hot Lead",
          badgeColor: "bg-emerald-100 text-emerald-800"
        },
        {
          company: "Wipro Digital",
          contact: "Sneha Rao",
          area: "8,500 sqft",
          budget: "₹1.2L/mo",
          dealHealth: 55,
          warning: "8 days inactive"
        }
      ]
    },
    {
      title: "Qualified & Suggested",
      count: 6,
      value: "₹3.1L",
      color: "border-t-blue-500",
      cards: [
        {
          company: "Infosys Fintech",
          contact: "Rahul Desai",
          area: "20,000 sqft",
          budget: "₹3.0L/mo",
          dealHealth: 88,
          time: "1 day ago",
          badge: "Site Visit Done",
          badgeColor: "bg-blue-100 text-blue-800"
        }
      ]
    },
    {
      title: "LOI & Negotiation",
      count: 5,
      value: "₹2.2L",
      color: "border-t-amber-500",
      cards: [
        {
          company: "Deloitte Digital",
          contact: "Priya Sharma",
          area: "15,000 sqft",
          budget: "₹2.2L/mo",
          dealHealth: 95,
          time: "LOI Signed"
        }
      ]
    },
    {
      title: "Lease Executed",
      count: 3,
      value: "₹5.5L",
      color: "border-t-emerald-500",
      cards: [
        {
          company: "Tata Consultancy Services",
          contact: "Aditya Verma",
          area: "25,000 sqft",
          budget: "₹3.8L/mo",
          dealHealth: 100,
          time: "Executed Today",
          badge: "Ready to Onboard",
          badgeColor: "bg-teal-100 text-teal-800",
          isExecuted: true
        }
      ]
    }
  ];

  const handleLaunchOnboarding = (card: PipelineCard) => {
    setSelectedDeal(card);
    setShowOnboardingModal(true);
  };

  const handleCompleteOnboarding = () => {
    setShowOnboardingModal(false);
    showToast(`Workspace onboarding initiated for ${selectedDeal?.company}! Floor & FM services activated.`);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-8 shadow-sm">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pipeline GTV</p>
          <p className="text-2xl font-black text-gray-900">₹17.6L</p>
        </div>
        <div className="border-l border-gray-200 pl-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Win Rate</p>
          <p className="text-2xl font-black text-gray-900">24%</p>
        </div>
        <div className="border-l border-gray-200 pl-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Deal Cycle</p>
          <p className="text-2xl font-black text-gray-900">38 Days</p>
        </div>
        <div className="border-l border-gray-200 pl-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Deals</p>
          <p className="text-2xl font-black text-teal-700">22</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1">
            <AlertCircle size={14} /> Attention Needed (&gt;7d): 2
          </span>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.title} className="min-w-[310px] flex-1">
            <div className={`border-t-4 ${col.color} bg-gray-50 rounded-t-xl px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{col.title}</span>
                <span className="w-5 h-5 rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center">
                  {col.count}
                </span>
              </div>
              {col.value && <span className="text-xs font-bold text-gray-500">{col.value}</span>}
            </div>

            <div className="space-y-3 mt-3">
              {col.cards.map((card) => (
                <div key={card.company} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{card.company}</span>
                    {card.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500">{card.contact}</p>

                  <div className="flex justify-between text-[10px] bg-gray-50 p-2 rounded-lg">
                    <div>
                      <span className="font-bold text-gray-400 uppercase block">Area Req</span>
                      <span className="font-bold text-gray-900 text-xs">{card.area}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 uppercase block">Est. Budget</span>
                      <span className="font-bold text-teal-700 text-xs">{card.budget}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 uppercase block">Health</span>
                      <span className="font-bold text-emerald-600 text-xs">{card.dealHealth}%</span>
                    </div>
                  </div>

                  {card.isExecuted ? (
                    <button
                      onClick={() => handleLaunchOnboarding(card)}
                      className="w-full py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles size={13} /> Launch Workspace Onboarding
                    </button>
                  ) : (
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[10px]">
                      {card.time && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {card.time}
                        </span>
                      )}
                      {card.warning && (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          ⚠ {card.warning}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant / Workspace Onboarding Modal Bridge */}
      {showOnboardingModal && selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Tenant & Workspace Onboarding</h3>
                  <p className="text-xs text-gray-400">Lease Executed &gt; Launching OFFICEX.PRO SaaS</p>
                </div>
              </div>
              <button onClick={() => setShowOnboardingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenant Organization:</span>
                  <span className="font-bold text-gray-900">{selectedDeal.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Allocated Space:</span>
                  <span className="font-bold text-gray-900">{selectedDeal.area} (Floor 4, Unit 4A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Lease Value:</span>
                  <span className="font-bold text-teal-700">{selectedDeal.budget}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Automated Onboarding Sequence</p>
                {[
                  "Create canonical Tenant Master record in OFFICEX.PRO",
                  "Generate Tenant Admin login credentials & invite email",
                  "Provision Floor 4 Unit 4A in Space Master & Rent Roll",
                  "Link mandatory FM services (Daily Housekeeping & Security)",
                  "Initialize Tenant Helpdesk, Document Locker & Visitor Access"
                ].map((item, idx) => (
                  <div key={item} className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 font-semibold">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Complete & Go Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

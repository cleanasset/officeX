"use client";
import React, { useState } from "react";
import { 
  AlertCircle, Clock, CheckCircle, Sparkles, ArrowRight, X, 
  Building, Users, TrendingUp, Award, Calendar, DollarSign, 
  Activity, Check, ShieldCheck, ChevronRight, MapPin, FileText, Send
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PipelineCard {
  id: string;
  company: string;
  contact: string;
  property: string;
  area: string;
  budget: string;
  dealHealth: number; // 0-100
  stageIndex: number; // 0: Enquiry, 1: Site Visit, 2: LOI, 3: Executed
  time?: string;
  badge?: string;
  badgeColor?: string;
  warning?: string;
}

export default function PipelineKanbanBoard() {
  const router = useRouter();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PipelineCard | null>(null);
  const [activeDealModal, setActiveDealModal] = useState<PipelineCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileStage, setMobileStage] = useState<number>(0);

  const [deals, setDeals] = useState<PipelineCard[]>([
    {
      id: "deal-1",
      company: "TCS Innovation Lab",
      contact: "Amit Patel (VP Real Estate)",
      property: "One BKC — North Wing (Fl 4)",
      area: "12,000 sqft (160 Seats)",
      budget: "₹1.8L/mo",
      dealHealth: 92,
      stageIndex: 0,
      time: "Enquiry 2 hrs ago",
      badge: "New Hot Lead",
      badgeColor: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "deal-2",
      company: "Wipro Digital",
      contact: "Sneha Rao (Procurement)",
      property: "Maker Maxity — Suite 501",
      area: "8,500 sqft (110 Seats)",
      budget: "₹1.2L/mo",
      dealHealth: 55,
      stageIndex: 0,
      warning: "Follow-up required (3d)"
    },
    {
      id: "deal-3",
      company: "Infosys Fintech Hub",
      contact: "Rahul Desai (Admin Head)",
      property: "One BKC — North Wing (Fl 5)",
      area: "20,000 sqft (250 Seats)",
      budget: "₹3.0L/mo",
      dealHealth: 88,
      stageIndex: 1,
      time: "Visit Done Yesterday",
      badge: "Shortlisted One BKC",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      id: "deal-4",
      company: "Deloitte Digital",
      contact: "Priya Sharma (Director)",
      property: "Godrej BKC — Floor 8",
      area: "15,000 sqft (180 Seats)",
      budget: "₹2.2L/mo",
      dealHealth: 95,
      stageIndex: 2,
      time: "LOI Draft Generated",
      badge: "Negotiating Rent psf",
      badgeColor: "bg-amber-100 text-amber-800"
    },
    {
      id: "deal-5",
      company: "Tata Digital Ltd",
      contact: "Aditya Verma (Head RE)",
      property: "One BKC — North Wing (Fl 4)",
      area: "25,000 sqft (320 Seats)",
      budget: "₹3.8L/mo",
      dealHealth: 100,
      stageIndex: 3,
      time: "Executed Today",
      badge: "Ready to Onboard",
      badgeColor: "bg-teal-100 text-teal-800"
    }
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const advanceDealStage = (dealId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeals(prev => prev.map(d => {
      if (d.id === dealId && d.stageIndex < 3) {
        const nextStage = d.stageIndex + 1;
        const stageNames = ["Enquiry", "Site Visit Done", "LOI & Negotiation", "Lease Executed"];
        showToast(`Moved ${d.company} to "${stageNames[nextStage]}" stage!`);
        return { ...d, stageIndex: nextStage, dealHealth: Math.min(100, d.dealHealth + 15) };
      }
      return d;
    }));
    setActiveDealModal(null);
  };

  const columnHeaders = [
    { title: "Enquiry & Discovery", count: deals.filter(d => d.stageIndex === 0).length, value: "₹3.0L", color: "border-t-slate-400" },
    { title: "Site Visit Done", count: deals.filter(d => d.stageIndex === 1).length, value: "₹3.0L", color: "border-t-blue-500" },
    { title: "LOI & Negotiation", count: deals.filter(d => d.stageIndex === 2).length, value: "₹2.2L", color: "border-t-amber-500" },
    { title: "Lease Executed", count: deals.filter(d => d.stageIndex === 3).length, value: "₹3.8L", color: "border-t-[#0F8B7D]" }
  ];

  const handleLaunchOnboarding = (card: PipelineCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDeal(card);
    setShowOnboardingModal(true);
  };

  const handleProceedToWizard = () => {
    setShowOnboardingModal(false);
    showToast(`Launching 7-Step Workspace Onboarding for ${selectedDeal?.company}...`);
    setTimeout(() => {
      router.push("/leasing/onboard");
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-full overflow-hidden pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Commercial Leasing Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Click any deal card to inspect building requirements, advance stages, draft LOIs, and launch onboarding.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/leasing/loi"
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5"
          >
            <FileText size={13} /> LOI &amp; Term Sheets
          </Link>
          <Link
            href="/leasing/onboard"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Sparkles size={13} /> Workspace Onboarding
          </Link>
        </div>
      </div>

      {/* Redesigned Premium Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PIPELINE GTV</span>
            <p className="text-2xl font-black text-gray-900">₹17.6 Lakhs</p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <TrendingUp size={11} /> +14.2% this month
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">LEAD WIN RATE</span>
            <p className="text-2xl font-black text-gray-900">24.8%</p>
            <div className="text-[10px] font-semibold text-gray-500">
              Industry benchmark: 18%
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">AVG DEAL CYCLE</span>
            <p className="text-2xl font-black text-gray-900">38 Days</p>
            <div className="text-[10px] font-semibold text-emerald-600">
              ⚡ 6 days faster with auto-LOI
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ACTIVE DEALS</span>
            <p className="text-2xl font-black text-[#0F8B7D]">{deals.length} Active</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle size={10} /> Live Pipeline
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Mobile Stage Switcher Bar */}
      <div className="md:hidden flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-bold overflow-x-auto">
        {columnHeaders.map((col, idx) => (
          <button
            key={col.title}
            onClick={() => setMobileStage(idx)}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-black transition-all whitespace-nowrap text-center cursor-pointer ${
              mobileStage === idx
                ? "bg-white text-[#0F8B7D] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {col.title.split(" ")[0]} ({col.count})
          </button>
        ))}
      </div>

      {/* Responsive Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-start">
        {columnHeaders.map((col, colIndex) => {
          const colDeals = deals.filter(d => d.stageIndex === colIndex);
          const isHiddenOnMobile = mobileStage !== colIndex;

          return (
            <div 
              key={col.title} 
              className={`flex flex-col bg-gray-50/70 rounded-2xl border border-gray-200/90 overflow-hidden shadow-2xs ${
                isHiddenOnMobile ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Column Header */}
              <div className={`border-t-4 ${col.color} p-3.5 px-4 flex items-center justify-between bg-white border-b border-gray-200/80`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900">{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 flex items-center justify-center">
                    {colDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{col.value}</span>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 space-y-3 min-h-[140px]">
                {colDeals.map((card) => (
                  <div 
                    key={card.id}
                    onClick={() => setActiveDealModal(card)}
                    className="bg-white rounded-xl border border-gray-200/90 p-3.5 shadow-2xs hover:shadow-md hover:border-[#0F8B7D]/40 transition-all space-y-2.5 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-[#0F8B7D]">{card.company}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{card.contact}</p>
                      </div>
                      {card.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 ${card.badgeColor}`}>
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* Target Property Location Badge */}
                    <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-100 flex items-center gap-1.5 text-[10px] text-teal-900 font-semibold">
                      <MapPin size={12} className="text-[#0F8B7D] shrink-0" />
                      <span className="truncate">{card.property}</span>
                    </div>

                    {/* Deal Metrics Matrix */}
                    <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-lg p-2 text-[9px]">
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[7.5px]">AREA</span>
                        <span className="font-bold text-gray-900 text-[10px] truncate">{card.area.split(" ")[0]}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[7.5px]">BUDGET</span>
                        <span className="font-bold text-teal-700 text-[10px]">{card.budget}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[7.5px]">HEALTH</span>
                        <span className="font-bold text-emerald-600 text-[10px]">{card.dealHealth}%</span>
                      </div>
                    </div>

                    {/* Stage Progression Action */}
                    {card.stageIndex === 3 ? (
                      <button
                        onClick={(e) => handleLaunchOnboarding(card, e)}
                        className="w-full py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles size={12} /> Launch Onboarding
                      </button>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {card.time}
                        </span>
                        <button
                          onClick={(e) => advanceDealStage(card.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#0F8B7D] text-gray-700 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Advance to next pipeline stage"
                        >
                          <span>Advance</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Deal Action Drawer Modal */}
      {activeDealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">COMMERCIAL DEAL INSPECTION</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">{activeDealModal.company}</h3>
                <p className="text-xs text-gray-500">{activeDealModal.contact}</p>
              </div>
              <button 
                onClick={() => setActiveDealModal(null)} 
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Property Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-400 uppercase text-[10px]">ENQUIRED PROPERTY</span>
                <span className="font-black text-gray-900 flex items-center gap-1">
                  <Building size={13} className="text-[#0F8B7D]" /> {activeDealModal.property}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[9px] font-bold uppercase">SPACE REQUIRED</span>
                  <span className="font-bold text-gray-900">{activeDealModal.area}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] font-bold uppercase">TARGET BUDGET</span>
                  <span className="font-bold text-teal-700">{activeDealModal.budget}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] font-bold uppercase">DEAL HEALTH</span>
                  <span className="font-bold text-emerald-600">{activeDealModal.dealHealth}% Score</span>
                </div>
              </div>
            </div>

            {/* Current Stage Timeline */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">STAGE PROGRESSION FLOW</span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {["Enquiry", "Site Visit", "LOI Signed", "Lease Executed"].map((st, i) => (
                  <div 
                    key={st} 
                    className={`p-2 rounded-xl text-[10px] font-bold transition-all ${
                      activeDealModal.stageIndex >= i 
                        ? "bg-teal-50 text-[#0F8B7D] border border-teal-200 shadow-2xs" 
                        : "bg-gray-100 text-gray-400 border border-transparent"
                    }`}
                  >
                    {activeDealModal.stageIndex > i ? "✓ " : ""}{st}
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveDealModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 text-xs hover:bg-gray-50"
              >
                Close
              </button>

              {activeDealModal.stageIndex < 3 ? (
                <button
                  onClick={() => advanceDealStage(activeDealModal.id)}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Advance Stage to Next Step</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={() => { setActiveDealModal(null); handleLaunchOnboarding(activeDealModal); }}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Launch Workspace Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant / Workspace Onboarding Modal Bridge */}
      {showOnboardingModal && selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Workspace Onboarding Bridge</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Lease Executed $\rightarrow$ Activating OFFICEX.PRO SaaS</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOnboardingModal(false)} 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase">SELECTED CLIENT DEAL</span>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{selectedDeal.company}</p>
                  <p className="text-[11px] text-gray-500">{selectedDeal.contact} • {selectedDeal.property}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <Check size={12} strokeWidth={3} /> Lease Executed
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AUTOMATED PROVISIONING CHECKLIST</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Generate Tenant Portal credentials for {selectedDeal.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Map {selectedDeal.area} at {selectedDeal.property} to Rent Roll Master</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Deploy 52-week PPM facility calendar &amp; emergency NOCs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleProceedToWizard}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Proceed to 7-Step Onboarding <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

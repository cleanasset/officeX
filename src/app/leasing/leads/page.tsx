"use client";
import React, { useState, useEffect } from "react";
import { Search, Building, Phone, Mail, Calendar, CheckCircle, ArrowRight, UserCheck, Sparkles, Filter } from "lucide-react";
import { getPublicEnquiries, PublicEnquiry } from "@/lib/leasingStore";

interface LeadItem {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  property: string;
  details: string;
  seats: string;
  stage: string;
  stageColor: string;
  time: string;
  budget: string;
  moveIn: string;
  isLive?: boolean;
}

export default function LeadsEnquiriesManager() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [tab, setTab] = useState("Details");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const defaultMockLeads: LeadItem[] = [
    { 
      id: "mock-1",
      name: "Wipro Limited", 
      contactName: "Rahul Sharma (VP Real Estate)",
      email: "rahul.s@wipro.com",
      phone: "+91 98765 43210",
      property: "One BKC — North Wing",
      details: "5K sqft BKC • ₹1.2L/mo", 
      seats: "80 Seats",
      stage: "QUALIFIED", 
      stageColor: "bg-amber-100 text-amber-700", 
      time: "2h ago",
      budget: "₹1.2L - ₹1.5L/mo",
      moveIn: "Within 30 days"
    },
    { 
      id: "mock-2",
      name: "TechNova Solutions", 
      contactName: "Pooja Mehta (Operations)",
      email: "pooja@technova.io",
      phone: "+91 98112 34567",
      property: "Maker Maxity — 5th Floor",
      details: "12K sqft Powai • ₹3.5L/mo", 
      seats: "150 Seats",
      stage: "NEW", 
      stageColor: "bg-blue-100 text-blue-700", 
      time: "1d ago",
      budget: "₹3.5L/mo",
      moveIn: "Immediate"
    },
    { 
      id: "mock-3",
      name: "Global Logistics Ltd", 
      contactName: "Aditya Verma (Director)",
      email: "aditya@globallogistics.com",
      phone: "+91 99887 65432",
      property: "Godrej BKC — Floor 8",
      details: "3K sqft BKC • ₹80K/mo", 
      seats: "45 Seats",
      stage: "VISIT", 
      stageColor: "bg-emerald-100 text-emerald-700", 
      time: "2d ago",
      budget: "₹80K - ₹1.0L/mo",
      moveIn: "Within 60 days"
    }
  ];

  const loadAllLeads = () => {
    const publicEnquiries = getPublicEnquiries();
    const formattedPublic: LeadItem[] = publicEnquiries.map((p: PublicEnquiry) => ({
      id: p.id,
      name: p.companyName || "Prospective Tenant",
      contactName: p.contactName || p.companyName,
      email: p.email || "inquiry@client.com",
      phone: p.phone || "+91 98000 00000",
      property: p.propertyTitle || p.buildingName || "One BKC Complex",
      details: `${p.seats || 60} Seats • ${p.propertyTitle || "BKC Space"}`,
      seats: `${p.seats || 60} Seats`,
      stage: "NEW (WEB)",
      stageColor: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      time: p.createdAt || "Just now",
      budget: p.budget || "₹1.25L - ₹2.5L/mo",
      moveIn: p.moveInDate || "Immediate",
      isLive: true
    }));

    const combined = [...formattedPublic, ...defaultMockLeads];
    setLeads(combined);
    if (combined.length > 0 && !selectedLeadId) {
      setSelectedLeadId(combined[0].id);
    }
  };

  useEffect(() => {
    loadAllLeads();

    const handleNewLead = () => {
      loadAllLeads();
      showToast("⚡ New public property enquiry received & updated in CRM!");
    };

    window.addEventListener("officex-lead-added", handleNewLead);
    return () => window.removeEventListener("officex-lead-added", handleNewLead);
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStage === "ALL") return matchesSearch;
    return matchesSearch && l.stage.includes(filterStage);
  });

  const handleConvertToDeal = () => {
    if (!selectedLead) return;
    showToast(`Converted ${selectedLead.name} to Active Deal in Pipeline Kanban!`);
  };

  return (
    <div className="flex flex-col font-sans w-full max-w-full h-full pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Leads &amp; Enquiries Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time incoming enquiries from public property discovery, marketing funnels, and enterprise brokers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold text-xs border border-teal-100 flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={13} /> {leads.length} Total Enquiries
          </span>
        </div>
      </div>

      {/* Main Dual-Pane Lead Workspace */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col md:grid md:grid-cols-[360px_1fr] flex-1 min-h-[580px]">
        {/* Left: Lead List */}
        <div className="border-r border-gray-200 flex flex-col bg-gray-50/30">
          <div className="p-3.5 border-b border-gray-100 bg-white">
            <div className="relative mb-2.5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by company, property, email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-gray-50/50"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap text-[10px] font-bold">
              <button
                onClick={() => setFilterStage("ALL")}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterStage === "ALL" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All ({leads.length})
              </button>
              <button
                onClick={() => setFilterStage("NEW")}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterStage === "NEW" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
              >
                New
              </button>
              <button
                onClick={() => setFilterStage("QUALIFIED")}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterStage === "QUALIFIED" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
              >
                Qualified
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No leads match search.</div>
            ) : (
              filteredLeads.map((l) => {
                const isSelected = selectedLead?.id === l.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLeadId(l.id)}
                    className={`p-3.5 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/50 border-l-4 border-l-[#0F8B7D]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-black text-gray-900 truncate max-w-[200px]">{l.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{l.time}</span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 truncate">{l.property}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-gray-400">{l.seats}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${l.stageColor}`}>
                        {l.stage}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Lead Details */}
        {selectedLead ? (
          <div className="p-4 md:p-6 overflow-y-auto flex flex-col justify-between bg-white space-y-6">
            <div>
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-black text-gray-900">{selectedLead.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedLead.stageColor}`}>
                      {selectedLead.stage}
                    </span>
                    {selectedLead.isLive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200 animate-pulse">
                        ⚡ Web Enquiry
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Interested in: <b className="text-gray-800">{selectedLead.property}</b></p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleConvertToDeal}
                    className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={13} /> Convert to Active Deal
                  </button>
                </div>
              </div>

              {/* Detail Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-4 space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck size={13} className="text-[#0F8B7D]" /> Contact Information
                  </h3>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Contact Person</span>
                    <span className="text-xs font-bold text-gray-900">{selectedLead.contactName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Email</span>
                      <span className="font-semibold text-blue-600 break-all">{selectedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Phone</span>
                      <span className="font-semibold text-gray-800">{selectedLead.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-4 space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={13} className="text-[#0F8B7D]" /> Space Requirements
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Required Seats</span>
                      <span className="font-black text-gray-900">{selectedLead.seats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Budget Range</span>
                      <span className="font-bold text-[#0F8B7D]">{selectedLead.budget}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Target Move-in</span>
                      <span className="font-semibold text-gray-800">{selectedLead.moveIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Lead Source</span>
                      <span className="font-semibold text-emerald-700">{selectedLead.isLive ? "Public Portal Search" : "Direct Referral"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-gray-400 text-[11px]">Assigned Broker: <b>Ravi Menon (Commercial Lead)</b></span>
              <div className="flex items-center gap-2">
                <a 
                  href={`tel:${selectedLead.phone}`}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold flex items-center gap-1"
                >
                  <Phone size={12} /> Call Contact
                </a>
                <a 
                  href={`mailto:${selectedLead.email}`}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold flex items-center gap-1"
                >
                  <Mail size={12} /> Send Email
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center">
            Select a lead to inspect details.
          </div>
        )}
      </div>
    </div>
  );
}

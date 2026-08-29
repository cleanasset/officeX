"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, CheckCircle, X, Download } from "lucide-react";

interface PropertyActionsProps {
  propertyId: string;
  propertyName: string;
}

export default function PropertyActions({ propertyId, propertyName }: PropertyActionsProps) {
  const router = useRouter();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    companyName: "",
    seats: "50",
    email: "",
    phone: ""
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("11:00");
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.companyName.trim() || !proposalForm.email.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }
    setIsSubmittingProposal(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: proposalForm.companyName,
          desiredSqft: (parseInt(proposalForm.seats) * 70).toString(), // estimate 70 sqft per seat
          budgetRange: "2-5 Lakhs",
          city: "Mumbai"
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowProposalModal(false);
        showToast(`Proposal request for ${proposalForm.companyName} submitted successfully!`);
        setProposalForm({ companyName: "", seats: "50", email: "", phone: "" });
      } else {
        showToast("Submission failed. Try again.");
      }
    } catch (err) {
      showToast("Network error. Try again.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      showToast("Please select a date.");
      return;
    }
    setIsSubmittingVisit(true);

    // Simulate scheduling visit
    setTimeout(() => {
      setIsSubmittingVisit(false);
      setShowVisitModal(false);
      showToast(`Site visit scheduled for ${visitDate} at ${visitTime} successfully!`);
    }, 800);
  };

  const handleDownload = () => {
    showToast("Preparing technical due-diligence package...");
    setTimeout(() => {
      // Trigger a dummy file download
      const element = document.createElement("a");
      const file = new Blob([`OfficeX Technical Due Diligence Package\n\nProperty: ${propertyName}\nID: ${propertyId}\n\nAll Statutory Compliances Verified:\n- Fire NOC: Valid\n- Lift Safety: Valid\n- Structural Health: Grade A\n- Electrical Safety NOC: Valid`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${propertyName.toLowerCase().replace(/\s+/g, "_")}_due_diligence_pack.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast("Download started successfully!");
    }, 1000);
  };

  return (
    <div className="relative w-full">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Broker Contact Card */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3.5 mb-4 shadow-xs">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Property Broker</h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-sm border border-blue-200 shadow-inner">
            RM
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900 text-xs">Ravi Menon</h5>
            <p className="text-[9px] font-extrabold text-[#2563EB] uppercase tracking-wider mt-0.5 font-sans">Leasing Director, OfficeX</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px] text-slate-600 border-t border-slate-50 pt-3 font-semibold">
          <div className="flex justify-between items-center">
            <span>Direct Phone</span>
            <span className="font-bold text-slate-800">+91 98900 12345</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Email</span>
            <span className="font-bold text-slate-800">broker@officex.in</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-blue-50/20 flex flex-col gap-3">
        <button 
          onClick={() => setShowProposalModal(true)}
          className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FileText size={14} />
          Request Proposal
        </button>
        <button 
          onClick={() => setShowVisitModal(true)}
          className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-750 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Calendar size={14} />
          Request Site Visit
        </button>
        <div className="grid grid-cols-2 gap-3 mt-1 text-center text-[10px] font-bold text-[#2563EB]">
          <button 
            onClick={() => showToast(`${propertyName} added to your comparisons matrix!`)}
            className="py-2 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            Compare
          </button>
          <button 
            onClick={handleDownload}
            className="py-2 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-center gap-1"
          >
            <Download size={10} />
            Download Pack
          </button>
        </div>
      </div>

      {/* 1. Proposal Request Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Request Space Proposal</h3>
              <button onClick={() => setShowProposalModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-slate-500 mb-2 font-medium">
                Submit your seat requirement for **{propertyName}** to auto-log a leasing lead.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Infy Labs Private Limited"
                  value={proposalForm.companyName}
                  onChange={(e) => setProposalForm({ ...proposalForm, companyName: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white text-slate-900 font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Seats Needed</label>
                <select 
                  value={proposalForm.seats}
                  onChange={(e) => setProposalForm({ ...proposalForm, seats: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="20">20 Seats (approx. 1,400 sq.ft)</option>
                  <option value="50">50 Seats (approx. 3,500 sq.ft)</option>
                  <option value="100">100 Seats (approx. 7,000 sq.ft)</option>
                  <option value="200">200 Seats (approx. 14,000 sq.ft)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. admin@infylabs.com"
                  value={proposalForm.email}
                  onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white text-slate-900 font-semibold"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmittingProposal}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all mt-2 cursor-pointer"
              >
                {isSubmittingProposal ? "Submitting Request..." : "Submit Proposal Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Schedule Site Visit</h3>
              <button onClick={() => setShowVisitModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleVisitSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-slate-500 mb-2 font-medium">
                Select a convenient date and time to inspect **{propertyName}** in person.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Date</label>
                <input 
                  type="date" 
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white text-slate-900 font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Time Slot</label>
                <select 
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="10:00">10:00 AM - 11:30 AM</option>
                  <option value="11:30">11:30 AM - 01:00 PM</option>
                  <option value="14:00">02:00 PM - 03:30 PM</option>
                  <option value="15:30">03:30 PM - 05:00 PM</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmittingVisit}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all mt-2 cursor-pointer"
              >
                {isSubmittingVisit ? "Scheduling Visit..." : "Schedule Site Visit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="fixed bottom-6 right-6 z-50 animate-float bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Action Buttons Panel */}
      <div className="premium-card p-6 border border-gray-200 bg-teal-50/50 flex flex-col gap-3">
        <button 
          onClick={() => setShowProposalModal(true)}
          className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FileText size={14} />
          Request Proposal
        </button>
        <button 
          onClick={() => setShowVisitModal(true)}
          className="w-full py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Calendar size={14} />
          Request Site Visit
        </button>
        <div className="grid grid-cols-2 gap-3 mt-1 text-center text-[10px] font-bold text-[#0F8B7D]">
          <button 
            onClick={() => showToast(`${propertyName} added to your comparisons matrix!`)}
            className="py-2 border border-teal-200 rounded-lg hover:bg-teal-50 cursor-pointer"
          >
            Compare
          </button>
          <button 
            onClick={handleDownload}
            className="py-2 border border-teal-200 rounded-lg hover:bg-teal-50 cursor-pointer flex items-center justify-center gap-1"
          >
            <Download size={10} />
            Download Pack
          </button>
        </div>
      </div>

      {/* 1. Proposal Request Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Request Space Proposal</h3>
              <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-gray-500 mb-2">
                Submit your seat requirement for **{propertyName}** to auto-log a leasing lead.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Infy Labs Private Limited"
                  value={proposalForm.companyName}
                  onChange={(e) => setProposalForm({ ...proposalForm, companyName: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-gray-900 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Estimated Seats Needed</label>
                <select 
                  value={proposalForm.seats}
                  onChange={(e) => setProposalForm({ ...proposalForm, seats: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-gray-900 font-medium"
                >
                  <option value="20">20 Seats (approx. 1,400 sq.ft)</option>
                  <option value="50">50 Seats (approx. 3,500 sq.ft)</option>
                  <option value="100">100 Seats (approx. 7,000 sq.ft)</option>
                  <option value="200">200 Seats (approx. 14,000 sq.ft)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. admin@infylabs.com"
                  value={proposalForm.email}
                  onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-gray-900 font-medium"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmittingProposal}
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all mt-2 cursor-pointer"
              >
                {isSubmittingProposal ? "Submitting Request..." : "Submit Proposal Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Schedule Site Visit</h3>
              <button onClick={() => setShowVisitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleVisitSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-gray-500 mb-2">
                Select a convenient date and time to inspect **{propertyName}** in person.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Preferred Date</label>
                <input 
                  type="date" 
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-gray-900 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Preferred Time Slot</label>
                <select 
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-white text-gray-900 font-medium"
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
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all mt-2 cursor-pointer"
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

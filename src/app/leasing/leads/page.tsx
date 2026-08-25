"use client";
import React, { useState } from "react";
import { Users, Mail, Phone, Calendar, ArrowRight, X, MessageSquare, Bell, Check } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState([
    { id: 1, name: "Suresh Gupta", company: "Zeta Payments", email: "suresh@zeta.in", phone: "+91 98765 43210", spaceNeed: "10,000 sq.ft", status: "Interested", history: ["Enquiry received via website"] },
    { id: 2, name: "David Miller", company: "Microsoft India", email: "david@microsoft.com", phone: "+91 88776 55443", spaceNeed: "25,000 sq.ft", status: "Site Visit Scheduled", history: ["Initial call completed", "Floor plan layout shared"] }
  ]);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [logComment, setLogComment] = useState("");
  const [newStatus, setNewStatus] = useState("Interested");
  const [notification, setNotification] = useState("");

  const handleLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logComment.trim()) {
      alert("Please enter a follow-up comment");
      return;
    }

    setLeads(leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          status: newStatus,
          history: [...l.history, logComment]
        };
      }
      return l;
    }));

    setNotification(`Successfully logged follow-up action for ${selectedLead.name}! Status updated to: ${newStatus}.`);
    setSelectedLead(null);
    setLogComment("");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads & Enquiries</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Track prospective client enquiries, workspace requirements, and follow-up activities.</p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 font-bold text-xs flex items-center gap-2 max-w-2xl animate-bounce">
          <Bell size={16} />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <div key={lead.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[220px] hover:border-blue-300 transition-colors shadow-sm">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{lead.name}</h3>
                  <span className="text-[10px] text-gray-500 font-bold block mt-0.5">{lead.company}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-extrabold uppercase tracking-wider">
                  {lead.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 text-xs text-gray-700">
                <span className="flex items-center gap-2"><Mail size={12} className="text-gray-400" /> {lead.email}</span>
                <span className="flex items-center gap-2"><Phone size={12} className="text-gray-400" /> {lead.phone}</span>
                <span className="font-bold text-gray-900 mt-1">Requirement: {lead.spaceNeed}</span>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedLead(lead); setNewStatus(lead.status); }}
              className="w-full mt-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Log Follow-up Action <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Follow-up Logger Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/35 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Follow-up Log Panel</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{selectedLead.name} ({selectedLead.company})</span>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs">
                {/* Timeline History */}
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Activity Timeline</label>
                  <div className="flex flex-col gap-2.5 max-h-[150px] overflow-y-auto pl-2 border-l border-gray-100">
                    {selectedLead.history.map((h: string, i: number) => (
                      <div key={i} className="relative pl-3 text-gray-600">
                        <span className="absolute left-[-13px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <p className="font-semibold">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleLogAction} className="flex flex-col gap-4 border-t border-gray-50 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Update Deal Stage</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="Interested">Interested</option>
                      <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                      <option value="LOI Negotiating">LOI Negotiating</option>
                      <option value="Closed (Won)">Closed (Won)</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Activity Comments</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Outlined pricing breakdown and parking ratio details with David."
                      value={logComment}
                      onChange={(e) => setLogComment(e.target.value)}
                      className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Save Follow-up Log <Check size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

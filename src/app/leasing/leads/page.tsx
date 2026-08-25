"use client";
import React, { useState } from "react";
import { Users, Mail, Phone, Calendar, ArrowRight } from "lucide-react";

export default function LeadsPage() {
  const [leads] = useState([
    { id: 1, name: "Suresh Gupta", company: "Zeta Payments", email: "suresh@zeta.in", phone: "+91 98765 43210", spaceNeed: "10,000 sq.ft", status: "Interested" },
    { id: 2, name: "David Miller", company: "Microsoft India", email: "david@microsoft.com", phone: "+91 88776 55443", spaceNeed: "25,000 sq.ft", status: "Site Visit Scheduled" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads & Enquiries</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Track prospective client enquiries, workspace requirements, and follow-up activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <div key={lead.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{lead.name}</h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">{lead.company}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  {lead.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 text-xs text-gray-700">
                <span className="flex items-center gap-2"><Mail size={12} className="text-gray-600" /> {lead.email}</span>
                <span className="flex items-center gap-2"><Phone size={12} className="text-gray-600" /> {lead.phone}</span>
                <span className="font-bold text-gray-900 mt-1">Requirement: {lead.spaceNeed}</span>
              </div>
            </div>

            <button className="w-full mt-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-all flex items-center justify-center gap-2">
              Log Follow-up Action <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

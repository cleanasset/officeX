"use client";
import React, { useState } from "react";
import { FolderOpen, ArrowRight } from "lucide-react";

export default function MatchedRFQs() {
  const [rfqs] = useState([
    { id: 1, title: "AC Compressor Overhaul", client: "Rajesh Kumar (Apex)", budget: "₹1,50,000", matchingReason: "Matches HVAC + Mumbai Location", deadline: "Sep 01, 2026" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Matched RFQs</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review service requests auto-matched to your corporate profile by category and region.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <FolderOpen size={16} className="text-emerald-600" />
                    {rfq.title}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Posted by: {rfq.client}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-extrabold">{rfq.budget}</span>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex flex-col gap-1">
                <span className="text-teal-600">Match Reason: {rfq.matchingReason}</span>
                <span>Deadline: {rfq.deadline}</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1">
              Submit Quotation <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

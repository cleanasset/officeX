"use client";
import React, { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";

export default function QuotationsPage() {
  const [quotes] = useState([
    { id: 1, vendor: "TechServe Solutions", rfq: "HVAC Maintenance - Apex", base: "₹1,20,000", gst: "₹21,600", gross: "₹1,41,600", status: "Awarded" },
    { id: 2, vendor: "SafeGuard Services", rfq: "Security Deployment - Nexus", base: "₹90,000", gst: "₹16,200", gross: "₹1,06,200", status: "Under Review" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Quotations</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review incoming vendor bids with standardized Base + 18% GST computations.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Vendor</th>
              <th className="py-4">Associated RFQ</th>
              <th className="py-4">Base Quote</th>
              <th className="py-4">GST (18%)</th>
              <th className="py-4">Gross Quote</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={14} className="text-[#0F8B7D]" />
                  {q.vendor}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{q.rfq}</td>
                <td className="py-4 text-gray-700 font-semibold">{q.base}</td>
                <td className="py-4 text-gray-700 font-semibold">{q.gst}</td>
                <td className="py-4 text-gray-900 font-extrabold text-[#0F8B7D]">{q.gross}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    q.status === "Awarded" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {q.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

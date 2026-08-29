"use client";
import React, { useState } from "react";
import { FolderOpen, Plus, Search, HelpCircle } from "lucide-react";

export default function RFQDirectory() {
  const [rfqs] = useState([
    { id: 1, title: "HVAC Maintenance - Apex Tower", category: "HVAC", property: "Apex Business Tower", status: "Open", bids: 3, budget: "₹1,50,000" },
    { id: 2, title: "Deep Cleaning Services - Wing B", category: "Cleaning", property: "Meridian Tech Park", status: "Closed", bids: 5, budget: "₹80,000" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">RFQ Directory</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Browse, post, and track all Request for Quotations (RFQs) created for property services.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md flex items-center gap-2">
          <Plus size={14} /> Create RFQ
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">RFQ Title</th>
              <th className="py-4">Service Category</th>
              <th className="py-4">Property</th>
              <th className="py-4">Est. Budget</th>
              <th className="py-4">Bids Recv</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((rfq) => (
              <tr key={rfq.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FolderOpen size={14} className="text-[#0F8B7D]" />
                  {rfq.title}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{rfq.category}</td>
                <td className="py-4 text-gray-700 font-semibold">{rfq.property}</td>
                <td className="py-4 text-gray-900 font-extrabold">{rfq.budget}</td>
                <td className="py-4 text-gray-700 font-semibold">{rfq.bids} Bids</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    rfq.status === "Open" ? "bg-emerald-600 text-white" : "bg-gray-600 text-white"
                  }`}>
                    {rfq.status}
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

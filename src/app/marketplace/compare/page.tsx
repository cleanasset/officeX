"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert, TrendingUp, Star, Award, CheckCircle, Bell } from "lucide-react";

export default function CompareQuotes() {
  const [vendors, setVendors] = useState([
    { 
      name: "TechServe Solutions", 
      base: "₹1,20,000", 
      gst: "18%", 
      gross: "₹1,41,600", 
      sla: "4 Hours", 
      rating: "4.8", 
      verified: true,
      priceScore: 18,
      slaScore: 17,
      capabilityScore: 19,
      qualityScore: 18,
      complianceScore: 19,
      totalScore: 91
    },
    { 
      name: "Apex MEP Services", 
      base: "₹1,35,000", 
      gst: "18%", 
      gross: "₹1,59,300", 
      sla: "2 Hours", 
      rating: "4.5", 
      verified: true,
      priceScore: 15,
      slaScore: 19,
      capabilityScore: 18,
      qualityScore: 17,
      complianceScore: 17,
      totalScore: 86
    },
    { 
      name: "Zeta Facilities", 
      base: "₹1,15,000", 
      gst: "18%", 
      gross: "₹1,35,700", 
      sla: "6 Hours", 
      rating: "3.9", 
      verified: false,
      priceScore: 19,
      slaScore: 14,
      capabilityScore: 15,
      qualityScore: 13,
      complianceScore: 13,
      totalScore: 74
    }
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAwardContract = (vendorName: string) => {
    showToast(`Work order contract successfully awarded to ${vendorName}! Preparing Razorpay Escrow pool setup.`);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quote Comparison Matrix</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Audit bids side-by-side on commercial pricing, SLA compliance, capability scores, and trust ratings.</p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4">Vendor Specifications</th>
                {vendors.map((v, idx) => (
                  <th key={idx} className="py-4 text-center text-xs font-black text-slate-900">{v.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Commercials */}
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900">Base Bid Quote</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-700">{v.base}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900">GST (18%)</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-550">{v.gst}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900">Gross Total Bid</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center font-black text-[#2563EB]">{v.gross}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900">SLA Resolution Limit</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-700">{v.sla}</td>
                ))}
              </tr>

              {/* Individual Category Scores out of 20 */}
              <tr className="border-b border-slate-100 text-xs font-semibold bg-slate-50/30">
                <td className="py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Weighted Scores (Max 20/category)</td>
                {vendors.map((_, idx) => (
                  <td key={idx} className="py-3"></td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">1. Commercial Price Score</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-750">{v.priceScore}/20</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">2. SLA Performance Score</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-750">{v.slaScore}/20</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">3. Technical Capability Score</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-750">{v.capabilityScore}/20</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">4. Quality Audit Score</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-750">{v.qualityScore}/20</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">5. Statutory Compliance Score</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-slate-750">{v.complianceScore}/20</td>
                ))}
              </tr>

              {/* Total Weighted Vendor Score */}
              <tr className="border-b border-slate-100 text-xs font-semibold bg-blue-50/20">
                <td className="py-4 font-black text-slate-950 flex items-center gap-1.5 pl-4">
                  <Award size={15} className="text-[#2563EB]" /> Total Weighted Score
                </td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center font-black text-sm text-[#2563EB]">{v.totalScore} / 100</td>
                ))}
              </tr>

              {/* Verification & Trust */}
              <tr className="border-b border-slate-100 text-xs font-semibold">
                <td className="py-4 font-bold text-slate-900 pl-4">GSTIN & License Check</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mx-auto inline-block ${
                      v.verified ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-650 border border-red-200"
                    }`}>
                      {v.verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Award Contract Actions */}
              <tr className="text-xs font-semibold">
                <td className="py-6 font-bold text-slate-900">Procurement Action</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-6 text-center">
                    <button
                      onClick={() => handleAwardContract(v.name)}
                      className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[10px] uppercase shadow-sm transition-colors cursor-pointer"
                    >
                      Award Work Order
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Check, X, ShieldAlert, TrendingUp } from "lucide-react";

export default function CompareQuotes() {
  const [vendors] = useState([
    { name: "TechServe Solutions", base: "₹1,20,000", gst: "18%", gross: "₹1,41,600", sla: "4 Hours", rating: "4.8 ★", verified: true },
    { name: "Apex MEP Services", base: "₹1,35,000", gst: "18%", gross: "₹1,59,300", sla: "2 Hours", rating: "4.5 ★", verified: true },
    { name: "Zeta Facilities", base: "₹1,15,000", gst: "18%", gross: "₹1,35,700", sla: "6 Hours", rating: "3.9 ★", verified: false }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quote Comparison Matrix</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit bids side-by-side on commercial pricing, safety parameters, and verified ratings.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4">Vendor Specifications</th>
                {vendors.map((v, idx) => (
                  <th key={idx} className="py-4 text-center">{v.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">Base Quote</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-700 font-semibold">{v.base}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">GST (18%)</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-700 font-semibold">{v.gst}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">Gross Total Quote</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-900 font-extrabold text-teal-600">{v.gross}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">SLA Resolution</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-700 font-semibold">{v.sla}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">Trust Rating</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center text-gray-900 font-bold text-amber-600">{v.rating}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs">
                <td className="py-4 font-bold text-gray-900">GSTIN Status</td>
                {vendors.map((v, idx) => (
                  <td key={idx} className="py-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider mx-auto inline-block ${
                      v.verified ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    }`}>
                      {v.verified ? "Verified" : "Unverified"}
                    </span>
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

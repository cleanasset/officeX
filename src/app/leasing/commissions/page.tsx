"use client";
import React, { useState } from "react";
import { DollarSign, ShieldAlert, Award } from "lucide-react";

export default function CommissionsPage() {
  const [commissions] = useState([
    { id: 1, broker: "Ravi Menon (OfficeX)", deal: "Razorpay Lease", dealValue: "₹4,20,00,000", percentage: "1.50%", payout: "₹6,30,000", status: "Settled" },
    { id: 2, broker: "Karan Johar (External)", deal: "Dharma Productions", dealValue: "₹80,00,000", percentage: "2.00%", payout: "₹1,60,000", status: "Pending Audit" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Broker Commission Tracker</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Track internal and channel partner payouts, deal calculations, and settlement status.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Broker / Agent</th>
              <th className="py-4">Closed Deal Space</th>
              <th className="py-4">Gross Contract Value</th>
              <th className="py-4">Rate (%)</th>
              <th className="py-4">Payout Value</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Award size={14} className="text-blue-500" />
                  {c.broker}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{c.deal}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.dealValue}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.percentage}</td>
                <td className="py-4 text-gray-900 font-extrabold text-blue-600">{c.payout}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    c.status === "Settled" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {c.status}
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

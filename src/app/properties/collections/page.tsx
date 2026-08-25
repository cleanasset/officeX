"use client";
import React, { useState } from "react";
import { DollarSign, CheckCircle2, Clock } from "lucide-react";

export default function CollectionsTracker() {
  const [collections] = useState([
    { id: 1, tenant: "TCS India", invoice: "INV-8021", month: "August 2026", amount: "₹20,35,000", status: "Paid" },
    { id: 2, tenant: "Razorpay Tech", invoice: "INV-8022", month: "August 2026", amount: "₹9,35,000", status: "Overdue" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rent Collections Tracker</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor billing collection metrics, incoming payments, and follow-up notices.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant</th>
              <th className="py-4">Invoice ID</th>
              <th className="py-4">Period</th>
              <th className="py-4">Invoice Amount</th>
              <th className="py-4">Collection Status</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((col) => (
              <tr key={col.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900">{col.tenant}</td>
                <td className="py-4 font-mono font-bold text-purple-600">{col.invoice}</td>
                <td className="py-4 text-gray-700 font-semibold">{col.month}</td>
                <td className="py-4 text-gray-900 font-extrabold">{col.amount}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    col.status === "Paid" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {col.status}
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

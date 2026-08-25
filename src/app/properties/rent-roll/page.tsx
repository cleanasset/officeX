"use client";
import React, { useState } from "react";
import { FileText, DollarSign } from "lucide-react";

export default function RentRoll() {
  const [rentroll] = useState([
    { id: 1, tenant: "TCS India", space: "Meridian Wing B", billingDay: "1st of Month", baseRent: "₹18,50,000", maintainFee: "₹1,85,000", totalDue: "₹20,35,000" },
    { id: 2, tenant: "Razorpay Tech", space: "Apex Floor 4", billingDay: "5th of Month", baseRent: "₹8,50,000", maintainFee: "₹85,000", totalDue: "₹9,35,000" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rent Roll Ledger</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit active tenant lease billings, base rentals, and maintenance maintenance calculations.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant Name</th>
              <th className="py-4">Lease Unit</th>
              <th className="py-4">Billing Day</th>
              <th className="py-4">Base Rent</th>
              <th className="py-4">CAM Charges</th>
              <th className="py-4">Total Gross Due</th>
            </tr>
          </thead>
          <tbody>
            {rentroll.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={14} className="text-purple-600" />
                  {row.tenant}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{row.space}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.billingDay}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.baseRent}</td>
                <td className="py-4 text-red-600 font-semibold">{row.maintainFee}</td>
                <td className="py-4 text-purple-600 font-extrabold">{row.totalDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { DollarSign, CheckCircle } from "lucide-react";

export default function VendorPayouts() {
  const [payments] = useState([
    { id: "TX-302", rfq: "AC Overhaul - Apex", total: "₹1,41,600", share: "₹1,27,440", commission: "₹14,160", status: "Held in Escrow" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Payouts Ledger</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review payment statuses, invoice submissions, and escrow release settlements.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Transaction ID</th>
              <th className="py-4">Work Order Reference</th>
              <th className="py-4">Gross Client Invoice</th>
              <th className="py-4">Platform Fee (10%)</th>
              <th className="py-4">Net Vendor Payout (90%)</th>
              <th className="py-4">Escrow Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold text-emerald-600">{p.id}</td>
                <td className="py-4 text-gray-900 font-bold">{p.rfq}</td>
                <td className="py-4 text-gray-700 font-semibold">{p.total}</td>
                <td className="py-4 text-red-600 font-semibold">{p.commission}</td>
                <td className="py-4 text-emerald-600 font-extrabold">{p.share}</td>
                <td className="py-4">
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    {p.status}
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

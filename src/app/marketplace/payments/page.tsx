"use client";
import React, { useState } from "react";
import { DollarSign, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function EscrowPayments() {
  const [txs, setTxs] = useState([
    { id: "TX-302", wo: "AC Overhaul", amount: "₹1,41,600", commission: "₹14,160", vendorShare: "₹1,27,440", status: "Held in Escrow" },
    { id: "TX-301", wo: "Elevator Inspection", amount: "₹60,000", commission: "₹6,000", vendorShare: "₹54,000", status: "Released" }
  ]);

  const [message, setMessage] = useState("");

  const handleRelease = (id: string) => {
    setTxs(txs.map(t => t.id === id ? { ...t, status: "Released" } : t));
    setMessage(`Funds successfully released for transaction ${id}! (90/10 split routed via Razorpay).`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments & Escrow</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review escrow balances, transaction splits, and trigger manual payouts releases.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tx ID</th>
              <th className="py-4">Work Order</th>
              <th className="py-4">Gross Amount</th>
              <th className="py-4">Commission (10%)</th>
              <th className="py-4">Vendor Payout (90%)</th>
              <th className="py-4">Escrow Status</th>
              <th className="py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-mono font-bold text-teal-600">{tx.id}</td>
                <td className="py-4 text-gray-900 font-bold">{tx.wo}</td>
                <td className="py-4 text-gray-700 font-semibold">{tx.amount}</td>
                <td className="py-4 text-red-600 font-extrabold">{tx.commission}</td>
                <td className="py-4 text-emerald-600 font-extrabold">{tx.vendorShare}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    tx.status === "Released" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-4">
                  {tx.status === "Held in Escrow" ? (
                    <button 
                      onClick={() => handleRelease(tx.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-[10px] hover:bg-teal-700 transition-colors flex items-center gap-1"
                    >
                      Release Payout <ArrowUpRight size={10} />
                    </button>
                  ) : (
                    <span className="text-gray-400 font-bold">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

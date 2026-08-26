"use client";
import React, { useState } from "react";
import { DollarSign, CheckCircle, X, Download, FileText, Clock, ArrowRight, Building, AlertTriangle, Send } from "lucide-react";

export default function VendorPayouts() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const payments = [
    {
      id: "TX-301",
      rfq: "Weekly Deep Cleaning — Meridian Tech Park",
      woId: "WO-802",
      client: "Vijay Dev (Facility Manager)",
      property: "Meridian Tech Park, Whitefield Bengaluru",
      total: "₹45,000",
      commission: "₹4,500",
      share: "₹40,500",
      status: "Released",
      releasedDate: "Aug 25, 2026",
      bankRef: "NEFT/UTR2026082545000",
      milestoneVerified: true,
      invoiceNo: "INV-2026-0045"
    },
    {
      id: "TX-302",
      rfq: "HVAC Chiller Overhaul — Apex Business Tower",
      woId: "WO-801",
      client: "Rajesh Kumar (Property Manager)",
      property: "Apex Business Tower, BKC Mumbai",
      total: "₹1,41,600",
      commission: "₹14,160",
      share: "₹1,27,440",
      status: "Held in Escrow",
      releasedDate: "—",
      bankRef: "Pending milestone sign-off",
      milestoneVerified: false,
      invoiceNo: "INV-2026-0046"
    },
    {
      id: "TX-303",
      rfq: "Fire Hydrant Pump Replacement — Crystal Tower",
      woId: "WO-804",
      client: "Dharma Estates",
      property: "Crystal Tower, OMR Chennai",
      total: "₹2,10,000",
      commission: "₹21,000",
      share: "₹1,89,000",
      status: "Held in Escrow",
      releasedDate: "—",
      bankRef: "Pending work order completion",
      milestoneVerified: false,
      invoiceNo: "INV-2026-0047"
    }
  ];

  return (
    <div className="flex flex-col gap-8 font-sans relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Payouts Ledger</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Review payment statuses, escrow balances, and invoice settlements. Click any row for full details.</p>
        </div>
        <button
          onClick={() => showToast("Full payout statement PDF downloaded.")}
          className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Download size={14} /> Download Statement PDF
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Lifetime Earnings</span>
          <span className="text-2xl font-extrabold text-gray-900 block mt-1">₹3,96,600</span>
          <span className="text-[10px] text-gray-500 font-medium">Across 3 completed & active work orders</span>
        </div>
        <div className="p-5 rounded-2xl bg-green-50 border border-green-100">
          <span className="text-[10px] text-green-600 font-bold uppercase block">Released to Bank (Net)</span>
          <span className="text-2xl font-extrabold text-green-700 block mt-1">₹40,500</span>
          <span className="text-[10px] text-gray-500 font-medium">After 10% platform commission deduction</span>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
          <span className="text-[10px] text-amber-600 font-bold uppercase block">Currently Held in Escrow</span>
          <span className="text-2xl font-extrabold text-amber-700 block mt-1">₹3,16,440</span>
          <span className="text-[10px] text-gray-500 font-medium">Pending milestone verifications & sign-offs</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
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
              <tr
                key={p.id}
                onClick={() => setSelectedPayment(p)}
                className="border-b border-gray-200 text-xs hover:bg-emerald-50/30 cursor-pointer transition-colors group"
              >
                <td className="py-4 font-mono font-bold text-emerald-600">{p.id}</td>
                <td className="py-4 text-gray-900 font-bold group-hover:text-emerald-700">{p.rfq}</td>
                <td className="py-4 text-gray-700 font-semibold">{p.total}</td>
                <td className="py-4 text-red-600 font-semibold">{p.commission}</td>
                <td className="py-4 text-emerald-600 font-extrabold">{p.share}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    p.status === "Released"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PAYMENT DETAIL MODAL ===== */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 flex flex-col gap-5 shadow-2xl animate-scale-up border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <DollarSign size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">{selectedPayment.id}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Invoice & Escrow Details</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedPayment.rfq}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Client</span>
                  <span className="font-bold text-gray-900">{selectedPayment.client}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Property</span>
                  <span className="font-bold text-gray-900">{selectedPayment.property}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Gross Invoice</span>
                  <span className="font-extrabold text-gray-900 text-sm">{selectedPayment.total}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <span className="text-[10px] text-red-500 font-bold uppercase block mb-1">Platform Fee</span>
                  <span className="font-bold text-red-600">{selectedPayment.commission}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Net Payout</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{selectedPayment.share}</span>
                </div>
              </div>

              {/* Bank Reference */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Bank Settlement Reference</span>
                <span className="font-bold text-gray-900 font-mono text-[11px]">{selectedPayment.bankRef}</span>
                {selectedPayment.releasedDate !== "—" && (
                  <span className="text-[10px] text-gray-500 block mt-0.5">Released on: {selectedPayment.releasedDate}</span>
                )}
              </div>

              {/* Invoice Number */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Invoice Number</span>
                  <span className="font-bold text-gray-900 font-mono">{selectedPayment.invoiceNo}</span>
                </div>
                <button
                  onClick={() => showToast(`Invoice ${selectedPayment.invoiceNo} downloaded as PDF.`)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={12} /> Download Invoice
                </button>
              </div>

              {/* Milestone Verification */}
              <div className={`p-3.5 rounded-xl border ${
                selectedPayment.milestoneVerified
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-amber-50 border-amber-100"
              }`}>
                <div className="flex items-center gap-2">
                  {selectedPayment.milestoneVerified
                    ? <CheckCircle size={14} className="text-emerald-600" />
                    : <AlertTriangle size={14} className="text-amber-600" />
                  }
                  <span className={`text-[10px] font-bold uppercase ${
                    selectedPayment.milestoneVerified ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {selectedPayment.milestoneVerified ? "Milestone Verified & Signed Off" : "Milestone Verification Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              {!selectedPayment.milestoneVerified && (
                <button
                  onClick={() => {
                    showToast(`Reminder sent to client for ${selectedPayment.id} escrow release.`);
                    setSelectedPayment(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Send size={14} /> Request Escrow Release
                </button>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

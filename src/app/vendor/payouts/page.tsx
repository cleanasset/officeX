"use client";
import React, { useState } from "react";
import { Plus, Filter, Download, ShieldCheck, CheckCircle } from "lucide-react";

export default function VendorInvoicesAndPayouts() {
  const [toast, setToast] = useState<string | null>(null);

  const kpis = [
    { label: "Total Invoiced", value: "₹26,20,000" },
    { label: "Platform Fee (10%)", value: "₹2,62,000" },
    { label: "Net Paid", value: "₹19,48,000", valColor: "text-emerald-700" },
    { label: "Held in Escrow", value: "₹4,10,000", valColor: "text-blue-600" }
  ];

  const invoices = [
    { no: "INV-102", wo: "WO-045", period: "Aug 2025", gross: "₹2,18,300", fee: "₹21,830", net: "₹1,96,470", date: "—", txId: "—", status: "In Escrow", isEscrow: true },
    { no: "INV-098", wo: "WO-032", period: "Jul 2025", gross: "₹1,50,000", fee: "₹15,000", net: "₹1,35,000", date: "05-Aug-2025", txId: "TXN-982410", status: "Paid" },
    { no: "INV-089", wo: "WO-028", period: "Jun 2025", gross: "₹42,000", fee: "₹4,200", net: "₹37,800", date: "12-Jul-2025", txId: "TXN-973541", status: "Paid" },
    { no: "INV-085", wo: "WO-025", period: "May 2025", gross: "₹1,20,000", fee: "₹12,000", net: "₹1,08,000", date: "02-Jun-2025", txId: "TXN-962145", status: "Paid" },
    { no: "INV-077", wo: "WO-022", period: "Apr 2025", gross: "₹2,18,300", fee: "₹21,830", net: "₹1,96,470", date: "04-May-2025", txId: "TXN-951236", status: "Paid" },
    { no: "INV-070", wo: "WO-018", period: "Mar 2025", gross: "₹1,85,000", fee: "₹18,500", net: "₹1,66,500", date: "05-Apr-2025", txId: "TXN-940327", status: "Paid" },
    { no: "INV-065", wo: "WO-015", period: "Feb 2025", gross: "₹2,18,300", fee: "₹21,830", net: "₹1,96,470", date: "06-Mar-2025", txId: "TXN-929418", status: "Paid" },
    { no: "INV-058", wo: "WO-012", period: "Jan 2025", gross: "₹1,50,000", fee: "₹15,000", net: "₹1,35,000", date: "05-Feb-2025", txId: "TXN-918509", status: "Paid" }
  ];

  const handleCreateInvoice = () => {
    setToast("Invoice generator initialized for active work order milestones!");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Invoices & Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your billing, track payouts, and view escrow status.</p>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={14} /> Create Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
            <p className={`text-3xl font-black mt-2 ${k.valColor || "text-gray-900"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Payout Model Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-900">Payout Model</p>
          <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
            Payouts are held in secure Razorpay escrow accounts and released automatically via Razorpay Route webhooks upon client verification of milestones.
          </p>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Invoice Ledger</h2>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Filter size={13} /> Filter
            </button>
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3">INVOICE NO</th>
                <th className="py-3">WO ID</th>
                <th className="py-3">PERIOD</th>
                <th className="py-3">GROSS AMOUNT</th>
                <th className="py-3">PLATFORM FEE</th>
                <th className="py-3">NET PAYOUT</th>
                <th className="py-3">PAID DATE</th>
                <th className="py-3">TRANSACTION ID</th>
                <th className="py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.no} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{inv.no}</td>
                  <td className="py-3.5 font-mono font-semibold text-blue-600">{inv.wo}</td>
                  <td className="py-3.5 text-gray-600">{inv.period}</td>
                  <td className="py-3.5 font-semibold text-gray-900">{inv.gross}</td>
                  <td className="py-3.5 text-red-500 font-semibold">{inv.fee}</td>
                  <td className="py-3.5 font-bold text-gray-900">{inv.net}</td>
                  <td className="py-3.5 text-gray-500">{inv.date}</td>
                  <td className="py-3.5 font-mono text-gray-500">{inv.txId}</td>
                  <td className="py-3.5 text-right">
                    {inv.isEscrow ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        In Escrow
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

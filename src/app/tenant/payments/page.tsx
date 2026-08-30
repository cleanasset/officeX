"use client";
import React, { useState } from "react";
import { CreditCard, Download, ShieldCheck, CheckCircle, X } from "lucide-react";

export default function RentPaymentGateway() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const invoice = {
    id: "INV-2025-0089",
    month: "September 2025",
    dueDate: "05-Sep-2025",
    baseRent: "₹1,70,000",
    maintenance: "₹15,000",
    gst: "₹6,000",
    parking: "₹34,380",
    total: "₹2,25,380"
  };

  const paymentHistory = [
    { month: "August 2025", invoice: "INV-2025-0078", amount: "₹2,25,380", paid: "04-Aug-2025", mode: "UPI", ref: "TXN-992834", status: "Completed" },
    { month: "July 2025", invoice: "INV-2025-0065", amount: "₹2,25,380", paid: "05-Jul-2025", mode: "NetBanking", ref: "TXN-884712", status: "Completed" },
    { month: "June 2025", invoice: "INV-2025-0052", amount: "₹2,25,380", paid: "03-Jun-2025", mode: "Card", ref: "TXN-773821", status: "Completed" },
    { month: "May 2025", invoice: "INV-2025-0041", amount: "₹2,25,380", paid: "04-May-2025", mode: "UPI", ref: "TXN-662910", status: "Completed" },
    { month: "April 2025", invoice: "INV-2025-0030", amount: "₹2,25,380", paid: "05-Apr-2025", mode: "NetBanking", ref: "TXN-551809", status: "Completed" },
    { month: "March 2025", invoice: "INV-2025-0019", amount: "₹2,25,380", paid: "02-Mar-2025", mode: "UPI", ref: "TXN-440798", status: "Completed" }
  ];

  const handlePay = () => {
    setShowPayModal(false);
    setToast("Payment of ₹2,25,380 processed successfully!");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Current Invoice */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
            <p className="text-xs text-gray-500">Month: {invoice.month}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500">{invoice.id}</p>
            <p className="text-xs font-bold text-red-500">Due Date: {invoice.dueDate}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-xs text-gray-600"><span>Base Rent</span><span className="font-semibold">{invoice.baseRent}</span></div>
          <div className="flex justify-between text-xs text-gray-600"><span>Maintenance</span><span className="font-semibold">{invoice.maintenance}</span></div>
          <div className="flex justify-between text-xs text-gray-600"><span>GST</span><span className="font-semibold">{invoice.gst}</span></div>
          <div className="flex justify-between text-xs text-gray-600"><span>Parking</span><span className="font-semibold">{invoice.parking}</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-sm font-bold text-gray-900">Total Due</span>
            <span className="text-2xl font-black text-purple-700">{invoice.total}</span>
          </div>
        </div>
        <button
          onClick={() => setShowPayModal(true)}
          className="w-full mt-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md cursor-pointer"
        >
          Pay Now
        </button>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Payment History</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">Month</th>
              <th className="py-3 pr-3">Invoice No</th>
              <th className="py-3 pr-3">Amount</th>
              <th className="py-3 pr-3">Paid Date</th>
              <th className="py-3 pr-3">Mode</th>
              <th className="py-3 pr-3">Ref</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((p) => (
              <tr key={p.ref} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{p.month}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.invoice}</td>
                <td className="py-3.5 pr-3 font-semibold text-gray-900">{p.amount}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.paid}</td>
                <td className="py-3.5 pr-3 text-gray-600">{p.mode}</td>
                <td className="py-3.5 pr-3 text-gray-500">{p.ref}</td>
                <td className="py-3.5 pr-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{p.status}</span>
                </td>
                <td className="py-3.5">
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer"><Download size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[420px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0F8B7D]" />
                <h3 className="text-lg font-bold text-gray-900">Secure Payment</h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 text-center mb-1">Paying OfficeX</p>
            <p className="text-3xl font-black text-gray-900 text-center mb-6">₹2,25,380</p>
            <div className="space-y-3 mb-4">
              <button onClick={handlePay} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#0F8B7D] hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-[#0F8B7D]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">UPI / QR Code</p>
                    <p className="text-[10px] text-gray-500">GooglePay, PhonePe, Paytm</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              <button onClick={handlePay} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#0F8B7D] hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-[#0F8B7D]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">Card</p>
                    <p className="text-[10px] text-gray-500">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              <button onClick={handlePay} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#0F8B7D] hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-[#0F8B7D]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">Netbanking</p>
                    <p className="text-[10px] text-gray-500">All Indian Banks</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">🔒 Secured by MockPay</p>
          </div>
        </div>
      )}
    </div>
  );
}

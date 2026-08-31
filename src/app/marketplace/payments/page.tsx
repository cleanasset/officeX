"use client";
import React, { useState } from "react";
import { Download, Lock, CheckCircle, Shield, ArrowRight, MoreVertical } from "lucide-react";

export default function PaymentsAndEscrowLedger() {
  const [selectedMonth, setSelectedMonth] = useState("This Month");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const kpis = [
    { label: "ESCROW HELD", value: "₹6.5L", icon: <Lock size={16} className="text-blue-500" /> },
    { label: "RELEASED", value: "₹18.2L", icon: <CheckCircle size={16} className="text-emerald-500" />, valColor: "text-emerald-700" },
    { label: "COMMISSION EARNED", value: "₹2.4L", icon: <Shield size={16} className="text-teal-500" />, valColor: "text-[#0F8B7D]" },
    { label: "PENDING VERIFICATION", value: "3", icon: "📋" }
  ];

  const initialTransactions = [
    { date: "22-Aug", inv: "INV-102", wo: "WO-045", vendor: "TechServe", gross: "₹2,18,300", comm: "₹21,830", net: "₹1,96,470", mode: "Razorpay Route", status: "Escrow Held", isEscrow: true },
    { date: "15-Aug", inv: "INV-098", wo: "WO-032", vendor: "CleanPro", gross: "₹1,50,000", comm: "₹15,000", net: "₹1,35,000", mode: "Razorpay Route", status: "Released" },
    { date: "10-Aug", inv: "INV-089", wo: "WO-028", vendor: "Rentokil", gross: "₹42,000", comm: "₹4,200", net: "₹37,800", mode: "Manual Payout", status: "Released" },
    { date: "05-Aug", inv: "INV-075", wo: "WO-021", vendor: "MEP Experts", gross: "₹1,20,000", comm: "₹12,000", net: "₹1,08,000", mode: "Razorpay Route", status: "Released" },
    { date: "02-Aug", inv: "INV-062", wo: "WO-018", vendor: "Spark Services", gross: "₹85,000", comm: "₹8,500", net: "₹76,500", mode: "Razorpay Route", status: "Released" },
    { date: "28-Jul", inv: "INV-055", wo: "WO-012", vendor: "Guardian Security", gross: "₹2,50,000", comm: "₹25,000", net: "₹2,25,000", mode: "Razorpay Route", status: "Released" },
    { date: "25-Jul", inv: "INV-049", wo: "WO-010", vendor: "BlueWater FM", gross: "₹60,000", comm: "₹6,000", net: "₹54,000", mode: "Manual Payout", status: "Released" },
    { date: "20-Jul", inv: "INV-038", wo: "WO-005", vendor: "TechServe", gross: "₹2,18,300", comm: "₹21,830", net: "₹1,96,470", mode: "Razorpay Route", status: "Released" }
  ];

  const [txList, setTxList] = useState(initialTransactions);

  const handleVerifyRelease = (inv: string, vendor: string) => {
    setTxList(prev => prev.map(t => {
      if (t.inv === inv) {
        return { ...t, status: "Released", isEscrow: false };
      }
      return t;
    }));
    setToast(`Escrow funds verified & released to ${vendor}! 90% payout processed.`);
    setTimeout(() => setToast(null), 3500);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Payments &amp; Escrow Ledger</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track escrow status, automated payouts, and platform commissions.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Q3 Total</option>
          </select>
          <button 
            onClick={() => showToast("Exported Escrow Report (.csv)")}
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl md:text-3xl font-black mt-1 ${k.valColor || "text-gray-900"}`}>{k.value}</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 flex items-center justify-center font-bold shrink-0">
              {k.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Escrow Flow Stepper Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-6">Escrow Flow</h2>
        <div className="relative flex items-center justify-between px-12 pb-4">
          <div className="absolute left-20 right-20 top-4 h-0.5 bg-gray-200 z-0" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center text-xs">
              📄
            </div>
            <span className="text-[11px] font-semibold text-gray-700 mt-2">Client pays invoice</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-xs">
              🛡️
            </div>
            <span className="text-[11px] font-bold text-blue-600 mt-2">Razorpay holds</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-xs">
              📋
            </div>
            <span className="text-[11px] font-semibold text-gray-700 mt-2">Milestone verified</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center text-xs">
              🔀
            </div>
            <span className="text-[11px] font-bold text-gray-900 mt-2">
              90% Vendor payout / 10%<br />OfficeX commission auto-split
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-6">DATE</th>
              <th className="py-3 px-4">INVOICE NO</th>
              <th className="py-3 px-4">WO ID</th>
              <th className="py-3 px-4">VENDOR</th>
              <th className="py-3 px-4">GROSS AMOUNT</th>
              <th className="py-3 px-4">PLATFORM FEE (10%)</th>
              <th className="py-3 px-4">NET PAYOUT</th>
              <th className="py-3 px-4">PAYMENT MODE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {txList.map((t) => (
              <tr key={t.inv} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-3.5 px-6 text-gray-500">{t.date}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{t.inv}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{t.wo}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-800">{t.vendor}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">{t.gross}</td>
                <td className="py-3.5 px-4 font-bold text-[#0F8B7D]">{t.comm}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{t.net}</td>
                <td className="py-3.5 px-4 text-gray-600">{t.mode}</td>
                <td className="py-3.5 px-4">
                  {t.isEscrow ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Escrow Held
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Released
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-right">
                  {t.isEscrow ? (
                    <button
                      onClick={() => handleVerifyRelease(t.inv, t.vendor)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Verify &amp; Release
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600">✓ Paid</span>
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

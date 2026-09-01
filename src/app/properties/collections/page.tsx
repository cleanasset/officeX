"use client";
import React, { useState } from "react";
import { Search, Filter, Calendar, Send, FileText, CheckCircle } from "lucide-react";

export default function RentCollectionTracker() {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [toast, setToast] = useState<string | null>(null);

  const kpis = [
    { label: "Total Invoiced", value: "₹52L", sub: "" },
    { label: "Total Collected", value: "₹48.5L", sub: "93.3%", bar: 93.3 },
    { label: "Outstanding", value: "₹3.5L", sub: "" },
    { label: "Overdue (>15d)", value: "₹1.5L", sub: "", alert: true }
  ];

  const invoices = [
    { id: "INV-089", tenant: "TCS", property: "Apex Tower", amount: "₹1,47,500", due: "05-Aug", paid: "03-Aug", mode: "UPI (Razorpay)", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "INV-090", tenant: "Wipro", property: "Meridian Park", amount: "₹84,960", due: "05-Aug", paid: "12-Aug", mode: "Bank Payout", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "INV-091", tenant: "Deloitte", property: "Crystal Tower", amount: "₹1,29,800", due: "05-Aug", paid: "—", mode: "—", status: "Overdue >15d", stClass: "bg-red-50 text-red-600 border-red-200 font-bold" },
    { id: "INV-092", tenant: "Freshworks", property: "Nexus Hub", amount: "₹53,100", due: "05-Aug", paid: "04-Aug", mode: "Netbanking", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "INV-093", tenant: "Accenture", property: "Summit One", amount: "₹94,400", due: "05-Aug", paid: "—", mode: "—", status: "Partial Paid", stClass: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "INV-094", tenant: "Zoho", property: "Nexus Hub", amount: "₹62,000", due: "05-Aug", paid: "06-Aug", mode: "UPI (Razorpay)", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "INV-095", tenant: "HCL", property: "Summit One", amount: "₹1,12,000", due: "05-Aug", paid: "10-Aug", mode: "Bank Transfer", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "INV-096", tenant: "Infosys", property: "Apex Tower", amount: "₹2,10,000", due: "05-Aug", paid: "01-Aug", mode: "Netbanking", status: "Paid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  ];

  const handleReminder = () => {
    setToast("Automated payment reminder dispatched to Deloitte finance team!");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rent Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time ledger of tenant billing, collections, and overdue accounts.</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
        >
          <option>August 2025</option>
          <option>July 2025</option>
          <option>June 2025</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm ${
              k.alert ? "border-l-4 border-l-red-500 border-red-200" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
              {k.sub && (
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                  {k.sub}
                </span>
              )}
            </div>
            <p className={`text-3xl font-black mt-2 ${k.alert ? "text-red-500" : "text-gray-900"}`}>
              {k.value}
            </p>
            {k.bar && (
              <div className="w-full h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${k.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collections Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">August Collections</h2>
          <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
            <Filter size={13} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3">INVOICE ID</th>
                <th className="py-3">TENANT</th>
                <th className="py-3">PROPERTY</th>
                <th className="py-3">AMOUNT BILLED</th>
                <th className="py-3">DUE DATE</th>
                <th className="py-3">PAYMENT DATE</th>
                <th className="py-3">PAYMENT MODE</th>
                <th className="py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 font-mono text-gray-500">{inv.id}</td>
                  <td className="py-3.5 font-bold text-gray-900">{inv.tenant}</td>
                  <td className="py-3.5 text-gray-600">{inv.property}</td>
                  <td className="py-3.5 font-bold text-gray-900">{inv.amount}</td>
                  <td className="py-3.5 text-gray-500">{inv.due}</td>
                  <td className="py-3.5 text-gray-500">{inv.paid}</td>
                  <td className="py-3.5 text-gray-600">{inv.mode}</td>
                  <td className="py-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${inv.stClass}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Payment Mode Breakdown + Outstanding Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Payment Mode Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">Payment Mode Breakdown</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 w-32">Razorpay Online</span>
              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: "72%" }} />
              </div>
              <span className="font-bold text-gray-900">72%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 w-32">Bank Transfer</span>
              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: "23%" }} />
              </div>
              <span className="font-bold text-gray-900">23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 w-32">Cheque</span>
              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-200 rounded-full" style={{ width: "5%" }} />
              </div>
              <span className="font-bold text-gray-900">5%</span>
            </div>
          </div>
        </div>

        {/* Outstanding Follow-ups */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <h2 className="text-base font-bold text-gray-900">Outstanding Follow-ups</h2>

          <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-900">
                Deloitte <span className="text-gray-400 font-normal">(INV-091)</span>
              </p>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                17 Days Overdue
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Crystal Tower</p>
            <p className="text-lg font-black text-gray-900 mt-2">₹1,29,800</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReminder}
              className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send size={13} /> Send Reminder
            </button>
            <button
              onClick={() => {
                setToast("Manual payment entry opened!");
                setTimeout(() => setToast(null), 3000);
              }}
              className="py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText size={13} /> Log Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

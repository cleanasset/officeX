"use client";

import React, { useState } from "react";
import { DollarSign, CheckCircle2, Clock, Plus, ShieldCheck, AlertTriangle, Coins, Lock, Unlock, X } from "lucide-react";

export default function CollectionsTracker() {
  const [invoices, setInvoices] = useState([
    { id: 1, tenant: "TCS India", invoice: "INV-8021", period: "August 2026", amount: 2035000, remaining: 0, status: "Paid" },
    { id: 2, tenant: "Razorpay Tech", invoice: "INV-8022", period: "August 2026", amount: 935000, remaining: 935000, status: "Overdue" },
    { id: 3, tenant: "Paytm Services", invoice: "INV-8019", period: "July 2026", amount: 250000, remaining: 250000, status: "Overdue" },
    { id: 4, tenant: "Larsen & Toubro", invoice: "INV-7998", period: "May 2026", amount: 110000, remaining: 110000, status: "Overdue" }
  ]);

  const [unallocatedReceipts, setUnallocatedReceipts] = useState([
    { id: 1, tenant: "Wipro Logistics", receiptNo: "RCP-1192", amount: 450000, date: "Aug 25, 2026", status: "Unallocated" }
  ]);

  const [isLocked, setIsLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    tenant: "Razorpay Tech",
    amount: "",
    allocateInvoice: "INV-8022",
    receiptNo: `RCP-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      alert("COMPLIANCE BLOCK: The current accounting period is LOCKED. No receipts can be recorded.");
      return;
    }

    const payAmt = Number(form.amount);
    if (!payAmt || payAmt <= 0) {
      alert("Please enter a valid received amount.");
      return;
    }

    if (form.allocateInvoice === "None") {
      // Create unallocated receipt
      const newReceipt = {
        id: unallocatedReceipts.length + 1,
        tenant: form.tenant,
        receiptNo: form.receiptNo,
        amount: payAmt,
        date: "Today",
        status: "Unallocated"
      };
      setUnallocatedReceipts([...unallocatedReceipts, newReceipt]);
      showToast(`Logged ₹${payAmt.toLocaleString()} as Unallocated Cash Receipt: ${form.receiptNo}`);
    } else {
      // Allocate to selected invoice
      setInvoices(invoices.map((inv) => {
        if (inv.invoice === form.allocateInvoice) {
          const nextRemaining = Math.max(0, inv.remaining - payAmt);
          let nextStatus = inv.status;
          
          if (nextRemaining === 0) {
            nextStatus = "Paid";
          } else {
            nextStatus = "Partially Paid";
          }

          const allocated = inv.remaining - nextRemaining;
          const excess = payAmt - allocated;

          // If there is excess payment, allocate remaining to unallocated receipts
          if (excess > 0) {
            const excessReceipt = {
              id: unallocatedReceipts.length + 1,
              tenant: inv.tenant,
              receiptNo: `RCP-EX-${Math.floor(1000 + Math.random() * 9000)}`,
              amount: excess,
              date: "Today",
              status: "Unallocated Excess"
            };
            setTimeout(() => {
              setUnallocatedReceipts(prev => [...prev, excessReceipt]);
            }, 10);
          }

          return {
            ...inv,
            remaining: nextRemaining,
            status: nextStatus
          };
        }
        return inv;
      }));

      showToast(`Recorded payment allocation of ₹${payAmt.toLocaleString()} against ${form.allocateInvoice}`);
    }

    setIsRecording(false);
    setForm({
      tenant: "Razorpay Tech",
      amount: "",
      allocateInvoice: "INV-8022",
      receiptNo: `RCP-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  // Aged Receivables calculation details
  // INV-8022 (August, 15 days past due) -> 0-30 Days
  // INV-8019 (July, 45 days past due) -> 31-60 Days
  // INV-7998 (May, 110 days past due) -> 90+ Days
  const ageing_0_30 = invoices.filter(i => i.invoice === "INV-8022").reduce((sum, i) => sum + i.remaining, 0);
  const ageing_31_60 = invoices.filter(i => i.invoice === "INV-8019").reduce((sum, i) => sum + i.remaining, 0);
  const ageing_61_90 = 0;
  const ageing_90_plus = invoices.filter(i => i.invoice === "INV-7998").reduce((sum, i) => sum + i.remaining, 0);
  const totalReceivables = ageing_0_30 + ageing_31_60 + ageing_61_90 + ageing_90_plus;

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rent Collections Tracker</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Monitor billing collection metrics, incoming payments, and follow-up notices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsLocked(!isLocked);
              showToast(isLocked ? "Accounting period reopened." : "Monthly accounting period locked successfully.");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors ${
              isLocked 
                ? "bg-red-650 hover:bg-red-700 text-white" 
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {isLocked ? "Period Locked" : "Lock Accounting Period"}
          </button>
          <button 
            onClick={() => setIsRecording(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0d7569] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* AGED RECEIVABLES TRACKER WIDGET */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Aged Receivables Ledger Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[9px] text-slate-450 font-bold uppercase block mb-1">0–30 Days (Current)</span>
            <span className="text-base font-extrabold text-slate-950">₹{ageing_0_30.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[9px] text-slate-450 font-bold uppercase block mb-1">31–60 Days Overdue</span>
            <span className="text-base font-extrabold text-amber-600">₹{ageing_31_60.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[9px] text-slate-450 font-bold uppercase block mb-1">61–90 Days Overdue</span>
            <span className="text-base font-extrabold text-red-500">₹{ageing_61_90.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="text-[9px] text-slate-450 font-bold uppercase block mb-1">90+ Days Overdue</span>
            <span className="text-base font-extrabold text-red-750">₹{ageing_90_plus.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/50 col-span-2 md:col-span-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Total Outstanding</span>
            <span className="text-base font-black text-[#0F8B7D]">₹{totalReceivables.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Invoices Collections</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant</th>
              <th className="py-4">Invoice ID</th>
              <th className="py-4">Billing Period</th>
              <th className="py-4">Invoice Amount</th>
              <th className="py-4">Remaining Balance</th>
              <th className="py-4">Collection Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((col) => (
              <tr key={col.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50 transition-colors font-semibold">
                <td className="py-4 font-bold text-gray-900">{col.tenant}</td>
                <td className="py-4 font-mono font-bold text-purple-650">{col.invoice}</td>
                <td className="py-4 text-gray-700 font-semibold">{col.period}</td>
                <td className="py-4 text-gray-900 font-extrabold">₹{col.amount.toLocaleString()}</td>
                <td className="py-4 font-bold text-slate-700">₹{col.remaining.toLocaleString()}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    col.status === "Paid" 
                      ? "bg-emerald-50 border border-emerald-250 text-emerald-700" 
                      : col.status === "Partially Paid"
                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "bg-red-50 border border-red-200 text-red-650"
                  }`}>
                    {col.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unallocated Cash ledger table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Coins size={14} className="text-[#0F8B7D]" />
          Unallocated Cash Receipts Ledger (UAT-031)
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3">Tenant Name</th>
              <th className="py-3">Receipt ID</th>
              <th className="py-3">Received Date</th>
              <th className="py-3">Unallocated Amount</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {unallocatedReceipts.map((rc) => (
              <tr key={rc.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition-colors font-semibold">
                <td className="py-3 font-bold text-slate-900">{rc.tenant}</td>
                <td className="py-3 font-mono font-bold text-purple-650">{rc.receiptNo}</td>
                <td className="py-3 text-slate-500">{rc.date}</td>
                <td className="py-3 font-black text-slate-900">₹{rc.amount.toLocaleString()}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black uppercase">
                    {rc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record payment modal */}
      {isRecording && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleRecordPayment}
            className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-2xl border border-slate-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Record Collection Receipt</h3>
              <button 
                type="button"
                onClick={() => setIsRecording(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isLocked && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={14} className="text-red-700" />
                <span>Period Locked. Reopen accounting period to register.</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Tenant</label>
                <select
                  value={form.tenant}
                  onChange={(e) => {
                    const t = e.target.value;
                    const defaultInv = t === "Razorpay Tech" ? "INV-8022" : t === "Paytm Services" ? "INV-8019" : "None";
                    setForm({ ...form, tenant: t, allocateInvoice: defaultInv });
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer"
                >
                  <option value="Razorpay Tech">Razorpay Tech</option>
                  <option value="Paytm Services">Paytm Services</option>
                  <option value="Wipro Logistics">Wipro Logistics</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Received Receipt Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 600000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Allocate to Invoice</label>
                <select
                  value={form.allocateInvoice}
                  onChange={(e) => setForm({ ...form, allocateInvoice: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer"
                >
                  {form.tenant === "Razorpay Tech" && <option value="INV-8022">INV-8022 (₹9,35,000)</option>}
                  {form.tenant === "Paytm Services" && <option value="INV-8019">INV-8019 (₹2,50,000)</option>}
                  <option value="None">None (Log as Unallocated cash balance)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-gray-650 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLocked}
                className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0d7569] text-white font-bold rounded-lg text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                Record Receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

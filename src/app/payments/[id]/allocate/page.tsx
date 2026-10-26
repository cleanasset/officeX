"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
  Building,
  Sparkles,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

interface OpenInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  gross_total: string;
  amount_paid: string;
  balance_due: string;
  status: string;
}

interface ExistingAlloc {
  id: string;
  invoice_id: string;
  amount_allocated_inr: string;
  invoice_number: string;
  allocation_date: string;
  notes: string;
}

export default function PaymentAllocationPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [openInvoices, setOpenInvoices] = useState<OpenInvoice[]>([]);
  const [existingAllocs, setExistingAllocs] = useState<ExistingAlloc[]>([]);
  const [allocInputs, setAllocInputs] = useState<Record<string, number>>({});
  const [remainingAction, setRemainingAction] = useState<"on_account_credit" | "refund_request">("on_account_credit");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      loadAllocationData();
    }
  }, [paymentId]);

  async function loadAllocationData() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/payments/${paymentId}/allocate`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load payment details");

      setPaymentData(json.payment);
      setOpenInvoices(json.open_invoices || []);
      setExistingAllocs(json.existing_allocations || []);

      // Initialize inputs with 0
      const initial: Record<string, number> = {};
      (json.open_invoices || []).forEach((inv: OpenInvoice) => {
        initial[inv.id] = 0;
      });
      setAllocInputs(initial);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const paymentTotal = parseFloat(paymentData?.amount_inr || "0");
  const alreadyAllocated = existingAllocs.reduce(
    (sum, a) => sum + parseFloat(a.amount_allocated_inr || "0"),
    0
  );
  const availableToAllocate = Math.max(0, paymentTotal - alreadyAllocated);

  const currentAllocationTotal = Object.values(allocInputs).reduce((s, v) => s + (v || 0), 0);
  const remainingAfterCurrent = Math.max(0, availableToAllocate - currentAllocationTotal);

  // FIFO Rule 18 Auto Allocation (Oldest Due First)
  function handleAutoAllocateOldest() {
    let rem = availableToAllocate;
    const newInputs: Record<string, number> = {};

    // Sort invoices by due_date ASC
    const sorted = [...openInvoices].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    for (const inv of sorted) {
      const bal = parseFloat(inv.balance_due || "0");
      if (rem > 0 && bal > 0) {
        const allocAmt = Math.min(rem, bal);
        newInputs[inv.id] = Math.round(allocAmt * 100) / 100;
        rem -= allocAmt;
      } else {
        newInputs[inv.id] = 0;
      }
    }
    setAllocInputs(newInputs);
  }

  function handleInputChange(invId: string, val: string, maxBal: number) {
    const num = parseFloat(val) || 0;
    const clamped = Math.min(Math.max(0, num), maxBal);
    setAllocInputs((prev) => ({ ...prev, [invId]: clamped }));
  }

  function handleQuickPayInvoice(invId: string, maxBal: number) {
    const currentWithoutThis = currentAllocationTotal - (allocInputs[invId] || 0);
    const roomLeft = Math.max(0, availableToAllocate - currentWithoutThis);
    const toAlloc = Math.min(maxBal, roomLeft);
    setAllocInputs((prev) => ({ ...prev, [invId]: Math.round(toAlloc * 100) / 100 }));
  }

  async function handleSaveAllocation() {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const allocationsToSend = Object.entries(allocInputs)
        .filter(([_, amt]) => amt > 0.001)
        .map(([invId, amt]) => ({
          invoice_id: invId,
          amount_allocated: amt,
          notes: "Allocated via S-44 Allocation Screen",
        }));

      if (allocationsToSend.length === 0) {
        alert("Please allocate at least one invoice amount or click Auto-Allocate.");
        return;
      }

      if (currentAllocationTotal > availableToAllocate + 0.01) {
        alert("Allocated total exceeds available payment balance!");
        return;
      }

      const res = await fetch(`/api/payments/${paymentId}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allocations: allocationsToSend,
          remaining_action: remainingAction,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to commit allocations");

      alert(json.message || "Allocations committed successfully!");
      router.push("/operate/payments");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save allocation");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0F8B7D] mb-3" />
        <p className="text-sm font-semibold">Loading payment allocation workbench...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-6 pb-28 md:pb-16 max-w-6xl mx-auto space-y-5">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/operate/payments"
              className="text-xs text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Payments Register</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-[#0F8B7D] uppercase tracking-wider">
              FIFO Allocation Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            Allocate Payment: {paymentData?.payment_code}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Reference: <span className="font-mono font-bold text-gray-700">{paymentData?.payment_ref}</span> &middot; Method: <span className="font-semibold uppercase text-gray-700">{paymentData?.payment_mode}</span> &middot; Date: {paymentData?.payment_date}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoAllocateOldest}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} />
            <span>Auto: Oldest Due (Rule 18)</span>
          </button>
          <button
            onClick={() => {
              const reset: Record<string, number> = {};
              openInvoices.forEach((i) => (reset[i.id] = 0));
              setAllocInputs(reset);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* S-44 Top Financial Control Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Amount</span>
          <span className="text-base sm:text-lg font-black text-gray-900 mt-0.5 block">
            ₹{paymentTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Already Allocated</span>
          <span className="text-base sm:text-lg font-black text-gray-700 mt-0.5 block">
            ₹{alreadyAllocated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-teal-200 bg-teal-50/30 shadow-2xs">
          <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider block">Allocating Now</span>
          <span className="text-base sm:text-lg font-black text-[#0F8B7D] mt-0.5 block">
            ₹{currentAllocationTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Remaining Unallocated</span>
          <span
            className={`text-base sm:text-lg font-black mt-0.5 block ${
              remainingAfterCurrent > 0 ? "text-amber-600" : "text-emerald-700"
            }`}
          >
            ₹{remainingAfterCurrent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Existing Allocations List (if any) */}
      {existingAllocs.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Committed Allocations on this Payment</span>
          </h3>
          <div className="space-y-1.5">
            {existingAllocs.map((ea) => (
              <div
                key={ea.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-800">{ea.invoice_number || ea.invoice_id}</span>
                  <span className="text-gray-400">&middot;</span>
                  <span className="text-gray-500">{ea.allocation_date}</span>
                  {ea.notes && <span className="text-gray-400 text-[11px]">({ea.notes})</span>}
                </div>
                <span className="font-bold text-emerald-700 font-mono">
                  +₹{parseFloat(ea.amount_allocated_inr).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices List to Allocate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-gray-900 tracking-tight">Open Invoices for Occupant</h2>
            <p className="text-xs text-gray-500">
              Select or type the amount to distribute from this payment. Server validates that allocation ≤ balance due.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {openInvoices.length} unpaid / partial invoice(s)
          </span>
        </div>

        {openInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-gray-700">No Open Invoices Found</p>
            <p className="text-xs text-gray-500 mt-1">
              All issued invoices for this occupant have already been fully paid.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-gray-500 font-bold border-b border-gray-200">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Gross Total</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                    <th className="py-2.5 px-3 text-right w-44">Allocate (₹)</th>
                    <th className="py-2.5 px-3 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {openInvoices.map((inv) => {
                    const bal = parseFloat(inv.balance_due || "0");
                    const currentAlloc = allocInputs[inv.id] || 0;
                    const isDuePast = new Date(inv.due_date) < new Date();

                    return (
                      <tr key={inv.id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-gray-900">{inv.invoice_number}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">{inv.invoice_date}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              isDuePast ? "text-rose-600 font-bold" : "text-gray-600"
                            }`}
                          >
                            {inv.due_date}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">
                          ₹{parseFloat(inv.gross_total || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                          ₹{bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              max={bal}
                              step="any"
                              value={currentAlloc || ""}
                              placeholder="0.00"
                              onChange={(e) => handleInputChange(inv.id, e.target.value, bal)}
                              className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F8B7D] focus:border-[#0F8B7D] text-right font-mono font-bold text-xs"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickPayInvoice(inv.id, bal)}
                            className="text-[11px] font-bold text-[#0F8B7D] hover:underline"
                          >
                            Fill Max
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (<sm) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {openInvoices.map((inv) => {
                const bal = parseFloat(inv.balance_due || "0");
                const currentAlloc = allocInputs[inv.id] || 0;
                const isDuePast = new Date(inv.due_date) < new Date();

                return (
                  <div key={inv.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-gray-900 text-xs">{inv.invoice_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDuePast ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Due {inv.due_date}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Total</span>
                        <span className="font-mono text-gray-600">
                          ₹{parseFloat(inv.gross_total || "0").toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Outstanding</span>
                        <span className="font-mono font-bold text-gray-900">
                          ₹{bal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={bal}
                          step="any"
                          value={currentAlloc || ""}
                          placeholder="0.00"
                          onChange={(e) => handleInputChange(inv.id, e.target.value, bal)}
                          className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F8B7D] focus:border-[#0F8B7D] text-right font-mono font-bold text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickPayInvoice(inv.id, bal)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* S-44 Bottom Control: Treatment of Remaining Amount */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Treatment of Remaining Unallocated Amount
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
            <input
              type="radio"
              name="remaining_action"
              value="on_account_credit"
              checked={remainingAction === "on_account_credit"}
              onChange={() => setRemainingAction("on_account_credit")}
              className="text-[#0F8B7D] focus:ring-[#0F8B7D]"
            />
            <span>(o) Retain as On-Account Credit for future invoices</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
            <input
              type="radio"
              name="remaining_action"
              value="refund_request"
              checked={remainingAction === "refund_request"}
              onChange={() => setRemainingAction("refund_request")}
              className="text-[#0F8B7D] focus:ring-[#0F8B7D]"
            />
            <span>( ) Create Refund Request to Occupant bank account</span>
          </label>
        </div>
      </div>

      {/* S-44 Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link
          href="/operate/payments"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition text-center"
        >
          Cancel &amp; Back
        </Link>

        <button
          onClick={handleSaveAllocation}
          disabled={submitting || currentAllocationTotal <= 0}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Committing Allocation...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              <span>Save &amp; Commit Allocation (₹{currentAllocationTotal.toLocaleString("en-IN")})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

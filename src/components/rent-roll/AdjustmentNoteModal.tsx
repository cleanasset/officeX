"use client";

import React, { useState } from "react";
import { X, FileText, CheckCircle2, AlertCircle, Percent } from "lucide-react";
import { InvoiceItem } from "./InvoicesTab";
import { formatINR } from "./DashboardTab";

interface AdjustmentNoteModalProps {
  invoice: InvoiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustmentNoteModal: React.FC<AdjustmentNoteModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [noteType, setNoteType] = useState<"credit_note" | "debit_note">("credit_note");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("Annual CAM reconciliation true-up (Section 8)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const numAmount = parseFloat(amount) || 0;
  const gstAmount = Math.round(numAmount * 0.18);
  const totalAdjustment = numAmount + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError("Please enter a valid adjustment amount");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_adjustment_note",
          invoiceId: invoice.id,
          noteType,
          amount: numAmount,
          gstRate: 18,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create adjustment note");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to issue adjustment note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Issue Statutory Adjustment Note</h3>
              <p className="text-xs text-slate-300 font-medium">
                GST Credit Note / Debit Note (Section 8 · RR-BIL-08)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Invoice Context */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Target Invoice:</span>
              <span className="font-mono font-bold text-indigo-700">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Tenant:</span>
              <span className="font-bold text-gray-900">{invoice.tenantName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Gross Value:</span>
              <span className="font-mono font-bold text-gray-900">{formatINR(invoice.grossTotal)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Current Balance Due:</span>
              <span className="font-mono font-black text-rose-600">{formatINR(invoice.balanceDue)}</span>
            </div>
          </div>

          {/* Note Type Toggle */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Adjustment Type (RR-BIL-08)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNoteType("credit_note")}
                className={`p-3 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer ${
                  noteType === "credit_note"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-black">Credit Note (CN)</div>
                <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                  Reduces tenant receivables balance
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoteType("debit_note")}
                className={`p-3 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer ${
                  noteType === "debit_note"
                    ? "border-amber-600 bg-amber-50 text-amber-950"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-black">Debit Note (DN)</div>
                <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                  Increases tenant billable amount
                </div>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Adjustment Base Amount (₹ excl. GST)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0F8B7D]"
              required
            />
          </div>

          {/* GST and Total calculation preview */}
          {numAmount > 0 && (
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Base:</span>
                <span>{formatINR(numAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST @ 18% (CGST 9% + SGST 9%):</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-950 pt-1 border-t border-teal-200">
                <span>Total Adjustment Note:</span>
                <span className="text-[#0F8B7D]">{formatINR(totalAdjustment)}</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Statutory Reason / Notes
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. CAM true-up or area correction"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#0F8B7D]"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="px-5 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Issuing..." : `Issue ${noteType === "credit_note" ? "Credit Note" : "Debit Note"}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

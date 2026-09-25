"use client";

import React, { useState } from "react";
import { X, Receipt, CheckCircle2, Split, Layers, Calendar, AlertCircle } from "lucide-react";

interface BillingRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeLeasesCount: number;
}

export const BillingRunModal: React.FC<BillingRunModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activeLeasesCount,
}) => {
  const [billingMonth, setBillingMonth] = useState("October 2026");
  const [invoiceType, setInvoiceType] = useState<"separate" | "consolidated">("separate");
  const [dueDate, setDueDate] = useState("2026-10-15");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingMonth,
          dueDate,
          invoiceType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate invoices");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to run billing cycle");
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
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Run Monthly Billing Cycle</h3>
              <p className="text-xs text-slate-300 font-medium">
                Automated GST Tax Invoicing (Section 8 · RR-BIL-01)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-extrabold text-teal-950">Active Portfolio Leases</div>
              <div className="text-[11px] text-teal-700 font-medium">Eligible for current billing run</div>
            </div>
            <span className="text-base font-black text-[#0F8B7D] bg-white px-3 py-1 rounded-xl border border-teal-200 shadow-2xs">
              {activeLeasesCount} Leases
            </span>
          </div>

          {/* Billing Month */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Billing Period
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
              >
                <option value="October 2026">October 2026 (Current Cycle)</option>
                <option value="November 2026">November 2026 (Advance Cycle)</option>
                <option value="December 2026">December 2026</option>
              </select>
            </div>
          </div>

          {/* Invoice Structure (Multi-Invoice vs Consolidated) */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Invoice Structure (RR-BIL-01 / RR-BIL-02)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  invoiceType === "separate"
                    ? "border-[#0F8B7D] bg-teal-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900">Separate Invoices</span>
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === "separate"}
                    onChange={() => setInvoiceType("separate")}
                    className="accent-[#0F8B7D]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Individual Tax Invoices for Base Rent and CAM (Separates TDS 194-I)
                </p>
              </label>

              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  invoiceType === "consolidated"
                    ? "border-[#0F8B7D] bg-teal-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900">Consolidated</span>
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === "consolidated"}
                    onChange={() => setInvoiceType("consolidated")}
                    className="accent-[#0F8B7D]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Single combined invoice with rent and CAM line items
                </p>
              </label>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0F8B7D]"
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
              disabled={isSubmitting || activeLeasesCount === 0}
              className="px-5 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Generating..." : `Issue Invoices Run (${invoiceType === "separate" ? activeLeasesCount * 2 : activeLeasesCount} Invoices)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

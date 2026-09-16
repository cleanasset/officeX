"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Layers,
  DollarSign,
  Building,
  Calendar,
  CheckCircle2
} from "lucide-react";

interface AddExpenseModalProps {
  properties: Array<{ id: string; name: string; city: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  properties,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || "PROP-001");
  const [expenseCategory, setExpenseCategory] = useState<string>("cam");
  const [vendorName, setVendorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(100000);
  const [gstAmount, setGstAmount] = useState<number>(18000);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          expenseCategory,
          vendorName,
          invoiceNumber,
          expenseDate,
          amount,
          gstAmount,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record expense");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Record Operating Expense (OpEx)</h3>
              <p className="text-xs text-gray-500 font-medium">Updates property-level Net Operating Income and P&amp;L statements</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-gray-700">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-bold mb-1">Target Property *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-medium shadow-2xs cursor-pointer"
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Expense Category *</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-medium shadow-2xs cursor-pointer"
              >
                <option value="cam">CAM &amp; Facility Maintenance</option>
                <option value="property_tax">Municipal Property Tax</option>
                <option value="insurance">Asset Insurance</option>
                <option value="utility_power">Power &amp; Grid Surcharge</option>
                <option value="utility_water">Water &amp; Sewage</option>
                <option value="repairs_maintenance">Repairs &amp; Lifts AMC</option>
                <option value="statutory_fees">Statutory Fees</option>
                <option value="other">Other Operating Cost</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Vendor / Payee Name *</label>
              <input
                type="text"
                placeholder="e.g. Schindler Elevators AMC"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none shadow-2xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Taxable Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setAmount(val);
                  setGstAmount(Math.round(val * 0.18));
                }}
                className="w-full bg-white border border-gray-200 text-rose-600 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-mono font-black shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">GST Amount (18%)</label>
              <input
                type="number"
                value={gstAmount}
                onChange={(e) => setGstAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-mono shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Vendor Invoice #</label>
              <input
                type="text"
                placeholder="e.g. VEND-2026-881"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-gray-200 text-indigo-700 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-mono font-bold shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Expense Date *</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Quarterly preventative elevator maintenance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-rose-500 focus:outline-none shadow-2xs font-medium"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Recording..." : "Save Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

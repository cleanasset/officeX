"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  DollarSign,
  Receipt,
  FileCheck2,
  Building,
  CheckCircle2
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface OpenInvoiceOption {
  id: string;
  invoiceNumber: string;
  leaseId: string;
  leaseCode: string;
  tenantName: string;
  propertyName: string;
  balanceDue: number;
  netPayable: number;
  tdsDeducted: number;
  dueDate: string;
}

interface RecordPaymentModalProps {
  invoices: OpenInvoiceOption[];
  preSelectedInvoice?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoices,
  preSelectedInvoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [tdsDeducted, setTdsDeducted] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("neft_rtgs");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bankAccount, setBankAccount] = useState<string>("HDFC Bank A/C 50200088991204 - OfficeX Escrow");
  const [notes, setNotes] = useState<string>("Automated settlement reconciled against bank statement.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openInvoices = invoices.filter((i) => i.balanceDue > 0);

  useEffect(() => {
    if (preSelectedInvoice) {
      setSelectedInvoiceId(preSelectedInvoice.id);
      setAmountReceived(preSelectedInvoice.balanceDue || preSelectedInvoice.netPayable || 0);
      setTdsDeducted(preSelectedInvoice.tdsDeducted || 0);
      setReferenceNumber(`HDFCR5${Date.now().toString().slice(-10)}`);
    } else if (openInvoices.length > 0) {
      const first = openInvoices[0];
      setSelectedInvoiceId(first.id);
      setAmountReceived(first.balanceDue);
      setTdsDeducted(first.tdsDeducted || 0);
      setReferenceNumber(`HDFCR5${Date.now().toString().slice(-10)}`);
    }
  }, [preSelectedInvoice, isOpen]);

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const target = invoices.find((i) => i.id === id);
    if (target) {
      setAmountReceived(target.balanceDue);
      setTdsDeducted(target.tdsDeducted || 0);
    }
  };

  if (!isOpen) return null;

  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          leaseId: currentInvoice?.leaseId,
          amountReceived,
          tdsDeducted,
          bankCharges: 0,
          paymentMode,
          referenceNumber,
          paymentDate,
          bankAccount,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record payment");
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
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Record Payment &amp; Settle Invoice</h3>
              <p className="text-xs text-gray-500 font-medium">Creates reconciliation receipt and clears outstanding ledger arrears</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-gray-700">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Invoice Selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Select Open Invoice to Settle *</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none font-medium shadow-2xs cursor-pointer"
              required
            >
              {openInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.tenantName} ({inv.propertyName}) — Balance: {formatINR(inv.balanceDue)}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Quick Summary */}
          {currentInvoice && (
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Invoice Value</span>
                <p className="font-black text-gray-900 font-mono mt-0.5">{formatINR(currentInvoice.netPayable)}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold">TDS Deducted</span>
                <p className="font-bold text-gray-700 font-mono mt-0.5">{formatINR(currentInvoice.tdsDeducted)}</p>
              </div>
              <div>
                <span className="text-[10px] text-rose-700 uppercase font-bold">Balance Due</span>
                <p className="font-black text-rose-600 font-mono mt-0.5">{formatINR(currentInvoice.balanceDue)}</p>
              </div>
            </div>
          )}

          {/* Payment Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Amount Received (INR) *</label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-teal-700 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono font-black shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none shadow-2xs cursor-pointer font-medium"
              >
                <option value="neft_rtgs">NEFT / RTGS Corporate Bank Transfer</option>
                <option value="upi">UPI / Instant Corporate Rail</option>
                <option value="ach">ACH / NACH Auto-Debit</option>
                <option value="cheque">Cheque / Demand Draft</option>
                <option value="credit_card">Corporate Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Bank UTR / Transaction Reference *</label>
              <input
                type="text"
                placeholder="e.g. HDFCR52026090511892"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-white border border-gray-200 text-indigo-700 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono font-bold shadow-2xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Escrow Bank Account</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono text-[11px] shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Reconciliation Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : "Confirm & Settle Payment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

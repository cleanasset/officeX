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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Payment & Settle Invoice</h3>
              <p className="text-xs text-slate-400">Creates reconciliation receipt and clears outstanding ledger arrears</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-300">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Invoice Selection */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Select Open Invoice to Settle *</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-medium"
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
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Invoice Value</span>
                <p className="font-bold text-white font-mono mt-0.5">{formatINR(currentInvoice.netPayable)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">TDS Deducted</span>
                <p className="font-bold text-slate-300 font-mono mt-0.5">{formatINR(currentInvoice.tdsDeducted)}</p>
              </div>
              <div>
                <span className="text-[10px] text-red-400 uppercase font-semibold">Balance Due</span>
                <p className="font-bold text-red-400 font-mono mt-0.5">{formatINR(currentInvoice.balanceDue)}</p>
              </div>
            </div>
          )}

          {/* Payment Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Amount Received (INR) *</label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono font-bold text-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="neft_rtgs">NEFT / RTGS Corporate Bank Transfer</option>
                <option value="upi">UPI / Instant Corporate Rail</option>
                <option value="ach">ACH / NACH Auto-Debit</option>
                <option value="cheque">Cheque / Demand Draft</option>
                <option value="credit_card">Corporate Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Bank UTR / Transaction Reference *</label>
              <input
                type="text"
                placeholder="e.g. HDFCR52026090511892"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-cyan-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Escrow Bank Account</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Reconciliation Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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

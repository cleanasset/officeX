"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Percent,
  TrendingDown,
  RefreshCw,
  Send,
  AlertCircle
} from "lucide-react";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: string | number;
  rate: string | number;
  amount_inr: string | number;
  tax_rate_percent: string | number;
  tax_amount_inr: string | number;
  escalation_amount_inr?: string | number;
  concession_amount_inr?: string | number;
}

interface InvoiceAllocation {
  allocation_id: string;
  amount_allocated_inr: string | number;
  allocation_date: string;
  payment_code: string;
  payment_mode: string;
  payment_ref: string;
}

interface InvoiceDetailModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated?: () => void;
  currentUserRole?: string;
}

export default function InvoiceDetailModal({
  invoiceId,
  isOpen,
  onClose,
  onInvoiceUpdated,
  currentUserRole = "finance_manager",
}: InvoiceDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Credit Note dialog state
  const [creditNoteOpen, setCreditNoteOpen] = useState(false);
  const [creditReason, setCreditReason] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  // Approval comment state
  const [approvalComment, setApprovalComment] = useState("");

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoice();
    } else {
      setData(null);
      setActionSuccess(null);
      setActionError(null);
      setCreditNoteOpen(false);
    }
  }, [isOpen, invoiceId]);

  const fetchInvoice = async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      setActionError(null);
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error("Failed to load invoice details");
      const json = await res.json();
      if (json.success && json.invoice) {
        setData(json.invoice);
      }
    } catch (e: any) {
      setActionError(e.message || "Could not fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!invoiceId) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/invoices/${invoiceId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_comment: approvalComment || "Approved by Finance" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to approve invoice");
      }
      setActionSuccess("Invoice approved and issued successfully.");
      await fetchInvoice();
      if (onInvoiceUpdated) onInvoiceUpdated();
    } catch (e: any) {
      setActionError(e.message || "Failed to approve invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !creditAmount || !creditReason) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/invoices/${invoiceId}/credit-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(creditAmount),
          reason: creditReason,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to issue credit note");
      }
      setActionSuccess(json.message || "Credit note issued successfully.");
      setCreditNoteOpen(false);
      setCreditAmount("");
      setCreditReason("");
      await fetchInvoice();
      if (onInvoiceUpdated) onInvoiceUpdated();
    } catch (e: any) {
      setActionError(e.message || "Failed to issue credit note");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const inv = data;
  const isDraft = inv?.status === "draft";
  const isIssued = inv?.status === "issued";
  const isPaid = inv?.status === "paid";
  const isPartiallyPaid = inv?.status === "partially_paid";

  const statusColors: Record<string, string> = {
    draft: "bg-amber-100 text-amber-800 border-amber-300",
    issued: "bg-blue-100 text-blue-800 border-blue-300",
    partially_paid: "bg-indigo-100 text-indigo-800 border-indigo-300",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
    overdue: "bg-rose-100 text-rose-800 border-rose-300",
    cancelled: "bg-slate-100 text-slate-800 border-slate-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {inv ? inv.invoice_number : "Loading Invoice..."}
                </h2>
                {inv && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      statusColors[inv.status] || "bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    {inv.status.replace("_", " ").toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                GST Tax Invoice (§4.10, §S-13 Compliance)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 printable-area">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Fetching invoice details & line items...</p>
            </div>
          )}

          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <p>{actionSuccess}</p>
            </div>
          )}

          {actionError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <p>{actionError}</p>
            </div>
          )}

          {!loading && inv && (
            <>
              {/* Party Information (Two Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                {/* Billed By */}
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Billed By (Lessor / SPV)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    OFFICEX Asset Management SPV
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    GSTIN: <span className="font-mono font-medium">27AAAAA0000A1Z5</span> · PAN: AAAAA0000A
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Property: {inv.property?.property_name || inv.building?.building_name || "Commercial Center"}
                  </p>
                </div>

                {/* Billed To */}
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Billed To (Occupant / Lessee)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {inv.occupant?.occupant_name || "Commercial Occupant"}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Occupant Code: <span className="font-mono">{inv.occupant?.occupant_code || "—"}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    GSTIN: <span className="font-mono">{inv.occupant?.gst_number || "Unregistered"}</span> · PAN: {inv.occupant?.pan_number || "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Space: {inv.space?.space_name} ({inv.space?.chargeable_area_sqft || "—"} sq ft) · Contract: {inv.contract?.contract_code}
                  </p>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div>
                  <p className="text-[11px] text-blue-900/60 uppercase font-medium">Invoice Date</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">{inv.invoice_date}</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-900/60 uppercase font-medium">Payment Due Date</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">{inv.due_date}</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-900/60 uppercase font-medium">Billing Period</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">
                    {inv.period_start || "—"} to {inv.period_end || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-900/60 uppercase font-medium">Financial Year</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">FY {inv.fy_year || "2026-27"}</p>
                </div>
              </div>

              {/* Canonical Line Items Table (§4.10) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Invoice Line Items (Canonical Specification)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-3 text-right">GST Rate</th>
                        <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                        <th className="py-2.5 px-3 text-right font-bold">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inv.line_items && inv.line_items.length > 0 ? (
                        inv.line_items.map((line: InvoiceLineItem, idx: number) => {
                          const amt = parseFloat(String(line.amount_inr || "0"));
                          const tax = parseFloat(String(line.tax_amount_inr || "0"));
                          const total = amt + tax;
                          return (
                            <tr key={line.id || idx} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {line.description}
                                {parseFloat(String(line.concession_amount_inr || "0")) > 0 && (
                                  <span className="block text-[10px] text-emerald-600">
                                    Concession Applied: -₹{parseFloat(String(line.concession_amount_inr)).toLocaleString("en-IN")}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {parseFloat(String(line.quantity || "1")).toLocaleString("en-IN")}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                ₹{parseFloat(String(line.rate || "0")).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                                ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {line.tax_rate_percent}%
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                ₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-4 text-center text-slate-400">
                            No individual line item breakdowns recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals Breakdown (§13 Formulas) */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="text-xs text-slate-500 space-y-1.5 max-w-sm">
                  <p className="font-semibold text-slate-700">Statutory Tax Notes:</p>
                  <p>• GST calculated per tax_profile configuration at standard 18.00% rate.</p>
                  <p>• Commercial rent liable for 10% TDS under Section 194-I of the Income Tax Act.</p>
                  <p>• Payments must quote Invoice No: <span className="font-mono font-semibold">{inv.invoice_number}</span></p>
                </div>

                <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-medium text-slate-900">
                      ₹{parseFloat(inv.subtotal || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%) + SGST (9%):</span>
                    <span className="font-medium text-slate-900">
                      ₹{parseFloat(inv.gst_amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                    <span>Gross Invoice Total:</span>
                    <span className="text-blue-700 font-bold">
                      ₹{parseFloat(inv.gross_total || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {parseFloat(inv.tds_deducted || "0") > 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Less: TDS Deducted:</span>
                      <span>-₹{parseFloat(inv.tds_deducted).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid to Date:</span>
                    <span className="text-emerald-700 font-medium">
                      ₹{parseFloat(inv.amount_paid || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-300">
                    <span>Balance Due:</span>
                    <span className="text-rose-600">
                      ₹{parseFloat(inv.balance_due || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Allocations Ledger (if payments received) */}
              {inv.allocations && inv.allocations.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Payment Allocations History (RR-PAY-02)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Payment Code</th>
                          <th className="py-2 px-3">Mode</th>
                          <th className="py-2 px-3">Bank Ref</th>
                          <th className="py-2 px-3 text-right">Allocated (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inv.allocations.map((al: InvoiceAllocation) => (
                          <tr key={al.allocation_id}>
                            <td className="py-2 px-3 text-slate-600">{al.allocation_date}</td>
                            <td className="py-2 px-3 font-mono font-medium text-blue-600">{al.payment_code}</td>
                            <td className="py-2 px-3 text-slate-600 uppercase">{al.payment_mode}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{al.payment_ref}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-600">
                              ₹{parseFloat(String(al.amount_allocated_inr)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Credit Note Dialog Form */}
              {creditNoteOpen && (
                <form
                  onSubmit={handleIssueCreditNote}
                  className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-amber-700" />
                      Issue Credit Note / Billing Adjustment
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCreditNoteOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Credit Amount (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Adjustment Reason <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={creditReason}
                        onChange={(e) => setCreditReason(e.target.value)}
                        placeholder="e.g. Agreed CAM true-up rebate or early vacating"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Confirm Credit Note
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Action Footer */}
        {inv && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">
                ID: {inv.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isDraft && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve & Issue Invoice
                </button>
              )}

              {!isDraft && (
                <a
                  href={`/api/invoices/${inv.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-indigo-600" />
                  Tax Invoice (PDF)
                </a>
              )}

              {!isDraft && !creditNoteOpen && (
                <button
                  onClick={() => setCreditNoteOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  Issue Credit Note
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

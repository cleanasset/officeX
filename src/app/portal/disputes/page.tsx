"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Send,
  X,
  Paperclip,
  Check,
  AlertTriangle,
  Receipt,
  Building2,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface DisputeItem {
  id: string;
  dispute_code: string;
  invoice_id: string;
  invoice_number: string | null;
  invoice_gross: string | null;
  dispute_type: string;
  dispute_reason: string;
  occupant_response: string | null;
  dispute_status: "open" | "in_review" | "resolved" | "rejected";
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  days_open: number;
  sla_deadline: string;
  sla_breached: boolean;
}

interface InvoiceOption {
  id: string;
  invoice_number: string;
  gross_total: string;
  outstanding_amount: string;
  invoice_date: string;
}

export default function TenantDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "resolved">("all");
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State (§T-05 Specification)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [reasonCode, setReasonCode] = useState("incorrect_amount");
  const [disputedAmount, setDisputedAmount] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  useEffect(() => {
    loadDisputes();
    loadInvoices();
  }, []);

  async function loadDisputes() {
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const occId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";
      const url = occId ? `/api/portal/disputes?occupant_id=${occId}` : "/api/portal/disputes";
      const res = await fetch(url, { headers: authHeaders });
      const json = await res.json();
      if (json.success) {
        setDisputes(json.disputes || []);
      }
    } catch (err) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvoices() {
    try {
      const authHeaders = getClientAuthHeaders();
      const occId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";
      const url = occId ? `/api/portal/invoices?occupant_id=${occId}` : "/api/portal/invoices";
      const res = await fetch(url, { headers: authHeaders });
      const json = await res.json();
      if (json.success && json.invoices) {
        setInvoices(
          json.invoices.map((inv: any) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            gross_total: inv.gross_amount || inv.gross_total || "0",
            outstanding_amount: inv.balance_due || inv.outstanding_amount || "0",
            invoice_date: inv.invoice_date,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load invoices for dispute selector:", err);
    }
  }

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  async function handleSubmitDispute(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!selectedInvoiceId) {
      setSubmitError("Please select the invoice with the discrepancy.");
      return;
    }

    if (!description || description.trim().length < 20) {
      setSubmitError("Description must be at least 20 characters detailing the discrepancy (§T-05).");
      return;
    }

    setSubmitting(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const occId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";

      const payload = {
        invoice_id: selectedInvoiceId,
        reason_code: reasonCode,
        description: description.trim(),
        disputed_amount: disputedAmount ? parseFloat(disputedAmount) : null,
        occupant_id: occId || undefined,
      };

      const res = await fetch("/api/portal/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setSubmitError(json.error || "Failed to submit dispute");
      } else {
        setSubmitSuccess("Dispute raised successfully. Our Finance team has been assigned with a 7-day resolution SLA.");
        setSelectedInvoiceId("");
        setDescription("");
        setDisputedAmount("");
        setAttachmentName(null);
        setTimeout(() => {
          setShowRaiseModal(false);
          setSubmitSuccess(null);
          loadDisputes();
        }, 1800);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const openDisputes = disputes.filter((d) => d.dispute_status !== "resolved");
  const resolvedDisputes = disputes.filter((d) => d.dispute_status === "resolved");

  const displayedDisputes =
    activeTab === "all"
      ? disputes
      : activeTab === "open"
      ? openDisputes
      : resolvedDisputes;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <ShieldAlert size={14} />
            <span>Resolution & Discrepancies Desk (§T-05)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Invoice Disputes & Billing Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Report billing mismatches, rate discrepancies, or CAM adjustments. Guaranteed 7-day resolution SLA with credit note adjustment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadDisputes()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh disputes"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
          <button
            onClick={() => {
              setSubmitError(null);
              setSubmitSuccess(null);
              setShowRaiseModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Raise New Dispute</span>
          </button>
        </div>
      </div>

      {/* SLA & Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Disputes</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{disputes.length}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Lifetime filed</p>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Under Investigation</p>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-1">{openDisputes.length}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Active review SLA</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">{resolvedDisputes.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Adjusted / Closed</p>
        </div>
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Resolution SLA</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-900 mt-1">7 Days</p>
          <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Guaranteed turnaround</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          All Disputes ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab("open")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "open"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <span>Active / Open</span>
          {openDisputes.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
          <span>({openDisputes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "resolved"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          Resolved ({resolvedDisputes.length})
        </button>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-xs font-semibold">Loading dispute threads...</p>
        </div>
      ) : displayedDisputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero Pending Disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All your invoices match your lease agreement terms. If you spot a discrepancy, click &quot;Raise New Dispute&quot; above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedDisputes.map((d) => {
            const isResolved = d.dispute_status === "resolved";
            const daysLeft = Math.max(0, 7 - d.days_open);

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 shadow-2xs transition space-y-3"
              >
                {/* Dispute Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {d.dispute_code}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Invoice: <strong className="text-slate-900">{d.invoice_number || "Tax Invoice"}</strong>
                    </span>
                    {d.invoice_gross && (
                      <span className="text-xs text-slate-400">
                        (Gross: ₹{parseFloat(d.invoice_gross).toLocaleString("en-IN")})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={12} /> Resolved
                      </span>
                    ) : d.sla_breached ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle size={12} /> SLA Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock size={12} /> Open ({daysLeft}d left in SLA)
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(d.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Dispute Reason & Description */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Discrepancy Category: <span className="text-slate-900 normal-case font-extrabold">{d.dispute_type.replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-wrap bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {d.dispute_reason}
                  </p>
                </div>

                {/* Response / Resolution Box */}
                {d.resolution ? (
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Check size={13} /> Finance Team Resolution Note
                    </p>
                    <p className="text-xs text-emerald-950 font-medium">{d.resolution}</p>
                    {d.resolved_at && (
                      <p className="text-[10px] text-emerald-700">
                        Resolved on {new Date(d.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-1 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={13} className="text-amber-500" />
                      Assigned to Landlord Finance Desk · Resolution SLA: <strong>{d.sla_deadline}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Invoice balance is protected from late fees while under active dispute (§RR-COL-02).
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Raise New Dispute (§T-05 Modal) */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Raise Billing Dispute (§T-05)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assigned directly to Landlord Accounts Desk under 7-day SLA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRaiseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitDispute} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {/* 1. Target Invoice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Target Invoice *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Select invoice with discrepancy</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
                >
                  <option value="">-- Choose Invoice to Dispute --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} (₹{parseFloat(inv.gross_total).toLocaleString("en-IN")}) — Due: {inv.invoice_date}
                    </option>
                  ))}
                </select>
                {selectedInvoice && (
                  <p className="text-[11px] text-indigo-600 font-medium">
                    Total Gross: ₹{parseFloat(selectedInvoice.gross_total).toLocaleString("en-IN")} · Outstanding Balance: ₹{parseFloat(selectedInvoice.outstanding_amount).toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {/* 2. Dispute Reason (§T-05 Select Options) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Discrepancy Reason *
                </label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
                >
                  <option value="incorrect_rate">Incorrect Base Rate per sq.ft.</option>
                  <option value="incorrect_amount">Incorrect Quantity / Chargeable Area</option>
                  <option value="meter_mismatch">Meter Reading or Electricity Tariff Mismatch</option>
                  <option value="cam_pool_discrepancy">CAM or Maintenance Pool Overcharge</option>
                  <option value="already_paid">Already Paid / Bank UTR Not Credited</option>
                  <option value="service_issue">Service Downtime / Concession Request</option>
                  <option value="tax_mismatch">GSTIN / TDS Withholding Tax Mismatch</option>
                  <option value="other">Other Commercial Discrepancy</option>
                </select>
              </div>

              {/* 3. Disputed Amount (Optional / Conditional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Disputed Amount (₹)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Leave blank if entire invoice</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24000.00"
                    value={disputedAmount}
                    onChange={(e) => setDisputedAmount(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* 4. Description (Min 20 chars per §T-05) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Description of Discrepancy *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {description.length}/20 chars minimum
                  </span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the exact calculation mismatch or reference agreement clause..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none resize-none"
                />
              </div>

              {/* 5. Supporting Document / Evidence (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Supporting Evidence / Bank UTR Slip (Optional)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer">
                  <input
                    type="file"
                    id="evidence-file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachmentName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="evidence-file" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
                    <Paperclip size={14} className="text-slate-400" />
                    <span>{attachmentName ? `Attached: ${attachmentName}` : "Attach calculation sheet, meter photo, or bank slip"}</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRaiseModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || description.trim().length < 20}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Dispute</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

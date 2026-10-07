"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Send,
  FileText,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Ban,
  ShieldAlert,
  Building,
  User,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";

interface PaymentsCollectionsViewProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent?: () => void;
}

export default function PaymentsCollectionsView({
  isOpen,
  onClose,
  onRefreshParent,
}: PaymentsCollectionsViewProps) {
  const [activeTab, setActiveTab] = useState<"payments" | "aging" | "overdue" | "writeoffs">("payments");

  // State: Payments List
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // State: Aging Report
  const [agingData, setAgingData] = useState<any>(null);
  const [loadingAging, setLoadingAging] = useState(false);
  const [expandedOccupantId, setExpandedOccupantId] = useState<string | null>(null);

  // State: Overdue List
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [loadingOverdue, setLoadingOverdue] = useState(false);

  // Modals & Action States
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [allocatingPayment, setAllocatingPayment] = useState<any | null>(null);
  const [occupantInvoicesForAlloc, setOccupantInvoicesForAlloc] = useState<any[]>([]);
  const [allocInputs, setAllocInputs] = useState<Record<string, string>>({});
  const [submittingAlloc, setSubmittingAlloc] = useState(false);

  // Dispute & Writeoff Modals
  const [disputeInvoice, setDisputeInvoice] = useState<any | null>(null);
  const [disputeType, setDisputeType] = useState("incorrect_amount");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeOccupantResp, setDisputeOccupantResp] = useState("");

  const [writeoffInvoice, setWriteoffInvoice] = useState<any | null>(null);
  const [writeoffReason, setWriteoffReason] = useState("");

  // Masters for Record Payment Form
  const [occupantsList, setOccupantsList] = useState<any[]>([]);
  const [recordForm, setRecordForm] = useState({
    occupant_id: "",
    contract_id: "",
    amount_inr: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "bank_transfer",
    payment_ref: "",
    bank_account_id: "",
    cheque_number: "",
    cheque_date: "",
    cheque_bank_name: "",
    notes: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [autoMatchSuggestion, setAutoMatchSuggestion] = useState<any | null>(null);

  // Load data based on active tab
  useEffect(() => {
    if (isOpen) {
      loadOccupants();
      if (activeTab === "payments") loadPayments();
      if (activeTab === "aging") loadAging();
      if (activeTab === "overdue" || activeTab === "writeoffs") loadOverdue();
    }
  }, [isOpen, activeTab]);

  async function loadOccupants() {
    try {
      const res = await fetch("/api/rent-roll/occupants");
      const json = await res.json();
      if (json.success && json.data) setOccupantsList(json.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadPayments() {
    try {
      setLoadingPayments(true);
      const res = await fetch("/api/payments");
      const json = await res.json();
      if (json.success) setPayments(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  }

  async function loadAging() {
    try {
      setLoadingAging(true);
      const res = await fetch("/api/collections/aging");
      const json = await res.json();
      if (json.success) setAgingData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAging(false);
    }
  }

  async function loadOverdue() {
    try {
      setLoadingOverdue(true);
      const res = await fetch("/api/collections/overdue");
      const json = await res.json();
      if (json.success) setOverdueInvoices(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverdue(false);
    }
  }

  // Handle Record Payment Submit
  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!recordForm.occupant_id || !recordForm.amount_inr || !recordForm.payment_ref) {
      alert("Please fill in Occupant, Amount, and Payment Reference / Transaction ID.");
      return;
    }
    try {
      setSubmittingPayment(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recordForm,
          amount_inr: parseFloat(recordForm.amount_inr),
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.auto_match_suggestion) {
          alert(`Payment recorded successfully (${json.payment.payment_code})!\n\nAuto-match found: Invoice ${json.auto_match_suggestion.invoice_number} matches exact amount ₹${json.auto_match_suggestion.balance_due}.`);
        } else {
          alert(`Payment recorded successfully (${json.payment.payment_code}).`);
        }
        setRecordModalOpen(false);
        setRecordForm({
          occupant_id: "",
          contract_id: "",
          amount_inr: "",
          payment_date: new Date().toISOString().split("T")[0],
          payment_mode: "bank_transfer",
          payment_ref: "",
          bank_account_id: "",
          cheque_number: "",
          cheque_date: "",
          cheque_bank_name: "",
          notes: "",
        });
        loadPayments();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  }

  // Open Allocation Modal for a Payment
  async function openAllocationModal(paymentItem: any) {
    try {
      setAllocatingPayment(paymentItem);
      setAllocInputs({});
      // Fetch occupant's invoices
      const res = await fetch(`/api/collections/occupant/${paymentItem.occupant_id}`);
      const json = await res.json();
      if (json.invoices) {
        // filter unpaid or partially paid
        setOccupantInvoicesForAlloc(
          json.invoices.filter((inv: any) => parseFloat(inv.balance_due || "0") > 0)
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate allocation totals
  const totalAllocatingNow = useMemo(() => {
    return Object.values(allocInputs).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [allocInputs]);

  const paymentUnallocatedBalance = useMemo(() => {
    if (!allocatingPayment) return 0;
    const originalAmount = parseFloat(allocatingPayment.amount_inr || "0");
    const alreadyAllocated = parseFloat(allocatingPayment.amount_allocated_inr || "0");
    return Math.max(0, originalAmount - alreadyAllocated);
  }, [allocatingPayment]);

  // Submit Allocations
  async function handleSaveAllocations() {
    if (!allocatingPayment) return;
    const allocationsToSave = Object.entries(allocInputs)
      .filter(([_, amt]) => parseFloat(amt) > 0)
      .map(([invoiceId, amt]) => ({
        invoice_id: invoiceId,
        amount_allocated_inr: parseFloat(amt),
      }));

    if (allocationsToSave.length === 0) {
      alert("Please specify allocation amounts for at least one invoice.");
      return;
    }

    if (totalAllocatingNow > paymentUnallocatedBalance + 0.01) {
      alert(`Cannot allocate ₹${totalAllocatingNow.toFixed(2)}. Remaining payment balance is ₹${paymentUnallocatedBalance.toFixed(2)}.`);
      return;
    }

    try {
      setSubmittingAlloc(true);
      const res = await fetch(`/api/payments/${allocatingPayment.id}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: allocationsToSave }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Payment allocated successfully!");
        setAllocatingPayment(null);
        loadPayments();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert(json.error || "Failed to allocate payment");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingAlloc(false);
    }
  }

  // Reverse / Unallocate an existing allocation
  async function handleUnallocate(allocationId: string) {
    if (!allocatingPayment) return;
    if (!confirm("Are you sure you want to reverse this allocation? The invoice balance will be restored.")) return;
    try {
      const res = await fetch(`/api/payments/${allocatingPayment.id}/allocate?allocation_id=${allocationId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        alert("Allocation reversed successfully.");
        // Refresh details
        const refreshedPayment = await fetch(`/api/payments/${allocatingPayment.id}`);
        const refJson = await refreshedPayment.json();
        if (refJson.success) {
          setAllocatingPayment(refJson.payment);
        }
        loadPayments();
      } else {
        alert(json.error || "Failed to unallocate");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  // Send Reminder
  async function handleSendReminder(invoiceId: string) {
    try {
      const res = await fetch("/api/collections/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId, notes: "Automated reminder sent via Collections View" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Reminder dispatched to occupant email! Follow-up task created (Priority: High).`);
        loadOverdue();
      } else {
        alert(json.error || "Failed to send reminder");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  // Submit Dispute
  async function handleCreateDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeInvoice || !disputeReason) return;
    try {
      const res = await fetch("/api/collections/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: disputeInvoice.id,
          dispute_type: disputeType,
          dispute_reason: disputeReason,
          occupant_response: disputeOccupantResp,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Dispute registered (${json.dispute.dispute_code}). Invoice marked as Disputed.`);
        setDisputeInvoice(null);
        setDisputeReason("");
        setDisputeOccupantResp("");
        loadOverdue();
      } else {
        alert(json.error || "Failed to register dispute");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  // Submit Write-Off Request
  async function handleRequestWriteoff(e: React.FormEvent) {
    e.preventDefault();
    if (!writeoffInvoice || !writeoffReason) return;
    try {
      const res = await fetch("/api/collections/writeoff-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: writeoffInvoice.id,
          reason: writeoffReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Write-off request submitted! Task queued for Finance Approver.");
        setWriteoffInvoice(null);
        setWriteoffReason("");
        loadOverdue();
      } else {
        alert(json.error || "Failed to submit write-off request");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  // Approve Write-Off directly
  async function handleApproveWriteoff(invoiceId: string) {
    const justification = prompt("Enter approval justification for Bad Debt write-off:");
    if (!justification) return;
    try {
      const res = await fetch("/api/collections/writeoff-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoiceId,
          approved_justification: justification,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Invoice written off successfully! Irrecoverable debt credit note ${json.credit_note?.invoice_number || ""} generated.`);
        loadOverdue();
        loadAging();
      } else {
        alert(json.error || "Failed to approve write-off");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  // Filter Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentStatusFilter === "unmatched" && p.is_matched) return false;
      if (paymentStatusFilter === "matched" && !p.is_matched) return false;
      if (!paymentSearch.trim()) return true;
      const q = paymentSearch.toLowerCase();
      return (
        p.payment_code?.toLowerCase().includes(q) ||
        p.occupant_name?.toLowerCase().includes(q) ||
        p.payment_ref?.toLowerCase().includes(q)
      );
    });
  }, [payments, paymentSearch, paymentStatusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Payments & Collections (§5.9, §5.13, §4.10)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  PHASE P3 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Record occupant payments, execute multi-invoice allocations, track aging arrears, and process bad-debt write-offs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "payments") loadPayments();
                if (activeTab === "aging") loadAging();
                if (activeTab === "overdue" || activeTab === "writeoffs") loadOverdue();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === "payments"
                  ? "border-teal-600 text-teal-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Payments Register ({payments.length})
            </button>

            <button
              onClick={() => setActiveTab("aging")}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === "aging"
                  ? "border-teal-600 text-teal-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              AR Aging Report (0-30/31-60/61-90/90+)
            </button>

            <button
              onClick={() => setActiveTab("overdue")}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === "overdue"
                  ? "border-teal-600 text-teal-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Overdue Collections ({overdueInvoices.length})
            </button>

            <button
              onClick={() => setActiveTab("writeoffs")}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === "writeoffs"
                  ? "border-teal-600 text-teal-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Ban className="w-4 h-4 text-rose-600" />
              Write-Off & Bad Debt (§5.9)
            </button>
          </div>

          {activeTab === "payments" && (
            <button
              onClick={() => setRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Payment (RR-PAY-01)
            </button>
          )}
        </div>

        {/* Tab 1: Payments Register */}
        {activeTab === "payments" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search by payment code, occupant, or txn ref..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  <option value="all">All Payments</option>
                  <option value="matched">Matched / Allocated</option>
                  <option value="unmatched">Unmatched (Pending Allocation)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loadingPayments ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                <CreditCard className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold">No payments recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "+ Record Payment" above to log a bank transfer, cheque, UPI, or cash receipt.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4">Payment Code</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Occupant</th>
                      <th className="py-2.5 px-4">Mode / Ref</th>
                      <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-4 text-right">Allocated (₹)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => {
                      const amount = parseFloat(p.amount_inr || "0");
                      const allocated = parseFloat(p.amount_allocated_inr || "0");
                      const remaining = Math.max(0, amount - allocated);

                      return (
                        <tr key={p.id} className="hover:bg-teal-50/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {p.payment_code}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {p.payment_date}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {p.occupant_name || "Unknown Occupant"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-700 capitalize">
                                {p.payment_mode?.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Ref: {p.payment_ref}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            ₹{allocated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            {remaining > 0 && (
                              <span className="block text-[10px] text-amber-600 font-semibold">
                                (₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })} left)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {p.is_matched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Unmatched
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openAllocationModal(p)}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md text-[11px] font-semibold transition"
                              >
                                Allocate (§5.9)
                              </button>
                              {p.is_matched && (
                                <a
                                  href={`/api/payments/${p.id}/receipt`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition"
                                  title="Download / View Receipt PDF"
                                >
                                  <FileCheck className="w-3 h-3 text-teal-600" />
                                  Receipt
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AR Aging Report */}
        {activeTab === "aging" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {loadingAging ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Computing AR aging schedule...
              </div>
            ) : !agingData ? (
              <div className="text-center py-12 text-slate-400 text-xs">No aging data available</div>
            ) : (
              <>
                {/* 4 Aging Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                    <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Current (0–30 Days)</p>
                    <p className="text-lg font-bold text-emerald-950 font-mono mt-1">
                      ₹{agingData.summary?.current_0_30_inr?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">{agingData.summary?.bucket_counts?.["0-30"] || 0} invoices on schedule</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">31–60 Days Overdue</p>
                    <p className="text-lg font-bold text-amber-950 font-mono mt-1">
                      ₹{agingData.summary?.overdue_31_60_inr?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-[10px] text-amber-700 mt-0.5">{agingData.summary?.bucket_counts?.["31-60"] || 0} invoices in early arrears</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/60">
                    <p className="text-[11px] font-semibold text-orange-800 uppercase tracking-wide">61–90 Days Overdue</p>
                    <p className="text-lg font-bold text-orange-950 font-mono mt-1">
                      ₹{agingData.summary?.overdue_61_90_inr?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-[10px] text-orange-700 mt-0.5">{agingData.summary?.bucket_counts?.["61-90"] || 0} invoices high risk</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
                    <p className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide">90+ Days (Critical)</p>
                    <p className="text-lg font-bold text-rose-950 font-mono mt-1">
                      ₹{agingData.summary?.overdue_90_plus_inr?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-[10px] text-rose-700 mt-0.5">{agingData.summary?.bucket_counts?.["90+"] || 0} write-off candidates</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-900 text-white">
                    <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Total Receivables</p>
                    <p className="text-lg font-bold text-white font-mono mt-1">
                      ₹{agingData.summary?.total_receivables_inr?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-[10px] text-teal-300 mt-0.5">{agingData.summary?.occupants_in_arrears_count || 0} occupants in arrears</p>
                  </div>
                </div>

                {/* Occupants Arrears Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Occupant Arrears Ledger & Aging Buckets (§5.13)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      As of {agingData.as_of_date}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-4">Occupant</th>
                        <th className="py-2.5 px-4 text-center">Arrears Flag (&gt;30d)</th>
                        <th className="py-2.5 px-4 text-right">0–30d</th>
                        <th className="py-2.5 px-4 text-right">31–60d</th>
                        <th className="py-2.5 px-4 text-right">61–90d</th>
                        <th className="py-2.5 px-4 text-right">90+d</th>
                        <th className="py-2.5 px-4 text-right">Total Outstanding</th>
                        <th className="py-2.5 px-4 text-center">Drill-Down</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agingData.occupants?.map((occ: any) => {
                        const isExpanded = expandedOccupantId === occ.occupant_id;
                        return (
                          <React.Fragment key={occ.occupant_id}>
                            <tr
                              className={`hover:bg-slate-50 transition cursor-pointer ${
                                occ.arrears_flag ? "bg-rose-50/30" : ""
                              }`}
                              onClick={() => setExpandedOccupantId(isExpanded ? null : occ.occupant_id)}
                            >
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                {occ.occupant_name}
                                <span className="block text-[10px] text-slate-500 font-normal">
                                  {occ.occupant_code} • {occ.invoice_count} open invoices
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {occ.arrears_flag ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    IN ARREARS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Current
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-600">
                                ₹{occ.current_0_30?.toLocaleString("en-IN") || "0"}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-amber-700 font-semibold">
                                ₹{occ.overdue_31_60?.toLocaleString("en-IN") || "0"}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-orange-700 font-semibold">
                                ₹{occ.overdue_61_90?.toLocaleString("en-IN") || "0"}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-rose-700 font-bold">
                                ₹{occ.overdue_90_plus?.toLocaleString("en-IN") || "0"}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                ₹{occ.total_outstanding?.toLocaleString("en-IN") || "0"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="p-1 text-slate-400 hover:text-slate-700">
                                  {isExpanded ? <ChevronDown className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
                                </span>
                              </td>
                            </tr>

                            {/* Drill-down invoice list */}
                            {isExpanded && (
                              <tr className="bg-slate-50/80">
                                <td colSpan={8} className="p-4">
                                  <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
                                    <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2">
                                      Outstanding Invoices for {occ.occupant_name}:
                                    </h4>
                                    <div className="space-y-1.5">
                                      {agingData.invoices
                                        ?.filter((inv: any) => (inv.occupant_id || "unassigned") === occ.occupant_id)
                                        .map((inv: any) => (
                                          <div
                                            key={inv.invoice_id}
                                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded-md bg-slate-50 border border-slate-100"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="font-mono font-bold text-slate-800">
                                                {inv.invoice_number}
                                              </span>
                                              <span className="text-slate-500 text-[11px]">
                                                Due: {inv.due_date} ({inv.days_overdue} days late)
                                              </span>
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                                                {inv.status}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                              <span className="font-mono font-bold text-rose-700">
                                                Balance: ₹{inv.balance_due?.toLocaleString("en-IN")}
                                              </span>
                                              <button
                                                onClick={() => handleSendReminder(inv.invoice_id)}
                                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold"
                                              >
                                                Send Reminder
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Overdue Collections Workflow */}
        {activeTab === "overdue" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase">Collections Trigger Matrix (§5.9)</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Automated escalation alerts trigger at 1, 7, 30, 60, and 90+ days past due. Dispatches branded emails via Resend.
                  </p>
                </div>
              </div>
            </div>

            {loadingOverdue ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading overdue invoices...
              </div>
            ) : overdueInvoices.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold">Zero overdue invoices!</p>
                <p className="text-xs text-slate-400 mt-1">All billings across your managed accounts are fully settled or on schedule.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4">Invoice #</th>
                      <th className="py-2.5 px-4">Occupant</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4 text-center">Days Overdue</th>
                      <th className="py-2.5 px-4 text-center">Alert Tier</th>
                      <th className="py-2.5 px-4 text-right">Balance Due (₹)</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {inv.occupant_name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {inv.due_date}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-rose-700">
                            {inv.days_overdue} days
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.alert_tier === "90+ days"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : inv.alert_tier === "60 days" || inv.alert_tier === "30 days"
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {inv.alert_tier} Tier
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                          ₹{parseFloat(inv.balance_due || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendReminder(inv.id)}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[11px] font-semibold transition"
                              title="Send reminder email and log task"
                            >
                              Send Reminder
                            </button>
                            <button
                              onClick={() => {
                                setRecordForm((prev) => ({
                                  ...prev,
                                  occupant_id: inv.occupant_id || "",
                                  amount_inr: inv.balance_due?.toString() || "",
                                }));
                                setRecordModalOpen(true);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                              title="Shortcut to Record Payment"
                            >
                              Record Payment
                            </button>
                            <button
                              onClick={() => setDisputeInvoice(inv)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold transition"
                              title="Log occupant dispute"
                            >
                              Dispute
                            </button>
                            <button
                              onClick={() => setWriteoffInvoice(inv)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-[11px] font-semibold transition"
                              title="Request write-off approval"
                            >
                              Write-Off
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Write-Off Approvals & Bad Debt */}
        {activeTab === "writeoffs" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase">Bad Debt Write-Off Engine (§5.9)</h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Irrecoverable balances can be submitted by AR Managers for Approver sign-off. Approved write-offs generate negative credit notes and zero the outstanding balance.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Candidates for Write-Off (90+ Days Past Due)
                </h3>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Occupant</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4 text-center">Days Overdue</th>
                    <th className="py-2.5 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-2.5 px-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueInvoices
                    .filter((i) => i.days_overdue >= 90)
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-rose-50/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {inv.occupant_name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {inv.due_date}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-700">
                          {inv.days_overdue} days
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-800">
                          ₹{parseFloat(inv.balance_due || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleApproveWriteoff(inv.id)}
                            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold shadow-xs transition"
                          >
                            Approve Write-Off (§5.9)
                          </button>
                        </td>
                      </tr>
                    ))}
                  {overdueInvoices.filter((i) => i.days_overdue >= 90).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No critical 90+ day invoices currently requiring write-off approval.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record Payment (RR-PAY-01) */}
        {recordModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold">Record Payment (RR-PAY-01)</h3>
                </div>
                <button
                  onClick={() => setRecordModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-5 flex flex-col gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Occupant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recordForm.occupant_id}
                    onChange={(e) => setRecordForm({ ...recordForm, occupant_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="">Select Occupant...</option>
                    {occupantsList.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.occupant_name} ({occ.occupant_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Amount (INR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 129800"
                      value={recordForm.amount_inr}
                      onChange={(e) => setRecordForm({ ...recordForm, amount_inr: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={recordForm.payment_date}
                      onChange={(e) => setRecordForm({ ...recordForm, payment_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Mode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={recordForm.payment_mode}
                      onChange={(e) => setRecordForm({ ...recordForm, payment_mode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold"
                    >
                      <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="credit">Credit / Debit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Reference / Txn ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR194827184"
                      value={recordForm.payment_ref}
                      onChange={(e) => setRecordForm({ ...recordForm, payment_ref: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {recordForm.payment_mode === "cheque" && (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">Cheque #</label>
                      <input
                        type="text"
                        value={recordForm.cheque_number}
                        onChange={(e) => setRecordForm({ ...recordForm, cheque_number: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">Cheque Date</label>
                      <input
                        type="date"
                        value={recordForm.cheque_date}
                        onChange={(e) => setRecordForm({ ...recordForm, cheque_date: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="HDFC, ICICI..."
                        value={recordForm.cheque_bank_name}
                        onChange={(e) => setRecordForm({ ...recordForm, cheque_bank_name: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes or remittance reference..."
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRecordModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs transition"
                  >
                    {submittingPayment ? "Recording..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Allocate Payment to Invoices (RR-PAY-02, RR-PAY-07) */}
        {allocatingPayment && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-teal-400" />
                    Allocate Payment: {allocatingPayment.payment_code}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Occupant: <span className="font-semibold text-white">{allocatingPayment.occupant_name}</span> • 
                    Total Amount: <span className="font-mono font-bold text-teal-300">₹{parseFloat(allocatingPayment.amount_inr || "0").toLocaleString("en-IN")}</span>
                  </p>
                </div>
                <button
                  onClick={() => setAllocatingPayment(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 text-xs">
                {/* Balance bar */}
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-teal-800 font-semibold block">Unallocated Payment Balance</span>
                    <span className="text-base font-bold font-mono text-teal-950">
                      ₹{paymentUnallocatedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-teal-800 font-semibold block text-right">Selected to Allocate</span>
                    <span className="text-base font-bold font-mono text-slate-900 text-right">
                      ₹{totalAllocatingNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Invoices list */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">
                    Select & Allocate to Open Invoices:
                  </h4>

                  {occupantInvoicesForAlloc.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No unpaid invoices found for this occupant.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="py-2 px-3">Invoice #</th>
                            <th className="py-2 px-3">Due Date</th>
                            <th className="py-2 px-3 text-right">Total Due (₹)</th>
                            <th className="py-2 px-3 text-right">Balance Due (₹)</th>
                            <th className="py-2 px-3 text-right w-44">Allocate Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {occupantInvoicesForAlloc.map((inv) => {
                            const bal = parseFloat(inv.balance_due || "0");
                            return (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                  {inv.invoice_number}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {inv.due_date}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-600">
                                  ₹{parseFloat(inv.gross_total || "0").toLocaleString("en-IN")}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                                  ₹{bal.toLocaleString("en-IN")}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <input
                                      type="number"
                                      step="0.01"
                                      max={bal}
                                      placeholder="0.00"
                                      value={allocInputs[inv.id] || ""}
                                      onChange={(e) =>
                                        setAllocInputs({ ...allocInputs, [inv.id]: e.target.value })
                                      }
                                      className="w-24 px-2 py-1 text-right bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-teal-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const remainingToTake = Math.min(bal, paymentUnallocatedBalance);
                                        setAllocInputs({ ...allocInputs, [inv.id]: remainingToTake.toString() });
                                      }}
                                      className="px-1.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                                      title="Auto-fill balance"
                                    >
                                      Full
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Existing Allocations on this Payment */}
                {allocatingPayment.allocations && allocatingPayment.allocations.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 uppercase text-[11px]">
                      Active Allocations for this Payment:
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <th className="py-1.5 px-3">Invoice Code</th>
                            <th className="py-1.5 px-3">Date</th>
                            <th className="py-1.5 px-3 text-right">Allocated (₹)</th>
                            <th className="py-1.5 px-3 text-right">Reverse</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allocatingPayment.allocations.map((a: any) => (
                            <tr key={a.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {a.invoice_number || "Invoice"}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                {a.allocation_date}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-teal-800">
                                ₹{parseFloat(a.amount_allocated_inr || "0").toLocaleString("en-IN")}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleUnallocate(a.id)}
                                  className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold underline"
                                >
                                  Unallocate
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAllocatingPayment(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingAlloc || totalAllocatingNow === 0}
                    onClick={handleSaveAllocations}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition"
                  >
                    {submittingAlloc ? "Allocating..." : `Confirm Allocation (₹${totalAllocatingNow.toFixed(2)})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Dispute (RR-PAY-04) */}
        {disputeInvoice && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-900 text-white">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-300" />
                  Log Invoice Dispute
                </h3>
                <button onClick={() => setDisputeInvoice(null)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDispute} className="p-5 flex flex-col gap-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Invoice:</span>{" "}
                  <span className="font-mono font-bold text-slate-900">{disputeInvoice.invoice_number}</span> (₹{disputeInvoice.balance_due})
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispute Classification</label>
                  <select
                    value={disputeType}
                    onChange={(e) => setDisputeType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="incorrect_amount">Incorrect Amount</option>
                    <option value="duplicate_charge">Duplicate Charge</option>
                    <option value="already_paid">Already Paid (Payment Missing)</option>
                    <option value="quality_issue">Facility / Service Quality Dispute</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason / Details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe dispute reason..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDisputeInvoice(null)}
                    className="px-3 py-1.5 border rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Write-Off Request (RR-PAY-05) */}
        {writeoffInvoice && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-950 text-white">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-300" />
                  Request Bad Debt Write-Off (§5.9)
                </h3>
                <button onClick={() => setWriteoffInvoice(null)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestWriteoff} className="p-5 flex flex-col gap-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Invoice:</span>{" "}
                  <span className="font-mono font-bold text-slate-900">{writeoffInvoice.invoice_number}</span> •{" "}
                  <span className="font-mono font-bold text-rose-700">Balance: ₹{writeoffInvoice.balance_due}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Justification for Approver *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Occupant vacated, legal recovery exhausted, bankruptcy..."
                    value={writeoffReason}
                    onChange={(e) => setWriteoffReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWriteoffInvoice(null)}
                    className="px-3 py-1.5 border rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold"
                  >
                    Submit Write-Off Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

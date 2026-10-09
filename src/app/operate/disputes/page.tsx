"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileCheck,
  Eye,
  MessageSquare,
  HelpCircle,
  Sparkles
} from "lucide-react";

interface DisputeRecord {
  id: string;
  dispute_code: string;
  dispute_type: string;
  dispute_reason: string;
  occupant_response: string | null;
  dispute_status: "open" | "under_investigation" | "resolved" | "rejected";
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  invoice_id: string;
  invoice_number: string | null;
  invoice_gross_total: string | null;
  invoice_balance_due: string | null;
  invoice_due_date: string | null;
  invoice_status: string | null;
  occupant_name: string | null;
}

export default function DisputesRegisterPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review & Resolution Drawer State
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<"resolved" | "rejected">("resolved");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [issueCreditNote, setIssueCreditNote] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  // New Dispute Modal State
  const [isNewDisputeModalOpen, setIsNewDisputeModalOpen] = useState(false);
  const [newInvoiceId, setNewInvoiceId] = useState("");
  const [newDisputeType, setNewDisputeType] = useState("incorrect_amount");
  const [newDisputeReason, setNewDisputeReason] = useState("");
  const [newOccupantResponse, setNewOccupantResponse] = useState("");
  const [submittingNew, setSubmittingNew] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  async function fetchDisputes() {
    try {
      setLoading(true);
      const url = statusFilter === "all" ? "/api/collections/dispute" : `/api/collections/dispute?status=${statusFilter}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDisputes(json.data);
      } else {
        setDisputes([]);
      }
    } catch (err) {
      console.error("Failed to load disputes:", err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(disputeId: string, newStatus: string) {
    try {
      setProcessingAction(true);
      const res = await fetch("/api/collections/dispute", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: disputeId,
          dispute_status: newStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update dispute status");
      
      await fetchDisputes();
      if (selectedDispute && selectedDispute.id === disputeId) {
        setSelectedDispute((prev) => prev ? { ...prev, dispute_status: newStatus as any } : null);
      }
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDispute) return;

    try {
      setProcessingAction(true);
      const res = await fetch("/api/collections/dispute", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDispute.id,
          dispute_status: resolutionAction,
          resolution: resolutionNotes,
          issue_credit_note: resolutionAction === "resolved" ? issueCreditNote : false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to resolve dispute");

      setIsResolveModalOpen(false);
      setSelectedDispute(null);
      setResolutionNotes("");
      await fetchDisputes();
    } catch (err: any) {
      alert(err.message || "Resolution failed");
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleCreateDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newInvoiceId || !newDisputeReason) return;

    try {
      setSubmittingNew(true);
      const res = await fetch("/api/collections/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: newInvoiceId,
          dispute_type: newDisputeType,
          dispute_reason: newDisputeReason,
          occupant_response: newOccupantResponse || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register dispute");

      setIsNewDisputeModalOpen(false);
      setNewInvoiceId("");
      setNewDisputeReason("");
      setNewOccupantResponse("");
      await fetchDisputes();
    } catch (err: any) {
      alert(err.message || "Failed to create dispute");
    } finally {
      setSubmittingNew(false);
    }
  }

  const filteredDisputes = disputes.filter((d) => {
    if (typeFilter !== "all" && d.dispute_type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = d.dispute_code?.toLowerCase().includes(q);
      const invMatch = d.invoice_number?.toLowerCase().includes(q);
      const tenantMatch = d.occupant_name?.toLowerCase().includes(q);
      const reasonMatch = d.dispute_reason?.toLowerCase().includes(q);
      return codeMatch || invMatch || tenantMatch || reasonMatch;
    }
    return true;
  });

  const openCount = disputes.filter((d) => d.dispute_status === "open").length;
  const underInvestigationCount = disputes.filter((d) => d.dispute_status === "under_investigation").length;
  const resolvedCount = disputes.filter((d) => d.dispute_status === "resolved").length;
  const rejectedCount = disputes.filter((d) => d.dispute_status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50/60 p-3.5 sm:p-6 pb-28 md:pb-16 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-widest">
              Screen S-46 • RR-PAY-04
            </span>
            <span className="text-xs text-gray-500 font-medium">Resolution & Claims Register</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 tracking-tight">
            Tenant Disputes Centre
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Audit contested billings, review occupant discrepancies, issue credit notes, or adjudicate invoice disputes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDisputes()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-xs"
            title="Refresh disputes"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
          </button>
          <Link
            href="/operate/credit-notes"
            className="px-3.5 py-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileCheck size={14} />
            <span>Credit Notes (S-42)</span>
          </Link>
          <button
            onClick={() => setIsNewDisputeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Log Dispute</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Pending Open</span>
            <AlertOctagon size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{openCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Requires immediate adjudication</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Under Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{underInvestigationCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Verification in progress</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Settled / Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Credit note or adjusted</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Rejected Claims</span>
            <XCircle size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-black text-gray-700 mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Invoices reaffirmed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by dispute code, invoice #, occupant name, or claim reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
            <Filter size={14} className="text-gray-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses ({disputes.length})</option>
            <option value="open">Open</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 ml-1">
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Types</option>
            <option value="incorrect_amount">Incorrect Amount</option>
            <option value="duplicate_charge">Duplicate Charge</option>
            <option value="already_paid">Already Paid</option>
            <option value="quality_issue">Quality Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Register List / Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-teal-600" />
          <p className="text-xs font-bold text-gray-500">Loading dispute records...</p>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
          <ShieldAlert size={36} className="text-gray-300" />
          <h3 className="text-sm font-bold text-gray-800">No disputes found</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No dispute records match the active search filters."
              : "No tenant disputes are currently on record. Invoices with billing issues can be logged directly."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card List (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredDisputes.map((d) => (
              <div
                key={d.id}
                className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-gray-900 block">
                      {d.dispute_code}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {d.occupant_name || "Unknown Occupant"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      d.dispute_status === "open"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : d.dispute_status === "under_investigation"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : d.dispute_status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {d.dispute_status.replace("_", " ")}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice:</span>
                    <span className="font-mono font-bold text-gray-800">
                      {d.invoice_number || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-gray-900">
                      ₹{Number(d.invoice_gross_total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason Category:</span>
                    <span className="font-medium text-gray-700 capitalize">
                      {d.dispute_type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 line-clamp-2 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  &ldquo;{d.dispute_reason}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(d.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Review Case</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Dispute ID</th>
                    <th className="py-3.5 px-4">Occupant / Tenant</th>
                    <th className="py-3.5 px-4">Invoice Ref</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Claim Summary</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDisputes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-900 block">
                          {d.dispute_code}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(d.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          {d.occupant_name || "Unknown Occupant"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Invoice ID: {d.invoice_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <span className="text-gray-900 font-bold block">
                          {d.invoice_number || "—"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ₹{Number(d.invoice_gross_total || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 capitalize">
                          {d.dispute_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-gray-700 truncate font-medium" title={d.dispute_reason}>
                          {d.dispute_reason}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            d.dispute_status === "open"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : d.dispute_status === "under_investigation"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : d.dispute_status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {d.dispute_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDispute(d)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye size={13} />
                            <span>Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Resolution Drawer */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Case Review
                </span>
                <h2 className="text-lg font-black text-gray-900 mt-1">
                  {selectedDispute.dispute_code}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Status Header */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Current Stage</span>
                  <p className="text-sm font-black text-gray-800 capitalize">
                    {selectedDispute.dispute_status.replace("_", " ")}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {selectedDispute.dispute_status === "open" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedDispute.id, "under_investigation")}
                      disabled={processingAction}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors"
                    >
                      Start Investigation
                    </button>
                  )}
                </div>
              </div>

              {/* Invoice & Occupant Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Invoice & Occupant Reference
                </h3>
                <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Occupant:</span>
                    <span className="font-bold text-gray-900">{selectedDispute.occupant_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice Number:</span>
                    <span className="font-mono font-bold text-gray-900">{selectedDispute.invoice_number || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Total:</span>
                    <span className="font-bold text-teal-700">
                      ₹{Number(selectedDispute.invoice_gross_total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance Due:</span>
                    <span className="font-bold text-rose-600">
                      ₹{Number(selectedDispute.invoice_balance_due || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contested Reason */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Dispute Reason & Claim
                </h3>
                <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-bold uppercase text-[10px]">Category</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {selectedDispute.dispute_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedDispute.dispute_reason}
                  </p>
                  {selectedDispute.occupant_response && (
                    <div className="pt-2 border-t border-amber-100 text-[11px] text-gray-600">
                      <span className="font-bold block text-gray-700">Occupant Statement:</span>
                      {selectedDispute.occupant_response}
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Info if already settled */}
              {selectedDispute.resolution && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Resolution Findings
                  </h3>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Recorded Outcome</span>
                    <p className="text-emerald-950 font-medium">{selectedDispute.resolution}</p>
                    {selectedDispute.resolved_at && (
                      <p className="text-[10px] text-emerald-700 pt-1">
                        Resolved on {new Date(selectedDispute.resolved_at).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>

              {selectedDispute.dispute_status !== "resolved" && selectedDispute.dispute_status !== "rejected" && (
                <button
                  onClick={() => setIsResolveModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FileCheck size={14} />
                  <span>Adjudicate / Resolve</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjudicate / Resolve Modal */}
      {isResolveModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-gray-900">
                Adjudicate Dispute: {selectedDispute.dispute_code}
              </h3>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Decision Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionAction("resolved")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      resolutionAction === "resolved"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Approve / Settle Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionAction("rejected")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      resolutionAction === "rejected"
                        ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Reject Claim
                  </button>
                </div>
              </div>

              {resolutionAction === "resolved" && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-900">
                    <input
                      type="checkbox"
                      checked={issueCreditNote}
                      onChange={(e) => setIssueCreditNote(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Issue Credit Note (RR-BIL-08 / S-42)</span>
                  </label>
                  <p className="text-[11px] text-teal-700">
                    Marks invoice as credited in the rent roll ledger and prompts issuance of tax credit adjustment note.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Resolution Justification / Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the audit findings, approved credit deduction, or grounds for rejection..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAction}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold transition-all shadow-sm"
                >
                  {processingAction ? "Submitting..." : "Confirm Adjudication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log New Dispute Modal */}
      {isNewDisputeModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-gray-900">
                Log New Invoice Dispute (RR-PAY-04)
              </h3>
              <button
                onClick={() => setIsNewDisputeModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDisputeSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Invoice ID or Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste Invoice UUID..."
                  value={newInvoiceId}
                  onChange={(e) => setNewInvoiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Dispute Type</label>
                <select
                  value={newDisputeType}
                  onChange={(e) => setNewDisputeType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="incorrect_amount">Incorrect Amount / Calculation</option>
                  <option value="duplicate_charge">Duplicate Charge</option>
                  <option value="already_paid">Already Paid / Bank Clearance Pending</option>
                  <option value="quality_issue">Quality Issue / CAM Defect</option>
                  <option value="other">Other Commercial Dispute</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Dispute Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDisputeReason}
                  onChange={(e) => setNewDisputeReason(e.target.value)}
                  placeholder="Explain why the invoice is being disputed..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tenant / Occupant Response (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newOccupantResponse}
                  onChange={(e) => setNewOccupantResponse(e.target.value)}
                  placeholder="Tenant's written comment or email quote..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDisputeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNew}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold transition-all shadow-sm"
                >
                  {submittingNew ? "Saving..." : "Register Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  X,
  FileText,
  SlidersHorizontal,
  Layers,
  ArrowDownLeft,
  Receipt,
  AlertTriangle,
  ChevronRight,
  Download,
} from "lucide-react";

interface PaymentItem {
  id: string;
  payment_number: string;
  occupant_id: string;
  occupant_name: string;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  amount_inr: number;
  amount_allocated_inr: number;
  unallocated_amount_inr: number;
  status: "reconciled" | "allocated" | "partially_allocated" | "unallocated";
  bank_account?: string;
  notes?: string;
  allocations?: Array<{
    invoice_id: string;
    invoice_number: string;
    amount_allocated_inr: number;
  }>;
}

interface OpenInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  gross_total: number;
  amount_paid: number;
  balance_due: number;
  allocatingNow?: number;
}

export default function PaymentCentrePage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [occupants, setOccupants] = useState<any[]>([]);

  // S-43: Record Payment Drawer
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedOccupantId, setSelectedOccupantId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("neft_rtgs");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankAccount, setBankAccount] = useState("HDFC Bank Escrow (SPV-01)");
  const [notes, setNotes] = useState("");
  const [autoAllocate, setAutoAllocate] = useState(true);

  // S-44: Manual Allocation Modal
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [activePaymentForAlloc, setActivePaymentForAlloc] = useState<PaymentItem | null>(null);
  const [openInvoices, setOpenInvoices] = useState<OpenInvoice[]>([]);
  const [allocating, setAllocating] = useState(false);
  const [allocInputs, setAllocInputs] = useState<Record<string, number>>({});

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const json = await res.json();
      if (json.success || json.payments) {
        setPayments(json.payments || []);
      }
      const occRes = await fetch("/api/occupants");
      const occJson = await occRes.json();
      if (occJson.occupants) {
        setOccupants(occJson.occupants);
      }
    } catch (e) {
      console.error("Failed to load payments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecording(true);
      const parsedAmt = parseFloat(paymentAmount || "0");
      if (parsedAmt <= 0) {
        alert("Payment amount must be greater than zero");
        return;
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: selectedOccupantId,
          amount_inr: parsedAmt,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          payment_date: paymentDate,
          bank_account: bankAccount,
          notes,
          auto_allocate: autoAllocate,
        }),
      });
      const json = await res.json();
      if (json.success || json.payment) {
        setIsRecordDrawerOpen(false);
        resetRecordForm();
        fetchPayments();
        alert(json.message || "Payment recorded successfully!");
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setRecording(false);
    }
  };

  const resetRecordForm = () => {
    setSelectedOccupantId("");
    setPaymentAmount("");
    setReferenceNumber("");
    setNotes("");
  };

  const handleOpenAllocationModal = async (payment: PaymentItem) => {
    setActivePaymentForAlloc(payment);
    setIsAllocModalOpen(true);
    try {
      const res = await fetch(`/api/invoices?occupant_id=${payment.occupant_id}&status=unpaid`);
      const json = await res.json();
      const invs: OpenInvoice[] = (json.invoices || []).map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date,
        gross_total: parseFloat(inv.gross_total || "0"),
        amount_paid: parseFloat(inv.amount_paid || "0"),
        balance_due: parseFloat(inv.balance_due || "0"),
      }));
      setOpenInvoices(invs);
      setAllocInputs({});
    } catch (e) {
      console.error("Failed to load occupant invoices:", e);
    }
  };

  const handleAllocateOldestFirst = () => {
    if (!activePaymentForAlloc) return;
    let remaining = activePaymentForAlloc.unallocated_amount_inr;
    const inputs: Record<string, number> = {};

    openInvoices.forEach((inv) => {
      if (remaining <= 0) {
        inputs[inv.id] = 0;
        return;
      }
      const canAlloc = Math.min(remaining, inv.balance_due);
      inputs[inv.id] = canAlloc;
      remaining -= canAlloc;
    });

    setAllocInputs(inputs);
  };

  const handleCommitAllocation = async () => {
    if (!activePaymentForAlloc) return;
    try {
      setAllocating(true);
      const allocationsPayload = Object.entries(allocInputs)
        .filter(([_, amt]) => amt > 0)
        .map(([invoiceId, amt]) => ({
          invoice_id: invoiceId,
          amount_allocated_inr: amt,
        }));

      if (allocationsPayload.length === 0) {
        alert("Please allocate an amount to at least one invoice.");
        return;
      }

      const res = await fetch(`/api/payments/${activePaymentForAlloc.id}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: allocationsPayload }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAllocModalOpen(false);
        fetchPayments();
        alert(json.message || "Payment allocated successfully (Formula F-12)!");
      } else {
        alert(json.error || "Failed to commit allocation");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAllocating(false);
    }
  };

  // Metrics
  const totalCollections = payments.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
  const totalUnallocated = payments.reduce((sum, p) => sum + (p.unallocated_amount_inr || 0), 0);
  const totalAllocated = payments.reduce((sum, p) => sum + (p.amount_allocated_inr || 0), 0);
  const allocPct = totalCollections > 0 ? Math.round((totalAllocated / totalCollections) * 100) : 100;

  const filteredPayments = payments.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.payment_number.toLowerCase().includes(q) ||
        (p.occupant_name && p.occupant_name.toLowerCase().includes(q)) ||
        (p.reference_number && p.reference_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Screen S-43 &middot; Payment Centre
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Formula F-12 Allocations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Collections, Receipts & Payment Allocations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record bank transfers, NEFT/RTGS UTRs and cheques, track unallocated cash balances, and split receipts across open invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsRecordDrawerOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>

          <Link
            href="/operate/sync/bank-reconcile"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200"
          >
            MT940 Bank Sync
          </Link>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Payments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Gross Collections Logged
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{totalCollections.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across all banking channels
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Unallocated Cash Pool
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            ₹{totalUnallocated.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting invoice matching
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Allocation Ratio
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {allocPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Receipts cleared against invoices
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Payment Records
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {payments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Audit-logged vouchers
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search payment #, occupant, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "unallocated", "partially_allocated", "allocated"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition ${
                filterStatus === st ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile App Cards View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Payments Found</div>
            <p className="text-xs text-slate-500 mt-1">Tap &quot;Record Payment&quot; to log a collection.</p>
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900 block">{p.payment_number}</span>
                  <span className="text-[11px] text-slate-400">{p.payment_date}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  p.status === "allocated" ? "bg-emerald-100 text-emerald-800" :
                  p.status === "partially_allocated" ? "bg-amber-100 text-amber-800" :
                  "bg-rose-100 text-rose-800"
                }`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer:</span>
                  <span className="font-bold text-slate-800">{p.occupant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode & UTR:</span>
                  <span className="font-mono text-slate-700">{p.payment_method.toUpperCase()} &bull; {p.reference_number || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Amount Received</div>
                  <div className="text-base font-black text-slate-900">₹{(p.amount_inr || 0).toLocaleString("en-IN")}</div>
                </div>

                {p.unallocated_amount_inr > 0 ? (
                  <button
                    onClick={() => handleOpenAllocationModal(p)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Allocate (₹{p.unallocated_amount_inr.toLocaleString("en-IN")})
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Occupant</th>
                <th className="py-3 px-4">Mode & UTR</th>
                <th className="py-3 px-4 text-right">Received (₹)</th>
                <th className="py-3 px-4 text-right">Allocated (₹)</th>
                <th className="py-3 px-4 text-right">Unallocated (₹)</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payment collections recorded. Click &quot;Record Payment&quot; to log a collection.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.payment_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.occupant_name}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {p.payment_method.toUpperCase()} &bull; {p.reference_number || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{(p.amount_inr || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-mono">
                      ₹{(p.amount_allocated_inr || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-amber-700">
                      ₹{(p.unallocated_amount_inr || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.payment_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === "allocated" ? "bg-emerald-100 text-emerald-800" :
                        p.status === "partially_allocated" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.unallocated_amount_inr > 0 ? (
                        <button
                          onClick={() => handleOpenAllocationModal(p)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm"
                        >
                          Allocate (S-44)
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* S-43: Record Payment Drawer */}
      {isRecordDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                    S-43 Drawer
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    Record Offline Collection / Payment
                  </h2>
                </div>
                <button
                  onClick={() => setIsRecordDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Occupant / Payer *</label>
                  <select
                    value={selectedOccupantId}
                    onChange={(e) => setSelectedOccupantId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Commercial Occupant --</option>
                    {occupants.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.occupant_name} ({occ.pan_number || "PAN N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount Received (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Payment Mode *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="neft_rtgs">NEFT / RTGS</option>
                      <option value="imps">IMPS</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">UTR / Cheque Ref # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CMS294820492"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deposit SPV Bank Account</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Bank reference, TDS deductions noted by tenant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">Auto-Allocate to Invoices</div>
                    <div className="text-[11px] text-emerald-700">Applies to oldest outstanding invoice first (Formula F-12)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAllocate}
                    onChange={(e) => setAutoAllocate(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRecordDrawerOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recording}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {recording ? "Recording..." : "Record Receipt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* S-44: Manual Allocation Modal */}
      {isAllocModalOpen && activePaymentForAlloc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded">
                  Screen S-44 &middot; Formula F-12
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Manual Payment Allocation &middot; {activePaymentForAlloc.payment_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Occupant: <strong>{activePaymentForAlloc.occupant_name}</strong> &bull; Total: ₹{activePaymentForAlloc.amount_inr.toLocaleString("en-IN")} &bull; Unallocated: <strong className="text-amber-700">₹{activePaymentForAlloc.unallocated_amount_inr.toLocaleString("en-IN")}</strong>
                </p>
              </div>
              <button onClick={() => setIsAllocModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Open Invoices for this Occupant</span>
                <button
                  type="button"
                  onClick={handleAllocateOldestFirst}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Auto-Fill Oldest Due First
                </button>
              </div>

              {openInvoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No open unpaid invoices found for this occupant. Payment balance remains unallocated in the credit pool.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Gross Total</th>
                        <th className="py-2.5 px-3 text-right">Balance Due</th>
                        <th className="py-2.5 px-3 text-right w-36">Allocate (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {openInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                          <td className="py-2.5 px-3 text-slate-500">{inv.due_date}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹{inv.gross_total.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">₹{inv.balance_due.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              max={inv.balance_due}
                              value={allocInputs[inv.id] !== undefined ? allocInputs[inv.id] : ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value || "0");
                                setAllocInputs((prev) => ({ ...prev, [inv.id]: val }));
                              }}
                              className="w-28 text-right px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold font-mono text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="text-xs text-slate-600">
                Total to Allocate: <strong className="text-emerald-700 font-mono">₹{Object.values(allocInputs).reduce((s, v) => s + (v || 0), 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAllocModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitAllocation}
                  disabled={allocating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {allocating ? "Committing..." : "Commit Allocation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

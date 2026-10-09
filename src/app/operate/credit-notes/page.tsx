"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldCheck,
  Calendar,
  X,
  Send,
  Printer,
  ExternalLink,
} from "lucide-react";

interface AdjustmentNote {
  id: string;
  noteNumber: string;
  noteType: "credit_note" | "debit_note";
  reason: string;
  amount: string;
  gstAmount: string;
  totalAdjustment: string;
  issuedDate: string;
  status: string;
  invoiceNumber?: string;
  invoiceBalanceDue?: string;
  invoiceGrossTotal?: string;
  createdAt: string;
}

interface ParentInvoiceOption {
  id: string;
  invoice_number: string;
  occupant_name: string;
  balance_due: string;
  gross_total: string;
  invoice_date: string;
}

export default function CreditNotesPage() {
  const [notes, setNotes] = useState<AdjustmentNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit_note" | "debit_note">("all");

  // Drawer / Modal state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [invoices, setInvoices] = useState<ParentInvoiceOption[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [noteType, setNoteType] = useState<"credit_note" | "debit_note">("credit_note");
  const [amount, setAmount] = useState("");
  const [reasonCode, setReasonCode] = useState("04");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adjustment-notes");
      const json = await res.json();
      if (json.success) {
        setNotes(json.notes || []);
      }
    } catch (e) {
      console.error("Failed to fetch adjustment notes:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const json = await res.json();
      if (json.invoices) {
        setInvoices(
          json.invoices.map((inv: any) => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            occupant_name: inv.occupant_name || "Commercial Occupant",
            balance_due: inv.balance_due || "0.00",
            gross_total: inv.gross_total || "0.00",
            invoice_date: inv.invoice_date,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load parent invoices:", e);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchInvoices();
  }, []);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const parsedAmount = parseFloat(amount) || 0;
  const reverseGst = Math.round(parsedAmount * 0.18 * 100) / 100;
  const totalAdj = Math.round((parsedAmount + reverseGst) * 100) / 100;
  const originalBalance = parseFloat(selectedInvoice?.balance_due || "0");
  const newBalance =
    noteType === "credit_note"
      ? Math.max(0, originalBalance - totalAdj)
      : originalBalance + totalAdj;

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert("Please select a parent invoice");
      return;
    }
    if (parsedAmount <= 0) {
      alert("Please enter a valid taxable amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/adjustment-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId,
          note_type: noteType,
          amount: parsedAmount,
          reason: reasonCode,
          gst_rate: 18,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsDrawerOpen(false);
        setAmount("");
        setSelectedInvoiceId("");
        fetchNotes();
        fetchInvoices();
        alert(json.message);
      } else {
        alert(json.error || "Failed to issue adjustment note");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (filterType !== "all" && n.noteType !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        n.noteNumber.toLowerCase().includes(q) ||
        (n.invoiceNumber && n.invoiceNumber.toLowerCase().includes(q)) ||
        (n.reason && n.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCreditAmount = notes
    .filter((n) => n.noteType === "credit_note")
    .reduce((s, n) => s + parseFloat(n.totalAdjustment || "0"), 0);

  const totalDebitAmount = notes
    .filter((n) => n.noteType === "debit_note")
    .reduce((s, n) => s + parseFloat(n.totalAdjustment || "0"), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              Screen S-42 &middot; Credit / Debit Notes
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Rule 53 Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Credit & Debit Note Register & Drawer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Statutory GST adjustment notes with reverse tax calculations, parent invoice balance offsets (Formula F-12), and reason codes.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              setIsDrawerOpen(true);
            }}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Issue Note
          </button>

          <button
            onClick={fetchNotes}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Notes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/operate/invoices"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200"
          >
            Invoices
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Credit Notes Issued
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalCreditAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Reversed GST and occupant credits
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Debit Notes Issued
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalDebitAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            CAM True-Up recoveries & supplementary charges
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Financial Adjustment
            </span>
            <span className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{(totalDebitAmount - totalCreditAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Net ledger adjustment across all portfolios
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search note #, invoice #, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Notes ({notes.length})
          </button>
          <button
            onClick={() => setFilterType("credit_note")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === "credit_note"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Credit Notes
          </button>
          <button
            onClick={() => setFilterType("debit_note")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === "debit_note"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            Debit Notes
          </button>
        </div>
      </div>

      {/* Mobile App Cards View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Adjustment Notes</div>
            <p className="text-xs text-slate-500 mt-1">Tap &quot;Issue Note&quot; to generate an adjustment.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isCredit = note.noteType === "credit_note";
            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900 block">
                      {note.noteNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {note.issuedDate}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCredit
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                    }`}
                  >
                    {isCredit ? "Credit Note" : "Debit Note"}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent Inv:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {note.invoiceNumber || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST Reason:</span>
                    <span className="text-slate-700 truncate max-w-[180px]">
                      {note.reason}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Adjustment</div>
                    <div className="text-base font-black text-slate-900">
                      ₹{parseFloat(note.totalAdjustment || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {note.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes Register Table (Desktop / Tablet) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Note Number</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Parent Invoice</th>
                <th className="py-3 px-4">GST Reason</th>
                <th className="py-3 px-4 text-right">Taxable (₹)</th>
                <th className="py-3 px-4 text-right">GST (₹)</th>
                <th className="py-3 px-4 text-right">Total Adjustment</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No adjustment notes found. Click &quot;Issue Credit / Debit Note&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => {
                  const isCredit = note.noteType === "credit_note";
                  return (
                    <tr key={note.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {note.noteNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCredit
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          }`}
                        >
                          {isCredit ? "Credit Note" : "Debit Note"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {note.invoiceNumber ? (
                          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {note.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {note.reason}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        ₹{parseFloat(note.amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        ₹{parseFloat(note.gstAmount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{parseFloat(note.totalAdjustment || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {note.issuedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {note.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/api/invoices/${note.noteNumber}/pdf`}
                          target="_blank"
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded inline-flex items-center"
                          title="Print / View Note"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* S-42 UI DRAWER / MODAL: ISSUE CREDIT OR DEBIT NOTE */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                    S-42 Drawer
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Issue Credit / Debit Note
                  </h2>
                  <p className="text-xs text-slate-500">
                    Compliant with GST Rule 53 and Section 34 of CGST Act.
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitNote} className="p-6 space-y-4">
                {/* Note Type Toggle */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Adjustment Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteType("credit_note")}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                        noteType === "credit_note"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" /> Credit Note (Refund/Rebate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteType("debit_note")}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                        noteType === "debit_note"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" /> Debit Note (Additional Charge)
                    </button>
                  </div>
                </div>

                {/* Parent Invoice Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Parent Invoice *
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Choose Parent Invoice to Adjust --</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} &middot; {inv.occupant_name} (Bal: ₹
                        {parseFloat(inv.balance_due).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Invoice Snapshot */}
                {selectedInvoice && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-800">
                      Parent Invoice: {selectedInvoice.invoice_number}
                    </div>
                    <div className="text-slate-600">
                      Occupant: {selectedInvoice.occupant_name}
                    </div>
                    <div className="flex justify-between text-slate-700 pt-1">
                      <span>Gross Total: ₹{parseFloat(selectedInvoice.gross_total).toLocaleString("en-IN")}</span>
                      <span className="font-bold text-amber-700">
                        Current Balance: ₹{originalBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Taxable Amount Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Taxable Adjustment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Statutory Reason Code */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    GST Statutory Reason Code *
                  </label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="01">01 &middot; Sales Return</option>
                    <option value="02">02 &middot; Post Sale Commercial Discount</option>
                    <option value="03">03 &middot; Deficiency in Service / Demised Area Adjustment</option>
                    <option value="04">04 &middot; Correction in Invoice / CAM Year-End True-Up</option>
                    <option value="05">05 &middot; Change in Place of Supply</option>
                    <option value="06">06 &middot; Final Lease Exit Settlement</option>
                  </select>
                </div>

                {/* Live GST & Balance Calculation Preview (Formula F-12) */}
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Statutory Reverse GST & Balance Preview (F-12)
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Taxable Base:</span>
                    <span className="font-mono font-semibold">₹{parsedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Reverse GST @ 18%:</span>
                    <span className="font-mono font-semibold">₹{reverseGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-amber-200 pt-1">
                    <span>Total Note Adjustment:</span>
                    <span className="font-mono text-amber-800">₹{totalAdj.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-amber-200 pt-1">
                    <span>New Balance Due on Parent:</span>
                    <span className="font-mono text-emerald-800">₹{newBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || parsedAmount <= 0}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Confirm & Issue {noteType === "credit_note" ? "Credit Note" : "Debit Note"}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 text-center">
              Officiating under CGST Act Section 34 &middot; Sequential Audit Log Record Generated
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

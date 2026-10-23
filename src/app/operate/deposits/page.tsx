"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Building,
  CheckCircle2,
  Calendar,
  FileText,
  ArrowRight,
  TrendingUp,
  Download,
  Filter,
  Check,
  X,
  CreditCard,
  Lock,
} from "lucide-react";

interface DepositItem {
  id: string;
  contract_code: string;
  property_name: string;
  occupant_name: string;
  occupant_id: string;
  contract_status: string;
  cash_held: number;
  bg_held: number;
  total_held: number;
  monthly_rent: number;
  deposit_months: number;
  required_amount: number;
  shortfall_amount: number;
  cover_months: number;
  active_bg_number: string | null;
  active_bg_bank: string | null;
  active_bg_expiry: string | null;
  days_to_bg_expiry: number | null;
  bg_expiring_soon: boolean;
  transactions_count: number;
}

interface DepositSummary {
  total_required: number;
  total_held: number;
  total_shortfall: number;
  expiring_bg_count: number;
  pending_refunds: number;
  contracts_count: number;
}

export default function SecurityDepositsPage() {
  const [items, setItems] = useState<DepositItem[]>([]);
  const [summary, setSummary] = useState<DepositSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "shortfall" | "bg_expiring">("all");

  // Record Deposit Transaction Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DepositItem | null>(null);
  const [txType, setTxType] = useState<"receipt" | "top_up_demand" | "adjustment_against_dues" | "refund" | "forfeiture">("receipt");
  const [instrumentType, setInstrumentType] = useState<"bank_transfer" | "cash" | "bank_guarantee">("bank_transfer");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txRef, setTxRef] = useState("");
  const [bankName, setBankName] = useState("");
  const [bgNumber, setBgNumber] = useState("");
  const [bgValidityDate, setBgValidityDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  async function fetchDeposits() {
    try {
      setLoading(true);
      const res = await fetch("/api/deposits");
      const json = await res.json();
      if (json.success) {
        setItems(json.items || []);
        setSummary(json.summary || null);
      }
    } catch (e) {
      console.error("Failed to fetch deposit ledger:", e);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((it) => {
    if (filterType === "shortfall" && it.shortfall_amount <= 0) return false;
    if (filterType === "bg_expiring" && !it.bg_expiring_soon) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        it.contract_code.toLowerCase().includes(q) ||
        (it.occupant_name && it.occupant_name.toLowerCase().includes(q)) ||
        (it.property_name && it.property_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  async function handleRecordTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContract) return;

    try {
      setSubmitting(true);
      const amt = parseFloat(txAmount);
      if (!amt || amt <= 0) {
        alert("Please enter a valid amount greater than zero.");
        return;
      }

      const res = await fetch("/api/deposits/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: selectedContract.id,
          transaction_type: txType,
          instrument_type: instrumentType,
          amount: amt,
          transaction_date: txDate,
          instrument_reference: txRef || bgNumber || "DEP-TXN",
          bank_name: bankName || null,
          bg_number: instrumentType === "bank_guarantee" ? bgNumber : null,
          validity_date: instrumentType === "bank_guarantee" ? bgValidityDate : null,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record deposit transaction");

      alert(json.message || "Deposit transaction recorded successfully!");
      setIsDrawerOpen(false);
      resetDrawerForm();
      fetchDeposits();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetDrawerForm() {
    setSelectedContract(null);
    setTxType("receipt");
    setInstrumentType("bank_transfer");
    setTxAmount("");
    setTxRef("");
    setBankName("");
    setBgNumber("");
    setBgValidityDate("");
    setNotes("");
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-3.5 sm:p-6 pb-28 md:pb-16 max-w-7xl mx-auto space-y-5">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-[#0F8B7D] uppercase tracking-wider">
              Screen S-47 &middot; Deposits &amp; Bank Guarantees
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-500 font-semibold">Formulas D-13, AL-11, AL-12</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 tracking-tight">
            Security Deposit &amp; BG Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Track held cash deposits, Bank Guarantee expirations (AL-11), escalations shortfall (AL-12), and statutory refund approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDeposits}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#0F8B7D]" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Dashboard Cards (Formula D-13, AL-11, AL-12) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Required</span>
          <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block">
            ₹{summary ? Math.round(summary.total_required).toLocaleString("en-IN") : "0"}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">6 months lease baseline</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider block">Total Held (Cash + BG)</span>
          <span className="text-lg sm:text-xl font-black text-[#0F8B7D] mt-1 block">
            ₹{summary ? Math.round(summary.total_held).toLocaleString("en-IN") : "0"}
          </span>
          <span className="text-[11px] text-teal-700 mt-0.5 block">Liquid security pool</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Deposit Shortfall</span>
          <span
            className={`text-lg sm:text-xl font-black mt-1 block ${
              (summary?.total_shortfall || 0) > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            ₹{summary ? Math.round(summary.total_shortfall).toLocaleString("en-IN") : "0"}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">AL-12 Top-up demanded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Expiring BGs (&le;30d)</span>
          <span
            className={`text-lg sm:text-xl font-black mt-1 block ${
              (summary?.expiring_bg_count || 0) > 0 ? "text-amber-600 font-black" : "text-gray-800"
            }`}
          >
            {summary?.expiring_bg_count ?? 0} active
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Alert AL-11 trigger</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Avg Security Cover</span>
          <span className="text-lg sm:text-xl font-black text-indigo-700 mt-1 block">
            {summary && summary.total_required > 0
              ? `${((summary.total_held / summary.total_required) * 6).toFixed(1)} mo`
              : "6.0 mo"}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">D-13 cover ratio</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant name, contract code, property..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 bg-slate-50 text-xs focus:ring-2 focus:ring-[#0F8B7D]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: "all", label: "All Leases" },
            { key: "shortfall", label: "Shortfalls Only (AL-12)" },
            { key: "bg_expiring", label: "BG Expiring Soon (AL-11)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterType === tab.key
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Register List: Desktop Table + Mobile Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#0F8B7D] mb-2" />
            <p className="text-xs font-semibold">Loading deposit ledger...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShieldCheck size={36} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-gray-800">No deposit records found</p>
            <p className="text-xs text-gray-500 mt-1">
              All commercial contracts are compliant or match no active filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold border-b border-gray-200">
                    <th className="py-2.5 px-3">Contract / Occupant</th>
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3 text-right">Required (D-13)</th>
                    <th className="py-2.5 px-3 text-right">Cash Held</th>
                    <th className="py-2.5 px-3 text-right">BG Held</th>
                    <th className="py-2.5 px-3 text-right">Total Held</th>
                    <th className="py-2.5 px-3 text-right">Shortfall (AL-12)</th>
                    <th className="py-2.5 px-3 text-center">BG Expiry (AL-11)</th>
                    <th className="py-2.5 px-3 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-gray-900 block">{it.contract_code}</span>
                        <span className="text-[11px] text-gray-500">{it.occupant_name}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">{it.property_name || "—"}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-gray-700">
                        ₹{it.required_amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-600">
                        ₹{it.cash_held.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-600">
                        ₹{it.bg_held.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-gray-900">
                        ₹{it.total_held.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {it.shortfall_amount > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            -₹{it.shortfall_amount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-emerald-700">Covered</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {it.active_bg_expiry ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              it.bg_expiring_soon
                                ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {it.active_bg_expiry} ({it.days_to_bg_expiry}d)
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedContract(it);
                            setIsDrawerOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Plus size={12} />
                          <span>Record</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<sm) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredItems.map((it) => (
                <div key={it.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-gray-900 text-xs block">{it.contract_code}</span>
                      <span className="text-[11px] text-gray-500 font-medium">{it.occupant_name}</span>
                    </div>
                    {it.shortfall_amount > 0 ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Shortfall ₹{it.shortfall_amount.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Covered ({it.cover_months} mo)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 text-xs bg-slate-50 p-2 rounded-lg">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Required</span>
                      <span className="font-mono text-gray-700">₹{it.required_amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Held Total</span>
                      <span className="font-mono font-bold text-gray-900">₹{it.total_held.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">BG Expiry</span>
                      <span className="text-[10px] text-gray-600">
                        {it.active_bg_expiry ? `${it.active_bg_expiry}` : "None"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedContract(it);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Record Transaction</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* S-47 Record Deposit Transaction Drawer */}
      {isDrawerOpen && selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-[#0F8B7D] rounded">
                  Screen S-47 &middot; Deposit Ledger Entry
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Record Deposit: {selectedContract.contract_code}
                </h3>
                <p className="text-xs text-gray-500">{selectedContract.occupant_name}</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Transaction Type *</label>
                  <select
                    value={txType}
                    onChange={(e: any) => setTxType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                  >
                    <option value="receipt">Deposit Receipt (New / Top-up)</option>
                    <option value="top_up_demand">Demand Shortfall Notice</option>
                    <option value="adjustment_against_dues">Adjust Against Overdue Invoices</option>
                    <option value="refund">Refund (Exit / Surrender)</option>
                    <option value="forfeiture">Forfeiture (Breach / Default)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Instrument Type *</label>
                  <select
                    value={instrumentType}
                    onChange={(e: any) => setInstrumentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                  >
                    <option value="bank_transfer">NEFT / RTGS Wire</option>
                    <option value="bank_guarantee">Bank Guarantee (BG)</option>
                    <option value="cash">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-900 focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>
              </div>

              {instrumentType === "bank_guarantee" ? (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider block">
                    Bank Guarantee Details (AL-11 Countdown)
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">BG Number *</label>
                      <input
                        type="text"
                        required
                        value={bgNumber}
                        onChange={(e) => setBgNumber(e.target.value)}
                        placeholder="e.g. BG-HDFC-99214"
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Issuing Bank *</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank"
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Validity Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={bgValidityDate}
                      onChange={(e) => setBgValidityDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Reference / UTR / Cheque #</label>
                  <input
                    type="text"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    placeholder="e.g. UTR441928471"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Audit Notes / Reason</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context for auditor..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Commit Transaction</span>
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

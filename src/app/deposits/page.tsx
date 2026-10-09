"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  ChevronRight,
  Filter,
  Eye,
  Sliders,
  Send,
  Download,
} from "lucide-react";

interface DepositItem {
  contract_id: string;
  contract_code: string;
  property_id: string;
  property_name: string;
  occupant_id: string;
  occupant_name: string;
  security_deposit_type: string;
  deposit_months: number;
  monthly_rent: number;
  required_amount: number;
  held_amount: number;
  cash_held: number;
  bg_held: number;
  shortfall_amount: number;
  cover_months: number;
  bg_number: string | null;
  bg_bank: string | null;
  bg_expiry_date: string | null;
  claim_date: string | null;
  days_to_bg_expiry: number | null;
  bg_expiring_soon: boolean;
  has_shortfall: boolean;
  transactions: any[];
}

export default function SecurityDepositsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: {
      total_required: number;
      total_held: number;
      total_shortfall: number;
      expiring_bg_count: number;
      pending_refunds: number;
    };
    deposits: DepositItem[];
    recent_transactions: any[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "shortfalls" | "bg_register" | "transactions">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("all");

  // Transaction Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DepositItem | null>(null);
  const [txType, setTxType] = useState<"receipt" | "top_up_demand" | "adjustment_against_dues" | "refund" | "forfeiture">("receipt");
  const [txInstrument, setTxInstrument] = useState<"bank_transfer" | "bank_guarantee" | "cheque" | "demand_draft">("bank_transfer");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [txReference, setTxReference] = useState("");
  const [txBank, setTxBank] = useState("");
  const [txValidityDate, setTxValidityDate] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/deposits?property_id=${selectedProperty}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [selectedProperty]);

  const handleOpenModal = (contractItem?: DepositItem, defaultType: typeof txType = "receipt") => {
    setSelectedContract(contractItem || (data?.deposits[0] ?? null));
    setTxType(defaultType);
    setTxAmount(defaultType === "top_up_demand" && contractItem ? String(contractItem.shortfall_amount) : "");
    setTxReference("");
    setTxNotes("");
    setModalOpen(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !txAmount) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/deposits/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: selectedContract.contract_id,
          transaction_type: txType,
          instrument_type: txInstrument,
          amount: txAmount,
          date: txDate,
          reference: txReference,
          bank_name: txBank,
          validity_date: txValidityDate || undefined,
          notes: txNotes,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(json.message || "Transaction recorded successfully");
        setModalOpen(false);
        fetchDeposits();
        setTimeout(() => setActionSuccess(""), 4000);
      } else {
        alert(json.error || "Failed to record transaction");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDeposits = (data?.deposits || []).filter((d) => {
    const matchesSearch =
      d.occupant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contract_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.property_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "shortfalls") return d.has_shortfall;
    if (activeTab === "bg_register") return d.security_deposit_type === "bank_guarantee" || d.bg_number;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Banner / Breadcrumb */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <span>Operations & Risk</span>
              <span>•</span>
              <span>Screen S-47</span>
              <span>•</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Formula F-13 & Alert AL-12
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Security Deposits & Bank Guarantees
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Held vs. required deposit tracker, BG expiry register, escalation shortfall top-up calculator & refund ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDeposits()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Refresh register"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium">Total Required Deposits</div>
            <div className="text-xl font-bold text-white mt-1.5">
              ₹{(data?.summary.total_required || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Based on contracted deposit months</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium">Total Held (Cash + BG)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1.5">
              ₹{(data?.summary.total_held || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Under custody
            </div>
          </div>

          <div className="bg-slate-900/80 border border-amber-900/30 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-amber-400/90 font-medium flex items-center justify-between">
              <span>Shortfall (AL-12)</span>
              {(data?.summary.total_shortfall || 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1.5">
              ₹{(data?.summary.total_shortfall || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-amber-500/80 mt-1">Due to rent escalations & adjustments</div>
          </div>

          <div className="bg-slate-900/80 border border-rose-900/30 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-rose-400/90 font-medium flex items-center justify-between">
              <span>BG Expiring &lt;30d (AL-11)</span>
              {(data?.summary.expiring_bg_count || 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1.5">
              {data?.summary.expiring_bg_count || 0} BGs
            </div>
            <div className="text-[11px] text-rose-500/80 mt-1">Requires renewal demand notice</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium">Pending Refund Approvals</div>
            <div className="text-xl font-bold text-sky-400 mt-1.5">
              {data?.summary.pending_refunds || 0}
            </div>
            <div className="text-[11px] text-sky-500/80 mt-1">Exit settlement requests awaiting sign-off</div>
          </div>
        </div>

        {/* Tab Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              All Leases ({data?.deposits.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("shortfalls")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "shortfalls"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Shortfall Top-ups (AL-12)</span>
            </button>
            <button
              onClick={() => setActiveTab("bg_register")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "bg_register"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>BG Expiry Register (AL-11)</span>
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === "transactions"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              Audit Ledger ({data?.recent_transactions.length || 0})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search member, contract, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Tab 1: Deposits Register Table */}
        {activeTab !== "transactions" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tenant & Contract</th>
                    <th className="py-3 px-4 font-semibold">Property</th>
                    <th className="py-3 px-4 font-semibold text-right">Required (M × Rent)</th>
                    <th className="py-3 px-4 font-semibold text-right">Held (Cash + BG)</th>
                    <th className="py-3 px-4 font-semibold text-right">Shortfall (AL-12)</th>
                    <th className="py-3 px-4 font-semibold text-center">Cover (Months)</th>
                    <th className="py-3 px-4 font-semibold">BG Details & Expiry</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                        No deposit records found matching the active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDeposits.map((item) => (
                      <tr
                        key={item.contract_id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          item.has_shortfall ? "bg-amber-950/10" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-semibold text-slate-100">{item.occupant_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.contract_code}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-sans">
                          {item.property_name}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-medium text-slate-200">
                            ₹{item.required_amount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {item.deposit_months} mo × ₹{Math.round(item.monthly_rent).toLocaleString("en-IN")}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-semibold text-emerald-400">
                            ₹{item.held_amount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.cash_held > 0 ? `Cash: ₹${item.cash_held.toLocaleString("en-IN")}` : ""}
                            {item.bg_held > 0 ? ` · BG: ₹${item.bg_held.toLocaleString("en-IN")}` : ""}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {item.shortfall_amount > 0 ? (
                            <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 text-xs font-bold">
                              <span>₹{item.shortfall_amount.toLocaleString("en-IN")}</span>
                            </div>
                          ) : (
                            <span className="text-emerald-500 text-xs">Fully Funded</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.cover_months >= item.deposit_months
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {item.cover_months} mo
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          {item.bg_number ? (
                            <div>
                              <div className="text-slate-200 font-medium font-mono text-xs">{item.bg_number}</div>
                              <div className="text-[11px] text-slate-400">{item.bg_bank || "Bank Guarantee"}</div>
                              {item.bg_expiry_date && (
                                <div
                                  className={`text-[10px] flex items-center gap-1 mt-0.5 ${
                                    item.bg_expiring_soon ? "text-rose-400 font-bold" : "text-slate-500"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Exp: {item.bg_expiry_date}</span>
                                  {item.days_to_bg_expiry !== null && (
                                    <span>({item.days_to_bg_expiry}d left)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs">Cash Only</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.has_shortfall && (
                              <button
                                onClick={() => handleOpenModal(item, "top_up_demand")}
                                className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium transition-colors"
                                title="Issue Top-Up Demand Notice"
                              >
                                Demand Top-Up
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenModal(item, "receipt")}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                            >
                              Add Cash/BG
                            </button>
                            <button
                              onClick={() => handleOpenModal(item, "refund")}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                            >
                              Exit Refund
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Audit Transactions Ledger */}
        {activeTab === "transactions" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Deposit Transactions & Refund Audit Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete history of deposit receipts, top-up demands, exit refunds, and forfeiture approvals.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Instrument</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Reference / Bank</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(data?.recent_transactions || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        No transactions recorded in the ledger yet.
                      </td>
                    </tr>
                  ) : (
                    data?.recent_transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-300">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              tx.transactionType === "receipt" || tx.transactionType === "received"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : tx.transactionType === "top_up_demand"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : tx.transactionType === "refund"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{tx.instrumentType}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-100">
                          ₹{Number(tx.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {tx.instrumentReference || tx.bankName || "—"}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.status === "active" || tx.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : tx.status === "pending_approval"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{tx.notes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Deposit Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Record Deposit Transaction</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedContract ? `${selectedContract.occupant_name} (${selectedContract.contract_code})` : "Select Contract"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-5 space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Type *</label>
                <select
                  value={txType}
                  onChange={(e: any) => setTxType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="receipt">receipt — Deposit Received (Cash / Transfer)</option>
                  <option value="top_up_demand">top_up_demand — Issue Escalation Shortfall Demand</option>
                  <option value="adjustment_against_dues">adjustment_against_dues — Offset Unpaid Invoices</option>
                  <option value="refund">refund — Lease Exit Settlement Refund</option>
                  <option value="forfeiture">forfeiture — Deposit Forfeiture (Breach)</option>
                </select>
              </div>

              {/* Instrument Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Instrument *</label>
                <select
                  value={txInstrument}
                  onChange={(e: any) => setTxInstrument(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="bank_transfer">bank_transfer (NEFT / RTGS)</option>
                  <option value="bank_guarantee">bank_guarantee (BG Register)</option>
                  <option value="cheque">cheque</option>
                  <option value="demand_draft">demand_draft</option>
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Reference & Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reference / UTR / BG #</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC/BG/2026/09"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issuing Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank"
                    value={txBank}
                    onChange={(e) => setTxBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* If BG: Expiry Date */}
              {txInstrument === "bank_guarantee" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">BG Expiry Date (Alert AL-11)</label>
                  <input
                    type="date"
                    value={txValidityDate}
                    onChange={(e) => setTxValidityDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Remarks & Audit Notes</label>
                <textarea
                  rows={2}
                  placeholder="Escalation top-up or exit deduction details..."
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  {submitting ? "Saving..." : "Record Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building,
  Landmark,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt,
  Printer,
  Calendar,
  AlertCircle
} from "lucide-react";

interface StatementData {
  statement_id: string;
  statement_number: string;
  client_account_id: string;
  client_name: string;
  client_code: string;
  period_month: string;
  status: string;
  is_locked: boolean;
  billing_entity: {
    legal_name: string;
    pan: string;
    gstin: string;
    state: string;
  };
  operator_billing_entity: {
    legal_name: string;
    gstin: string;
  };
  financials: {
    gross_billed: number;
    total_collected: number;
    arrears_carried_forward: number;
    collection_efficiency_pct: number;
    operator_management_fee: number;
    mgmt_fee_rate_pct: number;
    gst_on_management_fee: number;
    reimbursable_expenses: number;
    net_remittance_to_owner: number;
  };
  bank_account: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    branch: string;
  };
  remittance: {
    status: string;
    remittance_date: string;
    utr_number: string | null;
  };
  invoices: Array<{
    number: string;
    date: string;
    occupant: string;
    space: string;
    gross: number;
    collected: number;
    balance: number;
    status: string;
  }>;
  expenses_breakdown: Array<{
    item: string;
    vendor: string;
    amount: number;
  }>;
  all_clients: Array<{ id: string; name: string; code: string }>;
}

export default function OwnerStatementsPage() {
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("Oct-2026");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState("HDFCR20261010009182");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStatement();
  }, [selectedPeriod, selectedClientId]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const url = `/api/owner-statements?period=${selectedPeriod}${selectedClientId ? `&client_account_id=${selectedClientId}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (!selectedClientId && json.data.client_account_id) {
          setSelectedClientId(json.data.client_account_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueStatement = async () => {
    if (!data) return;
    setIsIssuing(true);
    try {
      const res = await fetch("/api/owner-statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_account_id: data.client_account_id,
          period_month: selectedPeriod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Statement issued and frozen successfully per Formula F-21 & RR-OPR-06.");
        fetchStatement();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleSaveUtr = async () => {
    if (!data) return;
    try {
      const res = await fetch("/api/owner-statements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement_id: data.statement_id,
          remittance_utr: utrNumber,
          remittance_date: new Date().toISOString().split("T")[0],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowUtrModal(false);
        setMessage("Remittance UTR saved. Owner statement status updated.");
        fetchStatement();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-28 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Screen S-55
              </span>
              <span className="text-xs text-slate-500 font-mono">Multi-Client Operator Layer</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Landmark className="text-[#0D7B6C]" size={26} />
              Owner Statements Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monthly portfolio accounting, management fee calculation (Formula F-20), and net owner remittance ledger (Formula F-21).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {data?.all_clients && (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm font-medium text-slate-700"
              >
                {data.all_clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm font-medium text-slate-700"
            >
              <option value="Oct-2026">October 2026</option>
              <option value="Sep-2026">September 2026</option>
              <option value="Aug-2026">August 2026</option>
            </select>

            <a
              href={`/api/owner-statements/default/pdf?period=${selectedPeriod}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm flex items-center gap-2"
            >
              <Printer size={16} /> Print / Export PDF
            </a>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-emerald-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Computing owner statement accounts...</p>
          </div>
        ) : data ? (
          <>
            {/* Top Status Banner */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-bold">
                  <Receipt size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{data.client_name}</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 font-mono">
                      {data.statement_number}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                      {data.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    SPV: {data.billing_entity.legal_name} • GSTIN: {data.billing_entity.gstin}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUtrModal(true)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Record Remittance UTR
                </button>
                <button
                  onClick={handleIssueStatement}
                  disabled={isIssuing || data.is_locked}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5 ${
                    data.is_locked
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-[#0D7B6C] hover:bg-[#09574C] text-white"
                  }`}
                >
                  <ShieldCheck size={14} />
                  {data.is_locked ? "Statement Locked & Frozen" : "Approve & Freeze Statement"}
                </button>
              </div>
            </div>

            {/* Financial Highlights Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase">Gross Billed</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  ₹{(data.financials.gross_billed / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Rent + CAM gross</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase">Total Collected</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  ₹{(data.financials.total_collected / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-emerald-600 mt-0.5">
                  {data.financials.collection_efficiency_pct}% efficiency
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase">Mgmt Fee (F-20)</div>
                <div className="text-xl font-bold text-amber-700 mt-1">
                  -₹{(data.financials.operator_management_fee / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-slate-400 mt-0.5">4.0% of collections</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase">GST on Fee</div>
                <div className="text-xl font-bold text-slate-700 mt-1">
                  -₹{(data.financials.gst_on_management_fee / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-slate-400 mt-0.5">18% GST (invoiced)</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase">Owner Expenses</div>
                <div className="text-xl font-bold text-slate-700 mt-1">
                  -₹{(data.financials.reimbursable_expenses / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-slate-400 mt-0.5">HVAC PPM & repairs</div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 shadow-sm col-span-2 md:col-span-1">
                <div className="text-xs font-bold text-emerald-800 uppercase">Net Remittance (F-21)</div>
                <div className="text-xl font-extrabold text-[#0D7B6C] mt-1">
                  ₹{(data.financials.net_remittance_to_owner / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">To owner bank account</div>
              </div>
            </div>

            {/* Detailed Statement Ledger (Specification Table §13.8) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Owner Statement Reconciliation Ledger — {selectedPeriod}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formulas F-20 (Management Fee) & F-21 (Net Remittance) verified against Indian Commercial Tax Standards
                  </p>
                </div>
                <div className="text-xs font-mono font-medium text-slate-500">
                  Cut-off: 07-Oct-2026 • Remittance: 10-Oct-2026
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-sm">
                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">1. Gross Rent & CAM Billed in Period</span>
                    <p className="text-xs text-slate-500">Total tax invoices issued across portfolio spaces</p>
                  </div>
                  <span className="font-bold text-slate-900">₹{data.financials.gross_billed.toLocaleString()}</span>
                </div>

                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">2. Total Collections Received</span>
                    <p className="text-xs text-slate-500">Occupant settlements cleared in bank account</p>
                  </div>
                  <span className="font-bold text-emerald-700">₹{data.financials.total_collected.toLocaleString()}</span>
                </div>

                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">3. Arrears Carried Forward</span>
                    <p className="text-xs text-slate-500">Uncollected dues carried into 30-day bucket</p>
                  </div>
                  <span className="font-bold text-amber-700">₹{data.financials.arrears_carried_forward.toLocaleString()}</span>
                </div>

                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50 bg-red-50/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">4. Operator Management Fee (Formula F-20)</span>
                    <p className="text-xs text-slate-500">4.00% applied on collections</p>
                  </div>
                  <span className="font-bold text-red-600">-₹{data.financials.operator_management_fee.toLocaleString()}</span>
                </div>

                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50 bg-red-50/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">5. GST on Management Fee @ 18%</span>
                    <p className="text-xs text-slate-500">Invoiced separately by operator billing entity</p>
                  </div>
                  <span className="font-bold text-red-600">-₹{data.financials.gst_on_management_fee.toLocaleString()}</span>
                </div>

                <div className="px-6 py-3.5 flex justify-between items-center hover:bg-slate-50 bg-red-50/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">6. Reimbursable Direct Expenses Paid on Owner's Behalf</span>
                    <p className="text-xs text-slate-500">Approved contractor PPM, security guarding & facility upkeep</p>
                  </div>
                  <span className="font-bold text-red-600">-₹{data.financials.reimbursable_expenses.toLocaleString()}</span>
                </div>

                {/* Final Net Remittance Row */}
                <div className="px-6 py-4.5 bg-emerald-50/70 border-t-2 border-emerald-500 flex justify-between items-center">
                  <div>
                    <span className="text-base font-extrabold text-emerald-950 uppercase tracking-wide">
                      Net Remittance to Owner (Formula F-21)
                    </span>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Bank Transfer to HDFC Bank A/c {data.bank_account.account_number} (IFSC: {data.bank_account.ifsc_code})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#0D7B6C]">
                      ₹{data.financials.net_remittance_to_owner.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-emerald-800">
                      UTR: {data.remittance.utr_number || "Pending Execution (10-Oct)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Underlying Invoices in Statement</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Occupant</th>
                      <th className="py-2.5 px-3">Space</th>
                      <th className="py-2.5 px-3 text-right">Gross Billed</th>
                      <th className="py-2.5 px-3 text-right">Collected</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.invoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.number}</td>
                        <td className="py-2.5 px-3 text-slate-500">{inv.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{inv.occupant}</td>
                        <td className="py-2.5 px-3 text-slate-500">{inv.space}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">₹{inv.gross.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">₹{inv.collected.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-amber-700">₹{inv.balance.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 font-bold rounded-md uppercase text-[10px] ${
                            inv.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UTR Entry Modal */}
            {showUtrModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Record Owner Remittance Bank UTR</h3>
                  <p className="text-xs text-slate-500">
                    Enter the NEFT / RTGS settlement reference provided by the disbursement bank.
                  </p>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Bank UTR / Reference</label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. HDFCR20261010009182"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7B6C] font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setShowUtrModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUtr}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm"
                    >
                      Save & Confirm Remittance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

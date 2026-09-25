"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileSpreadsheet,
  Building2,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface OwnerStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientAccounts: Array<{ id: string; name: string; accountCode: string }>;
}

export const OwnerStatementsModal: React.FC<OwnerStatementsModalProps> = ({
  isOpen,
  onClose,
  clientAccounts
}) => {
  const [statements, setStatements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("ALL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-09");
  const [reimbursableExp, setReimbursableExp] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStatements = async () => {
    setIsLoading(true);
    try {
      const url = selectedClient !== "ALL"
        ? `/api/rent-roll/statements?clientAccountId=${encodeURIComponent(selectedClient)}`
        : "/api/rent-roll/statements";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStatements(data);
      }
    } catch (e) {
      console.error("Failed to fetch statements:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatements();
    }
  }, [isOpen, selectedClient]);

  const handleGenerateStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || selectedClient === "ALL") {
      alert("Please select a specific Client Account to generate a statement.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/rent-roll/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientAccountId: selectedClient,
          periodMonth: selectedPeriod,
          reimbursableExpenses: Number(reimbursableExp) || 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Generated ${data.statementNumber} successfully! Net Remittance: ${formatINR(data.netRemittanceAmount)}`);
        await fetchStatements();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(data.error || "Failed to generate statement");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating statement");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Monthly Owner Statements &amp; Remittances</h3>
              <p className="text-xs text-gray-500">
                Multi-client operator sub-ledger: Billed vs Collected, Operator Fees &amp; Net Disbursed Remittance (RR-OPR-01)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Generator Form */}
          <form onSubmit={handleGenerateStatement} className="p-4 bg-gray-50 rounded-xl border border-gray-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Generate New Monthly Owner Statement
              </span>
              <span className="text-[11px] text-gray-500">Computes collections minus mandate fee</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Client Account</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">Select Client Account...</option>
                  {clientAccounts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.accountCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Billing Month</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Reimbursable OpEx (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={reimbursableExp}
                  onChange={(e) => setReimbursableExp(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isGenerating || selectedClient === "ALL"}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isGenerating ? "Calculating Statement..." : "Calculate & Issue Statement"}</span>
              </button>
            </div>
          </form>

          {/* Statements Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Issued Owner Statements ({statements.length})
              </h4>
            </div>

            {statements.length === 0 ? (
              <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium">No statements generated for this selection yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Statement #</th>
                      <th className="py-2.5 px-3">Client Account</th>
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3 text-right">Billed</th>
                      <th className="py-2.5 px-3 text-right">Collected</th>
                      <th className="py-2.5 px-3 text-right">Mgmt Fee</th>
                      <th className="py-2.5 px-3 text-right font-black text-gray-900">Net Remittance</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {statements.map((s) => (
                      <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{s.statementNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{s.clientAccountName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{s.periodMonth}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-700">{formatINR(s.grossBilled)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">{formatINR(s.totalCollected)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600">-{formatINR(s.operatorManagementFee)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-gray-900">{formatINR(s.netRemittanceAmount)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.remittanceStatus === "remitted"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            {s.remittanceStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nodal Escrow Audit-Proof Sub-ledger Compliance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

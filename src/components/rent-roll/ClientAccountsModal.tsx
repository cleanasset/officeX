"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Building2,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  ShieldCheck,
  Check,
  TrendingUp,
  CreditCard,
  Briefcase
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface ClientAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientAccountsModal: React.FC<ClientAccountsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<"accounts" | "mandates">("accounts");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New Client Account form
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    accountCode: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: ""
  });

  // New Mandate form
  const [isAddMandateOpen, setIsAddMandateOpen] = useState(false);
  const [mandateForm, setMandateForm] = useState({
    clientAccountId: "",
    mandateName: "",
    feeModel: "pct_collections" as "pct_collections" | "flat_monthly" | "per_sqft",
    feeRate: 4.0,
    settlementType: "direct_to_owner" as "direct_to_owner" | "operator_escrow",
    statementDay: 5,
    remittanceDay: 10,
    startDate: "2026-04-01",
    endDate: "2031-03-31"
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accRes, manRes] = await Promise.all([
        fetch("/api/rent-roll/client-accounts"),
        fetch("/api/rent-roll/mandates")
      ]);
      if (accRes.ok) {
        const accs = await accRes.json();
        setAccounts(accs);
        if (accs.length > 0 && !mandateForm.clientAccountId) {
          setMandateForm(prev => ({ ...prev, clientAccountId: accs[0].id }));
        }
      }
      if (manRes.ok) {
        const mans = await manRes.json();
        setMandates(mans);
      }
    } catch (e) {
      console.error("Failed to load client accounts/mandates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rent-roll/client-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm)
      });
      if (res.ok) {
        setActionFeedback(`Client Account "${accountForm.name}" created successfully.`);
        setIsAddAccountOpen(false);
        setAccountForm({ name: "", accountCode: "", contactPerson: "", contactEmail: "", contactPhone: "" });
        await fetchData();
        onSuccess();
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch (e: any) {
      alert("Error creating account: " + e.message);
    }
  };

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rent-roll/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mandateForm)
      });
      if (res.ok) {
        setActionFeedback(`Management Mandate "${mandateForm.mandateName}" registered successfully.`);
        setIsAddMandateOpen(false);
        await fetchData();
        onSuccess();
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch (e: any) {
      alert("Error creating mandate: " + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-bold uppercase tracking-wider">
                  Screen S-56
                </span>
                <h3 className="text-base font-black tracking-tight text-white">
                  Client Accounts &amp; Management Mandates
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Multi-Client Operator management: institutional owners, SPV accounts, and commercial fee agreements (RR-OPR-01..09)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {actionFeedback && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
              <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
            </div>
          )}

          {/* Sub-tab navigation */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("accounts")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "accounts"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Client Accounts ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mandates")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "mandates"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active Mandates ({mandates.length})
              </button>
            </div>

            {activeTab === "accounts" ? (
              <button
                type="button"
                onClick={() => setIsAddAccountOpen(true)}
                className="px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddMandateOpen(true)}
                className="px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Management Mandate</span>
              </button>
            )}
          </div>

          {/* TAB 1: CLIENT ACCOUNTS */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Account Code</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Primary Contact</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{acc.accountCode}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{acc.name}</td>
                        <td className="py-3 px-4 text-gray-700">{acc.contactPerson || "—"}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{acc.contactEmail || "—"}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{acc.contactPhone || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {acc.status?.toUpperCase() || "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGEMENT MANDATES */}
          {activeTab === "mandates" && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Mandate Name</th>
                      <th className="py-3 px-4">Client Account</th>
                      <th className="py-3 px-4">Fee Basis</th>
                      <th className="py-3 px-4 text-right">Fee Rate</th>
                      <th className="py-3 px-4">Settlement Model</th>
                      <th className="py-3 px-4">Tenure</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {mandates.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{m.mandateName}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-700">{m.clientAccountName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                            {m.feeModel.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-rose-700">{m.feeRate}% + 18% GST</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {m.settlementType === "direct_to_owner" ? "Direct to Owner" : "Operator Escrow"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                          {m.startDate} to {m.endDate || "Indefinite"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {m.status?.toUpperCase() || "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-Client Institutional Governance (RR-OPR-01..09)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Modal: Add Client Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-900">Add New Institutional Client Account</h3>
            <p className="text-xs text-gray-500 mt-0.5">Register an asset owner or investor SPV</p>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Client Legal / Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix Commercial Trust"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Account Code</label>
                <input
                  type="text"
                  placeholder="e.g. CLI-PHOENIX"
                  value={accountForm.accountCode}
                  onChange={(e) => setAccountForm({ ...accountForm, accountCode: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={accountForm.contactPerson}
                  onChange={(e) => setAccountForm({ ...accountForm, contactPerson: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rajesh@client.com"
                    value={accountForm.contactEmail}
                    onChange={(e) => setAccountForm({ ...accountForm, contactEmail: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={accountForm.contactPhone}
                    onChange={(e) => setAccountForm({ ...accountForm, contactPhone: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Management Mandate */}
      {isAddMandateOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-900">Register Management Mandate (S-56)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Define fee calculation rules, settlement model and collection terms</p>

            <form onSubmit={handleCreateMandate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Client Account *</label>
                <select
                  required
                  value={mandateForm.clientAccountId}
                  onChange={(e) => setMandateForm({ ...mandateForm, clientAccountId: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mandate Agreement Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Comprehensive Commercial Asset Management Agreement"
                  value={mandateForm.mandateName}
                  onChange={(e) => setMandateForm({ ...mandateForm, mandateName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fee Model (F-20)</label>
                  <select
                    value={mandateForm.feeModel}
                    onChange={(e: any) => setMandateForm({ ...mandateForm, feeModel: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="pct_collections">% of Collections (Standard)</option>
                    <option value="flat_monthly">Fixed Monthly Retainer</option>
                    <option value="per_sqft">Per Sq. Ft. Chargeable</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fee Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={mandateForm.feeRate}
                    onChange={(e) => setMandateForm({ ...mandateForm, feeRate: Number(e.target.value) })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Settlement Model</label>
                  <select
                    value={mandateForm.settlementType}
                    onChange={(e: any) => setMandateForm({ ...mandateForm, settlementType: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="direct_to_owner">Direct to Owner (Fee Invoiced)</option>
                    <option value="operator_escrow">Operator Collects &amp; Disburses</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Statement Cut-Off Day</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={mandateForm.statementDay}
                    onChange={(e) => setMandateForm({ ...mandateForm, statementDay: Number(e.target.value) })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mandate Start Date</label>
                  <input
                    type="date"
                    value={mandateForm.startDate}
                    onChange={(e) => setMandateForm({ ...mandateForm, startDate: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mandate End Date</label>
                  <input
                    type="date"
                    value={mandateForm.endDate}
                    onChange={(e) => setMandateForm({ ...mandateForm, endDate: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMandateOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Register Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

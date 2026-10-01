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
  Plus,
  Lock,
  Layers,
  FileText,
  CreditCard,
  Printer,
  ChevronRight,
  ExternalLink
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
  const [reimbursableExp, setReimbursableExp] = useState<number>(120000);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active inspected statement for S-55 Schedules
  const [activeStatement, setActiveStatement] = useState<any | null>(null);
  const [activeSchedule, setActiveSchedule] = useState<"A" | "B" | "C" | "D">("A");

  // Remittance Modal State
  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);
  const [remitUtr, setRemitUtr] = useState("");
  const [remitDate, setRemitDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRemitting, setIsRemitting] = useState(false);

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
        if (data.length > 0 && !activeStatement) {
          setActiveStatement(data[0]);
        } else if (activeStatement) {
          const updated = data.find((s: any) => s.id === activeStatement.id);
          if (updated) setActiveStatement(updated);
        }
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
        setActiveStatement(data);
        setTimeout(() => setSuccessMsg(null), 5000);
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

  // Action: Freeze & Issue Statement (UAT-49)
  const handleIssueStatement = async (statementId: string) => {
    if (!confirm("Confirm issue & freeze this statement? Once issued, it becomes immutable under statutory operator compliance (RR-OPR-06).")) {
      return;
    }
    try {
      const res = await fetch("/api/rent-roll/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          statementId,
          issuedBy: "Portfolio Principal / Auditor"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Statement issued and permanently frozen.`);
        await fetchStatements();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        alert(data.error || "Failed to issue statement");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Record Remittance (POST /statements action remit)
  const handleRecordRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStatement) return;
    setIsRemitting(true);
    try {
      const res = await fetch("/api/rent-roll/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remit",
          statementId: activeStatement.id,
          remittanceUtr: remitUtr || `UTR-REM-${Date.now().toString().slice(-6)}`,
          remittanceDate: remitDate,
          remittedBy: "Corporate Treasury Officer"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsRemitModalOpen(false);
        setSuccessMsg(data.message || "Owner remittance successfully recorded.");
        await fetchStatements();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        alert(data.error || "Failed to record remittance");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRemitting(false);
    }
  };

  if (!isOpen) return null;

  // Active statement figures
  const stmt = activeStatement || statements[0] || {
    statementNumber: "STMT-SHARMA-2026-09",
    clientAccountName: "Sharma Family Trust",
    periodMonth: "2026-09",
    grossBilled: 5200000,
    totalCollected: 4800000,
    totalArrears: 400000,
    operatorManagementFee: 192000,
    reimbursableExpenses: 120000,
    netRemittanceAmount: 4453440,
    remittanceStatus: "pending",
    isFrozen: false
  };

  const gstOnFee = Math.round((stmt.operatorManagementFee || 192000) * 0.18);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-bold uppercase tracking-wider">
                  Screen S-55
                </span>
                <h3 className="text-base font-black tracking-tight text-white">
                  Monthly Owner Statements &amp; Operator Remittance
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Multi-client operator ledger: Billed vs Collected, 4% Mandate Fee, GST &amp; Net Disbursed Remittance (Section 13.8)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
            </div>
          )}

          {/* S-55 Wireframe Top Banner: Summary Strip */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-700 uppercase">
                  {stmt.statementNumber}
                </span>
                <h4 className="text-base font-black text-gray-900">
                  {stmt.clientAccountName} · Statement for {stmt.periodMonth}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  Settlement: <span className="font-bold text-indigo-700">Direct-to-Owner</span>
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                  stmt.remittanceStatus === "remitted"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : stmt.isFrozen
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {stmt.isFrozen ? <Lock className="w-3 h-3 text-purple-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                  <span className="uppercase">{stmt.remittanceStatus === "remitted" ? "REMITTED" : stmt.isFrozen ? "FROZEN & ISSUED" : "DRAFT"}</span>
                </span>
              </div>
            </div>

            {/* S-55 Financial Run Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Billed (Gross)</span>
                <div className="text-xs font-black text-gray-900 mt-0.5">{formatINR(stmt.grossBilled)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Collected MTD</span>
                <div className="text-xs font-black text-emerald-700 mt-0.5">{formatINR(stmt.totalCollected)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-rose-600 font-bold uppercase">Arrears Due</span>
                <div className="text-xs font-black text-rose-600 mt-0.5">{formatINR(stmt.totalArrears)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Mgmt Fee 4% (F-20)</span>
                <div className="text-xs font-black text-rose-700 mt-0.5">-{formatINR(stmt.operatorManagementFee)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 font-bold uppercase">GST on Fee (18%)</span>
                <div className="text-xs font-black text-rose-700 mt-0.5">-{formatINR(gstOnFee)}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 font-bold uppercase">OpEx on Behalf</span>
                <div className="text-xs font-black text-rose-700 mt-0.5">-{formatINR(stmt.reimbursableExpenses)}</div>
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-indigo-800 font-black uppercase">Net Remittance (F-21)</span>
                <div className="text-sm font-black text-indigo-900 mt-0.5">{formatINR(stmt.netRemittanceAmount)}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-indigo-100">
              <span className="text-[11px] text-gray-500 font-mono">
                {stmt.remittanceUtr ? `UTR: ${stmt.remittanceUtr} • Date: ${stmt.remittanceDate || "—"}` : "Remittance pending disbursement"}
              </span>

              <div className="flex items-center gap-2">
                {!stmt.isFrozen && (
                  <button
                    type="button"
                    onClick={() => handleIssueStatement(stmt.id)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Issue &amp; Freeze Statement</span>
                  </button>
                )}

                {stmt.remittanceStatus !== "remitted" && (
                  <button
                    type="button"
                    onClick={() => setIsRemitModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Remittance</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* S-55 4 Schedules Tabbed Section */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Schedules:</span>
              <button
                type="button"
                onClick={() => setActiveSchedule("A")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSchedule === "A" ? "bg-white text-gray-900 shadow-2xs border border-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Schedule A: Invoices &amp; Collections
              </button>
              <button
                type="button"
                onClick={() => setActiveSchedule("B")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSchedule === "B" ? "bg-white text-gray-900 shadow-2xs border border-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Schedule B: Arrears by Occupant
              </button>
              <button
                type="button"
                onClick={() => setActiveSchedule("C")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSchedule === "C" ? "bg-white text-gray-900 shadow-2xs border border-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Schedule C: Reimbursable OpEx
              </button>
              <button
                type="button"
                onClick={() => setActiveSchedule("D")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSchedule === "D" ? "bg-white text-gray-900 shadow-2xs border border-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Schedule D: Fee Calc Audit
              </button>
            </div>

            <div className="p-5">
              {/* SCHEDULE A */}
              {activeSchedule === "A" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">Period Collections Summary</span>
                    <span className="font-mono text-emerald-700 font-bold">Total Deposited to Escrow: {formatINR(stmt.totalCollected)}</span>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Occupant</th>
                          <th className="py-2.5 px-3">Invoice #</th>
                          <th className="py-2.5 px-3 text-right">Gross Billed</th>
                          <th className="py-2.5 px-3 text-right">TDS (10%)</th>
                          <th className="py-2.5 px-3 text-right">Net Received</th>
                          <th className="py-2.5 px-3">Mode</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">TechNova Solutions Pvt Ltd</td>
                          <td className="py-2.5 px-3 font-mono text-indigo-700">SE/26-27/0142</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹28,60,556</td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-600">-₹2,42,420</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">₹26,18,136</td>
                          <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 font-mono">RTGS</span></td>
                          <td className="py-2.5 px-3 text-gray-500">08-Sep-2026</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">Innovate Corp Tech</td>
                          <td className="py-2.5 px-3 font-mono text-indigo-700">SE/26-27/0143</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹23,39,444</td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-600">-₹2,09,000</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">₹21,81,864</td>
                          <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 font-mono">NEFT</span></td>
                          <td className="py-2.5 px-3 text-gray-500">12-Sep-2026</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                        <tr>
                          <td className="py-2.5 px-3 uppercase text-[10px]" colSpan={2}>Total Period Collections</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black">{formatINR(stmt.grossBilled)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-600">-₹4,51,420</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">{formatINR(stmt.totalCollected)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* SCHEDULE B */}
              {activeSchedule === "B" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">Outstanding Arrears &amp; Delinquency Ledger</span>
                    <span className="font-mono text-rose-600 font-bold">Total Arrears: {formatINR(stmt.totalArrears)}</span>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Occupant</th>
                          <th className="py-2.5 px-3">Space</th>
                          <th className="py-2.5 px-3 text-right">0–30 Days</th>
                          <th className="py-2.5 px-3 text-right">31–60 Days</th>
                          <th className="py-2.5 px-3 text-right">61–90 Days</th>
                          <th className="py-2.5 px-3 text-right">90+ Days</th>
                          <th className="py-2.5 px-3 text-right font-black">Total Arrears</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">NextGen Retail Corp</td>
                          <td className="py-2.5 px-3 font-mono text-gray-600">MTP-T1-04</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹4,00,000</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-400">—</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-400">—</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-400">—</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600">₹4,00,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SCHEDULE C */}
              {activeSchedule === "C" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">Reimbursable Operating Expenses Disbursed on Owner Behalf</span>
                    <span className="font-mono text-rose-700 font-bold">Total Reimbursable: -{formatINR(stmt.reimbursableExpenses)}</span>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Vendor</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-center">Voucher Verified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">05-Sep-2026</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">Otis Elevator India Ltd</td>
                          <td className="py-2.5 px-3 text-gray-600">Repairs &amp; AMC</td>
                          <td className="py-2.5 px-3 text-gray-700">Quarterly preventative lift maintenance</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-gray-900">₹70,000</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Verified
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">15-Sep-2026</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">SecureGuard Security Services</td>
                          <td className="py-2.5 px-3 text-gray-600">Security Outgoings</td>
                          <td className="py-2.5 px-3 text-gray-700">Perimeter CCTV &amp; emergency access guard</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-gray-900">₹50,000</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Verified
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SCHEDULE D */}
              {activeSchedule === "D" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-gray-900">Operator Management Fee Mathematical Computation (Formula F-20)</h4>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1. Total Verified Period Collections:</span>
                      <span className="font-bold text-gray-900">{formatINR(stmt.totalCollected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2. Mandate Contractual Fee Rate:</span>
                      <span className="font-bold text-indigo-700">4.0% of Collections</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1">
                      <span className="text-gray-800 font-bold">3. Base Operator Management Fee (F-20):</span>
                      <span className="font-black text-rose-700">₹1,92,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">4. Statutory Goods &amp; Services Tax (18% GST):</span>
                      <span className="font-bold text-rose-700">₹34,560.00</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 text-sm font-black text-gray-900">
                      <span>Total Invoice to Owner for Management:</span>
                      <span>₹2,26,560.00</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    * Per Management Mandate MAN-001 (Section 13.8), fee is invoiced separately to the Owner with tax invoice and offset against net remittance proceeds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statement Generator Form */}
          <form onSubmit={handleGenerateStatement} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Generate New Monthly Statement for Client Account
              </span>
              <span className="text-[11px] text-gray-500">Automates F-20 &amp; F-21 calculation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Client Account</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="ALL">Select Client Account...</option>
                  {clientAccounts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.accountCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Statement Period</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                </input>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Reimbursable OpEx (₹)</label>
                <input
                  type="number"
                  value={reimbursableExp}
                  onChange={(e) => setReimbursableExp(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 font-semibold"
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

          {/* Historical Statements List */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
              Issued Historical Statements ({statements.length})
            </h4>

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
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {statements.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setActiveStatement(s)}
                        className={`hover:bg-indigo-50/40 transition-colors cursor-pointer ${
                          activeStatement?.id === s.id ? "bg-indigo-50/60" : ""
                        }`}
                      >
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
                              : s.isFrozen
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            {s.remittanceStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-gray-400 inline" />
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
            <span>Nodal Escrow Audit-Proof Sub-ledger Compliance (RR-OPR-01..09)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Record Remittance Dialog Modal */}
      {isRemitModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Record Owner Remittance Disbursal</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mark statement proceeds of <span className="font-bold text-gray-900">{formatINR(stmt.netRemittanceAmount)}</span> disbursed to {stmt.clientAccountName}.
            </p>

            <form onSubmit={handleRecordRemittance} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Corporate Bank RTGS/NEFT UTR #</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC20260930771249"
                  value={remitUtr}
                  onChange={(e) => setRemitUtr(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Disbursal Date</label>
                <input
                  type="date"
                  required
                  value={remitDate}
                  onChange={(e) => setRemitDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRemitModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRemitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRemitting ? "Recording..." : "Confirm Remittance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

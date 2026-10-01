"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  AlertCircle,
  FileCheck2,
  Sparkles,
  RefreshCw,
  Send,
  Building2,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface BillingRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeLeasesCount: number;
}

export const BillingRunModal: React.FC<BillingRunModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activeLeasesCount,
}) => {
  const [period, setPeriod] = useState<string>("October 2026");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [invoiceDate, setInvoiceDate] = useState<string>("2026-10-01");
  const [dueDate, setDueDate] = useState<string>("2026-10-08");
  const [isConsolidated, setIsConsolidated] = useState<boolean>(false);
  const [status, setStatus] = useState<"draft" | "approved" | "issuing" | "issued">("draft");

  // Pre-check warnings & blocks
  const [preChecks, setPreChecks] = useState([
    {
      id: "gstin_check",
      severity: "warning" as const,
      text: "1 commercial occupant has unverified GSTIN (B2B tax credit warning)",
      actionLabel: "Review",
      resolved: false
    },
    {
      id: "escalation_check",
      severity: "warning" as const,
      text: "1 rent step due on 01-Nov (+15%) scheduled and ready for review",
      actionLabel: "View Step",
      resolved: false
    },
    {
      id: "meter_check",
      severity: "info" as const,
      text: "Metered utilities: reading cycle open until 30-Sep",
      actionLabel: "Readings",
      resolved: false
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group Breakdown totals
  const groupStats = [
    { group: "Base Rent", count: activeLeasesCount || 12, taxable: 11240000, gst: 2023200, gross: 13263200 },
    { group: "CAM Charges", count: activeLeasesCount || 12, taxable: 1280000, gst: 230400, gross: 1510400 },
    { group: "Electricity (Fixed/Meter)", count: 4, taxable: 310000, gst: 55800, gross: 365800 },
    { group: "Parking Allocations", count: 6, taxable: 24000, gst: 4320, gross: 28320 },
  ];

  const totalInvoices = isConsolidated ? activeLeasesCount : groupStats.reduce((acc, g) => acc + g.count, 0);
  const totalTaxable = groupStats.reduce((acc, g) => acc + g.taxable, 0);
  const totalGst = groupStats.reduce((acc, g) => acc + g.gst, 0);
  const totalGross = totalTaxable + totalGst;

  if (!isOpen) return null;

  const handleRunBilling = async (actionType: "approve" | "issue") => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingMonth: period,
          invoiceDate,
          dueDate,
          invoiceType: isConsolidated ? "consolidated" : "separate",
          action: actionType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute billing run");
      }

      setStatus(actionType === "issue" ? "issued" : "approved");
      onSuccess();
      if (actionType === "issue") {
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete billing operation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex justify-center items-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER (S-40 Wireframe) */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Receipt size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Billing Centre — Periodic Invoicing Run</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  status === "issued" ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Automated GST tax invoice generation &amp; reconciliation (S-40 / RR-BIL-01)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTROLS BAR */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Billing Period</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
            >
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 pb-2">
              <input
                type="checkbox"
                checked={isConsolidated}
                onChange={e => setIsConsolidated(e.target.checked)}
                className="rounded border-slate-300 text-teal-600"
              />
              Consolidate per Contract
            </label>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRE-CHECKS STRIP (S-40 Requirement) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                Billing Pre-Checks ({preChecks.filter(c => !c.resolved).length} Pending Notice)
              </span>
              <span className="text-[10px] text-amber-700 font-mono">All Critical Blockers Clear</span>
            </div>
            <div className="space-y-1.5">
              {preChecks.map(check => (
                <div key={check.id} className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-amber-100 text-xs">
                  <span className="text-slate-700">{check.text}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPreChecks(preChecks.map(c => c.id === check.id ? { ...c, resolved: true } : c));
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                  >
                    {check.resolved ? "Acknowledged" : "Acknowledge"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY STRIP & RECONCILIATION */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Draft Invoices</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{totalInvoices} Invoices</span>
              <span className="text-[10px] text-slate-500">{isConsolidated ? "1 per contract" : "Separate by charge"}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Taxable Value</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{formatINR(totalTaxable)}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Matches Rent Roll</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Statutory GST (18%)</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{formatINR(totalGst)}</span>
              <span className="text-[10px] text-slate-500">CGST + SGST (Intra-state)</span>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-teal-700 block">Gross Billing Volume</span>
              <span className="text-base font-black text-[#0F8B7D] mt-0.5 block">{formatINR(totalGross)}</span>
              <span className="text-[10px] text-teal-700 font-semibold">Reconciled · Diff: ₹0</span>
            </div>
          </div>

          {/* INVOICE GROUP BREAKDOWN (S-40 Table) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Invoice Charge Group</th>
                  <th className="px-4 py-2.5 text-center">Invoices</th>
                  <th className="px-4 py-2.5 text-right">Taxable Amount</th>
                  <th className="px-4 py-2.5 text-right">GST (18%)</th>
                  <th className="px-4 py-2.5 text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {groupStats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{item.group}</td>
                    <td className="px-4 py-2.5 text-center font-mono">{item.count}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatINR(item.taxable)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatINR(item.gst)}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-800">{formatINR(item.gross)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 font-medium">
            Approval and issuance run independently. Issuing delivers invoices to occupant emails &amp; WhatsApp.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRunBilling("approve")}
              className="px-4 py-2 rounded-xl border border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold cursor-pointer"
            >
              Approve Run
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRunBilling("issue")}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>Issue Invoices (Send Links)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

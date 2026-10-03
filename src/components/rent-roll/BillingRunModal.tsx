"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  AlertTriangle,
  FileCheck2,
  Send,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders
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
  const [activeTab, setActiveTab] = useState<"summary" | "customize">("summary");

  const [leases, setLeases] = useState<any[]>([]);
  const [customOverrides, setCustomOverrides] = useState<Record<string, { baseRent: number; camCharges: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Load real active leases from rent roll store
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/rent-roll/leases")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const active = data.filter((l: any) => l.status === "active" || l.status === "under_notice");
          setLeases(active);
          const initialMap: Record<string, { baseRent: number; camCharges: number }> = {};
          active.forEach((l: any) => {
            initialMap[l.id] = {
              baseRent: l.monthlyRent || 0,
              camCharges: l.camMonthly || 0
            };
          });
          setCustomOverrides(initialMap);
        }
      })
      .catch(err => console.warn("Note loading leases for billing run:", err));
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute live totals based on customizations
  const activeCount = leases.length || activeLeasesCount || 2;
  let totalCustomTaxable = 0;

  if (leases.length > 0) {
    leases.forEach(l => {
      const ov = customOverrides[l.id];
      const r = ov?.baseRent !== undefined ? ov.baseRent : (l.monthlyRent || 0);
      const c = ov?.camCharges !== undefined ? ov.camCharges : (l.camMonthly || 0);
      totalCustomTaxable += (r + c);
    });
  } else {
    totalCustomTaxable = 12520000;
  }

  const totalGst = Math.round(totalCustomTaxable * 0.18);
  const totalGross = totalCustomTaxable + totalGst;
  const totalInvoices = isConsolidated ? activeCount : activeCount * 2;

  const handleOverrideChange = (leaseId: string, field: "baseRent" | "camCharges", value: number) => {
    setCustomOverrides(prev => ({
      ...prev,
      [leaseId]: {
        ...prev[leaseId],
        [field]: Math.max(0, value || 0)
      }
    }));
  };

  const handleResetLease = (lease: any) => {
    setCustomOverrides(prev => ({
      ...prev,
      [lease.id]: {
        baseRent: lease.monthlyRent || 0,
        camCharges: lease.camMonthly || 0
      }
    }));
  };

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
          customOverrides: Object.keys(customOverrides).length > 0 ? customOverrides : undefined
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
        
        {/* HEADER */}
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
                Automated GST tax invoice generation, custom amount editing &amp; reconciliation
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
              <option>October 2026</option>
              <option>November 2026</option>
              <option>December 2026</option>
              <option>September 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={isConsolidated}
                onChange={e => setIsConsolidated(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <span>Consolidate per Contract</span>
            </label>
          </div>
        </div>

        {/* BODY WORKFLOW */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRE-CHECKS STRIP */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                Billing Pre-Checks ({preChecks.filter(c => !c.resolved).length} Pending Notice)
              </span>
              <span className="text-[10px] text-amber-700 font-mono">All Critical Blockers Clear</span>
            </div>
            <div className="space-y-1">
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
              <span className="text-base font-black text-slate-900 mt-0.5 block">{formatINR(totalCustomTaxable)}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Live Calculated</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Statutory GST (18%)</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{formatINR(totalGst)}</span>
              <span className="text-[10px] text-slate-500">CGST + SGST (Intra-state)</span>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-teal-700 block">Gross Billing Volume</span>
              <span className="text-base font-black text-[#0F8B7D] mt-0.5 block">{formatINR(totalGross)}</span>
              <span className="text-[10px] text-teal-700 font-semibold">Total to be Billed</span>
            </div>
          </div>

          {/* VIEW SWITCHER: SUMMARY OR EDIT INDIVIDUAL AMOUNTS */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Charge Group Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("customize")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "customize"
                    ? "bg-[#0F8B7D] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Pencil className="w-3 h-3" />
                <span>Customize Tenant Invoices (Edit Amounts)</span>
              </button>
            </div>

            {activeTab === "customize" && (
              <span className="text-[11px] text-teal-800 font-medium bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                ✏️ Edit base rent or CAM values below before generating invoices
              </span>
            )}
          </div>

          {/* TAB 1: SUMMARY TABLE */}
          {activeTab === "summary" && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
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
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-800">Base Rent</td>
                    <td className="px-4 py-2.5 text-center font-mono">{activeCount}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatINR(totalCustomTaxable * 0.9)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatINR(Math.round(totalCustomTaxable * 0.9 * 0.18))}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-800">{formatINR(Math.round(totalCustomTaxable * 0.9 * 1.18))}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-800">CAM Charges</td>
                    <td className="px-4 py-2.5 text-center font-mono">{activeCount}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatINR(totalCustomTaxable * 0.1)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatINR(Math.round(totalCustomTaxable * 0.1 * 0.18))}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-800">{formatINR(Math.round(totalCustomTaxable * 0.1 * 1.18))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: EDIT INDIVIDUAL TENANT AMOUNTS */}
          {activeTab === "customize" && (
            <div className="space-y-3">
              {leases.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No active commercial leases available to customize.
                </div>
              ) : (
                leases.map((l) => {
                  const ov = customOverrides[l.id] || { baseRent: l.monthlyRent || 0, camCharges: l.camMonthly || 0 };
                  const sub = ov.baseRent + ov.camCharges;
                  const gst = Math.round(sub * 0.18);
                  const gross = sub + gst;

                  return (
                    <div
                      key={l.id}
                      className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3 transition-all hover:border-teal-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs">{l.tenantName}</span>
                            <span className="text-[10px] text-slate-500 ml-2 font-mono">
                              {l.propertyName} • {l.unitNumber || "Suite"} ({l.chargeableArea?.toLocaleString()} sqft)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-teal-800">
                            Total: {formatINR(gross)} (incl. GST)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetLease(l)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Reset to default contract values"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* EDITABLE INPUTS */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Monthly Base Rent (₹)
                          </label>
                          <input
                            type="number"
                            value={ov.baseRent}
                            onChange={e => handleOverrideChange(l.id, "baseRent", Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Monthly CAM Charges (₹)
                          </label>
                          <input
                            type="number"
                            value={ov.camCharges}
                            onChange={e => handleOverrideChange(l.id, "camCharges", Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Statutory GST (18%)
                          </label>
                          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100/80 font-mono text-slate-700">
                            {formatINR(gst)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 font-medium">
            Approval and issuance run independently. Issuing delivers invoices to occupant emails &amp; WhatsApp.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRunBilling("approve")}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-teal-600 text-teal-700 font-bold hover:bg-teal-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Approve Run
            </button>
            <button
              onClick={() => handleRunBilling("issue")}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Issuing Invoices...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Issue Invoices (Send Links)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

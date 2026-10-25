"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  TrendingUp,
  FileText,
  DollarSign,
  PieChart,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface CamPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CamPoolModal({ isOpen, onClose, onSuccess }: CamPoolModalProps) {
  const [fiscalYear, setFiscalYear] = useState("FY 2025-26");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expensePools, setExpensePools] = useState<any[]>([]);
  const [tenantReconciliation, setTenantReconciliation] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCamData();
    }
  }, [isOpen, fiscalYear]);

  async function fetchCamData() {
    try {
      setLoading(true);
      setBannerMessage(null);
      const res = await fetch(`/api/rent-roll/cam-pools?fy=${encodeURIComponent(fiscalYear)}`, {
        headers: getClientAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setExpensePools(data.expensePools || []);
        setTenantReconciliation(data.tenantReconciliation || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Failed to load CAM pools:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCommitTrueUp = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/rent-roll/cam-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({
          fiscalYear,
          action: "commit_true_up",
          adjustments: tenantReconciliation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBannerMessage(data.message);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setBannerMessage("Failed to commit true-up: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalBudget = expensePools.reduce((s, e) => s + (e.budgetInr || 0), 0);
  const totalActual = expensePools.reduce((s, e) => s + (e.actualInr || 0), 0);
  const totalVariance = totalActual - totalBudget;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">CAM Pool True-Up Reconciler (S-52)</h3>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Annual Variance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reconcile budgeted Common Area Maintenance against audited actuals with area-weighted pro-rata distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="FY 2025-26">FY 2025-26 (Audited)</option>
              <option value="FY 2024-25">FY 2024-25 (Closed)</option>
            </select>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Banner */}
        {bannerMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Annual CAM Budget</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">₹{totalBudget.toLocaleString("en-IN")}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Audited Actual Expenses</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">₹{totalActual.toLocaleString("en-IN")}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Net Portfolio Variance</span>
            <span className={`text-base font-black mt-0.5 block ${totalVariance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {totalVariance > 0 ? "+" : ""}₹{totalVariance.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Reconciliation Status</span>
            <span className="text-base font-black text-teal-700 mt-0.5 block">
              {totalVariance > 0 ? "Under-recovery (Recovery)" : "Over-recovery (Credit)"}
            </span>
          </div>
        </div>

        {/* Content Tabs / Scrollable Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0F8B7D]" />
              Calculating CAM Pro-Rata Allocations...
            </div>
          ) : (
            <>
              {/* Table 1: Category Expenses */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Audited CAM Expense Pools
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Expense Category</th>
                        <th className="py-2 px-3 text-right">Budget (₹)</th>
                        <th className="py-2 px-3 text-right">Actual Audited (₹)</th>
                        <th className="py-2 px-3 text-right">Variance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {expensePools.map((e, idx) => {
                        const diff = e.actualInr - e.budgetInr;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-1.5 px-3 font-medium text-slate-900">{e.category}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-600">₹{e.budgetInr.toLocaleString("en-IN")}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-900 font-bold">₹{e.actualInr.toLocaleString("en-IN")}</td>
                            <td className={`py-1.5 px-3 text-right font-mono font-bold ${diff > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {diff > 0 ? "+" : ""}₹{diff.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Occupant Pro-Rata Variance */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Occupant Area-Weighted True-Up Schedule
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Occupant / Tenant</th>
                        <th className="py-2 px-3">Space / Unit</th>
                        <th className="py-2 px-3 text-right">Area (sq ft)</th>
                        <th className="py-2 px-3 text-right">Share %</th>
                        <th className="py-2 px-3 text-right">Billed CAM (₹)</th>
                        <th className="py-2 px-3 text-right">Audited Share (₹)</th>
                        <th className="py-2 px-3 text-right">Adjustment Due (₹)</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {tenantReconciliation.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-900">{t.occupantName}</td>
                          <td className="py-2 px-3 text-slate-600">{t.spaceName}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{t.chargeableAreaSqft.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-teal-700">{t.areaSharePercent}%</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">₹{t.billedCamInr.toLocaleString("en-IN")}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-900 font-bold">₹{t.auditedCamShareInr.toLocaleString("en-IN")}</td>
                          <td className={`py-2 px-3 text-right font-mono font-black ${t.varianceInr > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {t.varianceInr > 0 ? "+" : ""}₹{t.varianceInr.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                t.recommendedAction === "issue_debit_note"
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : t.recommendedAction === "issue_credit_note"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {t.recommendedAction === "issue_debit_note"
                                ? "Debit Note"
                                : t.recommendedAction === "issue_credit_note"
                                ? "Credit Note"
                                : "Balanced"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-teal-600" />
            <span>Audited per Scalezix V2.1 (§5.2, S-52 CAM True-Up rules).</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCommitTrueUp}
              disabled={submitting || tenantReconciliation.length === 0}
              className="px-5 py-2 rounded-xl bg-[#192A56] hover:bg-[#122044] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Adjustment Notes...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Commit True-Up &amp; Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

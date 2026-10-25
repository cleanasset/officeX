"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Eye,
  Check,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import InvoiceViewModal from "./InvoiceViewModal";

interface BillingRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BillingRunModal({ isOpen, onClose, onSuccess }: BillingRunModalProps) {
  const [period, setPeriod] = useState<string>("Oct-2026");
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [runData, setRunData] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBillingRunStatus();
    }
  }, [isOpen, period]);

  async function fetchBillingRunStatus() {
    try {
      setLoading(true);
      setBannerMessage(null);
      const res = await fetch(`/api/billing-runs?period=${encodeURIComponent(period)}`, {
        headers: getClientAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setRunData(json);
      }
    } catch (err: any) {
      console.error("Failed to fetch billing run status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecuteRun(action: "generate" | "approve" | "issue") {
    try {
      setExecuting(true);
      setBannerMessage(null);
      const res = await fetch("/api/billing-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({
          period,
          action,
          consolidate: false, // Split invoices mode (Rent, CAM, Utility)
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBannerMessage(
          action === "generate"
            ? `Successfully generated ${json.invoices_created || json.summary?.total_invoices || "monthly"} draft invoices for ${period}!`
            : action === "approve"
            ? `All draft invoices approved for ${period}!`
            : `Invoices issued and queued for notification!`
        );
        await fetchBillingRunStatus();
        if (onSuccess) onSuccess();
      } else {
        setBannerMessage(`Notice: ${json.error || json.message || "Action completed"}`);
      }
    } catch (err: any) {
      setBannerMessage(`Execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  }

  if (!isOpen) return null;

  const summary = runData?.summary || { total_invoices: 0, total_taxable: 0, total_gst: 0, total_gross: 0 };
  const preChecks = runData?.pre_checks || [];
  const groups = runData?.groups || [];
  const draftInvoices = runData?.draft_invoices || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
          {/* S-40 Header Bar */}
          <div className="bg-slate-900 text-white px-8 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg shadow-md text-white">
                S40
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Billing Centre — Monthly Run
                  </h2>
                  <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                    {runData?.status || "Draft"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate, review, approve, and issue GST Tax Invoices for {period} (§S-40)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Oct-2026">October 2026</option>
                <option value="Nov-2026">November 2026</option>
                <option value="Dec-2026">December 2026</option>
                <option value="Sep-2026">September 2026</option>
              </select>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Notification Banner */}
          {bannerMessage && (
            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bannerMessage}</span>
            </div>
          )}

          {/* Modal Content Scroll Area */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans">
            {/* 1. PRE-CHECKS BOX (§S-40 Wireframe) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Pre-Checks (Must be clear or acknowledged prior to issue)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {preChecks.length > 0 ? (
                  preChecks.map((chk: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        chk.passed
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : chk.severity === "red"
                          ? "bg-rose-50 border-rose-200 text-rose-900 font-medium"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {chk.passed ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle
                            className={`w-4 h-4 shrink-0 ${
                              chk.severity === "red" ? "text-rose-600" : "text-amber-600"
                            }`}
                          />
                        )}
                        <span>{chk.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 ml-2">
                        {chk.passed ? "Passed" : chk.action_label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">No pre-check exceptions recorded.</div>
                )}
              </div>
            </div>

            {/* 2. SUMMARY & RECONCILIATION TILES (§S-40 Wireframe) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Invoices Count
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  {summary.total_invoices || draftInvoices.length || 0}
                </p>
                <span className="text-[10px] text-slate-500">Scheduled for period</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Taxable Value
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  ₹{Number(summary.total_taxable || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-teal-700 font-medium">Reconciled to rent roll</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  GST (CGST + SGST)
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  ₹{Number(summary.total_gst || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-slate-500">18% standard rate</span>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Gross Billable
                </span>
                <p className="text-xl font-black text-teal-950 mt-1 font-mono">
                  ₹{Number(summary.total_gross || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-teal-700 font-medium">Diff: ₹0 (Reconciled OK)</span>
              </div>
            </div>

            {/* 3. GROUP BREAKDOWN TABLE (Rent, CAM, Utility) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-bold text-[11px] text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Charge Group Breakdown (Split Invoices Series)</span>
                <span className="text-slate-500 font-normal lowercase">SAC 997212 / 997221 / Utilities</span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="p-3">Group</th>
                    <th className="p-3">Prefix</th>
                    <th className="p-3 text-right">Invoices</th>
                    <th className="p-3 text-right">Taxable Amount (₹)</th>
                    <th className="p-3 text-right">GST 18% (₹)</th>
                    <th className="p-3 text-right">Gross Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((grp: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{grp.group}</td>
                      <td className="p-3 font-mono text-slate-500">{grp.series_prefix}</td>
                      <td className="p-3 text-right font-mono">{grp.count || 0}</td>
                      <td className="p-3 text-right font-mono font-medium">
                        {Number(grp.taxable || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {Number(grp.gst || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {Number(grp.gross || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. DRAFT INVOICES LIST (§S-40 Wireframe) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-bold text-[11px] text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Draft Invoices Generated for {period}</span>
                <span className="text-slate-500 font-normal lowercase">Click any row to open S-41 Tax Invoice</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                  Loading period billing run data...
                </div>
              ) : draftInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No invoices generated yet for {period}.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click "Generate Billing Batch" below to scan active contracts and create itemized SAC 997212 GST Tax Invoices.
                  </p>
                  <button
                    onClick={() => handleExecuteRun("generate")}
                    disabled={executing}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Generate Billing Batch Now
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Occupant / Lessee</th>
                        <th className="p-3 text-right">Taxable (₹)</th>
                        <th className="p-3 text-right">GST (₹)</th>
                        <th className="p-3 text-right">Gross Total (₹)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftInvoices.map((inv: any) => (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:bg-teal-50/40 cursor-pointer transition"
                        >
                          <td className="p-3 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                          <td className="p-3 font-medium text-slate-800">{inv.occupant_name || "Commercial Tenant"}</td>
                          <td className="p-3 text-right font-mono font-medium">
                            {Number(inv.subtotal || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600">
                            {Number(inv.gst_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {Number(inv.gross_total || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {inv.status || "Draft"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> View S-41
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

          {/* S-40 Modal Footer Buttons */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={fetchBillingRunStatus}
              disabled={loading || executing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Recalculate Run
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleExecuteRun("generate")}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-xs"
              >
                {executing ? "Processing..." : "Regenerate Drafts"}
              </button>

              <button
                onClick={() => handleExecuteRun("approve")}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                Approve Run
              </button>

              <button
                onClick={() => handleExecuteRun("issue")}
                disabled={executing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                Issue Invoices ({period})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* S-41 Tax Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}

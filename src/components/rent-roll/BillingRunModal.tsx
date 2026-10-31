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
  Edit3,
  ExternalLink,
  Clock,
  ShieldCheck,
  Bell,
  Smartphone,
  Calendar,
  Percent,
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
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [consolidate, setConsolidate] = useState<boolean>(true); // Default 1 clean invoice per tenant
  const [dispatchMode, setDispatchMode] = useState<"buffer" | "instant">("buffer");
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [runData, setRunData] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Tenant-specific adjustments state: { [contractId]: { adjustment_amount: number; reason: string } }
  const [adjustments, setAdjustments] = useState<Record<string, { adjustment_amount: number; reason: string }>>({});

  // Adjustment Popover / Edit State
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [adjType, setAdjType] = useState<"discount" | "surcharge">("discount");
  const [adjAmountInput, setAdjAmountInput] = useState<string>("");
  const [adjReasonInput, setAdjReasonInput] = useState<string>("");

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
          invoice_date: invoiceDate,
          consolidate,
          adjustments,
          dispatch_mode: dispatchMode,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBannerMessage(
          action === "generate"
            ? `Successfully generated ${json.invoices_created || json.summary?.total_invoices || "monthly"} draft invoices for ${period}!`
            : action === "approve"
            ? `All draft invoices approved for ${period}!`
            : json.message || `Invoices issued and queued for notification!`
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

  // Open Edit Adjustment Modal for a specific tenant
  function openAdjustmentModal(tenant: any) {
    const existing = adjustments[tenant.contract_id];
    setEditingTenant(tenant);
    if (existing) {
      if (existing.adjustment_amount < 0) {
        setAdjType("discount");
        setAdjAmountInput(String(Math.abs(existing.adjustment_amount)));
      } else {
        setAdjType("surcharge");
        setAdjAmountInput(String(existing.adjustment_amount));
      }
      setAdjReasonInput(existing.reason || "");
    } else {
      setAdjType("discount");
      setAdjAmountInput("");
      setAdjReasonInput("");
    }
  }

  function handleSaveAdjustment() {
    if (!editingTenant) return;
    const rawVal = parseFloat(adjAmountInput || "0");
    if (rawVal <= 0) {
      // Remove adjustment
      const updated = { ...adjustments };
      delete updated[editingTenant.contract_id];
      setAdjustments(updated);
    } else {
      const finalAmount = adjType === "discount" ? -rawVal : rawVal;
      setAdjustments({
        ...adjustments,
        [editingTenant.contract_id]: {
          adjustment_amount: finalAmount,
          reason: adjReasonInput.trim() || (adjType === "discount" ? "Rent concession" : "Extra billing surcharge"),
        },
      });
    }
    setEditingTenant(null);
  }

  function handleRemoveAdjustment(contractId: string) {
    const updated = { ...adjustments };
    delete updated[contractId];
    setAdjustments(updated);
    setEditingTenant(null);
  }

  if (!isOpen) return null;

  const rawSummary = runData?.summary || { total_invoices: 0, total_taxable: 0, total_gst: 0, total_gross: 0 };
  const preChecks = runData?.pre_checks || [];
  const tenantBillings = runData?.tenant_billings || [];
  const draftInvoices = runData?.draft_invoices || [];

  // Compute live summary accounting for manual adjustments in UI
  let adjustedTaxable = Number(rawSummary.total_taxable || 0);
  Object.values(adjustments).forEach((adj) => {
    adjustedTaxable += adj.adjustment_amount;
  });
  adjustedTaxable = Math.max(0, adjustedTaxable);
  const adjustedGst = Math.round(adjustedTaxable * 0.18);
  const adjustedGross = adjustedTaxable + adjustedGst;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[94vh]">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-7 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg shadow-md text-white">
                S40
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Billing Centre — Monthly Run
                  </h2>
                  <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                    {runData?.status || "Draft"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous GST Tax Invoice engine with contract verification & owner safety window (§S-40)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Invoice Date:</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Period:</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Oct-2026" className="bg-slate-900 text-white">October 2026</option>
                  <option value="Nov-2026" className="bg-slate-900 text-white">November 2026</option>
                  <option value="Dec-2026" className="bg-slate-900 text-white">December 2026</option>
                  <option value="Sep-2026" className="bg-slate-900 text-white">September 2026</option>
                </select>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Notification Banner */}
          {bannerMessage && (
            <div className="mx-6 mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                onClick={() => setBannerMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Modal Content Scroll Area */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 font-sans">
            {/* AUTOPILOT REASSURANCE & CADENCE CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-500/30 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-300" /> Autopilot Active
                    </span>
                    <h4 className="text-sm font-bold text-white">Automated Recurring Billing Engine</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Verify and issue your first cycle below. <strong className="text-teal-300">Don't worry about upcoming months</strong> — our automated rent roll engine handles all subsequent billing cycles seamlessly based on contract dates!
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-slate-200">Zero-Mistake Contract Linkage</span>
                </div>
              </div>

              {/* Autopilot Cadence Timeline */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/70">
                  <span className="text-[10px] text-teal-400 font-bold uppercase block tracking-wider">T-15 Days Before Due</span>
                  <span className="font-bold text-slate-100 block mt-0.5">Auto-Generate & Dispatch</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Issues GST Tax Invoice to Tenant Portal & Owner Buffer
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/70">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block tracking-wider">T-5 Days Reminder</span>
                  <span className="font-bold text-slate-100 block mt-0.5">Gentle Pre-Notice</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    WhatsApp & Email with Escrow bank remittance details
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/70">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider">Due Date</span>
                  <span className="font-bold text-slate-100 block mt-0.5">Bank Auto-Match</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Instant NEFT/RTGS matching & digital receipt issuance
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/70">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block tracking-wider">Overdue (Daily)</span>
                  <span className="font-bold text-slate-100 block mt-0.5">Escalation & Late Fee</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Daily alert notifications + 18% p.a. interest tracking
                  </p>
                </div>
              </div>
            </div>

            {/* PRE-CHECKS WARNING BAR */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Pre-Checks (Must be clear or acknowledged prior to issue)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {preChecks.length > 0 ? (
                  preChecks.map((chk: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                        chk.passed
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : chk.severity === "red"
                          ? "bg-rose-50 border-rose-200 text-rose-900 font-medium"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {chk.passed ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 shrink-0 ${
                              chk.severity === "red" ? "text-rose-600" : "text-amber-600"
                            }`}
                          />
                        )}
                        <span className="text-[11px]">{chk.title}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 ml-2 shrink-0">
                        {chk.passed ? "Passed" : chk.action_label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">No pre-check exceptions recorded.</div>
                )}
              </div>
            </div>

            {/* SUMMARY & RECONCILIATION TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Invoices Count
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  {rawSummary.total_invoices || tenantBillings.length || 0}
                </p>
                <span className="text-[10px] text-slate-500">Active commercial leases</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Taxable Value
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  ₹{adjustedTaxable.toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-teal-700 font-medium">Reconciled to rent roll</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  GST (CGST + SGST 18%)
                </span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  ₹{adjustedGst.toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-slate-500">SAC 997212 / 997221</span>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Gross Billable
                </span>
                <p className="text-xl font-black text-teal-950 mt-1 font-mono">
                  ₹{adjustedGross.toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-teal-700 font-medium">Total receivables batch</span>
              </div>
            </div>

            {/* INVOICING GENERATION MODE TOGGLE */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Invoicing Generation Mode</span>
                <span className="text-[11px] text-slate-500">
                  {consolidate
                    ? "✓ Consolidated Mode: Exactly 1 clean tax invoice per tenant with itemized Rent, CAM & Utilities lines"
                    : "• Split Invoices Mode: Separate tax invoices for Rent (INV-RENT), CAM (INV-CAM), and Utilities (INV-UTIL)"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setConsolidate(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    consolidate
                      ? "bg-white text-teal-800 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  1 Invoice / Tenant (Clean)
                </button>
                <button
                  type="button"
                  onClick={() => setConsolidate(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !consolidate
                      ? "bg-white text-teal-800 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Split Series (Rent / CAM)
                </button>
              </div>
            </div>

            {/* TENANT-BY-TENANT VERIFICATION & ADJUSTMENT GRID */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 font-bold text-[11px] text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-700" />
                  <span>Tenant Billing Breakdown & Contract Verification ({tenantBillings.length} Active Leases)</span>
                </div>
                <span className="text-slate-500 font-normal lowercase">
                  Click 'Verify Contract' to inspect signed lease terms
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                  Loading tenant leases and contractual figures...
                </div>
              ) : tenantBillings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No active contracts found for billing.</p>
                  <p className="text-xs text-slate-400">Add contracts in Contract Registry to run monthly billing.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                        <th className="p-3">Tenant & Property Unit</th>
                        <th className="p-3 text-right">Contract Rent (₹)</th>
                        <th className="p-3 text-right">CAM (₹)</th>
                        <th className="p-3 text-center">Adjustment / Concession</th>
                        <th className="p-3 text-right">Invoice Gross (₹)</th>
                        <th className="p-3 text-center">Contract Verification</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenantBillings.map((t: any) => {
                        const adj = adjustments[t.contract_id];
                        const adjAmount = adj ? adj.adjustment_amount : 0;
                        const finalTaxable = Math.max(0, t.contract_rent + t.contract_cam + t.contract_utility + adjAmount);
                        const finalGst = Math.round(finalTaxable * 0.18);
                        const finalGross = finalTaxable + finalGst;

                        return (
                          <tr key={t.contract_id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900 text-xs">
                                {t.occupant_name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{t.property_name}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-700">{t.space_name}</span>
                                {t.area_sqft > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{Number(t.area_sqft).toLocaleString("en-IN")} sq.ft</span>
                                  </>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-right font-mono font-medium text-slate-800">
                              ₹{Number(t.contract_rent).toLocaleString("en-IN")}
                            </td>

                            <td className="p-3 text-right font-mono text-slate-600">
                              ₹{Number(t.contract_cam).toLocaleString("en-IN")}
                            </td>

                            <td className="p-3 text-center">
                              {adj ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    adj.adjustment_amount < 0
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                  title={adj.reason}
                                >
                                  {adj.adjustment_amount < 0
                                    ? `-₹${Math.abs(adj.adjustment_amount).toLocaleString("en-IN")}`
                                    : `+₹${adj.adjustment_amount.toLocaleString("en-IN")}`}
                                  <span className="text-[9px] opacity-75 truncate max-w-[80px]">({adj.reason})</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Standard
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-right font-mono font-black text-slate-900 text-xs">
                              ₹{finalGross.toLocaleString("en-IN")}
                              <span className="text-[9px] block text-slate-400 font-normal">
                                (Taxable ₹{finalTaxable.toLocaleString("en-IN")} + 18% GST)
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              <a
                                href={`/contracts/${t.contract_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-teal-600" />
                                Verify Contract
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openAdjustmentModal(t)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                                  title="Adjust amount or grant concession for this billing cycle"
                                >
                                  <Edit3 className="w-3 h-3 text-slate-500" />
                                  Adjust
                                </button>

                                {t.invoice_id && (
                                  <button
                                    onClick={() => setSelectedInvoice({
                                      id: t.invoice_id,
                                      invoice_number: t.invoice_number,
                                      occupant_name: t.occupant_name,
                                      gross_total: t.invoice_gross,
                                      subtotal: t.invoice_subtotal,
                                      gst_amount: t.invoice_gst,
                                      status: t.invoice_status,
                                    })}
                                    className="p-1 rounded-lg text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                                    title="View S-41 Invoice Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* OWNER REVIEW BUFFER NOTIFICATION CARD */}
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-950">
                      Owner Pre-Dispatch Safety Window
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-indigo-200/60 text-indigo-800">
                      Auto-Protected
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 mt-0.5">
                    Upon generation, an immediate preview alert is dispatched to the Owner's WhatsApp & Email.
                    A <strong>2-hour safety window</strong> is active to edit or pause before tenant dashboard dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setDispatchMode("buffer")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    dispatchMode === "buffer"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  2-Hour Buffer (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchMode("instant")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    dispatchMode === "instant"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ⚡ Instant Dispatch
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="bg-slate-50 px-7 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={fetchBillingRunStatus}
              disabled={loading || executing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Recalculate Run
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleExecuteRun("generate")}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {executing ? "Processing..." : "Regenerate Drafts"}
              </button>

              <button
                onClick={() => handleExecuteRun("issue")}
                disabled={executing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {dispatchMode === "buffer"
                  ? `Generate & Queue Invoices (${period})`
                  : `Generate & Dispatch Instantly (${period})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TENANT AMOUNT ADJUSTMENT POPUP MODAL */}
      {editingTenant && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-teal-400" />
                  Adjust Amount / Concession
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingTenant.occupant_name} • {editingTenant.space_name}
                </p>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contractual Base Rent:</span>
                  <span className="font-mono font-bold">₹{Number(editingTenant.contract_rent).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contractual CAM:</span>
                  <span className="font-mono font-bold">₹{Number(editingTenant.contract_cam).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType("discount")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      adjType === "discount"
                        ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    - Concession / Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("surcharge")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      adjType === "surcharge"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    + Additional Surcharge
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Adjustment Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={adjAmountInput}
                  onChange={(e) => setAdjAmountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Reason / Remarks for Invoice Line Item
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fit-out rent-free concession (15 days)"
                  value={adjReasonInput}
                  onChange={(e) => setAdjReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              {adjustments[editingTenant.contract_id] ? (
                <button
                  type="button"
                  onClick={() => handleRemoveAdjustment(editingTenant.contract_id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                >
                  Reset to Contract
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdjustment}
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Apply to {period}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

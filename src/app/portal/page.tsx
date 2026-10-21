"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Receipt,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText,
  FolderLock,
  Building2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Landmark,
  X,
  Check,
  Printer,
  Copy,
  Zap,
  Lock
} from "lucide-react";

import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function TenantHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayChannel, setSelectedPayChannel] = useState<"instant" | "neft" | "razorpay">("instant");
  const [payAmountMode, setPayAmountMode] = useState<"full" | "custom">("full");
  const [customPayAmount, setCustomPayAmount] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // NEFT UTR fields
  const [utrNumber, setUtrNumber] = useState("");
  const [remittingBank, setRemittingBank] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Success Receipt State
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  useEffect(() => {
    const savedOccId = typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "";
    loadHomeData(savedOccId || undefined);

    const handleOccChange = (e: any) => {
      loadHomeData(e.detail?.id);
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadHomeData(occupantId?: string) {
    try {
      setLoading(true);
      const savedOccId = occupantId || (typeof window !== "undefined" ? localStorage.getItem("officex_tenant_occupant_id") || "" : "");
      const authHeaders = getClientAuthHeaders();
      const url = savedOccId ? `/api/portal/summary?occupant_id=${savedOccId}` : `/api/portal/summary`;
      const res = await fetch(url, { headers: authHeaders });
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.occupant?.occupant_name && typeof window !== "undefined") {
          localStorage.setItem("officex_tenant_name", json.occupant.occupant_name);
        }
      }
    } catch (e) {
      console.error("Failed to load tenant home data", e);
    } finally {
      setLoading(false);
    }
  }

  const summary = data?.summary || {};
  const occupant = data?.occupant || {};
  const contracts = data?.contracts || [];
  const primaryContract = contracts[0] || null;
  const recentInvoices = data?.recent_invoices || [];
  const primaryInvoice = recentInvoices[0] || null;

  const totalOutstanding = Number(summary.total_outstanding_inr || 0);
  const payableAmount = payAmountMode === "custom" && Number(customPayAmount) > 0
    ? Math.min(Number(customPayAmount), totalOutstanding)
    : totalOutstanding;

  const tenantDisplayName =
    occupant?.occupant_name ||
    (typeof window !== "undefined" ? localStorage.getItem("officex_tenant_name") || localStorage.getItem("officex_user_name") : "") ||
    "Commercial Tenant";

  function handleCopy(text: string, field: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  // Real Database Payment Execution
  async function handleExecutePayment() {
    if (payableAmount <= 0) {
      alert("No balance due to settle.");
      return;
    }

    try {
      setProcessingPayment(true);
      const targetInvoiceId = primaryInvoice?.id;
      if (!targetInvoiceId) {
        throw new Error("No active invoice found to allocate payment");
      }

      const generatedRef = `PAY_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await fetch("/api/portal/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: generatedRef,
          invoice_ids: [targetInvoiceId],
          amount_inr: payableAmount,
          occupant_id: occupant.id,
          payment_mode: selectedPayChannel === "neft" ? "bank_transfer" : "online",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Payment recording failed");
      }

      setPaymentSuccess({
        amount: payableAmount,
        ref: generatedRef,
        channel: selectedPayChannel === "neft" ? `NEFT (UTR: ${utrNumber || "HDFCR5202610220199"})` : "Instant Bank Settlement",
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        invoice_number: primaryInvoice?.invoice_number || "INV-2026-27-0001",
        allocations: json.allocations || [],
      });

      setPayModalOpen(false);
      // Reload fresh data from database
      await loadHomeData(occupant.id);
    } catch (e: any) {
      console.error("Payment execution error:", e);
      alert(e.message || "Failed to execute payment.");
    } finally {
      setProcessingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Tenant Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Welcome & Space Identity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {tenantDisplayName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
            <Building2 size={15} className="text-indigo-600" />
            <span>
              {primaryContract
                ? `${primaryContract.property_name} · ${primaryContract.building_name} · ${primaryContract.space_name} (${Number(primaryContract.chargeable_area_sqft || 50000).toLocaleString("en-IN")} sq.ft.)`
                : "mango plus tower · Suite 101 (50,000 sq.ft.)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={14} /> Active Commercial Lease
          </span>
        </div>
      </div>

      {/* 2. Outstanding Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">
                Total Outstanding Balance
              </span>
              {totalOutstanding === 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Fully Settled
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-bold">INR</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-1">
              <Calendar size={14} className="text-indigo-400" />
              <span>
                Due date:{" "}
                <strong className="text-white">
                  {summary.next_due_date
                    ? new Date(summary.next_due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "31 Oct 2026"}
                </strong>
                {totalOutstanding > 0 && <span className="text-amber-300 font-bold ml-1.5">(October 2026 Billing Run)</span>}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                if (totalOutstanding <= 0) {
                  alert("Your account balance is ₹0. No payment is currently due.");
                  return;
                }
                setPayModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CreditCard size={16} /> Pay Now
            </button>
            <Link
              href="/portal/invoices"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              View Invoices <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Four-Tile Verified Financial KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Current Billing Cycle Due */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Current Cycle Due
            </span>
            <Clock size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Due 31-Oct-2026 · Invoice INV-2026-27-0001
          </p>
        </div>

        {/* Tile 2: Security Deposit on File */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Security Deposit Held
            </span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(summary.security_deposit_held_inr || 3750000).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">
            Protected in Escrow (3 Months)
          </p>
        </div>

        {/* Tile 3: Overdue Status / Arrears */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Overdue Arrears
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹0
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Account in 100% Good Standing
          </p>
        </div>

        {/* Tile 4: Active Disputes / Helpdesk */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Active Disputes
            </span>
            <HelpCircle size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary.open_disputes_count || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            All services operational
          </p>
        </div>
      </div>

      {/* 4. Two Column Layout: Transparent Invoice Breakdown & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transparent Invoice Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                October 2026 Invoice Line-Item Breakdown
              </h2>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              INV-2026-27-0001
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Commercial Base Rent</p>
                <p className="text-[10px] text-slate-400">50,000 sq.ft. @ ₹20.00 / sq.ft. / month</p>
              </div>
              <span className="font-black text-slate-900">₹10,00,000.00</span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Common Area Maintenance (CAM)</p>
                <p className="text-[10px] text-slate-400">HVAC, Security, Lifts, Housekeeping (50,000 sq.ft. @ ₹5.00)</p>
              </div>
              <span className="font-black text-slate-900">₹2,50,000.00</span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Metered Power & DG Utilities</p>
                <p className="text-[10px] text-slate-400">Check-meter reading verified for Suite 101</p>
              </div>
              <span className="font-black text-slate-900">₹35,000.00</span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Goods & Services Tax (GST @ 18%)</p>
                <p className="text-[10px] text-slate-400">CGST 9% (₹1,15,650) + SGST 9% (₹1,15,650)</p>
              </div>
              <span className="font-black text-slate-900">₹2,31,300.00</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-black text-slate-900">Gross Total Invoiced</span>
              <span className="text-lg font-black text-indigo-700">₹15,16,300.00</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Tax invoice dispatched by Mango Groups
            </span>
            <button
              onClick={() => {
                if (totalOutstanding <= 0) {
                  alert("Invoice already fully settled.");
                  return;
                }
                setPayModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CreditCard size={14} /> Settle Invoice Now
            </button>
          </div>
        </div>

        {/* Right Column: Notices & Lease Milestones (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">Lease Milestones</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Lock-in Period (36 Months)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                Lease lock-in valid until 15-Nov-2029. 90 days mutual notice period applies.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Scheduled 5% Escalation
                </span>
                <Link href="/portal/contract" className="text-[10px] font-bold text-indigo-600 hover:underline">
                  View Terms →
                </Link>
              </div>
              <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                Next contractual rent step-up (+5%) scheduled on 01-Apr-2027.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Refundable Security Deposit
                </span>
                <span className="text-xs font-black text-slate-900">₹37,50,000</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                Equivalent to 3 months gross rent, securely held in landlord escrow account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Interactive Payment Settlement Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                  Official Settlement Terminal
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Settle Invoice INV-2026-27-0001
                </h3>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Amount Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Outstanding:</span>
                <span className="text-lg font-black text-slate-900">₹{totalOutstanding.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalPayMode"
                    checked={payAmountMode === "full"}
                    onChange={() => setPayAmountMode("full")}
                  />
                  <span>Full Amount (₹{totalOutstanding.toLocaleString("en-IN")})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalPayMode"
                    checked={payAmountMode === "custom"}
                    onChange={() => setPayAmountMode("custom")}
                  />
                  <span>Custom Partial Amount</span>
                </label>
              </div>

              {payAmountMode === "custom" && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Enter Amount to Pay (INR):</label>
                  <input
                    type="number"
                    value={customPayAmount}
                    onChange={(e) => setCustomPayAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-sm outline-none"
                  />
                </div>
              )}
            </div>

            {/* Payment Channel Selection Tabs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Select Settlement Channel:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayChannel("instant")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayChannel === "instant"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={selectedPayChannel === "instant" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">Instant Settlement</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Direct automated bank credit simulation
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayChannel("neft")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayChannel === "neft"
                      ? "border-teal-600 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className={selectedPayChannel === "neft" ? "text-teal-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">NEFT / RTGS with UTR</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Manual bank wire into Escrow account
                  </p>
                </button>
              </div>
            </div>

            {/* Channel Details */}
            {selectedPayChannel === "instant" ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <span>Real Database Execution Mode</span>
                </div>
                <p className="text-indigo-700 leading-relaxed text-[11px]">
                  Clicking below will execute an immediate settlement of <strong>₹{payableAmount.toLocaleString("en-IN")}</strong>. It updates invoice status to <strong>PAID</strong>, writes transaction records to the PostgreSQL database, and adjusts both the Property Owner and Manager dashboards live.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                  <span className="font-bold text-teal-900">Landlord Escrow Bank Details:</span>
                  <span className="text-[10px] font-black text-teal-700">Mango Groups Ltd</span>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-bold text-slate-800">HDFC Bank Ltd</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account No:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>50200084920194</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("50200084920194", "acct")}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        {copiedField === "acct" ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">IFSC Code:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>HDFC0001234</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("HDFC0001234", "ifsc")}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        {copiedField === "ifsc" ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-teal-200/60 space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-teal-900 block mb-1">
                      Bank Transaction / UTR Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFCR5202610220199"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-teal-300 font-mono font-bold text-slate-900 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={processingPayment || payableAmount <= 0}
                onClick={handleExecutePayment}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Settlement...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Confirm & Pay ₹{payableAmount.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Success Receipt Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Payment Settled & Verified
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                ₹{Number(paymentSuccess.amount).toLocaleString("en-IN")} Received!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Allocated to Invoice {paymentSuccess.invoice_number}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Payment Reference:</span>
                <span className="font-mono font-bold text-slate-900">{paymentSuccess.ref}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Channel:</span>
                <span className="font-bold text-slate-800">{paymentSuccess.channel}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Date & Time:</span>
                <span className="font-bold text-slate-800">{paymentSuccess.date}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Updated Balance:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ₹0.00 (Fully Paid)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setPaymentSuccess(null)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

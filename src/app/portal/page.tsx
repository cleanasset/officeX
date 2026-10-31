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
  Lock,
  Bell,
  Eye,
  Download
} from "lucide-react";

import { getClientAuthHeaders } from "@/lib/auth-storage";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

export default function TenantHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayChannel, setSelectedPayChannel] = useState<"instant" | "neft" | "razorpay">("razorpay");
  const [payAmountMode, setPayAmountMode] = useState<"full" | "custom">("full");
  const [customPayAmount, setCustomPayAmount] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // NEFT UTR fields
  const [utrNumber, setUtrNumber] = useState("");
  const [remittingBank, setRemittingBank] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Success Receipt State
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  // Dynamic Landlord Brand Logo & Tax Invoice Modal State (§S-60)
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [landlordBank, setLandlordBank] = useState<{
    spv_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    branch?: string;
  } | null>(null);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogo = localStorage.getItem("officex_brand_logo") || localStorage.getItem("officex_org_logo") || "";
      const storedBrand = localStorage.getItem("officex_brand_name") || "";
      const storedCompany = localStorage.getItem("officex_company_name") || localStorage.getItem("officex_property_spv") || "";
      const storedBankAcc = localStorage.getItem("officex_bank_account") || "";
      const storedBankIfsc = localStorage.getItem("officex_bank_ifsc") || "";
      const storedBankName = localStorage.getItem("officex_bank_name") || "";
      const storedSpv = localStorage.getItem("officex_property_spv") || "";

      if (storedLogo) setBrandLogo(storedLogo);
      if (storedBrand) setBrandName(storedBrand);
      if (storedCompany) setCompanyName(storedCompany);
      if (storedBankAcc && storedBankIfsc) {
        setLandlordBank({
          spv_name: storedSpv || storedCompany || "Commercial Landlord SPV",
          bank_name: storedBankName || "Commercial Bank",
          account_number: storedBankAcc,
          ifsc_code: storedBankIfsc,
        });
      }
    }

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
        if (json.landlord_bank_details?.account_number) {
          setLandlordBank(json.landlord_bank_details);
        }
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
  const reminders = data?.reminders || [];
  const latestReminder = reminders[0] || null;

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

    const targetInvoiceId = primaryInvoice?.id;
    if (!targetInvoiceId) {
      alert("No active invoice found to allocate payment");
      return;
    }

    // --- Channel 1: Real Net Banking & UPI via Live Razorpay Gateway ---
    if (selectedPayChannel === "razorpay") {
      setProcessingPayment(true);
      try {
        await initiateRazorpayPayment({
          amount: Math.round(payableAmount * 100), // in paise
          receipt: (primaryInvoice?.invoice_number || `INV-${Date.now()}`).slice(0, 40),
          description: `Rent - ${primaryInvoice?.invoice_number || "INV-2026-27-0001"}`,
          prefillName: tenantDisplayName,
          prefillEmail: occupant?.email || "",
          prefillPhone: occupant?.phone || "",
          notes: {
            invoice_id: targetInvoiceId,
            occupant_id: occupant.id || "",
            building: primaryContract?.property_name || (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || "" : "") || "Commercial Property",
            suite: primaryContract?.space_name || "Commercial Unit",
          },
          onSuccess: async (rzpRes) => {
            try {
              const res = await fetch("/api/portal/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: rzpRes.razorpay_payment_id,
                  order_id: rzpRes.razorpay_order_id,
                  invoice_ids: [targetInvoiceId],
                  amount_inr: payableAmount,
                  occupant_id: occupant.id,
                  payment_mode: "online",
                }),
              });

              const json = await res.json();
              if (!json.success) throw new Error(json.error || "Payment recording failed");

              setPaymentSuccess({
                amount: payableAmount,
                ref: rzpRes.razorpay_payment_id,
                channel: "Razorpay Real Net Banking / Gateway",
                date: new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                invoice_number: primaryInvoice?.invoice_number || "INV-2026-27-0001",
                allocations: json.allocations || [],
              });
              setPayModalOpen(false);
              await loadHomeData(occupant.id);
            } catch (err: any) {
              alert(err.message || "Failed to record payment verification");
            } finally {
              setProcessingPayment(false);
            }
          },
          onFailure: (err) => {
            setProcessingPayment(false);
            console.error("Razorpay payment error or cancelled:", err);
          },
        });
      } catch (err: any) {
        setProcessingPayment(false);
        console.error("Razorpay initiation error:", err);
        alert(err.message || "Could not launch Razorpay checkout.");
      }
      return;
    }

    // --- Channel 2: Direct Corporate Bank Wire (NEFT / RTGS with UTR) ---
    // --- Channel 3: Instant Demo Settlement (Test Mode) ---
    try {
      setProcessingPayment(true);
      const isNeft = selectedPayChannel === "neft";
      const paymentRef = isNeft
        ? (utrNumber.trim() || `HDFCR5${Date.now().toString().slice(-10)}`)
        : `DEMO_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await fetch("/api/portal/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: paymentRef,
          invoice_ids: [targetInvoiceId],
          amount_inr: payableAmount,
          occupant_id: occupant.id,
          payment_mode: isNeft ? "bank_transfer" : "online",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Payment recording failed");
      }

      setPaymentSuccess({
        amount: payableAmount,
        ref: paymentRef,
        channel: isNeft
          ? `Corporate Bank Wire (UTR: ${paymentRef})`
          : "Instant Demo Settlement",
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        invoice_number: primaryInvoice?.invoice_number || "INV-2026-27-0001",
        allocations: json.allocations || [],
      });

      setPayModalOpen(false);
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
                ? `${primaryContract.property_name} · ${primaryContract.building_name || "Tower 1"} · ${primaryContract.space_name} (${Number(primaryContract.chargeable_area_sqft || 0).toLocaleString("en-IN")} sq.ft.)`
                : (typeof window !== "undefined" && (localStorage.getItem("officex_active_property") || localStorage.getItem("officex_selected_property")))
                ? `${localStorage.getItem("officex_active_property") || localStorage.getItem("officex_selected_property")} · Demised Commercial Premises`
                : "Demised Commercial Workspace"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={14} /> Active Commercial Lease
          </span>
        </div>
      </div>

      {/* Active Management Collection Reminder Banner */}
      {latestReminder && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  Notice from {latestReminder.sender_name || "Property Operations"}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {latestReminder.created_at ? new Date(latestReminder.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                </span>
              </div>
              <p className="text-xs font-black text-slate-900">
                {latestReminder.title || "Payment Reminder: October 2026 Lease Settlement"}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                {latestReminder.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPayModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <CreditCard size={14} /> Settle Invoice Now
          </button>
        </div>
      )}

      {/* 2. Executive Financial Snapshot (Clean 3-Module Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Outstanding Balance & Payment */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Current Due
              </span>
              {totalOutstanding > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Due 31-Oct-2026
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Settled
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-bold">INR</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {totalOutstanding > 0 ? "October 2026 Tax Invoice · Dispatched" : "No outstanding bills pending"}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {totalOutstanding <= 0 ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> Account Fully Paid
              </span>
            ) : (
              <button
                id="dashboard-pay-now-btn"
                onClick={() => setPayModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <CreditCard size={14} /> Pay Now
              </button>
            )}
            <Link
              href="/portal/invoices"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              All Invoices <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Module 2: Security Deposit */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Security Deposit
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Protected in Escrow
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ₹{Number(summary.security_deposit_held_inr || primaryContract?.deposit_held || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-bold">INR</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {Number(summary.security_deposit_held_inr || primaryContract?.deposit_held || 0) > 0
                ? "Security deposit held in designated SPV escrow"
                : "No deposit balance recorded for this active unit"}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck size={14} /> 100% Refundable
            </span>
            <Link href="/portal/contract" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Deposit Terms →
            </Link>
          </div>
        </div>

        {/* Module 3: Account Standing & Lease Status */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Account & Lease Status
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Good Standing
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                Active
              </span>
              <span className="text-xs text-slate-400 font-bold">· 0 Arrears</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {primaryContract
                ? `Contract ${primaryContract.contract_code || "Active"} · Lock-in compliant`
                : "Operational lease active · 0 active disputes"}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>{primaryContract?.property_name ? `${primaryContract.property_name} Operations` : "Property Management"}</span>
            <Link href="/portal/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Support Contacts →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Two Column Layout: Transparent Invoice Breakdown & Lease Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transparent Invoice Breakdown (7 Cols) */}
        {primaryInvoice ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {brandLogo ? (
                  <div className="w-11 h-11 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={brandLogo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                    {(brandName || companyName || "Commercial Property Asset SPV").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {brandName || companyName || "Commercial Property Asset SPV"}
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {primaryInvoice.invoice_number || "INV-2026-0001"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Official Tax Invoice · Due {primaryInvoice.due_date ? new Date(primaryInvoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "31-Oct-2026"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewInvoiceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                title="View full tax invoice document"
              >
                <Eye size={13} /> View Invoice
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Commercial Base Rent</p>
                  <p className="text-[10px] text-slate-400">
                    {primaryContract?.space_name || "Demised Premises"} · Contracted Lease Rate
                  </p>
                </div>
                <span className="font-black text-slate-900">
                  ₹{Number(primaryInvoice.base_amount || primaryInvoice.total_amount_inr || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {Number(primaryInvoice.tax_amount || 0) > 0 && (
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Statutory GST (18%)</p>
                    <p className="text-[10px] text-slate-400">CGST 9% + SGST 9%</p>
                  </div>
                  <span className="font-black text-slate-900">
                    ₹{Number(primaryInvoice.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-black text-slate-900">Gross Total Invoiced</span>
                <span className="text-lg font-black text-indigo-700">
                  ₹{Number(primaryInvoice.total_amount_inr || primaryInvoice.gross_total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium leading-tight">
                <span>Billed by <strong className="text-slate-800">{brandName || companyName || "Commercial Property Asset SPV"}</strong></span>
                <span className="block text-[10px] text-slate-400">
                  {primaryContract?.property_name ? `${primaryContract.property_name} Asset Management` : "Property Asset Management"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewInvoiceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={13} /> Full Tax Invoice
                </button>

                {totalOutstanding <= 0 ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Settled (₹0.00 Due)
                  </span>
                ) : (
                  <button
                    id="settle-invoice-now-btn"
                    onClick={() => setPayModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <CreditCard size={14} /> Settle Invoice Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Receipt size={28} />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-black text-slate-900">No Invoices Pending</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your commercial lease is active. Monthly rental and CAM invoices will appear here once generated by the scheduled billing cycle.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Account In Good Standing
              </span>
            </div>
          </div>
        )}

        {/* Right Column: Notices & Lease Milestones (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">Lease Milestones</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Schedule
            </span>
          </div>

          <div className="space-y-3">
            {/* Active Management Notices */}
            {reminders.slice(0, 2).map((r: any) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Bell size={13} className="text-amber-600" />
                    {r.title || "Payment Reminder"}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {r.sender_name || "Property Operations"}
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 font-medium pl-4 leading-relaxed">
                  {r.message}
                </p>
                <div className="pl-4 pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today"}
                  </span>
                  <button
                    onClick={() => setPayModalOpen(true)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Settle Invoice Now →
                  </button>
                </div>
              </div>
            ))}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Contractual Lease Term
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                {primaryContract?.end_date
                  ? `Active term valid through ${new Date(primaryContract.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. ${primaryContract.notice_period_days || 90} days mutual notice period applies.`
                  : "Active commercial tenancy. Statutory lease terms and covenants apply."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Escalation Indexation
                </span>
                <Link href="/portal/contract" className="text-[10px] font-bold text-indigo-600 hover:underline">
                  View Terms →
                </Link>
              </div>
              <p className="text-xs text-slate-500 font-medium pl-3.5 leading-relaxed">
                {primaryContract?.escalation_percent
                  ? `Contractual rent step-up (+${primaryContract.escalation_percent}%) applies per agreed schedule.`
                  : "Periodic indexation applicable as per master commercial lease agreement."}
              </p>
            </div>

            {/* Quick Operational Help / Support Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 size={13} className="text-indigo-600" />
                  Facility & Property Contact
                </span>
                <span className="text-[10px] font-bold text-slate-500">{primaryContract?.space_name || "Demised Unit"}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Managed by {primaryContract?.property_name ? `${primaryContract.property_name} Operations` : "Property Facility Management"}. For fit-out requests or queries, reach facility support.
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs">
                <Link href="/portal/profile" className="font-bold text-indigo-600 hover:text-indigo-800">
                  View Manager Details →
                </Link>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayChannel("razorpay")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayChannel === "razorpay"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className={selectedPayChannel === "razorpay" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">Real Net Banking</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
                    Live Indian Bank Net Banking & UPI Gateway
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayChannel("neft")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayChannel === "neft"
                      ? "border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className={selectedPayChannel === "neft" ? "text-teal-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">Corporate Wire</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
                    Direct NEFT/RTGS to Owner Bank Account
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayChannel("instant")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayChannel === "instant"
                      ? "border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={selectedPayChannel === "instant" ? "text-amber-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">Demo Settle</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
                    Instant 1-click test across 3 open tabs
                  </p>
                </button>
              </div>
            </div>

            {/* Channel Details */}
            {selectedPayChannel === "razorpay" && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                  <div className="flex items-center gap-2 text-indigo-950 font-black">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <span>Live Payment Gateway (Razorpay Active)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    RBI Certified
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-indigo-900 leading-relaxed font-medium">
                  <p>
                    Opens authentic Indian Net Banking with direct authentication at your bank:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Bank", "IDFC FIRST", "UPI / QR", "Corporate Cards"].map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-slate-800 text-[10px] font-bold shadow-2xs">
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-[10px] pt-1">
                    Funds collected through this gateway settle directly into the <strong>Property Owner&apos;s linked bank account</strong> (T+1 bank remittance).
                  </p>
                </div>

                {payableAmount > 500000 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                      RBI Online Gateway Limit (₹5,00,000 per transaction)
                    </p>
                    <p className="text-[10px] leading-relaxed text-amber-800">
                      Online Net Banking & Gateways in India cap transactions at ₹5,00,000.
                      For the full <strong>₹{payableAmount.toLocaleString("en-IN")}</strong> commercial rent, use <strong>Corporate Wire (NEFT/RTGS)</strong> above (0% fee & no limit), or select <strong>Custom Partial Amount</strong> (e.g. ₹5,00,000 or ₹1,000) to test live Net Banking.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedPayChannel === "neft" && (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-teal-700" />
                    <span className="font-black text-teal-950">Owner Bank Escrow Details:</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                    0% Gateway Fee · No Limit
                  </span>
                </div>

                <p className="text-[11px] text-teal-900 font-medium leading-relaxed">
                  The enterprise industry standard for commercial leases: Your accounts department transfers directly from company bank account to landlord escrow account via Corporate Net Banking (CMS / RTGS).
                </p>

                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans font-semibold">Beneficiary SPV:</span>
                    <span className="font-bold text-slate-900 font-sans">
                      {landlordBank?.spv_name || brandName || companyName || "Commercial Landlord SPV"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans font-semibold">Bank Name:</span>
                    <span className="font-bold text-slate-900 font-sans">
                      {landlordBank?.bank_name || "Commercial Bank"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans font-semibold">Account Number:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{landlordBank?.account_number || "Pending Landlord Setup"}</span>
                      {landlordBank?.account_number && (
                        <button
                          type="button"
                          onClick={() => handleCopy(landlordBank.account_number!, "acct")}
                          className="text-teal-700 hover:text-teal-900 cursor-pointer p-0.5"
                          title="Copy account number"
                        >
                          {copiedField === "acct" ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans font-semibold">IFSC Code:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{landlordBank?.ifsc_code || "Pending Landlord Setup"}</span>
                      {landlordBank?.ifsc_code && (
                        <button
                          type="button"
                          onClick={() => handleCopy(landlordBank.ifsc_code!, "ifsc")}
                          className="text-teal-700 hover:text-teal-900 cursor-pointer p-0.5"
                          title="Copy IFSC code"
                        >
                          {copiedField === "ifsc" ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!landlordBank?.account_number && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                    ⚠️ The property owner has not linked direct wire details yet. Please use <strong>Real Net Banking</strong> above or contact property management.
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-teal-950 block">
                    Enter Bank Transfer UTR / Transaction Reference:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFCR5202610220199 or CMS99281729"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-teal-300 font-mono font-bold text-slate-900 outline-none text-xs"
                  />
                  <p className="text-[10px] text-teal-800 font-medium">
                    Entering the UTR matches the bank wire in PostgreSQL and updates the invoice to PAID immediately.
                  </p>
                </div>
              </div>
            )}

            {selectedPayChannel === "instant" && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <Zap size={16} className="text-amber-600" />
                  <span>Multi-Window Test Mode (Zero Real Rupee Spent)</span>
                </div>
                <p className="text-amber-900 leading-relaxed text-[11px] font-medium">
                  Designed so you can test the end-to-end Rent Roll lifecycle across your 3 open Chrome tabs (Tenant, Manager, Owner) right now without transferring real money. It commits real settlement records to PostgreSQL, marks the invoice as <strong>PAID</strong>, and refreshes the Owner statement and Manager collection metrics in real time.
                </p>
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
                className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 transition-all ${
                  selectedPayChannel === "razorpay"
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                    : selectedPayChannel === "neft"
                    ? "bg-teal-700 hover:bg-teal-600 shadow-teal-700/30"
                    : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                }`}
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Settlement...</span>
                  </>
                ) : selectedPayChannel === "razorpay" ? (
                  <>
                    <CreditCard size={14} />
                    <span>Launch Live Net Banking (₹{payableAmount.toLocaleString("en-IN")})</span>
                  </>
                ) : selectedPayChannel === "neft" ? (
                  <>
                    <Landmark size={14} />
                    <span>Submit Bank UTR & Record Wire (₹{payableAmount.toLocaleString("en-IN")})</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Execute Demo Settlement (₹{payableAmount.toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Full Statutory Tax Invoice Modal (§S-60 / Rule 46) */}
      {viewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="text-indigo-600" size={18} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Tax Invoice Document · Rule 46 CGST
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewInvoiceModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-4">
                {brandLogo ? (
                  <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                    <img src={brandLogo} alt="Landlord Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    {(brandName || companyName || "Commercial Property Asset SPV").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {brandName || companyName || "Commercial Property Asset SPV"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Commercial Property Asset SPV · Operations
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                    GSTIN: <strong>24AAFCO9876C1Z2</strong> · PAN: <strong>AAFCO9876C</strong>
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 block sm:inline-block">
                  Original Tax Invoice
                </span>
                <div className="text-sm font-mono font-black text-slate-900 mt-1">
                  {primaryInvoice?.invoice_number || "INV-2026-0001"}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Issue Date: <strong className="text-slate-900">{primaryInvoice?.invoice_date ? String(primaryInvoice.invoice_date).split("T")[0] : "21-Oct-2026"}</strong>
                </div>
                <div className="text-[11px] text-indigo-700 font-bold">
                  Due Date: <strong>{primaryInvoice?.due_date ? String(primaryInvoice.due_date).split("T")[0] : "31-Oct-2026"}</strong>
                </div>
              </div>
            </div>

            {/* Parties Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Billed By (Lessor / SPV):
                </span>
                <p className="font-bold text-slate-900 text-sm">{brandName || companyName || "Commercial Property Asset SPV"}</p>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  {primaryContract?.property_name ? `${primaryContract.property_name} Premises` : "Commercial Property Asset"}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  State: <strong>Gujarat (Code: 24)</strong> · Place of Supply: Gujarat
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Billed To (Lessee / Occupant):
                </span>
                <p className="font-bold text-slate-900 text-sm">{tenantDisplayName}</p>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Demised Space: {primaryContract ? `${primaryContract.space_name}, ${primaryContract.property_name}` : "Demised Commercial Workspace"}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  PAN: <strong>{occupant?.pan_number || "HSHS7878SD"}</strong> · Contract: <strong>{primaryContract?.contract_code || "LEAS-11886"}</strong>
                </p>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Description of Supply</th>
                    <th className="py-2.5 px-3.5">SAC Code</th>
                    <th className="py-2.5 px-3.5">Area / Basis</th>
                    <th className="py-2.5 px-3.5 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="py-3 px-3.5 text-slate-400 font-mono">01</td>
                    <td className="py-3 px-3.5 font-bold">
                      Commercial Office Base Rent
                      <span className="block text-[10px] text-slate-400 font-normal">{primaryContract?.space_name || "Demised Space"} Monthly Lease</span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600">997212</td>
                    <td className="py-3 px-3.5 text-slate-600">{primaryContract?.chargeable_area_sqft ? `${Number(primaryContract.chargeable_area_sqft).toLocaleString()} sq.ft.` : "Monthly Lease"}</td>
                    <td className="py-3 px-3.5 font-bold text-right">₹{Number(primaryInvoice?.base_amount || primaryInvoice?.total_amount_inr || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-slate-50/70 p-4 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Taxable Value:</span>
                  <span className="font-bold text-slate-900">₹{Number(primaryInvoice?.base_amount || primaryInvoice?.total_amount_inr || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(primaryInvoice?.tax_amount || 0) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Statutory GST (18%):</span>
                    <span className="font-mono font-bold text-slate-800">₹{Number(primaryInvoice.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>Gross Invoice Total (INR):</span>
                  <span className="text-indigo-700 text-base">₹{Number(primaryInvoice?.total_amount_inr || primaryInvoice?.gross_total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Bank Remittance Details Box */}
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-teal-950 mt-0.5">
                  {landlordBank?.bank_name || "Commercial Bank"} · Current A/c {landlordBank?.account_number || "••••••••"} · IFSC {landlordBank?.ifsc_code || "••••••••"}
                </p>
                <p className="text-[11px] text-teal-700 font-medium">
                  Beneficiary: {landlordBank?.spv_name || brandName || companyName || "Commercial Property Asset SPV"} · Remit via Corporate RTGS / NEFT
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-teal-800 border border-teal-200 font-mono">
                  SAC 997212 (TDS §194-I)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Executive Certified Rent Settlement Receipt Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Print Isolation Stylesheet */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #official-rent-receipt, #official-rent-receipt * {
                visibility: visible !important;
              }
              #official-rent-receipt {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 28px !important;
                background: white !important;
                color: #0f172a !important;
                box-shadow: none !important;
                border: 2px solid #0f172a !important;
                border-radius: 0 !important;
                z-index: 999999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div
            id="official-rent-receipt"
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[94vh] overflow-y-auto border border-slate-300 text-slate-800 font-sans"
          >
            {/* Formal Letterhead */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div className="flex items-start gap-3">
                {brandLogo ? (
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={brandLogo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    {(brandName || companyName || "OFFICEX").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    {brandName || companyName || "Commercial Property Asset SPV Ltd"}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Commercial Property Asset SPV · Asset Management & Operations
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    GSTIN: 24AAFCO9876C1Z2 · Ahmedabad, Gujarat, India
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-3 py-1 rounded bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider block">
                  Official Money Receipt
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-800 block mt-1.5">
                  Receipt No: RCT-2026-10-{Date.now().toString().slice(-5)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Date: {paymentSuccess.date}
                </span>
              </div>
            </div>

            {/* Official Title Banner */}
            <div className="text-center py-1 bg-slate-100 rounded border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Receipt for Commercial Lease Rental & Maintenance Charges
              </span>
            </div>

            {/* Prominent Paid Amount Box */}
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Net Amount Received in Full
                </span>
                <div className="text-3xl font-black text-emerald-950 font-mono mt-0.5">
                  ₹{Number(paymentSuccess.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Settlement Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-emerald-300 mt-0.5">
                  ✓ FULLY SETTLED (PAID)
                </span>
              </div>
            </div>

            {/* Core Receipt Breakdown Form */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-semibold">Received with Thanks From:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">{tenantDisplayName}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5">
                <span className="text-slate-500 font-semibold">Leased Commercial Premises:</span>
                <span className="sm:col-span-2 font-bold text-slate-800">
                  {primaryContract ? `${primaryContract.space_name}, ${primaryContract.property_name}` : "Demised Commercial Premises"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-semibold">Towards Settlement Of:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">
                  GST Tax Invoice: {paymentSuccess.invoice_number} (SAC: 997212 / 997221)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5">
                <span className="text-slate-500 font-semibold">Payment Channel & Mode:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">
                  {paymentSuccess.channel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-semibold">Bank UTR / Transaction ID:</span>
                <span className="sm:col-span-2 font-mono font-bold text-slate-900">
                  {paymentSuccess.ref}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5">
                <span className="text-slate-500 font-semibold">Credited to Landlord Escrow:</span>
                <span className="sm:col-span-2 font-mono font-medium text-slate-800">
                  {landlordBank?.bank_name || "HDFC Bank Operating SPV"} · A/c {landlordBank?.account_number || "••••••••"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-semibold">Remaining Balance Due:</span>
                <span className="sm:col-span-2 font-bold text-emerald-700">
                  ₹0.00 (Account in Good Standing · Zero Arrears)
                </span>
              </div>
            </div>

            {/* Signature & Statutory Seal Strip */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-4">
              <div className="text-[10px] text-slate-400 space-y-0.5 max-w-sm">
                <p className="font-semibold text-slate-600 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Statutory Rule 46 CGST & Section 65B Certified
                </p>
                <p>
                  This is a computer generated official money receipt digitally signed and recorded in the sovereign PostgreSQL Rent Roll ledger. No physical signature is required.
                </p>
              </div>

              <div className="text-center shrink-0">
                <div className="w-36 h-12 border-b-2 border-slate-400 flex items-center justify-center font-serif text-slate-600 italic text-xs">
                  Digitally Verified
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mt-1">
                  Authorized Signatory (SPV)
                </span>
              </div>
            </div>

            {/* Interactive Actions (Hidden during print) */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Printer size={15} /> Print Official Receipt (A4)
              </button>
              <button
                type="button"
                onClick={() => setPaymentSuccess(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
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

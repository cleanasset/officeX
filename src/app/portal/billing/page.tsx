"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Building2,
  Receipt,
  FileCheck2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Download,
  CheckCircle2,
  RefreshCw,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react";
import { TaxInvoiceDrawer } from "@/components/rent-roll/TaxInvoiceDrawer";

const formatINR = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val || 0);
};

function OccupantBillingPortalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantFromUrl = searchParams.get("tenantId") || "TEN-TECHNOVA";

  const [activeTab, setActiveTab] = useState<"outstanding" | "settled" | "documents">("outstanding");
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenantFromUrl);
  const [tenants, setTenants] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Razorpay Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<string>("upi");
  const [paymentCustomAmount, setPaymentCustomAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Dispute Modal state
  const [isDisputeOpen, setIsDisputeOpen] = useState<boolean>(false);
  const [disputeInvoice, setDisputeInvoice] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("cam_discrepancy");
  const [disputeAmount, setDisputeAmount] = useState<number>(0);
  const [disputeRemark, setDisputeRemark] = useState<string>("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState<boolean>(false);

  // Tax Invoice drawer
  const [selectedInvoiceForTaxDrawer, setSelectedInvoiceForTaxDrawer] = useState<any | null>(null);

  const fetchPortalData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch tenants
      const tRes = await fetch("/api/rent-roll/tenants");
      const tData = await tRes.json();
      if (tData.success && tData.tenants) {
        setTenants(tData.tenants);
      }

      // 2. Fetch invoices
      const iRes = await fetch("/api/rent-roll/invoices");
      const iData = await iRes.json();
      if (iData.success && iData.invoices) {
        setInvoices(iData.invoices);
      }

      // 3. Fetch collections
      const cRes = await fetch("/api/rent-roll/collections");
      const cData = await cRes.json();
      if (cData.success && cData.collections) {
        setCollections(cData.collections);
      }
    } catch (err) {
      console.error("Failed to fetch tenant portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const activeTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0] || {
    id: "TEN-TECHNOVA",
    legalName: "TechNova Solutions Pvt Ltd",
    tradeName: "TechNova",
    contactEmail: "finance@technova.com"
  };

  // Filter invoices and collections for this specific tenant (RR-PRT-02 isolation)
  const tenantInvoices = invoices.filter(
    inv => inv.tenantId === activeTenant.id || inv.tenantName?.toLowerCase().includes(activeTenant.tradeName?.toLowerCase() || "")
  );

  const outstandingInvoices = tenantInvoices.filter(i => (i.balanceDue || 0) > 0);
  const settledInvoices = tenantInvoices.filter(i => (i.balanceDue || 0) === 0);
  const tenantCollections = collections.filter(
    c => c.tenantId === activeTenant.id || c.tenantName?.toLowerCase().includes(activeTenant.tradeName?.toLowerCase() || "")
  );

  const totalOutstanding = outstandingInvoices.reduce((acc, i) => acc + (i.balanceDue || 0), 0);

  // Checkbox multi-select logic
  const handleToggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoiceIds.length === outstandingInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(outstandingInvoices.map(i => i.id));
    }
  };

  const selectedTotal = outstandingInvoices
    .filter(i => selectedInvoiceIds.includes(i.id))
    .reduce((acc, i) => acc + (i.balanceDue || 0), 0);

  const openCheckout = (amount: number, targetIds?: string[]) => {
    setPaymentCustomAmount(amount);
    if (targetIds) setSelectedInvoiceIds(targetIds);
    setIsCheckoutOpen(true);
  };

  const handleExecuteCheckout = async () => {
    if (!paymentCustomAmount || paymentCustomAmount <= 0) return;
    setIsProcessingPayment(true);
    try {
      const targetIds = selectedInvoiceIds.length > 0 ? selectedInvoiceIds : outstandingInvoices.map(i => i.id);
      const res = await fetch("/api/rent-roll/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceIds: targetIds,
          tenantId: activeTenant.id,
          tenantName: activeTenant.legalName || activeTenant.tradeName,
          amountPaid: paymentCustomAmount,
          paymentMode: paymentMode,
          paymentReference: `RZP_${Date.now().toString().slice(-8)}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message);
        setIsCheckoutOpen(false);
        setSelectedInvoiceIds([]);
        await fetchPortalData();
      } else {
        alert("Payment error: " + data.error);
      }
    } catch (err: any) {
      alert("Checkout error: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOpenDispute = (inv: any) => {
    setDisputeInvoice(inv);
    setDisputeAmount(inv.balanceDue || 0);
    setIsDisputeOpen(true);
  };

  const handleExecuteDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInvoice) return;
    setIsSubmittingDispute(true);
    try {
      const res = await fetch("/api/rent-roll/invoices/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: disputeInvoice.id,
          reason: disputeReason,
          disputeAmount,
          disputeRemark
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message);
        setIsDisputeOpen(false);
        await fetchPortalData();
      } else {
        alert("Error submitting dispute: " + data.error);
      }
    } catch (err: any) {
      alert("Dispute error: " + err.message);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-16">
      {/* Brand Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[#0F8B7D]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-gray-900 tracking-tight">
                  Apex Business Tower
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200">
                  Occupant Billing Portal (RR-PRT-01)
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Managed by OFFICEX Asset Management · White-Label Portal
              </p>
            </div>
          </div>

          {/* Tenant Switcher & Back Link */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-semibold">Logged-in Occupant:</span>
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  setSelectedInvoiceIds([]);
                }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.tradeName || t.legalName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => router.push("/properties/rent-roll")}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Operator View
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {actionFeedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
          </div>
        )}

        {/* Tenant Summary Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-bold">
              Account: {activeTenant.tenantCode || "TEN-001"}
            </span>
            <h1 className="text-2xl font-black mt-2 text-white">{activeTenant.legalName || activeTenant.tradeName}</h1>
            <p className="text-xs text-slate-300 mt-1">
              PAN: <span className="font-bold text-white">{activeTenant.pan || "AAACN1234F"}</span> · GSTIN: <span className="font-bold text-white">{activeTenant.gstin || "27AAACN1234F1Z8"}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding Due</span>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{formatINR(totalOutstanding)}</div>
            </div>
            {totalOutstanding > 0 && (
              <button
                onClick={() => openCheckout(totalOutstanding)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay All (Instant)</span>
              </button>
            )}
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("outstanding")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "outstanding"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Outstanding Invoices ({outstandingInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settled")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "settled"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Payment History & Receipts ({tenantCollections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "documents"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Permitted Lease Documents (UAT-24)</span>
          </button>
        </div>

        {/* ──── TAB 1: OUTSTANDING INVOICES ──── */}
        {activeTab === "outstanding" && (
          <div className="space-y-4">
            {/* Multi-Select Action Bar */}
            {outstandingInvoices.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.length === outstandingInvoices.length && outstandingInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-[#0F8B7D] focus:ring-[#0F8B7D] w-4 h-4 cursor-pointer"
                    />
                    <span>Select All Invoices ({outstandingInvoices.length})</span>
                  </label>
                  {selectedInvoiceIds.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      Selected: <strong className="text-gray-900">{selectedInvoiceIds.length}</strong> · Amount: <strong className="text-emerald-700">{formatINR(selectedTotal)}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedInvoiceIds.length > 0 && (
                    <button
                      onClick={() => openCheckout(selectedTotal)}
                      className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Selected ({formatINR(selectedTotal)})</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {outstandingInvoices.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-black text-gray-900">All Settled! Zero Outstanding Balance</h3>
                <p className="text-xs text-gray-500 mt-1">There are no pending dues or unpaid commercial invoices on this account.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {outstandingInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                      selectedInvoiceIds.includes(inv.id) ? "border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoiceIds.includes(inv.id)}
                          onChange={() => handleToggleSelectInvoice(inv.id)}
                          className="mt-1 rounded text-[#0F8B7D] focus:ring-[#0F8B7D] w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">{inv.invoiceNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.isDisputed
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : inv.status === "overdue"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {inv.isDisputed ? "Disputed" : inv.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Period: {inv.periodStart} to {inv.periodEnd}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>Base Rent: <strong>{formatINR(inv.baseRent)}</strong></span>
                            <span>CAM: <strong>{formatINR(inv.camCharges)}</strong></span>
                            <span>GST 18%: <strong>{formatINR(inv.gstAmount)}</strong></span>
                            <span>TDS 194-I: <strong>-{formatINR(inv.tdsDeducted)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Balance Due</span>
                          <div className="text-lg font-black text-rose-600">{formatINR(inv.balanceDue)}</div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setSelectedInvoiceForTaxDrawer(inv)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            View Invoice
                          </button>

                          <button
                            onClick={() => handleOpenDispute(inv)}
                            className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg cursor-pointer"
                          >
                            Dispute
                          </button>

                          <button
                            onClick={() => openCheckout(inv.balanceDue, [inv.id])}
                            className="px-3 py-1 bg-[#0F8B7D] hover:bg-[#0c7065] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 2: SETTLED INVOICES & MONEY RECEIPTS ──── */}
        {activeTab === "settled" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Settled Payment Receipts & Bank Escrow UTRs
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Official money receipts with tax deduction at source (TDS) and sub-ledger allocation breakdown
              </p>
            </div>

            {tenantCollections.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No payment receipts found for this occupant account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Mode / Gateway</th>
                      <th className="py-3 px-4">Bank Reference (UTR)</th>
                      <th className="py-3 px-4 text-right">Amount Credited</th>
                      <th className="py-3 px-4 text-right">TDS u/s 194-I</th>
                      <th className="py-3 px-4 text-center">Receipt PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {tenantCollections.map((col) => (
                      <tr key={col.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-black text-gray-900">{col.receiptNumber}</td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">{col.paymentDate}</td>
                        <td className="py-3.5 px-4 font-semibold uppercase">{col.paymentMode}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-800">{col.referenceNumber}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700">{formatINR(col.amountReceived)}</td>
                        <td className="py-3.5 px-4 text-right text-gray-500">{formatINR(col.tdsDeducted || 0)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => alert(`Official Money Receipt #${col.receiptNumber} downloaded.`)}
                            className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-teal-600" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 3: PERMITTED LEASE DOCUMENTS (UAT-24) ──── */}
        {activeTab === "documents" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Occupant-Permitted Contract Documents (UAT-24)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory commercial lease documents permitted for tenant legal and auditor review
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Commercial Registered Lease Agreement</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Executed on Stamp Paper · 3-Year Term · APX-L-0042</p>
                </div>
                <button
                  onClick={() => alert("Downloading Registered Lease Agreement PDF...")}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F8B7D]" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Demised Unit Floor Plan Annexure</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Architect-Certified Carpet & Super Built-up Area</p>
                </div>
                <button
                  onClick={() => alert("Downloading Demised Floor Plan Annexure...")}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F8B7D]" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Handover Protocol & Fit-Out Sign-Off</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">MEP Inspection, Meter Initial Readings & Keys Handover</p>
                </div>
                <button
                  onClick={() => alert("Downloading Handover Protocol...")}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F8B7D]" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">GST Registration & PAN Compliance Certificate</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Verified Indian Statutory Records</p>
                </div>
                <button
                  onClick={() => alert("Downloading KYC Records...")}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F8B7D]" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Razorpay Online Checkout Simulation Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Razorpay Header Style */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200">
                  Razorpay Secure Checkout
                </span>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-blue-200 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3">
                <span className="text-xs text-blue-100">Paying To: Apex Business Tower Escrow</span>
                <div className="text-3xl font-black mt-1 text-white">{formatINR(paymentCustomAmount)}</div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Payment Amount (INR)</label>
                <input
                  type="number"
                  value={paymentCustomAmount}
                  onChange={(e) => setPaymentCustomAmount(Number(e.target.value))}
                  className="w-full mt-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Select Instant Payment Instrument</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("upi")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      paymentMode === "upi" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <div>UPI / QR Code</div>
                    <span className="text-[10px] text-gray-400 font-normal">GPay, PhonePe, Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("credit_card")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      paymentMode === "credit_card" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <div>Corporate Cards</div>
                    <span className="text-[10px] text-gray-400 font-normal">Visa, Mastercard, Amex</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("neft_rtgs")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      paymentMode === "neft_rtgs" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <div>Corporate NetBanking</div>
                    <span className="text-[10px] text-gray-400 font-normal">HDFC, ICICI, SBI, Axis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("ach")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      paymentMode === "ach" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <div>Virtual Escrow A/c</div>
                    <span className="text-[10px] text-gray-400 font-normal">Instant UTR Match</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sub-ledger Priority Engine (RR-PAY-04)</span>
                </div>
                <p>Funds will automatically settle GST output taxes first, then Base Rent, and then CAM recoveries.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCheckout}
                  disabled={isProcessingPayment}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isProcessingPayment ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  <span>Pay {formatINR(paymentCustomAmount)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Dispute Modal */}
      {isDisputeOpen && disputeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900">Raise Dispute on Invoice</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Invoice #{disputeInvoice.invoiceNumber} · Balance {formatINR(disputeInvoice.balanceDue)}
            </p>

            <form onSubmit={handleExecuteDispute} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="cam_discrepancy">CAM calculation or rate discrepancy</option>
                  <option value="rent_free_period">Rent-free fit-out period not deducted</option>
                  <option value="meter_reading_error">Incorrect utility / electricity meter reading</option>
                  <option value="tds_mismatch">TDS deduction mismatch</option>
                  <option value="service_deficiency">Facility / HVAC outage penalty deduction</option>
                  <option value="other">Other commercial clarification</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700">Disputed Amount (₹)</label>
                <input
                  type="number"
                  value={disputeAmount}
                  onChange={(e) => setDisputeAmount(Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Remarks & Clarification</label>
                <textarea
                  rows={3}
                  placeholder="Provide clause reference or meter discrepancy details..."
                  value={disputeRemark}
                  onChange={(e) => setDisputeRemark(e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-normal"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isSubmittingDispute ? "Submitting..." : "Submit Formal Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Drawer */}
      {selectedInvoiceForTaxDrawer && (
        <TaxInvoiceDrawer
          invoice={selectedInvoiceForTaxDrawer}
          onClose={() => setSelectedInvoiceForTaxDrawer(null)}
          onOpenRecordPayment={(inv) => openCheckout(inv.balanceDue, [inv.id])}
        />
      )}
    </div>
  );
}

export default function OccupantBillingPortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-gray-500">Loading Occupant Billing Portal...</div>}>
      <OccupantBillingPortalInner />
    </Suspense>
  );
}

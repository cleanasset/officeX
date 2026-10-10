"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  Search,
  Filter,
  CheckSquare,
  Square,
  CreditCard,
  ChevronRight,
  Download,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Eye,
  Send,
  Landmark,
  Copy,
  Check
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

interface PortalInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: string;
  gst_amount: string;
  gross_total: string;
  amount_paid: string;
  balance_due: string;
  status: string;
  dispute_status: string;
  contract_code: string;
  space_name: string;
  property_name: string;
  line_items?: any[];
}

function TenantInvoicesContent() {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("pay");

  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [searchTerm, setSearchTerm] = useState("");

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [payMode, setPayMode] = useState<"full" | "custom">("full");
  const [customAmount, setCustomAmount] = useState<string>("");

  // Drawer / Details modal state
  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);

  // Dispute modal state (§T-05)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeInvoice, setDisputeInvoice] = useState<PortalInvoice | null>(null);
  const [disputeReason, setDisputeReason] = useState("wrong_rate");
  const [disputedAmount, setDisputedAmount] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeSuccessMsg, setDisputeSuccessMsg] = useState<string | null>(null);

  // Payment result screen (§T-03)
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Net Banking / Direct Bank Transfer State (§T-02 / §T-03)
  const [netBankingModalOpen, setNetBankingModalOpen] = useState(false);
  const [landlordBankDetails, setLandlordBankDetails] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [remittingBank, setRemittingBank] = useState("");
  const [transferMethod, setTransferMethod] = useState("NEFT");
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [transferNotes, setTransferNotes] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [netBankingSuccessResult, setNetBankingSuccessResult] = useState<any | null>(null);

  useEffect(() => {
    loadInvoices();

    const handleOccChange = () => {
      loadInvoices();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, [filterTab]);

  async function loadInvoices() {
    try {
      setLoading(true);
      const res = await fetch(`/api/portal/invoices?status=${filterTab}`);
      const json = await res.json();
      if (json.success) {
        const list: PortalInvoice[] = json.invoices || [];
        setInvoices(list);

        // Pre-selection rule from §T-02:
        // Default: all overdue + due within 7 days pre-selected.
        const todayStr = new Date().toISOString().split("T")[0];
        const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

        const preselected = new Set<string>();
        list.forEach((inv) => {
          const bal = Number(inv.balance_due) || 0;
          if (bal > 0) {
            const dueDate = inv.due_date ? String(inv.due_date).split("T")[0] : "";
            if (preselectId && inv.id === preselectId) {
              preselected.add(inv.id);
            } else if (!preselectId && dueDate && dueDate <= in7Days) {
              preselected.add(inv.id);
            }
          }
        });

        setSelectedIds(preselected);
      }
    } catch (e) {
      console.error("Failed to load invoices", e);
    } finally {
      setLoading(false);
    }
  }

  // Filtered by search
  const displayedInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const q = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.period_start?.toLowerCase().includes(q) ||
        inv.space_name?.toLowerCase().includes(q)
    );
  }, [invoices, searchTerm]);

  // Selected invoices total sum
  const selectedSum = useMemo(() => {
    let sum = 0;
    invoices.forEach((inv) => {
      if (selectedIds.has(inv.id)) {
        sum += Number(inv.balance_due) || 0;
      }
    });
    return Math.round(sum * 100) / 100;
  }, [invoices, selectedIds]);

  const finalPayAmount = useMemo(() => {
    if (payMode === "custom") {
      const parsed = Number(customAmount) || 0;
      return Math.min(parsed, selectedSum);
    }
    return selectedSum;
  }, [payMode, customAmount, selectedSum]);

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (selectedIds.size === displayedInvoices.length) {
      setSelectedIds(new Set());
    } else {
      const allUnpaid = new Set<string>();
      displayedInvoices.forEach((inv) => {
        if ((Number(inv.balance_due) || 0) > 0) allUnpaid.add(inv.id);
      });
      setSelectedIds(allUnpaid);
    }
  }

  // Payment Execution (Screen T-03: Razorpay checkout)
  async function handleProceedPayment() {
    if (selectedIds.size === 0 || finalPayAmount <= 0) return;

    if (payMode === "custom" && Number(customAmount) < 1000) {
      alert("Minimum partial payment amount is ₹1,000 (§T-02).");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Create order
      const orderRes = await fetch("/api/portal/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_ids: Array.from(selectedIds),
          pay_amount_inr: finalPayAmount,
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        throw new Error(orderJson.error || "Failed to create payment order");
      }

      // 2. Launch Razorpay Checkout
      await initiateRazorpayPayment({
        amount: orderJson.amount_paise,
        receipt: orderJson.receipt,
        description: `Settlement for ${selectedIds.size} lease invoice(s)`,
        onSuccess: async (res) => {
          // 3. Verify on server and auto-allocate
          const verifyRes = await fetch("/api/portal/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: res.razorpay_payment_id,
              order_id: res.razorpay_order_id,
              invoice_ids: Array.from(selectedIds),
              amount_inr: finalPayAmount,
              payment_mode: "online",
            }),
          });
          const verifyJson = await verifyRes.json();
          if (verifyJson.success) {
            setPaymentResult({
              amount_paid: finalPayAmount,
              payment_ref: res.razorpay_payment_id,
              date: new Date().toLocaleString("en-IN"),
              allocations: verifyJson.allocations || [],
            });
            loadInvoices();
          } else {
            alert(`Payment recorded but allocation error: ${verifyJson.error}`);
          }
        },
        onFailure: (err) => {
          console.error("Razorpay failure callback", err);
        },
      });
    } catch (e: any) {
      console.error("Payment initiation failed", e);
      alert(e.message || "Failed to launch payment checkout");
    } finally {
      setIsProcessingPayment(false);
    }
  }

  // Dispute submission (§T-05)
  async function handleSubmitDispute() {
    if (!disputeInvoice) return;
    if (disputeDescription.trim().length < 20) {
      alert("Please provide a description of at least 20 characters detailing the discrepancy (§T-05).");
      return;
    }

    try {
      setSubmittingDispute(true);
      const res = await fetch("/api/portal/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: disputeInvoice.id,
          reason_code: disputeReason,
          disputed_amount: disputedAmount || disputeInvoice.balance_due,
          description: disputeDescription,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDisputeSuccessMsg(json.message);
        setTimeout(() => {
          setDisputeModalOpen(false);
          setDisputeSuccessMsg(null);
          setDisputeDescription("");
          loadInvoices();
        }, 2000);
      } else {
        alert(json.error || "Failed to submit dispute");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit dispute");
    } finally {
      setSubmittingDispute(false);
    }
  }

  // Load Landlord's Bank Account for Direct Transfer
  async function fetchLandlordBankDetails() {
    try {
      const res = await fetch("/api/portal/payments/netbanking");
      if (res.ok) {
        const json = await res.json();
        if (json.bank_details) {
          setLandlordBankDetails(json.bank_details);
        }
      }
    } catch (e) {
      console.error("Failed to load landlord bank details:", e);
    }
  }

  function handleCopy(text: string, fieldName: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  // Submit Net Banking Direct Payment Proof (§T-03)
  async function handleSubmitNetBankingTransfer() {
    if (!utrNumber || utrNumber.trim().length === 0) {
      alert("Please enter the Bank Transaction / UTR reference number (§T-02).");
      return;
    }

    try {
      setSubmittingTransfer(true);
      const res = await fetch("/api/portal/payments/netbanking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPayAmount,
          reference_id: utrNumber.trim(),
          payment_method: transferMethod.toLowerCase(),
          payment_date: transferDate,
          bank_name: remittingBank,
          invoice_ids: Array.from(selectedIds),
          notes: transferNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setNetBankingSuccessResult({
          payment_id: json.payment_id,
          utr: utrNumber.trim(),
          amount: finalPayAmount,
          method: transferMethod,
          date: transferDate,
          bank_name: remittingBank,
          invoices_count: selectedIds.size,
        });
        setNetBankingModalOpen(false);
        setUtrNumber("");
        setRemittingBank("");
        setTransferNotes("");
        loadInvoices();
      } else {
        alert(json.error || "Failed to record Net Banking transfer.");
      }
    } catch (e: any) {
      console.error("Net banking submission error:", e);
      alert(e.message || "Failed to submit bank transfer details.");
    } finally {
      setSubmittingTransfer(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoices & Settlement</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Review monthly lease invoices, verify charges, or settle online via Razorpay.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search (§T-02 Wireframe) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterTab("unpaid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "unpaid"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Unpaid Invoices
          </button>
          <button
            onClick={() => setFilterTab("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "paid"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paid History
          </button>
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Invoices
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer">
                    {selectedIds.size > 0 && selectedIds.size === displayedInvoices.length ? (
                      <CheckSquare size={16} className="text-indigo-600" />
                    ) : (
                      <Square size={16} className="text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Invoice / Type</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Gross Total</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    No invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                displayedInvoices.map((inv) => {
                  const isSelected = selectedIds.has(inv.id);
                  const bal = Number(inv.balance_due) || 0;
                  const isPaid = bal <= 0 || inv.status === "paid";
                  const isDisputed = inv.dispute_status === "under_dispute";

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          disabled={isPaid}
                          onClick={() => toggleSelect(inv.id)}
                          className={`cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} className="text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{inv.invoice_number}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {inv.space_name || "Commercial Space"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.period_start || "Current Period"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "Immediate"}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        ₹{Number(inv.gross_total || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ₹{bal.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isDisputed ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            Disputed
                          </span>
                        ) : isPaid ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Paid
                          </span>
                        ) : Number(inv.amount_paid) > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            Part-paid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                            Unpaid
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            title="View Line Items"
                          >
                            <Eye size={13} />
                          </button>

                          {!isPaid && !isDisputed && (
                            <button
                              onClick={() => {
                                setDisputeInvoice(inv);
                                setDisputedAmount(inv.balance_due);
                                setDisputeModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Raise Dispute"
                            >
                              Dispute
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Settlement Bar (§T-02 Wireframe) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-4 sm:p-5 transition-all animate-in slide-in-from-bottom duration-200">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-500">Selected {selectedIds.size} invoice(s):</span>
                <span className="text-xl font-black text-slate-900">
                  ₹{selectedSum.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Pay Mode Radio */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payMode === "full"}
                    onChange={() => setPayMode("full")}
                  />
                  <span>Full Amount (₹{selectedSum.toLocaleString("en-IN")})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payMode === "custom"}
                    onChange={() => setPayMode("custom")}
                  />
                  <span>Custom Partial Amount</span>
                </label>
                {payMode === "custom" && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Min 1,000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-28 px-2 py-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Allocation Rule: Applies sequentially to oldest due date first (§T-02).
              </p>
            </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  disabled={finalPayAmount <= 0}
                  onClick={() => {
                    fetchLandlordBankDetails();
                    setNetBankingModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-black text-sm tracking-wide shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                  title="Direct bank transfer (NEFT/RTGS/IMPS) to Landlord Bank Account (§T-02)"
                >
                  <Landmark size={16} /> Pay ₹{finalPayAmount.toLocaleString("en-IN")} via Net Banking
                </button>

                <button
                  disabled={isProcessingPayment || finalPayAmount <= 0}
                  onClick={handleProceedPayment}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  <CreditCard size={15} /> Card / Gateway
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Invoice Detail Drawer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedInvoice.invoice_number}</h3>
                <p className="text-[11px] text-slate-400">
                  {selectedInvoice.space_name} · Period: {selectedInvoice.period_start}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Line items list */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Line Items Breakdown
              </span>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {(selectedInvoice.line_items || []).length === 0 ? (
                  <div className="p-3 text-slate-400 text-center">Consolidated Rent & CAM Line</div>
                ) : (
                  (selectedInvoice.line_items || []).map((li: any) => (
                    <div key={li.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{li.description || li.item_name}</span>
                        <span className="text-[10px] text-slate-400 block">HSN/SAC: {li.hsn_sac || "997212"}</span>
                      </div>
                      <span className="font-black text-slate-900">
                        ₹{Number(li.line_total || li.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial summary */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">₹{Number(selectedInvoice.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% CGST + SGST):</span>
                <span className="font-bold">₹{Number(selectedInvoice.gst_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black pt-1.5 border-t border-slate-200 text-sm">
                <span>Gross Total:</span>
                <span>₹{Number(selectedInvoice.gross_total || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold pt-1">
                <span>Balance Due:</span>
                <span>₹{Number(selectedInvoice.balance_due || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Screen T-05: Raise Dispute Modal */}
      {disputeModalOpen && disputeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Raise Dispute on Invoice</h3>
                <p className="text-[11px] text-slate-400">
                  {disputeInvoice.invoice_number} · Outstanding: ₹{disputeInvoice.balance_due}
                </p>
              </div>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {disputeSuccessMsg ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Dispute Ticket Logged</h4>
                <p className="text-xs text-slate-500">{disputeSuccessMsg}</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dispute Reason *</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                  >
                    <option value="wrong_rate">Wrong rate charged (§T-05)</option>
                    <option value="wrong_area">Wrong quantity / chargeable area</option>
                    <option value="meter_reading">Discrepancy in utility sub-meter reading</option>
                    <option value="already_paid">Already paid via bank RTGS/NEFT</option>
                    <option value="service_issue">Service defect / facility maintenance SLA breach</option>
                    <option value="other">Other billing discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Disputed Amount (₹)</label>
                  <input
                    type="number"
                    value={disputedAmount}
                    onChange={(e) => setDisputedAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                    placeholder="Enter disputed sum"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Detailed Explanation * <span className="text-slate-400 font-normal">(min 20 characters)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Explain the discrepancy in detail so our Finance team can review..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400">
                    Characters: {disputeDescription.length}/20 minimum
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/60 text-[11px] text-indigo-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-600" /> 7-Day SLA Guarantee
                  </p>
                  <p className="text-indigo-800 leading-tight">
                    Disputed invoice balance will be marked under review and exempted from late payment penalty.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDisputeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submittingDispute}
                    onClick={handleSubmitDispute}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} /> Submit Dispute
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen T-03: Payment Result Confirmation Screen */}
      {paymentResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ref: {paymentResult.payment_ref} · {paymentResult.date}
              </p>
            </div>

            <div className="text-4xl font-black text-slate-900">
              ₹{Number(paymentResult.amount_paid).toLocaleString("en-IN")}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Applied Allocations
              </span>
              {paymentResult.allocations.map((alloc: any) => (
                <div key={alloc.allocation_id} className="flex justify-between items-center py-1">
                  <span className="font-bold text-slate-800">{alloc.invoice_number}</span>
                  <div className="text-right">
                    <span className="font-black text-emerald-600">
                      ₹{Number(alloc.amount_allocated_inr).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Bal: ₹{Number(alloc.new_balance_due).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              A digital receipt and Form 26AS acknowledgment will be sent to your billing email.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/portal/payments"
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                View Receipts
              </Link>
              <button
                onClick={() => setPaymentResult(null)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen T-02 / T-03: Direct Net Banking Modal */}
      {netBankingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                    §T-02 Direct Settlement
                  </span>
                  <span className="text-xs font-bold text-slate-400">Owner Bank Transfer</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Pay via Net Banking (NEFT / RTGS / IMPS)
                </h3>
                <p className="text-xs text-slate-500">
                  Transfer rent directly to the Property Owner&apos;s verified bank account and record your UTR number for automated reconciliation.
                </p>
              </div>
              <button
                onClick={() => setNetBankingModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Landlord Verified Bank Details Box */}
            <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <Landmark size={14} className="text-[#0F8B7D]" />
                  Beneficiary (Landlord) Bank Account
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                  Verified SPV Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Account Name / Beneficiary</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-bold text-slate-900 truncate">
                      {landlordBankDetails?.name || "OFFICEX Commercial Properties Private Limited"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(landlordBankDetails?.name || "OFFICEX Commercial Properties Private Limited", "name")}
                      className="p-1 text-slate-400 hover:text-teal-700"
                      title="Copy"
                    >
                      {copiedField === "name" ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Bank Name</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-bold text-slate-900 truncate">
                      {landlordBankDetails?.bankName || "HDFC Bank Limited"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(landlordBankDetails?.bankName || "HDFC Bank Limited", "bankName")}
                      className="p-1 text-slate-400 hover:text-teal-700"
                      title="Copy"
                    >
                      {copiedField === "bankName" ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Account Number</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono font-black text-slate-900 text-sm tracking-wider">
                      {landlordBankDetails?.bankAccountNumber || "50200084920194"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(landlordBankDetails?.bankAccountNumber || "50200084920194", "account")}
                      className="p-1 text-slate-400 hover:text-teal-700"
                      title="Copy"
                    >
                      {copiedField === "account" ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-bold text-slate-400 block">IFSC Code</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono font-black text-teal-800 text-sm tracking-wider">
                      {landlordBankDetails?.bankIfscCode || "HDFC0000060"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(landlordBankDetails?.bankIfscCode || "HDFC0000060", "ifsc")}
                      className="p-1 text-slate-400 hover:text-teal-700"
                      title="Copy"
                    >
                      {copiedField === "ifsc" ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {landlordBankDetails?.upiId && (
                <div className="flex items-center justify-between bg-white/90 px-3 py-2 rounded-xl border border-teal-100 text-xs">
                  <span className="text-slate-500 font-semibold">Or via Corporate UPI / VPA:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">{landlordBankDetails.upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(landlordBankDetails.upiId, "upi")}
                      className="p-1 text-slate-400 hover:text-teal-700"
                    >
                      {copiedField === "upi" ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transfer Submission Form */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Transfer Amount (INR)</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${finalPayAmount.toLocaleString("en-IN")}`}
                    className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-black text-slate-900 text-sm outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Channel *</label>
                  <select
                    value={transferMethod}
                    onChange={(e) => setTransferMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                  >
                    <option value="NEFT">NEFT (National Electronic Fund)</option>
                    <option value="RTGS">RTGS (Real-Time Gross Settlement)</option>
                    <option value="IMPS">IMPS (Immediate Payment)</option>
                    <option value="BANK_TRANSFER">Direct Account Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Bank UTR / Transaction Ref *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC000192837482"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Found on your bank debit receipt or SMS confirmation.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Remitting Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank, SBI, Axis"
                    value={remittingBank}
                    onChange={(e) => setRemittingBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Remarks / Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rent for Oct 2026"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNetBankingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingTransfer || !utrNumber.trim()}
                onClick={handleSubmitNetBankingTransfer}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
              >
                <Check size={14} />
                {submittingTransfer ? "Recording Transfer..." : "Submit Bank Transfer & UTR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen T-03: Net Banking Confirmation & Challan Modal */}
      {netBankingSuccessResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-[#0F8B7D] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                §T-03 Payment Recorded
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Bank Transfer Logged!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your direct Net Banking payment has been registered.
              </p>
            </div>

            <div className="text-4xl font-black text-[#0F8B7D]">
              ₹{Number(netBankingSuccessResult.amount).toLocaleString("en-IN")}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Transaction / UTR:</span>
                <span className="font-mono font-black text-slate-900">{netBankingSuccessResult.utr}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Payment Channel:</span>
                <span className="font-bold text-slate-800 uppercase">{netBankingSuccessResult.method}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Transfer Date:</span>
                <span className="font-bold text-slate-800">{netBankingSuccessResult.date}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Settlement Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Owner Reconciliation
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              The Landlord&apos;s finance team has received your UTR number for bank reconciliation. The payment is linked to your invoices.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/portal/payments"
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                View in Ledger
              </Link>
              <button
                onClick={() => setNetBankingSuccessResult(null)}
                className="flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs transition-colors cursor-pointer"
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

export default function TenantInvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Invoices & Settlements...</p>
        </div>
      }
    >
      <TenantInvoicesContent />
    </Suspense>
  );
}


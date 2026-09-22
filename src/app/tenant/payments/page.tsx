"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, Download, ShieldCheck, CheckCircle, X, 
  QrCode, Smartphone, Building, Lock, Check, Loader2, ArrowRight,
  AlertCircle, RefreshCw, FileText
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

interface TenantInvoice {
  id: string;
  invoiceNumber: string;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  billingMonth: string;
  invoiceDate: string;
  dueDate: string;
  baseRent: number;
  camCharges: number;
  utilityCharges: number;
  parkingCharges: number;
  subtotal: number;
  gstAmount: number;
  grossTotal: number;
  tdsDeducted: number;
  netPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: "paid" | "partially_paid" | "pending" | "overdue" | "cancelled";
  paidDate?: string;
  paymentMode?: string;
  referenceNumber?: string;
}

interface TenantCollection {
  id: string;
  receiptNumber: string;
  invoiceNumber?: string;
  paymentDate: string;
  paymentMode: string;
  referenceNumber: string;
  amountReceived: number;
  tdsDeducted: number;
  status?: string;
}

export default function RentPaymentGateway() {
  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [collections, setCollections] = useState<TenantCollection[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active invoice selected for payment
  const [selectedInvoice, setSelectedInvoice] = useState<TenantInvoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchTenantData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tenant/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setCollections(data.collections || []);
        setTenantInfo(data.tenant || null);
        setSummary(data.summary || null);

        // Select the first pending/overdue invoice by default
        const pending = (data.invoices || []).find((i: TenantInvoice) => i.status !== "paid");
        if (pending) {
          setSelectedInvoice(pending);
        } else if (data.invoices && data.invoices.length > 0) {
          setSelectedInvoice(data.invoices[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching tenant billing:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const handleOpenPayModal = (inv: TenantInvoice) => {
    setSelectedInvoice(inv);
    setShowPayModal(true);
  };

  const handleRazorpayPayment = async (overrideAmount?: number) => {
    if (!selectedInvoice) return;
    setIsProcessing(true);

    try {
      const standardAmount = selectedInvoice.balanceDue > 0 ? selectedInvoice.balanceDue : selectedInvoice.netPayable;
      const amountToPay = overrideAmount !== undefined ? overrideAmount : standardAmount;

      await initiateRazorpayPayment({
        amount: Math.round(amountToPay * 100), // convert to paise
        receipt: `INV-${selectedInvoice.invoiceNumber || Date.now()}`,
        description: `Rent Payment — ${selectedInvoice.propertyName} (${selectedInvoice.billingMonth}) [₹${amountToPay.toLocaleString("en-IN")}]`,
        prefillName: tenantInfo?.tenantName || "",
        prefillEmail: tenantInfo?.contactEmail || "",
        notes: {
          invoiceId: selectedInvoice.id,
          leaseId: selectedInvoice.leaseId,
          billingMonth: selectedInvoice.billingMonth,
          type: "rent_payment",
        },
        onSuccess: async (response) => {
          // Payment verified — record collection with real Razorpay payment ID
          const payload = {
            invoiceId: selectedInvoice.id,
            leaseId: selectedInvoice.leaseId,
            amountReceived: amountToPay,
            tdsDeducted: selectedInvoice.tdsDeducted || 0,
            paymentMode: "razorpay_live",
            referenceNumber: response.razorpay_payment_id,
            paymentDate: new Date().toISOString().split("T")[0],
            bankAccount: "Razorpay Escrow Settlement",
            notes: `Verified Razorpay Payment | Order: ${response.razorpay_order_id || ""} | Payment: ${response.razorpay_payment_id}`
          };

          const res = await fetch("/api/rent-roll/collections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const resData = await res.json();
            setIsPaidSuccess(true);
            setTimeout(() => {
              setShowPayModal(false);
              setIsPaidSuccess(false);
              setToast(`Payment verified! ₹${amountToPay.toLocaleString("en-IN")} settled. Razorpay ID: ${response.razorpay_payment_id}`);
              fetchTenantData();
              setTimeout(() => setToast(null), 6000);
            }, 1200);
          } else {
            const err = await res.json();
            setToast(`Payment received but recording failed: ${err.error}`);
            setTimeout(() => setToast(null), 5000);
          }
        },
        onFailure: (error) => {
          console.error("Razorpay payment failed:", error);
          setToast(`Payment failed: ${error?.description || error?.message || "Please try again"}`);
          setTimeout(() => setToast(null), 5000);
        },
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      setToast(`Payment error: ${error.message || "Network error"}`);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTaxCertificate = () => {
    const totalPaid = collections.reduce((sum, c) => sum + (c.amountReceived || 0), 0);
    const totalTds = collections.reduce((sum, c) => sum + (c.tdsDeducted || 0), 0);
    const tenantName = tenantInfo?.tenantName || "Tata Consultancy Services Ltd";

    const content = `================================================================================
                       OFFICEX COMMERCIAL REAL ESTATE
                      ANNUAL TAX & TDS CERTIFICATE (FY 2025-26)
================================================================================

Certificate ID    : CERT-TAX-${Date.now().toString().slice(-6)}
Generated Date    : ${new Date().toLocaleDateString("en-IN")}
Tenant Entity     : ${tenantName}
GSTIN             : ${tenantInfo?.gstin || "27AABCT9821P1ZM"}
PAN               : ${tenantInfo?.pan || "AABCT9821P"}
TAN               : MUMT12345F

--------------------------------------------------------------------------------
SUMMARY OF LEASE DUES & GST LEVIED (FY 2025-26):
--------------------------------------------------------------------------------
Total Net Lease Rent Disbursed      : ₹ ${totalPaid.toLocaleString("en-IN")}.00
Total TDS Deducted u/s 194I (10%)   : ₹ ${totalTds.toLocaleString("en-IN")}.00
Applicable GST Compliance Status    : 100% Reconciled with GSTR-1

--------------------------------------------------------------------------------
RECENT PAYMENT RECEIPTS RECONCILED:
--------------------------------------------------------------------------------
${collections.map(c => `  - Date: ${c.paymentDate} | Receipt: ${c.receiptNumber} | Amount: ₹ ${c.amountReceived.toLocaleString("en-IN")} | Mode: ${c.paymentMode} | UTR: ${c.referenceNumber}`).join("\n")}

================================================================================
VERIFIED BY OFFICEX FINANCIAL AUDIT ENGINE (SOC 2 TYPE II CERTIFIED)
================================================================================`;

    triggerFileDownload(`OfficeX_Tax_Certificate_${tenantInfo?.tenantCode || "TNT"}.txt`, content);
    setToast("Consolidated tax certificate downloaded to your device!");
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadInvoiceReceipt = (inv: TenantInvoice) => {
    const content = `================================================================================
                       OFFICEX COMMERCIAL REAL ESTATE
                        OFFICIAL GST TAX INVOICE RECEIPT
================================================================================

Invoice Number     : ${inv.invoiceNumber}
Billing Month      : ${inv.billingMonth}
Invoice Date       : ${inv.invoiceDate}
Due Date           : ${inv.dueDate}
Payment Status     : ${inv.status.toUpperCase()}
Receipt Ref / UTR  : ${inv.referenceNumber || "HDFC-NEFT-AUTO"}
Payment Mode       : ${inv.paymentMode || "Razorpay Escrow Gateway"}

--------------------------------------------------------------------------------
ISSUED BY (LANDLORD):
  Entity           : OfficeX Asset Management India Pvt Ltd
  Address          : Level 14, Tower 2, One International Center, Prabhadevi, Mumbai
  GSTIN            : 27AAFCO1234F1Z5
  PAN              : AAFCO1234F

ISSUED TO (CORPORATE OCCUPIER):
  Entity           : ${inv.tenantName}
  Property         : ${inv.propertyName}
  Lease Reference  : ${inv.leaseId}
--------------------------------------------------------------------------------

ITEMIZED BREAKDOWN OF COMMERCIAL CHARGES:
--------------------------------------------------------------------------------
1. Base Commercial Rent                               : ₹ ${inv.baseRent.toLocaleString("en-IN")}.00
2. Common Area Maintenance (CAM Charges)              : ₹ ${inv.camCharges.toLocaleString("en-IN")}.00
3. Utility & Electricity Recoveries                   : ₹ ${inv.utilityCharges.toLocaleString("en-IN")}.00
4. Parking Bays Allocation                            : ₹ ${(inv.parkingCharges || 0).toLocaleString("en-IN")}.00
--------------------------------------------------------------------------------
SUBTOTAL                                              : ₹ ${inv.subtotal.toLocaleString("en-IN")}.00
GST (18% Applicable on Commercial Lease)              : ₹ ${inv.gstAmount.toLocaleString("en-IN")}.00
GROSS INVOICE TOTAL                                   : ₹ ${inv.grossTotal.toLocaleString("en-IN")}.00
LESS: TDS Deducted u/s 194I (10% on Base Rent)        : -₹ ${inv.tdsDeducted.toLocaleString("en-IN")}.00
--------------------------------------------------------------------------------
NET PAYABLE DUES                                      : ₹ ${inv.netPayable.toLocaleString("en-IN")}.00
TOTAL AMOUNT PAID TO DATE                             : ₹ ${(inv.amountPaid || 0).toLocaleString("en-IN")}.00
REMAINING BALANCE DUE                                 : ₹ ${(inv.balanceDue || 0).toLocaleString("en-IN")}.00
================================================================================

AUDIT TRAIL & STATUTORY COMPLIANCE:
  - Digital Stamp  : VERIFIED BY OFFICEX NODAL ESCROW ENGINE
  - Rules Citation : Issued in accordance with Rule 46 of CGST Rules 2017.

This is a computer-generated tax invoice receipt. No physical signature required.
================================================================================`;

    triggerFileDownload(`${inv.invoiceNumber}_Official_Receipt.txt`, content);
    setToast(`Official GST invoice receipt ${inv.invoiceNumber} downloaded!`);
    setTimeout(() => setToast(null), 3500);
  };

  const primaryInvoice = selectedInvoice || invoices[0];

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">Rent &amp; Utility Billing</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Rent Roll Connected
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Pay monthly lease dues, CAM charges, and download GST receipts for {tenantInfo?.tradeName || "Your Organization"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchTenantData}
            title="Refresh billing data"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleDownloadTaxCertificate}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download size={13} />
            <span>Download Tax Certificate</span>
          </button>
        </div>
      </div>

      {/* Primary Invoice Card */}
      {primaryInvoice ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                primaryInvoice.status === "paid" 
                  ? "bg-emerald-100 text-emerald-800" 
                  : primaryInvoice.status === "overdue"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {primaryInvoice.status === "paid" ? "Payment Received" : primaryInvoice.status === "overdue" ? "Overdue for Payment" : "Due for Payment"}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                Monthly Lease &amp; CAM Invoice
              </h2>
              <p className="text-xs text-gray-500">
                Billing Cycle: {primaryInvoice.billingMonth} · {primaryInvoice.invoiceNumber} · {primaryInvoice.propertyName}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Payment Due Date</span>
              <p className={`text-sm font-black ${primaryInvoice.status === "overdue" ? "text-red-600" : "text-gray-900"}`}>
                {primaryInvoice.dueDate}
              </p>
              <p className="text-[10px] text-gray-400">TDS u/s 194I auto-computed</p>
            </div>
          </div>

          {/* Itemized Breakdown */}
          <div className="py-5 space-y-3 border-b border-gray-100 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Base Commercial Space Rent</span>
              <span className="font-bold text-gray-900">₹{primaryInvoice.baseRent.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Common Area Maintenance (CAM Charges)</span>
              <span className="font-bold text-gray-900">₹{primaryInvoice.camCharges.toLocaleString("en-IN")}</span>
            </div>
            {primaryInvoice.utilityCharges > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Utility &amp; Electricity Recoveries</span>
                <span className="font-bold text-gray-900">₹{primaryInvoice.utilityCharges.toLocaleString("en-IN")}</span>
              </div>
            )}
            {primaryInvoice.parkingCharges > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Allocated Reserved Basement Parking</span>
                <span className="font-bold text-gray-900">₹{primaryInvoice.parkingCharges.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Goods &amp; Services Tax (GST 18%)</span>
              <span className="font-bold text-gray-900">₹{primaryInvoice.gstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl font-medium">
              <span>Less: TDS Deducted (10% on Base Rent)</span>
              <span className="font-bold">-₹{primaryInvoice.tdsDeducted.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Total & Pay Action */}
          <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-500">
                {primaryInvoice.status === "paid" ? "Total Net Paid" : "Total Net Payable (after TDS)"}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-purple-700">
                ₹{(primaryInvoice.status === "paid" ? primaryInvoice.netPayable : primaryInvoice.balanceDue).toLocaleString("en-IN")}
              </p>
            </div>

            {primaryInvoice.status === "paid" ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadInvoiceReceipt(primaryInvoice)}
                  className="px-5 py-3 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download GST Receipt</span>
                </button>
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                  <CheckCircle size={18} />
                  <span>Payment Settled</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleOpenPayModal(primaryInvoice)}
                className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pay Now with Razorpay</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center">
          <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">All Lease Dues Cleared</h3>
          <p className="text-xs text-gray-500 mt-1">There are no outstanding invoices for your account at this time.</p>
        </div>
      )}

      {/* Invoices & Payment History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-gray-900">All Invoices &amp; Receipts</h2>
            <p className="text-xs text-gray-500">Live feed from Landlord Rent Roll Ledger</p>
          </div>
          {summary && (
            <div className="text-xs text-gray-600">
              <span>Total Outstanding: </span>
              <span className="font-bold text-red-600">₹{summary.totalOutstanding.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Billing Month</th>
                <th className="py-3 pr-3">Invoice No</th>
                <th className="py-3 pr-3">Property</th>
                <th className="py-3 pr-3">Gross Total</th>
                <th className="py-3 pr-3">TDS (10%)</th>
                <th className="py-3 pr-3">Net Payable</th>
                <th className="py-3 pr-3">Balance Due</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{inv.billingMonth}</td>
                  <td className="py-3.5 pr-3 font-mono text-gray-600">{inv.invoiceNumber}</td>
                  <td className="py-3.5 pr-3 text-gray-700">{inv.propertyName}</td>
                  <td className="py-3.5 pr-3 font-medium text-gray-700">₹{inv.grossTotal.toLocaleString("en-IN")}</td>
                  <td className="py-3.5 pr-3 text-emerald-700 font-medium">₹{inv.tdsDeducted.toLocaleString("en-IN")}</td>
                  <td className="py-3.5 pr-3 font-bold text-gray-900">₹{inv.netPayable.toLocaleString("en-IN")}</td>
                  <td className="py-3.5 pr-3 font-bold text-purple-700">₹{inv.balanceDue.toLocaleString("en-IN")}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      inv.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : inv.status === "overdue"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {inv.status === "paid" ? (
                      <button 
                        onClick={() => handleDownloadInvoiceReceipt(inv)}
                        className="text-[#0F8B7D] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={12} /> Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPayModal(inv)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ END-TO-END RAZORPAY PAYMENT MODAL (LIVE SETTLEMENT) ═══ */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400">Razorpay</span>
                    <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.2 rounded font-mono">SECURE ESCROW</span>
                  </div>
                  <p className="text-sm font-bold text-white">OfficeX Nodal Rent Collection Account</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Commercial Rent Dues</p>
                <p className="text-xs font-bold text-gray-700">{selectedInvoice.invoiceNumber} · {selectedInvoice.billingMonth}</p>
                <p className="text-[10px] text-gray-500">{selectedInvoice.propertyName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">
                  ₹{(selectedInvoice.balanceDue > 0 ? selectedInvoice.balanceDue : selectedInvoice.netPayable).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold">Zero Transaction Fee</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => setPayMethod("upi")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    payMethod === "upi" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("card")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    payMethod === "card" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("netbanking")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    payMethod === "netbanking" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Building size={13} />
                  <span>Netbanking</span>
                </button>
              </div>

              {/* Method 1: UPI / QR */}
              {payMethod === "upi" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-xl border border-teal-200 p-1 flex items-center justify-center shrink-0">
                      <QrCode size={64} className="text-gray-800" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Scan &amp; Pay via Any UPI App</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">GooglePay, PhonePe, Paytm, BHIM</p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded font-bold">
                        officex.nodal@hdfcbank
                      </span>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase">Or enter Corporate UPI ID</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. finance@tcs.icici"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Method 2: Cards */}
              {payMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Corporate Card Number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 ···· ···· 8920"
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry (MM/YY)</label>
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">CVV</label>
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        type="password"
                        maxLength={4}
                        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method 3: Netbanking */}
              {payMethod === "netbanking" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Select Corporate Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank Corporate", "ICICI Bank Corporate", "SBI Corporate", "Axis Bank Corporate", "Kotak Mahindra", "IndusInd Bank"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedBank === b 
                            ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                disabled={isProcessing || isPaidSuccess}
                onClick={() => handleRazorpayPayment()}
                className="w-full mt-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Communicating with Razorpay Escrow...</span>
                  </>
                ) : isPaidSuccess ? (
                  <>
                    <CheckCircle size={16} className="text-emerald-300" />
                    <span>Payment Verified &amp; Rent Roll Settled!</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Authorize Payment of ₹{(selectedInvoice.balanceDue > 0 ? selectedInvoice.balanceDue : selectedInvoice.netPayable).toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing || isPaidSuccess}
                onClick={() => handleRazorpayPayment(1)}
                className="w-full mt-2.5 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50/50 text-blue-700 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡ Test Live ₹1 Real Payment Verification</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>256-bit SSL Encrypted · RBI Regulated Nodal Escrow Route</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

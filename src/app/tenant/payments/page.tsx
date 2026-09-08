"use client";

import React, { useState } from "react";
import { 
  CreditCard, Download, ShieldCheck, CheckCircle, X, 
  QrCode, Smartphone, Building, Lock, Check, Loader2, ArrowRight
} from "lucide-react";

export default function RentPaymentGateway() {
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

  const [invoice, setInvoice] = useState({
    id: "INV-2025-0089",
    month: "September 2025",
    dueDate: "05-Sep-2025",
    baseRent: "₹1,70,000",
    maintenance: "₹15,000",
    gst: "₹6,000",
    parking: "₹34,380",
    total: "₹2,25,380",
    status: "Unpaid"
  });

  const [paymentHistory, setPaymentHistory] = useState([
    { month: "August 2025", invoice: "INV-2025-0078", amount: "₹2,25,380", paid: "04-Aug-2025", mode: "Razorpay UPI", ref: "pay_Ox889123", status: "Completed" },
    { month: "July 2025", invoice: "INV-2025-0065", amount: "₹2,25,380", paid: "05-Jul-2025", mode: "Razorpay NetBanking", ref: "pay_Ox774102", status: "Completed" },
    { month: "June 2025", invoice: "INV-2025-0052", amount: "₹2,25,380", paid: "03-Jun-2025", mode: "Razorpay Corporate Card", ref: "pay_Ox662914", status: "Completed" },
    { month: "May 2025", invoice: "INV-2025-0041", amount: "₹2,25,380", paid: "04-May-2025", mode: "Razorpay UPI", ref: "pay_Ox551982", status: "Completed" },
    { month: "April 2025", invoice: "INV-2025-0030", amount: "₹2,25,380", paid: "05-Apr-2025", mode: "Razorpay NetBanking", ref: "pay_Ox440192", status: "Completed" }
  ]);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaidSuccess(true);
      const newRef = `pay_Ox${Math.floor(100000 + Math.random() * 900000)}`;
      
      setInvoice(prev => ({ ...prev, status: "Paid" }));
      setPaymentHistory(prev => [
        {
          month: invoice.month,
          invoice: invoice.id,
          amount: invoice.total,
          paid: "Today, Just now",
          mode: payMethod === "upi" ? "Razorpay UPI" : payMethod === "card" ? "Razorpay Card" : `Razorpay (${selectedBank})`,
          ref: newRef,
          status: "Completed"
        },
        ...prev
      ]);

      setTimeout(() => {
        setShowPayModal(false);
        setIsPaidSuccess(false);
        setToast(`Payment of ${invoice.total} successfully processed via Razorpay! Ref: ${newRef}`);
        setTimeout(() => setToast(null), 4500);
      }, 1500);
    }, 1800);
  };

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
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Rent &amp; Utility Billing</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pay monthly lease dues, CAM charges, and download GST receipts.</p>
        </div>
        <button 
          onClick={() => {
            setToast("Downloading consolidated tax statement (.pdf)...");
            setTimeout(() => setToast(null), 3000);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs self-start"
        >
          <Download size={13} />
          <span>Download Tax Certificate</span>
        </button>
      </div>

      {/* Current Invoice Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              invoice.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
            }`}>
              {invoice.status === "Paid" ? "Payment Received" : "Due for Payment"}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
              Monthly Lease &amp; CAM Invoice
            </h2>
            <p className="text-xs text-gray-500">Billing Cycle: {invoice.month} · {invoice.id}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Payment Due Date</span>
            <p className="text-sm font-black text-red-600">{invoice.dueDate}</p>
            <p className="text-[10px] text-gray-400">Late fee penalty applies after 5th</p>
          </div>
        </div>

        {/* Itemized Breakdown */}
        <div className="py-5 space-y-3 border-b border-gray-100 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Base Commercial Space Rent (4,500 sq.ft. @ ₹37.7/sqft)</span>
            <span className="font-bold text-gray-900">{invoice.baseRent}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Common Area Maintenance (CAM @ ₹3.3/sqft)</span>
            <span className="font-bold text-gray-900">{invoice.maintenance}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Allocated Reserved Basement Parking (4 Bays)</span>
            <span className="font-bold text-gray-900">{invoice.parking}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Goods &amp; Services Tax (GST 18% on CAM &amp; Parking)</span>
            <span className="font-bold text-gray-900">{invoice.gst}</span>
          </div>
        </div>

        {/* Total & Pay Action */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-500">Total Net Payable</span>
            <p className="text-2xl sm:text-3xl font-black text-purple-700">{invoice.total}</p>
          </div>

          {invoice.status === "Paid" ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
              <CheckCircle size={18} />
              <span>Paid on {invoice.month}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPayModal(true)}
              className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Pay Now with Razorpay</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-black text-gray-900 mb-4">Payment History &amp; Receipts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Month</th>
                <th className="py-3 pr-3">Invoice No</th>
                <th className="py-3 pr-3">Amount</th>
                <th className="py-3 pr-3">Paid Date</th>
                <th className="py-3 pr-3">Payment Channel</th>
                <th className="py-3 pr-3">Razorpay Ref</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p) => (
                <tr key={p.ref} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{p.month}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.invoice}</td>
                  <td className="py-3.5 pr-3 font-bold text-gray-900">{p.amount}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.paid}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.mode}</td>
                  <td className="py-3.5 pr-3 font-mono text-gray-500">{p.ref}</td>
                  <td className="py-3.5 pr-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button 
                      onClick={() => {
                        setToast(`Downloaded official GST receipt for ${p.invoice}`);
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="text-[#0F8B7D] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ END-TO-END RAZORPAY PAYMENT MODAL (P1 CRITICAL FIX) ═══ */}
      {showPayModal && (
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
                    <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.2 rounded font-mono">SECURE</span>
                  </div>
                  <p className="text-sm font-bold text-white">OfficeX Escrow Nodal Account</p>
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
                <p className="text-xs font-bold text-gray-700">{invoice.id} · {invoice.month}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">{invoice.total}</p>
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
                    <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase">Or enter UPI ID</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                </div>
              )}

              {/* Method 2: Cards */}
              {payMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Card Number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 ···· ···· 8920"
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry (MM/YY)</label>
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#0F8B7D]"
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
                        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method 3: Netbanking */}
              {payMethod === "netbanking" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Select Institutional Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank", "ICICI Bank", "SBI Bank", "Axis Bank", "Kotak Mahindra", "IndusInd Bank"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedBank === b 
                            ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D]" 
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
                onClick={handleSimulatePayment}
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
                    <span>Payment Verified &amp; Escrow Released!</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Authorize Payment of {invoice.total}</span>
                  </>
                )}
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

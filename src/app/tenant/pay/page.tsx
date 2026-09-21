"use client";
import React, { useState } from "react";
import { CreditCard, ShieldCheck, CheckCircle, Loader2 } from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

export default function TenantPayments() {
  const [billAmount] = useState("₹20,35,000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handlePayRent = async () => {
    setIsProcessing(true);
    try {
      await initiateRazorpayPayment({
        amount: 10000, // ₹100 flat for now
        receipt: `RENT-${Date.now()}`,
        description: "OfficeX — Rent Payment",
        notes: {
          type: "rent_payment",
          portal: "tenant_pay",
        },
        onSuccess: (response) => {
          setPaymentSuccess(response.razorpay_payment_id);
          setToast(`Payment verified! Razorpay ID: ${response.razorpay_payment_id}`);
          setTimeout(() => setToast(null), 8000);
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          setToast(`Payment failed: ${error?.description || error?.message || "Please try again"}`);
          setTimeout(() => setToast(null), 5000);
        },
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      setToast(`Error: ${error.message || "Could not initiate payment"}`);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 max-w-sm">
          <p className="text-xs font-bold text-slate-800">{toast}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pay Rent Portal</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Pay outstanding monthly rentals and check past transaction receipt records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-900">Outstanding Rental Dues</h3>
          <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block">Due Date: Sep 05, 2026</span>
              <span className="text-3xl font-extrabold text-purple-600 block mt-2">{billAmount}</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Test payment: ₹100 via Razorpay</span>
            </div>
            {paymentSuccess ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-100 border border-emerald-300">
                <CheckCircle size={16} className="text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-700 block">Payment Verified</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{paymentSuccess}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePayRent}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>Pay Now via Razorpay</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Razorpay Trust Badge */}
        <div className="premium-card p-5 border border-gray-200 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-600" />
            <span className="text-xs font-bold text-gray-900">Secure Payment</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            All payments are processed securely through Razorpay&apos;s PCI DSS Level 1 certified payment gateway. Your card details are never stored on our servers.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">UPI</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Cards</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Net Banking</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Wallets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  CheckCircle,
  CreditCard,
  Sparkles,
  Tag,
  Gift,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Receipt
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

interface RentRollPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export default function RentRollPaymentModal({
  isOpen,
  onClose,
  defaultEmail = "",
  defaultName = ""
}: RentRollPaymentModalProps) {
  const router = useRouter();

  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !email) {
      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const storedPhone = localStorage.getItem("officex_user_phone") || localStorage.getItem("officex_user_mobile") || "";
      if (storedEmail) setEmail(storedEmail);
      if (storedName) setName(storedName);
      if (storedPhone) setPhone(storedPhone);
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const is100PercentDiscount = appliedCoupon === "RENTROLL12";
  const finalPriceInRupees = is100PercentDiscount ? 0 : 100;
  const finalAmountInPaise = is100PercentDiscount ? 0 : 10000;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RENTROLL12") {
      setAppliedCoupon("RENTROLL12");
      setCouponSuccess("🎉 Coupon 'RENTROLL12' applied! 100% Free Access activated (₹0).");
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Try RENTROLL12 for promotional trial.");
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  const persistSub = async (targetEmail: string, coupon: string, paymentId: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      if (cleanEmail) {
        localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        document.cookie = `officex_sub_${encodeURIComponent(cleanEmail)}=active; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem("officex_user_email", cleanEmail);
        sessionStorage.setItem("officex_user_email", cleanEmail);
      }
      if (name.trim()) {
        localStorage.setItem("officex_user_name", name.trim());
        sessionStorage.setItem("officex_user_name", name.trim());
      }
      localStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_session_active", "1");
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
      localStorage.setItem("officex_payment_id", paymentId);
      localStorage.setItem("officex_order_id", `ORD_${paymentId}`);
    }

    try {
      if (cleanEmail) {
        await fetch("/api/subscription/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, coupon, paymentId })
        });
      }
    } catch {
      // Non-blocking
    }
  };

  const handleCheckout = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Free 100% Promo Code
    if (is100PercentDiscount) {
      await persistSub(cleanEmail, "RENTROLL12", `FREE_RENTROLL12_${Date.now()}`);
      setSuccessMsg("🎉 Subscription permanently unlocked! Taking you to the Rent Roll dashboard...");
      setTimeout(() => {
        onClose();
        router.push("/properties/rent-roll");
      }, 1200);
      return;
    }

    // Razorpay Checkout
    try {
      await initiateRazorpayPayment({
        amount: finalAmountInPaise,
        receipt: `SUB_${Date.now()}`,
        description: "OfficeX Rent Roll & CAM Billing License",
        prefillName: name.trim() || "Commercial Landlord",
        prefillEmail: cleanEmail,
        prefillPhone: phone.trim(),
        notes: {
          portal: "Rent Roll & Revenue Management",
          user_email: cleanEmail,
          type: "subscription",
          coupon: appliedCoupon || "none",
        },
        onSuccess: async (response) => {
          await persistSub(cleanEmail, appliedCoupon || "none", response.razorpay_payment_id);
          setSuccessMsg("Payment successful! Unlocking your Rent Roll dashboard...");
          setTimeout(() => {
            onClose();
            router.push("/properties/rent-roll");
          }, 1200);
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          setErrorMsg(err?.description || err?.message || "Payment cancelled or failed. Please retry.");
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Could not launch Razorpay gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0D7B6C] via-teal-400 to-[#0F172A]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX"
              width={34}
              height={34}
              className="object-contain"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0D7B6C]">
                <Building2 size={13} />
                <span>Rent Roll &amp; CAM Billing Suite</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Subscription &amp; Payment Gateway
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-4.5">
          {/* Notification Banners */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pricing Banner */}
          <div className="bg-gradient-to-r from-teal-50/90 to-emerald-50/90 rounded-2xl p-4 border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0D7B6C] block">
                COMMERCIAL LANDLORD LICENSE
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                {is100PercentDiscount ? (
                  <>
                    <span className="text-sm font-bold text-slate-400 line-through">₹100</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0D7B6C] font-mono">₹0 FREE</span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase ml-1">
                      100% OFF
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">₹100</span>
                    <span className="text-xs text-slate-500 font-semibold">/ month</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                <ShieldCheck size={13} className="text-emerald-600" />
                RBI Escrow Ready
              </span>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#0D7B6C] shrink-0" />
              <span>Automated Escalation Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#0D7B6C] shrink-0" />
              <span>CAM Sq.Ft. Expense Pooling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#0D7B6C] shrink-0" />
              <span>Section 106 Statutory Notices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#0D7B6C] shrink-0" />
              <span>SEBI REIT Demising Stacking</span>
            </div>
          </div>

          {/* User Details Form */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="landlord@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name / Organization
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Commercial Holdings"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Tag size={12} className="text-[#0D7B6C]" />
                Apply Promotional Coupon:
              </span>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {appliedCoupon}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Gift size={13} /> 100% Free Lifetime Access
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Remove coupon"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="Code (e.g. RENTROLL12)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]/20"
                />
                <button
                  type="submit"
                  disabled={!couponInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-black transition-all disabled:opacity-50 cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-[10px] font-semibold text-rose-600 mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] font-semibold text-emerald-600 mt-1">{couponSuccess}</p>}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                is100PercentDiscount
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                  : "bg-[#0D7B6C] hover:bg-[#0A6357]"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connecting Payment Gateway...</span>
                </>
              ) : is100PercentDiscount ? (
                <>
                  <Sparkles size={16} className="text-yellow-300" />
                  <span>Activate Free License &amp; Open Dashboard</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Pay ₹{finalPriceInRupees} via Razorpay &amp; Unlock Dashboard</span>
                </>
              )}
            </button>
          </div>

          {/* Already Subscribed Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Already have an active paid subscription? </span>
            <Link
              href="/login?context=rent-roll&redirect=/properties/rent-roll"
              onClick={onClose}
              className="font-bold text-[#0D7B6C] hover:underline"
            >
              Sign In to your account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

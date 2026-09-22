"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle, ArrowRight, Sparkles, LogOut, CreditCard, Loader2, Tag, X } from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallbackLandingPage?: string;
  portalName?: string;
}

export default function SubscriptionGate({
  children,
  fallbackLandingPage = "/manage",
  portalName = "Operational Workspace"
}: SubscriptionGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const isDiscounted = appliedCoupon === "RENTROLL12";
  const finalPriceInRupees = isDiscounted ? 1 : 100;
  const finalAmountInPaise = isDiscounted ? 100 : 10000;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RENTROLL12") {
      setAppliedCoupon("RENTROLL12");
      setCouponSuccess("Coupon 'RENTROLL12' applied! 99% discount active — you pay only ₹1.");
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Try RENTROLL12 for 99% off.");
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("officex_user_email");
      const name = localStorage.getItem("officex_user_name") || "Member";
      const role = localStorage.getItem("officex_user_role") || "Property Owner";
      const sub = localStorage.getItem("officex_subscription");

      setUserEmail(email || "");
      setUserName(name);
      setUserRole(role);

      if (!email) {
        setIsLoggedIn(false);
        setIsSubscribed(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsLoggedIn(true);
        if (sub === "active") {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      }
      setIsChecking(false);
    }
  }, [pathname, router]);

  const handleRazorpaySubscription = async () => {
    setIsPaymentProcessing(true);
    try {
      await initiateRazorpayPayment({
        amount: Math.round(finalAmountInPaise),
        receipt: `SUB_${Date.now()}`,
        description: `OfficeX Platform Subscription - ${portalName}${isDiscounted ? " (RENTROLL12 99% OFF)" : ""}`,
        prefillName: userName || "Member",
        prefillEmail: userEmail || "",
        notes: {
          portal: portalName,
          user_email: userEmail || "",
          type: "subscription",
          coupon: appliedCoupon || "none",
          discount: isDiscounted ? "99%" : "0%",
        },
        onSuccess: (response) => {
          // Payment verified — activate subscription
          localStorage.setItem("officex_subscription", "active");
          localStorage.setItem("officex_payment_id", response.razorpay_payment_id);
          localStorage.setItem("officex_order_id", response.razorpay_order_id);
          document.cookie = "officex_subscription=active; path=/; max-age=2592000";
          setIsSubscribed(true);
          setPaymentToast(`Subscription activated! Payment ID: ${response.razorpay_payment_id}`);
          setTimeout(() => setPaymentToast(null), 6000);
        },
        onFailure: (error) => {
          console.error("Subscription payment failed:", error);
          setPaymentToast(`Payment failed: ${error?.description || error?.message || "Please try again"}`);
          setTimeout(() => setPaymentToast(null), 5000);
        },
      });
    } catch (error: any) {
      console.error("Subscription payment error:", error);
      setPaymentToast(`Error: ${error.message || "Could not initiate payment"}`);
      setTimeout(() => setPaymentToast(null), 5000);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_name");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_subscription");
      localStorage.removeItem("officex_dashboard");
      localStorage.removeItem("officex_active_portal");
      localStorage.removeItem("officex_payment_id");
      localStorage.removeItem("officex_order_id");
      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_subscription=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      router.push("/login");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Verifying workspace permissions &amp; subscription...</p>
        </div>
      </div>
    );
  }

  // Paywall Modal if logged in but not subscribed
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Payment Toast */}
        {paymentToast && (
          <div className="fixed top-6 right-6 z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 max-w-sm animate-in slide-in-from-right">
            <p className="text-xs font-bold text-slate-800">{paymentToast}</p>
          </div>
        )}

        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F8B7D] via-teal-400 to-[#071324]" />

          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Image src="/logo-removebg-preview.png" alt="OfficeX" width={34} height={34} className="object-contain" />
              <div>
                <h2 className="text-sm font-black text-slate-900">OfficeX {portalName}</h2>
                <p className="text-[11px] text-slate-500 font-semibold">Institutional Commercial Operating Suite</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Step 1 Indicator: Prominent User Signed In Status */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0F8B7D] to-teal-500 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-xs">{userName}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <CheckCircle size={11} className="text-emerald-700" />
                    Signed In
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-sm mt-0.5">{userEmail || "Google Verified Account"}</p>
              </div>
            </div>
            <div className="self-start sm:self-center shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                Step 1 of 2 Complete
              </span>
            </div>
          </div>

          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mb-3 shadow-xs">
              <Lock size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              STEP 2 OF 2: SUBSCRIPTION REQUIRED
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 tracking-tight">
              Activate Subscription to Enter Live Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium max-w-md mx-auto leading-relaxed">
              Your Google account is signed in and verified. To unlock the live Rent Roll, statutory compliance, and facility management tools, complete your ₹100 monthly subscription.
            </p>
          </div>

          {/* Value props */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Included in Your Operational Plan:
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>Full access to live property registry, rent rolls &amp; CAM billing</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>52-week preventive maintenance dispatch &amp; QR asset passports</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle size={15} className="text-[#0F8B7D] shrink-0" />
              <span>Razorpay nodal escrow milestone protection for all work orders</span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Tag size={13} className="text-[#0F8B7D]" />
                Have a coupon or promo code?
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
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {appliedCoupon}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    99% OFF Applied (-₹99)
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
                  placeholder="Enter code (e.g. RENTROLL12)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] uppercase"
                />
                <button
                  type="submit"
                  disabled={!couponInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1.5">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="text-[11px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
                <CheckCircle size={12} /> {couponSuccess}
              </p>
            )}
          </div>

          {/* Pricing Banner */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200 mb-6 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-1">
              {isDiscounted ? "PROMOTIONAL RATE APPLIED" : "SUBSCRIPTION FEE"}
            </div>
            <div className="flex items-center justify-center gap-3">
              {isDiscounted ? (
                <>
                  <span className="text-xl font-bold text-slate-400 line-through">₹100</span>
                  <span className="text-4xl font-black text-[#0F8B7D]">₹1</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    99% OFF
                  </span>
                </>
              ) : (
                <div className="text-3xl font-black text-[#0F8B7D]">
                  ₹100<span className="text-sm font-bold text-slate-500">/mo</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">
              {isDiscounted
                ? "Special promo applied (RENTROLL12) • Secure payment via Razorpay"
                : "Secure payment via Razorpay • Instant activation"}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRazorpaySubscription}
              disabled={isPaymentProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Pay ₹{finalPriceInRupees} &amp; Activate Subscription Now</span>
                </>
              )}
            </button>

            <Link
              href="/pricing"
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs text-center transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore All Pricing Plans &amp; Tiers</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href={fallbackLandingPage}
              className="text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1 transition-colors"
            >
              ← Return to your {userRole || "Persona"} Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render children normally if logged in AND subscribed
  return <>{children}</>;
}

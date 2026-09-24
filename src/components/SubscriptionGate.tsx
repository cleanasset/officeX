"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle, ArrowRight, Sparkles, LogOut, CreditCard, Loader2, Tag, X, Gift } from "lucide-react";
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

  // 100% Free promo code
  const is100PercentDiscount = appliedCoupon === "RENTROLL12";
  const finalPriceInRupees = is100PercentDiscount ? 0 : 100;
  const finalAmountInPaise = is100PercentDiscount ? 0 : 10000;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RENTROLL12") {
      setAppliedCoupon("RENTROLL12");
      setCouponSuccess("🎉 Coupon 'RENTROLL12' applied! 100% FREE Access activated (₹0).");
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Try RENTROLL12 for 100% FREE access.");
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Helper to permanently persist subscription across all storage layers
  const persistSubscription = async (email: string, coupon: string = "none", paymentId: string = "FREE_RENTROLL12") => {
    const cleanEmail = email.toLowerCase().trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      if (cleanEmail) {
        localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        document.cookie = `officex_sub_${encodeURIComponent(cleanEmail)}=active; path=/; max-age=31536000; SameSite=Lax`;
      }
      document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
      localStorage.setItem("officex_payment_id", paymentId);
      localStorage.setItem("officex_order_id", `ORD_${paymentId}`);
    }

    // Call server to persist in database/memory cache
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

  useEffect(() => {
    const checkSubscriptionState = async () => {
      if (typeof window === "undefined") return;

      const email = (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "").toLowerCase().trim();
      const name = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "Member";
      const role = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "Property Owner";
      
      setUserEmail(email);
      setUserName(name);
      setUserRole(role);

      if (!email) {
        setIsLoggedIn(false);
        setIsSubscribed(false);
        setIsChecking(false);
        return;
      }

      setIsLoggedIn(true);

      // Check strictly email-specific subscription — DO NOT allow un-scoped global active flags to bypass
      const subEmailLocal = localStorage.getItem(`officex_sub_${email}`) === "active" ||
        sessionStorage.getItem(`officex_sub_${email}`) === "active" ||
        document.cookie.includes(`officex_sub_${encodeURIComponent(email)}=active`);

      if (subEmailLocal) {
        setIsSubscribed(true);
        setIsChecking(false);
        return;
      }

      // Query server-side subscription database for this email
      try {
        const res = await fetch(`/api/subscription/status?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.subscribed) {
            persistSubscription(email, "verified_server", "SERVER_SAVED");
            setIsSubscribed(true);
            setIsChecking(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      setIsSubscribed(false);
      setIsChecking(false);
    };

    checkSubscriptionState();
  }, [pathname, router]);

  // Handle 100% Free Instant Claim or Paid Razorpay Subscription
  const handleActivateSubscription = async () => {
    setIsPaymentProcessing(true);
    const email = (userEmail || (typeof window !== "undefined" ? localStorage.getItem("officex_user_email") : "") || "").trim().toLowerCase();

    if (!email) {
      setPaymentToast("Please provide your work email above to activate subscription.");
      setTimeout(() => setPaymentToast(null), 4000);
      setIsPaymentProcessing(false);
      return;
    }

    // If 100% Discounted (RENTROLL12) — Instant One-Click Free Activation
    if (is100PercentDiscount) {
      await persistSubscription(email, "RENTROLL12", `FREE_RENTROLL12_${Date.now()}`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_user_email", email);
        localStorage.setItem("officex_user_email", email);
        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      }
      setIsLoggedIn(true);
      setIsSubscribed(true);
      setIsPaymentProcessing(false);
      setPaymentToast("🎉 100% Free Subscription Activated! Welcome to OfficeX Live Dashboard.");
      setTimeout(() => setPaymentToast(null), 6000);
      return;
    }

    // Standard ₹100 / paid subscription via Razorpay
    try {
      await initiateRazorpayPayment({
        amount: Math.round(finalAmountInPaise),
        receipt: `SUB_${Date.now()}`,
        description: `OfficeX Platform Subscription - ${portalName}`,
        prefillName: userName || "Member",
        prefillEmail: email,
        notes: {
          portal: portalName,
          user_email: email,
          type: "subscription",
          coupon: appliedCoupon || "none",
          discount: "0%",
        },
        onSuccess: async (response) => {
          await persistSubscription(email, appliedCoupon || "none", response.razorpay_payment_id);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("officex_session_active", "1");
            localStorage.setItem("officex_session_active", "1");
            sessionStorage.setItem("officex_user_email", email);
            localStorage.setItem("officex_user_email", email);
            document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
            document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
          }
          setIsLoggedIn(true);
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
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href={`/login?context=rent-roll&redirect=${encodeURIComponent(pathname)}`}
                className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Existing Subscriber Sign In →</span>
              </Link>
            )}
          </div>

          {/* Step 1 Indicator: Prominent User Signed In Status or Email Capture */}
          {isLoggedIn ? (
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
          ) : (
            <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 my-5 shadow-xs">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">
                    Commercial Landlord Subscription
                  </span>
                  <Link
                    href={`/login?context=rent-roll&redirect=${encodeURIComponent(pathname)}`}
                    className="text-xs font-bold text-[#0F8B7D] hover:underline"
                  >
                    Already Subscribed? Sign In
                  </Link>
                </div>
                <label className="text-xs font-bold text-slate-700">Enter your work email to activate access:</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. landlord@commercial.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mb-3 shadow-xs">
              <Lock size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {isLoggedIn ? "STEP 2 OF 2: SUBSCRIPTION REQUIRED" : "SUBSCRIPTION REQUIRED TO ACCESS RENT ROLL"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 tracking-tight">
              Activate Subscription to Enter Live Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium max-w-md mx-auto leading-relaxed">
              {isLoggedIn
                ? "Your account is verified. To unlock the live Rent Roll, statutory compliance, and facility management tools, activate your monthly subscription."
                : "The Rent Roll module is a dedicated commercial SaaS tool. Activate your subscription below to unlock the full live dashboard."}
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
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Gift size={13} /> 100% FREE Access (₹0 Forever)
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
              {is100PercentDiscount ? "PROMOTIONAL 100% FREE ACCESS" : "SUBSCRIPTION FEE"}
            </div>
            <div className="flex items-center justify-center gap-3">
              {is100PercentDiscount ? (
                <>
                  <span className="text-xl font-bold text-slate-400 line-through">₹100</span>
                  <span className="text-4xl font-black text-[#0F8B7D]">₹0 FREE</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    100% OFF
                  </span>
                </>
              ) : (
                <div className="text-3xl font-black text-[#0F8B7D]">
                  ₹100<span className="text-sm font-bold text-slate-500">/mo</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">
              {is100PercentDiscount
                ? "Promo active: RENTROLL12 • 1-click instant lifetime dashboard unlock"
                : "Secure payment via Razorpay • Instant activation"}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleActivateSubscription}
              disabled={isPaymentProcessing}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                is100PercentDiscount
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                  : "bg-[#0F8B7D] hover:bg-[#0D7A6E]"
              }`}
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Activating Workspace...</span>
                </>
              ) : is100PercentDiscount ? (
                <>
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>✨ Claim 100% Free Access &amp; Unlock Dashboard Now</span>
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

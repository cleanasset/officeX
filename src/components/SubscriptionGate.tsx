"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle, CheckCircle2, ArrowRight, Sparkles, LogOut, CreditCard, Loader2, Tag, X, Gift, Building2, User } from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";
import { supabase } from "@/lib/supabase";

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
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  // Coupon state (Pre-applied with RENTROLL12 for 100% Free access)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>("RENTROLL12");
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
    const effectiveName = (userName || ownerName || "Commercial Landlord").trim();
    const effectiveBuilding = (typeof window !== "undefined" ? localStorage.getItem("officex_property_name") : "") || `${effectiveName}'s Commercial Portfolio`;
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (!email) {
      setPaymentToast("Please provide your work email above to activate subscription.");
      setTimeout(() => setPaymentToast(null), 4000);
      setIsPaymentProcessing(false);
      return;
    }

    if (!isLoggedIn && (!cleanPhone || phoneDigits.length < 10)) {
      setPaymentToast("Mobile number is mandatory. Please enter a valid 10-digit number.");
      setTimeout(() => setPaymentToast(null), 4000);
      setIsPaymentProcessing(false);
      return;
    }

    // Persist onboarding details
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_name", effectiveName);
      sessionStorage.setItem("officex_user_name", effectiveName);
      localStorage.setItem("officex_property_name", effectiveBuilding);
      sessionStorage.setItem("officex_property_name", effectiveBuilding);
      if (cleanPhone) {
        localStorage.setItem("officex_user_phone", cleanPhone);
        localStorage.setItem("officex_user_mobile", cleanPhone);
      }
      localStorage.setItem("officex_onboarding_completed", "1");
    }

    try {
      fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveBuilding,
          type: "Commercial Office",
          city: "Mumbai",
          state: "Maharashtra",
          totalArea: 25000
        })
      }).catch(() => {});
    } catch {}

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
            <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 my-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F8B7D]">
                  New Landlord Onboarding &amp; Subscription
                </span>
                <Link
                  href={`/login?context=rent-roll&redirect=${encodeURIComponent(pathname)}`}
                  className="text-xs font-bold text-[#0F8B7D] hover:underline"
                >
                  Already Subscribed? Sign In
                </Link>
              </div>

              {/* Google 1-Click Button with Payment Gateway Verification */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const redirectUrl = typeof window !== "undefined"
                      ? `${window.location.origin}/login?context=rent-roll&redirect=${encodeURIComponent(pathname)}`
                      : "http://localhost:3000/login";

                    if (is100PercentDiscount) {
                      await persistSubscription(userEmail || "google-subscriber@officex.in", "RENTROLL12", `FREE_RENTROLL12_${Date.now()}`);
                      setPaymentToast("🎉 100% Free Lifetime Offer Activated! Redirecting to Google...");
                      setTimeout(async () => {
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: { redirectTo: redirectUrl }
                        });
                      }, 700);
                      return;
                    }

                    // Otherwise launch payment gateway first!
                    await initiateRazorpayPayment({
                      amount: finalAmountInPaise,
                      receipt: `GOOGLE_GATE_${Date.now()}`,
                      description: `Rent Roll Subscription - Commercial Portfolio`,
                      prefillName: ownerName || "Commercial Landlord",
                      prefillEmail: userEmail,
                      notes: { portal: portalName, auth_provider: "google" },
                      onSuccess: async (response) => {
                        await persistSubscription(userEmail || "google-subscriber@officex.in", "none", response.razorpay_payment_id);
                        setPaymentToast("Payment verified! Redirecting to Google to complete sign-in...");
                        setTimeout(async () => {
                          await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: { redirectTo: redirectUrl }
                          });
                        }, 700);
                      },
                      onFailure: (err) => {
                        setPaymentToast(err?.description || "Payment cancelled. Please complete payment to unlock Rent Roll via Google.");
                      }
                    });
                  } catch (e: any) {
                    console.error("Google auth error:", e);
                    setPaymentToast(e.message || "Could not launch payment gateway.");
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {is100PercentDiscount
                    ? "Continue with Google (100% Free · ₹0)"
                    : "Continue with Google (Pay ₹100 & Unlock)"}
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Full Name (Owner / Manager) *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. landlord@commercial.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] outline-none"
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

          {/* ──── LIMITED TIME PROMOTIONAL OFFER (100% OFF) ──── */}
          <div className="mb-5 relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-teal-50/70 p-4 shadow-xs">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <Sparkles size={11} />
                  Limited Time Offer
                </span>
                <span className="text-[11px] font-bold text-amber-900">
                  100% Off Promotional Access
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/80">
                Save ₹100/mo
              </span>
            </div>

            {/* Ticket Showcase Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-amber-200 shadow-2xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
                  <Gift size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm sm:text-base font-black tracking-widest text-[#0F8B7D] px-2.5 py-0.5 rounded-lg bg-amber-50 border-2 border-dashed border-amber-300">
                      RENTROLL12
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Use code <strong className="text-slate-900 font-bold">RENTROLL12</strong> for 100% free lifetime access to Rent Roll &amp; CAM billing.
                  </p>
                </div>
              </div>

              {/* 1-Click Apply Button or Applied Status */}
              <div className="shrink-0 self-end sm:self-center">
                {appliedCoupon === "RENTROLL12" ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 size={13} />
                      <span>Applied (₹0)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon("RENTROLL12");
                      setCouponSuccess("🎉 Code RENTROLL12 applied! 100% Free Access Activated (₹0).");
                      setCouponError(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={13} />
                    <span>Apply 100% Off</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subtext info */}
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              {appliedCoupon === "RENTROLL12" ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Free Lifetime Subscription Active · ₹0 charged
                </span>
              ) : (
                <span className="text-amber-800/80 text-[10px] font-medium">
                  ⚡ Instant unlock: No credit card required with code RENTROLL12.
                </span>
              )}
            </div>
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

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle, CheckCircle2, ArrowRight, Sparkles, LogOut, CreditCard, Loader2, Tag, X, Gift, Building2, User, Check, Receipt, Zap, ClipboardList, Layers, ChevronRight } from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";
import { supabase } from "@/lib/supabase";
import { isAuthenticated, getCookie } from "@/lib/auth-client";
import { CountryPhoneInput } from "@/components/ui/CountryPhoneInput";

export interface SubscriptionPlanTier {
  id: "starter" | "techpark" | "reit-mega";
  name: string;
  badge: string;
  popular?: boolean;
  price: number; // in INR/month (50, 100, 200)
  period: string;
  scope: string;
  target: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_PLAN_OPTIONS: SubscriptionPlanTier[] = [
  {
    id: "starter",
    name: "Commercial Starter",
    badge: "50k Sq.Ft Cap",
    popular: false,
    price: 50,
    period: "/mo",
    scope: "Up to 50,000 sq.ft",
    target: "Standalone Commercial Tower",
    description: "Essential contract registers & step escalations for single towers.",
    features: [
      "39-Point canonical lease contract master & live register",
      "Automated step escalations with 90-day anniversary alerts",
      "Bulk Excel/CSV data importer with auto-column mapper",
      "Audit-ready exports (WALE, rollover & board MIS sheets)",
    ],
  },
  {
    id: "techpark",
    name: "Tech Park Campus",
    badge: "Most Popular",
    popular: true,
    price: 100,
    period: "/mo",
    scope: "Up to 2,50,000 sq.ft",
    target: "Multi-Tower Tech Parks & Campuses",
    description: "Complete lease-to-cash billing, CAM expense pooling & statutory compliance.",
    features: [
      "Full Lease-to-Cash billing centre with monthly batch runs",
      "Automated CAM pooling & utility sub-meter ingestion",
      "Statutory 18% GST (SAC 997212) & Section 194I TDS ledgers",
      "Occupant self-service portal & legal default notices (§106)",
    ],
  },
  {
    id: "reit-mega",
    name: "REIT Mega-Portfolio",
    badge: "Enterprise Scale",
    popular: false,
    price: 200,
    period: "/mo",
    scope: "Up to 50,00,00,000 sq.ft",
    target: "Institutional Funds & REITs",
    description: "Mega-portfolio governance with maker-checker approvals and REST APIs.",
    features: [
      "Up to 50,00,00,000 Sq.Ft licensed capacity allocation",
      "14-Day commercial grace period (zero hard lockouts)",
      "Maker-checker approvals & custom institutional RBAC",
      "REST APIs & webhooks with enterprise SSO (SAML 2.0)",
    ],
  },
];

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

  // User Operational Role Decision state (§S-01, §2.1 & §5.14)
  const [isRoleDecided, setIsRoleDecided] = useState<boolean>(true);
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>("owner");

  // Selected Pricing Plan state (default: "techpark" ₹100, user can pick "starter" ₹50 or "reit-mega" ₹200)
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "techpark" | "reit-mega">("techpark");
  const [customSqft, setCustomSqft] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = Number(localStorage.getItem("officex_subscribed_sqft"));
      if (stored && stored > 0) return stored;
    }
    return 50000;
  });

  // Coupon state (Initially null; user must click apply to activate 100% Free access)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Active Plan & Dynamic Pricing Calculations
  const selectedPlan = SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLAN_OPTIONS[1];
  const is100PercentDiscount = appliedCoupon === "RENTROLL12" || appliedCoupon === "OFFICEX100" || appliedCoupon === "FREE100";
  const finalPriceInRupees = is100PercentDiscount ? 0 : customSqft * selectedPlan.price;
  const finalAmountInPaise = is100PercentDiscount ? 0 : customSqft * selectedPlan.price * 100;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RENTROLL12" || clean === "OFFICEX100" || clean === "FREE100") {
      setAppliedCoupon(clean);
      setCouponSuccess(`🎉 Coupon '${clean}' applied! 100% FREE Access activated for ${selectedPlan.name} (₹0).`);
      setCouponError(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_applied_coupon", clean);
        sessionStorage.setItem("officex_applied_coupon", clean);
        localStorage.setItem("officex_subscription", "active");
        sessionStorage.setItem("officex_subscription", "active");
        localStorage.setItem("officex_subscribed_sqft", String(customSqft));
        document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
      }
    } else {
      setCouponError("Invalid coupon code. Try OFFICEX100, RENTROLL12 or FREE100 for 100% FREE access.");
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
  const persistSubscription = async (
    email: string,
    coupon: string = "none",
    paymentId: string = "FREE_OFFICEX100",
    planId: string = selectedPlan.id
  ) => {
    const cleanEmail = email.toLowerCase().trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      localStorage.setItem("officex_subscription_plan", planId);
      sessionStorage.setItem("officex_subscription_plan", planId);
      localStorage.setItem("officex_selected_plan", planId);
      if (cleanEmail) {
        localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        document.cookie = `officex_sub_${encodeURIComponent(cleanEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
      }
      document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
      localStorage.setItem("officex_payment_id", paymentId);
      localStorage.setItem("officex_order_id", `ORD_${paymentId}`);
    }

    // Call server to persist in database/memory cache
    try {
      if (cleanEmail) {
        await fetch("/api/subscription/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, coupon, paymentId, plan: planId })
        });
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    const checkSubscriptionState = async () => {
      if (typeof window !== "undefined") {
        // Read URL param or stored preference for selected plan
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const urlPlan = urlParams.get("plan")?.toLowerCase();
          const storedPlan = localStorage.getItem("officex_selected_plan")?.toLowerCase();
          const target = urlPlan || storedPlan;
          if (target === "starter" || target === "50") {
            setSelectedPlanId("starter");
          } else if (target === "reit-mega" || target === "reit" || target === "enterprise" || target === "200") {
            setSelectedPlanId("reit-mega");
          } else if (target === "techpark" || target === "100") {
            setSelectedPlanId("techpark");
          }
        } catch {
          // Non-blocking
        }
      }

      let email = (getCookie("officex_user_email") || localStorage.getItem("officex_user_email") || "").toLowerCase().trim();
      let name = localStorage.getItem("officex_user_name") || getCookie("officex_user_name") || "Member";
      let role = getCookie("officex_user_role") || localStorage.getItem("officex_user_role") || "Property Owner";

      // Also check active Supabase Auth session directly
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          email = session.user.email.toLowerCase().trim();
          name = session.user.user_metadata?.full_name || session.user.email.split("@")[0] || name;
          localStorage.setItem("officex_user_email", email);
          localStorage.setItem("officex_user_name", name);
          document.cookie = `officex_user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
        }
      } catch {
        // Non-blocking
      }

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

      const hasDecidedRole = Boolean(
        role ||
        (typeof window !== "undefined" && (localStorage.getItem("officex_user_role") || localStorage.getItem("officex_rentroll_onboarded")))
      );

      // Check active subscription (strictly subscription-based; being logged in alone is NOT enough)
      const subGlobal = getCookie("officex_subscription") === "active" ||
        localStorage.getItem("officex_subscription") === "active";

      const subEmailLocal = localStorage.getItem(`officex_sub_${email}`) === "active" ||
        getCookie(`officex_sub_${encodeURIComponent(email)}`) === "active";

      const storedCoupon =
        localStorage.getItem("officex_applied_coupon") ||
        sessionStorage.getItem("officex_applied_coupon");
      if (storedCoupon) {
        setAppliedCoupon(storedCoupon);
      }

      if (subEmailLocal || subGlobal || storedCoupon) {
        setIsSubscribed(true);
        setIsRoleDecided(hasDecidedRole);
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
            setIsRoleDecided(hasDecidedRole);
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
    const effectiveName = (userName || ownerName || "Account Holder").trim();
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
      if (cleanPhone) {
        localStorage.setItem("officex_user_phone", cleanPhone);
        localStorage.setItem("officex_user_mobile", cleanPhone);
      }
      localStorage.setItem("officex_user_properties", "[]");
      localStorage.setItem("officex_active_leases", "[]");
    }

    // If 100% Discounted (RENTROLL12 / OFFICEX100) — Instant One-Click Free Activation
    if (is100PercentDiscount) {
      await persistSubscription(email, appliedCoupon || "RENTROLL12", `FREE_${appliedCoupon || "RENTROLL12"}_${Date.now()}`, selectedPlan.id);
      let isOnboarded = false;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_user_email", email);
        localStorage.setItem("officex_user_email", email);
        localStorage.setItem("officex_subscribed_sqft", String(customSqft));
        sessionStorage.setItem("officex_subscribed_sqft", String(customSqft));
        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
        isOnboarded = localStorage.getItem("officex_rentroll_onboarded") === "true";
      }
      setIsLoggedIn(true);
      setIsSubscribed(true);
      setIsPaymentProcessing(false);
      setPaymentToast(`🎉 100% Free Access to ${selectedPlan.name} Activated! Routing to workspace...`);
      setTimeout(() => {
        router.push(isOnboarded ? "/properties/rent-roll" : "/onboarding");
      }, 400);
      return;
    }

    // Dynamic paid subscription via Razorpay based on selected plan
    try {
      await initiateRazorpayPayment({
        amount: Math.round(finalAmountInPaise),
        receipt: `SUB_${selectedPlan.id.toUpperCase()}_${Date.now()}`,
        description: `OfficeX ${selectedPlan.name} Subscription - ${portalName}`,
        prefillName: userName || "Member",
        prefillEmail: email,
        notes: {
          portal: portalName,
          user_email: email,
          type: "subscription",
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          plan_price: `INR ${selectedPlan.price}`,
          coupon: appliedCoupon || "none",
          discount: "0%",
        },
        onSuccess: async (response) => {
          await persistSubscription(email, appliedCoupon || "none", response.razorpay_payment_id, selectedPlan.id);
          let isOnboarded = false;
          if (typeof window !== "undefined") {
            sessionStorage.setItem("officex_session_active", "1");
            localStorage.setItem("officex_session_active", "1");
            sessionStorage.setItem("officex_user_email", email);
            localStorage.setItem("officex_user_email", email);
            localStorage.setItem("officex_subscribed_sqft", String(customSqft));
            sessionStorage.setItem("officex_subscribed_sqft", String(customSqft));
            document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
            document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
            isOnboarded = localStorage.getItem("officex_rentroll_onboarded") === "true";
          }
          setIsLoggedIn(true);
          setIsSubscribed(true);
          setPaymentToast(`Subscription to ${selectedPlan.name} activated! Routing to workspace...`);
          setTimeout(() => {
            router.push(isOnboarded ? "/properties/rent-roll" : "/onboarding");
          }, 400);
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

        <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
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
                  New Account Setup & Subscription
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
                    if (typeof window !== "undefined") {
                      localStorage.setItem("officex_oauth_context", "rent-roll");
                      sessionStorage.setItem("officex_oauth_context", "rent-roll");
                      localStorage.setItem("officex_oauth_role", "owner");
                      localStorage.setItem("officex_oauth_redirect", "/properties/rent-roll");
                    }
                    const redirectUrl = typeof window !== "undefined"
                      ? `${window.location.origin}/signup?context=rent-roll&role=owner&module=rent-roll&redirect=${encodeURIComponent(pathname || "/properties/rent-roll")}`
                      : "https://www.officex.pro/signup";

                    if (is100PercentDiscount) {
                      await persistSubscription(userEmail || "", appliedCoupon || "RENTROLL12", `FREE_${appliedCoupon || "RENTROLL12"}_${Date.now()}`, selectedPlan.id);
                      setPaymentToast(`🎉 100% Free Lifetime Offer for ${selectedPlan.name} Activated! Redirecting to Google...`);
                      setTimeout(async () => {
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: { redirectTo: redirectUrl }
                        });
                      }, 700);
                      return;
                    }

                    // Otherwise launch payment gateway for selected plan
                    await initiateRazorpayPayment({
                      amount: finalAmountInPaise,
                      receipt: `GOOGLE_GATE_${selectedPlan.id.toUpperCase()}_${Date.now()}`,
                      description: `Rent Roll ${selectedPlan.name} Subscription - Commercial Portfolio`,
                      prefillName: ownerName || "Account Holder",
                      prefillEmail: userEmail,
                      notes: { portal: portalName, auth_provider: "google", plan_id: selectedPlan.id, plan_price: `INR ${selectedPlan.price}` },
                      onSuccess: async (response) => {
                        await persistSubscription(userEmail || "", "none", response.razorpay_payment_id, selectedPlan.id);
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
                    : `Continue with Google (Pay ₹${selectedPlan.price} & Unlock)`}
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Full Name *
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
                    placeholder="e.g. you@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0F8B7D]/20 focus:border-[#0F8B7D] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <CountryPhoneInput
                  label="Mobile Number"
                  required
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  placeholder="98765 43210"
                />
              </div>
            </div>
          )}

          {/* Clean Executive Header */}
          <div className="text-center py-2 mb-4">
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mb-2 shadow-2xs">
              <Lock size={18} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Activate Workspace Subscription
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-medium">
              Choose your managed square footage and tier to unlock the live Rent Roll workspace.
            </p>
          </div>

          {/* ──── INTERACTIVE SQUARE FOOTAGE CHOOSER ──── */}
          <div className="mb-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">
                  Managed Square Footage (Sq.Ft)
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Dynamic rate calculated per square foot.
                </span>
              </div>
              <div className="relative w-full sm:w-44">
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={customSqft}
                  onChange={(e) => {
                    const val = Math.max(1000, Number(e.target.value) || 0);
                    setCustomSqft(val);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("officex_subscribed_sqft", String(val));
                    }
                  }}
                  className="w-full px-3 py-1.5 pr-11 rounded-xl border border-slate-300 bg-white text-sm font-mono font-black text-slate-900 text-right focus:border-[#0F8B7D] outline-none shadow-2xs"
                />
                <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400">sq.ft</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
              {[25000, 50000, 100000, 250000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCustomSqft(preset);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("officex_subscribed_sqft", String(preset));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    customSqft === preset
                      ? "bg-[#0F8B7D] text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {preset >= 100000 ? `${(preset / 100000).toFixed(preset % 100000 === 0 ? 0 : 1)}L sq.ft` : `${(preset / 1000).toFixed(0)}k sq.ft`}
                </button>
              ))}
            </div>
          </div>

          {/* ──── 3 CLEAN PLAN CARDS ──── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              const planTotal = customSqft * plan.price;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("officex_selected_plan", plan.id);
                      sessionStorage.setItem("officex_selected_plan", plan.id);
                    }
                  }}
                  className={`relative rounded-2xl p-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal-50/70 border-2 border-[#0F8B7D] shadow-sm ring-1 ring-[#0F8B7D]/20"
                      : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  {/* Badge */}
                  {plan.popular ? (
                    <div className="absolute -top-2 right-2.5 px-2 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[8px] font-black uppercase tracking-wider shadow-2xs">
                      {plan.badge}
                    </div>
                  ) : (
                    <div className="absolute -top-2 right-2.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-bold uppercase">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1 mt-0.5">
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        {plan.name}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#0F8B7D] text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <Check size={9} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-semibold mb-1.5">
                      {plan.scope}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-slate-900">
                        ₹{plan.price}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        / sq.ft
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/70 text-[10px] text-slate-600 font-medium">
                    {is100PercentDiscount ? (
                      <span className="text-emerald-700 font-bold">₹0 FREE</span>
                    ) : (
                      <span>Est: ₹{planTotal.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ──── 1-CLICK PROMOTIONAL COUPON (RENTROLL12) ──── */}
          <div className="mb-4 rounded-xl border border-amber-300/80 bg-linear-to-r from-amber-50/80 to-teal-50/60 p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-amber-700 shrink-0" />
                <span className="font-mono text-xs font-black text-[#0F8B7D] px-2 py-0.5 rounded-md bg-amber-100/80 border border-dashed border-amber-400">
                  RENTROLL12
                </span>
                <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">
                  100% Free Promotional Access (₹0)
                </span>
              </div>

              <div>
                {appliedCoupon === "RENTROLL12" ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 size={12} />
                      <span>Applied (₹0)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon("RENTROLL12");
                      setCouponSuccess("🎉 Code RENTROLL12 applied! 100% Free Access Activated.");
                      setCouponError(null);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("officex_applied_coupon", "RENTROLL12");
                        sessionStorage.setItem("officex_applied_coupon", "RENTROLL12");
                        localStorage.setItem("officex_subscription", "active");
                        sessionStorage.setItem("officex_subscription", "active");
                        localStorage.setItem("officex_subscribed_sqft", String(customSqft));
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[11px] shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Apply 100% Off
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ──── LIVE CALCULATION SUMMARY ──── */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-3.5 border border-teal-200 mb-5 text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 mb-0.5">
              {is100PercentDiscount ? "PROMOTIONAL 100% FREE ACCESS" : "CALCULATED SUBSCRIPTION FEE"}
            </div>
            <div className="flex items-center justify-center gap-2">
              {is100PercentDiscount ? (
                <>
                  <span className="text-xs font-bold text-slate-400 line-through">
                    ₹{(customSqft * selectedPlan.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#0F8B7D]">₹0 FREE</span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                    100% OFF
                  </span>
                </>
              ) : (
                <div className="text-2xl font-black text-[#0F8B7D]">
                  ₹{(customSqft * selectedPlan.price).toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-slate-500 ml-1">
                    ({customSqft.toLocaleString("en-IN")} sq.ft × ₹{selectedPlan.price}/sq.ft)
                  </span>
                </div>
              )}
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
                  <span>✨ Activate 100% Free Access (₹0) &amp; Unlock Dashboard Now</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Pay ₹{finalPriceInRupees.toLocaleString("en-IN")} &amp; Activate {selectedPlan.name} Now</span>
                </>
              )}
            </button>

            {/* Explore More Option */}
            <div className="text-center pt-1 pb-1">
              <Link
                href={`/operate/rent-roll/pricing?plan=${selectedPlanId}`}
                className="text-xs font-bold text-slate-500 hover:text-[#0F8B7D] inline-flex items-center gap-1.5 transition group"
              >
                <span>Want to explore all operational specs &amp; comparison?</span>
                <span className="text-[#0F8B7D] font-extrabold group-hover:underline flex items-center gap-1">
                  Explore More in Pricing →
                </span>
              </Link>
            </div>

            {isLoggedIn ? (
              <div className="pt-3 flex flex-col items-center gap-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">
                  Not ready to activate {portalName}? You will remain signed in to OfficeX.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#0F8B7D]">
                  <Link href="/" className="hover:underline flex items-center gap-1">
                    <span>OfficeX Homepage</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href={`/operate/rent-roll/pricing?plan=${selectedPlanId}`} className="hover:underline flex items-center gap-1 font-extrabold">
                    <Sparkles size={12} />
                    <span>Explore More in Pricing</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href="/fm-marketplace" className="hover:underline flex items-center gap-1">
                    <span>FM Marketplace</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href={fallbackLandingPage} className="hover:underline flex items-center gap-1">
                    <span>Platform Overview</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-3 text-center border-t border-slate-100">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="text-xs font-bold text-[#0F8B7D] hover:underline"
                >
                  Already have an account? Sign In to OfficeX →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // S-01 Workspace Decision Roles (§2.1 Customer Segments, §3 Personas, §4.1 org_type, §5.14 Roles)
  const S01_DECISION_ROLES = [
    {
      key: "owner",
      roleLabel: "Owner / Client Principal",
      orgType: "owner" as const,
      segmentCode: "Segment A · Asset Owner",
      title: "Commercial Property Owner / Landlord",
      subtitle: "Individual Owners, REIT SPVs, Developers & Asset Funds",
      icon: Building2,
      badgeBg: "bg-blue-100 text-blue-800 border-blue-300",
      accentBg: "bg-blue-600 text-white",
      targetDashboard: "/dashboard/owner",
      description: "Own or asset-manage commercial office parks, IT SEZs, or retail assets. Need executive portfolio oversight, revenue leakage defense, and automated investor MIS.",
      whatYouSee: [
        "Portfolio Rent Roll & Occupancy % (Physical & Economic)",
        "Receivables Overdue >60 Days & Holding Over contracts",
        "12-Month Lease Expiration Pipeline & Escalation Calendar",
        "Automated Monthly Owner Statements & Investor MIS"
      ]
    },
    {
      key: "finance_manager",
      roleLabel: "Finance / AR Manager",
      orgType: "owner" as const,
      segmentCode: "Statutory Hub · AR Sub-Ledger",
      title: "Finance Manager / Financial Controller",
      subtitle: "Accounts, Billing & Revenue Assurance Team",
      icon: Receipt,
      badgeBg: "bg-purple-100 text-purple-800 border-purple-300",
      accentBg: "bg-purple-600 text-white",
      targetDashboard: "/dashboard/finance",
      description: "Responsible for monthly tenant billing runs, separate GST tax invoices (Rent / CAM / Utility), TDS reconciliation, unallocated cash, and debt ageing.",
      whatYouSee: [
        "0–90+ Days Receivables Ageing Schedule & Bad Debt Tracker",
        "Monthly Billing Batch Runs & Separate GST Tax Invoices",
        "Unallocated Cash Receipts & Bank Settlement Reconciliations",
        "TDS Credit Certificates & Statutory Output Tax Sub-Ledger"
      ]
    },
    {
      key: "facility_manager",
      roleLabel: "Facility Manager",
      orgType: "facility_manager" as const,
      segmentCode: "Segment C · CAM & Utilities",
      title: "Facility Management Company (IFM)",
      subtitle: "IFM Firms & Technical Building Services",
      icon: Zap,
      badgeBg: "bg-teal-100 text-teal-800 border-teal-300",
      accentBg: "bg-teal-600 text-white",
      targetDashboard: "/dashboard/fm",
      description: "Manage facilities, utility sub-meters, CAM expense pools, and maintenance recoveries on behalf of property owners or condominium associations.",
      whatYouSee: [
        "Monthly Sub-Meter Logging (Electricity, Water, DG Backup)",
        "CAM Cost Pool Budget vs Actual Reconciliation (True-Up)",
        "Charges-Only Contracts & Service-Charge Invoices",
        "Tenant Utility Discrepancies & HVAC Overtime Logs"
      ]
    },
    {
      key: "property_manager",
      roleLabel: "Property Manager / Centre Manager",
      orgType: "property_manager" as const,
      segmentCode: "Segment B/D · On-Ground Operations",
      title: "Property Manager / Centre Manager",
      subtitle: "Operations, Leasing Compliance & Tenant Relations",
      icon: ClipboardList,
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      accentBg: "bg-emerald-600 text-white",
      targetDashboard: "/dashboard/pm",
      description: "On-ground property manager keeping space schedules, lease clauses, security deposit balances, and day-to-day notices 100% compliant.",
      whatYouSee: [
        "S-03 Today Task Queue: critical lease actions due today",
        "Lease Escalation Calendar (90/60/30-day notice alerts)",
        "Missing Lease Deeds, Expired NOCs & Stamp Duty Gaps",
        "Holding Over occupants and upcoming lock-in expiry dates"
      ]
    }
  ];

  const handleConfirmRoleDecision = (chosen: typeof S01_DECISION_ROLES[0]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_role", chosen.roleLabel);
      localStorage.setItem("officex_role_key", chosen.key);
      localStorage.setItem("officex_org_type", chosen.orgType);
      localStorage.setItem("officex_workspace_initialized", "true");
      sessionStorage.setItem("officex_user_role", chosen.roleLabel);
      sessionStorage.setItem("officex_role_key", chosen.key);
      sessionStorage.setItem("officex_org_type", chosen.orgType);
      sessionStorage.setItem("officex_workspace_initialized", "true");
      document.cookie = `officex_user_role=${encodeURIComponent(chosen.roleLabel)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_role_key=${encodeURIComponent(chosen.key)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_org_type=${encodeURIComponent(chosen.orgType)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_workspace_initialized=true; path=/; max-age=86400; SameSite=Lax`;
    }
    setIsRoleDecided(true);
    router.push(chosen.targetDashboard);
  };

  // Enforce specification: User CANNOT see any dashboard before deciding their operational persona!
  if (!isRoleDecided) {
    const activePersona = S01_DECISION_ROLES.find((r) => r.key === selectedPersonaKey) || S01_DECISION_ROLES[0];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans p-4 sm:p-6 justify-center items-center">
        <div className="max-w-4xl w-full my-auto py-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={13} />
              <span>Specification Protocol · §S-01 Workspace &amp; Role Selection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Who is managing this commercial portfolio?
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Per Section 2.1 Customer Segments &amp; Section 5.14 Access Control, you cannot enter a generic dashboard before deciding your operational responsibility. Please select your role below:
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {S01_DECISION_ROLES.map((persona) => {
              const IconComp = persona.icon;
              const isSelected = selectedPersonaKey === persona.key;

              return (
                <div
                  key={persona.key}
                  onClick={() => setSelectedPersonaKey(persona.key)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left relative ${
                    isSelected
                      ? "bg-slate-900 border-[#0F8B7D] ring-2 ring-[#0F8B7D]/30 shadow-lg shadow-[#0F8B7D]/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-[#0F8B7D] text-white" : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <IconComp size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-teal-400 block uppercase tracking-wider">
                            {persona.segmentCode}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {persona.title}
                          </h3>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#0F8B7D] border-[#0F8B7D] text-white" : "border-slate-700"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                      {persona.description}
                    </p>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider block">
                        Included in this Role Dashboard:
                      </span>
                      {persona.whatYouSee.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <div className="w-1 h-1 rounded-full bg-teal-400 shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Landing: <strong className="text-teal-400 font-mono">{persona.targetDashboard}</strong></span>
                    <span className="text-slate-400">{persona.roleLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}

          {/* Confirm Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              After entering, you can access the Central Register, Billing, and Operations from your dashboard anytime.
            </p>
            <button
              onClick={() => handleConfirmRoleDecision(activePersona)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-md shadow-[#0F8B7D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch {activePersona.title} Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children normally if logged in AND subscribed AND role decided
  return <>{children}</>;
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Zap,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sliders,
  AlertTriangle,
  X,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Tag,
  User,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";
import { supabase } from "@/lib/supabase";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

interface RentRollPricingTableProps {
  onContactSales?: () => void;
  showComparisonLink?: boolean;
}

interface SelectedPlanInfo {
  id: string;
  name: string;
  ratePerSqft: number;
  monthlyPrice: number;
  sqftLimit: string;
  sqftNumber: number;
  basePriceNum: number;
}

export default function RentRollPricingTable({
  onContactSales,
  showComparisonLink = true,
}: RentRollPricingTableProps) {
  const router = useRouter();

  // User Auth State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("owner");
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        let storedEmail =
          localStorage.getItem("officex_user_email") ||
          sessionStorage.getItem("officex_user_email") ||
          getCookie("officex_user_email") ||
          "";
        let storedName =
          localStorage.getItem("officex_user_name") ||
          sessionStorage.getItem("officex_user_name") ||
          getCookie("officex_user_name") ||
          "";
        let storedRole =
          localStorage.getItem("officex_user_role") ||
          sessionStorage.getItem("officex_user_role") ||
          getCookie("officex_user_role") ||
          "owner";

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            storedEmail = session.user.email;
            storedName =
              session.user.user_metadata?.full_name ||
              session.user.email.split("@")[0] ||
              storedName;
          }
        } catch {
          // Non-blocking
        }

        if (storedEmail) setUserEmail(storedEmail);
        if (storedName) setUserName(storedName);
        if (storedRole) setUserRole(storedRole);
        setIsAuthLoaded(true);
      }
    };
    initAuth();
  }, []);

  // Calculator State
  const [calculatorRate, setCalculatorRate] = useState<number>(100);
  const [customSqft, setCustomSqft] = useState<number>(250000);
  const [sliderSqft, setSliderSqft] = useState<number>(250000);

  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<SelectedPlanInfo | null>(null);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showPromoField, setShowPromoField] = useState<boolean>(false);
  const [processingActivation, setProcessingActivation] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderSqft(val);
    setCustomSqft(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/,/g, "")) || 0;
    setCustomSqft(val);
    if (val <= 1000000) setSliderSqft(val);
  };

  const calculatedCalculatorAnnualPrice = customSqft * calculatorRate;

  // Commercial Slabs: Compact, punchy 4 bullets each with canonical ₹50, ₹100, ₹200 plans
  const SLABS = [
    {
      id: "starter",
      name: "Commercial Starter",
      badge: "Up to 50k Sq.Ft",
      ratePerSqft: 50,
      monthlyPrice: 50,
      sqftLimit: "50,000 sq.ft",
      sqftNumber: 50000,
      target: "Standalone Commercial Tower",
      basePriceDisplay: "₹50 / mo",
      basePriceNum: 50,
      popular: false,
      ctaText: "Select Starter",
      features: [
        "39-Point canonical lease contract master & live register",
        "Automated step escalations with 90-day anniversary alerts",
        "Bulk Excel/CSV data importer with auto-column mapper",
        "Audit-ready exports (WALE, rollover & board MIS sheets)",
      ],
    },
    {
      id: "techpark",
      name: "Grade-A Tech Park",
      badge: "Most Popular",
      ratePerSqft: 100,
      monthlyPrice: 100,
      sqftLimit: "2,50,000 sq.ft",
      sqftNumber: 250000,
      target: "Multi-Tower Tech Parks & Campuses",
      basePriceDisplay: "₹100 / mo",
      basePriceNum: 100,
      popular: true,
      ctaText: "Select Tech Park",
      features: [
        "Full Lease-to-Cash billing centre with monthly batch runs",
        "Automated CAM pooling & utility sub-meter ingestion",
        "Statutory 18% GST & Section 194I TDS deduction ledgers",
        "Occupant self-service portal & legal default notices (§106)",
      ],
    },
    {
      id: "reit-mega",
      name: "REIT Mega-Portfolio",
      badge: "Enterprise Scale",
      ratePerSqft: 200,
      monthlyPrice: 200,
      sqftLimit: "50,00,00,000 sq.ft",
      sqftNumber: 500000000,
      target: "Institutional Funds & REITs",
      basePriceDisplay: "₹200 / mo",
      basePriceNum: 200,
      popular: false,
      ctaText: "Select Enterprise",
      features: [
        "Up to 50,00,00,000 Sq.Ft licensed capacity allocation",
        "14-Day commercial grace period (zero hard lockouts)",
        "Maker-checker approvals & custom institutional RBAC",
        "REST APIs & webhooks with enterprise SSO (SAML 2.0)",
      ],
    },
  ];

  // Open checkout modal for plan review, coupon entry, or Razorpay payment
  const handleChoosePlan = (slab: typeof SLABS[0]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_selected_plan", slab.id);
      sessionStorage.setItem("officex_selected_plan", slab.id);
    }
    const planInfo: SelectedPlanInfo = {
      id: slab.id,
      name: slab.name,
      ratePerSqft: slab.ratePerSqft,
      monthlyPrice: slab.monthlyPrice,
      sqftLimit: slab.sqftLimit,
      sqftNumber: slab.sqftNumber,
      basePriceNum: slab.basePriceNum,
    };
    setCheckoutPlan(planInfo);
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError(null);
    setShowPromoField(true);
    setProcessingActivation(false);
  };

  const handleOpenCheckout = (slab: typeof SLABS[0]) => {
    handleChoosePlan(slab);
  };

  const handleOpenCalculatorCheckout = () => {
    const customPlan: SelectedPlanInfo = {
      id: `custom-${calculatorRate}`,
      name: `Custom Scope (${customSqft.toLocaleString("en-IN")} Sq.Ft)`,
      ratePerSqft: calculatorRate,
      monthlyPrice: calculatorRate,
      sqftLimit: `${customSqft.toLocaleString("en-IN")} sq.ft`,
      sqftNumber: customSqft,
      basePriceNum: calculatorRate,
    };
    setCheckoutPlan(customPlan);
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError(null);
    setShowPromoField(true);
    setProcessingActivation(false);
  };

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (code === "OFFICEX100" || code === "RENTROLL12" || code === "FREE100") {
      setAppliedCoupon(code);
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Use OFFICEX100 or RENTROLL12 for launch access.");
    }
  };

  // Launch Razorpay Payment Gateway directly
  const handlePayViaRazorpay = async (planToPay?: SelectedPlanInfo | null) => {
    const plan = planToPay || checkoutPlan;
    if (!plan) return;

    const finalEmail = (
      userEmail ||
      (typeof window !== "undefined"
        ? localStorage.getItem("officex_user_email") || getCookie("officex_user_email")
        : "") ||
      ""
    ).trim().toLowerCase();

    const finalName = (
      userName ||
      (typeof window !== "undefined"
        ? localStorage.getItem("officex_user_name") || getCookie("officex_user_name")
        : "") ||
      "Commercial Account"
    ).trim();

    const priceInRupees = plan.basePriceNum || 100;
    const amountInPaise = priceInRupees * 100;

    setProcessingActivation(true);
    try {
      await initiateRazorpayPayment({
        amount: amountInPaise,
        receipt: `SUB_${plan.id.toUpperCase()}_${Date.now()}`,
        description: `OfficeX ${plan.name} Subscription - Rent Roll Master`,
        prefillName: finalName,
        prefillEmail: finalEmail,
        notes: {
          portal: "Rent Roll Master",
          user_email: finalEmail,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_price: `INR ${priceInRupees}`,
          coupon: appliedCoupon || "none",
          discount: "0%",
        },
        onSuccess: async (response) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_subscription", "active");
            sessionStorage.setItem("officex_subscription", "active");
            localStorage.setItem("officex_user_email", finalEmail);
            localStorage.setItem("officex_user_name", finalName);
            localStorage.setItem("officex_user_role", userRole || "owner");
            localStorage.setItem("officex_selected_plan", plan.id);
            localStorage.setItem("officex_subscription_plan", plan.id);
            localStorage.setItem(`officex_sub_${finalEmail}`, "active");
            sessionStorage.setItem(`officex_sub_${finalEmail}`, "active");
            document.cookie = `officex_sub_${encodeURIComponent(finalEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
            document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
            document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
          }

          try {
            await fetch("/api/subscription/status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: finalEmail,
                coupon: appliedCoupon || "none",
                paymentId: response.razorpay_payment_id,
                plan: plan.id,
              }),
            });
          } catch {
            // Non-blocking
          }

          setProcessingActivation(false);
          router.push("/select-workspace");
        },
        onFailure: (err) => {
          console.error("Razorpay payment cancelled or failed:", err);
          setProcessingActivation(false);
        },
      });
    } catch (err: any) {
      console.error("Razorpay initialization error:", err);
      setProcessingActivation(false);
      alert(`Could not open payment gateway: ${err.message || "Please try again."}`);
    }
  };

  // Complete checkout & navigate for 100% Free coupon
  const handleCompleteActivation = async () => {
    const finalEmail = (
      userEmail ||
      (typeof window !== "undefined"
        ? localStorage.getItem("officex_user_email") || getCookie("officex_user_email")
        : "") ||
      ""
    ).trim().toLowerCase();

    const finalName = (
      userName ||
      (typeof window !== "undefined"
        ? localStorage.getItem("officex_user_name") || getCookie("officex_user_name")
        : "") ||
      "Commercial Account"
    ).trim();

    const finalRole = userRole || "owner";
    const planId = checkoutPlan?.id || "techpark";

    setProcessingActivation(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      localStorage.setItem("officex_user_email", finalEmail);
      localStorage.setItem("officex_user_name", finalName);
      localStorage.setItem("officex_user_role", finalRole);
      localStorage.setItem(`officex_sub_${finalEmail}`, "active");
      localStorage.setItem("officex_selected_plan", planId);
      localStorage.setItem("officex_subscription_plan", planId);
      sessionStorage.setItem("officex_user_email", finalEmail);
      sessionStorage.setItem(`officex_sub_${finalEmail}`, "active");
      document.cookie = `officex_sub_${encodeURIComponent(finalEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
    }

    try {
      await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: finalEmail,
          coupon: appliedCoupon || "RENTROLL12",
          paymentId: `FREE_${appliedCoupon || "RENTROLL12"}_${Date.now()}`,
          plan: planId,
        }),
      });
    } catch {
      // Non-blocking
    }

    setTimeout(() => {
      router.push("/dashboard/owner");
    }, 350);
  };

  return (
    <div className="w-full">
      {/* ──── SIGNED-IN VERIFIED BANNER (WHEN USER COMES FROM SIGN-IN / GATE) ──── */}
      {userEmail && (
        <div className="max-w-6xl mx-auto mb-6 p-3.5 sm:p-4 bg-gradient-to-r from-teal-50 via-emerald-50/50 to-white border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  Signed in as {userName || userEmail}
                </span>
                <span className="text-[10px] font-black bg-[#0D7B6C] text-white px-2 py-0.5 rounded-full shadow-2xs">
                  ✓ Verified Account
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                {userEmail} &middot; Pick your operational plan below to directly launch the Razorpay payment gateway and unlock live access.
              </p>
            </div>
          </div>
          <Link
            href="/properties/rent-roll"
            className="text-xs font-bold text-[#0D7B6C] hover:text-[#0A6357] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Return to Dashboard Gate</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* ──── 1. COMPACT, SLEEK 3 PRICING BOXES ──── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-6xl mx-auto mb-10">
        {SLABS.map((slab) => (
          <div
            key={slab.id}
            className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${
              slab.popular
                ? "bg-gradient-to-b from-white via-white to-teal-50/20 border-2 border-[#0D7B6C] shadow-lg shadow-teal-950/5 ring-2 ring-[#0D7B6C]/10"
                : "bg-white border border-slate-200/90 shadow-2xs hover:shadow-md"
            }`}
          >
            {/* Badge */}
            {slab.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0D7B6C] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1 whitespace-nowrap">
                <Sparkles size={11} />
                <span>{slab.badge}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {slab.name}
                </h3>
                {!slab.popular && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {slab.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mb-4">
                {slab.target}
              </p>

              {/* Compact Price Header */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                    ₹{slab.monthlyPrice}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    / mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60 font-medium">
                  <span>Capacity: <strong className="text-slate-800">{slab.sqftLimit}</strong></span>
                  <span className="font-mono text-[#0D7B6C] font-bold">Standard Billing</span>
                </div>
              </div>

              {/* Concise 4-Bullet Feature List */}
              <div className="space-y-2 mb-6 text-left">
                {slab.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                    <Check
                      size={14}
                      className={`shrink-0 mt-0.5 ${
                        slab.popular ? "text-[#0D7B6C]" : "text-emerald-600"
                      }`}
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => handleChoosePlan(slab)}
                disabled={processingActivation}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  slab.popular
                    ? "bg-[#0D7B6C] hover:bg-[#0A6357] text-white shadow-[#0D7B6C]/20 hover:shadow-md"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {processingActivation && checkoutPlan?.id === slab.id ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Opening Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={13} />
                    <span>
                      {userEmail
                        ? `Choose Plan · Pay ₹${slab.monthlyPrice}`
                        : slab.ctaText}
                    </span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ──── 2. COMPACT, STREAMLINED AREA CALCULATOR ──── */}
      <div className="max-w-4xl mx-auto mb-10 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 text-slate-900 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Rate pills and area slider */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#0D7B6C]" />
                <span className="text-xs font-bold text-slate-800">
                  Quick Scope Calculator
                </span>
              </div>

              {/* Rate Pills */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {[50, 100, 200].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCalculatorRate(rate)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      calculatorRate === rate
                        ? "bg-[#0D7B6C] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ₹{rate}/mo
                  </button>
                ))}
              </div>
            </div>

            {/* Slider with live area readout */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Area Scope:</span>
                <span className="font-mono font-bold text-slate-900">
                  {customSqft.toLocaleString("en-IN")} sq.ft
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={sliderSqft}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D7B6C]"
              />
            </div>
          </div>

          {/* Right: Calculated Amount & CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:border-l sm:border-slate-200/80 sm:pl-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Tier
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{calculatorRate}
              </span>
              <span className="text-[10px] text-slate-400 block">/ month (all inclusive)</span>
            </div>

            <button
              onClick={handleOpenCalculatorCheckout}
              disabled={processingActivation}
              className="px-4 py-2 bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-60"
            >
              <span>{userEmail ? `Pay ₹${calculatorRate} & Subscribe` : "Subscribe Scope"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ──── 3. COMPACT REASSURANCE & GRACE PERIOD CALLOUT ──── */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-teal-50/50 border border-teal-200/70 p-4 text-left shadow-2xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-[#0D7B6C] shrink-0" />
          <span className="text-slate-700">
            <strong className="text-slate-900">14-Day Grace Period Protection:</strong> Zero operational hard-locks. Early warnings at 90% capacity ensure continuous lease management and billing.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#0D7B6C] bg-white px-2.5 py-1 rounded-lg border border-teal-200 shrink-0">
          50,00,00,000 Sq.Ft Cap
        </span>
      </div>

      {/* ──── 4. INTERACTIVE CHECKOUT & ONBOARDING SHEET MODAL ──── */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl text-left my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setCheckoutPlan(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0D7B6C] flex items-center justify-center shrink-0">
                <CreditCard size={17} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Subscribe to {checkoutPlan.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  ₹{checkoutPlan.basePriceNum} / month · Up to {checkoutPlan.sqftLimit}
                </p>
              </div>
            </div>

            {/* User Details Step */}
            {userEmail ? (
              <div className="mb-4 p-3 bg-teal-50/80 rounded-xl border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{userName || "Subscriber"}</span>
                      <span className="text-[10px] font-black bg-white text-[#0D7B6C] border border-teal-200 px-2 py-0.2 rounded-full">
                        ✓ Signed In
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium block truncate max-w-[220px]">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider bg-teal-100/70 px-2 py-0.5 rounded-md">
                  {userRole}
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Workspace Admin Credentials
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 shrink-0">Role:</span>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="flex-1 py-1 px-2 text-[11px] rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none"
                  >
                    <option value="owner">Commercial Property Owner</option>
                    <option value="manager">Facility / Asset Manager (IFM)</option>
                    <option value="finance">CA / Financial Controller</option>
                    <option value="tenant">Commercial Tenant Admin</option>
                  </select>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-bold text-slate-800">{checkoutPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Licensed Portfolio Scope:</span>
                <span className="font-semibold text-slate-800">{checkoutPlan.sqftLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly License Fee:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{checkoutPlan.basePriceNum}.00 / mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statutory GST (18%):</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  Included
                </span>
              </div>

              {/* Coupon Row */}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-bold pt-1.5 border-t border-emerald-200 bg-emerald-100/70 -mx-3.5 -mb-3.5 p-2.5 rounded-b-xl">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    Launch Coupon "{appliedCoupon}" (100% OFF):
                  </span>
                  <span className="font-mono">
                    -₹{checkoutPlan.basePriceNum}.00
                  </span>
                </div>
              )}
            </div>

            {/* Total Due */}
            <div className="flex justify-between items-baseline mb-4 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">Total Due:</span>
              <div className="text-right">
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono line-through text-slate-400">
                      ₹{checkoutPlan.basePriceNum}.00
                    </span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      ₹0.00 FREE
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{checkoutPlan.basePriceNum}.00
                  </span>
                )}
              </div>
            </div>

            {/* Promo Code Input - Always Visible & Interactive */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag size={13} className="text-[#0D7B6C]" />
                  <span>Have a Promo Voucher or Launch Code?</span>
                </span>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponInput("OFFICEX100");
                      setAppliedCoupon("OFFICEX100");
                      setCouponError(null);
                    }}
                    className="text-[10px] font-black text-[#0D7B6C] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={10} />
                    <span>Quick Apply: OFFICEX100</span>
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter OFFICEX100 or RENTROLL12"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#0D7B6C] focus:ring-1 focus:ring-[#0D7B6C] outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                    >
                      Apply Code
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> {couponError}
                    </p>
                  )}
                </form>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon}</strong> Applied: <strong>100% FREE Access Activated!</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleCompleteActivation}
                  disabled={processingActivation}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processingActivation ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Activating Free Subscription...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Activate Free Access (₹0) &amp; Enter Dashboard</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePayViaRazorpay(checkoutPlan)}
                    disabled={processingActivation}
                    className="w-full py-3 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {processingActivation ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Pay ₹{checkoutPlan.basePriceNum} via Razorpay Gateway</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCouponInput("OFFICEX100");
                      setAppliedCoupon("OFFICEX100");
                      setCouponError(null);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/70 text-[11px] font-extrabold text-[#0D7B6C] transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={12} />
                    <span>Have launch coupon? Apply OFFICEX100 for 100% Free Access</span>
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                Zero lock-in &middot; 14-day commercial grace period &middot; Secured by 256-bit Razorpay encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Link */}
      {showComparisonLink && (
        <div className="text-center">
          <Link
            href="/operate/rent-roll/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0D7B6C] transition"
          >
            <span>View Full 48-Point Feature Comparison Matrix</span>
            <ExternalLink size={12} className="text-[#0D7B6C]" />
          </Link>
        </div>
      )}
    </div>
  );
}

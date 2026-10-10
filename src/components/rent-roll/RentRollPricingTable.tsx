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

        // Never prefill generic or dummy values
        if (!storedName || storedName.toLowerCase().includes("commercial account") || storedName.toLowerCase().includes("subscriber")) {
          storedName = "";
          if (typeof window !== "undefined") {
            localStorage.removeItem("officex_user_name");
            sessionStorage.removeItem("officex_user_name");
          }
        }
        if (!storedEmail) {
          storedName = "";
        }

        setUserEmail(storedEmail);
        setUserName(storedName);
        if (storedRole) setUserRole(storedRole);
        setIsAuthLoaded(true);
      }
    };
    initAuth();
  }, []);

  const handleNameChange = (val: string) => {
    setUserName(val);
    if (typeof window !== "undefined") {
      const clean = val.trim();
      if (clean && clean !== "Commercial Account") {
        localStorage.setItem("officex_user_name", clean);
        sessionStorage.setItem("officex_user_name", clean);
        document.cookie = `officex_user_name=${encodeURIComponent(clean)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  };

  const handleEmailChange = (val: string) => {
    setUserEmail(val);
    if (typeof window !== "undefined") {
      const clean = val.trim().toLowerCase();
      if (clean) {
        localStorage.setItem("officex_user_email", clean);
        sessionStorage.setItem("officex_user_email", clean);
        document.cookie = `officex_user_email=${encodeURIComponent(clean)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  };

  // Area Scope State (User enters / selects their property sq.ft)
  const [customSqft, setCustomSqft] = useState<number>(50000);
  const [sliderSqft, setSliderSqft] = useState<number>(50000);

  // Quick Preset Sq.Ft Chips
  const SQFT_PRESETS = [10000, 25000, 50000, 100000, 250000, 500000];

  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<SelectedPlanInfo | null>(null);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showPromoField, setShowPromoField] = useState<boolean>(false);
  const [processingActivation, setProcessingActivation] = useState(false);

  const handleSqftChange = (val: number) => {
    const clamped = Math.max(1, Math.round(val) || 0);
    setCustomSqft(clamped);
    setSliderSqft(clamped);
    if (checkoutPlan) {
      const newTotal = clamped * checkoutPlan.ratePerSqft;
      setCheckoutPlan((prev) =>
        prev
          ? {
              ...prev,
              sqftNumber: clamped,
              sqftLimit: `${clamped.toLocaleString("en-IN")} sq.ft`,
              basePriceNum: newTotal,
              monthlyPrice: newTotal,
            }
          : null
      );
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    handleSqftChange(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const val = Number(raw) || 0;
    handleSqftChange(val);
  };

  // Commercial Slabs: ₹50, ₹100, ₹200 per sq.ft with specific tier benefits
  const SLABS = [
    {
      id: "starter",
      name: "Commercial Starter",
      badge: "Standalone Tower",
      ratePerSqft: 50,
      target: "Standalone Commercial Towers & Small Portfolios",
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
      name: "Tech Park Campus",
      badge: "Most Popular",
      ratePerSqft: 100,
      target: "Multi-Tower Tech Parks & Commercial Campuses",
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
      target: "Institutional Funds, REITs & Mega Portfolios",
      popular: false,
      ctaText: "Select Enterprise",
      features: [
        "Consolidated portfolio aggregation across multiple cities",
        "14-Day commercial grace period (zero hard lockouts)",
        "Maker-checker approvals & custom institutional RBAC",
        "REST APIs & webhooks with enterprise SSO (SAML 2.0)",
      ],
    },
  ];

  // Open checkout modal for plan review with exact sq.ft calculation
  const handleChoosePlan = (slab: typeof SLABS[0], chosenSqft?: number) => {
    const area = chosenSqft || customSqft || 50000;
    const totalPrice = area * slab.ratePerSqft;

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_selected_plan", slab.id);
      sessionStorage.setItem("officex_selected_plan", slab.id);
    }
    if (userName && userName.toLowerCase().includes("commercial account")) {
      setUserName("");
    }
    const planInfo: SelectedPlanInfo = {
      id: slab.id,
      name: slab.name,
      ratePerSqft: slab.ratePerSqft,
      monthlyPrice: totalPrice,
      sqftLimit: `${area.toLocaleString("en-IN")} sq.ft`,
      sqftNumber: area,
      basePriceNum: totalPrice,
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

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (code === "OFFICEX100" || code === "RENTROLL12" || code === "FREE100") {
      setAppliedCoupon(code);
      setCouponError(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_applied_coupon", code);
        sessionStorage.setItem("officex_applied_coupon", code);
        localStorage.setItem("officex_subscription", "active");
        sessionStorage.setItem("officex_subscription", "active");
        localStorage.setItem("officex_subscribed_sqft", String(customSqft || 50000));
        document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
        if (userEmail) {
          localStorage.setItem(`officex_sub_${userEmail}`, "active");
          document.cookie = `officex_sub_${encodeURIComponent(userEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
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
      (finalEmail ? finalEmail.split("@")[0] : "")
    ).trim() === "Commercial Account" ? (finalEmail ? finalEmail.split("@")[0] : "") : (
      (userName || (typeof window !== "undefined" ? localStorage.getItem("officex_user_name") || "" : "") || (finalEmail ? finalEmail.split("@")[0] : "")).trim()
    );

    const priceInRupees = (plan.sqftNumber * plan.ratePerSqft) || plan.basePriceNum || 50;
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
            localStorage.setItem("officex_user_role", "owner");
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
      (finalEmail ? finalEmail.split("@")[0] : "")
    ).trim() === "Commercial Account" ? (finalEmail ? finalEmail.split("@")[0] : "") : (
      (userName || (typeof window !== "undefined" ? localStorage.getItem("officex_user_name") || "" : "") || (finalEmail ? finalEmail.split("@")[0] : "")).trim()
    );

    const finalRole = "owner";
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

    const userRoleKey = typeof window !== "undefined"
      ? (localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key") || "")
      : "";
    const roleDashboards: Record<string, string> = {
      owner: "/dashboard/owner",
      property_manager: "/dashboard/pm",
      facility_manager: "/dashboard/fm",
      leasing_manager: "/dashboard/leasing",
      finance_manager: "/dashboard/finance",
    };
    const target = (userRoleKey && roleDashboards[userRoleKey]) ? roleDashboards[userRoleKey] : "/onboarding";

    setTimeout(() => {
      router.push(target);
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

      {/* ──── 1. MASTER PROPERTY AREA (SQ.FT) SELECTOR ──── */}
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 text-left">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-bold text-sm border border-teal-200/60">
                📐
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Enter Your Leasable Property Area (Sq.Ft)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Plans are charged fixed at <strong className="text-slate-800">₹50, ₹100, or ₹200 per sq.ft</strong> based on tier capabilities. Choose or type your area below:
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="1000"
                max="1000000"
                step="1000"
                value={sliderSqft}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D7B6C]"
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Select:
              </span>
              {SQFT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSqftChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customSqft === preset
                      ? "bg-[#0D7B6C] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  {preset >= 100000 ? `${preset / 100000} Lakh sq.ft` : `${(preset / 1000).toLocaleString("en-IN")}k sq.ft`}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Input Field */}
          <div className="lg:w-80 bg-slate-50 rounded-2xl p-4 border border-slate-200/90 text-left shrink-0 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Direct Area Input
            </span>
            <div className="relative">
              <input
                type="text"
                value={customSqft.toLocaleString("en-IN")}
                onChange={handleInputChange}
                className="w-full pl-3 pr-14 py-2 font-mono font-black text-xl rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">
                sq.ft
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Type any exact commercial square footage you manage.
            </p>
          </div>
        </div>
      </div>

      {/* ──── 2. 3 TIER PRICING CARDS DYNAMICALLY SCOPED ──── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-6xl mx-auto mb-10">
        {SLABS.map((slab) => {
          const totalTierPrice = customSqft * slab.ratePerSqft;
          return (
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

                {/* Clear Per Sq.Ft Rate & Total Calculation */}
                <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 mb-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        ₹{slab.ratePerSqft}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        / sq.ft
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0D7B6C] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Direct Rate
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Total for {customSqft.toLocaleString("en-IN")} sq.ft:</span>
                      <span className="font-mono font-black text-slate-900 text-base">
                        ₹{totalTierPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      Calculation: {customSqft.toLocaleString("en-IN")} sq.ft × ₹{slab.ratePerSqft}/sq.ft
                    </p>
                  </div>
                </div>

                {/* Features */}
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

              {/* Button */}
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
                        Choose {slab.name} · ₹{totalTierPrice.toLocaleString("en-IN")}
                      </span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
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
          Capacity Tailored to Your Portfolio
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
                  ₹{checkoutPlan.ratePerSqft} / sq.ft · For {checkoutPlan.sqftNumber.toLocaleString("en-IN")} sq.ft scope
                </p>
              </div>
            </div>

            {/* User Details Step */}
            {userEmail && isAuthLoaded && typeof window !== "undefined" && (localStorage.getItem("officex_session_active") === "1" || localStorage.getItem("officex_auth") === "1") ? (
              <div className="mb-4 p-3 bg-teal-50/80 rounded-xl border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{userName || userEmail.split("@")[0]}</span>
                      <span className="text-[10px] font-black bg-white text-[#0D7B6C] border border-teal-200 px-2 py-0.2 rounded-full">
                        ✓ Signed In
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium block truncate max-w-[220px]">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserEmail("");
                    setUserName("");
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("officex_user_email");
                      localStorage.removeItem("officex_user_name");
                      sessionStorage.removeItem("officex_user_email");
                      sessionStorage.removeItem("officex_user_name");
                    }
                  }}
                  className="text-[10px] text-teal-800 font-semibold underline hover:text-teal-950 cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Workspace Admin Credentials
                  </span>
                  <Link
                    href={`/login?email=${encodeURIComponent(userEmail || "")}&name=${encodeURIComponent(userName || "")}&redirect=/operate/rent-roll/pricing`}
                    className="text-[10px] font-bold text-[#0D7B6C] hover:underline"
                  >
                    Already have account? Sign in &rarr;
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={userName && !userName.toLowerCase().includes("commercial account") ? userName : ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={userEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5 text-xs mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Selected Tier:</span>
                <span className="font-bold text-slate-900">{checkoutPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fixed Rate:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{checkoutPlan.ratePerSqft}.00 / sq.ft
                </span>
              </div>

              {/* Editable Area right in the modal */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/70">
                <span className="text-slate-700 font-semibold">Property Area:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={checkoutPlan.sqftNumber}
                    onChange={(e) => handleSqftChange(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-right font-mono font-bold text-slate-900 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-[#0D7B6C]"
                  />
                  <span className="font-bold text-slate-600 text-xs">sq.ft</span>
                </div>
              </div>

              {/* Transparent calculation line */}
              <div className="flex justify-between items-center text-[11px] text-slate-600 bg-slate-100/90 p-2 rounded-lg font-mono">
                <span>Calculation:</span>
                <span className="font-bold text-slate-900">
                  {checkoutPlan.sqftNumber.toLocaleString("en-IN")} sq.ft × ₹{checkoutPlan.ratePerSqft}/sq.ft
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Subtotal Due:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft).toLocaleString("en-IN")}.00
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Statutory GST (18%):</span>
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
                    -₹{(checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft).toLocaleString("en-IN")}.00
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
                      ₹{(checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft).toLocaleString("en-IN")}.00
                    </span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      ₹0.00 FREE
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{(checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft).toLocaleString("en-IN")}.00
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
                      if (typeof window !== "undefined") {
                        localStorage.setItem("officex_applied_coupon", "OFFICEX100");
                        sessionStorage.setItem("officex_applied_coupon", "OFFICEX100");
                        localStorage.setItem("officex_subscription", "active");
                        sessionStorage.setItem("officex_subscription", "active");
                        document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
                        if (userEmail) {
                          localStorage.setItem(`officex_sub_${userEmail}`, "active");
                          document.cookie = `officex_sub_${encodeURIComponent(userEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
                        }
                      }
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
                        <span>Pay ₹{(checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft).toLocaleString("en-IN")} via Razorpay Gateway</span>
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

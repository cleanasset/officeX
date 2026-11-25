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
import { useUniversalPortfolioSqft } from "@/lib/portfolio-area";
import { supabase } from "@/lib/supabase";
import { getClientAuthHeaders, getClientUserEmail } from "@/lib/auth-storage";

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

  // User Auth & Subscription State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("owner");
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        let storedEmail =
          getClientUserEmail() ||
          localStorage.getItem("officex_user_email") ||
          sessionStorage.getItem("officex_user_email") ||
          getCookie("officex_user_email") ||
          "";
        let storedName =
          localStorage.getItem("officex_user_name") ||
          sessionStorage.getItem("officex_user_name") ||
          getCookie("officex_user_name") ||
          "";
        const storedRole =
          localStorage.getItem("officex_user_role") ||
          sessionStorage.getItem("officex_user_role") ||
          getCookie("officex_user_role") ||
          "owner";

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            storedEmail = session.user.email.toLowerCase().trim();
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
          localStorage.removeItem("officex_user_name");
          sessionStorage.removeItem("officex_user_name");
        }
        if (!storedEmail) {
          storedName = "";
        }

        setUserEmail(storedEmail);
        setUserName(storedName);
        if (storedRole) setUserRole(storedRole);
        setIsAuthLoaded(true);

        if (storedEmail) {
          try {
            const headers = { ...getClientAuthHeaders(), "x-user-email": storedEmail };
            const res = await fetch(`/api/subscription/status?email=${encodeURIComponent(storedEmail)}`, {
              headers,
              cache: "no-store",
            });
            if (res.ok) {
              const data = await res.json();
              setSubStatus(data);
              const active = Boolean(
                data?.subscribed &&
                data.plan !== "none" &&
                data.plan !== "free" &&
                (data.modules ? (data.modules.rentRoll || data.modules.allInOne) : true)
              );
              if (active) {
                localStorage.setItem("officex_subscription", "active");
                localStorage.setItem("officex_owner_subscribed", "true");
                localStorage.setItem("officex_subscription_status", "active");
                localStorage.setItem("officex_rentroll_subscribed", "true");
                localStorage.setItem(`officex_sub_${storedEmail}`, "active");
                if (data.subscribed_sqft) {
                  localStorage.setItem("officex_subscribed_sqft", String(data.subscribed_sqft));
                }
              } else if (data && data.subscribed === false) {
                localStorage.setItem(`officex_sub_${storedEmail}`, "inactive");
                localStorage.removeItem("officex_subscription");
                localStorage.removeItem("officex_owner_subscribed");
                localStorage.removeItem("officex_subscription_status");
                localStorage.removeItem("officex_rentroll_subscribed");
              }
            }
          } catch {
            // Non-blocking
          }
        }
        setCheckingSub(false);
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

  // Tax Configuration loaded from Admin Pricing Settings
  const [taxConfig, setTaxConfig] = useState<{
    gstMode: "inclusive" | "exclusive";
    gstRatePct: number;
    sacCode: string;
  }>({
    gstMode: "exclusive",
    gstRatePct: 18,
    sacCode: "997212",
  });

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data?.pricing?.taxConfig) {
          setTaxConfig(data.pricing.taxConfig);
        }
      })
      .catch(() => {});
  }, []);

  // Area Scope State (User enters / selects their property sq.ft)
  const { minAllowedSqft, totalPortfolioSqft } = useUniversalPortfolioSqft(10000);
  const [customSqft, setCustomSqft] = useState<number>(50000);
  const [sliderSqft, setSliderSqft] = useState<number>(50000);

  // Sync with universal portfolio floor
  useEffect(() => {
    if (minAllowedSqft > 0) {
      setCustomSqft((prev) => (prev < minAllowedSqft ? minAllowedSqft : prev));
      setSliderSqft((prev) => (prev < minAllowedSqft ? minAllowedSqft : prev));
    }
  }, [minAllowedSqft]);

  // Quick Preset Sq.Ft Chips
  const dynamicPresets = React.useMemo(() => {
    const base = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    const higher = base.filter((p) => p > minAllowedSqft);
    return [minAllowedSqft, ...higher].slice(0, 6);
  }, [minAllowedSqft]);

  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<SelectedPlanInfo | null>(null);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showPromoField, setShowPromoField] = useState<boolean>(false);
  const [processingActivation, setProcessingActivation] = useState(false);

  const handleSqftChange = (val: number) => {
    const clamped = Math.max(minAllowedSqft, Math.round(val) || 0);
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

  const isRentRollSubscribed = Boolean(
    subStatus?.subscribed &&
    subStatus.plan !== "none" &&
    subStatus.plan !== "free" &&
    (subStatus.modules ? (subStatus.modules.rentRoll || subStatus.modules.allInOne) : true)
  );
  const activeLicensedSqft = Number(subStatus?.subscribed_sqft || 0);

  // Unified Rent Roll SaaS License: Single Fixed Rate of ₹1 per sq.ft
  const SLABS = [
    {
      id: "commercial-suite",
      name: "OfficeX Rent Roll & Billing Suite",
      badge: "Fixed ₹1 / Sq.Ft",
      ratePerSqft: 1,
      target: "Commercial Real Estate Assets & Towers",
      popular: true,
      ctaText: "Select Rent Roll Suite",
      features: [
        "39-Point canonical lease contract master & live register",
        "Automated step escalations with 90-day anniversary alerts",
        "Full Lease-to-Cash billing centre with monthly batch runs",
        "Automated CAM pooling & utility sub-meter ingestion",
        "Statutory 18% GST & Section 194I TDS deduction ledgers",
        "Consolidated portfolio aggregation across multiple assets",
        "Maker-checker approvals & custom institutional RBAC",
        "Occupant self-service portal & digital lease contracts",
      ],
    },
  ];

  // Open checkout modal for plan review with exact sq.ft calculation
  const handleChoosePlan = (slab: typeof SLABS[0], chosenSqft?: number) => {
    const area = chosenSqft || customSqft || 0;
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
      }
    } else {
      setCouponError("Invalid or expired promo code. Please check and try again.");
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

    const baseSubtotal = (plan.sqftNumber * plan.ratePerSqft) || plan.basePriceNum || 50;
    const gstRate = taxConfig.gstRatePct ?? 18;
    const isGstExclusive = (taxConfig.gstMode || "exclusive") === "exclusive";
    const totalAmountWithGst = isGstExclusive
      ? Math.round(baseSubtotal * (1 + gstRate / 100))
      : Math.round(baseSubtotal);
    const priceInRupees = appliedCoupon ? 0 : totalAmountWithGst;
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
            localStorage.setItem("officex_owner_subscribed", "true");
            localStorage.setItem("officex_subscription_status", "active");
            localStorage.setItem("officex_rentroll_subscribed", "true");
            localStorage.setItem("officex_subscribed_sqft", String(plan.sqftNumber));
            sessionStorage.setItem("officex_subscribed_sqft", String(plan.sqftNumber));
            localStorage.setItem("officex_user_email", finalEmail);
            localStorage.setItem("officex_user_name", finalName);
            localStorage.setItem("officex_user_role", "owner");
            localStorage.setItem("officex_selected_plan", plan.id);
            localStorage.setItem("officex_subscription_plan", plan.id);
            localStorage.setItem(`officex_sub_${finalEmail}`, "active");
            sessionStorage.setItem(`officex_sub_${finalEmail}`, "active");
            document.cookie = `officex_sub_${encodeURIComponent(finalEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
            document.cookie = "officex_owner_subscribed=true; path=/; max-age=2592000; SameSite=Lax";
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
                plan_name: plan.name,
                subscribed_sqft: plan.sqftNumber,
                amount: priceInRupees,
              }),
            });
          } catch {
            // Non-blocking
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("officex_rentroll_onboarded", "true");
            localStorage.setItem("officex_onboarding_completed", "1");
            sessionStorage.setItem("officex_onboarding_completed", "1");
            document.cookie = "officex_onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
          }
          setProcessingActivation(false);
          router.push("/properties/rent-roll");
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
    const planId = checkoutPlan?.id || "commercial-suite";
    const activeSqft = checkoutPlan?.sqftNumber || customSqft || 50000;

    setProcessingActivation(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      localStorage.setItem("officex_owner_subscribed", "true");
      localStorage.setItem("officex_subscription_status", "active");
      localStorage.setItem("officex_rentroll_subscribed", "true");
      localStorage.setItem("officex_subscribed_sqft", String(activeSqft));
      sessionStorage.setItem("officex_subscribed_sqft", String(activeSqft));
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
      document.cookie = "officex_owner_subscribed=true; path=/; max-age=2592000; SameSite=Lax";
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
          plan_name: checkoutPlan?.name || "OfficeX Rent Roll & Billing Suite",
          subscribed_sqft: activeSqft,
          amount: 0,
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
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_rentroll_onboarded", "true");
      localStorage.setItem("officex_onboarding_completed", "1");
      sessionStorage.setItem("officex_onboarding_completed", "1");
      document.cookie = "officex_onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
    }
    const target = (userRoleKey && roleDashboards[userRoleKey]) ? roleDashboards[userRoleKey] : "/properties/rent-roll";

    setTimeout(() => {
      router.push(target);
    }, 350);
  };

  return (
    <div className="w-full">
      {/* Active Subscription Banner (if logged-in user already holds an active Rent Roll license) */}
      {!checkingSub && isRentRollSubscribed && (
        <div className="max-w-4xl mx-auto mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-[#0D7B6C] to-teal-900 text-white shadow-xl border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 text-[11px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Active Subscription
              </span>
              {subStatus?.days_remaining !== undefined && (
                <span className="text-[11px] font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-full">
                  {subStatus.days_remaining} days remaining
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              You Already Have an Active {subStatus?.plan_name || "Rent Roll"} Subscription
            </h3>
            <p className="text-xs text-teal-100 font-medium">
              Signed in as <strong className="text-white">{userEmail}</strong>
              {activeLicensedSqft > 0 ? ` · Licensed Capacity: ${activeLicensedSqft.toLocaleString("en-IN")} sq.ft` : ""}
              {totalPortfolioSqft > 0 ? ` · Registered Properties: ${totalPortfolioSqft.toLocaleString("en-IN")} sq.ft` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/properties/rent-roll"
              className="px-5 py-3 rounded-xl bg-white text-[#0D7B6C] hover:bg-teal-50 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <span>Enter Rent Roll Dashboard</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/operate/subscription"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs transition"
            >
              Manage Quota
            </Link>
          </div>
        </div>
      )}

      {/* Universal Minimum Floor Notice if properties registered */}
      {minAllowedSqft > 10000 && (
        <div className="max-w-4xl mx-auto mb-4 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-teal-900 text-xs sm:text-sm">
            <Building2 size={18} className="text-[#0D7B6C] shrink-0" />
            <span>Cumulative Portfolio Size: <strong className="font-mono text-slate-900 font-black">{minAllowedSqft.toLocaleString("en-IN")} Sq.Ft</strong> across registered properties.</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#0D7B6C] text-white tracking-wider self-start sm:self-auto">
            Compulsory Minimum Floor
          </span>
        </div>
      )}

      {/* ──── 1. MASTER PROPERTY AREA (SQ.FT) SELECTOR ──── */}
      <div className="max-w-4xl mx-auto mb-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 text-left">
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
                  Simple, transparent pricing fixed at <strong className="text-slate-800">₹1 per sq.ft / month</strong>. Choose or type your area below:
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min={minAllowedSqft}
                max={Math.max(1000000, minAllowedSqft * 2)}
                step="1000"
                value={Math.max(minAllowedSqft, sliderSqft)}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D7B6C]"
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Select:
              </span>
              {dynamicPresets.map((preset) => (
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
                  {preset === minAllowedSqft && minAllowedSqft > 10000 ? "Min: " : ""}{preset >= 100000 ? `${preset / 100000} Lakh sq.ft` : `${(preset / 1000).toLocaleString("en-IN")}k sq.ft`}
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
            {customSqft < minAllowedSqft && (
              <p className="text-[10px] font-bold text-rose-600 pt-1">
                ⚠️ Compulsory Minimum: Cannot subscribe below {minAllowedSqft.toLocaleString("en-IN")} Sq.Ft.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ──── 2. DEDICATED RENT ROLL PRICING CARD (CENTERED) ──── */}
      <div className="max-w-2xl mx-auto mb-10">
        {SLABS.map((slab) => {
          const totalTierPrice = customSqft * slab.ratePerSqft;
          return (
            <div
              key={slab.id}
              className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white via-white to-teal-50/20 border-2 border-[#0D7B6C] shadow-xl shadow-teal-950/5 ring-4 ring-[#0D7B6C]/10 flex flex-col justify-between transition-all"
            >
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0D7B6C] text-white text-xs font-black tracking-wider uppercase shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles size={13} />
                <span>Fixed ₹1 / Sq.Ft · Rent Roll Suite</span>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {slab.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D7B6C] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    Full Platform Access
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5">
                  Complete commercial lease governance, automated 5% escalations, CAM pooling, GST/TDS accounting &amp; occupant portal.
                </p>

                {/* Clear Per Sq.Ft Rate & Total Calculation Box */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl border border-teal-200/70 mb-6">
                  <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-slate-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Unit Rate</span>
                      <div className="flex flex-wrap items-baseline gap-1.5 mt-0.5">
                        <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                          ₹1
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                          / sq.ft / mo
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          taxConfig.gstMode === "inclusive"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-teal-100 text-teal-800 border border-teal-200"
                        }`}>
                          {taxConfig.gstMode === "inclusive" ? `Inclusive of ${taxConfig.gstRatePct}% GST` : `+ ${taxConfig.gstRatePct}% GST`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Selected Scope</span>
                      <span className="text-base font-black text-slate-800 font-mono">
                        {customSqft.toLocaleString("en-IN")} sq.ft
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                    <span className="text-slate-600 font-semibold">Total Monthly Subscription:</span>
                    <span className="font-mono font-black text-2xl text-[#0D7B6C]">
                      ₹{taxConfig.gstMode === "exclusive"
                        ? Math.round(totalTierPrice * (1 + (taxConfig.gstRatePct ?? 18) / 100)).toLocaleString("en-IN")
                        : totalTierPrice.toLocaleString("en-IN")
                      } <span className="text-xs font-semibold text-slate-500">/ mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {taxConfig.gstMode === "exclusive"
                      ? `Calculation: Base ₹${totalTierPrice.toLocaleString("en-IN")} + ${taxConfig.gstRatePct}% GST (₹${Math.round((totalTierPrice * (taxConfig.gstRatePct ?? 18)) / 100).toLocaleString("en-IN")}) = ₹${Math.round(totalTierPrice * (1 + (taxConfig.gstRatePct ?? 18) / 100)).toLocaleString("en-IN")}`
                      : `Calculation: Total ₹${totalTierPrice.toLocaleString("en-IN")} (Includes ${taxConfig.gstRatePct}% GST: ₹${Math.round(totalTierPrice - totalTierPrice / (1 + (taxConfig.gstRatePct ?? 18) / 100)).toLocaleString("en-IN")})`
                    }
                  </p>
                </div>

                {/* Features 2-column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-left">
                  {slab.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                      <Check
                        size={15}
                        className="shrink-0 mt-0.5 text-[#0D7B6C] stroke-[2.5]"
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2.5">
                {isRentRollSubscribed ? (
                  <>
                    <Link
                      href="/properties/rent-roll"
                      className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={17} />
                      <span>Active Subscription · Enter Rent Roll Dashboard</span>
                      <ArrowRight size={16} />
                    </Link>
                    {customSqft > activeLicensedSqft && activeLicensedSqft > 0 && (
                      <button
                        type="button"
                        onClick={() => handleChoosePlan(slab)}
                        disabled={processingActivation}
                        className="w-full py-2.5 px-5 rounded-xl font-bold text-xs bg-teal-50 hover:bg-teal-100 text-[#0D7B6C] border border-teal-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={14} />
                        <span>Expand Quota to {customSqft.toLocaleString("en-IN")} sq.ft (₹{totalTierPrice.toLocaleString("en-IN")}/mo)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleChoosePlan(slab)}
                    disabled={processingActivation}
                    className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-md bg-[#0D7B6C] hover:bg-[#0A6357] text-white shadow-[#0D7B6C]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {processingActivation && checkoutPlan?.id === slab.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening Payment Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>
                          Subscribe to Rent Roll · ₹{totalTierPrice.toLocaleString("en-IN")} / month
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
                <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Check size={12} className="stroke-[3]" /> Instant Activation
                  </span>
                  <span>•</span>
                  <span>Zero Setup Fees</span>
                  <span>•</span>
                  <span>GST Invoice SAC 997212</span>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-hidden">
          <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl text-left my-auto animate-in fade-in zoom-in-95 duration-150">
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
            {userEmail && isAuthLoaded ? (
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
                    href="/login?redirect=/operate/rent-roll/pricing"
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

              {/* Dynamic Subtotal & GST Line Items */}
              {(() => {
                const basePrice = checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft;
                const gstRate = taxConfig.gstRatePct ?? 18;
                const isExclusive = (taxConfig.gstMode || "exclusive") === "exclusive";
                const gstAmount = isExclusive
                  ? Math.round((basePrice * gstRate) / 100)
                  : Math.round(basePrice - basePrice / (1 + gstRate / 100));
                const totalGross = isExclusive ? basePrice + gstAmount : basePrice;

                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">
                        {isExclusive ? "Net Base Subtotal:" : "Gross Subtotal (Incl. Tax):"}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{basePrice.toLocaleString("en-IN")}.00
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">
                        Statutory GST ({gstRate}% · SAC {taxConfig.sacCode || "997212"}):
                      </span>
                      <span className={`font-mono font-bold ${isExclusive ? "text-slate-800" : "text-emerald-700 font-semibold"}`}>
                        {isExclusive ? `+₹${gstAmount.toLocaleString("en-IN")}.00` : `₹${gstAmount.toLocaleString("en-IN")}.00 (Included)`}
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
                          -₹{totalGross.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Total Due */}
            {(() => {
              const basePrice = checkoutPlan.sqftNumber * checkoutPlan.ratePerSqft;
              const gstRate = taxConfig.gstRatePct ?? 18;
              const isExclusive = (taxConfig.gstMode || "exclusive") === "exclusive";
              const gstAmount = isExclusive ? Math.round((basePrice * gstRate) / 100) : 0;
              const totalGross = basePrice + gstAmount;

              return (
                <div className="flex justify-between items-baseline mb-4 px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">Total Due:</span>
                  <div className="text-right">
                    {appliedCoupon ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono line-through text-slate-400">
                          ₹{totalGross.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-2xl font-black text-emerald-600 font-mono">
                          ₹0.00 FREE
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          ₹{totalGross.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {isExclusive ? `Includes ${gstRate}% GST` : `All taxes included`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Promo Code Input - Always Visible & Interactive */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag size={13} className="text-[#0D7B6C]" />
                  <span>Have a Promo Voucher or Coupon Code?</span>
                </span>
              </div>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo or voucher code"
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
                      Coupon <strong>{appliedCoupon}</strong> Applied: <strong>Discount Activated!</strong>
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
                      <span>Activate Access &amp; Enter Dashboard</span>
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

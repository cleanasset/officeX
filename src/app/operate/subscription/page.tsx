"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  Layers,
  Sparkles,
  CreditCard,
  Plus,
  X,
  Receipt,
  AlertCircle,
  AlertTriangle,
  Sliders,
  TrendingUp,
  Maximize2,
  Lock,
  Tag,
  Check,
  Gift
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import { SUBSCRIPTION_PLAN_OPTIONS } from "@/components/SubscriptionGate";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

export default function SubscriptionAndQuotaPage() {
  const [loading, setLoading] = useState(true);

  // Synchronous cache hydration
  const [subData, setSubData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const isSub =
        localStorage.getItem("officex_subscription") === "active" ||
        localStorage.getItem("officex_subscription_status") === "active" ||
        localStorage.getItem("officex_owner_subscribed") === "true";
      const storedSqft = Number(localStorage.getItem("officex_subscribed_sqft")) || 0;
      if (isSub) {
        return {
          subscribed: true,
          plan: "commercial-suite",
          plan_name: "OfficeX Commercial Suite",
          subscribed_sqft: storedSqft > 0 ? storedSqft : 50000,
          days_remaining: 30,
        };
      }
    }
    return null;
  });

  const [portfolioData, setPortfolioData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const cachedPort = Number(localStorage.getItem("officex_total_portfolio_sqft"));
      if (cachedPort && cachedPort > 0) {
        return { totalPortfolioSqft: cachedPort };
      }
    }
    return null;
  });

  // Interactive Subscription & Pricing Form State (for unsubscribed mode)
  const [customSqft, setCustomSqft] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const port = Number(localStorage.getItem("officex_total_portfolio_sqft"));
      if (port && port > 0) return Math.max(10000, port);
    }
    return 25000;
  });
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Upgrade Modal State (for subscribed mode)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [modalAddSqft, setModalAddSqft] = useState<number>(25000);
  const [modalCouponCode, setModalCouponCode] = useState("");
  const [modalCouponApplied, setModalCouponApplied] = useState<string | null>(null);
  const [modalCouponMsg, setModalCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [upgradingModal, setUpgradingModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "") : "";

      const [statusRes, areaRes] = await Promise.all([
        fetch(`/api/subscription/status?email=${encodeURIComponent(email)}`, { headers: authHeaders }).catch(() => null),
        fetch("/api/subscription/portfolio-area", { headers: authHeaders }).catch(() => null),
      ]);

      if (statusRes && statusRes.ok) {
        const sJson = await statusRes.json();
        setSubData(sJson);
        if (sJson.subscribed_sqft && typeof window !== "undefined") {
          localStorage.setItem("officex_subscribed_sqft", String(sJson.subscribed_sqft));
        }
      }

      if (areaRes && areaRes.ok) {
        const aJson = await areaRes.json();
        setPortfolioData(aJson);
        if (aJson.totalPortfolioSqft && typeof window !== "undefined") {
          localStorage.setItem("officex_total_portfolio_sqft", String(aJson.totalPortfolioSqft));
          setCustomSqft((prev) => Math.max(prev, Number(aJson.totalPortfolioSqft)));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = Boolean(subData?.subscribed && subData.plan && subData.plan !== "none" && subData.plan !== "free");
  const RATE_PER_SQFT = 1; // Fixed ₹1.00 / sq.ft / month

  // Portfolio Area Floor
  const currentPortfolioSqft = Number(
    portfolioData?.totalPortfolioSqft || portfolioData?.totalAreaSqft || portfolioData?.totalArea || 0
  );
  const minAllowedSqft = Math.max(1000, currentPortfolioSqft);

  // Active Capacity
  const storedCustomCap = typeof window !== "undefined" ? Number(localStorage.getItem("officex_subscribed_sqft")) : 0;
  const currentCapSqft = Number(subData?.subscribed_sqft || 0) || storedCustomCap || (isSubscribed ? 50000 : 0);
  const remainingSqft = currentCapSqft > 0 ? Math.max(0, currentCapSqft - currentPortfolioSqft) : 0;
  const currentUsagePct = currentCapSqft > 0 ? Math.min(100, Math.round((currentPortfolioSqft / currentCapSqft) * 100)) : 0;
  const daysRemainingInCycle = isSubscribed ? (subData?.days_remaining || 30) : 0;

  // Unsubscribed Page Calculations
  const durationDiscountPct =
    durationMonths === 12 ? 20 :
    durationMonths === 6 ? 10 :
    durationMonths === 3 ? 5 : 0;

  const effectiveSubscribeSqft = Math.max(customSqft, minAllowedSqft);
  const baseMonthlyPrice = effectiveSubscribeSqft * RATE_PER_SQFT;
  const grossTotal = baseMonthlyPrice * durationMonths;
  const durationDiscountAmount = Math.round(grossTotal * (durationDiscountPct / 100));
  const netTaxable = grossTotal - durationDiscountAmount;
  const gstAmount = Math.round(netTaxable * 0.18);
  const is100PercentDiscount = couponApplied === "RENTROLL12" || couponApplied === "OFFICEX100" || couponApplied === "FREE100";
  const finalPayableRupees = is100PercentDiscount ? 0 : netTaxable + gstAmount;

  // Modal Upgrade Calculations
  const modalProjectedCap = currentCapSqft + modalAddSqft;
  const modalBaseCost = modalAddSqft * RATE_PER_SQFT;
  const modalGst = Math.round(modalBaseCost * 0.18);
  const isModal100Free = modalCouponApplied === "RENTROLL12" || modalCouponApplied === "OFFICEX100" || modalCouponApplied === "FREE100";
  const modalTotalPayable = isModal100Free ? 0 : modalBaseCost + modalGst;

  // Coupon Handler for Main Page
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;
    if (clean === "OFFICEX100" || clean === "RENTROLL12" || clean === "FREE100") {
      setCouponApplied(clean);
      setCouponMsg({ text: `🎉 Promo code '${clean}' applied: 100% Free Plan Access (₹0)!`, type: "success" });
    } else {
      setCouponMsg({ text: "Invalid promo code. Please enter OFFICEX100 or RENTROLL12.", type: "error" });
    }
  };

  // Coupon Handler for Modal
  const handleApplyModalCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = modalCouponCode.trim().toUpperCase();
    if (!clean) return;
    if (clean === "OFFICEX100" || clean === "RENTROLL12" || clean === "FREE100") {
      setModalCouponApplied(clean);
      setModalCouponMsg({ text: `🎉 Promo code '${clean}' applied: 100% Free Capacity Grant!`, type: "success" });
    } else {
      setModalCouponMsg({ text: "Invalid promo code. Try OFFICEX100.", type: "error" });
    }
  };

  // Subscribe Action (from unsubscribed page)
  const handleActivateSubscription = async () => {
    try {
      setProcessingPayment(true);
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "active_user") : "active_user";
      const planId = "commercial-suite";
      const planName = "OfficeX Commercial Suite";

      const persistSuccess = async (paymentId: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_subscription", "active");
          localStorage.setItem("officex_subscription_status", "active");
          localStorage.setItem("officex_owner_subscribed", "true");
          localStorage.setItem("officex_rentroll_subscribed", "true");
          localStorage.setItem("officex_subscription_plan", planId);
          localStorage.setItem("officex_selected_plan", planId);
          localStorage.setItem("officex_subscribed_sqft", String(effectiveSubscribeSqft));
          document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
          document.cookie = "officex_owner_subscribed=true; path=/; max-age=31536000; SameSite=Lax";
          window.dispatchEvent(new Event("officex-subscription-changed"));
        }

        await fetch("/api/subscription/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            coupon: couponApplied || "none",
            paymentId,
            plan: planId,
            plan_name: planName,
            subscribed_sqft: effectiveSubscribeSqft,
            duration_months: durationMonths,
            billing_cycle: durationMonths === 12 ? "annual" : durationMonths === 6 ? "half_yearly" : durationMonths === 3 ? "quarterly" : "monthly",
            amount: finalPayableRupees,
          }),
        }).catch(() => {});

        setSubData({
          subscribed: true,
          plan: planId,
          plan_name: planName,
          subscribed_sqft: effectiveSubscribeSqft,
          days_remaining: durationMonths * 30,
        });

        setSuccessToast(`🎉 Subscription to ${planName} (${effectiveSubscribeSqft.toLocaleString("en-IN")} sq.ft) activated successfully!`);
        setTimeout(() => setSuccessToast(null), 6000);
        await loadData();
      };

      if (is100PercentDiscount || finalPayableRupees === 0) {
        await persistSuccess(`FREE_${couponApplied || "RENTROLL12"}_${Date.now()}`);
        return;
      }

      await initiateRazorpayPayment({
        amount: finalPayableRupees * 100, // in paise
        receipt: `SUB_${Date.now()}`,
        description: `OfficeX Commercial Suite - ${effectiveSubscribeSqft.toLocaleString("en-IN")} sq.ft`,
        prefillEmail: email,
        notes: {
          rate: "1 INR per sqft",
          sqft: String(effectiveSubscribeSqft),
          duration_months: String(durationMonths),
        },
        onSuccess: async (response) => {
          await persistSuccess(response.razorpay_payment_id);
        },
        onFailure: (err) => {
          alert(`Payment failed: ${err?.description || err?.message || "Please try again."}`);
        },
      });
    } catch (e: any) {
      console.error(e);
      alert("Could not initiate payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Modal Expand Capacity Action
  const handleExecuteModalUpgrade = async () => {
    try {
      setUpgradingModal(true);
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "active_user") : "active_user";
      const finalCap = modalProjectedCap;

      const persistCapacity = async (paymentId: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_subscribed_sqft", String(finalCap));
          localStorage.setItem("officex_subscription", "active");
          window.dispatchEvent(new Event("officex-subscription-changed"));
        }

        await fetch("/api/subscription/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            coupon: modalCouponApplied || "none",
            paymentId,
            plan: "commercial-suite",
            plan_name: "OfficeX Commercial Suite",
            subscribed_sqft: finalCap,
            duration_months: 12,
            billing_cycle: "annual",
            amount: modalTotalPayable,
          }),
        }).catch(() => {});

        setSubData((prev: any) => ({
          ...(prev || {}),
          subscribed: true,
          subscribed_sqft: finalCap,
        }));

        setSuccessToast(`✓ Capacity expanded to ${finalCap.toLocaleString("en-IN")} sq.ft successfully!`);
        setUpgradeModalOpen(false);
        setTimeout(() => setSuccessToast(null), 5000);
        await loadData();
      };

      if (isModal100Free || modalTotalPayable === 0) {
        await persistCapacity(`FREE_EXPAND_${Date.now()}`);
        return;
      }

      await initiateRazorpayPayment({
        amount: modalTotalPayable * 100,
        receipt: `EXP_${Date.now()}`,
        description: `OfficeX Quota Expansion (+${modalAddSqft.toLocaleString("en-IN")} sq.ft)`,
        prefillEmail: email,
        notes: {
          added_sqft: String(modalAddSqft),
          new_total_cap: String(finalCap),
        },
        onSuccess: async (response) => {
          await persistCapacity(response.razorpay_payment_id);
        },
        onFailure: (err) => {
          alert(`Payment failed: ${err?.description || err?.message || "Please try again."}`);
        },
      });
    } catch {
      alert("Failed to expand capacity. Please try again.");
    } finally {
      setUpgradingModal(false);
    }
  };

  // Skeleton Loader while loading initial state
  if (loading && !subData && !portfolioData) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
            <div className="h-8 w-72 bg-slate-200 rounded-lg"></div>
            <div className="h-3 w-96 bg-slate-100 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-7 w-36 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-100 rounded pt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // CASE 1: UNSUBSCRIBED USER — SHOW SUBSCRIPTION PAGE & PRICING DIRECTLY
  // ════════════════════════════════════════════════════════════════════════
  if (!isSubscribed) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
        {/* Breadcrumb & Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Link href="/dashboard/owner" className="hover:text-slate-800 transition">
              Portfolio
            </Link>
            <span>/</span>
            <span className="text-[#0F8B7D] font-bold">Subscription &amp; Capacity</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="text-[#0F8B7D] w-7 h-7 shrink-0" />
                <span>Commercial Operating License</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Subscribe to activate Rent Roll, automated step escalations, CAM pooling, and GST invoicing.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold shadow-2xs">
              <Lock size={14} className="text-amber-700" />
              <span>Free Operational Mode (Unsubscribed)</span>
            </div>
          </div>
        </div>

        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in shadow-xs">
            <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block text-sm font-bold">Subscription Activated!</strong>
              {successToast}
            </div>
          </div>
        )}

        {/* Hero Plan Overview Banner — Single Fixed Rate ₹1/sq.ft */}
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-teal-900 via-[#0F8B7D] to-teal-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
              Single Fixed Rate · No Multiple Tiers
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">OfficeX Commercial Suite</h2>
            <p className="text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
              One unified rate covering your entire commercial property operation. No feature tiers, no hidden charges.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-teal-100/90 pt-1 font-semibold">
              <span>✓ 39-Point Canonical Rent Roll</span>
              <span>✓ Automated Step Escalations</span>
              <span>✓ CAM Pools &amp; True-Up</span>
              <span>✓ GST / TDS Invoicing</span>
              <span>✓ Occupant Portal</span>
            </div>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-teal-200 block">Official Rate</span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white">₹1.00</span>
              <span className="text-xs font-bold text-teal-100">/ sq.ft / mo</span>
            </div>
            <span className="text-[11px] text-teal-200 font-medium block mt-1">
              Pay strictly for the square footage you operate
            </span>
          </div>
        </div>

        {/* Portfolio Floor Notice (if properties already onboarded) */}
        {minAllowedSqft > 1000 && (
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Registered Properties Floor: {minAllowedSqft.toLocaleString("en-IN")} Sq.Ft
                </span>
                <span className="text-[11px] text-teal-800 font-medium">
                  Your subscription automatically scales to cover your active registered assets.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-200 text-teal-900 self-start sm:self-auto">
              Portfolio Floor Applied
            </span>
          </div>
        )}

        {/* Square Footage Selector Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                1. Select Managed Square Footage (Sq.Ft)
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Choose the total leasable area you wish to license on OfficeX.
              </span>
            </div>
            <div className="relative w-full sm:w-56">
              <input
                type="number"
                min={minAllowedSqft}
                step="5000"
                value={customSqft}
                onChange={(e) => setCustomSqft(Math.max(minAllowedSqft, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2 pr-14 rounded-xl border-2 border-slate-300 bg-white text-base font-mono font-black text-slate-900 text-right focus:border-[#0F8B7D] outline-none shadow-2xs"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">sq.ft</span>
            </div>
          </div>

          {/* Quick Increment Preset Chips */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {[10000, 25000, 50000, 100000, 250000, 500000, 1000000, 5000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomSqft(Math.max(minAllowedSqft, preset))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    customSqft === preset
                      ? "bg-[#0F8B7D] text-white shadow-2xs"
                      : "bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {preset >= 10000000 ? `${preset / 10000000} Cr` : preset >= 100000 ? `${preset / 100000} Lakh` : `${preset / 1000}k`} sq.ft
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Duration Selector */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                2. Select Billing Commitment Duration
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Longer commitments receive automated annual discounts.
              </span>
            </div>
            {durationDiscountPct > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-300">
                Save {durationDiscountPct}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { months: 1, label: "1 Month", tag: "Monthly", discount: 0 },
              { months: 3, label: "3 Months", tag: "Quarterly", discount: 5 },
              { months: 6, label: "6 Months", tag: "Half-Year", discount: 10 },
              { months: 12, label: "12 Months", tag: "Annual (Best Value)", discount: 20 },
            ].map((d) => (
              <button
                key={d.months}
                type="button"
                onClick={() => setDurationMonths(d.months)}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  durationMonths === d.months
                    ? "border-[#0F8B7D] bg-teal-50/70 text-slate-900 shadow-2xs font-black ring-1 ring-[#0F8B7D]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-xs sm:text-sm font-black">{d.label}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${d.discount > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                  {d.discount > 0 ? `${d.discount}% OFF` : d.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Money Calculation & Breakdown Card ("Money Info") */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="text-teal-400 w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                Live Pricing &amp; Commercial Calculation
              </h3>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
              SAC 997212 (Real Estate SaaS)
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Licensed Managed Area:</span>
              <span className="font-mono font-bold text-white text-sm">
                {effectiveSubscribeSqft.toLocaleString("en-IN")} sq.ft
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Single Fixed Rate:</span>
              <span className="font-mono font-bold text-teal-300">
                ₹1.00 / sq.ft / month
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Monthly Base Fee:</span>
              <span className="font-mono font-bold text-white">
                ₹{baseMonthlyPrice.toLocaleString("en-IN")} / mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Duration Multiplier:</span>
              <span className="font-mono text-slate-400">
                × {durationMonths} Month{durationMonths > 1 ? "s" : ""}
              </span>
            </div>

            {durationDiscountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Duration Discount ({durationDiscountPct}%):</span>
                <span className="font-mono">-₹{durationDiscountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400">
              <span>Net Taxable Amount:</span>
              <span className="font-mono font-bold text-white">
                ₹{netTaxable.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Applicable GST (18%):</span>
              <span className="font-mono font-bold text-white">
                ₹{gstAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Final Total Amount Payable */}
            <div className="flex items-baseline justify-between pt-3 border-t-2 border-slate-700 text-white">
              <div>
                <span className="text-sm font-black tracking-tight block">Total Amount Payable</span>
                <span className="text-[10px] text-slate-400">Inclusive of all taxes &amp; updates</span>
              </div>
              <div className="text-right">
                {is100PercentDiscount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm line-through text-slate-500 font-mono">
                      ₹{(netTaxable + gstAmount).toLocaleString("en-IN")}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹0 FREE</span>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
                    ₹{finalPayableRupees.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Partner / Promo Code (e.g. OFFICEX100, RENTROLL12)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs uppercase focus:border-teal-400 outline-none"
              />
              <Gift size={15} className="absolute right-3 top-3 text-slate-400" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition cursor-pointer shrink-0"
            >
              Apply Code
            </button>
          </form>

          {couponMsg && (
            <p className={`text-xs font-semibold ${couponMsg.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
              {couponMsg.text}
            </p>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={processingPayment}
            onClick={handleActivateSubscription}
            className="w-full py-4 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <CreditCard size={18} />
            <span>
              {processingPayment
                ? "Processing Activation..."
                : is100PercentDiscount
                ? "Activate 100% Free Lifetime Workspace (₹0)"
                : `Pay ₹${finalPayableRupees.toLocaleString("en-IN")} & Activate License`}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // CASE 2: SUBSCRIBED USER — SHOW ACTIVE QUOTA DASHBOARD + CAPACITY EXPANSION MODAL
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Link href="/properties/rent-roll" className="hover:text-slate-800 transition">
              Rent Roll
            </Link>
            <span>/</span>
            <span className="text-[#0F8B7D] font-bold">Subscription &amp; Capacity Quota</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-[#0F8B7D] w-6 h-6 shrink-0" />
              <span>Subscription &amp; Capacity Quota</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Active License: OfficeX Commercial Suite (₹1/sq.ft)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Current active licensing tier, managed portfolio square footage, and capacity quota.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Sq.Ft Quota</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block text-sm font-bold">Success!</strong>
            {successToast}
          </div>
        </div>
      )}

      {/* 5-Day Expiration Red Warning Alert Banner */}
      {daysRemainingInCycle <= 5 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-rose-900">
                  {daysRemainingInCycle <= 1 ? "⚠️ License Expires Within 24 Hours!" : `⚠️ License Expiring in ${daysRemainingInCycle} Days!`}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                  Renewal Required
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-semibold">
                Your OfficeX Commercial Suite license expires {subData?.ends_at ? `on ${new Date(subData.ends_at).toLocaleDateString("en-IN")}` : "soon"}. Renew now to maintain uninterrupted access to Rent Roll registers and lease invoicing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition shadow-xs cursor-pointer shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Renew License (₹1/sq.ft)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Tier */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active Plan</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 leading-snug">OfficeX Commercial Suite</span>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Rate</span>
            <strong className="text-teal-700 font-bold">₹1.00 / sq.ft / mo</strong>
          </div>
        </div>

        {/* Card 2: Total Licensed Cap */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Licensed Cap</span>
            <Layers size={14} className="text-[#0F8B7D]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {currentCapSqft.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">sq.ft</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Renewal</span>
            <strong className={`font-bold ${daysRemainingInCycle <= 5 ? "text-rose-600 font-black animate-pulse flex items-center gap-1" : "text-slate-700"}`}>
              {daysRemainingInCycle <= 5 && <AlertTriangle size={12} className="text-rose-600" />}
              {daysRemainingInCycle <= 0 ? "Expired Today" : `${daysRemainingInCycle} Day${daysRemainingInCycle === 1 ? "" : "s"} Left`}
            </strong>
          </div>
        </div>

        {/* Card 3: Currently Managed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Managed Area</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              {currentUsagePct}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-teal-900 font-mono">
              {currentPortfolioSqft.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] sm:text-xs text-teal-600 font-medium">sq.ft</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Properties</span>
            <strong className="text-slate-700 font-bold">
              {portfolioData?.properties?.length || 0} Registered
            </strong>
          </div>
        </div>

        {/* Card 4: Remaining Headroom */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Available Headroom</span>
            {remainingSqft <= 0 ? (
              <AlertCircle size={14} className="text-rose-600" />
            ) : (
              <CheckCircle2 size={14} className="text-emerald-600" />
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg sm:text-xl font-black font-mono ${remainingSqft <= 0 ? "text-rose-700" : "text-emerald-700"}`}>
              {remainingSqft.toLocaleString("en-IN")}
            </span>
            <span className={`text-[10px] sm:text-xs font-medium ${remainingSqft <= 0 ? "text-rose-500" : "text-emerald-600"}`}>sq.ft</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Status</span>
            <strong className={remainingSqft <= 0 ? "text-rose-700 font-bold" : "text-emerald-700 font-bold"}>
              {remainingSqft <= 0 ? "Quota Exhausted" : "Unused Headroom"}
            </strong>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
            Portfolio Area Allocation
          </span>
          <span className="font-mono text-slate-600">
            {currentPortfolioSqft.toLocaleString("en-IN")} / {currentCapSqft.toLocaleString("en-IN")} sq.ft ({currentUsagePct}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              currentUsagePct > 90 ? "bg-rose-500" : currentUsagePct > 70 ? "bg-amber-500" : "bg-[#0F8B7D]"
            }`}
            style={{ width: `${Math.max(2, currentUsagePct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>0 sq.ft managed</span>
          <span>{remainingSqft.toLocaleString("en-IN")} sq.ft remaining headroom</span>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Properties Contributing to Quota</h3>
          <p className="text-xs text-slate-500">Active commercial assets tallied towards your licensed square footage</p>
        </div>

        {portfolioData?.properties && portfolioData.properties.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {portfolioData.properties.map((prop: any, idx: number) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-[#0F8B7D]" />
                  <div>
                    <span className="font-bold text-slate-900 block">{prop.name || `Property #${idx + 1}`}</span>
                    <span className="text-[11px] text-slate-400">{prop.address || "Commercial Asset"}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {Number(prop.area || prop.sqft || 0).toLocaleString("en-IN")} sq.ft
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl p-4">
            <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No properties currently registered</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When you onboard properties in the Property Registry, their area automatically tallies against this quota.
            </p>
            <Link
              href="/properties/registry"
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0c6e63] transition"
            >
              <Plus size={13} /> Add Property
            </Link>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          CAPACITY EXPANSION MODAL (WITH STICKY HEADER, CLOSE BUTTON & MONEY INFO)
         ════════════════════════════════════════════════════════════════════════ */}
      {upgradeModalOpen && (
        <div 
          onClick={() => setUpgradeModalOpen(false)}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-hidden"
          >
            {/* 1. Sticky Header with Prominent Close Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <Maximize2 size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Add Square Footage Quota</h3>
                  <p className="text-xs text-slate-500">Fixed rate: ₹1.00 / sq.ft</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Desired Additional Sq.Ft Selector */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Desired Additional Square Footage:
                  </label>
                  <span className="text-xs font-black font-mono text-[#0F8B7D] bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    +{modalAddSqft.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>

                {/* Increment Chips */}
                <div className="flex flex-wrap gap-2">
                  {[5000, 10000, 25000, 50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setModalAddSqft(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        modalAddSqft === val
                          ? "bg-[#0F8B7D] text-white shadow-2xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      +{val >= 100000 ? `${val / 100000} Lakh` : `${val / 1000}k`} sq.ft
                    </button>
                  ))}
                </div>

                {/* Direct Number Input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Or type exact number:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={modalAddSqft}
                      onChange={(e) => setModalAddSqft(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 pr-16 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:border-[#0F8B7D] outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">sq.ft</span>
                  </div>
                </div>
              </div>

              {/* Live Capacity Quota Calculation */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <span className="text-xs font-bold text-teal-900 block">Quota Impact:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/90 rounded-xl border border-teal-100">
                    <span className="text-[10px] text-slate-400 block">Current Cap</span>
                    <strong className="font-mono text-slate-900">{currentCapSqft.toLocaleString("en-IN")} sq.ft</strong>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-xl border border-teal-100">
                    <span className="text-[10px] text-teal-700 font-bold block">New Total Cap</span>
                    <strong className="font-mono text-[#0F8B7D] font-black">{modalProjectedCap.toLocaleString("en-IN")} sq.ft</strong>
                  </div>
                </div>
              </div>

              {/* LIVE MONEY INFO BREAKDOWN CARD */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-teal-400 uppercase tracking-wider text-[11px]">Money &amp; Fee Breakdown</span>
                  <span className="font-mono text-[10px] text-slate-400">Fixed Rate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Additional Sq.Ft:</span>
                  <span className="font-mono font-bold text-white">+{modalAddSqft.toLocaleString("en-IN")} sq.ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate:</span>
                  <span className="font-mono font-bold text-teal-300">₹1.00 / sq.ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Expansion Cost:</span>
                  <span className="font-mono font-bold text-white">₹{modalBaseCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span className="font-mono font-bold text-white">₹{modalGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-black">
                  <span>Total Amount:</span>
                  {isModal100Free ? (
                    <span className="font-mono text-emerald-400">₹0 FREE</span>
                  ) : (
                    <span className="font-mono text-teal-300 text-base">₹{modalTotalPayable.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyModalCoupon} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Promo Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. OFFICEX100"
                    value={modalCouponCode}
                    onChange={(e) => setModalCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono focus:border-[#0F8B7D] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {modalCouponMsg && (
                  <p className={`text-xs font-semibold ${modalCouponMsg.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                    {modalCouponMsg.text}
                  </p>
                )}
              </form>
            </div>

            {/* 3. Sticky Footer Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgradingModal || modalAddSqft <= 0}
                onClick={handleExecuteModalUpgrade}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CreditCard size={15} />
                <span>
                  {upgradingModal
                    ? "Processing..."
                    : isModal100Free
                    ? `Expand Capacity (+${modalAddSqft.toLocaleString("en-IN")} sq.ft) · ₹0 Free`
                    : `Pay ₹${modalTotalPayable.toLocaleString("en-IN")} & Add Quota`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

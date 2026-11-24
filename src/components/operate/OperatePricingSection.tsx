"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sliders,
  HelpCircle,
  FileCheck2,
  Users,
  Wrench,
  Layers,
  CreditCard,
  CheckCircle2,
  PhoneCall,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";
import { getClientUserEmail } from "@/lib/auth-storage";

export interface PricingConfigResponse {
  taxConfig?: {
    gstMode: "inclusive" | "exclusive";
    gstRatePct: number;
    sacCode: string;
  };
  cafmSuite: {
    essentialsMonthly: number;
    proMonthly: number;
    enterpriseMonthly: number;
    proRatePerSqft: number;
    enterpriseRatePerSqft: number;
  };
  standaloneModules: {
    rentRoll: {
      ratePerSqft: number;
      starterMonthly: number;
      growthMonthly: number;
      enterpriseMonthly: number;
    };
    ppm: { monthly: number; unit: string; title: string };
    visitor: { monthly: number; unit: string; title: string };
    compliance: { monthly: number; unit: string; title: string };
    leaseCrm: { monthly: number; unit: string; title: string };
    helpdesk: { monthly: number; unit: string; title: string };
  };
}

interface OperatePricingSectionProps {
  id?: string;
  hideHeader?: boolean;
  defaultMode?: "bundle" | "standalone";
  defaultModule?: string;
  activeParamMode?: "bundle" | "standalone";
  activeParamModule?: string;
}

function OperatePricingInner({
  id = "pricing",
  hideHeader = false,
  activeParamMode = "bundle",
  activeParamModule = "",
}: OperatePricingSectionProps) {
  // Pricing tab: "bundle" (CAFM All-In-One) vs "standalone" (A-La-Carte)
  const [pricingMode, setPricingMode] = useState<"bundle" | "standalone">(activeParamMode);
  
  useEffect(() => {
    if (activeParamMode) {
      setPricingMode(activeParamMode);
    }
  }, [activeParamMode]);

  useEffect(() => {
    if (activeParamModule && pricingMode === "standalone") {
      const cleanMod = activeParamModule.toLowerCase().replace(/[^a-z0-9]/g, "");
      const el = document.getElementById(`module-${cleanMod}`) || document.getElementById(`module-${activeParamModule.toLowerCase()}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  }, [activeParamModule, pricingMode]);

  // Billing cycle: "monthly" vs "annual" (15% discount)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  
  // Property square footage for dynamic calculations (default 50,000 sq.ft)
  const [propertySqft, setPropertySqft] = useState<number>(50000);

  // Live admin pricing loaded from API
  const [pricing, setPricing] = useState<PricingConfigResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Promo code state
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a valid code.");
      return;
    }

    if (code === "OFFICEX100" || code === "RENTROLL12" || code === "FREE100") {
      setAppliedPromo(code);
      setPromoError(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_applied_coupon", code);
        sessionStorage.setItem("officex_applied_coupon", code);
        localStorage.setItem("officex_subscription", "active");
        sessionStorage.setItem("officex_subscription", "active");
        localStorage.setItem("officex_subscribed_sqft", String(safeSqft || 50000));
        document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";
        const email = getClientUserEmail();
        if (email) {
          localStorage.setItem(`officex_sub_${email}`, "active");
          document.cookie = `officex_sub_${encodeURIComponent(email)}=active; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
      showToast("🎉 Launch voucher applied! 100% free access granted.", "success");
    } else {
      setPromoError("Invalid or expired code. Please check and try again.");
    }
  };

  useEffect(() => {
    async function loadLivePricing() {
      try {
        const res = await fetch("/api/pricing");
        const data = await res.json();
        if (data.success && data.pricing) {
          setPricing(data.pricing);
        }
      } catch (e) {
        console.error("Failed to load live pricing config:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLivePricing();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Pricing values with resilient defaults
  const cafm = pricing?.cafmSuite || {
    essentialsMonthly: 19999,
    proMonthly: 39999,
    enterpriseMonthly: 79999,
    proRatePerSqft: 2.0,
    enterpriseRatePerSqft: 3.5,
  };

  const standalone = pricing?.standaloneModules || {
    rentRoll: {
      ratePerSqft: 1.0,
      starterMonthly: 9999,
      growthMonthly: 24999,
      enterpriseMonthly: 49999,
    },
    ppm: { monthly: 6999, unit: "per building / mo", title: "52-Week PPM & Asset QR" },
    visitor: { monthly: 1499, unit: "per building / mo", title: "Visitor Flow & Speed-Gate Access" },
    compliance: { monthly: 1999, unit: "per property / mo", title: "Statutory Compliance Calendar" },
    leaseCrm: { monthly: 5999, unit: "per leasing team / mo", title: "Commercial Lease Dealflow CRM" },
    helpdesk: { monthly: 3499, unit: "per building / mo", title: "Tenant Helpdesk & Room Booking" },
  };

  // Helper to calculate discount multiplier
  const annualMultiplier = billingCycle === "annual" ? 0.85 : 1.0;
  const safeSqft = Math.max(1000, propertySqft);

  // Dynamic calculations based on sqft
  const calcProPrice = () => {
    const base = cafm.proMonthly;
    if (safeSqft > 50000) {
      const extraSqft = safeSqft - 50000;
      return Math.round((base + extraSqft * (cafm.proRatePerSqft || 2.0) * 0.1) * annualMultiplier);
    }
    return Math.round(base * annualMultiplier);
  };

  const calcEnterprisePrice = () => {
    const base = cafm.enterpriseMonthly;
    if (safeSqft > 100000) {
      const extraSqft = safeSqft - 100000;
      return Math.round((base + extraSqft * (cafm.enterpriseRatePerSqft || 3.5) * 0.08) * annualMultiplier);
    }
    return Math.round(base * annualMultiplier);
  };

  const calcRentRollPrice = () => {
    return Math.round(safeSqft * 1.0 * annualMultiplier);
  };

  // Per Sq.Ft formatter
  const formatSqftRate = (totalMonthly: number, divisorSqft: number = safeSqft) => {
    const rate = totalMonthly / divisorSqft;
    if (rate >= 1) return rate.toFixed(2);
    if (rate >= 0.01) return rate.toFixed(2);
    return rate.toFixed(3);
  };

  // Razorpay Checkout handler
  const handleCheckout = async (plan: {
    productCode: string;
    planName: string;
    edition: string;
    monthlyPrice: number;
    sqftRate: string;
  }) => {
    if (appliedPromo) {
      showToast("🎉 Launch voucher active! Redirecting to Rent Roll...", "success");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/properties/rent-roll";
        }
      }, 400);
      return;
    }

    const billedAmount = billingCycle === "annual" ? plan.monthlyPrice * 12 : plan.monthlyPrice;
    setProcessingPlan(plan.planName);

    try {
      await initiateRazorpayPayment({
        amount: Math.round(billedAmount * 100), // convert to paise
        receipt: `SUB_${plan.productCode}_${Date.now()}`,
        description: `OfficeX ${plan.planName} (₹${plan.sqftRate}/sq.ft · ${billingCycle === "annual" ? "Annual" : "Monthly"})`,
        notes: {
          productCode: plan.productCode,
          planName: plan.planName,
          edition: plan.edition,
          billingCycle,
          propertySqft: safeSqft.toString(),
          sqftRate: plan.sqftRate,
        },
        onSuccess: async (paymentRes) => {
          try {
            const subRes = await fetch("/api/pricing/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productCode: plan.productCode,
                planName: plan.planName,
                edition: plan.edition,
                amount: billedAmount,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_order_id: paymentRes.razorpay_order_id,
              }),
            });
            const subData = await subRes.json();
            if (subData.success) {
              showToast(`🎉 Subscription activated! Welcome to ${plan.planName}.`, "success");
            } else {
              showToast("Payment received. Subscription activation queued.", "success");
            }
          } catch (e) {
            showToast("Payment confirmed! Activating account access...", "success");
          } finally {
            setProcessingPlan(null);
          }
        },
        onFailure: (err) => {
          console.info("[Checkout] Payment cancelled or modal closed:", err);
          showToast(err?.description || "Payment was cancelled.", "error");
          setProcessingPlan(null);
        },
      });
    } catch (err: any) {
      console.error("Failed to launch Razorpay modal:", err);
      showToast(err?.message || "Could not launch payment gateway. Please try again.", "error");
      setProcessingPlan(null);
    }
  };

  return (
    <section id={id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all ${
          toastMessage.type === "success" 
            ? "bg-slate-900 text-white border border-teal-500/30" 
            : "bg-red-900 text-white border border-red-500/30"
        }`}>
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      {!hideHeader && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-[#0D7B6C] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#0D7B6C]" />
            TRANSPARENT INSTITUTIONAL PRICING
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Invest in the Operating System for Commercial Real Estate
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Get the full <strong>All-in-One CAFM Suite</strong> for end-to-end asset governance, or select any <strong>Individual Module</strong> a-la-carte as your building scales. Every plan displays both total monthly fee and effective <strong>₹ / sq.ft</strong> rate.
          </p>
        </div>
      )}

      {/* Controls Bar: Mode Toggle + Billing Cadence */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-50 border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-2xs">
        {/* Primary Mode: Bundle vs Standalone */}
        <div className="bg-white p-1 rounded-2xl inline-flex items-center border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setPricingMode("bundle")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              pricingMode === "bundle"
                ? "bg-[#0D7B6C] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>All-In-One CAFM Suite</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              pricingMode === "bundle" ? "bg-white/20 text-white" : "bg-teal-100 text-[#0D7B6C]"
            }`}>
              Save 45%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPricingMode("standalone")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              pricingMode === "standalone"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Individual Modules</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              pricingMode === "standalone" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}>
              A-la-Carte
            </span>
          </button>
        </div>

        {/* Billing Cadence Toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs text-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              billingCycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual" ? "bg-[#0D7B6C] text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              billingCycle === "annual" ? "bg-teal-900 text-teal-100" : "bg-emerald-100 text-emerald-800"
            }`}>
              15% OFF
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE SQFT AREA ESTIMATOR & LIVE RATE COMPARATOR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-50/40 via-white to-slate-50 border border-teal-200/80 rounded-3xl p-5 sm:p-6 mb-10 shadow-xs max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0D7B6C]" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Interactive Area &amp; Sq.Ft Rate Calculator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Slide or enter your commercial super built-up area. Monthly price and per sq.ft rates update live across all packages.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Your Campus Size</span>
              <div className="text-xs font-semibold text-slate-600">Super Built-Up Area</div>
            </div>
            <div className="flex items-center bg-white border-2 border-[#0D7B6C]/40 rounded-2xl px-3.5 py-2 shadow-sm">
              <input
                type="number"
                min={5000}
                max={2000000}
                step={5000}
                value={propertySqft}
                onChange={(e) => setPropertySqft(Math.max(1000, Number(e.target.value)))}
                className="w-28 text-base font-black text-slate-900 bg-transparent outline-none font-mono text-right pr-1.5"
              />
              <span className="text-xs font-black text-[#0D7B6C]">sq.ft</span>
            </div>
          </div>
        </div>

        {/* Continuous Range Slider */}
        <div className="py-2">
          <input
            type="range"
            min={10000}
            max={500000}
            step={5000}
            value={propertySqft}
            onChange={(e) => setPropertySqft(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D7B6C]"
          />
        </div>

        {/* Quick Area Presets & Live Comparative Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Presets:</span>
            {[25000, 50000, 100000, 250000, 500000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPropertySqft(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  propertySqft === preset
                    ? "bg-[#0D7B6C] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {(preset / 1000).toLocaleString()}k sq.ft
              </button>
            ))}
          </div>

          {/* Rate Summary Tag */}
          <div className="inline-flex items-center gap-2 bg-teal-100/60 border border-teal-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0D7B6C]">
            <span>CAFM Pro Effective:</span>
            <span className="font-mono text-sm font-black text-slate-900">
              ₹{formatSqftRate(calcProPrice())}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">/ sq.ft / mo</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE A: ALL-IN-ONE CAFM OPERATIONS SUITE BUNDLES
          ───────────────────────────────────────────────────────────── */}
      {pricingMode === "bundle" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 1. Essentials */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase mb-3">
                Single Commercial Asset
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">CAFM Essentials</h3>
              <p className="text-xs text-slate-500 min-h-[34px] leading-relaxed">
                Complete digital operations for standalone office buildings and commercial properties up to 25,000 sq.ft.
              </p>

              {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
              <div className="my-6 pt-6 border-t border-slate-100">
                {/* Main: Per Month */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                    ₹{Math.round(cafm.essentialsMonthly * annualMultiplier).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ month</span>
                </div>

                {/* Below: Per Sq.Ft Rate */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/90 text-sm font-black font-mono text-[#0D7B6C]">
                    ₹{formatSqftRate(Math.round(cafm.essentialsMonthly * annualMultiplier), Math.min(safeSqft, 25000))}
                  </span>
                  <span className="text-xs font-bold text-slate-700">/ sq.ft / month</span>
                  <span className="text-[11px] text-slate-400 font-medium">({Math.min(safeSqft, 25000).toLocaleString()} sq.ft)</span>
                </div>

                {billingCycle === "annual" && (
                  <div className="text-[11px] font-bold text-teal-700 mt-2">
                    Billed annually (₹{(Math.round(cafm.essentialsMonthly * annualMultiplier) * 12).toLocaleString("en-IN")}/yr)
                  </div>
                )}
                <div className="text-[11px] text-slate-400 mt-1">Fixed rate · Includes all 6 SaaS products</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Included in CAFM Essentials:</div>
                {[
                  "Automated Rent Roll & Leases (up to 25 units)",
                  "52-Week PPM preventive maintenance schedule",
                  "Statutory Compliance Tracker (48 licenses)",
                  "Visitor Flow (WhatsApp barcode check-ins)",
                  "Commercial Lease Dealflow CRM",
                  "Tenant Helpdesk & Boardroom booking",
                  "Standard Email & WhatsApp Support",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-[#0D7B6C] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={processingPlan === "CAFM Essentials"}
              onClick={() => handleCheckout({
                productCode: "CAFM",
                planName: "CAFM Essentials",
                edition: "essentials",
                monthlyPrice: Math.round(cafm.essentialsMonthly * annualMultiplier),
                sqftRate: formatSqftRate(Math.round(cafm.essentialsMonthly * annualMultiplier), Math.min(safeSqft, 25000)),
              })}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {processingPlan === "CAFM Essentials" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Subscribe to Essentials</span>
                </>
              )}
            </button>
          </div>

          {/* 2. CAFM Pro Suite — MOST POPULAR */}
          <div className="bg-gradient-to-b from-[#F0FDF4] to-white border-2 border-[#0D7B6C] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative scale-102 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0D7B6C] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300 fill-current" />
              <span>MOST POPULAR · BEST VALUE</span>
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-teal-100 text-[#0D7B6C] text-[11px] font-bold uppercase mb-3 mt-1">
                Commercial Campus &amp; Tech Parks
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">CAFM Pro Suite</h3>
              <p className="text-xs text-slate-600 min-h-[34px] leading-relaxed">
                Institutional-grade operational suite with hardware speed-gate turnstiles, automated CAM true-up, and QR passports.
              </p>

              {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
              <div className="my-6 pt-6 border-t border-teal-200/60">
                {/* Main: Per Month */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                    ₹{calcProPrice().toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">/ month</span>
                </div>

                {/* Below: Per Sq.Ft Rate */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-100 border border-teal-300 text-sm font-black font-mono text-[#0D7B6C]">
                    ₹{formatSqftRate(calcProPrice())}
                  </span>
                  <span className="text-xs font-bold text-slate-800">/ sq.ft / month</span>
                  <span className="text-[11px] text-slate-500 font-medium">({safeSqft.toLocaleString()} sq.ft)</span>
                </div>

                <div className="text-[11px] font-bold text-[#0D7B6C] mt-2">
                  {safeSqft > 50000 
                    ? `Calculated for ${(safeSqft / 1000).toLocaleString()}k sq.ft portfolio`
                    : "Base tier up to 50,000 sq.ft"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Over 50k sq.ft: ₹{(cafm.proRatePerSqft || 2.0).toFixed(1)}/sq.ft/mo
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0D7B6C]">Everything in Essentials, plus:</div>
                {[
                  "Unlimited Leases & Automated Nodal Escrow",
                  "Optical Speed-Gate Turnstile Relay (Boon Edam / Gunnebo)",
                  "Smart Asset QR Passports for HVAC, DG & Lifts",
                  "Automated CAM Common-Area Ledger True-Ups",
                  "Smart Electricity & Water Submetering Splitter",
                  "90-Day Legal Escalations for Statutory Licenses",
                  "Priority 24/7 Facility Support & SLA Manager",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0D7B6C] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={processingPlan === "CAFM Pro Suite"}
              onClick={() => handleCheckout({
                productCode: "CAFM",
                planName: "CAFM Pro Suite",
                edition: "professional",
                monthlyPrice: calcProPrice(),
                sqftRate: formatSqftRate(calcProPrice()),
              })}
              className="w-full py-4 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {processingPlan === "CAFM Pro Suite" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Subscribe to Pro Suite (₹{formatSqftRate(calcProPrice())}/sq.ft)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* 3. Enterprise IWMS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase mb-3">
                REIT &amp; Multi-City Portfolios
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">CAFM Enterprise IWMS</h3>
              <p className="text-xs text-slate-500 min-h-[34px] leading-relaxed">
                Integrated workplace management for multi-asset institutional owners, institutional developers, and commercial REITs.
              </p>

              {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
              <div className="my-6 pt-6 border-t border-slate-100">
                {/* Main: Per Month */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                    ₹{calcEnterprisePrice().toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ month</span>
                </div>

                {/* Below: Per Sq.Ft Rate */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-sm font-black font-mono text-indigo-700">
                    ₹{formatSqftRate(calcEnterprisePrice())}
                  </span>
                  <span className="text-xs font-bold text-slate-700">/ sq.ft / month</span>
                  <span className="text-[11px] text-slate-400 font-medium">({safeSqft.toLocaleString()} sq.ft)</span>
                </div>

                <div className="text-[11px] font-bold text-indigo-700 mt-2">
                  Multi-property portfolio aggregation
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Custom deployment &amp; ERP integrations</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise Capabilities:</div>
                {[
                  "Multi-Property Roll-up & Executive C-Suite Dashboard",
                  "Direct SAP, Oracle & Tally Accounting Synchronizer",
                  "Custom Hardware Turnstile & Access Controller Relays",
                  "Auditor-Grade Institutional Statutory Compliance Vault",
                  "Dedicated Solutions Engineer & On-Site System Onboarding",
                  "99.9% Uptime SLA Guarantee with Financial Penalty",
                  "Tailored Custom Workflows & Data Migration Support",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={processingPlan === "CAFM Enterprise IWMS"}
                onClick={() => handleCheckout({
                  productCode: "CAFM",
                  planName: "CAFM Enterprise IWMS",
                  edition: "enterprise",
                  monthlyPrice: calcEnterprisePrice(),
                  sqftRate: formatSqftRate(calcEnterprisePrice()),
                })}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "CAFM Enterprise IWMS" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Instant Online Activation</span>
                  </>
                )}
              </button>
              <Link
                href="/operate/rent-roll#contact"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>Request Custom RFP &amp; Pilot</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE B: INDIVIDUAL STANDALONE SAAS MODULES (A-LA-CARTE)
          ───────────────────────────────────────────────────────────── */}
      {pricingMode === "standalone" && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Purchase only the specific capability your commercial property needs today. Every module displays both monthly fee and effective <strong>₹ / sq.ft</strong> rate.</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Instant Razorpay Activation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Rent Roll */}
            <div
              id="module-rentroll"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "rentroll" || activeParamModule === "rent-roll"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0D7B6C]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {(activeParamModule === "rentroll" || activeParamModule === "rent-roll") ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#0D7B6C] px-2.5 py-1 rounded-full">
                      SaaS Module 1
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">Automated Rent Roll &amp; Billing</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Lease abstraction, anniversary escalation automation, CAM pooling true-ups, and bank nodal escrow.
                </p>

                {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{calcRentRollPrice().toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ month</span>
                  </div>

                  {/* Below: Per Sq.Ft Rate */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-xs font-black font-mono text-[#0D7B6C]">
                      ₹{formatSqftRate(calcRentRollPrice())}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">/ sq.ft / mo</span>
                    <span className="text-[10px] text-slate-400">({safeSqft.toLocaleString()} sq.ft)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>5% Auto-escalation anniversary alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Automated CAM common area cost pooling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Lease OCR abstraction &amp; bank escrow</span>
                  </div>
                </div>
              </div>

              {/* Promo / Launch Voucher Code Box */}
              <div className="pt-3 pb-2 border-t border-slate-100 my-2">
                {!showPromo && !appliedPromo ? (
                  <button
                    type="button"
                    onClick={() => setShowPromo(true)}
                    className="text-[11px] font-semibold text-[#0D7B6C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Have a promo or voucher code?</span>
                  </button>
                ) : appliedPromo ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Code {appliedPromo} Applied (100% Free Access)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode("");
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError(null);
                        }}
                        placeholder="Enter promo code"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#0D7B6C]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="px-3 py-1 bg-[#0D7B6C] hover:bg-[#0B685B] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-600 font-medium">{promoError}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Link
                  href="/operate/rent-roll/pricing"
                  className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0D7B6C] border border-teal-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Dedicated Rent Roll Pricing Table</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  disabled={processingPlan === "Rent Roll & Billing"}
                  onClick={() => handleCheckout({
                    productCode: "RR",
                    planName: "Rent Roll & Billing",
                    edition: "standalone",
                    monthlyPrice: calcRentRollPrice(),
                    sqftRate: formatSqftRate(calcRentRollPrice()),
                  })}
                  className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                    appliedPromo ? "bg-emerald-700 hover:bg-emerald-800" : "bg-slate-900 hover:bg-black"
                  }`}
                >
                  {processingPlan === "Rent Roll & Billing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : appliedPromo ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Activate Free Access ({appliedPromo})</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Instant Subscribe (₹{calcRentRollPrice().toLocaleString("en-IN")}/mo)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. 52-Week PPM */}
            <div
              id="module-ppm"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "ppm"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  {activeParamModule === "ppm" ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                      SaaS Module 2
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">52-Week PPM &amp; Asset QR</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Annual planned maintenance matrices for HVAC, DG sets, transformers, and optical turnstiles with QR passports.
                </p>

                {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{Math.round(standalone.ppm.monthly * annualMultiplier).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ building / mo</span>
                  </div>

                  {/* Below: Per Sq.Ft Rate */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-black font-mono text-amber-700">
                      ₹{formatSqftRate(Math.round(standalone.ppm.monthly * annualMultiplier))}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">/ sq.ft / mo</span>
                    <span className="text-[10px] text-slate-400">({safeSqft.toLocaleString()} sq.ft)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>52-Week maintenance scheduler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>QR equipment scan logbook &amp; AMC alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Vendor checklist audit &amp; geotag proof</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processingPlan === "52-Week PPM"}
                onClick={() => handleCheckout({
                  productCode: "PPM",
                  planName: "52-Week PPM",
                  edition: "standalone",
                  monthlyPrice: Math.round(standalone.ppm.monthly * annualMultiplier),
                  sqftRate: formatSqftRate(Math.round(standalone.ppm.monthly * annualMultiplier)),
                })}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "52-Week PPM" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to 52-Week PPM</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Visitor Flow */}
            <div
              id="module-visitor"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "visitor" || activeParamModule === "visitors"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  {(activeParamModule === "visitor" || activeParamModule === "visitors") ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                      SaaS Module 3
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">Visitor Flow &amp; Speed-Gates</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  18-second lobby transit with WhatsApp QR passes and optical turnstile integration (Boon Edam &amp; Gunnebo).
                </p>

                {/* PRICE BOX: FLAT PER BUILDING / MONTH */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{Math.round(standalone.visitor.monthly * annualMultiplier).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ building / mo</span>
                  </div>

                  {/* Tier info */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                      Starter Plan
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">Front-Desk check-in · Speed-Gate Pro: ₹2,999/mo</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>18-Second optical turnstile barcode transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Host WhatsApp approval &amp; overstay alert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Emergency lobby head-count roster</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processingPlan === "Visitor Flow & Speed-Gates"}
                onClick={() => handleCheckout({
                  productCode: "VISITOR",
                  planName: "Visitor Flow & Speed-Gates",
                  edition: "standalone",
                  monthlyPrice: Math.round(standalone.visitor.monthly * annualMultiplier),
                  sqftRate: "Per Gate",
                })}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "Visitor Flow & Speed-Gates" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to Visitor Flow</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. Statutory Compliance */}
            <div
              id="module-compliance"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "compliance"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  {activeParamModule === "compliance" ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                      SaaS Module 4
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">Statutory Compliance Calendar</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  48 Pre-configured commercial tower licenses with automated 90-day alert escalations and REIT vault.
                </p>

                {/* PRICE BOX: FLAT PER PROPERTY / MONTH */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{Math.round(standalone.compliance.monthly * annualMultiplier).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ property / mo</span>
                  </div>

                  {/* Tier info */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                      Core Radar
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">15 Core Licenses · Institutional: ₹3,499/mo</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>48 Pre-loaded commercial statutory obligations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>90, 60 &amp; 30-day escalation ladder alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Auditor-ready certificate vault repository</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processingPlan === "Statutory Compliance Calendar"}
                onClick={() => handleCheckout({
                  productCode: "COMPLIANCE",
                  planName: "Statutory Compliance Calendar",
                  edition: "standalone",
                  monthlyPrice: Math.round(standalone.compliance.monthly * annualMultiplier),
                  sqftRate: formatSqftRate(Math.round(standalone.compliance.monthly * annualMultiplier)),
                })}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "Statutory Compliance Calendar" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to Compliance</span>
                  </>
                )}
              </button>
            </div>

            {/* 5. Lease CRM */}
            <div
              id="module-leasecrm"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "leasecrm" || activeParamModule === "lease-crm" || activeParamModule === "crm"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  {(activeParamModule === "leasecrm" || activeParamModule === "lease-crm" || activeParamModule === "crm") ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                      SaaS Module 5
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">Commercial Lease CRM</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Visual spatial stacking plan, automated commercial LOI generator, deal stages, and broker engagement portal.
                </p>

                {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{Math.round(standalone.leaseCrm.monthly * annualMultiplier).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ team / mo</span>
                  </div>

                  {/* Below: Per Sq.Ft Rate */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-xs font-black font-mono text-purple-700">
                      ₹{formatSqftRate(Math.round(standalone.leaseCrm.monthly * annualMultiplier))}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">/ sq.ft / mo</span>
                    <span className="text-[10px] text-slate-400">({safeSqft.toLocaleString()} sq.ft)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Interactive floor-by-floor spatial stacking plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Institutional LOI term sheet generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Broker fee escrow and deal velocity tracking</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processingPlan === "Commercial Lease CRM"}
                onClick={() => handleCheckout({
                  productCode: "CRM",
                  planName: "Commercial Lease CRM",
                  edition: "standalone",
                  monthlyPrice: Math.round(standalone.leaseCrm.monthly * annualMultiplier),
                  sqftRate: formatSqftRate(Math.round(standalone.leaseCrm.monthly * annualMultiplier)),
                })}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "Commercial Lease CRM" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to Lease CRM</span>
                  </>
                )}
              </button>
            </div>

            {/* 6. Tenant Helpdesk */}
            <div
              id="module-helpdesk"
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                activeParamModule === "helpdesk"
                  ? "border-2 border-[#0D7B6C] ring-4 ring-[#0D7B6C]/10 shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-teal-500 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  {activeParamModule === "helpdesk" ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0D7B6C] text-white px-2.5 py-1 rounded-full shadow-xs">
                      Selected Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full">
                      SaaS Module 6
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">Tenant Helpdesk &amp; Rooms</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  10-Second QR work-order dispatch, meeting room &amp; cafeteria booking, and SLA resolution tracking.
                </p>

                {/* PRICE BOX: MAIN IS PER MONTH, PER SQ FT SHOWN RIGHT BELOW */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 mb-5 space-y-2">
                  {/* Main: Per Month */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{Math.round(standalone.helpdesk.monthly * annualMultiplier).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ building / mo</span>
                  </div>

                  {/* Below: Per Sq.Ft Rate */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-xs font-black font-mono text-cyan-700">
                      ₹{formatSqftRate(Math.round(standalone.helpdesk.monthly * annualMultiplier))}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">/ sq.ft / mo</span>
                    <span className="text-[10px] text-slate-400">({safeSqft.toLocaleString()} sq.ft)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>10-Second QR ticket capture on desk or room</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Automated technician dispatch &amp; SLA clock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0D7B6C]" />
                    <span>Shared boardroom &amp; amenity reservation</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processingPlan === "Tenant Helpdesk & Rooms"}
                onClick={() => handleCheckout({
                  productCode: "HELPDESK",
                  planName: "Tenant Helpdesk & Rooms",
                  edition: "standalone",
                  monthlyPrice: Math.round(standalone.helpdesk.monthly * annualMultiplier),
                  sqftRate: formatSqftRate(Math.round(standalone.helpdesk.monthly * annualMultiplier)),
                })}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingPlan === "Tenant Helpdesk & Rooms" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to Helpdesk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0D7B6C] shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">100% Audit-Grade Security &amp; Escrow Guarantee</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              All transactions processed via RBI-licensed Razorpay Nodal Escrow. Immediate GST tax invoicing with input credit support.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/operate/rent-roll#contact"
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 transition"
          >
            Request Custom Quotation
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("faq");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            Pricing FAQs
          </button>
        </div>
      </div>
    </section>
  );
}

function OperatePricingWithParams(props: OperatePricingSectionProps) {
  const searchParams = useSearchParams();
  const paramMode = searchParams?.get("mode") || searchParams?.get("tab");
  const paramModule = searchParams?.get("module") || searchParams?.get("from");

  const [resolvedMode, setResolvedMode] = useState<"bundle" | "standalone">(() => {
    if (paramMode === "standalone" || paramMode === "individual" || Boolean(paramModule)) {
      return "standalone";
    }
    return props.defaultMode || "bundle";
  });

  const [resolvedModule, setResolvedModule] = useState<string>(() => (paramModule || props.defaultModule || "").toLowerCase());

  useEffect(() => {
    const mod = (paramModule || "").toLowerCase();
    if (mod === "rentroll" || mod === "rent-roll") {
      if (typeof window !== "undefined") {
        window.location.replace("/operate/rent-roll/pricing");
      }
      return;
    }

    if (paramMode === "standalone" || paramMode === "individual" || Boolean(paramModule)) {
      setResolvedMode("standalone");
      if (paramModule) setResolvedModule(paramModule.toLowerCase());
      return;
    }

    // Inspect document.referrer or sessionStorage context fallback
    if (typeof window !== "undefined") {
      const ref = (document.referrer || "").toLowerCase();
      const lastMod = (sessionStorage.getItem("officex_active_operate_module") || "").toLowerCase();

      const matched =
        ref.includes("/rent-roll") || lastMod === "rentroll" || lastMod === "rent-roll" ? "rentroll" :
        ref.includes("/visitor") || lastMod === "visitor" || lastMod === "visitors" ? "visitor" :
        ref.includes("/ppm") || lastMod === "ppm" ? "ppm" :
        ref.includes("/compliance") || lastMod === "compliance" ? "compliance" :
        ref.includes("/helpdesk") || lastMod === "helpdesk" ? "helpdesk" :
        ref.includes("/lease-crm") || lastMod === "leasecrm" ? "leasecrm" : "";

      if (matched) {
        setResolvedMode("standalone");
        setResolvedModule(matched);
      }
    }
  }, [paramMode, paramModule]);

  return (
    <OperatePricingInner
      {...props}
      activeParamMode={resolvedMode}
      activeParamModule={resolvedModule}
    />
  );
}

export default function OperatePricingSection(props: OperatePricingSectionProps) {
  return (
    <Suspense fallback={<OperatePricingInner {...props} activeParamMode={props.defaultMode || "bundle"} />}>
      <OperatePricingWithParams {...props} />
    </Suspense>
  );
}

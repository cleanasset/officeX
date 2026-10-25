"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Tag,
  Check,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface SubscriptionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  moduleName?: string;
}

export default function SubscriptionGateModal({
  isOpen,
  onClose,
  onSuccess,
  moduleName = "Visitor & Statutory Compliance Console",
}: SubscriptionGateModalProps) {
  const [couponCode, setCouponCode] = useState("visitor001");
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    badge: string;
  } | null>({
    code: "visitor001",
    discountPercent: 100,
    discountAmount: 999,
    finalPrice: 0,
    badge: "100% OFF Launch Partner Access",
  });
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("Launch Offer: 100% discount with visitor001");
  const [isActivating, setIsActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const basePrice = 999;
  const currentPrice = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsVerifyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/vc/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          badge: data.badge,
        });
        setCouponSuccess(data.message);
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/vc/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: "Commercial Pass",
          billingCycle: "monthly",
          couponCode: appliedCoupon?.code || "",
          orgName: "CyberCity Commercial Towers",
          orgId: "org_officex_demo",
          userEmail: "admin@commercialtower.com",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to activate subscription");
      }

      // Mark subscription active in client storage
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_vc_sub_active", "active");
        sessionStorage.setItem("officex_vc_sub_active", "active");
        document.cookie = "officex_vc_sub_active=active; path=/; max-age=2592000; SameSite=Lax";
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to activate subscription. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-48 bg-gradient-to-bl from-teal-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon & Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Subscription Required
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Commercial License Subscription Gate
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Access to the live <strong className="text-slate-200">{moduleName}</strong> requires an active Commercial Pass.
        </p>

        {/* Plan Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Plan: Commercial Facility Pass
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                {appliedCoupon && appliedCoupon.finalPrice === 0 ? (
                  <>
                    <span className="text-3xl font-black text-emerald-400">₹0.00</span>
                    <span className="text-sm text-slate-500 line-through">₹999</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black text-white">₹{currentPrice}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </>
                )}
              </div>
            </div>

            {appliedCoupon && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                {appliedCoupon.badge}
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Speed-Gate Turnstiles (6 Gates Relay Synced)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>WhatsApp QR Passes &amp; 1-Click Evacuation Roll Call</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Statutory 48-NOC Fire, Elevator &amp; PTW Compliance Trackers</span>
            </div>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            Promo / Partner Coupon Code
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
              }}
              placeholder="e.g. visitor001"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase tracking-wider"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isVerifyingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              {isVerifyingCoupon ? "Checking..." : "Apply"}
            </button>
          </div>

          {couponSuccess && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{couponSuccess}</span>
            </p>
          )}
          {couponError && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{couponError}</span>
            </p>
          )}

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
            <span>💡 Tip:</span>
            <button
              type="button"
              onClick={() => {
                setCouponCode("visitor001");
                setAppliedCoupon({
                  code: "visitor001",
                  discountPercent: 100,
                  discountAmount: 999,
                  finalPrice: 0,
                  badge: "100% OFF Launch Partner Access",
                });
                setCouponSuccess("Applied visitor001 (100% OFF Free Access)");
              }}
              className="text-cyan-400 font-mono font-bold hover:underline"
            >
              visitor001
            </button>
            <span>gives 100% free activation.</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleActivate}
            disabled={isActivating}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
              appliedCoupon && appliedCoupon.finalPrice === 0
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-600/30"
            }`}
          >
            {isActivating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Activating Commercial License...</span>
              </div>
            ) : appliedCoupon && appliedCoupon.finalPrice === 0 ? (
              <>
                <span>Activate Free Commercial Access with visitor001</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Subscribe for ₹{currentPrice}/mo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <Link
              href="/visitor-compliance/pricing?coupon=visitor001"
              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>View full pricing editions &rarr;</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 text-[11px]"
            >
              Back to Product Showcase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

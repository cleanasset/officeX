"use client";

import React, { useState, useEffect } from "react";
import VisitorManagementConsole from "@/components/visitor/VisitorManagementConsole";
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Tag,
  CheckCircle2,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  Building,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

export default function PropertiesVisitorPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockType, setUnlockType] = useState<"none" | "coupon" | "paid">("none");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("RENTROLL100");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [propertyName, setPropertyName] = useState("test building 1");

  // Fetch real property name from database
  useEffect(() => {
    fetch("/api/rent-roll/properties")
      .then((r) => r.json())
      .then((data) => {
        if (data.properties && data.properties.length > 0 && data.properties[0].name) {
          setPropertyName(data.properties[0].name);
        }
      })
      .catch(() => {});
  }, []);

  // Check persisted unlocked state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("officex_vms_unlocked");
      if (stored === "coupon" || stored === "paid") {
        setIsUnlocked(true);
        setUnlockType(stored as "coupon" | "paid");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "RENTROLL100" || couponCode.trim().toUpperCase() === "OFFICEX" || couponCode.trim().toUpperCase() === "FREE") {
      setCouponSuccess(true);
      setCouponError("");
      setTimeout(() => {
        setIsUnlocked(true);
        setUnlockType("coupon");
        try {
          localStorage.setItem("officex_vms_unlocked", "coupon");
        } catch (e) {}
      }, 700);
    } else {
      setCouponError("Invalid coupon code. Use 'RENTROLL100' for early-bird access.");
    }
  };

  const handlePay100 = async () => {
    setIsProcessingPayment(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsUnlocked(true);
        setUnlockType("paid");
        try {
          localStorage.setItem("officex_vms_unlocked", "paid");
        } catch (e) {}
      }, 700);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setUnlockType("none");
    setPaymentSuccess(false);
    setCouponSuccess(false);
    try {
      localStorage.removeItem("officex_vms_unlocked");
    } catch (e) {}
  };

  // ════════════════════════════════════════════════════════════════════
  // 1. LOCKED PAYWALL SCREEN (USER CANNOT ACCESS THINGS UNTIL UNLOCKED)
  // ════════════════════════════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
          
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          {/* Heading & Notice */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Separate Paid SaaS Module</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Visitor Management &amp; Speed-Gates Access
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              This module is not included in the standard Rent Roll license. Each OfficeX SaaS module operates under independent commercial licensing.
            </p>
          </div>

          {/* Plan Price Tag */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Standard License Fee
              </span>
              <div className="text-2xl font-black text-slate-900">
                ₹100 <span className="text-xs font-normal text-slate-500">/ property / month</span>
              </div>
            </div>

            <div className="space-y-1 text-right text-xs">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F8B7D] font-extrabold border border-teal-200">
                Rent Roll Early-Bird Offer Available
              </span>
              <p className="text-[11px] text-slate-500">Apply launch coupon to unlock for free</p>
            </div>
          </div>

          {/* Features Included List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs text-slate-700 font-semibold p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>10-Second QR Pre-registration Passes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Optical Turnstile &amp; Speed-Gate Relays</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Host Approval &amp; WhatsApp Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Emergency Evacuation Live Roll-Call</span>
            </div>
          </div>

          {/* Two Action Columns: Claim via Coupon OR Pay ₹100 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Card A: Apply Coupon (FREE ACCESS FOR NOW) */}
            <div className="p-5 rounded-2xl bg-teal-50/70 border-2 border-[#0F8B7D] text-left space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rent Roll Promo Coupon</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                    100% OFF
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900">Unlock for Free with Coupon</h3>
                <p className="text-[11px] text-slate-600 mt-1">
                  Already activated Rent Roll? Use your bundle voucher to waive the ₹100 fee.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    placeholder="RENTROLL100"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-extrabold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                  >
                    {couponSuccess ? "Unlocked!" : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-bold text-rose-600">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] font-bold text-emerald-700">✓ Coupon applied! Unlocking console...</p>}
              </div>
            </div>

            {/* Card B: Pay ₹100 Now */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white text-left space-y-3 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Commercial License</span>
                  </span>
                  <span className="text-sm font-black text-white">₹100</span>
                </div>
                <h3 className="text-sm font-black text-white">Pay ₹100 Regular Fee</h3>
                <p className="text-[11px] text-slate-300 mt-1">
                  Pay directly without coupon. Generates official tax invoice #INV-VMS-100.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePay100}
                  className="w-full py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing ₹100...</span>
                    </>
                  ) : paymentSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                      <span>Paid ₹100! Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹100 Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. UNLOCKED STATE: ACCESS GRANTED WITH ACTIVE STATUS BAR
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Active License Status Banner (Clean confirmation, no redundant payment prompts) */}
      <div className="bg-white border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs mx-4 sm:mx-6 lg:mx-8 mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-900">
              Visitor Management SaaS: Active
            </span>
            {unlockType === "paid" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                Commercial License (₹100/mo)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                Free Promo Access (Coupon: RENTROLL100)
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLockAgain}
          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          title="Re-lock to test paywall"
        >
          Re-lock Module
        </button>
      </div>

      {/* Unlocked Console */}
      <VisitorManagementConsole portalRole="admin" defaultProperty={propertyName} />
    </div>
  );
}

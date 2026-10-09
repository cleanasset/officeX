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
} from "lucide-react";

interface RentRollPricingTableProps {
  onContactSales?: () => void;
  showComparisonLink?: boolean;
}

interface SelectedPlanInfo {
  id: string;
  name: string;
  ratePerSqft: number;
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const storedRole = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "owner";
      if (storedEmail) setUserEmail(storedEmail);
      if (storedName) setUserName(storedName);
      if (storedRole) setUserRole(storedRole);
    }
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

  // Commercial Slabs: Compact, punchy 4 bullets each
  const SLABS = [
    {
      id: "starter",
      name: "Commercial Starter",
      badge: "Up to 50k Sq.Ft",
      ratePerSqft: 50,
      sqftLimit: "50,000 sq.ft",
      sqftNumber: 50000,
      target: "Standalone Commercial Tower",
      basePriceDisplay: "₹25 Lakhs / yr",
      basePriceNum: 2500000,
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
      sqftLimit: "2,50,000 sq.ft",
      sqftNumber: 250000,
      target: "Multi-Tower Tech Parks & Campuses",
      basePriceDisplay: "₹2.50 Crores / yr",
      basePriceNum: 25000000,
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
      sqftLimit: "50,00,00,000 sq.ft",
      sqftNumber: 500000000,
      target: "Institutional Funds & REITs",
      basePriceDisplay: "Enterprise License",
      basePriceNum: 100000000,
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

  // Open checkout for a plan
  const handleOpenCheckout = (slab: typeof SLABS[0]) => {
    setCheckoutPlan({
      id: slab.id,
      name: slab.name,
      ratePerSqft: slab.ratePerSqft,
      sqftLimit: slab.sqftLimit,
      sqftNumber: slab.sqftNumber,
      basePriceNum: slab.basePriceNum,
    });
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError(null);
    setShowPromoField(false);
  };

  const handleOpenCalculatorCheckout = () => {
    setCheckoutPlan({
      id: `custom-${calculatorRate}`,
      name: `Custom Scope (${customSqft.toLocaleString("en-IN")} Sq.Ft)`,
      ratePerSqft: calculatorRate,
      sqftLimit: `${customSqft.toLocaleString("en-IN")} sq.ft`,
      sqftNumber: customSqft,
      basePriceNum: calculatedCalculatorAnnualPrice,
    });
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError(null);
    setShowPromoField(false);
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

  // Complete checkout & navigate
  const handleCompleteActivation = () => {
    const finalEmail = userEmail.trim().toLowerCase() || "demo@officex.commercial";
    const finalName = userName.trim() || "Commercial Admin";
    const finalRole = userRole || "owner";

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_email", finalEmail);
      localStorage.setItem("officex_user_name", finalName);
      localStorage.setItem("officex_user_role", finalRole);
      localStorage.setItem(`officex_sub_${finalEmail}`, "active");
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_user_email", finalEmail);
      sessionStorage.setItem(`officex_sub_${finalEmail}`, "active");
      sessionStorage.setItem("officex_subscription", "active");
      document.cookie = `officex_sub_${encodeURIComponent(finalEmail)}=active; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `officex_subscription=active; path=/; max-age=2592000; SameSite=Lax`;
    }

    setProcessingActivation(true);
    setTimeout(() => {
      router.push("/properties/rent-roll?tab=dashboard");
    }, 350);
  };

  return (
    <div className="w-full">
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
                    ₹{slab.ratePerSqft}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    / sq.ft / yr
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60 font-medium">
                  <span>Scope: <strong className="text-slate-800">{slab.sqftLimit}</strong></span>
                  <span className="font-mono text-slate-500">{slab.basePriceDisplay}</span>
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
                onClick={() => handleOpenCheckout(slab)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  slab.popular
                    ? "bg-[#0D7B6C] hover:bg-[#0A6357] text-white shadow-[#0D7B6C]/20 hover:shadow-md"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <span>{slab.ctaText}</span>
                <ArrowRight size={13} />
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
                    ₹{rate}/sq.ft
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
                Estimated Scope
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{calculatedCalculatorAnnualPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400 block">/ yr + GST</span>
            </div>

            <button
              onClick={handleOpenCalculatorCheckout}
              className="px-4 py-2 bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Subscribe Scope</span>
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
                  Subscribe to Rent Roll
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {checkoutPlan.name} · ₹{checkoutPlan.ratePerSqft}/sq.ft
                </p>
              </div>
            </div>

            {/* User Details Step (if not already entered) */}
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

              {/* Role Selector */}
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

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Licensed Scope:</span>
                <span className="font-semibold text-slate-800">{checkoutPlan.sqftLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial License:</span>
                <span className="font-mono font-medium text-slate-800">
                  ₹{checkoutPlan.basePriceNum.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18%):</span>
                <span className="font-mono text-slate-600">
                  ₹{Math.round(checkoutPlan.basePriceNum * 0.18).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Coupon Row */}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-emerald-200 bg-emerald-100/60 -mx-3 -mb-3 p-2 rounded-b-xl">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-700" />
                    Coupon "{appliedCoupon}" (-100%):
                  </span>
                  <span className="font-mono">
                    -₹{Math.round(checkoutPlan.basePriceNum * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Total Due */}
            <div className="flex justify-between items-baseline mb-4 px-1">
              <span className="text-xs font-bold text-slate-600">Total Amount:</span>
              <div className="text-right">
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono line-through text-slate-400">
                      ₹{Math.round(checkoutPlan.basePriceNum * 1.18).toLocaleString("en-IN")}
                    </span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      ₹0.00
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{Math.round(checkoutPlan.basePriceNum * 1.18).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mb-5">
              {!appliedCoupon && !showPromoField && (
                <button
                  type="button"
                  onClick={() => setShowPromoField(true)}
                  className="text-xs font-semibold text-[#0D7B6C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Tag size={12} />
                  <span>Have a promo voucher or launch code?</span>
                </button>
              )}

              {(showPromoField || appliedCoupon) && (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. OFFICEX100"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0D7B6C] outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> {couponError}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <strong>100% Free Launch Grant Active!</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput("");
                        }}
                        className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Action CTA */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleCompleteActivation}
                  disabled={processingActivation}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>
                    {processingActivation ? "Activating License..." : "Activate Free & Enter Dashboard"}
                  </span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Please click 'Have a promo voucher?' and enter code OFFICEX100 or RENTROLL12 for 100% free access.");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard size={15} />
                    <span>Pay ₹{Math.round(checkoutPlan.basePriceNum * 1.18).toLocaleString("en-IN")} via Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPromoField(true);
                      setCouponInput("OFFICEX100");
                      setAppliedCoupon("OFFICEX100");
                    }}
                    className="w-full py-1 text-[11px] font-semibold text-slate-500 hover:text-[#0D7B6C] transition text-center cursor-pointer"
                  >
                    Quick-Apply Launch Coupon (OFFICEX100)
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center font-medium">
                Allocates 50,00,00,000 Sq.Ft capacity protected by 90% grace period.
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

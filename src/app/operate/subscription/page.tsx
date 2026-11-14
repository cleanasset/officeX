"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  Zap,
  Lock,
  RefreshCw,
  CreditCard,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
  MapPin,
  FileSpreadsheet,
  Plus,
  SlidersHorizontal,
  HelpCircle,
  Receipt,
  FileText
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import { SUBSCRIPTION_PLAN_OPTIONS } from "@/components/SubscriptionGate";

export default function SubscriptionAndQuotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // Upgrade & Interactive Calculator State
  const [simulatedAddedSqft, setSimulatedAddedSqft] = useState<number>(0);
  const [selectedTierId, setSelectedTierId] = useState<"starter" | "techpark" | "reit-mega">("techpark");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

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
        if (sJson.plan) {
          setSelectedTierId(sJson.plan as any);
        }
      }

      if (areaRes && areaRes.ok) {
        const aJson = await areaRes.json();
        setPortfolioData(aJson);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentPlanId = subData?.plan || "techpark";
  const currentPlan = SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === currentPlanId) || SUBSCRIPTION_PLAN_OPTIONS[1];

  // Capacity Limits
  const currentCapSqft =
    currentPlanId === "starter" ? 50000 :
    currentPlanId === "techpark" ? 250000 : 50000000;

  const currentPortfolioSqft = Number(portfolioData?.totalAreaSqft || portfolioData?.totalArea || 0);
  const remainingSqft = Math.max(0, currentCapSqft - currentPortfolioSqft);
  const currentUsagePct = Math.min(100, Math.round((currentPortfolioSqft / currentCapSqft) * 100));

  // Dynamic calculations for simulated area addition
  const simulatedTotalPortfolioSqft = currentPortfolioSqft + simulatedAddedSqft;

  // Recommended plan based on simulated total area
  const recommendedTierId: "starter" | "techpark" | "reit-mega" = useMemo(() => {
    if (simulatedTotalPortfolioSqft <= 50000) return "starter";
    if (simulatedTotalPortfolioSqft <= 250000) return "techpark";
    return "reit-mega";
  }, [simulatedTotalPortfolioSqft]);

  const targetPlan = SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === selectedTierId) || SUBSCRIPTION_PLAN_OPTIONS[1];

  const targetCapSqft =
    selectedTierId === "starter" ? 50000 :
    selectedTierId === "techpark" ? 250000 : 50000000;

  // Prorata upgrade calculation
  const daysRemainingInCycle = subData?.days_remaining || 16;
  const currentRatePerSqft = currentPlan.price;
  const targetRatePerSqft = targetPlan.price;
  const rateDifference = Math.max(0, targetRatePerSqft - currentRatePerSqft);
  const rawProratedDifference = Math.round((rateDifference * (daysRemainingInCycle / 30)) * 100);
  const is100Free = couponApplied === "OFFICEX100" || couponApplied === "RENTROLL12" || couponApplied === "FREE100";
  const payableAmount = is100Free ? 0 : rawProratedDifference;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "OFFICEX100" || clean === "RENTROLL12" || clean === "FREE100") {
      setCouponApplied(clean);
      setCouponMsg({ text: `🎉 Promo code '${clean}' applied: 100% Free Plan Upgrade activated!`, type: "success" });
    } else {
      setCouponMsg({ text: "Invalid code. Use OFFICEX100 or RENTROLL12 for complete complimentary access.", type: "error" });
    }
  };

  const handleExecuteUpgrade = async () => {
    try {
      setUpgrading(true);
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "active_user") : "active_user";

      const res = await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          coupon: couponApplied || "OFFICEX100",
          paymentId: "UPGRADE_" + Date.now(),
          plan: targetPlan.id,
          plan_name: targetPlan.name,
          duration_months: 12,
          billing_cycle: "annual",
          amount: payableAmount,
        }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_subscription", "active");
          localStorage.setItem("officex_subscription_plan", targetPlan.id);
          localStorage.setItem("officex_selected_plan", targetPlan.id);
          document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
        }
        setUpgradeSuccess(true);
        setTimeout(() => setUpgradeSuccess(false), 4000);
        loadData();
      }
    } catch {
      alert("Failed to process plan upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb & Executive Header */}
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active License: {currentPlan.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor your licensed portfolio square footage capacity, billing cycle, and simulate instant plan expansions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("upgrade-calculator-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <Sparkles size={14} />
                <span>Upgrade Plan / Add Sq.Ft</span>
              </button>
            </div>
          </div>

          {upgradeSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="block text-sm font-bold">Plan Successfully Upgraded to {targetPlan.name}!</strong>
                Your licensed square footage capacity has been updated to {targetCapSqft.toLocaleString("en-IN")} sq.ft.
              </div>
            </div>
          )}

      {/* 4 High-Density Responsive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Tier */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active Plan</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 leading-snug">{currentPlan.name}</span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Renewal</span>
            <strong className="text-emerald-700 font-bold">{daysRemainingInCycle} Days Left</strong>
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
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Billing Cycle</span>
                <strong className="text-slate-700 font-bold capitalize">{subData?.billing_cycle || "Monthly"}</strong>
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
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
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
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
                  {remainingSqft.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">sq.ft</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Status</span>
                <strong className="text-emerald-700 font-bold">Unused Capacity</strong>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar Card */}
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

          {/* Interactive Live Upgrade & Sq.Ft Addition Simulator */}
          <div id="upgrade-calculator-section" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Live Capacity Simulator
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  How Sq.Ft Addition &amp; Plan Upgrades Work
                </h3>
                <p className="text-xs text-slate-500">
                  Test adding square footage below to see instant tier recommendations and prorated pricing calculations.
                </p>
              </div>
            </div>

            {/* Quick Add Area Buttons & Range Slider */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  Simulate Adding Commercial Area:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[25000, 50000, 100000, 250000].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setSimulatedAddedSqft(delta)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        simulatedAddedSqft === delta
                          ? "bg-[#0F8B7D] text-white border-[#0F8B7D]"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      +{delta.toLocaleString("en-IN")} sq.ft
                    </button>
                  ))}
                  {simulatedAddedSqft > 0 && (
                    <button
                      type="button"
                      onClick={() => setSimulatedAddedSqft(0)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={simulatedAddedSqft}
                  onChange={(e) => setSimulatedAddedSqft(Number(e.target.value))}
                  className="w-full accent-[#0F8B7D] cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current: {currentPortfolioSqft.toLocaleString("en-IN")} sq.ft</span>
                  <span className="font-mono font-bold text-[#0F8B7D] text-sm">
                    {simulatedAddedSqft > 0 ? `+${simulatedAddedSqft.toLocaleString("en-IN")} sq.ft added` : "No simulated addition"}
                  </span>
                  <span className="text-slate-400 font-bold">
                    Projected: {simulatedTotalPortfolioSqft.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Tier Selection Cards */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block">Choose Target Licensing Tier:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {SUBSCRIPTION_PLAN_OPTIONS.map((tier) => {
                  const isCurrent = tier.id === currentPlanId;
                  const isSelected = tier.id === selectedTierId;
                  const isRecommended = tier.id === recommendedTierId;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0F8B7D] bg-teal-50/40 shadow-xs ring-1 ring-[#0F8B7D]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                          Recommended
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900">{tier.name}</h4>
                          {isSelected ? (
                            <CheckCircle2 size={16} className="text-[#0F8B7D]" />
                          ) : isCurrent ? (
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Current</span>
                          ) : null}
                        </div>
                        <span className="text-xs font-bold text-[#0F8B7D] block mb-2">{tier.scope}</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{tier.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Tier Cap:</span>
                        <strong className="text-slate-900 font-mono">
                          {tier.id === "starter" ? "50,000 sq.ft" : tier.id === "techpark" ? "2,50,000 sq.ft" : "5,00,00,000 sq.ft"}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prorated Math & Cost Transparency Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Receipt size={15} className="text-[#0F8B7D]" />
                  Proration Math &amp; Cycle Adjustment
                </span>
                <span className="text-slate-500 font-normal">
                  Cycle Days Left: <strong className="text-slate-800">{daysRemainingInCycle} Days</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Tier Cap</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {targetCapSqft.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Proration Formula</span>
                  <span className="font-mono text-slate-700 text-xs">
                    (Rate Diff) × ({daysRemainingInCycle} / 30 Days)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Calculated Upgrade Due</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
                    {is100Free ? "₹0 (100% Promo Waived)" : `₹${payableAmount}`}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="pt-2 flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Enter Partner Code (e.g. OFFICEX100)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs uppercase font-mono focus:border-[#0F8B7D] outline-none w-64 bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition"
                >
                  Apply Code
                </button>
                {couponMsg && (
                  <span className={`text-xs font-semibold ${couponMsg.type === "success" ? "text-emerald-700" : "text-rose-600"}`}>
                    {couponMsg.text}
                  </span>
                )}
              </form>
            </div>

            {/* Execute Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={upgrading || selectedTierId === currentPlanId}
                onClick={handleExecuteUpgrade}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Sparkles size={14} />
                <span>
                  {upgrading
                    ? "Activating Capacity Upgrade..."
                    : selectedTierId === currentPlanId
                    ? "Currently on this Tier"
                    : `Confirm & Upgrade to ${targetPlan.name}`}
                </span>
              </button>
            </div>
          </div>

          {/* Properties Contributing to Quota Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Properties Contributing to Quota</h3>
                <p className="text-xs text-slate-500">Active commercial assets tallied towards your licensed square footage</p>
              </div>
              <Link
                href="/properties/registry"
                className="text-xs font-bold text-[#0F8B7D] hover:underline inline-flex items-center gap-1"
              >
                Register More Properties <ArrowRight size={13} />
              </Link>
            </div>

            {portfolioData?.properties && portfolioData.properties.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {portfolioData.properties.map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D]">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                        <span className="text-[11px] text-slate-400">Registered Commercial Asset</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-slate-900">
                        {Number(p.areaSqft || p.area || 0).toLocaleString("en-IN")} sq.ft
                      </span>
                      <span className="text-[10px] text-slate-400 block">Leasable Area</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl p-4">
                <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700">No properties currently registered</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When you onboard properties in the Property Registry, their area automatically tallies against this quota.
                </p>
                <Link
                  href="/properties/add"
                  className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0c6e63] transition"
                >
                  <Plus size={13} /> Add Property
                </Link>
              </div>
            )}
          </div>
        </div>
      );
    }

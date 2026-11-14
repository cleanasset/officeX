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
  Sliders,
  TrendingUp,
  Maximize2
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import { SUBSCRIPTION_PLAN_OPTIONS } from "@/components/SubscriptionGate";

export default function SubscriptionAndQuotaPage() {
  const [loading, setLoading] = useState(true);

  // Hydrate initial state instantly from cache to eliminate blank/zero flash
  const [subData, setSubData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const cachedPlan = localStorage.getItem("officex_subscription_plan") || localStorage.getItem("officex_selected_plan");
      const isSub = localStorage.getItem("officex_subscription") === "active";
      const storedSqft = Number(localStorage.getItem("officex_subscribed_sqft")) || 0;
      if (isSub || cachedPlan) {
        return {
          subscribed: true,
          plan: cachedPlan || "techpark",
          plan_name:
            cachedPlan === "starter"
              ? "Commercial Starter"
              : cachedPlan === "reit-mega"
              ? "REIT Mega-Portfolio"
              : "Commercial Growth / Campus",
          subscribed_sqft: storedSqft > 0 ? storedSqft : null,
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

  // Upgrade Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMode, setUpgradeMode] = useState<"tiers" | "custom_sqft">("tiers");
  const [selectedTierId, setSelectedTierId] = useState<"starter" | "techpark" | "reit-mega">("techpark");
  const [customAddSqft, setCustomAddSqft] = useState<number>(50000);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

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
        if (sJson.subscribed_sqft && typeof window !== "undefined") {
          localStorage.setItem("officex_subscribed_sqft", String(sJson.subscribed_sqft));
        }
      }

      if (areaRes && areaRes.ok) {
        const aJson = await areaRes.json();
        setPortfolioData(aJson);
        if (aJson.totalPortfolioSqft && typeof window !== "undefined") {
          localStorage.setItem("officex_total_portfolio_sqft", String(aJson.totalPortfolioSqft));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = Boolean(subData?.subscribed && subData.plan && subData.plan !== "none" && subData.plan !== "free");
  const currentPlanId = isSubscribed ? subData.plan : "free";
  const currentPlan = isSubscribed
    ? (SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === currentPlanId) || SUBSCRIPTION_PLAN_OPTIONS[1])
    : { id: "free", name: "Free Operational Workspace", badge: "Free Tier", price: 0 };

  // Base Plan Capacity Limits (reit-mega is 50 crore sq.ft = 500,000,000 sq.ft)
  const baseCapSqft =
    currentPlanId === "starter" ? 50000 :
    currentPlanId === "techpark" ? 250000 :
    currentPlanId === "reit-mega" ? 500000000 : 0;

  // Custom expanded capacity stored in database / localStorage
  const storedCustomCap =
    typeof window !== "undefined" ? Number(localStorage.getItem("officex_subscribed_sqft")) : 0;
  const currentCapSqft = Math.max(baseCapSqft, Number(subData?.subscribed_sqft || 0), storedCustomCap || 0);

  const currentPortfolioSqft = Number(
    portfolioData?.totalPortfolioSqft || portfolioData?.totalAreaSqft || portfolioData?.totalArea || 0
  );
  const remainingSqft = currentCapSqft > 0 ? Math.max(0, currentCapSqft - currentPortfolioSqft) : 0;
  const currentUsagePct = currentCapSqft > 0 ? Math.min(100, Math.round((currentPortfolioSqft / currentCapSqft) * 100)) : 0;

  const targetPlan = SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === selectedTierId) || SUBSCRIPTION_PLAN_OPTIONS[1];
  const targetTierCapSqft =
    selectedTierId === "starter" ? 50000 :
    selectedTierId === "techpark" ? 250000 : 500000000;

  // Projected New Capacity Calculation in Modal
  const projectedNewCapSqft =
    upgradeMode === "custom_sqft"
      ? currentCapSqft + customAddSqft
      : Math.max(targetTierCapSqft, currentCapSqft);

  const projectedRemainingHeadroom = Math.max(0, projectedNewCapSqft - currentPortfolioSqft);
  const projectedUsagePct = projectedNewCapSqft > 0 ? Math.min(100, Math.round((currentPortfolioSqft / projectedNewCapSqft) * 100)) : 0;

  const daysRemainingInCycle = isSubscribed ? (subData?.days_remaining || 30) : 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    try {
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "") : "";
      const res = await fetch(`/api/subscription/coupons/validate?code=${encodeURIComponent(clean)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(clean);
        setCouponMsg({ text: data.message || `🎉 Promo code '${clean}' applied!`, type: "success" });
      } else {
        setCouponMsg({ text: data.message || "Invalid coupon code.", type: "error" });
      }
    } catch {
      if (clean === "OFFICEX100" || clean === "RENTROLL12" || clean === "FREE100") {
        setCouponApplied(clean);
        setCouponMsg({ text: `🎉 Promo code '${clean}' applied: 100% Free Plan Upgrade!`, type: "success" });
      } else {
        setCouponMsg({ text: "Invalid code. Contact admin for special pricing grant.", type: "error" });
      }
    }
  };

  const handleExecuteUpgrade = async () => {
    try {
      setUpgrading(true);
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "active_user") : "active_user";
      const finalCap = projectedNewCapSqft;
      const finalPlanId = upgradeMode === "tiers" ? targetPlan.id : (finalCap > 250000 ? "reit-mega" : currentPlanId);
      const finalPlanName = upgradeMode === "tiers" ? targetPlan.name : `${currentPlan.name} (+${customAddSqft.toLocaleString("en-IN")} sq.ft Expanded)`;

      const res = await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          coupon: couponApplied || "OFFICEX100",
          paymentId: "UPGRADE_" + Date.now(),
          plan: finalPlanId,
          plan_name: finalPlanName,
          subscribed_sqft: finalCap,
          duration_months: 12,
          billing_cycle: "annual",
          amount: 0,
        }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_subscription", "active");
          localStorage.setItem("officex_subscription_plan", finalPlanId);
          localStorage.setItem("officex_selected_plan", finalPlanId);
          localStorage.setItem("officex_subscribed_sqft", String(finalCap));
          document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
        }
        setUpgradeSuccess(`✓ Quota expanded to ${finalCap.toLocaleString("en-IN")} sq.ft successfully!`);
        setUpgradeModalOpen(false);
        setTimeout(() => setUpgradeSuccess(null), 5000);
        await loadData();
      }
    } catch {
      alert("Failed to process plan upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  // Render a clean skeleton while initial data is being fetched and cache was empty
  if (loading && !subData) {
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="h-4 w-44 bg-slate-200 rounded"></div>
          <div className="h-3 w-full bg-slate-100 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="h-5 w-56 bg-slate-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-50 border border-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
              isSubscribed ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSubscribed ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`}></span>
              {isSubscribed ? `Active License: ${currentPlan.name}` : "Free Operational Workspace"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Current active licensing tier, managed portfolio square footage, and capacity quota.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setUpgradeMode("custom_sqft");
              setUpgradeModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            <span>Add Sq.Ft Quota</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUpgradeMode("tiers");
              setUpgradeModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles size={14} />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block text-sm font-bold">Capacity Successfully Updated!</strong>
            {upgradeSuccess}
          </div>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Tier */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active Plan</span>
            <span className={`w-2 h-2 rounded-full ${isSubscribed ? "bg-emerald-500" : "bg-slate-300"}`}></span>
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 leading-snug">{currentPlan.name}</span>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Renewal</span>
            <strong className={isSubscribed ? "text-emerald-700 font-bold" : "text-slate-500 font-medium"}>
              {isSubscribed ? `${daysRemainingInCycle} Days Left` : "Free Operational Tier"}
            </strong>
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
              {remainingSqft <= 0 ? "Capacity Exhausted (Upgrade Required)" : "Unused Capacity"}
            </strong>
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

      {/* Properties Contributing to Quota Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Properties Contributing to Quota</h3>
            <p className="text-xs text-slate-500">Active commercial assets tallied towards your licensed square footage</p>
          </div>
          <Link
            href="/properties/registry"
            className="text-xs font-bold text-[#0F8B7D] hover:underline inline-flex items-center gap-1"
          >
            Manage Properties <ArrowRight size={13} />
          </Link>
        </div>

        {portfolioData?.properties && portfolioData.properties.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
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
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl p-4">
            <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No properties currently registered</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When you onboard properties in the Property Registry, their area automatically tallies against this quota.
            </p>
            {remainingSqft <= 0 ? (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer"
              >
                <Sparkles size={13} /> Upgrade Plan to Add Properties
              </button>
            ) : (
              <Link
                href="/operate/properties?action=add_property"
                className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-[#0c6e63] transition"
              >
                <Plus size={13} /> Add Property
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Upgrade & Capacity Expansion Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Expand Portfolio Capacity</h3>
                  <p className="text-xs text-slate-500">Upgrade your tier or add custom square footage to unlock registration headroom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setUpgradeMode("tiers")}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  upgradeMode === "tiers"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers size={13} />
                <span>Preset Plan Tiers</span>
              </button>
              <button
                type="button"
                onClick={() => setUpgradeMode("custom_sqft")}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  upgradeMode === "custom_sqft"
                    ? "bg-white text-[#0F8B7D] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sliders size={13} />
                <span>Custom Sq.Ft Addition</span>
              </button>
            </div>

            {upgradeMode === "tiers" ? (
              /* Target Tier Selection */
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Select Plan Tier:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedTierId(plan.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        selectedTierId === plan.id
                          ? "border-[#0F8B7D] bg-teal-50/50 ring-1 ring-[#0F8B7D]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">{plan.name}</span>
                          {selectedTierId === plan.id && <CheckCircle2 size={16} className="text-[#0F8B7D]" />}
                        </div>
                        <span className="text-[11px] font-bold text-[#0F8B7D] block mb-1">{plan.scope}</span>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{plan.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Square Footage Adder */
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-[#0F8B7D]" />
                    <span>Select or Type Desired Additional Square Footage:</span>
                  </label>
                  <span className="text-xs font-black font-mono text-[#0F8B7D] bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    +{customAddSqft.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>

                {/* Quick Add Increment Chips */}
                <div className="flex flex-wrap gap-2">
                  {[25000, 50000, 100000, 250000, 500000, 1000000, 500000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCustomAddSqft(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        customAddSqft === val
                          ? "bg-[#0F8B7D] text-white shadow-2xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      +{val >= 10000000 ? `${(val / 10000000).toLocaleString("en-IN")} Cr` : val >= 100000 ? `${(val / 100000).toLocaleString("en-IN")} Lakh` : `${(val / 1000).toLocaleString("en-IN")}k`} sq.ft
                    </button>
                  ))}
                </div>

                {/* Direct Number Input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Or enter exact number:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={customAddSqft}
                      onChange={(e) => setCustomAddSqft(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 pr-16 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:border-[#0F8B7D] outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">sq.ft</span>
                  </div>
                </div>
              </div>
            )}

            {/* Real-Time Live Math Breakdown Card */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-teal-900">
                  <TrendingUp size={14} className="text-[#0F8B7D]" />
                  <span>Real-Time Capacity Quota Calculation</span>
                </span>
                <span className="font-mono text-teal-800 font-bold">
                  {projectedUsagePct}% projected use
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white/80 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-slate-400 block">Current Portfolio</span>
                  <strong className="font-mono text-slate-900 text-xs">
                    {currentPortfolioSqft.toLocaleString("en-IN")} sq.ft
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-slate-400 block">Current Cap</span>
                  <strong className="font-mono text-slate-900 text-xs">
                    {currentCapSqft.toLocaleString("en-IN")} sq.ft
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-teal-700 font-bold block">New Total Cap</span>
                  <strong className="font-mono text-[#0F8B7D] text-xs font-black">
                    {projectedNewCapSqft.toLocaleString("en-IN")} sq.ft
                  </strong>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">New Headroom</span>
                  <strong className={`font-mono text-xs font-black ${projectedRemainingHeadroom > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {projectedRemainingHeadroom.toLocaleString("en-IN")} sq.ft
                  </strong>
                </div>
              </div>

              {/* Status Notice Banner */}
              {projectedRemainingHeadroom > 0 ? (
                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-100/60 p-2 rounded-lg">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>
                    ✓ Headroom Available: You will have <strong>{projectedRemainingHeadroom.toLocaleString("en-IN")} sq.ft</strong> free capacity to register new properties and units!
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5 bg-amber-100/60 p-2 rounded-lg">
                  <AlertCircle size={13} className="text-amber-600 shrink-0" />
                  <span>
                    Notice: Your portfolio ({currentPortfolioSqft.toLocaleString("en-IN")} sq.ft) still exceeds this cap by {(currentPortfolioSqft - projectedNewCapSqft).toLocaleString("en-IN")} sq.ft. Select Portfolio Enterprise tier or add more sq.ft.
                  </span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 block">Partner / Promo Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. OFFICEX100, RENTROLL12"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono focus:border-[#0F8B7D] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-semibold ${couponMsg.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                  {couponMsg.text}
                </p>
              )}
            </form>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgrading || (upgradeMode === "tiers" && selectedTierId === currentPlanId && customAddSqft <= 0)}
                onClick={handleExecuteUpgrade}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {upgrading
                  ? "Updating..."
                  : upgradeMode === "custom_sqft"
                  ? `Expand Capacity by +${customAddSqft.toLocaleString("en-IN")} sq.ft`
                  : `Upgrade to ${targetPlan.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

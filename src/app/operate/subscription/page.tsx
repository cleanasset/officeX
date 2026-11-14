"use client";

import React, { useState, useEffect } from "react";
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
  FileSpreadsheet
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import { SUBSCRIPTION_PLAN_OPTIONS, SubscriptionPlanTier } from "@/components/SubscriptionGate";

export default function SubscriptionAndQuotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "techpark" | "reit-mega">("techpark");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [upgrading, setUpgrading] = useState(false);

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
          setSelectedPlanId(sJson.plan === "starter" ? "techpark" : sJson.plan === "techpark" ? "reit-mega" : "reit-mega");
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

  // Capacity calculations
  const maxPlanCapSqft =
    currentPlanId === "starter" ? 50000 :
    currentPlanId === "techpark" ? 250000 : 50000000;

  const currentPortfolioSqft = portfolioData?.totalAreaSqft || portfolioData?.totalArea || 0;
  const remainingSqft = Math.max(0, maxPlanCapSqft - currentPortfolioSqft);
  const usagePct = Math.min(100, Math.round((currentPortfolioSqft / maxPlanCapSqft) * 100));

  const targetPlan = SUBSCRIPTION_PLAN_OPTIONS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLAN_OPTIONS[2];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "OFFICEX100" || clean === "RENTROLL12" || clean === "FREE100") {
      setCouponMsg({ text: `🎉 Coupon '${clean}' applied: 100% Free Plan Upgrade!`, type: "success" });
    } else {
      setCouponMsg({ text: "Invalid coupon. Use OFFICEX100 or RENTROLL12 for full access.", type: "error" });
    }
  };

  const handleConfirmUpgrade = async () => {
    try {
      setUpgrading(true);
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "active_user") : "active_user";
      
      const res = await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          coupon: couponCode.trim().toUpperCase() || "OFFICEX100",
          paymentId: "UPGRADE_" + Date.now(),
          plan: targetPlan.id,
          plan_name: targetPlan.name,
          duration_months: 12,
          billing_cycle: "annual",
          amount: 0,
        }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_subscription", "active");
          localStorage.setItem("officex_subscription_plan", targetPlan.id);
          localStorage.setItem("officex_selected_plan", targetPlan.id);
          document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
        }
        setUpgradeModalOpen(false);
        loadData();
      }
    } catch {
      alert("Failed to process plan upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />
        <main className="flex-1 mt-[60px] p-4 sm:p-6 md:p-8 overflow-y-auto min-w-0 max-w-full pb-24 md:pb-8">
          <div className="max-w-6xl w-full mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 rounded">
                    Account &amp; Portfolio Quota
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Rent Roll Management Suite</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <ShieldCheck className="text-[#0D7B6C] w-7 h-7" />
                  Subscription &amp; Capacity Quota
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage your active licensing tier, square footage capacity allocation, and portfolio utilization.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Upgrade Plan / Add Sq.Ft</span>
                </button>
              </div>
            </div>

            {/* Active Plan Card & Quota Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Plan Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      Active License
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{currentPlan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{currentPlan.description}</p>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Licensed Capacity Cap:</span>
                      <strong className="text-slate-900 font-mono">{maxPlanCapSqft.toLocaleString("en-IN")} sq.ft</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Billing Frequency:</span>
                      <strong className="text-slate-900 capitalize">{subData?.billing_cycle || "Monthly / Annual"}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>License Renewal:</span>
                      <strong className="text-teal-700 font-semibold">{subData?.days_remaining || 365} Days Remaining</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Change Plan Tier</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Portfolio Quota Usage Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio Quota Utilization</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {usagePct}% Utilized
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">TOTAL CAPACITY</span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        {maxPlanCapSqft.toLocaleString("en-IN")} <span className="text-xs font-normal text-slate-500">sq.ft</span>
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
                      <span className="text-[11px] font-bold text-teal-700 block mb-1">CURRENTLY MANAGED</span>
                      <span className="text-lg font-black text-teal-950 font-mono">
                        {currentPortfolioSqft.toLocaleString("en-IN")} <span className="text-xs font-normal text-teal-600">sq.ft</span>
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">REMAINING QUOTA</span>
                      <span className="text-lg font-black text-emerald-950 font-mono">
                        {remainingSqft.toLocaleString("en-IN")} <span className="text-xs font-normal text-emerald-600">sq.ft</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          usagePct > 90 ? "bg-rose-500" : usagePct > 70 ? "bg-amber-500" : "bg-teal-600"
                        }`}
                        style={{ width: `${Math.max(4, usagePct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>0 sq.ft</span>
                      <span>{maxPlanCapSqft.toLocaleString("en-IN")} sq.ft limit</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-500">
                    Need additional capacity for a new commercial building or tech park?
                  </span>
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="text-teal-700 hover:text-teal-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Calculate Add-On Capacity <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Contributing to Quota */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Portfolio Properties In Scope</h3>
                  <p className="text-xs text-slate-500">Square footage breakdown contributing to your licensed quota</p>
                </div>
                <Link
                  href="/properties/rent-roll"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
                >
                  View Rent Roll Register <ArrowRight size={13} />
                </Link>
              </div>

              {portfolioData?.properties && portfolioData.properties.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {portfolioData.properties.map((p: any) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
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
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
                  No properties currently registered in this account. Onboard properties in Rent Roll to utilize your quota.
                </div>
              )}
            </div>

            {/* How Upgrade & Capacity Calculations Work Section */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 uppercase tracking-wider">
                  Licensing Mechanics
                </span>
                <span className="text-xs text-slate-400">Institutional Governance</span>
              </div>
              <h3 className="text-lg font-black tracking-tight">How Plan Upgrades &amp; Sq.Ft Calculations Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs text-slate-300">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="font-bold text-white block">1. Universal Portfolio Floor</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    The platform automatically tallies the cumulative leasable square footage of all registered buildings and units. Your plan quota dynamically adapts to cover your portfolio size.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="font-bold text-white block">2. Exceeding Quota Threshold</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    When you onboard a new property or tower that pushes total square footage past your plan cap (e.g. above 2,50,000 sq.ft), the system enables seamless upgrade to the higher REIT tier without interrupting daily operations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="font-bold text-white block">3. Prorata Cycle Calculation</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    When switching or expanding tiers mid-billing cycle, upgrades are calculated prorata based on remaining days, crediting unspent balances from your current active plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </div>

      {/* Upgrade & Plan Switcher Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Upgrade Subscription Plan</h3>
                  <p className="text-xs text-slate-500">Expand licensed portfolio square footage capacity</p>
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

            {/* Plan Options Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Select Target Tier:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedPlanId === plan.id
                        ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900">{plan.name}</span>
                        {selectedPlanId === plan.id && <CheckCircle2 size={16} className="text-teal-600" />}
                      </div>
                      <span className="text-[11px] font-bold text-teal-700 block mb-1">{plan.scope}</span>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{plan.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Have a Partner / Promo Coupon?</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. OFFICEX100, RENTROLL12"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono focus:border-teal-600 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-medium ${couponMsg.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                  {couponMsg.text}
                </p>
              )}
            </form>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={upgrading}
                onClick={handleConfirmUpgrade}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {upgrading ? "Activating Upgrade..." : `Activate ${targetPlan.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


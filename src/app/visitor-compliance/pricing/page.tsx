"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  QrCode,
  Users,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  Building2,
  Check,
  X,
  Tag,
  Zap,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function VisitorCompliancePricingPage() {
  const router = useRouter();

  // State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    badge: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const basePrice = billingCycle === "monthly" ? 999 : 849;
  const currentPrice = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

  // Validate coupon handler
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
        body: JSON.stringify({ code: couponCode }),
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
    } catch (err: any) {
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Checkout flow
  const handleCheckout = async () => {
    setIsLoadingCheckout(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/vc/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: "Commercial Pass",
          billingCycle,
          couponCode: appliedCoupon?.code || "",
          orgName: "CyberCity Commercial Towers",
          orgId: "org_officex_demo",
          userEmail: "admin@commercialtower.com",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to initialize subscription checkout");
      }

      // If 100% off via coupon visitor001 -> immediate activation!
      if (data.freeAccess) {
        router.push("/vc/dashboard?activated=free");
        return;
      }

      // Standard Razorpay Modal
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh the page.");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "OFFICEX Visitor & Compliance",
        description: `Commercial Pass (${billingCycle} subscription)`,
        order_id: data.orderId,
        image: "/favicon.ico",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/vc/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orgId: "org_officex_demo",
                orgName: "CyberCity Commercial Towers",
                planName: "Commercial Pass",
                billingCycle,
                amount: `${basePrice}.00`,
                couponCode: appliedCoupon?.code || "",
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push("/vc/dashboard?activated=paid");
            } else {
              setErrorMessage(verifyData.message || "Payment verification failed.");
            }
          } catch (vErr: any) {
            setErrorMessage("Error confirming payment. Please contact support.");
          }
        },
        prefill: {
          name: "Building Admin",
          email: "admin@commercialtower.com",
          contact: "+919876543210",
        },
        theme: {
          color: "#0F172A",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setErrorMessage(resp.error.description || "Payment was not completed.");
      });
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to proceed to payment");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const featureList = [
    { name: "Full Visitor Management (VC-01 to VC-15)", included: true },
    { name: "Compliance Register & EHS Radar (CM-01 to CM-16)", included: true },
    { name: "Instant QR Check-In & Digital Fast-Pass", included: true },
    { name: "Host Approval Workflows & Mobile Alerts", included: true },
    { name: "Live Visitors Inside & Overstay Monitor", included: true },
    { name: "1-Click Emergency Roll Call & Evacuation MIS", included: true },
    { name: "Contractor, Vendor & Delivery Registers", included: true },
    { name: "Security Watchlist & Blacklist Enforcement", included: true },
    { name: "Statutory, Lift, Fire & HVAC License Tracking", included: true },
    { name: "Digital Inspection Checklists & CAPA Tracker", included: true },
    { name: "Custom Access Zones & Speed-Gate Integration", included: true },
    { name: "Multi-Property & Multi-Tenant Isolation", included: true },
    { name: "Exportable Audit Trails & Compliance Reports", included: true },
    { name: "Role-Based Permissions & Receptionist Kiosk Mode", included: true },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Header */}
      <MarketingHeader activePath="/pricing" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Commercial SaaS Launch Edition
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Commercial Security & Compliance.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Flat ₹999 / Month.
            </span>
          </h1>

          <p className="mt-4 text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Replace manual guard logbooks, clipboard sign-ins, and scattered statutory compliance spreadsheets. The enterprise alternative to residential apps, tailored specifically for Grade-A commercial office buildings.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 inline-flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annual Billing
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                Save 15%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Pricing & Checkout Card */}
      <section className="pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Ambient Corner Accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Plan Details & Price */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                      All-Inclusive Package
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      31 SaaS Modules
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Commercial Facility Pass
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Complete suite for Commercial Towers, Tech Parks, and Managed Office Floors.
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-baseline justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Subscription Investment
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      {appliedCoupon && appliedCoupon.finalPrice === 0 ? (
                        <>
                          <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                            ₹0
                          </span>
                          <span className="text-lg text-slate-500 line-through">
                            ₹{basePrice}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">/ month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl sm:text-5xl font-black text-white">
                            ₹{currentPrice}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            / month ({billingCycle === "annual" ? "billed annually" : "billed monthly"})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {appliedCoupon && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      {appliedCoupon.badge}
                    </div>
                  )}
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Included in this plan:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {featureList.slice(0, 8).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{f.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1">
                    <span className="text-[11px] text-blue-400 font-medium hover:underline cursor-pointer">
                      + 23 more screens & features included without extra fee
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Checkout Action & Coupon Engine */}
              <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Activate Subscription
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Instant deployment. Zero hardware dependency.
                  </p>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    Have a promo or partner code?
                  </label>

                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder="e.g. visitor001"
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono tracking-wider"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingCoupon || !couponCode.trim()}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                      >
                        {isVerifyingCoupon ? "Checking..." : "Apply"}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-mono font-bold text-emerald-300 uppercase">
                            {appliedCoupon.code}
                          </div>
                          <div className="text-[11px] text-emerald-400/90">
                            100% OFF Launch Partner Discount Applied
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-slate-400 hover:text-white p-1 rounded-md"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {couponSuccess && !appliedCoupon && (
                    <p className="text-xs text-emerald-400">{couponSuccess}</p>
                  )}
                  {couponError && (
                    <p className="text-xs text-rose-400">{couponError}</p>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <span>💡 Tip: Enter</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode("visitor001");
                        handleApplyCoupon();
                      }}
                      className="text-blue-400 font-mono font-bold hover:underline"
                    >
                      visitor001
                    </button>
                    <span>for 100% free activation.</span>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Subscription</span>
                    <span>₹{basePrice}/mo</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Total Due Today</span>
                    <span className={appliedCoupon?.finalPrice === 0 ? "text-emerald-400 text-lg" : "text-white text-lg"}>
                      ₹{currentPrice}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoadingCheckout}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                    appliedCoupon && appliedCoupon.finalPrice === 0
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
                  }`}
                >
                  {isLoadingCheckout ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Configuring Workspace...</span>
                    </div>
                  ) : appliedCoupon && appliedCoupon.finalPrice === 0 ? (
                    <>
                      <span>Activate Free Access with visitor001</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Proceed with Razorpay (₹{currentPrice})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    SSL Encrypted
                  </span>
                  <span>•</span>
                  <span>Razorpay Verified</span>
                  <span>•</span>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Residential Apps (MyGate) vs OFFICEX Commercial */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-900 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Why OFFICEX?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Built for Commercial Towers, Not Gated Housing Societies
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Residential security apps don’t understand multi-tenant floor leases, contractor permit-to-work requirements, or fire & lift statutory mandates.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Capability</th>
                  <th className="py-3.5 px-4 sm:px-6 text-slate-400">Residential Apps (MyGate / NoBroker)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-emerald-400 bg-emerald-950/20 font-extrabold">
                    OFFICEX Commercial SaaS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">Domain Target</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-400">Apartments & Housing societies</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    Grade-A Commercial Offices & Tech Parks
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">Tenant & Lease Isolation</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-500">❌ Single flat numbers only</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    ✅ Enterprise multi-tenant isolation with company hosts
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">Statutory Compliance (Fire, Lift, PCB)</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-500">❌ Not supported</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    ✅ Full 16-screen statutory compliance engine with scoring
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">Hot Work & Height Contractor Permits</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-500">❌ No work permit lifecycles</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    ✅ Digital PTW permit approval & vendor safety checks
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">1-Click Emergency Roll Call</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-500">❌ Inaccurate occupant logs</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    ✅ Real-time evacuation roll call by tower, floor & zone
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 sm:px-6 font-medium">Pricing Model</td>
                  <td className="py-3 px-4 sm:px-6 text-slate-400">Per flat high recurring maintenance fees</td>
                  <td className="py-3 px-4 sm:px-6 text-emerald-300 bg-emerald-950/10 font-bold">
                    Flat ₹999/month per facility (or free with visitor001)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-extrabold text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white">
              How does the coupon code visitor001 work?
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Applying the code <code className="text-emerald-400 font-mono">visitor001</code> gives you a 100% discount on the Commercial Pass. You can activate your account immediately without entering credit card or payment details.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white">
              Do we need specialized hardware turnstiles or biometric kiosks?
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              No. OFFICEX Visitor Management works seamlessly using standard tablets, web browsers at reception, and smartphones. If you have turnstiles or speed-gates, our webhook APIs can integrate with your existing access controllers.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white">
              Is this SaaS module separate from the Rent Roll module?
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Yes! The Visitor & Compliance SaaS operates with its own standalone dashboard, its own navigation, its own reports, and dedicated billing. It is not connected to Rent Roll, though it shares the same secure OFFICEX enterprise foundation.
            </p>
          </div>
        </div>
      </section>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

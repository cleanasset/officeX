"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink,
  Download,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function VisitorComplianceBillingPage() {
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponErr, setCouponErr] = useState("");
  const [activePlan, setActivePlan] = useState({
    name: "Commercial Facility Pass",
    amount: "₹999.00 / month",
    status: "Active",
    discountBadge: "100% OFF (visitor001)",
    renewalDate: "November 25, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Razorpay Verified / VIP Partner Code",
  });

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch("/api/vc/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponMsg(`Coupon ${data.code} validated! ${data.badge}`);
        setCouponErr("");
        setActivePlan((prev) => ({
          ...prev,
          discountBadge: data.badge,
        }));
      } else {
        setCouponErr(data.message || "Invalid coupon");
        setCouponMsg("");
      }
    } catch (err: any) {
      setCouponErr("Failed to validate coupon");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
          <span>/</span>
          <span className="text-blue-400 font-bold">Billing & Subscription</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">SaaS Plan & Billing Management</h1>
        <p className="text-xs text-slate-400">
          Manage your flat ₹999/month commercial facility license, apply promotional partner codes, and view invoice history.
        </p>
      </div>

      {/* Active License Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                Current Subscription
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active & Verified
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2">{activePlan.name}</h2>
            <div className="text-xs text-slate-400 mt-1">
              Includes all 15 Visitor screens (VC-01 to VC-15) & 16 Compliance screens (CM-01 to CM-16).
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {activePlan.amount}
            </div>
            <span className="inline-block mt-1 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
              {activePlan.discountBadge}
            </span>
          </div>
        </div>

        {/* License Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-500">Billing Cycle</div>
            <div className="text-slate-200 font-bold mt-0.5">{activePlan.billingCycle}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-500">Next Scheduled Renewal</div>
            <div className="text-slate-200 font-bold mt-0.5">{activePlan.renewalDate}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-500">Gateway Provider</div>
            <div className="text-slate-200 font-bold mt-0.5">{activePlan.paymentMethod}</div>
          </div>
        </div>

        {/* Apply Partner Coupon Form */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Apply Coupon or Launch Discount Code</span>
          </label>

          <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. visitor001"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              Apply Code
            </button>
          </form>

          {couponMsg && <p className="text-xs text-emerald-400 font-medium">{couponMsg}</p>}
          {couponErr && <p className="text-xs text-rose-400 font-medium">{couponErr}</p>}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white">Billing & Payment Invoices</h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Invoice ID</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-mono text-blue-400 font-bold">INV-VC-2026-001</td>
                <td className="py-3 px-4">Oct 25, 2026</td>
                <td className="py-3 px-4">Commercial Pass (Launch Partner Coupon visitor001)</td>
                <td className="py-3 px-4 font-bold text-emerald-400">₹0.00 (100% off)</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    PAID
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => alert("Downloading GST tax receipt...")}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Plus,
  Send,
  FileCheck,
} from "lucide-react";

interface ExpiringLease {
  id: string;
  contract_code: string;
  occupant_name: string;
  property_name: string;
  space_name: string;
  chargeable_area: number;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  days_to_expiry: number;
  time_bucket: "0_90" | "91_180" | "181_365" | "365_plus";
  renewal_stage: "upcoming" | "in_negotiation" | "terms_offered" | "extension_agreed" | "notice_served" | "overholding";
  notice_period_days: number;
  lock_in_end_date?: string;
}

export default function LeaseRenewalsPipelinePage() {
  const [leases, setLeases] = useState<ExpiringLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rent-roll/expiry-pipeline");
      const json = await res.json();
      if (json.success || json.leases) {
        setLeases(json.leases || []);
      }
    } catch (e) {
      console.error("Failed to load renewal pipeline:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleInitiateRenewal = async (lease: ExpiringLease) => {
    if (!confirm(`Initiate formal contract renewal for ${lease.occupant_name} (${lease.contract_code})?`)) return;
    try {
      setActingId(lease.id);
      const res = await fetch(`/api/contracts/${lease.id}/renew`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "Draft renewal contract created in Rent Roll!");
        fetchRenewals();
      } else {
        alert(json.error || "Failed to initiate renewal");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleServeNotice = async (lease: ExpiringLease) => {
    if (!confirm(`Mark notice served for ${lease.occupant_name}? Space will be flagged as Vacating in the Interactive Stacking Plan.`)) return;
    try {
      setActingId(lease.id);
      const res = await fetch(`/api/contracts/${lease.id}/notice`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        alert("Notice served status updated.");
        fetchRenewals();
      } else {
        alert(json.error || "Failed to update notice status");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActingId(null);
    }
  };

  const filtered = leases.filter((l) => {
    if (selectedBucket !== "all" && l.time_bucket !== selectedBucket) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.contract_code.toLowerCase().includes(q) ||
        l.occupant_name.toLowerCase().includes(q) ||
        l.property_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalExpiringArea = leases.reduce((s, l) => s + (l.chargeable_area || 0), 0);
  const totalExpiringRent = leases.reduce((s, l) => s + (l.monthly_rent || 0), 0);
  const urgentCount = leases.filter((l) => l.time_bucket === "0_90").length;
  const inNegotiationCount = leases.filter((l) => l.renewal_stage === "in_negotiation" || l.renewal_stage === "terms_offered").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              Screen S-24 &middot; Expiry Pipeline
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Tenure Risk & Renewal CRM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Lease Expiry Pipeline & Renewal Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor lease tenure expiries in 0-90, 91-180, 181-365, and 365+ day bands, track renewal negotiation stages, and execute renewal agreements.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/operate/stacking"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200"
          >
            Stacking Plan (S-26)
          </Link>

          <button
            onClick={fetchRenewals}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Urgent Expiries (0–90 Days)
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {urgentCount} Leases
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requires immediate renewal decision
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Monthly Rent at Risk
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{totalExpiringRent.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Expiring across all portfolios
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Under Active Negotiation
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            {inNegotiationCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Terms sheets / proposals issued
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Leasable Area Expiring
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {totalExpiringArea.toLocaleString("en-IN")} sqft
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total rollover area in pipeline
          </div>
        </div>
      </div>

      {/* Filter and Bucket Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tenant, contract code, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "All Horizons" },
            { key: "0_90", label: "0–90 Days" },
            { key: "91_180", label: "91–180 Days" },
            { key: "181_365", label: "181–365 Days" },
            { key: "365_plus", label: "365+ Days" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedBucket(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedBucket === tab.key ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-bold text-slate-700">No Expiring Leases Found</div>
            <p className="text-xs text-slate-500 mt-1">No lease agreements expiring within the selected horizon.</p>
          </div>
        ) : (
          filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{l.occupant_name}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{l.contract_code} &bull; {l.property_name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  l.days_to_expiry <= 90 ? "bg-rose-100 text-rose-800" :
                  l.days_to_expiry <= 180 ? "bg-amber-100 text-amber-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {l.days_to_expiry}d to Expiry
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Space & Area:</span>
                  <span className="font-medium text-slate-800">{l.space_name} ({l.chargeable_area.toLocaleString("en-IN")} sqft)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract End Date:</span>
                  <span className="font-bold text-slate-900">{l.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stage:</span>
                  <span className="font-semibold text-indigo-700 capitalize">{l.renewal_stage.replace("_", " ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</div>
                  <div className="text-base font-black text-slate-900 font-mono">₹{l.monthly_rent.toLocaleString("en-IN")}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleInitiateRenewal(l)}
                    disabled={actingId === l.id}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Renew
                  </button>
                  <button
                    onClick={() => handleServeNotice(l)}
                    disabled={actingId === l.id}
                    className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold"
                  >
                    Notice
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Contract & Tenant</th>
                <th className="py-3 px-4">Space & Area</th>
                <th className="py-3 px-4 text-right">Monthly Rent (₹)</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Days to Expiry</th>
                <th className="py-3 px-4">Renewal Stage</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No lease contracts expiring within the selected horizon.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{l.occupant_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{l.contract_code} &bull; {l.property_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{l.space_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.chargeable_area.toLocaleString("en-IN")} sqft</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{l.monthly_rent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.end_date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.days_to_expiry <= 90 ? "bg-rose-100 text-rose-800" :
                        l.days_to_expiry <= 180 ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {l.days_to_expiry} days
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                      {l.renewal_stage.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleInitiateRenewal(l)}
                          disabled={actingId === l.id}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <FileCheck className="w-3 h-3 text-emerald-400" /> Renew
                        </button>
                        <button
                          onClick={() => handleServeNotice(l)}
                          disabled={actingId === l.id}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-semibold"
                        >
                          Notice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

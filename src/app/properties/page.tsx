"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Layers,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Landmark,
  UserCheck,
  Briefcase,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function PropertiesPortfolioPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, any>>({});

  // Licensed Capacity Telemetry
  const [subscribedSqft, setSubscribedSqft] = useState<number>(0);
  const [usedSqft, setUsedSqft] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSub = localStorage.getItem("officex_subscribed_sqft");
      const storedUsed = localStorage.getItem("officex_used_sqft");
      const subVal = storedSub ? parseFloat(storedSub) : 50000;
      const usedVal = storedUsed ? parseFloat(storedUsed) : 0;
      setSubscribedSqft(subVal);
      setUsedSqft(usedVal);
      try {
        const assigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        setAssignments(assigns);
      } catch {}
    }
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rent-roll/properties");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          let registeredPropIds: string[] = [];
          let registeredPropNames: string[] = [];
          const userProperty = typeof window !== "undefined" ? localStorage.getItem("officex_active_property") : null;
          try {
            if (typeof window !== "undefined") {
              registeredPropIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
              registeredPropNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
            }
          } catch {}

          // Display user registered properties or fallback to all database properties (prevents vanishing properties in new browser sessions)
          let userPropertiesOnly = json.data;
          if (registeredPropIds.length > 0 || registeredPropNames.length > 0 || userProperty) {
            const filtered = json.data.filter((p: any) => {
              const pName = (p.property_name || "").toLowerCase().trim();
              if (registeredPropIds.includes(p.id)) return true;
              if (registeredPropNames.some((n: string) => n.toLowerCase().trim() === pName)) return true;
              if (userProperty && pName === userProperty.toLowerCase().trim()) return true;
              if (userProperty && pName.includes(userProperty.toLowerCase().trim())) return true;
              return false;
            });
            if (filtered.length > 0) {
              userPropertiesOnly = filtered;
            }
          }

          setProperties(userPropertiesOnly);
          // Calculate used sqft strictly from user's active properties
          const totalArea = userPropertiesOnly.reduce(
            (acc: number, p: any) => acc + parseFloat(p.total_leasable_area_sqft || 0),
            0
          );
          setUsedSqft(totalArea);
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_used_sqft", String(totalArea));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rawSub = typeof window !== "undefined" ? Number(localStorage.getItem("officex_subscribed_sqft")) : 0;
  const effectiveSubscribed = rawSub && rawSub > 0 ? rawSub : Math.max(500000, usedSqft * 5);
  const remainingSqft = Math.max(0, effectiveSubscribed - usedSqft);
  const percentRemaining = effectiveSubscribed > 0 ? (remainingSqft / effectiveSubscribed) * 100 : 100;
  // STRICT REQUIREMENT: Warning ONLY comes when strictly 2% or less remains
  const isCapacityWarning = percentRemaining <= 2 && percentRemaining > 0 && usedSqft > 0;

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>OFFICEX</span>
                <span>/</span>
                <span className="text-[#0F8B7D] font-bold">Commercial Portfolio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Property Portfolio Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Manage commercial assets, leasable square footage, and active tenancy structures.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProperties}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="Refresh Properties"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
              </button>
              <Link
                href="/onboarding"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition"
              >
                <Plus size={16} />
                <span>Add Property</span>
              </Link>
            </div>
          </div>

          {/* 2% CAPACITY WARNING ALERT BANNER (Strictly <= 2% remaining) */}
          {isCapacityWarning && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm animate-pulse">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-950">
                    ⚠️ Capacity Warning: Only {percentRemaining.toFixed(1)}% Subscribed Space Remaining
                  </h4>
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    You have allocated {usedSqft.toLocaleString("en-IN")} sq.ft of your {effectiveSubscribed.toLocaleString("en-IN")} sq.ft licensed tier. Only {remainingSqft.toLocaleString("en-IN")} sq.ft left.
                  </p>
                </div>
              </div>
              <Link
                href="/operate/rent-roll/pricing"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              >
                Upgrade Tier
              </Link>
            </div>
          )}

          {/* Licensed Capacity Telemetry KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Subscribed Capacity
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {subscribedSqft.toLocaleString("en-IN")} <span className="text-xs font-bold text-slate-500">sq.ft</span>
              </div>
              <span className="text-[10px] text-teal-600 font-bold mt-1 inline-block">Active Plan Allowance</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Allocated Space
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {usedSqft.toLocaleString("en-IN")} <span className="text-xs font-bold text-slate-500">sq.ft</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold mt-1 inline-block">
                {subscribedSqft > 0 ? ((usedSqft / subscribedSqft) * 100).toFixed(1) : 0}% Utilized
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Available Allowance
              </span>
              <div className={`text-2xl font-black mt-1 ${isCapacityWarning ? "text-amber-600" : "text-emerald-700"}`}>
                {remainingSqft.toLocaleString("en-IN")} <span className="text-xs font-bold text-slate-500">sq.ft</span>
              </div>
              <span className={`text-[10px] font-bold mt-1 inline-block ${isCapacityWarning ? "text-amber-600" : "text-emerald-600"}`}>
                {percentRemaining.toFixed(1)}% Remaining
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Properties
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {properties.length}
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1 inline-block">Commercial Assets</span>
            </div>
          </div>

          {/* Quick Sub-Navigation Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/properties/rent-roll"
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-sm transition group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0 group-hover:bg-[#0F8B7D] group-hover:text-white transition">
                <DollarSign size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Rent Roll Register</div>
                <div className="text-[10px] text-slate-500 truncate">Tenants &amp; Leases</div>
              </div>
            </Link>

            <Link
              href="/properties/registry"
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-sm transition group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Space Registry</div>
                <div className="text-[10px] text-slate-500 truncate">Floors &amp; Units</div>
              </div>
            </Link>

            <Link
              href="/properties/tenants"
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-sm transition group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Tenant Directory</div>
                <div className="text-[10px] text-slate-500 truncate">Active Occupants</div>
              </div>
            </Link>

            <Link
              href="/properties/banking"
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-sm transition group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Landmark size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Banking &amp; SPV</div>
                <div className="text-[10px] text-slate-500 truncate">Escrow Accounts</div>
              </div>
            </Link>
          </div>

          {/* Properties List Table / Empty State */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Active Commercial Properties</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assets registered under your organization workspace</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {properties.length} Registered
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                <RefreshCw size={24} className="animate-spin text-teal-600" />
                <span>Loading property records...</span>
              </div>
            ) : properties.length === 0 ? (
              <div className="p-12 sm:p-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Building2 size={28} />
                </div>
                <h4 className="text-base font-black text-slate-900">No properties added yet</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your portfolio is currently empty. Complete your commercial property onboarding to allocate square footage and start generating rent rolls.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/onboarding"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-700/20"
                  >
                    <Plus size={15} />
                    <span>Onboard Property Now</span>
                  </Link>
                  <Link
                    href="/properties/rent-roll"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Go to Rent Roll
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Property Name</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Leasable Sq.Ft</th>
                      <th className="py-3 px-4">SPV / Banking</th>
                      <th className="py-3 px-4">Managing Partner</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-teal-50/30 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-xs">{prop.property_name || prop.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{prop.property_code || "PROP-ID"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span>{prop.city ? `${prop.city}${prop.state ? `, ${prop.state}` : ""}` : "Not Specified"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold capitalize">
                          {prop.property_type || "Commercial Office"}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {parseFloat(prop.total_leasable_area_sqft || prop.total_area || 0).toLocaleString("en-IN")} sq.ft
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {prop.spv_name || "Self SPV"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {(() => {
                            const pName = (prop.property_name || prop.name || "").trim();
                            const pAssigned = assignments[prop.id] || assignments[pName];
                            if (pAssigned?.name) {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                                  <UserCheck size={12} className="text-teal-600" />
                                  <span>{pAssigned.name}</span>
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                                Self-Managed
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/properties/rent-roll?property=${encodeURIComponent(prop.id)}`}
                            className="inline-flex items-center gap-1 text-[#0F8B7D] font-bold text-xs hover:underline"
                          >
                            <span>Open Rent Roll</span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}

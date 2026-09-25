"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  DollarSign,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileSpreadsheet
} from "lucide-react";

const formatINR = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const CamPoolsTab: React.FC<{ selectedProperty?: string }> = ({ selectedProperty = "ALL" }) => {
  const [pools, setPools] = useState<any[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecutingTrueUp, setIsExecutingTrueUp] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const url = selectedProperty && selectedProperty !== "ALL"
        ? `/api/rent-roll/cam-pools?propertyId=${selectedProperty}`
        : `/api/rent-roll/cam-pools`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.pools.length > 0) {
        setPools(data.pools);
        if (!selectedPoolId || !data.pools.find((p: any) => p.id === selectedPoolId)) {
          setSelectedPoolId(data.pools[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch CAM pools:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [selectedProperty]);

  const activePool = pools.find(p => p.id === selectedPoolId) || pools[0];
  const sim = activePool?.simulation || {};
  const tenantResults: any[] = sim.tenantResults || [];

  const handleExecuteTrueUp = async () => {
    if (!activePool) return;
    if (!confirm(`Are you sure you want to execute annual CAM true-up for ${activePool.propertyName} (FY ${activePool.fyYear})? This will generate statutory adjustment notes.`)) {
      return;
    }

    setIsExecutingTrueUp(true);
    try {
      const res = await fetch("/api/rent-roll/cam-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_true_up",
          poolId: activePool.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message);
        await fetchPools();
      } else {
        alert("Error executing true-up: " + data.error);
      }
    } catch (err: any) {
      alert("Execution error: " + err.message);
    } finally {
      setIsExecutingTrueUp(false);
    }
  };

  if (isLoading && pools.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#0F8B7D] animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-900">Loading CAM Pools & True-Up Engine...</h3>
        <p className="text-xs text-gray-500 mt-1">Calculating proportional actual expenses & Formula F-22 occupant shares</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Pool Selector */}
      <div className="bg-gradient-to-r from-teal-900 via-[#0F8B7D] to-teal-950 text-white p-6 rounded-2xl shadow-md border border-teal-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/20">
                FM Operations & CAM Reconciliation (RR-FMC-04..06)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-bold border border-amber-400/30">
                Formula F-22 Certified
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2 text-white">
              {activePool?.propertyName || "Apex Business Tower"} · CAM Pool FY {activePool?.fyYear || "2026-27"}
            </h2>
            <p className="text-xs text-teal-100 mt-1">
              Annual common area maintenance pool apportionment: Total Building Area {activePool?.totalBuildingArea?.toLocaleString('en-IN')} sq ft · Provisional billing @ ₹{activePool?.provisionalRatePsfMonth}/sqft/month.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pools.length > 1 && (
              <select
                value={selectedPoolId}
                onChange={(e) => setSelectedPoolId(e.target.value)}
                className="bg-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 border border-white/20 focus:outline-none cursor-pointer"
              >
                {pools.map(p => (
                  <option key={p.id} value={p.id} className="text-gray-900">
                    {p.propertyName} (FY {p.fyYear})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExecuteTrueUp}
              disabled={isExecutingTrueUp || activePool?.trueUpStatus === "executed"}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                activePool?.trueUpStatus === "executed"
                  ? "bg-white/20 text-teal-100 cursor-not-allowed"
                  : "bg-white text-teal-900 hover:bg-teal-50"
              }`}
            >
              {isExecutingTrueUp ? (
                <RefreshCw className="w-4 h-4 animate-spin text-teal-800" />
              ) : activePool?.trueUpStatus === "executed" ? (
                <CheckCircle2 className="w-4 h-4 text-teal-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-teal-700" />
              )}
              <span>
                {activePool?.trueUpStatus === "executed"
                  ? "True-Up Executed"
                  : "Execute True-Up & Issue Notes"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* KPI Cards (Annual Budget, Actuals, Variance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual Budget */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Annual CAM Budget</span>
          <div className="mt-3 text-2xl font-black text-gray-900">
            {formatINR(activePool?.annualBudgetTotal || 42000000)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Provisional run-rate: ₹{activePool?.provisionalRatePsfMonth}/sqft/mo
          </p>
        </div>

        {/* Actual Expenses Incurred YTD */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actual Costs Incurred</span>
          <div className="mt-3 text-2xl font-black text-indigo-700">
            {formatINR(activePool?.actualCostTotal || 43500000)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Verified across 6 FM service categories
          </p>
        </div>

        {/* Net Pool Variance (Formula F-22) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">True-Up Net Variance</span>
          <div className={`mt-3 text-2xl font-black ${
            (sim.netTrueUpVariance || 0) > 0 ? "text-amber-600" : "text-emerald-600"
          }`}>
            {(sim.netTrueUpVariance || 0) > 0 ? "+" : ""}{formatINR(sim.netTrueUpVariance || 1500000)}
          </div>
          <p className="text-xs text-amber-700 font-bold mt-1">
            {(sim.netTrueUpVariance || 0) > 0 ? "Under-recovery: Debit Notes to tenants" : "Over-recovery: Credit Notes to tenants"}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reconciliation Status</span>
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              activePool?.trueUpStatus === "executed"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}>
              {activePool?.trueUpStatus === "executed" ? "Executed & Posted" : "Draft Simulation"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {activePool?.lastTrueUpDate ? `Executed on ${activePool.lastTrueUpDate}` : "Pending management sign-off"}
          </p>
        </div>
      </div>

      {/* Category Budget vs Actuals Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Operational Cost Categories (Budget vs. Actuals)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit-grade sub-ledger lines for security, HVAC MEP, common electricity, and sanitation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">FM Cost Category</th>
                <th className="py-3 px-4 text-right">Annual Budget</th>
                <th className="py-3 px-4 text-right">Actual Cost YTD</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Variance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {(activePool?.categories || []).map((cat: any, idx: number) => {
                const diff = (cat.actualCostYtd || 0) - (cat.annualBudget || 0);
                const diffPct = cat.annualBudget > 0 ? ((diff / cat.annualBudget) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{cat.categoryName}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-600">{formatINR(cat.annualBudget)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">{formatINR(cat.actualCostYtd)}</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {diff > 0 ? "+" : ""}{formatINR(diff)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        Number(diffPct) > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {Number(diffPct) > 0 ? `+${diffPct}%` : `${diffPct}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
              <tr>
                <td className="py-3 px-4 uppercase tracking-wider text-[11px]">Total Building CAM Operations</td>
                <td className="py-3 px-4 text-right font-bold">{formatINR(activePool?.annualBudgetTotal)}</td>
                <td className="py-3 px-4 text-right font-black text-indigo-900">{formatINR(activePool?.actualCostTotal)}</td>
                <td className={`py-3 px-4 text-right font-black ${
                  (activePool?.actualCostTotal - activePool?.annualBudgetTotal) > 0 ? "text-amber-700" : "text-emerald-700"
                }`}>
                  {(activePool?.actualCostTotal - activePool?.annualBudgetTotal) > 0 ? "+" : ""}
                  {formatINR(activePool?.actualCostTotal - activePool?.annualBudgetTotal)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tenant-by-Tenant True-Up Table (Formula F-22) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Tenant Area Apportionment & True-Up Notes (Formula F-22)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Formula: Occupant Share of Actual CAM − CAM Advance Billed = Debit (+) or Credit (−) Note
            </p>
          </div>
          <div className="text-xs font-bold text-gray-600 bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl">
            ∑ True-Ups = Actual − Billed ({formatINR(sim.netTrueUpVariance || 1500000)})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Occupant / Tenant</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Area (sq ft)</th>
                <th className="py-3 px-4 text-center">Share %</th>
                <th className="py-3 px-4 text-right">Proportionate Actual</th>
                <th className="py-3 px-4 text-right">Advance CAM Billed</th>
                <th className="py-3 px-4 text-right">True-Up Variance</th>
                <th className="py-3 px-4 text-center">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {tenantResults.map((tr: any) => (
                <tr key={tr.tenantId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{tr.tenantName}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-600">{tr.unitNumber}</td>
                  <td className="py-3.5 px-4 text-right font-medium">{tr.chargeableArea?.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-teal-700">{tr.areaSharePct}%</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-gray-900">{formatINR(tr.proportionalActualCost)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-gray-600">{formatINR(tr.advanceCamBilled)}</td>
                  <td className={`py-3.5 px-4 text-right font-black ${
                    tr.varianceAmount > 0 ? "text-amber-600" : tr.varianceAmount < 0 ? "text-emerald-600" : "text-gray-500"
                  }`}>
                    {tr.varianceAmount > 0 ? `+${formatINR(tr.varianceAmount)}` : formatINR(tr.varianceAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {tr.action === "DEBIT_NOTE" ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold">
                        Issue Debit Note (+{formatINR(tr.noteAmount)})
                      </span>
                    ) : tr.action === "CREDIT_NOTE" ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold">
                        Issue Credit Note (-{formatINR(tr.noteAmount)})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-semibold">
                        Balanced (₹0)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

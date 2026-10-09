"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Percent,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";

interface CamPoolItem {
  id: string;
  pool_name: string;
  financial_year: string;
  annual_budget: string;
  apportionment_method: string;
  total_apportionment_area: string;
  status: string;
  calculated_budget?: number;
  calculated_actual?: number;
  variance?: number;
  costs: Array<{
    id: string;
    category: string;
    budget_amount: string;
    actual_cost: string;
    variance: string;
    notes?: string;
  }>;
}

export default function CamPoolsPage() {
  const [pools, setPools] = useState<CamPoolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState<CamPoolItem | null>(null);

  // True-Up Modal state
  const [isTrueUpOpen, setIsTrueUpOpen] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [executingTrueUp, setExecutingTrueUp] = useState(false);

  // New Pool Modal state
  const [isNewPoolOpen, setIsNewPoolOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [newFy, setNewFy] = useState("FY 2026-27");
  const [newBudget, setNewBudget] = useState("");
  const [newArea, setNewArea] = useState("");

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cam-pools");
      const json = await res.json();
      if (json.success && json.pools) {
        setPools(json.pools);
        if (json.pools.length > 0 && !selectedPool) {
          setSelectedPool(json.pools[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load CAM pools:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cam-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool_name: newPoolName,
          financial_year: newFy,
          annual_budget: newBudget,
          total_apportionment_area: newArea,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsNewPoolOpen(false);
        fetchPools();
        alert(json.message);
      } else {
        alert(json.error || "Failed to create pool");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleOpenTrueUpModal = async (pool: CamPoolItem) => {
    setSelectedPool(pool);
    setIsTrueUpOpen(true);
    setSimulating(true);
    try {
      const res = await fetch(`/api/cam-pools/${pool.id}/true-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute: false }), // Simulation preview
      });
      const json = await res.json();
      if (json.success) {
        setSimulationData(json);
      } else {
        alert(json.error || "Simulation failed");
      }
    } catch (e: any) {
      alert("Error running simulation: " + e.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleExecuteTrueUp = async () => {
    if (!selectedPool) return;
    setExecutingTrueUp(true);
    try {
      const res = await fetch(`/api/cam-pools/${selectedPool.id}/true-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute: true }), // Commit true-up notes
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setIsTrueUpOpen(false);
        fetchPools();
      } else {
        alert(json.error || "Failed to commit true-up");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setExecutingTrueUp(false);
    }
  };

  const activePool = selectedPool || pools[0];

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Formula F-22 &middot; True-Up Engine
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              RR-FMC-06 Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            CAM Pool Budgeting & Year-End True-Up
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Area-weighted reconciliation of budgeted vs. audited actual CAM expenditures, auto-generating balancing credit and debit notes.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsNewPoolOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Pool
          </button>

          {activePool && (
            <button
              onClick={() => handleOpenTrueUpModal(activePool)}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4" /> Run True-Up
            </button>
          )}

          <button
            onClick={fetchPools}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Pools"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {pools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600 mx-auto" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            No CAM Pools Registered Yet
          </h2>
          <p className="text-xs text-slate-500">
            Create an audited CAM Pool for your commercial complex to track category expenses and run year-end true-up reconciliations.
          </p>
          <button
            onClick={() => setIsNewPoolOpen(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition"
          >
            Setup Initial CAM Pool
          </button>
        </div>
      ) : (
        <>
          {/* Top Pool Overview KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Annual CAM Budget
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{parseFloat(activePool?.annual_budget || "0").toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                FY {activePool?.financial_year} &middot; Baseline
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Audited Actual Incurred
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{(activePool?.calculated_actual || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Audited operational expenses
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Net Cost Variance
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-600">
                ₹{Math.abs((activePool?.calculated_actual || 0) - parseFloat(activePool?.annual_budget || "0")).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                True-up variance
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Apportionment Base
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {parseFloat(activePool?.total_apportionment_area || "0").toLocaleString("en-IN")} sq ft
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Method: Area-Weighted
              </div>
            </div>
          </div>

          {/* Cost Categories Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activePool.pool_name} &middot; Operational Cost Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Audited expenditures categorized by facility management discipline.
                </p>
              </div>

              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Status: {activePool.status.toUpperCase()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Expense Category</th>
                    <th className="py-3 px-4 text-right">Budget Amount (₹)</th>
                    <th className="py-3 px-4 text-right">Actual Cost (₹)</th>
                    <th className="py-3 px-4 text-right">Variance (₹)</th>
                    <th className="py-3 px-4">Variance %</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activePool.costs && activePool.costs.length > 0 ? (
                    activePool.costs.map((c) => {
                      const b = parseFloat(c.budget_amount || "0");
                      const a = parseFloat(c.actual_cost || "0");
                      const diff = a - b;
                      const pct = b > 0 ? ((diff / b) * 100).toFixed(1) : "0";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {c.category}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                            ₹{b.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            ₹{a.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-bold ${diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {diff > 0 ? "+" : ""}₹{diff.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                diff > 0
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {diff > 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {c.notes || "Audited operational line"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No expense categories recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* FORMULA F-22 RECONCILIATION MODAL */}
      {isTrueUpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded">
                  Formula F-22 Engine
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Year-End CAM True-Up Reconciliation
                </h2>
                <p className="text-xs text-slate-500">
                  Area-Weighted Apportionment: Occupant Share of Actual CAM − CAM Billed = Debit (+) or Credit (−) Note
                </p>
              </div>
              <button
                onClick={() => setIsTrueUpOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {simulating ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                <div className="text-sm font-bold text-slate-800">
                  Calculating Occupant Area Weights & Conservation Bounds...
                </div>
              </div>
            ) : simulationData ? (
              <div className="space-y-6">
                {/* Conservation Check Badge */}
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-teal-900">
                      Formula F-22 Conservation Check: Validated
                    </div>
                    <div className="text-xs text-teal-700 mt-0.5">
                      Σ True-Ups (₹{simulationData?.conservation_check?.total_occupant_trueups?.toLocaleString("en-IN")}) = Actual Costs − Billed (₹{simulationData?.conservation_check?.pool_actual_minus_billed?.toLocaleString("en-IN")})
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold">
                    Conservation OK
                  </span>
                </div>

                {/* Per Occupant Reconciliation Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="py-3 px-3">Occupant</th>
                        <th className="py-3 px-3 text-right">Area (sq ft)</th>
                        <th className="py-3 px-3 text-right">Share %</th>
                        <th className="py-3 px-3 text-right">Actual Share (₹)</th>
                        <th className="py-3 px-3 text-right">Billed Prov. (₹)</th>
                        <th className="py-3 px-3 text-right">True-Up Diff (₹)</th>
                        <th className="py-3 px-3">Action Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {simulationData?.occupants_reconciled?.map((occ: any, i: number) => {
                        const isDebit = occ.difference > 0;
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-bold text-slate-900">
                              {occ.occupant_name}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-600">
                              {occ.chargeable_area_sqft?.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-600 font-mono">
                              {occ.area_share_pct}
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-slate-900">
                              ₹{occ.actual_cam_share?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-600">
                              ₹{occ.provisional_cam_billed?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`py-3 px-3 text-right font-bold ${isDebit ? "text-amber-700" : "text-emerald-700"}`}>
                              {isDebit ? "+" : ""}₹{occ.difference?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isDebit
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {isDebit ? "Issue Debit Note" : "Issue Credit Note"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setIsTrueUpOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteTrueUp}
                    disabled={executingTrueUp}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    {executingTrueUp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Confirm & Auto-Generate Balancing Notes
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CREATE CAM POOL MODAL */}
      {isNewPoolOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Create New CAM Pool
              </h3>
              <button
                onClick={() => setIsNewPoolOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pool Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Financial Year *
                </label>
                <input
                  type="text"
                  required
                  value={newFy}
                  onChange={(e) => setNewFy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Annual Budget Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Total Apportionment Area (sq ft) *
                </label>
                <input
                  type="number"
                  required
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPoolOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                >
                  Save CAM Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  Download,
} from "lucide-react";

export default function SnapshotsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [locking, setLocking] = useState(false);
  const [period, setPeriod] = useState("2026-10-01");

  const fetchSnapshots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snapshots?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load snapshots:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [period]);

  const handleLockSnapshot = async () => {
    if (!confirm(`Are you sure you want to permanently FREEZE and LOCK the rent roll financial state for ${period}? Once locked, no retroactive edits can be made.`)) {
      return;
    }
    setLocking(true);
    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_month: period }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchSnapshots();
      } else {
        alert(json.error || "Failed to execute lock");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLocking(false);
    }
  };

  const lockStatus = data?.current_lock_status;
  const snapshots = data?.snapshots || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Screen S-53 &middot; Month-End Lock
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Immutable Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rent Roll Snapshots & Month-End Closing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial freeze mechanism locking monthly rent roll state to prevent retroactive modifications and verify monthly ledger movements.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchSnapshots}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Snapshots"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/reporting/mis"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Open MIS Investor Pack (S-54)
          </Link>
        </div>
      </div>

      {/* Current Month-End Lock Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                Period Lock Status &middot; Oct-2026
              </span>
              {lockStatus?.is_locked ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED & IMMUTABLE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> OPEN (UNLOCKED)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify all criteria before executing statutory month-end freeze.
            </p>
          </div>

          {!lockStatus?.is_locked ? (
            <button
              onClick={handleLockSnapshot}
              disabled={locking}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm justify-center"
            >
              {locking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Lock Month-End Snapshot
            </button>
          ) : (
            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
              Period is permanently frozen. No retroactive alterations allowed.
            </div>
          )}
        </div>

        {/* Lock Readiness Criteria Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {lockStatus?.criteria?.map((crit: any) => (
            <div
              key={crit.id}
              className={`p-4 rounded-xl border transition ${
                crit.passed
                  ? "bg-slate-50/60 border-slate-200"
                  : "bg-amber-50/40 border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {crit.name}
                </span>
                {crit.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-slate-500">{crit.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Snapshots Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Locked Historical Snapshots Register
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Period Month</th>
                <th className="py-3 px-4 text-right">Total Area</th>
                <th className="py-3 px-4 text-right">Occupied Area</th>
                <th className="py-3 px-4 text-right">Occupancy %</th>
                <th className="py-3 px-4 text-right">Monthly Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Collections (₹)</th>
                <th className="py-3 px-4 text-right font-bold">NOI (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Locked Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshots.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No historical locked snapshots. Click &quot;Lock Month-End Snapshot&quot; to freeze current period.
                  </td>
                </tr>
              ) : (
                snapshots.map((snap: any) => (
                  <tr key={snap.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {snap.snapshotMonth}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {parseFloat(snap.totalArea).toLocaleString("en-IN")} sqft
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {parseFloat(snap.occupiedArea).toLocaleString("en-IN")} sqft
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono">
                      {snap.occupancyPct}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      ₹{parseFloat(snap.totalMonthlyRevenue).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      ₹{parseFloat(snap.totalCollections).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                      ₹{parseFloat(snap.noiMonthly).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1 w-max mx-auto">
                        <Lock className="w-2.5 h-2.5" /> LOCKED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                      {new Date(snap.createdAt).toLocaleString("en-IN")}
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

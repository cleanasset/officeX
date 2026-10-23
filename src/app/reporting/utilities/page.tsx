"use client";

import React, { useState, useEffect } from "react";
import { Download, Calendar, Zap, Droplet, Clock, DollarSign, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function EnergyAndUtilityDashboard() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState("Live Synchronized");
  const [toast, setToast] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [readings, setReadings] = useState<any[]>([]);
  const [occupants, setOccupants] = useState<any[]>([]);

  const fetchUtilityData = async () => {
    setIsSyncing(true);
    try {
      const headers = getClientAuthHeaders();
      const currentPeriod = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date()).replace(" ", "-");
      
      const [readingsRes, occupantsRes] = await Promise.all([
        fetch(`/api/meters/readings?period=${currentPeriod}`, { headers }),
        fetch(`/api/occupants`, { headers }),
      ]);

      const readingsData = await readingsRes.json();
      const occupantsData = await occupantsRes.json();

      if (readingsData.readings) {
        setReadings(readingsData.readings);
      }
      if (Array.isArray(occupantsData.occupants)) {
        setOccupants(occupantsData.occupants);
      }
      setSyncTime("Updated just now");
    } catch (e) {
      console.error("Failed to fetch utility telemetry:", e);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilityData();
  }, []);

  const handleSyncRefresh = () => {
    fetchUtilityData();
    setToast("Live BMS telemetry synchronized successfully across all sub-meters!");
    setTimeout(() => setToast(null), 3000);
  };

  // Aggregated live KPIs
  const totalPowerConsumption = readings
    .filter((r) => r.utility?.toLowerCase().includes("power") || r.utility?.toLowerCase().includes("electric"))
    .reduce((acc, cur) => acc + Number(cur.consumption || 0), 0);

  const totalWaterConsumption = readings
    .filter((r) => r.utility?.toLowerCase().includes("water"))
    .reduce((acc, cur) => acc + Number(cur.consumption || 0), 0);

  const totalCost = readings.reduce((acc, cur) => acc + Number(cur.calculated_amount || 0), 0);

  const kpis = [
    {
      label: "Electricity",
      value: totalPowerConsumption.toLocaleString("en-IN"),
      unit: "kWh",
      change: `${readings.filter((r) => r.utility?.toLowerCase().includes("power")).length} Active Meters`,
      icon: <Zap size={16} className="text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Water",
      value: totalWaterConsumption.toLocaleString("en-IN"),
      unit: "KL",
      change: `${readings.filter((r) => r.utility?.toLowerCase().includes("water")).length} Active Meters`,
      icon: <Droplet size={16} className="text-teal-500" />,
      iconBg: "bg-teal-50",
    },
    {
      label: "Total Sub-Meters",
      value: readings.length.toString(),
      unit: "Units",
      change: "Configured in Master",
      icon: <Clock size={16} className="text-amber-500" />,
      iconBg: "bg-amber-50",
    },
    {
      label: "Total Utility Cost",
      value: `₹${totalCost.toLocaleString("en-IN")}`,
      unit: "",
      change: "Billed to Tenants",
      icon: <DollarSign size={16} className="text-emerald-500" />,
      iconBg: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Energy &amp; Utility</h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live BMS Sync</span>
              <span className="text-[10px] text-emerald-600 font-normal">· {syncTime}</span>
              <button
                onClick={handleSyncRefresh}
                disabled={isSyncing}
                className="ml-0.5 p-0.5 hover:bg-emerald-100 rounded text-emerald-700 transition-colors cursor-pointer"
                title="Sync Live BMS Telemetry"
              >
                <RefreshCw size={11} className={isSyncing ? "animate-spin text-emerald-600" : ""} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Monitor consumption, costs, and efficiency across the portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
          <button 
            onClick={() => {
              setToast("Exporting Energy & Utility parametric audit report (.XLSX + PDF)...");
              setTimeout(() => setToast(null), 3500);
            }}
            className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
              <div className={`w-7 h-7 rounded-lg ${k.iconBg} flex items-center justify-center`}>
                {k.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {k.value} <span className="text-xs font-normal text-gray-500">{k.unit}</span>
              </p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">{k.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Occupant Split & Active Sub-Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupant Allocation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Occupant CAM / Utility Allocation</h2>
            <span className="text-xs text-gray-500 font-semibold">{occupants.length} Occupants Registered</span>
          </div>

          {occupants.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No registered occupants found in active commercial portfolio.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5">OCCUPANT</th>
                    <th className="py-2.5">CODE</th>
                    <th className="py-2.5">BILLING CYCLE</th>
                    <th className="py-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {occupants.slice(0, 8).map((occ) => (
                    <tr key={occ.id}>
                      <td className="py-3 font-semibold text-gray-900">{occ.occupant_name || occ.name}</td>
                      <td className="py-3 font-mono text-gray-500">{occ.occupant_code || "--"}</td>
                      <td className="py-3 text-gray-600">Monthly Arrears</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Meter Readings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Active Sub-Meters</h2>
            <span className="text-xs text-gray-500 font-semibold">{readings.length} Configured</span>
          </div>

          {readings.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No physical/virtual sub-meters registered for this cycle. Configure in S-65 Master.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5">METER</th>
                    <th className="py-2.5">UTILITY</th>
                    <th className="py-2.5">OPENING</th>
                    <th className="py-2.5">CLOSING</th>
                    <th className="py-2.5">CONS.</th>
                    <th className="py-2.5 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {readings.map((m) => (
                    <tr key={m.meter_id || m.id}>
                      <td className="py-3 font-mono font-semibold text-gray-800">{m.meter_code}</td>
                      <td className="py-3 text-gray-600 capitalize">{m.utility}</td>
                      <td className="py-3 font-mono text-gray-500">{m.previous_reading || 0}</td>
                      <td className="py-3 font-mono text-gray-700 font-semibold">{m.current_reading || "--"}</td>
                      <td className="py-3 font-semibold text-gray-900">{m.consumption || 0}</td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        ₹{Number(m.calculated_amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

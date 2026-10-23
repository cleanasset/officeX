"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gauge,
  Zap,
  Droplets,
  Wind,
  Flame,
  AlertTriangle,
  Upload,
  Download,
  Save,
  Send,
  Camera,
  CheckCircle2,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Check,
  Building2,
  FileText,
} from "lucide-react";

interface MeterReadingRow {
  meter_id: string;
  meter_code: string;
  meter_name: string;
  space_id: string | null;
  space_code: string;
  space_name: string;
  utility: string;
  multiplier: number;
  opening: number;
  closing: number | null;
  consumption: number;
  avg_past_consumption: number;
  tariff_rate: number;
  amount: number;
  reading_date: string;
  photo_path: string | null;
  source: string;
  is_spike: boolean;
  spike_note: string | null;
  status: string;
  has_reading: boolean;
}

export default function MeterReadingsPage() {
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState("all");
  const [period, setPeriod] = useState("Sep-2026");
  const [properties, setProperties] = useState<{ id: string; property_name: string }[]>([]);
  const [readings, setReadings] = useState<MeterReadingRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/meters/readings?property_id=${propertyId}&period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setReadings(json.readings || []);
        setSummary(json.summary || null);
      }
      // Also fetch property list
      const propRes = await fetch("/api/meters");
      if (propRes.ok) {
        const pJson = await propRes.json();
        setProperties(pJson.properties || []);
      }
    } catch (e) {
      console.error(e);
      setNotification({ type: "error", message: "Failed to load meter readings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [propertyId, period]);

  // Handle closing reading input change with immediate F-09 formula calculation
  const handleClosingChange = (meterId: string, valStr: string) => {
    setReadings((prev) =>
      prev.map((r) => {
        if (r.meter_id !== meterId) return r;
        const closingNum = valStr === "" ? null : Number(valStr);
        if (closingNum === null) {
          return {
            ...r,
            closing: null,
            consumption: 0,
            amount: 0,
            is_spike: false,
          };
        }

        const isMeterReset = closingNum < r.opening;
        const consumption = isMeterReset
          ? closingNum * r.multiplier
          : Math.max(0, (closingNum - r.opening) * r.multiplier);

        const amount = consumption * r.tariff_rate;
        // Formula spike: >25% jump above avg past consumption
        const isSpike = r.avg_past_consumption > 0 && consumption > r.avg_past_consumption * 1.25 && consumption > 50;

        return {
          ...r,
          closing: closingNum,
          consumption,
          amount,
          is_spike: isSpike,
          spike_note: isSpike ? "Consumption jumped >25% above historical baseline" : null,
        };
      })
    );
  };

  const handleSave = async (action: "save" | "submit" | "approve") => {
    try {
      setSaving(true);
      const payload = {
        action,
        period,
        readings: readings
          .filter((r) => r.closing !== null)
          .map((r) => ({
            meter_id: r.meter_id,
            property_id: propertyId !== "all" ? propertyId : undefined,
            space_id: r.space_id,
            opening: r.opening,
            closing: r.closing,
            multiplier: r.multiplier,
            tariff_rate: r.tariff_rate,
            reading_date: r.reading_date,
            photo_path: r.photo_path,
            source: r.source,
            is_spike: r.is_spike,
            spike_note: r.spike_note,
          })),
      };

      const res = await fetch("/api/meters/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setNotification({ type: "success", message: json.message });
        fetchReadings();
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({ type: "error", message: json.error || "Failed to save readings" });
      }
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCsvImport = () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.trim().split("\n");
      const updates = new Map<string, number>();
      lines.forEach((l) => {
        const parts = l.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const code = parts[0].toLowerCase();
          const val = Number(parts[1]);
          if (!isNaN(val)) updates.set(code, val);
        }
      });

      setReadings((prev) =>
        prev.map((r) => {
          const matchedVal = updates.get(r.meter_code.toLowerCase());
          if (matchedVal !== undefined) {
            const isMeterReset = matchedVal < r.opening;
            const consumption = isMeterReset
              ? matchedVal * r.multiplier
              : Math.max(0, (matchedVal - r.opening) * r.multiplier);
            const amount = consumption * r.tariff_rate;
            const isSpike = r.avg_past_consumption > 0 && consumption > r.avg_past_consumption * 1.25;
            return {
              ...r,
              closing: matchedVal,
              consumption,
              amount,
              is_spike: isSpike,
              source: "csv",
            };
          }
          return r;
        })
      );
      setCsvModalOpen(false);
      setNotification({
        type: "success",
        message: `Imported ${updates.size} meter readings from CSV. Review calculated consumption and click Submit.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert("Invalid CSV format. Expected: meter_code, closing_reading");
    }
  };

  const getUtilityBadge = (u: string) => {
    switch (u.toLowerCase()) {
      case "electricity":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Zap className="w-3 h-3 text-amber-600" /> Elec.
          </span>
        );
      case "dg_backup":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <Flame className="w-3 h-3 text-orange-600" /> DG Backup
          </span>
        );
      case "water":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <Droplets className="w-3 h-3 text-sky-600" /> Water
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Gauge className="w-3 h-3 text-emerald-600" /> {u.replace("_", " ")}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-[#0F8B7D]/10 text-[#0F8B7D] rounded-full border border-[#0F8B7D]/20">
              Screen S-31 &middot; Meter Readings
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              Formula F-09 Utility Invoicing
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Feeds INV-UTIL Split Series
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Utility Meter Consumption Capture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture sub-meter closing readings, calculate delta consumption (F-09), flag &gt;25% consumption anomalies, and feed utility invoices into billing runs.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-[#0F8B7D]" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={() => handleSave("save")}
            disabled={saving}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave("submit")}
            disabled={saving}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Billing</span>
          </button>

          <button
            onClick={() => handleSave("approve")}
            disabled={saving}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve for Invoicing</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Electricity
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            {(summary?.total_kwh_electricity || 0).toLocaleString("en-IN")} <span className="text-xs text-slate-400 font-sans">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tariff benchmark: ₹11.50/kWh</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            DG Backup Units
          </span>
          <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono">
            {(summary?.total_dg_units || 0).toLocaleString("en-IN")} <span className="text-xs text-slate-400 font-sans">units</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tariff benchmark: ₹24.00/unit</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Billed Utility (₹)
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0F8B7D] font-mono">
            ₹{(summary?.total_billed_amount || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Formula F-09 total recovery</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${
          (summary?.spike_warnings_count || 0) > 0 ? "bg-amber-50/70 border-amber-300" : "bg-white border-slate-200/80"
        }`}>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1 text-slate-500">
            Consumption Spikes (&gt;25%)
          </span>
          <div className={`text-xl sm:text-2xl font-black ${
            (summary?.spike_warnings_count || 0) > 0 ? "text-amber-700" : "text-slate-900"
          }`}>
            {summary?.spike_warnings_count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Anomalies requiring inspection</div>
        </div>
      </div>

      {/* Selector & Filter Bar per Wireframe S-31 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-bold">Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0F8B7D]"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.property_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-bold">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0F8B7D]"
            >
              <option value="Sep-2026">Sep-2026</option>
              <option value="Oct-2026">Oct-2026</option>
              <option value="Aug-2026">Aug-2026</option>
              <option value="Jul-2026">Jul-2026</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-slate-500">
            Total Meters: <strong className="text-slate-900">{readings.length}</strong>
          </div>
          <div className="text-emerald-700 font-bold">
            Logged: {readings.filter((r) => r.closing !== null).length} / {readings.length}
          </div>
        </div>
      </div>

      {/* Mobile Card View (< sm screens) */}
      <div className="sm:hidden space-y-3">
        {readings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Sub-Meters Found</div>
            <p className="text-xs text-slate-500 mt-1">Configure meters in Settings or import via CSV.</p>
          </div>
        ) : (
          readings.map((r) => (
            <div
              key={r.meter_id}
              className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 ${
                r.is_spike ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 font-mono">{r.meter_code}</span>
                    {getUtilityBadge(r.utility)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.space_code} &bull; {r.space_name}
                  </div>
                </div>

                {r.is_spike ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Spike &gt;25%
                  </span>
                ) : r.closing !== null ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {r.status === "approved" ? "Approved" : r.status === "submitted" ? "Submitted" : "Ready"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                    Pending
                  </span>
                )}
              </div>

              {/* In-cell mobile inputs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Opening (Sys)</span>
                  <span className="font-mono text-slate-700 font-semibold">{r.opening.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Closing [Input]</span>
                  <input
                    type="number"
                    placeholder={String(r.opening)}
                    value={r.closing !== null ? r.closing : ""}
                    onChange={(e) => handleClosingChange(r.meter_id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consumption (F-09)</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {r.consumption > 0 ? r.consumption.toLocaleString("en-IN") : "0"} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed Cost (₹)</span>
                  <span className="font-mono text-[#0F8B7D] font-black">
                    ₹{Math.round(r.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= sm screens) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">Meter Code</th>
                <th className="py-3 px-4 font-semibold">Space / Location</th>
                <th className="py-3 px-4 font-semibold">Utility</th>
                <th className="py-3 px-4 font-semibold text-center">Multiplier</th>
                <th className="py-3 px-4 font-semibold text-right">Opening (Sys)</th>
                <th className="py-3 px-4 font-semibold text-right w-36">Closing [Input]</th>
                <th className="py-3 px-4 font-semibold text-right">Consumption (F-09)</th>
                <th className="py-3 px-4 font-semibold text-right">Tariff (₹)</th>
                <th className="py-3 px-4 font-semibold text-right font-bold text-[#0F8B7D]">Amount (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Status / Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400 font-sans">
                    No active meters found for this property.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr
                    key={r.meter_id}
                    className={`hover:bg-slate-50/80 transition ${
                      r.is_spike ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {r.meter_code}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-sans">
                      <div className="font-semibold text-slate-900">{r.space_code}</div>
                      <div className="text-[10px] text-slate-400">{r.space_name}</div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      {getUtilityBadge(r.utility)}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600">{r.multiplier}</td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      {r.opening.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        placeholder={String(r.opening)}
                        value={r.closing !== null ? r.closing : ""}
                        onChange={(e) => handleClosingChange(r.meter_id, e.target.value)}
                        className={`w-32 text-right bg-white border rounded px-2 py-1 text-xs text-slate-900 focus:outline-none font-bold ${
                          r.is_spike
                            ? "border-amber-400 bg-amber-50/40 text-amber-900 focus:border-amber-500"
                            : "border-slate-300 focus:border-[#0F8B7D]"
                        }`}
                      />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-slate-900">
                        {r.consumption > 0 ? r.consumption.toLocaleString("en-IN") : "0"}
                      </span>
                      {r.avg_past_consumption > 0 && (
                        <div className="text-[10px] text-slate-400 font-sans">
                          Avg: {r.avg_past_consumption.toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      ₹{Number(r.tariff_rate).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#0F8B7D]">
                      ₹{Math.round(r.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      {r.is_spike ? (
                        <div
                          className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 text-[10px] font-bold"
                          title={r.spike_note || "Consumption spiked >25% above average"}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Spike &gt;25%</span>
                        </div>
                      ) : r.closing !== null ? (
                        <span className="text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{r.status === "approved" ? "Approved" : r.status === "submitted" ? "Submitted" : "Ready"}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Input</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer per Wireframe S-31 */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold">Source:</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">manual</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">csv</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">api</span>
            <span className="text-slate-400">(auto when CAFM subscribed)</span>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 font-medium">
            <span>Total Lines: {readings.length}</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-bold">
              Ready for Billing: {readings.filter((r) => r.closing !== null).length} / {readings.length}
            </span>
          </div>
        </div>
      </div>

      {/* CSV Bulk Ingestion Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bulk CSV Upload (Meter Readings)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Paste comma-separated rows or file content</p>
              </div>
              <button onClick={() => setCsvModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div className="text-xs text-slate-600">
                Format: <code className="text-[#0F8B7D] font-bold">meter_code, closing_reading</code> (one per line)
                <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800 mt-1">
                  E-T1-03, 196410{"\n"}
                  D-T1-03, 4388{"\n"}
                  W-T1-01, 3850
                </pre>
              </div>

              <textarea
                rows={6}
                placeholder="E-T1-03, 196410..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#0F8B7D] font-mono"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCsvImport}
                  className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white rounded-lg text-xs font-black shadow-xs"
                >
                  Import Readings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

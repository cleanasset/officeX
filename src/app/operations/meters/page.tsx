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
        // Formula spike: >30% jump above avg past consumption
        const isSpike = r.avg_past_consumption > 0 && consumption > r.avg_past_consumption * 1.3 && consumption > 50;

        return {
          ...r,
          closing: closingNum,
          consumption,
          amount,
          is_spike: isSpike,
          spike_note: isSpike ? "Consumption jumped > 30% above historical baseline" : null,
        };
      })
    );
  };

  const handleSave = async (action: "save" | "submit") => {
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
      // Format: meter_code, closing
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
            const isSpike = r.avg_past_consumption > 0 && consumption > r.avg_past_consumption * 1.3;
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
        message: `Imported ${updates.size} meter readings from CSV into table. Review and save.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert("Invalid CSV format. Expected: meter_code, closing_reading");
    }
  };

  const getUtilityIcon = (u: string) => {
    switch (u.toLowerCase()) {
      case "electricity":
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "dg_backup":
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case "water":
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Gauge className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <span>Property Operations</span>
              <span>•</span>
              <span>Screen S-31</span>
              <span>•</span>
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                Formula F-09 Utility Billing
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Meter Readings Entry
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Sub-meter consumption capture with opening/closing delta, multiplier, tariff rates, and &gt;30% spike warnings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/settings/meters"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Meters & Tariffs Master</span>
            </Link>

            <button
              onClick={() => setCsvModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={() => handleSave("save")}
              disabled={saving}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleSave("submit")}
              disabled={saving}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/30 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Billing</span>
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between animate-fadeIn ${
              notification.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)}>✕</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Property</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Sep-2026">Sep-2026</option>
                <option value="Oct-2026">Oct-2026</option>
                <option value="Aug-2026">Aug-2026</option>
                <option value="Jul-2026">Jul-2026</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Total Electricity:</span>{" "}
              <span className="text-amber-400 font-bold">{(summary?.total_kwh_electricity || 0).toLocaleString("en-IN")} kWh</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">DG Backup:</span>{" "}
              <span className="text-orange-400 font-bold">{(summary?.total_dg_units || 0).toLocaleString("en-IN")} units</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Total Billed:</span>{" "}
              <span className="text-emerald-400 font-bold">₹{(summary?.total_billed_amount || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Meter Readings Entry Table (Wireframe S-31) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Meter</th>
                  <th className="py-3 px-4 font-semibold">Space / Floor</th>
                  <th className="py-3 px-4 font-semibold">Utility</th>
                  <th className="py-3 px-4 font-semibold text-center">Multiplier</th>
                  <th className="py-3 px-4 font-semibold text-right">Opening (Sys)</th>
                  <th className="py-3 px-4 font-semibold text-right w-36">Closing [Input]</th>
                  <th className="py-3 px-4 font-semibold text-right">Consumption (F-09)</th>
                  <th className="py-3 px-4 font-semibold text-right">Tariff (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status / Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {readings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-sans">
                      No meters found for this property. Configure meters in the Meter Master.
                    </td>
                  </tr>
                ) : (
                  readings.map((r) => (
                    <tr
                      key={r.meter_id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        r.is_spike ? "bg-amber-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                        {getUtilityIcon(r.utility)}
                        <span>{r.meter_code}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-sans">
                        <div className="font-medium">{r.space_code}</div>
                        <div className="text-[10px] text-slate-500">{r.space_name}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-400 capitalize font-sans">
                        {r.utility.replace("_", " ")}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-400">{r.multiplier}</td>

                      <td className="py-3 px-4 text-right text-slate-400">
                        {r.opening.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          placeholder={String(r.opening)}
                          value={r.closing !== null ? r.closing : ""}
                          onChange={(e) => handleClosingChange(r.meter_id, e.target.value)}
                          className={`w-32 text-right bg-slate-950 border rounded px-2.5 py-1 text-xs text-white focus:outline-none font-bold ${
                            r.is_spike
                              ? "border-amber-500 focus:border-amber-400 bg-amber-950/30"
                              : "border-slate-700 focus:border-amber-500"
                          }`}
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-white">
                          {r.consumption > 0 ? r.consumption.toLocaleString("en-IN") : "0"}
                        </span>
                        {r.avg_past_consumption > 0 && (
                          <div className="text-[10px] text-slate-500">
                            Avg: {r.avg_past_consumption.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{Number(r.tariff_rate).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        ₹{Math.round(r.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        {r.is_spike ? (
                          <div
                            className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] font-bold"
                            title={r.spike_note || "Consumption spiked > 30% above average"}
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Spike &gt;30%</span>
                          </div>
                        ) : r.closing !== null ? (
                          <span className="text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{r.status === "submitted" ? "Submitted" : "Ready"}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Pending Input</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer per Wireframe S-31 */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Source:</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">manual</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">csv</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">api</span>
              <span className="text-slate-600">(auto when CAFM subscribed)</span>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-slate-500">Total Lines: {readings.length}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                Logged: {readings.filter((r) => r.closing !== null).length} / {readings.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Bulk Ingestion Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Bulk CSV Upload (Meter Readings)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Paste comma-separated rows or file content</p>
              </div>
              <button onClick={() => setCsvModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div className="text-xs text-slate-400">
                Format: <code className="text-amber-400">meter_code, closing_reading</code> (one per line)
                <br />
                Example:
                <pre className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-300 mt-1">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCsvImport}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
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

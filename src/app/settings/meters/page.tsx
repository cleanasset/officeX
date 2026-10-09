"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Gauge,
  Zap,
  Droplets,
  Flame,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Layers,
  ArrowLeft,
  Edit2,
  Trash2,
} from "lucide-react";

export default function MetersAndTariffsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    meters: any[];
    tariffs: any[];
    properties: any[];
    spaces: any[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"meters" | "tariffs">("meters");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [meterModalOpen, setMeterModalOpen] = useState(false);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);

  // Meter Form
  const [meterCode, setMeterCode] = useState("");
  const [meterName, setMeterName] = useState("");
  const [meterUtility, setMeterUtility] = useState("electricity");
  const [meterSpaceId, setMeterSpaceId] = useState("");
  const [meterPropId, setMeterPropId] = useState("");
  const [meterMultiplier, setMeterMultiplier] = useState("1.0");
  const [meterIsVirtual, setMeterIsVirtual] = useState(false);

  // Tariff Form
  const [tariffPropId, setTariffPropId] = useState("");
  const [tariffUtility, setTariffUtility] = useState("electricity");
  const [tariffName, setTariffName] = useState("");
  const [tariffRate, setTariffRate] = useState("");
  const [tariffUnit, setTariffUnit] = useState("kWh");
  const [tariffValidFrom, setTariffValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [tariffValidTo, setTariffValidTo] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/meters?property_id=${selectedProperty}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.properties?.length > 0 && !meterPropId) {
          setMeterPropId(json.properties[0].id);
          setTariffPropId(json.properties[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProperty]);

  const handleSaveMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meterCode || !meterPropId) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/meters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_meter",
          property_id: meterPropId,
          meter_code: meterCode,
          meter_name: meterName || meterCode,
          utility: meterUtility,
          space_id: meterSpaceId || undefined,
          multiplier: Number(meterMultiplier) || 1,
          is_virtual: meterIsVirtual,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotice("Meter registered successfully");
        setMeterModalOpen(false);
        setMeterCode("");
        setMeterName("");
        fetchData();
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(json.error || "Failed to save meter");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tariffRate || !tariffPropId || !tariffValidFrom) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/meters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_tariff",
          property_id: tariffPropId,
          utility: tariffUtility,
          tariff_name: tariffName || `${tariffUtility.toUpperCase()} Standard Rate`,
          rate: Number(tariffRate),
          unit: tariffUnit,
          valid_from: tariffValidFrom,
          valid_to: tariffValidTo || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotice("Tariff rate configured successfully");
        setTariffModalOpen(false);
        setTariffRate("");
        setTariffName("");
        fetchData();
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(json.error || "Failed to save tariff");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMeters = (data?.meters || []).filter((m) =>
    m.meter_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.space_code && m.space_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    m.utility.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <Link href="/operations/meters" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Operations S-31
              </Link>
              <span>•</span>
              <span>Screen S-65</span>
              <span>•</span>
              <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                Meters & Tariffs Master
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Meters & Tariffs Configuration
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Physical & virtual sub-meters linked to premises with multi-tier utility tariffs and date validities.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchData()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              onClick={() => setMeterModalOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2.5 rounded-lg text-xs shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Register Meter</span>
            </button>
            <button
              onClick={() => setTariffModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-4 py-2.5 rounded-lg text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Tariff</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("meters")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "meters"
                  ? "bg-cyan-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Physical & Virtual Meters ({data?.meters?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("tariffs")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "tariffs"
                  ? "bg-cyan-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Tariffs & Rates ({data?.tariffs?.length || 0})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search meter code, space, utility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Tab 1: Meters Table */}
        {activeTab === "meters" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Meter Code</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Utility</th>
                    <th className="py-3 px-4 font-semibold">Linked Space / Floor</th>
                    <th className="py-3 px-4 font-semibold text-center">Multiplier</th>
                    <th className="py-3 px-4 font-semibold text-center">Type</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredMeters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        No meters registered yet. Click &quot;Register Meter&quot; to configure your sub-meters.
                      </td>
                    </tr>
                  ) : (
                    filteredMeters.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-cyan-400">{m.meter_code}</td>
                        <td className="py-3.5 px-4 text-slate-200 font-sans">{m.meter_name}</td>
                        <td className="py-3.5 px-4 text-slate-300 uppercase font-sans">{m.utility}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-sans">
                          {m.space_code ? (
                            <span className="font-mono text-slate-200">{m.space_code}</span>
                          ) : (
                            <span className="text-slate-600">Central / Building Wide</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-300">{m.multiplier}</td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              m.is_virtual
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {m.is_virtual ? "Virtual" : "Physical"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Tariffs Table */}
        {activeTab === "tariffs" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tariff Plan</th>
                    <th className="py-3 px-4 font-semibold">Utility</th>
                    <th className="py-3 px-4 font-semibold text-right">Rate per Unit (₹)</th>
                    <th className="py-3 px-4 font-semibold text-center">Unit</th>
                    <th className="py-3 px-4 font-semibold">Valid From</th>
                    <th className="py-3 px-4 font-semibold">Valid To</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(data?.tariffs || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        No custom tariffs configured. Standard default commercial rates are being used.
                      </td>
                    </tr>
                  ) : (
                    data?.tariffs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-100">{t.tariff_name}</td>
                        <td className="py-3.5 px-4 text-slate-300 uppercase font-sans">{t.utility}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          ₹{Number(t.rate).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-sans">{t.unit}</td>
                        <td className="py-3.5 px-4 text-slate-300">{t.valid_from}</td>
                        <td className="py-3.5 px-4 text-slate-400">{t.valid_to || "Indefinite"}</td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register Meter Modal */}
      {meterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Register Sub-Meter (S-65)</h3>
              <button onClick={() => setMeterModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveMeter} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Property *</label>
                <select
                  value={meterPropId}
                  onChange={(e) => setMeterPropId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {data?.properties?.map((p) => (
                    <option key={p.id} value={p.id}>{p.property_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Meter Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E-T1-03"
                    value={meterCode}
                    onChange={(e) => setMeterCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Utility *</label>
                  <select
                    value={meterUtility}
                    onChange={(e) => setMeterUtility(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="electricity">electricity</option>
                    <option value="dg_backup">dg_backup</option>
                    <option value="water">water</option>
                    <option value="gas">gas</option>
                    <option value="hvac_btu">hvac_btu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Meter Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 3 Tenant Power Sub-Meter"
                  value={meterName}
                  onChange={(e) => setMeterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Linked Space (Optional)</label>
                <select
                  value={meterSpaceId}
                  onChange={(e) => setMeterSpaceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <option value="">Central / Unallocated</option>
                  {data?.spaces?.map((s) => (
                    <option key={s.id} value={s.id}>{s.space_code} — {s.space_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Multiplier *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={meterMultiplier}
                    onChange={(e) => setMeterMultiplier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={meterIsVirtual}
                      onChange={(e) => setMeterIsVirtual(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-0"
                    />
                    <span>Virtual Meter (Calculated)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMeterModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? "Saving..." : "Save Meter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Tariff Modal */}
      {tariffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Configure Utility Tariff (S-65)</h3>
              <button onClick={() => setTariffModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveTariff} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Property *</label>
                <select
                  value={tariffPropId}
                  onChange={(e) => setTariffPropId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {data?.properties?.map((p) => (
                    <option key={p.id} value={p.id}>{p.property_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Utility *</label>
                  <select
                    value={tariffUtility}
                    onChange={(e) => {
                      setTariffUtility(e.target.value);
                      if (e.target.value === "water") setTariffUnit("kL");
                      else if (e.target.value === "hvac_btu") setTariffUnit("TR-h");
                      else setTariffUnit("kWh");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="electricity">electricity</option>
                    <option value="dg_backup">dg_backup</option>
                    <option value="water">water</option>
                    <option value="gas">gas</option>
                    <option value="hvac_btu">hvac_btu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={tariffUnit}
                    onChange={(e) => setTariffUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rate per Unit (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 11.50"
                  value={tariffRate}
                  onChange={(e) => setTariffRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={tariffValidFrom}
                    onChange={(e) => setTariffValidFrom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valid To (Optional)</label>
                  <input
                    type="date"
                    value={tariffValidTo}
                    onChange={(e) => setTariffValidTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTariffModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? "Saving..." : "Save Tariff Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

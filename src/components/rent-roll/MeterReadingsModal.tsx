"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  RefreshCw,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface MeterReadingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MeterReadingsModal({ isOpen, onClose, onSuccess }: MeterReadingsModalProps) {
  const [period, setPeriod] = useState("Oct-2026");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [readings, setReadings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchReadings();
    }
  }, [isOpen, period]);

  async function fetchReadings() {
    try {
      setLoading(true);
      setBannerMessage(null);
      const res = await fetch(`/api/rent-roll/meter-readings?period=${encodeURIComponent(period)}`, {
        headers: getClientAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setReadings(data.readings || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Failed to load meter readings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleReadingChange = (idx: number, currentVal: number) => {
    setReadings((prev) => {
      const next = [...prev];
      const r = { ...next[idx] };
      r.currentReading = currentVal;
      r.consumptionKwh = Math.max(0, currentVal - r.previousReading);
      r.totalAmount = Math.round(r.consumptionKwh * r.tariffPerUnit);
      next[idx] = r;
      return next;
    });
  };

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true);
      // Save all updated readings
      for (const r of readings) {
        await fetch("/api/rent-roll/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
          body: JSON.stringify(r),
        });
      }
      setBannerMessage(`All ${readings.length} sub-meter readings for ${period} submitted successfully.`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setBannerMessage("Failed to submit readings: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalKwh = readings.reduce((s, r) => s + (r.consumptionKwh || 0), 0);
  const totalAmount = readings.reduce((s, r) => s + (r.totalAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Sub-Meter Utility Readings (S-31)</h3>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  Day 1 Pre-Check
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Record sub-metered electricity &amp; utility consumption to unblock automated monthly billing runs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="Oct-2026">October 2026</option>
              <option value="Nov-2026">November 2026</option>
              <option value="Dec-2026">December 2026</option>
              <option value="Sep-2026">September 2026</option>
            </select>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Banner */}
        {bannerMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Total Active Meters</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">{readings.length} Units</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Total Consumption</span>
            <span className="text-base font-black text-teal-700 mt-0.5 block">{totalKwh.toLocaleString()} kWh</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">DISCOM Tariff Rate</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">₹11.50 / kWh</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Total Billable Pass-Through</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0F8B7D]" />
              Loading Sub-Meter Records...
            </div>
          ) : readings.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No meters registered. Meters auto-sync with active leasable units.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Meter ID</th>
                    <th className="py-2.5 px-3">Space / Unit</th>
                    <th className="py-2.5 px-3">Tenant / Occupant</th>
                    <th className="py-2.5 px-3 text-right">Previous (kWh)</th>
                    <th className="py-2.5 px-3 text-right">Current Reading</th>
                    <th className="py-2.5 px-3 text-right">Units (kWh)</th>
                    <th className="py-2.5 px-3 text-right">Tariff (₹)</th>
                    <th className="py-2.5 px-3 text-right">Net Bill (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {readings.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-900">{r.meterNumber}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{r.spaceName}</td>
                      <td className="py-2 px-3 font-medium text-slate-600 truncate max-w-[180px]">{r.occupantName}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">{r.previousReading.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={r.currentReading}
                          onChange={(e) => handleReadingChange(idx, Number(e.target.value))}
                          className="w-24 text-right px-2 py-1 text-xs rounded border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold text-slate-900 bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-teal-700">
                        {r.consumptionKwh.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">₹{r.tariffPerUnit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        ₹{r.totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-teal-600" />
            <span>DISCOM meter readings pass through without GST markup (§4.10).</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || readings.length === 0}
              className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Approve &amp; Queue for Day 1 Billing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

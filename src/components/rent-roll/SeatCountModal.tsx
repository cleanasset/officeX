"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  Briefcase,
  Layers,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface SeatCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SeatCountModal({ isOpen, onClose, onSuccess }: SeatCountModalProps) {
  const [period, setPeriod] = useState("Oct-2026");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSeatCounts();
    }
  }, [isOpen, period]);

  async function fetchSeatCounts() {
    try {
      setLoading(true);
      setBannerMessage(null);
      const res = await fetch(`/api/rent-roll/seat-counts?period=${encodeURIComponent(period)}`, {
        headers: getClientAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Failed to load seat counts:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOccupiedChange = (idx: number, occupiedVal: number) => {
    setRecords((prev) => {
      const next = [...prev];
      const r = { ...next[idx] };
      r.actualOccupiedSeats = occupiedVal;
      r.billableSeats = Math.max(occupiedVal, r.minimumCommitment);
      r.monthlyBilledInr = r.billableSeats * r.ratePerSeatMonthly;
      next[idx] = r;
      return next;
    });
  };

  const handleSubmitSeats = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/rent-roll/seat-counts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({ period, records }),
      });
      const data = await res.json();
      if (data.success) {
        setBannerMessage(data.message);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setBannerMessage("Failed to submit seat counts: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalContracted = records.reduce((s, r) => s + (r.contractedSeats || 0), 0);
  const totalOccupied = records.reduce((s, r) => s + (r.actualOccupiedSeats || 0), 0);
  const totalBillable = records.reduce((s, r) => s + (r.billableSeats || 0), 0);
  const totalRevenue = records.reduce((s, r) => s + (r.monthlyBilledInr || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Flex Seat Count Submission (S-32)</h3>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  Day 25 Cut-Off
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture member actual seat utilisation against minimum commitment to unblock automated Day 1 billing.
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
            <span className="text-[11px] text-slate-500 block">Total Contracted Seats</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">{totalContracted} Seats</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Actual Occupied Seats</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">{totalOccupied} Seats</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Billable Seats (max(occ, min))</span>
            <span className="text-base font-black text-teal-700 mt-0.5 block">{totalBillable} Seats</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">Monthly Seat Revenue</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0F8B7D]" />
              Loading Member Seat Rosters...
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Member / Enterprise</th>
                    <th className="py-2.5 px-3">Pricing Plan</th>
                    <th className="py-2.5 px-3">Location / Space</th>
                    <th className="py-2.5 px-3 text-right">Contracted</th>
                    <th className="py-2.5 px-3 text-right">Min Commit</th>
                    <th className="py-2.5 px-3 text-right">Occupied Seats</th>
                    <th className="py-2.5 px-3 text-right">Billable</th>
                    <th className="py-2.5 px-3 text-right">Rate / Seat (₹)</th>
                    <th className="py-2.5 px-3 text-right">Billed Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-bold text-slate-900">{r.memberName}</td>
                      <td className="py-2 px-3 text-teal-700 font-medium">{r.planName}</td>
                      <td className="py-2 px-3 text-slate-600">{r.spaceName}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{r.contractedSeats}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">{r.minimumCommitment}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={r.actualOccupiedSeats}
                          onChange={(e) => handleOccupiedChange(idx, Number(e.target.value))}
                          className="w-20 text-right px-2 py-1 text-xs rounded border border-slate-300 font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-teal-700">{r.billableSeats}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">₹{r.ratePerSeatMonthly.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        ₹{r.monthlyBilledInr.toLocaleString("en-IN")}
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
            <span>Enforces §S-32 Flex seat billing rule: Billable = max(Occupied, Minimum Commitment).</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitSeats}
              disabled={submitting || records.length === 0}
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
                  <span>Submit Seat Counts &amp; Unlock Billing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

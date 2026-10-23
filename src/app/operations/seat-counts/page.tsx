"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Upload,
  Save,
  Send,
  CheckCircle2,
  Lock,
  RefreshCw,
  Plus,
  Sliders,
  DollarSign,
  Info,
  Check,
  ShieldCheck,
  Building,
} from "lucide-react";

interface MemberSeatRow {
  id?: string;
  contract_id: string;
  occupant_id: string;
  member_name: string;
  plan_name: string;
  billing_basis: "contracted" | "minimum" | "occupied" | "hybrid";
  contracted_seats: number;
  minimum_seats: number;
  occupied_seats: number;
  billable_seats: number;
  seat_rate: number;
  amount: number;
  meeting_room_overage_hours: number;
  meeting_room_overage_amount: number;
  status: string;
  notes: string;
}

export default function SeatCountsPage() {
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState("");
  const [period, setPeriod] = useState("Oct-2026");
  const [properties, setProperties] = useState<any[]>([]);
  const [rows, setRows] = useState<MemberSeatRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/operations/seat-counts?property_id=${propertyId}&period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setRows(json.rows || []);
        setSummary(json.summary || null);
        setProperties(json.properties || []);
        if (!propertyId && json.properties?.length > 0) {
          setPropertyId(json.properties[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: "error", text: "Failed to load seat counts" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, period]);

  // Recalculate billable seats & amounts on occupied input change (F-04, F-05, F-06, F-07)
  const handleOccupiedChange = (contractId: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);

    setRows((prev) =>
      prev.map((r) => {
        if (r.contract_id !== contractId) return r;

        let billable = num;
        if (r.billing_basis === "contracted") {
          billable = r.contracted_seats; // F-04
        } else if (r.billing_basis === "occupied") {
          billable = num; // F-05
        } else if (r.billing_basis === "minimum") {
          billable = Math.max(num, r.minimum_seats); // F-06
        } else if (r.billing_basis === "hybrid") {
          billable = r.minimum_seats + Math.max(0, num - r.minimum_seats); // F-07
        }

        const seatAmount = billable * r.seat_rate;
        const totalAmount = seatAmount + (r.meeting_room_overage_amount || 0);

        return {
          ...r,
          occupied_seats: num,
          billable_seats: billable,
          amount: totalAmount,
        };
      })
    );
  };

  const handleSave = async (action: "save" | "submit_for_approval" | "approve") => {
    if (!propertyId && properties.length > 0) {
      setPropertyId(properties[0].id);
    }
    const propToUse = propertyId || (properties.length > 0 ? properties[0].id : "default");

    try {
      setSaving(true);
      const res = await fetch("/api/operations/seat-counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propToUse,
          period,
          action,
          rows,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNotice({ type: "success", text: json.message });
        fetchData();
        setTimeout(() => setNotice(null), 4000);
      } else {
        setNotice({ type: "error", text: json.error || "Failed to update seat counts" });
      }
    } catch (e: any) {
      setNotice({ type: "error", text: e.message || "Network error" });
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
          const name = parts[0].toLowerCase();
          const val = parseInt(parts[1], 10);
          if (!isNaN(val)) updates.set(name, val);
        }
      });

      setRows((prev) =>
        prev.map((r) => {
          const matchedVal = updates.get(r.member_name.toLowerCase());
          if (matchedVal !== undefined) {
            let billable = matchedVal;
            if (r.billing_basis === "contracted") billable = r.contracted_seats;
            else if (r.billing_basis === "occupied") billable = matchedVal;
            else if (r.billing_basis === "minimum") billable = Math.max(matchedVal, r.minimum_seats);
            else if (r.billing_basis === "hybrid") billable = r.minimum_seats + Math.max(0, matchedVal - r.minimum_seats);

            return {
              ...r,
              occupied_seats: matchedVal,
              billable_seats: billable,
              amount: billable * r.seat_rate + (r.meeting_room_overage_amount || 0),
            };
          }
          return r;
        })
      );
      setCsvModalOpen(false);
      setNotice({
        type: "success",
        text: `Imported ${updates.size} member counts from CSV. Review numbers and submit for approval.`,
      });
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      alert("Invalid CSV format. Expected: member_name, occupied_seats");
    }
  };

  const totalContractedCount = rows.reduce((s, r) => s + r.contracted_seats, 0);
  const totalOccupiedCount = rows.reduce((s, r) => s + r.occupied_seats, 0);
  const totalBillableCount = rows.reduce((s, r) => s + r.billable_seats, 0);
  const totalPeriodRevenue = rows.reduce((s, r) => s + r.amount, 0);
  const totalCapacityCount = summary?.total_capacity || 240;
  const currentOccupancyPct = totalCapacityCount > 0 ? ((totalOccupiedCount / totalCapacityCount) * 100).toFixed(1) : "0.0";

  const isApproved = summary?.status === "approved" || rows.every((r) => r.status === "approved");

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-[#0F8B7D]/10 text-[#0F8B7D] rounded-full border border-[#0F8B7D]/20">
              Screen S-32 &middot; Flex Seat Counts
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              Alert AL-14 Day-25 Cutoff Lock
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              Formulas F-04, F-05, F-06, F-07
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Flex & Managed Office Seat Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture member seat occupancies before Day 25, evaluate contracted vs minimum vs occupied billable formulas, and approve counts to unlock billing runs.
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
            onClick={() => handleSave("submit_for_approval")}
            disabled={saving}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit &rarr; Finance Approval</span>
          </button>

          <button
            onClick={() => handleSave("approve")}
            disabled={saving}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve Seat Count</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Alert AL-14 Cutoff Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-black">Alert AL-14 (Day-25 Billing Cutoff):</span> Flex contracts cannot be billed until seat counts are approved by Finance Checker. Unapproved counts block the billing run.
          </div>
        </div>
        <div className="text-[11px] font-mono font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
          Due 25-{period.split("-")[0]}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Centre Capacity
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalCapacityCount} <span className="text-xs text-slate-400 font-sans">seats</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total physical workstation inventory</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Physical Occupancy (K-07)
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono">
            {currentOccupancyPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalOccupiedCount} occupied of {totalCapacityCount}</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Billable Seats (F-04..F-07)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalBillableCount} <span className="text-xs text-slate-400 font-sans">seats</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Applying minimum guarantees & contracted caps</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Est. Period Flex Revenue
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#0F8B7D] font-mono">
            ₹{totalPeriodRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Feeds into period billing run draft</div>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-bold">Flex Centre</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0F8B7D]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.property_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-bold">Billing Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0F8B7D]"
            >
              <option value="Oct-2026">Oct-2026</option>
              <option value="Nov-2026">Nov-2026</option>
              <option value="Sep-2026">Sep-2026</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
            isApproved
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}>
            {isApproved ? "Approved (Billing Unlocked)" : "Draft / Pending Approval"}
          </span>
        </div>
      </div>

      {/* Mobile Card View (< sm screens) */}
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-slate-700">No Flex Members Found</div>
            <p className="text-xs text-slate-500 mt-1">No flex contracts configured for this centre.</p>
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.contract_id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{r.member_name}</h4>
                  <div className="text-[11px] text-slate-500 font-medium">{r.plan_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                  {r.billing_basis}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contracted / Min</span>
                  <span className="font-mono text-slate-700">
                    {r.contracted_seats} / {r.minimum_seats || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupied [Input]</span>
                  <input
                    type="number"
                    value={r.occupied_seats}
                    onChange={(e) => handleOccupiedChange(r.contract_id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billable Seats</span>
                  <span className="font-mono text-slate-900 font-bold">{r.billable_seats} seats</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount (₹)</span>
                  <span className="font-mono text-[#0F8B7D] font-black">
                    ₹{r.amount.toLocaleString("en-IN")}
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
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Plan</th>
                <th className="py-3 px-4 font-semibold text-center">Basis</th>
                <th className="py-3 px-4 font-semibold text-right">Contracted</th>
                <th className="py-3 px-4 font-semibold text-right">Minimum</th>
                <th className="py-3 px-4 font-semibold text-right w-32">Occupied [Input]</th>
                <th className="py-3 px-4 font-semibold text-right">Billable</th>
                <th className="py-3 px-4 font-semibold text-right">Rate/Seat (₹)</th>
                <th className="py-3 px-4 font-semibold text-right font-bold text-[#0F8B7D]">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-sans">
                    No flex contracts found for this centre.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.contract_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      {r.member_name}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-sans">
                      {r.plan_name}
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold capitalize">
                        {r.billing_basis}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      {r.contracted_seats > 0 ? r.contracted_seats : "-"}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      {r.minimum_seats > 0 ? r.minimum_seats : "-"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        value={r.occupied_seats}
                        onChange={(e) => handleOccupiedChange(r.contract_id, e.target.value)}
                        className="w-24 text-right bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0F8B7D] font-bold"
                      />
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {r.billable_seats}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      ₹{r.seat_rate.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#0F8B7D]">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Capacity: <strong>{totalCapacityCount} seats</strong></span>
            <span>&bull;</span>
            <span>Occupied: <strong>{totalOccupiedCount} ({currentOccupancyPct}%)</strong></span>
            <span>&bull;</span>
            <span>Billable: <strong>{totalBillableCount} seats</strong></span>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 font-bold text-[#0F8B7D]">
            Total Flex Revenue: ₹{totalPeriodRevenue.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* CSV Bulk Ingestion Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bulk CSV Upload (Seat Counts)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Paste member occupied counts</p>
              </div>
              <button onClick={() => setCsvModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div className="text-xs text-slate-600">
                Format: <code className="text-[#0F8B7D] font-bold">member_name, occupied_seats</code> (one per line)
                <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800 mt-1">
                  Brightpath, 82{"\n"}
                  Nimbus Labs, 55{"\n"}
                  Hot desk pool, 30
                </pre>
              </div>

              <textarea
                rows={6}
                placeholder="Brightpath, 82..."
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
                  Import Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

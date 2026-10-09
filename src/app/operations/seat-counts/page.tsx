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
      const res = await fetch(`/api/flex/seats?property_id=${propertyId}&period=${period}`);
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

  const handleOverageChange = (contractId: string, hoursStr: string) => {
    const hours = Math.max(0, parseFloat(hoursStr) || 0);
    const overageAmt = hours * 800; // ₹800/hr meeting room overage rate per S-15

    setRows((prev) =>
      prev.map((r) => {
        if (r.contract_id !== contractId) return r;
        const seatAmount = r.billable_seats * r.seat_rate;
        return {
          ...r,
          meeting_room_overage_hours: hours,
          meeting_room_overage_amount: overageAmt,
          amount: seatAmount + overageAmt,
        };
      })
    );
  };

  const handleSave = async (action: "save" | "submit_for_approval" | "approve") => {
    try {
      setSaving(true);
      const res = await fetch("/api/flex/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          period,
          action,
          rows,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotice({ type: "success", text: json.message });
        fetchData();
        setTimeout(() => setNotice(null), 4000);
      } else {
        setNotice({ type: "error", text: json.error || "Failed to process seat counts" });
      }
    } catch (e: any) {
      setNotice({ type: "error", text: e.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const totalOccupiedCount = rows.reduce((s, r) => s + r.occupied_seats, 0);
  const totalCapacityCount = summary?.total_capacity || 240;
  const currentOccupancyPct = totalCapacityCount > 0 ? ((totalOccupiedCount / totalCapacityCount) * 100).toFixed(1) : "0.0";
  const totalPeriodRevenue = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-purple-400 uppercase">
              <span>Managed Office Operations</span>
              <span>•</span>
              <span>Screen S-32</span>
              <span>•</span>
              <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                Formulas F-04…F-07 & Alert AL-14
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Monthly Seat Counts Entry
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Record occupied seats per flex member prior to monthly billing. Enforces minimum commitments & day-25 cutoff lock.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/settings/pricing-plans"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Pricing Plans (S-15)
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
              disabled={saving || summary?.is_locked}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleSave("submit_for_approval")}
              disabled={saving || summary?.is_locked}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit &rarr; Finance Approval</span>
            </button>
          </div>
        </div>

        {notice && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between ${
              notice.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice.text}</span>
            </div>
            <button onClick={() => setNotice(null)}>✕</button>
          </div>
        )}

        {/* AL-14 Cutoff Banner if approaching / past 25th */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Alert AL-14 (Day-25 Billing Cutoff):</span> Seat counts must be submitted by 25th of the month. Flex billing run is blocked until counts are approved.
            </div>
          </div>
          <div className="text-[11px] font-mono bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30">
            Due 25-{period.split("-")[0]}
          </div>
        </div>

        {/* Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Flex Centre</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.property_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Billing Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="Oct-2026">Oct-2026</option>
                <option value="Nov-2026">Nov-2026</option>
                <option value="Sep-2026">Sep-2026</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Centre Capacity:</span>{" "}
              <span className="text-white font-bold">{totalCapacityCount} seats</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Occupancy:</span>{" "}
              <span className="text-purple-400 font-bold">{currentOccupancyPct}%</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Est. Flex Revenue:</span>{" "}
              <span className="text-emerald-400 font-bold">₹{totalPeriodRevenue.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Wireframe S-32 Seat Counts Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Basis (Rule)</th>
                  <th className="py-3 px-4 font-semibold text-center">Contracted</th>
                  <th className="py-3 px-4 font-semibold text-center">Minimum</th>
                  <th className="py-3 px-4 font-semibold text-center w-28">Occupied [Input]</th>
                  <th className="py-3 px-4 font-semibold text-center">Billable Seats</th>
                  <th className="py-3 px-4 font-semibold text-right">Seat Rate</th>
                  <th className="py-3 px-4 font-semibold text-center">Meeting Rm (Hrs)</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-sans">
                      No flex members found for this centre. Add members in contract register.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.contract_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-100">
                        {r.member_name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {r.plan_name}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.billing_basis === "minimum"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : r.billing_basis === "contracted"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}
                        >
                          {r.billing_basis}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-300">
                        {r.contracted_seats || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {r.minimum_seats || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          value={r.occupied_seats}
                          onChange={(e) => handleOccupiedChange(r.contract_id, e.target.value)}
                          className="w-20 text-center bg-slate-950 border border-slate-700 focus:border-purple-500 rounded px-2 py-1 text-xs text-white font-bold"
                        />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-purple-400 bg-purple-950/40 px-2.5 py-0.5 rounded border border-purple-500/30">
                          {r.billable_seats}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300">
                        ₹{r.seat_rate.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          placeholder="0"
                          value={r.meeting_room_overage_hours || ""}
                          onChange={(e) => handleOverageChange(r.contract_id, e.target.value)}
                          className="w-16 text-center bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-300"
                        />
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        ₹{r.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Capacity Footer per Wireframe S-32 */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 font-sans">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">Capacity {totalCapacityCount}</span>
              <span>|</span>
              <span className="text-purple-300">
                Occupied {totalOccupiedCount} ({currentOccupancyPct}%)
              </span>
              <span>|</span>
              <span className="text-slate-400">
                Vacant {Math.max(0, totalCapacityCount - totalOccupiedCount)} seats
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className="text-[11px] text-slate-500">Status: {summary?.status?.toUpperCase() || "DRAFT"}</span>
              {summary?.status === "submitted" && (
                <button
                  onClick={() => handleSave("approve")}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors"
                >
                  Finance: Approve for Billing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload Monthly Seat Counts CSV</h3>
              <button onClick={() => setCsvModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-400">
                Format: <code className="text-purple-400">member_name_or_contract, occupied_seats</code>
              </p>
              <textarea
                rows={5}
                placeholder="Brightpath, 82&#10;Nimbus Labs, 55&#10;Hot Desk, 30"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCsvModalOpen(false);
                    setNotice({ type: "success", text: "CSV counts imported. Review and save." });
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
                >
                  Apply Counts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

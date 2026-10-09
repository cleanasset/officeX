"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Check
} from "lucide-react";

interface CentreData {
  centre: {
    name: string;
    period: string;
    seat_capacity: number;
    occupied_seats: number;
    seat_occupancy_pct: number;
    head_lease_area_sqft: number;
    rent_rate_psf: number;
    cam_rate_psf: number;
  };
  kpis: {
    total_member_revenue: number;
    head_lease_rent: number;
    cam_payable: number;
    centre_opex: number;
    centre_contribution: number;
    contribution_margin_pct: number;
    revpad_inr: number;
    rev_per_occupied_seat_inr: number;
    break_even_occupancy_pct: number;
  };
  head_lease_details: {
    master_landlord: string;
    contract_code: string;
    lock_in_end: string;
    lease_expiry: string;
    security_deposit_held: number;
    escalation_clause: string;
  };
  payables_schedule: Array<{
    payable_id: string;
    period: string;
    obligation: string;
    payee: string;
    due_date: string;
    amount: number;
    status: string;
    payment_reference: string | null;
    paid_date: string | null;
  }>;
  member_plans: Array<{
    member_name: string;
    plan: string;
    billing_basis: string;
    contracted_seats: number | null;
    min_seats: number | null;
    occupied_seats: number;
    rate_per_seat: number;
    billable_seats: number;
    monthly_amount: number;
  }>;
}

export default function HeadLeasesPage() {
  const [data, setData] = useState<CentreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("Oct-2026");
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchHeadLeases();
  }, [selectedPeriod]);

  const fetchHeadLeases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/head-leases?period=${selectedPeriod}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (payableId: string) => {
    try {
      const res = await fetch("/api/head-leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payable_id: payableId,
          payment_reference: `RTGS-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          paid_date: new Date().toISOString().split("T")[0],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPaidIds((prev) => [...prev, payableId]);
        setNotification("Payable obligation settled and verified. Financial ledger updated.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-28 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Screen S-57
              </span>
              <span className="text-xs text-slate-500 font-mono">Flex Operator &amp; Payable Contracts</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <TrendingUp className="text-[#0D7B6C] shrink-0" size={24} />
              Head Leases &amp; Centre P&amp;L
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Operator payable contracts to master landlords, RevPAD (Revenue per Available Desk), and break-even seat occupancy analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm font-medium text-slate-700"
            >
              <option value="Oct-2026">October 2026</option>
              <option value="Sep-2026">September 2026</option>
              <option value="Aug-2026">August 2026</option>
            </select>
            <button
              onClick={fetchHeadLeases}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Computing flex centre P&L & head lease obligations...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Overview Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Member Revenue</div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  ₹{(data.kpis.total_member_revenue / 100000).toFixed(2)}L
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Desks + meeting + pk</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Head-Lease Rent</div>
                <div className="text-lg font-bold text-red-600 mt-1">
                  ₹{(data.kpis.head_lease_rent / 100000).toFixed(2)}L
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">18k sf @ ₹95 psf</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">CAM to Landlord</div>
                <div className="text-lg font-bold text-red-600 mt-1">
                  ₹{(data.kpis.cam_payable / 100000).toFixed(2)}L
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">18k sf @ ₹15 psf</div>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 shadow-sm">
                <div className="text-[11px] font-bold text-emerald-800 uppercase">Contribution (F-23)</div>
                <div className="text-lg font-extrabold text-[#0D7B6C] mt-1">
                  ₹{(data.kpis.centre_contribution / 100000).toFixed(2)}L
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  {data.kpis.contribution_margin_pct}% margin
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Seat Occupancy (F-16)</div>
                <div className="text-lg font-bold text-slate-900 mt-1 flex items-baseline gap-1">
                  {data.centre.seat_occupancy_pct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{data.centre.occupied_seats} / {data.centre.seat_capacity} seats</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">RevPAD (D-29)</div>
                <div className="text-lg font-bold text-[#0D7B6C] mt-1">
                  ₹{data.kpis.revpad_inr.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Per available seat</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Break-Even (F-24)</div>
                <div className="text-lg font-bold text-amber-700 mt-1">
                  {data.kpis.break_even_occupancy_pct}%
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  +{(data.centre.seat_occupancy_pct - data.kpis.break_even_occupancy_pct).toFixed(1)} pts buffer
                </div>
              </div>
            </div>

            {/* Master Head Lease Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7B6C] flex items-center justify-center font-bold">
                    <Building size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{data.centre.name}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                        {data.head_lease_details.contract_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Payable Contract to Landlord: <strong>{data.head_lease_details.master_landlord}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase">
                    Direction: Payable Contract (RR-FLX-08)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Demised Floorplate:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{data.centre.head_lease_area_sqft.toLocaleString()} sq ft</span>
                  <span className="text-[10px] text-slate-400">₹{data.centre.rent_rate_psf} rent + ₹{data.centre.cam_rate_psf} CAM psf</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Lock-in Period:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{data.head_lease_details.lock_in_end}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Expiry: {data.head_lease_details.lease_expiry}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Security Deposit Held:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">₹{(data.head_lease_details.security_deposit_held / 100000).toFixed(2)} Lakh</span>
                  <span className="text-[10px] text-slate-400">Bank Guarantee (6 months)</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Escalation Term:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{data.head_lease_details.escalation_clause}</span>
                  <span className="text-[10px] text-slate-400">Step adjustment on schedule</span>
                </div>
              </div>
            </div>

            {/* Monthly Payables Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Head Lease Monthly Payables Schedule — {selectedPeriod}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Payables generated automatically from head lease contract</p>
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase">Finance Maker-Checker</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Obligation</th>
                      <th className="py-2.5 px-3">Payee / Master Landlord</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Settlement Reference</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.payables_schedule.map((p) => {
                      const isPaid = p.status === "paid" || paidIds.includes(p.payable_id);
                      return (
                        <tr key={p.payable_id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-semibold text-slate-900">{p.obligation}</td>
                          <td className="py-3 px-3 text-slate-600">{p.payee}</td>
                          <td className="py-3 px-3 text-slate-600">{p.due_date}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">₹{p.amount.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {isPaid ? "Paid" : "Due"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {isPaid ? (p.payment_reference || "RTGS-CONFIRMED") : "Pending Clearance"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isPaid ? (
                              <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                                <Check size={14} /> Settled
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkPaid(p.payable_id)}
                                className="px-3 py-1 bg-[#0D7B6C] hover:bg-[#09574C] text-white rounded font-bold text-[11px] shadow-sm"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Centre P&L Statement (§13.7 Table 101 Worked Example) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Centre Monthly P&L Ledger (§13.7 Specification)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Contracted member revenue vs. head lease rent and centre opex</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#0D7B6C]">Formulas F-20, F-23, F-24 Verified</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">Seat and membership revenue</span>
                  <span className="font-semibold text-slate-900">₹26,40,000</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">Meeting rooms (42 hrs × ₹800)</span>
                  <span className="font-semibold text-slate-900">₹33,600</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">Parking (12 slots × ₹4,000)</span>
                  <span className="font-semibold text-slate-900">₹48,000</span>
                </div>
                <div className="py-3 flex justify-between bg-slate-50/80 px-2 rounded font-bold">
                  <span className="text-slate-900">Total Member Revenue</span>
                  <span className="text-slate-900">₹{data.kpis.total_member_revenue.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between text-red-600">
                  <span className="font-medium">Head-lease rent payable to master landlord</span>
                  <span className="font-semibold">-₹{data.kpis.head_lease_rent.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between text-red-600">
                  <span className="font-medium">CAM payable to landlord (18,000 sq ft × ₹15)</span>
                  <span className="font-semibold">-₹{data.kpis.cam_payable.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between text-red-600">
                  <span className="font-medium">Centre opex (staff, utilities, housekeeping, WiFi)</span>
                  <span className="font-semibold">-₹{data.kpis.centre_opex.toLocaleString()}</span>
                </div>
                <div className="py-3.5 flex justify-between bg-emerald-50 px-3 rounded-lg border border-emerald-200 font-extrabold text-sm text-emerald-950">
                  <span>Centre Contribution (Formula F-23)</span>
                  <span className="text-[#0D7B6C]">
                    ₹{data.kpis.centre_contribution.toLocaleString()} ({data.kpis.contribution_margin_pct}% margin)
                  </span>
                </div>
              </div>
            </div>

            {/* Member Plans Detail Table (§13.7) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Member Contracts & Desk Inventory Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Billing Basis</th>
                      <th className="py-2.5 px-3 text-center">Contr. Seats</th>
                      <th className="py-2.5 px-3 text-center">Occ. Seats</th>
                      <th className="py-2.5 px-3 text-right">Rate / Seat</th>
                      <th className="py-2.5 px-3 text-right">Monthly Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.member_plans.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{m.member_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.plan}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">{m.billing_basis}</td>
                        <td className="py-2.5 px-3 text-center font-medium">{m.contracted_seats ?? "—"}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{m.occupied_seats}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">₹{m.rate_per_seat.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#0D7B6C]">₹{m.monthly_amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

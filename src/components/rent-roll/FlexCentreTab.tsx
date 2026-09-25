"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Clock
} from "lucide-react";

const formatINR = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const FlexCentreTab: React.FC = () => {
  const [centres, setCentres] = useState<any[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isUpdatingOpex, setIsUpdatingOpex] = useState<boolean>(false);
  const [isExecutingPayableRun, setIsExecutingPayableRun] = useState<boolean>(false);

  // Form state for opex update
  const [opexForm, setOpexForm] = useState({
    staffPayroll: 250000,
    utilitiesPower: 180000,
    housekeepingSupplies: 100000,
    highSpeedInternet: 70000
  });

  const fetchCentres = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rent-roll/flex-centres");
      const data = await res.json();
      if (data.success && data.centres.length > 0) {
        setCentres(data.centres);
        if (!selectedCentreId) {
          setSelectedCentreId(data.centres[0].id);
          setOpexForm(data.centres[0].directOpexBreakdown || opexForm);
        }
      }
    } catch (err) {
      console.error("Failed to fetch flex centres:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const activeCentre = centres.find(c => c.id === selectedCentreId) || centres[0];
  const metrics = activeCentre?.metrics || {};

  const handleUpdateOpex = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalOpex = Number(opexForm.staffPayroll) + Number(opexForm.utilitiesPower) +
                        Number(opexForm.housekeepingSupplies) + Number(opexForm.highSpeedInternet);
      
      const res = await fetch("/api/rent-roll/flex-centres", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCentre.id,
          directOpexMonthly: totalOpex,
          directOpexBreakdown: opexForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback("Centre direct OpEx updated successfully. Recalculated Contribution Margin.");
        setIsUpdatingOpex(false);
        await fetchCentres();
      }
    } catch (err: any) {
      alert("Error updating opex: " + err.message);
    }
  };

  const handleExecutePayableRun = () => {
    setIsExecutingPayableRun(true);
    setTimeout(() => {
      setIsExecutingPayableRun(false);
      setActionFeedback(`Monthly payable run executed for ${activeCentre.centreName}. Head Lease Rent (₹17,10,000) & CAM (₹2,70,000) approved for landlord remittance.`);
    }, 800);
  };

  if (isLoading && centres.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#0F8B7D] animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-900">Loading Flex Centre Financials...</h3>
        <p className="text-xs text-gray-500 mt-1">Retrieving head leases, member plans & Section 13.7 contribution metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Centre Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                Managed Office & Co-working (Flex & Seats Add-on)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                Section 13.7 Worked Example
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2 text-white">
              {activeCentre?.centreName || "Brightspace Flex, Sector 44"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Dual-ledger operator management: Head Lease payable to landlord vs. Member multi-tier revenue & centre contribution margin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUpdatingOpex(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Adjust Direct OpEx</span>
            </button>

            <button
              onClick={handleExecutePayableRun}
              disabled={isExecutingPayableRun}
              className="px-3.5 py-2 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isExecutingPayableRun ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Approve Monthly Payables</span>
            </button>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* KPI Cards (Formulas F-16, F-23, F-24) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Member Revenue */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Member Revenue</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900">
            {formatINR(metrics.totalMemberRevenue || 2721600)}
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600">Seats: {formatINR(metrics.seatRevenue || 2640000)}</span>
            <span>·</span>
            <span>Extras: {formatINR(metrics.extrasRevenue || 81600)}</span>
          </div>
        </div>

        {/* Head Lease & Payables */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Head Lease & Landlord CAM</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            {formatINR((metrics.headLeaseRentPayable || 1710000) + (metrics.landlordCamPayable || 270000))}
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span>Rent: {formatINR(metrics.headLeaseRentPayable || 1710000)}</span>
            <span>·</span>
            <span>CAM: {formatINR(metrics.landlordCamPayable || 270000)}</span>
          </div>
        </div>

        {/* Centre Contribution Margin (Formula F-23) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contribution Margin (F-23)</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">
            {formatINR(metrics.centreContributionMargin || 141600)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[11px] font-black">
              {metrics.contributionMarginPct || 5.2}% Margin
            </span>
            <span className="text-gray-500 font-normal">after ₹6.0L direct OpEx</span>
          </div>
        </div>

        {/* Seat Occupancy & Break-even (Formulas F-16 & F-24) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy vs Break-Even</span>
            <div className="p-2 bg-teal-50 text-[#0F8B7D] rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900">
            {metrics.seatOccupancyPct || 84.2}%
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">202 / 240 Desks</span>
            <span>·</span>
            <span className="font-bold text-indigo-600">Break-even: {metrics.breakEvenOccupancyPct || 79.8}%</span>
          </div>
        </div>
      </div>

      {/* Head Lease Payable Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl">
              <Building className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Head Lease (Payable Contract): {activeCentre.headLeaseCode}
              </h3>
              <p className="text-xs text-gray-500">
                Landlord: <span className="font-bold text-gray-800">{activeCentre.landlordName}</span> · Campus: {activeCentre.propertyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">
              18,000 sq ft @ ₹95/sqft Base Rent
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
              CAM ₹15/sqft
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium">Head Lease Base Rent</span>
            <div className="text-sm font-black text-gray-900 mt-1">{formatINR(activeCentre.headLeaseMonthlyRent)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium">Landlord CAM Payable</span>
            <div className="text-sm font-black text-gray-900 mt-1">{formatINR(activeCentre.headLeaseCamMonthly)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium">Direct Centre OpEx</span>
            <div className="text-sm font-black text-gray-900 mt-1">{formatINR(activeCentre.directOpexMonthly)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium">RevPAS (Rev / Occupied Seat)</span>
            <div className="text-sm font-black text-indigo-700 mt-1">{formatINR(metrics.revPAS || 13473)}</div>
          </div>
        </div>
      </div>

      {/* Member Contracts & Plans Table (Section 13.7) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Member Revenue & Seat Inventory Breakdown
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Multi-tier seat plans with Contracted, Minimum Commitment, Hybrid and Hot Desk billing models
            </p>
          </div>
          <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
            Total Billable Desks: {metrics.totalOccupiedSeats || 202} / 240
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Plan Type</th>
                <th className="py-3 px-4">Billing Basis</th>
                <th className="py-3 px-4 text-center">Contracted</th>
                <th className="py-3 px-4 text-center">Min. Commit</th>
                <th className="py-3 px-4 text-center">Occupied</th>
                <th className="py-3 px-4 text-right">Rate / Seat</th>
                <th className="py-3 px-4 text-center">Billable</th>
                <th className="py-3 px-4 text-right">Monthly Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {activeCentre.members.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>{m.memberName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{m.planName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 capitalize">
                      {m.billingBasis.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold">{m.contractedSeats || "-"}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-500">{m.minimumSeats || "-"}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-teal-700">{m.occupiedSeats}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-gray-900">{formatINR(m.ratePerSeat)}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/50">
                    {m.billableSeats}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-gray-900">
                    {formatINR(m.monthlyAmount)}
                  </td>
                </tr>
              ))}

              {/* Ancillary Services Rows (Meeting Rooms & Parking) */}
              <tr className="bg-slate-50/50 font-medium">
                <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
                  Meeting Rooms Usage (42 hrs @ ₹800/hr)
                </td>
                <td colSpan={4} className="text-gray-500 text-center">Ancillary On-Demand</td>
                <td className="text-center font-bold">42 hrs</td>
                <td className="py-3 px-4 text-right font-black text-gray-900">
                  {formatINR(activeCentre.meetingRoomHourlyRate * activeCentre.meetingRoomHoursBilled)}
                </td>
              </tr>
              <tr className="bg-slate-50/50 font-medium">
                <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
                  Dedicated Executive Parking (12 slots @ ₹4,000/slot)
                </td>
                <td colSpan={4} className="text-gray-500 text-center">Facility Add-on</td>
                <td className="text-center font-bold">12 bays</td>
                <td className="py-3 px-4 text-right font-black text-gray-900">
                  {formatINR(activeCentre.parkingSlotRate * activeCentre.parkingSlotsBilled)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
              <tr>
                <td className="py-3 px-4 uppercase tracking-wider text-[11px]" colSpan={3}>
                  Total Monthly Centre Revenue
                </td>
                <td className="text-center">{metrics.seatCapacity} seats</td>
                <td></td>
                <td className="text-center text-teal-800">{metrics.totalOccupiedSeats} occ</td>
                <td></td>
                <td></td>
                <td className="py-3 px-4 text-right font-black text-indigo-900 text-sm">
                  {formatINR(metrics.totalMemberRevenue || 2721600)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* OpEx Breakdown Adjustment Modal */}
      {isUpdatingOpex && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900">Adjust Direct Centre OpEx</h3>
            <p className="text-xs text-gray-500 mt-1">
              Update direct operational cost lines to recalculate contribution margin (Formula F-23).
            </p>

            <form onSubmit={handleUpdateOpex} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Staff & Centre Management Payroll (₹)</label>
                <input
                  type="number"
                  value={opexForm.staffPayroll}
                  onChange={(e) => setOpexForm({ ...opexForm, staffPayroll: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Power & Utilities Consumption (₹)</label>
                <input
                  type="number"
                  value={opexForm.utilitiesPower}
                  onChange={(e) => setOpexForm({ ...opexForm, utilitiesPower: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Janitorial & Housekeeping Supplies (₹)</label>
                <input
                  type="number"
                  value={opexForm.housekeepingSupplies}
                  onChange={(e) => setOpexForm({ ...opexForm, housekeepingSupplies: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">High-Speed Leased Line Internet & SaaS (₹)</label>
                <input
                  type="number"
                  value={opexForm.highSpeedInternet}
                  onChange={(e) => setOpexForm({ ...opexForm, highSpeedInternet: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">
                  Total Monthly OpEx: {formatINR(Number(opexForm.staffPayroll) + Number(opexForm.utilitiesPower) + Number(opexForm.housekeepingSupplies) + Number(opexForm.highSpeedInternet))}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingOpex(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

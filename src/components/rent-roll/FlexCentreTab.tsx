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
  Clock,
  UploadCloud,
  FileSpreadsheet,
  Check,
  Send,
  Calendar,
  Lock
} from "lucide-react";

const formatINR = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const FlexCentreTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"pnl" | "seat_counts">("pnl");
  const [centres, setCentres] = useState<any[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isUpdatingOpex, setIsUpdatingOpex] = useState<boolean>(false);
  const [isExecutingPayableRun, setIsExecutingPayableRun] = useState<boolean>(false);
  const [isRemitModalOpen, setIsRemitModalOpen] = useState<boolean>(false);
  const [remitUtr, setRemitUtr] = useState<string>("");

  // S-32 Seat Count State
  const [seatCountPeriod, setSeatCountPeriod] = useState<string>("2026-10");
  const [seatCountStatus, setSeatCountStatus] = useState<"draft" | "submitted" | "approved">("approved");
  const [memberSeats, setMemberSeats] = useState<any[]>([]);
  const [isSavingCounts, setIsSavingCounts] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>("");

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
          const first = data.centres[0];
          setSelectedCentreId(first.id);
          setOpexForm(first.directOpexBreakdown || opexForm);
          setMemberSeats(first.members || []);
        } else {
          const current = data.centres.find((c: any) => c.id === selectedCentreId) || data.centres[0];
          setMemberSeats(current.members || []);
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

  // Helper for computing billable seats (F-04, F-05, F-06)
  const computeBillableSeats = (
    basis: string,
    contracted: number,
    occupied: number,
    minimum?: number
  ): number => {
    if (basis === "contracted") return contracted;
    if (basis === "occupied") return occupied;
    if (basis === "minimum" || basis === "minimum_commitment" || basis === "hybrid") {
      return Math.max(minimum || 0, occupied);
    }
    return occupied;
  };

  // Handle changing occupied seats for a member
  const handleOccupiedSeatsChange = (memberId: string, newOccupied: number) => {
    const val = Math.max(0, newOccupied || 0);
    setMemberSeats(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          const billable = computeBillableSeats(m.billingBasis, m.contractedSeats, val, m.minimumSeats);
          const monthly = billable * m.ratePerSeat;
          return {
            ...m,
            occupiedSeats: val,
            billableSeats: billable,
            monthlyAmount: monthly
          };
        }
        return m;
      })
    );
  };

  // Recalculated metrics live
  const dynamicTotalOccupied = memberSeats.reduce((sum, m) => sum + (m.occupiedSeats || 0), 0);
  const dynamicSeatRevenue = memberSeats.reduce((sum, m) => sum + (m.monthlyAmount || 0), 0);
  const extrasRevenue = ((activeCentre?.meetingRoomHourlyRate || 800) * (activeCentre?.meetingRoomHoursBilled || 42)) +
                        ((activeCentre?.parkingSlotRate || 4000) * (activeCentre?.parkingSlotsBilled || 12));
  const dynamicTotalRevenue = dynamicSeatRevenue + extrasRevenue;

  const totalOpex = Number(opexForm.staffPayroll) + Number(opexForm.utilitiesPower) +
                    Number(opexForm.housekeepingSupplies) + Number(opexForm.highSpeedInternet);
  const headLeaseRent = activeCentre?.headLeaseMonthlyRent || 1710000;
  const headLeaseCam = activeCentre?.headLeaseCamMonthly || 270000;
  const totalDirectCosts = headLeaseRent + headLeaseCam + totalOpex;

  // Formula F-23: Centre Contribution
  const dynamicContributionMargin = dynamicTotalRevenue - totalDirectCosts;
  const dynamicContributionPct = dynamicTotalRevenue > 0 ? (dynamicContributionMargin / dynamicTotalRevenue) * 100 : 0;

  // Formula F-16: Seat Occupancy
  const capacity = activeCentre?.seatCapacity || 240;
  const dynamicOccupancyPct = capacity > 0 ? (dynamicTotalOccupied / capacity) * 100 : 0;

  const revPAS = dynamicTotalOccupied > 0 ? dynamicTotalRevenue / dynamicTotalOccupied : 0;
  // Formula F-24: Break-Even Occupancy
  const dynamicBreakEvenPct = (revPAS > 0 && capacity > 0)
    ? (totalDirectCosts / (revPAS * capacity)) * 100
    : 0;

  // Save Seat Counts to backend
  const handleSaveSeatCounts = async (status: "draft" | "submitted" | "approved") => {
    setIsSavingCounts(true);
    try {
      const res = await fetch("/api/rent-roll/flex-centres", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCentre.id,
          members: memberSeats
        })
      });
      if (res.ok) {
        setSeatCountStatus(status);
        if (status === "submitted") {
          setActionFeedback(`Seat counts for ${seatCountPeriod} submitted to Finance for approval (Day 25 cut-off).`);
        } else if (status === "approved") {
          setActionFeedback(`Seat counts for ${seatCountPeriod} approved by Finance. Unblocked for October Billing Run.`);
        } else {
          setActionFeedback("Seat counts saved as draft.");
        }
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch (err: any) {
      alert("Error saving seat counts: " + err.message);
    } finally {
      setIsSavingCounts(false);
    }
  };

  // CSV Bulk Import for seat counts
  const handleParseCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split("\n");
    let updatedCount = 0;
    const updated = memberSeats.map(m => {
      const line = lines.find(l => l.toLowerCase().includes(m.memberName.toLowerCase()));
      if (line) {
        const parts = line.split(",").map(p => p.trim());
        const count = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(count)) {
          updatedCount++;
          const billable = computeBillableSeats(m.billingBasis, m.contractedSeats, count, m.minimumSeats);
          return {
            ...m,
            occupiedSeats: count,
            billableSeats: billable,
            monthlyAmount: billable * m.ratePerSeat
          };
        }
      }
      return m;
    });

    setMemberSeats(updated);
    setIsCsvModalOpen(false);
    setCsvText("");
    setActionFeedback(`Imported seat counts for ${updatedCount} members via CSV.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleUpdateOpex = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        setTimeout(() => setActionFeedback(null), 5000);
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
      setTimeout(() => setActionFeedback(null), 5000);
    }, 800);
  };

  const handleRecordRemittance = () => {
    setIsRemitModalOpen(false);
    setActionFeedback(`Landlord remittance of ₹18,57,600 recorded (UTR: ${remitUtr || "UTR-DLF-892147"}). Corporate escrow voucher cleared.`);
    setTimeout(() => setActionFeedback(null), 5000);
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
                Managed Office &amp; Co-working (Flex &amp; Seats Add-on)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                Section 13.7 Worked Example
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2 text-white">
              {activeCentre?.centreName || "Brightspace Flex, Sector 44"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Dual-ledger operator management: Head Lease payable to landlord vs. Member multi-tier revenue &amp; centre contribution margin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sub-tab toggle buttons */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveSubTab("pnl")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === "pnl" ? "bg-white text-gray-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                Centre P&amp;L (S-57)
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("seat_counts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "seat_counts" ? "bg-white text-gray-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <span>Seat Counts (S-32)</span>
                {seatCountStatus === "approved" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsUpdatingOpex(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Direct OpEx</span>
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
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
            {formatINR(dynamicTotalRevenue)}
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600">Seats: {formatINR(dynamicSeatRevenue)}</span>
            <span>·</span>
            <span>Extras: {formatINR(extrasRevenue)}</span>
          </div>
        </div>

        {/* Head Lease & Payables */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Head Lease &amp; Landlord CAM</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            {formatINR(headLeaseRent + headLeaseCam)}
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span>Rent: {formatINR(headLeaseRent)}</span>
            <span>·</span>
            <span>CAM: {formatINR(headLeaseCam)}</span>
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
            {formatINR(dynamicContributionMargin)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[11px] font-black">
              {dynamicContributionPct.toFixed(1)}% Margin
            </span>
            <span className="text-gray-500 font-normal">after {formatINR(totalOpex)} direct OpEx</span>
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
            {dynamicOccupancyPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">{dynamicTotalOccupied} / {capacity} Desks</span>
            <span>·</span>
            <span className="font-bold text-indigo-600">Break-even: {dynamicBreakEvenPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* ──── VIEW 1: CENTRE P&L & HEAD LEASE DUAL-LEDGER (S-57) ──── */}
      {activeSubTab === "pnl" && (
        <div className="space-y-6">
          {/* Head Lease Payable Summary Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Head Lease Contract: {activeCentre?.headLeaseCode || "HL-DLF-GGN44-01"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Landlord: <span className="font-bold text-gray-800">{activeCentre?.landlordName || "DLF Cyber City Developers Ltd"}</span> · Campus: {activeCentre?.propertyName || "Meridian Tech Park"}
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
                <button
                  type="button"
                  onClick={() => setIsRemitModalOpen(true)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Record Landlord Remittance
                </button>
              </div>
            </div>

            {/* Landlord Payables Dual-Ledger Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium">Gross Base Rent Payable</span>
                <div className="text-sm font-black text-gray-900 mt-1">{formatINR(headLeaseRent)}</div>
                <span className="text-[10px] text-gray-400">Due 1st of month</span>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <span className="text-rose-700 font-medium">TDS 10% (Sec 194-I)</span>
                <div className="text-sm font-black text-rose-600 mt-1">-{formatINR(headLeaseRent * 0.10)}</div>
                <span className="text-[10px] text-rose-500 font-mono">Form 16A Challan</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-emerald-800 font-medium">Net Rent Disbursal</span>
                <div className="text-sm font-black text-emerald-800 mt-1">{formatINR(headLeaseRent * 0.90)}</div>
                <span className="text-[10px] text-emerald-600">RTGS to Landlord</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium">CAM Payable (with GST)</span>
                <div className="text-sm font-black text-gray-900 mt-1">{formatINR(headLeaseCam * 1.18)}</div>
                <span className="text-[10px] text-gray-400">₹2.70L + 18% GST</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-indigo-800 font-medium">RevPAS (per Occ. Desk)</span>
                <div className="text-sm font-black text-indigo-700 mt-1">{formatINR(revPAS)}</div>
                <span className="text-[10px] text-indigo-600 font-bold">202 Occupied</span>
              </div>
            </div>
          </div>

          {/* Member Contracts & Plans Table (Section 13.7) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Member Revenue &amp; Seat Inventory Breakdown
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Multi-tier seat plans with Contracted, Minimum Commitment, Hybrid and Hot Desk billing models
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("seat_counts")}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Update Seat Counts (S-32)</span>
                </button>
                <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl font-mono">
                  {dynamicTotalOccupied} / {capacity} Desks ({dynamicOccupancyPct.toFixed(1)}%)
                </div>
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
                    <th className="py-3 px-4 text-center">Billable (F-04..06)</th>
                    <th className="py-3 px-4 text-right">Monthly Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {memberSeats.map((m: any) => (
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

                  {/* Ancillary Services Rows */}
                  <tr className="bg-slate-50/50 font-medium">
                    <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
                      Meeting Rooms Usage (42 hrs @ ₹800/hr)
                    </td>
                    <td colSpan={4} className="text-gray-500 text-center">Ancillary On-Demand</td>
                    <td className="text-center font-bold">42 hrs</td>
                    <td className="py-3 px-4 text-right font-black text-gray-900">
                      {formatINR((activeCentre?.meetingRoomHourlyRate || 800) * (activeCentre?.meetingRoomHoursBilled || 42))}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 font-medium">
                    <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
                      Dedicated Executive Parking (12 slots @ ₹4,000/slot)
                    </td>
                    <td colSpan={4} className="text-gray-500 text-center">Facility Add-on</td>
                    <td className="text-center font-bold">12 bays</td>
                    <td className="py-3 px-4 text-right font-black text-gray-900">
                      {formatINR((activeCentre?.parkingSlotRate || 4000) * (activeCentre?.parkingSlotsBilled || 12))}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                  <tr>
                    <td className="py-3 px-4 uppercase tracking-wider text-[11px]" colSpan={3}>
                      Total Monthly Centre Revenue
                    </td>
                    <td className="text-center">{capacity} capacity</td>
                    <td></td>
                    <td className="text-center text-teal-800">{dynamicTotalOccupied} occ</td>
                    <td></td>
                    <td className="text-center font-mono font-bold text-indigo-800">
                      {memberSeats.reduce((s, m) => s + (m.billableSeats || 0), 0)} billable
                    </td>
                    <td className="py-3 px-4 text-right font-black text-indigo-900 text-sm">
                      {formatINR(dynamicTotalRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──── VIEW 2: MONTHLY SEAT COUNT WORKFLOW (S-32) ──── */}
      {activeSubTab === "seat_counts" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                  Screen S-32
                </span>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Monthly Seat Count Entry &amp; Approval
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Centre: <span className="font-bold text-gray-800">{activeCentre?.centreName}</span> · Due by Day 25 for automated Billing Run (AL-14, R-42)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500">Period:</span>
                <input
                  type="month"
                  value={seatCountPeriod}
                  onChange={(e) => setSeatCountPeriod(e.target.value)}
                  className="font-bold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                />
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                seatCountStatus === "approved"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : seatCountStatus === "submitted"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {seatCountStatus === "approved" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                <span className="uppercase">{seatCountStatus}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsCsvModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveSeatCounts("draft")}
                disabled={isSavingCounts}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveSeatCounts("submitted")}
                disabled={isSavingCounts}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Finance</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveSeatCounts("approved")}
                disabled={isSavingCounts}
                className="px-3 py-1.5 bg-[#0F8B7D] hover:bg-[#0c7065] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve (Finance Checker)</span>
              </button>
            </div>
          </div>

          {/* Interactive Grid with inline editable Occupied Desks */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Basis</th>
                  <th className="py-3 px-4 text-center">Contracted</th>
                  <th className="py-3 px-4 text-center">Minimum</th>
                  <th className="py-3 px-4 text-center w-36 bg-amber-50/50">Occupied (Editable)</th>
                  <th className="py-3 px-4 text-right">Seat Rate</th>
                  <th className="py-3 px-4 text-center bg-indigo-50/50">Billable (F-04..06)</th>
                  <th className="py-3 px-4 text-right">Computed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {memberSeats.map((m: any) => (
                  <tr key={m.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{m.memberName}</td>
                    <td className="py-3 px-4 text-gray-600">{m.planName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 capitalize">
                        {m.billingBasis.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{m.contractedSeats || "—"}</td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-500">{m.minimumSeats || "—"}</td>
                    <td className="py-2.5 px-4 text-center bg-amber-50/30">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={activeCentre?.seatCapacity || 240}
                          value={m.occupiedSeats}
                          onChange={(e) => handleOccupiedSeatsChange(m.id, parseInt(e.target.value, 10))}
                          className="w-20 px-2 py-1 bg-white border border-amber-300 rounded-lg text-center font-black text-amber-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                        />
                        <span className="text-[10px] text-gray-400">desks</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">{formatINR(m.ratePerSeat)}</td>
                    <td className="py-3 px-4 text-center font-mono font-black text-indigo-700 bg-indigo-50/40 text-sm">
                      {m.billableSeats}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-gray-900">
                      {formatINR(m.monthlyAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                <tr>
                  <td className="py-3 px-4 uppercase tracking-wider text-[11px]" colSpan={3}>
                    Centre Totals &amp; Statutory Reconciliation
                  </td>
                  <td className="text-center font-mono">{capacity} capacity</td>
                  <td></td>
                  <td className="text-center font-mono text-amber-900 font-black">
                    {dynamicTotalOccupied} occupied ({dynamicOccupancyPct.toFixed(1)}%)
                  </td>
                  <td></td>
                  <td className="text-center font-mono font-black text-indigo-900 bg-indigo-100/60">
                    {memberSeats.reduce((s, m) => s + (m.billableSeats || 0), 0)} billable
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-indigo-900 text-sm">
                    {formatINR(dynamicSeatRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Direct OpEx Adjustment Modal */}
      {isUpdatingOpex && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900">Adjust Direct Centre OpEx</h3>
            <p className="text-xs text-gray-500 mt-1">
              Update direct operational cost lines to recalculate contribution margin (Formula F-23).
            </p>

            <form onSubmit={handleUpdateOpex} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Staff &amp; Centre Management Payroll (₹)</label>
                <input
                  type="number"
                  value={opexForm.staffPayroll}
                  onChange={(e) => setOpexForm({ ...opexForm, staffPayroll: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Power &amp; Utilities Consumption (₹)</label>
                <input
                  type="number"
                  value={opexForm.utilitiesPower}
                  onChange={(e) => setOpexForm({ ...opexForm, utilitiesPower: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Janitorial &amp; Housekeeping Supplies (₹)</label>
                <input
                  type="number"
                  value={opexForm.housekeepingSupplies}
                  onChange={(e) => setOpexForm({ ...opexForm, housekeepingSupplies: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">High-Speed Leased Line Internet &amp; SaaS (₹)</label>
                <input
                  type="number"
                  value={opexForm.highSpeedInternet}
                  onChange={(e) => setOpexForm({ ...opexForm, highSpeedInternet: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">
                  Total Monthly OpEx: {formatINR(totalOpex)}
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
                  Save &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Seat Count Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Bulk Upload Seat Counts (CSV)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Paste comma-separated rows: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">MemberName, OccupiedSeats</code>
            </p>

            <div className="mt-4">
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Brightpath Technologies, 82&#10;Nimbus Labs, 55&#10;Hot Desk Flex Pool, 30"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Matches by member legal/trade name
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleParseCsv}
                  disabled={!csvText.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Apply Counts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Landlord Remittance Modal */}
      {isRemitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Record Landlord Disbursal (Head Lease)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mark October head lease rent and CAM payment disbursed to <span className="font-bold text-gray-800">{activeCentre?.landlordName}</span>.
            </p>

            <div className="mt-4 p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Net Rent Disbursal (Post TDS):</span>
                <span className="font-bold text-gray-900">{formatINR(headLeaseRent * 0.90)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Landlord CAM (with GST):</span>
                <span className="font-bold text-gray-900">{formatINR(headLeaseCam * 1.18)}</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-1 font-black text-purple-900">
                <span>Total Disbursed:</span>
                <span>{formatINR((headLeaseRent * 0.90) + (headLeaseCam * 1.18))}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Corporate Bank Remittance UTR #</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC20261005981240"
                  value={remitUtr}
                  onChange={(e) => setRemitUtr(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRemitModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordRemittance}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Confirm Disbursal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

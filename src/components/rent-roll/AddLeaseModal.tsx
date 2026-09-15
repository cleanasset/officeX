"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Building,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  DollarSign,
  Shield,
  Sparkles
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface AddLeaseModalProps {
  properties: Array<{ id: string; name: string; city: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLeaseModal: React.FC<AddLeaseModalProps> = ({
  properties,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || "PROP-001");
  const [tenantName, setTenantName] = useState("");
  const [unitNumber, setUnitNumber] = useState("Suite 101");
  const [floorNumber, setFloorNumber] = useState(1);
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2031-09-30");
  const [chargeableArea, setChargeableArea] = useState<number>(15000);
  const [monthlyRent, setMonthlyRent] = useState<number>(3000000);
  const [camRatePsf, setCamRatePsf] = useState<number>(20);
  const [utilityFixedMonthly, setUtilityFixedMonthly] = useState<number>(100000);
  const [escalationPct, setEscalationPct] = useState<number>(5);
  const [escalationFrequencyMonths, setEscalationFrequencyMonths] = useState<number>(24);
  const [securityDepositMonths, setSecurityDepositMonths] = useState<number>(6);
  const [lockInMonths, setLockInMonths] = useState<number>(36);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(90);
  const [brokerName, setBrokerName] = useState("Direct / Institutional");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Real-time calculations
  const baseRentPsf = chargeableArea > 0 ? Math.round((monthlyRent / chargeableArea) * 100) / 100 : 0;
  const camMonthly = Math.round(chargeableArea * camRatePsf);
  const subtotal = monthlyRent + camMonthly + utilityFixedMonthly;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalMonthlyGross = subtotal + gstAmount;
  const annualGross = totalMonthlyGross * 12;
  const securityDepositRequired = monthlyRent * securityDepositMonths;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          tenantName,
          unitNumber,
          floorNumber,
          startDate,
          endDate,
          chargeableArea,
          carpetArea: Math.round(chargeableArea * 0.85),
          monthlyRent,
          camRatePsf,
          utilityFixedMonthly,
          escalationPct,
          escalationFrequencyMonths,
          securityDepositMonths,
          securityDepositPaid: securityDepositRequired,
          lockInMonths,
          noticePeriodDays,
          brokerName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create lease");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Onboard New Commercial Lease</h3>
              <p className="text-xs text-slate-400">Institutional 39-column lease terms with live calculation preview</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-medium text-slate-300">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Property & Tenant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Target Property *</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Tenant Trade Name *</label>
              <input
                type="text"
                placeholder="e.g. Amazon India Logistics"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Unit / Space Number</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Floor Number</label>
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Area & Commercials */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Chargeable Area (Sq Ft) *</label>
              <input
                type="number"
                value={chargeableArea}
                onChange={(e) => setChargeableArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Monthly Base Rent (₹) *</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono font-bold text-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Base Rent PSF (Auto)</label>
              <div className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 font-mono font-bold">
                ₹{baseRentPsf} PSF
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">CAM Rate PSF (₹/mo)</label>
              <input
                type="number"
                value={camRatePsf}
                onChange={(e) => setCamRatePsf(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Utilities Monthly (₹)</label>
              <input
                type="number"
                value={utilityFixedMonthly}
                onChange={(e) => setUtilityFixedMonthly(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">CAM Monthly (Auto)</label>
              <div className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 font-mono font-bold">
                {formatINR(camMonthly)}
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Escalations */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Commencement Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Expiry Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Escalation %</label>
              <input
                type="number"
                value={escalationPct}
                onChange={(e) => setEscalationPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Escalation Frequency (Mos)</label>
              <input
                type="number"
                value={escalationFrequencyMonths}
                onChange={(e) => setEscalationFrequencyMonths(parseInt(e.target.value) || 12)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 4: Live Financial Summary Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Live Contractual Calculation Preview
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Total Monthly Gross:</span>
                <p className="font-bold text-amber-300 font-mono">{formatINR(totalMonthlyGross)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Annual Gross Rent:</span>
                <p className="font-bold text-white font-mono">{formatINR(annualGross)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Deposit Required ({securityDepositMonths}m):</span>
                <p className="font-bold text-emerald-400 font-mono">{formatINR(securityDepositRequired)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Lock-In Tenure:</span>
                <p className="font-semibold text-slate-300">{lockInMonths} Months</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Save & Activate Lease"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
          propertyId: properties.find(p => p.id === propertyId)?.id || (propertyId.startsWith("PROP-") ? propertyId : `PROP-${Date.now()}`),
          propertyName: properties.find(p => p.id === propertyId)?.name || propertyId,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-[#0F8B7D] rounded-xl border border-teal-100">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Onboard New Commercial Lease</h3>
              <p className="text-xs text-gray-500 font-medium">Institutional 39-column lease terms with live calculation preview</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-medium text-gray-700">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Property & Tenant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Target Property *</label>
              {properties.length > 0 ? (
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs cursor-pointer font-medium"
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter property name (e.g. Apex Horizon Tower)"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Tenant Trade Name *</label>
              <input
                type="text"
                placeholder="e.g. Amazon India Logistics"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Unit / Space Number</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Floor Number</label>
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Section 2: Area & Commercials */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Chargeable Area (Sq Ft) *</label>
              <input
                type="number"
                value={chargeableArea}
                onChange={(e) => setChargeableArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono font-bold shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Monthly Base Rent (₹) *</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-[#0F8B7D] rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono font-black shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Base Rent PSF (Auto)</label>
              <div className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 font-mono font-bold">
                ₹{baseRentPsf} PSF
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">CAM Rate PSF (₹/mo)</label>
              <input
                type="number"
                value={camRatePsf}
                onChange={(e) => setCamRatePsf(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Utilities Monthly (₹)</label>
              <input
                type="number"
                value={utilityFixedMonthly}
                onChange={(e) => setUtilityFixedMonthly(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">CAM Monthly (Auto)</label>
              <div className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 font-mono font-bold">
                {formatINR(camMonthly)}
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Escalations */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Commencement Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Expiry Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Escalation %</label>
              <input
                type="number"
                value={escalationPct}
                onChange={(e) => setEscalationPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Escalation Frequency (Mos)</label>
              <input
                type="number"
                value={escalationFrequencyMonths}
                onChange={(e) => setEscalationFrequencyMonths(parseInt(e.target.value) || 12)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              />
            </div>
          </div>

          {/* Section 4: Live Financial Summary Box */}
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              Live Contractual Calculation Preview
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold">Total Monthly Gross:</span>
                <p className="font-black text-amber-900 font-mono">{formatINR(totalMonthlyGross)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold">Annual Gross Rent:</span>
                <p className="font-bold text-gray-900 font-mono">{formatINR(annualGross)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold">Deposit ({securityDepositMonths}m):</span>
                <p className="font-bold text-[#0F8B7D] font-mono">{formatINR(securityDepositRequired)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold">Lock-In Tenure:</span>
                <p className="font-semibold text-gray-800">{lockInMonths} Months</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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

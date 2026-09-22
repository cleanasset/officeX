"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Building2,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  DollarSign,
  Shield,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface AddLeaseModalProps {
  properties: Array<{ id: string; name: string; city: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAddProperty?: () => void;
}

export const AddLeaseModal: React.FC<AddLeaseModalProps> = ({
  properties,
  isOpen,
  onClose,
  onSuccess,
  onOpenAddProperty,
}) => {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(properties[0]?.id || "");
  const [tenantName, setTenantName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState<number | "">("");
  
  const todayStr = new Date().toISOString().split("T")[0];
  const next3YearsStr = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(next3YearsStr);
  const [chargeableArea, setChargeableArea] = useState<number | "">("");
  const [monthlyRent, setMonthlyRent] = useState<number | "">("");
  const [camRatePsf, setCamRatePsf] = useState<number | "">("");
  const [utilityFixedMonthly, setUtilityFixedMonthly] = useState<number | "">("");
  const [escalationPct, setEscalationPct] = useState<number>(5);
  const [escalationFrequencyMonths, setEscalationFrequencyMonths] = useState<number>(24);
  const [securityDepositMonths, setSecurityDepositMonths] = useState<number>(6);
  const [lockInMonths, setLockInMonths] = useState<number>(36);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(90);
  const [brokerName, setBrokerName] = useState("Direct");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync propertyId when properties list updates
  useEffect(() => {
    if (properties.length > 0 && (!propertyId || !properties.some(p => p.id === propertyId))) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  if (!isOpen) return null;

  // Real-time calculations
  const numArea = typeof chargeableArea === "number" ? chargeableArea : 0;
  const numRent = typeof monthlyRent === "number" ? monthlyRent : 0;
  const numCam = typeof camRatePsf === "number" ? camRatePsf : 0;
  const numUtil = typeof utilityFixedMonthly === "number" ? utilityFixedMonthly : 0;

  const baseRentPsf = numArea > 0 ? Math.round((numRent / numArea) * 100) / 100 : 0;
  const camMonthly = Math.round(numArea * numCam);
  const subtotal = numRent + camMonthly + numUtil;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalMonthlyGross = subtotal + gstAmount;
  const annualGross = totalMonthlyGross * 12;
  const securityDepositRequired = numRent * securityDepositMonths;

  const handleNavigateToAddProperty = () => {
    onClose();
    if (onOpenAddProperty) {
      onOpenAddProperty();
    } else {
      router.push("/properties/add");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (properties.length === 0) {
      setErrorMsg("Please register at least one commercial property before adding a lease.");
      return;
    }
    if (!propertyId) {
      setErrorMsg("Please select a target property.");
      return;
    }
    if (!tenantName.trim()) {
      setErrorMsg("Please enter the tenant trade name.");
      return;
    }
    if (!numArea || numArea <= 0) {
      setErrorMsg("Chargeable Area must be greater than 0 sq ft.");
      return;
    }
    if (!numRent || numRent <= 0) {
      setErrorMsg("Monthly Base Rent must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const selectedProp = properties.find(p => p.id === propertyId);
      const res = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProp?.id || propertyId,
          propertyName: selectedProp?.name || propertyId,
          tenantName: tenantName.trim(),
          unitNumber: unitNumber ? String(unitNumber).trim() : "Unit 1",
          floorNumber: typeof floorNumber === "number" ? floorNumber : 1,
          startDate,
          endDate,
          chargeableArea: numArea,
          carpetArea: Math.round(numArea * 0.85),
          monthlyRent: numRent,
          camRatePsf: numCam,
          utilityFixedMonthly: numUtil,
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

  // ──── ZERO PROPERTIES STATE: FORCE USER TO REGISTER PROPERTY FIRST ────
  if (properties.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
          <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-950">Property Required First</h3>
                <p className="text-xs text-teal-700 font-semibold">Step 1 of 2 in Commercial Onboarding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer border border-teal-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h4 className="text-base font-extrabold text-gray-900">No Commercial Properties Found</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Before onboarding commercial leases and allocating tenant units, you must first register your commercial property asset (building, business park, or IT tower).
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Onboarding Roadmap</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/80">
                <div className="bg-white p-2 rounded-lg border border-teal-200 shadow-2xs">
                  <span className="font-extrabold text-teal-700 block">Step 1 (Now)</span>
                  <span className="text-slate-600 font-medium">Register Property Asset</span>
                </div>
                <div className="bg-white/60 p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-400 block">Step 2</span>
                  <span className="text-slate-500 font-medium">Onboard Leases &amp; Rent Roll</span>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNavigateToAddProperty}
                className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>+ Register Property Asset</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── ACTIVE LEASE ONBOARDING MODAL (WHEN PROPERTIES EXIST) ────
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
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Property & Tenant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-bold">Target Property *</label>
                <button
                  type="button"
                  onClick={handleNavigateToAddProperty}
                  className="text-[11px] text-teal-600 hover:text-teal-800 font-bold hover:underline"
                >
                  + Add New Property
                </button>
              </div>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs cursor-pointer font-medium"
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city || "Commercial"})
                  </option>
                ))}
              </select>
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
                placeholder="e.g. Suite 402, Wing-A"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Floor Number</label>
              <input
                type="number"
                placeholder="e.g. 4"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value ? parseInt(e.target.value) : "")}
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
                placeholder="e.g. 10000"
                value={chargeableArea}
                onChange={(e) => setChargeableArea(e.target.value ? parseFloat(e.target.value) : "")}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono font-bold shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Monthly Base Rent (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 1500000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value ? parseFloat(e.target.value) : "")}
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
                placeholder="e.g. 20"
                value={camRatePsf}
                onChange={(e) => setCamRatePsf(e.target.value ? parseFloat(e.target.value) : "")}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Utilities Monthly (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={utilityFixedMonthly}
                onChange={(e) => setUtilityFixedMonthly(e.target.value ? parseFloat(e.target.value) : "")}
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

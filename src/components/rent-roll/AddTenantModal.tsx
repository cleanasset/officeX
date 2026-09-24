"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties?: Array<{ id: string; name: string; city?: string }>;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  properties = []
}) => {
  const [availableProps, setAvailableProps] = useState<Array<{ id: string; name: string; city?: string }>>(properties);
  const [selectedPropId, setSelectedPropId] = useState<string>("");

  // Tenant Identity
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Lease & Financial Terms
  const [unitNumber, setUnitNumber] = useState("Suite 401");
  const [floorNumber, setFloorNumber] = useState<number>(4);
  const [chargeableArea, setChargeableArea] = useState<number>(5000);
  const [monthlyRent, setMonthlyRent] = useState<number>(350000);
  const [camRatePsf, setCamRatePsf] = useState<number>(15);
  const [escalationPct, setEscalationPct] = useState<number>(5);
  const [securityDepositMonths, setSecurityDepositMonths] = useState<number>(3);
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2028-03-31");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load properties on mount if not provided
  useEffect(() => {
    if (properties.length > 0) {
      setAvailableProps(properties);
      if (!selectedPropId) setSelectedPropId(properties[0].id);
      return;
    }

    // Try localStorage user properties first
    let localProps: any[] = [];
    try {
      localProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
    } catch {}

    if (localProps.length > 0) {
      setAvailableProps(localProps);
      setSelectedPropId(localProps[0].id);
      return;
    }

    // Fetch from API
    fetch("/api/rent-roll/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data.properties && data.properties.length > 0) {
          setAvailableProps(data.properties);
          setSelectedPropId(data.properties[0].id);
        }
      })
      .catch((err) => console.warn("Could not load properties:", err));
  }, [properties]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) {
      setErrorMsg("Tenant trade / company name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const prop = availableProps.find((p) => p.id === selectedPropId) || availableProps[0];
    const effectivePropId = prop?.id || "PROP-DEFAULT";
    const effectivePropName = prop?.name || "Commercial Building 1";

    const newLeaseId = `LEASE-${Date.now()}`;
    const generatedInviteCode = `OX-${Math.floor(1000 + Math.random() * 9000)}`;
    const computedCamMonthly = Math.round(Number(chargeableArea) * Number(camRatePsf));
    const computedDeposit = Math.round(Number(monthlyRent) * Number(securityDepositMonths));

    try {
      // 1. Create or sync Tenant legal entity record
      await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeName: tradeName.trim(),
          legalName: legalName.trim() || tradeName.trim(),
          industry,
          gstin: gstin.trim().toUpperCase(),
          pan: pan.trim().toUpperCase(),
          contactPerson: contactPerson.trim(),
          contactEmail: contactEmail.trim().toLowerCase(),
          contactPhone: contactPhone.trim(),
          billingAddress: `${effectivePropName}, ${unitNumber}`,
          billingCity: prop?.city || "Mumbai",
          billingState: "Maharashtra",
          billingPincode: "400001",
          creditLimit: computedDeposit * 2,
          paymentTermsDays: 15
        })
      }).catch((e) => console.warn("Tenant entity sync note:", e));

      // 2. Create Active Lease with commercial terms in Rent Roll database
      const leaseRes = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: effectivePropId,
          propertyName: effectivePropName,
          tenantName: tradeName.trim(),
          unitNumber,
          floorNumber: Number(floorNumber),
          chargeableArea: Number(chargeableArea),
          carpetArea: Math.round(Number(chargeableArea) * 0.8),
          monthlyRent: Number(monthlyRent),
          camRatePsf: Number(camRatePsf),
          camMonthly: computedCamMonthly,
          securityDepositAmount: computedDeposit,
          securityDepositPaid: computedDeposit,
          startDate,
          endDate,
          escalationPct: Number(escalationPct),
          escalationFrequencyMonths: 12,
          lockInMonths: 12,
          noticePeriodDays: 60,
          billingFrequency: "monthly",
          billingDueDay: 5
        })
      });

      if (!leaseRes.ok) {
        const errorData = await leaseRes.json();
        throw new Error(errorData.error || "Failed to create lease in database.");
      }

      // 3. Save to localStorage.officex_active_leases for instant real-time synchronization
      if (typeof window !== "undefined") {
        let existingLeases: any[] = [];
        try {
          existingLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
        } catch {}

        const newLeaseEntry = {
          id: newLeaseId,
          tenantName: tradeName.trim(),
          propertyName: effectivePropName,
          propertyId: effectivePropId,
          unitNumber,
          floorNumber: Number(floorNumber),
          chargeableArea: Number(chargeableArea),
          monthlyRent: Number(monthlyRent),
          camRate: Number(camRatePsf),
          monthlyCam: computedCamMonthly,
          totalMonthlyGross: Number(monthlyRent) + computedCamMonthly,
          escalationPct: Number(escalationPct),
          leaseStartDate: startDate,
          leaseEndDate: endDate,
          securityDeposit: computedDeposit,
          status: "active",
          inviteCode: generatedInviteCode
        };

        const updated = [newLeaseEntry, ...existingLeases];
        localStorage.setItem("officex_active_leases", JSON.stringify(updated));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error onboarding tenant:", err);
      setErrorMsg(err.message || "An error occurred while saving the tenant and lease.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slideUp text-slate-900">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Add Tenant &amp; Active Lease</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard tenant entity, demised premises, and monthly rent roll terms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="m-6 mb-0 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs font-medium text-slate-700">
          {/* Target Commercial Building */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select Commercial Property *
            </label>
            <div className="relative">
              <Building size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                {availableProps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.city ? `(${p.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1: Tenant Identity */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3.5">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} className="text-[#0D7B6C]" />
              <span>1. Tenant Corporate Identity</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Tenant Brand / Trade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Labs Pvt Ltd"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. BFSI / Cloud / FinTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Mehta"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  placeholder="billing@acmetech.in"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  WhatsApp Mobile (Invoices)
                </label>
                <input
                  type="text"
                  placeholder="+91 98200 12345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="27AABCT1234D1Z2"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  PAN (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="AABCT1234D"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Space Allocation & Financial Terms */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3.5">
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-700" />
              <span>2. Demised Space Allocation &amp; Monthly Rent Roll Terms</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Unit / Suite # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suite 401"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Floor #
                </label>
                <input
                  type="number"
                  min={0}
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Leased Area (Sq.Ft) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={chargeableArea}
                  onChange={(e) => setChargeableArea(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Annual Escalation %
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={escalationPct}
                  onChange={(e) => setEscalationPct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Monthly Base Rent (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  ≈ ₹{chargeableArea > 0 ? (monthlyRent / chargeableArea).toFixed(1) : "0"} / Sq.Ft.
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  CAM Rate (₹ / Sq.Ft.)
                </label>
                <input
                  type="number"
                  min={0}
                  value={camRatePsf}
                  onChange={(e) => setCamRatePsf(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Monthly CAM: ₹{(chargeableArea * camRatePsf).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Security Deposit (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={securityDepositMonths}
                  onChange={(e) => setSecurityDepositMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Deposit: ₹{(monthlyRent * securityDepositMonths).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Lease End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0D7B6C]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Onboarding Tenant &amp; Adding to Rent Roll...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Tenant &amp; Activate Lease</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

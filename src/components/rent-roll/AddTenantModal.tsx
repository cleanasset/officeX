"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Building,
  Building2,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  PieChart,
  FileText
} from "lucide-react";
import Link from "next/link";
import { CountryPhoneInput } from "@/components/ui/CountryPhoneInput";
import { StateCitySelector } from "@/components/ui/LocationInputs";

export interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties?: Array<{
    id: string;
    name: string;
    city?: string;
    totalArea?: number;
    occupiedArea?: number;
    vacantArea?: number;
    spaces?: any[];
    units?: any[];
    [key: string]: any;
  }>;
  defaultPropertyId?: string;
  onSwitchToContractWizard?: (data: {
    propertyId: string;
    tenant: any;
    space: any;
    commercials: any;
  }) => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  properties = [],
  defaultPropertyId,
  onSwitchToContractWizard,
}) => {
  const [availableProps, setAvailableProps] = useState<any[]>(properties);
  const [selectedPropId, setSelectedPropId] = useState<string>(defaultPropertyId || "");

  // Tenant Corporate Identity
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("Technology / IT");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [billingState, setBillingState] = useState("Maharashtra");
  const [billingCity, setBillingCity] = useState("Mumbai");

  // Demised Space Allocation & Leasable Area
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("custom");
  const [unitNumber, setUnitNumber] = useState("Suite 101");
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [chargeableArea, setChargeableArea] = useState<number>(1000);
  const [baseRentPsf, setBaseRentPsf] = useState<number>(70);
  const [monthlyRent, setMonthlyRent] = useState<number>(70000);
  const [camRatePsf, setCamRatePsf] = useState<number>(15);
  const [escalationPct, setEscalationPct] = useState<number>(5);
  const [securityDepositMonths, setSecurityDepositMonths] = useState<number>(3);

  // Modern realistic horizon dates
  const todayStr = new Date().toISOString().split("T")[0];
  const threeYearsLaterStr = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(threeYearsLaterStr);
  const [rentAgreementFileName, setRentAgreementFileName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load properties on mount if not provided or sync with props
  useEffect(() => {
    if (properties.length > 0) {
      setAvailableProps(properties);
      if (!selectedPropId) {
        setSelectedPropId(defaultPropertyId || properties[0].id);
      }
      return;
    }

    // Try localStorage user properties first
    let localProps: any[] = [];
    try {
      localProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
    } catch {}

    if (localProps.length > 0) {
      setAvailableProps(localProps);
      if (!selectedPropId) {
        setSelectedPropId(defaultPropertyId || localProps[0].id);
      }
      return;
    }

    // Fetch from API
    fetch("/api/rent-roll/properties")
      .then((res) => res.json())
      .then((data) => {
        const propList = Array.isArray(data) ? data : (data.properties || []);
        if (propList.length > 0) {
          setAvailableProps(propList);
          if (!selectedPropId) {
            setSelectedPropId(defaultPropertyId || propList[0].id);
          }
        }
      })
      .catch((err) => console.warn("Could not load properties:", err));
  }, [properties, defaultPropertyId]);

  // Sync selectedPropId when defaultPropertyId changes
  useEffect(() => {
    if (defaultPropertyId) {
      setSelectedPropId(defaultPropertyId);
    }
  }, [defaultPropertyId]);

  // Current selected property metrics
  const selectedProp = availableProps.find((p) => p.id === selectedPropId) || availableProps[0];
  const totalArea = Number(selectedProp?.totalArea) || 0;
  const occupiedArea = Number(selectedProp?.occupiedArea) || 0;
  const vacantArea =
    selectedProp?.vacantArea !== undefined
      ? Number(selectedProp.vacantArea)
      : Math.max(0, totalArea - occupiedArea);
  const occupancyPct =
    totalArea > 0 ? Math.min(100, Math.round((occupiedArea / totalArea) * 100)) : 0;

  // Extract registered spaces/units for the selected property
  const registeredSpaces: Array<{
    id: string;
    unitNumber: string;
    floorNumber: number;
    chargeableArea: number;
    status: string;
    ratePsf?: number;
  }> = Array.isArray(selectedProp?.spaces) && selectedProp.spaces.length > 0
    ? selectedProp.spaces
    : Array.isArray(selectedProp?.units) && selectedProp.units.length > 0
    ? selectedProp.units.map((u: any, idx: number) => ({
        id: u.id || `u-${idx}`,
        unitNumber: u.unitNumber || u.name || `Unit ${idx + 1}`,
        floorNumber: Number(u.floor || 1),
        chargeableArea: Number(u.area || u.chargeableArea || 0),
        status: u.status || "vacant",
        ratePsf: Number(u.ratePsf || 70)
      }))
    : [];

  const vacantSpaces = registeredSpaces.filter(
    (s) => s.status === "vacant" || s.status === "available"
  );
  const occupiedSpaces = registeredSpaces.filter(
    (s) => s.status === "occupied" || s.status === "leased"
  );

  // Auto-tune default leasable area when selected property changes
  useEffect(() => {
    if (!selectedProp) return;
    const propTotal = Number(selectedProp.totalArea) || 0;
    const propOcc = Number(selectedProp.occupiedArea) || 0;
    const propVac =
      selectedProp.vacantArea !== undefined
        ? Number(selectedProp.vacantArea)
        : Math.max(0, propTotal - propOcc);

    if (propTotal > 0 && propVac > 0) {
      // If current area exceeds remaining vacant or was default, cap to sensible vacant portion
      if (chargeableArea > propVac || chargeableArea === 5000) {
        const sensibleArea = Math.min(propVac, propVac > 1000 ? 1000 : propVac);
        setChargeableArea(sensibleArea);
        setMonthlyRent(Math.round(sensibleArea * baseRentPsf));
      }
    } else if (propTotal > 0 && propVac <= 0) {
      setChargeableArea(0);
      setMonthlyRent(0);
    }
  }, [selectedPropId, selectedProp?.vacantArea, selectedProp?.totalArea]);

  // Handle Space Picker Selection
  const handleSpaceSelect = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    if (spaceId === "custom") {
      setUnitNumber(`Suite ${Math.floor(100 + Math.random() * 900)}`);
      return;
    }
    const matched = registeredSpaces.find((s) => s.id === spaceId);
    if (matched) {
      setUnitNumber(matched.unitNumber);
      setFloorNumber(matched.floorNumber || 1);
      const allocatedArea = Math.min(matched.chargeableArea, vacantArea || matched.chargeableArea);
      setChargeableArea(allocatedArea);
      const rate = matched.ratePsf || baseRentPsf || 70;
      setBaseRentPsf(rate);
      setMonthlyRent(Math.round(allocatedArea * rate));
    }
  };

  // Synchronized Area / Rent Calculations
  const handleAreaChange = (val: number) => {
    const area = Math.max(0, val);
    setChargeableArea(area);
    if (baseRentPsf > 0) {
      setMonthlyRent(Math.round(area * baseRentPsf));
    }
  };

  const handleBaseRentPsfChange = (val: number) => {
    const psf = Math.max(0, val);
    setBaseRentPsf(psf);
    if (chargeableArea > 0) {
      setMonthlyRent(Math.round(chargeableArea * psf));
    }
  };

  const handleMonthlyRentChange = (val: number) => {
    const rent = Math.max(0, val);
    setMonthlyRent(rent);
    if (chargeableArea > 0) {
      setBaseRentPsf(Number((rent / chargeableArea).toFixed(1)));
    }
  };

  if (!isOpen) return null;

  // Strict Invariant Checks as per OFFICEX Rent Roll Spec (§4.1, Table 4.1)
  const isOverAllocated = totalArea > 0 && chargeableArea > vacantArea;
  const isFullyOccupied = totalArea > 0 && vacantArea <= 0;
  const hasAreaError = isOverAllocated || isFullyOccupied || chargeableArea <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) {
      setErrorMsg("Tenant trade / brand name is required.");
      return;
    }

    if (hasAreaError) {
      if (isFullyOccupied) {
        setErrorMsg("This property is 100% occupied. No vacant capacity is available.");
      } else if (isOverAllocated) {
        setErrorMsg(
          `Over-allocation error: Leased area (${chargeableArea.toLocaleString()} sq.ft) exceeds available vacant capacity (${vacantArea.toLocaleString()} sq.ft).`
        );
      } else {
        setErrorMsg("Please specify a valid leasable area greater than 0.");
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const prop = selectedProp || availableProps[0];
    const effectivePropId = prop?.id || "PROP-DEFAULT";
    const effectivePropName = prop?.name || "Commercial Building 1";

    const newLeaseId = `LEASE-${Date.now()}`;
    const generatedInviteCode = `OX-${Math.floor(1000 + Math.random() * 9000)}`;
    const computedCamMonthly = Math.round(Number(chargeableArea) * Number(camRatePsf));
    const computedDeposit = Math.round(Number(monthlyRent) * Number(securityDepositMonths));

    try {
      // 1. Create or sync Tenant corporate legal entity record
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
          billingCity: billingCity.trim() || prop?.city || "Mumbai",
          billingState: billingState.trim() || prop?.state || "Maharashtra",
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
          spaceId: selectedSpaceId !== "custom" ? selectedSpaceId : `SPC-${newLeaseId}`,
          tenantName: tradeName.trim(),
          unitNumber,
          floorNumber: Number(floorNumber),
          chargeableArea: Number(chargeableArea),
          carpetArea: Math.round(Number(chargeableArea) * 0.8),
          monthlyRent: Number(monthlyRent),
          baseRentPsf: Number(baseRentPsf),
          camRatePsf: Number(camRatePsf),
          camMonthly: computedCamMonthly,
          securityDepositAmount: computedDeposit,
          securityDepositPaid: computedDeposit,
          securityDepositMonths: Number(securityDepositMonths),
          startDate,
          endDate,
          rentAgreementFileName: rentAgreementFileName || undefined,
          agreementDocumentName: rentAgreementFileName || undefined,
          agreementStatus: "executed",
          documents: rentAgreementFileName ? [{
            id: `doc-${Date.now()}`,
            contractId: "",
            documentType: "agreement",
            title: `Executed Lease Agreement`,
            versionNumber: 1,
            fileUrl: "/sample-lease-agreement.pdf",
            fileName: rentAgreementFileName,
            status: "executed",
            isExecuted: true,
            createdAt: new Date().toISOString(),
            name: rentAgreementFileName,
            type: "Lease Agreement",
            uploadedAt: new Date().toISOString()
          }] : [],
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
          baseRentPsf: Number(baseRentPsf),
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
                Onboard tenant entity, allocate vacant demised premises, and activate lease terms
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

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="m-6 mb-0 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body or Property-First Guard */}
        {availableProps.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4">
              <Building2 size={32} />
            </div>
            <h4 className="text-base font-black text-slate-900">Add a Commercial Property First</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
              In commercial real estate, every corporate tenant must be allocated to an existing registered property and vacant unit. Your portfolio currently has no registered properties.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/properties/add"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Register Commercial Property</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs font-medium text-slate-700">
            {/* Quick Switch Banner: Connect both forms without double entry */}
            {onSwitchToContractWizard && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 px-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold text-teal-950">Prefer the full 7-step Contract Wizard?</span>
                    <span className="text-teal-700 ml-1 block sm:inline text-[11px]">Transfer these details directly without re-typing.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToContractWizard({
                      propertyId: selectedPropId,
                      tenant: { tradeName, legalName, industry, gstin, pan, contactPerson, contactEmail, contactPhone, billingState, billingCity },
                      space: { id: selectedSpaceId, unitNumber, floorNumber, chargeableArea, baseRentPsf, camRatePsf },
                      commercials: { baseRentPsf, camRatePsf, chargeableArea, startDate, endDate, securityDepositMonths, escalationPct }
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Open in Contract Wizard →</span>
                </button>
              </div>
            )}

            {/* Target Commercial Building & Live Vacancy Capacity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Target Commercial Property *
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Hierarchy: Property → Space → Tenant → Contract
                </span>
              </div>

              <div className="relative">
                <Building size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                >
                  {availableProps.map((p) => {
                    const pTot = Number(p.totalArea) || 0;
                    const pOcc = Number(p.occupiedArea) || 0;
                    const pVac = p.vacantArea !== undefined ? Number(p.vacantArea) : Math.max(0, pTot - pOcc);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.city ? `(${p.city})` : ""} — {pVac.toLocaleString()} sq.ft vacant / {pTot.toLocaleString()} sq.ft total
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Real-time Vacant Capacity Badge & Progress Indicator */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-teal-50/30 to-emerald-50/40 border border-slate-200">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Total Leasable</span>
                    <span className="text-xs font-black text-slate-800">
                      {totalArea > 0 ? `${totalArea.toLocaleString()} Sq.Ft` : "Flexible / Uncapped"}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Currently Occupied</span>
                    <span className="text-xs font-black text-slate-700">
                      {occupiedArea.toLocaleString()} Sq.Ft ({occupancyPct}%)
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border shadow-2xs ${
                    vacantArea > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}>
                    <span className="text-[9px] font-bold uppercase block opacity-80">Available Vacant</span>
                    <span className="text-xs font-black">
                      {vacantArea.toLocaleString()} Sq.Ft
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                {totalArea > 0 && (
                  <div className="mt-2.5 space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className="h-full bg-[#0D7B6C] transition-all"
                        style={{ width: `${occupancyPct}%` }}
                        title={`Occupied: ${occupiedArea.toLocaleString()} sq.ft`}
                      />
                      <div
                        className="h-full bg-emerald-400/70 transition-all"
                        style={{ width: `${100 - occupancyPct}%` }}
                        title={`Vacant: ${vacantArea.toLocaleString()} sq.ft`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-semibold px-0.5">
                      <span>Occupied: {occupancyPct}%</span>
                      <span>Vacant: {100 - occupancyPct}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 1: Tenant Corporate Identity */}
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
                    placeholder="e.g. Acme Technologies Pvt Ltd"
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
                  <CountryPhoneInput
                    label="WhatsApp Mobile (Invoices)"
                    value={contactPhone}
                    onChange={(val) => setContactPhone(val)}
                    placeholder="98200 12345"
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
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => {
                      const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                      setGstin(cleaned);
                      if (cleaned.length >= 12 && !pan) {
                        setPan(cleaned.substring(2, 12));
                      }
                    }}
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
                    placeholder="e.g. ABCDE1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
              </div>

              {/* Billing State First, Then Billing City Scoped to that State */}
              <div className="pt-1">
                <StateCitySelector
                  stateLabel="Billing State (GST) *"
                  cityLabel="Billing City *"
                  stateValue={billingState}
                  cityValue={billingCity}
                  onStateChange={(st) => setBillingState(st)}
                  onCityChange={(ct) => setBillingCity(ct)}
                />
              </div>
            </div>

            {/* Section 2: Demised Space Allocation & Commercial Terms */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-700" />
                  <span>2. Demised Space Allocation &amp; Monthly Rent Roll Terms</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Vacancy-Enforced
                </span>
              </div>

              {/* Space Unit Selector Dropdown (Filtering out Occupied spaces) */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">
                  Select Registered Space / Unit
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    value={selectedSpaceId}
                    onChange={(e) => handleSpaceSelect(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="custom">
                      + Custom Demised Unit (Allocate from {vacantArea.toLocaleString()} sq.ft vacant)
                    </option>

                    {/* Vacant spaces: active & selectable */}
                    {vacantSpaces.length > 0 && (
                      <optgroup label="✅ Available Vacant Spaces">
                        {vacantSpaces.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.unitNumber} — Floor {s.floorNumber || 1} — {s.chargeableArea.toLocaleString()} Sq.Ft (VACANT)
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* Occupied spaces: strictly disabled */}
                    {occupiedSpaces.length > 0 && (
                      <optgroup label="⛔ Already Occupied Units (Unavailable)">
                        {occupiedSpaces.map((s) => (
                          <option key={s.id} value={s.id} disabled className="text-slate-400">
                            {s.unitNumber} — Floor {s.floorNumber || 1} — {s.chargeableArea.toLocaleString()} Sq.Ft (OCCUPIED)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Over-Allocation Error Notification */}
              {isOverAllocated && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block">Space Over-Allocation Error (§4.1 Invariant Violated)</span>
                    <span>
                      Entered area ({chargeableArea.toLocaleString()} sq.ft) exceeds available vacant capacity ({vacantArea.toLocaleString()} sq.ft) in {selectedProp?.name}. Commercial leases cannot exceed remaining vacant leasable inventory.
                    </span>
                  </div>
                </div>
              )}

              {/* 100% Occupied Notification */}
              {isFullyOccupied && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block">Property 100% Occupied</span>
                    <span>
                      All {totalArea.toLocaleString()} sq.ft are currently committed to active leases. No vacant space is available for new tenants.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Unit / Suite # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Suite 101"
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">
                      Leased Area *
                    </label>
                    {vacantArea > 0 && (
                      <span className="text-[8px] font-bold text-emerald-700">
                        Max: {vacantArea.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={vacantArea > 0 ? vacantArea : undefined}
                    value={chargeableArea || ""}
                    onChange={(e) => handleAreaChange(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      isOverAllocated
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900"
                        : "border-slate-300 focus:ring-emerald-500"
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Sq.Ft (Chargeable)</span>
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
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Yearly increase</span>
                </div>
              </div>

              {/* Financial Terms & Calculated Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">
                      Base Rent PSF (₹ / Sq.Ft)
                    </label>
                    <span className="text-[8px] font-bold text-slate-400">PSF</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={baseRentPsf}
                    onChange={(e) => handleBaseRentPsfChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Total: ₹{monthlyRent.toLocaleString("en-IN")} / mo
                  </span>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Monthly Base Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={monthlyRent}
                    onChange={(e) => handleMonthlyRentChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    ≈ ₹{chargeableArea > 0 ? (monthlyRent / chargeableArea).toFixed(1) : "0"} / Sq.Ft
                  </span>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    CAM Rate (₹ / Sq.Ft)
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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

              {/* Rent Agreement Document Upload */}
              <div className="pt-2">
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                  Rent Agreement / Executed Lease Deed (PDF, Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 text-teal-800 text-xs font-semibold cursor-pointer transition-colors">
                    <FileText size={14} className="text-[#0F8B7D]" />
                    <span className="truncate">{rentAgreementFileName || "Upload Rent Agreement (PDF)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRentAgreementFileName(file.name);
                        }
                      }}
                    />
                  </label>
                  {rentAgreementFileName && (
                    <button
                      type="button"
                      onClick={() => setRentAgreementFileName("")}
                      className="px-2 py-1 text-xs text-rose-500 hover:text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-50 cursor-pointer"
                      title="Remove agreement"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                {isOverAllocated ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <ShieldAlert size={14} /> Allocation exceeds available vacant capacity
                  </span>
                ) : (
                  <span>
                    Gross Billing: <strong className="text-slate-800">₹{(monthlyRent + chargeableArea * camRatePsf).toLocaleString("en-IN")}/mo</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasAreaError}
                  className="px-5 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0D7B6C]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Onboarding Tenant &amp; Activating Lease...</span>
                    </>
                  ) : hasAreaError ? (
                    <>
                      <ShieldAlert size={15} />
                      <span>Cannot Exceed Vacant Capacity</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Save Tenant &amp; Activate Lease</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

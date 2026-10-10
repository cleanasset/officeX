"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Upload,
  ChevronDown,
  Building,
  Image as ImageIcon,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";
import GoogleAddressAutocomplete, {
  AddressAutofillResult,
} from "@/components/common/GoogleAddressAutocomplete";
import {
  INDIAN_STATES_CITIES,
  ALL_INDIAN_STATES,
  COMMERCIAL_ASSET_TYPES,
  LEGAL_OWNERSHIP_STRUCTURES,
  getOwnershipStructureRule,
  matchCanonicalIndianState,
  matchCanonicalIndianCity,
} from "@/lib/india-locations";

export interface OnboardingCompleteData {
  role: string;
  companyName: string;
  brandName: string;
  logoUrl?: string;
  propertyName: string;
  propertyCode?: string;
  propertyType: string;
  areaSqft: number;
  floorsCount?: number;
  wingsCount?: number;
  state: string;
  city: string;
  microMarket?: string;
  address?: string;
  pincode?: string;
  spvName?: string;
  ownershipStructure?: string;
  panNumber?: string;
  cinNumber?: string;
  gstin?: string;
  reraNumber?: string;
  hasDelegatedManager?: boolean;
  managerType?: string;
  managerName?: string;
  managerEmail?: string;
}

interface RentRollOnboardingWizardProps {
  onComplete: (data: OnboardingCompleteData) => void;
  onSkip?: () => void;
}

// Clean, simple roles without brackets and without redundant word "Commercial"
export const CANONICAL_ROLES = [
  {
    id: "owner",
    title: "Property Owner / Landlord",
    badge: "Principal",
    desc: "Asset owner, investor, or fund sponsor with consolidated portfolio oversight.",
  },
  {
    id: "property_manager",
    title: "Property Manager",
    badge: "Operations",
    desc: "Day-to-day building leasing, tenant onboarding, step escalations, and contract administration.",
  },
  {
    id: "facility_manager",
    title: "Facility Manager",
    badge: "Engineering",
    desc: "On-site operations, utility sub-meters, common area maintenance (CAM), and vendor SLAs.",
  },
  {
    id: "leasing_manager",
    title: "Leasing Manager / Broker",
    badge: "Marketing",
    desc: "Vacant space listings, broker channel partnerships, tenant pipeline, and visual stacking plans.",
  },
  {
    id: "finance_manager",
    title: "CA / Financial Controller",
    badge: "Controllership",
    desc: "Lease-to-Cash billing batch runs, GST & TDS Section 194I ledgers, and bank reconciliation.",
  },
];

export const DELEGATED_ENTITY_TYPES = [
  { id: "pm_agency", title: "Property Management Company / Agency" },
  { id: "ca_firm", title: "Chartered Accountant (CA) / Finance Firm" },
  { id: "fm_operator", title: "Facility Management Partner" },
  { id: "leasing_agency", title: "Leasing Brokerage Firm" },
  { id: "individual_pm", title: "Individual Property Manager" },
];

export default function RentRollOnboardingWizard({
  onComplete,
  onSkip,
}: RentRollOnboardingWizardProps) {
  // Role State (Clean Dropdown)
  const [selectedRole, setSelectedRole] = useState("owner");

  // Organization & Brand Identity
  const [companyName, setCompanyName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Managing Entity Delegation (For Owner Only)
  const [hasDelegatedManager, setHasDelegatedManager] = useState(false);
  const [managerType, setManagerType] = useState("pm_agency");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");

  // Comprehensive Property Registry Fields
  const [propertyName, setPropertyName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyType, setPropertyType] = useState("office");
  const [areaSqft, setAreaSqft] = useState<number>(50000);
  const [floorsCount, setFloorsCount] = useState<number>(12);
  const [wingsCount, setWingsCount] = useState<number>(1);

  // Geographic State & City Dropdowns
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [availableCities, setAvailableCities] = useState<string[]>(INDIAN_STATES_CITIES["Karnataka"] || []);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [microMarket, setMicroMarket] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Ownership Structure / Legal Entity Type (§S-11)
  const [ownershipStructure, setOwnershipStructure] = useState("pvt_ltd");
  const currentStructureRule = getOwnershipStructureRule(ownershipStructure);

  const handleOwnershipStructureChange = (newStructureId: string) => {
    setOwnershipStructure(newStructureId);
    const rule = getOwnershipStructureRule(newStructureId);
    if (!rule.cinApplicable) {
      setCinNumber("");
    }
  };

  // Statutory Tax & Corporate Identifiers
  const [spvName, setSpvName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [reraNumber, setReraNumber] = useState("");

  const [subscribedCapacity, setSubscribedCapacity] = useState<number>(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = Number(localStorage.getItem("officex_subscribed_sqft"));
      if (stored && stored > 0) setSubscribedCapacity(stored);
      const storedLogo = localStorage.getItem("officex_brand_logo");
      if (storedLogo) setLogoPreview(storedLogo);
    }
  }, []);

  // Update cities whenever state changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const cities = INDIAN_STATES_CITIES[stateName] || [];
    setAvailableCities(cities);
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
    } else {
      setSelectedCity("");
    }
  };

  // Google Maps address autofill callback
  const handleAddressSelect = (result: AddressAutofillResult) => {
    setAddress(result.streetAddress || result.fullAddress);
    if (result.pincode) setPincode(result.pincode);
    if (result.microMarket) setMicroMarket(result.microMarket);

    const matchedState = matchCanonicalIndianState(result.state) || result.state;
    if (matchedState) {
      setSelectedState(matchedState);
      const cities = INDIAN_STATES_CITIES[matchedState] || [];
      if (result.city) {
        const matchedCity = matchCanonicalIndianCity(matchedState, result.city) || result.city;
        if (!cities.includes(matchedCity)) {
          setAvailableCities([matchedCity, ...cities]);
        } else {
          setAvailableCities(cities);
        }
        setSelectedCity(matchedCity);
      } else if (cities.length > 0) {
        setAvailableCities(cities);
        setSelectedCity(cities[0]);
      }
    }
  };

  // Logo file upload handler (converts to Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_brand_logo", base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("officex_brand_logo");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const effectiveCompany = companyName.trim() || "Apex Commercial Holdings Pvt Ltd";
    const effectiveBrand = brandName.trim() || effectiveCompany;
    const effectiveProp = propertyName.trim() || `${effectiveBrand} Tower 1`;
    const effectiveSpv = spvName.trim() || `${effectiveCompany} SPV`;

    onComplete({
      role: selectedRole,
      companyName: effectiveCompany,
      brandName: effectiveBrand,
      logoUrl: logoPreview || undefined,
      propertyName: effectiveProp,
      propertyCode: propertyCode.trim() || undefined,
      propertyType,
      areaSqft: areaSqft || 50000,
      floorsCount: floorsCount || 1,
      wingsCount: wingsCount || 1,
      state: selectedState,
      city: selectedCity,
      microMarket: microMarket.trim() || undefined,
      address: address.trim() || undefined,
      pincode: pincode.trim() || undefined,
      spvName: effectiveSpv,
      ownershipStructure,
      panNumber: panNumber.trim().toUpperCase() || undefined,
      cinNumber: cinNumber.trim().toUpperCase() || undefined,
      gstin: gstin.trim().toUpperCase() || undefined,
      reraNumber: reraNumber.trim().toUpperCase() || undefined,
      hasDelegatedManager,
      managerType: hasDelegatedManager ? managerType : undefined,
      managerName: hasDelegatedManager ? managerName.trim() : undefined,
      managerEmail: hasDelegatedManager ? managerEmail.trim().toLowerCase() : undefined,
    });
  };

  const selectedRoleObj = CANONICAL_ROLES.find((r) => r.id === selectedRole) || CANONICAL_ROLES[0];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 text-left">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D7B6C] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              <span>Workspace Setup &amp; Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome to OfficeX
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Configure your organization identity, roles, and asset master registry.
            </p>
          </div>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-800 self-start sm:self-auto cursor-pointer underline"
            >
              Skip setup &rarr;
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ──── SECTION 1: ROLE (CLEAN DROPDOWN, NO BRACKETS, NO "COMMERCIAL") ──── */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Your Role</span>
              </label>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-[#0D7B6C] border border-teal-200">
                {selectedRoleObj.badge}
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:border-[#0D7B6C] focus:ring-1 focus:ring-[#0D7B6C] outline-none appearance-none cursor-pointer"
              >
                {CANONICAL_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {selectedRoleObj.desc}
            </p>
          </div>

          {/* ──── SECTION 2: COMPANY & BRAND IDENTITY WITH LOGO UPLOAD ──── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Company &amp; Brand Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Company Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Estates Projects Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Brand / Trade Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prestige Business Parks"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              {/* Brand Logo File Upload with Instant Preview */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Brand Logo (Displayed on Invoices, Agreements &amp; Dashboard)
                </label>

                {logoPreview ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-teal-50/60 border border-teal-200">
                    <div className="w-14 h-14 rounded-xl border border-teal-300 bg-white p-1 flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
                      <img src={logoPreview} alt="Brand Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">Logo Uploaded Successfully</span>
                      <span className="text-[10px] text-teal-700 font-medium block">
                        Will appear on all client invoices, PDF leases, and dashboard headers.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <X size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#0D7B6C] rounded-2xl p-4 flex items-center justify-center gap-3 bg-slate-50/60 hover:bg-teal-50/20 transition cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <Upload size={18} className="text-[#0D7B6C]" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-800 block">Click to upload company logo</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, SVG or WebP up to 5 MB</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ──── SECTION 3: CONDITIONAL MANAGER DELEGATION ──── */}
          {selectedRole === "owner" && (
            <div className="pt-4 border-t border-slate-200">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDelegatedManager}
                    onChange={(e) => setHasDelegatedManager(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D7B6C] focus:ring-[#0D7B6C] border-slate-300 cursor-pointer mt-0.5 sm:mt-0"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      I want someone else to manage my property portfolio
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Managing partner onboarding will complete immediately, their operations dashboard will be activated, and you can assign your property directly to them.
                    </span>
                  </div>
                </label>

                {hasDelegatedManager && (
                  <div className="pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Managing Entity Type
                      </label>
                      <select
                        value={managerType}
                        onChange={(e) => setManagerType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {DELEGATED_ENTITY_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Entity / Contact Name *
                      </label>
                      <input
                        type="text"
                        required={hasDelegatedManager}
                        placeholder="e.g. Apex Property Management LLP"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required={hasDelegatedManager}
                        placeholder="manager@apexpm.in"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──── SECTION 4: COMPLETE PROPERTY REGISTRY DETAILS (§S-11) ──── */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#0D7B6C] text-white flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                First Property Registry Details
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Provide comprehensive building, statutory tax, and geographic specifications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Basic Building Info */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Property / Tower Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Heights Business Park"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Property Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CHBP-T1"
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                />
              </div>

              {/* Comprehensive Asset Type Selector */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Property Asset Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                >
                  {COMMERCIAL_ASSET_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Leasable Area (Sq.Ft) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Number of Floors</label>
                <input
                  type="number"
                  min="1"
                  value={floorsCount}
                  onChange={(e) => setFloorsCount(Number(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Wings / Towers</label>
                <input
                  type="number"
                  min="1"
                  value={wingsCount}
                  onChange={(e) => setWingsCount(Number(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              {/* Google Maps Search & Worldwide Address Autofill */}
              <div className="sm:col-span-3">
                <GoogleAddressAutocomplete
                  value={address}
                  onChange={(val) => setAddress(val)}
                  onAddressSelect={handleAddressSelect}
                  label="Property Address"
                  placeholder="Search building name, landmark, tech park, or street address..."
                  hint="Type any building or street name. Selecting an address autofills City, State, and Pincode."
                />
              </div>

              {/* Geographic Dropdowns: State & Dependent City */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State / Union Territory *</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                >
                  {(selectedState && !ALL_INDIAN_STATES.includes(selectedState)
                    ? [selectedState, ...ALL_INDIAN_STATES]
                    : ALL_INDIAN_STATES
                  ).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                >
                  {(selectedCity && !availableCities.includes(selectedCity)
                    ? [selectedCity, ...availableCities]
                    : availableCities
                  ).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Postal Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 560066"
                  maxLength={10}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">Micro-Market / Area Name</label>
                <input
                  type="text"
                  placeholder="e.g. Whitefield / BKC / Cyber City / Airport Corridor"
                  value={microMarket}
                  onChange={(e) => setMicroMarket(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              {/* Ownership / Legal Entity Structure Selection (§S-11) */}
              <div className="sm:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black text-slate-900 block">
                      Property Ownership / Legal Entity Structure *
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select your entity type. Compulsory compliance fields (PAN, CIN, GSTIN) adjust automatically below.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-100 text-[#0D7B6C] border border-teal-200 shrink-0 self-start sm:self-auto">
                    {currentStructureRule.shortLabel}
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={ownershipStructure}
                    onChange={(e) => handleOwnershipStructureChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                  >
                    {LEGAL_OWNERSHIP_STRUCTURES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Landlord / SPV Entity Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Landlord / Entity Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    ownershipStructure === "sole_proprietorship"
                      ? "e.g. Ramesh Kumar (Proprietor)"
                      : "e.g. Cyber Estates SPV Pvt Ltd"
                  }
                  value={spvName}
                  onChange={(e) => setSpvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                />
              </div>

              {/* PAN Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    PAN Number *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Compulsory *
                  </span>
                </div>
                <input
                  type="text"
                  required={currentStructureRule.panRequired}
                  placeholder={currentStructureRule.panPlaceholder}
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                />
              </div>

              {/* Corporate Identity Number (CIN / LLPIN / Registration) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {currentStructureRule.cinLabel}
                  </label>
                  {!currentStructureRule.cinApplicable ? (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      Not Applicable
                    </span>
                  ) : currentStructureRule.cinRequired ? (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      Compulsory *
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={!currentStructureRule.cinApplicable}
                  required={currentStructureRule.cinRequired}
                  placeholder={currentStructureRule.cinPlaceholder}
                  maxLength={21}
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                {!currentStructureRule.cinApplicable && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    CIN is only issued by MCA for incorporated Companies/LLPs.
                  </p>
                )}
              </div>

              {/* GSTIN Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    GSTIN Number {currentStructureRule.gstinRequired ? "*" : ""}
                  </label>
                  {currentStructureRule.gstinRequired ? (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      Compulsory *
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      Optional (&lt; ₹20L)
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required={currentStructureRule.gstinRequired}
                  placeholder="29AAAAA0000A1Z5"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {currentStructureRule.gstinNote}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">RERA Project Number (Optional)</label>
                <input
                  type="text"
                  placeholder="PRM/KA/RERA/1251/..."
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Next: Complete full profile &amp; tenant registry in the setup center.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>Continue to Complete Profile</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Layers,
  Users,
  Receipt,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import {
  INDIAN_STATES_CITIES,
  ALL_INDIAN_STATES,
  COMMERCIAL_ASSET_TYPES,
} from "@/lib/india-locations";

export interface SPVData {
  id: string;
  legalName: string;
  entityType: string;
  gstin: string;
  pan: string;
  state: string;
  city: string;
  address: string;
  taxProfile: "gst_18" | "exempt_0" | "sez_0" | "composition_1";
}

export interface OnboardingCompleteData {
  businessModel: string;
  companyName: string;
  brandName: string;
  logoUrl?: string;
  role: string;
  spvs: SPVData[];
  chargeTypes: string[];
  propertyName: string;
  propertyCode: string;
  propertyType: string;
  areaSqft: number;
  floorsCount: number;
  unitsPerFloor: number;
  askingRatePerSqft: number;
  state: string;
  city: string;
  address: string;
  hasDelegatedManager?: boolean;
  managerType?: string;
  managerName?: string;
  managerEmail?: string;
  managerUserRole?: "property_manager" | "org_admin";
  startingStrategy: "rent_roll" | "create_lease" | "import_excel";
}

interface RentRollOnboardingWizardProps {
  onComplete: (data: OnboardingCompleteData) => void;
  onSkip?: () => void;
  initialRole?: string;
}

// 5 Commercial Customer Segments (§2.1 & §4.4)
export const BUSINESS_SEGMENTS = [
  {
    id: "owner",
    code: "Segment A",
    title: "Commercial Property Owner / Landlord",
    badge: "Principal Asset Owner",
    desc: "Single or multi-asset owner, investment fund, or REIT managing owned commercial real estate.",
    defaultCharges: ["base_rent", "cam", "grid_power", "dg_backup", "parking", "security_deposit"],
  },
  {
    id: "property_manager",
    code: "Segment B",
    title: "Property Management Company (PMC)",
    badge: "Multi-Client Operator",
    desc: "Professional agency administering leases, rent collection, and escalations across multiple client owner portfolios.",
    defaultCharges: ["base_rent", "cam", "parking", "late_fee", "security_deposit"],
  },
  {
    id: "facility_manager",
    code: "Segment C",
    title: "Facility Management Company (FMC)",
    badge: "Operations & CAM Pools",
    desc: "Focuses on common area maintenance recoveries, utility sub-metering, and technical vendor SLAs.",
    defaultCharges: ["cam", "grid_power", "dg_backup", "water", "hvac_extended"],
  },
  {
    id: "managed_service_provider",
    code: "Segment D",
    title: "Managed Service Provider (MSP)",
    badge: "Turnkey Commercial Ops",
    desc: "End-to-end lease administration, fitout amortizations, facility upkeep, and owner monthly remittance ledgers.",
    defaultCharges: ["base_rent", "cam", "fitout_recovery", "parking", "grid_power", "security_deposit"],
  },
  {
    id: "flex_operator",
    code: "Segment E",
    title: "Flex Workspace / Co-working Operator",
    badge: "Seat & Cabin Billing",
    desc: "Operates dedicated desks, private cabins, enterprise managed offices, and head lease liabilities.",
    defaultCharges: ["base_rent", "cam", "parking", "grid_power", "security_deposit"],
  },
];

export const DELEGATED_ENTITY_TYPES = [
  { id: "pm_company", title: "PM Company (Property Management Company)" },
  { id: "fm_company", title: "FM Company (Facilities Management Company)" },
  { id: "msp", title: "MSP (Managed Service Provider)" },
  { id: "user_pm_or_admin", title: "Another User with role: Property Manager or Org Admin" },
];

export function getDelegatedEntityLabel(type?: string, userRole?: string): string {
  if (!type || type === "pm_company" || type === "pm_agency") return "PM Company (Property Management Company)";
  if (type === "fm_company" || type === "fm_operator") return "FM Company (Facilities Management Company)";
  if (type === "msp") return "MSP (Managed Service Provider)";
  if (type === "user_pm_or_admin" || type === "individual_pm" || type === "another_user") {
    if (userRole === "org_admin") return "Another User (Role: Org Admin)";
    if (userRole === "property_manager") return "Another User (Role: Property Manager)";
    return "Another User with role: Property Manager or Org Admin";
  }
  return "PM Company (Property Management Company)";
}

// 11 Canonical Charge Types (§4.8)
export const CANONICAL_CHARGE_TYPES = [
  {
    id: "base_rent",
    name: "Base Rent",
    code: "SAC 997212",
    category: "Base Revenue",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Contractual fixed or area-based commercial rent payable in advance.",
    required: true,
  },
  {
    id: "cam",
    name: "Common Area Maintenance (CAM)",
    code: "SAC 997221",
    category: "Recovery",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Building security, housekeeping, lift maintenance, and common lighting upkeep.",
    required: false,
  },
  {
    id: "grid_power",
    name: "Electricity Grid Power",
    code: "Utility",
    category: "Utility Pass-through",
    taxRate: "0% GST (Exempt)",
    isTaxable: false,
    desc: "Government power discom meter consumption pass-through without markup.",
    required: false,
  },
  {
    id: "dg_backup",
    name: "DG Power Backup",
    code: "Utility Recovery",
    category: "Utility",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Diesel generator emergency power units or fixed kVA backup allowance.",
    required: false,
  },
  {
    id: "water",
    name: "Water Supply Charges",
    code: "Utility",
    category: "Utility",
    taxRate: "0% GST (Exempt)",
    isTaxable: false,
    desc: "Municipal and tanker water supply metered consumption.",
    required: false,
  },
  {
    id: "parking",
    name: "Reserved Parking Bay",
    code: "SAC 9967",
    category: "Service Charge",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Dedicated 4-wheeler and 2-wheeler basement parking slot allocations.",
    required: false,
  },
  {
    id: "hvac_extended",
    name: "After-Hours HVAC Cooling",
    code: "SAC 9954",
    category: "Service Charge",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Hourly chilled water air conditioning outside standard commercial tower hours.",
    required: false,
  },
  {
    id: "fitout_recovery",
    name: "Fitout Capex Amortization",
    code: "Recovery",
    category: "Capex Amortization",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Monthly recovery of interior fitout capital funded by the landlord.",
    required: false,
  },
  {
    id: "security_deposit",
    name: "Security Deposit (Refundable)",
    code: "Deposit",
    category: "Balance Sheet",
    taxRate: "0% (Non-taxable)",
    isTaxable: false,
    desc: "Interest-free refundable security deposit held in trust during the lease term.",
    required: false,
  },
  {
    id: "late_fee",
    name: "Late Payment Interest",
    code: "SAC 9997",
    category: "Penalty / Interest",
    taxRate: "18% GST",
    isTaxable: true,
    desc: "Standard 18% p.a. default interest on overdue rental invoices.",
    required: false,
  },
  {
    id: "property_tax",
    name: "Property Tax Reimbursement",
    code: "Statutory",
    category: "Statutory Recovery",
    taxRate: "0% GST",
    isTaxable: false,
    desc: "Pro-rata municipal tax reimbursement charged to tenants.",
    required: false,
  },
];

export const CANONICAL_ROLES = [
  {
    id: "owner",
    title: "Property Owner / Landlord",
    badge: "Principal",
    desc: "Asset owner or fund manager with high-level financial reporting, approvals, and portfolio ROI metrics.",
  },
  {
    id: "property_manager",
    title: "Property Manager / Centre Head",
    badge: "Operations",
    desc: "Hands-on lease administration, vacancy management, contract drafting, and tenant onboarding.",
  },
  {
    id: "finance_manager",
    title: "CA / Financial Controller",
    badge: "Controllership",
    desc: "Lease-to-Cash monthly billing batch runs, GST Tax Invoices, Section 194-I TDS ledgers, and bank reconciliations.",
  },
  {
    id: "facility_manager",
    title: "Facility Manager / Site Ops Lead",
    badge: "Engineering",
    desc: "On-site utility meters, CAM cost pool budgeting, and space readiness.",
  },
];

export default function RentRollOnboardingWizard({
  onComplete,
  onSkip,
  initialRole,
}: RentRollOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [businessModel, setBusinessModel] = useState("owner");
  const [companyName, setCompanyName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [userRole, setUserRole] = useState(initialRole || "owner");

  // Step 2: SPVs / Billing Entities
  const [spvs, setSpvs] = useState<SPVData[]>([
    {
      id: "spv-1",
      legalName: "",
      entityType: "owner",
      gstin: "",
      pan: "",
      state: "Karnataka",
      city: "Bengaluru",
      address: "",
      taxProfile: "gst_18",
    },
  ]);

  // Step 3: Selected Charges
  const [selectedCharges, setSelectedCharges] = useState<string[]>([
    "base_rent",
    "cam",
    "grid_power",
    "dg_backup",
    "parking",
    "security_deposit",
  ]);

  // Step 4: Physical Space Hierarchy
  const [propertyName, setPropertyName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyType, setPropertyType] = useState("office");
  const [areaSqft, setAreaSqft] = useState<number>(40000);
  const [floorsCount, setFloorsCount] = useState<number>(4);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(4);
  const [askingRatePerSqft, setAskingRatePerSqft] = useState<number>(125);
  const [propertyState, setPropertyState] = useState("Karnataka");
  const [propertyCity, setPropertyCity] = useState("Bengaluru");
  const [propertyAddress, setPropertyAddress] = useState("");

  // Step 5: Team & Delegation
  const [hasDelegatedManager, setHasDelegatedManager] = useState(false);
  const [managerType, setManagerType] = useState("pm_company");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerUserRole, setManagerUserRole] = useState<"property_manager" | "org_admin">("property_manager");

  // Step 6: Starting Strategy
  const [startingStrategy, setStartingStrategy] = useState<"rent_roll" | "create_lease" | "import_excel">("rent_roll");

  // Auto-generate code when property name changes
  useEffect(() => {
    if (propertyName && !propertyCode) {
      const generated = propertyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      setPropertyCode(`${generated || "PROP"}-01`);
    }
  }, [propertyName, propertyCode]);

  // Auto-populate SPV legal name from company name if empty
  useEffect(() => {
    if (companyName && spvs.length === 1 && !spvs[0].legalName) {
      setSpvs((prev) => [{ ...prev[0], legalName: `${companyName} LLP` }]);
    }
  }, [companyName, spvs]);

  // Handle adding an additional SPV
  const handleAddSpv = () => {
    setSpvs((prev) => [
      ...prev,
      {
        id: `spv-${Date.now()}`,
        legalName: "",
        entityType: "owner",
        gstin: "",
        pan: "",
        state: propertyState,
        city: propertyCity,
        address: "",
        taxProfile: "gst_18",
      },
    ]);
  };

  const handleRemoveSpv = (id: string) => {
    if (spvs.length <= 1) return;
    setSpvs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSpv = (id: string, field: keyof SPVData, val: any) => {
    setSpvs((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: val };
        // Auto-extract PAN from GSTIN if 15 chars provided
        if (field === "gstin" && typeof val === "string" && val.length === 15) {
          const panCandidate = val.slice(2, 12).toUpperCase();
          if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCandidate)) {
            updated.pan = panCandidate;
          }
        }
        return updated;
      })
    );
  };

  // Toggle charge type selection
  const handleToggleCharge = (id: string) => {
    if (id === "base_rent") return; // mandatory
    setSelectedCharges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your Organization / Entity legal name.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < spvs.length; i++) {
        const s = spvs[i];
        if (!s.legalName.trim()) {
          setErrorMessage(`SPV #${i + 1} requires a Legal Entity Name.`);
          return false;
        }
        if (s.gstin && s.gstin.trim().length !== 15) {
          setErrorMessage(`GSTIN for "${s.legalName}" must be exactly 15 characters (e.g. 29AABCS1429B1Z1).`);
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      if (!selectedCharges.includes("base_rent")) {
        setErrorMessage("Base Rent is required as the core revenue charge.");
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!propertyName.trim()) {
        setErrorMessage("Please enter your Property Name (e.g. Apex Business Tower).");
        return false;
      }
      if (!areaSqft || areaSqft < 1000) {
        setErrorMessage("Please provide a valid Leasable Area (minimum 1,000 sq ft).");
        return false;
      }
      if (floorsCount < 1 || unitsPerFloor < 1) {
        setErrorMessage("Floors and Units per Floor must each be at least 1.");
        return false;
      }
      return true;
    }
    if (step === 5) {
      if (hasDelegatedManager) {
        if (!managerName.trim()) {
          setErrorMessage("Please provide the Delegated Manager or Firm Name.");
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const data: OnboardingCompleteData = {
      businessModel,
      companyName: companyName.trim(),
      brandName: (brandName || companyName).trim(),
      role: userRole,
      spvs,
      chargeTypes: selectedCharges,
      propertyName: propertyName.trim(),
      propertyCode: (propertyCode || "PROP-01").trim(),
      propertyType,
      areaSqft,
      floorsCount,
      unitsPerFloor,
      askingRatePerSqft,
      state: propertyState,
      city: propertyCity,
      address: propertyAddress.trim() || `${propertyCity}, ${propertyState}`,
      hasDelegatedManager,
      managerType: hasDelegatedManager ? managerType : undefined,
      managerName: hasDelegatedManager ? managerName.trim() : undefined,
      managerEmail: hasDelegatedManager ? managerEmail.trim() : undefined,
      managerUserRole: hasDelegatedManager ? managerUserRole : undefined,
      startingStrategy,
    };

    try {
      await onComplete(data);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to finalize onboarding. Please check connection.");
      setIsSubmitting(false);
    }
  };

  // Calculations for Space Generator Preview
  const totalUnits = floorsCount * unitsPerFloor;
  const areaPerUnit = totalUnits > 0 ? Math.round(areaSqft / totalUnits) : 0;
  const carpetPerUnit = Math.round(areaPerUnit * 0.72);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      {/* Wizard Header */}
      <div className="bg-slate-900 text-white px-8 py-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-md text-white">
              OX
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                OFFICEX Commercial Onboarding Suite
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  Lease-to-Cash
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Setup your legal entities, tax profiles, charges, and physical space hierarchy in 6 steps
              </p>
            </div>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-white transition underline"
            >
              Skip Setup & Explore
            </button>
          )}
        </div>

        {/* Progress Bar & Steps Tabs */}
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-2 text-xs">
            {[
              { num: 1, label: "Business Model" },
              { num: 2, label: "SPVs & Tax" },
              { num: 3, label: "Charge Types" },
              { num: 4, label: "Physical Spaces" },
              { num: 5, label: "Team & Roles" },
              { num: 6, label: "Go-Live Strategy" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    if (isPast) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col border-t-2 pt-2 transition-all ${
                    isActive
                      ? "border-blue-500 text-white font-semibold"
                      : isPast
                      ? "border-emerald-500 text-emerald-400 cursor-pointer"
                      : "border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider flex items-center gap-1">
                    {isPast && <Check className="w-3 h-3 text-emerald-400" />}
                    Step {step.num}
                  </span>
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-8 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Body */}
      <div className="p-8 min-h-[480px]">
        {/* STEP 1: BUSINESS MODEL / CUSTOMER SEGMENT */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Select Your Commercial Business Model</h2>
              <p className="text-xs text-slate-500 mt-1">
                OFFICEX configures default workflows and templates based on your operational segment (§2.1, §4.4).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BUSINESS_SEGMENTS.map((seg) => {
                const isSelected = businessModel === seg.id;
                return (
                  <div
                    key={seg.id}
                    onClick={() => {
                      setBusinessModel(seg.id);
                      setSelectedCharges(seg.defaultCharges);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {seg.code}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{seg.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{seg.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-medium text-blue-700">{seg.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Legal Entity / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Real Estate Holdings Pvt Ltd"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Commercial Brand / Portfolio Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apex Business Parks"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BILLING ENTITIES & TAX PROFILES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Billing Entities & Tax Profiles</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure legal SPVs that issue GST Tax Invoices. Tax rates are driven by configuration (§4.8).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
                Add Another SPV
              </button>
            </div>

            <div className="space-y-4">
              {spvs.map((spv, index) => (
                <div
                  key={spv.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Billing Entity / SPV #{index + 1}
                    </span>
                    {spvs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpv(spv.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove SPV
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Legal SPV Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={spv.legalName}
                        onChange={(e) => handleUpdateSpv(spv.id, "legalName", e.target.value)}
                        placeholder="e.g. Apex Tech Park Phase-1 LLP"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Tax Profile
                      </label>
                      <select
                        value={spv.taxProfile}
                        onChange={(e) => handleUpdateSpv(spv.id, "taxProfile", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="gst_18">Standard Commercial GST (18%)</option>
                        <option value="exempt_0">Exempt / Nil Rated (0%)</option>
                        <option value="sez_0">SEZ / IFSC Zero-Rated (0%)</option>
                        <option value="composition_1">Composition Scheme (1%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        GSTIN (15 characters)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={spv.gstin}
                        onChange={(e) => handleUpdateSpv(spv.id, "gstin", e.target.value.toUpperCase())}
                        placeholder="29AABCS1429B1Z1"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        PAN (10 characters)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={spv.pan}
                        onChange={(e) => handleUpdateSpv(spv.id, "pan", e.target.value.toUpperCase())}
                        placeholder="AABCS1429B"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        State
                      </label>
                      <select
                        value={spv.state}
                        onChange={(e) => handleUpdateSpv(spv.id, "state", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CANONICAL CHARGE TYPES */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Canonical Charge Types (§4.8)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the billable line items active for your portfolio. Rent Roll will track and invoice each item according to its SAC code and GST rate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CANONICAL_CHARGE_TYPES.map((charge) => {
                const isSelected = selectedCharges.includes(charge.id);
                return (
                  <div
                    key={charge.id}
                    onClick={() => handleToggleCharge(charge.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/30 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {charge.code}
                        </span>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{charge.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{charge.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{charge.category}</span>
                      <span className={`font-bold ${charge.isTaxable ? "text-blue-700" : "text-slate-500"}`}>
                        {charge.taxRate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PHYSICAL SPACE HIERARCHY */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Physical Space Hierarchy Generator</h2>
              <p className="text-xs text-slate-500 mt-1">
                Define your building and floors. Real physical space units will be generated in PostgreSQL for immediate leasing (§4.5).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Property Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Apex Business Tower"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Property Code
                </label>
                <input
                  type="text"
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value.toUpperCase())}
                  placeholder="APX-BKC"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Asset Classification
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="office">Commercial Office</option>
                  <option value="flex_workspace">Flex / Co-working Centre</option>
                  <option value="retail">Retail Mall / High Street</option>
                  <option value="mixed">Mixed-Use Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Leasable Area (sq ft) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={areaSqft || ""}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  placeholder="40000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Number of Floors
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={floorsCount || ""}
                  onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Suites / Units Per Floor
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={unitsPerFloor || ""}
                  onChange={(e) => setUnitsPerFloor(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Asking Rate (₹ / sq ft / month)
                </label>
                <input
                  type="number"
                  value={askingRatePerSqft || ""}
                  onChange={(e) => setAskingRatePerSqft(Number(e.target.value))}
                  placeholder="125"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={propertyCity}
                  onChange={(e) => setPropertyCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  State
                </label>
                <select
                  value={propertyState}
                  onChange={(e) => setPropertyState(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Generator Preview Box */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Live Physical Space Generator Preview
                </span>
                <span className="text-xs font-bold text-blue-700">
                  {totalUnits} Units Total ({areaPerUnit.toLocaleString("en-IN")} sq ft / unit)
                </span>
              </div>
              <p className="text-xs text-blue-800">
                The wizard will auto-generate {totalUnits} physical spaces across {floorsCount} floors with ~{carpetPerUnit.toLocaleString("en-IN")} sq ft carpet area and asking rate of ₹{askingRatePerSqft}/sqft.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.from({ length: Math.min(8, totalUnits) }).map((_, i) => {
                  const f = Math.floor(i / unitsPerFloor) + 1;
                  const u = (i % unitsPerFloor) + 1;
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-blue-200 text-[11px] font-mono text-blue-900 font-semibold"
                    >
                      {propertyCode || "PROP"}-F0{f}-U0{u} ({areaPerUnit.toLocaleString("en-IN")} sqft)
                    </span>
                  );
                })}
                {totalUnits > 8 && (
                  <span className="px-2.5 py-1 rounded bg-blue-100 text-[11px] text-blue-800 font-semibold">
                    +{totalUnits - 8} more units
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: TEAM & ROLES */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 5: Team Configuration & Delegation (§5.14)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your primary administrative role and declare property management delegation if applicable.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Your Primary User Role in OFFICEX
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CANONICAL_ROLES.map((r) => {
                  const isSelected = userRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setUserRole(r.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{r.title}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{r.desc}</p>
                      </div>
                      <div className="mt-2 text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                        {r.badge}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Delegate to Property Management Company?</h4>
                  <p className="text-xs text-slate-500">
                    If an external PM firm or agency manages day-to-day operations and lease deeds on your behalf.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hasDelegatedManager}
                  onChange={(e) => setHasDelegatedManager(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
              </div>

              {hasDelegatedManager && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Manager / Agency Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="e.g. Cushman & Wakefield / JLL"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Manager Email Address
                    </label>
                    <input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="centremanager@pmagency.com"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: GO-LIVE STRATEGY */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 6: Go-Live & Strategy Selection</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your workspace structure is configured. Choose how you would like to begin working in Rent Roll:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "rent_roll" as const,
                  title: "Clean Live Rent Roll",
                  desc: "Open active Rent Roll with generated vacant spaces ready for leasing and occupancy updates.",
                  icon: Layers,
                  badge: "Recommended",
                },
                {
                  id: "create_lease" as const,
                  title: "Execute First Lease (S-21)",
                  desc: "Immediately launch the 7-step Contract Wizard to create your first executed commercial lease deed.",
                  icon: FileText,
                  badge: "Step-by-Step",
                },
                {
                  id: "import_excel" as const,
                  title: "Import Existing Excel (S-30)",
                  desc: "Upload your current landlord spreadsheet using our smart column mapper and synonym dictionary.",
                  icon: FileSpreadsheet,
                  badge: "Bulk Migration",
                },
              ].map((opt) => {
                const isSelected = startingStrategy === opt.id;
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setStartingStrategy(opt.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-md ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                          {opt.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-700">Select Path</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Confirmation Summary */}
            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-400">
                Workspace Configuration Summary
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">Organization:</span>
                  <span className="font-semibold text-white">{companyName || "Commercial Holdings"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Property & Units:</span>
                  <span className="font-semibold text-white">
                    {propertyName || "Tower A"} ({totalUnits} units, {areaSqft.toLocaleString("en-IN")} sqft)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">SPVs & Tax:</span>
                  <span className="font-semibold text-white">
                    {spvs.length} Entity ({spvs[0]?.taxProfile === "gst_18" ? "18% GST" : "Exempt"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Charge Types:</span>
                  <span className="font-semibold text-white">{selectedCharges.length} canonical charges</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1 || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Initializing Workspace...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Launch Workspace & Open Rent Roll
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

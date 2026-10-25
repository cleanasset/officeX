"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
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
  Sparkles,
  HelpCircle,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  ALL_INDIAN_STATES,
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
  buildingGrade?: string;
  areaSqft: number;
  carpetAreaSqft?: number;
  floorsCount: number;
  unitsPerFloor: number;
  askingRatePerSqft: number;
  state: string;
  city: string;
  microMarket?: string;
  pincode?: string;
  address: string;
  buildingName?: string;
  fitoutCondition?: string;
  hasDelegatedManager?: boolean;
  managerType?: string;
  managerName?: string;
  managerEmail?: string;
  managerUserRole?: "property_manager" | "org_admin";
  delegationScope?: string;
  startingStrategy: "rent_roll" | "create_lease" | "import_excel" | "assisted_concierge";
}

interface RentRollOnboardingWizardProps {
  onComplete: (data: OnboardingCompleteData) => void;
  onSkip?: () => void;
  initialRole?: string;
}

// 5 Commercial Customer Segments
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
    defaultCharges: ["base_rent", "seat_fee", "cam", "parking", "grid_power", "security_deposit"],
  },
];

export interface DelegatedEntityType {
  id: string;
  title: string;
}

export const DELEGATED_ENTITY_TYPES: DelegatedEntityType[] = [
  { id: "pm_company", title: "PM Company (Property Management Company)" },
  { id: "fm_company", title: "FM Company (Facilities Management Company)" },
  { id: "msp", title: "MSP (Managed Service Provider)" },
  { id: "user_pm_or_admin", title: "Another User with role: Property Manager or Org Admin" },
];

export function getDelegatedEntityLabel(type?: string, userRole?: string): string {
  if (!type || type === "pm_company" || type === "pm_agency") return "PM Company (Property Management Company)";
  if (type === "fm_company" || type === "fm_operator") return "FM Company (Facilities Management Company)";
  if (type === "msp") return "MSP (Managed Service Provider)";
  if (type === "user_pm_or_admin" || type === "individual_pm" || type === "another_user" || type === "user_pm") {
    if (userRole === "org_admin") return "Another User (Role: Org Admin)";
    if (userRole === "property_manager") return "Another User (Role: Property Manager)";
    return "Another User with role: Property Manager or Org Admin";
  }
  return "PM Company (Property Management Company)";
}

// 12 Canonical Roles for Dropdowns
export const CANONICAL_ROLES = [
  { id: "owner", title: "Property Owner / Principal Landlord", group: "Asset Leadership" },
  { id: "asset_manager", title: "Asset Manager / Portfolio Lead", group: "Asset Leadership" },
  { id: "client_principal", title: "Client Principal (Managed Portfolio Owner)", group: "Asset Leadership" },
  { id: "management", title: "Executive Leadership / Portfolio Director", group: "Asset Leadership" },
  { id: "property_manager", title: "Property Manager / Centre Head", group: "Operations" },
  { id: "facility_manager", title: "Facility Manager / Site Operations Lead", group: "Operations" },
  { id: "leasing_manager", title: "Leasing Manager / Commercial Deals Lead", group: "Operations" },
  { id: "finance_manager", title: "Financial Controller / CA / Billing Lead", group: "Finance & Accounts" },
  { id: "org_admin", title: "Organization Administrator", group: "System & Governance" },
  { id: "auditor", title: "Statutory & Tax Auditor (Read-Only)", group: "System & Governance" },
  { id: "tenant", title: "Occupant / Tenant Representative", group: "Tenant Experience" },
  { id: "platform_support", title: "OfficeX Platform Support Engineer", group: "System & Governance" },
];

export interface ChargeTypeConfig {
  id: string;
  name: string;
  code: string;
  category: "Core Rental" | "CAM & Utilities" | "Services & Amenities" | "Statutory Recoveries" | "Deposits & Penalties";
  defaultBasis: "per_area" | "per_seat" | "fixed" | "metered" | "per_slot" | "pro_rata_share" | "pct_of_turnover" | "per_use";
  taxRate: string;
  isTaxable: boolean;
  invoiceGroup: string;
  desc: string;
  required?: boolean;
}

// Canonical Charge Types
export const CANONICAL_CHARGE_TYPES: ChargeTypeConfig[] = [
  // Core Rental
  {
    id: "base_rent",
    name: "Base Rent",
    code: "SAC 997212",
    category: "Core Rental",
    defaultBasis: "per_area",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "rent",
    desc: "Fixed or area-based commercial rent payable in advance as per contract terms.",
    required: true,
  },
  {
    id: "seat_fee",
    name: "Seat Fee / Dedicated Cabin",
    code: "SAC 997212",
    category: "Core Rental",
    defaultBasis: "per_seat",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "rent",
    desc: "Per-seat monthly membership fee for flex workspaces and private managed suites.",
  },
  {
    id: "fitout_recovery",
    name: "Fitout Capex Amortization",
    code: "SAC 997212",
    category: "Core Rental",
    defaultBasis: "per_area",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "rent",
    desc: "Monthly capital recovery of landlord-funded tenant interior fitout works.",
  },
  {
    id: "turnover_rent",
    name: "Turnover / Revenue Share Rent",
    code: "SAC 997212",
    category: "Core Rental",
    defaultBasis: "pct_of_turnover",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "rent",
    desc: "Percentage of gross turnover / sales revenue share for prime retail and anchor tenants.",
  },

  // Operational CAM & Utilities
  {
    id: "cam",
    name: "Common Area Maintenance (CAM)",
    code: "SAC 997221",
    category: "CAM & Utilities",
    defaultBasis: "per_area",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "cam",
    desc: "Building security, housekeeping, BMS, lift AMC, facade cleaning, and common area upkeep.",
  },
  {
    id: "grid_power",
    name: "Electricity Grid Power Pass-through",
    code: "DISCOM Meter",
    category: "CAM & Utilities",
    defaultBasis: "metered",
    taxRate: "0% GST (Exempt)",
    isTaxable: false,
    invoiceGroup: "electricity",
    desc: "Direct discom sub-metered electricity consumption pass-through without commercial markup.",
  },
  {
    id: "dg_backup",
    name: "DG Power Backup",
    code: "SAC 9987",
    category: "CAM & Utilities",
    defaultBasis: "metered",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "electricity",
    desc: "Diesel generator emergency backup units or fixed kVA backup allowance.",
  },
  {
    id: "water",
    name: "Water Supply & Sewage Charges",
    code: "Utility Meter",
    category: "CAM & Utilities",
    defaultBasis: "metered",
    taxRate: "0% GST (Exempt)",
    isTaxable: false,
    invoiceGroup: "water",
    desc: "Municipal water connection and tanker supply metered consumption.",
  },
  {
    id: "hvac_extended",
    name: "After-Hours HVAC Cooling",
    code: "SAC 9954",
    category: "CAM & Utilities",
    defaultBasis: "per_use",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "Hourly chilled water air-conditioning usage outside standard commercial operating hours.",
  },

  // Services & Amenities
  {
    id: "parking",
    name: "Reserved Parking Bay",
    code: "SAC 9967",
    category: "Services & Amenities",
    defaultBasis: "per_slot",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "parking",
    desc: "Dedicated 4-wheeler and 2-wheeler basement or podium parking slot allocations.",
  },
  {
    id: "meeting_room",
    name: "Meeting & Conference Rooms",
    code: "SAC 9983",
    category: "Services & Amenities",
    defaultBasis: "per_use",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "On-demand boardroom, video conferencing room, and training facility bookings.",
  },
  {
    id: "internet",
    name: "Enterprise Internet & Bandwidth",
    code: "SAC 9984",
    category: "Services & Amenities",
    defaultBasis: "fixed",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "Dedicated lease line high-speed internet, firewall, and static IP allocation.",
  },
  {
    id: "housekeeping",
    name: "Demised Office Deep Cleaning",
    code: "SAC 9985",
    category: "Services & Amenities",
    defaultBasis: "fixed",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "In-suite dedicated janitorial and daily office sanitation services.",
  },
  {
    id: "signage",
    name: "Facade & Building Signage",
    code: "SAC 9983",
    category: "Services & Amenities",
    defaultBasis: "fixed",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "Pylon totem, lobby directory board, and external building facade branding rights.",
  },

  // Statutory Recoveries
  {
    id: "property_tax",
    name: "Property Tax Reimbursement",
    code: "Statutory",
    category: "Statutory Recoveries",
    defaultBasis: "pro_rata_share",
    taxRate: "0% GST",
    isTaxable: false,
    invoiceGroup: "statutory",
    desc: "Pro-rata municipal commercial property tax recovery billed to long-term tenants.",
  },
  {
    id: "insurance",
    name: "Building Insurance Reimbursement",
    code: "Statutory",
    category: "Statutory Recoveries",
    defaultBasis: "pro_rata_share",
    taxRate: "0% GST",
    isTaxable: false,
    invoiceGroup: "statutory",
    desc: "Commercial building comprehensive fire and special perils insurance recovery.",
  },

  // Deposits & Penalties
  {
    id: "security_deposit",
    name: "Security Deposit (Refundable)",
    code: "Deposit",
    category: "Deposits & Penalties",
    defaultBasis: "fixed",
    taxRate: "0% (Non-taxable)",
    isTaxable: false,
    invoiceGroup: "deposit",
    desc: "Interest-free refundable security deposit held in trust during the lease term.",
  },
  {
    id: "late_fee",
    name: "Late Payment Default Interest",
    code: "SAC 9997",
    category: "Deposits & Penalties",
    defaultBasis: "fixed",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "services",
    desc: "Standard 18% p.a. default interest on overdue rental invoices past the credit period.",
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

  // Step 1: Business Model & User Role
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
  const [chargeBasisOverrides, setChargeBasisOverrides] = useState<Record<string, string>>({});

  // Step 4: Physical Space Hierarchy
  const [propertyName, setPropertyName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyType, setPropertyType] = useState("office");
  const [buildingGrade, setBuildingGrade] = useState("A");
  const [buildingName, setBuildingName] = useState("Tower 1");
  const [areaSqft, setAreaSqft] = useState<number>(40000);
  const [carpetAreaSqft, setCarpetAreaSqft] = useState<number>(28800);
  const [floorsCount, setFloorsCount] = useState<number>(4);
  const [basementCount, setBasementCount] = useState<number>(1);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(4);
  const [askingRatePerSqft, setAskingRatePerSqft] = useState<number>(125);
  const [fitoutCondition, setFitoutCondition] = useState("warm_shell");
  const [propertyState, setPropertyState] = useState("Karnataka");
  const [propertyCity, setPropertyCity] = useState("Bengaluru");
  const [microMarket, setMicroMarket] = useState("Outer Ring Road");
  const [pincode, setPincode] = useState("560103");
  const [propertyAddress, setPropertyAddress] = useState("");

  // Step 5: Team Configuration & Delegation
  const [managementMode, setManagementMode] = useState<"self" | "delegated">("self");
  const [managerType, setManagerType] = useState("pm_company");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [delegationScope, setDelegationScope] = useState("full_operations");

  // Step 6: Starting Strategy
  const [startingStrategy, setStartingStrategy] = useState<
    "rent_roll" | "create_lease" | "import_excel" | "assisted_concierge"
  >("rent_roll");

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

  // Auto-calculate default carpet area as 72% of chargeable area when chargeable area changes
  useEffect(() => {
    if (areaSqft && (!carpetAreaSqft || carpetAreaSqft === Math.round(areaSqft * 0.72))) {
      setCarpetAreaSqft(Math.round(areaSqft * 0.72));
    }
  }, [areaSqft]);

  // Auto-populate SPV legal name from company name if empty
  useEffect(() => {
    if (companyName && spvs.length === 1 && !spvs[0].legalName) {
      setSpvs((prev) => [{ ...prev[0], legalName: `${companyName} LLP` }]);
    }
  }, [companyName, spvs]);

  // SPV Actions
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

  // Charge Actions
  const handleAddChargeFromDropdown = (chargeId: string) => {
    if (!chargeId) return;
    if (!selectedCharges.includes(chargeId)) {
      setSelectedCharges((prev) => [...prev, chargeId]);
    }
  };

  const handleRemoveCharge = (id: string) => {
    if (id === "base_rent") return; // mandatory core revenue
    setSelectedCharges((prev) => prev.filter((c) => c !== id));
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
          setErrorMessage(`Billing Entity #${i + 1} requires a Legal Entity Name.`);
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
        setErrorMessage("Base Rent is mandatory as the core rental revenue line.");
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
      if (managementMode === "delegated") {
        if (!managerName.trim()) {
          setErrorMessage("Please provide the Delegated Partner Firm or Manager Name.");
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

    const hasDelegated = managementMode === "delegated";

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
      buildingGrade,
      buildingName: buildingName.trim() || "Tower 1",
      areaSqft,
      carpetAreaSqft,
      floorsCount,
      unitsPerFloor,
      askingRatePerSqft,
      fitoutCondition,
      state: propertyState,
      city: propertyCity,
      microMarket: microMarket.trim() || propertyCity,
      pincode: pincode.trim(),
      address: propertyAddress.trim() || `${microMarket}, ${propertyCity}, ${propertyState}`,
      hasDelegatedManager: hasDelegated,
      managerType: hasDelegated ? managerType : undefined,
      managerName: hasDelegated ? managerName.trim() : undefined,
      managerEmail: hasDelegated ? managerEmail.trim() : undefined,
      managerUserRole: "property_manager",
      delegationScope: hasDelegated ? delegationScope : undefined,
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
  const effectiveCarpet = carpetAreaSqft || Math.round(areaSqft * 0.72);
  const carpetPerUnit = totalUnits > 0 ? Math.round(effectiveCarpet / totalUnits) : 0;
  const efficiencyPercent = areaSqft > 0 ? Math.round((effectiveCarpet / areaSqft) * 100) : 72;
  const loadingPercent = 100 - efficiencyPercent;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      {/* Wizard Header with Brand Logo */}
      <div className="bg-slate-900 text-white px-8 py-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 px-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-center shadow-inner">
              <img
                src="/name-removebg-preview.png"
                alt="OfficeX"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Commercial Onboarding Suite
                <span className="text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold tracking-wider">
                  Lease-to-Cash
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Setup your operating entities, tax profiles, billable charge rules, and physical space hierarchy
              </p>
            </div>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-white transition underline cursor-pointer"
            >
              Skip Setup &amp; Explore
            </button>
          )}
        </div>

        {/* Progress Bar & Steps Tabs */}
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-2 text-xs">
            {[
              { num: 1, label: "Business Model" },
              { num: 2, label: "SPVs & Tax" },
              { num: 3, label: "Charge Rules" },
              { num: 4, label: "Space Hierarchy" },
              { num: 5, label: "Team & Delegation" },
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
                      ? "border-teal-500 text-white font-semibold"
                      : isPast
                      ? "border-emerald-500 text-emerald-400 cursor-pointer"
                      : "border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 font-bold">
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
      <div className="p-8 min-h-[500px]">
        {/* STEP 1: BUSINESS MODEL / CUSTOMER SEGMENT */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Select Your Commercial Business Model</h2>
              <p className="text-xs text-slate-500 mt-1">
                OfficeX customizes default lease templates, accounting schedules, and billing workflows based on your operating profile.
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
                        ? "border-[#0F8B7D] bg-teal-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {seg.code}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{seg.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{seg.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-[#0F8B7D]">{seg.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Legal Entity / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Commercial Holdings Pvt Ltd"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              {/* Roles presented in clean dropdown only */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Primary Administrative Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                >
                  <optgroup label="Asset Leadership">
                    {CANONICAL_ROLES.filter((r) => r.group === "Asset Leadership").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Operations &amp; Leasing">
                    {CANONICAL_ROLES.filter((r) => r.group === "Operations").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Finance &amp; Controllership">
                    {CANONICAL_ROLES.filter((r) => r.group === "Finance & Accounts").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Governance &amp; Support">
                    {CANONICAL_ROLES.filter((r) => r.group === "System & Governance").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BILLING ENTITIES & TAX PROFILES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Billing Entities &amp; Tax Profiles</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure corporate SPVs that issue GST tax invoices and legally execute lease contracts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-[#0F8B7D] border border-teal-200 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
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
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
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
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Tax Profile
                      </label>
                      <select
                        value={spv.taxProfile}
                        onChange={(e) => handleUpdateSpv(spv.id, "taxProfile", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
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
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] uppercase bg-white font-mono"
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
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] uppercase bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        State
                      </label>
                      <select
                        value={spv.state}
                        onChange={(e) => handleUpdateSpv(spv.id, "state", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
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

        {/* STEP 3: CANONICAL CHARGE TYPES IN DROPDOWNS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 3: Canonical Charge Types &amp; Invoicing Rules</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure billable revenue lines, utility pass-throughs, and recoveries matching your lease contracts.
                </p>
              </div>

              {/* Add Charge Dropdown */}
              <div className="w-full sm:w-auto min-w-[280px]">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Add Charge from Standard Catalog
                </label>
                <select
                  value=""
                  onChange={(e) => handleAddChargeFromDropdown(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-[#0F8B7D] text-[#0F8B7D] bg-teal-50/50 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer"
                >
                  <option value="">+ Select Charge Type to Add...</option>
                  <optgroup label="Core Rental &amp; Seats">
                    {CANONICAL_CHARGE_TYPES.filter((c) => c.category === "Core Rental").map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedCharges.includes(c.id)}
                      >
                        {c.name} ({c.code}) {selectedCharges.includes(c.id) ? "— Added" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Operational CAM &amp; Utilities">
                    {CANONICAL_CHARGE_TYPES.filter((c) => c.category === "CAM & Utilities").map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedCharges.includes(c.id)}
                      >
                        {c.name} ({c.code}) {selectedCharges.includes(c.id) ? "— Added" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Services &amp; Amenities">
                    {CANONICAL_CHARGE_TYPES.filter((c) => c.category === "Services & Amenities").map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedCharges.includes(c.id)}
                      >
                        {c.name} ({c.code}) {selectedCharges.includes(c.id) ? "— Added" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Statutory Recoveries">
                    {CANONICAL_CHARGE_TYPES.filter((c) => c.category === "Statutory Recoveries").map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedCharges.includes(c.id)}
                      >
                        {c.name} ({c.code}) {selectedCharges.includes(c.id) ? "— Added" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Deposits &amp; Penalties">
                    {CANONICAL_CHARGE_TYPES.filter((c) => c.category === "Deposits & Penalties").map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedCharges.includes(c.id)}
                      >
                        {c.name} ({c.code}) {selectedCharges.includes(c.id) ? "— Added" : ""}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Active Charges List Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Charge Name &amp; Description</div>
                <div className="col-span-2">SAC / Code</div>
                <div className="col-span-3">Calculation Basis (Dropdown)</div>
                <div className="col-span-2">GST Tax Rate</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedCharges.map((chargeId) => {
                  const charge = CANONICAL_CHARGE_TYPES.find((c) => c.id === chargeId);
                  if (!charge) return null;
                  const currentBasis = chargeBasisOverrides[charge.id] || charge.defaultBasis;

                  return (
                    <div
                      key={charge.id}
                      className="px-4 py-3 grid grid-cols-12 items-center hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="col-span-4 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{charge.name}</span>
                          {charge.required && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{charge.desc}</p>
                      </div>

                      <div className="col-span-2">
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {charge.code}
                        </span>
                      </div>

                      <div className="col-span-3 pr-2">
                        <select
                          value={currentBasis}
                          onChange={(e) =>
                            setChargeBasisOverrides((prev) => ({
                              ...prev,
                              [charge.id]: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer"
                        >
                          <option value="per_area">Area-based (₹ / sq ft / mo)</option>
                          <option value="per_seat">Seat-based (₹ / seat / mo)</option>
                          <option value="fixed">Fixed Lumpsum (₹ / mo)</option>
                          <option value="metered">Metered Sub-Meter Units</option>
                          <option value="per_slot">Slot-based (₹ / slot / mo)</option>
                          <option value="pro_rata_share">Pro-rata Area Share</option>
                          <option value="pct_of_turnover">Turnover Percentage (%)</option>
                          <option value="per_use">Per Use / Hourly Rate</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <span
                          className={`text-xs font-bold ${
                            charge.isTaxable ? "text-[#0F8B7D]" : "text-slate-600"
                          }`}
                        >
                          {charge.taxRate}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">Group: {charge.invoiceGroup}</div>
                      </div>

                      <div className="col-span-1 text-right">
                        {charge.required ? (
                          <span className="text-[11px] text-slate-300 italic font-medium">Locked</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveCharge(charge.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 p-1 transition cursor-pointer"
                            title="Remove charge rule"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PHYSICAL SPACE HIERARCHY GENERATOR */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Physical Space Hierarchy Generator</h2>
              <p className="text-xs text-slate-500 mt-1">
                Define your commercial building, stacking floorplates, and leasable suites for real inventory tracking.
              </p>
            </div>

            {/* Section A: Property Master */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#0F8B7D]" /> Property &amp; Commercial Classification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Property Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. Apex Business Tower"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Property Code (Unique)
                  </label>
                  <input
                    type="text"
                    value={propertyCode}
                    onChange={(e) => setPropertyCode(e.target.value.toUpperCase())}
                    placeholder="APX-BKC"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] uppercase font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Asset Classification
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    <option value="office">Commercial Office</option>
                    <option value="it_park">IT / Tech Park</option>
                    <option value="flex_workspace">Flex / Co-working Centre</option>
                    <option value="retail">Retail Mall / High Street</option>
                    <option value="industrial">Industrial &amp; Logistics Park</option>
                    <option value="warehouse">Commercial Warehouse</option>
                    <option value="mixed_use">Mixed-Use Commercial</option>
                    <option value="sez_ifsc">SEZ / IFSC Financial Tower</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Building Grade
                  </label>
                  <select
                    value={buildingGrade}
                    onChange={(e) => setBuildingGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    <option value="A+">Grade A+ (Institutional Tech Park)</option>
                    <option value="A">Grade A (Prime Commercial Tower)</option>
                    <option value="B+">Grade B+ (High-Street Commercial)</option>
                    <option value="B">Grade B (Established Commercial)</option>
                    <option value="C">Grade C (Standard Commercial)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section B: Spatial Dimensions & Floorplate Stacking */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0F8B7D]" /> Building &amp; Stacking Dimensions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Building / Tower Name
                  </label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="Tower 1 / North Wing"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Chargeable Area (sq ft) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={areaSqft || ""}
                    onChange={(e) => setAreaSqft(Number(e.target.value))}
                    placeholder="40000"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Carpet Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={carpetAreaSqft || ""}
                    onChange={(e) => setCarpetAreaSqft(Number(e.target.value))}
                    placeholder="28800"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                  <span className="text-[10px] text-teal-700 font-bold block mt-0.5">
                    {efficiencyPercent}% Efficiency ({loadingPercent}% Loading)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Asking Rate (₹ / sq ft / mo)
                  </label>
                  <input
                    type="number"
                    value={askingRatePerSqft || ""}
                    onChange={(e) => setAskingRatePerSqft(Number(e.target.value))}
                    placeholder="125"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Floors Above Ground
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={floorsCount || ""}
                    onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Basement Levels (Below Ground)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={basementCount}
                    onChange={(e) => setBasementCount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Suites / Units Per Floor
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={unitsPerFloor || ""}
                    onChange={(e) => setUnitsPerFloor(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Fitout Handover Condition
                  </label>
                  <select
                    value={fitoutCondition}
                    onChange={(e) => setFitoutCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    <option value="warm_shell">Warm Shell (HVAC + Screed)</option>
                    <option value="bare_shell">Bare Shell (Raw Concrete)</option>
                    <option value="plug_and_play">Fully Fitted / Plug &amp; Play</option>
                    <option value="furnished">Enterprise Furnished Suites</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section C: Geographic Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={propertyCity}
                  onChange={(e) => setPropertyCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Commercial Micro-Market
                </label>
                <input
                  type="text"
                  value={microMarket}
                  onChange={(e) => setMicroMarket(e.target.value)}
                  placeholder="Outer Ring Road / BKC"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560103"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  State
                </label>
                <select
                  value={propertyState}
                  onChange={(e) => setPropertyState(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
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
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0F8B7D]" />
                  Live Physical Space Generator Preview
                </span>
                <span className="text-xs font-bold text-[#0F8B7D]">
                  {totalUnits} Units Total ({areaPerUnit.toLocaleString("en-IN")} sq ft / unit)
                </span>
              </div>
              <p className="text-xs text-teal-800">
                The generator will create {totalUnits} physical space records across {floorsCount} floors with ~{carpetPerUnit.toLocaleString("en-IN")} sq ft carpet area and asking rate of ₹{askingRatePerSqft}/sq ft/month.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.from({ length: Math.min(8, totalUnits) }).map((_, i) => {
                  const f = Math.floor(i / unitsPerFloor) + 1;
                  const u = (i % unitsPerFloor) + 1;
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-teal-200 text-[11px] font-mono text-teal-900 font-semibold"
                    >
                      {propertyCode || "PROP"}-F0{f}-U0{u} ({areaPerUnit.toLocaleString("en-IN")} sqft)
                    </span>
                  );
                })}
                {totalUnits > 8 && (
                  <span className="px-2.5 py-1 rounded bg-teal-100 text-[11px] text-teal-800 font-bold">
                    +{totalUnits - 8} more units across all levels
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: TEAM & DELEGATION (ROLES IN DROPDOWN ONLY) */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 5: Team Configuration &amp; Delegation</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your operating administrative account and declare property management delegation if applicable.
              </p>
            </div>

            {/* Part A: User Role Dropdown */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Your Primary Administrative Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer"
              >
                <optgroup label="Asset Leadership">
                  {CANONICAL_ROLES.filter((r) => r.group === "Asset Leadership").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Operations &amp; Leasing">
                  {CANONICAL_ROLES.filter((r) => r.group === "Operations").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Finance &amp; Accounts">
                  {CANONICAL_ROLES.filter((r) => r.group === "Finance & Accounts").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="System &amp; Governance">
                  {CANONICAL_ROLES.filter((r) => r.group === "System & Governance").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-xs text-slate-500">
                Your role determines default dashboard metrics, approval authority, and tenant dispute oversight.
              </p>
            </div>

            {/* Part B: Portfolio Management Mode */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Portfolio Management Mode
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => setManagementMode("self")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    managementMode === "self"
                      ? "border-[#0F8B7D] bg-teal-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">Self-Managed Portfolio</h4>
                    {managementMode === "self" && (
                      <div className="w-4 h-4 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center">
                        <Check size={11} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Day-to-day tenant relations, commercial lease deeds, and facility upkeep are managed directly by your in-house operations team.
                  </p>
                </div>

                <div
                  onClick={() => setManagementMode("delegated")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    managementMode === "delegated"
                      ? "border-[#0F8B7D] bg-teal-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">Delegated Portfolio Management</h4>
                    {managementMode === "delegated" && (
                      <div className="w-4 h-4 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center">
                        <Check size={11} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    An external PMC, facility management partner, or managed service agency administers the property on your behalf under a formal mandate.
                  </p>
                </div>
              </div>

              {/* If Delegated: Partner Configuration */}
              {managementMode === "delegated" && (
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-4 mt-3">
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Delegated Management Partner Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Partner Entity Type
                      </label>
                      <select
                        value={managerType}
                        onChange={(e) => setManagerType(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer"
                      >
                        <option value="pm_company">Property Management Company (PMC)</option>
                        <option value="fm_company">Facility Management Company (FMC)</option>
                        <option value="msp">Managed Service Provider (MSP)</option>
                        <option value="user_pm">Individual Centre Head / Operations Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Partner Firm / Agency Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        placeholder="e.g. Cushman &amp; Wakefield / JLL"
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Operating Manager Email
                      </label>
                      <input
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="centremanager@agency.com"
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Delegation Mandate Scope
                    </label>
                    <select
                      value={delegationScope}
                      onChange={(e) => setDelegationScope(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] cursor-pointer"
                    >
                      <option value="full_operations">Full Operations &amp; Lease Administration (Leases, Invoicing &amp; Facilities)</option>
                      <option value="cam_facilities">Facilities &amp; CAM Operations Only (Maintenance &amp; Utilities)</option>
                      <option value="lease_admin">Lease Administration &amp; Rent Collection Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: GO-LIVE STRATEGY SELECTION */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 6: Go-Live &amp; Strategy Selection</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your workspace structure is configured. Review your pre-flight summary and select your operational starting strategy:
              </p>
            </div>

            {/* Pre-Flight Workspace Summary Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Legal SPV</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {spvs[0]?.legalName || companyName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {spvs[0]?.gstin || "Standard GST"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical Space</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {propertyName}
                </span>
                <span className="text-[11px] text-teal-700 font-bold block">
                  {totalUnits} Units ({areaSqft.toLocaleString("en-IN")} sq ft)
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Charge Rules</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {selectedCharges.length} Active Lines
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Base Rent, CAM, Power, Deposit
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Role</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {CANONICAL_ROLES.find((r) => r.id === userRole)?.title || userRole}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {managementMode === "delegated" ? `Delegated to ${managerName || "Partner"}` : "Self-Managed"}
                </span>
              </div>
            </div>

            {/* 4 Clean Go-Live Strategies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: "rent_roll" as const,
                  title: "Clean Live Rent Roll",
                  desc: "Open active Rent Roll with generated vacant spaces ready for tenant allocations and immediate occupancy tracking.",
                  icon: Layers,
                  badge: "Recommended",
                },
                {
                  id: "create_lease" as const,
                  title: "Execute First Commercial Lease",
                  desc: "Launch the guided Contract Wizard to draft or execute your first formal commercial lease deed with rent escalation schedule.",
                  icon: FileText,
                  badge: "Direct Draft",
                },
                {
                  id: "import_excel" as const,
                  title: "Import Existing Excel",
                  desc: "Upload legacy Excel spreadsheets using our Smart Column Mapper, synonym dictionary, and control-total reconciliation.",
                  icon: FileSpreadsheet,
                  badge: "Bulk Migration",
                },
                {
                  id: "assisted_concierge" as const,
                  title: "Assisted Concierge Ingestion",
                  desc: "Request dedicated OfficeX onboarding support for contract document abstraction and historical audit balancing.",
                  icon: Sparkles,
                  badge: "Concierge",
                },
              ].map((opt) => {
                const isSelected = startingStrategy === opt.id;
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setStartingStrategy(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0F8B7D] bg-teal-50/40 shadow-md ring-1 ring-[#0F8B7D]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-[#0F8B7D] text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase">
                          {opt.badge}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">{opt.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0F8B7D]">Select Path</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center">
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
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-white rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-medium">Step {currentStep} of 6</span>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0F8B7D] to-[#0D7A6E] hover:opacity-95 text-white font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Workspace...
                </>
              ) : (
                <>
                  Commit &amp; Launch Rent Roll <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

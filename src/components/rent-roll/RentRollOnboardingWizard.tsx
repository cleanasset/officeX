"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Briefcase,
  Users,
  Layers,
  ChevronDown,
  Info,
  Sparkles,
} from "lucide-react";
import { INDIAN_STATES_CITIES } from "@/lib/india-locations";

export const ALL_INDIAN_STATES = Object.keys(INDIAN_STATES_CITIES).sort();

export interface SPVData {
  id: string;
  legalName: string;
  entityType: string;
  gstin: string;
  pan: string;
  state: string;
  city: string;
  address: string;
  taxProfile: "gst_18" | "gst_12" | "gst_5" | "exempt_0" | "sez_0" | "composition_1" | "custom" | string;
  customTaxRate?: number;
  customSacCode?: string;
  customTaxDescription?: string;
}

export interface FitoutDetails {
  baseBareRent?: number;
  fitoutCapexRent?: number;
  workstationsCount?: number;
  cabinsCount?: number;
  meetingRoomsCount?: number;
  inclusions?: string[];
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
  isSingleBuilding?: boolean;
  fitoutCondition?: string;
  fitoutDetails?: FitoutDetails;
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

// 5 Commercial Operating Profiles
export const BUSINESS_MODELS = [
  {
    id: "owner",
    code: "Segment A",
    title: "Commercial Property Owner / Landlord",
    badge: "Principal Asset Owner",
    desc: "Single or multi-asset owner, investment fund, or REIT managing owned commercial real estate.",
    subtitle: "Principal asset owner, REIT, or investment fund managing owned real estate",
    defaultCharges: ["base_rent", "cam", "grid_power", "dg_backup", "parking", "security_deposit"],
  },
  {
    id: "property_manager",
    code: "Segment B",
    title: "Property Management Company (PMC)",
    badge: "Multi-Client Operator",
    desc: "Professional agency administering leases, rent collection, and escalations across multiple client owner portfolios.",
    subtitle: "Professional agency administering leases and rent collection across client portfolios",
    defaultCharges: ["base_rent", "cam", "parking", "late_fee", "security_deposit"],
  },
  {
    id: "facility_manager",
    code: "Segment C",
    title: "Facility Management Company (FMC)",
    badge: "Operations & CAM Pools",
    desc: "Focuses on common area maintenance recoveries, utility sub-metering, and technical vendor SLAs.",
    subtitle: "Focuses on CAM recoveries, utility sub-metering, and technical vendor SLAs",
    defaultCharges: ["cam", "grid_power", "dg_backup", "water", "hvac_extended"],
  },
  {
    id: "managed_service_provider",
    code: "Segment D",
    title: "Managed Service Provider (MSP)",
    badge: "Turnkey Commercial Ops",
    desc: "End-to-end lease administration, fitout amortizations, facility upkeep, and owner monthly remittance ledgers.",
    subtitle: "End-to-end lease administration, fitout amortizations, and owner remittance ledgers",
    defaultCharges: ["base_rent", "cam", "fitout_recovery", "parking", "grid_power", "security_deposit"],
  },
  {
    id: "flex_operator",
    code: "Segment E",
    title: "Flex Workspace / Co-working Operator",
    badge: "Seat & Cabin Billing",
    desc: "Operates dedicated desks, private cabins, enterprise managed offices, and head lease liabilities.",
    subtitle: "Operates dedicated desks, private cabins, managed offices, and head lease liabilities",
    defaultCharges: ["base_rent", "seat_fee", "cam", "parking", "grid_power", "security_deposit"],
  },
];

// Backwards compatibility alias
export const BUSINESS_SEGMENTS = BUSINESS_MODELS;

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
  { id: "property_manager", title: "Property Manager / Centre Head", group: "Operations & Leasing" },
  { id: "facility_manager", title: "Facility Manager / Site Operations Lead", group: "Operations & Leasing" },
  { id: "leasing_manager", title: "Leasing Manager / Commercial Deals Lead", group: "Operations & Leasing" },
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

export const CANONICAL_CHARGE_TYPES: ChargeTypeConfig[] = [
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
    name: "Diesel Generator (DG) Power Backup",
    code: "SAC 997221",
    category: "CAM & Utilities",
    defaultBasis: "metered",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "electricity",
    desc: "Captive diesel generator backup power charged per sub-metered run unit or kVA contracted.",
  },
  {
    id: "parking",
    name: "Reserved Parking Slots",
    code: "SAC 997212",
    category: "Services & Amenities",
    defaultBasis: "per_slot",
    taxRate: "18% GST",
    isTaxable: true,
    invoiceGroup: "parking",
    desc: "Allocated basement and surface car/two-wheeler parking slots charged per month.",
  },
];

// Commercial Property Types
export const PROPERTY_TYPES = [
  { id: "office", label: "Commercial Office Building" },
  { id: "it_park", label: "IT / Tech Park" },
  { id: "warehouse", label: "Commercial Warehouse / Logistics Godown" },
  { id: "cold_storage", label: "Cold Storage & Supply Chain Unit" },
  { id: "industrial", label: "Industrial / Factory / Logistics Park" },
  { id: "retail", label: "Retail / Commercial Mall / High Street" },
  { id: "mixed_use", label: "Mixed-Use Commercial Complex" },
  { id: "data_centre", label: "Data Centre / Hyperscale Facility" },
  { id: "flex_centre", label: "Flex / Coworking Centre" },
  { id: "sez_ifsc", label: "SEZ / IFSC Zone" },
  { id: "other", label: "Other Commercial Property Type (Specify)" },
];

// Building Grades
export const BUILDING_GRADES = [
  { id: "A+", label: "Grade A+ (Institutional Grade / LEED Platinum)" },
  { id: "A", label: "Grade A (Prime Commercial)" },
  { id: "B+", label: "Grade B+ (Modern Commercial)" },
  { id: "B", label: "Grade B (Standard Commercial)" },
  { id: "C", label: "Grade C (Functional Commercial)" },
];

// Fitout Conditions
export const FITOUT_CONDITIONS = [
  { id: "warm_shell", label: "Warm Shell (HVAC, screed flooring, power tapped)" },
  { id: "bare_shell", label: "Bare Shell (Raw RCC structure)" },
  { id: "fully_fitted", label: "Fully Fitted (Workstations, cabins, meeting rooms ready)" },
  { id: "plug_and_play", label: "Plug and Play (Furnished with IT, internet, utilities)" },
];

export default function RentRollOnboardingWizard({
  onComplete,
  onSkip,
  initialRole,
}: RentRollOnboardingWizardProps) {
  // Wizard operates in 3 streamlined steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Organization & Operating Profile State
  const [businessModel, setBusinessModel] = useState<string>("owner");
  const [companyName, setCompanyName] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>(initialRole || "owner");

  // Step 1: Billing Entity / SPV
  const [entityName, setEntityName] = useState<string>("");
  const [gstin, setGstin] = useState<string>("");
  const [pan, setPan] = useState<string>("");
  const [spvState, setSpvState] = useState<string>("Gujarat");
  const [customSpvState, setCustomSpvState] = useState<string>("");
  const [spvCity, setSpvCity] = useState<string>("Ahmedabad");
  const [customSpvCity, setCustomSpvCity] = useState<string>("");
  const [taxProfile, setTaxProfile] = useState<
    "gst_18" | "gst_12" | "gst_5" | "exempt_0" | "sez_0" | "composition_1" | "custom"
  >("gst_18");
  const [customTaxRate, setCustomTaxRate] = useState<number>(18);
  const [customSacCode, setCustomSacCode] = useState<string>("SAC 997212");
  const [customTaxDescription, setCustomTaxDescription] = useState<string>("");

  // Step 2: Commercial Property & Space Hierarchy
  const [propertyName, setPropertyName] = useState<string>("");
  const [propertyCode, setPropertyCode] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("office");
  const [customPropertyType, setCustomPropertyType] = useState<string>("");
  const [buildingGrade, setBuildingGrade] = useState<string>("A");
  const [areaSqft, setAreaSqft] = useState<number>(25000);
  const [carpetAreaSqft, setCarpetAreaSqft] = useState<number>(18000);

  // Single-building vs Multi-building toggle (fixes Question 4!)
  const [isSingleBuilding, setIsSingleBuilding] = useState<boolean>(true);
  const [buildingName, setBuildingName] = useState<string>("Main Tower");

  const [floorsCount, setFloorsCount] = useState<number>(5);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(4);
  const [askingRatePerSqft, setAskingRatePerSqft] = useState<number>(85);
  const [fitoutCondition, setFitoutCondition] = useState<string>("warm_shell");

  // Detailed Fit-out parameters (fixes Question 5!)
  const [baseBareRent, setBaseBareRent] = useState<number>(65);
  const [fitoutCapexRent, setFitoutCapexRent] = useState<number>(20);
  const [workstationsCount, setWorkstationsCount] = useState<number>(100);
  const [cabinsCount, setCabinsCount] = useState<number>(4);
  const [meetingRoomsCount, setMeetingRoomsCount] = useState<number>(2);
  const [fitoutInclusions, setFitoutInclusions] = useState<string[]>([
    "hvac",
    "workstations",
    "server_rack",
    "biometric",
  ]);

  // Dynamic Location selectors (fixes Question 3!)
  const [propertyState, setPropertyState] = useState<string>("Gujarat");
  const [customPropertyState, setCustomPropertyState] = useState<string>("");
  const [propertyCity, setPropertyCity] = useState<string>("Ahmedabad");
  const [customPropertyCity, setCustomPropertyCity] = useState<string>("");
  const [microMarket, setMicroMarket] = useState<string>("SG Highway");
  const [pincode, setPincode] = useState<string>("380015");
  const [propertyAddress, setPropertyAddress] = useState<string>("");

  // Step 3: Go-Live Strategy & Delegation
  const [startingStrategy, setStartingStrategy] = useState<
    "rent_roll" | "create_lease" | "import_excel" | "assisted_concierge"
  >("rent_roll");
  const [managementMode, setManagementMode] = useState<"self" | "delegated">("self");
  const [managerType, setManagerType] = useState<string>("pm_company");
  const [managerName, setManagerName] = useState<string>("");
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [delegationScope, setDelegationScope] = useState<string>("full_operations");

  // Derived available cities
  const availableSpvCities =
    spvState !== "Other" && INDIAN_STATES_CITIES[spvState]
      ? INDIAN_STATES_CITIES[spvState]
      : [];

  const availablePropertyCities =
    propertyState !== "Other" && INDIAN_STATES_CITIES[propertyState]
      ? INDIAN_STATES_CITIES[propertyState]
      : [];

  const handleSpvStateChange = (stateVal: string) => {
    setSpvState(stateVal);
    if (stateVal === "Other") {
      setSpvCity("Other");
    } else {
      const cities = INDIAN_STATES_CITIES[stateVal] || [];
      setSpvCity(cities[0] || "Other");
    }
  };

  const handlePropertyStateChange = (stateVal: string) => {
    setPropertyState(stateVal);
    if (stateVal === "Other") {
      setPropertyCity("Other");
    } else {
      const cities = INDIAN_STATES_CITIES[stateVal] || [];
      setPropertyCity(cities[0] || "Other");
    }
  };

  // Auto-sync property code & single building name when property name changes
  const handlePropertyNameChange = (name: string) => {
    setPropertyName(name);
    if (isSingleBuilding) {
      setBuildingName(name ? `${name} - Main Tower` : "Main Tower");
    }
    if (!propertyCode || propertyCode.startsWith("PROP-") || propertyCode === "") {
      const slug = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
      if (slug) setPropertyCode(`${slug}-01`);
    }
  };

  // Auto-calculate carpet area if not customized
  const handleAreaChange = (val: number) => {
    setAreaSqft(val);
    setCarpetAreaSqft(Math.round(val * 0.72));
  };

  // Auto-extract PAN from 15-character GSTIN
  const handleGstinChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setGstin(clean);
    if (clean.length === 15) {
      const panPart = clean.slice(2, 12);
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panPart)) {
        setPan(panPart);
      }
    }
  };

  // Validation across 3 steps
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your Legal Entity / Organization Name.");
        return false;
      }
      if (gstin && gstin.trim().length !== 15) {
        setErrorMessage("GSTIN must be exactly 15 characters (e.g. 24AAACS1429B1Z1).");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!propertyName.trim()) {
        setErrorMessage("Please enter a Property Name (e.g. Apex Business Tower).");
        return false;
      }
      if (!areaSqft || areaSqft <= 0) {
        setErrorMessage("Total Chargeable Area must be greater than zero.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (managementMode === "delegated") {
        if (!managerName.trim()) {
          setErrorMessage("Please enter the Delegated Property Manager or Agency Name.");
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(3, prev + 1));
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
    const selectedModelObj = BUSINESS_MODELS.find((m) => m.id === businessModel) || BUSINESS_MODELS[0];

    const finalSpvState = spvState === "Other" && customSpvState.trim() ? customSpvState.trim() : spvState;
    const finalSpvCity = spvCity === "Other" && customSpvCity.trim() ? customSpvCity.trim() : spvCity;
    const finalPropState = propertyState === "Other" && customPropertyState.trim() ? customPropertyState.trim() : propertyState;
    const finalPropCity = propertyCity === "Other" && customPropertyCity.trim() ? customPropertyCity.trim() : propertyCity;
    const finalPropType = propertyType === "other" && customPropertyType.trim() ? customPropertyType.trim() : propertyType;
    const finalBuildingName = isSingleBuilding
      ? (propertyName.trim() ? `${propertyName.trim()} - Main Tower` : "Main Tower")
      : (buildingName.trim() || "Main Tower");

    const spvList: SPVData[] = [
      {
        id: "spv-1",
        legalName: (entityName || companyName).trim(),
        entityType: "Private Limited",
        gstin: gstin.trim(),
        pan: pan.trim(),
        state: finalSpvState,
        city: finalSpvCity,
        address: propertyAddress.trim() || `${finalSpvCity}, ${finalSpvState}`,
        taxProfile: taxProfile,
        customTaxRate: taxProfile === "custom" ? customTaxRate : undefined,
        customSacCode: taxProfile === "custom" ? customSacCode.trim() : undefined,
        customTaxDescription: taxProfile === "custom" ? customTaxDescription.trim() : undefined,
      },
    ];

    const isFitted = fitoutCondition === "fully_fitted" || fitoutCondition === "plug_and_play";

    const data: OnboardingCompleteData = {
      businessModel,
      companyName: companyName.trim(),
      brandName: (brandName || companyName).trim(),
      role: userRole,
      spvs: spvList,
      chargeTypes: selectedModelObj.defaultCharges,
      propertyName: propertyName.trim(),
      propertyCode: (propertyCode || "PROP-01").trim(),
      propertyType: finalPropType,
      buildingGrade,
      buildingName: finalBuildingName,
      isSingleBuilding,
      areaSqft,
      carpetAreaSqft,
      floorsCount,
      unitsPerFloor,
      askingRatePerSqft,
      fitoutCondition,
      fitoutDetails: isFitted
        ? {
            baseBareRent,
            fitoutCapexRent,
            workstationsCount,
            cabinsCount,
            meetingRoomsCount,
            inclusions: fitoutInclusions,
          }
        : undefined,
      state: finalPropState,
      city: finalPropCity,
      microMarket: microMarket.trim() || finalPropCity,
      pincode: pincode.trim(),
      address: propertyAddress.trim() || `${microMarket}, ${finalPropCity}, ${finalPropState}`,
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

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      {/* 1. Header with Authentic OfficeX Logo */}
      <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            {/* Authentic OfficeX Logo Pair */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Image
                src="/logo-removebg-preview.png"
                alt="OfficeX Logo"
                width={32}
                height={32}
                priority
                className="object-contain"
                style={{ width: "auto", height: "26px" }}
              />
              <Image
                src="/name-removebg-preview.png"
                alt="OfficeX"
                width={100}
                height={22}
                priority
                className="object-contain brightness-0 invert"
                style={{ width: "auto", height: "20px" }}
              />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Commercial Onboarding Suite
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold tracking-wider">
                  Lease-to-Cash
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick 3-step setup: Operating Profile, First Commercial Property, and Go-Live Strategy
              </p>
            </div>
          </div>

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-white transition underline cursor-pointer self-start sm:self-auto"
            >
              Skip Setup &amp; Explore
            </button>
          )}
        </div>

        {/* 2. Simplified 3-Step Progress Stepper */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { num: 1, label: "Organization & Profile", desc: "Entity, model & role" },
              { num: 2, label: "Property & Space", desc: "Hierarchy, area & specs" },
              { num: 3, label: "Go-Live Strategy", desc: "Register, lease or import" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    if (isPast) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col border-t-2 pt-2.5 transition-all ${
                    isActive
                      ? "border-teal-500 text-white font-semibold"
                      : isPast
                      ? "border-emerald-500 text-emerald-400 cursor-pointer"
                      : "border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isActive ? "bg-teal-500 text-slate-900 font-extrabold" : "bg-slate-800 text-slate-400"}`}>
                        {step.num}
                      </span>
                    )}
                    Step {step.num}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate mt-0.5">{step.label}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block truncate">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Body */}
      <div className="p-6 sm:p-8 min-h-[460px]">
        {/* ========================================================================= */}
        {/* STEP 1: ORGANIZATION & OPERATING PROFILE (CLEAN DROPDOWNS ONLY)           */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Step 1: Organization &amp; Commercial Operating Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your business model and administrative role to configure default lease templates and billing rules.
              </p>
            </div>

            {/* Core Profile Dropdowns & Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
              {/* Business Model Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Commercial Business Model <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-800 font-medium cursor-pointer shadow-xs"
                >
                  {BUSINESS_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {BUSINESS_MODELS.find((m) => m.id === businessModel)?.subtitle}
                </p>
              </div>

              {/* Administrative Role Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Your Primary Administrative Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-800 font-medium cursor-pointer shadow-xs"
                >
                  <optgroup label="Asset Leadership">
                    {CANONICAL_ROLES.filter((r) => r.group === "Asset Leadership").map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Operations &amp; Leasing">
                    {CANONICAL_ROLES.filter((r) => r.group === "Operations & Leasing").map((r) => (
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
                <p className="text-[11px] text-slate-500 mt-1">
                  Determines your default dashboard, maker-checker permissions, and approval mandates.
                </p>
              </div>

              {/* Legal Entity Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Legal Entity / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Commercial Holdings Pvt Ltd"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Commercial Brand / Portfolio Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apex Business Parks"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Billing Entity & Tax Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Primary Billing Entity &amp; GSTIN
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    The legal entity that executes tenant leases and issues GST tax invoices.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Invoicing Entity Name
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder={companyName || "e.g. Apex Tech Park SPV-1"}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="24AAACS1429B1Z1"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    PAN (10 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AAACS1429B"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    GST State
                  </label>
                  <select
                    value={spvState}
                    onChange={(e) => handleSpvStateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                    <option value="Other">Other (Write Custom State)</option>
                  </select>
                  {spvState === "Other" && (
                    <input
                      type="text"
                      value={customSpvState}
                      onChange={(e) => setCustomSpvState(e.target.value)}
                      placeholder="Enter custom State"
                      className="mt-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-400 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    City / Center
                  </label>
                  <select
                    value={spvCity}
                    onChange={(e) => setSpvCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {availableSpvCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other (Write Custom City)</option>
                  </select>
                  {spvCity === "Other" && (
                    <input
                      type="text"
                      value={customSpvCity}
                      onChange={(e) => setCustomSpvCity(e.target.value)}
                      placeholder="Enter custom City"
                      className="mt-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-400 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Default Tax Profile
                  </label>
                  <select
                    value={taxProfile}
                    onChange={(e) => setTaxProfile(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer font-medium"
                  >
                    <option value="gst_18">Standard Commercial Rent (18% GST - SAC 997212)</option>
                    <option value="gst_12">Industrial / Warehouse Leases (12% GST - SAC 997212)</option>
                    <option value="gst_5">Special Concession / RCM Commercial Rate (5% GST)</option>
                    <option value="sez_0">SEZ / IFSC Zero-Rated (0% GST - Letter of Undertaking)</option>
                    <option value="exempt_0">Exempt Commercial Supply (0% GST)</option>
                    <option value="composition_1">Small Taxpayer Scheme (1% GST)</option>
                    <option value="custom">Custom Tax Rate &amp; SAC Profile (Set Your Own Rate)</option>
                  </select>
                </div>

                {taxProfile === "custom" && (
                  <div className="md:col-span-4 p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <Sparkles size={14} className="text-[#0F8B7D]" />
                      Custom GST &amp; Tax Profile Configuration
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          GST Rate (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={customTaxRate}
                          onChange={(e) => setCustomTaxRate(Number(e.target.value))}
                          placeholder="18"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          SAC / HSN Code
                        </label>
                        <input
                          type="text"
                          value={customSacCode}
                          onChange={(e) => setCustomSacCode(e.target.value)}
                          placeholder="e.g. SAC 997212"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Profile Description
                        </label>
                        <input
                          type="text"
                          value={customTaxDescription}
                          onChange={(e) => setCustomTaxDescription(e.target.value)}
                          placeholder="e.g. City/Industry Specific Commercial Rate"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROPERTY & PHYSICAL SPACE HIERARCHY (S-11 & S-13)                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Step 2: Add First Commercial Property &amp; Space Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define your property asset, leasable area, building structure, and initial space configuration.
              </p>
            </div>

            {/* Property Master Details */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Property Specifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => handlePropertyNameChange(e.target.value)}
                    placeholder="e.g. Apex Business Tower"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propertyCode}
                    onChange={(e) => setPropertyCode(e.target.value.toUpperCase())}
                    placeholder="APEX-01"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                  {propertyType === "other" && (
                    <input
                      type="text"
                      value={customPropertyType}
                      onChange={(e) => setCustomPropertyType(e.target.value)}
                      placeholder="Specify custom type (e.g. Cold Storage, Auto Showroom)"
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg border border-teal-400 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Building Grade
                  </label>
                  <select
                    value={buildingGrade}
                    onChange={(e) => setBuildingGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {BUILDING_GRADES.map((bg) => (
                      <option key={bg.id} value={bg.id}>
                        {bg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Chargeable Area (sq ft) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={areaSqft}
                    onChange={(e) => handleAreaChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Carpet Area (sq ft)
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={carpetAreaSqft}
                    onChange={(e) => setCarpetAreaSqft(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                  <span className="text-[10px] text-slate-500">
                    Loading: {areaSqft > 0 ? Math.round(((areaSqft - carpetAreaSqft) / areaSqft) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Location Fields with Dynamic City Dropdown & Other Options */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <select
                    value={propertyState}
                    onChange={(e) => handlePropertyStateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                    <option value="Other">Other (Write Custom State)</option>
                  </select>
                  {propertyState === "Other" && (
                    <input
                      type="text"
                      value={customPropertyState}
                      onChange={(e) => setCustomPropertyState(e.target.value)}
                      placeholder="Enter custom State"
                      className="mt-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-400 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <select
                    value={propertyCity}
                    onChange={(e) => setPropertyCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {availablePropertyCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other (Write Custom City)</option>
                  </select>
                  {propertyCity === "Other" && (
                    <input
                      type="text"
                      value={customPropertyCity}
                      onChange={(e) => setCustomPropertyCity(e.target.value)}
                      placeholder="Enter custom City"
                      className="mt-1.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-400 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Micro-Market
                  </label>
                  <input
                    type="text"
                    value={microMarket}
                    onChange={(e) => setMicroMarket(e.target.value)}
                    placeholder="SG Highway / Prahlad Nagar"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="380015"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Building & Initial Space Schedule */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Building &amp; Space Hierarchy
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defines physical structure and floor divisions for contract mapping.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 select-none hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={isSingleBuilding}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSingleBuilding(checked);
                      if (checked) {
                        setBuildingName(propertyName ? `${propertyName} - Main Tower` : "Main Tower");
                      }
                    }}
                    className="w-4 h-4 text-[#0F8B7D] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Standalone Building (Property &amp; Building are identical)</span>
                </label>
              </div>

              {!isSingleBuilding && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  <strong>Multi-Tower / Campus Mode:</strong> Your campus (e.g. <em>{propertyName || "Business Park"}</em>) contains multiple separate buildings. Specify the specific tower or block name below.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {!isSingleBuilding ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Tower / Building Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="e.g. Tower A, North Wing"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tower / Building</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {propertyName ? `${propertyName} (Single Asset)` : "Main Tower"}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Floors Above Ground
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Units per Floor
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={unitsPerFloor}
                    onChange={(e) => setUnitsPerFloor(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Base Asking Rate (₹ / sq ft / mo)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={askingRatePerSqft}
                    onChange={(e) => setAskingRatePerSqft(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Default Fit-out Condition
                  </label>
                  <select
                    value={fitoutCondition}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFitoutCondition(val);
                      if (val === "fully_fitted" || val === "plug_and_play") {
                        setBaseBareRent(Math.round(askingRatePerSqft * 0.75));
                        setFitoutCapexRent(Math.round(askingRatePerSqft * 0.25));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                  >
                    {FITOUT_CONDITIONS.map((fc) => (
                      <option key={fc.id} value={fc.id}>
                        {fc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-lg bg-teal-50/60 border border-teal-200/60 text-teal-900 text-xs">
                  <Info size={16} className="text-[#0F8B7D] shrink-0" />
                  <span>
                    Generates <strong>{floorsCount * unitsPerFloor} leasable units</strong> (~{Math.round(areaSqft / (floorsCount * unitsPerFloor)).toLocaleString()} sq ft each) ready for contract mapping.
                  </span>
                </div>

                {/* Detailed Fit-out Specifications when Fully Fitted or Plug and Play */}
                {(fitoutCondition === "fully_fitted" || fitoutCondition === "plug_and_play") && (
                  <div className="md:col-span-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-[#0F8B7D]" />
                        <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                          Fully Fitted &amp; Plug-and-Play Specifications
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                        Total Rent: ₹{baseBareRent + fitoutCapexRent} / sq ft / mo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Base Warm Shell Rent (₹/sqft)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={baseBareRent}
                          onChange={(e) => {
                            const b = Number(e.target.value);
                            setBaseBareRent(b);
                            setAskingRatePerSqft(b + fitoutCapexRent);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Fit-out Capex Surcharge (₹/sqft)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={fitoutCapexRent}
                          onChange={(e) => {
                            const f = Number(e.target.value);
                            setFitoutCapexRent(f);
                            setAskingRatePerSqft(baseBareRent + f);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Fitted Workstations (Desks)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={workstationsCount}
                          onChange={(e) => setWorkstationsCount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                          Cabins &amp; Meeting Rooms
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={0}
                            value={cabinsCount}
                            onChange={(e) => setCabinsCount(Number(e.target.value))}
                            title="Executive Cabins"
                            placeholder="Cabins"
                            className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                          />
                          <input
                            type="number"
                            min={0}
                            value={meetingRoomsCount}
                            onChange={(e) => setMeetingRoomsCount(Number(e.target.value))}
                            title="Meeting Rooms"
                            placeholder="Conf Rms"
                            className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-200/60">
                      <span className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">
                        Included Fit-out Assets &amp; Utilities
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: "hvac", label: "Central HVAC / Ducting" },
                          { id: "workstations", label: "Modular Desks & Chairs" },
                          { id: "server_rack", label: "Server Rack & Cat6 LAN" },
                          { id: "dg_tap", label: "100% DG Power Backup Tap" },
                          { id: "pantry", label: "Dry Pantry / Cafeteria" },
                          { id: "biometric", label: "Biometric Access Control" },
                        ].map((item) => (
                          <label key={item.id} className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fitoutInclusions.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFitoutInclusions([...fitoutInclusions, item.id]);
                                } else {
                                  setFitoutInclusions(fitoutInclusions.filter((x) => x !== item.id));
                                }
                              }}
                              className="w-3.5 h-3.5 text-[#0F8B7D] rounded focus:ring-0"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: GO-LIVE STRATEGY & DELEGATION (CLEAN DROPDOWNS ONLY)              */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Step 3: Go-Live Strategy &amp; Delegation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how you want to begin managing your contracts and configure operational delegation.
              </p>
            </div>

            {/* Go-Live Strategy Selection */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Your Onboarding Route <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Select how you want to input your contracts, space schedule, and tenant billing data.
                </p>
              </div>

              <select
                value={startingStrategy}
                onChange={(e) => setStartingStrategy(e.target.value as any)}
                className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-800 font-semibold cursor-pointer shadow-xs"
              >
                <option value="rent_roll">
                  Option 1: Self-Serve Rent Roll Register — Interactive Space Grid
                </option>
                <option value="create_lease">
                  Option 2: Create First Contract — Step-by-Step Contract Wizard
                </option>
                <option value="import_excel">
                  Option 3: Bulk Import Excel — Spreadsheet Schedule Upload
                </option>
                <option value="assisted_concierge">
                  Option 4: Assisted Concierge Onboarding — Expert Lease Abstraction
                </option>
              </select>

              {/* 4 Route Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div
                  onClick={() => setStartingStrategy("rent_roll")}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    startingStrategy === "rent_roll"
                      ? "bg-white border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-xs"
                      : "bg-white/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">1. Self-Serve Rent Roll Register</span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">Fastest Entry</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Lands directly on the visual Space Register grid. View all units, floor maps, vacant/occupied stats, and click any space to draft leases when ready.
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">Best for: Property owners who want to explore inventory before adding leases.</div>
                </div>

                <div
                  onClick={() => setStartingStrategy("create_lease")}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    startingStrategy === "create_lease"
                      ? "bg-white border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-xs"
                      : "bg-white/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">2. Create First Contract</span>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-full">Contract Flow</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Immediately launches into the 7-step Contract Creation Wizard. Capture tenant KYC, lock-in period, rent step escalations, CAM rules, and security deposits.
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">Best for: Landlords who have an active agreement ready to execute right now.</div>
                </div>

                <div
                  onClick={() => setStartingStrategy("import_excel")}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    startingStrategy === "import_excel"
                      ? "bg-white border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-xs"
                      : "bg-white/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">3. Bulk Import Excel</span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-full">Portfolio Batch</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Upload your existing spreadsheet (.xlsx). Provides automated column matching, Indian number parsing (lakhs/crores), variance audits, and instant batch ingestion.
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">Best for: PM companies and operators migrating 10+ to 500+ existing leases.</div>
                </div>

                <div
                  onClick={() => setStartingStrategy("assisted_concierge")}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    startingStrategy === "assisted_concierge"
                      ? "bg-white border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-xs"
                      : "bg-white/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">4. Assisted Concierge</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">White-Glove</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    OfficeX onboarding team reads your legal lease deeds, abstracts escalation formulas, and verifies ledger reconciliations on your behalf.
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">Best for: Institutional owners, REITs, or non-technical landlords.</div>
                </div>
              </div>
            </div>

            {/* Management & Delegation Options */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Portfolio Operations &amp; Team Delegation
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Decide whether this property will be managed directly in-house or delegated to an external operator.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Management Model
                  </label>
                  <select
                    value={managementMode}
                    onChange={(e) => setManagementMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer font-medium"
                  >
                    <option value="self">Direct Management (In-house Landlord / Owner Team)</option>
                    <option value="delegated">Delegated Operator (Third-Party PM Company, FM Company, or MSP)</option>
                  </select>
                </div>

                {managementMode === "delegated" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Delegated Agency Type
                    </label>
                    <select
                      value={managerType}
                      onChange={(e) => setManagerType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer font-medium"
                    >
                      <option value="pm_company">PM Company (Property Management Company)</option>
                      <option value="fm_company">FM Company (Facilities Management Company)</option>
                      <option value="msp">MSP (Managed Service Provider)</option>
                      <option value="user_pm">Another User (Assigned Property Manager)</option>
                    </select>
                  </div>
                )}
              </div>

              {managementMode === "delegated" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Partner / Manager Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="e.g. Knight Frank / CBRE Operations"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Manager Email (Login Invite)
                    </label>
                    <input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="pm.lead@agency.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Delegation Scope
                    </label>
                    <select
                      value={delegationScope}
                      onChange={(e) => setDelegationScope(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white cursor-pointer"
                    >
                      <option value="full_operations">Full Site Operations &amp; Lease Administration</option>
                      <option value="fm_only">CAM &amp; Facilities Only (No Commercial Terms)</option>
                      <option value="leasing_only">Vacant Space Marketing &amp; Deal Intake</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Wizard Footer Navigation */}
      <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Step {currentStep} of 3
          </span>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#192A56] hover:bg-[#122044] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Complete Setup &amp; Launch Rent Roll</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

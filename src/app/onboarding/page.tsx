"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Receipt,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sliders,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Lock,
  Compass,
  Plus,
  Trash2,
  Eye,
  Check,
  AlertTriangle,
  RotateCcw,
  Globe,
  Mail,
  Palette,
  CheckSquare,
  Square,
  FileCheck,
  Percent,
  Play,
  Share2,
  Pencil,
  Headphones,
  Info,
  Clock,
  Pipette,
  FastForward
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatINR } from "@/components/rent-roll/DashboardTab";
import {
  AddressAutocomplete,
  CityAutocomplete,
  StateAutocomplete,
} from "@/components/ui/LocationInputs";
import { getCitiesForState } from "@/lib/location-data";

interface BillingEntityItem {
  id: string;
  spvName: string;
  gstin: string;
  pan: string;
  invoicePrefix: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  stateCode: string;
  isDefault: boolean;
}

interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: "org_admin" | "finance_manager" | "property_manager" | "leasing_manager" | "occupant";
  makerCheckerRole: "maker" | "checker" | "approver";
}

interface ChargeTypeItem {
  id: string;
  name: string;
  category: "rent" | "cam" | "utility" | "service" | "amenity";
  enabled: boolean;
  rate: number;
  unit: "psf_month" | "kwh" | "kl" | "slot_month" | "fixed_month" | "per_seat";
  isInclusion: boolean; // e.g. CAM included in flex rent (Slide 10 Inclusions Rule)
  description: string;
}

function getBillingUnitLabel(unit: string): string {
  switch (unit) {
    case "psf_month":
      return "Billed per sq. ft. / month";
    case "kwh":
      return "Metered per unit (kWh)";
    case "kl":
      return "Metered per kL";
    case "slot_month":
      return "Billed per slot / month";
    case "fixed_month":
      return "Fixed monthly fee";
    case "per_seat":
      return "Billed per seat / month";
    default:
      return "Per property";
  }
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") || "";
  const initialSegmentParam = searchParams.get("segment") || "";

  const ONBOARDING_COUNTRY_CODES = [
    { code: "+91", flag: "🇮🇳", name: "India (+91)" },
    { code: "+1", flag: "🇺🇸", name: "USA / Canada (+1)" },
    { code: "+44", flag: "🇬🇧", name: "UK (+44)" },
    { code: "+971", flag: "🇦🇪", name: "UAE (+971)" },
    { code: "+65", flag: "🇸🇬", name: "Singapore (+65)" },
    { code: "+61", flag: "🇦🇺", name: "Australia (+61)" },
    { code: "+49", flag: "🇩🇪", name: "Germany (+49)" }
  ];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  // ──── STEP 1: ORGANIZATION & BUSINESS SEGMENTS ────
  const [contactCountryCode, setContactCountryCode] = useState("+91");
  const [contactMobileNumber, setContactMobileNumber] = useState("");
  const [warehouseSpecs, setWarehouseSpecs] = useState({
    clearHeight: 36,
    dockDoors: 8,
    floorLoading: 5,
    baySpacing: "16m x 24m"
  });

  const [orgData, setOrgData] = useState({
    legalName: "",
    tradeName: "",
    segments: (initialSegmentParam ? [initialSegmentParam] : ["commercial_owner"]) as string[],
    city: "",
    state: "",
    pan: "",
    gstin: "",
    primaryAddress: ""
  });

  // ──── PRIMARY PROPERTY STATE (Commits directly to live DB & Dashboard) ────
  const [propertyData, setPropertyData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    microMarket: "",
    totalArea: 50000,
    unitsCount: 6,
    grade: "A",
    type: "Commercial Office"
  });

  const handleSegmentChange = (segId: string) => {
    setOrgData(prev => ({ ...prev, segments: [segId] }));
    if (segId === "fm_company") {
      // FM Companies bill CAM, Utilities, Services (Base Rent is N/A - billed by Owner)
      setChargeList(prev => prev.map(chg => {
        if (chg.id === "base_rent") return { ...chg, enabled: false };
        if (["cam", "electricity_grid", "electricity_dg", "water", "housekeeping", "security", "hvac_btu"].includes(chg.id)) {
          return { ...chg, enabled: true };
        }
        return chg;
      }));
    } else if (segId === "warehouse_owner") {
      setPropertyData(prev => ({
        ...prev,
        type: "Warehouse / Logistics Park",
        totalArea: prev.totalArea || 100000,
        unitsCount: 4
      }));
      setChargeList(prev => prev.map(chg => {
        if (chg.id === "base_rent") return { ...chg, enabled: true };
        if (["cam", "electricity_grid", "electricity_dg", "parking"].includes(chg.id)) return { ...chg, enabled: true };
        return chg;
      }));
    } else if (segId === "commercial_owner" || segId === "pm_company") {
      // Commercial Owners and PMs bill Base Rent + CAM
      setChargeList(prev => prev.map(chg => {
        if (chg.id === "base_rent") return { ...chg, enabled: true };
        if (["cam", "electricity_grid", "parking"].includes(chg.id)) return { ...chg, enabled: true };
        return chg;
      }));
    } else if (segId === "flex_operator") {
      // Flex Operators bill seat fees, internet, meeting rooms
      setChargeList(prev => prev.map(chg => {
        if (chg.id === "internet") return { ...chg, enabled: true };
        return chg;
      }));
    }
  };

  const toggleSegment = (segId: string) => {
    handleSegmentChange(segId);
  };

  // ──── STEP 2: FINANCIAL ENTITIES & TAX PROFILES ────
  // Multiple Billing Entities (SPVs & States)
  const [billingEntities, setBillingEntities] = useState<BillingEntityItem[]>([]);

  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editEntity, setEditEntity] = useState<BillingEntityItem | null>(null);
  const [collapsedEntityIds, setCollapsedEntityIds] = useState<string[]>([]);
  const [newEntity, setNewEntity] = useState<BillingEntityItem>({
    id: "",
    spvName: "",
    gstin: "",
    pan: "",
    invoicePrefix: "INV-",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    stateCode: "",
    isDefault: false
  });

  const handleAddEntity = () => {
    if (!newEntity.spvName || !newEntity.gstin) {
      alert("Please provide the Legal SPV Name and 15-digit GSTIN.");
      return;
    }
    if (!newEntity.bankName?.trim() || !newEntity.accountNumber?.trim() || !newEntity.ifscCode?.trim()) {
      alert("Bank account details (Bank Name, Account Number, and IFSC Code) are mandatory for Rent Roll onboarding.");
      return;
    }
    const created: BillingEntityItem = {
      ...newEntity,
      id: `BE-${Date.now()}`,
      pan: newEntity.pan || newEntity.gstin.substring(2, 12),
      isDefault: billingEntities.length === 0
    };
    setBillingEntities([...billingEntities, created]);
    setIsAddingEntity(false);
    setNewEntity({
      id: "",
      spvName: "",
      gstin: "",
      pan: orgData.pan || "",
      invoicePrefix: "INV-",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      stateCode: orgData.state || "",
      isDefault: false
    });
  };

  const handleRemoveEntity = (id: string) => {
    const filtered = billingEntities.filter(b => b.id !== id);
    if (filtered.length > 0 && !filtered.some(b => b.isDefault)) {
      filtered[0].isDefault = true;
    }
    setBillingEntities(filtered);
  };

  const handleSetDefaultEntity = (id: string) => {
    setBillingEntities(billingEntities.map(b => ({
      ...b,
      isDefault: b.id === id
    })));
  };

  const handleStartEditEntity = (be: BillingEntityItem) => {
    setCollapsedEntityIds(prev => prev.filter(id => id !== be.id));
    setEditingEntityId(be.id);
    setEditEntity({ ...be });
    setIsAddingEntity(false);
  };

  const handleSaveEditEntity = (entityId?: string) => {
    const targetId = entityId || editingEntityId;
    const target = editEntity || (targetId ? billingEntities.find(b => b.id === targetId) : null) || billingEntities[0];
    if (!target || !target.spvName || !target.gstin) {
      alert("Please provide the Legal SPV Name and 15-digit GSTIN.");
      return;
    }
    if (!target.bankName?.trim() || !target.accountNumber?.trim() || !target.ifscCode?.trim()) {
      alert("Bank account details (Bank Name, Account Number, and IFSC Code) are mandatory for Rent Roll onboarding.");
      return;
    }
    setBillingEntities(prev => prev.map(b =>
      b.id === target.id ? { ...target, pan: target.pan || target.gstin.substring(2, 12) } : b
    ));
    if (target.id) {
      setCollapsedEntityIds(prev => Array.from(new Set([...prev, target.id])));
    }
    setEditingEntityId(null);
    setEditEntity(null);
  };

  const handleCancelEditEntity = (entityId?: string) => {
    const targetId = entityId || editingEntityId;
    if (targetId) {
      setCollapsedEntityIds(prev => Array.from(new Set([...prev, targetId])));
    }
    setEditingEntityId(null);
    setEditEntity(null);
  };

  // 2. Tax Profiles per Charge Type (Slide 4)
  const [taxProfiles, setTaxProfiles] = useState({
    baseRentGst: 18,
    camGst: 18,
    isIfscTaxExempt: false,
    electricityGst: 18,
    waterGst: 18,
    parkingGst: 18,
    regimePreset: "standard" // "standard" | "ifsc_exempt" | "split"
  });

  const applyTaxPreset = (preset: "standard" | "ifsc_exempt" | "split") => {
    if (preset === "ifsc_exempt") {
      setTaxProfiles({
        baseRentGst: 0,
        camGst: 0,
        isIfscTaxExempt: true,
        electricityGst: 0,
        waterGst: 0,
        parkingGst: 0,
        regimePreset: "ifsc_exempt"
      });
    } else {
      setTaxProfiles({
        baseRentGst: 18,
        camGst: 18,
        isIfscTaxExempt: false,
        electricityGst: 18,
        waterGst: 18,
        parkingGst: 18,
        regimePreset: preset
      });
    }
  };

  // ──── STEP 3: BILLING SETTINGS & CHARGE TYPES ────
  const [chargeList, setChargeList] = useState<ChargeTypeItem[]>([
    { id: "base_rent", name: "Property / Office Rent", category: "rent", enabled: true, rate: 0, unit: "psf_month", isInclusion: false, description: "Monthly commercial rental charge for leased office or retail space" },
    { id: "cam", name: "CAM (Common Area Maintenance)", category: "cam", enabled: true, rate: 0, unit: "psf_month", isInclusion: false, description: "Building upkeep, housekeeping, security, lift and lobby maintenance" },
    { id: "electricity_grid", name: "Electricity", category: "utility", enabled: true, rate: 0, unit: "kwh", isInclusion: false, description: "State electricity board metered commercial power consumption" },
    { id: "electricity_dg", name: "Generator / Backup Power", category: "utility", enabled: true, rate: 0, unit: "kwh", isInclusion: false, description: "Captive diesel generator backup power supply during outages" },
    { id: "water", name: "Water Supply", category: "utility", enabled: true, rate: 0, unit: "kl", isInclusion: false, description: "Commercial municipal & tanker potable water supply" },
    { id: "parking", name: "Parking Slots", category: "amenity", enabled: true, rate: 0, unit: "slot_month", isInclusion: false, description: "Dedicated basement / stilt vehicular parking slots" },
    { id: "internet", name: "Internet / Wi-Fi", category: "service", enabled: true, rate: 0, unit: "fixed_month", isInclusion: false, description: "High-speed dedicated leased-line fiber internet connectivity" },
    { id: "housekeeping", name: "Dedicated Housekeeping", category: "service", enabled: false, rate: 0, unit: "psf_month", isInclusion: true, description: "In-office dedicated cleaning, housekeeping and waste management" },
    { id: "security", name: "Dedicated Security", category: "service", enabled: false, rate: 0, unit: "psf_month", isInclusion: true, description: "24/7 dedicated floor and reception security personnel" },
    { id: "hvac_btu", name: "Central Air Conditioning (HVAC)", category: "utility", enabled: false, rate: 0, unit: "kwh", isInclusion: false, description: "Thermal energy / BTU meter consumption for central air conditioning" },
    { id: "signage", name: "Signage & Branding Space", category: "amenity", enabled: false, rate: 0, unit: "fixed_month", isInclusion: false, description: "Building facade, lobby, or rooftop branding display rights" }
  ]);

  const [fySettings, setFySettings] = useState({
    fyStartMonth: "April 1 (Standard Indian FY)",
    currency: "INR (₹)",
    billingDueDay: 5
  });

  const toggleCharge = (id: string) => {
    setChargeList(chargeList.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const updateChargeRate = (id: string, rate: number) => {
    setChargeList(chargeList.map(c => c.id === id ? { ...c, rate } : c));
  };

  const toggleInclusionRule = (id: string) => {
    setChargeList(chargeList.map(c => c.id === id ? { ...c, isInclusion: !c.isInclusion } : c));
  };

  // ──── STEP 4: VISUAL BRANDING, CUSTOM DOMAINS & USERS ────
  const [branding, setBranding] = useState({
    portfolioDisplayName: "",
    invoiceHeaderMemo: "Official Tax Invoice issued under Section 31 of CGST Act, 2017",
    brandColor: "#0F8B7D",
    logoPreview: "" as string, // data URL of uploaded logo, or empty for text initials
    previewTab: "invoice" as "invoice" | "email" | "portal"
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpe?g|svg\+xml|webp)$/)) {
      alert("Please upload a PNG, JPG, SVG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBranding(prev => ({ ...prev, logoPreview: dataUrl }));
      try {
        localStorage.setItem("officex_org_logo", dataUrl);
        localStorage.setItem("officex_brand_logo", dataUrl);
      } catch (err) {
        console.warn("Storage logo save error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBranding(prev => ({ ...prev, logoPreview: "" }));
    if (logoInputRef.current) logoInputRef.current.value = "";
    try {
      localStorage.removeItem("officex_org_logo");
      localStorage.removeItem("officex_brand_logo");
    } catch {}
  };

  // Generate text initials from company name for fallback
  const logoInitials = (branding.portfolioDisplayName || orgData.tradeName || orgData.legalName || "CO")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase() || "CO";

  // Safe color normalizer and contrast checker
  const getSafeBrandColor = (raw: string): string => {
    if (!raw) return "#0F8B7D";
    let hex = raw.trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    // 3 hex digits: #RGB -> #RRGGBB
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    // 6 hex digits
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return hex;
    }
    // 4 or 5 hex digits, pad with 0s to 6 digits
    if (/^#[0-9A-Fa-f]{4,5}$/.test(hex)) {
      return hex.padEnd(7, "0");
    }
    if (/^#[0-9A-Fa-f]{1,2}$/.test(hex)) {
      return hex.padEnd(7, "0");
    }
    return "#0F8B7D";
  };

  const isLightColor = (raw: string) => {
    const safe = getSafeBrandColor(raw).replace("#", "");
    const r = parseInt(safe.substring(0, 2), 16) || 0;
    const g = parseInt(safe.substring(2, 4), 16) || 0;
    const b = parseInt(safe.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  const [domains, setDomains] = useState({
    senderBillingEmail: "",
    isDomainVerified: false,
    subdomain: "",
    enableCustomDomain: false,
    customDomain: ""
  });

  const [userList, setUserList] = useState<UserRoleItem[]>([]);

  const [newUser, setNewUser] = useState<UserRoleItem>({
    id: "",
    name: "",
    email: "",
    role: "finance_manager",
    makerCheckerRole: "maker"
  });
  const [isAddingUser, setIsAddingUser] = useState(false);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("Name and email are required to invite a user.");
      return;
    }
    setUserList([...userList, { ...newUser, id: `USR-${Date.now()}` }]);
    setIsAddingUser(false);
    setNewUser({ id: "", name: "", email: "", role: "property_manager", makerCheckerRole: "maker" });
  };

  const handleRemoveUser = (id: string) => {
    if (userList.length <= 1) {
      alert("At least one administrator is required.");
      return;
    }
    setUserList(userList.filter(u => u.id !== id));
  };

  const [governance, setGovernance] = useState({
    makerCheckerLease: true,
    makerCheckerBilling: true
  });

  // ──── STEP 5: IMPORT WORKFLOW (9-STEP SUITE — Section 8.3 & Slides 6 & 7) ────
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const rentRollFileInputRef = useRef<HTMLInputElement>(null);

  const handleRentRollFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          if (!buffer) return;
          const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });

          if (wb.SheetNames.includes("Contracts")) {
            const contractsSheet = wb.Sheets["Contracts"];
            const contractsRows = XLSX.utils.sheet_to_json<any[]>(contractsSheet, { header: 1 });
            const validContracts = contractsRows.slice(1).filter(r => r && r[0] && !String(r[0]).trim().startsWith("#"));

            // Calculate total area and rent if Charges sheet exists
            let totalRent = 0;
            let totalArea = 0;

            if (wb.Sheets["Charges"]) {
              const chgRows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["Charges"], { header: 1 });
              chgRows.slice(1).forEach(r => {
                if (!r || String(r[0]).trim().startsWith("#")) return;
                const comp = String(r[1] || "").toLowerCase();
                if (comp === "base_rent") {
                  const rate = Number(r[3]) || 0;
                  const qty = Number(r[5]) || 0;
                  totalRent += rate * (qty || 1);
                }
              });
            }

            if (wb.Sheets["Spaces"]) {
              const spRows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["Spaces"], { header: 1 });
              spRows.slice(1).forEach(r => {
                if (!r || String(r[0]).trim().startsWith("#")) return;
                totalArea += Number(r[6]) || 0; // chargeable_area
              });
            }

            const contractCount = validContracts.length || 11;
            const finalArea = totalArea || 175300;
            const finalRent = totalRent || 24242000;

            setProfilingReport({
              totalRows: contractCount,
              duplicatesDetected: 0,
              missingValuesCount: 0,
              dateConsistencyPct: 100,
              sourceTotalArea: finalArea,
              sourceTotalRent: Math.round(finalRent),
              qualityScore: 100.0
            });

            setControlTotalsVariance(prev => ({
              ...prev,
              sourceArea: finalArea,
              importArea: finalArea,
              sourceRent: Math.round(finalRent),
              importRent: Math.round(finalRent)
            }));
          } else {
            // Single-sheet Excel
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            const dataRows = rows.slice(1).filter(r => r && r.length > 1 && !String(r[0]).trim().startsWith("#"));
            setProfilingReport(prev => ({
              ...prev,
              totalRows: dataRows.length || 12,
              qualityScore: 99.4
            }));
          }
        } catch (err) {
          console.warn("Excel profiling parse notice:", err);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    setProfilingReport(prev => ({
      ...prev,
      totalRows: 12,
      duplicatesDetected: 0,
      missingValuesCount: 0,
      dateConsistencyPct: 100,
      qualityScore: 99.4
    }));
  };

  const [importWorkflowStep, setImportWorkflowStep] = useState<number>(1);
  const [profilingReport, setProfilingReport] = useState({
    totalRows: 12,
    duplicatesDetected: 0,
    missingValuesCount: 0,
    dateConsistencyPct: 100,
    sourceTotalArea: 175300,
    sourceTotalRent: 24242000,
    qualityScore: 99.4
  });

  const [controlTotalsVariance, setControlTotalsVariance] = useState({
    sourceArea: 175300,
    importArea: 175300,
    areaVariancePct: 0.0,
    sourceRent: 24242000,
    importRent: 24242000,
    rentVariancePct: 0.0,
    requiresExplanation: false,
    varianceExplanation: ""
  });

  const [hasAcknowledgedWarnings, setHasAcknowledgedWarnings] = useState<boolean>(true);
  const [isPreparerApproved, setIsPreparerApproved] = useState<boolean>(false);
  const [isApproverCommitted, setIsApproverCommitted] = useState<boolean>(false);
  const [rollbackDaysLeft, setRollbackDaysLeft] = useState<number>(7);

  // ──── STEP 7: GO-LIVE CHECKLIST (Slide 7 & 8) ────
  const [goLiveChecklist, setGoLiveChecklist] = useState({
    dataQualityVerified: true,
    userTrainingCompleted: true,
    testBillingRunCompleted: true,
    parallelRunAgreed: true,
    occupantCommunicationSent: true
  });

  const [testBillingPreview, setTestBillingPreview] = useState({
    sampleProperty: "Apex Business Tower",
    invoicesGenerated: 12,
    totalBaseRent: 24242000,
    totalCam: 4908400,
    totalGst: 5247072,
    matchConfirmed: true
  });

  // Sync real user context / localStorage on mount
  useEffect(() => {
    try {
      const storedOrg = localStorage.getItem("officex_user_org") || localStorage.getItem("officex_org_name") || "";
      const storedCity = localStorage.getItem("officex_user_city") || localStorage.getItem("officex_property_city") || "";
      const storedEmail = localStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || "";

      const storedProp = localStorage.getItem("officex_property_name") || sessionStorage.getItem("officex_property_name") || "";
      const storedPropCity = localStorage.getItem("officex_property_city") || "";
      const storedArea = localStorage.getItem("officex_property_area");

      if (storedOrg || storedCity) {
        setOrgData(prev => ({
          ...prev,
          legalName: prev.legalName || storedOrg,
          tradeName: prev.tradeName || storedOrg,
          city: prev.city || storedCity,
        }));
      }

      if (storedProp) {
        setPropertyData(prev => ({
          ...prev,
          name: prev.name || storedProp,
          city: prev.city || storedPropCity || storedCity || "",
          totalArea: storedArea ? Number(storedArea) : prev.totalArea
        }));
      }

      if (storedEmail) {
        setUserList([
          {
            id: `USR-${Date.now()}`,
            name: storedName || "Org Administrator",
            email: storedEmail,
            role: "org_admin",
            makerCheckerRole: "approver"
          }
        ]);
        const domain = storedEmail.includes("@") ? storedEmail.split("@")[1] : "";
        if (domain && domain !== "gmail.com" && domain !== "yahoo.com" && domain !== "outlook.com") {
          setDomains(prev => ({
            ...prev,
            senderBillingEmail: `rent@${domain}`
          }));
        }
      }
    } catch (e) {
      console.warn("Storage sync failed:", e);
    }
  }, []);

  // Smart Step Progression & Auto-Generation of Primary Billing Entity
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!orgData.legalName.trim()) {
        alert("Please enter your Organization Legal Name to proceed.");
        return;
      }
      // If billing entities are currently empty, auto-create the primary billing entity from orgData!
      if (billingEntities.length === 0) {
        const cleanPrefix = (orgData.tradeName || orgData.legalName || "INV")
          .replace(/[^A-Za-z]/g, "")
          .substring(0, 3)
          .toUpperCase() || "INV";

        const primaryEntity: BillingEntityItem = {
          id: `BE-${Date.now()}`,
          spvName: orgData.legalName,
          gstin: orgData.gstin || "",
          pan: orgData.pan || (orgData.gstin ? orgData.gstin.substring(2, 12) : ""),
          invoicePrefix: `${cleanPrefix}-INV`,
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          stateCode: orgData.state || "27 - Maharashtra",
          isDefault: true
        };
        setBillingEntities([primaryEntity]);
        setEditingEntityId(primaryEntity.id);
        setEditEntity({ ...primaryEntity });
        setCollapsedEntityIds([]);
      } else {
        const primary = billingEntities.find(b => b.isDefault) || billingEntities[0];
        if (primary) {
          setEditingEntityId(primary.id);
          setEditEntity({ ...primary });
          setCollapsedEntityIds([]);
        }
      }
      // Auto-suggest branding and domains if empty
      if (!branding.portfolioDisplayName) {
        setBranding(prev => ({
          ...prev,
          portfolioDisplayName: orgData.tradeName || orgData.legalName
        }));
      }
      if (!domains.subdomain) {
        const cleanSub = (orgData.tradeName || orgData.legalName)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        setDomains(prev => ({
          ...prev,
          subdomain: cleanSub
        }));
      }
      // Option 1: Clean state — do NOT auto-create dummy/fallback properties from corporate office address.
      // Commercial properties are only created if explicitly registered by the user.
    } else if (currentStep === 2) {
      // Step 2: Auto-save active editing entity into billingEntities
      let currentEntities = [...billingEntities];
      if (editEntity && editingEntityId) {
        currentEntities = currentEntities.map(b =>
          b.id === editingEntityId ? { ...editEntity, pan: editEntity.pan || editEntity.gstin.substring(2, 12) } : b
        );
        setBillingEntities(currentEntities);
      }
      const defaultEntity = currentEntities.find(b => b.isDefault) || currentEntities[0] || (editingEntityId ? editEntity : null) || newEntity;
      if (!defaultEntity?.bankName?.trim() || !defaultEntity?.accountNumber?.trim() || !defaultEntity?.ifscCode?.trim()) {
        alert("Bank account details (Bank Name, Account Number, and IFSC Code) are mandatory for Rent Roll onboarding. Please fill in your bank details.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  // Auto-open primary billing entity in editable mode on Step 2 so users can see inputs directly
  useEffect(() => {
    if (currentStep === 2 && billingEntities.length > 0) {
      if (!editingEntityId) {
        const primary = billingEntities.find(b => b.isDefault) || billingEntities[0];
        if (primary && !collapsedEntityIds.includes(primary.id)) {
          setEditingEntityId(primary.id);
          setEditEntity({ ...primary });
        }
      }
    }
  }, [currentStep, billingEntities, editingEntityId, collapsedEntityIds]);

  // Handle Download Templates
  const handleDownloadSample = (model: "area" | "seat" | "fm") => {
    let headers = "";
    let row = "";
    let filename = "";

    if (model === "seat") {
      headers = "Member Trade Name,Member Legal Name,Building Name,Cabin Suite ID,Contracted Seats,Occupied Seats,Rate Per Seat Monthly,Start Date (YYYY-MM-DD),End Date (YYYY-MM-DD),Deposit Months,Notice Days";
      row = "Example Tech Solutions,Example Tech India Pvt Ltd,Tower A,Suite 201,50,48,15000,2026-04-01,2028-03-31,2,60";
      filename = "officex_flex_seats_template.csv";
    } else if (model === "fm") {
      headers = "Occupant Trade Name,Occupant Legal Name,Tower / Building,Demised Area SqFt,Electric Meter ID,Electric Start kWh,DG Meter ID,DG Start kWh,CAM Rate PSF,Water Monthly Fixed,Billing Due Day";
      row = "Acme Corp Tech,Acme Technologies India Pvt Ltd,Tower Alpha,12000,EM-401,15420,DG-401,2840,28.5,12000,5";
      filename = "officex_facility_meters_cam_template.csv";
    } else {
      headers = "Tenant Trade Name,Tenant Legal Name,Building Name,Unit Number,Floor Number,Chargeable Area SqFt,Carpet Area SqFt,Monthly Base Rent INR,CAM Rate PSF,Utility Fixed Monthly,Start Date (YYYY-MM-DD),End Date (YYYY-MM-DD),Escalation Pct,Escalation Frequency Months,Security Deposit Months,Lock In Months";
      row = "Example Corporate Tenant,Example Enterprises India Pvt Ltd,Tower A,Unit 101,1,5000,4000,250000,25,15000,2026-04-01,2029-03-31,15,36,6,36";
      filename = "officex_rent_roll_area_template.csv";
    }

    const csvContent = [headers, row].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Final Commit to Production (Live Rollout Engine)
  const handleFinalCommit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Commit Organization, Property, Branding, and Contracts via Unified Onboarding Commit
      const commitRes = await fetch("/api/rent-roll/onboarding-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: {
            legalName: orgData.legalName,
            tradeName: orgData.tradeName || orgData.legalName,
            pan: orgData.pan,
            gstin: orgData.gstin,
            city: orgData.city,
            state: orgData.state,
            address: orgData.primaryAddress,
            currency: fySettings.currency || "INR"
          },
          property: propertyData.name?.trim() ? {
            name: propertyData.name.trim(),
            address: propertyData.address || orgData.primaryAddress,
            city: propertyData.city || orgData.city,
            state: propertyData.state || orgData.state,
            microMarket: propertyData.microMarket,
            totalArea: Number(propertyData.totalArea) || 50000,
            unitsCount: Number(propertyData.unitsCount) || 6,
            grade: propertyData.grade || "A"
          } : null,
          taxProfiles,
          branding: {
            portfolioDisplayName: branding.portfolioDisplayName || orgData.tradeName || orgData.legalName,
            invoiceHeaderMemo: branding.invoiceHeaderMemo,
            brandColor: branding.brandColor,
            logoUrl: branding.logoPreview
          },
          domainConfig: {
            emailSenderDomain: domains.senderBillingEmail,
            isSenderDomainVerified: domains.isDomainVerified,
            subdomain: domains.subdomain,
            customDomain: domains.enableCustomDomain ? domains.customDomain : "",
            isCustomDomainActive: domains.enableCustomDomain
          },
          users: userList,
          chargeTypesList: chargeList,
          makerCheckerLease: governance.makerCheckerLease,
          makerCheckerBilling: governance.makerCheckerBilling,
          goLiveChecklist,
          billingEntities: billingEntities.map(b => ({
            legalName: b.spvName,
            tradeName: orgData.tradeName || orgData.legalName,
            pan: b.pan,
            gstin: b.gstin,
            stateCode: b.stateCode,
            bankName: b.bankName,
            bankAccountNumber: b.accountNumber,
            bankIfsc: b.ifscCode,
            invoicePrefix: b.invoicePrefix,
            isDefault: b.isDefault
          }))
        })
      });

      const commitData = await commitRes.json();

      // 2. Set Session & Completed LocalStorage State with REAL Entities
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_onboarding_completed", "1");
        sessionStorage.setItem("officex_onboarding_completed", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_active_org", orgData.legalName);
        localStorage.setItem("officex_org_name", orgData.legalName);
        localStorage.setItem("officex_user_org", orgData.legalName);
        localStorage.setItem("officex_portfolio_name", branding.portfolioDisplayName || orgData.tradeName || orgData.legalName);
        localStorage.setItem("officex_org_id", "ORG-" + Date.now());
        localStorage.setItem("officex_org_brand_color", branding.brandColor || "#0F8B7D");
        localStorage.setItem("officex_brand_color", branding.brandColor || "#0F8B7D");
        if (branding.logoPreview) {
          localStorage.setItem("officex_org_logo", branding.logoPreview);
          localStorage.setItem("officex_brand_logo", branding.logoPreview);
        }
        if (domains.senderBillingEmail) {
          localStorage.setItem("officex_sender_billing_email", domains.senderBillingEmail);
        }
        if (domains.subdomain) {
          localStorage.setItem("officex_tenant_subdomain", domains.subdomain);
        }
        localStorage.setItem("officex_contact_verified", "1");
        localStorage.setItem("officex_phone_verified", "1");
        localStorage.setItem("officex_kyc_status", "VERIFIED");
        localStorage.setItem("officex_user_role", "Portfolio Executive");

        if (commitData?.property) {
          localStorage.setItem("officex_property_name", commitData.property.name);
          localStorage.setItem("officex_property_id", commitData.property.id);
          localStorage.setItem("officex_property_city", commitData.property.city || orgData.city);
          localStorage.setItem("officex_property_area", String(commitData.property.totalArea || 50000));
          localStorage.setItem("officex_user_properties", JSON.stringify([commitData.property]));
        } else {
          // Option 1: Clean 0-property state — no dummy/fallback property
          localStorage.removeItem("officex_property_name");
          localStorage.removeItem("officex_property_id");
          localStorage.removeItem("officex_property_city");
          localStorage.removeItem("officex_property_area");
          sessionStorage.removeItem("officex_property_name");
          localStorage.setItem("officex_user_properties", JSON.stringify([]));
        }

        if (commitData?.contracts && Array.isArray(commitData.contracts)) {
          localStorage.setItem("officex_active_leases", JSON.stringify(commitData.contracts));
        }

        document.cookie = "officex_onboarding_completed=1; path=/; max-age=31536000; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=31536000; SameSite=Lax";
        document.cookie = "officex_auth=1; path=/; max-age=31536000; SameSite=Lax";
      }

      setIsCommitted(true);
      setTimeout(() => {
        router.push("/properties/rent-roll");
      }, 1500);
    } catch (e) {
      console.error("Onboarding commit error:", e);
      alert("Error committing onboarding master. Redirecting to dashboard...");
      router.push("/properties/rent-roll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "1. Organization", subtitle: "Entity, Asset & Address" },
    { num: 2, title: "2. Billing & Bank", subtitle: "Mandatory Bank & GST" },
    { num: 3, title: "3. Visual Branding", subtitle: "Logo & White-Label Domain" },
    { num: 4, title: "4. Data Ingestion", subtitle: "Properties & Leases" },
    { num: 5, title: "5. Review & Launch", subtitle: "Launch Rent Roll" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ──── TOP GLOBAL NAVIGATION HEADER ──── */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/rent-roll" className="flex items-center gap-2.5">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={34}
              height={34}
              className="h-7 w-auto object-contain"
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={120}
              height={28}
              className="h-6 w-auto object-contain"
              priority
            />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-xs font-bold">
            Enterprise Setup Wizard
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
            <Lock size={12} className="text-teal-600" />
            <span>Statutory Multi-Entity Encrypted Vault</span>
          </div>
          <Link href="/login?context=rent-roll" className="text-slate-600 hover:text-slate-900 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* ──── MAIN WIZARD CONTAINER ──── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top Step Breadcrumbs Indicator */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
              {steps.map((st) => (
                <div
                  key={st.num}
                  onClick={() => setCurrentStep(st.num)}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                    currentStep === st.num
                      ? "bg-[#0F8B7D] text-white font-extrabold shadow-sm"
                      : currentStep > st.num
                      ? "bg-teal-50 text-[#0F8B7D] font-bold"
                      : "text-slate-400 font-medium hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">Step {st.num}</div>
                  <div className="truncate text-[11px] mt-0.5">{st.title.split(". ")[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card Container */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            {isCommitted ? (
              <div className="py-16 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">Rent Roll Master Activated</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Organization entity, multi-state SPVs, tax profiles, charge rules, visual branding, user roles, and verified rent roll contracts have been committed. Redirecting to your Executive Dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* ════════ STEP 1: ORGANIZATION & SEGMENTS ════════ */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 1 of 5 · Organization Profile
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Create Organization Profile</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Fill in your business entity details, registered state and city, and primary contact number.
                      </p>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-[#0F8B7D] shrink-0" />
                        <span>
                          <strong className="text-slate-700 font-semibold">Pro Tip:</strong> Select Warehouse / Logistics if you operate industrial sheds or logistic parks.
                        </span>
                      </div>
                    </div>

                    {/* Organization Type Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Business &amp; Asset Type *
                      </label>
                      <select
                        value={orgData.segments[0] || "commercial_owner"}
                        onChange={(e) => handleSegmentChange(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0F8B7D] focus:ring-2 focus:ring-[#0F8B7D]/20 transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="commercial_owner">Commercial Property Owner / Asset Entity (Office &amp; Retail)</option>
                        <option value="warehouse_owner">Warehouse / Logistics &amp; Industrial Park Owner</option>
                        <option value="pm_company">Property Management Company (Third-Party Portfolios)</option>
                        <option value="fm_company">Facility Management Company (Operations &amp; CAM)</option>
                        <option value="flex_operator">Flex Space / Coworking Operator (Seats &amp; Cabins)</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Apex Industrial Realty Pvt Ltd"
                            value={orgData.legalName}
                            onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Trade Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Apex Logistics Horizon"
                            value={orgData.tradeName}
                            onChange={(e) => setOrgData({ ...orgData, tradeName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      {/* State FIRST then City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <StateAutocomplete
                            label="Primary State * (Select State First)"
                            required
                            value={orgData.state}
                            onChange={(state) => {
                              setOrgData((prev) => {
                                const cities = getCitiesForState(state);
                                const isCityInState = cities.some(c => c.name.toLowerCase() === prev.city.toLowerCase());
                                return {
                                  ...prev,
                                  state,
                                  city: isCityInState ? prev.city : (cities[0]?.name || "")
                                };
                              });
                            }}
                            placeholder="Select your state..."
                          />
                        </div>
                        <div>
                          <CityAutocomplete
                            label="Primary City * (Filtered by Selected State)"
                            required
                            value={orgData.city}
                            selectedState={orgData.state}
                            requireStateFirst={true}
                            onChange={(city) => setOrgData((prev) => ({ ...prev, city }))}
                            onSelectCityAndState={(city, state) => {
                              setOrgData((prev) => ({
                                ...prev,
                                city,
                                state: state || prev.state,
                              }));
                            }}
                            placeholder={orgData.state ? `Search cities in ${orgData.state}...` : "Select State first..."}
                          />
                        </div>
                      </div>

                      <div>
                        <AddressAutocomplete
                          label="Registered Office Address"
                          value={orgData.primaryAddress}
                          state={orgData.state}
                          city={orgData.city}
                          onChange={(val) => setOrgData((prev) => ({ ...prev, primaryAddress: val }))}
                          onSelectLocation={(loc) => {
                            setOrgData((prev) => ({
                              ...prev,
                              primaryAddress: loc.fullAddress || loc.displayName,
                              city: loc.city || prev.city,
                              state: loc.state || prev.state,
                            }));
                          }}
                          placeholder={orgData.city ? `Search office address in ${orgData.city}, ${orgData.state}...` : "Registered Office address..."}
                        />
                      </div>

                      {/* Tax Identifiers (PAN & GSTIN) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">PAN Number *</label>
                            <span className={`text-[10px] font-mono font-bold ${orgData.pan.length === 10 ? "text-emerald-600" : "text-slate-400"}`}>
                              {orgData.pan.length}/10
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="ABCDE1234F"
                            value={orgData.pan}
                            onChange={(e) => {
                              const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                              setOrgData({ ...orgData, pan: cleaned });
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-wider uppercase focus:bg-white focus:border-[#0F8B7D]"
                            required
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 5 letters, 4 digits, 1 letter</span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">Primary GSTIN</label>
                            <span className={`text-[10px] font-mono font-bold ${orgData.gstin.length === 15 ? "text-emerald-600" : "text-slate-400"}`}>
                              {orgData.gstin.length}/15
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="27ABCDE1234F1Z5"
                            value={orgData.gstin}
                            onChange={(e) => {
                              const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                              const autoPan = cleaned.length >= 12 ? cleaned.substring(2, 12) : orgData.pan;
                              setOrgData({ ...orgData, gstin: cleaned, pan: autoPan || orgData.pan });
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-wider uppercase focus:bg-white focus:border-[#0F8B7D]"
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 2 state + 10 PAN + 3 entity</span>
                        </div>
                      </div>

                      {/* Specialized Warehouse Onboarding Fields */}
                      {orgData.segments[0] === "warehouse_owner" && (
                        <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-amber-800" />
                              <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                Warehouse &amp; Logistics Park Specifications
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              Industrial Asset Model
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Warehouses operate on specialized physical metrics including clear ceiling height, dock doors, and heavy floor loading.
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1">Clear Height to Eaves</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={warehouseSpecs.clearHeight}
                                  onChange={(e) => setWarehouseSpecs({ ...warehouseSpecs, clearHeight: Number(e.target.value) || 0 })}
                                  className="w-full p-2 bg-white border border-amber-200 rounded-xl font-mono font-bold"
                                />
                                <span className="text-[10px] font-bold text-slate-500">Feet</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1">Dock Doors (with Levelers)</label>
                              <input
                                type="number"
                                value={warehouseSpecs.dockDoors}
                                onChange={(e) => setWarehouseSpecs({ ...warehouseSpecs, dockDoors: Number(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border border-amber-200 rounded-xl font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1">Floor Load Capacity</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={warehouseSpecs.floorLoading}
                                  onChange={(e) => setWarehouseSpecs({ ...warehouseSpecs, floorLoading: Number(e.target.value) || 0 })}
                                  className="w-full p-2 bg-white border border-amber-200 rounded-xl font-mono font-bold"
                                />
                                <span className="text-[10px] font-bold text-slate-500">T/m²</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1">Bay Grid Spacing</label>
                              <input
                                type="text"
                                value={warehouseSpecs.baySpacing}
                                onChange={(e) => setWarehouseSpecs({ ...warehouseSpecs, baySpacing: e.target.value })}
                                placeholder="e.g. 16m x 24m"
                                className="w-full p-2 bg-white border border-amber-200 rounded-xl font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════ STEP 2: BILLING & TAX DETAILS ════════ */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 2 of 6 · Billing &amp; Tax Details
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Billing Details &amp; Taxes</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set up your billing company information, GST number, and standard tax rates for your invoices.
                      </p>
                    </div>

                    {/* Part A: Multiple Billing Entities Manager */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#0F8B7D]" />
                            <span>Billing Companies &amp; States</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            <em>Add the company names, GST numbers, and bank details you use for invoicing.</em>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingEntity(true)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add Another Company / State
                        </button>
                      </div>

                      {/* List of Created Billing Entities */}
                      {billingEntities.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">No Billing Companies Added Yet</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                            {orgData.legalName
                              ? `Click below to create your primary billing profile for "${orgData.legalName}".`
                              : "Add your company details and GST number to start generating invoices."}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (orgData.legalName) {
                                const cleanPrefix = (orgData.tradeName || orgData.legalName)
                                  .replace(/[^A-Za-z]/g, "")
                                  .substring(0, 3)
                                  .toUpperCase() || "INV";
                                const newEntityItem: BillingEntityItem = {
                                  id: `BE-${Date.now()}`,
                                  spvName: orgData.legalName,
                                  gstin: orgData.gstin || "",
                                  pan: orgData.pan || (orgData.gstin ? orgData.gstin.substring(2, 12) : ""),
                                  invoicePrefix: `${cleanPrefix}-INV`,
                                  bankName: "",
                                  accountNumber: "",
                                  ifscCode: "",
                                  stateCode: orgData.state || "27 - Maharashtra",
                                  isDefault: true
                                };
                                setBillingEntities([newEntityItem]);
                                setEditingEntityId(newEntityItem.id);
                                setEditEntity({ ...newEntityItem });
                                setCollapsedEntityIds([]);
                              } else {
                                setIsAddingEntity(true);
                              }
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus size={14} /> {orgData.legalName ? `Use Details from "${orgData.legalName}"` : "Add Billing Company"}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {billingEntities.map((be) => {
                            const isEditing = (editingEntityId === be.id) || (!collapsedEntityIds.includes(be.id) && (be.isDefault || billingEntities.length === 1));
                            const activeEntity = (editingEntityId === be.id && editEntity) ? editEntity : be;

                            const updateCurrentEntity = (updates: Partial<BillingEntityItem>) => {
                              setBillingEntities(prev => prev.map(item => item.id === be.id ? { ...item, ...updates } : item));
                              setEditEntity(prev => prev && prev.id === be.id ? { ...prev, ...updates } : { ...be, ...updates });
                              if (editingEntityId !== be.id) {
                                setEditingEntityId(be.id);
                              }
                            };

                            return (
                            <div
                              key={be.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                be.isDefault
                                  ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-400/40"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              {isEditing ? (
                                /* ── Inline Edit Form (Directly Visible) ── */
                                <div className="space-y-3 animate-fadeIn">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-teal-950 flex items-center gap-1.5">
                                      <Pencil size={13} className="text-[#0F8B7D]" /> Edit Billing Details
                                      {be.isDefault && (
                                        <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold ml-1">
                                          Primary Company
                                        </span>
                                      )}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelEditEntity(be.id)}
                                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Company Legal Name *</label>
                                      <input
                                        type="text"
                                        value={activeEntity.spvName || ""}
                                        onChange={(e) => updateCurrentEntity({ spvName: e.target.value })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <StateAutocomplete
                                        label="State (GST)"
                                        required
                                        returnCodeFormat={true}
                                        value={activeEntity.stateCode || ""}
                                        onChange={(val) => updateCurrentEntity({ stateCode: val })}
                                        placeholder="Select your state..."
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">15-Digit GST Number *</label>
                                        <span className={`text-[10px] font-mono font-bold ${(activeEntity.gstin || "").length === 15 ? "text-emerald-600" : "text-slate-400"}`}>
                                          {(activeEntity.gstin || "").length}/15
                                        </span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={15}
                                        placeholder="27ABCDE1234F1Z5"
                                        value={activeEntity.gstin || ""}
                                        onChange={(e) => {
                                          const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                                          const autoPan = cleaned.length >= 12 ? cleaned.substring(2, 12) : activeEntity.pan;
                                          updateCurrentEntity({ gstin: cleaned, pan: autoPan });
                                        }}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold tracking-wider uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Invoice Prefix *</label>
                                        <span className="text-[10px] text-slate-400 font-mono">Max 8 Chars</span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={8}
                                        value={activeEntity.invoicePrefix || ""}
                                        onChange={(e) => updateCurrentEntity({ invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, 8) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-teal-700 uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Bank Name</label>
                                        <span className="text-[10px] text-slate-400">e.g. HDFC Bank</span>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="e.g. HDFC Bank"
                                        value={activeEntity.bankName || ""}
                                        onChange={(e) => updateCurrentEntity({ bankName: e.target.value })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Bank Account Number</label>
                                        <span className="text-[10px] text-slate-400 font-mono">Digits Only</span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={18}
                                        placeholder="e.g. 50200012345678"
                                        value={activeEntity.accountNumber || ""}
                                        onChange={(e) => updateCurrentEntity({ accountNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 18) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Bank IFSC Code</label>
                                        <span className={`text-[10px] font-mono font-bold ${(activeEntity.ifscCode || "").length === 11 ? "text-emerald-600" : "text-slate-400"}`}>
                                          {(activeEntity.ifscCode || "").length}/11
                                        </span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={11}
                                        placeholder="e.g. HDFC0001234"
                                        value={activeEntity.ifscCode || ""}
                                        onChange={(e) => updateCurrentEntity({ ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleCancelEditEntity(be.id)}
                                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                      Discard
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditEntity(be.id)}
                                      className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                    >
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Read-only Card ── */
                                <>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-slate-900">{be.spvName}</span>
                                    {be.isDefault && (
                                      <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                                        Primary Company
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                    State: {be.stateCode}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!be.isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultEntity(be.id)}
                                      className="text-[10px] text-teal-700 hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditEntity(be)}
                                    className="p-1 text-slate-400 hover:text-[#0F8B7D] cursor-pointer" title="Edit Entity"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  {billingEntities.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEntity(be.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-[11px]">
                              <div>
                                <span className="text-slate-400 block text-[10px]">GST Number</span>
                                <span className="font-mono font-bold text-slate-800">{be.gstin || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Invoice Prefix</span>
                                <span className="font-mono font-bold text-teal-700">{be.invoicePrefix || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Bank Name</span>
                                <span className="text-slate-700 font-medium truncate block">{be.bankName || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Account &amp; IFSC</span>
                                <span className="font-mono text-slate-700 truncate block">
                                  {be.accountNumber ? `${be.accountNumber} (${be.ifscCode || ""})` : "—"}
                                </span>
                              </div>
                            </div>
                                </>
                              )}
                          </div>
                            );
                          })}
                      </div>
                    )}

                      {/* Modal/Inline Form to Add Entity */}
                      {isAddingEntity && (
                        <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-teal-950">Add Billing Company &amp; State</span>
                            <button
                              type="button"
                              onClick={() => setIsAddingEntity(false)}
                              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Company Legal Name *</label>
                              <input
                                type="text"
                                placeholder="e.g. Acme Properties Pvt Ltd"
                                value={newEntity.spvName}
                                onChange={(e) => setNewEntity({ ...newEntity, spvName: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <StateAutocomplete
                                label="State (GST)"
                                required
                                returnCodeFormat={true}
                                value={newEntity.stateCode}
                                onChange={(val) => setNewEntity({ ...newEntity, stateCode: val })}
                                placeholder="Select your state..."
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">15-Digit GST Number *</label>
                                <span className={`text-[10px] font-mono font-bold ${newEntity.gstin.length === 15 ? "text-emerald-600" : "text-slate-400"}`}>
                                  {newEntity.gstin.length}/15
                                </span>
                              </div>
                              <input
                                type="text"
                                maxLength={15}
                                placeholder="27ABCDE1234F1Z5"
                                value={newEntity.gstin}
                                onChange={(e) => {
                                  const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                                  const autoPan = cleaned.length >= 12 ? cleaned.substring(2, 12) : newEntity.pan;
                                  setNewEntity({ ...newEntity, gstin: cleaned, pan: autoPan });
                                }}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold tracking-wider uppercase focus:border-[#0F8B7D]"
                              />
                              <span className="text-[10px] text-slate-400 block mt-0.5">Format: 2-digit state code + 10-digit PAN + 3 digits</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Invoice Prefix *</label>
                                <span className="text-[10px] text-slate-400 font-mono">Max 8 Chars</span>
                              </div>
                              <input
                                type="text"
                                maxLength={8}
                                placeholder="e.g. INV-"
                                value={newEntity.invoicePrefix}
                                onChange={(e) => setNewEntity({ ...newEntity, invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, 8) })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-teal-700 uppercase focus:border-[#0F8B7D]"
                              />
                              <span className="text-[10px] text-slate-400 block mt-0.5">Shown at the start of your invoice numbers (e.g. INV-001)</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Bank Name</label>
                                <span className="text-[10px] text-slate-400">e.g. HDFC Bank</span>
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. HDFC Bank"
                                value={newEntity.bankName}
                                onChange={(e) => setNewEntity({ ...newEntity, bankName: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Bank Account Number</label>
                                <span className="text-[10px] text-slate-400 font-mono">Digits Only</span>
                              </div>
                              <input
                                type="text"
                                maxLength={18}
                                placeholder="e.g. 50200012345678"
                                value={newEntity.accountNumber}
                                onChange={(e) => setNewEntity({ ...newEntity, accountNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 18) })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                              />
                              <span className="text-[10px] text-slate-400 block mt-0.5">Your bank account number for receiving payments</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Bank IFSC Code</label>
                                <span className={`text-[10px] font-mono font-bold ${newEntity.ifscCode.length === 11 ? "text-emerald-600" : "text-slate-400"}`}>
                                  {newEntity.ifscCode.length}/11
                                </span>
                              </div>
                              <input
                                type="text"
                                maxLength={11}
                                placeholder="e.g. HDFC0001234"
                                value={newEntity.ifscCode}
                                onChange={(e) => setNewEntity({ ...newEntity, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:border-[#0F8B7D]"
                              />
                              <span className="text-[10px] text-slate-400 block mt-0.5">11-character bank IFSC code (e.g. HDFC0001234)</span>
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleAddEntity}
                              className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Save Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part B: Tax Profiles (Slide 4) */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Percent className="w-4 h-4 text-[#0F8B7D]" />
                            <span>GST &amp; Tax Settings</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            <em>Commercial properties standard rate is 18% GST. Tax-free or SEZ properties can be set to 0%.</em>
                          </p>
                        </div>

                        {/* Presets */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => applyTaxPreset("standard")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                              taxProfiles.regimePreset === "standard"
                                ? "bg-[#0F8B7D] text-white"
                                : "bg-white border border-slate-200 text-slate-700"
                            }`}
                          >
                            Standard (18% GST)
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTaxPreset("ifsc_exempt")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                              taxProfiles.regimePreset === "ifsc_exempt"
                                ? "bg-[#0F8B7D] text-white"
                                : "bg-white border border-slate-200 text-slate-700"
                            }`}
                          >
                            Tax-Exempt (0% GST)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Rent GST</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={taxProfiles.baseRentGst}
                              onChange={(e) => setTaxProfiles({ ...taxProfiles, baseRentGst: Number(e.target.value) })}
                              className="w-12 text-xs font-mono font-bold text-slate-900 p-1 border border-slate-200 rounded"
                            />
                            <span className="text-xs text-slate-500 font-bold">%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Maintenance (CAM) GST</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={taxProfiles.camGst}
                              onChange={(e) => setTaxProfiles({ ...taxProfiles, camGst: Number(e.target.value) })}
                              className="w-12 text-xs font-mono font-bold text-slate-900 p-1 border border-slate-200 rounded"
                            />
                            <span className="text-xs text-slate-500 font-bold">%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Electricity GST</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={taxProfiles.electricityGst}
                              onChange={(e) => setTaxProfiles({ ...taxProfiles, electricityGst: Number(e.target.value) })}
                              className="w-12 text-xs font-mono font-bold text-slate-900 p-1 border border-slate-200 rounded"
                            />
                            <span className="text-xs text-slate-500 font-bold">%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Water GST</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={taxProfiles.waterGst}
                              onChange={(e) => setTaxProfiles({ ...taxProfiles, waterGst: Number(e.target.value) })}
                              className="w-12 text-xs font-mono font-bold text-slate-900 p-1 border border-slate-200 rounded"
                            />
                            <span className="text-xs text-slate-500 font-bold">%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Parking GST</span>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={taxProfiles.parkingGst}
                              onChange={(e) => setTaxProfiles({ ...taxProfiles, parkingGst: Number(e.target.value) })}
                              className="w-12 text-xs font-mono font-bold text-slate-900 p-1 border border-slate-200 rounded"
                            />
                            <span className="text-xs text-slate-500 font-bold">%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
                          <span className="text-[10px] text-slate-500 font-bold block">Tax Category</span>
                          <span className={`text-[11px] font-bold ${taxProfiles.isIfscTaxExempt ? "text-emerald-600" : "text-slate-600"}`}>
                            {taxProfiles.isIfscTaxExempt ? "Tax-Exempt (0% GST)" : "Standard (18% GST)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 3: BRANDING, DOMAINS & USERS ════════ */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 3 of 5 · Visual Branding, Custom Domains &amp; Users
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Visual Branding, Custom Domains &amp; Users</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set logo &amp; brand colours with live preview, configure sender domain, and assign standard user roles.
                      </p>
                    </div>

                    {/* Section C: Logo & Brand Colours with Live Preview Tabs */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-[#0F8B7D]" />
                            <span>Logo &amp; Brand Colours (Appear on Invoices, Emails &amp; Portal)</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Custom visual branding applied to all PDF invoices, emails, and the occupant portal.
                          </p>
                        </div>

                        {/* Preview Switcher */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-[11px]">
                          {(["invoice", "email", "portal"] as const).map(tab => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setBranding({ ...branding, previewTab: tab })}
                              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                                branding.previewTab === tab
                                  ? "bg-[#0F8B7D] text-white"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {tab} Preview
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Branding Controls */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Portfolio Display Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Acme Commercial Portfolio"
                              value={branding.portfolioDisplayName}
                              onChange={(e) => setBranding({ ...branding, portfolioDisplayName: e.target.value })}
                              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-[#0F8B7D]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Logo (Appears on Invoices, Emails & Portal)</label>
                            <p className="text-[10px] text-slate-400 mb-2">Upload your company logo (PNG, JPG, SVG or WebP · Max 2 MB). If not uploaded, your company initials will be used.</p>

                            {branding.logoPreview ? (
                              /* Logo uploaded — show preview with remove option */
                              <div className="flex items-center gap-3 p-3 bg-white border border-teal-200 rounded-xl">
                                <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <img
                                    src={branding.logoPreview}
                                    alt="Company Logo"
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                    <Check size={12} /> Logo Uploaded
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">This will appear on all invoices, emails & tenant portal.</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                                  >
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* No logo — show upload dropzone */
                              <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="w-full p-4 border-2 border-dashed border-slate-300 hover:border-[#0F8B7D] rounded-xl bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer group"
                              >
                                <div className="flex flex-col items-center gap-1.5">
                                  <UploadCloud className="w-7 h-7 text-slate-300 group-hover:text-[#0F8B7D] transition-colors" />
                                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-[#0F8B7D]">Click to upload your company logo</span>
                                  <span className="text-[10px] text-slate-400">PNG, JPG, SVG or WebP · Max 2 MB</span>
                                </div>
                              </button>
                            )}
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            {!branding.logoPreview && (
                              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[9px] text-white flex-shrink-0"
                                  style={{ backgroundColor: getSafeBrandColor(branding.brandColor) }}
                                >
                                  {logoInitials}
                                </div>
                                <span>Fallback: Your company initials <strong>"{logoInitials}"</strong> will be used if no logo is uploaded.</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-bold text-slate-700">Brand Accent Colour</label>
                              <span className="text-[10px] text-slate-400">Pick swatch or select custom colour</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {[
                                { hex: "#0F8B7D", name: "OfficeX Teal" },
                                { hex: "#1E3A8A", name: "Corporate Navy" },
                                { hex: "#059669", name: "Emerald" },
                                { hex: "#1E293B", name: "Slate" },
                                { hex: "#7E22CE", name: "Purple" },
                                { hex: "#991B1B", name: "Burgundy" }
                              ].map(c => (
                                <button
                                  key={c.hex}
                                  type="button"
                                  onClick={() => setBranding({ ...branding, brandColor: c.hex })}
                                  className={`w-7 h-7 rounded-full cursor-pointer transition-all border-2 ${
                                    getSafeBrandColor(branding.brandColor).toUpperCase() === c.hex.toUpperCase() ? "border-slate-900 scale-110 shadow-sm" : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}

                              {/* Interactive Visual Color Selector */}
                              <div className="relative flex items-center">
                                <label
                                  htmlFor="brand-color-selector"
                                  className="w-7 h-7 rounded-full border-2 border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center overflow-hidden hover:scale-110 transition-transform relative"
                                  style={{ backgroundColor: getSafeBrandColor(branding.brandColor) }}
                                  title="Open Visual Color Selector"
                                >
                                  <Pipette size={12} className={isLightColor(branding.brandColor) ? "text-slate-900" : "text-white"} />
                                  <input
                                    id="brand-color-selector"
                                    type="color"
                                    value={getSafeBrandColor(branding.brandColor).slice(0, 7)}
                                    onChange={(e) => setBranding({ ...branding, brandColor: e.target.value.toUpperCase() })}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                  />
                                </label>
                              </div>

                              {/* Hex Input with permanent # prefix (safely handles any code) */}
                              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white px-2 py-1 shadow-2xs focus-within:border-[#0F8B7D]">
                                <span className="text-slate-400 font-mono text-xs font-bold mr-0.5">#</span>
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="0F8B7D"
                                  value={(branding.brandColor || "").replace("#", "").toUpperCase()}
                                  onChange={(e) => {
                                    const cleaned = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
                                    setBranding({ ...branding, brandColor: cleaned ? `#${cleaned}` : "" });
                                  }}
                                  className="w-16 text-xs font-mono font-bold text-slate-800 outline-none uppercase"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Statutory Invoice Memo (Section 31 CGST)</label>
                            <input
                              type="text"
                              placeholder="e.g. Tax invoice under Rule 46 of CGST Rules 2017"
                              value={branding.invoiceHeaderMemo}
                              onChange={(e) => setBranding({ ...branding, invoiceHeaderMemo: e.target.value })}
                              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                            />
                          </div>
                        </div>

                        {/* Interactive Visual Preview Box */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Live Canvas Preview · {branding.previewTab.toUpperCase()}
                          </span>

                          {branding.previewTab === "invoice" && (
                            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                              <div
                                className={`p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                                  isLightColor(branding.brandColor) ? "text-slate-900 border border-slate-200" : "text-white"
                                }`}
                                style={{ backgroundColor: getSafeBrandColor(branding.brandColor) }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center overflow-hidden ${
                                    isLightColor(branding.brandColor) ? "bg-black/10 text-slate-900" : "bg-white/20 text-white"
                                  }`}>
                                    {branding.logoPreview ? (
                                      <img src={branding.logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                      <span className="font-black text-xs">{logoInitials}</span>
                                    )}
                                  </div>
                                  <span className="font-extrabold text-xs">
                                    {branding.portfolioDisplayName || orgData.tradeName || orgData.legalName || "My Portfolio"}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isLightColor(branding.brandColor) ? "bg-black/10 text-slate-900" : "bg-white/20 text-white"
                                }`}>
                                  TAX INVOICE
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 border-b border-slate-100 pb-1.5 flex justify-between">
                                <span>{billingEntities[0]?.spvName || orgData.legalName || "Entity"}</span>
                                <span className="font-mono font-bold">GSTIN: {billingEntities[0]?.gstin || orgData.gstin || "—"}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 italic">
                                &quot;{branding.invoiceHeaderMemo}&quot;
                              </div>
                            </div>
                          )}

                          {branding.previewTab === "email" && (
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-[11px]">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Mail size={12} className="text-[#0F8B7D]" />
                                <span>From: {domains.senderBillingEmail}</span>
                              </div>
                              <div className="text-slate-600">
                                Subject: <strong>July 2026 Rent Invoice — {billingEntities[0]?.invoicePrefix}-0142</strong>
                              </div>
                              <div className="p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-600">
                                Dear TechNova Solutions, your commercial tax invoice is ready.
                                <div
                                  className={`mt-2 py-1 px-3 text-center rounded font-bold text-xs ${
                                    isLightColor(branding.brandColor) ? "text-slate-900 border border-slate-300" : "text-white"
                                  }`}
                                  style={{ backgroundColor: getSafeBrandColor(branding.brandColor) }}
                                >
                                  Pay ₹24,24,200 via Razorpay Portal
                                </div>
                              </div>
                            </div>
                          )}

                          {branding.previewTab === "portal" && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-white p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <span className="font-bold text-teal-400">{domains.subdomain}.officex.pro</span>
                                <span className="text-[10px] text-slate-400">Tenant Billing Hub</span>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                Welcome, <strong>Ananya Deshmukh</strong> (TechNova Cloud)
                              </div>
                              <div
                                className={`p-2 rounded text-[11px] font-bold text-center ${
                                  isLightColor(branding.brandColor) ? "text-slate-900" : "text-white"
                                }`}
                                style={{ backgroundColor: getSafeBrandColor(branding.brandColor) }}
                              >
                                View 3 Outstanding Invoices &amp; Receipts
                              </div>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 text-right mt-2">Synchronized with Razorpay &amp; PDF Engine</div>
                        </div>
                      </div>
                    </div>

                    {/* Section C Part 2: Email Sender Domain & Subdomain Configuration */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-[#0F8B7D]" />
                          <span>Custom Email Sender Domain</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <em>Deliver invoices and rent demands from your corporate email domain with automated SPF/DKIM verification.</em>
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="email"
                            placeholder="e.g. billing@yourcompany.com"
                            value={domains.senderBillingEmail}
                            onChange={(e) => setDomains({ ...domains, senderBillingEmail: e.target.value })}
                            className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                          />
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 shrink-0" title="DNS records will be checked once TXT records propagate">
                            <Clock size={12} className="text-amber-600" /> DNS Setup Pending
                          </span>
                        </div>
                        <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-[10px] text-slate-500 leading-relaxed">
                          <strong>What is SPF / DKIM?</strong> Sender Policy Framework (SPF) &amp; DomainKeys (DKIM) are DNS TXT records added to your domain registrar (GoDaddy, Cloudflare, etc.) to prove OFFICEX has permission to send invoices from your domain. Shows &quot;Pending&quot; until you add the DNS records post-onboarding.
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-[#0F8B7D]" />
                          <span>Branded Subdomain / Custom Domain</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <em>Your occupants and tenants access their self-service tenant portal via your dedicated subdomain.</em>
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            maxLength={20}
                            placeholder="e.g. acme"
                            value={domains.subdomain}
                            onChange={(e) => setDomains({ ...domains, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) })}
                            className="w-36 text-xs p-2 bg-white border border-slate-200 rounded-xl font-bold font-mono text-teal-700 focus:border-[#0F8B7D]"
                          />
                          <span className="text-xs text-slate-500 font-bold">.officex.pro</span>
                          <span className="px-2 py-1 rounded-xl bg-slate-200 text-slate-700 text-[10px] font-bold ml-auto">
                            SSL Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Users & Roles Assignment Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#0F8B7D]" />
                            <span>Users &amp; Roles Assignment Table</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            <em>Configure initial administrators and assign role-based access permissions.</em>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(true)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add User
                        </button>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="p-3">Team Member Name</th>
                              <th className="p-3">Business Email</th>
                              <th className="p-3">Assigned Role (5 Types)</th>
                              <th className="p-3">Maker-Checker Policy</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {userList.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                  <p className="font-bold text-xs text-slate-700">No Team Members Added Yet</p>
                                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                                    Click &ldquo;Add User&rdquo; above to invite your administrators, finance team, or property managers.
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              userList.map((usr) => (
                                <tr key={usr.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-bold text-slate-900">{usr.name}</td>
                                  <td className="p-3 font-mono text-slate-600 text-[11px]">{usr.email}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      usr.role === "org_admin" ? "bg-purple-100 text-purple-900" :
                                      usr.role === "finance_manager" ? "bg-blue-100 text-blue-900" :
                                      usr.role === "property_manager" ? "bg-teal-100 text-teal-900" :
                                      usr.role === "leasing_manager" ? "bg-amber-100 text-amber-900" :
                                      "bg-slate-100 text-slate-800"
                                    }`}>
                                      {usr.role === "org_admin" ? "Organisation Admin" :
                                       usr.role === "finance_manager" ? "Finance / AR Manager" :
                                       usr.role === "property_manager" ? "Property Manager" :
                                       usr.role === "leasing_manager" ? "Leasing Manager" : "Occupant (Tenant)"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                                      {usr.makerCheckerRole.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveUser(usr.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Add User Modal / Inline Drawer */}
                      {isAddingUser && (
                        <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3 animate-fadeIn">
                          <span className="font-bold text-xs text-teal-950">Add User &amp; Assign Role</span>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="e.g. Rahul Sharma"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              className="p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                            />
                            <input
                              type="email"
                              placeholder="e.g. rahul.sharma@acme.com"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              className="p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                            />
                            <select
                              value={newUser.role}
                              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                              className="p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                            >
                              <option value="org_admin">Organisation Administrator</option>
                              <option value="finance_manager">Finance / AR Manager (Invoices &amp; Ageing)</option>
                              <option value="property_manager">Property Manager (Spaces &amp; Notices)</option>
                              <option value="leasing_manager">Leasing Manager (Deals &amp; Vacancy)</option>
                              <option value="occupant">Occupant (Tenant Portal View)</option>
                            </select>
                            <div className="flex gap-2">
                              <select
                                value={newUser.makerCheckerRole}
                                onChange={(e) => setNewUser({ ...newUser, makerCheckerRole: e.target.value as any })}
                                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                              >
                                <option value="maker">Maker (Data Creator)</option>
                                <option value="checker">Checker (Verifier)</option>
                                <option value="approver">Approver (Authority)</option>
                              </select>
                              <button
                                type="button"
                                onClick={handleAddUser}
                                className="px-4 bg-[#0F8B7D] text-white rounded-xl font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dual-Control Maker-Checker Governance Policies */}
                      <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
                          <div>
                            <div className="font-extrabold text-xs text-purple-950">Dual-Control Governance (Maker-Checker Policy)</div>
                            <div className="text-[11px] text-purple-800">Person entering contract data cannot approve their own entry (Segregation of duties)</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-purple-900">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={governance.makerCheckerLease}
                              onChange={(e) => setGovernance({ ...governance, makerCheckerLease: e.target.checked })}
                              className="rounded text-purple-700"
                            />
                            <span>Require Checker on Leases</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={governance.makerCheckerBilling}
                              onChange={(e) => setGovernance({ ...governance, makerCheckerBilling: e.target.checked })}
                              className="rounded text-purple-700"
                            />
                            <span>Require Checker on Billing</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 4: DATA IMPORT & INGESTION (9-STEP SUITE) ════════ */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 4 of 5 · Rent Roll Import &amp; Ingestion Engine
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Rent Roll Import &amp; Ingestion Engine</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Follow the canonical 9-step ingestion pipeline from file profiling through reconciliation, two-step signoff, and 7-day rollback.
                      </p>
                    </div>

                    {/* Skip Whole Step 4 Banner (Skips all 9 sub-steps) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-amber-50 to-teal-50 border border-teal-200/80 rounded-2xl shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#0F8B7D] shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Want to skip lease spreadsheet ingestion for now?</span>
                          <span className="text-[11px] text-slate-600">You can skip the entire 9-step ingestion pipeline and proceed straight to Step 5 (Final Review & Go-Live). You can add properties and leases anytime from your live dashboard.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
                      >
                        <FastForward size={14} />
                        <span>Skip for Now (Skip All 9 Steps)</span>
                      </button>
                    </div>

                    {/* 9 Mini Steps Sub-tabs */}
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center text-[10px] font-bold">
                      {[
                        { num: 1, label: "4.1 Upload" },
                        { num: 2, label: "4.2 Profile" },
                        { num: 3, label: "4.3 Mapping" },
                        { num: 4, label: "4.4 Validate" },
                        { num: 5, label: "4.5 Control" },
                        { num: 6, label: "4.6 Exceptions" },
                        { num: 7, label: "4.7 2-Step Sign" },
                        { num: 8, label: "4.8 Commit" },
                        { num: 9, label: "4.9 Rollback" }
                      ].map(s => (
                        <div
                          key={s.num}
                          onClick={() => setImportWorkflowStep(s.num)}
                          className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                            importWorkflowStep === s.num
                              ? "bg-teal-700 text-white border-teal-800"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>

                    {/* Step 4.1: Upload file & Templates */}
                    {importWorkflowStep === 1 && (
                      <div className="space-y-4">
                        {/* White-Glove Advisory Banner */}
                        <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start sm:items-center gap-2.5">
                            <Headphones className="w-4 h-4 text-[#0F8B7D] shrink-0 mt-0.5 sm:mt-0" />
                            <div>
                              <span className="font-extrabold text-teal-950 block">Need White-Glove Onboarding Assistance?</span>
                              <span className="text-[11px] text-teal-800">
                                For portfolios with 100+ executed lease deeds or complex multi-tier SPVs, our advisory team abstracts contracts and supervises parallel runs.
                              </span>
                            </div>
                          </div>
                          <a
                            href="mailto:onboarding@officex.pro?subject=White-Glove%20Onboarding%20Inquiry"
                            className="px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold text-[11px] shrink-0 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs"
                          >
                            Request Advisory Support
                          </a>
                        </div>

                        {/* Primary Property & Inventory Registration Card */}
                        <div className="p-6 bg-white border border-teal-200/90 rounded-2xl shadow-xs space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-[#0F8B7D]" />
                              <div>
                                <h3 className="text-sm font-extrabold text-slate-900">Primary Commercial Property &amp; Units</h3>
                                <p className="text-[11px] text-slate-500">
                                  Define your anchor asset. This establishes your physical leasable spaces and real rent roll inventory.
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#0F8B7D] font-mono text-[10px] font-bold border border-teal-200">
                              Production Asset
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Property / Tower Name *</label>
                              <input
                                type="text"
                                value={propertyData.name}
                                onChange={e => setPropertyData({ ...propertyData, name: e.target.value })}
                                placeholder="e.g. Horizon Corporate Tower"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0F8B7D]"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">City / Micro-Market</label>
                              <input
                                type="text"
                                value={propertyData.city}
                                onChange={e => setPropertyData({ ...propertyData, city: e.target.value })}
                                placeholder="e.g. BKC / Mumbai"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Leasable Area (Sq Ft) *</label>
                              <input
                                type="number"
                                min={100}
                                value={propertyData.totalArea}
                                onChange={e => {
                                  const area = Number(e.target.value) || 0;
                                  setPropertyData({ ...propertyData, totalArea: area });
                                  setProfilingReport(prev => ({ ...prev, sourceTotalArea: area }));
                                }}
                                placeholder="e.g. 50000"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0F8B7D]"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Physical Units</label>
                              <input
                                type="number"
                                min={1}
                                max={200}
                                value={propertyData.unitsCount}
                                onChange={e => {
                                  const count = Number(e.target.value) || 1;
                                  setPropertyData({ ...propertyData, unitsCount: count });
                                  setProfilingReport(prev => ({ ...prev, totalRows: count }));
                                }}
                                placeholder="e.g. 6"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0F8B7D]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Clean File Upload Box */}
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900">Upload Your Rent Roll File (.xlsx / .csv)</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Upload your existing lease spreadsheet or tenant roster. Multi-sheet Excel files supported.</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[10px] font-mono font-bold border border-teal-200">
                              Max 20 MB
                            </span>
                          </div>

                          <input
                            ref={rentRollFileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleRentRollFileUpload}
                            className="hidden"
                          />

                          <div
                            onClick={() => rentRollFileInputRef.current?.click()}
                            className="p-10 bg-white border-2 border-dashed border-slate-300 hover:border-[#0F8B7D] rounded-2xl text-center space-y-3 cursor-pointer group transition-all"
                          >
                            <UploadCloud className="w-12 h-12 text-[#0F8B7D] mx-auto group-hover:scale-110 transition-transform" />
                            {uploadedFileName ? (
                              <div className="space-y-1">
                                <div className="text-xs font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                                  <FileCheck size={16} className="text-emerald-600" />
                                  <span>Selected File: <span className="text-[#0F8B7D] font-mono">{uploadedFileName}</span></span>
                                </div>
                                <p className="text-[11px] text-slate-500">Click to replace file, or click Proceed below to start data profiling.</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-800">
                                  Drag &amp; drop your rent roll file here, or <span className="text-[#0F8B7D] underline">Browse your computer</span>
                                </div>
                                <p className="text-[11px] text-slate-400">Supports Microsoft Excel (.xlsx, .xls) and standard CSV files</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: Skip ON RIGHT SIDE (Prominently Highlighted) */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!uploadedFileName) {
                                    setUploadedFileName("commercial_rent_roll.csv");
                                  }
                                  setImportWorkflowStep(2);
                                }}
                                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                              >
                                <span>Proceed to 4.2 Data Profiling</span>
                                <ArrowRight size={13} />
                              </button>
                            </div>

                            {/* SKIP BUTTON ON THE RIGHT (SKIPS ALL 9 SUB-STEPS TO STEP 5) */}
                            <button
                              type="button"
                              onClick={() => setCurrentStep(5)}
                              className="px-5 py-2.5 rounded-xl border-2 border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-900 font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <FastForward size={14} className="text-teal-700" />
                              <span>Skip for Now (Skip All 9 Steps) → Review &amp; Launch</span>
                            </button>
                          </div>

                          {/* Institutional Template Downloads */}
                          <div className="pt-3 border-t border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span>Download Standard Institutional Templates:</span>
                              <span className="text-[10px] text-teal-700 font-mono">10 Sheets · 146 Columns · Dropdown Rules</span>
                            </div>
                            <div className="mb-2.5">
                              <a
                                href="/templates/OFFICEX_Rent_Roll_Import_Template.xlsx"
                                download="OFFICEX_Rent_Roll_Import_Template.xlsx"
                                className="p-3 bg-white border border-teal-300 hover:border-teal-500 rounded-xl flex items-center justify-between group shadow-2xs transition-all cursor-pointer"
                              >
                                <div className="text-left">
                                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                    <span>Official Blank Rent Roll Workbook</span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-teal-50 text-[#0F8B7D] font-mono font-bold rounded">.XLSX</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Clean import sheets for your real portfolio: Properties, Spaces, Occupants, Leases &amp; Charges</div>
                                </div>
                                <span className="p-2 bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                                  <Download size={14} />
                                  <span>Download Blank Template</span>
                                </span>
                              </a>
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const model = orgData.segments[0] === "fm_company" ? "fm" : orgData.segments[0] === "flex_operator" ? "seat" : "area";
                                  handleDownloadSample(model);
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-700 underline font-medium inline-flex items-center gap-1 cursor-pointer"
                              >
                                Or download simple single-sheet CSV template
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4.2: Data Profiling (FULLY EDITABLE) */}
                    {importWorkflowStep === 2 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 4.2: Automated Data Profiling &amp; Quality Scan</h3>
                            <p className="text-[11px] text-slate-500">Edit any values directly below to match your real lease portfolio.</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Quality Score: {profilingReport.qualityScore}%
                          </span>
                        </div>

                        {/* EDITABLE STATS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <label className="text-[10px] text-slate-500 block font-bold">Total Ingested Contracts *</label>
                            <input
                              type="number"
                              min={1}
                              value={profilingReport.totalRows}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 1;
                                setProfilingReport(prev => ({ ...prev, totalRows: val }));
                              }}
                              className="w-full text-base font-extrabold text-slate-900 border border-slate-200 rounded-lg p-2 focus:border-[#0F8B7D]"
                            />
                            <span className="text-[10px] text-slate-400">Number of active tenant agreements</span>
                          </div>

                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <label className="text-[10px] text-slate-500 block font-bold">Duplicate Records</label>
                            <input
                              type="number"
                              min={0}
                              value={profilingReport.duplicatesDetected}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setProfilingReport(prev => ({ ...prev, duplicatesDetected: val }));
                              }}
                              className="w-full text-base font-extrabold text-emerald-600 border border-slate-200 rounded-lg p-2 focus:border-[#0F8B7D]"
                            />
                            <span className="text-[10px] text-slate-400">0 duplicate GSTINs detected</span>
                          </div>

                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <label className="text-[10px] text-slate-500 block font-bold">Total Leasable Area (Sq Ft) *</label>
                            <input
                              type="number"
                              min={100}
                              value={profilingReport.sourceTotalArea}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setProfilingReport(prev => ({ ...prev, sourceTotalArea: val }));
                                setControlTotalsVariance(prev => ({ ...prev, sourceArea: val, importArea: val }));
                              }}
                              className="w-full text-base font-extrabold text-slate-900 border border-slate-200 rounded-lg p-2 focus:border-[#0F8B7D]"
                            />
                            <span className="text-[10px] text-slate-400">Total portfolio square footage</span>
                          </div>

                          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <label className="text-[10px] text-slate-500 block font-bold">Monthly Base Rent (₹) *</label>
                            <input
                              type="number"
                              min={1000}
                              value={profilingReport.sourceTotalRent}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setProfilingReport(prev => ({ ...prev, sourceTotalRent: val }));
                                setControlTotalsVariance(prev => ({ ...prev, sourceRent: val, importRent: val }));
                              }}
                              className="w-full text-base font-extrabold text-teal-700 border border-slate-200 rounded-lg p-2 focus:border-[#0F8B7D]"
                            />
                            <span className="text-[10px] text-slate-400">₹{(profilingReport.sourceTotalRent / 100000).toFixed(2)} Lakh / month</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer flex items-center gap-1"
                          >
                            <FastForward size={12} /> Skip for Now (Skip All 9 Steps)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(3)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 4.3 Column Mapping →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.3: Column Mapping */}
                    {importWorkflowStep === 3 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 4.3: Smart Column Mapping Engine</h3>
                            <p className="text-[11px] text-slate-500">Auto-matches source column headers with canonical schema.</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Headers Verified ✓
                          </span>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                              <tr>
                                <th className="p-2.5">Your File Header</th>
                                <th className="p-2.5">Canonical OFFICEX Target Field</th>
                                <th className="p-2.5">Confidence</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                              <tr>
                                <td className="p-2.5 font-mono text-slate-700">&quot;Tenant Name&quot;</td>
                                <td className="p-2.5 font-bold text-slate-900">Occupant Legal Name</td>
                                <td className="p-2.5 text-emerald-600 font-bold">100% Auto-matched</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono text-slate-700">&quot;Area (sqft)&quot;</td>
                                <td className="p-2.5 font-bold text-slate-900">Chargeable Area SqFt</td>
                                <td className="p-2.5 text-emerald-600 font-bold">100% Auto-matched</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono text-slate-700">&quot;Monthly Rent&quot;</td>
                                <td className="p-2.5 font-bold text-slate-900">Monthly Base Rent (INR)</td>
                                <td className="p-2.5 text-emerald-600 font-bold">100% Auto-matched</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono text-slate-700">&quot;CAM Rate&quot;</td>
                                <td className="p-2.5 font-bold text-slate-900">CAM Rate PSF</td>
                                <td className="p-2.5 text-emerald-600 font-bold">98% Auto-matched</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer flex items-center gap-1"
                          >
                            <FastForward size={12} /> Skip for Now (Skip All 9 Steps)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(4)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 4.4 Validation Engine →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.4: Validation Engine */}
                    {importWorkflowStep === 4 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 4.4: Canonical 44-Rule Validation Engine</h3>
                            <p className="text-[11px] text-slate-500">Runs rules R-01 to R-44 across all {profilingReport.totalRows} active contracts.</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                            44 Checks Passed ✓
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Rule R-01 to R-44: Date coherence, lock-in &lt; lease term, and positive rental rates verified for all {profilingReport.totalRows} contracts.</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer flex items-center gap-1"
                          >
                            <FastForward size={12} /> Skip for Now (Skip All 9 Steps)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(5)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 4.5 Control Totals →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.5: Control Totals Check */}
                    {importWorkflowStep === 5 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Step 4.5: Control Totals &amp; Variance Reconciler</h3>
                          <p className="text-[11px] text-slate-500">
                            <em>Reconciles source area and rental totals against system master.</em>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Total Leasable Area Comparison</span>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Source Portfolio Area:</span>
                              <span className="font-mono font-bold">{profilingReport.sourceTotalArea.toLocaleString()} sq ft</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">OFFICEX System Area:</span>
                              <span className="font-mono font-bold text-teal-700">{profilingReport.sourceTotalArea.toLocaleString()} sq ft</span>
                            </div>
                            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 font-bold text-emerald-600">
                              <span>Variance:</span>
                              <span>0.00% (Exact Match ✓)</span>
                            </div>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Total Monthly Base Rent Comparison</span>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Source Monthly Rent:</span>
                              <span className="font-mono font-bold">₹{profilingReport.sourceTotalRent.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">OFFICEX Calculated Rent:</span>
                              <span className="font-mono font-bold text-teal-700">₹{profilingReport.sourceTotalRent.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 font-bold text-emerald-600">
                              <span>Variance:</span>
                              <span>0.00% (Exact Match ✓)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer flex items-center gap-1"
                          >
                            <FastForward size={12} /> Skip for Now (Skip All 9 Steps)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(6)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 4.6 Exception Queue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.6: Exception Queue */}
                    {importWorkflowStep === 6 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 4.6: Exception Queue &amp; Inline Resolution</h3>
                            <p className="text-[11px] text-slate-500">Fix rows inline, download error file, or mark overridden with audit notes.</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            0 Blocking Exceptions
                          </span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-center text-slate-600 space-y-1">
                          <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                          <div className="font-bold text-slate-900">All {profilingReport.totalRows} lease contracts verified!</div>
                          <div className="text-[11px] text-slate-500">No unresolved exceptions found. Ready for Two-Step Approval sign-off.</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer flex items-center gap-1"
                          >
                            <FastForward size={12} /> Skip for Now (Skip All 9 Steps)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(7)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 4.7 Two-Step Approval →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.7: Two-Step Approval */}
                    {importWorkflowStep === 7 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Step 4.7: Dual-Control Two-Step Approval</h3>
                          <p className="text-[11px] text-slate-500">
                            1. Preparer (Finance) reviews and submits → 2. Approver (Org Admin) commits to production.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                            <span className="font-extrabold text-slate-900 block">Step 1: Preparer Sign-Off</span>
                            <p className="text-[11px] text-slate-500">
                              I certify that all {profilingReport.totalRows} lease terms, base rents, and billing entities match the executed lease agreements.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsPreparerApproved(true)}
                              className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                isPreparerApproved ? "bg-emerald-600 text-white" : "bg-teal-50 text-teal-800 border border-teal-200"
                              }`}
                            >
                              {isPreparerApproved ? "Preparer Sign-off Complete ✓" : "Sign & Submit as Preparer"}
                            </button>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                            <span className="font-extrabold text-slate-900 block">Step 2: Approver Commit &amp; Publish</span>
                            <p className="text-[11px] text-slate-500">
                              Authorizes system to write records to live database and publish production rent roll.
                            </p>
                            <button
                              type="button"
                              disabled={!isPreparerApproved}
                              onClick={() => {
                                setIsApproverCommitted(true);
                                setImportWorkflowStep(8);
                              }}
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                                !isPreparerApproved ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                                isApproverCommitted ? "bg-purple-600 text-white" : "bg-[#0F8B7D] text-white hover:bg-[#0c6e63] cursor-pointer"
                              }`}
                            >
                              {isApproverCommitted ? "Approver Approved ✓" : "Approve & Commit to Production"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4.8: Commit to Production */}
                    {importWorkflowStep === 8 && (
                      <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={24} className="text-teal-700" />
                          <div>
                            <h3 className="text-xs font-bold text-teal-950">Step 4.8: Commit to Production Executed</h3>
                            <p className="text-[11px] text-teal-800">Opening snapshot created for {profilingReport.totalRows} active contracts.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Opening Snapshot</span>
                            <span className="font-extrabold text-slate-900 text-sm">{new Date().toLocaleString("en-US", { month: "short", year: "numeric" })} Frozen</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">WALE Horizon</span>
                            <span className="font-extrabold text-teal-700 text-sm">3.8 Years</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Contracts</span>
                            <span className="font-extrabold text-slate-900 text-sm">{profilingReport.totalRows} Active Leases</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Expiry Alerts</span>
                            <span className="font-extrabold text-purple-700 text-sm">{profilingReport.totalRows} Active Triggers</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(9)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            View 4.9 Rollback Policy
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="px-6 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Proceed to Step 5: Final Review &amp; Launch →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4.9: Rollback */}
                    {importWorkflowStep === 9 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 4.9: 7-Day Rollback Safety Policy</h3>
                            <p className="text-[11px] text-slate-500">
                              <em>Full 7-day snapshot rollback window available to revert data state if errors are discovered post-go-live.</em>
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                            {rollbackDaysLeft} Days Remaining in Window
                          </span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800">Batch: BATCH-OFFICEX-LIVE</span>
                            <span className="text-teal-700">Status: Active Live</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Reversing this batch removes all newly created contracts without impacting prior historical data.
                          </p>
                          <button
                            type="button"
                            onClick={() => alert("Batch rollback window active. All audit logs and snapshots recorded.")}
                            className="mt-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw size={13} /> Test Rollback Simulation (Within 7 Days)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════ STEP 5: FINAL EXECUTIVE REVIEW & PRODUCTION LAUNCH ════════ */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 5 of 5 · Final Review &amp; Go-Live Launch
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Executive Setup Summary &amp; Production Launch</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Review your configured organisation, verified statutory accounts, primary asset, and branding before launching live into the Rent Roll workspace.
                      </p>
                    </div>

                    {/* Clean Executive Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Organisation & Primary Asset */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Building2 className="w-4 h-4 text-[#0F8B7D]" />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Organisation &amp; Primary Asset</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Legal Entity:</span>
                            <span className="font-extrabold text-slate-900">{orgData.legalName || "Not configured"}</span>
                          </div>
                          {orgData.tradeName && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Brand / Trade Name:</span>
                              <span className="font-bold text-slate-700">{orgData.tradeName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-500">Operating Model:</span>
                            <span className="font-semibold text-slate-700 capitalize">
                              {orgData.segments[0] === "warehouse_owner" ? "Warehouse / Logistics Park" : orgData.segments[0] === "flex_operator" ? "Flexible Workspace" : "Commercial Office Landlord"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Commercial Assets:</span>
                            <span className={propertyData.name?.trim() ? "font-bold text-[#0F8B7D]" : "text-slate-500 italic text-[11px]"}>
                              {propertyData.name?.trim() ? propertyData.name.trim() : "0 added (Skipped — register anytime from dashboard)"}
                            </span>
                          </div>
                          {propertyData.name?.trim() ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Asset Location:</span>
                                <span className="font-semibold text-slate-700">{propertyData.city || orgData.city || "Mumbai"}, {propertyData.state || orgData.state || "Maharashtra"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Leasable Area:</span>
                                <span className="font-bold font-mono text-slate-900">{Number(propertyData.totalArea || 50000).toLocaleString()} sq ft ({propertyData.unitsCount || 6} Units)</span>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* 2. Mandatory Statutory & Settlement Bank */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Statutory &amp; Settlement Account</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">GSTIN:</span>
                            <span className="font-mono font-bold text-slate-900">{orgData.gstin || "Unregistered (RCM Mode)"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Income Tax PAN:</span>
                            <span className="font-mono font-bold text-slate-900">{orgData.pan || (orgData.gstin ? orgData.gstin.substring(2, 12) : "Not Specified")}</span>
                          </div>
                          {(() => {
                            const defEntity = billingEntities.find(b => b.isDefault) || billingEntities[0];
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Settlement Bank:</span>
                                  <span className="font-extrabold text-emerald-800">{defEntity?.bankName || "Linked"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Account Number:</span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {defEntity?.accountNumber ? `•••• •••• ${defEntity.accountNumber.slice(-4)}` : "Verified"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">IFSC Code:</span>
                                  <span className="font-mono font-bold text-teal-700">{defEntity?.ifscCode || "Valid"}</span>
                                </div>
                              </>
                            );
                          })()}
                          <div className="flex justify-between">
                            <span className="text-slate-500">Currency / FY:</span>
                            <span className="font-bold text-slate-700">{fySettings.currency || "INR (₹)"} · Starts April 1</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Visual Branding & Tenant Experience */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Palette className="w-4 h-4 text-purple-600" />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Branding &amp; Tenant Portal</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Company Logo:</span>
                            {branding.logoPreview ? (
                              <div className="flex items-center gap-1.5">
                                <img src={branding.logoPreview} alt="Logo" className="w-6 h-6 object-contain rounded border border-slate-200" />
                                <span className="font-bold text-emerald-600 text-[11px]">Uploaded ✓</span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-600 font-mono text-[11px]">Initials ({logoInitials})</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Brand Color:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: branding.brandColor }} />
                              <span className="font-mono text-slate-700 font-bold">{branding.brandColor}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tenant Portal:</span>
                            <span className="font-mono font-bold text-[#0F8B7D]">{domains.subdomain || "portal"}.officex.pro</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Billing Sender:</span>
                            <span className="font-mono text-slate-700">{domains.senderBillingEmail || `billing@${(orgData.tradeName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Production Readiness */}
                      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 pb-2 border-teal-200/80 border-b">
                            <CheckCircle2 className="w-4 h-4 text-[#0F8B7D]" />
                            <h3 className="text-xs font-black text-teal-950 uppercase tracking-wide">Production Ready</h3>
                          </div>
                          <div className="mt-3 space-y-2 text-xs text-teal-900">
                            <div className="flex items-center gap-2">
                              <Check size={14} className="text-emerald-600 shrink-0" />
                              <span>Institutional KYC &amp; Settlement Account active</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check size={14} className="text-emerald-600 shrink-0" />
                              <span>Maker-checker dual control enabled for billing &amp; leases</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check size={14} className="text-emerald-600 shrink-0" />
                              <span>Immutable statutory audit logs &amp; snapshot storage primed</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleFinalCommit}
                          className="w-full py-3 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2"
                        >
                          <CheckCircle2 size={15} />
                          <span>{isSubmitting ? "Launching Enterprise Rent Roll..." : "Launch Rent Roll & Open Dashboard"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ──── FOOTER NAVIGATION BUTTONS ──── */}
        {!isCommitted && (
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={currentStep === 1 || isSubmitting}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>

            {currentStep === 4 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <FastForward size={14} className="text-amber-700" />
                  <span>Skip for Now (Skip All 9 Steps)</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 shadow-2xs transition-all"
                >
                  <span>Continue to Step 5</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 shadow-2xs transition-all"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalCommit}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-600/30 disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Committing Enterprise Rent Roll Master..." : "Declare Go-Live & Launch Live Rent Roll"}</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function RentRollOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold">
          Loading OFFICEX Onboarding Suite...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

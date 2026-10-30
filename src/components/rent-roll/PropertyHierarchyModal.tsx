"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Building,
  Layers,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserPlus,
  ArrowRight,
  Sparkles,
  Calendar,
  DollarSign,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  UploadCloud,
  Calculator,
  Percent,
  Car,
  FileCheck2,
  FileUp,
  Zap,
  Armchair,
  Clock,
  UserCheck,
  ExternalLink,
  ChevronDown,
  Shield,
  HelpCircle,
  FileSpreadsheet,
  Lock,
  Share2,
  MessageCircle,
  Mail,
  RefreshCw,
  Trash2,
} from "lucide-react";
import GoogleAddressAutocomplete, {
  AddressAutofillResult,
} from "@/components/common/GoogleAddressAutocomplete";
import { uploadAndParseAgreement } from "@/lib/rent-roll/client-document-extractor";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import AgreementVarianceModal, {
  AgreementDiffItem,
} from "./AgreementVarianceModal";
import RentRollExcelImporterModal from "./RentRollExcelImporterModal";
import {
  INDIAN_STATES_CITIES,
  ALL_INDIAN_STATES,
  COMMERCIAL_ASSET_TYPES,
  LEGAL_OWNERSHIP_STRUCTURES,
  getOwnershipStructureRule,
  matchCanonicalIndianState,
  matchCanonicalIndianCity,
} from "@/lib/india-locations";
import {
  DELEGATED_ENTITY_TYPES,
  getDelegatedEntityLabel,
} from "./RentRollOnboardingWizard";
import { downloadLeaseContractPdf, LeaseContractPdfData } from "@/lib/pdf/lease-contract-pdf";

export const checkIsOwnerSubscribed = (): boolean => {
  if (typeof window !== "undefined") {
    const sub = localStorage.getItem("officex_subscription") || sessionStorage.getItem("officex_subscription");
    const subStatus = localStorage.getItem("officex_subscription_status") || sessionStorage.getItem("officex_subscription_status");
    return sub === "active" && subStatus === "active";
  }
  return false;
};

export const generateUniquePropertyCode = (propertyName = "", existingCodes: string[] = []): string => {
  const clean = (propertyName || "").trim();
  if (!clean) return "";

  const words = clean.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  let prefix = "";
  if (words.length >= 2) {
    const initials = words.map((w) => w[0].toUpperCase()).join("");
    if (initials.length >= 2 && initials.length <= 4) {
      prefix = initials;
    }
  }
  if (!prefix) {
    const firstWord = words[0] || "";
    prefix = firstWord.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  }
  if (!prefix || prefix.length < 2) {
    prefix = (clean.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3) || "PROP").toUpperCase();
  }

  let code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  let attempts = 0;
  while (existingCodes.includes(code) && attempts < 30) {
    code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    attempts++;
  }
  return code;
};

export const isSingleLevelAssetType = (propertyType: string): boolean => {
  const t = (propertyType || "").toLowerCase();
  return (
    t.includes("warehouse") ||
    t.includes("industrial") ||
    t.includes("cold storage") ||
    t.includes("logistics") ||
    t.includes("plot")
  );
};

export const formatFloorName = (floorNumber: number): string => {
  if (floorNumber === 0) return "Ground Floor";
  const j = floorNumber % 10;
  const k = floorNumber % 100;
  let suffix = "th";
  if (j === 1 && k !== 11) suffix = "st";
  else if (j === 2 && k !== 12) suffix = "nd";
  else if (j === 3 && k !== 13) suffix = "rd";
  return `${floorNumber}${suffix} Floor`;
};

export const formatFloorBadge = (floorNumber: number): string => {
  if (floorNumber === 0) return "G";
  return `F${floorNumber}`;
};

export type HierarchyTab = "property" | "building" | "space" | "tenant" | "contract" | "delegation";

interface PropertyHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HierarchyTab;
  onSuccess?: () => void;
}

export default function PropertyHierarchyModal({
  isOpen,
  onClose,
  initialTab = "property",
  onSuccess,
}: PropertyHierarchyModalProps) {
  const [activeTab, setActiveTabState] = useState<HierarchyTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [excelImporterOpen, setExcelImporterOpen] = useState(false);
  const [hasSavedOnboarding, setHasSavedOnboarding] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Subscribed Capacity (Sq.Ft ceiling from active plan if subscribed)
  const [subscribedCapacity, setSubscribedCapacity] = useState<number>(0);

  // Rent Roll Subscription Form State (Cannot subscribe below totalPortfolioSqft)
  const [subscribeSqftInput, setSubscribeSqftInput] = useState<number>(0);
  const [subscribeBillingCycle, setSubscribeBillingCycle] = useState<"monthly" | "annual">("annual");
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  // Tracking last saved property and occupant in current workflow session
  const [lastSavedPropName, setLastSavedPropName] = useState<string>("");
  const [lastSavedOccupantName, setLastSavedOccupantName] = useState<string>("");

  // Generated Tenant Invite Link
  const [latestTenantInvite, setLatestTenantInvite] = useState<{
    name: string;
    email: string;
    link: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isOwnerSubscribed, setIsOwnerSubscribed] = useState<boolean>(false);

  // Active Floor selected in Step 2 Floor Studio
  const [activeStudioFloor, setActiveStudioFloor] = useState<string>("0");

  // Floor De-Registration / Sold Floors state (§5)
  const [deRegModalOpen, setDeRegModalOpen] = useState(false);
  const [deRegFloor, setDeRegFloor] = useState("");
  const [deRegReason, setDeRegReason] = useState("");
  const [deRegLoading, setDeRegLoading] = useState(false);

  // Subscription Gate Modal state (§20)
  const [subscriptionGateModalOpen, setSubscriptionGateModalOpen] = useState(false);
  const [subscriptionGateReason, setSubscriptionGateReason] = useState("");

  // Post-Contract Decision state (§20)
  const [postContractChoice, setPostContractChoice] = useState<"undecided" | "assign" | "self_managed">("undecided");

  // Warehouse Area Selection: Entire Facility vs Partial Sq.Ft (§10)
  const [warehouseLeaseChoice, setWarehouseLeaseChoice] = useState<"entire" | "partial">("entire");

  // Step 4: Existing vs New Tenant Mode & Document Auto-Fill State
  const [tenantOnboardingMode, setTenantOnboardingMode] = useState<"existing" | "new">("existing");
  const [tenantDocCategory, setTenantDocCategory] = useState<"rent" | "maintenance" | "both">("both");
  const [uploadedTenantFileList, setUploadedTenantFileList] = useState<Array<{ name: string; size: number; category: string }>>([]);
  const [isUploadingTenantAgreement, setIsUploadingTenantAgreement] = useState(false);
  const [parsedTenantDocMeta, setParsedTenantDocMeta] = useState<{
    fileName: string;
    confidence: number;
    extractedFieldsCount: number;
    summaryHighlights: string[];
    category: string;
  } | null>(null);

  // Floor-wise space & area breakdown state for Step 1 (Single Building)
  const [floorBreakdown, setFloorBreakdown] = useState<Array<{ floorNumber: number; spaceName: string; areaSqft: string }>>([]);

  // Tower / Building breakdown state for Step 1 (Campus / Multiple Towers)
  const [towersBreakdown, setTowersBreakdown] = useState<Array<{
    id: string;
    name: string;
    floorsCount: string;
    areaSqft: string;
    gateOrAddress?: string;
  }>>([
    { id: "1", name: "Tower A", floorsCount: "5", areaSqft: "", gateOrAddress: "" },
    { id: "2", name: "Tower B", floorsCount: "5", areaSqft: "", gateOrAddress: "" },
  ]);

  // Step 6: Third-Party Management Delegation state
  const [delegationForm, setDelegationForm] = useState({
    propertyId: "",
    propertyName: "",
    managerType: "pm_company",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    managerUserRole: "property_manager" as "property_manager" | "org_admin",
    managerRights: {
      contractExecution: false,
      concessions: false,
      billingRuns: true,
      depositRefunds: false,
      maxMaintenanceSpend: 25000,
    },
  });
  const [latestManagerInvite, setLatestManagerInvite] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    propertyName: string;
    link: string;
  } | null>(null);
  const [copiedManagerInvite, setCopiedManagerInvite] = useState(false);
  const [selectedTenantBuilding, setSelectedTenantBuilding] = useState<string>("");
  const [selectedTenantFloor, setSelectedTenantFloor] = useState<string>("");
  const [selectedTenantSuites, setSelectedTenantSuites] = useState<string[]>([]);
  const [selectedContractFloor, setSelectedContractFloor] = useState<string>("");

  // Billing SPV Entities
  const [billingEntities, setBillingEntities] = useState<string[]>([]);

  // Dropdown Master Collections
  const [propertiesList, setPropertiesList] = useState<Array<{ id: string; name: string; area?: number }>>([]);
  const [buildingsList, setBuildingsList] = useState<
    Array<{ id: string; name: string; propertyId?: string; floors?: number; totalAreaSqft?: number }>
  >([]);
  const [spacesList, setSpacesList] = useState<
    Array<{
      id: string;
      name: string;
      area: number;
      buildingId?: string;
      floorName?: string;
      unitType?: string;
      occupancyStatus?: string;
    }>
  >([]);
  const [tenantsList, setTenantsList] = useState<
    Array<{
      id: string;
      name: string;
      company?: string;
      companyType?: string;
      pan?: string;
      gstin?: string;
      cin?: string;
      billingAddress?: string;
      industrySector?: string;
      email?: string;
      phone?: string;
    }>
  >([]);

  // Agreement Variance Review Modal State & Temporary Highlight
  const [varianceModalOpen, setVarianceModalOpen] = useState(false);
  const [agreementDifferences, setAgreementDifferences] = useState<AgreementDiffItem[]>([]);
  const [pendingAgreementData, setPendingAgreementData] = useState<any>(null);
  const [pendingAgreementFile, setPendingAgreementFile] = useState<string>("");
  const [changedFieldKeys, setChangedFieldKeys] = useState<Set<string>>(new Set());

  // Wrapper for setActiveTab to automatically clear temporary highlight on tab/stage change
  const setActiveTab = (tab: HierarchyTab) => {
    setChangedFieldKeys(new Set());
    setActiveTabState(tab);
  };

  // Helper to clear highlight for an individual field once clicked or focused
  const clearFieldHighlight = (key: string) => {
    if (changedFieldKeys.has(key)) {
      setChangedFieldKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Helper for dynamic temporary yellow highlight
  const getHighlightClass = (key: string, baseClass = "") => {
    if (changedFieldKeys.has(key)) {
      return `${baseClass} bg-amber-100/90 border-amber-500 ring-2 ring-amber-400 text-amber-950 font-bold transition-all duration-300`;
    }
    return baseClass;
  };

  // ──── 1. PROPERTY FORM (Enhanced Commercial Master & Delegation) ────
  const [propForm, setPropForm] = useState({
    existingPropId: "",
    propertyName: "",
    propertyCode: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "",
    microMarket: "",
    areaSqft: "",
    totalSeats: "",
    propertyType: "Office",
    hasMultipleBuildings: false,
    buildingsCount: "1",
    floorsCount: "",
    wingsCount: "1",
    ownershipStructure: "pvt_ltd",
    spvName: "",
    panNumber: "",
    cinNumber: "",
    gstin: "",
    reraNumber: "",
    contactName: "",
    contactPhone: "",
    fitoutCondition: "Fully Furnished", // "Fully Furnished" | "Warm Shell" | "Bare Shell" | "Semi-Furnished"
    workstationsCount: "",
    cabinsCount: "",
    meetingRoomsCount: "",
    defaultFitoutDays: "60",
    // Warehouse & Industrial Specifications
    warehouseClearHeight: "",
    warehouseDocksCount: "",
    warehouseFlooringType: "Laser Screed FM2 (5T/m²)",
    warehousePowerLoad: "",
    // Management Delegation ("if i want to assign it to some other or anything")
    hasDelegatedManager: false,
    managerType: "pm_company",
    managerName: "",
    managerEmail: "",
    managerUserRole: "property_manager" as "property_manager" | "org_admin",
    managerRights: {
      contractExecution: false,
      concessions: false,
      billingRuns: true,
      depositRefunds: false,
      maxMaintenanceSpend: 25000,
    },
  });

  const [availableCities, setAvailableCities] = useState<string[]>(INDIAN_STATES_CITIES["Karnataka"] || []);
  const [copiedManagerLink, setCopiedManagerLink] = useState(false);

  // ──── 2. BUILDING FORM (3 Fields) ────
  const [bldgForm, setBldgForm] = useState({
    propertyId: "",
    buildingName: "",
    floorCount: "",
    buildingAddress: "",
  });

  // ──── 3. SPACE FORM (Enhanced Handover Specs) ────
  const [spaceForm, setSpaceForm] = useState({
    buildingId: "",
    spaceName: "",
    areaSqft: "",
    floorNumber: "",
    unitType: "Office",
    occupancyStatus: "vacant" as "vacant" | "occupied",
    fitoutCondition: "Fully Furnished",
    workstationsCount: "",
  });
  const [showAddSpaceForm, setShowAddSpaceForm] = useState(false);
  const [addingUnitToFloor, setAddingUnitToFloor] = useState<number | null>(null);
  const [newUnitForm, setNewUnitForm] = useState({
    spaceName: "",
    areaSqft: "",
    unitType: "Office",
    occupancyStatus: "vacant" as "vacant" | "occupied",
    fitoutCondition: "Fully Furnished",
    workstationsCount: "",
  });

  // ──── 4. TENANT FORM (Corporate & Signatory Master) ────
  const [tenantForm, setTenantForm] = useState({
    companyType: "pvt_ltd" as "pvt_ltd" | "public_ltd" | "llp" | "partnership" | "sole_proprietorship" | "trust_society",
    companyName: "",
    tradeName: "",
    industryType: "IT & Software",
    cinNumber: "",
    gst: "",
    pan: "",
    billingAddress: "",
    occupantName: "",
    email: "",
    phone: "",
    altContactName: "",
    altContactPhone: "",
    signatoryName: "",
    signatoryDesignation: "",
  });
  const [sameSignatoryContact, setSameSignatoryContact] = useState(true);

  // ──── 5. CONTRACT FORM (Comprehensive Commercial Terms) ────
  const [contractForm, setContractForm] = useState({
    occupantId: "",
    propertyId: "",
    buildingId: "",
    spaceId: "",
    startDate: "",
    endDate: "",
    areaSqft: "",
    // Pricing Model & Rates
    billingModel: "Area-based", // "Area-based" | "Seat-based" | "Fixed"
    ratePerSqft: "",
    ratePerSeat: "",
    seatCount: "",
    bareShellRate: "",
    fitoutRate: "",
    monthlyRent: "",
    // CAM Charges
    camType: "Per Sq.Ft", // "Per Sq.Ft" | "Fixed Monthly" | "Included" | "Actuals"
    camRate: "",
    camMonthly: "",
    // Parking Allocations (Free vs Paid)
    carParkingFreeSlots: "0",
    carParkingPaidSlots: "0",
    carParkingRate: "0",
    twoWheelerFreeSlots: "0",
    twoWheelerPaidSlots: "0",
    twoWheelerRate: "0",
    carParkingSlots: "0",
    twoWheelerSlots: "0",
    // Security Deposit & Period
    securityDeposit: "",
    depositMonths: "6",
    fitoutDays: "0",
    lockInMonths: "12",
    noticeDays: "90",
    // Escalation
    escalationPct: "5",
    escalationStartDate: "",
    escalationFrequency: "Annual", // "Annual" | "Biannual" | "Triennial" | "Quarterly"
    // Legal & Statutory
    billingEntity: "",
    paymentTerms: "Due on 5th of month",
    stampDutySharing: "50:50 Shared",
    notes: "",
  });

  // Agreement Document Upload & Auto-Fill State
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);
  const [parsedAgreementMeta, setParsedAgreementMeta] = useState<{
    fileName: string;
    confidence: number;
    extractedFieldsCount: number;
    summaryHighlights: string[];
  } | null>(null);

  // Helper to reset property form completely to a blank state for registering a new property
  const resetPropertyForm = () => {
    setPropForm({
      existingPropId: "",
      propertyName: "",
      propertyCode: "",
      address: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "",
      microMarket: "",
      areaSqft: "",
      totalSeats: "",
      propertyType: "Office",
      hasMultipleBuildings: false,
      buildingsCount: "1",
      floorsCount: "",
      wingsCount: "1",
      ownershipStructure: "pvt_ltd",
      spvName: "",
      panNumber: "",
      cinNumber: "",
      gstin: "",
      reraNumber: "",
      contactName: "",
      contactPhone: "",
      fitoutCondition: "Fully Furnished",
      workstationsCount: "",
      cabinsCount: "",
      meetingRoomsCount: "",
      defaultFitoutDays: "60",
      warehouseClearHeight: "",
      warehouseDocksCount: "",
      warehouseFlooringType: "Laser Screed FM2 (5T/m²)",
      warehousePowerLoad: "",
      hasDelegatedManager: false,
      managerType: "pm_company",
      managerName: "",
      managerEmail: "",
      managerUserRole: "property_manager" as "property_manager" | "org_admin",
      managerRights: {
        contractExecution: false,
        concessions: false,
        billingRuns: true,
        depositRefunds: false,
        maxMaintenanceSpend: 25000,
      },
    });
    setFloorBreakdown([]);
    setTowersBreakdown([
      { id: "1", name: "Tower A", floorsCount: "5", areaSqft: "", gateOrAddress: "" },
      { id: "2", name: "Tower B", floorsCount: "5", areaSqft: "", gateOrAddress: "" },
    ]);
  };

  // Helper to optionally load details from onboarding if the user desires
  const handleLoadFromOnboarding = () => {
    if (typeof window === "undefined") return;
    const rawOb = localStorage.getItem("officex_onboarded_property_details");
    if (!rawOb) {
      showToast("No saved onboarding details found in this browser", "error");
      return;
    }
    try {
      const ob = JSON.parse(rawOb);
      const stateMatched = matchCanonicalIndianState(ob.state) || ob.state || "Karnataka";
      const citiesList = INDIAN_STATES_CITIES[stateMatched] || [];
      if (citiesList.length > 0) {
        setAvailableCities(citiesList);
      }
      setPropForm((prev) => ({
        ...prev,
        propertyName: ob.propertyName || "",
        propertyCode: ob.propertyCode || prev.propertyCode,
        propertyType: ob.propertyType || "Office",
        address: ob.address || "",
        city: ob.city || (citiesList.length > 0 ? citiesList[0] : "Bengaluru"),
        state: stateMatched,
        pincode: ob.pincode || "",
        microMarket: ob.microMarket || "",
        areaSqft: ob.areaSqft ? String(ob.areaSqft) : "",
        totalSeats: ob.totalSeats ? String(ob.totalSeats) : "",
        buildingsCount: ob.buildingsCount || ob.wingsCount ? String(ob.buildingsCount || ob.wingsCount) : "1",
        floorsCount: ob.floorsCount ? String(ob.floorsCount) : "1",
        wingsCount: ob.wingsCount ? String(ob.wingsCount) : "1",
        ownershipStructure: ob.ownershipStructure || "pvt_ltd",
        spvName: ob.spvName || ob.companyName || "",
        panNumber: ob.panNumber || "",
        cinNumber: ob.cinNumber || "",
        gstin: ob.gstin || "",
        reraNumber: ob.reraNumber || "",
        fitoutCondition: ob.fitoutCondition || "Fully Furnished",
        workstationsCount: ob.workstationsCount ? String(ob.workstationsCount) : "",
        cabinsCount: ob.cabinsCount ? String(ob.cabinsCount) : "",
        meetingRoomsCount: ob.meetingRoomsCount ? String(ob.meetingRoomsCount) : "",
        defaultFitoutDays: ob.defaultFitoutDays ? String(ob.defaultFitoutDays) : "60",
        contactName: ob.contactName || "",
        contactPhone: ob.contactPhone || "",
      }));
      showToast("✓ Loaded details from onboarding");
    } catch {
      showToast("Failed to parse onboarding details", "error");
    }
  };

  // Sync and reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadHierarchyDropdowns();
      setFeedback(null);

      // When opening to register/add a new property (Step 1), ALWAYS start with a clean, empty form
      if (initialTab === "property") {
        resetPropertyForm();
      }

      if (typeof window !== "undefined") {
        // Check if saved onboarding details exist for optional 1-click import
        const rawOb = localStorage.getItem("officex_onboarded_property_details");
        setHasSavedOnboarding(Boolean(rawOb));

        // Update Subscription Status
        setIsOwnerSubscribed(checkIsOwnerSubscribed());

        // Subscribed Capacity
        const storedCap = Number(localStorage.getItem("officex_subscribed_sqft"));
        if (storedCap && !isNaN(storedCap) && storedCap > 0) {
          setSubscribedCapacity(storedCap);
        }
      }
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const updateSubStatus = () => {
      setIsOwnerSubscribed(checkIsOwnerSubscribed());
    };
    updateSubStatus();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", updateSubStatus);
      window.addEventListener("storage", updateSubStatus);
      return () => {
        window.removeEventListener("focus", updateSubStatus);
        window.removeEventListener("storage", updateSubStatus);
      };
    }
  }, []);

  const loadHierarchyDropdowns = async () => {
    try {
      const authHeaders = getClientAuthHeaders();

      // 1. Fetch properties
      const pRes = await fetch("/api/rent-roll/properties", { headers: authHeaders });
      if (pRes.ok) {
        const pData = await pRes.json();
        const pArr = (Array.isArray(pData.data) ? pData.data : []).map((p: any) => ({
          id: p.id,
          name: p.property_name,
          area: Number(p.total_leasable_area_sqft || p.area_sqft || 0),
        }));
        setPropertiesList(pArr);
        if (pArr.length > 0 && !bldgForm.propertyId) {
          setBldgForm((prev) => ({ ...prev, propertyId: pArr[0].id }));
          setContractForm((prev) => ({ ...prev, propertyId: pArr[0].id }));
        }
      }

      // 2. Fetch buildings
      const bRes = await fetch("/api/buildings", { headers: authHeaders });
      if (bRes.ok) {
        const bData = await bRes.json();
        const bArr = (Array.isArray(bData.data) ? bData.data : []).map((b: any) => ({
          id: b.id,
          name: b.building_name,
          propertyId: b.property_id,
          floors: b.floors ? Number(b.floors) : 1,
          totalAreaSqft: b.total_area_sqft ? Number(b.total_area_sqft) : 0,
        }));
        setBuildingsList(bArr);
        if (bArr.length > 0 && !spaceForm.buildingId) {
          setSpaceForm((prev) => ({ ...prev, buildingId: bArr[0].id }));
          setContractForm((prev) => ({ ...prev, buildingId: bArr[0].id }));
        }
        if (bArr.length > 0 && !selectedTenantBuilding) {
          setSelectedTenantBuilding(bArr[0].id);
        }
      }

      // 3. Fetch spaces
      const sRes = await fetch("/api/spaces", { headers: authHeaders });
      if (sRes.ok) {
        const sData = await sRes.json();
        const sArr = (Array.isArray(sData.data) ? sData.data : []).map((s: any) => ({
          id: s.id,
          name: s.space_name || s.space_code,
          area: Number(s.chargeable_area_sqft || s.area_sqft || 0),
          buildingId: s.building_id,
          floorName: s.floor_name || s.floor_label || "",
          unitType: s.space_type || "office",
          occupancyStatus: s.occupancy_status || "vacant",
        }));
        setSpacesList(sArr);
        if (sArr.length > 0 && !contractForm.spaceId) {
          setContractForm((prev) => ({
            ...prev,
            spaceId: sArr[0].id,
            areaSqft: String(sArr[0].area || ""),
          }));
        }
      }

      // 4. Fetch tenants
      const tRes = await fetch("/api/rent-roll/tenants", { headers: authHeaders });
      if (tRes.ok) {
        const tData = await tRes.json();
        const tArr = (Array.isArray(tData.data) ? tData.data : []).map((t: any) => ({
          id: t.id,
          name: t.tenant_name || t.trade_name,
          company: t.trade_name,
          companyType: t.company_type || (t.occupant_type === "individual" ? "sole_proprietorship" : "pvt_ltd"),
          pan: t.pan || "",
          gstin: t.gstin || "",
          cin: t.cin_number || "",
          billingAddress: t.billing_address || t.address || "",
          industrySector: t.industry_sector || "IT & Software",
          email: t.email || "",
          phone: t.phone || "",
        }));
        setTenantsList(tArr);
        if (tArr.length > 0 && !contractForm.occupantId) {
          setContractForm((prev) => ({ ...prev, occupantId: tArr[0].id }));
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  // Dynamic floor count change handler for Step 1 — asset-type aware!
  const handleFloorsCountChange = (countStr: string) => {
    setPropForm((prev) => ({ ...prev, floorsCount: countStr }));
    const count = parseInt(countStr, 10);
    const isSingle = isSingleLevelAssetType(propForm.propertyType);

    // Negative numbers or invalid text
    if (isNaN(count) || count < 0 || (!isSingle && count === 0)) {
      setFloorBreakdown([]);
      return;
    }

    const totalArea = Number(propForm.areaSqft) || 0;

    // Single-level warehouse / industrial Ground level (0 upper floors or 1 ground level)
    if (isSingle && (count === 0 || count === 1)) {
      setFloorBreakdown([
        {
          floorNumber: 0,
          spaceName: propForm.propertyName.trim() ? `${propForm.propertyName.trim()} Main Bay` : "Main Warehouse Bay",
          areaSqft: totalArea > 0 ? String(totalArea) : "",
        },
      ]);
      return;
    }

    const maxFloors = Math.min(count, 50);
    const perFloor = totalArea > 0 ? Math.floor(totalArea / maxFloors) : 0;
    const remainder = totalArea > 0 ? totalArea - perFloor * maxFloors : 0;

    setFloorBreakdown((prev) => {
      const next = [];
      for (let i = 0; i < maxFloors; i++) {
        const existing = prev.find((f) => f.floorNumber === i);
        let defaultName = isSingle
          ? (i === 0 ? "Ground Level - Main Bay" : i === 1 ? "Mezzanine Storage Level" : `Warehouse Level ${i}`)
          : formatFloorName(i);
        next.push(
          existing && existing.areaSqft && Number(existing.areaSqft) > 0
            ? existing
            : {
                floorNumber: i,
                spaceName: defaultName,
                areaSqft: totalArea > 0 ? String(i === 0 ? perFloor + remainder : perFloor) : "",
              }
        );
      }
      return next;
    });
  };

  // Helper to handle asset type switch and auto-adjust levels and terminology
  const handlePropertyTypeChange = (newType: string) => {
    const isNowSingle = isSingleLevelAssetType(newType);
    const totalArea = Number(propForm.areaSqft) || 0;

    let updatedFloors = propForm.floorsCount;
    if (isNowSingle) {
      if (!updatedFloors || updatedFloors === "1") {
        updatedFloors = "0";
      }
      setPropForm((prev) => ({
        ...prev,
        propertyType: newType,
        floorsCount: updatedFloors,
        fitoutCondition: prev.fitoutCondition === "Fully Furnished" ? "Bare Shell" : prev.fitoutCondition,
      }));

      // Immediately allocate the full area to the Ground Warehouse Bay
      setFloorBreakdown([
        {
          floorNumber: 0,
          spaceName: propForm.propertyName.trim() ? `${propForm.propertyName.trim()} Main Bay` : "Main Warehouse Bay",
          areaSqft: totalArea > 0 ? String(totalArea) : "",
        },
      ]);
    } else {
      if (!updatedFloors || updatedFloors === "0") {
        updatedFloors = "1";
      }
      setPropForm((prev) => ({
        ...prev,
        propertyType: newType,
        floorsCount: updatedFloors,
      }));

      const count = parseInt(updatedFloors, 10) || 1;
      const perFloor = totalArea > 0 ? Math.floor(totalArea / count) : 0;
      const remainder = totalArea > 0 ? totalArea - perFloor * count : 0;

      const next = [];
      for (let i = 0; i < count; i++) {
        next.push({
          floorNumber: i,
          spaceName: formatFloorName(i),
          areaSqft: totalArea > 0 ? String(i === 0 ? perFloor + remainder : perFloor) : "",
        });
      }
      setFloorBreakdown(next);
    }
  };

  // Helper to update total area and automatically sync across floors/levels (unrestricted entry per user rule)
  const handleAreaSqftChange = (newAreaStr: string) => {
    setPropForm((prev) => ({ ...prev, areaSqft: newAreaStr }));

    const isSingle = isSingleLevelAssetType(propForm.propertyType);
    const count = parseInt(propForm.floorsCount, 10);
    const totalArea = Number(newAreaStr) || 0;

    // Single-level warehouse / industrial Ground level allocation
    if (isSingle && (count === 0 || count === 1 || isNaN(count)) && totalArea > 0) {
      setFloorBreakdown([
        {
          floorNumber: 0,
          spaceName: propForm.propertyName.trim() ? `${propForm.propertyName.trim()} Main Bay` : "Main Warehouse Bay",
          areaSqft: String(totalArea),
        },
      ]);
      return;
    }

    if (count > 0 && totalArea > 0) {
      const maxFloors = Math.min(count, 50);
      const perFloor = Math.floor(totalArea / maxFloors);
      const remainder = totalArea - perFloor * maxFloors;
      setFloorBreakdown((prev) => {
        if (prev.length === 0) {
          const next = [];
          for (let i = 0; i < maxFloors; i++) {
            let defaultName = isSingle
              ? (i === 0 ? "Ground Level - Main Bay" : i === 1 ? "Mezzanine Storage Level" : `Warehouse Level ${i}`)
              : formatFloorName(i);
            next.push({
              floorNumber: i,
              spaceName: defaultName,
              areaSqft: String(i === 0 ? perFloor + remainder : perFloor),
            });
          }
          return next;
        }
        return prev.map((f, idx) => ({
          ...f,
          areaSqft: String(idx === 0 ? perFloor + remainder : perFloor),
        }));
      });
    }
  };

  // Helper to auto-distribute total leasable area equally across floors in Step 1
  const autoDistributeFloorArea = () => {
    const totalArea = Number(propForm.areaSqft);
    if (!totalArea || totalArea <= 0 || floorBreakdown.length === 0) {
      showToast("Please enter Total Leasable Area first", "error");
      return;
    }
    const count = floorBreakdown.length;
    const perFloor = Math.floor(totalArea / count);
    const remainder = totalArea - perFloor * count;
    setFloorBreakdown((prev) =>
      prev.map((f, idx) => ({
        ...f,
        areaSqft: String(idx === 0 ? perFloor + remainder : perFloor),
      }))
    );
    showToast(`✓ Distributed ${totalArea.toLocaleString()} Sq.Ft equally across ${count} floors!`);
  };

  // Helper to handle change in number of towers for campus
  const handleBuildingsCountChange = (countStr: string) => {
    setPropForm((prev) => ({ ...prev, buildingsCount: countStr }));
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) return;
    const targetCount = Math.min(Math.max(count, 1), 20);
    const totalArea = Number(propForm.areaSqft) || 0;
    const perTower = totalArea > 0 ? Math.floor(totalArea / targetCount) : 0;
    const remainder = totalArea > 0 ? totalArea - perTower * targetCount : 0;
    const defaultFloors = propForm.floorsCount || "5";

    setTowersBreakdown((prev) => {
      const next = [];
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let i = 0; i < targetCount; i++) {
        const letter = alphabet[i] || `${i + 1}`;
        const defaultName = `Tower ${letter}`;
        const existing = prev[i];
        next.push({
          id: existing?.id || String(i + 1),
          name: existing?.name || defaultName,
          floorsCount: existing?.floorsCount || defaultFloors,
          areaSqft: totalArea > 0 ? String(i === 0 ? perTower + remainder : perTower) : existing?.areaSqft || "",
          gateOrAddress: existing?.gateOrAddress || "",
        });
      }
      return next;
    });
  };

  // Helper to add a tower to the campus
  const handleAddTower = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nextIdx = towersBreakdown.length;
    const letter = alphabet[nextIdx] || `${nextIdx + 1}`;
    const totalArea = Number(propForm.areaSqft) || 0;
    const newTower = {
      id: Date.now().toString(),
      name: `Tower ${letter}`,
      floorsCount: propForm.floorsCount || "5",
      areaSqft: "",
      gateOrAddress: "",
    };
    const nextTowers = [...towersBreakdown, newTower];
    setTowersBreakdown(nextTowers);
    setPropForm((prev) => ({ ...prev, buildingsCount: String(nextTowers.length) }));
    if (totalArea > 0) {
      const perTower = Math.floor(totalArea / nextTowers.length);
      const remainder = totalArea - perTower * nextTowers.length;
      setTowersBreakdown(
        nextTowers.map((t, i) => ({
          ...t,
          areaSqft: String(i === 0 ? perTower + remainder : perTower),
        }))
      );
    }
  };

  // Helper to remove a tower from the campus
  const handleRemoveTower = (idxToRemove: number) => {
    if (towersBreakdown.length <= 1) {
      showToast("A campus property must have at least 1 tower/building.", "error");
      return;
    }
    const nextTowers = towersBreakdown.filter((_, i) => i !== idxToRemove);
    setTowersBreakdown(nextTowers);
    setPropForm((prev) => ({ ...prev, buildingsCount: String(nextTowers.length) }));
    const totalArea = Number(propForm.areaSqft) || 0;
    if (totalArea > 0) {
      const perTower = Math.floor(totalArea / nextTowers.length);
      const remainder = totalArea - perTower * nextTowers.length;
      setTowersBreakdown(
        nextTowers.map((t, i) => ({
          ...t,
          areaSqft: String(i === 0 ? perTower + remainder : perTower),
        }))
      );
    }
  };

  // Helper to auto-distribute total leasable area equally across towers in Step 1
  const autoDistributeTowerArea = () => {
    const totalArea = Number(propForm.areaSqft);
    if (!totalArea || totalArea <= 0 || towersBreakdown.length === 0) {
      showToast("Please enter Total Leasable Area first", "error");
      return;
    }
    const count = towersBreakdown.length;
    const perTower = Math.floor(totalArea / count);
    const remainder = totalArea - perTower * count;
    setTowersBreakdown((prev) =>
      prev.map((t, idx) => ({
        ...t,
        areaSqft: String(idx === 0 ? perTower + remainder : perTower),
      }))
    );
    showToast(`✓ Distributed ${totalArea.toLocaleString()} Sq.Ft equally across ${count} towers!`);
  };

  // Handler for Step 6 Third-Party Delegation
  const handleSaveDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIsOwnerSubscribed()) {
      setSubscriptionGateReason("Assign Property Management to External Agency");
      setSubscriptionGateModalOpen(true);
      return;
    }
    if (!delegationForm.managerName.trim()) {
      showToast("Please enter Assignee / Manager Name", "error");
      return;
    }
    if (!delegationForm.managerEmail.trim()) {
      showToast("Please enter Manager Email Address", "error");
      return;
    }
    const targetPropName = delegationForm.propertyName || propForm.propertyName || lastSavedPropName || "Commercial Property";
    const targetPropId = delegationForm.propertyId || propForm.existingPropId || propertiesList[0]?.id || "";

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app");
    const ownerBrand =
      (typeof window !== "undefined" &&
        (localStorage.getItem("officex_company_name") || localStorage.getItem("officex_brand_name"))) ||
      "Commercial Asset Owner";
    const subActive = checkIsOwnerSubscribed();
    const link = `${origin}/invite?role=${encodeURIComponent(delegationForm.managerType)}&mgr=${encodeURIComponent(delegationForm.managerName.trim())}&email=${encodeURIComponent(delegationForm.managerEmail.trim())}&prop=${encodeURIComponent(targetPropName)}&owner=${encodeURIComponent(ownerBrand)}&owner_sub=${subActive ? "1" : "0"}&invite=act_${Date.now()}`;

    // Store in localStorage
    if (typeof window !== "undefined") {
      const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
      const assignObj = {
        name: delegationForm.managerName.trim(),
        email: delegationForm.managerEmail.trim(),
        phone: delegationForm.managerPhone.trim(),
        type: delegationForm.managerType,
        userRole: delegationForm.managerUserRole,
        rights: delegationForm.managerRights,
        assignedAt: new Date().toISOString(),
      };
      currentAssigns[targetPropName] = assignObj;
      if (targetPropId) currentAssigns[targetPropId] = assignObj;
      localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
      localStorage.setItem("officex_has_manager", "true");
      localStorage.setItem("officex_manage_mode", "delegated");
      localStorage.setItem("officex_manager_name", delegationForm.managerName.trim());
      localStorage.setItem("officex_manager_email", delegationForm.managerEmail.trim());
      localStorage.setItem("officex_manager_type", delegationForm.managerType);
      localStorage.setItem("officex_manager_activation_link", link);
    }

    setLatestManagerInvite({
      name: delegationForm.managerName.trim(),
      email: delegationForm.managerEmail.trim(),
      phone: delegationForm.managerPhone.trim(),
      role: delegationForm.managerType,
      propertyName: targetPropName,
      link,
    });

    showToast(`✓ Management assigned to ${delegationForm.managerName}! Portal invite link generated.`);
  };

  // Geographic state change handler
  const handleStateChange = (newState: string) => {
    const matched = matchCanonicalIndianState(newState) || newState;
    const cities = INDIAN_STATES_CITIES[matched] || [];
    setAvailableCities(cities);
    setPropForm((prev) => ({
      ...prev,
      state: matched,
      city: cities[0] || prev.city,
    }));
  };

  // Google Maps Address Selection with automatic city/state/pincode mapping
  const handleAddressSelect = (res: AddressAutofillResult) => {
    const matchedState = matchCanonicalIndianState(res.state) || res.state || propForm.state;
    const cities = INDIAN_STATES_CITIES[matchedState] || [];
    let finalCity = propForm.city;
    if (res.city) {
      const matchedCity = matchCanonicalIndianCity(matchedState, res.city) || res.city;
      finalCity = matchedCity;
      if (!cities.includes(matchedCity)) {
        setAvailableCities([matchedCity, ...cities]);
      } else {
        setAvailableCities(cities);
      }
    } else if (cities.length > 0) {
      setAvailableCities(cities);
      finalCity = cities[0];
    }
    setPropForm((prev) => ({
      ...prev,
      address: res.streetAddress || res.fullAddress,
      state: matchedState,
      city: finalCity,
      pincode: res.pincode || prev.pincode,
      microMarket: res.microMarket || prev.microMarket,
    }));
  };

  const getManagerActivationLink = () => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app");
    const propName = propForm.propertyName.trim() || "Commercial Property";
    const ownerName =
      (typeof window !== "undefined" &&
        (localStorage.getItem("officex_company_name") || localStorage.getItem("officex_brand_name"))) ||
      "Commercial Property Owner";
    const subActive = checkIsOwnerSubscribed();
    return `${origin}/invite?role=${encodeURIComponent(propForm.managerType || "pm_company")}&mgr=${encodeURIComponent(propForm.managerName.trim())}&prop=${encodeURIComponent(propName)}&owner=${encodeURIComponent(ownerName)}&owner_sub=${subActive ? "1" : "0"}&invite=act_${Date.now()}`;
  };

  // ──── SUBMIT 1: PROPERTY MASTER ────
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.propertyName.trim()) {
      showToast("Property Name is required", "error");
      return;
    }

    const uniqueCodeToUse =
      propForm.propertyCode.trim() ||
      generateUniquePropertyCode(propForm.propertyName.trim(), propertiesList.map((p) => p.name));

    const enteredArea = Number(propForm.areaSqft) || 0;
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          id: propForm.existingPropId || undefined,
          property_name: propForm.propertyName.trim(),
          property_code: uniqueCodeToUse,
          address_line1: propForm.address.trim(),
          city: propForm.city.trim() || "Bengaluru",
          state: propForm.state.trim() || "Karnataka",
          postal_code: propForm.pincode.trim() || undefined,
          property_type: propForm.propertyType.toLowerCase().replace(/\s+/g, "_"),
          total_leasable_area_sqft: enteredArea || 50000,
          floors_count: Number(propForm.floorsCount) || 1,
          buildings_count: Number(propForm.buildingsCount) || 1,
          primary_contact_name: propForm.contactName.trim(),
          primary_contact_phone: propForm.contactPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastSavedPropName(propForm.propertyName.trim());
        setPropForm((prev) => ({ ...prev, propertyCode: uniqueCodeToUse }));
        showToast(`✓ Property "${propForm.propertyName}" (${uniqueCodeToUse}) registered successfully!`);
        
        // Sync local storage active property & registered lists
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_active_property", propForm.propertyName);
          const reg = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
          if (!reg.includes(propForm.propertyName)) {
            reg.push(propForm.propertyName);
            localStorage.setItem("officex_registered_property_names", JSON.stringify(reg));
          }

          let effectivePropId = propForm.existingPropId;
          if (data.data?.id) {
            effectivePropId = data.data.id;
            const regIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
            if (!regIds.includes(effectivePropId)) {
              regIds.push(effectivePropId);
              localStorage.setItem("officex_registered_property_ids", JSON.stringify(regIds));
            }
            setPropForm((prev) => ({ ...prev, existingPropId: effectivePropId }));
            setBldgForm((prev) => ({ ...prev, propertyId: effectivePropId }));
            setContractForm((prev) => ({ ...prev, propertyId: effectivePropId, areaSqft: prev.areaSqft || propForm.areaSqft }));
            setDelegationForm((prev) => ({ ...prev, propertyId: effectivePropId, propertyName: propForm.propertyName.trim() }));
          }

          // Auto-provision building(s) & floor spaces based on architecture
          if (effectivePropId) {
            try {
              const bRes = await fetch("/api/buildings", { headers: authHeaders });
              const bData = bRes.ok ? await bRes.json() : { data: [] };
              const existingBldgs = Array.isArray(bData.data) ? bData.data.filter((b: any) => b.property_id === effectivePropId) : [];

              if (propForm.hasMultipleBuildings && towersBreakdown.length > 0) {
                // Provision each tower in campus
                for (let i = 0; i < towersBreakdown.length; i++) {
                  const tower = towersBreakdown[i];
                  const towerName = tower.name.trim() || `Tower ${String.fromCharCode(65 + i)}`;
                  const towerFloors = Number(tower.floorsCount) || 1;
                  const towerArea = Number(tower.areaSqft) || 0;
                  const towerAddress = tower.gateOrAddress?.trim() || propForm.address.trim();

                  let targetBldgId = existingBldgs.find((b: any) => b.building_name?.toLowerCase() === towerName.toLowerCase())?.id;
                  if (!targetBldgId) {
                    const newBldRes = await fetch("/api/buildings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify({
                        building_name: towerName,
                        building_code: `BLD-${uniqueCodeToUse}-${i + 1}`,
                        property_id: effectivePropId,
                        floors: towerFloors,
                        total_area_sqft: towerArea,
                        building_address: towerAddress,
                      }),
                    });
                    if (newBldRes.ok) {
                      const nbData = await newBldRes.json();
                      targetBldgId = nbData.data?.id;
                      if (targetBldgId) {
                        setSpaceForm((prev) => ({ ...prev, buildingId: prev.buildingId || targetBldgId }));
                        setContractForm((prev) => ({ ...prev, buildingId: prev.buildingId || targetBldgId }));
                      }
                    }
                  }

                  // Auto-create leasable floor spaces for this tower
                  if (targetBldgId && towerFloors > 0) {
                    const perFloorArea = towerArea > 0 ? Math.floor(towerArea / towerFloors) : 0;
                    for (let f = 0; f < towerFloors; f++) {
                      const isG = f === 0;
                      const flName = isG ? "Ground Floor" : formatFloorName(f);
                      const codeSuffix = isG ? "G" : `F${f}`;
                      await fetch("/api/spaces", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...authHeaders },
                        body: JSON.stringify({
                          space_name: `${towerName} - ${flName}`,
                          space_code: `SP-${uniqueCodeToUse}-T${i + 1}-${codeSuffix}`,
                          building_id: targetBldgId,
                          chargeable_area_sqft: perFloorArea || 1000,
                          floor_name: flName,
                          space_type: "suite",
                          occupancy_status: "vacant",
                        }),
                      }).catch(() => {});
                    }
                  }
                }
              } else if (floorBreakdown.length > 0) {
                // Single Standalone Building / Facility auto-provisioning
                let targetBldgId = existingBldgs[0]?.id;
                const isSingle = isSingleLevelAssetType(propForm.propertyType);
                if (!targetBldgId) {
                  const newBldRes = await fetch("/api/buildings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeaders },
                    body: JSON.stringify({
                      building_name: isSingle
                        ? `${propForm.propertyName.trim()} Main Facility`
                        : `${propForm.propertyName.trim()} Main Tower`,
                      building_code: `BLD-${uniqueCodeToUse}-01`,
                      property_id: effectivePropId,
                      floors: Math.max(1, Number(propForm.floorsCount) || floorBreakdown.length || 1),
                      total_area_sqft: Number(propForm.areaSqft) || 0,
                    }),
                  });
                  if (newBldRes.ok) {
                    const nbData = await newBldRes.json();
                    targetBldgId = nbData.data?.id;
                  }
                }

                if (targetBldgId) {
                  setSpaceForm((prev) => ({ ...prev, buildingId: targetBldgId }));
                  setContractForm((prev) => ({ ...prev, buildingId: targetBldgId }));
                  for (const fl of floorBreakdown) {
                    const flArea = Number(fl.areaSqft) || 0;
                    if (flArea > 0) {
                      const isGround = fl.floorNumber === 0;
                      const floorName = isGround ? "Ground Floor" : formatFloorName(fl.floorNumber);
                      const defaultName = isSingle
                        ? (isGround ? "Main Warehouse Bay" : `Warehouse Level ${fl.floorNumber}`)
                        : (isGround ? "Ground Floor" : formatFloorName(fl.floorNumber));
                      const codeSuffix = isGround ? "G" : `F${fl.floorNumber}`;

                      await fetch("/api/spaces", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...authHeaders },
                        body: JSON.stringify({
                          space_name: fl.spaceName.trim() || defaultName,
                          space_code: `SP-${uniqueCodeToUse}-${codeSuffix}`,
                          building_id: targetBldgId,
                          chargeable_area_sqft: flArea,
                          floor_name: floorName,
                          space_type: isSingle ? "entire_building" : "suite",
                          occupancy_status: "vacant",
                        }),
                      }).catch(() => {});
                    }
                  }
                }
              }
            } catch {
              // Non-blocking auto-provisioning
            }
          }

          // Handle Manager Delegation / Assignment
          if (propForm.hasDelegatedManager && propForm.managerName.trim()) {
            const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
            const assignObj = {
              name: propForm.managerName.trim(),
              email: propForm.managerEmail.trim(),
              type: propForm.managerType || "pm_company",
              userRole: propForm.managerUserRole || "property_manager",
              rights: propForm.managerRights,
              assignedAt: new Date().toISOString(),
            };
            currentAssigns[propForm.propertyName.trim()] = assignObj;
            if (effectivePropId) {
              currentAssigns[effectivePropId] = assignObj;
            }
            localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
            localStorage.setItem("officex_has_manager", "true");
            localStorage.setItem("officex_manage_mode", "delegated");
            localStorage.setItem("officex_manager_name", propForm.managerName.trim());
            localStorage.setItem("officex_manager_email", propForm.managerEmail.trim());
            localStorage.setItem("officex_manager_type", propForm.managerType || "pm_company");
            if (propForm.managerUserRole) {
              localStorage.setItem("officex_manager_user_role", propForm.managerUserRole);
            }
            const link = getManagerActivationLink();
            localStorage.setItem("officex_manager_activation_link", link);
          } else if (!propForm.hasDelegatedManager) {
            const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
            delete currentAssigns[propForm.propertyName.trim()];
            if (effectivePropId) {
              delete currentAssigns[effectivePropId];
            }
            localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
            if (Object.keys(currentAssigns).length === 0) {
              localStorage.setItem("officex_manage_mode", "self");
            }
          }

          // Persist complete property details snapshot
          const snapshot = {
            propertyName: propForm.propertyName.trim(),
            propertyCode: propForm.propertyCode.trim(),
            propertyType: propForm.propertyType,
            areaSqft: enteredArea,
            floorsCount: Number(propForm.floorsCount) || 1,
            wingsCount: Number(propForm.wingsCount) || 1,
            totalSeats: Number(propForm.totalSeats) || 0,
            address: propForm.address.trim(),
            city: propForm.city.trim(),
            state: propForm.state.trim(),
            pincode: propForm.pincode.trim(),
            microMarket: propForm.microMarket.trim(),
            ownershipStructure: propForm.ownershipStructure,
            spvName: propForm.spvName.trim(),
            panNumber: propForm.panNumber.trim(),
            cinNumber: propForm.cinNumber.trim(),
            gstin: propForm.gstin.trim(),
            reraNumber: propForm.reraNumber.trim(),
            fitoutCondition: propForm.fitoutCondition,
            workstationsCount: propForm.workstationsCount,
            cabinsCount: propForm.cabinsCount,
            meetingRoomsCount: propForm.meetingRoomsCount,
            defaultFitoutDays: propForm.defaultFitoutDays,
            warehouseClearHeight: propForm.warehouseClearHeight.trim(),
            warehouseDocksCount: propForm.warehouseDocksCount.trim(),
            warehouseFlooringType: propForm.warehouseFlooringType.trim(),
            warehousePowerLoad: propForm.warehousePowerLoad.trim(),
            contactName: propForm.contactName.trim(),
            contactPhone: propForm.contactPhone.trim(),
            hasDelegatedManager: propForm.hasDelegatedManager,
            managerType: propForm.managerType,
            managerName: propForm.managerName.trim(),
            managerEmail: propForm.managerEmail.trim(),
            managerUserRole: propForm.managerUserRole,
            managerRights: propForm.managerRights,
          };
          localStorage.setItem("officex_onboarded_property_details", JSON.stringify(snapshot));
        }

        // Auto-fill SPV in Step 5 & tenant billing address with property address
        if (propForm.spvName.trim()) {
          setBillingEntities((prev) => Array.from(new Set([...prev, propForm.spvName.trim()])));
          setContractForm((prev) => ({
            ...prev,
            billingEntity: prev.billingEntity || propForm.spvName.trim(),
          }));
        }

        await loadHierarchyDropdowns();
        const skipSpace = Boolean(
          (propForm.floorsCount === "0" || Number(propForm.floorsCount) === 0) &&
          !propForm.hasMultipleBuildings &&
          floorBreakdown.length <= 1
        );
        if (skipSpace) {
          setSelectedTenantFloor("0");
          setSelectedContractFloor("0");
          setActiveTab("tenant");
        } else {
          setActiveTab("space");
        }
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create property", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 2: BUILDING MASTER ────
  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bldgForm.buildingName.trim()) {
      showToast("Building Name is required", "error");
      return;
    }
    const propId = bldgForm.propertyId || propertiesList[0]?.id;
    if (!propId) {
      showToast("Please select or add a property first", "error");
      return;
    }
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          building_name: bldgForm.buildingName.trim(),
          building_code: `BLDG-${Date.now().toString().slice(-4)}`,
          property_id: propId,
          floors: Number(bldgForm.floorCount) || 1,
          building_address: bldgForm.buildingAddress.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Building "${bldgForm.buildingName}" added successfully!`);
        await loadHierarchyDropdowns();
        setBldgForm({
          propertyId: propId,
          buildingName: "",
          floorCount: "",
          buildingAddress: "",
        });
        setActiveTab("space");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create building", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 3: SPACE / UNIT MASTER ────
  const handleSaveSpace = async (e?: React.FormEvent, proceedToNext: boolean = true) => {
    if (e) e.preventDefault();
    if (!spaceForm.spaceName.trim()) {
      showToast("Space / Unit Name is required", "error");
      return;
    }
    const selectedBldg = buildingsList.find((b) => b.id === (spaceForm.buildingId || buildingsList[0]?.id));
    const selectedProp = propertiesList.find((p) => p.id === selectedBldg?.propertyId) || activePropertyObj;
    const propTotalArea = Number(propForm.areaSqft) || Number(selectedProp?.area) || Number(selectedBldg?.totalAreaSqft) || 0;
    const enteredArea = Number(spaceForm.areaSqft) || 0;
    if (enteredArea <= 0) {
      showToast("Please enter a valid area in Sq.Ft", "error");
      return;
    }
    if (propTotalArea > 0) {
      const alreadyAllocated = displaySpaces.reduce((acc, s) => acc + (s.area || 0), 0);
      const remainingSpace = Math.max(0, propTotalArea - alreadyAllocated);
      if (enteredArea > remainingSpace) {
        showToast(
          `Cannot add unit: ${enteredArea.toLocaleString()} Sq.Ft exceeds remaining building space (${remainingSpace.toLocaleString()} Sq.Ft available out of ${propTotalArea.toLocaleString()} Sq.Ft total).`,
          "error"
        );
        return;
      }
    }
    const bldgId = spaceForm.buildingId || buildingsList[0]?.id;
    if (!bldgId) {
      showToast("Please select or add a building first", "error");
      return;
    }
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const rawFloor = spaceForm.floorNumber || (allFloorNumbers[0] ? String(allFloorNumbers[0]) : "1");
      const floorStr = rawFloor.toLowerCase().startsWith("floor") ? rawFloor : `Floor ${rawFloor}`;

      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          space_name: spaceForm.spaceName.trim(),
          space_code: `SP-${Date.now().toString().slice(-4)}`,
          building_id: bldgId,
          chargeable_area_sqft: enteredArea,
          floor_name: floorStr,
          space_type: spaceForm.unitType.toLowerCase() === "office" ? "suite" : spaceForm.unitType.toLowerCase(),
          occupancy_status: spaceForm.occupancyStatus || "vacant",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Space "${spaceForm.spaceName}" created successfully!`);
        if (data.data?.id) {
          setContractForm((prev) => ({
            ...prev,
            spaceId: data.data.id,
            areaSqft: spaceForm.areaSqft || prev.areaSqft,
          }));
        }
        await loadHierarchyDropdowns();
        setSpaceForm((prev) => ({
          ...prev,
          spaceName: "",
          areaSqft: "",
          occupancyStatus: "vacant",
          fitoutCondition: "Fully Furnished",
          workstationsCount: "",
        }));
        if (proceedToNext) {
          setActiveTab("tenant");
        }
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create space", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Active property object currently in the wizard
  const activePropertyObj = React.useMemo(() => {
    const targetId = propForm.existingPropId || contractForm.propertyId || bldgForm.propertyId;
    if (targetId) {
      const found = propertiesList.find((p) => p.id === targetId);
      if (found) return found;
    }
    if (propForm.propertyName.trim()) {
      return { id: propForm.existingPropId || "", name: propForm.propertyName.trim() };
    }
    return propertiesList[0] || null;
  }, [propForm.existingPropId, propForm.propertyName, contractForm.propertyId, bldgForm.propertyId, propertiesList]);

  // Buildings filtered for current property
  const displayBuildings = React.useMemo(() => {
    const activePropId = propForm.existingPropId || bldgForm.propertyId || contractForm.propertyId;
    if (activePropId) {
      const filtered = buildingsList.filter((b) => b.propertyId === activePropId);
      if (filtered.length > 0) return filtered;
    }
    return buildingsList;
  }, [buildingsList, propForm.existingPropId, bldgForm.propertyId, contractForm.propertyId]);

  // Spaces filtered for current property's buildings
  const displaySpaces = React.useMemo(() => {
    if (displayBuildings.length > 0) {
      const bldgIdSet = new Set(displayBuildings.map((b) => b.id));
      const filtered = spacesList.filter((s) => s.buildingId && bldgIdSet.has(s.buildingId));
      if (filtered.length > 0) return filtered;
    }
    return spacesList;
  }, [spacesList, displayBuildings]);

  // Total leasable area across all registered properties in portfolio
  // Rule: When subscribing for rent roll, user cannot subscribe below totalPortfolioSqft
  const totalPortfolioSqft = React.useMemo(() => {
    const fromList = propertiesList.reduce((acc, p) => acc + (p.area || 0), 0);
    const curFormArea = Number(propForm.areaSqft) || 0;
    const fromSpaces = spacesList.reduce((acc, s) => acc + (s.area || 0), 0);
    const fromContracts = Number(contractForm.areaSqft) || 0;
    let stored = 0;
    if (typeof window !== "undefined") {
      stored = Number(localStorage.getItem("officex_total_portfolio_sqft") || localStorage.getItem("officex_property_area") || 0);
    }
    const isExistingInList = propertiesList.some((p) => p.id === propForm.existingPropId);
    const baseTotal = isExistingInList ? Math.max(fromList, curFormArea) : fromList + curFormArea;
    const finalTotal = Math.max(baseTotal, fromSpaces, fromContracts, stored);
    return finalTotal > 0 ? finalTotal : 0;
  }, [propertiesList, propForm.areaSqft, propForm.existingPropId, spacesList, contractForm.areaSqft]);

  useEffect(() => {
    if (typeof window !== "undefined" && totalPortfolioSqft > 0) {
      localStorage.setItem("officex_total_portfolio_sqft", String(totalPortfolioSqft));
    }
  }, [totalPortfolioSqft]);

  // Only skip Step 2 (Spaces & Units) if there are NO floors (0 floors) AND NO multiple units/bays
  const shouldSkipSpaceStep = React.useMemo(() => {
    const rawFloors = propForm.floorsCount === "0" ? 0 : Number(propForm.floorsCount);
    const hasNoFloors = rawFloors === 0;
    const hasNoMultipleUnits = !propForm.hasMultipleBuildings && floorBreakdown.length <= 1 && displaySpaces.length <= 1;
    return hasNoFloors && hasNoMultipleUnits;
  }, [propForm.floorsCount, propForm.hasMultipleBuildings, floorBreakdown.length, displaySpaces.length]);

  // Derive all active floors for the property
  const allFloorNumbers: number[] = React.useMemo(() => {
    const nums = new Set<number>();
    floorBreakdown.forEach((f) => nums.add(f.floorNumber));
    const isSingle = isSingleLevelAssetType(propForm.propertyType);
    nums.add(0); // Ground Floor is always available
    const rawFloors = propForm.floorsCount === "0" ? 0 : Number(propForm.floorsCount);
    const count = isSingle && rawFloors === 0 ? 0 : (rawFloors || 0);
    for (let i = 1; i < count; i++) nums.add(i);
    spacesList.forEach((s) => {
      const match = (s.floorName || s.name).match(/floor\s*(\d+)/i) || (s.floorName || s.name).match(/f(\d+)/i);
      if (match && match[1]) {
        nums.add(parseInt(match[1], 10));
      }
      if (/ground|bay|shed/i.test(s.floorName || s.name)) {
        nums.add(0);
      }
    });
    if (nums.size === 0) nums.add(0);
    return Array.from(nums).sort((a, b) => a - b);
  }, [floorBreakdown, propForm.floorsCount, propForm.propertyType, spacesList]);

  // Floor numbers available for the selected building in Step 3 (Space Master)
  const buildingFloorNumbersForSpace: number[] = React.useMemo(() => {
    const targetBldgId = spaceForm.buildingId || displayBuildings[0]?.id || buildingsList[0]?.id;
    const curBldg = buildingsList.find((b) => b.id === targetBldgId);
    const nums = new Set<number>();
    const isSingle = isSingleLevelAssetType(propForm.propertyType);
    nums.add(0); // Always include Ground Floor
    const rawFloors = propForm.floorsCount === "0" ? 0 : Number(propForm.floorsCount);
    const count = isSingle && rawFloors === 0 ? 0 : (curBldg?.floors || (propForm.hasMultipleBuildings ? 5 : rawFloors || 1));
    for (let i = 1; i < count; i++) nums.add(i);

    if (targetBldgId) {
      spacesList
        .filter((s) => s.buildingId === targetBldgId)
        .forEach((s) => {
          const match = (s.floorName || s.name).match(/floor\s*(\d+)/i) || (s.floorName || s.name).match(/f(\d+)/i);
          if (match && match[1]) nums.add(parseInt(match[1], 10));
          if (/ground|bay|shed/i.test(s.floorName || s.name)) nums.add(0);
        });
    }
    return Array.from(nums).sort((a, b) => a - b);
  }, [spaceForm.buildingId, displayBuildings, buildingsList, propForm.hasMultipleBuildings, propForm.floorsCount, propForm.propertyType, spacesList]);

  // Floor numbers available for the selected building/tower in Step 4 (Tenant Demised Premises)
  const buildingFloorNumbersForTenant: number[] = React.useMemo(() => {
    const targetBldgId = selectedTenantBuilding || displayBuildings[0]?.id || buildingsList[0]?.id;
    const curBldg = buildingsList.find((b) => b.id === targetBldgId);
    const nums = new Set<number>();
    const isSingle = isSingleLevelAssetType(propForm.propertyType);
    nums.add(0); // Always include Ground Floor
    const rawFloors = propForm.floorsCount === "0" ? 0 : Number(propForm.floorsCount);
    const count = isSingle && rawFloors === 0 ? 0 : (curBldg?.floors || (propForm.hasMultipleBuildings ? 5 : rawFloors || 1));
    for (let i = 1; i < count; i++) nums.add(i);

    if (targetBldgId) {
      spacesList
        .filter((s) => s.buildingId === targetBldgId)
        .forEach((s) => {
          const match = (s.floorName || s.name).match(/floor\s*(\d+)/i) || (s.floorName || s.name).match(/f(\d+)/i);
          if (match && match[1]) nums.add(parseInt(match[1], 10));
          if (/ground|bay|shed/i.test(s.floorName || s.name)) nums.add(0);
        });
    }
    return Array.from(nums).sort((a, b) => a - b);
  }, [selectedTenantBuilding, displayBuildings, buildingsList, propForm.hasMultipleBuildings, propForm.floorsCount, propForm.propertyType, spacesList]);

  // Floor numbers available for the selected building in Step 5 (Lease Contract)
  const buildingFloorNumbersForContract: number[] = React.useMemo(() => {
    const targetBldgId = contractForm.buildingId || displayBuildings[0]?.id || buildingsList[0]?.id;
    const curBldg = buildingsList.find((b) => b.id === targetBldgId);
    const nums = new Set<number>();
    const isSingle = isSingleLevelAssetType(propForm.propertyType);
    nums.add(0); // Always include Ground Floor
    const rawFloors = propForm.floorsCount === "0" ? 0 : Number(propForm.floorsCount);
    const count = isSingle && rawFloors === 0 ? 0 : (curBldg?.floors || (propForm.hasMultipleBuildings ? 5 : rawFloors || 1));
    for (let i = 1; i < count; i++) nums.add(i);

    if (targetBldgId) {
      spacesList
        .filter((s) => s.buildingId === targetBldgId)
        .forEach((s) => {
          const match = (s.floorName || s.name).match(/floor\s*(\d+)/i) || (s.floorName || s.name).match(/f(\d+)/i);
          if (match && match[1]) nums.add(parseInt(match[1], 10));
          if (/ground|bay|shed/i.test(s.floorName || s.name)) nums.add(0);
        });
    }
    return Array.from(nums).sort((a, b) => a - b);
  }, [contractForm.buildingId, displayBuildings, buildingsList, propForm.hasMultipleBuildings, propForm.floorsCount, propForm.propertyType, spacesList]);

  // Filter spaces that belong to a specific floor or ground bay
  const getSpacesForFloor = (flNum: number) => {
    return spacesList.filter((s) => {
      const flStr = (s.floorName || "").toLowerCase().trim();
      const nameStr = s.name.toLowerCase().trim();
      if (flNum === 0) {
        return (
          flStr === "0" ||
          flStr.includes("ground") ||
          flStr === "g" ||
          nameStr.includes("ground") ||
          nameStr.includes("bay") ||
          nameStr.includes("shed")
        );
      }
      return (
        flStr === `floor ${flNum}` ||
        flStr === `f${flNum}` ||
        flStr === String(flNum) ||
        (!flStr && (nameStr.startsWith(`floor ${flNum}`) || nameStr.startsWith(`f${flNum}`)))
      );
    });
  };

  // Handler to add a unit to a specific floor
  const handleSaveUnitForFloor = async (e: React.FormEvent, floorNumber: number) => {
    e.preventDefault();
    if (!newUnitForm.spaceName.trim()) {
      showToast("Unit / Space Name is required", "error");
      return;
    }
    const enteredArea = Number(newUnitForm.areaSqft) || 0;
    if (enteredArea <= 0) {
      showToast("Please enter a valid area in Sq.Ft", "error");
      return;
    }
    const bldgId = spaceForm.buildingId || buildingsList[0]?.id;
    if (!bldgId) {
      showToast("Please select or add a building first", "error");
      return;
    }
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const isG = floorNumber === 0;
      const flName = isG ? "Ground Floor" : formatFloorName(floorNumber);
      const codeSuffix = isG ? "G" : `F${floorNumber}`;
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          space_name: newUnitForm.spaceName.trim(),
          space_code: `SP-${codeSuffix}-${Date.now().toString().slice(-4)}`,
          building_id: bldgId,
          chargeable_area_sqft: enteredArea,
          floor_name: flName,
          space_type: newUnitForm.unitType.toLowerCase() === "office" ? "suite" : newUnitForm.unitType.toLowerCase(),
          occupancy_status: newUnitForm.occupancyStatus || "vacant",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Unit "${newUnitForm.spaceName}" added to ${flName}!`);
        await loadHierarchyDropdowns();
        setAddingUnitToFloor(null);
        setNewUnitForm({
          spaceName: "",
          areaSqft: "",
          unitType: "Office",
          occupancyStatus: "vacant",
          fitoutCondition: "Fully Furnished",
          workstationsCount: "",
        });
      } else {
        showToast(data.message || data.error || "Failed to create unit", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler to toggle space occupancy status between vacant and occupied
  const handleToggleOccupancy = async (spaceId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "occupied" ? "vacant" : "occupied";
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ occupancy_status: nextStatus }),
      });
      if (res.ok) {
        showToast(
          `✓ Unit marked as ${nextStatus === "occupied" ? "Occupied (Tenant Present)" : "Vacant (Available)"}!`
        );
        await loadHierarchyDropdowns();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.message || "Failed to update occupancy status", "error");
      }
    } catch {
      showToast("Network error updating occupancy status", "error");
    }
  };

  // Helper memo: Spaces on the selected floor for Step 4 Tenant Demised Premises
  const floorSpacesForTenant = React.useMemo(() => {
    if (!selectedTenantFloor) return [];
    const curBldgId = selectedTenantBuilding || displayBuildings[0]?.id || buildingsList[0]?.id;
    return spacesList.filter((s) => {
      if (displayBuildings.length > 1 && curBldgId && s.buildingId && s.buildingId !== curBldgId) {
        return false;
      }
      const flStr = (s.floorName || "").toLowerCase().trim();
      const nameStr = s.name.toLowerCase().trim();
      const targetFl = selectedTenantFloor.toLowerCase().trim();
      if (targetFl === "0") {
        return (
          flStr === "0" ||
          flStr.includes("ground") ||
          flStr === "g" ||
          nameStr.includes("ground") ||
          nameStr.includes("bay") ||
          nameStr.includes("shed")
        );
      }
      return (
        flStr === `floor ${targetFl}` ||
        flStr === `f${targetFl}` ||
        flStr === targetFl ||
        (!flStr && (nameStr.startsWith(`floor ${targetFl}`) || nameStr.startsWith(`f${targetFl}`)))
      );
    });
  }, [selectedTenantFloor, selectedTenantBuilding, displayBuildings, buildingsList, spacesList]);

  // Auto-select Ground Level for Tenant when property has no upper floors (0 floors)
  React.useEffect(() => {
    const hasZeroFloors = propForm.floorsCount === "0" || Number(propForm.floorsCount) === 0;
    if (hasZeroFloors && activeTab === "tenant" && !selectedTenantFloor) {
      setSelectedTenantFloor("0");
      setSelectedContractFloor("0");
    }
  }, [propForm.floorsCount, activeTab, selectedTenantFloor]);

  // Auto-select unit when only 1 unit exists for the floor
  React.useEffect(() => {
    if (floorSpacesForTenant.length === 1 && selectedTenantSuites.length === 0) {
      setSelectedTenantSuites([floorSpacesForTenant[0].id]);
    }
  }, [floorSpacesForTenant, selectedTenantSuites]);

  // Helper memo: Total demised area selected across suites for tenant in Step 4
  const totalTenantSelectedArea = React.useMemo(() => {
    return floorSpacesForTenant
      .filter((s) => selectedTenantSuites.includes(s.id))
      .reduce((acc, s) => acc + (s.area || 0), 0);
  }, [floorSpacesForTenant, selectedTenantSuites]);

  // Handler to delete a space/unit
  const handleDeleteSpace = async (spaceId: string, spaceName: string) => {
    if (!confirm(`Are you sure you want to remove unit "${spaceName}"?`)) return;
    setSpacesList((prev) => prev.filter((s) => s.id !== spaceId && s.name !== spaceName));
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        showToast(`✓ Removed unit "${spaceName}"`);
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.message || "Failed to delete space", "error");
      }
      await loadHierarchyDropdowns();
    } catch {
      showToast("Network error deleting space", "error");
      await loadHierarchyDropdowns();
    }
  };

  // ──── SUBMIT 4: TENANT MASTER ────
  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveContactName = (tenantForm.signatoryName || tenantForm.occupantName).trim();
    if (!effectiveContactName) {
      showToast("Authorized Signatory / Primary Contact Name is required", "error");
      return;
    }
    if (!tenantForm.email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!tenantForm.phone.trim()) {
      showToast("Phone is required", "error");
      return;
    }
    setLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const targetPropertyId = contractForm.propertyId || propForm.existingPropId || propertiesList[0]?.id || null;

      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          tenant_name: tenantForm.companyName.trim() || effectiveContactName,
          trade_name: tenantForm.tradeName.trim() || tenantForm.companyName.trim() || effectiveContactName,
          company_type: tenantForm.companyType,
          occupant_type: tenantForm.companyType === "sole_proprietorship" ? "individual" : "company",
          email: tenantForm.email.trim(),
          phone: tenantForm.phone.trim(),
          gstin: tenantForm.gst.trim().toUpperCase(),
          pan: tenantForm.pan.trim().toUpperCase(),
          billing_address: tenantForm.billingAddress.trim(),
          alt_contact_name: tenantForm.altContactName.trim(),
          alt_contact_phone: tenantForm.altContactPhone.trim(),
          property_id: targetPropertyId,
          remarks: JSON.stringify({
            company_type: tenantForm.companyType,
            trade_name: tenantForm.tradeName.trim(),
            signatory_name: effectiveContactName,
            signatory_designation: tenantForm.signatoryDesignation.trim() || "Director / Authorized Signatory",
            industry_type: tenantForm.industryType,
            cin_number: tenantForm.companyType === "sole_proprietorship" ? "" : tenantForm.cinNumber.trim().toUpperCase(),
          }),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastSavedOccupantName((tenantForm.companyName || effectiveContactName).trim());
        // Generate Tenant Portal Invite Link
        const origin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app");
        const activePropName =
          propertiesList.find((p) => p.id === contractForm.propertyId)?.name ||
          (typeof window !== "undefined" && localStorage.getItem("officex_active_property")) ||
          propForm.propertyName ||
          "Commercial Property";
        const ownerBrand =
          (typeof window !== "undefined" && (localStorage.getItem("officex_company_name") || localStorage.getItem("officex_brand_name"))) ||
          "Commercial Asset Owner";
        const isOwnerSub = checkIsOwnerSubscribed();
        const inviteToken = `ten_${Date.now()}`;
        const inviteUrl = `${origin}/invite?role=tenant&mgr=${encodeURIComponent(effectiveContactName)}&email=${encodeURIComponent(tenantForm.email.trim())}&prop=${encodeURIComponent(activePropName)}&owner=${encodeURIComponent(ownerBrand)}&owner_sub=${isOwnerSub ? "1" : "0"}&invite=${inviteToken}`;

        setLatestTenantInvite({
          name: (tenantForm.companyName || effectiveContactName).trim(),
          email: tenantForm.email.trim(),
          link: inviteUrl,
        });

        showToast(`✓ Tenant "${tenantForm.companyName || effectiveContactName}" enrolled! Portal invite link generated.`);
        await loadHierarchyDropdowns();

        // Mark all selected suites as occupied in database
        if (selectedTenantSuites.length > 0) {
          for (const sId of selectedTenantSuites) {
            await fetch(`/api/spaces/${sId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", ...authHeaders },
              body: JSON.stringify({ occupancy_status: "occupied" }),
            }).catch(() => {});
          }
        }

        // Auto-select newly created tenant and demised suites in Step 5 (Contract)
        if (data.data?.id) {
          setContractForm((prev) => ({
            ...prev,
            occupantId: data.data.id,
            spaceId: selectedTenantSuites[0] || prev.spaceId,
            areaSqft: totalTenantSelectedArea > 0 ? String(totalTenantSelectedArea) : prev.areaSqft,
          }));
        }

        if (selectedTenantFloor) {
          setSelectedContractFloor(selectedTenantFloor);
        }

        // Reset tenant form
        setTenantForm({
          companyType: "pvt_ltd",
          companyName: "",
          tradeName: "",
          occupantName: "",
          email: "",
          phone: "",
          gst: "",
          pan: "",
          billingAddress: "",
          altContactName: "",
          altContactPhone: "",
          cinNumber: "",
          industryType: "IT & Software",
          signatoryName: "",
          signatoryDesignation: "",
        });

        // Switch to contract creation
        setActiveTab("contract");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to register tenant", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── STEP 4: EXISTING TENANT DOCUMENT UPLOADER & AUTO-FILL ────
  const handleUploadTenantAgreement = async (filesToParse: FileList | File[] | File) => {
    if (!filesToParse) return;
    const fileList: File[] =
      filesToParse instanceof File
        ? [filesToParse]
        : Array.from(filesToParse as FileList);
    if (fileList.length === 0) return;

    setIsUploadingTenantAgreement(true);
    setFeedback(null);
    try {
      const allHighlights: string[] = [];
      let totalFields = 0;
      let maxConfidence = 85;
      const parsedNames: string[] = [];

      setUploadedTenantFileList(fileList.map((f) => ({ name: f.name, size: f.size, category: tenantDocCategory })));

      for (const file of fileList) {
        parsedNames.push(file.name);
        const json = await uploadAndParseAgreement(file);
        if (json && json.success && json.data) {
          const d = json.data;
          totalFields += d.extractedFieldsCount || 8;
          maxConfidence = Math.max(maxConfidence, d.confidence || 85);
          if (Array.isArray(d.summaryHighlights)) {
            allHighlights.push(...d.summaryHighlights);
          }

          // Compute comprehensive variance differences against currently entered values
          const currentSelectedTenant = tenantsList.find((t) => t.id === contractForm.occupantId);
          const currentOccupantName =
            tenantForm.companyName ||
            tenantForm.occupantName ||
            currentSelectedTenant?.name ||
            lastSavedOccupantName ||
            (tenantsList.length > 0 ? tenantsList[0].name : "");

          const currentSelectedProp = propertiesList.find((p) => p.id === contractForm.propertyId || p.id === propForm.existingPropId);
          const currentPropName =
            propForm.propertyName ||
            activePropertyObj?.name ||
            currentSelectedProp?.name ||
            lastSavedPropName ||
            (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || "" : "");

          const diffs: AgreementDiffItem[] = [];

          // 1. Commercial Property / Lessor Entity
          if (d.lessorName || d.propertyName) {
            const docProp = d.lessorName && d.propertyName && !d.lessorName.includes(d.propertyName)
              ? `${d.lessorName} (${d.propertyName})`
              : (d.lessorName || d.propertyName);
            const normCurrent = currentPropName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normDoc = docProp.toLowerCase().replace(/[^a-z0-9]/g, "");
            const hasVariance =
              !currentPropName ||
              (normCurrent !== normDoc && !normCurrent.includes(normDoc) && !normDoc.includes(normCurrent));
            diffs.push({
              fieldKey: "propertyName",
              label: "Commercial Property / Lessor",
              currentValue: currentPropName || "(Not entered)",
              agreementValue: docProp,
              hasVariance,
            });
          }

          // 2. Tenant / Occupant Legal Name
          const docTenantName = d.companyName || d.occupantName;
          if (docTenantName) {
            const normCurrent = currentOccupantName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normDoc = docTenantName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const hasVariance = !currentOccupantName || (normCurrent !== normDoc && !normCurrent.includes(normDoc));
            diffs.push({
              fieldKey: "occupantName",
              label: "Tenant / Corporate Occupant",
              currentValue: currentOccupantName || "(Not entered)",
              agreementValue: docTenantName,
              hasVariance,
            });
          }

          // 3. Tenant PAN Number
          if (d.tenantPan) {
            const curPan = (tenantForm.pan || "").toUpperCase().trim();
            const docPan = d.tenantPan.toUpperCase().trim();
            diffs.push({
              fieldKey: "pan",
              label: "Tenant PAN Number",
              currentValue: curPan || "(Not entered)",
              agreementValue: docPan,
              hasVariance: !curPan || curPan !== docPan,
            });
          }

          // 4. Demised Floor
          if (d.floor !== undefined && d.floor !== null && d.floor !== "") {
            const curFloorLabel = selectedTenantFloor !== ""
              ? (selectedTenantFloor === "0" ? "Ground Floor" : formatFloorName(Number(selectedTenantFloor)))
              : "(Not selected)";
            const docFloorNum = Number(d.floor);
            const docFloorLabel = !isNaN(docFloorNum)
              ? (docFloorNum === 0 ? "Ground Floor" : formatFloorName(docFloorNum))
              : `Floor ${d.floor}`;
            const curFloorStr = String(selectedTenantFloor || "");
            const docFloorStr = String(d.floor);
            diffs.push({
              fieldKey: "floor",
              label: "Demised Floor",
              currentValue: curFloorLabel,
              agreementValue: docFloorLabel,
              hasVariance: curFloorStr === "" || curFloorStr !== docFloorStr,
            });
          }

          // 5. Demised / Leasable Area
          if (d.areaSqft > 0) {
            const curArea = Number(contractForm.areaSqft) || totalTenantSelectedArea || Number(spaceForm.areaSqft) || Number(propForm.areaSqft) || 0;
            diffs.push({
              fieldKey: "areaSqft",
              label: "Demised / Leasable Area",
              currentValue: curArea > 0 ? `${curArea.toLocaleString()} Sq.Ft` : "(Not entered)",
              agreementValue: `${d.areaSqft.toLocaleString()} Sq.Ft`,
              hasVariance: !curArea || curArea !== d.areaSqft,
            });
          }

          // 6. Monthly Base Rent
          if (d.monthlyRent > 0) {
            const curRent = Number(contractForm.monthlyRent) || 0;
            diffs.push({
              fieldKey: "monthlyRent",
              label: "Monthly Base Rent",
              currentValue: curRent > 0 ? `₹${curRent.toLocaleString()}` : "(Not entered)",
              agreementValue: `₹${d.monthlyRent.toLocaleString()}`,
              hasVariance: !curRent || curRent !== d.monthlyRent,
            });
          }

          // 7. Security Deposit
          if (d.securityDeposit > 0) {
            const curDep = Number(contractForm.securityDeposit) || 0;
            diffs.push({
              fieldKey: "securityDeposit",
              label: "Security Deposit",
              currentValue: curDep > 0 ? `₹${curDep.toLocaleString()}` : "(Not entered)",
              agreementValue: `₹${d.securityDeposit.toLocaleString()} (${d.depositMonths || 3} months)`,
              hasVariance: !curDep || curDep !== d.securityDeposit,
            });
          }

          // 8. Lease Start Date
          if (d.startDate) {
            const curStart = contractForm.startDate;
            diffs.push({
              fieldKey: "startDate",
              label: "Lease Start Date",
              currentValue: curStart || "(Not entered)",
              agreementValue: d.startDate,
              hasVariance: !curStart || curStart !== d.startDate,
            });
          }

          // 9. Lease End Date
          if (d.endDate) {
            const curEnd = contractForm.endDate;
            diffs.push({
              fieldKey: "endDate",
              label: "Lease End Date",
              currentValue: curEnd || "(Not entered)",
              agreementValue: d.endDate,
              hasVariance: !curEnd || curEnd !== d.endDate,
            });
          }

          // 10. Lock-in Period
          if (d.lockInMonths !== undefined && d.lockInMonths > 0) {
            const curLock = Number(contractForm.lockInMonths) || 0;
            diffs.push({
              fieldKey: "lockInMonths",
              label: "Lock-in Period",
              currentValue: curLock > 0 ? `${curLock} Months` : "(Not entered)",
              agreementValue: `${d.lockInMonths} Months`,
              hasVariance: !curLock || curLock !== d.lockInMonths,
            });
          }

          // 11. Escalation Rate
          if (d.escalationPct !== undefined && d.escalationPct > 0) {
            const curEsc = Number(contractForm.escalationPct) || 0;
            diffs.push({
              fieldKey: "escalationPct",
              label: "Escalation Rate",
              currentValue: curEsc > 0 ? `${curEsc}% (${contractForm.escalationFrequency})` : "(Not entered)",
              agreementValue: `${d.escalationPct}% (${d.escalationFrequency || "Annual"})`,
              hasVariance: !curEsc || curEsc !== d.escalationPct || contractForm.escalationFrequency !== d.escalationFrequency,
            });
          }

          // Save pending agreement data and variance differences
          setPendingAgreementData(d);
          setPendingAgreementFile(file.name);
          setAgreementDifferences(diffs);

          // Auto-populate all form fields so user can review and edit missing particulars immediately
          applyAgreementTerms(d, diffs);

          // Open variance modal so user can inspect differences side-by-side
          setVarianceModalOpen(true);
        }
      }

      setParsedTenantDocMeta({
        fileName: parsedNames.join(", "),
        confidence: maxConfidence || 92,
        extractedFieldsCount: totalFields || 8,
        summaryHighlights: Array.from(new Set(allHighlights)),
        category: tenantDocCategory,
      });

      showToast(`✓ Document terms parsed! Review differences and edit any missing fields below.`);
    } catch (err: any) {
      showToast(err.message || "Failed to extract terms from agreement file", "error");
    } finally {
      setIsUploadingTenantAgreement(false);
    }
  };

  // ──── LEASE AGREEMENT PARSING & AUTO-POPULATION WITH DIFFERENCE REVIEW ────
  const handleUploadRentAgreement = async (file: File) => {
    if (!file) return;
    setIsUploadingAgreement(true);
    setFeedback(null);
    try {
      const json = await uploadAndParseAgreement(file);
      if (json && json.success && json.data) {
        const d = json.data;
        setParsedAgreementMeta({
          fileName: json.fileName,
          confidence: d.confidence || 90,
          extractedFieldsCount: d.extractedFieldsCount || 12,
          summaryHighlights: d.summaryHighlights || [],
        });

        // Compute differences between currently entered data and extracted agreement data
        const currentSelectedTenant = tenantsList.find((t) => t.id === contractForm.occupantId);
        const currentOccupantName =
          tenantForm.occupantName ||
          currentSelectedTenant?.name ||
          lastSavedOccupantName ||
          (tenantsList.length > 0 ? tenantsList[0].name : "");

        const currentSelectedProp = propertiesList.find((p) => p.id === contractForm.propertyId || p.id === propForm.existingPropId);
        const currentPropName =
          propForm.propertyName ||
          currentSelectedProp?.name ||
          lastSavedPropName ||
          (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || "" : "");

        const diffs: AgreementDiffItem[] = [];

        // 1. Occupant / Tenant Name
        if (d.occupantName) {
          const hasVariance =
            currentOccupantName !== "" &&
            currentOccupantName.toLowerCase().trim() !== d.occupantName.toLowerCase().trim();
          diffs.push({
            fieldKey: "occupantName",
            label: "Tenant / Occupant Name",
            currentValue: currentOccupantName || "(Not entered)",
            agreementValue: d.occupantName,
            hasVariance: hasVariance || (!currentOccupantName && !!d.occupantName),
          });
        }

        // 2. Commercial Property / Lessor Entity
        if (d.lessorName || d.propertyName) {
          const docProp = d.lessorName || d.propertyName;
          const normCurrent = currentPropName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normDoc = docProp.toLowerCase().replace(/[^a-z0-9]/g, "");
          const hasVariance =
            currentPropName !== "" &&
            normCurrent !== normDoc &&
            (!normCurrent || !normDoc || (!normCurrent.includes(normDoc) && !normDoc.includes(normCurrent)));
          diffs.push({
            fieldKey: "propertyName",
            label: "Commercial Property / Lessor",
            currentValue: currentPropName || "(Not entered)",
            agreementValue: docProp,
            hasVariance: hasVariance || (!currentPropName && !!docProp),
          });
        }

        // 3. Leasable Area (Sq.Ft)
        if (d.areaSqft > 0) {
          const curArea = Number(contractForm.areaSqft) || Number(spaceForm.areaSqft) || Number(propForm.areaSqft) || 0;
          const hasVariance = curArea > 0 && curArea !== d.areaSqft;
          diffs.push({
            fieldKey: "areaSqft",
            label: "Leasable Area",
            currentValue: curArea > 0 ? `${curArea.toLocaleString()} Sq.Ft` : "(Not entered)",
            agreementValue: `${d.areaSqft.toLocaleString()} Sq.Ft`,
            hasVariance: hasVariance || (!curArea && d.areaSqft > 0),
          });
        }

        // 3. Monthly Rent
        if (d.monthlyRent > 0) {
          const curRent = Number(contractForm.monthlyRent) || 0;
          const hasVariance = curRent > 0 && curRent !== d.monthlyRent;
          diffs.push({
            fieldKey: "monthlyRent",
            label: "Monthly Base Rent",
            currentValue: curRent > 0 ? `₹${curRent.toLocaleString()}` : "(Not entered)",
            agreementValue: `₹${d.monthlyRent.toLocaleString()}`,
            hasVariance: hasVariance || (!curRent && d.monthlyRent > 0),
          });
        }

        // 4. Rate per Sq.Ft
        if (d.ratePerSqft > 0) {
          const curRate = Number(contractForm.ratePerSqft) || 0;
          const hasVariance = curRate > 0 && curRate !== d.ratePerSqft;
          diffs.push({
            fieldKey: "ratePerSqft",
            label: "Rate PSF",
            currentValue: curRate > 0 ? `₹${curRate}/sqft` : "(Not entered)",
            agreementValue: `₹${d.ratePerSqft}/sqft`,
            hasVariance: hasVariance || (!curRate && d.ratePerSqft > 0),
          });
        }

        // 5. Security Deposit
        if (d.securityDeposit > 0) {
          const curDep = Number(contractForm.securityDeposit) || 0;
          const hasVariance = curDep > 0 && curDep !== d.securityDeposit;
          diffs.push({
            fieldKey: "securityDeposit",
            label: "Security Deposit",
            currentValue: curDep > 0 ? `₹${curDep.toLocaleString()}` : "(Not entered)",
            agreementValue: `₹${d.securityDeposit.toLocaleString()}`,
            hasVariance: hasVariance || (!curDep && d.securityDeposit > 0),
          });
        }

        // 6. Start Date
        if (d.startDate) {
          const curStart = contractForm.startDate;
          const hasVariance = curStart !== "" && curStart !== d.startDate;
          diffs.push({
            fieldKey: "startDate",
            label: "Lease Start Date",
            currentValue: curStart || "(Not entered)",
            agreementValue: d.startDate,
            hasVariance: hasVariance || (!curStart && !!d.startDate),
          });
        }

        // 7. End Date
        if (d.endDate) {
          const curEnd = contractForm.endDate;
          const hasVariance = curEnd !== "" && curEnd !== d.endDate;
          diffs.push({
            fieldKey: "endDate",
            label: "Lease End Date",
            currentValue: curEnd || "(Not entered)",
            agreementValue: d.endDate,
            hasVariance: hasVariance || (!curEnd && !!d.endDate),
          });
        }

        // 8. Escalation %
        if (d.escalationPct !== undefined) {
          const curEsc = Number(contractForm.escalationPct) || 0;
          const hasVariance = curEsc > 0 && curEsc !== d.escalationPct;
          diffs.push({
            fieldKey: "escalationPct",
            label: "Escalation Rate",
            currentValue: `${contractForm.escalationPct}% (${contractForm.escalationFrequency})`,
            agreementValue: `${d.escalationPct}% (${d.escalationFrequency})`,
            hasVariance: hasVariance || contractForm.escalationFrequency !== d.escalationFrequency,
          });
        }

        // 9. Lock-in Period
        if (d.lockInMonths !== undefined && d.lockInMonths > 0) {
          const curLock = Number(contractForm.lockInMonths) || 0;
          const hasVariance = curLock > 0 && curLock !== d.lockInMonths;
          diffs.push({
            fieldKey: "lockInMonths",
            label: "Lock-in Period",
            currentValue: curLock > 0 ? `${curLock} Months` : "(Not entered)",
            agreementValue: `${d.lockInMonths} Months`,
            hasVariance: hasVariance || (!curLock && d.lockInMonths > 0),
          });
        }

        // Save pending data & differences
        setPendingAgreementData(d);
        setPendingAgreementFile(json.fileName);
        setAgreementDifferences(diffs);

        // Check if there are real variances (mismatches)
        const realDiscrepancies = diffs.filter((x) => x.hasVariance);
        if (realDiscrepancies.length > 0) {
          setVarianceModalOpen(true);
        } else {
          // If no conflicts, apply automatically
          applyAgreementTerms(d, diffs);
        }
      } else {
        showToast(json?.error || "Failed to extract text from agreement file", "error");
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`, "error");
    } finally {
      setIsUploadingAgreement(false);
    }
  };

  // ──── APPLY AGREEMENT PARTICULARS WITH TEMPORARY YELLOW HIGHLIGHT ────
  const applyAgreementTerms = (d: any, diffsList?: AgreementDiffItem[]) => {
    if (!d) return;

    const authHeaders = getClientAuthHeaders();

    // 1. Auto-match or detect occupant
    let targetOccupantId = contractForm.occupantId || (tenantsList.length > 0 ? tenantsList[0].id : "");
    const targetTenantName = d.companyName || d.occupantName;

    if (targetTenantName) {
      const matchedTenant = tenantsList.find(
        (t) =>
          t.name.toLowerCase().includes(targetTenantName.toLowerCase()) ||
          targetTenantName.toLowerCase().includes(t.name.toLowerCase()) ||
          (t.company && d.companyName && t.company.toLowerCase().includes(d.companyName.toLowerCase()))
      );

      if (matchedTenant) {
        targetOccupantId = matchedTenant.id;
        setTenantsList((prev) =>
          prev.map((t) =>
            t.id === targetOccupantId
              ? { ...t, name: targetTenantName, company: d.companyName || targetTenantName }
              : t
          )
        );
      } else if (targetOccupantId) {
        setTenantsList((prev) =>
          prev.map((t) =>
            t.id === targetOccupantId
              ? { ...t, name: targetTenantName, company: d.companyName || targetTenantName }
              : t
          )
        );
      } else {
        const newTenantId = `ten_${Date.now()}`;
        setTenantsList((prev) => [
          ...prev,
          { id: newTenantId, name: targetTenantName, company: d.companyName || targetTenantName },
        ]);
        targetOccupantId = newTenantId;
      }
    }

    // 2. Comprehensive Auto-fill of Tenant Form
    setTenantForm((prev) => {
      const nextCompanyType = d.companyType || prev.companyType || "pvt_ltd";
      const nextOccupant = d.occupantName || d.companyName || prev.occupantName;
      const nextCompany = d.companyName || d.occupantName || prev.companyName;
      const nextPan = (d.tenantPan || prev.pan).toUpperCase().slice(0, 10);
      const nextCin = nextCompanyType === "sole_proprietorship" ? "" : (d.tenantCin || prev.cinNumber).toUpperCase().slice(0, 21);
      const nextGst = (d.tenantGst || prev.gst).toUpperCase().slice(0, 15);
      const nextPhone = d.tenantPhone || prev.phone;
      const nextEmail =
        d.tenantEmail ||
        prev.email ||
        (nextOccupant
          ? `${nextOccupant.toLowerCase().replace(/[^a-z0-9]/g, "")}@corp.com`
          : prev.email);
      const nextAddress = d.tenantAddress || prev.billingAddress;
      const nextSignatory = d.signatoryName || prev.signatoryName;

      return {
        ...prev,
        companyType: nextCompanyType,
        occupantName: nextOccupant,
        companyName: nextCompany,
        tradeName: nextCompany,
        pan: nextPan,
        cinNumber: nextCin,
        gst: nextGst,
        phone: nextPhone,
        email: nextEmail,
        billingAddress: nextAddress,
        signatoryName: nextSignatory,
      };
    });

    // 3. Demised Floor & Unit Selection
    let targetSpaceId = contractForm.spaceId;
    if (d.floor !== undefined && d.floor !== null && d.floor !== "") {
      const flStr = String(d.floor);
      setSelectedTenantFloor(flStr);
      setSelectedContractFloor(flStr);

      const floorSpaces = spacesList.filter((s) => {
        const sFl = (s.floorName || "").toLowerCase().trim();
        return (
          sFl === `floor ${flStr}` ||
          sFl === `f${flStr}` ||
          sFl === flStr ||
          sFl === formatFloorName(Number(flStr)).toLowerCase() ||
          (flStr === "0" && (sFl.includes("ground") || sFl === "g"))
        );
      });
      const matchedSpace = floorSpaces.find((s) => Math.abs((s.area || 0) - (d.areaSqft || 0)) < 100);
      if (matchedSpace) {
        setSelectedTenantSuites([matchedSpace.id]);
        targetSpaceId = matchedSpace.id;
      }
    } else if (d.areaSqft > 0) {
      const matchedSpace = spacesList.find((s) => Math.abs((s.area || 0) - d.areaSqft) < 100);
      if (matchedSpace) {
        targetSpaceId = matchedSpace.id;
        setSelectedTenantSuites([matchedSpace.id]);
      }
    }

    // 4. Commercial Property / Lessor match or update
    let targetPropertyId = contractForm.propertyId || propForm.existingPropId;
    if (d.propertyName || d.lessorName) {
      const docPropName = d.propertyName || d.lessorName;
      setPropForm((prev) => {
        const finalPropName = prev.propertyName || docPropName;
        const codeForDoc = prev.propertyCode || (finalPropName.trim() ? generateUniquePropertyCode(finalPropName.trim(), propertiesList.map((p) => p.name)) : "");
        return {
          ...prev,
          propertyName: finalPropName,
          propertyCode: codeForDoc,
          address: prev.address || d.tenantAddress || prev.address,
        };
      });
      const normDoc = docPropName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedProp = propertiesList.find((p) => {
        const normP = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normP === normDoc || (normDoc.length >= 8 && normP.includes(normDoc)) || (normP.length >= 8 && normDoc.includes(normP));
      });
      if (matchedProp) {
        targetPropertyId = matchedProp.id;
      }
    }

    // 5. Billing SPV match or add
    if (d.billingEntity) {
      setBillingEntities((prev) => Array.from(new Set([...prev, d.billingEntity])));
    }

    // 6. Contract Form Auto-fill
    const calculatedRatePsf = d.ratePerSqft > 0
      ? d.ratePerSqft
      : (d.monthlyRent > 0 && d.areaSqft > 0 ? Math.round((d.monthlyRent / d.areaSqft) * 100) / 100 : 0);
    const calculatedDepositMonths = d.depositMonths > 0
      ? d.depositMonths
      : (d.securityDeposit > 0 && d.monthlyRent > 0 ? Math.round(d.securityDeposit / d.monthlyRent) : 0);

    setContractForm((prev) => ({
      ...prev,
      occupantId: targetOccupantId || prev.occupantId,
      propertyId: targetPropertyId || prev.propertyId,
      spaceId: targetSpaceId || prev.spaceId,
      areaSqft: d.areaSqft > 0 ? String(d.areaSqft) : prev.areaSqft,
      billingModel: d.billingModel || prev.billingModel || "Area-based",
      ratePerSqft: calculatedRatePsf > 0 ? String(calculatedRatePsf) : prev.ratePerSqft,
      ratePerSeat: d.ratePerSeat ? String(d.ratePerSeat) : prev.ratePerSeat,
      seatCount: d.seatCount ? String(d.seatCount) : prev.seatCount,
      bareShellRate: d.bareShellRate ? String(d.bareShellRate) : prev.bareShellRate,
      fitoutRate: d.fitoutRate ? String(d.fitoutRate) : prev.fitoutRate,
      monthlyRent: d.monthlyRent > 0 ? String(d.monthlyRent) : prev.monthlyRent,
      camType: d.camType || prev.camType,
      camRate: d.camRate > 0 ? String(d.camRate) : prev.camRate,
      camMonthly: d.camMonthly > 0 ? String(d.camMonthly) : prev.camMonthly,
      carParkingSlots: d.carParkingSlots !== undefined ? String(d.carParkingSlots) : prev.carParkingSlots,
      carParkingRate: d.carParkingRate !== undefined ? String(d.carParkingRate) : prev.carParkingRate,
      twoWheelerSlots: d.twoWheelerSlots !== undefined ? String(d.twoWheelerSlots) : prev.twoWheelerSlots,
      twoWheelerRate: d.twoWheelerRate !== undefined ? String(d.twoWheelerRate) : prev.twoWheelerRate,
      securityDeposit: d.securityDeposit > 0 ? String(d.securityDeposit) : prev.securityDeposit,
      depositMonths: calculatedDepositMonths > 0 ? String(calculatedDepositMonths) : prev.depositMonths,
      fitoutDays: d.fitoutDays !== undefined ? String(d.fitoutDays) : prev.fitoutDays,
      lockInMonths: d.lockInMonths !== undefined ? String(d.lockInMonths) : prev.lockInMonths,
      noticeDays: d.noticeDays !== undefined ? String(d.noticeDays) : prev.noticeDays,
      startDate: d.startDate || prev.startDate,
      endDate: d.endDate || prev.endDate,
      escalationPct: d.escalationPct !== undefined ? String(d.escalationPct) : prev.escalationPct,
      escalationFrequency: d.escalationFrequency === "Triennial" ? "Biannual" : (d.escalationFrequency || prev.escalationFrequency),
      escalationStartDate: d.escalationStartDate || prev.escalationStartDate,
      billingEntity: d.billingEntity || d.lessorName || prev.billingEntity,
      paymentTerms: d.paymentTerms || prev.paymentTerms,
      stampDutySharing: d.stampDutySharing || prev.stampDutySharing,
      notes: d.notes || prev.notes,
    }));

    // Record changed keys for yellow highlight
    const list = diffsList || agreementDifferences;
    const changed = new Set([
      "occupantName",
      "companyName",
      "pan",
      "cinNumber",
      "gst",
      "phone",
      "email",
      "billingAddress",
      "areaSqft",
      "monthlyRent",
      "ratePerSqft",
      "securityDeposit",
      "startDate",
      "endDate",
      "lockInMonths",
      "escalationPct",
      ...list.filter((x) => x.hasVariance).map((x) => x.fieldKey),
    ]);
    setChangedFieldKeys(changed);

    showToast(
      `✓ Agreement terms applied! All tenant particulars & lease parameters filled.`
    );
  };

  // ──── SUBMIT 5: CONTRACT / LEASE ────
  const handleSaveContract = async (e: React.FormEvent, targetAction: "finish" | "delegate" = "finish") => {
    e.preventDefault();
    if (!contractForm.occupantId) {
      showToast("Please select an occupant / tenant", "error");
      return;
    }
    if (!contractForm.spaceId) {
      showToast("Please select a space / unit", "error");
      return;
    }
    if (!contractForm.startDate || !contractForm.endDate) {
      showToast("Start and End dates are compulsory", "error");
      return;
    }
    const enteredRent = Number(contractForm.monthlyRent) || 0;
    if (enteredRent <= 0) {
      showToast("Please provide or calculate Monthly Rent Amount", "error");
      return;
    }

    setLoading(true);
    try {
      const dbBillingModel =
        contractForm.billingModel === "Seat-based"
          ? "seats"
          : contractForm.billingModel === "Fixed"
          ? "fixed"
          : "area";

      const camAmount =
        contractForm.camType === "Included"
          ? 0
          : contractForm.camType === "Per Sq.Ft"
          ? Math.round((Number(contractForm.camRate) || 0) * (Number(contractForm.areaSqft) || 0))
          : Number(contractForm.camMonthly) || 0;

      const carPaid = Number(contractForm.carParkingPaidSlots) || 0;
      const carFree = Number(contractForm.carParkingFreeSlots) || 0;
      const carRate = Number(contractForm.carParkingRate) || 0;
      const bikePaid = Number(contractForm.twoWheelerPaidSlots) || 0;
      const bikeFree = Number(contractForm.twoWheelerFreeSlots) || 0;
      const bikeRate = Number(contractForm.twoWheelerRate) || 0;
      const parkingAmount = (carPaid * carRate) + (bikePaid * bikeRate);

      const notesSummary = [
        contractForm.notes,
        contractForm.billingModel ? `Model: ${contractForm.billingModel}` : null,
        contractForm.ratePerSqft ? `Rate PSF: ₹${contractForm.ratePerSqft}/sqft` : null,
        contractForm.ratePerSeat ? `Rate Seat: ₹${contractForm.ratePerSeat}/seat (${contractForm.seatCount} seats)` : null,
        contractForm.camType === "Included" ? "CAM: Included in Base Rent" : (camAmount > 0 ? `CAM: ₹${camAmount.toLocaleString()}/mo (${contractForm.camType})` : null),
        parkingAmount > 0 ? `Parking: ₹${parkingAmount.toLocaleString()}/mo (${carFree + carPaid} Cars [${carFree} Free, ${carPaid} Paid], ${bikeFree + bikePaid} Bikes [${bikeFree} Free, ${bikePaid} Paid])` : null,
        contractForm.fitoutDays ? `Fit-out Period: ${contractForm.fitoutDays} days` : null,
        contractForm.stampDutySharing ? `Stamp Duty: ${contractForm.stampDutySharing}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const authHeaders = getClientAuthHeaders();

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          occupant_id: contractForm.occupantId,
          space_id: contractForm.spaceId,
          contract_code: `LEAS-${Date.now().toString().slice(-5)}`,
          start_date: contractForm.startDate,
          end_date: contractForm.endDate,
          contract_type: "lease",
          base_rent_rate: enteredRent,
          billing_model: dbBillingModel,
          escalation_type: "percentage",
          escalation_value: Number(contractForm.escalationPct) || 0,
          has_escalation: Boolean(Number(contractForm.escalationPct) > 0),
          deposit_amount_inr: Number(contractForm.securityDeposit) || 0,
          lock_in_period_days: (Number(contractForm.lockInMonths) || 0) * 30,
          notice_period_days: Number(contractForm.noticeDays) || 90,
          billing_entity: contractForm.billingEntity.trim(),
          payment_terms: contractForm.paymentTerms.trim(),
          remarks: notesSummary,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess?.();
        if (targetAction === "delegate") {
          showToast("✓ Commercial Lease Contract registered! Proceeding to Management Assignment.");
          setDelegationForm((prev) => ({
            ...prev,
            propertyId: contractForm.propertyId || propForm.existingPropId || prev.propertyId,
            propertyName:
              propertiesList.find((p) => p.id === (contractForm.propertyId || propForm.existingPropId))?.name ||
              propForm.propertyName ||
              prev.propertyName,
          }));
          setActiveTab("delegation");
        } else {
          showToast("✓ Commercial Lease Contract registered successfully! Setup complete.");
          setPostContractChoice("self_managed");
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        showToast(data.message || data.error || "Failed to create lease contract", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Space select auto-fills area
  const handleSpaceSelect = (spaceId: string) => {
    const selected = spacesList.find((s) => s.id === spaceId);
    setContractForm((prev) => ({
      ...prev,
      spaceId,
      areaSqft: selected ? String(selected.area || "") : prev.areaSqft,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Top Decorative Gradient */}
        <div className="h-2 bg-gradient-to-r from-[#0F8B7D] via-teal-400 to-[#071324] shrink-0 rounded-t-3xl" />

        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Asset &amp; Lease Setup
                </span>
                <span className="text-xs text-slate-400 font-semibold">Live Operational Setup</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Commercial Hierarchy &amp; Lease Setup
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExcelImporterOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Bulk import properties, units, and tenants via spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload in Bulk</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`mx-5 sm:mx-7 mt-3 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-1 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Temporary Highlight Indicator Banner */}
        {changedFieldKeys.size > 0 && (
          <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>
                <strong>{changedFieldKeys.size} field{changedFieldKeys.size > 1 ? "s" : ""} updated</strong> according to Rent Agreement (highlighted in yellow below). Click anywhere or edit to dismiss.
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setChangedFieldKeys(new Set());
              }}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
            >
              Dismiss Highlight
            </button>
          </div>
        )}

        {/* Navigation Tabs (5 Steps or 4 Steps when skipping Space step) */}
        <div className="px-5 sm:px-7 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto shrink-0 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab("property")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "property"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 size={14} />
            <span>{shouldSkipSpaceStep ? "1. Property & Facility" : "1. Property & Towers"}</span>
          </button>

          {!shouldSkipSpaceStep && (
            <button
              type="button"
              onClick={() => setActiveTab("space")}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "space"
                  ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={14} />
              <span>2. Spaces &amp; Units ({displaySpaces.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("tenant")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "tenant"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User size={14} />
            <span>{shouldSkipSpaceStep ? `2. Tenants (${tenantsList.length})` : `3. Tenants (${tenantsList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contract")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "contract"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText size={14} />
            <span>{shouldSkipSpaceStep ? "3. Lease Contract" : "4. Lease Contract"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("delegation")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "delegation"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck size={14} />
            <span>{shouldSkipSpaceStep ? "4. Assign Management" : "5. Assign Management"}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 flex-1">
          {/* ════════════════ TAB 1: PROPERTY MASTER & LEGAL ENTITY ════════════════ */}
          {activeTab === "property" && (
            <form onSubmit={handleSaveProperty} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Property &amp; Towers Setup
                    </h3>
                    <span className="inline-flex items-center text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
                      Step 1 of 5
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Basic information, campus architecture, and legal entity details.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetPropertyForm();
                      showToast("✓ Property form cleared");
                    }}
                    title="Clear all fields to start a blank property"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw size={12} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* ──── SECTION 1: PRIMARY BUILDING & COMMERCIAL ASSET SPECS ──── */}
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Building2 size={14} className="text-teal-700" />
                  <span>Asset Profile &amp; Dimensions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Property Name */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Property Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Divi Towers / Prestige Tech Park"
                      value={propForm.propertyName}
                      onChange={(e) => {
                        const name = e.target.value;
                        if (!name.trim()) {
                          setPropForm((prev) => ({ ...prev, propertyName: name, propertyCode: "" }));
                          return;
                        }
                        const immediateCode = generateUniquePropertyCode(name.trim(), propertiesList.map((p) => p.name));
                        setPropForm((prev) => ({ ...prev, propertyName: name, propertyCode: immediateCode }));

                        // Query backend for guaranteed global uniqueness across all properties & users
                        fetch(`/api/rent-roll/properties/generate-code?name=${encodeURIComponent(name.trim())}`)
                          .then((r) => r.json())
                          .then((data) => {
                            if (data && data.success && data.code) {
                              setPropForm((prev) => {
                                if (prev.propertyName.trim() === name.trim()) {
                                  return { ...prev, propertyCode: data.code };
                                }
                                return prev;
                              });
                            }
                          })
                          .catch(() => {});
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* Property Code */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Property Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        required
                        placeholder="Auto-generated once name is entered"
                        value={propForm.propertyCode}
                        className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 outline-none uppercase select-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        title="Regenerate property code"
                        onClick={async () => {
                          if (!propForm.propertyName.trim()) {
                            showToast("Please enter a property name first", "error");
                            return;
                          }
                          try {
                            const res = await fetch(`/api/rent-roll/properties/generate-code?name=${encodeURIComponent(propForm.propertyName.trim())}`);
                            const data = await res.json();
                            if (data && data.success && data.code) {
                              setPropForm((prev) => ({ ...prev, propertyCode: data.code }));
                              showToast(`✓ Generated unique property code: ${data.code}`);
                              return;
                            }
                          } catch {}
                          const newCode = generateUniquePropertyCode(
                            propForm.propertyName.trim(),
                            propertiesList.map((p) => p.name)
                          );
                          setPropForm((prev) => ({ ...prev, propertyCode: newCode }));
                          showToast("✓ Generated new property code");
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#0F8B7D] rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Asset Type Selector */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Commercial Asset Type *</label>
                    <select
                      value={propForm.propertyType}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer"
                    >
                      {COMMERCIAL_ASSET_TYPES.map((type) => (
                        <option key={type.id} value={type.label}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Total Leasable Area */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Total Leasable Area (Sq.Ft) *
                    </label>
                    <input
                      type="number"
                      min="10"
                      required
                      placeholder="e.g. 50000"
                      value={propForm.areaSqft}
                      onChange={(e) => handleAreaSqftChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* Tower / Building Architecture - Asset-type aware Segmented Toggle */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="font-semibold text-slate-700 block text-xs">
                      {isSingleLevelAssetType(propForm.propertyType) ? "Facility Architecture" : "Property Architecture"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setPropForm({ ...propForm, hasMultipleBuildings: false, buildingsCount: "1" })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                          !propForm.hasMultipleBuildings
                            ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/70"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Building size={14} className={!propForm.hasMultipleBuildings ? "text-[#0F8B7D]" : "text-slate-400"} />
                        <span>
                          {isSingleLevelAssetType(propForm.propertyType)
                            ? "Single Facility (1 Shed / Warehouse)"
                            : "Single Building (1 Tower)"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPropForm({
                            ...propForm,
                            hasMultipleBuildings: true,
                            buildingsCount: propForm.buildingsCount && propForm.buildingsCount !== "1" ? propForm.buildingsCount : "2",
                          })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                          propForm.hasMultipleBuildings
                            ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/70"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Layers size={14} className={propForm.hasMultipleBuildings ? "text-[#0F8B7D]" : "text-slate-400"} />
                        <span>
                          {isSingleLevelAssetType(propForm.propertyType)
                            ? "Campus (Multiple Sheds / Units)"
                            : "Campus / Multiple Towers"}
                        </span>
                      </button>
                    </div>

                    {propForm.hasMultipleBuildings && (
                      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs animate-in fade-in">
                        <span className="font-semibold text-slate-700">
                          {isSingleLevelAssetType(propForm.propertyType) ? "Total Sheds in Campus:" : "Total Towers in Campus:"}
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          placeholder="2"
                          value={propForm.buildingsCount || "2"}
                          onChange={(e) => handleBuildingsCountChange(e.target.value)}
                          className="w-16 px-2.5 py-1 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* ──── CONDITIONAL: MULTIPLE TOWERS BREAKDOWN vs SINGLE BUILDING FLOOR BREAKDOWN ──── */}
                  {propForm.hasMultipleBuildings ? (
                    /* ──── MULTIPLE TOWERS / CAMPUS CONFIGURATION ──── */
                    <div className="sm:col-span-2 p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-2">
                        <div>
                          <span className="text-xs font-black uppercase text-teal-950 block">
                            Campus Towers &amp; Buildings Configuration ({towersBreakdown.length} Towers)
                          </span>
                          <span className="text-[11px] text-teal-700 font-medium">
                            Configure each tower with its name, floor count, and leasable area.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={autoDistributeTowerArea}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                          >
                            <Calculator size={13} />
                            <span>Distribute Area Equally</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleAddTower}
                            className="px-3 py-1.5 rounded-xl border border-teal-300 bg-white hover:bg-teal-100 text-teal-900 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                          >
                            <Plus size={13} />
                            <span>+ Add Tower</span>
                          </button>
                        </div>
                      </div>

                      {/* List of Towers */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {towersBreakdown.map((tower, idx) => (
                          <div
                            key={tower.id}
                            className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                              {/* Tower Badge */}
                              <div className="sm:col-span-1 flex items-center justify-center">
                                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                                  T{idx + 1}
                                </span>
                              </div>

                              {/* Tower Name */}
                              <div className="sm:col-span-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                  Tower / Building Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder={`e.g. Tower ${String.fromCharCode(65 + idx)}`}
                                  value={tower.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTowersBreakdown((prev) =>
                                      prev.map((t, i) => (i === idx ? { ...t, name: val } : t))
                                    );
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 focus:border-[#0F8B7D] outline-none"
                                />
                              </div>

                              {/* Floors Count */}
                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                  Floors in this Tower *
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    required
                                    placeholder="e.g. 5"
                                    value={tower.floorsCount}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTowersBreakdown((prev) =>
                                        prev.map((t, i) => (i === idx ? { ...t, floorsCount: val } : t))
                                      );
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 focus:border-[#0F8B7D] outline-none"
                                  />
                                  <span className="text-[11px] font-medium text-slate-400 shrink-0">Floors</span>
                                </div>
                              </div>

                              {/* Leasable Area */}
                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                  Leasable Area (Sq.Ft) *
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 15000"
                                    value={tower.areaSqft}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTowersBreakdown((prev) =>
                                        prev.map((t, i) => (i === idx ? { ...t, areaSqft: val } : t))
                                      );
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 focus:border-[#0F8B7D] outline-none"
                                  />
                                  <span className="text-[11px] font-medium text-slate-400 shrink-0">Sq.Ft</span>
                                </div>
                              </div>

                              {/* Remove Tower Button */}
                              <div className="sm:col-span-1 flex items-center justify-end">
                                {towersBreakdown.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTower(idx)}
                                    title="Remove this tower"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Tower Gate / Wing Landmark or Address */}
                            <div className="pt-1.5 border-t border-slate-100 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                Tower Gate / Wing Location:
                              </span>
                              <input
                                type="text"
                                placeholder="e.g. North Boulevard Entrance / Wing B Gate"
                                value={tower.gateOrAddress || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTowersBreakdown((prev) =>
                                    prev.map((t, i) => (i === idx ? { ...t, gateOrAddress: val } : t))
                                  );
                                }}
                                className="flex-1 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 focus:border-[#0F8B7D] outline-none bg-slate-50/50"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Towers Area & Floors Summary */}
                      {(() => {
                        const totalAllocated = towersBreakdown.reduce((sum, t) => sum + (Number(t.areaSqft) || 0), 0);
                        const totalFloors = towersBreakdown.reduce((sum, t) => sum + (Number(t.floorsCount) || 0), 0);
                        const totalPropArea = Number(propForm.areaSqft) || 0;
                        const diff = totalPropArea - totalAllocated;
                        return (
                          <div className="pt-2 border-t border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
                            <div className="flex items-center gap-2.5 text-slate-700">
                              <span>Total Towers: <strong className="text-teal-900 font-black">{towersBreakdown.length}</strong></span>
                              <span>•</span>
                              <span>Total Floors: <strong className="text-slate-900">{totalFloors} Floors</strong></span>
                              <span>•</span>
                              <span>Allocated Area: <strong className="font-mono text-slate-900">{totalAllocated.toLocaleString()} Sq.Ft</strong></span>
                            </div>
                            {totalPropArea > 0 && (
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold self-start sm:self-auto ${
                                  diff === 0
                                    ? "bg-emerald-100 text-emerald-800"
                                    : diff > 0
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-rose-100 text-rose-900"
                                }`}
                              >
                                {diff === 0
                                  ? "✓ Matches Total Property Leasable Area"
                                  : diff > 0
                                  ? `${diff.toLocaleString()} Sq.Ft Unallocated`
                                  : `Exceeds Property Area by ${Math.abs(diff).toLocaleString()} Sq.Ft`}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* ──── SINGLE BUILDING / SHED LEVEL CONFIGURATION ──── */
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 block">
                            {isSingleLevelAssetType(propForm.propertyType)
                              ? "Facility Levels / Upper Floors *"
                              : "Total Floors (Ground + Upper Floors, min 1) *"}
                          </label>
                          <span className="text-[11px] text-teal-700 font-semibold">
                            {isSingleLevelAssetType(propForm.propertyType)
                              ? "0 = Single Ground Shed · 1 = Ground + Mezzanine"
                              : "1 = Ground Floor only · 2 = Ground + 1st Floor"}
                          </span>
                        </div>
                        <input
                          type="number"
                          min={isSingleLevelAssetType(propForm.propertyType) ? 0 : 1}
                          max={50}
                          required
                          placeholder={isSingleLevelAssetType(propForm.propertyType) ? "0 (Ground Level)" : "e.g. 5 (Ground + 4 Upper Floors)"}
                          value={propForm.floorsCount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!isSingleLevelAssetType(propForm.propertyType) && val === "0") {
                              handleFloorsCountChange("1");
                            } else {
                              handleFloorsCountChange(val);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>

                      {/* Dynamic Space / Floor / Bay Breakdown Table */}
                      {floorBreakdown.length > 0 && (
                        <div className="sm:col-span-2 p-3.5 bg-slate-50/90 rounded-2xl border border-teal-200 space-y-3 animate-in fade-in">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                            <div>
                              <span className="text-xs font-bold text-teal-950 block">
                                {isSingleLevelAssetType(propForm.propertyType)
                                  ? `Space & Bay Allocation (${floorBreakdown.length === 1 ? "Single Ground Level" : `${floorBreakdown.length} Levels / Bays`})`
                                  : `Floor Space & Area Allocation (${floorBreakdown.length} Floor${floorBreakdown.length > 1 ? "s" : ""}: Ground ${floorBreakdown.length > 1 ? `+ ${floorBreakdown.length - 1} Upper Floor${floorBreakdown.length - 1 > 1 ? "s" : ""}` : "Only"})`}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {isSingleLevelAssetType(propForm.propertyType)
                                  ? "Warehouse spaces and bays are automatically provisioned upon saving."
                                  : "Ground and upper floor spaces are automatically created upon saving."}
                              </span>
                            </div>
                            {floorBreakdown.length > 1 && (
                              <button
                                type="button"
                                onClick={autoDistributeFloorArea}
                                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
                              >
                                <Calculator size={13} />
                                <span>Distribute Area Equally</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {floorBreakdown.map((floor, idx) => {
                              const isSingle = isSingleLevelAssetType(propForm.propertyType);
                              const isGround = floor.floorNumber === 0 || (isSingle && floorBreakdown.length === 1);
                              const isMezz = isSingle && floor.floorNumber === 1 && floorBreakdown.length > 1;
                              const badgeText = isGround ? "G" : isMezz ? "M" : `F${floor.floorNumber}`;
                              const labelText = isGround
                                ? (isSingle ? "Ground Level" : "Ground Floor")
                                : isMezz
                                ? "Mezzanine Level"
                                : formatFloorName(floor.floorNumber);
                              const placeholderText = isSingle
                                ? (isGround ? "e.g. Main Warehouse Bay / Shed A" : "e.g. Mezzanine Storage / Office")
                                : `e.g. ${formatFloorName(floor.floorNumber)} Suite / Unit`;

                              return (
                                <div
                                  key={floor.floorNumber}
                                  className="p-2.5 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                                >
                                  <div className="sm:col-span-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                                      {badgeText}
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {labelText}
                                    </span>
                                  </div>
                                  <div className="sm:col-span-5">
                                    <input
                                      type="text"
                                      placeholder={placeholderText}
                                      value={floor.spaceName}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFloorBreakdown((prev) =>
                                          prev.map((f, i) => (i === idx ? { ...f, spaceName: val } : f))
                                        );
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:border-[#0F8B7D] outline-none"
                                    />
                                  </div>
                                  <div className="sm:col-span-4 flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Area (Sq.Ft)"
                                      value={floor.areaSqft}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFloorBreakdown((prev) =>
                                          prev.map((f, i) => (i === idx ? { ...f, areaSqft: val } : f))
                                        );
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 focus:border-[#0F8B7D] outline-none"
                                    />
                                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                                      Sq.Ft
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary calculation */}
                          {(() => {
                            const totalAllocated = floorBreakdown.reduce(
                              (sum, f) => sum + (Number(f.areaSqft) || 0),
                              0
                            );
                            const totalPropArea = Number(propForm.areaSqft) || 0;
                            const diff = totalPropArea - totalAllocated;
                            return (
                              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-600">
                                  Total Allocated:{" "}
                                  <span className="font-mono text-slate-900">
                                    {totalAllocated.toLocaleString()} Sq.Ft
                                  </span>
                                </span>
                                {totalPropArea > 0 && (
                                  <span
                                    className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                                      diff === 0
                                        ? "bg-emerald-100 text-emerald-800"
                                        : diff > 0
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-rose-100 text-rose-900"
                                    }`}
                                  >
                                    {diff === 0
                                      ? "✓ Matches Total Leasable Area"
                                      : diff > 0
                                      ? `${diff.toLocaleString()} Sq.Ft Unallocated`
                                      : `Exceeds Total Property Area by ${Math.abs(diff).toLocaleString()} Sq.Ft`}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ──── SECTION 2: GEOGRAPHIC LOCATION & ADDRESS ──── */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Building size={14} className="text-teal-700" />
                  <span>Geographic Location &amp; Address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Google Maps Autocomplete */}
                  <div className="sm:col-span-2">
                    <GoogleAddressAutocomplete
                      value={propForm.address}
                      onChange={(val) => setPropForm((prev) => ({ ...prev, address: val }))}
                      onAddressSelect={handleAddressSelect}
                      label="Property Full Street Address *"
                      placeholder="Search tech park, landmark, building, or road on Google Maps..."
                      required
                      hint="Selecting an address autofills City, State, and Pincode."
                    />
                  </div>

                  {/* State Dropdown */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State / Union Territory *</label>
                    <select
                      value={propForm.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer"
                    >
                      {(propForm.state && !ALL_INDIAN_STATES.includes(propForm.state)
                        ? [propForm.state, ...ALL_INDIAN_STATES]
                        : ALL_INDIAN_STATES
                      ).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Dropdown */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City *</label>
                    <select
                      value={propForm.city}
                      onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer"
                    >
                      {(propForm.city && !availableCities.includes(propForm.city)
                        ? [propForm.city, ...availableCities]
                        : availableCities
                      ).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Postal Pincode */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Postal Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 560066"
                      maxLength={10}
                      value={propForm.pincode}
                      onChange={(e) => setPropForm({ ...propForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* Micro-market */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Micro-Market / Sub-Market</label>
                    <input
                      type="text"
                      placeholder="e.g. Whitefield / Outer Ring Road"
                      value={propForm.microMarket}
                      onChange={(e) => setPropForm({ ...propForm, microMarket: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ──── SECTION 3: OWNERSHIP STRUCTURE & STATUTORY TAX COMPLIANCE (§S-11) ──── */}
              {(() => {
                const structureRule = getOwnershipStructureRule(propForm.ownershipStructure);
                return (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-teal-700" />
                        <span>Ownership &amp; Statutory Tax Compliance</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-[#0F8B7D] border border-teal-200 self-start sm:self-auto">
                        {structureRule.shortLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Legal Structure */}
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">
                          Ownership Structure *
                        </label>
                        <select
                          value={propForm.ownershipStructure}
                          onChange={(e) => {
                            const newStruct = e.target.value;
                            const r = getOwnershipStructureRule(newStruct);
                            setPropForm((prev) => ({
                              ...prev,
                              ownershipStructure: newStruct,
                              cinNumber: r.cinApplicable ? prev.cinNumber : "",
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer"
                        >
                          {LEGAL_OWNERSHIP_STRUCTURES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Landlord / SPV Entity Legal Name */}
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">
                          Asset Holding Entity / SPV Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            propForm.ownershipStructure === "sole_proprietorship"
                              ? "e.g. Ramesh Kumar (Proprietor)"
                              : "e.g. Cyber Estates SPV Pvt Ltd"
                          }
                          value={propForm.spvName}
                          onChange={(e) => setPropForm({ ...propForm, spvName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>

                      {/* PAN Number (Exactly 10 Characters) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">
                            PAN Number {structureRule.panRequired ? "*" : ""}
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({propForm.panNumber.length}/10)
                          </span>
                        </div>
                        <input
                          type="text"
                          required={structureRule.panRequired}
                          placeholder={structureRule.panPlaceholder}
                          maxLength={10}
                          value={propForm.panNumber}
                          onChange={(e) => setPropForm({ ...propForm, panNumber: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none uppercase"
                        />
                      </div>

                      {/* Corporate Identity (CIN) / LLPIN — Only shown for Pvt Ltd, Public Ltd, LLP */}
                      {structureRule.cinApplicable && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700">
                              {structureRule.cinLabel || "Corporate Identity (CIN)"} {structureRule.cinRequired ? "*" : ""}
                            </label>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({propForm.cinNumber.length}/{structureRule.id === "llp" ? 7 : 21})
                            </span>
                          </div>
                          <input
                            type="text"
                            required={Boolean(structureRule.cinRequired)}
                            placeholder={structureRule.cinPlaceholder || "e.g. U70100KA2021PTC123456"}
                            maxLength={structureRule.id === "llp" ? 8 : 21}
                            value={propForm.cinNumber}
                            onChange={(e) => setPropForm({ ...propForm, cinNumber: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none uppercase"
                          />
                        </div>
                      )}

                      {/* GSTIN (Fixed 15 Characters) */}
                      <div className={!structureRule.cinApplicable ? "sm:col-span-2" : ""}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">Lessor GSTIN</label>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({propForm.gstin.length}/15)
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="29AAAAA0000A1Z5"
                          maxLength={15}
                          value={propForm.gstin}
                          onChange={(e) => setPropForm({ ...propForm, gstin: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ──── SECTION 4: HANDOVER & FIT-OUT SPECIFICATIONS ──── */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Armchair size={14} className="text-teal-700" />
                  <span>Handover Condition &amp; Fit-out Specs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Fitout Condition */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fit-out Condition *</label>
                    <select
                      value={propForm.fitoutCondition}
                      onChange={(e) => setPropForm({ ...propForm, fitoutCondition: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer"
                    >
                      <option value="Fully Furnished">Fully Furnished (Plug &amp; Play / Turnkey)</option>
                      <option value="Warm Shell">Warm Shell (HVAC, Ceilings, Lighting)</option>
                      <option value="Bare Shell">Bare Shell (Core &amp; Shell / Slab)</option>
                      <option value="Semi-Furnished">Semi-Furnished (Partially Fitted)</option>
                    </select>
                  </div>

                  {/* Fitout Days */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Default Fit-out Period (Days)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60 or 90 Days"
                      value={propForm.defaultFitoutDays}
                      onChange={(e) => setPropForm({ ...propForm, defaultFitoutDays: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {(propForm.fitoutCondition === "Fully Furnished" || propForm.fitoutCondition === "Semi-Furnished") && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Workstations Count</label>
                        <input
                          type="number"
                          placeholder="e.g. 100 Seats"
                          value={propForm.workstationsCount}
                          onChange={(e) => setPropForm({ ...propForm, workstationsCount: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Manager Cabins</label>
                        <input
                          type="number"
                          placeholder="e.g. 4 Cabins"
                          value={propForm.cabinsCount}
                          onChange={(e) => setPropForm({ ...propForm, cabinsCount: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1">Meeting Rooms Count</label>
                        <input
                          type="number"
                          placeholder="e.g. 2 Conference Rooms"
                          value={propForm.meetingRoomsCount}
                          onChange={(e) => setPropForm({ ...propForm, meetingRoomsCount: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Warehouse & Industrial Operational Specifications */}
                  {isSingleLevelAssetType(propForm.propertyType) && (
                    <div className="sm:col-span-2 p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                        <span className="text-xs font-bold text-teal-950 block">
                          Warehouse &amp; Logistics Operational Specifications
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Clear Height (ft / meters)</label>
                          <input
                            type="text"
                            placeholder="e.g. 30 ft (9.1 meters)"
                            value={propForm.warehouseClearHeight}
                            onChange={(e) => setPropForm({ ...propForm, warehouseClearHeight: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Loading Docks / Shutters</label>
                          <input
                            type="text"
                            placeholder="e.g. 4 Docks with Dock Levelers"
                            value={propForm.warehouseDocksCount}
                            onChange={(e) => setPropForm({ ...propForm, warehouseDocksCount: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Flooring Type &amp; Load Capacity</label>
                          <select
                            value={propForm.warehouseFlooringType || "Standard Heavy-Duty Industrial Concrete (5 Ton/sq.m)"}
                            onChange={(e) => setPropForm({ ...propForm, warehouseFlooringType: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                          >
                            <option value="Standard Heavy-Duty Industrial Concrete (5 Ton/sq.m)">Standard Heavy-Duty Industrial Concrete (5 Ton/sq.m)</option>
                            <option value="Laser Screed FM2 Superflat Floor (Heavy Load)">Laser Screed FM2 Superflat Floor (Heavy Load)</option>
                            <option value="Epoxy Coated Anti-Dust Industrial Floor">Epoxy Coated Anti-Dust Industrial Floor</option>
                            <option value="Reinforced Cement Concrete (RCC)">Reinforced Cement Concrete (RCC)</option>
                            <option value="Basic Polished Trimix Flooring">Basic Polished Trimix Flooring</option>
                            <option value="Standard Commercial Concrete">Standard Commercial Concrete</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Power Load Sanctioned</label>
                          <input
                            type="text"
                            placeholder="e.g. 150 kVA / 3-Phase"
                            value={propForm.warehousePowerLoad}
                            onChange={(e) => setPropForm({ ...propForm, warehousePowerLoad: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Contact Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Property Owner / Primary Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma (Owner / Director)"
                      value={propForm.contactName}
                      onChange={(e) => setPropForm({ ...propForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* Primary Contact Phone */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={propForm.contactPhone}
                      onChange={(e) => setPropForm({ ...propForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Submission Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>
                    {shouldSkipSpaceStep
                      ? "Save Property & Next (Add Tenants) →"
                      : "Save Property & Next (Spaces & Units) →"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 2: BUILDING MASTER (Towers) ════════════════ */}
          {activeTab === "building" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Step 2: Campus Towers &amp; Buildings ({displayBuildings.length} Configured)
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {displayBuildings.length > 1
                      ? "Campus architecture: Each tower has its own floors and leasable spaces."
                      : "Single tower property configuration."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("space")}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <span>Proceed to Spaces &amp; Units (Step 3)</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {!propForm.hasMultipleBuildings && displayBuildings.length <= 1 && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-teal-900 block">Single Standalone Building</span>
                    <span className="text-teal-700 text-[11px]">
                      Your property is configured as a single tower. The primary building is automatically provisioned, so you can configure units or proceed directly to tenants.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("space")}
                    className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-bold text-[11px] shrink-0 hover:bg-teal-800 transition cursor-pointer"
                  >
                    Skip to Units (Step 3) →
                  </button>
                </div>
              )}

              {/* Configured Towers List */}
              {displayBuildings.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Configured Towers in Campus ({displayBuildings.length})
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Select a tower to configure leasable units or spaces
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayBuildings.map((bldg, idx) => {
                      const bldgSpaces = spacesList.filter((s) => s.buildingId === bldg.id);
                      const vacantCount = bldgSpaces.filter((s) => s.occupancyStatus !== "occupied").length;
                      const occupiedCount = bldgSpaces.filter((s) => s.occupancyStatus === "occupied").length;

                      return (
                        <div
                          key={bldg.id}
                          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 shadow-2xs transition space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                                T{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xs">{bldg.name}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  {bldg.floors || 1} Floors • {bldg.totalAreaSqft ? `${bldg.totalAreaSqft.toLocaleString()} Sq.Ft` : "Standard"}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              Active Tower
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-1 border-t border-slate-100">
                            <div className="p-1.5 rounded-lg bg-slate-50">
                              <span className="text-[10px] font-bold text-slate-400 block">Floors</span>
                              <span className="font-black text-slate-800">{bldg.floors || 1} Floors</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-50">
                              <span className="text-[10px] font-bold text-slate-400 block">Units Configured</span>
                              <span className="font-black text-teal-700">{bldgSpaces.length} Units</span>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium text-slate-500">
                              {vacantCount} Vacant • {occupiedCount} Occupied
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSpaceForm((prev) => ({ ...prev, buildingId: bldg.id, floorNumber: "0" }));
                                setSelectedTenantBuilding(bldg.id);
                                setActiveTab("space");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>Configure Units</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Additional Tower Form */}
              <form onSubmit={handleSaveBuilding} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                      +
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      {displayBuildings.length > 0 ? "Add Another Tower / Wing to Campus" : "Add Building / Tower"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Step 2 Form</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Associated Property */}
                  {/* Associated Property (Locked to active wizard property) */}
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase block">Property in Wizard</span>
                      <span className="font-extrabold text-teal-950 text-xs">{activePropertyObj?.name || propForm.propertyName || "Commercial Property"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Auto-Linked
                    </span>
                  </div>

                  {/* 1. Building Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tower / Building Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tower C / Wing North"
                      value={bldgForm.buildingName}
                      onChange={(e) => setBldgForm({ ...bldgForm, buildingName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* 2. Floor Count */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor Count in this Tower *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 10"
                      value={bldgForm.floorCount}
                      onChange={(e) => setBldgForm({ ...bldgForm, floorCount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  {/* 3. Building Address (optional) */}
                  <div className="sm:col-span-2">
                    <GoogleAddressAutocomplete
                      value={bldgForm.buildingAddress}
                      onChange={(val) => setBldgForm((prev) => ({ ...prev, buildingAddress: val }))}
                      onAddressSelect={(res: AddressAutofillResult) => {
                        setBldgForm((prev) => ({
                          ...prev,
                          buildingAddress: res.streetAddress || res.fullAddress,
                        }));
                      }}
                      label="Tower / Gate Address"
                      placeholder="Search building landmark or campus gate on Google Maps..."
                      required={false}
                      hint="Pinpoint specific wing or campus gate."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("space")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Skip to Spaces (Step 3) →
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>Save Tower &amp; Next (Add Spaces) →</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════ TAB 2: SPACES / UNITS (Full Master Form & Space Registry) ════════════════ */}
          {activeTab === "space" && (() => {
            const selectedBldg = buildingsList.find((b) => b.id === (spaceForm.buildingId || displayBuildings[0]?.id));
            const selectedProp = propertiesList.find((p) => p.id === selectedBldg?.propertyId) || activePropertyObj;
            const buildingTotalArea = Number(propForm.areaSqft) || Number(selectedProp?.area) || Number(selectedBldg?.totalAreaSqft) || 0;
            const allocatedUnitsArea = displaySpaces.reduce((acc, s) => acc + (s.area || 0), 0);
            const remainingBuildingArea = Math.max(0, buildingTotalArea - allocatedUnitsArea);
            const isExceededBuilding = buildingTotalArea > 0 && allocatedUnitsArea > buildingTotalArea;
            const pctBuildingAllocated = buildingTotalArea > 0 ? Math.min(100, Math.round((allocatedUnitsArea / buildingTotalArea) * 100)) : 0;

            const getFloorNum = (s: any) => {
              if (s.floorNumber !== undefined && s.floorNumber !== null && s.floorNumber !== "") {
                return Number(s.floorNumber);
              }
              const flStr = String(s.floorName || s.name || "");
              if (/ground|bay|shed/i.test(flStr) || flStr === "Floor 0") return 0;
              const match = flStr.match(/floor\s*(\d+)/i) || flStr.match(/f(\d+)/i);
              return match && match[1] ? parseInt(match[1], 10) : 0;
            };

            const selectedFloorNum = Number(spaceForm.floorNumber || "0");

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Step 2: Space &amp; Unit Master
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Configure leasable units (offices, suites, retail, or entire floors) and occupancy status.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (allFloorNumbers.length > 0 && !deRegFloor) {
                          setDeRegFloor(String(allFloorNumbers[0]));
                        }
                        setDeRegModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs shrink-0 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      title="Sold or transferred floors? Request de-registration with Admin Approval"
                    >
                      <span>🏢 Sold Floors? Request Removal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tenant")}
                      className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs shrink-0 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <span>Proceed to Tenants (Step 3)</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Summary KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Floors</span>
                    <span className="text-sm font-black text-slate-800">{allFloorNumbers.length} Floors</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Created Units</span>
                    <span className="text-sm font-black text-teal-700">{displaySpaces.length} Units</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Demarcated in Units</span>
                    <span className="text-sm font-black text-slate-800">
                      {allocatedUnitsArea > 0 ? `${allocatedUnitsArea.toLocaleString()} Sq.Ft` : "0 Sq.Ft"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Property Total Area</span>
                    <span className="text-sm font-black text-slate-600">
                      {buildingTotalArea > 0 ? `${buildingTotalArea.toLocaleString()} Sq.Ft` : "Flexible / Open"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Only shown if total building area is defined) */}
                {buildingTotalArea > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">Demarcation Progress</span>
                      <span className="text-teal-800 font-mono">
                        {allocatedUnitsArea.toLocaleString()} / {buildingTotalArea.toLocaleString()} Sq.Ft ({pctBuildingAllocated}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isExceededBuilding
                            ? "bg-rose-500"
                            : pctBuildingAllocated === 100
                            ? "bg-emerald-500"
                            : "bg-[#0F8B7D]"
                        }`}
                        style={{ width: `${Math.min(100, pctBuildingAllocated)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Floor Navigation Tab Strip for Step 2 */}
                <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers size={13} className="text-[#0F8B7D]" />
                      <span>Select Floor to View &amp; Configure Units:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Filter units or add new spaces floor-by-floor
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveStudioFloor("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        activeStudioFloor === "all"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      All Floors ({displaySpaces.length} Units)
                    </button>
                    {allFloorNumbers.map((fl) => {
                      const flLabel = fl === 0 ? "Ground Floor" : formatFloorName(fl);
                      const unitsOnFloor = displaySpaces.filter((s) => getFloorNum(s) === fl);
                      const isSelected = activeStudioFloor === String(fl);
                      return (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => {
                            setActiveStudioFloor(String(fl));
                            setSpaceForm((prev) => ({ ...prev, floorNumber: String(fl) }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#0F8B7D] text-white shadow-xs"
                              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <span>{flLabel}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isSelected ? "bg-white/20 text-white" : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}>
                            {unitsOnFloor.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Already Configured Spaces Strip (if any exist) */}
                {displaySpaces.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Registered Spaces ({activeStudioFloor === "all" ? displaySpaces.length : displaySpaces.filter((sp) => getFloorNum(sp) === Number(activeStudioFloor)).length})
                        </span>
                        <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full border border-teal-200">
                          {(activeStudioFloor === "all" ? displaySpaces : displaySpaces.filter((sp) => getFloorNum(sp) === Number(activeStudioFloor))).reduce((acc, s) => acc + (s.area || 0), 0).toLocaleString()} Sq.Ft Total
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click status badge to toggle Vacant / Occupied
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {(activeStudioFloor === "all" ? displaySpaces : displaySpaces.filter((sp) => getFloorNum(sp) === Number(activeStudioFloor))).map((sp) => {
                        const spBldg = buildingsList.find((b) => b.id === sp.buildingId);
                        return (
                          <div
                            key={sp.id}
                            className="px-3 py-2 bg-white border border-slate-200 hover:border-teal-300 rounded-xl flex items-center justify-between gap-2 shadow-2xs transition"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              {displayBuildings.length > 1 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 font-black text-[10px] text-slate-700 shrink-0">
                                  {spBldg?.name || "Tower"}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 font-black text-[10px] text-teal-800 shrink-0">
                                {sp.floorName || "Floor 1"}
                              </span>
                              <div className="truncate">
                                <span className="font-bold text-slate-800 text-xs block truncate">{sp.name}</span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {sp.area > 0 ? `${sp.area.toLocaleString()} Sq.Ft` : "Full Floor"} • {sp.unitType || "Office"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleOccupancy(sp.id, sp.occupancyStatus)}
                                title="Click to toggle Vacant / Occupied"
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border transition cursor-pointer flex items-center gap-1.5 ${
                                  sp.occupancyStatus === "occupied"
                                    ? "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    sp.occupancyStatus === "occupied" ? "bg-blue-600" : "bg-emerald-600"
                                  }`}
                                />
                                <span>{sp.occupancyStatus === "occupied" ? "Occupied (Tenant)" : "Vacant (Available)"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSpace(sp.id, sp.name)}
                                title="Delete this unit"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Floor Context Banner */}
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider">
                      Selected Floor:
                    </span>
                    <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-md border border-teal-200 shadow-2xs">
                      {selectedFloorNum === 0 ? "Ground Floor" : formatFloorName(selectedFloorNum)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({displaySpaces.filter((s) => getFloorNum(s) === selectedFloorNum).length} unit(s) configured)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Add individual suites, offices, or shops below
                  </span>
                </div>

                {/* Full Original Space Creation Form */}
                <form onSubmit={(e) => handleSaveSpace(e, true)} className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                          +
                        </span>
                        <span className="font-extrabold text-slate-800 text-xs">
                          Add Leasable Unit / Space
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Fill in unit details below
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {/* 1. Building */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Building / Tower <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={spaceForm.buildingId || displayBuildings[0]?.id || buildingsList[0]?.id || ""}
                          onChange={(e) => {
                            const newBldgId = e.target.value;
                            setSpaceForm({ ...spaceForm, buildingId: newBldgId, floorNumber: "0" });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer bg-white"
                        >
                          {displayBuildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.floors || 1} Floors{b.totalAreaSqft ? ` • ${b.totalAreaSqft.toLocaleString()} Sq.Ft` : ""})
                            </option>
                          ))}
                          {displayBuildings.length === 0 && <option value="">No buildings registered</option>}
                        </select>
                      </div>

                      {/* 2. Floor */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Floor in Selected Tower <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={spaceForm.floorNumber || "0"}
                          onChange={(e) => {
                            const flVal = e.target.value;
                            setSpaceForm({ ...spaceForm, floorNumber: flVal });
                            setActiveStudioFloor(flVal);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                        >
                          {buildingFloorNumbersForSpace.map((flNum) => {
                            const curB = buildingsList.find((b) => b.id === (spaceForm.buildingId || displayBuildings[0]?.id));
                            const flLabel = flNum === 0 ? "Ground Floor" : formatFloorName(flNum);
                            return (
                              <option key={flNum} value={String(flNum)}>
                                {displayBuildings.length > 1 && curB ? `${curB.name} • ` : ""}{flLabel}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* 3. Space / Unit Name */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Space / Unit Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Suite 201, Floor 2 East Wing, Unit A"
                          value={spaceForm.spaceName}
                          onChange={(e) => setSpaceForm({ ...spaceForm, spaceName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white"
                        />
                      </div>

                      {/* 4. Area (Sq.Ft) with Live Capacity Cap & Enforcement */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">
                            Unit Leasable Area (Sq.Ft) <span className="text-rose-500">*</span>
                          </label>
                          {buildingTotalArea > 0 && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-mono">
                              Building Avail: {remainingBuildingArea.toLocaleString()} Sq.Ft
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={buildingTotalArea > 0 ? remainingBuildingArea : undefined}
                          required
                          placeholder={buildingTotalArea > 0 ? `Max: ${remainingBuildingArea.toLocaleString()}` : "e.g. 5000"}
                          value={spaceForm.areaSqft}
                          onChange={(e) => setSpaceForm({ ...spaceForm, areaSqft: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border font-mono font-bold focus:border-[#0F8B7D] outline-none bg-white text-slate-900 ${
                            buildingTotalArea > 0 && Number(spaceForm.areaSqft) > remainingBuildingArea
                              ? "border-rose-400 bg-rose-50/40 text-rose-900"
                              : "border-slate-300"
                          }`}
                        />
                        {buildingTotalArea > 0 ? (
                          Number(spaceForm.areaSqft) > remainingBuildingArea ? (
                            <span className="text-[11px] text-rose-600 font-bold block mt-1">
                              ⛔ Exceeds building limit! Only {remainingBuildingArea.toLocaleString()} Sq.Ft available out of {buildingTotalArea.toLocaleString()} Sq.Ft total.
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium block mt-1">
                              Available to assign in building: <strong className="font-mono text-slate-800">{remainingBuildingArea.toLocaleString()} Sq.Ft</strong> (Building Total: {buildingTotalArea.toLocaleString()} Sq.Ft)
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium block mt-1">
                            Size of this unit/suite in Sq.Ft (e.g. 5,000)
                          </span>
                        )}
                      </div>

                      {/* 5. Unit Type */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Unit Type *</label>
                        <select
                          value={spaceForm.unitType}
                          onChange={(e) => setSpaceForm({ ...spaceForm, unitType: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                        >
                          <option value="Office">Office / Suite</option>
                          <option value="Desk">Dedicated Desks / Coworking</option>
                          <option value="Retail">Retail Store / Showroom</option>
                        </select>
                      </div>

                      {/* 6. Occupancy Status (User requested choice) */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Occupancy Status *</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setSpaceForm({ ...spaceForm, occupancyStatus: "vacant" })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              spaceForm.occupancyStatus !== "occupied"
                                ? "bg-white text-emerald-800 shadow-2xs border border-emerald-300"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Vacant (Available)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpaceForm({ ...spaceForm, occupancyStatus: "occupied" })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              spaceForm.occupancyStatus === "occupied"
                                ? "bg-white text-blue-800 shadow-2xs border border-blue-300"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Occupied (Tenant)</span>
                          </button>
                        </div>
                      </div>

                      {/* 7. Fitout / Furnishing Condition */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Furnishing Condition</label>
                        <select
                          value={spaceForm.fitoutCondition}
                          onChange={(e) => setSpaceForm({ ...spaceForm, fitoutCondition: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                        >
                          <option value="Fully Furnished">Fully Furnished (Plug &amp; Play)</option>
                          <option value="Warm Shell">Warm Shell</option>
                          <option value="Bare Shell">Bare Shell</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                        </select>
                      </div>

                      {/* 8. Workstations / Desks */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Workstations / Desks</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 25"
                          value={spaceForm.workstationsCount}
                          onChange={(e) => setSpaceForm({ ...spaceForm, workstationsCount: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Navigation / Submit Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("tenant")}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer order-2 sm:order-1"
                    >
                      Skip to Tenants (Step 3) →
                    </button>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={(e) => handleSaveSpace(e, false)}
                        disabled={loading || (buildingTotalArea > 0 && Number(spaceForm.areaSqft) > remainingBuildingArea)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                        <span>+ Add Unit &amp; Keep Adding</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading || (buildingTotalArea > 0 && Number(spaceForm.areaSqft) > remainingBuildingArea)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                        <span>Save Space &amp; Next (Add Tenants) →</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            );
          })()}

          {/* ════════════════ TAB 3: TENANT / OCCUPANT (9 Fields) ════════════════ */}
          {activeTab === "tenant" && (
            <form onSubmit={handleSaveTenant} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {shouldSkipSpaceStep
                    ? "Step 2: Tenant / Occupant Master (9 Fields)"
                    : "Step 3: Tenant / Occupant Master (9 Fields)"}
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Enrolls Tenant &amp; Generates Portal Invite Link
                </span>
              </div>

              {/* Latest Generated Tenant Invite Banner (§20 Subscription Gated) */}
              {latestTenantInvite && (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs animate-in fade-in space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#0F8B7D] shrink-0" />
                      <div>
                        <span className="font-bold text-teal-950">Active Portal Invite: {latestTenantInvite.name}</span>
                        <span className="text-slate-500 ml-1.5 font-medium">({latestTenantInvite.email})</span>
                      </div>
                    </div>
                  </div>

                  {isOwnerSubscribed || checkIsOwnerSubscribed() ? (
                    <div className="p-2 rounded-xl bg-white border border-teal-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <input
                        type="text"
                        readOnly
                        value={latestTenantInvite.link}
                        className="text-[11px] font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 flex-1 truncate"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(latestTenantInvite.link);
                            setCopiedInvite(true);
                            showToast("✓ Tenant invitation link copied to clipboard!");
                            setTimeout(() => setCopiedInvite(false), 2500);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                        >
                          {copiedInvite ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedInvite ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Hi ${latestTenantInvite.name}, here is your corporate tenant portal invitation link: ${latestTenantInvite.link}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 shrink-0 cursor-pointer transition"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`mailto:${latestTenantInvite.email}?subject=${encodeURIComponent(
                            "Corporate Tenant Portal Access - OfficeX"
                          )}&body=${encodeURIComponent(
                            `Hi ${latestTenantInvite.name},\n\nPlease access your tenant portal using the secure link below:\n\n${latestTenantInvite.link}\n\nBest regards,\nOfficeX Commercial Asset Management`
                          )}`}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 shrink-0 cursor-pointer transition"
                        >
                          <Mail size={12} />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden">
                      <div className="filter blur-xs select-none opacity-40">
                        <span className="font-mono text-xs text-slate-800">https://officex.ai/portal/tenant?id=act_••••••••••••</span>
                      </div>
                      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[1px] flex items-center justify-between px-3 py-1.5">
                        <div className="flex items-center gap-1.5 text-white">
                          <Lock size={13} className="text-amber-400 shrink-0" />
                          <span className="text-[11px] font-bold">Pro Subscription required to share tenant links</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionGateReason("Share Corporate Tenant Portal Link");
                            setSubscriptionGateModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-900 text-[11px] font-bold shadow cursor-pointer transition"
                        >
                          Subscribe Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──── TENANT ONBOARDING MODE SELECTOR (2 OPTIONS) ──── */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Select Onboarding Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setTenantOnboardingMode("existing")}
                    className={`p-3 rounded-xl text-left transition flex items-start gap-3 cursor-pointer ${
                      tenantOnboardingMode === "existing"
                        ? "bg-white shadow-xs border border-teal-600 text-teal-950 font-bold"
                        : "hover:bg-slate-200/60 text-slate-600 font-medium"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        tenantOnboardingMode === "existing"
                          ? "bg-[#0F8B7D] text-white shadow-2xs"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      <FileUp size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">1. Add Existing Tenant</span>
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold uppercase">
                          Upload Doc
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                        Upload Rent Agreement or Maintenance Deed for instant auto-fill
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTenantOnboardingMode("new")}
                    className={`p-3 rounded-xl text-left transition flex items-start gap-3 cursor-pointer ${
                      tenantOnboardingMode === "new"
                        ? "bg-white shadow-xs border border-teal-600 text-teal-950 font-bold"
                        : "hover:bg-slate-200/60 text-slate-600 font-medium"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        tenantOnboardingMode === "new"
                          ? "bg-[#0F8B7D] text-white shadow-2xs"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      <UserPlus size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">2. Add New Tenant</span>
                        <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-semibold uppercase">
                          Manual Form
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                        Register prospective corporate occupant via manual entry fields
                      </p>
                    </div>
                  </button>
                </div>

                {/* EXISTING TENANT: DOCUMENT UPLOAD & AUTO-FILL ZONE */}
                {tenantOnboardingMode === "existing" && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-400 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                          <UploadCloud size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Upload Existing Lease Document (PDF / Scanned)
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Upload signed rent agreement or maintenance deed. Terms and tenant details will be mapped directly to the form below.
                          </p>
                        </div>
                      </div>

                      <label className="cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.rtf"
                          multiple
                          disabled={isUploadingTenantAgreement}
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleUploadTenantAgreement(files);
                            }
                            e.target.value = "";
                          }}
                        />
                        <div
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs ${
                            isUploadingTenantAgreement
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                              : "bg-[#0F8B7D] hover:bg-[#0c7367] text-white cursor-pointer"
                          }`}
                        >
                          {isUploadingTenantAgreement ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Auto-Extracting Terms...</span>
                            </>
                          ) : (
                            <>
                              <FileUp size={15} />
                              <span>Browse Agreement File(s)</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Document Category Filters / Indicators */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Select Uploaded Document Type:</span>
                      {(
                        [
                          { id: "rent", label: "Rent Agreement" },
                          { id: "maintenance", label: "Maintenance Agreement" },
                          { id: "both", label: "Both into One Document" },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setTenantDocCategory(cat.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            tenantDocCategory === cat.id
                              ? "bg-[#0F8B7D] text-white shadow-xs ring-1 ring-[#0F8B7D]"
                              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tenantDocCategory === cat.id ? "bg-white" : "bg-slate-300"
                            }`}
                          />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Uploaded File List Badges (Multi-upload display) */}
                    {uploadedTenantFileList.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Uploaded Agreement Documents ({uploadedTenantFileList.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {uploadedTenantFileList.map((f, i) => (
                            <div
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 flex items-center gap-2 text-xs text-slate-800 shadow-2xs"
                            >
                              <FileText size={13} className="text-teal-700 shrink-0" />
                              <span className="font-semibold truncate max-w-[200px]">{f.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 uppercase">
                                {f.category === "rent" ? "Rent Agreement" : f.category === "maintenance" ? "Maintenance Agreement" : "Both in One"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(f.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parsed Highlights Banner */}
                    {parsedTenantDocMeta && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <FileCheck2 size={15} className="text-emerald-700 shrink-0" />
                            <span>Auto-Filled from: {parsedTenantDocMeta.fileName}</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            {parsedTenantDocMeta.confidence}% Confidence • {parsedTenantDocMeta.extractedFieldsCount} Terms Extracted
                          </span>
                        </div>

                        {parsedTenantDocMeta.summaryHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {parsedTenantDocMeta.summaryHighlights.map((hl, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-900 shadow-xs"
                              >
                                ✓ {hl}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-emerald-800 italic pt-0.5">
                          ✓ Tenant details, demised area, floor, and rent/maintenance terms were auto-populated into the form fields below and the lease contract. Review and modify any value if required.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* ──── UPPER SIDE: CORPORATE ENTITY & STATUTORY PARTICULARS ──── */}
                <div className="sm:col-span-2 p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-[#0F8B7D]" />
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Corporate Entity &amp; Statutory Particulars
                      </span>
                    </div>

                    {/* Requirement 4: Existing Tenant Auto-Fill */}
                    {tenantsList.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-slate-600">Existing Tenant:</span>
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (!selectedId) return;
                            const t = tenantsList.find((item) => item.id === selectedId);
                            if (t) {
                              setTenantForm((prev) => ({
                                ...prev,
                                companyType: (t.companyType as any) || prev.companyType,
                                companyName: t.name || "",
                                tradeName: t.company || t.name || "",
                                pan: t.pan || prev.pan,
                                gst: t.gstin || prev.gst,
                                cinNumber: t.cin || (t.companyType === "sole_proprietorship" ? "" : prev.cinNumber),
                                billingAddress: t.billingAddress || prev.billingAddress,
                                industryType: t.industrySector || prev.industryType,
                                email: t.email || prev.email,
                                phone: t.phone || prev.phone,
                              }));
                              setContractForm((prev) => ({
                                ...prev,
                                occupantId: t.id,
                              }));
                              showToast(`✓ Auto-filled details for ${t.name}`);
                            }
                          }}
                          className="px-2 py-1 rounded-lg border border-teal-300 bg-white font-medium text-slate-800 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-teal-500"
                          defaultValue=""
                        >
                          <option value="">-- Auto-Fill from Registered Tenant --</option>
                          {tenantsList.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.company ? `(${t.company})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 3. Company Legal Registered Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          Company Legal Name <span className="text-rose-500">*</span>
                        </label>
                        {changedFieldKeys.has("companyName") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={
                          tenantForm.companyType === "sole_proprietorship"
                            ? "e.g. JEE Engineers"
                            : tenantForm.companyType === "llp"
                            ? "e.g. Vriksha Estates LLP"
                            : "e.g. Acme Tech Solutions Pvt Ltd"
                        }
                        value={tenantForm.companyName}
                        onClick={() => clearFieldHighlight("companyName")}
                        onFocus={() => clearFieldHighlight("companyName")}
                        onChange={(e) => {
                          clearFieldHighlight("companyName");
                          setTenantForm({
                            ...tenantForm,
                            companyName: e.target.value,
                          });
                        }}
                        className={getHighlightClass(
                          "companyName",
                          "w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white"
                        )}
                      />
                    </div>

                    {/* 2. Industry Type / Vertical */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Industry / Sector Vertical <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={tenantForm.industryType}
                        onChange={(e) => setTenantForm({ ...tenantForm, industryType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
                      >
                        <option value="IT & Software">IT / SaaS / Tech</option>
                        <option value="BFSI">BFSI / FinTech / Investment</option>
                        <option value="Consulting & Legal">Consulting &amp; Legal</option>
                        <option value="Healthcare & Pharma">Healthcare &amp; Pharma</option>
                        <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                        <option value="Manufacturing & Logistics">Manufacturing &amp; Logistics</option>
                        <option value="Coworking & Managed Office">Coworking &amp; Managed Office</option>
                        <option value="Education">Education &amp; EdTech</option>
                        <option value="Hospitality">Hospitality &amp; F&amp;B</option>
                        <option value="Media & Entertainment">Media &amp; Entertainment</option>
                        <option value="Other">Other Commercial Enterprise</option>
                      </select>
                    </div>

                    {/* 1. Legal Entity Structure / Company Type */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Company Legal Structure <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={tenantForm.companyType}
                        onChange={(e) => {
                          const ct = e.target.value as any;
                          setTenantForm((prev) => ({
                            ...prev,
                            companyType: ct,
                            // If sole proprietorship, clear CIN as CIN does not exist for proprietorships
                            cinNumber: ct === "sole_proprietorship" ? "" : prev.cinNumber,
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
                      >
                        <option value="pvt_ltd">Private Limited Company (Pvt Ltd)</option>
                        <option value="public_ltd">Public Limited Company (Ltd)</option>
                        <option value="llp">Limited Liability Partnership (LLP)</option>
                        <option value="partnership">Partnership Firm</option>
                        <option value="sole_proprietorship">Sole Proprietorship (Proprietor / Individual)</option>
                        <option value="trust_society">Trust / Society / Association</option>
                      </select>
                    </div>

                    {/* 4. Trade / Brand Name */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Trade / Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Cloud"
                        value={tenantForm.tradeName}
                        onChange={(e) => setTenantForm({ ...tenantForm, tradeName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white"
                      />
                    </div>

                    {/* 5. CIN / LLPIN / Registration Number (Dynamic by Entity) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          {tenantForm.companyType === "pvt_ltd" || tenantForm.companyType === "public_ltd"
                            ? "Corporate Identification Number (CIN) *"
                            : tenantForm.companyType === "llp"
                            ? "LLP Identification Number (LLPIN) *"
                            : tenantForm.companyType === "partnership"
                            ? "Partnership Reg / Deed Number"
                            : tenantForm.companyType === "sole_proprietorship"
                            ? "CIN (Not Applicable)"
                            : "Registration / Trust Number"}
                        </label>
                        {tenantForm.companyType !== "sole_proprietorship" && (
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            ({tenantForm.cinNumber.length}/
                            {tenantForm.companyType === "llp" ? "8" : "21"})
                          </span>
                        )}
                      </div>

                      {tenantForm.companyType === "sole_proprietorship" ? (
                        <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-medium text-[11px] flex items-center justify-between">
                          <span>Not Applicable for Sole Proprietorship</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                            MCA CIN N/A
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          required={tenantForm.companyType === "pvt_ltd" || tenantForm.companyType === "public_ltd" || tenantForm.companyType === "llp"}
                          placeholder={
                            tenantForm.companyType === "llp"
                              ? "e.g. AAA-1234 or AAB-5678"
                              : tenantForm.companyType === "partnership"
                              ? "e.g. REG/2021/4582"
                              : "e.g. U72200KA2021PTC145678 (21 chars)"
                          }
                          maxLength={tenantForm.companyType === "llp" ? 12 : 21}
                          value={tenantForm.cinNumber}
                          onChange={(e) => setTenantForm({ ...tenantForm, cinNumber: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase bg-white"
                        />
                      )}
                    </div>

                    {/* 6. PAN Number (Entity-Check) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          PAN Number <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          ({tenantForm.pan.length}/10)
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ABCDE1234F"
                        maxLength={10}
                        value={tenantForm.pan}
                        onChange={(e) => setTenantForm({ ...tenantForm, pan: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase bg-white"
                      />
                    </div>

                    {/* 7. GSTIN Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">GSTIN Number</label>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          ({tenantForm.gst.length}/15)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 29AAAAA0000A1Z5"
                        maxLength={15}
                        value={tenantForm.gst}
                        onChange={(e) => setTenantForm({ ...tenantForm, gst: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase bg-white"
                      />
                    </div>

                    {/* 8. Registered Billing Address - User Fills It (Empty by Default) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          Registered Office / Billing Address <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-slate-400 font-normal text-[11px]">
                          (Enter tenant's official registered office)
                        </span>
                      </div>
                      <GoogleAddressAutocomplete
                        value={tenantForm.billingAddress}
                        onChange={(val) => setTenantForm((prev) => ({ ...prev, billingAddress: val }))}
                        onAddressSelect={(res: AddressAutofillResult) => {
                          setTenantForm((prev) => ({
                            ...prev,
                            billingAddress: res.fullAddress || res.streetAddress,
                          }));
                        }}
                        label=""
                        placeholder="Enter tenant's registered corporate office address for invoices..."
                        required={false}
                        hint="Official registered address where monthly rent invoices will be billed."
                      />
                    </div>
                  </div>
                </div>

                {/* ──── LOWER SIDE: AUTHORIZED SIGNATORY & CONTACT DETAILS ──── */}
                <div className="sm:col-span-2 p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-teal-700" />
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Authorized Signatory &amp; Primary Contacts
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Step 2 of 2: Signatory &amp; Contacts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Primary Contact / Authorized Signatory Name */}
                    <div className="sm:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                        <label className="font-bold text-slate-700">
                          {sameSignatoryContact
                            ? "Authorized Signatory / Primary Contact Name *"
                            : "Authorized Signatory Name *"}
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F8B7D] cursor-pointer self-start sm:self-auto bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <input
                            type="checkbox"
                            checked={sameSignatoryContact}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSameSignatoryContact(checked);
                              if (checked) {
                                const unifiedName = tenantForm.signatoryName || tenantForm.occupantName;
                                setTenantForm((prev) => ({
                                  ...prev,
                                  signatoryName: unifiedName,
                                  occupantName: unifiedName,
                                }));
                              }
                            }}
                            className="rounded accent-[#0F8B7D] cursor-pointer"
                          />
                          <span>Primary Contact Person is same as Signatory</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={tenantForm.signatoryName || tenantForm.occupantName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTenantForm((prev) => ({
                            ...prev,
                            signatoryName: val,
                            occupantName: sameSignatoryContact ? val : prev.occupantName,
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white text-slate-900"
                      />
                    </div>

                    {/* Authorized Signatory Designation */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Signatory Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Director / Managing Partner / Proprietor"
                        value={tenantForm.signatoryDesignation}
                        onChange={(e) => setTenantForm({ ...tenantForm, signatoryDesignation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none bg-white"
                      />
                    </div>

                    {/* Separate Primary Contact Person (Only if checkbox unchecked) */}
                    {!sameSignatoryContact && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">Separate Operational Contact Person *</label>
                          {changedFieldKeys.has("occupantName") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required={!sameSignatoryContact}
                          placeholder="e.g. Vikas Nair (Facilities / Ops Lead)"
                          value={tenantForm.occupantName}
                          onClick={() => clearFieldHighlight("occupantName")}
                          onFocus={() => clearFieldHighlight("occupantName")}
                          onChange={(e) => {
                            clearFieldHighlight("occupantName");
                            setTenantForm({ ...tenantForm, occupantName: e.target.value });
                          }}
                          className={getHighlightClass(
                            "occupantName",
                            "w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white"
                          )}
                        />
                      </div>
                    )}

                    {/* Primary Email */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Primary Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="vikas@acmetech.com"
                        value={tenantForm.email}
                        onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                      />
                    </div>

                    {/* Primary Phone */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Primary Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98450 12345"
                        value={tenantForm.phone}
                        onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                      />
                    </div>

                    {/* Alternate Contact Name */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Alternate Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma (Finance Lead)"
                        value={tenantForm.altContactName}
                        onChange={(e) => setTenantForm({ ...tenantForm, altContactName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                      />
                    </div>

                    {/* Alternate Contact Phone */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Alternate Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 99000 88776"
                        value={tenantForm.altContactPhone}
                        onChange={(e) => setTenantForm({ ...tenantForm, altContactPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Associated Commercial Property */}
                {/* Associated Commercial Property (Locked to active wizard property) */}
                <div className="sm:col-span-2 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">Property Being Leased</span>
                    <span className="font-extrabold text-teal-950 text-xs">{activePropertyObj?.name || propForm.propertyName || "Commercial Property"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                    Auto-Linked
                  </span>
                </div>

                {/* ──── DEMISED PREMISES (FLOOR & SUITE SELECTION) ──── */}
                <div className="sm:col-span-2 p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-teal-100 pb-2">
                    <div>
                      <span className="font-extrabold text-teal-950 text-xs block">
                        Demised Premises Allocation (Floor &amp; Suites) *
                      </span>
                      <span className="text-[11px] text-teal-700">
                        Choose which floor and which specific office suites / units this tenant occupies.
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-full border border-teal-200 self-start sm:self-auto">
                      Auto-Binds to Lease Contract
                    </span>
                  </div>

                  {/* Warehouse Asset: Entire Facility vs Partial Bay Allocation (§10) */}
                  {isSingleLevelAssetType(propForm.propertyType) ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 text-xs">
                          Warehouse Leased Space Allocation <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Total Facility: {Number(propForm.areaSqft || 0).toLocaleString()} Sq.Ft
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWarehouseLeaseChoice("entire");
                            const totalArea = propForm.areaSqft || "0";
                            setContractForm((prev) => ({ ...prev, areaSqft: totalArea }));
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                            warehouseLeaseChoice === "entire"
                              ? "border-[#0F8B7D] bg-teal-50/80 text-teal-950 font-bold shadow-2xs"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0F8B7D]" />
                            <span className="text-xs font-black">Entire Warehouse (100%)</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal block mt-1">
                            Tenant occupies the full {Number(propForm.areaSqft || 0).toLocaleString()} Sq.Ft facility
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWarehouseLeaseChoice("partial");
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                            warehouseLeaseChoice === "partial"
                              ? "border-[#0F8B7D] bg-teal-50/80 text-teal-950 font-bold shadow-2xs"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-black">Partial Warehouse Bay / Area</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal block mt-1">
                            Specify exact leasable square footage (e.g. Bay A or 15,000 sq.ft)
                          </span>
                        </button>
                      </div>

                      {warehouseLeaseChoice === "partial" && (
                        <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-800 text-xs">
                              Demised Leased Area (Sq.Ft) <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              Max Limit: {Number(propForm.areaSqft || 0).toLocaleString()} Sq.Ft
                            </span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={Number(propForm.areaSqft) || undefined}
                            required
                            placeholder="e.g. 15000"
                            value={contractForm.areaSqft}
                            onChange={(e) => {
                              const val = e.target.value;
                              const cap = Number(propForm.areaSqft) || 0;
                              if (cap > 0 && Number(val) > cap) {
                                showToast(`Cannot exceed warehouse capacity of ${cap.toLocaleString()} Sq.Ft`, "error");
                                return;
                              }
                              setContractForm({ ...contractForm, areaSqft: val });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F8B7D] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                    {/* 1. Which Tower / Building Dropdown (if campus / multiple towers) */}
                  {displayBuildings.length > 1 && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">
                        1. Which Tower / Building is this tenant leasing? <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedTenantBuilding || displayBuildings[0]?.id || ""}
                        onChange={(e) => {
                          const bId = e.target.value;
                          setSelectedTenantBuilding(bId);
                          setSelectedTenantFloor("");
                          setSelectedTenantSuites([]);
                          setContractForm((prev) => ({ ...prev, buildingId: bId }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer text-xs bg-white"
                      >
                        {displayBuildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.floors || 1} Floors{b.totalAreaSqft ? ` • ${b.totalAreaSqft.toLocaleString()} Sq.Ft` : ""})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Which Floor Dropdown */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">
                      {displayBuildings.length > 1
                        ? `2. Which Floor in ${(buildingsList.find((b) => b.id === (selectedTenantBuilding || displayBuildings[0]?.id))?.name || "Tower")}?`
                        : "1. Which Floor is this tenant leasing?"} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedTenantFloor}
                      onChange={(e) => {
                        const fl = e.target.value;
                        setSelectedTenantFloor(fl);
                        setSelectedContractFloor(fl);
                        const curBldgId = selectedTenantBuilding || displayBuildings[0]?.id;
                        // Auto-select suites on this floor belonging to this specific tower
                        const matchingSpaces = spacesList.filter((s) => {
                          if (displayBuildings.length > 1 && curBldgId && s.buildingId && s.buildingId !== curBldgId) {
                            return false;
                          }
                          const flStr = (s.floorName || "").toLowerCase().trim();
                          const nameStr = s.name.toLowerCase().trim();
                          const targetFl = fl.toLowerCase().trim();
                          if (targetFl === "0") {
                            return (
                              flStr === "0" ||
                              flStr.includes("ground") ||
                              flStr === "g" ||
                              nameStr.includes("ground") ||
                              nameStr.includes("bay") ||
                              nameStr.includes("shed")
                            );
                          }
                          return (
                            flStr === `floor ${targetFl}` ||
                            flStr === `f${targetFl}` ||
                            flStr === targetFl ||
                            (!flStr && (nameStr.startsWith(`floor ${targetFl}`) || nameStr.startsWith(`f${targetFl}`)))
                          );
                        });
                        if (matchingSpaces.length > 0) {
                          setSelectedTenantSuites(matchingSpaces.map((s) => s.id));
                        } else {
                          setSelectedTenantSuites([]);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer text-xs bg-white"
                    >
                      <option value="">
                        -- Select Demised Floor {displayBuildings.length > 1 ? `in ${(buildingsList.find((b) => b.id === (selectedTenantBuilding || displayBuildings[0]?.id))?.name || "Tower")}` : ""} --
                      </option>
                      {buildingFloorNumbersForTenant.map((flNum) => {
                        const curBldgId = selectedTenantBuilding || displayBuildings[0]?.id;
                        const curBName = buildingsList.find((b) => b.id === curBldgId)?.name;
                        const spacesOnThisFloor = spacesList.filter((s) => {
                          if (displayBuildings.length > 1 && curBldgId && s.buildingId && s.buildingId !== curBldgId) return false;
                          const flStr = (s.floorName || "").toLowerCase();
                          return (
                            flStr === `floor ${flNum}` ||
                            flStr === `f${flNum}` ||
                            flStr === String(flNum) ||
                            flStr === formatFloorName(flNum).toLowerCase() ||
                            (flNum === 0 && (flStr.includes("ground") || flStr === "g"))
                          );
                        });
                        const flArea = spacesOnThisFloor.reduce((sum, s) => sum + (s.area || 0), 0);
                        const flLabel = flNum === 0 ? "Ground Floor" : formatFloorName(flNum);
                        return (
                          <option key={flNum} value={String(flNum)}>
                            {displayBuildings.length > 1 && curBName ? `${curBName} • ` : ""}{flLabel} {flArea > 0 ? `(${flArea.toLocaleString()} Sq.Ft)` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* 2. Which Suites / Units Selection */}
                  {selectedTenantFloor && (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-700">
                          {displayBuildings.length > 1 ? "3. Which Suite(s) / Unit(s)" : "2. Which Suite(s) / Unit(s)"} does the tenant occupy on Floor {selectedTenantFloor}? *
                        </label>
                        {floorSpacesForTenant.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTenantSuites.length === floorSpacesForTenant.length) {
                                setSelectedTenantSuites([]);
                              } else {
                                setSelectedTenantSuites(floorSpacesForTenant.map((s) => s.id));
                              }
                            }}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                          >
                            {selectedTenantSuites.length === floorSpacesForTenant.length
                              ? "Deselect All"
                              : "Select Entire Floor (All Units)"}
                          </button>
                        )}
                      </div>

                      {floorSpacesForTenant.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                          {floorSpacesForTenant.map((sp) => {
                            const isSelected = selectedTenantSuites.includes(sp.id);
                            return (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTenantSuites((prev) =>
                                    isSelected ? prev.filter((id) => id !== sp.id) : [...prev, sp.id]
                                  );
                                }}
                                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? "bg-teal-700 text-white border-teal-800 shadow-2xs font-bold"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div
                                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                      isSelected
                                        ? "bg-white text-teal-800"
                                        : "border border-slate-300 bg-slate-50 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </div>
                                  <div className="truncate">
                                    <span className="block truncate text-xs">{sp.name}</span>
                                    <span
                                      className={`text-[10px] block font-normal ${
                                        isSelected ? "text-teal-100" : "text-slate-400"
                                      }`}
                                    >
                                      {sp.unitType || "Office"} • {sp.occupancyStatus === "occupied" ? "Currently Occupied" : "Vacant"}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs shrink-0 font-mono font-bold ${
                                    isSelected ? "text-white" : "text-slate-700"
                                  }`}
                                >
                                  {sp.area > 0 ? `${sp.area.toLocaleString()} Sq.Ft` : "Whole Floor"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-white/90 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                          No individual units subdivided on Floor {selectedTenantFloor} yet.
                          The tenant will be assigned to <strong>Floor {selectedTenantFloor} (Full Floor)</strong>.
                        </div>
                      )}

                      {/* Total Demised Area Calculation Banner */}
                      <div className="p-2.5 bg-white rounded-xl border border-teal-200 flex items-center justify-between text-xs shadow-2xs">
                        <span className="font-bold text-slate-700">
                          Total Demised Area for this Tenant:
                        </span>
                        <span className="font-black text-[#0F8B7D] font-mono text-sm">
                          {totalTenantSelectedArea > 0
                            ? `${totalTenantSelectedArea.toLocaleString()} Sq.Ft`
                            : (floorBreakdown.find((f) => String(f.floorNumber) === selectedTenantFloor)?.areaSqft
                              ? `${Number(floorBreakdown.find((f) => String(f.floorNumber) === selectedTenantFloor)?.areaSqft).toLocaleString()} Sq.Ft`
                              : "Whole Floor")}
                        </span>
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("contract")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Skip to Lease Contract →
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : tenantOnboardingMode === "existing" ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Plus size={13} />
                  )}
                  <span>
                    {tenantOnboardingMode === "existing"
                      ? "Save Existing Tenant & Proceed to Contract →"
                      : "Save New Tenant & Proceed to Contract →"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 4: LEASE CONTRACT (COMPULSORY LINKING) ════════════════ */}
          {activeTab === "contract" && (
            <form onSubmit={handleSaveContract} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {shouldSkipSpaceStep
                        ? "Step 3: Commercial Lease Contract"
                        : "Step 4: Commercial Lease Contract"}
                    </span>
                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider">
                      Compulsory *
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Link tenant to demised commercial space, configure rent calculation basis, CAM, parking, and legal covenants.
                  </p>
                </div>
              </div>

              {/* Tenant Portal Invite Link Banner (Subscription Gated) */}
              {latestTenantInvite && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <span>Tenant Enrolled: {latestTenantInvite.name}</span>
                        <span className="text-[10px] font-bold text-teal-700 bg-white/90 px-1.5 py-0.5 rounded border border-teal-200">
                          {latestTenantInvite.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-800 mt-0.5">
                        Verified tenant invitation link generated for institutional tenant portal (<span className="font-mono font-bold">/portal</span>).
                      </p>
                    </div>
                  </div>

                  {isOwnerSubscribed ? (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(latestTenantInvite.link);
                          setCopiedInvite(true);
                          showToast("✓ Tenant Portal invitation link copied to clipboard!");
                          setTimeout(() => setCopiedInvite(false), 2500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                      >
                        {copiedInvite ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedInvite ? "Copied!" : "Copy Link"}</span>
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Hi ${latestTenantInvite.name}, here is your corporate tenant portal invitation link: ${latestTenantInvite.link}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:${latestTenantInvite.email}?subject=${encodeURIComponent(
                          "Corporate Tenant Portal Access - OfficeX"
                        )}&body=${encodeURIComponent(
                          `Hi ${latestTenantInvite.name},\n\nPlease access your tenant portal using the secure link below:\n\n${latestTenantInvite.link}\n\nBest regards,\nOfficeX Commercial Asset Management`
                        )}`}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 text-white shadow-xs shrink-0 border border-slate-700">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                        <Lock size={13} />
                        <span>Pro Subscription Required</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSubscriptionGateReason("Share Corporate Tenant Portal Link");
                          setSubscriptionGateModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
                      >
                        Subscribe to Copy &amp; Share
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ──── UPLOAD RENT AGREEMENT OR SYNC BANNER (§16) ──── */}
              {uploadedTenantFileList.length > 0 || parsedTenantDocMeta ? (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#0F8B7D] border border-teal-200 flex items-center justify-center shrink-0">
                      <FileCheck2 size={16} />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">
                        Terms Loaded from Lease Agreement ({parsedTenantDocMeta?.fileName || uploadedTenantFileList[0]?.name})
                      </span>
                      <span className="text-[11px] text-teal-800">
                        Tenant and contract details are unified. Review and verify financial rates, demised area, and dates below.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-teal-300 text-teal-900 shrink-0">
                    Agreement Linked ✓
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-teal-300 hover:border-teal-500 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                        <FileUp size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900">
                            Upload Rent Agreement / Lease Deed
                          </h4>
                          <span className="text-[10px] font-black text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                            Auto-Extract
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Upload PDF, DOCX, or text agreement. Automatically detects tenant, rent rate/sqft, CAM, parking, escalation, deposit, and lock-in. You can review and edit all fields below.
                        </p>
                      </div>
                    </div>

                    <label className="cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.rtf"
                        disabled={isUploadingAgreement}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadRentAgreement(file);
                          e.target.value = "";
                        }}
                      />
                      <div
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs ${
                          isUploadingAgreement
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-teal-700 hover:bg-teal-800 text-white"
                        }`}
                      >
                        {isUploadingAgreement ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Extracting Terms...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} />
                            <span>Browse Lease Deed</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Parsed Highlights Banner */}
                  {parsedAgreementMeta && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FileCheck2 size={15} className="text-emerald-700" />
                          <span>Parsed: {parsedAgreementMeta.fileName}</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                          {parsedAgreementMeta.confidence}% Confidence • {parsedAgreementMeta.extractedFieldsCount} Terms Extracted
                        </span>
                      </div>

                      {parsedAgreementMeta.summaryHighlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {parsedAgreementMeta.summaryHighlights.map((hl, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-900"
                            >
                              ✓ {hl}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-emerald-800 italic pt-0.5">
                        ✓ All detected parameters have been auto-populated into the contract form below. You can modify any value as needed.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ──── SECTION 1: HIERARCHY MAPPING (ORGANIZED 2-TIER DEMISED ALLOCATION) ──── */}
              <div className="space-y-3.5">
                {/* Tier 1: Property, Building & Floor Location */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Building2 size={14} className="text-teal-700" />
                      <span>Property Location &amp; Floor Filter</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Asset Demised Hierarchy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Property (Auto-bound to active property) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Commercial Property <span className="text-rose-500">*</span>
                      </label>
                      <div className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 truncate shadow-2xs flex items-center justify-between">
                        <span className="truncate">{activePropertyObj?.name || propForm.propertyName || "Commercial Property"}</span>
                        {propForm.areaSqft && (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                            {Number(propForm.areaSqft).toLocaleString()} Sq.Ft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Building / Tower */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Building / Tower <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={contractForm.buildingId}
                        onChange={(e) => {
                          const newBldgId = e.target.value;
                          setContractForm({ ...contractForm, buildingId: newBldgId });
                          setSelectedContractFloor("");
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shadow-2xs"
                      >
                        {displayBuildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.floors || 1} Floors{b.totalAreaSqft ? ` • ${b.totalAreaSqft.toLocaleString()} Sq.Ft` : ""})
                          </option>
                        ))}
                        {displayBuildings.length === 0 && <option value="">No buildings created</option>}
                      </select>
                    </div>

                    {/* 3. Floor Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">Demised Floor Level <span className="text-rose-500">*</span></label>
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          Filters Spaces
                        </span>
                      </div>
                      <select
                        value={selectedContractFloor}
                        onChange={(e) => {
                          const fl = e.target.value;
                          setSelectedContractFloor(fl);
                          if (fl) {
                            const curBId = contractForm.buildingId || displayBuildings[0]?.id;
                            const isG = fl === "0";
                            const match = spacesList.find(
                              (s) =>
                                (!curBId || s.buildingId === curBId) &&
                                ((isG && ((s.floorName || "").toLowerCase().includes("ground") || (s.floorName || "").toLowerCase() === "g" || s.name.toLowerCase().includes("ground") || s.name.toLowerCase().includes("bay"))) ||
                                  s.name.toLowerCase().includes(`floor ${fl}`) ||
                                  s.name.toLowerCase().includes(`fl-${fl}`) ||
                                  s.name.toLowerCase().includes(`f${fl}`) ||
                                  s.floorName?.toLowerCase() === `floor ${fl}` ||
                                  s.floorName?.toLowerCase() === `f${fl}` ||
                                  s.floorName === fl ||
                                  s.floorName?.toLowerCase() === formatFloorName(Number(fl)).toLowerCase())
                            );
                            if (match) {
                              handleSpaceSelect(match.id);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-[#0F8B7D] outline-none cursor-pointer shadow-2xs"
                      >
                        <option value="">All Floors</option>
                        {buildingFloorNumbersForContract.map((flNum) => {
                          const curBName = displayBuildings.find((b) => b.id === (contractForm.buildingId || displayBuildings[0]?.id))?.name;
                          const flLabel = flNum === 0 ? "Ground Floor" : formatFloorName(flNum);
                          return (
                            <option key={flNum} value={String(flNum)}>
                              {displayBuildings.length > 1 && curBName ? `${curBName} • ` : ""}{flLabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tier 2: Occupant & Space Unit Binding */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-teal-950">
                      <User size={14} className="text-[#0F8B7D]" />
                      <span>Tenant &amp; Demised Unit Binding</span>
                    </div>
                    <span className="text-[10px] text-teal-800 font-bold bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Contract Signatories &amp; Premises
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Occupant (Tenant) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          Occupant / Tenant <span className="text-rose-500">*</span>
                        </label>
                        {changedFieldKeys.has("occupantName") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <select
                        value={contractForm.occupantId}
                        onChange={(e) => {
                          clearFieldHighlight("occupantName");
                          setContractForm({ ...contractForm, occupantId: e.target.value });
                        }}
                        onClick={() => clearFieldHighlight("occupantName")}
                        onFocus={() => clearFieldHighlight("occupantName")}
                        className={getHighlightClass(
                          "occupantName",
                          "w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer shadow-2xs"
                        )}
                      >
                        {tenantsList.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.company && t.company !== t.name ? `(${t.company})` : ""}
                          </option>
                        ))}
                        {tenantsList.length === 0 && <option value="">No occupants registered yet</option>}
                      </select>
                    </div>

                    {/* 2. Space / Unit */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          Demised Space / Unit <span className="text-rose-500">*</span>
                        </label>
                        {selectedContractFloor && (
                          <span className="text-[10px] text-teal-700 font-semibold">
                            Floor {selectedContractFloor === "0" ? "Ground" : selectedContractFloor}
                          </span>
                        )}
                      </div>
                      {(() => {
                        const curBldgId = contractForm.buildingId || displayBuildings[0]?.id;
                        const filteredSpaces = spacesList.filter((s) => {
                          if (displayBuildings.length > 1 && curBldgId && s.buildingId && s.buildingId !== curBldgId) {
                            return false;
                          }
                          if (!selectedContractFloor) return true;
                          const flStr = (s.floorName || "").toLowerCase().trim();
                          const nameStr = s.name.toLowerCase().trim();
                          const targetFl = selectedContractFloor.toLowerCase().trim();
                          if (targetFl === "0") {
                            return (
                              flStr === "0" ||
                              flStr.includes("ground") ||
                              flStr === "g" ||
                              nameStr.includes("ground") ||
                              nameStr.includes("bay") ||
                              nameStr.includes("shed")
                            );
                          }
                          return (
                            flStr === `floor ${targetFl}` ||
                            flStr === `f${targetFl}` ||
                            flStr === targetFl ||
                            nameStr.includes(`floor ${targetFl}`) ||
                            nameStr.includes(`f${targetFl}`)
                          );
                        });
                        const displayList = filteredSpaces.length > 0 ? filteredSpaces : spacesList;
                        return (
                          <select
                            value={contractForm.spaceId}
                            onChange={(e) => handleSpaceSelect(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:border-[#0F8B7D] outline-none cursor-pointer shadow-2xs"
                          >
                            {displayList.map((s) => {
                              const sBldg = buildingsList.find((b) => b.id === s.buildingId);
                              return (
                                <option key={s.id} value={s.id}>
                                  {displayBuildings.length > 1 && sBldg ? `[${sBldg.name}] ` : ""}{s.name} ({s.area > 0 ? `${s.area.toLocaleString()} Sq.Ft` : "Standard Area"}) • {s.occupancyStatus === "occupied" ? "Occupied" : "Vacant"}
                                </option>
                              );
                            })}
                            {displayList.length === 0 && <option value="">No spaces created</option>}
                          </select>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Single level warehouse facility notice */}
                  {isSingleLevelAssetType(propForm.propertyType) && (
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 flex items-center justify-between text-[11px] text-teal-900">
                      <span className="font-medium">
                        🏢 <strong>Single-Level / Warehouse Asset:</strong> Demised premises automatically points to Ground Facility Bay ({Number(propForm.areaSqft || 0).toLocaleString()} Sq.Ft capacity).
                      </span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0 ml-2">
                        Full Facility
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ──── SECTION 2: RENT CALCULATION BASIS & BILLING MODEL ──── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Calculator size={15} className="text-teal-700" />
                    <span className="font-bold text-slate-800">Rent Calculation Model &amp; Pricing Basis</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Select how base rent is calculated for invoices
                  </span>
                </div>

                {/* Model Tabs / Radio Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "Area-based", label: "Per Sq.Ft (Area)", desc: "₹/sqft/mo" },
                      { id: "Seat-based", label: "Per Seat (Desk)", desc: "₹/seat/mo" },
                      { id: "Fixed", label: "Fixed Lump-sum", desc: "Flat monthly" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        const newModel = m.id;
                        setContractForm((prev) => {
                          let nextRent = prev.monthlyRent;
                          if (newModel === "Area-based" && prev.ratePerSqft && prev.areaSqft) {
                            nextRent = String(Math.round(Number(prev.ratePerSqft) * Number(prev.areaSqft)));
                          } else if (newModel === "Seat-based" && prev.ratePerSeat && prev.seatCount) {
                            nextRent = String(Math.round(Number(prev.ratePerSeat) * Number(prev.seatCount)));
                          }
                          return { ...prev, billingModel: newModel, monthlyRent: nextRent };
                        });
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        contractForm.billingModel === m.id
                          ? "bg-white border-teal-600 shadow-xs ring-1 ring-teal-500"
                          : "bg-white/60 border-slate-200 hover:bg-white text-slate-600"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">{m.label}</div>
                      <div className="text-[10px] text-slate-500">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Inputs Based on Selected Model */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {contractForm.billingModel === "Area-based" ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">
                            Rate PSF (₹/sqft/mo) <span className="text-rose-500">*</span>
                          </label>
                          {changedFieldKeys.has("ratePerSqft") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 80"
                          value={contractForm.ratePerSqft}
                          onClick={() => clearFieldHighlight("ratePerSqft")}
                          onFocus={() => clearFieldHighlight("ratePerSqft")}
                          onChange={(e) => {
                            clearFieldHighlight("ratePerSqft");
                            const rate = e.target.value;
                            const area = Number(contractForm.areaSqft) || 0;
                            const calcRent = rate && area ? String(Math.round(Number(rate) * area)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              ratePerSqft: rate,
                              monthlyRent: calcRent,
                            });
                          }}
                          className={getHighlightClass(
                            "ratePerSqft",
                            "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                          )}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">
                            Chargeable Area (Sq.Ft) <span className="text-rose-500">*</span>
                          </label>
                          {(totalTenantSelectedArea > 0 || Number(propForm.areaSqft) > 0) && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              Cap: {(totalTenantSelectedArea || Number(propForm.areaSqft)).toLocaleString()} Sq.Ft
                            </span>
                          )}
                          {changedFieldKeys.has("areaSqft") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          max={totalTenantSelectedArea || Number(propForm.areaSqft) || undefined}
                          value={contractForm.areaSqft}
                          onClick={() => clearFieldHighlight("areaSqft")}
                          onFocus={() => clearFieldHighlight("areaSqft")}
                          onChange={(e) => {
                            clearFieldHighlight("areaSqft");
                            const area = e.target.value;
                            const maxArea = totalTenantSelectedArea || Number(propForm.areaSqft) || 0;
                            if (maxArea > 0 && Number(area) > maxArea) {
                              showToast(`Area cannot exceed leasable cap of ${maxArea.toLocaleString()} Sq.Ft`, "error");
                              return;
                            }
                            const rate = Number(contractForm.ratePerSqft) || 0;
                            const calcRent = rate && area ? String(Math.round(rate * Number(area))) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              areaSqft: area,
                              monthlyRent: calcRent,
                            });
                          }}
                          className={getHighlightClass(
                            "areaSqft",
                            "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                          )}
                        />
                      </div>
                    </>
                  ) : contractForm.billingModel === "Seat-based" ? (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Rate per Seat (₹ / seat / month) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 12000"
                          value={contractForm.ratePerSeat}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const seats = Number(contractForm.seatCount) || 0;
                            const calcRent = rate && seats ? String(Math.round(Number(rate) * seats)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              ratePerSeat: rate,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Allocated Seats / Desks <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={contractForm.seatCount}
                          onChange={(e) => {
                            const seats = e.target.value;
                            const rate = Number(contractForm.ratePerSeat) || 0;
                            const calcRent = seats && rate ? String(Math.round(Number(seats) * rate)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              seatCount: seats,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Chargeable Area (Sq.Ft)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={contractForm.areaSqft}
                        onClick={() => clearFieldHighlight("areaSqft")}
                        onFocus={() => clearFieldHighlight("areaSqft")}
                        onChange={(e) => {
                          clearFieldHighlight("areaSqft");
                          setContractForm({ ...contractForm, areaSqft: e.target.value });
                        }}
                        className={getHighlightClass(
                          "areaSqft",
                          "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        )}
                      />
                    </div>
                  )}

                  {/* Monthly Base Rent (Calculated / Direct) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Monthly Base Rent (₹) <span className="text-rose-500">*</span>
                      </label>
                      {changedFieldKeys.has("monthlyRent") ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                          Updated
                        </span>
                      ) : (
                        contractForm.billingModel === "Area-based" && contractForm.ratePerSqft && contractForm.areaSqft && (
                          <span className="text-[10px] font-bold text-teal-700">Auto-calculated</span>
                        )
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 400000"
                      value={contractForm.monthlyRent}
                      onClick={() => clearFieldHighlight("monthlyRent")}
                      onFocus={() => clearFieldHighlight("monthlyRent")}
                      onChange={(e) => {
                        clearFieldHighlight("monthlyRent");
                        setContractForm({ ...contractForm, monthlyRent: e.target.value });
                      }}
                      className={getHighlightClass(
                        "monthlyRent",
                        "w-full px-3 py-2 rounded-xl border border-teal-500 bg-white font-mono font-black text-slate-900 focus:border-[#0F8B7D] outline-none"
                      )}
                    />
                  </div>
                </div>

                {/* Calculation Formula Badge */}
                {contractForm.billingModel === "Area-based" && contractForm.ratePerSqft && contractForm.areaSqft && (
                  <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] font-medium text-teal-900 flex items-center justify-between">
                    <span>
                      Formula: ₹{Number(contractForm.ratePerSqft).toLocaleString()} / sqft × {Number(contractForm.areaSqft).toLocaleString()} sqft =
                    </span>
                    <span className="font-mono font-bold">
                      ₹{Number(contractForm.monthlyRent).toLocaleString()} / month base rent
                    </span>
                  </div>
                )}
                {contractForm.billingModel === "Seat-based" && contractForm.ratePerSeat && contractForm.seatCount && (
                  <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] font-medium text-teal-900 flex items-center justify-between">
                    <span>
                      Formula: ₹{Number(contractForm.ratePerSeat).toLocaleString()} / seat × {Number(contractForm.seatCount)} seats =
                    </span>
                    <span className="font-mono font-bold">
                      ₹{Number(contractForm.monthlyRent).toLocaleString()} / month base rent
                    </span>
                  </div>
                )}
              </div>

              {/* ──── SECTION 3: COMMON AREA MAINTENANCE (CAM) & PARKING ──── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* CAM (Common Area Maintenance) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                    <span className="font-bold text-slate-800">Common Area Maintenance (CAM)</span>
                    <span className="text-[10px] text-slate-500">Operation &amp; Upkeep</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CAM Billing Basis</label>
                      <select
                        value={contractForm.camType}
                        onChange={(e) => {
                          const type = e.target.value;
                          let nextMonthly = contractForm.camMonthly;
                          if (type === "Included") {
                            nextMonthly = "0";
                          } else if (type === "Per Sq.Ft" && contractForm.camRate && contractForm.areaSqft) {
                            nextMonthly = String(Math.round(Number(contractForm.camRate) * Number(contractForm.areaSqft)));
                          }
                          setContractForm({ ...contractForm, camType: type, camMonthly: nextMonthly });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium outline-none cursor-pointer"
                      >
                        <option value="Per Sq.Ft">Per Sq.Ft (₹/sqft/mo)</option>
                        <option value="Fixed Monthly">Fixed Monthly Amount</option>
                        <option value="Included">Included in Base Rent</option>
                        <option value="Actuals">Actuals / Reimbursement</option>
                      </select>
                    </div>

                    {/* Requirement 7: When CAM is Included in rent, amount/rate input is hidden */}
                    {contractForm.camType === "Included" ? (
                      <div className="flex items-center justify-center p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                        ✓ Included in Base Rent (No separate CAM charge)
                      </div>
                    ) : contractForm.camType === "Per Sq.Ft" ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">CAM Rate (₹/sqft)</label>
                          {changedFieldKeys.has("camRate") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 15"
                          value={contractForm.camRate}
                          onClick={() => clearFieldHighlight("camRate")}
                          onFocus={() => clearFieldHighlight("camRate")}
                          onChange={(e) => {
                            clearFieldHighlight("camRate");
                            const rate = e.target.value;
                            const area = Number(contractForm.areaSqft) || 0;
                            const monthly = rate && area ? String(Math.round(Number(rate) * area)) : "";
                            setContractForm({ ...contractForm, camRate: rate, camMonthly: monthly });
                          }}
                          className={getHighlightClass(
                            "camRate",
                            "w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono font-medium outline-none"
                          )}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">CAM Monthly (₹)</label>
                          {changedFieldKeys.has("camRate") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder="e.g. 75000"
                          value={contractForm.camMonthly}
                          onClick={() => clearFieldHighlight("camRate")}
                          onFocus={() => clearFieldHighlight("camRate")}
                          onChange={(e) => {
                            clearFieldHighlight("camRate");
                            setContractForm({ ...contractForm, camMonthly: e.target.value });
                          }}
                          className={getHighlightClass(
                            "camRate",
                            "w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono font-medium outline-none"
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {contractForm.camType === "Per Sq.Ft" && contractForm.camRate && contractForm.areaSqft && (
                    <div className="text-[11px] text-teal-800 font-medium">
                      CAM Total: ₹{Math.round(Number(contractForm.camRate) * Number(contractForm.areaSqft)).toLocaleString()} / month
                    </div>
                  )}
                </div>

                {/* Requirement 8: Granular Parking Allocations (Free vs Paid for 4W & 2W) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Car size={13} className="text-teal-700" />
                      <span>Parking Allocations</span>
                    </div>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                      Free &amp; Paid Breakdown
                    </span>
                  </div>

                  {/* 4-Wheeler Car Parking */}
                  <div className="p-2 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">🚗 Car Parking (4-Wheeler)</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Total: {(Number(contractForm.carParkingFreeSlots) || 0) + (Number(contractForm.carParkingPaidSlots) || 0)} slots
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Free (₹0)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 2"
                          value={contractForm.carParkingFreeSlots}
                          onChange={(e) => {
                            const val = e.target.value;
                            const total = (Number(val) || 0) + (Number(contractForm.carParkingPaidSlots) || 0);
                            setContractForm({ ...contractForm, carParkingFreeSlots: val, carParkingSlots: String(total) });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Paid Slots</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 3"
                          value={contractForm.carParkingPaidSlots}
                          onChange={(e) => {
                            const val = e.target.value;
                            const total = (Number(contractForm.carParkingFreeSlots) || 0) + (Number(val) || 0);
                            setContractForm({ ...contractForm, carParkingPaidSlots: val, carParkingSlots: String(total) });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Rate / Paid (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 4000"
                          value={contractForm.carParkingRate}
                          onChange={(e) => setContractForm({ ...contractForm, carParkingRate: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2-Wheeler Bike Parking */}
                  <div className="p-2 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">🏍️ Two-Wheeler / Bike</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Total: {(Number(contractForm.twoWheelerFreeSlots) || 0) + (Number(contractForm.twoWheelerPaidSlots) || 0)} slots
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Free (₹0)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 5"
                          value={contractForm.twoWheelerFreeSlots}
                          onChange={(e) => {
                            const val = e.target.value;
                            const total = (Number(val) || 0) + (Number(contractForm.twoWheelerPaidSlots) || 0);
                            setContractForm({ ...contractForm, twoWheelerFreeSlots: val, twoWheelerSlots: String(total) });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Paid Slots</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 5"
                          value={contractForm.twoWheelerPaidSlots}
                          onChange={(e) => {
                            const val = e.target.value;
                            const total = (Number(contractForm.twoWheelerFreeSlots) || 0) + (Number(val) || 0);
                            setContractForm({ ...contractForm, twoWheelerPaidSlots: val, twoWheelerSlots: String(total) });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Rate / Paid (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 500"
                          value={contractForm.twoWheelerRate}
                          onChange={(e) => setContractForm({ ...contractForm, twoWheelerRate: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ──── LIVE GROSS MONTHLY PAYOUT SUMMARY CARD ──── */}
              {Number(contractForm.monthlyRent) > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-md text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-800/80 pb-2">
                    <span className="font-bold tracking-wide uppercase text-[11px] text-teal-300">
                      Live Invoicing Breakdown &amp; Monthly Cashflow
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono">
                      SAC Code 997212 (Leasing)
                    </span>
                  </div>

                  {(() => {
                    const baseRent = Number(contractForm.monthlyRent) || 0;
                    const cam =
                      contractForm.camType === "Included"
                        ? 0
                        : contractForm.camType === "Per Sq.Ft"
                          ? Math.round((Number(contractForm.camRate) || 0) * (Number(contractForm.areaSqft) || 0))
                          : Number(contractForm.camMonthly) || 0;
                    const carPaidCount = Number(contractForm.carParkingPaidSlots) || 0;
                    const bikePaidCount = Number(contractForm.twoWheelerPaidSlots) || 0;
                    const parking =
                      carPaidCount * (Number(contractForm.carParkingRate) || 0) +
                      bikePaidCount * (Number(contractForm.twoWheelerRate) || 0);
                    const grossExclGst = baseRent + cam + parking;
                    const gst = Math.round(grossExclGst * 0.18);
                    const totalGross = grossExclGst + gst;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Base Rent</div>
                          <div className="font-bold text-sm text-white">₹{baseRent.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">CAM + Parking</div>
                          <div className="font-bold text-sm text-teal-300">₹{(cam + parking).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Gross (Excl. GST)</div>
                          <div className="font-bold text-sm text-white">₹{grossExclGst.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-400 uppercase font-sans font-bold">Total Invoiced (GST 18%)</div>
                          <div className="font-black text-sm text-emerald-300">₹{totalGross.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ──── SECTION 4: SECURITY DEPOSIT (IFRSD) ──── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/70 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-teal-700" />
                    <span>Interest-Free Refundable Security Deposit (IFRSD)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Quick multi-month rent multipliers
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 mr-1">Months multiplier:</span>
                  {["3", "6", "9", "10", "12"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const rent = Number(contractForm.monthlyRent) || 0;
                        setContractForm({
                          ...contractForm,
                          depositMonths: m,
                          securityDeposit: rent > 0 ? String(Math.round(Number(m) * rent)) : contractForm.securityDeposit,
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        contractForm.depositMonths === m
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Security Deposit Amount (₹)</label>
                      {changedFieldKeys.has("securityDeposit") && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                          Updated
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2400000"
                      value={contractForm.securityDeposit}
                      onClick={() => clearFieldHighlight("securityDeposit")}
                      onFocus={() => clearFieldHighlight("securityDeposit")}
                      onChange={(e) => {
                        clearFieldHighlight("securityDeposit");
                        setContractForm({ ...contractForm, securityDeposit: e.target.value });
                      }}
                      className={getHighlightClass(
                        "securityDeposit",
                        "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                      )}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Rent-Free Fit-out Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 30 (Days)"
                      value={contractForm.fitoutDays}
                      onChange={(e) => setContractForm({ ...contractForm, fitoutDays: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ──── SECTION 5: DATES & LEGAL PERIODS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Contract Start Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Contract Start Date <span className="text-rose-500">*</span>
                    </label>
                    {changedFieldKeys.has("startDate") && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                        Updated
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onClick={() => clearFieldHighlight("startDate")}
                    onFocus={() => clearFieldHighlight("startDate")}
                    onChange={(e) => {
                      clearFieldHighlight("startDate");
                      const nextStart = e.target.value;
                      setContractForm((prev) => {
                        const updated = { ...prev, startDate: nextStart };
                        if (prev.endDate && nextStart && prev.endDate <= nextStart) {
                          updated.endDate = "";
                        }
                        return updated;
                      });
                    }}
                    className={getHighlightClass(
                      "startDate",
                      "w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                    )}
                  />
                </div>

                {/* Contract End Date (Must be strictly after Start Date) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Contract End Date <span className="text-rose-500">*</span>
                    </label>
                    {contractForm.startDate && (
                      <span className="text-[10px] text-teal-700 font-semibold">Min: {contractForm.startDate}</span>
                    )}
                    {changedFieldKeys.has("endDate") && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                        Updated
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    min={contractForm.startDate || undefined}
                    value={contractForm.endDate}
                    onClick={() => clearFieldHighlight("endDate")}
                    onFocus={() => clearFieldHighlight("endDate")}
                    onChange={(e) => {
                      clearFieldHighlight("endDate");
                      const nextEnd = e.target.value;
                      if (contractForm.startDate && nextEnd && nextEnd <= contractForm.startDate) {
                        showToast("Contract End Date must be after Start Date (" + contractForm.startDate + ")", "error");
                        return;
                      }
                      setContractForm({ ...contractForm, endDate: nextEnd });
                    }}
                    className={getHighlightClass(
                      "endDate",
                      "w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                    )}
                  />
                </div>

                {/* Lock-in Period */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Lock-in Period (Months)</label>
                    {changedFieldKeys.has("lockInMonths") && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                        Updated
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={contractForm.lockInMonths}
                    onClick={() => clearFieldHighlight("lockInMonths")}
                    onFocus={() => clearFieldHighlight("lockInMonths")}
                    onChange={(e) => {
                      clearFieldHighlight("lockInMonths");
                      setContractForm({ ...contractForm, lockInMonths: e.target.value });
                    }}
                    className={getHighlightClass(
                      "lockInMonths",
                      "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                    )}
                  />
                </div>

                {/* Notice Period */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 90 (Days)"
                    value={contractForm.noticeDays}
                    onChange={(e) => setContractForm({ ...contractForm, noticeDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              {/* ──── SECTION 6: ESCALATION TERMS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Escalation % */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Escalation %</label>
                    {changedFieldKeys.has("escalationPct") && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                        Updated
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={contractForm.escalationPct}
                    onClick={() => clearFieldHighlight("escalationPct")}
                    onFocus={() => clearFieldHighlight("escalationPct")}
                    onChange={(e) => {
                      clearFieldHighlight("escalationPct");
                      setContractForm({ ...contractForm, escalationPct: e.target.value });
                    }}
                    className={getHighlightClass(
                      "escalationPct",
                      "w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                    )}
                  />
                </div>

                {/* Escalation Frequency */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Frequency</label>
                  <select
                    value={contractForm.escalationFrequency}
                    onChange={(e) => setContractForm({ ...contractForm, escalationFrequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Annual">Annual (Every 12 Months)</option>
                    <option value="Biannual">Biannual (Every 24 Months)</option>
                    <option value="Triennial">Triennial (Every 36 Months)</option>
                    <option value="Quarterly">Quarterly (Every 3 Months)</option>
                  </select>
                </div>

                {/* Escalation Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Start Date</label>
                  <input
                    type="date"
                    value={contractForm.escalationStartDate}
                    onChange={(e) => setContractForm({ ...contractForm, escalationStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              {/* ──── SECTION 7: STATUTORY & INVOICING TERMS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Billing Entity (SPV) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Billing Entity (Which SPV Bills This)
                  </label>
                  <input
                    type="text"
                    list="spv-options"
                    placeholder="e.g. Cyber Estates SPV Pvt Ltd"
                    value={contractForm.billingEntity}
                    onChange={(e) => setContractForm({ ...contractForm, billingEntity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                  <datalist id="spv-options">
                    {billingEntities.map((be, idx) => (
                      <option key={idx} value={be} />
                    ))}
                    {propertiesList.map((p) => (
                      <option key={`spv-prop-${p.id}`} value={`${p.name} SPV`} />
                    ))}
                  </datalist>
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Due on 1st of month">Due on 1st of month</option>
                    <option value="Due on 5th of month">Due on 5th of month</option>
                    <option value="Due on 7th of month">Due on 7th of month</option>
                    <option value="Net 0">Net 0 (Due upon receipt)</option>
                    <option value="Net 7">Net 7 (Within 7 days)</option>
                    <option value="Net 15">Net 15 (Within 15 days)</option>
                    <option value="Net 30">Net 30 (Within 30 days)</option>
                  </select>
                </div>

                {/* Stamp Duty & Registration Sharing */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stamp Duty Sharing</label>
                  <select
                    value={contractForm.stampDutySharing}
                    onChange={(e) => setContractForm({ ...contractForm, stampDutySharing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="50:50 Shared">50:50 Shared Equally</option>
                    <option value="100% Tenant">100% Borne by Tenant</option>
                    <option value="100% Landlord">100% Borne by Landlord</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Covenants &amp; Special Conditions
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific covenants, signage rights, power backup limits, fitout terms, or termination clauses..."
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none resize-none text-xs"
                />
              </div>

              {/* ──── REAL-TIME COMMERCIAL FINANCIAL OVERVIEW CARD ──── */}
              {(() => {
                const area = Number(contractForm.areaSqft) || 0;
                const rent = Number(contractForm.monthlyRent) || 0;
                const camMonthly =
                  contractForm.camType === "Included"
                    ? 0
                    : contractForm.camType === "Per Sq.Ft" && contractForm.camRate && area > 0
                      ? Math.round(Number(contractForm.camRate) * area)
                      : Number(contractForm.camMonthly) || 0;
                const carPaidCount = Number(contractForm.carParkingPaidSlots) || 0;
                const bikePaidCount = Number(contractForm.twoWheelerPaidSlots) || 0;
                const carParkMonthly = carPaidCount * (Number(contractForm.carParkingRate) || 0);
                const twoWheelParkMonthly = bikePaidCount * (Number(contractForm.twoWheelerRate) || 0);
                const totalParking = carParkMonthly + twoWheelParkMonthly;
                const subtotal = rent + camMonthly + totalParking;
                const gst18 = Math.round(subtotal * 0.18);

                // Requirement 10: Sole Proprietorship / Individual Statutory TDS Rules
                const selectedOccupant = tenantsList.find((t) => t.id === contractForm.occupantId);
                const currentEntity = (selectedOccupant as any)?.companyType || tenantForm.companyType || "pvt_ltd";
                const isProprietor = currentEntity === "sole_proprietorship";

                let tdsPct = 10;
                let tdsSection = "TDS u/s 194-I (10%)";
                let tdsAmount = Math.round(rent * 0.10);

                if (isProprietor) {
                  if (rent > 50000) {
                    tdsPct = 5;
                    tdsSection = "TDS u/s 194-IB (5% - Rent > ₹50k, Form 26QC)";
                    tdsAmount = Math.round(rent * 0.05);
                  } else {
                    tdsPct = 0;
                    tdsSection = "Exempt u/s 194-IB (0% - Rent ≤ ₹50k, No TDS)";
                    tdsAmount = 0;
                  }
                }

                const netMonthly = subtotal + gst18 - tdsAmount;
                const deposit = Number(contractForm.securityDeposit) || (Number(contractForm.depositMonths) || 6) * rent;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-700/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Calculator size={15} className="text-teal-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                          Real-Time Commercial Financial Summary
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isProprietor
                          ? rent > 50000
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                      }`}>
                        Statutory GST 18% • {tdsSection}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-semibold block">Monthly Base Rent</span>
                        <span className="text-sm font-mono font-black text-white">₹{rent.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Monthly CAM {contractForm.camType === "Included" ? "(Included)" : ""}
                        </span>
                        <span className="text-sm font-mono font-black text-white">₹{camMonthly.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-semibold block">Parking ({carPaidCount} Car, {bikePaidCount} Bike)</span>
                        <span className="text-sm font-mono font-black text-white">₹{totalParking.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-semibold block">Subtotal Before Tax</span>
                        <span className="text-sm font-mono font-black text-teal-300">₹{subtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">+ GST (18%)</span>
                        <span className="text-xs font-mono font-bold text-amber-300">+₹{gst18.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">- {tdsSection}</span>
                        <span className={`text-xs font-mono font-bold ${tdsAmount === 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          {tdsAmount === 0 ? "₹0 (Exempt)" : `-₹${tdsAmount.toLocaleString()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-teal-400 font-bold block">Net Monthly Receivable</span>
                        <span className="text-sm font-mono font-black text-emerald-400">₹{netMonthly.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Security Deposit (IFRSD)</span>
                        <span className="text-sm font-mono font-black text-white">₹{deposit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Contract Action Buttons & PDF Download & Next Step (§17, §20) */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tenant")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <span>← Back to Tenants</span>
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Download Contract PDF Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isOwnerSubscribed && !checkIsOwnerSubscribed()) {
                        setSubscriptionGateReason("Download Official Formatted Lease Contract PDF");
                        setSubscriptionGateModalOpen(true);
                        return;
                      }
                      // Generate and download full commercial deed
                      const activeBldg = buildingsList.find((b) => b.id === contractForm.buildingId);
                      const activeSpc = displaySpaces.find((s) => s.id === contractForm.spaceId);
                      downloadLeaseContractPdf({
                        landlordName: propForm.spvName || propForm.contactName || "Commercial Property Owner",
                        landlordAddress: propForm.address || propForm.city || "",
                        landlordPan: (propForm as any).spvPan || "",
                        landlordGstin: (propForm as any).spvGst || "",
                        tenantName: tenantForm.companyName || "Lessee Organization",
                        tenantTradeName: tenantForm.tradeName || "",
                        tenantCompanyType: tenantForm.companyType,
                        tenantCin: tenantForm.cinNumber || "",
                        tenantPan: tenantForm.pan || "",
                        tenantGstin: tenantForm.gst || "",
                        tenantAddress: tenantForm.billingAddress || "",
                        signatoryName: tenantForm.signatoryName || "Authorized Signatory",
                        signatoryDesignation: tenantForm.signatoryDesignation || "Director",
                        propertyName: propForm.propertyName || "Commercial Property",
                        buildingName: activeBldg?.name,
                        floorName: selectedTenantFloor === "0" ? "Ground Floor" : formatFloorName(Number(selectedTenantFloor)),
                        spaceName: activeSpc?.name || "Demised Commercial Suite",
                        chargeableAreaSqft: Number(contractForm.areaSqft) || 5000,
                        monthlyRent: Number(contractForm.monthlyRent) || 0,
                        ratePerSqft: Number(contractForm.ratePerSqft) || undefined,
                        camMonthly: Number(contractForm.camMonthly) || undefined,
                        camRatePerSqft: Number(contractForm.camRate) || undefined,
                        securityDeposit: Number(contractForm.securityDeposit) || 0,
                        securityDepositMonths: undefined,
                        startDate: contractForm.startDate || new Date().toISOString().split("T")[0],
                        endDate: contractForm.endDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split("T")[0],
                        lockInMonths: Number(contractForm.lockInMonths) || undefined,
                        noticePeriodDays: Number(contractForm.noticeDays) || 90,
                        escalationPct: Number(contractForm.escalationPct) || 5,
                        escalationFrequency: contractForm.escalationFrequency,
                      }, isOwnerSubscribed && checkIsOwnerSubscribed());
                      showToast("✓ Commercial Lease Deed generated & opened for printing/PDF!");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-teal-300 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={14} className="text-[#0F8B7D]" />
                    <span>Download Contract PDF</span>
                    {!isOwnerSubscribed && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300">
                        PRO
                      </span>
                    )}
                  </button>

                  {/* Option A: Assign 3rd Party Manager */}
                  <button
                    type="button"
                    onClick={(e) => handleSaveContract(e, "delegate")}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Assign 3rd Party Manager →</span>
                  </button>

                  {/* Option B: Self-Managed / Complete Onboarding */}
                  <button
                    type="button"
                    onClick={(e) => handleSaveContract(e, "finish")}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                    <span>Save Contract &amp; Finish ✓</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 5: THIRD-PARTY MANAGEMENT ASSIGNMENT ════════════════ */}
          {activeTab === "delegation" && (
            <form onSubmit={handleSaveDelegation} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {shouldSkipSpaceStep
                        ? "Step 4: Assign Property Management to Third Party"
                        : "Step 5: Assign Property Management to Third Party"}
                    </span>
                    <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                      Post-Contract Delegation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assign daily commercial operations, tenant relations, and billing oversight to an external agency or facility manager with granular controls.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                  Step 5 of 5
                </span>
              </div>

              {/* Latest Generated Manager Invite Banner (§20 Subscription Gated) */}
              {latestManagerInvite && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-xs animate-in fade-in space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-teal-950 flex items-center gap-1.5">
                          <span>Management Delegated: {latestManagerInvite.name}</span>
                          <span className="text-[10px] font-bold text-teal-700 bg-white/90 px-1.5 py-0.5 rounded border border-teal-200">
                            {latestManagerInvite.email}
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-800 mt-0.5">
                          Assigned for <span className="font-bold">{latestManagerInvite.propertyName}</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Check for Sharable Link */}
                  {isOwnerSubscribed || checkIsOwnerSubscribed() ? (
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <input
                        type="text"
                        readOnly
                        value={latestManagerInvite.link}
                        className="text-[11px] font-mono text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 truncate"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(latestManagerInvite.link);
                            setCopiedManagerInvite(true);
                            showToast("✓ Management invitation link copied to clipboard!");
                            setTimeout(() => setCopiedManagerInvite(false), 2500);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                        >
                          {copiedManagerInvite ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedManagerInvite ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Hi ${latestManagerInvite.name}, you have been assigned to manage ${latestManagerInvite.propertyName} on OfficeX. Access your management console here: ${latestManagerInvite.link}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`mailto:${latestManagerInvite.email}?subject=${encodeURIComponent(
                            `Property Management Access - ${latestManagerInvite.propertyName}`
                          )}&body=${encodeURIComponent(
                            `Hi ${latestManagerInvite.name},\n\nYou have been assigned as property manager for ${latestManagerInvite.propertyName}.\n\nPlease activate your access using the link below:\n${latestManagerInvite.link}\n\nBest regards,\nOfficeX Commercial Asset Management`
                          )}`}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                        >
                          <Mail size={13} />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-3 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden">
                      <div className="filter blur-xs select-none opacity-40">
                        <span className="font-mono text-xs text-slate-800">https://officex.ai/invite?role=pm_company&mgr=Authorized&access=••••••••••••••••</span>
                      </div>
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2 text-white">
                          <Lock size={15} className="text-amber-400 shrink-0" />
                          <span className="text-xs font-bold">Pro Subscription required to share manager invite links</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionGateReason("Share Manager Activation Link via WhatsApp/Email");
                            setSubscriptionGateModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black shadow cursor-pointer transition"
                        >
                          Subscribe Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Fields Container */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                {/* 1. Property to Assign */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Commercial Asset <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={delegationForm.propertyId || contractForm.propertyId || propForm.existingPropId || propertiesList[0]?.id || ""}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const selProp = propertiesList.find((p) => p.id === selId);
                      setDelegationForm((prev) => ({
                        ...prev,
                        propertyId: selId,
                        propertyName: selProp?.name || prev.propertyName,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {propertiesList.length === 0 && <option value="">No properties registered</option>}
                  </select>
                </div>

                {/* 2. Management Model / Entity Type */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Management Model / Entity Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={delegationForm.managerType}
                    onChange={(e) => setDelegationForm({ ...delegationForm, managerType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="pm_company">Third-Party Property Management Company (Colliers / CBRE / JLL / Cushman / Local PM)</option>
                    <option value="facility_mgmt">Facilities Management Firm (Sodexo / BVG / ISS / In-house Facility Lead)</option>
                    <option value="msp">Managed Space Provider / Coworking Operator</option>
                    <option value="individual_manager">Designated Property Manager / Operations Lead</option>
                  </select>
                </div>

                {/* 3. Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Assignee / Manager / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Knight Frank PM Services"
                      value={delegationForm.managerName}
                      onChange={(e) => setDelegationForm({ ...delegationForm, managerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Manager Work Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="operations@pmcompany.com"
                      value={delegationForm.managerEmail}
                      onChange={(e) => setDelegationForm({ ...delegationForm, managerEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Phone Number <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98450 11223"
                      value={delegationForm.managerPhone}
                      onChange={(e) => setDelegationForm({ ...delegationForm, managerPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>

                {/* 4. Role Authorization Level */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-700 block mb-2">Role Authorization Level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        delegationForm.managerUserRole === "property_manager"
                          ? "bg-teal-50 border-[#0F8B7D]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="managerUserRole"
                        value="property_manager"
                        checked={delegationForm.managerUserRole === "property_manager"}
                        onChange={() => setDelegationForm({ ...delegationForm, managerUserRole: "property_manager" })}
                        className="mt-0.5 accent-[#0F8B7D]"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Property Operations Lead</span>
                        <span className="text-[11px] text-slate-500">Day-to-day operations, maintenance logging, tenant service requests.</span>
                      </div>
                    </label>
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        delegationForm.managerUserRole === "org_admin"
                          ? "bg-teal-50 border-[#0F8B7D]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="managerUserRole"
                        value="org_admin"
                        checked={delegationForm.managerUserRole === "org_admin"}
                        onChange={() => setDelegationForm({ ...delegationForm, managerUserRole: "org_admin" })}
                        className="mt-0.5 accent-[#0F8B7D]"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Asset Executive / Co-Admin</span>
                        <span className="text-[11px] text-slate-500">Full commercial authority across billing, contracts, and audit runs.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 5. Granular Permissions */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-700 block mb-2">Operational Permissions &amp; Delegation Guardrails</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={delegationForm.managerRights.billingRuns}
                        onChange={(e) =>
                          setDelegationForm({
                            ...delegationForm,
                            managerRights: { ...delegationForm.managerRights, billingRuns: e.target.checked },
                          })
                        }
                        className="rounded accent-[#0F8B7D]"
                      />
                      <span className="text-slate-800 font-medium">Generate Monthly Invoices &amp; Billing Runs</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={delegationForm.managerRights.contractExecution}
                        onChange={(e) =>
                          setDelegationForm({
                            ...delegationForm,
                            managerRights: { ...delegationForm.managerRights, contractExecution: e.target.checked },
                          })
                        }
                        className="rounded accent-[#0F8B7D]"
                      />
                      <span className="text-slate-800 font-medium">Execute &amp; Modify Lease Agreements</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={delegationForm.managerRights.concessions}
                        onChange={(e) =>
                          setDelegationForm({
                            ...delegationForm,
                            managerRights: { ...delegationForm.managerRights, concessions: e.target.checked },
                          })
                        }
                        className="rounded accent-[#0F8B7D]"
                      />
                      <span className="text-slate-800 font-medium">Grant Rent Concessions / Waivers</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={delegationForm.managerRights.depositRefunds}
                        onChange={(e) =>
                          setDelegationForm({
                            ...delegationForm,
                            managerRights: { ...delegationForm.managerRights, depositRefunds: e.target.checked },
                          })
                        }
                        className="rounded accent-[#0F8B7D]"
                      />
                      <span className="text-slate-800 font-medium">Approve Security Deposit Refunds</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("contract")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Lease Contract
                </button>

                <div className="flex items-center gap-2">
                  {!isOwnerSubscribed && !checkIsOwnerSubscribed() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriptionGateReason("Assign Property Management to External Agency");
                        setSubscriptionGateModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Subscribe to Assign Management</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={13} />
                      <span>Assign Management &amp; Generate Link</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSuccess?.();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Finish &amp; Complete Setup ✓</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ──── AGREEMENT VARIANCE REVIEW MODAL (POPUP) ──── */}
        <AgreementVarianceModal
          isOpen={varianceModalOpen}
          onClose={() => setVarianceModalOpen(false)}
          fileName={pendingAgreementFile}
          differences={agreementDifferences}
          onKeepCurrent={() => {
            setVarianceModalOpen(false);
            showToast("Kept user-entered details unchanged without modifying form.");
          }}
          onApplyAgreement={() => {
            setVarianceModalOpen(false);
            if (pendingAgreementData) {
              applyAgreementTerms(pendingAgreementData, agreementDifferences);
            }
          }}
        />

        {/* ──── BULK EXCEL IMPORTER MODAL ──── */}
        <RentRollExcelImporterModal
          isOpen={excelImporterOpen}
          onClose={() => setExcelImporterOpen(false)}
          onSuccess={() => {
            setExcelImporterOpen(false);
            showToast("✓ Excel portfolio data imported successfully!");
            onSuccess?.();
          }}
        />

        {/* ──── FLOOR DE-REGISTRATION & REMOVAL REQUEST MODAL (§5) ──── */}
        {deRegModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Request Floor De-Registration</h3>
                    <p className="text-[11px] text-slate-500">Sell or remove floors from registered property</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeRegModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-700 shrink-0" />
                  <span>Institutional Maker-Checker Governance</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Because commercial leases and financial stacking plans depend on registered floor assets, removing or selling floors requires Administrative Verification. A notification will be dispatched to the Admin Portal for approval.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Floor to De-Register / Sell</label>
                  <select
                    value={deRegFloor}
                    onChange={(e) => setDeRegFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                  >
                    <option value="">-- Choose Floor --</option>
                    {allFloorNumbers.map((fl) => (
                      <option key={fl} value={String(fl)}>
                        {fl === 0 ? "Ground Floor" : `Floor ${fl}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Removal / Transaction Details</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sold Floor 3 to third-party investor / Title deed transferred / Change of commercial asset layout..."
                    value={deRegReason}
                    onChange={(e) => setDeRegReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!deRegFloor || !deRegReason.trim() || deRegLoading}
                  onClick={async () => {
                    setDeRegLoading(true);
                    try {
                      const res = await fetch("/api/admin/change-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          property_id: propForm.existingPropId || activePropertyObj?.id || "OX-PROP",
                          property_name: propForm.propertyName || activePropertyObj?.name || "Commercial Tower",
                          request_type: "sell_floors",
                          floors_to_remove: [deRegFloor],
                          description: deRegReason.trim(),
                        }),
                      });
                      if (res.ok) {
                        showToast("✓ Floor de-registration request submitted to Admin for approval!");
                        setDeRegModalOpen(false);
                        setDeRegReason("");
                        setDeRegFloor("");
                      } else {
                        showToast("Failed to submit change request. Please try again.", "error");
                      }
                    } catch (err) {
                      showToast("Network error submitting change request.", "error");
                    } finally {
                      setDeRegLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {deRegLoading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                  <span>Submit for Admin Approval</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──── SUBSCRIPTION REQUIRED MODAL (§20 & Portfolio Area Floor Rule) ──── */}
        {subscriptionGateModalOpen && (() => {
          const effectivePortfolioSqft = Math.max(totalPortfolioSqft, 1000);
          const currentChosenSqft = Math.max(subscribeSqftInput > 0 ? subscribeSqftInput : effectivePortfolioSqft, effectivePortfolioSqft);
          const isBelowPortfolio = currentChosenSqft < totalPortfolioSqft;
          const ratePerSqft = subscribeBillingCycle === "annual" ? 1.2 : 1.5;
          const minMonthlyPayable = Math.round(effectivePortfolioSqft * ratePerSqft);
          const minCyclePayable = minMonthlyPayable * (subscribeBillingCycle === "annual" ? 12 : 1);
          const monthlyEst = Math.round(currentChosenSqft * ratePerSqft);
          const chosenCyclePayable = monthlyEst * (subscribeBillingCycle === "annual" ? 12 : 1);

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center my-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mx-auto shadow-xs">
                  <Lock size={26} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-slate-900">Commercial Pro Subscription Required</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {subscriptionGateReason || "This action requires an active Commercial Pro Subscription."}
                  </p>
                </div>

                {/* ──── HIGH-VISIBILITY MINIMUM AMOUNT PAYABLE CARD ──── */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 to-emerald-50/90 border-2 border-[#0F8B7D] text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                    <div className="flex items-center gap-1.5 text-[#0F8B7D] font-black text-xs uppercase tracking-wider">
                      <Building2 size={15} />
                      <span>Minimum Payable (Based on Added Sq.Ft)</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-700 text-white uppercase tracking-wider">
                      Scale Floor
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Added Property Area</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {effectivePortfolioSqft.toLocaleString()} Sq.Ft
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Billing Rate</span>
                      <span className="text-sm font-black text-teal-800 font-mono">
                        ₹{ratePerSqft} / sqft / mo
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-teal-300 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Minimum Monthly Equivalent:</span>
                      <span className="font-black text-slate-900 font-mono text-sm">
                        ₹{minMonthlyPayable.toLocaleString("en-IN")} / mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                      <span className="font-black text-teal-950">
                        Minimum Total Payable ({subscribeBillingCycle === "annual" ? "Annual - 12 Months" : "Monthly - 1 Month"}):
                      </span>
                      <span className="font-black text-[#0F8B7D] font-mono text-base">
                        ₹{minCyclePayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      Calculation: {effectivePortfolioSqft.toLocaleString()} Sq.Ft × ₹{ratePerSqft}/sq.ft {subscribeBillingCycle === "annual" ? "× 12 months (20% annual discount applied)" : "× 1 month"}
                    </p>
                  </div>
                </div>

                {/* Interactive Sq.Ft Capacity Selection */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-left space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block">
                      Choose Subscription Capacity (Sq.Ft) *
                    </label>
                    <span className="text-[10px] font-bold text-teal-700">
                      Min: {effectivePortfolioSqft.toLocaleString()} Sq.Ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={effectivePortfolioSqft}
                      step={1000}
                      value={currentChosenSqft}
                      onChange={(e) => setSubscribeSqftInput(Number(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm outline-none ${
                        isBelowPortfolio
                          ? "border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-600"
                          : "border-slate-300 focus:border-[#0F8B7D] text-slate-900"
                      }`}
                      placeholder={`Min ${effectivePortfolioSqft.toLocaleString()}`}
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">
                      Sq.Ft
                    </span>
                  </div>

                  {isBelowPortfolio && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <span>⚠️ You cannot subscribe below your total added property area ({effectivePortfolioSqft.toLocaleString()} Sq.Ft).</span>
                    </p>
                  )}

                  {/* Billing Cycle Selector */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSubscribeBillingCycle("annual")}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        subscribeBillingCycle === "annual"
                          ? "border-[#0F8B7D] bg-teal-50/50 ring-1 ring-teal-500"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                        <span>Annual Plan</span>
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Save 20%</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">₹1.2 / sqft / mo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubscribeBillingCycle("monthly")}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        subscribeBillingCycle === "monthly"
                          ? "border-[#0F8B7D] bg-teal-50/50 ring-1 ring-teal-500"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">Monthly Plan</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">₹1.5 / sqft / mo</div>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Total for Selected Capacity:</span>
                    <span className="font-black text-slate-900 font-mono text-sm">
                      ₹{chosenCyclePayable.toLocaleString("en-IN")} {subscribeBillingCycle === "annual" ? "for 1 Year" : "for 1 Month"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSubscriptionGateModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    disabled={isBelowPortfolio || subscribeLoading}
                    onClick={async () => {
                      setSubscribeLoading(true);
                      try {
                        const email =
                          (typeof window !== "undefined" &&
                            (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email"))) ||
                          "owner@commercial.com";

                        await fetch("/api/subscription/status", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email,
                            plan: "pro",
                            plan_name: "Rent Roll & Financial Pro Suite",
                            billing_cycle: subscribeBillingCycle,
                            duration_months: subscribeBillingCycle === "annual" ? 12 : 1,
                            amount: chosenCyclePayable,
                          }),
                        }).catch(() => {});

                        if (typeof window !== "undefined") {
                          localStorage.setItem("officex_subscription", "active");
                          localStorage.setItem("officex_owner_subscribed", "true");
                          localStorage.setItem("officex_rentroll_subscribed", "true");
                          localStorage.setItem("officex_subscription_status", "active");
                          localStorage.setItem("officex_subscribed_sqft", String(currentChosenSqft));
                        }
                        setIsOwnerSubscribed(true);
                        setSubscribedCapacity(currentChosenSqft);
                        setSubscriptionGateModalOpen(false);
                        showToast(`✓ Subscribed successfully! Paid ₹${chosenCyclePayable.toLocaleString("en-IN")} (Min ₹${minCyclePayable.toLocaleString("en-IN")} on ${effectivePortfolioSqft.toLocaleString()} Sq.Ft). Pro features unlocked.`);
                      } catch {
                        showToast("Subscription activation encountered an issue", "error");
                      } finally {
                        setSubscribeLoading(false);
                      }
                    }}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {subscribeLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>Pay Minimum ₹{chosenCyclePayable.toLocaleString("en-IN")} ({currentChosenSqft.toLocaleString()} Sq.Ft) →</span>
                  </button>
                </div>

                <div className="pt-1 text-center">
                  <a
                    href={`/pricing?min_sqft=${totalPortfolioSqft}`}
                    onClick={() => setSubscriptionGateModalOpen(false)}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                  >
                    Need enterprise procurement or multi-asset pilot? View Pricing &amp; Custom Proposals →
                  </a>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

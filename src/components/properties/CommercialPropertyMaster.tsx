"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  HelpCircle,
  Briefcase,
  Sliders,
  Check,
  Building,
  KeyRound,
  Users,
  Edit3,
  UploadCloud,
  X,
  FileUp,
  ExternalLink,
  Receipt,
  Info,
  Calendar,
  Globe,
  Lock,
  Flame,
  Clock,
  CheckCircle,
  Eye,
  Download,
  FileSpreadsheet,
  Copy,
  MessageSquare,
  Share2,
  RefreshCw,
  CheckSquare
} from "lucide-react";
import {
  AddressAutocomplete,
  CityAutocomplete,
  StateAutocomplete
} from "@/components/ui/LocationInputs";
import { BulkImportSpaceModal } from "./BulkImportSpaceModal";

// ═══════════════════════════════════════════════════════════════════════════
// COMMERCIAL PROPERTY, BUILDING & SPACE MASTER
// Canonical data model for institutional commercial real estate
// ═══════════════════════════════════════════════════════════════════════════

interface TowerBuilding {
  id: string;
  name: string;
  code: string;
  floorsAbove: number;
  floorsBelow: number;
  chargeableArea: number;
}

interface LeasableSpaceUnit {
  id: string;
  spaceCode: string;
  suiteNumber: string;
  buildingCode: string;
  floorNumber: number;
  spaceType: "office" | "retail" | "food_court" | "storage" | "parking_block" | "terrace" | "antenna_site" | "flex_floor" | "cabin" | "meeting_room" | "other";
  chargeableArea: number;
  carpetArea: number;
  askingRate: number;
  seatCapacity?: number;
  fitoutCondition: "bare_shell" | "warm_shell" | "fully_fitted" | "plug_and_play";
  status: "vacant" | "occupied" | "reserved" | "under_fitout" | "not_leasable";
  tenantName?: string;
  contractedRentPsf?: number;
  camRatePsf?: number;
  leaseStartDate?: string;
  leaseExpiryDate?: string;
  escalationPct?: number;
  escalationFrequencyYears?: number;
  securityDepositMonths?: number;
  // Dynamic Fitout Inclusions (Item 9)
  workstationCount?: number;
  privateCabins?: number;
  meetingRooms?: number;
  pantryType?: "wet" | "dry" | "none";
  hasReception?: boolean;
  hasServerRoom?: boolean;
  hvacType?: string;
  // Bare shell specific
  clearHeightFt?: number;
  flooringStatus?: string;
  sanctionedPowerKva?: number;
  dgBackup100Pct?: boolean;
  ahuRoomProvided?: boolean;
  // Warehouse specific
  dockDoorsCount?: number;
  floorLoadingCapacityTons?: number;
  clearHeightToEavesMeters?: number;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  category?: string;
}

interface BillingSpvOption {
  id: string;
  spvName: string;
  gstin: string;
  state: string;
}

export default function CommercialPropertyMaster() {
  const router = useRouter();

  // Step 1: Asset & Legal Master (Identity, Entity Constitution, CIN/PAN & Towers)
  // Step 2: Area & Space Inventory (Chargeable vs Carpet & Units)
  // Step 3: Statutory Clearances & Final Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successProperty, setSuccessProperty] = useState<any | null>(null);

  // ──── 1. ASSET MASTER (Property Entity - Standard Model) ────
  const [assetName, setAssetName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyType, setPropertyType] = useState<string>("office");
  const [grade, setGrade] = useState<"A+" | "A" | "B+" | "B" | "C">("A");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [microMarket, setMicroMarket] = useState("");
  const [pincode, setPincode] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [areaUnit, setAreaUnit] = useState<"sqft" | "sqm">("sqft");
  const [geoLat, setGeoLat] = useState<string>("");
  const [geoLng, setGeoLng] = useState<string>("");
  const [operationalStatus, setOperationalStatus] = useState<"operational" | "under_fitout" | "under_construction" | "under_refurbishment" | "disposed">("operational");

  // ──── STATUTORY CONSTITUTION & TAX IDENTIFIERS ────
  const [entityType, setEntityType] = useState<
    "pvt_ltd" | "public_ltd" | "llp" | "proprietorship" | "partnership" | "individual" | "trust_reit"
  >("pvt_ltd");
  const [cinNumber, setCinNumber] = useState<string>("");
  const [llpinNumber, setLlpinNumber] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const [propertyGstin, setPropertyGstin] = useState<string>("");
  const [gstExempted, setGstExempted] = useState<boolean>(false);
  const [hasMultipleTowers, setHasMultipleTowers] = useState<boolean>(false);

  // SPV / Billing Entity Link (default billing entity)
  const [spvs, setSpvs] = useState<BillingSpvOption[]>([]);
  const [selectedSpvId, setSelectedSpvId] = useState<string>("");
  const [customSpvName, setCustomSpvName] = useState("");
  const [customSpvGstin, setCustomSpvGstin] = useState("");

  // Auto-generate asset code when name changes if code untouched
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const handleNameChange = (name: string) => {
    setAssetName(name);
    if (!codeManuallyEdited) {
      const generated = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .split(/\s+/)
        .slice(0, 3)
        .map(w => w.slice(0, 3))
        .join("-");
      setPropertyCode(generated ? `${generated}-01` : "");
    }
  };

  // ──── BUILDING & TOWERS MASTER (Embedded Inline in Step 1) ────
  const [towers, setTowers] = useState<TowerBuilding[]>([]);

  const handleAddTower = () => {
    const nextIdx = towers.length + 1;
    const newTower: TowerBuilding = {
      id: `T${nextIdx}`,
      name: `Tower ${nextIdx}`,
      code: `T${nextIdx}`,
      floorsAbove: 1,
      floorsBelow: 0,
      chargeableArea: 0
    };
    setTowers([...towers, newTower]);
  };

  const handleRemoveTower = (id: string) => {
    if (towers.length <= 1) {
      alert("A commercial property must have at least one building / tower.");
      return;
    }
    setTowers(towers.filter(t => t.id !== id));
  };

  // Robust CIN validation: accepts standard 21-character MCA CINs, 20-character legacy CINs, FCRN, LLPIN, and valid Indian company codes
  const isCinValid = (raw: string): boolean => {
    const c = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!c) return false;
    // 1. Standard 21-character MCA CIN (e.g. U70102MH2018PTC123456 or L17110MH1973PLC019786)
    if (/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(c)) return true;
    // 2. Any 20-22 character alphanumeric starting with a letter
    if (c.length >= 20 && c.length <= 22 && /^[A-Z][0-9A-Z]{19,21}$/.test(c)) return true;
    // 3. Foreign Company Registration Number (FCRN): starts with F + alphanumeric
    if (/^F[0-9A-Z]{4,10}$/.test(c)) return true;
    // 4. LLPIN (e.g. AAA-1234 or AAB5678, 6-9 alphanumeric chars)
    if (/^[A-Z0-9]{6,9}$/.test(c)) return true;
    // 5. General lenient fallback for corporate codes
    if (c.length >= 8 && c.length <= 25 && /^[A-Z0-9]+$/.test(c)) return true;
    return false;
  };

  // ──── STEP 1 VALIDATION & ADVANCE TO STEP 2 ────
  const handleStep1Next = () => {
    if (!assetName.trim()) {
      alert("Commercial Asset / Property Name is required.");
      return;
    }
    if (!address.trim() || !city.trim() || !state.trim()) {
      alert("Complete registered property address, City, and State are mandatory for GST Place of Supply.");
      return;
    }

    // Strict Statutory Identification Validation based on Entity Constitution
    // 1. CIN / LLPIN Validation
    if (entityType === "pvt_ltd" || entityType === "public_ltd") {
      const cleanCin = cinNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!cleanCin) {
        alert("Corporate Identification Number (CIN) is compulsory for Private Limited and Public Limited companies. Please provide a valid MCA CIN.");
        return;
      }
      if (!isCinValid(cleanCin)) {
        alert(`Invalid Corporate Identification Number "${cinNumber}". Please provide a valid 21-digit MCA CIN (or registration code).`);
        return;
      }
    } else if (entityType === "llp") {
      const cleanLlpin = llpinNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!cleanLlpin) {
        alert("LLPIN (Limited Liability Partnership Identification Number) is compulsory for LLPs. Please provide the 7-character LLPIN (e.g. AAA-1234).");
        return;
      }
    }

    // 2. PAN Validation (Compulsory for ALL entities under Section 194I)
    const cleanPan = panNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!cleanPan) {
      alert("Income Tax PAN is compulsory for all commercial property landlords under Section 194-I of the Income Tax Act.");
      return;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      alert(`Invalid Income Tax PAN "${panNumber}". Income Tax PAN must be a valid 10-character code (e.g. ABCDE1234F).`);
      return;
    }

    // 3. GSTIN Validation (Compulsory for corporate entities unless exempted; optional for sole proprietors & individuals)
    const cleanGst = propertyGstin.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isCorporate = entityType === "pvt_ltd" || entityType === "public_ltd" || entityType === "llp" || entityType === "trust_reit";
    if (isCorporate && !gstExempted) {
      if (!cleanGst) {
        alert(`15-digit GSTIN is compulsory for ${entityType === "llp" ? "LLPs" : "incorporated companies"} leasing commercial real estate. If turnover is under threshold, mark as GST Exempt.`);
        return;
      }
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        alert(`Invalid GSTIN "${propertyGstin}". GSTIN must be 15 characters (e.g. 27ABCDE1234F1Z5).`);
        return;
      }
      if (!cleanGst.includes(cleanPan)) {
        const proceed = window.confirm(`Notice: Under Indian GST rules, characters 3 to 12 of GSTIN usually match the entity's 10-digit PAN.\n\nYour GSTIN is: "${cleanGst}"\nYour PAN is: "${cleanPan}"\n\nClick OK if you want to proceed with this GSTIN, or Cancel to correct.`);
        if (!proceed) return;
      }
    } else if (!gstExempted && cleanGst) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        alert(`Invalid GSTIN "${propertyGstin}". GSTIN must be 15 characters (e.g. 27ABCDE1234F1Z5), or leave blank if unregistered.`);
        return;
      }
      if (!cleanGst.includes(cleanPan)) {
        alert(`GSTIN "${cleanGst}" does not match Income Tax PAN "${cleanPan}".`);
        return;
      }
    }

    // Towers configuration:
    if (hasMultipleTowers) {
      if (towers.length === 0) {
        setTowers([
          { id: "T1", name: `${assetName.trim() || "Tower 1"} (Tower A)`, code: "T1", floorsAbove: 1, floorsBelow: 0, chargeableArea: 0 },
          { id: "T2", name: "Tower 2 (Tower B)", code: "T2", floorsAbove: 1, floorsBelow: 0, chargeableArea: 0 }
        ]);
      } else {
        const invalid = towers.find(t => !t.name.trim() || !t.code.trim());
        if (invalid) {
          alert("Please ensure all configured towers have a valid name and code.");
          return;
        }
      }
    } else {
      setTowers([{
        id: "T1",
        name: assetName ? `${assetName.trim()} (Main Building)` : "Main Building",
        code: "T1",
        floorsAbove: 1,
        floorsBelow: 0,
        chargeableArea: totalChargeableArea || 0
      }]);
    }

    setCurrentStep(2);
  };

  // ──── 3. LEASABLE SPACE & INVENTORY (Space Master) ────
  const [totalChargeableArea, setTotalChargeableArea] = useState<number>(0);
  const [totalCarpetArea, setTotalCarpetArea] = useState<number>(0);
  const [targetRentPsf, setTargetRentPsf] = useState<number>(0);
  const [standardCamPsf, setStandardCamPsf] = useState<number>(0);
  const [defaultEscalation, setDefaultEscalation] = useState<string>("15_every_36");
  const [defaultSecurityDepositMonths, setDefaultSecurityDepositMonths] = useState<number>(6);

  // Property overall building specifications (Provided first by property owner)
  const [totalFloorsCount, setTotalFloorsCount] = useState<number>(towers[0]?.floorsAbove || 5);
  const [basementsCount, setBasementsCount] = useState<number>(towers[0]?.floorsBelow || 1);
  const [buildingFitoutCondition, setBuildingFitoutCondition] = useState<"furnished" | "bare_shell" | "warm_shell" | "plug_and_play" | "semi_furnished">("warm_shell");
  const [clearHeightFt, setClearHeightFt] = useState<number>(11);
  const [dgBackupPct, setDgBackupPct] = useState<number>(100);
  const [sanctionedPowerKva, setSanctionedPowerKva] = useState<number>(150);
  const [hvacSystemType, setHvacSystemType] = useState<string>("VRV/VRF Central Air Conditioning");
  const [parkingSlotsCount, setParkingSlotsCount] = useState<number>(25);

  // Lease Scope Mode: "whole_tower" or "specific_floors"
  const [leaseScopeMode, setLeaseScopeMode] = useState<"whole_tower" | "specific_floors">("whole_tower");
  const [wholeTowerStatus, setWholeTowerStatus] = useState<"vacant" | "occupied">("vacant");
  const [wholeTowerTenantName, setWholeTowerTenantName] = useState<string>("");
  const [wholeTowerRentPsf, setWholeTowerRentPsf] = useState<number>(0);

  // Area unit label helper
  const areaLabel = areaUnit === "sqm" ? "sq. m." : "sq. ft.";

  // Initial unit breakdown starts completely empty (no mock data)
  const [units, setUnits] = useState<LeasableSpaceUnit[]>([]);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Document uploads for compliance & legal records
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const [newUnit, setNewUnit] = useState<Partial<LeasableSpaceUnit>>({
    suiteNumber: "",
    buildingCode: towers[0]?.code || "",
    floorNumber: 1,
    spaceType: "office",
    chargeableArea: 0,
    carpetArea: 0,
    askingRate: 0,
    seatCapacity: 0,
    fitoutCondition: "warm_shell",
    status: "vacant",
    tenantName: "",
    contractedRentPsf: 0,
    camRatePsf: 0,
    leaseStartDate: "",
    leaseExpiryDate: "",
    escalationPct: 15,
    escalationFrequencyYears: 3,
    securityDepositMonths: 6,
    // Fitout inclusions
    workstationCount: 0,
    privateCabins: 0,
    meetingRooms: 0,
    pantryType: "dry",
    hasReception: false,
    hasServerRoom: false,
    hvacType: "VRV/VRF",
    clearHeightFt: 11,
    flooringStatus: "Bare Concrete Slab",
    sanctionedPowerKva: 25,
    dgBackup100Pct: true,
    ahuRoomProvided: false,
    dockDoorsCount: 0,
    floorLoadingCapacityTons: 5,
    clearHeightToEavesMeters: 10
  });

  // Tenant Invite Sharing in Success Modal
  const [selectedShareUnits, setSelectedShareUnits] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleEditUnit = (unit: LeasableSpaceUnit) => {
    setEditingUnitId(unit.id);
    setNewUnit({
      suiteNumber: unit.suiteNumber,
      buildingCode: unit.buildingCode,
      floorNumber: unit.floorNumber,
      spaceType: unit.spaceType,
      chargeableArea: unit.chargeableArea,
      carpetArea: unit.carpetArea,
      askingRate: unit.askingRate,
      seatCapacity: unit.seatCapacity || 0,
      fitoutCondition: unit.fitoutCondition,
      status: unit.status,
      tenantName: unit.tenantName || "",
      contractedRentPsf: unit.contractedRentPsf || unit.askingRate || 0,
      camRatePsf: unit.camRatePsf || standardCamPsf || 0,
      leaseStartDate: unit.leaseStartDate || "",
      leaseExpiryDate: unit.leaseExpiryDate || "",
      escalationPct: unit.escalationPct || 15,
      escalationFrequencyYears: unit.escalationFrequencyYears || 3,
      securityDepositMonths: unit.securityDepositMonths || 6,
      workstationCount: unit.workstationCount || 0,
      privateCabins: unit.privateCabins || 0,
      meetingRooms: unit.meetingRooms || 0,
      pantryType: unit.pantryType || "dry",
      hasReception: unit.hasReception || false,
      hasServerRoom: unit.hasServerRoom || false,
      hvacType: unit.hvacType || "VRV/VRF",
      clearHeightFt: unit.clearHeightFt || 11,
      flooringStatus: unit.flooringStatus || "Bare Concrete Slab",
      sanctionedPowerKva: unit.sanctionedPowerKva || 25,
      dgBackup100Pct: unit.dgBackup100Pct !== undefined ? unit.dgBackup100Pct : true,
      ahuRoomProvided: unit.ahuRoomProvided || false,
      dockDoorsCount: unit.dockDoorsCount || 0,
      floorLoadingCapacityTons: unit.floorLoadingCapacityTons || 5,
      clearHeightToEavesMeters: unit.clearHeightToEavesMeters || 10
    });
  };

  const handleCancelEdit = () => {
    setEditingUnitId(null);
    setNewUnit({
      suiteNumber: "",
      buildingCode: towers[0]?.code || "T1",
      floorNumber: units.length + 1,
      spaceType: "office",
      chargeableArea: 0,
      carpetArea: 0,
      askingRate: targetRentPsf || 0,
      seatCapacity: 0,
      fitoutCondition: "warm_shell",
      status: "vacant",
      tenantName: "",
      contractedRentPsf: targetRentPsf || 0,
      camRatePsf: standardCamPsf || 0,
      leaseStartDate: "",
      leaseExpiryDate: "",
      escalationPct: 15,
      escalationFrequencyYears: 3,
      securityDepositMonths: 6,
      workstationCount: 0,
      privateCabins: 0,
      meetingRooms: 0,
      pantryType: "dry",
      hasReception: false,
      hasServerRoom: false,
      hvacType: "VRV/VRF",
      clearHeightFt: 11,
      flooringStatus: "Bare Concrete Slab",
      sanctionedPowerKva: 25,
      dgBackup100Pct: true,
      ahuRoomProvided: false,
      dockDoorsCount: 0,
      floorLoadingCapacityTons: 5,
      clearHeightToEavesMeters: 10
    });
  };

  const handleAddUnit = () => {
    if (!newUnit.suiteNumber || !newUnit.suiteNumber.trim()) {
      alert("Please specify the Suite / Floor unit identifier (e.g. Suite 101 or Floor 2).");
      return;
    }
    const unitArea = Number(newUnit.chargeableArea) || 0;
    if (unitArea <= 0) {
      alert(`Please enter the leasable area (${areaLabel}) for this unit.`);
      return;
    }

    const bldgCode = newUnit.buildingCode || towers[0]?.code || "T1";
    const floorNum = Number(newUnit.floorNumber) || 1;

    if (editingUnitId) {
      const updated = units.map(u => {
        if (u.id === editingUnitId) {
          return {
            ...u,
            suiteNumber: newUnit.suiteNumber!.trim(),
            buildingCode: bldgCode,
            floorNumber: floorNum,
            spaceType: (newUnit.spaceType as any) || "office",
            chargeableArea: unitArea,
            carpetArea: Number(newUnit.carpetArea) || 0,
            askingRate: Number(newUnit.askingRate) || Number(newUnit.contractedRentPsf) || targetRentPsf || 0,
            seatCapacity: Number(newUnit.seatCapacity) || 0,
            fitoutCondition: (newUnit.fitoutCondition as any) || "warm_shell",
            status: (newUnit.status as any) || "vacant",
            tenantName: newUnit.tenantName?.trim() || undefined,
            contractedRentPsf: Number(newUnit.contractedRentPsf) || Number(newUnit.askingRate) || 0,
            camRatePsf: Number(newUnit.camRatePsf) || standardCamPsf || 0,
            leaseStartDate: newUnit.leaseStartDate || undefined,
            leaseExpiryDate: newUnit.leaseExpiryDate || undefined,
            escalationPct: Number(newUnit.escalationPct) || 15,
            escalationFrequencyYears: Number(newUnit.escalationFrequencyYears) || 3,
            securityDepositMonths: Number(newUnit.securityDepositMonths) || 6,
            workstationCount: Number(newUnit.workstationCount) || 0,
            privateCabins: Number(newUnit.privateCabins) || 0,
            meetingRooms: Number(newUnit.meetingRooms) || 0,
            pantryType: newUnit.pantryType || "dry",
            hasReception: Boolean(newUnit.hasReception),
            hasServerRoom: Boolean(newUnit.hasServerRoom),
            hvacType: newUnit.hvacType || "VRV/VRF",
            clearHeightFt: Number(newUnit.clearHeightFt) || 11,
            flooringStatus: newUnit.flooringStatus || "Bare Concrete Slab",
            sanctionedPowerKva: Number(newUnit.sanctionedPowerKva) || 25,
            dgBackup100Pct: newUnit.dgBackup100Pct !== undefined ? newUnit.dgBackup100Pct : true,
            ahuRoomProvided: Boolean(newUnit.ahuRoomProvided),
            dockDoorsCount: Number(newUnit.dockDoorsCount) || 0,
            floorLoadingCapacityTons: Number(newUnit.floorLoadingCapacityTons) || 5,
            clearHeightToEavesMeters: Number(newUnit.clearHeightToEavesMeters) || 10
          };
        }
        return u;
      });
      setUnits(updated);
      setEditingUnitId(null);
      const sumUnitsArea = updated.reduce((acc, u) => acc + u.chargeableArea, 0);
      const sumCarpetArea = updated.reduce((acc, u) => acc + u.carpetArea, 0);
      if (sumUnitsArea > 0) setTotalChargeableArea(sumUnitsArea);
      if (sumCarpetArea > 0) setTotalCarpetArea(sumCarpetArea);
      setNewUnit({
        suiteNumber: "",
        buildingCode: bldgCode,
        floorNumber: floorNum + 1,
        spaceType: "office",
        chargeableArea: 0,
        carpetArea: 0,
        askingRate: targetRentPsf || 0,
        seatCapacity: 0,
        fitoutCondition: "warm_shell",
        status: "vacant",
        tenantName: "",
        contractedRentPsf: targetRentPsf || 0,
        camRatePsf: standardCamPsf || 0,
        leaseStartDate: "",
        leaseExpiryDate: "",
        escalationPct: 15,
        escalationFrequencyYears: 3,
        securityDepositMonths: 6,
        workstationCount: 0,
        privateCabins: 0,
        meetingRooms: 0,
        pantryType: "dry",
        hasReception: false,
        hasServerRoom: false,
        hvacType: "VRV/VRF",
        clearHeightFt: 11,
        flooringStatus: "Bare Concrete Slab",
        sanctionedPowerKva: 25,
        dgBackup100Pct: true,
        ahuRoomProvided: false,
        dockDoorsCount: 0,
        floorLoadingCapacityTons: 5,
        clearHeightToEavesMeters: 10
      });
      return;
    }

    // Auto-generate space code: PROPCODE-BLDGCODE-FLOOR-SEQ (e.g. OBKC-T1-03-01)
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";
    const spaceCode = `${propPrefix}-${bldgCode}-${String(floorNum).padStart(2, "0")}-${String(units.length + 1).padStart(2, "0")}`;

    const created: LeasableSpaceUnit = {
      id: `u-${Date.now()}`,
      spaceCode,
      suiteNumber: newUnit.suiteNumber!.trim(),
      buildingCode: bldgCode,
      floorNumber: floorNum,
      spaceType: (newUnit.spaceType as any) || "office",
      chargeableArea: unitArea,
      carpetArea: Number(newUnit.carpetArea) || 0,
      askingRate: Number(newUnit.askingRate) || Number(newUnit.contractedRentPsf) || targetRentPsf || 0,
      seatCapacity: Number(newUnit.seatCapacity) || 0,
      fitoutCondition: (newUnit.fitoutCondition as any) || "warm_shell",
      status: (newUnit.status as any) || "vacant",
      tenantName: newUnit.tenantName?.trim() || undefined,
      contractedRentPsf: Number(newUnit.contractedRentPsf) || Number(newUnit.askingRate) || 0,
      camRatePsf: Number(newUnit.camRatePsf) || standardCamPsf || 0,
      leaseStartDate: newUnit.leaseStartDate || undefined,
      leaseExpiryDate: newUnit.leaseExpiryDate || undefined,
      escalationPct: Number(newUnit.escalationPct) || 15,
      escalationFrequencyYears: Number(newUnit.escalationFrequencyYears) || 3,
      securityDepositMonths: Number(newUnit.securityDepositMonths) || 6,
      workstationCount: Number(newUnit.workstationCount) || 0,
      privateCabins: Number(newUnit.privateCabins) || 0,
      meetingRooms: Number(newUnit.meetingRooms) || 0,
      pantryType: newUnit.pantryType || "dry",
      hasReception: Boolean(newUnit.hasReception),
      hasServerRoom: Boolean(newUnit.hasServerRoom),
      hvacType: newUnit.hvacType || "VRV/VRF",
      clearHeightFt: Number(newUnit.clearHeightFt) || 11,
      flooringStatus: newUnit.flooringStatus || "Bare Concrete Slab",
      sanctionedPowerKva: Number(newUnit.sanctionedPowerKva) || 25,
      dgBackup100Pct: newUnit.dgBackup100Pct !== undefined ? newUnit.dgBackup100Pct : true,
      ahuRoomProvided: Boolean(newUnit.ahuRoomProvided),
      dockDoorsCount: Number(newUnit.dockDoorsCount) || 0,
      floorLoadingCapacityTons: Number(newUnit.floorLoadingCapacityTons) || 5,
      clearHeightToEavesMeters: Number(newUnit.clearHeightToEavesMeters) || 10
    };

    const nextUnits = [...units, created];
    setUnits(nextUnits);

    // Auto-update totalChargeableArea if not manually typed
    const sumUnitsArea = nextUnits.reduce((acc, u) => acc + u.chargeableArea, 0);
    const sumCarpetArea = nextUnits.reduce((acc, u) => acc + u.carpetArea, 0);
    if (totalChargeableArea === 0 || totalChargeableArea < sumUnitsArea) {
      setTotalChargeableArea(sumUnitsArea);
    }
    if (sumCarpetArea > 0) {
      setTotalCarpetArea(sumCarpetArea);
    }

    // Reset adder form for the next unit
    setNewUnit({
      suiteNumber: "",
      buildingCode: bldgCode,
      floorNumber: floorNum + 1,
      spaceType: "office",
      chargeableArea: 0,
      carpetArea: 0,
      askingRate: targetRentPsf || 0,
      seatCapacity: 0,
      fitoutCondition: "warm_shell",
      status: "vacant",
      tenantName: "",
      contractedRentPsf: targetRentPsf || 0,
      camRatePsf: standardCamPsf || 0,
      leaseStartDate: "",
      leaseExpiryDate: "",
      escalationPct: 15,
      escalationFrequencyYears: 3,
      securityDepositMonths: 6,
      workstationCount: 0,
      privateCabins: 0,
      meetingRooms: 0,
      pantryType: "dry",
      hasReception: false,
      hasServerRoom: false,
      hvacType: "VRV/VRF",
      clearHeightFt: 11,
      flooringStatus: "Bare Concrete Slab",
      sanctionedPowerKva: 25,
      dgBackup100Pct: true,
      ahuRoomProvided: false,
      dockDoorsCount: 0,
      floorLoadingCapacityTons: 5,
    });
  };

  const handleRemoveUnit = (id: string) => {
    const nextUnits = units.filter(u => u.id !== id);
    setUnits(nextUnits);
    if (editingUnitId === id) {
      setEditingUnitId(null);
    }
    const sumChg = nextUnits.reduce((a, b) => a + b.chargeableArea, 0);
    const sumCpt = nextUnits.reduce((a, b) => a + b.carpetArea, 0);
    setTotalChargeableArea(sumChg);
    setTotalCarpetArea(sumCpt);
  };

  const handleCreateSingleBuildingUnit = (forcedStatus?: "vacant" | "occupied", forcedTenant?: string, forcedRent?: number) => {
    setLeaseScopeMode("whole_tower");
    const bldgCode = towers[0]?.code || "T1";
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";
    const area = totalChargeableArea > 0 ? totalChargeableArea : 50000;
    const carpet = totalCarpetArea > 0 && totalCarpetArea <= area ? totalCarpetArea : Math.round(area * 0.75);

    const fitout = buildingFitoutCondition === "furnished" ? "fully_fitted" : buildingFitoutCondition === "semi_furnished" ? "warm_shell" : buildingFitoutCondition;
    const stat = forcedStatus || wholeTowerStatus;
    const tName = forcedTenant !== undefined ? forcedTenant : wholeTowerTenantName;
    const rPsf = forcedRent !== undefined ? forcedRent : (wholeTowerRentPsf || targetRentPsf || 150);

    const fullUnit: LeasableSpaceUnit = {
      id: `u-${Date.now()}`,
      spaceCode: `${propPrefix}-${bldgCode}-ALL-01`,
      suiteNumber: `${assetName ? assetName.trim() : "Main Building"} (Entire Building / All Floors)`,
      buildingCode: bldgCode,
      floorNumber: 1,
      spaceType: "office",
      chargeableArea: area,
      carpetArea: carpet,
      askingRate: targetRentPsf || 150,
      seatCapacity: 0,
      fitoutCondition: fitout as any,
      status: stat,
      tenantName: stat === "occupied" ? (tName || "Single Corporate Occupant") : undefined,
      contractedRentPsf: stat === "occupied" ? rPsf : undefined,
      camRatePsf: standardCamPsf || 0
    };

    setUnits([fullUnit]);
    setTotalChargeableArea(area);
    setTotalCarpetArea(carpet);
  };

  const handleSwitchToSpecificFloors = () => {
    setLeaseScopeMode("specific_floors");
    const isSingleAllUnit = units.length === 1 && (units[0].suiteNumber.includes("Entire") || units[0].suiteNumber.includes("All Floors"));
    if (isSingleAllUnit || units.length === 0) {
      handleGenerateFloors(totalFloorsCount > 0 ? totalFloorsCount : 5);
    }
  };

  const handleGenerateFloors = (floorCount: number) => {
    const bldgCode = towers[0]?.code || "T1";
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";
    const count = floorCount > 0 ? floorCount : 5;
    const perFloorArea = totalChargeableArea > 0 ? Math.round(totalChargeableArea / count) : 10000;
    const perFloorCarpet = Math.round(perFloorArea * 0.75);
    const fitout = buildingFitoutCondition === "furnished" ? "fully_fitted" : buildingFitoutCondition === "semi_furnished" ? "warm_shell" : buildingFitoutCondition;

    const generated: LeasableSpaceUnit[] = [];
    for (let f = 1; f <= count; f++) {
      generated.push({
        id: `u-floor-${f}-${Date.now()}`,
        spaceCode: `${propPrefix}-${bldgCode}-${String(f).padStart(2, "0")}-01`,
        suiteNumber: f === 1 ? "Ground / 1st Floor" : `Floor ${f}`,
        buildingCode: bldgCode,
        floorNumber: f,
        spaceType: "office",
        chargeableArea: perFloorArea,
        carpetArea: perFloorCarpet,
        askingRate: targetRentPsf || 150,
        seatCapacity: 0,
        fitoutCondition: fitout as any,
        status: "vacant"
      });
    }
    setUnits(generated);
    setTotalChargeableArea(perFloorArea * count);
    setTotalCarpetArea(perFloorCarpet * count);
  };

  const handleToggleFloorStatus = (unitId: string, newStatus: "vacant" | "occupied", tenantName?: string) => {
    setUnits(prev => prev.map(u => {
      if (u.id === unitId) {
        return {
          ...u,
          status: newStatus,
          tenantName: newStatus === "occupied" ? (tenantName || u.tenantName || "Corporate Tenant") : undefined,
          contractedRentPsf: newStatus === "occupied" ? (u.contractedRentPsf || u.askingRate || targetRentPsf || 150) : undefined
        };
      }
      return u;
    }));
  };

  const handleUpdateUnitField = (unitId: string, field: keyof LeasableSpaceUnit, value: any) => {
    setUnits(prev => {
      const updated = prev.map(u => u.id === unitId ? { ...u, [field]: value } : u);
      if (field === "chargeableArea" || field === "carpetArea") {
        const sumChg = updated.reduce((a, b) => a + b.chargeableArea, 0);
        const sumCpt = updated.reduce((a, b) => a + b.carpetArea, 0);
        setTotalChargeableArea(sumChg);
        setTotalCarpetArea(sumCpt);
      }
      return updated;
    });
  };

  const handleBulkImportUnits = (importedUnits: LeasableSpaceUnit[]) => {
    if (!importedUnits || importedUnits.length === 0) return;
    const nextUnits = [...units, ...importedUnits];
    setUnits(nextUnits);
    const sumChg = nextUnits.reduce((a, b) => a + b.chargeableArea, 0);
    const sumCpt = nextUnits.reduce((a, b) => a + b.carpetArea, 0);
    setTotalChargeableArea(sumChg);
    setTotalCarpetArea(sumCpt);
    setShowBulkImport(false);
  };

  // ──── 4. STATUTORY CLEARANCES & SYNDICATION (Statutory Clearances) ────
  const [occupancyCertStatus, setOccupancyCertStatus] = useState<"issued" | "in_progress" | "provisional">("issued");
  const [ocSanctionNumber, setOcSanctionNumber] = useState<string>("");
  const [ocValidityDate, setOcValidityDate] = useState<string>("");
  const [fireNocValidUntil, setFireNocValidUntil] = useState<string>("");
  const [sanctionedPlanRef, setSanctionedPlanRef] = useState<string>("");
  const [sanctionedPlanDate, setSanctionedPlanDate] = useState<string>("");
  const [titleDeedRef, setTitleDeedRef] = useState<string>("");
  const [titleDeedDate, setTitleDeedDate] = useState<string>("");
  const [syndicateToMarketplace, setSyndicateToMarketplace] = useState<boolean>(false);
  const [activeDocCategory, setActiveDocCategory] = useState<string>("all");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetCategory?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newDocs: UploadedDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeKb = Math.round(f.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        size: sizeStr,
        type: f.type || "Document",
        uploadedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        category: targetCategory || (activeDocCategory !== "all" ? activeDocCategory : "General Compliance")
      });
    }
    setUploadedDocs(prev => [...prev, ...newDocs]);

    // Automatically set deadline / validity dates if empty based on uploaded document type
    if ((targetCategory === "Fire Department NOC" || targetCategory?.includes("Fire")) && !fireNocValidUntil) {
      handleSetFireNocPreset(1);
    }
    if ((targetCategory === "Occupancy Certificate (OC)" || targetCategory?.includes("Occupancy")) && !ocValidityDate) {
      const now = new Date();
      now.setFullYear(now.getFullYear() + 5);
      setOcValidityDate(now.toISOString().split("T")[0]);
    }
    if ((targetCategory === "Sanctioned Floor Blueprint" || targetCategory?.includes("Blueprint") || targetCategory?.includes("Sanction")) && !sanctionedPlanDate) {
      setSanctionedPlanDate(new Date().toISOString().split("T")[0]);
    }
    if ((targetCategory === "Title & Ownership Deed" || targetCategory?.includes("Title") || targetCategory?.includes("Deed")) && !titleDeedDate) {
      setTitleDeedDate(new Date().toISOString().split("T")[0]);
    }
    e.target.value = "";
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>, targetCategory?: string) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const newDocs: UploadedDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeKb = Math.round(f.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        size: sizeStr,
        type: f.type || "Document",
        uploadedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        category: targetCategory || (activeDocCategory !== "all" ? activeDocCategory : "General Compliance")
      });
    }
    setUploadedDocs(prev => [...prev, ...newDocs]);

    // Automatically set deadline / validity dates if empty based on uploaded document type
    if ((targetCategory === "Fire Department NOC" || targetCategory?.includes("Fire")) && !fireNocValidUntil) {
      handleSetFireNocPreset(1);
    }
    if ((targetCategory === "Occupancy Certificate (OC)" || targetCategory?.includes("Occupancy")) && !ocValidityDate) {
      const now = new Date();
      now.setFullYear(now.getFullYear() + 5);
      setOcValidityDate(now.toISOString().split("T")[0]);
    }
    if ((targetCategory === "Sanctioned Floor Blueprint" || targetCategory?.includes("Blueprint") || targetCategory?.includes("Sanction")) && !sanctionedPlanDate) {
      setSanctionedPlanDate(new Date().toISOString().split("T")[0]);
    }
    if ((targetCategory === "Title & Ownership Deed" || targetCategory?.includes("Title") || targetCategory?.includes("Deed")) && !titleDeedDate) {
      setTitleDeedDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleSetFireNocPreset = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setFireNocValidUntil(`${yyyy}-${mm}-${dd}`);
  };

  const getFireNocStatus = () => {
    if (!fireNocValidUntil) {
      return { label: "Date Pending", status: "pending", color: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    const validDate = new Date(fireNocValidUntil);
    const today = new Date();
    const diffDays = Math.ceil((validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { label: "Clearance Expired", status: "expired", color: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (diffDays < 90) {
      return { label: `Expiring Soon (${diffDays}d)`, status: "warning", color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: "Active CFO Clearance", status: "active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  // Loading Ratio Calculation with invalid negative prevention
  const hasCarpetExceedsSuper = totalChargeableArea > 0 && totalCarpetArea > totalChargeableArea;
  const loadingPct = totalChargeableArea > 0 && totalCarpetArea > 0 && !hasCarpetExceedsSuper
    ? Math.round(((totalChargeableArea - totalCarpetArea) / totalCarpetArea) * 100)
    : 0;

  // Load configured SPVs from onboarding / localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedOnboarding = localStorage.getItem("officex_onboarding_entities");
        if (storedOnboarding) {
          const parsed = JSON.parse(storedOnboarding);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSpvs(parsed);
            setSelectedSpvId(parsed[0].id);
            return;
          }
        }
      } catch {}

      // Check real user organization identity from onboarding / session
      const realOrgName = (
        localStorage.getItem("officex_active_org") ||
        localStorage.getItem("officex_org_name") ||
        localStorage.getItem("officex_user_org") ||
        ""
      ).trim();
      const realOrgGstin = (
        localStorage.getItem("officex_org_gstin") ||
        localStorage.getItem("officex_user_gstin") ||
        ""
      ).trim();

      // Only add to SPV list if it is a real user organization (no dummy fallback)
      if (realOrgName && !realOrgName.toLowerCase().includes("apex commercial")) {
        const userSpv: BillingSpvOption = {
          id: "SPV-PRIMARY",
          spvName: realOrgName,
          gstin: realOrgGstin || "Unregistered",
          state: localStorage.getItem("officex_org_state") || "Maharashtra"
        };
        setSpvs([userSpv]);
        setSelectedSpvId("SPV-PRIMARY");
      } else {
        // Zero dummy pre-feeded data: default to custom empty entry
        setSpvs([]);
        setSelectedSpvId("custom");
      }
    }
  }, []);

  // Sync tower area with total chargeable area
  useEffect(() => {
    const sumTowers = towers.reduce((acc, t) => acc + (t.chargeableArea || 0), 0);
    if (sumTowers > 0 && sumTowers !== totalChargeableArea) {
      setTotalChargeableArea(sumTowers);
    }
  }, [towers]);

  // ──── SUBMIT / REGISTER PROPERTY MASTER ────
  const handleRegisterProperty = async () => {
    if (!assetName.trim()) {
      alert("Property / Asset Name is required.");
      setCurrentStep(1);
      return;
    }
    if (!address.trim() || !city.trim() || !state.trim()) {
      alert("Complete property address, City, and State are mandatory for GST Place of Supply.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const ownerEmail = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "owner@officex.com") : "";
      const ownerUserId = typeof window !== "undefined" ? (localStorage.getItem("officex_user_id") || "") : "";
      const orgId = typeof window !== "undefined" ? (localStorage.getItem("officex_user_org_id") || "00000000-0000-0000-0000-000000000001") : "00000000-0000-0000-0000-000000000001";
      const clientAccountId = typeof window !== "undefined" ? (localStorage.getItem("officex_client_account_id") || "CLI-DEFAULT") : "CLI-DEFAULT";
      const ownerCompany = selectedSpvId === "custom"
        ? customSpvName || assetName
        : spvs.find(s => s.id === selectedSpvId)?.spvName || assetName;

      const payload = {
        name: assetName.trim(),
        propertyCode: propertyCode.trim() || `PROP-${Date.now()}`,
        type: propertyType,
        grade,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        microMarket: microMarket.trim() || city.trim(),
        pincode: pincode.trim() || "400001",
        totalArea: totalChargeableArea || 1000,
        chargeableArea: totalChargeableArea || 1000,
        carpetArea: totalCarpetArea || Math.round((totalChargeableArea || 1000) * 0.75),
        currency,
        operatingCurrency: currency,
        areaUnit,
        geoLat: geoLat.trim(),
        geoLng: geoLng.trim(),
        latitude: geoLat.trim() ? parseFloat(geoLat) : undefined,
        longitude: geoLng.trim() ? parseFloat(geoLng) : undefined,
        status: operationalStatus,
        entityType,
        cinNumber: (entityType === "pvt_ltd" || entityType === "public_ltd") ? cinNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined,
        llpinNumber: entityType === "llp" ? llpinNumber.trim().toUpperCase() : undefined,
        panNumber: panNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || undefined,
        gstin: gstExempted ? "UNREGISTERED" : (propertyGstin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || customSpvGstin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || undefined),
        ownerCompany,
        ownerName: ownerCompany,
        ownerEmail,
        ownerUserId,
        orgId,
        clientAccountId,
        billingEntityId: selectedSpvId !== "custom" ? selectedSpvId : undefined,
        sourceSystem: "manual",
        version: 1,
        dataQualityStatus: "passed",
        targetRentPsf,
        standardCamPsf,
        towers,
        units,
        compliance: {
          occupancyCertStatus,
          occupancyCertNumber: ocSanctionNumber || undefined,
          occupancyCertValidityDate: ocValidityDate || undefined,
          fireNocValidUntil: fireNocValidUntil || undefined,
          sanctionedPlanRef: sanctionedPlanRef || undefined,
          sanctionedPlanDate: sanctionedPlanDate || undefined,
          titleDeedRef: titleDeedRef || undefined,
          titleDeedDate: titleDeedDate || undefined,
          documents: uploadedDocs
        },
        syndicateToMarketplace
      };

      // 1. Post to Rent-Roll master store
      const rrRes = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const rrData = await rrRes.json();
      if (!rrRes.ok) {
        throw new Error(rrData.error || `Server responded with status ${rrRes.status}`);
      }

      // 2. Also post to general properties DB table for cross-platform availability
      try {
        await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            totalArea: totalChargeableArea || 1000
          })
        });
      } catch (err) {
        console.warn("DB property insertion fallback note:", err);
      }

      // 3. Cache into local storage for instant zero-latency UI
      if (typeof window !== "undefined") {
        try {
          const currentList = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          const occupiedUnits = units.filter(u => u.status === "occupied");
          const calcOccupiedArea = occupiedUnits.reduce((sum, u) => sum + (Number(u.chargeableArea) || 0), 0);
          const calcVacantArea = Math.max(0, (totalChargeableArea || 1000) - calcOccupiedArea);
          const calcOccupancyPct = (totalChargeableArea || 1000) > 0 ? Math.round((calcOccupiedArea / (totalChargeableArea || 1000)) * 1000) / 10 : 0;
          const calcMonthlyRent = occupiedUnits.reduce((sum, u) => sum + Math.round((Number(u.chargeableArea) || 0) * (Number(u.contractedRentPsf) || Number(u.askingRate) || 0)), 0);
          const calcBilling = occupiedUnits.reduce((sum, u) => sum + Math.round((Number(u.chargeableArea) || 0) * ((Number(u.contractedRentPsf) || Number(u.askingRate) || 0) + (Number(u.camRatePsf) || standardCamPsf || 0))), 0);

          const createdItem = {
            id: rrData.id || `PROP-${Date.now()}`,
            name: assetName.trim(),
            propertyCode: propertyCode.trim() || `PROP-${Date.now()}`,
            type: propertyType,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            microMarket: microMarket.trim() || city.trim(),
            pincode: pincode.trim() || "400001",
            grade,
            areaUnit,
            geoLat: geoLat.trim(),
            geoLng: geoLng.trim(),
            status: operationalStatus,
            entityType,
            cinNumber: (entityType === "pvt_ltd" || entityType === "public_ltd") ? cinNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined,
            llpinNumber: entityType === "llp" ? llpinNumber.trim().toUpperCase() : undefined,
            panNumber: panNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || undefined,
            gstin: gstExempted ? "UNREGISTERED" : (propertyGstin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || customSpvGstin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || undefined),
            totalArea: totalChargeableArea || 1000,
            chargeableArea: totalChargeableArea || 1000,
            carpetArea: totalCarpetArea || Math.round((totalChargeableArea || 1000) * 0.75),
            currency,
            occupancyTargetPct: 95,
            ownerEmail,
            ownerUserId,
            ownerName: ownerCompany,
            ownerCompany,
            orgId,
            clientAccountId,
            sourceSystem: "manual",
            version: 1,
            dataQualityStatus: "passed",
            towers,
            units,
            activeLeasesCount: rrData.activeLeasesCount !== undefined ? rrData.activeLeasesCount : occupiedUnits.length,
            occupiedArea: rrData.occupiedArea !== undefined ? rrData.occupiedArea : calcOccupiedArea,
            vacantArea: rrData.vacantArea !== undefined ? rrData.vacantArea : calcVacantArea,
            occupancyPct: rrData.occupancyPct !== undefined ? rrData.occupancyPct : calcOccupancyPct,
            totalMonthlyRent: rrData.totalMonthlyRent !== undefined ? rrData.totalMonthlyRent : calcMonthlyRent,
            totalBilling: rrData.totalBilling !== undefined ? rrData.totalBilling : calcBilling,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem("officex_user_properties", JSON.stringify([createdItem, ...currentList]));
        } catch {}

        // Fire custom window event to immediately refresh any open dashboard
        window.dispatchEvent(new CustomEvent("officex-property-added"));
      }

      // Pre-select all unit codes for WhatsApp & Tenant link sharing
      const allUnitCodes = units.map(u => u.suiteNumber || u.spaceCode || "");
      const leasedUnitCodes = units.filter(u => u.status === "occupied").map(u => u.suiteNumber || u.spaceCode || "");
      setSelectedShareUnits(leasedUnitCodes.length > 0 ? leasedUnitCodes : (allUnitCodes.length > 0 ? allUnitCodes : ["Suite 101"]));
      setSuccessProperty(rrData);
    } catch (e: any) {
      alert(`Could not register property: ${e.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── BREADCRUMB & HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/properties" className="hover:text-slate-900 transition-colors">Properties</Link>
              <span>/</span>
              <span className="text-[#0F8B7D] font-bold">Register Commercial Asset</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-800 border border-teal-200">
                Commercial Asset Portfolio
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="text-[#0F8B7D]" size={26} />
              Commercial Property Master Builder
            </h1>
            <p className="text-xs text-slate-500">
              Register institutional commercial assets, building towers, and leasable floor inventory for your lease & rent roll management.
            </p>
          </div>

          <Link
            href="/properties"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            Cancel & Back
          </Link>
        </div>

        {/* ── 3-STEP WIZARD PROGRESS RIBBON ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { num: 1, title: "Asset & Legal Master", subtitle: "Identity, CIN/PAN & Towers" },
              { num: 2, title: "Area & Space Inventory", subtitle: "Chargeable vs Carpet Units" },
              { num: 3, title: "Statutory & Review", subtitle: "Clearances & Master Registration" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num === 1) {
                      setCurrentStep(1);
                    } else if (step.num === 2) {
                      handleStep1Next();
                    } else if (step.num === 3) {
                      if (!assetName.trim() || !address.trim()) {
                        handleStep1Next();
                      } else {
                        setCurrentStep(3);
                      }
                    }
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "border-[#0F8B7D] bg-teal-50/50 shadow-xs ring-1 ring-[#0F8B7D]"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50/30 text-slate-700"
                      : "border-slate-200 bg-slate-50/50 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isActive
                          ? "bg-[#0F8B7D] text-white"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? <Check size={11} strokeWidth={3} /> : step.num}
                    </span>
                    <span className={`text-xs font-bold ${isActive ? "text-[#0F8B7D]" : "text-slate-800"}`}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal pl-7">
                    {step.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1: ASSET IDENTITY, LEGAL ENTITY & TOWERS ── */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Briefcase size={18} className="text-[#0F8B7D]" />
                1. Asset Identity, Legal Constitution &amp; Building Structure
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish asset legal identity, corporate statutory registration (CIN / LLPIN / PAN), place-of-supply billing entity, and optional multi-tower configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Commercial Asset / Property Name *</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. Apex Business Tower</span>
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. One BKC Financial Centre"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                />
              </div>

              {/* Property Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Asset / Property Code *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Unique Asset Identifier</span>
                </label>
                <input
                  type="text"
                  value={propertyCode}
                  onChange={(e) => {
                    setCodeManuallyEdited(true);
                    setPropertyCode(e.target.value.toUpperCase());
                  }}
                  placeholder="e.g. OBKC-MUM-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                />
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Commercial Asset Classification *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="office">Commercial Office / Corporate Tower</option>
                  <option value="it_park">IT / ITeS Tech Park</option>
                  <option value="retail">Commercial Retail & High Street Mall</option>
                  <option value="mixed_use">Mixed-Use Commercial & Retail</option>
                  <option value="flex_centre">Managed Office & Coworking Centre</option>
                  <option value="industrial">Industrial & Logistics Park</option>
                  <option value="warehouse">Warehouse & Distribution Centre</option>
                  <option value="sez_ifsc">SEZ / IFSC International Financial Centre</option>
                </select>
              </div>

              {/* Building Grade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Institutional Grade *</label>
                <div className="grid grid-cols-5 gap-2">
                  {(["A+", "A", "B+", "B", "C"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        grade === g
                          ? "border-[#0F8B7D] bg-teal-50 text-[#0F8B7D] shadow-2xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Statutory Ownership Constitution & Tax Identification ── */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center border border-teal-100/60">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Ownership Constitution &amp; Statutory Identifiers
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Mandatory statutory registry data for lease deed execution, Section 194-I TDS credit, and GST compliance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D]"></span>
                  Statutory Registry
                </div>
              </div>

              {/* Entity Constitution Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Entity Constitution / Ownership Structure *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Legal Title Holder</span>
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] transition-colors cursor-pointer shadow-2xs"
                >
                  <option value="pvt_ltd">Private Limited Company (Pvt Ltd)</option>
                  <option value="public_ltd">Public Limited Company (Ltd / PLC)</option>
                  <option value="llp">Limited Liability Partnership (LLP)</option>
                  <option value="proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership Firm (Indian Partnership Act 1932)</option>
                  <option value="individual">Individual / Joint HNI Owner</option>
                  <option value="trust_reit">Trust / Real Estate Investment Trust (REIT)</option>
                </select>
              </div>



              {/* 3 Credential Cards: CIN/LLPIN + PAN + GSTIN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                
                {/* 1. CORPORATE IDENTIFIER (CIN / LLPIN / EXEMPT) */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {entityType === "llp" ? "LLPIN Identifier" : "Corporate ID (CIN)"}
                      </span>
                    </div>
                    {(entityType === "pvt_ltd" || entityType === "public_ltd" || entityType === "llp") ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        Compulsory
                      </span>
                    ) : entityType === "trust_reit" ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Optional
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                        Exempt
                      </span>
                    )}
                  </div>

                  {(entityType === "pvt_ltd" || entityType === "public_ltd") && (
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={28}
                        value={cinNumber}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                          setCinNumber(val);
                        }}
                        placeholder="e.g. U70102MH2018PTC123456"
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none transition-colors ${
                          isCinValid(cinNumber)
                            ? "border-emerald-500 ring-1 ring-emerald-500"
                            : cinNumber.trim().length > 0
                            ? "border-amber-400"
                            : "border-slate-200 focus:border-[#0F8B7D]"
                        }`}
                      />
                      {isCinValid(cinNumber) && (
                        <span className="absolute right-2.5 top-2 text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                          <Check size={12} strokeWidth={3} /> Valid
                        </span>
                      )}
                    </div>
                  )}

                  {entityType === "llp" && (
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={12}
                        value={llpinNumber}
                        onChange={(e) => setLlpinNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                        placeholder="e.g. AAA-1234"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                  )}

                  {entityType === "trust_reit" && (
                    <input
                      type="text"
                      value={cinNumber}
                      onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. SEBI Reg / Trust Deed"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  )}

                  {(entityType === "proprietorship" || entityType === "partnership" || entityType === "individual") && (
                    <div className="px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-400 text-xs font-medium italic flex items-center justify-between">
                      <span>Exempt (No MCA CIN)</span>
                      <span className="text-[10px] not-italic font-bold text-slate-400 uppercase">Non-Corporate</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    {(entityType === "pvt_ltd" || entityType === "public_ltd") ? (
                      <span className="text-slate-500 font-medium">Standard 21-character MCA corporate identifier</span>
                    ) : entityType === "llp" ? (
                      <span className="text-slate-500 font-medium">Limited Liability Partnership Identification Number (LLPIN)</span>
                    ) : (
                      <span>Non-corporate title deed</span>
                    )}
                  </div>
                </div>

                {/* 2. INCOME TAX PAN (COMPULSORY FOR ALL) */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {entityType === "proprietorship"
                          ? "Proprietor PAN"
                          : entityType === "partnership"
                          ? "Firm PAN"
                          : entityType === "individual"
                          ? "Owner PAN"
                          : "Income Tax PAN"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      Compulsory
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={14}
                      value={panNumber}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                        setPanNumber(val);
                      }}
                      placeholder="e.g. ABCDE1234F"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none transition-colors ${
                        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                          ? "border-emerald-500 ring-1 ring-emerald-500"
                          : panNumber.trim().length > 0
                          ? "border-amber-400"
                          : "border-slate-200 focus:border-[#0F8B7D]"
                      }`}
                    />
                    {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase().replace(/[^A-Z0-9]/g, "")) && (
                      <span className="absolute right-2.5 top-2 text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                        <Check size={12} strokeWidth={3} /> Valid
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-slate-500 font-medium">10-character Permanent Account Number</span>
                    <span className="font-semibold text-slate-500">10% TDS Sec 194-I</span>
                  </div>
                </div>

                {/* 3. GOODS & SERVICES TAX (GSTIN) */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Receipt size={13} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">GSTIN Identifier</span>
                    </div>
                    {(entityType === "pvt_ltd" || entityType === "public_ltd" || entityType === "llp" || entityType === "trust_reit") && !gstExempted ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        Compulsory
                      </span>
                    ) : gstExempted ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Unregistered (RCM)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Optional (&lt;₹20L)
                      </span>
                    )}
                  </div>

                  {gstExempted ? (
                    <div className="px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-500 text-xs font-medium italic flex items-center justify-between">
                      <span>Unregistered under GST</span>
                      <span className="text-[10px] not-italic font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">RCM Mode</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={20}
                        value={propertyGstin}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                          setPropertyGstin(val);
                          if (!customSpvGstin || customSpvGstin === propertyGstin) {
                            setCustomSpvGstin(val);
                          }
                        }}
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none transition-colors ${
                          propertyGstin.toUpperCase().replace(/[^A-Z0-9]/g, "").length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(propertyGstin.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                            ? "border-emerald-500 ring-1 ring-emerald-500"
                            : propertyGstin.trim().length > 0
                            ? "border-amber-400"
                            : "border-slate-200 focus:border-[#0F8B7D]"
                        }`}
                      />
                      {propertyGstin.toUpperCase().replace(/[^A-Z0-9]/g, "").length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(propertyGstin.toUpperCase().replace(/[^A-Z0-9]/g, "")) && (
                        <span className="absolute right-2.5 top-2 text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                          <Check size={12} strokeWidth={3} /> Valid
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-0.5">
                    <label className="flex items-center justify-between cursor-pointer select-none text-[10px] text-slate-600 hover:text-slate-900">
                      <span>Turnover &lt; ₹20L (Exempt / RCM)</span>
                      <input
                        type="checkbox"
                        checked={gstExempted}
                        onChange={(e) => {
                          setGstExempted(e.target.checked);
                          if (e.target.checked) {
                            setPropertyGstin("");
                          }
                        }}
                        className="rounded text-[#0F8B7D] focus:ring-[#0F8B7D] h-3.5 w-3.5 cursor-pointer"
                      />
                    </label>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-slate-500 font-medium">15-digit GSTIN format: State Code + PAN + 1Z + Checksum</span>
                      <span className="font-semibold text-slate-500">18% GST Applicable</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Statutory Billing SPV Link */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Default Invoicing SPV / Legal Entity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tenant leases in this property will inherit this SPV for rent GST invoices and escrow bank accounts.
                  </p>
                </div>
              </div>

              {spvs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {spvs.map((s) => (
                      <label
                        key={s.id}
                        onClick={() => setSelectedSpvId(s.id)}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          selectedSpvId === s.id
                            ? "border-[#0F8B7D] bg-white ring-1 ring-[#0F8B7D]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="spvSelection"
                          checked={selectedSpvId === s.id}
                          onChange={() => setSelectedSpvId(s.id)}
                          className="mt-0.5 text-[#0F8B7D] focus:ring-[#0F8B7D]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block">{s.spvName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">GSTIN: {s.gstin}</span>
                        </div>
                      </label>
                    ))}

                    <label
                      onClick={() => setSelectedSpvId("custom")}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        selectedSpvId === "custom"
                          ? "border-[#0F8B7D] bg-white ring-1 ring-[#0F8B7D]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="spvSelection"
                        checked={selectedSpvId === "custom"}
                        onChange={() => setSelectedSpvId("custom")}
                        className="mt-0.5 text-[#0F8B7D] focus:ring-[#0F8B7D]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">+ Add Distinct Billing SPV</span>
                        <span className="text-[10px] text-slate-500">Enter custom entity for this asset</span>
                      </div>
                    </label>
                  </div>

                  {selectedSpvId === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        placeholder="Legal SPV Entity Name"
                        value={customSpvName}
                        onChange={(e) => setCustomSpvName(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                      />
                      <input
                        type="text"
                        placeholder="15-digit GSTIN (optional if unregistered)"
                        value={customSpvGstin}
                        onChange={(e) => setCustomSpvGstin(e.target.value.toUpperCase())}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-slate-500">
                    Specify the owning entity / SPV for issuing monthly rent GST invoices and receiving lease payments:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Legal SPV / Owning Entity Name (e.g. Skyline Realty Pvt Ltd)"
                      value={customSpvName}
                      onChange={(e) => setCustomSpvName(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                    <input
                      type="text"
                      placeholder="15-digit GSTIN (optional if unregistered)"
                      value={customSpvGstin}
                      onChange={(e) => setCustomSpvGstin(e.target.value.toUpperCase())}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Statutory Location / Address (GST Place of Supply) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
                <MapPin size={14} className="text-[#0F8B7D]" />
                Asset Physical Location (Drives GST Place of Supply)
              </h3>

              <div className="space-y-3">
                <AddressAutocomplete
                  label="Registered Property Address *"
                  value={address}
                  onChange={(val) => setAddress(val)}
                  onSelectLocation={(loc) => {
                    setAddress(loc.fullAddress);
                    if (loc.city) setCity(loc.city);
                    if (loc.state) setState(loc.state);
                    if (loc.pincode) setPincode(loc.pincode);
                  }}
                  placeholder="e.g. Plot C-59, G Block BKC, Bandra Kurla Complex"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 1. STATE FIRST */}
                  <StateAutocomplete
                    label="State (GST) *"
                    value={state}
                    onChange={(val) => {
                      setState(val);
                      // Clear city if it doesn't belong to the newly selected state
                      if (city && val) {
                        setCity("");
                      }
                    }}
                  />

                  {/* 2. CITY SECOND (Strictly scoped to selected state) */}
                  <CityAutocomplete
                    label="City *"
                    value={city}
                    selectedState={state}
                    requireStateFirst={true}
                    placeholder={state ? `City in ${state}...` : "Select State first"}
                    onChange={(val) => setCity(val)}
                    onSelectCityAndState={(cityName, stateName) => {
                      setCity(cityName);
                      if (stateName) setState(stateName);
                    }}
                  />

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Micro-Market</label>
                    <input
                      type="text"
                      value={microMarket}
                      onChange={(e) => setMicroMarket(e.target.value)}
                      placeholder="e.g. BKC / Cyber City"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Pincode *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 400051"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Area Unit, Geo Coordinates, Operational Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Area Measurement Unit *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["sqft", "sqm"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setAreaUnit(unit)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        areaUnit === unit
                          ? "border-[#0F8B7D] bg-teal-50 text-[#0F8B7D] shadow-2xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {unit === "sqft" ? "Sq. Ft." : "Sq. M."}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Operational Status *</label>
                <select
                  value={operationalStatus}
                  onChange={(e) => setOperationalStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="operational">Operational</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="under_fitout">Under Fitout</option>
                  <option value="under_refurbishment">Under Refurbishment</option>
                  <option value="disposed">Disposed / Sold</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Latitude</label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={(e) => setGeoLat(e.target.value)}
                  placeholder="e.g. 19.066110"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Longitude</label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={(e) => setGeoLng(e.target.value)}
                  placeholder="e.g. 72.867520"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* ── Building Towers & Wings Structure (Optional Inline in Step 1) ── */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    id="multiTowerCheckbox"
                    type="checkbox"
                    checked={hasMultipleTowers}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasMultipleTowers(checked);
                      if (checked && towers.length <= 1) {
                        setTowers([
                          { id: "T1", name: `${assetName.trim() || 'Tower 1'} (Tower A)`, code: "T1", floorsAbove: 1, floorsBelow: 0, chargeableArea: 0 },
                          { id: "T2", name: "Tower 2 (Tower B)", code: "T2", floorsAbove: 1, floorsBelow: 0, chargeableArea: 0 }
                        ]);
                      } else if (!checked) {
                        setTowers([{
                          id: "T1",
                          name: assetName ? `${assetName.trim()} (Main Building)` : "Main Building",
                          code: "T1",
                          floorsAbove: 1,
                          floorsBelow: 0,
                          chargeableArea: totalChargeableArea || 0
                        }]);
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded text-[#0F8B7D] focus:ring-[#0F8B7D] cursor-pointer"
                  />
                  <label htmlFor="multiTowerCheckbox" className="cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                      <span>This commercial property has multiple towers or wings</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Optional
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Leave unchecked if this is a single standalone commercial building. Enable only for multi-building tech parks, business hubs, or campus properties.
                    </span>
                  </label>
                </div>

                {hasMultipleTowers && (
                  <button
                    type="button"
                    onClick={handleAddTower}
                    className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus size={14} /> Add Another Tower
                  </button>
                )}
              </div>

              {!hasMultipleTowers ? (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center font-bold">
                      <Building size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Single Standalone Building Asset (Default)</span>
                      <span className="text-[11px] text-slate-500">
                        All suites and floors defined in Step 2 will belong to this building ({assetName || "Main Building"}).
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    T1 (Main)
                  </span>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {towers.map((tower, idx) => (
                    <div
                      key={tower.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 relative shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#0F8B7D] text-white flex items-center justify-center text-[10px] font-black">
                            {tower.code || `T${idx+1}`}
                          </span>
                          Tower / Block {idx + 1}
                        </span>

                        {towers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTower(tower.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Remove Tower"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Tower / Block Name *</label>
                          <input
                            type="text"
                            value={tower.name}
                            onChange={(e) => {
                              const updated = towers.map(t => t.id === tower.id ? { ...t, name: e.target.value } : t);
                              setTowers(updated);
                            }}
                            placeholder="e.g. Tower 1 (North Block)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Tower Code *</label>
                          <input
                            type="text"
                            value={tower.code}
                            onChange={(e) => {
                              const updated = towers.map(t => t.id === tower.id ? { ...t, code: e.target.value.toUpperCase() } : t);
                              setTowers(updated);
                            }}
                            placeholder="e.g. T1"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Chargeable Area ({areaLabel})</label>
                          <input
                            type="number"
                            value={tower.chargeableArea || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = towers.map(t => t.id === tower.id ? { ...t, chargeableArea: val } : t);
                              setTowers(updated);
                            }}
                            placeholder="e.g. 50000"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Floors Above Ground</label>
                          <input
                            type="number"
                            value={tower.floorsAbove}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              const updated = towers.map(t => t.id === tower.id ? { ...t, floorsAbove: val } : t);
                              setTowers(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Basements</label>
                          <input
                            type="number"
                            value={tower.floorsBelow}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = towers.map(t => t.id === tower.id ? { ...t, floorsBelow: val } : t);
                              setTowers(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Stacking Plan:</span>
                          <strong className="text-slate-900 font-mono text-[11px]">
                            {tower.floorsAbove} Above Ground + {tower.floorsBelow} Basements = {tower.floorsAbove + tower.floorsBelow} Levels
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}

                  {towers.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-900">Configured Towers: {towers.length}</span>
                      <span className="font-mono font-black text-xs text-teal-900">
                        Sum Tower Area: {towers.reduce((sum, t) => sum + (t.chargeableArea || 0), 0).toLocaleString()} {areaLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {!hasMultipleTowers ? "Single-building asset (Default)." : `${towers.length} building towers configured.`}
              </span>
              <button
                type="button"
                onClick={handleStep1Next}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Step 2: Area &amp; Space Inventory</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: AREA & LEASABLE INVENTORY (Space Master) ── */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-8 animate-in fade-in-50 duration-200">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200">
                  Step 2 of 3 • Property Specs &amp; Lease Allocation
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers size={20} className="text-[#0F8B7D]" />
                Building Specifications &amp; Leasable Inventory Selection
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                First specify overall building structure, handover condition, and technical specs. Then select whether to lease the whole tower or configure individual floors/suites.
              </p>
            </div>

            {/* ════════════════════════════════════════════════════════════
                PART 1: PROPERTY SPECIFICATIONS (Building Master Details)
               ════════════════════════════════════════════════════════════ */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-[#0F8B7D] flex items-center justify-center">
                    <Building size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Part 1 • Master Building Specifications &amp; Handover Condition
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Overall building footprint, floor count, carpet area, fitout state, and utility ratings.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 self-start sm:self-auto">
                  Asset Infrastructure
                </span>
              </div>

              {/* Grid 1: Total Area, Carpet Area, Floors, Basements */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Super Leasable Area */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Total Leasable Area *</span>
                    <span className="text-[9px] font-normal text-slate-400">Super Built-up</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="e.g. 50,000"
                      value={totalChargeableArea || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setTotalChargeableArea(val);
                        if (totalCarpetArea === 0 || totalCarpetArea > val) {
                          setTotalCarpetArea(Math.round(val * 0.75));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20"
                    />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{areaLabel}</span>
                  </div>
                </div>

                {/* Total Usable Carpet Area */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Usable Carpet Area *</span>
                    {totalChargeableArea > 0 && totalCarpetArea > 0 && !hasCarpetExceedsSuper && (
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-100/70 px-1 rounded">
                        {loadingPct}% Loading
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="e.g. 37,500"
                      value={totalCarpetArea || ""}
                      onChange={(e) => setTotalCarpetArea(Number(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                        hasCarpetExceedsSuper
                          ? "border-red-400 bg-red-50/40 text-red-900"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{areaLabel}</span>
                  </div>
                </div>

                {/* Total Floors Above Ground */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Total Floors (Above Ground) *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="e.g. 10"
                    value={totalFloorsCount || ""}
                    onChange={(e) => setTotalFloorsCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20"
                  />
                  <p className="text-[10px] text-slate-400">e.g. G + 9 upper floors = 10</p>
                </div>

                {/* Basements / Parking Levels */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Basement Levels</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    placeholder="e.g. 2"
                    value={basementsCount || ""}
                    onChange={(e) => setBasementsCount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20"
                  />
                  <p className="text-[10px] text-slate-400">Underground parking / utility</p>
                </div>
              </div>

              {/* Fitout / Handover Condition Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-200/70">
                <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare size={13} className="text-[#0F8B7D]" />
                    Building Fitout &amp; Handover Condition *
                  </span>
                  <span className="text-[10px] text-slate-400">Specifies handover condition to tenants</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: "bare_shell", title: "Bare Shell", desc: "Unfurnished / Raw Concrete Slab & Open Ceiling" },
                    { id: "warm_shell", title: "Warm Shell", desc: "Finished Screed, HVAC Ducts, Power Tapping & Toilets" },
                    { id: "semi_furnished", title: "Semi-Furnished", desc: "Flooring, False Ceiling, Grid Lights & Basic Cabins" },
                    { id: "furnished", title: "Fully Furnished", desc: "Complete Desks, Workstations, Partitions & Cabins" },
                    { id: "plug_and_play", title: "Plug & Play", desc: "100% Ready with IT Cabling, Server Rack & Cafeteria" },
                  ].map((item) => {
                    const isSelected = buildingFitoutCondition === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBuildingFitoutCondition(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-teal-50/80 border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-2xs"
                            : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isSelected ? "text-teal-950" : "text-slate-800"}`}>
                              {item.title}
                            </span>
                            {isSelected && (
                              <CheckCircle size={14} className="text-[#0F8B7D] shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Infrastructure (Height, DG backup, Power, HVAC, Parking) */}
              <div className="pt-2 border-t border-slate-200/70">
                <label className="text-[11px] font-bold text-slate-800 block mb-2">
                  Building Utilities &amp; Engineering Specifications
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Clear Height</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="11"
                        value={clearHeightFt || ""}
                        onChange={(e) => setClearHeightFt(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">Ft</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">DG Power Backup</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="100"
                        value={dgBackupPct}
                        onChange={(e) => setDgBackupPct(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Sanctioned Power</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="150"
                        value={sanctionedPowerKva || ""}
                        onChange={(e) => setSanctionedPowerKva(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">kVA</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Reserved Parking</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="25"
                        value={parkingSlotsCount || ""}
                        onChange={(e) => setParkingSlotsCount(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">Slots</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">HVAC Cooling</span>
                    <select
                      value={hvacSystemType}
                      onChange={(e) => setHvacSystemType(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    >
                      <option value="VRV/VRF Central Air Conditioning">VRV / VRF Central</option>
                      <option value="Water Cooled Chiller Plant">Central Chiller</option>
                      <option value="Split Air Conditioning">Split Units</option>
                      <option value="Provisions Only (Tenant Fitout)">Provisions Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                PART 2: LEASE SCOPE SELECTION (Whole Tower vs Specific Floors)
               ════════════════════════════════════════════════════════════ */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare size={15} className="text-[#0F8B7D]" />
                    Part 2 • How Much Part Do You Want to Put on Lease?
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Choose whether you are leasing the entire building/tower as a single block, or selecting individual floors/suites.
                  </p>
                </div>

                {/* Scope Switcher Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLeaseScopeMode("whole_tower");
                      handleCreateSingleBuildingUnit();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leaseScopeMode === "whole_tower"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Building size={13} className={leaseScopeMode === "whole_tower" ? "text-[#0F8B7D]" : "text-slate-400"} />
                    <span>Lease Whole Tower / Building</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSwitchToSpecificFloors}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leaseScopeMode === "specific_floors"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Layers size={13} className={leaseScopeMode === "specific_floors" ? "text-[#0F8B7D]" : "text-slate-400"} />
                    <span>Select Specific Floors / Suites</span>
                  </button>
                </div>
              </div>

              {/* ── OPTION A: WHOLE TOWER LEASING ── */}
              {leaseScopeMode === "whole_tower" && (
                <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          Single Space Lease: Entire Building ({totalChargeableArea.toLocaleString()} {areaLabel})
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-bold">
                          All {totalFloorsCount} Floors Combined
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        The entire asset is contracted to one tenant or offered as a corporate headquarters / BTS campus.
                      </p>
                    </div>

                    {/* Switch to specific floors button if user changes mind */}
                    <button
                      type="button"
                      onClick={handleSwitchToSpecificFloors}
                      className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Layers size={13} />
                      <span>Switch to Floor-by-Floor Selection</span>
                    </button>
                  </div>

                  {/* Occupancy Status for Whole Tower */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-800">Lease Status of the Building</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setWholeTowerStatus("vacant");
                            handleCreateSingleBuildingUnit("vacant");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            units[0]?.status === "vacant"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${units[0]?.status === "vacant" ? "bg-white" : "bg-emerald-500"}`} />
                          <span>Vacant (Available for Lease)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWholeTowerStatus("occupied");
                            handleCreateSingleBuildingUnit("occupied", wholeTowerTenantName || "Single Corporate Occupant");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            units[0]?.status === "occupied"
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${units[0]?.status === "occupied" ? "bg-white" : "bg-blue-500"}`} />
                          <span>Already Leased (Occupied)</span>
                        </button>
                      </div>
                    </div>

                    {units[0]?.status === "occupied" ? (
                      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-teal-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700">Contracted Tenant Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Tech Global"
                            value={units[0]?.tenantName || wholeTowerTenantName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWholeTowerTenantName(val);
                              setUnits(prev => prev.map(u => ({ ...u, tenantName: val })));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700">Contracted Rent ({currency}/{areaLabel})</label>
                          <input
                            type="number"
                            placeholder="e.g. 150"
                            value={units[0]?.contractedRentPsf || wholeTowerRentPsf || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setWholeTowerRentPsf(val);
                              setUnits(prev => prev.map(u => ({ ...u, contractedRentPsf: val })));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-teal-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700">Asking Rent Target ({currency}/{areaLabel})</label>
                          <input
                            type="number"
                            placeholder="e.g. 165"
                            value={targetRentPsf || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setTargetRentPsf(val);
                              setUnits(prev => prev.map(u => ({ ...u, askingRate: val })));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700">Estimated CAM ({currency}/{areaLabel})</label>
                          <input
                            type="number"
                            placeholder="e.g. 18"
                            value={standardCamPsf || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setStandardCamPsf(val);
                              setUnits(prev => prev.map(u => ({ ...u, camRatePsf: val })));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── OPTION B: SPECIFIC FLOORS SELECTION ── */}
              {leaseScopeMode === "specific_floors" && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={14} className="text-[#0F8B7D]" />
                        Floor-by-Floor Inventory Breakdown ({units.length} Floors Configured)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Mark which floors are already leased vs vacant, set individual areas, or add custom suites.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateFloors(totalFloorsCount > 0 ? totalFloorsCount : 5)}
                        className="px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Re-generate standard floor list based on Total Floors count"
                      >
                        <RefreshCw size={12} />
                        <span>Auto-Generate {totalFloorsCount || 5} Floors</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLeaseScopeMode("whole_tower");
                          handleCreateSingleBuildingUnit();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Building size={12} />
                        <span>Switch to Whole Tower</span>
                      </button>
                    </div>
                  </div>

                  {/* Floor List Table with Quick Status Toggle */}
                  {units.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <th className="py-2.5 px-3">Floor / Suite</th>
                            <th className="py-2.5 px-3">Leasable Area ({areaLabel})</th>
                            <th className="py-2.5 px-3">Carpet Area ({areaLabel})</th>
                            <th className="py-2.5 px-3">Handover Fitout</th>
                            <th className="py-2.5 px-3">Lease Status</th>
                            <th className="py-2.5 px-3">Tenant / Rent</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {units.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Floor / Suite Name */}
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                <input
                                  type="text"
                                  value={u.suiteNumber}
                                  onChange={(e) => handleUpdateUnitField(u.id, "suiteNumber", e.target.value)}
                                  className="w-32 px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-[#0F8B7D] font-bold text-xs bg-transparent"
                                />
                              </td>

                              {/* Leasable Area */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={u.chargeableArea || ""}
                                  onChange={(e) => handleUpdateUnitField(u.id, "chargeableArea", Number(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-[#0F8B7D] font-mono font-bold text-xs bg-transparent"
                                />
                              </td>

                              {/* Carpet Area */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={u.carpetArea || ""}
                                  onChange={(e) => handleUpdateUnitField(u.id, "carpetArea", Number(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-[#0F8B7D] font-mono text-xs bg-transparent"
                                />
                              </td>

                              {/* Fitout condition */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={u.fitoutCondition}
                                  onChange={(e) => handleUpdateUnitField(u.id, "fitoutCondition", e.target.value)}
                                  className="px-2 py-1 rounded border border-slate-200 text-[11px] font-bold bg-white text-slate-700"
                                >
                                  <option value="bare_shell">Bare Shell</option>
                                  <option value="warm_shell">Warm Shell</option>
                                  <option value="semi_furnished">Semi-Furnished</option>
                                  <option value="fully_fitted">Furnished</option>
                                  <option value="plug_and_play">Plug &amp; Play</option>
                                </select>
                              </td>

                              {/* Quick Leased vs Vacant status toggle */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFloorStatus(u.id, "vacant")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                      u.status === "vacant"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs font-extrabold"
                                        : "text-slate-400 hover:text-slate-700"
                                    }`}
                                  >
                                    Vacant
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFloorStatus(u.id, "occupied")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                      u.status === "occupied"
                                        ? "bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs font-extrabold"
                                        : "text-slate-400 hover:text-slate-700"
                                    }`}
                                  >
                                    Leased
                                  </button>
                                </div>
                              </td>

                              {/* Tenant Name if occupied, or asking rate if vacant */}
                              <td className="py-2.5 px-3">
                                {u.status === "occupied" ? (
                                  <input
                                    type="text"
                                    placeholder="Tenant Name (e.g. Infosys)"
                                    value={u.tenantName || ""}
                                    onChange={(e) => handleUpdateUnitField(u.id, "tenantName", e.target.value)}
                                    className="w-36 px-2 py-1 rounded border border-blue-200 bg-blue-50/50 text-blue-900 font-bold text-xs"
                                  />
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    For Lease ({currency} {u.askingRate || targetRentPsf || 150}/mo)
                                  </span>
                                )}
                              </td>

                              {/* Remove button */}
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUnit(u.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                  title="Delete Floor"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs text-slate-400 space-y-2">
                      <p className="font-bold text-slate-600">No floors added yet.</p>
                      <button
                        type="button"
                        onClick={() => handleGenerateFloors(totalFloorsCount > 0 ? totalFloorsCount : 5)}
                        className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles size={13} />
                        <span>Auto-Generate {totalFloorsCount || 5} Floors Now</span>
                      </button>
                    </div>
                  )}

                  {/* Add Custom Floor / Suite Inline Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newFloorNum = units.length + 1;
                        const defaultArea = Math.round((totalChargeableArea || 50000) / (totalFloorsCount || 5));
                        const added: LeasableSpaceUnit = {
                          id: `u-custom-${Date.now()}`,
                          spaceCode: `SP-T1-${String(newFloorNum).padStart(2, "0")}-01`,
                          suiteNumber: `Floor ${newFloorNum}`,
                          buildingCode: towers[0]?.code || "T1",
                          floorNumber: newFloorNum,
                          spaceType: "office",
                          chargeableArea: defaultArea > 0 ? defaultArea : 5000,
                          carpetArea: Math.round((defaultArea > 0 ? defaultArea : 5000) * 0.75),
                          askingRate: targetRentPsf || 150,
                          fitoutCondition: (buildingFitoutCondition as any) || "warm_shell",
                          seatCapacity: 0,
                          status: "vacant"
                        };
                        setUnits(prev => [...prev, added]);
                        setTotalChargeableArea(prev => prev + added.chargeableArea);
                        setTotalCarpetArea(prev => prev + added.carpetArea);
                      }}
                      className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Another Floor / Suite</span>
                    </button>

                    <div className="text-[11px] font-bold text-slate-500">
                      Total Allocated: <span className="text-slate-900 font-mono font-black">{units.reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════
                PART 3: MARKETPLACE & QUICK TENANT SHARABLE LINK PREFERENCES
               ════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1: Office Marketplace Syndication for Unleased / Vacant Space */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/90 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">List Unleased Vacancy on Office Marketplace</h4>
                      <p className="text-[11px] text-slate-600">Showcase vacant office floors to institutional corporate tenants &amp; IPC brokers</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={syndicateToMarketplace}
                      onChange={(e) => setSyndicateToMarketplace(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200/70 text-[11px] text-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <span>Unleased Leasable Area:</span>
                    <span className="font-mono">{units.filter(u => u.status === "vacant").reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {syndicateToMarketplace
                      ? "✓ Active: Unleased spaces will be listed immediately on the Office Marketplace with photos, specs & asking rates."
                      : "Off: This asset will remain private in your internal portfolio."}
                  </p>
                </div>
              </div>

              {/* Card 2: Quick Sharable Link for Already Leased Units */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200/90 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0F8B7D] flex items-center justify-center shrink-0">
                      <Share2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Tenant Onboarding Sharable Link</h4>
                      <p className="text-[11px] text-slate-600">Quick sharable WhatsApp &amp; web link generated immediately after Step 3</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">
                    Ready
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-teal-200/70 text-[11px] text-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-teal-950">
                    <span>Occupied / Leased Units:</span>
                    <span className="font-mono">{units.filter(u => u.status === "occupied").length} Leased Floor(s)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {units.filter(u => u.status === "occupied").length > 0
                      ? "✓ Upon completing Step 3, you will receive a direct 1-click WhatsApp & email sharable link for your leased tenants."
                      : "Currently all units are vacant. If you mark any unit as Leased, the quick sharable link will be tailored for that tenant."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back to Asset &amp; Address
              </button>

              <button
                type="button"
                onClick={() => {
                  if (totalChargeableArea <= 0 && units.length > 0) {
                    setTotalChargeableArea(units.reduce((s, u) => s + u.chargeableArea, 0));
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Step 3: Clearances &amp; Review</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: STATUTORY ASSET COMPLIANCE & REVIEW ── */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            {/* Header / Audit Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200">
                    Step 3 of 3 • Statutory Verification
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Final Pre-Registration Compliance Audit
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#0F8B7D]" />
                  Statutory Building Clearances &amp; Master Review
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach statutory permits, specify clearance deadline dates, review legal title deeds, and verify space inventory before registering.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[#0F8B7D] text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#0F8B7D]" />
                  <span>Statutory Verification</span>
                </div>
              </div>
            </div>

            {/* 1. Unified Municipal Clearances & Compliance Cards with Inline Uploads & Auto-Deadlines */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center border border-teal-100/80 shadow-2xs">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Municipal Clearances &amp; Statutory Document Uploads
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload compliance certificates directly with deadline / validity dates. Dates auto-populate when documents are attached.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 self-start sm:self-auto">
                  Statutory Registry
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Occupancy Certificate (OC) Card */}
                {(() => {
                  const ocDoc = uploadedDocs.find(d => d.category === "Occupancy Certificate (OC)" || d.category?.includes("Occupancy"));
                  return (
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                            <Building size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Occupancy Certificate (OC) *</span>
                            <span className="text-[10px] text-slate-400">Urban Local Body Municipal Approval</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          occupancyCertStatus === "issued"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : occupancyCertStatus === "in_progress"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {occupancyCertStatus === "issued" ? "Fully Sanctioned" : occupancyCertStatus === "in_progress" ? "In Review" : "Provisional"}
                        </span>
                      </div>

                      {/* 3-State Segmented Control */}
                      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/60 border border-slate-200/80 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setOccupancyCertStatus("issued")}
                          className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                            occupancyCertStatus === "issued"
                              ? "bg-white text-emerald-800 shadow-xs border border-emerald-200/80 font-black"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Issued (OC)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOccupancyCertStatus("in_progress")}
                          className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                            occupancyCertStatus === "in_progress"
                              ? "bg-white text-amber-800 shadow-xs border border-amber-200/80 font-black"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          In Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setOccupancyCertStatus("provisional")}
                          className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                            occupancyCertStatus === "provisional"
                              ? "bg-white text-blue-800 shadow-xs border border-blue-200/80 font-black"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Provisional
                        </button>
                      </div>

                      {/* Sanction Ref & Deadline Validity Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            {occupancyCertStatus === "issued"
                              ? "OC Sanction Ref / Order No."
                              : occupancyCertStatus === "in_progress"
                              ? "Application File No."
                              : "Provisional OC Ref"}
                          </label>
                          <input
                            type="text"
                            value={ocSanctionNumber}
                            onChange={(e) => setOcSanctionNumber(e.target.value)}
                            placeholder="e.g. BMC/EB/6211/WS/OC"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              OC Validity Date
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setFullYear(d.getFullYear() + 5);
                                setOcValidityDate(d.toISOString().split("T")[0]);
                              }}
                              className="text-[9px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                            >
                              +5 Years
                            </button>
                          </div>
                          <input
                            type="date"
                            value={ocValidityDate}
                            onChange={(e) => setOcValidityDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Integrated Document Upload / File Display */}
                      <div className="pt-1 border-t border-slate-200/60">
                        {ocDoc ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                            <div className="flex items-center gap-2 truncate mr-2">
                              <FileText size={14} className="text-[#0F8B7D] shrink-0" />
                              <span className="font-bold text-slate-900 truncate text-[11px]">{ocDoc.name}</span>
                              <span className="text-[10px] text-teal-700 font-mono">({ocDoc.size})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">Verified</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(ocDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-teal-300 hover:border-[#0F8B7D] bg-teal-50/40 hover:bg-teal-50 text-[11px] font-bold text-[#0F8B7D] cursor-pointer transition-all">
                            <UploadCloud size={14} />
                            <span>Upload OC Certificate (PDF / DWG) • Auto-sets +5Y</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "Occupancy Certificate (OC)")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Fire Safety NOC Card */}
                {(() => {
                  const fireDoc = uploadedDocs.find(d => d.category === "Fire Department NOC" || d.category?.includes("Fire"));
                  const st = getFireNocStatus();
                  return (
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center">
                            <Flame size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Fire Safety NOC Validity *</span>
                            <span className="text-[10px] text-slate-400">Chief Fire Officer (CFO) Clearance</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            NOC Expiry / Deadline Date
                          </label>
                          <input
                            type="date"
                            value={fireNocValidUntil}
                            onChange={(e) => setFireNocValidUntil(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Quick Expiry Presets
                          </label>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleSetFireNocPreset(1)}
                              className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#0F8B7D] hover:text-[#0F8B7D] transition-colors shadow-2xs cursor-pointer text-center"
                            >
                              +1 Year (Annual)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetFireNocPreset(3)}
                              className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#0F8B7D] hover:text-[#0F8B7D] transition-colors shadow-2xs cursor-pointer text-center"
                            >
                              +3 Years (High-Rise)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Integrated Document Upload / File Display */}
                      <div className="pt-1 border-t border-slate-200/60">
                        {fireDoc ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200 text-xs">
                            <div className="flex items-center gap-2 truncate mr-2">
                              <Flame size={14} className="text-orange-600 shrink-0" />
                              <span className="font-bold text-slate-900 truncate text-[11px]">{fireDoc.name}</span>
                              <span className="text-[10px] text-orange-700 font-mono">({fireDoc.size})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">Attached</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(fireDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50 text-[11px] font-bold text-orange-700 cursor-pointer transition-all">
                            <UploadCloud size={14} />
                            <span>Upload CFO Fire NOC (PDF / DWG) • Auto-sets +1Y</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "Fire Department NOC")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Sanctioned Plan / Blueprint Card */}
                {(() => {
                  const bpDoc = uploadedDocs.find(d => d.category === "Sanctioned Floor Blueprint" || d.category?.includes("Blueprint") || d.category?.includes("Sanction"));
                  return (
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                            <FileText size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Sanctioned Blueprint / IOD</span>
                            <span className="text-[10px] text-slate-400">Town Planning Sanction Authority</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Town Planning
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Building Sanction / IOD Order
                          </label>
                          <input
                            type="text"
                            value={sanctionedPlanRef}
                            onChange={(e) => setSanctionedPlanRef(e.target.value)}
                            placeholder="e.g. BMC/BP/2024/991/IOD"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Sanction Approval Date
                            </label>
                            <button
                              type="button"
                              onClick={() => setSanctionedPlanDate(new Date().toISOString().split("T")[0])}
                              className="text-[9px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                            >
                              Set Today
                            </button>
                          </div>
                          <input
                            type="date"
                            value={sanctionedPlanDate}
                            onChange={(e) => setSanctionedPlanDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Integrated Document Upload / File Display */}
                      <div className="pt-1 border-t border-slate-200/60">
                        {bpDoc ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                            <div className="flex items-center gap-2 truncate mr-2">
                              <FileText size={14} className="text-[#0F8B7D] shrink-0" />
                              <span className="font-bold text-slate-900 truncate text-[11px]">{bpDoc.name}</span>
                              <span className="text-[10px] text-teal-700 font-mono">({bpDoc.size})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">Blueprint Attached</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(bpDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-teal-300 hover:border-[#0F8B7D] bg-teal-50/40 hover:bg-teal-50 text-[11px] font-bold text-[#0F8B7D] cursor-pointer transition-all">
                            <UploadCloud size={14} />
                            <span>Upload Layout / Sanctioned Blueprint (CAD / PDF)</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "Sanctioned Floor Blueprint")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Legal Title Deed & Non-Encumbrance Card */}
                {(() => {
                  const deedDoc = uploadedDocs.find(d => d.category === "Title & Ownership Deed" || d.category?.includes("Title") || d.category?.includes("Deed"));
                  return (
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                            <ShieldCheck size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Title Deed &amp; Non-Encumbrance</span>
                            <span className="text-[10px] text-slate-400">Sub-Registrar Ownership Document</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Sub-Registrar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Registered Deed / Khata / Index II
                          </label>
                          <input
                            type="text"
                            value={titleDeedRef}
                            onChange={(e) => setTitleDeedRef(e.target.value)}
                            placeholder="e.g. REG/MUM/2019/8821"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Execution / Record Date
                            </label>
                            <button
                              type="button"
                              onClick={() => setTitleDeedDate(new Date().toISOString().split("T")[0])}
                              className="text-[9px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                            >
                              Set Today
                            </button>
                          </div>
                          <input
                            type="date"
                            value={titleDeedDate}
                            onChange={(e) => setTitleDeedDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Integrated Document Upload / File Display */}
                      <div className="pt-1 border-t border-slate-200/60">
                        {deedDoc ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                            <div className="flex items-center gap-2 truncate mr-2">
                              <FileText size={14} className="text-[#0F8B7D] shrink-0" />
                              <span className="font-bold text-slate-900 truncate text-[11px]">{deedDoc.name}</span>
                              <span className="text-[10px] text-teal-700 font-mono">({deedDoc.size})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">Title Verified</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(deedDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-teal-300 hover:border-[#0F8B7D] bg-teal-50/40 hover:bg-teal-50 text-[11px] font-bold text-[#0F8B7D] cursor-pointer transition-all">
                            <UploadCloud size={14} />
                            <span>Upload Title Deed / 7-12 Extract (PDF)</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "Title & Ownership Deed")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 2. Compliance Document Vault & Title Deeds */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center border border-teal-100/80 shadow-2xs">
                    <UploadCloud size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Property Compliance &amp; Legal Title Document Vault
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload municipal sanctions, fire NOCs, sanctioned layouts, or property deeds for institutional compliance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    {uploadedDocs.length} {uploadedDocs.length === 1 ? "File" : "Files"} Attached
                  </span>
                  <label className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0">
                    <UploadCloud size={14} /> Attach Documents
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e)}
                    />
                  </label>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {[
                  { id: "all", label: `All Files (${uploadedDocs.length})` },
                  { id: "Occupancy Certificate (OC)", label: "Occupancy Cert (OC)" },
                  { id: "Fire Department NOC", label: "Fire Dept NOC" },
                  { id: "Sanctioned Floor Blueprint", label: "Sanctioned Blueprint" },
                  { id: "Title & Ownership Deed", label: "Title Deeds / Khata" }
                ].map(cat => {
                  const count = cat.id === "all" ? uploadedDocs.length : uploadedDocs.filter(d => d.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveDocCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        activeDocCategory === cat.id
                          ? "bg-teal-50 text-[#0F8B7D] border border-teal-200 shadow-2xs"
                          : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label} {cat.id !== "all" && count > 0 && <span className="ml-1 text-[10px] text-[#0F8B7D]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Modern Interactive Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => handleDropFiles(e)}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center transition-all ${
                  isDragging
                    ? "border-[#0F8B7D] bg-teal-50/50 scale-[0.99]"
                    : "border-slate-200 hover:border-[#0F8B7D]/60 hover:bg-teal-50/20"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-2.5 border border-teal-100 shadow-2xs">
                  <UploadCloud size={24} />
                </div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Drag and drop compliance documents here, or click to browse
                </strong>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Supports PDF, CAD/DWG, DXF, PNG, JPG up to 25 MB per file
                </span>

                {/* Quick Upload Action Buttons for Specific Legal Documents */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100 w-full max-w-xl">
                  {[
                    "Occupancy Certificate (OC)",
                    "Fire Department NOC",
                    "Sanctioned Floor Blueprint",
                    "Title & Ownership Deed"
                  ].map(category => (
                    <label
                      key={category}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-[#0F8B7D] text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={11} /> {category}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, category)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedDocs
                      .filter(d => activeDocCategory === "all" || d.category === activeDocCategory)
                      .map(doc => {
                        const isPdf = doc.name.toLowerCase().endsWith(".pdf");
                        const isCad = doc.name.toLowerCase().includes(".dwg") || doc.name.toLowerCase().includes(".dxf");
                        const isImg = doc.name.toLowerCase().endsWith(".png") || doc.name.toLowerCase().endsWith(".jpg") || doc.name.toLowerCase().endsWith(".jpeg");

                        return (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-3 truncate mr-2">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isPdf
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : isCad
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                                  : isImg
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-teal-50 text-[#0F8B7D] border-teal-100"
                              }`}>
                                <FileText size={17} />
                              </div>

                              <div className="truncate">
                                <span className="font-bold text-slate-900 block truncate text-xs">{doc.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                    {doc.category || "General Compliance"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {doc.size} • {doc.uploadedAt}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Check size={11} /> Verified
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(doc.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Files are securely stored in AES-256 encrypted institutional compliance vault.
                    </span>
                    <label className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer flex items-center gap-1">
                      <Plus size={13} /> Add More Files
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e)}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Commercial Rent Roll & Lease Accounting Policy (Client UAT Spec) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center border border-teal-100/80 shadow-2xs">
                    <Receipt size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Rent Roll &amp; Lease Accounting Policy
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard CAM billing, lease escalation compounding, and security deposit escrow rules applied across this asset.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 self-start sm:self-auto">
                  Rent Roll Master Rules
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Default Building CAM Rate */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                        <DollarSign size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Standard CAM Rate</span>
                        <span className="text-[10px] text-slate-400">Common Area Maintenance</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Billed Monthly
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      CAM Charge ({currency === "USD" ? "$" : "₹"}/{areaLabel}/month)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 18"
                      value={standardCamPsf || ""}
                      onChange={(e) => setStandardCamPsf(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Power, HVAC &amp; Housekeeping</span>
                    <span className="font-semibold text-slate-500">Pass-through Expense</span>
                  </div>
                </div>

                {/* 2. Standard Escalation Schedule */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                        <Sliders size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Default Escalation Rule</span>
                        <span className="text-[10px] text-slate-400">Compounded Growth Forecast</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      UAT Spec 4.5
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Benchmark Lease Escalation
                    </label>
                    <select
                      value={defaultEscalation}
                      onChange={(e) => setDefaultEscalation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    >
                      <option value="15_every_36">15% every 36 Months (Standard Indian Institutional CRE)</option>
                      <option value="5_annual">5% Compounded Annually (Grade-A IT Park)</option>
                      <option value="none">Fixed Base Rent (No Escalation)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Compounded in 3-Yr Forecast</span>
                    <span className="font-semibold text-slate-500">Commercial Standard</span>
                  </div>
                </div>

                {/* 3. Security Deposit Escrow Standard */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                        <Lock size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Security Deposit Escrow</span>
                        <span className="text-[10px] text-slate-400">Tenant Financial Collateral</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Standard Escrow
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Default Deposit Multiplier (Months)
                    </label>
                    <input
                      type="number"
                      placeholder="6"
                      value={defaultSecurityDepositMonths || 6}
                      onChange={(e) => setDefaultSecurityDepositMonths(Number(e.target.value) || 6)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Held in Bank Escrow / BG</span>
                    <span className="font-semibold text-slate-500">Standard 6 Months</span>
                  </div>
                </div>
              </div>

              {/* Optional Broker Discovery Toggle (Subtle / Secondary) */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Globe size={16} className={syndicateToMarketplace ? "text-[#0F8B7D]" : "text-slate-400"} />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Optional: Allow Verified IPC Broker Discovery for Unleased Space
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Leave disabled for 100% confidential internal rent roll operation. Enable only if you wish to receive tenant broker leads for vacant units.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={syndicateToMarketplace}
                  onClick={() => setSyndicateToMarketplace(!syndicateToMarketplace)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-end sm:self-center ${
                    syndicateToMarketplace ? "bg-[#0F8B7D]" : "bg-slate-200"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      syndicateToMarketplace ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Master Summary Card / Pre-Flight Audit Dossier */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-pulse" />
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Institutional Asset Dossier Pre-Flight Audit
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-[#0F8B7D]">
                    Grade {grade} • {propertyType.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                    {operationalStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Basic specs */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Property Name</span>
                  <strong className="text-slate-900 text-xs block truncate mt-0.5">{assetName || "Untitled Asset"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Property Code</span>
                  <strong className="text-slate-900 text-xs font-mono block mt-0.5">{propertyCode || "-"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Super Area</span>
                  <strong className="text-slate-900 text-xs font-mono block mt-0.5">{totalChargeableArea.toLocaleString()} {areaLabel}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Carpet Area (Loading)</span>
                  <strong className="text-slate-900 text-xs font-mono block mt-0.5">
                    {totalCarpetArea ? `${totalCarpetArea.toLocaleString()} ${areaLabel}` : "—"} ({loadingPct}%)
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Towers &amp; Stacking</span>
                  <strong className="text-slate-900 text-xs font-mono block mt-0.5">
                    {!hasMultipleTowers ? "Single Building (Main)" : `${towers.length} Towers / Wings`}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Inventory Defined</span>
                  <strong className="text-slate-900 text-xs font-mono block mt-0.5">
                    {units.length} Units ({units.reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel})
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Unit &amp; Currency</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">
                    {areaUnit === "sqm" ? "Sq. Meters" : "Sq. Feet"} • {currency}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Geo Coordinates</span>
                  <span className="text-slate-800 font-mono text-[11px] block mt-0.5">
                    {geoLat && geoLng ? `${geoLat}, ${geoLng}` : "Not pinned"}
                  </span>
                </div>

                {/* Legal & Tax Credentials Box */}
                <div className="col-span-2 sm:col-span-4 p-4 rounded-xl bg-white border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-[#0F8B7D]" />
                      Ownership Constitution &amp; Statutory Credentials
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold uppercase">
                      {entityType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* 1. Corporate Identification */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] font-medium">
                        {(entityType === "pvt_ltd" || entityType === "public_ltd")
                          ? "Corporate ID (CIN)"
                          : entityType === "llp"
                          ? "LLPIN Identifier"
                          : "MCA Corporate Status"}
                      </span>
                      <strong className="text-slate-900 text-xs font-mono block truncate mt-0.5">
                        {(entityType === "pvt_ltd" || entityType === "public_ltd")
                          ? (cinNumber || "—")
                          : entityType === "llp"
                          ? (llpinNumber || "—")
                          : entityType === "trust_reit"
                          ? (cinNumber || "Trust Registered")
                          : "Exempt (No MCA CIN)"}
                      </strong>
                    </div>

                    {/* 2. Income Tax PAN */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] font-medium">Income Tax PAN (Sec 194-I)</span>
                      <strong className="text-slate-900 text-xs font-mono block mt-0.5">
                        {panNumber || "—"}
                      </strong>
                    </div>

                    {/* 3. GSTIN */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] font-medium">GSTIN (18% Commercial Rent)</span>
                      <strong className="text-slate-900 text-xs font-mono block truncate mt-0.5">
                        {gstExempted || (!propertyGstin && (entityType === "proprietorship" || entityType === "partnership" || entityType === "individual"))
                          ? "Unregistered (Tenant RCM Applies)"
                          : propertyGstin || "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">GST Jurisdiction &amp; Location</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">
                    {address ? `${address}, ` : ""}{city}, {state} ({pincode})
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-4 p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Invoicing SPV Entity</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">
                    {selectedSpvId === "custom" ? customSpvName || "Custom SPV" : spvs.find(s => s.id === selectedSpvId)?.spvName || "Default Entity"}
                    {` (${selectedSpvId === "custom" ? customSpvGstin || "No GSTIN" : spvs.find(s => s.id === selectedSpvId)?.gstin || "No GSTIN"})`}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-4 p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
                    <span>
                      OC: <strong className="text-slate-900">{occupancyCertStatus.replace("_", " ").toUpperCase()}</strong> {ocSanctionNumber ? `(${ocSanctionNumber})` : ""}
                    </span>
                    <span>•</span>
                    <span>
                      Fire NOC: <strong className="text-slate-900">{fireNocValidUntil || "Not specified"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Sanctioned Plan: <strong className="text-slate-900">{sanctionedPlanRef || "Not specified"}</strong>
                    </span>
                  </div>
                  <span className="text-[#0F8B7D] font-bold flex items-center gap-1.5 self-start sm:self-auto">
                    <FileText size={14} />
                    {uploadedDocs.length} Compliance Documents in Vault
                  </span>
                </div>
              </div>

              {/* Legal Confirmation Notice */}
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-start gap-2.5 text-[11px] text-teal-900">
                <Info size={15} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                <span>
                  <strong>Master Attestation:</strong> By registering this commercial asset, the property owner/asset manager confirms that all declared leasable floor boundaries, municipal approvals, and tax identifiers conform to statutory town planning guidelines and the commercial lease deed registry.
                </span>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Area &amp; Space Inventory
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRegisterProperty}
                className="px-8 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Registering Commercial Asset...</>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Register Commercial Asset Master
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── BULK IMPORT MODAL (CSV / EXCEL / MAPPING / TEMPLATE) ── */}
        <BulkImportSpaceModal
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImportUnits}
          towers={towers}
          defaultTowerCode={towers[0]?.code || "T1"}
          defaultTargetRent={targetRentPsf}
          propertyCode={propertyCode}
          areaLabel={areaLabel}
          currentUnitCount={units.length}
        />

        {/* ── SUCCESS MODAL / REDIRECT ── */}
        {successProperty && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 text-center max-h-[92vh] overflow-y-auto">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F8B7D] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Commercial Asset Master Registered!</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {assetName} ({propertyCode || successProperty.id})
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  The property, building towers, and leasable floor inventory are registered into your institutional rent roll database.
                </p>
              </div>

              {/* Quick Summary Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Area</span>
                  <strong className="text-xs font-mono font-black text-slate-900 block mt-0.5">
                    {totalChargeableArea.toLocaleString()} {areaLabel}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Units</span>
                  <strong className="text-xs font-mono font-black text-slate-900 block mt-0.5">
                    {units.length} Suites
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Leases</span>
                  <strong className="text-xs font-mono font-black text-[#0F8B7D] block mt-0.5">
                    {units.filter(u => u.status === "occupied").length} Contracted
                  </strong>
                </div>
              </div>

              {/* Office Marketplace Live Listing Confirmation */}
              {syndicateToMarketplace && units.some(u => u.status === "vacant") && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-left flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">Unleased Space Listed on Office Marketplace</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                        Live Syndication
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Your unleased vacant inventory ({units.filter(u => u.status === "vacant").reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel}) is now actively showcased on the public Office Marketplace for prospective tenant inquiries.
                    </p>
                  </div>
                </div>
              )}

              {/* Tenant Onboarding & WhatsApp Sharing Card with Unit Selector */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 border border-teal-200/90 text-left space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0F8B7D] flex items-center justify-center">
                      <Share2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Tenant Onboarding &amp; WhatsApp Link Sharing</h4>
                      <p className="text-[11px] text-slate-500">Send tailored onboarding invite to tenants for their specific floor or units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedShareUnits(units.map(u => u.suiteNumber || u.spaceCode || ""))}
                      className="text-[10px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedShareUnits([])}
                      className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Unit / Floor Multi-select Checkboxes */}
                {units.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                      Select Unit(s) to Send (Floor / Unit Specific):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white/70 rounded-xl border border-teal-100">
                      {units.map((u) => {
                        const unitCode = u.suiteNumber || u.spaceCode || "Unit";
                        const isChecked = selectedShareUnits.includes(unitCode);
                        return (
                          <label
                            key={u.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-white border-[#0F8B7D] shadow-2xs font-bold text-slate-900"
                                : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedShareUnits(prev => [...prev, unitCode]);
                                } else {
                                  setSelectedShareUnits(prev => prev.filter(c => c !== unitCode));
                                }
                              }}
                              className="rounded text-[#0F8B7D] focus:ring-[#0F8B7D] w-3.5 h-3.5 shrink-0"
                            />
                            <div className="truncate">
                              <span className="block truncate text-[11px] font-bold">{unitCode}</span>
                              <span className="text-[9px] text-slate-400 font-normal">Floor {u.floorNumber} • {u.chargeableArea} {areaLabel}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Generated URL Box + WhatsApp & Copy Buttons */}
                {(() => {
                  const propId = successProperty.id || propertyCode || "PROP-DEFAULT";
                  const unitsParam = selectedShareUnits.length > 0 ? selectedShareUnits.join(",") : "all";
                  const origin = "https://www.officex.pro";
                  const shareUrl = `${origin}/tenant/join?propertyId=${encodeURIComponent(propId)}&building=${encodeURIComponent(assetName)}&units=${encodeURIComponent(unitsParam)}&location=${encodeURIComponent(`${city}, ${state}`)}`;
                  
                  const selectedUnitsDisplay = selectedShareUnits.length > 0 ? selectedShareUnits.join(", ") : "All Leasable Units";
                  const whatsappMsg = `🏢 *Commercial Lease Onboarding - ${assetName}*\n📍 *Location:* ${city}, ${state}\n🚪 *Allocated Units:* ${selectedUnitsDisplay}\n\nPlease complete your tenant onboarding KYC and digital lease verification to connect directly to your Tenant Dashboard using the secure link below:\n${shareUrl}\n\n*Tenant Dashboard:* Once verified, you will immediately get access to view active lease terms, invoices, and payment receipts.`;

                  const handleWhatsAppShare = () => {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
                  };

                  const handleCopyLink = () => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  };

                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700 select-all focus:outline-none focus:border-[#0F8B7D]"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <MessageSquare size={15} />
                        <span>Share Tenant Link via WhatsApp ({selectedShareUnits.length > 0 ? `${selectedShareUnits.length} Units Selected` : "Entire Property"})</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/properties/rent-roll")}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet size={15} /> Open Live Rent Roll
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/properties/registry")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 size={15} /> Open Property Registry
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

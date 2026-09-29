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
  FileSpreadsheet
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
  seatCapacity: number;
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
    securityDepositMonths: 6
  });

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
      securityDepositMonths: unit.securityDepositMonths || 6
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
      securityDepositMonths: 6
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
            securityDepositMonths: Number(newUnit.securityDepositMonths) || 6
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
        securityDepositMonths: 6
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
      securityDepositMonths: Number(newUnit.securityDepositMonths) || 6
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
      securityDepositMonths: 6
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

  const handleCreateSingleBuildingUnit = () => {
    const bldgCode = towers[0]?.code || "T1";
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";
    const area = totalChargeableArea > 0 ? totalChargeableArea : 10000;
    const carpet = totalCarpetArea > 0 && totalCarpetArea <= area ? totalCarpetArea : Math.round(area * 0.75);

    const fullUnit: LeasableSpaceUnit = {
      id: `u-${Date.now()}`,
      spaceCode: `${propPrefix}-${bldgCode}-01-01`,
      suiteNumber: `${assetName ? assetName.trim() : "Main Building"} (Entire Premise)`,
      buildingCode: bldgCode,
      floorNumber: 1,
      spaceType: "office",
      chargeableArea: area,
      carpetArea: carpet,
      askingRate: targetRentPsf || 150,
      seatCapacity: 0,
      fitoutCondition: "warm_shell",
      status: "vacant"
    };

    setUnits([fullUnit]);
    setTotalChargeableArea(area);
    setTotalCarpetArea(carpet);
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
  const [fireNocValidUntil, setFireNocValidUntil] = useState<string>("");
  const [sanctionedPlanRef, setSanctionedPlanRef] = useState<string>("");
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
        pincode: pincode.trim(),
        totalArea: totalChargeableArea,
        chargeableArea: totalChargeableArea,
        carpetArea: totalCarpetArea,
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
          fireNocValidUntil,
          sanctionedPlanRef,
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

      // 2. Also post to general properties DB table for cross-platform availability
      try {
        await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            totalArea: totalChargeableArea
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
          const calcVacantArea = Math.max(0, totalChargeableArea - calcOccupiedArea);
          const calcOccupancyPct = totalChargeableArea > 0 ? Math.round((calcOccupiedArea / totalChargeableArea) * 1000) / 10 : 0;
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
            pincode: pincode.trim(),
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
            totalArea: totalChargeableArea,
            chargeableArea: totalChargeableArea,
            carpetArea: totalCarpetArea,
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

              {/* Quick Sample Credentials Presets Bar */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-teal-950 font-bold text-[11px]">
                  <Sparkles size={14} className="text-[#0F8B7D] shrink-0" />
                  <span>Quick Test Presets (1-Click Auto-Fill):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEntityType("pvt_ltd");
                      setCinNumber("U70102MH2018PTC123456");
                      setPanNumber("AAACR1234F");
                      setPropertyGstin("27AAACR1234F1Z5");
                      setGstExempted(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-900 text-[10px] font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    Sample Pvt Ltd
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntityType("public_ltd");
                      setCinNumber("L17110MH1973PLC019786");
                      setPanNumber("AABCP9876K");
                      setPropertyGstin("27AABCP9876K1Z8");
                      setGstExempted(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-900 text-[10px] font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    Sample Public Ltd
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntityType("llp");
                      setLlpinNumber("AAA-1234");
                      setPanNumber("AABFL5432M");
                      setPropertyGstin("27AABFL5432M1Z2");
                      setGstExempted(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-900 text-[10px] font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    Sample LLP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntityType("individual");
                      setPanNumber("BNZPJ8765A");
                      setPropertyGstin("");
                      setGstExempted(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-900 text-[10px] font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    Sample Individual (Exempt)
                  </button>
                </div>
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
                      <button
                        type="button"
                        onClick={() => setCinNumber("U70102MH2018PTC123456")}
                        className="text-[#0F8B7D] hover:underline font-mono font-bold cursor-pointer text-[10px]"
                      >
                        + Use: U70102MH2018PTC123456
                      </button>
                    ) : entityType === "llp" ? (
                      <button
                        type="button"
                        onClick={() => setLlpinNumber("AAA-1234")}
                        className="text-[#0F8B7D] hover:underline font-mono font-bold cursor-pointer text-[10px]"
                      >
                        + Use: AAA-1234
                      </button>
                    ) : (
                      <span>Non-corporate title deed</span>
                    )}
                    {(entityType === "pvt_ltd" || entityType === "public_ltd") && (
                      <a
                        href="https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#0F8B7D] hover:underline flex items-center gap-0.5"
                      >
                        MCA Portal <ExternalLink size={10} />
                      </a>
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
                    <button
                      type="button"
                      onClick={() => {
                        setPanNumber("AAACR1234F");
                        if (!propertyGstin || propertyGstin.startsWith("27")) {
                          setPropertyGstin("27AAACR1234F1Z5");
                        }
                      }}
                      className="text-[#0F8B7D] hover:underline font-mono font-bold cursor-pointer text-[10px]"
                    >
                      + Use: AAACR1234F
                    </button>
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
                      <button
                        type="button"
                        onClick={() => {
                          const cleanP = panNumber.trim().toUpperCase() || "AAACR1234F";
                          setPropertyGstin(`27${cleanP}1Z5`);
                        }}
                        className="text-[#0F8B7D] hover:underline font-mono font-bold cursor-pointer text-[10px]"
                      >
                        + Match PAN (27{panNumber || "PAN"}1Z5)
                      </button>
                      <a
                        href="https://services.gst.gov.in/services/searchtp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#0F8B7D] hover:underline flex items-center gap-0.5"
                      >
                        GST Portal <ExternalLink size={10} />
                      </a>
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-[#0F8B7D]" />
                2. Area Metrics &amp; Leasable Floor Inventory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish Chargeable Area, Carpet Area, Loading Factor, and individual leasable suites ready for tenant lease contracting.
              </p>
            </div>

            {/* 1. Building Commercial Benchmarks & Total Portfolio Area */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={14} className="text-[#0F8B7D]" />
                    Building Master Commercial Rates &amp; Area Totals
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {units.length > 0
                      ? `Leasable areas are automatically summed from your ${units.length} unit(s) below.`
                      : "Set baseline rent rates and add leasable units below (or use the whole-building shortcut)."}
                  </p>
                </div>

                {units.length === 0 && (
                  <button
                    type="button"
                    onClick={handleCreateSingleBuildingUnit}
                    className="px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <Sparkles size={13} className="text-[#0F8B7D]" />
                    <span>Single Unit: Lease Entire Building as 1 Suite</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Chargeable Area */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Total Leasable Area *</label>
                    {units.length > 0 && (
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">
                        Auto-Summed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder={units.length > 0 ? String(totalChargeableArea) : "e.g. 50,000"}
                      value={totalChargeableArea || ""}
                      onChange={(e) => setTotalChargeableArea(Number(e.target.value) || 0)}
                      readOnly={units.length > 0}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                        units.length > 0
                          ? "border-teal-200 bg-teal-50/50 text-teal-950 focus:outline-none"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{areaLabel}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {units.length > 0 ? `Total of ${units.length} suite(s) below` : "Building super built-up area"}
                  </p>
                </div>

                {/* Total Carpet / Usable Area */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Total Carpet Area *</label>
                    {units.length > 0 && (
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">
                        Auto-Summed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder={units.length > 0 ? String(totalCarpetArea) : "e.g. 37,500"}
                      value={totalCarpetArea || ""}
                      onChange={(e) => setTotalCarpetArea(Number(e.target.value) || 0)}
                      readOnly={units.length > 0}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                        units.length > 0
                          ? "border-teal-200 bg-teal-50/50 text-teal-950 focus:outline-none"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{areaLabel}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {units.length > 0 ? `Sum of internal usable areas` : "Internal usable area"}
                  </p>
                </div>

                {/* Target Rent Rate */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Baseline Target Rent</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={targetRentPsf || ""}
                      onChange={(e) => setTargetRentPsf(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{currency === "USD" ? "$" : "₹"}/{areaUnit === "sqm" ? "sqm" : "sqft"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Default asking rate for suites</p>
                </div>

                {/* Standard CAM Rate */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Standard CAM Rate</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="e.g. 22"
                      value={standardCamPsf || ""}
                      onChange={(e) => setStandardCamPsf(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{currency === "USD" ? "$" : "₹"}/{areaUnit === "sqm" ? "sqm" : "sqft"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Common Area Maintenance</p>
                </div>
              </div>

              {/* Computed Loading Ratio Bar & Validation */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Computed Loading Ratio:</span>
                  <span className="text-sm font-black font-mono text-slate-900">
                    {hasCarpetExceedsSuper ? "Invalid" : `${loadingPct}%`}
                  </span>
                </div>

                <div>
                  {hasCarpetExceedsSuper ? (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle size={13} />
                      Carpet Area ({totalCarpetArea.toLocaleString()}) cannot be greater than Super Area ({totalChargeableArea.toLocaleString()})
                    </span>
                  ) : loadingPct > 0 ? (
                    <span className={`text-[11px] font-bold ${loadingPct >= 15 && loadingPct <= 50 ? "text-emerald-700" : "text-amber-700"}`}>
                      {loadingPct >= 15 && loadingPct <= 50
                        ? `✓ Standard institutional loading (${loadingPct}%)`
                        : `ℹ Loading factor ${loadingPct}% (Typical institutional range is 20%–40%)`}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Calculated automatically from (Super Area − Carpet Area) ÷ Carpet Area
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* 2. LEASABLE SUITES & FLOOR INVENTORY */}
              <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-teal-900 flex items-center gap-1.5 uppercase tracking-wider">
                      {editingUnitId ? (
                        <>
                          <Edit3 size={15} className="text-[#0F8B7D]" /> Editing Leasable Unit: {newUnit.suiteNumber}
                        </>
                      ) : (
                        <>
                          <Plus size={15} className="text-[#0F8B7D]" /> Add Leasable Suite / Demised Unit
                        </>
                      )}
                    </span>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Enter each demised suite or floor. Each unit&apos;s area automatically adds to the building&apos;s total leasable area above.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingUnitId ? (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowBulkImport(true)}
                        className="px-2.5 py-1 rounded-lg border border-teal-300 bg-white text-teal-800 text-[11px] font-bold hover:bg-teal-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileUp size={12} /> Bulk Import (CSV)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Suite / Unit Identifier *</label>
                    <input
                      type="text"
                      placeholder="e.g. Suite 402 or Floor 2"
                      value={newUnit.suiteNumber || ""}
                      onChange={(e) => setNewUnit({ ...newUnit, suiteNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Tower / Block</label>
                    <select
                      value={newUnit.buildingCode}
                      onChange={(e) => setNewUnit({ ...newUnit, buildingCode: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      {towers.length > 0 ? (
                        towers.map(t => (
                          <option key={t.id} value={t.code}>{t.name} ({t.code})</option>
                        ))
                      ) : (
                        <option value="T1">Tower 1 (Default)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Floor #</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={newUnit.floorNumber || ""}
                      onChange={(e) => setNewUnit({ ...newUnit, floorNumber: Number(e.target.value) || 1 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Demised Space Type *</span>
                      <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        Unit Function
                      </span>
                    </label>
                    <select
                      value={newUnit.spaceType}
                      onChange={(e) => setNewUnit({ ...newUnit, spaceType: e.target.value as any })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      <option value="office">Commercial Office Suite</option>
                      <option value="retail">Ground Retail Storefront / ATM</option>
                      <option value="food_court">Food Court / Cafeteria / F&amp;B</option>
                      <option value="storage">Storage / Archive / Server Room</option>
                      <option value="parking_block">Dedicated Parking Bay / Stacks</option>
                      <option value="terrace">Terrace / Rooftop Lounge</option>
                      <option value="antenna_site">Telecom / Antenna / Tower Site</option>
                      <option value="flex_floor">Flex Floor / Coworking Floor</option>
                      <option value="cabin">Executive Private Cabin</option>
                      <option value="meeting_room">Conference / Board Room</option>
                      <option value="other">Other Leasable Space</option>
                    </select>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Specific demised use inside this {propertyType === "it_park" ? "Tech Park" : propertyType === "retail" ? "Retail Mall" : "Building"}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Unit Super Area ({areaLabel}) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={newUnit.chargeableArea || ""}
                      onChange={(e) => {
                        const chg = Number(e.target.value) || 0;
                        setNewUnit({
                          ...newUnit,
                          chargeableArea: chg,
                          carpetArea: newUnit.carpetArea ? newUnit.carpetArea : Math.round(chg * 0.75)
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Carpet Area ({areaLabel})</label>
                    <input
                      type="number"
                      placeholder="e.g. 3750"
                      value={newUnit.carpetArea || ""}
                      onChange={(e) => setNewUnit({ ...newUnit, carpetArea: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Fitout Condition</label>
                    <select
                      value={newUnit.fitoutCondition}
                      onChange={(e) => setNewUnit({ ...newUnit, fitoutCondition: e.target.value as any })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      <option value="warm_shell">Warm Shell (HVAC + Screed)</option>
                      <option value="bare_shell">Bare Shell (Raw Structure)</option>
                      <option value="fully_fitted">Fully Fitted (Furnished)</option>
                      <option value="plug_and_play">Plug & Play (Immediate Occupancy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Rent Roll Space Status</label>
                    <select
                      value={newUnit.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value as any;
                        setNewUnit({
                          ...newUnit,
                          status: nextStatus,
                          // If switching to occupied, default asking rate to contracted rent or targetRentPsf
                          contractedRentPsf: newUnit.contractedRentPsf || newUnit.askingRate || targetRentPsf || 0,
                          camRatePsf: newUnit.camRatePsf || standardCamPsf || 0
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      <option value="occupied">Occupied (Active Commercial Lease)</option>
                      <option value="vacant">Vacant (Available / Unleased)</option>
                      <option value="reserved">Reserved (Under LOI / Term Sheet)</option>
                      <option value="under_fitout">Under Fitout (Rent-Free Period)</option>
                      <option value="not_leasable">Building Services / Non-Leasable (BMS / MEP)</option>
                    </select>
                  </div>

                  {/* Dynamic Fields Based on Rent Roll Status */}
                  {newUnit.status === "occupied" && (
                    <div className="sm:col-span-4 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Users size={14} className="text-[#0F8B7D]" />
                          Contracted Tenant Lease Details (Client Rent Roll Spec)
                        </span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                          Active Lease Cashflow
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Tenant Entity / Corporate Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Morgan Stanley India Support Services"
                            value={newUnit.tenantName || ""}
                            onChange={(e) => setNewUnit({ ...newUnit, tenantName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Contracted Base Rent ({currency === "USD" ? "$" : "₹"}/{areaLabel}/mo) *
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 185"
                            value={newUnit.contractedRentPsf || ""}
                            onChange={(e) => setNewUnit({ ...newUnit, contractedRentPsf: Number(e.target.value) || 0, askingRate: Number(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            CAM Rate ({currency === "USD" ? "$" : "₹"}/{areaLabel}/mo)
                          </label>
                          <input
                            type="number"
                            placeholder={`e.g. ${standardCamPsf || 18}`}
                            value={newUnit.camRatePsf || ""}
                            onChange={(e) => setNewUnit({ ...newUnit, camRatePsf: Number(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Lease Start Date
                          </label>
                          <input
                            type="date"
                            value={newUnit.leaseStartDate || ""}
                            onChange={(e) => setNewUnit({ ...newUnit, leaseStartDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Lease Expiry Date *
                          </label>
                          <input
                            type="date"
                            value={newUnit.leaseExpiryDate || ""}
                            onChange={(e) => setNewUnit({ ...newUnit, leaseExpiryDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Contracted Escalation
                          </label>
                          <select
                            value={`${newUnit.escalationPct || 15}_every_${newUnit.escalationFrequencyYears || 3}`}
                            onChange={(e) => {
                              if (e.target.value === "5_every_1") {
                                setNewUnit({ ...newUnit, escalationPct: 5, escalationFrequencyYears: 1 });
                              } else if (e.target.value === "none") {
                                setNewUnit({ ...newUnit, escalationPct: 0, escalationFrequencyYears: 0 });
                              } else {
                                setNewUnit({ ...newUnit, escalationPct: 15, escalationFrequencyYears: 3 });
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          >
                            <option value="15_every_3">15% every 3 Years (Standard Institutional)</option>
                            <option value="5_every_1">5% Compounded Annually</option>
                            <option value="none">Fixed Rent (No Escalation)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Security Deposit (Months)
                          </label>
                          <input
                            type="number"
                            placeholder="6"
                            value={newUnit.securityDepositMonths || 6}
                            onChange={(e) => setNewUnit({ ...newUnit, securityDepositMonths: Number(e.target.value) || 6 })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {newUnit.status === "vacant" && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Target Market Asking Rate ({currency === "USD" ? "$" : "₹"}/{areaLabel}/mo)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 165"
                          value={newUnit.askingRate || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, askingRate: Number(e.target.value) || 0, contractedRentPsf: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block">Used for building Vacancy Loss KPI</span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Seat Capacity (Flex / Cabins)</label>
                        <input
                          type="number"
                          placeholder="e.g. 24"
                          value={newUnit.seatCapacity || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, seatCapacity: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>
                    </>
                  )}

                  {newUnit.status === "reserved" && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Prospective Tenant (LOI / Term Sheet)</label>
                        <input
                          type="text"
                          placeholder="e.g. Deloitte Shared Services (Under Legal Draft)"
                          value={newUnit.tenantName || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, tenantName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Agreed Rent PSF</label>
                        <input
                          type="number"
                          placeholder="e.g. 175"
                          value={newUnit.askingRate || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, askingRate: Number(e.target.value) || 0, contractedRentPsf: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>
                    </>
                  )}

                  {newUnit.status === "under_fitout" && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Tenant Name (Fitout Period)</label>
                        <input
                          type="text"
                          placeholder="e.g. Boston Consulting Group"
                          value={newUnit.tenantName || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, tenantName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Rent Commencement Date</label>
                        <input
                          type="date"
                          value={newUnit.leaseStartDate || ""}
                          onChange={(e) => setNewUnit({ ...newUnit, leaseStartDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                        />
                      </div>
                    </>
                  )}

                  {newUnit.status === "not_leasable" && (
                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                      <Info size={15} className="text-slate-500 shrink-0" />
                      <span>Building core services, MEP/AHU shafts, and maintenance control rooms are excluded from chargeable rent roll calculations.</span>
                    </div>
                  )}

                  <div className="sm:col-span-4 flex items-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddUnit}
                      className="flex-1 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {editingUnitId ? (
                        <>
                          <Check size={14} /> Update Space Unit in Rent Roll
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add Space to Property Stacking
                        </>
                      )}
                    </button>
                    {editingUnitId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. LOWER SIDE: ADDED LEASABLE UNITS TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Master Rent Roll Leasable Inventory</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                      {units.length} Units Defined
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total Unit Area: {units.reduce((acc, u) => acc + u.chargeableArea, 0).toLocaleString()} {areaLabel}
                  </span>
                </div>

                {units.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs min-w-[850px]">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Space Code</th>
                          <th className="py-2.5 px-3">Unit / Suite</th>
                          <th className="py-2.5 px-3">Tower &amp; Floor</th>
                          <th className="py-2.5 px-3 text-right">Super Area</th>
                          <th className="py-2.5 px-3 text-right">Carpet</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3">Tenant &amp; Lease Financials</th>
                          <th className="py-2.5 px-3 text-center">Lease Expiry</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {units.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-teal-800 text-[10px]">{u.spaceCode || "-"}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{u.suiteNumber}</td>
                            <td className="py-2.5 px-3 text-slate-600 font-sans">{u.buildingCode} • Fl {u.floorNumber}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">{u.chargeableArea.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{u.carpetArea ? u.carpetArea.toLocaleString() : "-"}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                                u.status === "occupied"
                                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                                  : u.status === "vacant"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : u.status === "reserved"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : u.status === "under_fitout"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {u.status === "occupied"
                                  ? "Active Lease"
                                  : u.status === "vacant"
                                  ? "Unleased"
                                  : u.status === "reserved"
                                  ? "Under LOI"
                                  : u.status === "under_fitout"
                                  ? "Fitout Period"
                                  : "Services"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {u.status === "occupied" ? (
                                <div>
                                  <span className="font-bold text-slate-900 block truncate max-w-[220px]">{u.tenantName || "Occupied Tenant"}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {currency === "USD" ? "$" : "₹"}{u.contractedRentPsf || u.askingRate}/sf {u.camRatePsf ? `+ ₹${u.camRatePsf} CAM` : ""}
                                  </span>
                                </div>
                              ) : u.status === "vacant" ? (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Target: {currency === "USD" ? "$" : "₹"}{u.askingRate || targetRentPsf || 0}/sf
                                </span>
                              ) : u.status === "reserved" ? (
                                <span className="text-[11px] text-amber-800 font-medium font-sans">
                                  LOI: {u.tenantName || "Term Sheet Stage"}
                                </span>
                              ) : u.status === "under_fitout" ? (
                                <span className="text-[11px] text-blue-800 font-medium font-sans">
                                  Fitout: {u.tenantName || "Contractor Active"}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Non-revenue space</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-600">
                              {u.status === "occupied" && u.leaseExpiryDate ? (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                                  {u.leaseExpiryDate}
                                </span>
                              ) : u.status === "under_fitout" && u.leaseStartDate ? (
                                <span className="text-blue-700">Starts {u.leaseStartDate}</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditUnit(u)}
                                  className="text-slate-400 hover:text-teal-700 transition-colors p-1 cursor-pointer"
                                  title="Edit Unit"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUnit(u.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                  title="Remove Unit"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600">No leasable units defined yet.</p>
                    <p className="text-[11px]">
                      Enter a unit/suite identifier above and click <strong>&ldquo;+ Add Unit to Inventory&rdquo;</strong>, or use <strong>&ldquo;Bulk Import (CSV)&rdquo;</strong> to paste multiple floors at once.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back to Asset &amp; Towers
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
                <span>Continue to Statutory Clearances &amp; Review</span>
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
                    Step 3 of 3 • Master Verification
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Final Pre-Commissioning Audit
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#0F8B7D]" />
                  Statutory Building Clearances &amp; Master Review
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record municipal permits, fire clearance validity, attach legal title deeds, and review the master rent roll ledger before commissioning.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>Ready to Commission</span>
                </div>
              </div>
            </div>

            {/* 1. Municipal Clearances & Statutory Approvals */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center border border-teal-100/80 shadow-2xs">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Municipal Permits &amp; Statutory NOC Clearances
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verified statutory permits required for legal tenant occupancy, fitout approvals, and lease registration.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 self-start sm:self-auto">
                  Municipal Registry
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Occupancy Certificate (OC) Card */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                        <Building size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Occupancy Certificate (OC) *</span>
                        <span className="text-[10px] text-slate-400">Urban Local Body Approval</span>
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
                      In Audit
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

                  {/* Dynamic Reference Input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      {occupancyCertStatus === "issued"
                        ? "OC Sanction Ref / Municipal Order"
                        : occupancyCertStatus === "in_progress"
                        ? "Inward Application File No."
                        : "Provisional OC Sanction Ref"}
                    </label>
                    <input
                      type="text"
                      value={ocSanctionNumber}
                      onChange={(e) => setOcSanctionNumber(e.target.value)}
                      placeholder={
                        occupancyCertStatus === "issued"
                          ? "e.g. BMC/EB/6211/WS/OC"
                          : occupancyCertStatus === "in_progress"
                          ? "e.g. INW/2026/MCGM/891"
                          : "e.g. BBMP/POC/2025/112"
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-600" />
                      Tenant fitout prerequisite
                    </span>
                    <span className="font-semibold text-slate-500">Sec 353 Municipal Act</span>
                  </div>
                </div>

                {/* 2. Fire Safety NOC Card */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center">
                        <Flame size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Fire Safety NOC Validity</span>
                        <span className="text-[10px] text-slate-400">Chief Fire Officer (CFO)</span>
                      </div>
                    </div>
                    {(() => {
                      const st = getFireNocStatus();
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      NOC Expiry Date
                    </label>
                    <input
                      type="date"
                      value={fireNocValidUntil}
                      onChange={(e) => setFireNocValidUntil(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Sets:</span>
                    <button
                      type="button"
                      onClick={() => handleSetFireNocPreset(1)}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#0F8B7D] hover:text-[#0F8B7D] transition-colors shadow-2xs cursor-pointer"
                    >
                      +1 Year (Annual)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetFireNocPreset(3)}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#0F8B7D] hover:text-[#0F8B7D] transition-colors shadow-2xs cursor-pointer"
                    >
                      +3 Years (High-Rise)
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Fire Prevention &amp; Life Safety Act</span>
                    <span className="font-semibold text-slate-500">Annual CFO Audit</span>
                  </div>
                </div>

                {/* 3. Sanctioned Plan / Blueprint */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3.5 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#0F8B7D] flex items-center justify-center">
                        <FileText size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Sanctioned Blueprint Ref</span>
                        <span className="text-[10px] text-slate-400">IOD &amp; Commencement Cert</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Town Planning
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Building Sanction / IOD Order Number
                    </label>
                    <input
                      type="text"
                      value={sanctionedPlanRef}
                      onChange={(e) => setSanctionedPlanRef(e.target.value)}
                      placeholder="e.g. BMC/BP/2024/991/IOD"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]/20 shadow-2xs"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/70 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700 block">Approved Issuing Authority:</span>
                    Municipal Corp / DTCP / HMDA / BBMP Town Planning
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Structural Stability Certified</span>
                    <span className="font-semibold text-slate-500">FAR / FSI Compliant</span>
                  </div>
                </div>
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 text-center">
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
                  onClick={() => router.push("/properties")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 size={15} /> Property Master
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

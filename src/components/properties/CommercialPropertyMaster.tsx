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
  Download,
  FileUp
} from "lucide-react";
import {
  AddressAutocomplete,
  CityAutocomplete,
  StateAutocomplete
} from "@/components/ui/LocationInputs";

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
}

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

interface BillingSpvOption {
  id: string;
  spvName: string;
  gstin: string;
  state: string;
}

export default function CommercialPropertyMaster() {
  const router = useRouter();

  // Step 1: Asset & SPV Master
  // Step 2: Towers & Stacking Plan
  // Step 3: Leasable Units & Area Breakdown
  // Step 4: Statutory Asset Clearances & Final Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
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

  // ──── 2. BUILDING & TOWERS MASTER (Building Master) ────
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

  // ──── 3. LEASABLE SPACE & INVENTORY (Space Master) ────
  const [totalChargeableArea, setTotalChargeableArea] = useState<number>(0);
  const [totalCarpetArea, setTotalCarpetArea] = useState<number>(0);
  const [targetRentPsf, setTargetRentPsf] = useState<number>(0);
  const [standardCamPsf, setStandardCamPsf] = useState<number>(0);

  // Area unit label helper
  const areaLabel = areaUnit === "sqm" ? "sq. m." : "sq. ft.";

  // Initial unit breakdown starts completely empty (no mock data)
  const [units, setUnits] = useState<LeasableSpaceUnit[]>([]);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");

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
    status: "vacant"
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
      status: unit.status
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
      status: "vacant"
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
            askingRate: Number(newUnit.askingRate) || targetRentPsf || 0,
            seatCapacity: Number(newUnit.seatCapacity) || 0,
            fitoutCondition: (newUnit.fitoutCondition as any) || "warm_shell",
            status: (newUnit.status as any) || "vacant"
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
        status: "vacant"
      });
      return;
    }

    // Auto-generate space code: PROPCODE-BLDGCODE-FLOOR-SEQ (e.g. OBKC-T1-03-01)
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";
    const spaceCode = `${propPrefix}-${bldgCode}-${String(floorNum).padStart(2, "0")}-${String(units.length + 1).padStart(2, "0")}`;

    const created: LeasableSpaceUnit = {
      id: `u-${Date.now()}`,
      spaceCode,
      suiteNumber: newUnit.suiteNumber.trim(),
      buildingCode: bldgCode,
      floorNumber: floorNum,
      spaceType: (newUnit.spaceType as any) || "office",
      chargeableArea: unitArea,
      carpetArea: Number(newUnit.carpetArea) || 0,
      askingRate: Number(newUnit.askingRate) || targetRentPsf || 0,
      seatCapacity: Number(newUnit.seatCapacity) || 0,
      fitoutCondition: (newUnit.fitoutCondition as any) || "warm_shell",
      status: (newUnit.status as any) || "vacant"
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
      status: "vacant"
    });
  };

  const handleRemoveUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
    if (editingUnitId === id) {
      setEditingUnitId(null);
    }
  };

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) return;
    const lines = bulkImportText.trim().split("\n");
    const newUnitsList: LeasableSpaceUnit[] = [];
    const bldgFallback = towers[0]?.code || "T1";
    const propPrefix = propertyCode ? propertyCode.split("-")[0] : "SP";

    lines.forEach((line, idx) => {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length >= 2) {
        const suite = parts[0];
        const tower = parts[1] || bldgFallback;
        const floor = parseInt(parts[2], 10) || 1;
        const type = (parts[3] as any) || "office";
        const chargeable = parseFloat(parts[4]) || 0;
        const carpet = parseFloat(parts[5]) || Math.round(chargeable * 0.75);
        const rate = parseFloat(parts[6]) || targetRentPsf || 0;
        const stat = (parts[7] as any) || "vacant";
        const fitout = (parts[8] as any) || "warm_shell";
        const seats = parseInt(parts[9], 10) || 0;

        if (suite && chargeable > 0) {
          newUnitsList.push({
            id: `u-${Date.now()}-${idx}`,
            spaceCode: `${propPrefix}-${tower}-${String(floor).padStart(2, "0")}-${String(units.length + newUnitsList.length + 1).padStart(2, "0")}`,
            suiteNumber: suite,
            buildingCode: tower,
            floorNumber: floor,
            spaceType: type,
            chargeableArea: chargeable,
            carpetArea: carpet,
            askingRate: rate,
            seatCapacity: seats,
            fitoutCondition: fitout,
            status: stat
          });
        }
      }
    });

    if (newUnitsList.length > 0) {
      const nextUnits = [...units, ...newUnitsList];
      setUnits(nextUnits);
      const sumChg = nextUnits.reduce((a, b) => a + b.chargeableArea, 0);
      const sumCpt = nextUnits.reduce((a, b) => a + b.carpetArea, 0);
      if (totalChargeableArea === 0 || totalChargeableArea < sumChg) {
        setTotalChargeableArea(sumChg);
      }
      if (sumCpt > 0) {
        setTotalCarpetArea(sumCpt);
      }
      setBulkImportText("");
      setShowBulkImport(false);
    } else {
      alert("Could not parse any valid units. Format: Suite, Tower, Floor, Type, ChargeableArea, CarpetArea, AskingRate");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        uploadedAt: new Date().toLocaleDateString()
      });
    }
    setUploadedDocs(prev => [...prev, ...newDocs]);
    e.target.value = "";
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  // Loading Ratio Calculation
  const loadingPct = totalChargeableArea > 0 && totalCarpetArea > 0
    ? Math.round(((totalChargeableArea - totalCarpetArea) / totalCarpetArea) * 100)
    : 0;

  // ──── 4. STATUTORY CLEARANCES & SYNDICATION (Statutory Clearances) ────
  const [occupancyCertStatus, setOccupancyCertStatus] = useState<"issued" | "in_progress" | "provisional">("issued");
  const [fireNocValidUntil, setFireNocValidUntil] = useState<string>("");
  const [sanctionedPlanRef, setSanctionedPlanRef] = useState<string>("");
  const [syndicateToMarketplace, setSyndicateToMarketplace] = useState<boolean>(false);

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

      // Fallback default SPV from user org
      const orgName = localStorage.getItem("officex_user_org") || "Apex Commercial Holdings SPV";
      const orgGstin = localStorage.getItem("officex_user_gstin") || "27AABCA1234M1Z5";
      const fallbackSpv: BillingSpvOption = {
        id: "SPV-DEFAULT",
        spvName: orgName,
        gstin: orgGstin,
        state: "Maharashtra"
      };
      setSpvs([fallbackSpv]);
      setSelectedSpvId("SPV-DEFAULT");
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
            activeLeasesCount: 0,
            occupiedArea: 0,
            vacantArea: totalChargeableArea,
            occupancyPct: 0,
            totalMonthlyRent: 0,
            totalBilling: 0,
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

        {/* ── 4-STEP WIZARD PROGRESS RIBBON ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { num: 1, title: "Asset & SPV Master", subtitle: "Identity, Tax & Location" },
              { num: 2, title: "Towers & Stacking", subtitle: "Building Structures" },
              { num: 3, title: "Area & Space Inventory", subtitle: "Chargeable vs Carpet" },
              { num: 4, title: "Statutory & Review", subtitle: "Compliance & Confirmation" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num as any)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
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

        {/* ── STEP 1: ASSET & SPV MASTER (Standard Model) ── */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Briefcase size={18} className="text-[#0F8B7D]" />
                1. Asset Identity & Invoicing Entity
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish the legal identity, building grade, and associated tax entity for automated GST place-of-supply billing.
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
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="15-digit GSTIN (e.g. 27AABCA1234M1Z5)"
                    value={customSpvGstin}
                    onChange={(e) => setCustomSpvGstin(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                  />
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
                  <CityAutocomplete
                    label="City *"
                    value={city}
                    onChange={(val) => setCity(val)}
                    onSelectCityAndState={(cityName, stateName) => {
                      setCity(cityName);
                      if (stateName) setState(stateName);
                    }}
                  />

                  <StateAutocomplete
                    label="State (GST) *"
                    value={state}
                    onChange={(val) => setState(val)}
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

            {/* Footer Navigation */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (!assetName.trim()) {
                    alert("Please specify the Property / Asset Name.");
                    return;
                  }
                  if (!address.trim()) {
                    alert("Please provide the physical address.");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Towers & Stacking</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: TOWERS & STACKING PLAN (Building Master) ── */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building size={18} className="text-[#0F8B7D]" />
                  2. Building Towers & Stacking Structure
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Define the individual tower blocks, floors above/below ground, and super built-up allocations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTower}
                className="px-3.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Another Tower
              </button>
            </div>

            {towers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center mx-auto">
                  <Building size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">No Building Towers Configured</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Add the primary building tower or individual blocks (e.g. Tower A, North Wing, Podium) to configure floor stacking and super built-up allocations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTower}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add First Tower / Block
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {towers.map((tower, idx) => (
                  <div
                    key={tower.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#0F8B7D] text-white flex items-center justify-center text-[11px] font-black">
                          {tower.code || `T${idx+1}`}
                        </span>
                        Tower / Block {idx + 1}
                      </span>

                      {towers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTower(tower.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                        <label className="text-[11px] font-bold text-slate-700">Chargeable Area ({areaLabel}) *</label>
                        <input
                          type="number"
                          value={tower.chargeableArea || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const updated = towers.map(t => t.id === tower.id ? { ...t, chargeableArea: val } : t);
                            setTowers(updated);
                          }}
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
                        <label className="text-[11px] font-bold text-slate-700">Basements / Below Ground</label>
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

                      <div className="sm:col-span-2 p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Stacking Plan Height:</span>
                        <strong className="text-slate-900 font-mono">
                          {tower.floorsAbove} Upper + {tower.floorsBelow} Basements = {tower.floorsAbove + tower.floorsBelow} Levels
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Stacking Summary */}
            {towers.length > 0 && (
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-900">Total Asset Chargeable Area Across All Towers:</span>
                <span className="font-mono font-black text-sm text-teal-900">
                  {towers.reduce((sum, t) => sum + (t.chargeableArea || 0), 0).toLocaleString()} {areaLabel}
                </span>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (towers.length === 0) {
                    alert("Please add at least one tower or building block before proceeding.");
                    return;
                  }
                  const invalid = towers.find(t => !t.name.trim() || !t.code.trim());
                  if (invalid) {
                    alert("Please ensure all towers have a name and code.");
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Area & Leasable Spaces</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: AREA & LEASABLE INVENTORY (Space Master) ── */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-[#0F8B7D]" />
                3. Area Metrics & Leasable Floor Inventory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish Chargeable Area, Carpet Area, Loading Factor, and individual leasable suites ready for tenant lease contracting.
              </p>
            </div>

            {/* Benchmark Rates & Area Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Chargeable Super Area *</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="e.g. 50,000"
                    value={totalChargeableArea || ""}
                    onChange={(e) => setTotalChargeableArea(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">{areaLabel}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Carpet / Usable Area *</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="e.g. 35,000"
                    value={totalCarpetArea || ""}
                    onChange={(e) => setTotalCarpetArea(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">{areaLabel}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Target Rent Rate</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Standard CAM Rate</label>
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
              </div>

              {/* Computed Loading Ratio (Rule R-07 range 20% - 60%) */}
              <div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                <span className="text-slate-500">
                  Computed Loading Ratio: <strong className="text-slate-900 font-mono">{loadingPct}%</strong>
                </span>
                <span className={`text-[11px] font-bold ${loadingPct >= 20 && loadingPct <= 60 ? "text-emerald-700" : "text-amber-700"}`}>
                  {loadingPct > 0 ? (loadingPct >= 20 && loadingPct <= 60 ? "✓ Optimal institutional ratio (20%–60%)" : `⚠ Loading ratio (${loadingPct}%) outside standard 20%–60% benchmark`) : "Calculated from super vs carpet areas above"}
                </span>
              </div>

              {/* Rule R-03 Area Reconciliation */}
              {units.length > 0 && totalChargeableArea > 0 && (
                <div className={`col-span-2 sm:col-span-4 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea) / totalChargeableArea <= 0.005
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/80 border-amber-200 text-amber-900"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className={Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea) / totalChargeableArea <= 0.005 ? "text-emerald-600" : "text-amber-600"} />
                    <span>
                      <strong>Rule R-03 Area Reconciliation:</strong> Units sum = <strong>{units.reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel}</strong> vs Property Total = <strong>{totalChargeableArea.toLocaleString()} {areaLabel}</strong>.
                      {Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea) / totalChargeableArea <= 0.005
                        ? " (100% Reconciled within ±0.5% tolerance)"
                        : ` (Variance: ${Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea).toLocaleString()} ${areaLabel} • ${((Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea) / totalChargeableArea) * 100).toFixed(1)}%)`}
                    </span>
                  </div>
                  {Math.abs(units.reduce((s, u) => s + u.chargeableArea, 0) - totalChargeableArea) / totalChargeableArea > 0.005 && (
                    <button
                      type="button"
                      onClick={() => setTotalChargeableArea(units.reduce((s, u) => s + u.chargeableArea, 0))}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap self-start sm:self-auto cursor-pointer"
                    >
                      Sync Total Area
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* 1. UPPER SIDE: ADD / EDIT SPACE UNIT FORM */}
              <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-900 flex items-center gap-1.5 uppercase tracking-wider">
                    {editingUnitId ? (
                      <>
                        <Edit3 size={15} className="text-[#0F8B7D]" /> Editing Unit: {newUnit.suiteNumber}
                      </>
                    ) : (
                      <>
                        <Plus size={15} className="text-[#0F8B7D]" /> + Add Space Unit / Suite
                      </>
                    )}
                  </span>
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
                    <span className="text-[11px] text-teal-700 font-medium hidden sm:inline">
                      Add individual suites or floors to your leasable inventory below
                    </span>
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
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Space Type *</label>
                    <select
                      value={newUnit.spaceType}
                      onChange={(e) => setNewUnit({ ...newUnit, spaceType: e.target.value as any })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      <option value="office">Commercial Office</option>
                      <option value="retail">Retail Storefront</option>
                      <option value="food_court">Food Court / F&B</option>
                      <option value="storage">Storage / Archive</option>
                      <option value="parking_block">Parking Block / Bay</option>
                      <option value="terrace">Terrace / Rooftop</option>
                      <option value="antenna_site">Telecom / Antenna Site</option>
                      <option value="flex_floor">Flex Floor / Coworking</option>
                      <option value="cabin">Executive Cabin</option>
                      <option value="meeting_room">Meeting / Conference Room</option>
                      <option value="other">Other Leasable Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Chargeable Super Area ({areaLabel}) *</label>
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
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Inventory Status</label>
                    <select
                      value={newUnit.status}
                      onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value as any })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    >
                      <option value="vacant">Vacant (Available for Lease)</option>
                      <option value="occupied">Occupied (Leased)</option>
                      <option value="reserved">Reserved (Under LOI / Term Sheet)</option>
                      <option value="under_fitout">Under Fitout</option>
                      <option value="not_leasable">Not Leasable / Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Asking Rate ({currency === "USD" ? "$" : "₹"}/{areaUnit === "sqm" ? "sqm" : "sqft"})</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={newUnit.askingRate || ""}
                      onChange={(e) => setNewUnit({ ...newUnit, askingRate: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0F8B7D]"
                    />
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

                  <div className="sm:col-span-2 flex items-end gap-2">
                    <button
                      type="button"
                      onClick={handleAddUnit}
                      className="flex-1 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {editingUnitId ? (
                        <>
                          <Check size={14} /> Update Space Unit
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add Unit to Inventory
                        </>
                      )}
                    </button>
                    {editingUnitId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
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
                    <span>Leasable Units &amp; Floors</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                      {units.length} Units Defined
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total Unit Area: {units.reduce((acc, u) => acc + u.chargeableArea, 0).toLocaleString()} {areaLabel}
                  </span>
                </div>

                {units.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Space Code</th>
                          <th className="py-2.5 px-3">Unit Identifier</th>
                          <th className="py-2.5 px-3">Tower</th>
                          <th className="py-2.5 px-3">Floor</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Chargeable</th>
                          <th className="py-2.5 px-3 text-right">Carpet</th>
                          <th className="py-2.5 px-3 text-right">Asking Rate</th>
                          <th className="py-2.5 px-3">Fitout</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {units.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold text-teal-800 text-[10px]">{u.spaceCode || "-"}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{u.suiteNumber}</td>
                            <td className="py-2.5 px-3 text-slate-600">{u.buildingCode}</td>
                            <td className="py-2.5 px-3 text-slate-600">{u.floorNumber}</td>
                            <td className="py-2.5 px-3 text-slate-600 capitalize font-sans">{u.spaceType.replace("_", " ")}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">{u.chargeableArea.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">{u.carpetArea ? u.carpetArea.toLocaleString() : "-"}</td>
                            <td className="py-2.5 px-3 text-right text-slate-700">{u.askingRate ? `${currency === "USD" ? "$" : "₹"}${u.askingRate}` : "-"}</td>
                            <td className="py-2.5 px-3 text-slate-600 capitalize font-sans">{u.fitoutCondition.replace("_", " ")}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                                u.status === "vacant"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : u.status === "occupied"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : u.status === "reserved"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {u.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditUnit(u)}
                                  className="text-slate-400 hover:text-teal-700 transition-colors p-1"
                                  title="Edit Unit"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUnit(u.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
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
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Statutory Clearances & Review</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: STATUTORY ASSET COMPLIANCE & REVIEW ── */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                4. Statutory Building Clearances & Master Review
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record building statutory NOCs and confirm institutional master registration.
              </p>
            </div>

            {/* Statutory Clearances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Occupancy Certificate (OC) *</label>
                <select
                  value={occupancyCertStatus}
                  onChange={(e) => setOccupancyCertStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="issued">Issued / Fully Sanctioned</option>
                  <option value="in_progress">Applied / Pending Municipal Audit</option>
                  <option value="provisional">Provisional OC</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Fire Safety NOC Validity</label>
                <input
                  type="date"
                  value={fireNocValidUntil}
                  onChange={(e) => setFireNocValidUntil(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Sanctioned Plan / Approval Ref</label>
                <input
                  type="text"
                  value={sanctionedPlanRef}
                  onChange={(e) => setSanctionedPlanRef(e.target.value)}
                  placeholder="e.g. BMC/BP/2024/991"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Compliance & Property Documents Repository */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={15} className="text-[#0F8B7D]" />
                    Property Compliance &amp; Title Documents
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload official sanctions, fire NOCs, sanctioned layouts, or property deeds for institutional compliance.
                  </p>
                </div>
                <label className="px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-teal-800 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-50 cursor-pointer transition-colors shadow-2xs shrink-0">
                  <UploadCloud size={14} /> Attach Documents
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {uploadedDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {uploadedDocs.map(doc => (
                    <div key={doc.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={16} className="text-[#0F8B7D] shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800 block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.size} • Uploaded {doc.uploadedAt}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove Document"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 bg-white text-[11px] text-slate-400">
                  No documents attached yet. Attach your property sanctions, fire clearances, or property title deeds.
                </div>
              )}
            </div>

            {/* Optional Marketplace Syndication Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-teal-50/30 flex items-start gap-3">
              <input
                id="syndicateToggle"
                type="checkbox"
                checked={syndicateToMarketplace}
                onChange={(e) => setSyndicateToMarketplace(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-[#0F8B7D] focus:ring-[#0F8B7D] cursor-pointer"
              />
              <label htmlFor="syndicateToggle" className="cursor-pointer text-xs">
                <span className="font-bold text-slate-900 block">
                  Optional: Syndicate Vacant Spaces to OFFICEX Marketplace
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Check this box if you wish to receive leasing broker inquiries for your vacant inventory. Leave unchecked for private internal rent roll operation.
                </span>
              </label>
            </div>

            {/* Master Summary Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span>Asset Summary Pre-Registration</span>
                <span className="text-[#0F8B7D] font-mono">
                  Grade {grade} • {propertyType.toUpperCase()} ({operationalStatus.replace("_", " ").toUpperCase()})
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <span className="text-slate-500 block text-[10px]">Property Name</span>
                  <strong className="text-slate-900 text-xs">{assetName || "Untitled Asset"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Property Code</span>
                  <strong className="text-slate-900 text-xs font-mono">{propertyCode || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Chargeable Super Area</span>
                  <strong className="text-slate-900 text-xs font-mono">{totalChargeableArea.toLocaleString()} {areaLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Carpet Area (Loading)</span>
                  <strong className="text-slate-900 text-xs font-mono">
                    {totalCarpetArea ? `${totalCarpetArea.toLocaleString()} ${areaLabel}` : "—"} ({loadingPct}%)
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Towers &amp; Stacking</span>
                  <strong className="text-slate-900 text-xs font-mono">{towers.length} Towers / Blocks</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Inventory Defined</span>
                  <strong className="text-slate-900 text-xs font-mono">{units.length} Units ({units.reduce((s, u) => s + u.chargeableArea, 0).toLocaleString()} {areaLabel})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Unit &amp; Currency</span>
                  <span className="text-slate-800 font-semibold">{areaUnit === "sqm" ? "Sq. Meters" : "Sq. Feet"} • {currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Geo Coordinates</span>
                  <span className="text-slate-800 font-mono text-[11px]">{geoLat && geoLng ? `${geoLat}, ${geoLng}` : "Not pinned"}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">GST Jurisdiction &amp; Location</span>
                  <span className="text-slate-800 font-semibold">
                    {address ? `${address}, ` : ""}{city}, {state} ({pincode})
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Invoicing SPV Entity</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedSpvId === "custom" ? customSpvName || "Custom SPV" : spvs.find(s => s.id === selectedSpvId)?.spvName || "Default Entity"}
                    {` (${selectedSpvId === "custom" ? customSpvGstin || "No GSTIN" : spvs.find(s => s.id === selectedSpvId)?.gstin || "No GSTIN"})`}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-4 p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">
                    Clearances: <strong>OC: {occupancyCertStatus.replace("_", " ").toUpperCase()}</strong> • <strong>NOC: {fireNocValidUntil || "Not specified"}</strong> • <strong>Plan: {sanctionedPlanRef || "Not specified"}</strong>
                  </span>
                  <span className="text-teal-800 font-bold">
                    {uploadedDocs.length} Documents Attached
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRegisterProperty}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
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

        {/* ── BULK IMPORT MODAL (CSV / EXCEL) ── */}
        {showBulkImport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center">
                    <FileUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Bulk Import Space Units</h3>
                    <p className="text-[11px] text-slate-500">Paste comma-separated floor or suite inventory from Excel / CSV</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkImport(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600">Expected Format (CSV):</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `Suite 101, ${towers[0]?.code || "T1"}, 1, office, 5000, 3750, 150, vacant, warm_shell, 0\nSuite 102, ${towers[0]?.code || "T1"}, 1, retail, 2500, 2000, 220, vacant, bare_shell, 0\nSuite 201, ${towers[0]?.code || "T1"}, 2, office, 10000, 7500, 155, vacant, warm_shell, 0\nFloor 3, ${towers[0]?.code || "T1"}, 3, flex_floor, 8000, 6000, 160, vacant, fully_fitted, 60`;
                      setBulkImportText(sample);
                    }}
                    className="text-[#0F8B7D] hover:underline font-bold cursor-pointer"
                  >
                    + Insert Sample Template Rows
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Suite, TowerCode, FloorNumber, SpaceType, ChargeableArea, CarpetArea, AskingRate, Status, Fitout, Seats
                </p>

                <textarea
                  rows={6}
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  placeholder={`Suite 101, T1, 1, office, 5000, 3750, 150, vacant, warm_shell, 0\nSuite 102, T1, 1, retail, 2500, 2000, 220, vacant, bare_shell, 0`}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
                >
                  Parse &amp; Import Units
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUCCESS MODAL / REDIRECT ── */}
        {successProperty && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Commercial Asset Registered!</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {assetName} ({propertyCode || successProperty.id})
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  The property master, building towers, and leasable floor inventory have been registered into your institutional rent roll portfolio.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => router.push("/properties/tenants")}
                  className="px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Users size={14} /> Add Tenants Now
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/properties")}
                  className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 size={14} /> Property Registry
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

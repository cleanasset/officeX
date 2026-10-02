"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Percent,
  DollarSign,
  Shield,
  FileText,
  FileCheck2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Lock,
  UploadCloud,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Zap,
  Info,
  Edit3,
  Share2,
  Copy,
  MessageSquare
} from "lucide-react";
import {
  calculateContractSummary,
  calculateLoadingPct,
  calculateGSTSplit,
  generateEscalationSchedule,
  formatINR,
  round,
  ContractCalcInput,
  RentStepCalc,
  ContractChargeCalc,
  ConcessionCalc,
  DepositCalc
} from "@/lib/rent-roll/calculations";

export interface DynamicUtilityComponent {
  id: string;
  name: string;
  category: "electricity" | "dg_power" | "dg_rent" | "blended_power" | "hvac" | "water" | "custom";
  billingType: "metered_actuals" | "blended_tariff" | "per_sqft" | "per_kva" | "fixed_monthly" | "cam_included" | "direct_discom";
  rate: number;
  unitLabel: string;
  billingMode: "separate_bill" | "combined_electricity" | "with_cam" | "with_rent";
  isEnabled: boolean;
}

interface ContractWizardModalProps {
  properties: Array<{ id: string; name: string; city: string; state?: string }>;
  preSelectedSpace?: any | null;
  preSelectedTenant?: any | null;
  initialCommercials?: {
    baseRentPsf?: number;
    camRatePsf?: number;
    chargeableArea?: number;
    startDate?: string;
    endDate?: string;
    securityDepositMonths?: number;
    escalationPct?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAddProperty?: () => void;
}

export const ContractWizardModal: React.FC<ContractWizardModalProps> = ({
  properties,
  preSelectedSpace,
  preSelectedTenant,
  initialCommercials,
  isOpen,
  onClose,
  onSuccess,
  onOpenAddProperty,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available occupants & spaces fetched dynamically
  const [existingTenants, setExistingTenants] = useState<Array<{ id: string; name: string; gstin?: string; pan?: string }>>([]);
  const [availableSpaces, setAvailableSpaces] = useState<Array<{ id: string; spaceCode: string; area: number; floorNumber: number; askingRate?: number }>>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);

  // STEP 1: Parties & Space
  const [propertyId, setPropertyId] = useState<string>(preSelectedSpace?.propertyId || properties[0]?.id || "");
  const [contractType, setContractType] = useState<string>("lease_deed");
  const [direction, setDirection] = useState<"receivable" | "payable">("receivable");
  const [occupantId, setOccupantId] = useState<string>("");
  const [occupantName, setOccupantName] = useState<string>("");
  const [occupantGstin, setOccupantGstin] = useState<string>("");
  const [occupantPan, setOccupantPan] = useState<string>("");
  const [isNewOccupant, setIsNewOccupant] = useState<boolean>(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState<boolean>(false);
  const [selectedSpaces, setSelectedSpaces] = useState<Array<{ spaceId: string; spaceCode: string; areaLet: number; seatsAllocated?: number }>>([]);
  const initialProp = properties.find(p => p.id === (preSelectedSpace?.propertyId || properties[0]?.id));
  const [billingEntitiesList, setBillingEntitiesList] = useState<Array<{ id: string; name: string; gstin?: string }>>([]);
  const [billingEntityName, setBillingEntityName] = useState<string>(initialProp?.ownerCompany || initialProp?.ownerName || initialProp?.name || "testing ltd");
  const [isCustomBillingEntity, setIsCustomBillingEntity] = useState<boolean>(false);
  const [brokerName, setBrokerName] = useState<string>("Direct");
  const [isCustomBroker, setIsCustomBroker] = useState<boolean>(false);

  // STEP 2: Terms & Dates
  const todayStr = new Date().toISOString().split("T")[0];
  const next3YearsStr = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [signingDate, setSigningDate] = useState<string>(todayStr);
  const [handoverDate, setHandoverDate] = useState<string>(todayStr);
  const [commencementDate, setCommencementDate] = useState<string>(todayStr);
  const [rentCommencementDate, setRentCommencementDate] = useState<string>(todayStr);
  const [expiryDate, setExpiryDate] = useState<string>(next3YearsStr);
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  const [lockInMonths, setLockInMonths] = useState<number>(36);
  const [lockInAppliesTo, setLockInAppliesTo] = useState<"Both" | "Tenant" | "Landlord">("Both");
  const [noticePeriodMonths, setNoticePeriodMonths] = useState<number>(3);
  const [billingCurrency, setBillingCurrency] = useState<string>("INR");
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "quarterly" | "half_yearly" | "annual">("monthly");
  const [invoiceDay, setInvoiceDay] = useState<number>(1);
  const [dueDays, setDueDays] = useState<number>(7);
  const [billingMode, setBillingMode] = useState<"advance" | "arrears">("advance");
  const [tdsApplicable, setTdsApplicable] = useState<boolean>(true);
  const [tdsRate, setTdsRate] = useState<number>(10);

  const applyTenurePreset = (years: number, defaultLockIn: number) => {
    const start = commencementDate ? new Date(commencementDate) : new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);
    const endStr = end.toISOString().split("T")[0];
    setExpiryDate(endStr);
    setLockInMonths(defaultLockIn);
    setLockInAppliesTo("Both");
    setNoticePeriodMonths(3);
    setBillingFrequency("monthly");
    setInvoiceDay(1);
    setDueDays(7);
    setTdsRate(10);
  };

  const handleCommencementDateChange = (newStart: string) => {
    setCommencementDate(newStart);
    if (!rentCommencementDate || rentCommencementDate === commencementDate) {
      setRentCommencementDate(newStart);
    }
    if (newStart && expiryDate) {
      const dStart = new Date(newStart);
      const dEnd = new Date(expiryDate);
      if (dEnd > dStart) {
        const diffMonths = Math.max(1, Math.round((dEnd.getTime() - dStart.getTime()) / (30.4375 * 24 * 60 * 60 * 1000)));
        setLockInMonths(Math.min(diffMonths, 36));
      }
    }
  };

  const handleExpiryDateChange = (newExpiry: string) => {
    setExpiryDate(newExpiry);
    if (commencementDate && newExpiry) {
      const dStart = new Date(commencementDate);
      const dEnd = new Date(newExpiry);
      if (dEnd > dStart) {
        const diffMonths = Math.max(1, Math.round((dEnd.getTime() - dStart.getTime()) / (30.4375 * 24 * 60 * 60 * 1000)));
        setLockInMonths(Math.min(diffMonths, 36));
      }
    }
  };

  // STEP 3: Billing Model & Charges
  const [billingModel, setBillingModel] = useState<"area" | "seat" | "hybrid" | "fixed" | "revenue_share" | "charges_only">("area");
  const [pricingPlanName, setPricingPlanName] = useState<string>("Enterprise Dedicated Cabin");
  const [seatsContracted, setSeatsContracted] = useState<number>(100);
  const [seatsMinimum, setSeatsMinimum] = useState<number>(80);
  const [seatBillingBasis, setSeatBillingBasis] = useState<"contracted" | "occupied" | "minimum_commitment">("minimum_commitment");
  const [baseRentPsf, setBaseRentPsf] = useState<number>(0);
  const [camRatePsf, setCamRatePsf] = useState<number>(0);
  const [camIsIncluded, setCamIsIncluded] = useState<boolean>(false);
  const [parkingSlots, setParkingSlots] = useState<number>(0);
  const [parkingSlotRate, setParkingSlotRate] = useState<number>(0);
  const [utilityFixedMonthly, setUtilityFixedMonthly] = useState<number>(0);

  // UTILITIES, HVAC & ELECTRICITY CLAUSES (§4.8 Operations)
  const [hvacModel, setHvacModel] = useState<"cam_included" | "chilled_water_meter" | "fixed_psf" | "tenant_vrv">("cam_included");
  const [hvacWorkingHours, setHvacWorkingHours] = useState<string>("08:00 AM - 08:00 PM (Mon-Sat)");
  const [hvacOvertimeRate, setHvacOvertimeRate] = useState<number>(850);
  const [hvacRatePsf, setHvacRatePsf] = useState<number>(0);
  const [electricityBillingType, setElectricityBillingType] = useState<"sub_metered" | "direct_discom" | "fixed_monthly">("sub_metered");
  const [powerLoadKva, setPowerLoadKva] = useState<number>(50);
  const [dgBackupType, setDgBackupType] = useState<"100_percent" | "essential_only" | "none">("100_percent");
  const [dgRatePerUnit, setDgRatePerUnit] = useState<number>(24);
  const [waterBillingType, setWaterBillingType] = useState<"cam_included" | "fixed_monthly" | "sub_metered">("cam_included");
  const [waterFixedMonthly, setWaterFixedMonthly] = useState<number>(0);

  // Dynamic Utility & Power Charge Components (Flexible Add/Remove)
  const [utilityComponents, setUtilityComponents] = useState<DynamicUtilityComponent[]>([
    {
      id: "util_grid",
      name: "Grid Electricity (State DISCOM)",
      category: "electricity",
      billingType: "metered_actuals",
      rate: 11.5,
      unitLabel: "₹ / kWh",
      billingMode: "combined_electricity",
      isEnabled: true,
    },
    {
      id: "util_dg_run",
      name: "DG Power Consumption (Fuel / kWh)",
      category: "dg_power",
      billingType: "metered_actuals",
      rate: 24.0,
      unitLabel: "₹ / kWh",
      billingMode: "combined_electricity",
      isEnabled: true,
    },
    {
      id: "util_dg_rent",
      name: "DG Standby Capacity / Fixed Rent",
      category: "dg_rent",
      billingType: "per_kva",
      rate: 150,
      unitLabel: "₹ / kVA / mo",
      billingMode: "combined_electricity",
      isEnabled: false,
    },
    {
      id: "util_hvac",
      name: "Central Air Conditioning (HVAC)",
      category: "hvac",
      billingType: "cam_included",
      rate: 0,
      unitLabel: "Included in CAM",
      billingMode: "with_cam",
      isEnabled: true,
    },
    {
      id: "util_water",
      name: "Water Supply & Sewage",
      category: "water",
      billingType: "cam_included",
      rate: 0,
      unitLabel: "Included in CAM",
      billingMode: "with_cam",
      isEnabled: true,
    },
  ]);

  const toggleUtilityComponent = (id: string) => {
    setUtilityComponents(prev => prev.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  const updateUtilityComponent = (id: string, updates: Partial<DynamicUtilityComponent>) => {
    setUtilityComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };
      if (updates.billingType) {
        switch (updates.billingType) {
          case "metered_actuals":
            updated.unitLabel = "₹ / kWh";
            break;
          case "blended_tariff":
            updated.unitLabel = "₹ / kWh (Blended)";
            break;
          case "per_kva":
            updated.unitLabel = "₹ / kVA / mo";
            break;
          case "per_sqft":
            updated.unitLabel = "₹ / sq ft / mo";
            break;
          case "fixed_monthly":
            updated.unitLabel = "₹ / month";
            break;
          case "cam_included":
            updated.unitLabel = "Included in CAM";
            break;
          case "direct_discom":
            updated.unitLabel = "Direct DISCOM";
            break;
        }
      }
      return updated;
    }));
  };

  const removeUtilityComponent = (id: string) => {
    setUtilityComponents(prev => prev.filter(c => c.id !== id));
  };

  const addUtilityComponent = (presetKey: string) => {
    const newId = `util_${Date.now()}`;
    let newComp: DynamicUtilityComponent;

    switch (presetKey) {
      case "dg_rent":
        newComp = {
          id: newId,
          name: "DG Standby Capacity / Fixed Rent",
          category: "dg_rent",
          billingType: "per_kva",
          rate: 150,
          unitLabel: "₹ / kVA / mo",
          billingMode: "combined_electricity",
          isEnabled: true,
        };
        break;
      case "blended_power":
        newComp = {
          id: newId,
          name: "Blended Power Tariff (Grid + DG combined)",
          category: "blended_power",
          billingType: "blended_tariff",
          rate: 16.5,
          unitLabel: "₹ / kWh (Blended)",
          billingMode: "combined_electricity",
          isEnabled: true,
        };
        break;
      case "solar_wheeling":
        newComp = {
          id: newId,
          name: "Green Power / Solar Wheeling Surcharge",
          category: "custom",
          billingType: "metered_actuals",
          rate: 5.5,
          unitLabel: "₹ / kWh",
          billingMode: "combined_electricity",
          isEnabled: true,
        };
        break;
      case "ev_charging":
        newComp = {
          id: newId,
          name: "EV Charging Infrastructure Surcharge",
          category: "custom",
          billingType: "metered_actuals",
          rate: 14.0,
          unitLabel: "₹ / kWh",
          billingMode: "separate_bill",
          isEnabled: true,
        };
        break;
      case "ups_rent":
        newComp = {
          id: newId,
          name: "Central UPS Clean Power Backup Rent",
          category: "custom",
          billingType: "per_kva",
          rate: 200,
          unitLabel: "₹ / kVA / mo",
          billingMode: "separate_bill",
          isEnabled: true,
        };
        break;
      case "fixed_operational":
        newComp = {
          id: newId,
          name: "Facility Operations & Maintenance Fee",
          category: "custom",
          billingType: "fixed_monthly",
          rate: 2500,
          unitLabel: "₹ / month",
          billingMode: "separate_bill",
          isEnabled: true,
        };
        break;
      default:
        newComp = {
          id: newId,
          name: "Custom Utility Charge",
          category: "custom",
          billingType: "metered_actuals",
          rate: 10.0,
          unitLabel: "₹ / unit",
          billingMode: "combined_electricity",
          isEnabled: true,
        };
    }

    setUtilityComponents(prev => [...prev, newComp]);
    setShowAddUtilityMenu(false);
  };

  const [showAddUtilityMenu, setShowAddUtilityMenu] = useState<boolean>(false);

  // STEP 4: Escalation & Concessions
  const [escalationPct, setEscalationPct] = useState<number>(15);
  const [escalationCycleMonths, setEscalationCycleMonths] = useState<number>(36);
  const [isCompounding, setIsCompounding] = useState<boolean>(true);
  const [escalationType, setEscalationType] = useState<"fixed_pct" | "fixed_amount">("fixed_pct");
  const [rentSteps, setRentSteps] = useState<RentStepCalc[]>([]);
  const [hasRentFree, setHasRentFree] = useState<boolean>(false);
  const [rentFreeEndDate, setRentFreeEndDate] = useState<string>("");

  // STEP 5: Deposits & Clauses
  const [depositMonths, setDepositMonths] = useState<number>(0);
  const [securityDepositRequired, setSecurityDepositRequired] = useState<number>(0);
  const [securityDepositHeld, setSecurityDepositHeld] = useState<number>(0);
  const [topUpOnEscalation, setTopUpOnEscalation] = useState<boolean>(true);
  const [depositBank, setDepositBank] = useState<string>("");
  const [bgReference, setBgReference] = useState<string>("");
  const [hasRenewalOption, setHasRenewalOption] = useState<boolean>(true);
  const [hasBreakOption, setHasBreakOption] = useState<boolean>(false);

  // STEP 6: Documents
  const [uploadedAgreementName, setUploadedAgreementName] = useState<string>("");
  const [agreementStatus, setAgreementStatus] = useState<"draft" | "executed">("draft");
  const [documentVisibility, setDocumentVisibility] = useState<"internal" | "occupant_visible">("occupant_visible");

  // STEP 7: Review & Approver Notes
  const [makerComments, setMakerComments] = useState<string>("");
  const [approvalStatus, setApprovalStatus] = useState<"active" | "submitted">("active");

  // Sync pre-selected tenant, space, and commercials from AddTenantModal or Tenant Directory
  useEffect(() => {
    if (!isOpen) return;
    if (preSelectedTenant) {
      if (preSelectedTenant.id && preSelectedTenant.id.startsWith("TEN-")) {
        setOccupantId(preSelectedTenant.id);
        setIsNewOccupant(false);
      } else {
        setIsNewOccupant(true);
      }
      setOccupantName(preSelectedTenant.tradeName || preSelectedTenant.name || preSelectedTenant.legalName || "");
      if (preSelectedTenant.gstin) setOccupantGstin(preSelectedTenant.gstin);
      if (preSelectedTenant.pan) setOccupantPan(preSelectedTenant.pan);
    }
    if (preSelectedSpace) {
      if (preSelectedSpace.propertyId) setPropertyId(preSelectedSpace.propertyId);
      if (preSelectedSpace.id || preSelectedSpace.unitNumber) {
        setSelectedSpaces([{
          spaceId: preSelectedSpace.id || `SPC-${preSelectedSpace.unitNumber}`,
          spaceCode: preSelectedSpace.unitNumber || preSelectedSpace.spaceCode || "Unit",
          areaLet: preSelectedSpace.chargeableArea || 1000,
        }]);
      }
      if (preSelectedSpace.baseRentPsf) setBaseRentPsf(Number(preSelectedSpace.baseRentPsf));
      if (preSelectedSpace.camRatePsf) setCamRatePsf(Number(preSelectedSpace.camRatePsf));
    }
    if (initialCommercials) {
      if (initialCommercials.baseRentPsf) setBaseRentPsf(Number(initialCommercials.baseRentPsf));
      if (initialCommercials.camRatePsf) setCamRatePsf(Number(initialCommercials.camRatePsf));
      if (initialCommercials.startDate) {
        setCommencementDate(initialCommercials.startDate);
        setSigningDate(initialCommercials.startDate);
        setHandoverDate(initialCommercials.startDate);
        setRentCommencementDate(initialCommercials.startDate);
      }
      if (initialCommercials.endDate) setExpiryDate(initialCommercials.endDate);
      if (initialCommercials.securityDepositMonths) setDepositMonths(Number(initialCommercials.securityDepositMonths));
      if (initialCommercials.escalationPct) setEscalationPct(Number(initialCommercials.escalationPct));
    }
  }, [preSelectedTenant, preSelectedSpace, initialCommercials, isOpen]);

  // Fetch tenants and spaces when property changes
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingMeta(true);
    // Fetch tenants
    fetch("/api/rent-roll/tenants")
      .then(res => res.json())
      .then(data => {
        const rawList = Array.isArray(data) ? data : (data?.tenants || []);
        if (Array.isArray(rawList)) {
          setExistingTenants(rawList.map((t: any) => ({
            id: t.id,
            name: t.tradeName || t.legalName || t.name || "Unnamed Tenant",
            gstin: t.gstin || "",
            pan: t.pan || "",
            inviteCode: t.inviteCode || "",
            portalLive: t.portalLive ?? false,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMeta(false));

    // Fetch billing entities
    fetch("/api/rent-roll/billing-entities")
      .then(res => res.json())
      .then(data => {
        const rawList = Array.isArray(data) ? data : (data?.entities || []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map((be: any) => ({
            id: be.id,
            name: be.legalName || be.spvName || be.tradeName || "Primary SPV",
            gstin: be.gstin || "",
          }));
          setBillingEntitiesList(mapped);
          if (!billingEntityName || billingEntityName === "Landlord Company") {
            setBillingEntityName(mapped[0].name);
          }
        }
      })
      .catch(() => {});

    // Fetch spaces for property
    if (propertyId) {
      fetch(`/api/rent-roll/spaces?propertyId=${propertyId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.spaces)) {
            setAvailableSpaces(data.spaces.map((s: any) => ({
              id: s.id,
              spaceCode: s.unitNumber || s.spaceCode || `Space-${s.id.slice(0, 4)}`,
              area: Number(s.chargeableArea) || Number(s.carpetArea) || 1000,
              floorNumber: s.floorNumber || 1,
              askingRate: Number(s.standardMarketRentPsf) || Number(s.standardRatePsf) || 0,
            })));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, propertyId]);

  // Sync preSelectedSpace if passed in
  useEffect(() => {
    if (preSelectedSpace) {
      if (preSelectedSpace.propertyId) setPropertyId(preSelectedSpace.propertyId);
      const spaceObj = {
        spaceId: preSelectedSpace.id || preSelectedSpace.spaceId || "pre_space",
        spaceCode: preSelectedSpace.unitNumber || preSelectedSpace.spaceCode || "Unit",
        areaLet: Number(preSelectedSpace.chargeableArea) || 1000,
      };
      setSelectedSpaces([spaceObj]);
      if (preSelectedSpace.standardMarketRentPsf || preSelectedSpace.standardRatePsf) {
        setBaseRentPsf(Number(preSelectedSpace.standardMarketRentPsf || preSelectedSpace.standardRatePsf));
      } else {
        setBaseRentPsf(0);
      }
      if (preSelectedSpace.standardCamPsf) {
        setCamRatePsf(Number(preSelectedSpace.standardCamPsf));
      } else {
        setCamRatePsf(0);
      }
    }
  }, [preSelectedSpace]);

  // Automatically generate escalation schedule when step 4 parameters change
  useEffect(() => {
    const totalArea = selectedSpaces.reduce((acc, s) => acc + (s.areaLet || 0), 0);
    const qty = (billingModel === "seat" || billingModel === "hybrid") ? seatsContracted : (totalArea || 1);
    const schedule = generateEscalationSchedule(
      baseRentPsf,
      commencementDate,
      expiryDate,
      escalationPct,
      escalationCycleMonths,
      isCompounding,
      escalationType,
      qty
    );
    setRentSteps(schedule);
  }, [baseRentPsf, commencementDate, expiryDate, escalationPct, escalationCycleMonths, isCompounding, escalationType, selectedSpaces, billingModel, seatsContracted]);

  // Construct ContractCalcInput for live server calculation
  const totalArea = useMemo(() => selectedSpaces.reduce((acc, s) => acc + (s.areaLet || 0), 0), [selectedSpaces]);

  const contractChargesList = useMemo<ContractChargeCalc[]>(() => {
    const charges: ContractChargeCalc[] = [
      {
        component: billingModel === "seat" ? "seat_fee" : "base_rent",
        calcBasis: billingModel === "seat" ? "per_seat" : "per_area",
        rate: baseRentPsf,
        isIncluded: false,
        invoiceGroup: "rent",
        gstRate: 18,
      },
      {
        component: "cam",
        calcBasis: "per_area",
        rate: camRatePsf,
        isIncluded: camIsIncluded,
        invoiceGroup: "cam",
        gstRate: 18,
      }
    ];

    if (parkingSlots > 0 && parkingSlotRate > 0) {
      charges.push({
        component: "parking",
        calcBasis: "per_slot",
        rate: parkingSlotRate,
        quantityBasis: parkingSlots,
        isIncluded: false,
        invoiceGroup: "parking",
        gstRate: 18,
      });
    }

    if (utilityFixedMonthly > 0) {
      charges.push({
        component: "electricity",
        calcBasis: "fixed",
        rate: utilityFixedMonthly,
        isIncluded: false,
        invoiceGroup: "electricity",
        gstRate: 18,
      });
    }

    if (hvacModel === "fixed_psf" && hvacRatePsf > 0) {
      charges.push({
        component: "hvac",
        calcBasis: "per_area",
        rate: hvacRatePsf,
        isIncluded: false,
        invoiceGroup: "hvac",
        gstRate: 18,
      });
    }

    if (waterBillingType === "fixed_monthly" && waterFixedMonthly > 0) {
      charges.push({
        component: "water",
        calcBasis: "fixed",
        rate: waterFixedMonthly,
        isIncluded: false,
        invoiceGroup: "utilities",
        gstRate: 18,
      });
    }

    // Dynamic Utility Components recurring calculation (DG rent, fixed power, etc.)
    utilityComponents.filter(c => c.isEnabled).forEach(comp => {
      let monthlyAmt = 0;
      if (comp.billingType === "fixed_monthly" && comp.rate > 0) {
        monthlyAmt = comp.rate;
      } else if (comp.billingType === "per_sqft" && comp.rate > 0) {
        monthlyAmt = round(comp.rate * (totalArea || 1), 2);
      } else if (comp.billingType === "per_kva" && comp.rate > 0) {
        monthlyAmt = round(comp.rate * (powerLoadKva || 1), 2);
      }

      if (monthlyAmt > 0) {
        charges.push({
          component: comp.category,
          calcBasis: comp.billingType === "per_sqft" ? "per_area" : (comp.billingType === "per_kva" ? "per_seat" : "fixed"),
          rate: comp.billingType === "per_sqft" || comp.billingType === "per_kva" ? comp.rate : monthlyAmt,
          isIncluded: comp.billingType === "cam_included",
          invoiceGroup: comp.billingMode === "combined_electricity" ? "electricity" : comp.category,
          gstRate: 18,
        });
      }
    });

    return charges;
  }, [billingModel, baseRentPsf, camRatePsf, camIsIncluded, parkingSlots, parkingSlotRate, utilityFixedMonthly, hvacModel, hvacRatePsf, waterBillingType, waterFixedMonthly, utilityComponents, powerLoadKva, totalArea]);

  // Live calculation results
  const liveSummary = useMemo(() => {
    const calcInput: ContractCalcInput = {
      billingModel,
      status: "active",
      commencementDate,
      rentCommencementDate,
      expiryDate,
      lockInMonths,
      noticePeriodMonths,
      autoRenew,
      spaces: selectedSpaces,
      charges: contractChargesList,
      steps: rentSteps,
      seatsContracted,
      seatsMinimum,
      seatBillingBasis,
      occupiedSeats: seatsContracted,
      tdsApplicable,
      tdsRate,
      deposits: [
        {
          depositType: "security_deposit",
          requiredAmount: securityDepositRequired || (depositMonths * (totalArea * baseRentPsf)),
          heldAmount: securityDepositHeld,
        }
      ]
    };

    return calculateContractSummary(calcInput);
  }, [
    billingModel,
    commencementDate,
    rentCommencementDate,
    expiryDate,
    lockInMonths,
    noticePeriodMonths,
    autoRenew,
    selectedSpaces,
    contractChargesList,
    rentSteps,
    seatsContracted,
    seatsMinimum,
    seatBillingBasis,
    tdsApplicable,
    tdsRate,
    securityDepositRequired,
    securityDepositHeld,
    depositMonths,
    totalArea,
    baseRentPsf
  ]);

  // Auto-fill deposit requirement from monthly base rent if not manually set
  useEffect(() => {
    if (liveSummary.monthlyBaseRent > 0 && securityDepositRequired === 0) {
      const computedReq = round(liveSummary.monthlyBaseRent * depositMonths, 2);
      setSecurityDepositRequired(computedReq);
      setSecurityDepositHeld(computedReq); // default to fully funded
    }
  }, [liveSummary.monthlyBaseRent, depositMonths, securityDepositRequired]);

  // Errors & Warnings validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!propertyId) errors.push("Target property is required (Step 1).");
    if (!occupantName.trim()) errors.push("Occupant legal name is required (Step 1).");
    if (selectedSpaces.length === 0 && billingModel !== "charges_only") {
      errors.push("At least one demised space must be selected (Step 1).");
    }
    if (new Date(commencementDate) >= new Date(expiryDate)) {
      errors.push("Commencement date must be strictly before expiry date (Step 2).");
    }
    if (baseRentPsf <= 0) {
      errors.push("Base rental rate must be greater than ₹0 (Step 3).");
    }
    return errors;
  }, [propertyId, occupantName, selectedSpaces, billingModel, commencementDate, expiryDate, baseRentPsf]);

  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!occupantGstin) {
      warnings.push("No GSTIN provided for tenant. B2B invoices will lack tax credit details.");
    }
    if (liveSummary.depositShortfall > 0) {
      warnings.push(`Deposit shortfall of ${formatINR(liveSummary.depositShortfall)} detected.`);
    }
    if (agreementStatus !== "executed") {
      warnings.push("Executed lease deed document not yet attached (contract will start with missing-doc flag).");
    }
    return warnings;
  }, [occupantGstin, liveSummary.depositShortfall, agreementStatus]);

  if (!isOpen) return null;

  const handleSelectExistingTenant = (tId: string) => {
    setOccupantId(tId);
    const found = existingTenants.find(t => t.id === tId);
    if (found) {
      setOccupantName(found.name);
      if (found.gstin) setOccupantGstin(found.gstin);
      if (found.pan) setOccupantPan(found.pan);
      setIsNewOccupant(false);
    }
  };

  const handleToggleSpace = (sp: { id: string; spaceCode: string; area: number; askingRate?: number }) => {
    const exists = selectedSpaces.some(s => s.spaceId === sp.id);
    if (exists) {
      setSelectedSpaces(selectedSpaces.filter(s => s.spaceId !== sp.id));
    } else {
      setSelectedSpaces([...selectedSpaces, { spaceId: sp.id, spaceCode: sp.spaceCode, areaLet: sp.area }]);
      if (sp.askingRate && baseRentPsf === 150) {
        setBaseRentPsf(sp.askingRate);
      }
    }
  };

  const handleSubmit = async (isDraftMode: boolean = false) => {
    if (!isDraftMode && validationErrors.length > 0) {
      setErrorMsg(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const primarySpace = selectedSpaces[0];
      const payload = {
        propertyId,
        tenantName: occupantName.trim(),
        tenantGstin: occupantGstin.trim() || undefined,
        unitNumber: selectedSpaces.map(s => s.spaceCode).join(", ") || "Main Suite",
        spaceId: primarySpace?.spaceId,
        chargeableArea: totalArea,
        carpetArea: round(totalArea * 0.7, 2),
        monthlyRent: liveSummary.monthlyBaseRent,
        baseRentPsf,
        camRatePsf,
        camMonthly: liveSummary.monthlyCAM,
        utilityFixedMonthly,
        parkingChargesMonthly: parkingSlots * parkingSlotRate,
        totalMonthlyGross: liveSummary.grossMonthlyRecurring,
        annualRentGross: liveSummary.annualisedBaseRent,
        securityDepositMonths: depositMonths,
        securityDeposit: securityDepositRequired,
        securityDepositPaid: securityDepositHeld,
        securityDepositBank: depositBank,
        securityDepositBgReference: bgReference,
        escalationPct,
        escalationFrequencyMonths: escalationCycleMonths,
        startDate: commencementDate,
        rentCommencementDate,
        endDate: expiryDate,
        lockInMonths,
        noticePeriodDays: noticePeriodMonths * 30,
        contractType,
        direction,
        approvalStatus: isDraftMode ? "draft" : approvalStatus,
        billingModel,
        status: isDraftMode ? "draft" : "active",
        renewalStatus: "not_due",
        brokerName,
        notes: makerComments || undefined,
        charges: contractChargesList,
        rentSteps,
        spaces: selectedSpaces,
        hvacModel,
        hvacWorkingHours,
        hvacOvertimeRate,
        hvacFixedMonthly: hvacModel === "fixed_psf" ? round(hvacRatePsf * totalArea, 2) : 0,
        electricityBillingType,
        powerLoadKva,
        dgBackupType,
        dgRatePerUnit,
        waterBillingType,
        waterFixedMonthly,
        utilityTerms: {
          hvacModel,
          hvacWorkingHours,
          hvacOvertimeRate,
          hvacFixedMonthly: hvacModel === "fixed_psf" ? round(hvacRatePsf * totalArea, 2) : 0,
          electricityBillingType,
          powerLoadKva,
          dgBackupType,
          dgRatePerUnit,
          waterBillingType,
          waterFixedMonthly,
        },
        utilityComponents,
      };

      const res = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create contract");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <FileCheck2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">New Commercial Contract Wizard</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  S-21 Contract Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">Capture contract commercials once, completely, with multi-stage approval</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-xs font-semibold">
            {[
              { num: 1, label: "Parties & Space" },
              { num: 2, label: "Terms & Dates" },
              { num: 3, label: "Billing & Charges" },
              { num: 4, label: "Escalations" },
              { num: 5, label: "Deposits & Clauses" },
              { num: 6, label: "Documents" },
              { num: 7, label: "Review & Submit" }
            ].map(step => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-teal-600 text-white shadow-2xs font-bold"
                      : isPast
                      ? "text-teal-700 bg-teal-50 hover:bg-teal-100/70"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? "bg-white text-teal-700 font-extrabold" : isPast ? "bg-teal-200 text-teal-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isPast ? <Check size={12} /> : step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN GRID ON STEP 1, FOCUSED FULL-WIDTH ON STEPS 2-7 */}
        <div className={`flex-1 overflow-y-auto p-6 bg-slate-50/40 ${
          currentStep === 1 
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6" 
            : "flex justify-center"
        }`}>
          
          {/* STEP FORM CONTAINER */}
          <div className={`${
            currentStep === 1 
              ? "lg:col-span-8" 
              : "w-full max-w-4xl"
          } space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs self-start`}>
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
                <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* STEP 1: PARTIES & SPACE */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 1 — Parties, Legal Entities & Spaces</h3>
                  <p className="text-xs text-slate-500">Select property, demised spaces and occupant master without re-typing</p>
                </div>

                {/* Property & Contract Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Property*</label>
                    <select
                      value={propertyId}
                      onChange={e => setPropertyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Contract Deed Type*</label>
                      <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        Receivable (Tenant pays Landlord)
                      </span>
                    </div>
                    <select
                      value={contractType}
                      onChange={e => setContractType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white"
                    >
                      <option value="lease_deed">Registered Lease Deed (Standard 3–9+ Yrs)</option>
                      <option value="leave_and_licence">Leave &amp; Licence Agreement (1–5 Yrs)</option>
                      <option value="commercial_tenancy">Commercial Tenancy Agreement</option>
                    </select>
                  </div>
                </div>

                {/* Occupant Selection (Pre-fill without re-typing) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-teal-600" />
                      Occupant / Tenant Master*
                    </label>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/70 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewOccupant(false);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          !isNewOccupant
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Choose Registered ({existingTenants.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewOccupant(true);
                          setOccupantId("");
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          isNewOccupant
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        + Invite via Link / Add New
                      </button>
                    </div>
                  </div>

                  {!isNewOccupant ? (
                    <div>
                      {existingTenants.length > 0 ? (
                        <select
                          value={occupantId}
                          onChange={e => handleSelectExistingTenant(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white"
                        >
                          <option value="">Select registered occupant or company...</option>
                          {existingTenants.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.gstin ? `(${t.gstin})` : ""} {t.portalLive ? "• Live" : "• Invite Pending"}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-2">
                          <p className="font-semibold">No registered tenants in your portal yet.</p>
                          <p className="text-[11px] text-slate-600">
                            You can switch to <strong>Invite via Link / Add New</strong> to name your tenant and generate a sharable onboarding link.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewOccupant(true);
                              setOccupantId("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition-colors"
                          >
                            + Invite Tenant via Link Now
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company / Tenant Name*</label>
                          <input
                            type="text"
                            value={occupantName}
                            onChange={e => setOccupantName(e.target.value)}
                            placeholder="e.g. Acme Technologies Pvt Ltd"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">GSTIN (Optional)</label>
                          <input
                            type="text"
                            value={occupantGstin}
                            onChange={e => setOccupantGstin(e.target.value.toUpperCase())}
                            placeholder="27AABCT1234K1Z2"
                            maxLength={15}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:border-teal-600 outline-none uppercase bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">PAN (Optional)</label>
                          <input
                            type="text"
                            value={occupantPan}
                            onChange={e => setOccupantPan(e.target.value.toUpperCase())}
                            placeholder="AABCT1234K"
                            maxLength={10}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:border-teal-600 outline-none uppercase bg-white"
                          />
                        </div>
                      </div>

                      {/* Instant Tenant Onboarding Link Sharing Box */}
                      {(() => {
                        const origin = typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
                          ? window.location.origin
                          : (process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro");
                        const selectedProp = properties.find(p => p.id === propertyId);
                        const currentPropName = selectedProp?.name || "Commercial Building";
                        const spaceUnitsParam = selectedSpaces.map(s => s.spaceCode).join(", ") || "Selected Space";
                        const shareUrl = `${origin}/tenant/join?propertyId=${encodeURIComponent(propertyId)}&building=${encodeURIComponent(currentPropName)}&units=${encodeURIComponent(spaceUnitsParam)}&tenant=${encodeURIComponent(occupantName || "Tenant")}`;
                        const whatsappMsg = `🏢 *Commercial Lease Invitation - ${currentPropName}*\n📍 *Unit:* ${spaceUnitsParam}\n\nPlease click the link below to complete your tenant onboarding & verify your lease:\n${shareUrl}`;

                        const handleCopy = () => {
                          navigator.clipboard.writeText(shareUrl);
                          setCopiedInviteLink(true);
                          setTimeout(() => setCopiedInviteLink(false), 2500);
                        };

                        return (
                          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/90 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                                <Share2 size={13} className="text-teal-700" />
                                Instant Tenant Onboarding Link
                              </span>
                              <span className="text-[10px] text-teal-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-teal-200">
                                Becomes Live on Tenant Acceptance
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600">
                              Share this link with your tenant via WhatsApp or Email. Once they open it and submit their company KYC details, they are registered and marked as <strong>Portal Live</strong> automatically.
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-[11px] font-mono text-slate-700 select-all focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleCopy}
                                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                              >
                                {copiedInviteLink ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedInviteLink ? "Copied!" : "Copy Link"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`, "_blank")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                              >
                                <MessageSquare size={13} />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Demised Spaces Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Demised Units / Spaces* ({selectedSpaces.length} selected)</label>
                    <span className="text-[11px] text-teal-700 font-bold">Total Area: {totalArea.toLocaleString("en-IN")} sq ft</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {availableSpaces.map(sp => {
                      const isSelected = selectedSpaces.some(s => s.spaceId === sp.id);
                      return (
                        <div
                          key={sp.id}
                          onClick={() => handleToggleSpace(sp)}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                            isSelected
                              ? "bg-teal-50 border-teal-500 text-teal-900 shadow-2xs font-semibold ring-1 ring-teal-500"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{sp.spaceCode}</span>
                            {isSelected && <Check size={14} className="text-teal-600" />}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {sp.area.toLocaleString("en-IN")} sq ft · Floor {sp.floorNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Broker & Billing Entity (Both Direct Selection Dropdowns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                      Billing Entity (Landlord Company)
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      Select legal entity issuing the rent tax invoice
                    </p>
                    {!isCustomBillingEntity ? (
                      <select
                        value={billingEntityName}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomBillingEntity(true);
                            setBillingEntityName("");
                          } else {
                            setBillingEntityName(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white cursor-pointer"
                      >
                        {billingEntitiesList.map((be) => (
                          <option key={be.id} value={be.name}>
                            {be.name} {be.gstin ? `(${be.gstin})` : ""}
                          </option>
                        ))}
                        {initialProp?.ownerCompany && !billingEntitiesList.some(b => b.name === initialProp.ownerCompany) && (
                          <option value={initialProp.ownerCompany}>{initialProp.ownerCompany} (Property Owner)</option>
                        )}
                        {billingEntitiesList.length === 0 && !initialProp?.ownerCompany && (
                          <option value="testing ltd">testing ltd (Primary Entity)</option>
                        )}
                        <option value="custom">+ Other / Custom Entity...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={billingEntityName}
                          onChange={e => setBillingEntityName(e.target.value)}
                          placeholder="Type company / entity name..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomBillingEntity(false);
                            if (billingEntitiesList.length > 0) setBillingEntityName(billingEntitiesList[0].name);
                          }}
                          className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                      Transaction Broker / Channel Partner
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      Select sourcing agent or brokerage firm
                    </p>
                    {!isCustomBroker ? (
                      <select
                        value={brokerName}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomBroker(true);
                            setBrokerName("");
                          } else {
                            setBrokerName(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white cursor-pointer"
                      >
                        <option value="Direct">Direct (No Broker / In-House)</option>
                        <option value="JLL">JLL (Jones Lang LaSalle)</option>
                        <option value="CBRE">CBRE South Asia</option>
                        <option value="Colliers">Colliers International</option>
                        <option value="Cushman & Wakefield">Cushman &amp; Wakefield</option>
                        <option value="Knight Frank">Knight Frank India</option>
                        <option value="Savills">Savills India</option>
                        <option value="Local Channel Partner">Local Channel Partner</option>
                        <option value="custom">+ Other (Specify Custom Broker)...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={brokerName}
                          onChange={e => setBrokerName(e.target.value)}
                          placeholder="Type broker or agency name..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomBroker(false);
                            setBrokerName("Direct");
                          }}
                          className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TERMS & DATES */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Step 2 — Contract Tenure, Key Dates &amp; Commercial Terms</h3>
                    <p className="text-xs text-slate-500">Pick a tenure preset or set dates. All institutional clauses auto-fill automatically.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 px-1 uppercase">Tenure:</span>
                    {[
                      { label: "1 Year", years: 1, lockIn: 12 },
                      { label: "3 Years", years: 3, lockIn: 36 },
                      { label: "5 Years", years: 5, lockIn: 36 },
                      { label: "9 Years", years: 9, lockIn: 36 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyTenurePreset(preset.years, preset.lockIn)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-filled standard callout banner */}
                <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-teal-600 shrink-0" />
                    <span><strong>Auto-Selected Standards:</strong> Lock-in, 10% TDS (Sec 194-I), 3-Mo Notice, Monthly billing on 1st &amp; 7-day payment window are pre-configured.</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                    Customizable Below
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Signing / Deed Date</label>
                    <input
                      type="date"
                      value={signingDate}
                      onChange={e => setSigningDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Handover Date</label>
                    <input
                      type="date"
                      value={handoverDate}
                      onChange={e => setHandoverDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Commencement Date*</label>
                    <input
                      type="date"
                      value={commencementDate}
                      onChange={e => handleCommencementDateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Commencement Date*</label>
                    <input
                      type="date"
                      value={rentCommencementDate}
                      onChange={e => setRentCommencementDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date*</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => handleExpiryDateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Term</label>
                    <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                      {liveSummary.termMonths} Months ({liveSummary.remainingYears} Years)
                    </div>
                  </div>
                </div>

                {/* Lock-In & Notice */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lock-in Period (Months)</label>
                    <input
                      type="number"
                      value={lockInMonths}
                      onChange={e => setLockInMonths(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lock-in Bound Party</label>
                    <select
                      value={lockInAppliesTo}
                      onChange={e => setLockInAppliesTo(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    >
                      <option value="Both">Both (Mutual Lock-in)</option>
                      <option value="Tenant">Tenant Only</option>
                      <option value="Landlord">Landlord Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Period (Months)</label>
                    <input
                      type="number"
                      value={noticePeriodMonths}
                      onChange={e => setNoticePeriodMonths(Number(e.target.value))}
                      min={1}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Billing Schedule & Tax */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Frequency</label>
                    <select
                      value={billingFrequency}
                      onChange={e => setBillingFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Generation Day</label>
                    <input
                      type="number"
                      value={invoiceDay}
                      onChange={e => setInvoiceDay(Number(e.target.value))}
                      min={1}
                      max={28}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due In (Days)</label>
                    <input
                      type="number"
                      value={dueDays}
                      onChange={e => setDueDays(Number(e.target.value))}
                      min={1}
                      max={90}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Withholding (%)</label>
                    <input
                      type="number"
                      value={tdsRate}
                      onChange={e => setTdsRate(Number(e.target.value))}
                      min={0}
                      max={20}
                      step={0.5}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BILLING MODEL & CHARGES */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 3 — Billing Model &amp; Commercial Charges</h3>
                  <p className="text-xs text-slate-500">Configure area, seat or hybrid fee basis and component line items</p>
                </div>

                {/* 8 Billing Models Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Billing Model Engine*</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "area", title: "Area (PSF)", desc: "Conventional rate per sq ft per month" },
                      { id: "seat", title: "Seat / Workstation", desc: "Per desk/cabin rate (coworking / flex)" },
                      { id: "hybrid", title: "Hybrid (Base + Seats)", desc: "Fixed base commitment + overage per seat" },
                      { id: "fixed", title: "Fixed Monthly Rent", desc: "Lump-sum fixed rental fee" },
                      { id: "revenue_share", title: "Revenue Share (Turnover)", desc: "Base rent + % of retail sales" },
                      { id: "charges_only", title: "Service Charges Only", desc: "CAM, parking, utility agreements" },
                    ].map(model => (
                      <div
                        key={model.id}
                        onClick={() => setBillingModel(model.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          billingModel === model.id
                            ? "bg-teal-50 border-teal-600 text-teal-900 shadow-2xs font-semibold ring-1 ring-teal-600"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="font-bold text-xs">{model.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{model.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific fields for Seat / Hybrid model */}
                {(billingModel === "seat" || billingModel === "hybrid") && (
                  <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
                    <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Zap size={14} className="text-teal-700" />
                      Coworking / Flex Seat Parameters
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contracted Seats</label>
                        <input
                          type="number"
                          value={seatsContracted}
                          onChange={e => setSeatsContracted(Number(e.target.value))}
                          min={1}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Minimum Commitment Seats</label>
                        <input
                          type="number"
                          value={seatsMinimum}
                          onChange={e => setSeatsMinimum(Number(e.target.value))}
                          min={0}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seat Billing Basis</label>
                        <select
                          value={seatBillingBasis}
                          onChange={e => setSeatBillingBasis(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                        >
                          <option value="contracted">Contracted Seats (Fixed)</option>
                          <option value="occupied">Actual Occupied Seats</option>
                          <option value="minimum_commitment">MAX(Occupied, Minimum)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charges Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800">Recurring Charge Components</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {billingModel === "seat" ? "Seat Rate (₹ /seat/month)*" : "Base Rent Rate (₹ /sq ft/month)*"}
                      </label>
                      <input
                        type="number"
                        value={baseRentPsf}
                        onChange={e => setBaseRentPsf(Number(e.target.value))}
                        min={0}
                        step={0.5}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">CAM Rate (₹ /sq ft/month)</label>
                        <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={camIsIncluded}
                            onChange={e => setCamIsIncluded(e.target.checked)}
                            className="rounded border-slate-300 text-teal-600"
                          />
                          Included in Rent
                        </label>
                      </div>
                      <input
                        type="number"
                        value={camRatePsf}
                        onChange={e => setCamRatePsf(Number(e.target.value))}
                        disabled={camIsIncluded}
                        min={0}
                        step={0.5}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dedicated Parking Slots</label>
                      <input
                        type="number"
                        value={parkingSlots}
                        onChange={e => setParkingSlots(Number(e.target.value))}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Rate (₹ /slot/month)</label>
                      <input
                        type="number"
                        value={parkingSlotRate}
                        onChange={e => setParkingSlotRate(Number(e.target.value))}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Utility Charges (Monthly)</label>
                      <input
                        type="number"
                        value={utilityFixedMonthly}
                        onChange={e => setUtilityFixedMonthly(Number(e.target.value))}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* FLEXIBLE UTILITIES, HVAC & ELECTRICITY BUILDER */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-200 shadow-2xs">
                          ⚡
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>Utility &amp; Power Charge Components</span>
                            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                              Flexible Billing
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Configure electricity &amp; DG combined or separate, optional DG capacity rent, or add custom utility meters
                          </div>
                        </div>
                      </div>

                      {/* Add Component Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAddUtilityMenu(prev => !prev)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>+ Add Component</span>
                        </button>

                        {showAddUtilityMenu && (
                          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 animate-in fade-in-50 text-xs">
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Choose Component Template
                            </div>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("dg_rent")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-amber-600 font-bold">⚡</span> DG Capacity / Standby Rent
                            </button>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("blended_power")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-teal-600 font-bold">🔄</span> Blended Grid + DG Single Tariff
                            </button>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("solar_wheeling")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-emerald-600 font-bold">☀️</span> Solar / Green Power Wheeling
                            </button>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("ev_charging")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-blue-600 font-bold">🚗</span> EV Charging Point Sub-Meter
                            </button>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("ups_rent")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-indigo-600 font-bold">🔋</span> Central UPS Clean Power Rent
                            </button>
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("fixed_operational")}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <span className="text-slate-600 font-bold">🛠️</span> Facility Operations Flat Fee
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              onClick={() => addUtilityComponent("custom")}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-800 font-bold"
                            >
                              <Plus size={13} /> Custom Utility Line Item
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Core Parameters (Load, DG Backup, AC Hours) */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Connected Load (kVA)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={powerLoadKva === 0 ? "" : powerLoadKva}
                            onChange={(e) => setPowerLoadKva(Math.max(1, parseInt(e.target.value) || 0))}
                            placeholder="50"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                          />
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">kVA</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          DG Backup Provision
                        </label>
                        <select
                          value={dgBackupType}
                          onChange={(e) => setDgBackupType(e.target.value as any)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        >
                          <option value="100_percent">100% Full Uninterrupted</option>
                          <option value="essential_only">Essential / Common (70%)</option>
                          <option value="none">No DG Backup (Tenant UPS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          AC Working Hours
                        </label>
                        <input
                          type="text"
                          value={hvacWorkingHours}
                          onChange={(e) => setHvacWorkingHours(e.target.value)}
                          placeholder="08:00 AM - 08:00 PM (Mon-Sat)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Overtime AC Rate
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={hvacOvertimeRate === 0 ? "" : hvacOvertimeRate}
                            onChange={(e) => setHvacOvertimeRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="850"
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                          />
                          <span className="text-[10px] text-slate-400 shrink-0">/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Component Cards List */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Active Utility &amp; Power Components ({utilityComponents.length})</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          Toggle switch to enable/disable or click trash to remove
                        </span>
                      </div>

                      {utilityComponents.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <p className="text-xs font-semibold text-slate-600">No utility charge components added.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Component" above to configure electricity, DG, or utility terms.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {utilityComponents.map((comp) => {
                            const isZeroCharge = comp.billingType === "cam_included" || comp.billingType === "direct_discom";
                            return (
                              <div
                                key={comp.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  comp.isEnabled
                                    ? "bg-white border-slate-200 shadow-2xs ring-1 ring-slate-100"
                                    : "bg-slate-50/60 border-slate-200 opacity-60"
                                }`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                                  {/* Left: Toggle & Name */}
                                  <div className="md:col-span-4 flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={comp.isEnabled}
                                      onChange={() => toggleUtilityComponent(comp.id)}
                                      className="rounded border-slate-300 text-teal-600 h-4 w-4 cursor-pointer shrink-0"
                                      title="Enable / Disable this component"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <input
                                        type="text"
                                        value={comp.name}
                                        onChange={(e) => updateUtilityComponent(comp.id, { name: e.target.value })}
                                        className="w-full text-xs font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none bg-transparent py-0.5"
                                        placeholder="Component Name..."
                                      />
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                          comp.category === "electricity" ? "bg-amber-100 text-amber-800" :
                                          comp.category === "dg_power" ? "bg-orange-100 text-orange-800" :
                                          comp.category === "dg_rent" ? "bg-purple-100 text-purple-800" :
                                          comp.category === "blended_power" ? "bg-teal-100 text-teal-800" :
                                          comp.category === "hvac" ? "bg-sky-100 text-sky-800" :
                                          "bg-slate-100 text-slate-700"
                                        }`}>
                                          {comp.category.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          {comp.isEnabled ? "Active" : "Disabled"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Middle 1: Billing Type Selector */}
                                  <div className="md:col-span-3">
                                    <select
                                      value={comp.billingType}
                                      onChange={(e) => updateUtilityComponent(comp.id, { billingType: e.target.value as any })}
                                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white cursor-pointer"
                                    >
                                      <option value="metered_actuals">Metered (Actuals ₹/kWh)</option>
                                      <option value="blended_tariff">Blended Power (Grid+DG Combined)</option>
                                      <option value="per_kva">Per kVA Capacity (₹/kVA/mo)</option>
                                      <option value="per_sqft">Per Sq Ft (₹/sq ft/mo)</option>
                                      <option value="fixed_monthly">Fixed Lumpsum (₹/month)</option>
                                      <option value="cam_included">Included in CAM</option>
                                      <option value="direct_discom">Direct DISCOM (Tenant Pays)</option>
                                    </select>
                                  </div>

                                  {/* Middle 2: Rate Input */}
                                  <div className="md:col-span-2">
                                    {isZeroCharge ? (
                                      <div className="text-[11px] font-semibold text-slate-400 italic py-1 px-2 bg-slate-100 rounded-lg text-center">
                                        No Direct Fee
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-500">₹</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="any"
                                          value={comp.rate === 0 ? "" : comp.rate}
                                          onChange={(e) => updateUtilityComponent(comp.id, { rate: Math.max(0, parseFloat(e.target.value) || 0) })}
                                          placeholder="0.00"
                                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                        />
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                          {comp.billingType === "per_kva" ? "/kVA" : comp.billingType === "per_sqft" ? "/psf" : comp.billingType === "fixed_monthly" ? "/mo" : "/kWh"}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Middle 3: Invoicing Bundling (Together vs Separate) */}
                                  <div className="md:col-span-2">
                                    <select
                                      value={comp.billingMode}
                                      onChange={(e) => updateUtilityComponent(comp.id, { billingMode: e.target.value as any })}
                                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-medium focus:border-teal-600 outline-none bg-white cursor-pointer"
                                      title="Specify whether this is combined on the electricity invoice or billed separately"
                                    >
                                      <option value="combined_electricity">⚡ Billed with Electricity</option>
                                      <option value="separate_bill">📄 Separate Utility Bill</option>
                                      <option value="with_cam">🏢 Included with CAM</option>
                                      <option value="with_rent">🏠 Included with Rent</option>
                                    </select>
                                  </div>

                                  {/* Right: Remove Button */}
                                  <div className="md:col-span-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => removeUtilityComponent(comp.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Remove this utility component"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Helpful Landlord Clarification Note */}
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                        <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Customizable Real Estate Standards:</strong> If your building charges Electricity &amp; DG together, keep both set to <em>"Billed with Electricity"</em>. If you bill DG separately or do not charge DG capacity rent, set them to <em>"Separate Bill"</em>, uncheck, or click trash to remove.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ESCALATIONS & CONCESSIONS */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 4 — Escalation Schedule &amp; Concessions</h3>
                  <p className="text-xs text-slate-500">Auto-generate step schedule to contract expiry and track rent-free periods</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Escalation Formula Engine</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Escalation % Uplift*</label>
                      <input
                        type="number"
                        value={escalationPct}
                        onChange={e => setEscalationPct(Number(e.target.value))}
                        min={0}
                        max={100}
                        step={0.5}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cycle (Months)*</label>
                      <input
                        type="number"
                        value={escalationCycleMonths}
                        onChange={e => setEscalationCycleMonths(Number(e.target.value))}
                        min={6}
                        max={60}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Compounding</label>
                      <select
                        value={isCompounding ? "true" : "false"}
                        onChange={e => setIsCompounding(e.target.value === "true")}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      >
                        <option value="true">Compounding (F-02)</option>
                        <option value="false">Non-compounding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type</label>
                      <select
                        value={escalationType}
                        onChange={e => setEscalationType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      >
                        <option value="fixed_pct">Fixed % Step</option>
                        <option value="fixed_amount">Fixed Amount Step</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Generated Schedule Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Generated Rent Step Schedule ({rentSteps.length} Steps)</span>
                    <span className="text-[11px] text-slate-500 font-mono">D-21 Compounding Schedule</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-3 py-2">Step</th>
                          <th className="px-3 py-2">Effective Date</th>
                          <th className="px-3 py-2">Rate (₹)</th>
                          <th className="px-3 py-2">Monthly Amount</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rentSteps.map((s, idx) => (
                          <tr key={idx} className={idx === 0 ? "bg-teal-50/40 font-semibold text-teal-900" : ""}>
                            <td className="px-3 py-2">Step {s.stepNumber} {idx === 0 ? "(Initial)" : ""}</td>
                            <td className="px-3 py-2 font-mono">{s.effectiveDate}</td>
                            <td className="px-3 py-2">₹{s.rate.toFixed(2)}</td>
                            <td className="px-3 py-2">{formatINR(s.monthlyAmount || 0)}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === "applied" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Concessions */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Percent size={14} className="text-teal-600" />
                      Rent-Free Concession Period
                    </label>
                    <input
                      type="checkbox"
                      checked={hasRentFree}
                      onChange={e => setHasRentFree(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                  </div>
                  {hasRentFree && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rent-Free End Date</label>
                        <input
                          type="date"
                          value={rentFreeEndDate}
                          onChange={e => setRentFreeEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                        />
                      </div>
                      <div className="flex items-center text-xs text-slate-500 pt-4">
                        100% concession on base rental charges will apply until this date.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: DEPOSITS & CLAUSES */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 5 — Security Deposits &amp; Special Clauses</h3>
                  <p className="text-xs text-slate-500">Security deposits, bank guarantees, top-up on escalation and option windows</p>
                </div>

                {/* Security Deposit Terms */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield size={14} className="text-teal-600" />
                    Security Deposit Ledger
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deposit Basis (Months)</label>
                      <input
                        type="number"
                        value={depositMonths}
                        onChange={e => {
                          const m = Number(e.target.value);
                          setDepositMonths(m);
                          if (liveSummary.monthlyBaseRent > 0) {
                            setSecurityDepositRequired(round(liveSummary.monthlyBaseRent * m, 2));
                          }
                        }}
                        min={0}
                        max={24}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Required Amount (₹)*</label>
                      <input
                        type="number"
                        value={securityDepositRequired}
                        onChange={e => setSecurityDepositRequired(Number(e.target.value))}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Held / Paid Amount (₹)*</label>
                      <input
                        type="number"
                        value={securityDepositHeld}
                        onChange={e => setSecurityDepositHeld(Number(e.target.value))}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Issuing Bank</label>
                      <input
                        type="text"
                        value={depositBank}
                        onChange={e => setDepositBank(e.target.value)}
                        placeholder="e.g. HDFC Bank, ICICI"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">BG / UTR Reference</label>
                      <input
                        type="text"
                        value={bgReference}
                        onChange={e => setBgReference(e.target.value)}
                        placeholder="e.g. BG-2026-9901"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={topUpOnEscalation}
                          onChange={e => setTopUpOnEscalation(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        Top-up Deposit on Escalation
                      </label>
                    </div>
                  </div>
                </div>

                {/* Clauses & Options */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Special Contract Clauses</div>
                  <div className="flex items-center gap-6">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasRenewalOption}
                        onChange={e => setHasRenewalOption(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600"
                      />
                      Tenant has Renewal Option
                    </label>
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasBreakOption}
                        onChange={e => setHasBreakOption(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600"
                      />
                      Break Option Available
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: DOCUMENTS */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 6 — Document Vault &amp; Legal Evidence</h3>
                  <p className="text-xs text-slate-500">Upload executed agreement, term sheets, BG and NOCs (PDF/Word up to 25MB)</p>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <UploadCloud size={32} className="mx-auto text-teal-600 mb-2" />
                  <div className="text-xs font-bold text-slate-800">
                    {uploadedAgreementName ? `Selected: ${uploadedAgreementName}` : "Click or drag & drop executed lease agreement"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, JPG scanned stamp papers (Max 25MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    id="doc-upload"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedAgreementName(e.target.files[0].name);
                        setAgreementStatus("executed");
                      }
                    }}
                  />
                  <label
                    htmlFor="doc-upload"
                    className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    Select File
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Execution Status</label>
                    <select
                      value={agreementStatus}
                      onChange={e => setAgreementStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    >
                      <option value="draft">Draft / Under Negotiation</option>
                      <option value="executed">Executed &amp; Stamp Duty Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Portal Visibility</label>
                    <select
                      value={documentVisibility}
                      onChange={e => setDocumentVisibility(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none bg-white"
                    >
                      <option value="occupant_visible">Occupant Visible (Downloadable by Tenant)</option>
                      <option value="internal">Internal Only (Staff Vault)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & SUBMIT */}
            {currentStep === 7 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Step 7 — Review Contract Commercials &amp; Approvals</h3>
                  <p className="text-xs text-slate-500">Verify all terms before committing to rent roll register</p>
                </div>

                {validationErrors.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-rose-800">Must fix before submission:</div>
                    {validationErrors.map((err, i) => (
                      <div key={i} className="text-xs text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> {err}
                      </div>
                    ))}
                  </div>
                )}

                {validationWarnings.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-amber-800">Operational warnings:</div>
                    {validationWarnings.map((warn, i) => (
                      <div key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Info size={12} /> {warn}
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Base Rent</span>
                    <span className="font-bold text-slate-900 text-sm">{formatINR(liveSummary.monthlyBaseRent)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gross Monthly Recurring</span>
                    <span className="font-bold text-teal-700 text-sm">{formatINR(liveSummary.grossMonthlyRecurring)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Annualised Revenue</span>
                    <span className="font-bold text-slate-900 text-sm">{formatINR(liveSummary.annualisedBaseRent)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Deposit Shortfall</span>
                    <span className={`font-bold text-sm ${liveSummary.depositShortfall > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {liveSummary.depositShortfall > 0 ? formatINR(liveSummary.depositShortfall) : "None (Covered)"}
                    </span>
                  </div>
                </div>

                {/* Utilities & HVAC Operational Review Banner */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-amber-950 font-bold text-[11px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span>⚡</span> Agreed Utilities &amp; Operational Annexure
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-semibold">
                      {utilityComponents.filter(c => c.isEnabled).length} Active Components
                    </span>
                  </div>

                  {/* Core specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Connected Power</span>
                      <span className="font-bold text-slate-800">{powerLoadKva} kVA</span>
                      <span className="text-[9px] text-slate-500 block">Sanctioned load</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">DG Backup</span>
                      <span className="font-bold text-slate-800">
                        {dgBackupType === "100_percent" ? "100% Uninterrupted" : dgBackupType === "essential_only" ? "Essential (70%)" : "No DG Backup"}
                      </span>
                      <span className="text-[9px] text-slate-500 block">Generator SLA</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">AC Operating Hours</span>
                      <span className="font-bold text-slate-800 truncate block">{hvacWorkingHours}</span>
                      <span className="text-[9px] text-slate-500 block">Standard delivery</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Overtime AC</span>
                      <span className="font-bold text-slate-800">
                        {hvacOvertimeRate > 0 ? `₹${hvacOvertimeRate}/hr` : "No Charge"}
                      </span>
                      <span className="text-[9px] text-slate-500 block">After standard hrs</span>
                    </div>
                  </div>

                  {/* Active Dynamic Components List */}
                  <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Agreed Utility Invoicing Structure
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {utilityComponents.filter(c => c.isEnabled).map((c) => (
                        <div key={c.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-800 truncate text-[11px]">{c.name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-700">
                                {c.billingType === "cam_included" ? "Included in CAM" : c.billingType === "direct_discom" ? "Direct DISCOM" : `₹${c.rate} ${c.unitLabel}`}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            c.billingMode === "combined_electricity"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : c.billingMode === "separate_bill"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {c.billingMode === "combined_electricity" ? "⚡ Billed with Electricity" : c.billingMode === "separate_bill" ? "📄 Separate Bill" : "🏢 CAM/Rent"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Approver comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maker / Submitter Notes for Approval</label>
                  <textarea
                    rows={3}
                    value={makerComments}
                    onChange={e => setMakerComments(e.target.value)}
                    placeholder="Enter any commercial nuances, deviations or approval justifications..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 outline-none"
                  />
                </div>

                {/* Approval routing status */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Maker-Checker Routing</span>
                    <span className="text-[11px] text-slate-500">Auto-routes to Asset Manager for commercial sign-off</span>
                  </div>
                  <select
                    value={approvalStatus}
                    onChange={e => setApprovalStatus(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 outline-none bg-slate-50"
                  >
                    <option value="active">Instant Direct Activation</option>
                    <option value="submitted">Submit for Maker-Checker Approval</option>
                  </select>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || validationErrors.length > 0}
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Commit &amp; Register Contract
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: STICKY LIVE FINANCIAL SUMMARY (ONLY ON STEP 1) */}
          {currentStep === 1 && (
            <div className="lg:col-span-4 space-y-4">
              <div className="sticky top-0 bg-white rounded-2xl border border-teal-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-teal-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Calculation</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                    <Edit3 size={11} /> Editable by Landlord
                  </span>
                </div>

                {/* Occupant & Space pill */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 text-[10px] font-semibold uppercase">Demised Asset</div>
                  <div className="font-bold text-slate-900 truncate">
                    {occupantName || "Occupant Not Specified"}
                  </div>
                  <div className="text-slate-600 flex items-center justify-between pt-1">
                    <span>{selectedSpaces.length} Units ({totalArea.toLocaleString("en-IN")} sq ft)</span>
                    <span className="font-mono text-teal-700 font-bold uppercase">{billingModel}</span>
                  </div>
                </div>

                {/* Directly Editable Financial Inputs for Landlord */}
                <div className="space-y-2.5 text-xs">
                  {liveSummary.monthlyBaseRent === 0 && (
                    <div className="p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-[10px] flex items-center gap-1.5 leading-tight">
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                      <span>Enter or edit your commercial terms below. Calculations update in real time.</span>
                    </div>
                  )}

                  {/* Base Rent Input */}
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <span>Base Rent psf</span>
                        <span className="text-[9px] text-slate-400 font-normal">(/sq ft/mo)</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={baseRentPsf === 0 ? "" : baseRentPsf}
                          onChange={(e) => setBaseRentPsf(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.00"
                          className="w-20 px-2 py-1 text-right font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500">
                      <span>Monthly Base Rent:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {liveSummary.monthlyBaseRent > 0 ? formatINR(liveSummary.monthlyBaseRent) : "₹0.00 (Pending)"}
                      </span>
                    </div>
                  </div>

                  {/* CAM Input */}
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <span>CAM Rate psf</span>
                        <span className="text-[9px] text-slate-400 font-normal">(Maintenance)</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={camRatePsf === 0 ? "" : camRatePsf}
                          onChange={(e) => setCamRatePsf(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.00"
                          className="w-20 px-2 py-1 text-right font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500">
                      <span>Monthly CAM:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {liveSummary.monthlyCAM > 0 ? formatINR(liveSummary.monthlyCAM) : "₹0.00"}
                      </span>
                    </div>
                  </div>

                  {/* Deposit Months & Escalation Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Deposit
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={depositMonths === 0 ? "" : depositMonths}
                          onChange={(e) => setDepositMonths(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full px-2 py-1 text-right font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-teal-600 text-xs bg-white"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">mos</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Escalation
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={escalationPct === 0 ? "" : escalationPct}
                          onChange={(e) => setEscalationPct(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full px-2 py-1 text-right font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-teal-600 text-xs bg-white"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Computed Totals */}
                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Effective Rate:</span>
                      <span className="font-bold text-slate-900">
                        {liveSummary.effectiveRate > 0 ? `₹${liveSummary.effectiveRate.toFixed(2)} psf/mo` : "₹0.00 psf"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-bold">Total Monthly Gross (D-05):</span>
                      <span className="font-extrabold text-teal-800 text-sm font-mono">
                        {formatINR(liveSummary.grossMonthlyRecurring)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-teal-100 text-slate-600">
                      <span>Annual Contracted Rev:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatINR(liveSummary.annualisedBaseRent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Deposit Required (D-13):</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatINR(liveSummary.depositRequired)}
                      </span>
                    </div>
                    {liveSummary.nextEscalationDate && (
                      <div className="flex items-center justify-between text-[11px] text-amber-800 pt-0.5">
                        <span>Next Escalation (+{escalationPct}%):</span>
                        <span className="font-bold font-mono">
                          +{formatINR(liveSummary.nextEscalationUplift)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Validation Chip */}
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 ${
                    validationErrors.length === 0 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {validationErrors.length === 0 ? (
                      <><CheckCircle2 size={12} className="text-emerald-600" /> Ready to Submit</>
                    ) : (
                      <><AlertTriangle size={12} className="text-rose-600" /> {validationErrors.length} Errors</>
                    )}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {validationWarnings.length} Warnings
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

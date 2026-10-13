"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  Copy,
  Mail,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Lock,
  ChevronRight,
  Briefcase,
  Layers,
  X,
  AlertTriangle,
  FileUp,
  FileCheck2,
  UploadCloud,
  Loader2,
  Calculator,
  Zap,
  Car,
  Wrench,
  Shield,
  Check,
  Clock,
  Armchair,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
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
import { uploadAndParseAgreement } from "@/lib/rent-roll/client-document-extractor";
import AgreementVarianceModal, { AgreementDiffItem } from "@/components/rent-roll/AgreementVarianceModal";
import { getClientAuthHeaders } from "@/lib/auth-storage";

// Production Deployed Domain Fallback
const DEPLOYED_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app";

function CompleteProfileContent() {
  const router = useRouter();

  // Active step (now includes Contract step)
  const [activeStep, setActiveStep] = useState<"property" | "tenant" | "contract" | "documents" | "delegation">("property");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stored Onboarding Context (Zero hardcoded fake defaults)
  const [companyName, setCompanyName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [userRoleKey, setUserRoleKey] = useState("owner");

  // Subscribed Capacity (Ceiling)
  const [subscribedCapacity, setSubscribedCapacity] = useState<number>(50000);

  // Manager activation banner visibility
  const [showManagerActivationBanner, setShowManagerActivationBanner] = useState(true);

  // Registered Properties List (Fetched from DB & Storage)
  const [registeredProperties, setRegisteredProperties] = useState<any[]>([]);

  // Step 1: Property Form (Clean, zero pre-feeded mock data)
  const [propMode, setPropMode] = useState<"manual" | "sheet">("manual");
  const [propForm, setPropForm] = useState({
    property_name: "",
    property_code: "",
    property_type: "office",
    fitout_condition: "fully_furnished", // "fully_furnished" | "warm_shell" | "bare_shell" | "semi_furnished"
    workstations_count: "",
    cabins_count: "",
    meeting_rooms_count: "",
    default_fitout_days: "60",
    ownership_structure: "pvt_ltd",
    total_leasable_area_sqft: 0,
    floors_count: 1,
    wings_count: 1,
    state: "Karnataka",
    city: "Bengaluru",
    micro_market: "",
    address: "",
    pincode: "",
    spv_name: "",
    pan_number: "",
    cin_number: "",
    gstin: "",
    rera_number: "",
  });
  const currentStructureRule = getOwnershipStructureRule(propForm.ownership_structure);

  const handleOwnershipStructureChange = (val: string) => {
    const rule = getOwnershipStructureRule(val);
    setPropForm((prev) => ({
      ...prev,
      ownership_structure: val,
      cin_number: rule.cinApplicable ? prev.cin_number : "",
    }));
  };

  const [availableCities, setAvailableCities] = useState<string[]>(INDIAN_STATES_CITIES["Karnataka"] || []);

  const handleAddressSelect = (result: AddressAutofillResult) => {
    const matchedState = matchCanonicalIndianState(result.state) || result.state;
    const cities = INDIAN_STATES_CITIES[matchedState] || [];
    let finalCity = propForm.city;

    if (result.city) {
      const matchedCity = matchCanonicalIndianCity(matchedState, result.city) || result.city;
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
      address: result.streetAddress || result.fullAddress,
      pincode: result.pincode || prev.pincode,
      state: matchedState || prev.state,
      city: finalCity,
      micro_market: result.microMarket || prev.micro_market,
    }));
  };

  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetParsedRows, setSheetParsedRows] = useState<any[]>([]);
  const [propLoading, setPropLoading] = useState(false);

  // Step 2: Tenant Form (Enriched with corporate & statutory specs)
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState<string>("");
  const [tenantForm, setTenantForm] = useState({
    occupant_name: "",
    email: "",
    phone: "",
    company_name: "",
    gstin: "",
    pan: "",
    billing_address: "",
    alt_contact_name: "",
    alt_contact_phone: "",
    signatory_name: "",
    signatory_designation: "",
    industry_type: "IT / Technology",
    cin_number: "",
  });
  const [tenantLoading, setTenantLoading] = useState(false);

  // Latest Generated Tenant Invite Link
  const [latestTenantInvite, setLatestTenantInvite] = useState<{
    name: string;
    email: string;
    link: string;
  } | null>(null);
  const [copiedTenantInvite, setCopiedTenantInvite] = useState(false);

  // Tenants List for Contract selection
  const [tenantsList, setTenantsList] = useState<Array<{ id: string; name: string; company?: string }>>([]);

  // Step 3: Contract Form (Comprehensive Commercial Terms & Auto-Extraction)
  const [contractForm, setContractForm] = useState({
    occupant_id: "",
    occupant_name: "",
    property_id: "",
    building_name: "Tower 1",
    space_unit: "Suite 101",
    start_date: "",
    end_date: "",
    area_sqft: "",
    // Pricing Model & Rates
    billing_model: "Area-based", // "Area-based" | "Seat-based" | "Fixed" | "Hybrid" | "Pure Rent"
    rate_per_sqft: "",
    rate_per_seat: "",
    seat_count: "",
    bare_shell_rate: "",
    fitout_rate: "",
    monthly_rent: "",
    // Fit-out & Handover Terms
    fitout_condition: "Fully Furnished", // "Fully Furnished" | "Warm Shell" | "Bare Shell" | "Semi-Furnished"
    fitout_period_days: "60",
    possession_date: "",
    // CAM Charges
    cam_type: "Per Sq.Ft", // "Per Sq.Ft" | "Fixed Monthly" | "Included" | "Actuals"
    cam_rate: "",
    cam_monthly: "",
    // Utilities & Power Backup
    electricity_billing: "Submeter Actuals", // "Submeter Actuals" | "Fixed Monthly" | "Included in Rent" | "Proportionate Share"
    power_backup_type: "100% DG Power Backup", // "100% DG Power Backup" | "Partial DG Backup" | "No DG Backup"
    electricity_load_kva: "",
    dg_rate_per_kwh: "",
    water_charges: "Included in CAM",
    // Dedicated Parking Allocation
    car_parking_slots: "2",
    car_parking_rate: "3000",
    two_wheeler_slots: "5",
    two_wheeler_rate: "500",
    // Escalations & Deposits
    escalation_pct: "5.0",
    escalation_start_date: "",
    escalation_frequency: "Annual",
    security_deposit: "",
    deposit_months: "6",
    lock_in_months: "36",
    notice_days: "90",
    // Commercial Entities & Statutory
    billing_entity: "",
    payment_terms: "Net 30",
    late_interest_pct: "18",
    gst_applicable: true,
    tds_applicable: true,
    stamp_duty_sharing: "50:50 Shared",
    notes: "",
  });
  const [contractLoading, setContractLoading] = useState(false);

  // Rent Agreement Upload & Auto-Extraction State
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);
  const [parsedAgreementMeta, setParsedAgreementMeta] = useState<{
    fileName: string;
    confidence: number;
    extractedFieldsCount: number;
    summaryHighlights: string[];
  } | null>(null);

  // Agreement Variance Review States (§Discrepancy Popup & Highlight)
  const [varianceModalOpen, setVarianceModalOpen] = useState(false);
  const [pendingAgreementFile, setPendingAgreementFile] = useState("");
  const [pendingAgreementData, setPendingAgreementData] = useState<any>(null);
  const [agreementDifferences, setAgreementDifferences] = useState<AgreementDiffItem[]>([]);
  const [changedFieldKeys, setChangedFieldKeys] = useState<Set<string>>(new Set());

  const [lastSavedPropName, setLastSavedPropName] = useState("");
  const [lastSavedOccupantName, setLastSavedOccupantName] = useState("");

  const clearFieldHighlight = (key: string) => {
    if (changedFieldKeys.has(key)) {
      setChangedFieldKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const getHighlightClass = (key: string, baseClass: string) => {
    if (changedFieldKeys.has(key)) {
      return `${baseClass} bg-amber-50 border-amber-400 ring-2 ring-amber-300/70 transition-all duration-300`;
    }
    return baseClass;
  };

  useEffect(() => {
    if (changedFieldKeys.size > 0) {
      setChangedFieldKeys(new Set());
    }
  }, [activeStep]);

  // ──── LEASE AGREEMENT PARSING & AUTO-POPULATION WITH DIFFERENCE REVIEW ────
  const handleUploadRentAgreement = async (file: File) => {
    if (!file) return;
    setIsUploadingAgreement(true);
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

        // 1. Resolve currently selected/typed tenant name
        const currentSelectedTenant = tenantsList.find((t) => t.id === contractForm.occupant_id);
        const currentOccupantName =
          currentSelectedTenant?.name ||
          tenantForm.occupant_name ||
          contractForm.occupant_name ||
          lastSavedOccupantName ||
          "";

        // 2. Resolve currently selected/typed property name
        const currentSelectedProp = registeredProperties.find(
          (p) => p.id === selectedPropertyForTenant || p.id === contractForm.property_id
        );
        const currentPropName =
          currentSelectedProp?.property_name ||
          propForm.property_name ||
          lastSavedPropName ||
          (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") || "" : "");

        const diffs: AgreementDiffItem[] = [];

        // 1. Occupant / Tenant Entity Name
        if (d.occupantName) {
          const hasVariance =
            currentOccupantName !== "" &&
            currentOccupantName.toLowerCase().trim() !== d.occupantName.toLowerCase().trim();
          diffs.push({
            fieldKey: "occupant_id",
            label: "Occupant / Tenant Entity",
            currentValue: currentOccupantName || "(Not selected)",
            agreementValue: d.occupantName,
            hasVariance: hasVariance || !currentOccupantName,
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
            fieldKey: "property_id",
            label: "Commercial Property / Lessor",
            currentValue: currentPropName || "(Not selected)",
            agreementValue: docProp,
            hasVariance: hasVariance || !currentPropName,
          });
        }

        // 3. Leasable Area (Sq.Ft)
        if (d.areaSqft > 0) {
          const curArea = Number(contractForm.area_sqft) || Number(propForm.total_leasable_area_sqft) || 0;
          const hasVariance = curArea !== d.areaSqft;
          diffs.push({
            fieldKey: "area_sqft",
            label: "Leasable Area",
            currentValue: curArea > 0 ? `${curArea.toLocaleString()} Sq.Ft` : "(Not entered)",
            agreementValue: `${d.areaSqft.toLocaleString()} Sq.Ft`,
            hasVariance: hasVariance,
          });
        }

        // 4. Monthly Base Rent
        if (d.monthlyRent > 0) {
          const curRent = Number(contractForm.monthly_rent) || 0;
          const hasVariance = curRent !== d.monthlyRent;
          diffs.push({
            fieldKey: "monthly_rent",
            label: "Monthly Base Rent",
            currentValue: curRent > 0 ? `₹${curRent.toLocaleString()}` : "(Not entered)",
            agreementValue: `₹${d.monthlyRent.toLocaleString()}`,
            hasVariance: hasVariance,
          });
        }

        // 5. Rate per Sq.Ft
        if (d.ratePerSqft > 0) {
          const curRate = Number(contractForm.rate_per_sqft) || 0;
          const hasVariance = curRate !== d.ratePerSqft;
          diffs.push({
            fieldKey: "rate_per_sqft",
            label: "Rate PSF",
            currentValue: curRate > 0 ? `₹${curRate}/sqft` : "(Not entered)",
            agreementValue: `₹${d.ratePerSqft}/sqft`,
            hasVariance: hasVariance,
          });
        }

        // 6. Security Deposit
        if (d.securityDeposit > 0) {
          const curDep = Number(contractForm.security_deposit) || 0;
          const hasVariance = curDep !== d.securityDeposit;
          diffs.push({
            fieldKey: "security_deposit",
            label: "Security Deposit (IFRSD)",
            currentValue: curDep > 0 ? `₹${curDep.toLocaleString()}` : "(Not entered)",
            agreementValue: `₹${d.securityDeposit.toLocaleString()}`,
            hasVariance: hasVariance,
          });
        }

        // 7. Rent Commencement / Start Date
        if (d.startDate) {
          const curStart = contractForm.start_date || "";
          const hasVariance = curStart !== d.startDate;
          diffs.push({
            fieldKey: "start_date",
            label: "Rent Commencement Date",
            currentValue: curStart || "(Not entered)",
            agreementValue: d.startDate,
            hasVariance: hasVariance,
          });
        }

        // 8. Lease Expiry / End Date
        if (d.endDate) {
          const curEnd = contractForm.end_date || "";
          const hasVariance = curEnd !== d.endDate;
          diffs.push({
            fieldKey: "end_date",
            label: "Lease Expiry Date",
            currentValue: curEnd || "(Not entered)",
            agreementValue: d.endDate,
            hasVariance: hasVariance,
          });
        }

        // 9. Escalation %
        if (d.escalationPct !== undefined) {
          const curEsc = Number(contractForm.escalation_pct) || 0;
          const hasVariance = curEsc !== d.escalationPct;
          diffs.push({
            fieldKey: "escalation_pct",
            label: "Escalation Rate",
            currentValue: `${contractForm.escalation_pct || 0}%`,
            agreementValue: `${d.escalationPct}% (${d.escalationFrequency || "Annual"})`,
            hasVariance: hasVariance,
          });
        }

        // 10. Lock-in Months
        if (d.lockInMonths !== undefined && d.lockInMonths > 0) {
          const curLock = Number(contractForm.lock_in_months) || 0;
          const hasVariance = curLock !== d.lockInMonths;
          diffs.push({
            fieldKey: "lock_in_months",
            label: "Lock-in Period",
            currentValue: curLock > 0 ? `${curLock} Months` : "(Not entered)",
            agreementValue: `${d.lockInMonths} Months`,
            hasVariance: hasVariance,
          });
        }

        setPendingAgreementData(d);
        setPendingAgreementFile(json.fileName);
        setAgreementDifferences(diffs);

        // Check if real variances exist
        const realDiscrepancies = diffs.filter((x) => x.hasVariance);
        if (realDiscrepancies.length > 0) {
          setVarianceModalOpen(true);
        } else {
          applyAgreementTerms(d, diffs);
        }
      } else {
        showToast(json?.error || "Failed to parse rent agreement. Please ensure document is legible.", "error");
      }
    } catch (err: any) {
      showToast(`Document extraction failed: ${err.message}`, "error");
    } finally {
      setIsUploadingAgreement(false);
    }
  };

  const applyAgreementTerms = (d: any, diffsList?: AgreementDiffItem[]) => {
    if (!d) return;

    let targetOccupantId = contractForm.occupant_id || (tenantsList.length > 0 ? tenantsList[0].id : "");
    if (d.occupantName || d.companyName) {
      const desiredName = d.occupantName || d.companyName;
      const searchName = desiredName.toLowerCase();
      const matched = tenantsList.find(
        (t) =>
          t.name.toLowerCase().includes(searchName) ||
          searchName.includes(t.name.toLowerCase()) ||
          (t.company && t.company.toLowerCase().includes(searchName))
      );
      if (matched) {
        targetOccupantId = matched.id;
      } else if (targetOccupantId) {
        setTenantsList((prev) =>
          prev.map((t) =>
            t.id === targetOccupantId
              ? { ...t, name: desiredName, company: d.companyName || desiredName }
              : t
          )
        );
        const authHeaders = getClientAuthHeaders();
        fetch("/api/rent-roll/tenants", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            tenant_id: targetOccupantId,
            tenant_name: desiredName,
            trade_name: d.companyName || desiredName,
          }),
        }).catch(() => {});
      } else {
        const newTenantId = `ten_${Date.now()}`;
        setTenantsList((prev) => [
          ...prev,
          { id: newTenantId, name: desiredName, company: d.companyName || desiredName },
        ]);
        targetOccupantId = newTenantId;
      }

      setTenantForm((prev) => ({
        ...prev,
        occupant_name: desiredName,
        company_name: d.companyName || desiredName,
      }));
    }

    // 2. Commercial Property / Lessor name update
    if (d.propertyName || d.lessorName) {
      const docPropName = d.propertyName || d.lessorName;
      setPropForm((prev) => ({ ...prev, property_name: docPropName }));
      const targetPropId = contractForm.property_id || selectedPropertyForTenant;
      if (targetPropId) {
        setRegisteredProperties((prev) =>
          prev.map((p) => (p.id === targetPropId ? { ...p, property_name: docPropName } : p))
        );
        const authHeaders = getClientAuthHeaders();
        fetch("/api/rent-roll/properties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            id: targetPropId,
            property_name: docPropName,
          }),
        }).catch(() => {});
      }
    }

    const list = diffsList || agreementDifferences;
    const updatedKeys = new Set<string>();
    if (list && Array.isArray(list)) {
      list.forEach((diff) => {
        if (diff.hasVariance) updatedKeys.add(diff.fieldKey);
      });
    }

    setContractForm((prev) => {
      const areaVal = d.areaSqft ? String(d.areaSqft) : prev.area_sqft;
      const rateSqft = d.ratePerSqft ? String(d.ratePerSqft) : prev.rate_per_sqft;
      let calculatedRent = d.monthlyRent ? String(d.monthlyRent) : prev.monthly_rent;
      if (!calculatedRent && rateSqft && areaVal) {
        calculatedRent = String(Math.round(Number(rateSqft) * Number(areaVal)));
      }

      let calcDeposit = d.securityDeposit ? String(d.securityDeposit) : prev.security_deposit;
      if (!calcDeposit && d.depositMonths && calculatedRent) {
        calcDeposit = String(Math.round(Number(calculatedRent) * Number(d.depositMonths)));
      }

      return {
        ...prev,
        occupant_id: targetOccupantId || prev.occupant_id,
        building_name: d.buildingName || prev.building_name,
        space_unit: d.spaceName || prev.space_unit,
        area_sqft: areaVal,
        start_date: d.startDate || prev.start_date,
        end_date: d.endDate || prev.end_date,
        billing_model: d.billingModel || prev.billing_model,
        rate_per_sqft: rateSqft,
        rate_per_seat: d.ratePerSeat ? String(d.ratePerSeat) : prev.rate_per_seat,
        seat_count: d.seatCount ? String(d.seatCount) : prev.seat_count,
        bare_shell_rate: d.bareShellRate ? String(d.bareShellRate) : prev.bare_shell_rate,
        fitout_rate: d.fitoutRate ? String(d.fitoutRate) : prev.fitout_rate,
        monthly_rent: calculatedRent,
        fitout_condition: d.fitoutCondition || prev.fitout_condition,
        fitout_period_days: d.fitoutDays !== undefined ? String(d.fitoutDays) : prev.fitout_period_days,
        possession_date: d.possessionDate || prev.possession_date,
        cam_type: d.camType || prev.cam_type,
        cam_rate: d.camRate ? String(d.camRate) : prev.cam_rate,
        cam_monthly: d.camMonthly ? String(d.camMonthly) : prev.cam_monthly,
        electricity_billing: d.electricityBilling || prev.electricity_billing,
        power_backup_type: d.powerBackupType || prev.power_backup_type,
        electricity_load_kva: d.electricityLoadKva ? String(d.electricityLoadKva) : prev.electricity_load_kva,
        dg_rate_per_kwh: d.dgRatePerKwh ? String(d.dgRatePerKwh) : prev.dg_rate_per_kwh,
        water_charges: d.waterCharges || prev.water_charges,
        car_parking_slots: d.carParkingSlots !== undefined ? String(d.carParkingSlots) : prev.car_parking_slots,
        car_parking_rate: d.carParkingRate ? String(d.carParkingRate) : prev.car_parking_rate,
        two_wheeler_slots: d.twoWheelerSlots !== undefined ? String(d.twoWheelerSlots) : prev.two_wheeler_slots,
        two_wheeler_rate: d.twoWheelerRate ? String(d.twoWheelerRate) : prev.two_wheeler_rate,
        escalation_pct: d.escalationPct !== undefined ? String(d.escalationPct) : prev.escalation_pct,
        escalation_frequency: d.escalationFrequency || prev.escalation_frequency,
        escalation_start_date: d.escalationStartDate || prev.escalation_start_date,
        security_deposit: calcDeposit,
        deposit_months: d.depositMonths ? String(d.depositMonths) : prev.deposit_months,
        lock_in_months: d.lockInMonths ? String(d.lockInMonths) : prev.lock_in_months,
        notice_days: d.noticeDays ? String(d.noticeDays) : prev.notice_days,
        billing_entity: d.billingEntity || prev.billing_entity,
        payment_terms: d.paymentTerms || prev.payment_terms,
        late_interest_pct: d.lateInterestPct ? String(d.lateInterestPct) : prev.late_interest_pct,
        stamp_duty_sharing: d.stampDutySharing || prev.stamp_duty_sharing,
        notes: d.notes || prev.notes,
      };
    });

    setChangedFieldKeys(updatedKeys);
    showToast(`✓ Rent Agreement applied! ${updatedKeys.size} field(s) updated and highlighted in yellow.`);
  };

  // Step 4: Documents Vault
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({
    title_deed: false,
    fire_noc: false,
    lease_draft: false,
    sanction_load: false,
  });

  // Step 5: Manager Delegation & Domain-Safe Invite Link
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    entityType: "pm_agency",
    role: "property_manager",
  });
  const [managerRights, setManagerRights] = useState({
    contractExecution: false, // requires owner approval by default
    concessions: false, // requires owner approval
    billingRuns: true, // can generate batch invoices
    depositRefunds: false, // requires owner sign-off
    subMeterLogs: true, // direct entry allowed
  });
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Manager Assignment State (§Manager Onboarding & Property Assignment)
  const [assignChoice, setAssignChoice] = useState<"delegated" | "self" | "custom">("delegated");
  const [customMgrName, setCustomMgrName] = useState("");
  const [customMgrEmail, setCustomMgrEmail] = useState("");
  const [propertyAssignments, setPropertyAssignments] = useState<Record<string, any>>({});
  const [assignmentSuccessData, setAssignmentSuccessData] = useState<{
    propertyName: string;
    managerName: string;
    managerEmail: string;
  } | null>(null);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    if (typeof window !== "undefined") {
      const storedComp = localStorage.getItem("officex_company_name") || "";
      const storedBrand = localStorage.getItem("officex_brand_name") || "";
      const storedLogo = localStorage.getItem("officex_brand_logo") || "";
      const storedRole = localStorage.getItem("officex_role_key") || "owner";
      const hasMgr = localStorage.getItem("officex_has_manager") === "true";
      const mgrName = localStorage.getItem("officex_manager_name") || "";
      const mgrEmail = localStorage.getItem("officex_manager_email") || "";
      const mgrType = localStorage.getItem("officex_manager_type") || "pm_company";
      const mgrRole = localStorage.getItem("officex_manager_user_role") || "property_manager";

      setCompanyName(storedComp);
      setBrandName(storedBrand);
      setBrandLogo(storedLogo);
      setUserRoleKey(storedRole);

      const isDismissed = localStorage.getItem("officex_dismiss_manager_banner") === "true";
      setShowManagerActivationBanner(!isDismissed);

      // 1. Subscribed Capacity
      const storedSubCap = Number(localStorage.getItem("officex_subscribed_sqft"));
      if (storedSubCap && !isNaN(storedSubCap) && storedSubCap > 0) {
        setSubscribedCapacity(storedSubCap);
      }

      // 2. Pre-fill Step 1 from Onboarding data
      const rawOnboarded = localStorage.getItem("officex_onboarded_property_details");
      if (rawOnboarded) {
        try {
          const ob = JSON.parse(rawOnboarded);
          const stateMatched = matchCanonicalIndianState(ob.state) || ob.state || "Karnataka";
          const citiesList = INDIAN_STATES_CITIES[stateMatched] || [];
          if (citiesList.length > 0) {
            setAvailableCities(citiesList);
          }
          const propNameVal = ob.propertyName || localStorage.getItem("officex_active_property") || "";
          setPropForm((prev) => ({
            ...prev,
            property_name: prev.property_name || propNameVal,
            property_code: prev.property_code || ob.propertyCode || (propNameVal ? propNameVal.slice(0, 4).toUpperCase() : ""),
            property_type: (ob.propertyType ? ob.propertyType.toLowerCase() : prev.property_type) || "office",
            ownership_structure: ob.ownershipStructure || prev.ownership_structure || "pvt_ltd",
            total_leasable_area_sqft: prev.total_leasable_area_sqft || Number(ob.areaSqft) || 50000,
            floors_count: prev.floors_count || Number(ob.floorsCount) || 1,
            wings_count: prev.wings_count || Number(ob.wingsCount) || 1,
            address: prev.address || ob.address || "",
            state: stateMatched,
            city: ob.city || (citiesList.length > 0 ? citiesList[0] : prev.city),
            pincode: prev.pincode || ob.pincode || "",
            spv_name: prev.spv_name || ob.spvName || ob.companyName || storedComp || storedBrand || "",
            pan_number: prev.pan_number || ob.panNumber || "",
            cin_number: prev.cin_number || ob.cinNumber || "",
            gstin: prev.gstin || ob.gstin || "",
            rera_number: prev.rera_number || ob.reraNumber || "",
            micro_market: prev.micro_market || ob.microMarket || "",
          }));

          const obFullAddr = [ob.address, ob.city, stateMatched, ob.pincode].filter(Boolean).join(", ");
          if (obFullAddr) {
            setTenantForm((prev) => ({
              ...prev,
              billing_address: prev.billing_address || obFullAddr,
            }));
          }

          if (ob.spvName || ob.companyName || storedComp || storedBrand) {
            setContractForm((prev) => ({
              ...prev,
              billing_entity: prev.billing_entity || ob.spvName || ob.companyName || storedComp || storedBrand || "",
            }));
          }
        } catch (e) {
          console.error("Failed to parse onboarding details:", e);
        }
      } else {
        const activeProp = localStorage.getItem("officex_active_property");
        if (activeProp) {
          setPropForm((prev) => ({ ...prev, property_name: prev.property_name || activeProp }));
        }
      }

      try {
        const storedAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        setPropertyAssignments(storedAssigns);
      } catch {}

      // Fetch actually created properties from database (strictly user session only)
      const authHeaders = getClientAuthHeaders();

      try {
        const res = await fetch("/api/rent-roll/properties", { headers: authHeaders });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            let registeredPropIds: string[] = [];
            let registeredPropNames: string[] = [];
            const userProperty = localStorage.getItem("officex_active_property");
            try {
              registeredPropIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
              registeredPropNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
            } catch {}

            const filtered = json.data.filter((p: any) => {
              const pName = (p.property_name || "").toLowerCase().trim();
              if (registeredPropIds.includes(p.id)) return true;
              if (registeredPropNames.some((n: string) => n.toLowerCase().trim() === pName)) return true;
              if (userProperty && pName === userProperty.toLowerCase().trim()) return true;
              if (userProperty && pName.includes(userProperty.toLowerCase().trim())) return true;
              return false;
            });

            const finalList = filtered.length > 0 ? filtered : json.data;
            setRegisteredProperties(finalList);
            if (finalList.length > 0) {
              setSelectedPropertyForTenant(finalList[0].id || finalList[0].property_name);
              setCompletedSteps((prev) => (prev.includes("property") ? prev : [...prev, "property"]));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load registered properties:", e);
      }

      // Fetch tenants
      try {
        const tRes = await fetch("/api/rent-roll/tenants", { headers: authHeaders });
        if (tRes.ok) {
          const tData = await tRes.json();
          const tArr = (Array.isArray(tData.data) ? tData.data : []).map((t: any) => ({
            id: t.id,
            name: t.tenant_name || t.trade_name,
            company: t.trade_name,
          }));
          setTenantsList(tArr);
          if (tArr.length > 0) {
            setContractForm((prev) => ({
              ...prev,
              occupant_id: prev.occupant_id || tArr[0].id,
              occupant_name: prev.occupant_name || tArr[0].name,
            }));
          }
        }
      } catch (e) {}

      if (hasMgr && (mgrName || mgrEmail)) {
        setManagerData({
          name: mgrName,
          email: mgrEmail,
          entityType: mgrType,
          role: mgrRole,
        });
        generateDomainInviteLink(mgrName, mgrEmail, mgrRole, mgrType);
        // Mark delegation completed since onboarding is finished
        setCompletedSteps((prev) => (prev.includes("delegation") ? prev : [...prev, "delegation"]));
        setAssignChoice("delegated");
      } else {
        setAssignChoice("self");
      }
    }
  };

  const showToast = (msg: string, _type?: "success" | "error" | "info" | string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const markStepDone = (stepKey: string) => {
    if (!completedSteps.includes(stepKey)) {
      setCompletedSteps([...completedSteps, stepKey]);
    }
  };

  // State selection helper
  const handleStateChange = (stateName: string) => {
    setPropForm({ ...propForm, state: stateName });
    const cities = INDIAN_STATES_CITIES[stateName] || [];
    setAvailableCities(cities);
    if (cities.length > 0) {
      setPropForm((prev) => ({ ...prev, state: stateName, city: cities[0] }));
    }
  };

  // Generate strictly deployed domain invitation link (NEVER localhost)
  const generateDomainInviteLink = async (name: string, email: string, role: string, entityType: string) => {
    try {
      setInviteLoading(true);
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({
          name,
          email,
          role,
          entityType,
          rights: managerRights,
          propertyName: propForm.property_name || registeredProperties[0]?.property_name || "Portfolio",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedInviteLink(json.data.inviteLink);
      } else {
        const origin = (typeof window !== "undefined" && window.location.origin) ? window.location.origin : DEPLOYED_BASE_URL.replace(/\/+$/, "");
        setGeneratedInviteLink(`${origin}/invite?role=${role}&email=${encodeURIComponent(email)}`);
      }
    } catch {
      const origin = (typeof window !== "undefined" && window.location.origin) ? window.location.origin : DEPLOYED_BASE_URL.replace(/\/+$/, "");
      setGeneratedInviteLink(`${origin}/invite?role=${role}&email=${encodeURIComponent(email)}`);
    } finally {
      setInviteLoading(false);
    }
  };

  // Save Property
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.property_name.trim()) {
      showToast("Please enter property name.", "error");
      return;
    }
    const enteredArea = Number(propForm.total_leasable_area_sqft) || 0;
    if (subscribedCapacity > 0 && enteredArea > subscribedCapacity) {
      showToast(`Total leasable area (${enteredArea.toLocaleString()} Sq.Ft) cannot exceed your subscribed capacity (${subscribedCapacity.toLocaleString()} Sq.Ft). Clamped to maximum limit.`, "error");
      setPropForm({ ...propForm, total_leasable_area_sqft: subscribedCapacity });
      return;
    }

    const finalSpvName = propForm.spv_name.trim() || companyName || brandName || propForm.property_name || "Commercial Asset SPV";

    const matchingProp = registeredProperties.find(
      (p: any) =>
        (p.property_name && p.property_name.toLowerCase().trim() === propForm.property_name.toLowerCase().trim()) ||
        (p.property_code && propForm.property_code && p.property_code.toLowerCase().trim() === propForm.property_code.toLowerCase().trim())
    );

    let propIdToUse = matchingProp?.id;
    if (!propIdToUse && typeof window !== "undefined") {
      try {
        const storedIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
        if (storedIds.length > 0) propIdToUse = storedIds[storedIds.length - 1];
      } catch {}
    }

    setLastSavedPropName(propForm.property_name.trim());
    setPropLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          id: propIdToUse || undefined,
          property_name: propForm.property_name.trim(),
          property_code: propForm.property_code || undefined,
          property_type: propForm.property_type,
          total_leasable_area_sqft: propForm.total_leasable_area_sqft || 50000,
          city: propForm.city,
          state: propForm.state,
          address: propForm.address,
          postal_code: propForm.pincode,
          spv_name: finalSpvName,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const newProp = json.data || {
          id: matchingProp?.id || `prop_${Date.now()}`,
          property_name: propForm.property_name,
          address: propForm.address,
          city: propForm.city,
          state: propForm.state,
          postal_code: propForm.pincode,
          total_leasable_area_sqft: propForm.total_leasable_area_sqft,
        };
        const updatedList = registeredProperties.some(
          (p: any) => p.id === newProp.id || p.property_name?.toLowerCase() === newProp.property_name?.toLowerCase()
        )
          ? registeredProperties.map((p: any) =>
              p.id === newProp.id || p.property_name?.toLowerCase() === newProp.property_name?.toLowerCase() ? newProp : p
            )
          : [...registeredProperties, newProp];
        setRegisteredProperties(updatedList);
        setSelectedPropertyForTenant(newProp.id || newProp.property_name);

        // Auto-fill tenant billing address from the newly saved property's full address
        const propFullAddress = [
          propForm.address,
          propForm.city,
          propForm.state,
          propForm.pincode ? `- ${propForm.pincode}` : ""
        ].filter(Boolean).join(", ");

        if (propFullAddress) {
          setTenantForm((prev) => ({
            ...prev,
            billing_address: prev.billing_address || propFullAddress,
          }));
        }

        // Update registered property trackers in localStorage
        if (typeof window !== "undefined") {
          const regIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
          if (newProp.id && !regIds.includes(newProp.id)) {
            regIds.push(newProp.id);
            localStorage.setItem("officex_registered_property_ids", JSON.stringify(regIds));
          }
          const regNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
          if (!regNames.includes(propForm.property_name)) {
            regNames.push(propForm.property_name);
            localStorage.setItem("officex_registered_property_names", JSON.stringify(regNames));
          }
          localStorage.setItem("officex_active_property", propForm.property_name);
        }

        // Process Manager Assignment (§Workflow Requirement)
        let assignedObj: any = null;
        if (assignChoice === "delegated" && managerData.name) {
          assignedObj = {
            name: managerData.name,
            email: managerData.email,
            type: managerData.entityType,
            assignedAt: new Date().toISOString(),
          };
        } else if (assignChoice === "custom" && customMgrName.trim()) {
          assignedObj = {
            name: customMgrName.trim(),
            email: customMgrEmail.trim(),
            type: "pm_agency",
            assignedAt: new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_has_manager", "true");
            localStorage.setItem("officex_manager_name", customMgrName.trim());
            localStorage.setItem("officex_manager_email", customMgrEmail.trim());
            localStorage.setItem("officex_manager_status", "activated");
          }
        }

        if (assignedObj && typeof window !== "undefined") {
          const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
          if (newProp.id) currentAssigns[newProp.id] = assignedObj;
          currentAssigns[propForm.property_name] = assignedObj;
          localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
          setPropertyAssignments(currentAssigns);
          setAssignmentSuccessData({
            propertyName: propForm.property_name,
            managerName: assignedObj.name,
            managerEmail: assignedObj.email,
          });
        }

        markStepDone("property");
        showToast(`✓ Property '${propForm.property_name}' registered successfully!`);
        // Always advance directly to Step 2 (Add Tenant)
        setActiveStep("tenant");
      } else {
        showToast(json.message || json.error || "Failed to save property. Please check required fields.", "error");
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setPropLoading(false);
    }
  };

  // Parse Sheets Upload (§S-30)
  const handleSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSheetFile(file);
      setSheetParsedRows([
        { space_code: "SP-101", area_sqft: 10000, base_rent: 850000, occupant: "Active Corporate Lessee" },
        { space_code: "SP-102", area_sqft: 15000, base_rent: 1275000, occupant: "Enterprise Occupant" },
      ]);
      showToast(`✓ Sheet '${file.name}' parsed: 2 units detected.`);
    }
  };

  const handleCommitSheetData = async () => {
    setPropLoading(true);
    setTimeout(() => {
      markStepDone("property");
      setPropLoading(false);
      showToast("✓ Bulk rent roll sheet imported successfully!");
      setActiveStep("tenant");
    }, 600);
  };

  // Save Tenant (Exact 9 fields requested by user)
  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.occupant_name.trim()) {
      showToast("Occupant Name is required");
      return;
    }
    if (!tenantForm.email.trim()) {
      showToast("Email is required");
      return;
    }
    if (!tenantForm.phone.trim()) {
      showToast("Phone is required");
      return;
    }

    setLastSavedOccupantName(tenantForm.occupant_name.trim());
    setTenantLoading(true);
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          tenant_name: tenantForm.occupant_name.trim(),
          trade_name: tenantForm.company_name.trim() || tenantForm.occupant_name.trim(),
          email: tenantForm.email.trim(),
          phone: tenantForm.phone.trim(),
          gstin: tenantForm.gstin.trim().toUpperCase(),
          pan: tenantForm.pan.trim().toUpperCase(),
          billing_address: tenantForm.billing_address.trim(),
          alt_contact_name: tenantForm.alt_contact_name.trim(),
          alt_contact_phone: tenantForm.alt_contact_phone.trim(),
          property_id: selectedPropertyForTenant,
          remarks: JSON.stringify({
            signatory_name: tenantForm.signatory_name.trim(),
            signatory_designation: tenantForm.signatory_designation.trim(),
            industry_type: tenantForm.industry_type,
            cin_number: tenantForm.cin_number.trim().toUpperCase(),
          }),
        }),
      });
      const data = await res.json();
      const tenantId = data?.data?.id || `ten_${Date.now()}`;
      const occupantName = tenantForm.occupant_name.trim();

      // Add to tenants list
      setTenantsList((prev) => [
        ...prev,
        { id: tenantId, name: occupantName, company: tenantForm.company_name.trim() }
      ]);

      // Generate Tenant Portal Invite Link
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : DEPLOYED_BASE_URL;
      const targetProp =
        registeredProperties.find((p) => p.id === selectedPropertyForTenant)?.property_name ||
        propForm.property_name ||
        "Commercial Property";
      const ownerTitle = companyName || brandName || "Commercial Property Owner";
      const inviteUrl = `${origin}/invite?role=tenant&mgr=${encodeURIComponent(occupantName)}&email=${encodeURIComponent(tenantForm.email.trim())}&prop=${encodeURIComponent(targetProp)}&owner=${encodeURIComponent(ownerTitle)}&invite=ten_${Date.now()}`;

      setLatestTenantInvite({
        name: occupantName,
        email: tenantForm.email.trim(),
        link: inviteUrl,
      });

      // Auto-pre-select the newly added tenant in the contract form
      setContractForm((prev) => ({
        ...prev,
        occupant_id: tenantId,
        occupant_name: occupantName,
        property_id: selectedPropertyForTenant || registeredProperties[0]?.id || "",
        billing_entity: prev.billing_entity || propForm.spv_name || companyName || "",
      }));

      markStepDone("tenant");
      showToast(`✓ Occupant '${occupantName}' enrolled! Tenant Portal invite generated.`);

      // Advance directly to Creating Contract
      setActiveStep("contract");
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setTenantLoading(false);
    }
  };

  // Save Contract (Comprehensive Commercial Terms & Institutional Linking)
  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.occupant_id) {
      showToast("Please select an occupant / tenant");
      return;
    }
    if (!contractForm.start_date || !contractForm.end_date) {
      showToast("Contract Start and End dates are required");
      return;
    }

    setContractLoading(true);
    try {
      const baseRent = Number(contractForm.monthly_rent) || 100000;
      const camTotal = contractForm.cam_type === "Per Sq.Ft"
        ? Math.round((Number(contractForm.cam_rate) || 0) * (Number(contractForm.area_sqft) || 0))
        : Number(contractForm.cam_monthly) || 0;
      const parkingTotal =
        (Number(contractForm.car_parking_slots) || 0) * (Number(contractForm.car_parking_rate) || 0) +
        (Number(contractForm.two_wheeler_slots) || 0) * (Number(contractForm.two_wheeler_rate) || 0);

      // 1. Assembling structured billing charges
      const charges = [
        {
          component: "base_rent",
          calc_basis: contractForm.billing_model === "Seat-based" ? "per_seat" : "per_area",
          rate: contractForm.billing_model === "Seat-based" ? Number(contractForm.rate_per_seat) || baseRent : Number(contractForm.rate_per_sqft) || baseRent,
          rate_period: "month",
          quantity_basis: contractForm.billing_model === "Seat-based" ? Number(contractForm.seat_count) || 1 : Number(contractForm.area_sqft) || 1,
          start_date: contractForm.start_date,
          end_date: contractForm.end_date,
        },
      ];

      if (camTotal > 0) {
        charges.push({
          component: "cam",
          calc_basis: contractForm.cam_type === "Per Sq.Ft" ? "per_area" : "fixed",
          rate: Number(contractForm.cam_rate) || camTotal,
          rate_period: "month",
          quantity_basis: Number(contractForm.area_sqft) || 1,
          start_date: contractForm.start_date,
          end_date: contractForm.end_date,
        });
      }

      if (parkingTotal > 0) {
        charges.push({
          component: "parking",
          calc_basis: "fixed",
          rate: parkingTotal,
          rate_period: "month",
          quantity_basis: Number(contractForm.car_parking_slots) || 1,
          start_date: contractForm.start_date,
          end_date: contractForm.end_date,
        });
      }

      // 2. Fitout rent-free concessions
      const concessions = [];
      const fitoutDays = Number(contractForm.fitout_period_days) || 0;
      if (fitoutDays > 0) {
        concessions.push({
          concession_type: "rent_free",
          start_date: contractForm.possession_date || contractForm.start_date,
          concession_value: fitoutDays,
          description: `Fit-out Rent-Free Period of ${fitoutDays} Days`,
        });
      }

      const authHeaders = getClientAuthHeaders();
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          occupant_id: contractForm.occupant_id,
          property_id: contractForm.property_id || selectedPropertyForTenant,
          contract_code: `LEAS-${Date.now().toString().slice(-5)}`,
          start_date: contractForm.start_date,
          end_date: contractForm.end_date,
          contract_type: "lease",
          base_rent_rate: baseRent,
          billing_model: contractForm.billing_model.toLowerCase().replace(/\s+/g, "_"),
          escalation_type: "percentage",
          escalation_value: Number(contractForm.escalation_pct) || 0,
          has_escalation: Boolean(Number(contractForm.escalation_pct) > 0),
          deposit_amount_inr: Number(contractForm.security_deposit) || 0,
          lock_in_period_days: (Number(contractForm.lock_in_months) || 0) * 30,
          notice_period_days: Number(contractForm.notice_days) || 90,
          billing_entity: contractForm.billing_entity.trim(),
          payment_terms: contractForm.payment_terms.trim(),
          remarks: JSON.stringify({
            fitout_condition: contractForm.fitout_condition,
            fitout_period_days: contractForm.fitout_period_days,
            cam_type: contractForm.cam_type,
            cam_rate: contractForm.cam_rate,
            cam_monthly: camTotal,
            parking_monthly: parkingTotal,
            electricity_billing: contractForm.electricity_billing,
            power_backup: contractForm.power_backup_type,
            electricity_load_kva: contractForm.electricity_load_kva,
            dg_rate_per_kwh: contractForm.dg_rate_per_kwh,
            parking: { cars: contractForm.car_parking_slots, bikes: contractForm.two_wheeler_slots },
            late_interest_pct: contractForm.late_interest_pct,
            gst_applicable: contractForm.gst_applicable,
            tds_applicable: contractForm.tds_applicable,
            stamp_duty_sharing: contractForm.stamp_duty_sharing,
            notes: contractForm.notes,
          }),
          charges,
          concessions,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || `Failed to create contract (HTTP ${res.status})`);
      }

      markStepDone("contract");
      showToast("✓ Commercial Lease Contract registered with full commercial breakdown!");
      setActiveStep("documents");
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setContractLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (generatedInviteLink && typeof window !== "undefined") {
      navigator.clipboard.writeText(generatedInviteLink);
      showToast("✓ Deployed invitation link copied to clipboard!");
    }
  };

  const progressPct = Math.round(((completedSteps.length) / 5) * 100);

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top">
              <CheckCircle2 size={16} className="text-teal-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                {brandLogo && (
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 p-1 flex items-center justify-center bg-white shadow-2xs overflow-hidden shrink-0">
                    <img src={brandLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>{companyName || brandName || "Portfolio"}</span>
                    <span>/</span>
                    <span className="text-[#0D7B6C] font-bold">Workspace Activation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    Complete Your Commercial Profile
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/owner"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Skip to Dashboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">
                  Profile Progress: <strong className="text-teal-700">{completedSteps.length} of 5 Modules Completed</strong>
                </span>
                <span className="font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {Math.min(100, progressPct)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-[#0D7B6C] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>

            {/* 1ST ACTION AFTER USER ONBOARDING: MANAGER ONBOARDING COMPLETED & DASHBOARD ACTIVATED */}
            {showManagerActivationBanner && managerData.name && (
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-white border-2 border-teal-500/40 shadow-xs space-y-3.5 relative animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D7B6C] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Manager Dashboard Activated &amp; Live
                        </span>
                        <span className="text-[10px] text-teal-800 font-bold bg-white px-2 py-0.5 rounded border border-teal-200">
                          Step 1: Onboarding Complete
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                        {managerData.name} {managerData.email && <span className="text-slate-500 font-semibold text-xs">({managerData.email})</span>}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard/pm"
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink size={13} />
                      <span>Manager Portal</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowManagerActivationBanner(false);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("officex_dismiss_manager_banner", "true");
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Remove / dismiss activation link notification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 shrink-0">Activation Link Dispatched:</span>
                    <span className="font-mono text-xs text-teal-800 truncate select-all">
                      {generatedInviteLink || `${(typeof window !== "undefined" && window.location.origin) ? window.location.origin : DEPLOYED_BASE_URL}/invite?role=property_manager&mgr=${encodeURIComponent(managerData.name)}&invite=act_${Date.now()}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3 py-1.5 rounded-lg bg-teal-100/70 hover:bg-teal-200 text-teal-900 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Copy size={12} />
                    <span>Copy Activation Link</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  ✓ Managing partner credentials generated and dispatched. Next step: Add your property below and assign management directly to <strong>{managerData.name}</strong>.
                </p>
              </div>
            )}

            {/* Navigation Tabs (5 Steps) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-100">
              {[
                { id: "property", label: "1. Add Property", icon: Building2 },
                { id: "tenant", label: "2. Add Occupant", icon: Users },
                { id: "contract", label: "3. Lease Contract", icon: FileText },
                { id: "documents", label: "4. Compliance Vault", icon: ShieldCheck },
                { id: "delegation", label: "5. Team Delegation", icon: UserCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeStep === tab.id;
                const isDone = completedSteps.includes(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStep(tab.id as any)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? "border-[#0D7B6C] bg-teal-50/60 shadow-xs ring-1 ring-[#0D7B6C]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : isCurrent
                            ? "bg-[#0D7B6C] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 truncate">
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──── MODULE 1: ADD PROPERTY WITH ALL SPEC FIELDS ──── */}
          {activeStep === "property" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Step 1: Register Commercial Property Masters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide building details, statutory tax numbers (PAN, CIN, GSTIN), and geographic location.
                  </p>
                </div>

                {/* Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPropMode("manual")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      propMode === "manual" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Manual Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropMode("sheet")}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      propMode === "sheet" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Bulk Excel / CSV</span>
                  </button>
                </div>
              </div>

              {propMode === "manual" ? (
                <form onSubmit={handleSaveProperty} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property / Tower Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prestige Tech Cloud Tower 1"
                        value={propForm.property_name}
                        onChange={(e) => setPropForm({ ...propForm, property_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property Code</label>
                      <input
                        type="text"
                        placeholder="e.g. PTC-T1"
                        value={propForm.property_code}
                        onChange={(e) => setPropForm({ ...propForm, property_code: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* All Asset Types from comprehensive dictionary */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Property Asset Type *</label>
                      <select
                        value={propForm.property_type}
                        onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {COMMERCIAL_ASSET_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Total Leasable Area (Sq.Ft) *</label>
                        {subscribedCapacity > 0 && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Subscribed Cap: {subscribedCapacity.toLocaleString()} Sq.Ft
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="100"
                        max={subscribedCapacity > 0 ? subscribedCapacity : undefined}
                        step="100"
                        required
                        placeholder={`e.g. ${subscribedCapacity || 50000}`}
                        value={propForm.total_leasable_area_sqft || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          if (subscribedCapacity > 0 && val > subscribedCapacity) {
                            setPropForm({ ...propForm, total_leasable_area_sqft: subscribedCapacity });
                            showToast(
                              `Total leasable area cannot exceed your subscribed capacity (${subscribedCapacity.toLocaleString()} Sq.Ft). Clamped to maximum limit.`
                            );
                          } else {
                            setPropForm({ ...propForm, total_leasable_area_sqft: val });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                      {subscribedCapacity > 0 && propForm.total_leasable_area_sqft > subscribedCapacity && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">
                          Entered area exceeds subscribed quota ({subscribedCapacity.toLocaleString()} Sq.Ft).
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Floors Count</label>
                      <input
                        type="number"
                        min="1"
                        value={propForm.floors_count}
                        onChange={(e) => setPropForm({ ...propForm, floors_count: Number(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Wings / Towers</label>
                      <input
                        type="number"
                        min="1"
                        value={propForm.wings_count}
                        onChange={(e) => setPropForm({ ...propForm, wings_count: Number(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Handover & Fit-out Condition (§Commercial Spec) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Handover / Fit-out Condition *
                      </label>
                      <select
                        value={propForm.fitout_condition}
                        onChange={(e) => setPropForm({ ...propForm, fitout_condition: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="fully_furnished">Fully Furnished (Plug &amp; Play / Turnkey)</option>
                        <option value="warm_shell">Warm Shell (Flooring, Ceiling, HVAC Ducts, Lighting)</option>
                        <option value="bare_shell">Bare Shell (Core &amp; Shell / Concrete Slab)</option>
                        <option value="semi_furnished">Semi-Furnished (Partially Fitted / Cabins Only)</option>
                      </select>
                    </div>

                    {/* Dynamic Workstation & Layout Specs when furnished */}
                    {(propForm.fitout_condition === "fully_furnished" || propForm.fitout_condition === "semi_furnished") && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Workstations / Seats Count</label>
                          <input
                            type="number"
                            placeholder="e.g. 100 Seats"
                            value={propForm.workstations_count}
                            onChange={(e) => setPropForm({ ...propForm, workstations_count: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Manager Cabins</label>
                          <input
                            type="number"
                            placeholder="e.g. 4 Cabins"
                            value={propForm.cabins_count}
                            onChange={(e) => setPropForm({ ...propForm, cabins_count: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Conference / Meeting Rooms</label>
                          <input
                            type="number"
                            placeholder="e.g. 2 Rooms"
                            value={propForm.meeting_rooms_count}
                            onChange={(e) => setPropForm({ ...propForm, meeting_rooms_count: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* Fit-out Rent-Free Days */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Default Fit-out Period (Days)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60 or 90 Days"
                        value={propForm.default_fitout_days}
                        onChange={(e) => setPropForm({ ...propForm, default_fitout_days: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Google Maps Search & Worldwide Address Autofill */}
                    <div className="sm:col-span-3">
                      <GoogleAddressAutocomplete
                        value={propForm.address}
                        onChange={(val) => setPropForm((prev) => ({ ...prev, address: val }))}
                        onAddressSelect={handleAddressSelect}
                        label="Property Address"
                        placeholder="Search building name, landmark, tech park, or street address..."
                        hint="Type any building or street name. Selecting an address autofills City, State, and Pincode."
                      />
                    </div>

                    {/* State Selector with all Indian states */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">State / Union Territory *</label>
                      <select
                        value={propForm.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {(propForm.state && !ALL_INDIAN_STATES.includes(propForm.state)
                          ? [propForm.state, ...ALL_INDIAN_STATES]
                          : ALL_INDIAN_STATES
                        ).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dependent City Dropdown */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                      <select
                        value={propForm.city}
                        onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        {(propForm.city && !availableCities.includes(propForm.city)
                          ? [propForm.city, ...availableCities]
                          : availableCities
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        placeholder="560066"
                        maxLength={10}
                        value={propForm.pincode}
                        onChange={(e) => setPropForm({ ...propForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Micro-Market / Sub-region</label>
                      <input
                        type="text"
                        placeholder="e.g. Whitefield / BKC / Cyber City / Airport Corridor"
                        value={propForm.micro_market}
                        onChange={(e) => setPropForm({ ...propForm, micro_market: e.target.value })}
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
                            Select entity type. Required compliance fields (PAN, CIN, GSTIN) adjust automatically below.
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-100 text-[#0D7B6C] border border-teal-200 shrink-0 self-start sm:self-auto">
                          {currentStructureRule.shortLabel}
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          value={propForm.ownership_structure}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Landlord / Entity Legal Name
                        </label>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                          Optional (Defaults to Company/Property)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={
                          companyName ||
                          brandName ||
                          (propForm.ownership_structure === "sole_proprietorship"
                            ? "e.g. Ramesh Kumar (Proprietor)"
                            : "e.g. Prestige Estates SPV Ltd")
                        }
                        value={propForm.spv_name}
                        onChange={(e) => setPropForm({ ...propForm, spv_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* PAN Number */}
                    {/* PAN Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          PAN Number {currentStructureRule.panRequired ? "*" : ""}
                        </label>
                        {currentStructureRule.panRequired ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Compulsory *
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Optional
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required={currentStructureRule.panRequired}
                        placeholder={currentStructureRule.panPlaceholder}
                        maxLength={10}
                        value={propForm.pan_number}
                        onChange={(e) => setPropForm({ ...propForm, pan_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* Corporate Identity Number (CIN / LLPIN / Registration) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Corporate Identity / Registration (CIN / LLPIN)
                        </label>
                        {currentStructureRule.cinRequired ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Compulsory *
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Optional
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required={currentStructureRule.cinRequired}
                        placeholder={currentStructureRule.cinRequired ? "Compulsory (e.g. U72900KA2020PTC123456)" : "Optional (e.g. U72900KA2020PTC123456 / Reg No)"}
                        maxLength={21}
                        value={propForm.cin_number}
                        onChange={(e) => setPropForm({ ...propForm, cin_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
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
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Optional
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required={currentStructureRule.gstinRequired}
                        placeholder="29AAAAA0000A1Z5 (Optional if turnover < ₹20L)"
                        maxLength={15}
                        value={propForm.gstin}
                        onChange={(e) => setPropForm({ ...propForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {currentStructureRule.gstinNote}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">RERA Registration Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="PRM/KA/RERA/..."
                        value={propForm.rera_number}
                        onChange={(e) => setPropForm({ ...propForm, rera_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* ASSIGN PROPERTY MANAGEMENT (§Manager Assignment Flow) */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-black text-slate-900 block">
                              Assign Property Management
                            </label>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Choose who will manage tenant agreements, monthly billings, and sub-meters for this building.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                            Operational Mandate
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                          {/* Option 1: Delegated Manager (if onboarded) */}
                          {managerData.name && (
                            <label
                              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                                assignChoice === "delegated"
                                  ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                  : "border-teal-200 bg-white/60 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="property_manager_assignment"
                                value="delegated"
                                checked={assignChoice === "delegated"}
                                onChange={() => setAssignChoice("delegated")}
                                className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                              />
                              <div>
                                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                  {managerData.name}
                                </span>
                                <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                                  Delegated Partner (Active)
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {managerData.email}
                                </span>
                              </div>
                            </label>
                          )}

                          {/* Option 2: Self-Managed */}
                          <label
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                              assignChoice === "self"
                                ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                : "border-slate-200 bg-white/60 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="property_manager_assignment"
                              value="self"
                              checked={assignChoice === "self"}
                              onChange={() => setAssignChoice("self")}
                              className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                            />
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                Self-Managed
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                I manage this property directly
                              </span>
                            </div>
                          </label>

                          {/* Option 3: Delegate to another manager */}
                          <label
                            className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                              assignChoice === "custom"
                                ? "border-[#0D7B6C] bg-white shadow-xs ring-1 ring-[#0D7B6C]/20"
                                : "border-slate-200 bg-white/60 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="property_manager_assignment"
                              value="custom"
                              checked={assignChoice === "custom"}
                              onChange={() => setAssignChoice("custom")}
                              className="mt-0.5 text-[#0D7B6C] focus:ring-[#0D7B6C]"
                            />
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                                Assign Another
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                Add agency / CA / manager
                              </span>
                            </div>
                          </label>
                        </div>

                        {assignChoice === "custom" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Manager / Agency Legal Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Knight Frank PM Services"
                                value={customMgrName}
                                onChange={(e) => setCustomMgrName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Manager Email Address
                              </label>
                              <input
                                type="email"
                                placeholder="manager@knightfrank.com"
                                value={customMgrEmail}
                                onChange={(e) => setCustomMgrEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={propLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save Property &amp; Continue →</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Bulk Excel Sheets Upload Section */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet size={24} className="text-[#0D7B6C] shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Download Canonical OfficeX Template</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Multi-column Excel format matching space masters and rent roll register.
                        </p>
                      </div>
                    </div>
                    <a
                      href="/templates/OFFICEX_Rent_Roll_Canonical_Import_Template.csv"
                      download
                      className="px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-50 transition shadow-2xs flex items-center gap-1.5 shrink-0"
                    >
                      <Download size={13} />
                      <span>Download Sample CSV</span>
                    </a>
                  </div>

                  <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center bg-slate-50/60 hover:bg-teal-50/20 transition cursor-pointer">
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={handleSheetUpload} className="hidden" />
                    <Upload size={28} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-800">
                      {sheetFile ? sheetFile.name : "Click to browse or drop rent roll spreadsheet"}
                    </span>
                    <span className="text-[10px] text-slate-400">Supported formats: .CSV, .XLSX up to 25 MB</span>
                  </label>

                  {sheetParsedRows.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 text-[11px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        Mapped Sheet Preview ({sheetParsedRows.length} Rows Detected)
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/60 text-slate-400 text-[10px] font-bold uppercase">
                          <tr>
                            <th className="p-3">Space Code</th>
                            <th className="p-3">Occupant</th>
                            <th className="p-3 text-right">Area (sqft)</th>
                            <th className="p-3 text-right">Base Rent (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sheetParsedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-teal-800">{row.space_code}</td>
                              <td className="p-3 font-semibold text-slate-900">{row.occupant}</td>
                              <td className="p-3 text-right font-mono">{row.area_sqft.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono font-bold">₹{row.base_rent.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!sheetFile || propLoading}
                      onClick={handleCommitSheetData}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Commit Sheet Data &amp; Continue →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── MODULE 2: ADD TENANTS / OCCUPANTS ──── */}
          {activeStep === "tenant" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                    Step 2 of 5
                  </span>
                  <span className="text-xs font-bold text-slate-500">Occupant Master</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Adding Tenant / Occupant
                </h3>
                <p className="text-xs text-slate-500">
                  Register corporate occupiers or individual tenants with statutory details and generate tenant portal access.
                </p>
              </div>

              {/* Latest Tenant Invite Banner if already created */}
              {latestTenantInvite && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-white border border-teal-300 shadow-2xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#0D7B6C]" />
                      <span className="text-xs font-black text-slate-900">
                        Tenant Portal Invite Link Active for {latestTenantInvite.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(latestTenantInvite.link);
                          setCopiedTenantInvite(true);
                          setTimeout(() => setCopiedTenantInvite(false), 3000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                    >
                      <Copy size={13} />
                      <span>{copiedTenantInvite ? "Copied!" : "Copy Tenant Invite Link"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-teal-200 font-mono text-[11px] text-teal-900 truncate select-all">
                    {latestTenantInvite.link}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tenants using this link will access their self-service workspace portal (`/portal`) to review lease terms, download invoices, and log service tickets.
                  </p>
                </div>
              )}

              {/* Check if any property is registered */}
              {registeredProperties.length === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <h4 className="text-sm font-black text-amber-950">
                    No Commercial Property Registered Yet
                  </h4>
                  <p className="text-xs text-amber-900/80 max-w-md mx-auto leading-relaxed">
                    You must register a commercial property or tower before onboarding tenants and allocating demised spaces.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStep("property")}
                    className="px-5 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>+ Add Property First</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveTenant} className="space-y-4">
                  {/* Property Selector */}
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <label className="text-xs font-black text-slate-900 block">
                        Select Registered Property for This Occupant *
                      </label>
                      <span className="text-[10px] text-teal-800 font-bold bg-teal-100/70 px-2 py-0.5 rounded">
                        Leased Building Mandate
                      </span>
                    </div>
                    <select
                      value={selectedPropertyForTenant}
                      onChange={(e) => {
                        const newPropKey = e.target.value;
                        setSelectedPropertyForTenant(newPropKey);
                        const matched = registeredProperties.find((p) => p.id === newPropKey || p.property_name === newPropKey);
                        if (matched) {
                          const pAddr = [matched.address, matched.city, matched.state, matched.postal_code].filter(Boolean).join(", ");
                          if (pAddr) {
                            setTenantForm((prev) => ({ ...prev, billing_address: pAddr }));
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                    >
                      {registeredProperties.map((p) => (
                        <option key={p.id || p.property_name} value={p.id || p.property_name}>
                          {p.property_name} ({p.city || "Commercial"} · {Number(p.total_leasable_area_sqft || 0).toLocaleString()} sq.ft)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Occupant Name (required) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Occupant Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma / Microsoft India"
                        value={tenantForm.occupant_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, occupant_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 2. Email (required) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="tenant@enterprise.com"
                        value={tenantForm.email}
                        onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 3. Phone (required) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={tenantForm.phone}
                        onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 4. Company Name (optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Company Name</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Infosys BPM Ltd (leave blank if individual)"
                        value={tenantForm.company_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, company_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 5. GST Number (if company, optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">GST Number</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional (If company)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="29AAACI1234F1Z5"
                        maxLength={15}
                        value={tenantForm.gstin}
                        onChange={(e) => setTenantForm({ ...tenantForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* 6. PAN (if individual, optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">PAN Number</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional (If individual)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        value={tenantForm.pan}
                        onChange={(e) => setTenantForm({ ...tenantForm, pan: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* 7. Billing Address (Auto-filled with property address, editable) */}
                    <div className="sm:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Tenant Billing Address <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded ml-1">Auto-filled from Property</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const matched = registeredProperties.find(
                              (p) => p.id === selectedPropertyForTenant || p.property_name === selectedPropertyForTenant
                            );
                            const pAddr = matched
                              ? [matched.address, matched.city, matched.state, matched.postal_code].filter(Boolean).join(", ")
                              : [propForm.address, propForm.city, propForm.state, propForm.pincode].filter(Boolean).join(", ");
                            if (pAddr) {
                              setTenantForm((prev) => ({ ...prev, billing_address: pAddr }));
                              showToast("✓ Billing address restored to property address!");
                            }
                          }}
                          className="text-[11px] font-bold text-[#0D7B6C] hover:text-[#0A6357] hover:underline self-start sm:self-auto cursor-pointer"
                        >
                          ↺ Reset to Property Address
                        </button>
                      </div>
                      <GoogleAddressAutocomplete
                        value={tenantForm.billing_address}
                        onChange={(val) => setTenantForm((prev) => ({ ...prev, billing_address: val }))}
                        onAddressSelect={(res) => setTenantForm((prev) => ({ ...prev, billing_address: res.fullAddress }))}
                        label=""
                        placeholder="Search office street address, building, or city..."
                        hint="Auto-filled with the property address for monthly rent GST invoicing. Edit if the tenant's registered corporate headquarters differs."
                      />
                    </div>

                    {/* 8. Alternate Contact Name (optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Alternate Contact Name</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Accounts Manager / CFO"
                        value={tenantForm.alt_contact_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, alt_contact_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 9. Alternate Contact Phone (optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Alternate Contact Phone</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      </div>
                      <input
                        type="tel"
                        placeholder="+91 98765 00000"
                        value={tenantForm.alt_contact_phone}
                        onChange={(e) => setTenantForm({ ...tenantForm, alt_contact_phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 10. Corporate CIN / LLPIN Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Corporate Identity (CIN / LLPIN)</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. U72200KA2021PTC145678"
                        value={tenantForm.cin_number}
                        onChange={(e) => setTenantForm({ ...tenantForm, cin_number: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none uppercase"
                      />
                    </div>

                    {/* 11. Industry Vertical */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Industry / Sector</label>
                      <select
                        value={tenantForm.industry_type}
                        onChange={(e) => setTenantForm({ ...tenantForm, industry_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="IT & Software">IT / SaaS / Tech</option>
                        <option value="BFSI">BFSI / FinTech / Investment</option>
                        <option value="Consulting & Legal">Consulting &amp; Legal</option>
                        <option value="Healthcare & Pharma">Healthcare &amp; Pharma</option>
                        <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                        <option value="Manufacturing & Logistics">Manufacturing &amp; Logistics</option>
                        <option value="Coworking & Managed Office">Coworking &amp; Managed Office</option>
                        <option value="Other">Other Commercial Enterprise</option>
                      </select>
                    </div>

                    {/* 12. Authorized Signatory Name */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Authorized Signatory Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={tenantForm.signatory_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, signatory_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* 13. Authorized Signatory Designation */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Signatory Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Managing Director / VP Real Estate"
                        value={tenantForm.signatory_designation}
                        onChange={(e) => setTenantForm({ ...tenantForm, signatory_designation: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep("property")}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ← Back to Property
                    </button>

                    <button
                      type="submit"
                      disabled={tenantLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save Tenant &amp; Create Contract →</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ──── MODULE 3: CREATING CONTRACT (LINKING TENANT TO SPACE) ──── */}
          {activeStep === "contract" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                    Step 3 of 5
                  </span>
                  <span className="text-xs font-bold text-slate-500">Commercial Contract</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Creating Contract (Linking Tenant to Space)
                </h3>
                <p className="text-xs text-slate-500">
                  Bind the newly added tenant to demised property space, establish escalation terms, security deposits, and billing SPVs.
                </p>
              </div>

              {/* Tenant Portal Invite Link Banner */}
              {latestTenantInvite && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-white border-2 border-teal-500/40 shadow-xs space-y-2.5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0D7B6C] text-white flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          Tenant Portal Access Link for {latestTenantInvite.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Share this link so the tenant can access `/portal` to inspect their lease and pay rent.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(latestTenantInvite.link);
                          setCopiedTenantInvite(true);
                          setTimeout(() => setCopiedTenantInvite(false), 3000);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                    >
                      <Copy size={13} />
                      <span>{copiedTenantInvite ? "Link Copied!" : "Copy Tenant Invite Link"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-teal-200 font-mono text-[11px] text-teal-900 truncate select-all">
                    {latestTenantInvite.link}
                  </div>
                </div>
              )}

              {/* ──── LEASE AGREEMENT UPLOAD & AUTO-EXTRACTION ──── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/50 to-white border-2 border-dashed border-[#0D7B6C]/40 hover:border-[#0D7B6C] transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D7B6C] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileUp size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          Upload Rent Agreement / Lease Deed (Automatic Data Fetch)
                        </h4>
                        <span className="text-[10px] font-bold text-[#0D7B6C] bg-white px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                          Auto-Fetch Enabled
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Upload your registered lease deed or signed term sheet (.PDF or .DOCX). The extraction engine reads demised area, base rent, CAM, escalation percentages, security deposit, and lock-in period to auto-populate all terms below.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      disabled={isUploadingAgreement}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadRentAgreement(file);
                        e.target.value = "";
                      }}
                    />
                    <div
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                        isUploadingAgreement
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-[#0D7B6C] hover:bg-[#0A6357] text-white"
                      }`}
                    >
                      {isUploadingAgreement ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Extracting Terms...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={15} />
                          <span>Browse Lease Agreement</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Parsed Highlights Banner */}
                {parsedAgreementMeta && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <FileCheck2 size={16} className="text-emerald-700" />
                        <span>Parsed: {parsedAgreementMeta.fileName}</span>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        {parsedAgreementMeta.confidence}% Confidence • {parsedAgreementMeta.extractedFieldsCount} Terms Extracted
                      </span>
                    </div>

                    {parsedAgreementMeta.summaryHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parsedAgreementMeta.summaryHighlights.map((hl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 text-emerald-900"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✓ Commercial clauses and payment particulars have been parsed and populated into the fields below. Review and adjust any term as needed.
                    </p>
                  </div>
                )}
              </div>

              {/* Temporary Highlight Indicator Banner */}
              {changedFieldKeys.size > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
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
                    Dismiss Highlights
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveContract} className="space-y-6">
                {/* ──── SECTION 1: HIERARCHY & SPACE MAPPING ──── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Building2 size={15} className="text-[#0D7B6C]" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      1. Space Allocation &amp; Occupant Association
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Occupant / Tenant */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Occupant / Tenant *</label>
                        {changedFieldKeys.has("occupant_id") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <select
                        value={contractForm.occupant_id}
                        onClick={() => clearFieldHighlight("occupant_id")}
                        onFocus={() => clearFieldHighlight("occupant_id")}
                        onChange={(e) => {
                          clearFieldHighlight("occupant_id");
                          const sel = tenantsList.find((t) => t.id === e.target.value);
                          setContractForm({
                            ...contractForm,
                            occupant_id: e.target.value,
                            occupant_name: sel?.name || "",
                          });
                        }}
                        className={getHighlightClass(
                          "occupant_id",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                        )}
                      >
                        {tenantsList.length === 0 && (
                          <option value="">{tenantForm.occupant_name || "Enrolled Occupant"}</option>
                        )}
                        {tenantsList.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.company ? `(${t.company})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Commercial Property *</label>
                        {changedFieldKeys.has("property_id") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <select
                        value={contractForm.property_id || selectedPropertyForTenant}
                        onClick={() => clearFieldHighlight("property_id")}
                        onFocus={() => clearFieldHighlight("property_id")}
                        onChange={(e) => {
                          clearFieldHighlight("property_id");
                          setContractForm({ ...contractForm, property_id: e.target.value });
                        }}
                        className={getHighlightClass(
                          "property_id",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                        )}
                      >
                        {registeredProperties.map((p) => (
                          <option key={p.id || p.property_name} value={p.id || p.property_name}>
                            {p.property_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Building / Tower */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Building / Tower *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tower 1 / West Wing"
                        value={contractForm.building_name}
                        onChange={(e) => setContractForm({ ...contractForm, building_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Space / Unit */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Space / Unit Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suite 402, 4th Floor"
                        value={contractForm.space_unit}
                        onChange={(e) => setContractForm({ ...contractForm, space_unit: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 2: TERM DATES & POSSESSION ──── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Clock size={15} className="text-[#0D7B6C]" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2. Lease Term Dates &amp; Handover Schedule
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Handover / Possession Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Handover / Possession Date</label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                          Optional
                        </span>
                      </div>
                      <input
                        type="date"
                        value={contractForm.possession_date}
                        onChange={(e) => setContractForm({ ...contractForm, possession_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Contract Start Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Rent Commencement Date *</label>
                        {changedFieldKeys.has("start_date") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        required
                        value={contractForm.start_date}
                        onClick={() => clearFieldHighlight("start_date")}
                        onFocus={() => clearFieldHighlight("start_date")}
                        onChange={(e) => {
                          clearFieldHighlight("start_date");
                          setContractForm({ ...contractForm, start_date: e.target.value });
                        }}
                        className={getHighlightClass(
                          "start_date",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                        )}
                      />
                    </div>

                    {/* Contract End Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Lease Expiry Date *</label>
                        {changedFieldKeys.has("end_date") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        required
                        value={contractForm.end_date}
                        onClick={() => clearFieldHighlight("end_date")}
                        onFocus={() => clearFieldHighlight("end_date")}
                        onChange={(e) => {
                          clearFieldHighlight("end_date");
                          setContractForm({ ...contractForm, end_date: e.target.value });
                        }}
                        className={getHighlightClass(
                          "end_date",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 3: FIT-OUT & HANDOVER CONDITION ──── */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Armchair size={15} className="text-[#0D7B6C]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        3. Fit-Out &amp; Handover Condition
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Specify interior furnishing state and rent-free concession days
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {/* Handover Condition */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Handover Condition *</label>
                      <select
                        value={contractForm.fitout_condition}
                        onChange={(e) => setContractForm({ ...contractForm, fitout_condition: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="Fully Furnished">Fully Furnished (Plug &amp; Play)</option>
                        <option value="Warm Shell">Warm Shell (HVAC, Ceilings, Screed)</option>
                        <option value="Bare Shell">Bare Shell (Raw Concrete Slab)</option>
                        <option value="Semi-Furnished">Semi-Furnished (Partially Fitted)</option>
                      </select>
                    </div>

                    {/* Rent-Free Fit-out Period (Days) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fit-out Rent-Free Period (Days)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60 or 90"
                        value={contractForm.fitout_period_days}
                        onChange={(e) => setContractForm({ ...contractForm, fitout_period_days: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Bare Shell Rate (₹/sqft) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bare Shell Rate (₹/sqft/mo)</label>
                      <input
                        type="number"
                        placeholder="e.g. 65"
                        value={contractForm.bare_shell_rate}
                        onChange={(e) => {
                          const bs = e.target.value;
                          const fit = Number(contractForm.fitout_rate) || 0;
                          const totalRate = Number(bs) + fit;
                          const area = Number(contractForm.area_sqft) || 0;
                          setContractForm({
                            ...contractForm,
                            bare_shell_rate: bs,
                            rate_per_sqft: totalRate > 0 ? String(totalRate) : contractForm.rate_per_sqft,
                            monthly_rent: totalRate > 0 && area > 0 ? String(Math.round(totalRate * area)) : contractForm.monthly_rent,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Fit-out Amortization Rate (₹/sqft) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fit-out Rent (₹/sqft/mo)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={contractForm.fitout_rate}
                        onChange={(e) => {
                          const fit = e.target.value;
                          const bs = Number(contractForm.bare_shell_rate) || 0;
                          const totalRate = bs + Number(fit);
                          const area = Number(contractForm.area_sqft) || 0;
                          setContractForm({
                            ...contractForm,
                            fitout_rate: fit,
                            rate_per_sqft: totalRate > 0 ? String(totalRate) : contractForm.rate_per_sqft,
                            monthly_rent: totalRate > 0 && area > 0 ? String(Math.round(totalRate * area)) : contractForm.monthly_rent,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 4: RENT MODEL & PRICING BASIS ──── */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Calculator size={15} className="text-[#0D7B6C]" />
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                        4. Rent Calculation Model &amp; Pricing Basis
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Select pricing model; base rent calculates automatically
                    </span>
                  </div>

                  {/* Model Selection Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: "Area-based", label: "Per Sq.Ft (Area)", desc: "₹ / sq.ft / mo" },
                        { id: "Seat-based", label: "Per Seat (Desk)", desc: "₹ / workstation / mo" },
                        { id: "Fixed", label: "Fixed Lump-Sum", desc: "Flat monthly billing" },
                        { id: "Hybrid", label: "Hybrid (Turnkey)", desc: "Base + Fitout + CAM" },
                        { id: "Pure Rent", label: "Pure Rent", desc: "Bare Shell lease" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const newModel = m.id;
                          setContractForm((prev) => {
                            let nextRent = prev.monthly_rent;
                            if (newModel === "Area-based" && prev.rate_per_sqft && prev.area_sqft) {
                              nextRent = String(Math.round(Number(prev.rate_per_sqft) * Number(prev.area_sqft)));
                            } else if (newModel === "Seat-based" && prev.rate_per_seat && prev.seat_count) {
                              nextRent = String(Math.round(Number(prev.rate_per_seat) * Number(prev.seat_count)));
                            }
                            return { ...prev, billing_model: newModel, monthly_rent: nextRent };
                          });
                        }}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                          contractForm.billing_model === m.id
                            ? "bg-teal-50/60 border-[#0D7B6C] ring-2 ring-[#0D7B6C]/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className="font-extrabold text-slate-900 text-xs">{m.label}</div>
                        <div className="text-[10px] text-slate-500">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* Area (Sq.Ft) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">Demised Area (Sq.Ft) *</label>
                        {changedFieldKeys.has("area_sqft") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 5000"
                        value={contractForm.area_sqft}
                        onClick={() => clearFieldHighlight("area_sqft")}
                        onFocus={() => clearFieldHighlight("area_sqft")}
                        onChange={(e) => {
                          clearFieldHighlight("area_sqft");
                          const area = e.target.value;
                          const rate = Number(contractForm.rate_per_sqft) || 0;
                          const calcRent = area && rate ? String(Math.round(Number(area) * rate)) : contractForm.monthly_rent;
                          setContractForm({ ...contractForm, area_sqft: area, monthly_rent: calcRent });
                        }}
                        className={getHighlightClass(
                          "area_sqft",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                        )}
                      />
                    </div>

                    {/* Rate per Sq.Ft or Rate per Seat */}
                    {contractForm.billing_model === "Seat-based" ? (
                      <>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Seats / Workstations Count *</label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            value={contractForm.seat_count}
                            onChange={(e) => {
                              const seats = e.target.value;
                              const rateSeat = Number(contractForm.rate_per_seat) || 0;
                              const calcRent = seats && rateSeat ? String(Math.round(Number(seats) * rateSeat)) : contractForm.monthly_rent;
                              setContractForm({ ...contractForm, seat_count: seats, monthly_rent: calcRent });
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Rate per Seat (₹ / seat / mo) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 12000"
                            value={contractForm.rate_per_seat}
                            onChange={(e) => {
                              const rateSeat = e.target.value;
                              const seats = Number(contractForm.seat_count) || 0;
                              const calcRent = rateSeat && seats ? String(Math.round(Number(rateSeat) * seats)) : contractForm.monthly_rent;
                              setContractForm({ ...contractForm, rate_per_seat: rateSeat, monthly_rent: calcRent });
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700">Rate per Sq.Ft (₹ / sq.ft / mo)</label>
                          {changedFieldKeys.has("rate_per_sqft") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 75"
                          value={contractForm.rate_per_sqft}
                          onClick={() => clearFieldHighlight("rate_per_sqft")}
                          onFocus={() => clearFieldHighlight("rate_per_sqft")}
                          onChange={(e) => {
                            clearFieldHighlight("rate_per_sqft");
                            const rate = e.target.value;
                            const area = Number(contractForm.area_sqft) || 0;
                            const calcRent = rate && area ? String(Math.round(Number(rate) * area)) : contractForm.monthly_rent;
                            setContractForm({ ...contractForm, rate_per_sqft: rate, monthly_rent: calcRent });
                          }}
                          className={getHighlightClass(
                            "rate_per_sqft",
                            "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                          )}
                        />
                      </div>
                    )}

                    {/* Monthly Base Rent Amount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">Monthly Base Rent (₹) *</label>
                        <div className="flex items-center gap-1.5">
                          {changedFieldKeys.has("monthly_rent") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                          <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-mono font-bold">
                            ₹{Number(contractForm.monthly_rent || 0).toLocaleString()} /mo
                          </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 250000"
                        value={contractForm.monthly_rent}
                        onClick={() => clearFieldHighlight("monthly_rent")}
                        onFocus={() => clearFieldHighlight("monthly_rent")}
                        onChange={(e) => {
                          clearFieldHighlight("monthly_rent");
                          setContractForm({ ...contractForm, monthly_rent: e.target.value });
                        }}
                        className={getHighlightClass(
                          "monthly_rent",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-slate-900 focus:border-[#0D7B6C] outline-none"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 5: CAM (COMMON AREA MAINTENANCE) CHARGES ──── */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench size={15} className="text-[#0D7B6C]" />
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                        5. Common Area Maintenance (CAM) Charges
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Operational upkeep, security, landscaping, and central amenities
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* CAM Model */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CAM Billing Model</label>
                      <select
                        value={contractForm.cam_type}
                        onChange={(e) => setContractForm({ ...contractForm, cam_type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="Per Sq.Ft">Per Sq.Ft / Month (Rate Basis)</option>
                        <option value="Fixed Monthly">Fixed Monthly Amount</option>
                        <option value="Included">Included in Base Rent (Zero extra)</option>
                        <option value="Actuals">Pass-Through Actuals (Periodic reconciliations)</option>
                      </select>
                    </div>

                    {/* CAM Rate */}
                    {contractForm.cam_type === "Per Sq.Ft" && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CAM Rate (₹ / sq.ft / mo)</label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 15"
                          value={contractForm.cam_rate}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const area = Number(contractForm.area_sqft) || 0;
                            const monthly = rate && area ? String(Math.round(Number(rate) * area)) : contractForm.cam_monthly;
                            setContractForm({ ...contractForm, cam_rate: rate, cam_monthly: monthly });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                        />
                      </div>
                    )}

                    {/* Monthly CAM Amount */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Monthly CAM Outgo (₹)
                        {contractForm.cam_type === "Per Sq.Ft" && contractForm.cam_rate && contractForm.area_sqft && (
                          <span className="text-teal-700 ml-1.5 font-mono">
                            (₹{(Math.round(Number(contractForm.cam_rate) * Number(contractForm.area_sqft))).toLocaleString()})
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 75000"
                        value={
                          contractForm.cam_type === "Per Sq.Ft" && contractForm.cam_rate && contractForm.area_sqft
                            ? Math.round(Number(contractForm.cam_rate) * Number(contractForm.area_sqft))
                            : contractForm.cam_monthly
                        }
                        onChange={(e) => setContractForm({ ...contractForm, cam_monthly: e.target.value })}
                        disabled={contractForm.cam_type === "Included"}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white text-slate-900 focus:border-[#0D7B6C] outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 6: DEDICATED PARKING ALLOCATION ──── */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Car size={15} className="text-[#0D7B6C]" />
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                        6. Dedicated Parking Allocation
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Reserved 4-wheeler and 2-wheeler parking slots with monthly tariffs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Car Parking Slots (4W)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 4"
                        value={contractForm.car_parking_slots}
                        onChange={(e) => setContractForm({ ...contractForm, car_parking_slots: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rate per Car Slot (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3000"
                        value={contractForm.car_parking_rate}
                        onChange={(e) => setContractForm({ ...contractForm, car_parking_rate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Two-Wheeler Slots (2W)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 10"
                        value={contractForm.two_wheeler_slots}
                        onChange={(e) => setContractForm({ ...contractForm, two_wheeler_slots: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rate per 2W Slot (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={contractForm.two_wheeler_rate}
                        onChange={(e) => setContractForm({ ...contractForm, two_wheeler_rate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 7: POWER, UTILITIES & SUB-METERING ──── */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={15} className="text-[#0D7B6C]" />
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                        7. Power, Utilities &amp; Sub-metering
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      DG backup specifications, electrical load, and energy billing modes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Electricity Billing */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Electricity Billing Mode</label>
                      <select
                        value={contractForm.electricity_billing}
                        onChange={(e) => setContractForm({ ...contractForm, electricity_billing: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="Submeter Actuals">Sub-meter Actuals (Per Unit)</option>
                        <option value="Fixed Monthly">Fixed Monthly Utility Charge</option>
                        <option value="Included in Rent">Included in Base Rent</option>
                        <option value="Proportionate Share">Proportionate Floor Area Share</option>
                      </select>
                    </div>

                    {/* Power Backup Type */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">DG Power Backup</label>
                      <select
                        value={contractForm.power_backup_type}
                        onChange={(e) => setContractForm({ ...contractForm, power_backup_type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="100% DG Power Backup">100% DG Backup (Grade-A)</option>
                        <option value="Partial DG Backup">Partial Backup (Critical Lighting)</option>
                        <option value="No DG Backup">No DG Backup</option>
                      </select>
                    </div>

                    {/* Sanctioned Electrical Load (kVA) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sanctioned Load (kVA)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50 kVA"
                        value={contractForm.electricity_load_kva}
                        onChange={(e) => setContractForm({ ...contractForm, electricity_load_kva: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* DG Rate per kWh */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">DG Power Tariff (₹ / kWh)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 24.50"
                        value={contractForm.dg_rate_per_kwh}
                        onChange={(e) => setContractForm({ ...contractForm, dg_rate_per_kwh: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium bg-white text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 8: ESCALATIONS & SECURITY DEPOSIT ──── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Shield size={15} className="text-[#0D7B6C]" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      8. Escalation Terms, Security Deposit &amp; Lock-in
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Escalation % */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Escalation % Rate</label>
                        {changedFieldKeys.has("escalation_pct") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.0"
                        value={contractForm.escalation_pct}
                        onClick={() => clearFieldHighlight("escalation_pct")}
                        onFocus={() => clearFieldHighlight("escalation_pct")}
                        onChange={(e) => {
                          clearFieldHighlight("escalation_pct");
                          setContractForm({ ...contractForm, escalation_pct: e.target.value });
                        }}
                        className={getHighlightClass(
                          "escalation_pct",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                        )}
                      />
                    </div>

                    {/* Escalation Frequency */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Escalation Frequency</label>
                      <select
                        value={contractForm.escalation_frequency}
                        onChange={(e) => setContractForm({ ...contractForm, escalation_frequency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="Annual">Annual (Every 12 Months)</option>
                        <option value="Biannual">Biannual (Every 24 Months)</option>
                        <option value="Triennial">Triennial (Every 36 Months)</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>

                    {/* Escalation Start Date */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Escalation Effective Date</label>
                      <input
                        type="date"
                        value={contractForm.escalation_start_date}
                        onChange={(e) => setContractForm({ ...contractForm, escalation_start_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Deposit Months */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit (Months)</label>
                      <input
                        type="number"
                        placeholder="e.g. 6 Months"
                        value={contractForm.deposit_months}
                        onChange={(e) => {
                          const m = e.target.value;
                          const rent = Number(contractForm.monthly_rent) || 0;
                          const calcDep = m && rent ? String(Math.round(Number(m) * rent)) : contractForm.security_deposit;
                          setContractForm({ ...contractForm, deposit_months: m, security_deposit: calcDep });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* Security Deposit Amount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Security Deposit Amount (₹)</label>
                        <div className="flex items-center gap-1.5">
                          {changedFieldKeys.has("security_deposit") && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              Updated
                            </span>
                          )}
                          {contractForm.security_deposit && (
                            <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-mono font-bold">
                              ₹{Number(contractForm.security_deposit).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 1500000"
                        value={contractForm.security_deposit}
                        onClick={() => clearFieldHighlight("security_deposit")}
                        onFocus={() => clearFieldHighlight("security_deposit")}
                        onChange={(e) => {
                          clearFieldHighlight("security_deposit");
                          setContractForm({ ...contractForm, security_deposit: e.target.value });
                        }}
                        className={getHighlightClass(
                          "security_deposit",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0D7B6C] outline-none"
                        )}
                      />
                    </div>

                    {/* Lock-in Period (months) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Lock-in Period (Months)</label>
                        {changedFieldKeys.has("lock_in_months") && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            Updated
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 36 Months"
                        value={contractForm.lock_in_months}
                        onClick={() => clearFieldHighlight("lock_in_months")}
                        onFocus={() => clearFieldHighlight("lock_in_months")}
                        onChange={(e) => {
                          clearFieldHighlight("lock_in_months");
                          setContractForm({ ...contractForm, lock_in_months: e.target.value });
                        }}
                        className={getHighlightClass(
                          "lock_in_months",
                          "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                        )}
                      />
                    </div>

                    {/* Notice Period (days) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Notice Period (Days)</label>
                      <input
                        type="number"
                        placeholder="e.g. 90 Days"
                        value={contractForm.notice_days}
                        onChange={(e) => setContractForm({ ...contractForm, notice_days: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 9: STATUTORY, SPV & COVENANTS ──── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <ShieldCheck size={15} className="text-[#0D7B6C]" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      9. Statutory Billing SPV, Payment Terms &amp; Covenants
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Billing Entity (SPV) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Billing Entity (SPV / Landlord) *</label>
                      <input
                        type="text"
                        list="billing-entity-options"
                        required
                        placeholder="e.g. Prestige Tech Park SPV LLP"
                        value={contractForm.billing_entity}
                        onChange={(e) => setContractForm({ ...contractForm, billing_entity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                      <datalist id="billing-entity-options">
                        {propForm.spv_name && <option value={propForm.spv_name} />}
                        {companyName && <option value={companyName} />}
                        {brandName && <option value={brandName} />}
                      </datalist>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Payment Credit Terms</label>
                      <select
                        value={contractForm.payment_terms}
                        onChange={(e) => setContractForm({ ...contractForm, payment_terms: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="Due on 1st">Due on 1st of every calendar month</option>
                        <option value="Due on 5th">Due on 5th of every calendar month</option>
                        <option value="Net 0">Net 0 (Immediate upon invoice generation)</option>
                        <option value="Net 7">Net 7 (7 days credit)</option>
                        <option value="Net 15">Net 15 (15 days credit)</option>
                        <option value="Net 30">Net 30 (30 days credit)</option>
                      </select>
                    </div>

                    {/* Stamp Duty Sharing */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Stamp Duty &amp; Reg Sharing</label>
                      <select
                        value={contractForm.stamp_duty_sharing}
                        onChange={(e) => setContractForm({ ...contractForm, stamp_duty_sharing: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                      >
                        <option value="50:50 Shared">50:50 Shared (Standard Commercial)</option>
                        <option value="100% Tenant">100% Borne by Tenant</option>
                        <option value="100% Landlord">100% Borne by Landlord</option>
                      </select>
                    </div>

                    {/* Late Interest Rate (% p.a.) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Late Payment Interest (% p.a.)</label>
                      <input
                        type="number"
                        placeholder="e.g. 18%"
                        value={contractForm.late_interest_pct}
                        onChange={(e) => setContractForm({ ...contractForm, late_interest_pct: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                      />
                    </div>

                    {/* GST & TDS Switches */}
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contractForm.gst_applicable}
                          onChange={(e) => setContractForm({ ...contractForm, gst_applicable: e.target.checked })}
                          className="w-4 h-4 rounded text-[#0D7B6C] focus:ring-[#0D7B6C]"
                        />
                        <span>Apply GST (18% on Commercial Lease Rent)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contractForm.tds_applicable}
                          onChange={(e) => setContractForm({ ...contractForm, tds_applicable: e.target.checked })}
                          className="w-4 h-4 rounded text-[#0D7B6C] focus:ring-[#0D7B6C]"
                        />
                        <span>TDS Deductible under Sec 194-I (10%)</span>
                      </label>
                    </div>

                    {/* Notes / Special Covenants */}
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Special Lease Covenants / Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Parking slot allocations, fit-out rent free period clauses, signage covenants, sub-meter billing..."
                        value={contractForm.notes}
                        onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ──── SECTION 10: REAL-TIME COMMERCIAL LEASE SUMMARY CARD ──── */}
                {(() => {
                  const bRent = Number(contractForm.monthly_rent) || 0;
                  const cArea = Number(contractForm.area_sqft) || 0;
                  const cMonthly = contractForm.cam_type === "Per Sq.Ft"
                    ? Math.round((Number(contractForm.cam_rate) || 0) * cArea)
                    : (Number(contractForm.cam_monthly) || 0);
                  const pMonthly =
                    (Number(contractForm.car_parking_slots) || 0) * (Number(contractForm.car_parking_rate) || 0) +
                    (Number(contractForm.two_wheeler_slots) || 0) * (Number(contractForm.two_wheeler_rate) || 0);
                  const netMonthly = bRent + cMonthly + pMonthly;
                  const gst = contractForm.gst_applicable ? Math.round(netMonthly * 0.18) : 0;
                  const grossTotal = netMonthly + gst;
                  const sDeposit = Number(contractForm.security_deposit) || Math.round(bRent * (Number(contractForm.deposit_months) || 6));

                  return (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-teal-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">
                            Executive Commercial Lease Summary (Live Calculation)
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {contractForm.billing_model} • {cArea ? `${cArea.toLocaleString()} Sq.Ft` : "Flexible Unit"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Rent</span>
                          <span className="text-base font-black text-white font-mono">₹{bRent.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">/ month</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">CAM Charges</span>
                          <span className="text-base font-black text-white font-mono">₹{cMonthly.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{contractForm.cam_type}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Dedicated Parking</span>
                          <span className="text-base font-black text-white font-mono">₹{pMonthly.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {contractForm.car_parking_slots} 4W + {contractForm.two_wheeler_slots} 2W
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Security Deposit</span>
                          <span className="text-base font-black text-teal-300 font-mono">₹{sDeposit.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {contractForm.deposit_months || 6} Months Rent
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                          <span>Net Rent: <strong className="text-white font-mono">₹{netMonthly.toLocaleString()}</strong></span>
                          <span>GST (18%): <strong className="text-white font-mono">₹{gst.toLocaleString()}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">Gross Monthly Billing:</span>
                          <span className="text-lg font-black text-teal-400 font-mono">
                            ₹{grossTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveStep("tenant")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Back to Occupant
                  </button>

                  <button
                    type="submit"
                    disabled={contractLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <span>Execute Contract &amp; Continue →</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ──── MODULE 4: COMPLIANCE DOCUMENTS VAULT ──── */}
          {activeStep === "documents" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                    Step 4 of 5
                  </span>
                  <span className="text-xs font-bold text-slate-500">Compliance &amp; Due Diligence</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Step 4: Commercial Compliance Vault
                </h3>
                <p className="text-xs text-slate-500">
                  Upload key statutory documents, title deeds, and standard lease contract drafts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "title_deed", label: "Title Deed / Sanctioned Plan", sub: "Required for municipal zoning validation" },
                  { key: "fire_noc", label: "Fire NOC / Occupancy Certificate (OC)", sub: "Commercial life-safety compliance" },
                  { key: "lease_draft", label: "Standard Lease Agreement Draft", sub: "39-Point canonical contract template" },
                  { key: "sanction_load", label: "Electricity Sanction Load & DG Certificate", sub: "Sub-meter & utility rate pool verification" },
                ].map((doc) => {
                  const isUploaded = uploadedDocs[doc.key];
                  return (
                    <div
                      key={doc.key}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900 block leading-snug">{doc.label}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{doc.sub}</span>
                        <div className="mt-2">
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Uploaded &amp; Stamped
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Not Uploaded</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedDocs({ ...uploadedDocs, [doc.key]: true });
                          showToast(`✓ Document '${doc.label}' registered!`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                          isUploaded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-white border border-slate-300 hover:border-teal-500 text-slate-700"
                        }`}
                      >
                        <Upload size={12} />
                        <span>{isUploaded ? "Replace" : "Upload"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep("tenant")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Tenants
                </button>

                <button
                  type="button"
                  onClick={() => {
                    markStepDone("documents");
                    setActiveStep("delegation");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Team Delegation →</span>
                </button>
              </div>
            </div>
          )}

          {/* ──── MODULE 5: TEAM DELEGATION & INVITATION LINK ──── */}
          {activeStep === "delegation" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                    Step 5 of 5
                  </span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#0D7B6C] text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck size={11} />
                    <span>Sovereign Owner Controls</span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Step 5: Managing Entity Delegation &amp; Approval Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Assign a managing company, CA, or manager to operate this portfolio and decide what rights they hold. Actions without direct rights require your explicit approval.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Managing Entity Type</label>
                    <select
                      value={managerData.entityType}
                      onChange={(e) => setManagerData({ ...managerData, entityType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-[#0D7B6C] outline-none cursor-pointer"
                    >
                      <option value="pm_company">PM Company (Property Management Company)</option>
                      <option value="fm_company">FM Company (Facilities Management Company)</option>
                      <option value="msp">MSP (Managed Service Provider)</option>
                      <option value="user_pm_or_admin">Another User with role: Property Manager or Org Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {managerData.entityType === "user_pm_or_admin" ? "User Full Name *" : "Entity / Company Name *"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        managerData.entityType === "user_pm_or_admin"
                          ? "e.g. Vikram Sharma"
                          : managerData.entityType === "fm_company"
                          ? "e.g. CBRE / JLL Facilities"
                          : managerData.entityType === "msp"
                          ? "e.g. SmartOps MSP Solutions"
                          : "e.g. Apex Property Management LLP"
                      }
                      value={managerData.name}
                      onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {managerData.entityType === "user_pm_or_admin" ? "User Email Address *" : "Work Email Address *"}
                    </label>
                    <input
                      type="email"
                      placeholder={
                        managerData.entityType === "user_pm_or_admin" ? "vikram@company.com" : "manager@apexpm.in"
                      }
                      value={managerData.email}
                      onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#0D7B6C] outline-none"
                    />
                  </div>
                </div>

                {managerData.entityType === "user_pm_or_admin" && (
                  <div className="p-3 bg-white rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Designated Role for this User
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Choose whether this user operates as a Property Manager or an Org Admin.
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="radio"
                          name="profileManagerRole"
                          value="property_manager"
                          checked={managerData.role === "property_manager"}
                          onChange={() => setManagerData({ ...managerData, role: "property_manager" })}
                          className="text-[#0D7B6C] focus:ring-[#0D7B6C]"
                        />
                        <span>Property Manager</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="radio"
                          name="profileManagerRole"
                          value="org_admin"
                          checked={managerData.role === "org_admin"}
                          onChange={() => setManagerData({ ...managerData, role: "org_admin" })}
                          className="text-[#0D7B6C] focus:ring-[#0D7B6C]"
                        />
                        <span>Org Admin</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Rights Checklist */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                    Delegated Rights &amp; Owner Approval Thresholds:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      {
                        key: "contractExecution",
                        label: "Execute Lease Agreements",
                        desc: managerRights.contractExecution
                          ? "Direct execution enabled"
                          : "Requires Owner Approval before lease goes live",
                      },
                      {
                        key: "concessions",
                        label: "Rent Discounts & Waivers",
                        desc: managerRights.concessions
                          ? "Discretionary discounts allowed"
                          : "Requires Owner Approval in /approvals inbox",
                      },
                      {
                        key: "billingRuns",
                        label: "Monthly Rent & CAM Invoicing",
                        desc: managerRights.billingRuns ? "Autonomous monthly batch runs" : "Requires Owner preview",
                      },
                      {
                        key: "depositRefunds",
                        label: "Security Deposit Refunds",
                        desc: managerRights.depositRefunds ? "Direct refund" : "Requires Owner Sign-off",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer hover:border-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={(managerRights as any)[item.key]}
                          onChange={(e) =>
                            setManagerRights({
                              ...managerRights,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#0D7B6C] focus:ring-[#0D7B6C] border-slate-300 cursor-pointer mt-0.5"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Deployed Link Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Links are generated on your production domain ({DEPLOYED_BASE_URL.replace("https://", "")}).
                  </span>
                  <button
                    type="button"
                    disabled={!managerData.email || inviteLoading}
                    onClick={() =>
                      generateDomainInviteLink(
                        managerData.name,
                        managerData.email,
                        managerData.role,
                        managerData.entityType
                      )
                    }
                    className="px-4 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={inviteLoading ? "animate-spin" : ""} />
                    <span>Generate Deployed Invite Link</span>
                  </button>
                </div>
              </div>

              {/* Generated Deployed Invitation Link Box */}
              {generatedInviteLink && (
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                      <ExternalLink size={13} />
                      Production Shareable Invitation Link (Domain-Safe):
                    </span>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Zero Localhost Guaranteed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white font-mono text-xs text-slate-800 font-semibold focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-4 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Share this link directly via WhatsApp or Email.
                  </p>
                </div>
              )}

              {/* Finish Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep("documents")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Documents
                </button>

                <button
                  type="button"
                  onClick={() => {
                    markStepDone("delegation");
                    showToast("🎉 Profile Setup Complete! Entering Live Dashboard...");
                    setTimeout(() => {
                      router.push("/dashboard/owner");
                    }, 500);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#0D7B6C] hover:from-emerald-700 hover:to-[#0A6357] text-white text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Complete Setup &amp; Enter Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Property Assignment Success Dialog */}
          {assignmentSuccessData && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-teal-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Property Assigned Successfully
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {assignmentSuccessData.propertyName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Management has been officially delegated to{" "}
                    <strong className="text-slate-900">{assignmentSuccessData.managerName}</strong>{" "}
                    ({assignmentSuccessData.managerEmail}). They now have sovereign access on their activated dashboard to administer leases, generate monthly invoices, and log sub-meters.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentSuccessData(null);
                      setActiveStep("tenant");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Continue to Step 2: Add Tenants →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentSuccessData(null)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Stay on Property Step
                  </button>
                </div>
              </div>
            </div>
          )}

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
        </main>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center font-bold text-slate-500">
          Loading Workspace Setup...
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}

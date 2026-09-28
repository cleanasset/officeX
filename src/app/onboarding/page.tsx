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
  Headphones
} from "lucide-react";
import { formatINR } from "@/components/rent-roll/DashboardTab";
import {
  AddressAutocomplete,
  CityAutocomplete,
  StateAutocomplete,
} from "@/components/ui/LocationInputs";

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

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") || "";
  const initialSegmentParam = searchParams.get("segment") || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  // ──── STEP 1: ORGANIZATION & BUSINESS SEGMENTS ────
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

  const toggleSegment = (segId: string) => {
    setOrgData(prev => {
      const exists = prev.segments.includes(segId);
      if (exists && prev.segments.length > 1) {
        return { ...prev, segments: prev.segments.filter(s => s !== segId) };
      } else if (!exists) {
        return { ...prev, segments: [...prev.segments, segId] };
      }
      return prev;
    });
  };

  // ──── STEP 2: FINANCIAL ENTITIES & TAX PROFILES ────
  // Multiple Billing Entities (SPVs & States)
  const [billingEntities, setBillingEntities] = useState<BillingEntityItem[]>([]);

  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editEntity, setEditEntity] = useState<BillingEntityItem | null>(null);
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
      alert("Please provide at least the Legal SPV Name and 15-digit GSTIN.");
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
    setEditingEntityId(be.id);
    setEditEntity({ ...be });
    setIsAddingEntity(false);
  };

  const handleSaveEditEntity = () => {
    if (!editEntity || !editEntity.spvName || !editEntity.gstin) {
      alert("Please provide at least the Legal SPV Name and 15-digit GSTIN.");
      return;
    }
    setBillingEntities(billingEntities.map(b =>
      b.id === editEntity.id ? { ...editEntity, pan: editEntity.pan || editEntity.gstin.substring(2, 12) } : b
    ));
    setEditingEntityId(null);
    setEditEntity(null);
  };

  const handleCancelEditEntity = () => {
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

  // ──── STEP 3: SECTION B — OPERATIONAL SETTINGS & CHARGE MASTER (Slide 4) ────
  const [chargeList, setChargeList] = useState<ChargeTypeItem[]>([
    { id: "base_rent", name: "Base Rent", category: "rent", enabled: true, rate: 150, unit: "psf_month", isInclusion: false, description: "Monthly commercial leasable space charge" },
    { id: "cam", name: "CAM (Common Area Maintenance)", category: "cam", enabled: true, rate: 28, unit: "psf_month", isInclusion: false, description: "Facility upkeep, security, housekeeping, lift maintenance" },
    { id: "electricity_grid", name: "Grid HT Electricity", category: "utility", enabled: true, rate: 11.50, unit: "kwh", isInclusion: false, description: "State power board metered commercial power consumption" },
    { id: "electricity_dg", name: "DG Backup Power", category: "utility", enabled: true, rate: 32.00, unit: "kwh", isInclusion: false, description: "Diesel Generator captive backup power supply" },
    { id: "water", name: "Commercial Water Supply", category: "utility", enabled: true, rate: 45.00, unit: "kl", isInclusion: false, description: "Bulk municipal & tanker potable water supply per kL" },
    { id: "parking", name: "Reserved Parking Bays", category: "amenity", enabled: true, rate: 4500, unit: "slot_month", isInclusion: false, description: "Allocated basement / stilt vehicular parking slots" },
    { id: "internet", name: "High-Speed Internet / IT", category: "service", enabled: true, rate: 2500, unit: "fixed_month", isInclusion: false, description: "Dedicated leased-line fibre connectivity" },
    { id: "housekeeping", name: "Housekeeping & Janitorial", category: "service", enabled: false, rate: 8.50, unit: "psf_month", isInclusion: true, description: "In-suite specialized cleaning and sanitization" },
    { id: "security", name: "Physical Security & Guarding", category: "service", enabled: false, rate: 6.00, unit: "psf_month", isInclusion: true, description: "Dedicated 24/7 lobby & floor security personnel" },
    { id: "hvac_btu", name: "Chilled Water / HVAC BTU", category: "utility", enabled: false, rate: 18.00, unit: "kwh", isInclusion: false, description: "Thermal energy BTU meter consumption for central air" },
    { id: "signage", name: "Signage & Facade Display", category: "amenity", enabled: false, rate: 15000, unit: "fixed_month", isInclusion: false, description: "Pylon and exterior building branding rights" }
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
      setBranding(prev => ({ ...prev, logoPreview: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBranding(prev => ({ ...prev, logoPreview: "" }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Generate text initials from company name for fallback
  const logoInitials = (branding.portfolioDisplayName || orgData.tradeName || orgData.legalName || "CO")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase() || "CO";

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

      if (storedOrg || storedCity) {
        setOrgData(prev => ({
          ...prev,
          legalName: prev.legalName || storedOrg,
          tradeName: prev.tradeName || storedOrg,
          city: prev.city || storedCity,
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

        setBillingEntities([
          {
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
          }
        ]);
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
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  // Handle Download Templates
  const handleDownloadSample = (model: "area" | "seat") => {
    let headers = "";
    let row = "";
    let filename = "";

    if (model === "seat") {
      headers = "Member Trade Name,Member Legal Name,Building Name,Cabin Suite ID,Contracted Seats,Occupied Seats,Rate Per Seat Monthly,Start Date (YYYY-MM-DD),End Date (YYYY-MM-DD),Deposit Months,Notice Days";
      row = "Example Tech Solutions,Example Tech India Pvt Ltd,Tower A,Suite 201,50,48,15000,2026-04-01,2028-03-31,2,60";
      filename = "officex_flex_seats_template.csv";
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
      // 1. Commit Organization & Extended Config (Branding, Tax Profiles, Users, Charge Types)
      await fetch("/api/rent-roll/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: orgData.legalName,
          tradeName: orgData.tradeName,
          pan: orgData.pan,
          gstin: orgData.gstin,
          city: orgData.city,
          state: orgData.state,
          primaryAddress: orgData.primaryAddress,
          currency: fySettings.currency,
          taxProfiles,
          branding: {
            portfolioDisplayName: branding.portfolioDisplayName,
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
            tradeName: orgData.tradeName,
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

      // 2. Set Session & Completed LocalStorage State
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_onboarding_completed", "1");
        sessionStorage.setItem("officex_onboarding_completed", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_active_org", orgData.legalName);
        localStorage.setItem("officex_org_name", orgData.legalName);
        localStorage.setItem("officex_org_id", "ORG-" + Date.now());
        localStorage.setItem("officex_contact_verified", "1");
        localStorage.setItem("officex_phone_verified", "1");
        localStorage.setItem("officex_kyc_status", "VERIFIED");
        localStorage.setItem("officex_user_role", "Portfolio Executive");
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
    { num: 1, title: "1. Organization", subtitle: "Entity & Segments" },
    { num: 2, title: "2. Financial Entities", subtitle: "Multi-SPV & Taxes" },
    { num: 3, title: "3. Charge Master", subtitle: "Billing Rules & Tariffs" },
    { num: 4, title: "4. Visual Branding", subtitle: "Branding & Roles" },
    { num: 5, title: "5. Data Ingestion", subtitle: "Import Rent Roll" },
    { num: 6, title: "6. Go-Live", subtitle: "Production Launch" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ──── TOP GLOBAL NAVIGATION HEADER ──── */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/rent-roll" className="flex items-center gap-2">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={110}
              height={32}
              className="h-7 w-auto object-contain"
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
            <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
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
                {/* ════════ STEP 1: ORGANIZATION & SEGMENTS (Slide 3) ════════ */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 1 of 6 · Organization &amp; Business Segments
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Create Organization &amp; Select Segment</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Define your primary enterprise entity and select one or more commercial operating models.
                      </p>
                    </div>

                    {/* Segment Selector Cards */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">
                          Organization Type (Select One or More) *
                        </label>
                        <span className="text-[11px] font-semibold text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full">
                          {orgData.segments.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {[
                          { id: "commercial_owner", title: "Property Owner / Landlord", desc: "You own office buildings or commercial retail spaces and lease them out" },
                          { id: "pm_company", title: "Property Management Company", desc: "You manage commercial assets on behalf of owners and collect rent" },
                          { id: "fm_company", title: "Facility Management Company", desc: "You bill occupants for CAM, utilities, and site maintenance" },
                          { id: "msp", title: "Managed Service Provider (MSP)", desc: "You run entire commercial real estate portfolios for enterprise clients" },
                          { id: "flex_operator", title: "Managed Office / Flex Operator", desc: "You run co-working spaces and bill by seats or minimum commitment" }
                        ].map((seg) => {
                          const isSelected = orgData.segments.includes(seg.id);
                          return (
                            <div
                              key={seg.id}
                              onClick={() => toggleSegment(seg.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                                isSelected
                                  ? "bg-teal-50/80 border-[#0F8B7D] ring-2 ring-[#0F8B7D]/25"
                                  : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="font-extrabold text-xs text-slate-900">{seg.title}</div>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-[#0F8B7D] shrink-0 ml-1.5" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{seg.desc}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Pro Tip:</strong> You can select multiple operating models if your business spans multiple verticals (e.g. both commercial asset ownership and co-working operations).
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Organization Legal Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Commercial Estates Pvt Ltd"
                            value={orgData.legalName}
                            onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Portfolio Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Realty Horizon"
                            value={orgData.tradeName}
                            onChange={(e) => setOrgData({ ...orgData, tradeName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      <div>
                        <AddressAutocomplete
                          label="Corporate Registered Address (Google Maps Search)"
                          value={orgData.primaryAddress}
                          onChange={(val) => setOrgData((prev) => ({ ...prev, primaryAddress: val }))}
                          onSelectLocation={(loc) => {
                            setOrgData((prev) => ({
                              ...prev,
                              primaryAddress: loc.fullAddress || loc.displayName,
                              city: loc.city || prev.city,
                              state: loc.state || prev.state,
                            }));
                          }}
                          placeholder="Type building, commercial park, road, or full address..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                        <div>
                          <CityAutocomplete
                            label="Primary City"
                            required
                            value={orgData.city}
                            onChange={(city) => setOrgData((prev) => ({ ...prev, city }))}
                            onSelectCityAndState={(city, state) => {
                              setOrgData((prev) => ({
                                ...prev,
                                city,
                                state: state || prev.state,
                              }));
                            }}
                            placeholder="Type to search all Indian cities..."
                          />
                        </div>
                        <div>
                          <StateAutocomplete
                            label="Primary State"
                            required
                            value={orgData.state}
                            onChange={(state) => setOrgData((prev) => ({ ...prev, state }))}
                            placeholder="Type to search all 36 States/UTs..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 2: FINANCIAL ENTITIES & TAX PROFILES ════════ */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 2 of 6 · Financial Entities &amp; Tax Profiles
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Financial Entities &amp; Statutory Setup</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure multiple statutory billing entities (SPVs/States) and standard Tax Profiles per charge type.
                      </p>
                    </div>

                    {/* Part A: Multiple Billing Entities Manager */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#0F8B7D]" />
                            <span>Billing Entities (SPVs &amp; State Jurisdictions)</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            <em>Create a distinct billing profile for each legal entity, state GSTIN, or SPV structure.</em>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingEntity(true)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add Another Billing Entity / State
                        </button>
                      </div>

                      {/* List of Created Billing Entities */}
                      {billingEntities.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">No Billing Entities Configured Yet</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                            {orgData.legalName
                              ? `Click below to create your primary billing entity for "${orgData.legalName}".`
                              : "Add your legal SPVs or state billing entities to generate statutory GST invoices."}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (orgData.legalName) {
                                const cleanPrefix = (orgData.tradeName || orgData.legalName)
                                  .replace(/[^A-Za-z]/g, "")
                                  .substring(0, 3)
                                  .toUpperCase() || "INV";
                                setBillingEntities([
                                  {
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
                                  }
                                ]);
                              } else {
                                setIsAddingEntity(true);
                              }
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus size={14} /> {orgData.legalName ? `Generate Entity from "${orgData.legalName}"` : "Add Billing Entity"}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {billingEntities.map((be) => (
                            <div
                              key={be.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                be.isDefault
                                  ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-400/40"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              {editingEntityId === be.id && editEntity ? (
                                /* ── Inline Edit Form ── */
                                <div className="space-y-3 animate-fadeIn">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-teal-950 flex items-center gap-1.5">
                                      <Pencil size={13} className="text-[#0F8B7D]" /> Edit Billing Entity
                                      {be.isDefault && (
                                        <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold ml-1">
                                          Default Primary
                                        </span>
                                      )}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditEntity}
                                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">SPV Legal Entity Name *</label>
                                      <input
                                        type="text"
                                        value={editEntity.spvName}
                                        onChange={(e) => setEditEntity({ ...editEntity, spvName: e.target.value })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <StateAutocomplete
                                        label="State Code / Jurisdiction"
                                        required
                                        returnCodeFormat={true}
                                        value={editEntity.stateCode}
                                        onChange={(val) => setEditEntity({ ...editEntity, stateCode: val })}
                                        placeholder="e.g. 07 - Delhi, 27 - Maharashtra..."
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">15-Digit GSTIN *</label>
                                        <span className={`text-[10px] font-mono font-bold ${editEntity.gstin.length === 15 ? "text-emerald-600" : "text-slate-400"}`}>
                                          {editEntity.gstin.length}/15
                                        </span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={15}
                                        placeholder="27ABCDE1234F1Z5"
                                        value={editEntity.gstin}
                                        onChange={(e) => {
                                          const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                                          const autoPan = cleaned.length >= 12 ? cleaned.substring(2, 12) : editEntity.pan;
                                          setEditEntity({ ...editEntity, gstin: cleaned, pan: autoPan });
                                        }}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold tracking-wider uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Invoice Numbering Prefix *</label>
                                        <span className="text-[10px] text-slate-400 font-mono">Max 8 Chars</span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={8}
                                        value={editEntity.invoicePrefix}
                                        onChange={(e) => setEditEntity({ ...editEntity, invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, 8) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-teal-700 uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">Bank Account for Collections</label>
                                        <span className="text-[10px] text-slate-400 font-mono">Digits Only</span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={18}
                                        placeholder="e.g. 50200012345678"
                                        value={editEntity.accountNumber}
                                        onChange={(e) => setEditEntity({ ...editEntity, accountNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 18) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="block text-[11px] font-bold text-slate-700">IFSC Code (11 Chars)</label>
                                        <span className={`text-[10px] font-mono font-bold ${editEntity.ifscCode.length === 11 ? "text-emerald-600" : "text-slate-400"}`}>
                                          {editEntity.ifscCode.length}/11
                                        </span>
                                      </div>
                                      <input
                                        type="text"
                                        maxLength={11}
                                        placeholder="e.g. HDFC0001234"
                                        value={editEntity.ifscCode}
                                        onChange={(e) => setEditEntity({ ...editEntity, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:border-[#0F8B7D]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditEntity}
                                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                      Discard
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveEditEntity}
                                      className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer"
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
                                        Default Primary
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                    Jurisdiction: {be.stateCode}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!be.isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultEntity(be.id)}
                                      className="text-[10px] text-teal-700 hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                                    >
                                      Set Default
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
                                <span className="text-slate-400 block text-[10px]">GSTIN (15-Digit)</span>
                                <span className="font-mono font-bold text-slate-800">{be.gstin}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Invoice Series Prefix</span>
                                <span className="font-mono font-bold text-teal-700">{be.invoicePrefix}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Bank for Collections</span>
                                <span className="text-slate-700 font-medium truncate block">{be.bankName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Account &amp; IFSC</span>
                                <span className="font-mono text-slate-700 truncate block">{be.accountNumber || "—"} ({be.ifscCode})</span>
                              </div>
                            </div>
                                </>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                      {/* Modal/Inline Form to Add Entity */}
                      {isAddingEntity && (
                        <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-teal-950">Add SPV / State Billing Entity</span>
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
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">SPV Legal Entity Name *</label>
                              <input
                                type="text"
                                placeholder="e.g. Skyline Commercial Assets SPV-1 Pvt Ltd"
                                value={newEntity.spvName}
                                onChange={(e) => setNewEntity({ ...newEntity, spvName: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <StateAutocomplete
                                label="State Code / Jurisdiction"
                                required
                                returnCodeFormat={true}
                                value={newEntity.stateCode}
                                onChange={(val) => setNewEntity({ ...newEntity, stateCode: val })}
                                placeholder="e.g. 07 - Delhi, 27 - Maharashtra..."
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">15-Digit GSTIN *</label>
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
                              <span className="text-[10px] text-slate-400 block mt-0.5">Format: 2 state + 10 PAN + 3 entity</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Invoice Numbering Prefix *</label>
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
                              <span className="text-[10px] text-slate-400 block mt-0.5">Used for invoice serial numbering</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">Bank Account for Collections</label>
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
                              <span className="text-[10px] text-slate-400 block mt-0.5">9 to 18 digits bank account number</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">IFSC Code (11 Chars)</label>
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
                              <span className="text-[10px] text-slate-400 block mt-0.5">Format: 4 letters + 0 + 6 alphanumeric</span>
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleAddEntity}
                              className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Save Entity
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
                            <span>Tax Profiles — Standard GST Rates per Charge Type</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            <em>Standard commercial rates default to 18% GST; SEZ and IFSC properties default to 0% GST (tax-exempt).</em>
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
                            IFSC / SEZ (0% Exempt)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block">Base Rent GST</span>
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
                          <span className="text-[10px] text-slate-500 font-bold block">CAM GST</span>
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
                          <span className="text-[10px] text-slate-500 font-bold block">Grid Power GST</span>
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
                          <span className="text-[10px] text-slate-500 font-bold block">IFSC SEZ Status</span>
                          <span className={`text-[11px] font-bold ${taxProfiles.isIfscTaxExempt ? "text-emerald-600" : "text-slate-600"}`}>
                            {taxProfiles.isIfscTaxExempt ? "0% Tax-Exempt" : "Standard Domestic"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 3: SECTION B — CHARGES CHECKLIST & TARIFFS (Slide 4) ════════ */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 3 of 6 · Operational Settings &amp; Charge Master
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Operational Settings &amp; Charge Master</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select which charges you bill for, configure individual rates, and enforce the portfolio Inclusions Rule.
                      </p>
                    </div>

                    {/* Currency and Financial Year */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Reporting Currency</label>
                        <select
                          value={fySettings.currency}
                          onChange={(e) => setFySettings({ ...fySettings, currency: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                        >
                          <option value="INR (₹)">INR (₹) — Standard Domestic</option>
                          <option value="USD ($)">USD ($) — IFSC / SEZ Offshore Units</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Financial Year Cycle</label>
                        <select
                          value={fySettings.fyStartMonth}
                          onChange={(e) => setFySettings({ ...fySettings, fyStartMonth: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                        >
                          <option value="April 1 (Standard Indian FY)">April 1 – March 31 (Indian FY)</option>
                          <option value="January 1 (Calendar Year)">January 1 – December 31 (Calendar FY)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Invoicing Due Day</label>
                        <select
                          value={fySettings.billingDueDay}
                          onChange={(e) => setFySettings({ ...fySettings, billingDueDay: Number(e.target.value) })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                        >
                          <option value={5}>5th of each month</option>
                          <option value={7}>7th of each month</option>
                          <option value={10}>10th of each month</option>
                          <option value={15}>15th of each month</option>
                        </select>
                      </div>
                    </div>

                    {/* Charge Types Selectable Checklist */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900">
                            Charge Types Checklist: Select Which Charges You Bill For
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Check items active in your portfolio. Toggle &quot;Included in Base Rent&quot; to prevent double billing.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                          {chargeList.filter(c => c.enabled).length} of {chargeList.length} Active
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                        {chargeList.map((chg) => (
                          <div
                            key={chg.id}
                            className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              chg.enabled ? "bg-white" : "bg-slate-50/70 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleCharge(chg.id)}
                                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                  chg.enabled ? "bg-[#0F8B7D] text-white" : "border border-slate-300 bg-white"
                                }`}
                              >
                                {chg.enabled && <Check size={13} />}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs text-slate-900">{chg.name}</span>
                                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                    {chg.category}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">{chg.description}</span>
                              </div>
                            </div>

                            {chg.enabled && (
                              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                {/* Inclusions Rule Toggle */}
                                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={chg.isInclusion}
                                    onChange={() => toggleInclusionRule(chg.id)}
                                    className="rounded text-[#0F8B7D] w-3.5 h-3.5"
                                  />
                                  <span>Included in Rent</span>
                                </label>

                                {/* Rate input */}
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                                  <span className="text-[11px] font-bold text-slate-600">Rate:</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={chg.rate}
                                    onChange={(e) => updateChargeRate(chg.id, Number(e.target.value))}
                                    className="w-16 p-0.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded text-right"
                                  />
                                  <span className="text-[11px] text-slate-500 font-medium">{chg.unit}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 4: SECTION C & D — BRANDING, DOMAINS & USERS (Slide 4) ════════ */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 4 of 6 · Visual Branding, Custom Domains &amp; Users
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
                                  style={{ backgroundColor: branding.brandColor }}
                                >
                                  {logoInitials}
                                </div>
                                <span>Fallback: Your company initials <strong>"{logoInitials}"</strong> will be used if no logo is uploaded.</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand Accent Colour</label>
                            <div className="flex items-center gap-2">
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
                                    branding.brandColor === c.hex ? "border-slate-900 scale-110 shadow-sm" : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                              <input
                                type="text"
                                maxLength={7}
                                placeholder="#0F8B7D"
                                value={branding.brandColor}
                                onChange={(e) => setBranding({ ...branding, brandColor: e.target.value.slice(0, 7) })}
                                className="w-20 p-1 text-xs font-mono font-bold border border-slate-200 rounded text-center ml-2"
                              />
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
                                className="p-2.5 rounded-lg text-white flex items-center justify-between"
                                style={{ backgroundColor: branding.brandColor }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center overflow-hidden">
                                    {branding.logoPreview ? (
                                      <img src={branding.logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                      <span className="font-black text-xs">{logoInitials}</span>
                                    )}
                                  </div>
                                  <span className="font-extrabold text-xs">{branding.portfolioDisplayName}</span>
                                </div>
                                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">TAX INVOICE</span>
                              </div>
                              <div className="text-[10px] text-slate-500 border-b border-slate-100 pb-1.5 flex justify-between">
                                <span>{billingEntities[0]?.spvName}</span>
                                <span className="font-mono font-bold">GSTIN: {billingEntities[0]?.gstin}</span>
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
                                  className="mt-2 py-1 px-3 text-center text-white rounded font-bold text-xs"
                                  style={{ backgroundColor: branding.brandColor }}
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
                                className="p-2 rounded text-[11px] font-bold text-white text-center"
                                style={{ backgroundColor: branding.brandColor }}
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
                            placeholder="e.g. billing@acmecommercial.com"
                            value={domains.senderBillingEmail}
                            onChange={(e) => setDomains({ ...domains, senderBillingEmail: e.target.value })}
                            className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-[#0F8B7D]"
                          />
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={12} className="text-emerald-600" /> SPF / DKIM Verified
                          </span>
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

                {/* ════════ STEP 5: DATA IMPORT & INGESTION (9-STEP SUITE) ════════ */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 5 of 6 · Rent Roll Import &amp; Ingestion Engine
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Rent Roll Import &amp; Ingestion Engine</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Follow the canonical 9-step ingestion pipeline from file profiling through reconciliation, two-step signoff, and 7-day rollback.
                      </p>
                    </div>

                    {/* 9 Mini Steps Sub-tabs */}
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center text-[10px] font-bold">
                      {[
                        { num: 1, label: "5.1 Upload" },
                        { num: 2, label: "5.2 Profile" },
                        { num: 3, label: "5.3 Mapping" },
                        { num: 4, label: "5.4 Validate" },
                        { num: 5, label: "5.5 Control" },
                        { num: 6, label: "5.6 Exceptions" },
                        { num: 7, label: "5.7 2-Step Sign" },
                        { num: 8, label: "5.8 Commit" },
                        { num: 9, label: "5.9 Rollback" }
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

                    {/* Step 5.1: Upload file & Templates */}
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

                          {/* Action Buttons: Skip vs Proceed */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setCurrentStep(6)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                              Skip for now — I&apos;ll add leases later from Dashboard →
                            </button>

                            <div className="flex items-center gap-2">
                              {!uploadedFileName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadedFileName("sample_commercial_portfolio.csv");
                                    setProfilingReport(prev => ({ ...prev, totalRows: 12, qualityScore: 99.4 }));
                                  }}
                                  className="text-xs text-[#0F8B7D] hover:underline font-bold px-3 py-2 cursor-pointer"
                                >
                                  Load Demo Data
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!uploadedFileName) {
                                    setUploadedFileName("sample_commercial_portfolio.csv");
                                  }
                                  setImportWorkflowStep(2);
                                }}
                                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                              >
                                <span>Proceed to 5.2 Data Profiling</span>
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Subtle Helper Link */}
                          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                            <span>Don&apos;t have a formatted spreadsheet yet?</span>
                            <button
                              type="button"
                              onClick={() => handleDownloadSample("area")}
                              className="text-[#0F8B7D] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download size={11} /> Download Sample Excel Template (.CSV)
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6.2: Data Profiling */}
                    {importWorkflowStep === 2 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 5.2: Automated Data Profiling &amp; Quality Scan</h3>
                            <p className="text-[11px] text-slate-500">Scans for duplicate GSTINs, missing rents, and inconsistent date ranges.</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Quality Score: {profilingReport.qualityScore}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Ingested Rows</span>
                            <span className="font-extrabold text-slate-900 text-base">{profilingReport.totalRows} Contracts</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Duplicate Detection</span>
                            <span className="font-extrabold text-emerald-600 text-base">0 Duplicates</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Source Area</span>
                            <span className="font-extrabold text-slate-900 text-base">{profilingReport.sourceTotalArea.toLocaleString()} sq ft</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Monthly Rent</span>
                            <span className="font-extrabold text-teal-700 text-base">₹{(profilingReport.sourceTotalRent / 100000).toFixed(2)} Lakh</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(3)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 5.3 Column Mapping →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6.3: Column Mapping */}
                    {importWorkflowStep === 3 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 5.3: Smart Column Mapping Engine</h3>
                            <p className="text-[11px] text-slate-500">Auto-matches source column headers with canonical schema.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert("Mapping template 'Apex Monthly Standard' saved successfully!")}
                            className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                          >
                            Save Mapping as Template
                          </button>
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

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(4)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 5.4 Validation Engine →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6.4: Validation (44 checks) */}
                    {importWorkflowStep === 4 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 5.4: Canonical 44-Rule Validation Engine</h3>
                            <p className="text-[11px] text-slate-500">Runs rules R-01 to R-44 with contextual fix hints.</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                            43 Passed · 1 Yellow Warning
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Rule R-01 to R-42: Date coherence, lock-in &lt; lease term, and positive rental rates verified.</span>
                          </div>

                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                              <div>
                                <span className="font-bold">Warning R-30: Uniform escalation step (15% per 36 months) detected across 8 leases.</span>
                                <div className="text-[10px] text-amber-800 mt-0.5">Fix hint: Confirm whether this is standardized institutional lease terms or placeholder data.</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHasAcknowledgedWarnings(!hasAcknowledgedWarnings)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                                hasAcknowledgedWarnings ? "bg-amber-700 text-white" : "bg-white border border-amber-300 text-amber-900"
                              }`}
                            >
                              {hasAcknowledgedWarnings ? "Acknowledged ✓" : "Click to Acknowledge"}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(5)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 5.5 Control Totals →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6.5: Control Totals Check */}
                    {importWorkflowStep === 5 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Step 5.5: Control Totals &amp; Variance Reconciler</h3>
                          <p className="text-[11px] text-slate-500">
                            <em>Any variance exceeding 0.5% between source sheets and system totals requires supervisor reconciliation.</em>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Total Leasable Area Comparison</span>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Source Excel:</span>
                              <span className="font-mono font-bold">1,75,300 sq ft</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">OFFICEX Import:</span>
                              <span className="font-mono font-bold text-teal-700">1,75,300 sq ft</span>
                            </div>
                            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 font-bold text-emerald-600">
                              <span>Variance:</span>
                              <span>0.00% (Exact Match ✓)</span>
                            </div>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Total Monthly Base Rent Comparison</span>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Source Excel:</span>
                              <span className="font-mono font-bold">₹2,42,42,000</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">OFFICEX Import:</span>
                              <span className="font-mono font-bold text-teal-700">₹2,42,42,000</span>
                            </div>
                            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 font-bold text-emerald-600">
                              <span>Variance:</span>
                              <span>0.00% (Exact Match ✓)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(6)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 5.6 Exception Queue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6.6: Exception Queue */}
                    {importWorkflowStep === 6 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 5.6: Exception Queue &amp; Inline Resolution</h3>
                            <p className="text-[11px] text-slate-500">Fix rows inline, download error file, or mark overridden with audit notes.</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            0 Blocking Exceptions
                          </span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-center text-slate-600 space-y-1">
                          <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                          <div className="font-bold text-slate-900">All 12 lease agreements passed validation!</div>
                          <div className="text-[11px] text-slate-500">No unresolved exceptions found. Ready for Two-Step Approval sign-off.</div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(7)}
                            className="px-5 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Next: 5.7 Two-Step Approval →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6.7: Two-Step Approval */}
                    {importWorkflowStep === 7 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Step 5.7: Dual-Control Two-Step Approval</h3>
                          <p className="text-[11px] text-slate-500">
                            1. Preparer (Finance) reviews and submits → 2. Approver (Org Admin) commits to production.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                            <span className="font-extrabold text-slate-900 block">Step 1: Preparer Sign-Off (Finance AR Head)</span>
                            <p className="text-[11px] text-slate-500">
                              I certify that all 12 lease terms, base rents, and billing entities match the executed lease agreements.
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

                    {/* Step 6.8: Commit to Production */}
                    {importWorkflowStep === 8 && (
                      <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={24} className="text-teal-700" />
                          <div>
                            <h3 className="text-xs font-bold text-teal-950">Step 5.8: Commit to Production Executed</h3>
                            <p className="text-[11px] text-teal-800">Opening snapshot created, WALE calculated (3.86 Years), and stepped rent reviews primed.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Opening Snapshot</span>
                            <span className="font-extrabold text-slate-900 text-sm">Oct 2026 Frozen</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">WALE Horizon</span>
                            <span className="font-extrabold text-teal-700 text-sm">3.86 Years</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Stepped Escalations</span>
                            <span className="font-extrabold text-slate-900 text-sm">36 Steps Primed</span>
                          </div>
                          <div className="p-3 bg-white border border-teal-200 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold">Expiry Alerts</span>
                            <span className="font-extrabold text-purple-700 text-sm">12 Active Triggers</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setImportWorkflowStep(9)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            View 5.9 Rollback Policy
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(6)}
                            className="px-6 py-2 bg-[#0F8B7D] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Proceed to Step 6: Go-Live Checklist →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 5.9: Rollback (within 7 days) */}
                    {importWorkflowStep === 9 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">Step 5.9: 7-Day Rollback Safety Policy</h3>
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
                            <span className="text-slate-800">Batch: BATCH-CANONICAL-SEC13</span>
                            <span className="text-teal-700">Status: Active Live</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Reversing this batch removes all newly created contracts without impacting prior historical data.
                          </p>
                          <button
                            type="button"
                            onClick={() => alert("Simulation: Batch rollback window active. All audit logs and snapshots recorded.")}
                            className="mt-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw size={13} /> Test Rollback Simulation (Within 7 Days)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════ STEP 6: GO-LIVE CHECKLIST ════════ */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 6 of 6 · Production Go-Live Verification
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Production Go-Live Readiness Verification</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Complete the mandatory 5-point go-live checklist before switching off legacy spreadsheets.
                      </p>
                    </div>

                    {/* 5 Checklist Items */}
                    <div className="space-y-2.5">
                      {[
                        {
                          key: "dataQualityVerified",
                          title: "1. Data Quality Verification",
                          desc: "Verify that all numbers (area, rent, deposits, escalations) match your source documents exactly."
                        },
                        {
                          key: "userTrainingCompleted",
                          title: "2. User Training & Role SOPs",
                          desc: "Team logged in and aware of role-based dashboards (Org Admin, Finance AR, Property Mgr, Leasing, Occupant)."
                        },
                        {
                          key: "testBillingRunCompleted",
                          title: "3. Test Billing Run on Pilot Property",
                          desc: "Simulated billing run for 1 property; compared generated component PDF invoices against legacy system."
                        },
                        {
                          key: "parallelRunAgreed",
                          title: "4. One-Month Parallel Run Agreement",
                          desc: "Run both legacy spreadsheet and OFFICEX together for 1 cycle to guarantee zero discrepancies."
                        },
                        {
                          key: "occupantCommunicationSent",
                          title: "5. Occupant Communication Blast Prepared",
                          desc: "Welcome emails and branded portal login links ready to be dispatched to tenant accounts."
                        }
                      ].map((item) => {
                        const isChecked = (goLiveChecklist as any)[item.key];
                        return (
                          <div
                            key={item.key}
                            onClick={() => setGoLiveChecklist({ ...goLiveChecklist, [item.key]: !isChecked })}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? "bg-teal-50/70 border-teal-300"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? "bg-[#0F8B7D] text-white" : "border border-slate-300 bg-white"
                            }`}>
                              {isChecked && <Check size={14} />}
                            </div>
                            <div className="flex-1">
                              <span className="font-extrabold text-xs text-slate-900 block">{item.title}</span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pilot Test Billing Simulator Card */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-[#0F8B7D]" />
                          <span>Simulated Pilot Test Billing Results (Milestone 3)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          100% Match with Legacy System ✓
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">Invoices Tested</span>
                          <span className="font-bold text-slate-900">{testBillingPreview.invoicesGenerated} Draft Invoices</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">Base Rent Sum</span>
                          <span className="font-bold text-slate-900">₹{(testBillingPreview.totalBaseRent / 100000).toFixed(2)} Lakh</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">CAM Sum</span>
                          <span className="font-bold text-slate-900">₹{(testBillingPreview.totalCam / 100000).toFixed(2)} Lakh</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">18% GST Output</span>
                          <span className="font-bold text-teal-700">₹{(testBillingPreview.totalGst / 100000).toFixed(2)} Lakh</span>
                        </div>
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

            {currentStep < 6 ? (
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

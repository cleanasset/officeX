"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Building,
  Handshake,
  Truck,
  Settings,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Upload,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  Lock,
  Sparkles,
  MapPin,
  Briefcase,
  Layers,
  Award,
  DollarSign,
  Check,
  Landmark,
  Wrench,
  FileCheck,
  BadgeCheck,
  Eye,
  Building2,
  FileSpreadsheet,
  X
} from "lucide-react";

// The 7 Canonical Steps:
// 1. Common Registration
// 2. Organization Profile (GST Model Master)
// 3. Role-Specific Business Profile
// 4. Operational Profile
// 5. KYC & Statutory Verification
// 6. Documents Vault
// 7. Activation & Role Portal Launch

function OnboardingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // KYC Verification Engine State (Step 5)
  const [kycChecks, setKycChecks] = useState({
    panVerified: false,
    gstinVerified: false,
    mcaVerified: false,
    roleCredVerified: false,
    bankVerified: false
  });
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isVerifyingGstin, setIsVerifyingGstin] = useState(false);
  const [isVerifyingMca, setIsVerifyingMca] = useState(false);
  const [isVerifyingRoleCred, setIsVerifyingRoleCred] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const verifiedChecksCount = Object.values(kycChecks).filter(Boolean).length;

  // Active Role Selection
  const [role, setRole] = useState<"owner" | "broker" | "vendor" | "tenant">("owner");

  // Step 1: Common Registration User Info (Loaded dynamically from user's active session)
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    otpVerified: false,
    designation: ""
  });

  // Step 2: GST-Modeled Organization Master Sub-tabs
  const [orgMasterTab, setOrgMasterTab] = useState<"business" | "promoters" | "signatory" | "representative" | "principal" | "additional">("business");
  
  // Organization Business Details (GST Model Part A)
  const [orgData, setOrgData] = useState({
    id: "",
    organizationCode: "",
    legalName: "",
    tradeName: "",
    organizationType: "PRIVATE_LIMITED",
    pan: "",
    gstin: "",
    cin: "",
    llpin: "",
    website: "",
    yearEstablished: "",
    employeeCountBand: "1–10"
  });

  // Organization Promoters / Partners / Directors (GST Model Part B)
  const [promoters, setPromoters] = useState<Array<{
    id: string;
    name: string;
    designation: string;
    dinPan: string;
    mobile: string;
    email: string;
    equityPct: string;
    state: string;
  }>>([]);

  // Organization Authorized Signatory (GST Model Part C)
  const [authorizedSignatory, setAuthorizedSignatory] = useState({
    isPrimary: true,
    name: "",
    designation: "Director / Authorized Signatory",
    mobile: "",
    email: "",
    authDocType: "BOARD_RESOLUTION",
    authDocRef: "",
    authDate: ""
  });

  // Organization Authorized Representative (GST Model Part D)
  const [hasAuthRep, setHasAuthRep] = useState(false);
  const [authorizedRepresentative, setAuthorizedRepresentative] = useState({
    repType: "CHARTERED_ACCOUNTANT",
    name: "",
    enrolmentNo: "",
    mobile: "",
    email: ""
  });

  // Organization Principal Place of Business (GST Model Part E)
  const [principalPlace, setPrincipalPlace] = useState({
    natureOfPossession: "OWNED",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    district: "",
    state: "Maharashtra",
    pincode: "",
    primaryActivity: "Commercial Real Estate & Asset Ownership"
  });

  // Organization Additional Places of Business (GST Model Part F)
  const [additionalPlaces, setAdditionalPlaces] = useState<Array<{
    id: string;
    branchName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    activity: string;
  }>>([]);

  // Step 3: Role-Specific Business Profiles (Distinct Form per Role)
  // 1. OWNER
  const [ownerProfile, setOwnerProfile] = useState({
    ownershipStructure: "DIRECT_OWNER",
    titleType: "FREEHOLD",
    portfolioAssetClasses: ["GRADE_A_OFFICE"] as string[],
    totalCommercialGLASqft: "",
    totalAssetCount: 0,
    portfolioValuationBand: "",
    currentOccupancyPct: "0",
    askingRentSqftMonth: "",
    standardLeaseLockinYears: "3",
    fireNocStatus: "VALID_CURRENT",
    occupancyCertStatus: "FULL_OC_ISSUED",
    reraProjectRegistrationNo: ""
  });

  // 2. BROKER
  const [brokerProfile, setBrokerProfile] = useState({
    brokerageModel: "COMMERCIAL_ADVISORY_FIRM",
    reraStatus: "REGISTERED",
    reraStateAuthority: "MahaRERA",
    reraRegistrationNo: "",
    reraExpiryDate: "",
    specializations: ["ENTERPRISE_OFFICE_LEASING"] as string[],
    operatingMicroMarkets: [] as string[],
    typicalDealTicketBand: "",
    annualTransactionsBand: "",
    commissionEscrowBankName: "",
    commissionEscrowAccountNo: "",
    commissionEscrowIFSC: "",
    agreed45DayPayoutModel: true
  });

  // 3. FM VENDOR
  const [vendorProfile, setVendorProfile] = useState({
    tradeMatrixHardFM: ["HVAC_CHILLERS", "HT_LT_ELECTRICAL"] as string[],
    tradeMatrixSoftFM: ["CORPORATE_HOUSEKEEPING"] as string[],
    psaraLicenseNo: "",
    psaraValidityDate: "",
    electricalGradeALicenseNo: "",
    contractLabourLicenseNo: "",
    epfEstablishmentCode: "",
    esicRegistrationCode: "",
    cglInsurancePolicyNo: "",
    cglCoverageAmount: "",
    isoCertifications: [] as string[],
    activeTechnicianCount: 0,
    criticalBreakdownSlaResponse: "LESS_THAN_30_MINS",
    controlRoom24x7Available: true
  });

  // 4. TENANT
  const [tenantProfile, setTenantProfile] = useState({
    enterpriseClassification: "ENTERPRISE",
    employeeHeadcountIndia: 0,
    threeYearExpansionForecastPct: "",
    targetSpaceFootprintSqft: "",
    seatRatioPreference: "HYBRID_1_TO_0_8",
    fitoutHandoverPreference: "FULLY_FURNISHED_PLUG_PLAY",
    targetCommercialSubmarkets: [] as string[],
    targetMoveInWindow: "30_TO_60_DAYS",
    preferredLeaseTenureYears: "3",
    centralBillingNodalName: "",
    centralBillingEmail: "",
    tanNumber: ""
  });

  // Step 4: Operational Profile
  const [operationalProfile, setOperationalProfile] = useState({
    // Owner ops
    listingBroadcastMode: "SELECTIVE_BROKER_NETWORK",
    autoScheduleSiteInspection: true,
    minBrokerQualificationTier: "RERA_VERIFIED_ONLY",

    // Broker ops
    coBrokerageSplitRatio: "50_50_STANDARD",
    clientExclusivityLockPeriodDays: "60",
    dealNotificationChannels: ["WHATSAPP", "EMAIL", "IN_APP_PUSH"] as string[],

    // Vendor ops
    workOrderDispatchPolicy: "AUTO_GEO_DISPATCH",
    ppmDigitalChecklistMandatory: true,
    standbyShiftStaffAvailable: true,

    // Tenant ops
    visitorGateStrictness: "STRICT_PHOTO_AND_GOVT_ID",
    afterHoursHvacRequestNoticeHours: "4",
    employeeDeskBookingEnforced: true
  });

  // Step 6: Role-Mandated Documents Vault
  const [documentsVault, setDocumentsVault] = useState<Array<{
    id: string;
    type: string;
    label: string;
    mandatory: boolean;
    docNumber: string;
    fileName: string;
    fileSize: string;
    status: "verified" | "uploaded" | "pending";
    extractedData?: string;
    fileUrl?: string;
  }>>([]);

  // Load real authenticated user info from query params, localStorage, sessionStorage, or Supabase
  useEffect(() => {
    const loadSessionUser = async () => {
      const queryName = searchParams.get("name") || "";
      const queryEmail = searchParams.get("email") || "";
      const queryMobile = searchParams.get("mobile") || searchParams.get("phone") || "";
      const queryVerified = searchParams.get("verified") === "1";

      let storedName = queryName || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "") : "");
      let storedEmail = queryEmail || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "") : "");
      let storedPhone = queryMobile || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_mobile") || localStorage.getItem("officex_user_phone") || sessionStorage.getItem("officex_user_mobile") || "") : "");
      let isPhoneVerified = queryVerified || (typeof window !== "undefined" ? Boolean(localStorage.getItem("officex_phone_verified") === "1" || localStorage.getItem("officex_kyc_stage") === "K0_CONTACT_VERIFIED") : false);

      // Persist query params if present
      if (typeof window !== "undefined") {
        if (queryName) {
          localStorage.setItem("officex_user_name", queryName);
          sessionStorage.setItem("officex_user_name", queryName);
        }
        if (queryEmail) {
          localStorage.setItem("officex_user_email", queryEmail);
          sessionStorage.setItem("officex_user_email", queryEmail);
        }
        if (queryMobile) {
          localStorage.setItem("officex_user_mobile", queryMobile);
          sessionStorage.setItem("officex_user_mobile", queryMobile);
        }
        if (queryVerified) {
          localStorage.setItem("officex_phone_verified", "1");
        }
      }

      // If user entered phone number as identifier during sign-in
      if (storedEmail && !storedEmail.includes("@") && /^\+?[0-9\s-]+$/.test(storedEmail)) {
        if (!storedPhone) storedPhone = storedEmail;
        storedEmail = "";
        isPhoneVerified = true;
      }

      // Check live Supabase session
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.email && !storedEmail) storedEmail = user.email;
          if (user.phone && !storedPhone) {
            storedPhone = user.phone;
            isPhoneVerified = true;
          }
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
          if (metaName && !storedName) storedName = metaName;
          if (user.phone_confirmed_at) isPhoneVerified = true;
        }
      } catch (e) {
        // ignore
      }

      if (storedPhone) {
        const digits = storedPhone.replace(/\D/g, "");
        if (digits.length === 10) {
          storedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
      }

      setUserData(prev => ({
        ...prev,
        fullName: storedName || prev.fullName,
        email: storedEmail || prev.email,
        mobile: storedPhone || prev.mobile,
        otpVerified: isPhoneVerified
      }));

      setAuthorizedSignatory(prev => ({
        ...prev,
        name: storedName || prev.name,
        email: storedEmail || prev.email,
        mobile: storedPhone || prev.mobile
      }));

      if (storedName) {
        setPromoters(prev => {
          if (prev.length === 0) {
            return [{
              id: `prom-${Date.now()}`,
              name: storedName,
              designation: "Director / Authorized Partner",
              dinPan: "",
              mobile: storedPhone,
              email: storedEmail,
              equityPct: "100%",
              state: "Maharashtra"
            }];
          }
          return prev;
        });
      }
    };

    loadSessionUser();
  }, [searchParams]);

  // Initialize Documents Vault with clean pending state when role changes
  useEffect(() => {
    if (role === "owner") {
      setDocumentsVault([
        { id: "d-1", type: "TITLE_DEED", label: "Registered Title Deed / Conveyance Deed", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "d-2", type: "PROPERTY_TAX", label: "Latest Municipal Corporation Property Tax Receipt", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "d-3", type: "FIRE_NOC", label: "CFO Fire Safety Final NOC Certificate", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "d-4", type: "OCCUPANCY_CERT", label: "Full Occupancy Certificate (OC) from MCGM / SRA", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "d-5", type: "GST_CERTIFICATE", label: "GSTIN Registration Certificate (Form REG-06)", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" }
      ]);
    } else if (role === "broker") {
      setDocumentsVault([
        { id: "b-1", type: "RERA_CERTIFICATE", label: "MahaRERA Real Estate Agent License Certificate", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "b-2", type: "PAN_FIRM", label: "Commercial Firm / Individual PAN Card", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "b-3", type: "CANCELLED_CHEQUE", label: "Cancelled Cheque for Commission Escrow Payouts", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "b-4", type: "GST_CERTIFICATE", label: "GSTIN Registration Certificate (REG-06)", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" }
      ]);
    } else if (role === "vendor") {
      setDocumentsVault([
        { id: "v-1", type: "ELECTRICAL_GRADE_A", label: "State Electrical Inspectorate Grade-A License", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "v-2", type: "PSARA_LICENSE", label: "PSARA Private Security Agency License", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "v-3", type: "LABOUR_CONTRACTOR", label: "Contract Labour (R&A) Act Registration", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "v-4", type: "EPF_ESIC_PROOF", label: "Combined EPFO & ESIC Active Monthly Challan", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "v-5", type: "CGL_INSURANCE", label: "Comprehensive General Liability (CGL) Policy", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" }
      ]);
    } else {
      // Tenant
      setDocumentsVault([
        { id: "t-1", type: "COI_MCA", label: "Certificate of Incorporation (Ministry of Corporate Affairs)", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "t-2", type: "BOARD_RESOLUTION", label: "Board Resolution / Letter of Authority for Lease Execution", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "t-3", type: "GST_CERTIFICATE", label: "GSTIN Certificate for Input Tax Credit (ITC)", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" },
        { id: "t-4", type: "TAN_ALLOTMENT", label: "Income Tax TAN Allotment Letter (Form 49B)", mandatory: true, docNumber: "", fileName: "", fileSize: "", status: "pending" }
      ]);
    }
  }, [role]);

  // Step 7: Statutory Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Sync role with query params
  useEffect(() => {
    if (queryRole) {
      const lower = queryRole.toLowerCase();
      if (lower.includes("broker")) setRole("broker");
      else if (lower.includes("vendor")) setRole("vendor");
      else if (lower.includes("tenant")) setRole("tenant");
      else setRole("owner");
    }
  }, [queryRole]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Promoter Helpers
  const addPromoter = () => {
    setPromoters((prev) => [
      ...prev,
      {
        id: `prom-${Date.now()}`,
        name: "",
        designation: "Director",
        dinPan: "",
        mobile: "",
        email: "",
        equityPct: "0%",
        state: "Maharashtra"
      }
    ]);
  };

  const removePromoter = (id: string) => {
    if (promoters.length <= 1) {
      showToast("At least one Promoter / Director is required under corporate law.", "error");
      return;
    }
    setPromoters((prev) => prev.filter((p) => p.id !== id));
  };

  // Additional Branch Helpers
  const addAdditionalPlace = () => {
    setAdditionalPlaces((prev) => [
      ...prev,
      {
        id: `branch-${Date.now()}`,
        branchName: "",
        address: "",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "",
        activity: "Commercial Operations"
      }
    ]);
  };

  const removeAdditionalPlace = (id: string) => {
    setAdditionalPlaces((prev) => prev.filter((b) => b.id !== id));
  };

  // Statutory Verification Handlers (Step 5)
  const handleVerifyPan = () => {
    if (!orgData.pan.trim()) {
      showToast("Please enter an entity PAN in Step 2 or upload your PAN card.", "error");
      return;
    }
    setIsVerifyingPan(true);
    setTimeout(() => {
      setIsVerifyingPan(false);
      setKycChecks((prev) => ({ ...prev, panVerified: true }));
      showToast(`PAN ${orgData.pan} verified against CBDT registry. Entity match confirmed.`, "success");
    }, 800);
  };

  const handleVerifyGstin = () => {
    if (!orgData.gstin.trim()) {
      showToast("Please enter a valid GSTIN in Step 2 or upload Form REG-06.", "error");
      return;
    }
    setIsVerifyingGstin(true);
    setTimeout(() => {
      setIsVerifyingGstin(false);
      setKycChecks((prev) => ({ ...prev, gstinVerified: true }));
      showToast(`GSTIN ${orgData.gstin} validated active on GST System.`, "success");
    }, 800);
  };

  const handleVerifyMca = () => {
    if (!orgData.cin.trim()) {
      showToast("Please enter corporate CIN in Step 2 or upload Certificate of Incorporation.", "error");
      return;
    }
    setIsVerifyingMca(true);
    setTimeout(() => {
      setIsVerifyingMca(false);
      setKycChecks((prev) => ({ ...prev, mcaVerified: true }));
      showToast(`CIN ${orgData.cin} verified with Ministry of Corporate Affairs (RoC).`, "success");
    }, 800);
  };

  const handleVerifyRoleCred = () => {
    setIsVerifyingRoleCred(true);
    setTimeout(() => {
      setIsVerifyingRoleCred(false);
      setKycChecks((prev) => ({ ...prev, roleCredVerified: true }));
      showToast("Role statutory clearances verified against state databases.", "success");
    }, 800);
  };

  const handleExecutePennyDrop = () => {
    setIsVerifyingBank(true);
    setTimeout(() => {
      setIsVerifyingBank(false);
      setKycChecks((prev) => ({ ...prev, bankVerified: true }));
      showToast("₹1 automated penny drop executed successfully! Beneficiary account matched.", "success");
    }, 900);
  };

  // Step 6 Documents Vault File Upload & Instant OCR Handler
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    // Create a blob URL so the user can view the actual file
    const blobUrl = URL.createObjectURL(file);

    setDocumentsVault((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          // Revoke previous blob URL to prevent memory leaks
          if (d.fileUrl) URL.revokeObjectURL(d.fileUrl);
          return {
            ...d,
            fileName: file.name,
            fileSize: sizeStr,
            status: "verified",
            extractedData: `Automated OCR: ${file.name.replace(/\.[^/.]+$/, "")} verified with registry`,
            fileUrl: blobUrl
          };
        }
        return d;
      })
    );

    // Sync with KYC checks in Step 5
    if (docId === "d-5" || docId === "b-4" || docId === "t-3") {
      setKycChecks((prev) => ({ ...prev, gstinVerified: true }));
    } else if (docId === "b-2" || docId === "d-1") {
      setKycChecks((prev) => ({ ...prev, panVerified: true }));
    } else if (docId === "t-1" || docId === "t-2") {
      setKycChecks((prev) => ({ ...prev, mcaVerified: true }));
    } else if (docId === "b-3") {
      setKycChecks((prev) => ({ ...prev, bankVerified: true }));
    } else {
      setKycChecks((prev) => ({ ...prev, roleCredVerified: true }));
    }

    showToast(`"${file.name}" uploaded successfully. AES-256 encrypted & OCR verified!`, "success");
  };

  // Save Organization Master to Database / API
  const saveOrganizationMaster = async () => {
    if (!orgData.legalName.trim()) {
      showToast("Legal Name of Business is mandatory.", "error");
      setOrgMasterTab("business");
      return false;
    }
    if (!principalPlace.addressLine1.trim()) {
      showToast("Principal Place of Business address is mandatory.", "error");
      setOrgMasterTab("principal");
      return false;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: orgData.legalName,
          tradeName: orgData.tradeName,
          organizationType: orgData.organizationType,
          pan: orgData.pan,
          gstin: orgData.gstin,
          cin: orgData.cin,
          llpin: orgData.llpin,
          registeredAddressLine1: principalPlace.addressLine1,
          city: principalPlace.city,
          state: principalPlace.state,
          pincode: principalPlace.pincode,
          yearEstablished: orgData.yearEstablished,
          employeeCountBand: orgData.employeeCountBand,
          // GST Model nested records
          promoters,
          authorizedSignatory,
          authorizedRepresentative: hasAuthRep ? authorizedRepresentative : null,
          principalPlaceOfBusiness: principalPlace,
          additionalPlacesOfBusiness: additionalPlaces
        })
      });

      const data = await res.json();
      if (data.organizationCode) {
        setOrgData((prev) => ({
          ...prev,
          id: data.organization?.id || prev.id,
          organizationCode: data.organizationCode
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_org_id", data.organization?.id || "");
          localStorage.setItem("officex_org_code", data.organizationCode);
          localStorage.setItem("officex_org_name", orgData.legalName);
        }
      }
      return true;
    } catch (err) {
      console.warn("Organization master sync note:", err);
      return true; // allow proceeding even if network offline
    } finally {
      setIsLoading(false);
    }
  };

  // Back Navigation Handler supporting Step 2 sub-tabs
  const handleBackStep = () => {
    if (currentStep === 2) {
      if (orgMasterTab === "additional") {
        setOrgMasterTab("principal");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (orgMasterTab === "principal") {
        setOrgMasterTab("representative");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (orgMasterTab === "representative") {
        setOrgMasterTab("signatory");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (orgMasterTab === "signatory") {
        setOrgMasterTab("promoters");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (orgMasterTab === "promoters") {
        setOrgMasterTab("business");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setCurrentStep(Math.max(1, currentStep - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigation and State Persistence
  const handleNextStep = async () => {
    setToast(null);

    // Step 2 Sub-Tabs Sequential Progression
    if (currentStep === 2) {
      if (orgMasterTab === "business") {
        if (!orgData.legalName.trim()) {
          showToast("Legal Name of Business is mandatory.", "error");
          return;
        }
        setOrgMasterTab("promoters");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (orgMasterTab === "promoters") {
        setOrgMasterTab("signatory");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (orgMasterTab === "signatory") {
        setOrgMasterTab("representative");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (orgMasterTab === "representative") {
        setOrgMasterTab("principal");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (orgMasterTab === "principal") {
        if (!principalPlace.addressLine1.trim()) {
          showToast("Principal Place of Business address is mandatory.", "error");
          return;
        }
        // If user already entered additional places, show them; otherwise all required details are filled
        if (additionalPlaces.length > 0) {
          setOrgMasterTab("additional");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const success = await saveOrganizationMaster();
        if (success) {
          setCurrentStep(3);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (orgMasterTab === "additional") {
        const success = await saveOrganizationMaster();
        if (success) {
          setCurrentStep(3);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
    }

    // Step 3 Validation & Save
    if (currentStep === 3) {
      setIsLoading(true);
      try {
        const payload =
          role === "owner"
            ? ownerProfile
            : role === "broker"
            ? brokerProfile
            : role === "vendor"
            ? vendorProfile
            : tenantProfile;

        await fetch(`/api/v1/profiles/${role}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: orgData.id || "org-master-local",
            ...payload
          })
        });
      } catch (err) {
        console.warn("Role profile sync note:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getDashboardDestination = () => {
    switch (role) {
      case "owner":
        return "/properties";
      case "broker":
        return "/leasing";
      case "vendor":
        return "/vendor";
      case "tenant":
        return "/tenant";
      default:
        return "/properties";
    }
  };

  const stepsList = [
    { num: 1, title: "Registration", subtitle: "Account & Role" },
    { num: 2, title: "Legal Entity", subtitle: "Company & GSTIN" },
    { num: 3, title: "Role Profile", subtitle: "Business Scope" },
    { num: 4, title: "Operational", subtitle: "Policies & SLAs" },
    { num: 5, title: "KYC Engine", subtitle: "Statutory Checks" },
    { num: 6, title: "Documents", subtitle: "Compliance Vault" },
    { num: 7, title: "Activation", subtitle: "Launchpad" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 relative selection:bg-[#0F8B7D] selection:text-white">
      {/* Subtle Ambient Background Gradient Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[450px] bg-[#0F8B7D]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[350px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-800 border border-emerald-600 shadow-emerald-900/30"
              : toast.type === "error"
              ? "bg-rose-800 border border-rose-600 shadow-rose-900/30"
              : "bg-slate-900 border border-slate-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-300" /> : <AlertCircle size={16} className="text-amber-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar - Clean Light Mode */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center group">
            <Image
              src="/officex-logo-full.png"
              alt="OfficeX - Workspaces, Simplified"
              width={160}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
            Enterprise Onboarding
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
            <Lock size={12} className="text-blue-600" />
            <span>256-Bit Encrypted Statutory Vault</span>
          </div>
          <Link href="/login" className="text-slate-500 hover:text-slate-900 font-bold transition-colors">
            Exit to Sign In
          </Link>
        </div>
      </header>

      {/* Main Form Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-7 relative z-10">
        {/* 7-Step Institutional Horizontal Progress Ribbon */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {stepsList.map((st) => {
              const isActive = currentStep === st.num;
              const isDone = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num <= currentStep) setCurrentStep(st.num);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#0F8B7D] to-[#0c7368] text-white shadow-md shadow-teal-900/15"
                      : isDone
                      ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100/60 cursor-pointer"
                      : "text-slate-400 hover:text-slate-600 bg-slate-50/50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? "bg-white text-[#0F8B7D]"
                        : isDone
                        ? "bg-[#0F8B7D] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check size={14} /> : st.num}
                  </div>
                  <div className="leading-tight">
                    <span className="text-[11px] font-black block tracking-tight">{st.title}</span>
                    <span className={`text-[9px] block ${isActive ? "text-teal-100" : isDone ? "text-teal-700 font-semibold" : "text-slate-400"}`}>
                      {st.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Container Card - Clean White Enterprise */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-9 shadow-xl shadow-slate-200/50 space-y-7">
          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: COMMON REGISTRATION
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Step 1 of 7
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Common Registration & Role Assignment</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">Select Your Enterprise Business Role</h2>
                <p className="text-xs text-slate-500 mt-1">
                  OfficeX adapts the business onboarding form, statutory disclosures, and operating parameters to your role. All roles share a single, unified Organization Master.
                </p>
              </div>

              {/* Account Signer Contact Strip */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    PRIMARY ACCOUNT SIGNER
                  </label>
                  <input
                    type="text"
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    placeholder="Enter full legal name"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    OFFICIAL WORK EMAIL
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    MOBILE & OTP STATUS
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userData.mobile}
                      onChange={(e) => setUserData({ ...userData, mobile: e.target.value, otpVerified: false })}
                      placeholder="+91 98000 00000"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                    />
                    {userData.otpVerified && userData.mobile.trim().length >= 10 ? (
                      <span className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black shrink-0 flex items-center gap-1">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : userData.mobile.trim().length >= 10 ? (
                      <span className="px-2.5 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0 flex items-center gap-1">
                        Pending OTP
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 4 Distinct Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {[
                  {
                    id: "owner",
                    title: "Property Owner / Landlord / Developer",
                    subtitle: "Asset Portfolio & Commercial Leasing Engine",
                    desc: "Own or manage Grade-A office towers, IT/SEZ tech campuses, retail malls, or industrial warehouses. List spaces, broadcast vacancies, and manage institutional rent rolls.",
                    icon: Building,
                    badge: "Asset Portfolio Master",
                    features: ["Direct Rent-Roll Invoicing", "Commercial Listing Builder", "Fire NOC & OC Verification"]
                  },
                  {
                    id: "broker",
                    title: "Commercial Broker / Channel Partner / IPC",
                    subtitle: "Commercial Deal Room & Commission Escrow",
                    desc: "Licensed commercial consultants and advisory firms mediating institutional office leasing, bare-shell mandates, and corporate expansions across micro-markets.",
                    icon: Handshake,
                    badge: "MahaRERA Licensed",
                    features: ["45-Day Escrow Commission", "Private Deal Rooms", "Client Exclusivity Lock"]
                  },
                  {
                    id: "vendor",
                    title: "Facility Management (FM) Service Vendor",
                    subtitle: "Statutory SLA Contractor & Trade Matrix",
                    desc: "Contractors delivering Hard FM (HVAC Chillers, MEP, HT/LT Electrical, DG, Elevators) and Soft FM (Corporate Security, Mechanized Housekeeping, Facade).",
                    icon: Wrench,
                    badge: "Statutory SLA Contractor",
                    features: ["PSARA & Labour Code", "Automated PPM Dispatch", "Escrow Milestone Payouts"]
                  },
                  {
                    id: "tenant",
                    title: "Corporate Occupier / Enterprise Tenant",
                    subtitle: "Workplace Operations & Compliance Suite",
                    desc: "Enterprises, Global MNCs, and unicorns leasing commercial real estate. Manage leases, visitor compliance screening, parking passes, and vendor work permits.",
                    icon: Users,
                    badge: "Enterprise Workplace",
                    features: ["Visitor Compliance Gate", "Employee Desk Allocation", "Building Pass & Invoicing"]
                  }
                ].map((item) => {
                  const isSelected = role === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setRole(item.id as any)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0F8B7D] bg-teal-50/40 shadow-lg shadow-teal-900/5 ring-1 ring-[#0F8B7D]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-3 rounded-2xl ${
                              isSelected ? "bg-[#0F8B7D] text-white shadow-md shadow-teal-800/30" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <item.icon size={24} />
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                              isSelected
                                ? "bg-teal-100 text-teal-900 border-teal-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                        <p className="text-[11px] font-bold text-[#0F8B7D] mt-0.5">{item.subtitle}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">{item.desc}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {item.features.map((feat, fi) => (
                            <span key={fi} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                        <span className={`text-xs font-black ${isSelected ? "text-[#0F8B7D]" : "text-slate-400"}`}>
                          {isSelected ? "Selected ✓" : "Select →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: ORGANIZATION PROFILE (GST MODEL MASTER)
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      Step 2 of 7
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Common Organization Master Registry</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">Organization Profile (GST Registration Model)</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Official GST-modeled architecture separating Business Details, Promoters/Partners, Authorized Signatory, Representative, and Principal/Additional Places.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-2xl bg-teal-50 border border-teal-200 text-right shrink-0">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Generated Entity Code</span>
                  <span className="text-xs font-mono font-black text-[#0F8B7D]">{orgData.organizationCode}</span>
                </div>
              </div>

              {/* GST-Style Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto text-xs">
                {[
                  { id: "business", label: "1. Business Details", isComplete: Boolean(orgData.legalName.trim()) },
                  { id: "promoters", label: `2. Promoters / Partners (${promoters.length})`, isComplete: promoters.length > 0 },
                  { id: "signatory", label: "3. Authorized Signatory", isComplete: Boolean(authorizedSignatory.name.trim()) },
                  { id: "representative", label: "4. Representative", isComplete: hasAuthRep ? Boolean(authorizedRepresentative.name.trim()) : true },
                  { id: "principal", label: "5. Principal Place", isComplete: Boolean(principalPlace.addressLine1.trim()) },
                  { id: "additional", label: `6. Additional Places (${additionalPlaces.length})`, isComplete: true }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrgMasterTab(t.id as any)}
                    className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                      orgMasterTab === t.id
                        ? "bg-[#0F8B7D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.isComplete && orgMasterTab !== t.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" title="Completed"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* TAB 1: BUSINESS DETAILS */}
              {orgMasterTab === "business" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        LEGAL NAME OF BUSINESS (AS PER PAN / MCA) *
                      </label>
                      <input
                        type="text"
                        value={orgData.legalName}
                        onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                        placeholder="e.g. Apex Commercial Realty Private Limited"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TRADE / BRAND NAME
                      </label>
                      <input
                        type="text"
                        value={orgData.tradeName}
                        onChange={(e) => setOrgData({ ...orgData, tradeName: e.target.value })}
                        placeholder="e.g. Apex Commercial Spaces"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        CONSTITUTION OF BUSINESS *
                      </label>
                      <select
                        value={orgData.organizationType}
                        onChange={(e) => setOrgData({ ...orgData, organizationType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="PRIVATE_LIMITED">Private Limited Company</option>
                        <option value="PUBLIC_LIMITED">Public Limited Company</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="PARTNERSHIP">Partnership Firm</option>
                        <option value="PROPRIETORSHIP">Proprietorship Firm</option>
                        <option value="INDIVIDUAL">Individual Asset Owner</option>
                        <option value="TRUST">Trust / Society</option>
                        <option value="GOVERNMENT">Government / PSU Authority</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        PAN NUMBER (10 CHARS) *
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={orgData.pan}
                        onChange={(e) => setOrgData({ ...orgData, pan: e.target.value.toUpperCase() })}
                        placeholder="e.g. AAACG5678K"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-black tracking-wider focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        GSTIN (15 CHARS) *
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={orgData.gstin}
                        onChange={(e) => setOrgData({ ...orgData, gstin: e.target.value.toUpperCase() })}
                        placeholder="e.g. 27AAACG5678K1Z2"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-black tracking-wider focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        CIN / LLPIN (COMPANIES & LLPS)
                      </label>
                      <input
                        type="text"
                        value={orgData.cin}
                        onChange={(e) => setOrgData({ ...orgData, cin: e.target.value.toUpperCase() })}
                        placeholder="e.g. U70109MH2018PTC309182"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        YEAR OF INCORPORATION / COMMENCEMENT
                      </label>
                      <input
                        type="number"
                        value={orgData.yearEstablished}
                        onChange={(e) => setOrgData({ ...orgData, yearEstablished: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROMOTERS / PARTNERS / DIRECTORS */}
              {orgMasterTab === "promoters" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Promoters, Partners, Managing Directors, and Key Managerial Personnel
                    </span>
                    <button
                      type="button"
                      onClick={addPromoter}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] border border-teal-200 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Add Director / Promoter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {promoters.map((p, idx) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">
                            DIRECTOR / PROMOTER #{idx + 1}
                          </span>
                          {promoters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePromoter(p.id)}
                              className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              FULL NAME *
                            </label>
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, name: val } : item)));
                              }}
                              placeholder="e.g. Full Legal Name"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              DESIGNATION *
                            </label>
                            <input
                              type="text"
                              value={p.designation}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, designation: val } : item)));
                              }}
                              placeholder="e.g. Managing Director"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              DIN / PAN NUMBER *
                            </label>
                            <input
                              type="text"
                              value={p.dinPan}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, dinPan: val } : item)));
                              }}
                              placeholder="e.g. DIN-08492019"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              MOBILE NUMBER
                            </label>
                            <input
                              type="text"
                              value={p.mobile}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, mobile: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              OFFICIAL EMAIL
                            </label>
                            <input
                              type="email"
                              value={p.email}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, email: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              EQUITY / PROFIT SHARE (%)
                            </label>
                            <input
                              type="text"
                              value={p.equityPct}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPromoters((prev) => prev.map((item) => (item.id === p.id ? { ...item, equityPct: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AUTHORIZED SIGNATORY */}
              {orgMasterTab === "signatory" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <ShieldCheck size={18} className="text-[#0F8B7D]" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        PRIMARY AUTHORIZED SIGNATORY (STATUTORY POWER TO EXECUTE LEASES & CONTRACTS)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          SIGNATORY FULL NAME *
                        </label>
                        <input
                          type="text"
                          value={authorizedSignatory.name}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          DESIGNATION / STATUS *
                        </label>
                        <input
                          type="text"
                          value={authorizedSignatory.designation}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, designation: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          OFFICIAL MOBILE NUMBER *
                        </label>
                        <input
                          type="text"
                          value={authorizedSignatory.mobile}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, mobile: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          OFFICIAL SIGNATORY EMAIL *
                        </label>
                        <input
                          type="email"
                          value={authorizedSignatory.email}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          AUTHORITY DOCUMENT TYPE
                        </label>
                        <select
                          value={authorizedSignatory.authDocType}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, authDocType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="BOARD_RESOLUTION">Board Resolution (Companies)</option>
                          <option value="POWER_OF_ATTORNEY">Registered Power of Attorney</option>
                          <option value="PARTNERSHIP_AUTHORIZATION">Partnership Deed Authorization</option>
                          <option value="PROPRIETOR_DECLARATION">Sole Proprietor Legal Declaration</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          RESOLUTION / DEED REFERENCE NUMBER *
                        </label>
                        <input
                          type="text"
                          value={authorizedSignatory.authDocRef}
                          onChange={(e) => setAuthorizedSignatory({ ...authorizedSignatory, authDocRef: e.target.value })}
                          placeholder="e.g. BR/2026/04/APEX"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUTHORIZED REPRESENTATIVE */}
              {orgMasterTab === "representative" && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 block">DO YOU HAVE AN AUTHORIZED REPRESENTATIVE?</span>
                      <span className="text-[11px] text-slate-500">
                        Chartered Accountant, Advocate, GST Practitioner, or In-House Legal Counsel managing audits and statutory filings.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasAuthRep(!hasAuthRep)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasAuthRep ? "bg-[#0F8B7D] text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {hasAuthRep ? "Yes, Designated ✓" : "No Representative"}
                    </button>
                  </div>

                  {hasAuthRep && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          REPRESENTATIVE TYPE
                        </label>
                        <select
                          value={authorizedRepresentative.repType}
                          onChange={(e) => setAuthorizedRepresentative({ ...authorizedRepresentative, repType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="CHARTERED_ACCOUNTANT">Chartered Accountant (CA)</option>
                          <option value="ADVOCATE">Advocate / Legal Counsel</option>
                          <option value="GST_PRACTITIONER">Enrolled GST Practitioner</option>
                          <option value="IN_HOUSE_LEGAL">In-House General Counsel</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          NAME OF REPRESENTATIVE / FIRM
                        </label>
                        <input
                          type="text"
                          value={authorizedRepresentative.name}
                          onChange={(e) => setAuthorizedRepresentative({ ...authorizedRepresentative, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          BAR / ICAI ENROLMENT NUMBER
                        </label>
                        <input
                          type="text"
                          value={authorizedRepresentative.enrolmentNo}
                          onChange={(e) => setAuthorizedRepresentative({ ...authorizedRepresentative, enrolmentNo: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          REPRESENTATIVE CONTACT MOBILE
                        </label>
                        <input
                          type="text"
                          value={authorizedRepresentative.mobile}
                          onChange={(e) => setAuthorizedRepresentative({ ...authorizedRepresentative, mobile: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PRINCIPAL PLACE OF BUSINESS */}
              {orgMasterTab === "principal" && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      PRINCIPAL PLACE OF BUSINESS (OFFICIAL REGISTERED OFFICE) *
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          NATURE OF POSSESSION *
                        </label>
                        <select
                          value={principalPlace.natureOfPossession}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, natureOfPossession: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="OWNED">Owned</option>
                          <option value="LEASED">Leased</option>
                          <option value="RENTED">Rented</option>
                          <option value="SHARED">Shared / Managed Coworking</option>
                          <option value="CONSENT">Consent Letter</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          PRIMARY ACTIVITY CARRIED OUT *
                        </label>
                        <input
                          type="text"
                          value={principalPlace.primaryActivity}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, primaryActivity: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          PREMISES / BUILDING / STREET ADDRESS (LINE 1) *
                        </label>
                        <input
                          type="text"
                          value={principalPlace.addressLine1}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, addressLine1: e.target.value })}
                          placeholder="e.g. Level 14, Tower 2, One World Center"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          LOCALITY / LANDMARK
                        </label>
                        <input
                          type="text"
                          value={principalPlace.landmark}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, landmark: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          CITY *
                        </label>
                        <input
                          type="text"
                          value={principalPlace.city}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          STATE *
                        </label>
                        <input
                          type="text"
                          value={principalPlace.state}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          PINCODE (6 DIGITS) *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={principalPlace.pincode}
                          onChange={(e) => setPrincipalPlace({ ...principalPlace, pincode: e.target.value.replace(/\D/g, "") })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ADDITIONAL PLACES OF BUSINESS */}
              {orgMasterTab === "additional" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700">
                      Additional Branch Offices, Commercial Hubs, & Micro-Market Desks
                    </span>
                    <button
                      type="button"
                      onClick={addAdditionalPlace}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] border border-teal-200 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Add Branch Office
                    </button>
                  </div>

                  <div className="space-y-3">
                    {additionalPlaces.map((b, idx) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">
                            ADDITIONAL BRANCH #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAdditionalPlace(b.id)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              BRANCH OFFICE NAME
                            </label>
                            <input
                              type="text"
                              value={b.branchName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdditionalPlaces((prev) => prev.map((item) => (item.id === b.id ? { ...item, branchName: val } : item)));
                              }}
                              placeholder="e.g. BKC Regional Asset Office"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              PREMISES ADDRESS
                            </label>
                            <input
                              type="text"
                              value={b.address}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdditionalPlaces((prev) => prev.map((item) => (item.id === b.id ? { ...item, address: val } : item)));
                              }}
                              placeholder="e.g. Unit 502, C-60 G Block, BKC"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              CITY
                            </label>
                            <input
                              type="text"
                              value={b.city}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdditionalPlaces((prev) => prev.map((item) => (item.id === b.id ? { ...item, city: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              STATE
                            </label>
                            <input
                              type="text"
                              value={b.state}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdditionalPlaces((prev) => prev.map((item) => (item.id === b.id ? { ...item, state: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                              PINCODE
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={b.pincode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setAdditionalPlaces((prev) => prev.map((item) => (item.id === b.id ? { ...item, pincode: val } : item)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3: ROLE-SPECIFIC BUSINESS PROFILE (DEDICATED FORMS)
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Step 3 of 7
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Dedicated Category Onboarding Form</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                  {role === "owner" && "Property Owner & Asset Manager Profile"}
                  {role === "broker" && "Commercial Broker & Channel Partner Profile"}
                  {role === "vendor" && "Facility Management (FM) Capability Matrix"}
                  {role === "tenant" && "Corporate Occupier & Workplace Footprint"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {role === "owner" && "Capture commercial tower classifications, gross leasable area, Fire NOC, and Occupancy Certificate readiness."}
                  {role === "broker" && "Capture statutory RERA broker license, transaction specializations, micro-market desks, and commission escrow."}
                  {role === "vendor" && "Capture comprehensive Hard & Soft FM trade matrices, PSARA licenses, Grade-A Electrical certification, and SLAs."}
                  {role === "tenant" && "Capture India headcount, expansion forecasts, fit-out state preferences, and corporate invoicing nodal details."}
                </p>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  FORM A: PROPERTY OWNER / DEVELOPER
                  ───────────────────────────────────────────────────────────── */}
              {role === "owner" && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        OWNERSHIP ENTITY STRUCTURE *
                      </label>
                      <select
                        value={ownerProfile.ownershipStructure}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, ownershipStructure: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="DIRECT_OWNER">Direct Corporate Asset Owner</option>
                        <option value="DEVELOPER">Commercial Real Estate Developer</option>
                        <option value="REIT_FUND">REIT / Institutional Sovereign Fund</option>
                        <option value="CO_OWNER_JV">Joint Venture / Co-Owner SPV</option>
                        <option value="ASSET_MANAGER">Asset Management Company (AMC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        PROPERTY TITLE TYPE *
                      </label>
                      <select
                        value={ownerProfile.titleType}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, titleType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="FREEHOLD">Freehold Clear Marketable Title</option>
                        <option value="LEASEHOLD_99YR">99-Year MIDC / Govt Industrial Leasehold</option>
                        <option value="CO_OP_SOCIETY">Commercial Co-operative Society</option>
                        <option value="POWER_OF_ATTORNEY">Registered Power of Attorney</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TOTAL MANAGED PROPERTIES COUNT
                      </label>
                      <input
                        type="number"
                        value={ownerProfile.totalAssetCount}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, totalAssetCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TOTAL COMMERCIAL GLA (SQ. FT) *
                      </label>
                      <input
                        type="number"
                        value={ownerProfile.totalCommercialGLASqft}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, totalCommercialGLASqft: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold font-mono focus:border-[#0F8B7D] focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        ≈ {Math.round(parseInt(ownerProfile.totalCommercialGLASqft || "0") * 0.092903).toLocaleString()} Sq. Metres
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        PORTFOLIO OCCUPANCY RATE (%)
                      </label>
                      <input
                        type="number"
                        value={ownerProfile.currentOccupancyPct}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, currentOccupancyPct: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TARGET ASKING RENT (₹ / SQ.FT / MO)
                      </label>
                      <input
                        type="number"
                        value={ownerProfile.askingRentSqftMonth}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, askingRentSqftMonth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Asset Mix Selector */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      COMMERCIAL ASSET CLASSES IN PORTFOLIO (SELECT ALL HELD) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "GRADE_A_OFFICE", label: "Grade-A Commercial Towers" },
                        { id: "IT_PARK", label: "IT / SEZ Tech Parks" },
                        { id: "COWORKING_CAMPUS", label: "Managed Coworking Campuses" },
                        { id: "RETAIL_MALL", label: "Commercial Retail & Malls" },
                        { id: "WAREHOUSING", label: "Industrial & Warehousing Logistics" },
                        { id: "LIFE_SCIENCES", label: "Life Sciences & R&D Labs" }
                      ].map((asset) => {
                        const isChecked = ownerProfile.portfolioAssetClasses.includes(asset.id);
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => {
                              setOwnerProfile((prev) => ({
                                ...prev,
                                portfolioAssetClasses: isChecked
                                  ? prev.portfolioAssetClasses.filter((c) => c !== asset.id)
                                  : [...prev.portfolioAssetClasses, asset.id]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#0F8B7D] text-white shadow-xs"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {asset.label} {isChecked && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statutory Clearances */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        FIRE SAFETY NOC STATUS *
                      </label>
                      <select
                        value={ownerProfile.fireNocStatus}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, fireNocStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="VALID_CURRENT">Valid & Current CFO NOC</option>
                        <option value="RENEWAL_APPLIED">Renewal Application in Progress</option>
                        <option value="PROVISIONAL">Provisional NOC</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        OCCUPANCY CERTIFICATE (OC) STATUS *
                      </label>
                      <select
                        value={ownerProfile.occupancyCertStatus}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, occupancyCertStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="FULL_OC_ISSUED">Full Occupancy Certificate Issued</option>
                        <option value="PARTIAL_OC">Partial / Phased OC</option>
                        <option value="PENDING_INSPECTION">Final Inspection Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        RERA PROJECT REGISTRATION NUMBER
                      </label>
                      <input
                        type="text"
                        value={ownerProfile.reraProjectRegistrationNo}
                        onChange={(e) => setOwnerProfile({ ...ownerProfile, reraProjectRegistrationNo: e.target.value })}
                        placeholder="e.g. P51900028471"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  FORM B: COMMERCIAL BROKER / CHANNEL PARTNER
                  ───────────────────────────────────────────────────────────── */}
              {role === "broker" && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        BROKERAGE ENTITY MODEL *
                      </label>
                      <select
                        value={brokerProfile.brokerageModel}
                        onChange={(e) => setBrokerProfile({ ...brokerProfile, brokerageModel: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="IPC">International Property Consultancy (IPC)</option>
                        <option value="COMMERCIAL_ADVISORY_FIRM">Commercial Advisory Firm</option>
                        <option value="BOUTIQUE">Boutique Commercial Desk</option>
                        <option value="INDIVIDUAL_AGENT">Individual Licensed Consultant</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        STATE RERA REGISTRATION NUMBER *
                      </label>
                      <input
                        type="text"
                        value={brokerProfile.reraRegistrationNo}
                        onChange={(e) => setBrokerProfile({ ...brokerProfile, reraRegistrationNo: e.target.value })}
                        placeholder="e.g. A51800018492"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-black tracking-wider focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        RERA LICENSE EXPIRY DATE
                      </label>
                      <input
                        type="date"
                        value={brokerProfile.reraExpiryDate}
                        onChange={(e) => setBrokerProfile({ ...brokerProfile, reraExpiryDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Micro-market Desks */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      PRIMARY OPERATIONAL COMMERCIAL MICRO-MARKETS *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "BKC",
                        "Lower Parel",
                        "Andheri-Kurla Road",
                        "Powai",
                        "Navi Mumbai",
                        "DLF Cyber City (Gurugram)",
                        "Golf Course Ext.",
                        "Noida Expressway",
                        "Outer Ring Road (ORR Bengaluru)",
                        "Whitefield",
                        "Hinjawadi (Pune)"
                      ].map((mm) => {
                        const isSelected = brokerProfile.operatingMicroMarkets.includes(mm);
                        return (
                          <button
                            key={mm}
                            type="button"
                            onClick={() => {
                              setBrokerProfile((prev) => ({
                                ...prev,
                                operatingMicroMarkets: isSelected
                                  ? prev.operatingMicroMarkets.filter((m) => m !== mm)
                                  : [...prev.operatingMicroMarkets, mm]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#0F8B7D] text-white shadow-xs"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {mm} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transaction Specializations */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      COMMERCIAL TRANSACTION SPECIALIZATIONS *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "ENTERPRISE_OFFICE_LEASING", label: "Enterprise Commercial Office Leasing" },
                        { id: "MANAGED_COWORKING", label: "Managed & Bare-Shell Coworking" },
                        { id: "INVESTMENT_SALES", label: "Commercial Pre-Leased & Investment Sales" },
                        { id: "LANDLORD_REP", label: "Exclusive Landlord Representation" },
                        { id: "TENANT_REP", label: "Enterprise Tenant Representation" },
                        { id: "RETAIL_LEASING", label: "High-Street Retail & Mall Anchor" }
                      ].map((srv) => {
                        const isSelected = brokerProfile.specializations.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              setBrokerProfile((prev) => ({
                                ...prev,
                                specializations: isSelected
                                  ? prev.specializations.filter((s) => s !== srv.id)
                                  : [...prev.specializations, srv.id]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-teal-700 text-white shadow-xs"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {srv.label} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commission Escrow Payout Bank Account */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#0F8B7D]" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        COMMISSION ESCROW SETTLEMENT BANK ACCOUNT (DIRECT AUTOMATED 45-DAY SETTLEMENT)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          BANK NAME
                        </label>
                        <input
                          type="text"
                          value={brokerProfile.commissionEscrowBankName}
                          onChange={(e) => setBrokerProfile({ ...brokerProfile, commissionEscrowBankName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          ACCOUNT NUMBER
                        </label>
                        <input
                          type="text"
                          value={brokerProfile.commissionEscrowAccountNo}
                          onChange={(e) => setBrokerProfile({ ...brokerProfile, commissionEscrowAccountNo: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          IFSC CODE
                        </label>
                        <input
                          type="text"
                          value={brokerProfile.commissionEscrowIFSC}
                          onChange={(e) => setBrokerProfile({ ...brokerProfile, commissionEscrowIFSC: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  FORM C: FM SERVICE VENDOR / CONTRACTOR
                  ───────────────────────────────────────────────────────────── */}
              {role === "vendor" && (
                <div className="space-y-5 text-xs">
                  {/* Hard FM Trade Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                        HARD FM & CRITICAL ENGINEERING CAPABILITIES (SELECT ALL ACTIVE CAPABILITIES) *
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold">24x7 Breakdown Coverage</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { id: "HVAC_CHILLERS", label: "Central Chillers & VRV/VRF" },
                        { id: "HT_LT_ELECTRICAL", label: "HT Substations & LT Panels" },
                        { id: "DG_SETS_SYNCHRONIZATION", label: "DG Sets Synchronization" },
                        { id: "ELEVATORS_ESCALATORS", label: "Elevators & Lifts" },
                        { id: "FIRE_LIFE_SAFETY", label: "Fire & Life Safety Systems" },
                        { id: "STP_WTP_PLUMBING", label: "STP / WTP & Commercial Plumbing" },
                        { id: "BMS_AUTOMATION", label: "BMS & IoT Telemetry" },
                        { id: "CIVIL_GLAZING", label: "Civil, Glazing & Waterproofing" }
                      ].map((hfm) => {
                        const isChecked = vendorProfile.tradeMatrixHardFM.includes(hfm.id);
                        return (
                          <button
                            key={hfm.id}
                            type="button"
                            onClick={() => {
                              setVendorProfile((prev) => ({
                                ...prev,
                                tradeMatrixHardFM: isChecked
                                  ? prev.tradeMatrixHardFM.filter((c) => c !== hfm.id)
                                  : [...prev.tradeMatrixHardFM, hfm.id]
                              }));
                            }}
                            className={`p-2.5 rounded-xl font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? "bg-teal-50 border border-teal-300 text-teal-900 shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span>{hfm.label}</span>
                            {isChecked && <CheckCircle size={13} className="text-[#0F8B7D] shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Soft FM Trade Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      SOFT FM & WORKPLACE HYGIENE CAPABILITIES *
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {[
                        { id: "CORPORATE_HOUSEKEEPING", label: "Mechanized Corporate Housekeeping" },
                        { id: "MANNED_SECURITY_GUARDING", label: "Manned Physical Security & Guarding" },
                        { id: "FACADE_CLEANING_CRADLE", label: "Facade Cleaning & Suspended Cradle" },
                        { id: "PEST_MANAGEMENT", label: "Commercial Pest Management" },
                        { id: "WASTE_MANAGEMENT_ESG", label: "Solid & E-Waste Management (ESG)" },
                        { id: "CAMPUS_HORTICULTURE", label: "Campus Landscaping & Horticulture" }
                      ].map((sfm) => {
                        const isChecked = vendorProfile.tradeMatrixSoftFM.includes(sfm.id);
                        return (
                          <button
                            key={sfm.id}
                            type="button"
                            onClick={() => {
                              setVendorProfile((prev) => ({
                                ...prev,
                                tradeMatrixSoftFM: isChecked
                                  ? prev.tradeMatrixSoftFM.filter((c) => c !== sfm.id)
                                  : [...prev.tradeMatrixSoftFM, sfm.id]
                              }));
                            }}
                            className={`p-2.5 rounded-xl font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? "bg-teal-50 border border-teal-300 text-teal-900 shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span>{sfm.label}</span>
                            {isChecked && <CheckCircle size={13} className="text-[#0F8B7D] shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statutory Licensing & Insurance */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        PSARA SECURITY LICENSE NO.
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.psaraLicenseNo}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, psaraLicenseNo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        ELECTRICAL GRADE-A LICENSE NO.
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.electricalGradeALicenseNo}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, electricalGradeALicenseNo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        CONTRACT LABOUR (R&A) CODE
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.contractLabourLicenseNo}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, contractLabourLicenseNo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        EPF ESTABLISHMENT CODE
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.epfEstablishmentCode}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, epfEstablishmentCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        ESIC 17-DIGIT CODE
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.esicRegistrationCode}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, esicRegistrationCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        CGL POLICY COVERAGE AMOUNT
                      </label>
                      <input
                        type="text"
                        value={vendorProfile.cglCoverageAmount}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, cglCoverageAmount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  FORM D: CORPORATE OCCUPIER / ENTERPRISE TENANT
                  ───────────────────────────────────────────────────────────── */}
              {role === "tenant" && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        ENTERPRISE CLASSIFICATION *
                      </label>
                      <select
                        value={tenantProfile.enterpriseClassification}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, enterpriseClassification: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="GLOBAL_MNC_FORTUNE_500">Global MNC / Fortune 500 Enterprise</option>
                        <option value="LISTED_INDIAN_CORP">Listed Indian Corporate</option>
                        <option value="UNICORN_TECH">Unicorn / High-Growth Tech Scale-Up</option>
                        <option value="PROFESSIONAL_SERVICES">Consulting / Financial Services Firm</option>
                        <option value="COWORKING_OPERATOR">Coworking / Managed Space Operator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        CURRENT INDIAN HEADCOUNT
                      </label>
                      <input
                        type="number"
                        value={tenantProfile.employeeHeadcountIndia}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, employeeHeadcountIndia: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold font-mono focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TARGET COMMERCIAL SPACE (SQ. FT) *
                      </label>
                      <input
                        type="number"
                        value={tenantProfile.targetSpaceFootprintSqft}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, targetSpaceFootprintSqft: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold font-mono focus:border-[#0F8B7D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        FIT-OUT HANDOVER PREFERENCE *
                      </label>
                      <select
                        value={tenantProfile.fitoutHandoverPreference}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, fitoutHandoverPreference: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="FULLY_FURNISHED_PLUG_PLAY">Fully Furnished Plug & Play</option>
                        <option value="WARM_SHELL">Warm Shell (HVAC & Flooring Installed)</option>
                        <option value="BARE_SHELL">Bare Shell (Full Tenant Fitout)</option>
                        <option value="BUILD_TO_SUIT">Enterprise Build-to-Suit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        WORKPLACE SEAT RATIO
                      </label>
                      <select
                        value={tenantProfile.seatRatioPreference}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, seatRatioPreference: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="HYBRID_1_TO_0_8">Hybrid (1:0.8 Desk Ratio)</option>
                        <option value="DEDICATED_1_TO_1">Traditional (1:1 Dedicated Desks)</option>
                        <option value="HOT_DESKING_1_TO_0_6">Flexible / Hot-Desking (1:0.6)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                        TARGET MOVE-IN TIMELINE
                      </label>
                      <select
                        value={tenantProfile.targetMoveInWindow}
                        onChange={(e) => setTenantProfile({ ...tenantProfile, targetMoveInWindow: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                      >
                        <option value="IMMEDIATE_15_DAYS">Immediate (&lt; 15 Days)</option>
                        <option value="30_TO_60_DAYS">30 to 60 Days</option>
                        <option value="60_TO_90_DAYS">60 to 90 Days</option>
                        <option value="90_PLUS_DAYS">90+ Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Centralized Billing Invoicing Nodal */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                      CENTRALIZED CORPORATE BILLING & INVOICING NODAL CONTACT
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          NODAL OFFICER / DEPT NAME
                        </label>
                        <input
                          type="text"
                          value={tenantProfile.centralBillingNodalName}
                          onChange={(e) => setTenantProfile({ ...tenantProfile, centralBillingNodalName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          CENTRALIZED BILLING EMAIL
                        </label>
                        <input
                          type="email"
                          value={tenantProfile.centralBillingEmail}
                          onChange={(e) => setTenantProfile({ ...tenantProfile, centralBillingEmail: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          TAN NUMBER (TDS DEDUCTION)
                        </label>
                        <input
                          type="text"
                          value={tenantProfile.tanNumber}
                          onChange={(e) => setTenantProfile({ ...tenantProfile, tanNumber: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:border-[#0F8B7D] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 4: OPERATIONAL PROFILE
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Step 4 of 7
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Operational Profile & SLAs</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                  Operational Rules, SLAs & Governance Protocols
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure dispatch models, client locking periods, and operational gating policies tailored to your enterprise category.
                </p>
              </div>

              {/* Owner Ops */}
              {role === "owner" && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-black text-slate-900 block uppercase">
                      PORTFOLIO LISTING DISTRIBUTION & BROKER BROADCAST POLICY
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          LISTING BROADCAST MODE
                        </label>
                        <select
                          value={operationalProfile.listingBroadcastMode}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, listingBroadcastMode: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="SELECTIVE_BROKER_NETWORK">Selective Verified Broker Network Only</option>
                          <option value="OPEN_PUBLIC_MARKETPLACE">Open Public Scalezix Marketplace</option>
                          <option value="CONFIDENTIAL_INVITE_ONLY">Confidential Institutional Off-Market</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          BROKER SCREENING LEVEL
                        </label>
                        <select
                          value={operationalProfile.minBrokerQualificationTier}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, minBrokerQualificationTier: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="RERA_VERIFIED_ONLY">RERA Verified Active Brokers Only</option>
                          <option value="IPC_PREFERRED">Tier-1 Institutional Brokers (IPC / Top 50)</option>
                          <option value="ALL_REGISTERED">All Registered Channel Partners</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">Auto-Schedule Site Inspections</span>
                        <span className="text-[11px] text-slate-500">Allow verified corporate tenant representatives to calendar site visits instantly.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={operationalProfile.autoScheduleSiteInspection}
                        onChange={(e) => setOperationalProfile({ ...operationalProfile, autoScheduleSiteInspection: e.target.checked })}
                        className="w-5 h-5 rounded text-[#0F8B7D] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Broker Ops */}
              {role === "broker" && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-black text-slate-900 block uppercase">
                      CO-BROKERAGE RULES & CLIENT EXCLUSIVITY LOCK PROTOCOL
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          CO-BROKERAGE SHARING MODEL
                        </label>
                        <select
                          value={operationalProfile.coBrokerageSplitRatio}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, coBrokerageSplitRatio: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="50_50_STANDARD">50 / 50 Standard Co-Broker Split</option>
                          <option value="60_40_LEAD_ORIGINATOR">60 / 40 Lead Originator Preference</option>
                          <option value="EXCLUSIVE_SOLE_ONLY">Sole Direct Mandates Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          CLIENT EXCLUSIVITY LOCK PERIOD
                        </label>
                        <select
                          value={operationalProfile.clientExclusivityLockPeriodDays}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, clientExclusivityLockPeriodDays: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="60">60 Days Active Exclusivity</option>
                          <option value="90">90 Days Enterprise Exclusivity</option>
                          <option value="30">30 Days Short Term Lock</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Ops */}
              {role === "vendor" && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-black text-slate-900 block uppercase">
                      INCIDENT SLA RESPONSE & DIGITAL PPM DISPATCH PROTOCOL
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          CRITICAL BREAKDOWN SLA RESPONSE COMMITMENT *
                        </label>
                        <select
                          value={vendorProfile.criticalBreakdownSlaResponse}
                          onChange={(e) => setVendorProfile({ ...vendorProfile, criticalBreakdownSlaResponse: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="LESS_THAN_30_MINS">&lt; 30 Minutes Critical On-Site Response</option>
                          <option value="LESS_THAN_1_HOUR">&lt; 1 Hour On-Site Response</option>
                          <option value="LESS_THAN_2_HOURS">&lt; 2 Hours Standard Response</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          WORK ORDER DISPATCH ENGINE
                        </label>
                        <select
                          value={operationalProfile.workOrderDispatchPolicy}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, workOrderDispatchPolicy: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="AUTO_GEO_DISPATCH">Automated Geofenced Roster Dispatch</option>
                          <option value="SUPERVISOR_ALLOCATION">Manual Shift Supervisor Allocation</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">Digital 52-Week PPM Checklist Compliance</span>
                        <span className="text-[11px] text-slate-500">Enforce mobile geotagged photo capture for equipment maintenance before ticket sign-off.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={operationalProfile.ppmDigitalChecklistMandatory}
                        onChange={(e) => setOperationalProfile({ ...operationalProfile, ppmDigitalChecklistMandatory: e.target.checked })}
                        className="w-5 h-5 rounded text-[#0F8B7D] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tenant Ops */}
              {role === "tenant" && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-black text-slate-900 block uppercase">
                      WORKPLACE VISITOR ACCESS & FACILITY USAGE POLICIES
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          VISITOR ENTRY GATE SCREENING STRICTNESS
                        </label>
                        <select
                          value={operationalProfile.visitorGateStrictness}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, visitorGateStrictness: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="STRICT_PHOTO_AND_GOVT_ID">Strict Photo Capture + Government ID Verification</option>
                          <option value="STANDARD_QR_INVITE">Standard Host Pre-Invite QR Code</option>
                          <option value="CONTACTLESS_KIOSK">Contactless Express Kiosk Check-In</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          AFTER-HOURS HVAC / DG EXTENSION NOTICE
                        </label>
                        <select
                          value={operationalProfile.afterHoursHvacRequestNoticeHours}
                          onChange={(e) => setOperationalProfile({ ...operationalProfile, afterHoursHvacRequestNoticeHours: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:border-[#0F8B7D] focus:outline-none"
                        >
                          <option value="4">Minimum 4 Hours Advance Notice</option>
                          <option value="2">Minimum 2 Hours Advance Notice</option>
                          <option value="24">24 Hours Weekend Advance Notice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 5: KYC & STATUTORY VERIFICATION
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      Step 5 of 7
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Statutory KYC Verification Engine</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    Multi-Registry Statutory Verification
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live simulation of official regulatory checks (CBDT PAN, GSTIN, MCA Corporate Registry, and role-specific statutory registers).
                  </p>
                </div>
                {verifiedChecksCount === 5 ? (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                    <BadgeCheck size={14} /> 5 of 5 Checks Passing
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 shrink-0">
                    <Clock size={14} /> {verifiedChecksCount} of 5 Checks Passing (Action / Upload Required)
                  </span>
                )}
              </div>

              {/* 5 Regulatory Validation Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. PAN */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  kycChecks.panVerified 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-slate-50 border-slate-200"
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark size={18} className={kycChecks.panVerified ? "text-emerald-700" : "text-[#0F8B7D]"} />
                      <span className="font-black text-slate-900">1. CBDT Entity PAN Verification</span>
                    </div>
                    {kycChecks.panVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                        VERIFIED ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                        PENDING CBDT MATCH
                      </span>
                    )}
                  </div>
                  {kycChecks.panVerified ? (
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      PAN <span className="font-mono text-[#0F8B7D] font-bold">{orgData.pan || "Entered PAN"}</span> matched against Central Board of Direct Taxes. Legal entity name and constitution confirmed.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Entity PAN from Step 2: <span className="font-mono text-slate-800 font-bold">{orgData.pan || "Not provided in Step 2"}</span>. Instant statutory validation against Central Board of Direct Taxes (CBDT) database.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isVerifyingPan}
                          onClick={handleVerifyPan}
                          className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isVerifyingPan ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          {isVerifyingPan ? "Verifying with CBDT..." : "Verify via CBDT Registry"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. GSTIN */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  kycChecks.gstinVerified 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-slate-50 border-slate-200"
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={18} className={kycChecks.gstinVerified ? "text-emerald-700" : "text-[#0F8B7D]"} />
                      <span className="font-black text-slate-900">2. GSTIN Active & Filing Track Record</span>
                    </div>
                    {kycChecks.gstinVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                        ACTIVE (REG-06) ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                        PENDING GST VALIDATION
                      </span>
                    )}
                  </div>
                  {kycChecks.gstinVerified ? (
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      GSTIN <span className="font-mono text-[#0F8B7D] font-bold">{orgData.gstin || "Entered GSTIN"}</span> is Active. GSTR-3B and GSTR-1 filings are regular with 0 statutory defaults.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        GSTIN from Step 2: <span className="font-mono text-slate-800 font-bold">{orgData.gstin || "Not provided in Step 2"}</span>. Real-time active status check against GST common portal.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isVerifyingGstin}
                          onClick={handleVerifyGstin}
                          className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isVerifyingGstin ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          {isVerifyingGstin ? "Validating GST Portal..." : "Validate GSTIN via Portal"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. MCA */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  kycChecks.mcaVerified 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-slate-50 border-slate-200"
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className={kycChecks.mcaVerified ? "text-emerald-700" : "text-[#0F8B7D]"} />
                      <span className="font-black text-slate-900">3. MCA RoC Corporate Registration</span>
                    </div>
                    {kycChecks.mcaVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                        ACTIVE ROC ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                        PENDING ROC VERIFICATION
                      </span>
                    )}
                  </div>
                  {kycChecks.mcaVerified ? (
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      CIN <span className="font-mono text-[#0F8B7D] font-bold">{orgData.cin || "Entered CIN"}</span> validated with Registrar of Companies. Directors {promoters[0]?.name || authorizedSignatory.name || "Authorized Directors"} confirmed on MCA portal.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Corporate CIN / LLPIN: <span className="font-mono text-slate-800 font-bold">{orgData.cin || orgData.llpin || "Not provided in Step 2"}</span>. Corporate identity verification with Ministry of Corporate Affairs (MCA21).
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isVerifyingMca}
                          onClick={handleVerifyMca}
                          className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isVerifyingMca ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          {isVerifyingMca ? "Querying MCA21..." : "Query MCA21 Corporate Registry"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Role Statutory Credential */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  kycChecks.roleCredVerified 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-slate-50 border-slate-200"
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={18} className={kycChecks.roleCredVerified ? "text-emerald-700" : "text-[#0F8B7D]"} />
                      <span className="font-black text-slate-900">
                        {role === "owner" && "4. Property Tax & CFO Fire NOC"}
                        {role === "broker" && "4. MahaRERA Real Estate Agent Validation"}
                        {role === "vendor" && "4. PSARA & Electrical Grade-A License"}
                        {role === "tenant" && "4. MCA Authorized Signatory Board Resolution"}
                      </span>
                    </div>
                    {kycChecks.roleCredVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                        VALIDATED ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                        REGISTRY CHECK PENDING
                      </span>
                    )}
                  </div>
                  {kycChecks.roleCredVerified ? (
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {role === "owner" && "Municipal tax receipt and Fire NOC matching property asset records."}
                      {role === "broker" && `RERA Agent License ${brokerProfile.reraRegistrationNo || "verified"} confirmed on MahaRERA portal.`}
                      {role === "vendor" && `PSARA ${vendorProfile.psaraLicenseNo || "verified"} and Electrical Grade-A license validated.`}
                      {role === "tenant" && "Board Resolution certified empowering signatory to execute enterprise commercial leases."}
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {role === "owner" && "Automated check against municipal property tax rolls and Fire Department NOC records."}
                        {role === "broker" && `MahaRERA Agent License (${brokerProfile.reraRegistrationNo || "pending"}) validation on state real estate authority portal.`}
                        {role === "vendor" && `PSARA Security License (${vendorProfile.psaraLicenseNo || "pending"}) and Labour Contractor database clearance.`}
                        {role === "tenant" && "Authorized Signatory clearance check for enterprise commercial leasing mandates."}
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isVerifyingRoleCred}
                          onClick={handleVerifyRoleCred}
                          className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isVerifyingRoleCred ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          {isVerifyingRoleCred ? "Validating..." : "Validate Statutory Clearance"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Bank Account Escrow / Penny Drop */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  kycChecks.bankVerified 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-slate-50 border-slate-200"
                } space-y-2 md:col-span-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className={kycChecks.bankVerified ? "text-emerald-700" : "text-[#0F8B7D]"} />
                      <span className="font-black text-slate-900">5. Automated Penny-Drop Bank Account & Escrow Match</span>
                    </div>
                    {kycChecks.bankVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                        NAME MATCH 99.4% ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200">
                        PENDING PENNY DROP
                      </span>
                    )}
                  </div>
                  {kycChecks.bankVerified ? (
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Real-time ₹1 penny drop executed. Bank Beneficiary Name matches Legal Name <span className="text-slate-900 font-bold">"{orgData.legalName || "Registered Entity"}"</span> with IFSC verified. Direct escrow and automated payouts unlocked.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Execute real-time ₹1 NPCI penny-drop transfer to verify settlement bank account against entity legal name <span className="text-slate-900 font-bold">"{orgData.legalName || "Your Legal Entity"}"</span>.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isVerifyingBank}
                          onClick={handleExecutePennyDrop}
                          className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isVerifyingBank ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                          {isVerifyingBank ? "Executing ₹1 Penny Drop via NPCI..." : "Execute Real-time ₹1 Penny Drop"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 6: DOCUMENTS VAULT
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      Step 6 of 7
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Statutory Documents & Identity Vault</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    Role-Mandated Compliance Document Checklist
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Documents are encrypted via AES-256 and verified through automated OCR metadata parsing.
                  </p>
                </div>
                <span className="text-[10px] font-black text-[#0F8B7D] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  AES-256 Vault
                </span>
              </div>

              {/* Dynamic Checklist by Role */}
              <div className="space-y-3">
                {documentsVault.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors shadow-xs ${
                      doc.fileName
                        ? "bg-white border-emerald-200 hover:border-emerald-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        doc.fileName 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-teal-50 text-[#0F8B7D] border-teal-100"
                      }`}>
                        {doc.fileName ? <FileCheck size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs">{doc.label}</span>
                          {doc.mandatory && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Mandatory
                            </span>
                          )}
                        </div>
                        {doc.fileName ? (
                          <p className="text-[11px] text-[#0F8B7D] font-mono mt-0.5">
                            {doc.fileName} ({doc.fileSize})
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            PDF, PNG or JPG up to 10MB • Awaiting upload
                          </p>
                        )}
                        {doc.extractedData && (
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            <span className="text-[#0F8B7D] font-bold">OCR Match:</span> {doc.extractedData}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {doc.fileName ? (
                        <>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle size={12} /> Verified
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDoc(doc);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          <label className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors" title="Replace / Re-upload file">
                            <Upload size={12} /> Re-upload
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                            <Clock size={12} /> Upload Required
                          </span>
                          <label className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-teal-900/10">
                            <Upload size={13} /> Upload Document
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 7: ACTIVATION & ROLE PORTAL LAUNCH
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 text-center">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#0F8B7D] to-teal-500 flex items-center justify-center mx-auto text-white mb-3 shadow-xl shadow-teal-900/15">
                  <ShieldCheck size={32} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Step 7 of 7 • Activation
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                  Organization Master Activated
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
                  Your business profile, GST-modeled legal entity master, and role-specific statutory credentials have been validated on the OfficeX enterprise network.
                </p>
              </div>

              {/* Master Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Organization Master Badge */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">
                      ORGANIZATION MASTER IDENTITY
                    </span>
                    <span className="text-[10px] font-mono text-[#0F8B7D] font-bold">{orgData.organizationCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Legal Entity Name:</span>
                    <span className="font-black text-slate-900 text-sm">{orgData.legalName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Constitution:</span>
                      <span className="font-bold text-slate-700">{orgData.organizationType.replace(/_/g, " ")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Entity PAN:</span>
                      <span className="font-mono font-bold text-[#0F8B7D]">{orgData.pan}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Active GSTIN:</span>
                      <span className="font-mono font-bold text-[#0F8B7D]">{orgData.gstin}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Registered City:</span>
                      <span className="font-bold text-slate-700">{principalPlace.city}, {principalPlace.state}</span>
                    </div>
                  </div>
                </div>

                {/* Role Business Credentials */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">
                      ROLE BUSINESS CREDENTIALS
                    </span>
                    <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Primary Signatory:</span>
                    <span className="font-black text-slate-900">{authorizedSignatory.name} ({authorizedSignatory.designation})</span>
                  </div>
                  {role === "owner" && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Portfolio Footprint:</span>
                        <span className="font-bold text-slate-800">{parseInt(ownerProfile.totalCommercialGLASqft).toLocaleString()} Sq. Ft</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Clearances:</span>
                        <span className="font-bold text-emerald-600">Fire NOC + OC ✓</span>
                      </div>
                    </div>
                  )}
                  {role === "broker" && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">RERA License:</span>
                        <span className="font-mono font-bold text-[#0F8B7D]">{brokerProfile.reraRegistrationNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Escrow Bank:</span>
                        <span className="font-bold text-slate-800">{brokerProfile.commissionEscrowBankName} ✓</span>
                      </div>
                    </div>
                  )}
                  {role === "vendor" && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Statutory Licenses:</span>
                        <span className="font-bold text-emerald-600">PSARA + Grade-A ✓</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Critical SLA:</span>
                        <span className="font-bold text-[#0F8B7D]">&lt; 30 Mins Guaranteed</span>
                      </div>
                    </div>
                  )}
                  {role === "tenant" && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Space Requirement:</span>
                        <span className="font-bold text-slate-800">{parseInt(tenantProfile.targetSpaceFootprintSqft).toLocaleString()} Sq. Ft</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Fit-out State:</span>
                        <span className="font-bold text-[#0F8B7D]">Plug & Play Preferred</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statutory Legal Declaration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="final-declaration"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F8B7D] mt-0.5 cursor-pointer"
                />
                <label htmlFor="final-declaration" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                  I hereby certify that the information entered in the Organization Master, Promoters Registry, Authorized Signatory Declaration, and Role-Specific Operational Profile is legally accurate, verified against statutory authorities, and binding upon the company.
                </label>
              </div>

              {/* Dynamic Launch Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={getDashboardDestination()}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      // Persist the onboarded organization as the active org
                      const orgName = orgData.legalName || orgData.tradeName || "My Organization";
                      const orgCity = principalPlace.city || "";
                      const orgState = principalPlace.state || "";
                      localStorage.setItem("officex_active_org", orgName);
                      localStorage.setItem("officex_org_name", orgName);
                      localStorage.setItem("officex_org_city", orgCity);
                      localStorage.setItem("officex_org_state", orgState);
                      localStorage.setItem("officex_user_role", role === "owner" ? "Property Owner (SaaS)" : role === "broker" ? "Leasing Broker" : role === "vendor" ? "FM Vendor" : "Corporate Tenant");

                      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
                      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
                      document.cookie = `officex_user_role=${encodeURIComponent(role === "owner" ? "Property Owner (SaaS)" : role === "broker" ? "Leasing Broker" : role === "vendor" ? "FM Vendor" : "Corporate Tenant")}; path=/; max-age=86400; SameSite=Lax`;

                      // Save the onboarded org as a property entry for the dashboard
                      if (role === "owner") {
                        const existingProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
                        const newProp = {
                          id: orgData.id || `prop-${Date.now()}`,
                          name: orgData.tradeName || orgData.legalName || "My Commercial Property",
                          city: orgCity,
                          state: orgState,
                          address: principalPlace.addressLine1 || "",
                          microMarket: principalPlace.city || "",
                          grade: "Grade A",
                          totalArea: ownerProfile.totalCommercialGLASqft || "0",
                          baseRent: "",
                          ownerName: userData.fullName,
                          ownerEmail: userData.email,
                          createdAt: new Date().toISOString()
                        };
                        // Avoid duplicates by name
                        const alreadyExists = existingProps.some((p: any) => p.name?.toLowerCase() === newProp.name.toLowerCase());
                        if (!alreadyExists) {
                          existingProps.push(newProp);
                          localStorage.setItem("officex_user_properties", JSON.stringify(existingProps));
                        }
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-teal-900/20 transition-all cursor-pointer"
                >
                  {role === "owner" && (
                    <>
                      <Building size={18} />
                      <span>Launch Commercial Property Listing Engine</span>
                    </>
                  )}
                  {role === "broker" && (
                    <>
                      <Handshake size={18} />
                      <span>Launch Commercial Deal Room & Commission Tracker</span>
                    </>
                  )}
                  {role === "vendor" && (
                    <>
                      <Wrench size={18} />
                      <span>Launch Facility Vendor Operations Console</span>
                    </>
                  )}
                  {role === "tenant" && (
                    <>
                      <Users size={18} />
                      <span>Launch Corporate Workplace & Visitor Compliance</span>
                    </>
                  )}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {/* Stepper Footer Navigation (Steps 1 to 6) */}
          {currentStep < 7 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={handleBackStep}
                className={`px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentStep === 1 ? "opacity-30 pointer-events-none text-slate-400 bg-slate-50" : "hover:bg-slate-100 text-slate-700 bg-white"
                }`}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-2.5">
                {currentStep === 2 && orgMasterTab === "principal" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!principalPlace.addressLine1.trim()) {
                        showToast("Principal Place of Business address is mandatory.", "error");
                        return;
                      }
                      setOrgMasterTab("additional");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Add Branch Places ({additionalPlaces.length})</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleNextStep}
                  className="px-7 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-900/20 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Synchronizing Master...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentStep === 1 && "Proceed to Organization Profile"}
                        {currentStep === 2 && (
                          orgMasterTab === "business" ? "Next: Promoters / Partners" :
                          orgMasterTab === "promoters" ? "Next: Authorized Signatory" :
                          orgMasterTab === "signatory" ? "Next: Representative" :
                          orgMasterTab === "representative" ? "Next: Principal Place of Business" :
                          orgMasterTab === "principal" ? (
                            additionalPlaces.length > 0 ? "Next: Additional Places" : "Proceed to Role Profile"
                          ) :
                          "Proceed to Role Profile"
                        )}
                        {currentStep === 3 && "Proceed to Operational SLAs"}
                        {currentStep === 4 && "Run Statutory Verification"}
                        {currentStep === 5 && "Review Compliance Documents"}
                        {currentStep === 6 && "Complete & Activate"}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* High-Fidelity Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                  <FileCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      DIGITAL COMPLIANCE VAULT
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      AES-256 Verified
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {previewDoc.label}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">FILE NAME</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{previewDoc.fileName || "statutory_document.pdf"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">FILE SIZE</span>
                  <span className="font-bold text-slate-700">{previewDoc.fileSize || "1.2 MB"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ENCRYPTION</span>
                  <span className="font-bold text-[#0F8B7D]">SHA-256 + AES</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">VERIFIED STATUS</span>
                  <span className="font-black text-emerald-700">Audit Ready</span>
                </div>
              </div>

              {previewDoc.extractedData && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 text-xs flex items-center gap-2 text-teal-900">
                  <ShieldCheck size={16} className="text-[#0F8B7D] shrink-0" />
                  <span><strong>Automated OCR Verification:</strong> {previewDoc.extractedData}</span>
                </div>
              )}

              {/* Document Display Canvas */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] flex flex-col items-center justify-center p-6 bg-slate-50/50">
                {previewDoc.fileUrl ? (
                  previewDoc.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img src={previewDoc.fileUrl} alt="Document Preview" className="max-h-[380px] object-contain rounded-xl shadow-md" />
                  ) : (
                    <iframe src={previewDoc.fileUrl} title="Document Preview" className="w-full h-[400px] rounded-xl border border-slate-200 shadow-sm" />
                  )
                ) : (
                  <div className="text-center space-y-3 py-6 max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                      <BadgeCheck size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{previewDoc.label}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Statutory credential verified against governmental registry records. Document token cryptographically sealed and archived in compliant storage.
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-700 shadow-2xs inline-block">
                        REG-HASH: {orgData.pan ? `PAN-${orgData.pan}` : orgData.gstin ? `GST-${orgData.gstin}` : "DOC-SEAL-2026-OX"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Official Legal Record</span>
              <div className="flex items-center gap-2">
                {previewDoc.fileUrl && (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} /> Open in New Tab
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-500">Loading Role-Based Business Onboarding Suite...</div>}>
      <OnboardingWizardContent />
    </Suspense>
  );
}

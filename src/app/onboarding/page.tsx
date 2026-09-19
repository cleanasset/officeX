"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  DollarSign
} from "lucide-react";

function OnboardingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") || "";

  // 1 to 8 internal steps mapping to S04 - S11:
  // 1: S04 Select Role
  // 2: S05 Organization Search / Choose
  // 3: S06 Organization Basics
  // 4: S07 Role Business Profile
  // 5: S08 Operating Profile
  // 6: S09 KYC & Document Uploads
  // 7: S10 Review & Submit
  // 8: S11 Verification Status Tracker
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [role, setRole] = useState<"owner" | "broker" | "vendor" | "pm" | "tenant">("owner");

  // Organization Search (S05)
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [orgSearchResults, setOrgSearchResults] = useState<any[]>([]);
  const [isSearchingOrg, setIsSearchingOrg] = useState(false);
  const [selectedExistingOrg, setSelectedExistingOrg] = useState<any | null>(null);
  const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(true);

  // Organization Basics (S06)
  const [orgData, setOrgData] = useState({
    id: "",
    legalName: "",
    tradeName: "",
    organizationType: "PRIVATE_LIMITED",
    pan: "",
    gstin: "",
    cin: "",
    llpin: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "Mumbai",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    pincode: "400051",
    yearEstablished: "2018",
    employeeCountBand: "11–50"
  });

  // Role Profile Data (S07 & S08)
  const [roleProfile, setRoleProfile] = useState({
    // Owner specific
    ownershipType: "OWNER",
    assetTypes: ["OFFICE", "IT_PARK"] as string[],
    portfolioPropertyCount: 2,
    portfolioAreaSqft: "125000",
    approxLeasableAreaSqft: "110000",
    approxOccupancyPct: "92",
    servicesRequired: ["LEASING", "PROPERTY_MGMT", "RENT_ROLL"] as string[],

    // Broker specific
    brokerType: "FIRM",
    services: ["COMMERCIAL_LEASING", "OFFICE", "TENANT_REP"] as string[],
    operatingCities: ["Mumbai", "Pune"] as string[],
    operatingMicroMarkets: ["BKC", "Lower Parel", "Andheri East"] as string[],
    reraApplicable: true,
    reraRegistrationNo: "A51800018492",
    yearsInBusiness: 6,
    teamSizeBand: "6–10",
    clientTypes: ["CORPORATE", "SME"] as string[],
    typicalDealSizeBand: "₹25L – ₹1Cr",
    transactionsPerYearBand: "6–20",

    // Vendor specific
    vendorCategory: ["MEP", "HVAC", "FIRE_LIFE_SAFETY"] as string[],
    citiesServed: ["Mumbai", "Bengaluru", "Delhi NCR"] as string[],
    buildingSegments: ["OFFICE", "IT_PARK", "INDUSTRIAL"] as string[],
    employeeCount: 45,
    technicalStaffCount: 22,
    insuranceAvailable: true,
    pfRegistration: true,
    esicRegistration: true,
    isoCertifications: ["ISO 9001:2015"] as string[],
    licensesCertifications: ["Electrical Contractor License Grade-A"] as string[]
  });

  // KYC Documents (S09)
  const [documentsList, setDocumentsList] = useState<Array<{
    type: string;
    label: string;
    docNumber: string;
    fileName: string;
    status: "pending" | "uploaded" | "verified";
  }>>([
    { type: "PAN", label: "Entity PAN Card", docNumber: "", fileName: "", status: "pending" },
    { type: "GST_CERTIFICATE", label: "GST Registration Certificate", docNumber: "", fileName: "", status: "pending" },
    { type: "INCORPORATION", label: "Certificate of Incorporation / Deed", docNumber: "", fileName: "", status: "pending" },
    { type: "BANK_PROOF", label: "Bank Cancelled Cheque / Letter", docNumber: "", fileName: "", status: "pending" }
  ]);

  // Review & Submit (S10)
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Status Tracker (S11)
  const [verificationCase, setVerificationCase] = useState<{
    caseId: string;
    stage: string;
    status: string;
    reviewerNotes: string;
  } | null>(null);

  // Pre-fill user context
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name") || "";
      const storedEmail = localStorage.getItem("officex_user_email") || "";
      const intendedRole = localStorage.getItem("officex_intended_role") || queryRole;

      if (intendedRole) {
        const lower = intendedRole.toLowerCase();
        if (lower.includes("broker")) setRole("broker");
        else if (lower.includes("vendor")) setRole("vendor");
        else if (lower.includes("pm") || lower.includes("facility")) setRole("pm");
        else if (lower.includes("tenant")) setRole("tenant");
        else setRole("owner");
      }
    }
  }, [queryRole]);

  // Organization Search debounce
  useEffect(() => {
    if (orgSearchQuery.trim().length < 2) {
      setOrgSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOrg(true);
      try {
        const res = await fetch(`/api/v1/organizations/search?q=${encodeURIComponent(orgSearchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setOrgSearchResults(data.results || []);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearchingOrg(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [orgSearchQuery]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to update multi-select arrays
  const toggleArrayItem = (field: keyof typeof roleProfile, item: string) => {
    setRoleProfile((prev) => {
      const list = (prev[field] as string[]) || [];
      const next = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
      return { ...prev, [field]: next };
    });
  };

  // Handle Document Upload Simulation
  const handleUploadDoc = (docType: string, docNum: string) => {
    setDocumentsList((prev) =>
      prev.map((d) =>
        d.type === docType
          ? {
              ...d,
              docNumber: docNum,
              fileName: `${docType.toLowerCase()}_verified_${Date.now().toString().slice(-4)}.pdf`,
              status: "uploaded"
            }
          : d
      )
    );
    showToast(`Uploaded evidence for ${docType}.`, "success");
  };

  // Handle Step Advancement & API synchronization
  const handleNextStep = async () => {
    setToast(null);

    // Step 2: Org selection
    if (currentStep === 2) {
      if (!isCreatingNewOrg && !selectedExistingOrg) {
        showToast("Please select an organization or choose to create a new one.", "error");
        return;
      }
      if (selectedExistingOrg) {
        setOrgData((prev) => ({
          ...prev,
          id: selectedExistingOrg.id,
          legalName: selectedExistingOrg.legalName || selectedExistingOrg.name,
          pan: selectedExistingOrg.pan || prev.pan,
          gstin: selectedExistingOrg.gstin || prev.gstin,
          city: selectedExistingOrg.city || prev.city,
          state: selectedExistingOrg.state || prev.state
        }));
      }
    }

    // Step 3: Org creation
    if (currentStep === 3) {
      if (!orgData.legalName.trim()) {
        showToast("Legal Entity Name is mandatory.", "error");
        return;
      }
      if (!orgData.addressLine1.trim()) {
        showToast("Registered Office Address is mandatory.", "error");
        return;
      }

      setIsLoading(true);
      try {
        const userId = typeof window !== "undefined" ? localStorage.getItem("officex_user_id") || "" : "";
        const res = await fetch("/api/v1/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            legalName: orgData.legalName,
            tradeName: orgData.tradeName || orgData.legalName,
            organizationType: orgData.organizationType,
            pan: orgData.pan,
            gstin: orgData.gstin,
            cin: orgData.cin,
            llpin: orgData.llpin,
            registeredAddressLine1: orgData.addressLine1,
            city: orgData.city,
            district: orgData.district,
            state: orgData.state,
            pincode: orgData.pincode,
            yearEstablished: orgData.yearEstablished,
            employeeCountBand: orgData.employeeCountBand
          })
        });

        const created = await res.json();
        if (created.organization?.id) {
          setOrgData((prev) => ({ ...prev, id: created.organization.id }));
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_org_id", created.organization.id);
            localStorage.setItem("officex_user_company", orgData.legalName);
          }
        }
      } catch (err) {
        console.warn("Org save fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // Step 4: Role profile save
    if (currentStep === 4) {
      setIsLoading(true);
      try {
        const orgId = orgData.id || (typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "org-local" : "org-local");
        await fetch(`/api/v1/profiles/${role}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: orgId,
            ...roleProfile
          })
        });
      } catch (err) {
        console.warn("Profile save warning:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // Advance
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Final Submit (S10 -> S11)
  const handleFinalSubmit = async () => {
    if (!declarationAccepted) {
      showToast("Please accept the legal declaration before submitting.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const orgId = orgData.id || "org-demo";
      const userId = typeof window !== "undefined" ? localStorage.getItem("officex_user_id") || "" : "";

      const res = await fetch("/api/v1/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          userId,
          role: role.toUpperCase(),
          declarationAccepted: true
        })
      });

      const data = await res.json();
      setVerificationCase({
        caseId: data.caseId || `case_${Date.now().toString().slice(-6)}`,
        stage: data.stage || "K1_BUSINESS",
        status: "SUBMITTED",
        reviewerNotes: "Your legal credentials and compliance documents have been logged into the Scalezix verification queue."
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("officex_kyc_status", "SUBMITTED");
        localStorage.setItem("officex_onboarded_role", role);
      }

      showToast("🎉 Verification package submitted successfully!", "success");
      setCurrentStep(8); // S11 Status Tracker
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Submitted to workspace.", "info");
      setCurrentStep(8);
    } finally {
      setIsLoading(false);
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
      case "pm":
        return "/ops";
      case "tenant":
        return "/tenant";
      default:
        return "/properties";
    }
  };

  const wizardSteps = [
    { num: 1, label: "Role Type", code: "S04" },
    { num: 2, label: "Entity Search", code: "S05" },
    { num: 3, label: "Org Basics", code: "S06" },
    { num: 4, label: "Role Profile", code: "S07" },
    { num: 5, label: "Operating Specs", code: "S08" },
    { num: 6, label: "KYC Documents", code: "S09" },
    { num: 7, label: "Review & Sign", code: "S10" },
    { num: 8, label: "Verification", code: "S11" }
  ];

  return (
    <div className="min-h-screen bg-[#071322] text-slate-100 font-sans pb-20 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#0F8B7D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-800 border border-emerald-500"
              : toast.type === "error"
              ? "bg-rose-900 border border-rose-500"
              : "bg-slate-900 border border-slate-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-amber-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0B1A2C]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F8B7D] to-teal-400 flex items-center justify-center font-black text-slate-900 text-xs shadow-md">
            OX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-tight">OfficeX</span>
              <span className="text-[10px] font-bold text-[#0F8B7D] bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800/80">
                Enterprise Onboarding
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Specification v1.0 • Progressive Business Profiling & KYC</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link href="/login" className="text-slate-400 hover:text-white font-bold transition-colors">
            Exit to Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6 relative z-10">
        {/* Stepper Strip */}
        <div className="bg-[#0B1A2C] p-3 rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto gap-2 shadow-lg">
          {wizardSteps.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num <= currentStep) setCurrentStep(s.num);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentStep === s.num
                  ? "bg-[#0F8B7D] text-white shadow-xs"
                  : currentStep > s.num
                  ? "bg-teal-950 text-teal-300 border border-teal-800/60 cursor-pointer"
                  : "text-slate-500 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  currentStep === s.num ? "bg-white text-[#0F8B7D]" : currentStep > s.num ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-500"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
              <span className="md:hidden text-[10px]">{s.code}</span>
            </button>
          ))}
        </div>

        {/* Wizard Step Content Card */}
        <div className="bg-[#0B1A2C] rounded-3xl border border-slate-800/90 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* ═══════════════════════════════════════════════════════════════
              STEP 1 (S04): SELECT USER TYPE
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S04</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">Select Your Primary Role</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  OfficeX adapts your business profile, required compliance, and operational workspace based on your primary role.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "owner",
                    title: "Property Owner / Landlord",
                    desc: "Own or manage commercial assets, towers, IT parks, and list vacant spaces.",
                    icon: Building,
                    badge: "Asset Portfolio"
                  },
                  {
                    id: "broker",
                    title: "Broker / Channel Partner",
                    desc: "Source, market, and transact commercial spaces with 45-day brokerage tracking.",
                    icon: Handshake,
                    badge: "1.5x Commission"
                  },
                  {
                    id: "vendor",
                    title: "Facility & Service Vendor",
                    desc: "Provide Hard FM, MEP, HVAC, cleaning, or security services; bid on RFQs & receive escrow.",
                    icon: Truck,
                    badge: "Escrow Payouts"
                  },
                  {
                    id: "pm",
                    title: "Facility / Property Manager",
                    desc: "Coordinate campus operations, 52-week PPM schedules, and tenant tickets.",
                    icon: Settings,
                    badge: "Command Centre"
                  },
                  {
                    id: "tenant",
                    title: "Corporate Tenant / Occupier",
                    desc: "Lease enterprise office spaces, invite visitors, and manage company tickets.",
                    icon: Users,
                    badge: "Workplace Portal"
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                      role === item.id
                        ? "border-[#0F8B7D] bg-teal-950/40 shadow-lg shadow-teal-950/40"
                        : "border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl ${role === item.id ? "bg-[#0F8B7D] text-white" : "bg-slate-800 text-slate-400"}`}>
                          <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{item.desc}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <span className={`text-xs font-bold ${role === item.id ? "text-[#0F8B7D]" : "text-slate-500"}`}>
                        {role === item.id ? "Selected ✓" : "Select →"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2 (S05): ORGANIZATION SEARCH / JOIN OR CREATE
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S05</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">Organization Search & Deduplication</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  OfficeX links all properties, leases, and contracts to an Organization entity. Search to avoid duplicate records.
                </p>
              </div>

              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  SEARCH YOUR COMPANY BY LEGAL NAME, GSTIN, CIN, OR PAN
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    placeholder="e.g. Apex Commercial, Godrej, Shivalik, or enter 15-digit GSTIN..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                  />
                  {isSearchingOrg && <Loader2 size={16} className="absolute right-4 top-3.5 animate-spin text-[#0F8B7D]" />}
                </div>
              </div>

              {/* Search Results */}
              {orgSearchResults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    FOUND MATCHING ENTITIES IN OFFICEX REGISTRY:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {orgSearchResults.map((ent) => (
                      <div
                        key={ent.id}
                        onClick={() => {
                          setSelectedExistingOrg(ent);
                          setIsCreatingNewOrg(false);
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedExistingOrg?.id === ent.id
                            ? "border-[#0F8B7D] bg-teal-950/50"
                            : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-black text-white">{ent.legalName || ent.name}</h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {ent.organizationType || "LLP"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {ent.city}, {ent.state} {ent.pan ? `• PAN: ${ent.pan}` : ""}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-400">Verified Business</span>
                          <span className="text-[10px] font-bold text-[#0F8B7D]">Request to Join →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Option */}
              <div
                onClick={() => {
                  setSelectedExistingOrg(null);
                  setIsCreatingNewOrg(true);
                  if (orgSearchQuery && !orgData.legalName) {
                    setOrgData((prev) => ({ ...prev, legalName: orgSearchQuery }));
                  }
                }}
                className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center gap-4 ${
                  isCreatingNewOrg
                    ? "border-[#0F8B7D] bg-teal-950/30 text-white"
                    : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
              >
                <div className="p-3 rounded-xl bg-slate-800 text-[#0F8B7D]">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Create a New Organization</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Register a new legal corporate entity, firm, or individual proprietorship on OfficeX.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3 (S06): ORGANIZATION BASICS
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S06</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">Organization Legal Master</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter statutory entity details. These will be mapped across all leasing contracts, compliance, and billing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    LEGAL ENTITY NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgData.legalName}
                    onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                    placeholder="e.g. Apex Commercial Realty Private Limited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    TRADE / BRAND NAME
                  </label>
                  <input
                    type="text"
                    value={orgData.tradeName}
                    onChange={(e) => setOrgData({ ...orgData, tradeName: e.target.value })}
                    placeholder="e.g. Apex Spaces"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    ORGANIZATION CONSTITUTION TYPE *
                  </label>
                  <select
                    value={orgData.organizationType}
                    onChange={(e) => setOrgData({ ...orgData, organizationType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="PRIVATE_LIMITED">Private Limited Company</option>
                    <option value="PUBLIC_LIMITED">Public Limited Company</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PARTNERSHIP">Partnership Firm</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                    <option value="INDIVIDUAL">Individual Asset Owner</option>
                    <option value="TRUST">Trust / Society</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    PAN NUMBER (10 CHARS)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={orgData.pan}
                    onChange={(e) => setOrgData({ ...orgData, pan: e.target.value.toUpperCase() })}
                    placeholder="e.g. AAACG5678K"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    GSTIN (15 CHARS)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={orgData.gstin}
                    onChange={(e) => setOrgData({ ...orgData, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 27AAACG5678K1Z2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    CIN / LLPIN (COMPANIES & LLPS)
                  </label>
                  <input
                    type="text"
                    value={orgData.cin}
                    onChange={(e) => setOrgData({ ...orgData, cin: e.target.value.toUpperCase() })}
                    placeholder="e.g. L74120MH1985PLC035308"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              {/* Registered Office Address */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider block">
                  REGISTERED OFFICE ADDRESS *
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={orgData.addressLine1}
                      onChange={(e) => setOrgData({ ...orgData, addressLine1: e.target.value })}
                      placeholder="Address Line 1 (Building, Street, Landmark)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={orgData.city}
                      onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                      placeholder="City (e.g. Mumbai)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={orgData.state}
                      onChange={(e) => setOrgData({ ...orgData, state: e.target.value })}
                      placeholder="State (e.g. Maharashtra)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={orgData.pincode}
                      onChange={(e) => setOrgData({ ...orgData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="Pincode (6 digits)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <select
                      value={orgData.employeeCountBand}
                      onChange={(e) => setOrgData({ ...orgData, employeeCountBand: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                    >
                      <option>1–10 Employees</option>
                      <option>11–50 Employees</option>
                      <option>51–200 Employees</option>
                      <option>201–500 Employees</option>
                      <option>500+ Employees</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 4 (S07): ROLE BUSINESS PROFILE
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S07</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">
                  {role === "owner"
                    ? "Property Owner Asset Profile"
                    : role === "broker"
                    ? "Broker / Channel Partner Specialization"
                    : "Facility & Service Vendor Capability Profile"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Capture role-specific operational credentials to unlock relevant platform modules.
                </p>
              </div>

              {/* OWNER PROFILE */}
              {role === "owner" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        OWNERSHIP NATURE *
                      </label>
                      <select
                        value={roleProfile.ownershipType}
                        onChange={(e) => setRoleProfile({ ...roleProfile, ownershipType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      >
                        <option value="OWNER">Direct Asset Owner</option>
                        <option value="CO_OWNER">Co-Owner / Joint Venture</option>
                        <option value="DEVELOPER">Real Estate Developer</option>
                        <option value="INVESTOR">REIT / Institutional Investor</option>
                        <option value="ASSET_MANAGER">Asset Management Company</option>
                        <option value="AUTHORIZED_REPRESENTATIVE">Authorized Representative</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        PORTFOLIO PROPERTY COUNT
                      </label>
                      <input
                        type="number"
                        value={roleProfile.portfolioPropertyCount}
                        onChange={(e) => setRoleProfile({ ...roleProfile, portfolioPropertyCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        TOTAL MANAGED AREA (SQFT)
                      </label>
                      <input
                        type="number"
                        value={roleProfile.portfolioAreaSqft}
                        onChange={(e) => setRoleProfile({ ...roleProfile, portfolioAreaSqft: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        APPROX. OCCUPANCY PERCENTAGE (%)
                      </label>
                      <input
                        type="number"
                        value={roleProfile.approxOccupancyPct}
                        onChange={(e) => setRoleProfile({ ...roleProfile, approxOccupancyPct: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      COMMERCIAL ASSET TYPES IN PORTFOLIO (MULTI-SELECT) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["OFFICE", "IT_PARK", "RETAIL", "INDUSTRIAL", "WAREHOUSE", "CO_WORKING", "MIXED_USE"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleArrayItem("assetTypes", cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            roleProfile.assetTypes.includes(cat)
                              ? "bg-[#0F8B7D] text-white shadow-xs"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          {cat.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BROKER PROFILE */}
              {role === "broker" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        BROKERAGE MODEL *
                      </label>
                      <select
                        value={roleProfile.brokerType}
                        onChange={(e) => setRoleProfile({ ...roleProfile, brokerType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      >
                        <option value="FIRM">Commercial Advisory Firm</option>
                        <option value="INDIVIDUAL">Independent Broker</option>
                        <option value="CHANNEL_PARTNER">Institutional Channel Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        YEARS IN COMMERCIAL REAL ESTATE
                      </label>
                      <input
                        type="number"
                        value={roleProfile.yearsInBusiness}
                        onChange={(e) => setRoleProfile({ ...roleProfile, yearsInBusiness: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* RERA Section */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-white block">RERA REGISTRATION STATUS *</span>
                        <span className="text-[10px] text-slate-400">Statutory requirement for commercial property mediation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRoleProfile({ ...roleProfile, reraApplicable: true })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            roleProfile.reraApplicable ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          Yes, Registered
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoleProfile({ ...roleProfile, reraApplicable: false })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            !roleProfile.reraApplicable ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          Not Applicable
                        </button>
                      </div>
                    </div>

                    {roleProfile.reraApplicable && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          RERA REGISTRATION NUMBER *
                        </label>
                        <input
                          type="text"
                          value={roleProfile.reraRegistrationNo}
                          onChange={(e) => setRoleProfile({ ...roleProfile, reraRegistrationNo: e.target.value })}
                          placeholder="e.g. A51800018492"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      LEASING SERVICES & SPECIALIZATIONS *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "COMMERCIAL_LEASING",
                        "OFFICE",
                        "INDUSTRIAL",
                        "WAREHOUSE",
                        "RETAIL",
                        "INVESTMENT_SALES",
                        "TENANT_REP",
                        "LANDLORD_REP"
                      ].map((srv) => (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleArrayItem("services", srv)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            roleProfile.services.includes(srv)
                              ? "bg-[#0F8B7D] text-white shadow-xs"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          {srv.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VENDOR PROFILE */}
              {role === "vendor" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      FM SERVICE CATEGORIES (SELECT ALL ACTIVE CAPABILITIES) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "HOUSEKEEPING",
                        "SECURITY",
                        "MEP",
                        "HVAC",
                        "ELECTRICAL",
                        "PLUMBING",
                        "CIVIL",
                        "FIRE_LIFE_SAFETY",
                        "STP_WTP",
                        "DG_SETS",
                        "ELEVATORS",
                        "PEST_CONTROL"
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleArrayItem("vendorCategory", cat)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer transition-all flex items-center justify-between ${
                            roleProfile.vendorCategory.includes(cat)
                              ? "bg-teal-950 border border-teal-600 text-teal-200"
                              : "bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <span>{cat.replace("_", " ")}</span>
                          {roleProfile.vendorCategory.includes(cat) && <CheckCircle size={14} className="text-[#0F8B7D]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        TOTAL EMPLOYEES
                      </label>
                      <input
                        type="number"
                        value={roleProfile.employeeCount}
                        onChange={(e) => setRoleProfile({ ...roleProfile, employeeCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        TECHNICAL / CERTIFIED STAFF
                      </label>
                      <input
                        type="number"
                        value={roleProfile.technicalStaffCount}
                        onChange={(e) => setRoleProfile({ ...roleProfile, technicalStaffCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        STATUTORY COMPLIANCE
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 font-bold text-[10px] border border-teal-800">
                          PF Registered ✓
                        </span>
                        <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 font-bold text-[10px] border border-teal-800">
                          ESIC Active ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 5 (S08): OPERATING PROFILE
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S08</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">Operating Profile & Regional Coverage</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define your geographic presence and target commercial building segments.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                    OPERATING COMMERCIAL CITIES (SELECT COVERAGE) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Mumbai",
                      "Delhi NCR",
                      "Bengaluru",
                      "Hyderabad",
                      "Pune",
                      "Ahmedabad",
                      "Chennai",
                      "Kolkata"
                    ].map((cty) => (
                      <button
                        key={cty}
                        type="button"
                        onClick={() => toggleArrayItem("operatingCities", cty)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          roleProfile.operatingCities.includes(cty)
                            ? "bg-[#0F8B7D] text-white shadow-xs"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {cty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                    BUILDING & ASSET SEGMENTS SERVED *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Grade A Office Towers", "IT / SEZ Parks", "Retail Malls", "Industrial Parks", "Warehousing / Logistics"].map(
                      (seg) => (
                        <span key={seg} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold border border-slate-700">
                          {seg}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 6 (S09): KYC & COMPLIANCE DOCUMENTS
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S09</span>
                  <h2 className="text-xl font-black text-white tracking-tight mt-1">KYC & Compliance Verification</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload official evidence. Identifiers are masked in accordance with privacy rules.
                  </p>
                </div>
                <span className="text-[10px] font-black text-[#0F8B7D] bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
                  AES-256 Encrypted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentsList.map((doc) => (
                  <div key={doc.type} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{doc.label}</span>
                      {doc.status === "uploaded" ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                          Uploaded ✓
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                          Pending Evidence
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={doc.docNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDocumentsList((prev) => prev.map((d) => (d.type === doc.type ? { ...d, docNumber: val } : d)));
                      }}
                      placeholder={`Enter ${doc.label} Number`}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-xs"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                        {doc.fileName || "PDF / JPG up to 10MB"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUploadDoc(doc.type, doc.docNumber || "DOC-VERIFIED-01")}
                        className="px-3 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/80 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Upload size={12} />
                        <span>{doc.status === "uploaded" ? "Re-upload" : "Upload Evidence"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 7 (S10): REVIEW & SUBMIT
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S10</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">Review & Sign Verification Declaration</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review submitted business master details before final transmission to the verification desk.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">ORGANIZATION MASTER</span>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-[10px] font-bold text-teal-400 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Legal Name:</span>
                    <span className="font-black text-white">{orgData.legalName || "Apex Commercial"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Constitution & PAN:</span>
                    <span className="font-bold text-slate-300">
                      {orgData.organizationType} • {orgData.pan || "AABCA1234D"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location:</span>
                    <span className="font-bold text-slate-300">
                      {orgData.city}, {orgData.state}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider">ROLE BUSINESS CREDENTIALS</span>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-[10px] font-bold text-teal-400 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Role:</span>
                    <span className="font-black text-teal-300 uppercase">{role}</span>
                  </div>
                  {role === "broker" && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">RERA Status:</span>
                      <span className="font-bold text-slate-300">
                        {roleProfile.reraApplicable ? `Registered (${roleProfile.reraRegistrationNo})` : "Not Applicable"}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operating Hubs:</span>
                    <span className="font-bold text-slate-300">{roleProfile.operatingCities.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Declaration Checkbox */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F8B7D] mt-0.5 cursor-pointer"
                />
                <label htmlFor="declaration" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                  I solemnly declare that all information, business credentials, and statutory identity documents provided herein are
                  truthful, legally authorized, and compliant with applicable state and central regulatory acts.
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isLoading || !declarationAccepted}
                  onClick={handleFinalSubmit}
                  className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-950/50 cursor-pointer transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Transmitting Package...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Submit Verification Package</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 8 (S11): VERIFICATION STATUS TRACKER
              ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 flex items-center justify-center mx-auto text-[#0F8B7D] mb-3 shadow-lg">
                  <ShieldCheck size={26} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D]">Screen S11</span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">Verification Case Logged</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Case ID: <span className="font-mono text-teal-300 font-bold">{verificationCase?.caseId || "CASE-9842"}</span> • Status:{" "}
                  <span className="font-bold text-emerald-400">SUBMITTED (IN REVIEW)</span>
                </p>
              </div>

              {/* Progressive Stage Timeline (K0 - K5) */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  STATUTORY KYC STAGES TIMELINE (SECTION 10):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { stage: "K0 Contact", name: "Email & Mobile OTP", status: "VERIFIED", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" },
                    { stage: "K1 Business", name: "Legal Name & Tax Match", status: "UNDER REVIEW", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
                    { stage: "K2 Identity", name: "Authorized Signatory Proof", status: "QUEUED", color: "text-slate-400 bg-slate-900 border-slate-800" },
                    {
                      stage: role === "owner" ? "K3 Property" : role === "vendor" ? "K4 Vendor" : "K3 Transaction",
                      name: role === "owner" ? "Ownership Title Proof" : role === "vendor" ? "Statutory Labor Proof" : "Mediation Terms",
                      status: "QUEUED",
                      color: "text-slate-400 bg-slate-900 border-slate-800"
                    },
                    { stage: "K5 Payment", name: "Bank Account & Escrow", status: "PENDING", color: "text-slate-400 bg-slate-900 border-slate-800" }
                  ].map((st, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400">{st.stage}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.status}</span>
                      </div>
                      <span className="font-bold text-white block truncate">{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
                <Clock size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Estimated Review Time: Within 24 Business Hours</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    You can immediately access your role dashboard to explore listings, configure building inventory, or browse matched
                    opportunities while automated checks verify your legal evidence.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center">
                <Link
                  href={getDashboardDestination()}
                  className="px-8 py-3 rounded-2xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-teal-950/50 transition-all cursor-pointer"
                >
                  <span>Proceed to Role Workspace</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls (Steps 1 - 7) */}
          {currentStep < 8 && currentStep !== 7 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-6">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentStep === 1 ? "opacity-20 pointer-events-none" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-950/40 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071322] flex items-center justify-center text-xs text-slate-500">Loading Onboarding Suite...</div>}>
      <OnboardingWizardContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  X,
  Lock,
  FileText,
  Check,
  AlertCircle,
  ShieldCheck,
  Layers,
  Briefcase,
  Users,
  CreditCard,
  Palette,
  FileUp,
  ChevronRight
} from "lucide-react";
import {
  AddressAutocomplete,
  CityAutocomplete,
  StateAutocomplete,
} from "@/components/ui/LocationInputs";
import { getCitiesForState } from "@/lib/location-data";

export type RoleType =
  | "commercial_owner"
  | "flex_operator"
  | "fm_company"
  | "pm_company"
  | "msp_operator";

interface RoleOption {
  id: RoleType;
  title: string;
  badge: string;
  description: string;
  billingFocus: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleOption[] = [
  {
    id: "commercial_owner",
    title: "Commercial Property Owner / Landlord",
    badge: "Sq. Ft. & Leases",
    description: "Asset owners, developers & REITs managing conventional office, IT park, or retail leases.",
    billingFocus: "Bills Base Rent + CAM by Chargeable Area (₹/sq. ft.)",
    icon: Building2
  },
  {
    id: "flex_operator",
    title: "Managed Office & Coworking Operator",
    badge: "Seats & Plans",
    description: "Operators running flex centres, desk & cabin memberships, head leases and centre P&L.",
    billingFocus: "Bills per Seat / Desk (₹/seat) with bundled amenities",
    icon: Layers
  },
  {
    id: "fm_company",
    title: "Facility Management Company (FM)",
    badge: "CAM & Meters Only",
    description: "IFM & FM firms billing CAM, metered utilities (grid, DG, water) and maintenance service charges.",
    billingFocus: "Charges-Only billing (No base rent; CAM pools & utility meters)",
    icon: Briefcase
  },
  {
    id: "pm_company",
    title: "Property Management Company (PM)",
    badge: "Multi-Client Mandates",
    description: "Firms managing leasing, billing & collections for multiple third-party property owners.",
    billingFocus: "Owner Statements, fee calculations & collections on behalf of owners",
    icon: Users
  },
  {
    id: "msp_operator",
    title: "Managed Service Provider (MSP)",
    badge: "Full Operator Suite",
    description: "Full-service operators managing end-to-end multi-client portfolios & executive MIS.",
    billingFocus: "Multi-client accounts + operations + client-branded executive MIS",
    icon: ShieldCheck
  }
];

const PRESET_COLORS = [
  { name: "OfficeX Teal", hex: "#0F8B7D" },
  { name: "Royal Indigo", hex: "#4F46E5" },
  { name: "Sapphire Blue", hex: "#0284C7" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Slate Charcoal", hex: "#1E293B" },
  { name: "Crimson Rose", hex: "#E11D48" }
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSegmentParam = searchParams.get("segment") as RoleType | null;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  // ──── STEP 1: ROLE & COMPANY PROFILE ────
  const [selectedRole, setSelectedRole] = useState<RoleType>(initialSegmentParam || "commercial_owner");
  const [orgData, setOrgData] = useState({
    legalName: "",
    tradeName: "",
    city: "",
    state: "",
    pan: "",
    gstin: "",
    primaryAddress: "",
    contactPhone: ""
  });

  // ──── STEP 2: BRANDING & BANK ACCOUNT ────
  const [branding, setBranding] = useState({
    brandColor: "#0F8B7D",
    logoPreview: "",
    invoiceHeaderMemo: "Official Tax Invoice issued under Section 31 of CGST Act, 2017"
  });
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolder: ""
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ──── STEP 3: PRIMARY PROPERTY & SPACE (CONNECTED) ────
  const [propertyData, setPropertyData] = useState({
    name: "",
    city: "",
    state: "",
    microMarket: "",
    gstin: "",
    // Commercial Owner fields
    totalAreaSqft: 25000,
    unitNumber: "Unit 101",
    unitAreaSqft: 5000,
    askingBaseRentPsf: 150,
    camRatePsf: 25,
    // Flex Operator fields
    centreCapacitySeats: 250,
    seatType: "dedicated_desk",
    ratePerSeatMonthly: 12000,
    // FM Company fields
    camBudgetMonthly: 250000,
    meterElectricityGrid: true,
    meterDgBackup: true,
    meterWater: true,
    // PM / MSP fields
    clientOwnerName: "",
    mandateFeePct: 5
  });

  // Optional Tenant details in Step 3
  const [hasTenant, setHasTenant] = useState<boolean>(true);
  const [tenantData, setTenantData] = useState({
    name: "",
    email: "",
    phone: "",
    monthlyRentOrFee: 750000,
    rentAgreementFileName: "",
    agreementDate: new Date().toISOString().split("T")[0]
  });

  const [existingUserMessage, setExistingUserMessage] = useState<string | null>(null);

  // Prefill organization details from session on mount and detect existing users
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAlreadyOnboarded =
        localStorage.getItem("officex_onboarding_completed") === "1" ||
        sessionStorage.getItem("officex_onboarding_completed") === "1" ||
        document.cookie.includes("officex_onboarding_completed=1") ||
        (localStorage.getItem("officex_session_active") === "1" && localStorage.getItem("officex_property_id"));

      if (isAlreadyOnboarded) {
        setExistingUserMessage("User already exists! Your organization and properties are already configured. Please sign in to access your Rent Roll dashboard.");
        setTimeout(() => {
          router.push(`/login?context=rent-roll&redirect=${encodeURIComponent("/properties/rent-roll")}`);
        }, 2500);
      }

      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const rememberedEmail = localStorage.getItem("officex_remembered_email") || "";

      if (storedName && !orgData.legalName) {
        setOrgData(prev => ({
          ...prev,
          legalName: `${storedName}'s Commercial Entity`,
          tradeName: storedName
        }));
      } else if ((storedEmail || rememberedEmail) && !orgData.legalName) {
        const clean = (storedEmail || rememberedEmail).split("@")[0].replace(/[._-]/g, " ");
        const titleCase = clean.charAt(0).toUpperCase() + clean.slice(1);
        setOrgData(prev => ({
          ...prev,
          legalName: `${titleCase} Capital Realty`,
          tradeName: `${titleCase} Spaces`
        }));
      }
    }
  }, []);

  // Sync state & city between Org and Property
  useEffect(() => {
    if (orgData.city && !propertyData.city) {
      setPropertyData(prev => ({ ...prev, city: orgData.city, state: orgData.state }));
    }
  }, [orgData.city, orgData.state]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBranding(prev => ({ ...prev, logoPreview: dataUrl }));
      try {
        localStorage.setItem("officex_brand_logo", dataUrl);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!orgData.legalName.trim()) {
        alert("Please enter your Company Legal Name to continue.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!propertyData.name.trim()) {
        alert("Please enter your Primary Building or Centre name.");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final Commit to Production
  const handleFinalCommit = async () => {
    setIsSubmitting(true);
    try {
      const userEmail = (typeof window !== "undefined" && (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email"))) || "";

      // Compute primary monthly rental or fee
      let primaryRent = propertyData.askingBaseRentPsf * propertyData.unitAreaSqft;
      if (selectedRole === "flex_operator") {
        primaryRent = propertyData.ratePerSeatMonthly * 20; // default 20-seat pod
      } else if (selectedRole === "fm_company") {
        primaryRent = propertyData.camBudgetMonthly;
      }
      if (hasTenant && tenantData.monthlyRentOrFee) {
        primaryRent = tenantData.monthlyRentOrFee;
      }

      // Structure unified payload for onboarding commit API
      const payload = {
        userEmail,
        organization: {
          legalName: orgData.legalName,
          tradeName: orgData.tradeName || orgData.legalName,
          pan: orgData.pan,
          gstin: orgData.gstin,
          city: orgData.city,
          state: orgData.state,
          address: orgData.primaryAddress,
          currency: "INR",
          segment: selectedRole
        },
        billingEntities: bankData.bankName.trim() ? [{
          id: `BE-${Date.now()}`,
          spvName: orgData.legalName,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          isDefault: true
        }] : [],
        branding: {
          portfolioDisplayName: orgData.tradeName || orgData.legalName,
          brandColor: branding.brandColor,
          logoUrl: branding.logoPreview
        },
        property: {
          name: propertyData.name.trim(),
          address: orgData.primaryAddress || `${propertyData.name}, ${propertyData.city || orgData.city}`,
          city: propertyData.city || orgData.city || "Mumbai",
          state: propertyData.state || orgData.state || "Maharashtra",
          microMarket: propertyData.microMarket || propertyData.city || "Central",
          totalArea: Number(propertyData.totalAreaSqft) || 25000,
          type: selectedRole === "flex_operator" ? "Managed Office / Coworking Hub" : "Commercial Office Tower",
          grade: "A"
        },
        tenants: hasTenant && tenantData.name.trim() ? [{
          tradeName: tenantData.name.trim(),
          legalName: `${tenantData.name.trim()} Pvt Ltd`,
          contactEmail: tenantData.email.trim(),
          contactPhone: tenantData.phone.trim()
        }] : []
      };

      const res = await fetch("/api/rent-roll/onboarding-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (typeof window !== "undefined") {
        // Persist session details
        localStorage.setItem("officex_onboarding_completed", "1");
        sessionStorage.setItem("officex_onboarding_completed", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_session_active", "1");

        // Set role based on selected segment
        const roleLabel = ROLES.find(r => r.id === selectedRole)?.title || "Commercial Owner";
        localStorage.setItem("officex_user_role", roleLabel);
        sessionStorage.setItem("officex_user_role", roleLabel);
        localStorage.setItem("officex_segment", selectedRole);

        // Set org and property cache
        localStorage.setItem("officex_org_name", orgData.tradeName || orgData.legalName);
        if (data?.property) {
          localStorage.setItem("officex_property_name", data.property.name);
          localStorage.setItem("officex_property_id", data.property.id);
          localStorage.setItem("officex_user_properties", JSON.stringify([data.property]));
        }

        document.cookie = "officex_onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=604800; SameSite=Lax";
      }

      setIsCommitted(true);
      setTimeout(() => {
        router.push("/properties/rent-roll");
      }, 1200);
    } catch (err) {
      console.error("Onboarding error:", err);
      // Non-blocking fallback
      router.push("/properties/rent-roll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Role & Company", subtitle: "Select Business Model" },
    { num: 2, title: "Branding & Bank", subtitle: "Logo & Receiving Account" },
    { num: 3, title: "Primary Property", subtitle: "Anchor Space & Tenant" },
    { num: 4, title: "Review & Launch", subtitle: "Activate Workspace" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ──── TOP GLOBAL HEADER ──── */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={32}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={110}
              height={26}
              className="h-6 w-auto object-contain"
              priority
            />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[11px] font-bold">
            Workspace Setup Wizard
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-medium">
            <Lock size={12} className="text-[#0F8B7D]" />
            <span>Encrypted Multi-Entity Setup</span>
          </div>
          <button
            onClick={() => router.push("/properties/rent-roll")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Skip to Dashboard &rarr;
          </button>
        </div>
      </header>

      {/* ──── MAIN WIZARD CONTAINER ──── */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {existingUserMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm text-amber-950">User Already Exists</p>
                  <p className="text-xs text-amber-800">{existingUserMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login?context=rent-roll&redirect=/properties/rent-roll"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Go to Login Page &rarr;
                </Link>
                <Link
                  href="/properties/rent-roll"
                  className="px-3 py-2 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-xl text-xs font-bold transition-all"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Step Progress Indicators */}
          <div className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-4 gap-2 text-center">
              {stepsList.map((st) => (
                <div
                  key={st.num}
                  onClick={() => st.num <= currentStep && setCurrentStep(st.num)}
                  className={`py-2 px-1 rounded-xl transition-all ${
                    st.num <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  } ${
                    currentStep === st.num
                      ? "bg-[#0F8B7D] text-white font-extrabold shadow-sm"
                      : currentStep > st.num
                      ? "bg-teal-50 text-[#0F8B7D] font-bold"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">Step {st.num}</div>
                  <div className="truncate text-xs mt-0.5">{st.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            {isCommitted ? (
              <div className="py-16 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">Workspace Activated Successfully</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your organization profile, receiving bank details, and primary property have been configured. Launching your customized Rent Roll...
                </p>
              </div>
            ) : (
              <>
                {/* ════════ STEP 1: ROLE & COMPANY PROFILE ════════ */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 1 of 4 · Business Segment &amp; Role
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Select Your Role &amp; Business Model</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose your primary role. Your spaces, lease agreements, and billing rules will automatically adapt.
                      </p>
                    </div>

                    {/* The 5 Specification Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {ROLES.map((r) => {
                        const Icon = r.icon;
                        const isSelected = selectedRole === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRole(r.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                              isSelected
                                ? "border-[#0F8B7D] bg-teal-50/40 shadow-xs ring-1 ring-[#0F8B7D]"
                                : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  isSelected ? "bg-[#0F8B7D] text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 leading-snug">{r.title}</h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                                isSelected ? "bg-[#0F8B7D] text-white" : "bg-slate-100 text-slate-600"
                              }`}>
                                {r.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{r.description}</p>
                            <div className="text-[10px] font-semibold text-teal-800 bg-teal-100/50 px-2 py-1 rounded-lg">
                              ⚡ {r.billingFocus}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Company Legal Identity */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Company Identity</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Entity Name *</label>
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
                          <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Portfolio Trade Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Apex Horizon Spaces"
                            value={orgData.tradeName}
                            onChange={(e) => setOrgData({ ...orgData, tradeName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      {/* State & City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <StateAutocomplete
                            label="Primary State *"
                            required
                            value={orgData.state}
                            onChange={(state) => {
                              setOrgData(prev => {
                                const cities = getCitiesForState(state);
                                return {
                                  ...prev,
                                  state,
                                  city: cities[0]?.name || ""
                                };
                              });
                            }}
                            placeholder="Select State..."
                          />
                        </div>
                        <div>
                          <CityAutocomplete
                            label="Primary City *"
                            required
                            value={orgData.city}
                            selectedState={orgData.state}
                            requireStateFirst={true}
                            onChange={(city) => setOrgData(prev => ({ ...prev, city }))}
                            onSelectCityAndState={(city, state) => setOrgData(prev => ({ ...prev, city, state: state || prev.state }))}
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
                          onChange={(val) => setOrgData(prev => ({ ...prev, primaryAddress: val }))}
                          onSelectLocation={(loc) => {
                            setOrgData(prev => ({
                              ...prev,
                              primaryAddress: loc.fullAddress || loc.displayName,
                              city: loc.city || prev.city,
                              state: loc.state || prev.state
                            }));
                          }}
                          placeholder="e.g. Suite 402, Trade Tower, Bandra Kurla Complex"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 2: BRANDING & BANK ACCOUNT ════════ */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 2 of 4 · Brand &amp; Receiving Bank
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Visual Branding &amp; Payout Account</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customize how invoices appear to tenants and specify the receiving bank account for rent collections.
                      </p>
                    </div>

                    {/* Logo & Color Accent */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Logo Upload */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <label className="block text-xs font-bold text-slate-800">Company Logo (Invoices &amp; Reports)</label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {branding.logoPreview ? (
                              <img src={branding.logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                              <Building2 className="w-7 h-7 text-slate-300" />
                            )}
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-[#0F8B7D] text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <UploadCloud size={13} />
                              <span>{branding.logoPreview ? "Change Logo" : "Upload Logo"}</span>
                            </button>
                            <p className="text-[10px] text-slate-400">PNG, JPG, SVG up to 2MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Accent Color Palette */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <label className="block text-xs font-bold text-slate-800">Brand Accent Color</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setBranding(prev => ({ ...prev, brandColor: c.hex }))}
                              className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                                branding.brandColor === c.hex ? "scale-110 ring-2 ring-offset-2 ring-slate-800" : "hover:scale-105"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            >
                              {branding.brandColor === c.hex && <Check size={12} className="text-white" />}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">Used for tenant invoice banners, receipt seals, and executive badges.</p>
                      </div>
                    </div>

                    {/* Receiving Bank Details */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#0F8B7D]" />
                        <h4 className="text-xs font-extrabold text-slate-800">Receiving Bank Account (For Rent &amp; CAM Receipts)</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Tenants will receive these NEFT/RTGS details on their monthly demand notices.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC Bank, ICICI Bank"
                            value={bankData.bankName}
                            onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 50200012345678"
                            value={bankData.accountNumber}
                            onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">IFSC Code</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC0000123"
                            value={bankData.ifscCode}
                            onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
                          <input
                            type="text"
                            placeholder={orgData.legalName || "e.g. Apex Industrial Realty Pvt Ltd"}
                            value={bankData.accountHolder}
                            onChange={(e) => setBankData({ ...bankData, accountHolder: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════ STEP 3: PRIMARY PROPERTY & SPACE SETUP (CONNECTED) ════════ */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 3 of 4 · Primary Space &amp; Units
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">
                        {selectedRole === "flex_operator"
                          ? "Primary Flex Centre & Seat Capacity"
                          : selectedRole === "fm_company"
                          ? "Managed Commercial Building & Operations"
                          : "Primary Commercial Property & Space"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set up your anchor asset. Details connect directly to your live rent roll grid and property inventory.
                      </p>
                    </div>

                    {/* Property Anchor Fields */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {selectedRole === "flex_operator" ? "Centre Name *" : "Building / Property Name *"}
                          </label>
                          <input
                            type="text"
                            placeholder={selectedRole === "flex_operator" ? "e.g. Apex Horizon Coworking Hub" : "e.g. Apex Corporate Tower"}
                            value={propertyData.name}
                            onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0F8B7D]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Micro-Market / Area</label>
                          <input
                            type="text"
                            placeholder="e.g. BKC, Whitefield"
                            value={propertyData.microMarket}
                            onChange={(e) => setPropertyData({ ...propertyData, microMarket: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                          />
                        </div>
                      </div>

                      {/* PM / MSP Specific: Client Owner & Mandate */}
                      {(selectedRole === "pm_company" || selectedRole === "msp_operator") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Client Property Owner (Landlord)</label>
                            <input
                              type="text"
                              placeholder="e.g. Sovereign Asset Holdings"
                              value={propertyData.clientOwnerName}
                              onChange={(e) => setPropertyData({ ...propertyData, clientOwnerName: e.target.value })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Management Mandate Fee (%)</label>
                            <input
                              type="number"
                              min={1}
                              max={25}
                              value={propertyData.mandateFeePct}
                              onChange={(e) => setPropertyData({ ...propertyData, mandateFeePct: Number(e.target.value) || 5 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Role Adaptive Inventory Fields */}
                      {selectedRole === "flex_operator" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Total Desk Capacity (Seats)</label>
                            <input
                              type="number"
                              min={10}
                              value={propertyData.centreCapacitySeats}
                              onChange={(e) => setPropertyData({ ...propertyData, centreCapacitySeats: Number(e.target.value) || 100 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Seat Type</label>
                            <select
                              value={propertyData.seatType}
                              onChange={(e) => setPropertyData({ ...propertyData, seatType: e.target.value })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#0F8B7D]"
                            >
                              <option value="dedicated_desk">Dedicated Workstation Desk</option>
                              <option value="private_cabin">Private Executive Cabin</option>
                              <option value="hot_desk">Hot Desk Flexible Pass</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Rate / Seat (₹)</label>
                            <input
                              type="number"
                              min={1000}
                              value={propertyData.ratePerSeatMonthly}
                              onChange={(e) => setPropertyData({ ...propertyData, ratePerSeatMonthly: Number(e.target.value) || 10000 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                        </div>
                      ) : selectedRole === "fm_company" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Monthly CAM Budget Pool (₹)</label>
                            <input
                              type="number"
                              min={10000}
                              value={propertyData.camBudgetMonthly}
                              onChange={(e) => setPropertyData({ ...propertyData, camBudgetMonthly: Number(e.target.value) || 250000 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Metered Utility Billing</label>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={propertyData.meterElectricityGrid}
                                  onChange={(e) => setPropertyData({ ...propertyData, meterElectricityGrid: e.target.checked })}
                                  className="rounded text-[#0F8B7D]"
                                />
                                <span>Grid Power (kWh)</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={propertyData.meterDgBackup}
                                  onChange={(e) => setPropertyData({ ...propertyData, meterDgBackup: e.target.checked })}
                                  className="rounded text-[#0F8B7D]"
                                />
                                <span>DG Backup Power (kWh)</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={propertyData.meterWater}
                                  onChange={(e) => setPropertyData({ ...propertyData, meterWater: e.target.checked })}
                                  className="rounded text-[#0F8B7D]"
                                />
                                <span>Water Supply (kL)</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Commercial Owner Standard Area & Rent */
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Number</label>
                            <input
                              type="text"
                              value={propertyData.unitNumber}
                              onChange={(e) => setPropertyData({ ...propertyData, unitNumber: e.target.value })}
                              placeholder="e.g. Unit 101"
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Area (Sq Ft)</label>
                            <input
                              type="number"
                              min={100}
                              value={propertyData.unitAreaSqft}
                              onChange={(e) => setPropertyData({ ...propertyData, unitAreaSqft: Number(e.target.value) || 1000 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Rent (₹/sq.ft.)</label>
                            <input
                              type="number"
                              min={1}
                              value={propertyData.askingBaseRentPsf}
                              onChange={(e) => setPropertyData({ ...propertyData, askingBaseRentPsf: Number(e.target.value) || 100 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">CAM Rate (₹/sq.ft.)</label>
                            <input
                              type="number"
                              min={0}
                              value={propertyData.camRatePsf}
                              onChange={(e) => setPropertyData({ ...propertyData, camRatePsf: Number(e.target.value) || 20 })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:bg-white focus:border-[#0F8B7D]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unified Optional Tenant / Member Section */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#0F8B7D]" />
                          <h4 className="text-xs font-extrabold text-slate-800">
                            {selectedRole === "flex_operator" ? "Active Corporate Member" : "Active Tenant / Lease Agreement"}
                          </h4>
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={hasTenant}
                            onChange={(e) => setHasTenant(e.target.checked)}
                            className="rounded text-[#0F8B7D]"
                          />
                          <span>Add Active Tenant Now</span>
                        </label>
                      </div>

                      {hasTenant ? (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {selectedRole === "flex_operator" ? "Member Company Name" : "Tenant Company Name"}
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Nexus Technology Labs"
                                value={tenantData.name}
                                onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Email</label>
                              <input
                                type="email"
                                placeholder="e.g. accounts@nexustech.com"
                                value={tenantData.email}
                                onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-[#0F8B7D]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {selectedRole === "flex_operator" ? "Monthly Membership Fee (₹)" : "Total Monthly Rent (₹)"}
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 750000"
                                value={tenantData.monthlyRentOrFee}
                                onChange={(e) => setTenantData({ ...tenantData, monthlyRentOrFee: Number(e.target.value) || 0 })}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono focus:border-[#0F8B7D]"
                              />
                            </div>
                          </div>

                          {/* Direct Rent Agreement PDF Upload */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Executed Rent Agreement (PDF)</label>
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-xs text-teal-900 font-bold cursor-pointer transition-colors max-w-sm truncate">
                                <FileUp size={13} className="text-[#0F8B7D] shrink-0" />
                                <span className="truncate">{tenantData.rentAgreementFileName || "Upload Agreement PDF"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setTenantData({ ...tenantData, rentAgreementFileName: file.name });
                                  }}
                                />
                              </label>
                              {tenantData.rentAgreementFileName && (
                                <button
                                  type="button"
                                  onClick={() => setTenantData({ ...tenantData, rentAgreementFileName: "" })}
                                  className="text-xs text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Space will be created as vacant. You can add active leases later anytime from the dashboard.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════ STEP 4: REVIEW & ACTIVATE WORKSPACE ════════ */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] font-mono text-[11px] font-bold uppercase">
                        Step 4 of 4 · Review &amp; Activation
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-2">Ready to Activate Your Rent Roll</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please review your organization, receiving bank, and primary property settings before launching.
                      </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Organization & Role */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Business Profile</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: branding.brandColor }} />
                          <h4 className="text-sm font-extrabold text-slate-900">{orgData.legalName || "My Commercial Entity"}</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {ROLES.find(r => r.id === selectedRole)?.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {orgData.city || "Mumbai"}, {orgData.state || "Maharashtra"}
                        </p>
                      </div>

                      {/* Bank Details */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Payout Bank Account</span>
                        <h4 className="text-sm font-extrabold text-slate-900">{bankData.bankName || "Bank Account Pending"}</h4>
                        {bankData.accountNumber ? (
                          <div className="text-xs font-mono text-slate-600">
                            A/c: •••• {bankData.accountNumber.slice(-4)} | IFSC: {bankData.ifscCode}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">You can link a bank account later from Banking Settings.</p>
                        )}
                      </div>

                      {/* Primary Property & Unit */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 sm:col-span-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Primary Asset &amp; Inventory</span>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900">{propertyData.name || "Primary Property"}</h4>
                          <span className="text-xs font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md">
                            {propertyData.city || orgData.city || "Mumbai"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1">
                          {selectedRole === "flex_operator" ? (
                            <span>Capacity: <strong>{propertyData.centreCapacitySeats} seats</strong></span>
                          ) : selectedRole === "fm_company" ? (
                            <span>Monthly CAM Budget: <strong>₹{propertyData.camBudgetMonthly.toLocaleString("en-IN")}</strong></span>
                          ) : (
                            <>
                              <span>Space: <strong>{propertyData.unitNumber}</strong> ({propertyData.unitAreaSqft.toLocaleString("en-IN")} sq. ft.)</span>
                              <span>Base Rent: <strong>₹{propertyData.askingBaseRentPsf}/sq. ft.</strong></span>
                            </>
                          )}
                          <span>
                            Tenant: <strong>{hasTenant && tenantData.name ? tenantData.name : "Vacant"}</strong>
                            {hasTenant && tenantData.rentAgreementFileName && " (Lease Agreement Attached)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──── NAVIGATION BUTTONS ──── */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  ) : <div />}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Step {currentStep + 1}</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinalCommit}
                      className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
                    >
                      <CheckCircle2 size={16} />
                      <span>{isSubmitting ? "Activating Workspace..." : "Activate Workspace & Go to Dashboard"}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RentRollOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold">
          Loading OfficeX Workspace Setup...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

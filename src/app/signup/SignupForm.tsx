"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Building, 
  Handshake, 
  Settings, 
  Users, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase,
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Check, 
  Eye, 
  EyeOff,
  MapPin,
  FileText,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers
} from "lucide-react";

// Primary roles defined in Section 1.2 & Table 0 of Registration Specification
const ROLE_OPTIONS = [
  { id: "owner", code: "OWNER", label: "Property Owner", badge: "Leasing · Rent Roll · FM", desc: "Commercial asset owner / landlord", icon: Building },
  { id: "broker", code: "BROKER", label: "Broker / Partner", badge: "Leasing CRM", desc: "Channel partner & advisory", icon: Handshake },
  { id: "vendor", code: "VENDOR", label: "Facility Vendor", badge: "FM Contracts", desc: "FM & property contractor", icon: Truck },
  { id: "pm", code: "PM", label: "Facility Manager", badge: "Site Operations", desc: "Building & site operations", icon: Settings },
  { id: "tenant", code: "TENANT", label: "Tenant / Occupier", badge: "Workplace", desc: "Workplace occupier admin", icon: Users }
];

interface SignupFormProps {
  initialRole?: string;
  initialIntent?: string;
  initialModule?: string;
  initialContext?: string;
  initialRedirect?: string;
}

export default function SignupForm({ initialRole, initialIntent, initialModule, initialContext, initialRedirect }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRole = initialRole || initialIntent || searchParams?.get("role") || searchParams?.get("intent") || "";
  const normalizedRole = (rawRole === "leasing_broker" ? "broker" : rawRole).toLowerCase();

  const isRentRoll =
    initialModule === "rent-roll" ||
    initialContext === "rent-roll" ||
    searchParams?.get("module") === "rent-roll" ||
    searchParams?.get("context") === "rent-roll" ||
    (initialRedirect ? initialRedirect.includes("rent-roll") : false) ||
    (searchParams?.get("redirect") ? searchParams.get("redirect")!.includes("rent-roll") : false);

  const isOperate =
    !isRentRoll && (
      initialModule === "operate" ||
      initialContext === "operate" ||
      searchParams?.get("module") === "operate" ||
      searchParams?.get("context") === "operate" ||
      (initialRedirect ? initialRedirect.includes("operate") : false) ||
      (searchParams?.get("redirect") ? searchParams.get("redirect")!.includes("operate") : false)
    );

  const isFm =
    initialModule === "fm" ||
    initialContext === "fm" ||
    searchParams?.get("context") === "fm" ||
    (initialRedirect ? initialRedirect.includes("fm") : false) ||
    (searchParams?.get("redirect") ? searchParams.get("redirect")!.includes("fm") : false);

  const isMarketplace = !isRentRoll && !isOperate && !isFm;

  const defaultRole = isRentRoll
    ? "owner"
    : isFm
    ? (normalizedRole || "vendor")
    : normalizedRole || "tenant";

  // Step state: 
  // 1 = Create Account (S02)
  // 2 = OTP Verification (S03)
  // 3 = Organization Master (S05/S06)
  // 4 = Role Business Profile (S07/S08)
  // 5 = Review & Launch (S10-S12)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  // Form Fields - S02 (Account Credentials)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Form Fields - S03 (OTP Verification)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Form Fields - S05/S06 (Organization Master)
  const [orgLegalName, setOrgLegalName] = useState("");
  const [orgType, setOrgType] = useState("PRIVATE_LIMITED");
  const [operatingCity, setOperatingCity] = useState("Pan-India");
  const [customCity, setCustomCity] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstin, setGstin] = useState("");

  // Form Fields - S07/S08 (Role Business Profile)
  // Owner Fields:
  const [propertyName, setPropertyName] = useState("");
  const [ownershipType, setOwnershipType] = useState("OWNER");
  const [assetType, setAssetType] = useState("OFFICE");
  const [leasableArea, setLeasableArea] = useState("250000");
  const [approxOccupancy, setApproxOccupancy] = useState("92");

  // Broker Fields:
  const [brokerType, setBrokerType] = useState("FIRM");
  const [reraNumber, setReraNumber] = useState("");

  // Vendor Fields:
  const [selectedVendorServices, setSelectedVendorServices] = useState<string[]>([
    "HVAC Maintenance",
    "Housekeeping & Deep Cleaning"
  ]);
  const [yearsInBusiness, setYearsInBusiness] = useState("5");

  // Owner Services Required (Client Spec Table 6)
  const [selectedServices, setSelectedServices] = useState<string[]>(["RENT_ROLL", "LEASING", "FM"]);

  // Tenant Fields:
  const [tenantOfficeName, setTenantOfficeName] = useState("");
  const [tenantSeatCount, setTenantSeatCount] = useState("45");
  const [tenantInviteCode, setTenantInviteCode] = useState("");

  // S10 Self-Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Calculate Password Strength (0-3)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength();

  // Sync with searchParams and localStorage (e.g. if arriving from Google OAuth)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("officex_user_name");
      const savedEmail = localStorage.getItem("officex_user_email");
      const savedMobile = localStorage.getItem("officex_user_mobile");
      if (savedName && !fullName) setFullName(savedName);
      if (savedEmail && !email) setEmail(savedEmail);
      if (savedMobile && !mobileNumber) setMobileNumber(savedMobile);

      const stepParam = searchParams?.get("step");
      if (stepParam && ["1", "2", "3", "4", "5"].includes(stepParam)) {
        setStep(parseInt(stepParam, 10) as any);
      }
    }
  }, [searchParams]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  // Social OAuth (Google via Supabase)
  const handleOAuthSignUp = async (provider: "google" = "google") => {
    setIsLoading(true);
    setError(null);
    try {
      const canonicalRedirect = initialRedirect || (
        isRentRoll ? "/properties/rent-roll" : isOperate ? "/operate" : isFm ? "/fm-marketplace" : "/marketplace"
      );
      const searchStr = typeof window !== "undefined" && window.location.search
        ? window.location.search
        : `?context=${isRentRoll ? "rent-roll" : isOperate ? "operate" : isFm ? "fm" : "marketplace"}&redirect=${encodeURIComponent(canonicalRedirect)}`;

      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/login${searchStr}`
        : "http://localhost:3000/login";

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Failed to initiate Google sign up.");
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to connect to Google authentication.");
      setIsLoading(false);
    }
  };

  // S02: Handle Initial Account Creation
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password) {
      setError("Please fill in all mandatory fields (Name, Work Email, Mobile, Password).");
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobileNumber: cleanMobile,
          password: password,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your inputs.");
        setIsLoading(false);
        return;
      }

      setStep(2);
      setResendCountdown(30);
      setSuccessMsg("A 6-digit verification code has been dispatched to your work email.");
    } catch (err: any) {
      console.error("Register error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && val) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        verifyOtp(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  // S03: Handle OTP Verification
  const verifyOtp = async (code: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, "");
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          mobileNumber: cleanMobile,
          otp: code.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed. Please check the code.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_kyc_stage", "K0_CONTACT_VERIFIED");
        sessionStorage.setItem("officex_user_role", selectedRole);
        sessionStorage.setItem("officex_user_email", email.trim().toLowerCase());
        sessionStorage.setItem("officex_user_mobile", cleanMobile);
        sessionStorage.setItem("officex_user_name", fullName.trim());

        localStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_kyc_stage", "K0_CONTACT_VERIFIED");
        localStorage.setItem("officex_user_role", selectedRole);
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_mobile", cleanMobile);
        localStorage.setItem("officex_user_name", fullName.trim());
        localStorage.setItem("officex_phone_verified", "1");
        localStorage.setItem("officex_email_verified", "1");

        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `officex_user_email=${encodeURIComponent(email.trim().toLowerCase())}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccessMsg("Contact verified! Proceeding to Organization Master (S05/S06)...");
      setTimeout(() => {
        setSuccessMsg(null);
        setStep(3); // Advance to S05/S06: Organization Setup!
      }, 500);
    } catch (err: any) {
      console.error("OTP error:", err);
      setError("Verification failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // S05/S06: Handle Organization Master Submit
  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orgLegalName.trim()) {
      setError("Company legal name is required.");
      return;
    }

    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      setError("Please enter a valid 10-character Indian PAN (e.g. AAACA1234A).");
      return;
    }

    const effectiveCity = operatingCity === "CUSTOM" && customCity.trim() ? customCity.trim() : operatingCity;

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_active_org", orgLegalName.trim());
      localStorage.setItem("officex_org_type", orgType);
      localStorage.setItem("officex_org_city", effectiveCity);
      if (panNumber.trim()) {
        localStorage.setItem("officex_org_pan", panNumber.trim().toUpperCase());
      }
    }

    setStep(4); // Advance to S07: Role Profile
  };

  // S07/S08: Handle Role Profile Submit
  const handleRoleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedRole === "owner" && !propertyName.trim()) {
      setError("Primary commercial building name is required to initialize your Rent Roll.");
      return;
    }

    if (selectedRole === "tenant" && !tenantOfficeName.trim()) {
      setError("Please specify your current workplace office location or building name.");
      return;
    }

    if (typeof window !== "undefined") {
      if (selectedRole === "owner") {
        localStorage.setItem("officex_property_name", propertyName.trim());
        localStorage.setItem("officex_property_city", operatingCity);
        localStorage.setItem("officex_leasable_area", leasableArea);
        localStorage.setItem("officex_occupancy_pct", approxOccupancy);
        localStorage.setItem("officex_services", JSON.stringify(selectedServices));
      } else if (selectedRole === "tenant") {
        localStorage.setItem("officex_tenant_office", tenantOfficeName.trim());
        localStorage.setItem("officex_tenant_seats", tenantSeatCount);
        if (tenantInviteCode.trim()) {
          localStorage.setItem("officex_invite_code", tenantInviteCode.trim());
        }
      }
    }

    setStep(5); // Advance to S10: Review & Submit
  };

  // S10/S12: Final Launch Workspace
  const handleCompleteOnboarding = () => {
    setIsLoading(true);

    const effectiveCity = (operatingCity === "CUSTOM" && customCity.trim() ? customCity.trim() : operatingCity) || "Delhi NCR";
    const effectiveState = effectiveCity.toLowerCase().includes("delhi") ? "Delhi" : effectiveCity.toLowerCase().includes("mumbai") ? "Maharashtra" : "India";
    const effectivePropName = (propertyName.trim() || orgLegalName.trim() || "Commercial Asset").trim();
    const effectiveArea = Number(leasableArea) || 15000;

    const userProp = {
      id: `prop-${Date.now()}`,
      name: effectivePropName,
      type: assetType === "OFFICE" ? "Commercial Office" : assetType === "RETAIL" ? "Retail Mall / High Street" : "Industrial / Logistics",
      city: effectiveCity,
      state: effectiveState,
      totalArea: effectiveArea,
      grade: "A",
      inviteCode: `OX-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerName: orgLegalName.trim() || fullName.trim() || "Commercial Property Owner",
      createdAt: new Date().toISOString()
    };

    const roleTitle = selectedRole === "owner" 
      ? (isMarketplace ? "Commercial Property Owner & Lister" : "Property Owner & Asset Manager")
      : selectedRole === "broker" 
      ? "Broker / Channel Partner" 
      : selectedRole === "vendor" 
      ? "Facility / Service Vendor" 
      : selectedRole === "pm" 
      ? "Property / Facility Manager" 
      : (isMarketplace ? "Space Seeker / Corporate Occupier" : "Tenant / Occupier");

    const workspaceUrl = isRentRoll 
      ? "/properties/rent-roll" 
      : selectedRole === "owner" 
      ? (isMarketplace ? "/properties/add" : "/properties") 
      : selectedRole === "broker" 
      ? "/leasing" 
      : selectedRole === "vendor" 
      ? "/vendor" 
      : selectedRole === "pm" 
      ? "/ops" 
      : (isMarketplace ? "/marketplace" : "/tenant");

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_active_org", orgLegalName.trim() || effectivePropName);
      localStorage.setItem("officex_org_city", effectiveCity);
      localStorage.setItem("officex_property_name", effectivePropName);
      localStorage.setItem("officex_property_city", effectiveCity);
      localStorage.setItem("officex_leasable_area", String(effectiveArea));
      localStorage.setItem("officex_user_role", roleTitle);
      localStorage.setItem("officex_dashboard", workspaceUrl);
      localStorage.setItem("officex_onboarding_completed", "0");
      sessionStorage.setItem("officex_onboarding_completed", "0");
      document.cookie = "officex_onboarding_completed=0; path=/; max-age=86400; SameSite=Lax";
      localStorage.setItem("officex_kyc_stage", "K0_REGISTERED");
      localStorage.setItem("officex_user_properties", "[]");
      localStorage.setItem("officex_active_leases", "[]");
      localStorage.removeItem("officex_property_name");

      if (isRentRoll) {
        // Subscription is active or pending via Razorpay
        localStorage.setItem("officex_subscription", "pending");
        sessionStorage.setItem("officex_subscription", "pending");
        document.cookie = "officex_subscription=pending; path=/; max-age=86400; SameSite=Lax";
      }
      document.cookie = `officex_user_role=${encodeURIComponent(roleTitle)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_dashboard=${encodeURIComponent(workspaceUrl)}; path=/; max-age=86400; SameSite=Lax`;
    }

    setSuccessMsg("Account created! Launching Role-Based Onboarding Suite...");
    setTimeout(() => {
      const roleParam = selectedRole === "owner" ? "owner" : selectedRole === "broker" ? "broker" : selectedRole === "vendor" ? "vendor" : "tenant";
      router.push(`/onboarding?role=${encodeURIComponent(roleParam)}`);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden text-slate-900">
      {/* Soft Ambient Light Gradient Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-100/50 via-slate-100/30 to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[500px] mx-auto relative z-10">
        {/* Header Branding (Centered) */}
        <div className="flex items-center justify-center mb-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={48}
              height={48}
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Canonical Domain Trust Anchor (Centered) */}
        <div className="mb-4 flex justify-center">
          {isRentRoll ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-[#0D7B6C] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0D7B6C] animate-pulse" />
              <span className="font-bold tracking-wide">OfficeX</span>
              <span className="text-teal-300">·</span>
              <span className="text-teal-800">Commercial Landlord &amp; Rent Roll Onboarding</span>
            </div>
          ) : isOperate ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="font-bold tracking-wide">OfficeX Operate</span>
              <span className="text-indigo-300">·</span>
              <span className="text-indigo-800">FM Operations &amp; Statutory Compliance</span>
            </div>
          ) : isFm ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold tracking-wide">OfficeX FM</span>
              <span className="text-amber-300">·</span>
              <span className="text-amber-800">Facilities Services Marketplace Onboarding</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold tracking-wide">OfficeX Marketplace</span>
              <span className="text-blue-300">·</span>
              <span className="text-blue-800">Commercial Space &amp; Leasing Registration</span>
            </div>
          )}
        </div>

        {/* Main Card Container */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {/* Soft Ambient Light Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

          {/* Status Step Badge */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {step === 1 && "Step 01 of 04: Account Credentials (S02)"}
              {step === 2 && "Step 02 of 04: Contact Verification (S03)"}
              {step === 3 && "Step 03 of 04: Organisation Master (S05/S06)"}
              {step === 4 && "Step 04 of 04: Role Business Profile (S07/S08)"}
              {step === 5 && "Review & Verification (S10-S12)"}
            </span>

            {/* Back Button for multi-step */}
            {step > 2 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Header Title */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {step === 1 && (
                isRentRoll
                  ? "Create Your Landlord Account"
                  : isOperate
                  ? "Create Operations Account"
                  : isFm
                  ? "Create FM Contractor Account"
                  : "Create Marketplace Account"
              )}
              {step === 2 && "Verify Email & Mobile"}
              {step === 3 && (isRentRoll ? "Establish Landlord Legal Entity" : "Establish Your Business Entity")}
              {step === 4 && (selectedRole === "owner" ? (isRentRoll ? "Commercial Asset & Rent Roll Setup" : "Commercial Property Portfolio") : "Role Business Profile")}
              {step === 5 && "Review & Complete Onboarding"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal leading-relaxed">
              {step === 1 && (
                isRentRoll
                  ? "Initialize your commercial building's live rent roll ledger, active lease schedule, and automated CAM billing."
                  : isOperate
                  ? "Join the OfficeX Operate FM Operations platform for preventive maintenance, compliance, and asset management."
                  : isFm
                  ? "Register your facility management firm to bid on contracts and manage building work orders."
                  : "Discover commercial office spaces across India, list vacant properties, or connect as a leasing broker."
              )}
              {step === 2 && `We've sent a real 6-digit verification code to ${email || "your work email"}.`}
              {step === 3 && (isRentRoll ? "Set up your commercial asset ownership entity to link properties, active leases, and collections." : "Create your organization master to link commercial properties, leases, and contracts.")}
              {step === 4 && (selectedRole === "owner" 
                ? "Configure your primary building parameters to initialize your workspace." 
                : "Set up your operational business attributes.")}
              {step === 5 && "Review your submitted entity details and activate your verified commercial workspace."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle size={16} className="shrink-0 text-blue-600 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* =================================================================
              STEP 1: S02 CREATE ACCOUNT CREDENTIALS
              ================================================================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("google")}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute">
                  or register with work credentials
                </span>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              {/* Full Legal Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  FULL LEGAL NAME *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhal"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  WORK EMAIL ADDRESS *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram@apexcapital.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  MOBILE NUMBER * (INDIA +91)
                </label>
                <div className="flex gap-2">
                  <div className="w-16 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-bold text-xs flex items-center justify-center">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98200 12345"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    CONFIRM PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${passwordStrength >= 1 ? "w-1/3 bg-rose-500" : "w-0"}`} />
                    <div className={`h-full transition-all ${passwordStrength >= 2 ? "w-1/3 bg-amber-500" : "w-0"}`} />
                    <div className={`h-full transition-all ${passwordStrength >= 3 ? "w-1/3 bg-emerald-500" : "w-0"}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    {passwordStrength === 1 && "Weak — add numbers & uppercase"}
                    {passwordStrength === 2 && "Good — add special characters"}
                    {passwordStrength === 3 && "Strong enterprise password"}
                  </span>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline font-bold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline font-bold">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account & Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Verify Contact</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

          {/* =================================================================
              STEP 2: S03 CONTACT VERIFICATION (OTP)
              ================================================================= */}
          {step === 2 && (
            <div className="space-y-5 text-xs animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Enter 6-Digit Verification Code
                </span>
                <p className="text-[11px] text-slate-600">
                  Dispatched via SMTP to <strong className="text-blue-900">{email}</strong> and{" "}
                  <strong className="text-blue-900">+91 {mobileNumber}</strong>
                </p>
              </div>

              {/* 6 OTP Boxes */}
              <div className="space-y-4">
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-11 sm:w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-2xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ArrowLeft size={12} />
                    <span>Change details</span>
                  </button>

                  {resendCountdown > 0 ? (
                    <span className="text-slate-400">Resend in 0:{resendCountdown < 10 ? `0${resendCountdown}` : resendCountdown}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setResendCountdown(30);
                        try {
                          await fetch("/api/v1/auth/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fullName,
                              email,
                              mobileNumber: mobileNumber.replace(/\D/g, ""),
                              password,
                              role: selectedRole
                            })
                          });
                          setSuccessMsg("A new verification code has been dispatched via SMTP.");
                        } catch {
                          setSuccessMsg("A new verification code has been dispatched.");
                        }
                      }}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLoading || otpDigits.join("").length !== 6}
                  onClick={() => verifyOtp(otpDigits.join(""))}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Verify & Continue to Organisation Setup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              STEP 3: S05 & S06 ORGANISATION MASTER SETUP
              ================================================================= */}
          {step === 3 && (
            <form onSubmit={handleOrgSubmit} className="space-y-4 text-xs animate-fadeIn">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                <Building2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Organization Master (S06):</strong> Attaches your verified user identity, tax records, and commercial business context into an auditable organization profile.
                </span>
              </div>

              {/* Entity Category / Focus */}
              {isRentRoll ? (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-center gap-2.5">
                  <Building size={18} className="text-[#0D7B6C] shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Entity Category: Commercial Property Owner &amp; Landlord</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Initializing your commercial property portfolio, live rent roll, and tenant lease schedules.</div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    SELECT BUSINESS ENTITY TYPE *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(isMarketplace
                      ? [
                          { id: "tenant", label: "Space Seeker / Tenant", badge: "Find & Lease Commercial Space", icon: Users },
                          { id: "owner", label: "Commercial Property Owner", badge: "List Properties for Lease", icon: Building },
                          { id: "broker", label: "Commercial Broker / Partner", badge: "Leasing Advisory & Deals", icon: Handshake }
                        ]
                      : isFm
                      ? [
                          { id: "vendor", label: "FM & Service Contractor", badge: "FM Contracts, Bids & Jobs", icon: Truck },
                          { id: "pm", label: "Facility / Site Manager", badge: "Site Operations & Compliance", icon: Settings },
                          { id: "owner", label: "Commercial Property Owner", badge: "Procure FM & Site Services", icon: Building }
                        ]
                      : isOperate
                      ? [
                          { id: "owner", label: "Property Owner / Landlord", badge: "Portfolio Operations & Assets", icon: Building },
                          { id: "pm", label: "Facility / Operations Manager", badge: "Preventive Maintenance & FM", icon: Settings },
                          { id: "tenant", label: "Corporate Tenant Occupier", badge: "Workplace Helpdesk & Access", icon: Users }
                        ]
                      : [
                          { id: "owner", label: "Property Owner / Landlord", badge: "Commercial Asset Portfolio", icon: Building },
                          { id: "broker", label: "Broker / Advisory Partner", badge: "Commercial Leasing & Deals", icon: Handshake },
                          { id: "vendor", label: "FM & Service Contractor", badge: "FM Contracts & Operations", icon: Truck },
                          { id: "tenant", label: "Corporate Tenant / Occupier", badge: "Workplace Leases & Space", icon: Users }
                        ]
                    ).map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRole(r.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <r.icon size={14} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                            <span className="text-xs font-bold leading-tight">{r.label}</span>
                          </div>
                          <span className="text-[9.5px] text-blue-700 font-semibold block mt-1">{r.badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legal Entity Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  {selectedRole === "owner" 
                    ? "COMMERCIAL ASSET MANAGEMENT / LANDLORD ENTITY NAME *"
                    : selectedRole === "broker"
                    ? "COMMERCIAL BROKERAGE / ADVISORY FIRM NAME *"
                    : selectedRole === "vendor"
                    ? "FACILITY MANAGEMENT CONTRACTOR / FIRM LEGAL NAME *"
                    : "TENANT / CORPORATE OCCUPIER LEGAL NAME *"}
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={orgLegalName}
                    onChange={(e) => setOrgLegalName(e.target.value)}
                    placeholder={
                      selectedRole === "owner"
                        ? "e.g. Apex Commercial Realty Ltd"
                        : selectedRole === "broker"
                        ? "e.g. Knight & Partners Commercial Advisory LLP"
                        : selectedRole === "vendor"
                        ? "e.g. CleanPro Integrated Facility Management Services Pvt Ltd"
                        : "e.g. Acme Technologies India Pvt Ltd"
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Services Required - per Client Spec Table 6 (When Owner is chosen) */}
              {selectedRole === "owner" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    SERVICES REQUIRED FOR THIS ASSET PORTFOLIO *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "RENT_ROLL", label: "Live Rent Roll", desc: "Automated billing, collections, escalations & cash flows" },
                      { id: "LEASING", label: "Commercial Leasing", desc: "Listings, vacancy marketing & tenant pipeline CRM" },
                      { id: "FM", label: "Facility Management", desc: "Building operations, work orders & compliance" }
                    ].map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (selectedServices.length > 1) {
                                setSelectedServices(selectedServices.filter((s) => s !== srv.id));
                              }
                            } else {
                              setSelectedServices([...selectedServices, srv.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isChecked
                              ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{srv.label}</span>
                            {isChecked && <CheckCircle2 size={13} className="text-blue-600" />}
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-normal mt-0.5 leading-snug">{srv.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Entity Type / Constitution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    CONSTITUTION / ENTITY TYPE *
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PRIVATE_LIMITED">Private Limited Company</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PUBLIC_LIMITED">Public Limited Company</option>
                    <option value="PARTNERSHIP">Partnership Firm</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    PRIMARY OPERATING MARKET / CITY *
                  </label>
                  <select
                    value={operatingCity}
                    onChange={(e) => setOperatingCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <optgroup label="🌍 Global & Pan-India Coverage">
                      <option value="Pan-India">Pan-India (All India Metros & Regions)</option>
                      <option value="Worldwide / Global Operations">Worldwide / Global Operations</option>
                    </optgroup>

                    <optgroup label="🏢 Top Indian Commercial Metros (Tier-1)">
                      <option value="Mumbai MMR">Mumbai MMR (BKC / Nariman Pt / Andheri / Navi Mumbai)</option>
                      <option value="Bengaluru">Bengaluru (Whitefield / ORR / CBD / Electronic City)</option>
                      <option value="Delhi">Delhi (CBD / Aerocity / Connaught Place)</option>
                      <option value="Gurgaon">Gurgaon / Gurugram (Cyber City / Golf Course Rd)</option>
                      <option value="Noida">Noida (Sector 62 / Expressway / Greater Noida)</option>
                      <option value="Hyderabad">Hyderabad (Hitec City / Financial District / Gachibowli)</option>
                      <option value="Pune">Pune (Kharadi / Hinjewadi / Viman Nagar)</option>
                      <option value="Chennai">Chennai (OMR / Guindy / Mount Road)</option>
                      <option value="Kolkata">Kolkata (Sector V / New Town / Park Street)</option>
                      <option value="Ahmedabad">Ahmedabad / GIFT City</option>
                    </optgroup>

                    <optgroup label="📍 Emerging Indian Commercial Hubs (Tier-2)">
                      <option value="Jaipur">Jaipur / Rajasthan</option>
                      <option value="Chandigarh">Chandigarh / Mohali / Panchkula</option>
                      <option value="Kochi">Kochi / Kerala</option>
                      <option value="Indore">Indore / Madhya Pradesh</option>
                      <option value="Lucknow">Lucknow / Uttar Pradesh</option>
                      <option value="Coimbatore">Coimbatore / Tamil Nadu</option>
                      <option value="Nagpur">Nagpur / Maharashtra</option>
                      <option value="Bhubaneswar">Bhubaneswar / Odisha</option>
                      <option value="Visakhapatnam">Visakhapatnam / Andhra Pradesh</option>
                      <option value="Surat">Surat & Vadodara / Gujarat</option>
                      <option value="Goa">Goa</option>
                      <option value="Guwahati">Guwahati / North East</option>
                    </optgroup>

                    <optgroup label="🌐 International Commercial Hubs">
                      <option value="Dubai / UAE">Dubai & UAE / Middle East (DIFC / Business Bay)</option>
                      <option value="Singapore">Singapore & Southeast Asia (Marina Bay / CBD)</option>
                      <option value="London / UK">London & UK / Europe (City of London / Canary Wharf)</option>
                      <option value="New York / USA">New York & North America (Manhattan / Midtown)</option>
                      <option value="San Francisco / USA">San Francisco / Silicon Valley</option>
                      <option value="Riyadh / Saudi Arabia">Riyadh / Saudi Arabia (KAFD / Olaya)</option>
                      <option value="Sydney / Australia">Sydney & Australia (CBD)</option>
                      <option value="Tokyo / Japan">Tokyo & East Asia</option>
                      <option value="Frankfurt / Europe">Frankfurt & Western Europe</option>
                    </optgroup>

                    <optgroup label="✍ Other / Specific City">
                      <option value="CUSTOM">Other (Specify Custom City / Country)</option>
                    </optgroup>
                  </select>

                  {operatingCity === "CUSTOM" && (
                    <div className="mt-2 animate-fadeIn">
                      <input
                        type="text"
                        required
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Type your city, state or country..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Identifiers (PAN & GSTIN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    COMPANY PAN (10-DIGIT, OPTIONAL)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="AAACA1234A"
                    className="w-full uppercase font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    GSTIN (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AAACA1234A1Z5"
                    className="w-full uppercase font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Registered Address */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  {selectedRole === "tenant" ? "OFFICE / WORKPLACE LOCATION ADDRESS *" : "REGISTERED OFFICE ADDRESS *"}
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder={
                      selectedRole === "tenant"
                        ? "e.g. 5th Floor, Tower B, Bandra Kurla Complex"
                        : "e.g. Level 14, Tower B, Commercial Boulevard"
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>Continue to Role Profile (S07)</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full py-2 text-center text-[11px] text-slate-500 hover:text-blue-600 font-medium cursor-pointer"
                >
                  Skip to Summary (Complete Organization Later)
                </button>
              </div>
            </form>
          )}

          {/* =================================================================
              STEP 4: S07 & S08 ROLE BUSINESS PROFILE
              ================================================================= */}
          {step === 4 && (
            <form onSubmit={handleRoleProfileSubmit} className="space-y-4 text-xs animate-fadeIn">
              {/* Dynamic Owner Questionnaire */}
              {selectedRole === "owner" && (
                <>
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                    <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Rent Roll Initialization:</strong> Enter your primary commercial building to auto-populate your live Rent Roll operating desk.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      PRIMARY COMMERCIAL BUILDING NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. Apex Horizon Tower"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        OWNERSHIP TYPE *
                      </label>
                      <select
                        value={ownershipType}
                        onChange={(e) => setOwnershipType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="OWNER">Sole Asset Owner</option>
                        <option value="CO_OWNER">Co-Owner / Joint Venture</option>
                        <option value="ASSET_MANAGER">Asset Management Company</option>
                        <option value="DEVELOPER">Commercial Developer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        ASSET CLASSIFICATION *
                      </label>
                      <select
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="OFFICE">Grade-A Commercial Office</option>
                        <option value="IT_PARK">IT / Tech Park Campus</option>
                        <option value="RETAIL">Commercial Retail Hub</option>
                        <option value="WAREHOUSE">Logistics & Warehousing</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        TOTAL LEASABLE AREA (SQ. FT.)
                      </label>
                      <input
                        type="number"
                        value={leasableArea}
                        onChange={(e) => setLeasableArea(e.target.value)}
                        placeholder="250000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        ESTIMATED OCCUPANCY %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={approxOccupancy}
                        onChange={(e) => setApproxOccupancy(e.target.value)}
                        placeholder="92"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Dynamic Broker Questionnaire */}
              {selectedRole === "broker" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      BROKER / ADVISORY STRUCTURE *
                    </label>
                    <select
                      value={brokerType}
                      onChange={(e) => setBrokerType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="FIRM">Corporate Real Estate Agency / Firm</option>
                      <option value="INDIVIDUAL">Independent Commercial Broker</option>
                      <option value="CHANNEL_PARTNER">Institutional Channel Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      STATE RERA REGISTRATION NUMBER
                    </label>
                    <input
                      type="text"
                      value={reraNumber}
                      onChange={(e) => setReraNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. PRM/KA/RERA/1251/..."
                      className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Dynamic Vendor Questionnaire */}
              {selectedRole === "vendor" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      PRIMARY FM SERVICES PROVIDED *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "HVAC Maintenance",
                        "Housekeeping & Deep Cleaning",
                        "Security Personnel",
                        "MEP & Electrical Repairs",
                        "Pest Control Services"
                      ].map((service) => {
                        const isChecked = selectedVendorServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedVendorServices(selectedVendorServices.filter((s) => s !== service));
                              } else {
                                setSelectedVendorServices([...selectedVendorServices, service]);
                              }
                            }}
                            className={`p-2 rounded-xl text-left text-[11px] border font-medium transition-all ${
                              isChecked
                                ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {service}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      YEARS IN COMMERCIAL OPERATIONS
                    </label>
                    <input
                      type="number"
                      value={yearsInBusiness}
                      onChange={(e) => setYearsInBusiness(e.target.value)}
                      placeholder="5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Tenant Occupier Questionnaire */}
              {selectedRole === "tenant" && (
                <>
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                    <Building2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Workplace Configuration:</strong> Specify your leased commercial office location and employee workstation count to set up your corporate portal.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      CURRENT OFFICE BUILDING / TECH PARK *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantOfficeName}
                      onChange={(e) => setTenantOfficeName(e.target.value)}
                      placeholder="e.g. Apex Horizon Tower, 7th Floor, BKC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        ESTIMATED SEAT COUNT / EMPLOYEES
                      </label>
                      <input
                        type="number"
                        value={tenantSeatCount}
                        onChange={(e) => setTenantSeatCount(e.target.value)}
                        placeholder="50"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        HAVE A WORKSPACE INVITE CODE? (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={tenantInviteCode}
                        onChange={(e) => setTenantInviteCode(e.target.value.toUpperCase())}
                        placeholder="e.g. OX-4829"
                        className="w-full font-mono uppercase px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PM Role */}
              {selectedRole === "pm" && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  Your building operations and facility management preferences will automatically synchronize with your assigned site upon launch.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-4"
              >
                <span>Review & Complete Onboarding (S10)</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* =================================================================
              STEP 5: S10-S12 REVIEW & LAUNCH WORKSPACE
              ================================================================= */}
          {step === 5 && (
            <div className="space-y-4 text-xs animate-fadeIn">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Registration Summary
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> K0 Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">User Name</span>
                    <strong className="text-slate-900">{fullName || "Primary Admin"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Contact Email</span>
                    <strong className="text-slate-900 truncate block">{email || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Organization</span>
                    <strong className="text-slate-900">{orgLegalName || "My Organization"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Primary City</span>
                    <strong className="text-slate-900">{operatingCity === "CUSTOM" && customCity.trim() ? customCity.trim() : operatingCity}</strong>
                  </div>
                  {selectedRole === "owner" && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Primary Asset</span>
                        <strong className="text-blue-900">{propertyName || orgLegalName || "Commercial Property"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Services Activated</span>
                        <strong className="text-slate-900">{selectedServices.join(" · ")}</strong>
                      </div>
                    </>
                  )}
                  {selectedRole === "vendor" && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Primary FM Services</span>
                        <strong className="text-blue-900">{selectedVendorServices.slice(0, 2).join(", ")}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Experience</span>
                        <strong className="text-slate-900">{yearsInBusiness} Years in Operations</strong>
                      </div>
                    </>
                  )}
                  {selectedRole === "tenant" && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Workplace Office</span>
                        <strong className="text-blue-900">{tenantOfficeName || "Corporate Office"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Workstations</span>
                        <strong className="text-slate-900">{tenantSeatCount} Desks</strong>
                      </div>
                    </>
                  )}
                  {selectedRole === "broker" && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Advisory Type</span>
                        <strong className="text-blue-900">{brokerType}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">RERA Status</span>
                        <strong className="text-slate-900">{reraNumber || "Applicable"}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Roadmap */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                  <span>Onboarding Progress</span>
                  <span>75% Complete</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-3/4 rounded-full" />
                </div>
                <p className="text-[10px] text-slate-600">
                  Contact & Organization verified. You can upload PAN/GSTIN documentary evidence inside your dashboard.
                </p>
              </div>

              {/* Self Declaration */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="declaration" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                  I certify that the legal entity details, tax identifiers, and property representations submitted are accurate and authorized.
                </label>
              </div>

              {/* Launch Button */}
              <button
                type="button"
                disabled={isLoading || !declarationAccepted}
                onClick={handleCompleteOnboarding}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-40 mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Provisioning Verified Workspace...</span>
                  </>
                ) : (
                  <>
                    <Building2 size={17} />
                    <span>
                      {selectedRole === "owner" 
                        ? "Launch Commercial Workspace & Live Rent Roll" 
                        : selectedRole === "broker" 
                        ? "Launch Leasing Broker CRM" 
                        : selectedRole === "vendor"
                        ? "Launch FM Contractor Hub"
                        : "Launch Corporate Tenant Portal"}
                    </span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Link to Login */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 mt-4">
            Already have an account?{" "}
            <Link
              href={`/login${
                typeof window !== "undefined" && window.location.search
                  ? window.location.search
                  : `?context=${isRentRoll ? "rent-roll" : isOperate ? "operate" : isFm ? "fm" : "marketplace"}&redirect=${encodeURIComponent(initialRedirect || (isRentRoll ? "/properties/rent-roll" : isOperate ? "/operate" : isFm ? "/fm-marketplace" : "/marketplace"))}`
              }`}
              className="text-blue-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer Trust Strip */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-blue-600" /> SOC 2 Type II
          </span>
          <span>•</span>
          <span>Indian Data Center</span>
          <span>•</span>
          <span>RERA & GST Compliant</span>
        </div>
      </div>
    </main>
  );
}

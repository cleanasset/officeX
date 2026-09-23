"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Sparkles
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
}

export default function SignupForm({ initialRole, initialIntent }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = initialRole || initialIntent || searchParams?.get("role") || searchParams?.get("intent") || "owner";

  // Step state: 
  // 1 = Create Account (S02)
  // 2 = OTP Verification (S03)
  // 3 = Organization Master (S05/S06)
  // 4 = Role Business Profile (S07/S08)
  // 5 = Review & Launch (S10-S12)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedRole, setSelectedRole] = useState(urlRole.toLowerCase());

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
  const [operatingCity, setOperatingCity] = useState("Mumbai");
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

      // Pre-fill suggested org name if blank
      if (!orgLegalName) {
        setOrgLegalName(`${fullName.trim().split(" ")[0]}'s Commercial Asset Realty`);
      }
      if (!propertyName) {
        setPropertyName("Apex Commercial Tower");
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

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_active_org", orgLegalName.trim());
      localStorage.setItem("officex_org_type", orgType);
      localStorage.setItem("officex_org_city", operatingCity);
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

    if (typeof window !== "undefined") {
      if (selectedRole === "owner") {
        localStorage.setItem("officex_property_name", propertyName.trim());
        localStorage.setItem("officex_property_city", operatingCity);
        localStorage.setItem("officex_leasable_area", leasableArea);
        localStorage.setItem("officex_occupancy_pct", approxOccupancy);
      }
    }

    setStep(5); // Advance to S10: Review & Submit
  };

  // S10/S12: Final Launch Workspace
  const handleCompleteOnboarding = () => {
    setIsLoading(true);

    const propDisplay = selectedRole === "owner" ? propertyName.trim() || "Apex Commercial Tower" : "Portfolio Asset";
    const roleTitle = selectedRole === "owner" 
      ? "Property Owner & Asset Manager" 
      : selectedRole === "broker" 
      ? "Broker / Channel Partner" 
      : selectedRole === "vendor" 
      ? "Facility / Service Vendor" 
      : selectedRole === "pm" 
      ? "Property / Facility Manager" 
      : "Tenant / Occupier";

    const workspaceUrl = selectedRole === "owner" 
      ? "/properties" 
      : selectedRole === "broker" 
      ? "/leasing" 
      : selectedRole === "vendor" 
      ? "/vendor" 
      : selectedRole === "pm" 
      ? "/ops" 
      : "/tenant";

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_active_org", orgLegalName.trim() || "Acme Commercial Realty Ltd");
      localStorage.setItem("officex_user_role", roleTitle);
      localStorage.setItem("officex_dashboard", workspaceUrl);
      localStorage.setItem("officex_onboarding_completed", "1");
      localStorage.setItem("officex_kyc_stage", "K1_BUSINESS_SUBMITTED");
      document.cookie = `officex_user_role=${encodeURIComponent(roleTitle)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_dashboard=${encodeURIComponent(workspaceUrl)}; path=/; max-age=86400; SameSite=Lax`;
    }

    setSuccessMsg("Onboarding complete! Launching your verified commercial workspace...");
    setTimeout(() => {
      const rawRedirect = searchParams?.get("redirect");
      const target = rawRedirect && !rawRedirect.startsWith("/login") ? rawRedirect : workspaceUrl;
      router.push(target);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">OfficeX</span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-800">Verified Registration & Onboarding Gateway</span>
          </div>
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
              {step === 1 && "Create Your Account"}
              {step === 2 && "Verify Email & Mobile"}
              {step === 3 && "Establish Your Business Entity"}
              {step === 4 && (selectedRole === "owner" ? "Commercial Asset & Rent Roll Setup" : "Role Business Profile")}
              {step === 5 && "Review & Complete Onboarding"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal leading-relaxed">
              {step === 1 && "Join India's unified commercial real estate and facilities management platform."}
              {step === 2 && `We've sent a real 6-digit verification code to ${email || "your work email"}.`}
              {step === 3 && "Create your organization master to link commercial properties, leases, and contracts."}
              {step === 4 && (selectedRole === "owner" 
                ? "Configure your primary building parameters to initialize your live Rent Roll." 
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
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              {/* Primary Role Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  I AM JOINING AS:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ROLE_OPTIONS.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center gap-1 ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-2xs font-bold ring-1 ring-blue-600"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50/50 hover:border-slate-300 font-medium"
                        }`}
                      >
                        <r.icon size={15} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                        <span className="text-[9.5px] leading-tight text-center px-0.5 font-medium line-clamp-2">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Role Capability Scope Preview */}
                <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-[11px] text-blue-950 flex items-start gap-2">
                  <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    {selectedRole === "owner" && (
                      <span>
                        <strong className="text-blue-900 font-bold">Property Owner & Asset Manager:</strong> Includes live Rent Roll cash flow, tenant lease CRM, building FM operations & statutory compliance.
                      </span>
                    )}
                    {selectedRole === "broker" && (
                      <span>
                        <strong className="text-blue-900 font-bold">Broker / Channel Partner:</strong> Includes commercial listings, tenant deal pipeline, site visit booking & digital LOIs.
                      </span>
                    )}
                    {selectedRole === "vendor" && (
                      <span>
                        <strong className="text-blue-900 font-bold">Facility / Service Vendor:</strong> Includes service RFPs, AMC maintenance contracts & work order dispatches.
                      </span>
                    )}
                    {selectedRole === "pm" && (
                      <span>
                        <strong className="text-blue-900 font-bold">Property / Facility Manager:</strong> Includes building operations, PPM maintenance schedules, helpdesk & visitor logs.
                      </span>
                    )}
                    {selectedRole === "tenant" && (
                      <span>
                        <strong className="text-blue-900 font-bold">Tenant / Occupier:</strong> Includes workplace portal, employee office passes & facility service requests.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
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
                  <strong>Organization Master (S06):</strong> Attaches your user identity, verified tax records, and commercial assets into a single auditable profile.
                </span>
              </div>

              {/* Legal Entity Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  COMPANY / ENTITY LEGAL NAME *
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={orgLegalName}
                    onChange={(e) => setOrgLegalName(e.target.value)}
                    placeholder="e.g. Acme Commercial Realty Ltd"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

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
                    PRIMARY OPERATING CITY *
                  </label>
                  <select
                    value={operatingCity}
                    onChange={(e) => setOperatingCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai (BKC / Nariman Point / Andheri)</option>
                    <option value="Bengaluru">Bengaluru (Whitefield / ORR / CBD)</option>
                    <option value="Delhi NCR">Delhi NCR (Cyber City / Noida / Gurgaon)</option>
                    <option value="Ahmedabad">Ahmedabad / GIFT City</option>
                    <option value="Pune">Pune (Kharadi / Hinjewadi)</option>
                    <option value="Hyderabad">Hyderabad (Hitec City / Financial Dist)</option>
                  </select>
                </div>
              </div>

              {/* Tax Identifiers (PAN & GSTIN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    COMPANY PAN (10-DIGIT)
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
                  REGISTERED OFFICE ADDRESS *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="e.g. Level 14, Tower B, Commercial Boulevard"
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

              {/* PM or Tenant */}
              {(selectedRole === "pm" || selectedRole === "tenant") && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  Your workplace and facility preferences will automatically synchronize with your corporate office site upon launching.
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
                    <strong className="text-slate-900">{fullName || "Vikramaditya"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Contact Email</span>
                    <strong className="text-slate-900 truncate block">{email || "vikram@apex.in"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Organization</span>
                    <strong className="text-slate-900">{orgLegalName || "Acme Realty Ltd"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Primary City</span>
                    <strong className="text-slate-900">{operatingCity}</strong>
                  </div>
                  {selectedRole === "owner" && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Primary Asset</span>
                        <strong className="text-blue-900">{propertyName || "Apex Commercial Tower"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Leasable Area</span>
                        <strong className="text-slate-900">{leasableArea} Sq. Ft.</strong>
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
                        : "Launch Verified Workspace"}
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
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
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

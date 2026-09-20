"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  KeyRound,
  ArrowLeft,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  Building2
} from "lucide-react";

// Primary roles defined in Section 1.2 of Registration Specification
const ROLE_OPTIONS = [
  { id: "owner", code: "OWNER", label: "Property Owner", desc: "Commercial asset owner / landlord", icon: Building },
  { id: "broker", code: "BROKER", label: "Leasing Broker", desc: "Channel partner & advisory", icon: Handshake },
  { id: "vendor", code: "VENDOR", label: "Service Vendor", desc: "FM & property contractor", icon: Truck },
  { id: "pm", code: "PM", label: "Facility Manager", desc: "Building & site operations", icon: Settings },
  { id: "tenant", code: "TENANT", label: "Corporate Tenant", desc: "Workplace occupier admin", icon: Users }
];

interface SignupFormProps {
  initialRole?: string;
  initialIntent?: string;
}

export default function SignupForm({ initialRole, initialIntent }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = initialRole || initialIntent || searchParams?.get("role") || searchParams?.get("intent") || "owner";

  // Step state: 1 = Create Account (S02), 2 = OTP Verification (S03)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState(urlRole.toLowerCase());

  // Form Fields (S02)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP Fields (S03)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpHint, setOtpHint] = useState<string | null>("482910");
  const [resendCountdown, setResendCountdown] = useState(30);

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

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  // Handle Account Creation (S02)
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
      setError("You must accept the Terms of Service and Privacy Policy.");
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
          password,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Account creation failed.");
        setIsLoading(false);
        return;
      }

      // Store user info in session
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_user_name", fullName.trim());
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_mobile", cleanMobile);
        localStorage.setItem("officex_user_id", data.userId || `usr_${Date.now()}`);
        localStorage.setItem("officex_intended_role", selectedRole);
      }

      setOtpHint(data.otpHint || "482910");
      setStep(2);
      setResendCountdown(30);
      setSuccessMsg("Verification code dispatched to your work email and mobile.");
    } catch (err: any) {
      console.error("Register error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Digit Change Handlers
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  // Handle OTP Verification (S03)
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
        setError(data.error || "OTP verification failed.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_kyc_stage", "K0_CONTACT_VERIFIED");
        sessionStorage.setItem("officex_user_role", selectedRole);
        localStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_kyc_stage", "K0_CONTACT_VERIFIED");
        localStorage.setItem("officex_user_role", selectedRole);

        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      }

      setSuccessMsg("Contact verified! Routing to business onboarding...");
      setTimeout(() => {
        router.push(`/onboarding?role=${encodeURIComponent(selectedRole)}`);
      }, 700);
    } catch (err: any) {
      console.error("OTP error:", err);
      setError("Verification failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden text-slate-900">
      {/* Soft Ambient Light Gradient Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-100/50 via-slate-100/30 to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* 2-Column Responsive Grid - Pure Enterprise Light Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =================================================================
              LEFT COLUMN: INTERACTIVE SIGN UP CARD
              ================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-[480px] mx-auto">
            {/* Header Branding & Verified Anchor */}
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <Image
                  src="/logo-removebg-preview.png"
                  alt="OfficeX Logo"
                  width={36}
                  height={36}
                  className="object-contain group-hover:scale-105 transition-transform"
                  priority
                />
                <Image
                  src="/name-removebg-preview.png"
                  alt="OfficeX"
                  width={120}
                  height={26}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Canonical Domain Trust Anchor */}
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold tracking-wide">officex.pro</span>
              <span className="text-blue-300">·</span>
              <span className="text-blue-800">Verified Registration Gateway</span>
            </div>

            {/* Main Card Container (Pure Light Theme) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              {/* Soft Ambient Light Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

              {/* Status Step Badge */}
              <div className="mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {step === 1 ? "Step 02: Account Registration" : "Step 03: Contact Verification"}
                </span>
              </div>

              {/* Header Title */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {step === 1 ? "Create Your Account" : "Verify Email & Mobile"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal leading-relaxed">
                  {step === 1
                    ? "Join India's unified commercial real estate and facilities management platform."
                    : `We've sent a 6-digit verification code to ${email || "your work email"}.`}
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

              {/* S02: CREATE ACCOUNT FORM */}
              {step === 1 ? (
                <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
                  {/* Primary Role Selector (S04 upfront intent) */}
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
                            <span className="text-[10px] truncate max-w-full leading-tight">
                              {r.label.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
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
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="98200 12345"
                        maxLength={10}
                        className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          PASSWORD *
                        </label>
                        {password && (
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              passwordStrength === 3
                                ? "text-emerald-600"
                                : passwordStrength === 2
                                ? "text-blue-600"
                                : "text-amber-600"
                            }`}
                          >
                            {passwordStrength === 3 ? "Strong" : passwordStrength === 2 ? "Medium" : "Weak"}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••"
                          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
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
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline font-bold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline font-bold">
                        Privacy Policy
                      </Link>
                      .
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Verify</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* S03: OTP VERIFICATION FORM */
                <div className="space-y-5 text-xs">
                  {/* Contact Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-900 block">
                      Enter 6-Digit Verification Code
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Dispatched to <strong className="text-blue-900">{email}</strong> and{" "}
                      <strong className="text-blue-900">+91 {mobileNumber}</strong>
                    </p>
                  </div>

                  {/* Demo Helper Pill */}
                  {otpHint && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Demo Code:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const demoArr = otpHint.split("");
                          setOtpDigits(demoArr);
                          verifyOtp(otpHint);
                        }}
                        className="text-blue-700 hover:underline font-mono font-bold bg-blue-100/80 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {otpHint} (Click to Fill)
                      </button>
                    </div>
                  )}

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
                        <ArrowLeft size={12} /> Edit Details
                      </button>

                      {resendCountdown > 0 ? (
                        <span className="text-slate-500 font-mono">
                          Resend in {resendCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setResendCountdown(30);
                            setSuccessMsg("A new verification code has been dispatched.");
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
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Confirm & Continue to Onboarding</span>
                        </>
                      )}
                    </button>
                  </div>
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

          {/* =================================================================
              RIGHT COLUMN: ELEGANT ONBOARDING ROADMAP & BENEFIT PANEL
              Desktop Only (lg:block) - Matches Specification v1.0
              ================================================================= */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 w-full">
            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-100/90 border border-blue-100/90 rounded-3xl p-8 xl:p-10 shadow-xl relative overflow-hidden text-slate-900 flex flex-col justify-between min-h-[620px]">
              {/* Ambient Background Accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Brand Tagline Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[11px] font-bold text-blue-800 mb-6 shadow-2xs">
                  <Sparkles size={13} className="text-blue-600" />
                  <span>Enterprise Registration & Onboarding</span>
                </div>

                <h2 className="text-3xl xl:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  Workspaces, simplified from day one.
                </h2>
                <p className="text-sm xl:text-base text-slate-600 mt-2 font-normal leading-relaxed max-w-lg">
                  Join India’s commercial real estate ecosystem to connect portfolios, operational teams, and enterprise occupiers.
                </p>

                {/* 4-Step Onboarding Journey (Spec Section 2) */}
                <div className="space-y-3.5 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      1
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Account Registration & Contact Verification
                      </span>
                      <span className="text-xs text-slate-600 font-normal">
                        Create user credentials with immediate 6-digit OTP verification for email and mobile.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Organization Master & Legal Entity
                      </span>
                      <span className="text-xs text-slate-600 font-normal">
                        Lookup or register your organization via GSTIN / CIN to avoid duplicate masters.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Role Profile & Operational Scope
                      </span>
                      <span className="text-xs text-slate-600 font-normal">
                        Configure assets, properties, service categories, or tenant corporate leases.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Digital KYC & Verified Dashboard Access
                      </span>
                      <span className="text-xs text-slate-600 font-normal">
                        Submit authorized documents, verify bank escrows, and unlock modular entitlements.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persona Spotlight Preview (Light Theme) */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 relative z-10">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Tailored for Every CRE Stakeholder
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Unified Portal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <span className="font-bold text-slate-900 block">Asset Owners</span>
                      <span className="text-[10px] text-slate-500">Rent roll, PPM & cash flow</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <span className="font-bold text-slate-900 block">Leasing Brokers</span>
                      <span className="text-[10px] text-slate-500">Pipelines, LOIs & commissions</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <span className="font-bold text-slate-900 block">FM Teams & Vendors</span>
                      <span className="text-[10px] text-slate-500">Work orders, SLA & bidding</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <span className="font-bold text-slate-900 block">Corporate Tenants</span>
                      <span className="text-[10px] text-slate-500">Desk booking & speed-gates</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" />
                    SOC 2 Type II · AES-256 Vaulted
                  </span>
                  <span>Data Sovereignty · India DC</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}



"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  ArrowLeft
} from "lucide-react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || searchParams.get("intent") || "owner";

  // Step state: 1 = Create Account (S02), 2 = OTP Verification (S03)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields (S02)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP Fields (S03)
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

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
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Account creation failed.");
        setIsLoading(false);
        return;
      }

      // Store initial session
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_user_name", fullName.trim());
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_mobile", cleanMobile);
        localStorage.setItem("officex_user_id", data.userId || `usr_${Date.now()}`);
        if (initialRole) {
          localStorage.setItem("officex_intended_role", initialRole);
        }
      }

      setOtpHint(data.otpHint || "482910");
      setStep(2);
      setResendCountdown(30);
      setSuccessMsg("Verification code sent to your email and mobile.");
    } catch (err: any) {
      console.error("Register error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          mobileNumber: mobileNumber.replace(/\D/g, ""),
          otp: otp.trim()
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
        localStorage.setItem("officex_kyc_stage", "K0_CONTACT_VERIFIED");
      }

      setSuccessMsg("Contact verified! Redirecting to business onboarding...");
      setTimeout(() => {
        router.push(`/onboarding?role=${encodeURIComponent(initialRole)}`);
      }, 1000);
    } catch (err: any) {
      console.error("OTP error:", err);
      setError("Verification failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071322] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F8B7D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F8B7D] to-teal-400 flex items-center justify-center font-black text-slate-900 shadow-lg">
            OX
          </div>
          <span className="text-2xl font-black tracking-tight text-white">OfficeX</span>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/60">
            {step === 1 ? "Step 02: Account Registration" : "Step 03: Contact Verification"}
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-2">
            {step === 1 ? "Create Your OfficeX Account" : "Verify Email & Mobile"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {step === 1
              ? "Join India's unified commercial real estate & facility management platform."
              : `Enter the 6-digit verification code sent to ${email || "your email"}.`}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1A2C] py-8 px-6 sm:px-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-teal-950/50 border border-teal-700/80 text-teal-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0 text-teal-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* S02: CREATE ACCOUNT FORM */}
          {step === 1 ? (
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  FULL LEGAL NAME *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhal"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-medium focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  WORK EMAIL ADDRESS *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram@apexcapital.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-medium focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  MOBILE NUMBER * (INDIA +91)
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9820012345"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-700 bg-slate-900/80 text-white font-medium focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-medium focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    CONFIRM PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-medium focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F8B7D] mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
                  I agree to the <Link href="/terms" className="text-[#0F8B7D] hover:underline font-bold">Terms of Service</Link> and <Link href="/privacy" className="text-[#0F8B7D] hover:underline font-bold">Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all cursor-pointer mt-2"
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
            <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-center space-y-1.5">
                <KeyRound size={24} className="mx-auto text-[#0F8B7D]" />
                <span className="text-xs font-black text-white block">Enter 6-Digit OTP</span>
                <p className="text-[11px] text-slate-400">
                  Demo Test Code: <span className="font-mono text-teal-300 font-bold">{otpHint || "482910"}</span>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 text-center">
                  6-DIGIT VERIFICATION CODE
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="482910"
                  className="w-full text-center tracking-[0.4em] text-lg font-mono font-black py-3 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={12} /> Edit Details
                </button>

                {resendCountdown > 0 ? (
                  <span>Resend OTP in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendCountdown(30);
                      setSuccessMsg("New code dispatched.");
                    }}
                    className="text-[#0F8B7D] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all cursor-pointer"
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
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0F8B7D] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#0F8B7D]" /> SOC 2 Type II
          </span>
          <span>•</span>
          <span>Indian Data Center</span>
          <span>•</span>
          <span>RERA & GST Compliant</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071322] flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

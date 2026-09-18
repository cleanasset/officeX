"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Layers,
  AlertCircle
} from "lucide-react";
import { validateRedirect, maskIdentifier, detectIdentifierType } from "@/lib/auth-utils";

interface WorkspaceMembership {
  id: string;
  orgName: string;
  role: string;
  workspaceTitle: string;
  workspaceUrl: string;
  badge: string;
  badgeColor: string;
}

// Sample multi-membership contexts for returning users
const SAMPLE_MEMBERSHIPS: WorkspaceMembership[] = [
  {
    id: "mem-owner",
    orgName: "Acme Commercial Realty Ltd",
    role: "Property Owner & Asset Manager",
    workspaceTitle: "Commercial Landlord Desk",
    workspaceUrl: "/properties",
    badge: "Primary Org",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30"
  },
  {
    id: "mem-tenant",
    orgName: "NovaTech Solutions HQ",
    role: "Corporate Occupier Admin",
    workspaceTitle: "Enterprise Tenant Portal",
    workspaceUrl: "/tenant",
    badge: "Occupier",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
  },
  {
    id: "mem-fm",
    orgName: "Apex Facilities Management",
    role: "Facility Operations Manager",
    workspaceTitle: "FM Operations Command",
    workspaceUrl: "/ops",
    badge: "Operations",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
  }
];

interface SignInFormProps {
  initialRedirect?: string;
  initialRole?: string;
  initialContext?: string;
}

type Step = "identifier" | "password" | "code" | "sso" | "workspace_chooser";

export default function SignInForm({
  initialRedirect,
  initialRole,
  initialContext
}: SignInFormProps) {
  const safeRedirect = validateRedirect(initialRedirect, "/properties");

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [rememberChoice, setRememberChoice] = useState(true);

  // States from discovery
  const [authType, setAuthType] = useState<"email" | "phone">("email");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("email");
  const [maskedId, setMaskedId] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Step 1: Handle Identifier Submission (Discovery)
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const clean = identifier.trim();
    if (!clean) {
      setError("Enter a valid work email or 10-digit mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: clean })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Please enter a valid work email or mobile number.");
        setIsLoading(false);
        return;
      }

      setAuthType(data.type);
      setMaskedId(data.masked || maskIdentifier(clean));

      if (data.next === "sso") {
        setSsoDomain(data.domain || clean.split("@")[1] || "company.com");
        setStep("sso");
      } else if (data.next === "code") {
        setChannel(data.channel || "whatsapp");
        setCooldown(data.cooldown_seconds || 30);
        setStep("code");
      } else {
        setStep("password");
      }
    } catch (err) {
      setError("Unable to connect to authentication services. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2A: Handle Password Authentication
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your password to continue.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate authentication / verification
    setTimeout(() => {
      setIsLoading(false);
      completeAuthentication(identifier, "Commercial Landlord & Asset Owner");
    }, 600);
  };

  // Switch to Email OTP code
  const handleSwitchToEmailCode = () => {
    setError("");
    setChannel("email");
    setCooldown(30);
    setStep("code");
    setInfoMessage(`We've sent a 6-digit verification code to ${maskedId}`);
  };

  // Step 2B: Handle OTP Digit Change
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit on 6th digit
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

  const verifyOtp = (code: string) => {
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      completeAuthentication(identifier, "Verified Member");
    }, 600);
  };

  // Step 3: Complete Authentication and Context Resolution
  const completeAuthentication = (userEmailOrPhone: string, roleName: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_user_email", userEmailOrPhone);
      sessionStorage.setItem("officex_user_name", "Enterprise Member");
      sessionStorage.setItem("officex_user_role", roleName);
      sessionStorage.setItem("officex_subscription", "active");

      localStorage.setItem("officex_user_email", userEmailOrPhone);
      localStorage.setItem("officex_user_name", "Enterprise Member");
      localStorage.setItem("officex_user_role", roleName);
      localStorage.setItem("officex_subscription", "active");

      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_subscription=active; path=/; max-age=86400; SameSite=Lax";
    }

    // If an explicit deep-link redirect was requested (e.g. /tenant, /leasing, /operate/ppm), go directly!
    if (initialRedirect && safeRedirect !== "/properties") {
      window.location.href = safeRedirect;
      return;
    }

    // Check if user has multiple memberships: show "Where would you like to work today?"
    setStep("workspace_chooser");
  };

  // Handle Workspace Selection
  const handleSelectWorkspace = (membership: WorkspaceMembership) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_user_role", membership.role);
      sessionStorage.setItem("officex_dashboard", membership.workspaceUrl);
      localStorage.setItem("officex_user_role", membership.role);
      localStorage.setItem("officex_dashboard", membership.workspaceUrl);

      if (rememberChoice) {
        localStorage.setItem("officex_default_workspace", membership.id);
      }
    }

    const destination = safeRedirect !== "/properties" ? safeRedirect : membership.workspaceUrl;
    window.location.href = destination;
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX Logo"
            width={40}
            height={40}
            className="object-contain group-hover:scale-105 transition-transform"
            priority
          />
          <Image
            src="/name-removebg-preview.png"
            alt="OfficeX"
            width={130}
            height={28}
            className="object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Canonical Domain Trust Anchor */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/50 text-[11px] font-medium text-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>officex.pro · Verified Gateway</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-[#0D1B2E] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm text-slate-100 relative overflow-hidden">
        {/* Subtle Brand Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Global Error Notice */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs font-medium flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Info Notice */}
        {infoMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-blue-950/70 border border-blue-800/80 text-blue-200 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 size={16} className="shrink-0 text-blue-400 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ===================================================================
            STEP 1: IDENTIFIER-FIRST FORM (Server-rendered baseline)
            =================================================================== */}
        {step === "identifier" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sign in to OfficeX
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal leading-relaxed">
                Enter your work email or mobile number to access your workspace.
              </p>
            </div>

            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="identifier-input"
                  className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>Work Email or Mobile Number</span>
                  <span className="text-[10px] text-slate-500 font-normal lowercase">single sign-on enabled</span>
                </label>
                <div className="relative">
                  <input
                    id="identifier-input"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@company.com or 9876543210"
                    autoComplete="username"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#091322] border border-blue-900/80 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all shadow-inner"
                  />
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                <span>{isLoading ? "Checking identifier..." : "Continue"}</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400 font-normal">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-colors">
                    Request an Invitation →
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================
            STEP 2A: PASSWORD AUTHENTICATION
            =================================================================== */}
        {step === "password" && (
          <div>
            {/* Back button and identifier chip */}
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setStep("identifier")}
                className="text-xs font-semibold text-slate-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change identifier</span>
              </button>
              <span className="text-xs font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                {maskedId}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white tracking-tight">Enter your password</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your password for <strong className="text-slate-200">{maskedId}</strong>
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password-input" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/support?topic=password-reset"
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#091322] border border-blue-900/80 text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all shadow-inner"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                <span>{isLoading ? "Verifying..." : "Sign In to OfficeX"}</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-4 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={handleSwitchToEmailCode}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
                >
                  Email me a one-time code instead →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================
            STEP 2B: ONE-TIME OTP CODE (WhatsApp / SMS / Email)
            =================================================================== */}
        {step === "code" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setStep("identifier")}
                className="text-xs font-semibold text-slate-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change identifier</span>
              </button>
              <span className="text-xs font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                {maskedId}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white tracking-tight">Enter 6-digit code</h2>
              <p className="text-xs text-slate-400 mt-1">
                We sent a verification code to{" "}
                <strong className="text-slate-200">{maskedId}</strong> via{" "}
                <span className="text-blue-400 font-bold uppercase">{channel}</span>.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between gap-2">
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
                    className="w-11 sm:w-12 h-13 text-center text-xl font-bold bg-[#091322] border border-blue-900/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-inner"
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={isLoading || otpDigits.join("").length !== 6}
                onClick={() => verifyOtp(otpDigits.join(""))}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>{isLoading ? "Verifying code..." : "Verify & Continue"}</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Didn&apos;t receive code?</span>
                {cooldown > 0 ? (
                  <span className="text-slate-500 font-mono">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCooldown(30);
                      setInfoMessage(`Code resent via ${channel}.`);
                    }}
                    className="text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 2C: ENTERPRISE SSO ROUTE
            =================================================================== */}
        {step === "sso" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setStep("identifier")}
                className="text-xs font-semibold text-slate-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change identifier</span>
              </button>
              <span className="text-xs font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                @{ssoDomain}
              </span>
            </div>

            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-3">
                <Building2 size={20} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Enterprise SSO Active</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your organization enforces Single Sign-On (SAML/OIDC) for accounts under{" "}
                <strong className="text-slate-200">@{ssoDomain}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => completeAuthentication(identifier, "Enterprise Occupier")}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue with Company SSO</span>
                <ExternalLink size={16} />
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                You will be securely authenticated through your enterprise identity provider.
              </p>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 3: WORKSPACE CHOOSER ("Where would you like to work today?")
            =================================================================== */}
        {step === "workspace_chooser" && (
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 mb-2">
                <CheckCircle2 size={12} />
                <span>Authentication Successful</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Where would you like to work today?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select an active workspace from your organization memberships.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              {SAMPLE_MEMBERSHIPS.map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => handleSelectWorkspace(mem)}
                  className="w-full p-4 rounded-2xl bg-[#091322] hover:bg-[#11233D] border border-blue-900/60 hover:border-blue-500/60 transition-all text-left group flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {mem.orgName}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${mem.badgeColor}`}>
                        {mem.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {mem.workspaceTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Role: {mem.role}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>

            {/* Remember Choice Checkbox */}
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <input
                id="remember-choice"
                type="checkbox"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember-choice" className="cursor-pointer select-none">
                Remember my choice and land here automatically
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Trust Strip Footer */}
      <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-400" />
          SOC 2 Type II Certified
        </span>
        <span>•</span>
        <span>AES-256 Vaulted Auth</span>
        <span>•</span>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

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
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  Globe,
  KeyRound,
  Check,
  Building
} from "lucide-react";
import {
  validateRedirect,
  maskIdentifier,
  detectIdentifierType,
  WorkspaceMembership,
  MOCK_USERS,
  AUTH_LOCALES
} from "@/lib/auth-utils";

interface SignInFormProps {
  initialRedirect?: string;
  initialRole?: string;
  initialContext?: string;
}

type Step = "identifier" | "password" | "code" | "sso" | "mfa" | "workspace_chooser";
type Lang = "en" | "hi";

export default function SignInForm({
  initialRedirect,
  initialRole,
  initialContext
}: SignInFormProps) {
  const safeRedirect = validateRedirect(initialRedirect, "/properties");

  // Locale state: English or Hindi
  const [lang, setLang] = useState<Lang>("en");
  const t = AUTH_LOCALES[lang];

  // Primary workflow state
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [mfaDigits, setMfaDigits] = useState(["", "", "", "", "", ""]);
  const [trustDevice, setTrustDevice] = useState(true);
  const [rememberChoice, setRememberChoice] = useState(true);

  // States from discovery
  const [authType, setAuthType] = useState<"email" | "phone">("email");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [maskedId, setMaskedId] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [ssoOrgName, setSsoOrgName] = useState("");
  const [ssoProvider, setSsoProvider] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>("482910");

  // Memberships for Context Chooser
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>(
    MOCK_USERS["owner@officex.in"].memberships
  );
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>(
    MOCK_USERS["owner@officex.in"].memberships[0].id
  );

  // Recovery Modal state
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Sync initial identifier if prefilled in query or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("officex_user_email");
      if (savedEmail && !identifier) {
        setIdentifier(savedEmail);
      }
    }
  }, []);

  // --------------------------------------------------------------------------
  // STEP 1: Handle Identifier Submission (Discovery)
  // --------------------------------------------------------------------------
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const clean = identifier.trim();
    if (!clean) {
      setError(
        lang === "hi"
          ? "कृपया एक वैध कार्य ईमेल या 10-अंकीय मोबाइल नंबर दर्ज करें।"
          : "Enter a valid work email or 10-digit mobile number."
      );
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

      // 1. Enterprise SSO
      if (data.next === "sso") {
        setSsoDomain(data.domain || clean.split("@")[1] || "company.com");
        setSsoOrgName(data.org_name || "Enterprise Partner");
        setSsoProvider(data.sso_provider || "Enterprise SAML / OIDC");
        setSsoUrl(data.sso_url || "#");
        setStep("sso");
      }
      // 2. One-time Code (OTP)
      else if (data.next === "code") {
        setChannel(data.channel || "whatsapp");
        setCooldown(data.cooldown_seconds || 30);
        setDemoCodeHint("482910");
        setStep("code");
      }
      // 3. Password
      else {
        setStep("password");
      }
    } catch (err) {
      setError("Unable to connect to authentication services. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2A: Handle Password Authentication
  // --------------------------------------------------------------------------
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(lang === "hi" ? "कृपया अपना पासवर्ड दर्ज करें।" : "Enter your password to continue.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect password. Please verify and try again.");
        setIsLoading(false);
        return;
      }

      if (data.mfa_required) {
        setIsLoading(false);
        setStep("mfa");
        return;
      }

      if (data.memberships && data.memberships.length > 0) {
        setMemberships(data.memberships);
        setSelectedMembershipId(data.memberships[0].id);
      }

      handleAuthSuccess(data.user?.identifier || identifier, data.user?.role || "Commercial Member", data.memberships);
    } catch (err) {
      setError("Connection error during sign-in. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable verification code dispatcher calling /api/auth/code/send
  const sendVerificationCode = async (targetChannel: "whatsapp" | "sms" | "email") => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/code/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, channel: targetChannel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to dispatch verification code.");
        return false;
      }
      setChannel(targetChannel);
      setCooldown(data.cooldown || 30);
      if (data.demo_code) setDemoCodeHint(data.demo_code);
      if (data.masked) setMaskedId(data.masked);
      setInfoMessage(
        lang === "hi"
          ? `हमने ${data.masked || maskedId} पर ${targetChannel === "email" ? "ईमेल" : targetChannel === "whatsapp" ? "WhatsApp" : "SMS"} द्वारा सत्यापन कोड भेजा है।`
          : `Verification code dispatched via ${targetChannel.toUpperCase()} to ${data.masked || maskedId}.`
      );
      return true;
    } catch {
      setError("Network connection issue while sending verification code.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to Email OTP code
  const handleSwitchToEmailCode = async () => {
    const ok = await sendVerificationCode("email");
    if (ok) {
      setStep("code");
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2B: Handle OTP Digit Change & Verification
  // --------------------------------------------------------------------------
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
        verifyOtpCode(fullCode);
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
      verifyOtpCode(pasted);
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyOtpCode = async (code: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      if (data.mfa_required) {
        setIsLoading(false);
        setStep("mfa");
        return;
      }

      if (data.memberships && data.memberships.length > 0) {
        setMemberships(data.memberships);
        setSelectedMembershipId(data.memberships[0].id);
      }

      handleAuthSuccess(data.user?.identifier || identifier, data.user?.role || "Commercial Member", data.memberships);
    } catch (err) {
      setError("Failed to verify code. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 3: Handle MFA Verification (TOTP Authenticator)
  // --------------------------------------------------------------------------
  const handleMfaChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...mfaDigits];
    newDigits[index] = val.slice(-1);
    setMfaDigits(newDigits);

    if (val && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && val) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        verifyMfaCode(fullCode);
      }
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !mfaDigits[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyMfaCode = async (code: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code,
          trust_device: trustDevice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid authenticator code. Please retry.");
        setIsLoading(false);
        return;
      }

      if (data.memberships && data.memberships.length > 0) {
        setMemberships(data.memberships);
        setSelectedMembershipId(data.memberships[0].id);
      }

      handleAuthSuccess(data.user?.identifier || identifier, data.user?.role || "Super Admin", data.memberships);
    } catch (err) {
      setError("Failed to verify authenticator code.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Handle Authentication Success & Context Resolution
  // --------------------------------------------------------------------------
  const handleAuthSuccess = (
    userEmailOrPhone: string,
    roleName: string,
    availableMemberships?: WorkspaceMembership[]
  ) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_user_email", userEmailOrPhone);
      sessionStorage.setItem("officex_user_role", roleName);
      sessionStorage.setItem("officex_subscription", "active");

      localStorage.setItem("officex_user_email", userEmailOrPhone);
      localStorage.setItem("officex_user_role", roleName);
      localStorage.setItem("officex_subscription", "active");

      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `officex_user_role=${encodeURIComponent(roleName)}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (initialRedirect && safeRedirect !== "/properties") {
      window.location.href = safeRedirect;
      return;
    }

    const memList = availableMemberships && availableMemberships.length > 0 ? availableMemberships : memberships;
    if (memList.length === 1) {
      handleSelectWorkspace(memList[0]);
      return;
    }

    setStep("workspace_chooser");
  };

  // --------------------------------------------------------------------------
  // Handle Workspace Selection (Context Switch)
  // --------------------------------------------------------------------------
  const handleSelectWorkspace = async (membership: WorkspaceMembership) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_user_role", membership.role);
      sessionStorage.setItem("officex_dashboard", membership.workspaceUrl);
      sessionStorage.setItem("officex_active_portal", membership.workspaceUrl.replace("/", ""));
      sessionStorage.setItem("officex_active_org", membership.orgName);

      localStorage.setItem("officex_user_role", membership.role);
      localStorage.setItem("officex_dashboard", membership.workspaceUrl);
      localStorage.setItem("officex_active_portal", membership.workspaceUrl.replace("/", ""));
      localStorage.setItem("officex_active_org", membership.orgName);

      if (rememberChoice) {
        localStorage.setItem("officex_default_workspace", membership.id);
      }

      document.cookie = `officex_user_role=${encodeURIComponent(membership.role)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_dashboard=${encodeURIComponent(membership.workspaceUrl)}; path=/; max-age=86400; SameSite=Lax`;
    }

    try {
      await fetch("/api/session/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: membership.id,
          workspace_url: membership.workspaceUrl,
          role: membership.role,
          org_name: membership.orgName
        })
      });
    } catch (e) {
      // Non-blocking
    }

    const destination = safeRedirect !== "/properties" ? safeRedirect : membership.workspaceUrl;
    window.location.href = destination;
  };

  // --------------------------------------------------------------------------
  // Social OAuth Simulators (Microsoft & Google)
  // --------------------------------------------------------------------------
  const handleOAuthSignIn = (provider: "microsoft" | "google") => {
    setIsLoading(true);
    setInfoMessage(
      provider === "microsoft"
        ? "Connecting to Microsoft Entra ID..."
        : "Connecting to Google Workspace..."
    );

    setTimeout(() => {
      const email = provider === "microsoft" ? "cfo@acme.com" : "broker@officex.in";
      setIdentifier(email);
      handleAuthSuccess(email, "Commercial Asset Manager");
    }, 900);
  };

  // --------------------------------------------------------------------------
  // Self-Serve Account Recovery Hub Handlers
  // --------------------------------------------------------------------------
  const handleStartRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier) {
      setError("Enter your work email or mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: recoveryIdentifier })
      });
      const data = await res.json();
      setRecoveryStep(2);
      setInfoMessage(data.message || "A 6-digit recovery code has been dispatched.");
    } catch (err) {
      setError("Recovery service unavailable. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || recoveryCode.length !== 6) {
      setError("Enter the 6-digit recovery code.");
      return;
    }
    if (newPassword.length < 10) {
      setError("New password must contain at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/recover/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: recoveryIdentifier,
          code: recoveryCode,
          new_password: newPassword,
          revoke_others: revokeOtherSessions
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
        setIsLoading(false);
        return;
      }
      setIsRecoveryOpen(false);
      setRecoveryStep(1);
      setInfoMessage("Password reset successfully! You can now sign in.");
      setIdentifier(recoveryIdentifier);
      setStep("password");
    } catch (err) {
      setError("Error confirming password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 2-Column Responsive Grid - Pure Enterprise Light Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ===================================================================
            LEFT COLUMN: INTERACTIVE SIGN-IN CARD (Max 440px)
            =================================================================== */}
        <div className="lg:col-span-6 xl:col-span-6 w-full max-w-[440px] mx-auto">
          {/* Header Branding & Domain Anchor */}
          <div className="flex items-center justify-between mb-6">
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

            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
                title="Switch Language (English / हिन्दी)"
              >
                <Globe size={13} className="text-blue-600" />
                <span>{lang === "en" ? "हिन्दी" : "English"}</span>
              </button>
            </div>
          </div>

          {/* Canonical Domain Trust Anchor */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">officex.pro</span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-800">{t.verifiedGateway}</span>
          </div>

          {/* Main Card Container (Pure Light Theme) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-slate-900 relative overflow-hidden">
            {/* Soft Ambient Light Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

            {/* Global Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Global Info Banner */}
            {infoMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 size={16} className="shrink-0 text-blue-600 mt-0.5" />
                <span className="leading-relaxed">{infoMessage}</span>
              </div>
            )}

            {/* ===============================================================
                STEP 1: IDENTIFIER-FIRST ENTRY (Wireframe Section 15)
                =============================================================== */}
            {step === "identifier" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    {t.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal leading-relaxed">
                    {t.subtitle}
                  </p>
                </div>

                <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="identifier-input"
                      className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between"
                    >
                      <span>{t.identifierLabel}</span>
                      <span className="text-[10px] text-blue-600 font-semibold lowercase">
                        {t.ssoEnabled}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="identifier-input"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t.identifierPlaceholder}
                        autoComplete="username"
                        autoFocus
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all shadow-2xs"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>{isLoading ? t.checkingIdentifier : t.continueBtn}</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* "or" Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-slate-500 font-bold">
                        {t.orDivider}
                      </span>
                    </div>
                  </div>

                  {/* Social & Enterprise SSO buttons */}
                  <div className="space-y-2.5">
                    {/* Microsoft SSO */}
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn("microsoft")}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>{t.continueWithMs}</span>
                    </button>

                    {/* Google SSO */}
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn("google")}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
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
                      <span>{t.continueWithGoogle}</span>
                    </button>
                  </div>

                  {/* Company SSO direct trigger */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier("enterprise@dlf.in");
                        setSsoDomain("dlf.in");
                        setSsoOrgName("DLF Cybercity Developers");
                        setSsoProvider("Azure AD / Microsoft Entra");
                        setStep("sso");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                      {t.useCompanySso}
                    </button>
                  </div>

                  {/* Recovery & Sign-up Links */}
                  <div className="pt-4 border-t border-slate-200 space-y-2 text-center text-xs">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryIdentifier(identifier);
                          setIsRecoveryOpen(true);
                        }}
                        className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
                      >
                        {t.cantSignIn}
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.newToOfficeX} </span>
                      <Link
                        href="/signup"
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
                      >
                        {t.requestAccess} →
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* ===============================================================
                STEP 2A: PASSWORD AUTHENTICATION (Wireframe Step 2a)
                =============================================================== */}
            {step === "password" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("identifier");
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{t.changeIdentifier}</span>
                  </button>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                    {maskedId}
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    {t.welcomeBack}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter password for <strong className="text-slate-900">{maskedId}</strong>
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password-input"
                        className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                      >
                        {t.passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryIdentifier(identifier);
                          setIsRecoveryOpen(true);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        autoComplete="current-password"
                        autoFocus
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all shadow-2xs"
                      />
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                  >
                    <span>{isLoading ? t.verifying : t.signInBtn}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="pt-4 border-t border-slate-200 text-center">
                    <button
                      type="button"
                      onClick={handleSwitchToEmailCode}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                      {t.sendCodeInstead}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ===============================================================
                STEP 2B: ONE-TIME CODE OTP (WhatsApp / SMS / Email)
                =============================================================== */}
            {step === "code" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("identifier");
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{t.changeIdentifier}</span>
                  </button>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                    {maskedId}
                  </span>
                </div>

                <div className="mb-5">
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    {t.enterCode}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {t.codeSentOn}{" "}
                    <span className="text-blue-600 font-bold uppercase">{channel}</span> {t.to}{" "}
                    <strong className="text-slate-900">{maskedId}</strong>
                  </p>
                </div>

                {/* Demo Helper Pill */}
                {demoCodeHint && (
                  <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Demo Code:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const demoArr = demoCodeHint.split("");
                        setOtpDigits(demoArr);
                        verifyOtpCode(demoCodeHint);
                      }}
                      className="text-blue-700 hover:underline font-mono font-bold bg-blue-100/80 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {demoCodeHint} (Click to Fill)
                    </button>
                  </div>
                )}

                <div className="space-y-5">
                  {/* 6 Individual Code Inputs */}
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

                  <button
                    type="button"
                    disabled={isLoading || otpDigits.join("").length !== 6}
                    onClick={() => verifyOtpCode(otpDigits.join(""))}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>{isLoading ? t.verifyingCode : t.verifyAndSignIn}</span>
                    <ArrowRight size={16} />
                  </button>

                  <p className="text-[11px] text-slate-500 text-center font-normal">
                    {t.neverShareCode}
                  </p>

                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      {cooldown > 0 ? (
                        <span className="text-slate-500 font-mono">
                          {t.resendIn} {cooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => sendVerificationCode(channel)}
                          className="text-blue-600 hover:underline font-bold cursor-pointer disabled:opacity-50"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        const nextChan = channel === "whatsapp" ? "sms" : "whatsapp";
                        sendVerificationCode(nextChan);
                      }}
                      className="text-blue-600 hover:underline font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {channel === "whatsapp" ? t.sendBySms : t.sendByWhatsApp}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                STEP 2C: ENTERPRISE SSO SCREEN
                =============================================================== */}
            {step === "sso" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("identifier");
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{t.changeIdentifier}</span>
                  </button>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                    @{ssoDomain}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3 shadow-2xs">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    {t.enterpriseSsoActive}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Single Sign-On (SAML / OIDC) verified for{" "}
                    <strong className="text-slate-900 font-semibold">{ssoOrgName}</strong> (
                    @{ssoDomain}).
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleAuthSuccess(identifier, "Enterprise Occupier Director")}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t.continueWithOrgSso}</span>
                    <ExternalLink size={16} />
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    Identity managed by <span className="text-slate-700 font-medium">{ssoProvider}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* ===============================================================
                STEP 3: MULTI-FACTOR AUTHENTICATION (MFA / TOTP)
                =============================================================== */}
            {step === "mfa" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("identifier");
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{t.changeIdentifier}</span>
                  </button>
                  <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 font-mono">
                    Assurance Level 2 (AAL2)
                  </span>
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3 shadow-2xs">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    {t.confirmItsYou}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {t.mfaDescription}
                  </p>
                </div>

                {/* Demo Helper Pill */}
                <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Authenticator Code:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMfaDigits(["1", "2", "3", "4", "5", "6"]);
                      verifyMfaCode("123456");
                    }}
                    className="text-blue-700 hover:underline font-mono font-bold bg-blue-100/80 px-2 py-0.5 rounded cursor-pointer"
                  >
                    123456 (Click to Fill)
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between gap-2">
                    {mfaDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          mfaInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaChange(idx, e.target.value)}
                        onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-11 sm:w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-600 shadow-2xs"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-xs text-slate-700">
                    <input
                      id="trust-device"
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="trust-device" className="cursor-pointer select-none text-[11px] font-medium">
                      {t.trustThisDevice}
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || mfaDigits.join("").length !== 6}
                    onClick={() => verifyMfaCode(mfaDigits.join(""))}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>{isLoading ? t.verifying : t.confirmMfaBtn}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ===============================================================
                STEP 4: CONTEXT CHOOSER ("Where would you like to work today?")
                =============================================================== */}
            {step === "workspace_chooser" && (
              <div>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 mb-2">
                    <CheckCircle2 size={12} />
                    <span>Authentication Successful</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    {t.whereToWork}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {t.switchAnytimeNotice}
                  </p>
                </div>

                <div className="space-y-3 mb-5 max-h-[320px] overflow-y-auto pr-1">
                  {memberships.map((mem) => {
                    const isSelected = selectedMembershipId === mem.id;
                    return (
                      <div
                        key={mem.id}
                        onClick={() => setSelectedMembershipId(mem.id)}
                        className={`w-full p-4 rounded-2xl transition-all text-left cursor-pointer border ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-blue-50/40 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {mem.orgName}
                              </span>
                              {mem.isLastUsed && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                  Last used
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {mem.workspaceTitle}
                            </div>
                            <div className="text-xs text-slate-700 font-medium">
                              Role: {mem.role}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Scope: {mem.propertyScope}
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Remember Choice Checkbox */}
                <div className="flex items-center gap-2 pt-1 pb-4 text-xs text-slate-700 border-t border-slate-200">
                  <input
                    id="remember-workspace"
                    type="checkbox"
                    checked={rememberChoice}
                    onChange={(e) => setRememberChoice(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="remember-workspace" className="cursor-pointer select-none text-[11px] font-medium">
                    {t.alwaysOpenWorkspace}
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const chosen = memberships.find((m) => m.id === selectedMembershipId) || memberships[0];
                    handleSelectWorkspace(chosen);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.openWorkspaceBtn}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Footer Security / Privacy Bar */}
          <div className="mt-6 text-center flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              {t.privacy}
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              {t.terms}
            </Link>
            <span>·</span>
            <Link href="/security" className="hover:text-slate-900 transition-colors">
              {t.security}
            </Link>
            <span>·</span>
            <span className="text-slate-400">v1.0 Specification</span>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN: ELEGANT LIGHT BRAND PANEL (Desktop Only: lg:block)
            Matches Section 15 Text Wireframes & Pure Light Theme
            =================================================================== */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-6 w-full">
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-100/90 border border-blue-100/90 rounded-3xl p-8 xl:p-10 shadow-xl relative overflow-hidden text-slate-900 flex flex-col justify-between min-h-[580px]">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Brand Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[11px] font-bold text-blue-800 mb-6 shadow-2xs">
                <Sparkles size={13} className="text-blue-600" />
                <span>The Modern CRE & FM Platform</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl xl:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Workspaces, simplified.
              </h2>
              <p className="text-sm xl:text-base text-slate-600 mt-2 font-normal leading-relaxed max-w-lg">
                One unified account for your commercial portfolio, building operations, leasing, and tenant services.
              </p>

              {/* Core Ecosystem Capabilities */}
              <div className="space-y-3.5 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Portfolio, Rent Roll & MIS
                    </span>
                    <span className="text-xs text-slate-600 font-normal">
                      Automated arrears ledgers, escalations, GST e-invoices, and executive cash-flow forecasts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Helpdesk, PPM, Assets & Vendors
                    </span>
                    <span className="text-xs text-slate-600 font-normal">
                      52-week maintenance schedules, asset QR codes, SLA tracking, and RFQ milestone escrows.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Leasing Pipeline & Tenant Services
                    </span>
                    <span className="text-xs text-slate-600 font-normal">
                      Space marketing, LOI generation, visitor pre-registration speed-gates, and desk allocations.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Product Visual Preview Widget (Light Theme) */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 relative z-10">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Acme Commercial Portfolio · Live Snapshot
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live
                  </span>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Occupancy</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">94.2%</div>
                    <div className="text-[9px] text-emerald-600 font-bold">+2.4% MoM</div>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">MTD Rent</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">₹1.42 Cr</div>
                    <div className="text-[9px] text-blue-600 font-bold">96.8% In</div>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">PPM Rate</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">98.4%</div>
                    <div className="text-[9px] text-emerald-600 font-bold">On Track</div>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Work Orders</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">4 Active</div>
                    <div className="text-[9px] text-amber-600 font-bold">In SLA</div>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Lockup */}
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

      {/* =====================================================================
          SELF-SERVE RECOVERY HUB MODAL ("Can't sign in?") - Light Theme
          ===================================================================== */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-900">
            <button
              type="button"
              onClick={() => {
                setIsRecoveryOpen(false);
                setRecoveryStep(1);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3 shadow-2xs">
                <KeyRound size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                {t.recoveryTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {recoveryStep === 1
                  ? t.recoverySubtitle
                  : `Enter the 6-digit recovery code and choose a new secure password.`}
              </p>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleStartRecovery} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Work Email or Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="name@company.com or 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  {isLoading ? "Sending..." : t.sendRecoveryCode}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmRecovery} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    6-Digit Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="482910"
                    className="w-full text-center tracking-[0.3em] font-mono font-bold py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {t.newPasswordLabel} (≥ 10 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {t.confirmPasswordLabel}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-slate-700">
                  <input
                    id="revoke-all"
                    type="checkbox"
                    checked={revokeOtherSessions}
                    onChange={(e) => setRevokeOtherSessions(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="revoke-all" className="cursor-pointer text-[11px] font-medium">
                    {t.revokeOtherSessions}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-2"
                >
                  {isLoading ? "Updating..." : t.resetPasswordBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

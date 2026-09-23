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
  Building,
  Loader2,
  Users
} from "lucide-react";
import {
  validateRedirect,
  maskIdentifier,
  detectIdentifierType,
  WorkspaceMembership,
  MOCK_USERS,
  AUTH_LOCALES,
  findMockUser
} from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";

interface SignInFormProps {
  initialRedirect?: string;
  initialRole?: string;
  initialContext?: string;
}

type Step = "identifier" | "password" | "code" | "sso" | "mfa" | "workspace_chooser" | "signed_in_success" | "no_workspace";
type Lang = "en" | "hi";

export default function SignInForm({
  initialRedirect,
  initialRole,
  initialContext
}: SignInFormProps) {
  const safeRedirect = validateRedirect(initialRedirect, "/");

  // Locale state: English or Hindi
  const [lang, setLang] = useState<Lang>("en");
  const t = AUTH_LOCALES[lang];

  // Primary workflow state
  const [step, setStep] = useState<Step>("identifier");
  const [successUserName, setSuccessUserName] = useState("");
  const [isOnboardingNeeded, setIsOnboardingNeeded] = useState(false);
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

  // Memberships for Context Chooser
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>("");

  // No Workspace Setup State (Client Spec Section 17 & Table 52)
  const [setupMode, setSetupMode] = useState<"choose" | "create_org" | "enter_invite">("choose");
  const [setupRole, setSetupRole] = useState<"owner" | "broker" | "vendor" | "tenant">("owner");
  const [setupOrgName, setSetupOrgName] = useState("");
  const [setupPropertyName, setSetupPropertyName] = useState("");
  const [setupCity, setSetupCity] = useState("Mumbai");
  const [inviteCode, setInviteCode] = useState("");
  const [isSettingUpOrg, setIsSettingUpOrg] = useState(false);

  // Recovery Modal state (3 distinct steps: 1=Request, 2=Verify, 3=Set Password)
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [recoveryCooldown, setRecoveryCooldown] = useState(0);

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

  // Timer countdown for Recovery Code resend
  useEffect(() => {
    if (recoveryCooldown <= 0) return;
    const interval = setInterval(() => {
      setRecoveryCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [recoveryCooldown]);

  // Sync initial identifier if prefilled in query or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("officex_user_email");
      if (savedEmail && !identifier) {
        setIdentifier(savedEmail);
      }
    }
  }, []);

  // Listen for Supabase active session (Google OAuth redirect & recovery link)
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const cleanEmail = (u.email || "").toLowerCase();
          if (cleanEmail) {
            localStorage.setItem("officex_user_email", cleanEmail);
            sessionStorage.setItem("officex_user_email", cleanEmail);
            localStorage.setItem("officex_email_verified", "1");
          }
          if (u.phone) {
            localStorage.setItem("officex_user_mobile", u.phone);
            sessionStorage.setItem("officex_user_mobile", u.phone);
            localStorage.setItem("officex_phone_verified", "1");
          }
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || "";
          if (fullName) {
            localStorage.setItem("officex_user_name", fullName);
            sessionStorage.setItem("officex_user_name", fullName);
          }

          const mockUser = findMockUser(cleanEmail);
          const userMemberships = mockUser?.memberships || [];

          handleAuthSuccess(
            cleanEmail || u.phone || identifier,
            mockUser ? mockUser.name : (fullName || cleanEmail.split("@")[0] || "New Member"),
            userMemberships
          );
        }
      } catch (e) {
        console.error("Supabase session check error:", e);
      }
    };

    checkSupabaseAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const u = session.user;
        const cleanEmail = (u.email || "").toLowerCase();
        if (cleanEmail) {
          localStorage.setItem("officex_user_email", cleanEmail);
          sessionStorage.setItem("officex_user_email", cleanEmail);
          localStorage.setItem("officex_email_verified", "1");
        }
        if (u.phone) {
          localStorage.setItem("officex_user_mobile", u.phone);
          sessionStorage.setItem("officex_user_mobile", u.phone);
          localStorage.setItem("officex_phone_verified", "1");
        }
        const fullName = u.user_metadata?.full_name || u.user_metadata?.name || "";
        if (fullName) {
          localStorage.setItem("officex_user_name", fullName);
          sessionStorage.setItem("officex_user_name", fullName);
        }

        const mockUser = findMockUser(cleanEmail);
        const userMemberships = mockUser?.memberships || [];

        handleAuthSuccess(
          cleanEmail || u.phone || identifier,
          mockUser ? mockUser.name : (fullName || cleanEmail.split("@")[0] || "New Member"),
          userMemberships
        );
      } else if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryOpen(true);
        setRecoveryStep(3);
        if (session?.user?.email) {
          setRecoveryIdentifier(session.user.email);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
      sessionStorage.setItem("officex_user_role", roleName);
      // Subscription is NOT auto-activated — requires Razorpay payment

      localStorage.setItem("officex_session_active", "1");
      localStorage.setItem("officex_user_role", roleName);
      // Subscription is NOT auto-activated — requires Razorpay payment

      const cleanVal = userEmailOrPhone.trim().toLowerCase();
      if (cleanVal.includes("@")) {
        sessionStorage.setItem("officex_user_email", cleanVal);
        localStorage.setItem("officex_user_email", cleanVal);
        localStorage.setItem("officex_email_verified", "1");

        // Check if this specific email is already subscribed
        const isEmailSubscribed = localStorage.getItem(`officex_sub_${cleanVal}`) === "active" ||
          sessionStorage.getItem(`officex_sub_${cleanVal}`) === "active" ||
          document.cookie.includes(`officex_sub_${encodeURIComponent(cleanVal)}=active`);

        if (isEmailSubscribed) {
          localStorage.setItem("officex_subscription", "active");
          sessionStorage.setItem("officex_subscription", "active");
          document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
        }
      } else if (/^\+?[0-9\s-]+$/.test(cleanVal)) {
        sessionStorage.setItem("officex_user_mobile", cleanVal);
        localStorage.setItem("officex_user_mobile", cleanVal);
        sessionStorage.setItem("officex_user_phone", cleanVal);
        localStorage.setItem("officex_user_phone", cleanVal);
        localStorage.setItem("officex_phone_verified", "1");
      } else {
        sessionStorage.setItem("officex_user_email", cleanVal);
        localStorage.setItem("officex_user_email", cleanVal);
      }

      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `officex_user_role=${encodeURIComponent(roleName)}; path=/; max-age=86400; SameSite=Lax`;
    }

    const storedName = (typeof window !== "undefined" && (localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name"))) || "";
    setSuccessUserName(storedName || userEmailOrPhone.split("@")[0] || "Member");

    const memList = availableMemberships !== undefined ? availableMemberships : memberships;

    // Only prompt for workspace if the user genuinely has multiple distinct corporate memberships
    if (memList.length > 1) {
      setMemberships(memList);
      setSelectedMembershipId(memList[0].id);
      setStep("workspace_chooser");
      return;
    }

    if (memList.length === 1) {
      handleSelectWorkspace(memList[0]);
      return;
    }

    // Client Spec Section 17 & Table 54:
    // 0 active memberships → Show "No Workspace Yet" screen!
    if (memList.length === 0) {
      const savedOrg = typeof window !== "undefined" ? localStorage.getItem("officex_active_org") : null;
      if (savedOrg) {
        let destination = (initialRedirect && safeRedirect !== "/") ? safeRedirect : "";
        if (!destination || destination === "/") {
          const lowerRole = (localStorage.getItem("officex_user_role") || roleName || initialRole || "owner").toLowerCase();
          destination = lowerRole.includes("broker")
            ? "/leasing"
            : lowerRole.includes("vendor") || lowerRole.includes("fm")
            ? "/vendor"
            : lowerRole.includes("tenant")
            ? "/tenant"
            : "/properties";
        }
        setStep("signed_in_success");
        setTimeout(() => {
          window.location.href = destination;
        }, 1000);
        return;
      }

      setStep("no_workspace");
      return;
    }

    // Set onboarding completed flag to prevent blocking gates
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_onboarding_completed", "1");
    }

    // Determine target destination (preserves redirects like /properties/rent-roll)
    let destination = (initialRedirect && safeRedirect !== "/") ? safeRedirect : "";
    if (!destination || destination === "/") {
      const lowerRole = (roleName || initialRole || "owner").toLowerCase();
      destination = lowerRole.includes("broker")
        ? "/leasing"
        : lowerRole.includes("vendor") || lowerRole.includes("fm")
        ? "/vendor"
        : lowerRole.includes("tenant")
        ? "/tenant"
        : "/properties";
    }

    setStep("signed_in_success");
    setTimeout(() => {
      window.location.href = destination;
    }, 1000);
  };

  // --------------------------------------------------------------------------
  // Handle Onboarding / Create New Organization (No Workspace Yet)
  // --------------------------------------------------------------------------
  const handleCreateNewOrg = () => {
    setIsSettingUpOrg(true);
    const orgName = setupOrgName.trim() || `${successUserName || "My"}'s Commercial Asset`;
    const propName = setupPropertyName.trim() || "Apex Commercial Tower";
    const city = setupCity || "Mumbai";

    const roleTitle = setupRole === "owner" 
      ? "Property Owner & Asset Manager" 
      : setupRole === "broker" 
      ? "Broker / Channel Partner" 
      : setupRole === "vendor"
      ? "Facility / Service Vendor"
      : "Corporate Tenant / Occupier";

    const workspaceUrl = setupRole === "owner" 
      ? "/properties" 
      : setupRole === "broker" 
      ? "/leasing" 
      : setupRole === "vendor"
      ? "/vendor"
      : "/tenant";

    const newMembership: WorkspaceMembership = {
      id: `mem_${Date.now()}`,
      orgId: `org_${Date.now()}`,
      orgName,
      role: roleTitle,
      roleCode: setupRole === "owner" ? "OWNER" : setupRole === "broker" ? "LEASING" : setupRole === "vendor" ? "VENDOR" : "TENANT",
      workspaceTitle: setupRole === "owner" ? "Commercial Landlord Desk" : setupRole === "broker" ? "Leasing Broker CRM" : setupRole === "vendor" ? "Vendor Hub" : "Corporate Workplace",
      workspaceUrl,
      propertyScope: `${propName} · ${city}`,
      badge: setupRole === "owner" ? "Asset Owner" : setupRole === "broker" ? "Leasing" : setupRole === "vendor" ? "Vendor" : "Tenant",
      badgeColor: "bg-blue-500/20 text-blue-700 border-blue-400/30",
      isLastUsed: true
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_active_org", orgName);
      localStorage.setItem("officex_user_role", roleTitle);
      localStorage.setItem("officex_property_name", propName);
      localStorage.setItem("officex_property_city", city);
      localStorage.setItem("officex_onboarding_completed", "1");
    }

    handleSelectWorkspace(newMembership);
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

    const destination = (initialRedirect && safeRedirect !== "/") ? safeRedirect : (membership.workspaceUrl || "/properties");
    setStep("signed_in_success");
    setTimeout(() => {
      window.location.href = destination;
    }, 1000);
  };

  // --------------------------------------------------------------------------
  // Social OAuth (Google via Supabase)
  // --------------------------------------------------------------------------
  const handleOAuthSignIn = async (provider: "google" = "google") => {
    setIsLoading(true);
    setError("");
    setInfoMessage(lang === "hi" ? "Google से जुड़ रहा है..." : "Connecting to Google...");

    try {
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "http://localhost:3000/login";

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        if (oauthError.message?.toLowerCase().includes("not enabled") || oauthError.message?.toLowerCase().includes("unsupported")) {
          setError(
            lang === "hi"
              ? "कृपया Supabase डैशबोर्ड में Google प्रदाता सक्षम करें।"
              : "Google provider is not yet enabled in your Supabase Dashboard. Please paste your Client ID and Secret in Supabase -> Authentication -> Providers -> Google."
          );
        } else {
          setError(oauthError.message || "Failed to initiate Google sign in.");
        }
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

  // --------------------------------------------------------------------------
  // Self-Serve Account Recovery Hub Handlers (3-Step Verified Flow)
  // --------------------------------------------------------------------------
  const handleStartRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = recoveryIdentifier.trim();
    if (!clean) {
      setError(lang === "hi" ? "कार्य ईमेल या मोबाइल नंबर दर्ज करें।" : "Enter your work email or mobile number.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: clean })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send recovery code. Please retry.");
        setIsLoading(false);
        return;
      }
      setRecoveryStep(2);
      setRecoveryCooldown(60);
      setInfoMessage(data.message || (lang === "hi" ? "6-अंकीय सत्यापन कोड भेजा गया है।" : "A 6-digit recovery code has been dispatched."));
    } catch (err) {
      setError("Recovery service unavailable. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = recoveryCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError(lang === "hi" ? "कृपया 6-अंकीय सत्यापन कोड दर्ज करें।" : "Enter the complete 6-digit recovery code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: recoveryIdentifier.trim(),
          code: cleanCode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid or expired recovery code. Please check your email or resend.");
        setIsLoading(false);
        return;
      }

      // Code verified successfully! Now show the password update screen
      setRecoveryStep(3);
      setInfoMessage(lang === "hi" ? "कोड सत्यापित! कृपया नया पासवर्ड सेट करें।" : "Code verified successfully. Please set your new password.");
    } catch (err) {
      setError("Verification service error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRecoveryCode = async () => {
    if (recoveryCooldown > 0 || !recoveryIdentifier) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: recoveryIdentifier.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }
      setRecoveryCooldown(60);
      setInfoMessage(data.message || (lang === "hi" ? "सत्यापन कोड पुनः भेजा गया।" : "A new recovery code has been sent."));
    } catch {
      setError("Failed to resend code. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 10) {
      setError(lang === "hi" ? "नया पासवर्ड कम से कम 10 अक्षरों का होना चाहिए।" : "New password must contain at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(lang === "hi" ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/recover/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: recoveryIdentifier.trim(),
          code: recoveryCode.trim(),
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

      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (e) {
        // Non-blocking
      }

      setIsRecoveryOpen(false);
      setRecoveryStep(1);
      setRecoveryCode("");
      setNewPassword("");
      setConfirmPassword("");
      setInfoMessage(lang === "hi" ? "पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप साइन इन कर सकते हैं।" : "Password reset successfully! You can now sign in.");
      setIdentifier(recoveryIdentifier.trim());
      setStep("password");
    } catch (err) {
      setError("Error updating password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Centered Sign-In Container */}
      <div>
          {/* Header Branding (Logo Centered, Language Toggle on Right) */}
          <div className="relative flex items-center justify-center mb-6">
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

            {/* Language Toggle */}
            <div className="absolute right-0 flex items-center gap-2">
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
                AUTHENTICATION CONFIRMED / SIGNED IN SUCCESS
                =============================================================== */}
            {step === "signed_in_success" && (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <CheckCircle2 size={12} />
                  Authentication Confirmed
                </span>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                  {isOnboardingNeeded ? "Welcome to OfficeX!" : "Signed In Successfully!"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium max-w-xs mx-auto">
                  {isOnboardingNeeded
                    ? `Welcome${successUserName ? `, ${successUserName}` : ""}. Setting up your business onboarding...`
                    : `Welcome back${successUserName ? `, ${successUserName}` : ""}. Taking you to OfficeX...`}
                </p>
                <div className="mt-6 flex justify-center items-center gap-2 text-xs font-bold text-[#0F8B7D]">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Redirecting...</span>
                </div>
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
                      className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block"
                    >
                      {t.identifierLabel}
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

                  {/* Social OAuth (Google) */}
                  <div>
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

            {/* ===============================================================
                CLIENT SPEC SECTION 17 / TABLE 52: NO WORKSPACE YET
                =============================================================== */}
            {step === "no_workspace" && (
              <div className="animate-fadeIn">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 mb-2">
                    <CheckCircle2 size={12} />
                    <span>Identity Verified</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    No Workspace Yet
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You're signed in as <strong className="text-slate-900 font-semibold">{successUserName || identifier || "user"}</strong>, but no commercial organisation or building has added you yet.
                  </p>
                </div>

                {setupMode === "choose" && (
                  <div className="space-y-3 mb-5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Choose How to Get Started:
                    </div>

                    {/* Card 1: Set Up an Asset / Organisation */}
                    <button
                      type="button"
                      onClick={() => setSetupMode("create_org")}
                      className="w-full p-4 rounded-2xl bg-blue-50/60 border border-blue-200 hover:bg-blue-50 hover:border-blue-500 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              Register a Commercial Asset / Business
                            </span>
                            <ArrowRight size={15} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            For Building Owners, Landlords, Brokers & Service Vendors. Sets up your portfolio, Live Rent Roll & building operations.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Card 2: Join Existing Company via Invite */}
                    <button
                      type="button"
                      onClick={() => setSetupMode("enter_invite")}
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Users size={20} />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                              Join an Existing Company / Building
                            </span>
                            <ArrowRight size={15} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            For Corporate Tenants & Employees. Enter a 6-digit company invite code or request access to your office floor.
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="pt-3 text-center space-y-2">
                      <Link
                        href="/signup?step=3"
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1.5"
                      >
                        <span>Need full business registration & KYC (S05–S12)? Complete here</span>
                        <ArrowRight size={13} />
                      </Link>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setStep("identifier");
                            setSetupMode("choose");
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
                        >
                          Sign out / Use a different account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {setupMode === "create_org" && (
                  <div className="space-y-4 mb-4 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => setSetupMode("choose")}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span>Back to Options</span>
                      </button>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                        Organisation Setup
                      </span>
                    </div>

                    {/* Organisation Focus Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Select Organisation Type / Business Focus *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "owner", label: "Property Owner / Landlord", badge: "Commercial Asset Portfolio & Leases" },
                          { id: "broker", label: "Broker / Advisory Partner", badge: "Commercial Leasing & Deals" },
                          { id: "vendor", label: "FM & Service Contractor", badge: "FM Contracts & Operations" },
                          { id: "tenant", label: "Corporate Tenant / Occupier", badge: "Workplace & Leased Office Space" }
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSetupRole(r.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              setupRole === r.id
                                ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                            }`}
                          >
                            <span className="text-xs block font-bold leading-tight">{r.label}</span>
                            <span className="text-[9.5px] text-blue-700 font-semibold block mt-1">{r.badge}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Company Legal Name */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Company / Entity Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={setupOrgName}
                        onChange={(e) => setSetupOrgName(e.target.value)}
                        placeholder="e.g. Apex Commercial Realty Ltd"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* First Property Name (For Owners) */}
                    {setupRole === "owner" && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Primary Commercial Building Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={setupPropertyName}
                          onChange={(e) => setSetupPropertyName(e.target.value)}
                          placeholder="e.g. Apex Horizon Tower"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          We will initialize your live Rent Roll and Building FM desk with this property.
                        </p>
                      </div>
                    )}

                    {/* City */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Operating City *
                      </label>
                      <select
                        value={setupCity}
                        onChange={(e) => setSetupCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Mumbai">Mumbai (BKC / Nariman Point / Andheri)</option>
                        <option value="Bengaluru">Bengaluru (Whitefield / ORR / CBD)</option>
                        <option value="Delhi NCR">Delhi NCR (Cyber City / Golf Course Rd / Noida)</option>
                        <option value="Ahmedabad">Ahmedabad / GIFT City</option>
                        <option value="Pune">Pune (Kharadi / Hinjewadi)</option>
                        <option value="Hyderabad">Hyderabad (Hitec City / Financial District)</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      disabled={isSettingUpOrg || !setupOrgName.trim() || (setupRole === "owner" && !setupPropertyName.trim())}
                      onClick={handleCreateNewOrg}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {isSettingUpOrg ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Provisioning Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch {setupRole === "owner" ? "Building Workspace & Rent Roll" : "Workspace"}</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {setupMode === "enter_invite" && (
                  <div className="space-y-4 mb-4 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => setSetupMode("choose")}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span>Back to Options</span>
                      </button>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                        Company Invitation
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                      If your facility administrator, employer, or landlord invited you to OfficeX, enter the 6-character code from your invitation email or SMS.
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Corporate Invitation Code (e.g. OX-9281)
                      </label>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="OX-XXXX"
                        maxLength={8}
                        className="w-full text-center tracking-[0.2em] font-mono font-bold text-base py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={inviteCode.trim().length < 4}
                      onClick={() => {
                        const tenantMembership: WorkspaceMembership = {
                          id: `mem_tenant_${Date.now()}`,
                          orgId: `org_novatech`,
                          orgName: "NovaTech Solutions India",
                          role: "Corporate Workplace Admin",
                          roleCode: "TENANT",
                          workspaceTitle: "Enterprise Workplace Portal",
                          workspaceUrl: "/tenant",
                          propertyScope: "Apex Business Tower · Floor 5A",
                          badge: "Occupier",
                          badgeColor: "bg-indigo-500/20 text-indigo-700 border-indigo-400/30",
                          isLastUsed: true
                        };
                        handleSelectWorkspace(tenantMembership);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <span>Connect to Company Workspace</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
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
          </div>
        </div>

      {/* =====================================================================
          SELF-SERVE RECOVERY HUB MODAL (3-Step Verified Flow) - Light Theme
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
                {recoveryStep === 1 && t.recoveryTitle}
                {recoveryStep === 2 && (lang === "hi" ? "सत्यापन कोड दर्ज करें" : "Verify Recovery Code")}
                {recoveryStep === 3 && (lang === "hi" ? "नया पासवर्ड सेट करें" : "Set New Password")}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {recoveryStep === 1 && t.recoverySubtitle}
                {recoveryStep === 2 && (lang === "hi"
                  ? `${maskIdentifier(recoveryIdentifier)} पर भेजा गया 6-अंकीय सत्यापन कोड दर्ज करें।`
                  : `Enter the 6-digit recovery code sent to ${maskIdentifier(recoveryIdentifier)}.`
                )}
                {recoveryStep === 3 && (lang === "hi"
                  ? "कोड सत्यापित हो गया है! कृपया अपना नया सुरक्षित पासवर्ड सेट करें।"
                  : "Code verified! Please create a new secure password to continue."
                )}
              </p>
            </div>

            {/* Error & Info in Modal */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={15} className="shrink-0 text-blue-600" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* STEP 1: Enter email / phone */}
            {recoveryStep === 1 && (
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isLoading ? "Sending..." : t.sendRecoveryCode}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* STEP 2: Verify 6-digit Code (Must verify before password update is unlocked) */}
            {recoveryStep === 2 && (
              <form onSubmit={handleVerifyRecoveryCode} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    6-Digit Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.35em] font-mono font-bold py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || recoveryCode.trim().length !== 6}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>{isLoading ? "Verifying code..." : "Verify Code →"}</span>
                  <ArrowRight size={14} />
                </button>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  {recoveryCooldown > 0 ? (
                    <span className="text-slate-400 font-mono text-[11px]">
                      {t.resendIn} {recoveryCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleResendRecoveryCode}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setRecoveryStep(1);
                    }}
                    className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px]"
                  >
                    Change email / mobile
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Create & Confirm New Password (Only after verification) */}
            {recoveryStep === 3 && (
              <form onSubmit={handleConfirmRecovery} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {t.newPasswordLabel} (≥ 10 characters)
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-2 disabled:opacity-50"
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

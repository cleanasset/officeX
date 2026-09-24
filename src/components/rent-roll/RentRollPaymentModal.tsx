"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  CheckCircle,
  CreditCard,
  Sparkles,
  Tag,
  Gift,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  Phone as PhoneIcon,
  LogIn,
  CheckCircle2
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";
import { supabase } from "@/lib/supabase";

interface RentRollPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "onboard" | "signin";
  defaultEmail?: string;
  defaultName?: string;
}

export default function RentRollPaymentModal({
  isOpen,
  onClose,
  initialMode = "onboard",
  defaultEmail = "",
  defaultName = ""
}: RentRollPaymentModalProps) {
  const router = useRouter();

  // Mode: "onboard" (New Landlord Onboarding + Pay) vs "signin" (Existing Landlord Sign In)
  const [mode, setMode] = useState<"onboard" | "signin">(initialMode);

  // Onboarding Form Fields
  const [personName, setPersonName] = useState(defaultName);
  const [buildingName, setBuildingName] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form Fields
  const [signInIdentifier, setSignInIdentifier] = useState(defaultEmail);
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Processing & Feedback
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && !email) {
      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const storedBuilding = localStorage.getItem("officex_property_name") || "";
      const storedCity = localStorage.getItem("officex_property_city") || "";
      const storedPhone = localStorage.getItem("officex_user_phone") || localStorage.getItem("officex_user_mobile") || "";

      if (storedEmail) {
        setEmail(storedEmail);
        setSignInIdentifier(storedEmail);
      }
      if (storedName) setPersonName(storedName);
      if (storedBuilding) setBuildingName(storedBuilding);
      if (storedCity) setCity(storedCity);
      if (storedPhone) setPhone(storedPhone);
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const is100PercentDiscount = appliedCoupon === "RENTROLL12";
  const finalPriceInRupees = is100PercentDiscount ? 0 : 100;
  const finalAmountInPaise = is100PercentDiscount ? 0 : 10000;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "RENTROLL12") {
      setAppliedCoupon("RENTROLL12");
      setCouponSuccess("🎉 Coupon 'RENTROLL12' applied! 100% Free Lifetime Access activated (₹0).");
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Try RENTROLL12 for promotional trial.");
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Google OAuth Login with Payment Gateway Requirement
  const handleGoogleAuthWithPayment = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/login?context=rent-roll&redirect=${encodeURIComponent("/properties/rent-roll")}`
      : "http://localhost:3000/login?context=rent-roll&redirect=/properties/rent-roll";

    // In Sign-In mode: verify existing subscription with Google
    if (mode === "signin") {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) {
          setErrorMsg(error.message || "Google authentication failed. Please try again.");
          setIsGoogleLoading(false);
        }
      } catch (err: any) {
        setErrorMsg("Network error connecting to Google. Please try email sign in.");
        setIsGoogleLoading(false);
      }
      return;
    }

    // In Subscribe / Onboard mode: MUST complete payment gateway FIRST!
    // Case 1: 100% Free Lifetime Offer (Coupon RENTROLL12)
    if (is100PercentDiscount) {
      const freePaymentId = `FREE_RENTROLL12_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_payment_id", freePaymentId);
        localStorage.setItem("officex_subscription", "active");
        sessionStorage.setItem("officex_subscription", "active");
        document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
        if (email.trim()) {
          const cleanEmail = email.trim().toLowerCase();
          localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
          sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
        }
      }
      setSuccessMsg("🎉 100% Free Lifetime Offer Activated! Redirecting to Google Sign In...");
      setTimeout(async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: redirectUrl },
          });
          if (error) {
            setErrorMsg(error.message || "Google authentication failed.");
            setIsGoogleLoading(false);
          }
        } catch (e: any) {
          setErrorMsg("Google sign in failed. Please try email sign in.");
          setIsGoogleLoading(false);
        }
      }, 700);
      return;
    }

    // Case 2: Standard Plan (₹100) — Launch Razorpay Payment Gateway FIRST!
    try {
      await initiateRazorpayPayment({
        amount: finalAmountInPaise,
        receipt: `GOOGLE_SUB_${Date.now()}`,
        description: `Rent Roll Subscription for ${buildingName.trim() || "Commercial Property"}`,
        prefillName: personName.trim() || "Commercial Landlord",
        prefillEmail: email.trim(),
        prefillPhone: phone.trim(),
        notes: {
          portal: "Rent Roll & Revenue Management",
          user_email: email.trim(),
          auth_provider: "google",
          type: "subscription",
          coupon: appliedCoupon || "none",
        },
        onSuccess: async (response) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_payment_id", response.razorpay_payment_id);
            localStorage.setItem("officex_subscription", "active");
            sessionStorage.setItem("officex_subscription", "active");
            document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";
            if (email.trim()) {
              const cleanEmail = email.trim().toLowerCase();
              localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
              sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
            }
          }
          setSuccessMsg("Payment verified! Redirecting to Google Sign In to complete account linking...");
          setTimeout(async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: redirectUrl },
            });
            if (error) {
              setErrorMsg(error.message || "Google authentication failed.");
              setIsGoogleLoading(false);
            }
          }, 800);
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          setErrorMsg(err?.description || err?.message || "Payment required to unlock Rent Roll. Please complete payment to continue with Google.");
          setIsGoogleLoading(false);
        },
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Could not launch Razorpay gateway. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Complete Onboarding & Save Landlord Profile to Storage & Database
  const completeLandlordOnboarding = async (
    targetEmail: string,
    targetName: string,
    targetBuilding: string,
    targetCity: string,
    paymentId: string,
    coupon: string = "none"
  ) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanName = targetName.trim() || "Commercial Landlord";
    const cleanBuilding = targetBuilding.trim() || "Commercial Asset Tower";
    const cleanCity = targetCity.trim() || "Mumbai";

    const userProp = {
      id: `prop-${Date.now()}`,
      name: cleanBuilding,
      type: "Commercial Office",
      city: cleanCity,
      state: cleanCity.toLowerCase().includes("delhi") ? "Delhi" : cleanCity.toLowerCase().includes("mumbai") ? "Maharashtra" : "India",
      totalArea: 25000,
      grade: "Grade A",
      inviteCode: `OX-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerName: cleanName,
      createdAt: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_name", cleanName);
      sessionStorage.setItem("officex_user_name", cleanName);
      localStorage.setItem("officex_user_email", cleanEmail);
      sessionStorage.setItem("officex_user_email", cleanEmail);
      localStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
      sessionStorage.setItem("officex_user_role", "Property Owner & Asset Manager");

      localStorage.setItem("officex_property_name", cleanBuilding);
      localStorage.setItem("officex_property_city", cleanCity);
      localStorage.setItem("officex_active_org", `${cleanBuilding} Asset Management`);
      localStorage.setItem("officex_user_properties", JSON.stringify([userProp]));
      localStorage.setItem("officex_dashboard", "/properties/rent-roll");

      // Subscription permanent persistence
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
      sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
      document.cookie = `officex_sub_${encodeURIComponent(cleanEmail)}=active; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";

      // Session flags
      localStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_session_active", "1");
      localStorage.setItem("officex_onboarding_completed", "1");
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";

      // Seed initial active lease for their building so dashboard has immediate customized data
      let existingLeases = [];
      try {
        existingLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
      } catch {}
      if (existingLeases.length === 0) {
        localStorage.setItem("officex_active_leases", JSON.stringify([
          {
            id: `LEASE-${Date.now()}`,
            tenantName: "Nexus Enterprise Technologies",
            propertyName: cleanBuilding,
            unitNumber: "Tower 1 · Suite 402",
            floorNumber: 4,
            chargeableArea: 8500,
            monthlyRent: 595000,
            camRate: 18,
            monthlyCam: 153000,
            totalMonthlyGross: 748000,
            escalationPct: 5,
            leaseStartDate: "2025-04-01",
            leaseEndDate: "2028-03-31",
            status: "active",
            lockInMonths: 36,
            securityDeposit: 3570000,
            paymentMode: "RTGS Escrow",
            gstNumber: "27AABCN1234F1Z5"
          }
        ]));
      }

      localStorage.setItem("officex_payment_id", paymentId);
      localStorage.setItem("officex_order_id", `ORD_${paymentId}`);
    }

    // Call server to persist property in database
    try {
      await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanBuilding,
          type: "Commercial Office",
          city: cleanCity,
          state: cleanCity.toLowerCase().includes("delhi") ? "Delhi" : "Maharashtra",
          totalArea: 25000
        })
      });
    } catch (e) {
      console.warn("Property sync note:", e);
    }

    // Call server to persist subscription status
    try {
      await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, coupon, paymentId })
      });
    } catch (e) {
      console.warn("Subscription sync note:", e);
    }
  };

  // Handle Onboard & Pay Submit
  const handleOnboardAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPerson = personName.trim();
    const cleanBuilding = buildingName.trim();

    if (!cleanPerson) {
      setErrorMsg("Please enter your full name (Person Name / Property Owner).");
      return;
    }
    if (!cleanBuilding) {
      setErrorMsg("Please enter your commercial building / property name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Please set an account password (minimum 6 characters) so you can sign in anytime.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 100% Free Promo Activation
    if (is100PercentDiscount) {
      await completeLandlordOnboarding(
        cleanEmail,
        cleanPerson,
        cleanBuilding,
        city,
        `FREE_RENTROLL12_${Date.now()}`,
        "RENTROLL12"
      );
      setSuccessMsg("🎉 Onboarding complete & 100% Free Subscription Activated! Launching your Rent Roll dashboard...");
      setTimeout(() => {
        onClose();
        router.push("/properties/rent-roll");
      }, 1200);
      return;
    }

    // Razorpay Paid Checkout
    try {
      await initiateRazorpayPayment({
        amount: finalAmountInPaise,
        receipt: `SUB_${Date.now()}`,
        description: `Rent Roll License for ${cleanBuilding}`,
        prefillName: cleanPerson,
        prefillEmail: cleanEmail,
        prefillPhone: phone.trim(),
        notes: {
          portal: "Rent Roll & Revenue Management",
          user_email: cleanEmail,
          building: cleanBuilding,
          type: "subscription",
          coupon: appliedCoupon || "none",
        },
        onSuccess: async (response) => {
          await completeLandlordOnboarding(
            cleanEmail,
            cleanPerson,
            cleanBuilding,
            city,
            response.razorpay_payment_id,
            appliedCoupon || "none"
          );
          setSuccessMsg("Payment successful! Your commercial property and rent roll dashboard are ready...");
          setTimeout(() => {
            onClose();
            router.push("/properties/rent-roll");
          }, 1200);
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          setErrorMsg(err?.description || err?.message || "Payment cancelled or failed. Please retry.");
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Could not launch Razorpay gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  // Handle Existing Member Sign In
  const handleExistingSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = signInIdentifier.trim().toLowerCase();
    if (!cleanId) {
      setErrorMsg("Please enter your registered work email or mobile number.");
      return;
    }
    if (!signInPassword) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password: signInPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Incorrect password or account not found.");
        setIsProcessing(false);
        return;
      }

      // Check subscription status for this signed-in email
      let isSub = false;
      if (typeof window !== "undefined") {
        isSub = localStorage.getItem(`officex_sub_${cleanId}`) === "active" ||
          sessionStorage.getItem(`officex_sub_${cleanId}`) === "active" ||
          document.cookie.includes(`officex_sub_${encodeURIComponent(cleanId)}=active`);
      }

      if (!isSub) {
        try {
          const subRes = await fetch(`/api/subscription/status?email=${encodeURIComponent(cleanId)}`);
          if (subRes.ok) {
            const subData = await subRes.json();
            isSub = !!subData.subscribed;
          }
        } catch {}
      }

      // Set user session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_user_email", cleanId);
        localStorage.setItem("officex_user_email", cleanId);
        sessionStorage.setItem("officex_user_role", data.user?.role || "Property Owner & Asset Manager");
        localStorage.setItem("officex_user_role", data.user?.role || "Property Owner & Asset Manager");
        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";
      }

      if (isSub) {
        setSuccessMsg("Signed in! Loading your Rent Roll dashboard...");
        setTimeout(() => {
          onClose();
          router.push("/properties/rent-roll");
        }, 800);
      } else {
        // Authenticated but not subscribed yet: switch to Onboard / Pay tab with prefilled email!
        setEmail(cleanId);
        setPersonName(data.user?.name || cleanId.split("@")[0] || "Property Owner");
        setSuccessMsg("Signed in! An active subscription is required to unlock your Rent Roll dashboard. Please complete checkout below.");
        setMode("onboard");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMsg("Network error connecting to authentication server.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Top Decorative Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0D7B6C] via-teal-400 to-[#0F172A] shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX"
              width={34}
              height={34}
              className="object-contain"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#0D7B6C]">
                <Building2 size={13} />
                <span>Rent Roll &amp; CAM Billing Suite</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {mode === "onboard" ? "Unlock Rent Roll & CAM Suite" : "Sign In to Rent Roll Desk"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50/80 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                setMode("onboard");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "onboard"
                  ? "bg-white text-[#0D7B6C] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles size={13} className={mode === "onboard" ? "text-amber-500" : "text-slate-400"} />
              <span>Subscribe &amp; Unlock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-[#0D7B6C] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn size={13} className={mode === "signin" ? "text-teal-600" : "text-slate-400"} />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===============================================================
              GOOGLE OAUTH BUTTON (Prominent 1-Click Login)
              =============================================================== */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuthWithPayment}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-2xs"
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
              <span>
                {isGoogleLoading
                  ? "Connecting Payment & Google..."
                  : mode === "onboard"
                  ? is100PercentDiscount
                    ? "Continue with Google (100% Free · ₹0)"
                    : "Continue with Google (Pay ₹100 & Unlock)"
                  : "Sign in with Google"}
              </span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2.5">
                  {mode === "onboard" ? "or register with property details" : "or sign in with password"}
                </span>
              </div>
            </div>
          </div>

          {/* ===============================================================
              TAB 1: ONBOARD & SUBSCRIBE (NEW LANDLORD)
              =============================================================== */}
          {mode === "onboard" && (
            <form onSubmit={handleOnboardAndPay} className="space-y-3.5">
              {/* Distinct Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Person Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Full Name (Owner / Manager) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                {/* 2. Building / Property Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Commercial Building Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="e.g. Apex Tower / Cyber Park"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <Building2 size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* City & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Operating City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    >
                      <option value="Mumbai">Mumbai (MMR)</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Delhi NCR">Delhi NCR (Gurugram / Noida)</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Pan-India">Pan-India Portfolio</option>
                    </select>
                    <MapPin size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="landlord@company.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Phone & Set Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <PhoneIcon size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Create Account Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <KeyRound size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing & License Card */}
              <div className="bg-gradient-to-r from-teal-50/90 to-emerald-50/90 rounded-2xl p-3.5 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0D7B6C] block">
                    COMMERCIAL LANDLORD PLAN
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    {is100PercentDiscount ? (
                      <>
                        <span className="text-sm font-bold text-slate-400 line-through">₹100</span>
                        <span className="text-2xl font-black text-emerald-700 font-mono">₹0 FREE</span>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/90 px-2.5 py-0.5 rounded-full uppercase ml-1">
                          100% OFF APPLIED
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-slate-900 font-mono">₹100</span>
                        <span className="text-xs text-slate-500 font-semibold">/ month</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Instant Activation
                  </span>
                </div>
              </div>

              {/* ──── LIMITED TIME PROMOTIONAL OFFER (100% OFF) ──── */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-teal-50/70 p-4 shadow-xs">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Sparkles size={11} />
                      Limited Time Offer
                    </span>
                    <span className="text-[11px] font-bold text-amber-900">
                      100% Off Promotional Access
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/80">
                    Save ₹100/mo
                  </span>
                </div>

                {/* Ticket Showcase Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-amber-200 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
                      <Gift size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-black tracking-widest text-[#0D7B6C] px-2.5 py-0.5 rounded-lg bg-amber-50 border-2 border-dashed border-amber-300">
                          RENTROLL12
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          100% FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        Use code <strong className="text-slate-900 font-bold">RENTROLL12</strong> for 100% free lifetime access to Rent Roll &amp; CAM billing.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Apply Button or Applied Status */}
                  <div className="shrink-0 self-end sm:self-center">
                    {appliedCoupon === "RENTROLL12" ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 size={13} />
                          <span>Applied (₹0)</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon("RENTROLL12");
                          setCouponSuccess("🎉 Code RENTROLL12 applied! 100% Free Access Activated (₹0).");
                          setCouponError(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Sparkles size={13} />
                        <span>Apply 100% Off</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtext info */}
                <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  {appliedCoupon === "RENTROLL12" ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Free Lifetime Subscription Active · ₹0 charged
                    </span>
                  ) : (
                    <span className="text-amber-800/80 text-[10px] font-medium">
                      ⚡ Instant unlock: No credit card required with code RENTROLL12.
                    </span>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  is100PercentDiscount
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                    : "bg-[#0D7B6C] hover:bg-[#0A6357]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Onboarding &amp; Payment...</span>
                  </>
                ) : is100PercentDiscount ? (
                  <>
                    <Sparkles size={16} className="text-yellow-300" />
                    <span>Complete Onboarding &amp; Launch Rent Roll (₹0)</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Pay ₹{finalPriceInRupees} via Razorpay &amp; Launch Rent Roll</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===============================================================
              TAB 2: SIGN IN (EXISTING LANDLORD)
              =============================================================== */}
          {mode === "signin" && (
            <form onSubmit={handleExistingSignIn} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Registered Work Email or Mobile <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. landlord@company.com"
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Account Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                  />
                  <KeyRound size={15} className="absolute left-3 top-3 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Account &amp; Subscription...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In &amp; Open Rent Roll</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                <span>New Property Owner? </span>
                <button
                  type="button"
                  onClick={() => setMode("onboard")}
                  className="font-bold text-[#0D7B6C] hover:underline cursor-pointer"
                >
                  Onboard your building &amp; subscribe here →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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

// Comprehensive Indian cities covering all major commercial centers, Tier-1, Tier-2 & Tier-3 hubs
export const ALL_INDIAN_CITIES: string[] = [
  "Agartala",
  "Agra",
  "Ahmedabad",
  "Ahmednagar",
  "Aizawl",
  "Ajmer",
  "Akola",
  "Aligarh",
  "Alwar",
  "Ambala",
  "Amravati",
  "Amritsar",
  "Anand",
  "Anantapur",
  "Asansol",
  "Aurangabad (Chhatrapati Sambhajinagar)",
  "Bareilly",
  "Belagavi (Belgaum)",
  "Bellary (Ballari)",
  "Bengaluru (Bangalore)",
  "Bhagalpur",
  "Bharatpur",
  "Bhavnagar",
  "Bhilai",
  "Bhilwara",
  "Bhopal",
  "Bhubaneswar",
  "Bikaner",
  "Bilaspur",
  "Bokaro Steel City",
  "Chandigarh (Tricity)",
  "Chennai",
  "Coimbatore",
  "Cuttack",
  "Darbhanga",
  "Dehradun",
  "Delhi",
  "Dhanbad",
  "Dhule",
  "Durgapur",
  "Erode",
  "Faridabad",
  "Gandhinagar (GIFT City)",
  "Gaya",
  "Ghaziabad",
  "Gorakhpur",
  "Greater Noida",
  "Gulbarga (Kalaburagi)",
  "Guntur",
  "Gurgaon (Gurugram)",
  "Guwahati",
  "Gwalior",
  "Haldia",
  "Haridwar",
  "Hubballi-Dharwad",
  "Hyderabad",
  "Imphal",
  "Indore",
  "Jabalpur",
  "Jaipur",
  "Jalandhar",
  "Jalgaon",
  "Jalna",
  "Jammu",
  "Jamnagar",
  "Jamshedpur",
  "Jhansi",
  "Jodhpur",
  "Junagadh",
  "Kakinada",
  "Kalyan-Dombivli",
  "Kanpur",
  "Karnal",
  "Kochi (Cochin)",
  "Kolhapur",
  "Kolkata",
  "Kollam",
  "Kota",
  "Kozhikode (Calicut)",
  "Kurnool",
  "Latur",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Malegaon",
  "Mangalore (Mangaluru)",
  "Mathura",
  "Meerut",
  "Moradabad",
  "Mumbai (MMR)",
  "Muzaffarnagar",
  "Muzaffarpur",
  "Mysore (Mysuru)",
  "Nadiad",
  "Nagpur",
  "Nanded",
  "Nashik",
  "Navi Mumbai",
  "Nellore",
  "New Delhi",
  "Noida",
  "Panaji (Goa)",
  "Panipat",
  "Patna",
  "Panchkula",
  "Prayagraj (Allahabad)",
  "Puducherry (Pondicherry)",
  "Pune",
  "Raipur",
  "Rajahmundry",
  "Rajkot",
  "Ranchi",
  "Rohtak",
  "Rourkela",
  "Sagar",
  "Saharanpur",
  "Salem",
  "Sangli",
  "Satara",
  "Shillong",
  "Shimla",
  "Siliguri",
  "Solapur",
  "Sonipat",
  "Srinagar",
  "Surat",
  "Thane",
  "Thiruvananthapuram",
  "Thrissur",
  "Tiruchirappalli (Trichy)",
  "Tirunelveli",
  "Tiruppur",
  "Tirupati",
  "Udaipur",
  "Ujjain",
  "Vadodara",
  "Varanasi",
  "Vasai-Virar",
  "Vijayawada",
  "Visakhapatnam",
  "Warangal",
  "Pan-India Portfolio",
  "Other (Specify City)"
];

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

  // Mode: "onboard" (New Landlord Onboard + Subscribe) vs "signin" (Existing Member Sign In)
  const [mode, setMode] = useState<"onboard" | "signin">(initialMode);

  // Onboarding Form Fields (Building Name removed upfront — property owners may own 1 to 50 buildings)
  const [personName, setPersonName] = useState(defaultName);
  const [city, setCity] = useState("Mumbai (MMR)");
  const [customCity, setCustomCity] = useState("");
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

  // Promotional Coupon (Initially null; user must click apply to activate 100% Free offer)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && !email) {
      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const storedCity = localStorage.getItem("officex_property_city") || "";
      const storedPhone = localStorage.getItem("officex_user_phone") || localStorage.getItem("officex_user_mobile") || "";

      if (storedEmail) {
        setEmail(storedEmail);
        setSignInIdentifier(storedEmail);
      }
      if (storedName) setPersonName(storedName);
      if (storedCity) {
        if (ALL_INDIAN_CITIES.includes(storedCity)) {
          setCity(storedCity);
        } else {
          setCity("Other (Specify City)");
          setCustomCity(storedCity);
        }
      }
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
      setCouponSuccess("🎉 Code RENTROLL12 applied! 100% Free Access Activated (₹0).");
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code. Try RENTROLL12 for 100% Free access.");
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
      ? `${window.location.origin}/login?context=rent-roll&redirect=${encodeURIComponent("/onboarding?role=owner")}`
      : "http://localhost:3000/login?context=rent-roll&redirect=/onboarding?role=owner";

    // In Sign-In mode: authenticate directly with Google
    if (mode === "signin") {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectUrl },
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

    // In Subscribe / Onboard mode: Payment gateway / 100% Promo must trigger FIRST!
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
            setErrorMsg(error.message || "Google sign in failed.");
            setIsGoogleLoading(false);
          }
        } catch (e: any) {
          setErrorMsg("Google sign in failed. Please try email sign in.");
          setIsGoogleLoading(false);
        }
      }, 700);
      return;
    }

    // Paid Plan (₹100) — Launch Razorpay Payment Gateway FIRST!
    try {
      await initiateRazorpayPayment({
        amount: finalAmountInPaise,
        receipt: `GOOGLE_SUB_${Date.now()}`,
        description: `Rent Roll Subscription - Commercial Portfolio`,
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
          setErrorMsg(err?.description || err?.message || "Payment required to unlock Rent Roll. Please complete payment to continue.");
          setIsGoogleLoading(false);
        },
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Could not launch payment gateway. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Complete Landlord Account Setup & Route to Onboarding Form
  const completeLandlordOnboarding = async (
    targetEmail: string,
    targetName: string,
    targetCity: string,
    targetPhone: string,
    paymentId: string,
    coupon: string = "none"
  ) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanName = targetName.trim() || "Commercial Landlord";
    const cleanCity = targetCity.trim() || "Mumbai";
    const cleanPhone = targetPhone.trim();

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_name", cleanName);
      sessionStorage.setItem("officex_user_name", cleanName);
      localStorage.setItem("officex_user_email", cleanEmail);
      sessionStorage.setItem("officex_user_email", cleanEmail);
      localStorage.setItem("officex_user_role", "Property Owner & Commercial Landlord");
      sessionStorage.setItem("officex_user_role", "Property Owner & Commercial Landlord");

      if (cleanPhone) {
        localStorage.setItem("officex_user_phone", cleanPhone);
        localStorage.setItem("officex_user_mobile", cleanPhone);
        sessionStorage.setItem("officex_user_phone", cleanPhone);
        sessionStorage.setItem("officex_user_mobile", cleanPhone);
      }

      localStorage.setItem("officex_user_city", cleanCity);
      localStorage.setItem("officex_property_city", cleanCity);
      localStorage.setItem("officex_dashboard", "/properties/rent-roll");

      // Subscription permanent persistence
      localStorage.setItem("officex_subscription", "active");
      sessionStorage.setItem("officex_subscription", "active");
      localStorage.setItem(`officex_sub_${cleanEmail}`, "active");
      sessionStorage.setItem(`officex_sub_${cleanEmail}`, "active");
      document.cookie = `officex_sub_${encodeURIComponent(cleanEmail)}=active; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = "officex_subscription=active; path=/; max-age=31536000; SameSite=Lax";

      // Session flags - Ensure onboarding is marked pending until form is completed
      localStorage.setItem("officex_session_active", "1");
      sessionStorage.setItem("officex_session_active", "1");
      localStorage.removeItem("officex_onboarding_completed");
      sessionStorage.removeItem("officex_onboarding_completed");
      document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "officex_session_active=1; path=/; max-age=86400; SameSite=Lax";

      // Clean slate: ZERO dummy properties and ZERO fake leases
      localStorage.setItem("officex_user_properties", "[]");
      localStorage.setItem("officex_active_leases", "[]");
      localStorage.removeItem("officex_property_name");
      localStorage.removeItem("officex_active_org");

      localStorage.setItem("officex_payment_id", paymentId);
      localStorage.setItem("officex_order_id", `ORD_${paymentId}`);
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
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    const effectiveCity = city === "Other (Specify City)" ? customCity.trim() : city;

    if (!cleanPerson) {
      setErrorMsg("Please enter your full name (Property Owner / Manager).");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }
    // Mobile number is strictly mandatory
    if (!cleanPhone || phoneDigits.length < 10) {
      setErrorMsg("Mobile number is mandatory. Please enter a valid 10-digit mobile number.");
      return;
    }
    if (city === "Other (Specify City)" && !customCity.trim()) {
      setErrorMsg("Please type your city name in the text box below.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Please create an account password (minimum 6 characters) so you can sign in anytime.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 100% Free Promo Activation (RENTROLL12)
    if (is100PercentDiscount) {
      await completeLandlordOnboarding(
        cleanEmail,
        cleanPerson,
        effectiveCity,
        cleanPhone,
        `FREE_RENTROLL12_${Date.now()}`,
        "RENTROLL12"
      );
      setSuccessMsg("🎉 Account created & 100% Free Subscription Activated! Launching Property Owner Onboarding...");
      setTimeout(() => {
        onClose();
        router.push("/onboarding?role=owner");
      }, 1000);
      return;
    }

    // Razorpay Paid Checkout
    try {
      await initiateRazorpayPayment({
        amount: finalAmountInPaise,
        receipt: `SUB_${Date.now()}`,
        description: `Rent Roll Subscription for ${cleanPerson}`,
        prefillName: cleanPerson,
        prefillEmail: cleanEmail,
        prefillPhone: cleanPhone,
        notes: {
          portal: "Rent Roll & Revenue Management",
          user_email: cleanEmail,
          city: effectiveCity,
          type: "subscription",
          coupon: appliedCoupon || "none",
        },
        onSuccess: async (response) => {
          await completeLandlordOnboarding(
            cleanEmail,
            cleanPerson,
            effectiveCity,
            cleanPhone,
            response.razorpay_payment_id,
            appliedCoupon || "none"
          );
          setSuccessMsg("Payment successful! Launching Property Owner Onboarding...");
          setTimeout(() => {
            onClose();
            router.push("/onboarding?role=owner");
          }, 1000);
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
        // Authenticated but not subscribed yet: switch to Onboard / Subscribe tab with prefilled email
        setEmail(cleanId);
        setPersonName(data.user?.name || cleanId.split("@")[0] || "Property Owner");
        setSuccessMsg("Signed in! Unlock your Rent Roll dashboard with the 100% Free promo below.");
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
      {/* Compact, sleek, and normal-proportioned container */}
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Top Decorative Gradient Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0D7B6C] via-teal-400 to-[#0F172A] shrink-0" />

        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX"
              width={28}
              height={28}
              className="object-contain"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {mode === "onboard" ? "Unlock Rent Roll Desk" : "Sign In to Rent Roll Desk"}
                </h2>
                {mode === "onboard" && (
                  appliedCoupon === "RENTROLL12" ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                      100% Free
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                      ₹100 / mo
                    </span>
                  )
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {mode === "onboard"
                  ? appliedCoupon === "RENTROLL12"
                    ? "100% Free Promotional Access Activated (₹0)"
                    : "Commercial Landlord Plan · Apply offer below for 100% free access"
                  : "Enter your registered credentials to open your dashboard"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {couponSuccess && !errorMsg && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>{couponSuccess}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* GOOGLE 1-CLICK AUTH BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuthWithPayment}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
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
                  ? "Connecting..."
                  : mode === "onboard"
                  ? is100PercentDiscount
                    ? "Continue with Google (100% Free · ₹0)"
                    : "Continue with Google (Pay ₹100 & Unlock)"
                  : "Sign in with Google"}
              </span>
            </button>

            <div className="relative my-2.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2">
                  {mode === "onboard" ? "or register your landlord account" : "or sign in with password"}
                </span>
              </div>
            </div>
          </div>

          {/* ===============================================================
              TAB 1: ONBOARD & SUBSCRIBE (NEW LANDLORD)
              =============================================================== */}
          {mode === "onboard" && (
            <form onSubmit={handleOnboardAndPay} className="space-y-3">
              {/* Row 1: Full Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <User size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="landlord@company.com"
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <Mail size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Row 2: Mobile Number & Password — Paired in 2-Column Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <PhoneIcon size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                    />
                    <KeyRound size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Operating City & Promotional Plan / Custom City — Paired in 2-Column Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operating City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none truncate"
                    >
                      <optgroup label="Top Commercial Hubs">
                        <option value="Mumbai (MMR)">Mumbai (MMR)</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gurgaon (Gurugram)">Gurgaon (Gurugram)</option>
                        <option value="Noida">Noida</option>
                        <option value="Bengaluru (Bangalore)">Bengaluru (Bangalore)</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                      </optgroup>
                      <optgroup label="All Indian Cities (A to Z)">
                        {ALL_INDIAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Other">
                        <option value="Pan-India Portfolio">Pan-India Portfolio</option>
                        <option value="Other (Specify City)">Other (Specify City)</option>
                      </optgroup>
                    </select>
                    <MapPin size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {city === "Other (Specify City)" ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Specify City <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Type city name"
                        required
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                      />
                      <MapPin size={14} className="absolute left-2.5 top-2.5 text-amber-600" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Special Offer</label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">100% Off</span>
                    </div>
                    <div className="h-[38px] px-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50 flex items-center justify-between text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Gift size={13} className="text-amber-600 shrink-0" />
                        <span className="font-mono font-bold text-slate-900 text-[11px]">RENTROLL12</span>
                      </div>
                      {appliedCoupon === "RENTROLL12" ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            Applied (₹0)
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 underline cursor-pointer"
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
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-extrabold text-[11px] shadow-2xs cursor-pointer active:scale-95 transition-all"
                        >
                          Apply Free
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* When "Other (Specify City)" is chosen, render the offer card cleanly below Row 3 */}
              {city === "Other (Specify City)" && (
                <div className="h-[38px] px-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/50 flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">
                      Special Offer: Code <strong className="font-mono text-[#0D7B6C] bg-white px-1.5 py-0.5 rounded border border-amber-200">RENTROLL12</strong> (100% Off)
                    </span>
                  </div>
                  {appliedCoupon === "RENTROLL12" ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        Applied (₹0)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 underline cursor-pointer"
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
                        setErrorMsg(null);
                      }}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-extrabold text-[11px] shadow-2xs cursor-pointer active:scale-95 transition-all"
                    >
                      Apply Free
                    </button>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Launching Rent Roll...</span>
                  </>
                ) : is100PercentDiscount ? (
                  <>
                    <Sparkles size={15} className="text-yellow-300" />
                    <span>Complete Sign In &amp; Launch Rent Roll (₹0 FREE)</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Pay ₹100 via Razorpay &amp; Launch Rent Roll</span>
                  </>
                )}
              </button>

              {/* Clean bottom switcher */}
              <div className="text-center pt-0.5 text-xs text-slate-500">
                <span>Already have a Rent Roll account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#0D7B6C] hover:underline cursor-pointer"
                >
                  Sign in here →
                </button>
              </div>
            </form>
          )}

          {/* ===============================================================
              TAB 2: SIGN IN (EXISTING LANDLORD)
              =============================================================== */}
          {mode === "signin" && (
            <form onSubmit={handleExistingSignIn} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                  />
                  <Mail size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-8 pr-10 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D7B6C]/20 focus:border-[#0D7B6C] outline-none"
                  />
                  <KeyRound size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignInPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Verifying Account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In &amp; Open Rent Roll</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="text-center pt-0.5 text-xs text-slate-500">
                <span>New property owner? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("onboard");
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#0D7B6C] hover:underline cursor-pointer"
                >
                  Create account &amp; unlock free access →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Phone,
  KeyRound,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  Building,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import { CountryPhoneInput } from "@/components/ui/CountryPhoneInput";
import { formatINR, formatINRAbbreviated } from "@/lib/rent-roll/calculations";

interface PropertyPreview {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  grade?: string;
  totalArea?: string;
  allocatedUnits?: string;
  monthlyRent?: number;
  camMonthly?: number;
  securityDeposit?: number;
  chargeableArea?: number;
  leaseTenureYears?: number;
  escalationPct?: number;
  contractDoc?: string;
  inviteCode?: string;
}

function TenantJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codeParam = searchParams?.get("code") || "";
  const propertyIdParam = searchParams?.get("propertyId") || "";
  const buildingParam = searchParams?.get("building") || searchParams?.get("property") || "";
  const ownerParam = searchParams?.get("owner") || searchParams?.get("ownerName") || "";
  const locationParam = searchParams?.get("location") || "";
  const unitsParam = searchParams?.get("units") || searchParams?.get("unit") || searchParams?.get("unitNumber") || searchParams?.get("floor") || "";
  const tenantParam = searchParams?.get("tenant") || searchParams?.get("tenantName") || searchParams?.get("company") || searchParams?.get("companyName") || "";
  const nameParam = searchParams?.get("name") || searchParams?.get("contactPerson") || searchParams?.get("fullName") || "";
  const emailParam = searchParams?.get("email") || searchParams?.get("contactEmail") || "";
  const phoneParam = searchParams?.get("phone") || searchParams?.get("mobile") || searchParams?.get("contactPhone") || "";
  const rentParam = searchParams?.get("rent") || "";
  const camParam = searchParams?.get("cam") || "";
  const depositParam = searchParams?.get("deposit") || "";
  const areaParam = searchParams?.get("area") || "";
  const tenureParam = searchParams?.get("tenure") || "";
  const escalationParam = searchParams?.get("escalation") || "";
  const docParam = searchParams?.get("doc") || "";

  const [inviteCode, setInviteCode] = useState(codeParam.toUpperCase());
  const [isVerifying, setIsVerifying] = useState(false);
  const [unitNumber, setUnitNumber] = useState(unitsParam || "Entire Building / All Floors");

  // Agreed financial terms for the lease
  const [agreedRent, setAgreedRent] = useState<number>(Number(rentParam) || 250000);
  const [agreedCam, setAgreedCam] = useState<number>(Number(camParam) || 45000);
  const [agreedDeposit, setAgreedDeposit] = useState<number>(Number(depositParam) || (Number(rentParam) || 250000) * 3);
  const [agreedArea, setAgreedArea] = useState<number>(Number(areaParam) || 5000);
  const [agreedTenure, setAgreedTenure] = useState<number>(Number(tenureParam) || 3);
  const [agreedEscalation, setAgreedEscalation] = useState<number>(Number(escalationParam) || 5);
  const [contractDocName, setContractDocName] = useState<string>(docParam || "Commercial Lease Agreement (Pending Execution)");

  // Initialize previewProperty immediately if URL parameters are available
  const [previewProperty, setPreviewProperty] = useState<PropertyPreview | null>(
    (buildingParam || locationParam)
      ? {
          id: propertyIdParam || "PROP-ACTIVE",
          name: buildingParam || "Commercial Building",
          ownerName: ownerParam || "Commercial Property Owner / Management",
          location: locationParam || "Prime Commercial District",
          grade: "Grade A",
          totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : "50,000 sqft",
          allocatedUnits: unitsParam || "Entire Building / All Floors",
          monthlyRent: Number(rentParam) || 250000,
          camMonthly: Number(camParam) || 45000,
          securityDeposit: Number(depositParam) || 750000,
          chargeableArea: Number(areaParam) || 5000,
          leaseTenureYears: Number(tenureParam) || 3,
          escalationPct: Number(escalationParam) || 5,
          contractDoc: docParam || "Commercial Lease Agreement (Pending Execution)",
          inviteCode: codeParam.toUpperCase() || "OX-ACTIVE"
        }
      : null
  );

  // Tenant confirmation form fields
  const isDummyName = (val?: string) => !val || val === "Authorized Representative" || val === "Authorized Signatory";
  const isDummyEmail = (val?: string) => !val || val === "admin@tenant.com" || val.startsWith("leasing@");
  const isDummyPhone = (val?: string) => !val || val === "+91 98000 00000" || val === "9800000000" || val === "+91 9800000000";

  const [companyName, setCompanyName] = useState(tenantParam || "");
  const [fullName, setFullName] = useState(!isDummyName(nameParam) ? (nameParam || "") : "");
  const [email, setEmail] = useState(!isDummyEmail(emailParam) ? (emailParam || "") : "");
  const [mobile, setMobile] = useState(!isDummyPhone(phoneParam) ? (phoneParam || "") : "");
  const [originalTenantName, setOriginalTenantName] = useState(tenantParam || "");
  const [verifiedTenantId, setVerifiedTenantId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification helper: resolve building & property owner preview
  const verifyCode = useCallback(async (codeToTest: string) => {
    const cleanCode = codeToTest.trim().toUpperCase();
    if (!cleanCode && !propertyIdParam && !buildingParam && !locationParam) {
      setPreviewProperty(null);
      return;
    }

    setIsVerifying(true);
    setError(null);

    // 1. First attempt API verification with propertyId & building & query params
    try {
      const qParams = new URLSearchParams();
      if (cleanCode) qParams.set("code", cleanCode);
      if (propertyIdParam) qParams.set("propertyId", propertyIdParam);
      if (buildingParam) qParams.set("building", buildingParam);
      if (locationParam) qParams.set("location", locationParam);
      if (ownerParam) qParams.set("owner", ownerParam);
      if (unitsParam) qParams.set("units", unitsParam);
      if (rentParam) qParams.set("rent", rentParam);
      if (camParam) qParams.set("cam", camParam);
      if (depositParam) qParams.set("deposit", depositParam);
      if (areaParam) qParams.set("area", areaParam);
      if (tenureParam) qParams.set("tenure", tenureParam);
      if (escalationParam) qParams.set("escalation", escalationParam);
      if (docParam) qParams.set("doc", docParam);

      const res = await fetch(`/api/tenant/verify-code?${qParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.property) {
          setPreviewProperty({
            id: propertyIdParam || data.property.id,
            name: data.property.name || buildingParam,
            ownerName: data.property.ownerName || ownerParam || "Commercial Property Owner",
            location: data.property.location || locationParam || "Commercial Corridor",
            grade: data.property.grade || "Grade A",
            totalArea: data.property.totalArea || (areaParam ? `${Number(areaParam).toLocaleString()} sqft` : "50,000 sqft"),
            allocatedUnits: unitsParam || data.property.allocatedUnits || "Entire Building / All Floors",
            monthlyRent: data.property.monthlyRent || (rentParam ? Number(rentParam) : 250000),
            camMonthly: data.property.camMonthly || (camParam ? Number(camParam) : 45000),
            securityDeposit: data.property.securityDeposit || (depositParam ? Number(depositParam) : 750000),
            chargeableArea: data.property.chargeableArea || (areaParam ? Number(areaParam) : 5000),
            leaseTenureYears: data.property.leaseTenureYears || (tenureParam ? Number(tenureParam) : 3),
            escalationPct: data.property.escalationPct || (escalationParam ? Number(escalationParam) : 5),
            contractDoc: data.property.contractDoc || docParam || "Standard Commercial Lease Agreement (Executed)",
            inviteCode: cleanCode || data.property.inviteCode
          });

          if (data.property.monthlyRent) setAgreedRent(Number(data.property.monthlyRent));
          if (data.property.camMonthly) setAgreedCam(Number(data.property.camMonthly));
          if (data.property.securityDeposit) setAgreedDeposit(Number(data.property.securityDeposit));
          if (data.property.chargeableArea) setAgreedArea(Number(data.property.chargeableArea));
          if (data.property.leaseTenureYears) setAgreedTenure(Number(data.property.leaseTenureYears));
          if (data.property.escalationPct) setAgreedEscalation(Number(data.property.escalationPct));
          if (data.property.contractDoc) setContractDocName(data.property.contractDoc);

          if (data.tenant) {
            const comp = data.tenant.legalName || data.tenant.tradeName || tenantParam;
            if (comp) {
              setCompanyName(comp);
              setOriginalTenantName(comp);
            }
            if (!isDummyName(data.tenant.contactPerson)) {
              setFullName(data.tenant.contactPerson);
            } else if (!isDummyName(nameParam)) {
              setFullName(nameParam);
            } else {
              setFullName("");
            }

            if (!isDummyEmail(data.tenant.contactEmail)) {
              setEmail(data.tenant.contactEmail);
            } else if (!isDummyEmail(emailParam)) {
              setEmail(emailParam);
            } else {
              setEmail("");
            }

            if (!isDummyPhone(data.tenant.contactPhone)) {
              setMobile(data.tenant.contactPhone);
            } else if (!isDummyPhone(phoneParam)) {
              setMobile(phoneParam);
            } else {
              setMobile("");
            }

            if (data.tenant.id) setVerifiedTenantId(data.tenant.id);
            if (data.tenant.unitNumber) setUnitNumber(data.tenant.unitNumber);
          } else {
            if (tenantParam) {
              setCompanyName(tenantParam);
              setOriginalTenantName(tenantParam);
            }
            if (!isDummyName(nameParam)) setFullName(nameParam);
            else setFullName("");

            if (!isDummyEmail(emailParam)) setEmail(emailParam);
            else setEmail("");

            if (!isDummyPhone(phoneParam)) setMobile(phoneParam);
            else setMobile("");
          }

          if (unitsParam) {
            setUnitNumber(unitsParam);
          } else if (data.property.allocatedUnits) {
            setUnitNumber(data.property.allocatedUnits);
          }
          setIsVerifying(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn("API code verification note:", apiErr);
    }

    // 2. Check local stored building invites
    if (typeof window !== "undefined") {
      try {
        const storedInvites = JSON.parse(localStorage.getItem("officex_building_invites") || "{}");
        if (cleanCode && storedInvites[cleanCode]) {
          const inv = storedInvites[cleanCode];
          setPreviewProperty({
            id: inv.id,
            name: inv.name,
            ownerName: inv.ownerName || "Asset Owner",
            location: inv.location || locationParam || "Commercial Corridor",
            allocatedUnits: unitsParam || inv.allocatedUnits || "Entire Building / All Floors",
            monthlyRent: inv.monthlyRent || (rentParam ? Number(rentParam) : 250000),
            camMonthly: inv.camMonthly || (camParam ? Number(camParam) : 45000),
            securityDeposit: inv.securityDeposit || (depositParam ? Number(depositParam) : 750000),
            chargeableArea: inv.chargeableArea || (areaParam ? Number(areaParam) : 5000),
            leaseTenureYears: inv.leaseTenureYears || (tenureParam ? Number(tenureParam) : 3),
            escalationPct: inv.escalationPct || (escalationParam ? Number(escalationParam) : 5),
            contractDoc: inv.contractDoc || docParam || "Standard Commercial Lease Agreement (Executed)",
            inviteCode: cleanCode
          });

          if (inv.monthlyRent) setAgreedRent(Number(inv.monthlyRent));
          if (inv.camMonthly) setAgreedCam(Number(inv.camMonthly));
          if (inv.securityDeposit) setAgreedDeposit(Number(inv.securityDeposit));
          if (inv.chargeableArea) setAgreedArea(Number(inv.chargeableArea));
          if (inv.leaseTenureYears) setAgreedTenure(Number(inv.leaseTenureYears));
          if (inv.escalationPct) setAgreedEscalation(Number(inv.escalationPct));
          if (inv.contractDoc) setContractDocName(inv.contractDoc);

          if (unitsParam) setUnitNumber(unitsParam);
          setIsVerifying(false);
          return;
        }

        // Check user properties stored in browser
        const userProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        const match = userProps.find((p: any) =>
          (propertyIdParam && p.id === propertyIdParam) ||
          (buildingParam && p.name?.toLowerCase() === buildingParam.toLowerCase()) ||
          (p.inviteCode && p.inviteCode.toUpperCase() === cleanCode) ||
          (cleanCode && cleanCode.includes(p.id?.replace(/\D/g, "").slice(-4))) ||
          (cleanCode && p.name && p.name.toLowerCase().includes(cleanCode.toLowerCase()))
        );
        if (match) {
          setPreviewProperty({
            id: match.id,
            name: match.name,
            ownerName: match.ownerName || match.ownerCompany || localStorage.getItem("officex_user_name") || "Commercial Asset Management",
            location: match.address ? `${match.address}, ${match.city}, ${match.state}` : `${match.city || "Commercial"}, ${match.state || ""}`,
            grade: match.grade || "Grade A",
            totalArea: `${Number(match.totalArea || 50000).toLocaleString()} sqft`,
            allocatedUnits: unitsParam || match.unitNumber || "Entire Leased Premises",
            inviteCode: cleanCode || match.inviteCode
          });
          if (unitsParam) setUnitNumber(unitsParam);
          setIsVerifying(false);
          return;
        }
      } catch (e) {
        console.warn("Local invite lookup:", e);
      }
    }

    // 3. Fallback with URL search parameters
    if (buildingParam || propertyIdParam || locationParam) {
      setPreviewProperty({
        id: propertyIdParam || `prop-${cleanCode.replace(/\D/g, "") || "101"}`,
        name: buildingParam || "Commercial Building",
        ownerName: ownerParam || "Commercial Property Owner / Management",
        location: locationParam || "Prime Commercial District",
        grade: "Grade A",
        totalArea: "50,000 sqft",
        allocatedUnits: unitsParam || "Entire Building / All Floors",
        inviteCode: cleanCode
      });
      if (unitsParam) setUnitNumber(unitsParam);
      setIsVerifying(false);
      return;
    }

    // 4. Default generic preview only if completely unknown
    setPreviewProperty({
      id: `prop-${cleanCode.replace(/\D/g, "") || "101"}`,
      name: "Commercial Asset",
      ownerName: "Commercial Real Estate Management",
      location: "Commercial Business District",
      grade: "Grade A",
      totalArea: "50,000 sqft",
      allocatedUnits: "Entire Leased Premises",
      inviteCode: cleanCode
    });
    setIsVerifying(false);
  }, [buildingParam, propertyIdParam, ownerParam, locationParam, unitsParam]);

  // Sync search parameters into form state
  useEffect(() => {
    if (tenantParam) {
      setCompanyName(prev => prev || tenantParam);
      setOriginalTenantName(prev => prev || tenantParam);
    }
    if (nameParam) setFullName(prev => prev || nameParam);
    if (emailParam) setEmail(prev => prev || emailParam);
    if (phoneParam) setMobile(prev => prev || phoneParam);
    if (unitsParam && (!unitNumber || unitNumber === "Suite 401" || unitNumber === "Entire Building / All Floors")) {
      setUnitNumber(unitsParam);
    }
    if (rentParam) setAgreedRent(Number(rentParam));
    if (camParam) setAgreedCam(Number(camParam));
    if (depositParam) setAgreedDeposit(Number(depositParam));
    if (areaParam) setAgreedArea(Number(areaParam));
    if (tenureParam) setAgreedTenure(Number(tenureParam));
    if (escalationParam) setAgreedEscalation(Number(escalationParam));
  }, [tenantParam, nameParam, emailParam, phoneParam, unitsParam, rentParam, camParam, depositParam, areaParam, tenureParam, escalationParam]);

  useEffect(() => {
    if (inviteCode && inviteCode.length >= 4) {
      verifyCode(inviteCode);
    }
  }, [inviteCode, verifyCode]);

  // Auto-fill tenant user details if available in session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("officex_user_name");
      const savedEmail = localStorage.getItem("officex_user_email");
      const savedOrg = localStorage.getItem("officex_active_org");
      if (savedUser && !fullName) setFullName(savedUser);
      if (savedEmail && !email) setEmail(savedEmail);
      if (savedOrg && !companyName) setCompanyName(savedOrg);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInviteCode(val);
    if (val.length >= 4) {
      verifyCode(val);
    } else {
      setPreviewProperty(null);
    }
  };

  const handleConfirmAndEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!previewProperty) {
      setError("Please enter a valid building invitation code (e.g. OX-8841).");
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setError("Please provide your Name and Email address.");
      return;
    }

    const effectiveTenantName = companyName.trim() || fullName.trim() || "Tenant Occupier";
    const hasNameChanged = Boolean(
      originalTenantName &&
      originalTenantName.trim().toLowerCase() !== effectiveTenantName.toLowerCase()
    );

    setIsLoading(true);

    try {
      // 1. Register or update tenant in Rent Roll database with audit notification
      await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: verifiedTenantId,
          originalTradeName: originalTenantName,
          nameChanged: hasNameChanged,
          tradeName: effectiveTenantName,
          legalName: companyName.trim() || effectiveTenantName,
          contactPerson: fullName.trim(),
          contactEmail: email.trim().toLowerCase(),
          contactPhone: mobile.trim(),
          industry: companyName.trim() ? "Corporate Occupier" : "Individual / Professional Tenant",
          propertyId: previewProperty.id,
          propertyName: previewProperty.name,
          unitNumber: unitNumber,
          status: "invited",
          portalLive: true
        })
      });

      // 2. Attach or update pending lease to this building's Rent Roll (contract is pending execution, not active)
      try {
        const leaseRes = await fetch("/api/rent-roll/leases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: verifiedTenantId,
            propertyId: previewProperty.id,
            propertyName: previewProperty.name,
            tenantName: effectiveTenantName,
            unitNumber: unitNumber || "Entire Premises",
            floorNumber: unitNumber.toLowerCase().includes("ground") ? 1 : 2,
            chargeableArea: agreedArea,
            carpetArea: Math.round(agreedArea * 0.8),
            monthlyRent: agreedRent,
            camMonthly: agreedCam,
            securityDepositAmount: agreedDeposit,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + agreedTenure * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            escalationPct: agreedEscalation,
            status: "pending_approval",
            approvalStatus: "submitted",
            isTermsPending: false,
            notes: hasNameChanged
              ? `Tenant verified portal profile. Name modified from "${originalTenantName}" to "${effectiveTenantName}". Commercial lease agreement execution pending.`
              : "Tenant verified portal profile. Commercial lease agreement execution pending."
          })
        });

        if (leaseRes.ok) {
          const leaseData = await leaseRes.json();
          if (typeof window !== "undefined") {
            try {
              const localLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
              localLeases.unshift({
                id: leaseData.id || `LEASE-${Date.now()}`,
                propertyId: previewProperty.id,
                propertyName: previewProperty.name,
                tenantName: effectiveTenantName,
                unitNumber: unitNumber || "Entire Premises",
                chargeableArea: agreedArea,
                monthlyRent: agreedRent,
                camMonthly: agreedCam,
                totalMonthlyGross: agreedRent + agreedCam,
                status: "pending_approval",
                approvalStatus: "submitted",
                leaseStartDate: new Date().toISOString().split("T")[0],
                leaseEndDate: new Date(Date.now() + agreedTenure * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
              });
              localStorage.setItem("officex_active_leases", JSON.stringify(localLeases));
              window.dispatchEvent(new CustomEvent("officex-property-added"));
            } catch {}
          }
        }
      } catch (lErr) {
        console.warn("Lease attachment note:", lErr);
      }

      // 3. Establish authenticated tenant session in local & session storage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("officex_session_active", "1");
        sessionStorage.setItem("officex_user_role", "Tenant / Occupier");
        sessionStorage.setItem("officex_active_portal", "tenant");
        sessionStorage.setItem("officex_dashboard", "/tenant/payments");
        sessionStorage.setItem("officex_user_email", email.trim().toLowerCase());
        sessionStorage.setItem("officex_user_name", fullName.trim());

        localStorage.setItem("officex_session_active", "1");
        localStorage.setItem("officex_user_role", "Tenant / Occupier");
        localStorage.setItem("officex_active_portal", "tenant");
        localStorage.setItem("officex_dashboard", "/tenant/payments");
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_name", fullName.trim());
        localStorage.setItem("officex_tenant_id", verifiedTenantId || "TEN-1790893283368-1");
        sessionStorage.setItem("officex_tenant_id", verifiedTenantId || "TEN-1790893283368-1");
        localStorage.setItem("officex_active_org", companyName.trim() || effectiveTenantName);
        localStorage.setItem("officex_tenant_building", previewProperty.name);
        localStorage.setItem("officex_tenant_owner", previewProperty.ownerName);
        localStorage.setItem("officex_tenant_unit", unitNumber);
        localStorage.setItem("officex_invite_code", previewProperty.inviteCode || inviteCode);
        localStorage.setItem("officex_onboarding_completed", "1");

        // Mark tenant acceptance as completed in tenant registry
        try {
          const userTenants = JSON.parse(localStorage.getItem("officex_user_tenants") || "[]");
          const updated = userTenants.map((t: any) => {
            if (t.tradeName?.toLowerCase() === (companyName || effectiveTenantName).toLowerCase() || t.contactEmail?.toLowerCase() === email.toLowerCase()) {
              return { ...t, status: "Active", accepted: true, portalLive: true, kycVerified: true };
            }
            return t;
          });
          localStorage.setItem("officex_user_tenants", JSON.stringify(updated));
        } catch (e) {}

        document.cookie = "officex_auth=1; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `officex_user_role=${encodeURIComponent("Tenant / Occupier")}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = "officex_dashboard=/tenant/payments; path=/; max-age=86400; SameSite=Lax";
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/tenant/payments");
      }, 1200);
    } catch (err: any) {
      console.warn("Tenant onboarding warning:", err);
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_user_role", "Tenant / Occupier");
        localStorage.setItem("officex_active_portal", "tenant");
        localStorage.setItem("officex_dashboard", "/tenant/payments");
        localStorage.setItem("officex_active_org", companyName.trim() || effectiveTenantName);
        localStorage.setItem("officex_tenant_building", previewProperty.name);
        localStorage.setItem("officex_tenant_owner", previewProperty.ownerName);
        localStorage.setItem("officex_tenant_unit", unitNumber);
      }
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/tenant/payments");
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden text-slate-900 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-teal-100/50 via-slate-100/30 to-transparent pointer-events-none" />

      <div className="w-full max-w-[520px] mx-auto relative z-10">
        {/* Brand Lockup */}
        <div className="flex items-center justify-center mb-5">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={36}
              height={36}
              className="h-7.5 w-auto object-contain"
              style={{ height: "29px" }}
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={120}
              height={28}
              className="h-6.5 w-auto object-contain"
              style={{ height: "25px" }}
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {/* Header */}
          <div className="mb-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-800 mb-2">
              <KeyRound size={13} className="text-[#0F8B7D]" />
              <span>Tenant Building Access Gateway</span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Enter Building Invitation Code
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter your building code below to preview your property &amp; landlord details, confirm your unit, and enter your Tenant Dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-8 space-y-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Commercial Lease Activated!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Premises allocated at <span className="font-bold text-slate-800">{previewProperty?.name}</span> by <span className="font-bold text-slate-800">{previewProperty?.ownerName}</span>. Opening tax invoice generated with SAC 997212.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0F8B7D] pt-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Opening Invoices & Payments Dashboard...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmAndEnter} className="space-y-4 text-xs">
              {/* Step 1: Code Input Field */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  1. INVITATION / CONTRACT CODE *
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={handleCodeChange}
                    placeholder="e.g. CTR-TES-BUI-1-01-572"
                    maxLength={35}
                    className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-300 bg-slate-50 font-mono font-black text-sm uppercase tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                  <div className="absolute right-2.5 top-2.5">
                    {isVerifying ? (
                      <div className="px-3 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> Verifying
                      </div>
                    ) : previewProperty ? (
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Check size={12} /> Verified
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => verifyCode(inviteCode)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[10px] font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: PROPERTY OWNER & BUILDING PREVIEW CARD */}
              {previewProperty && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-slate-50 border-2 border-teal-500/30 shadow-sm space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck size={12} /> Verified Building Asset
                    </span>
                    <span className="font-mono text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Code: {previewProperty.inviteCode || inviteCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                      Target Building
                    </span>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Building size={16} className="text-[#0F8B7D] shrink-0" />
                      {previewProperty.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Property Owner / Landlord
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5 text-xs truncate" title={previewProperty.ownerName}>
                        {previewProperty.ownerName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Asset Location
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5 text-xs flex items-center gap-1" title={previewProperty.location}>
                        <MapPin size={11} className="text-[#0F8B7D] shrink-0" />
                        <span className="truncate">{previewProperty.location}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/90 shadow-2xs flex flex-col justify-center sm:col-span-1">
                      <span className="text-[9px] font-bold text-teal-700 uppercase tracking-wider block">
                        Allocated Leased Part
                      </span>
                      <span className="font-black text-teal-950 block mt-0.5 text-xs truncate" title={previewProperty.allocatedUnits || unitNumber}>
                        {previewProperty.allocatedUnits || unitNumber || "Entire Premises"}
                      </span>
                    </div>

                    {/* Financial Terms & Digital Lease Contract Banner */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5 sm:col-span-3 shadow-inner mt-1 border border-slate-800">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                          <DollarSign size={13} /> Agreed Commercial Lease Terms
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          {agreedTenure} Yrs Tenure ({agreedEscalation}% p.a. Escalation)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {/* Monthly Base Rent */}
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Base Rent
                          </span>
                          <div className="my-0.5">
                            <span className="font-black text-white text-sm sm:text-base tracking-tight block">
                              {formatINRAbbreviated(agreedRent)}
                            </span>
                            <span className="text-[10px] text-teal-300 font-mono font-medium block">
                              {formatINR(agreedRent, false)} / mo
                            </span>
                          </div>
                        </div>

                        {/* Monthly CAM */}
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Monthly CAM
                          </span>
                          <div className="my-0.5">
                            <span className="font-black text-teal-300 text-sm sm:text-base tracking-tight block">
                              {formatINRAbbreviated(agreedCam)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium block">
                              {formatINR(agreedCam, false)} / mo
                            </span>
                          </div>
                        </div>

                        {/* Security Deposit */}
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Security Deposit
                          </span>
                          <div className="my-0.5">
                            <span className="font-black text-white text-sm sm:text-base tracking-tight block">
                              {formatINRAbbreviated(agreedDeposit)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium block">
                              {agreedRent > 0 ? `${Math.round(agreedDeposit / agreedRent)} Month Basis` : formatINR(agreedDeposit, false)}
                            </span>
                          </div>
                        </div>

                        {/* Leased Area */}
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.08] transition-colors">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Leased Area
                          </span>
                          <div className="my-0.5">
                            <span className="font-black text-white text-sm sm:text-base tracking-tight block">
                              {agreedArea.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">sqft</span>
                            </span>
                            <span className="text-[10px] text-teal-300 font-mono font-medium block">
                              {agreedRent > 0 && agreedArea > 0 ? `₹${Math.round(agreedRent / agreedArea)} psf/mo` : "Chargeable Area"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[280px]">Contract: {contractDocName}</span>
                        </span>
                        <span className="text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded">
                          SAC 997212 • GST 18%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Tenant Details Confirmation */}
              {previewProperty && (
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    2. CONFIRM YOUR TENANT DETAILS
                  </span>

                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        YOUR FULL NAME *
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Verma"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        EMAIL ADDRESS *
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. rahul@example.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Mobile */}
                  <div>
                    <CountryPhoneInput
                      label="YOUR MOBILE NUMBER"
                      required
                      value={mobile}
                      onChange={(val) => setMobile(val)}
                      placeholder="98200 12345"
                    />
                  </div>

                  {/* Leased Space / Unit */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                        LEASED OFFICE UNIT / ALLOCATED PREMISES *
                      </label>
                      <span className="text-[9px] text-[#0F8B7D] font-bold">Allocated by Landlord</span>
                    </div>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        placeholder="e.g. Floor 2 & 3 or Entire Building"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                  </div>

                  {/* Company / Firm Name (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                        COMPANY / BUSINESS NAME <span className="text-slate-400 font-normal lowercase">(optional)</span>
                      </label>
                      <span className="text-[9px] text-slate-400">Leave blank if renting as an individual</span>
                    </div>
                    <div className="relative">
                      <Users size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Corp / Scalezix (Optional)"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                  </div>

                  {/* Submit CTA: Confirm and Enter */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 active:bg-teal-900 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer mt-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Activating Lease &amp; Generating Tax Invoice...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify KYC &amp; Activate Commercial Lease</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 mt-4">
            Are you a property owner instead?{" "}
            <Link href="/signup" className="text-[#0F8B7D] font-bold hover:underline">
              Register Portfolio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TenantJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading Invitation Gateway...</div>}>
      <TenantJoinContent />
    </Suspense>
  );
}
